/**
 * Build the whole thing the meet director receives: the `.cl2` entry file, a
 * README, and the zip that holds them — as one pure function.
 *
 * Why this module exists
 * ----------------------
 * The same package is produced from two very different places:
 *
 *   - the coach's browser (`src/components/exportEntryFile.js`), because a coach
 *     will not open a terminal to run a script;
 *   - the command line (`execution/meet-entry/export_cl2.mjs`), which is still the
 *     way to do it from a machine without a signed-in session.
 *
 * Both callers only fetch data; everything that decides *what goes in the file*
 * lives here, so the button and the CLI cannot drift apart. Nothing in this file
 * touches Firestore, the DOM, or the filesystem.
 *
 * Input shapes (all plain data):
 *   meet            meet document (events[], sessions[], limits, name, dates, …)
 *   entries         meet entry documents, as stored
 *   relays          relayEntries documents, as stored
 *   swimmerById     { [usaId]: { dob, firstName, lastName, middleInitial } }
 *   bestTimesById   { [usaId]: bestTimes[] }
 *   club            { teamCode, abbrev, lsc, name, city, state, postal, region }
 */

import { buildExportRows, validateExport, summarizeExport } from './meetEntryExport.js';
import { buildEntrySdif } from './sdif.js';
import { relayEventsOf, validateSquad, squadToSdifRelay } from './relayEntry.js';
import { zipStore } from './zip.js';

/**
 * Club identity written into the C1 record. Overridable per call; these defaults
 * are what Team Manager has always written for us (`DRAG` + LSC `PV`), so a file
 * generated here is interchangeable with the ones the coach used to export.
 */
export const CLUB_DEFAULTS = {
  abbrev: 'DRAG',
  lsc: 'PV',
  teamCode: 'PVDRAG',
  name: 'Dragon Swim Team',
  city: 'Herndon',
  state: 'VA',
  postal: '20171',
  region: '1',
  contact: 'dragonswim@outlook.com',
  website: 'dragonswim.org',
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** '2026-12-10' → '10Dec2026' (the date shape Team Manager puts in its filenames). */
export function meetDateTag(isoDate) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(isoDate || ''));
  if (!m) return 'undated';
  return `${m[3]}${MONTHS[Number(m[2]) - 1]}${m[1]}`;
}

/**
 * `DRAG-PV-Entries-<meet>-<ddMonYYYY>-001.ZIP` — the same convention as the files
 * the meet director has been receiving for years, so the attachment does not look
 * like it came from a different planet.
 */
