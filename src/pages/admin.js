/**
 * Admin Page — Dragon Swim Team
 * Protected page for role=admin users to manage coach accounts.
 * Coach creation writes to Firestore; a node script (scripts/create-coaches.mjs)
 * processes pending coach records to create Auth accounts via Admin SDK.
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
import {
  auth, db, doc, getDoc, collection, addDoc, onSnapshot,
  query, orderBy, onAuthStateChanged, signOut,
} from '../utils/firebase.js';

initTheme();
renderNavbar();

let currentUser = null;
let currentTab = 'create';

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
          <button class="admin-nav-item ${currentTab === 'manage' ? 'active' : ''}" data-tab="manage">
            👥 Manage Coaches
          </button>
        </nav>
        <div class="admin-sidebar-footer">
          <a href="${import.meta.env.BASE_URL}dashboard.html" class="admin-nav-item">← Back to Dashboard</a>
          <button class="admin-nav-item" id="admin-signout" style="color: var(--color-accent);">🚪 Sign Out</button>
        </div>
      </aside>

      <main class="admin-main">
        <header class="admin-topbar">
          <h1 class="admin-page-title">${currentTab === 'create' ? 'Create Coach Account' : 'Manage Coaches'}</h1>
        </header>
        <div class="admin-content">
          ${currentTab === 'create' ? renderCreateForm() : renderManageView()}
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
      <p class="admin-hint">Fill in the coach's details. The account will be created as "pending" and must be processed via the sync script.</p>
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
        <button type="submit" class="btn btn-primary" id="create-coach-btn">Create Coach</button>
        <p id="coach-form-message" class="admin-form-message"></p>
      </form>
    </div>

    <div class="admin-panel" style="margin-top: 1.5rem;">
      <h3>Sync Instructions</h3>
      <p class="admin-hint">After adding coaches, run this command in your terminal to create their Auth accounts:</p>
      <pre class="admin-code">node scripts/create-coaches.mjs</pre>
      <p class="admin-hint" style="margin-top: 0.5rem;">This requires <code>serviceAccountKey.json</code> in the project root.</p>
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
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody id="coach-table-body">
            <tr><td colspan="4" class="admin-empty">Loading...</td></tr>
          </tbody>
        </table>
      </div>
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
        await addDoc(collection(db, 'coaches'), {
          email,
          displayName,
          password, // stored temporarily until processed by sync script
          status: 'pending',
          createdBy: currentUser.uid,
          createdAt: new Date(),
        });
        msgEl.textContent = `Coach "${displayName}" (${email}) added as pending. Run the sync script to activate.`;
        msgEl.className = 'admin-form-message success';
        form.reset();
      } catch (err) {
        msgEl.textContent = `Error: ${err.message}`;
        msgEl.className = 'admin-form-message error';
      }
      btn.disabled = false;
    });
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
        return `
          <tr>
            <td>${d.email || '—'}</td>
            <td>${d.displayName || '—'}</td>
            <td><span class="admin-status admin-status-${d.status}">${d.status}</span></td>
            <td>${date.toLocaleDateString()}</td>
          </tr>
        `;
      }).join('');

      tbody.innerHTML = rows || '<tr><td colspan="4" class="admin-empty">No coaches yet.</td></tr>';
      pendingBadge.textContent = `${pending} pending`;
    }, (err) => {
      tbody.innerHTML = `<tr><td colspan="4" class="admin-empty">Error loading: ${err.message}</td></tr>`;
    });
  }
}
