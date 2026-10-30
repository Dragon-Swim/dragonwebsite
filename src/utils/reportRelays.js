/**
 * Relay line-ups as the printed report needs them.
 *
 * Why this is its own module
 * --------------------------
 * A relay belongs to the club, not to a swimmer: it lives in
 * `meets/{id}/relayEntries/{eventCode}__{letter}` as four ordered legs, while the
 * report is organised per swimmer. Turning one into the other is pure logic with
 * a rule the host will read, so it is testable on its own and the page only
 * renders the result.
 *
 * The shape follows Team Manager's printed report (verified against the 2025
 * Riley Eaton submission, archived in `.tmp/meet-entry/samples/reports/rmsc-2025/`):
 *
 *   by name   the swimmer's relay appears as one more line under their name, and
 *             the line says which leg is theirs — a medley relay names the stroke
 *             ("... 200 Medley Relay A Back"), a free relay gives the leg number
 *             ("... 200 Free Relay A 3")
 *   by event  the squad is printed once, with the letter, the club code, the
 *             relay time and four numbered names
 *
 * Getting the medley leg order wrong would print "Fly" for the backstroker, so it
 * lives in one constant here — 1 back, 2 breast, 3 fly, 4 free, which is also
 * what `docs/meet-entries.md` §6.7.1 uses for the seed-time sum.
 */

/** Legs of a medley relay, in swim order. */
export const MEDLEY_LEGS = ['Back', 'Breast', 'Fly', 'Free'];

const STROKE_WORDS = { FR: 'Free', MED: 'Medley', FLY: 'Fly', BK: 'Back', BR: 'Breast', IM: 'IM' };

/** 'MED' → 'Medley', 'FR' → 'Free'. Unknown strokes come back as-is. */
export function relayStrokeWord(stroke) {
  const key = String(stroke || '').trim().toUpperCase();
  return STROKE_WORDS[key] || key;
}

/** 'F' → 'Female', 'M' → 'Male', mixed or unknown → ''. */
export function relaySexLabel(squad) {
  const g = String(squad?.gender || '').trim().toUpperCase();
  if (g === 'F') return 'Female';
  if (g === 'M') return 'Male';
  return '';
}

/**
 * What this swimmer does in this relay, as the report prints it:
 * medley → the stroke ('Back'), free relay → the leg number ('3').
 * @param {string} stroke      event stroke code ('MED' / 'FR')
 * @param {number} legIndex    1-based position in the line-up
 */
export function relayRoleLabel(stroke, legIndex) {
  const i = Number(legIndex) - 1;
  if (!Number.isInteger(i) || i < 0) return '';
  if (String(stroke || '').trim().toUpperCase() === 'MED') return MEDLEY_LEGS[i] || '';
  return String(i + 1);
}

/** '200 Medley Relay' / '800 Free Relay'. */
export function relayEventTitle(squad) {
  const distance = squad?.distance != null && squad.distance !== '' ? `${squad.distance} ` : '';
  const word = relayStrokeWord(squad?.stroke);
  return `${distance}${word}${word ? ' ' : ''}Relay`.trim();
}

/** 'Male 13-14 200 Medley Relay A' — everything before the leg role. */
export function relayLineLabel(squad) {
  return [relaySexLabel(squad), squad?.ageGroup, relayEventTitle(squad), squad?.letter]
    .filter(Boolean).join(' ').trim();
}

function nameOf(leg) {
  return [leg?.firstName, leg?.lastName].filter(Boolean).join(' ').trim();
}

/**
 * Turn relay documents into what the report renders.
 *
 * @param {Array} squads  `meets/{id}/relayEntries` documents
 * @returns {{bySwimmer: Map<string, Array>, squads: Array}}
 *   `bySwimmer` maps a USA Swimming ID to its relay lines (sorted by event
 *   number, then letter); `squads` is the by-event list for the RELAYS section.
 */
export function buildRelayReport(squads = []) {
  const bySwimmer = new Map();
  const swimmers = new Map();
  const list = [];

  for (const squad of squads) {
    // Keep the original positions: a gap would otherwise renumber the legs.
    const legs = (squad?.legs || [])
      .map((leg, i) => (leg ? { leg, order: i + 1 } : null))
      .filter(Boolean);
    if (!legs.length) continue;

    const entry = {
      id: squad.id || null,
      eventNo: squad.eventNo ?? null,
      eventCode: squad.eventCode || '',
      letter: String(squad.letter || '').trim().toUpperCase(),
      title: relayEventTitle(squad),
      label: relayLineLabel(squad),
      sexLabel: relaySexLabel(squad),
      ageGroup: squad.ageGroup || '',
      seconds: Number.isFinite(squad.seedSeconds) ? squad.seedSeconds : null,
      courseLetter: squad.courseLetter || '',
      legs: legs.map(({ leg, order }) => ({
        order,
        name: nameOf(leg),
        age: leg?.ageAtMeet ?? null,
        gender: leg?.gender || squad.gender || null,
        usaSwimmingId: String(leg?.usaSwimmingId || '').trim().toUpperCase(),
        role: relayRoleLabel(squad.stroke, order),
      })),
    };
    list.push(entry);

    for (const leg of entry.legs) {
      if (!leg.usaSwimmingId) continue;
      const line = {
        eventNo: entry.eventNo,
        eventCode: entry.eventCode,
        letter: entry.letter,
        label: entry.label,
        role: leg.role,
        legOrder: leg.order,
        title: entry.title,
      };
      if (!bySwimmer.has(leg.usaSwimmingId)) bySwimmer.set(leg.usaSwimmingId, []);
      bySwimmer.get(leg.usaSwimmingId).push(line);

      // Enough identity to give a relay-only swimmer a block of their own: the
      // host must find every entered athlete on the by-name report, and a child
      // who only swims relays has no entry document to be listed from.
      const known = swimmers.get(leg.usaSwimmingId);
      if (!known) {
        swimmers.set(leg.usaSwimmingId, {
          usaSwimmingId: leg.usaSwimmingId,
          swimmerName: leg.name,
          ageAtMeet: leg.age,
          gender: leg.gender,
        });
      }
    }
  }

  const byEventNo = (a, b) => (Number(a.eventNo ?? 0) - Number(b.eventNo ?? 0))
    || String(a.letter).localeCompare(String(b.letter));
  for (const lines of bySwimmer.values()) lines.sort(byEventNo);
  list.sort(byEventNo);

  return { bySwimmer, squads: list, swimmers };
}