export function packageFileName({ meet, club = CLUB_DEFAULTS }) {
  const name = String(meet?.name || 'Meet').replace(/[\\/:*?"<>|]/g, ' ').replace(/\s+/g, ' ').trim();
  return `${club.abbrev}-${club.lsc}-Entries-${name}-${meetDateTag(meet?.startDate)}-001.ZIP`;
}

/** The one-page note that travels with the file. ASCII only, for any reader. */
export function buildReadme({ meet, club = CLUB_DEFAULTS, summary, relayCount, fileName, cl2Name, now = new Date() }) {
  const stamp = `${MONTHS[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  const member = cl2Name || String(fileName || '').replace(/\.ZIP$/i, '.CL2');
  const lines = [
    `${club.name} - team entry file`,
    '='.repeat(`${club.name} - team entry file`.length),
    '',
    `Meet:      ${meet?.name || ''}`,
    `Dates:     ${meet?.startDate || ''} to ${meet?.endDate || meet?.startDate || ''}`,
    meet?.sanction ? `Sanction:  ${meet.sanction}` : 'Sanction:  (not recorded)',
    `Generated: ${stamp} by ${club.website}`,
    '',
    'Files in this archive',
    '---------------------',
    `  ${member}`,
    '      Hy-Tek Meet Manager entry file: SDIF v3, plain single-byte text,',
    '      160-character records, no compression.',
    '  README.TXT',
    '      this note.',
    '',
    'How to import (Hy-Tek Meet Manager)',
    '-----------------------------------',
    `File > Import > Entries, then select ${member} from this archive.`,
    'The CL2 is the Standard Data Interchange Format (SDIF v3) published by',
    'USA Swimming in 1998; Meet Manager accepts SDIF entry files produced by',
    'software other than Team Manager.',
    '',
    'Contents',
    '--------',
    `${summary?.swimmerCount ?? 0} swimmers, ${summary?.rowCount ?? 0} individual entries, `
      + `${relayCount ?? 0} relay squads.`,
    '',
    'Questions',
    '---------',
    `${club.contact}  /  ${club.website}`,
    '',
  ];
  return lines.join('\r\n');
}

/**
 * Assemble the package.
 *
 * Returns `{ ok: false, errors }` when anything would make the file invalid —
 * a missing seed time, a swimmer without a USA Swimming ID, an over-limit entry,
 * or a relay squad that fails validation. Nothing is zipped in that case: a
 * half-correct entry file is worse than none.
 */
export function buildEntryPackage({
  meet, entries = [], relays = [], swimmerById = {}, bestTimesById = {},
  club = CLUB_DEFAULTS, now = new Date(), includeUnconfirmed = false,
} = {}) {
  const lookup = (id) => swimmerById[String(id || '').trim().toUpperCase()] || {};

  const built = buildExportRows({
    meet,
    entries,
    bestTimesById,
    statuses: includeUnconfirmed ? ['confirmed', 'submitted', 'draft'] : ['confirmed'],
  });

  // D0 wants the birth date and "Last, First MI"; the entry snapshot may be missing
  // either if the family has since been edited.
  const enriched = built.rows.map((row) => {
    const swimmer = lookup(row.usaSwimmingId);
    return {
      ...row,
      dob: row.dob || swimmer.dob || null,
      lastName: swimmer.lastName || row.lastName,
      firstName: swimmer.firstName || row.firstName,
      middleInitial: swimmer.middleInitial || '',
    };
  });

  const validation = validateExport({ rows: enriched, meet, excluded: built.excluded, noId: built.noId });
  const summary = summarizeExport({ rows: enriched, excluded: built.excluded, noId: built.noId });

  // Relays: a squad belongs to the club, so it is validated here rather than with
  // the family entries. One bad leg invalidates the whole squad at the host.
  const relayEvents = relayEventsOf(meet);
  const eventByCode = new Map(relayEvents.map((e) => [String(e.eventCode), e]));
  const squadsPerEvent = {};
  for (const doc of relays) {
    const code = String(doc.eventCode || '');
    squadsPerEvent[code] = (squadsPerEvent[code] || 0) + 1;
  }

  const errors = [...validation.errors];
  const relayRows = [];
  for (const doc of relays) {
    const event = eventByCode.get(String(doc.eventCode || ''));
    if (!event) {
      errors.push({ code: 'unknown-relay-event', eventCode: doc.eventCode, detail: 'not a relay event of this meet' });
      continue;
    }
    const legs = (doc.legs || []).map((leg) => {
      const swimmer = lookup(leg.usaSwimmingId);
      return { ...swimmer, ...leg, gender: leg.gender || swimmer.gender || event.gender };
    });
    const check = validateSquad({ meet, event, legs, squadsInEvent: squadsPerEvent[String(doc.eventCode)] || 1 });
    if (!check.ok) {
      errors.push({
        code: 'relay-squad-invalid',
        letter: doc.letter,
        eventCode: doc.eventCode,
        detail: check.errors.map((e) => e.code).join(', '),
      });
      continue;
    }
    relayRows.push(squadToSdifRelay({ meet, event, squad: { ...doc, legs } }));
  }

  const fileName = packageFileName({ meet, club });
  if (errors.length) {
    return { ok: false, errors, warnings: validation.warnings, summary, relayCount: relayRows.length, fileName };
  }

  const cl2Text = buildEntrySdif({
    file: { contactName: club.name, contactPhone: '', fileDate: now },
    meet,
    club,
    entries: enriched,
    relays: relayRows,
    today: now,
  });

  // The CL2's own name inside the archive, matching the archive's stem.
  const cl2Name = fileName.replace(/\.ZIP$/i, '.CL2');
  const readme = buildReadme({ meet, club, summary, relayCount: relayRows.length, fileName, cl2Name, now });

  // .cl2 is single-byte text: encode as latin1-comparable bytes (UTF-8 is
  // identical for the ASCII this format allows, and throws on nothing).
  const zipBytes = zipStore([
    { name: cl2Name, data: cl2Text },
    { name: 'README.TXT', data: readme },
  ], { date: now });

  return {
    ok: true,
    errors: [],
    warnings: validation.warnings,
    summary,
    relayCount: relayRows.length,
    fileName,
    cl2Name,
    cl2Text,
    readme,
    zipBytes,
  };
}
