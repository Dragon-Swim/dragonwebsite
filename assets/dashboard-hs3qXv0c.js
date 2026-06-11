import{i as q,t as e,a as fe}from"./i18n-Do8R_3uV.js";import{a as C}from"./csv-C9YWrFDk.js";import{g as b,e as p,h as P,u as D,o as ye,b as T,q as N,k as A,c as I,j,n as ae,a as te,f as de}from"./firebase-B6pM3H1n.js";q();const $=[{id:1,name:"Endurance Base Building",season:"Winter 2026",daysPerWeek:4,priority:"High",progress:72,tasks:"18 / 25 workouts completed",due:"Feb 28, 2026",status:"In Progress"},{id:2,name:"Sprint Technique Focus",season:"Spring 2026",daysPerWeek:3,priority:"Medium",progress:45,tasks:"9 / 20 workouts completed",due:"Mar 15, 2026",status:"In Progress"},{id:3,name:"Stroke Refinement (Butterfly)",season:"Summer 2026",daysPerWeek:5,priority:"Low",progress:0,tasks:"0 / 12 workouts completed",due:"Apr 30, 2026",status:"Not Started"},{id:4,name:"Fall Conditioning",season:"Fall 2025",daysPerWeek:3,priority:"High",progress:100,tasks:"30 / 30 workouts completed",due:"Nov 20, 2025",status:"Completed"}];let y=[],M=[],w=null,_="swimmer",g=null,r=null,S=null,L=[],c="overview",ne=!1;function we(){const s=document.getElementById("app");s.innerHTML=`
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; gap: 20px; font-family: sans-serif;">
      <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #f5c518; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <p style="color: #666;">${e("dash_loading")}</p>
      <style>
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    </div>
  `,console.log("Dashboard: Initializing auth listener...");const t=setTimeout(()=>{console.warn("Dashboard: Auth listener timed out — redirecting to signin"),window.location.href="/dragonwebsite/signin.html"},5e3);ye(T,async d=>{if(clearTimeout(t),!d){console.log("Dashboard: No user authenticated, redirecting to signin..."),window.location.href="/dragonwebsite/signin.html";return}w=d,console.log("Dashboard: User authenticated:",d.email);try{console.log("Dashboard: Fetching user document...");const a=await P(b(p,"users",d.uid));g=a.exists()?a.data().role:null;const i=d.email&&d.email.toLowerCase()==="dragonswim@outlook.com";_=g==="coach"||g==="admin"||i?"coach":g||"swimmer",console.log("Dashboard: Detected role:",_),ne?(console.log("Dashboard: Refreshing UI..."),u()):(console.log("Dashboard: Initializing data listeners..."),$e(),ne=!0,u())}catch(a){console.error("Dashboard Critical Error:",a),s.innerHTML=`
        <div style="padding: 40px; text-align: center; font-family: sans-serif; max-width: 500px; margin: 100px auto; border: 1px solid #fee2e2; background: #fef2f2; border-radius: 12px; color: #991b1b;">
          <h2 style="margin-bottom: 16px;">${e("dash_load_failed_title")}</h2>
          <p style="margin-bottom: 24px;">${e("dash_load_failed_msg")}</p>
          <code style="display: block; padding: 12px; background: #fee2e2; border-radius: 6px; font-size: 13px; text-align: left; overflow-x: auto; margin-bottom: 24px;">
            ${a.message||e("dash_unknown_error")}
          </code>
          <button onclick="window.location.reload()" style="padding: 10px 20px; background: #991b1b; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">${e("dash_load_failed_retry")}</button>
        </div>
      `,_="swimmer"}})}function $e(){const s=N(I(p,"meets"),A("createdAt","desc"));j(s,d=>{y=d.docs.map(a=>({id:a.id,...a.data()})),u()},d=>{console.error("Error listening to meets:",d)});const t=N(I(p,"schedules"),A("createdAt","asc"));if(j(t,d=>{M=d.docs.map(a=>({id:a.id,...a.data()})),u()},d=>{console.error("Error listening to schedules:",d)}),me(),_==="coach"){const d=N(I(p,"registrations"),A("createdAt","desc"));j(d,a=>{L=a.docs.map(i=>({id:i.id,...i.data()})),u()},a=>{console.error("Error listening to registrations:",a)})}}async function me(){if(!w)return;const s=b(p,"registrations",w.uid),t=await P(s);t.exists()&&(S=t.id,r=t.data())}function u(){w&&me().then(()=>{ie()}).catch(s=>{console.error("Error fetching family data:",s),ie()})}function ie(){_==="coach"?Be(w):Ie(w)}const Ee=["dash_day_sunday","dash_day_monday","dash_day_tuesday","dash_day_wednesday","dash_day_thursday","dash_day_friday","dash_day_saturday"];function E(s){return e(Ee[s]||"dash_day_monday")}function Ie(s){const t=document.getElementById("app");t.innerHTML=`
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
            <button class="dash-nav-item ${c==="overview"?"active":""}" data-tab="overview">
              <span class="dash-nav-icon">📊</span> ${e("dash_swimmer_overview_label")}
            </button>
            <button class="dash-nav-item ${c==="profile"?"active":""}" data-tab="profile">
              <span class="dash-nav-icon">👤</span> ${e("dash_swimmer_profile_label")}
            </button>
            <button class="dash-nav-item ${c==="plans"?"active":""}" data-tab="plans">
              <span class="dash-nav-icon">📋</span> ${e("dash_swimmer_plans_label")}
            </button>
            <button class="dash-nav-item ${c==="meets"?"active":""}" data-tab="meets">
              <span class="dash-nav-icon">🏆</span> ${e("dash_swimmer_meets_label")}
            </button>
            <button class="dash-nav-item ${c==="schedule"?"active":""}" data-tab="schedule">
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
              <h1 class="dash-page-title">${pe(c)}</h1>
              <p class="dash-page-subtitle">${ke(c)}</p>
            </div>
          </div>
          <div class="dash-topbar-right">
            <div class="dash-user-menu" id="user-menu">
              <button class="dash-user-trigger" id="user-trigger">
                <div class="dash-avatar">${(oe()||s.email||e("dash_swimmer_username_fallback")).charAt(0).toUpperCase()}</div>
                <span class="dash-user-name">${oe()||s.email||e("dash_swimmer_username_fallback")}</span>
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
          ${he(c,"swimmer")}
        </div>
      </main>
    </div>
  `,be(),q(),ue()}function Be(s){const t=document.getElementById("app");t.innerHTML=`
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
            <button class="dash-nav-item ${c==="overview"?"active":""}" data-tab="overview">
              <span class="dash-nav-icon">🏠</span> ${e("dash_coach_overview_label")}
            </button>
            <button class="dash-nav-item ${c==="roster"?"active":""}" data-tab="roster">
              <span class="dash-nav-icon">👥</span> ${e("dash_coach_roster_label")}
            </button>
            <button class="dash-nav-item ${c==="meets"?"active":""}" data-tab="meets">
              <span class="dash-nav-icon">🏁</span> ${e("dash_coach_meets_label")}
            </button>
            <button class="dash-nav-item ${c==="schedule"?"active":""}" data-tab="schedule">
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
              <h1 class="dash-page-title">Coach: ${pe(c,"coach")}</h1>
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
          ${he(c,"coach")}
        </div>
      </main>
    </div>
  `,be(),q(),ue()}function oe(){if(!r||!r.parent)return null;const s=r.parent;return[s.firstName,s.lastName].filter(Boolean).join(" ")||null}function pe(s,t="swimmer"){return t==="coach"?{overview:e("dash_coach_tab_overview"),roster:e("dash_coach_tab_roster"),meets:e("dash_coach_tab_meets"),schedule:e("dash_coach_tab_schedule")}[s]||e("dash_coach_tab_overview"):{overview:e("dash_swimmer_tab_overview"),profile:e("dash_swimmer_tab_profile"),plans:e("dash_swimmer_tab_plans"),meets:e("dash_swimmer_tab_meets"),schedule:e("dash_swimmer_tab_schedule")}[s]||e("dash_swimmer_tab_overview")}function ke(s){return{overview:e("dash_swimmer_overview_sub"),profile:e("dash_swimmer_profile_sub"),plans:e("dash_swimmer_plans_sub"),meets:e("dash_swimmer_meets_sub"),schedule:e("dash_swimmer_schedule_sub")}[s]||""}function he(s,t="swimmer"){if(t==="coach")switch(s){case"overview":return le();case"roster":return Se();case"meets":return re();case"schedule":return ce();default:return le()}switch(s){case"overview":return Le();case"profile":return je();case"plans":return Te();case"meets":return re();case"schedule":return ce();default:return""}}function ue(){const s=document.getElementById("sidebar-theme-icon");if(s){const t=document.documentElement.getAttribute("data-theme")==="dark";s.textContent=t?"☀️":"🌙"}}function B(){const s=[];for(const t of L)if(t.swimmers)for(let d=0;d<t.swimmers.length;d++){const a=t.swimmers[d];a.deleted||s.push({...a,parentName:ge(t),regId:t.id,swimmerIndex:d})}return s}function ve(s){return`<span class="swimmer-status-badge ${s==="active"?"swimmer-status-active":s==="inactive"?"swimmer-status-inactive":"swimmer-status-pending"}">${e(`dash_status_${s}`)}</span>`}async function xe(s,t,d){try{const a=b(p,"registrations",s),i=await P(a);if(!i.exists())return;const o=[...i.data().swimmers];o[t]&&(o[t]={...o[t],status:d},await D(a,{swimmers:o}))}catch(a){console.error("Failed to update swimmer status:",a)}}function ge(s){return s.parent&&[s.parent.firstName,s.parent.lastName].filter(Boolean).join(" ")||"—"}function De(){const s=new Date;return s.setDate(s.getDate()-30),L.filter(t=>{var a,i;return(((i=(a=t.createdAt)==null?void 0:a.toDate)==null?void 0:i.call(a))||new Date(t.createdAt))>=s})}function le(){const s=B(),t=s.filter(i=>i.status==="active").length,d=De(),a=y.filter(i=>i.status!=="Completed");return`
    <div class="dash-stats-row">
      <div class="dash-stat-card">
        <div class="dash-stat-number">${t}</div>
        <div class="dash-stat-label">${e("dash_coach_active_athletes")}</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${d.length}</div>
        <div class="dash-stat-label">${e("dash_coach_new_registrations")}</div>
      </div>
      <div class="dash-stat-card accent">
        <div class="dash-stat-number">${a.length}</div>
        <div class="dash-stat-label">${e("dash_coach_upcoming_meets")}</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${L.length}</div>
        <div class="dash-stat-label">${e("dash_coach_registered_families")}</div>
      </div>
    </div>

    <div class="dash-overview-grid">
      <div class="dash-panel">
        <h3 class="dash-panel-title">${e("dash_coach_top_athletes")}</h3>
        <div class="dash-panel-body">
          ${s.length===0?`<p class="dash-empty">${e("dash_coach_no_swimmers")}</p>`:s.slice(0,5).map(i=>`
            <div class="dash-mini-card">
               <div class="dash-mini-top">
                <span class="dash-mini-name">${[i.firstName,i.lastName].filter(Boolean).join(" ")}</span>
                <span class="badge badge-primary">${i.parentName}</span>
              </div>
              <div class="dash-mini-meta">${i.gender||"—"} · Age: ${i.dob?Math.floor((new Date-new Date(i.dob))/(365.25*24*60*60*1e3)):"—"}</div>
            </div>
          `).join("")}
        </div>
      </div>
      <div class="dash-panel">
        <h3 class="dash-panel-title">${e("dash_coach_recent_registrations")}</h3>
        <div class="dash-panel-body">
          ${d.length===0?`<p class="dash-empty">${e("dash_coach_no_recent")}</p>`:d.slice(0,5).map(i=>`
            <div class="dash-mini-card">
              <div class="dash-mini-top"><span class="dash-mini-name">${ge(i)}</span></div>
              <div class="dash-mini-meta">${i.swimmers?i.swimmers.filter(o=>!o.deleted).length:0} swimmer(s)</div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `}function Se(){const s=g==="admin",t=B(),d=s?`<div style="display:flex; gap:0.5rem;">
         <button class="btn btn-outline btn-sm" id="download-active-btn" ${t.length===0?"disabled":""}>📥 Active</button>
         <button class="btn btn-outline btn-sm" id="download-all-btn">📥 All</button>
       </div>`:`<button class="btn btn-outline btn-sm" id="download-roster-btn" ${t.length===0?"disabled":""}>${e("dash_coach_download_csv")}</button>`;return`
    <div class="dash-panel">
      <div class="dash-panel-header" style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h3 class="dash-panel-title">${e("dash_coach_roster_title")} (${t.length} athletes)</h3>
        ${d}
      </div>
      <div class="dash-panel-body">
        ${t.length===0?`<p class="dash-empty">${e("dash_coach_no_swimmers")}</p>`:`
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
              <th style="padding: 1rem;">${e("dash_coach_roster_name")}</th>
              <th style="padding: 1rem;">${e("dash_coach_roster_parent")}</th>
              <th style="padding: 1rem;">${e("dash_coach_roster_age")}</th>
              <th style="padding: 1rem;">DOB</th>
              <th style="padding: 1rem;">${e("dash_coach_roster_gender")}</th>
              <th style="padding: 1rem;">${e("dash_coach_roster_usa_id")}</th>
              <th style="padding: 1rem;">${e("dash_coach_roster_status")}</th>
            </tr>
          </thead>
          <tbody>
            ${t.map(a=>{const i=a.dob?Math.floor((new Date-new Date(a.dob))/315576e5):"—",o=a.status||"pending",f=k=>o===k?"selected":"";return`
                <tr style="border-bottom: 1px solid var(--border-color);">
                  <td style="padding: 1rem; font-weight: 500;">${[a.firstName,a.lastName].filter(Boolean).join(" ")}</td>
                  <td style="padding: 1rem;">${a.parentName}</td>
                  <td style="padding: 1rem;">${i}</td>
                  <td style="padding: 1rem;">${a.dob||"—"}</td>
                  <td style="padding: 1rem;">${a.gender||"—"}</td>
                  <td style="padding: 1rem;">${a.usaSwimmingId||"—"}</td>
                  <td style="padding: 1rem;">
                    ${s?`
                    <select class="roster-status-select" data-reg="${a.regId}" data-idx="${a.swimmerIndex}" data-prev="${o}">
                      <option value="pending" ${f("pending")}>🟡 ${e("dash_status_pending")}</option>
                      <option value="active" ${f("active")}>🟢 ${e("dash_status_active")}</option>
                      <option value="inactive" ${f("inactive")}>⚫ ${e("dash_status_inactive")}</option>
                    </select>`:ve(o)}
                  </td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
        `}
      </div>
    </div>
  `}function Le(){const s=$.filter(a=>a.status!=="Completed").length,t=$.filter(a=>a.status==="Completed").length,d=y.filter(a=>a.status!=="Completed").length;return`
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
          ${$.filter(a=>a.status!=="Completed").map(a=>Ce(a)).join("")}
        </div>
      </div>
      <div class="dash-panel">
        <h3 class="dash-panel-title">${e("dash_swimmer_upcoming_meets_title")}</h3>
        <div class="dash-panel-body">
          ${y.filter(a=>a.status!=="Completed").map(a=>Ne(a)).join("")}
        </div>
      </div>
    </div>

    <div class="dash-panel">
      <h3 class="dash-panel-title">${e("dash_swimmer_today_practice")}</h3>
      <div class="dash-panel-body">
        ${Ae()}
      </div>
    </div>
  `}function Ce(s){return`
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
  `}function Ne(s){const t=s.status||"Open";return`
    <div class="dash-mini-card">
      <div class="dash-mini-top">
        <span class="dash-mini-name">${s.name||"Untitled Meet"}</span>
        <span class="status-badge status-${t.toLowerCase().replace(" ","-")}">${t}</span>
      </div>
      <div class="dash-mini-meta">${s.date||""} · ${s.location||""}</div>
    </div>
  `}function Ae(){const s=new Date().getDay(),t=E(s),d=M.filter(a=>a.day===t);return d.length===0?`<p class="dash-empty">${e("dash_swimmer_rest_day")} (${t}). Rest day! 🎉</p>`:d.map(a=>`
    <div class="dash-mini-card">
      <div class="dash-mini-top">
        <span class="dash-mini-name">${a.focus}</span>
        <span class="group-badge">${a.group}</span>
      </div>
      <div class="dash-mini-meta">${a.time} · ${a.coach}</div>
    </div>
  `).join("")}function je(){if(!r)return`<div class="dash-panel" style="text-align: center; padding: 3rem;">
      <p class="dash-empty">${e("dash_profile_no_reg")}</p>
      <p style="margin-top: 1rem;"><a href="/dragonwebsite/registration.html" class="btn btn-primary">${e("dash_profile_complete_reg")}</a></p>
    </div>`;const s=r.parent||{},t=r.spouse,d=r.swimmers||[],a=r.emergencyContact||{};return`
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
          ${d.filter(i=>!i.deleted).length===0?`<p class="dash-empty">${e("dash_profile_no_swimmers")}</p>`:d.map((i,o)=>i.deleted?"":`

            <div class="swimmer-profile-card">
              <div class="swimmer-profile-info">
                <strong>${[i.firstName,i.middleName,i.lastName].filter(Boolean).join(" ")} ${ve(i.status||"pending")}</strong>
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
  `}function Te(){return`
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
  `}function re(){const s=_==="coach";return`
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
      ${y.length===0?`<p class="dash-empty">${e("dash_meets_no_meets")}</p>`:y.map(t=>`
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
  `}function ce(){const s=_==="coach";[0,1,2,3,4,5,6].map(d=>E(d));const t=[1,2,3,4,5,6,0];return`
    <div class="dash-section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2 style="font-size: 1.5rem; font-weight: 600; color: var(--text-primary);">${e("dash_schedule_weekly")}</h2>
      ${s?`<button class="btn btn-primary btn-sm" id="add-session-btn">${e("dash_schedule_add")}</button>`:""}
    </div>

    ${s?`
      <div id="add-session-form" class="dash-panel" style="display: none; margin-bottom: 2rem; padding: 1.5rem;">
        <h3 style="margin-bottom: 1rem;">${e("dash_schedule_new_title")}</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem;">
          <select id="session-day" class="form-input">
            ${t.map(d=>`<option value="${E(d)}">${E(d)}</option>`).join("")}
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
      ${t.map(d=>{const a=E(d),i=M.filter(o=>o.day===a);return`
          <div class="dash-schedule-day">
            <h3 class="dash-schedule-day-name">${a}</h3>
            ${i.length===0?`<p class="dash-empty-sm">${e("dash_schedule_no_practice")}</p>`:i.map(o=>`
                <div class="dash-schedule-item">
                  <div class="dash-schedule-time">${o.time}</div>
                  <div class="dash-schedule-focus">${o.focus}</div>
                  <div class="dash-schedule-meta" style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <span class="group-badge">${o.group}</span>
                      <span>${o.coach}</span>
                    </div>
                    ${s?`<button class="delete-session" data-id="${o.id}" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--color-accent); padding: 0 5px;">&times;</button>`:""}
                  </div>
                </div>
              `).join("")}
          </div>
        `}).join("")}
    </div>
  `}function qe(s,t){const d=document.createElement("div");d.className="confirm-overlay",d.innerHTML=`
    <div class="confirm-modal">
      <h3 class="confirm-title">${e("dash_profile_delete_title")}</h3>
      <p class="confirm-body">${e("dash_profile_delete_body1")} <strong style="color: var(--color-accent, #dc3545);">${s}</strong> ${e("dash_profile_delete_body2")}</p>
      <p class="confirm-warning">${e("dash_profile_delete_warning")}</p>
      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="confirm-cancel">${e("dash_profile_delete_cancel")}</button>
        <button class="btn btn-sm" id="confirm-delete" style="background: var(--color-accent, #dc3545); color: white; border: none;">${e("dash_profile_delete_confirm")}</button>
      </div>
    </div>
  `,document.body.appendChild(d),d.querySelector("#confirm-cancel").addEventListener("click",()=>d.remove()),d.querySelector("#confirm-delete").addEventListener("click",async()=>{d.remove();const a=[...r.swimmers];a[t]={...a[t],deleted:!0,deletedAt:new Date().toISOString()};try{await D(b(p,"registrations",S),{swimmers:a}),r.swimmers=a,c="profile",u()}catch(i){console.error("Error marking swimmer deleted:",i),alert(e("dash_profile_save_failed"))}}),d.addEventListener("click",a=>{a.target===d&&d.remove()})}function be(){var i,o,f,k,O,R,F,U,z,H,W,V,Y,J,K,G,Q,X,Z,ee;document.querySelectorAll(".dash-nav-item[data-tab]").forEach(n=>{n.addEventListener("click",()=>{c=n.dataset.tab,u()})}),(i=document.getElementById("dash-theme-toggle"))==null||i.addEventListener("click",()=>{fe(),u()});const s=document.getElementById("dash-hamburger"),t=document.getElementById("dash-sidebar");s==null||s.addEventListener("click",()=>{t.classList.toggle("open")}),document.querySelectorAll(".dash-register-btn").forEach(n=>{n.addEventListener("click",()=>{window.location.href="/dragonwebsite/registration.html"})}),(o=document.getElementById("sidebar-signout"))==null||o.addEventListener("click",async()=>{try{await ae(T),window.location.href="/dragonwebsite/signin.html"}catch(n){console.error("Error signing out:",n)}});const d=document.getElementById("user-trigger"),a=document.getElementById("user-dropdown");d==null||d.addEventListener("click",n=>{n.stopPropagation(),a.style.display=a.style.display==="none"?"block":"none"}),document.addEventListener("click",()=>{a&&(a.style.display="none")}),(f=document.getElementById("menu-profile"))==null||f.addEventListener("click",()=>{c="profile",a.style.display="none",u()}),(k=document.getElementById("menu-signout"))==null||k.addEventListener("click",async()=>{try{await ae(T),window.location.href="/dragonwebsite/signin.html"}catch(n){console.error("Error signing out:",n)}}),(O=document.getElementById("menu-admin"))==null||O.addEventListener("click",()=>{window.location.href="/dragonwebsite/admin.html"}),(R=document.getElementById("edit-contact-btn"))==null||R.addEventListener("click",()=>{document.querySelectorAll(".profile-display").forEach(n=>n.style.display="none"),document.querySelectorAll(".profile-edit-field").forEach(n=>n.style.display="block"),document.getElementById("edit-actions").style.display="flex",document.getElementById("edit-contact-btn").style.display="none"}),(F=document.getElementById("cancel-contact-btn"))==null||F.addEventListener("click",()=>{document.querySelectorAll(".profile-display").forEach(n=>n.style.display=""),document.querySelectorAll(".profile-edit-field").forEach(n=>n.style.display="none"),document.getElementById("edit-actions").style.display="none",document.getElementById("edit-contact-btn").style.display=""}),(U=document.getElementById("save-contact-btn"))==null||U.addEventListener("click",async()=>{var l,m,h,v,x,se;const n={"parent.phone":((l=document.getElementById("edit-parent-phone"))==null?void 0:l.value.trim())||"","parent.address":((m=document.getElementById("edit-parent-address"))==null?void 0:m.value.trim())||""};r.spouse&&(n["spouse.phone"]=((h=document.getElementById("edit-spouse-phone"))==null?void 0:h.value.trim())||"",n["spouse.email"]=((v=document.getElementById("edit-spouse-email"))==null?void 0:v.value.trim())||""),n["emergencyContact.name"]=((x=document.getElementById("edit-emergency-name"))==null?void 0:x.value.trim())||"",n["emergencyContact.phone"]=((se=document.getElementById("edit-emergency-phone"))==null?void 0:se.value.trim())||"";try{await D(b(p,"registrations",S),n),r.parent.phone=n["parent.phone"],r.parent.address=n["parent.address"],r.spouse&&(r.spouse.phone=n["spouse.phone"],r.spouse.email=n["spouse.email"]),r.emergencyContact.name=n["emergencyContact.name"],r.emergencyContact.phone=n["emergencyContact.phone"],c="profile",u()}catch(_e){console.error("Error updating contact:",_e),alert(e("dash_profile_save_failed"))}}),(z=document.getElementById("add-swimmer-toggle-btn"))==null||z.addEventListener("click",()=>{document.getElementById("add-swimmer-form").style.display="block",document.getElementById("add-swimmer-toggle-btn").style.display="none"}),(H=document.getElementById("cancel-swimmer-btn"))==null||H.addEventListener("click",()=>{document.getElementById("add-swimmer-form").style.display="none",document.getElementById("add-swimmer-toggle-btn").style.display=""}),(W=document.getElementById("save-swimmer-btn"))==null||W.addEventListener("click",async()=>{const n=document.getElementById("new-swimmer-first").value.trim(),l=document.getElementById("new-swimmer-last").value.trim();if(!n||!l){alert(e("dash_profile_swimmer_required"));return}const m={firstName:n,lastName:l,middleName:document.getElementById("new-swimmer-middle").value.trim()||null,gender:document.getElementById("new-swimmer-gender").value||null,dob:document.getElementById("new-swimmer-dob").value||null,usaSwimmingId:document.getElementById("new-swimmer-usaId").value.trim()||null,joinDate:null},h=[...r.swimmers,m];try{await D(b(p,"registrations",S),{swimmers:h}),r.swimmers=h,c="profile",u()}catch(v){console.error("Error adding swimmer:",v),alert(e("dash_profile_swimmer_add_failed"))}}),document.querySelectorAll(".delete-swimmer-btn").forEach(n=>{n.addEventListener("click",()=>{const l=parseInt(n.dataset.index),m=r.swimmers[l],h=[m.firstName,m.lastName].filter(Boolean).join(" ");qe(h,l)})}),_==="coach"&&((V=document.getElementById("add-meet-btn"))==null||V.addEventListener("click",()=>{document.getElementById("add-meet-form").style.display="block"}),(Y=document.getElementById("cancel-meet-btn"))==null||Y.addEventListener("click",()=>{document.getElementById("add-meet-form").style.display="none"}),(J=document.getElementById("save-meet-btn"))==null||J.addEventListener("click",async()=>{const n=document.getElementById("meet-name").value,l=document.getElementById("meet-date").value,m=document.getElementById("meet-location").value,h=document.getElementById("meet-events").value;if(!n||!l){alert(e("dash_meets_name_date_required"));return}try{await te(I(p,"meets"),{name:n,date:l,location:m,events:h.split(",").map(v=>v.trim()),status:"Open",createdAt:new Date}),document.getElementById("add-meet-form").style.display="none"}catch(v){console.error("Error adding meet:",v)}}),document.querySelectorAll(".delete-meet").forEach(n=>{n.addEventListener("click",async()=>{if(confirm(e("dash_meets_confirm_delete")))try{await de(b(p,"meets",n.dataset.id))}catch(l){console.error("Error deleting meet:",l)}})}),(K=document.getElementById("add-session-btn"))==null||K.addEventListener("click",()=>{document.getElementById("add-session-form").style.display="block"}),(G=document.getElementById("cancel-session-btn"))==null||G.addEventListener("click",()=>{document.getElementById("add-session-form").style.display="none"}),(Q=document.getElementById("save-session-btn"))==null||Q.addEventListener("click",async()=>{const n=document.getElementById("session-day").value,l=document.getElementById("session-time").value,m=document.getElementById("session-group").value,h=document.getElementById("session-focus").value,v=document.getElementById("session-coach").value;if(!l||!m){alert(e("dash_schedule_time_group_required"));return}try{await te(I(p,"schedules"),{day:n,time:l,group:m,focus:h,coach:v,createdAt:new Date}),document.getElementById("add-session-form").style.display="none"}catch(x){console.error("Error adding session:",x)}}),document.querySelectorAll(".delete-session").forEach(n=>{n.addEventListener("click",async()=>{if(confirm(e("dash_schedule_delete_confirm")))try{await de(b(p,"schedules",n.dataset.id))}catch(l){console.error("Error deleting session:",l)}})})),(X=document.getElementById("download-roster-btn"))==null||X.addEventListener("click",()=>{const n=new Date().toISOString().slice(0,10),l=B().filter(m=>m.status==="active");C(l,`dragon-roster-active-${n}.csv`)}),(Z=document.getElementById("download-active-btn"))==null||Z.addEventListener("click",()=>{const n=new Date().toISOString().slice(0,10),l=B().filter(m=>m.status==="active");C(l,`dragon-roster-active-${n}.csv`)}),(ee=document.getElementById("download-all-btn"))==null||ee.addEventListener("click",()=>{const n=new Date().toISOString().slice(0,10);C(B(),`dragon-roster-all-${n}.csv`)})}document.addEventListener("change",s=>{const t=s.target.closest(".roster-status-select");if(!t)return;const d=t.dataset.reg,a=parseInt(t.dataset.idx,10),i=t.value,o=t.dataset.prev;i!==o&&xe(d,a,i)});we();
