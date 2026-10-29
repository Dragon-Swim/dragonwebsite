// Unit checks for src/utils/sdif.js — the SDIF v3 reader/writer behind the
// `.cl2` meet entry file.
//
// What actually needs protecting
// ------------------------------
// The byte layout is not negotiable: Meet Manager parses fixed columns, so a
// single misplaced space turns "Chen, Haoran E" into a name that no longer
// matches the swimmer. Each assertion below encodes a fact verified against real
// Team Manager output (the 2026-11-13 and 2025-12-11 `DRAG-PV-Entries` files):
//
//   - record length is 160 data bytes + CRLF
//   - ALPHA fields are left-justified, numeric ones right-justified — except AGE,
//     which Team Manager left-justifies ('9 ')
//   - the event code goes into the "Event Number" field as number-right-in-3 plus
//     the age-group letter ('  2F', ' 25B', ' 11 ')
//   - a missing time is the TIME Code 020 token, formatted '     NT '
//   - D0 carries the first 12 characters of the USA Swimming ID, D3 the full 14
//   - D3 follows the swimmer's FIRST D0
//
// Part of `npm run test:unit`. Not named *.spec.js so Playwright cannot collect it.
import {
  SDIF_LAYOUTS, SDIF_RECORD_LENGTH, buildEntrySdif, parseSdif, readRecord, writeRecord,
  sdifDate, sdifEventAge, sdifEventNo, sdifName, sdifTime, sdifUss12, sdifUss14,
} from '../../src/utils/sdif.js';

