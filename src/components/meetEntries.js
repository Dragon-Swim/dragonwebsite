/**
 * Meet entries — parent self-service + coach review, as a body-level modal.
 *
 * WHY A MODAL AND NOT A TAB SECTION
 * ---------------------------------
 * The dashboard rebuilds its whole DOM on every Firestore snapshot
 * (initDataListeners → refreshUI → app.innerHTML = …; see
 * docs/meet-management.md §4). A selection form rendered inside that tree would
 * be wiped mid-edit by any unrelated write — the exact bug that made coaches
 * believe "the meet title cannot be changed". Everything here is appended to
 * <body>, so no dashboard re-render can touch it.
 *
 * DATA
 * ----
 *   meets/{meetId}                      → events[], sessions[], limits, entryDeadline
 *   meets/{meetId}/entries/{docId}      → one doc per swimmer (this file writes them)
 *   swimResults/{usaId}.bestTimes       → read-only, used for the standards check
 *
 * docId is `${familyId}__${USA_SWIMMING_ID}` (see entryDocId). Entering a meet
 * requires a USA Swimming ID (decision 2026-10-28), so the id is always present
 * and never moves when the roster array is reordered.
 *
 * WHO MAY DO WHAT
 * ---------------
 *   family : create/update own entries while status ∈ {draft, submitted} and the
 *            deadline has not passed (firestore.rules enforces the same).
 *   coach  : edit anyone, confirm/decline, after the deadline too.
 * Time standards NEVER block a submission — they only produce warnings, because
 * our results snapshot can lag the pool by days (decision 2026-10-28).
 */
import {
  db, doc, getDoc, setDoc, collection, onSnapshot, serverTimestamp,
} from '../utils/firebase.js';
import {
  buildMeetOptions, validateSelection, isPastDeadline, formatDeadline,
  entryDocId, formatSwimSeconds, groupOptionsByDay,
} from '../utils/meetEligibility.js';
import { t } from '../utils/i18n.js';

const STATUS_KEYS = {
  draft: 'meet_entries_status_draft',
  submitted: 'meet_entries_status_submitted',
  confirmed: 'meet_entries_status_confirmed',
  declined: 'meet_entries_status_declined',
  none: 'meet_entries_status_none',
};

const esc = (v) => String(v ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** Firestore Timestamp | ISO string | Date | null → Date | null. */
function asDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value.toDate === 'function') return value.toDate();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

const state = {
  meet: null,
  role: 'family',
  swimmers: [],
  familyId: null,
  actorId: null,
  entries: new Map(),      // docId → entry
  bestTimes: new Map(),    // usaId → { list, fetchedAt, error }
  view: 'list',            // 'list' | 'editor'
  active: null,            // swimmer object in the editor
  ctx: null,               // buildMeetOptions() result for the active swimmer
  selected: new Set(),
  manualTimes: {},
  note: '',
  status: 'draft',
  search: '',
  filter: 'all',
  loading: true,
  saving: false,
  error: '',
  unsubscribe: null,
};

// ── public API ───────────────────────────────────────────────────────────

export function closeMeetEntries() {
  state.unsubscribe?.();
  state.unsubscribe = null;
  document.getElementById('meet-entries-container')?.remove();
}

/**
 * @param {object} opts
 * @param {object} opts.meet       meet document (must include id)
 * @param {string} opts.role       'coach' | 'admin' | 'family'
 * @param {Array}  opts.swimmers   [{ familyId, usaId, name, dob, gender }]
 * @param {string} [opts.familyId] family uid (family view)
 * @param {string} [opts.actorId]  current user uid
 */
