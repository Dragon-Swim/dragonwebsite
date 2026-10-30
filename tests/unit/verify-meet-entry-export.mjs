// Unit checks for src/utils/meetEntryExport.js — the layer that turns confirmed
// entries into the rows an entry file is built from.
//
// The one behaviour that matters most here: seed times are re-resolved at export
// time, because the value snapshotted when the family submitted goes stale as
// soon as the swimmer races again. Numbers below come from the real PVI-27-41
// table (Dec 10-13 2026) so a regression surfaces as a wrong swimming time.
//
// Part of `npm run test:unit`. Deliberately not named *.spec.js so Playwright
// cannot collect it.
import {
  buildExportRows, resolveSeedTime, validateExport, summarizeExport,
  toWorksheetCsv, groupRowsBySwimmer, bestTimeFor, findMeetEvent, csvCell,
  WORKSHEET_COLUMNS,
} from '../../src/utils/meetEntryExport.js';
import { bonusAllowance, countQualifiedEvents } from '../../src/utils/meetEligibility.js';

let pass = 0;
let fail = 0;
const check = (name, cond, detail) => {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail !== undefined ? ` -> ${JSON.stringify(detail)}` : ''}`); }
};

// ── Fixture: a trimmed slice of PVI-27-41 ────────────────────────────────
const MEET = {
  name: 'Riley Eaton Holiday Invitational',
  startDate: '2026-12-10',
  ageDeterminedOn: '2026-12-10',
  entryDeadline: '2026-12-01T20:00:00-05:00',
  qualifyingPeriodStart: '2024-10-01',
  limits: { maxEvents: 2, maxPerDay: 2 },
  sessions: [
    { id: 'fri-pm', date: '2026-12-11', day: 'Fri', start: '1:35 PM' },
    { id: 'sat-pm', date: '2026-12-12', day: 'Sat', start: '1:35 PM' },
  ],
  events: [
    { eventNo: 34, gender: 'F', ageGroup: '11-12', ageMin: 11, ageMax: 12, openToAll: false,
      distance: 100, stroke: 'FR', relay: false, sessionId: 'fri-pm', standards: { SCY: 63.09, LCM: 69.09 } },
    { eventNo: 46, gender: 'F', ageGroup: '11-12', ageMin: 11, ageMax: 12, openToAll: false,
      distance: 50, stroke: 'FL', relay: false, sessionId: 'fri-pm', standards: { SCY: 32.19, LCM: 35.19 } },
    { eventNo: 21, gender: 'X', ageGroup: 'Open', ageMin: 15, ageMax: 109, openToAll: true,
      distance: 100, stroke: 'BR', relay: false, sessionId: 'sat-pm', standards: { SCY: 72.49, LCM: 79.49 } },
  ],
};

const A_ID = 'AAAA1111';
const C_ID = '';          // entry with no USA Swimming ID
const D_ID = 'DDDD4444';
const E_ID = 'EEEE5555';

// Fast 100 free (61.00 clears the 63.09 line), slow 50 fly (33.50 is a bonus swim).
const BEST_TIMES = {
  [A_ID]: [
    { eventCode: '100 FR SCY', swimTime: '61.00', swimDate: '2026-10-24' },
    { eventCode: '50 FL SCY', swimTime: '33.50', swimDate: '2026-10-24' },
  ],
  [E_ID]: [],   // nothing on file, nothing typed -> missing
};

const entry = (o) => ({
  meetId: 'meet1', familyId: 'fam1', status: 'confirmed', gender: 'F', ageAtMeet: 12, ageGroup: '11-12', ...o,
});

const ENTRIES = [
  // A: stored 63.00, but the records now say 61.00 -> refreshed
  entry({
    id: 'fam1__AAAA1111', usaSwimmingId: A_ID, swimmerName: 'Test Swimmer',
    events: [{ eventNo: 34, ageGroup: '11-12', distance: 100, stroke: 'FR', sessionId: 'fri-pm',
      course: 'SCY', seedTime: '1:03.00', seedSeconds: 63.0, source: 'db', proofDate: '2026-09-01' }],
  }),
  // B: not confirmed -> held back
  entry({
    id: 'fam2__BBBB2222', usaSwimmingId: 'BBBB2222', swimmerName: 'Waiting Kid', status: 'submitted',
    events: [{ eventNo: 34, ageGroup: '11-12', distance: 100, stroke: 'FR', sessionId: 'fri-pm', seedTime: '1:05.00', seedSeconds: 65.0 }],
  }),
  // C: confirmed but no USA Swimming ID -> cannot be keyed into an entry file
  entry({
    id: 'fam3__', usaSwimmingId: C_ID, swimmerName: 'No Id Kid',
    events: [{ eventNo: 34, ageGroup: '11-12', distance: 100, stroke: 'FR', sessionId: 'fri-pm', seedTime: '1:08.00', seedSeconds: 68.0 }],
  }),
  // D: no time on file, but the family typed one -> manual
  entry({
    id: 'fam4__DDDD4444', usaSwimmingId: D_ID, swimmerName: 'Typed Time Kid',
    events: [{ eventNo: 34, ageGroup: '11-12', distance: 100, stroke: 'FR', sessionId: 'fri-pm',
      course: 'SCY', seedTime: '1:07.50', seedSeconds: 67.5, source: 'manual' }],
  }),
  // E: nothing on file, nothing typed -> missing
  entry({
    id: 'fam5__EEEE5555', usaSwimmingId: E_ID, swimmerName: 'No Time Kid',
    events: [{ eventNo: 46, ageGroup: '11-12', distance: 50, stroke: 'FL', sessionId: 'fri-pm' }],
  }),
  // F: declined -> held back
  entry({
    id: 'fam6__FFFF6666', usaSwimmingId: 'FFFF6666', swimmerName: 'Not Swimming', status: 'declined',
    events: [],
  }),
];

console.log('1. re-resolving the seed time');
const aEvents = ENTRIES[0].events[0];
const resolvedA = resolveSeedTime({ entryEvent: aEvents, entry: ENTRIES[0], meet: MEET, bestTimes: BEST_TIMES[A_ID] });
check('uses the current best time, not the snapshot', resolvedA.seconds === 61.0, resolvedA.seconds);
check('marked as refreshed', resolvedA.changed === true);
check('keeps the stored snapshot for comparison', resolvedA.storedSeedSeconds === 63.0, resolvedA.storedSeedSeconds);
check('delta is negative (faster than what the family saw)', resolvedA.deltaSeconds === -2.0, resolvedA.deltaSeconds);
check('course comes from the record (SCY wins over LCM)', resolvedA.course === 'SCY', resolvedA.course);
check('qualifies against the published line', resolvedA.state === 'qualified', resolvedA.state);
check('carries the line and the gap', resolvedA.standardSeconds === 63.09 && resolvedA.gapSeconds === -2.09, [resolvedA.standardSeconds, resolvedA.gapSeconds]);
check('proof date comes from the swim', resolvedA.date === '2026-10-24', resolvedA.date);

const slowFly = resolveSeedTime({
  entryEvent: { eventNo: 46, ageGroup: '11-12', distance: 50, stroke: 'FL', sessionId: 'fri-pm', seedTime: '33.50', seedSeconds: 33.5 },
  entry: ENTRIES[0], meet: MEET, bestTimes: BEST_TIMES[A_ID],
});
check('slower than the line -> bonus state', slowFly.state === 'slower-than-line', slowFly.state);
check('unchanged snapshot is not flagged', slowFly.changed === false, slowFly.deltaSeconds);

const dResolved = resolveSeedTime({ entryEvent: ENTRIES[3].events[0], entry: ENTRIES[3], meet: MEET, bestTimes: [] });
check('no record + typed time -> manual', dResolved.state === 'manual' && dResolved.seconds === 67.5, dResolved.state);
check('manual row keeps the typed course', dResolved.course === 'SCY', dResolved.course);

const eResolved = resolveSeedTime({ entryEvent: ENTRIES[4].events[0], entry: ENTRIES[4], meet: MEET, bestTimes: [] });
check('no record + nothing typed -> missing', eResolved.state === 'missing' && eResolved.seconds === null, eResolved.state);

// A swim outside the qualifying window must not be used as the seed time.
const oldOnly = resolveSeedTime({
  entryEvent: ENTRIES[3].events[0], entry: ENTRIES[3], meet: MEET,
  bestTimes: [{ eventCode: '100 FR SCY', swimTime: '59.00', swimDate: '2019-05-05' }],
});
check('a swim older than qualifyingPeriodStart is ignored (falls back to manual)', oldOnly.state === 'manual', oldOnly.state);
const noWindow = resolveSeedTime({
  entryEvent: ENTRIES[3].events[0], entry: ENTRIES[3], meet: { ...MEET, qualifyingPeriodStart: null },
  bestTimes: [{ eventCode: '100 FR SCY', swimTime: '59.00', swimDate: '2019-05-05' }],
});
check('…but is used when the meet sets no window', noWindow.state === 'qualified' && noWindow.seconds === 59, noWindow.state);

console.log('2. mixed (X) event rows');
const mixed = findMeetEvent(MEET, { eventNo: 21, ageGroup: 'Open', gender: 'F' });
check('a female entry matches the mixed row', mixed?.eventNo === 21 && mixed?.gender === 'X', mixed?.gender);
check('an unknown event number yields null', findMeetEvent(MEET, { eventNo: 999, ageGroup: 'Open', gender: 'F' }) === null);

console.log('3. which entries go out');
const built = buildExportRows({ meet: MEET, entries: ENTRIES, bestTimesById: BEST_TIMES });
check('only confirmed entries become rows', built.rows.length === 3, built.rows.length);
check('submitted / declined are held back with a reason', built.excluded.length === 2, built.excluded.map((e) => e.status));
check('the reason is human readable', built.excluded.some((e) => e.reason === 'waiting for the coach to confirm'), built.excluded.map((e) => e.reason));
check('an entry without a USA Swimming ID is separated', built.noId.length === 1 && built.noId[0].swimmerName === 'No Id Kid', built.noId);
check('stale times are collected for the confirmation sheet', built.staleTimes.length === 1 && built.staleTimes[0].swimmerName === 'Test Swimmer', built.staleTimes.map((r) => r.swimmerName));
check('rows carry the day from the session table', built.rows.find((r) => r.eventNo === 46)?.day === '2026-12-11', built.rows.map((r) => r.day));
check('rows are sorted by event, then age group, then surname', built.rows.map((r) => r.eventNo).join() === '34,34,46', built.rows.map((r) => r.eventNo));

const rowA = built.rows.find((r) => r.usaSwimmingId === A_ID);
check('row keeps both the new and the stored time', rowA.seconds === 61 && rowA.storedSeedSeconds === 63, [rowA.seconds, rowA.storedSeedSeconds]);
check('row has a readable change note', rowA.changedText === '1:03.00 → 1:01.00', rowA.changedText);
check('row carries a display time string', rowA.seedTimeText === '1:01.00', rowA.seedTimeText);
check('row exposes the cut-off as text', rowA.standardText === '1:03.09', rowA.standardText);
check('relay flag is carried through', rowA.relay === false);
// The printed team report labels each line with the *event's* sex, which is not
// the swimmer's sex for a mixed (X) event.
check('row knows the event sex, not just the swimmer sex', rowA.eventSex === 'F' && rowA.eventSexLabel === 'Female', [rowA.eventSex, rowA.eventSexLabel]);
check('time carries the course letter the report suffixes', rowA.courseLetter === 'Y', rowA.courseLetter);
const mixedResolved = resolveSeedTime({
  entryEvent: { eventNo: 21, ageGroup: 'Open', distance: 100, stroke: 'BR', sessionId: 'sat-pm', seedTime: '1:20.00', seedSeconds: 80 },
  entry: { gender: 'F', ageGroup: 'Open' }, meet: MEET, bestTimes: [],
});
check('a mixed event is labelled Mixed', mixedResolved.eventSexLabel === 'Mixed', mixedResolved.eventSexLabel);

// The confirmation sheet also runs *before* the coach confirms, so the caller can
// widen the statuses — but that must never change the default: an entry file may
// only ever carry confirmed rows.
const preview = buildExportRows({
  meet: MEET, entries: ENTRIES, bestTimesById: BEST_TIMES,
  statuses: ['confirmed', 'submitted', 'draft', 'declined'],
});
check('a caller may widen which statuses become rows', preview.rows.length === 4, preview.rows.length);
check('…and then nothing is held back', preview.excluded.length === 0, preview.excluded.map((e) => e.status));
check('…but an entry with no USA Swimming ID stays separated', preview.noId.length === 1, preview.noId);
check('…rows carry a human status label for the sheet', preview.rows.every((r) => r.statusLabel), preview.rows.map((r) => r.statusLabel));
check('the default still exports confirmed only', built.rows.every((r) => r.status === 'confirmed'));

console.log('4. validation');
const validation = validateExport({ rows: built.rows, meet: MEET, excluded: built.excluded, noId: built.noId });
check('missing seed time is an error (the meet refuses NT)', validation.errors.some((e) => e.code === 'missing-seed-time'), validation.errors.map((e) => e.code));
check('no USA Swimming ID is an error', validation.errors.some((e) => e.code === 'no-usa-id'));
check('non-confirmed entries are only a warning', validation.warnings.some((w) => w.code === 'not-confirmed'), validation.warnings.map((w) => w.code));
check('refreshed times are surfaced as a warning', validation.warnings.some((w) => w.code === 'seed-time-refreshed'));
check('the export is blocked until the errors are fixed', validation.ok === false);

const cleanRows = built.rows.filter((r) => r.state !== 'missing');
const clean = validateExport({ rows: cleanRows, meet: MEET, excluded: [], noId: [] });
check('a clean export passes', clean.ok === true, clean.errors);

// Limits are re-checked on the exported set, not trusted from selection time.
const threeForA = [
  ...cleanRows,
  { ...rowA, eventNo: 34, day: '2026-12-11' },
  { ...rowA, eventNo: 46, day: '2026-12-11' },
];
const overMax = validateExport({ rows: threeForA, meet: MEET, excluded: [], noId: [] });
check('3 rows for one swimmer breaks maxEvents=2', overMax.errors.some((e) => e.code === 'too-many-events'), overMax.errors.map((e) => e.code));
const perDay = validateExport({ rows: threeForA, meet: { ...MEET, limits: { maxEvents: 9, maxPerDay: 2 } }, excluded: [], noId: [] });
check('3 rows on one day breaks maxPerDay=2', perDay.errors.some((e) => e.code === 'too-many-per-day'), perDay.errors.map((e) => e.code));

console.log('5. summary');
const summary = summarizeExport({ rows: cleanRows, excluded: built.excluded, noId: built.noId });
check('row count', summary.rowCount === 2, summary.rowCount);
check('distinct swimmers', summary.swimmerCount === 2, summary.swimmerCount);
check('refreshed count', summary.refreshed === 1, summary.refreshed);
check('held-back count', summary.notConfirmed === 2, summary.notConfirmed);
check('manual count', summary.manual === 1, summary.manual);
check('missing count', summary.missing === 0, summary.missing);

console.log('6. worksheet CSV');
const csv = toWorksheetCsv(cleanRows);
const lines = csv.replace(/^\ufeff/, '').split('\r\n').filter(Boolean);
check('starts with a UTF-8 BOM so Excel reads it as UTF-8', csv.startsWith('\ufeff'));
check('header matches the declared columns', lines[0] === WORKSHEET_COLUMNS.map((c) => csvCell(c.label)).join(','), lines[0]);
check('one line per row plus the header', lines.length === cleanRows.length + 1, lines.length);
check('uses CRLF line endings', csv.includes('\r\n'));
check('every cell is quoted', lines[1].split(',').every((cell) => cell.startsWith('"')), lines[1]);
check('commas and quotes survive escaping', csvCell('Chen, Hao "H"') === '"Chen, Hao ""H"""', csvCell('Chen, Hao "H"'));
check('no BOM when asked for raw text', toWorksheetCsv([], { bom: false }).startsWith('"Event #"'));

console.log('7. per-swimmer grouping (what the confirm sheet renders)');
const groups = groupRowsBySwimmer(cleanRows);
check('one group per swimmer', groups.length === 2, groups.length);
check('groups are sorted by surname', groups.map((g) => g.lastName).join() === 'Kid,Swimmer', groups.map((g) => g.lastName));
check('refreshed count is tracked per swimmer', groups.find((g) => g.usaSwimmingId === A_ID)?.refreshedCount === 1);
check('each group keeps its own events', groups.every((g) => g.events.length >= 1));

console.log('8. best time lookup');
const best = bestTimeFor(BEST_TIMES[A_ID], '100 FR SCY', { qualifyingPeriodStart: '2024-10-01' });
check('finds the best time for an event code', best?.seconds === 61, best);
check('ignores an unparsable code', bestTimeFor(BEST_TIMES[A_ID], 'nonsense') === null);
check('ignores swims outside the window', bestTimeFor([{ eventCode: '100 FR SCY', swimTime: '59.00', swimDate: '2019-05-05' }], '100 FR SCY', { qualifyingPeriodStart: '2024-10-01' }) === null);

// ── 9. bonus events ───────────────────────────────────────────────────────
// PVI-27-41 (Dec 2026), meet sheet p.3: 1-2 qualifying times permit two bonus
// events, 3-5 permit one, 6 permit none. The host checks this and refuses the
// file, so the export must refuse first.
console.log('9. bonus ladder and its use');
check('no qualifying time -> no bonus', bonusAllowance(0) === 0, bonusAllowance(0));
check('1 qualifying time -> 2 bonus', bonusAllowance(1) === 2, bonusAllowance(1));
check('2 qualifying times -> 2 bonus', bonusAllowance(2) === 2, bonusAllowance(2));
check('3..5 qualifying times -> 1 bonus', bonusAllowance(3) === 1 && bonusAllowance(5) === 1, [bonusAllowance(3), bonusAllowance(5)]);
check('6 qualifying times -> none', bonusAllowance(6) === 0, bonusAllowance(6));

// A qualifies only in the 100 free (61.00 vs 63.09); the 50 fly at 33.50 is a bonus swim.
const aQualified = countQualifiedEvents({
  meet: MEET, age: 12, ageGroup: '11-12', gender: 'F', bestTimes: BEST_TIMES[A_ID],
});
check('qualifying count comes from the whole programme', aQualified === 1, aQualified);
check('…and it is what the bonus allowance is built from', bonusAllowance(aQualified) === 2, bonusAllowance(aQualified));

// A meet with four enterable events for this swimmer, so 3 bonus entries can be built.
const BONUS_MEET = {
  ...MEET,
  limits: { maxEvents: 6, maxPerDay: 6 },
  events: [
    ...MEET.events,
    { eventNo: 48, gender: 'F', ageGroup: '11-12', ageMin: 11, ageMax: 12, openToAll: false,
      distance: 50, stroke: 'BK', relay: false, sessionId: 'sat-pm', standards: { SCY: 34.19, LCM: 39.19 } },
    { eventNo: 52, gender: 'F', ageGroup: '11-12', ageMin: 11, ageMax: 12, openToAll: false,
      distance: 50, stroke: 'BR', relay: false, sessionId: 'sat-pm', standards: { SCY: 38.19, LCM: 43.19 } },
  ],
};
const BONUS_TIMES = {
  [A_ID]: [
    ...BEST_TIMES[A_ID],
    { eventCode: '50 BK SCY', swimTime: '35.00', swimDate: '2026-10-24' },
    { eventCode: '50 BR SCY', swimTime: '39.00', swimDate: '2026-10-24' },
  ],
};
const bonusEntry = (events) => entry({
  id: 'fam1__AAAA1111', usaSwimmingId: A_ID, swimmerName: 'Test Swimmer', events,
});
const ev = (eventNo, distance, stroke) => ({
  eventNo, ageGroup: '11-12', distance, stroke, sessionId: 'sat-pm', course: 'SCY',
  seedTime: '59.99', seedSeconds: 59.99, source: 'db',
});

const twoBonus = buildExportRows({
  meet: BONUS_MEET,
  entries: [bonusEntry([ev(34, 100, 'FR'), ev(46, 50, 'FL'), ev(48, 50, 'BK')])],
  bestTimesById: BONUS_TIMES,
});
const twoBonusCheck = validateExport({ rows: twoBonus.rows, meet: BONUS_MEET });
check('two bonus rows fit the allowance', !twoBonusCheck.errors.some((e) => e.code === 'bonus-exceeded'), twoBonusCheck.errors);
check('they are still called out as bonus entries', twoBonusCheck.warnings.some((w) => w.code === 'bonus-rows'), twoBonusCheck.warnings);

const threeBonus = buildExportRows({
  meet: BONUS_MEET,
  entries: [bonusEntry([ev(34, 100, 'FR'), ev(46, 50, 'FL'), ev(48, 50, 'BK'), ev(52, 50, 'BR')])],
  bestTimesById: BONUS_TIMES,
});
const threeBonusCheck = validateExport({ rows: threeBonus.rows, meet: BONUS_MEET });
const exceeded = threeBonusCheck.errors.find((e) => e.code === 'bonus-exceeded');
check('three bonus rows block the export', threeBonusCheck.ok === false && Boolean(exceeded), threeBonusCheck.errors);
check('the error says how many are allowed', exceeded?.count === 3 && exceeded?.allowed === 2, exceeded);
check('the error names the events', (exceeded?.events || []).join() === '50 Fly,50 Back,50 Breast', exceeded?.events);
check('a blocked swimmer is not also listed as a warning', !threeBonusCheck.warnings.some((w) => w.code === 'bonus-rows'), threeBonusCheck.warnings);

const summaryBonus = summarizeExport({ rows: twoBonus.rows, excluded: [], noId: [] });
check('the summary counts bonus rows separately', summaryBonus.bonusOnly === 2, summaryBonus.bonusOnly);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

