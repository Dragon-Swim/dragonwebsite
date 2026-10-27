/**
 * Homepage announcements — admin editor (Dashboard tab "Announcements")
 *
 * Admin-only (2026-10-27 decision): coaches read the homepage notices, only
 * admins publish them. Firestore rules enforce it; this tab is also hidden for
 * non-admins in the sidebar.
 *
 * 三条设计约束,改动前先读:
 *  1. 日期是 'YYYY-MM-DD' 字符串,不是 Timestamp —— 主页按本地时区比较日期,
 *     用 Timestamp 晚上会差一天。见 data/announcements.data.js 的注释。
 *  2. 只允许一条 pinned:保存时把其他文档的 pinned 一起关掉(batch),否则
 *     "哪条上横幅"要靠日期猜,管理员会以为坏了。
 *  3. dashboard 的实时监听会重建 innerHTML,所以草稿存在模块变量里,
 *     重建后 init 会把填了一半的表单放回去(和 meet form 的 draft 同理)。
 */

import {
    db,
    auth,
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    writeBatch,
    serverTimestamp,
} from '../utils/firebase.js';
import {
    announcementStatus,
    formatAnnouncementDate,
    toIsoDate,
} from '../data/announcements.data.js';
import { renderNewsBanner, newsCardsHtml } from './news.js';

const COLLECTION = 'announcements';

/** 模块级状态:列表 + 正在编辑的 id + 未保存的草稿(跨重渲染)。 */
const state = {
    items: [],
    loaded: false,
    editingId: null,
    draft: null,
    busy: false,
};

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/** 面板骨架。真正的列表 / 预览由 paint() 填。 */
export function renderAnnouncementAdmin() {
    return `
    <div id="news-admin">
      <div class="dash-panel" style="margin-bottom: 1.5rem;">
        <div class="dash-panel-header">
          <h3 style="margin: 0;">Publish a notice</h3>
        </div>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin: var(--space-md) 0;">
          What you publish here shows on the public homepage within seconds — no deployment.
          The <strong>pinned</strong> notice becomes the banner under the navbar; every active notice
          also appears in the News section. Notices start on their <em>Show from</em> date and
          disappear after their <em>Until</em> date, so scheduling ahead is safe.
        </p>

        <form id="news-form" autocomplete="off">
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" for="news-title">Title *</label>
            <input class="form-input" id="news-title" maxlength="120" placeholder="e.g. No practice at Claude Moore, Nov 14–15" />
          </div>

          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" for="news-body">Body * <span style="font-size: 0.75rem; color: var(--text-muted);">(one line = one paragraph; the first paragraph is what the banner shows)</span></label>
            <textarea class="form-input" id="news-body" rows="6" maxlength="4000" style="font-family: inherit; line-height: 1.6; resize: vertical;"></textarea>
          </div>

          <div class="form-row" style="grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
            <div class="form-group">
              <label class="form-label" for="news-level">Level</label>
              <select class="form-input" id="news-level">
                <option value="info">Info (gold)</option>
                <option value="urgent">Urgent (red)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="news-date">Show from *</label>
              <input class="form-input" type="date" id="news-date" />
            </div>
            <div class="form-group">
              <label class="form-label" for="news-until">Until <span style="font-size: 0.75rem; color: var(--text-muted);">(optional)</span></label>
              <input class="form-input" type="date" id="news-until" />
            </div>
          </div>

          <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; margin-bottom: 1rem; cursor: pointer;">
            <input type="checkbox" id="news-pinned" />
            Pin to the top banner (only one notice can be pinned — pinning this one unpins the others)
          </label>

          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: var(--space-md);">
            <button type="submit" class="btn btn-primary btn-sm" id="news-save-btn">Publish</button>
            <button type="button" class="btn btn-outline btn-sm" id="news-reset-btn">New / Clear</button>
          </div>
          <p id="news-form-msg" style="margin-top: 0.5rem; font-size: 0.85rem;"></p>
        </form>
      </div>

      <div class="dash-panel" style="margin-bottom: 1.5rem;">
        <div class="dash-panel-header">
          <h3 style="margin: 0;">Preview</h3>
          <span style="font-size: 0.85rem; color: var(--text-muted);">what a visitor sees</span>
        </div>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin: var(--space-md) 0 0.5rem 0;">Banner (only when pinned):</p>
        <div id="news-preview-banner" style="border-radius: var(--radius-sm); overflow: hidden; margin-bottom: 1rem;"></div>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0 0 0.5rem 0;">News card:</p>
        <div id="news-preview-card" class="news-grid"></div>
      </div>

      <div class="dash-panel">
        <div class="dash-panel-header">
          <h3 style="margin: 0;">All notices</h3>
          <span style="display: flex; align-items: center; gap: 0.75rem;">
            <span id="news-admin-status" style="font-size: 0.85rem; color: var(--text-muted);">Loading…</span>
            <button type="button" class="btn btn-outline btn-sm" id="news-refresh-btn">↻ Refresh</button>
          </span>
        </div>
        <div id="news-list" style="margin-top: var(--space-md);"></div>
      </div>
    </div>
    `;
}

