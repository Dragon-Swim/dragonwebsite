// Unit checks for the Volunteer Hours aggregation: src/utils/volunteerHours.js
// Pure logic: no network, no Firestore, no DOM.
//
// Part of `npm run test:unit` (tests/unit/run-all.mjs). Deliberately NOT named
// *.spec.js / *.test.js so Playwright's testMatch cannot collect it — the E2E
// side of this feature is tests/volunteer-hours.spec.js.
//
// Covers the cases the E2E spec cannot cheaply reach: soft-deleted swimmers,
// families with no active swimmer, cross-season records, a deleted meet falling
// back to the stored season snapshot, malformed records, and CSV escaping.

import {
  VOLUNTEER_COLLECTION,
  volunteerDocId,
  normalizeHours,
  roundHours,
  personName,
  familyLabel,
  familySortKey,
  activeSwimmers,
  swimmerDisplayName,
  familyEmails,
  listVolunteerFamilies,
  buildVolunteerSummary,
  buildMeetEntryRows,
  meetTotalHours,
  volunteerStats,
  volunteerSummaryCSV,
  volunteerDetailCSV,
} from '../../src/utils/volunteerHours.js';

let pass = 0;
const failures = [];
function check(label, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) { pass++; return; }
  failures.push(`${label}\n    expected: ${e}\n    actual:   ${a}`);
}
function ok(label, cond) { check(label, !!cond, true); }

// ── Fixtures ────────────────────────────────────────────────────────────────
const meets = [
  { id: 'meetA', name: 'Autumn Classic', startDate: '2025-10-04', season: '2025-2026' },
  { id: 'meetB', name: 'Winter Invite', startDate: '2025-12-06', season: '2025-2026' },
  { id: 'meetC', name: 'Spring Fling', startDate: '2026-03-14', season: '2025-2026' },
  // A meet whose stored season disagrees with its date — the live field must win.
  { id: 'meetD', name: 'Moved Meet', startDate: '2025-11-01', season: '2024-2025' },
];

const registrations = [
  {
    id: 'regChen',
    parent: { firstName: 'Keke', lastName: 'Chen', email: 'Chen@Example.com ' },
    spouse: { firstName: 'Fan', lastName: 'Luo', email: 'luo@example.com' },
    swimmers: [
      { firstName: 'Amy', lastName: 'Chen' },
      { firstName: 'Ben', lastName: 'Chen' },
      { firstName: 'Gone', lastName: 'Chen', deleted: true },
    ],
    parentEmails: ['chen@example.com', 'luo@example.com'],
  },
  {
    id: 'regWang',
    parent: { firstName: 'Wei', lastName: 'Wang' },
    spouse: null,
    swimmers: [{ firstName: 'Cara', lastName: 'Wang' }],
  },
  // Family with no active swimmer — must still be listed, with 0 kids.
  { id: 'regZhou', parent: { firstName: 'Xuan', lastName: 'Zhou' }, swimmers: [{ firstName: 'Kid', lastName: 'Zhou', deleted: true }] },
  // Registered twice into both parent slots by mistake.
  { id: 'regDup', parent: { firstName: 'Same', lastName: 'Person' }, spouse: { firstName: 'Same', lastName: 'Person' }, swimmers: [] },
];

