/**
 * Dashboard Page — Dragon Swim Team
 * TaskFlow-inspired dashboard with sidebar + cards for swim plans, meets, schedules
 */

import '../styles/reset.css';
import '../styles/variables.css';
import '../styles/global.css';
import './dashboard.css';

import { initTheme, toggleTheme } from '../components/theme-toggle.js';
import { getTimeStandardLevels, ageGroupForAge } from '../data/timeStandards.js';
import { t } from '../utils/i18n.js';
import { auth, db, doc, setDoc, getDoc, updateDoc, collection, addDoc, deleteDoc, onSnapshot, query, where, orderBy, onAuthStateChanged, signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider, writeBatch, getDocs } from '../utils/firebase.js';
import * as XLSX from 'xlsx';
window.XLSX = XLSX;

initTheme();

// ── Sample Data ──
const swimPlans = [
  { id: 1, name: 'Endurance Base Building', season: 'Winter 2026', daysPerWeek: 4, priority: 'High', progress: 72, tasks: '18 / 25 workouts completed', due: 'Feb 28, 2026', status: 'In Progress' },
  { id: 2, name: 'Sprint Technique Focus', season: 'Spring 2026', daysPerWeek: 3, priority: 'Medium', progress: 45, tasks: '9 / 20 workouts completed', due: 'Mar 15, 2026', status: 'In Progress' },
  { id: 3, name: 'Stroke Refinement (Butterfly)', season: 'Summer 2026', daysPerWeek: 5, priority: 'Low', progress: 0, tasks: '0 / 12 workouts completed', due: 'Apr 30, 2026', status: 'Not Started' },
  { id: 4, name: 'Fall Conditioning', season: 'Fall 2025', daysPerWeek: 3, priority: 'High', progress: 100, tasks: '30 / 30 workouts completed', due: 'Nov 20, 2025', status: 'Completed' },
];

// ── State Storage ──
let swimMeets = [];
let editingMeetId = null;
let practiceSchedules = [];
let editingSessionId = null;
let currentUser = null;
let userRole = 'swimmer';
let dbRole = null;
let familyData = null;
let familyDataId = null;
let allRegistrations = [];
let deposits = [];
let currentSeason = getDefaultSeason();

const coachRoster = [
  { id: 101, name: 'Alice Thompson', group: 'Competitive', age: 14, rank: 'Regional' },
  { id: 102, name: 'Bob Wilson', group: 'Intermediate', age: 12, rank: 'Novice' },
  { id: 103, name: 'Charlie Brown', group: 'Competitive', age: 15, rank: 'State' },
  { id: 104, name: 'Daisy Miller', group: 'Beginner', age: 10, rank: 'Novice' },
  { id: 105, name: 'Ethan Hunt', group: 'Competitive', age: 16, rank: 'National' },
];

// App State
let currentTab = 'overview';
let isInitialized = false;

function initApp() {
  const app = document.getElementById('app');

  // Show loading state immediately
  app.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; gap: 20px; font-family: sans-serif;">
      <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #f5c518; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <p style="color: #666;">${t('dash_loading')}</p>
      <style>
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    </div>
  `;

  console.log("Dashboard: Initializing auth listener...");

  let hasRendered = false;
  const timeoutFallback = setTimeout(() => {
    if (!hasRendered) {
      console.warn("Dashboard: Auth listener timed out — redirecting to signin");
      window.location.href = import.meta.env.BASE_URL + 'signin.html';
    }
  }, 5000);

  onAuthStateChanged(auth, async (user) => {
    clearTimeout(timeoutFallback);
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

      dbRole = userDoc.exists() ? userDoc.data().role : null;
      const isCoachEmail = user.email && user.email.toLowerCase() === 'dragonswim@outlook.com';
      userRole = (dbRole === 'coach' || dbRole === 'admin' || isCoachEmail) ? 'coach' : (dbRole || 'swimmer');
      console.log("Dashboard: Detected role:", userRole);

      if (!isInitialized) {
        console.log("Dashboard: Initializing data listeners...");
        initDataListeners();
        if (userRole === 'coach') {
          loadSwimApiCredentials().then(() => {
            console.log('Dashboard: Swim API credentials loaded:', !!swimApiCredentials);
          });
        }
        isInitialized = true;
        refreshUI();
      } else {
        console.log("Dashboard: Refreshing UI...");
        refreshUI();
      }
    } catch (error) {
      console.error("Dashboard Critical Error:", error);

      app.innerHTML = `
        <div style="padding: 40px; text-align: center; font-family: sans-serif; max-width: 500px; margin: 100px auto; border: 1px solid #fee2e2; background: #fef2f2; border-radius: 12px; color: #991b1b;">
          <h2 style="margin-bottom: 16px;">${t('dash_load_failed_title')}</h2>
          <p style="margin-bottom: 24px;">${t('dash_load_failed_msg')}</p>
          <code style="display: block; padding: 12px; background: #fee2e2; border-radius: 6px; font-size: 13px; text-align: left; overflow-x: auto; margin-bottom: 24px;">
            ${error.message || t('dash_unknown_error')}
          </code>
          <button onclick="window.location.reload()" style="padding: 10px 20px; background: #991b1b; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">${t('dash_load_failed_retry')}</button>
        </div>
      `;

      userRole = 'swimmer';
    }
  });
}

function initDataListeners() {
  const qMeets = query(collection(db, "meets"), orderBy("createdAt", "desc"));
  onSnapshot(qMeets, (snapshot) => {
    swimMeets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    refreshUI();
  }, (error) => {
    console.error("Error listening to meets:", error);
  });

  const qSchedules = query(collection(db, "schedules"), orderBy("createdAt", "asc"));
  onSnapshot(qSchedules, (snapshot) => {
    practiceSchedules = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    refreshUI();
  }, (error) => {
    console.error("Error listening to schedules:", error);
  });

  if (userRole === 'coach') {
    const qRegistrations = query(collection(db, "registrations"), orderBy("createdAt", "desc"));
    onSnapshot(qRegistrations, (snapshot) => {
      allRegistrations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      refreshUI();
    }, (error) => {
      console.error("Error listening to registrations:", error);
    });

    const qDeposits = query(collection(db, "deposits"), orderBy("swimmerName", "asc"));
    onSnapshot(qDeposits, (snapshot) => {
      deposits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      refreshUI();
    }, (error) => {
      console.error("Error listening to deposits:", error);
    });
  }
}

async function fetchFamilyData() {
  if (!currentUser) return;

  // Primary: lookup by own UID
  const ref = doc(db, 'registrations', currentUser.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    familyDataId = snap.id;
    familyData = snap.data();
    console.log('fetchFamilyData: found own registration', snap.id);
    return;
  }

  // Fallback: spouse access — search by email in parentEmails
  if (currentUser.email) {
    const searchEmail = currentUser.email.toLowerCase().trim();
    console.log('fetchFamilyData: looking for spouse access with email:', searchEmail);
    try {
      const q = query(
        collection(db, 'registrations'),
        where('parentEmails', 'array-contains', searchEmail)
      );
      const qSnap = await getDocs(q);
      console.log('fetchFamilyData: spouse query returned', qSnap.size, 'docs');
      if (!qSnap.empty) {
        const regDoc = qSnap.docs[0];
        familyDataId = regDoc.id;
        familyData = regDoc.data();
        console.log('fetchFamilyData: found via spouse access', familyDataId, 'parentEmails:', familyData.parentEmails);

        // Auto-add current user as editor for future access
        const editors = familyData.editors || [];
        if (!editors.includes(currentUser.uid)) {
          editors.push(currentUser.uid);
          await updateDoc(doc(db, 'registrations', familyDataId), { editors }).catch((e) => {
            console.error('fetchFamilyData: failed to add editor:', e);
          });
          familyData.editors = editors;
        }
        return;
      }
      console.warn('fetchFamilyData: no registration found for spouse email', searchEmail);
    } catch (err) {
      console.error('fetchFamilyData: spouse query failed:', err);
    }
  } else {
    console.warn('fetchFamilyData: currentUser.email is empty');
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

// ── Helper: Day names ──
const DAY_KEYS = ['dash_day_sunday', 'dash_day_monday', 'dash_day_tuesday', 'dash_day_wednesday', 'dash_day_thursday', 'dash_day_friday', 'dash_day_saturday'];

function getDayName(index) {
  return t(DAY_KEYS[index] || 'dash_day_monday');
}

// ── Swimmer Dashboard ──
function renderDashboard(user) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="dash-layout">
      <aside class="dash-sidebar" id="dash-sidebar">
        <div class="dash-sidebar-header">
          <a href="${import.meta.env.BASE_URL}" class="dash-logo">
            <img src="${import.meta.env.BASE_URL}logo-light.jpg" alt="Dragon Swim Team" class="dash-logo-img light-logo" />
            <img src="${import.meta.env.BASE_URL}logo-dark.png" alt="Dragon Swim Team" class="dash-logo-img dark-logo" />
          </a>
        </div>
        <nav class="dash-nav">
          <div class="dash-nav-section">
            <span class="dash-nav-label">${t('dash_sidebar_menu')}</span>
            <button class="dash-nav-item ${currentTab === 'overview' ? 'active' : ''}" data-tab="overview">
              <span class="dash-nav-icon">📊</span> ${t('dash_swimmer_overview_label')}
            </button>
            <button class="dash-nav-item ${currentTab === 'profile' ? 'active' : ''}" data-tab="profile">
              <span class="dash-nav-icon">👤</span> ${t('dash_swimmer_profile_label')}
            </button>
            <button class="dash-nav-item ${currentTab === 'plans' ? 'active' : ''}" data-tab="plans">
              <span class="dash-nav-icon">📋</span> ${t('dash_swimmer_plans_label')}
            </button>
            <button class="dash-nav-item ${currentTab === 'meets' ? 'active' : ''}" data-tab="meets">
              <span class="dash-nav-icon">🏆</span> ${t('dash_swimmer_meets_label')}
            </button>
            <button class="dash-nav-item ${currentTab === 'results' ? 'active' : ''}" data-tab="results">
              <span class="dash-nav-icon">🏊</span> ${t('dash_swimmer_results_label')}
            </button>
            <button class="dash-nav-item ${currentTab === 'schedule' ? 'active' : ''}" data-tab="schedule">
              <span class="dash-nav-icon">📅</span> ${t('dash_swimmer_schedule_label')}
            </button>
          </div>
          <div class="dash-nav-section" style="margin-top: auto;">
            <span class="dash-nav-label">${t('dash_sidebar_system')}</span>
            ${dbRole === 'admin' ? `
            <a href="${import.meta.env.BASE_URL}admin.html" class="dash-nav-item" style="text-decoration: none;">
              <span class="dash-nav-icon">⚙️</span> ${t('dash_sidebar_admin')}
            </a>
            ` : ''}
            <button class="dash-nav-item" id="dash-theme-toggle">
              <span class="dash-nav-icon" id="sidebar-theme-icon">🌙</span> ${t('dash_sidebar_theme')}
            </button>
            <button class="dash-nav-item" id="sidebar-signout" style="color: var(--color-accent); margin-top: var(--space-md);">
              <span class="dash-nav-icon">🚪</span> ${t('dash_sidebar_signout')}
            </button>
          </div>
        </nav>
      </aside>

      <main class="dash-main">
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
                <div class="dash-avatar">${(getParentName() || user.email || t('dash_swimmer_username_fallback')).charAt(0).toUpperCase()}</div>
                <span class="dash-user-name">${getParentName() || user.email || t('dash_swimmer_username_fallback')}</span>
                <span class="dash-dropdown-arrow">▾</span>
              </button>
              <div class="dash-dropdown" id="user-dropdown" style="display: none;">
                <button class="dash-dropdown-item" id="menu-profile">${t('dash_user_menu_profile')}</button>
                ${dbRole === 'admin' ? `<button class="dash-dropdown-item" id="menu-admin">${t('dash_user_menu_admin')}</button>` : ''}
                ${currentUser && currentUser.providerData && currentUser.providerData[0].providerId === 'password' ? `<button class="dash-dropdown-item" id="menu-password">🔑 ${t('dash_profile_password_btn')}</button>` : ''}
                <button class="dash-dropdown-item" id="menu-signout" style="color: var(--color-accent);">${t('dash_user_menu_signout')}</button>
              </div>
            </div>
          </div>
        </header>

        <div class="dash-content">
          ${renderTabContent(currentTab, 'swimmer')}
        </div>
      </main>
    </div>
  `;

  bindEvents();
  initTheme();
  updateSidebarThemeIcon();

  // Results tab:innerHTML 已就位,此时加载默认孩子成绩
  // (refreshUI 是异步的,导航点击处立即调用会因 DOM 未渲染而空跑)
  if (currentTab === 'results') initFamilyResults();
}

