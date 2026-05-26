/**
 * Dashboard Page — Dragon Swim Team
 * TaskFlow-inspired dashboard with sidebar + cards for swim plans, meets, schedules
 */

import '../styles/reset.css';
import '../styles/variables.css';
import '../styles/global.css';
import './dashboard.css';

import { initTheme, toggleTheme, updateToggleIcon } from '../components/theme-toggle.js';
import { t } from '../utils/i18n.js';
import { auth, db, doc, getDoc, updateDoc, collection, addDoc, deleteDoc, onSnapshot, query, where, orderBy, limit, getDocs, onAuthStateChanged, signOut } from '../utils/firebase.js';

initTheme();

// ── Sample Data ──
const swimPlans = [
  { id: 1, name: 'Endurance Base Building', season: 'Winter 2026', daysPerWeek: 4, priority: 'High', progress: 72, tasks: '18 / 25 workouts completed', due: 'Feb 28, 2026', status: 'In Progress' },
  { id: 2, name: 'Sprint Technique Focus', season: 'Spring 2026', daysPerWeek: 3, priority: 'Medium', progress: 45, tasks: '9 / 20 workouts completed', due: 'Mar 15, 2026', status: 'In Progress' },
  { id: 3, name: 'Stroke Refinement (Butterfly)', season: 'Summer 2026', daysPerWeek: 5, priority: 'Low', progress: 0, tasks: '0 / 12 workouts completed', due: 'Apr 30, 2026', status: 'Not Started' },
  { id: 4, name: 'Fall Conditioning', season: 'Fall 2025', daysPerWeek: 3, priority: 'High', progress: 100, tasks: '30 / 30 workouts completed', due: 'Nov 20, 2025', status: 'Completed' },
];

// ── State Storage (Moving from constants to reactive state) ──
let swimMeets = [];
let practiceSchedules = [];
let currentUser = null;
let userRole = 'swimmer';
let familyData = null;
let familyDataId = null;

const coachRoster = [
  { id: 101, name: 'Alice Thompson', group: 'Competitive', age: 14, rank: 'Regional' },
  { id: 102, name: 'Bob Wilson', group: 'Intermediate', age: 12, rank: 'Novice' },
  { id: 103, name: 'Charlie Brown', group: 'Competitive', age: 15, rank: 'State' },
  { id: 104, name: 'Daisy Miller', group: 'Beginner', age: 10, rank: 'Novice' },
  { id: 105, name: 'Ethan Hunt', group: 'Competitive', age: 16, rank: 'National' },
];

// App State
let currentTab = 'overview';
let isMobileMenuOpen = false;
let isInitialized = false;

