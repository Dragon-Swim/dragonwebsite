/**
 * Admin Page — Dragon Swim Team
 * Protected page for role=admin users to manage coach accounts.
 * Coach creation calls Firebase Auth REST API directly to create the
 * user account, then stores only the profile in Firestore (no password).
 */

import '../styles/reset.css';
import '../styles/variables.css';
import '../styles/global.css';
import '../styles/navbar.css';
import '../styles/footer.css';
import './admin.css';

import { initTheme } from '../components/theme-toggle.js';
import { renderNavbar } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';
import { downloadAdminCSV, ADMIN_COLUMNS } from '../utils/csv.js';
import { t } from '../utils/i18n.js';
import {
  auth, db, doc, getDoc, setDoc, collection, onSnapshot,
  query, orderBy, where, getDocs, onAuthStateChanged, signOut, addDoc, deleteDoc,
} from '../utils/firebase.js';

initTheme();
renderNavbar();

let currentUser = null;
let currentTab = 'create';
let allRegistrations = [];

const app = document.getElementById('app');

// ── Auth guard ──────────────────────────────────────────────────
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = import.meta.env.BASE_URL + 'signin.html';
    return;
  }

  // Check role
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  const role = userDoc.exists() ? userDoc.data().role : null;
  if (role !== 'admin') {
    window.location.href = import.meta.env.BASE_URL + 'dashboard.html';
    return;
  }

  currentUser = user;

  // Listen for registration data (needed for export tab)
  const qReg = query(collection(db, 'registrations'), orderBy('createdAt', 'desc'));
  onSnapshot(qReg, (snapshot) => {
    allRegistrations = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    // Re-render if export tab is active (refresh swimmer count)
    if (currentTab === 'export') render();
  });

  render();
});

// ── Render ──────────────────────────────────────────────────────
function render() {
  app.innerHTML = `
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <div class="admin-sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <nav class="admin-nav">
          <button class="admin-nav-item ${currentTab === 'create' ? 'active' : ''}" data-tab="create">
            ➕ Create Coach
          </button>
          <button class="admin-nav-item ${currentTab === 'family' ? 'active' : ''}" data-tab="family">
            👪 Add Family
          </button>
          <button class="admin-nav-item ${currentTab === 'manage' ? 'active' : ''}" data-tab="manage">
            👥 Manage Coaches
          </button>
          <button class="admin-nav-item ${currentTab === 'export' ? 'active' : ''}" data-tab="export">
            📥 Export Data
          </button>
        </nav>
        <div class="admin-sidebar-footer">
          <a href="${import.meta.env.BASE_URL}dashboard.html" class="admin-nav-item">← Back to Dashboard</a>
          <button class="admin-nav-item" id="admin-signout" style="color: var(--color-accent);">🚪 Sign Out</button>
        </div>
      </aside>

      <main class="admin-main">
        <header class="admin-topbar">
          <h1 class="admin-page-title">${currentTab === 'create' ? 'Create Coach Account' : currentTab === 'manage' ? 'Manage Coaches' : currentTab === 'family' ? 'Pre-authorize Family' : 'Export Data'}</h1>
        </header>
        <div class="admin-content">
          ${currentTab === 'create' ? renderCreateForm() : currentTab === 'manage' ? renderManageView() : currentTab === 'family' ? renderFamilyView() : renderExportView()}
        </div>
      </main>
    </div>
  `;

  bindEvents();
  renderFooter();
}

function renderCreateForm() {
  return `
    <div class="admin-panel">
      <h3>New Coach</h3>
      <p class="admin-hint">Fill in the coach's details. The account will be created immediately.</p>
      <form id="coach-form" class="admin-form">
        <div class="form-group">
          <label class="form-label" for="coach-email">Email *</label>
          <input class="form-input" type="email" id="coach-email" placeholder="coach@example.com" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="coach-name">Display Name *</label>
          <input class="form-input" type="text" id="coach-name" placeholder="e.g. Coach Thompson" required />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="coach-password">Temporary Password *</label>
            <input class="form-input" type="password" id="coach-password" placeholder="••••••••" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="coach-confirm">Confirm Password *</label>
            <input class="form-input" type="password" id="coach-confirm" placeholder="••••••••" required />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="coach-role">Role *</label>
          <select class="form-input" id="coach-role" required>
            <option value="coach">Coach (no admin access)</option>
            <option value="admin">Admin Coach (can manage coaches)</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary" id="create-coach-btn">Create Coach</button>
        <p id="coach-form-message" class="admin-form-message"></p>
      </form>
    </div>
  `;
}

