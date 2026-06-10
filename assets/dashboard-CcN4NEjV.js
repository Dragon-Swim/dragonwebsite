import{i as N,t as e,a as ue}from"./i18n-C8EWnRiK.js";import{o as ve,h as ie,g as _,e as p,b as L,q as x,k as D,c as E,j as S,n as G,u as C,a as Q,f as X}from"./firebase-B6pM3H1n.js";N();const w=[{id:1,name:"Endurance Base Building",season:"Winter 2026",daysPerWeek:4,priority:"High",progress:72,tasks:"18 / 25 workouts completed",due:"Feb 28, 2026",status:"In Progress"},{id:2,name:"Sprint Technique Focus",season:"Spring 2026",daysPerWeek:3,priority:"Medium",progress:45,tasks:"9 / 20 workouts completed",due:"Mar 15, 2026",status:"In Progress"},{id:3,name:"Stroke Refinement (Butterfly)",season:"Summer 2026",daysPerWeek:5,priority:"Low",progress:0,tasks:"0 / 12 workouts completed",due:"Apr 30, 2026",status:"Not Started"},{id:4,name:"Fall Conditioning",season:"Fall 2025",daysPerWeek:3,priority:"High",progress:100,tasks:"30 / 30 workouts completed",due:"Nov 20, 2025",status:"Completed"}];let f=[],j=[],y=null,b="swimmer",g=null,l=null,k=null,B=[],o="overview",Z=!1;function ge(){const s=document.getElementById("app");s.innerHTML=`
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; gap: 20px; font-family: sans-serif;">
      <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #f5c518; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <p style="color: #666;">${e("dash_loading")}</p>
      <style>
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    </div>
  `,console.log("Dashboard: Initializing auth listener...");const t=setTimeout(()=>{console.warn("Dashboard: Auth listener timed out — redirecting to signin"),window.location.href="/dragonwebsite/signin.html"},5e3);ve(L,async d=>{if(clearTimeout(t),!d){console.log("Dashboard: No user authenticated, redirecting to signin..."),window.location.href="/dragonwebsite/signin.html";return}y=d,console.log("Dashboard: User authenticated:",d.email);try{console.log("Dashboard: Fetching user document...");const a=await ie(_(p,"users",d.uid));g=a.exists()?a.data().role:null;const n=d.email&&d.email.toLowerCase()==="dragonswim@outlook.com";b=g==="coach"||g==="admin"||n?"coach":g||"swimmer",console.log("Dashboard: Detected role:",b),Z?(console.log("Dashboard: Refreshing UI..."),u()):(console.log("Dashboard: Initializing data listeners..."),be(),Z=!0,u())}catch(a){console.error("Dashboard Critical Error:",a),s.innerHTML=`
        <div style="padding: 40px; text-align: center; font-family: sans-serif; max-width: 500px; margin: 100px auto; border: 1px solid #fee2e2; background: #fef2f2; border-radius: 12px; color: #991b1b;">
          <h2 style="margin-bottom: 16px;">${e("dash_load_failed_title")}</h2>
          <p style="margin-bottom: 24px;">${e("dash_load_failed_msg")}</p>
          <code style="display: block; padding: 12px; background: #fee2e2; border-radius: 6px; font-size: 13px; text-align: left; overflow-x: auto; margin-bottom: 24px;">
            ${a.message||e("dash_unknown_error")}
          </code>
          <button onclick="window.location.reload()" style="padding: 10px 20px; background: #991b1b; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">${e("dash_load_failed_retry")}</button>
        </div>
      `,b="swimmer"}})}function be(){const s=x(E(p,"meets"),D("createdAt","desc"));S(s,d=>{f=d.docs.map(a=>({id:a.id,...a.data()})),u()},d=>{console.error("Error listening to meets:",d)});const t=x(E(p,"schedules"),D("createdAt","asc"));if(S(t,d=>{j=d.docs.map(a=>({id:a.id,...a.data()})),u()},d=>{console.error("Error listening to schedules:",d)}),ne(),b==="coach"){const d=x(E(p,"registrations"),D("createdAt","desc"));S(d,a=>{B=a.docs.map(n=>({id:n.id,...n.data()})),u()},a=>{console.error("Error listening to registrations:",a)})}}async function ne(){if(!y)return;const s=_(p,"registrations",y.uid),t=await ie(s);t.exists()&&(k=t.id,l=t.data())}function u(){y&&ne().then(()=>{ee()}).catch(s=>{console.error("Error fetching family data:",s),ee()})}function ee(){b==="coach"?ye(y):fe(y)}const _e=["dash_day_sunday","dash_day_monday","dash_day_tuesday","dash_day_wednesday","dash_day_thursday","dash_day_friday","dash_day_saturday"];function $(s){return e(_e[s]||"dash_day_monday")}function fe(s){const t=document.getElementById("app");t.innerHTML=`
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
            <button class="dash-nav-item ${o==="overview"?"active":""}" data-tab="overview">
              <span class="dash-nav-icon">📊</span> ${e("dash_swimmer_overview_label")}
            </button>
            <button class="dash-nav-item ${o==="profile"?"active":""}" data-tab="profile">
              <span class="dash-nav-icon">👤</span> ${e("dash_swimmer_profile_label")}
            </button>
            <button class="dash-nav-item ${o==="plans"?"active":""}" data-tab="plans">
              <span class="dash-nav-icon">📋</span> ${e("dash_swimmer_plans_label")}
            </button>
            <button class="dash-nav-item ${o==="meets"?"active":""}" data-tab="meets">
              <span class="dash-nav-icon">🏆</span> ${e("dash_swimmer_meets_label")}
            </button>
            <button class="dash-nav-item ${o==="schedule"?"active":""}" data-tab="schedule">
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
              <h1 class="dash-page-title">${le(o)}</h1>
              <p class="dash-page-subtitle">${we(o)}</p>
            </div>
          </div>
          <div class="dash-topbar-right">
            <div class="dash-user-menu" id="user-menu">
              <button class="dash-user-trigger" id="user-trigger">
                <div class="dash-avatar">${(se()||s.email||e("dash_swimmer_username_fallback")).charAt(0).toUpperCase()}</div>
                <span class="dash-user-name">${se()||s.email||e("dash_swimmer_username_fallback")}</span>
                <span class="dash-dropdown-arrow">▾</span>
              </button>
              <div class="dash-dropdown" id="user-dropdown" style="display: none;">
                <button class="dash-dropdown-item" id="menu-profile">${e("dash_user_menu_profile")}</button>
                ${g==="admin"?`<button class="dash-dropdown-item" id="menu-admin">${e("dash_user_menu_admin")}</button>`:""}
                <button class="dash-dropdown-item" id="menu-signout" style="color: var(--color-accent);">${e("dash_user_menu_signout")}</button>
              </div>
            </div>
          </div>
        </header>

        <div class="dash-content">
          ${oe(o,"swimmer")}
        </div>
      </main>
    </div>
  `,pe(),N(),re()}function ye(s){const t=document.getElementById("app");t.innerHTML=`
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
            <button class="dash-nav-item ${o==="overview"?"active":""}" data-tab="overview">
              <span class="dash-nav-icon">🏠</span> ${e("dash_coach_overview_label")}
            </button>
            <button class="dash-nav-item ${o==="roster"?"active":""}" data-tab="roster">
              <span class="dash-nav-icon">👥</span> ${e("dash_coach_roster_label")}
            </button>
            <button class="dash-nav-item ${o==="meets"?"active":""}" data-tab="meets">
              <span class="dash-nav-icon">🏁</span> ${e("dash_coach_meets_label")}
            </button>
            <button class="dash-nav-item ${o==="schedule"?"active":""}" data-tab="schedule">
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
              <h1 class="dash-page-title">Coach: ${le(o,"coach")}</h1>
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
                <button class="dash-dropdown-item" id="menu-signout" style="color: var(--color-accent);">${e("dash_user_menu_signout")}</button>
              </div>
            </div>
          </div>
        </header>

        <div class="dash-content">
          ${oe(o,"coach")}
        </div>
      </main>
    </div>
  `,pe(),N(),re()}function se(){if(!l||!l.parent)return null;const s=l.parent;return[s.firstName,s.lastName].filter(Boolean).join(" ")||null}function le(s,t="swimmer"){return t==="coach"?{overview:e("dash_coach_tab_overview"),roster:e("dash_coach_tab_roster"),meets:e("dash_coach_tab_meets"),schedule:e("dash_coach_tab_schedule")}[s]||e("dash_coach_tab_overview"):{overview:e("dash_swimmer_tab_overview"),profile:e("dash_swimmer_tab_profile"),plans:e("dash_swimmer_tab_plans"),meets:e("dash_swimmer_tab_meets"),schedule:e("dash_swimmer_tab_schedule")}[s]||e("dash_swimmer_tab_overview")}function we(s){return{overview:e("dash_swimmer_overview_sub"),profile:e("dash_swimmer_profile_sub"),plans:e("dash_swimmer_plans_sub"),meets:e("dash_swimmer_meets_sub"),schedule:e("dash_swimmer_schedule_sub")}[s]||""}function oe(s,t="swimmer"){if(t==="coach")switch(s){case"overview":return ae();case"roster":return Ee();case"meets":return te();case"schedule":return de();default:return ae()}switch(s){case"overview":return Ie();case"profile":return De();case"plans":return Se();case"meets":return te();case"schedule":return de();default:return""}}function re(){const s=document.getElementById("sidebar-theme-icon");if(s){const t=document.documentElement.getAttribute("data-theme")==="dark";s.textContent=t?"☀️":"🌙"}}function ce(){const s=[];for(const t of B)if(t.swimmers)for(const d of t.swimmers)d.deleted||s.push({...d,parentName:me(t)});return s}function me(s){return s.parent&&[s.parent.firstName,s.parent.lastName].filter(Boolean).join(" ")||"—"}function $e(){const s=new Date;return s.setDate(s.getDate()-30),B.filter(t=>{var a,n;return(((n=(a=t.createdAt)==null?void 0:a.toDate)==null?void 0:n.call(a))||new Date(t.createdAt))>=s})}function ae(){const s=ce(),t=$e(),d=f.filter(a=>a.status!=="Completed");return`
    <div class="dash-stats-row">
      <div class="dash-stat-card">
        <div class="dash-stat-number">${s.length}</div>
        <div class="dash-stat-label">${e("dash_coach_active_athletes")}</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${t.length}</div>
        <div class="dash-stat-label">${e("dash_coach_new_registrations")}</div>
      </div>
      <div class="dash-stat-card accent">
        <div class="dash-stat-number">${d.length}</div>
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
          ${s.length===0?`<p class="dash-empty">${e("dash_coach_no_swimmers")}</p>`:s.slice(0,5).map(a=>`
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
        <h3 class="dash-panel-title">${e("dash_coach_recent_registrations")}</h3>
        <div class="dash-panel-body">
          ${t.length===0?`<p class="dash-empty">${e("dash_coach_no_recent")}</p>`:t.slice(0,5).map(a=>`
            <div class="dash-mini-card">
              <div class="dash-mini-top"><span class="dash-mini-name">${me(a)}</span></div>
              <div class="dash-mini-meta">${a.swimmers?a.swimmers.filter(n=>!n.deleted).length:0} swimmer(s)</div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `}function Ee(){const s=ce();return`
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
            ${s.map(t=>{const d=t.dob?Math.floor((new Date-new Date(t.dob))/315576e5):"—";return`
                <tr style="border-bottom: 1px solid var(--border-color);">
                  <td style="padding: 1rem; font-weight: 500;">${[t.firstName,t.lastName].filter(Boolean).join(" ")}</td>
                  <td style="padding: 1rem;">${t.parentName}</td>
                  <td style="padding: 1rem;">${d}</td>
                  <td style="padding: 1rem;">${t.gender||"—"}</td>
                  <td style="padding: 1rem;">${t.usaSwimmingId||"—"}</td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
        `}
      </div>
    </div>
  `}function Ie(){const s=w.filter(a=>a.status!=="Completed").length,t=w.filter(a=>a.status==="Completed").length,d=f.filter(a=>a.status!=="Completed").length;return`
    <div class="dash-stats-row">
      <div class="dash-stat-card">
        <div class="dash-stat-number">${w.length}</div>
        <div class="dash-stat-label">${e("dash_swimmer_total_plans")}</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${s}</div>
        <div class="dash-stat-label">${e("dash_swimmer_active_plans")}</div>
      </div>
      <div class="dash-stat-card accent">
        <div class="dash-stat-number">${t}</div>
        <div class="dash-stat-label">${e("dash_swimmer_completed")}</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${d}</div>
        <div class="dash-stat-label">${e("dash_swimmer_upcoming_meets")}</div>
      </div>
    </div>

    <div class="dash-overview-grid">
      <div class="dash-panel">
        <h3 class="dash-panel-title">${e("dash_swimmer_active_plans_title")}</h3>
        <div class="dash-panel-body">
          ${w.filter(a=>a.status!=="Completed").map(a=>ke(a)).join("")}
        </div>
      </div>
      <div class="dash-panel">
        <h3 class="dash-panel-title">${e("dash_swimmer_upcoming_meets_title")}</h3>
        <div class="dash-panel-body">
          ${f.filter(a=>a.status!=="Completed").map(a=>Be(a)).join("")}
        </div>
      </div>
    </div>

    <div class="dash-panel">
      <h3 class="dash-panel-title">${e("dash_swimmer_today_practice")}</h3>
      <div class="dash-panel-body">
        ${xe()}
      </div>
    </div>
  `}function ke(s){return`
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
  `}function Be(s){const t=s.status||"Open";return`
    <div class="dash-mini-card">
      <div class="dash-mini-top">
        <span class="dash-mini-name">${s.name||"Untitled Meet"}</span>
        <span class="status-badge status-${t.toLowerCase().replace(" ","-")}">${t}</span>
      </div>
      <div class="dash-mini-meta">${s.date||""} · ${s.location||""}</div>
    </div>
  `}function xe(){const s=new Date().getDay(),t=$(s),d=j.filter(a=>a.day===t);return d.length===0?`<p class="dash-empty">${e("dash_swimmer_rest_day")} (${t}). Rest day! 🎉</p>`:d.map(a=>`
    <div class="dash-mini-card">
      <div class="dash-mini-top">
        <span class="dash-mini-name">${a.focus}</span>
        <span class="group-badge">${a.group}</span>
      </div>
      <div class="dash-mini-meta">${a.time} · ${a.coach}</div>
    </div>
  `).join("")}function De(){if(!l)return`<div class="dash-panel" style="text-align: center; padding: 3rem;">
      <p class="dash-empty">${e("dash_profile_no_reg")}</p>
      <p style="margin-top: 1rem;"><a href="/dragonwebsite/registration.html" class="btn btn-primary">${e("dash_profile_complete_reg")}</a></p>
    </div>`;const s=l.parent||{},t=l.spouse,d=l.swimmers||[],a=l.emergencyContact||{};return`
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

        ${t?`
        <div class="dash-panel">
          <h3>${e("dash_profile_spouse_title")}</h3>
          <div class="profile-fields">
            <div class="profile-field">
              <span class="profile-label">${e("dash_profile_name")}</span>
              <span class="profile-value">${[t.firstName,t.middleName,t.lastName].filter(Boolean).join(" ")||"—"}</span>
            </div>
            <div class="profile-field">
              <span class="profile-label">${e("dash_profile_gender")}</span>
              <span class="profile-value">${t.gender||"—"}</span>
            </div>
            <div class="profile-field">
              <span class="profile-label">${e("dash_profile_phone")}</span>
              <span class="profile-value profile-display" id="display-spouse-phone">${t.phone||"—"}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-spouse-phone" value="${t.phone||""}" />
            </div>
            <div class="profile-field">
              <span class="profile-label">${e("dash_profile_email")}</span>
              <span class="profile-value profile-display" id="display-spouse-email">${t.email||"—"}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-spouse-email" value="${t.email||""}" />
            </div>
          </div>
        </div>
        `:""}

        <div class="dash-panel">
          <h3>${e("dash_profile_emergency_title")}</h3>
          <div class="profile-fields">
            <div class="profile-field">
              <span class="profile-label">${e("dash_profile_name")}</span>
              <span class="profile-value profile-display" id="display-emergency-name">${a.name||"—"}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-emergency-name" value="${a.name||""}" />
            </div>
            <div class="profile-field">
              <span class="profile-label">${e("dash_profile_phone")}</span>
              <span class="profile-value profile-display" id="display-emergency-phone">${a.phone||"—"}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-emergency-phone" value="${a.phone||""}" />
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
            <h3>${e("dash_profile_swimmers_title")} (${d.length})</h3>
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
          ${d.filter(n=>!n.deleted).length===0?`<p class="dash-empty">${e("dash_profile_no_swimmers")}</p>`:d.map((n,c)=>n.deleted?"":`

            <div class="swimmer-profile-card">
              <div class="swimmer-profile-info">
                <strong>${[n.firstName,n.middleName,n.lastName].filter(Boolean).join(" ")}</strong>
                <div class="swimmer-profile-meta">
                  <span>${n.gender||"—"}</span>
                  <span>DOB: ${n.dob||"—"}</span>
                  ${n.usaSwimmingId?`<span>USA ID: ${n.usaSwimmingId}</span>`:""}
                  ${n.joinDate?`<span>Joined: ${n.joinDate}</span>`:""}
                </div>
              </div>
              <button class="btn btn-outline btn-sm delete-swimmer-btn" data-index="${c}" style="color: var(--color-accent); border-color: var(--color-accent);">${e("dash_profile_remove")}</button>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `}function Se(){return`
    <div class="dash-cards-grid">
      ${w.map(s=>`
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
  `}function te(){const s=b==="coach";return`
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
      ${f.length===0?`<p class="dash-empty">${e("dash_meets_no_meets")}</p>`:f.map(t=>`
        <div class="dash-card">
          <div class="dash-card-header">
            <h3 class="dash-card-title">${t.name}</h3>
            <span class="status-badge status-${(t.status||"Open").toLowerCase().replace(" ","-")}">${t.status||"Open"}</span>
          </div>
          <div class="dash-card-body">
            <div class="dash-card-meta">
              <span>📅 ${t.date}</span>
              <span>📍 ${t.location}</span>
            </div>
            <div class="dash-card-events">
              <span class="dash-card-label">Events</span>
              <div class="dash-event-tags">
                ${(t.events||[]).map(d=>`<span class="event-tag">${d}</span>`).join("")}
              </div>
            </div>
            <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
              ${!s&&t.status==="Open"?`<button class="btn btn-primary btn-sm dash-register-btn">${e("dash_meets_register")}</button>`:""}
              ${s?`<button class="btn btn-outline btn-sm delete-meet" data-id="${t.id}" style="color: var(--color-accent); border-color: var(--color-accent);">${e("dash_meets_delete")}</button>`:""}
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `}function de(){const s=b==="coach";[0,1,2,3,4,5,6].map(d=>$(d));const t=[1,2,3,4,5,6,0];return`
    <div class="dash-section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2 style="font-size: 1.5rem; font-weight: 600; color: var(--text-primary);">${e("dash_schedule_weekly")}</h2>
      ${s?`<button class="btn btn-primary btn-sm" id="add-session-btn">${e("dash_schedule_add")}</button>`:""}
    </div>

    ${s?`
      <div id="add-session-form" class="dash-panel" style="display: none; margin-bottom: 2rem; padding: 1.5rem;">
        <h3 style="margin-bottom: 1rem;">${e("dash_schedule_new_title")}</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem;">
          <select id="session-day" class="form-input">
            ${t.map(d=>`<option value="${$(d)}">${$(d)}</option>`).join("")}
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
      ${t.map(d=>{const a=$(d),n=j.filter(c=>c.day===a);return`
          <div class="dash-schedule-day">
            <h3 class="dash-schedule-day-name">${a}</h3>
            ${n.length===0?`<p class="dash-empty-sm">${e("dash_schedule_no_practice")}</p>`:n.map(c=>`
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
  `}function Le(s,t){const d=document.createElement("div");d.className="confirm-overlay",d.innerHTML=`
    <div class="confirm-modal">
      <h3 class="confirm-title">${e("dash_profile_delete_title")}</h3>
      <p class="confirm-body">${e("dash_profile_delete_body1")} <strong style="color: var(--color-accent, #dc3545);">${s}</strong> ${e("dash_profile_delete_body2")}</p>
      <p class="confirm-warning">${e("dash_profile_delete_warning")}</p>
      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="confirm-cancel">${e("dash_profile_delete_cancel")}</button>
        <button class="btn btn-sm" id="confirm-delete" style="background: var(--color-accent, #dc3545); color: white; border: none;">${e("dash_profile_delete_confirm")}</button>
      </div>
    </div>
  `,document.body.appendChild(d),d.querySelector("#confirm-cancel").addEventListener("click",()=>d.remove()),d.querySelector("#confirm-delete").addEventListener("click",async()=>{d.remove();const a=[...l.swimmers];a[t]={...a[t],deleted:!0,deletedAt:new Date().toISOString()};try{await C(_(p,"registrations",k),{swimmers:a}),l.swimmers=a,o="profile",u()}catch(n){console.error("Error marking swimmer deleted:",n),alert(e("dash_profile_save_failed"))}}),d.addEventListener("click",a=>{a.target===d&&d.remove()})}function pe(){var n,c,A,T,q,P,M,R,O,F,U,z,H,W,Y,J,K;document.querySelectorAll(".dash-nav-item[data-tab]").forEach(i=>{i.addEventListener("click",()=>{o=i.dataset.tab,u()})}),(n=document.getElementById("dash-theme-toggle"))==null||n.addEventListener("click",()=>{ue(),u()});const s=document.getElementById("dash-hamburger"),t=document.getElementById("dash-sidebar");s==null||s.addEventListener("click",()=>{t.classList.toggle("open")}),document.querySelectorAll(".dash-register-btn").forEach(i=>{i.addEventListener("click",()=>{window.location.href="/dragonwebsite/registration.html"})}),(c=document.getElementById("sidebar-signout"))==null||c.addEventListener("click",async()=>{try{await G(L),window.location.href="/dragonwebsite/signin.html"}catch(i){console.error("Error signing out:",i)}});const d=document.getElementById("user-trigger"),a=document.getElementById("user-dropdown");d==null||d.addEventListener("click",i=>{i.stopPropagation(),a.style.display=a.style.display==="none"?"block":"none"}),document.addEventListener("click",()=>{a&&(a.style.display="none")}),(A=document.getElementById("menu-profile"))==null||A.addEventListener("click",()=>{o="profile",a.style.display="none",u()}),(T=document.getElementById("menu-signout"))==null||T.addEventListener("click",async()=>{try{await G(L),window.location.href="/dragonwebsite/signin.html"}catch(i){console.error("Error signing out:",i)}}),(q=document.getElementById("menu-admin"))==null||q.addEventListener("click",()=>{window.location.href="/dragonwebsite/admin.html"}),(P=document.getElementById("edit-contact-btn"))==null||P.addEventListener("click",()=>{document.querySelectorAll(".profile-display").forEach(i=>i.style.display="none"),document.querySelectorAll(".profile-edit-field").forEach(i=>i.style.display="block"),document.getElementById("edit-actions").style.display="flex",document.getElementById("edit-contact-btn").style.display="none"}),(M=document.getElementById("cancel-contact-btn"))==null||M.addEventListener("click",()=>{document.querySelectorAll(".profile-display").forEach(i=>i.style.display=""),document.querySelectorAll(".profile-edit-field").forEach(i=>i.style.display="none"),document.getElementById("edit-actions").style.display="none",document.getElementById("edit-contact-btn").style.display=""}),(R=document.getElementById("save-contact-btn"))==null||R.addEventListener("click",async()=>{var r,m,h,v,I,V;const i={"parent.phone":((r=document.getElementById("edit-parent-phone"))==null?void 0:r.value.trim())||"","parent.address":((m=document.getElementById("edit-parent-address"))==null?void 0:m.value.trim())||""};l.spouse&&(i["spouse.phone"]=((h=document.getElementById("edit-spouse-phone"))==null?void 0:h.value.trim())||"",i["spouse.email"]=((v=document.getElementById("edit-spouse-email"))==null?void 0:v.value.trim())||""),i["emergencyContact.name"]=((I=document.getElementById("edit-emergency-name"))==null?void 0:I.value.trim())||"",i["emergencyContact.phone"]=((V=document.getElementById("edit-emergency-phone"))==null?void 0:V.value.trim())||"";try{await C(_(p,"registrations",k),i),l.parent.phone=i["parent.phone"],l.parent.address=i["parent.address"],l.spouse&&(l.spouse.phone=i["spouse.phone"],l.spouse.email=i["spouse.email"]),l.emergencyContact.name=i["emergencyContact.name"],l.emergencyContact.phone=i["emergencyContact.phone"],o="profile",u()}catch(he){console.error("Error updating contact:",he),alert(e("dash_profile_save_failed"))}}),(O=document.getElementById("add-swimmer-toggle-btn"))==null||O.addEventListener("click",()=>{document.getElementById("add-swimmer-form").style.display="block",document.getElementById("add-swimmer-toggle-btn").style.display="none"}),(F=document.getElementById("cancel-swimmer-btn"))==null||F.addEventListener("click",()=>{document.getElementById("add-swimmer-form").style.display="none",document.getElementById("add-swimmer-toggle-btn").style.display=""}),(U=document.getElementById("save-swimmer-btn"))==null||U.addEventListener("click",async()=>{const i=document.getElementById("new-swimmer-first").value.trim(),r=document.getElementById("new-swimmer-last").value.trim();if(!i||!r){alert(e("dash_profile_swimmer_required"));return}const m={firstName:i,lastName:r,middleName:document.getElementById("new-swimmer-middle").value.trim()||null,gender:document.getElementById("new-swimmer-gender").value||null,dob:document.getElementById("new-swimmer-dob").value||null,usaSwimmingId:document.getElementById("new-swimmer-usaId").value.trim()||null,joinDate:null},h=[...l.swimmers,m];try{await C(_(p,"registrations",k),{swimmers:h}),l.swimmers=h,o="profile",u()}catch(v){console.error("Error adding swimmer:",v),alert(e("dash_profile_swimmer_add_failed"))}}),document.querySelectorAll(".delete-swimmer-btn").forEach(i=>{i.addEventListener("click",()=>{const r=parseInt(i.dataset.index),m=l.swimmers[r],h=[m.firstName,m.lastName].filter(Boolean).join(" ");Le(h,r)})}),b==="coach"&&((z=document.getElementById("add-meet-btn"))==null||z.addEventListener("click",()=>{document.getElementById("add-meet-form").style.display="block"}),(H=document.getElementById("cancel-meet-btn"))==null||H.addEventListener("click",()=>{document.getElementById("add-meet-form").style.display="none"}),(W=document.getElementById("save-meet-btn"))==null||W.addEventListener("click",async()=>{const i=document.getElementById("meet-name").value,r=document.getElementById("meet-date").value,m=document.getElementById("meet-location").value,h=document.getElementById("meet-events").value;if(!i||!r){alert(e("dash_meets_name_date_required"));return}try{await Q(E(p,"meets"),{name:i,date:r,location:m,events:h.split(",").map(v=>v.trim()),status:"Open",createdAt:new Date}),document.getElementById("add-meet-form").style.display="none"}catch(v){console.error("Error adding meet:",v)}}),document.querySelectorAll(".delete-meet").forEach(i=>{i.addEventListener("click",async()=>{if(confirm(e("dash_meets_confirm_delete")))try{await X(_(p,"meets",i.dataset.id))}catch(r){console.error("Error deleting meet:",r)}})}),(Y=document.getElementById("add-session-btn"))==null||Y.addEventListener("click",()=>{document.getElementById("add-session-form").style.display="block"}),(J=document.getElementById("cancel-session-btn"))==null||J.addEventListener("click",()=>{document.getElementById("add-session-form").style.display="none"}),(K=document.getElementById("save-session-btn"))==null||K.addEventListener("click",async()=>{const i=document.getElementById("session-day").value,r=document.getElementById("session-time").value,m=document.getElementById("session-group").value,h=document.getElementById("session-focus").value,v=document.getElementById("session-coach").value;if(!r||!m){alert(e("dash_schedule_time_group_required"));return}try{await Q(E(p,"schedules"),{day:i,time:r,group:m,focus:h,coach:v,createdAt:new Date}),document.getElementById("add-session-form").style.display="none"}catch(I){console.error("Error adding session:",I)}}),document.querySelectorAll(".delete-session").forEach(i=>{i.addEventListener("click",async()=>{if(confirm(e("dash_schedule_delete_confirm")))try{await X(_(p,"schedules",i.dataset.id))}catch(r){console.error("Error deleting session:",r)}})}))}ge();
