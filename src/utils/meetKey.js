/**
 * Meet identity — is the meet USA Swimming just returned the same meet we already
 * stored under a different key?
 *
 * Why this exists (2026-10-30)
 * ----------------------------
 * Two pipelines now write `swimResults/{memberId}.meets`:
 *
 *   - the USAS fetch, which keys a meet on USA Swimming's numeric id (`289349`);
 *   - `execution/swim-results/import_pvs_results.mjs`, which keys a meet it has
 *     never seen on `pvs-<PVS key>` (`pvs-27-27`), because PVS has no numeric id.
 *
 * The importer already reuses an existing key when it can find one by name and
 * date, so today every imported meet lands under the USAS key and nothing
 * duplicates. The hazard is the other direction: a meet first imported from PVS
 * sits under `pvs-27-27`, and a later `Fetch All` sees an unknown `meetId`, fetches
 * it, and stores a second copy. The family then sees the same meet twice.
 *
 * So the fetch side resolves the target key here: if a meet already on file is
 * the same meet (same start day, and their names share a meaningful word), the
 * new data is merged into that meet's record instead of creating a second one —
 * and the record moves to the USAS key, because that is the canonical id and the
 * next fetch will then find it and skip it.
 *
 * Merging must not lose PVS-only content: USA Swimming never returns DQ, scratch
 * or no-swim records, so those rows (`source: 'pvs'`) survive a USAS refetch.
 */

/** Words that never identify a meet on their own. */
const STOP = new Set([
  'meet', 'invitational', 'invite', 'open', 'annual', 'championship', 'championships',
  'champ', 'the', 'and', 'of', 'at', 'site', 'copied', 'copy', 'sanctioned',
  '2024', '2025', '2026', '2027', '2028',
]);

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/** Lower-case words of 3+ letters, minus the boilerplate above. */
export function meetNameTokens(name) {
  return (String(name || '').toLowerCase().match(/[a-z]{3,}/g) || []).filter((t) => !STOP.has(t));
}

/**
 * The first day of a meet, in a form that compares across the three shapes we
 * store: `"Oct 24 - Oct 25"` (USAS), `"Oct 24"` (single day), `"2026-10-24"`.
 * Returns `{ month, day }` (1-based month) or null.
 */
export function parseMeetDay(dates) {
  const s = String(dates || '').trim();
  if (!s) return null;
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (iso) return { month: Number(iso[2]), day: Number(iso[3]) };
  const mon = /^([A-Za-z]{3})[a-z]*\s+(\d{1,2})/.exec(s);
  if (!mon) return null;
  const month = MONTHS.indexOf(mon[1].toLowerCase()) + 1;
  if (!month) return null;
  return { month, day: Number(mon[2]) };
}

/**
 * Where should this meet's data be written?
 *
 * @param {{meetId: string, meetName?: string, meetDates?: string}} meet
 * @param {Object<string, object>} existingMeets  `swimResults/{id}.meets`
 * @returns {{key: string, existing: object|null, dropKey: string|null}}
 *   `key` is always the incoming `meetId`; `existing` is the record it collides
 *   with (merged, not replaced); `dropKey` is the old key to delete.
 */
export function resolveMeetKey(meet, existingMeets) {
  const meetId = String(meet?.meetId || '').trim();
  const map = existingMeets || {};
  if (!meetId) return { key: meetId, existing: null, dropKey: null };

  if (map[meetId]) return { key: meetId, existing: map[meetId], dropKey: null };

  const day = parseMeetDay(meet?.meetDates);
  const want = new Set(meetNameTokens(meet?.meetName));
  if (!day || !want.size) return { key: meetId, existing: null, dropKey: null };

  let best = null;
  for (const [key, stored] of Object.entries(map)) {
    if (!stored || typeof stored !== 'object') continue;
    const storedDay = parseMeetDay(stored.meetDates);
    if (!storedDay || storedDay.month !== day.month || storedDay.day !== day.day) continue;
    const shared = meetNameTokens(stored.meetName).filter((t) => want.has(t));
    if (!shared.length) continue;
    if (!best || shared.length > best.shared) best = { key, stored, shared: shared.length };
  }
  if (!best) return { key: meetId, existing: null, dropKey: null };
  return { key: meetId, existing: best.stored, dropKey: best.key };
}

/** "100 FR SCY" -> "100FRSCY" (same normalisation the verifier uses). */
const codeOf = (code) => String(code || '').toUpperCase().replace(/[^0-9A-Z]/g, '');

/**
 * Union of what the fetch just returned and the PVS-only rows already stored.
 *
 * A USA Swimming fetch is authoritative for ordinary results, so its rows win and
 * the stored ones are dropped; what survives is the content USAS cannot express —
 * anything the PVS import wrote (`source: 'pvs'`: DQ today, scratches later).
 */
export function mergeSwimLists(fetched = [], existing = []) {
  const have = new Set(fetched.map((s) => `${codeOf(s?.eventCode)}|${String(s?.swimTime ?? '')}`));
  const keep = (existing || []).filter((s) => {
    if (!s || s.source !== 'pvs') return false;
    return !have.has(`${codeOf(s.eventCode)}|${String(s.swimTime ?? '')}`);
  });
  return [...fetched, ...keep];
}
