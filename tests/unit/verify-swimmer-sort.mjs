// Unit checks for src/utils/swimmerSort.js — the last-name ordering used by the
// Roster tab, the Swim Times tab, the schedule "manage roster" overlay, and the
// name-only rows of the Fee Summary / Deposits tabs.
// Pure logic: no network, no Firestore, no DOM.
//
// Part of `npm run test:unit` (tests/unit/run-all.mjs). Deliberately NOT named
// *.spec.js / *.test.js so Playwright's testMatch cannot collect it.
import {
  normalizeSortKey, swimmerSortKey, compareSwimmersByLastName, sortSwimmersByLastName,
  displayNameSortKey, buildNamePartsIndex, nameSortKey, compareSwimmerNamesByLastName,
} from '../../src/utils/swimmerSort.js';

let pass = 0;
let fail = 0;
const check = (name, cond, detail) => {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail !== undefined ? ` -> ${JSON.stringify(detail)}` : ''}`); }
};

const S = (first, last) => ({ firstName: first, lastName: last });
const names = (list) => list.map((s) => `${s.firstName} ${s.lastName}`);

console.log('1. normalizeSortKey');
check('lowercases', normalizeSortKey('Zhang') === 'zhang');
check('strips punctuation to spaces', normalizeSortKey('Luo-han') === 'luo han');
check('collapses "Luo-han" and "Luohan" to adjacent keys',
  normalizeSortKey('Luo-han') === 'luo han' && normalizeSortKey('Luohan') === 'luohan');
check('drops accents', normalizeSortKey('José') === 'jose', normalizeSortKey('José'));
check('handles apostrophes', normalizeSortKey("O'Brien") === 'o brien', normalizeSortKey("O'Brien"));
check('null/undefined safe', normalizeSortKey(null) === '' && normalizeSortKey(undefined) === '');

console.log('2. swimmerSortKey');
check('surname leads the key', swimmerSortKey(S('Nathan', 'Zhang')).startsWith('zhang'));
check('given name follows', swimmerSortKey(S('Nathan', 'Zhang')) > swimmerSortKey(S('Jake', 'Zhang')));
check('lowercase data sorts with its letter (the live "lucas li" case)',
  swimmerSortKey(S('lucas', 'li')).startsWith('li'));
check('falls back to `name` when parts are absent',
  swimmerSortKey({ name: 'Mock A' }) === 'mock a', swimmerSortKey({ name: 'Mock A' }));
check('empty swimmer does not throw', swimmerSortKey({}) === '' && swimmerSortKey(null) === '');

console.log('3. surname ordering');
const roster = [
  S('Lucas', 'Tang'), S('Charles', 'Zhang'), S('Amelia', 'Liao'), S('Carolyn', 'Tang'),
  S('Megan', 'Hu'), S('Anne', 'Tang'), S('Aiden', 'Che'), S('Daniel', 'Guo'),
];
check('sorts by surname', names(sortSwimmersByLastName(roster)).join('|') ===
  ['Aiden Che', 'Daniel Guo', 'Megan Hu', 'Amelia Liao', 'Anne Tang', 'Carolyn Tang', 'Lucas Tang', 'Charles Zhang'].join('|'),
  names(sortSwimmersByLastName(roster)));

console.log('4. the 8 real shared surnames need the given-name tiebreak');
// taken from the live roster; without a tiebreak these stay in arbitrary order
const shared = [
  S('Lucas', 'Tang'), S('Carolyn', 'Tang'), S('Anne', 'Tang'),
  S('Charles', 'Zhang'), S('Jake', 'Zhang'), S('Nathan', 'Zhang'),
  S('Anthony', 'Wang'), S('Evelyn', 'Wang'), S('Damon', 'Wang'),
  S('William', 'Ye'), S('Marco', 'Ye'), S('Isabella', 'Ye'),
  S('Miranda', 'Xu'), S('Monica', 'Xu'),
  S('Charlene', 'Tao'), S('Patrick', 'Tao'),
  S('Leo', 'Wu'), S('Jonathan', 'Wu'),
  S('Haoran', 'Chen'), S('Luo-han', 'Chen'),
];
const sortedShared = sortSwimmersByLastName(shared);
const groups = {};
sortedShared.forEach((s) => { (groups[s.lastName] = groups[s.lastName] || []).push(s.firstName); });
const tiebreakOk = Object.entries(groups).every(([, firsts]) =>
  firsts.join('|') === [...firsts].sort((a, b) => normalizeSortKey(a).localeCompare(normalizeSortKey(b))).join('|'));
check('every shared surname is ordered by given name', tiebreakOk, groups);
check('Ye children are adjacent and in given-name order',
  groups.Ye.join('|') === 'Isabella|Marco|William', groups.Ye);
check('Tang children are adjacent and in given-name order',
  groups.Tang.join('|') === 'Anne|Carolyn|Lucas', groups.Tang);
check('Chen keeps Haoran before Luo-han (hyphen handled)', groups.Chen.join('|') === 'Haoran|Luo-han', groups.Chen);

console.log('5. the full live roster, ordered');
const LIVE = [
  S('Lucas','Tang'),S('Charles','Zhang'),S('Amelia','Liao'),S('Carolyn','Tang'),S('Megan','Hu'),
  S('Anne','Tang'),S('Aiden','Che'),S('Daniel','Guo'),S('Bili','Zhu'),S('Anna','Ruan'),
  S('lucas','li'),S('Ellora','Patel'),S('Ridhi','Seelam'),S('Ada','Gai'),S('Jake','Zhang'),
  S('Nathan','Zhang'),S('Aden','Kim'),S('Miranda','Xu'),S('Monica','Xu'),S('Xuan','Zhou'),
  S('Charlene','Tao'),S('Patrick','Tao'),S('Anthony','Wang'),S('Anthony','Shvets'),S('William','Ye'),
  S('Marco','Ye'),S('Isabella','Ye'),S('Leo','Wu'),S('Jonathan','Wu'),S('Alex','Tong'),
  S('Evelyn','Wang'),S('Damon','Wang'),S('Aiden','Pan'),S('Haoran','Chen'),S('Luo-han','Chen'),
];
const ordered = names(sortSwimmersByLastName(LIVE));
const expectedFirst = ['Aiden Che', 'Haoran Chen', 'Luo-han Chen', 'Ada Gai', 'Daniel Guo'];
const expectedLast = ['Charles Zhang', 'Jake Zhang', 'Nathan Zhang', 'Xuan Zhou', 'Bili Zhu'];
check('first five match the previewed order', ordered.slice(0, 5).join('|') === expectedFirst.join('|'), ordered.slice(0, 5));
check('last five match the previewed order', ordered.slice(-5).join('|') === expectedLast.join('|'), ordered.slice(-5));
check('all 35 preserved, none dropped', ordered.length === LIVE.length && new Set(ordered).size === LIVE.length);

console.log('6. safety properties');
const original = [...LIVE];
const out = sortSwimmersByLastName(LIVE);
check('does not mutate the input array', LIVE.map((s) => s.firstName).join('|') === original.map((s) => s.firstName).join('|'));
check('returns a new array', out !== LIVE);
check('empty array is fine', sortSwimmersByLastName([]).length === 0);
check('null is fine', sortSwimmersByLastName(null).length === 0);

const missingLast = [S('Zoe', 'Zhu'), S('Nobody', ''), S('Amy', 'Adams')];
check('a swimmer with no surname sorts first (gap is visible, not buried)',
  sortSwimmersByLastName(missingLast)[0].firstName === 'Nobody', names(sortSwimmersByLastName(missingLast)));

// stability: identical keys keep the incoming (registration) order
const twins = [S('Sam', 'Lee'), S('Sam', 'Lee'), S('Sam', 'Lee')].map((s, i) => ({ ...s, tag: i }));
const sortedTwins = sortSwimmersByLastName(twins);
check('identical names keep their original relative order',
  sortedTwins.map((t2) => t2.tag).join('') === '012', sortedTwins.map((t2) => t2.tag));

// shapes without name parts (mock swimmers) must not throw or reorder wildly
const mockish = [{ name: 'Mock B' }, { name: 'Mock A' }];
check('objects with only `name` still sort deterministically',
  sortSwimmersByLastName(mockish).map((m) => m.name).join('|') === 'Mock A|Mock B',
  sortSwimmersByLastName(mockish).map((m) => m.name));

console.log('7. comparator consistency (transitive, antisymmetric)');
const sample = sortSwimmersByLastName(LIVE);
let consistent = true;
for (let i = 0; i < sample.length - 1; i++) {
  if (compareSwimmersByLastName(sample[i], sample[i + 1]) > 0) consistent = false;
  if (compareSwimmersByLastName(sample[i + 1], sample[i]) < 0) consistent = false;
}
check('already-sorted list compares as non-decreasing both ways', consistent);

// ── Fee Summary / Deposits rows: one free-text name, no name parts ──────────
const sortNames = (list, index) => [...list].sort((a, b) => compareSwimmerNamesByLastName(a, b, index));

console.log('8. displayNameSortKey — the fallback when there is no registration');
check('"Haoran Chen" keys exactly like the structured swimmer',
  displayNameSortKey('Haoran Chen') === swimmerSortKey(S('Haoran', 'Chen')),
  displayNameSortKey('Haoran Chen'));
check('the last token is the surname (compound surname falls to "campo")',
  displayNameSortKey('Gabriel Martin del Campo').startsWith('campo'),
  displayNameSortKey('Gabriel Martin del Campo'));
check('given name is the tiebreak',
  displayNameSortKey('Liam Norcross') < displayNameSortKey('Logan Norcross'));
check('"Luo-han Chen" and "Luohan Chen" agree (the 2026-10 punctuation fix)',
  displayNameSortKey('Luo-han Chen') === displayNameSortKey('Luohan Chen'));
check('lowercase data still sorts under its letter (the live "lucas li")',
  displayNameSortKey('lucas li').startsWith('li'));
check('a single-token name is treated as a surname ("Anjka")',
  displayNameSortKey('Anjka') === 'anjka\u0000', displayNameSortKey('Anjka'));
check('…so it sits under A instead of being pinned above the list',
  sortNames(['Wang', 'Anjka', 'Chen'])[0] === 'Anjka', sortNames(['Wang', 'Anjka', 'Chen']));
check('empty / null names do not throw', displayNameSortKey('') === '' && displayNameSortKey(null) === '');
check('compareSwimmerNamesByLastName works without an index',
  compareSwimmerNamesByLastName('Haoran Chen', 'Ada Gai') < 0);

console.log('9. buildNamePartsIndex — the registration wins over the guess');
const namePartsIndex = buildNamePartsIndex([
  { swimmers: [
    { firstName: 'Gabriel', middleName: '', lastName: 'Martin del Campo' },
    { firstName: 'Luo-han', middleName: 'Kayden', lastName: 'Chen' },
    { firstName: 'Gone', lastName: 'Placeholder', deleted: true },
  ] },
  { swimmers: [{ firstName: 'lucas', middleName: 'gao', lastName: 'li' }] },
]);
check('compound surname resolves through the registration',
  nameSortKey('Gabriel Martin del Campo', namePartsIndex).startsWith('martin del campo'),
  nameSortKey('Gabriel Martin del Campo', namePartsIndex));
check('a fee-sheet spelling resolves to the registered surname',
  nameSortKey('Luohan Chen', namePartsIndex) === swimmerSortKey(S('Luo-han', 'Chen')));
check('middle name is indexed too (how "eric chen" → Haoran Chen works)',
  namePartsIndex.has('lucas gao li'));
check('soft-deleted swimmers are not indexed', !namePartsIndex.has('gone placeholder'));
check('an unknown name keeps the fallback',
  nameSortKey('Celina Feng', namePartsIndex).startsWith('feng'));
check('a missing index is safe', nameSortKey('Gabriel Martin del Campo', null).startsWith('campo'));

console.log('10. the live Fee Summary / Deposits names, ordered');
// Names as they are actually stored (a mix of spellings from Hy-Tek, the
// coach's spreadsheets and the registrations).
const liveNames = [
  'Andrew Xiao', 'Logan Norcross', 'Ellora Patel', 'Charlene Tao', 'luke Kamil',
  'Liam Norcross', 'Leo Wu', 'Daniel Guo', 'Anjka', 'Jonathan Wu', 'Luo-han Chen',
  'Lasya Agili', 'Miranda Xu', 'Anthony Wang', 'Gabriel Martin del Campo', 'rishik Dandu',
];
const expectedOrder = [
  'Lasya Agili', 'Anjka', 'Gabriel Martin del Campo', 'Luo-han Chen', 'rishik Dandu',
  'Daniel Guo', 'luke Kamil', 'Liam Norcross', 'Logan Norcross', 'Ellora Patel',
  'Charlene Tao', 'Anthony Wang', 'Jonathan Wu', 'Leo Wu', 'Andrew Xiao', 'Miranda Xu',
];
// The registrations as they exist today: Gabriel Martin del Campo's family is
// still unregistered, which is exactly why his row falls to the "campo" key.
const liveIndex = buildNamePartsIndex([{ swimmers: [
  { firstName: 'Luo-han', middleName: 'Kayden', lastName: 'Chen' },
  { firstName: 'lucas', middleName: 'gao', lastName: 'li' },
  { firstName: 'luke', lastName: 'Kamil' },
  { firstName: 'Liam', lastName: 'Norcross' },
  { firstName: 'Logan', lastName: 'Norcross' },
  { firstName: 'Lasya', lastName: 'Agili' },
] }]);
const orderedNames = sortNames(liveNames, liveIndex);
check('surnames first, given name as the tiebreak',
  orderedNames.join('|') === expectedOrder.join('|'), orderedNames);
check('every row survives the sort',
  orderedNames.length === liveNames.length && new Set(orderedNames).size === liveNames.length);
check('sorting is stable for identical keys',
  sortNames(['Sam Lee', 'Sam Lee', 'Sam Lee']).length === 3);

// The known gap: an unregistered compound surname lands under C. Registering the
// child is the fix — the lookup then wins and he moves to the M's.
const gabrielIndex = buildNamePartsIndex([{ swimmers: [{ firstName: 'Gabriel', lastName: 'Martin del Campo' }] }]);
const withGabriel = sortNames(liveNames, gabrielIndex);
check('registering the child moves him from C to M, with no code change',
  withGabriel[withGabriel.indexOf('Gabriel Martin del Campo') - 1] === 'luke Kamil'
  && withGabriel[withGabriel.indexOf('Gabriel Martin del Campo') + 1] === 'Liam Norcross',
  withGabriel);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