/** 挂载:绑定表单、恢复草稿、拉取列表。 */
export function initAnnouncementAdmin() {
    const root = document.getElementById('news-admin');
    if (!root) return;

    const form = document.getElementById('news-form');
    if (!form) return;

    // 每次重建 innerHTML 都会重新走一遍:先把模块里的草稿放回表单
    applyDraft();
    paintPreview();

    form.addEventListener('submit', onSubmit);
    document.getElementById('news-reset-btn')?.addEventListener('click', () => resetForm(true));
    document.getElementById('news-refresh-btn')?.addEventListener('click', () => load());

    for (const [id, event] of [
        ['news-title', 'input'],
        ['news-body', 'input'],
        ['news-level', 'change'],
        ['news-date', 'input'],
        ['news-until', 'input'],
        ['news-pinned', 'change'],
    ]) {
        document.getElementById(id)?.addEventListener(event, () => {
            captureDraft();
            paintPreview();
        });
    }

    paintList();
    load();
}

// ── 表单 ↔ 草稿 ─────────────────────────────────────────────

function field(id) {
    return document.getElementById(id);
}

function captureDraft() {
    state.draft = {
        title: field('news-title')?.value ?? '',
        body: field('news-body')?.value ?? '',
        level: field('news-level')?.value === 'urgent' ? 'urgent' : 'info',
        pinned: field('news-pinned')?.checked === true,
        date: field('news-date')?.value ?? '',
        until: field('news-until')?.value ?? '',
    };
    return state.draft;
}

function applyDraft() {
    const d = state.draft;
    if (field('news-title')) field('news-title').value = d?.title ?? '';
    if (field('news-body')) field('news-body').value = d?.body ?? '';
    if (field('news-level')) field('news-level').value = d?.level ?? 'info';
    if (field('news-pinned')) field('news-pinned').checked = d?.pinned ?? false;
    if (field('news-date')) field('news-date').value = d?.date ?? toIsoDate();
    if (field('news-until')) field('news-until').value = d?.until ?? '';
    field('news-save-btn').textContent = state.editingId ? 'Save changes' : 'Publish';
}

function resetForm(focusTitle) {
    state.draft = null;
    state.editingId = null;
    applyDraft();
    paintPreview();
    const msg = field('news-form-msg');
    if (msg) msg.textContent = '';
    if (focusTitle) field('news-title')?.focus();
}

// ── 预览 ────────────────────────────────────────────────────

function paintPreview() {
    const draft = state.draft || {
        title: '',
        body: '',
        level: 'info',
        pinned: field('news-pinned')?.checked === true,
        date: field('news-date')?.value || toIsoDate(),
        until: field('news-until')?.value || '',
    };
    const preview = {
        id: 'preview',
        title: draft.title || 'Your headline appears here',
        body: draft.body || 'The first paragraph is what the banner shows.\n\nA second paragraph appears only in the News card.',
        level: draft.level,
        pinned: true, // 横幅预览恒显示,实际是否上横幅看 pinned
        date: draft.date || toIsoDate(),
        until: draft.until || null,
    };

    const bannerBox = document.getElementById('news-preview-banner');
    if (bannerBox) bannerBox.innerHTML = renderNewsBanner(preview);

    const cardBox = document.getElementById('news-preview-card');
    if (cardBox) cardBox.innerHTML = newsCardsHtml([preview]);
}