// ── Coach Dashboard ──
function renderCoachDashboard(user) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="dash-layout">
      <aside class="dash-sidebar" id="dash-sidebar">
        <div class="dash-sidebar-header">
          <a href="${import.meta.env.BASE_URL}" class="dash-logo">
            <img src="${import.meta.env.BASE_URL}logo-light.jpg" alt="Dragon Swim Team" class="dash-logo-img light-logo" />
            <img src="${import.meta.env.BASE_URL}logo-dark.png" alt="Dragon Swim Team" class="dash-logo-img dark-logo" />
          </a>
        </div>
        <nav class="dash-nav">
          <div class="dash-nav-section">
            <span class="dash-nav-label">${t('dash_coach_menu')}</span>
            <button class="dash-nav-item ${currentTab === 'overview' ? 'active' : ''}" data-tab="overview">
              <span class="dash-nav-icon">🏠</span> ${t('dash_coach_overview_label')}
            </button>
            <button class="dash-nav-item ${currentTab === 'roster' ? 'active' : ''}" data-tab="roster">
              <span class="dash-nav-icon">👥</span> ${t('dash_coach_roster_label')}
            </button>
            <button class="dash-nav-item ${currentTab === 'meets' ? 'active' : ''}" data-tab="meets">
              <span class="dash-nav-icon">🏁</span> ${t('dash_coach_meets_label')}
            </button>
            <button class="dash-nav-item ${currentTab === 'schedule' ? 'active' : ''}" data-tab="schedule">
              <span class="dash-nav-icon">⏱️</span> ${t('dash_coach_schedule_label')}
            </button>
            <button class="dash-nav-item ${currentTab === 'results' ? 'active' : ''}" data-tab="results">
              <span class="dash-nav-icon">🏊</span> Swim Times
            </button>
            ${dbRole === 'admin' ? `
            <button class="dash-nav-item ${currentTab === 'feesummary' ? 'active' : ''}" data-tab="feesummary">
              <span class="dash-nav-icon">💰</span> ${t('dash_coach_fee_summary_label')}
            </button>
            <button class="dash-nav-item ${currentTab === 'deposits' ? 'active' : ''}" data-tab="deposits">
              <span class="dash-nav-icon">🏦</span> ${t('dash_coach_deposits_label')}
            </button>
            ` : ''}
          </div>
          <div class="dash-nav-section" style="margin-top: auto;">
            <span class="dash-nav-label">${t('dash_sidebar_system')}</span>
            ${dbRole === 'admin' ? `
            <a href="${import.meta.env.BASE_URL}admin.html" class="dash-nav-item" style="text-decoration: none;">
              <span class="dash-nav-icon">⚙️</span> ${t('dash_sidebar_admin')}
            </a>
            ` : ''}
            <button class="dash-nav-item" id="dash-theme-toggle">
              <span class="dash-nav-icon" id="sidebar-theme-icon">🌙</span> ${t('dash_sidebar_theme')}
            </button>
            <button class="dash-nav-item" id="sidebar-signout" style="color: var(--color-accent); margin-top: var(--space-md);">
              <span class="dash-nav-icon">🚪</span> ${t('dash_sidebar_signout')}
            </button>
          </div>
        </nav>
      </aside>

      <main class="dash-main">
        <header class="dash-topbar">
          <div class="dash-topbar-left">
            <button class="dash-hamburger" id="dash-hamburger">
              <span></span><span></span><span></span>
            </button>
            <div>
              <h1 class="dash-page-title">Coach: ${getTabTitle(currentTab, 'coach')}</h1>
              <p class="dash-page-subtitle">${t('dash_coach_topbar_sub')}</p>
            </div>
          </div>
          <div class="dash-topbar-right">
            <div class="badge badge-primary" style="margin-right: 1rem;">${t('dash_coach_badge')}</div>
            <div class="dash-user-menu" id="user-menu">
              <button class="dash-user-trigger" id="user-trigger">
                <div class="dash-avatar" style="background: var(--color-accent); color: white;">${(user.displayName || user.email || t('dash_coach_username_fallback')).charAt(0).toUpperCase()}</div>
                <span class="dash-user-name">${user.displayName || user.email || t('dash_coach_username_fallback')}</span>
                <span class="dash-dropdown-arrow">▾</span>
              </button>
              <div class="dash-dropdown" id="user-dropdown" style="display: none;">
                ${dbRole === 'admin' ? `<button class="dash-dropdown-item" id="menu-admin">${t('dash_user_menu_admin')}</button>` : ''}
                ${currentUser && currentUser.providerData && currentUser.providerData[0].providerId === 'password' ? `<button class="dash-dropdown-item" id="menu-password">🔑 ${t('dash_profile_password_btn')}</button>` : ''}
                <button class="dash-dropdown-item" id="menu-signout" style="color: var(--color-accent);">${t('dash_user_menu_signout')}</button>
              </div>
            </div>
          </div>
        </header>

        <div class="dash-content">
          ${renderTabContent(currentTab, 'coach')}
        </div>
      </main>
    </div>
  `;

  // Results tab:innerHTML 已就位,此时读回持久化状态才不会找不到 cell
  // (refreshUI 是异步的,导航点击处立即调用会因 DOM 未渲染而空跑 → 状态列恒 "—")
  if (currentTab === 'results') loadAthleteDataStatus();

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
      'overview': t('dash_coach_tab_overview'),
      'roster': t('dash_coach_tab_roster'),
      'meets': t('dash_coach_tab_meets'),
      'schedule': t('dash_coach_tab_schedule'),
      'results': 'Swim Times',
      'feesummary': t('dash_coach_tab_fee_summary'),
      'deposits': t('dash_coach_tab_deposits'),
    };
    return titles[tab] || t('dash_coach_tab_overview');
  }
  const titles = {
    'overview': t('dash_swimmer_tab_overview'),
    'profile': t('dash_swimmer_tab_profile'),
    'plans': t('dash_swimmer_tab_plans'),
    'meets': t('dash_swimmer_tab_meets'),
    'results': t('dash_swimmer_tab_results'),
    'schedule': t('dash_swimmer_tab_schedule'),
  };
  return titles[tab] || t('dash_swimmer_tab_overview');
}

function getTabSubtitle(tab) {
  const subs = {
    'overview': t('dash_swimmer_overview_sub'),
    'profile': t('dash_swimmer_profile_sub'),
    'plans': t('dash_swimmer_plans_sub'),
    'meets': t('dash_swimmer_meets_sub'),
    'results': t('dash_swimmer_results_sub'),
    'schedule': t('dash_swimmer_schedule_sub'),
  };
  return subs[tab] || '';
}

function renderTabContent(tab, role = 'swimmer') {
  if (role === 'coach') {
    switch (tab) {
      case 'overview': return renderCoachOverview();
      case 'roster': return renderCoachRoster();
      case 'meets': return renderSwimMeets();
      case 'schedule': return renderSchedule();
      case 'results': return renderCoachResults();
      case 'feesummary': return renderFeeSummary();
      case 'deposits': return renderDeposits();
      default: return renderCoachOverview();
    }
  }
  switch (tab) {
    case 'overview': return renderOverview();
    case 'profile': return renderProfile();
    case 'plans': return renderSwimPlans();
    case 'meets': return renderSwimMeets();
    case 'results': return renderFamilyResults();
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
function getCoachActiveSwimmers() {
  const swimmers = [];
  for (const reg of allRegistrations) {
    if (reg.swimmers) {
      for (let i = 0; i < reg.swimmers.length; i++) {
        const s = reg.swimmers[i];
        if (!s.deleted) swimmers.push({ ...s, parentName: getParentNameFromReg(reg), _regId: reg.id, _swimmerIndex: i });
      }
    }
  }
  return swimmers;
}

function getParentNameFromReg(reg) {
  if (!reg.parent) return '—';
  return [reg.parent.firstName, reg.parent.lastName].filter(Boolean).join(' ') || '—';
}

function getCoachRecentRegistrations() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return allRegistrations.filter(r => {
    const created = r.createdAt?.toDate?.() || new Date(r.createdAt);
    return created >= thirtyDaysAgo;
  });
}

// ══════════════════════════════════════════════
// Swim Times Management — Phase 1
// ══════════════════════════════════════════════

// Use Vite proxy in dev to avoid CORS preflight; in production the
// site is served from the same origin as the Firebase project and
// browsers may handle CORS differently. If production CORS issues
// arise, a Cloud Function proxy or similar will be needed.
// dev:走 Vite proxy(本地免 CORS);生产:直连 times-api
// (2026-08-01 验证:Access-Control-Allow-Origin: * 且允许 appname/
// device-id/usas-session-id/usas-sub-id 自定义头,无需代理)
const USAS_BASE = import.meta.env.DEV
  ? '/usas-api/swims/TimesSearch'
  : 'https://times-api.usaswimming.org/swims/TimesSearch';
let swimApiCredentials = null;  // { deviceId, subId, sessionId } — cached from Firestore
let swimResultsFetching = false;

// ── Rate limiting & retry policy ──
// 2026-08 加:上次批量抓取(300/500ms 间隔,~120 请求/2min)触发账号级限流
// (GetSwimmerMeetTimes 全量 406,连 Data Hub 网页都短暂受限)。此后节奏刻意保守,
// 模拟真人浏览速度,把请求窗口打散。参数集中在此,后续按观察再调。
const MOCK_MODE = import.meta.env.DEV && new URLSearchParams(location.search).has('mock');
const FETCH_POLICY = {
  meetGapMs: 5000,                     // 每场 meet 之间的间隔
  batchSize: 10,                       // 每抓完 N 场休息一次(成功+失败都算请求)
  batchPauseMs: 60000,                 // 中场休息,打散请求窗口
  swimmerGapMs: 180000,                // 运动员之间冷却
  retryDelaysMs: [5000, 20000, 60000], // 可重试失败(406/429/5xx/网络)指数退避
  cooldownAfterConsecutive: 3,         // 连续 N 场可重试失败 → 判定疑似限流
  cooldownMs: 300000,                  // 疑似限流时全局暂停
  emptyCooldownAfter: 5,               // 连续 N 场返回空数组 → 判定疑似软降级(200+空数据)
  emptyCooldownMs: 600000,             // 软降级时全局暂停 10 分钟
};
const RETRYABLE_HTTP = new Set([406, 429, 500, 502, 503, 504]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
if (MOCK_MODE) {
  // 本地 mock 测试:压缩所有等待,几分钟内走完整条链路
  FETCH_POLICY.meetGapMs = 400;
  FETCH_POLICY.batchPauseMs = 3000;
  FETCH_POLICY.swimmerGapMs = 4000;
  FETCH_POLICY.retryDelaysMs = [500, 1000, 2000];
  FETCH_POLICY.cooldownMs = 4000;
  FETCH_POLICY.emptyCooldownMs = 4000;
}

// ── Mock mode (dev only, ?mock=1) ──
// 不发真实 API 请求、不写 Firestore,用内存数据安全测试限速/重试/熔断/断点续传。
// dob/gender 供趋势图标准线层演示(MOCK-A → 13-14 年龄组,MOCK-B → 15-16;仅 mock 生效)。
const MOCK_SWIMMERS = [
  { name: 'Mock A (incremental + fail/circuit-break)', usaSwimmingId: 'MOCK-A', hasId: true, dob: '2013-06-01', gender: 'female' },
  { name: 'Mock B (batch pause)', usaSwimmingId: 'MOCK-B', hasId: true, dob: '2011-02-14', gender: 'male' },
];
const MOCK_BEST_TIMES = [
  { strokeAbbreviation: 'FR', strokeName: 'Freestyle', distance: 50, swimTime: '28.32', courseCode: 'SCY' },
  { strokeAbbreviation: 'BK', strokeName: 'Backstroke', distance: 100, swimTime: '1:02.15', courseCode: 'SCY' },
  { strokeAbbreviation: 'BR', strokeName: 'Breaststroke', distance: 100, swimTime: '1:12.48', courseCode: 'LCM' },
];
const MOCK_MEET_NAMES = ['Spring Invitational', 'Summer Champs', 'Regionals', 'Junior Meet', 'Fall Classic'];
// 与生产 Data Hub 返回格式一致:eventCode 字符串、swimTime 字符串、带 timeStandard 等字段。
// 覆盖 SCY 5 项 + LCM 3 项,趋势图/事件下拉可用。
const MOCK_SWIMS = [
  { eventCode: '50 FR SCY', distance: 50, strokeAbbreviation: 'FR', swimTime: '28.32', timeStandard: 'BB', finishPosition: 4, sessionName: 'Prelims', timeDrop: '-0.35' },
  { eventCode: '100 FR SCY', distance: 100, strokeAbbreviation: 'FR', swimTime: '1:02.15', timeStandard: 'A', finishPosition: 2, sessionName: 'Finals', timeDrop: '-1.20' },
  { eventCode: '100 BK SCY', distance: 100, strokeAbbreviation: 'BK', swimTime: '1:08.44', timeStandard: 'BB', finishPosition: 6, sessionName: 'Prelims', timeDrop: '0.00' },
  { eventCode: '100 BR SCY', distance: 100, strokeAbbreviation: 'BR', swimTime: '1:16.90', timeStandard: 'B', finishPosition: 9, sessionName: 'Prelims', timeDrop: '+0.85' },
  { eventCode: '200 FR SCY', distance: 200, strokeAbbreviation: 'FR', swimTime: '2:18.33', timeStandard: 'A', finishPosition: 3, sessionName: 'Finals', timeDrop: '-2.10' },
  { eventCode: '50 FR LCM', distance: 50, strokeAbbreviation: 'FR', swimTime: '32.18', timeStandard: 'B', finishPosition: 7, sessionName: 'Prelims', timeDrop: '-0.12' },
  { eventCode: '100 FL LCM', distance: 100, strokeAbbreviation: 'FL', swimTime: '1:15.30', timeStandard: 'AA', finishPosition: 1, sessionName: 'Finals', timeDrop: '-1.85' },
  { eventCode: '200 IM LCM', distance: 200, strokeAbbreviation: 'IM', swimTime: '2:41.05', timeStandard: 'BB', finishPosition: 5, sessionName: 'Prelims', timeDrop: '-0.60' },
];
// 日期池:2022-01 → 2026-07,4-8 月 LCM(夏季)其余 SCY(室内赛季)。
// MOCK-A 用索引 8..23(2023-09 → 2026-07,跨 4 个赛季),MOCK-B 用 0..19。
const MOCK_DATE_POOL = [
  '2022-01-08', '2022-03-12', '2022-06-18', '2022-10-08', '2022-12-10', '2023-02-04',
  '2023-05-20', '2023-07-08', '2023-09-16', '2023-12-09', '2024-02-03', '2024-05-18',
  '2024-07-06', '2024-10-12', '2024-12-14', '2025-02-01', '2025-04-26', '2025-06-14',
  '2025-10-11', '2025-12-13', '2026-01-31', '2026-04-25', '2026-05-16', '2026-07-04',
];
function mockIndexFor(memberId, meetNo) {
  return memberId === 'MOCK-A' ? 7 + meetNo : meetNo - 1;
}
function mockMeet(id, name, idx) {
  const d = MOCK_DATE_POOL[idx % MOCK_DATE_POOL.length];
  const y = +d.slice(0, 4);
  const m = +d.slice(5, 7);
  // 与 parseMeetStartDate 同一赛季约定:9 月-次年 8 月
  const season = m >= 9 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
  const course = m >= 4 && m <= 8 ? 'LCM' : 'SCY';
  return {
    meetId: id, meetName: name, meetDates: d, meetType: 'invitational',
    courseCode: course, season, seasonYear: season.slice(-4),
  };
}
// 每场 meet 渐进提速(0.4%/场),让趋势图有可见的下降曲线。
// 成绩经 parseSwimTime/formatSwimTime 往返,保持 "32.28"/"1:02.15" 字符串格式。
function mockSwimsForMeet(meetId) {
  const n = Number(/\d+/.exec(meetId.split('-').pop())?.[0] || 0);
  const factor = 1 - (Math.max(n, 1) - 1) * 0.004;
  return MOCK_SWIMS.map((sw) => ({ ...sw, swimTime: formatSwimTime(parseSwimTime(sw.swimTime) * factor) }));
}
function mockMeetsFor(memberId) {
  if (memberId === 'MOCK-A') {
    // 13 场正常 + 1 场"重试后成功" + 2 场"重试后仍失败"(连续 3 次可重试失败 → 熔断)
    const meets = [];
    for (let i = 1; i <= 13; i++) meets.push(mockMeet(`MEET-OK-${String(i).padStart(2, '0')}`, MOCK_MEET_NAMES[i % MOCK_MEET_NAMES.length], mockIndexFor(memberId, i)));
    meets.push(mockMeet('MEET-FAIL-RETRY', 'Retry-then-ok Meet', mockIndexFor(memberId, 14)));
    meets.push(mockMeet('MEET-FAIL-HARD-1', 'Hard Fail 1', mockIndexFor(memberId, 15)));
    meets.push(mockMeet('MEET-FAIL-HARD-2', 'Hard Fail 2', mockIndexFor(memberId, 16)));
    return meets;
  }
  // MOCK-B:20 场全成功 → 第 15 场后触发中场休息
  const meets = [];
  for (let i = 1; i <= 20; i++) meets.push(mockMeet(`MEET-OK-B${String(i).padStart(2, '0')}`, MOCK_MEET_NAMES[i % MOCK_MEET_NAMES.length], mockIndexFor(memberId, i)));
  return meets;
}
// mock 用内存 Firestore(验证断点续传,不碰生产数据)
const mockStore = new Map(); // memberId -> { meets, bestTimes, lastUpdated }
function mockSeed(memberId) {
  if (mockStore.has(memberId)) return;
  const meets = {};
  if (memberId === 'MOCK-A') {
    // 预置 5 场 status ok → 增量抓取应跳过它们
    for (let i = 1; i <= 5; i++) {
      const id = `MEET-OK-${String(i).padStart(2, '0')}`;
      meets[id] = {
        status: 'ok', swims: mockSwimsForMeet(id),
        ...mockMeet(id, 'Already Fetched', mockIndexFor(memberId, i)),
        fetchedAt: '2026-07-01T00:00:00Z',
      };
    }
  }
  mockStore.set(memberId, { meets, bestTimes: MOCK_BEST_TIMES, lastUpdated: '2026-07-01T00:00:00Z' });
}
const mockFailCounts = new Map();
if (MOCK_MODE) window.__mockStore = mockStore; // console 里检查断点续传结果用

function buildUsasHeaders(creds) {
  return {
    'AppName': 'DataHub',
    'Usas-Sub-Id': creds.subId || '',
    'Device-Id': creds.deviceId || '',
    'usas-session-id': creds.sessionId || '',
  };
}

async function fetchBestTimes(creds, memberId) {
  if (MOCK_MODE) { await sleep(200); return MOCK_BEST_TIMES; }
  const url = `${USAS_BASE}/GetBestTimesForMember/${memberId}`;
  const res = await fetch(url, { headers: buildUsasHeaders(creds) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function fetchMeets(creds, memberId) {
  if (MOCK_MODE) { await sleep(200); return mockMeetsFor(memberId); }
  const url = `${USAS_BASE}/GetSwimmerMeets/${memberId}`;
  const res = await fetch(url, { headers: buildUsasHeaders(creds) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// 单次请求。retryable=true 表示值得重试(限流/5xx/网络/超时)
async function tryFetchOnce(url, creds) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      headers: buildUsasHeaders(creds),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.ok) return { ok: true, data: await res.json() };
    let detail = '';
    try { detail = await res.text(); } catch (e) { detail = '(could not read body)'; }
    const err = new Error(`HTTP ${res.status}: ${detail.slice(0, 200)}`);
    return { ok: false, error: err, retryable: RETRYABLE_HTTP.has(res.status) };
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') return { ok: false, error: new Error('Timeout (15s)'), retryable: true };
    return { ok: false, error: err, retryable: true }; // 网络错误可能自愈,可重试
  }
}

// 带指数退避重试:406/429/5xx/网络/超时 → 重试 retryDelaysMs 里的次数,仍失败抛错(带 retryable 标记)
async function fetchMeetTimes(creds, memberId, meetId) {
  if (MOCK_MODE) {
    await sleep(400);
    if (meetId.includes('FAIL-RETRY')) {
      // 前 2 次 406,第 3 次成功 → 验证重试后恢复
      const n = (mockFailCounts.get(meetId) || 0) + 1;
      mockFailCounts.set(meetId, n);
      if (n <= 2) throw Object.assign(new Error('HTTP 406: mock rate-limited (retryable)'), { retryable: true });
    }
    if (meetId.includes('FAIL-HARD')) {
      throw Object.assign(new Error('HTTP 406: mock rate-limited (retryable)'), { retryable: true });
    }
    return mockSwimsForMeet(meetId);
  }
  const url = `${USAS_BASE}/GetSwimmerMeetTimes/${memberId}/${meetId}`;
  const delays = FETCH_POLICY.retryDelaysMs;
  for (let attempt = 0; ; attempt++) {
    const outcome = await tryFetchOnce(url, creds);
    if (outcome.ok) return outcome.data;
    if (!outcome.retryable) throw outcome.error;
    if (attempt >= delays.length) throw Object.assign(outcome.error, { retryable: true });
    console.warn(`[fetchMeetTimes] ${memberId}/${meetId} attempt ${attempt + 1} failed: ${outcome.error.message} — retrying in ${delays[attempt]}ms`);
    await sleep(delays[attempt]);
  }
}

async function loadSwimApiCredentials() {
  try {
    const snap = await getDoc(doc(db, 'settings', 'swimApi'));
    if (snap.exists()) {
      swimApiCredentials = snap.data();
      return swimApiCredentials;
    }
  } catch (e) { console.warn('Failed to load swim API credentials:', e); }
  return null;
}

async function saveSwimApiCredentials(deviceId, subId, sessionId) {
  const data = {
    deviceId: deviceId.trim(),
    subId: subId.trim(),
    sessionId: sessionId.trim(),
    updatedAt: new Date(),
    updatedBy: currentUser?.email || 'unknown',
  };
  await setDoc(doc(db, 'settings', 'swimApi'), data);
  swimApiCredentials = data;
}

function getSwimmersWithUsaId() {
  const swimmers = [];
  for (const reg of allRegistrations) {
    if (!reg.swimmers) continue;
    for (let i = 0; i < reg.swimmers.length; i++) {
      const s = reg.swimmers[i];
      if (s.deleted) continue;
      swimmers.push({
        usaSwimmingId: s.usaSwimmingId || null,
        name: [s.firstName, s.lastName].filter(Boolean).join(' ') || 'Unknown',
        hasId: !!s.usaSwimmingId,
        dob: s.dob || null,        // 趋势图标准线需要(按比赛日年龄选年龄组)
        gender: s.gender || null,  // 标准表分男女(官方表 B 档有女快于男特例)
      });
    }
  }
  return swimmers;
}

async function readExistingMeets(memberId) {
  if (MOCK_MODE) { mockSeed(memberId); return mockStore.get(memberId)?.meets || {}; }
  try {
    const snap = await getDoc(doc(db, 'swimResults', memberId));
    if (snap.exists()) return snap.data().meets || {};
  } catch (e) { /* ignore — 读不到就全量抓 */ }
  return {};
}

// 一次性迁移:2026-08-01 用 setDoc+merge 把 meets.{id} 存成了字面字段名
// (meets.12345)。把这些字面字段合并回嵌套 meets 对象(字面键优先——它们有
// 真实数据),然后整文档重写。幂等:没有字面字段的文档不受影响。
async function migrateSwimResultDocument(memberId) {
  const snap = await getDoc(doc(db, 'swimResults', memberId));
  if (!snap.exists()) return false;
  const data = snap.data();
  const literalKeys = Object.keys(data).filter((k) => k.startsWith('meets.'));
  if (literalKeys.length === 0) return false;

  const meets = { ...(data.meets || {}) };
  let migrated = 0;
  for (const key of literalKeys) {
    const meetId = key.slice('meets.'.length);
    const val = data[key];
    if (!val || typeof val !== 'object') continue;
    meets[meetId] = { ...val };
    migrated++;
  }

  const clean = { ...data };
  for (const key of literalKeys) delete clean[key];
  clean.meets = meets;
  await setDoc(doc(db, 'swimResults', memberId), clean); // 整文档重写,meets 是普通嵌套键,安全
  console.log(`[Migrate] ${memberId}: merged ${migrated} literal meet fields into meets object`);
  return true;
}

// 教练页加载时对每个运动员跑一次迁移(后台执行,不阻塞 UI)
async function migrateAllSwimResults() {
  if (MOCK_MODE) return;
  const swimmers = getSwimmersWithUsaId().filter((s) => s.hasId);
  for (const s of swimmers) {
    try {
      await migrateSwimResultDocument(s.usaSwimmingId);
    } catch (e) {
      console.warn(`[Migrate] ${s.usaSwimmingId} failed:`, e);
    }
  }
}

// Athlete Data Status — Results tab 渲染后从 Firestore 聚合持久化状态
// (fetch 期间的事件实时更新单元格;这里负责页面刷新/切换 tab 后读回真实数据)
async function loadAthleteDataStatus() {
  // mock 模式与 fetch 流程共用 MOCK_SWIMMERS,否则表格行是真实 id,
  // mockStore 里永远没有对应数据 → 状态列恒为 "—"
  const swimmers = MOCK_MODE ? MOCK_SWIMMERS : getSwimmersWithUsaId().filter((s) => s.hasId);
  await Promise.all(swimmers.map(async (s) => {
    const cell = document.getElementById(`status-${s.usaSwimmingId}`);
    if (!cell) return;
    let meets = {};
    try {
      if (MOCK_MODE) {
        mockSeed(s.usaSwimmingId);
        meets = mockStore.get(s.usaSwimmingId)?.meets || {};
      } else {
        const snap = await getDoc(doc(db, 'swimResults', s.usaSwimmingId));
        if (snap.exists()) meets = snap.data().meets || {};
      }
    } catch (e) {
      cell.innerHTML = `<span style="color:var(--color-accent);">❌ ${escapeHtml(e.message || 'load failed')}</span>`;
      return;
    }
    const entries = Object.values(meets);
    if (entries.length === 0) {
      cell.innerHTML = `<span style="color: var(--text-muted);">— No data yet</span>`;
      return;
    }
    let ok = 0, failed = 0, empty = 0, swims = 0;
    for (const m of entries) {
      // 旧数据无 status → 按 swims 长度判断(2026-08-01 约定)
      const st = m.status || (m.swims && m.swims.length ? 'ok' : 'empty');
      if (st === 'ok') ok++;
      else if (st === 'failed') failed++;
      else empty++;
      swims += (m.swims || []).length;
    }
    if (failed === 0 && empty === 0) {
      cell.innerHTML = `<span style="color:#16A34A;">✅ ${ok} meets · ${swims} swims</span>`;
    } else {
      const issues = [];
      if (failed) issues.push(`${failed} failed`);
      if (empty) issues.push(`${empty} empty`);
      cell.innerHTML = `<span style="color:var(--color-accent);">⚠ ${entries.length} meets · ${issues.join(' · ')} — refetch</span>`;
    }
  }));
}

// 每场 meet 抓完立即写入 → 中断后重跑只补失败/缺失的(断点续传)
// ⚠ 必须用 updateDoc:setDoc 的 {merge:true} 会把带点号的键(meets.12345)
// 当成字面字段名存储(2026-08-01 踩坑,见 migrateSwimResultDocument)
async function saveMeetResult(memberId, meet, swims, status) {
  if (MOCK_MODE) {
    mockSeed(memberId);
    const store = mockStore.get(memberId);
    store.meets[meet.meetId] = {
      meetName: meet.meetName, meetDates: meet.meetDates, meetType: meet.meetType,
      courseCode: meet.courseCode, season: meet.season, seasonYear: meet.seasonYear,
      fetchedAt: new Date().toISOString(), status, swims,
    };
    return;
  }
  const update = {
    [`meets.${meet.meetId}`]: {
      meetName: meet.meetName, meetDates: meet.meetDates, meetType: meet.meetType,
      courseCode: meet.courseCode, season: meet.season, seasonYear: meet.seasonYear,
      fetchedAt: new Date().toISOString(), status, swims,
    },
    lastUpdated: new Date().toISOString(),
  };
  await updateDoc(doc(db, 'swimResults', memberId), update);
}

// 抓取单个运动员:限速 + 重试 + 熔断 + 断点续传。
// force=true 忽略已有数据全量重抓;否则只抓 status≠'ok' 的 meet。
// 返回 { fetched, failed, errors, bestTimes, meets }
async function fetchSwimmerData(creds, memberId, swimmerName, opts = {}) {
  const { force = false, onLog = () => {}, onBestTimes = () => {} } = opts;
  const existingMeets = await readExistingMeets(memberId);

  const needsFetch = (meetId) => {
    if (force) return true;
    const ex = existingMeets[meetId];
    if (!ex) return true;                        // 从未抓过
    if (ex.status === 'ok') return false;        // 已成功
    if (ex.status === 'failed' || ex.status === 'empty') return true; // 上次失败/空结果 → 重试
    return (ex.swims?.length || 0) === 0;        // 旧数据(无 status)按 swims 判断
  };

  // 1. Best times
  const bestTimes = await fetchBestTimes(creds, memberId);
  onBestTimes(bestTimes);
  if (MOCK_MODE) {
    // mock:bestTimes 写入内存 store,View Athlete Results 与生产同构
    mockSeed(memberId);
    const entry = mockStore.get(memberId);
    if (entry) { entry.bestTimes = bestTimes; entry.lastUpdated = new Date().toISOString(); }
  } else {
    await setDoc(doc(db, 'swimResults', memberId), {
      memberId, swimmerName, bestTimes, lastUpdated: new Date().toISOString(),
    }, { merge: true });
  }

  // 2. Meets 列表
  const meets = await fetchMeets(creds, memberId);
  const pending = meets.filter((m) => needsFetch(m.meetId));
  onLog(`📅 ${meets.length} meets total, ${pending.length} to fetch${pending.length ? '' : ' — all up to date'}`);

  let fetched = 0;
  let failed = 0;
  const errors = [];
  let consecutiveFailures = 0; // 连续"可重试"失败数 → 限流熔断
  let consecutiveEmpty = 0;    // 连续空结果数 → 软降级熔断

  for (let i = 0; i < pending.length; i++) {
    const meet = pending[i];
    try {
      const raw = await fetchMeetTimes(creds, memberId, meet.meetId);
      const swims = Array.isArray(raw) ? raw : []; // 防御:非数组响应按空处理
      // 空数组可能是"真的没成绩",也可能是 API 软降级(200+空)。
      // 标记 empty 而非 ok,下次增量会重试;连续空则触发软降级暂停。
      const status = swims.length === 0 ? 'empty' : 'ok';
      await saveMeetResult(memberId, meet, swims, status);
      fetched++;
      consecutiveFailures = 0;
      if (swims.length === 0) {
        consecutiveEmpty++;
        if (consecutiveEmpty >= FETCH_POLICY.emptyCooldownAfter) {
          onLog(`⚠ 连续 ${consecutiveEmpty} 场返回空结果,疑似被软降级 — 暂停 ${FETCH_POLICY.emptyCooldownMs / 60000} 分钟`, true);
          await sleep(FETCH_POLICY.emptyCooldownMs);
          consecutiveEmpty = 0;
        }
      } else {
        consecutiveEmpty = 0;
      }
    } catch (err) {
      await saveMeetResult(memberId, meet, [], 'failed');
      failed++;
      errors.push(`${meet.meetName || meet.meetId}: ${err.message}`);
      if (err.retryable) {
        consecutiveFailures++;
        if (consecutiveFailures >= FETCH_POLICY.cooldownAfterConsecutive) {
          onLog(`⚠ 连续 ${consecutiveFailures} 场可重试失败,疑似被限流 — 全局暂停 ${FETCH_POLICY.cooldownMs / 60000} 分钟`, true);
          await sleep(FETCH_POLICY.cooldownMs);
          consecutiveFailures = 0;
        }
      }
    }

    // 中场休息:每 batchSize 场(成功+失败都发过请求)休息一次;最后一场后不再等
    if (i + 1 < pending.length) {
      if ((i + 1) % FETCH_POLICY.batchSize === 0) {
        onLog(`⏸ 已处理 ${i + 1}/${pending.length} 场,中场休息 ${FETCH_POLICY.batchPauseMs / 60000} 分钟(保护 API 配额)...`);
        await sleep(FETCH_POLICY.batchPauseMs);
      } else {
        await sleep(FETCH_POLICY.meetGapMs);
      }
    }
  }

  return { fetched, failed, errors, bestTimes, meets };
}

async function fetchAllSwimmerResults(creds, onProgress) {
  const swimmers = MOCK_MODE ? MOCK_SWIMMERS : getSwimmersWithUsaId().filter((s) => s.hasId);
  if (swimmers.length === 0) {
    onProgress({ type: 'error', message: 'No swimmers with USA Swimming ID found.' });
    return;
  }

  onProgress({ type: 'start', total: swimmers.length });

  let success = 0;
  let failed = 0;
  const errors = [];

  for (let i = 0; i < swimmers.length; i++) {
    const sw = swimmers[i];
    onProgress({ type: 'swimmer-start', index: i, total: swimmers.length, name: sw.name, memberId: sw.usaSwimmingId });

    let summary = null;
    try {
      summary = await fetchSwimmerData(creds, sw.usaSwimmingId, sw.name, {
        force: false,
        onLog: (message, isError) => onProgress({ type: 'log', message, isError }),
        onBestTimes: (bt) => onProgress({ type: 'step', name: sw.name, step: 'bestTimes', count: bt.length }),
      });
      const hadWork = summary.fetched > 0 || summary.failed > 0;
      onProgress({
        type: 'swimmer-done', name: sw.name, memberId: sw.usaSwimmingId,
        bestTimes: summary.bestTimes.length, meets: summary.meets.length,
        newMeets: summary.fetched, failedMeets: summary.failed, written: hadWork,
      });
      if (summary.failed > 0) {
        errors.push(...summary.errors.map((e) => `${sw.name}: ${e}`));
      }
      success++;
    } catch (err) {
      failed++;
      errors.push(`${sw.name}: ${err.message}`);
      onProgress({ type: 'swimmer-error', name: sw.name, memberId: sw.usaSwimmingId, error: err.message });
    }

    onProgress({ type: 'progress', index: i + 1, total: swimmers.length, success, failed });

    // 运动员之间冷却:只有实际发过请求才休息,全部跳过则立即继续
    if (summary && i < swimmers.length - 1 && (summary.fetched > 0 || summary.failed > 0)) {
      onProgress({ type: 'log', message: `⏸ 运动员间冷却 ${FETCH_POLICY.swimmerGapMs / 60000} 分钟...` });
      await sleep(FETCH_POLICY.swimmerGapMs);
    }
  }

  onProgress({ type: 'done', total: swimmers.length, success, failed, errors });
}

function renderCoachResults() {
  // mock 模式用 MOCK_SWIMMERS,与 fetch 流程/loadAthleteDataStatus 保持一致
  const swimmers = MOCK_MODE ? MOCK_SWIMMERS : getSwimmersWithUsaId();
  const withId = swimmers.filter(s => s.hasId);
  const withoutId = swimmers.filter(s => !s.hasId);

  const hasCreds = swimApiCredentials && swimApiCredentials.deviceId && swimApiCredentials.sessionId;

  // Step-by-step guide for non-technical coaches
  const credentialGuide = `
    <div class="credential-guide" id="credential-guide" style="display:none; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: var(--space-lg); margin-top: var(--space-md); font-size: 0.9rem; line-height: 1.8;">
      <h4 style="margin: 0 0 0.75rem 0;">📖 How to Get Your Credentials</h4>
      <ol style="padding-left: 1.25rem; margin: 0;">
        <li>Open <a href="https://data.usaswimming.org/" target="_blank" rel="noopener">https://data.usaswimming.org/</a> and <strong>log in</strong> to your USA Swimming account</li>
        <li>Press <kbd>F12</kbd> on your keyboard (opens Developer Tools)</li>
        <li>Click the <strong>Network</strong> tab at the top</li>
        <li>Type <code>times-api</code> in the filter box to narrow down requests</li>
        <li>In the left sidebar, <strong>click any athlete's name</strong></li>
        <li>Click any request that appears on the right → then click the <strong>Headers</strong> tab</li>
        <li>Under <strong>Request Headers</strong>, find and copy these three values:</li>
      </ol>
      <table style="margin-top: 0.75rem; width: 100%; border-collapse: collapse; font-size: 0.85rem;">
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding: 0.4rem 0.5rem; font-weight: 600; white-space: nowrap;">Device-Id</td>
          <td style="padding: 0.4rem 0.5rem; color: var(--text-muted);">Long string (e.g. <code>V2luMzIgLSBHb29V...</code>). Tied to your computer + browser — <strong>rarely changes</strong>.</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding: 0.4rem 0.5rem; font-weight: 600; white-space: nowrap;">Usas-Sub-Id</td>
          <td style="padding: 0.4rem 0.5rem; color: var(--text-muted);">UUID format (e.g. <code>a05b310b-0c25-47a9-...</code>). Tied to your USA Swimming account — <strong>never changes</strong> as long as you use the same account.</td>
        </tr>
        <tr>
          <td style="padding: 0.4rem 0.5rem; font-weight: 600; white-space: nowrap;">usas-session-id</td>
          <td style="padding: 0.4rem 0.5rem; color: var(--text-muted);">32-character hex (e.g. <code>6F7FF3AF...</code>). <strong>Long-lived — rarely needs replacing</strong>. Only refresh it if fetching fails with an auth error (401/403): log in to Data Hub again and copy a fresh one.</td>
        </tr>
      </table>
      <p style="margin: 0.75rem 0 0 0; font-size: 0.8rem; color: var(--color-accent);">
        ⚠ <strong>Tip:</strong> Device-Id, Usas-Sub-Id, and usas-session-id all only need to be set once. The session-id is long-lived — only refresh it if fetching fails with an auth error (401/403): log in to Data Hub again and copy a fresh session-id.
      </p>
    </div>
  `;

  return `
    <div class="dash-panel" style="margin-bottom: 1.5rem;">
      <div class="dash-panel-header">
        <h3 style="margin: 0;">🔑 API Credentials</h3>
        <span id="creds-status" style="font-size: 0.85rem; color: ${hasCreds ? '#16A34A' : 'var(--color-accent)'};">
          ${hasCreds ? '✅ Configured' : '⚠ Not configured'}
        </span>
      </div>
      <div class="profile-fields" style="margin-top: var(--space-md);">
        <div class="form-row" style="grid-template-columns: 1fr 1fr 1fr;">
          <div class="form-group">
            <label class="form-label">Device-Id <span style="font-size:0.75rem;color:var(--text-muted);">(set once — tied to computer/browser)</span></label>
            <input class="form-input" id="creds-device-id" placeholder="Copy from Data Hub" value="${escapeHtml(swimApiCredentials?.deviceId || '')}" style="font-family: monospace; font-size: 0.8rem;" />
          </div>
          <div class="form-group">
            <label class="form-label">Usas-Sub-Id <span style="font-size:0.75rem;color:var(--text-muted);">(set once — tied to your account)</span></label>
            <input class="form-input" id="creds-sub-id" placeholder="UUID format" value="${escapeHtml(swimApiCredentials?.subId || '')}" style="font-family: monospace; font-size: 0.8rem;" />
          </div>
          <div class="form-group">
            <label class="form-label">usas-session-id <span style="font-size:0.75rem;color:var(--text-muted);">(set once — long-lived, refresh only on auth errors)</span></label>
            <input class="form-input" id="creds-session-id" placeholder="32-char hex — rarely changes" value="${escapeHtml(swimApiCredentials?.sessionId || '')}" style="font-family: monospace; font-size: 0.8rem;" />
          </div>
        </div>
      </div>
      <div style="display: flex; gap: 0.75rem; margin-top: var(--space-md);">
        <button class="btn btn-primary btn-sm" id="save-creds-btn">💾 Save Credentials</button>
        <button class="btn btn-outline btn-sm" id="toggle-guide-btn">💡 How to get credentials?</button>
      </div>
      ${credentialGuide}
      <p id="creds-message" style="margin-top: 0.5rem; font-size: 0.85rem;"></p>
    </div>

    <div class="dash-panel" style="margin-bottom: 1.5rem;">
      <div class="dash-panel-header">
        <h3 style="margin: 0;">🔄 Fetch Swim Times</h3>
        <span id="fetch-status" style="font-size: 0.85rem;">Ready</span>
      </div>
      <p style="color: var(--text-muted); margin: var(--space-md) 0; font-size: 0.9rem;">
        Fetch results from USA Swimming for <strong>${withId.length}</strong> athlete(s).
        Previously fetched meets are skipped automatically (incremental update).
      </p>
      <div style="display: flex; gap: 0.75rem; margin-bottom: var(--space-md);">
        <button class="btn btn-primary btn-sm" id="fetch-all-btn" ${!hasCreds || swimResultsFetching ? 'disabled' : ''}>
          ${swimResultsFetching ? '⏳ Fetching...' : '🔄 Fetch All Swimmer Results'}
        </button>
      </div>
      <div id="fetch-log" style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.75rem; max-height: 350px; overflow-y: auto; font-family: monospace; font-size: 0.8rem; line-height: 1.6; display: none;">
      </div>
    </div>

    <div class="dash-panel">
      <h3 style="margin: 0 0 var(--space-md) 0;">📋 Athlete Data Status</h3>
      <div class="roster-table-wrapper" style="max-height: 400px; overflow-y: auto;">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
          <thead>
            <tr style="border-bottom: 2px solid var(--border-color); color: var(--text-muted);">
              <th style="padding: 0.6rem; text-align: left;">Name</th>
              <th style="padding: 0.6rem; text-align: left;">USA Swimming ID</th>
              <th style="padding: 0.6rem; text-align: left;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${withId.map(s => `
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 0.5rem 0.6rem; font-weight: 500;">${escapeHtml(s.name)}</td>
                <td style="padding: 0.5rem 0.6rem; font-family: monospace; font-size: 0.8rem;">${escapeHtml(s.usaSwimmingId)}</td>
                <td style="padding: 0.5rem 0.6rem;" id="status-${escapeHtml(s.usaSwimmingId)}">
                  <span style="color: var(--text-muted);">—</span>
                </td>
              </tr>
            `).join('')}
            ${withoutId.map(s => `
              <tr style="border-bottom: 1px solid var(--border-color); opacity: 0.6;">
                <td style="padding: 0.5rem 0.6rem;">${escapeHtml(s.name)}</td>
                <td style="padding: 0.5rem 0.6rem; color: var(--color-accent);">Not set</td>
                <td style="padding: 0.5rem 0.6rem;">⚠ Add USA Swimming ID in Profile</td>
              </tr>
            `).join('')}
            ${swimmers.length === 0 ? `
              <tr><td colspan="3" style="padding: 2rem; text-align: center; color: var(--text-muted);">No athlete data yet</td></tr>
            ` : ''}
          </tbody>
        </table>
      </div>
    </div>

    ${withId.length > 0 ? `
    <div class="dash-panel" style="margin-top: 1.5rem;">
      <h3 style="margin: 0 0 var(--space-md) 0;">📊 View Athlete Results</h3>
      <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: var(--space-md); flex-wrap: wrap;">
        <select class="form-input" id="results-athlete-select" style="max-width: 300px;">
          <option value="">— Select an athlete —</option>
          ${withId.map(s => `<option value="${escapeHtml(s.usaSwimmingId)}">${escapeHtml(s.name)}</option>`).join('')}
        </select>
        <button class="btn btn-outline btn-sm" id="refetch-one-btn" disabled>🔄 Refetch Selected Athlete</button>
      </div>
      <div id="results-viewer" style="display: none;">
        <div id="results-content"></div>
      </div>
    </div>
    ` : ''}
  `;
}

