/**
 * SDIF v3 (Standard Data Interchange Format) — reader and writer.
 *
 * Why this file exists
 * --------------------
 * Hy-Tek's `.cl2` entry file is not a private format: it is SDIF v3, published by
 * USA Swimming on 1998-04-28 (https://www.usms.org/admin/sdifv3f.txt), and Meet
 * Manager documents support for "meet entry SD3 files created by other software
 * vendors". That is the whole reason the website can replace manual re-entry into
 * Team Manager instead of reverse-engineering `.hy3`.
 *
 * The layout table below is transcribed from that document and is the **single
 * source of truth**: the reader slices with it and the writer pads with it, so the
 * two cannot drift. Record length is 162 bytes on disk — 160 of data plus CRLF;
 * this module deals in the 160 data bytes and lets the caller join with CRLF.
 *
 * Facts that are easy to get wrong (all verified against real Team Manager output):
 *
 *  - **There is no checksum.** SDIF v3's revision list removes every checksum
 *    field ("The resulting space will be for future use"). Hy-Tek still writes an
 *    `N##` marker into that area; we leave it blank, which is what the spec asks.
 *  - **The USS# field is 12 bytes but the USA Swimming ID is 14.** Team Manager
 *    writes the first 12 in `D0` (40/12) and the full 14 in `D3` (3/14). Copying
 *    only one of them loses the ID.
 *  - **`D3` follows a swimmer's FIRST `D0`**, not their last (spec: "a swimmer with
 *    multiple D0 records will have one D3 record following his/her first D0").
 *  - **EVENT AGE (025) is four digits**: lower limit then upper, zero-filled, with
 *    `OV` as the upper value for "and over" (`1314`, `0910`, `15OV`).
 *  - **Times are `mm:ss.ss` right-justified in 8** (`   48.91`, ` 1:47.25`) and the
 *    course/status char immediately after must be filled whenever a time is.
 */

export const SDIF_RECORD_LENGTH = 160;

/**
 * Field layouts, straight from SDIF v3. `start` is 1-based and `len` is bytes,
 * exactly as the document writes them (`12/28` = start 12, length 28).
 * Unlisted bytes are "future use" and must be blank.
 */