// ── 列表 ────────────────────────────────────────────────────

function statusChip(a) {
    const status = announcementStatus(a);
    const map = {
        live: { label: 'LIVE', color: '#16A34A', bg: 'rgba(22, 163, 74, 0.12)' },
        scheduled: { label: 'SCHEDULED', color: '#B45309', bg: 'rgba(180, 83, 9, 0.12)' },
        expired: { label: 'EXPIRED', color: 'var(--text-muted)', bg: 'var(--bg-primary)' },
    };
    const s = map[status] || map.expired;
    return `<span style="display: inline-block; padding: 0.1rem 0.45rem; border-radius: 999px; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.04em; color: ${s.color}; background: ${s.bg};">${s.label}</span>`;
}

function paintList() {
    const box = document.getElementById('news-list');
    const statusEl = document.getElementById('news-admin-status');
    if (!box) return;

    if (!state.loaded) {
        if (statusEl) statusEl.textContent = 'Loading…';
        return;
    }

    if (statusEl) {
        const live = state.items.filter((a) => announcementStatus(a) === 'live').length;
        statusEl.textContent = `${state.items.length} notice(s) · ${live} live`;
    }

    if (!state.items.length) {
        box.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem;">No notices yet. The homepage shows nothing until you publish one.</p>`;
        return;
    }

    const rows = state.items
        .slice()
        .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
        .map((a) => {
            const chips = [
                a.pinned ? `<span style="font-size: 0.7rem; font-weight: 600; color: var(--color-accent);">PINNED</span>` : '',
                a.level === 'urgent' ? `<span style="font-size: 0.7rem; font-weight: 600; color: #DC2626;">URGENT</span>` : '',
            ].filter(Boolean).join(' · ');
            const until = a.until ? ` → ${escapeHtml(formatAnnouncementDate(a.until))}` : '';
            const editor = a.updatedByEmail || a.createdByEmail || '';
            const edited = a.updatedAt ? `edited by ${escapeHtml(editor)}` : '';
            return `
              <div class="news-admin-row" data-id="${escapeHtml(a.id)}" style="display: flex; gap: 1rem; align-items: flex-start; justify-content: space-between; padding: 0.9rem 0; border-top: 1px solid var(--border-color);">
                <div style="min-width: 0;">
                  <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; margin-bottom: 0.25rem;">
                    ${statusChip(a)} ${chips}
                    <span style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(formatAnnouncementDate(a.date))}${until}</span>
                  </div>
                  <div style="font-weight: 600; font-size: 0.92rem;">${escapeHtml(a.title)}</div>
                  <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.2rem;">${edited}</div>
                </div>
                <div style="display: flex; gap: 0.4rem; flex-shrink: 0;">
                  <button type="button" class="btn btn-outline btn-sm" data-action="edit">Edit</button>
                  <button type="button" class="btn btn-outline btn-sm" data-action="delete" style="color: var(--color-accent);">Delete</button>
                </div>
              </div>
            `;
        })
        .join('');

    box.innerHTML = rows;

    box.querySelectorAll('.news-admin-row').forEach((row) => {
        const id = row.dataset.id;
        row.querySelector('[data-action="edit"]')?.addEventListener('click', () => startEdit(id));
        row.querySelector('[data-action="delete"]')?.addEventListener('click', () => onDelete(id));
    });
}