// ── Family Results(家庭端 Results tab)──
// 家庭只能看到自家孩子;复用教练端 loadAthleteResults 的渲染核心,
// 差异:无 Debug JSON、meet 历史只显示 ok 场次、文案走 i18n、mock 映射到 MOCK-A/B。

function renderFamilyResults() {
  if (!familyData) {
    return `<div class="dash-panel" style="text-align: center; padding: 3rem;">
      <p class="dash-empty">${t('dash_swimmer_results_no_usa_id')}</p>
    </div>`;
  }
  const swimmers = (familyData.swimmers || []).filter(s => !s.deleted && s.usaSwimmingId);
  if (swimmers.length === 0) {
    return `<div class="dash-panel" style="text-align: center; padding: 3rem;">
      <p class="dash-empty">${t('dash_swimmer_results_no_usa_id')}</p>
    </div>`;
  }

  const swimmerName = (s) => [s.firstName, s.middleName, s.lastName].filter(Boolean).join(' ');

  return `
    <div class="dash-panel">
      ${swimmers.length > 1 ? `
      <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: var(--space-md); flex-wrap: wrap;">
        <span style="font-size: 0.85rem; color: var(--text-muted);">${t('dash_swimmer_results_select_label')}</span>
        <select class="form-input" id="family-results-select" style="max-width: 300px;">
          ${swimmers.map((s) => `<option value="${escapeHtml(s.usaSwimmingId)}">${escapeHtml(swimmerName(s))}</option>`).join('')}
        </select>
      </div>
      ` : ''}
      <div id="results-viewer" style="display: none;">
        <div id="results-content"></div>
      </div>
    </div>
  `;
}

// Results tab 渲染后调用(镜像教练端 loadAthleteDataStatus 时机):绑孩子下拉 + 加载第一个孩子。
function initFamilyResults() {
  const select = document.getElementById('family-results-select');
  select?.addEventListener('change', (e) => {
    if (e.target.value) loadFamilySwimmerResults(e.target.value);
  });
  const swimmers = (familyData?.swimmers || []).filter(s => !s.deleted && s.usaSwimmingId);
  if (swimmers.length > 0) loadFamilySwimmerResults(swimmers[0].usaSwimmingId);
}

// 家庭端编排:真实 usaSwimmingId → swimResults/{id};mock 下按下标映射 MOCK-A/B
// (mockSeed 的预置语义是教练端断点续传测试的依赖,映射必须放调用侧,不碰 mockSeed)。
function loadFamilySwimmerResults(usaId) {
  const swimmers = (familyData?.swimmers || []).filter(s => !s.deleted && s.usaSwimmingId);
  const idx = swimmers.findIndex(s => s.usaSwimmingId === usaId);
  if (idx < 0) return;
  const child = swimmers[idx];
  const mappedId = MOCK_MODE ? (idx % 2 === 0 ? 'MOCK-A' : 'MOCK-B') : usaId;
  // mock 下补齐缺失的 dob/gender(来自 MOCK_SWIMMERS 同位记录),标准线可演示;
  // 生产下原样透传,缺 dob/gender → 不画线(设计行为)。
  const meta = MOCK_MODE
    ? { dob: child.dob || MOCK_SWIMMERS[idx % 2].dob, gender: child.gender || MOCK_SWIMMERS[idx % 2].gender }
    : { dob: child.dob || null, gender: child.gender || null };
  loadAthleteResults(mappedId, {
    swimmerMeta: meta,
    showDebug: false,
    onlyOkMeets: true,
    texts: {
      loading: t('dash_swimmer_results_loading'),
      noData: t('dash_swimmer_results_no_data'),
      bestTimesEmpty: t('dash_swimmer_results_no_best_times'),
      meetHistoryEmpty: t('dash_swimmer_results_no_meets'),
    },
  });
}

// ── Swim Time Formatting Helpers ──

function formatSwimTime(seconds) {
  if (seconds == null || seconds === '') return '—';
  const num = Number(seconds);
  if (isNaN(num)) return String(seconds);
  if (num < 60) return num.toFixed(2);
  const mins = Math.floor(num / 60);
  const secs = (num % 60).toFixed(2);
  return `${mins}:${secs.padStart(5, '0')}`;
}

function getTimeStandardClass(std) {
  if (!std) return '';
  const upper = std.toUpperCase();
  const map = {
    'B': 'ts-b', 'BB': 'ts-bb', 'A': 'ts-a',
    'AA': 'ts-aa', 'AAA': 'ts-aaa', 'AAAA': 'ts-aaaa',
  };
  return map[upper] || '';
}

function getCourseLabel(code) {
  const map = { 'LCM': 'LCM (50m)', 'SCY': 'SCY (25yd)', 'SCM': 'SCM (25m)' };
  return map[code] || code || '—';
}

// ── Trend Chart(成绩历史曲线图,原生 SVG 零依赖)──

const STROKE_LABELS = { FR: 'Free', BK: 'Back', BR: 'Breast', FL: 'Fly', IM: 'IM' };
const TREND_LEVELS = [
  ['B', 'ts-b'], ['BB', 'ts-bb'], ['A', 'ts-a'], ['AA', 'ts-aa'], ['AAA', 'ts-aaa'], ['AAAA', 'ts-aaaa'],
];

// 解析成绩字符串/数字 → 秒。"32.28"→32.28、"1:28.23"→88.23;数字直接过;
// null/''/无法解析 → null。生产 Data Hub 返回字符串,旧数据可能是数字,两者都兼容。
function parseSwimTime(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const str = String(value).trim();
  const mmss = /^(\d+):(\d{2}(?:\.\d+)?)$/.exec(str);
  if (mmss) return +mmss[1] * 60 + +mmss[2];
  const sec = Number(str);
  return Number.isFinite(sec) ? sec : null;
}

// 泳姿缩写归一化:FREE→FR、FLY→FL、BACK→BK、BREAST→BR;其余保留(IM/FR 等)。
function normalizeStrokeCode(stroke) {
  const alias = { FREE: 'FR', FLY: 'FL', BACK: 'BK', BREAST: 'BR' };
  const up = String(stroke || '').toUpperCase();
  return alias[up] || up;
}

// 解析 eventCode → { distance, stroke, course }。
// 主格式 "50 FL SCY";旧数据可能是 "50 FR"(无 course)→ 用 meet.courseCode 兜底。
// 解析失败返回 null(调用方丢点)。
function parseEventCode(eventCode, meet) {
  const code = String(eventCode || '').trim();
  if (!code) return null;
  const withCourse = /^(\d+)\s+([A-Za-z]{2,4})\s+([A-Za-z]{2,3})$/.exec(code);
  const noCourse = /^(\d+)\s+([A-Za-z]{2,4})$/.exec(code);
  if (!withCourse && !noCourse) return null;
  const m = withCourse || noCourse;
  const distance = +m[1];
  const stroke = normalizeStrokeCode(m[2]);
  const course = withCourse ? m[3].toUpperCase() : (meet?.courseCode || '').toUpperCase() || null;
  if (!Number.isFinite(distance) || !stroke || !course) return null;
  return { distance, stroke, course };
}

// 某时间戳下运动员的年龄(按 USAS 规则,标准按比赛日年龄归属)。
function ageAtDate(dob, ts) {
  if (!dob) return null;
  const b = new Date(dob);
  const d = new Date(ts);
  if (isNaN(b.getTime()) || isNaN(d.getTime())) return null;
  let age = d.getFullYear() - b.getFullYear();
  if (d.getMonth() < b.getMonth() || (d.getMonth() === b.getMonth() && d.getDate() < b.getDate())) age--;
  return age;
}

// 构建趋势图标准线层:用该运动员最近一次(所选事件的最后一个点)的年龄选年龄组。
// 无 dob/gender 或事件在标准表中不存在 → null → 图表自动不画线层。
function trendLevelLines(points, eventKey, swimmer) {
  if (!points || points.length === 0) return null;
  const age = ageAtDate(swimmer?.dob, points[points.length - 1].dateTs);
  const course = String(eventKey || '').split(' ').pop().toUpperCase();
  return getTimeStandardLevels({ age, course, eventKey, gender: swimmer?.gender });
}

// 汇总某运动员某项目的历史成绩点。eventKey 形如 "50 FR SCY"(大写)。
// 同一 meet 同项目取最快(预赛/决赛去重);meet 日期或成绩解析失败丢点(warn)。
// 返回 { points, count },points 按日期升序。点携带 tooltip 所需全部字段。
function buildTrendData(meets, eventKey) {
  const key = String(eventKey || '').toUpperCase().trim();
  const points = [];
  for (const [meetId, meet] of Object.entries(meets || {})) {
    // 与 loadAthleteDataStatus 相同的状态回退约定:旧数据无 status 按 swims 判断
    const st = meet.status || (Array.isArray(meet.swims) && meet.swims.length ? 'ok' : 'empty');
    if (st !== 'ok' || !Array.isArray(meet.swims) || meet.swims.length === 0) continue;
    const dateTs = parseMeetStartDate(meet);
    if (dateTs == null) {
      console.warn('[Trend] no parseable meet date for', meetId, meet.meetDates);
      continue;
    }
    let best = null;
    for (const sw of meet.swims) {
      const parsed = parseEventCode(sw.eventCode || `${sw.distance || ''} ${sw.strokeAbbreviation || ''}`, meet);
      if (!parsed || `${parsed.distance} ${parsed.stroke} ${parsed.course}` !== key) continue;
      const seconds = parseSwimTime(sw.swimTime);
      if (seconds == null) continue;
      if (!best || seconds < best.seconds) best = { seconds, course: parsed.course, sw };
    }
    if (!best) continue;
    points.push({
      meetId,
      meetName: meet.meetName || '',
      dateTs,
      dateLabel: meet.meetDates || '',
      seconds: best.seconds,
      timeText: formatSwimTime(best.seconds),
      timeStandard: best.sw.timeStandard ?? null,
      timeDrop: best.sw.timeDrop ?? null,
      finishPosition: best.sw.finishPosition ?? null,
      sessionName: best.sw.sessionName ?? null,
      course: best.course,
    });
  }
  points.sort((a, b) => a.dateTs - b.dateTs || a.meetId.localeCompare(b.meetId));
  return { points, count: points.length };
}

// 列出该运动员所有已抓取的项目(去重后点数),供事件下拉使用。
function buildEventOptions(meets) {
  const tally = new Map(); // key → { distance, stroke, course, count }
  for (const meet of Object.values(meets || {})) {
    const st = meet.status || (Array.isArray(meet.swims) && meet.swims.length ? 'ok' : 'empty');
    if (st !== 'ok' || !Array.isArray(meet.swims)) continue;
    const seen = new Set();
    for (const sw of meet.swims) {
      const parsed = parseEventCode(sw.eventCode || `${sw.distance || ''} ${sw.strokeAbbreviation || ''}`, meet);
      if (!parsed) continue;
      const key = `${parsed.distance} ${parsed.stroke} ${parsed.course}`;
      if (seen.has(key)) continue; // 同一 meet 同项目只计一个点
      seen.add(key);
      const e = tally.get(key);
      if (e) e.count++;
      else tally.set(key, { distance: parsed.distance, stroke: parsed.stroke, course: parsed.course, count: 1 });
    }
  }
  const strokeOrder = { FR: 0, BK: 1, BR: 2, FL: 3, IM: 4 };
  const courseOrder = { SCY: 0, LCM: 1, SCM: 2 };
  return [...tally.values()]
    .sort((a, b) =>
      a.distance - b.distance ||
      (strokeOrder[a.stroke] ?? 9) - (strokeOrder[b.stroke] ?? 9) ||
      (courseOrder[a.course] ?? 9) - (courseOrder[b.course] ?? 9))
    .map((e) => ({
      key: `${e.distance} ${e.stroke} ${e.course}`,
      label: `${e.distance} ${STROKE_LABELS[e.stroke] || e.stroke} · ${e.course}`,
      count: e.count,
    }));
}

// 图例:六档标准色 + 文字(级别信息永不只靠颜色传达 — dataviz 校验 AA/AAAA 邻对
// 正常视觉 ΔE 9.9 低于 15,靠文字/尺寸二次编码兜底)。
function trendLegendMarkup() {
  return TREND_LEVELS.map(([label, cls]) => `
    <span style="display:inline-flex;align-items:center;gap:0.35rem;">
      <span class="trend-legend-dot ts-dot ${cls}"></span>${label}
    </span>`).join('');
}

// tooltip 文本(经 escapeHtml 后放入 SVG <title>)。
function buildTrendTooltip(p) {
  const dropText = p.timeDrop == null
    ? '—'
    : (typeof p.timeDrop === 'number' ? (p.timeDrop > 0 ? '+' : '') + p.timeDrop.toFixed(2) + 's' : String(p.timeDrop));
  return [
    p.meetName,
    `${p.dateLabel} (${p.course})`,
    `Time: ${p.timeText} · ${p.timeStandard || '—'}`,
    `Drop: ${dropText} · Place: ${p.finishPosition ?? '—'}`,
  ].join('\n');
}

// 画成绩趋势 SVG(纯字符串,无 DOM,内联样式+CSS 变量深浅主题自适应)。
// levelLines:标准线层 [{level, thresholdSeconds, color}],null/[] 时整层跳过
// (数据来自 src/data/timeStandards.js 的 USAS 2024-2028 标准表,按运动员 dob/gender 选年龄组)。
// 纵轴倒置(时间越小越靠上);点按 timeStandard 着色(ts-dot 类);
// tooltip 用 SVG <title> + 透明大号 hit-target(零 JS、无障碍、触屏可用)。
function renderTrendChart(points, levelLines, opts = {}) {
  const { width = 720, height = 300, margin = { top: 14, right: 44, bottom: 26, left: 48 } } = opts;
  if (!points || points.length === 0) {
    return '<p class="trend-empty">No swims for this event.</p>';
  }
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;

  // x 缩放:日期时间戳,两端垫 5%;单点/同日时至少 1 天跨度
  const minTs = Math.min(...points.map((p) => p.dateTs));
  const maxTs = Math.max(...points.map((p) => p.dateTs));
  const span = Math.max(maxTs - minTs, 24 * 3600 * 1000);
  const x0 = minTs - span * 0.05;
  const x1 = maxTs + span * 0.05;
  const x = (ts) => margin.left + ((ts - x0) / (x1 - x0)) * plotW;

  // y 缩放:包含标准线阈值,垫 8%,倒置(最快在顶 — minSec 映射到顶部)
  const thresholds = (levelLines || []).map((l) => l.thresholdSeconds);
  const secs = points.map((p) => p.seconds);
  let minSec = Math.min(...secs, ...thresholds);
  let maxSec = Math.max(...secs, ...thresholds);
  const pad = (maxSec - minSec || 1) * 0.08;
  minSec -= pad;
  maxSec += pad;
  const y = (sec) => margin.top + ((sec - minSec) / (maxSec - minSec)) * plotH;

  // y 刻度:1/2/5×10^k 步长,最多 6 个
  const niceStep = (raw) => {
    const pow = Math.pow(10, Math.floor(Math.log10(raw)));
    const n = raw / pow;
    const f = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
    return f * pow;
  };
  const step = niceStep((maxSec - minSec) / 4);
  const yTicks = [];
  for (let t = Math.ceil(minSec / step) * step; t <= maxSec + 1e-9; t += step) {
    yTicks.push(+t.toFixed(3));
    if (yTicks.length >= 6) break;
  }

  // 网格(仅 y 向,recessive)+ y 轴标签
  const yTickMarkup = yTicks.map((t) => {
    const ty = y(t);
    return `
      <line x1="${margin.left}" x2="${width - margin.right}" y1="${ty.toFixed(1)}" y2="${ty.toFixed(1)}" stroke="var(--border-color)" stroke-opacity="0.4" stroke-width="1" />
      <text x="${margin.left - 6}" y="${(ty + 3).toFixed(1)}" text-anchor="end" font-size="10" fill="var(--text-muted)" font-family="var(--font-sans, sans-serif)">${formatSwimTime(t)}</text>`;
  }).join('');

  // x 轴:5 个均匀刻度,中间重复标签跳过;首尾对齐两端
  let prevLabel = '';
  const xTickMarkup = [];
  for (let i = 0; i < 5; i++) {
    const ts = x0 + ((x1 - x0) * i) / 4;
    const label = new Date(ts).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    if (i > 0 && i < 4 && label === prevLabel) continue;
    prevLabel = label;
    const anchor = i === 0 ? 'start' : i === 4 ? 'end' : 'middle';
    xTickMarkup.push(`<text x="${x(ts).toFixed(1)}" y="${height - 8}" text-anchor="${anchor}" font-size="10" fill="var(--text-muted)" font-family="var(--font-sans, sans-serif)">${label}</text>`);
  }

  // 成绩线:2px 品牌金;单点不画线只画点
  const lineMarkup = points.length >= 2
    ? `<polyline points="${points.map((p) => `${x(p.dateTs).toFixed(1)},${y(p.seconds).toFixed(1)}`).join(' ')}" fill="none" stroke="var(--color-secondary)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />`
    : '';

  // 点:ts-dot 类着色(与 badge 六色一致,深色模式 CSS 加亮);
  // AAAA 加大一号(AA/AAAA 琥珀系对比弱,尺寸做二次编码);
  // 同日多点组内 ±3px 抖动;透明 r=10 hit-target 挂 <title>
  const byDate = new Map();
  points.forEach((p) => {
    const arr = byDate.get(p.dateTs) || [];
    arr.push(p);
    byDate.set(p.dateTs, arr);
  });
  const pointMarkup = [];
  for (const [ts, group] of byDate) {
    group.forEach((p, i) => {
      let px = x(ts);
      if (group.length > 1) px += (i - (group.length - 1) / 2) * 6;
      const std = p.timeStandard ? String(p.timeStandard).toUpperCase() : '';
      const cls = `ts-dot ${getTimeStandardClass(std) || 'ts-none'}`;
      const r = std === 'AAAA' ? 5.5 : 4.5;
      const title = escapeHtml(buildTrendTooltip(p));
      pointMarkup.push(`
        <circle class="${cls}" cx="${px.toFixed(1)}" cy="${y(p.seconds).toFixed(1)}" r="${r}" />
        <circle cx="${px.toFixed(1)}" cy="${y(p.seconds).toFixed(1)}" r="10" fill="transparent" style="cursor:pointer;">
          <title>${title}</title>
        </circle>`);
    });
  }

  // 标准线层(未来):按阈值升序画 6% 色带 + 虚线 + 右侧级别标签
  let levelMarkup = '';
  if (Array.isArray(levelLines) && levelLines.length > 0) {
    const sorted = [...levelLines].sort((a, b) => a.thresholdSeconds - b.thresholdSeconds);
    let prevY = null;
    for (const l of sorted) {
      const ly = y(l.thresholdSeconds);
      if (prevY != null) {
        levelMarkup += `<rect x="${margin.left}" y="${ly.toFixed(1)}" width="${plotW}" height="${(prevY - ly).toFixed(1)}" fill="${l.color}" fill-opacity="0.06" />`;
      }
      levelMarkup += `
        <line x1="${margin.left}" x2="${width - margin.right}" y1="${ly.toFixed(1)}" y2="${ly.toFixed(1)}" stroke="${l.color}" stroke-width="1.2" stroke-dasharray="5 4" />
        <text x="${width - margin.right - 4}" y="${(ly + 3).toFixed(1)}" text-anchor="end" font-size="9" fill="var(--text-muted)" font-family="var(--font-sans, sans-serif)">${escapeHtml(String(l.level))}</text>`;
      prevY = ly;
    }
  }

  return `
    <svg class="trend-chart-svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Swim time trend chart for ${escapeHtml(String(points[0]?.course || ''))}">
      <text x="${margin.left}" y="${margin.top - 4}" font-size="9" fill="var(--text-muted)" font-family="var(--font-sans, sans-serif)">faster ↑</text>
      ${levelMarkup}
      ${yTickMarkup}
      ${lineMarkup}
      ${pointMarkup}
      ${xTickMarkup}
    </svg>`;
}

