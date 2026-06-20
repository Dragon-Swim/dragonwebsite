import{i as G,t as e,a as xe}from"./i18n-BhFBt9DX.js";import{o as ke,h as O,g as I,e as v,b as Q,q as W,k as Y,c as j,j as J,u as P,p as ne,E as ve,r as _e,t as fe,a as ie,f as re,w as Be}from"./firebase-DKR4RDCB.js";G();const K=[{id:1,name:"Endurance Base Building",season:"Winter 2026",daysPerWeek:4,priority:"High",progress:72,tasks:"18 / 25 workouts completed",due:"Feb 28, 2026",status:"In Progress"},{id:2,name:"Sprint Technique Focus",season:"Spring 2026",daysPerWeek:3,priority:"Medium",progress:45,tasks:"9 / 20 workouts completed",due:"Mar 15, 2026",status:"In Progress"},{id:3,name:"Stroke Refinement (Butterfly)",season:"Summer 2026",daysPerWeek:5,priority:"Low",progress:0,tasks:"0 / 12 workouts completed",due:"Apr 30, 2026",status:"Not Started"},{id:4,name:"Fall Conditioning",season:"Fall 2025",daysPerWeek:3,priority:"High",progress:100,tasks:"30 / 30 workouts completed",due:"Nov 20, 2025",status:"Completed"}];let M=[],S=null,X=[],L=null,_=null,A="swimmer",C=null,p=null,V=null,z=[],u="overview",oe=!1;function Ce(){const t=document.getElementById("app");t.innerHTML=`
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; gap: 20px; font-family: sans-serif;">
      <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #f5c518; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <p style="color: #666;">${e("dash_loading")}</p>
      <style>
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    </div>
  `,console.log("Dashboard: Initializing auth listener...");const s=setTimeout(()=>{console.warn("Dashboard: Auth listener timed out — redirecting to signin"),window.location.href="/dragonwebsite/signin.html"},5e3);ke(Q,async d=>{if(clearTimeout(s),!d){console.log("Dashboard: No user authenticated, redirecting to signin..."),window.location.href="/dragonwebsite/signin.html";return}_=d,console.log("Dashboard: User authenticated:",d.email);try{console.log("Dashboard: Fetching user document...");const a=await O(I(v,"users",d.uid));C=a.exists()?a.data().role:null;const n=d.email&&d.email.toLowerCase()==="dragonswim@outlook.com";A=C==="coach"||C==="admin"||n?"coach":C||"swimmer",console.log("Dashboard: Detected role:",A),oe?(console.log("Dashboard: Refreshing UI..."),E()):(console.log("Dashboard: Initializing data listeners..."),De(),oe=!0,E())}catch(a){console.error("Dashboard Critical Error:",a),t.innerHTML=`
        <div style="padding: 40px; text-align: center; font-family: sans-serif; max-width: 500px; margin: 100px auto; border: 1px solid #fee2e2; background: #fef2f2; border-radius: 12px; color: #991b1b;">
          <h2 style="margin-bottom: 16px;">${e("dash_load_failed_title")}</h2>
          <p style="margin-bottom: 24px;">${e("dash_load_failed_msg")}</p>
          <code style="display: block; padding: 12px; background: #fee2e2; border-radius: 6px; font-size: 13px; text-align: left; overflow-x: auto; margin-bottom: 24px;">
            ${a.message||e("dash_unknown_error")}
          </code>
          <button onclick="window.location.reload()" style="padding: 10px 20px; background: #991b1b; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">${e("dash_load_failed_retry")}</button>
        </div>
      `,A="swimmer"}})}function De(){const t=W(j(v,"meets"),Y("createdAt","desc"));J(t,d=>{M=d.docs.map(a=>({id:a.id,...a.data()})),E()},d=>{console.error("Error listening to meets:",d)});const s=W(j(v,"schedules"),Y("createdAt","asc"));if(J(s,d=>{X=d.docs.map(a=>({id:a.id,...a.data()})),E()},d=>{console.error("Error listening to schedules:",d)}),ye(),A==="coach"){const d=W(j(v,"registrations"),Y("createdAt","desc"));J(d,a=>{z=a.docs.map(n=>({id:n.id,...n.data()})),E()},a=>{console.error("Error listening to registrations:",a)})}}async function ye(){if(!_)return;const t=I(v,"registrations",_.uid),s=await O(t);s.exists()&&(V=s.id,p=s.data())}function E(){_&&ye().then(()=>{le()}).catch(t=>{console.error("Error fetching family data:",t),le()})}function le(){A==="coach"?Te(_):Le(_)}const Se=["dash_day_sunday","dash_day_monday","dash_day_tuesday","dash_day_wednesday","dash_day_thursday","dash_day_friday","dash_day_saturday"];function T(t){return e(Se[t]||"dash_day_monday")}function Le(t){const s=document.getElementById("app");s.innerHTML=`
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
            <button class="dash-nav-item ${u==="overview"?"active":""}" data-tab="overview">
              <span class="dash-nav-icon">📊</span> ${e("dash_swimmer_overview_label")}
            </button>
            <button class="dash-nav-item ${u==="profile"?"active":""}" data-tab="profile">
              <span class="dash-nav-icon">👤</span> ${e("dash_swimmer_profile_label")}
            </button>
            <button class="dash-nav-item ${u==="plans"?"active":""}" data-tab="plans">
              <span class="dash-nav-icon">📋</span> ${e("dash_swimmer_plans_label")}
            </button>
            <button class="dash-nav-item ${u==="meets"?"active":""}" data-tab="meets">
              <span class="dash-nav-icon">🏆</span> ${e("dash_swimmer_meets_label")}
            </button>
            <button class="dash-nav-item ${u==="schedule"?"active":""}" data-tab="schedule">
              <span class="dash-nav-icon">📅</span> ${e("dash_swimmer_schedule_label")}
            </button>
          </div>
          <div class="dash-nav-section" style="margin-top: auto;">
            <span class="dash-nav-label">${e("dash_sidebar_system")}</span>
            ${C==="admin"?`
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
              <h1 class="dash-page-title">${ge(u)}</h1>
              <p class="dash-page-subtitle">${Ae(u)}</p>
            </div>
          </div>
          <div class="dash-topbar-right">
            <div class="dash-user-menu" id="user-menu">
              <button class="dash-user-trigger" id="user-trigger">
                <div class="dash-avatar">${(ce()||t.email||e("dash_swimmer_username_fallback")).charAt(0).toUpperCase()}</div>
                <span class="dash-user-name">${ce()||t.email||e("dash_swimmer_username_fallback")}</span>
                <span class="dash-dropdown-arrow">▾</span>
              </button>
              <div class="dash-dropdown" id="user-dropdown" style="display: none;">
                <button class="dash-dropdown-item" id="menu-profile">${e("dash_user_menu_profile")}</button>
                ${C==="admin"?`<button class="dash-dropdown-item" id="menu-admin">${e("dash_user_menu_admin")}</button>`:""}
                ${_&&_.providerData&&_.providerData[0].providerId==="password"?`<button class="dash-dropdown-item" id="menu-password">🔑 ${e("dash_profile_password_btn")}</button>`:""}
                <button class="dash-dropdown-item" id="menu-signout" style="color: var(--color-accent);">${e("dash_user_menu_signout")}</button>
              </div>
            </div>
          </div>
        </header>

        <div class="dash-content">
          ${be(u,"swimmer")}
        </div>
      </main>
    </div>
  `,Ie(),G(),we()}function Te(t){const s=document.getElementById("app");s.innerHTML=`
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
            <button class="dash-nav-item ${u==="overview"?"active":""}" data-tab="overview">
              <span class="dash-nav-icon">🏠</span> ${e("dash_coach_overview_label")}
            </button>
            <button class="dash-nav-item ${u==="roster"?"active":""}" data-tab="roster">
              <span class="dash-nav-icon">👥</span> ${e("dash_coach_roster_label")}
            </button>
            <button class="dash-nav-item ${u==="meets"?"active":""}" data-tab="meets">
              <span class="dash-nav-icon">🏁</span> ${e("dash_coach_meets_label")}
            </button>
            <button class="dash-nav-item ${u==="schedule"?"active":""}" data-tab="schedule">
              <span class="dash-nav-icon">⏱️</span> ${e("dash_coach_schedule_label")}
            </button>
          </div>
          <div class="dash-nav-section" style="margin-top: auto;">
            <span class="dash-nav-label">${e("dash_sidebar_system")}</span>
            ${C==="admin"?`
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
              <h1 class="dash-page-title">Coach: ${ge(u,"coach")}</h1>
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
                ${C==="admin"?`<button class="dash-dropdown-item" id="menu-admin">${e("dash_user_menu_admin")}</button>`:""}
                ${_&&_.providerData&&_.providerData[0].providerId==="password"?`<button class="dash-dropdown-item" id="menu-password">🔑 ${e("dash_profile_password_btn")}</button>`:""}
                <button class="dash-dropdown-item" id="menu-signout" style="color: var(--color-accent);">${e("dash_user_menu_signout")}</button>
              </div>
            </div>
          </div>
        </header>

        <div class="dash-content">
          ${be(u,"coach")}
        </div>
      </main>
    </div>
  `,Ie(),G(),we()}function ce(){if(!p||!p.parent)return null;const t=p.parent;return[t.firstName,t.lastName].filter(Boolean).join(" ")||null}function ge(t,s="swimmer"){return s==="coach"?{overview:e("dash_coach_tab_overview"),roster:e("dash_coach_tab_roster"),meets:e("dash_coach_tab_meets"),schedule:e("dash_coach_tab_schedule")}[t]||e("dash_coach_tab_overview"):{overview:e("dash_swimmer_tab_overview"),profile:e("dash_swimmer_tab_profile"),plans:e("dash_swimmer_tab_plans"),meets:e("dash_swimmer_tab_meets"),schedule:e("dash_swimmer_tab_schedule")}[t]||e("dash_swimmer_tab_overview")}function Ae(t){return{overview:e("dash_swimmer_overview_sub"),profile:e("dash_swimmer_profile_sub"),plans:e("dash_swimmer_plans_sub"),meets:e("dash_swimmer_meets_sub"),schedule:e("dash_swimmer_schedule_sub")}[t]||""}function be(t,s="swimmer"){if(s==="coach")switch(t){case"overview":return me();case"roster":return Ne();case"meets":return pe();case"schedule":return he();default:return me()}switch(t){case"overview":return Pe();case"profile":return ze();case"plans":return Fe();case"meets":return pe();case"schedule":return he();default:return""}}function we(){const t=document.getElementById("sidebar-theme-icon");if(t){const s=document.documentElement.getAttribute("data-theme")==="dark";t.textContent=s?"☀️":"🌙"}}function $e(){const t=[];for(const s of z)if(s.swimmers)for(let d=0;d<s.swimmers.length;d++){const a=s.swimmers[d];a.deleted||t.push({...a,parentName:Ee(s),_regId:s.id,_swimmerIndex:d})}return t}function Ee(t){return t.parent&&[t.parent.firstName,t.parent.lastName].filter(Boolean).join(" ")||"—"}function qe(){const t=new Date;return t.setDate(t.getDate()-30),z.filter(s=>{var a,n;return(((n=(a=s.createdAt)==null?void 0:a.toDate)==null?void 0:n.call(a))||new Date(s.createdAt))>=t})}function me(){const t=$e(),s=qe(),d=M.filter(a=>a.status!=="Completed");return`
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
        <div class="dash-stat-number">${d.length}</div>
        <div class="dash-stat-label">${e("dash_coach_upcoming_meets")}</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${z.length}</div>
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
              <div class="dash-mini-meta">${a.swimmers?a.swimmers.filter(n=>!n.deleted).length:0} swimmer(s)</div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `}function Ne(){const t=$e(),s=C==="admin",d=s?`<tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
        <th style="padding: 1rem;">${e("dash_coach_roster_name")}</th>
        <th style="padding: 1rem;">${e("dash_coach_roster_age")}</th>
        <th style="padding: 1rem;">${e("dash_coach_roster_gender")}</th>
        <th style="padding: 1rem;">${e("dash_coach_roster_payment_received")}</th>
        <th style="padding: 1rem;">${e("dash_coach_roster_payment_date")}</th>
      </tr>`:`<tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
        <th style="padding: 1rem;">${e("dash_coach_roster_name")}</th>
        <th style="padding: 1rem;">${e("dash_coach_roster_parent")}</th>
        <th style="padding: 1rem;">${e("dash_coach_roster_age")}</th>
        <th style="padding: 1rem;">${e("dash_coach_roster_gender")}</th>
        <th style="padding: 1rem;">${e("dash_coach_roster_usa_id")}</th>
      </tr>`;return`
    <div class="dash-panel">
      <div class="dash-panel-header" style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h3 class="dash-panel-title">${e("dash_coach_roster_title")} (${t.length} athletes)</h3>
      </div>
      <div class="dash-panel-body">
        ${t.length===0?`<p class="dash-empty">${e("dash_coach_no_swimmers")}</p>`:`
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>${d}</thead>
          <tbody>
            ${t.map(a=>{const n=a.dob?Math.floor((new Date-new Date(a.dob))/315576e5):"—",r=a.payment_received===!0?"selected":"",f=a.payment_received===!1?"selected":"",c=a.payment_received==null?"selected":"",h=a.payment_date||"";return s?`
                  <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 1rem; font-weight: 500;">${[a.firstName,a.lastName].filter(Boolean).join(" ")}</td>
                    <td style="padding: 1rem;">${n}</td>
                    <td style="padding: 1rem;">${a.gender||"—"}</td>
                    <td style="padding: 0.5rem 1rem;">
                      <select
                        class="roster-payment-select"
                        data-reg-id="${a._regId}"
                        data-swimmer-index="${a._swimmerIndex}"
                        data-field="payment_received"
                        onchange="window.__updateSwimmerPayment(this)"
                        style="width: 100%; padding: 0.4rem 0.5rem; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-primary); color: var(--text-primary); font-size: var(--fs-sm);"
                      >
                        <option value="" ${c}>—</option>
                        <option value="yes" ${r}>${e("dash_coach_roster_payment_yes")}</option>
                        <option value="no" ${f}>${e("dash_coach_roster_payment_no")}</option>
                      </select>
                    </td>
                    <td style="padding: 0.5rem 1rem;">
                      <input
                        type="date"
                        class="roster-payment-date"
                        data-reg-id="${a._regId}"
                        data-swimmer-index="${a._swimmerIndex}"
                        data-field="payment_date"
                        value="${h}"
                        onchange="window.__updateSwimmerPayment(this)"
                        style="width: 100%; padding: 0.4rem 0.5rem; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-primary); color: var(--text-primary); font-size: var(--fs-sm);"
                      />
                    </td>
                  </tr>
                `:`
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
  `}window.__updateSwimmerPayment=async function(t){var f,c;if(C!=="admin"){console.warn("Non-admin attempted to modify payment field — blocked"),E();return}const s=t.dataset.regId,d=parseInt(t.dataset.swimmerIndex),a=t.dataset.field;let n=t.value;a==="payment_received"&&(n==="yes"?n=!0:n==="no"?n=!1:n=null),a==="payment_date"&&(n=n||null);const r=z.find(h=>h.id===s);(f=r==null?void 0:r.swimmers)!=null&&f[d]&&(r.swimmers[d]={...r.swimmers[d],[a]:n});try{const h=I(v,"registrations",s),l=await O(h);if(!l.exists())return;const b=[...l.data().swimmers];b[d]&&(b[d]={...b[d],[a]:n},await P(h,{swimmers:b}))}catch(h){console.error("Error updating swimmer payment field:",h);const l=z.find(b=>b.id===s);if((c=l==null?void 0:l.swimmers)!=null&&c[d]){const b=await O(I(v,"registrations",s));b.exists()&&(l.swimmers[d]={...b.data().swimmers[d]})}E()}};function Pe(){const t=K.filter(a=>a.status!=="Completed").length,s=K.filter(a=>a.status==="Completed").length,d=M.filter(a=>a.status!=="Completed").length;return`
    <div class="dash-stats-row">
      <div class="dash-stat-card">
        <div class="dash-stat-number">${K.length}</div>
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
          ${M.filter(a=>a.status!=="Completed").map(a=>je(a)).join("")}
        </div>
      </div>
    </div>

    <div class="dash-panel">
      <h3 class="dash-panel-title">${e("dash_swimmer_today_practice")}</h3>
      <div class="dash-panel-body">
        ${Me()}
      </div>
    </div>
  `}function je(t){const s=t.status||"Open",d=t.startDate&&t.endDate?`${t.startDate} – ${t.endDate}`:t.date||"";return`
    <div class="dash-mini-card">
      <div class="dash-mini-top">
        <span class="dash-mini-name">${t.name||"Untitled Meet"}</span>
        <span class="status-badge status-${s.toLowerCase().replace(" ","-")}">${s}</span>
      </div>
      <div class="dash-mini-meta">${d} · ${t.location||""}</div>
    </div>
  `}function Me(){const t=new Date().getDay(),s=T(t),d=X.filter(a=>a.day===s);return d.length===0?`<p class="dash-empty">${e("dash_swimmer_rest_day")} (${s}). Rest day! 🎉</p>`:d.map(a=>`
    <div class="dash-mini-card">
      <div class="dash-mini-top">
        <span class="dash-mini-name">${a.startTime} – ${a.endTime}</span>
      </div>
      <div class="dash-mini-meta">${a.location||""}</div>
    </div>
  `).join("")}function ze(){if(!p)return`<div class="dash-panel" style="text-align: center; padding: 3rem;">
      <p class="dash-empty">${e("dash_profile_no_reg")}</p>
      <p style="margin-top: 1rem;"><a href="/dragonwebsite/registration.html" class="btn btn-primary">${e("dash_profile_complete_reg")}</a></p>
    </div>`;const t=p.parent||{},s=p.spouse,d=p.swimmers||[],a=p.emergencyContact||{};return`
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
          ${d.filter(n=>!n.deleted).length===0?`<p class="dash-empty">${e("dash_profile_no_swimmers")}</p>`:d.map((n,r)=>n.deleted?"":`

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
              <button class="btn btn-outline btn-sm delete-swimmer-btn" data-index="${r}" style="color: var(--color-accent); border-color: var(--color-accent);">${e("dash_profile_remove")}</button>
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
  `}function pe(){const t=A==="coach";return`
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
      ${M.length===0?`<p class="dash-empty">${e("dash_meets_no_meets")}</p>`:M.map(s=>`
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
  `}function he(){const t=A==="coach";[0,1,2,3,4,5,6].map(d=>T(d));const s=[1,2,3,4,5,6,0];return`
    <div class="dash-section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2 style="font-size: 1.5rem; font-weight: 600; color: var(--text-primary);">${e("dash_schedule_weekly")}</h2>
      ${t?`<button class="btn btn-primary btn-sm" id="add-session-btn">${e("dash_schedule_add")}</button><button class="btn btn-outline btn-sm" id="import-csv-btn">${e("dash_schedule_import_csv")}</button>`:""}
    </div>

    ${t?`
      <div id="add-session-form" class="dash-panel" style="display: none; margin-bottom: 2rem; padding: 1.5rem;">
        <h3 style="margin-bottom: 1rem;" id="session-form-title">${e("dash_schedule_new_title")}</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem;">
          <select id="session-day" class="form-input">
            ${s.map(d=>`<option value="${T(d)}">${T(d)}</option>`).join("")}
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
      ${s.map(d=>{const a=T(d),n=X.filter(r=>r.day===a);return`
          <div class="dash-schedule-day">
            <h3 class="dash-schedule-day-name">${a}</h3>
            ${n.length===0?`<p class="dash-empty-sm">${e("dash_schedule_no_practice")}</p>`:n.map(r=>`
                <div class="dash-schedule-item">
                  <div class="dash-schedule-time">${r.startTime} – ${r.endTime}</div>
                  <div class="dash-schedule-focus">${r.location||""}</div>
                  <div class="dash-schedule-meta" style="display: flex; justify-content: flex-end; align-items: center; gap: 8px;">
                    ${t?`
                      <button class="edit-session" data-id="${r.id}" data-day="${r.day}" data-start="${r.startTime||""}" data-end="${r.endTime||""}" data-location="${r.location||""}" style="background: none; border: none; font-size: 1rem; cursor: pointer; color: var(--color-primary); padding: 0 5px;" title="Edit">✎</button>
                      <button class="delete-session" data-id="${r.id}" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--color-accent); padding: 0 5px;" title="Delete">&times;</button>
                    `:""}
                  </div>
                </div>
              `).join("")}
          </div>
        `}).join("")}
    </div>
  `}function He(t,s){const d=document.createElement("div");d.className="confirm-overlay",d.innerHTML=`
    <div class="confirm-modal">
      <h3 class="confirm-title">${e("dash_profile_delete_title")}</h3>
      <p class="confirm-body">${e("dash_profile_delete_body1")} <strong style="color: var(--color-accent, #dc3545);">${t}</strong> ${e("dash_profile_delete_body2")}</p>
      <p class="confirm-warning">${e("dash_profile_delete_warning")}</p>
      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="confirm-cancel">${e("dash_profile_delete_cancel")}</button>
        <button class="btn btn-sm" id="confirm-delete" style="background: var(--color-accent, #dc3545); color: white; border: none;">${e("dash_profile_delete_confirm")}</button>
      </div>
    </div>
  `,document.body.appendChild(d),d.querySelector("#confirm-cancel").addEventListener("click",()=>d.remove()),d.querySelector("#confirm-delete").addEventListener("click",async()=>{d.remove();const a=[...p.swimmers];a[s]={...a[s],deleted:!0,deletedAt:new Date().toISOString()};try{await P(I(v,"registrations",V),{swimmers:a}),p.swimmers=a,u="profile",E()}catch(n){console.error("Error marking swimmer deleted:",n),alert(e("dash_profile_save_failed"))}}),d.addEventListener("click",a=>{a.target===d&&d.remove()})}function Re(){const t=document.createElement("div");t.className="confirm-overlay",t.innerHTML=`
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
  `,document.body.appendChild(t);const s=t.querySelector("#modal-password-msg");t.querySelector("#modal-password-cancel").addEventListener("click",()=>t.remove()),t.querySelector("#modal-password-submit").addEventListener("click",async()=>{const d=t.querySelector("#modal-current-password").value,a=t.querySelector("#modal-new-password").value,n=t.querySelector("#modal-confirm-password").value;if(s.style.display="none",!d||!a||!n){s.textContent="All fields are required.",s.style.color="var(--color-accent, #DC2626)",s.style.display="block";return}if(a!==n){s.textContent=e("dash_profile_password_mismatch"),s.style.color="var(--color-accent, #DC2626)",s.style.display="block";return}if(a.length<6){s.textContent="Password must be at least 6 characters.",s.style.color="var(--color-accent, #DC2626)",s.style.display="block";return}try{const r=ve.credential(_.email,d);await _e(_,r),await fe(_,a),s.textContent=e("dash_profile_password_success"),s.style.color="#16A34A",s.style.display="block",t.querySelector("#modal-current-password").value="",t.querySelector("#modal-new-password").value="",t.querySelector("#modal-confirm-password").value=""}catch(r){console.error("Password update error:",r),r.code==="auth/wrong-password"||r.code==="auth/invalid-credential"?s.textContent=e("dash_profile_password_wrong"):s.textContent=e("dash_profile_password_error")+" "+(r.message||""),s.style.color="var(--color-accent, #DC2626)",s.style.display="block"}}),t.addEventListener("click",d=>{d.target===t&&t.remove()})}function ue(t){const s=[];let d="",a=!1;for(let n=0;n<t.length;n++){const r=t[n];r==='"'?a=!a:r===","&&!a?(s.push(d.trim()),d=""):d+=r}return s.push(d.trim()),s.length>0&&s[0].charCodeAt(0)===65279&&(s[0]=s[0].slice(1)),s}function Oe(t){const d=t.split(/\r?\n/).filter(r=>r.trim().length>0);if(d.length===0)return{headers:[],rows:[]};const a=ue(d[0]),n=d.slice(1).map(r=>ue(r));return{headers:a,rows:n}}function Ve(t,s){if(!t||t.length<4)return{valid:!1,reason:e("dash_csv_error_too_few_cols"),rowNum:s};const[d,a,n,r]=t.map(l=>(l||"").trim());if(!d)return{valid:!1,reason:e("dash_csv_error_missing_day"),rowNum:s};const f=d.toLowerCase(),c=[0,1,2,3,4,5,6].find(l=>T(l).toLowerCase()===f);if(c===void 0)return{valid:!1,reason:e("dash_csv_error_invalid_day",{day:d}),rowNum:s};const h=T(c);return a?/^\d{1,2}:\d{2}\s*(AM|PM)?$/i.test(a)?n?/^\d{1,2}:\d{2}\s*(AM|PM)?$/i.test(n)?{valid:!0,day:h,startTime:a,endTime:n,location:r||"",rowNum:s}:{valid:!1,reason:e("dash_csv_error_invalid_time",{field:"EndTime",value:n}),rowNum:s}:{valid:!1,reason:e("dash_csv_error_missing_end"),rowNum:s}:{valid:!1,reason:e("dash_csv_error_invalid_time",{field:"StartTime",value:a}),rowNum:s}:{valid:!1,reason:e("dash_csv_error_missing_start"),rowNum:s}}function D(t,s){const d=document.getElementById("csv-import-status");d&&d.remove();const a=document.createElement("div");a.id="csv-import-status",a.style.cssText=["padding: var(--space-md) var(--space-lg)","border-radius: var(--radius-md)","margin-bottom: var(--space-lg)","font-size: var(--fs-sm)","font-weight: var(--fw-medium)",s?"background: #fef2f2; border: 1px solid #fee2e2; color: #991b1b":"background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534"].join(";"),a.textContent=t;const n=document.querySelector(".dash-content");n&&n.insertBefore(a,n.firstChild),setTimeout(()=>a.remove(),8e3)}async function Ue(t){var b;const s=(b=t.target.files)==null?void 0:b[0];if(t.target.remove(),!s)return;if(!s.name.toLowerCase().endsWith(".csv")){D(e("dash_csv_error_not_csv"),!0);return}if(s.size>5e5){D(e("dash_csv_error_too_large"),!0);return}let d;try{d=await s.text()}catch(k){console.error("Error reading CSV file:",k),D(e("dash_csv_error_unknown"),!0);return}if(!d||d.trim().length===0){D(e("dash_csv_error_empty"),!0);return}const{headers:a,rows:n}=Oe(d),r=["day","starttime","endtime","location"],f=a.map(k=>k.replace(/\s/g,"").toLowerCase());if(!r.every(k=>f.includes(k))||a.length<4){D(e("dash_csv_error_bad_header"),!0);return}const h=[],l=[];n.forEach((k,H)=>{const B=Ve(k,H+2);B.valid?h.push({day:B.day,startTime:B.startTime,endTime:B.endTime,location:B.location||""}):l.push({rowNum:B.rowNum,reason:B.reason})}),We(h,l,s.name)}function We(t,s,d){var h;const a=d.replace(/</g,"&lt;").replace(/>/g,"&gt;"),n=t.length,r=s.length,f=l=>l.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),c=document.createElement("div");c.className="confirm-overlay",c.innerHTML=`
    <div class="confirm-modal csv-import-modal">
      <h3 class="confirm-title">${e("dash_csv_import_title")}</h3>
      <p class="csv-import-filename">${e("dash_csv_import_file")}: <strong>${a}</strong></p>
      <p class="csv-import-summary">${e("dash_csv_import_summary",{valid:String(n),error:String(r)})}</p>
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
              ${t.map(l=>`
                <tr>
                  <td>${f(l.day)}</td>
                  <td>${f(l.startTime)}</td>
                  <td>${f(l.endTime)}</td>
                  <td>${f(l.location||"")}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `:""}
      ${s.length>0?`
        <div class="csv-error-block">
          <p class="csv-error-title">${e("dash_csv_import_errors")}</p>
          ${s.map(l=>`<p class="csv-error-item">${e("dash_csv_import_row")} ${l.rowNum}: ${f(l.reason)}</p>`).join("")}
        </div>
      `:""}
      ${t.length===0?`
        <p class="csv-no-valid">${e("dash_csv_import_no_valid")}</p>
      `:""}
      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="csv-import-cancel">${e("dash_csv_import_cancel")}</button>
        ${t.length>0?`<button class="btn btn-primary btn-sm" id="csv-import-confirm">${e("dash_csv_import_confirm",{count:String(n)})}</button>`:""}
      </div>
    </div>
  `,document.body.appendChild(c),c.querySelector("#csv-import-cancel").addEventListener("click",()=>c.remove()),(h=c.querySelector("#csv-import-confirm"))==null||h.addEventListener("click",async()=>{c.remove(),await Ye(t)}),c.addEventListener("click",l=>{l.target===c&&c.remove()})}async function Ye(t){if(!t||t.length===0)return;const s=document.getElementById("csv-import-status");s&&s.remove();try{const d=Be(v),a=j(v,"schedules");t.forEach(n=>{const r=I(a);d.set(r,{day:n.day,startTime:n.startTime,endTime:n.endTime,location:n.location||"",createdAt:new Date})}),await d.commit(),D(e("dash_csv_import_success",{count:String(t.length)}))}catch(d){console.error("CSV import batch write failed:",d),d.code==="permission-denied"?D(e("dash_csv_error_permission"),!0):d.code==="unavailable"?D(e("dash_csv_error_network"),!0):D(e("dash_csv_error_unknown")+" "+(d.message||""),!0)}}function Ie(){var n,r,f,c,h,l,b,k,H,B,Z,ee,te,se,ae,de;document.querySelectorAll(".dash-nav-item[data-tab]").forEach(i=>{i.addEventListener("click",()=>{u=i.dataset.tab,E()})}),(n=document.getElementById("dash-theme-toggle"))==null||n.addEventListener("click",()=>{xe(),E()});const t=document.getElementById("dash-hamburger"),s=document.getElementById("dash-sidebar");t==null||t.addEventListener("click",()=>{s.classList.toggle("open")}),document.querySelectorAll(".dash-register-btn").forEach(i=>{i.addEventListener("click",()=>{window.location.href="/dragonwebsite/registration.html"})}),(r=document.getElementById("sidebar-signout"))==null||r.addEventListener("click",async()=>{try{await ne(Q),window.location.href="/dragonwebsite/signin.html"}catch(i){console.error("Error signing out:",i)}});const d=document.getElementById("user-trigger"),a=document.getElementById("user-dropdown");if(d==null||d.addEventListener("click",i=>{i.stopPropagation(),a.style.display=a.style.display==="none"?"block":"none"}),document.addEventListener("click",()=>{a&&(a.style.display="none")}),(f=document.getElementById("menu-profile"))==null||f.addEventListener("click",()=>{u="profile",a.style.display="none",E()}),(c=document.getElementById("menu-signout"))==null||c.addEventListener("click",async()=>{try{await ne(Q),window.location.href="/dragonwebsite/signin.html"}catch(i){console.error("Error signing out:",i)}}),(h=document.getElementById("menu-admin"))==null||h.addEventListener("click",()=>{window.location.href="/dragonwebsite/admin.html"}),(l=document.getElementById("menu-password"))==null||l.addEventListener("click",()=>{a.style.display="none",Re()}),(b=document.getElementById("edit-contact-btn"))==null||b.addEventListener("click",()=>{document.querySelectorAll(".profile-display").forEach(i=>i.style.display="none"),document.querySelectorAll(".profile-edit-field").forEach(i=>i.style.display="block"),document.getElementById("edit-actions").style.display="flex",document.getElementById("edit-contact-btn").style.display="none"}),(k=document.getElementById("cancel-contact-btn"))==null||k.addEventListener("click",()=>{document.querySelectorAll(".profile-display").forEach(i=>i.style.display=""),document.querySelectorAll(".profile-edit-field").forEach(i=>i.style.display="none"),document.getElementById("edit-actions").style.display="none",document.getElementById("edit-contact-btn").style.display=""}),(H=document.getElementById("save-contact-btn"))==null||H.addEventListener("click",async()=>{var y,g,$,m,w,N;const i={"parent.phone":((y=document.getElementById("edit-parent-phone"))==null?void 0:y.value.trim())||"","parent.address":((g=document.getElementById("edit-parent-address"))==null?void 0:g.value.trim())||""};p.spouse&&(i["spouse.phone"]=(($=document.getElementById("edit-spouse-phone"))==null?void 0:$.value.trim())||"",i["spouse.email"]=((m=document.getElementById("edit-spouse-email"))==null?void 0:m.value.trim())||""),i["emergencyContact.name"]=((w=document.getElementById("edit-emergency-name"))==null?void 0:w.value.trim())||"",i["emergencyContact.phone"]=((N=document.getElementById("edit-emergency-phone"))==null?void 0:N.value.trim())||"";try{await P(I(v,"registrations",V),i),p.parent.phone=i["parent.phone"],p.parent.address=i["parent.address"],p.spouse&&(p.spouse.phone=i["spouse.phone"],p.spouse.email=i["spouse.email"]),p.emergencyContact.name=i["emergencyContact.name"],p.emergencyContact.phone=i["emergencyContact.phone"],u="profile",E()}catch(R){console.error("Error updating contact:",R),alert(e("dash_profile_save_failed"))}}),(B=document.getElementById("add-swimmer-toggle-btn"))==null||B.addEventListener("click",()=>{document.getElementById("add-swimmer-form").style.display="block",document.getElementById("add-swimmer-toggle-btn").style.display="none"}),(Z=document.getElementById("cancel-swimmer-btn"))==null||Z.addEventListener("click",()=>{document.getElementById("add-swimmer-form").style.display="none",document.getElementById("add-swimmer-toggle-btn").style.display=""}),(ee=document.getElementById("save-swimmer-btn"))==null||ee.addEventListener("click",async()=>{const i=document.getElementById("new-swimmer-first").value.trim(),y=document.getElementById("new-swimmer-last").value.trim();if(!i||!y){alert(e("dash_profile_swimmer_required"));return}const g={firstName:i,lastName:y,middleName:document.getElementById("new-swimmer-middle").value.trim()||null,gender:document.getElementById("new-swimmer-gender").value||null,dob:document.getElementById("new-swimmer-dob").value||null,usaSwimmingId:document.getElementById("new-swimmer-usaId").value.trim()||null,joinDate:null},$=[...p.swimmers,g];try{await P(I(v,"registrations",V),{swimmers:$}),p.swimmers=$,u="profile",E()}catch(m){console.error("Error adding swimmer:",m),alert(e("dash_profile_swimmer_add_failed"))}}),document.querySelectorAll(".delete-swimmer-btn").forEach(i=>{i.addEventListener("click",()=>{const y=parseInt(i.dataset.index),g=p.swimmers[y],$=[g.firstName,g.lastName].filter(Boolean).join(" ");He($,y)})}),(te=document.getElementById("update-password-btn"))==null||te.addEventListener("click",async()=>{const i=document.getElementById("password-update-msg"),y=document.getElementById("change-current-password").value,g=document.getElementById("change-new-password").value,$=document.getElementById("change-confirm-password").value;i.style.display="none",i.style.color="";const m=document.getElementById("update-password-btn");if(m&&(m.disabled=!0),!y||!g||!$){i.textContent="All fields are required.",i.style.color="var(--color-accent, #DC2626)",i.style.display="block",m&&(m.disabled=!1);return}if(g!==$){i.textContent=e("dash_profile_password_mismatch"),i.style.color="var(--color-accent, #DC2626)",i.style.display="block",m&&(m.disabled=!1);return}if(g.length<6){i.textContent="Password must be at least 6 characters.",i.style.color="var(--color-accent, #DC2626)",i.style.display="block",m&&(m.disabled=!1);return}try{const w=ve.credential(_.email,y);await _e(_,w),await fe(_,g),i.textContent=e("dash_profile_password_success"),i.style.color="#16A34A",i.style.display="block",document.getElementById("change-current-password").value="",document.getElementById("change-new-password").value="",document.getElementById("change-confirm-password").value=""}catch(w){console.error("Password update error:",w),w.code==="auth/wrong-password"||w.code==="auth/invalid-credential"?i.textContent=e("dash_profile_password_wrong"):i.textContent=e("dash_profile_password_error")+" "+(w.message||""),i.style.color="var(--color-accent, #DC2626)",i.style.display="block"}finally{m&&(m.disabled=!1)}}),A==="coach"){const i=document.getElementById("add-meet-form"),y=document.getElementById("save-meet-btn"),g=document.getElementById("cancel-meet-btn"),$=document.getElementById("meet-form-title");(se=document.getElementById("add-meet-btn"))==null||se.addEventListener("click",()=>{S=null,$.textContent=e("dash_meets_new_title"),y.textContent=e("dash_meets_save"),document.getElementById("meet-name").value="",document.getElementById("meet-start-date").value="",document.getElementById("meet-end-date").value="",document.getElementById("meet-location").value="",i.style.display="block"}),g==null||g.addEventListener("click",()=>{i.style.display="none",S=null}),y==null||y.addEventListener("click",async()=>{const o=document.getElementById("meet-name").value.trim(),x=document.getElementById("meet-start-date").value,q=document.getElementById("meet-end-date").value,F=document.getElementById("meet-location").value.trim();if(!o||!x||!q){alert(e("dash_meets_name_date_required"));return}try{S?await P(I(v,"meets",S),{name:o,startDate:x,endDate:q,location:F}):await ie(j(v,"meets"),{name:o,startDate:x,endDate:q,location:F,status:"Open",createdAt:new Date}),i.style.display="none",S=null}catch(U){console.error("Error saving meet:",U)}}),document.querySelectorAll(".edit-meet").forEach(o=>{o.addEventListener("click",()=>{S=o.dataset.id,$.textContent=e("dash_meets_edit_title"),y.textContent=e("dash_meets_update"),document.getElementById("meet-name").value=o.dataset.name,document.getElementById("meet-start-date").value=o.dataset.start,document.getElementById("meet-end-date").value=o.dataset.end,document.getElementById("meet-location").value=o.dataset.location,i.style.display="block",i.scrollIntoView({behavior:"smooth"})})}),document.querySelectorAll(".delete-meet").forEach(o=>{o.addEventListener("click",async()=>{if(confirm(e("dash_meets_confirm_delete")))try{await re(I(v,"meets",o.dataset.id)),S===o.dataset.id&&(i.style.display="none",S=null)}catch(x){console.error("Error deleting meet:",x)}})});const m=document.getElementById("add-session-form"),w=document.getElementById("save-session-btn"),N=document.getElementById("cancel-session-btn"),R=document.getElementById("session-form-title");(ae=document.getElementById("add-session-btn"))==null||ae.addEventListener("click",()=>{L=null,R.textContent=e("dash_schedule_new_title"),w.textContent=e("dash_schedule_save"),document.getElementById("session-day").value=T(1),document.getElementById("session-start-time").value="",document.getElementById("session-end-time").value="",document.getElementById("session-location").value="",m.style.display="block"}),N==null||N.addEventListener("click",()=>{m.style.display="none",L=null}),w==null||w.addEventListener("click",async()=>{const o=document.getElementById("session-day").value,x=document.getElementById("session-start-time").value.trim(),q=document.getElementById("session-end-time").value.trim(),F=document.getElementById("session-location").value.trim();if(!o||!x||!q){alert(e("dash_schedule_required_fields"));return}try{L?await P(I(v,"schedules",L),{day:o,startTime:x,endTime:q,location:F}):await ie(j(v,"schedules"),{day:o,startTime:x,endTime:q,location:F,createdAt:new Date}),m.style.display="none",L=null}catch(U){console.error("Error saving session:",U)}}),document.querySelectorAll(".edit-session").forEach(o=>{o.addEventListener("click",()=>{L=o.dataset.id,R.textContent=e("dash_schedule_edit_title"),w.textContent=e("dash_schedule_update"),document.getElementById("session-day").value=o.dataset.day,document.getElementById("session-start-time").value=o.dataset.start,document.getElementById("session-end-time").value=o.dataset.end,document.getElementById("session-location").value=o.dataset.location,m.style.display="block",m.scrollIntoView({behavior:"smooth"})})}),document.querySelectorAll(".delete-session").forEach(o=>{o.addEventListener("click",async()=>{if(confirm(e("dash_schedule_delete_confirm")))try{await re(I(v,"schedules",o.dataset.id)),L===o.dataset.id&&(m.style.display="none",L=null)}catch(x){console.error("Error deleting session:",x)}})}),(de=document.getElementById("import-csv-btn"))==null||de.addEventListener("click",()=>{const o=document.createElement("input");o.type="file",o.accept=".csv",o.addEventListener("change",Ue),o.click()})}}Ce();
