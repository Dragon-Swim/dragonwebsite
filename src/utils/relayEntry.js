/**
 * Relay line-ups — the data the site never had.
 *
 * Why a separate module
 * ---------------------
 * An individual entry belongs to a family ("my kid swims the 100 breast"). A
 * relay entry belongs to the **club**: up to `relayLimitPerClub` squads per relay
 * event (A / B / C), each with four swimmers in a specific order. That is a
 * different owner, a different key and a different validation, so it gets its own
 * document rather than being crammed into the family entry:
 *
 *   meets/{meetId}/relayEntries/{eventCode}__{letter}     e.g. "9A__B"
 *
 * The event code is the meet's own code (`9A`, `56`), not the bare number: one
 * number can cover several age groups (see the .ev3 importer), and a relay squad
 * belongs to exactly one of them.
 *
 * What validation has to catch
 * ----------------------------
 * A relay is rejected by the meet director far more expensively than an individual
 * entry: the whole squad is invalid if one leg is ineligible. So the checks here
 * are hard errors, not hints:
 *
 *   - exactly four legs, no swimmer twice
 *   - every leg has a USA Swimming ID (the entry file is keyed on it)
 *   - every leg's age fits the event's age range, taken on the meet's age date
 *   - sexes fit the event (a `Mixed` event takes any four)
 *   - the club does not enter more squads than the meet allows
 */

import { ageOnDate } from './meetEligibility.js';

/** Squads a club may enter per relay event, by letter. */
export const RELAY_LETTERS = ['A', 'B', 'C', 'D'];

/** A relay team is four swimmers. */
export const LEG_COUNT = 4;

/** Stable document id for one squad: `<eventCode>__<letter>`. */
export function relayDocId(eventCode, letter) {
  const code = String(eventCode || '').trim();
  const l = String(letter || '').trim().toUpperCase();
  if (!code || !l) return null;
  return `${code}__${l}`;
}

/** Relay events in a meet, one row per event code (flat `events[]` has one per age group). */
export function relayEventsOf(meet) {
  const seen = new Map();
  for (const event of meet?.events || []) {
    if (!event?.relay) continue;
    const code = event.eventCode || String(event.eventNo);
    if (!seen.has(code)) seen.set(code, { ...event, eventCode: code });
  }
  return [...seen.values()].sort((a, b) => Number(a.eventNo) - Number(b.eventNo));
}

/** `{ legs: [null x4] }` — a fresh squad for the editor. */
export function emptySquad() {
  return { legs: Array.from({ length: LEG_COUNT }, () => null) };
}

/**
 * Validate one squad.
 *
 * `legs` entries are whatever the editor holds: either a full swimmer record
 * (`dob`, `gender`, `usaSwimmingId`, names) or a minimal `{ usaSwimmingId, ageAtMeet }`.
 * Ages are taken on `meet.ageDeterminedOn` when a birth date is available.
 */
export function validateSquad({ meet, event, legs = [], squadsInEvent = 1 } = {}) {
  const errors = [];
  const warnings = [];
  const filled = legs.filter(Boolean);

  if (filled.length !== LEG_COUNT) {
    errors.push({ code: 'leg-count', count: filled.length, need: LEG_COUNT });
  }

  const ids = filled.map((leg) => String(leg?.usaSwimmingId || '').trim().toUpperCase());
  if (ids.some((id) => !id)) {
    errors.push({ code: 'leg-without-usa-id', legs: filled.filter((l) => !String(l?.usaSwimmingId || '').trim()).length });
  }
  const dupes = ids.filter((id, i) => id && ids.indexOf(id) !== i);
  if (dupes.length) errors.push({ code: 'duplicate-swimmer', ids: [...new Set(dupes)] });

  const limit = Number(meet?.relayLimitPerClub);
  if (Number.isFinite(limit) && limit > 0 && squadsInEvent > limit) {
    errors.push({ code: 'too-many-squads', count: squadsInEvent, max: limit });
  }

  const eventSex = event?.eventSex || event?.gender;
  const ageOn = meet?.ageDeterminedOn || meet?.startDate;
  for (const [i, leg] of filled.entries()) {
    const where = i + 1;
    if (eventSex && eventSex !== 'X' && leg.gender) {
      const legSex = String(leg.gender).trim().toUpperCase().startsWith('F') || String(leg.gender).trim().toUpperCase().startsWith('G')
        ? 'F'
        : (String(leg.gender).trim().toUpperCase().startsWith('M') || String(leg.gender).trim().toUpperCase().startsWith('B') ? 'M' : null);
      if (legSex && legSex !== eventSex) {
        errors.push({ code: 'leg-sex-mismatch', leg: where, eventSex, legSex });
      }
    }
    const age = leg.ageAtMeet != null ? Number(leg.ageAtMeet) : ageOnDate(leg.dob, ageOn);
    if (Number.isFinite(age)) {
      const min = Number.isFinite(event?.ageMin) ? event.ageMin : null;
      const max = Number.isFinite(event?.ageMax) ? event.ageMax : null;
      if (min != null && age < min) errors.push({ code: 'leg-too-young', leg: where, age, min });
      if (max != null && max < 100 && age > max) errors.push({ code: 'leg-too-old', leg: where, age, max });
    } else if (!leg.usaSwimmingId) {
      // no age and no id: nothing to identify them by
      errors.push({ code: 'leg-unidentified', leg: where });
    } else {
      warnings.push({ code: 'leg-age-unknown', leg: where, name: leg.swimmerName || leg.lastName || '' });
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}

/**
 * Shape one squad for the SDIF writer (`buildEntrySdif({ relays })`).
 *
 * `legs` must already be ordered 1..4 — the order is the coach's decision and the
 * whole point of the relay record, so nothing here re-sorts it.
 */
export function squadToSdifRelay({ meet, event, squad }) {
  const legs = (squad?.legs || []).filter(Boolean).map((leg, i) => ({
    usaSwimmingId: leg.usaSwimmingId,
    lastName: leg.lastName || '',
    firstName: leg.firstName || '',
    middleInitial: leg.middleInitial || '',
    dob: leg.dob || null,
    ageAtMeet: leg.ageAtMeet ?? (leg.dob ? ageOnDate(leg.dob, meet?.ageDeterminedOn || meet?.startDate) : null),
    gender: leg.gender || event?.eventSex || event?.gender || '',
    seconds: leg.seconds ?? null,
    courseLetter: leg.courseLetter || null,
    order: i + 1,
  }));

  return {
    letter: squad?.letter || 'A',
    eventCode: event?.eventCode || String(event?.eventNo || ''),
    eventSex: event?.gender || event?.eventSex || '',
    distance: event?.distance ?? null,
    stroke: event?.stroke || '',
    ageMin: event?.ageMin ?? null,
    ageMax: event?.ageMax ?? null,
    eventAge: null,
    swimDate: meet?.startDate || null,
    seconds: squad?.seedSeconds ?? null,
    courseLetter: squad?.courseLetter || null,
    legs,
  };
}

/** Summary line for the export log: "#9 M 200MED 13-14 A: Chen / Ye / Mourad / Pan". */
export function describeSquad({ event, squad }) {
  const names = (squad?.legs || []).filter(Boolean)
    .map((l) => String(l.swimmerName || l.lastName || l.usaSwimmingId || '?').trim());
  const label = `#${event?.eventCode || event?.eventNo} ${event?.gender || ''} ${event?.distance ?? ''}${event?.stroke || ''} ${event?.ageGroup || ''}`.trim();
  return `${label} ${squad?.letter || 'A'}: ${names.join(' / ') || '(empty)'}`;
}
