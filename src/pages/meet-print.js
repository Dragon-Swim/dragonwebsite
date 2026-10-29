/**
 * Meet entry confirmation sheet — `meet-print.html`.
 *
 * What this page is for
 * ---------------------
 * Before the coach sends the entry file, every family should see exactly what is
 * being submitted on their behalf: which events, on which day, with which seed
 * time, and what it will cost. The coach prints this (or "Save as PDF") and
 * emails it; the family replies with any correction. That is the whole flow the
 * 2026-10-28 handoff left open, and it is why the page is a **separate Vite
 * entry** instead of a panel inside the dashboard: the dashboard rebuilds `#app`
 * on every Firestore snapshot, so anything rendered there can be wiped mid-review.
 *
 * Two modes, one renderer
 * -----------------------
 *   meet-print.html?meet=<id>                    coach: every family, one per page
 *   meet-print.html?meet=<id>&family=<familyId>  coach: one family
 *   meet-print.html?meet=<id>                    family: own family only
 *   …&status=all                                  include draft/submitted rows
 *
 * A family's own family id is always resolved from their sign-in, never from the
 * query string — a hand-edited URL must not be able to ask for another family's
 * sheet. (Firestore rules would block the read anyway, but the page should not
 * depend on that being the only wall.)
 *
 * Seed times come from `buildExportRows()`, which re-resolves them against
 * `swimResults` as they stand *now* and flags anything that moved since the
 * family submitted. That note is the single most valuable line on the sheet: it
 * is the difference between "what you agreed to" and "what we are sending".
 */

import '../styles/meet-print.css';

import {
  auth, db, onAuthStateChanged, doc, getDoc, getDocs, collection, query, where,
} from '../utils/firebase.js';
import { buildExportRows, summarizeExport, STATUS_LABELS } from '../utils/meetEntryExport.js';

const root = document.getElementById('mp-root');

const params = new URLSearchParams(window.location.search);
const MEET_ID = (params.get('meet') || '').trim();
const FAMILY_PARAM = (params.get('family') || '').trim();
const INCLUDE_ALL = params.get('status') === 'all';
const AUTO_PRINT = params.get('print') === '1';
const COACH_EMAIL = 'dragonswim@outlook.com';

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

// ── formatting ───────────────────────────────────────────────────────────

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** 'YYYY-MM-DD' -> { y, m, d } without the UTC shift `new Date()` would apply. */
function parts(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ''));
  return m ? { y: +m[1], m: +m[2], d: +m[3] } : null;
}

/** 'YYYY-MM-DD' -> 'Fri Dec 11'. Unknown dates stay blank, never 'Invalid Date'. */
function shortDate(iso) {
  const p = parts(iso);
  if (!p) return '';
  const dow = DAYS[new Date(Date.UTC(p.y, p.m - 1, p.d)).getUTCDay()];
  return `${dow} ${MONTHS[p.m - 1]} ${p.d}`;
}

/** A meet's own span: 'Dec 10–13, 2026', or 'Dec 28, 2026 – Jan 3, 2027'. */
function meetSpan(start, end) {
  const a = parts(start);
  const b = parts(end) || a;
  if (!a) return '';
  if (!b) return `${MONTHS[a.m - 1]} ${a.d}, ${a.y}`;
  if (a.y === b.y && a.m === b.m) return `${MONTHS[a.m - 1]} ${a.d}–${b.d}, ${a.y}`;
  if (a.y === b.y) return `${MONTHS[a.m - 1]} ${a.d} – ${MONTHS[b.m - 1]} ${b.d}, ${a.y}`;
  return `${MONTHS[a.m - 1]} ${a.d}, ${a.y} – ${MONTHS[b.m - 1]} ${b.d}, ${b.y}`;
}

/** Deadline keeps its time — "by Dec 1" and "by Dec 1, 8:00 PM" are not the same. */
function deadlineText(value) {
  if (!value) return '';
  const iso = String(value);
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return shortDate(iso);
  const dateBits = `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  if (!/T\d{2}:\d{2}/.test(iso)) return dateBits;
  return `${dateBits} at ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
}

