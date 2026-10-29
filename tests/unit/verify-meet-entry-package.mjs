// Unit checks for src/utils/meetEntryPackage.js — what the coach's button (and the
// CLI) actually hand to the meet director: one zip holding the .cl2 and a README.
//
// The button and `execution/meet-entry/export_cl2.mjs` both call this module, so
// these checks are the contract for "what leaves the building".
//
// Part of `npm run test:unit`. Not named *.spec.js so Playwright cannot collect it.
import {
  CLUB_DEFAULTS, buildEntryPackage, buildReadme, meetDateTag, packageFileName,
} from '../../src/utils/meetEntryPackage.js';
import { parseSdif, SDIF_RECORD_LENGTH } from '../../src/utils/sdif.js';

let pass = 0;
let fail = 0;
const check = (name, cond, detail) => {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail !== undefined ? ` -> ${JSON.stringify(detail)}` : ''}`); }
};

const MEET = {
  id: 'meet1',
  name: 'Riley Eaton Holiday Invitational',
  startDate: '2026-12-10',
  endDate: '2026-12-13',
  sanction: 'PVI-27-41',
  location: 'Germantown Indoor Swim Center, Boyds, MD 20841',
  courses: ['SCY'],
  ageDeterminedOn: '2026-12-10',
  qualifyingPeriodStart: '2024-10-01',
  limits: { maxEvents: 6, maxPerDay: 3 },
  relayLimitPerClub: 2,
  sessions: [{ id: 'fri-am', date: '2026-12-11', day: 'Fri', start: '8:05 AM' }],
  events: [
    { eventNo: 19, eventCode: '19A', gender: 'M', ageGroup: '13-14', ageMin: 13, ageMax: 14,
      distance: 100, stroke: 'BR', relay: false, sessionId: 'fri-am', standards: { SCY: 76.69, LCM: 82.99 } },
    { eventNo: 9, eventCode: '9A', gender: 'M', ageGroup: '13-14', ageMin: 13, ageMax: 14,
      distance: 200, stroke: 'MED', relay: true, sessionId: 'fri-am', standards: { SCY: 120.99, LCM: null } },
  ],
};

const BOYS = {
  'ID0000000001': { firstName: 'Boy1', lastName: 'Alpha', dob: '2012-05-01', gender: 'male' },
  'ID0000000002': { firstName: 'Boy2', lastName: 'Bravo', dob: '2012-06-01', gender: 'male' },
  'ID0000000003': { firstName: 'Boy3', lastName: 'Charlie', dob: '2013-07-01', gender: 'male' },
  'ID0000000004': { firstName: 'Boy4', lastName: 'Delta', dob: '2012-08-01', gender: 'male' },
};

const entryDoc = (usaId, overrides = {}) => ({
  id: `fam1__${usaId}`,
  familyId: 'fam1',
  usaSwimmingId: usaId,
  swimmerName: `${BOYS[usaId].firstName} ${BOYS[usaId].lastName}`,
  ageAtMeet: 14,
  ageGroup: '13-14',
  gender: 'M',
  status: 'confirmed',
  events: [{
    eventNo: 19, ageGroup: '13-14', distance: 100, stroke: 'BR', sessionId: 'fri-am',
    course: 'SCY', seedTime: '1:12.30', seedSeconds: 72.3, source: 'db',
  }],
  ...overrides,
});

const relayDoc = (overrides = {}) => ({
  id: '9A__A',
  eventNo: 9,
  eventCode: '9A',
  ageGroup: '13-14',
  gender: 'M',
  distance: 200,
  stroke: 'MED',
  letter: 'A',
  legs: ['ID0000000001', 'ID0000000002', 'ID0000000003', 'ID0000000004'].map((id) => ({
    usaSwimmingId: id, firstName: BOYS[id].firstName, lastName: BOYS[id].lastName, gender: 'M',
  })),
  seedSeconds: 125.4,
  courseLetter: 'Y',
  ...overrides,
});

console.log('1. naming');
check('date tag is ddMonyyyy', meetDateTag('2026-12-10') === '10Dec2026', meetDateTag('2026-12-10'));
check('unknown date degrades instead of throwing', meetDateTag(null) === 'undated');
check('filename follows the Team Manager convention',
  packageFileName({ meet: MEET }) === 'DRAG-PV-Entries-Riley Eaton Holiday Invitational-10Dec2026-001.ZIP',
  packageFileName({ meet: MEET }));
check('characters that break a filename are stripped',
  packageFileName({ meet: { name: 'A/B:C', startDate: '2026-01-02' } }) === 'DRAG-PV-Entries-A B C-02Jan2026-001.ZIP',
  packageFileName({ meet: { name: 'A/B:C', startDate: '2026-01-02' } }));

console.log('2. readme');
const readme = buildReadme({
  meet: MEET, club: CLUB_DEFAULTS,
  summary: { swimmerCount: 3, rowCount: 5 }, relayCount: 1,
  fileName: packageFileName({ meet: MEET }), now: new Date(2026, 9, 29),
});
check('names the meet and its dates', readme.includes('Riley Eaton') && readme.includes('2026-12-10'));
check('keeps the sanction', readme.includes('PVI-27-41'));
check('explains how to import', readme.includes('File > Import > Entries'));
check('says what the CL2 actually is', readme.includes('SDIF'));
check('reports the counts', readme.includes('3 swimmers') && readme.includes('5 individual entries') && readme.includes('1 relay squads'));
check('gives a way to ask questions', readme.includes(CLUB_DEFAULTS.contact));
check('is plain ASCII so any reader shows it correctly', /^[\x09\x0A\x0D\x20-\x7E]*$/.test(readme), readme.slice(0, 80));
check('uses CRLF line endings', readme.includes('\r\n'));

console.log('3. a complete package');
const pkg = buildEntryPackage({
  meet: MEET,
  entries: [entryDoc('ID0000000001'), entryDoc('ID0000000002')],
  relays: [relayDoc()],
  swimmerById: BOYS,
  bestTimesById: {},
  now: new Date(2026, 9, 29),
});
check('it is ok', pkg.ok === true, pkg.errors);
check('two individual entries were counted', pkg.summary.rowCount === 2, pkg.summary.rowCount);
check('the relay squad was counted', pkg.relayCount === 1, pkg.relayCount);
check('a filename was produced', /\.ZIP$/.test(pkg.fileName), pkg.fileName);
check('the zip is non-trivial', pkg.zipBytes.length > 400, pkg.zipBytes.length);

const records = parseSdif(pkg.cl2Text);
const types = {};
for (const r of records) types[r.type] = (types[r.type] || 0) + 1;
check('the .cl2 starts with A0 and ends with Z0', records[0].type === 'A0' && records.at(-1).type === 'Z0');
check('one D0 per entry', types.D0 === 2, types);
check('one D3 per swimmer', types.D3 === 2, types);
check('one E0 for the relay', types.E0 === 1, types);
check('four F0 for the relay legs', types.F0 === 4, types);
check('every record is 160 bytes', records.every((r) => r.raw.length === SDIF_RECORD_LENGTH));
check('Z0 counts the relay records', records.at(-1).eCount.trim() === '1' && records.at(-1).fCount.trim() === '4');
check('leg order is preserved as stored', records.filter((r) => r.type === 'F0').map((r) => r.prelimLeg).join('') === '1234');

// The zip has to hold exactly the two files, and its README has to match what we built.
const zipNames = [];
for (let i = 0; i < pkg.zipBytes.length - 5; i += 1) {
  if (pkg.zipBytes[i] === 0x50 && pkg.zipBytes[i + 1] === 0x4B && pkg.zipBytes[i + 2] === 0x01 && pkg.zipBytes[i + 3] === 0x02) {
    const len = pkg.zipBytes[i + 28] | (pkg.zipBytes[i + 29] << 8);
    zipNames.push(String.fromCharCode(...pkg.zipBytes.subarray(i + 46, i + 46 + len)));
  }
}
check('the archive holds the .cl2 and a README', zipNames.length === 2 && zipNames[1] === 'README.TXT', zipNames);
check('the .cl2 inside is named after the archive', zipNames[0] === pkg.fileName.replace(/\.ZIP$/i, '.CL2'), zipNames[0]);
check('the README names the real member file (not a guess)', pkg.readme.includes(zipNames[0]), [zipNames[0], pkg.readme.split('\r\n').find((l) => l.includes('.CL2'))]);
check('the README tells the reader which file to pick', pkg.readme.includes(`select ${zipNames[0]} from this archive`));
check('the README has a header row for the CL2 member', pkg.readme.includes(`  ${zipNames[0]}`));

console.log('4. refusals');
const missingTime = buildEntryPackage({
  meet: MEET,
  entries: [entryDoc('ID0000000001', { events: [{ eventNo: 19, ageGroup: '13-14', distance: 100, stroke: 'BR', sessionId: 'fri-am' }] })],
  relays: [], swimmerById: BOYS, bestTimesById: {},
});
check('a row with no seed time blocks the package', missingTime.ok === false
  && missingTime.errors.some((e) => e.code === 'missing-seed-time'), missingTime.errors);
check('no zip is produced when it fails', missingTime.zipBytes === undefined);

const noId = buildEntryPackage({
  meet: MEET,
  entries: [entryDoc('ID0000000001', { usaSwimmingId: '' })],
  relays: [], swimmerById: BOYS, bestTimesById: {},
});
check('a confirmed swimmer without a USA ID blocks it', noId.ok === false
  && noId.errors.some((e) => e.code === 'no-usa-id'), noId.errors);

const shortSquad = buildEntryPackage({
  meet: MEET, entries: [], relays: [relayDoc({ legs: relayDoc().legs.slice(0, 3) })],
  swimmerById: BOYS, bestTimesById: {},
});
check('a three-leg relay blocks the package', shortSquad.ok === false
  && shortSquad.errors.some((e) => e.code === 'relay-squad-invalid'), shortSquad.errors);

const unknownEvent = buildEntryPackage({
  meet: MEET, entries: [], relays: [relayDoc({ eventCode: '77Z' })],
  swimmerById: BOYS, bestTimesById: {},
});
check('a relay for an event this meet does not have blocks it', unknownEvent.ok === false
  && unknownEvent.errors.some((e) => e.code === 'unknown-relay-event'), unknownEvent.errors);

console.log('5. unconfirmed entries are held back unless asked for');
const draftOnly = buildEntryPackage({
  meet: MEET, entries: [entryDoc('ID0000000001', { status: 'submitted' })],
  relays: [], swimmerById: BOYS, bestTimesById: {},
});
check('a submitted entry produces an empty but valid file', draftOnly.ok === true && draftOnly.summary.rowCount === 0, draftOnly.summary);
check('…and it says so in the summary', draftOnly.summary.notConfirmed === 1, draftOnly.summary.notConfirmed);
const withDrafts = buildEntryPackage({
  meet: MEET, entries: [entryDoc('ID0000000001', { status: 'submitted' })],
  relays: [], swimmerById: BOYS, bestTimesById: {}, includeUnconfirmed: true,
});
check('includeUnconfirmed lets it through', withDrafts.ok === true && withDrafts.summary.rowCount === 1, withDrafts.summary);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
