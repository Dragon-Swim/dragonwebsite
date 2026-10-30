// Unit checks for src/utils/relaySeedTime.js — the relay time Meet Manager will
// derive from four legs, and whether the coach's typed number agrees with it.
//
// The rule being modelled (docs/meet-entries.md §6.7.1): a relay time is the sum
// of its four legs' best times, at distance = event.distance / 4, with a medley
// relay swimming back / breast / fly / free. A missing leg time means "unknown",
// never "slow".
//
// Part of `npm run test:unit`. Deliberately not named *.spec.js so Playwright
// cannot collect it.
import {
  relayLegSpecs, relayCourse, computeRelaySeedTime, compareRelaySeed, MEDLEY_LEG_STROKES,
} from '../../src/utils/relaySeedTime.js';

let pass = 0;
let fail = 0;
const check = (name, cond, detail) => {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail !== undefined ? ` -> ${JSON.stringify(detail)}` : ''}`); }
};

const MED_200 = { distance: 200, stroke: 'MED', standards: { SCY: 129.99, LCM: null } };
const FREE_800 = { distance: 800, stroke: 'FR', standards: { SCY: 443.99, LCM: null } };
const FREE_200 = { distance: 200, stroke: 'FR', standards: { SCY: null, LCM: 130.0 } };

console.log('1. what each leg swims');
check('medley legs are back/breast/fly/free', MEDLEY_LEG_STROKES.join() === 'BK,BR,FL,FR', MEDLEY_LEG_STROKES);
const medSpecs = relayLegSpecs(MED_200);
check('medley 200 → four 50s', medSpecs.map((s) => s.distance).join() === '50,50,50,50', medSpecs);
check('medley strokes in order', medSpecs.map((s) => s.stroke).join() === 'BK,BR,FL,FR', medSpecs.map((s) => s.stroke));
check('free relay is four freestyle legs', relayLegSpecs(FREE_800).map((s) => s.stroke).join() === 'FR,FR,FR,FR');
check('free 800 → four 200s', relayLegSpecs(FREE_800).map((s) => s.distance).join() === '200,200,200,200');
check('no distance → no specs', relayLegSpecs({ stroke: 'FR' }).length === 0);
check('order is 1-based', medSpecs.map((s) => s.order).join() === '1,2,3,4');

console.log('2. which course');
check('the event’s own course wins', relayCourse(MED_200) === 'SCY', relayCourse(MED_200));
check('a course with no line is skipped', relayCourse(FREE_200) === 'LCM', relayCourse(FREE_200));
check('nothing published → SCY', relayCourse({ standards: {} }) === 'SCY', relayCourse({ standards: {} }));

console.log('3. summing four legs');
const leg = (id, first, last) => ({ usaSwimmingId: id, firstName: first, lastName: last });
const LEGS = [leg('AAA', 'Ada', 'Gai'), leg('BBB', 'Bea', 'Hu'), leg('CCC', 'Cara', 'Li'), leg('DDD', 'Dana', 'Mo')];
const TIMES = new Map([
  ['AAA', [{ eventCode: '50 BK SCY', swimTime: '33.00', swimDate: '2026-10-24' }]],
  ['BBB', [{ eventCode: '50 BR SCY', swimTime: '38.50', swimDate: '2026-10-24' }]],
  ['CCC', [{ eventCode: '50 FL SCY', swimTime: '31.00', swimDate: '2026-10-24' }]],
  ['DDD', [{ eventCode: '50 FR SCY', swimTime: '30.49', swimDate: '2026-10-24' }]],
]);

const sum = computeRelaySeedTime({ event: MED_200, legs: LEGS, bestTimesById: TIMES, qualifyingPeriodStart: '2024-10-01' });
check('all four legs present → total', sum.ok && Math.abs(sum.seconds - 132.99) < 0.001, sum.seconds);
check('seconds are sums of seconds, not strings', Math.abs(sum.seconds - (33 + 38.5 + 31 + 30.49)) < 0.001);
check('course comes back', sum.course === 'SCY', sum.course);
check('each part keeps its stroke and distance', sum.parts.map((p) => `${p.distance}${p.stroke}`).join() === '50BK,50BR,50FL,50FR', sum.parts.map((p) => `${p.distance}${p.stroke}`));
check('a part carries the swim date (proof of time)', sum.parts[0].date === '2026-10-24', sum.parts[0].date);

console.log('4. a missing leg is unknown, not slow');
const noFly = new Map(TIMES);
noFly.set('CCC', []);
const missing = computeRelaySeedTime({ event: MED_200, legs: LEGS, bestTimesById: noFly });
check('no total when a leg has no time', missing.ok === false && missing.seconds === null, missing.seconds);
check('the missing leg is named', missing.missingOrders.join() === '3', missing.missingOrders);
check('the other parts still report their times', missing.parts[0].seconds === 33 && missing.parts[1].seconds === 38.5, missing.parts.map((p) => p.seconds));

console.log('5. a free relay uses each leg’s 200 free');
const freeTimes = new Map(LEGS.map((l, i) => [l.usaSwimmingId, [
  { eventCode: '100 FR SCY', swimTime: '1:05.00', swimDate: '2026-10-24' },
  { eventCode: '200 FR SCY', swimTime: `2:${20 + i}.00`, swimDate: '2026-10-24' },
]]));
const free = computeRelaySeedTime({ event: FREE_800, legs: LEGS, bestTimesById: freeTimes });
check('200s are used, not 100s', free.ok && Math.abs(free.seconds - (140 + 141 + 142 + 143)) < 0.001, free.seconds);

console.log('6. comparing what the coach typed');
check('equal within a hundredth → match', compareRelaySeed({ typedSeconds: 132.99, computedSeconds: 132.99 }).state === 'match');
check('floating noise is not a difference', compareRelaySeed({ typedSeconds: 132.9900000001, computedSeconds: 132.99 }).state === 'match');
check('a whole hundredth apart IS a difference', compareRelaySeed({ typedSeconds: 133.0, computedSeconds: 132.99 }).state === 'differs',
  compareRelaySeed({ typedSeconds: 133.0, computedSeconds: 132.99 }));
const differs = compareRelaySeed({ typedSeconds: 140, computedSeconds: 132.99 });
check('differing → differs, with the delta', differs.state === 'differs' && differs.deltaSeconds === 7.01, differs);
check('nothing typed → suggest', compareRelaySeed({ typedSeconds: null, computedSeconds: 132.99 }).state === 'no-typed');
check('nothing summed → no-sum, even if typed', compareRelaySeed({ typedSeconds: 140, computedSeconds: null }).state === 'no-sum',
  compareRelaySeed({ typedSeconds: 140, computedSeconds: null }).state);

console.log('7. absent inputs do not throw');
check('no legs', computeRelaySeedTime({ event: MED_200 }).missingOrders.join() === '1,2,3,4');
check('no event', computeRelaySeedTime({}).ok === false);
check('no best times at all', computeRelaySeedTime({ event: MED_200, legs: LEGS }).ok === false);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