export const SDIF_LAYOUTS = {
  A0: [
    ['typeCode', 1, 2], ['org', 3, 1], ['version', 4, 8], ['fileCode', 12, 2],
    ['description', 14, 30], ['softwareName', 44, 20], ['softwareVersion', 64, 10],
    ['contactName', 74, 20], ['contactPhone', 94, 12], ['fileDate', 106, 8],
    ['submittedByLsc', 156, 2],
  ],
  B1: [
    ['typeCode', 1, 2], ['org', 3, 1], ['meetName', 12, 30], ['address1', 42, 22],
    ['address2', 64, 22], ['city', 86, 20], ['state', 106, 2], ['postal', 108, 10],
    ['country', 118, 3], ['meetCode', 121, 1], ['startDate', 122, 8], ['endDate', 130, 8],
    ['course', 150, 1],
  ],
  C1: [
    ['typeCode', 1, 2], ['org', 3, 1], ['teamCode', 12, 6], ['teamName', 18, 30],
    ['abbrev', 48, 16], ['address1', 64, 22], ['address2', 86, 22], ['city', 108, 20],
    ['state', 128, 2], ['postal', 130, 10], ['country', 140, 3], ['region', 143, 1],
    ['teamCode5th', 150, 1],
  ],
  C2: [
    ['typeCode', 1, 2], ['org', 3, 1], ['teamCode', 12, 6], ['coachName', 18, 30],
    ['coachPhone', 48, 12], ['entryCount', 60, 6], ['athleteCount', 66, 6],
    ['relayEntryCount', 72, 5], ['relayNameCount', 77, 6], ['splitCount', 83, 6],
    ['shortTeamName', 89, 16], ['teamCode5th', 150, 1],
  ],
  D0: [
    ['typeCode', 1, 2], ['org', 3, 1], ['name', 12, 28], ['uss', 40, 12],
    ['attach', 52, 1], ['citizen', 53, 3], ['dob', 56, 8], ['age', 64, 2],
    ['sex', 66, 1], ['eventSex', 67, 1], ['distance', 68, 4], ['stroke', 72, 1],
    ['eventNo', 73, 4], ['eventAge', 77, 4], ['swimDate', 81, 8],
    ['seedTime', 89, 8], ['seedCourse', 97, 1],
    ['prelimTime', 98, 8], ['prelimCourse', 106, 1],
    ['swimOffTime', 107, 8], ['swimOffCourse', 115, 1],
    ['finalsTime', 116, 8], ['finalsCourse', 124, 1],
    ['prelimHeat', 125, 2], ['prelimLane', 127, 2],
    ['finalsHeat', 129, 2], ['finalsLane', 131, 2],
    ['prelimPlace', 133, 3], ['finalsPlace', 136, 3], ['points', 139, 4],
    ['eventTimeClass', 143, 2], ['flightStatus', 145, 1],
  ],
  D3: [
    ['typeCode', 1, 2], ['uss14', 3, 14], ['preferredName', 17, 15], ['ethnicity', 32, 2],
    ['juniorHigh', 34, 1], ['seniorHigh', 35, 1], ['ymca', 36, 1], ['college', 37, 1],
    ['summerLeague', 38, 1], ['masters', 39, 1], ['disabledSports', 40, 1],
    ['waterPolo', 41, 1], ['none', 42, 1],
  ],
  E0: [
    ['typeCode', 1, 2], ['org', 3, 1], ['relayLetter', 12, 1], ['teamCode', 13, 6],
    ['f0Count', 19, 2], ['eventSex', 21, 1], ['distance', 22, 4], ['stroke', 26, 1],
    ['eventNo', 27, 4], ['eventAge', 31, 4], ['totalAge', 35, 3], ['swimDate', 38, 8],
    ['seedTime', 46, 8], ['seedCourse', 54, 1],
  ],
  F0: [
    ['typeCode', 1, 2], ['org', 3, 1], ['teamCode', 16, 6], ['relayLetter', 22, 1],
    ['name', 23, 28], ['uss', 51, 12], ['citizen', 63, 3], ['dob', 66, 8],
    ['age', 74, 2], ['sex', 76, 1],
    ['prelimLeg', 77, 1], ['swimOffLeg', 78, 1], ['finalsLeg', 79, 1],
    ['legTime', 80, 8], ['legCourse', 88, 1],
  ],
  Z0: [
    ['typeCode', 1, 2], ['org', 3, 1], ['fileCode', 12, 2], ['notes', 14, 30],
    ['bCount', 44, 3], ['meetCount', 47, 3], ['cCount', 50, 4], ['teamCount', 54, 4],
    ['dCount', 58, 6], ['swimmerCount', 64, 6], ['eCount', 70, 5], ['fCount', 75, 6],
    ['gCount', 81, 6], ['batchNumber', 87, 5],
    ['newMembers', 92, 3], ['renewMembers', 95, 3], ['memberChanges', 98, 3],
    ['memberDeletes', 101, 3],
  ],
};

/** SDIF STROKE Code 012, as stored in D0/E0. */
export const SDIF_STROKE = { FR: '1', BK: '2', BR: '3', FL: '4', IM: '5', FR_RELAY: '6', MED_RELAY: '7' };

/** SDIF COURSE Code 013 (letters; the document also allows 1/2/3). */
export const SDIF_COURSE = { SCY: 'Y', LCM: 'L', SCM: 'S' };

// ── field formatting ─────────────────────────────────────────────────────

/** 'MM/DD/YYYY' | 'YYYY-MM-DD' | Date → 'MMDDYYYY' (blank when unknown). */
export function sdifDate(value) {
  if (!value) return '';
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return '';
    return `${pad(value.getMonth() + 1, 2)}${pad(value.getDate(), 2)}${value.getFullYear()}`;
  }
  const s = String(value).trim();
  // Already in SDIF form? Hand it back untouched.
  if (/^\d{8}$/.test(s)) return s;
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (iso) return `${iso[2]}${iso[3]}${iso[1]}`;
  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
  if (us) return `${pad(us[1], 2)}${pad(us[2], 2)}${us[3]}`;
  return '';
}

function pad(value, len) {
  return String(value ?? '').padStart(len, '0');
}

/**
 * Seconds → SDIF time text: `48.91` / `1:47.25`, right justified in 8.
 * The document requires byte 3 to be a colon or a blank and byte 6 a period, which
 * is exactly what right-justifying these two shapes produces.
 */
export function sdifTime(seconds) {
  if (seconds == null || !Number.isFinite(Number(seconds))) return '';
  const total = Math.round(Number(seconds) * 100) / 100;
  const text = total < 60
    ? total.toFixed(2)
    : `${Math.floor(total / 60)}:${(total % 60).toFixed(2).padStart(5, '0')}`;
  return text.padStart(8, ' ');
}

/**
 * EVENT AGE Code 025: lower then upper limit, zero filled, `OV` = no upper limit.
 * Verified against Team Manager: `1314`, `1112`, `0910`, `15OV`.
 * A zero lower limit is written as digits (`00`) because that is the only shape
 * Team Manager has been observed to emit; `UN` (the document's "no limit" token)
 * is left for the case where a meet really has no lower bound.
 */
