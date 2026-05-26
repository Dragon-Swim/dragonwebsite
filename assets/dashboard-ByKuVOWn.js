import{i as C,t as oe}from"./theme-toggle-CI3g1rpd.js";import{o as le,h as re,g as h,e as m,b as S,q as k,m as z,c as y,k as G,l as ce,w as me,i as pe,r as Y,u as I,a as V,f as J}from"./firebase-DS2n7X8_.js";C();const b=[{id:1,name:"Endurance Base Building",season:"Winter 2026",daysPerWeek:4,priority:"High",progress:72,tasks:"18 / 25 workouts completed",due:"Feb 28, 2026",status:"In Progress"},{id:2,name:"Sprint Technique Focus",season:"Spring 2026",daysPerWeek:3,priority:"Medium",progress:45,tasks:"9 / 20 workouts completed",due:"Mar 15, 2026",status:"In Progress"},{id:3,name:"Stroke Refinement (Butterfly)",season:"Summer 2026",daysPerWeek:5,priority:"Low",progress:0,tasks:"0 / 12 workouts completed",due:"Apr 30, 2026",status:"Not Started"},{id:4,name:"Fall Conditioning",season:"Fall 2025",daysPerWeek:3,priority:"High",progress:100,tasks:"30 / 30 workouts completed",due:"Nov 20, 2025",status:"Completed"}];let f=[],x=[],g=null,v="swimmer",d=null,E=null;const B=[{id:101,name:"Alice Thompson",group:"Competitive",age:14,rank:"Regional"},{id:102,name:"Bob Wilson",group:"Intermediate",age:12,rank:"Novice"},{id:103,name:"Charlie Brown",group:"Competitive",age:15,rank:"State"},{id:104,name:"Daisy Miller",group:"Beginner",age:10,rank:"Novice"},{id:105,name:"Ethan Hunt",group:"Competitive",age:16,rank:"National"}];let o="overview",K=!1;function ue(){const e=document.getElementById("app");e.innerHTML=`
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; gap: 20px; font-family: sans-serif;">
      <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #f5c518; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <p style="color: #666;">Loading your Dragon dashboard...</p>
      <style>
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    </div>
  `,console.log("Dashboard: Initializing auth listener...");const s=setTimeout(()=>{console.warn("Dashboard: Auth listener timed out — redirecting to signin"),window.location.href="/dragonwebsite/signin.html"},5e3);le(S,async t=>{if(clearTimeout(s),!t){console.log("Dashboard: No user authenticated, redirecting to signin..."),window.location.href="/dragonwebsite/signin.html";return}g=t,console.log("Dashboard: User authenticated:",t.email);try{console.log("Dashboard: Fetching user document...");const a=await re(h(m,"users",t.uid));v=t.email&&t.email.toLowerCase()==="dragonswim@outlook.com"?"coach":a.exists()?a.data().role:"swimmer",console.log("Dashboard: Detected role:",v),K?(console.log("Dashboard: Refreshing UI..."),u()):(console.log("Dashboard: Initializing data listeners..."),ve(),K=!0,u())}catch(a){console.error("Dashboard Critical Error:",a),e.innerHTML=`
        <div style="padding: 40px; text-align: center; font-family: sans-serif; max-width: 500px; margin: 100px auto; border: 1px solid #fee2e2; background: #fef2f2; border-radius: 12px; color: #991b1b;">
          <h2 style="margin-bottom: 16px;">Failed to load dashboard</h2>
          <p style="margin-bottom: 24px;">Something went wrong while setting up your workspace. This might be due to a connection issue or a configuration error.</p>
          <code style="display: block; padding: 12px; background: #fee2e2; border-radius: 6px; font-size: 13px; text-align: left; overflow-x: auto; margin-bottom: 24px;">
            ${a.message||"Unknown error"}
          </code>
          <button onclick="window.location.reload()" style="padding: 10px 20px; background: #991b1b; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Retry Loading</button>
        </div>
      `,v="swimmer"}})}function ve(){const e=k(y(m,"meets"),z("createdAt","desc"));G(e,t=>{f=t.docs.map(a=>({id:a.id,...a.data()})),u()},t=>{console.error("Error listening to meets:",t)});const s=k(y(m,"schedules"),z("createdAt","asc"));G(s,t=>{x=t.docs.map(a=>({id:a.id,...a.data()})),u()},t=>{console.error("Error listening to schedules:",t)}),ae()}async function ae(){if(!g)return;const e=k(y(m,"registrations"),me("uid","==",g.uid),ce(1)),s=await pe(e);s.empty||(E=s.docs[0].id,d=s.docs[0].data())}function u(){g&&ae().then(()=>{Q()}).catch(e=>{console.error("Error fetching family data:",e),Q()})}function Q(){v==="coach"?ge(g):he(g)}function he(e){const s=document.getElementById("app");s.innerHTML=`
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
            <button class="dash-nav-item ${o==="overview"?"active":""}" data-tab="overview">
              <span class="dash-nav-icon">📊</span> Overview
            </button>
            <button class="dash-nav-item ${o==="profile"?"active":""}" data-tab="profile">
              <span class="dash-nav-icon">👤</span> Profile
            </button>
            <button class="dash-nav-item ${o==="plans"?"active":""}" data-tab="plans">
              <span class="dash-nav-icon">📋</span> Swim Plans
            </button>
            <button class="dash-nav-item ${o==="meets"?"active":""}" data-tab="meets">
              <span class="dash-nav-icon">🏆</span> Swim Meets
            </button>
            <button class="dash-nav-item ${o==="schedule"?"active":""}" data-tab="schedule">
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
              <h1 class="dash-page-title">${se(o)}</h1>
              <p class="dash-page-subtitle">${be(o)}</p>
            </div>
          </div>
          <div class="dash-topbar-right">
            <div class="dash-user-menu" id="user-menu">
              <button class="dash-user-trigger" id="user-trigger">
                <div class="dash-avatar">${(X()||e.email||"D").charAt(0).toUpperCase()}</div>
                <span class="dash-user-name">${X()||e.email||"Swimmer"}</span>
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
          ${te(o,"swimmer")}
        </div>
      </main>
    </div>
  `,ie(),C(),ne()}function ge(e){const s=document.getElementById("app");s.innerHTML=`
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
            <button class="dash-nav-item ${o==="overview"?"active":""}" data-tab="overview">
              <span class="dash-nav-icon">🏠</span> Overview
            </button>
            <button class="dash-nav-item ${o==="roster"?"active":""}" data-tab="roster">
              <span class="dash-nav-icon">👥</span> Swimmer Roster
            </button>
            <button class="dash-nav-item ${o==="meets"?"active":""}" data-tab="meets">
              <span class="dash-nav-icon">🏁</span> Meet Management
            </button>
            <button class="dash-nav-item ${o==="schedule"?"active":""}" data-tab="schedule">
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
              <h1 class="dash-page-title">Coach: ${se(o,"coach")}</h1>
              <p class="dash-page-subtitle">Managing the Dragon Swim Team roster and sessions</p>
            </div>
          </div>
          <div class="dash-topbar-right">
            <div class="badge badge-primary" style="margin-right: 1rem;">Coach Mode</div>
            <div class="dash-user-menu" id="user-menu">
              <button class="dash-user-trigger" id="user-trigger">
                <div class="dash-avatar" style="background: var(--color-accent); color: white;">${(e.displayName||e.email||"C").charAt(0).toUpperCase()}</div>
                <span class="dash-user-name">${e.displayName||e.email||"Coach"}</span>
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
          ${te(o,"coach")}
        </div>
      </main>
    </div>
  `,ie(),C(),ne()}function X(){if(!d||!d.parent)return null;const e=d.parent;return[e.firstName,e.lastName].filter(Boolean).join(" ")||null}function se(e,s="swimmer"){return s==="coach"?{overview:"Coach Dashboard",roster:"Team Roster",meets:"Meet Management",schedule:"Season Schedule"}[e]||"Coach Dashboard":{overview:"Dashboard",profile:"Family Profile",plans:"Swim Plans",meets:"Swim Meets",schedule:"Practice Schedule"}[e]||"Dashboard"}function be(e){return{overview:"Overview of your swim season at a glance",profile:"Manage your family information and swimmers",plans:"Track and manage your training plans",meets:"View registered and upcoming competitions",schedule:"Your weekly practice timetable"}[e]||""}function te(e,s="swimmer"){if(s==="coach")switch(e){case"overview":return Z();case"roster":return ye();case"meets":return _();case"schedule":return ee();default:return Z()}switch(e){case"overview":return fe();case"profile":return Se();case"plans":return ke();case"meets":return _();case"schedule":return ee();default:return""}}function ne(){const e=document.getElementById("sidebar-theme-icon");if(e){const s=document.documentElement.getAttribute("data-theme")==="dark";e.textContent=s?"☀️":"🌙"}}function Z(){return`
    <div class="dash-stats-row">
      <div class="dash-stat-card">
        <div class="dash-stat-number">${B.length}</div>
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
          ${B.slice(0,3).map(e=>`
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
  `}function ye(){return`
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
            ${B.map(e=>`
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
  `}function fe(){const e=b.filter(a=>a.status!=="Completed").length,s=b.filter(a=>a.status==="Completed").length,t=f.filter(a=>a.status!=="Completed").length;return`
    <div class="dash-stats-row">
      <div class="dash-stat-card">
        <div class="dash-stat-number">${b.length}</div>
        <div class="dash-stat-label">Total Plans</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${e}</div>
        <div class="dash-stat-label">Active Plans</div>
      </div>
      <div class="dash-stat-card accent">
        <div class="dash-stat-number">${s}</div>
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
          ${b.filter(a=>a.status!=="Completed").map(a=>we(a)).join("")}
        </div>
      </div>
      <div class="dash-panel">
        <h3 class="dash-panel-title">Upcoming Meets</h3>
        <div class="dash-panel-body">
          ${f.filter(a=>a.status!=="Completed").map(a=>$e(a)).join("")}
        </div>
      </div>
    </div>

    <div class="dash-panel">
      <h3 class="dash-panel-title">Today's Practice</h3>
      <div class="dash-panel-body">
        ${Ee()}
      </div>
    </div>
  `}function we(e){return`
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
  `}function $e(e){const s=e.status||"Open";return`
    <div class="dash-mini-card">
      <div class="dash-mini-top">
        <span class="dash-mini-name">${e.name||"Untitled Meet"}</span>
        <span class="status-badge status-${s.toLowerCase().replace(" ","-")}">${s}</span>
      </div>
      <div class="dash-mini-meta">${e.date||""} · ${e.location||""}</div>
    </div>
  `}function Ee(){const s=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date().getDay()],t=x.filter(a=>a.day===s);return t.length===0?`<p class="dash-empty">No practices scheduled for today (${s}). Rest day! 🎉</p>`:t.map(a=>`
    <div class="dash-mini-card">
      <div class="dash-mini-top">
        <span class="dash-mini-name">${a.focus}</span>
        <span class="group-badge">${a.group}</span>
      </div>
      <div class="dash-mini-meta">${a.time} · ${a.coach}</div>
    </div>
  `).join("")}function Se(){if(!d)return`<div class="dash-panel" style="text-align: center; padding: 3rem;">
      <p class="dash-empty">No family registration found.</p>
      <p style="margin-top: 1rem;"><a href="/dragonwebsite/registration.html" class="btn btn-primary">Complete Registration</a></p>
    </div>`;const e=d.parent||{},s=d.spouse,t=d.swimmers||[],a=d.emergencyContact||{};return`
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
              <span class="profile-value">${[e.firstName,e.middleName,e.lastName].filter(Boolean).join(" ")||"—"}</span>
            </div>
            <div class="profile-field">
              <span class="profile-label">Gender</span>
              <span class="profile-value">${e.gender||"—"}</span>
            </div>
            <div class="profile-field">
              <span class="profile-label">Email</span>
              <span class="profile-value">${e.email||"—"}</span>
            </div>
            <div class="profile-field">
              <span class="profile-label">Phone</span>
              <span class="profile-value profile-display" id="display-parent-phone">${e.phone||"—"}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-parent-phone" value="${e.phone||""}" />
            </div>
            <div class="profile-field">
              <span class="profile-label">Address</span>
              <span class="profile-value profile-display" id="display-parent-address">${e.address||"—"}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-parent-address" value="${e.address||""}" />
            </div>
          </div>
        </div>

        ${s?`
        <div class="dash-panel">
          <h3>Spouse / Partner</h3>
          <div class="profile-fields">
            <div class="profile-field">
              <span class="profile-label">Name</span>
              <span class="profile-value">${[s.firstName,s.middleName,s.lastName].filter(Boolean).join(" ")||"—"}</span>
            </div>
            <div class="profile-field">
              <span class="profile-label">Gender</span>
              <span class="profile-value">${s.gender||"—"}</span>
            </div>
            <div class="profile-field">
              <span class="profile-label">Phone</span>
              <span class="profile-value profile-display" id="display-spouse-phone">${s.phone||"—"}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-spouse-phone" value="${s.phone||""}" />
            </div>
            <div class="profile-field">
              <span class="profile-label">Email</span>
              <span class="profile-value profile-display" id="display-spouse-email">${s.email||"—"}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-spouse-email" value="${s.email||""}" />
            </div>
          </div>
        </div>
        `:""}

        <div class="dash-panel">
          <h3>Emergency Contact</h3>
          <div class="profile-fields">
            <div class="profile-field">
              <span class="profile-label">Name</span>
              <span class="profile-value profile-display" id="display-emergency-name">${a.name||"—"}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-emergency-name" value="${a.name||""}" />
            </div>
            <div class="profile-field">
              <span class="profile-label">Phone</span>
              <span class="profile-value profile-display" id="display-emergency-phone">${a.phone||"—"}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-emergency-phone" value="${a.phone||""}" />
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
            <h3>Swimmers (${t.length})</h3>
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
          ${t.filter(i=>!i.deleted).length===0?'<p class="dash-empty">No swimmers registered.</p>':t.map((i,w)=>i.deleted?"":`

            <div class="swimmer-profile-card">
              <div class="swimmer-profile-info">
                <strong>${[i.firstName,i.middleName,i.lastName].filter(Boolean).join(" ")}</strong>
                <div class="swimmer-profile-meta">
                  <span>${i.gender||"—"}</span>
                  <span>DOB: ${i.dob||"—"}</span>
                  ${i.usaSwimmingId?`<span>USA ID: ${i.usaSwimmingId}</span>`:""}
                  ${i.joinDate?`<span>Joined: ${i.joinDate}</span>`:""}
                </div>
              </div>
              <button class="btn btn-outline btn-sm delete-swimmer-btn" data-index="${w}" style="color: var(--color-accent); border-color: var(--color-accent);">Remove</button>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `}function ke(){return`
    <div class="dash-cards-grid">
      ${b.map(e=>`
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
  `}function _(){const e=v==="coach";return`
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
      ${f.length===0?'<p class="dash-empty">No meets scheduled yet.</p>':f.map(s=>`
        <div class="dash-card">
          <div class="dash-card-header">
            <h3 class="dash-card-title">${s.name}</h3>
            <span class="status-badge status-${(s.status||"Open").toLowerCase().replace(" ","-")}">${s.status||"Open"}</span>
          </div>
          <div class="dash-card-body">
            <div class="dash-card-meta">
              <span>📅 ${s.date}</span>
              <span>📍 ${s.location}</span>
            </div>
            <div class="dash-card-events">
              <span class="dash-card-label">Events</span>
              <div class="dash-event-tags">
                ${(s.events||[]).map(t=>`<span class="event-tag">${t}</span>`).join("")}
              </div>
            </div>
            <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
              ${!e&&s.status==="Open"?'<button class="btn btn-primary btn-sm dash-register-btn">Register</button>':""}
              ${e?`<button class="btn btn-outline btn-sm delete-meet" data-id="${s.id}" style="color: var(--color-accent); border-color: var(--color-accent);">Delete</button>`:""}
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `}function ee(){const e=v==="coach",s=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];return`
    <div class="dash-section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2 style="font-size: 1.5rem; font-weight: 600; color: var(--text-primary);">Weekly Schedule</h2>
      ${e?'<button class="btn btn-primary btn-sm" id="add-session-btn">+ Add Session</button>':""}
    </div>

    ${e?`
      <div id="add-session-form" class="dash-panel" style="display: none; margin-bottom: 2rem; padding: 1.5rem;">
        <h3 style="margin-bottom: 1rem;">New Practice Session</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem;">
          <select id="session-day" class="form-input">
            ${s.map(t=>`<option value="${t}">${t}</option>`).join("")}
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
      ${s.map(t=>{const a=x.filter(i=>i.day===t);return`
          <div class="dash-schedule-day">
            <h3 class="dash-schedule-day-name">${t}</h3>
            ${a.length===0?'<p class="dash-empty-sm">No practice</p>':a.map(i=>`
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
  `}function Ie(e,s){const t=document.createElement("div");t.className="confirm-overlay",t.innerHTML=`
    <div class="confirm-modal">
      <h3 class="confirm-title">Remove Swimmer</h3>
      <p class="confirm-body">You are about to remove <strong style="color: var(--color-accent, #dc3545);">${e}</strong> from your family registration.</p>
      <p class="confirm-warning">This swimmer will be marked as inactive. Contact a coach if you need to restore this record.</p>
      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="confirm-cancel">Cancel</button>
        <button class="btn btn-sm" id="confirm-delete" style="background: var(--color-accent, #dc3545); color: white; border: none;">Delete</button>
      </div>
    </div>
  `,document.body.appendChild(t),t.querySelector("#confirm-cancel").addEventListener("click",()=>t.remove()),t.querySelector("#confirm-delete").addEventListener("click",async()=>{t.remove();const a=[...d.swimmers];a[s]={...a[s],deleted:!0,deletedAt:new Date().toISOString()};try{await I(h(m,"registrations",E),{swimmers:a}),d.swimmers=a,o="profile",u()}catch(i){console.error("Error marking swimmer deleted:",i),alert("Failed. Please try again.")}}),t.addEventListener("click",a=>{a.target===t&&t.remove()})}function ie(){var i,w,D,L,M,N,A,P,T,j,R,q,F,O,U,W;document.querySelectorAll(".dash-nav-item[data-tab]").forEach(n=>{n.addEventListener("click",()=>{o=n.dataset.tab,u()})}),(i=document.getElementById("dash-theme-toggle"))==null||i.addEventListener("click",()=>{oe(),u()});const e=document.getElementById("dash-hamburger"),s=document.getElementById("dash-sidebar");e==null||e.addEventListener("click",()=>{s.classList.toggle("open")}),document.querySelectorAll(".dash-register-btn").forEach(n=>{n.addEventListener("click",()=>{window.location.href="/dragonwebsite/registration.html"})}),(w=document.getElementById("sidebar-signout"))==null||w.addEventListener("click",async()=>{try{await Y(S),window.location.href="/dragonwebsite/signin.html"}catch(n){console.error("Error signing out:",n)}});const t=document.getElementById("user-trigger"),a=document.getElementById("user-dropdown");t==null||t.addEventListener("click",n=>{n.stopPropagation(),a.style.display=a.style.display==="none"?"block":"none"}),document.addEventListener("click",()=>{a&&(a.style.display="none")}),(D=document.getElementById("menu-profile"))==null||D.addEventListener("click",()=>{o="profile",a.style.display="none",u()}),(L=document.getElementById("menu-signout"))==null||L.addEventListener("click",async()=>{try{await Y(S),window.location.href="/dragonwebsite/signin.html"}catch(n){console.error("Error signing out:",n)}}),(M=document.getElementById("edit-contact-btn"))==null||M.addEventListener("click",()=>{document.querySelectorAll(".profile-display").forEach(n=>n.style.display="none"),document.querySelectorAll(".profile-edit-field").forEach(n=>n.style.display="block"),document.getElementById("edit-actions").style.display="flex",document.getElementById("edit-contact-btn").style.display="none"}),(N=document.getElementById("cancel-contact-btn"))==null||N.addEventListener("click",()=>{document.querySelectorAll(".profile-display").forEach(n=>n.style.display=""),document.querySelectorAll(".profile-edit-field").forEach(n=>n.style.display="none"),document.getElementById("edit-actions").style.display="none",document.getElementById("edit-contact-btn").style.display=""}),(A=document.getElementById("save-contact-btn"))==null||A.addEventListener("click",async()=>{var l,r,c,p,$,H;const n={"parent.phone":((l=document.getElementById("edit-parent-phone"))==null?void 0:l.value.trim())||"","parent.address":((r=document.getElementById("edit-parent-address"))==null?void 0:r.value.trim())||""};d.spouse&&(n["spouse.phone"]=((c=document.getElementById("edit-spouse-phone"))==null?void 0:c.value.trim())||"",n["spouse.email"]=((p=document.getElementById("edit-spouse-email"))==null?void 0:p.value.trim())||""),n["emergencyContact.name"]=(($=document.getElementById("edit-emergency-name"))==null?void 0:$.value.trim())||"",n["emergencyContact.phone"]=((H=document.getElementById("edit-emergency-phone"))==null?void 0:H.value.trim())||"";try{await I(h(m,"registrations",E),n),d.parent.phone=n["parent.phone"],d.parent.address=n["parent.address"],d.spouse&&(d.spouse.phone=n["spouse.phone"],d.spouse.email=n["spouse.email"]),d.emergencyContact.name=n["emergencyContact.name"],d.emergencyContact.phone=n["emergencyContact.phone"],o="profile",u()}catch(de){console.error("Error updating contact:",de),alert("Failed to save. Please try again.")}}),(P=document.getElementById("add-swimmer-toggle-btn"))==null||P.addEventListener("click",()=>{document.getElementById("add-swimmer-form").style.display="block",document.getElementById("add-swimmer-toggle-btn").style.display="none"}),(T=document.getElementById("cancel-swimmer-btn"))==null||T.addEventListener("click",()=>{document.getElementById("add-swimmer-form").style.display="none",document.getElementById("add-swimmer-toggle-btn").style.display=""}),(j=document.getElementById("save-swimmer-btn"))==null||j.addEventListener("click",async()=>{const n=document.getElementById("new-swimmer-first").value.trim(),l=document.getElementById("new-swimmer-last").value.trim();if(!n||!l){alert("First name and last name are required.");return}const r={firstName:n,lastName:l,middleName:document.getElementById("new-swimmer-middle").value.trim()||null,gender:document.getElementById("new-swimmer-gender").value||null,dob:document.getElementById("new-swimmer-dob").value||null,usaSwimmingId:document.getElementById("new-swimmer-usaId").value.trim()||null,joinDate:null},c=[...d.swimmers,r];try{await I(h(m,"registrations",E),{swimmers:c}),d.swimmers=c,o="profile",u()}catch(p){console.error("Error adding swimmer:",p),alert("Failed to add swimmer. Please try again.")}}),document.querySelectorAll(".delete-swimmer-btn").forEach(n=>{n.addEventListener("click",()=>{const l=parseInt(n.dataset.index),r=d.swimmers[l],c=[r.firstName,r.lastName].filter(Boolean).join(" ");Ie(c,l)})}),v==="coach"&&((R=document.getElementById("add-meet-btn"))==null||R.addEventListener("click",()=>{document.getElementById("add-meet-form").style.display="block"}),(q=document.getElementById("cancel-meet-btn"))==null||q.addEventListener("click",()=>{document.getElementById("add-meet-form").style.display="none"}),(F=document.getElementById("save-meet-btn"))==null||F.addEventListener("click",async()=>{const n=document.getElementById("meet-name").value,l=document.getElementById("meet-date").value,r=document.getElementById("meet-location").value,c=document.getElementById("meet-events").value;if(!n||!l){alert("Please provide at least a name and date.");return}try{await V(y(m,"meets"),{name:n,date:l,location:r,events:c.split(",").map(p=>p.trim()),status:"Open",createdAt:new Date}),document.getElementById("add-meet-form").style.display="none"}catch(p){console.error("Error adding meet:",p)}}),document.querySelectorAll(".delete-meet").forEach(n=>{n.addEventListener("click",async()=>{if(confirm("Are you sure you want to delete this meet?"))try{await J(h(m,"meets",n.dataset.id))}catch(l){console.error("Error deleting meet:",l)}})}),(O=document.getElementById("add-session-btn"))==null||O.addEventListener("click",()=>{document.getElementById("add-session-form").style.display="block"}),(U=document.getElementById("cancel-session-btn"))==null||U.addEventListener("click",()=>{document.getElementById("add-session-form").style.display="none"}),(W=document.getElementById("save-session-btn"))==null||W.addEventListener("click",async()=>{const n=document.getElementById("session-day").value,l=document.getElementById("session-time").value,r=document.getElementById("session-group").value,c=document.getElementById("session-focus").value,p=document.getElementById("session-coach").value;if(!l||!r){alert("Please provide time and group.");return}try{await V(y(m,"schedules"),{day:n,time:l,group:r,focus:c,coach:p,createdAt:new Date}),document.getElementById("add-session-form").style.display="none"}catch($){console.error("Error adding session:",$)}}),document.querySelectorAll(".delete-session").forEach(n=>{n.addEventListener("click",async()=>{if(confirm("Are you sure you want to delete this session?"))try{await J(h(m,"schedules",n.dataset.id))}catch(l){console.error("Error deleting session:",l)}})}))}ue();
