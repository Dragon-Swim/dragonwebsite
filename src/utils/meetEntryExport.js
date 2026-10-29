/**
 * Meet entry export — pure logic, no DOM / no Firestore.
 *
 * This is the layer between "entries are confirmed" and "a file leaves the
 * building". It answers three questions and nothing else:
 *
 *   1. Which entries actually go out?      (only `confirmed`; everything else
 *                                           is reported, never silently dropped)
 *   2. What seed time does each swim get?   (re-resolved **now**, not the value
 *                                           snapshotted when the family submitted)
 *   3. Is the result legal at the meet?     (no NT rows, limits, bonus usage)
 *
 * Why seed times must be re-resolved
 * ----------------------------------
 * `meets/{id}/entries/{doc}.events[].seedTime` is frozen at submission time.
 * Between submission and the entry deadline a swimmer almost always swims
 * again, so the snapshot goes stale — and a stale seed time is not cosmetic:
 * it decides heat/lane order, and it decides whether a row still clears the
 * published line or only counts as a bonus entry. 2026-11-13 PV November Open
 * and 2026-11-06 Loughmiller both land before the 27-41 (12-01) deadline, so
 * "export with fresh times" is the normal path, not an edge case.
 *
 * The stored value is still kept in the row (`storedSeedSeconds`) so the coach
 * can see "what the family was told" next to "what we are about to submit".
 *
 * The re-resolution deliberately reuses the same primitives the family UI uses
 * (`buildBestTimesIndex` + `evaluateEvent`, including the meet's
 * `qualifyingPeriodStart`), so the number on the confirmation sheet is the same
 * number the family saw, unless a newer swim exists.
 *
 * Absent data must never look like a failure:
 *   - meet without `events`        -> rows export with an empty standard, not an error
 *   - swimmer with no time on file -> `missing-seed-time`, listed separately
 *   - manual (typed) seed times    -> carried through, flagged `manual`
 */

import {
  buildBestTimesIndex, evaluateEvent, formatSwimSeconds, parseSwimTimeText,
  parseEventCode, STROKE_NAMES,
} from './meetEligibility.js';

/** Entry statuses that are allowed into an entry file. */
export const EXPORTED_STATUS = 'confirmed';

/** Every status an entry can carry, in the order a coach thinks about them. */
export const ENTRY_STATUSES = ['confirmed', 'submitted', 'draft', 'declined'];

/** Human labels for the sheet. A family must never see a bare 'submitted'. */
export const STATUS_LABELS = {
  confirmed: 'Confirmed',
  submitted: 'Waiting for coach',
  draft: 'Draft',
  declined: 'Not swimming',
};

/** Event sex labels, as the classic Hy-Tek report prints them. */
export const EVENT_SEX_LABELS = { F: 'Female', M: 'Male', X: 'Mixed' };

/** Course letters used by the printed report ('36.60Y', '1:11.03L'). */
export const COURSE_LETTERS = { SCY: 'Y', LCM: 'L', SCM: 'S' };

/** Statuses that are deliberately held back, with the reason shown to the coach. */
export const HELD_BACK = {
  draft: 'not submitted yet',
  submitted: 'waiting for the coach to confirm',
  declined: 'marked as not swimming',
};

/** CSV columns, in output order. `value(row)` keeps the mapping in one place. */
export const WORKSHEET_COLUMNS = [
  { label: 'Event #', key: 'eventNo' },
  { label: 'Age group', key: 'ageGroup' },
  { label: 'Event', key: 'eventLabel' },
  { label: 'Sex', key: 'genderLabel' },
  { label: 'Day', key: 'day' },
  { label: 'Session', key: 'sessionLabel' },
  { label: 'Swimmer', key: 'swimmerName' },
  { label: 'USA Swimming ID', key: 'usaSwimmingId' },
  { label: 'Age', key: 'ageAtMeet' },
  { label: 'Seed time', key: 'seedTimeText' },
  { label: 'Course', key: 'course' },
  { label: 'Time source', key: 'sourceLabel' },
  { label: 'Time date', key: 'proofDate' },
  { label: 'Cut-off', key: 'standardText' },
  { label: 'Qualifies', key: 'qualifiesText' },
  { label: 'Changed', key: 'changedText' },
];