function startEdit(id) {
    const item = state.items.find((a) => a.id === id);
    if (!item) return;
    state.editingId = id;
    state.draft = {
        title: item.title,
        body: item.body,
        level: item.level,
        pinned: item.pinned,
        date: item.date,
        until: item.until || '',
    };
    applyDraft();
    paintPreview();
    const msg = field('news-form-msg');
    if (msg) {
        msg.textContent = 'Editing an existing notice — saving keeps it in place, so families who already dismissed the banner will not see it again.';
        msg.style.color = 'var(--text-muted)';
    }
    document.getElementById('news-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── 读 ──────────────────────────────────────────────────────

async function load() {
    const statusEl = document.getElementById('news-admin-status');
    if (statusEl) statusEl.textContent = 'Loading…';
    try {
        const snap = await getDocs(collection(db, COLLECTION));
        state.items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        state.loaded = true;
        paintList();
    } catch (error) {
        console.error('[news-admin] load failed:', error);
        if (statusEl) statusEl.textContent = `Load failed: ${error.message}`;
    }
}

// ── 写 ──────────────────────────────────────────────────────

function validate(draft) {
    if (!draft.title.trim()) return 'Title is required.';
    if (draft.title.trim().length > 120) return 'Title is too long (max 120 characters).';
    if (!draft.body.trim()) return 'Body is required.';
    if (draft.body.length > 4000) return 'Body is too long (max 4000 characters).';
    if (!draft.date) return '"Show from" date is required.';
    if (draft.until && draft.until < draft.date) return '"Until" cannot be earlier than "Show from".';
    return null;
}

async function onSubmit(event) {
    event.preventDefault();
    if (state.busy) return;

    const draft = captureDraft();
    const problem = validate(draft);
    const msg = field('news-form-msg');
    if (problem) {
        if (msg) { msg.textContent = `❌ ${problem}`; msg.style.color = 'var(--color-accent)'; }
        return;
    }

    state.busy = true;
    const saveBtn = field('news-save-btn');
    const label = saveBtn.textContent;
    if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Saving…'; }

    const user = auth.currentUser;
    const payload = {
        title: draft.title.trim(),
        body: draft.body,
        level: draft.level,
        pinned: draft.pinned,
        date: draft.date,
        until: draft.until || null,
        updatedAt: serverTimestamp(),
        updatedBy: user?.uid || null,
        updatedByEmail: user?.email || null,
    };

    try {
        let id = state.editingId;
        if (id) {
            await updateDoc(doc(db, COLLECTION, id), payload);
        } else {
            const created = await addDoc(collection(db, COLLECTION), {
                ...payload,
                createdBy: user?.uid || null,
                createdByEmail: user?.email || null,
                createdAt: serverTimestamp(),
            });
            id = created.id;
        }

        // 只允许一条置顶:本条置顶时,把别的都取消。
        if (draft.pinned) await unpinOthers(id);

        // 乐观更新本地列表,免得等一次网络往返
        const saved = { ...payload, id, updatedAt: new Date().toISOString() };
        const index = state.items.findIndex((a) => a.id === id);
        if (index >= 0) state.items[index] = { ...state.items[index], ...saved };
        else state.items.push(saved);

        resetForm(false);
        paintList();
        if (msg) { msg.textContent = '✅ Saved. The homepage will show it within a page refresh.'; msg.style.color = '#16A34A'; }
        load();
    } catch (error) {
        console.error('[news-admin] save failed:', error);
        if (msg) { msg.textContent = `❌ Save failed: ${error.message}`; msg.style.color = 'var(--color-accent)'; }
    } finally {
        state.busy = false;
        if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = label; }
    }
}

async function unpinOthers(keepId) {
    const snap = await getDocs(query(collection(db, COLLECTION), where('pinned', '==', true)));
    const others = snap.docs.filter((d) => d.id !== keepId);
    if (!others.length) return;
    const batch = writeBatch(db);
    others.forEach((d) => batch.update(d.ref, { pinned: false }));
    await batch.commit();
}

async function onDelete(id) {
    const item = state.items.find((a) => a.id === id);
    const label = item ? `"${item.title}"` : 'this notice';
    if (!window.confirm(`Delete ${label}? The homepage will stop showing it immediately.`)) return;

    try {
        await deleteDoc(doc(db, COLLECTION, id));
        state.items = state.items.filter((a) => a.id !== id);
        if (state.editingId === id) resetForm(false);
        paintList();
        const msg = field('news-form-msg');
        if (msg) { msg.textContent = '🗑 Deleted.'; msg.style.color = 'var(--text-muted)'; }
    } catch (error) {
        console.error('[news-admin] delete failed:', error);
        const msg = field('news-form-msg');
        if (msg) { msg.textContent = `❌ Delete failed: ${error.message}`; msg.style.color = 'var(--color-accent)'; }
    }
}
