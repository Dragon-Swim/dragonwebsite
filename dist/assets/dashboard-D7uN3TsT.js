import{i as F,t as e,a as $e}from"./i18n-lMocD5gN.js";import{o as Ee,h as me,g,e as _,b as z,q as j,k as P,c as L,j as M,p as ae,u as S,E as pe,r as he,t as ue,a as te,f as de}from"./firebase-8Bk_msJm.js";F();const R=[{id:1,name:"Endurance Base Building",season:"Winter 2026",daysPerWeek:4,priority:"High",progress:72,tasks:"18 / 25 workouts completed",due:"Feb 28, 2026",status:"In Progress"},{id:2,name:"Sprint Technique Focus",season:"Spring 2026",daysPerWeek:3,priority:"Medium",progress:45,tasks:"9 / 20 workouts completed",due:"Mar 15, 2026",status:"In Progress"},{id:3,name:"Stroke Refinement (Butterfly)",season:"Summer 2026",daysPerWeek:5,priority:"Low",progress:0,tasks:"0 / 12 workouts completed",due:"Apr 30, 2026",status:"Not Started"},{id:4,name:"Fall Conditioning",season:"Fall 2025",daysPerWeek:3,priority:"High",progress:100,tasks:"30 / 30 workouts completed",due:"Nov 20, 2025",status:"Completed"}];let D=[],w=null,O=[],$=null,p=null,I="swimmer",E=null,c=null,N=null,q=[],m="overview",ne=!1;function Ie(){const s=document.getElementById("app");s.innerHTML=`
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; gap: 20px; font-family: sans-serif;">
      <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #f5c518; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <p style="color: #666;">${e("dash_loading")}</p>
      <style>
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    </div>
  `,console.log("Dashboard: Initializing auth listener...");const a=setTimeout(()=>{console.warn("Dashboard: Auth listener timed out — redirecting to signin"),window.location.href="/dragonwebsite/signin.html"},5e3);Ee(z,async d=>{if(clearTimeout(a),!d){console.log("Dashboard: No user authenticated, redirecting to signin..."),window.location.href="/dragonwebsite/signin.html";return}p=d,console.log("Dashboard: User authenticated:",d.email);try{console.log("Dashboard: Fetching user document...");const t=await me(g(_,"users",d.uid));E=t.exists()?t.data().role:null;const i=d.email&&d.email.toLowerCase()==="dragonswim@outlook.com";I=E==="coach"||E==="admin"||i?"coach":E||"swimmer",console.log("Dashboard: Detected role:",I),ne?(console.log("Dashboard: Refreshing UI..."),y()):(console.log("Dashboard: Initializing data listeners..."),xe(),ne=!0,y())}catch(t){console.error("Dashboard Critical Error:",t),s.innerHTML=`
        <div style="padding: 40px; text-align: center; font-family: sans-serif; max-width: 500px; margin: 100px auto; border: 1px solid #fee2e2; background: #fef2f2; border-radius: 12px; color: #991b1b;">
          <h2 style="margin-bottom: 16px;">${e("dash_load_failed_title")}</h2>
          <p style="margin-bottom: 24px;">${e("dash_load_failed_msg")}</p>
          <code style="display: block; padding: 12px; background: #fee2e2; border-radius: 6px; font-size: 13px; text-align: left; overflow-x: auto; margin-bottom: 24px;">
            ${t.message||e("dash_unknown_error")}
          </code>
          <button onclick="window.location.reload()" style="padding: 10px 20px; background: #991b1b; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">${e("dash_load_failed_retry")}</button>
        </div>
      `,I="swimmer"}})}function xe(){const s=j(L(_,"meets"),P("createdAt","desc"));M(s,d=>{D=d.docs.map(t=>({id:t.id,...t.data()})),y()},d=>{console.error("Error listening to meets:",d)});const a=j(L(_,"schedules"),P("createdAt","asc"));if(M(a,d=>{O=d.docs.map(t=>({id:t.id,...t.data()})),y()},d=>{console.error("Error listening to schedules:",d)}),ve(),I==="coach"){const d=j(L(_,"registrations"),P("createdAt","desc"));M(d,t=>{q=t.docs.map(i=>({id:i.id,...i.data()})),y()},t=>{console.error("Error listening to registrations:",t)})}}async function ve(){if(!p)return;const s=g(_,"registrations",p.uid),a=await me(s);a.exists()&&(N=a.id,c=a.data())}function y(){p&&ve().then(()=>{ie()}).catch(s=>{console.error("Error fetching family data:",s),ie()})}function ie(){I==="coach"?De(p):ke(p)}const Be=["dash_day_sunday","dash_day_monday","dash_day_tuesday","dash_day_wednesday","dash_day_thursday","dash_day_friday","dash_day_saturday"];function k(s){return e(Be[s]||"dash_day_monday")}function ke(s){const a=document.getElementById("app");a.innerHTML=`
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
            ${E==="admin"?`
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
              <h1 class="dash-page-title">${_e(m)}</h1>
              <p class="dash-page-subtitle">${Ce(m)}</p>
            </div>
          </div>
          <div class="dash-topbar-right">
            <div class="dash-user-menu" id="user-menu">
              <button class="dash-user-trigger" id="user-trigger">
                <div class="dash-avatar">${(le()||s.email||e("dash_swimmer_username_fallback")).charAt(0).toUpperCase()}</div>
                <span class="dash-user-name">${le()||s.email||e("dash_swimmer_username_fallback")}</span>
                <span class="dash-dropdown-arrow">▾</span>
              </button>
              <div class="dash-dropdown" id="user-dropdown" style="display: none;">
                <button class="dash-dropdown-item" id="menu-profile">${e("dash_user_menu_profile")}</button>
                ${E==="admin"?`<button class="dash-dropdown-item" id="menu-admin">${e("dash_user_menu_admin")}</button>`:""}
                ${p&&p.providerData&&p.providerData[0].providerId==="password"?`<button class="dash-dropdown-item" id="menu-password">🔑 ${e("dash_profile_password_btn")}</button>`:""}
                <button class="dash-dropdown-item" id="menu-signout" style="color: var(--color-accent);">${e("dash_user_menu_signout")}</button>
              </div>
            </div>
          </div>
        </header>

        <div class="dash-content">
          ${fe(m,"swimmer")}
        </div>
      </main>
    </div>
  `,we(),F(),be()}function De(s){const a=document.getElementById("app");a.innerHTML=`
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
            ${E==="admin"?`
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
              <h1 class="dash-page-title">Coach: ${_e(m,"coach")}</h1>
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
                ${E==="admin"?`<button class="dash-dropdown-item" id="menu-admin">${e("dash_user_menu_admin")}</button>`:""}
                ${p&&p.providerData&&p.providerData[0].providerId==="password"?`<button class="dash-dropdown-item" id="menu-password">🔑 ${e("dash_profile_password_btn")}</button>`:""}
                <button class="dash-dropdown-item" id="menu-signout" style="color: var(--color-accent);">${e("dash_user_menu_signout")}</button>
              </div>
            </div>
          </div>
        </header>

        <div class="dash-content">
          ${fe(m,"coach")}
        </div>
      </main>
    </div>
  `,we(),F(),be()}function le(){if(!c||!c.parent)return null;const s=c.parent;return[s.firstName,s.lastName].filter(Boolean).join(" ")||null}function _e(s,a="swimmer"){return a==="coach"?{overview:e("dash_coach_tab_overview"),roster:e("dash_coach_tab_roster"),meets:e("dash_coach_tab_meets"),schedule:e("dash_coach_tab_schedule")}[s]||e("dash_coach_tab_overview"):{overview:e("dash_swimmer_tab_overview"),profile:e("dash_swimmer_tab_profile"),plans:e("dash_swimmer_tab_plans"),meets:e("dash_swimmer_tab_meets"),schedule:e("dash_swimmer_tab_schedule")}[s]||e("dash_swimmer_tab_overview")}function Ce(s){return{overview:e("dash_swimmer_overview_sub"),profile:e("dash_swimmer_profile_sub"),plans:e("dash_swimmer_plans_sub"),meets:e("dash_swimmer_meets_sub"),schedule:e("dash_swimmer_schedule_sub")}[s]||""}function fe(s,a="swimmer"){if(a==="coach")switch(s){case"overview":return oe();case"roster":return Le();case"meets":return re();case"schedule":return ce();default:return oe()}switch(s){case"overview":return Ae();case"profile":return Te();case"plans":return je();case"meets":return re();case"schedule":return ce();default:return""}}function be(){const s=document.getElementById("sidebar-theme-icon");if(s){const a=document.documentElement.getAttribute("data-theme")==="dark";s.textContent=a?"☀️":"🌙"}}function ye(){const s=[];for(const a of q)if(a.swimmers)for(const d of a.swimmers)d.deleted||s.push({...d,parentName:ge(a)});return s}function ge(s){return s.parent&&[s.parent.firstName,s.parent.lastName].filter(Boolean).join(" ")||"—"}function Se(){const s=new Date;return s.setDate(s.getDate()-30),q.filter(a=>{var t,i;return(((i=(t=a.createdAt)==null?void 0:t.toDate)==null?void 0:i.call(t))||new Date(a.createdAt))>=s})}function oe(){const s=ye(),a=Se(),d=D.filter(t=>t.status!=="Completed");return`
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
        <div class="dash-stat-number">${d.length}</div>
        <div class="dash-stat-label">${e("dash_coach_upcoming_meets")}</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${q.length}</div>
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
              <div class="dash-mini-top"><span class="dash-mini-name">${ge(t)}</span></div>
              <div class="dash-mini-meta">${t.swimmers?t.swimmers.filter(i=>!i.deleted).length:0} swimmer(s)</div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `}function Le(){const s=ye();return`
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
            ${s.map(a=>{const d=a.dob?Math.floor((new Date-new Date(a.dob))/315576e5):"—";return`
                <tr style="border-bottom: 1px solid var(--border-color);">
                  <td style="padding: 1rem; font-weight: 500;">${[a.firstName,a.lastName].filter(Boolean).join(" ")}</td>
                  <td style="padding: 1rem;">${a.parentName}</td>
                  <td style="padding: 1rem;">${d}</td>
                  <td style="padding: 1rem;">${a.gender||"—"}</td>
                  <td style="padding: 1rem;">${a.usaSwimmingId||"—"}</td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
        `}
      </div>
    </div>
  `}function Ae(){const s=R.filter(t=>t.status!=="Completed").length,a=R.filter(t=>t.status==="Completed").length,d=D.filter(t=>t.status!=="Completed").length;return`
    <div class="dash-stats-row">
      <div class="dash-stat-card">
        <div class="dash-stat-number">${R.length}</div>
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
        <div class="dash-stat-number">${d}</div>
        <div class="dash-stat-label">${e("dash_swimmer_upcoming_meets")}</div>
      </div>
    </div>

    <div class="dash-overview-grid">
      <div class="dash-panel">
        <h3 class="dash-panel-title">${e("dash_swimmer_active_plans_title")}</h3>
        <div class="dash-panel-body" style="text-align: center; padding: 2rem;">
          <p style="color: var(--text-secondary);">${e("dash_plans_under_construction")}</p>
        </div>
      </div>
      <div class="dash-panel">
        <h3 class="dash-panel-title">${e("dash_swimmer_upcoming_meets_title")}</h3>
        <div class="dash-panel-body">
          ${D.filter(t=>t.status!=="Completed").map(t=>Ne(t)).join("")}
        </div>
      </div>
    </div>

    <div class="dash-panel">
      <h3 class="dash-panel-title">${e("dash_swimmer_today_practice")}</h3>
      <div class="dash-panel-body">
        ${qe()}
      </div>
    </div>
  `}function Ne(s){const a=s.status||"Open",d=s.startDate&&s.endDate?`${s.startDate} – ${s.endDate}`:s.date||"";return`
    <div class="dash-mini-card">
      <div class="dash-mini-top">
        <span class="dash-mini-name">${s.name||"Untitled Meet"}</span>
        <span class="status-badge status-${a.toLowerCase().replace(" ","-")}">${a}</span>
      </div>
      <div class="dash-mini-meta">${d} · ${s.location||""}</div>
    </div>
  `}function qe(){const s=new Date().getDay(),a=k(s),d=O.filter(t=>t.day===a);return d.length===0?`<p class="dash-empty">${e("dash_swimmer_rest_day")} (${a}). Rest day! 🎉</p>`:d.map(t=>`
    <div class="dash-mini-card">
      <div class="dash-mini-top">
        <span class="dash-mini-name">${t.startTime} – ${t.endTime}</span>
      </div>
      <div class="dash-mini-meta">${t.location||""}</div>
    </div>
  `).join("")}function Te(){if(!c)return`<div class="dash-panel" style="text-align: center; padding: 3rem;">
      <p class="dash-empty">${e("dash_profile_no_reg")}</p>
      <p style="margin-top: 1rem;"><a href="/dragonwebsite/registration.html" class="btn btn-primary">${e("dash_profile_complete_reg")}</a></p>
    </div>`;const s=c.parent||{},a=c.spouse,d=c.swimmers||[],t=c.emergencyContact||{};return`
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
          ${d.filter(i=>!i.deleted).length===0?`<p class="dash-empty">${e("dash_profile_no_swimmers")}</p>`:d.map((i,o)=>i.deleted?"":`

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
              <button class="btn btn-outline btn-sm delete-swimmer-btn" data-index="${o}" style="color: var(--color-accent); border-color: var(--color-accent);">${e("dash_profile_remove")}</button>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `}function je(){return`
    <div class="dash-panel" style="text-align: center; padding: 4rem 2rem;">
      <div style="font-size: 3rem; margin-bottom: 1rem;">🚧</div>
      <h2 style="font-size: 1.5rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem;">${e("dash_plans_under_construction")}</h2>
      <p style="color: var(--text-secondary);">${e("dash_swimmer_plans_sub")}</p>
    </div>
  `}function re(){const s=I==="coach";return`
    <div class="dash-section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2 style="font-size: 1.5rem; font-weight: 600; color: var(--text-primary);">${e("dash_meets_upcoming")}</h2>
      ${s?`<button class="btn btn-primary btn-sm" id="add-meet-btn">${e("dash_meets_add")}</button>`:""}
    </div>

    ${s?`
      <div id="add-meet-form" class="dash-panel" style="display: none; margin-bottom: 2rem; padding: 1.5rem;">
        <h3 style="margin-bottom: 1rem;" id="meet-form-title">${e("dash_meets_new_title")}</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
          <input type="text" id="meet-name" placeholder="${e("dash_meets_name_placeholder")}" class="form-input">
          <input type="date" id="meet-start-date" class="form-input" title="${e("dash_meets_start_date_placeholder")}">
          <input type="date" id="meet-end-date" class="form-input" title="${e("dash_meets_end_date_placeholder")}">
          <input type="text" id="meet-location" placeholder="${e("dash_meets_location_placeholder")}" class="form-input">
        </div>
        <div style="margin-top: 1rem; display: flex; gap: 1rem;">
          <button class="btn btn-primary btn-sm" id="save-meet-btn">${e("dash_meets_save")}</button>
          <button class="btn btn-outline btn-sm" id="cancel-meet-btn">${e("dash_meets_cancel")}</button>
        </div>
      </div>
    `:""}

    <div class="dash-cards-grid">
      ${D.length===0?`<p class="dash-empty">${e("dash_meets_no_meets")}</p>`:D.map(a=>`
        <div class="dash-card">
          <div class="dash-card-header">
            <h3 class="dash-card-title">${a.name}</h3>
            <span class="status-badge status-${(a.status||"Open").toLowerCase().replace(" ","-")}">${a.status||"Open"}</span>
          </div>
          <div class="dash-card-body">
            <div class="dash-card-meta">
              <span>📅 ${a.startDate&&a.endDate?`${a.startDate} – ${a.endDate}`:a.date||""}</span>
              <span>📍 ${a.location}</span>
            </div>
            <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
              ${!s&&a.status==="Open"?`<button class="btn btn-primary btn-sm dash-register-btn">${e("dash_meets_register")}</button>`:""}
              ${s?`<button class="btn btn-outline btn-sm edit-meet" data-id="${a.id}" data-name="${a.name||""}" data-start="${a.startDate||a.date||""}" data-end="${a.endDate||a.date||""}" data-location="${a.location||""}">${e("dash_meets_edit")}</button>`:""}
              ${s?`<button class="btn btn-outline btn-sm delete-meet" data-id="${a.id}" style="color: var(--color-accent); border-color: var(--color-accent);">${e("dash_meets_delete")}</button>`:""}
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `}function ce(){const s=I==="coach";[0,1,2,3,4,5,6].map(d=>k(d));const a=[1,2,3,4,5,6,0];return`
    <div class="dash-section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2 style="font-size: 1.5rem; font-weight: 600; color: var(--text-primary);">${e("dash_schedule_weekly")}</h2>
      ${s?`<button class="btn btn-primary btn-sm" id="add-session-btn">${e("dash_schedule_add")}</button>`:""}
    </div>

    ${s?`
      <div id="add-session-form" class="dash-panel" style="display: none; margin-bottom: 2rem; padding: 1.5rem;">
        <h3 style="margin-bottom: 1rem;" id="session-form-title">${e("dash_schedule_new_title")}</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem;">
          <select id="session-day" class="form-input">
            ${a.map(d=>`<option value="${k(d)}">${k(d)}</option>`).join("")}
          </select>
          <input type="text" id="session-start-time" placeholder="${e("dash_schedule_start_time_placeholder")}" class="form-input">
          <input type="text" id="session-end-time" placeholder="${e("dash_schedule_end_time_placeholder")}" class="form-input">
          <input type="text" id="session-location" placeholder="${e("dash_schedule_location_placeholder")}" class="form-input">
        </div>
        <div style="margin-top: 1rem; display: flex; gap: 1rem;">
          <button class="btn btn-primary btn-sm" id="save-session-btn">${e("dash_schedule_save")}</button>
          <button class="btn btn-outline btn-sm" id="cancel-session-btn">${e("dash_schedule_cancel")}</button>
        </div>
      </div>
    `:""}

    <div class="dash-schedule-grid">
      ${a.map(d=>{const t=k(d),i=O.filter(o=>o.day===t);return`
          <div class="dash-schedule-day">
            <h3 class="dash-schedule-day-name">${t}</h3>
            ${i.length===0?`<p class="dash-empty-sm">${e("dash_schedule_no_practice")}</p>`:i.map(o=>`
                <div class="dash-schedule-item">
                  <div class="dash-schedule-time">${o.startTime} – ${o.endTime}</div>
                  <div class="dash-schedule-focus">${o.location||""}</div>
                  <div class="dash-schedule-meta" style="display: flex; justify-content: flex-end; align-items: center; gap: 8px;">
                    ${s?`
                      <button class="edit-session" data-id="${o.id}" data-day="${o.day}" data-start="${o.startTime||""}" data-end="${o.endTime||""}" data-location="${o.location||""}" style="background: none; border: none; font-size: 1rem; cursor: pointer; color: var(--color-primary); padding: 0 5px;" title="Edit">✎</button>
                      <button class="delete-session" data-id="${o.id}" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--color-accent); padding: 0 5px;" title="Delete">&times;</button>
                    `:""}
                  </div>
                </div>
              `).join("")}
          </div>
        `}).join("")}
    </div>
  `}function Pe(s,a){const d=document.createElement("div");d.className="confirm-overlay",d.innerHTML=`
    <div class="confirm-modal">
      <h3 class="confirm-title">${e("dash_profile_delete_title")}</h3>
      <p class="confirm-body">${e("dash_profile_delete_body1")} <strong style="color: var(--color-accent, #dc3545);">${s}</strong> ${e("dash_profile_delete_body2")}</p>
      <p class="confirm-warning">${e("dash_profile_delete_warning")}</p>
      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="confirm-cancel">${e("dash_profile_delete_cancel")}</button>
        <button class="btn btn-sm" id="confirm-delete" style="background: var(--color-accent, #dc3545); color: white; border: none;">${e("dash_profile_delete_confirm")}</button>
      </div>
    </div>
  `,document.body.appendChild(d),d.querySelector("#confirm-cancel").addEventListener("click",()=>d.remove()),d.querySelector("#confirm-delete").addEventListener("click",async()=>{d.remove();const t=[...c.swimmers];t[a]={...t[a],deleted:!0,deletedAt:new Date().toISOString()};try{await S(g(_,"registrations",N),{swimmers:t}),c.swimmers=t,m="profile",y()}catch(i){console.error("Error marking swimmer deleted:",i),alert(e("dash_profile_save_failed"))}}),d.addEventListener("click",t=>{t.target===d&&d.remove()})}function Me(){const s=document.createElement("div");s.className="confirm-overlay",s.innerHTML=`
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
  `,document.body.appendChild(s);const a=s.querySelector("#modal-password-msg");s.querySelector("#modal-password-cancel").addEventListener("click",()=>s.remove()),s.querySelector("#modal-password-submit").addEventListener("click",async()=>{const d=s.querySelector("#modal-current-password").value,t=s.querySelector("#modal-new-password").value,i=s.querySelector("#modal-confirm-password").value;if(a.style.display="none",!d||!t||!i){a.textContent="All fields are required.",a.style.color="var(--color-accent, #DC2626)",a.style.display="block";return}if(t!==i){a.textContent=e("dash_profile_password_mismatch"),a.style.color="var(--color-accent, #DC2626)",a.style.display="block";return}if(t.length<6){a.textContent="Password must be at least 6 characters.",a.style.color="var(--color-accent, #DC2626)",a.style.display="block";return}try{const o=pe.credential(p.email,d);await he(p,o),await ue(p,t),a.textContent=e("dash_profile_password_success"),a.style.color="#16A34A",a.style.display="block",s.querySelector("#modal-current-password").value="",s.querySelector("#modal-new-password").value="",s.querySelector("#modal-confirm-password").value=""}catch(o){console.error("Password update error:",o),o.code==="auth/wrong-password"||o.code==="auth/invalid-credential"?a.textContent=e("dash_profile_password_wrong"):a.textContent=e("dash_profile_password_error")+" "+(o.message||""),a.style.color="var(--color-accent, #DC2626)",a.style.display="block"}}),s.addEventListener("click",d=>{d.target===s&&s.remove()})}function we(){var i,o,H,U,W,V,Y,J,K,G,Q,X,Z,ee,se;document.querySelectorAll(".dash-nav-item[data-tab]").forEach(n=>{n.addEventListener("click",()=>{m=n.dataset.tab,y()})}),(i=document.getElementById("dash-theme-toggle"))==null||i.addEventListener("click",()=>{$e(),y()});const s=document.getElementById("dash-hamburger"),a=document.getElementById("dash-sidebar");s==null||s.addEventListener("click",()=>{a.classList.toggle("open")}),document.querySelectorAll(".dash-register-btn").forEach(n=>{n.addEventListener("click",()=>{window.location.href="/dragonwebsite/registration.html"})}),(o=document.getElementById("sidebar-signout"))==null||o.addEventListener("click",async()=>{try{await ae(z),window.location.href="/dragonwebsite/signin.html"}catch(n){console.error("Error signing out:",n)}});const d=document.getElementById("user-trigger"),t=document.getElementById("user-dropdown");if(d==null||d.addEventListener("click",n=>{n.stopPropagation(),t.style.display=t.style.display==="none"?"block":"none"}),document.addEventListener("click",()=>{t&&(t.style.display="none")}),(H=document.getElementById("menu-profile"))==null||H.addEventListener("click",()=>{m="profile",t.style.display="none",y()}),(U=document.getElementById("menu-signout"))==null||U.addEventListener("click",async()=>{try{await ae(z),window.location.href="/dragonwebsite/signin.html"}catch(n){console.error("Error signing out:",n)}}),(W=document.getElementById("menu-admin"))==null||W.addEventListener("click",()=>{window.location.href="/dragonwebsite/admin.html"}),(V=document.getElementById("menu-password"))==null||V.addEventListener("click",()=>{t.style.display="none",Me()}),(Y=document.getElementById("edit-contact-btn"))==null||Y.addEventListener("click",()=>{document.querySelectorAll(".profile-display").forEach(n=>n.style.display="none"),document.querySelectorAll(".profile-edit-field").forEach(n=>n.style.display="block"),document.getElementById("edit-actions").style.display="flex",document.getElementById("edit-contact-btn").style.display="none"}),(J=document.getElementById("cancel-contact-btn"))==null||J.addEventListener("click",()=>{document.querySelectorAll(".profile-display").forEach(n=>n.style.display=""),document.querySelectorAll(".profile-edit-field").forEach(n=>n.style.display="none"),document.getElementById("edit-actions").style.display="none",document.getElementById("edit-contact-btn").style.display=""}),(K=document.getElementById("save-contact-btn"))==null||K.addEventListener("click",async()=>{var h,u,f,r,v,B;const n={"parent.phone":((h=document.getElementById("edit-parent-phone"))==null?void 0:h.value.trim())||"","parent.address":((u=document.getElementById("edit-parent-address"))==null?void 0:u.value.trim())||""};c.spouse&&(n["spouse.phone"]=((f=document.getElementById("edit-spouse-phone"))==null?void 0:f.value.trim())||"",n["spouse.email"]=((r=document.getElementById("edit-spouse-email"))==null?void 0:r.value.trim())||""),n["emergencyContact.name"]=((v=document.getElementById("edit-emergency-name"))==null?void 0:v.value.trim())||"",n["emergencyContact.phone"]=((B=document.getElementById("edit-emergency-phone"))==null?void 0:B.value.trim())||"";try{await S(g(_,"registrations",N),n),c.parent.phone=n["parent.phone"],c.parent.address=n["parent.address"],c.spouse&&(c.spouse.phone=n["spouse.phone"],c.spouse.email=n["spouse.email"]),c.emergencyContact.name=n["emergencyContact.name"],c.emergencyContact.phone=n["emergencyContact.phone"],m="profile",y()}catch(A){console.error("Error updating contact:",A),alert(e("dash_profile_save_failed"))}}),(G=document.getElementById("add-swimmer-toggle-btn"))==null||G.addEventListener("click",()=>{document.getElementById("add-swimmer-form").style.display="block",document.getElementById("add-swimmer-toggle-btn").style.display="none"}),(Q=document.getElementById("cancel-swimmer-btn"))==null||Q.addEventListener("click",()=>{document.getElementById("add-swimmer-form").style.display="none",document.getElementById("add-swimmer-toggle-btn").style.display=""}),(X=document.getElementById("save-swimmer-btn"))==null||X.addEventListener("click",async()=>{const n=document.getElementById("new-swimmer-first").value.trim(),h=document.getElementById("new-swimmer-last").value.trim();if(!n||!h){alert(e("dash_profile_swimmer_required"));return}const u={firstName:n,lastName:h,middleName:document.getElementById("new-swimmer-middle").value.trim()||null,gender:document.getElementById("new-swimmer-gender").value||null,dob:document.getElementById("new-swimmer-dob").value||null,usaSwimmingId:document.getElementById("new-swimmer-usaId").value.trim()||null,joinDate:null},f=[...c.swimmers,u];try{await S(g(_,"registrations",N),{swimmers:f}),c.swimmers=f,m="profile",y()}catch(r){console.error("Error adding swimmer:",r),alert(e("dash_profile_swimmer_add_failed"))}}),document.querySelectorAll(".delete-swimmer-btn").forEach(n=>{n.addEventListener("click",()=>{const h=parseInt(n.dataset.index),u=c.swimmers[h],f=[u.firstName,u.lastName].filter(Boolean).join(" ");Pe(f,h)})}),(Z=document.getElementById("update-password-btn"))==null||Z.addEventListener("click",async()=>{const n=document.getElementById("password-update-msg"),h=document.getElementById("change-current-password").value,u=document.getElementById("change-new-password").value,f=document.getElementById("change-confirm-password").value;n.style.display="none",n.style.color="";const r=document.getElementById("update-password-btn");if(r&&(r.disabled=!0),!h||!u||!f){n.textContent="All fields are required.",n.style.color="var(--color-accent, #DC2626)",n.style.display="block",r&&(r.disabled=!1);return}if(u!==f){n.textContent=e("dash_profile_password_mismatch"),n.style.color="var(--color-accent, #DC2626)",n.style.display="block",r&&(r.disabled=!1);return}if(u.length<6){n.textContent="Password must be at least 6 characters.",n.style.color="var(--color-accent, #DC2626)",n.style.display="block",r&&(r.disabled=!1);return}try{const v=pe.credential(p.email,h);await he(p,v),await ue(p,u),n.textContent=e("dash_profile_password_success"),n.style.color="#16A34A",n.style.display="block",document.getElementById("change-current-password").value="",document.getElementById("change-new-password").value="",document.getElementById("change-confirm-password").value=""}catch(v){console.error("Password update error:",v),v.code==="auth/wrong-password"||v.code==="auth/invalid-credential"?n.textContent=e("dash_profile_password_wrong"):n.textContent=e("dash_profile_password_error")+" "+(v.message||""),n.style.color="var(--color-accent, #DC2626)",n.style.display="block"}finally{r&&(r.disabled=!1)}}),I==="coach"){const n=document.getElementById("add-meet-form"),h=document.getElementById("save-meet-btn"),u=document.getElementById("cancel-meet-btn"),f=document.getElementById("meet-form-title");(ee=document.getElementById("add-meet-btn"))==null||ee.addEventListener("click",()=>{w=null,f.textContent=e("dash_meets_new_title"),h.textContent=e("dash_meets_save"),document.getElementById("meet-name").value="",document.getElementById("meet-start-date").value="",document.getElementById("meet-end-date").value="",document.getElementById("meet-location").value="",n.style.display="block"}),u==null||u.addEventListener("click",()=>{n.style.display="none",w=null}),h==null||h.addEventListener("click",async()=>{const l=document.getElementById("meet-name").value.trim(),b=document.getElementById("meet-start-date").value,x=document.getElementById("meet-end-date").value,C=document.getElementById("meet-location").value.trim();if(!l||!b||!x){alert(e("dash_meets_name_date_required"));return}try{w?await S(g(_,"meets",w),{name:l,startDate:b,endDate:x,location:C}):await te(L(_,"meets"),{name:l,startDate:b,endDate:x,location:C,status:"Open",createdAt:new Date}),n.style.display="none",w=null}catch(T){console.error("Error saving meet:",T)}}),document.querySelectorAll(".edit-meet").forEach(l=>{l.addEventListener("click",()=>{w=l.dataset.id,f.textContent=e("dash_meets_edit_title"),h.textContent=e("dash_meets_update"),document.getElementById("meet-name").value=l.dataset.name,document.getElementById("meet-start-date").value=l.dataset.start,document.getElementById("meet-end-date").value=l.dataset.end,document.getElementById("meet-location").value=l.dataset.location,n.style.display="block",n.scrollIntoView({behavior:"smooth"})})}),document.querySelectorAll(".delete-meet").forEach(l=>{l.addEventListener("click",async()=>{if(confirm(e("dash_meets_confirm_delete")))try{await de(g(_,"meets",l.dataset.id)),w===l.dataset.id&&(n.style.display="none",w=null)}catch(b){console.error("Error deleting meet:",b)}})});const r=document.getElementById("add-session-form"),v=document.getElementById("save-session-btn"),B=document.getElementById("cancel-session-btn"),A=document.getElementById("session-form-title");(se=document.getElementById("add-session-btn"))==null||se.addEventListener("click",()=>{$=null,A.textContent=e("dash_schedule_new_title"),v.textContent=e("dash_schedule_save"),document.getElementById("session-day").value=k(1),document.getElementById("session-start-time").value="",document.getElementById("session-end-time").value="",document.getElementById("session-location").value="",r.style.display="block"}),B==null||B.addEventListener("click",()=>{r.style.display="none",$=null}),v==null||v.addEventListener("click",async()=>{const l=document.getElementById("session-day").value,b=document.getElementById("session-start-time").value.trim(),x=document.getElementById("session-end-time").value.trim(),C=document.getElementById("session-location").value.trim();if(!l||!b||!x){alert(e("dash_schedule_required_fields"));return}try{$?await S(g(_,"schedules",$),{day:l,startTime:b,endTime:x,location:C}):await te(L(_,"schedules"),{day:l,startTime:b,endTime:x,location:C,createdAt:new Date}),r.style.display="none",$=null}catch(T){console.error("Error saving session:",T)}}),document.querySelectorAll(".edit-session").forEach(l=>{l.addEventListener("click",()=>{$=l.dataset.id,A.textContent=e("dash_schedule_edit_title"),v.textContent=e("dash_schedule_update"),document.getElementById("session-day").value=l.dataset.day,document.getElementById("session-start-time").value=l.dataset.start,document.getElementById("session-end-time").value=l.dataset.end,document.getElementById("session-location").value=l.dataset.location,r.style.display="block",r.scrollIntoView({behavior:"smooth"})})}),document.querySelectorAll(".delete-session").forEach(l=>{l.addEventListener("click",async()=>{if(confirm(e("dash_schedule_delete_confirm")))try{await de(g(_,"schedules",l.dataset.id)),$===l.dataset.id&&(r.style.display="none",$=null)}catch(b){console.error("Error deleting session:",b)}})})}}Ie();