/** Find the meet's event row for one entry line. Mixed (X) rows match too. */
export function findMeetEvent(meet, { eventNo, ageGroup, gender }) {
  const rows = (meet?.events || []).filter((e) => Number(e.eventNo) === Number(eventNo));
  if (!rows.length) return null;
  const sameGroup = ageGroup == null ? rows : rows.filter((e) => e.ageGroup === ageGroup);
  const pool = sameGroup.length ? sameGroup : rows;
  return pool.find((e) => e.gender === gender)
    || pool.find((e) => e.gender === 'X')
    || pool[0]
    || null;
}

/**
 * Resolve the seed time for one entry line, as of right now.
 *
 * Order of preference:
 *   1. the swimmer's best time inside the meet's qualifying window (`db`)
 *   2. the value stored on the entry, which is what the family typed (`manual`)
 *   3. nothing -> `missing`, and the row cannot go into an entry file
 *
 * `changed` is true when the resolved time differs from the stored snapshot by
 * more than 0.01s, which is the smallest gap the formats can express.
 */
export function resolveSeedTime({ entryEvent, entry, meet, bestTimes = [] }) {
  const meetEvent = findMeetEvent(meet, {
    eventNo: entryEvent?.eventNo,
    ageGroup: entryEvent?.ageGroup ?? entry?.ageGroup,
    gender: entry?.gender,
  });
  const distance = entryEvent?.distance ?? meetEvent?.distance ?? null;
  const stroke = entryEvent?.stroke ?? meetEvent?.stroke ?? null;
  const standards = meetEvent?.standards || {};

  const bestIndex = buildBestTimesIndex(bestTimes, {
    qualifyingPeriodStart: meet?.qualifyingPeriodStart,
  });
  const evaluated = evaluateEvent({ distance, stroke, standards }, bestIndex);

  const stored = toSeconds(entryEvent?.seedSeconds ?? entryEvent?.seedTime);
  const base = {
    eventNo: entryEvent?.eventNo ?? null,
    // The meet's own event code ('1A' / '2F'), which is what SDIF's "Event Number"
    // field wants: the bare number cannot distinguish two age groups of one event.
    eventCode: meetEvent?.eventCode || null,
    ageGroup: entryEvent?.ageGroup ?? entry?.ageGroup ?? null,
    // The event's own sex, which is not the swimmer's: 'X' events are open to
    // both and the printed report labels them "Mixed".
    eventSex: meetEvent?.gender || entry?.gender || null,
    eventSexLabel: EVENT_SEX_LABELS[meetEvent?.gender] || EVENT_SEX_LABELS[entry?.gender] || '',
    // Needed by the SDIF writer for the EVENT AGE code (`1314`, `15OV`, `0910`).
    ageMin: meetEvent?.ageMin ?? null,
    ageMax: meetEvent?.ageMax ?? null,
    distance,
    stroke,
    standards,
    standardSeconds: evaluated.standardSeconds,
    gapSeconds: evaluated.gapSeconds,
    storedSeedSeconds: stored,
    staleSeconds: evaluated.staleSeconds ?? null,
    hasTimeStandard: !evaluated.noStandard,
  };

  if (evaluated.state !== 'no-time') {
    const seconds = evaluated.bestSeconds;
    return {
      ...base,
      state: evaluated.state === 'qualified' ? 'qualified' : 'slower-than-line',
      seconds,
      course: evaluated.bestCourse,
      date: evaluated.bestDate || '',
      source: 'db',
      changed: differs(stored, seconds),
      deltaSeconds: differs(stored, seconds) ? round2(seconds - stored) : 0,
    };
  }

  // No usable time on file: fall back to whatever the entry carries.
  const manualText = String(entryEvent?.seedTime ?? '').trim();
  const manual = parseSwimTimeText(manualText);
  if (manual != null) {
    return {
      ...base,
      state: 'manual',
      seconds: manual,
      course: String(entryEvent?.course || '').toUpperCase() || null,
      date: String(entryEvent?.proofDate || '').slice(0, 10),
      source: 'manual',
      changed: differs(stored, manual),
      deltaSeconds: differs(stored, manual) ? round2(manual - stored) : 0,
    };
  }

  return {
    ...base,
    state: 'missing',
    seconds: null,
    course: null,
    date: '',
    source: null,
    changed: false,
    deltaSeconds: 0,
  };
}

