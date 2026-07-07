import{i as xe,t as e,a as Je}from"./i18n-CRIkWtj0.js";import{o as Ke,h as pe,g as B,e as b,b as we,q as me,l as ve,c as H,k as fe,u as X,t as Ie,E as je,r as Te,v as Me,a as be,f as $e,w as Qe,i as Ge,x as De}from"./firebase-CorBctTj.js";import{X as Ze}from"./xlsx-DkFutVy2.js";window.XLSX=Ze;xe();const _e=[{id:1,name:"Endurance Base Building",season:"Winter 2026",daysPerWeek:4,priority:"High",progress:72,tasks:"18 / 25 workouts completed",due:"Feb 28, 2026",status:"In Progress"},{id:2,name:"Sprint Technique Focus",season:"Spring 2026",daysPerWeek:3,priority:"Medium",progress:45,tasks:"9 / 20 workouts completed",due:"Mar 15, 2026",status:"In Progress"},{id:3,name:"Stroke Refinement (Butterfly)",season:"Summer 2026",daysPerWeek:5,priority:"Low",progress:0,tasks:"0 / 12 workouts completed",due:"Apr 30, 2026",status:"Not Started"},{id:4,name:"Fall Conditioning",season:"Fall 2025",daysPerWeek:3,priority:"High",progress:100,tasks:"30 / 30 workouts completed",due:"Nov 20, 2025",status:"Completed"}];let K=[],W=null,Se=[],Y=null,v=null,se="swimmer",P=null,x=null,Q=null,ae=[],G=[],y=ye(),k="overview",ke=!1;function et(){const t=document.getElementById("app");t.innerHTML=`
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; gap: 20px; font-family: sans-serif;">
      <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #f5c518; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <p style="color: #666;">${e("dash_loading")}</p>
      <style>
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    </div>
  `,console.log("Dashboard: Initializing auth listener...");const s=setTimeout(()=>{console.warn("Dashboard: Auth listener timed out — redirecting to signin"),window.location.href="/signin.html"},5e3);Ke(we,async n=>{if(clearTimeout(s),!n){console.log("Dashboard: No user authenticated, redirecting to signin..."),window.location.href="/signin.html";return}v=n,console.log("Dashboard: User authenticated:",n.email);try{console.log("Dashboard: Fetching user document...");const a=await pe(B(b,"users",n.uid));P=a.exists()?a.data().role:null;const o=n.email&&n.email.toLowerCase()==="dragonswim@outlook.com";se=P==="coach"||P==="admin"||o?"coach":P||"swimmer",console.log("Dashboard: Detected role:",se),ke?(console.log("Dashboard: Refreshing UI..."),N()):(console.log("Dashboard: Initializing data listeners..."),tt(),ke=!0,N())}catch(a){console.error("Dashboard Critical Error:",a),t.innerHTML=`
        <div style="padding: 40px; text-align: center; font-family: sans-serif; max-width: 500px; margin: 100px auto; border: 1px solid #fee2e2; background: #fef2f2; border-radius: 12px; color: #991b1b;">
          <h2 style="margin-bottom: 16px;">${e("dash_load_failed_title")}</h2>
          <p style="margin-bottom: 24px;">${e("dash_load_failed_msg")}</p>
          <code style="display: block; padding: 12px; background: #fee2e2; border-radius: 6px; font-size: 13px; text-align: left; overflow-x: auto; margin-bottom: 24px;">
            ${a.message||e("dash_unknown_error")}
          </code>
          <button onclick="window.location.reload()" style="padding: 10px 20px; background: #991b1b; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">${e("dash_load_failed_retry")}</button>
        </div>
      `,se="swimmer"}})}function tt(){const t=me(H(b,"meets"),ve("createdAt","desc"));fe(t,n=>{K=n.docs.map(a=>({id:a.id,...a.data()})),N()},n=>{console.error("Error listening to meets:",n)});const s=me(H(b,"schedules"),ve("createdAt","asc"));if(fe(s,n=>{Se=n.docs.map(a=>({id:a.id,...a.data()})),N()},n=>{console.error("Error listening to schedules:",n)}),se==="coach"){const n=me(H(b,"registrations"),ve("createdAt","desc"));fe(n,o=>{ae=o.docs.map(d=>({id:d.id,...d.data()})),N()},o=>{console.error("Error listening to registrations:",o)});const a=me(H(b,"deposits"),ve("swimmerName","asc"));fe(a,o=>{G=o.docs.map(d=>({id:d.id,...d.data()})),N()},o=>{console.error("Error listening to deposits:",o)})}}async function st(){if(!v)return;const t=B(b,"registrations",v.uid),s=await pe(t);if(s.exists()){Q=s.id,x=s.data(),console.log("fetchFamilyData: found own registration",s.id);return}if(v.email){const n=v.email.toLowerCase().trim();console.log("fetchFamilyData: looking for spouse access with email:",n);try{const a=me(H(b,"registrations"),Qe("parentEmails","array-contains",n)),o=await Ge(a);if(console.log("fetchFamilyData: spouse query returned",o.size,"docs"),!o.empty){const d=o.docs[0];Q=d.id,x=d.data(),console.log("fetchFamilyData: found via spouse access",Q,"parentEmails:",x.parentEmails);const i=x.editors||[];i.includes(v.uid)||(i.push(v.uid),await X(B(b,"registrations",Q),{editors:i}).catch(r=>{console.error("fetchFamilyData: failed to add editor:",r)}),x.editors=i);return}console.warn("fetchFamilyData: no registration found for spouse email",n)}catch(a){console.error("fetchFamilyData: spouse query failed:",a)}}else console.warn("fetchFamilyData: currentUser.email is empty")}function N(){v&&st().then(()=>{Be()}).catch(t=>{console.error("Error fetching family data:",t),Be()})}function Be(){se==="coach"?dt(v):nt(v)}const at=["dash_day_sunday","dash_day_monday","dash_day_tuesday","dash_day_wednesday","dash_day_thursday","dash_day_friday","dash_day_saturday"];function J(t){return e(at[t]||"dash_day_monday")}function nt(t){const s=document.getElementById("app");s.innerHTML=`
    <div class="dash-layout">
      <aside class="dash-sidebar" id="dash-sidebar">
        <div class="dash-sidebar-header">
          <a href="/" class="dash-logo">
            <img src="/logo-light.jpg" alt="Dragon Swim Team" class="dash-logo-img light-logo" />
            <img src="/logo-dark.png" alt="Dragon Swim Team" class="dash-logo-img dark-logo" />
          </a>
        </div>
        <nav class="dash-nav">
          <div class="dash-nav-section">
            <span class="dash-nav-label">${e("dash_sidebar_menu")}</span>
            <button class="dash-nav-item ${k==="overview"?"active":""}" data-tab="overview">
              <span class="dash-nav-icon">📊</span> ${e("dash_swimmer_overview_label")}
            </button>
            <button class="dash-nav-item ${k==="profile"?"active":""}" data-tab="profile">
              <span class="dash-nav-icon">👤</span> ${e("dash_swimmer_profile_label")}
            </button>
            <button class="dash-nav-item ${k==="plans"?"active":""}" data-tab="plans">
              <span class="dash-nav-icon">📋</span> ${e("dash_swimmer_plans_label")}
            </button>
            <button class="dash-nav-item ${k==="meets"?"active":""}" data-tab="meets">
              <span class="dash-nav-icon">🏆</span> ${e("dash_swimmer_meets_label")}
            </button>
            <button class="dash-nav-item ${k==="schedule"?"active":""}" data-tab="schedule">
              <span class="dash-nav-icon">📅</span> ${e("dash_swimmer_schedule_label")}
            </button>
          </div>
          <div class="dash-nav-section" style="margin-top: auto;">
            <span class="dash-nav-label">${e("dash_sidebar_system")}</span>
            ${P==="admin"?`
            <a href="/admin.html" class="dash-nav-item" style="text-decoration: none;">
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
              <h1 class="dash-page-title">${Pe(k)}</h1>
              <p class="dash-page-subtitle">${ot(k)}</p>
            </div>
          </div>
          <div class="dash-topbar-right">
            <div class="dash-user-menu" id="user-menu">
              <button class="dash-user-trigger" id="user-trigger">
                <div class="dash-avatar">${(Ce()||t.email||e("dash_swimmer_username_fallback")).charAt(0).toUpperCase()}</div>
                <span class="dash-user-name">${Ce()||t.email||e("dash_swimmer_username_fallback")}</span>
                <span class="dash-dropdown-arrow">▾</span>
              </button>
              <div class="dash-dropdown" id="user-dropdown" style="display: none;">
                <button class="dash-dropdown-item" id="menu-profile">${e("dash_user_menu_profile")}</button>
                ${P==="admin"?`<button class="dash-dropdown-item" id="menu-admin">${e("dash_user_menu_admin")}</button>`:""}
                ${v&&v.providerData&&v.providerData[0].providerId==="password"?`<button class="dash-dropdown-item" id="menu-password">🔑 ${e("dash_profile_password_btn")}</button>`:""}
                <button class="dash-dropdown-item" id="menu-signout" style="color: var(--color-accent);">${e("dash_user_menu_signout")}</button>
              </div>
            </div>
          </div>
        </header>

        <div class="dash-content">
          ${ze(k,"swimmer")}
        </div>
      </main>
    </div>
  `,We(),xe(),Re()}function dt(t){const s=document.getElementById("app");s.innerHTML=`
    <div class="dash-layout">
      <aside class="dash-sidebar" id="dash-sidebar">
        <div class="dash-sidebar-header">
          <a href="/" class="dash-logo">
            <img src="/logo-light.jpg" alt="Dragon Swim Team" class="dash-logo-img light-logo" />
            <img src="/logo-dark.png" alt="Dragon Swim Team" class="dash-logo-img dark-logo" />
          </a>
        </div>
        <nav class="dash-nav">
          <div class="dash-nav-section">
            <span class="dash-nav-label">${e("dash_coach_menu")}</span>
            <button class="dash-nav-item ${k==="overview"?"active":""}" data-tab="overview">
              <span class="dash-nav-icon">🏠</span> ${e("dash_coach_overview_label")}
            </button>
            <button class="dash-nav-item ${k==="roster"?"active":""}" data-tab="roster">
              <span class="dash-nav-icon">👥</span> ${e("dash_coach_roster_label")}
            </button>
            <button class="dash-nav-item ${k==="meets"?"active":""}" data-tab="meets">
              <span class="dash-nav-icon">🏁</span> ${e("dash_coach_meets_label")}
            </button>
            <button class="dash-nav-item ${k==="schedule"?"active":""}" data-tab="schedule">
              <span class="dash-nav-icon">⏱️</span> ${e("dash_coach_schedule_label")}
            </button>
            ${P==="admin"?`
            <button class="dash-nav-item ${k==="feesummary"?"active":""}" data-tab="feesummary">
              <span class="dash-nav-icon">💰</span> ${e("dash_coach_fee_summary_label")}
            </button>
            <button class="dash-nav-item ${k==="deposits"?"active":""}" data-tab="deposits">
              <span class="dash-nav-icon">🏦</span> ${e("dash_coach_deposits_label")}
            </button>
            `:""}
          </div>
          <div class="dash-nav-section" style="margin-top: auto;">
            <span class="dash-nav-label">${e("dash_sidebar_system")}</span>
            ${P==="admin"?`
            <a href="/admin.html" class="dash-nav-item" style="text-decoration: none;">
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
              <h1 class="dash-page-title">Coach: ${Pe(k,"coach")}</h1>
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
                ${P==="admin"?`<button class="dash-dropdown-item" id="menu-admin">${e("dash_user_menu_admin")}</button>`:""}
                ${v&&v.providerData&&v.providerData[0].providerId==="password"?`<button class="dash-dropdown-item" id="menu-password">🔑 ${e("dash_profile_password_btn")}</button>`:""}
                <button class="dash-dropdown-item" id="menu-signout" style="color: var(--color-accent);">${e("dash_user_menu_signout")}</button>
              </div>
            </div>
          </div>
        </header>

        <div class="dash-content">
          ${ze(k,"coach")}
        </div>
      </main>
    </div>
  `,We(),xe(),Re()}function Ce(){if(!x||!x.parent)return null;const t=x.parent;return[t.firstName,t.lastName].filter(Boolean).join(" ")||null}function Pe(t,s="swimmer"){return s==="coach"?{overview:e("dash_coach_tab_overview"),roster:e("dash_coach_tab_roster"),meets:e("dash_coach_tab_meets"),schedule:e("dash_coach_tab_schedule"),feesummary:e("dash_coach_tab_fee_summary"),deposits:e("dash_coach_tab_deposits")}[t]||e("dash_coach_tab_overview"):{overview:e("dash_swimmer_tab_overview"),profile:e("dash_swimmer_tab_profile"),plans:e("dash_swimmer_tab_plans"),meets:e("dash_swimmer_tab_meets"),schedule:e("dash_swimmer_tab_schedule")}[t]||e("dash_swimmer_tab_overview")}function ot(t){return{overview:e("dash_swimmer_overview_sub"),profile:e("dash_swimmer_profile_sub"),plans:e("dash_swimmer_plans_sub"),meets:e("dash_swimmer_meets_sub"),schedule:e("dash_swimmer_schedule_sub")}[t]||""}function ze(t,s="swimmer"){if(s==="coach")switch(t){case"overview":return Le();case"roster":return rt();case"meets":return Ae();case"schedule":return Fe();case"feesummary":return lt();case"deposits":return ct();default:return Le()}switch(t){case"overview":return Et();case"profile":return St();case"plans":return It();case"meets":return Ae();case"schedule":return Fe();default:return""}}function Re(){const t=document.getElementById("sidebar-theme-icon");if(t){const s=document.documentElement.getAttribute("data-theme")==="dark";t.textContent=s?"☀️":"🌙"}}function He(){const t=[];for(const s of ae)if(s.swimmers)for(let n=0;n<s.swimmers.length;n++){const a=s.swimmers[n];a.deleted||t.push({...a,parentName:Oe(s),_regId:s.id,_swimmerIndex:n})}return t}function Oe(t){return t.parent&&[t.parent.firstName,t.parent.lastName].filter(Boolean).join(" ")||"—"}function it(){const t=new Date;return t.setDate(t.getDate()-30),ae.filter(s=>{var a,o;return(((o=(a=s.createdAt)==null?void 0:a.toDate)==null?void 0:o.call(a))||new Date(s.createdAt))>=t})}function Le(){const t=He(),s=it(),n=K.filter(a=>a.status!=="Completed");return`
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
        <div class="dash-stat-number">${ae.length}</div>
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
              <div class="dash-mini-top"><span class="dash-mini-name">${Oe(a)}</span></div>
              <div class="dash-mini-meta">${a.swimmers?a.swimmers.filter(o=>!o.deleted).length:0} swimmer(s)</div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `}function rt(){const t=He(),s=P==="admin",n=s?`<tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
        <th style="padding: 0.5rem;">${e("dash_coach_roster_name")}</th>
        <th style="padding: 0.5rem;">${e("dash_coach_roster_age")}</th>
        <th style="padding: 0.5rem;">${e("dash_coach_roster_gender")}</th>
        <th style="padding: 0.5rem;">${e("dash_coach_roster_pmt1_amt")}</th>
        <th style="padding: 0.5rem;">${e("dash_coach_roster_pmt1_date")}</th>
        <th style="padding: 0.5rem;">${e("dash_coach_roster_pmt2_amt")}</th>
        <th style="padding: 0.5rem;">${e("dash_coach_roster_pmt2_date")}</th>
        <th style="padding: 0.5rem;">${e("dash_coach_roster_pmt3_amt")}</th>
        <th style="padding: 0.5rem;">${e("dash_coach_roster_pmt3_date")}</th>
      </tr>`:`<tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
        <th style="padding: 1rem;">${e("dash_coach_roster_name")}</th>
        <th style="padding: 1rem;">${e("dash_coach_roster_parent")}</th>
        <th style="padding: 1rem;">${e("dash_coach_roster_age")}</th>
        <th style="padding: 1rem;">${e("dash_coach_roster_gender")}</th>
        <th style="padding: 1rem;">${e("dash_coach_roster_usa_id")}</th>
      </tr>`;function a(d,i){const l=(d.payments||{})[y]||{};return l[i]!=null?l[i]:""}const o="width: 95%; padding: 0.3rem 0.35rem; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-primary); color: var(--text-primary); font-size: 0.75rem;";return`
    <div class="dash-panel">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.75rem;">
        <h3 class="dash-panel-title" style="margin-bottom: 0; border-bottom: none; padding-bottom: 0;">${e("dash_coach_roster_title")} (${t.length} athletes)</h3>
        ${pt(y)}
      </div>
      <div class="dash-panel-body">
        ${t.length===0?`<p class="dash-empty">${e("dash_coach_no_swimmers")}</p>`:`
        <div class="roster-table-wrapper" style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.8rem; min-width: ${s?"950px":"auto"};">
          <thead>${n}</thead>
          <tbody>
            ${t.map(d=>{const i=d.dob?Math.floor((new Date-new Date(d.dob))/315576e5):"—";return s?`
                  <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 0.4rem 0.5rem; font-weight: 500; white-space: nowrap;">${[d.firstName,d.lastName].filter(Boolean).join(" ")}</td>
                    <td style="padding: 0.4rem 0.5rem;">${i}</td>
                    <td style="padding: 0.4rem 0.5rem;">${d.gender||"—"}</td>
                    <td style="padding: 0.2rem 0.3rem;">
                      <input type="number" step="0.01" min="0"
                        class="roster-pmt-input"
                        data-reg-id="${d._regId}"
                        data-swimmer-index="${d._swimmerIndex}"
                        data-field="amount1"
                        data-season="${y}"
                        value="${a(d,"amount1")}"
                        onchange="window.__updateSwimmerPayment(this)"
                        placeholder="0.00"
                        style="${o}" />
                    </td>
                    <td style="padding: 0.2rem 0.3rem;">
                      <input type="date"
                        class="roster-pmt-input"
                        data-reg-id="${d._regId}"
                        data-swimmer-index="${d._swimmerIndex}"
                        data-field="date1"
                        data-season="${y}"
                        value="${a(d,"date1")}"
                        onchange="window.__updateSwimmerPayment(this)"
                        style="${o}" />
                    </td>
                    <td style="padding: 0.2rem 0.3rem;">
                      <input type="number" step="0.01" min="0"
                        class="roster-pmt-input"
                        data-reg-id="${d._regId}"
                        data-swimmer-index="${d._swimmerIndex}"
                        data-field="amount2"
                        data-season="${y}"
                        value="${a(d,"amount2")}"
                        onchange="window.__updateSwimmerPayment(this)"
                        placeholder="0.00"
                        style="${o}" />
                    </td>
                    <td style="padding: 0.2rem 0.3rem;">
                      <input type="date"
                        class="roster-pmt-input"
                        data-reg-id="${d._regId}"
                        data-swimmer-index="${d._swimmerIndex}"
                        data-field="date2"
                        data-season="${y}"
                        value="${a(d,"date2")}"
                        onchange="window.__updateSwimmerPayment(this)"
                        style="${o}" />
                    </td>
                    <td style="padding: 0.2rem 0.3rem;">
                      <input type="number" step="0.01" min="0"
                        class="roster-pmt-input"
                        data-reg-id="${d._regId}"
                        data-swimmer-index="${d._swimmerIndex}"
                        data-field="amount3"
                        data-season="${y}"
                        value="${a(d,"amount3")}"
                        onchange="window.__updateSwimmerPayment(this)"
                        placeholder="0.00"
                        style="${o}" />
                    </td>
                    <td style="padding: 0.2rem 0.3rem;">
                      <input type="date"
                        class="roster-pmt-input"
                        data-reg-id="${d._regId}"
                        data-swimmer-index="${d._swimmerIndex}"
                        data-field="date3"
                        data-season="${y}"
                        value="${a(d,"date3")}"
                        onchange="window.__updateSwimmerPayment(this)"
                        style="${o}" />
                    </td>
                  </tr>
                `:`
                  <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 1rem; font-weight: 500;">${[d.firstName,d.lastName].filter(Boolean).join(" ")}</td>
                    <td style="padding: 1rem;">${d.parentName}</td>
                    <td style="padding: 1rem;">${i}</td>
                    <td style="padding: 1rem;">${d.gender||"—"}</td>
                    <td style="padding: 1rem;">${d.usaSwimmingId||"—"}</td>
                  </tr>
                `}).join("")}
          </tbody>
        </table>
        </div>
        ${s?`<p class="roster-payment-note">${e("dash_coach_roster_payment_note")}</p>`:""}
        `}
      </div>
    </div>
  `}function Xe(t){const s=i=>(i||"").trim().toLowerCase().replace(/\s+/g," "),n=i=>(Number(i.balance)||0)+(Number(i.deposit1Amount)||0)+(Number(i.deposit2Amount)||0)+(Number(i.deposit3Amount)||0),a=new Map;for(const i of K){if(i.season&&i.season!==t)continue;const r=i.feeData;if(!(!r||!r.swimmers||r.swimmers.length===0))for(const l of r.swimmers){const u=s(l.name);if(!u)continue;const h=a.get(u),c=Number(l.total)||0;h?(h.totalFee+=c,h.meetCount+=1,h.meets.push({meetName:i.name||"Unnamed Meet",total:c}),l.name.trim().length>h.displayName.length&&(h.displayName=l.name.trim())):a.set(u,{displayName:l.name.trim(),totalFee:c,meetCount:1,meets:[{meetName:i.name||"Unnamed Meet",total:c}]})}}const o=new Map;for(const i of G){if(i.season&&i.season!==t)continue;const r=s(i.swimmerName);r&&o.set(r,{id:i.id,total:n(i)})}const d=[];for(const[i,r]of a){const l=o.get(i)||{id:null,total:0};d.push({normalizedName:i,displayName:r.displayName,totalFee:r.totalFee,deposit:l.total,depositId:l.id,balance:l.total-r.totalFee,meetCount:r.meetCount,meets:r.meets}),o.delete(i)}for(const[i,r]of o){const l=G.find(u=>s(u.swimmerName)===i&&u.season===t);d.push({normalizedName:i,displayName:l?l.swimmerName:i,totalFee:0,deposit:r.total,depositId:r.id,balance:r.total,meetCount:0,meets:[]})}return d.sort((i,r)=>i.balance<0&&r.balance>=0?-1:i.balance>=0&&r.balance<0?1:i.displayName.localeCompare(r.displayName)),d}function lt(){const t=Xe(y),s=t.reduce((i,r)=>i+r.totalFee,0),n=t.reduce((i,r)=>i+r.deposit,0),a=t.filter(i=>i.balance<0).length,o=i=>"$"+Number(i).toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2}),d=t.length>0;return`
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem;">
      ${$t(y)}
      <a class="btn btn-outline btn-sm" id="goto-deposits-link" style="text-decoration: none;">🏦 Manage Deposits</a>
      <button class="btn btn-outline btn-sm" id="fee-summary-export-btn">📥 Export CSV</button>
    </div>

    <div class="dash-stats-row">
      <div class="dash-stat-card">
        <div class="dash-stat-number">${t.length}</div>
        <div class="dash-stat-label">${e("dash_fee_summary_total_swimmers")}</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${o(s)}</div>
        <div class="dash-stat-label">${e("dash_fee_summary_total_fees")}</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${o(n)}</div>
        <div class="dash-stat-label">${e("dash_fee_summary_total_deposits")}</div>
      </div>
      <div class="dash-stat-card ${a>0?"accent":""}">
        <div class="dash-stat-number" style="${a>0?"color: var(--color-accent);":""}">${a}</div>
        <div class="dash-stat-label">${e("dash_fee_summary_negative_count")}</div>
      </div>
    </div>

    ${d?`
      <div class="dash-panel">
        <div class="fee-summary-table-wrapper">
          <table class="fee-summary-table">
            <thead>
              <tr>
                <th style="width: 28px;"></th>
                <th>${e("dash_fee_summary_name")}</th>
                <th>${e("dash_fee_summary_deposit")}</th>
                <th>${e("dash_fee_summary_total_fee")}</th>
                <th>${e("dash_fee_summary_meets")}</th>
                <th>${e("dash_fee_summary_balance")}</th>
              </tr>
            </thead>
            <tbody>
              ${t.map((i,r)=>`
                <tr class="fee-summary-main-row fee-summary-row ${i.balance<0?"fee-summary-negative":""}"
                    data-fee-index="${r}" ${i.meets&&i.meets.length>0?'title="Click to see meet details"':""}>
                  <td><span class="fee-summary-expand-icon">${i.meets&&i.meets.length>0?"▶":""}</span></td>
                  <td class="fee-summary-name">${z(i.displayName)}</td>
                  <td>${o(i.deposit)}</td>
                  <td>${o(i.totalFee)}</td>
                  <td>${i.meetCount}</td>
                  <td class="fee-summary-balance" style="font-weight: 700; ${i.balance<0?"color: var(--color-accent);":"color: #16A34A;"}">${o(i.balance)}</td>
                </tr>
                ${i.meets&&i.meets.length>0?`
                <tr class="fee-summary-detail-row" data-fee-detail="${r}">
                  <td colspan="6" class="fee-summary-detail-cell">
                    <table class="fee-summary-mini-table">
                      ${i.meets.map(l=>`
                        <tr>
                          <td class="mini-meet-name">${z(l.meetName)}</td>
                          <td class="mini-meet-fee">${o(l.total)}</td>
                        </tr>
                      `).join("")}
                      <tr class="mini-meet-total">
                        <td>${e("dash_fee_summary_total_fee")}</td>
                        <td class="mini-meet-fee">${o(i.totalFee)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                `:""}
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `:`
      <div class="dash-panel" style="text-align: center; padding: 3rem 2rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">📊</div>
        <p style="color: var(--text-secondary); max-width: 500px; margin: 0 auto;">${e("dash_fee_summary_no_fees")}</p>
      </div>
    `}
  `}function Ue(t){return G.filter(s=>s.season===t).sort((s,n)=>(s.swimmerName||"").localeCompare(n.swimmerName||""))}function Ve(t){return(Number(t.balance)||0)+(Number(t.deposit1Amount)||0)+(Number(t.deposit2Amount)||0)+(Number(t.deposit3Amount)||0)}function ct(){const t=Ue(y),s=o=>o!=null?"$"+Number(o).toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2}):"—",n=o=>o||"—",a=t.length>0;return`
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem;">
      ${mt(y)}
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <button class="btn btn-outline btn-sm" id="deposits-upload-balance-btn">📤 Upload Carry-over Balance</button>
        <button class="btn btn-outline btn-sm" id="deposits-upload-detail-btn">📤 Upload Deposits</button>
        <button class="btn btn-outline btn-sm" id="deposits-export-btn">📥 Export CSV</button>
      </div>
    </div>

    ${a?`
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
              ${t.map(o=>{const d=Ve(o);return`
                <tr id="${"dep-row-"+o.id}" class="deposits-row">
                  <td class="deposits-name">${z(o.swimmerName)}</td>
                  <td class="deposits-balance">
                    <span class="dep-view">${s(o.balance)}</span>
                    <input class="dep-edit-field dep-input" type="number" value="${o.balance||0}" step="0.01" style="display:none; width: 90px;" />
                  </td>
                  <td class="deposits-d1amt">
                    <span class="dep-view">${s(o.deposit1Amount)}</span>
                    <input class="dep-edit-field dep-input" type="number" value="${o.deposit1Amount||""}" step="0.01" style="display:none; width: 90px;" />
                  </td>
                  <td class="deposits-d1date">
                    <span class="dep-view">${n(o.deposit1Date)}</span>
                    <input class="dep-edit-field dep-input" type="date" value="${o.deposit1Date||""}" style="display:none; width: 130px;" />
                  </td>
                  <td class="deposits-d2amt">
                    <span class="dep-view">${s(o.deposit2Amount)}</span>
                    <input class="dep-edit-field dep-input" type="number" value="${o.deposit2Amount||""}" step="0.01" style="display:none; width: 90px;" />
                  </td>
                  <td class="deposits-d2date">
                    <span class="dep-view">${n(o.deposit2Date)}</span>
                    <input class="dep-edit-field dep-input" type="date" value="${o.deposit2Date||""}" style="display:none; width: 130px;" />
                  </td>
                  <td class="deposits-d3amt">
                    <span class="dep-view">${s(o.deposit3Amount)}</span>
                    <input class="dep-edit-field dep-input" type="number" value="${o.deposit3Amount||""}" step="0.01" style="display:none; width: 90px;" />
                  </td>
                  <td class="deposits-d3date">
                    <span class="dep-view">${n(o.deposit3Date)}</span>
                    <input class="dep-edit-field dep-input" type="date" value="${o.deposit3Date||""}" style="display:none; width: 130px;" />
                  </td>
                  <td class="deposits-total" style="font-weight: 700;">${s(d)}</td>
                  <td class="deposits-actions">
                    <button class="deposits-edit-btn" data-id="${o.id}">✎</button>
                    <button class="deposits-save-btn" data-id="${o.id}" style="display:none;">✓</button>
                    <button class="deposits-cancel-btn" data-id="${o.id}" style="display:none;">✕</button>
                    <button class="deposits-delete-btn" data-id="${o.id}" data-name="${z(o.swimmerName)}" style="color: var(--color-accent);">&times;</button>
                  </td>
                </tr>`}).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `:`
      <div class="dash-panel" style="text-align: center; padding: 3rem 2rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🏦</div>
        <p style="color: var(--text-secondary);">
          No deposit records for ${z(y)}.<br>
          Upload an Excel file or add swimmers below.
        </p>
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
  `}function mt(t){const s=ge(),n=t||y||ye();return`
    <div class="season-selector">
      <label class="season-selector-label">${e("dash_season_label")}:</label>
      <select id="deposits-season-select" class="season-select">
        ${s.map(a=>`<option value="${a}" ${a===n?"selected":""}>${a}</option>`).join("")}
      </select>
    </div>
  `}function pt(t){const s=ge(),n=t||y||ye();return`
    <div class="season-selector">
      <label class="season-selector-label">${e("dash_season_label")}:</label>
      <select id="roster-season-select" class="season-select">
        ${s.map(a=>`<option value="${a}" ${a===n?"selected":""}>${a}</option>`).join("")}
      </select>
    </div>
  `}async function ut(t){const s=window.XLSX;if(!s)return alert("Excel parser not loaded."),null;try{const n=await t.arrayBuffer(),a=s.read(new Uint8Array(n),{type:"array"}),o=a.Sheets[a.SheetNames[0]],d=s.utils.sheet_to_json(o,{header:1,defval:null});if(!d||d.length<2)return{valid:[],errors:[{rowNum:1,reason:"File has no data rows."}]};let i=-1,r=-1,l=-1;for(let c=0;c<Math.min(10,d.length);c++){const f=d[c];if(f){i=-1,r=-1;for(let g=0;g<f.length;g++){const _=String(f[g]||"").toLowerCase().trim();(_.includes("name")||_.includes("swimmer"))&&(i=g),_.includes("balance")&&(r=g)}if(i>=0&&r>=0){l=c;break}}}if(l<0)return{valid:[],errors:[{rowNum:0,reason:"Expected columns: Name, Balance."}]};const u=[],h=[];for(let c=l+1;c<d.length;c++){const f=d[c];if(!f||f.every(w=>w==null||String(w).trim()===""))continue;const g=String(f[i]||"").trim();if(!g){h.push({rowNum:c+1,reason:"Missing name."});continue}const _=Number(f[r]);if(isNaN(_)||_<0){h.push({rowNum:c+1,reason:`Invalid balance for "${g}": ${f[r]}`});continue}u.push({swimmerName:g,balance:_})}return{valid:u,errors:h}}catch(n){return console.error("Error parsing carry-over Excel:",n),null}}function ht(t,s,n){var o;const a=document.createElement("div");a.className="confirm-overlay",a.innerHTML=`
    <div class="confirm-modal csv-import-modal">
      <h3 class="confirm-title">Import Carry-over Balance</h3>
      <p class="csv-import-filename">File: <strong>${z(n)}</strong></p>
      <p class="csv-import-summary">${t.length} record(s), ${s.length} error(s)</p>
      <p style="font-size: 0.85rem; color: var(--color-accent); margin-bottom: 0.75rem;">⚠ This will <strong>overwrite</strong> existing balance values for matching swimmers in season <strong>${z(y)}</strong>.</p>
      ${t.length>0?`
        <div class="csv-preview-wrapper">
          <table class="csv-preview-table">
            <thead><tr><th>Name</th><th>Balance</th></tr></thead>
            <tbody>${t.map(d=>`<tr><td>${z(d.swimmerName)}</td><td>$${Number(d.balance).toLocaleString(void 0,{minimumFractionDigits:2})}</td></tr>`).join("")}</tbody>
          </table>
        </div>`:""}
      ${s.length>0?`<div class="csv-error-block"><p class="csv-error-title">Errors</p>${s.map(d=>`<p class="csv-error-item">Row ${d.rowNum}: ${z(d.reason)}</p>`).join("")}</div>`:""}
      ${t.length===0?'<p class="csv-no-valid">No valid records found.</p>':""}
      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="carryover-import-cancel">Cancel</button>
        ${t.length>0?'<button class="btn btn-primary btn-sm" id="carryover-import-confirm">Import</button>':""}
      </div>
    </div>`,document.body.appendChild(a),a.querySelector("#carryover-import-cancel").addEventListener("click",()=>a.remove()),(o=a.querySelector("#carryover-import-confirm"))==null||o.addEventListener("click",async()=>{a.remove(),await vt(t)}),a.addEventListener("click",d=>{d.target===a&&a.remove()})}async function vt(t){if(!t||t.length===0)return;const s=n=>(n||"").trim().toLowerCase().replace(/\s+/g," ");try{const n=De(b);for(const a of t){const o=G.find(d=>d.season===y&&s(d.swimmerName)===s(a.swimmerName));if(o)n.update(B(b,"deposits",o.id),{balance:Number(a.balance),updatedAt:new Date,updatedBy:(v==null?void 0:v.email)||"unknown"});else{const d=B(H(b,"deposits"));n.set(d,{swimmerName:a.swimmerName,season:y,balance:Number(a.balance),deposit1Amount:null,deposit1Date:null,deposit2Amount:null,deposit2Date:null,deposit3Amount:null,deposit3Date:null,updatedAt:new Date,updatedBy:(v==null?void 0:v.email)||"unknown"})}}await n.commit(),M(`Updated balance for ${t.length} swimmer(s) in ${y}.`)}catch(n){console.error("Carry-over import failed:",n),M("Failed to import: "+(n.message||""),!0)}}async function ft(t){const s=window.XLSX;if(!s)return alert("Excel parser not loaded."),null;try{const n=await t.arrayBuffer(),a=s.read(new Uint8Array(n),{type:"array"}),o=a.Sheets[a.SheetNames[0]],d=s.utils.sheet_to_json(o,{header:1,defval:null});if(!d||d.length<2)return{valid:[],errors:[{rowNum:1,reason:"File has no data rows."}]};let i=-1;const r={};let l=-1;for(let c=0;c<Math.min(10,d.length);c++){const f=d[c];if(!f)continue;let g=-1;const _={};for(let w=0;w<f.length;w++){const E=String(f[w]||"").toLowerCase().trim();E.includes("name")||E.includes("swimmer")?g=w:/deposit\s*1.*amount/i.test(E)||/d1\s*.*amt/i.test(E)?_.deposit1Amount=w:/deposit\s*1.*date/i.test(E)||/d1\s*.*date/i.test(E)?_.deposit1Date=w:/deposit\s*2.*amount/i.test(E)||/d2\s*.*amt/i.test(E)?_.deposit2Amount=w:/deposit\s*2.*date/i.test(E)||/d2\s*.*date/i.test(E)?_.deposit2Date=w:/deposit\s*3.*amount/i.test(E)||/d3\s*.*amt/i.test(E)?_.deposit3Amount=w:(/deposit\s*3.*date/i.test(E)||/d3\s*.*date/i.test(E))&&(_.deposit3Date=w)}if(g>=0){i=g,Object.assign(r,_),l=c;break}}if(l<0)return{valid:[],errors:[{rowNum:0,reason:'Expected a header row with "Name" column.'}]};const u=[],h=[];for(let c=l+1;c<d.length;c++){const f=d[c];if(!f||f.every(w=>w==null||String(w).trim()===""))continue;const g=String(f[i]||"").trim();if(!g){h.push({rowNum:c+1,reason:"Missing name."});continue}const _={swimmerName:g};for(const[w,E]of Object.entries(r))if(E>=0&&E<f.length){const O=f[E];w.includes("Amount")?_[w]=O!=null?Number(O):null:_[w]=O?String(O).trim():null}u.push(_)}return{valid:u,errors:h}}catch(n){return console.error("Error parsing deposit detail Excel:",n),null}}function yt(t,s,n){var o;const a=document.createElement("div");a.className="confirm-overlay",a.innerHTML=`
    <div class="confirm-modal csv-import-modal" style="max-width: 900px;">
      <h3 class="confirm-title">Import Deposit Details</h3>
      <p class="csv-import-filename">File: <strong>${z(n)}</strong></p>
      <p class="csv-import-summary">${t.length} record(s), ${s.length} error(s)</p>
      <p style="font-size: 0.85rem; color: var(--color-accent); margin-bottom: 0.75rem;">⚠ This will <strong>overwrite</strong> existing deposit fields for matching swimmers in season <strong>${z(y)}</strong>.</p>
      ${t.length>0?`
        <div class="csv-preview-wrapper" style="max-height: 350px;">
          <table class="csv-preview-table" style="font-size: 0.75rem;">
            <thead><tr><th>Name</th><th>D1 Amt</th><th>D1 Date</th><th>D2 Amt</th><th>D2 Date</th><th>D3 Amt</th><th>D3 Date</th></tr></thead>
            <tbody>${t.map(d=>`<tr>
              <td>${z(d.swimmerName)}</td>
              <td>${d.deposit1Amount!=null?"$"+Number(d.deposit1Amount).toFixed(2):"—"}</td>
              <td>${d.deposit1Date||"—"}</td>
              <td>${d.deposit2Amount!=null?"$"+Number(d.deposit2Amount).toFixed(2):"—"}</td>
              <td>${d.deposit2Date||"—"}</td>
              <td>${d.deposit3Amount!=null?"$"+Number(d.deposit3Amount).toFixed(2):"—"}</td>
              <td>${d.deposit3Date||"—"}</td>
            </tr>`).join("")}</tbody>
          </table>
        </div>`:""}
      ${s.length>0?`<div class="csv-error-block"><p class="csv-error-title">Errors</p>${s.map(d=>`<p class="csv-error-item">Row ${d.rowNum}: ${z(d.reason)}</p>`).join("")}</div>`:""}
      ${t.length===0?'<p class="csv-no-valid">No valid records found.</p>':""}
      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="detail-import-cancel">Cancel</button>
        ${t.length>0?'<button class="btn btn-primary btn-sm" id="detail-import-confirm">Import</button>':""}
      </div>
    </div>`,document.body.appendChild(a),a.querySelector("#detail-import-cancel").addEventListener("click",()=>a.remove()),(o=a.querySelector("#detail-import-confirm"))==null||o.addEventListener("click",async()=>{a.remove(),await gt(t)}),a.addEventListener("click",d=>{d.target===a&&a.remove()})}async function gt(t){if(!t||t.length===0)return;const s=n=>(n||"").trim().toLowerCase().replace(/\s+/g," ");try{const n=De(b);for(const a of t){const o=G.find(i=>i.season===y&&s(i.swimmerName)===s(a.swimmerName)),d={updatedAt:new Date,updatedBy:(v==null?void 0:v.email)||"unknown"};if("deposit1Amount"in a&&(d.deposit1Amount=a.deposit1Amount),"deposit1Date"in a&&(d.deposit1Date=a.deposit1Date),"deposit2Amount"in a&&(d.deposit2Amount=a.deposit2Amount),"deposit2Date"in a&&(d.deposit2Date=a.deposit2Date),"deposit3Amount"in a&&(d.deposit3Amount=a.deposit3Amount),"deposit3Date"in a&&(d.deposit3Date=a.deposit3Date),o)n.update(B(b,"deposits",o.id),d);else{const i=B(H(b,"deposits"));n.set(i,{swimmerName:a.swimmerName,season:y,balance:0,deposit1Amount:null,deposit1Date:null,deposit2Amount:null,deposit2Date:null,deposit3Amount:null,deposit3Date:null,...d})}}await n.commit(),M(`Updated deposit details for ${t.length} swimmer(s) in ${y}.`)}catch(n){console.error("Deposit detail import failed:",n),M("Failed to import: "+(n.message||""),!0)}}function bt(){document.querySelectorAll(".deposits-edit-btn").forEach(t=>{t.addEventListener("click",()=>{const s=t.closest("tr");Ne(s,!0)})}),document.querySelectorAll(".deposits-save-btn").forEach(t=>{t.addEventListener("click",async()=>{const s=t.dataset.id,n=t.closest("tr");if(!s||!n)return;const a=c=>{const f=n.querySelector(c);return f?f.value:null},o=parseFloat(a(".deposits-balance .dep-edit-field"))||0,d=a(".deposits-d1amt .dep-edit-field"),i=a(".deposits-d1date .dep-edit-field"),r=a(".deposits-d2amt .dep-edit-field"),l=a(".deposits-d2date .dep-edit-field"),u=a(".deposits-d3amt .dep-edit-field"),h=a(".deposits-d3date .dep-edit-field");try{await X(B(b,"deposits",s),{balance:o,deposit1Amount:d?parseFloat(d):null,deposit1Date:i||null,deposit2Amount:r?parseFloat(r):null,deposit2Date:l||null,deposit3Amount:u?parseFloat(u):null,deposit3Date:h||null,updatedAt:new Date,updatedBy:(v==null?void 0:v.email)||"unknown"})}catch(c){console.error("Error saving deposit:",c),alert("Failed to save deposit.")}})}),document.querySelectorAll(".deposits-cancel-btn").forEach(t=>{t.addEventListener("click",()=>{const s=t.closest("tr");Ne(s,!1)})}),document.querySelectorAll(".deposits-delete-btn").forEach(t=>{t.addEventListener("click",async()=>{const s=t.dataset.id,n=t.dataset.name;if(s&&confirm(`Delete deposit record for ${n}?`))try{await $e(B(b,"deposits",s))}catch(a){console.error("Error deleting deposit:",a),alert("Failed to delete deposit.")}})})}function Ne(t,s){if(!t)return;const n=t.querySelectorAll(".dep-view"),a=t.querySelectorAll(".dep-edit-field"),o=t.querySelector(".deposits-edit-btn"),d=t.querySelector(".deposits-save-btn"),i=t.querySelector(".deposits-cancel-btn"),r=t.querySelector(".deposits-delete-btn");n.forEach(l=>l.style.display=s?"none":""),a.forEach(l=>l.style.display=s?"":"none"),o&&(o.style.display=s?"none":""),d&&(d.style.display=s?"":"none"),i&&(i.style.display=s?"":"none"),r&&(r.style.display=s?"none":"")}function _t(){const t=Ue(y),s=["Name","Balance","Deposit 1 Amount","Deposit 1 Date","Deposit 2 Amount","Deposit 2 Date","Deposit 3 Amount","Deposit 3 Date","Total"],n=t.map(l=>[l.swimmerName||"",l.balance||0,l.deposit1Amount||"",l.deposit1Date||"",l.deposit2Amount||"",l.deposit2Date||"",l.deposit3Amount||"",l.deposit3Date||"",Ve(l)]),a=l=>'"'+String(l).replace(/"/g,'""')+'"',o=[s.map(a).join(","),...n.map(l=>l.map(a).join(","))].join(`
`),d=new Blob([o],{type:"text/csv;charset=utf-8;"}),i=URL.createObjectURL(d),r=document.createElement("a");r.href=i,r.download=`dragon-deposits-${y}.csv`,document.body.appendChild(r),r.click(),document.body.removeChild(r),URL.revokeObjectURL(i)}function wt(){const t=Xe(y),s=["Swimmer","Deposit","Total Meet Fee","Meets","Balance"],n=t.map(l=>[l.displayName,l.deposit,l.totalFee,l.meetCount,l.balance]),a=l=>'"'+String(l).replace(/"/g,'""')+'"',o=[s.map(a).join(","),...n.map(l=>l.map(a).join(","))].join(`
`),d=new Blob([o],{type:"text/csv;charset=utf-8;"}),i=URL.createObjectURL(d),r=document.createElement("a");r.href=i,r.download=`dragon-fee-summary-${y}.csv`,document.body.appendChild(r),r.click(),document.body.removeChild(r),URL.revokeObjectURL(i)}function z(t){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function ye(){const t=new Date,s=t.getFullYear();return t.getMonth()+1>=9?`${s}-${s+1}`:`${s-1}-${s}`}function ge(){const t=new Set;for(const o of K)o.season&&t.add(o.season);for(const o of G)o.season&&t.add(o.season);const s=new Date,n=s.getMonth()>=8?s.getFullYear():s.getFullYear()-1,a=2025;for(let o=Math.max(a,n-1);o<=n+2;o++)t.add(`${o}-${o+1}`);return Array.from(t).sort().reverse()}function $t(t){const s=ge(),n=t||y||ye();return`
    <div class="season-selector">
      <label class="season-selector-label">${e("dash_season_label")}:</label>
      <select id="season-select" class="season-select">
        ${s.map(a=>`<option value="${a}" ${a===n?"selected":""}>${a}</option>`).join("")}
      </select>
    </div>
  `}window.__updateSwimmerPayment=async function(t){var r,l;if(P!=="admin"){console.warn("Non-admin attempted to modify payment field — blocked"),N();return}const s=t.dataset.regId,n=parseInt(t.dataset.swimmerIndex),a=t.dataset.field,o=t.dataset.season||y;let d=t.value;a.startsWith("amount")?(d=d===""?null:parseFloat(d),d!=null&&(isNaN(d)||d<0)&&(d=null)):a.startsWith("date")&&(d=d||null);const i=ae.find(u=>u.id===s);if((r=i==null?void 0:i.swimmers)!=null&&r[n]){const u=i.swimmers[n],h={...u.payments||{}},c={...h[o]||{}};c[a]=d,h[o]=c,i.swimmers[n]={...u,payments:h}}try{const u=B(b,"registrations",s),h=await pe(u);if(!h.exists())return;const c=[...h.data().swimmers];if(c[n]){const f=c[n],g={...f.payments||{}},_={...g[o]||{}};_[a]=d,g[o]=_,c[n]={...f,payments:g},await X(u,{swimmers:c})}}catch(u){console.error("Error updating swimmer payment field:",u);const h=ae.find(c=>c.id===s);if((l=h==null?void 0:h.swimmers)!=null&&l[n]){const c=await pe(B(b,"registrations",s));c.exists()&&(h.swimmers[n]={...c.data().swimmers[n]})}N()}};function Et(){const t=_e.filter(a=>a.status!=="Completed").length,s=_e.filter(a=>a.status==="Completed").length,n=K.filter(a=>a.status!=="Completed").length;return`
    <div class="dash-stats-row">
      <div class="dash-stat-card">
        <div class="dash-stat-number">${_e.length}</div>
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
          ${K.filter(a=>a.status!=="Completed").map(a=>xt(a)).join("")}
        </div>
      </div>
    </div>

    <div class="dash-panel">
      <h3 class="dash-panel-title">${e("dash_swimmer_today_practice")}</h3>
      <div class="dash-panel-body">
        ${Dt()}
      </div>
    </div>
  `}function xt(t){const s=t.status||"Open",n=t.startDate&&t.endDate?`${t.startDate} – ${t.endDate}`:t.date||"";return`
    <div class="dash-mini-card">
      <div class="dash-mini-top">
        <span class="dash-mini-name">${t.name||"Untitled Meet"}</span>
        <span class="status-badge status-${s.toLowerCase().replace(" ","-")}">${s}</span>
      </div>
      <div class="dash-mini-meta">${n} · ${t.location||""}</div>
    </div>
  `}function Dt(){const t=new Date().getDay(),s=J(t),n=Se.filter(a=>a.day===s);return n.length===0?`<p class="dash-empty">${e("dash_swimmer_rest_day")} (${s}). Rest day! 🎉</p>`:n.map(a=>`
    <div class="dash-mini-card">
      <div class="dash-mini-top">
        <span class="dash-mini-name">${a.startTime} – ${a.endTime}</span>
      </div>
      <div class="dash-mini-meta">${a.location||""}</div>
    </div>
  `).join("")}function St(){if(!x)return`<div class="dash-panel" style="text-align: center; padding: 3rem;">
      <p class="dash-empty">${e("dash_profile_no_reg")}</p>
      <p style="margin-top: 1rem;"><a href="/registration.html" class="btn btn-primary">${e("dash_profile_complete_reg")}</a></p>
    </div>`;const t=x.parent||{},s=x.spouse,n=x.swimmers||[],a=x.emergencyContact||{};return`
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
              <input class="form-input profile-input profile-edit-field" id="edit-spouse-email" value="${s.email||""}" readonly
                title="Spouse email is used for login access and cannot be changed here." />
              <p class="profile-edit-field" style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">Spouse email is tied to login access. Contact admin@dragonswim.com if you need to change it.</p>
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
          ${n.filter(o=>!o.deleted).length===0?`<p class="dash-empty">${e("dash_profile_no_swimmers")}</p>`:n.map((o,d)=>o.deleted?"":`

            <div class="swimmer-profile-card">
              <div class="swimmer-profile-info">
                <strong>${[o.firstName,o.middleName,o.lastName].filter(Boolean).join(" ")}</strong>
                <div class="swimmer-profile-meta">
                  <span>${o.gender||"—"}</span>
                  <span>DOB: ${o.dob||"—"}</span>
                  ${o.usaSwimmingId?`<span>USA ID: ${o.usaSwimmingId}</span>`:""}
                  ${o.joinDate?`<span>Joined: ${o.joinDate}</span>`:""}
                </div>
              </div>
              <button class="btn btn-outline btn-sm delete-swimmer-btn" data-index="${d}" style="color: var(--color-accent); border-color: var(--color-accent);">${e("dash_profile_remove")}</button>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `}function It(){return`
    <div class="dash-panel" style="text-align: center; padding: 4rem 2rem;">
      <div style="font-size: 3rem; margin-bottom: 1rem;">🚧</div>
      <h2 style="font-size: 1.5rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem;">${e("dash_plans_under_construction")}</h2>
      <p style="color: var(--text-secondary);">${e("dash_swimmer_plans_sub")}</p>
    </div>
  `}function Ae(){const t=P==="admin";return`
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
          <select id="meet-season" class="form-input">
            ${ge().map(s=>`<option value="${s}" ${s===y?"selected":""}>${s}</option>`).join("")}
          </select>
        </div>
        <div style="margin-top: 1rem; display: flex; gap: 1rem;">
          <button class="btn btn-primary btn-sm" id="save-meet-btn">${e("dash_meets_save")}</button>
          <button class="btn btn-outline btn-sm" id="cancel-meet-btn">${e("dash_meets_cancel")}</button>
        </div>
      </div>
    `:""}

    <div class="dash-cards-grid">
      ${K.length===0?`<p class="dash-empty">${e("dash_meets_no_meets")}</p>`:K.map(s=>`
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
              ${t?`<button class="btn btn-outline btn-sm meet-fee-btn" data-id="${s.id}" data-name="${s.name||""}">${e("dash_meets_fee")}</button>`:""}
              ${t?`<button class="btn btn-outline btn-sm edit-meet" data-id="${s.id}" data-name="${s.name||""}" data-start="${s.startDate||s.date||""}" data-end="${s.endDate||s.date||""}" data-location="${s.location||""}" data-season="${s.season||y}">${e("dash_meets_edit")}</button>`:""}
              ${t?`<button class="btn btn-outline btn-sm delete-meet" data-id="${s.id}" style="color: var(--color-accent); border-color: var(--color-accent);">${e("dash_meets_delete")}</button>`:""}
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `}function Fe(){const t=P==="admin";[0,1,2,3,4,5,6].map(n=>J(n));const s=[1,2,3,4,5,6,0];return`
    <div class="dash-section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2 style="font-size: 1.5rem; font-weight: 600; color: var(--text-primary);">${e("dash_schedule_weekly")}</h2>
      ${t?`<button class="btn btn-primary btn-sm" id="add-session-btn">${e("dash_schedule_add")}</button><button class="btn btn-outline btn-sm" id="import-csv-btn">${e("dash_schedule_import_csv")}</button>`:""}
    </div>

    ${t?`
      <div id="add-session-form" class="dash-panel" style="display: none; margin-bottom: 2rem; padding: 1.5rem;">
        <h3 style="margin-bottom: 1rem;" id="session-form-title">${e("dash_schedule_new_title")}</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem;">
          <select id="session-day" class="form-input">
            ${s.map(n=>`<option value="${J(n)}">${J(n)}</option>`).join("")}
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
      ${s.map(n=>{const a=J(n),o=Se.filter(d=>d.day===a);return`
          <div class="dash-schedule-day">
            <h3 class="dash-schedule-day-name">${a}</h3>
            ${o.length===0?`<p class="dash-empty-sm">${e("dash_schedule_no_practice")}</p>`:o.map(d=>`
                <div class="dash-schedule-item">
                  <div class="dash-schedule-time">${d.startTime} – ${d.endTime}</div>
                  <div class="dash-schedule-focus">${d.location||""}</div>
                  <div class="dash-schedule-meta" style="display: flex; justify-content: flex-end; align-items: center; gap: 8px;">
                    ${t?`
                      <button class="edit-session" data-id="${d.id}" data-day="${d.day}" data-start="${d.startTime||""}" data-end="${d.endTime||""}" data-location="${d.location||""}" style="background: none; border: none; font-size: 1rem; cursor: pointer; color: var(--color-primary); padding: 0 5px;" title="Edit">✎</button>
                      <button class="delete-session" data-id="${d.id}" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--color-accent); padding: 0 5px;" title="Delete">&times;</button>
                    `:""}
                  </div>
                </div>
              `).join("")}
          </div>
        `}).join("")}
    </div>
  `}function kt(t,s){const n=document.createElement("div");n.className="confirm-overlay",n.innerHTML=`
    <div class="confirm-modal">
      <h3 class="confirm-title">${e("dash_profile_delete_title")}</h3>
      <p class="confirm-body">${e("dash_profile_delete_body1")} <strong style="color: var(--color-accent, #dc3545);">${t}</strong> ${e("dash_profile_delete_body2")}</p>
      <p class="confirm-warning">${e("dash_profile_delete_warning")}</p>
      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="confirm-cancel">${e("dash_profile_delete_cancel")}</button>
        <button class="btn btn-sm" id="confirm-delete" style="background: var(--color-accent, #dc3545); color: white; border: none;">${e("dash_profile_delete_confirm")}</button>
      </div>
    </div>
  `,document.body.appendChild(n),n.querySelector("#confirm-cancel").addEventListener("click",()=>n.remove()),n.querySelector("#confirm-delete").addEventListener("click",async()=>{n.remove();const a=[...x.swimmers];a[s]={...a[s],deleted:!0,deletedAt:new Date().toISOString()};try{await X(B(b,"registrations",Q),{swimmers:a}),x.swimmers=a,k="profile",N()}catch(o){console.error("Error marking swimmer deleted:",o),alert(e("dash_profile_save_failed"))}}),n.addEventListener("click",a=>{a.target===n&&n.remove()})}function Bt(){const t=document.createElement("div");t.className="confirm-overlay",t.innerHTML=`
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
  `,document.body.appendChild(t);const s=t.querySelector("#modal-password-msg");t.querySelector("#modal-password-cancel").addEventListener("click",()=>t.remove()),t.querySelector("#modal-password-submit").addEventListener("click",async()=>{const n=t.querySelector("#modal-current-password").value,a=t.querySelector("#modal-new-password").value,o=t.querySelector("#modal-confirm-password").value;if(s.style.display="none",!n||!a||!o){s.textContent="All fields are required.",s.style.color="var(--color-accent, #DC2626)",s.style.display="block";return}if(a!==o){s.textContent=e("dash_profile_password_mismatch"),s.style.color="var(--color-accent, #DC2626)",s.style.display="block";return}if(a.length<6){s.textContent="Password must be at least 6 characters.",s.style.color="var(--color-accent, #DC2626)",s.style.display="block";return}try{const d=je.credential(v.email,n);await Te(v,d),await Me(v,a),s.textContent=e("dash_profile_password_success"),s.style.color="#16A34A",s.style.display="block",t.querySelector("#modal-current-password").value="",t.querySelector("#modal-new-password").value="",t.querySelector("#modal-confirm-password").value=""}catch(d){console.error("Password update error:",d),d.code==="auth/wrong-password"||d.code==="auth/invalid-credential"?s.textContent=e("dash_profile_password_wrong"):s.textContent=e("dash_profile_password_error")+" "+(d.message||""),s.style.color="var(--color-accent, #DC2626)",s.style.display="block"}}),t.addEventListener("click",n=>{n.target===t&&t.remove()})}function qe(t){const s=[];let n="",a=!1;for(let o=0;o<t.length;o++){const d=t[o];d==='"'?a=!a:d===","&&!a?(s.push(n.trim()),n=""):n+=d}return s.push(n.trim()),s.length>0&&s[0].charCodeAt(0)===65279&&(s[0]=s[0].slice(1)),s}function Ct(t){const n=t.split(/\r?\n/).filter(d=>d.trim().length>0);if(n.length===0)return{headers:[],rows:[]};const a=qe(n[0]),o=n.slice(1).map(d=>qe(d));return{headers:a,rows:o}}function Lt(t,s){if(!t||t.length<4)return{valid:!1,reason:e("dash_csv_error_too_few_cols"),rowNum:s};const[n,a,o,d]=t.map(u=>(u||"").trim());if(!n)return{valid:!1,reason:e("dash_csv_error_missing_day"),rowNum:s};const i=n.toLowerCase(),r=[0,1,2,3,4,5,6].find(u=>J(u).toLowerCase()===i);if(r===void 0)return{valid:!1,reason:e("dash_csv_error_invalid_day",{day:n}),rowNum:s};const l=J(r);return a?/^\d{1,2}:\d{2}\s*(AM|PM)?$/i.test(a)?o?/^\d{1,2}:\d{2}\s*(AM|PM)?$/i.test(o)?{valid:!0,day:l,startTime:a,endTime:o,location:d||"",rowNum:s}:{valid:!1,reason:e("dash_csv_error_invalid_time",{field:"EndTime",value:o}),rowNum:s}:{valid:!1,reason:e("dash_csv_error_missing_end"),rowNum:s}:{valid:!1,reason:e("dash_csv_error_invalid_time",{field:"StartTime",value:a}),rowNum:s}:{valid:!1,reason:e("dash_csv_error_missing_start"),rowNum:s}}function M(t,s){const n=document.getElementById("csv-import-status");n&&n.remove();const a=document.createElement("div");a.id="csv-import-status",a.style.cssText=["padding: var(--space-md) var(--space-lg)","border-radius: var(--radius-md)","margin-bottom: var(--space-lg)","font-size: var(--fs-sm)","font-weight: var(--fw-medium)",s?"background: #fef2f2; border: 1px solid #fee2e2; color: #991b1b":"background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534"].join(";"),a.textContent=t;const o=document.querySelector(".dash-content");o&&o.insertBefore(a,o.firstChild),setTimeout(()=>a.remove(),8e3)}async function Nt(t){var h;const s=(h=t.target.files)==null?void 0:h[0];if(t.target.remove(),!s)return;if(!s.name.toLowerCase().endsWith(".csv")){M(e("dash_csv_error_not_csv"),!0);return}if(s.size>5e5){M(e("dash_csv_error_too_large"),!0);return}let n;try{n=await s.text()}catch(c){console.error("Error reading CSV file:",c),M(e("dash_csv_error_unknown"),!0);return}if(!n||n.trim().length===0){M(e("dash_csv_error_empty"),!0);return}const{headers:a,rows:o}=Ct(n),d=["day","starttime","endtime","location"],i=a.map(c=>c.replace(/\s/g,"").toLowerCase());if(!d.every(c=>i.includes(c))||a.length<4){M(e("dash_csv_error_bad_header"),!0);return}const l=[],u=[];o.forEach((c,f)=>{const g=Lt(c,f+2);g.valid?l.push({day:g.day,startTime:g.startTime,endTime:g.endTime,location:g.location||""}):u.push({rowNum:g.rowNum,reason:g.reason})}),At(l,u,s.name)}function At(t,s,n){var l;const a=n.replace(/</g,"&lt;").replace(/>/g,"&gt;"),o=t.length,d=s.length,i=u=>u.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),r=document.createElement("div");r.className="confirm-overlay",r.innerHTML=`
    <div class="confirm-modal csv-import-modal">
      <h3 class="confirm-title">${e("dash_csv_import_title")}</h3>
      <p class="csv-import-filename">${e("dash_csv_import_file")}: <strong>${a}</strong></p>
      <p class="csv-import-summary">${e("dash_csv_import_summary",{valid:String(o),error:String(d)})}</p>
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
              ${t.map(u=>`
                <tr>
                  <td>${i(u.day)}</td>
                  <td>${i(u.startTime)}</td>
                  <td>${i(u.endTime)}</td>
                  <td>${i(u.location||"")}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `:""}
      ${s.length>0?`
        <div class="csv-error-block">
          <p class="csv-error-title">${e("dash_csv_import_errors")}</p>
          ${s.map(u=>`<p class="csv-error-item">${e("dash_csv_import_row")} ${u.rowNum}: ${i(u.reason)}</p>`).join("")}
        </div>
      `:""}
      ${t.length===0?`
        <p class="csv-no-valid">${e("dash_csv_import_no_valid")}</p>
      `:""}
      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="csv-import-cancel">${e("dash_csv_import_cancel")}</button>
        ${t.length>0?`<button class="btn btn-primary btn-sm" id="csv-import-confirm">${e("dash_csv_import_confirm",{count:String(o)})}</button>`:""}
      </div>
    </div>
  `,document.body.appendChild(r),r.querySelector("#csv-import-cancel").addEventListener("click",()=>r.remove()),(l=r.querySelector("#csv-import-confirm"))==null||l.addEventListener("click",async()=>{r.remove(),await Ft(t)}),r.addEventListener("click",u=>{u.target===r&&r.remove()})}async function Ft(t){if(!t||t.length===0)return;const s=document.getElementById("csv-import-status");s&&s.remove();try{const n=De(b),a=H(b,"schedules");t.forEach(o=>{const d=B(a);n.set(d,{day:o.day,startTime:o.startTime,endTime:o.endTime,location:o.location||"",createdAt:new Date})}),await n.commit(),M(e("dash_csv_import_success",{count:String(t.length)}))}catch(n){console.error("CSV import batch write failed:",n),n.code==="permission-denied"?M(e("dash_csv_error_permission"),!0):n.code==="unavailable"?M(e("dash_csv_error_network"),!0):M(e("dash_csv_error_unknown")+" "+(n.message||""),!0)}}async function qt(t){var r,l,u,h,c,f,g,_,w,E,O,ne,de,oe,ie,re,le;const s=window.XLSX;if(!s)return alert("Excel parser not loaded. Please refresh the page."),null;const n=await t.arrayBuffer(),a=s.read(new Uint8Array(n),{type:"array"}),o=a.SheetNames[0],d=a.Sheets[o],i=s.utils.sheet_to_json(d,{header:1,defval:null});try{const Z=((r=i[5])==null?void 0:r[0])||"Unknown Meet",ue=((l=i[7])==null?void 0:l[9])||0,he=((u=i[7])==null?void 0:u[36])||0;let U=-1;for(let S=8;S<i.length;S++)if(i[S]&&i[S][1]==="Name"){U=S+2;break}U<0&&(U=11);const ce=[];for(let S=U;S<i.length;S+=2){const m=(h=i[S])==null?void 0:h[1];if(!m||typeof m!="string")break;const I=m.match(/^(.+?)\s*\((\d+)\)\s*$/),L=I?I[1].trim():m.trim(),q=I?parseInt(I[2],10):null,D=((c=i[S])==null?void 0:c[17])||0,A=((f=i[S])==null?void 0:f[23])||0,V=((g=i[S])==null?void 0:g[29])||0,ee=((_=i[S])==null?void 0:_[38])||0;ce.push({name:L,age:q,individualEvents:D,individualFee:A,relayFee:V,total:ee})}let j=-1;for(let S=U;S<i.length;S++)if(i[S]&&i[S][9]==="Team Totals"){j=S;break}let R={individualEntries:0,individualFee:0,relayEntries:0,relayFee:0,swimmerSurcharge:{count:0,fee:0},teamSurcharge:0,facilitySurcharge:0,total:0};return j>0&&(R.individualEntries=((w=i[j+1])==null?void 0:w[15])||0,R.individualFee=((E=i[j+1])==null?void 0:E[21])||0,R.relayEntries=((O=i[j+2])==null?void 0:O[15])||0,R.relayFee=((ne=i[j+2])==null?void 0:ne[21])||0,R.swimmerSurcharge={count:((de=i[j+3])==null?void 0:de[15])||0,fee:((oe=i[j+3])==null?void 0:oe[21])||0},R.teamSurcharge=((ie=i[j+4])==null?void 0:ie[21])||0,R.facilitySurcharge=((re=i[j+5])==null?void 0:re[21])||0,R.total=((le=i[j+6])==null?void 0:le[21])||0),{fileName:t.name,meetName:Z,setupFees:{individualEventFee:ue,swimmerSurcharge:he},swimmers:ce,summary:R,uploadedAt:new Date,uploadedBy:(v==null?void 0:v.email)||"unknown"}}catch(Z){return console.error("Error parsing Hy-Tek report:",Z),null}}function jt(t,s,n){const a=n&&n.swimmers&&n.swimmers.length>0;let o="";if(a){const d=n.summary;o+=`
      <div class="fee-summary-grid">
        <div class="fee-summary-card">
          <div class="fee-summary-label">Individual Entries</div>
          <div class="fee-summary-value">${d.individualEntries} events</div>
          <div class="fee-summary-sub">$${d.individualFee.toLocaleString()}</div>
        </div>
        <div class="fee-summary-card">
          <div class="fee-summary-label">Relay Entries</div>
          <div class="fee-summary-value">${d.relayEntries} entries</div>
          <div class="fee-summary-sub">$${d.relayFee.toLocaleString()}</div>
        </div>
        <div class="fee-summary-card">
          <div class="fee-summary-label">Swimmer Surcharge</div>
          <div class="fee-summary-value">${d.swimmerSurcharge.count} swimmers</div>
          <div class="fee-summary-sub">$${d.swimmerSurcharge.fee.toLocaleString()}</div>
        </div>
        <div class="fee-summary-card fee-summary-total">
          <div class="fee-summary-label">${e("dash_meets_fee_summary_total")}</div>
          <div class="fee-summary-value" style="font-size: 1.5rem; font-weight: 700;">$${d.total.toLocaleString()}</div>
        </div>
      </div>

      <div class="fee-table-wrapper">
        <table class="fee-table">
          <thead>
            <tr>
              <th>${e("dash_meets_fee_name")}</th>
              <th>${e("dash_meets_fee_age")}</th>
              <th>${e("dash_meets_fee_events")}</th>
              <th>${e("dash_meets_fee_indiv_fee")}</th>
              <th>${e("dash_meets_fee_relay_fee")}</th>
              <th>${e("dash_meets_fee_total")}</th>
            </tr>
          </thead>
          <tbody>
            ${n.swimmers.map(i=>`
              <tr>
                <td>${i.name}</td>
                <td>${i.age!=null?i.age:"—"}</td>
                <td>${i.individualEvents}</td>
                <td>$${i.individualFee.toLocaleString()}</td>
                <td>$${i.relayFee.toLocaleString()}</td>
                <td><strong>$${i.total.toLocaleString()}</strong></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>

      <div class="fee-meta">
        ${e("dash_meets_fee_uploaded_by")}: <strong>${n.uploadedBy||"—"}</strong>
        ${n.uploadedAt?` &mdash; ${new Date(n.uploadedAt.seconds?n.uploadedAt.seconds*1e3:n.uploadedAt).toLocaleString()}`:""}
      </div>
    `}else o=`<div class="fee-empty">${e("dash_meets_fee_no_data")}</div>`;return`
    <div class="fee-modal-overlay" id="fee-modal-overlay">
      <div class="fee-modal">
        <div class="fee-modal-header">
          <h2>${e("dash_meets_fee_title")}: ${s}</h2>
          <button class="fee-modal-close" id="fee-modal-close" title="${e("dash_meets_fee_close")}">&times;</button>
        </div>
        <div class="fee-modal-body" id="fee-modal-body">
          ${o}
        </div>
        <div class="fee-modal-footer">
          ${a?`<p class="fee-overwrite-hint">${e("dash_meets_fee_upload_overwrite")}</p>`:""}
          <input type="file" id="fee-file-input" accept=".xls,.xlsx" style="display:none;">
          <button class="btn btn-primary btn-sm" id="fee-upload-btn">${e("dash_meets_fee_upload")}</button>
          ${a?`<button class="btn btn-outline btn-sm" id="fee-delete-btn" style="color: var(--color-accent); border-color: var(--color-accent);">${e("dash_meets_fee_delete")}</button>`:""}
        </div>
      </div>
    </div>
  `}async function Ee(t,s){let n=null;try{const c=await pe(B(b,"meets",t));c.exists()&&(n=c.data().feeData||null)}catch(c){console.error("Error fetching meet for fee modal:",c)}const a=document.getElementById("fee-modal-overlay");a&&a.remove();const o=document.createElement("div");o.id="fee-modal-container",o.innerHTML=jt(t,s,n),document.body.appendChild(o);const d=document.getElementById("fee-modal-overlay"),i=document.getElementById("fee-modal-close"),r=document.getElementById("fee-upload-btn"),l=document.getElementById("fee-file-input"),u=document.getElementById("fee-delete-btn"),h=()=>{d==null||d.remove(),o.remove()};i==null||i.addEventListener("click",h),d==null||d.addEventListener("click",c=>{c.target===d&&h()}),r==null||r.addEventListener("click",()=>{l==null||l.click()}),l==null||l.addEventListener("change",async c=>{var w;const f=(w=c.target.files)==null?void 0:w[0];if(!f)return;const g=f.name.split(".").pop().toLowerCase();if(!["xls","xlsx"].includes(g)){alert(e("dash_meets_fee_parse_error"));return}const _=await qt(f);if(!_){alert(e("dash_meets_fee_parse_error"));return}try{await X(B(b,"meets",t),{feeData:_}),h(),Ee(t,s)}catch(E){console.error("Error uploading fee data:",E),alert("Failed to upload fee data. Please try again.")}}),u==null||u.addEventListener("click",async()=>{if(confirm(e("dash_meets_fee_delete_confirm")))try{await X(B(b,"meets",t),{feeData:null}),h(),Ee(t,s)}catch(c){console.error("Error deleting fee data:",c),alert("Failed to delete fee data. Please try again.")}})}function We(){var o,d,i,r,l,u,h,c,f,g,_,w,E,O,ne,de,oe,ie,re,le,Z,ue,he,U,ce,j,R,S;document.querySelectorAll(".dash-nav-item[data-tab]").forEach(m=>{m.addEventListener("click",()=>{k=m.dataset.tab,N()})}),(o=document.getElementById("dash-theme-toggle"))==null||o.addEventListener("click",()=>{Je(),N()});const t=document.getElementById("dash-hamburger"),s=document.getElementById("dash-sidebar");t==null||t.addEventListener("click",()=>{s.classList.toggle("open")}),(d=document.getElementById("sidebar-signout"))==null||d.addEventListener("click",async()=>{try{await Ie(we),window.location.href="/signin.html"}catch(m){console.error("Error signing out:",m)}});const n=document.getElementById("user-trigger"),a=document.getElementById("user-dropdown");if(n==null||n.addEventListener("click",m=>{m.stopPropagation(),a.style.display=a.style.display==="none"?"block":"none"}),document.addEventListener("click",()=>{a&&(a.style.display="none")}),(i=document.getElementById("menu-profile"))==null||i.addEventListener("click",()=>{k="profile",a.style.display="none",N()}),(r=document.getElementById("menu-signout"))==null||r.addEventListener("click",async()=>{try{await Ie(we),window.location.href="/signin.html"}catch(m){console.error("Error signing out:",m)}}),(l=document.getElementById("menu-admin"))==null||l.addEventListener("click",()=>{window.location.href="/admin.html"}),(u=document.getElementById("menu-password"))==null||u.addEventListener("click",()=>{a.style.display="none",Bt()}),(h=document.getElementById("edit-contact-btn"))==null||h.addEventListener("click",()=>{document.querySelectorAll(".profile-display").forEach(m=>m.style.display="none"),document.querySelectorAll(".profile-edit-field").forEach(m=>m.style.display="block"),document.getElementById("edit-actions").style.display="flex",document.getElementById("edit-contact-btn").style.display="none"}),(c=document.getElementById("cancel-contact-btn"))==null||c.addEventListener("click",()=>{document.querySelectorAll(".profile-display").forEach(m=>m.style.display=""),document.querySelectorAll(".profile-edit-field").forEach(m=>m.style.display="none"),document.getElementById("edit-actions").style.display="none",document.getElementById("edit-contact-btn").style.display=""}),(f=document.getElementById("save-contact-btn"))==null||f.addEventListener("click",async()=>{var I,L,q,D,A,V;const m={"parent.phone":((I=document.getElementById("edit-parent-phone"))==null?void 0:I.value.trim())||"","parent.address":((L=document.getElementById("edit-parent-address"))==null?void 0:L.value.trim())||""};x.spouse&&(m["spouse.phone"]=((q=document.getElementById("edit-spouse-phone"))==null?void 0:q.value.trim())||"",m["spouse.email"]=((D=document.getElementById("edit-spouse-email"))==null?void 0:D.value.trim())||""),m["emergencyContact.name"]=((A=document.getElementById("edit-emergency-name"))==null?void 0:A.value.trim())||"",m["emergencyContact.phone"]=((V=document.getElementById("edit-emergency-phone"))==null?void 0:V.value.trim())||"";try{await X(B(b,"registrations",Q),m),x.parent.phone=m["parent.phone"],x.parent.address=m["parent.address"],x.spouse&&(x.spouse.phone=m["spouse.phone"],x.spouse.email=m["spouse.email"]),x.emergencyContact.name=m["emergencyContact.name"],x.emergencyContact.phone=m["emergencyContact.phone"],k="profile",N()}catch(ee){console.error("Error updating contact:",ee),alert(e("dash_profile_save_failed"))}}),(g=document.getElementById("add-swimmer-toggle-btn"))==null||g.addEventListener("click",()=>{document.getElementById("add-swimmer-form").style.display="block",document.getElementById("add-swimmer-toggle-btn").style.display="none"}),(_=document.getElementById("cancel-swimmer-btn"))==null||_.addEventListener("click",()=>{document.getElementById("add-swimmer-form").style.display="none",document.getElementById("add-swimmer-toggle-btn").style.display=""}),(w=document.getElementById("save-swimmer-btn"))==null||w.addEventListener("click",async()=>{const m=document.getElementById("new-swimmer-first").value.trim(),I=document.getElementById("new-swimmer-last").value.trim();if(!m||!I){alert(e("dash_profile_swimmer_required"));return}const L={firstName:m,lastName:I,middleName:document.getElementById("new-swimmer-middle").value.trim()||null,gender:document.getElementById("new-swimmer-gender").value||null,dob:document.getElementById("new-swimmer-dob").value||null,usaSwimmingId:document.getElementById("new-swimmer-usaId").value.trim()||null,joinDate:null},q=[...x.swimmers,L];try{await X(B(b,"registrations",Q),{swimmers:q}),x.swimmers=q,k="profile",N()}catch(D){console.error("Error adding swimmer:",D),alert(e("dash_profile_swimmer_add_failed"))}}),document.querySelectorAll(".delete-swimmer-btn").forEach(m=>{m.addEventListener("click",()=>{const I=parseInt(m.dataset.index),L=x.swimmers[I],q=[L.firstName,L.lastName].filter(Boolean).join(" ");kt(q,I)})}),(E=document.getElementById("update-password-btn"))==null||E.addEventListener("click",async()=>{const m=document.getElementById("password-update-msg"),I=document.getElementById("change-current-password").value,L=document.getElementById("change-new-password").value,q=document.getElementById("change-confirm-password").value;m.style.display="none",m.style.color="";const D=document.getElementById("update-password-btn");if(D&&(D.disabled=!0),!I||!L||!q){m.textContent="All fields are required.",m.style.color="var(--color-accent, #DC2626)",m.style.display="block",D&&(D.disabled=!1);return}if(L!==q){m.textContent=e("dash_profile_password_mismatch"),m.style.color="var(--color-accent, #DC2626)",m.style.display="block",D&&(D.disabled=!1);return}if(L.length<6){m.textContent="Password must be at least 6 characters.",m.style.color="var(--color-accent, #DC2626)",m.style.display="block",D&&(D.disabled=!1);return}try{const A=je.credential(v.email,I);await Te(v,A),await Me(v,L),m.textContent=e("dash_profile_password_success"),m.style.color="#16A34A",m.style.display="block",document.getElementById("change-current-password").value="",document.getElementById("change-new-password").value="",document.getElementById("change-confirm-password").value=""}catch(A){console.error("Password update error:",A),A.code==="auth/wrong-password"||A.code==="auth/invalid-credential"?m.textContent=e("dash_profile_password_wrong"):m.textContent=e("dash_profile_password_error")+" "+(A.message||""),m.style.color="var(--color-accent, #DC2626)",m.style.display="block"}finally{D&&(D.disabled=!1)}}),se==="coach"){const m=document.getElementById("add-meet-form"),I=document.getElementById("save-meet-btn"),L=document.getElementById("cancel-meet-btn"),q=document.getElementById("meet-form-title");(O=document.getElementById("add-meet-btn"))==null||O.addEventListener("click",()=>{W=null,q.textContent=e("dash_meets_new_title"),I.textContent=e("dash_meets_save"),document.getElementById("meet-name").value="",document.getElementById("meet-start-date").value="",document.getElementById("meet-end-date").value="",document.getElementById("meet-location").value="",m.style.display="block"}),L==null||L.addEventListener("click",()=>{m.style.display="none",W=null}),I==null||I.addEventListener("click",async()=>{var te;const p=document.getElementById("meet-name").value.trim(),$=document.getElementById("meet-start-date").value,C=document.getElementById("meet-end-date").value,F=document.getElementById("meet-location").value.trim(),T=((te=document.getElementById("meet-season"))==null?void 0:te.value)||y;if(!p||!$||!C){alert(e("dash_meets_name_date_required"));return}try{W?await X(B(b,"meets",W),{name:p,startDate:$,endDate:C,location:F,season:T}):await be(H(b,"meets"),{name:p,startDate:$,endDate:C,location:F,season:T,status:"Open",createdAt:new Date}),m.style.display="none",W=null}catch(Ye){console.error("Error saving meet:",Ye)}}),document.querySelectorAll(".edit-meet").forEach(p=>{p.addEventListener("click",()=>{W=p.dataset.id,q.textContent=e("dash_meets_edit_title"),I.textContent=e("dash_meets_update"),document.getElementById("meet-name").value=p.dataset.name,document.getElementById("meet-start-date").value=p.dataset.start,document.getElementById("meet-end-date").value=p.dataset.end,document.getElementById("meet-location").value=p.dataset.location;const $=document.getElementById("meet-season");$&&($.value=p.dataset.season||y),m.style.display="block",m.scrollIntoView({behavior:"smooth"})})}),document.querySelectorAll(".delete-meet").forEach(p=>{p.addEventListener("click",async()=>{if(confirm(e("dash_meets_confirm_delete")))try{await $e(B(b,"meets",p.dataset.id)),W===p.dataset.id&&(m.style.display="none",W=null)}catch($){console.error("Error deleting meet:",$)}})}),document.querySelectorAll(".meet-fee-btn").forEach(p=>{p.addEventListener("click",()=>{Ee(p.dataset.id,p.dataset.name)})});const D=document.getElementById("add-session-form"),A=document.getElementById("save-session-btn"),V=document.getElementById("cancel-session-btn"),ee=document.getElementById("session-form-title");(ne=document.getElementById("add-session-btn"))==null||ne.addEventListener("click",()=>{Y=null,ee.textContent=e("dash_schedule_new_title"),A.textContent=e("dash_schedule_save"),document.getElementById("session-day").value=J(1),document.getElementById("session-start-time").value="",document.getElementById("session-end-time").value="",document.getElementById("session-location").value="",D.style.display="block"}),V==null||V.addEventListener("click",()=>{D.style.display="none",Y=null}),A==null||A.addEventListener("click",async()=>{const p=document.getElementById("session-day").value,$=document.getElementById("session-start-time").value.trim(),C=document.getElementById("session-end-time").value.trim(),F=document.getElementById("session-location").value.trim();if(!p||!$||!C){alert(e("dash_schedule_required_fields"));return}try{Y?await X(B(b,"schedules",Y),{day:p,startTime:$,endTime:C,location:F}):await be(H(b,"schedules"),{day:p,startTime:$,endTime:C,location:F,createdAt:new Date}),D.style.display="none",Y=null}catch(T){console.error("Error saving session:",T)}}),document.querySelectorAll(".edit-session").forEach(p=>{p.addEventListener("click",()=>{Y=p.dataset.id,ee.textContent=e("dash_schedule_edit_title"),A.textContent=e("dash_schedule_update"),document.getElementById("session-day").value=p.dataset.day,document.getElementById("session-start-time").value=p.dataset.start,document.getElementById("session-end-time").value=p.dataset.end,document.getElementById("session-location").value=p.dataset.location,D.style.display="block",D.scrollIntoView({behavior:"smooth"})})}),document.querySelectorAll(".delete-session").forEach(p=>{p.addEventListener("click",async()=>{if(confirm(e("dash_schedule_delete_confirm")))try{await $e(B(b,"schedules",p.dataset.id)),Y===p.dataset.id&&(D.style.display="none",Y=null)}catch($){console.error("Error deleting session:",$)}})}),(de=document.getElementById("import-csv-btn"))==null||de.addEventListener("click",()=>{const p=document.createElement("input");p.type="file",p.accept=".csv",p.addEventListener("change",Nt),p.click()}),(oe=document.getElementById("season-select"))==null||oe.addEventListener("change",p=>{y=p.target.value,N()}),(ie=document.getElementById("goto-deposits-link"))==null||ie.addEventListener("click",p=>{p.preventDefault(),k="deposits",N()}),(re=document.querySelector(".fee-summary-table tbody"))==null||re.addEventListener("click",p=>{const $=p.target.closest(".fee-summary-main-row");if(!$)return;const C=$.dataset.feeIndex,F=document.querySelector(`.fee-summary-detail-row[data-fee-detail="${C}"]`);if(!F)return;const T=$.querySelector(".fee-summary-expand-icon"),te=F.classList.toggle("expanded");$.classList.toggle("expanded-row",te),T&&(T.classList.toggle("expanded",te),T.textContent=te?"▼":"▶")}),(le=document.getElementById("fee-summary-export-btn"))==null||le.addEventListener("click",()=>{wt()}),(Z=document.getElementById("deposits-season-select"))==null||Z.addEventListener("change",p=>{y=p.target.value,N()}),(ue=document.getElementById("roster-season-select"))==null||ue.addEventListener("change",p=>{y=p.target.value,N()}),(he=document.getElementById("deposits-add-btn"))==null||he.addEventListener("click",()=>{document.getElementById("deposits-add-form").style.display="block",document.getElementById("deposits-add-form").scrollIntoView({behavior:"smooth"})}),(U=document.getElementById("deposits-add-cancel"))==null||U.addEventListener("click",()=>{document.getElementById("deposits-add-form").style.display="none",document.getElementById("deposits-add-name").value="",document.getElementById("deposits-add-balance").value=""}),(ce=document.getElementById("deposits-add-save"))==null||ce.addEventListener("click",async()=>{const p=document.getElementById("deposits-add-name").value.trim(),$=parseFloat(document.getElementById("deposits-add-balance").value)||0;if(!p){alert("Swimmer name is required.");return}try{await be(H(b,"deposits"),{swimmerName:p,season:y,balance:$,deposit1Amount:null,deposit1Date:null,deposit2Amount:null,deposit2Date:null,deposit3Amount:null,deposit3Date:null,updatedAt:new Date,updatedBy:(v==null?void 0:v.email)||"unknown"}),document.getElementById("deposits-add-form").style.display="none",document.getElementById("deposits-add-name").value="",document.getElementById("deposits-add-balance").value=""}catch(C){console.error("Error adding deposit:",C),alert("Failed to add deposit.")}}),(j=document.getElementById("deposits-upload-balance-btn"))==null||j.addEventListener("click",()=>{const p=document.createElement("input");p.type="file",p.accept=".xls,.xlsx",p.addEventListener("change",async $=>{var T;const C=(T=$.target.files)==null?void 0:T[0];if($.target.remove(),!C)return;const F=await ut(C);if(!F){alert(e("dash_fee_summary_deposit_parse_error"));return}ht(F.valid,F.errors||[],C.name)}),p.click()}),(R=document.getElementById("deposits-upload-detail-btn"))==null||R.addEventListener("click",()=>{const p=document.createElement("input");p.type="file",p.accept=".xls,.xlsx",p.addEventListener("change",async $=>{var T;const C=(T=$.target.files)==null?void 0:T[0];if($.target.remove(),!C)return;const F=await ft(C);if(!F){alert(e("dash_fee_summary_deposit_parse_error"));return}yt(F.valid,F.errors||[],C.name)}),p.click()}),(S=document.getElementById("deposits-export-btn"))==null||S.addEventListener("click",()=>{_t()}),bt()}}et();