export function openMeetEntries({ meet, role, swimmers, familyId = null, actorId = null }) {
  closeMeetEntries();
  const familySwimmers = (swimmers || []).filter((s) => s.usaId);
  Object.assign(state, {
    meet, role, swimmers: swimmers || [], familyId, actorId,
    entries: new Map(), bestTimes: new Map(), loading: true, error: '',
    // Straight into the editor only when there is exactly one enterable child;
    // otherwise the family gets a picker (and a "no USA ID" explanation card).
    view: role === 'family' && (swimmers || []).length === 1 && familySwimmers.length === 1
      ? 'editor' : 'list',
    active: null, ctx: null, selected: new Set(), manualTimes: {}, note: '',
    status: 'draft', search: '', filter: 'all', saving: false,
  });

  const container = document.createElement('div');
  container.id = 'meet-entries-container';
  container.addEventListener('click', onClick);
  container.addEventListener('change', onChange);
  container.addEventListener('input', onInput);
  document.body.appendChild(container);

  // Coaches listen to the whole meet; families read only their own documents.
  // The security rules cannot grant a *list* on `resource.data.familyId` (a list
  // rule is evaluated without a concrete document, so that property is
  // undefined), so a family must `get` the two or three docs it already knows
  // the ids of. See firestore.rules → meets/{meetId}/entries.
  const ready = isCoach() ? subscribeMeetEntries() : loadFamilyEntries();

  paint();

  Promise.resolve(ready).then(() => {
    if (state.view !== 'editor') return;
    const first = state.swimmers.find((s) => s.usaId);
    if (first) openSwimmer(first);
  });
}

function subscribeMeetEntries() {
  state.unsubscribe = onSnapshot(
    collection(db, 'meets', state.meet.id, 'entries'),
    (snap) => {
      state.entries = new Map(snap.docs.map((d) => [d.id, { id: d.id, ...d.data() }]));
      state.loading = false;
      // Never repaint the editor from a snapshot: the coach may be typing in it.
      if (state.view === 'list') paint();
      else paintHeaderMeta();
    },
    (err) => {
      console.error('[meetEntries] entries listener failed:', err);
      state.loading = false;
      state.error = err.message || String(err);
      paint();
    },
  );
}

async function loadFamilyEntries() {
  const ids = state.swimmers.map((s) => swimmerDocId(s)).filter(Boolean);
  const snaps = await Promise.all(ids.map((id) =>
    getDoc(doc(db, 'meets', state.meet.id, 'entries', id)).catch((err) => {
      console.error('[meetEntries] entry read failed:', id, err);
      return null;
    })));
  for (const snap of snaps) {
    if (snap?.exists()) state.entries.set(snap.id, { id: snap.id, ...snap.data() });
  }
  state.loading = false;
  if (state.view === 'list') paint();
}

// ── derived helpers ──────────────────────────────────────────────────────

const isCoach = () => state.role === 'coach' || state.role === 'admin';
const pastDeadline = () => isPastDeadline(state.meet);
const locked = () => pastDeadline() && !isCoach();

const swimmerDocId = (sw) => entryDocId(sw.familyId, sw.usaId);
const entryOf = (sw) => {
  const id = swimmerDocId(sw);
  return id ? state.entries.get(id) || null : null;
};
const statusOf = (sw) => entryOf(sw)?.status || 'none';
const eventCountOf = (sw) => (Array.isArray(entryOf(sw)?.events) ? entryOf(sw).events.length : 0);

function badge(status) {
  return `<span class="me-badge me-badge--${status}">${esc(t(STATUS_KEYS[status] || STATUS_KEYS.none))}</span>`;
}

async function loadBestTimes(usaId) {
  if (!usaId) return { list: [] };
  if (state.bestTimes.has(usaId)) return state.bestTimes.get(usaId);
  let result;
  try {
    const snap = await getDoc(doc(db, 'swimResults', usaId));
    const data = snap.exists() ? snap.data() : {};
    result = {
      list: data.bestTimes || [],
      fetchedAt: data.lastFetchSuccessAt || data.lastUpdated || null,
    };
  } catch (err) {
    console.error('[meetEntries] bestTimes read failed:', err);
    result = { list: [], fetchedAt: null, error: err.message };
  }
  state.bestTimes.set(usaId, result);
  return result;
}

// ── paint ────────────────────────────────────────────────────────────────

function paint() {
  const container = document.getElementById('meet-entries-container');
  if (!container) return;
  const meet = state.meet;
  container.innerHTML = `
    <div class="meet-entries-overlay" id="meet-entries-overlay">
      <div class="meet-entries-modal" role="dialog" aria-modal="true" aria-label="${esc(meet.name || 'Meet entries')}">
        <div class="me-header">
          <div class="me-header-text">
            <h2>${esc(meet.name || 'Meet')}</h2>
            <p class="me-sub" id="me-header-meta">${headerMetaHtml()}</p>
          </div>
          <button type="button" class="me-close" id="me-close" aria-label="Close">×</button>
        </div>
        <div class="me-body" id="me-body">${state.view === 'list' ? listHtml() : editorHtml()}</div>
        <div class="me-footer" id="me-footer">${footerHtml()}</div>
      </div>
    </div>
  `;
  if (state.view === 'editor') refreshSummary();
}

