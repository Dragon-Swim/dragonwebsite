import{i as w,t as F}from"./theme-toggle-CI3g1rpd.js";import{o as z,g as H,d as y,a as r,b as j,q as D,c as I,e as g,f as M,s as G,h as T,i as B}from"./firebase-B98Sn2Xf.js";w();const m=[{id:1,name:"Endurance Base Building",season:"Winter 2026",daysPerWeek:4,priority:"High",progress:72,tasks:"18 / 25 workouts completed",due:"Feb 28, 2026",status:"In Progress"},{id:2,name:"Sprint Technique Focus",season:"Spring 2026",daysPerWeek:3,priority:"Medium",progress:45,tasks:"9 / 20 workouts completed",due:"Mar 15, 2026",status:"In Progress"},{id:3,name:"Stroke Refinement (Butterfly)",season:"Summer 2026",daysPerWeek:5,priority:"Low",progress:0,tasks:"0 / 12 workouts completed",due:"Apr 30, 2026",status:"Not Started"},{id:4,name:"Fall Conditioning",season:"Fall 2025",daysPerWeek:3,priority:"High",progress:100,tasks:"30 / 30 workouts completed",due:"Nov 20, 2025",status:"Completed"}];let h=[],$=[],u=null,l="swimmer";const f=[{id:101,name:"Alice Thompson",group:"Competitive",age:14,rank:"Regional"},{id:102,name:"Bob Wilson",group:"Intermediate",age:12,rank:"Novice"},{id:103,name:"Charlie Brown",group:"Competitive",age:15,rank:"State"},{id:104,name:"Daisy Miller",group:"Beginner",age:10,rank:"Novice"},{id:105,name:"Ethan Hunt",group:"Competitive",age:16,rank:"National"}];let n="overview",A=!1;function Y(){const e=document.getElementById("app");e.innerHTML=`
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; gap: 20px; font-family: sans-serif;">
      <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #f5c518; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <p style="color: #666;">Loading your Dragon dashboard...</p>
      <style>
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    </div>
  `,console.log("Dashboard: Initializing auth listener..."),z(j,async a=>{if(!a){console.log("Dashboard: No user authenticated, redirecting to signin..."),window.location.href="/dragonwebsite/signin.html";return}u=a,console.log("Dashboard: User authenticated:",a.email);try{console.log("Dashboard: Fetching user document...");const t=await H(y(r,"users",a.uid));l=a.email&&a.email.toLowerCase()==="dragonswim@outlook.com"?"coach":t.exists()?t.data().role:"swimmer",console.log("Dashboard: Detected role:",l),A?(console.log("Dashboard: Refreshing UI..."),p()):(console.log("Dashboard: Initializing data listeners..."),V(),A=!0)}catch(t){console.error("Dashboard Critical Error:",t),e.innerHTML=`
        <div style="padding: 40px; text-align: center; font-family: sans-serif; max-width: 500px; margin: 100px auto; border: 1px solid #fee2e2; background: #fef2f2; border-radius: 12px; color: #991b1b;">
          <h2 style="margin-bottom: 16px;">Failed to load dashboard</h2>
          <p style="margin-bottom: 24px;">Something went wrong while setting up your workspace. This might be due to a connection issue or a configuration error.</p>
          <code style="display: block; padding: 12px; background: #fee2e2; border-radius: 6px; font-size: 13px; text-align: left; overflow-x: auto; margin-bottom: 24px;">
            ${t.message||"Unknown error"}
          </code>
          <button onclick="window.location.reload()" style="padding: 10px 20px; background: #991b1b; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Retry Loading</button>
        </div>
      `,l="swimmer"}})}function V(){const e=D(g(r,"meets"),I("createdAt","desc"));M(e,t=>{h=t.docs.map(s=>({id:s.id,...s.data()})),p()},t=>{console.error("Error listening to meets:",t)});const a=D(g(r,"schedules"),I("createdAt","asc"));M(a,t=>{$=t.docs.map(s=>({id:s.id,...s.data()})),p()},t=>{console.error("Error listening to schedules:",t)})}function p(){u&&(l==="coach"?K(u):J(u))}function J(e){const a=document.getElementById("app");a.innerHTML=`
    <div class="dash-layout">
      <!-- Sidebar -->
      <aside class="dash-sidebar" id="dash-sidebar">
        <div class="dash-sidebar-header">
          <a href="/dragonwebsite/" class="dash-logo">
            <img src="/dragonwebsite/logo-light.jpg" alt="Dragon Swim Team" class="dash-logo-img light-logo" />
            <img src="/dragonwebsite/logo-dark.png" alt="Dragon Swim Team" class="dash-logo-img dark-logo" />
          </a>
        </div>
        <nav class="dash-nav">
          <div class="dash-nav-section">
            <span class="dash-nav-label">Menu</span>
            <button class="dash-nav-item ${n==="overview"?"active":""}" data-tab="overview">
              <span class="dash-nav-icon">📊</span> Overview
            </button>
            <button class="dash-nav-item ${n==="plans"?"active":""}" data-tab="plans">
              <span class="dash-nav-icon">📋</span> Swim Plans
            </button>
            <button class="dash-nav-item ${n==="meets"?"active":""}" data-tab="meets">
              <span class="dash-nav-icon">🏆</span> Swim Meets
            </button>
            <button class="dash-nav-item ${n==="schedule"?"active":""}" data-tab="schedule">
              <span class="dash-nav-icon">📅</span> Schedule
            </button>
          </div>
          <div class="dash-nav-section" style="margin-top: auto;">
            <span class="dash-nav-label">System</span>
            <a href="/dragonwebsite/contact.html" class="dash-nav-item" style="text-decoration: none;">
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
              <h1 class="dash-page-title">${R(n)}</h1>
              <p class="dash-page-subtitle">${Q(n)}</p>
            </div>
          </div>
          <div class="dash-topbar-right">
            <div class="dash-search">
              <span class="dash-search-icon">🔍</span>
              <input type="text" class="dash-search-input" placeholder="Search...">
            </div>
            <div class="dash-user">
              <div class="dash-avatar" id="dash-user-initial">${(e.displayName||e.email||"D").charAt(0).toUpperCase()}</div>
              <div class="dash-user-name" id="dash-user-name-display">${e.displayName||e.email||"Swimmer"}</div>
            </div>
          </div>
        </header>

        <!-- Dynamic Content -->
        <div class="dash-content">
          ${O(n,"swimmer")}
        </div>
      </main>
    </div>
  `,W(),w(),U()}function K(e){const a=document.getElementById("app");a.innerHTML=`
    <div class="dash-layout">
      <!-- Sidebar -->
      <aside class="dash-sidebar" id="dash-sidebar">
        <div class="dash-sidebar-header">
          <a href="/dragonwebsite/" class="dash-logo">
            <img src="/dragonwebsite/logo-light.jpg" alt="Dragon Swim Team" class="dash-logo-img light-logo" />
            <img src="/dragonwebsite/logo-dark.png" alt="Dragon Swim Team" class="dash-logo-img dark-logo" />
          </a>
        </div>
        <nav class="dash-nav">
          <div class="dash-nav-section">
            <span class="dash-nav-label">Coach Menu</span>
            <button class="dash-nav-item ${n==="overview"?"active":""}" data-tab="overview">
              <span class="dash-nav-icon">🏠</span> Overview
            </button>
            <button class="dash-nav-item ${n==="roster"?"active":""}" data-tab="roster">
              <span class="dash-nav-icon">👥</span> Swimmer Roster
            </button>
            <button class="dash-nav-item ${n==="meets"?"active":""}" data-tab="meets">
              <span class="dash-nav-icon">🏁</span> Meet Management
            </button>
            <button class="dash-nav-item ${n==="schedule"?"active":""}" data-tab="schedule">
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
              <h1 class="dash-page-title">Coach: ${R(n,"coach")}</h1>
              <p class="dash-page-subtitle">Managing the Dragon Swim Team roster and sessions</p>
            </div>
          </div>
          <div class="dash-topbar-right">
             <div class="badge badge-primary" style="margin-right: 1rem;">Coach Mode</div>
            <div class="dash-user">
              <div class="dash-avatar" style="background: var(--color-accent); color: white;">${(e.displayName||e.email||"C").charAt(0).toUpperCase()}</div>
              <div class="dash-user-name">${e.displayName||e.email||"Coach"}</div>
            </div>
          </div>
        </header>

        <!-- Dynamic Content -->
        <div class="dash-content">
          ${O(n,"coach")}
        </div>
      </main>
    </div>
  `,W(),w(),U()}function R(e,a="swimmer"){return a==="coach"?{overview:"Coach Dashboard",roster:"Team Roster",meets:"Meet Management",schedule:"Season Schedule"}[e]||"Coach Dashboard":{overview:"Dashboard",plans:"Swim Plans",meets:"Swim Meets",schedule:"Practice Schedule"}[e]||"Dashboard"}function Q(e){return{overview:"Overview of your swim season at a glance",plans:"Track and manage your training plans",meets:"View registered and upcoming competitions",schedule:"Your weekly practice timetable"}[e]||""}function O(e,a="swimmer"){if(a==="coach")switch(e){case"overview":return L();case"roster":return X();case"meets":return P();case"schedule":return N();default:return L()}switch(e){case"overview":return Z();case"plans":return se();case"meets":return P();case"schedule":return N();default:return""}}function U(){const e=document.getElementById("sidebar-theme-icon");if(e){const a=document.documentElement.getAttribute("data-theme")==="dark";e.textContent=a?"☀️":"🌙"}}function L(){return`
    <div class="dash-stats-row">
      <div class="dash-stat-card">
        <div class="dash-stat-number">${f.length}</div>
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
          ${f.slice(0,3).map(e=>`
            <div class="dash-mini-card">
               <div class="dash-mini-top">
                <span class="dash-mini-name">${e.name}</span>
                <span class="badge badge-primary">${e.rank}</span>
              </div>
              <div class="dash-mini-meta">Group: ${e.group} · Age: ${e.age}</div>
            </div>
          `).join("")}
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
  `}function X(){return`
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
            ${f.map(e=>`
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 1rem; font-weight: 500;">${e.name}</td>
                <td style="padding: 1rem;"><span class="group-badge">${e.group}</span></td>
                <td style="padding: 1rem;">${e.age}</td>
                <td style="padding: 1rem;"><span class="status-badge status-registered">${e.rank}</span></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}function Z(){const e=m.filter(s=>s.status!=="Completed").length,a=m.filter(s=>s.status==="Completed").length,t=h.filter(s=>s.status!=="Completed").length;return`
    <div class="dash-stats-row">
      <div class="dash-stat-card">
        <div class="dash-stat-number">${m.length}</div>
        <div class="dash-stat-label">Total Plans</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${e}</div>
        <div class="dash-stat-label">Active Plans</div>
      </div>
      <div class="dash-stat-card accent">
        <div class="dash-stat-number">${a}</div>
        <div class="dash-stat-label">Completed</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${t}</div>
        <div class="dash-stat-label">Upcoming Meets</div>
      </div>
    </div>

    <div class="dash-overview-grid">
      <div class="dash-panel">
        <h3 class="dash-panel-title">Active Swim Plans</h3>
        <div class="dash-panel-body">
          ${m.filter(s=>s.status!=="Completed").map(s=>_(s)).join("")}
        </div>
      </div>
      <div class="dash-panel">
        <h3 class="dash-panel-title">Upcoming Meets</h3>
        <div class="dash-panel-body">
          ${h.filter(s=>s.status!=="Completed").map(s=>ee(s)).join("")}
        </div>
      </div>
    </div>

    <div class="dash-panel">
      <h3 class="dash-panel-title">Today's Practice</h3>
      <div class="dash-panel-body">
        ${ae()}
      </div>
    </div>
  `}function _(e){return`
    <div class="dash-mini-card">
      <div class="dash-mini-top">
        <span class="dash-mini-name">${e.name}</span>
        <span class="priority-badge priority-${e.priority.toLowerCase()}">${e.priority}</span>
      </div>
      <div class="dash-progress-row">
        <div class="dash-progress-bar"><div class="dash-progress-fill" style="width: ${e.progress}%"></div></div>
        <span class="dash-progress-pct">${e.progress}%</span>
      </div>
    </div>
  `}function ee(e){const a=e.status||"Open";return`
    <div class="dash-mini-card">
      <div class="dash-mini-top">
        <span class="dash-mini-name">${e.name||"Untitled Meet"}</span>
        <span class="status-badge status-${a.toLowerCase().replace(" ","-")}">${a}</span>
      </div>
      <div class="dash-mini-meta">${e.date||""} · ${e.location||""}</div>
    </div>
  `}function ae(){const a=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date().getDay()],t=$.filter(s=>s.day===a);return t.length===0?`<p class="dash-empty">No practices scheduled for today (${a}). Rest day! 🎉</p>`:t.map(s=>`
    <div class="dash-mini-card">
      <div class="dash-mini-top">
        <span class="dash-mini-name">${s.focus}</span>
        <span class="group-badge">${s.group}</span>
      </div>
      <div class="dash-mini-meta">${s.time} · ${s.coach}</div>
    </div>
  `).join("")}function se(){return`
    <div class="dash-cards-grid">
      ${m.map(e=>`
        <div class="dash-card">
          <div class="dash-card-header">
            <h3 class="dash-card-title">${e.name}</h3>
            <div class="dash-card-badges">
              <span class="status-badge status-${e.status.toLowerCase().replace(" ","-")}">${e.status}</span>
              <span class="priority-badge priority-${e.priority.toLowerCase()}">${e.priority}</span>
            </div>
          </div>
          <div class="dash-card-body">
            <div class="dash-card-row">
              <span class="dash-card-label">Progress</span>
              <span class="dash-card-value">${e.progress}%</span>
            </div>
            <div class="dash-progress-bar"><div class="dash-progress-fill" style="width: ${e.progress}%"></div></div>
            <div class="dash-card-meta">
              <span>📅 Season: ${e.season}</span>
              <span>Training: ${e.daysPerWeek} Days/Week</span>
            </div>
            <div class="dash-card-meta">
              <span>📋 ${e.tasks}</span>
              <span>Due: ${e.due}</span>
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `}function P(){const e=l==="coach";return`
    <div class="dash-section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2 style="font-size: 1.5rem; font-weight: 600; color: var(--text-primary);">Upcoming Meets</h2>
      ${e?'<button class="btn btn-primary btn-sm" id="add-meet-btn">+ Add Meet</button>':""}
    </div>

    ${e?`
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
    `:""}

    <div class="dash-cards-grid">
      ${h.length===0?'<p class="dash-empty">No meets scheduled yet.</p>':h.map(a=>`
        <div class="dash-card">
          <div class="dash-card-header">
            <h3 class="dash-card-title">${a.name}</h3>
            <span class="status-badge status-${(a.status||"Open").toLowerCase().replace(" ","-")}">${a.status||"Open"}</span>
          </div>
          <div class="dash-card-body">
            <div class="dash-card-meta">
              <span>📅 ${a.date}</span>
              <span>📍 ${a.location}</span>
            </div>
            <div class="dash-card-events">
              <span class="dash-card-label">Events</span>
              <div class="dash-event-tags">
                ${(a.events||[]).map(t=>`<span class="event-tag">${t}</span>`).join("")}
              </div>
            </div>
            <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
              ${!e&&a.status==="Open"?'<button class="btn btn-primary btn-sm dash-register-btn">Register</button>':""}
              ${e?`<button class="btn btn-outline btn-sm delete-meet" data-id="${a.id}" style="color: var(--color-accent); border-color: var(--color-accent);">Delete</button>`:""}
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `}function N(){const e=l==="coach",a=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];return`
    <div class="dash-section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2 style="font-size: 1.5rem; font-weight: 600; color: var(--text-primary);">Weekly Schedule</h2>
      ${e?'<button class="btn btn-primary btn-sm" id="add-session-btn">+ Add Session</button>':""}
    </div>

    ${e?`
      <div id="add-session-form" class="dash-panel" style="display: none; margin-bottom: 2rem; padding: 1.5rem;">
        <h3 style="margin-bottom: 1rem;">New Practice Session</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem;">
          <select id="session-day" class="form-input">
            ${a.map(t=>`<option value="${t}">${t}</option>`).join("")}
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
    `:""}

    <div class="dash-schedule-grid">
      ${a.map(t=>{const s=$.filter(i=>i.day===t);return`
          <div class="dash-schedule-day">
            <h3 class="dash-schedule-day-name">${t}</h3>
            ${s.length===0?'<p class="dash-empty-sm">No practice</p>':s.map(i=>`
                <div class="dash-schedule-item">
                  <div class="dash-schedule-time">${i.time}</div>
                  <div class="dash-schedule-focus">${i.focus}</div>
                  <div class="dash-schedule-meta" style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <span class="group-badge">${i.group}</span>
                      <span>${i.coach}</span>
                    </div>
                    ${e?`<button class="delete-session" data-id="${i.id}" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--color-accent); padding: 0 5px;">&times;</button>`:""}
                  </div>
                </div>
              `).join("")}
          </div>
        `}).join("")}
    </div>
  `}function W(){var t,s,i,E,k,S,x,C;document.querySelectorAll(".dash-nav-item[data-tab]").forEach(d=>{d.addEventListener("click",()=>{n=d.dataset.tab,p()})}),(t=document.getElementById("dash-theme-toggle"))==null||t.addEventListener("click",()=>{F(),p()});const e=document.getElementById("dash-hamburger"),a=document.getElementById("dash-sidebar");e==null||e.addEventListener("click",()=>{a.classList.toggle("open")}),document.querySelectorAll(".dash-register-btn").forEach(d=>{d.addEventListener("click",()=>{window.location.href="/dragonwebsite/registration.html"})}),(s=document.getElementById("sidebar-signout"))==null||s.addEventListener("click",async()=>{try{await G(j),window.location.href="/dragonwebsite/signin.html"}catch(d){console.error("Error signing out:",d)}}),l==="coach"&&((i=document.getElementById("add-meet-btn"))==null||i.addEventListener("click",()=>{document.getElementById("add-meet-form").style.display="block"}),(E=document.getElementById("cancel-meet-btn"))==null||E.addEventListener("click",()=>{document.getElementById("add-meet-form").style.display="none"}),(k=document.getElementById("save-meet-btn"))==null||k.addEventListener("click",async()=>{const d=document.getElementById("meet-name").value,o=document.getElementById("meet-date").value,v=document.getElementById("meet-location").value,b=document.getElementById("meet-events").value;if(!d||!o){alert("Please provide at least a name and date.");return}try{await T(g(r,"meets"),{name:d,date:o,location:v,events:b.split(",").map(c=>c.trim()),status:"Open",createdAt:new Date}),document.getElementById("add-meet-form").style.display="none"}catch(c){console.error("Error adding meet:",c)}}),document.querySelectorAll(".delete-meet").forEach(d=>{d.addEventListener("click",async()=>{if(confirm("Are you sure you want to delete this meet?"))try{await B(y(r,"meets",d.dataset.id))}catch(o){console.error("Error deleting meet:",o)}})}),(S=document.getElementById("add-session-btn"))==null||S.addEventListener("click",()=>{document.getElementById("add-session-form").style.display="block"}),(x=document.getElementById("cancel-session-btn"))==null||x.addEventListener("click",()=>{document.getElementById("add-session-form").style.display="none"}),(C=document.getElementById("save-session-btn"))==null||C.addEventListener("click",async()=>{const d=document.getElementById("session-day").value,o=document.getElementById("session-time").value,v=document.getElementById("session-group").value,b=document.getElementById("session-focus").value,c=document.getElementById("session-coach").value;if(!o||!v){alert("Please provide time and group.");return}try{await T(g(r,"schedules"),{day:d,time:o,group:v,focus:b,coach:c,createdAt:new Date}),document.getElementById("add-session-form").style.display="none"}catch(q){console.error("Error adding session:",q)}}),document.querySelectorAll(".delete-session").forEach(d=>{d.addEventListener("click",async()=>{if(confirm("Are you sure you want to delete this session?"))try{await B(y(r,"schedules",d.dataset.id))}catch(o){console.error("Error deleting session:",o)}})}))}Y();
