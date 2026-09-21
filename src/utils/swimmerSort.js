/**
 * Ordering for coach-side swimmer lists (Roster tab, Swim Times tab).
 *
 * ── Why ─────────────────────────────────────────────────────────────────────
 * Both lists used to inherit the order of `allRegistrations`, which is
 * `orderBy("createdAt", "desc")`. That put the newest-registered FAMILY first
 * and scattered one family's children down the list, so finding a particular
 * child meant scanning every row. Sorting by surname is only half the job:
 * in the live roster 8 surnames are shared by two or three swimmers
 * (Tang x3, Zhang x3, Wang x3, Ye x3, Xu/Tao/Wu/Chen x2), so without a
 * first-name tiebreak those groups stay in arbitrary order.
 *
 * ── Where it is applied ─────────────────────────────────────────────────────
 * At the DISPLAY sites only. `getSwimmersWithUsaId()` also supplies the fetch
 * order, and fetch order carries real operational meaning (3-minute cooldowns
 * between athletes, resumability after an interruption), so a display request
 * must not quietly change it.
 */

/**
 * Fold a name into a comparison key: accents stripped, lowercased, punctuation
 * collapsed. Keeps "Luo-han" and "Luohan" adjacent, and "lucas li" (which is
 * really stored lowercase in the live data) next to the other L names.
 */
export function normalizeSortKey(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // drop combining accent marks
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Sort key for one swimmer: surname first, then given name.
 *
 * A swimmer with no surname sorts to the TOP (empty surname), which is
 * deliberate — it makes the gap obvious rather than burying it.
 *
 * Falls back to the whole display name for shapes that carry only `name`
 * (the mock swimmers, and any older caller that never had the parts).
 */
export function swimmerSortKey(swimmer) {
  const last = normalizeSortKey(swimmer?.lastName);
  const first = normalizeSortKey(swimmer?.firstName);
  if (last || first) return `${last}\u0000${first}`;
  return normalizeSortKey(swimmer?.name);
}

/**
 * Comparator: by surname, then given name.
 *
 * Equal keys keep their existing relative order (Array.prototype.sort is
 * stable), so the registration order still acts as a final tiebreak and the
 * result is deterministic.
 */
export function compareSwimmersByLastName(a, b) {
  const ka = swimmerSortKey(a);
  const kb = swimmerSortKey(b);
  if (ka < kb) return -1;
  if (ka > kb) return 1;
  return 0;
}

/** Non-mutating sort; returns a new array. */
export function sortSwimmersByLastName(swimmers) {
  return [...(swimmers || [])].sort(compareSwimmersByLastName);
}