function paintHeaderMeta() {
  const el = document.getElementById('me-header-meta');
  if (el) el.innerHTML = headerMetaHtml();
}

function headerMetaHtml() {
  const parts = [];
  const start = state.meet?.startDate;
  const end = state.meet?.endDate;
  if (start) parts.push(esc(`${start}${end && end !== start ? ` – ${end}` : ''}`));
  const deadline = formatDeadline(state.meet);
  if (deadline) parts.push(`${esc(t('meet_entries_deadline'))}: ${esc(deadline)}`);
  if (pastDeadline()) parts.push(`<strong class="me-closed">${esc(t('meet_entries_closed'))}</strong>`);
  return parts.join(' · ');
}

// ── list view ────────────────────────────────────────────────────────────

function listHtml() {
  return isCoach() ? coachListHtml() : familyListHtml();
}

function familyListHtml() {
  const cards = state.swimmers.map((sw) => {
    if (!swimmerDocId(sw)) {
      return `<div class="me-family-card me-family-card--blocked">
        <strong>${esc(sw.name)}</strong>
        <p class="me-hint">${esc(t('meet_entries_blocked_no_id'))}</p>
      </div>`;
    }
    const status = statusOf(sw);
    const e = entryOf(sw);
    const when = e?.submittedAt?.toDate?.() || (e?.submittedAt ? new Date(e.submittedAt) : null);
    return `<div class="me-family-card">
      <div>
        <strong>${esc(sw.name)}</strong>
        <div class="me-sub">${sw.age != null ? `${sw.age} · ` : ''}${esc(sw.ageGroup || '')}</div>
      </div>
      <div class="me-family-card-right">
        ${badge(status)}
        <span class="me-sub">${eventCountOf(sw)} ${esc(t('meet_entries_events_short'))}
          ${when && !Number.isNaN(when.getTime()) ? ` · ${esc(when.toLocaleDateString())}` : ''}</span>
        <button type="button" class="btn btn-outline btn-sm" data-action="edit" data-usa="${esc(sw.usaId)}">
          ${esc(t(status === 'none' ? 'meet_entries_enter' : 'meet_entries_review'))}
        </button>
      </div>
    </div>`;
  }).join('');

  return `<div class="me-family-list">${cards}</div>`;
}

function coachListHtml() {
  const withId = state.swimmers.filter((s) => swimmerDocId(s));
  const withoutId = state.swimmers.length - withId.length;
  const counts = { none: 0, draft: 0, submitted: 0, confirmed: 0, declined: 0 };
  for (const sw of withId) counts[statusOf(sw)] = (counts[statusOf(sw)] || 0) + 1;

  const options = [
    ['all', t('meet_entries_filter_all')],
    ['submitted', t('meet_entries_filter_submitted')],
    ['confirmed', t('meet_entries_filter_confirmed')],
    ['none', t('meet_entries_filter_none')],
  ];

  return `
    <div class="me-toolbar">
      <input type="search" id="me-search" class="me-search" placeholder="${esc(t('meet_entries_search'))}" value="${esc(state.search)}">
      <select id="me-filter" class="me-filter">
        ${options.map(([v, label]) => `<option value="${v}" ${state.filter === v ? 'selected' : ''}>${esc(label)}</option>`).join('')}
      </select>
      <span class="me-counts">${esc(t('meet_entries_counts', {
        total: withId.length, submitted: counts.submitted, confirmed: counts.confirmed,
      }))}</span>
    </div>
    <div id="me-list-body">${coachListRowsHtml()}</div>
    ${withoutId > 0 ? `<p class="me-hint">${esc(t('meet_entries_no_usa_id_hint', { count: withoutId }))}</p>` : ''}
  `;
}