// ── Render Swimmer Results (coach view) ──

// 解析 meet 的开始日期时间戳(用于 season 内排序)。
// meetDates 两种格式:生产 "Feb 24 - Feb 25"(无年份)与 mock "2026-05-01"(ISO)。
// 无年份时用 season 推断:赛季 "YYYY1/YYYY2"(或 "YYYY1-YYYY2")。
// 赛季定义:9 月 1 日 - 次年 8 月 31 日(教练确认)。
// 因此月份 ≥ 9 属起始年(新赛季开始),月份 ≤ 8 属结束年(赛季收尾,
// 如 2025/2026 的 8 月比赛发生在 2026 年)。
// 解析失败返回 null,调用方回退到字典序比较。
function parseMeetStartDate(meet) {
  const dates = meet.meetDates || '';
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(dates);
  if (iso) return new Date(+iso[1], +iso[2] - 1, +iso[3]).getTime();
  const d = /^([A-Za-z]{3}) (\d{1,2})/.exec(dates); // 如 "Feb 24 - Feb 25" → 取第一个
  const seasonMatch = /^(\d{4})\s*[/-]\s*(\d{4})/.exec(meet.season || '');
  if (!d || !seasonMatch) return null;
  const monthAbbr = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
  const month = monthAbbr[d[1]];
  if (!month) return null;
  const y1 = +seasonMatch[1];
  const y2 = +seasonMatch[2];
  const year = month >= 9 ? y1 : y2;
  return new Date(year, month - 1, +d[2]).getTime();
}

function groupMeetsBySeason(meets) {
  const seasons = {};
  for (const [meetId, meet] of Object.entries(meets)) {
    const season = meet.season || 'Unknown';
    if (!seasons[season]) seasons[season] = [];
    seasons[season].push({ meetId, ...meet });
  }
  // Sort seasons descending, meets within season descending by date
  const sorted = {};
  for (const season of Object.keys(seasons).sort().reverse()) {
    sorted[season] = seasons[season].sort((a, b) => {
      const da = parseMeetStartDate(a);
      const db = parseMeetStartDate(b);
      if (da != null && db != null) return db - da; // 最新在前
      // 解析失败(未知格式)回退:字典序倒序
      return (b.meetDates || '').localeCompare(a.meetDates || '');
    });
  }
  return sorted;
}

// 只保留 status==='ok' 的场次(家庭端用 — 抓取失败的场次对家长是噪音)。
// 状态回退约定与 buildTrendData 逐字一致,否则旧数据(无 status 字段)会被漏滤。
function filterOkMeets(meets) {
  const out = {};
  for (const [meetId, meet] of Object.entries(meets || {})) {
    const st = meet.status || (Array.isArray(meet.swims) && meet.swims.length ? 'ok' : 'empty');
    if (st === 'ok') out[meetId] = meet;
  }
  return out;
}

