// Unit checks for src/utils/reportRelays.js — turning relay squads into the lines
// a printed report shows.
//
// The rule that matters: a medley relay names the swimmer's stroke, a free relay
// gives the leg number. Team Manager prints exactly that (2025 Riley Eaton
// submission, archived in .tmp/meet-entry/samples/reports/rmsc-2025/).
//
// Part of `npm run test:unit`. Deliberately not named *.spec.js so Playwright
// cannot collect it.
import {
  MEDLEY_LEGS, relayStrokeWord, relaySexLabel, relayRoleLabel,
  relayEventTitle, relayLineLabel, buildRelayReport,
} from '../../src/utils/reportRelays.js';

let pass = 0;
let fail = 0;
const check = (name, cond, detail) => {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail !== undefined ? ` -> ${JSON.stringify(detail)}` : ''}`); }
};

console.log('1. words');
check('MED → Medley', relayStrokeWord('MED') === 'Medley', relayStrokeWord('MED'));
check('FR → Free', relayStrokeWord('FR') === 'Free', relayStrokeWord('FR'));
check('lower case input works', relayStrokeWord('fr') === 'Free', relayStrokeWord('fr'));
check('unknown stroke passes through', relayStrokeWord('XYZ') === 'XYZ', relayStrokeWord('XYZ'));
check('sex F → Female', relaySexLabel({ gender: 'F' }) === 'Female');
check('sex M → Male', relaySexLabel({ gender: 'M' }) === 'Male');
check('mixed → empty', relaySexLabel({ gender: 'X' }) === '');

console.log('2. which leg is this swimmer');
check('medley order is back/breast/fly/free', MEDLEY_LEGS.join() === 'Back,Breast,Fly,Free', MEDLEY_LEGS);
check('medley leg 1 → Back', relayRoleLabel('MED', 1) === 'Back');
check('medley leg 2 → Breast', relayRoleLabel('MED', 2) === 'Breast');
check('medley leg 3 → Fly', relayRoleLabel('MED', 3) === 'Fly');
check('medley leg 4 → Free', relayRoleLabel('MED', 4) === 'Free');
check('free relay prints the leg number', ['1', '2', '3', '4'].every((n, i) => relayRoleLabel('FR', i + 1) === n), [1, 2, 3, 4].map((n) => relayRoleLabel('FR', n)));
check('a bad leg index yields nothing', relayRoleLabel('MED', 0) === '' && relayRoleLabel('MED', 9) === '', [relayRoleLabel('MED', 0), relayRoleLabel('MED', 9)]);

console.log('3. titles and labels');
check('medley title', relayEventTitle({ distance: 200, stroke: 'MED' }) === '200 Medley Relay', relayEventTitle({ distance: 200, stroke: 'MED' }));
check('free title', relayEventTitle({ distance: 800, stroke: 'FR' }) === '800 Free Relay', relayEventTitle({ distance: 800, stroke: 'FR' }));
check('no distance still reads', relayEventTitle({ stroke: 'FR' }) === 'Free Relay', relayEventTitle({ stroke: 'FR' }));
check('line label is what TM prints', relayLineLabel({ gender: 'M', ageGroup: '13-14', distance: 200, stroke: 'MED', letter: 'A' })
  === 'Male 13-14 200 Medley Relay A', relayLineLabel({ gender: 'M', ageGroup: '13-14', distance: 200, stroke: 'MED', letter: 'A' }));

console.log('4. building the report');
const leg = (id, first, last, age) => ({ usaSwimmingId: id, firstName: first, lastName: last, ageAtMeet: age });
const SQUADS = [
  {
    id: '9__B', eventNo: 9, eventCode: '9', letter: 'B', gender: 'F', ageGroup: '13-14',
    distance: 200, stroke: 'MED', seedSeconds: 130.5, courseLetter: 'Y',
    legs: [leg('AAA', 'Ada', 'Gai', 13), leg('BBB', 'Bea', 'Hu', 13), leg('CCC', 'Cara', 'Li', 13), leg('DDD', 'Dana', 'Mo', 13)],
  },
  {
    id: '9__A', eventNo: 9, eventCode: '9', letter: 'A', gender: 'F', ageGroup: '13-14',
    distance: 200, stroke: 'MED', seedSeconds: 128.0, courseLetter: 'Y',
    legs: [leg('AAA', 'Ada', 'Gai', 13), leg('EEE', 'Eve', 'Ng', 13), leg('FFF', 'Fay', 'Ou', 13), leg('GGG', 'Gia', 'Pi', 13)],
  },
  {
    id: '60__A', eventNo: 60, eventCode: '60', letter: 'A', gender: 'M', ageGroup: '11-12',
    distance: 200, stroke: 'FR', seedSeconds: null, courseLetter: '',
    legs: [leg('HHH', 'Han', 'Qi', 12), leg('III', 'Ian', 'Ru', 12), leg('JJJ', 'Jon', 'Su', 12), leg('KKK', 'Kai', 'Tu', 12)],
  },
];

const report = buildRelayReport(SQUADS);
check('squads come back sorted by event, then letter', report.squads.map((s) => `${s.eventNo}${s.letter}`).join() === '9A,9B,60A', report.squads.map((s) => `${s.eventNo}${s.letter}`));
check('a swimmer on two squads gets two lines', (report.bySwimmer.get('AAA') || []).length === 2, (report.bySwimmer.get('AAA') || []).length);
check('those lines are ordered A then B', report.bySwimmer.get('AAA').map((l) => l.letter).join() === 'A,B', report.bySwimmer.get('AAA').map((l) => l.letter));
check('the role follows the leg position', report.bySwimmer.get('AAA')[0].role === 'Back' && report.bySwimmer.get('BBB')[0].role === 'Breast'
  && report.bySwimmer.get('CCC')[0].role === 'Fly' && report.bySwimmer.get('DDD')[0].role === 'Free',
  ['AAA', 'BBB', 'CCC', 'DDD'].map((id) => report.bySwimmer.get(id)[0].role));
check('a free relay prints the leg number', report.bySwimmer.get('JJJ')[0].role === '3', report.bySwimmer.get('JJJ')[0].role);
check('the label is carried onto the swimmer line', report.bySwimmer.get('BBB')[0].label === 'Female 13-14 200 Medley Relay B', report.bySwimmer.get('BBB')[0].label);

const medleyA = report.squads.find((s) => s.letter === 'A' && s.eventNo === 9);
check('the section entry keeps the relay time', medleyA.seconds === 128 && medleyA.courseLetter === 'Y', medleyA);
check('legs keep their order and names', medleyA.legs.map((l) => `${l.order}${l.name.split(' ').pop()}`).join() === '1Gai,2Ng,3Ou,4Pi', medleyA.legs);
check('a relay with no time reports none', report.squads.find((s) => s.eventNo === 60).seconds === null);

// A gap must not renumber the remaining legs.
const gapped = buildRelayReport([{
  eventNo: 5, eventCode: '5', letter: 'A', gender: 'M', ageGroup: '13-14', distance: 800, stroke: 'FR',
  seedSeconds: 500, courseLetter: 'Y', legs: [leg('X1', 'One'), null, leg('X3', 'Three'), leg('X4', 'Four')],
}]);
check('an empty leg keeps the others numbered', gapped.squads[0].legs.map((l) => l.order).join() === '1,3,4', gapped.squads[0].legs.map((l) => l.order));
check('players with no ID are skipped, not crashed', !gapped.bySwimmer.has(''), [...gapped.bySwimmer.keys()]);

check('an empty squad list is fine', buildRelayReport([]).squads.length === 0 && buildRelayReport(undefined).bySwimmer.size === 0);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);