export function sdifEventAge(ageMin, ageMax) {
  const lo = Number.isFinite(Number(ageMin)) ? pad(Math.max(0, Number(ageMin)), 2) : 'UN';
  const hi = Number(ageMax) >= 100 || !Number.isFinite(Number(ageMax)) ? 'OV' : pad(Math.max(0, Number(ageMax)), 2);
  return `${lo}${hi}`;
}

/**
 * EVENT NUMBER field (D0 73/4). Team Manager writes the event's *code* as
 * "number right-justified in 3, then the age-group letter (or a blank)":
 * `  2F`, ` 25B`, ` 11 `. Verified byte by byte against real output — writing the
 * bare number loses the suffix, and plain right-justification loses the trailing
 * blank on suffix-less events.
 */
export function sdifEventNo(code) {
  const text = String(code ?? '').trim();
  const m = /^(\d+)([A-Za-z]*)$/.exec(text);
  if (!m) return text.slice(0, 4);
  return `${m[1].padStart(3, ' ')}${(m[2] || ' ').slice(0, 1)}`;
}

/** 'Last, First MI' — the NAME type SDIF requires (comma + space). */
export function sdifName({ last, first, mi } = {}) {
  const surname = String(last || '').trim();
  const given = String(first || '').trim();
  const initial = String(mi || '').trim().replace(/\.$/, '');
  if (!surname && !given) return '';
  const tail = [given, initial].filter(Boolean).join(' ');
  return tail ? `${surname}, ${tail}` : surname;
}

/** The 12-byte USS# used in D0/F0: the first 12 characters of the ID. */
export function sdifUss12(usaId) {
  return String(usaId || '').trim().toUpperCase().slice(0, 12);
}

/** The 14-byte "new USS#" used in D3: the whole ID. */
export function sdifUss14(usaId) {
  return String(usaId || '').trim().toUpperCase().slice(0, 14);
}

// ── record read / write ──────────────────────────────────────────────────

/** Slice one raw record into `{ type, ...fields }` using the layout table. */
export function readRecord(raw) {
  const line = String(raw || '').padEnd(SDIF_RECORD_LENGTH, ' ');
  const type = line.slice(0, 2);
  const layout = SDIF_LAYOUTS[type];
  if (!layout) return { type, raw: line };
  const out = { type, raw: line };
  for (const [name, start, len] of layout) {
    if (name === 'typeCode') continue;
    out[name] = line.substr(start - 1, len);
  }
  return out;
}

/**
 * Fields that are right-justified per the document (INT / DEC / TIME).
 * Everything else is ALPHA and left-justified — getting this backwards shifts
 * every name one field to the right, which is exactly what the first draft of
 * this module did.
 */
const NUMERIC_FIELDS = new Set([
  'distance', 'totalAge', 'f0Count',
  'seedTime', 'prelimTime', 'swimOffTime', 'finalsTime', 'legTime',
  'prelimHeat', 'prelimLane', 'finalsHeat', 'finalsLane',
  'prelimPlace', 'finalsPlace', 'points',
  'entryCount', 'athleteCount', 'relayEntryCount', 'relayNameCount', 'splitCount',
  'bCount', 'meetCount', 'cCount', 'teamCount', 'dCount', 'swimmerCount',
  'eCount', 'fCount', 'gCount', 'batchNumber',
  'newMembers', 'renewMembers', 'memberChanges', 'memberDeletes',
  'prelimLeg', 'swimOffLeg', 'finalsLeg',
]);

/** Build one 160-byte record from `values` (missing fields become blanks). */
export function writeRecord(type, values = {}) {
  const layout = SDIF_LAYOUTS[type];
  if (!layout) throw new Error(`writeRecord: unknown SDIF record type '${type}'`);
  const chars = new Array(SDIF_RECORD_LENGTH).fill(' ');
  for (const [name, start, len] of layout) {
    const value = name === 'typeCode' ? type : values[name];
    if (value == null || value === '') continue;
    const raw = String(value).slice(0, len);
    const text = NUMERIC_FIELDS.has(name) ? raw.padStart(len, ' ') : raw.padEnd(len, ' ');
    for (let i = 0; i < text.length; i += 1) chars[start - 1 + i] = text[i];
  }
  return chars.join('');
}

/** Split an SDIF file into records (tolerates CRLF and a trailing newline). */
export function parseSdif(text) {
  return String(text || '')
    .split(/\r?\n/)
    .filter((line) => line.length > 0)
    .map((line) => readRecord(line));
}

