// Unit checks for src/utils/meetEligibility.js — the logic that decides which
// events a swimmer may enter at a meet and whether our recorded time clears the
// published line. Pure logic: no network, no Firestore, no DOM.
//
// Numbers below are copied from the real PVS sanction PVI-27-41
// (Riley Eaton Holiday Invitational, Dec 10-13 2026) so a regression in parsing
// or comparison shows up as a real wrong answer, not an abstract one.
//
// Part of `npm run test:unit` (tests/unit/run-all.mjs). Deliberately NOT named
// *.spec.js / *.test.js so Playwright's testMatch cannot collect it.
import {
  parseSwimTimeText, formatSwimSeconds, parseEventCode, ageOnDate,
  ageGroupForMeetAge, enterableGroupsForAgeGroup, buildBestTimesIndex,
  genderKeyOf, evaluateEvent, buildMeetOptions, bonusAllowance,
  isPastDeadline, validateSelection, entryDocId, groupOptionsByDay,
} from '../../src/utils/meetEligibility.js';

let pass = 0;
let fail = 0;
const check = (name, cond, detail) => {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail !== undefined ? ` -> ${JSON.stringify(detail)}` : ''}`); }
};

// ── A trimmed copy of the real meet table ───────────────────────────────
const MEET = {
  name: 'Riley Eaton Holiday Invitational',
  startDate: '2026-12-10',
  endDate: '2026-12-13',
  ageDeterminedOn: '2026-12-10',
  entryDeadline: '2026-12-01T20:00:00-05:00',
  qualifyingPeriodStart: '2024-10-01',
  limits: { maxEvents: 6, maxPerDay: 3 },
  sessions: [
    { id: 'thu-pm', date: '2026-12-10', day: 'Thu', start: '5:20 PM' },
    { id: 'fri-am', date: '2026-12-11', day: 'Fri', start: '8:05 AM' },
    { id: 'fri-pm', date: '2026-12-11', day: 'Fri', start: '1:35 PM' },
    { id: 'sat-pm', date: '2026-12-12', day: 'Sat', start: '1:35 PM' },
  ],
  events: [
    // Thursday distance / relays
    { eventNo: 1, gender: 'F', ageGroup: '13-14', distance: 1650, stroke: 'FR', relay: false, sessionId: 'thu-pm', standards: { SCY: 1159.99, LCM: 1179.99 } },
    { eventNo: 5, gender: 'F', ageGroup: '13-14', distance: 800, stroke: 'FR', relay: true, sessionId: 'thu-pm', standards: { SCY: 514.99, LCM: null } },
    { eventNo: 13, gender: 'F', ageGroup: '11-12', distance: 200, stroke: 'MED', relay: true, sessionId: 'fri-pm', standards: { SCY: 134.99, LCM: null } },
    // Friday 13-14 / Open
    { eventNo: 19, gender: 'F', ageGroup: '13-14', distance: 100, stroke: 'BR', relay: false, sessionId: 'fri-am', standards: { SCY: 76.69, LCM: 82.99 } },
    { eventNo: 21, gender: 'F', ageGroup: 'Open', distance: 100, stroke: 'BR', relay: false, sessionId: 'fri-am', standards: { SCY: 72.49, LCM: 79.49 } },
    // Friday 11-12 / 10&U
    { eventNo: 25, gender: 'F', ageGroup: '11-12', distance: 50, stroke: 'BR', relay: false, sessionId: 'fri-pm', standards: { SCY: 37.79, LCM: 41.29 } },
    { eventNo: 18, gender: 'F', ageGroup: '12&U', distance: 200, stroke: 'BK', relay: false, sessionId: 'fri-pm', standards: { SCY: 158.99, LCM: 173.99 } },
    { eventNo: 34, gender: 'F', ageGroup: '11-12', distance: 100, stroke: 'FR', relay: false, sessionId: 'fri-pm', standards: { SCY: 63.09, LCM: 69.09 } },
    { eventNo: 46, gender: 'F', ageGroup: '11-12', distance: 50, stroke: 'FL', relay: false, sessionId: 'fri-pm', standards: { SCY: 32.19, LCM: 35.19 } },
    // Sunday 10&U — 100 IM has no LCM line at all in the real table
    { eventNo: 139, gender: 'F', ageGroup: '10&U', distance: 100, stroke: 'IM', relay: false, sessionId: 'sat-pm', standards: { SCY: 82.79, LCM: null } },
  ],
};

const BEST_TIMES = [
  // Fast enough: 36.60 <= 37.79 (11-12 50 breast line)
  { eventCode: '50 BR SCY', swimTime: '36.60', swimDate: '2026-10-24T00:00:00' },
  // Fast enough: 57.92 <= 63.09
  { eventCode: '100 FR SCY', swimTime: '57.92', swimDate: '2026-10-24T00:00:00' },
  // Slower: 33.10 > 32.19, gap 0.91
  { eventCode: '50 FL SCY', swimTime: '33.10', swimDate: '2026-10-11T00:00:00' },
  // Only a long-course time on record for 200 back
  { eventCode: '200 BK LCM', swimTime: '2:48.20', swimDate: '2026-06-27T00:00:00' },
  // Outside the qualifying window (before 2024-10-01) -> must be ignored
  { eventCode: '100 BR SCY', swimTime: '1:10.00', swimDate: '2023-02-04T00:00:00' },
];

console.log('1. time parsing / formatting');
check('"1:12.49" -> 72.49', parseSwimTimeText('1:12.49') === 72.49, parseSwimTimeText('1:12.49'));
check('"57.92" -> 57.92', parseSwimTimeText('57.92') === 57.92);
check('number passes through', parseSwimTimeText(57.92) === 57.92);
check('null -> null', parseSwimTimeText(null) === null);
check('garbage -> null', parseSwimTimeText('--') === null);
check('72.49 -> "1:12.49"', formatSwimSeconds(72.49) === '1:12.49', formatSwimSeconds(72.49));
check('57.92 -> "57.92"', formatSwimSeconds(57.92) === '57.92', formatSwimSeconds(57.92));
check('1159.99 -> "19:19.99"', formatSwimSeconds(1159.99) === '19:19.99', formatSwimSeconds(1159.99));
check('parseEventCode "100 BR SCY"', JSON.stringify(parseEventCode('100 BR SCY')) === '{"distance":100,"stroke":"BR","course":"SCY"}');
check('parseEventCode rejects prose', parseEventCode('100 breast') === null);
check('genderKeyOf female/female/F', genderKeyOf('female') === 'F' && genderKeyOf('F') === 'F');
check('genderKeyOf male -> M', genderKeyOf('male') === 'M');
check('genderKeyOf empty -> null', genderKeyOf('') === null);

console.log('2. age on meet day (not "age today")');
check('dob 2014-06-01 on 2026-12-10 -> 12', ageOnDate('2014-06-01', '2026-12-10') === 12, ageOnDate('2014-06-01', '2026-12-10'));
check('birthday tomorrow still the younger age', ageOnDate('2013-12-11', '2026-12-10') === 12, ageOnDate('2013-12-11', '2026-12-10'));
check('birthday yesterday -> 13', ageOnDate('2013-12-09', '2026-12-10') === 13, ageOnDate('2013-12-09', '2026-12-10'));
check('birthday ON meet day -> 13', ageOnDate('2013-12-10', '2026-12-10') === 13, ageOnDate('2013-12-10', '2026-12-10'));
check('no dob -> null', ageOnDate(null, '2026-12-10') === null);

console.log('3. age group mapping');
check('9 -> 10&U', ageGroupForMeetAge(9) === '10&U');
check('10 -> 10&U', ageGroupForMeetAge(10) === '10&U');
check('11 -> 11-12', ageGroupForMeetAge(11) === '11-12');
check('12 -> 11-12', ageGroupForMeetAge(12) === '11-12');
check('13 -> 13-14', ageGroupForMeetAge(13) === '13-14');
check('14 -> 13-14', ageGroupForMeetAge(14) === '13-14');
check('15 -> Open', ageGroupForMeetAge(15) === 'Open');
check('17 -> Open', ageGroupForMeetAge(17) === 'Open');
check('10&U also enters 12&U', JSON.stringify(enterableGroupsForAgeGroup('10&U')) === '["10&U","12&U","Open"]', enterableGroupsForAgeGroup('10&U'));
check('13-14 does not enter 12&U but may enter Open', JSON.stringify(enterableGroupsForAgeGroup('13-14')) === '["13-14","Open"]', enterableGroupsForAgeGroup('13-14'));
check('15+ only has Open', JSON.stringify(enterableGroupsForAgeGroup('Open')) === '["Open"]');

console.log('4. best-times index');
const index = buildBestTimesIndex(BEST_TIMES, { qualifyingPeriodStart: '2024-10-01' });
check('50 BR indexed from SCY', index.SCY.get('50 BR')?.seconds === 36.60, index.SCY.get('50 BR'));
check('200 BK indexed only as LCM', !!index.LCM.get('200 BK') && !index.SCY.get('200 BK'));
check('pre-2024 100 BR kept out of SCY index', !index.SCY.get('100 BR'));
check('pre-2024 100 BR remembered as stale', index.outOfWindow.get('100 BR')?.seconds === 70, index.outOfWindow.get('100 BR'));

console.log('5. evaluateEvent');
const ev = (no) => MEET.events.find((e) => e.eventNo === no);
const evOthers = (e) => MEET.events.find((x) => x.gender === e.gender && x.ageGroup === e.ageGroup && x.distance === e.distance && x.stroke === e.stroke);
check('50 BR 36.60 vs line 37.79 -> qualified', evaluateEvent(evOthers(ev(25)), index).state === 'qualified');
check('50 FL 33.10 vs line 32.19 -> slower', evaluateEvent(evOthers(ev(46)), index).state === 'slower');
check('slower gap is +0.91', evaluateEvent(evOthers(ev(46)), index).gapSeconds === 0.91, evaluateEvent(evOthers(ev(46)), index).gapSeconds);
const back = evaluateEvent(MEET.events.find((e) => e.eventNo === 18), index);
check('200 BK: LCM-only time qualifies against the LCM line', back.state === 'qualified' && back.bestCourse === 'LCM', back);
check('200 BK: shows the LCM line, not the SCY one', back.standardSeconds === 173.99, back.standardSeconds);
const im = evaluateEvent(evOthers(ev(139)), index);
check('100 IM without any time -> no-time (not "too slow")', im.state === 'no-time', im);
check('no-time still reports that a line exists', im.noStandard === false);
const staleOnly = evaluateEvent({ distance: 100, stroke: 'BR', standards: { SCY: 76.69, LCM: 82.99 } }, index);
check('stale time surfaces the old swim instead of pretending nothing exists', staleOnly.state === 'no-time' && staleOnly.staleSeconds === 70, staleOnly);
const noLine = evaluateEvent({ distance: 500, stroke: 'FR', standards: { SCY: null, LCM: null } }, index);
check('event with no published line -> noStandard', noLine.noStandard === true, noLine);
check('SCY preferred when both courses qualify', (() => {
  const both = buildBestTimesIndex([
    { eventCode: '100 BR SCY', swimTime: '1:15.00', swimDate: '2026-01-01' },
    { eventCode: '100 BR LCM', swimTime: '1:22.00', swimDate: '2026-01-01' },
  ], { qualifyingPeriodStart: '2024-10-01' });
  return evaluateEvent({ distance: 100, stroke: 'BR', standards: { SCY: 76.69, LCM: 82.99 } }, both).bestCourse === 'SCY';
})());

console.log('6. buildMeetOptions');
const girl12 = { firstName: 'Test', lastName: 'Girl', dob: '2014-06-01', gender: 'female', usaSwimmingId: 'AAAA1111' };
const ctx = buildMeetOptions({ meet: MEET, swimmer: girl12, bestTimes: BEST_TIMES });
check('age on meet day', ctx.age === 12, ctx.age);
check('group 11-12', ctx.ageGroup === '11-12', ctx.ageGroup);
check('can enter', ctx.canEnter === true, ctx.blocked);
check('11-12 girl gets 4 own-group individual events (25, 18, 34, 46)', ctx.individual.filter((o) => !o.isOpenGroup).length === 4, ctx.individual.map((o) => o.label));
check('12&U event is included', ctx.individual.some((o) => o.ageGroup === '12&U'));
check('13-14 event is NOT included', !ctx.individual.some((o) => o.ageGroup === '13-14'));
check('relay rows are split out', ctx.relays.length === 1 && ctx.relays[0].eventNo === 13);
check('qualified count = 3 (50BR, 100FR, 200BK-LCM)', ctx.qualifiedCount === 3, ctx.qualifiedCount);
check('Open events ARE offered to a 12-year-old but flagged', ctx.individual.some((o) => o.isOpenGroup), ctx.individual.map((o) => `${o.ageGroup}:${o.label}`));
check('the Open 100 breast row is flagged isOpenGroup', ctx.individual.find((o) => o.eventNo === 21)?.isOpenGroup === true);

const noId = buildMeetOptions({ meet: MEET, swimmer: { ...girl12, usaSwimmingId: '' }, bestTimes: [] });
check('no USA ID -> blocked[no-usa-id] and canEnter=false', !noId.canEnter && noId.blocked.includes('no-usa-id'), noId.blocked);

const boy14 = { firstName: 'Test', lastName: 'Boy', dob: '2012-03-03', gender: 'male', usaSwimmingId: 'BBBB2222' };
const ctxBoy = buildMeetOptions({ meet: MEET, swimmer: boy14, bestTimes: [] });
check('boys see only boys events (none in this trimmed table)', ctxBoy.individual.length === 0 && ctxBoy.relays.length === 0);

const girl15 = buildMeetOptions({ meet: MEET, swimmer: { ...girl12, dob: '2011-01-01' }, bestTimes: [] });
check('15-year-old maps to Open and sees the Open 100 BR', girl15.ageGroup === 'Open' && girl15.individual.some((o) => o.eventNo === 21), girl15.individual.map((o) => o.eventNo));

console.log('7. validateSelection');
const pick = (keys) => validateSelection({ meet: MEET, context: ctx, selected: keys });
const fourSameDay = pick(['25|11-12', '18|12&U', '34|11-12', '46|11-12']);
check('4 events on the same day -> too-many-per-day error', fourSameDay.errors.some((e) => e.code === 'too-many-per-day'), fourSameDay.errors);
check('same 4 are not rejected for total count', !fourSameDay.errors.some((e) => e.code === 'too-many-events'));
const slower = pick(['46|11-12']);
check('slower-than-line is a WARNING, not an error', slower.ok && slower.warnings.some((w) => w.code === 'slower-than-line'), slower);
check('warning carries the gap', slower.warnings.find((w) => w.code === 'slower-than-line')?.gapSeconds === 0.91);
check('warning carries the bonus allowance (3 qualifiers -> 1)', slower.warnings.find((w) => w.code === 'slower-than-line')?.bonusAllowed === 1);

// A swimmer with a USA ID may still have no time on record for a given event —
// the meet refuses "NT", so a typed seed time is required before submitting.
const ctxNoTime = {
  ...ctx,
  individual: [
    ...ctx.individual,
    { key: '139|10&U', eventNo: 139, ageGroup: '10&U', distance: 100, stroke: 'IM', relay: false,
      day: '2026-12-12', sessionId: 'sat-pm', label: '100 IM', standards: { SCY: 82.79, LCM: null },
      isOpenGroup: false, state: 'no-time', bestCourse: null, bestSeconds: null, gapSeconds: null },
  ],
  relays: [],
};
const noType = validateSelection({ meet: MEET, context: ctxNoTime, selected: ['139|10&U'] });
check('no time on record + nothing typed -> missing-seed-time error', !noType.ok && noType.errors.some((e) => e.code === 'missing-seed-time'), noType.errors);
const typed = validateSelection({ meet: MEET, context: ctxNoTime, selected: ['139|10&U'], manualTimes: { '139|10&U': '1:21.50' } });
check('typed seed time clears the error and becomes a warning', typed.ok && typed.warnings.some((w) => w.code === 'manual-time'), typed);
const typedBad = validateSelection({ meet: MEET, context: ctxNoTime, selected: ['139|10&U'], manualTimes: { '139|10&U': 'abc' } });
check('unparsable typed time -> bad-seed-time error', !typedBad.ok && typedBad.errors.some((e) => e.code === 'bad-seed-time'), typedBad.errors);
const relayPick = pick(['13|11-12']);
check('family cannot pick a relay', !relayPick.ok && relayPick.errors.some((e) => e.code === 'relay-coach-only'), relayPick.errors);
const unknown = pick(['999|11-12']);
check('unknown event key is an error', !unknown.ok && unknown.errors.some((e) => e.code === 'unknown-event'));

const ctxBig = { ...ctx, individual: Array.from({ length: 8 }, (_, i) => ({
  key: `${100 + i}|11-12`, eventNo: 100 + i, ageGroup: '11-12', distance: 100 + i, stroke: 'FR',
  relay: false, day: `2026-12-${10 + (i % 4)}`, sessionId: 'fri-pm', label: `${100 + i} Free`,
  standards: { SCY: 60, LCM: null }, isOpenGroup: false, state: 'qualified',
})), relays: [] };
const seven = validateSelection({ meet: MEET, context: ctxBig, selected: ctxBig.individual.slice(0, 7).map((o) => o.key) });
check('7 events -> too-many-events error', seven.errors.some((e) => e.code === 'too-many-events'), seven.errors);
check('6 events pass the total limit exactly', !pick(['25|11-12', '18|12&U', '34|11-12']).errors.some((e) => e.code === 'too-many-events'));

console.log('8. bonus allowance (PVS 27-41 rule)');
check('0 qualifiers -> 0 bonus', bonusAllowance(0) === 0);
check('1 qualifier -> 2 bonus', bonusAllowance(1) === 2);
check('2 qualifiers -> 2 bonus', bonusAllowance(2) === 2);
check('3 qualifiers -> 1 bonus', bonusAllowance(3) === 1);
check('5 qualifiers -> 1 bonus', bonusAllowance(5) === 1);
check('6 qualifiers -> 0 bonus', bonusAllowance(6) === 0);

console.log('9. deadline');
check('before 8:00 PM on Dec 1 -> open', isPastDeadline(MEET, new Date('2026-12-01T19:59:00-05:00')) === false);
check('after 8:00 PM on Dec 1 -> closed', isPastDeadline(MEET, new Date('2026-12-01T20:01:00-05:00')) === true);
check('meet without a deadline never closes', isPastDeadline({}, new Date('2030-01-01')) === false);

console.log('10. entry document ids');
check('family + USA ID', entryDocId('uid123', 'd2754213666c4f') === 'uid123__D2754213666C4F', entryDocId('uid123', 'd2754213666c4f'));
check('no USA ID -> null (cannot enter)', entryDocId('uid123', '') === null);
check('no family -> null', entryDocId('', 'ABC') === null);

console.log('11. day/session grouping');
const days = groupOptionsByDay(ctx.individual);
check('groups by day', days.map((d) => d.day).join(',') === '2026-12-11', days.map((d) => d.day));
// Two sessions on the same day stay separate (the Open 100 breast lives in the
// 13-14/Open morning session, the 11-12 rows in the afternoon one).
check('keeps session buckets', days[0].sessions.size === 2, [...days[0].sessions.keys()]);
check('afternoon bucket holds the four 11-12 rows', days[0].sessions.get('fri-pm')?.options.length === 4, days[0].sessions.get('fri-pm')?.options.length);
check('morning bucket holds the Open row', days[0].sessions.get('fri-am')?.options.length === 1);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