let pass = 0;
let fail = 0;
const check = (name, cond, detail) => {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail !== undefined ? ` -> ${JSON.stringify(detail)}` : ''}`); }
};

console.log('1. field formatters');
check('date from ISO', sdifDate('2026-12-10') === '12102026', sdifDate('2026-12-10'));
check('date from slash form', sdifDate('12/1/2026') === '12012026', sdifDate('12/1/2026'));
check('date already in SDIF form passes through', sdifDate('12102026') === '12102026');
check('date from a Date object', sdifDate(new Date(2026, 11, 10)) === '12102026', sdifDate(new Date(2026, 11, 10)));
check('unparsable date is blank, not garbage', sdifDate('someday') === '');
check('event age 13-14', sdifEventAge(13, 14) === '1314', sdifEventAge(13, 14));
check('event age 9-10 is zero filled', sdifEventAge(9, 10) === '0910', sdifEventAge(9, 10));
check('event age 15+ uses OV', sdifEventAge(15, 109) === '15OV', sdifEventAge(15, 109));
check('event age 11-12', sdifEventAge(11, 12) === '1112');
check('sub-second time is right justified in 8', sdifTime(48.91) === '   48.91', sdifTime(48.91));
check('minute time is right justified in 8', sdifTime(107.25) === ' 1:47.25', sdifTime(107.25));
check('no time is blank (callers use the NT token instead)', sdifTime(null) === '');
check('name uses "Last, First MI"', sdifName({ last: 'Chen', first: 'Haoran', mi: 'E' }) === 'Chen, Haoran E');
check('name without a middle initial', sdifName({ last: 'Chen', first: 'Luohan' }) === 'Chen, Luohan');
check('surname only does not get a dangling comma', sdifName({ last: 'Chen' }) === 'Chen');
check('D0 gets the first 12 characters of the id', sdifUss12('8B1279F2394C49') === '8B1279F2394C');
check('D3 gets all 14', sdifUss14('8B1279F2394C49') === '8B1279F2394C49');
check('event code keeps the age-group letter', sdifEventNo('2F') === '  2F', sdifEventNo('2F'));
check('three-character event code', sdifEventNo('25B') === ' 25B', sdifEventNo('25B'));
check('suffix-less event code keeps its trailing blank', sdifEventNo('11') === ' 11 ', JSON.stringify(sdifEventNo('11')));

console.log('2. records are fixed width');
const d0 = writeRecord('D0', {
  org: '1', name: 'Chen, Haoran E', uss: '8B1279F2394C', citizen: 'USA', dob: '03092011',
  age: 15, sex: 'M', eventSex: 'M', distance: 500, stroke: '1', eventNo: sdifEventNo('2F'),
  eventAge: '15OV', seedTime: sdifTime(310.86), seedCourse: 'Y',
});
check('every record is 160 bytes', d0.length === SDIF_RECORD_LENGTH, d0.length);
check('the record type is written into bytes 1-2', d0.slice(0, 2) === 'D0');
check('ORG lands in byte 3 (Team Manager writes 1)', d0.slice(2, 3) === '1');
check('NAME is left-justified', d0.slice(11, 39) === 'Chen, Haoran E'.padEnd(28), JSON.stringify(d0.slice(11, 39)));
check('USS# is left-justified in 40/12', d0.slice(39, 51) === '8B1279F2394C');
check('distance is right-justified, not zero filled', d0.slice(67, 71) === ' 500', JSON.stringify(d0.slice(67, 71)));
check('age is LEFT-justified (Team Manager writes "15"/"9 ")', writeRecord('D0', { age: 9 }).slice(63, 65) === '9 ', JSON.stringify(writeRecord('D0', { age: 9 }).slice(63, 65)));
check('seed time sits in 89/8', d0.slice(88, 96) === ' 5:10.86', JSON.stringify(d0.slice(88, 96)));
check('course follows the time', d0.slice(96, 97) === 'Y');
check('an unused record has no N## marker (the document forbids it)', !/N\d\d/.test(writeRecord('D0', { name: 'X' })));

console.log('3. read back what we wrote');
const back = readRecord(d0);
check('type', back.type === 'D0');
check('name round-trips', back.name.trimEnd() === 'Chen, Haoran E', back.name);
check('distance round-trips', Number(back.distance) === 500, back.distance);
check('event age round-trips', back.eventAge === '15OV');
check('unknown record types are returned raw instead of throwing', readRecord('ZZwhatever').raw.startsWith('ZZ'));

console.log('4. a whole file');
const meet = {
  name: 'Riley Eaton Holiday Invitational', startDate: '2026-12-10', endDate: '2026-12-13',
  city: 'Boyds', state: 'MD', postal: '20841', courses: ['SCY'],
};
const club = { teamCode: 'PVDRAG', name: 'Dragon Swim Team', abbrev: 'DRAG', city: 'Herndon', state: 'VA', postal: '20171', region: '1' };
const entries = [
  {
    usaSwimmingId: '8B1279F2394C49', lastName: 'Chen', firstName: 'Haoran', middleInitial: 'E',
    dob: '2011-03-09', ageAtMeet: 15, gender: 'M', eventSex: 'M', distance: 500, stroke: 'FR',
    eventCode: '2F', ageMin: 15, ageMax: 109, seconds: 310.86, courseLetter: 'Y',
  },
  {
    usaSwimmingId: '8B1279F2394C49', lastName: 'Chen', firstName: 'Haoran', middleInitial: 'E',
    dob: '2011-03-09', ageAtMeet: 15, gender: 'M', eventSex: 'M', distance: 200, stroke: 'BR',
    eventCode: '25B', ageMin: 15, ageMax: 109, seconds: null, courseLetter: 'Y',
  },
  {
    usaSwimmingId: '65007A9FD7FF43', lastName: 'Pan', firstName: 'Aiden',
    dob: '2012-11-02', ageAtMeet: 13, gender: 'M', eventSex: 'M', distance: 50, stroke: 'FR',
    eventCode: '17A', ageMin: 13, ageMax: 14, seconds: 23.2, courseLetter: 'Y',
  },
];
const text = buildEntrySdif({ file: { fileDate: new Date(2026, 9, 26) }, meet, club, entries });
const lines = text.split('\r\n').filter(Boolean);
const records = parseSdif(text);

check('one line per record, no blank tail', lines.length === records.length, [lines.length, records.length]);
check('every line is exactly 160 bytes', lines.every((l) => l.length === 160));
check('lines end with CRLF', (text.match(/\r\n/g) || []).length === lines.length);
check('starts with A0 and ends with Z0', records[0].type === 'A0' && records[records.length - 1].type === 'Z0');
check('has exactly one D3 per swimmer', records.filter((r) => r.type === 'D3').length === 2, records.filter((r) => r.type === 'D3').length);
check('has one D0 per entry', records.filter((r) => r.type === 'D0').length === 3);

const order = records.map((r) => r.type).join(',');
check('D3 follows its swimmer\'s FIRST D0', order === 'A0,B1,C1,D0,D3,D0,D0,D3,Z0', order);

const z0 = records[records.length - 1];
check('Z0 counts the D0 records', Number(z0.dCount) === 3, z0.dCount);
check('Z0 counts the swimmers', Number(z0.swimmerCount) === 2, z0.swimmerCount);
check('Z0 counts B and C records', Number(z0.bCount) === 1 && Number(z0.cCount) === 1, [z0.bCount, z0.cCount]);
check('Z0 has no relay records for an individual-only file', Number(z0.eCount) === 0 && Number(z0.fCount) === 0);

const d0s = records.filter((r) => r.type === 'D0');
check('a missing time becomes the NT token', d0s[1].seedTime === '     NT ', JSON.stringify(d0s[1].seedTime));
check('the event code survives into the record', d0s[0].eventNo === '  2F', JSON.stringify(d0s[0].eventNo));
check('ages are taken from the entry, not the birth date', d0s[2].age.trim() === '13', d0s[2].age);

console.log('5. the layout table is consistent');
for (const [type, layout] of Object.entries(SDIF_LAYOUTS)) {
  const ranges = layout.map(([, start, len]) => [start, start + len - 1]);
  const overlaps = ranges.some(([a1, b1], i) => ranges.some(([a2, b2], j) => i < j && a1 <= b2 && a2 <= b1));
  const outOfRange = ranges.some(([, end]) => end > SDIF_RECORD_LENGTH);
  check(`${type}: fields do not overlap`, !overlaps, layout.map(([n]) => n));
  check(`${type}: fields stay inside 160 bytes`, !outOfRange);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