function renderBestTimesTable(bestTimes, emptyText = 'No best times recorded.') {
  if (!bestTimes || bestTimes.length === 0) {
    return `<p style="color:var(--text-muted);text-align:center;padding:1rem;">${escapeHtml(emptyText)}</p>`;
  }

  // Sort by stroke then distance
  const sorted = [...bestTimes].sort((a, b) => {
    if (a.strokeAbbreviation !== b.strokeAbbreviation) {
      return (a.strokeAbbreviation || '').localeCompare(b.strokeAbbreviation || '');
    }
    return (a.distance || 0) - (b.distance || 0);
  });

  return `
    <div class="roster-table-wrapper" style="max-height: 400px; overflow-y: auto;">
      <table style="width:100%;border-collapse:collapse;font-size:0.85rem;">
        <thead>
          <tr style="border-bottom:2px solid var(--border-color);color:var(--text-muted);">
            <th style="padding:0.5rem;text-align:left;">Event</th>
            <th style="padding:0.5rem;text-align:left;">Best Time</th>
            <th style="padding:0.5rem;text-align:left;">Course</th>
          </tr>
        </thead>
        <tbody>
          ${sorted.map(t => `
            <tr style="border-bottom:1px solid var(--border-color);">
              <td style="padding:0.4rem 0.5rem;">${t.distance || ''} ${t.strokeName || t.stroke || t.strokeAbbreviation || ''}</td>
              <td style="padding:0.4rem 0.5rem;font-weight:600;font-family:monospace;">${formatSwimTime(t.swimTime ?? t.bestTime)}</td>
              <td style="padding:0.4rem 0.5rem;">${getCourseLabel(t.courseCode)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderMeetHistory(meets, emptyText = 'No meet history recorded.') {
  if (!meets || Object.keys(meets).length === 0) {
    return `<p style="color:var(--text-muted);text-align:center;padding:1rem;">${escapeHtml(emptyText)}</p>`;
  }

  const grouped = groupMeetsBySeason(meets);

  let html = '';
  for (const [season, seasonMeets] of Object.entries(grouped)) {
    const seasonId = `season-${season.replace(/[^a-zA-Z0-9]/g, '-')}`;
    html += `
      <div style="margin-bottom: 0.75rem;">
        <button class="btn btn-outline btn-sm season-toggle" data-season="${escapeHtml(seasonId)}"
                style="width:100%;text-align:left;font-weight:600;display:flex;justify-content:space-between;align-items:center;">
          <span>📅 ${escapeHtml(season)} Season (${seasonMeets.length} meet${seasonMeets.length > 1 ? 's' : ''})</span>
          <span class="season-arrow" id="arrow-${escapeHtml(seasonId)}">▶</span>
        </button>
        <div class="season-meets" id="${escapeHtml(seasonId)}" style="display:none;margin-top:0.5rem;">
          ${seasonMeets.map(meet => {
            const meetId = `meet-${meet.meetId}`;
            return `
              <div style="margin-bottom:0.5rem;border:1px solid var(--border-color);border-radius:var(--radius-sm);overflow:hidden;">
                <button class="btn btn-outline btn-sm meet-toggle" data-meet="${escapeHtml(meetId)}"
                        style="width:100%;text-align:left;display:flex;justify-content:space-between;align-items:center;padding:0.5rem 0.75rem;border:none;border-radius:0;">
                  <span>🏁 ${escapeHtml(meet.meetName)} <span style="color:var(--text-muted);font-size:0.8rem;">${escapeHtml(meet.courseCode || '')}</span></span>
                  <span style="font-size:0.75rem;color:var(--text-muted);">
                    ${escapeHtml(meet.meetDates || '')} · ${meet.swims?.length || 0} swim${(meet.swims?.length || 0) !== 1 ? 's' : ''}
                    <span class="meet-arrow" id="m-arrow-${escapeHtml(meetId)}">▶</span>
                  </span>
                </button>
                <div class="meet-swims" id="${escapeHtml(meetId)}" style="display:none;">
                  ${meet.swims && meet.swims.length > 0 ? `
                    <table style="width:100%;border-collapse:collapse;font-size:0.8rem;">
                      <thead>
                        <tr style="border-bottom:1px solid var(--border-color);color:var(--text-muted);background:var(--bg-secondary);">
                          <th style="padding:0.35rem 0.5rem;text-align:left;">Event</th>
                          <th style="padding:0.35rem 0.5rem;text-align:left;">Time</th>
                          <th style="padding:0.35rem 0.5rem;text-align:left;">Session</th>
                          <th style="padding:0.35rem 0.5rem;text-align:left;">Place</th>
                          <th style="padding:0.35rem 0.5rem;text-align:left;">Standard</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${meet.swims.map(sw => `
                          <tr style="border-bottom:1px solid var(--border-color);">
                            <td style="padding:0.3rem 0.5rem;">${sw.eventCode || `${sw.distance || ''} ${sw.strokeAbbreviation || ''}`}</td>
                            <td style="padding:0.3rem 0.5rem;font-family:monospace;font-weight:500;">${formatSwimTime(sw.swimTime)}</td>
                            <td style="padding:0.3rem 0.5rem;">${sw.sessionName || '—'}</td>
                            <td style="padding:0.3rem 0.5rem;">${sw.finishPosition != null ? sw.finishPosition : '—'}</td>
                            <td style="padding:0.3rem 0.5rem;">
                              ${sw.timeStandard ? `<span class="ts-badge ${getTimeStandardClass(sw.timeStandard)}">${escapeHtml(sw.timeStandard)}</span>` : '—'}
                            </td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  ` : '<p style="padding:0.5rem;color:var(--text-muted);font-size:0.8rem;">No swim data for this meet.</p>'}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }
  return html;
}

// opts 供家庭端复用:{ swimmerMeta, showDebug, onlyOkMeets, texts }。
// 缺省 = 教练端现有行为(逐字一致),教练端调用处零改动。
async function loadAthleteResults(memberId, opts = {}) {
  const { swimmerMeta = null, showDebug = true, onlyOkMeets = false, texts = {} } = opts;
  const T = {
    loading: texts.loading || '⏳ Loading...',
    noData: texts.noData || 'No results data yet. Run a fetch first.',
    bestTimesEmpty: texts.bestTimesEmpty || 'No best times recorded.',
    meetHistoryEmpty: texts.meetHistoryEmpty || 'No meet history recorded.',
  };
  const viewer = document.getElementById('results-viewer');
  const content = document.getElementById('results-content');
  if (!viewer || !content) return;

  viewer.style.display = 'block';
  content.innerHTML = `<p style="text-align:center;padding:2rem;color:var(--text-muted);">${T.loading}</p>`;

  try {
    // mock 模式读内存 store(真实模式读 Firestore),两者产出同构的
    // { bestTimes, meets, lastUpdated } — 此前无条件读真实库导致 mock 下看板为空
    let data;
    if (MOCK_MODE) {
      mockSeed(memberId);
      data = mockStore.get(memberId) || { meets: {}, bestTimes: [] };
    } else {
      const snap = await getDoc(doc(db, 'swimResults', memberId));
      if (!snap.exists()) {
        content.innerHTML = `<p style="text-align:center;padding:2rem;color:var(--text-muted);">${T.noData}</p>`;
        return;
      }
      data = snap.data();
    }
    console.log('[Results] Loaded data for', memberId, ':', data);
    console.log('[Results] bestTimes:', data.bestTimes?.length, 'meets:', Object.keys(data.meets || {}).length);

    // 趋势区:仅当有可画事件时显示;默认选点数最多的事件并立即渲染。
    // 数据已在内存(getDoc 结果),换事件只重渲染图,不重新请求。
    const eventOptions = buildEventOptions(data.meets);
    // 运动员元数据(dob/gender)供标准线层用;声明在块外 — change handler 也要引用。
    // 优先级:显式参数(家庭端)> mock 查找 > 教练端全量查询(家庭端 allRegistrations 不监听,恒空)。
    const swimmer = swimmerMeta || (MOCK_MODE
      ? (MOCK_SWIMMERS.find((s) => s.usaSwimmingId === memberId) || null)
      : (getSwimmersWithUsaId().find((s) => s.usaSwimmingId === memberId) || null));
    let trendSection = '';
    if (eventOptions.length > 0) {
      const defaultKey = [...eventOptions].sort((a, b) => b.count - a.count)[0].key;
      const initial = buildTrendData(data.meets, defaultKey);
      // 标准线层:运动员 dob/gender 决定年龄组;无 dob/gender → null → 不画线
      const levelLines = trendLevelLines(initial.points, defaultKey, swimmer);
      const lastTs = initial.points.length ? initial.points[initial.points.length - 1].dateTs : null;
      const lastAge = ageAtDate(swimmer?.dob, lastTs);
      const levelCaption = (lastAge != null && levelLines)
        ? `<span style="font-size:0.8rem;color:var(--text-muted);margin-left:auto;">Level lines: ${ageGroupForAge(lastAge)} · ${swimmer.gender ? String(swimmer.gender)[0].toUpperCase() : '?'}</span>`
        : '';
      trendSection = `
      <div style="margin-top:1.5rem;">
        <h4 style="margin:0 0 0.75rem 0;">📈 Performance Trend</h4>
        <div style="display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap;margin-bottom:0.5rem;">
          <select id="trend-event-select" class="form-input" style="max-width:260px;">
            ${eventOptions.map(o => `<option value="${escapeHtml(o.key)}" ${o.key === defaultKey ? 'selected' : ''}>${escapeHtml(o.label)} (${o.count})</option>`).join('')}
          </select>
          <span id="trend-event-count" style="font-size:0.8rem;color:var(--text-muted);">${initial.count} swim${initial.count === 1 ? '' : 's'}</span>
          ${levelCaption}
        </div>
        <div class="trend-legend">${trendLegendMarkup()}</div>
        <div class="trend-chart" id="trend-chart">${renderTrendChart(initial.points, levelLines)}</div>
      </div>`;
    }

    // 家庭端(onlyOkMeets)只展示抓取成功的场次,计数同步用过滤后的数量
    const meetsForHistory = onlyOkMeets ? filterOkMeets(data.meets) : (data.meets || {});
    content.innerHTML = `
      <div style="margin-bottom:1.5rem;">
        <h4 style="margin:0 0 0.75rem 0;display:flex;align-items:center;gap:0.5rem;">
          🏆 Best Times (${(data.bestTimes || []).length} entries)
          <span style="font-size:0.75rem;color:var(--text-muted);font-weight:400;">
            Last updated: ${data.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : '—'}
          </span>
        </h4>
        ${renderBestTimesTable(data.bestTimes, T.bestTimesEmpty)}
      </div>

      <div>
        <h4 style="margin:0 0 0.75rem 0;">📅 Meet History (${Object.keys(meetsForHistory).length} meets)</h4>
        <div id="meet-history-container">
          ${renderMeetHistory(meetsForHistory, T.meetHistoryEmpty)}
        </div>
      </div>

      ${trendSection}

      ${showDebug ? `
      <details style="margin-top:1.5rem;border-top:1px solid var(--border-color);padding-top:1rem;">
        <summary style="cursor:pointer;color:var(--text-muted);font-size:0.8rem;">🔍 Debug: Raw JSON</summary>
        <pre style="background:var(--bg-primary);border:1px solid var(--border-color);border-radius:var(--radius-sm);padding:0.75rem;max-height:400px;overflow:auto;font-size:0.7rem;line-height:1.4;margin-top:0.5rem;">${escapeHtml(JSON.stringify(data, null, 2))}</pre>
      </details>
      ` : ''}
    `;

    // Bind expand/collapse for seasons and meets
    content.querySelectorAll('.season-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const seasonId = btn.dataset.season;
        const panel = document.getElementById(seasonId);
        const arrow = document.getElementById('arrow-' + seasonId);
        if (!panel) return;
        const isOpen = panel.style.display !== 'none';
        panel.style.display = isOpen ? 'none' : 'block';
        if (arrow) arrow.textContent = isOpen ? '▶' : '▼';
      });
    });

    content.querySelectorAll('.meet-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const meetId = btn.dataset.meet;
        const panel = document.getElementById(meetId);
        const arrow = document.getElementById('m-arrow-' + meetId);
        if (!panel) return;
        const isOpen = panel.style.display !== 'none';
        panel.style.display = isOpen ? 'none' : 'block';
        if (arrow) arrow.textContent = isOpen ? '▶' : '▼';
      });
    });

    // Trend event selector — 换事件只重渲染图(数据已在内存,无新请求)
    document.getElementById('trend-event-select')?.addEventListener('change', (e) => {
      const chartEl = document.getElementById('trend-chart');
      const countEl = document.getElementById('trend-event-count');
      if (!chartEl) return;
      const res = buildTrendData(data.meets, e.target.value);
      chartEl.innerHTML = renderTrendChart(res.points, trendLevelLines(res.points, e.target.value, swimmer));
      if (countEl) countEl.textContent = `${res.count} swim${res.count === 1 ? '' : 's'}`;
    });

  } catch (err) {
    content.innerHTML = `<p style="text-align:center;padding:2rem;color:var(--color-accent);">Failed to load results: ${escapeHtml(err.message)}</p>`;
    console.error('loadAthleteResults:', err);
  }
}

// ══════════════════════════════════════════════

function renderCoachOverview() {
  const activeSwimmers = getCoachActiveSwimmers();
  const newRegistrations = getCoachRecentRegistrations();
  const upcomingMeets = swimMeets.filter(m => m.status !== 'Completed');

  return `
    <div class="dash-stats-row">
      <div class="dash-stat-card">
        <div class="dash-stat-number">${activeSwimmers.length}</div>
        <div class="dash-stat-label">${t('dash_coach_active_athletes')}</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${newRegistrations.length}</div>
        <div class="dash-stat-label">${t('dash_coach_new_registrations')}</div>
      </div>
      <div class="dash-stat-card accent">
        <div class="dash-stat-number">${upcomingMeets.length}</div>
        <div class="dash-stat-label">${t('dash_coach_upcoming_meets')}</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${allRegistrations.length}</div>
        <div class="dash-stat-label">${t('dash_coach_registered_families')}</div>
      </div>
    </div>

    <div class="dash-overview-grid">
      <div class="dash-panel">
        <h3 class="dash-panel-title">${t('dash_coach_top_athletes')}</h3>
        <div class="dash-panel-body">
          ${activeSwimmers.length === 0 ? `<p class="dash-empty">${t('dash_coach_no_swimmers')}</p>` :
          activeSwimmers.slice(0, 5).map(s => `
            <div class="dash-mini-card">
               <div class="dash-mini-top">
                <span class="dash-mini-name">${[s.firstName, s.lastName].filter(Boolean).join(' ')}</span>
                <span class="badge badge-primary">${s.parentName}</span>
              </div>
              <div class="dash-mini-meta">${s.gender || '—'} · Age: ${s.dob ? Math.floor((new Date() - new Date(s.dob)) / (365.25 * 24 * 60 * 60 * 1000)) : '—'}</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="dash-panel">
        <h3 class="dash-panel-title">${t('dash_coach_recent_registrations')}</h3>
        <div class="dash-panel-body">
          ${newRegistrations.length === 0 ? `<p class="dash-empty">${t('dash_coach_no_recent')}</p>` :
          newRegistrations.slice(0, 5).map(r => `
            <div class="dash-mini-card">
              <div class="dash-mini-top"><span class="dash-mini-name">${getParentNameFromReg(r)}</span></div>
              <div class="dash-mini-meta">${r.swimmers ? r.swimmers.filter(s => !s.deleted).length : 0} swimmer(s)</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderCoachRoster() {
  const activeSwimmers = getCoachActiveSwimmers();
  const isAdmin = dbRole === 'admin';

  // Column headers vary by role
  const headerCells = isAdmin
    ? `<tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
        <th style="padding: 0.5rem;">${t('dash_coach_roster_name')}</th>
        <th style="padding: 0.5rem;">${t('dash_coach_roster_age')}</th>
        <th style="padding: 0.5rem;">${t('dash_coach_roster_gender')}</th>
        <th style="padding: 0.5rem;">${t('dash_coach_roster_pmt1_amt')}</th>
        <th style="padding: 0.5rem;">${t('dash_coach_roster_pmt1_date')}</th>
        <th style="padding: 0.5rem;">${t('dash_coach_roster_pmt2_amt')}</th>
        <th style="padding: 0.5rem;">${t('dash_coach_roster_pmt2_date')}</th>
        <th style="padding: 0.5rem;">${t('dash_coach_roster_pmt3_amt')}</th>
        <th style="padding: 0.5rem;">${t('dash_coach_roster_pmt3_date')}</th>
      </tr>`
    : `<tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
        <th style="padding: 1rem;">${t('dash_coach_roster_name')}</th>
        <th style="padding: 1rem;">${t('dash_coach_roster_parent')}</th>
        <th style="padding: 1rem;">${t('dash_coach_roster_age')}</th>
        <th style="padding: 1rem;">${t('dash_coach_roster_gender')}</th>
        <th style="padding: 1rem;">${t('dash_coach_roster_usa_id')}</th>
      </tr>`;

  // Helper to get payment value for current season
  function pval(s, field) {
    const payments = s.payments || {};
    const seasonData = payments[currentSeason] || {};
    return seasonData[field] != null ? seasonData[field] : '';
  }

  const inputStyle = 'width: 95%; padding: 0.3rem 0.35rem; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-primary); color: var(--text-primary); font-size: 0.75rem;';

  return `
    <div class="dash-panel">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.75rem;">
        <h3 class="dash-panel-title" style="margin-bottom: 0; border-bottom: none; padding-bottom: 0;">${t('dash_coach_roster_title')} (${activeSwimmers.length} athletes)</h3>
        ${renderSeasonSelectorRoster(currentSeason)}
      </div>
      <div class="dash-panel-body">
        ${activeSwimmers.length === 0 ? `<p class="dash-empty">${t('dash_coach_no_swimmers')}</p>` : `
        <div class="roster-table-wrapper" style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.8rem; min-width: ${isAdmin ? '950px' : 'auto'};">
          <thead>${headerCells}</thead>
          <tbody>
            ${activeSwimmers.map(s => {
              const age = s.dob ? Math.floor((new Date() - new Date(s.dob)) / (365.25 * 24 * 60 * 60 * 1000)) : '—';

              if (isAdmin) {
                return `
                  <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 0.4rem 0.5rem; font-weight: 500; white-space: nowrap;">${[s.firstName, s.lastName].filter(Boolean).join(' ')}</td>
                    <td style="padding: 0.4rem 0.5rem;">${age}</td>
                    <td style="padding: 0.4rem 0.5rem;">${s.gender || '—'}</td>
                    <td style="padding: 0.2rem 0.3rem;">
                      <input type="number" step="0.01" min="0"
                        class="roster-pmt-input"
                        data-reg-id="${s._regId}"
                        data-swimmer-index="${s._swimmerIndex}"
                        data-field="amount1"
                        data-season="${currentSeason}"
                        value="${pval(s, 'amount1')}"
                        onchange="window.__updateSwimmerPayment(this)"
                        placeholder="0.00"
                        style="${inputStyle}" />
                    </td>
                    <td style="padding: 0.2rem 0.3rem;">
                      <input type="date"
                        class="roster-pmt-input"
                        data-reg-id="${s._regId}"
                        data-swimmer-index="${s._swimmerIndex}"
                        data-field="date1"
                        data-season="${currentSeason}"
                        value="${pval(s, 'date1')}"
                        onchange="window.__updateSwimmerPayment(this)"
                        style="${inputStyle}" />
                    </td>
                    <td style="padding: 0.2rem 0.3rem;">
                      <input type="number" step="0.01" min="0"
                        class="roster-pmt-input"
                        data-reg-id="${s._regId}"
                        data-swimmer-index="${s._swimmerIndex}"
                        data-field="amount2"
                        data-season="${currentSeason}"
                        value="${pval(s, 'amount2')}"
                        onchange="window.__updateSwimmerPayment(this)"
                        placeholder="0.00"
                        style="${inputStyle}" />
                    </td>
                    <td style="padding: 0.2rem 0.3rem;">
                      <input type="date"
                        class="roster-pmt-input"
                        data-reg-id="${s._regId}"
                        data-swimmer-index="${s._swimmerIndex}"
                        data-field="date2"
                        data-season="${currentSeason}"
                        value="${pval(s, 'date2')}"
                        onchange="window.__updateSwimmerPayment(this)"
                        style="${inputStyle}" />
                    </td>
                    <td style="padding: 0.2rem 0.3rem;">
                      <input type="number" step="0.01" min="0"
                        class="roster-pmt-input"
                        data-reg-id="${s._regId}"
                        data-swimmer-index="${s._swimmerIndex}"
                        data-field="amount3"
                        data-season="${currentSeason}"
                        value="${pval(s, 'amount3')}"
                        onchange="window.__updateSwimmerPayment(this)"
                        placeholder="0.00"
                        style="${inputStyle}" />
                    </td>
                    <td style="padding: 0.2rem 0.3rem;">
                      <input type="date"
                        class="roster-pmt-input"
                        data-reg-id="${s._regId}"
                        data-swimmer-index="${s._swimmerIndex}"
                        data-field="date3"
                        data-season="${currentSeason}"
                        value="${pval(s, 'date3')}"
                        onchange="window.__updateSwimmerPayment(this)"
                        style="${inputStyle}" />
                    </td>
                  </tr>
                `;
              } else {
                return `
                  <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 1rem; font-weight: 500;">${[s.firstName, s.lastName].filter(Boolean).join(' ')}</td>
                    <td style="padding: 1rem;">${s.parentName}</td>
                    <td style="padding: 1rem;">${age}</td>
                    <td style="padding: 1rem;">${s.gender || '—'}</td>
                    <td style="padding: 1rem;">${s.usaSwimmingId || '—'}</td>
                  </tr>
                `;
              }
            }).join('')}
          </tbody>
        </table>
        </div>
        ${isAdmin ? `<p class="roster-payment-note">${t('dash_coach_roster_payment_note')}</p>` : ''}
        `}
      </div>
    </div>
  `;
}

// ── Fee Summary Tab ──

/**
 * Aggregate meet entry fees across meets for the given season and match with deposits.
 * Returns a sorted array of swimmer fee summary objects.
 */
function buildFeeSummaryData(season) {
  const normalize = (name) => (name || '').trim().toLowerCase().replace(/\s+/g, ' ');

  // Compute deposit total from the new schema: balance + d1 + d2 + d3
  const depositTotal = (d) => (Number(d.balance) || 0) + (Number(d.deposit1Amount) || 0) + (Number(d.deposit2Amount) || 0) + (Number(d.deposit3Amount) || 0);

  // Aggregate fee data from meets in the selected season
  const feeMap = new Map();

  for (const meet of swimMeets) {
    if (meet.season && meet.season !== season) continue; // filter by season
    const fd = meet.feeData;
    if (!fd || !fd.swimmers || fd.swimmers.length === 0) continue;

    for (const sw of fd.swimmers) {
      const key = normalize(sw.name);
      if (!key) continue;

      const existing = feeMap.get(key);
      const fee = Number(sw.total) || 0;
      if (existing) {
        existing.totalFee += fee;
        existing.meetCount += 1;
        existing.meets.push({ meetName: meet.name || 'Unnamed Meet', total: fee });
        if (sw.name.trim().length > existing.displayName.length) {
          existing.displayName = sw.name.trim();
        }
      } else {
        feeMap.set(key, {
          displayName: sw.name.trim(),
          totalFee: fee,
          meetCount: 1,
          meets: [{ meetName: meet.name || 'Unnamed Meet', total: fee }],
        });
      }
    }
  }

  // Build deposit map for the selected season
  const depositMap = new Map();
  for (const d of deposits) {
    if (d.season && d.season !== season) continue; // filter by season
    const key = normalize(d.swimmerName);
    if (!key) continue;
    depositMap.set(key, { id: d.id, total: depositTotal(d) });
  }

  // Merge fee and deposit data
  const result = [];

  for (const [key, feeData] of feeMap) {
    const dep = depositMap.get(key) || { id: null, total: 0 };
    result.push({
      normalizedName: key,
      displayName: feeData.displayName,
      totalFee: feeData.totalFee,
      deposit: dep.total,
      depositId: dep.id,
      balance: dep.total - feeData.totalFee,
      meetCount: feeData.meetCount,
      meets: feeData.meets,
    });
    depositMap.delete(key);
  }

  // Swimmers with deposits but no fees yet in this season
  for (const [key, dep] of depositMap) {
    const origDep = deposits.find(d => normalize(d.swimmerName) === key && d.season === season);
    result.push({
      normalizedName: key,
      displayName: origDep ? origDep.swimmerName : key,
      totalFee: 0,
      deposit: dep.total,
      depositId: dep.id,
      balance: dep.total,
      meetCount: 0,
      meets: [],
    });
  }

  // Sort: negative balances first, then by name
  result.sort((a, b) => {
    if (a.balance < 0 && b.balance >= 0) return -1;
    if (a.balance >= 0 && b.balance < 0) return 1;
    return a.displayName.localeCompare(b.displayName);
  });

  return result;
}

function renderFeeSummary() {
  const summary = buildFeeSummaryData(currentSeason);
  const totalFees = summary.reduce((sum, s) => sum + s.totalFee, 0);
  const totalDeposits = summary.reduce((sum, s) => sum + s.deposit, 0);
  const negativeCount = summary.filter(s => s.balance < 0).length;

  const fmt = (n) => '$' + Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const hasData = summary.length > 0;

  return `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem;">
      ${renderSeasonSelector(currentSeason)}
      <a class="btn btn-outline btn-sm" id="goto-deposits-link" style="text-decoration: none;">🏦 Manage Deposits</a>
      <button class="btn btn-outline btn-sm" id="fee-summary-export-btn">📥 Export CSV</button>
    </div>

    <div class="dash-stats-row">
      <div class="dash-stat-card">
        <div class="dash-stat-number">${summary.length}</div>
        <div class="dash-stat-label">${t('dash_fee_summary_total_swimmers')}</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${fmt(totalFees)}</div>
        <div class="dash-stat-label">${t('dash_fee_summary_total_fees')}</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${fmt(totalDeposits)}</div>
        <div class="dash-stat-label">${t('dash_fee_summary_total_deposits')}</div>
      </div>
      <div class="dash-stat-card ${negativeCount > 0 ? 'accent' : ''}">
        <div class="dash-stat-number" style="${negativeCount > 0 ? 'color: var(--color-accent);' : ''}">${negativeCount}</div>
        <div class="dash-stat-label">${t('dash_fee_summary_negative_count')}</div>
      </div>
    </div>

    ${!hasData ? `
      <div class="dash-panel" style="text-align: center; padding: 3rem 2rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">📊</div>
        <p style="color: var(--text-secondary); max-width: 500px; margin: 0 auto;">${t('dash_fee_summary_no_fees')}</p>
      </div>
    ` : `
      <div class="dash-panel">
        <div class="fee-summary-table-wrapper">
          <table class="fee-summary-table">
            <thead>
              <tr>
                <th style="width: 28px;"></th>
                <th>${t('dash_fee_summary_name')}</th>
                <th>${t('dash_fee_summary_deposit')}</th>
                <th>${t('dash_fee_summary_total_fee')}</th>
                <th>${t('dash_fee_summary_meets')}</th>
                <th>${t('dash_fee_summary_balance')}</th>
              </tr>
            </thead>
            <tbody>
              ${summary.map((s, idx) => `
                <tr class="fee-summary-main-row fee-summary-row ${s.balance < 0 ? 'fee-summary-negative' : ''}"
                    data-fee-index="${idx}" ${s.meets && s.meets.length > 0 ? 'title="Click to see meet details"' : ''}>
                  <td><span class="fee-summary-expand-icon">${s.meets && s.meets.length > 0 ? '▶' : ''}</span></td>
                  <td class="fee-summary-name">${escapeHtml(s.displayName)}</td>
                  <td>${fmt(s.deposit)}</td>
                  <td>${fmt(s.totalFee)}</td>
                  <td>${s.meetCount}</td>
                  <td class="fee-summary-balance" style="font-weight: 700; ${s.balance < 0 ? 'color: var(--color-accent);' : 'color: #16A34A;'}">${fmt(s.balance)}</td>
                </tr>
                ${s.meets && s.meets.length > 0 ? `
                <tr class="fee-summary-detail-row" data-fee-detail="${idx}">
                  <td colspan="6" class="fee-summary-detail-cell">
                    <table class="fee-summary-mini-table">
                      ${s.meets.map(m => `
                        <tr>
                          <td class="mini-meet-name">${escapeHtml(m.meetName)}</td>
                          <td class="mini-meet-fee">${fmt(m.total)}</td>
                        </tr>
                      `).join('')}
                      <tr class="mini-meet-total">
                        <td>${t('dash_fee_summary_total_fee')}</td>
                        <td class="mini-meet-fee">${fmt(s.totalFee)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ` : ''}
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `}
  `;
}

// ── Deposits Tab ──

function getDepositsForSeason(season) {
  return deposits
    .filter(d => d.season === season)
    .sort((a, b) => (a.swimmerName || '').localeCompare(b.swimmerName || ''));
}

function calcDepositTotal(d) {
  return (Number(d.balance) || 0) + (Number(d.deposit1Amount) || 0) + (Number(d.deposit2Amount) || 0) + (Number(d.deposit3Amount) || 0);
}

function renderDeposits() {
  const seasonDeposits = getDepositsForSeason(currentSeason);
  const fmt = (n) => n != null ? '$' + Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';
  const fmtDate = (d) => d || '—';

  const hasData = seasonDeposits.length > 0;

  return `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem;">
      ${renderSeasonSelectorDeposits(currentSeason)}
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <button class="btn btn-outline btn-sm" id="deposits-upload-balance-btn">📤 Upload Carry-over Balance</button>
        <button class="btn btn-outline btn-sm" id="deposits-upload-detail-btn">📤 Upload Deposits</button>
        <button class="btn btn-outline btn-sm" id="deposits-export-btn">📥 Export CSV</button>
      </div>
    </div>

    ${!hasData ? `
      <div class="dash-panel" style="text-align: center; padding: 3rem 2rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🏦</div>
        <p style="color: var(--text-secondary);">
          No deposit records for ${escapeHtml(currentSeason)}.<br>
          Upload an Excel file or add swimmers below.
        </p>
      </div>
    ` : `
      <div class="dash-panel">
        <div class="deposits-table-wrapper">
          <table class="deposits-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Balance</th>
                <th>Deposit 1</th>
                <th>Date 1</th>
                <th>Deposit 2</th>
                <th>Date 2</th>
                <th>Deposit 3</th>
                <th>Date 3</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${seasonDeposits.map(d => {
                const total = calcDepositTotal(d);
                const rowId = 'dep-row-' + d.id;
                return `
                <tr id="${rowId}" class="deposits-row">
                  <td class="deposits-name">${escapeHtml(d.swimmerName)}</td>
                  <td class="deposits-balance">
                    <span class="dep-view">${fmt(d.balance)}</span>
                    <input class="dep-edit-field dep-input" type="number" value="${d.balance || 0}" step="0.01" style="display:none; width: 90px;" />
                  </td>
                  <td class="deposits-d1amt">
                    <span class="dep-view">${fmt(d.deposit1Amount)}</span>
                    <input class="dep-edit-field dep-input" type="number" value="${d.deposit1Amount || ''}" step="0.01" style="display:none; width: 90px;" />
                  </td>
                  <td class="deposits-d1date">
                    <span class="dep-view">${fmtDate(d.deposit1Date)}</span>
                    <input class="dep-edit-field dep-input" type="date" value="${d.deposit1Date || ''}" style="display:none; width: 130px;" />
                  </td>
                  <td class="deposits-d2amt">
                    <span class="dep-view">${fmt(d.deposit2Amount)}</span>
                    <input class="dep-edit-field dep-input" type="number" value="${d.deposit2Amount || ''}" step="0.01" style="display:none; width: 90px;" />
                  </td>
                  <td class="deposits-d2date">
                    <span class="dep-view">${fmtDate(d.deposit2Date)}</span>
                    <input class="dep-edit-field dep-input" type="date" value="${d.deposit2Date || ''}" style="display:none; width: 130px;" />
                  </td>
                  <td class="deposits-d3amt">
                    <span class="dep-view">${fmt(d.deposit3Amount)}</span>
                    <input class="dep-edit-field dep-input" type="number" value="${d.deposit3Amount || ''}" step="0.01" style="display:none; width: 90px;" />
                  </td>
                  <td class="deposits-d3date">
                    <span class="dep-view">${fmtDate(d.deposit3Date)}</span>
                    <input class="dep-edit-field dep-input" type="date" value="${d.deposit3Date || ''}" style="display:none; width: 130px;" />
                  </td>
                  <td class="deposits-total" style="font-weight: 700;">${fmt(total)}</td>
                  <td class="deposits-actions">
                    <button class="deposits-edit-btn" data-id="${d.id}">✎</button>
                    <button class="deposits-save-btn" data-id="${d.id}" style="display:none;">✓</button>
                    <button class="deposits-cancel-btn" data-id="${d.id}" style="display:none;">✕</button>
                    <button class="deposits-delete-btn" data-id="${d.id}" data-name="${escapeHtml(d.swimmerName)}" style="color: var(--color-accent);">&times;</button>
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `}

    <div style="margin-top: 1.5rem;">
      <button class="btn btn-primary btn-sm" id="deposits-add-btn">+ Add Swimmer</button>
    </div>

    <div id="deposits-add-form" class="dash-panel" style="display: none; margin-top: 1rem; padding: 1.5rem;">
      <h3 style="margin-bottom: 1rem;">Add Swimmer Deposit Record</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 1rem; align-items: end;">
        <div class="form-group">
          <label class="form-label">Swimmer Name</label>
          <input type="text" id="deposits-add-name" class="form-input" placeholder="Swimmer name" />
        </div>
        <div class="form-group">
          <label class="form-label">Carry-over Balance ($)</label>
          <input type="number" id="deposits-add-balance" class="form-input" value="0" min="0" step="0.01" />
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-primary btn-sm" id="deposits-add-save">Save</button>
          <button class="btn btn-outline btn-sm" id="deposits-add-cancel">Cancel</button>
        </div>
      </div>
    </div>
  `;
}

function renderSeasonSelectorDeposits(selectedSeason) {
  const options = getSeasonOptions();
  const sel = selectedSeason || currentSeason || getDefaultSeason();
  return `
    <div class="season-selector">
      <label class="season-selector-label">${t('dash_season_label')}:</label>
      <select id="deposits-season-select" class="season-select">
        ${options.map(s => `<option value="${s}" ${s === sel ? 'selected' : ''}>${s}</option>`).join('')}
      </select>
    </div>
  `;
}

function renderSeasonSelectorRoster(selectedSeason) {
  const options = getSeasonOptions();
  const sel = selectedSeason || currentSeason || getDefaultSeason();
  return `
    <div class="season-selector">
      <label class="season-selector-label">${t('dash_season_label')}:</label>
      <select id="roster-season-select" class="season-select">
        ${options.map(s => `<option value="${s}" ${s === sel ? 'selected' : ''}>${s}</option>`).join('')}
      </select>
    </div>
  `;
}

// ── Carry-over Balance Excel Parser ──
async function parseCarryOverExcel(file) {
  const XLSX = window.XLSX;
  if (!XLSX) { alert('Excel parser not loaded.'); return null; }
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
    if (!rows || rows.length < 2) return { valid: [], errors: [{ rowNum: 1, reason: 'File has no data rows.' }] };

    let nameCol = -1, balanceCol = -1, headerRow = -1;
    for (let r = 0; r < Math.min(10, rows.length); r++) {
      const row = rows[r]; if (!row) continue;
      nameCol = -1; balanceCol = -1;
      for (let c = 0; c < row.length; c++) {
        const cell = String(row[c] || '').toLowerCase().trim();
        if (cell.includes('name') || cell.includes('swimmer')) nameCol = c;
        if (cell.includes('balance')) balanceCol = c;
      }
      if (nameCol >= 0 && balanceCol >= 0) { headerRow = r; break; }
    }
    if (headerRow < 0) return { valid: [], errors: [{ rowNum: 0, reason: 'Expected columns: Name, Balance.' }] };

    const valid = [], errors = [];
    for (let r = headerRow + 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.every(c => c == null || String(c).trim() === '')) continue;
      const name = String(row[nameCol] || '').trim();
      if (!name) { errors.push({ rowNum: r + 1, reason: 'Missing name.' }); continue; }
      const bal = Number(row[balanceCol]);
      if (isNaN(bal) || bal < 0) { errors.push({ rowNum: r + 1, reason: `Invalid balance for "${name}": ${row[balanceCol]}` }); continue; }
      valid.push({ swimmerName: name, balance: bal });
    }
    return { valid, errors };
  } catch (err) { console.error('Error parsing carry-over Excel:', err); return null; }
}

function showCarryOverImportModal(validRows, errors, filename) {
  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.innerHTML = `
    <div class="confirm-modal csv-import-modal">
      <h3 class="confirm-title">Import Carry-over Balance</h3>
      <p class="csv-import-filename">File: <strong>${escapeHtml(filename)}</strong></p>
      <p class="csv-import-summary">${validRows.length} record(s), ${errors.length} error(s)</p>
      <p style="font-size: 0.85rem; color: var(--color-accent); margin-bottom: 0.75rem;">⚠ This will <strong>overwrite</strong> existing balance values for matching swimmers in season <strong>${escapeHtml(currentSeason)}</strong>.</p>
      ${validRows.length > 0 ? `
        <div class="csv-preview-wrapper">
          <table class="csv-preview-table">
            <thead><tr><th>Name</th><th>Balance</th></tr></thead>
            <tbody>${validRows.map(r => `<tr><td>${escapeHtml(r.swimmerName)}</td><td>$${Number(r.balance).toLocaleString(undefined, {minimumFractionDigits:2})}</td></tr>`).join('')}</tbody>
          </table>
        </div>` : ''}
      ${errors.length > 0 ? `<div class="csv-error-block"><p class="csv-error-title">Errors</p>${errors.map(e => `<p class="csv-error-item">Row ${e.rowNum}: ${escapeHtml(e.reason)}</p>`).join('')}</div>` : ''}
      ${validRows.length === 0 ? '<p class="csv-no-valid">No valid records found.</p>' : ''}
      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="carryover-import-cancel">Cancel</button>
        ${validRows.length > 0 ? '<button class="btn btn-primary btn-sm" id="carryover-import-confirm">Import</button>' : ''}
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#carryover-import-cancel').addEventListener('click', () => overlay.remove());
  overlay.querySelector('#carryover-import-confirm')?.addEventListener('click', async () => {
    overlay.remove();
    await importCarryOverRows(validRows);
  });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

async function importCarryOverRows(rows) {
  if (!rows || rows.length === 0) return;
  const normalize = (n) => (n || '').trim().toLowerCase().replace(/\s+/g, ' ');
  try {
    const batch = writeBatch(db);
    // For each uploaded row, find existing deposit doc for this swimmer+season or create new
    for (const row of rows) {
      const existing = deposits.find(d => d.season === currentSeason && normalize(d.swimmerName) === normalize(row.swimmerName));
      if (existing) {
        batch.update(doc(db, 'deposits', existing.id), { balance: Number(row.balance), updatedAt: new Date(), updatedBy: currentUser?.email || 'unknown' });
      } else {
        const newRef = doc(collection(db, 'deposits'));
        batch.set(newRef, {
          swimmerName: row.swimmerName, season: currentSeason, balance: Number(row.balance),
          deposit1Amount: null, deposit1Date: null, deposit2Amount: null, deposit2Date: null, deposit3Amount: null, deposit3Date: null,
          updatedAt: new Date(), updatedBy: currentUser?.email || 'unknown',
        });
      }
    }
    await batch.commit();
    showImportStatus(`Updated balance for ${rows.length} swimmer(s) in ${currentSeason}.`);
  } catch (error) { console.error('Carry-over import failed:', error); showImportStatus('Failed to import: ' + (error.message || ''), true); }
}

// ── Deposit Detail Excel Parser ──
async function parseDepositDetailExcel(file) {
  const XLSX = window.XLSX;
  if (!XLSX) { alert('Excel parser not loaded.'); return null; }
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
    if (!rows || rows.length < 2) return { valid: [], errors: [{ rowNum: 1, reason: 'File has no data rows.' }] };

    // Find header columns: Name, and deposit/amount/date columns
    let nameCol = -1;
    const dCols = {}; // deposit1Amount, deposit1Date, deposit2Amount, deposit2Date, deposit3Amount, deposit3Date
    let headerRow = -1;

    for (let r = 0; r < Math.min(10, rows.length); r++) {
      const row = rows[r]; if (!row) continue;
      let foundName = -1;
      const tempCols = {};
      for (let c = 0; c < row.length; c++) {
        const cell = String(row[c] || '').toLowerCase().trim();
        if (cell.includes('name') || cell.includes('swimmer')) {
          foundName = c;
        } else {
          // Match deposit N amount/date patterns
          if (/deposit\s*1.*amount/i.test(cell) || /d1\s*.*amt/i.test(cell)) tempCols.deposit1Amount = c;
          else if (/deposit\s*1.*date/i.test(cell) || /d1\s*.*date/i.test(cell)) tempCols.deposit1Date = c;
          else if (/deposit\s*2.*amount/i.test(cell) || /d2\s*.*amt/i.test(cell)) tempCols.deposit2Amount = c;
          else if (/deposit\s*2.*date/i.test(cell) || /d2\s*.*date/i.test(cell)) tempCols.deposit2Date = c;
          else if (/deposit\s*3.*amount/i.test(cell) || /d3\s*.*amt/i.test(cell)) tempCols.deposit3Amount = c;
          else if (/deposit\s*3.*date/i.test(cell) || /d3\s*.*date/i.test(cell)) tempCols.deposit3Date = c;
        }
      }
      if (foundName >= 0) { nameCol = foundName; Object.assign(dCols, tempCols); headerRow = r; break; }
    }

    if (headerRow < 0) return { valid: [], errors: [{ rowNum: 0, reason: 'Expected a header row with "Name" column.' }] };

    const valid = [], errors = [];
    for (let r = headerRow + 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.every(c => c == null || String(c).trim() === '')) continue;
      const name = String(row[nameCol] || '').trim();
      if (!name) { errors.push({ rowNum: r + 1, reason: 'Missing name.' }); continue; }

      const record = { swimmerName: name };
      for (const [key, col] of Object.entries(dCols)) {
        if (col >= 0 && col < row.length) {
          const val = row[col];
          if (key.includes('Amount')) record[key] = val != null ? Number(val) : null;
          else record[key] = val ? String(val).trim() : null;
        }
      }
      valid.push(record);
    }
    return { valid, errors };
  } catch (err) { console.error('Error parsing deposit detail Excel:', err); return null; }
}

function showDepositDetailImportModal(validRows, errors, filename) {
  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.innerHTML = `
    <div class="confirm-modal csv-import-modal" style="max-width: 900px;">
      <h3 class="confirm-title">Import Deposit Details</h3>
      <p class="csv-import-filename">File: <strong>${escapeHtml(filename)}</strong></p>
      <p class="csv-import-summary">${validRows.length} record(s), ${errors.length} error(s)</p>
      <p style="font-size: 0.85rem; color: var(--color-accent); margin-bottom: 0.75rem;">⚠ This will <strong>overwrite</strong> existing deposit fields for matching swimmers in season <strong>${escapeHtml(currentSeason)}</strong>.</p>
      ${validRows.length > 0 ? `
        <div class="csv-preview-wrapper" style="max-height: 350px;">
          <table class="csv-preview-table" style="font-size: 0.75rem;">
            <thead><tr><th>Name</th><th>D1 Amt</th><th>D1 Date</th><th>D2 Amt</th><th>D2 Date</th><th>D3 Amt</th><th>D3 Date</th></tr></thead>
            <tbody>${validRows.map(r => `<tr>
              <td>${escapeHtml(r.swimmerName)}</td>
              <td>${r.deposit1Amount != null ? '$' + Number(r.deposit1Amount).toFixed(2) : '—'}</td>
              <td>${r.deposit1Date || '—'}</td>
              <td>${r.deposit2Amount != null ? '$' + Number(r.deposit2Amount).toFixed(2) : '—'}</td>
              <td>${r.deposit2Date || '—'}</td>
              <td>${r.deposit3Amount != null ? '$' + Number(r.deposit3Amount).toFixed(2) : '—'}</td>
              <td>${r.deposit3Date || '—'}</td>
            </tr>`).join('')}</tbody>
          </table>
        </div>` : ''}
      ${errors.length > 0 ? `<div class="csv-error-block"><p class="csv-error-title">Errors</p>${errors.map(e => `<p class="csv-error-item">Row ${e.rowNum}: ${escapeHtml(e.reason)}</p>`).join('')}</div>` : ''}
      ${validRows.length === 0 ? '<p class="csv-no-valid">No valid records found.</p>' : ''}
      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="detail-import-cancel">Cancel</button>
        ${validRows.length > 0 ? '<button class="btn btn-primary btn-sm" id="detail-import-confirm">Import</button>' : ''}
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#detail-import-cancel').addEventListener('click', () => overlay.remove());
  overlay.querySelector('#detail-import-confirm')?.addEventListener('click', async () => {
    overlay.remove();
    await importDepositDetailRows(validRows);
  });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

async function importDepositDetailRows(rows) {
  if (!rows || rows.length === 0) return;
  const normalize = (n) => (n || '').trim().toLowerCase().replace(/\s+/g, ' ');
  try {
    const batch = writeBatch(db);
    for (const row of rows) {
      const existing = deposits.find(d => d.season === currentSeason && normalize(d.swimmerName) === normalize(row.swimmerName));
      const updateData = {
        updatedAt: new Date(),
        updatedBy: currentUser?.email || 'unknown',
      };
      // Only set fields present in the row
      if ('deposit1Amount' in row) updateData.deposit1Amount = row.deposit1Amount;
      if ('deposit1Date' in row) updateData.deposit1Date = row.deposit1Date;
      if ('deposit2Amount' in row) updateData.deposit2Amount = row.deposit2Amount;
      if ('deposit2Date' in row) updateData.deposit2Date = row.deposit2Date;
      if ('deposit3Amount' in row) updateData.deposit3Amount = row.deposit3Amount;
      if ('deposit3Date' in row) updateData.deposit3Date = row.deposit3Date;

      if (existing) {
        batch.update(doc(db, 'deposits', existing.id), updateData);
      } else {
        const newRef = doc(collection(db, 'deposits'));
        batch.set(newRef, {
          swimmerName: row.swimmerName, season: currentSeason, balance: 0,
          deposit1Amount: null, deposit1Date: null, deposit2Amount: null, deposit2Date: null, deposit3Amount: null, deposit3Date: null,
          ...updateData,
        });
      }
    }
    await batch.commit();
    showImportStatus(`Updated deposit details for ${rows.length} swimmer(s) in ${currentSeason}.`);
  } catch (error) { console.error('Deposit detail import failed:', error); showImportStatus('Failed to import: ' + (error.message || ''), true); }
}

// ── Deposits Inline Edit Handlers ──
function bindDepositsInlineEvents() {
  // Edit button
  document.querySelectorAll('.deposits-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('tr');
      toggleDepositsRowEdit(row, true);
    });
  });

  // Save button
  document.querySelectorAll('.deposits-save-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const row = btn.closest('tr');
      if (!id || !row) return;

      const getVal = (selector) => {
        const el = row.querySelector(selector);
        return el ? el.value : null;
      };

      const balance = parseFloat(getVal('.deposits-balance .dep-edit-field')) || 0;
      const d1a = getVal('.deposits-d1amt .dep-edit-field');
      const d1d = getVal('.deposits-d1date .dep-edit-field');
      const d2a = getVal('.deposits-d2amt .dep-edit-field');
      const d2d = getVal('.deposits-d2date .dep-edit-field');
      const d3a = getVal('.deposits-d3amt .dep-edit-field');
      const d3d = getVal('.deposits-d3date .dep-edit-field');

      try {
        await updateDoc(doc(db, 'deposits', id), {
          balance,
          deposit1Amount: d1a ? parseFloat(d1a) : null,
          deposit1Date: d1d || null,
          deposit2Amount: d2a ? parseFloat(d2a) : null,
          deposit2Date: d2d || null,
          deposit3Amount: d3a ? parseFloat(d3a) : null,
          deposit3Date: d3d || null,
          updatedAt: new Date(),
          updatedBy: currentUser?.email || 'unknown',
        });
        // onSnapshot will auto-refresh
      } catch (err) {
        console.error('Error saving deposit:', err);
        alert('Failed to save deposit.');
      }
    });
  });

  // Cancel button
  document.querySelectorAll('.deposits-cancel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('tr');
      toggleDepositsRowEdit(row, false);
    });
  });

  // Delete button
  document.querySelectorAll('.deposits-delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      if (!id) return;
      if (!confirm(`Delete deposit record for ${name}?`)) return;
      try {
        await deleteDoc(doc(db, 'deposits', id));
      } catch (err) {
        console.error('Error deleting deposit:', err);
        alert('Failed to delete deposit.');
      }
    });
  });
}

