/**
 * Relay line-ups — coach-only editor, as a body-level modal.
 *
 * WHY THIS IS SEPARATE FROM `meetEntries.js`
 * ------------------------------------------
 * Individual entries are family data: one document per swimmer, owned by the
 * household, reviewed by the coach. A relay is club data: up to
 * `relayLimitPerClub` squads per event, each four swimmers **in an order the coach
 * chooses**. Different owner, different key, different validation. Keeping it in
 * its own component also keeps the family flow untouched — the 820-line entries
 * modal is the most delicate surface in the dashboard.
 *
 * Same body-level rule as the entries modal: the dashboard rebuilds `#app` on every
 * Firestore snapshot, so the panel is appended to <body> and never needs repainting
 * when unrelated data changes.
 *
 * DATA
 * ----
 *   meets/{meetId}                          → events[] (only `relay: true` rows)
 *   meets/{meetId}/relayEntries/{code}__{L} → one doc per squad (this file writes them)
 *
 * The document id carries the meet's event CODE ('9A'), not the bare event number:
 * one number can cover several age groups, and a squad belongs to exactly one.
 */

import {
  db, doc, setDoc, deleteDoc, collection, onSnapshot, serverTimestamp,
} from '../utils/firebase.js';
import { relayEventsOf, relayDocId, validateSquad, LEG_COUNT, RELAY_LETTERS } from '../utils/relayEntry.js';
import { formatSwimSeconds, parseSwimTimeText } from '../utils/meetEligibility.js';
import { t } from '../utils/i18n.js';

const CONTAINER_ID = 'relay-entries-container';

const state = {
  meet: null,
  swimmers: [],
  events: [],
  squads: new Map(),      // eventCode -> [squad]
  unsubscribe: null,
  view: 'list',
  edit: null,             // { eventCode, letter, legs: [4], seedTime }
  saving: false,
  error: '',
  actorId: null,
};

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

// ── open / close ─────────────────────────────────────────────────────────

/**
 * @param {object} opts
 * @param {object} opts.meet      meet document (must include id and events[])
 * @param {Array}  opts.swimmers  [{ usaId, firstName, lastName, name, dob, gender, age }]
 * @param {string} [opts.actorId] current user uid
 */
export function openRelayEntries({ meet, swimmers = [], actorId = null }) {
  closeRelayEntries();
  Object.assign(state, {
    meet, swimmers: swimmers.filter((s) => s.usaId), events: relayEventsOf(meet),
    squads: new Map(), view: 'list', edit: null, saving: false, error: '', actorId,
  });

  const container = document.createElement('div');
  container.id = CONTAINER_ID;
  document.body.appendChild(container);
  paint();

  // Live squads: the coach may have two tabs open, and a save should show up in
  // the list without a reload.
  state.unsubscribe = onSnapshot(
    collection(db, 'meets', meet.id, 'relayEntries'),
    (snap) => {
      const grouped = new Map();
      for (const d of snap.docs) {
        const data = { id: d.id, ...d.data() };
        const key = data.eventCode || d.id.split('__')[0];
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key).push(data);
      }
      for (const list of grouped.values()) list.sort((a, b) => String(a.letter).localeCompare(String(b.letter)));
      state.squads = grouped;
      if (state.view === 'list') paint();
    },
    (err) => {
      state.error = err.message;
      paint();
    },
  );
}

export function closeRelayEntries() {
  state.unsubscribe?.();
  state.unsubscribe = null;
  document.getElementById(CONTAINER_ID)?.remove();
}

// ── eligibility ──────────────────────────────────────────────────────────

/** Swimmers who could legally take a leg of this event. */
function eligibleSwimmers(event) {
  const eventSex = String(event?.eventSex || event?.gender || '').toUpperCase();
  return state.swimmers.filter((s) => {
    const sex = String(s.gender || '').toUpperCase();
    const isF = sex.startsWith('F') || sex.startsWith('G');
    const isM = sex.startsWith('M') || sex.startsWith('B');
    if (eventSex && eventSex !== 'X') {
      if (eventSex === 'F' && !isF) return false;
      if (eventSex === 'M' && !isM) return false;
    }
    const age = Number(s.age);
    if (Number.isFinite(age)) {
      if (Number.isFinite(event?.ageMin) && age < event.ageMin) return false;
      if (Number.isFinite(event?.ageMax) && event.ageMax < 100 && age > event.ageMax) return false;
    }
    return true;
  }).sort((a, b) => String(a.lastName || a.name).localeCompare(String(b.lastName || b.name)));
}

