import{i as A,t as e,a as _e}from"./i18n-DiRWGI-u.js";import{o as ye,h as oe,g as y,e as v,b as S,q as x,k as D,c as I,j as C,p as X,u as L,E as le,r as re,t as ce,a as Z,f as ee}from"./firebase-8Bk_msJm.js";A();const $=[{id:1,name:"Endurance Base Building",season:"Winter 2026",daysPerWeek:4,priority:"High",progress:72,tasks:"18 / 25 workouts completed",due:"Feb 28, 2026",status:"In Progress"},{id:2,name:"Sprint Technique Focus",season:"Spring 2026",daysPerWeek:3,priority:"Medium",progress:45,tasks:"9 / 20 workouts completed",due:"Mar 15, 2026",status:"In Progress"},{id:3,name:"Stroke Refinement (Butterfly)",season:"Summer 2026",daysPerWeek:5,priority:"Low",progress:0,tasks:"0 / 12 workouts completed",due:"Apr 30, 2026",status:"Not Started"},{id:4,name:"Fall Conditioning",season:"Fall 2025",daysPerWeek:3,priority:"High",progress:100,tasks:"30 / 30 workouts completed",due:"Nov 20, 2025",status:"Completed"}];let w=[],N=[],p=null,_="swimmer",g=null,o=null,k=null,B=[],m="overview",se=!1;function we(){const s=document.getElementById("app");s.innerHTML=`
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; gap: 20px; font-family: sans-serif;">
      <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #f5c518; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <p style="color: #666;">${e("dash_loading")}</p>
      <style>
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    </div>
  `,console.log("Dashboard: Initializing auth listener...");const a=setTimeout(()=>{console.warn("Dashboard: Auth listener timed out — redirecting to signin"),window.location.href="/dragonwebsite/signin.html"},5e3);ye(S,async n=>{if(clearTimeout(a),!n){console.log("Dashboard: No user authenticated, redirecting to signin..."),window.location.href="/dragonwebsite/signin.html";return}p=n,console.log("Dashboard: User authenticated:",n.email);try{console.log("Dashboard: Fetching user document...");const t=await oe(y(v,"users",n.uid));g=t.exists()?t.data().role:null;const i=n.email&&n.email.toLowerCase()==="dragonswim@outlook.com";_=g==="coach"||g==="admin"||i?"coach":g||"swimmer",console.log("Dashboard: Detected role:",_),se?(console.log("Dashboard: Refreshing UI..."),b()):(console.log("Dashboard: Initializing data listeners..."),$e(),se=!0,b())}catch(t){console.error("Dashboard Critical Error:",t),s.innerHTML=`
        <div style="padding: 40px; text-align: center; font-family: sans-serif; max-width: 500px; margin: 100px auto; border: 1px solid #fee2e2; background: #fef2f2; border-radius: 12px; color: #991b1b;">
          <h2 style="margin-bottom: 16px;">${e("dash_load_failed_title")}</h2>
          <p style="margin-bottom: 24px;">${e("dash_load_failed_msg")}</p>
          <code style="display: block; padding: 12px; background: #fee2e2; border-radius: 6px; font-size: 13px; text-align: left; overflow-x: auto; margin-bottom: 24px;">
            ${t.message||e("dash_unknown_error")}
          </code>
          <button onclick="window.location.reload()" style="padding: 10px 20px; background: #991b1b; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">${e("dash_load_failed_retry")}</button>
        </div>
      `,_="swimmer"}})}function $e(){const s=x(I(v,"meets"),D("createdAt","desc"));C(s,n=>{w=n.docs.map(t=>({id:t.id,...t.data()})),b()},n=>{console.error("Error listening to meets:",n)});const a=x(I(v,"schedules"),D("createdAt","asc"));if(C(a,n=>{N=n.docs.map(t=>({id:t.id,...t.data()})),b()},n=>{console.error("Error listening to schedules:",n)}),me(),_==="coach"){const n=x(I(v,"registrations"),D("createdAt","desc"));C(n,t=>{B=t.docs.map(i=>({id:i.id,...i.data()})),b()},t=>{console.error("Error listening to registrations:",t)})}}async function me(){if(!p)return;const s=y(v,"registrations",p.uid),a=await oe(s);a.exists()&&(k=a.id,o=a.data())}function b(){p&&me().then(()=>{ae()}).catch(s=>{console.error("Error fetching family data:",s),ae()})}function ae(){_==="coach"?ke(p):Ie(p)}const Ee=["dash_day_sunday","dash_day_monday","dash_day_tuesday","dash_day_wednesday","dash_day_thursday","dash_day_friday","dash_day_saturday"];function E(s){return e(Ee[s]||"dash_day_monday")}function Ie(s){const a=document.getElementById("app");a.innerHTML=`
    <div class="dash-layout">
      <aside class="dash-sidebar" id="dash-sidebar">
        <div class="dash-sidebar-header">
          <a href="/dragonwebsite/" class="dash-logo">
            <img src="/dragonwebsite/logo-light.jpg" alt="Dragon Swim Team" class="dash-logo-img light-logo" />
            <img src="/dragonwebsite/logo-dark.png" alt="Dragon Swim Team" class="dash-logo-img dark-logo" />
          </a>
        </div>
        <nav class="dash-nav">
          <div class="dash-nav-section">
            <span class="dash-nav-label">${e("dash_sidebar_menu")}</span>
            <button class="dash-nav-item ${m==="overview"?"active":""}" data-tab="overview">
              <span class="dash-nav-icon">📊</span> ${e("dash_swimmer_overview_label")}
            </button>
            <button class="dash-nav-item ${m==="profile"?"active":""}" data-tab="profile">
              <span class="dash-nav-icon">👤</span> ${e("dash_swimmer_profile_label")}
            </button>
            <button class="dash-nav-item ${m==="plans"?"active":""}" data-tab="plans">
              <span class="dash-nav-icon">📋</span> ${e("dash_swimmer_plans_label")}
            </button>
            <button class="dash-nav-item ${m==="meets"?"active":""}" data-tab="meets">
              <span class="dash-nav-icon">🏆</span> ${e("dash_swimmer_meets_label")}
            </button>
            <button class="dash-nav-item ${m==="schedule"?"active":""}" data-tab="schedule">
              <span class="dash-nav-icon">📅</span> ${e("dash_swimmer_schedule_label")}
            </button>
          </div>
          <div class="dash-nav-section" style="margin-top: auto;">
            <span class="dash-nav-label">${e("dash_sidebar_system")}</span>
            ${g==="admin"?`
            <a href="/dragonwebsite/admin.html" class="dash-nav-item" style="text-decoration: none;">
              <span class="dash-nav-icon">⚙️</span> ${e("dash_sidebar_admin")}
            </a>
            `:""}
            <a href="/dragonwebsite/contact.html" class="dash-nav-item" style="text-decoration: none;">
              <span class="dash-nav-icon">💬</span> ${e("dash_sidebar_messages")}
            </a>
            <button class="dash-nav-item" id="dash-theme-toggle">
              <span class="dash-nav-icon" id="sidebar-theme-icon">🌙</span> ${e("dash_sidebar_theme")}
            </button>
            <button class="dash-nav-item" id="sidebar-signout" style="color: var(--color-accent); margin-top: var(--space-md);">
              <span class="dash-nav-icon">🚪</span> ${e("dash_sidebar_signout")}
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
              <h1 class="dash-page-title">${pe(m)}</h1>
              <p class="dash-page-subtitle">${Be(m)}</p>
            </div>
          </div>
          <div class="dash-topbar-right">
            <div class="dash-user-menu" id="user-menu">
              <button class="dash-user-trigger" id="user-trigger">
                <div class="dash-avatar">${(te()||s.email||e("dash_swimmer_username_fallback")).charAt(0).toUpperCase()}</div>
                <span class="dash-user-name">${te()||s.email||e("dash_swimmer_username_fallback")}</span>
                <span class="dash-dropdown-arrow">▾</span>
              </button>
              <div class="dash-dropdown" id="user-dropdown" style="display: none;">
                <button class="dash-dropdown-item" id="menu-profile">${e("dash_user_menu_profile")}</button>
                ${g==="admin"?`<button class="dash-dropdown-item" id="menu-admin">${e("dash_user_menu_admin")}</button>`:""}
                ${p&&p.providerData&&p.providerData[0].providerId==="password"?`<button class="dash-dropdown-item" id="menu-password">🔑 ${e("dash_profile_password_btn")}</button>`:""}
                <button class="dash-dropdown-item" id="menu-signout" style="color: var(--color-accent);">${e("dash_user_menu_signout")}</button>
              </div>
            </div>
          </div>
        </header>

        <div class="dash-content">
          ${he(m,"swimmer")}
        </div>
      </main>
    </div>
  `,be(),A(),ue()}function ke(s){const a=document.getElementById("app");a.innerHTML=`
    <div class="dash-layout">
      <aside class="dash-sidebar" id="dash-sidebar">
        <div class="dash-sidebar-header">
          <a href="/dragonwebsite/" class="dash-logo">
            <img src="/dragonwebsite/logo-light.jpg" alt="Dragon Swim Team" class="dash-logo-img light-logo" />
            <img src="/dragonwebsite/logo-dark.png" alt="Dragon Swim Team" class="dash-logo-img dark-logo" />
          </a>
        </div>
        <nav class="dash-nav">
          <div class="dash-nav-section">
            <span class="dash-nav-label">${e("dash_coach_menu")}</span>
            <button class="dash-nav-item ${m==="overview"?"active":""}" data-tab="overview">
              <span class="dash-nav-icon">🏠</span> ${e("dash_coach_overview_label")}
            </button>
            <button class="dash-nav-item ${m==="roster"?"active":""}" data-tab="roster">
              <span class="dash-nav-icon">👥</span> ${e("dash_coach_roster_label")}
            </button>
            <button class="dash-nav-item ${m==="meets"?"active":""}" data-tab="meets">
              <span class="dash-nav-icon">🏁</span> ${e("dash_coach_meets_label")}
            </button>
            <button class="dash-nav-item ${m==="schedule"?"active":""}" data-tab="schedule">
              <span class="dash-nav-icon">⏱️</span> ${e("dash_coach_schedule_label")}
            </button>
          </div>
          <div class="dash-nav-section" style="margin-top: auto;">
            <span class="dash-nav-label">${e("dash_sidebar_system")}</span>
            ${g==="admin"?`
            <a href="/dragonwebsite/admin.html" class="dash-nav-item" style="text-decoration: none;">
              <span class="dash-nav-icon">⚙️</span> ${e("dash_sidebar_admin")}
            </a>
            `:""}
            <button class="dash-nav-item" id="dash-theme-toggle">
              <span class="dash-nav-icon" id="sidebar-theme-icon">🌙</span> ${e("dash_sidebar_theme")}
            </button>
            <button class="dash-nav-item" id="sidebar-signout" style="color: var(--color-accent); margin-top: var(--space-md);">
              <span class="dash-nav-icon">🚪</span> ${e("dash_sidebar_signout")}
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
              <h1 class="dash-page-title">Coach: ${pe(m,"coach")}</h1>
              <p class="dash-page-subtitle">${e("dash_coach_topbar_sub")}</p>
            </div>
          </div>
          <div class="dash-topbar-right">
            <div class="badge badge-primary" style="margin-right: 1rem;">${e("dash_coach_badge")}</div>
            <div class="dash-user-menu" id="user-menu">
              <button class="dash-user-trigger" id="user-trigger">
                <div class="dash-avatar" style="background: var(--color-accent); color: white;">${(s.displayName||s.email||e("dash_coach_username_fallback")).charAt(0).toUpperCase()}</div>
                <span class="dash-user-name">${s.displayName||s.email||e("dash_coach_username_fallback")}</span>
                <span class="dash-dropdown-arrow">▾</span>
              </button>
              <div class="dash-dropdown" id="user-dropdown" style="display: none;">
                ${g==="admin"?`<button class="dash-dropdown-item" id="menu-admin">${e("dash_user_menu_admin")}</button>`:""}
                ${p&&p.providerData&&p.providerData[0].providerId==="password"?`<button class="dash-dropdown-item" id="menu-password">🔑 ${e("dash_profile_password_btn")}</button>`:""}
                <button class="dash-dropdown-item" id="menu-signout" style="color: var(--color-accent);">${e("dash_user_menu_signout")}</button>
              </div>
            </div>
          </div>
        </header>

        <div class="dash-content">
          ${he(m,"coach")}
        </div>
      </main>
    </div>
  `,be(),A(),ue()}function te(){if(!o||!o.parent)return null;const s=o.parent;return[s.firstName,s.lastName].filter(Boolean).join(" ")||null}function pe(s,a="swimmer"){return a==="coach"?{overview:e("dash_coach_tab_overview"),roster:e("dash_coach_tab_roster"),meets:e("dash_coach_tab_meets"),schedule:e("dash_coach_tab_schedule")}[s]||e("dash_coach_tab_overview"):{overview:e("dash_swimmer_tab_overview"),profile:e("dash_swimmer_tab_profile"),plans:e("dash_swimmer_tab_plans"),meets:e("dash_swimmer_tab_meets"),schedule:e("dash_swimmer_tab_schedule")}[s]||e("dash_swimmer_tab_overview")}function Be(s){return{overview:e("dash_swimmer_overview_sub"),profile:e("dash_swimmer_profile_sub"),plans:e("dash_swimmer_plans_sub"),meets:e("dash_swimmer_meets_sub"),schedule:e("dash_swimmer_schedule_sub")}[s]||""}function he(s,a="swimmer"){if(a==="coach")switch(s){case"overview":return de();case"roster":return De();case"meets":return ne();case"schedule":return ie();default:return de()}switch(s){case"overview":return Ce();case"profile":return Ne();case"plans":return je();case"meets":return ne();case"schedule":return ie();default:return""}}function ue(){const s=document.getElementById("sidebar-theme-icon");if(s){const a=document.documentElement.getAttribute("data-theme")==="dark";s.textContent=a?"☀️":"🌙"}}function ve(){const s=[];for(const a of B)if(a.swimmers)for(const n of a.swimmers)n.deleted||s.push({...n,parentName:fe(a)});return s}function fe(s){return s.parent&&[s.parent.firstName,s.parent.lastName].filter(Boolean).join(" ")||"—"}function xe(){const s=new Date;return s.setDate(s.getDate()-30),B.filter(a=>{var t,i;return(((i=(t=a.createdAt)==null?void 0:t.toDate)==null?void 0:i.call(t))||new Date(a.createdAt))>=s})}function de(){const s=ve(),a=xe(),n=w.filter(t=>t.status!=="Completed");return`
    <div class="dash-stats-row">
      <div class="dash-stat-card">
        <div class="dash-stat-number">${s.length}</div>
        <div class="dash-stat-label">${e("dash_coach_active_athletes")}</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${a.length}</div>
        <div class="dash-stat-label">${e("dash_coach_new_registrations")}</div>
      </div>
      <div class="dash-stat-card accent">
        <div class="dash-stat-number">${n.length}</div>
        <div class="dash-stat-label">${e("dash_coach_upcoming_meets")}</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${B.length}</div>
        <div class="dash-stat-label">${e("dash_coach_registered_families")}</div>
      </div>
    </div>

    <div class="dash-overview-grid">
      <div class="dash-panel">
        <h3 class="dash-panel-title">${e("dash_coach_top_athletes")}</h3>
        <div class="dash-panel-body">
          ${s.length===0?`<p class="dash-empty">${e("dash_coach_no_swimmers")}</p>`:s.slice(0,5).map(t=>`
            <div class="dash-mini-card">
               <div class="dash-mini-top">
                <span class="dash-mini-name">${[t.firstName,t.lastName].filter(Boolean).join(" ")}</span>
                <span class="badge badge-primary">${t.parentName}</span>
              </div>
              <div class="dash-mini-meta">${t.gender||"—"} · Age: ${t.dob?Math.floor((new Date-new Date(t.dob))/(365.25*24*60*60*1e3)):"—"}</div>
            </div>
          `).join("")}
        </div>
      </div>
      <div class="dash-panel">
        <h3 class="dash-panel-title">${e("dash_coach_recent_registrations")}</h3>
        <div class="dash-panel-body">
          ${a.length===0?`<p class="dash-empty">${e("dash_coach_no_recent")}</p>`:a.slice(0,5).map(t=>`
            <div class="dash-mini-card">
              <div class="dash-mini-top"><span class="dash-mini-name">${fe(t)}</span></div>
              <div class="dash-mini-meta">${t.swimmers?t.swimmers.filter(i=>!i.deleted).length:0} swimmer(s)</div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `}function De(){const s=ve();return`
    <div class="dash-panel">
      <div class="dash-panel-header" style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h3 class="dash-panel-title">${e("dash_coach_roster_title")} (${s.length} athletes)</h3>
      </div>
      <div class="dash-panel-body">
        ${s.length===0?`<p class="dash-empty">${e("dash_coach_no_swimmers")}</p>`:`
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
              <th style="padding: 1rem;">${e("dash_coach_roster_name")}</th>
              <th style="padding: 1rem;">${e("dash_coach_roster_parent")}</th>
              <th style="padding: 1rem;">${e("dash_coach_roster_age")}</th>
              <th style="padding: 1rem;">${e("dash_coach_roster_gender")}</th>
              <th style="padding: 1rem;">${e("dash_coach_roster_usa_id")}</th>
            </tr>
          </thead>
          <tbody>
            ${s.map(a=>{const n=a.dob?Math.floor((new Date-new Date(a.dob))/315576e5):"—";return`
                <tr style="border-bottom: 1px solid var(--border-color);">
                  <td style="padding: 1rem; font-weight: 500;">${[a.firstName,a.lastName].filter(Boolean).join(" ")}</td>
                  <td style="padding: 1rem;">${a.parentName}</td>
                  <td style="padding: 1rem;">${n}</td>
                  <td style="padding: 1rem;">${a.gender||"—"}</td>
                  <td style="padding: 1rem;">${a.usaSwimmingId||"—"}</td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
        `}
      </div>
    </div>
  `}function Ce(){const s=$.filter(t=>t.status!=="Completed").length,a=$.filter(t=>t.status==="Completed").length,n=w.filter(t=>t.status!=="Completed").length;return`
    <div class="dash-stats-row">
      <div class="dash-stat-card">
        <div class="dash-stat-number">${$.length}</div>
        <div class="dash-stat-label">${e("dash_swimmer_total_plans")}</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${s}</div>
        <div class="dash-stat-label">${e("dash_swimmer_active_plans")}</div>
      </div>
      <div class="dash-stat-card accent">
        <div class="dash-stat-number">${a}</div>
        <div class="dash-stat-label">${e("dash_swimmer_completed")}</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${n}</div>
        <div class="dash-stat-label">${e("dash_swimmer_upcoming_meets")}</div>
      </div>
    </div>

    <div class="dash-overview-grid">
      <div class="dash-panel">
        <h3 class="dash-panel-title">${e("dash_swimmer_active_plans_title")}</h3>
        <div class="dash-panel-body">
          ${$.filter(t=>t.status!=="Completed").map(t=>Se(t)).join("")}
        </div>
      </div>
      <div class="dash-panel">
        <h3 class="dash-panel-title">${e("dash_swimmer_upcoming_meets_title")}</h3>
        <div class="dash-panel-body">
          ${w.filter(t=>t.status!=="Completed").map(t=>Le(t)).join("")}
        </div>
      </div>
    </div>

    <div class="dash-panel">
      <h3 class="dash-panel-title">${e("dash_swimmer_today_practice")}</h3>
      <div class="dash-panel-body">
        ${Ae()}
      </div>
    </div>
  `}function Se(s){return`
    <div class="dash-mini-card">
      <div class="dash-mini-top">
        <span class="dash-mini-name">${s.name}</span>
        <span class="priority-badge priority-${s.priority.toLowerCase()}">${s.priority}</span>
      </div>
      <div class="dash-progress-row">
        <div class="dash-progress-bar"><div class="dash-progress-fill" style="width: ${s.progress}%"></div></div>
        <span class="dash-progress-pct">${s.progress}%</span>
      </div>
    </div>
  `}function Le(s){const a=s.status||"Open";return`
    <div class="dash-mini-card">
      <div class="dash-mini-top">
        <span class="dash-mini-name">${s.name||"Untitled Meet"}</span>
        <span class="status-badge status-${a.toLowerCase().replace(" ","-")}">${a}</span>
      </div>
      <div class="dash-mini-meta">${s.date||""} · ${s.location||""}</div>
    </div>
  `}function Ae(){const s=new Date().getDay(),a=E(s),n=N.filter(t=>t.day===a);return n.length===0?`<p class="dash-empty">${e("dash_swimmer_rest_day")} (${a}). Rest day! 🎉</p>`:n.map(t=>`
    <div class="dash-mini-card">
      <div class="dash-mini-top">
        <span class="dash-mini-name">${t.focus}</span>
        <span class="group-badge">${t.group}</span>
      </div>
      <div class="dash-mini-meta">${t.time} · ${t.coach}</div>
    </div>
  `).join("")}function Ne(){if(!o)return`<div class="dash-panel" style="text-align: center; padding: 3rem;">
      <p class="dash-empty">${e("dash_profile_no_reg")}</p>
      <p style="margin-top: 1rem;"><a href="/dragonwebsite/registration.html" class="btn btn-primary">${e("dash_profile_complete_reg")}</a></p>
    </div>`;const s=o.parent||{},a=o.spouse,n=o.swimmers||[],t=o.emergencyContact||{};return`
    <div class="profile-grid">
      <div class="profile-col">
        <div class="dash-panel">
          <div class="dash-panel-header">
            <h3>${e("dash_profile_parent_title")}</h3>
            <button class="btn btn-outline btn-sm" id="edit-contact-btn">${e("dash_profile_edit")}</button>
          </div>
          <div class="profile-fields">
            <div class="profile-field">
              <span class="profile-label">${e("dash_profile_name")}</span>
              <span class="profile-value">${[s.firstName,s.middleName,s.lastName].filter(Boolean).join(" ")||"—"}</span>
            </div>
            <div class="profile-field">
              <span class="profile-label">${e("dash_profile_gender")}</span>
              <span class="profile-value">${s.gender||"—"}</span>
            </div>
            <div class="profile-field">
              <span class="profile-label">${e("dash_profile_email")}</span>
              <span class="profile-value">${s.email||"—"}</span>
            </div>
            <div class="profile-field">
              <span class="profile-label">${e("dash_profile_phone")}</span>
              <span class="profile-value profile-display" id="display-parent-phone">${s.phone||"—"}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-parent-phone" value="${s.phone||""}" />
            </div>
            <div class="profile-field">
              <span class="profile-label">${e("dash_profile_address")}</span>
              <span class="profile-value profile-display" id="display-parent-address">${s.address||"—"}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-parent-address" value="${s.address||""}" />
            </div>
          </div>
        </div>

        ${a?`
        <div class="dash-panel">
          <h3>${e("dash_profile_spouse_title")}</h3>
          <div class="profile-fields">
            <div class="profile-field">
              <span class="profile-label">${e("dash_profile_name")}</span>
              <span class="profile-value">${[a.firstName,a.middleName,a.lastName].filter(Boolean).join(" ")||"—"}</span>
            </div>
            <div class="profile-field">
              <span class="profile-label">${e("dash_profile_gender")}</span>
              <span class="profile-value">${a.gender||"—"}</span>
            </div>
            <div class="profile-field">
              <span class="profile-label">${e("dash_profile_phone")}</span>
              <span class="profile-value profile-display" id="display-spouse-phone">${a.phone||"—"}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-spouse-phone" value="${a.phone||""}" />
            </div>
            <div class="profile-field">
              <span class="profile-label">${e("dash_profile_email")}</span>
              <span class="profile-value profile-display" id="display-spouse-email">${a.email||"—"}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-spouse-email" value="${a.email||""}" />
            </div>
          </div>
        </div>
        `:""}

        <div class="dash-panel">
          <h3>${e("dash_profile_emergency_title")}</h3>
          <div class="profile-fields">
            <div class="profile-field">
              <span class="profile-label">${e("dash_profile_name")}</span>
              <span class="profile-value profile-display" id="display-emergency-name">${t.name||"—"}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-emergency-name" value="${t.name||""}" />
            </div>
            <div class="profile-field">
              <span class="profile-label">${e("dash_profile_phone")}</span>
              <span class="profile-value profile-display" id="display-emergency-phone">${t.phone||"—"}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-emergency-phone" value="${t.phone||""}" />
            </div>
          </div>
        </div>

        <div class="profile-edit-actions" id="edit-actions" style="display: none;">
          <button class="btn btn-primary btn-sm" id="save-contact-btn">${e("dash_profile_save")}</button>
          <button class="btn btn-outline btn-sm" id="cancel-contact-btn">${e("dash_profile_cancel")}</button>
        </div>
      </div>

      <div class="profile-col">
        <div class="dash-panel">
          <div class="dash-panel-header">
            <h3>${e("dash_profile_swimmers_title")} (${n.length})</h3>
            <button class="btn btn-outline btn-sm" id="add-swimmer-toggle-btn">${e("dash_profile_add_swimmer")}</button>
          </div>
          <div id="add-swimmer-form" style="display: none; margin-bottom: var(--space-md); padding: var(--space-md); border: 1px solid var(--border-color); border-radius: var(--radius-md);">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">${e("dash_profile_swimmer_first")}</label>
                <input class="form-input" id="new-swimmer-first" />
              </div>
              <div class="form-group">
                <label class="form-label">${e("dash_profile_swimmer_last")}</label>
                <input class="form-input" id="new-swimmer-last" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">${e("dash_profile_swimmer_middle")}</label>
                <input class="form-input" id="new-swimmer-middle" />
              </div>
              <div class="form-group">
                <label class="form-label">${e("dash_profile_swimmer_gender")}</label>
                <select class="form-select" id="new-swimmer-gender">
                  <option value="" disabled selected>${e("dash_profile_select_gender")}</option>
                  <option value="male">${e("dash_profile_gender_male")}</option>
                  <option value="female">${e("dash_profile_gender_female")}</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">${e("dash_profile_swimmer_dob")}</label>
                <input class="form-input" type="date" id="new-swimmer-dob" />
              </div>
              <div class="form-group">
                <label class="form-label">${e("dash_profile_swimmer_usa_id")}</label>
                <input class="form-input" id="new-swimmer-usaId" />
              </div>
            </div>
            <div style="display: flex; gap: var(--space-sm); margin-top: var(--space-md);">
              <button class="btn btn-primary btn-sm" id="save-swimmer-btn">${e("dash_profile_save_swimmer")}</button>
              <button class="btn btn-outline btn-sm" id="cancel-swimmer-btn">${e("dash_profile_cancel_swimmer")}</button>
            </div>
          </div>
          ${n.filter(i=>!i.deleted).length===0?`<p class="dash-empty">${e("dash_profile_no_swimmers")}</p>`:n.map((i,c)=>i.deleted?"":`

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
              <button class="btn btn-outline btn-sm delete-swimmer-btn" data-index="${c}" style="color: var(--color-accent); border-color: var(--color-accent);">${e("dash_profile_remove")}</button>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `}function je(){return`
    <div class="dash-cards-grid">
      ${$.map(s=>`
        <div class="dash-card">
          <div class="dash-card-header">
            <h3 class="dash-card-title">${s.name}</h3>
            <div class="dash-card-badges">
              <span class="status-badge status-${s.status.toLowerCase().replace(" ","-")}">${s.status}</span>
              <span class="priority-badge priority-${s.priority.toLowerCase()}">${s.priority}</span>
            </div>
          </div>
          <div class="dash-card-body">
            <div class="dash-card-row">
              <span class="dash-card-label">Progress</span>
              <span class="dash-card-value">${s.progress}%</span>
            </div>
            <div class="dash-progress-bar"><div class="dash-progress-fill" style="width: ${s.progress}%"></div></div>
            <div class="dash-card-meta">
              <span>📅 Season: ${s.season}</span>
              <span>Training: ${s.daysPerWeek} Days/Week</span>
            </div>
            <div class="dash-card-meta">
              <span>📋 ${s.tasks}</span>
              <span>Due: ${s.due}</span>
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `}function ne(){const s=_==="coach";return`
    <div class="dash-section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2 style="font-size: 1.5rem; font-weight: 600; color: var(--text-primary);">${e("dash_meets_upcoming")}</h2>
      ${s?`<button class="btn btn-primary btn-sm" id="add-meet-btn">${e("dash_meets_add")}</button>`:""}
    </div>

    ${s?`
      <div id="add-meet-form" class="dash-panel" style="display: none; margin-bottom: 2rem; padding: 1.5rem;">
        <h3 style="margin-bottom: 1rem;">${e("dash_meets_new_title")}</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
          <input type="text" id="meet-name" placeholder="${e("dash_meets_name_placeholder")}" class="form-input">
          <input type="date" id="meet-date" class="form-input">
          <input type="text" id="meet-location" placeholder="${e("dash_meets_location_placeholder")}" class="form-input">
          <input type="text" id="meet-events" placeholder="${e("dash_meets_events_placeholder")}" class="form-input">
        </div>
        <div style="margin-top: 1rem; display: flex; gap: 1rem;">
          <button class="btn btn-primary btn-sm" id="save-meet-btn">${e("dash_meets_save")}</button>
          <button class="btn btn-outline btn-sm" id="cancel-meet-btn">${e("dash_meets_cancel")}</button>
        </div>
      </div>
    `:""}

    <div class="dash-cards-grid">
      ${w.length===0?`<p class="dash-empty">${e("dash_meets_no_meets")}</p>`:w.map(a=>`
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
                ${(a.events||[]).map(n=>`<span class="event-tag">${n}</span>`).join("")}
              </div>
            </div>
            <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
              ${!s&&a.status==="Open"?`<button class="btn btn-primary btn-sm dash-register-btn">${e("dash_meets_register")}</button>`:""}
              ${s?`<button class="btn btn-outline btn-sm delete-meet" data-id="${a.id}" style="color: var(--color-accent); border-color: var(--color-accent);">${e("dash_meets_delete")}</button>`:""}
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `}function ie(){const s=_==="coach";[0,1,2,3,4,5,6].map(n=>E(n));const a=[1,2,3,4,5,6,0];return`
    <div class="dash-section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2 style="font-size: 1.5rem; font-weight: 600; color: var(--text-primary);">${e("dash_schedule_weekly")}</h2>
      ${s?`<button class="btn btn-primary btn-sm" id="add-session-btn">${e("dash_schedule_add")}</button>`:""}
    </div>

    ${s?`
      <div id="add-session-form" class="dash-panel" style="display: none; margin-bottom: 2rem; padding: 1.5rem;">
        <h3 style="margin-bottom: 1rem;">${e("dash_schedule_new_title")}</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem;">
          <select id="session-day" class="form-input">
            ${a.map(n=>`<option value="${E(n)}">${E(n)}</option>`).join("")}
          </select>
          <input type="text" id="session-time" placeholder="${e("dash_schedule_time_placeholder")}" class="form-input">
          <input type="text" id="session-group" placeholder="${e("dash_schedule_group_placeholder")}" class="form-input">
          <input type="text" id="session-focus" placeholder="${e("dash_schedule_focus_placeholder")}" class="form-input">
          <input type="text" id="session-coach" placeholder="${e("dash_schedule_coach_placeholder")}" class="form-input">
        </div>
        <div style="margin-top: 1rem; display: flex; gap: 1rem;">
          <button class="btn btn-primary btn-sm" id="save-session-btn">${e("dash_schedule_save")}</button>
          <button class="btn btn-outline btn-sm" id="cancel-session-btn">${e("dash_schedule_cancel")}</button>
        </div>
      </div>
    `:""}

    <div class="dash-schedule-grid">
      ${a.map(n=>{const t=E(n),i=N.filter(c=>c.day===t);return`
          <div class="dash-schedule-day">
            <h3 class="dash-schedule-day-name">${t}</h3>
            ${i.length===0?`<p class="dash-empty-sm">${e("dash_schedule_no_practice")}</p>`:i.map(c=>`
                <div class="dash-schedule-item">
                  <div class="dash-schedule-time">${c.time}</div>
                  <div class="dash-schedule-focus">${c.focus}</div>
                  <div class="dash-schedule-meta" style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <span class="group-badge">${c.group}</span>
                      <span>${c.coach}</span>
                    </div>
                    ${s?`<button class="delete-session" data-id="${c.id}" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--color-accent); padding: 0 5px;">&times;</button>`:""}
                  </div>
                </div>
              `).join("")}
          </div>
        `}).join("")}
    </div>
  `}function Pe(s,a){const n=document.createElement("div");n.className="confirm-overlay",n.innerHTML=`
    <div class="confirm-modal">
      <h3 class="confirm-title">${e("dash_profile_delete_title")}</h3>
      <p class="confirm-body">${e("dash_profile_delete_body1")} <strong style="color: var(--color-accent, #dc3545);">${s}</strong> ${e("dash_profile_delete_body2")}</p>
      <p class="confirm-warning">${e("dash_profile_delete_warning")}</p>
      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="confirm-cancel">${e("dash_profile_delete_cancel")}</button>
        <button class="btn btn-sm" id="confirm-delete" style="background: var(--color-accent, #dc3545); color: white; border: none;">${e("dash_profile_delete_confirm")}</button>
      </div>
    </div>
  `,document.body.appendChild(n),n.querySelector("#confirm-cancel").addEventListener("click",()=>n.remove()),n.querySelector("#confirm-delete").addEventListener("click",async()=>{n.remove();const t=[...o.swimmers];t[a]={...t[a],deleted:!0,deletedAt:new Date().toISOString()};try{await L(y(v,"registrations",k),{swimmers:t}),o.swimmers=t,m="profile",b()}catch(i){console.error("Error marking swimmer deleted:",i),alert(e("dash_profile_save_failed"))}}),n.addEventListener("click",t=>{t.target===n&&n.remove()})}function qe(){const s=document.createElement("div");s.className="confirm-overlay",s.innerHTML=`
    <div class="confirm-modal" style="max-width: 420px;">
      <h3 class="confirm-title">${e("dash_profile_security_title")}</h3>
      <div style="padding: var(--space-md) 0;">
        <div class="profile-field">
          <label class="form-label" for="modal-current-password">${e("dash_profile_current_password")}</label>
          <input class="form-input" type="password" id="modal-current-password" placeholder="Enter current password" />
        </div>
        <div class="profile-field">
          <label class="form-label" for="modal-new-password">${e("dash_profile_new_password")}</label>
          <input class="form-input" type="password" id="modal-new-password" placeholder="Enter new password" />
        </div>
        <div class="profile-field">
          <label class="form-label" for="modal-confirm-password">${e("dash_profile_confirm_password")}</label>
          <input class="form-input" type="password" id="modal-confirm-password" placeholder="Confirm new password" />
        </div>
        <p id="modal-password-msg" style="font-size: 14px; margin-top: 10px; display: none;"></p>
      </div>
      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="modal-password-cancel">${e("dash_profile_cancel")}</button>
        <button class="btn btn-primary btn-sm" id="modal-password-submit">${e("dash_profile_password_btn")}</button>
      </div>
    </div>
  `,document.body.appendChild(s);const a=s.querySelector("#modal-password-msg");s.querySelector("#modal-password-cancel").addEventListener("click",()=>s.remove()),s.querySelector("#modal-password-submit").addEventListener("click",async()=>{const n=s.querySelector("#modal-current-password").value,t=s.querySelector("#modal-new-password").value,i=s.querySelector("#modal-confirm-password").value;if(a.style.display="none",!n||!t||!i){a.textContent="All fields are required.",a.style.color="var(--color-accent, #DC2626)",a.style.display="block";return}if(t!==i){a.textContent=e("dash_profile_password_mismatch"),a.style.color="var(--color-accent, #DC2626)",a.style.display="block";return}if(t.length<6){a.textContent="Password must be at least 6 characters.",a.style.color="var(--color-accent, #DC2626)",a.style.display="block";return}try{const c=le.credential(p.email,n);await re(p,c),await ce(p,t),a.textContent=e("dash_profile_password_success"),a.style.color="#16A34A",a.style.display="block",s.querySelector("#modal-current-password").value="",s.querySelector("#modal-new-password").value="",s.querySelector("#modal-confirm-password").value=""}catch(c){console.error("Password update error:",c),c.code==="auth/wrong-password"||c.code==="auth/invalid-credential"?a.textContent=e("dash_profile_password_wrong"):a.textContent=e("dash_profile_password_error")+" "+(c.message||""),a.style.color="var(--color-accent, #DC2626)",a.style.display="block"}}),s.addEventListener("click",n=>{n.target===s&&s.remove()})}function be(){var i,c,j,P,q,T,M,R,O,z,F,H,U,W,Y,J,K,V,G;document.querySelectorAll(".dash-nav-item[data-tab]").forEach(d=>{d.addEventListener("click",()=>{m=d.dataset.tab,b()})}),(i=document.getElementById("dash-theme-toggle"))==null||i.addEventListener("click",()=>{_e(),b()});const s=document.getElementById("dash-hamburger"),a=document.getElementById("dash-sidebar");s==null||s.addEventListener("click",()=>{a.classList.toggle("open")}),document.querySelectorAll(".dash-register-btn").forEach(d=>{d.addEventListener("click",()=>{window.location.href="/dragonwebsite/registration.html"})}),(c=document.getElementById("sidebar-signout"))==null||c.addEventListener("click",async()=>{try{await X(S),window.location.href="/dragonwebsite/signin.html"}catch(d){console.error("Error signing out:",d)}});const n=document.getElementById("user-trigger"),t=document.getElementById("user-dropdown");n==null||n.addEventListener("click",d=>{d.stopPropagation(),t.style.display=t.style.display==="none"?"block":"none"}),document.addEventListener("click",()=>{t&&(t.style.display="none")}),(j=document.getElementById("menu-profile"))==null||j.addEventListener("click",()=>{m="profile",t.style.display="none",b()}),(P=document.getElementById("menu-signout"))==null||P.addEventListener("click",async()=>{try{await X(S),window.location.href="/dragonwebsite/signin.html"}catch(d){console.error("Error signing out:",d)}}),(q=document.getElementById("menu-admin"))==null||q.addEventListener("click",()=>{window.location.href="/dragonwebsite/admin.html"}),(T=document.getElementById("menu-password"))==null||T.addEventListener("click",()=>{t.style.display="none",qe()}),(M=document.getElementById("edit-contact-btn"))==null||M.addEventListener("click",()=>{document.querySelectorAll(".profile-display").forEach(d=>d.style.display="none"),document.querySelectorAll(".profile-edit-field").forEach(d=>d.style.display="block"),document.getElementById("edit-actions").style.display="flex",document.getElementById("edit-contact-btn").style.display="none"}),(R=document.getElementById("cancel-contact-btn"))==null||R.addEventListener("click",()=>{document.querySelectorAll(".profile-display").forEach(d=>d.style.display=""),document.querySelectorAll(".profile-edit-field").forEach(d=>d.style.display="none"),document.getElementById("edit-actions").style.display="none",document.getElementById("edit-contact-btn").style.display=""}),(O=document.getElementById("save-contact-btn"))==null||O.addEventListener("click",async()=>{var l,h,u,r,f,Q;const d={"parent.phone":((l=document.getElementById("edit-parent-phone"))==null?void 0:l.value.trim())||"","parent.address":((h=document.getElementById("edit-parent-address"))==null?void 0:h.value.trim())||""};o.spouse&&(d["spouse.phone"]=((u=document.getElementById("edit-spouse-phone"))==null?void 0:u.value.trim())||"",d["spouse.email"]=((r=document.getElementById("edit-spouse-email"))==null?void 0:r.value.trim())||""),d["emergencyContact.name"]=((f=document.getElementById("edit-emergency-name"))==null?void 0:f.value.trim())||"",d["emergencyContact.phone"]=((Q=document.getElementById("edit-emergency-phone"))==null?void 0:Q.value.trim())||"";try{await L(y(v,"registrations",k),d),o.parent.phone=d["parent.phone"],o.parent.address=d["parent.address"],o.spouse&&(o.spouse.phone=d["spouse.phone"],o.spouse.email=d["spouse.email"]),o.emergencyContact.name=d["emergencyContact.name"],o.emergencyContact.phone=d["emergencyContact.phone"],m="profile",b()}catch(ge){console.error("Error updating contact:",ge),alert(e("dash_profile_save_failed"))}}),(z=document.getElementById("add-swimmer-toggle-btn"))==null||z.addEventListener("click",()=>{document.getElementById("add-swimmer-form").style.display="block",document.getElementById("add-swimmer-toggle-btn").style.display="none"}),(F=document.getElementById("cancel-swimmer-btn"))==null||F.addEventListener("click",()=>{document.getElementById("add-swimmer-form").style.display="none",document.getElementById("add-swimmer-toggle-btn").style.display=""}),(H=document.getElementById("save-swimmer-btn"))==null||H.addEventListener("click",async()=>{const d=document.getElementById("new-swimmer-first").value.trim(),l=document.getElementById("new-swimmer-last").value.trim();if(!d||!l){alert(e("dash_profile_swimmer_required"));return}const h={firstName:d,lastName:l,middleName:document.getElementById("new-swimmer-middle").value.trim()||null,gender:document.getElementById("new-swimmer-gender").value||null,dob:document.getElementById("new-swimmer-dob").value||null,usaSwimmingId:document.getElementById("new-swimmer-usaId").value.trim()||null,joinDate:null},u=[...o.swimmers,h];try{await L(y(v,"registrations",k),{swimmers:u}),o.swimmers=u,m="profile",b()}catch(r){console.error("Error adding swimmer:",r),alert(e("dash_profile_swimmer_add_failed"))}}),document.querySelectorAll(".delete-swimmer-btn").forEach(d=>{d.addEventListener("click",()=>{const l=parseInt(d.dataset.index),h=o.swimmers[l],u=[h.firstName,h.lastName].filter(Boolean).join(" ");Pe(u,l)})}),(U=document.getElementById("update-password-btn"))==null||U.addEventListener("click",async()=>{const d=document.getElementById("password-update-msg"),l=document.getElementById("change-current-password").value,h=document.getElementById("change-new-password").value,u=document.getElementById("change-confirm-password").value;d.style.display="none",d.style.color="";const r=document.getElementById("update-password-btn");if(r&&(r.disabled=!0),!l||!h||!u){d.textContent="All fields are required.",d.style.color="var(--color-accent, #DC2626)",d.style.display="block",r&&(r.disabled=!1);return}if(h!==u){d.textContent=e("dash_profile_password_mismatch"),d.style.color="var(--color-accent, #DC2626)",d.style.display="block",r&&(r.disabled=!1);return}if(h.length<6){d.textContent="Password must be at least 6 characters.",d.style.color="var(--color-accent, #DC2626)",d.style.display="block",r&&(r.disabled=!1);return}try{const f=le.credential(p.email,l);await re(p,f),await ce(p,h),d.textContent=e("dash_profile_password_success"),d.style.color="#16A34A",d.style.display="block",document.getElementById("change-current-password").value="",document.getElementById("change-new-password").value="",document.getElementById("change-confirm-password").value=""}catch(f){console.error("Password update error:",f),f.code==="auth/wrong-password"||f.code==="auth/invalid-credential"?d.textContent=e("dash_profile_password_wrong"):d.textContent=e("dash_profile_password_error")+" "+(f.message||""),d.style.color="var(--color-accent, #DC2626)",d.style.display="block"}finally{r&&(r.disabled=!1)}}),_==="coach"&&((W=document.getElementById("add-meet-btn"))==null||W.addEventListener("click",()=>{document.getElementById("add-meet-form").style.display="block"}),(Y=document.getElementById("cancel-meet-btn"))==null||Y.addEventListener("click",()=>{document.getElementById("add-meet-form").style.display="none"}),(J=document.getElementById("save-meet-btn"))==null||J.addEventListener("click",async()=>{const d=document.getElementById("meet-name").value,l=document.getElementById("meet-date").value,h=document.getElementById("meet-location").value,u=document.getElementById("meet-events").value;if(!d||!l){alert(e("dash_meets_name_date_required"));return}try{await Z(I(v,"meets"),{name:d,date:l,location:h,events:u.split(",").map(r=>r.trim()),status:"Open",createdAt:new Date}),document.getElementById("add-meet-form").style.display="none"}catch(r){console.error("Error adding meet:",r)}}),document.querySelectorAll(".delete-meet").forEach(d=>{d.addEventListener("click",async()=>{if(confirm(e("dash_meets_confirm_delete")))try{await ee(y(v,"meets",d.dataset.id))}catch(l){console.error("Error deleting meet:",l)}})}),(K=document.getElementById("add-session-btn"))==null||K.addEventListener("click",()=>{document.getElementById("add-session-form").style.display="block"}),(V=document.getElementById("cancel-session-btn"))==null||V.addEventListener("click",()=>{document.getElementById("add-session-form").style.display="none"}),(G=document.getElementById("save-session-btn"))==null||G.addEventListener("click",async()=>{const d=document.getElementById("session-day").value,l=document.getElementById("session-time").value,h=document.getElementById("session-group").value,u=document.getElementById("session-focus").value,r=document.getElementById("session-coach").value;if(!l||!h){alert(e("dash_schedule_time_group_required"));return}try{await Z(I(v,"schedules"),{day:d,time:l,group:h,focus:u,coach:r,createdAt:new Date}),document.getElementById("add-session-form").style.display="none"}catch(f){console.error("Error adding session:",f)}}),document.querySelectorAll(".delete-session").forEach(d=>{d.addEventListener("click",async()=>{if(confirm(e("dash_schedule_delete_confirm")))try{await ee(y(v,"schedules",d.dataset.id))}catch(l){console.error("Error deleting session:",l)}})}))}we();