/** '1:12.49' / 72.49 -> 72.49 ; null / '' -> null */
function toSeconds(value) {
  if (value == null || value === '') return null;
  const n = typeof value === 'number' ? value : parseSwimTimeText(value);
  return Number.isFinite(n) ? round2(n) : null;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function differs(a, b) {
  return a != null && b != null && Math.abs(a - b) > 0.005;
}

/** Split "Luo-han Chen" into a surname used for sorting only. */
function nameParts(entry) {
  const full = String(entry?.swimmerName || '').trim();
  const bits = full.split(/\s+/).filter(Boolean);
  if (bits.length < 2) return { first: '', last: full };
  return { first: bits.slice(0, -1).join(' '), last: bits[bits.length - 1] };
}

/**
 * Turn raw entry documents into flat export rows.
 *
 * Only `confirmed` entries become rows. Everything else lands in `excluded`
 * with a human-readable reason, because "7 families never confirmed" is a fact
 * the coach must see before the file is sent — silently exporting 26 of 33
 * swimmers is how a kid gets left out of a meet.
 */
export function buildExportRows({ meet, entries = [], bestTimesById, statuses = [EXPORTED_STATUS] } = {}) {
  const sessions = new Map((meet?.sessions || []).map((s) => [s.id, s]));
  // The entry file may only carry confirmed rows. The confirmation sheet,
  // however, is also useful *before* the coach confirms (the family wants to see
  // what it submitted), so the caller can widen this — see meet-print.js.
  const allowed = new Set(statuses);
  const getBestTimes = (id) => {
    if (!bestTimesById) return [];
    if (typeof bestTimesById.get === 'function') return bestTimesById.get(id) || [];
    return bestTimesById[id] || [];
  };

  const rows = [];
  const excluded = [];
  const noId = [];

  for (const entry of entries) {
    const status = String(entry?.status || 'draft');
    const usaId = String(entry?.usaSwimmingId || '').trim();
    const name = String(entry?.swimmerName || '').trim() || '(unnamed)';

    if (!allowed.has(status)) {
      excluded.push({
        usaSwimmingId: usaId,
        swimmerName: name,
        status,
        reason: HELD_BACK[status] || `status is '${status}'`,
        eventCount: (entry?.events || []).length,
      });
      continue;
    }
    if (!usaId) {
      noId.push({ swimmerName: name, status });
      continue;
    }

    const bestTimes = getBestTimes(usaId);
    const { last, first } = nameParts(entry);
    for (const entryEvent of entry?.events || []) {
      const resolved = resolveSeedTime({ entryEvent, entry, meet, bestTimes });
      const session = sessions.get(entryEvent?.sessionId) || null;
      const changed = resolved.changed;
      rows.push({
        entryDocId: entry.id || entry.docId || null,
        familyId: entry.familyId || null,
        status,
        statusLabel: STATUS_LABELS[status] || status,
        usaSwimmingId: usaId,
        swimmerName: name,
        lastName: last,
        firstName: first,
        ageAtMeet: entry.ageAtMeet ?? null,
        gender: entry.gender ?? null,
        genderLabel: entry.gender === 'F' ? 'F' : entry.gender === 'M' ? 'M' : '',
        eventNo: resolved.eventNo,
        eventCode: resolved.eventCode,
        ageGroup: resolved.ageGroup,
        eventSex: resolved.eventSex,
        eventSexLabel: resolved.eventSexLabel,
        distance: resolved.distance,
        stroke: resolved.stroke,
        // EVENT AGE inputs, carried through for the SDIF writer.
        ageMin: resolved.ageMin,
        ageMax: resolved.ageMax,
        eventLabel: `${resolved.distance ?? '?'} ${STROKE_NAMES[resolved.stroke] || resolved.stroke || '?'}`,
        relay: Boolean(entryEvent?.relay),
        sessionId: entryEvent?.sessionId || null,
        day: session?.date || entryEvent?.day || '',
        sessionLabel: session ? `${session.day || ''} ${session.start || ''}`.trim() : '',
        state: resolved.state,
        seconds: resolved.seconds,
        seedTimeText: resolved.seconds == null ? '' : formatSwimSeconds(resolved.seconds),
        course: resolved.course || '',
        /** 'Y' / 'L' / 'S' — how the printed report suffixes a time. */
        courseLetter: COURSE_LETTERS[resolved.course] || '',
        source: resolved.source,
        sourceLabel: resolved.source === 'db' ? 'our records' : resolved.source === 'manual' ? 'typed' : '',
        proofDate: resolved.date || '',
        standardSeconds: resolved.standardSeconds,
        standardText: resolved.standardSeconds == null ? '' : formatSwimSeconds(resolved.standardSeconds),
        qualifies: resolved.state === 'qualified',
        qualifiesText: resolved.hasTimeStandard
          ? (resolved.state === 'qualified' ? 'yes' : resolved.state === 'manual' ? 'unverified' : 'bonus only')
          : 'no cut-off',
        storedSeedSeconds: resolved.storedSeedSeconds,
        storedSeedTimeText: resolved.storedSeedSeconds == null ? '' : formatSwimSeconds(resolved.storedSeedSeconds),
        changed,
        deltaSeconds: resolved.deltaSeconds,
        changedText: changed
          ? `${formatSwimSeconds(resolved.storedSeedSeconds)} → ${formatSwimSeconds(resolved.seconds)}`
          : '',
      });
    }
  }

  rows.sort((a, b) => (a.eventNo - b.eventNo)
    || String(a.ageGroup).localeCompare(String(b.ageGroup))
    || String(a.gender).localeCompare(String(b.gender))
    || String(a.lastName).localeCompare(String(b.lastName))
    || String(a.firstName).localeCompare(String(b.firstName)));

  return { rows, excluded, noId, staleTimes: rows.filter((r) => r.changed) };
}

/**
 * Post-resolution checks. These are the mistakes that get a file bounced or a
 * swimmer left out, so they are errors; the rest stay warnings.
 *
 * Limits are re-checked here even though the selection validated them, because
 * the row count is decided at export time (a family adding a 7th event after
 * the coach's last look is exactly the case this catches).
 */
export function validateExport({ rows = [], meet, excluded = [], noId = [] } = {}) {
  const errors = [];
  const warnings = [];

  const missing = rows.filter((r) => r.state === 'missing');
  if (missing.length) {
    errors.push({
      code: 'missing-seed-time',
      count: missing.length,
      swimmers: uniqueNames(missing),
      detail: 'the meet refuses NT; type a seed time or drop the event',
    });
  }

  if (noId.length) {
    errors.push({
      code: 'no-usa-id',
      count: noId.length,
      swimmers: noId.map((n) => n.swimmerName),
      detail: 'an entry file is keyed on the USA Swimming ID',
    });
  }

  const maxEvents = meet?.limits?.maxEvents;
  if (maxEvents) {
    const perSwimmer = countBy(rows, (r) => r.usaSwimmingId);
    for (const [usaId, n] of perSwimmer) {
      if (n > maxEvents) {
        errors.push({
          code: 'too-many-events',
          usaSwimmingId: usaId,
          count: n,
          max: maxEvents,
          swimmer: rows.find((r) => r.usaSwimmingId === usaId)?.swimmerName,
        });
      }
    }
  }

  const maxPerDay = meet?.limits?.maxPerDay;
  if (maxPerDay) {
    const perDay = countBy(rows.filter((r) => r.day), (r) => `${r.usaSwimmingId}|${r.day}`);
    for (const [key, n] of perDay) {
      if (n > maxPerDay) {
        const [usaId, day] = key.split('|');
        errors.push({
          code: 'too-many-per-day',
          usaSwimmingId: usaId,
          day,
          count: n,
          max: maxPerDay,
          swimmer: rows.find((r) => r.usaSwimmingId === usaId)?.swimmerName,
        });
      }
    }
  }

  if (excluded.length) {
    warnings.push({
      code: 'not-confirmed',
      count: excluded.length,
      swimmers: excluded.map((e) => `${e.swimmerName} (${e.reason})`),
      detail: 'these entries are not in the file',
    });
  }

  const stale = rows.filter((r) => r.changed);
  if (stale.length) {
    warnings.push({
      code: 'seed-time-refreshed',
      count: stale.length,
      swimmers: uniqueNames(stale),
      detail: 'exported times are newer than what the family confirmed',
    });
  }

  const bonusOnly = rows.filter((r) => r.state === 'slower-than-line');
  if (bonusOnly.length) {
    warnings.push({
      code: 'bonus-rows',
      count: bonusOnly.length,
      swimmers: uniqueNames(bonusOnly),
      detail: 'slower than the published line: allowed as bonus entries only',
    });
  }

  return { ok: errors.length === 0, errors, warnings };
}

function uniqueNames(rows) {
  return [...new Set(rows.map((r) => r.swimmerName))];
}

function countBy(rows, keyFn) {
  const map = new Map();
  for (const r of rows) {
    const k = keyFn(r);
    map.set(k, (map.get(k) || 0) + 1);
  }
  return map;
}

/** Counts for the summary the coach sees before exporting. */
export function summarizeExport({ rows = [], excluded = [], noId = [] } = {}) {
  const swimmers = new Set(rows.map((r) => r.usaSwimmingId));
  return {
    rowCount: rows.length,
    swimmerCount: swimmers.size,
    eventCount: new Set(rows.map((r) => r.eventNo)).size,
    qualified: rows.filter((r) => r.state === 'qualified').length,
    bonusOnly: rows.filter((r) => r.state === 'slower-than-line').length,
    manual: rows.filter((r) => r.state === 'manual').length,
    missing: rows.filter((r) => r.state === 'missing').length,
    refreshed: rows.filter((r) => r.changed).length,
    notConfirmed: excluded.length,
    noUsaId: noId.length,
    relays: rows.filter((r) => r.relay).length,
  };
}

/** Escape one CSV cell (RFC 4180: always quote, double the inner quotes). */
export function csvCell(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

/**
 * The entry worksheet: one line per swim, ready for the coach to key into
 * Team Manager (or for a reviewer to diff against the entry file).
 *
 * `bom: true` prepends a UTF-8 BOM so Excel on Windows opens the file as UTF-8
 * instead of the system code page — swimmer names are ASCII today, but the
 * moment one is not, a missing BOM turns it into mojibake.
 */
export function toWorksheetCsv(rows, { bom = true } = {}) {
  const header = WORKSHEET_COLUMNS.map((c) => csvCell(c.label)).join(',');
  const body = rows.map((row) => WORKSHEET_COLUMNS.map((c) => csvCell(row[c.key])).join(','));
  return `${bom ? '\ufeff' : ''}${[header, ...body].join('\r\n')}\r\n`;
}

/** Rows grouped per swimmer, in surname order — the shape a confirm sheet needs. */
export function groupRowsBySwimmer(rows = []) {
  const map = new Map();
  for (const row of rows) {
    const key = row.usaSwimmingId || row.swimmerName;
    if (!map.has(key)) {
      map.set(key, {
        usaSwimmingId: row.usaSwimmingId || null,
        swimmerName: row.swimmerName,
        lastName: row.lastName,
        firstName: row.firstName,
        ageAtMeet: row.ageAtMeet,
        gender: row.gender,
        events: [],
        refreshedCount: 0,
        totalFees: 0,
      });
    }
    const bucket = map.get(key);
    bucket.events.push(row);
    if (row.changed) bucket.refreshedCount += 1;
  }
  const groups = [...map.values()];
  groups.sort((a, b) => String(a.lastName).localeCompare(String(b.lastName))
    || String(a.firstName).localeCompare(String(b.firstName)));
  return groups;
}

/**
 * Best time for one event code (e.g. '100 BR SCY'), as the records stand now.
 * Small helper for the "what changed?" panel; returns null when unknown.
 */
export function bestTimeFor(bestTimes = [], eventCode, { qualifyingPeriodStart = null } = {}) {
  const parsed = parseEventCode(eventCode);
  if (!parsed) return null;
  const index = buildBestTimesIndex(bestTimes, { qualifyingPeriodStart });
  const hit = index[parsed.course]?.get(`${parsed.distance} ${parsed.stroke}`);
  return hit ? { seconds: hit.seconds, date: hit.date, course: parsed.course } : null;
}