function squadsFor(eventCode) {
  return state.squads.get(String(eventCode)) || [];
}

/** How many squads the meet allows per relay event. */
function squadLimit() {
  const n = Number(state.meet?.relayLimitPerClub);
  return Number.isFinite(n) && n > 0 ? Math.min(n, RELAY_LETTERS.length) : RELAY_LETTERS.length;
}

// ── paint ────────────────────────────────────────────────────────────────

function paint() {
  const container = document.getElementById(CONTAINER_ID);
  if (!container) return;
  const meet = state.meet;
  container.innerHTML = `
    <div class="meet-entries-overlay" id="relay-overlay">
      <div class="meet-entries-modal" role="dialog" aria-modal="true" aria-label="${esc(t('meet_relays_title'))}">
        <div class="me-header">
          <div class="me-header-text">
            <h2>${esc(meet?.name || 'Meet')}</h2>
            <p class="me-sub">${esc(t('meet_relays_sub'))}</p>
          </div>
          <button type="button" class="me-close" id="relay-close" aria-label="Close">×</button>
        </div>
        <div class="me-body" id="relay-body">
          ${state.view === 'edit' ? editHtml() : listHtml()}
        </div>
        <div class="me-footer" id="relay-footer">${footerHtml()}</div>
      </div>
    </div>
  `;
  if (state.view === 'edit') refreshErrors();
}

function listHtml() {
  if (!state.events.length) {
    return `<p class="me-empty">${esc(t('meet_relays_no_events'))}</p>`;
  }
  const limit = squadLimit();
  const rows = state.events.map((event) => {
    const squads = squadsFor(event.eventCode);
    const slots = [];
    for (let i = 0; i < limit; i += 1) {
      const letter = RELAY_LETTERS[i];
      const squad = squads.find((s) => String(s.letter).toUpperCase() === letter);
      slots.push(squad
        ? squadChip(event, squad, letter)
        : `<button type="button" class="btn btn-outline btn-sm mr-add" data-action="add" data-code="${esc(event.eventCode)}" data-letter="${letter}">+ ${esc(letter)}</button>`);
    }
    return `<tr data-relay-row="${esc(event.eventCode)}">
      <td class="mr-event">
        <strong>#${esc(event.eventCode)}</strong>
        <span class="me-sub">${esc(event.gender || '')} ${esc(event.ageGroup || '')} ${esc(event.distance || '')} ${esc(event.stroke || '')}</span>
      </td>
      <td class="mr-slots">${slots.join(' ')}</td>
    </tr>`;
  }).join('');

  return `
    <table class="mr-table">
      <thead><tr><th>${esc(t('meet_relays_event'))}</th><th>${esc(t('meet_relays_squads'))}</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    ${state.error ? `<p class="me-error">${esc(state.error)}</p>` : ''}
  `;
}

function squadChip(event, squad, letter) {
  const names = (squad.legs || []).map((l) => surnameOf(l)).filter(Boolean);
  const seed = squad.seedSeconds != null ? ` · ${formatSwimSeconds(squad.seedSeconds)}` : '';
  return `<span class="mr-squad" data-squad="${esc(squad.id || '')}">
      <span class="mr-squad-letter">${esc(letter)}</span>
      <span class="mr-squad-names">${esc(names.join(' · ') || t('meet_relays_empty_squad'))}${esc(seed)}</span>
      <button type="button" class="btn btn-outline btn-sm" data-action="edit" data-code="${esc(event.eventCode)}" data-letter="${letter}">${esc(t('meet_relays_edit'))}</button>
    </span>`;
}

function surnameOf(leg) {
  if (leg.lastName) return leg.lastName;
  return String(leg.swimmerName || '').trim().split(/\s+/).slice(-1)[0] || String(leg.usaSwimmingId || '');
}

