// Unit checks for the relay line-up model (src/utils/relayEntry.js) and the SDIF
// relay records it feeds (E0 / F0 in src/utils/sdif.js).
//
// A relay is the most expensive thing to get wrong: one ineligible leg invalidates
// the whole squad at the meet director's desk, and the leg *order* is the only part
// a CL2 can carry. So the checks below are about hard rules and about not
// re-sorting what the coach decided.
//
// Part of `npm run test:unit`. Not named *.spec.js so Playwright cannot collect it.
import {
  RELAY_LETTERS, LEG_COUNT, relayDocId, relayEventsOf, emptySquad, validateSquad,
  squadToSdifRelay, describeSquad,
} from '../../src/utils/relayEntry.js';
import { buildEntrySdif, parseSdif } from '../../src/utils/sdif.js';

let pass = 0;
let fail = 0;
const check = (name, cond, detail) => {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail !== undefined ? ` -> ${JSON.stringify(detail)}` : ''}`); }
};

const MEET = {
  name: 'Riley Eaton Holiday Invitational',
  startDate: '2026-12-10',
  ageDeterminedOn: '2026-12-10',
  relayLimitPerClub: 2,
  courses: ['SCY'],
  events: [
    { eventNo: 9, eventCode: '9A', gender: 'M', ageGroup: '13-14', ageMin: 13, ageMax: 14,
      distance: 200, stroke: 'MED', relay: true, sessionId: 'fri-am', standards: { SCY: 120.99, LCM: null } },
    { eventNo: 9, eventCode: '9B', gender: 'M', ageGroup: 'Open', ageMin: 15, ageMax: 109,
      distance: 200, stroke: 'MED', relay: true, sessionId: 'fri-am', standards: { SCY: 120.99, LCM: null } },
    { eventNo: 5, eventCode: '5', gender: 'F', ageGroup: '13-14', ageMin: 13, ageMax: 14,
      distance: 800, stroke: 'FR', relay: true, sessionId: 'thu-pm', standards: { SCY: 514.99, LCM: null } },
    { eventNo: 19, eventCode: '19A', gender: 'M', ageGroup: '13-14', ageMin: 13, ageMax: 14,
      distance: 100, stroke: 'BR', relay: false, sessionId: 'fri-am', standards: { SCY: 76.69, LCM: 82.99 } },
  ],
};

const EVENT_9A = MEET.events[0];

const boy = (n, dob, extra = {}) => ({
  usaSwimmingId: `ID${n}0000000000`.slice(0, 14), firstName: `Boy${n}`, lastName: `Surname${n}`,
  gender: 'M', dob, ...extra,
});

console.log('1. document ids and event selection');
check('doc id is eventCode + letter', relayDocId('9A', 'b') === '9A__B', relayDocId('9A', 'b'));
check('doc id needs both halves', relayDocId('', 'A') === null && relayDocId('9A', '') === null);
check('letters run A..D (the meet caps how many are legal)', RELAY_LETTERS.join('') === 'ABCD');
check('a squad is four legs', LEG_COUNT === 4);
check('an empty squad has four slots', emptySquad().legs.length === 4 && emptySquad().legs.every((l) => l === null));

const relays = relayEventsOf(MEET);
check('relay events are de-duplicated by event code', relays.length === 3, relays.map((r) => r.eventCode));
check('individual events are not offered', !relays.some((r) => r.eventCode === '19A'));
check('relay events are sorted by event number', relays.map((r) => r.eventNo).join() === '5,9,9');

console.log('2. squad validation');
// Ages on the meet's age date (2026-12-10): 14, 14, 13, 14 — all inside 13-14.
const fourBoys = [boy(1, '2012-05-01'), boy(2, '2012-06-01'), boy(3, '2013-07-01'), boy(4, '2012-08-01')];
const okSquad = validateSquad({ meet: MEET, event: EVENT_9A, legs: fourBoys, squadsInEvent: 1 });
check('four valid legs pass', okSquad.ok === true, okSquad.errors);

const three = validateSquad({ meet: MEET, event: EVENT_9A, legs: fourBoys.slice(0, 3) });
check('three legs is an error', !three.ok && three.errors.some((e) => e.code === 'leg-count'), three.errors);

const dup = validateSquad({ meet: MEET, event: EVENT_9A, legs: [fourBoys[0], fourBoys[0], fourBoys[1], fourBoys[2]] });
check('the same swimmer twice is an error', !dup.ok && dup.errors.some((e) => e.code === 'duplicate-swimmer'), dup.errors);

const noId = validateSquad({ meet: MEET, event: EVENT_9A, legs: [fourBoys[0], fourBoys[1], fourBoys[2], { ...fourBoys[3], usaSwimmingId: '' }] });
check('a leg without a USA Swimming ID is an error', !noId.ok && noId.errors.some((e) => e.code === 'leg-without-usa-id'), noId.errors);

const girlInBoys = validateSquad({
  meet: MEET, event: EVENT_9A,
  legs: [fourBoys[0], fourBoys[1], fourBoys[2], { ...fourBoys[3], gender: 'F' }],
});
check('a girl in a boys relay is an error', !girlInBoys.ok && girlInBoys.errors.some((e) => e.code === 'leg-sex-mismatch'), girlInBoys.errors);

const tooYoung = validateSquad({
  meet: MEET, event: EVENT_9A,
  legs: [fourBoys[0], fourBoys[1], fourBoys[2], { ...fourBoys[3], dob: '2016-01-01' }],
});
check('a leg below the event age range is an error', !tooYoung.ok && tooYoung.errors.some((e) => e.code === 'leg-too-young'), tooYoung.errors);

const tooOld = validateSquad({
  meet: MEET, event: EVENT_9A,
  legs: [{ ...fourBoys[0], dob: '2008-01-01' }, fourBoys[1], fourBoys[2], fourBoys[3]],
});
check('a leg above the event age range is an error', !tooOld.ok && tooOld.errors.some((e) => e.code === 'leg-too-old'), tooOld.errors);

const overCap = validateSquad({ meet: MEET, event: EVENT_9A, legs: fourBoys, squadsInEvent: 3 });
check('more squads than relayLimitPerClub is an error', !overCap.ok && overCap.errors.some((e) => e.code === 'too-many-squads'), overCap.errors);

// An "Open" relay takes anyone 15+, and a Mixed one takes any sex.
const openEvent = MEET.events[1];
const openSquad = validateSquad({
  meet: MEET, event: openEvent,
  legs: [{ ...fourBoys[0], dob: '2009-01-01' }, { ...fourBoys[1], dob: '2010-01-01' },
    { ...fourBoys[2], dob: '2011-01-01' }, { ...fourBoys[3], dob: '2008-01-01' }],
});
check('an Open relay accepts 15+ swimmers', openSquad.ok === true, openSquad.errors);

const mixed = validateSquad({
  meet: MEET, event: { ...EVENT_9A, gender: 'X', eventSex: 'X' }, legs: fourBoys.slice(0, 3).concat([{ ...fourBoys[3], gender: 'F' }]),
});
check('a Mixed relay accepts both sexes', mixed.ok === true, mixed.errors);

const noAge = validateSquad({
  meet: MEET, event: EVENT_9A,
  legs: [fourBoys[0], fourBoys[1], fourBoys[2], { ...fourBoys[3], dob: null }],
});
check('a leg with an ID but no birth date is a warning, not an error', noAge.ok === true && noAge.warnings.some((w) => w.code === 'leg-age-unknown'), noAge.warnings);

console.log('3. squad → SDIF relay');
const relayRow = squadToSdifRelay({ meet: MEET, event: EVENT_9A, squad: { letter: 'B', legs: fourBoys, seedSeconds: 120.52, courseLetter: 'Y' } });
check('leg order follows the editor, 1..4', relayRow.legs.map((l) => l.order).join(',') === '1,2,3,4', relayRow.legs.map((l) => l.order));
check('the letter is carried through', relayRow.letter === 'B');
check('the event code is carried through', relayRow.eventCode === '9A');
check('ages are computed on the meet age date', relayRow.legs[0].ageAtMeet === 14, relayRow.legs[0].ageAtMeet);
check('the stroke name is passed as-is (the writer maps it)', relayRow.stroke === 'MED');

console.log('4. E0 / F0 in the file');
const text = buildEntrySdif({
  meet: { name: MEET.name, startDate: MEET.startDate, endDate: '2026-12-13', courses: ['SCY'] },
  club: { teamCode: 'PVDRAG', name: 'Dragon Swim Team', abbrev: 'DRAG' },
  entries: [],
  relays: [
    relayRow,
    squadToSdifRelay({ meet: MEET, event: MEET.events[2], squad: { letter: 'A', legs: [1, 2, 3, 4].map((n) => ({ ...boy(n, '2012-01-01'), gender: 'F' })), courseLetter: 'Y' } }),
  ],
});
const records = parseSdif(text);
const e0 = records.filter((r) => r.type === 'E0');
const f0 = records.filter((r) => r.type === 'F0');
check('one E0 per squad', e0.length === 2, e0.length);
check('four F0 per squad', f0.length === 8, f0.length);
check('E0 records come after the individual D records', records.findIndex((r) => r.type === 'E0') > 0);
check('E0 carries the leg count', e0[0].f0Count.trim() === '4', e0[0].f0Count);
check('E0 stroke code 7 = medley relay', e0[0].stroke === '7', e0[0].stroke);
check('E0 stroke code 6 = free relay', e0[1].stroke === '6', e0[1].stroke);
check('E0 carries the relay letter', e0[0].relayLetter === 'B' && e0[1].relayLetter === 'A', [e0[0].relayLetter, e0[1].relayLetter]);
check('E0 carries the team code', e0[0].teamCode.trim() === 'PVDRAG');
check('E0 event age for 13-14', e0[0].eventAge === '1314', e0[0].eventAge);
check('F0 leg order is 1..4 (the document asks for it)', f0.slice(0, 4).map((r) => r.prelimLeg).join('') === '1234', f0.slice(0, 4).map((r) => r.prelimLeg));
check('F0 lines up with its E0 by team + letter', f0.every((r) => r.teamCode.trim() === 'PVDRAG'));
check('F0 names use "Last, First"', f0[0].name.trimEnd() === 'Surname1, Boy1', f0[0].name);
check('F0 carries the 12-character USS#', f0[0].uss.trim() === 'ID1000000000'.slice(0, 12), f0[0].uss);
check('Z0 counts the relay records', records.at(-1).eCount.trim() === '2' && records.at(-1).fCount.trim() === '8', [records.at(-1).eCount, records.at(-1).fCount]);

console.log('5. summary line');
const line = describeSquad({ event: EVENT_9A, squad: { letter: 'A', legs: fourBoys } });
check('describeSquad names the event and the legs', line.includes('#9A') && line.includes('Surname1'), line);
check('an empty squad says so', describeSquad({ event: EVENT_9A, squad: { letter: 'A', legs: [] } }).includes('(empty)'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