function renderManageView() {
  return `
    <div class="admin-panel">
      <div class="admin-panel-header">
        <h3>All Coach Accounts</h3>
        <span class="admin-badge" id="pending-count">0 pending</span>
    </div>
      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody id="coach-table-body">
            <tr><td colspan="5" class="admin-empty">Loading...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderFamilyView() {
  return `
    <div class="admin-panel">
      <h3>${t('admin_family_title')}</h3>
      <p class="admin-hint">${t('admin_family_hint')}</p>
      <form id="family-form" class="admin-form">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="family-email">${t('admin_family_email')}</label>
            <input class="form-input" type="email" id="family-email" placeholder="parent@example.com" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="family-name">${t('admin_family_name')}</label>
            <input class="form-input" type="text" id="family-name" placeholder="e.g. John Chen" />
          </div>
        </div>
        <button type="submit" class="btn btn-primary" id="add-family-btn">${t('admin_family_add_btn')}</button>
        <p id="family-form-message" class="admin-form-message"></p>
      </form>
    </div>

    <div class="admin-panel" style="margin-top: 2rem;">
      <h3>${t('admin_family_list_title')}</h3>
      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Status</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="family-table-body">
            <tr><td colspan="5" class="admin-empty">Loading...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderExportView() {
  let totalFamilies = allRegistrations.length;
  let totalSwimmers = 0;
  const statusCounts = { pending: 0, active: 0, inactive: 0 };

  for (const reg of allRegistrations) {
    const swimmers = reg.swimmers || [];
    for (const s of swimmers) {
      if (s.deleted) continue;
      totalSwimmers++;
      const st = s.status || 'pending';
      statusCounts[st] = (statusCounts[st] || 0) + 1;
    }
  }

  const statHeaders = ['Families', 'Swimmers', 'Active', 'Pending', 'Inactive'];
  const statValues = [totalFamilies, totalSwimmers, statusCounts.active || 0, statusCounts.pending || 0, statusCounts.inactive || 0];

  return `
    <div class="admin-panel">
      <h3>Export All Registration Data</h3>
      <p class="admin-hint">Download a CSV file with every swimmer and their family contact information.</p>

      <table class="admin-table" style="margin: 1.5rem 0; max-width: 600px;">
        <thead>
          <tr>${statHeaders.map(h => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          <tr>${statValues.map(v => `<td style="font-weight: 600; font-size: 1.1rem;">${v}</td>`).join('')}</tr>
        </tbody>
      </table>

      <div class="admin-panel" style="background: var(--bg-secondary, #f9fafb); margin-top: 1.5rem;">
        <h4>CSV Columns</h4>
        <p class="admin-hint">
          One row per swimmer. Families with multiple swimmers appear on multiple rows with the same parent info.
          <button type="button" class="btn btn-outline btn-sm" id="export-select-all" style="margin-left: 1rem;">Select All</button>
          <button type="button" class="btn btn-outline btn-sm" id="export-deselect-all">Deselect All</button>
        </p>
        <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; margin: 1rem 0;" id="export-column-checkboxes">
          ${ADMIN_COLUMNS.map(c => `
            <label class="checkbox-label" style="display: inline-flex; align-items: center; gap: 0.35rem; cursor: pointer;">
              <input type="checkbox" class="export-col-cb" value="${c.key}" checked />
              <span>${c.label}</span>
            </label>
          `).join('')}
        </div>
      </div>

      <div style="margin-top: 2rem; display: flex; gap: 1rem; align-items: center;">
        <button class="btn btn-primary" id="admin-export-csv-btn" ${totalSwimmers === 0 ? 'disabled' : ''}>
          📥 Download CSV
        </button>
        <span style="color: var(--text-muted); font-size: 0.9rem;" id="export-filename-preview"></span>
      </div>
      <p id="export-message" class="admin-form-message" style="margin-top: 1rem;"></p>
    </div>
  `;
}

// ── Events ──────────────────────────────────────────────────────
function bindEvents() {
  // Tab switching
  document.querySelectorAll('.admin-nav-item[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentTab = btn.dataset.tab;
      render();
    });
  });

  // Sign out
  document.getElementById('admin-signout')?.addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = import.meta.env.BASE_URL + 'signin.html';
  });

  // Create coach form
  const form = document.getElementById('coach-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msgEl = document.getElementById('coach-form-message');
      const btn = document.getElementById('create-coach-btn');

      const email = document.getElementById('coach-email').value.trim();
      const displayName = document.getElementById('coach-name').value.trim();
      const password = document.getElementById('coach-password').value;
      const confirm = document.getElementById('coach-confirm').value;
      const role = document.getElementById('coach-role').value;

      if (!email || !displayName || !password) {
        msgEl.textContent = 'Please fill in all required fields.';
        msgEl.className = 'admin-form-message error';
        return;
      }
      if (password !== confirm) {
        msgEl.textContent = 'Passwords do not match.';
        msgEl.className = 'admin-form-message error';
        return;
      }
      if (password.length < 6) {
        msgEl.textContent = 'Password must be at least 6 characters.';
        msgEl.className = 'admin-form-message error';
        return;
      }

      btn.disabled = true;
      msgEl.textContent = '';

      try {
        // 1. Create Firebase Auth account via REST API (password never touches Firestore)
        const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
        const authResp = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, returnSecureToken: false }),
          }
        );

        if (!authResp.ok) {
          const errData = await authResp.json();
          const code = errData.error?.message || 'UNKNOWN';
          // Map common Firebase Auth errors to user-friendly messages
          const messages = {
            EMAIL_EXISTS: 'A user with this email already exists.',
            WEAK_PASSWORD: 'Password must be at least 6 characters.',
            INVALID_EMAIL: 'Invalid email address.',
            OPERATION_NOT_ALLOWED: 'New accounts are currently disabled. Contact support.',
          };
          throw new Error(messages[code] || `Auth error: ${code}`);
        }

        const authData = await authResp.json();
        const uid = authData.localId;
        if (!uid) {
          throw new Error('Auth account created but no UID returned. Please check the response.');
        }

        // 2. Store role in Firestore users collection (dashboard reads this for role detection)
        await setDoc(doc(db, 'users', uid), {
          email,
          displayName,
          role,
          createdBy: currentUser.uid,
          createdAt: new Date(),
        });

        // 3. Store coach profile in coaches collection (admin panel reads this for management)
        await setDoc(doc(db, 'coaches', uid), {
          uid,
          email,
          displayName,
          role,
          status: 'active',
          createdBy: currentUser.uid,
          createdAt: new Date(),
        });

        msgEl.textContent = `Coach "${displayName}" (${email}) added successfully.`;
        msgEl.className = 'admin-form-message success';
        form.reset();
      } catch (err) {
        msgEl.textContent = `Error: ${err.message}`;
        msgEl.className = 'admin-form-message error';
      }
      btn.disabled = false;
    });
  }

  // ── Add Family Form ──
  const familyForm = document.getElementById('family-form');
  if (familyForm) {
    familyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msgEl = document.getElementById('family-form-message');
      const btn = document.getElementById('add-family-btn');
      const email = document.getElementById('family-email').value.trim();
      const parentName = document.getElementById('family-name').value.trim() || null;

      if (!email) {
        msgEl.textContent = 'Email is required.';
        msgEl.className = 'admin-form-message error';
        return;
      }

      btn.disabled = true;
      msgEl.textContent = '';

      try {
        // Check if email already exists
        const existingSnap = await getDocs(query(collection(db, 'families'), where('email', '==', email)));
        if (!existingSnap.empty) {
          throw new Error(t('admin_family_already_exists'));
        }

        await addDoc(collection(db, 'families'), {
          email,
          parentName,
          status: 'pending',
          registeredUid: null,
          createdBy: currentUser.uid,
          createdAt: new Date(),
        });

        msgEl.textContent = `"${parentName || email}" added successfully.`;
        msgEl.className = 'admin-form-message success';
        familyForm.reset();
      } catch (err) {
        msgEl.textContent = `Error: ${err.message}`;
        msgEl.className = 'admin-form-message error';
      }
      btn.disabled = false;
    });
  }

  // ── Live Family List ──
  if (currentTab === 'family') {
    const tbody = document.getElementById('family-table-body');
    if (tbody) {
      const qFam = query(collection(db, 'families'), orderBy('createdAt', 'desc'));
      onSnapshot(qFam, (snapshot) => {
        const rows = snapshot.docs.map(docSnap => {
          const d = docSnap.data();
          const date = d.createdAt?.toDate?.() || new Date(d.createdAt);
          const statusLabel = d.status === 'registered' ? t('admin_family_status_registered') : t('admin_family_status_pending');
          const statusClass = d.status === 'registered' ? 'admin-status-active' : 'admin-status-pending';
          return `
            <tr>
              <td>${d.email || '—'}</td>
              <td>${d.parentName || '—'}</td>
              <td><span class="admin-status ${statusClass}">${statusLabel}</span></td>
              <td>${date.toLocaleDateString()}</td>
              <td><button class="btn btn-outline btn-sm family-delete-btn" data-id="${docSnap.id}" data-email="${d.email || ''}" style="color: var(--color-accent);">${t('admin_family_delete')}</button></td>
            </tr>
          `;
        }).join('');

        tbody.innerHTML = rows || '<tr><td colspan="5" class="admin-empty">No families authorized yet.</td></tr>';

        // Bind delete buttons
        tbody.querySelectorAll('.family-delete-btn').forEach(btn => {
          btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            const email = btn.dataset.email;
            if (!confirm(t('admin_family_delete_confirm') + '\n\n' + email)) return;
            try {
              await deleteDoc(doc(db, 'families', id));
            } catch (err) {
              console.error('Error deleting family:', err);
              alert('Failed to delete: ' + err.message);
            }
          });
        });
      }, (err) => {
        tbody.innerHTML = `<tr><td colspan="5" class="admin-empty">Error loading: ${err.message}</td></tr>`;
      });
    }
  }

  // Live coach list (only when manage tab is active)
  if (currentTab === 'manage') {
    const tbody = document.getElementById('coach-table-body');
    const pendingBadge = document.getElementById('pending-count');
    if (!tbody) return;

    const q = query(collection(db, 'coaches'), orderBy('createdAt', 'desc'));
    onSnapshot(q, (snapshot) => {
      let pending = 0;
      const rows = snapshot.docs.map(docSnap => {
        const d = docSnap.data();
        if (d.status === 'pending') pending++;
        const date = d.createdAt?.toDate?.() || new Date(d.createdAt);
        const roleLabel = d.role === 'admin' ? 'Admin Coach' : 'Coach';
        const roleClass = d.role === 'admin' ? 'admin-role-admin' : 'admin-role-coach';
        return `
          <tr>
            <td>${d.email || '—'}</td>
            <td>${d.displayName || '—'}</td>
            <td><span class="admin-role-badge ${roleClass}">${roleLabel}</span></td>
            <td><span class="admin-status admin-status-${d.status}">${d.status}</span></td>
            <td>${date.toLocaleDateString()}</td>
          </tr>
        `;
      }).join('');

      tbody.innerHTML = rows || '<tr><td colspan="5" class="admin-empty">No coaches yet.</td></tr>';
      pendingBadge.textContent = `${pending} pending`;
    }, (err) => {
      tbody.innerHTML = `<tr><td colspan="5" class="admin-empty">Error loading: ${err.message}</td></tr>`;
    });
  }

  // Export tab — download CSV
  if (currentTab === 'export') {
    const exportBtn = document.getElementById('admin-export-csv-btn');
    const preview = document.getElementById('export-filename-preview');
    if (preview) {
      const today = new Date().toISOString().slice(0, 10);
      preview.textContent = `dragon-full-roster-${today}.csv`;
    }

    // Select All / Deselect All
    document.getElementById('export-select-all')?.addEventListener('click', () => {
      document.querySelectorAll('.export-col-cb').forEach(cb => { cb.checked = true; });
    });
    document.getElementById('export-deselect-all')?.addEventListener('click', () => {
      document.querySelectorAll('.export-col-cb').forEach(cb => { cb.checked = false; });
    });

    exportBtn?.addEventListener('click', () => {
      const checkedKeys = [];
      document.querySelectorAll('.export-col-cb:checked').forEach(cb => {
        checkedKeys.push(cb.value);
      });
      if (checkedKeys.length === 0) {
        const msg = document.getElementById('export-message');
        msg.textContent = 'Please select at least one column.';
        msg.className = 'admin-form-message error';
        return;
      }
      const today = new Date().toISOString().slice(0, 10);
      downloadAdminCSV(allRegistrations, `dragon-full-roster-${today}.csv`, checkedKeys);
      const msg = document.getElementById('export-message');
      if (msg) {
        msg.textContent = `Download started — ${checkedKeys.length} columns.`;
        msg.className = 'admin-form-message success';
        setTimeout(() => { msg.textContent = ''; msg.className = 'admin-form-message'; }, 3000);
      }
    });
  }
}