function editHtml() {
  const event = state.events.find((e) => String(e.eventCode) === String(state.edit.eventCode));
  const pool = eligibleSwimmers(event);
  const optionsFor = (selected) => {
    const head = `<option value="">${esc(t('meet_relays_pick'))}</option>`;
    return head + pool.map((s) => {
      const value = esc(s.usaId);
      const label = `${s.lastName || s.name}, ${s.firstName || ''}`.replace(/,\s*$/, '');
      const sel = String(selected || '') === String(s.usaId) ? ' selected' : '';
      return `<option value="${value}"${sel}>${esc(label)} (${esc(s.age ?? '?')})</option>`;
    }).join('');
  };

  const legs = state.edit.legs || [];
  const selects = Array.from({ length: LEG_COUNT }, (_, i) => `
    <label class="mr-leg">
      <span class="mr-leg-no">${esc(t('meet_relays_leg'))} ${i + 1}</span>
      <select data-leg="${i}">${optionsFor(legs[i]?.usaId)}</select>
    </label>`).join('');

  return `
    <div class="mr-editor">
      <div class="mr-editor-head">
        <strong>#${esc(state.edit.eventCode)}</strong>
        <span class="me-sub">${esc(event?.gender || '')} ${esc(event?.ageGroup || '')} ${esc(event?.distance || '')} ${esc(event?.stroke || '')} · ${esc(t('meet_relays_squad'))} ${esc(state.edit.letter)}</span>
      </div>
      <div class="mr-legs">${selects}</div>
      <label class="mr-seed">
        <span>${esc(t('meet_relays_seed'))}</span>
        <input type="text" id="relay-seed" placeholder="1:47.25" value="${esc(state.edit.seedTime || '')}" />
      </label>
      <div class="mr-errors" id="relay-errors"></div>
      <p class="me-sub">${esc(t('meet_relays_pool_hint').replace('{n}', String(pool.length)))}</p>
    </div>
  `;
}

function footerHtml() {
  if (state.view === 'edit') {
    const disabled = state.saving ? 'disabled' : '';
    const deleting = state.edit?.existing
      ? `<button type="button" class="btn btn-outline btn-sm me-danger" data-action="delete" ${disabled}>${esc(t('meet_relays_delete'))}</button>`
      : '';
    return `
      <button type="button" class="btn btn-primary btn-sm" data-action="save" ${disabled}>${esc(state.saving ? t('meet_relays_saving') : t('meet_relays_save'))}</button>
      ${deleting}
      <button type="button" class="btn btn-outline btn-sm" data-action="back" ${disabled}>${esc(t('meet_relays_back'))}</button>
      <span class="me-footer-note me-save-note" id="relay-note">${esc(state.error || '')}</span>
    `;
  }
  return `<span class="me-footer-note">${esc(t('meet_relays_footer'))}</span>`;
}

// ── validation feedback ──────────────────────────────────────────────────

function currentLegs() {
  const event = state.events.find((e) => String(e.eventCode) === String(state.edit?.eventCode));
  return (state.edit?.legs || []).map((leg) => {
    if (!leg) return null;
    const swimmer = state.swimmers.find((s) => String(s.usaId) === String(leg.usaId));
    return { ...(swimmer || {}), ...leg, usaSwimmingId: leg.usaId, gender: swimmer?.gender || leg.gender };
  });
}

function refreshErrors() {
  const el = document.getElementById('relay-errors');
  if (!el) return;
  const event = state.events.find((e) => String(e.eventCode) === String(state.edit?.eventCode));
  const legs = currentLegs();
  const existingOthers = squadsFor(state.edit?.eventCode)
    .filter((s) => String(s.letter).toUpperCase() !== String(state.edit?.letter).toUpperCase()).length;
  const result = validateSquad({ meet: state.meet, event, legs, squadsInEvent: existingOthers + 1 });

  if (!result.errors.length) {
    el.innerHTML = `<span class="mr-ok">${esc(t('meet_relays_ok'))}</span>`;
    return;
  }
  el.innerHTML = result.errors
    .map((e) => `<span class="me-error">${esc(describeError(e))}</span>`)
    .join('');
}

function describeError(error) {
  const m = {
    'leg-count': t('meet_relays_err_legs').replace('{count}', String(error.count ?? 0)),
    'duplicate-swimmer': t('meet_relays_err_dup').replace('{ids}', (error.ids || []).join(', ')),
    'leg-without-usa-id': t('meet_relays_err_noid'),
    'leg-sex-mismatch': t('meet_relays_err_sex').replace('{leg}', String(error.leg ?? '?')),
    'leg-too-young': t('meet_relays_err_young').replace('{leg}', String(error.leg ?? '?')).replace('{age}', String(error.age ?? '?')).replace('{min}', String(error.min ?? '?')),
    'leg-too-old': t('meet_relays_err_old').replace('{leg}', String(error.leg ?? '?')).replace('{age}', String(error.age ?? '?')).replace('{max}', String(error.max ?? '?')),
    'too-many-squads': t('meet_relays_err_cap').replace('{count}', String(error.count ?? '?')).replace('{max}', String(error.max ?? '?')),
    'leg-unidentified': t('meet_relays_err_unknown_leg').replace('{leg}', String(error.leg ?? '?')),
  };
  return m[error.code] || error.code;
}