const money = (n) => `$${Number(n).toFixed(2).replace(/\.00$/, '')}`;

function stamp() {
  const d = new Date();
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} at `
    + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

// ── state screens ────────────────────────────────────────────────────────

function screen(html, { error = false } = {}) {
  root.innerHTML = `<div class="mp-state${error ? ' mp-state--error' : ''}">${html}</div>`;
}

function loadingScreen() {
  screen('<p>Loading the entry sheet…</p>');
}

function errorScreen(message, hint = '') {
  screen(`<p>${esc(message)}</p>${hint ? `<p>${hint}</p>` : ''}`, { error: true });
}

// ── auth / role ──────────────────────────────────────────────────────────

async function resolveRole(user) {
  try {
    const snap = await getDoc(doc(db, 'users', user.uid));
    const dbRole = snap.exists() ? snap.data().role : null;
    const isCoachEmail = user.email && user.email.toLowerCase() === COACH_EMAIL;
    return (dbRole === 'coach' || dbRole === 'admin' || isCoachEmail) ? 'coach' : 'family';
  } catch {
    return 'family';
  }
}

/**
 * The signed-in family's registration document.
 *
 * Mirrors the dashboard: own document first, then a spouse lookup through
 * `parentEmails` (both parents can print the sheet for the same children).
 */
async function resolveFamily(user) {
  const own = await getDoc(doc(db, 'registrations', user.uid));
  if (own.exists()) return { familyId: own.id, family: own.data() };

  if (user.email) {
    try {
      const snap = await getDocs(query(
        collection(db, 'registrations'),
        where('parentEmails', 'array-contains', user.email),
      ));
      if (!snap.empty) return { familyId: snap.docs[0].id, family: snap.docs[0].data() };
    } catch {
      /* no spouse record, or the query is not allowed — fall through */
    }
  }
  return { familyId: null, family: null };
}

// ── data ─────────────────────────────────────────────────────────────────

/**
 * Entries are read differently per role, and that is a rules constraint rather
 * than a preference: `list` on `meets/{id}/entries` is coach-only, so a family
 * must `get` each document by its id (`{familyId}__{USA_ID}`).
 */
async function loadEntries({ role, meetId, familyId, swimmers }) {
  const entriesCol = collection(db, 'meets', meetId, 'entries');

  if (role === 'coach') {
    const snap = await getDocs(entriesCol);
    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return FAMILY_PARAM ? all.filter((e) => e.familyId === FAMILY_PARAM) : all;
  }

  const out = [];
  for (const sw of swimmers) {
    const usaId = String(sw.usaSwimmingId || '').trim().toUpperCase();
    if (!familyId || !usaId) continue;
    try {
      const snap = await getDoc(doc(entriesCol, `${familyId}__${usaId}`));
      if (snap.exists()) out.push({ id: snap.id, ...snap.data() });
    } catch (e) {
      console.warn('meet-print: entry not readable', usaId, e?.message);
    }
  }
  return out;
}

async function loadBestTimes(entries) {
  const ids = [...new Set(entries.map((e) => String(e.usaSwimmingId || '').trim()).filter(Boolean))];
  const map = {};
  await Promise.all(ids.map(async (id) => {
    try {
      const snap = await getDoc(doc(db, 'swimResults', id));
      map[id] = (snap.exists() ? snap.data().bestTimes : []) || [];
    } catch {
      map[id] = [];
    }
  }));
  return map;
}

/** Group rows into families → swimmers, keeping the family document's names. */
function groupByFamily(built, familyLookup) {
  const families = new Map();
  for (const row of built.rows) {
    const key = row.familyId || 'unknown';
    if (!families.has(key)) {
      const fam = familyLookup.get(key) || null;
      const parent = fam?.parent || {};
      families.set(key, {
        familyId: key,
        parentName: [parent.firstName, parent.lastName].filter(Boolean).join(' ')
          || fam?.parentName || fam?.email || '',
        email: parent.email || fam?.email || '',
        swimmers: new Map(),
        rows: [],
      });
    }
    const bucket = families.get(key);
    bucket.rows.push(row);
    const swKey = row.usaSwimmingId || row.swimmerName;
    if (!bucket.swimmers.has(swKey)) {
      bucket.swimmers.set(swKey, {
        usaSwimmingId: row.usaSwimmingId,
        swimmerName: row.swimmerName,
        ageAtMeet: row.ageAtMeet,
        rows: [],
      });
    }
    bucket.swimmers.get(swKey).rows.push(row);
  }
  const list = [...families.values()];
  list.sort((a, b) => String(a.parentName).localeCompare(String(b.parentName)));
  return list;
}

async function loadFamilyDocs(familyIds) {
  const map = new Map();
  await Promise.all(familyIds.map(async (id) => {
    if (!id || id === 'unknown') return;
    try {
      const snap = await getDoc(doc(db, 'registrations', id));
      if (snap.exists()) map.set(id, snap.data());
    } catch {
      /* the sheet still works without the parent's name */
    }
  }));
  return map;
}

// ── render ───────────────────────────────────────────────────────────────

function statusCell(row) {
  if (row.state === 'missing') return '<span class="mp-badge mp-badge--bad">No time</span>';
  if (row.state === 'manual') return '<span class="mp-badge mp-badge--warn">Typed time</span>';
  if (row.state === 'qualified') return '<span class="mp-badge mp-badge--ok">Qualifies</span>';
  return '<span class="mp-badge mp-badge--muted">Bonus entry</span>';
}

function eventRows(rows) {
  return rows.map((row) => `
        <tr class="mp-row" data-event="${esc(row.eventNo)}">
          <td class="mp-num">${esc(shortDate(row.day))}</td>
          <td>${esc(row.sessionLabel || '')}</td>
          <td>
            <span class="mp-event-name">#${esc(row.eventNo)} ${esc(row.eventLabel)}</span>
            <span class="mp-group">${esc(row.ageGroup || '')}${row.relay ? ' · relay' : ''}</span>
          </td>
          <td class="mp-num">${esc(row.seedTimeText || '—')}${row.course ? ` <span class="mp-group">${esc(row.course)}</span>` : ''}</td>
          <td class="mp-num">${esc(row.standardText || '—')}</td>
          <td>${statusCell(row)}</td>
        </tr>`).join('');
}

function swimmerBlock(swimmer, meet) {
  const rows = swimmer.rows;
  const refreshed = rows.filter((r) => r.changed);
  const fee = Number(meet?.entryFeePerEvent);
  const feeLine = Number.isFinite(fee)
    ? `<div class="mp-fees">
         <span>Estimated entry fees: ${rows.length} × ${money(fee)}</span>
         <span class="mp-fees-total">${money(rows.length * fee)}</span>
       </div>`
    : '';

  const pending = rows.filter((r) => r.status !== 'confirmed');
  const pendingNote = pending.length
    ? `<div class="mp-note">${esc(STATUS_LABELS[pending[0].status] || pending[0].status)} — not part of the submitted file yet.</div>`
    : '';

  const refreshNote = refreshed.length
    ? `<div class="mp-note mp-note--update">
         Times updated since you submitted:
         ${refreshed.map((r) => `${esc(r.eventLabel)} ${esc(r.storedSeedTimeText || '—')} → <strong>${esc(r.seedTimeText)}</strong>`).join('; ')}
       </div>`
    : '';

  const missingNote = rows.some((r) => r.state === 'missing')
    ? '<div class="mp-note mp-note--bad">An event has no seed time yet — the meet does not accept NT, so it cannot be submitted as it stands.</div>'
    : '';

  const sub = [
    swimmer.ageAtMeet != null ? `Age ${swimmer.ageAtMeet} at the meet` : '',
    rows[0]?.ageGroup || '',
    swimmer.usaSwimmingId ? `USA-S ${swimmer.usaSwimmingId}` : 'no USA Swimming ID',
  ].filter(Boolean).join(' · ');

  if (!rows.length) {
    return `<article class="mp-swimmer" data-swimmer="${esc(swimmer.usaSwimmingId || swimmer.swimmerName)}">
      <div class="mp-swimmer-head"><h3>${esc(swimmer.swimmerName)}</h3><span class="mp-swimmer-sub">${esc(sub)}</span></div>
      <div class="mp-note">No events entered.</div>
    </article>`;
  }

  return `<article class="mp-swimmer" data-swimmer="${esc(swimmer.usaSwimmingId || swimmer.swimmerName)}">
    <div class="mp-swimmer-head"><h3>${esc(swimmer.swimmerName)}</h3><span class="mp-swimmer-sub">${esc(sub)}</span></div>
    <table class="mp-events">
      <thead>
        <tr><th>Day</th><th>Session</th><th>Event</th><th>Seed time</th><th>Cut-off</th><th>Status</th></tr>
      </thead>
      <tbody>${eventRows(rows)}</tbody>
    </table>
    ${pendingNote}${refreshNote}${missingNote}${feeLine}
  </article>`;
}

function familyBlock(family, meet) {
  const swimmers = [...family.swimmers.values()];
  const title = family.parentName ? `${family.parentName}` : 'Family';
  const meta = [family.email].filter(Boolean).join(' · ');
  return `<section class="mp-family" data-family="${esc(family.familyId)}">
    <div class="mp-family-head">
      <h2>${esc(title)}</h2>
      <div class="mp-family-meta">${esc(meta)}</div>
    </div>
    ${swimmers.map((s) => swimmerBlock(s, meet)).join('')}
    <div class="mp-sign">
      <label><input type="checkbox" /> I confirm these entries are correct, and that any change must be
        reported before the entry deadline.</label>
      <div class="mp-sign-line"><span>Signature</span><span>Date</span></div>
    </div>
  </section>`;
}

/** Coach-facing pre-flight box: what is missing before this can be sent. */
function checkBox(built, meet, excluded) {
  const summary = summarizeExport({ rows: built.rows, excluded, noId: built.noId });
  const problems = [];
  if (summary.missing) problems.push(`<li class="mp-check-error">${summary.missing} row(s) have no seed time</li>`);
  if (summary.noUsaId) problems.push(`<li class="mp-check-error">${summary.noUsaId} confirmed swimmer(s) have no USA Swimming ID</li>`);
  if (summary.notConfirmed) problems.push(`<li class="mp-check-warn">${summary.notConfirmed} entr(y/ies) not confirmed and therefore not in the file</li>`);
  if (summary.refreshed) problems.push(`<li class="mp-check-warn">${summary.refreshed} seed time(s) changed since submission — sheets below show the new value</li>`);
  if (summary.manual) problems.push(`<li class="mp-check-warn">${summary.manual} row(s) rely on a typed seed time</li>`);
  if (summary.bonusOnly) problems.push(`<li class="mp-check-warn">${summary.bonusOnly} row(s) are slower than the line (bonus entries)</li>`);
  return `<div class="mp-check">
    <h2>Pre-flight (coach view)</h2>
    <div>${summary.swimmerCount} swimmer(s) · ${summary.rowCount} event(s) ·
      ${summary.qualified} qualifying · deadline ${esc(deadlineText(meet.entryDeadline) || 'n/a')}</div>
    ${problems.length ? `<ul>${problems.join('')}</ul>` : '<div>Nothing outstanding.</div>'}
  </div>`;
}

function meetHead(meet) {
  return `<header class="mp-head">
    <div class="mp-brand">Dragon Swim Team</div>
    <h1>Meet entry confirmation</h1>
    <div class="mp-meet-name">${esc(meet.name || 'Meet')}</div>
    <div class="mp-meet-meta">
      ${esc(meetSpan(meet.startDate, meet.endDate))}${meet.location ? ` · ${esc(meet.location)}` : ''}
      ${meet.entryDeadline ? `<br />Entries close ${esc(deadlineText(meet.entryDeadline))}` : ''}
      <br />Generated ${esc(stamp())}
    </div>
  </header>`;
}

function render({ meet, built, families, role }) {
  const sheets = families.map((f) => familyBlock(f, meet)).join('');
  const empty = '<div class="mp-note">No entries to show for this meet yet.</div>';
  const toolbar = `<div class="mp-toolbar">
      <button type="button" class="mp-print-btn">🖨 Print / Save as PDF</button>
      <span class="mp-toolbar-note">Choose “Save as PDF” in the print dialog to email this to the family.</span>
    </div>`;

  root.innerHTML = `${toolbar}
    <div class="mp-sheet" data-meet="${esc(meet.id || MEET_ID)}">
      ${meetHead(meet)}
      ${role === 'coach' ? checkBox(built, meet, built.excluded) : ''}
      ${families.length ? sheets : empty}
    </div>`;

  root.querySelector('.mp-print-btn')?.addEventListener('click', () => {
    try { window.print(); } catch { /* headless browsers have no print dialog */ }
  });

  if (AUTO_PRINT) {
    // Let the browser finish layout before opening the dialog.
    setTimeout(() => { try { window.print(); } catch { /* ignore */ } }, 150);
  }
}

// ── boot ─────────────────────────────────────────────────────────────────

async function boot(user) {
  if (!MEET_ID) {
    errorScreen('This link is missing the meet id.', 'Ask the coach for the link again.');
    return;
  }

  const role = await resolveRole(user);

  let meet;
  try {
    const snap = await getDoc(doc(db, 'meets', MEET_ID));
    if (!snap.exists()) {
      errorScreen('That meet could not be found.', 'It may have been removed.');
      return;
    }
    meet = { id: snap.id, ...snap.data() };
  } catch (e) {
    errorScreen('Could not read the meet.', esc(e?.message || ''));
    return;
  }

  let familyId = null;
  let swimmers = [];
  if (role === 'family') {
    const resolved = await resolveFamily(user);
    familyId = resolved.familyId;
    swimmers = (resolved.family?.swimmers || []).filter((s) => !s.deleted);
    if (!familyId) {
      errorScreen('We could not find your registration.', 'Sign in with the account you registered with, or ask the coach.');
      return;
    }
  }

  let entries = [];
  try {
    entries = await loadEntries({ role, meetId: MEET_ID, familyId, swimmers });
  } catch (e) {
    errorScreen('Could not read the entries for this meet.', esc(e?.message || ''));
    return;
  }

  const bestTimesById = await loadBestTimes(entries);
  const built = buildExportRows({
    meet,
    entries,
    bestTimesById,
    // A family previewing before the coach confirms should still see the rows.
    statuses: INCLUDE_ALL ? ['confirmed', 'submitted', 'draft', 'declined'] : ['confirmed'],
  });

  const familyDocs = await loadFamilyDocs([...new Set(built.rows.map((r) => r.familyId))]);
  if (role === 'family') {
    const own = await resolveFamily(user);
    if (own.familyId) familyDocs.set(own.familyId, own.family);
  }

  const families = groupByFamily(built, familyDocs);

  // A family with nothing confirmed yet still deserves an explanation.
  if (!families.length) {
    render({ meet, built, families: [], role });
    return;
  }
  render({ meet, built, families, role });
}

loadingScreen();

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = `${import.meta.env.BASE_URL}signin.html`;
    return;
  }
  boot(user).catch((e) => {
    console.error('meet-print failed:', e);
    errorScreen('Something went wrong while building the sheet.', esc(e?.message || ''));
  });
});
