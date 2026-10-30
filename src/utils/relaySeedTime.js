/**
 * Relay seed time from the four legs.
 *
 * Why this exists
 * ---------------
 * A coach types a relay time into the squad editor. Meet Manager does not take
 * that number from us — it works a relay time out from the sum of the four legs'
 * best times, which is also how the host checks whether a relay has a "provable"
 * time. Send 1:52.00 while the legs add up to 1:47.25 and the two entry files
 * disagree for a reason nobody can explain later.
 *
 * So this computes what Meet Manager will compute, from the same
 * `swimResults/*.bestTimes` the individual events use (same index, same
 * qualifying window). The typed value is never overwritten: §6.7.1 of
 * docs/meet-entries.md says both numbers are shown, and the coach decides.
 *
 * Edge cases that must not pretend to know better:
 *   - a leg with no time at that distance/stroke → no total, and which leg is
 *     missing is part of the result (a missing time is not a slow time)
 *   - relays in this LSC carry a course-specific standard; the course is taken
 *     from the event's own `standards`, not guessed from other events
 *   - a medley relay's legs are back / breast / fly / free, in that order
 */

import { buildBestTimesIndex } from './meetEligibility.js';

/** Medley legs, in swim order. */
export const MEDLEY_LEG_STROKES = ['BK', 'BR', 'FL', 'FR'];

const COURSE_ORDER = ['SCY', 'LCM', 'SCM'];

/**
 * What each leg swims: `event.distance / 4`, and the stroke for that position.
 * A free relay is four freestyle legs; a medley relay is back/breast/fly/free.
 */
export function relayLegSpecs(event) {
  const distance = Number(event?.distance);
  if (!Number.isFinite(distance) || distance <= 0) return [];
  const per = distance / 4;
  const medley = String(event?.stroke || '').trim().toUpperCase() === 'MED';
  return [0, 1, 2, 3].map((i) => ({
    order: i + 1,
    distance: per,
    stroke: medley ? MEDLEY_LEG_STROKES[i] : 'FR',
  }));
}

/** The course this relay is swum in — the first course the event publishes a line for. */
export function relayCourse(event) {
  const standards = event?.standards || {};
  return COURSE_ORDER.find((c) => standards[c] != null) || 'SCY';
}

/**
 * Sum the four legs' best times at this event's distance/stroke.
 *
 * @param {object} opts
 * @param {object} opts.event              meet event row (needs distance, stroke, standards)
 * @param {Array}  opts.legs               four entries, in swim order: `{ usaSwimmingId|usaId, firstName, lastName }`
 * @param {Map|object} opts.bestTimesById  usaId → raw `swimResults/{id}.bestTimes`
 * @param {string} [opts.qualifyingPeriodStart]
 * @returns {{ok: boolean, course: string, seconds: number|null,
 *   parts: Array<{order:number, leg:number, distance:number, stroke:string, name:string,
 *     usaSwimmingId:string, seconds:number|null, date:string}>, missingOrders: number[]}}
 */
export function computeRelaySeedTime({
  event, legs = [], bestTimesById = new Map(), qualifyingPeriodStart = null,
} = {}) {
  const course = relayCourse(event);
  const specs = relayLegSpecs(event);
  // No distance on the event means there is nothing to divide by four; say so
  // rather than summing an empty list to zero.
  if (!specs.length) return { ok: false, course, seconds: null, parts: [], missingOrders: [] };
  const lookup = (id) => {
    if (!id) return [];
    if (typeof bestTimesById?.get === 'function') return bestTimesById.get(id) || [];
    return bestTimesById?.[id] || [];
  };

  const parts = specs.map((spec, i) => {
    const leg = legs[i] || null;
    const usaSwimmingId = String(leg?.usaSwimmingId || leg?.usaId || '').trim().toUpperCase();
    const name = [leg?.firstName, leg?.lastName].filter(Boolean).join(' ').trim()
      || String(leg?.swimmerName || '').trim()
      || usaSwimmingId;
    const index = buildBestTimesIndex(lookup(usaSwimmingId), { qualifyingPeriodStart });
    const hit = index[course]?.get(`${spec.distance} ${spec.stroke}`) || null;
    return {
      order: spec.order,
      leg: i + 1,
      distance: spec.distance,
      stroke: spec.stroke,
      name,
      usaSwimmingId,
      seconds: hit?.seconds ?? null,
      date: hit?.date || '',
    };
  });

  const missingOrders = parts.filter((p) => p.seconds == null).map((p) => p.order);
  const seconds = missingOrders.length ? null : parts.reduce((n, p) => n + p.seconds, 0);
  return { ok: seconds != null, course, seconds, parts, missingOrders };
}

/**
 * Compare the typed relay time with the computed one.
 * @returns {{state: 'match'|'differs'|'no-typed'|'no-sum', deltaSeconds: number|null, seconds: number|null}}
 */
export function compareRelaySeed({ typedSeconds = null, computedSeconds = null } = {}) {
  if (computedSeconds == null) return { state: 'no-sum', deltaSeconds: null, seconds: null };
  if (typedSeconds == null) return { state: 'no-typed', deltaSeconds: null, seconds: computedSeconds };
  const delta = Math.round((typedSeconds - computedSeconds) * 100) / 100;
  return {
    state: Math.abs(delta) <= 0.005 ? 'match' : 'differs',
    deltaSeconds: delta,
    seconds: computedSeconds,
  };
}