const hours = [
  { id: 'meetA_regChen', meetId: 'meetA', meetName: 'Autumn Classic', season: '2025-2026', familyId: 'regChen', familyLabel: 'Keke Chen & Fan Luo', hours: 3.5, note: 'timing' },
  { id: 'meetB_regChen', meetId: 'meetB', meetName: 'Winter Invite', season: '2025-2026', familyId: 'regChen', familyLabel: 'Keke Chen & Fan Luo', hours: 2 },
  { id: 'meetB_regWang', meetId: 'meetB', meetName: 'Winter Invite', season: '2025-2026', familyId: 'regWang', familyLabel: 'Wei Wang', hours: 1.25 },
  // A record whose meet is gone but whose snapshot says this season → counted.
  { id: 'ghost_regWang', meetId: 'deletedMeet', meetName: 'Vanished Open', season: '2025-2026', familyId: 'regWang', familyLabel: 'Wei Wang', hours: 4 },
  // A record from another season → never counted here.
  { id: 'old_regWang', meetId: 'meetOld', meetName: 'Old Meet', season: '2024-2025', familyId: 'regWang', familyLabel: 'Wei Wang', hours: 9 },
  // Note-only record (no hours) → 0 hours, but still "has a record".
  { id: 'meetA_regZhou', meetId: 'meetA', meetName: 'Autumn Classic', season: '2025-2026', familyId: 'regZhou', familyLabel: 'Xuan Zhou', hours: null, note: 'snack bar, no hours logged' },
  // Re-seasons with its meet: stored 2024-2025, live meet D says 2024-2025 → excluded;
  { id: 'meetD_regChen', meetId: 'meetD', meetName: 'Moved Meet', season: '2025-2026', familyId: 'regChen', familyLabel: 'Keke Chen & Fan Luo', hours: 5 },
  // A family whose registration was deleted; only the snapshot remains.
  { id: 'meetB_regGhost', meetId: 'meetB', meetName: 'Winter Invite', season: '2025-2026', familyId: 'regGhost', familyLabel: 'Ghost Family', hours: 2 },
  // Garbage that must be ignored rather than crash.
  { id: 'junk', meetId: 'meetA', season: '2025-2026', hours: 3 },
  null,
];

// ── Model helpers ───────────────────────────────────────────────────────────
check('collection name', VOLUNTEER_COLLECTION, 'volunteerHours');
check('docId', volunteerDocId('meetA', 'regChen'), 'meetA_regChen');
check('normalizeHours blank', normalizeHours(''), null);
check('normalizeHours null', normalizeHours(null), null);
check('normalizeHours negative', normalizeHours(-1), null);
check('normalizeHours text', normalizeHours('abc'), null);
check('normalizeHours zero', normalizeHours('0'), 0);
check('normalizeHours decimal', normalizeHours('1.5'), 1.5);
check('normalizeHours rounds', normalizeHours('2.005'), 2.01);
check('roundHours', roundHours(0.1 + 0.2), 0.3);

check('personName', personName({ firstName: 'Keke', lastName: 'Chen' }), 'Keke Chen');
check('personName missing', personName(null), '');
check('familyLabel both', familyLabel(registrations[0]), 'Keke Chen & Fan Luo');
check('familyLabel one', familyLabel(registrations[1]), 'Wei Wang');
check('familyLabel duplicate', familyLabel(registrations[3]), 'Same Person');
check('familySortKey', familySortKey(registrations[0]), 'chen\u0000keke');
check('familySortKey spouse fallback', familySortKey({ parent: { firstName: 'A' }, spouse: { lastName: 'Luo' } }), 'luo\u0000a');
check('activeSwimmers drops deleted', activeSwimmers(registrations[0]).length, 2);
check('swimmerDisplayName', swimmerDisplayName({ firstName: 'Amy', lastName: 'Chen' }), 'Amy Chen');
check('familyEmails deduped+lowercased', familyEmails(registrations[0]), ['chen@example.com', 'luo@example.com']);

const families = listVolunteerFamilies(registrations);
check('families sorted by surname', families.map((f) => f.familyId), ['regChen', 'regDup', 'regWang', 'regZhou']);
check('family kid names', families[0].kids, ['Amy Chen', 'Ben Chen']);
check('family with no active swimmers still listed', families.find((f) => f.familyId === 'regZhou').kidCount, 0);

// ── Season summary ──────────────────────────────────────────────────────────
const meetSeasonOf = (m) => m.season || null;
const rows = buildVolunteerSummary({ meets, registrations, hours, season: '2025-2026', meetSeasonOf });
const byId = Object.fromEntries(rows.map((r) => [r.familyId, r]));

