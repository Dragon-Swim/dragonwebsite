/**
 * Ordering for coach-side swimmer lists (Roster tab, Swim Times tab, and — for
 * the name-only rows — the Fee Summary / Deposits tabs).
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
 * Fee Summary and Deposits rows never had structured name parts — they carry
 * one free-text string from a spreadsheet (`meets.feeData[].swimmers[].name`,
 * `deposits.swimmerName`) — so they sort through `nameSortKey()`, which
 * resolves the parts from the registrations first and only then falls back to
 * reading the surname off the end of the string.
 *
 * ── Where it is applied ─────────────────────────────────────────────────────
 * At the DISPLAY sites only. `getSwimmersWithUsaId()` also supplies the fetch
 * order, and fetch order carries real operational meaning (3-minute cooldowns
 * between athletes, resumability after an interruption), so a display request
 * must not quietly change it.
 */

import { normalizeName } from './feeImport.js';

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

// ── Name-only rows (Fee Summary / Deposits) ──────────────────────────────────

/**
 * Surname-first key for a name we only have as ONE free-text string.
 *
 * The surname is taken to be the LAST whitespace-separated token and everything
 * before it is the given name, so "Haoran Chen" keys as `chen\u0000haoran` —
 * the same key `swimmerSortKey({ firstName: 'Haoran', lastName: 'Chen' })`
 * produces, which is what keeps the two tabs consistent with the Roster.
 *
 * A single-token name ("Anjka" — a row the fee import could not link to a
 * family) is treated as a surname, so it lands under its own letter instead of
 * being pinned above the A's where nobody would look for it.
 *
 * Tokens come from `normalizeName`, not `normalizeSortKey`: the two spellings
 * the data actually mixes, "Luo-han Chen" (registration) and "Luohan Chen"
 * (Hy-Tek export), must produce the SAME key, and dropping the hyphen (rather
 * than turning it into a space, as the Roster's part-wise key does) is the rule
 * the Fee Summary itself uses to merge them.
 *
 * Prefer `nameSortKey()`, which checks the registration first; this is the
 * fallback for names that are not on any registration yet.
 */
export function displayNameSortKey(name) {
  const tokens = normalizeName(name).split(' ').filter(Boolean);
  if (tokens.length === 0) return '';
  const last = tokens[tokens.length - 1];
  const given = tokens.slice(0, -1).join(' ');
  return `${last}\u0000${given}`;
}

/**
 * Lookup table of the real name parts of every registered swimmer, keyed by the
 * app's punctuation-blind name key (`feeImport.normalizeName` — the same rule
 * the Fee Summary itself uses to merge "Luo-han Chen" with "Luohan Chen").
 *
 * Why the registrations are needed at all: the spreadsheets carry the surname
 * only inside one string, and reading it off the END is wrong for compound
 * surnames — the live data has "Gabriel Martin del Campo", whose family belongs
 * under M, not under C ("campo"). A registration for that child fixes it with
 * no code change, because the lookup wins over the fallback.
 *
 * The middle-name variant is indexed too: the fee-import tool resolves names
 * like "eric chen" to Haoran Chen through `middleName`, so a spreadsheet that
 * still spells a child that way still finds the family.
 */
export function buildNamePartsIndex(registrations) {
  const index = new Map();
  for (const reg of registrations || []) {
    for (const s of reg?.swimmers || []) {
      if (!s || s.deleted) continue; // a soft-deleted placeholder is not roster
      const parts = { firstName: s.firstName || '', lastName: s.lastName || '' };
      if (!parts.firstName && !parts.lastName) continue;
      const keys = [
        normalizeName(`${parts.firstName} ${parts.lastName}`),
        normalizeName([parts.firstName, s.middleName, parts.lastName].filter(Boolean).join(' ')),
      ];
      for (const key of keys) if (key && !index.has(key)) index.set(key, parts);
    }
  }
  return index;
}

/**
 * Surname-first key for a name string, preferring the swimmer's real name parts
 * when the registration knows them (`partsIndex` from `buildNamePartsIndex`).
 * Without an index every name falls back to the last-token rule.
 */
export function nameSortKey(name, partsIndex) {
  const parts = partsIndex?.get(normalizeName(name));
  if (parts) return swimmerSortKey(parts);
  return displayNameSortKey(name);
}

/**
 * Comparator over two name strings ("Haoran Chen" vs "Luo-han Chen").
 *
 * Equal keys keep their existing relative order (stable sort), so the caller's
 * incoming order is still the final tiebreak.
 */
export function compareSwimmerNamesByLastName(a, b, partsIndex) {
  const ka = nameSortKey(a, partsIndex);
  const kb = nameSortKey(b, partsIndex);
  if (ka < kb) return -1;
  if (ka > kb) return 1;
  return 0;
}