function coachListRowsHtml() {
  const q = state.search.trim().toLowerCase();
  const rows = state.swimmers
    .filter((s) => swimmerDocId(s))
    .map((sw) => ({ sw, status: statusOf(sw), count: eventCountOf(sw) }))
    .filter(({ sw, status }) => {
      if (q && !String(sw.name).toLowerCase().includes(q)) return false;
      return state.filter === 'all' ? true : status === state.filter;
    })
    .sort((a, b) => String(a.sw.name).localeCompare(String(b.sw.name)));

  if (state.loading) return `<p class="me-empty">${esc(t('meet_entries_loading'))}</p>`;
  if (rows.length === 0) return `<p class="me-empty">${esc(t('meet_entries_none_match'))}</p>`;

  return `
    <table class="me-table">
      <thead>
        <tr>
          <th>${esc(t('meet_entries_col_swimmer'))}</th>
          <th>${esc(t('meet_entries_col_group'))}</th>
          <th>${esc(t('meet_entries_col_events'))}</th>
          <th>${esc(t('meet_entries_col_status'))}</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(({ sw, status, count }) => `
          <tr>
            <td class="me-name">${esc(sw.name)}</td>
            <td>${sw.age != null ? `${sw.age} · ` : ''}${esc(sw.ageGroup || '')}</td>
            <td>${count}</td>
            <td>${badge(status)}</td>
            <td class="me-row-action">
              <button type="button" class="btn btn-outline btn-sm" data-action="edit" data-usa="${esc(sw.usaId)}">
                ${esc(t(status === 'none' ? 'meet_entries_add' : 'meet_entries_review'))}
              </button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// ── editor view ──────────────────────────────────────────────────────────

function editorHtml() {
  const sw = state.active;
  if (!sw) return `<p class="me-empty">${esc(t('meet_entries_pick_swimmer'))}</p>`;
  if (!state.ctx) return `<p class="me-empty">${esc(t('meet_entries_loading'))}</p>`;

  const isOpenSwimmer = state.ctx.ageGroup === 'Open';
  // Open events are enterable by any age but are parked in a collapsed section,
  // never preselected — a 12-year-old belongs in the 11-12 table, not against
  // 17-year-olds, unless the family deliberately chooses it.
  const primary = isOpenSwimmer
    ? state.ctx.individual
    : state.ctx.individual.filter((o) => !o.isOpenGroup);
  const openExtra = isOpenSwimmer
    ? []
    : state.ctx.individual.filter((o) => o.isOpenGroup);
  const days = groupOptionsByDay(primary);
  const relays = state.ctx.relays;
  const isLocked = locked();
  const openSelected = openExtra.some((o) => state.selected.has(o.key));

  return `
    ${isCoach() ? `<button type="button" class="btn btn-outline btn-sm me-back" data-action="back">← ${esc(t('meet_entries_back'))}</button>` : ''}
    <div class="me-swimmer-head">
      <div class="me-swimmer-id">
        <h3>${esc(sw.name)}</h3>
        <p class="me-sub">
          ${esc(t('meet_entries_swims_as', {
            age: state.ctx.age ?? '—',
            group: state.ctx.ageGroup || '—',
            date: state.meet.ageDeterminedOn || state.meet.startDate || '',
          }))}
          · ${esc(state.ctx.qualifiedCount > 0
            ? t('meet_entries_qualifies_count', { count: state.ctx.qualifiedCount })
            : t('meet_entries_qualifies_none'))}
          ${state.status !== 'none' ? ` · ${badge(state.status)}` : ''}
        </p>
        ${state.ctx.fetchedAt ? `<p class="me-sub me-freshness">${esc(t('meet_entries_data_as_of', {
          date: (asDate(state.ctx.fetchedAt) || new Date()).toLocaleDateString(),
        }))}</p>` : ''}
      </div>
      <div id="me-summary" class="me-summary"></div>
    </div>

    ${isLocked ? `<p class="me-alert">${esc(t('meet_entries_locked'))}</p>` : ''}
    ${state.ctx.blocked.length ? `<p class="me-alert">${esc(blockedText())}</p>` : ''}
    ${days.length === 0 && !state.ctx.blocked.length ? `<p class="me-empty">${esc(t('meet_entries_no_events'))}</p>` : ''}

    ${days.map((d) => `
      <section class="me-day">
        <h4>${esc(dayLabel(d.day))}</h4>
        ${[...d.sessions.values()].map((s) => `
          <div class="me-session">
            ${s.label ? `<div class="me-session-label">${esc(s.label)}</div>` : ''}
            ${s.options.map((o) => eventRow(o, { isLocked })).join('')}
          </div>
        `).join('')}
      </section>
    `).join('')}

    ${openExtra.length ? `
      <details class="me-open" ${openSelected ? 'open' : ''}>
        <summary>${esc(t('meet_entries_open_title'))}</summary>
        <p class="me-hint">${esc(t('meet_entries_open_hint'))}</p>
        ${openExtra.map((o) => eventRow(o, { isLocked, markOpen: true })).join('')}
      </details>
    ` : ''}

    ${relays.length ? `
      <section class="me-day">
        <h4>${esc(t('meet_entries_relays_title'))}</h4>
        <p class="me-hint">${esc(t('meet_entries_relays_hint'))}</p>
        <div class="me-relay-list">
          ${relays.map((o) => `<span class="me-relay-chip">#${o.eventNo} ${esc(o.ageGroup)} ${esc(o.label)}</span>`).join('')}
        </div>
      </section>
    ` : ''}

    <div id="me-problems" class="me-problems"></div>

    <label class="me-note-label" for="me-note">${esc(t(isCoach() ? 'meet_entries_coach_note' : 'meet_entries_note'))}</label>
    <textarea id="me-note" class="me-note" rows="2" placeholder="${esc(t('meet_entries_note_placeholder'))}" ${isLocked ? 'disabled' : ''}>${esc(state.note)}</textarea>
  `;
}

function dayLabel(day) {
  if (!day || day === 'unknown') return t('meet_entries_day_unknown');
  const d = new Date(`${day}T00:00:00`);
  if (Number.isNaN(d.getTime())) return day;
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function blockedText() {
  const map = {
    'no-usa-id': t('meet_entries_blocked_no_id'),
    'no-dob': t('meet_entries_blocked_no_dob'),
    'no-gender': t('meet_entries_blocked_no_gender'),
  };
  return state.ctx.blocked.map((b) => map[b] || b).join(' ');
}

function eventRow(o, { isLocked, markOpen = false }) {
  const checked = state.selected.has(o.key);
  const disabled = isLocked || o.relay;
  const cls = `me-row me-row--${o.state}${checked ? ' is-selected' : ''}${markOpen ? ' is-open' : ''}`;
  const manual = o.state === 'no-time' ? `
    <span class="me-manual-wrap"${checked ? '' : ' hidden'}>
      <input type="text" class="me-manual" data-manual="${esc(o.key)}"
             placeholder="${esc(t('meet_entries_manual_time'))}"
             value="${esc(state.manualTimes[o.key] || '')}" ${isLocked ? 'disabled' : ''}>
    </span>` : '';

  return `
    <div class="${cls}" data-event-row="${esc(o.key)}">
      <label class="me-row-main">
        <input type="checkbox" data-key="${esc(o.key)}" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}>
        <span class="me-evt-no">#${o.eventNo}</span>
        <span class="me-evt-label">${esc(o.ageGroup)} ${esc(o.label)}</span>
        <span class="me-evt-time">${describeTime(o)}</span>
      </label>
      ${manual}
    </div>
  `;
}

function describeTime(o) {
  if (o.noStandard) {
    return `<span class="me-state me-state--none">${esc(t('meet_entries_no_line'))}</span>`;
  }
  if (o.state === 'qualified') {
    return `<span class="me-state me-state--ok">✅ ${esc(formatSwimSeconds(o.bestSeconds))} ${esc(o.bestCourse)}</span>
      <small>${esc(t('meet_entries_line'))} ${esc(formatSwimSeconds(o.standardSeconds))}${o.bestDate ? ` · ${esc(o.bestDate)}` : ''}</small>`;
  }
  if (o.state === 'slower') {
    return `<span class="me-state me-state--warn">⚠️ ${esc(formatSwimSeconds(o.bestSeconds))} ${esc(o.bestCourse)}</span>
      <small>${esc(t('meet_entries_line'))} ${esc(formatSwimSeconds(o.standardSeconds))} · ${esc(t('meet_entries_gap', { gap: Number(o.gapSeconds).toFixed(2) }))}</small>`;
  }
  const stale = o.staleSeconds != null
    ? ` <small>${esc(t('meet_entries_stale', { time: formatSwimSeconds(o.staleSeconds), date: o.staleDate }))}</small>`
    : '';
  // Even with no time on record the family still needs the line they must beat
  // when they type a seed time in.
  const lineFor = o.standards?.SCY != null
    ? `${formatSwimSeconds(o.standards.SCY)} SCY`
    : (o.standards?.LCM != null ? `${formatSwimSeconds(o.standards.LCM)} LCM` : '');
  const lineText = lineFor ? ` <small>${esc(t('meet_entries_line'))} ${esc(lineFor)}</small>` : '';
  return `<span class="me-state me-state--none">${esc(t('meet_entries_no_time'))}</span>${lineText}${stale}`;
}

// ── footer ───────────────────────────────────────────────────────────────

/**
 * Link to the printable confirmation sheet (`meet-print.html`).
 *
 * It is a plain <a download-less href>, not a click handler, because the sheet
 * is its own page: the dashboard rebuilds `#app` on every snapshot, so a sheet
 * rendered inside this modal would be wiped by any other family saving an entry
 * — the same reason the modal itself is body-level.
 */
function printLink(extra, label) {
  const meetId = encodeURIComponent(state.meet?.id || '');
  const href = `${import.meta.env.BASE_URL}meet-print.html?meet=${meetId}${extra}`;
  return `<a class="btn btn-outline btn-sm me-print" href="${href}" target="_blank" rel="noopener">${esc(label)}</a>`;
}

function footerHtml() {
  if (state.view === 'list') {
    // Two different deliverables: per-family confirmation sheets (one household
    // per page, with a signature block) and the whole-team report in the layout
    // families already know (FEMALE / MALE, surname order).
    return `<span class="me-footer-note">${esc(t('meet_entries_footer_list'))}</span>`
      + printLink('', t('meet_entries_print_all'))
      + printLink('&group=sex', t('meet_entries_print_team'));
  }
  if (!state.ctx?.canEnter) {
    return `<button type="button" class="btn btn-outline btn-sm" data-action="back">${esc(t('meet_entries_back'))}</button>`;
  }
  const isLocked = locked();
  const disabled = state.saving || isLocked ? 'disabled' : '';
  // A family prints its own sheet; the family id itself is re-derived from the
  // sign-in on that page, so passing it here is only a convenience for coaches.
  const sheetLink = printLink(
    isCoach() ? `&family=${encodeURIComponent(state.familyId || '')}` : '&status=all',
    t('meet_entries_print_sheet'),
  );

  if (isCoach()) {
    return `
      <button type="button" class="btn btn-primary btn-sm" data-action="confirm" ${disabled}>${esc(t('meet_entries_save_confirm'))}</button>
      <button type="button" class="btn btn-outline btn-sm" data-action="save" ${disabled}>${esc(t('meet_entries_save'))}</button>
      <button type="button" class="btn btn-outline btn-sm me-danger" data-action="decline" ${disabled}>${esc(t('meet_entries_decline'))}</button>
      ${state.status === 'confirmed' || state.status === 'declined'
        ? `<button type="button" class="btn btn-outline btn-sm" data-action="reopen" ${disabled}>${esc(t('meet_entries_reopen'))}</button>` : ''}
      ${sheetLink}
      <span class="me-footer-note me-save-note"></span>
    `;
  }
  return `
    <button type="button" class="btn btn-primary btn-sm" data-action="submit" ${disabled}>${esc(t('meet_entries_submit'))}</button>
    <button type="button" class="btn btn-outline btn-sm" data-action="draft" ${disabled}>${esc(t('meet_entries_save_draft'))}</button>
    ${sheetLink}
    <span class="me-footer-note me-save-note">${esc(state.saving ? t('meet_entries_saving') : (state.error || ''))}</span>
  `;
}

// ── summary + problem text ───────────────────────────────────────────────

function refreshSummary() {
  if (!state.ctx) return null;
  const result = validateSelection({
    meet: state.meet,
    context: state.ctx,
    selected: [...state.selected],
    manualTimes: state.manualTimes,
  });

  const summary = document.getElementById('me-summary');
  const problems = document.getElementById('me-problems');

  if (summary) {
    const max = state.meet?.limits?.maxEvents;
    const perDay = Object.entries(result.counts.byDay || {})
      .map(([d, n]) => `${dayLabel(d)} ${n}/${state.meet?.limits?.maxPerDay ?? '–'}`)
      .join(' · ');
    summary.innerHTML = `
      <strong>${result.counts.total}${max ? ` / ${max}` : ''}</strong> ${esc(t('meet_entries_events_chosen'))}
      ${perDay ? `<div class="me-summary-days">${esc(perDay)}</div>` : ''}
    `;
  }

  if (problems) {
    const items = [
      ...result.errors.map((e) => `<li class="me-problem me-problem--error">⛔ ${esc(problemText(e))}</li>`),
      ...result.warnings.map((w) => `<li class="me-problem me-problem--warn">⚠️ ${esc(problemText(w))}</li>`),
    ];
    problems.innerHTML = items.length ? `<ul>${items.join('')}</ul>` : '';
  }

  const submitBtn = document.querySelector('[data-action="submit"], [data-action="confirm"]');
  if (submitBtn) submitBtn.disabled = state.saving || locked() || !result.ok;

  return result;
}

function problemText(p) {
  switch (p.code) {
    case 'too-many-events':
      return t('meet_entries_err_too_many', { count: p.count, max: p.max });
    case 'too-many-per-day':
      return t('meet_entries_err_per_day', { day: dayLabel(p.day), count: p.count, max: p.max });
    case 'relay-coach-only':
      return t('meet_entries_err_relay');
    case 'missing-seed-time':
      return t('meet_entries_err_seed_missing', { label: p.label });
    case 'bad-seed-time':
      return t('meet_entries_err_seed_bad', { label: p.label, value: p.value });
    case 'duplicate':
    case 'unknown-event':
      return t('meet_entries_err_invalid');
    case 'slower-than-line':
      return p.bonusAllowed > 0
        ? t('meet_entries_warn_slower_bonus', { label: p.label, gap: p.gapSeconds, count: p.bonusAllowed })
        : t('meet_entries_warn_slower', { label: p.label, gap: p.gapSeconds });
    case 'manual-time':
      return t('meet_entries_warn_manual', { label: p.label, value: p.value });
    case 'open-event':
      return t('meet_entries_warn_open', { label: p.label });
    case 'same-event-twice':
      return t('meet_entries_warn_twice', { labels: p.labels.join(', ') });
    default:
      return p.code;
  }
}

// ── interaction ──────────────────────────────────────────────────────────

function onClick(e) {
  if (e.target.id === 'me-close' || e.target.id === 'meet-entries-overlay') {
    closeMeetEntries();
    return;
  }
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;

  if (action === 'back') { state.view = 'list'; state.ctx = null; paint(); return; }
  if (action === 'edit') {
    const sw = state.swimmers.find((s) => s.usaId === btn.dataset.usa);
    if (sw) openSwimmer(sw);
    return;
  }
  if (action === 'submit') { save({ status: 'submitted' }); return; }
  if (action === 'draft') { save({ status: 'draft' }); return; }
  if (action === 'save') { save({ status: state.status === 'none' ? 'confirmed' : state.status }); return; }
  if (action === 'confirm') { save({ status: 'confirmed' }); return; }
  if (action === 'decline') { save({ status: 'declined' }); return; }
  if (action === 'reopen') { save({ status: 'submitted' }); return; }
}

function onChange(e) {
  if (e.target.id === 'me-filter') {
    state.filter = e.target.value;
    const body = document.getElementById('me-list-body');
    if (body) body.innerHTML = coachListRowsHtml();
    return;
  }
  const cb = e.target.closest('input[type="checkbox"][data-key]');
  if (!cb) return;
  toggleEvent(cb.dataset.key, cb.checked);
}

function onInput(e) {
  if (e.target.matches('input[data-manual]')) {
    state.manualTimes[e.target.dataset.manual] = e.target.value;
    refreshSummary();
    return;
  }
  if (e.target.id === 'me-note') { state.note = e.target.value; return; }
  if (e.target.id === 'me-search') {
    state.search = e.target.value;
    const body = document.getElementById('me-list-body');
    if (body) body.innerHTML = coachListRowsHtml();
  }
}

function toggleEvent(key, checked) {
  if (checked) state.selected.add(key);
  else state.selected.delete(key);
  const row = [...document.querySelectorAll('[data-event-row]')]
    .find((el) => el.dataset.eventRow === key);
  if (row) {
    row.classList.toggle('is-selected', checked);
    const wrap = row.querySelector('.me-manual-wrap');
    if (wrap) wrap.hidden = !checked;
  }
  // Rebuild the footer FIRST: footerHtml() resets the submit button to enabled,
  // so refreshSummary() has to run after it to apply the error state.
  const footer = document.getElementById('me-footer');
  if (footer) footer.innerHTML = footerHtml();
  refreshSummary();
}

async function openSwimmer(sw) {
  state.view = 'editor';
  state.active = sw;
  state.ctx = null;
  state.status = statusOf(sw);
  state.selected = new Set();
  state.manualTimes = {};
  state.error = '';

  const existing = entryOf(sw);
  state.note = existing?.note || '';
  for (const ev of existing?.events || []) {
    const key = `${ev.eventNo}|${ev.ageGroup}`;
    state.selected.add(key);
    if (ev.source === 'manual' && ev.seedTime) state.manualTimes[key] = ev.seedTime;
  }

  paint();

  const { list, fetchedAt, error } = await loadBestTimes(sw.usaId);
  state.ctx = buildMeetOptions({ meet: state.meet, swimmer: { ...sw, usaSwimmingId: sw.usaId }, bestTimes: list });
  state.ctx.fetchedAt = fetchedAt || null;
  state.ctx.readError = error || null;

  // A stored seed time has to survive a reload even when our records still show
  // no time for that event — otherwise re-opening an entry would demand the
  // family retype what the coach already verified.
  if (existing) {
    const byKey = new Map(state.ctx.individual.map((o) => [o.key, o]));
    for (const ev of existing.events || []) {
      const key = `${ev.eventNo}|${ev.ageGroup}`;
      const opt = byKey.get(key);
      if (opt && opt.state === 'no-time' && ev.seedTime && !state.manualTimes[key]) {
        state.manualTimes[key] = ev.seedTime;
      }
    }
  }

  paint();
}

// ── saving ───────────────────────────────────────────────────────────────

function buildEventPayload() {
  const byKey = new Map([...state.ctx.individual, ...state.ctx.relays].map((o) => [o.key, o]));
  const payload = [];
  for (const key of state.selected) {
    const o = byKey.get(key);
    if (!o || o.relay) continue;
    const typed = String(state.manualTimes[key] || '').trim();
    const useTyped = o.state === 'no-time' && typed;
    payload.push({
      eventNo: o.eventNo,
      ageGroup: o.ageGroup,
      distance: o.distance,
      stroke: o.stroke,
      sessionId: o.sessionId,
      day: o.day,
      course: useTyped ? 'SCY' : (o.bestCourse || 'SCY'),
      seedTime: useTyped ? typed : (o.bestSeconds != null ? formatSwimSeconds(o.bestSeconds) : ''),
      seedSeconds: useTyped ? null : (o.bestSeconds ?? null),
      source: useTyped ? 'manual' : 'db',
      proofDate: useTyped ? '' : (o.bestDate || ''),
      standard: o.standardSeconds ?? null,
      qualifies: o.state === 'qualified',
    });
  }
  payload.sort((a, b) => String(a.day).localeCompare(String(b.day)) || (a.eventNo - b.eventNo));
  return payload;
}

async function save({ status }) {
  if (state.saving || !state.ctx) return;
  const sw = state.active;
  const docId = swimmerDocId(sw);
  if (!docId) { state.error = t('meet_entries_blocked_no_id'); paint(); return; }

  const result = refreshSummary();
  if (status !== 'draft' && result && !result.ok) {
    state.error = t('meet_entries_fix_errors');
    const note = document.querySelector('.me-save-note');
    if (note) note.textContent = state.error;
    return;
  }

  state.saving = true;
  state.error = '';
  const footerNote = document.querySelector('.me-save-note');
  if (footerNote) footerNote.textContent = t('meet_entries_saving');

  const existing = entryOf(sw);
  const payload = {
    meetId: state.meet.id,
    familyId: sw.familyId,
    usaSwimmingId: sw.usaId,
    swimmerName: sw.name,
    ageAtMeet: state.ctx.age,
    ageGroup: state.ctx.ageGroup,
    gender: state.ctx.gender,
    status,
    events: buildEventPayload(),
    note: state.note || '',
    updatedAt: serverTimestamp(),
    updatedBy: state.actorId || '',
  };
  if (status === 'submitted' && !existing?.submittedAt) payload.submittedAt = serverTimestamp();
  if (status === 'confirmed') payload.confirmedAt = serverTimestamp();

  try {
    await setDoc(doc(db, 'meets', state.meet.id, 'entries', docId), payload, { merge: true });
    state.status = status;
    state.entries.set(docId, { ...(existing || {}), ...payload, id: docId, status });
    state.saving = false;
    paint();
  } catch (err) {
    console.error('[meetEntries] save failed:', err);
    state.saving = false;
    state.error = err.message || String(err);
    refreshSummary();
    const note = document.querySelector('.me-save-note');
    if (note) note.textContent = state.error;
  }
}
