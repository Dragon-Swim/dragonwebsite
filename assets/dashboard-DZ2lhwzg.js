import{i as N,t as pe}from"./theme-toggle-CI3g1rpd.js";import{o as ue,h as te,g,e as c,b as C,q as k,k as B,c as w,j as D,n as J,u as x,a as K,f as Q}from"./firebase-B6pM3H1n.js";N();const f=[{id:1,name:"Endurance Base Building",season:"Winter 2026",daysPerWeek:4,priority:"High",progress:72,tasks:"18 / 25 workouts completed",due:"Feb 28, 2026",status:"In Progress"},{id:2,name:"Sprint Technique Focus",season:"Spring 2026",daysPerWeek:3,priority:"Medium",progress:45,tasks:"9 / 20 workouts completed",due:"Mar 15, 2026",status:"In Progress"},{id:3,name:"Stroke Refinement (Butterfly)",season:"Summer 2026",daysPerWeek:5,priority:"Low",progress:0,tasks:"0 / 12 workouts completed",due:"Apr 30, 2026",status:"Not Started"},{id:4,name:"Fall Conditioning",season:"Fall 2025",daysPerWeek:3,priority:"High",progress:100,tasks:"30 / 30 workouts completed",due:"Nov 20, 2025",status:"Completed"}];let b=[],A=[],y=null,h="swimmer",v=null,d=null,S=null,I=[],o="overview",X=!1;function ve(){const e=document.getElementById("app");e.innerHTML=`
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; gap: 20px; font-family: sans-serif;">
      <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #f5c518; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <p style="color: #666;">Loading your Dragon dashboard...</p>
      <style>
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    </div>
  `,console.log("Dashboard: Initializing auth listener...");const s=setTimeout(()=>{console.warn("Dashboard: Auth listener timed out — redirecting to signin"),window.location.href="/dragonwebsite/signin.html"},5e3);ue(C,async t=>{if(clearTimeout(s),!t){console.log("Dashboard: No user authenticated, redirecting to signin..."),window.location.href="/dragonwebsite/signin.html";return}y=t,console.log("Dashboard: User authenticated:",t.email);try{console.log("Dashboard: Fetching user document...");const a=await te(g(c,"users",t.uid));v=a.exists()?a.data().role:null;const i=t.email&&t.email.toLowerCase()==="dragonswim@outlook.com";h=v==="coach"||v==="admin"||i?"coach":v||"swimmer",console.log("Dashboard: Detected role:",h),X?(console.log("Dashboard: Refreshing UI..."),p()):(console.log("Dashboard: Initializing data listeners..."),he(),X=!0,p())}catch(a){console.error("Dashboard Critical Error:",a),e.innerHTML=`
        <div style="padding: 40px; text-align: center; font-family: sans-serif; max-width: 500px; margin: 100px auto; border: 1px solid #fee2e2; background: #fef2f2; border-radius: 12px; color: #991b1b;">
          <h2 style="margin-bottom: 16px;">Failed to load dashboard</h2>
          <p style="margin-bottom: 24px;">Something went wrong while setting up your workspace. This might be due to a connection issue or a configuration error.</p>
          <code style="display: block; padding: 12px; background: #fee2e2; border-radius: 6px; font-size: 13px; text-align: left; overflow-x: auto; margin-bottom: 24px;">
            ${a.message||"Unknown error"}
          </code>
          <button onclick="window.location.reload()" style="padding: 10px 20px; background: #991b1b; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Retry Loading</button>
        </div>
      `,h="swimmer"}})}function he(){const e=k(w(c,"meets"),B("createdAt","desc"));D(e,t=>{b=t.docs.map(a=>({id:a.id,...a.data()})),p()},t=>{console.error("Error listening to meets:",t)});const s=k(w(c,"schedules"),B("createdAt","asc"));if(D(s,t=>{A=t.docs.map(a=>({id:a.id,...a.data()})),p()},t=>{console.error("Error listening to schedules:",t)}),ne(),h==="coach"){const t=k(w(c,"registrations"),B("createdAt","desc"));D(t,a=>{I=a.docs.map(i=>({id:i.id,...i.data()})),p()},a=>{console.error("Error listening to registrations:",a)})}}async function ne(){if(!y)return;const e=g(c,"registrations",y.uid),s=await te(e);s.exists()&&(S=s.id,d=s.data())}function p(){y&&ne().then(()=>{Z()}).catch(e=>{console.error("Error fetching family data:",e),Z()})}function Z(){h==="coach"?be(y):ge(y)}function ge(e){const s=document.getElementById("app");s.innerHTML=`
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
            ${v==="admin"?`
            <a href="/dragonwebsite/admin.html" class="dash-nav-item" style="text-decoration: none;">
              <span class="dash-nav-icon">⚙️</span> Admin Panel
            </a>
            `:""}
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
              <h1 class="dash-page-title">${ie(o)}</h1>
              <p class="dash-page-subtitle">${ye(o)}</p>
            </div>
          </div>
          <div class="dash-topbar-right">
            <div class="dash-user-menu" id="user-menu">
              <button class="dash-user-trigger" id="user-trigger">
                <div class="dash-avatar">${(_()||e.email||"D").charAt(0).toUpperCase()}</div>
                <span class="dash-user-name">${_()||e.email||"Swimmer"}</span>
                <span class="dash-dropdown-arrow">▾</span>
              </button>
              <div class="dash-dropdown" id="user-dropdown" style="display: none;">
                <button class="dash-dropdown-item" id="menu-profile">👤 Profile</button>
                ${v==="admin"?'<button class="dash-dropdown-item" id="menu-admin">⚙️ Admin Panel</button>':""}
                <button class="dash-dropdown-item" id="menu-signout" style="color: var(--color-accent);">🚪 Sign Out</button>
              </div>
            </div>
          </div>
        </header>

        <!-- Dynamic Content -->
        <div class="dash-content">
          ${de(o,"swimmer")}
        </div>
      </main>
    </div>
  `,ce(),N(),oe()}function be(e){const s=document.getElementById("app");s.innerHTML=`
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
            ${v==="admin"?`
            <a href="/dragonwebsite/admin.html" class="dash-nav-item" style="text-decoration: none;">
              <span class="dash-nav-icon">⚙️</span> Admin Panel
            </a>
            `:""}
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
              <h1 class="dash-page-title">Coach: ${ie(o,"coach")}</h1>
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
                ${v==="admin"?'<button class="dash-dropdown-item" id="menu-admin">⚙️ Admin Panel</button>':""}
                <button class="dash-dropdown-item" id="menu-signout" style="color: var(--color-accent);">🚪 Sign Out</button>
              </div>
            </div>
          </div>
        </header>

        <!-- Dynamic Content -->
        <div class="dash-content">
          ${de(o,"coach")}
        </div>
      </main>
    </div>
  `,ce(),N(),oe()}function _(){if(!d||!d.parent)return null;const e=d.parent;return[e.firstName,e.lastName].filter(Boolean).join(" ")||null}function ie(e,s="swimmer"){return s==="coach"?{overview:"Coach Dashboard",roster:"Team Roster",meets:"Meet Management",schedule:"Season Schedule"}[e]||"Coach Dashboard":{overview:"Dashboard",profile:"Family Profile",plans:"Swim Plans",meets:"Swim Meets",schedule:"Practice Schedule"}[e]||"Dashboard"}function ye(e){return{overview:"Overview of your swim season at a glance",profile:"Manage your family information and swimmers",plans:"Track and manage your training plans",meets:"View registered and upcoming competitions",schedule:"Your weekly practice timetable"}[e]||""}function de(e,s="swimmer"){if(s==="coach")switch(e){case"overview":return ee();case"roster":return we();case"meets":return ae();case"schedule":return se();default:return ee()}switch(e){case"overview":return $e();case"profile":return ke();case"plans":return Be();case"meets":return ae();case"schedule":return se();default:return""}}function oe(){const e=document.getElementById("sidebar-theme-icon");if(e){const s=document.documentElement.getAttribute("data-theme")==="dark";e.textContent=s?"☀️":"🌙"}}function le(){const e=[];for(const s of I)if(s.swimmers)for(const t of s.swimmers)t.deleted||e.push({...t,parentName:re(s)});return e}function re(e){return e.parent&&[e.parent.firstName,e.parent.lastName].filter(Boolean).join(" ")||"—"}function fe(){const e=new Date;return e.setDate(e.getDate()-30),I.filter(s=>{var a,i;return(((i=(a=s.createdAt)==null?void 0:a.toDate)==null?void 0:i.call(a))||new Date(s.createdAt))>=e})}function ee(){const e=le(),s=fe(),t=b.filter(a=>a.status!=="Completed");return`
    <div class="dash-stats-row">
      <div class="dash-stat-card">
        <div class="dash-stat-number">${e.length}</div>
        <div class="dash-stat-label">Active Athletes</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${s.length}</div>
        <div class="dash-stat-label">New Registrations (30d)</div>
      </div>
      <div class="dash-stat-card accent">
        <div class="dash-stat-number">${t.length}</div>
        <div class="dash-stat-label">Upcoming Meets</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${I.length}</div>
        <div class="dash-stat-label">Registered Families</div>
      </div>
    </div>

    <div class="dash-overview-grid">
      <div class="dash-panel">
        <h3 class="dash-panel-title">Top Athletes</h3>
        <div class="dash-panel-body">
          ${e.length===0?'<p class="dash-empty">No swimmers registered yet.</p>':e.slice(0,5).map(a=>`
            <div class="dash-mini-card">
               <div class="dash-mini-top">
                <span class="dash-mini-name">${[a.firstName,a.lastName].filter(Boolean).join(" ")}</span>
                <span class="badge badge-primary">${a.parentName}</span>
              </div>
              <div class="dash-mini-meta">${a.gender||"—"} · Age: ${a.dob?Math.floor((new Date-new Date(a.dob))/(365.25*24*60*60*1e3)):"—"}</div>
            </div>
          `).join("")}
        </div>
      </div>
      <div class="dash-panel">
        <h3 class="dash-panel-title">Recent Registrations</h3>
        <div class="dash-panel-body">
          ${s.length===0?'<p class="dash-empty">No recent registrations.</p>':s.slice(0,5).map(a=>`
            <div class="dash-mini-card">
              <div class="dash-mini-top"><span class="dash-mini-name">${re(a)}</span></div>
              <div class="dash-mini-meta">${a.swimmers?a.swimmers.filter(i=>!i.deleted).length:0} swimmer(s)</div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `}function we(){const e=le();return`
    <div class="dash-panel">
      <div class="dash-panel-header" style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h3 class="dash-panel-title">Team Roster (${e.length} athletes)</h3>
      </div>
      <div class="dash-panel-body">
        ${e.length===0?'<p class="dash-empty">No swimmers registered yet.</p>':`
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
              <th style="padding: 1rem;">Name</th>
              <th style="padding: 1rem;">Parent</th>
              <th style="padding: 1rem;">Age</th>
              <th style="padding: 1rem;">Gender</th>
              <th style="padding: 1rem;">USA ID</th>
            </tr>
          </thead>
          <tbody>
            ${e.map(s=>{const t=s.dob?Math.floor((new Date-new Date(s.dob))/315576e5):"—";return`
                <tr style="border-bottom: 1px solid var(--border-color);">
                  <td style="padding: 1rem; font-weight: 500;">${[s.firstName,s.lastName].filter(Boolean).join(" ")}</td>
                  <td style="padding: 1rem;">${s.parentName}</td>
                  <td style="padding: 1rem;">${t}</td>
                  <td style="padding: 1rem;">${s.gender||"—"}</td>
                  <td style="padding: 1rem;">${s.usaSwimmingId||"—"}</td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
        `}
      </div>
    </div>
  `}function $e(){const e=f.filter(a=>a.status!=="Completed").length,s=f.filter(a=>a.status==="Completed").length,t=b.filter(a=>a.status!=="Completed").length;return`
    <div class="dash-stats-row">
      <div class="dash-stat-card">
        <div class="dash-stat-number">${f.length}</div>
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
          ${f.filter(a=>a.status!=="Completed").map(a=>Ee(a)).join("")}
        </div>
      </div>
      <div class="dash-panel">
        <h3 class="dash-panel-title">Upcoming Meets</h3>
        <div class="dash-panel-body">
          ${b.filter(a=>a.status!=="Completed").map(a=>Se(a)).join("")}
        </div>
      </div>
    </div>

    <div class="dash-panel">
      <h3 class="dash-panel-title">Today's Practice</h3>
      <div class="dash-panel-body">
        ${Ie()}
      </div>
    </div>
  `}function Ee(e){return`
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
  `}function Se(e){const s=e.status||"Open";return`
    <div class="dash-mini-card">
      <div class="dash-mini-top">
        <span class="dash-mini-name">${e.name||"Untitled Meet"}</span>
        <span class="status-badge status-${s.toLowerCase().replace(" ","-")}">${s}</span>
      </div>
      <div class="dash-mini-meta">${e.date||""} · ${e.location||""}</div>
    </div>
  `}function Ie(){const s=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date().getDay()],t=A.filter(a=>a.day===s);return t.length===0?`<p class="dash-empty">No practices scheduled for today (${s}). Rest day! 🎉</p>`:t.map(a=>`
    <div class="dash-mini-card">
      <div class="dash-mini-top">
        <span class="dash-mini-name">${a.focus}</span>
        <span class="group-badge">${a.group}</span>
      </div>
      <div class="dash-mini-meta">${a.time} · ${a.coach}</div>
    </div>
  `).join("")}function ke(){if(!d)return`<div class="dash-panel" style="text-align: center; padding: 3rem;">
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
          ${t.filter(i=>!i.deleted).length===0?'<p class="dash-empty">No swimmers registered.</p>':t.map((i,$)=>i.deleted?"":`

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
              <button class="btn btn-outline btn-sm delete-swimmer-btn" data-index="${$}" style="color: var(--color-accent); border-color: var(--color-accent);">Remove</button>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `}function Be(){return`
    <div class="dash-cards-grid">
      ${f.map(e=>`
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
  `}function ae(){const e=h==="coach";return`
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
      ${b.length===0?'<p class="dash-empty">No meets scheduled yet.</p>':b.map(s=>`
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
  `}function se(){const e=h==="coach",s=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];return`
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
      ${s.map(t=>{const a=A.filter(i=>i.day===t);return`
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
  `}function De(e,s){const t=document.createElement("div");t.className="confirm-overlay",t.innerHTML=`
    <div class="confirm-modal">
      <h3 class="confirm-title">Remove Swimmer</h3>
      <p class="confirm-body">You are about to remove <strong style="color: var(--color-accent, #dc3545);">${e}</strong> from your family registration.</p>
      <p class="confirm-warning">This swimmer will be marked as inactive. Contact a coach if you need to restore this record.</p>
      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="confirm-cancel">Cancel</button>
        <button class="btn btn-sm" id="confirm-delete" style="background: var(--color-accent, #dc3545); color: white; border: none;">Delete</button>
      </div>
    </div>
  `,document.body.appendChild(t),t.querySelector("#confirm-cancel").addEventListener("click",()=>t.remove()),t.querySelector("#confirm-delete").addEventListener("click",async()=>{t.remove();const a=[...d.swimmers];a[s]={...a[s],deleted:!0,deletedAt:new Date().toISOString()};try{await x(g(c,"registrations",S),{swimmers:a}),d.swimmers=a,o="profile",p()}catch(i){console.error("Error marking swimmer deleted:",i),alert("Failed. Please try again.")}}),t.addEventListener("click",a=>{a.target===t&&t.remove()})}function ce(){var i,$,L,P,M,T,j,R,F,q,O,U,W,z,H,G,V;document.querySelectorAll(".dash-nav-item[data-tab]").forEach(n=>{n.addEventListener("click",()=>{o=n.dataset.tab,p()})}),(i=document.getElementById("dash-theme-toggle"))==null||i.addEventListener("click",()=>{pe(),p()});const e=document.getElementById("dash-hamburger"),s=document.getElementById("dash-sidebar");e==null||e.addEventListener("click",()=>{s.classList.toggle("open")}),document.querySelectorAll(".dash-register-btn").forEach(n=>{n.addEventListener("click",()=>{window.location.href="/dragonwebsite/registration.html"})}),($=document.getElementById("sidebar-signout"))==null||$.addEventListener("click",async()=>{try{await J(C),window.location.href="/dragonwebsite/signin.html"}catch(n){console.error("Error signing out:",n)}});const t=document.getElementById("user-trigger"),a=document.getElementById("user-dropdown");t==null||t.addEventListener("click",n=>{n.stopPropagation(),a.style.display=a.style.display==="none"?"block":"none"}),document.addEventListener("click",()=>{a&&(a.style.display="none")}),(L=document.getElementById("menu-profile"))==null||L.addEventListener("click",()=>{o="profile",a.style.display="none",p()}),(P=document.getElementById("menu-signout"))==null||P.addEventListener("click",async()=>{try{await J(C),window.location.href="/dragonwebsite/signin.html"}catch(n){console.error("Error signing out:",n)}}),(M=document.getElementById("menu-admin"))==null||M.addEventListener("click",()=>{window.location.href="/dragonwebsite/admin.html"}),(T=document.getElementById("edit-contact-btn"))==null||T.addEventListener("click",()=>{document.querySelectorAll(".profile-display").forEach(n=>n.style.display="none"),document.querySelectorAll(".profile-edit-field").forEach(n=>n.style.display="block"),document.getElementById("edit-actions").style.display="flex",document.getElementById("edit-contact-btn").style.display="none"}),(j=document.getElementById("cancel-contact-btn"))==null||j.addEventListener("click",()=>{document.querySelectorAll(".profile-display").forEach(n=>n.style.display=""),document.querySelectorAll(".profile-edit-field").forEach(n=>n.style.display="none"),document.getElementById("edit-actions").style.display="none",document.getElementById("edit-contact-btn").style.display=""}),(R=document.getElementById("save-contact-btn"))==null||R.addEventListener("click",async()=>{var l,r,m,u,E,Y;const n={"parent.phone":((l=document.getElementById("edit-parent-phone"))==null?void 0:l.value.trim())||"","parent.address":((r=document.getElementById("edit-parent-address"))==null?void 0:r.value.trim())||""};d.spouse&&(n["spouse.phone"]=((m=document.getElementById("edit-spouse-phone"))==null?void 0:m.value.trim())||"",n["spouse.email"]=((u=document.getElementById("edit-spouse-email"))==null?void 0:u.value.trim())||""),n["emergencyContact.name"]=((E=document.getElementById("edit-emergency-name"))==null?void 0:E.value.trim())||"",n["emergencyContact.phone"]=((Y=document.getElementById("edit-emergency-phone"))==null?void 0:Y.value.trim())||"";try{await x(g(c,"registrations",S),n),d.parent.phone=n["parent.phone"],d.parent.address=n["parent.address"],d.spouse&&(d.spouse.phone=n["spouse.phone"],d.spouse.email=n["spouse.email"]),d.emergencyContact.name=n["emergencyContact.name"],d.emergencyContact.phone=n["emergencyContact.phone"],o="profile",p()}catch(me){console.error("Error updating contact:",me),alert("Failed to save. Please try again.")}}),(F=document.getElementById("add-swimmer-toggle-btn"))==null||F.addEventListener("click",()=>{document.getElementById("add-swimmer-form").style.display="block",document.getElementById("add-swimmer-toggle-btn").style.display="none"}),(q=document.getElementById("cancel-swimmer-btn"))==null||q.addEventListener("click",()=>{document.getElementById("add-swimmer-form").style.display="none",document.getElementById("add-swimmer-toggle-btn").style.display=""}),(O=document.getElementById("save-swimmer-btn"))==null||O.addEventListener("click",async()=>{const n=document.getElementById("new-swimmer-first").value.trim(),l=document.getElementById("new-swimmer-last").value.trim();if(!n||!l){alert("First name and last name are required.");return}const r={firstName:n,lastName:l,middleName:document.getElementById("new-swimmer-middle").value.trim()||null,gender:document.getElementById("new-swimmer-gender").value||null,dob:document.getElementById("new-swimmer-dob").value||null,usaSwimmingId:document.getElementById("new-swimmer-usaId").value.trim()||null,joinDate:null},m=[...d.swimmers,r];try{await x(g(c,"registrations",S),{swimmers:m}),d.swimmers=m,o="profile",p()}catch(u){console.error("Error adding swimmer:",u),alert("Failed to add swimmer. Please try again.")}}),document.querySelectorAll(".delete-swimmer-btn").forEach(n=>{n.addEventListener("click",()=>{const l=parseInt(n.dataset.index),r=d.swimmers[l],m=[r.firstName,r.lastName].filter(Boolean).join(" ");De(m,l)})}),h==="coach"&&((U=document.getElementById("add-meet-btn"))==null||U.addEventListener("click",()=>{document.getElementById("add-meet-form").style.display="block"}),(W=document.getElementById("cancel-meet-btn"))==null||W.addEventListener("click",()=>{document.getElementById("add-meet-form").style.display="none"}),(z=document.getElementById("save-meet-btn"))==null||z.addEventListener("click",async()=>{const n=document.getElementById("meet-name").value,l=document.getElementById("meet-date").value,r=document.getElementById("meet-location").value,m=document.getElementById("meet-events").value;if(!n||!l){alert("Please provide at least a name and date.");return}try{await K(w(c,"meets"),{name:n,date:l,location:r,events:m.split(",").map(u=>u.trim()),status:"Open",createdAt:new Date}),document.getElementById("add-meet-form").style.display="none"}catch(u){console.error("Error adding meet:",u)}}),document.querySelectorAll(".delete-meet").forEach(n=>{n.addEventListener("click",async()=>{if(confirm("Are you sure you want to delete this meet?"))try{await Q(g(c,"meets",n.dataset.id))}catch(l){console.error("Error deleting meet:",l)}})}),(H=document.getElementById("add-session-btn"))==null||H.addEventListener("click",()=>{document.getElementById("add-session-form").style.display="block"}),(G=document.getElementById("cancel-session-btn"))==null||G.addEventListener("click",()=>{document.getElementById("add-session-form").style.display="none"}),(V=document.getElementById("save-session-btn"))==null||V.addEventListener("click",async()=>{const n=document.getElementById("session-day").value,l=document.getElementById("session-time").value,r=document.getElementById("session-group").value,m=document.getElementById("session-focus").value,u=document.getElementById("session-coach").value;if(!l||!r){alert("Please provide time and group.");return}try{await K(w(c,"schedules"),{day:n,time:l,group:r,focus:m,coach:u,createdAt:new Date}),document.getElementById("add-session-form").style.display="none"}catch(E){console.error("Error adding session:",E)}}),document.querySelectorAll(".delete-session").forEach(n=>{n.addEventListener("click",async()=>{if(confirm("Are you sure you want to delete this session?"))try{await Q(g(c,"schedules",n.dataset.id))}catch(l){console.error("Error deleting session:",l)}})}))}ve();