function initApp() {
  const app = document.getElementById('app');

  // Show loading state immediately
  app.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; gap: 20px; font-family: sans-serif;">
      <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #f5c518; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <p style="color: #666;">Loading your Dragon dashboard...</p>
      <style>
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    </div>
  `;

  console.log("Dashboard: Initializing auth listener...");

  // Add auth check before rendering content
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      console.log("Dashboard: No user authenticated, redirecting to signin...");
      window.location.href = import.meta.env.BASE_URL + 'signin.html';
      return;
    }

    currentUser = user;
    console.log("Dashboard: User authenticated:", user.email);

    try {
      console.log("Dashboard: Fetching user document...");
      const userDoc = await getDoc(doc(db, "users", user.uid));

      // Case-insensitive email check for coach account
      const isCoachEmail = user.email && user.email.toLowerCase() === 'dragonswim@outlook.com';
      userRole = isCoachEmail ? 'coach' : (userDoc.exists() ? userDoc.data().role : 'swimmer');
      console.log("Dashboard: Detected role:", userRole);

      // Initialize Real-time Listeners ONLY ONCE
      if (!isInitialized) {
        console.log("Dashboard: Initializing data listeners...");
        initDataListeners();
        isInitialized = true;
        refreshUI();
      } else {
        console.log("Dashboard: Refreshing UI...");
        refreshUI();
      }
    } catch (error) {
      console.error("Dashboard Critical Error:", error);

      // Display error to user
      app.innerHTML = `
        <div style="padding: 40px; text-align: center; font-family: sans-serif; max-width: 500px; margin: 100px auto; border: 1px solid #fee2e2; background: #fef2f2; border-radius: 12px; color: #991b1b;">
          <h2 style="margin-bottom: 16px;">Failed to load dashboard</h2>
          <p style="margin-bottom: 24px;">Something went wrong while setting up your workspace. This might be due to a connection issue or a configuration error.</p>
          <code style="display: block; padding: 12px; background: #fee2e2; border-radius: 6px; font-size: 13px; text-align: left; overflow-x: auto; margin-bottom: 24px;">
            ${error.message || 'Unknown error'}
          </code>
          <button onclick="window.location.reload()" style="padding: 10px 20px; background: #991b1b; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Retry Loading</button>
        </div>
      `;

      userRole = 'swimmer';
    }
  });
}

function initDataListeners() {
  // Listen to Meets
  const qMeets = query(collection(db, "meets"), orderBy("createdAt", "desc"));
  onSnapshot(qMeets, (snapshot) => {
    swimMeets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    refreshUI();
  }, (error) => {
    console.error("Error listening to meets:", error);
  });

  // Listen to Schedules
  const qSchedules = query(collection(db, "schedules"), orderBy("createdAt", "asc"));
  onSnapshot(qSchedules, (snapshot) => {
    practiceSchedules = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    refreshUI();
  }, (error) => {
    console.error("Error listening to schedules:", error);
  });

  // Fetch family registration data
  fetchFamilyData();
}

async function fetchFamilyData() {
  if (!currentUser) return;
  const qReg = query(
    collection(db, "registrations"),
    where("uid", "==", currentUser.uid),
    orderBy("createdAt", "desc"),
    limit(1)
  );
  const snapshot = await getDocs(qReg);
  if (!snapshot.empty) {
    familyDataId = snapshot.docs[0].id;
    familyData = snapshot.docs[0].data();
  }
}

function refreshUI() {
  if (!currentUser) return;
  fetchFamilyData().then(() => {
    renderCurrentView();
  }).catch(err => {
    console.error("Error fetching family data:", err);
    renderCurrentView();
  });
}

function renderCurrentView() {
  if (userRole === 'coach') {
    renderCoachDashboard(currentUser);
  } else {
    renderDashboard(currentUser);
  }
}

function renderDashboard(user) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="dash-layout">
      <!-- Sidebar -->
      <aside class="dash-sidebar" id="dash-sidebar">
        <div class="dash-sidebar-header">
          <a href="${import.meta.env.BASE_URL}" class="dash-logo">
            <img src="${import.meta.env.BASE_URL}logo-light.jpg" alt="Dragon Swim Team" class="dash-logo-img light-logo" />
            <img src="${import.meta.env.BASE_URL}logo-dark.png" alt="Dragon Swim Team" class="dash-logo-img dark-logo" />
          </a>
        </div>
        <nav class="dash-nav">
          <div class="dash-nav-section">
            <span class="dash-nav-label">Menu</span>
            <button class="dash-nav-item ${currentTab === 'overview' ? 'active' : ''}" data-tab="overview">
              <span class="dash-nav-icon">📊</span> Overview
            </button>
            <button class="dash-nav-item ${currentTab === 'profile' ? 'active' : ''}" data-tab="profile">
              <span class="dash-nav-icon">👤</span> Profile
            </button>
            <button class="dash-nav-item ${currentTab === 'plans' ? 'active' : ''}" data-tab="plans">
              <span class="dash-nav-icon">📋</span> Swim Plans
            </button>
            <button class="dash-nav-item ${currentTab === 'meets' ? 'active' : ''}" data-tab="meets">
              <span class="dash-nav-icon">🏆</span> Swim Meets
            </button>
            <button class="dash-nav-item ${currentTab === 'schedule' ? 'active' : ''}" data-tab="schedule">
              <span class="dash-nav-icon">📅</span> Schedule
            </button>
          </div>
          <div class="dash-nav-section" style="margin-top: auto;">
            <span class="dash-nav-label">System</span>
            <a href="${import.meta.env.BASE_URL}contact.html" class="dash-nav-item" style="text-decoration: none;">
              <span class="dash-nav-icon">💬</span> Messages
            </a>
            <button class="dash-nav-item" id="dash-theme-toggle">
              <span class="dash-nav-icon" id="sidebar-theme-icon">🌙</span> Theme
            </button>
            <button class="dash-nav-item" id="sidebar-signout" style="color: var(--color-accent); margin-top: var(--space-md);">
              <span class="dash-nav-icon">🚪</span> Sign Out
            </button>
          </div>
        </nav>
      </aside>

      <!-- Main Content Area -->
      <main class="dash-main">
        <!-- Topbar -->
        <header class="dash-topbar">
          <div class="dash-topbar-left">
            <button class="dash-hamburger" id="dash-hamburger">
              <span></span><span></span><span></span>
            </button>
            <div>
              <h1 class="dash-page-title">${getTabTitle(currentTab)}</h1>
              <p class="dash-page-subtitle">${getTabSubtitle(currentTab)}</p>
            </div>
          </div>
          <div class="dash-topbar-right">
            <div class="dash-user-menu" id="user-menu">
              <button class="dash-user-trigger" id="user-trigger">
                <div class="dash-avatar">${(getParentName() || user.email || 'D').charAt(0).toUpperCase()}</div>
                <span class="dash-user-name">${getParentName() || user.email || 'Swimmer'}</span>
                <span class="dash-dropdown-arrow">▾</span>
              </button>
              <div class="dash-dropdown" id="user-dropdown" style="display: none;">
                <button class="dash-dropdown-item" id="menu-profile">👤 Profile</button>
                <button class="dash-dropdown-item" id="menu-signout" style="color: var(--color-accent);">🚪 Sign Out</button>
              </div>
            </div>
          </div>
        </header>

        <!-- Dynamic Content -->
        <div class="dash-content">
          ${renderTabContent(currentTab, 'swimmer')}
        </div>
      </main>
    </div>
  `;

  bindEvents();
  initTheme();
  updateSidebarThemeIcon();
}