// ── building a meet-entry file ───────────────────────────────────────────

/**
 * Build a complete SDIF v3 meet-entry file.
 *
 * `entries` are flat rows (one per swim) already shaped by
 * `buildExportRows()` (see `meetEntryExport.js`); they are grouped by swimmer so
 * each `D3` can follow that swimmer's first `D0`, as the spec requires.
 *
 * Individual events only for now: relays need `E0`/`F0` and a line-up the site
 * does not store yet (see docs/meet-entry-export-feasibility.md §11).
 */
export function buildEntrySdif({ file = {}, meet = {}, club = {}, entries = [], relays = [], today = new Date() } = {}) {
  const records = [];

  const courseLetters = sdifCourseList(meet.courses);
  records.push(writeRecord('A0', {
    org: file.org || '1',
    version: file.version || 'V3',
    fileCode: file.fileCode || '20',           // 20 = vendor-defined (Team Manager uses this)
    description: file.description || 'Meet Entries',
    softwareName: file.softwareName || 'Dragon Swim Team',
    softwareVersion: file.softwareVersion || '1.0',
    contactName: file.contactName || '',
    contactPhone: file.contactPhone || '',
    fileDate: sdifDate(file.fileDate || today),
  }));

  records.push(writeRecord('B1', {
    org: '1',
    meetName: meet.name || '',
    address1: meet.address1 || '',
    address2: meet.address2 || '',
    city: meet.city || '',
    state: meet.state || '',
    postal: meet.postal || '',
    country: meet.country || 'USA',
    meetCode: meet.meetCode || '1',            // 1 = invitational
    startDate: sdifDate(meet.startDate),
    endDate: sdifDate(meet.endDate),
    course: courseLetters[0] || 'Y',
  }));

  records.push(writeRecord('C1', {
    org: '1',
    teamCode: (club.teamCode || '').slice(0, 6),
    teamName: club.name || '',
    abbrev: club.abbrev || '',
    address1: club.address1 || '',
    address2: club.address2 || '',
    city: club.city || '',
    state: club.state || '',
    postal: club.postal || '',
    country: club.country || 'USA',
    region: club.region || '',
  }));

  const bySwimmer = new Map();
  for (const row of entries) {
    const key = row.usaSwimmingId || row.swimmerName;
    if (!bySwimmer.has(key)) bySwimmer.set(key, []);
    bySwimmer.get(key).push(row);
  }

  let dCount = 0;
  let swimmerCount = 0;
  for (const [, rows] of bySwimmer) {
    const firstRow = rows[0];
    let wroteD3 = false;
    for (const row of rows) {
      records.push(writeRecord('D0', {
        org: '1',
        name: sdifName({ last: row.lastName, first: row.firstName, mi: row.middleInitial }),
        uss: sdifUss12(row.usaSwimmingId),
        // Team Manager leaves ATTACH blank on entry rows; blank means "attached"
        // in practice, so do not invent an 'A' here.
        attach: row.attach || '',
        // Team Manager leaves CITIZEN blank when it does not know it; we do not
        // store citizenship, so blank is the honest value (the field is optional).
        citizen: row.citizen || '',
        dob: sdifDate(row.dob),
        // AGE is left-justified in Team Manager's output ('9 ', '15').
        age: row.ageAtMeet != null ? row.ageAtMeet : '',
        sex: row.gender || '',
        eventSex: row.eventSex || row.gender || '',
        distance: row.distance != null ? row.distance : '',
        stroke: row.strokeCode || strokeCodeOf(row),
        // SDIF's "Event Number" is the meet's event CODE ('1A' / '2F'), because the
        // bare number is ambiguous when one event number covers several age groups.
        eventNo: sdifEventNo(row.eventCode || row.eventNo),
        eventAge: row.eventAge || sdifEventAge(row.ageMin, row.ageMax),
        // Team Manager leaves "date of swim" blank on entry files even though the
        // document marks it M2; Meet Manager accepts the blank. Writing the meet's
        // start date here would claim a swim that has not happened yet.
        swimDate: row.swimDate ? sdifDate(row.swimDate) : '',
        // A missing time is not a blank field: SDIF has a TIME Code 020 token for
        // it. Team Manager writes it as "     NT " (right-justified in 7, then the
        // trailing blank that keeps the field 8 wide) — matched here byte for byte.
        seedTime: row.seconds == null ? 'NT'.padStart(7, ' ') + ' ' : sdifTime(row.seconds),
        seedCourse: row.courseLetter || '',
      }));
      dCount += 1;

      if (!wroteD3) {
        records.push(writeRecord('D3', {
          uss14: sdifUss14(row.usaSwimmingId),
          // Only write a preferred name when the caller actually has one: Team
          // Manager leaves this blank when it does not, and inventing the legal
          // first name here would claim a nickname that does not exist.
          preferredName: row.preferredName || '',
        }));
        wroteD3 = true;
      }
    }
    swimmerCount += 1;
  }

  const course = courseLetters[0] || 'Y';
  // ── 接力：E0(每个接力队一条) + F0(每棒一条) ───────────────────────────
  // 顺序按规范的 meet pyramid：C1/C2 → D0/D3 → E0/F0 → Z0。
  let eCount = 0;
  let fCount = 0;
  for (const relay of relays) {
    const legs = (relay.legs || []).slice(0, 4);
    if (!legs.length) continue;
    records.push(writeRecord('E0', {
      org: '1',
      relayLetter: (relay.letter || 'A').slice(0, 1),
      teamCode: (club.teamCode || '').slice(0, 6),
      // Team Manager leaves this blank; the document asks for it and Meet Manager
      // uses it to know how many F0 records belong to this squad, so write it.
      f0Count: legs.length,
      eventSex: relay.eventSex || '',
      distance: relay.distance != null ? relay.distance : '',
      stroke: relayStrokeCode(relay),
      eventNo: sdifEventNo(relay.eventCode),
      eventAge: relay.eventAge || sdifEventAge(relay.ageMin, relay.ageMax),
      // Unlike D0, Team Manager does fill the relay's date of swim — match it.
      swimDate: sdifDate(relay.swimDate || meet.startDate),
      seedTime: relay.seconds == null ? 'NT'.padStart(7, ' ') + ' ' : sdifTime(relay.seconds),
      seedCourse: relay.courseLetter || course,
    }));
    eCount += 1;

    legs.forEach((leg, i) => {
      records.push(writeRecord('F0', {
        org: '1',
        teamCode: (club.teamCode || '').slice(0, 6),
        relayLetter: (relay.letter || 'A').slice(0, 1),
        name: sdifName({ last: leg.lastName, first: leg.firstName, mi: leg.middleInitial }),
        uss: sdifUss12(leg.usaSwimmingId),
        citizen: leg.citizen || '',
        dob: sdifDate(leg.dob),
        age: leg.ageAtMeet != null ? leg.ageAtMeet : '',
        sex: leg.gender || relay.eventSex || '',
        // Leg order: 1..4 per ORDER Code 024. Team Manager writes 0 in all three
        // order fields, which the code table defines as "not on the team for this
        // swim" — writing the real order is what the document asks for, and is the
        // only way Meet Manager can know the running order from a CL2.
        prelimLeg: i + 1,
        swimOffLeg: '0',
        finalsLeg: '0',
        legTime: leg.seconds == null ? '' : sdifTime(leg.seconds),
        legCourse: leg.seconds == null ? '' : (leg.courseLetter || course),
      }));
      fCount += 1;
    });
  }

  records.push(writeRecord('Z0', {
    org: '1',
    fileCode: '02',                            // 02 = meet results per the code table…
    notes: `Meet entries for ${meet.name || 'meet'}`.slice(0, 30),
    bCount: 1,
    meetCount: 1,
    cCount: 1,
    teamCount: 1,
    dCount,
    swimmerCount,
    eCount,
    fCount,
    gCount: 0,
    batchNumber: 1,
  }));

  return `${records.join('\r\n')}\r\n`;
}

function strokeCodeOf(row) {
  const key = row.relay ? (row.stroke === 'MED' ? 'MED_RELAY' : 'FR_RELAY') : row.stroke;
  return SDIF_STROKE[key] || '';
}

/**
 * Relay stroke code. Accepts an SDIF code already (`'6'`/`'7'`) or the site's
 * stroke name (`'FR'`/`'MED'`), because the two callers differ: the export script
 * carries names from Firestore, while the regression harness reads codes back out
 * of a real file.
 */
function relayStrokeCode(relay) {
  const raw = String(relay.strokeCode ?? relay.stroke ?? '').trim().toUpperCase();
  if (raw === '6' || raw === '7') return raw;
  if (raw === 'MED' || raw === 'MEDLEY' || raw === 'MED_RELAY') return SDIF_STROKE.MED_RELAY;
  if (raw === 'FR' || raw === 'FREE' || raw === 'FR_RELAY') return SDIF_STROKE.FR_RELAY;
  return '';
}

function sdifCourseList(courses) {
  const list = (courses || []).map((c) => SDIF_COURSE[c] || c).filter(Boolean);
  return list.length ? list : ['Y'];
}
