import{i as Q,t as e,a as ke}from"./i18n-DXCkrhfE.js";import{o as xe,h as ue,g as x,e as f,b as K,q as U,k as W,c as N,j as Y,p as ne,u as z,E as ve,r as _e,t as fe,a as de,f as ie,w as Be}from"./firebase-DKR4RDCB.js";Q();const J=[{id:1,name:"Endurance Base Building",season:"Winter 2026",daysPerWeek:4,priority:"High",progress:72,tasks:"18 / 25 workouts completed",due:"Feb 28, 2026",status:"In Progress"},{id:2,name:"Sprint Technique Focus",season:"Spring 2026",daysPerWeek:3,priority:"Medium",progress:45,tasks:"9 / 20 workouts completed",due:"Mar 15, 2026",status:"In Progress"},{id:3,name:"Stroke Refinement (Butterfly)",season:"Summer 2026",daysPerWeek:5,priority:"Low",progress:0,tasks:"0 / 12 workouts completed",due:"Apr 30, 2026",status:"Not Started"},{id:4,name:"Fall Conditioning",season:"Fall 2025",daysPerWeek:3,priority:"High",progress:100,tasks:"30 / 30 workouts completed",due:"Nov 20, 2025",status:"Completed"}];let j=[],C=null,G=[],D=null,h=null,T="swimmer",S=null,c=null,R=null,O=[],p="overview",oe=!1;function Ce(){const t=document.getElementById("app");t.innerHTML=`
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; gap: 20px; font-family: sans-serif;">
      <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #f5c518; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <p style="color: #666;">${e("dash_loading")}</p>
      <style>
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    </div>
  `,console.log("Dashboard: Initializing auth listener...");const s=setTimeout(()=>{console.warn("Dashboard: Auth listener timed out — redirecting to signin"),window.location.href="/dragonwebsite/signin.html"},5e3);xe(K,async n=>{if(clearTimeout(s),!n){console.log("Dashboard: No user authenticated, redirecting to signin..."),window.location.href="/dragonwebsite/signin.html";return}h=n,console.log("Dashboard: User authenticated:",n.email);try{console.log("Dashboard: Fetching user document...");const a=await ue(x(f,"users",n.uid));S=a.exists()?a.data().role:null;const i=n.email&&n.email.toLowerCase()==="dragonswim@outlook.com";T=S==="coach"||S==="admin"||i?"coach":S||"swimmer",console.log("Dashboard: Detected role:",T),oe?(console.log("Dashboard: Refreshing UI..."),$()):(console.log("Dashboard: Initializing data listeners..."),De(),oe=!0,$())}catch(a){console.error("Dashboard Critical Error:",a),t.innerHTML=`
        <div style="padding: 40px; text-align: center; font-family: sans-serif; max-width: 500px; margin: 100px auto; border: 1px solid #fee2e2; background: #fef2f2; border-radius: 12px; color: #991b1b;">
          <h2 style="margin-bottom: 16px;">${e("dash_load_failed_title")}</h2>
          <p style="margin-bottom: 24px;">${e("dash_load_failed_msg")}</p>
          <code style="display: block; padding: 12px; background: #fee2e2; border-radius: 6px; font-size: 13px; text-align: left; overflow-x: auto; margin-bottom: 24px;">
            ${a.message||e("dash_unknown_error")}
          </code>
          <button onclick="window.location.reload()" style="padding: 10px 20px; background: #991b1b; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">${e("dash_load_failed_retry")}</button>
        </div>
      `,T="swimmer"}})}function De(){const t=U(N(f,"meets"),W("createdAt","desc"));Y(t,n=>{j=n.docs.map(a=>({id:a.id,...a.data()})),$()},n=>{console.error("Error listening to meets:",n)});const s=U(N(f,"schedules"),W("createdAt","asc"));if(Y(s,n=>{G=n.docs.map(a=>({id:a.id,...a.data()})),$()},n=>{console.error("Error listening to schedules:",n)}),ge(),T==="coach"){const n=U(N(f,"registrations"),W("createdAt","desc"));Y(n,a=>{O=a.docs.map(i=>({id:i.id,...i.data()})),$()},a=>{console.error("Error listening to registrations:",a)})}}async function ge(){if(!h)return;const t=x(f,"registrations",h.uid),s=await ue(t);s.exists()&&(R=s.id,c=s.data())}function $(){h&&ge().then(()=>{re()}).catch(t=>{console.error("Error fetching family data:",t),re()})}function re(){T==="coach"?Te(h):Le(h)}const Se=["dash_day_sunday","dash_day_monday","dash_day_tuesday","dash_day_wednesday","dash_day_thursday","dash_day_friday","dash_day_saturday"];function L(t){return e(Se[t]||"dash_day_monday")}function Le(t){const s=document.getElementById("app");s.innerHTML=`
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
            <button class="dash-nav-item ${p==="overview"?"active":""}" data-tab="overview">
              <span class="dash-nav-icon">📊</span> ${e("dash_swimmer_overview_label")}
            </button>
            <button class="dash-nav-item ${p==="profile"?"active":""}" data-tab="profile">
              <span class="dash-nav-icon">👤</span> ${e("dash_swimmer_profile_label")}
            </button>
            <button class="dash-nav-item ${p==="plans"?"active":""}" data-tab="plans">
              <span class="dash-nav-icon">📋</span> ${e("dash_swimmer_plans_label")}
            </button>
            <button class="dash-nav-item ${p==="meets"?"active":""}" data-tab="meets">
              <span class="dash-nav-icon">🏆</span> ${e("dash_swimmer_meets_label")}
            </button>
            <button class="dash-nav-item ${p==="schedule"?"active":""}" data-tab="schedule">
              <span class="dash-nav-icon">📅</span> ${e("dash_swimmer_schedule_label")}
            </button>
          </div>
          <div class="dash-nav-section" style="margin-top: auto;">
            <span class="dash-nav-label">${e("dash_sidebar_system")}</span>
            ${S==="admin"?`
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
              <h1 class="dash-page-title">${be(p)}</h1>
              <p class="dash-page-subtitle">${Ae(p)}</p>
            </div>
          </div>
          <div class="dash-topbar-right">
            <div class="dash-user-menu" id="user-menu">
              <button class="dash-user-trigger" id="user-trigger">
                <div class="dash-avatar">${(le()||t.email||e("dash_swimmer_username_fallback")).charAt(0).toUpperCase()}</div>
                <span class="dash-user-name">${le()||t.email||e("dash_swimmer_username_fallback")}</span>
                <span class="dash-dropdown-arrow">▾</span>
              </button>
              <div class="dash-dropdown" id="user-dropdown" style="display: none;">
                <button class="dash-dropdown-item" id="menu-profile">${e("dash_user_menu_profile")}</button>
                ${S==="admin"?`<button class="dash-dropdown-item" id="menu-admin">${e("dash_user_menu_admin")}</button>`:""}
                ${h&&h.providerData&&h.providerData[0].providerId==="password"?`<button class="dash-dropdown-item" id="menu-password">🔑 ${e("dash_profile_password_btn")}</button>`:""}
                <button class="dash-dropdown-item" id="menu-signout" style="color: var(--color-accent);">${e("dash_user_menu_signout")}</button>
              </div>
            </div>
          </div>
        </header>

        <div class="dash-content">
          ${ye(p,"swimmer")}
        </div>
      </main>
    </div>
  `,Ie(),Q(),we()}function Te(t){const s=document.getElementById("app");s.innerHTML=`
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
            <button class="dash-nav-item ${p==="overview"?"active":""}" data-tab="overview">
              <span class="dash-nav-icon">🏠</span> ${e("dash_coach_overview_label")}
            </button>
            <button class="dash-nav-item ${p==="roster"?"active":""}" data-tab="roster">
              <span class="dash-nav-icon">👥</span> ${e("dash_coach_roster_label")}
            </button>
            <button class="dash-nav-item ${p==="meets"?"active":""}" data-tab="meets">
              <span class="dash-nav-icon">🏁</span> ${e("dash_coach_meets_label")}
            </button>
            <button class="dash-nav-item ${p==="schedule"?"active":""}" data-tab="schedule">
              <span class="dash-nav-icon">⏱️</span> ${e("dash_coach_schedule_label")}
            </button>
          </div>
          <div class="dash-nav-section" style="margin-top: auto;">
            <span class="dash-nav-label">${e("dash_sidebar_system")}</span>
            ${S==="admin"?`
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
              <h1 class="dash-page-title">Coach: ${be(p,"coach")}</h1>
              <p class="dash-page-subtitle">${e("dash_coach_topbar_sub")}</p>
            </div>
          </div>
          <div class="dash-topbar-right">
            <div class="badge badge-primary" style="margin-right: 1rem;">${e("dash_coach_badge")}</div>
            <div class="dash-user-menu" id="user-menu">
              <button class="dash-user-trigger" id="user-trigger">
                <div class="dash-avatar" style="background: var(--color-accent); color: white;">${(t.displayName||t.email||e("dash_coach_username_fallback")).charAt(0).toUpperCase()}</div>
                <span class="dash-user-name">${t.displayName||t.email||e("dash_coach_username_fallback")}</span>
                <span class="dash-dropdown-arrow">▾</span>
              </button>
              <div class="dash-dropdown" id="user-dropdown" style="display: none;">
                ${S==="admin"?`<button class="dash-dropdown-item" id="menu-admin">${e("dash_user_menu_admin")}</button>`:""}
                ${h&&h.providerData&&h.providerData[0].providerId==="password"?`<button class="dash-dropdown-item" id="menu-password">🔑 ${e("dash_profile_password_btn")}</button>`:""}
                <button class="dash-dropdown-item" id="menu-signout" style="color: var(--color-accent);">${e("dash_user_menu_signout")}</button>
              </div>
            </div>
          </div>
        </header>

        <div class="dash-content">
          ${ye(p,"coach")}
        </div>
      </main>
    </div>
  `,Ie(),Q(),we()}function le(){if(!c||!c.parent)return null;const t=c.parent;return[t.firstName,t.lastName].filter(Boolean).join(" ")||null}function be(t,s="swimmer"){return s==="coach"?{overview:e("dash_coach_tab_overview"),roster:e("dash_coach_tab_roster"),meets:e("dash_coach_tab_meets"),schedule:e("dash_coach_tab_schedule")}[t]||e("dash_coach_tab_overview"):{overview:e("dash_swimmer_tab_overview"),profile:e("dash_swimmer_tab_profile"),plans:e("dash_swimmer_tab_plans"),meets:e("dash_swimmer_tab_meets"),schedule:e("dash_swimmer_tab_schedule")}[t]||e("dash_swimmer_tab_overview")}function Ae(t){return{overview:e("dash_swimmer_overview_sub"),profile:e("dash_swimmer_profile_sub"),plans:e("dash_swimmer_plans_sub"),meets:e("dash_swimmer_meets_sub"),schedule:e("dash_swimmer_schedule_sub")}[t]||""}function ye(t,s="swimmer"){if(s==="coach")switch(t){case"overview":return ce();case"roster":return Ne();case"meets":return me();case"schedule":return pe();default:return ce()}switch(t){case"overview":return je();case"profile":return ze();case"plans":return Fe();case"meets":return me();case"schedule":return pe();default:return""}}function we(){const t=document.getElementById("sidebar-theme-icon");if(t){const s=document.documentElement.getAttribute("data-theme")==="dark";t.textContent=s?"☀️":"🌙"}}function $e(){const t=[];for(const s of O)if(s.swimmers)for(const n of s.swimmers)n.deleted||t.push({...n,parentName:Ee(s)});return t}function Ee(t){return t.parent&&[t.parent.firstName,t.parent.lastName].filter(Boolean).join(" ")||"—"}function qe(){const t=new Date;return t.setDate(t.getDate()-30),O.filter(s=>{var a,i;return(((i=(a=s.createdAt)==null?void 0:a.toDate)==null?void 0:i.call(a))||new Date(s.createdAt))>=t})}function ce(){const t=$e(),s=qe(),n=j.filter(a=>a.status!=="Completed");return`
    <div class="dash-stats-row">
      <div class="dash-stat-card">
        <div class="dash-stat-number">${t.length}</div>
        <div class="dash-stat-label">${e("dash_coach_active_athletes")}</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${s.length}</div>
        <div class="dash-stat-label">${e("dash_coach_new_registrations")}</div>
      </div>
      <div class="dash-stat-card accent">
        <div class="dash-stat-number">${n.length}</div>
        <div class="dash-stat-label">${e("dash_coach_upcoming_meets")}</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${O.length}</div>
        <div class="dash-stat-label">${e("dash_coach_registered_families")}</div>
      </div>
    </div>

    <div class="dash-overview-grid">
      <div class="dash-panel">
        <h3 class="dash-panel-title">${e("dash_coach_top_athletes")}</h3>
        <div class="dash-panel-body">
          ${t.length===0?`<p class="dash-empty">${e("dash_coach_no_swimmers")}</p>`:t.slice(0,5).map(a=>`
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
          ${s.length===0?`<p class="dash-empty">${e("dash_coach_no_recent")}</p>`:s.slice(0,5).map(a=>`
            <div class="dash-mini-card">
              <div class="dash-mini-top"><span class="dash-mini-name">${Ee(a)}</span></div>
              <div class="dash-mini-meta">${a.swimmers?a.swimmers.filter(i=>!i.deleted).length:0} swimmer(s)</div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `}function Ne(){const t=$e();return`
    <div class="dash-panel">
      <div class="dash-panel-header" style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h3 class="dash-panel-title">${e("dash_coach_roster_title")} (${t.length} athletes)</h3>
      </div>
      <div class="dash-panel-body">
        ${t.length===0?`<p class="dash-empty">${e("dash_coach_no_swimmers")}</p>`:`
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
            ${t.map(s=>{const n=s.dob?Math.floor((new Date-new Date(s.dob))/315576e5):"—";return`
                <tr style="border-bottom: 1px solid var(--border-color);">
                  <td style="padding: 1rem; font-weight: 500;">${[s.firstName,s.lastName].filter(Boolean).join(" ")}</td>
                  <td style="padding: 1rem;">${s.parentName}</td>
                  <td style="padding: 1rem;">${n}</td>
                  <td style="padding: 1rem;">${s.gender||"—"}</td>
                  <td style="padding: 1rem;">${s.usaSwimmingId||"—"}</td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
        `}
      </div>
    </div>
  `}function je(){const t=J.filter(a=>a.status!=="Completed").length,s=J.filter(a=>a.status==="Completed").length,n=j.filter(a=>a.status!=="Completed").length;return`
    <div class="dash-stats-row">
      <div class="dash-stat-card">
        <div class="dash-stat-number">${J.length}</div>
        <div class="dash-stat-label">${e("dash_swimmer_total_plans")}</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${t}</div>
        <div class="dash-stat-label">${e("dash_swimmer_active_plans")}</div>
      </div>
      <div class="dash-stat-card accent">
        <div class="dash-stat-number">${s}</div>
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
        <div class="dash-panel-body" style="text-align: center; padding: 2rem;">
          <p style="color: var(--text-secondary);">${e("dash_plans_under_construction")}</p>
        </div>
      </div>
      <div class="dash-panel">
        <h3 class="dash-panel-title">${e("dash_swimmer_upcoming_meets_title")}</h3>
        <div class="dash-panel-body">
          ${j.filter(a=>a.status!=="Completed").map(a=>Pe(a)).join("")}
        </div>
      </div>
    </div>

    <div class="dash-panel">
      <h3 class="dash-panel-title">${e("dash_swimmer_today_practice")}</h3>
      <div class="dash-panel-body">
        ${Me()}
      </div>
    </div>
  `}function Pe(t){const s=t.status||"Open",n=t.startDate&&t.endDate?`${t.startDate} – ${t.endDate}`:t.date||"";return`
    <div class="dash-mini-card">
      <div class="dash-mini-top">
        <span class="dash-mini-name">${t.name||"Untitled Meet"}</span>
        <span class="status-badge status-${s.toLowerCase().replace(" ","-")}">${s}</span>
      </div>
      <div class="dash-mini-meta">${n} · ${t.location||""}</div>
    </div>
  `}function Me(){const t=new Date().getDay(),s=L(t),n=G.filter(a=>a.day===s);return n.length===0?`<p class="dash-empty">${e("dash_swimmer_rest_day")} (${s}). Rest day! 🎉</p>`:n.map(a=>`
    <div class="dash-mini-card">
      <div class="dash-mini-top">
        <span class="dash-mini-name">${a.startTime} – ${a.endTime}</span>
      </div>
      <div class="dash-mini-meta">${a.location||""}</div>
    </div>
  `).join("")}function ze(){if(!c)return`<div class="dash-panel" style="text-align: center; padding: 3rem;">
      <p class="dash-empty">${e("dash_profile_no_reg")}</p>
      <p style="margin-top: 1rem;"><a href="/dragonwebsite/registration.html" class="btn btn-primary">${e("dash_profile_complete_reg")}</a></p>
    </div>`;const t=c.parent||{},s=c.spouse,n=c.swimmers||[],a=c.emergencyContact||{};return`
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
              <span class="profile-value">${[t.firstName,t.middleName,t.lastName].filter(Boolean).join(" ")||"—"}</span>
            </div>
            <div class="profile-field">
              <span class="profile-label">${e("dash_profile_gender")}</span>
              <span class="profile-value">${t.gender||"—"}</span>
            </div>
            <div class="profile-field">
              <span class="profile-label">${e("dash_profile_email")}</span>
              <span class="profile-value">${t.email||"—"}</span>
            </div>
            <div class="profile-field">
              <span class="profile-label">${e("dash_profile_phone")}</span>
              <span class="profile-value profile-display" id="display-parent-phone">${t.phone||"—"}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-parent-phone" value="${t.phone||""}" />
            </div>
            <div class="profile-field">
              <span class="profile-label">${e("dash_profile_address")}</span>
              <span class="profile-value profile-display" id="display-parent-address">${t.address||"—"}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-parent-address" value="${t.address||""}" />
            </div>
          </div>
        </div>

        ${s?`
        <div class="dash-panel">
          <h3>${e("dash_profile_spouse_title")}</h3>
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
              <span class="profile-label">${e("dash_profile_phone")}</span>
              <span class="profile-value profile-display" id="display-spouse-phone">${s.phone||"—"}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-spouse-phone" value="${s.phone||""}" />
            </div>
            <div class="profile-field">
              <span class="profile-label">${e("dash_profile_email")}</span>
              <span class="profile-value profile-display" id="display-spouse-email">${s.email||"—"}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-spouse-email" value="${s.email||""}" />
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
          ${n.filter(i=>!i.deleted).length===0?`<p class="dash-empty">${e("dash_profile_no_swimmers")}</p>`:n.map((i,o)=>i.deleted?"":`

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
  `}function Fe(){return`
    <div class="dash-panel" style="text-align: center; padding: 4rem 2rem;">
      <div style="font-size: 3rem; margin-bottom: 1rem;">🚧</div>
      <h2 style="font-size: 1.5rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem;">${e("dash_plans_under_construction")}</h2>
      <p style="color: var(--text-secondary);">${e("dash_swimmer_plans_sub")}</p>
    </div>
  `}function me(){const t=T==="coach";return`
    <div class="dash-section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2 style="font-size: 1.5rem; font-weight: 600; color: var(--text-primary);">${e("dash_meets_upcoming")}</h2>
      ${t?`<button class="btn btn-primary btn-sm" id="add-meet-btn">${e("dash_meets_add")}</button>`:""}
    </div>

    ${t?`
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
      ${j.length===0?`<p class="dash-empty">${e("dash_meets_no_meets")}</p>`:j.map(s=>`
        <div class="dash-card">
          <div class="dash-card-header">
            <h3 class="dash-card-title">${s.name}</h3>
            <span class="status-badge status-${(s.status||"Open").toLowerCase().replace(" ","-")}">${s.status||"Open"}</span>
          </div>
          <div class="dash-card-body">
            <div class="dash-card-meta">
              <span>📅 ${s.startDate&&s.endDate?`${s.startDate} – ${s.endDate}`:s.date||""}</span>
              <span>📍 ${s.location}</span>
            </div>
            <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
              ${!t&&s.status==="Open"?`<button class="btn btn-primary btn-sm dash-register-btn">${e("dash_meets_register")}</button>`:""}
              ${t?`<button class="btn btn-outline btn-sm edit-meet" data-id="${s.id}" data-name="${s.name||""}" data-start="${s.startDate||s.date||""}" data-end="${s.endDate||s.date||""}" data-location="${s.location||""}">${e("dash_meets_edit")}</button>`:""}
              ${t?`<button class="btn btn-outline btn-sm delete-meet" data-id="${s.id}" style="color: var(--color-accent); border-color: var(--color-accent);">${e("dash_meets_delete")}</button>`:""}
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `}function pe(){const t=T==="coach";[0,1,2,3,4,5,6].map(n=>L(n));const s=[1,2,3,4,5,6,0];return`
    <div class="dash-section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2 style="font-size: 1.5rem; font-weight: 600; color: var(--text-primary);">${e("dash_schedule_weekly")}</h2>
      ${t?`<button class="btn btn-primary btn-sm" id="add-session-btn">${e("dash_schedule_add")}</button><button class="btn btn-outline btn-sm" id="import-csv-btn">${e("dash_schedule_import_csv")}</button>`:""}
    </div>

    ${t?`
      <div id="add-session-form" class="dash-panel" style="display: none; margin-bottom: 2rem; padding: 1.5rem;">
        <h3 style="margin-bottom: 1rem;" id="session-form-title">${e("dash_schedule_new_title")}</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem;">
          <select id="session-day" class="form-input">
            ${s.map(n=>`<option value="${L(n)}">${L(n)}</option>`).join("")}
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
      ${s.map(n=>{const a=L(n),i=G.filter(o=>o.day===a);return`
          <div class="dash-schedule-day">
            <h3 class="dash-schedule-day-name">${a}</h3>
            ${i.length===0?`<p class="dash-empty-sm">${e("dash_schedule_no_practice")}</p>`:i.map(o=>`
                <div class="dash-schedule-item">
                  <div class="dash-schedule-time">${o.startTime} – ${o.endTime}</div>
                  <div class="dash-schedule-focus">${o.location||""}</div>
                  <div class="dash-schedule-meta" style="display: flex; justify-content: flex-end; align-items: center; gap: 8px;">
                    ${t?`
                      <button class="edit-session" data-id="${o.id}" data-day="${o.day}" data-start="${o.startTime||""}" data-end="${o.endTime||""}" data-location="${o.location||""}" style="background: none; border: none; font-size: 1rem; cursor: pointer; color: var(--color-primary); padding: 0 5px;" title="Edit">✎</button>
                      <button class="delete-session" data-id="${o.id}" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--color-accent); padding: 0 5px;" title="Delete">&times;</button>
                    `:""}
                  </div>
                </div>
              `).join("")}
          </div>
        `}).join("")}
    </div>
  `}function He(t,s){const n=document.createElement("div");n.className="confirm-overlay",n.innerHTML=`
    <div class="confirm-modal">
      <h3 class="confirm-title">${e("dash_profile_delete_title")}</h3>
      <p class="confirm-body">${e("dash_profile_delete_body1")} <strong style="color: var(--color-accent, #dc3545);">${t}</strong> ${e("dash_profile_delete_body2")}</p>
      <p class="confirm-warning">${e("dash_profile_delete_warning")}</p>
      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="confirm-cancel">${e("dash_profile_delete_cancel")}</button>
        <button class="btn btn-sm" id="confirm-delete" style="background: var(--color-accent, #dc3545); color: white; border: none;">${e("dash_profile_delete_confirm")}</button>
      </div>
    </div>
  `,document.body.appendChild(n),n.querySelector("#confirm-cancel").addEventListener("click",()=>n.remove()),n.querySelector("#confirm-delete").addEventListener("click",async()=>{n.remove();const a=[...c.swimmers];a[s]={...a[s],deleted:!0,deletedAt:new Date().toISOString()};try{await z(x(f,"registrations",R),{swimmers:a}),c.swimmers=a,p="profile",$()}catch(i){console.error("Error marking swimmer deleted:",i),alert(e("dash_profile_save_failed"))}}),n.addEventListener("click",a=>{a.target===n&&n.remove()})}function Re(){const t=document.createElement("div");t.className="confirm-overlay",t.innerHTML=`
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
  `,document.body.appendChild(t);const s=t.querySelector("#modal-password-msg");t.querySelector("#modal-password-cancel").addEventListener("click",()=>t.remove()),t.querySelector("#modal-password-submit").addEventListener("click",async()=>{const n=t.querySelector("#modal-current-password").value,a=t.querySelector("#modal-new-password").value,i=t.querySelector("#modal-confirm-password").value;if(s.style.display="none",!n||!a||!i){s.textContent="All fields are required.",s.style.color="var(--color-accent, #DC2626)",s.style.display="block";return}if(a!==i){s.textContent=e("dash_profile_password_mismatch"),s.style.color="var(--color-accent, #DC2626)",s.style.display="block";return}if(a.length<6){s.textContent="Password must be at least 6 characters.",s.style.color="var(--color-accent, #DC2626)",s.style.display="block";return}try{const o=ve.credential(h.email,n);await _e(h,o),await fe(h,a),s.textContent=e("dash_profile_password_success"),s.style.color="#16A34A",s.style.display="block",t.querySelector("#modal-current-password").value="",t.querySelector("#modal-new-password").value="",t.querySelector("#modal-confirm-password").value=""}catch(o){console.error("Password update error:",o),o.code==="auth/wrong-password"||o.code==="auth/invalid-credential"?s.textContent=e("dash_profile_password_wrong"):s.textContent=e("dash_profile_password_error")+" "+(o.message||""),s.style.color="var(--color-accent, #DC2626)",s.style.display="block"}}),t.addEventListener("click",n=>{n.target===t&&t.remove()})}function he(t){const s=[];let n="",a=!1;for(let i=0;i<t.length;i++){const o=t[i];o==='"'?a=!a:o===","&&!a?(s.push(n.trim()),n=""):n+=o}return s.push(n.trim()),s.length>0&&s[0].charCodeAt(0)===65279&&(s[0]=s[0].slice(1)),s}function Oe(t){const n=t.split(/\r?\n/).filter(o=>o.trim().length>0);if(n.length===0)return{headers:[],rows:[]};const a=he(n[0]),i=n.slice(1).map(o=>he(o));return{headers:a,rows:i}}function Ve(t,s){if(!t||t.length<4)return{valid:!1,reason:e("dash_csv_error_too_few_cols"),rowNum:s};const[n,a,i,o]=t.map(m=>(m||"").trim());if(!n)return{valid:!1,reason:e("dash_csv_error_missing_day"),rowNum:s};const y=n.toLowerCase(),u=[0,1,2,3,4,5,6].find(m=>L(m).toLowerCase()===y);if(u===void 0)return{valid:!1,reason:e("dash_csv_error_invalid_day",{day:n}),rowNum:s};const E=L(u);return a?/^\d{1,2}:\d{2}\s*(AM|PM)?$/i.test(a)?i?/^\d{1,2}:\d{2}\s*(AM|PM)?$/i.test(i)?{valid:!0,day:E,startTime:a,endTime:i,location:o||"",rowNum:s}:{valid:!1,reason:e("dash_csv_error_invalid_time",{field:"EndTime",value:i}),rowNum:s}:{valid:!1,reason:e("dash_csv_error_missing_end"),rowNum:s}:{valid:!1,reason:e("dash_csv_error_invalid_time",{field:"StartTime",value:a}),rowNum:s}:{valid:!1,reason:e("dash_csv_error_missing_start"),rowNum:s}}function B(t,s){const n=document.getElementById("csv-import-status");n&&n.remove();const a=document.createElement("div");a.id="csv-import-status",a.style.cssText=["padding: var(--space-md) var(--space-lg)","border-radius: var(--radius-md)","margin-bottom: var(--space-lg)","font-size: var(--fs-sm)","font-weight: var(--fw-medium)",s?"background: #fef2f2; border: 1px solid #fee2e2; color: #991b1b":"background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534"].join(";"),a.textContent=t;const i=document.querySelector(".dash-content");i&&i.insertBefore(a,i.firstChild),setTimeout(()=>a.remove(),8e3)}async function Ue(t){var P;const s=(P=t.target.files)==null?void 0:P[0];if(t.target.remove(),!s)return;if(!s.name.toLowerCase().endsWith(".csv")){B(e("dash_csv_error_not_csv"),!0);return}if(s.size>5e5){B(e("dash_csv_error_too_large"),!0);return}let n;try{n=await s.text()}catch(I){console.error("Error reading CSV file:",I),B(e("dash_csv_error_unknown"),!0);return}if(!n||n.trim().length===0){B(e("dash_csv_error_empty"),!0);return}const{headers:a,rows:i}=Oe(n),o=["day","starttime","endtime","location"],y=a.map(I=>I.replace(/\s/g,"").toLowerCase());if(!o.every(I=>y.includes(I))||a.length<4){B(e("dash_csv_error_bad_header"),!0);return}const E=[],m=[];i.forEach((I,F)=>{const k=Ve(I,F+2);k.valid?E.push({day:k.day,startTime:k.startTime,endTime:k.endTime,location:k.location||""}):m.push({rowNum:k.rowNum,reason:k.reason})}),We(E,m,s.name)}function We(t,s,n){var E;const a=n.replace(/</g,"&lt;").replace(/>/g,"&gt;"),i=t.length,o=s.length,y=m=>m.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),u=document.createElement("div");u.className="confirm-overlay",u.innerHTML=`
    <div class="confirm-modal csv-import-modal">
      <h3 class="confirm-title">${e("dash_csv_import_title")}</h3>
      <p class="csv-import-filename">${e("dash_csv_import_file")}: <strong>${a}</strong></p>
      <p class="csv-import-summary">${e("dash_csv_import_summary",{valid:String(i),error:String(o)})}</p>
      ${t.length>0?`
        <div class="csv-preview-wrapper">
          <table class="csv-preview-table">
            <thead>
              <tr>
                <th>${e("dash_csv_header_day")}</th>
                <th>${e("dash_csv_header_start")}</th>
                <th>${e("dash_csv_header_end")}</th>
                <th>${e("dash_csv_header_location")}</th>
              </tr>
            </thead>
            <tbody>
              ${t.map(m=>`
                <tr>
                  <td>${y(m.day)}</td>
                  <td>${y(m.startTime)}</td>
                  <td>${y(m.endTime)}</td>
                  <td>${y(m.location||"")}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `:""}
      ${s.length>0?`
        <div class="csv-error-block">
          <p class="csv-error-title">${e("dash_csv_import_errors")}</p>
          ${s.map(m=>`<p class="csv-error-item">${e("dash_csv_import_row")} ${m.rowNum}: ${y(m.reason)}</p>`).join("")}
        </div>
      `:""}
      ${t.length===0?`
        <p class="csv-no-valid">${e("dash_csv_import_no_valid")}</p>
      `:""}
      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="csv-import-cancel">${e("dash_csv_import_cancel")}</button>
        ${t.length>0?`<button class="btn btn-primary btn-sm" id="csv-import-confirm">${e("dash_csv_import_confirm",{count:String(i)})}</button>`:""}
      </div>
    </div>
  `,document.body.appendChild(u),u.querySelector("#csv-import-cancel").addEventListener("click",()=>u.remove()),(E=u.querySelector("#csv-import-confirm"))==null||E.addEventListener("click",async()=>{u.remove(),await Ye(t)}),u.addEventListener("click",m=>{m.target===u&&u.remove()})}async function Ye(t){if(!t||t.length===0)return;const s=document.getElementById("csv-import-status");s&&s.remove();try{const n=Be(f),a=N(f,"schedules");t.forEach(i=>{const o=x(a);n.set(o,{day:i.day,startTime:i.startTime,endTime:i.endTime,location:i.location||"",createdAt:new Date})}),await n.commit(),B(e("dash_csv_import_success",{count:String(t.length)}))}catch(n){console.error("CSV import batch write failed:",n),n.code==="permission-denied"?B(e("dash_csv_error_permission"),!0):n.code==="unavailable"?B(e("dash_csv_error_network"),!0):B(e("dash_csv_error_unknown")+" "+(n.message||""),!0)}}function Ie(){var i,o,y,u,E,m,P,I,F,k,X,Z,ee,te,se,ae;document.querySelectorAll(".dash-nav-item[data-tab]").forEach(d=>{d.addEventListener("click",()=>{p=d.dataset.tab,$()})}),(i=document.getElementById("dash-theme-toggle"))==null||i.addEventListener("click",()=>{ke(),$()});const t=document.getElementById("dash-hamburger"),s=document.getElementById("dash-sidebar");t==null||t.addEventListener("click",()=>{s.classList.toggle("open")}),document.querySelectorAll(".dash-register-btn").forEach(d=>{d.addEventListener("click",()=>{window.location.href="/dragonwebsite/registration.html"})}),(o=document.getElementById("sidebar-signout"))==null||o.addEventListener("click",async()=>{try{await ne(K),window.location.href="/dragonwebsite/signin.html"}catch(d){console.error("Error signing out:",d)}});const n=document.getElementById("user-trigger"),a=document.getElementById("user-dropdown");if(n==null||n.addEventListener("click",d=>{d.stopPropagation(),a.style.display=a.style.display==="none"?"block":"none"}),document.addEventListener("click",()=>{a&&(a.style.display="none")}),(y=document.getElementById("menu-profile"))==null||y.addEventListener("click",()=>{p="profile",a.style.display="none",$()}),(u=document.getElementById("menu-signout"))==null||u.addEventListener("click",async()=>{try{await ne(K),window.location.href="/dragonwebsite/signin.html"}catch(d){console.error("Error signing out:",d)}}),(E=document.getElementById("menu-admin"))==null||E.addEventListener("click",()=>{window.location.href="/dragonwebsite/admin.html"}),(m=document.getElementById("menu-password"))==null||m.addEventListener("click",()=>{a.style.display="none",Re()}),(P=document.getElementById("edit-contact-btn"))==null||P.addEventListener("click",()=>{document.querySelectorAll(".profile-display").forEach(d=>d.style.display="none"),document.querySelectorAll(".profile-edit-field").forEach(d=>d.style.display="block"),document.getElementById("edit-actions").style.display="flex",document.getElementById("edit-contact-btn").style.display="none"}),(I=document.getElementById("cancel-contact-btn"))==null||I.addEventListener("click",()=>{document.querySelectorAll(".profile-display").forEach(d=>d.style.display=""),document.querySelectorAll(".profile-edit-field").forEach(d=>d.style.display="none"),document.getElementById("edit-actions").style.display="none",document.getElementById("edit-contact-btn").style.display=""}),(F=document.getElementById("save-contact-btn"))==null||F.addEventListener("click",async()=>{var v,_,b,l,g,q;const d={"parent.phone":((v=document.getElementById("edit-parent-phone"))==null?void 0:v.value.trim())||"","parent.address":((_=document.getElementById("edit-parent-address"))==null?void 0:_.value.trim())||""};c.spouse&&(d["spouse.phone"]=((b=document.getElementById("edit-spouse-phone"))==null?void 0:b.value.trim())||"",d["spouse.email"]=((l=document.getElementById("edit-spouse-email"))==null?void 0:l.value.trim())||""),d["emergencyContact.name"]=((g=document.getElementById("edit-emergency-name"))==null?void 0:g.value.trim())||"",d["emergencyContact.phone"]=((q=document.getElementById("edit-emergency-phone"))==null?void 0:q.value.trim())||"";try{await z(x(f,"registrations",R),d),c.parent.phone=d["parent.phone"],c.parent.address=d["parent.address"],c.spouse&&(c.spouse.phone=d["spouse.phone"],c.spouse.email=d["spouse.email"]),c.emergencyContact.name=d["emergencyContact.name"],c.emergencyContact.phone=d["emergencyContact.phone"],p="profile",$()}catch(H){console.error("Error updating contact:",H),alert(e("dash_profile_save_failed"))}}),(k=document.getElementById("add-swimmer-toggle-btn"))==null||k.addEventListener("click",()=>{document.getElementById("add-swimmer-form").style.display="block",document.getElementById("add-swimmer-toggle-btn").style.display="none"}),(X=document.getElementById("cancel-swimmer-btn"))==null||X.addEventListener("click",()=>{document.getElementById("add-swimmer-form").style.display="none",document.getElementById("add-swimmer-toggle-btn").style.display=""}),(Z=document.getElementById("save-swimmer-btn"))==null||Z.addEventListener("click",async()=>{const d=document.getElementById("new-swimmer-first").value.trim(),v=document.getElementById("new-swimmer-last").value.trim();if(!d||!v){alert(e("dash_profile_swimmer_required"));return}const _={firstName:d,lastName:v,middleName:document.getElementById("new-swimmer-middle").value.trim()||null,gender:document.getElementById("new-swimmer-gender").value||null,dob:document.getElementById("new-swimmer-dob").value||null,usaSwimmingId:document.getElementById("new-swimmer-usaId").value.trim()||null,joinDate:null},b=[...c.swimmers,_];try{await z(x(f,"registrations",R),{swimmers:b}),c.swimmers=b,p="profile",$()}catch(l){console.error("Error adding swimmer:",l),alert(e("dash_profile_swimmer_add_failed"))}}),document.querySelectorAll(".delete-swimmer-btn").forEach(d=>{d.addEventListener("click",()=>{const v=parseInt(d.dataset.index),_=c.swimmers[v],b=[_.firstName,_.lastName].filter(Boolean).join(" ");He(b,v)})}),(ee=document.getElementById("update-password-btn"))==null||ee.addEventListener("click",async()=>{const d=document.getElementById("password-update-msg"),v=document.getElementById("change-current-password").value,_=document.getElementById("change-new-password").value,b=document.getElementById("change-confirm-password").value;d.style.display="none",d.style.color="";const l=document.getElementById("update-password-btn");if(l&&(l.disabled=!0),!v||!_||!b){d.textContent="All fields are required.",d.style.color="var(--color-accent, #DC2626)",d.style.display="block",l&&(l.disabled=!1);return}if(_!==b){d.textContent=e("dash_profile_password_mismatch"),d.style.color="var(--color-accent, #DC2626)",d.style.display="block",l&&(l.disabled=!1);return}if(_.length<6){d.textContent="Password must be at least 6 characters.",d.style.color="var(--color-accent, #DC2626)",d.style.display="block",l&&(l.disabled=!1);return}try{const g=ve.credential(h.email,v);await _e(h,g),await fe(h,_),d.textContent=e("dash_profile_password_success"),d.style.color="#16A34A",d.style.display="block",document.getElementById("change-current-password").value="",document.getElementById("change-new-password").value="",document.getElementById("change-confirm-password").value=""}catch(g){console.error("Password update error:",g),g.code==="auth/wrong-password"||g.code==="auth/invalid-credential"?d.textContent=e("dash_profile_password_wrong"):d.textContent=e("dash_profile_password_error")+" "+(g.message||""),d.style.color="var(--color-accent, #DC2626)",d.style.display="block"}finally{l&&(l.disabled=!1)}}),T==="coach"){const d=document.getElementById("add-meet-form"),v=document.getElementById("save-meet-btn"),_=document.getElementById("cancel-meet-btn"),b=document.getElementById("meet-form-title");(te=document.getElementById("add-meet-btn"))==null||te.addEventListener("click",()=>{C=null,b.textContent=e("dash_meets_new_title"),v.textContent=e("dash_meets_save"),document.getElementById("meet-name").value="",document.getElementById("meet-start-date").value="",document.getElementById("meet-end-date").value="",document.getElementById("meet-location").value="",d.style.display="block"}),_==null||_.addEventListener("click",()=>{d.style.display="none",C=null}),v==null||v.addEventListener("click",async()=>{const r=document.getElementById("meet-name").value.trim(),w=document.getElementById("meet-start-date").value,A=document.getElementById("meet-end-date").value,M=document.getElementById("meet-location").value.trim();if(!r||!w||!A){alert(e("dash_meets_name_date_required"));return}try{C?await z(x(f,"meets",C),{name:r,startDate:w,endDate:A,location:M}):await de(N(f,"meets"),{name:r,startDate:w,endDate:A,location:M,status:"Open",createdAt:new Date}),d.style.display="none",C=null}catch(V){console.error("Error saving meet:",V)}}),document.querySelectorAll(".edit-meet").forEach(r=>{r.addEventListener("click",()=>{C=r.dataset.id,b.textContent=e("dash_meets_edit_title"),v.textContent=e("dash_meets_update"),document.getElementById("meet-name").value=r.dataset.name,document.getElementById("meet-start-date").value=r.dataset.start,document.getElementById("meet-end-date").value=r.dataset.end,document.getElementById("meet-location").value=r.dataset.location,d.style.display="block",d.scrollIntoView({behavior:"smooth"})})}),document.querySelectorAll(".delete-meet").forEach(r=>{r.addEventListener("click",async()=>{if(confirm(e("dash_meets_confirm_delete")))try{await ie(x(f,"meets",r.dataset.id)),C===r.dataset.id&&(d.style.display="none",C=null)}catch(w){console.error("Error deleting meet:",w)}})});const l=document.getElementById("add-session-form"),g=document.getElementById("save-session-btn"),q=document.getElementById("cancel-session-btn"),H=document.getElementById("session-form-title");(se=document.getElementById("add-session-btn"))==null||se.addEventListener("click",()=>{D=null,H.textContent=e("dash_schedule_new_title"),g.textContent=e("dash_schedule_save"),document.getElementById("session-day").value=L(1),document.getElementById("session-start-time").value="",document.getElementById("session-end-time").value="",document.getElementById("session-location").value="",l.style.display="block"}),q==null||q.addEventListener("click",()=>{l.style.display="none",D=null}),g==null||g.addEventListener("click",async()=>{const r=document.getElementById("session-day").value,w=document.getElementById("session-start-time").value.trim(),A=document.getElementById("session-end-time").value.trim(),M=document.getElementById("session-location").value.trim();if(!r||!w||!A){alert(e("dash_schedule_required_fields"));return}try{D?await z(x(f,"schedules",D),{day:r,startTime:w,endTime:A,location:M}):await de(N(f,"schedules"),{day:r,startTime:w,endTime:A,location:M,createdAt:new Date}),l.style.display="none",D=null}catch(V){console.error("Error saving session:",V)}}),document.querySelectorAll(".edit-session").forEach(r=>{r.addEventListener("click",()=>{D=r.dataset.id,H.textContent=e("dash_schedule_edit_title"),g.textContent=e("dash_schedule_update"),document.getElementById("session-day").value=r.dataset.day,document.getElementById("session-start-time").value=r.dataset.start,document.getElementById("session-end-time").value=r.dataset.end,document.getElementById("session-location").value=r.dataset.location,l.style.display="block",l.scrollIntoView({behavior:"smooth"})})}),document.querySelectorAll(".delete-session").forEach(r=>{r.addEventListener("click",async()=>{if(confirm(e("dash_schedule_delete_confirm")))try{await ie(x(f,"schedules",r.dataset.id)),D===r.dataset.id&&(l.style.display="none",D=null)}catch(w){console.error("Error deleting session:",w)}})}),(ae=document.getElementById("import-csv-btn"))==null||ae.addEventListener("click",()=>{const r=document.createElement("input");r.type="file",r.accept=".csv",r.addEventListener("change",Ue),r.click()})}}Ce();