function renderCoachDashboard(user) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="dash-layout">
      <!-- Sidebar -->
      <aside class="dash-sidebar" id="dash-sidebar">
        <div class="dash-sidebar-header">
          <a href="${import.meta.env.BASE_URL}" class="dash-logo">
            <img src="${import.meta.env.BASE_URL}logo-light.jpg" alt="Dragon Swim Team" class="dash-logo-img light-logo" />
            <img src="${import.meta.env.BASE_URL}logo-dark.png" alt="Dragon Swim Team" class="dash-logo-img dark-logo" />
          </a>
        </div>
        <nav class="dash-nav">
          <div class="dash-nav-section">
            <span class="dash-nav-label">Coach Menu</span>
            <button class="dash-nav-item ${currentTab === 'overview' ? 'active' : ''}" data-tab="overview">
              <span class="dash-nav-icon">🏠</span> Overview
            </button>
            <button class="dash-nav-item ${currentTab === 'roster' ? 'active' : ''}" data-tab="roster">
              <span class="dash-nav-icon">👥</span> Swimmer Roster
            </button>
            <button class="dash-nav-item ${currentTab === 'meets' ? 'active' : ''}" data-tab="meets">
              <span class="dash-nav-icon">🏁</span> Meet Management
            </button>
            <button class="dash-nav-item ${currentTab === 'schedule' ? 'active' : ''}" data-tab="schedule">
              <span class="dash-nav-icon">⏱️</span> Practice Schedule
            </button>
          </div>
          <div class="dash-nav-section" style="margin-top: auto;">
            <span class="dash-nav-label">System</span>
            <button class="dash-nav-item" id="dash-theme-toggle">
              <span class="dash-nav-icon" id="sidebar-theme-icon">🌙</span> Theme
            </button>
            <button class="dash-nav-item" id="sidebar-signout" style="color: var(--color-accent); margin-top: var(--space-md);">
              <span class="dash-nav-icon">🚪</span> Sign Out
            </button>
          </div>
        </nav>
      </aside>

      <!-- Main Content Area -->
      <main class="dash-main">
        <!-- Topbar -->
        <header class="dash-topbar">
          <div class="dash-topbar-left">
            <button class="dash-hamburger" id="dash-hamburger">
              <span></span><span></span><span></span>
            </button>
            <div>
              <h1 class="dash-page-title">Coach: ${getTabTitle(currentTab, 'coach')}</h1>
              <p class="dash-page-subtitle">Managing the Dragon Swim Team roster and sessions</p>
            </div>
          </div>
          <div class="dash-topbar-right">
            <div class="badge badge-primary" style="margin-right: 1rem;">Coach Mode</div>
            <div class="dash-user-menu" id="user-menu">
              <button class="dash-user-trigger" id="user-trigger">
                <div class="dash-avatar" style="background: var(--color-accent); color: white;">${(user.displayName || user.email || 'C').charAt(0).toUpperCase()}</div>
                <span class="dash-user-name">${user.displayName || user.email || 'Coach'}</span>
                <span class="dash-dropdown-arrow">▾</span>
              </button>
              <div class="dash-dropdown" id="user-dropdown" style="display: none;">
                <button class="dash-dropdown-item" id="menu-signout" style="color: var(--color-accent);">🚪 Sign Out</button>
              </div>
            </div>
          </div>
        </header>

        <!-- Dynamic Content -->
        <div class="dash-content">
          ${renderTabContent(currentTab, 'coach')}
        </div>
      </main>
    </div>
  `;

  bindEvents();
  initTheme();
  updateSidebarThemeIcon();
}

function getParentName() {
  if (!familyData || !familyData.parent) return null;
  const p = familyData.parent;
  return [p.firstName, p.lastName].filter(Boolean).join(' ') || null;
}

function getTabTitle(tab, role = 'swimmer') {
  if (role === 'coach') {
    const titles = {
      'overview': 'Coach Dashboard',
      'roster': 'Team Roster',
      'meets': 'Meet Management',
      'schedule': 'Season Schedule',
    };
    return titles[tab] || 'Coach Dashboard';
  }
  const titles = {
    'overview': 'Dashboard',
    'profile': 'Family Profile',
    'plans': 'Swim Plans',
    'meets': 'Swim Meets',
    'schedule': 'Practice Schedule',
  };
  return titles[tab] || 'Dashboard';
}

function getTabSubtitle(tab) {
  const subs = {
    'overview': 'Overview of your swim season at a glance',
    'profile': 'Manage your family information and swimmers',
    'plans': 'Track and manage your training plans',
    'meets': 'View registered and upcoming competitions',
    'schedule': 'Your weekly practice timetable',
  };
  return subs[tab] || '';
}

function renderTabContent(tab, role = 'swimmer') {
  if (role === 'coach') {
    switch (tab) {
      case 'overview': return renderCoachOverview();
      case 'roster': return renderCoachRoster();
      case 'meets': return renderSwimMeets(); // Reuse for now
      case 'schedule': return renderSchedule(); // Reuse for now
      default: return renderCoachOverview();
    }
  }
  switch (tab) {
    case 'overview': return renderOverview();
    case 'profile': return renderProfile();
    case 'plans': return renderSwimPlans();
    case 'meets': return renderSwimMeets();
    case 'schedule': return renderSchedule();
    default: return '';
  }
}

function updateSidebarThemeIcon() {
  const themeIcon = document.getElementById('sidebar-theme-icon');
  if (themeIcon) {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    themeIcon.textContent = isDark ? '☀️' : '🌙';
  }
}

// ── Coach Specific Tab Views ──
function renderCoachOverview() {
  return `
    <div class="dash-stats-row">
      <div class="dash-stat-card">
        <div class="dash-stat-number">${coachRoster.length}</div>
        <div class="dash-stat-label">Active Athletes</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">12</div>
        <div class="dash-stat-label">New Registrations</div>
      </div>
      <div class="dash-stat-card accent">
        <div class="dash-stat-number">4</div>
        <div class="dash-stat-label">Upcoming Meets</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">85%</div>
        <div class="dash-stat-label">Practice Attendance</div>
      </div>
    </div>

    <div class="dash-overview-grid">
      <div class="dash-panel">
        <h3 class="dash-panel-title">Top Athletes</h3>
        <div class="dash-panel-body">
          ${coachRoster.slice(0, 3).map(s => `
            <div class="dash-mini-card">
               <div class="dash-mini-top">
                <span class="dash-mini-name">${s.name}</span>
                <span class="badge badge-primary">${s.rank}</span>
              </div>
              <div class="dash-mini-meta">Group: ${s.group} · Age: ${s.age}</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="dash-panel">
        <h3 class="dash-panel-title">Recent Announcements</h3>
        <div class="dash-panel-body">
          <div class="dash-mini-card">
            <div class="dash-mini-top"><span class="dash-mini-name">Meet Registration Deadline</span></div>
            <div class="dash-mini-meta">Sent to 45 parents · 2 hours ago</div>
          </div>
          <div class="dash-mini-card">
            <div class="dash-mini-top"><span class="dash-mini-name">New Training Equipment</span></div>
            <div class="dash-mini-meta">Sent to all coaches · Yesterday</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderCoachRoster() {
  return `
    <div class="dash-panel">
      <div class="dash-panel-header" style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h3 class="dash-panel-title">Team Management</h3>
      </div>
      <div class="dash-panel-body">
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
              <th style="padding: 1rem;">Name</th>
              <th style="padding: 1rem;">Group</th>
              <th style="padding: 1rem;">Age</th>
              <th style="padding: 1rem;">Rank</th>
            </tr>
          </thead>
          <tbody>
            ${coachRoster.map(s => `
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 1rem; font-weight: 500;">${s.name}</td>
                <td style="padding: 1rem;"><span class="group-badge">${s.group}</span></td>
                <td style="padding: 1rem;">${s.age}</td>
                <td style="padding: 1rem;"><span class="status-badge status-registered">${s.rank}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ── Overview Tab ──
function renderOverview() {
  const activePlans = swimPlans.filter(p => p.status !== 'Completed').length;
  const completedPlans = swimPlans.filter(p => p.status === 'Completed').length;
  const upcomingMeets = swimMeets.filter(m => m.status !== 'Completed').length;

  return `
    <div class="dash-stats-row">
      <div class="dash-stat-card">
        <div class="dash-stat-number">${swimPlans.length}</div>
        <div class="dash-stat-label">Total Plans</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${activePlans}</div>
        <div class="dash-stat-label">Active Plans</div>
      </div>
      <div class="dash-stat-card accent">
        <div class="dash-stat-number">${completedPlans}</div>
        <div class="dash-stat-label">Completed</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${upcomingMeets}</div>
        <div class="dash-stat-label">Upcoming Meets</div>
      </div>
    </div>

    <div class="dash-overview-grid">
      <div class="dash-panel">
        <h3 class="dash-panel-title">Active Swim Plans</h3>
        <div class="dash-panel-body">
          ${swimPlans.filter(p => p.status !== 'Completed').map(p => miniPlanCard(p)).join('')}
        </div>
      </div>
      <div class="dash-panel">
        <h3 class="dash-panel-title">Upcoming Meets</h3>
        <div class="dash-panel-body">
          ${swimMeets.filter(m => m.status !== 'Completed').map(m => miniMeetCard(m)).join('')}
        </div>
      </div>
    </div>

    <div class="dash-panel">
      <h3 class="dash-panel-title">Today's Practice</h3>
      <div class="dash-panel-body">
        ${renderTodayPractice()}
      </div>
    </div>
  `;
}

function miniPlanCard(plan) {
  return `
    <div class="dash-mini-card">
      <div class="dash-mini-top">
        <span class="dash-mini-name">${plan.name}</span>
        <span class="priority-badge priority-${plan.priority.toLowerCase()}">${plan.priority}</span>
      </div>
      <div class="dash-progress-row">
        <div class="dash-progress-bar"><div class="dash-progress-fill" style="width: ${plan.progress}%"></div></div>
        <span class="dash-progress-pct">${plan.progress}%</span>
      </div>
    </div>
  `;
}

function miniMeetCard(meet) {
  const status = meet.status || 'Open';
  return `
    <div class="dash-mini-card">
      <div class="dash-mini-top">
        <span class="dash-mini-name">${meet.name || 'Untitled Meet'}</span>
        <span class="status-badge status-${status.toLowerCase().replace(' ', '-')}">${status}</span>
      </div>
      <div class="dash-mini-meta">${meet.date || ''} · ${meet.location || ''}</div>
    </div>
  `;
}

function renderTodayPractice() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = days[new Date().getDay()];
  const todayPractices = practiceSchedules.filter(s => s.day === today);

  if (todayPractices.length === 0) {
    return `<p class="dash-empty">No practices scheduled for today (${today}). Rest day! 🎉</p>`;
  }

  return todayPractices.map(s => `
    <div class="dash-mini-card">
      <div class="dash-mini-top">
        <span class="dash-mini-name">${s.focus}</span>
        <span class="group-badge">${s.group}</span>
      </div>
      <div class="dash-mini-meta">${s.time} · ${s.coach}</div>
    </div>
  `).join('');
}

// ── Profile Tab ──
function renderProfile() {
  if (!familyData) {
    return `<div class="dash-panel" style="text-align: center; padding: 3rem;">
      <p class="dash-empty">No family registration found.</p>
      <p style="margin-top: 1rem;"><a href="${import.meta.env.BASE_URL}registration.html" class="btn btn-primary">Complete Registration</a></p>
    </div>`;
  }

  const p = familyData.parent || {};
  const spouse = familyData.spouse;
  const swimmers = familyData.swimmers || [];
  const ec = familyData.emergencyContact || {};

  return `
    <div class="profile-grid">
      <!-- Left Column -->
      <div class="profile-col">
        <div class="dash-panel">
          <div class="dash-panel-header">
            <h3>Parent / Guardian</h3>
            <button class="btn btn-outline btn-sm" id="edit-contact-btn">Edit</button>
          </div>
          <div class="profile-fields">
            <div class="profile-field">
              <span class="profile-label">Name</span>
              <span class="profile-value">${[p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ') || '—'}</span>
            </div>
            <div class="profile-field">
              <span class="profile-label">Gender</span>
              <span class="profile-value">${p.gender || '—'}</span>
            </div>
            <div class="profile-field">
              <span class="profile-label">Email</span>
              <span class="profile-value">${p.email || '—'}</span>
            </div>
            <div class="profile-field">
              <span class="profile-label">Phone</span>
              <span class="profile-value profile-display" id="display-parent-phone">${p.phone || '—'}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-parent-phone" value="${p.phone || ''}" />
            </div>
            <div class="profile-field">
              <span class="profile-label">Address</span>
              <span class="profile-value profile-display" id="display-parent-address">${p.address || '—'}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-parent-address" value="${p.address || ''}" />
            </div>
          </div>
        </div>

        ${spouse ? `
        <div class="dash-panel">
          <h3>Spouse / Partner</h3>
          <div class="profile-fields">
            <div class="profile-field">
              <span class="profile-label">Name</span>
              <span class="profile-value">${[spouse.firstName, spouse.middleName, spouse.lastName].filter(Boolean).join(' ') || '—'}</span>
            </div>
            <div class="profile-field">
              <span class="profile-label">Gender</span>
              <span class="profile-value">${spouse.gender || '—'}</span>
            </div>
            <div class="profile-field">
              <span class="profile-label">Phone</span>
              <span class="profile-value profile-display" id="display-spouse-phone">${spouse.phone || '—'}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-spouse-phone" value="${spouse.phone || ''}" />
            </div>
            <div class="profile-field">
              <span class="profile-label">Email</span>
              <span class="profile-value profile-display" id="display-spouse-email">${spouse.email || '—'}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-spouse-email" value="${spouse.email || ''}" />
            </div>
          </div>
        </div>
        ` : ''}

        <div class="dash-panel">
          <h3>Emergency Contact</h3>
          <div class="profile-fields">
            <div class="profile-field">
              <span class="profile-label">Name</span>
              <span class="profile-value profile-display" id="display-emergency-name">${ec.name || '—'}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-emergency-name" value="${ec.name || ''}" />
            </div>
            <div class="profile-field">
              <span class="profile-label">Phone</span>
              <span class="profile-value profile-display" id="display-emergency-phone">${ec.phone || '—'}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-emergency-phone" value="${ec.phone || ''}" />
            </div>
          </div>
        </div>

        <div class="profile-edit-actions" id="edit-actions" style="display: none;">
          <button class="btn btn-primary btn-sm" id="save-contact-btn">Save</button>
          <button class="btn btn-outline btn-sm" id="cancel-contact-btn">Cancel</button>
        </div>
      </div>

      <!-- Right Column -->
      <div class="profile-col">
        <div class="dash-panel">
          <div class="dash-panel-header">
            <h3>Swimmers (${swimmers.length})</h3>
            <button class="btn btn-outline btn-sm" id="add-swimmer-toggle-btn">+ Add</button>
          </div>
          <div id="add-swimmer-form" style="display: none; margin-bottom: var(--space-md); padding: var(--space-md); border: 1px solid var(--border-color); border-radius: var(--radius-md);">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">First Name</label>
                <input class="form-input" id="new-swimmer-first" />
              </div>
              <div class="form-group">
                <label class="form-label">Last Name</label>
                <input class="form-input" id="new-swimmer-last" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Middle Name</label>
                <input class="form-input" id="new-swimmer-middle" />
              </div>
              <div class="form-group">
                <label class="form-label">Gender</label>
                <select class="form-select" id="new-swimmer-gender">
                  <option value="" disabled selected>Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Date of Birth</label>
                <input class="form-input" type="date" id="new-swimmer-dob" />
              </div>
              <div class="form-group">
                <label class="form-label">USA Swimming ID</label>
                <input class="form-input" id="new-swimmer-usaId" />
              </div>
            </div>
            <div style="display: flex; gap: var(--space-sm); margin-top: var(--space-md);">
              <button class="btn btn-primary btn-sm" id="save-swimmer-btn">Save Swimmer</button>
              <button class="btn btn-outline btn-sm" id="cancel-swimmer-btn">Cancel</button>
            </div>
          </div>
          ${swimmers.filter(s => !s.deleted).length === 0 ? '<p class="dash-empty">No swimmers registered.</p>' : swimmers.map((s, i) => s.deleted ? '' : `

            <div class="swimmer-profile-card">
              <div class="swimmer-profile-info">
                <strong>${[s.firstName, s.middleName, s.lastName].filter(Boolean).join(' ')}</strong>
                <div class="swimmer-profile-meta">
                  <span>${s.gender || '—'}</span>
                  <span>DOB: ${s.dob || '—'}</span>
                  ${s.usaSwimmingId ? `<span>USA ID: ${s.usaSwimmingId}</span>` : ''}
                  ${s.joinDate ? `<span>Joined: ${s.joinDate}</span>` : ''}
                </div>
              </div>
              <button class="btn btn-outline btn-sm delete-swimmer-btn" data-index="${i}" style="color: var(--color-accent); border-color: var(--color-accent);">Remove</button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ── Swim Plans Tab ──
function renderSwimPlans() {
  return `
    <div class="dash-cards-grid">
      ${swimPlans.map(p => `
        <div class="dash-card">
          <div class="dash-card-header">
            <h3 class="dash-card-title">${p.name}</h3>
            <div class="dash-card-badges">
              <span class="status-badge status-${p.status.toLowerCase().replace(' ', '-')}">${p.status}</span>
              <span class="priority-badge priority-${p.priority.toLowerCase()}">${p.priority}</span>
            </div>
          </div>
          <div class="dash-card-body">
            <div class="dash-card-row">
              <span class="dash-card-label">Progress</span>
              <span class="dash-card-value">${p.progress}%</span>
            </div>
            <div class="dash-progress-bar"><div class="dash-progress-fill" style="width: ${p.progress}%"></div></div>
            <div class="dash-card-meta">
              <span>📅 Season: ${p.season}</span>
              <span>Training: ${p.daysPerWeek} Days/Week</span>
            </div>
            <div class="dash-card-meta">
              <span>📋 ${p.tasks}</span>
              <span>Due: ${p.due}</span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ── Swim Meets Tab ──
function renderSwimMeets() {
  const isCoach = userRole === 'coach';

  return `
    <div class="dash-section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2 style="font-size: 1.5rem; font-weight: 600; color: var(--text-primary);">Upcoming Meets</h2>
      ${isCoach ? `<button class="btn btn-primary btn-sm" id="add-meet-btn">+ Add Meet</button>` : ''}
    </div>

    ${isCoach ? `
      <div id="add-meet-form" class="dash-panel" style="display: none; margin-bottom: 2rem; padding: 1.5rem;">
        <h3 style="margin-bottom: 1rem;">New Swim Meet</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
          <input type="text" id="meet-name" placeholder="Meet Name" class="form-input">
          <input type="date" id="meet-date" class="form-input">
          <input type="text" id="meet-location" placeholder="Location" class="form-input">
          <input type="text" id="meet-events" placeholder="Events (comma separated)" class="form-input">
        </div>
        <div style="margin-top: 1rem; display: flex; gap: 1rem;">
          <button class="btn btn-primary btn-sm" id="save-meet-btn">Save Meet</button>
          <button class="btn btn-outline btn-sm" id="cancel-meet-btn">Cancel</button>
        </div>
      </div>
    ` : ''}

    <div class="dash-cards-grid">
      ${swimMeets.length === 0 ? `<p class="dash-empty">No meets scheduled yet.</p>` :
      swimMeets.map(m => `
        <div class="dash-card">
          <div class="dash-card-header">
            <h3 class="dash-card-title">${m.name}</h3>
            <span class="status-badge status-${(m.status || 'Open').toLowerCase().replace(' ', '-')}">${m.status || 'Open'}</span>
          </div>
          <div class="dash-card-body">
            <div class="dash-card-meta">
              <span>📅 ${m.date}</span>
              <span>📍 ${m.location}</span>
            </div>
            <div class="dash-card-events">
              <span class="dash-card-label">Events</span>
              <div class="dash-event-tags">
                ${(m.events || []).map(e => `<span class="event-tag">${e}</span>`).join('')}
              </div>
            </div>
            <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
              ${!isCoach && m.status === 'Open' ? `<button class="btn btn-primary btn-sm dash-register-btn">Register</button>` : ''}
              ${isCoach ? `<button class="btn btn-outline btn-sm delete-meet" data-id="${m.id}" style="color: var(--color-accent); border-color: var(--color-accent);">Delete</button>` : ''}
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ── Schedule Tab ──
function renderSchedule() {
  const isCoach = userRole === 'coach';
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return `
    <div class="dash-section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2 style="font-size: 1.5rem; font-weight: 600; color: var(--text-primary);">Weekly Schedule</h2>
      ${isCoach ? `<button class="btn btn-primary btn-sm" id="add-session-btn">+ Add Session</button>` : ''}
    </div>

    ${isCoach ? `
      <div id="add-session-form" class="dash-panel" style="display: none; margin-bottom: 2rem; padding: 1.5rem;">
        <h3 style="margin-bottom: 1rem;">New Practice Session</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem;">
          <select id="session-day" class="form-input">
            ${days.map(d => `<option value="${d}">${d}</option>`).join('')}
          </select>
          <input type="text" id="session-time" placeholder="Time (e.g. 5:00 AM)" class="form-input">
          <input type="text" id="session-group" placeholder="Group" class="form-input">
          <input type="text" id="session-focus" placeholder="Focus" class="form-input">
          <input type="text" id="session-coach" placeholder="Coach" class="form-input">
        </div>
        <div style="margin-top: 1rem; display: flex; gap: 1rem;">
          <button class="btn btn-primary btn-sm" id="save-session-btn">Save Session</button>
          <button class="btn btn-outline btn-sm" id="cancel-session-btn">Cancel</button>
        </div>
      </div>
    ` : ''}

    <div class="dash-schedule-grid">
      ${days.map(day => {
    const sessions = practiceSchedules.filter(s => s.day === day);
    return `
          <div class="dash-schedule-day">
            <h3 class="dash-schedule-day-name">${day}</h3>
            ${sessions.length === 0
        ? `<p class="dash-empty-sm">No practice</p>`
        : sessions.map(s => `
                <div class="dash-schedule-item">
                  <div class="dash-schedule-time">${s.time}</div>
                  <div class="dash-schedule-focus">${s.focus}</div>
                  <div class="dash-schedule-meta" style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <span class="group-badge">${s.group}</span>
                      <span>${s.coach}</span>
                    </div>
                    ${isCoach ? `<button class="delete-session" data-id="${s.id}" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--color-accent); padding: 0 5px;">&times;</button>` : ''}
                  </div>
                </div>
              `).join('')}
          </div>
        `;
  }).join('')}
    </div>
  `;
}

// ── Events ──
function showDeleteConfirm(swimmerName, swimmerIndex) {
  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.innerHTML = `
    <div class="confirm-modal">
      <h3 class="confirm-title">Remove Swimmer</h3>
      <p class="confirm-body">You are about to remove <strong style="color: var(--color-accent, #dc3545);">${swimmerName}</strong> from your family registration.</p>
      <p class="confirm-warning">This swimmer will be marked as inactive. Contact a coach if you need to restore this record.</p>
      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="confirm-cancel">Cancel</button>
        <button class="btn btn-sm" id="confirm-delete" style="background: var(--color-accent, #dc3545); color: white; border: none;">Delete</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('#confirm-cancel').addEventListener('click', () => overlay.remove());

  overlay.querySelector('#confirm-delete').addEventListener('click', async () => {
    overlay.remove();
    const swimmers = [...familyData.swimmers];
    swimmers[swimmerIndex] = { ...swimmers[swimmerIndex], deleted: true, deletedAt: new Date().toISOString() };
    try {
      await updateDoc(doc(db, "registrations", familyDataId), { swimmers });
      familyData.swimmers = swimmers;
      currentTab = 'profile';
      refreshUI();
    } catch (err) {
      console.error("Error marking swimmer deleted:", err);
      alert("Failed. Please try again.");
    }
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
}

function bindEvents() {
  // Sidebar nav
  document.querySelectorAll('.dash-nav-item[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentTab = btn.dataset.tab;
      refreshUI();
    });
  });

  // Theme toggle
  document.getElementById('dash-theme-toggle')?.addEventListener('click', () => {
    toggleTheme();
    refreshUI();
  });

  // Mobile sidebar toggle
  const hamburger = document.getElementById('dash-hamburger');
  const sidebar = document.getElementById('dash-sidebar');
  hamburger?.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  // Register buttons
  document.querySelectorAll('.dash-register-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.href = import.meta.env.BASE_URL + 'registration.html';
    });
  });

  // Sign out button
  document.getElementById('sidebar-signout')?.addEventListener('click', async () => {
    try {
      await signOut(auth);
      window.location.href = import.meta.env.BASE_URL + 'signin.html';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  });

  // ── User Dropdown ──
  const userTrigger = document.getElementById('user-trigger');
  const userDropdown = document.getElementById('user-dropdown');

  userTrigger?.addEventListener('click', (e) => {
    e.stopPropagation();
    userDropdown.style.display = userDropdown.style.display === 'none' ? 'block' : 'none';
  });

  document.addEventListener('click', () => {
    if (userDropdown) userDropdown.style.display = 'none';
  });

  // Profile menu item
  document.getElementById('menu-profile')?.addEventListener('click', () => {
    currentTab = 'profile';
    userDropdown.style.display = 'none';
    refreshUI();
  });

  // Signout menu item
  document.getElementById('menu-signout')?.addEventListener('click', async () => {
    try {
      await signOut(auth);
      window.location.href = import.meta.env.BASE_URL + 'signin.html';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  });

  // ── Profile Edit ──
  document.getElementById('edit-contact-btn')?.addEventListener('click', () => {
    document.querySelectorAll('.profile-display').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.profile-edit-field').forEach(el => el.style.display = 'block');
    document.getElementById('edit-actions').style.display = 'flex';
    document.getElementById('edit-contact-btn').style.display = 'none';
  });

  document.getElementById('cancel-contact-btn')?.addEventListener('click', () => {
    document.querySelectorAll('.profile-display').forEach(el => el.style.display = '');
    document.querySelectorAll('.profile-edit-field').forEach(el => el.style.display = 'none');
    document.getElementById('edit-actions').style.display = 'none';
    document.getElementById('edit-contact-btn').style.display = '';
  });

  document.getElementById('save-contact-btn')?.addEventListener('click', async () => {
    const updateData = {
      "parent.phone": document.getElementById('edit-parent-phone')?.value.trim() || '',
      "parent.address": document.getElementById('edit-parent-address')?.value.trim() || '',
    };

    if (familyData.spouse) {
      updateData["spouse.phone"] = document.getElementById('edit-spouse-phone')?.value.trim() || '';
      updateData["spouse.email"] = document.getElementById('edit-spouse-email')?.value.trim() || '';
    }

    updateData["emergencyContact.name"] = document.getElementById('edit-emergency-name')?.value.trim() || '';
    updateData["emergencyContact.phone"] = document.getElementById('edit-emergency-phone')?.value.trim() || '';

    try {
      await updateDoc(doc(db, "registrations", familyDataId), updateData);
      familyData.parent.phone = updateData["parent.phone"];
      familyData.parent.address = updateData["parent.address"];
      if (familyData.spouse) {
        familyData.spouse.phone = updateData["spouse.phone"];
        familyData.spouse.email = updateData["spouse.email"];
      }
      familyData.emergencyContact.name = updateData["emergencyContact.name"];
      familyData.emergencyContact.phone = updateData["emergencyContact.phone"];
      currentTab = 'profile';
      refreshUI();
    } catch (err) {
      console.error("Error updating contact:", err);
      alert("Failed to save. Please try again.");
    }
  });

  // ── Add Swimmer ──
  document.getElementById('add-swimmer-toggle-btn')?.addEventListener('click', () => {
    document.getElementById('add-swimmer-form').style.display = 'block';
    document.getElementById('add-swimmer-toggle-btn').style.display = 'none';
  });

  document.getElementById('cancel-swimmer-btn')?.addEventListener('click', () => {
    document.getElementById('add-swimmer-form').style.display = 'none';
    document.getElementById('add-swimmer-toggle-btn').style.display = '';
  });

  document.getElementById('save-swimmer-btn')?.addEventListener('click', async () => {
    const firstName = document.getElementById('new-swimmer-first').value.trim();
    const lastName = document.getElementById('new-swimmer-last').value.trim();
    if (!firstName || !lastName) {
      alert('First name and last name are required.');
      return;
    }
    const newSwimmer = {
      firstName,
      lastName,
      middleName: document.getElementById('new-swimmer-middle').value.trim() || null,
      gender: document.getElementById('new-swimmer-gender').value || null,
      dob: document.getElementById('new-swimmer-dob').value || null,
      usaSwimmingId: document.getElementById('new-swimmer-usaId').value.trim() || null,
      joinDate: null,
    };
    const newSwimmers = [...familyData.swimmers, newSwimmer];
    try {
      await updateDoc(doc(db, "registrations", familyDataId), { swimmers: newSwimmers });
      familyData.swimmers = newSwimmers;
      currentTab = 'profile';
      refreshUI();
    } catch (err) {
      console.error("Error adding swimmer:", err);
      alert("Failed to add swimmer. Please try again.");
    }
  });

  // ── Delete Swimmer ──
  document.querySelectorAll('.delete-swimmer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      const swimmer = familyData.swimmers[idx];
      const name = [swimmer.firstName, swimmer.lastName].filter(Boolean).join(' ');
      showDeleteConfirm(name, idx);
    });
  });

  // ── Coach Management Events ──
  if (userRole === 'coach') {
    // Meet Management
    document.getElementById('add-meet-btn')?.addEventListener('click', () => {
      document.getElementById('add-meet-form').style.display = 'block';
    });
    document.getElementById('cancel-meet-btn')?.addEventListener('click', () => {
      document.getElementById('add-meet-form').style.display = 'none';
    });
    document.getElementById('save-meet-btn')?.addEventListener('click', async () => {
      const name = document.getElementById('meet-name').value;
      const date = document.getElementById('meet-date').value;
      const location = document.getElementById('meet-location').value;
      const eventsStr = document.getElementById('meet-events').value;

      if (!name || !date) {
        alert('Please provide at least a name and date.');
        return;
      }

      try {
        await addDoc(collection(db, "meets"), {
          name,
          date,
          location,
          events: eventsStr.split(',').map(e => e.trim()),
          status: 'Open',
          createdAt: new Date()
        });
        document.getElementById('add-meet-form').style.display = 'none';
      } catch (err) {
        console.error("Error adding meet:", err);
      }
    });

    document.querySelectorAll('.delete-meet').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this meet?')) {
          try {
            await deleteDoc(doc(db, "meets", btn.dataset.id));
          } catch (err) {
            console.error("Error deleting meet:", err);
          }
        }
      });
    });

    // Session Management
    document.getElementById('add-session-btn')?.addEventListener('click', () => {
      document.getElementById('add-session-form').style.display = 'block';
    });
    document.getElementById('cancel-session-btn')?.addEventListener('click', () => {
      document.getElementById('add-session-form').style.display = 'none';
    });
    document.getElementById('save-session-btn')?.addEventListener('click', async () => {
      const day = document.getElementById('session-day').value;
      const time = document.getElementById('session-time').value;
      const group = document.getElementById('session-group').value;
      const focus = document.getElementById('session-focus').value;
      const coach = document.getElementById('session-coach').value;

      if (!time || !group) {
        alert('Please provide time and group.');
        return;
      }

      try {
        await addDoc(collection(db, "schedules"), {
          day,
          time,
          group,
          focus,
          coach,
          createdAt: new Date()
        });
        document.getElementById('add-session-form').style.display = 'none';
      } catch (err) {
        console.error("Error adding session:", err);
      }
    });

    document.querySelectorAll('.delete-session').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this session?')) {
          try {
            await deleteDoc(doc(db, "schedules", btn.dataset.id));
          } catch (err) {
            console.error("Error deleting session:", err);
          }
        }
      });
    });
  }
}

// Initial render
initApp();