check('summary row order', rows.map((r) => r.familyId), ['regChen', 'regGhost', 'regDup', 'regWang', 'regZhou']);
check('chen total (3.5 + 2)', byId.regChen.totalHours, 5.5);
check('chen meet count', byId.regChen.meetCount, 2);
check('chen kids', byId.regChen.kids, ['Amy Chen', 'Ben Chen']);
check('wang total includes deleted-meet snapshot (1.25 + 4)', byId.regWang.totalHours, 5.25);
check('wang excludes other seasons', byId.regWang.meetCount, 2);
check('zhou is 0 hours, still listed', byId.regZhou.totalHours, 0);
check('zhou kid count is 0', byId.regZhou.kidCount, 0);
check('zero-hour family survives rows', rows.filter((r) => r.totalHours === 0).map((r) => r.familyId), ['regDup', 'regZhou']);
check('ghost family from snapshot only', byId.regGhost.label, 'Ghost Family');
check('ghost has no kids', byId.regGhost.kidCount, 0);
check('note-only record keeps a meet row', byId.regZhou.meets.length, 1);
check('chen meets are date-ordered', byId.regChen.meets.map((m) => m.meetName), ['Autumn Classic', 'Winter Invite']);
check('chen note carried', byId.regChen.meets[0].note, 'timing');
check('chen live meet name wins', byId.regChen.meets[0].meetName, 'Autumn Classic');
check('re-seasonsed meet excluded from 2025-2026', byId.regChen.meets.some((m) => m.meetId === 'meetD'), false);
check('re-seasonsed meet counted in its live season', 
  buildVolunteerSummary({ meets, registrations, hours, season: '2024-2025', meetSeasonOf }).find((r) => r.familyId === 'regChen').totalHours,
  5);

const stats = volunteerStats(rows);
check('stats total (5.5 + 5.25 + 2 ghost)', stats.totalHours, 12.75);
check('stats with hours', stats.familiesWithHours, 3);
check('stats without hours', stats.familiesWithoutHours, 2);
check('stats family count', stats.familyCount, 5);
check('stats meets covered', stats.meetCount, 3);

// ── Entry table for one meet ────────────────────────────────────────────────
const entryA = buildMeetEntryRows({ registrations, hours, meetId: 'meetA' });
const entryAById = Object.fromEntries(entryA.map((r) => [r.familyId, r]));
check('entry lists every family', entryA.length, 4);
check('entry chen hours', entryAById.regChen.hours, 3.5);
check('entry chen entered', entryAById.regChen.hasRecord, true);
check('entry wang blank', entryAById.regWang.hours, null);
check('entry wang not entered', entryAById.regWang.hasRecord, false);
check('note-only is not "entered"', entryAById.regZhou.hasRecord, false);
check('entry order by surname', entryA.map((r) => r.familyId), ['regChen', 'regDup', 'regWang', 'regZhou']);
ok('entry search blob covers kid names', entryAById.regChen.search.includes('amy chen'));
ok('entry search blob covers spouse email', entryAById.regChen.search.includes('luo@example.com'));

const entryB = buildMeetEntryRows({ registrations, hours, meetId: 'meetB' });
check('meet B includes the deleted-registration family', entryB.map((r) => r.familyId).includes('regGhost'), true);
check('deleted-registration family hours stay editable', entryB.find((r) => r.familyId === 'regGhost').hours, 2);

check('meet total A', meetTotalHours(hours, 'meetA'), 3.5);
check('meet total B', meetTotalHours(hours, 'meetB'), 5.25);
check('meet total for unknown meet', meetTotalHours(hours, 'nope'), 0);

// ── CSV ─────────────────────────────────────────────────────────────────────
const summaryCSV = volunteerSummaryCSV(rows);
ok('summary CSV header', summaryCSV.startsWith('"Parents","Kids","Kid Names","Meets","Total Hours"'));
ok('summary CSV has one line per family', summaryCSV.split('\n').length === rows.length + 1);
ok('summary CSV quotes kid names', summaryCSV.includes('"Amy Chen; Ben Chen"'));

const detailCSV = volunteerDetailCSV(rows);
ok('detail CSV header', detailCSV.startsWith('"Parents","Meet","Date","Hours","Note","Family Season Total"'));
ok('detail CSV has one line per (family, meet)', detailCSV.split('\n').length === rows.reduce((n, r) => n + r.meets.length, 0) + 1);
ok('detail CSV escapes embedded quotes', volunteerDetailCSV([{ label: 'A "B"', meets: [{ meetName: 'X', hours: 1, note: 'say "hi"' }] }]).includes('"say ""hi"""'));

// ── Result ──────────────────────────────────────────────────────────────────
console.log(`volunteerHours smoke test: ${pass} passed, ${failures.length} failed`);
if (failures.length) {
  console.log('\nFAILURES:');
  for (const f of failures) console.log(`  ✗ ${f}`);
  process.exit(1);
}
