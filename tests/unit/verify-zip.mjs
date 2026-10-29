// Unit checks for src/utils/zip.js — the hand-rolled store-only ZIP writer.
//
// Why this deserves its own checks: the archive is the thing the coach sends to
// the meet director. A wrong CRC or a bad central-directory offset produces a file
// that opens on some machines and not others, which is the worst failure mode
// there is. The assertions below are the ones a reader actually relies on.
//
// Part of `npm run test:unit`. Not named *.spec.js so Playwright cannot collect it.
import { crc32, dosDateTime, utf8Bytes, zipStore } from '../../src/utils/zip.js';

let pass = 0;
let fail = 0;
const check = (name, cond, detail) => {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail !== undefined ? ` -> ${JSON.stringify(detail)}` : ''}`); }
};

const u16 = (b, at) => b[at] | (b[at + 1] << 8);
const u32 = (b, at) => (b[at] | (b[at + 1] << 8) | (b[at + 2] << 16) | (b[at + 3] << 24)) >>> 0;
const ascii = (b, at, len) => String.fromCharCode(...b.subarray(at, at + len));

console.log('1. crc32');
check('the standard check value for "123456789"', crc32(utf8Bytes('123456789')) === 0xCBF43926, crc32(utf8Bytes('123456789')).toString(16));
check('empty input is 0', crc32(new Uint8Array(0)) === 0);
check('smoke: "abc" matches its known CRC', crc32(utf8Bytes('abc')) === 0x352441C2, crc32(utf8Bytes('abc')).toString(16));

console.log('2. utf8 encoding');
check('ascii passes through', Array.from(utf8Bytes('AB')).join() === '65,66');
check('two-byte characters', utf8Bytes('é').length === 2, utf8Bytes('é').length);
check('three-byte characters', utf8Bytes('世').length === 3, utf8Bytes('世').length);

console.log('3. dos timestamp');
const stamp = dosDateTime(new Date(2026, 11, 10, 8, 5, 30));
check('year/month/day are packed into the date word', stamp.date >> 9 === 2026 - 1980 && ((stamp.date >> 5) & 0xF) === 12 && (stamp.date & 0x1F) === 10, stamp);
check('hours/minutes are packed into the time word', (stamp.time >> 11) === 8 && ((stamp.time >> 5) & 0x3F) === 5, stamp);
check('a pre-1980 date is clamped (ZIP cannot express it)', dosDateTime(new Date(1970, 0, 1)).date >> 9 === 0);

console.log('4. archive structure');
const cl2 = 'A01V3      20Meet Entries\r\nB11        Meet\r\n';
const readme = 'Hello\r\nWorld\r\n';
const zip = zipStore([{ name: 'ENTRY.CL2', data: cl2 }, { name: 'README.TXT', data: readme }], { date: new Date(2026, 11, 10) });

check('starts with the local file header signature', ascii(zip, 0, 4) === 'PK\u0003\u0004', ascii(zip, 0, 4));
check('archive is not empty', zip.length > 100, zip.length);
check('ends with the end-of-central-directory signature',
  ascii(zip, zip.length - 22, 4) === 'PK\u0005\u0006', ascii(zip, zip.length - 22, 4));

const eocd = zip.length - 22;
check('EOCD reports 2 entries in total', u16(zip, eocd + 10) === 2, u16(zip, eocd + 10));
check('EOCD reports 2 entries on this disk', u16(zip, eocd + 8) === 2);
const centralSize = u32(zip, eocd + 12);
const centralOffset = u32(zip, eocd + 16);
check('central directory offset points at its signature', ascii(zip, centralOffset, 4) === 'PK\u0001\u0002', ascii(zip, centralOffset, 4));
check('central directory size covers both entries', centralSize > 0 && centralOffset + centralSize === eocd, [centralSize, centralOffset, eocd]);

console.log('5. entry fields');
// First local header: fixed part is 30 bytes.
const firstNameLen = u16(zip, 26);
const firstExtraLen = u16(zip, 28);
check('first entry name is stored verbatim', ascii(zip, 30, firstNameLen) === 'ENTRY.CL2', ascii(zip, 30, firstNameLen));
check('method is 0 (stored, not deflated)', u16(zip, 8) === 0);
check('the UTF-8 name flag is set', (u16(zip, 6) & 0x0800) === 0x0800, u16(zip, 6));
const firstSize = u32(zip, 18);
check('stored size equals the input length', firstSize === utf8Bytes(cl2).length, [firstSize, utf8Bytes(cl2).length]);
check('compressed size equals the stored size', u32(zip, 18) === u32(zip, 22));
check('the CRC in the header matches crc32 of the data', u32(zip, 14) === crc32(utf8Bytes(cl2)), 'crc mismatch');
const dataAt = 30 + firstNameLen + firstExtraLen;
check('the payload is stored uncompressed', ascii(zip, dataAt, 4) === 'A01V', ascii(zip, dataAt, 4));
check('the payload round-trips exactly', ascii(zip, dataAt, cl2.length) === cl2);

console.log('6. edge cases');
check('one file works', zipStore([{ name: 'A.TXT', data: 'x' }]).length > 50);
check('zero files still yields a valid empty archive', ascii(zipStore([]), 0, 4) === 'PK\u0005\u0006');
check('backslashes in names become forward slashes', ascii(zipStore([{ name: 'a\\b.txt', data: 'x' }]), 30, 7) === 'a/b.txt');
let threw = false;
try { zipStore([{ name: '', data: 'x' }]); } catch { threw = true; }
check('an empty name is rejected', threw);
threw = false;
try { zipStore([{ name: 'a.txt', data: 42 }]); } catch { threw = true; }
check('non-text, non-byte data is rejected', threw);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
