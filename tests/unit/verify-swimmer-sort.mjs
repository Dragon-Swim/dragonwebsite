// Unit checks for src/utils/swimmerSort.js — the last-name ordering used by the
// Roster tab, the Swim Times tab and the schedule "manage roster" overlay.
// Pure logic: no network, no Firestore, no DOM.
//
// Part of `npm run test:unit` (tests/unit/run-all.mjs). Deliberately NOT named
// *.spec.js / *.test.js so Playwright's testMatch cannot collect it.
import {
  normalizeSortKey, swimmerSortKey, compareSwimmersByLastName, sortSwimmersByLastName,
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

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
