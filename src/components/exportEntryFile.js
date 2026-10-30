/**
 * "Export entry file" — the browser half of the meet-entry package.
 *
 * A coach will not open a terminal, so the `.cl2` (and the zip around it) has to
 * come from a button. This module only **fetches** — the decision of what goes
 * into the file is `src/utils/meetEntryPackage.js`, shared with the command-line
 * exporter so the two cannot drift.
 *
 * What it reads (all of it coach-readable under firestore.rules):
 *   meets/{id}/entries/*        the family entries for this meet
 *   meets/{id}/relayEntries/*   the relay squads
 *   swimResults/{usaId}         best times, re-resolved at export time
 * and it is handed `swimmers` (the roster rows the entries modal already has) for
 * birth dates and structured names — D0 needs `dob` and "Last, First MI".
 *
 * Nothing is sent anywhere: the zip is built in memory and downloaded.
 */

import { db, collection, doc, getDoc, getDocs } from '../utils/firebase.js';
import { buildEntryPackage, CLUB_DEFAULTS } from '../utils/meetEntryPackage.js';

/** Trigger a browser download for a byte array. */
function downloadBytes(bytes, fileName, mime = 'application/zip') {
  const blob = new Blob([bytes], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Build and download the entry-file package for one meet.
 *
 * @param {object} opts
 * @param {object} opts.meet      meet document (with id)
 * @param {Array}  opts.swimmers  [{ usaId, firstName, lastName, dob, age, gender }]
 * @param {Function} [opts.onProgress]  called with a short status string
 * @returns {Promise<{ok: boolean, message: string, fileName?: string, summary?: object}>}
 */
export async function exportEntryFileZip({ meet, swimmers = [], onProgress = () => {} }) {
  const meetId = meet?.id;
  if (!meetId) return { ok: false, message: 'This meet has no id.' };
  if (!Array.isArray(meet.events) || !meet.events.length) {
    return { ok: false, message: 'This meet has no event table yet.' };
  }

  try {
    onProgress('Reading entries…');
    const entriesSnap = await getDocs(collection(db, 'meets', meetId, 'entries'));
    const entries = entriesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    onProgress('Reading relay squads…');
    const relaySnap = await getDocs(collection(db, 'meets', meetId, 'relayEntries'));
    const relays = relaySnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Best times for the swimmers who actually appear in an entry.
    const ids = [...new Set(entries.map((e) => String(e.usaSwimmingId || '').trim().toUpperCase()).filter(Boolean))];
    onProgress(`Reading times for ${ids.length} swimmer(s)…`);
    const bestTimesById = {};
    await Promise.all(ids.map(async (id) => {
      try {
        const snap = await getDoc(doc(db, 'swimResults', id));
        bestTimesById[id] = (snap.exists() ? snap.data().bestTimes : []) || [];
      } catch {
        bestTimesById[id] = [];
      }
    }));

    const swimmerById = {};
    for (const s of swimmers) {
      const id = String(s.usaId || s.usaSwimmingId || '').trim().toUpperCase();
      if (id) swimmerById[id] = s;
    }

    onProgress('Building the .cl2…');
    const pkg = buildEntryPackage({
      meet, entries, relays, swimmerById, bestTimesById, club: CLUB_DEFAULTS, now: new Date(),
    });

    if (!pkg.ok) {
      // A bare code list ("bonus-exceeded, missing-seed-time") tells the coach
      // nothing actionable, and these are the errors that block the whole file.
      const describe = (e) => {
        if (e.code === 'bonus-exceeded') return `${e.swimmer || e.usaSwimmingId}: ${e.detail}`;
        return e.detail ? `${e.code} (${e.detail})` : e.code;
      };
      const shown = pkg.errors.slice(0, 4).map(describe).join('; ');
      const more = pkg.errors.length > 4 ? ` (+${pkg.errors.length - 4} more)` : '';
      return { ok: false, message: `Nothing exported — ${pkg.errors.length} problem(s): ${shown}${more}`, summary: pkg.summary };
    }

    onProgress('Zipping…');
    downloadBytes(pkg.zipBytes, pkg.fileName);

    const s = pkg.summary;
    return {
      ok: true,
      fileName: pkg.fileName,
      summary: s,
      message: `${pkg.fileName} — ${s.swimmerCount} swimmers, ${s.rowCount} entries, ${pkg.relayCount} relay squads`,
    };
  } catch (error) {
    return { ok: false, message: error?.message || String(error) };
  }
}
