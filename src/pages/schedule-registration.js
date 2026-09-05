/**
 * Season Slot Registration UI — Coach dashboard Schedule tab (2026-09-05).
 *
 * Stateless render helpers: every function receives a state snapshot object `st`
 * from dashboard.js — { sessionSlots, enrollments, currentPeriod, allRegistrations,
 * dbRole, activeSwimmers, onPeriodChange }. All Firestore writes go through the
 * shared firebase.js utilities and are admin-only (firestore rules enforce).
 */

import { t } from '../utils/i18n.js';
import { LOCATION_ORDER, DAY_ORDER, PERIODS, periodLabel } from '../data/seasonSchedule.data.js';
import {
  db, doc, setDoc, updateDoc, deleteDoc, addDoc,
  collection, query, where, getDocs, writeBatch,
} from '../utils/firebase.js';

// ── small helpers ──────────────────────────────────────────────

function esc(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function timeToMinutes(timeStr) {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec(String(timeStr || '').trim());
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ap = (m[3] || '').toUpperCase();
  if (ap === 'PM' && h !== 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return h * 60 + min;
}

function dayIndex(day) {
  const i = DAY_ORDER.indexOf(day);
  return i === -1 ? 99 : i;
}

function sortSlots(slots) {
  return slots.slice().sort((a, b) => {
    const d = dayIndex(a.day) - dayIndex(b.day);
    if (d) return d;
    const as = timeToMinutes(a.startTime) || 0;
    const bs = timeToMinutes(b.startTime) || 0;
    if (as !== bs) return as - bs;
    return String(a.startTime || '').localeCompare(String(b.startTime || ''));
  });
}

function periodOptions(st) {
  const set = new Set((st.sessionSlots || []).map(s => s.period).filter(Boolean));
  if (st.currentPeriod) set.add(st.currentPeriod);
  return Array.from(set).sort((a, b) => {
    const ia = PERIODS.findIndex(p => p.id === a);
    const ib = PERIODS.findIndex(p => p.id === b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

function groupLocations(slots) {
  const map = new Map();
  for (const s of slots) {
    if (!map.has(s.location)) map.set(s.location, []);
    map.get(s.location).push(s);
  }
  const known = new Set(LOCATION_ORDER);
  return Array.from(map.keys())
    .sort((a, b) => {
      const ia = known.has(a) ? LOCATION_ORDER.indexOf(a) : LOCATION_ORDER.length;
      const ib = known.has(b) ? LOCATION_ORDER.indexOf(b) : LOCATION_ORDER.length;
      if (ia !== ib) return ia - ib;
      return a.localeCompare(b);
    })
    .map(location => ({ location, slots: sortSlots(map.get(location)) }));
}

function slotTitle(slot) {
  return ((slot.day || '') + ' ' + (slot.startTime || '') + ' – ' + (slot.endTime || '')).trim();
}

function athleteInfo(st, regId, swimmerIndex) {
  const reg = (st.allRegistrations || []).find(r => r.id === regId);
  const sw = reg && reg.swimmers && reg.swimmers[swimmerIndex];
  if (sw && !sw.deleted) {
    const parent = reg.parent || {};
    return {
      name: [sw.firstName, sw.lastName].filter(Boolean).join(' ') || 'Unknown',
      parentName: [parent.firstName, parent.lastName].filter(Boolean).join(' ') || '—',
    };
  }
  return { name: 'Unknown', parentName: '—' };
}

function enrollmentStatus(st, slotId, regId, swimmerIndex) {
  return (st.enrollments || []).find(e =>
    e.slotId === slotId && e.regId === regId && Number(e.swimmerIndex) === Number(swimmerIndex)
  );
}

function slotStats(st, slot) {
  const es = (st.enrollments || []).filter(e => e.slotId === slot.id);
  return {
    confirmed: es.filter(e => e.status === 'confirmed'),
    undecided: es.filter(e => e.status === 'undecided'),
  };
}

function rosterHtml(st, slot) {
  const stats = slotStats(st, slot);
  const confirmed = stats.confirmed.map(e => {
    const info = athleteInfo(st, e.regId, e.swimmerIndex);
    return '<span style="display:inline-block;background:var(--bg-card, #f0fdf4);border:1px solid var(--border-color,#16a34a33);color:var(--text-primary,#16a34a);border-radius:999px;padding:2px 10px;margin:2px 4px 2px 0;font-size:0.8rem;">' + esc(info.name) + '</span>';
  });
  const undecided = stats.undecided.map(e => {
    const info = athleteInfo(st, e.regId, e.swimmerIndex);
    return '<span style="display:inline-block;background:var(--bg-card,#fffbeb);border:1px dashed var(--border-color,#d97706);color:var(--text-muted,#d97706);border-radius:999px;padding:2px 10px;margin:2px 4px 2px 0;font-size:0.8rem;">' + esc(info.name) + ' ?</span>';
  });
  if (confirmed.length === 0 && undecided.length === 0) {
    return '<p class="dash-empty-sm" style="color:var(--text-muted);font-size:0.85rem;margin:6px 0 0;">' + t('sched2_no_signups') + '</p>';
  }
  return '<div style="margin-top:6px;">' + confirmed.join('') + undecided.join('') + '</div>';
}

// ── Family (parent) read-only view ─────────────────────────────

export function renderFamilySchedule(st) {
  const slots = sortSlots((st.sessionSlots || []).filter(s => s.period === st.currentPeriod));
  const groups = groupLocations(slots);
  const label = periodLabel(st.currentPeriod);
  return `
    <div class="dash-section-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
      <div>
        <h2 style="font-size:1.5rem;font-weight:600;color:var(--text-primary);margin:0;">${t('dash_schedule_weekly')}</h2>
        <p style="margin:4px 0 0;color:var(--text-muted);font-size:0.9rem;">${label}</p>
      </div>
    </div>
    ${slots.length === 0
      ? '<p class="dash-empty">' + t('sched2_no_slots') + '</p>'
      : groups.map(g => `
          <div class="dash-panel" style="margin-bottom:1.5rem;">
            <h3 class="dash-panel-title" style="border-bottom:1px solid var(--border-color);padding-bottom:0.6rem;">${esc(g.location)}</h3>
            <div class="dash-panel-body">
              ${g.slots.map(s => `
                <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:8px 0;border-bottom:1px dashed var(--border-color);flex-wrap:wrap;">
                  <strong style="white-space:nowrap;">${esc(slotTitle(s))}</strong>
                  <span style="color:var(--text-muted);font-size:0.85rem;">${s.groupLabel ? esc(s.groupLabel) : ''}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
  `;
}

// ── Coach schedule view ────────────────────────────────────────

export function renderCoachSchedule(st) {
  const canEdit = st.dbRole === 'admin';
  const slots = sortSlots((st.sessionSlots || []).filter(s => s.period === st.currentPeriod));
  const groups = groupLocations(slots);
  const options = periodOptions(st);
  const label = periodLabel(st.currentPeriod);
  return `
    <div class="dash-section-header" style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.5rem;gap:1rem;flex-wrap:wrap;">
      <div style="flex:1;min-width:260px;">
        <h2 style="font-size:1.5rem;font-weight:600;color:var(--text-primary);margin:0;">${t('sched2_title')}</h2>
        <p style="margin:4px 0 0;color:var(--text-muted);font-size:0.85rem;max-width:560px;">${t('sched2_subtitle')}</p>
      </div>
      <div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:0.5rem;">
          <label class="season-selector-label" for="sched-period-select">${t('sched2_period_label')}:</label>
          <select id="sched-period-select" class="season-select">
            ${options.map(per => '<option value="' + esc(per) + '"' + (per === st.currentPeriod ? ' selected' : '') + '>' + esc(periodLabel(per)) + '</option>').join('')}
          </select>
        </div>
        ${canEdit ? '<button class="btn btn-primary btn-sm" id="add-slot-btn">' + t('sched2_add_slot') + '</button>' : ''}
      </div>
    </div>

    ${canEdit ? `
      <div id="add-slot-form" class="dash-panel" style="display:none;margin-bottom:2rem;padding:1.5rem;">
        <h3 style="margin:0 0 1rem;font-weight:600;">${t('sched2_new_slot_title')} — ${esc(label)}</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:0.9rem;">
          <select id="slot-location" class="form-input">
            ${LOCATION_ORDER.map(l => '<option>' + esc(l) + '</option>').join('')}
          </select>
          <select id="slot-day" class="form-input">
            ${DAY_ORDER.map(d => '<option>' + esc(d) + '</option>').join('')}
          </select>
          <input type="text" id="slot-start" class="form-input" placeholder="${t('sched2_slot_start')} (6:30 PM)">
          <input type="text" id="slot-end" class="form-input" placeholder="${t('sched2_slot_end')} (8:30 PM)">
          <input type="text" id="slot-group" class="form-input" placeholder="${t('sched2_slot_group')}">
        </div>
        <div style="margin-top:1rem;display:flex;gap:0.75rem;">
          <button class="btn btn-primary btn-sm" id="save-slot-btn">${t('sched2_save')}</button>
          <button class="btn btn-outline btn-sm" id="cancel-slot-btn">${t('sched2_cancel')}</button>
        </div>
      </div>
    ` : ''}

    ${slots.length === 0
      ? '<p class="dash-empty">' + t('sched2_no_slots') + '</p>'
      : groups.map(g => `
          <div class="dash-panel" style="margin-bottom:1.5rem;">
            <div class="dash-panel-title" style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border-color);padding-bottom:0.6rem;">
              <h3 style="margin:0;font-size:1.05rem;font-weight:600;">${esc(g.location)}</h3>
              <span class="badge" style="background:var(--bg-secondary);color:var(--text-muted);">${g.slots.length} ${g.slots.length === 1 ? 'session' : 'sessions'}</span>
            </div>
            <div class="dash-panel-body">
              ${g.slots.map(slot => renderCoachSlot(st, slot, canEdit)).join('')}
            </div>
          </div>
        `).join('')}
  `;
}

function renderCoachSlot(st, slot, canEdit) {
  const stats = slotStats(st, slot);
  const confirmed = stats.confirmed.length;
  const undecided = stats.undecided.length;
  const hasCap = slot.capacity != null && slot.capacity !== '';
  const cap = hasCap ? Number(slot.capacity) : null;
  const open = cap == null ? null : Math.max(0, cap - confirmed);
  const capHtml = hasCap
    ? '<strong>' + confirmed + ' / ' + cap + '</strong>' + (open === 0
        ? ' <span style="color:var(--color-accent,#dc2626);font-size:0.8rem;">' + t('sched2_full') + '</span>'
        : ' <span style="color:#16a34a;font-size:0.8rem;">' + t('sched2_open', { open: String(open) }) + '</span>')
    : '<strong>' + confirmed + '</strong> <span style="color:var(--text-muted);font-size:0.8rem;">(' + t('sched2_no_capacity') + ')</span>';

  const controls = canEdit ? `
    <div style="display:flex;align-items:center;gap:0.6rem;flex-wrap:wrap;">
      <label style="font-size:0.8rem;color:var(--text-muted);white-space:nowrap;">${t('sched2_capacity')}
        <input type="number" min="0" class="slot-capacity-input" data-id="${slot.id}"
          value="${hasCap ? cap : ''}" title="${t('sched2_capacity_hint')}"
          style="width:70px;margin-left:6px;padding:3px 6px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-primary);color:var(--text-primary);" />
      </label>
      <button class="btn btn-primary btn-sm slot-manage-btn" data-id="${slot.id}">${t('sched2_manage_roster')}</button>
      <button class="btn btn-outline btn-sm slot-delete-btn" data-id="${slot.id}" style="color:var(--color-accent,#dc2626);">${t('sched2_delete_slot')}</button>
    </div>
  ` : '';

  return `
    <div class="dash-schedule-item" style="padding:0.9rem 1rem;border:1px solid var(--border-color);border-radius:10px;margin-bottom:0.8rem;background:var(--bg-card);">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:0.75rem;flex-wrap:wrap;">
        <div>
          <div style="font-weight:600;">${esc(slotTitle(slot))}
            ${slot.groupLabel ? '<span style="display:inline-block;margin-left:8px;background:var(--bg-secondary);color:var(--text-muted);border-radius:6px;padding:1px 8px;font-size:0.75rem;font-weight:500;">' + esc(slot.groupLabel) + '</span>' : ''}
          </div>
          <div style="margin-top:4px;color:var(--text-muted);font-size:0.85rem;">
            ${t('sched2_confirmed')}: ${capHtml}
            ${undecided > 0 ? ' · ' + t('sched2_undecided') + ': <span style="color:#d97706;">' + undecided + '</span>' : ''}
          </div>
        </div>
        ${controls}
      </div>
      ${rosterHtml(st, slot)}
    </div>
  `;
}


// ── Manage roster overlay ──────────────────────────────────────

function managerRowsHtml(st, live, slot, queryText) {
  const q = (queryText || '').trim().toLowerCase();
  const all = st.activeSwimmers || [];
  const rows = all.filter(sw => {
    if (!q) return true;
    const name = [sw.firstName, sw.lastName, sw.parentName].filter(Boolean).join(' ').toLowerCase();
    return name.includes(q);
  });
  if (rows.length === 0) return '<p class="dash-empty">' + t('sched2_no_swimmers') + '</p>';

  return rows.map(sw => {
    const fullName = [sw.firstName, sw.lastName].filter(Boolean).join(' ') || 'Unknown';
    const age = sw.dob ? Math.floor((new Date() - new Date(sw.dob)) / 31557600000) : null;
    const e = live.enrollments.find(en => en.slotId === slot.id && en.regId === sw._regId && Number(en.swimmerIndex) === Number(sw._swimmerIndex));
    const status = e ? e.status : null;
    const btn = (label, action, active, extra) => {
      return '<button type="button" data-action="' + action + '" data-reg="' + esc(sw._regId) + '" data-idx="' + sw._swimmerIndex + '" style="padding:3px 10px;border:1px solid var(--border-color);border-radius:999px;cursor:pointer;font-size:0.78rem;white-space:nowrap;' + (extra || '') + (active
        ? 'background:var(--color-primary,#2563eb);color:#fff;border-color:var(--color-primary,#2563eb);'
        : 'background:transparent;color:var(--text-primary);') + '">' + label + '</button>';
    };
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:6px 4px;border-bottom:1px solid var(--border-color);flex-wrap:wrap;">
        <div style="min-width:0;">
          <strong style="font-size:0.9rem;">${esc(fullName)}</strong>
          ${age != null ? '<span style="color:var(--text-muted);font-size:0.78rem;margin-left:6px;">' + age + ' yrs</span>' : ''}
          <div style="color:var(--text-muted);font-size:0.75rem;">${t('sched2_family')}: ${esc(sw.parentName || '—')}</div>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          ${btn(t('sched2_confirmed'), 'confirm', status === 'confirmed')}
          ${btn(t('sched2_undecided'), 'undecided', status === 'undecided')}
          ${status ? btn('✕ ' + t('sched2_remove'), 'remove', false, 'color:var(--color-accent,#dc2626);') : ''}
        </div>
      </div>
    `;
  }).join('');
}

function findOverlapConflict(st, live, slot, regId, swimmerIndex) {
  const slotStart = timeToMinutes(slot.startTime);
  const slotEnd = timeToMinutes(slot.endTime);
  if (slotStart == null || slotEnd == null) return null;
  for (const e of live.enrollments) {
    if (e.status !== 'confirmed') continue;
    if (e.slotId === slot.id) continue;
    if (e.regId !== regId || Number(e.swimmerIndex) !== Number(swimmerIndex)) continue;
    const other = (st.sessionSlots || []).find(s => s.id === e.slotId);
    if (!other || other.day !== slot.day) continue;
    const os = timeToMinutes(other.startTime);
    const oe = timeToMinutes(other.endTime);
    if (os == null || oe == null) continue;
    if (slotStart < oe && os < slotEnd) return other;
  }
  return null;
}

async function persistEnrollment(slot, regId, swimmerIndex, status, swimmerName) {
  const ref = doc(db, 'enrollments', `${slot.id}_${regId}_${swimmerIndex}`);
  if (status == null) {
    await deleteDoc(ref);
    return;
  }
  await setDoc(ref, {
    slotId: slot.id,
    period: slot.period || '',
    regId,
    swimmerIndex: Number(swimmerIndex),
    status,
    swimmerName: swimmerName || '',
    updatedAt: new Date(),
    updatedBy: 'admin',
  });
}

export function showSlotManager(st, slotId) {
  const slot = (st.sessionSlots || []).find(s => s.id === slotId);
  if (!slot) return;
  const live = { enrollments: (st.enrollments || []).slice() };

  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.style.cssText = 'z-index:2000;';
  overlay.innerHTML = `
    <div class="confirm-modal" style="max-width:780px;width:min(94vw,780px);max-height:88vh;display:flex;flex-direction:column;">
      <h3 class="confirm-title" style="flex-shrink:0;">${t('sched2_manage_title', { slot: esc(slotTitle(slot)) })}</h3>
      <input id="slot-search" class="form-input" placeholder="${t('sched2_search_placeholder')}" style="margin:0.5rem 0 0.75rem;width:100%;flex-shrink:0;">
      <div id="slot-manager-body" style="overflow-y:auto;flex:1;min-height:220px;border:1px solid var(--border-color);border-radius:8px;padding:0.5rem;">
        ${managerRowsHtml(st, live, slot, '')}
      </div>
      <div class="confirm-actions" style="margin-top:0.75rem;flex-shrink:0;">
        <button class="btn btn-outline btn-sm" id="slot-manager-close">${t('sched2_close')}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const searchInput = overlay.querySelector('#slot-search');
  const body = overlay.querySelector('#slot-manager-body');
  const rerender = () => {
    body.innerHTML = managerRowsHtml(st, live, slot, searchInput.value);
  };

  searchInput.addEventListener('input', rerender);
  overlay.querySelector('#slot-manager-close').addEventListener('click', () => overlay.remove());

  body.addEventListener('click', async (ev) => {
    const btn = ev.target.closest('button[data-action]');
    if (!btn) return;
    if ((st.dbRole || '') !== 'admin') {
      alert(t('sched2_err'));
      return;
    }
    const regId = btn.dataset.reg;
    const swimmerIndex = Number(btn.dataset.idx);
    const action = btn.dataset.action; // confirm | undecided | remove
    const newStatus = action === 'remove' ? null : action;
    const sw = (st.activeSwimmers || []).find(x => x._regId === regId && Number(x._swimmerIndex) === swimmerIndex);
    const fullName = sw ? [sw.firstName, sw.lastName].filter(Boolean).join(' ') : 'Unknown';

    if (newStatus === 'confirmed') {
      const conflict = findOverlapConflict(st, live, slot, regId, swimmerIndex);
      if (conflict) {
        alert(t('sched2_conflict_msg', {
          name: fullName,
          slot: slotTitle(conflict),
          time: (conflict.day || '') + ' ' + (conflict.startTime || '') + '–' + (conflict.endTime || ''),
        }));
        return;
      }
    }

    try {
      await persistEnrollment(slot, regId, swimmerIndex, newStatus, fullName);
      live.enrollments = live.enrollments.filter(en =>
        !(en.slotId === slot.id && en.regId === regId && Number(en.swimmerIndex) === swimmerIndex)
      );
      if (newStatus) {
        live.enrollments.push({
          slotId: slot.id,
          period: slot.period || '',
          regId,
          swimmerIndex,
          status: newStatus,
          swimmerName: fullName,
        });
      }
      rerender();
    } catch (err) {
      console.error('Enrollment save failed:', err);
      alert(t('sched2_err'));
    }
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
}

// ── Tab-level event wiring (called from dashboard bindEvents) ──

export function wireScheduleTabEvents(st) {
  document.getElementById('sched-period-select')?.addEventListener('change', (e) => {
    if (st.onPeriodChange) st.onPeriodChange(e.target.value);
  });

  document.getElementById('add-slot-btn')?.addEventListener('click', () => {
    const form = document.getElementById('add-slot-form');
    if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
  });
  document.getElementById('cancel-slot-btn')?.addEventListener('click', () => {
    const form = document.getElementById('add-slot-form');
    if (form) form.style.display = 'none';
  });
  document.getElementById('save-slot-btn')?.addEventListener('click', async () => {
    const loc = document.getElementById('slot-location')?.value || '';
    const day = document.getElementById('slot-day')?.value || '';
    const start = (document.getElementById('slot-start')?.value || '').trim();
    const end = (document.getElementById('slot-end')?.value || '').trim();
    const group = (document.getElementById('slot-group')?.value || '').trim();
    if (!loc || !day || !start || !end) {
      alert(t('sched2_required_fields'));
      return;
    }
    const timeRe = /^\d{1,2}:\d{2}\s*(AM|PM)?$/i;
    const sm = timeToMinutes(start);
    const em = timeToMinutes(end);
    if (!timeRe.test(start) || !timeRe.test(end) || sm == null || em == null || em <= sm) {
      alert(t('sched2_required_fields'));
      return;
    }
    try {
      await addDoc(collection(db, 'sessionSlots'), {
        period: st.currentPeriod,
        location: loc,
        day,
        startTime: start,
        endTime: end,
        groupLabel: group,
        capacity: null,
        createdAt: new Date(),
      });
      const form = document.getElementById('add-slot-form');
      if (form) form.style.display = 'none';
      const sEl = document.getElementById('slot-start');
      const eEl = document.getElementById('slot-end');
      const gEl = document.getElementById('slot-group');
      if (sEl) sEl.value = '';
      if (eEl) eEl.value = '';
      if (gEl) gEl.value = '';
    } catch (err) {
      console.error('Add slot failed:', err);
      alert(t('sched2_err'));
    }
  });

  document.querySelectorAll('.slot-manage-btn').forEach(btn => {
    btn.addEventListener('click', () => showSlotManager(st, btn.dataset.id));
  });

  document.querySelectorAll('.slot-delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm(t('sched2_delete_confirm'))) return;
      try {
        await deleteSlotAndEnrollments(btn.dataset.id);
      } catch (err) {
        console.error('Delete slot failed:', err);
        alert(t('sched2_err'));
      }
    });
  });

  document.querySelectorAll('.slot-capacity-input').forEach(inp => {
    inp.addEventListener('change', async () => {
      try {
        await updateSlotCapacity(inp.dataset.id, inp.value);
      } catch (err) {
        console.error('Capacity update failed:', err);
        alert(t('sched2_err'));
      }
    });
  });
}

export async function updateSlotCapacity(slotId, raw) {
  const value = String(raw == null ? '' : raw).trim();
  let capacity = null;
  if (value !== '') {
    capacity = Math.max(0, Math.floor(Number(value)));
    if (!Number.isFinite(capacity)) return;
  }
  await updateDoc(doc(db, 'sessionSlots', slotId), { capacity });
}

async function deleteSlotAndEnrollments(slotId) {
  const q = query(collection(db, 'enrollments'), where('slotId', '==', slotId));
  const snap = await getDocs(q);
  if (snap.size > 0) {
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
  }
  await deleteDoc(doc(db, 'sessionSlots', slotId));
}