function toggleDepositsRowEdit(row, editing) {
  if (!row) return;
  const views = row.querySelectorAll('.dep-view');
  const fields = row.querySelectorAll('.dep-edit-field');
  const editBtn = row.querySelector('.deposits-edit-btn');
  const saveBtn = row.querySelector('.deposits-save-btn');
  const cancelBtn = row.querySelector('.deposits-cancel-btn');
  const deleteBtn = row.querySelector('.deposits-delete-btn');

  views.forEach(el => el.style.display = editing ? 'none' : '');
  fields.forEach(el => el.style.display = editing ? '' : 'none');
  if (editBtn) editBtn.style.display = editing ? 'none' : '';
  if (saveBtn) saveBtn.style.display = editing ? '' : 'none';
  if (cancelBtn) cancelBtn.style.display = editing ? '' : 'none';
  if (deleteBtn) deleteBtn.style.display = editing ? 'none' : '';
}

// ── Deposits CSV Export ──
function exportDepositsCSV() {
  const seasonDeposits = getDepositsForSeason(currentSeason);
  const headers = ['Name', 'Balance', 'Deposit 1 Amount', 'Deposit 1 Date', 'Deposit 2 Amount', 'Deposit 2 Date', 'Deposit 3 Amount', 'Deposit 3 Date', 'Total'];
  const rows = seasonDeposits.map(d => [
    d.swimmerName || '',
    d.balance || 0,
    d.deposit1Amount || '',
    d.deposit1Date || '',
    d.deposit2Amount || '',
    d.deposit2Date || '',
    d.deposit3Amount || '',
    d.deposit3Date || '',
    calcDepositTotal(d),
  ]);

  const esc = (v) => '"' + String(v).replace(/"/g, '""') + '"';
  const csv = [headers.map(esc).join(','), ...rows.map(r => r.map(esc).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dragon-deposits-${currentSeason}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportFeeSummaryCSV() {
  const summary = buildFeeSummaryData(currentSeason);
  const headers = ['Swimmer', 'Deposit', 'Total Meet Fee', 'Meets', 'Balance'];
  const rows = summary.map(s => [
    s.displayName,
    s.deposit,
    s.totalFee,
    s.meetCount,
    s.balance,
  ]);

  const esc = (v) => '"' + String(v).replace(/"/g, '""') + '"';
  const csv = [headers.map(esc).join(','), ...rows.map(r => r.map(esc).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dragon-fee-summary-${currentSeason}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Helper: HTML escape ──
function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// ── Season Helpers ──

/** Infer the current swim season from today's date. New season starts in September. */
function getDefaultSeason() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12
  if (month >= 9) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
}

/** Collect unique seasons from meets, deposits, and auto-generate nearby seasons. */
function getSeasonOptions() {
  const seasons = new Set();

  // From data
  for (const m of swimMeets) {
    if (m.season) seasons.add(m.season);
  }
  for (const d of deposits) {
    if (d.season) seasons.add(d.season);
  }

  // Auto-generate: from 2025-2026 up to baseYear + 2
  const now = new Date();
  const baseYear = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  const minYear = 2025;
  for (let y = Math.max(minYear, baseYear - 1); y <= baseYear + 2; y++) {
    seasons.add(`${y}-${y + 1}`);
  }

  return Array.from(seasons).sort().reverse(); // newest first
}

/** Render a <select> dropdown for season, with a label. */
function renderSeasonSelector(selectedSeason) {
  const options = getSeasonOptions();
  const sel = selectedSeason || currentSeason || getDefaultSeason();
  return `
    <div class="season-selector">
      <label class="season-selector-label">${t('dash_season_label')}:</label>
      <select id="season-select" class="season-select">
        ${options.map(s => `<option value="${s}" ${s === sel ? 'selected' : ''}>${s}</option>`).join('')}
      </select>
    </div>
  `;
}

window.__updateSwimmerPayment = async function (el) {
  // Only admin can modify payment fields
  if (dbRole !== 'admin') {
    console.warn('Non-admin attempted to modify payment field — blocked');
    refreshUI();
    return;
  }

  const regId = el.dataset.regId;
  const swimmerIndex = parseInt(el.dataset.swimmerIndex);
  const field = el.dataset.field;
  const season = el.dataset.season || currentSeason;
  let value = el.value;

  // Amount fields: convert empty to null; date fields: empty string → null
  if (field.startsWith('amount')) {
    value = value === '' ? null : parseFloat(value);
    if (value != null && (isNaN(value) || value < 0)) value = null;
  } else if (field.startsWith('date')) {
    value = value || null;
  }

  // Update local cache immediately for responsive UI
  const reg = allRegistrations.find(r => r.id === regId);
  if (reg?.swimmers?.[swimmerIndex]) {
    const swimmer = reg.swimmers[swimmerIndex];
    const payments = { ...(swimmer.payments || {}) };
    const seasonData = { ...(payments[season] || {}) };
    seasonData[field] = value;
    payments[season] = seasonData;
    reg.swimmers[swimmerIndex] = { ...swimmer, payments };
  }

  // Persist to Firestore
  try {
    const regRef = doc(db, 'registrations', regId);
    const regSnap = await getDoc(regRef);
    if (!regSnap.exists()) return;
    const swimmers = [...regSnap.data().swimmers];
    if (swimmers[swimmerIndex]) {
      const sw = swimmers[swimmerIndex];
      const payments = { ...(sw.payments || {}) };
      const seasonData = { ...(payments[season] || {}) };
      seasonData[field] = value;
      payments[season] = seasonData;
      swimmers[swimmerIndex] = { ...sw, payments };
      await updateDoc(regRef, { swimmers });
    }
  } catch (err) {
    console.error('Error updating swimmer payment field:', err);
    // Revert local cache on failure
    const reg2 = allRegistrations.find(r => r.id === regId);
    if (reg2?.swimmers?.[swimmerIndex]) {
      const oldSnap = await getDoc(doc(db, 'registrations', regId));
      if (oldSnap.exists()) {
        reg2.swimmers[swimmerIndex] = { ...oldSnap.data().swimmers[swimmerIndex] };
      }
    }
    refreshUI();
  }
};

// ── Overview Tab ──
function renderOverview() {
  const activePlans = swimPlans.filter(p => p.status !== 'Completed').length;
  const completedPlans = swimPlans.filter(p => p.status === 'Completed').length;
  const upcomingMeets = swimMeets.filter(m => m.status !== 'Completed').length;

  return `
    <div class="dash-stats-row">
      <div class="dash-stat-card">
        <div class="dash-stat-number">${swimPlans.length}</div>
        <div class="dash-stat-label">${t('dash_swimmer_total_plans')}</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${activePlans}</div>
        <div class="dash-stat-label">${t('dash_swimmer_active_plans')}</div>
      </div>
      <div class="dash-stat-card accent">
        <div class="dash-stat-number">${completedPlans}</div>
        <div class="dash-stat-label">${t('dash_swimmer_completed')}</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${upcomingMeets}</div>
        <div class="dash-stat-label">${t('dash_swimmer_upcoming_meets')}</div>
      </div>
    </div>

    <div class="dash-overview-grid">
      <div class="dash-panel">
        <h3 class="dash-panel-title">${t('dash_swimmer_active_plans_title')}</h3>
        <div class="dash-panel-body" style="text-align: center; padding: 2rem;">
          <p style="color: var(--text-secondary);">${t('dash_plans_under_construction')}</p>
        </div>
      </div>
      <div class="dash-panel">
        <h3 class="dash-panel-title">${t('dash_swimmer_upcoming_meets_title')}</h3>
        <div class="dash-panel-body">
          ${swimMeets.filter(m => m.status !== 'Completed').map(m => miniMeetCard(m)).join('')}
        </div>
      </div>
    </div>

    <div class="dash-panel">
      <h3 class="dash-panel-title">${t('dash_swimmer_today_practice')}</h3>
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
  const dateDisplay = meet.startDate && meet.endDate
    ? `${meet.startDate} – ${meet.endDate}`
    : meet.date || '';
  return `
    <div class="dash-mini-card">
      <div class="dash-mini-top">
        <span class="dash-mini-name">${meet.name || 'Untitled Meet'}</span>
        <span class="status-badge status-${status.toLowerCase().replace(' ', '-')}">${status}</span>
      </div>
      <div class="dash-mini-meta">${dateDisplay} · ${meet.location || ''}</div>
    </div>
  `;
}

function renderTodayPractice() {
  const todayIndex = new Date().getDay();
  const today = getDayName(todayIndex);
  const todayPractices = practiceSchedules.filter(s => s.day === today);

  if (todayPractices.length === 0) {
    return `<p class="dash-empty">${t('dash_swimmer_rest_day')} (${today}). Rest day! 🎉</p>`;
  }

  return todayPractices.map(s => `
    <div class="dash-mini-card">
      <div class="dash-mini-top">
        <span class="dash-mini-name">${s.startTime} – ${s.endTime}</span>
      </div>
      <div class="dash-mini-meta">${s.location || ''}</div>
    </div>
  `).join('');
}

// ── Profile Tab ──
function renderProfile() {
  if (!familyData) {
    return `<div class="dash-panel" style="text-align: center; padding: 3rem;">
      <p class="dash-empty">${t('dash_profile_no_reg')}</p>
      <p style="margin-top: 1rem;"><a href="${import.meta.env.BASE_URL}registration.html" class="btn btn-primary">${t('dash_profile_complete_reg')}</a></p>
    </div>`;
  }

  const p = familyData.parent || {};
  const spouse = familyData.spouse;
  const swimmers = familyData.swimmers || [];
  const activeSwimmers = swimmers.filter(s => !s.deleted);
  const ec = familyData.emergencyContact || {};

  return `
    <div class="profile-grid">
      <div class="profile-col">
        <div class="dash-panel">
          <div class="dash-panel-header">
            <h3>${t('dash_profile_parent_title')}</h3>
            <button class="btn btn-outline btn-sm" id="edit-contact-btn">${t('dash_profile_edit')}</button>
          </div>
          <div class="profile-fields">
            <div class="profile-field">
              <span class="profile-label">${t('dash_profile_name')}</span>
              <span class="profile-value">${[p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ') || '—'}</span>
            </div>
            <div class="profile-field">
              <span class="profile-label">${t('dash_profile_gender')}</span>
              <span class="profile-value">${p.gender || '—'}</span>
            </div>
            <div class="profile-field">
              <span class="profile-label">${t('dash_profile_email')}</span>
              <span class="profile-value">${p.email || '—'}</span>
            </div>
            <div class="profile-field">
              <span class="profile-label">${t('dash_profile_phone')}</span>
              <span class="profile-value profile-display" id="display-parent-phone">${p.phone || '—'}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-parent-phone" value="${p.phone || ''}" />
            </div>
            <div class="profile-field">
              <span class="profile-label">${t('dash_profile_address')}</span>
              <span class="profile-value profile-display" id="display-parent-address">${p.address || '—'}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-parent-address" value="${p.address || ''}" />
            </div>
          </div>
        </div>

        ${spouse ? `
        <div class="dash-panel">
          <h3>${t('dash_profile_spouse_title')}</h3>
          <div class="profile-fields">
            <div class="profile-field">
              <span class="profile-label">${t('dash_profile_name')}</span>
              <span class="profile-value">${[spouse.firstName, spouse.middleName, spouse.lastName].filter(Boolean).join(' ') || '—'}</span>
            </div>
            <div class="profile-field">
              <span class="profile-label">${t('dash_profile_gender')}</span>
              <span class="profile-value">${spouse.gender || '—'}</span>
            </div>
            <div class="profile-field">
              <span class="profile-label">${t('dash_profile_phone')}</span>
              <span class="profile-value profile-display" id="display-spouse-phone">${spouse.phone || '—'}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-spouse-phone" value="${spouse.phone || ''}" />
            </div>
            <div class="profile-field">
              <span class="profile-label">${t('dash_profile_email')}</span>
              <span class="profile-value profile-display" id="display-spouse-email">${spouse.email || '—'}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-spouse-email" value="${spouse.email || ''}" readonly
                title="Spouse email is used for login access and cannot be changed here." />
              <p class="profile-edit-field" style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">Spouse email is tied to login access. Contact admin@dragonswim.com if you need to change it.</p>
            </div>
          </div>
        </div>
        ` : ''}

        <div class="dash-panel">
          <h3>${t('dash_profile_emergency_title')}</h3>
          <div class="profile-fields">
            <div class="profile-field">
              <span class="profile-label">${t('dash_profile_name')}</span>
              <span class="profile-value profile-display" id="display-emergency-name">${ec.name || '—'}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-emergency-name" value="${ec.name || ''}" />
            </div>
            <div class="profile-field">
              <span class="profile-label">${t('dash_profile_phone')}</span>
              <span class="profile-value profile-display" id="display-emergency-phone">${ec.phone || '—'}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-emergency-phone" value="${ec.phone || ''}" />
            </div>
          </div>
        </div>

        <div class="profile-edit-actions" id="edit-actions" style="display: none;">
          <button class="btn btn-primary btn-sm" id="save-contact-btn">${t('dash_profile_save')}</button>
          <button class="btn btn-outline btn-sm" id="cancel-contact-btn">${t('dash_profile_cancel')}</button>
        </div>
      </div>

      <div class="profile-col">
        <div class="dash-panel">
          <div class="dash-panel-header">
            <h3>${t('dash_profile_swimmers_title')} (${activeSwimmers.length})</h3>
            <button class="btn btn-outline btn-sm" id="add-swimmer-toggle-btn">${t('dash_profile_add_swimmer')}</button>
          </div>
          <div id="add-swimmer-form" style="display: none; margin-bottom: var(--space-md); padding: var(--space-md); border: 1px solid var(--border-color); border-radius: var(--radius-md);">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">${t('dash_profile_swimmer_first')}</label>
                <input class="form-input" id="new-swimmer-first" />
              </div>
              <div class="form-group">
                <label class="form-label">${t('dash_profile_swimmer_last')}</label>
                <input class="form-input" id="new-swimmer-last" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">${t('dash_profile_swimmer_middle')}</label>
                <input class="form-input" id="new-swimmer-middle" />
              </div>
              <div class="form-group">
                <label class="form-label">${t('dash_profile_swimmer_gender')}</label>
                <select class="form-select" id="new-swimmer-gender">
                  <option value="" disabled selected>${t('dash_profile_select_gender')}</option>
                  <option value="male">${t('dash_profile_gender_male')}</option>
                  <option value="female">${t('dash_profile_gender_female')}</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">${t('dash_profile_swimmer_dob')}</label>
                <input class="form-input" type="date" id="new-swimmer-dob" />
              </div>
              <div class="form-group">
                <label class="form-label">${t('dash_profile_swimmer_usa_id')}</label>
                <input class="form-input" id="new-swimmer-usaId" />
              </div>
            </div>
            <div style="display: flex; gap: var(--space-sm); margin-top: var(--space-md);">
              <button class="btn btn-primary btn-sm" id="save-swimmer-btn">${t('dash_profile_save_swimmer')}</button>
              <button class="btn btn-outline btn-sm" id="cancel-swimmer-btn">${t('dash_profile_cancel_swimmer')}</button>
            </div>
          </div>
          ${activeSwimmers.length === 0 ? `<p class="dash-empty">${t('dash_profile_no_swimmers')}</p>` : swimmers.map((s, i) => s.deleted ? '' : `

            <div class="swimmer-profile-card">
              <div class="swimmer-profile-info">
                <strong>${[s.firstName, s.middleName, s.lastName].filter(Boolean).join(' ')}</strong>
                <div class="swimmer-profile-meta">
                  <span>${s.gender || '—'}</span>
                  <span>DOB: ${s.dob || '—'}</span>
                  ${s.joinDate ? `<span>Joined: ${s.joinDate}</span>` : ''}
                </div>
                <div class="swimmer-usa-id" style="display: flex; align-items: center; gap: 8px; margin-top: 6px; flex-wrap: wrap;">
                  <span style="font-size: 0.8rem; color: var(--text-muted);">USA ID:</span>
                  <strong style="font-size: 0.8rem;">${s.usaSwimmingId ? escapeHtml(s.usaSwimmingId) : '—'}</strong>
                  <button type="button" class="btn btn-outline btn-sm usa-id-edit-btn" data-index="${i}" style="padding: 0 8px; font-size: 0.7rem;">${s.usaSwimmingId ? t('dash_profile_edit') : t('dash_profile_usa_add')}</button>
                  <span class="usa-id-edit-form" data-usa-form="${i}" style="display: none; align-items: center; gap: 6px;">
                    <input type="text" class="form-input usa-id-input" data-input="${i}" value="${escapeHtml(s.usaSwimmingId || '')}" placeholder="USA Swimming ID" style="width: 170px; padding: 2px 8px; font-size: 0.75rem;" />
                    <button type="button" class="btn btn-primary btn-sm usa-id-save-btn" data-index="${i}" style="padding: 0 8px; font-size: 0.7rem;">${t('dash_profile_save')}</button>
                    <button type="button" class="btn btn-outline btn-sm usa-id-cancel-btn" data-index="${i}" style="padding: 0 8px; font-size: 0.7rem;">${t('dash_profile_cancel')}</button>
                  </span>
                </div>
              </div>
              <button class="btn btn-outline btn-sm delete-swimmer-btn" data-index="${i}" style="color: var(--color-accent); border-color: var(--color-accent);">${t('dash_profile_remove')}</button>
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
    <div class="dash-panel" style="text-align: center; padding: 4rem 2rem;">
      <div style="font-size: 3rem; margin-bottom: 1rem;">🚧</div>
      <h2 style="font-size: 1.5rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem;">${t('dash_plans_under_construction')}</h2>
      <p style="color: var(--text-secondary);">${t('dash_swimmer_plans_sub')}</p>
    </div>
  `;
}

// ── Swim Meets Tab ──
function renderSwimMeets() {
  const canEdit = dbRole === 'admin';

  return `
    <div class="dash-section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2 style="font-size: 1.5rem; font-weight: 600; color: var(--text-primary);">${t('dash_meets_upcoming')}</h2>
      ${canEdit ? `<button class="btn btn-primary btn-sm" id="add-meet-btn">${t('dash_meets_add')}</button>` : ''}
    </div>

    ${canEdit ? `
      <div id="add-meet-form" class="dash-panel" style="display: none; margin-bottom: 2rem; padding: 1.5rem;">
        <h3 style="margin-bottom: 1rem;" id="meet-form-title">${t('dash_meets_new_title')}</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
          <input type="text" id="meet-name" placeholder="${t('dash_meets_name_placeholder')}" class="form-input">
          <input type="date" id="meet-start-date" class="form-input" title="${t('dash_meets_start_date_placeholder')}">
          <input type="date" id="meet-end-date" class="form-input" title="${t('dash_meets_end_date_placeholder')}">
          <input type="text" id="meet-location" placeholder="${t('dash_meets_location_placeholder')}" class="form-input">
          <select id="meet-season" class="form-input">
            ${getSeasonOptions().map(s => `<option value="${s}" ${s === currentSeason ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </div>
        <div style="margin-top: 1rem; display: flex; gap: 1rem;">
          <button class="btn btn-primary btn-sm" id="save-meet-btn">${t('dash_meets_save')}</button>
          <button class="btn btn-outline btn-sm" id="cancel-meet-btn">${t('dash_meets_cancel')}</button>
        </div>
      </div>
    ` : ''}

    <div class="dash-cards-grid">
      ${swimMeets.length === 0 ? `<p class="dash-empty">${t('dash_meets_no_meets')}</p>` :
      swimMeets.map(m => `
        <div class="dash-card">
          <div class="dash-card-header">
            <h3 class="dash-card-title">${m.name}</h3>
            <span class="status-badge status-${(m.status || 'Open').toLowerCase().replace(' ', '-')}">${m.status || 'Open'}</span>
          </div>
          <div class="dash-card-body">
            <div class="dash-card-meta">
              <span>📅 ${m.startDate && m.endDate ? `${m.startDate} – ${m.endDate}` : m.date || ''}</span>
              <span>📍 ${m.location}</span>
            </div>
            <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
              ${canEdit ? `<button class="btn btn-outline btn-sm meet-fee-btn" data-id="${m.id}" data-name="${m.name || ''}">${t('dash_meets_fee')}</button>` : ''}
              ${canEdit ? `<button class="btn btn-outline btn-sm edit-meet" data-id="${m.id}" data-name="${m.name || ''}" data-start="${m.startDate || m.date || ''}" data-end="${m.endDate || m.date || ''}" data-location="${m.location || ''}" data-season="${m.season || currentSeason}">${t('dash_meets_edit')}</button>` : ''}
              ${canEdit ? `<button class="btn btn-outline btn-sm delete-meet" data-id="${m.id}" style="color: var(--color-accent); border-color: var(--color-accent);">${t('dash_meets_delete')}</button>` : ''}
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ── Schedule Tab ──
function renderSchedule() {
  const canEdit = dbRole === 'admin';
  const dayNames = [0, 1, 2, 3, 4, 5, 6].map(i => getDayName(i));
  // Week starts Monday
  const scheduleDays = [1, 2, 3, 4, 5, 6, 0]; // Mon–Sun

  return `
    <div class="dash-section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2 style="font-size: 1.5rem; font-weight: 600; color: var(--text-primary);">${t('dash_schedule_weekly')}</h2>
      ${canEdit ? `<button class="btn btn-primary btn-sm" id="add-session-btn">${t('dash_schedule_add')}</button><button class="btn btn-outline btn-sm" id="import-csv-btn">${t('dash_schedule_import_csv')}</button>` : ''}
    </div>

    ${canEdit ? `
      <div id="add-session-form" class="dash-panel" style="display: none; margin-bottom: 2rem; padding: 1.5rem;">
        <h3 style="margin-bottom: 1rem;" id="session-form-title">${t('dash_schedule_new_title')}</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem;">
          <select id="session-day" class="form-input">
            ${scheduleDays.map(d => `<option value="${getDayName(d)}">${getDayName(d)}</option>`).join('')}
          </select>
          <input type="text" id="session-start-time" placeholder="${t('dash_schedule_start_time_placeholder')}" class="form-input">
          <input type="text" id="session-end-time" placeholder="${t('dash_schedule_end_time_placeholder')}" class="form-input">
          <input type="text" id="session-location" placeholder="${t('dash_schedule_location_placeholder')}" class="form-input">
        </div>
        <div style="margin-top: 1rem; display: flex; gap: 1rem;">
          <button class="btn btn-primary btn-sm" id="save-session-btn">${t('dash_schedule_save')}</button>
          <button class="btn btn-outline btn-sm" id="cancel-session-btn">${t('dash_schedule_cancel')}</button>
        </div>
      </div>
    ` : ''}

    <div class="dash-schedule-grid">
      ${scheduleDays.map(dayIndex => {
    const dayName = getDayName(dayIndex);
    const sessions = practiceSchedules.filter(s => s.day === dayName);
    return `
          <div class="dash-schedule-day">
            <h3 class="dash-schedule-day-name">${dayName}</h3>
            ${sessions.length === 0
        ? `<p class="dash-empty-sm">${t('dash_schedule_no_practice')}</p>`
        : sessions.map(s => `
                <div class="dash-schedule-item">
                  <div class="dash-schedule-time">${s.startTime} – ${s.endTime}</div>
                  <div class="dash-schedule-focus">${s.location || ''}</div>
                  <div class="dash-schedule-meta" style="display: flex; justify-content: flex-end; align-items: center; gap: 8px;">
                    ${canEdit ? `
                      <button class="edit-session" data-id="${s.id}" data-day="${s.day}" data-start="${s.startTime || ''}" data-end="${s.endTime || ''}" data-location="${s.location || ''}" style="background: none; border: none; font-size: 1rem; cursor: pointer; color: var(--color-primary); padding: 0 5px;" title="Edit">✎</button>
                      <button class="delete-session" data-id="${s.id}" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--color-accent); padding: 0 5px;" title="Delete">&times;</button>
                    ` : ''}
                  </div>
                </div>
              `).join('')}
          </div>
        `;
  }).join('')}
    </div>
  `;
}

// ── Confirmation Modal ──
function showDeleteConfirm(swimmerName, swimmerIndex) {
  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.innerHTML = `
    <div class="confirm-modal">
      <h3 class="confirm-title">${t('dash_profile_delete_title')}</h3>
      <p class="confirm-body">${t('dash_profile_delete_body1')} <strong style="color: var(--color-accent, #dc3545);">${swimmerName}</strong> ${t('dash_profile_delete_body2')}</p>
      <p class="confirm-warning">${t('dash_profile_delete_warning')}</p>
      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="confirm-cancel">${t('dash_profile_delete_cancel')}</button>
        <button class="btn btn-sm" id="confirm-delete" style="background: var(--color-accent, #dc3545); color: white; border: none;">${t('dash_profile_delete_confirm')}</button>
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
      alert(t('dash_profile_save_failed'));
    }
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
}

// ── USA ID helpers (Profile tab) ──
function normalizeUsaId(raw) {
  const value = (raw || '').trim().toUpperCase();
  return value || null;
}

function isValidUsaId(id) {
  return /^[0-9A-F]{14}$/.test(id);
}

// Find an active swimmer (other than self) already using this USA ID.
// Returns the conflicting swimmer object, or null when the ID is free.
async function findUsaIdConflict(id, selfSwimmerIndex) {
  const familySwimmers = familyData?.swimmers || [];
  for (let i = 0; i < familySwimmers.length; i++) {
    const s = familySwimmers[i];
    if (i === selfSwimmerIndex || s.deleted) continue;
    if (s.usaSwimmingId && s.usaSwimmingId.toUpperCase() === id) return s;
  }

  // Cross-family check. firestore.rules already grants signed-in users read access to
  // registrations, and the team is small, so a one-shot read on save is acceptable.
  try {
    const snap = await getDocs(collection(db, 'registrations'));
    for (const regDoc of snap.docs) {
      if (regDoc.id === familyDataId) continue;
      const reg = regDoc.data();
      for (const s of (reg.swimmers || [])) {
        if (s.deleted) continue;
        if (s.usaSwimmingId && s.usaSwimmingId.toUpperCase() === id) return s;
      }
    }
  } catch (err) {
    console.warn('USA ID duplicate check skipped:', err);
  }
  return null;
}

// ── Password Change Modal ──
function showPasswordModal() {
  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.innerHTML = `
    <div class="confirm-modal" style="max-width: 420px;">
      <h3 class="confirm-title">${t('dash_profile_security_title')}</h3>
      <div style="padding: var(--space-md) 0;">
        <div class="profile-field">
          <label class="form-label" for="modal-current-password">${t('dash_profile_current_password')}</label>
          <input class="form-input" type="password" id="modal-current-password" placeholder="Enter current password" />
        </div>
        <div class="profile-field">
          <label class="form-label" for="modal-new-password">${t('dash_profile_new_password')}</label>
          <input class="form-input" type="password" id="modal-new-password" placeholder="Enter new password" />
        </div>
        <div class="profile-field">
          <label class="form-label" for="modal-confirm-password">${t('dash_profile_confirm_password')}</label>
          <input class="form-input" type="password" id="modal-confirm-password" placeholder="Confirm new password" />
        </div>
        <p id="modal-password-msg" style="font-size: 14px; margin-top: 10px; display: none;"></p>
      </div>
      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="modal-password-cancel">${t('dash_profile_cancel')}</button>
        <button class="btn btn-primary btn-sm" id="modal-password-submit">${t('dash_profile_password_btn')}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const msgEl = overlay.querySelector('#modal-password-msg');

  overlay.querySelector('#modal-password-cancel').addEventListener('click', () => overlay.remove());

  overlay.querySelector('#modal-password-submit').addEventListener('click', async () => {
    const currentPassword = overlay.querySelector('#modal-current-password').value;
    const newPassword = overlay.querySelector('#modal-new-password').value;
    const confirmPassword = overlay.querySelector('#modal-confirm-password').value;

    msgEl.style.display = 'none';

    // Validate
    if (!currentPassword || !newPassword || !confirmPassword) {
      msgEl.textContent = 'All fields are required.';
      msgEl.style.color = 'var(--color-accent, #DC2626)';
      msgEl.style.display = 'block';
      return;
    }
    if (newPassword !== confirmPassword) {
      msgEl.textContent = t('dash_profile_password_mismatch');
      msgEl.style.color = 'var(--color-accent, #DC2626)';
      msgEl.style.display = 'block';
      return;
    }
    if (newPassword.length < 6) {
      msgEl.textContent = 'Password must be at least 6 characters.';
      msgEl.style.color = 'var(--color-accent, #DC2626)';
      msgEl.style.display = 'block';
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);

      msgEl.textContent = t('dash_profile_password_success');
      msgEl.style.color = '#16A34A';
      msgEl.style.display = 'block';

      // Clear form
      overlay.querySelector('#modal-current-password').value = '';
      overlay.querySelector('#modal-new-password').value = '';
      overlay.querySelector('#modal-confirm-password').value = '';
    } catch (error) {
      console.error('Password update error:', error);
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        msgEl.textContent = t('dash_profile_password_wrong');
      } else {
        msgEl.textContent = t('dash_profile_password_error') + ' ' + (error.message || '');
      }
      msgEl.style.color = 'var(--color-accent, #DC2626)';
      msgEl.style.display = 'block';
    }
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
}

// ── CSV Parsing ──

/**
 * Parse a single CSV line into an array of fields.
 * Handles basic quoted fields (e.g. "Pool A, Main" as one field).
 * Strips BOM from the first field if present.
 */
function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  // Strip BOM from first field
  if (fields.length > 0 && fields[0].charCodeAt(0) === 0xFEFF) {
    fields[0] = fields[0].slice(1);
  }
  return fields;
}

/**
 * Parse a CSV string into headers and rows.
 * Skips empty lines. Expects first line as header.
 */
function parseCSV(csvText) {
  const lines = csvText.split(/\r?\n/);
  const nonEmpty = lines.filter(line => line.trim().length > 0);
  if (nonEmpty.length === 0) {
    return { headers: [], rows: [] };
  }
  const headers = parseCSVLine(nonEmpty[0]);
  const rows = nonEmpty.slice(1).map(line => parseCSVLine(line));
  return { headers, rows };
}

/**
 * Validate a parsed CSV row against the schedule schema.
 * @param {string[]} row - Array of field values
 * @param {number} rowNum - 1-based row number for error reporting
 * @returns {{ valid: boolean, day?: string, startTime?: string, endTime?: string, location?: string, reason?: string, rowNum: number }}
 */
function validateScheduleRow(row, rowNum) {
  if (!row || row.length < 4) {
    return { valid: false, reason: t('dash_csv_error_too_few_cols'), rowNum };
  }
  const [day, startTime, endTime, location] = row.map(f => (f || '').trim());

  if (!day) {
    return { valid: false, reason: t('dash_csv_error_missing_day'), rowNum };
  }

  // Case-insensitive day matching against known day names
  const dayLower = day.toLowerCase();
  const matchedDayIndex = [0, 1, 2, 3, 4, 5, 6].find(i => getDayName(i).toLowerCase() === dayLower);
  if (matchedDayIndex === undefined) {
    return { valid: false, reason: t('dash_csv_error_invalid_day', { day }), rowNum };
  }
  const normalizedDay = getDayName(matchedDayIndex);

  if (!startTime) {
    return { valid: false, reason: t('dash_csv_error_missing_start'), rowNum };
  }
  if (!/^\d{1,2}:\d{2}\s*(AM|PM)?$/i.test(startTime)) {
    return { valid: false, reason: t('dash_csv_error_invalid_time', { field: 'StartTime', value: startTime }), rowNum };
  }

  if (!endTime) {
    return { valid: false, reason: t('dash_csv_error_missing_end'), rowNum };
  }
  if (!/^\d{1,2}:\d{2}\s*(AM|PM)?$/i.test(endTime)) {
    return { valid: false, reason: t('dash_csv_error_invalid_time', { field: 'EndTime', value: endTime }), rowNum };
  }

  return {
    valid: true,
    day: normalizedDay,
    startTime,
    endTime,
    location: location || '',
    rowNum
  };
}

// ── CSV Import ──

/**
 * Show a temporary status banner at the top of the dashboard content.
 */
function showImportStatus(message, isError) {
  const existing = document.getElementById('csv-import-status');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.id = 'csv-import-status';
  el.style.cssText = [
    'padding: var(--space-md) var(--space-lg)',
    'border-radius: var(--radius-md)',
    'margin-bottom: var(--space-lg)',
    'font-size: var(--fs-sm)',
    'font-weight: var(--fw-medium)',
    isError
      ? 'background: #fef2f2; border: 1px solid #fee2e2; color: #991b1b'
      : 'background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534'
  ].join(';');
  el.textContent = message;
  const content = document.querySelector('.dash-content');
  if (content) {
    content.insertBefore(el, content.firstChild);
  }
  setTimeout(() => el.remove(), 8000);
}

/**
 * Handle file selection: parse, validate, and show preview modal.
 */
async function handleCSVFileSelect(event) {
  const file = event.target.files?.[0];
  event.target.remove(); // clean up the temp input

  if (!file) return;

  // Reject non-CSV files (check extension only)
  if (!file.name.toLowerCase().endsWith('.csv')) {
    showImportStatus(t('dash_csv_error_not_csv'), true);
    return;
  }

  // Size check: 500KB max
  if (file.size > 500000) {
    showImportStatus(t('dash_csv_error_too_large'), true);
    return;
  }

  let text;
  try {
    text = await file.text();
  } catch (err) {
    console.error('Error reading CSV file:', err);
    showImportStatus(t('dash_csv_error_unknown'), true);
    return;
  }

  if (!text || text.trim().length === 0) {
    showImportStatus(t('dash_csv_error_empty'), true);
    return;
  }

  const { headers, rows } = parseCSV(text);

  // Validate header (case-insensitive)
  const requiredHeaders = ['day', 'starttime', 'endtime', 'location'];
  const normalizedHeaders = headers.map(h => h.replace(/\s/g, '').toLowerCase());
  const headerMatch = requiredHeaders.every(h => normalizedHeaders.includes(h));
  if (!headerMatch || headers.length < 4) {
    showImportStatus(t('dash_csv_error_bad_header'), true);
    return;
  }

  // Validate rows
  const validRows = [];
  const errorRows = [];
  rows.forEach((row, i) => {
    const result = validateScheduleRow(row, i + 2); // +2: row 1 is header, arrays are 0-based
    if (result.valid) {
      validRows.push({
        day: result.day,
        startTime: result.startTime,
        endTime: result.endTime,
        location: result.location || ''
      });
    } else {
      errorRows.push({ rowNum: result.rowNum, reason: result.reason });
    }
  });

  showCSVImportModal(validRows, errorRows, file.name);
}

/**
 * Show the import preview modal with a table of valid rows and any errors.
 */
function showCSVImportModal(validRows, errorRows, filename) {
  const escapedFilename = filename.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const validCount = validRows.length;
  const errorCount = errorRows.length;

  const escapeHtml = (str) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.innerHTML = `
    <div class="confirm-modal csv-import-modal">
      <h3 class="confirm-title">${t('dash_csv_import_title')}</h3>
      <p class="csv-import-filename">${t('dash_csv_import_file')}: <strong>${escapedFilename}</strong></p>
      <p class="csv-import-summary">${t('dash_csv_import_summary', { valid: String(validCount), error: String(errorCount) })}</p>
      ${validRows.length > 0 ? `
        <div class="csv-preview-wrapper">
          <table class="csv-preview-table">
            <thead>
              <tr>
                <th>${t('dash_csv_header_day')}</th>
                <th>${t('dash_csv_header_start')}</th>
                <th>${t('dash_csv_header_end')}</th>
                <th>${t('dash_csv_header_location')}</th>
              </tr>
            </thead>
            <tbody>
              ${validRows.map(row => `
                <tr>
                  <td>${escapeHtml(row.day)}</td>
                  <td>${escapeHtml(row.startTime)}</td>
                  <td>${escapeHtml(row.endTime)}</td>
                  <td>${escapeHtml(row.location || '')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}
      ${errorRows.length > 0 ? `
        <div class="csv-error-block">
          <p class="csv-error-title">${t('dash_csv_import_errors')}</p>
          ${errorRows.map(e => `<p class="csv-error-item">${t('dash_csv_import_row')} ${e.rowNum}: ${escapeHtml(e.reason)}</p>`).join('')}
        </div>
      ` : ''}
      ${validRows.length === 0 ? `
        <p class="csv-no-valid">${t('dash_csv_import_no_valid')}</p>
      ` : ''}
      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="csv-import-cancel">${t('dash_csv_import_cancel')}</button>
        ${validRows.length > 0 ? `<button class="btn btn-primary btn-sm" id="csv-import-confirm">${t('dash_csv_import_confirm', { count: String(validCount) })}</button>` : ''}
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Event binding
  overlay.querySelector('#csv-import-cancel').addEventListener('click', () => overlay.remove());
  overlay.querySelector('#csv-import-confirm')?.addEventListener('click', async () => {
    overlay.remove();
    await importCSVRows(validRows);
  });
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
}

/**
 * Batch-write validated rows to Firestore schedules collection.
 */
async function importCSVRows(rows) {
  if (!rows || rows.length === 0) return;

  // Clear any existing status
  const existing = document.getElementById('csv-import-status');
  if (existing) existing.remove();

  try {
    const batch = writeBatch(db);
    const colRef = collection(db, 'schedules');

    rows.forEach(row => {
      const docRef = doc(colRef);
      batch.set(docRef, {
        day: row.day,
        startTime: row.startTime,
        endTime: row.endTime,
        location: row.location || '',
        createdAt: new Date()
      });
    });

    await batch.commit();

    showImportStatus(t('dash_csv_import_success', { count: String(rows.length) }));
    // The existing onSnapshot listener auto-refreshes the UI
  } catch (error) {
    console.error('CSV import batch write failed:', error);

    if (error.code === 'permission-denied') {
      showImportStatus(t('dash_csv_error_permission'), true);
    } else if (error.code === 'unavailable') {
      showImportStatus(t('dash_csv_error_network'), true);
    } else {
      showImportStatus(t('dash_csv_error_unknown') + ' ' + (error.message || ''), true);
    }
  }
}

// ── Meet Entry Fee Parsing (Hy-Tek Team Manager Report) ──
async function parseHytekFeeReport(file) {
  // Use the xlsx library (SheetJS) loaded globally or imported
  const XLSX = window.XLSX;
  if (!XLSX) {
    alert('Excel parser not loaded. Please refresh the page.');
    return null;
  }

  const data = await file.arrayBuffer();
  const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

  try {
    // Row 5, col 0: meet name + date
    const meetNameRaw = rows[5]?.[0] || 'Unknown Meet';

    // Row 7: setup fees
    const individualEventFee = rows[7]?.[9] || 0;
    const swimmerSurchargeFee = rows[7]?.[36] || 0;

    // Find header row (contains "Name") to locate swimmer data start
    let dataStartRow = -1;
    for (let r = 8; r < rows.length; r++) {
      if (rows[r] && rows[r][1] === 'Name') {
        dataStartRow = r + 2; // Skip header row and blank row
        break;
      }
    }
    if (dataStartRow < 0) dataStartRow = 11; // fallback

    // Parse swimmer entries (every other row from dataStartRow)
    const swimmers = [];
    for (let r = dataStartRow; r < rows.length; r += 2) {
      const nameCell = rows[r]?.[1];
      if (!nameCell || typeof nameCell !== 'string') break; // end of swimmer list

      // Parse "Name (Age)" format
      const nameMatch = nameCell.match(/^(.+?)\s*\((\d+)\)\s*$/);
      const swimmerName = nameMatch ? nameMatch[1].trim() : nameCell.trim();
      const age = nameMatch ? parseInt(nameMatch[2], 10) : null;

      const ieCount = rows[r]?.[17] || 0;
      const indivFee = rows[r]?.[23] || 0;
      const relayFee = rows[r]?.[29] || 0; // col 29 is relay fee numeric
      const total = rows[r]?.[38] || 0;

      swimmers.push({
        name: swimmerName,
        age,
        individualEvents: ieCount,
        individualFee: indivFee,
        relayFee,
        total,
      });
    }

    // Parse summary: find "Team Totals" row
    let summaryStartRow = -1;
    for (let r = dataStartRow; r < rows.length; r++) {
      if (rows[r] && rows[r][9] === 'Team Totals') {
        summaryStartRow = r;
        break;
      }
    }

    let summary = {
      individualEntries: 0, individualFee: 0,
      relayEntries: 0, relayFee: 0,
      swimmerSurcharge: { count: 0, fee: 0 },
      teamSurcharge: 0, facilitySurcharge: 0,
      total: 0,
    };

    if (summaryStartRow > 0) {
      // Individual Entries: row+1, col 15=count, col 21=fee
      summary.individualEntries = rows[summaryStartRow + 1]?.[15] || 0;
      summary.individualFee = rows[summaryStartRow + 1]?.[21] || 0;
      // Relay Entries: row+2
      summary.relayEntries = rows[summaryStartRow + 2]?.[15] || 0;
      summary.relayFee = rows[summaryStartRow + 2]?.[21] || 0;
      // Swimmer Surcharge: row+3 (col 7 label, col 15=count, col 21=fee)
      summary.swimmerSurcharge = {
        count: rows[summaryStartRow + 3]?.[15] || 0,
        fee: rows[summaryStartRow + 3]?.[21] || 0,
      };
      // Team Surcharge: row+4
      summary.teamSurcharge = rows[summaryStartRow + 4]?.[21] || 0;
      // Facility Surcharge: row+5
      summary.facilitySurcharge = rows[summaryStartRow + 5]?.[21] || 0;
      // Total: row+6 (col 10 label, col 21=fee)
      summary.total = rows[summaryStartRow + 6]?.[21] || 0;
    }

    return {
      fileName: file.name,
      meetName: meetNameRaw,
      setupFees: {
        individualEventFee,
        swimmerSurcharge: swimmerSurchargeFee,
      },
      swimmers,
      summary,
      uploadedAt: new Date(),
      uploadedBy: currentUser?.email || 'unknown',
    };
  } catch (err) {
    console.error('Error parsing Hy-Tek report:', err);
    return null;
  }
}

// ── Fee Modal ──
function renderFeeModal(meetId, meetName, feeData) {
  const hasData = feeData && feeData.swimmers && feeData.swimmers.length > 0;

  let bodyHtml = '';
  if (hasData) {
    // Summary cards
    const s = feeData.summary;
    bodyHtml += `
      <div class="fee-summary-grid">
        <div class="fee-summary-card">
          <div class="fee-summary-label">Individual Entries</div>
          <div class="fee-summary-value">${s.individualEntries} events</div>
          <div class="fee-summary-sub">$${s.individualFee.toLocaleString()}</div>
        </div>
        <div class="fee-summary-card">
          <div class="fee-summary-label">Relay Entries</div>
          <div class="fee-summary-value">${s.relayEntries} entries</div>
          <div class="fee-summary-sub">$${s.relayFee.toLocaleString()}</div>
        </div>
        <div class="fee-summary-card">
          <div class="fee-summary-label">Swimmer Surcharge</div>
          <div class="fee-summary-value">${s.swimmerSurcharge.count} swimmers</div>
          <div class="fee-summary-sub">$${s.swimmerSurcharge.fee.toLocaleString()}</div>
        </div>
        <div class="fee-summary-card fee-summary-total">
          <div class="fee-summary-label">${t('dash_meets_fee_summary_total')}</div>
          <div class="fee-summary-value" style="font-size: 1.5rem; font-weight: 700;">$${s.total.toLocaleString()}</div>
        </div>
      </div>

      <div class="fee-table-wrapper">
        <table class="fee-table">
          <thead>
            <tr>
              <th>${t('dash_meets_fee_name')}</th>
              <th>${t('dash_meets_fee_age')}</th>
              <th>${t('dash_meets_fee_events')}</th>
              <th>${t('dash_meets_fee_indiv_fee')}</th>
              <th>${t('dash_meets_fee_relay_fee')}</th>
              <th>${t('dash_meets_fee_total')}</th>
            </tr>
          </thead>
          <tbody>
            ${feeData.swimmers.map(sw => `
              <tr>
                <td>${sw.name}</td>
                <td>${sw.age != null ? sw.age : '—'}</td>
                <td>${sw.individualEvents}</td>
                <td>$${sw.individualFee.toLocaleString()}</td>
                <td>$${sw.relayFee.toLocaleString()}</td>
                <td><strong>$${sw.total.toLocaleString()}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="fee-meta">
        ${t('dash_meets_fee_uploaded_by')}: <strong>${feeData.uploadedBy || '—'}</strong>
        ${feeData.uploadedAt ? ` &mdash; ${new Date(feeData.uploadedAt.seconds ? feeData.uploadedAt.seconds * 1000 : feeData.uploadedAt).toLocaleString()}` : ''}
      </div>
    `;
  } else {
    bodyHtml = `<div class="fee-empty">${t('dash_meets_fee_no_data')}</div>`;
  }

  return `
    <div class="fee-modal-overlay" id="fee-modal-overlay">
      <div class="fee-modal">
        <div class="fee-modal-header">
          <h2>${t('dash_meets_fee_title')}: ${meetName}</h2>
          <button class="fee-modal-close" id="fee-modal-close" title="${t('dash_meets_fee_close')}">&times;</button>
        </div>
        <div class="fee-modal-body" id="fee-modal-body">
          ${bodyHtml}
        </div>
        <div class="fee-modal-footer">
          ${hasData ? `<p class="fee-overwrite-hint">${t('dash_meets_fee_upload_overwrite')}</p>` : ''}
          <input type="file" id="fee-file-input" accept=".xls,.xlsx" style="display:none;">
          <button class="btn btn-primary btn-sm" id="fee-upload-btn">${t('dash_meets_fee_upload')}</button>
          ${hasData ? `<button class="btn btn-outline btn-sm" id="fee-delete-btn" style="color: var(--color-accent); border-color: var(--color-accent);">${t('dash_meets_fee_delete')}</button>` : ''}
        </div>
      </div>
    </div>
  `;
}

async function showFeeModal(meetId, meetName) {
  // Fetch meet doc to get feeData
  let feeData = null;
  try {
    const meetSnap = await getDoc(doc(db, 'meets', meetId));
    if (meetSnap.exists()) {
      feeData = meetSnap.data().feeData || null;
    }
  } catch (err) {
    console.error('Error fetching meet for fee modal:', err);
  }

  // Remove existing modal if any
  const existing = document.getElementById('fee-modal-overlay');
  if (existing) existing.remove();

  // Inject modal HTML
  const container = document.createElement('div');
  container.id = 'fee-modal-container';
  container.innerHTML = renderFeeModal(meetId, meetName, feeData);
  document.body.appendChild(container);

  // ── Event bindings ──
  const overlay = document.getElementById('fee-modal-overlay');
  const closeBtn = document.getElementById('fee-modal-close');
  const uploadBtn = document.getElementById('fee-upload-btn');
  const fileInput = document.getElementById('fee-file-input');
  const deleteBtn = document.getElementById('fee-delete-btn');

  // Close
  const closeModal = () => {
    overlay?.remove();
    container.remove();
  };
  closeBtn?.addEventListener('click', closeModal);
  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // File upload
  uploadBtn?.addEventListener('click', () => {
    fileInput?.click();
  });
  fileInput?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file extension
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['xls', 'xlsx'].includes(ext)) {
      alert(t('dash_meets_fee_parse_error'));
      return;
    }

    const parsed = await parseHytekFeeReport(file);
    if (!parsed) {
      alert(t('dash_meets_fee_parse_error'));
      return;
    }

    try {
      await updateDoc(doc(db, 'meets', meetId), { feeData: parsed });
      closeModal();
      // Re-open with fresh data
      showFeeModal(meetId, meetName);
    } catch (err) {
      console.error('Error uploading fee data:', err);
      alert('Failed to upload fee data. Please try again.');
    }
  });

  // Delete
  deleteBtn?.addEventListener('click', async () => {
    if (confirm(t('dash_meets_fee_delete_confirm'))) {
      try {
        await updateDoc(doc(db, 'meets', meetId), { feeData: null });
        closeModal();
        showFeeModal(meetId, meetName);
      } catch (err) {
        console.error('Error deleting fee data:', err);
        alert('Failed to delete fee data. Please try again.');
      }
    }
  });
}

// ── Events ──
function bindEvents() {
  // 一次性数据迁移(后台执行):修复 2026-08-01 setDoc merge 把 meets.{id}
  // 存成字面字段名的问题。幂等,无字面字段则无操作。
  migrateAllSwimResults();

  // Sidebar nav
  document.querySelectorAll('.dash-nav-item[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentTab = btn.dataset.tab;
      refreshUI(); // 渲染完成后 renderCoachDashboard 会按需调用 loadAthleteDataStatus()
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

  document.getElementById('menu-profile')?.addEventListener('click', () => {
    currentTab = 'profile';
    userDropdown.style.display = 'none';
    refreshUI();
  });

  document.getElementById('menu-signout')?.addEventListener('click', async () => {
    try {
      await signOut(auth);
      window.location.href = import.meta.env.BASE_URL + 'signin.html';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  });

  document.getElementById('menu-admin')?.addEventListener('click', () => {
    window.location.href = import.meta.env.BASE_URL + 'admin.html';
  });

  document.getElementById('menu-password')?.addEventListener('click', () => {
    userDropdown.style.display = 'none';
    showPasswordModal();
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
      alert(t('dash_profile_save_failed'));
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
      alert(t('dash_profile_swimmer_required'));
      return;
    }
    const usaId = normalizeUsaId(document.getElementById('new-swimmer-usaId').value);
    if (usaId && !isValidUsaId(usaId)) {
      alert(t('dash_profile_usa_invalid'));
      return;
    }
    if (usaId) {
      const conflict = await findUsaIdConflict(usaId, -1);
      if (conflict) {
        alert(t('dash_profile_usa_duplicate'));
        return;
      }
    }
    const newSwimmer = {
      firstName,
      lastName,
      middleName: document.getElementById('new-swimmer-middle').value.trim() || null,
      gender: document.getElementById('new-swimmer-gender').value || null,
      dob: document.getElementById('new-swimmer-dob').value || null,
      usaSwimmingId: usaId,
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
      alert(t('dash_profile_swimmer_add_failed'));
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

  // ── Edit Swimmer USA ID ──
  document.querySelectorAll('.usa-id-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      const editForm = document.querySelector(`.usa-id-edit-form[data-usa-form='${idx}']`);
      if (editForm) {
        editForm.style.display = 'flex';
        btn.style.display = 'none';
        editForm.querySelector('.usa-id-input').focus();
      }
    });
  });

  document.querySelectorAll('.usa-id-cancel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      const editForm = document.querySelector(`.usa-id-edit-form[data-usa-form='${idx}']`);
      const editBtn = document.querySelector(`.usa-id-edit-btn[data-index='${idx}']`);
      if (editForm) editForm.style.display = 'none';
      if (editBtn) editBtn.style.display = '';
    });
  });

  document.querySelectorAll('.usa-id-save-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const idx = parseInt(btn.dataset.index);
      const swimmer = familyData.swimmers[idx];
      if (!swimmer) return;
      const input = document.querySelector(`.usa-id-input[data-input='${idx}']`);
      const newId = normalizeUsaId(input?.value);
      const oldId = swimmer.usaSwimmingId ? swimmer.usaSwimmingId.toUpperCase() : null;

      if (newId && !isValidUsaId(newId)) {
        alert(t('dash_profile_usa_invalid'));
        return;
      }
      if (newId === oldId) {
        document.querySelector(`.usa-id-cancel-btn[data-index='${idx}']`)?.click();
        return;
      }
      if (newId) {
        const conflict = await findUsaIdConflict(newId, idx);
        if (conflict) {
          alert(t('dash_profile_usa_duplicate'));
          return;
        }
      }

      const swimmers = [...familyData.swimmers];
      swimmers[idx] = { ...swimmer, usaSwimmingId: newId };
      try {
        await updateDoc(doc(db, 'registrations', familyDataId), { swimmers });
        familyData.swimmers = swimmers;
        currentTab = 'profile';
        refreshUI();
      } catch (err) {
        console.error('Error updating swimmer USA ID:', err);
        alert(t('dash_profile_save_failed'));
      }
    });
  });

  // ── Update Password ──
  document.getElementById('update-password-btn')?.addEventListener('click', async () => {
    const msgEl = document.getElementById('password-update-msg');
    const currentPassword = document.getElementById('change-current-password').value;
    const newPassword = document.getElementById('change-new-password').value;
    const confirmPassword = document.getElementById('change-confirm-password').value;

    // Hide previous message
    msgEl.style.display = 'none';
    msgEl.style.color = '';
    const btnEl = document.getElementById('update-password-btn');
    if (btnEl) btnEl.disabled = true;

    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      msgEl.textContent = 'All fields are required.';
      msgEl.style.color = 'var(--color-accent, #DC2626)';
      msgEl.style.display = 'block';
      if (btnEl) btnEl.disabled = false;
      return;
    }
    if (newPassword !== confirmPassword) {
      msgEl.textContent = t('dash_profile_password_mismatch');
      msgEl.style.color = 'var(--color-accent, #DC2626)';
      msgEl.style.display = 'block';
      if (btnEl) btnEl.disabled = false;
      return;
    }
    if (newPassword.length < 6) {
      msgEl.textContent = 'Password must be at least 6 characters.';
      msgEl.style.color = 'var(--color-accent, #DC2626)';
      msgEl.style.display = 'block';
      if (btnEl) btnEl.disabled = false;
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);

      msgEl.textContent = t('dash_profile_password_success');
      msgEl.style.color = '#16A34A';
      msgEl.style.display = 'block';

      // Clear form on success
      document.getElementById('change-current-password').value = '';
      document.getElementById('change-new-password').value = '';
      document.getElementById('change-confirm-password').value = '';
    } catch (error) {
      console.error('Password update error:', error);
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        msgEl.textContent = t('dash_profile_password_wrong');
      } else {
        msgEl.textContent = t('dash_profile_password_error') + ' ' + (error.message || '');
      }
      msgEl.style.color = 'var(--color-accent, #DC2626)';
      msgEl.style.display = 'block';
    } finally {
      if (btnEl) btnEl.disabled = false;
    }
  });

  // ── Coach Management Events ──
  if (userRole === 'coach') {
    // Meet Management
    const meetForm = document.getElementById('add-meet-form');
    const meetSaveBtn = document.getElementById('save-meet-btn');
    const meetCancelBtn = document.getElementById('cancel-meet-btn');
    const meetFormTitle = document.getElementById('meet-form-title');

    document.getElementById('add-meet-btn')?.addEventListener('click', () => {
      editingMeetId = null;
      meetFormTitle.textContent = t('dash_meets_new_title');
      meetSaveBtn.textContent = t('dash_meets_save');
      document.getElementById('meet-name').value = '';
      document.getElementById('meet-start-date').value = '';
      document.getElementById('meet-end-date').value = '';
      document.getElementById('meet-location').value = '';
      meetForm.style.display = 'block';
    });
    meetCancelBtn?.addEventListener('click', () => {
      meetForm.style.display = 'none';
      editingMeetId = null;
    });
    meetSaveBtn?.addEventListener('click', async () => {
      const name = document.getElementById('meet-name').value.trim();
      const startDate = document.getElementById('meet-start-date').value;
      const endDate = document.getElementById('meet-end-date').value;
      const location = document.getElementById('meet-location').value.trim();
      const season = document.getElementById('meet-season')?.value || currentSeason;

      if (!name || !startDate || !endDate) {
        alert(t('dash_meets_name_date_required'));
        return;
      }

      try {
        if (editingMeetId) {
          // Update existing meet
          await updateDoc(doc(db, "meets", editingMeetId), {
            name,
            startDate,
            endDate,
            location,
            season,
          });
        } else {
          // Add new meet
          await addDoc(collection(db, "meets"), {
            name,
            startDate,
            endDate,
            location,
            season,
            status: 'Open',
            createdAt: new Date()
          });
        }
        meetForm.style.display = 'none';
        editingMeetId = null;
      } catch (err) {
        console.error("Error saving meet:", err);
      }
    });

    // Edit meet
    document.querySelectorAll('.edit-meet').forEach(btn => {
      btn.addEventListener('click', () => {
        editingMeetId = btn.dataset.id;
        meetFormTitle.textContent = t('dash_meets_edit_title');
        meetSaveBtn.textContent = t('dash_meets_update');
        document.getElementById('meet-name').value = btn.dataset.name;
        document.getElementById('meet-start-date').value = btn.dataset.start;
        document.getElementById('meet-end-date').value = btn.dataset.end;
        document.getElementById('meet-location').value = btn.dataset.location;
        const seasonEl = document.getElementById('meet-season');
        if (seasonEl) seasonEl.value = btn.dataset.season || currentSeason;
        meetForm.style.display = 'block';
        meetForm.scrollIntoView({ behavior: 'smooth' });
      });
    });

    // Delete meet
    document.querySelectorAll('.delete-meet').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (confirm(t('dash_meets_confirm_delete'))) {
          try {
            await deleteDoc(doc(db, "meets", btn.dataset.id));
            if (editingMeetId === btn.dataset.id) {
              meetForm.style.display = 'none';
              editingMeetId = null;
            }
          } catch (err) {
            console.error("Error deleting meet:", err);
          }
        }
      });
    });

    // Meet Entry Fees
    document.querySelectorAll('.meet-fee-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        showFeeModal(btn.dataset.id, btn.dataset.name);
      });
    });

    // Session Management
    const addForm = document.getElementById('add-session-form');
    const saveBtn = document.getElementById('save-session-btn');
    const cancelBtn = document.getElementById('cancel-session-btn');
    const formTitle = document.getElementById('session-form-title');

    document.getElementById('add-session-btn')?.addEventListener('click', () => {
      editingSessionId = null;
      formTitle.textContent = t('dash_schedule_new_title');
      saveBtn.textContent = t('dash_schedule_save');
      document.getElementById('session-day').value = getDayName(1); // Monday
      document.getElementById('session-start-time').value = '';
      document.getElementById('session-end-time').value = '';
      document.getElementById('session-location').value = '';
      addForm.style.display = 'block';
    });
    cancelBtn?.addEventListener('click', () => {
      addForm.style.display = 'none';
      editingSessionId = null;
    });
    saveBtn?.addEventListener('click', async () => {
      const day = document.getElementById('session-day').value;
      const startTime = document.getElementById('session-start-time').value.trim();
      const endTime = document.getElementById('session-end-time').value.trim();
      const location = document.getElementById('session-location').value.trim();

      if (!day || !startTime || !endTime) {
        alert(t('dash_schedule_required_fields'));
        return;
      }

      try {
        if (editingSessionId) {
          // Update existing session
          await updateDoc(doc(db, "schedules", editingSessionId), {
            day,
            startTime,
            endTime,
            location,
          });
        } else {
          // Add new session
          await addDoc(collection(db, "schedules"), {
            day,
            startTime,
            endTime,
            location,
            createdAt: new Date()
          });
        }
        addForm.style.display = 'none';
        editingSessionId = null;
      } catch (err) {
        console.error("Error saving session:", err);
      }
    });

    // Edit session
    document.querySelectorAll('.edit-session').forEach(btn => {
      btn.addEventListener('click', () => {
        editingSessionId = btn.dataset.id;
        formTitle.textContent = t('dash_schedule_edit_title');
        saveBtn.textContent = t('dash_schedule_update');
        document.getElementById('session-day').value = btn.dataset.day;
        document.getElementById('session-start-time').value = btn.dataset.start;
        document.getElementById('session-end-time').value = btn.dataset.end;
        document.getElementById('session-location').value = btn.dataset.location;
        addForm.style.display = 'block';
        addForm.scrollIntoView({ behavior: 'smooth' });
      });
    });

    // Delete session
    document.querySelectorAll('.delete-session').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (confirm(t('dash_schedule_delete_confirm'))) {
          try {
            await deleteDoc(doc(db, "schedules", btn.dataset.id));
            if (editingSessionId === btn.dataset.id) {
              addForm.style.display = 'none';
              editingSessionId = null;
            }
          } catch (err) {
            console.error("Error deleting session:", err);
          }
        }
      });
    });

    // CSV Import
    document.getElementById('import-csv-btn')?.addEventListener('click', () => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.csv';
      fileInput.addEventListener('change', handleCSVFileSelect);
      fileInput.click();
    });

    // ── Fee Summary — Season Selector ──
    document.getElementById('season-select')?.addEventListener('change', (e) => {
      currentSeason = e.target.value;
      refreshUI();
    });

    // ── Fee Summary — Goto Deposits ──
    document.getElementById('goto-deposits-link')?.addEventListener('click', (e) => {
      e.preventDefault();
      currentTab = 'deposits';
      refreshUI();
    });

    // ── Fee Summary — Expand/Collapse Meet Details ──
    document.querySelector('.fee-summary-table tbody')?.addEventListener('click', (e) => {
      const row = e.target.closest('.fee-summary-main-row');
      if (!row) return;
      const idx = row.dataset.feeIndex;
      const detailRow = document.querySelector(`.fee-summary-detail-row[data-fee-detail="${idx}"]`);
      if (!detailRow) return;

      const icon = row.querySelector('.fee-summary-expand-icon');
      const isExpanded = detailRow.classList.toggle('expanded');
      row.classList.toggle('expanded-row', isExpanded);
      if (icon) {
        icon.classList.toggle('expanded', isExpanded);
        icon.textContent = isExpanded ? '▼' : '▶';
      }
    });

    // ── Fee Summary — Export CSV ──
    document.getElementById('fee-summary-export-btn')?.addEventListener('click', () => {
      exportFeeSummaryCSV();
    });

    // ── Deposits — Season Selector ──
    document.getElementById('deposits-season-select')?.addEventListener('change', (e) => {
      currentSeason = e.target.value;
      refreshUI();
    });

    // ── Roster — Season Selector ──
    document.getElementById('roster-season-select')?.addEventListener('change', (e) => {
      currentSeason = e.target.value;
      refreshUI();
    });

    // ── Deposits — Add Swimmer ──
    document.getElementById('deposits-add-btn')?.addEventListener('click', () => {
      document.getElementById('deposits-add-form').style.display = 'block';
      document.getElementById('deposits-add-form').scrollIntoView({ behavior: 'smooth' });
    });

    document.getElementById('deposits-add-cancel')?.addEventListener('click', () => {
      document.getElementById('deposits-add-form').style.display = 'none';
      document.getElementById('deposits-add-name').value = '';
      document.getElementById('deposits-add-balance').value = '';
    });

    document.getElementById('deposits-add-save')?.addEventListener('click', async () => {
      const name = document.getElementById('deposits-add-name').value.trim();
      const balance = parseFloat(document.getElementById('deposits-add-balance').value) || 0;
      if (!name) { alert('Swimmer name is required.'); return; }
      try {
        await addDoc(collection(db, 'deposits'), {
          swimmerName: name,
          season: currentSeason,
          balance,
          deposit1Amount: null, deposit1Date: null,
          deposit2Amount: null, deposit2Date: null,
          deposit3Amount: null, deposit3Date: null,
          updatedAt: new Date(),
          updatedBy: currentUser?.email || 'unknown',
        });
        document.getElementById('deposits-add-form').style.display = 'none';
        document.getElementById('deposits-add-name').value = '';
        document.getElementById('deposits-add-balance').value = '';
      } catch (err) { console.error('Error adding deposit:', err); alert('Failed to add deposit.'); }
    });

    // ── Deposits — Upload Carry-over Balance ──
    document.getElementById('deposits-upload-balance-btn')?.addEventListener('click', () => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.xls,.xlsx';
      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        e.target.remove();
        if (!file) return;
        const result = await parseCarryOverExcel(file);
        if (!result) { alert(t('dash_fee_summary_deposit_parse_error')); return; }
        showCarryOverImportModal(result.valid, result.errors || [], file.name);
      });
      fileInput.click();
    });

    // ── Deposits — Upload Deposit Detail ──
    document.getElementById('deposits-upload-detail-btn')?.addEventListener('click', () => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.xls,.xlsx';
      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        e.target.remove();
        if (!file) return;
        const result = await parseDepositDetailExcel(file);
        if (!result) { alert(t('dash_fee_summary_deposit_parse_error')); return; }
        showDepositDetailImportModal(result.valid, result.errors || [], file.name);
      });
      fileInput.click();
    });

    // ── Deposits — Export CSV ──
    document.getElementById('deposits-export-btn')?.addEventListener('click', () => {
      exportDepositsCSV();
    });

    // ── Deposits — Inline Edit / Delete ──
    bindDepositsInlineEvents();

    // ── Results Tab — Swim Times Management ──

    // Save credentials
    document.getElementById('save-creds-btn')?.addEventListener('click', async () => {
      const msgEl = document.getElementById('creds-message');
      const deviceId = document.getElementById('creds-device-id')?.value || '';
      const subId = document.getElementById('creds-sub-id')?.value || '';
      const sessionId = document.getElementById('creds-session-id')?.value || '';

      if (!deviceId || !subId || !sessionId) {
        msgEl.textContent = '❌ Please fill in all three credential fields.';
        msgEl.style.color = 'var(--color-accent)';
        return;
      }

      try {
        await saveSwimApiCredentials(deviceId, subId, sessionId);
        msgEl.textContent = '✅ Credentials saved to Firestore.';
        msgEl.style.color = '#16A34A';
        setTimeout(() => { msgEl.textContent = ''; }, 3000);
        refreshUI(); // refresh to update status display
      } catch (err) {
        msgEl.textContent = '❌ Save failed: ' + err.message;
        msgEl.style.color = 'var(--color-accent)';
      }
    });

    // Toggle credential guide
    document.getElementById('toggle-guide-btn')?.addEventListener('click', () => {
      const guide = document.getElementById('credential-guide');
      if (guide) {
        guide.style.display = guide.style.display === 'none' ? 'block' : 'none';
      }
    });

    // Athlete results viewer — dropdown select
    const athleteSelect = document.getElementById('results-athlete-select');
    const refetchOneBtn = document.getElementById('refetch-one-btn');

    athleteSelect?.addEventListener('change', (e) => {
      const memberId = e.target.value;
      if (memberId) {
        loadAthleteResults(memberId);
        if (refetchOneBtn) refetchOneBtn.disabled = false;
      } else {
        const viewer = document.getElementById('results-viewer');
        if (viewer) viewer.style.display = 'none';
        if (refetchOneBtn) refetchOneBtn.disabled = true;
      }
    });

    // Refetch single athlete (force mode — fetches ALL meets, ignoring existing)
    refetchOneBtn?.addEventListener('click', async () => {
      const memberId = athleteSelect?.value;
      if (!memberId) return;
      if (!swimApiCredentials || !swimApiCredentials.sessionId) {
        alert('Please configure API credentials first.');
        return;
      }

      refetchOneBtn.disabled = true;
      refetchOneBtn.textContent = '⏳ Fetching...';

      const log = document.getElementById('fetch-log');
      log.style.display = 'block';
      const appendLog = (msg, isError) => {
        const line = document.createElement('div');
        line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
        line.style.color = isError ? 'var(--color-accent)' : 'var(--text-primary)';
        log.appendChild(line);
        log.scrollTop = log.scrollHeight;
      };

      try {
        appendLog(`🔄 Force-refetching athlete ${memberId}...`);

        const athleteName = athleteSelect.selectedOptions[0]?.text || '';
        const summary = await fetchSwimmerData(swimApiCredentials, memberId, athleteName, {
          force: true,
          onLog: (msg, isError) => appendLog(`   ${msg}`, isError),
          onBestTimes: (bt) => appendLog(`   📊 bestTimes: ${bt.length} entries`),
        });
        appendLog(`✅ Done — ${summary.fetched} meets fetched, ${summary.failed} failed`);
        if (summary.errors.length > 0) {
          summary.errors.slice(0, 5).forEach((e) => appendLog(`   ⚠ ${e}`, true));
          if (summary.errors.length > 5) appendLog(`   …and ${summary.errors.length - 5} more`, true);
        }

        // Reload the results viewer
        loadAthleteResults(memberId);
        // Refresh the Athlete Data Status table (refetch-one 不走事件回调)
        loadAthleteDataStatus();
      } catch (err) {
        appendLog(`❌ Refetch failed: ${err.message}`, true);
      } finally {
        refetchOneBtn.disabled = false;
        refetchOneBtn.textContent = '🔄 Refetch Selected Athlete';
      }
    });

    // Fetch all swimmer results
    document.getElementById('fetch-all-btn')?.addEventListener('click', async () => {
      if (swimResultsFetching) return;

      // Ensure credentials are loaded
      if (!swimApiCredentials || !swimApiCredentials.deviceId || !swimApiCredentials.sessionId) {
        alert('Please configure and save API credentials first.');
        return;
      }

      swimResultsFetching = true;
      const log = document.getElementById('fetch-log');
      const statusEl = document.getElementById('fetch-status');
      const btn = document.getElementById('fetch-all-btn');

      log.style.display = 'block';
      log.innerHTML = '';
      btn.disabled = true;
      btn.textContent = '⏳ Fetching...';

      const appendLog = (msg, isError) => {
        const line = document.createElement('div');
        line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
        line.style.color = isError ? 'var(--color-accent)' : 'var(--text-primary)';
        log.appendChild(line);
        log.scrollTop = log.scrollHeight;
      };

      await fetchAllSwimmerResults(swimApiCredentials, (evt) => {
        switch (evt.type) {
          case 'start':
            appendLog(`🚀 Starting fetch for ${evt.total} athlete(s)...`);
            statusEl.textContent = `⏳ 0 / ${evt.total}`;
            break;
          case 'swimmer-start':
            appendLog(`🔄 ${evt.name} (${evt.memberId})...`);
            break;
          case 'step':
            appendLog(`   📊 ${evt.step}: ${evt.count} entries`);
            break;
          case 'log':
            appendLog(`   ${evt.message}`, evt.isError);
            break;
          case 'swimmer-done':
            if (evt.written) {
              appendLog(`   ✅ Written: ${evt.bestTimes} best times, ${evt.meets} meets (${evt.newMeets} new${evt.failedMeets > 0 ? `, ${evt.failedMeets} failed` : ''})`);
            } else {
              appendLog(`   ⏭ Skipped: no new meets`);
            }
            const statusCell = document.getElementById(`status-${evt.memberId}`);
            if (statusCell) statusCell.innerHTML =
              `<span style="color:#16A34A;">✅ ${evt.bestTimes} best times, ${evt.meets} meets</span>`;
            break;
          case 'swimmer-error':
            appendLog(`   ❌ Failed: ${evt.error}`, true);
            const statusErrCell = document.getElementById(`status-${evt.memberId}`);
            if (statusErrCell) statusErrCell.innerHTML =
              `<span style="color:var(--color-accent);">❌ ${escapeHtml(evt.error)}</span>`;
            break;
          case 'progress':
            statusEl.textContent = `⏳ ${evt.index} / ${evt.total} (✅ ${evt.success} ❌ ${evt.failed})`;
            break;
          case 'done':
            statusEl.textContent = `✅ Done: ${evt.success} succeeded, ${evt.failed} failed`;
            statusEl.style.color = evt.failed > 0 ? 'var(--color-accent)' : '#16A34A';
            appendLog('');
            appendLog(`✅ Fetch complete — ${evt.success} succeeded, ${evt.failed} failed`);
            if (evt.errors.length > 0) {
              appendLog('Error details:', true);
              evt.errors.forEach(e => appendLog(`  • ${e}`, true));
            }
            swimResultsFetching = false;
            btn.disabled = false;
            btn.textContent = '🔄 Fetch All Swimmer Results';
            break;
          case 'error':
            appendLog(`❌ ${evt.message}`, true);
            statusEl.textContent = '❌ Failed';
            statusEl.style.color = 'var(--color-accent)';
            swimResultsFetching = false;
            btn.disabled = false;
            btn.textContent = '🔄 Fetch All Swimmer Results';
            break;
        }
      });
    });
  }
}

// Initial render
initApp();