// ── events ───────────────────────────────────────────────────────────────

document.addEventListener('click', (event) => {
  if (!document.getElementById(CONTAINER_ID)) return;
  if (event.target.id === 'relay-close' || event.target.id === 'relay-overlay') {
    closeRelayEntries();
    return;
  }
  const btn = event.target.closest('[data-action]');
  if (!btn) return;
  const { action, code, letter } = btn.dataset;

  if (action === 'add') startEdit(code, letter, null);
  else if (action === 'edit') startEdit(code, letter, squadsFor(code).find((s) => String(s.letter).toUpperCase() === letter) || null);
  else if (action === 'back') { state.view = 'list'; state.error = ''; paint(); }
  else if (action === 'save') saveSquad();
  else if (action === 'delete') deleteSquad();
});

document.addEventListener('change', (event) => {
  if (!document.getElementById(CONTAINER_ID)) return;
  const select = event.target.closest('select[data-leg]');
  if (!select) return;
  const i = Number(select.dataset.leg);
  const usaId = select.value;
  const swimmer = state.swimmers.find((s) => String(s.usaId) === usaId) || null;
  state.edit.legs[i] = swimmer ? { usaId: swimmer.usaId, firstName: swimmer.firstName, lastName: swimmer.lastName, dob: swimmer.dob, gender: swimmer.gender, ageAtMeet: swimmer.age } : null;
  refreshErrors();
});

document.addEventListener('input', (event) => {
  if (event.target.id !== 'relay-seed') return;
  state.edit.seedTime = event.target.value;
});

function startEdit(code, letter, existing) {
  const legs = [0, 1, 2, 3].map(() => null);
  if (existing) {
    (existing.legs || []).slice(0, LEG_COUNT).forEach((leg, i) => {
      legs[i] = { usaId: leg.usaSwimmingId, firstName: leg.firstName, lastName: leg.lastName, dob: leg.dob, gender: leg.gender, ageAtMeet: leg.ageAtMeet };
    });
  }
  state.edit = {
    eventCode: code, letter, legs, existing: Boolean(existing),
    seedTime: existing?.seedSeconds != null ? formatSwimSeconds(existing.seedSeconds) : '',
  };
  state.error = '';
  state.view = 'edit';
  paint();
}

async function saveSquad() {
  const { eventCode, letter } = state.edit;
  const event = state.events.find((e) => String(e.eventCode) === String(eventCode));
  const legs = currentLegs();

  const existingOthers = squadsFor(eventCode)
    .filter((s) => String(s.letter).toUpperCase() !== String(letter).toUpperCase()).length;
  const check = validateSquad({ meet: state.meet, event, legs, squadsInEvent: existingOthers + 1 });
  if (!check.ok) {
    state.error = '';
    refreshErrors();
    return;
  }

  const seedSeconds = parseSwimTimeText(state.edit.seedTime);
  const id = relayDocId(eventCode, letter);
  state.saving = true;
  paint();
  try {
    await setDoc(doc(db, 'meets', state.meet.id, 'relayEntries', id), {
      meetId: state.meet.id,
      eventNo: event.eventNo ?? null,
      eventCode,
      ageGroup: event.ageGroup || null,
      gender: event.gender || null,
      distance: event.distance ?? null,
      stroke: event.stroke || null,
      letter,
      // Array order IS the leg order — see src/utils/relayEntry.js.
      legs: legs.filter(Boolean).map((leg) => ({
        usaSwimmingId: leg.usaId,
        firstName: leg.firstName || '',
        lastName: leg.lastName || '',
        dob: leg.dob || null,
        ageAtMeet: leg.ageAtMeet ?? null,
        gender: leg.gender || null,
      })),
      seedSeconds: seedSeconds ?? null,
      courseLetter: 'Y',
      status: 'confirmed',
      updatedAt: serverTimestamp(),
      updatedBy: state.actorId || null,
    });
    state.saving = false;
    state.view = 'list';
    paint();
  } catch (err) {
    state.saving = false;
    state.error = err.message;
    paint();
  }
}

async function deleteSquad() {
  const { eventCode, letter } = state.edit;
  const id = relayDocId(eventCode, letter);
  state.saving = true;
  paint();
  try {
    await deleteDoc(doc(db, 'meets', state.meet.id, 'relayEntries', id));
    state.saving = false;
    state.view = 'list';
    paint();
  } catch (err) {
    state.saving = false;
    state.error = err.message;
    paint();
  }
}
