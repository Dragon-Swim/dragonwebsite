import{i as Re,t as o,a as _t}from"./i18n-CRIkWtj0.js";import{o as $t,h as ne,g as A,e as $,b as Ne,q as Ee,l as ke,c as te,k as Ie,u as se,t as Ue,E as nt,r as ot,v as it,a as Le,f as Fe,w as xt,i as Et,m as Pe,x as qe}from"./firebase-BSPq4bKM.js";import{X as St}from"./xlsx-DkFutVy2.js";function Ye(){return null}window.XLSX=St;Re();const Te=[{id:1,name:"Endurance Base Building",season:"Winter 2026",daysPerWeek:4,priority:"High",progress:72,tasks:"18 / 25 workouts completed",due:"Feb 28, 2026",status:"In Progress"},{id:2,name:"Sprint Technique Focus",season:"Spring 2026",daysPerWeek:3,priority:"Medium",progress:45,tasks:"9 / 20 workouts completed",due:"Mar 15, 2026",status:"In Progress"},{id:3,name:"Stroke Refinement (Butterfly)",season:"Summer 2026",daysPerWeek:5,priority:"Low",progress:0,tasks:"0 / 12 workouts completed",due:"Apr 30, 2026",status:"Not Started"},{id:4,name:"Fall Conditioning",season:"Fall 2025",daysPerWeek:3,priority:"High",progress:100,tasks:"30 / 30 workouts completed",due:"Nov 20, 2025",status:"Completed"}];let me=[],de=null,ze=[],le=null,w=null,fe="swimmer",Z=null,N=null,ye=null,ve=[],ge=[],I=Ce(),F="overview",Ve=!1;function kt(){const e=document.getElementById("app");e.innerHTML=`
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; gap: 20px; font-family: sans-serif;">
      <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #f5c518; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <p style="color: #666;">${o("dash_loading")}</p>
      <style>
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    </div>
  `,console.log("Dashboard: Initializing auth listener...");const t=setTimeout(()=>{console.warn("Dashboard: Auth listener timed out — redirecting to signin"),window.location.href="/signin.html"},5e3);$t(Ne,async n=>{if(clearTimeout(t),!n){console.log("Dashboard: No user authenticated, redirecting to signin..."),window.location.href="/signin.html";return}w=n,console.log("Dashboard: User authenticated:",n.email);try{console.log("Dashboard: Fetching user document...");const s=await ne(A($,"users",n.uid));Z=s.exists()?s.data().role:null;const i=n.email&&n.email.toLowerCase()==="dragonswim@outlook.com";fe=Z==="coach"||Z==="admin"||i?"coach":Z||"swimmer",console.log("Dashboard: Detected role:",fe),Ve?(console.log("Dashboard: Refreshing UI..."),H()):(console.log("Dashboard: Initializing data listeners..."),It(),fe==="coach"&&Pt().then(()=>{console.log("Dashboard: Swim API credentials loaded:",!!j)}),Ve=!0,H())}catch(s){console.error("Dashboard Critical Error:",s),e.innerHTML=`
        <div style="padding: 40px; text-align: center; font-family: sans-serif; max-width: 500px; margin: 100px auto; border: 1px solid #fee2e2; background: #fef2f2; border-radius: 12px; color: #991b1b;">
          <h2 style="margin-bottom: 16px;">${o("dash_load_failed_title")}</h2>
          <p style="margin-bottom: 24px;">${o("dash_load_failed_msg")}</p>
          <code style="display: block; padding: 12px; background: #fee2e2; border-radius: 6px; font-size: 13px; text-align: left; overflow-x: auto; margin-bottom: 24px;">
            ${s.message||o("dash_unknown_error")}
          </code>
          <button onclick="window.location.reload()" style="padding: 10px 20px; background: #991b1b; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">${o("dash_load_failed_retry")}</button>
        </div>
      `,fe="swimmer"}})}function It(){const e=Ee(te($,"meets"),ke("createdAt","desc"));Ie(e,n=>{me=n.docs.map(s=>({id:s.id,...s.data()})),H()},n=>{console.error("Error listening to meets:",n)});const t=Ee(te($,"schedules"),ke("createdAt","asc"));if(Ie(t,n=>{ze=n.docs.map(s=>({id:s.id,...s.data()})),H()},n=>{console.error("Error listening to schedules:",n)}),fe==="coach"){const n=Ee(te($,"registrations"),ke("createdAt","desc"));Ie(n,i=>{ve=i.docs.map(a=>({id:a.id,...a.data()})),H()},i=>{console.error("Error listening to registrations:",i)});const s=Ee(te($,"deposits"),ke("swimmerName","asc"));Ie(s,i=>{ge=i.docs.map(a=>({id:a.id,...a.data()})),H()},i=>{console.error("Error listening to deposits:",i)})}}async function Dt(){if(!w)return;const e=A($,"registrations",w.uid),t=await ne(e);if(t.exists()){ye=t.id,N=t.data(),console.log("fetchFamilyData: found own registration",t.id);return}if(w.email){const n=w.email.toLowerCase().trim();console.log("fetchFamilyData: looking for spouse access with email:",n);try{const s=Ee(te($,"registrations"),xt("parentEmails","array-contains",n)),i=await Et(s);if(console.log("fetchFamilyData: spouse query returned",i.size,"docs"),!i.empty){const a=i.docs[0];ye=a.id,N=a.data(),console.log("fetchFamilyData: found via spouse access",ye,"parentEmails:",N.parentEmails);const r=N.editors||[];r.includes(w.uid)||(r.push(w.uid),await se(A($,"registrations",ye),{editors:r}).catch(l=>{console.error("fetchFamilyData: failed to add editor:",l)}),N.editors=r);return}console.warn("fetchFamilyData: no registration found for spouse email",n)}catch(s){console.error("fetchFamilyData: spouse query failed:",s)}}else console.warn("fetchFamilyData: currentUser.email is empty")}function H(){w&&Dt().then(()=>{Ke()}).catch(e=>{console.error("Error fetching family data:",e),Ke()})}function Ke(){fe==="coach"?Bt(w):Ct(w)}const At=["dash_day_sunday","dash_day_monday","dash_day_tuesday","dash_day_wednesday","dash_day_thursday","dash_day_friday","dash_day_saturday"];function ce(e){return o(At[e]||"dash_day_monday")}function Ct(e){const t=document.getElementById("app");t.innerHTML=`
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
            <span class="dash-nav-label">${o("dash_sidebar_menu")}</span>
            <button class="dash-nav-item ${F==="overview"?"active":""}" data-tab="overview">
              <span class="dash-nav-icon">📊</span> ${o("dash_swimmer_overview_label")}
            </button>
            <button class="dash-nav-item ${F==="profile"?"active":""}" data-tab="profile">
              <span class="dash-nav-icon">👤</span> ${o("dash_swimmer_profile_label")}
            </button>
            <button class="dash-nav-item ${F==="plans"?"active":""}" data-tab="plans">
              <span class="dash-nav-icon">📋</span> ${o("dash_swimmer_plans_label")}
            </button>
            <button class="dash-nav-item ${F==="meets"?"active":""}" data-tab="meets">
              <span class="dash-nav-icon">🏆</span> ${o("dash_swimmer_meets_label")}
            </button>
            <button class="dash-nav-item ${F==="schedule"?"active":""}" data-tab="schedule">
              <span class="dash-nav-icon">📅</span> ${o("dash_swimmer_schedule_label")}
            </button>
          </div>
          <div class="dash-nav-section" style="margin-top: auto;">
            <span class="dash-nav-label">${o("dash_sidebar_system")}</span>
            ${Z==="admin"?`
            <a href="/admin.html" class="dash-nav-item" style="text-decoration: none;">
              <span class="dash-nav-icon">⚙️</span> ${o("dash_sidebar_admin")}
            </a>
            `:""}
            <button class="dash-nav-item" id="dash-theme-toggle">
              <span class="dash-nav-icon" id="sidebar-theme-icon">🌙</span> ${o("dash_sidebar_theme")}
            </button>
            <button class="dash-nav-item" id="sidebar-signout" style="color: var(--color-accent); margin-top: var(--space-md);">
              <span class="dash-nav-icon">🚪</span> ${o("dash_sidebar_signout")}
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
              <h1 class="dash-page-title">${rt(F)}</h1>
              <p class="dash-page-subtitle">${Lt(F)}</p>
            </div>
          </div>
          <div class="dash-topbar-right">
            <div class="dash-user-menu" id="user-menu">
              <button class="dash-user-trigger" id="user-trigger">
                <div class="dash-avatar">${(Xe()||e.email||o("dash_swimmer_username_fallback")).charAt(0).toUpperCase()}</div>
                <span class="dash-user-name">${Xe()||e.email||o("dash_swimmer_username_fallback")}</span>
                <span class="dash-dropdown-arrow">▾</span>
              </button>
              <div class="dash-dropdown" id="user-dropdown" style="display: none;">
                <button class="dash-dropdown-item" id="menu-profile">${o("dash_user_menu_profile")}</button>
                ${Z==="admin"?`<button class="dash-dropdown-item" id="menu-admin">${o("dash_user_menu_admin")}</button>`:""}
                ${w&&w.providerData&&w.providerData[0].providerId==="password"?`<button class="dash-dropdown-item" id="menu-password">🔑 ${o("dash_profile_password_btn")}</button>`:""}
                <button class="dash-dropdown-item" id="menu-signout" style="color: var(--color-accent);">${o("dash_user_menu_signout")}</button>
              </div>
            </div>
          </div>
        </header>

        <div class="dash-content">
          ${dt(F,"swimmer")}
        </div>
      </main>
    </div>
  `,wt(),Re(),lt()}function Bt(e){const t=document.getElementById("app");t.innerHTML=`
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
            <span class="dash-nav-label">${o("dash_coach_menu")}</span>
            <button class="dash-nav-item ${F==="overview"?"active":""}" data-tab="overview">
              <span class="dash-nav-icon">🏠</span> ${o("dash_coach_overview_label")}
            </button>
            <button class="dash-nav-item ${F==="roster"?"active":""}" data-tab="roster">
              <span class="dash-nav-icon">👥</span> ${o("dash_coach_roster_label")}
            </button>
            <button class="dash-nav-item ${F==="meets"?"active":""}" data-tab="meets">
              <span class="dash-nav-icon">🏁</span> ${o("dash_coach_meets_label")}
            </button>
            <button class="dash-nav-item ${F==="schedule"?"active":""}" data-tab="schedule">
              <span class="dash-nav-icon">⏱️</span> ${o("dash_coach_schedule_label")}
            </button>
            <button class="dash-nav-item ${F==="results"?"active":""}" data-tab="results">
              <span class="dash-nav-icon">🏊</span> Swim Times
            </button>
            ${Z==="admin"?`
            <button class="dash-nav-item ${F==="feesummary"?"active":""}" data-tab="feesummary">
              <span class="dash-nav-icon">💰</span> ${o("dash_coach_fee_summary_label")}
            </button>
            <button class="dash-nav-item ${F==="deposits"?"active":""}" data-tab="deposits">
              <span class="dash-nav-icon">🏦</span> ${o("dash_coach_deposits_label")}
            </button>
            `:""}
          </div>
          <div class="dash-nav-section" style="margin-top: auto;">
            <span class="dash-nav-label">${o("dash_sidebar_system")}</span>
            ${Z==="admin"?`
            <a href="/admin.html" class="dash-nav-item" style="text-decoration: none;">
              <span class="dash-nav-icon">⚙️</span> ${o("dash_sidebar_admin")}
            </a>
            `:""}
            <button class="dash-nav-item" id="dash-theme-toggle">
              <span class="dash-nav-icon" id="sidebar-theme-icon">🌙</span> ${o("dash_sidebar_theme")}
            </button>
            <button class="dash-nav-item" id="sidebar-signout" style="color: var(--color-accent); margin-top: var(--space-md);">
              <span class="dash-nav-icon">🚪</span> ${o("dash_sidebar_signout")}
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
              <h1 class="dash-page-title">Coach: ${rt(F,"coach")}</h1>
              <p class="dash-page-subtitle">${o("dash_coach_topbar_sub")}</p>
            </div>
          </div>
          <div class="dash-topbar-right">
            <div class="badge badge-primary" style="margin-right: 1rem;">${o("dash_coach_badge")}</div>
            <div class="dash-user-menu" id="user-menu">
              <button class="dash-user-trigger" id="user-trigger">
                <div class="dash-avatar" style="background: var(--color-accent); color: white;">${(e.displayName||e.email||o("dash_coach_username_fallback")).charAt(0).toUpperCase()}</div>
                <span class="dash-user-name">${e.displayName||e.email||o("dash_coach_username_fallback")}</span>
                <span class="dash-dropdown-arrow">▾</span>
              </button>
              <div class="dash-dropdown" id="user-dropdown" style="display: none;">
                ${Z==="admin"?`<button class="dash-dropdown-item" id="menu-admin">${o("dash_user_menu_admin")}</button>`:""}
                ${w&&w.providerData&&w.providerData[0].providerId==="password"?`<button class="dash-dropdown-item" id="menu-password">🔑 ${o("dash_profile_password_btn")}</button>`:""}
                <button class="dash-dropdown-item" id="menu-signout" style="color: var(--color-accent);">${o("dash_user_menu_signout")}</button>
              </div>
            </div>
          </div>
        </header>

        <div class="dash-content">
          ${dt(F,"coach")}
        </div>
      </main>
    </div>
  `,F==="results"&&ut(),wt(),Re(),lt()}function Xe(){if(!N||!N.parent)return null;const e=N.parent;return[e.firstName,e.lastName].filter(Boolean).join(" ")||null}function rt(e,t="swimmer"){return t==="coach"?{overview:o("dash_coach_tab_overview"),roster:o("dash_coach_tab_roster"),meets:o("dash_coach_tab_meets"),schedule:o("dash_coach_tab_schedule"),results:"Swim Times",feesummary:o("dash_coach_tab_fee_summary"),deposits:o("dash_coach_tab_deposits")}[e]||o("dash_coach_tab_overview"):{overview:o("dash_swimmer_tab_overview"),profile:o("dash_swimmer_tab_profile"),plans:o("dash_swimmer_tab_plans"),meets:o("dash_swimmer_tab_meets"),schedule:o("dash_swimmer_tab_schedule")}[e]||o("dash_swimmer_tab_overview")}function Lt(e){return{overview:o("dash_swimmer_overview_sub"),profile:o("dash_swimmer_profile_sub"),plans:o("dash_swimmer_plans_sub"),meets:o("dash_swimmer_meets_sub"),schedule:o("dash_swimmer_schedule_sub")}[e]||""}function dt(e,t="swimmer"){if(t==="coach")switch(e){case"overview":return Qe();case"roster":return as();case"meets":return tt();case"schedule":return st();case"results":return Yt();case"feesummary":return ns();case"deposits":return os();default:return Qe()}switch(e){case"overview":return gs();case"profile":return _s();case"plans":return $s();case"meets":return tt();case"schedule":return st();default:return""}}function lt(){const e=document.getElementById("sidebar-theme-icon");if(e){const t=document.documentElement.getAttribute("data-theme")==="dark";e.textContent=t?"☀️":"🌙"}}function ct(){const e=[];for(const t of ve)if(t.swimmers)for(let n=0;n<t.swimmers.length;n++){const s=t.swimmers[n];s.deleted||e.push({...s,parentName:mt(t),_regId:t.id,_swimmerIndex:n})}return e}function mt(e){return e.parent&&[e.parent.firstName,e.parent.lastName].filter(Boolean).join(" ")||"—"}function Tt(){const e=new Date;return e.setDate(e.getDate()-30),ve.filter(t=>{var s,i;return(((i=(s=t.createdAt)==null?void 0:s.toDate)==null?void 0:i.call(s))||new Date(t.createdAt))>=e})}const Oe="https://times-api.usaswimming.org/swims/TimesSearch";let j=null,_e=!1;const pt=!1,W={meetGapMs:5e3,batchSize:10,batchPauseMs:6e4,swimmerGapMs:18e4,retryDelaysMs:[5e3,2e4,6e4],cooldownAfterConsecutive:3,cooldownMs:3e5,emptyCooldownAfter:5,emptyCooldownMs:6e5},Nt=new Set([406,429,500,502,503,504]),$e=e=>new Promise(t=>setTimeout(t,e));function He(e){return{AppName:"DataHub","Usas-Sub-Id":e.subId||"","Device-Id":e.deviceId||"","usas-session-id":e.sessionId||""}}async function Ft(e,t){const n=`${Oe}/GetBestTimesForMember/${t}`,s=await fetch(n,{headers:He(e)});if(!s.ok)throw new Error(`HTTP ${s.status}`);return s.json()}async function Mt(e,t){const n=`${Oe}/GetSwimmerMeets/${t}`,s=await fetch(n,{headers:He(e)});if(!s.ok)throw new Error(`HTTP ${s.status}`);return s.json()}async function jt(e,t){const n=new AbortController,s=setTimeout(()=>n.abort(),15e3);try{const i=await fetch(e,{headers:He(t),signal:n.signal});if(clearTimeout(s),i.ok)return{ok:!0,data:await i.json()};let a="";try{a=await i.text()}catch{a="(could not read body)"}return{ok:!1,error:new Error(`HTTP ${i.status}: ${a.slice(0,200)}`),retryable:Nt.has(i.status)}}catch(i){return clearTimeout(s),i.name==="AbortError"?{ok:!1,error:new Error("Timeout (15s)"),retryable:!0}:{ok:!1,error:i,retryable:!0}}}async function Rt(e,t,n){const s=`${Oe}/GetSwimmerMeetTimes/${t}/${n}`,i=W.retryDelaysMs;for(let a=0;;a++){const r=await jt(s,e);if(r.ok)return r.data;if(!r.retryable)throw r.error;if(a>=i.length)throw Object.assign(r.error,{retryable:!0});console.warn(`[fetchMeetTimes] ${t}/${n} attempt ${a+1} failed: ${r.error.message} — retrying in ${i[a]}ms`),await $e(i[a])}}async function Pt(){try{const e=await ne(A($,"settings","swimApi"));if(e.exists())return j=e.data(),j}catch(e){console.warn("Failed to load swim API credentials:",e)}return null}async function qt(e,t,n){const s={deviceId:e.trim(),subId:t.trim(),sessionId:n.trim(),updatedAt:new Date,updatedBy:(w==null?void 0:w.email)||"unknown"};await Pe(A($,"settings","swimApi"),s),j=s}function De(){const e=[];for(const t of ve)if(t.swimmers)for(let n=0;n<t.swimmers.length;n++){const s=t.swimmers[n];s.deleted||e.push({usaSwimmingId:s.usaSwimmingId||null,name:[s.firstName,s.lastName].filter(Boolean).join(" ")||"Unknown",hasId:!!s.usaSwimmingId})}return e}async function zt(e){try{const t=await ne(A($,"swimResults",e));if(t.exists())return t.data().meets||{}}catch{}return{}}async function Ot(e){const t=await ne(A($,"swimResults",e));if(!t.exists())return!1;const n=t.data(),s=Object.keys(n).filter(l=>l.startsWith("meets."));if(s.length===0)return!1;const i={...n.meets||{}};let a=0;for(const l of s){const d=l.slice(6),c=n[l];!c||typeof c!="object"||(i[d]={...c},a++)}const r={...n};for(const l of s)delete r[l];return r.meets=i,await Pe(A($,"swimResults",e),r),console.log(`[Migrate] ${e}: merged ${a} literal meet fields into meets object`),!0}async function Ht(){const e=De().filter(t=>t.hasId);for(const t of e)try{await Ot(t.usaSwimmingId)}catch(n){console.warn(`[Migrate] ${t.usaSwimmingId} failed:`,n)}}async function ut(){const e=De().filter(t=>t.hasId);await Promise.all(e.map(async t=>{const n=document.getElementById(`status-${t.usaSwimmingId}`);if(!n)return;let s={};try{if(!pt){const c=await ne(A($,"swimResults",t.usaSwimmingId));c.exists()&&(s=c.data().meets||{})}}catch(c){n.innerHTML=`<span style="color:var(--color-accent);">❌ ${_(c.message||"load failed")}</span>`;return}const i=Object.values(s);if(i.length===0){n.innerHTML='<span style="color: var(--text-muted);">— No data yet</span>';return}let a=0,r=0,l=0,d=0;for(const c of i){const p=c.status||(c.swims&&c.swims.length?"ok":"empty");p==="ok"?a++:p==="failed"?r++:l++,d+=(c.swims||[]).length}if(r===0&&l===0)n.innerHTML=`<span style="color:#16A34A;">✅ ${a} meets · ${d} swims</span>`;else{const c=[];r&&c.push(`${r} failed`),l&&c.push(`${l} empty`),n.innerHTML=`<span style="color:var(--color-accent);">⚠ ${i.length} meets · ${c.join(" · ")} — refetch</span>`}}))}async function We(e,t,n,s){const i={[`meets.${t.meetId}`]:{meetName:t.meetName,meetDates:t.meetDates,meetType:t.meetType,courseCode:t.courseCode,season:t.season,seasonYear:t.seasonYear,fetchedAt:new Date().toISOString(),status:s,swims:n},lastUpdated:new Date().toISOString()};await se(A($,"swimResults",e),i)}async function ht(e,t,n,s={}){const{force:i=!1,onLog:a=()=>{},onBestTimes:r=()=>{}}=s,l=await zt(t),d=L=>{var z;if(i)return!0;const q=l[L];return q?q.status==="ok"?!1:q.status==="failed"||q.status==="empty"?!0:(((z=q.swims)==null?void 0:z.length)||0)===0:!0},c=await Ft(e,t);r(c),await Pe(A($,"swimResults",t),{memberId:t,swimmerName:n,bestTimes:c,lastUpdated:new Date().toISOString()},{merge:!0});const p=await Mt(e,t),m=p.filter(L=>d(L.meetId));a(`📅 ${p.length} meets total, ${m.length} to fetch${m.length?"":" — all up to date"}`);let v=0,b=0;const k=[];let S=0,E=0;for(let L=0;L<m.length;L++){const q=m[L];try{const z=await Rt(e,t,q.meetId),ae=Array.isArray(z)?z:[],Q=ae.length===0?"empty":"ok";await We(t,q,ae,Q),v++,S=0,ae.length===0?(E++,E>=W.emptyCooldownAfter&&(a(`⚠ 连续 ${E} 场返回空结果,疑似被软降级 — 暂停 ${W.emptyCooldownMs/6e4} 分钟`,!0),await $e(W.emptyCooldownMs),E=0)):E=0}catch(z){await We(t,q,[],"failed"),b++,k.push(`${q.meetName||q.meetId}: ${z.message}`),z.retryable&&(S++,S>=W.cooldownAfterConsecutive&&(a(`⚠ 连续 ${S} 场可重试失败,疑似被限流 — 全局暂停 ${W.cooldownMs/6e4} 分钟`,!0),await $e(W.cooldownMs),S=0))}L+1<m.length&&((L+1)%W.batchSize===0?(a(`⏸ 已处理 ${L+1}/${m.length} 场,中场休息 ${W.batchPauseMs/6e4} 分钟(保护 API 配额)...`),await $e(W.batchPauseMs)):await $e(W.meetGapMs))}return{fetched:v,failed:b,errors:k,bestTimes:c,meets:p}}async function Ut(e,t){const n=De().filter(r=>r.hasId);if(n.length===0){t({type:"error",message:"No swimmers with USA Swimming ID found."});return}t({type:"start",total:n.length});let s=0,i=0;const a=[];for(let r=0;r<n.length;r++){const l=n[r];t({type:"swimmer-start",index:r,total:n.length,name:l.name,memberId:l.usaSwimmingId});let d=null;try{d=await ht(e,l.usaSwimmingId,l.name,{force:!1,onLog:(p,m)=>t({type:"log",message:p,isError:m}),onBestTimes:p=>t({type:"step",name:l.name,step:"bestTimes",count:p.length})});const c=d.fetched>0||d.failed>0;t({type:"swimmer-done",name:l.name,memberId:l.usaSwimmingId,bestTimes:d.bestTimes.length,meets:d.meets.length,newMeets:d.fetched,failedMeets:d.failed,written:c}),d.failed>0&&a.push(...d.errors.map(p=>`${l.name}: ${p}`)),s++}catch(c){i++,a.push(`${l.name}: ${c.message}`),t({type:"swimmer-error",name:l.name,memberId:l.usaSwimmingId,error:c.message})}t({type:"progress",index:r+1,total:n.length,success:s,failed:i}),d&&r<n.length-1&&(d.fetched>0||d.failed>0)&&(t({type:"log",message:`⏸ 运动员间冷却 ${W.swimmerGapMs/6e4} 分钟...`}),await $e(W.swimmerGapMs))}t({type:"done",total:n.length,success:s,failed:i,errors:a})}function Yt(){const e=De(),t=e.filter(a=>a.hasId),n=e.filter(a=>!a.hasId),s=j&&j.deviceId&&j.sessionId;return`
    <div class="dash-panel" style="margin-bottom: 1.5rem;">
      <div class="dash-panel-header">
        <h3 style="margin: 0;">🔑 API Credentials</h3>
        <span id="creds-status" style="font-size: 0.85rem; color: ${s?"#16A34A":"var(--color-accent)"};">
          ${s?"✅ Configured":"⚠ Not configured"}
        </span>
      </div>
      <div class="profile-fields" style="margin-top: var(--space-md);">
        <div class="form-row" style="grid-template-columns: 1fr 1fr 1fr;">
          <div class="form-group">
            <label class="form-label">Device-Id <span style="font-size:0.75rem;color:var(--text-muted);">(set once — tied to computer/browser)</span></label>
            <input class="form-input" id="creds-device-id" placeholder="Copy from Data Hub" value="${_((j==null?void 0:j.deviceId)||"")}" style="font-family: monospace; font-size: 0.8rem;" />
          </div>
          <div class="form-group">
            <label class="form-label">Usas-Sub-Id <span style="font-size:0.75rem;color:var(--text-muted);">(set once — tied to your account)</span></label>
            <input class="form-input" id="creds-sub-id" placeholder="UUID format" value="${_((j==null?void 0:j.subId)||"")}" style="font-family: monospace; font-size: 0.8rem;" />
          </div>
          <div class="form-group">
            <label class="form-label">usas-session-id <span style="font-size:0.75rem;color:var(--text-muted);">(set once — long-lived, refresh only on auth errors)</span></label>
            <input class="form-input" id="creds-session-id" placeholder="32-char hex — rarely changes" value="${_((j==null?void 0:j.sessionId)||"")}" style="font-family: monospace; font-size: 0.8rem;" />
          </div>
        </div>
      </div>
      <div style="display: flex; gap: 0.75rem; margin-top: var(--space-md);">
        <button class="btn btn-primary btn-sm" id="save-creds-btn">💾 Save Credentials</button>
        <button class="btn btn-outline btn-sm" id="toggle-guide-btn">💡 How to get credentials?</button>
      </div>
      
    <div class="credential-guide" id="credential-guide" style="display:none; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: var(--space-lg); margin-top: var(--space-md); font-size: 0.9rem; line-height: 1.8;">
      <h4 style="margin: 0 0 0.75rem 0;">📖 How to Get Your Credentials</h4>
      <ol style="padding-left: 1.25rem; margin: 0;">
        <li>Open <a href="https://data.usaswimming.org/" target="_blank" rel="noopener">https://data.usaswimming.org/</a> and <strong>log in</strong> to your USA Swimming account</li>
        <li>Press <kbd>F12</kbd> on your keyboard (opens Developer Tools)</li>
        <li>Click the <strong>Network</strong> tab at the top</li>
        <li>Type <code>times-api</code> in the filter box to narrow down requests</li>
        <li>In the left sidebar, <strong>click any athlete's name</strong></li>
        <li>Click any request that appears on the right → then click the <strong>Headers</strong> tab</li>
        <li>Under <strong>Request Headers</strong>, find and copy these three values:</li>
      </ol>
      <table style="margin-top: 0.75rem; width: 100%; border-collapse: collapse; font-size: 0.85rem;">
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding: 0.4rem 0.5rem; font-weight: 600; white-space: nowrap;">Device-Id</td>
          <td style="padding: 0.4rem 0.5rem; color: var(--text-muted);">Long string (e.g. <code>V2luMzIgLSBHb29V...</code>). Tied to your computer + browser — <strong>rarely changes</strong>.</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding: 0.4rem 0.5rem; font-weight: 600; white-space: nowrap;">Usas-Sub-Id</td>
          <td style="padding: 0.4rem 0.5rem; color: var(--text-muted);">UUID format (e.g. <code>a05b310b-0c25-47a9-...</code>). Tied to your USA Swimming account — <strong>never changes</strong> as long as you use the same account.</td>
        </tr>
        <tr>
          <td style="padding: 0.4rem 0.5rem; font-weight: 600; white-space: nowrap;">usas-session-id</td>
          <td style="padding: 0.4rem 0.5rem; color: var(--text-muted);">32-character hex (e.g. <code>6F7FF3AF...</code>). <strong>Long-lived — rarely needs replacing</strong>. Only refresh it if fetching fails with an auth error (401/403): log in to Data Hub again and copy a fresh one.</td>
        </tr>
      </table>
      <p style="margin: 0.75rem 0 0 0; font-size: 0.8rem; color: var(--color-accent);">
        ⚠ <strong>Tip:</strong> Device-Id, Usas-Sub-Id, and usas-session-id all only need to be set once. The session-id is long-lived — only refresh it if fetching fails with an auth error (401/403): log in to Data Hub again and copy a fresh session-id.
      </p>
    </div>
  
      <p id="creds-message" style="margin-top: 0.5rem; font-size: 0.85rem;"></p>
    </div>

    <div class="dash-panel" style="margin-bottom: 1.5rem;">
      <div class="dash-panel-header">
        <h3 style="margin: 0;">🔄 Fetch Swim Times</h3>
        <span id="fetch-status" style="font-size: 0.85rem;">Ready</span>
      </div>
      <p style="color: var(--text-muted); margin: var(--space-md) 0; font-size: 0.9rem;">
        Fetch results from USA Swimming for <strong>${t.length}</strong> athlete(s).
        Previously fetched meets are skipped automatically (incremental update).
      </p>
      <div style="display: flex; gap: 0.75rem; margin-bottom: var(--space-md);">
        <button class="btn btn-primary btn-sm" id="fetch-all-btn" ${!s||_e?"disabled":""}>
          ${_e?"⏳ Fetching...":"🔄 Fetch All Swimmer Results"}
        </button>
      </div>
      <div id="fetch-log" style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.75rem; max-height: 350px; overflow-y: auto; font-family: monospace; font-size: 0.8rem; line-height: 1.6; display: none;">
      </div>
    </div>

    <div class="dash-panel">
      <h3 style="margin: 0 0 var(--space-md) 0;">📋 Athlete Data Status</h3>
      <div class="roster-table-wrapper" style="max-height: 400px; overflow-y: auto;">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
          <thead>
            <tr style="border-bottom: 2px solid var(--border-color); color: var(--text-muted);">
              <th style="padding: 0.6rem; text-align: left;">Name</th>
              <th style="padding: 0.6rem; text-align: left;">USA Swimming ID</th>
              <th style="padding: 0.6rem; text-align: left;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${t.map(a=>`
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 0.5rem 0.6rem; font-weight: 500;">${_(a.name)}</td>
                <td style="padding: 0.5rem 0.6rem; font-family: monospace; font-size: 0.8rem;">${_(a.usaSwimmingId)}</td>
                <td style="padding: 0.5rem 0.6rem;" id="status-${_(a.usaSwimmingId)}">
                  <span style="color: var(--text-muted);">—</span>
                </td>
              </tr>
            `).join("")}
            ${n.map(a=>`
              <tr style="border-bottom: 1px solid var(--border-color); opacity: 0.6;">
                <td style="padding: 0.5rem 0.6rem;">${_(a.name)}</td>
                <td style="padding: 0.5rem 0.6rem; color: var(--color-accent);">Not set</td>
                <td style="padding: 0.5rem 0.6rem;">⚠ Add USA Swimming ID in Profile</td>
              </tr>
            `).join("")}
            ${e.length===0?`
              <tr><td colspan="3" style="padding: 2rem; text-align: center; color: var(--text-muted);">No athlete data yet</td></tr>
            `:""}
          </tbody>
        </table>
      </div>
    </div>

    ${t.length>0?`
    <div class="dash-panel" style="margin-top: 1.5rem;">
      <h3 style="margin: 0 0 var(--space-md) 0;">📊 View Athlete Results</h3>
      <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: var(--space-md); flex-wrap: wrap;">
        <select class="form-input" id="results-athlete-select" style="max-width: 300px;">
          <option value="">— Select an athlete —</option>
          ${t.map(a=>`<option value="${_(a.usaSwimmingId)}">${_(a.name)}</option>`).join("")}
        </select>
        <button class="btn btn-outline btn-sm" id="refetch-one-btn" disabled>🔄 Refetch Selected Athlete</button>
      </div>
      <div id="results-viewer" style="display: none;">
        <div id="results-content"></div>
      </div>
    </div>
    `:""}
  `}function Ae(e){if(e==null||e==="")return"—";const t=Number(e);if(isNaN(t))return String(e);if(t<60)return t.toFixed(2);const n=Math.floor(t/60),s=(t%60).toFixed(2);return`${n}:${s.padStart(5,"0")}`}function ft(e){if(!e)return"";const t=e.toUpperCase();return{B:"ts-b",BB:"ts-bb",A:"ts-a",AA:"ts-aa",AAA:"ts-aaa",AAAA:"ts-aaaa"}[t]||""}function Vt(e){return{LCM:"LCM (50m)",SCY:"SCY (25yd)",SCM:"SCM (25m)"}[e]||e||"—"}const Kt={FR:"Free",BK:"Back",BR:"Breast",FL:"Fly",IM:"IM"},Xt=[["B","ts-b"],["BB","ts-bb"],["A","ts-a"],["AA","ts-aa"],["AAA","ts-aaa"],["AAAA","ts-aaaa"]];function Wt(e){if(e==null||e==="")return null;if(typeof e=="number")return Number.isFinite(e)?e:null;const t=String(e).trim(),n=/^(\d+):(\d{2}(?:\.\d+)?)$/.exec(t);if(n)return+n[1]*60+ +n[2];const s=Number(t);return Number.isFinite(s)?s:null}function Gt(e){const t={FREE:"FR",FLY:"FL",BACK:"BK",BREAST:"BR"},n=String(e||"").toUpperCase();return t[n]||n}function yt(e,t){const n=String(e||"").trim();if(!n)return null;const s=/^(\d+)\s+([A-Za-z]{2,4})\s+([A-Za-z]{2,3})$/.exec(n),i=/^(\d+)\s+([A-Za-z]{2,4})$/.exec(n);if(!s&&!i)return null;const a=s||i,r=+a[1],l=Gt(a[2]),d=s?a[3].toUpperCase():((t==null?void 0:t.courseCode)||"").toUpperCase()||null;return!Number.isFinite(r)||!l||!d?null:{distance:r,stroke:l,course:d}}function Ge(e,t){const n=String(t||"").toUpperCase().trim(),s=[];for(const[i,a]of Object.entries(e||{})){if((a.status||(Array.isArray(a.swims)&&a.swims.length?"ok":"empty"))!=="ok"||!Array.isArray(a.swims)||a.swims.length===0)continue;const l=Me(a);if(l==null){console.warn("[Trend] no parseable meet date for",i,a.meetDates);continue}let d=null;for(const c of a.swims){const p=yt(c.eventCode||`${c.distance||""} ${c.strokeAbbreviation||""}`,a);if(!p||`${p.distance} ${p.stroke} ${p.course}`!==n)continue;const m=Wt(c.swimTime);m!=null&&(!d||m<d.seconds)&&(d={seconds:m,course:p.course,sw:c})}d&&s.push({meetId:i,meetName:a.meetName||"",dateTs:l,dateLabel:a.meetDates||"",seconds:d.seconds,timeText:Ae(d.seconds),timeStandard:d.sw.timeStandard??null,timeDrop:d.sw.timeDrop??null,finishPosition:d.sw.finishPosition??null,sessionName:d.sw.sessionName??null,course:d.course})}return s.sort((i,a)=>i.dateTs-a.dateTs||i.meetId.localeCompare(a.meetId)),{points:s,count:s.length}}function Zt(e){const t=new Map;for(const i of Object.values(e||{})){if((i.status||(Array.isArray(i.swims)&&i.swims.length?"ok":"empty"))!=="ok"||!Array.isArray(i.swims))continue;const r=new Set;for(const l of i.swims){const d=yt(l.eventCode||`${l.distance||""} ${l.strokeAbbreviation||""}`,i);if(!d)continue;const c=`${d.distance} ${d.stroke} ${d.course}`;if(r.has(c))continue;r.add(c);const p=t.get(c);p?p.count++:t.set(c,{distance:d.distance,stroke:d.stroke,course:d.course,count:1})}}const n={FR:0,BK:1,BR:2,FL:3,IM:4},s={SCY:0,LCM:1,SCM:2};return[...t.values()].sort((i,a)=>i.distance-a.distance||(n[i.stroke]??9)-(n[a.stroke]??9)||(s[i.course]??9)-(s[a.course]??9)).map(i=>({key:`${i.distance} ${i.stroke} ${i.course}`,label:`${i.distance} ${Kt[i.stroke]||i.stroke} · ${i.course}`,count:i.count}))}function Jt(){return Xt.map(([e,t])=>`
    <span style="display:inline-flex;align-items:center;gap:0.35rem;">
      <span class="trend-legend-dot ts-dot ${t}"></span>${e}
    </span>`).join("")}function Qt(e){const t=e.timeDrop==null?"—":typeof e.timeDrop=="number"?(e.timeDrop>0?"+":"")+e.timeDrop.toFixed(2)+"s":String(e.timeDrop);return[e.meetName,`${e.dateLabel} (${e.course})`,`Time: ${e.timeText} · ${e.timeStandard||"—"}`,`Drop: ${t} · Place: ${e.finishPosition??"—"}`].join(`
`)}function Ze(e,t,n={}){var K;const{width:s=720,height:i=300,margin:a={top:14,right:44,bottom:26,left:48}}=n;if(!e||e.length===0)return'<p class="trend-empty">No swims for this event.</p>';const r=s-a.left-a.right,l=i-a.top-a.bottom,d=Math.min(...e.map(f=>f.dateTs)),c=Math.max(...e.map(f=>f.dateTs)),p=Math.max(c-d,24*3600*1e3),m=d-p*.05,v=c+p*.05,b=f=>a.left+(f-m)/(v-m)*r,k=[].map(f=>f.thresholdSeconds),S=e.map(f=>f.seconds);let E=Math.min(...S,...k),L=Math.max(...S,...k);const q=(L-E||1)*.08;E-=q,L+=q;const z=f=>a.top+(f-E)/(L-E)*l,Q=(f=>{const C=Math.pow(10,Math.floor(Math.log10(f))),B=f/C;return(B<=1?1:B<=2?2:B<=5?5:10)*C})((L-E)/4),oe=[];for(let f=Math.ceil(E/Q)*Q;f<=L+1e-9&&(oe.push(+f.toFixed(3)),!(oe.length>=6));f+=Q);const pe=oe.map(f=>{const C=z(f);return`
      <line x1="${a.left}" x2="${s-a.right}" y1="${C.toFixed(1)}" y2="${C.toFixed(1)}" stroke="var(--border-color)" stroke-opacity="0.4" stroke-width="1" />
      <text x="${a.left-6}" y="${(C+3).toFixed(1)}" text-anchor="end" font-size="10" fill="var(--text-muted)" font-family="var(--font-sans, sans-serif)">${Ae(f)}</text>`}).join("");let ie="";const ue=[];for(let f=0;f<5;f++){const C=m+(v-m)*f/4,B=new Date(C).toLocaleDateString("en-US",{month:"short",year:"2-digit"});if(f>0&&f<4&&B===ie)continue;ie=B;const Y=f===0?"start":f===4?"end":"middle";ue.push(`<text x="${b(C).toFixed(1)}" y="${i-8}" text-anchor="${Y}" font-size="10" fill="var(--text-muted)" font-family="var(--font-sans, sans-serif)">${B}</text>`)}const be=e.length>=2?`<polyline points="${e.map(f=>`${b(f.dateTs).toFixed(1)},${z(f.seconds).toFixed(1)}`).join(" ")}" fill="none" stroke="var(--color-secondary)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />`:"",J=new Map;e.forEach(f=>{const C=J.get(f.dateTs)||[];C.push(f),J.set(f.dateTs,C)});const re=[];for(const[f,C]of J)C.forEach((B,Y)=>{let h=b(f);C.length>1&&(h+=(Y-(C.length-1)/2)*6);const R=B.timeStandard?String(B.timeStandard).toUpperCase():"",O=`ts-dot ${ft(R)||"ts-none"}`,V=R==="AAAA"?5.5:4.5,T=_(Qt(B));re.push(`
        <circle class="${O}" cx="${h.toFixed(1)}" cy="${z(B.seconds).toFixed(1)}" r="${V}" />
        <circle cx="${h.toFixed(1)}" cy="${z(B.seconds).toFixed(1)}" r="10" fill="transparent" style="cursor:pointer;">
          <title>${T}</title>
        </circle>`)});let U="";if(Array.isArray(t)&&t.length>0){const f=[...t].sort((B,Y)=>B.thresholdSeconds-Y.thresholdSeconds);let C=null;for(const B of f){const Y=z(B.thresholdSeconds);C!=null&&(U+=`<rect x="${a.left}" y="${Y.toFixed(1)}" width="${r}" height="${(C-Y).toFixed(1)}" fill="${B.color}" fill-opacity="0.06" />`),U+=`
        <line x1="${a.left}" x2="${s-a.right}" y1="${Y.toFixed(1)}" y2="${Y.toFixed(1)}" stroke="${B.color}" stroke-width="1.2" stroke-dasharray="5 4" />
        <text x="${s-a.right-4}" y="${(Y+3).toFixed(1)}" text-anchor="end" font-size="9" fill="var(--text-muted)" font-family="var(--font-sans, sans-serif)">${_(String(B.level))}</text>`,C=Y}}return`
    <svg class="trend-chart-svg" viewBox="0 0 ${s} ${i}" width="${s}" height="${i}" role="img" aria-label="Swim time trend chart for ${_(String(((K=e[0])==null?void 0:K.course)||""))}">
      <text x="${a.left}" y="${a.top-4}" font-size="9" fill="var(--text-muted)" font-family="var(--font-sans, sans-serif)">faster ↑</text>
      ${U}
      ${pe}
      ${be}
      ${re}
      ${ue}
    </svg>`}function Me(e){const t=e.meetDates||"",n=/^(\d{4})-(\d{2})-(\d{2})/.exec(t);if(n)return new Date(+n[1],+n[2]-1,+n[3]).getTime();const s=/^([A-Za-z]{3}) (\d{1,2})/.exec(t),i=/^(\d{4})\s*[/-]\s*(\d{4})/.exec(e.season||"");if(!s||!i)return null;const r={Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12}[s[1]];if(!r)return null;const l=+i[1],d=+i[2],c=r>=9?l:d;return new Date(c,r-1,+s[2]).getTime()}function es(e){const t={};for(const[s,i]of Object.entries(e)){const a=i.season||"Unknown";t[a]||(t[a]=[]),t[a].push({meetId:s,...i})}const n={};for(const s of Object.keys(t).sort().reverse())n[s]=t[s].sort((i,a)=>{const r=Me(i),l=Me(a);return r!=null&&l!=null?l-r:(a.meetDates||"").localeCompare(i.meetDates||"")});return n}function ts(e){return!e||e.length===0?'<p style="color:var(--text-muted);text-align:center;padding:1rem;">No best times recorded.</p>':`
    <div class="roster-table-wrapper" style="max-height: 400px; overflow-y: auto;">
      <table style="width:100%;border-collapse:collapse;font-size:0.85rem;">
        <thead>
          <tr style="border-bottom:2px solid var(--border-color);color:var(--text-muted);">
            <th style="padding:0.5rem;text-align:left;">Event</th>
            <th style="padding:0.5rem;text-align:left;">Best Time</th>
            <th style="padding:0.5rem;text-align:left;">Course</th>
          </tr>
        </thead>
        <tbody>
          ${[...e].sort((n,s)=>n.strokeAbbreviation!==s.strokeAbbreviation?(n.strokeAbbreviation||"").localeCompare(s.strokeAbbreviation||""):(n.distance||0)-(s.distance||0)).map(n=>`
            <tr style="border-bottom:1px solid var(--border-color);">
              <td style="padding:0.4rem 0.5rem;">${n.distance||""} ${n.strokeName||n.stroke||n.strokeAbbreviation||""}</td>
              <td style="padding:0.4rem 0.5rem;font-weight:600;font-family:monospace;">${Ae(n.swimTime??n.bestTime)}</td>
              <td style="padding:0.4rem 0.5rem;">${Vt(n.courseCode)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `}function ss(e){if(!e||Object.keys(e).length===0)return'<p style="color:var(--text-muted);text-align:center;padding:1rem;">No meet history recorded.</p>';const t=es(e);let n="";for(const[s,i]of Object.entries(t)){const a=`season-${s.replace(/[^a-zA-Z0-9]/g,"-")}`;n+=`
      <div style="margin-bottom: 0.75rem;">
        <button class="btn btn-outline btn-sm season-toggle" data-season="${_(a)}"
                style="width:100%;text-align:left;font-weight:600;display:flex;justify-content:space-between;align-items:center;">
          <span>📅 ${_(s)} Season (${i.length} meet${i.length>1?"s":""})</span>
          <span class="season-arrow" id="arrow-${_(a)}">▶</span>
        </button>
        <div class="season-meets" id="${_(a)}" style="display:none;margin-top:0.5rem;">
          ${i.map(r=>{var d,c;const l=`meet-${r.meetId}`;return`
              <div style="margin-bottom:0.5rem;border:1px solid var(--border-color);border-radius:var(--radius-sm);overflow:hidden;">
                <button class="btn btn-outline btn-sm meet-toggle" data-meet="${_(l)}"
                        style="width:100%;text-align:left;display:flex;justify-content:space-between;align-items:center;padding:0.5rem 0.75rem;border:none;border-radius:0;">
                  <span>🏁 ${_(r.meetName)} <span style="color:var(--text-muted);font-size:0.8rem;">${_(r.courseCode||"")}</span></span>
                  <span style="font-size:0.75rem;color:var(--text-muted);">
                    ${_(r.meetDates||"")} · ${((d=r.swims)==null?void 0:d.length)||0} swim${(((c=r.swims)==null?void 0:c.length)||0)!==1?"s":""}
                    <span class="meet-arrow" id="m-arrow-${_(l)}">▶</span>
                  </span>
                </button>
                <div class="meet-swims" id="${_(l)}" style="display:none;">
                  ${r.swims&&r.swims.length>0?`
                    <table style="width:100%;border-collapse:collapse;font-size:0.8rem;">
                      <thead>
                        <tr style="border-bottom:1px solid var(--border-color);color:var(--text-muted);background:var(--bg-secondary);">
                          <th style="padding:0.35rem 0.5rem;text-align:left;">Event</th>
                          <th style="padding:0.35rem 0.5rem;text-align:left;">Time</th>
                          <th style="padding:0.35rem 0.5rem;text-align:left;">Session</th>
                          <th style="padding:0.35rem 0.5rem;text-align:left;">Place</th>
                          <th style="padding:0.35rem 0.5rem;text-align:left;">Standard</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${r.swims.map(p=>`
                          <tr style="border-bottom:1px solid var(--border-color);">
                            <td style="padding:0.3rem 0.5rem;">${p.eventCode||`${p.distance||""} ${p.strokeAbbreviation||""}`}</td>
                            <td style="padding:0.3rem 0.5rem;font-family:monospace;font-weight:500;">${Ae(p.swimTime)}</td>
                            <td style="padding:0.3rem 0.5rem;">${p.sessionName||"—"}</td>
                            <td style="padding:0.3rem 0.5rem;">${p.finishPosition!=null?p.finishPosition:"—"}</td>
                            <td style="padding:0.3rem 0.5rem;">
                              ${p.timeStandard?`<span class="ts-badge ${ft(p.timeStandard)}">${_(p.timeStandard)}</span>`:"—"}
                            </td>
                          </tr>
                        `).join("")}
                      </tbody>
                    </table>
                  `:'<p style="padding:0.5rem;color:var(--text-muted);font-size:0.8rem;">No swim data for this meet.</p>'}
                </div>
              </div>
            `}).join("")}
        </div>
      </div>
    `}return n}async function Je(e){var s,i;const t=document.getElementById("results-viewer"),n=document.getElementById("results-content");if(!(!t||!n)){t.style.display="block",n.innerHTML='<p style="text-align:center;padding:2rem;color:var(--text-muted);">⏳ Loading...</p>';try{let a;if(!pt){const d=await ne(A($,"swimResults",e));if(!d.exists()){n.innerHTML='<p style="text-align:center;padding:2rem;color:var(--text-muted);">No results data yet. Run a fetch first.</p>';return}a=d.data()}console.log("[Results] Loaded data for",e,":",a),console.log("[Results] bestTimes:",(s=a.bestTimes)==null?void 0:s.length,"meets:",Object.keys(a.meets||{}).length);const r=Zt(a.meets);let l="";if(r.length>0){const d=[...r].sort((p,m)=>m.count-p.count)[0].key,c=Ge(a.meets,d);l=`
      <div style="margin-top:1.5rem;">
        <h4 style="margin:0 0 0.75rem 0;">📈 Performance Trend</h4>
        <div style="display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap;margin-bottom:0.5rem;">
          <select id="trend-event-select" class="form-input" style="max-width:260px;">
            ${r.map(p=>`<option value="${_(p.key)}" ${p.key===d?"selected":""}>${_(p.label)} (${p.count})</option>`).join("")}
          </select>
          <span id="trend-event-count" style="font-size:0.8rem;color:var(--text-muted);">${c.count} swim${c.count===1?"":"s"}</span>
        </div>
        <div class="trend-legend">${Jt()}</div>
        <div class="trend-chart" id="trend-chart">${Ze(c.points,Ye({}))}</div>
      </div>`}n.innerHTML=`
      <div style="margin-bottom:1.5rem;">
        <h4 style="margin:0 0 0.75rem 0;display:flex;align-items:center;gap:0.5rem;">
          🏆 Best Times (${(a.bestTimes||[]).length} entries)
          <span style="font-size:0.75rem;color:var(--text-muted);font-weight:400;">
            Last updated: ${a.lastUpdated?new Date(a.lastUpdated).toLocaleString():"—"}
          </span>
        </h4>
        ${ts(a.bestTimes)}
      </div>

      <div>
        <h4 style="margin:0 0 0.75rem 0;">📅 Meet History (${Object.keys(a.meets||{}).length} meets)</h4>
        <div id="meet-history-container">
          ${ss(a.meets)}
        </div>
      </div>

      ${l}

      <details style="margin-top:1.5rem;border-top:1px solid var(--border-color);padding-top:1rem;">
        <summary style="cursor:pointer;color:var(--text-muted);font-size:0.8rem;">🔍 Debug: Raw JSON</summary>
        <pre style="background:var(--bg-primary);border:1px solid var(--border-color);border-radius:var(--radius-sm);padding:0.75rem;max-height:400px;overflow:auto;font-size:0.7rem;line-height:1.4;margin-top:0.5rem;">${_(JSON.stringify(a,null,2))}</pre>
      </details>
    `,n.querySelectorAll(".season-toggle").forEach(d=>{d.addEventListener("click",()=>{const c=d.dataset.season,p=document.getElementById(c),m=document.getElementById("arrow-"+c);if(!p)return;const v=p.style.display!=="none";p.style.display=v?"none":"block",m&&(m.textContent=v?"▶":"▼")})}),n.querySelectorAll(".meet-toggle").forEach(d=>{d.addEventListener("click",()=>{const c=d.dataset.meet,p=document.getElementById(c),m=document.getElementById("m-arrow-"+c);if(!p)return;const v=p.style.display!=="none";p.style.display=v?"none":"block",m&&(m.textContent=v?"▶":"▼")})}),(i=document.getElementById("trend-event-select"))==null||i.addEventListener("change",d=>{const c=document.getElementById("trend-chart"),p=document.getElementById("trend-event-count");if(!c)return;const m=Ge(a.meets,d.target.value);c.innerHTML=Ze(m.points,Ye({})),p&&(p.textContent=`${m.count} swim${m.count===1?"":"s"}`)})}catch(a){n.innerHTML=`<p style="text-align:center;padding:2rem;color:var(--color-accent);">Failed to load results: ${_(a.message)}</p>`,console.error("loadAthleteResults:",a)}}}function Qe(){const e=ct(),t=Tt(),n=me.filter(s=>s.status!=="Completed");return`
    <div class="dash-stats-row">
      <div class="dash-stat-card">
        <div class="dash-stat-number">${e.length}</div>
        <div class="dash-stat-label">${o("dash_coach_active_athletes")}</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${t.length}</div>
        <div class="dash-stat-label">${o("dash_coach_new_registrations")}</div>
      </div>
      <div class="dash-stat-card accent">
        <div class="dash-stat-number">${n.length}</div>
        <div class="dash-stat-label">${o("dash_coach_upcoming_meets")}</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${ve.length}</div>
        <div class="dash-stat-label">${o("dash_coach_registered_families")}</div>
      </div>
    </div>

    <div class="dash-overview-grid">
      <div class="dash-panel">
        <h3 class="dash-panel-title">${o("dash_coach_top_athletes")}</h3>
        <div class="dash-panel-body">
          ${e.length===0?`<p class="dash-empty">${o("dash_coach_no_swimmers")}</p>`:e.slice(0,5).map(s=>`
            <div class="dash-mini-card">
               <div class="dash-mini-top">
                <span class="dash-mini-name">${[s.firstName,s.lastName].filter(Boolean).join(" ")}</span>
                <span class="badge badge-primary">${s.parentName}</span>
              </div>
              <div class="dash-mini-meta">${s.gender||"—"} · Age: ${s.dob?Math.floor((new Date-new Date(s.dob))/(365.25*24*60*60*1e3)):"—"}</div>
            </div>
          `).join("")}
        </div>
      </div>
      <div class="dash-panel">
        <h3 class="dash-panel-title">${o("dash_coach_recent_registrations")}</h3>
        <div class="dash-panel-body">
          ${t.length===0?`<p class="dash-empty">${o("dash_coach_no_recent")}</p>`:t.slice(0,5).map(s=>`
            <div class="dash-mini-card">
              <div class="dash-mini-top"><span class="dash-mini-name">${mt(s)}</span></div>
              <div class="dash-mini-meta">${s.swimmers?s.swimmers.filter(i=>!i.deleted).length:0} swimmer(s)</div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `}function as(){const e=ct(),t=Z==="admin",n=t?`<tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
        <th style="padding: 0.5rem;">${o("dash_coach_roster_name")}</th>
        <th style="padding: 0.5rem;">${o("dash_coach_roster_age")}</th>
        <th style="padding: 0.5rem;">${o("dash_coach_roster_gender")}</th>
        <th style="padding: 0.5rem;">${o("dash_coach_roster_pmt1_amt")}</th>
        <th style="padding: 0.5rem;">${o("dash_coach_roster_pmt1_date")}</th>
        <th style="padding: 0.5rem;">${o("dash_coach_roster_pmt2_amt")}</th>
        <th style="padding: 0.5rem;">${o("dash_coach_roster_pmt2_date")}</th>
        <th style="padding: 0.5rem;">${o("dash_coach_roster_pmt3_amt")}</th>
        <th style="padding: 0.5rem;">${o("dash_coach_roster_pmt3_date")}</th>
      </tr>`:`<tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
        <th style="padding: 1rem;">${o("dash_coach_roster_name")}</th>
        <th style="padding: 1rem;">${o("dash_coach_roster_parent")}</th>
        <th style="padding: 1rem;">${o("dash_coach_roster_age")}</th>
        <th style="padding: 1rem;">${o("dash_coach_roster_gender")}</th>
        <th style="padding: 1rem;">${o("dash_coach_roster_usa_id")}</th>
      </tr>`;function s(a,r){const d=(a.payments||{})[I]||{};return d[r]!=null?d[r]:""}const i="width: 95%; padding: 0.3rem 0.35rem; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-primary); color: var(--text-primary); font-size: 0.75rem;";return`
    <div class="dash-panel">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.75rem;">
        <h3 class="dash-panel-title" style="margin-bottom: 0; border-bottom: none; padding-bottom: 0;">${o("dash_coach_roster_title")} (${e.length} athletes)</h3>
        ${rs(I)}
      </div>
      <div class="dash-panel-body">
        ${e.length===0?`<p class="dash-empty">${o("dash_coach_no_swimmers")}</p>`:`
        <div class="roster-table-wrapper" style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.8rem; min-width: ${t?"950px":"auto"};">
          <thead>${n}</thead>
          <tbody>
            ${e.map(a=>{const r=a.dob?Math.floor((new Date-new Date(a.dob))/315576e5):"—";return t?`
                  <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 0.4rem 0.5rem; font-weight: 500; white-space: nowrap;">${[a.firstName,a.lastName].filter(Boolean).join(" ")}</td>
                    <td style="padding: 0.4rem 0.5rem;">${r}</td>
                    <td style="padding: 0.4rem 0.5rem;">${a.gender||"—"}</td>
                    <td style="padding: 0.2rem 0.3rem;">
                      <input type="number" step="0.01" min="0"
                        class="roster-pmt-input"
                        data-reg-id="${a._regId}"
                        data-swimmer-index="${a._swimmerIndex}"
                        data-field="amount1"
                        data-season="${I}"
                        value="${s(a,"amount1")}"
                        onchange="window.__updateSwimmerPayment(this)"
                        placeholder="0.00"
                        style="${i}" />
                    </td>
                    <td style="padding: 0.2rem 0.3rem;">
                      <input type="date"
                        class="roster-pmt-input"
                        data-reg-id="${a._regId}"
                        data-swimmer-index="${a._swimmerIndex}"
                        data-field="date1"
                        data-season="${I}"
                        value="${s(a,"date1")}"
                        onchange="window.__updateSwimmerPayment(this)"
                        style="${i}" />
                    </td>
                    <td style="padding: 0.2rem 0.3rem;">
                      <input type="number" step="0.01" min="0"
                        class="roster-pmt-input"
                        data-reg-id="${a._regId}"
                        data-swimmer-index="${a._swimmerIndex}"
                        data-field="amount2"
                        data-season="${I}"
                        value="${s(a,"amount2")}"
                        onchange="window.__updateSwimmerPayment(this)"
                        placeholder="0.00"
                        style="${i}" />
                    </td>
                    <td style="padding: 0.2rem 0.3rem;">
                      <input type="date"
                        class="roster-pmt-input"
                        data-reg-id="${a._regId}"
                        data-swimmer-index="${a._swimmerIndex}"
                        data-field="date2"
                        data-season="${I}"
                        value="${s(a,"date2")}"
                        onchange="window.__updateSwimmerPayment(this)"
                        style="${i}" />
                    </td>
                    <td style="padding: 0.2rem 0.3rem;">
                      <input type="number" step="0.01" min="0"
                        class="roster-pmt-input"
                        data-reg-id="${a._regId}"
                        data-swimmer-index="${a._swimmerIndex}"
                        data-field="amount3"
                        data-season="${I}"
                        value="${s(a,"amount3")}"
                        onchange="window.__updateSwimmerPayment(this)"
                        placeholder="0.00"
                        style="${i}" />
                    </td>
                    <td style="padding: 0.2rem 0.3rem;">
                      <input type="date"
                        class="roster-pmt-input"
                        data-reg-id="${a._regId}"
                        data-swimmer-index="${a._swimmerIndex}"
                        data-field="date3"
                        data-season="${I}"
                        value="${s(a,"date3")}"
                        onchange="window.__updateSwimmerPayment(this)"
                        style="${i}" />
                    </td>
                  </tr>
                `:`
                  <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 1rem; font-weight: 500;">${[a.firstName,a.lastName].filter(Boolean).join(" ")}</td>
                    <td style="padding: 1rem;">${a.parentName}</td>
                    <td style="padding: 1rem;">${r}</td>
                    <td style="padding: 1rem;">${a.gender||"—"}</td>
                    <td style="padding: 1rem;">${a.usaSwimmingId||"—"}</td>
                  </tr>
                `}).join("")}
          </tbody>
        </table>
        </div>
        ${t?`<p class="roster-payment-note">${o("dash_coach_roster_payment_note")}</p>`:""}
        `}
      </div>
    </div>
  `}function vt(e){const t=r=>(r||"").trim().toLowerCase().replace(/\s+/g," "),n=r=>(Number(r.balance)||0)+(Number(r.deposit1Amount)||0)+(Number(r.deposit2Amount)||0)+(Number(r.deposit3Amount)||0),s=new Map;for(const r of me){if(r.season&&r.season!==e)continue;const l=r.feeData;if(!(!l||!l.swimmers||l.swimmers.length===0))for(const d of l.swimmers){const c=t(d.name);if(!c)continue;const p=s.get(c),m=Number(d.total)||0;p?(p.totalFee+=m,p.meetCount+=1,p.meets.push({meetName:r.name||"Unnamed Meet",total:m}),d.name.trim().length>p.displayName.length&&(p.displayName=d.name.trim())):s.set(c,{displayName:d.name.trim(),totalFee:m,meetCount:1,meets:[{meetName:r.name||"Unnamed Meet",total:m}]})}}const i=new Map;for(const r of ge){if(r.season&&r.season!==e)continue;const l=t(r.swimmerName);l&&i.set(l,{id:r.id,total:n(r)})}const a=[];for(const[r,l]of s){const d=i.get(r)||{id:null,total:0};a.push({normalizedName:r,displayName:l.displayName,totalFee:l.totalFee,deposit:d.total,depositId:d.id,balance:d.total-l.totalFee,meetCount:l.meetCount,meets:l.meets}),i.delete(r)}for(const[r,l]of i){const d=ge.find(c=>t(c.swimmerName)===r&&c.season===e);a.push({normalizedName:r,displayName:d?d.swimmerName:r,totalFee:0,deposit:l.total,depositId:l.id,balance:l.total,meetCount:0,meets:[]})}return a.sort((r,l)=>r.balance<0&&l.balance>=0?-1:r.balance>=0&&l.balance<0?1:r.displayName.localeCompare(l.displayName)),a}function ns(){const e=vt(I),t=e.reduce((r,l)=>r+l.totalFee,0),n=e.reduce((r,l)=>r+l.deposit,0),s=e.filter(r=>r.balance<0).length,i=r=>"$"+Number(r).toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2}),a=e.length>0;return`
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem;">
      ${vs(I)}
      <a class="btn btn-outline btn-sm" id="goto-deposits-link" style="text-decoration: none;">🏦 Manage Deposits</a>
      <button class="btn btn-outline btn-sm" id="fee-summary-export-btn">📥 Export CSV</button>
    </div>

    <div class="dash-stats-row">
      <div class="dash-stat-card">
        <div class="dash-stat-number">${e.length}</div>
        <div class="dash-stat-label">${o("dash_fee_summary_total_swimmers")}</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${i(t)}</div>
        <div class="dash-stat-label">${o("dash_fee_summary_total_fees")}</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${i(n)}</div>
        <div class="dash-stat-label">${o("dash_fee_summary_total_deposits")}</div>
      </div>
      <div class="dash-stat-card ${s>0?"accent":""}">
        <div class="dash-stat-number" style="${s>0?"color: var(--color-accent);":""}">${s}</div>
        <div class="dash-stat-label">${o("dash_fee_summary_negative_count")}</div>
      </div>
    </div>

    ${a?`
      <div class="dash-panel">
        <div class="fee-summary-table-wrapper">
          <table class="fee-summary-table">
            <thead>
              <tr>
                <th style="width: 28px;"></th>
                <th>${o("dash_fee_summary_name")}</th>
                <th>${o("dash_fee_summary_deposit")}</th>
                <th>${o("dash_fee_summary_total_fee")}</th>
                <th>${o("dash_fee_summary_meets")}</th>
                <th>${o("dash_fee_summary_balance")}</th>
              </tr>
            </thead>
            <tbody>
              ${e.map((r,l)=>`
                <tr class="fee-summary-main-row fee-summary-row ${r.balance<0?"fee-summary-negative":""}"
                    data-fee-index="${l}" ${r.meets&&r.meets.length>0?'title="Click to see meet details"':""}>
                  <td><span class="fee-summary-expand-icon">${r.meets&&r.meets.length>0?"▶":""}</span></td>
                  <td class="fee-summary-name">${_(r.displayName)}</td>
                  <td>${i(r.deposit)}</td>
                  <td>${i(r.totalFee)}</td>
                  <td>${r.meetCount}</td>
                  <td class="fee-summary-balance" style="font-weight: 700; ${r.balance<0?"color: var(--color-accent);":"color: #16A34A;"}">${i(r.balance)}</td>
                </tr>
                ${r.meets&&r.meets.length>0?`
                <tr class="fee-summary-detail-row" data-fee-detail="${l}">
                  <td colspan="6" class="fee-summary-detail-cell">
                    <table class="fee-summary-mini-table">
                      ${r.meets.map(d=>`
                        <tr>
                          <td class="mini-meet-name">${_(d.meetName)}</td>
                          <td class="mini-meet-fee">${i(d.total)}</td>
                        </tr>
                      `).join("")}
                      <tr class="mini-meet-total">
                        <td>${o("dash_fee_summary_total_fee")}</td>
                        <td class="mini-meet-fee">${i(r.totalFee)}</td>
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
        <p style="color: var(--text-secondary); max-width: 500px; margin: 0 auto;">${o("dash_fee_summary_no_fees")}</p>
      </div>
    `}
  `}function gt(e){return ge.filter(t=>t.season===e).sort((t,n)=>(t.swimmerName||"").localeCompare(n.swimmerName||""))}function bt(e){return(Number(e.balance)||0)+(Number(e.deposit1Amount)||0)+(Number(e.deposit2Amount)||0)+(Number(e.deposit3Amount)||0)}function os(){const e=gt(I),t=i=>i!=null?"$"+Number(i).toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2}):"—",n=i=>i||"—",s=e.length>0;return`
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem;">
      ${is(I)}
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <button class="btn btn-outline btn-sm" id="deposits-upload-balance-btn">📤 Upload Carry-over Balance</button>
        <button class="btn btn-outline btn-sm" id="deposits-upload-detail-btn">📤 Upload Deposits</button>
        <button class="btn btn-outline btn-sm" id="deposits-export-btn">📥 Export CSV</button>
      </div>
    </div>

    ${s?`
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
              ${e.map(i=>{const a=bt(i);return`
                <tr id="${"dep-row-"+i.id}" class="deposits-row">
                  <td class="deposits-name">${_(i.swimmerName)}</td>
                  <td class="deposits-balance">
                    <span class="dep-view">${t(i.balance)}</span>
                    <input class="dep-edit-field dep-input" type="number" value="${i.balance||0}" step="0.01" style="display:none; width: 90px;" />
                  </td>
                  <td class="deposits-d1amt">
                    <span class="dep-view">${t(i.deposit1Amount)}</span>
                    <input class="dep-edit-field dep-input" type="number" value="${i.deposit1Amount||""}" step="0.01" style="display:none; width: 90px;" />
                  </td>
                  <td class="deposits-d1date">
                    <span class="dep-view">${n(i.deposit1Date)}</span>
                    <input class="dep-edit-field dep-input" type="date" value="${i.deposit1Date||""}" style="display:none; width: 130px;" />
                  </td>
                  <td class="deposits-d2amt">
                    <span class="dep-view">${t(i.deposit2Amount)}</span>
                    <input class="dep-edit-field dep-input" type="number" value="${i.deposit2Amount||""}" step="0.01" style="display:none; width: 90px;" />
                  </td>
                  <td class="deposits-d2date">
                    <span class="dep-view">${n(i.deposit2Date)}</span>
                    <input class="dep-edit-field dep-input" type="date" value="${i.deposit2Date||""}" style="display:none; width: 130px;" />
                  </td>
                  <td class="deposits-d3amt">
                    <span class="dep-view">${t(i.deposit3Amount)}</span>
                    <input class="dep-edit-field dep-input" type="number" value="${i.deposit3Amount||""}" step="0.01" style="display:none; width: 90px;" />
                  </td>
                  <td class="deposits-d3date">
                    <span class="dep-view">${n(i.deposit3Date)}</span>
                    <input class="dep-edit-field dep-input" type="date" value="${i.deposit3Date||""}" style="display:none; width: 130px;" />
                  </td>
                  <td class="deposits-total" style="font-weight: 700;">${t(a)}</td>
                  <td class="deposits-actions">
                    <button class="deposits-edit-btn" data-id="${i.id}">✎</button>
                    <button class="deposits-save-btn" data-id="${i.id}" style="display:none;">✓</button>
                    <button class="deposits-cancel-btn" data-id="${i.id}" style="display:none;">✕</button>
                    <button class="deposits-delete-btn" data-id="${i.id}" data-name="${_(i.swimmerName)}" style="color: var(--color-accent);">&times;</button>
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
          No deposit records for ${_(I)}.<br>
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
  `}function is(e){const t=Be(),n=e||I||Ce();return`
    <div class="season-selector">
      <label class="season-selector-label">${o("dash_season_label")}:</label>
      <select id="deposits-season-select" class="season-select">
        ${t.map(s=>`<option value="${s}" ${s===n?"selected":""}>${s}</option>`).join("")}
      </select>
    </div>
  `}function rs(e){const t=Be(),n=e||I||Ce();return`
    <div class="season-selector">
      <label class="season-selector-label">${o("dash_season_label")}:</label>
      <select id="roster-season-select" class="season-select">
        ${t.map(s=>`<option value="${s}" ${s===n?"selected":""}>${s}</option>`).join("")}
      </select>
    </div>
  `}async function ds(e){const t=window.XLSX;if(!t)return alert("Excel parser not loaded."),null;try{const n=await e.arrayBuffer(),s=t.read(new Uint8Array(n),{type:"array"}),i=s.Sheets[s.SheetNames[0]],a=t.utils.sheet_to_json(i,{header:1,defval:null});if(!a||a.length<2)return{valid:[],errors:[{rowNum:1,reason:"File has no data rows."}]};let r=-1,l=-1,d=-1;for(let m=0;m<Math.min(10,a.length);m++){const v=a[m];if(v){r=-1,l=-1;for(let b=0;b<v.length;b++){const k=String(v[b]||"").toLowerCase().trim();(k.includes("name")||k.includes("swimmer"))&&(r=b),k.includes("balance")&&(l=b)}if(r>=0&&l>=0){d=m;break}}}if(d<0)return{valid:[],errors:[{rowNum:0,reason:"Expected columns: Name, Balance."}]};const c=[],p=[];for(let m=d+1;m<a.length;m++){const v=a[m];if(!v||v.every(S=>S==null||String(S).trim()===""))continue;const b=String(v[r]||"").trim();if(!b){p.push({rowNum:m+1,reason:"Missing name."});continue}const k=Number(v[l]);if(isNaN(k)||k<0){p.push({rowNum:m+1,reason:`Invalid balance for "${b}": ${v[l]}`});continue}c.push({swimmerName:b,balance:k})}return{valid:c,errors:p}}catch(n){return console.error("Error parsing carry-over Excel:",n),null}}function ls(e,t,n){var i;const s=document.createElement("div");s.className="confirm-overlay",s.innerHTML=`
    <div class="confirm-modal csv-import-modal">
      <h3 class="confirm-title">Import Carry-over Balance</h3>
      <p class="csv-import-filename">File: <strong>${_(n)}</strong></p>
      <p class="csv-import-summary">${e.length} record(s), ${t.length} error(s)</p>
      <p style="font-size: 0.85rem; color: var(--color-accent); margin-bottom: 0.75rem;">⚠ This will <strong>overwrite</strong> existing balance values for matching swimmers in season <strong>${_(I)}</strong>.</p>
      ${e.length>0?`
        <div class="csv-preview-wrapper">
          <table class="csv-preview-table">
            <thead><tr><th>Name</th><th>Balance</th></tr></thead>
            <tbody>${e.map(a=>`<tr><td>${_(a.swimmerName)}</td><td>$${Number(a.balance).toLocaleString(void 0,{minimumFractionDigits:2})}</td></tr>`).join("")}</tbody>
          </table>
        </div>`:""}
      ${t.length>0?`<div class="csv-error-block"><p class="csv-error-title">Errors</p>${t.map(a=>`<p class="csv-error-item">Row ${a.rowNum}: ${_(a.reason)}</p>`).join("")}</div>`:""}
      ${e.length===0?'<p class="csv-no-valid">No valid records found.</p>':""}
      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="carryover-import-cancel">Cancel</button>
        ${e.length>0?'<button class="btn btn-primary btn-sm" id="carryover-import-confirm">Import</button>':""}
      </div>
    </div>`,document.body.appendChild(s),s.querySelector("#carryover-import-cancel").addEventListener("click",()=>s.remove()),(i=s.querySelector("#carryover-import-confirm"))==null||i.addEventListener("click",async()=>{s.remove(),await cs(e)}),s.addEventListener("click",a=>{a.target===s&&s.remove()})}async function cs(e){if(!e||e.length===0)return;const t=n=>(n||"").trim().toLowerCase().replace(/\s+/g," ");try{const n=qe($);for(const s of e){const i=ge.find(a=>a.season===I&&t(a.swimmerName)===t(s.swimmerName));if(i)n.update(A($,"deposits",i.id),{balance:Number(s.balance),updatedAt:new Date,updatedBy:(w==null?void 0:w.email)||"unknown"});else{const a=A(te($,"deposits"));n.set(a,{swimmerName:s.swimmerName,season:I,balance:Number(s.balance),deposit1Amount:null,deposit1Date:null,deposit2Amount:null,deposit2Date:null,deposit3Amount:null,deposit3Date:null,updatedAt:new Date,updatedBy:(w==null?void 0:w.email)||"unknown"})}}await n.commit(),G(`Updated balance for ${e.length} swimmer(s) in ${I}.`)}catch(n){console.error("Carry-over import failed:",n),G("Failed to import: "+(n.message||""),!0)}}async function ms(e){const t=window.XLSX;if(!t)return alert("Excel parser not loaded."),null;try{const n=await e.arrayBuffer(),s=t.read(new Uint8Array(n),{type:"array"}),i=s.Sheets[s.SheetNames[0]],a=t.utils.sheet_to_json(i,{header:1,defval:null});if(!a||a.length<2)return{valid:[],errors:[{rowNum:1,reason:"File has no data rows."}]};let r=-1;const l={};let d=-1;for(let m=0;m<Math.min(10,a.length);m++){const v=a[m];if(!v)continue;let b=-1;const k={};for(let S=0;S<v.length;S++){const E=String(v[S]||"").toLowerCase().trim();E.includes("name")||E.includes("swimmer")?b=S:/deposit\s*1.*amount/i.test(E)||/d1\s*.*amt/i.test(E)?k.deposit1Amount=S:/deposit\s*1.*date/i.test(E)||/d1\s*.*date/i.test(E)?k.deposit1Date=S:/deposit\s*2.*amount/i.test(E)||/d2\s*.*amt/i.test(E)?k.deposit2Amount=S:/deposit\s*2.*date/i.test(E)||/d2\s*.*date/i.test(E)?k.deposit2Date=S:/deposit\s*3.*amount/i.test(E)||/d3\s*.*amt/i.test(E)?k.deposit3Amount=S:(/deposit\s*3.*date/i.test(E)||/d3\s*.*date/i.test(E))&&(k.deposit3Date=S)}if(b>=0){r=b,Object.assign(l,k),d=m;break}}if(d<0)return{valid:[],errors:[{rowNum:0,reason:'Expected a header row with "Name" column.'}]};const c=[],p=[];for(let m=d+1;m<a.length;m++){const v=a[m];if(!v||v.every(S=>S==null||String(S).trim()===""))continue;const b=String(v[r]||"").trim();if(!b){p.push({rowNum:m+1,reason:"Missing name."});continue}const k={swimmerName:b};for(const[S,E]of Object.entries(l))if(E>=0&&E<v.length){const L=v[E];S.includes("Amount")?k[S]=L!=null?Number(L):null:k[S]=L?String(L).trim():null}c.push(k)}return{valid:c,errors:p}}catch(n){return console.error("Error parsing deposit detail Excel:",n),null}}function ps(e,t,n){var i;const s=document.createElement("div");s.className="confirm-overlay",s.innerHTML=`
    <div class="confirm-modal csv-import-modal" style="max-width: 900px;">
      <h3 class="confirm-title">Import Deposit Details</h3>
      <p class="csv-import-filename">File: <strong>${_(n)}</strong></p>
      <p class="csv-import-summary">${e.length} record(s), ${t.length} error(s)</p>
      <p style="font-size: 0.85rem; color: var(--color-accent); margin-bottom: 0.75rem;">⚠ This will <strong>overwrite</strong> existing deposit fields for matching swimmers in season <strong>${_(I)}</strong>.</p>
      ${e.length>0?`
        <div class="csv-preview-wrapper" style="max-height: 350px;">
          <table class="csv-preview-table" style="font-size: 0.75rem;">
            <thead><tr><th>Name</th><th>D1 Amt</th><th>D1 Date</th><th>D2 Amt</th><th>D2 Date</th><th>D3 Amt</th><th>D3 Date</th></tr></thead>
            <tbody>${e.map(a=>`<tr>
              <td>${_(a.swimmerName)}</td>
              <td>${a.deposit1Amount!=null?"$"+Number(a.deposit1Amount).toFixed(2):"—"}</td>
              <td>${a.deposit1Date||"—"}</td>
              <td>${a.deposit2Amount!=null?"$"+Number(a.deposit2Amount).toFixed(2):"—"}</td>
              <td>${a.deposit2Date||"—"}</td>
              <td>${a.deposit3Amount!=null?"$"+Number(a.deposit3Amount).toFixed(2):"—"}</td>
              <td>${a.deposit3Date||"—"}</td>
            </tr>`).join("")}</tbody>
          </table>
        </div>`:""}
      ${t.length>0?`<div class="csv-error-block"><p class="csv-error-title">Errors</p>${t.map(a=>`<p class="csv-error-item">Row ${a.rowNum}: ${_(a.reason)}</p>`).join("")}</div>`:""}
      ${e.length===0?'<p class="csv-no-valid">No valid records found.</p>':""}
      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="detail-import-cancel">Cancel</button>
        ${e.length>0?'<button class="btn btn-primary btn-sm" id="detail-import-confirm">Import</button>':""}
      </div>
    </div>`,document.body.appendChild(s),s.querySelector("#detail-import-cancel").addEventListener("click",()=>s.remove()),(i=s.querySelector("#detail-import-confirm"))==null||i.addEventListener("click",async()=>{s.remove(),await us(e)}),s.addEventListener("click",a=>{a.target===s&&s.remove()})}async function us(e){if(!e||e.length===0)return;const t=n=>(n||"").trim().toLowerCase().replace(/\s+/g," ");try{const n=qe($);for(const s of e){const i=ge.find(r=>r.season===I&&t(r.swimmerName)===t(s.swimmerName)),a={updatedAt:new Date,updatedBy:(w==null?void 0:w.email)||"unknown"};if("deposit1Amount"in s&&(a.deposit1Amount=s.deposit1Amount),"deposit1Date"in s&&(a.deposit1Date=s.deposit1Date),"deposit2Amount"in s&&(a.deposit2Amount=s.deposit2Amount),"deposit2Date"in s&&(a.deposit2Date=s.deposit2Date),"deposit3Amount"in s&&(a.deposit3Amount=s.deposit3Amount),"deposit3Date"in s&&(a.deposit3Date=s.deposit3Date),i)n.update(A($,"deposits",i.id),a);else{const r=A(te($,"deposits"));n.set(r,{swimmerName:s.swimmerName,season:I,balance:0,deposit1Amount:null,deposit1Date:null,deposit2Amount:null,deposit2Date:null,deposit3Amount:null,deposit3Date:null,...a})}}await n.commit(),G(`Updated deposit details for ${e.length} swimmer(s) in ${I}.`)}catch(n){console.error("Deposit detail import failed:",n),G("Failed to import: "+(n.message||""),!0)}}function hs(){document.querySelectorAll(".deposits-edit-btn").forEach(e=>{e.addEventListener("click",()=>{const t=e.closest("tr");et(t,!0)})}),document.querySelectorAll(".deposits-save-btn").forEach(e=>{e.addEventListener("click",async()=>{const t=e.dataset.id,n=e.closest("tr");if(!t||!n)return;const s=m=>{const v=n.querySelector(m);return v?v.value:null},i=parseFloat(s(".deposits-balance .dep-edit-field"))||0,a=s(".deposits-d1amt .dep-edit-field"),r=s(".deposits-d1date .dep-edit-field"),l=s(".deposits-d2amt .dep-edit-field"),d=s(".deposits-d2date .dep-edit-field"),c=s(".deposits-d3amt .dep-edit-field"),p=s(".deposits-d3date .dep-edit-field");try{await se(A($,"deposits",t),{balance:i,deposit1Amount:a?parseFloat(a):null,deposit1Date:r||null,deposit2Amount:l?parseFloat(l):null,deposit2Date:d||null,deposit3Amount:c?parseFloat(c):null,deposit3Date:p||null,updatedAt:new Date,updatedBy:(w==null?void 0:w.email)||"unknown"})}catch(m){console.error("Error saving deposit:",m),alert("Failed to save deposit.")}})}),document.querySelectorAll(".deposits-cancel-btn").forEach(e=>{e.addEventListener("click",()=>{const t=e.closest("tr");et(t,!1)})}),document.querySelectorAll(".deposits-delete-btn").forEach(e=>{e.addEventListener("click",async()=>{const t=e.dataset.id,n=e.dataset.name;if(t&&confirm(`Delete deposit record for ${n}?`))try{await Fe(A($,"deposits",t))}catch(s){console.error("Error deleting deposit:",s),alert("Failed to delete deposit.")}})})}function et(e,t){if(!e)return;const n=e.querySelectorAll(".dep-view"),s=e.querySelectorAll(".dep-edit-field"),i=e.querySelector(".deposits-edit-btn"),a=e.querySelector(".deposits-save-btn"),r=e.querySelector(".deposits-cancel-btn"),l=e.querySelector(".deposits-delete-btn");n.forEach(d=>d.style.display=t?"none":""),s.forEach(d=>d.style.display=t?"":"none"),i&&(i.style.display=t?"none":""),a&&(a.style.display=t?"":"none"),r&&(r.style.display=t?"":"none"),l&&(l.style.display=t?"none":"")}function fs(){const e=gt(I),t=["Name","Balance","Deposit 1 Amount","Deposit 1 Date","Deposit 2 Amount","Deposit 2 Date","Deposit 3 Amount","Deposit 3 Date","Total"],n=e.map(d=>[d.swimmerName||"",d.balance||0,d.deposit1Amount||"",d.deposit1Date||"",d.deposit2Amount||"",d.deposit2Date||"",d.deposit3Amount||"",d.deposit3Date||"",bt(d)]),s=d=>'"'+String(d).replace(/"/g,'""')+'"',i=[t.map(s).join(","),...n.map(d=>d.map(s).join(","))].join(`
`),a=new Blob([i],{type:"text/csv;charset=utf-8;"}),r=URL.createObjectURL(a),l=document.createElement("a");l.href=r,l.download=`dragon-deposits-${I}.csv`,document.body.appendChild(l),l.click(),document.body.removeChild(l),URL.revokeObjectURL(r)}function ys(){const e=vt(I),t=["Swimmer","Deposit","Total Meet Fee","Meets","Balance"],n=e.map(d=>[d.displayName,d.deposit,d.totalFee,d.meetCount,d.balance]),s=d=>'"'+String(d).replace(/"/g,'""')+'"',i=[t.map(s).join(","),...n.map(d=>d.map(s).join(","))].join(`
`),a=new Blob([i],{type:"text/csv;charset=utf-8;"}),r=URL.createObjectURL(a),l=document.createElement("a");l.href=r,l.download=`dragon-fee-summary-${I}.csv`,document.body.appendChild(l),l.click(),document.body.removeChild(l),URL.revokeObjectURL(r)}function _(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function Ce(){const e=new Date,t=e.getFullYear();return e.getMonth()+1>=9?`${t}-${t+1}`:`${t-1}-${t}`}function Be(){const e=new Set;for(const i of me)i.season&&e.add(i.season);for(const i of ge)i.season&&e.add(i.season);const t=new Date,n=t.getMonth()>=8?t.getFullYear():t.getFullYear()-1,s=2025;for(let i=Math.max(s,n-1);i<=n+2;i++)e.add(`${i}-${i+1}`);return Array.from(e).sort().reverse()}function vs(e){const t=Be(),n=e||I||Ce();return`
    <div class="season-selector">
      <label class="season-selector-label">${o("dash_season_label")}:</label>
      <select id="season-select" class="season-select">
        ${t.map(s=>`<option value="${s}" ${s===n?"selected":""}>${s}</option>`).join("")}
      </select>
    </div>
  `}window.__updateSwimmerPayment=async function(e){var l,d;if(Z!=="admin"){console.warn("Non-admin attempted to modify payment field — blocked"),H();return}const t=e.dataset.regId,n=parseInt(e.dataset.swimmerIndex),s=e.dataset.field,i=e.dataset.season||I;let a=e.value;s.startsWith("amount")?(a=a===""?null:parseFloat(a),a!=null&&(isNaN(a)||a<0)&&(a=null)):s.startsWith("date")&&(a=a||null);const r=ve.find(c=>c.id===t);if((l=r==null?void 0:r.swimmers)!=null&&l[n]){const c=r.swimmers[n],p={...c.payments||{}},m={...p[i]||{}};m[s]=a,p[i]=m,r.swimmers[n]={...c,payments:p}}try{const c=A($,"registrations",t),p=await ne(c);if(!p.exists())return;const m=[...p.data().swimmers];if(m[n]){const v=m[n],b={...v.payments||{}},k={...b[i]||{}};k[s]=a,b[i]=k,m[n]={...v,payments:b},await se(c,{swimmers:m})}}catch(c){console.error("Error updating swimmer payment field:",c);const p=ve.find(m=>m.id===t);if((d=p==null?void 0:p.swimmers)!=null&&d[n]){const m=await ne(A($,"registrations",t));m.exists()&&(p.swimmers[n]={...m.data().swimmers[n]})}H()}};function gs(){const e=Te.filter(s=>s.status!=="Completed").length,t=Te.filter(s=>s.status==="Completed").length,n=me.filter(s=>s.status!=="Completed").length;return`
    <div class="dash-stats-row">
      <div class="dash-stat-card">
        <div class="dash-stat-number">${Te.length}</div>
        <div class="dash-stat-label">${o("dash_swimmer_total_plans")}</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${e}</div>
        <div class="dash-stat-label">${o("dash_swimmer_active_plans")}</div>
      </div>
      <div class="dash-stat-card accent">
        <div class="dash-stat-number">${t}</div>
        <div class="dash-stat-label">${o("dash_swimmer_completed")}</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${n}</div>
        <div class="dash-stat-label">${o("dash_swimmer_upcoming_meets")}</div>
      </div>
    </div>

    <div class="dash-overview-grid">
      <div class="dash-panel">
        <h3 class="dash-panel-title">${o("dash_swimmer_active_plans_title")}</h3>
        <div class="dash-panel-body" style="text-align: center; padding: 2rem;">
          <p style="color: var(--text-secondary);">${o("dash_plans_under_construction")}</p>
        </div>
      </div>
      <div class="dash-panel">
        <h3 class="dash-panel-title">${o("dash_swimmer_upcoming_meets_title")}</h3>
        <div class="dash-panel-body">
          ${me.filter(s=>s.status!=="Completed").map(s=>bs(s)).join("")}
        </div>
      </div>
    </div>

    <div class="dash-panel">
      <h3 class="dash-panel-title">${o("dash_swimmer_today_practice")}</h3>
      <div class="dash-panel-body">
        ${ws()}
      </div>
    </div>
  `}function bs(e){const t=e.status||"Open",n=e.startDate&&e.endDate?`${e.startDate} – ${e.endDate}`:e.date||"";return`
    <div class="dash-mini-card">
      <div class="dash-mini-top">
        <span class="dash-mini-name">${e.name||"Untitled Meet"}</span>
        <span class="status-badge status-${t.toLowerCase().replace(" ","-")}">${t}</span>
      </div>
      <div class="dash-mini-meta">${n} · ${e.location||""}</div>
    </div>
  `}function ws(){const e=new Date().getDay(),t=ce(e),n=ze.filter(s=>s.day===t);return n.length===0?`<p class="dash-empty">${o("dash_swimmer_rest_day")} (${t}). Rest day! 🎉</p>`:n.map(s=>`
    <div class="dash-mini-card">
      <div class="dash-mini-top">
        <span class="dash-mini-name">${s.startTime} – ${s.endTime}</span>
      </div>
      <div class="dash-mini-meta">${s.location||""}</div>
    </div>
  `).join("")}function _s(){if(!N)return`<div class="dash-panel" style="text-align: center; padding: 3rem;">
      <p class="dash-empty">${o("dash_profile_no_reg")}</p>
      <p style="margin-top: 1rem;"><a href="/registration.html" class="btn btn-primary">${o("dash_profile_complete_reg")}</a></p>
    </div>`;const e=N.parent||{},t=N.spouse,n=N.swimmers||[],s=N.emergencyContact||{};return`
    <div class="profile-grid">
      <div class="profile-col">
        <div class="dash-panel">
          <div class="dash-panel-header">
            <h3>${o("dash_profile_parent_title")}</h3>
            <button class="btn btn-outline btn-sm" id="edit-contact-btn">${o("dash_profile_edit")}</button>
          </div>
          <div class="profile-fields">
            <div class="profile-field">
              <span class="profile-label">${o("dash_profile_name")}</span>
              <span class="profile-value">${[e.firstName,e.middleName,e.lastName].filter(Boolean).join(" ")||"—"}</span>
            </div>
            <div class="profile-field">
              <span class="profile-label">${o("dash_profile_gender")}</span>
              <span class="profile-value">${e.gender||"—"}</span>
            </div>
            <div class="profile-field">
              <span class="profile-label">${o("dash_profile_email")}</span>
              <span class="profile-value">${e.email||"—"}</span>
            </div>
            <div class="profile-field">
              <span class="profile-label">${o("dash_profile_phone")}</span>
              <span class="profile-value profile-display" id="display-parent-phone">${e.phone||"—"}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-parent-phone" value="${e.phone||""}" />
            </div>
            <div class="profile-field">
              <span class="profile-label">${o("dash_profile_address")}</span>
              <span class="profile-value profile-display" id="display-parent-address">${e.address||"—"}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-parent-address" value="${e.address||""}" />
            </div>
          </div>
        </div>

        ${t?`
        <div class="dash-panel">
          <h3>${o("dash_profile_spouse_title")}</h3>
          <div class="profile-fields">
            <div class="profile-field">
              <span class="profile-label">${o("dash_profile_name")}</span>
              <span class="profile-value">${[t.firstName,t.middleName,t.lastName].filter(Boolean).join(" ")||"—"}</span>
            </div>
            <div class="profile-field">
              <span class="profile-label">${o("dash_profile_gender")}</span>
              <span class="profile-value">${t.gender||"—"}</span>
            </div>
            <div class="profile-field">
              <span class="profile-label">${o("dash_profile_phone")}</span>
              <span class="profile-value profile-display" id="display-spouse-phone">${t.phone||"—"}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-spouse-phone" value="${t.phone||""}" />
            </div>
            <div class="profile-field">
              <span class="profile-label">${o("dash_profile_email")}</span>
              <span class="profile-value profile-display" id="display-spouse-email">${t.email||"—"}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-spouse-email" value="${t.email||""}" readonly
                title="Spouse email is used for login access and cannot be changed here." />
              <p class="profile-edit-field" style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">Spouse email is tied to login access. Contact admin@dragonswim.com if you need to change it.</p>
            </div>
          </div>
        </div>
        `:""}

        <div class="dash-panel">
          <h3>${o("dash_profile_emergency_title")}</h3>
          <div class="profile-fields">
            <div class="profile-field">
              <span class="profile-label">${o("dash_profile_name")}</span>
              <span class="profile-value profile-display" id="display-emergency-name">${s.name||"—"}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-emergency-name" value="${s.name||""}" />
            </div>
            <div class="profile-field">
              <span class="profile-label">${o("dash_profile_phone")}</span>
              <span class="profile-value profile-display" id="display-emergency-phone">${s.phone||"—"}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-emergency-phone" value="${s.phone||""}" />
            </div>
          </div>
        </div>

        <div class="profile-edit-actions" id="edit-actions" style="display: none;">
          <button class="btn btn-primary btn-sm" id="save-contact-btn">${o("dash_profile_save")}</button>
          <button class="btn btn-outline btn-sm" id="cancel-contact-btn">${o("dash_profile_cancel")}</button>
        </div>
      </div>

      <div class="profile-col">
        <div class="dash-panel">
          <div class="dash-panel-header">
            <h3>${o("dash_profile_swimmers_title")} (${n.length})</h3>
            <button class="btn btn-outline btn-sm" id="add-swimmer-toggle-btn">${o("dash_profile_add_swimmer")}</button>
          </div>
          <div id="add-swimmer-form" style="display: none; margin-bottom: var(--space-md); padding: var(--space-md); border: 1px solid var(--border-color); border-radius: var(--radius-md);">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">${o("dash_profile_swimmer_first")}</label>
                <input class="form-input" id="new-swimmer-first" />
              </div>
              <div class="form-group">
                <label class="form-label">${o("dash_profile_swimmer_last")}</label>
                <input class="form-input" id="new-swimmer-last" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">${o("dash_profile_swimmer_middle")}</label>
                <input class="form-input" id="new-swimmer-middle" />
              </div>
              <div class="form-group">
                <label class="form-label">${o("dash_profile_swimmer_gender")}</label>
                <select class="form-select" id="new-swimmer-gender">
                  <option value="" disabled selected>${o("dash_profile_select_gender")}</option>
                  <option value="male">${o("dash_profile_gender_male")}</option>
                  <option value="female">${o("dash_profile_gender_female")}</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">${o("dash_profile_swimmer_dob")}</label>
                <input class="form-input" type="date" id="new-swimmer-dob" />
              </div>
              <div class="form-group">
                <label class="form-label">${o("dash_profile_swimmer_usa_id")}</label>
                <input class="form-input" id="new-swimmer-usaId" />
              </div>
            </div>
            <div style="display: flex; gap: var(--space-sm); margin-top: var(--space-md);">
              <button class="btn btn-primary btn-sm" id="save-swimmer-btn">${o("dash_profile_save_swimmer")}</button>
              <button class="btn btn-outline btn-sm" id="cancel-swimmer-btn">${o("dash_profile_cancel_swimmer")}</button>
            </div>
          </div>
          ${n.filter(i=>!i.deleted).length===0?`<p class="dash-empty">${o("dash_profile_no_swimmers")}</p>`:n.map((i,a)=>i.deleted?"":`

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
              <button class="btn btn-outline btn-sm delete-swimmer-btn" data-index="${a}" style="color: var(--color-accent); border-color: var(--color-accent);">${o("dash_profile_remove")}</button>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `}function $s(){return`
    <div class="dash-panel" style="text-align: center; padding: 4rem 2rem;">
      <div style="font-size: 3rem; margin-bottom: 1rem;">🚧</div>
      <h2 style="font-size: 1.5rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem;">${o("dash_plans_under_construction")}</h2>
      <p style="color: var(--text-secondary);">${o("dash_swimmer_plans_sub")}</p>
    </div>
  `}function tt(){const e=Z==="admin";return`
    <div class="dash-section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2 style="font-size: 1.5rem; font-weight: 600; color: var(--text-primary);">${o("dash_meets_upcoming")}</h2>
      ${e?`<button class="btn btn-primary btn-sm" id="add-meet-btn">${o("dash_meets_add")}</button>`:""}
    </div>

    ${e?`
      <div id="add-meet-form" class="dash-panel" style="display: none; margin-bottom: 2rem; padding: 1.5rem;">
        <h3 style="margin-bottom: 1rem;" id="meet-form-title">${o("dash_meets_new_title")}</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
          <input type="text" id="meet-name" placeholder="${o("dash_meets_name_placeholder")}" class="form-input">
          <input type="date" id="meet-start-date" class="form-input" title="${o("dash_meets_start_date_placeholder")}">
          <input type="date" id="meet-end-date" class="form-input" title="${o("dash_meets_end_date_placeholder")}">
          <input type="text" id="meet-location" placeholder="${o("dash_meets_location_placeholder")}" class="form-input">
          <select id="meet-season" class="form-input">
            ${Be().map(t=>`<option value="${t}" ${t===I?"selected":""}>${t}</option>`).join("")}
          </select>
        </div>
        <div style="margin-top: 1rem; display: flex; gap: 1rem;">
          <button class="btn btn-primary btn-sm" id="save-meet-btn">${o("dash_meets_save")}</button>
          <button class="btn btn-outline btn-sm" id="cancel-meet-btn">${o("dash_meets_cancel")}</button>
        </div>
      </div>
    `:""}

    <div class="dash-cards-grid">
      ${me.length===0?`<p class="dash-empty">${o("dash_meets_no_meets")}</p>`:me.map(t=>`
        <div class="dash-card">
          <div class="dash-card-header">
            <h3 class="dash-card-title">${t.name}</h3>
            <span class="status-badge status-${(t.status||"Open").toLowerCase().replace(" ","-")}">${t.status||"Open"}</span>
          </div>
          <div class="dash-card-body">
            <div class="dash-card-meta">
              <span>📅 ${t.startDate&&t.endDate?`${t.startDate} – ${t.endDate}`:t.date||""}</span>
              <span>📍 ${t.location}</span>
            </div>
            <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
              ${e?`<button class="btn btn-outline btn-sm meet-fee-btn" data-id="${t.id}" data-name="${t.name||""}">${o("dash_meets_fee")}</button>`:""}
              ${e?`<button class="btn btn-outline btn-sm edit-meet" data-id="${t.id}" data-name="${t.name||""}" data-start="${t.startDate||t.date||""}" data-end="${t.endDate||t.date||""}" data-location="${t.location||""}" data-season="${t.season||I}">${o("dash_meets_edit")}</button>`:""}
              ${e?`<button class="btn btn-outline btn-sm delete-meet" data-id="${t.id}" style="color: var(--color-accent); border-color: var(--color-accent);">${o("dash_meets_delete")}</button>`:""}
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `}function st(){const e=Z==="admin";[0,1,2,3,4,5,6].map(n=>ce(n));const t=[1,2,3,4,5,6,0];return`
    <div class="dash-section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2 style="font-size: 1.5rem; font-weight: 600; color: var(--text-primary);">${o("dash_schedule_weekly")}</h2>
      ${e?`<button class="btn btn-primary btn-sm" id="add-session-btn">${o("dash_schedule_add")}</button><button class="btn btn-outline btn-sm" id="import-csv-btn">${o("dash_schedule_import_csv")}</button>`:""}
    </div>

    ${e?`
      <div id="add-session-form" class="dash-panel" style="display: none; margin-bottom: 2rem; padding: 1.5rem;">
        <h3 style="margin-bottom: 1rem;" id="session-form-title">${o("dash_schedule_new_title")}</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem;">
          <select id="session-day" class="form-input">
            ${t.map(n=>`<option value="${ce(n)}">${ce(n)}</option>`).join("")}
          </select>
          <input type="text" id="session-start-time" placeholder="${o("dash_schedule_start_time_placeholder")}" class="form-input">
          <input type="text" id="session-end-time" placeholder="${o("dash_schedule_end_time_placeholder")}" class="form-input">
          <input type="text" id="session-location" placeholder="${o("dash_schedule_location_placeholder")}" class="form-input">
        </div>
        <div style="margin-top: 1rem; display: flex; gap: 1rem;">
          <button class="btn btn-primary btn-sm" id="save-session-btn">${o("dash_schedule_save")}</button>
          <button class="btn btn-outline btn-sm" id="cancel-session-btn">${o("dash_schedule_cancel")}</button>
        </div>
      </div>
    `:""}

    <div class="dash-schedule-grid">
      ${t.map(n=>{const s=ce(n),i=ze.filter(a=>a.day===s);return`
          <div class="dash-schedule-day">
            <h3 class="dash-schedule-day-name">${s}</h3>
            ${i.length===0?`<p class="dash-empty-sm">${o("dash_schedule_no_practice")}</p>`:i.map(a=>`
                <div class="dash-schedule-item">
                  <div class="dash-schedule-time">${a.startTime} – ${a.endTime}</div>
                  <div class="dash-schedule-focus">${a.location||""}</div>
                  <div class="dash-schedule-meta" style="display: flex; justify-content: flex-end; align-items: center; gap: 8px;">
                    ${e?`
                      <button class="edit-session" data-id="${a.id}" data-day="${a.day}" data-start="${a.startTime||""}" data-end="${a.endTime||""}" data-location="${a.location||""}" style="background: none; border: none; font-size: 1rem; cursor: pointer; color: var(--color-primary); padding: 0 5px;" title="Edit">✎</button>
                      <button class="delete-session" data-id="${a.id}" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--color-accent); padding: 0 5px;" title="Delete">&times;</button>
                    `:""}
                  </div>
                </div>
              `).join("")}
          </div>
        `}).join("")}
    </div>
  `}function xs(e,t){const n=document.createElement("div");n.className="confirm-overlay",n.innerHTML=`
    <div class="confirm-modal">
      <h3 class="confirm-title">${o("dash_profile_delete_title")}</h3>
      <p class="confirm-body">${o("dash_profile_delete_body1")} <strong style="color: var(--color-accent, #dc3545);">${e}</strong> ${o("dash_profile_delete_body2")}</p>
      <p class="confirm-warning">${o("dash_profile_delete_warning")}</p>
      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="confirm-cancel">${o("dash_profile_delete_cancel")}</button>
        <button class="btn btn-sm" id="confirm-delete" style="background: var(--color-accent, #dc3545); color: white; border: none;">${o("dash_profile_delete_confirm")}</button>
      </div>
    </div>
  `,document.body.appendChild(n),n.querySelector("#confirm-cancel").addEventListener("click",()=>n.remove()),n.querySelector("#confirm-delete").addEventListener("click",async()=>{n.remove();const s=[...N.swimmers];s[t]={...s[t],deleted:!0,deletedAt:new Date().toISOString()};try{await se(A($,"registrations",ye),{swimmers:s}),N.swimmers=s,F="profile",H()}catch(i){console.error("Error marking swimmer deleted:",i),alert(o("dash_profile_save_failed"))}}),n.addEventListener("click",s=>{s.target===n&&n.remove()})}function Es(){const e=document.createElement("div");e.className="confirm-overlay",e.innerHTML=`
    <div class="confirm-modal" style="max-width: 420px;">
      <h3 class="confirm-title">${o("dash_profile_security_title")}</h3>
      <div style="padding: var(--space-md) 0;">
        <div class="profile-field">
          <label class="form-label" for="modal-current-password">${o("dash_profile_current_password")}</label>
          <input class="form-input" type="password" id="modal-current-password" placeholder="Enter current password" />
        </div>
        <div class="profile-field">
          <label class="form-label" for="modal-new-password">${o("dash_profile_new_password")}</label>
          <input class="form-input" type="password" id="modal-new-password" placeholder="Enter new password" />
        </div>
        <div class="profile-field">
          <label class="form-label" for="modal-confirm-password">${o("dash_profile_confirm_password")}</label>
          <input class="form-input" type="password" id="modal-confirm-password" placeholder="Confirm new password" />
        </div>
        <p id="modal-password-msg" style="font-size: 14px; margin-top: 10px; display: none;"></p>
      </div>
      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="modal-password-cancel">${o("dash_profile_cancel")}</button>
        <button class="btn btn-primary btn-sm" id="modal-password-submit">${o("dash_profile_password_btn")}</button>
      </div>
    </div>
  `,document.body.appendChild(e);const t=e.querySelector("#modal-password-msg");e.querySelector("#modal-password-cancel").addEventListener("click",()=>e.remove()),e.querySelector("#modal-password-submit").addEventListener("click",async()=>{const n=e.querySelector("#modal-current-password").value,s=e.querySelector("#modal-new-password").value,i=e.querySelector("#modal-confirm-password").value;if(t.style.display="none",!n||!s||!i){t.textContent="All fields are required.",t.style.color="var(--color-accent, #DC2626)",t.style.display="block";return}if(s!==i){t.textContent=o("dash_profile_password_mismatch"),t.style.color="var(--color-accent, #DC2626)",t.style.display="block";return}if(s.length<6){t.textContent="Password must be at least 6 characters.",t.style.color="var(--color-accent, #DC2626)",t.style.display="block";return}try{const a=nt.credential(w.email,n);await ot(w,a),await it(w,s),t.textContent=o("dash_profile_password_success"),t.style.color="#16A34A",t.style.display="block",e.querySelector("#modal-current-password").value="",e.querySelector("#modal-new-password").value="",e.querySelector("#modal-confirm-password").value=""}catch(a){console.error("Password update error:",a),a.code==="auth/wrong-password"||a.code==="auth/invalid-credential"?t.textContent=o("dash_profile_password_wrong"):t.textContent=o("dash_profile_password_error")+" "+(a.message||""),t.style.color="var(--color-accent, #DC2626)",t.style.display="block"}}),e.addEventListener("click",n=>{n.target===e&&e.remove()})}function at(e){const t=[];let n="",s=!1;for(let i=0;i<e.length;i++){const a=e[i];a==='"'?s=!s:a===","&&!s?(t.push(n.trim()),n=""):n+=a}return t.push(n.trim()),t.length>0&&t[0].charCodeAt(0)===65279&&(t[0]=t[0].slice(1)),t}function Ss(e){const n=e.split(/\r?\n/).filter(a=>a.trim().length>0);if(n.length===0)return{headers:[],rows:[]};const s=at(n[0]),i=n.slice(1).map(a=>at(a));return{headers:s,rows:i}}function ks(e,t){if(!e||e.length<4)return{valid:!1,reason:o("dash_csv_error_too_few_cols"),rowNum:t};const[n,s,i,a]=e.map(c=>(c||"").trim());if(!n)return{valid:!1,reason:o("dash_csv_error_missing_day"),rowNum:t};const r=n.toLowerCase(),l=[0,1,2,3,4,5,6].find(c=>ce(c).toLowerCase()===r);if(l===void 0)return{valid:!1,reason:o("dash_csv_error_invalid_day",{day:n}),rowNum:t};const d=ce(l);return s?/^\d{1,2}:\d{2}\s*(AM|PM)?$/i.test(s)?i?/^\d{1,2}:\d{2}\s*(AM|PM)?$/i.test(i)?{valid:!0,day:d,startTime:s,endTime:i,location:a||"",rowNum:t}:{valid:!1,reason:o("dash_csv_error_invalid_time",{field:"EndTime",value:i}),rowNum:t}:{valid:!1,reason:o("dash_csv_error_missing_end"),rowNum:t}:{valid:!1,reason:o("dash_csv_error_invalid_time",{field:"StartTime",value:s}),rowNum:t}:{valid:!1,reason:o("dash_csv_error_missing_start"),rowNum:t}}function G(e,t){const n=document.getElementById("csv-import-status");n&&n.remove();const s=document.createElement("div");s.id="csv-import-status",s.style.cssText=["padding: var(--space-md) var(--space-lg)","border-radius: var(--radius-md)","margin-bottom: var(--space-lg)","font-size: var(--fs-sm)","font-weight: var(--fw-medium)",t?"background: #fef2f2; border: 1px solid #fee2e2; color: #991b1b":"background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534"].join(";"),s.textContent=e;const i=document.querySelector(".dash-content");i&&i.insertBefore(s,i.firstChild),setTimeout(()=>s.remove(),8e3)}async function Is(e){var p;const t=(p=e.target.files)==null?void 0:p[0];if(e.target.remove(),!t)return;if(!t.name.toLowerCase().endsWith(".csv")){G(o("dash_csv_error_not_csv"),!0);return}if(t.size>5e5){G(o("dash_csv_error_too_large"),!0);return}let n;try{n=await t.text()}catch(m){console.error("Error reading CSV file:",m),G(o("dash_csv_error_unknown"),!0);return}if(!n||n.trim().length===0){G(o("dash_csv_error_empty"),!0);return}const{headers:s,rows:i}=Ss(n),a=["day","starttime","endtime","location"],r=s.map(m=>m.replace(/\s/g,"").toLowerCase());if(!a.every(m=>r.includes(m))||s.length<4){G(o("dash_csv_error_bad_header"),!0);return}const d=[],c=[];i.forEach((m,v)=>{const b=ks(m,v+2);b.valid?d.push({day:b.day,startTime:b.startTime,endTime:b.endTime,location:b.location||""}):c.push({rowNum:b.rowNum,reason:b.reason})}),Ds(d,c,t.name)}function Ds(e,t,n){var d;const s=n.replace(/</g,"&lt;").replace(/>/g,"&gt;"),i=e.length,a=t.length,r=c=>c.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),l=document.createElement("div");l.className="confirm-overlay",l.innerHTML=`
    <div class="confirm-modal csv-import-modal">
      <h3 class="confirm-title">${o("dash_csv_import_title")}</h3>
      <p class="csv-import-filename">${o("dash_csv_import_file")}: <strong>${s}</strong></p>
      <p class="csv-import-summary">${o("dash_csv_import_summary",{valid:String(i),error:String(a)})}</p>
      ${e.length>0?`
        <div class="csv-preview-wrapper">
          <table class="csv-preview-table">
            <thead>
              <tr>
                <th>${o("dash_csv_header_day")}</th>
                <th>${o("dash_csv_header_start")}</th>
                <th>${o("dash_csv_header_end")}</th>
                <th>${o("dash_csv_header_location")}</th>
              </tr>
            </thead>
            <tbody>
              ${e.map(c=>`
                <tr>
                  <td>${r(c.day)}</td>
                  <td>${r(c.startTime)}</td>
                  <td>${r(c.endTime)}</td>
                  <td>${r(c.location||"")}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `:""}
      ${t.length>0?`
        <div class="csv-error-block">
          <p class="csv-error-title">${o("dash_csv_import_errors")}</p>
          ${t.map(c=>`<p class="csv-error-item">${o("dash_csv_import_row")} ${c.rowNum}: ${r(c.reason)}</p>`).join("")}
        </div>
      `:""}
      ${e.length===0?`
        <p class="csv-no-valid">${o("dash_csv_import_no_valid")}</p>
      `:""}
      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="csv-import-cancel">${o("dash_csv_import_cancel")}</button>
        ${e.length>0?`<button class="btn btn-primary btn-sm" id="csv-import-confirm">${o("dash_csv_import_confirm",{count:String(i)})}</button>`:""}
      </div>
    </div>
  `,document.body.appendChild(l),l.querySelector("#csv-import-cancel").addEventListener("click",()=>l.remove()),(d=l.querySelector("#csv-import-confirm"))==null||d.addEventListener("click",async()=>{l.remove(),await As(e)}),l.addEventListener("click",c=>{c.target===l&&l.remove()})}async function As(e){if(!e||e.length===0)return;const t=document.getElementById("csv-import-status");t&&t.remove();try{const n=qe($),s=te($,"schedules");e.forEach(i=>{const a=A(s);n.set(a,{day:i.day,startTime:i.startTime,endTime:i.endTime,location:i.location||"",createdAt:new Date})}),await n.commit(),G(o("dash_csv_import_success",{count:String(e.length)}))}catch(n){console.error("CSV import batch write failed:",n),n.code==="permission-denied"?G(o("dash_csv_error_permission"),!0):n.code==="unavailable"?G(o("dash_csv_error_network"),!0):G(o("dash_csv_error_unknown")+" "+(n.message||""),!0)}}async function Cs(e){var l,d,c,p,m,v,b,k,S,E,L,q,z,ae,Q,oe,pe;const t=window.XLSX;if(!t)return alert("Excel parser not loaded. Please refresh the page."),null;const n=await e.arrayBuffer(),s=t.read(new Uint8Array(n),{type:"array"}),i=s.SheetNames[0],a=s.Sheets[i],r=t.utils.sheet_to_json(a,{header:1,defval:null});try{const ie=((l=r[5])==null?void 0:l[0])||"Unknown Meet",ue=((d=r[7])==null?void 0:d[9])||0,be=((c=r[7])==null?void 0:c[36])||0;let J=-1;for(let f=8;f<r.length;f++)if(r[f]&&r[f][1]==="Name"){J=f+2;break}J<0&&(J=11);const re=[];for(let f=J;f<r.length;f+=2){const C=(p=r[f])==null?void 0:p[1];if(!C||typeof C!="string")break;const B=C.match(/^(.+?)\s*\((\d+)\)\s*$/),Y=B?B[1].trim():C.trim(),h=B?parseInt(B[2],10):null,R=((m=r[f])==null?void 0:m[17])||0,O=((v=r[f])==null?void 0:v[23])||0,V=((b=r[f])==null?void 0:b[29])||0,T=((k=r[f])==null?void 0:k[38])||0;re.push({name:Y,age:h,individualEvents:R,individualFee:O,relayFee:V,total:T})}let U=-1;for(let f=J;f<r.length;f++)if(r[f]&&r[f][9]==="Team Totals"){U=f;break}let K={individualEntries:0,individualFee:0,relayEntries:0,relayFee:0,swimmerSurcharge:{count:0,fee:0},teamSurcharge:0,facilitySurcharge:0,total:0};return U>0&&(K.individualEntries=((S=r[U+1])==null?void 0:S[15])||0,K.individualFee=((E=r[U+1])==null?void 0:E[21])||0,K.relayEntries=((L=r[U+2])==null?void 0:L[15])||0,K.relayFee=((q=r[U+2])==null?void 0:q[21])||0,K.swimmerSurcharge={count:((z=r[U+3])==null?void 0:z[15])||0,fee:((ae=r[U+3])==null?void 0:ae[21])||0},K.teamSurcharge=((Q=r[U+4])==null?void 0:Q[21])||0,K.facilitySurcharge=((oe=r[U+5])==null?void 0:oe[21])||0,K.total=((pe=r[U+6])==null?void 0:pe[21])||0),{fileName:e.name,meetName:ie,setupFees:{individualEventFee:ue,swimmerSurcharge:be},swimmers:re,summary:K,uploadedAt:new Date,uploadedBy:(w==null?void 0:w.email)||"unknown"}}catch(ie){return console.error("Error parsing Hy-Tek report:",ie),null}}function Bs(e,t,n){const s=n&&n.swimmers&&n.swimmers.length>0;let i="";if(s){const a=n.summary;i+=`
      <div class="fee-summary-grid">
        <div class="fee-summary-card">
          <div class="fee-summary-label">Individual Entries</div>
          <div class="fee-summary-value">${a.individualEntries} events</div>
          <div class="fee-summary-sub">$${a.individualFee.toLocaleString()}</div>
        </div>
        <div class="fee-summary-card">
          <div class="fee-summary-label">Relay Entries</div>
          <div class="fee-summary-value">${a.relayEntries} entries</div>
          <div class="fee-summary-sub">$${a.relayFee.toLocaleString()}</div>
        </div>
        <div class="fee-summary-card">
          <div class="fee-summary-label">Swimmer Surcharge</div>
          <div class="fee-summary-value">${a.swimmerSurcharge.count} swimmers</div>
          <div class="fee-summary-sub">$${a.swimmerSurcharge.fee.toLocaleString()}</div>
        </div>
        <div class="fee-summary-card fee-summary-total">
          <div class="fee-summary-label">${o("dash_meets_fee_summary_total")}</div>
          <div class="fee-summary-value" style="font-size: 1.5rem; font-weight: 700;">$${a.total.toLocaleString()}</div>
        </div>
      </div>

      <div class="fee-table-wrapper">
        <table class="fee-table">
          <thead>
            <tr>
              <th>${o("dash_meets_fee_name")}</th>
              <th>${o("dash_meets_fee_age")}</th>
              <th>${o("dash_meets_fee_events")}</th>
              <th>${o("dash_meets_fee_indiv_fee")}</th>
              <th>${o("dash_meets_fee_relay_fee")}</th>
              <th>${o("dash_meets_fee_total")}</th>
            </tr>
          </thead>
          <tbody>
            ${n.swimmers.map(r=>`
              <tr>
                <td>${r.name}</td>
                <td>${r.age!=null?r.age:"—"}</td>
                <td>${r.individualEvents}</td>
                <td>$${r.individualFee.toLocaleString()}</td>
                <td>$${r.relayFee.toLocaleString()}</td>
                <td><strong>$${r.total.toLocaleString()}</strong></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>

      <div class="fee-meta">
        ${o("dash_meets_fee_uploaded_by")}: <strong>${n.uploadedBy||"—"}</strong>
        ${n.uploadedAt?` &mdash; ${new Date(n.uploadedAt.seconds?n.uploadedAt.seconds*1e3:n.uploadedAt).toLocaleString()}`:""}
      </div>
    `}else i=`<div class="fee-empty">${o("dash_meets_fee_no_data")}</div>`;return`
    <div class="fee-modal-overlay" id="fee-modal-overlay">
      <div class="fee-modal">
        <div class="fee-modal-header">
          <h2>${o("dash_meets_fee_title")}: ${t}</h2>
          <button class="fee-modal-close" id="fee-modal-close" title="${o("dash_meets_fee_close")}">&times;</button>
        </div>
        <div class="fee-modal-body" id="fee-modal-body">
          ${i}
        </div>
        <div class="fee-modal-footer">
          ${s?`<p class="fee-overwrite-hint">${o("dash_meets_fee_upload_overwrite")}</p>`:""}
          <input type="file" id="fee-file-input" accept=".xls,.xlsx" style="display:none;">
          <button class="btn btn-primary btn-sm" id="fee-upload-btn">${o("dash_meets_fee_upload")}</button>
          ${s?`<button class="btn btn-outline btn-sm" id="fee-delete-btn" style="color: var(--color-accent); border-color: var(--color-accent);">${o("dash_meets_fee_delete")}</button>`:""}
        </div>
      </div>
    </div>
  `}async function je(e,t){let n=null;try{const m=await ne(A($,"meets",e));m.exists()&&(n=m.data().feeData||null)}catch(m){console.error("Error fetching meet for fee modal:",m)}const s=document.getElementById("fee-modal-overlay");s&&s.remove();const i=document.createElement("div");i.id="fee-modal-container",i.innerHTML=Bs(e,t,n),document.body.appendChild(i);const a=document.getElementById("fee-modal-overlay"),r=document.getElementById("fee-modal-close"),l=document.getElementById("fee-upload-btn"),d=document.getElementById("fee-file-input"),c=document.getElementById("fee-delete-btn"),p=()=>{a==null||a.remove(),i.remove()};r==null||r.addEventListener("click",p),a==null||a.addEventListener("click",m=>{m.target===a&&p()}),l==null||l.addEventListener("click",()=>{d==null||d.click()}),d==null||d.addEventListener("change",async m=>{var S;const v=(S=m.target.files)==null?void 0:S[0];if(!v)return;const b=v.name.split(".").pop().toLowerCase();if(!["xls","xlsx"].includes(b)){alert(o("dash_meets_fee_parse_error"));return}const k=await Cs(v);if(!k){alert(o("dash_meets_fee_parse_error"));return}try{await se(A($,"meets",e),{feeData:k}),p(),je(e,t)}catch(E){console.error("Error uploading fee data:",E),alert("Failed to upload fee data. Please try again.")}}),c==null||c.addEventListener("click",async()=>{if(confirm(o("dash_meets_fee_delete_confirm")))try{await se(A($,"meets",e),{feeData:null}),p(),je(e,t)}catch(m){console.error("Error deleting fee data:",m),alert("Failed to delete fee data. Please try again.")}})}function wt(){var i,a,r,l,d,c,p,m,v,b,k,S,E,L,q,z,ae,Q,oe,pe,ie,ue,be,J,re,U,K,f,C,B,Y;Ht(),document.querySelectorAll(".dash-nav-item[data-tab]").forEach(h=>{h.addEventListener("click",()=>{F=h.dataset.tab,H()})}),(i=document.getElementById("dash-theme-toggle"))==null||i.addEventListener("click",()=>{_t(),H()});const e=document.getElementById("dash-hamburger"),t=document.getElementById("dash-sidebar");e==null||e.addEventListener("click",()=>{t.classList.toggle("open")}),(a=document.getElementById("sidebar-signout"))==null||a.addEventListener("click",async()=>{try{await Ue(Ne),window.location.href="/signin.html"}catch(h){console.error("Error signing out:",h)}});const n=document.getElementById("user-trigger"),s=document.getElementById("user-dropdown");if(n==null||n.addEventListener("click",h=>{h.stopPropagation(),s.style.display=s.style.display==="none"?"block":"none"}),document.addEventListener("click",()=>{s&&(s.style.display="none")}),(r=document.getElementById("menu-profile"))==null||r.addEventListener("click",()=>{F="profile",s.style.display="none",H()}),(l=document.getElementById("menu-signout"))==null||l.addEventListener("click",async()=>{try{await Ue(Ne),window.location.href="/signin.html"}catch(h){console.error("Error signing out:",h)}}),(d=document.getElementById("menu-admin"))==null||d.addEventListener("click",()=>{window.location.href="/admin.html"}),(c=document.getElementById("menu-password"))==null||c.addEventListener("click",()=>{s.style.display="none",Es()}),(p=document.getElementById("edit-contact-btn"))==null||p.addEventListener("click",()=>{document.querySelectorAll(".profile-display").forEach(h=>h.style.display="none"),document.querySelectorAll(".profile-edit-field").forEach(h=>h.style.display="block"),document.getElementById("edit-actions").style.display="flex",document.getElementById("edit-contact-btn").style.display="none"}),(m=document.getElementById("cancel-contact-btn"))==null||m.addEventListener("click",()=>{document.querySelectorAll(".profile-display").forEach(h=>h.style.display=""),document.querySelectorAll(".profile-edit-field").forEach(h=>h.style.display="none"),document.getElementById("edit-actions").style.display="none",document.getElementById("edit-contact-btn").style.display=""}),(v=document.getElementById("save-contact-btn"))==null||v.addEventListener("click",async()=>{var R,O,V,T,X,we;const h={"parent.phone":((R=document.getElementById("edit-parent-phone"))==null?void 0:R.value.trim())||"","parent.address":((O=document.getElementById("edit-parent-address"))==null?void 0:O.value.trim())||""};N.spouse&&(h["spouse.phone"]=((V=document.getElementById("edit-spouse-phone"))==null?void 0:V.value.trim())||"",h["spouse.email"]=((T=document.getElementById("edit-spouse-email"))==null?void 0:T.value.trim())||""),h["emergencyContact.name"]=((X=document.getElementById("edit-emergency-name"))==null?void 0:X.value.trim())||"",h["emergencyContact.phone"]=((we=document.getElementById("edit-emergency-phone"))==null?void 0:we.value.trim())||"";try{await se(A($,"registrations",ye),h),N.parent.phone=h["parent.phone"],N.parent.address=h["parent.address"],N.spouse&&(N.spouse.phone=h["spouse.phone"],N.spouse.email=h["spouse.email"]),N.emergencyContact.name=h["emergencyContact.name"],N.emergencyContact.phone=h["emergencyContact.phone"],F="profile",H()}catch(Se){console.error("Error updating contact:",Se),alert(o("dash_profile_save_failed"))}}),(b=document.getElementById("add-swimmer-toggle-btn"))==null||b.addEventListener("click",()=>{document.getElementById("add-swimmer-form").style.display="block",document.getElementById("add-swimmer-toggle-btn").style.display="none"}),(k=document.getElementById("cancel-swimmer-btn"))==null||k.addEventListener("click",()=>{document.getElementById("add-swimmer-form").style.display="none",document.getElementById("add-swimmer-toggle-btn").style.display=""}),(S=document.getElementById("save-swimmer-btn"))==null||S.addEventListener("click",async()=>{const h=document.getElementById("new-swimmer-first").value.trim(),R=document.getElementById("new-swimmer-last").value.trim();if(!h||!R){alert(o("dash_profile_swimmer_required"));return}const O={firstName:h,lastName:R,middleName:document.getElementById("new-swimmer-middle").value.trim()||null,gender:document.getElementById("new-swimmer-gender").value||null,dob:document.getElementById("new-swimmer-dob").value||null,usaSwimmingId:document.getElementById("new-swimmer-usaId").value.trim()||null,joinDate:null},V=[...N.swimmers,O];try{await se(A($,"registrations",ye),{swimmers:V}),N.swimmers=V,F="profile",H()}catch(T){console.error("Error adding swimmer:",T),alert(o("dash_profile_swimmer_add_failed"))}}),document.querySelectorAll(".delete-swimmer-btn").forEach(h=>{h.addEventListener("click",()=>{const R=parseInt(h.dataset.index),O=N.swimmers[R],V=[O.firstName,O.lastName].filter(Boolean).join(" ");xs(V,R)})}),(E=document.getElementById("update-password-btn"))==null||E.addEventListener("click",async()=>{const h=document.getElementById("password-update-msg"),R=document.getElementById("change-current-password").value,O=document.getElementById("change-new-password").value,V=document.getElementById("change-confirm-password").value;h.style.display="none",h.style.color="";const T=document.getElementById("update-password-btn");if(T&&(T.disabled=!0),!R||!O||!V){h.textContent="All fields are required.",h.style.color="var(--color-accent, #DC2626)",h.style.display="block",T&&(T.disabled=!1);return}if(O!==V){h.textContent=o("dash_profile_password_mismatch"),h.style.color="var(--color-accent, #DC2626)",h.style.display="block",T&&(T.disabled=!1);return}if(O.length<6){h.textContent="Password must be at least 6 characters.",h.style.color="var(--color-accent, #DC2626)",h.style.display="block",T&&(T.disabled=!1);return}try{const X=nt.credential(w.email,R);await ot(w,X),await it(w,O),h.textContent=o("dash_profile_password_success"),h.style.color="#16A34A",h.style.display="block",document.getElementById("change-current-password").value="",document.getElementById("change-new-password").value="",document.getElementById("change-confirm-password").value=""}catch(X){console.error("Password update error:",X),X.code==="auth/wrong-password"||X.code==="auth/invalid-credential"?h.textContent=o("dash_profile_password_wrong"):h.textContent=o("dash_profile_password_error")+" "+(X.message||""),h.style.color="var(--color-accent, #DC2626)",h.style.display="block"}finally{T&&(T.disabled=!1)}}),fe==="coach"){const h=document.getElementById("add-meet-form"),R=document.getElementById("save-meet-btn"),O=document.getElementById("cancel-meet-btn"),V=document.getElementById("meet-form-title");(L=document.getElementById("add-meet-btn"))==null||L.addEventListener("click",()=>{de=null,V.textContent=o("dash_meets_new_title"),R.textContent=o("dash_meets_save"),document.getElementById("meet-name").value="",document.getElementById("meet-start-date").value="",document.getElementById("meet-end-date").value="",document.getElementById("meet-location").value="",h.style.display="block"}),O==null||O.addEventListener("click",()=>{h.style.display="none",de=null}),R==null||R.addEventListener("click",async()=>{var M;const u=document.getElementById("meet-name").value.trim(),g=document.getElementById("meet-start-date").value,x=document.getElementById("meet-end-date").value,D=document.getElementById("meet-location").value.trim(),y=((M=document.getElementById("meet-season"))==null?void 0:M.value)||I;if(!u||!g||!x){alert(o("dash_meets_name_date_required"));return}try{de?await se(A($,"meets",de),{name:u,startDate:g,endDate:x,location:D,season:y}):await Le(te($,"meets"),{name:u,startDate:g,endDate:x,location:D,season:y,status:"Open",createdAt:new Date}),h.style.display="none",de=null}catch(P){console.error("Error saving meet:",P)}}),document.querySelectorAll(".edit-meet").forEach(u=>{u.addEventListener("click",()=>{de=u.dataset.id,V.textContent=o("dash_meets_edit_title"),R.textContent=o("dash_meets_update"),document.getElementById("meet-name").value=u.dataset.name,document.getElementById("meet-start-date").value=u.dataset.start,document.getElementById("meet-end-date").value=u.dataset.end,document.getElementById("meet-location").value=u.dataset.location;const g=document.getElementById("meet-season");g&&(g.value=u.dataset.season||I),h.style.display="block",h.scrollIntoView({behavior:"smooth"})})}),document.querySelectorAll(".delete-meet").forEach(u=>{u.addEventListener("click",async()=>{if(confirm(o("dash_meets_confirm_delete")))try{await Fe(A($,"meets",u.dataset.id)),de===u.dataset.id&&(h.style.display="none",de=null)}catch(g){console.error("Error deleting meet:",g)}})}),document.querySelectorAll(".meet-fee-btn").forEach(u=>{u.addEventListener("click",()=>{je(u.dataset.id,u.dataset.name)})});const T=document.getElementById("add-session-form"),X=document.getElementById("save-session-btn"),we=document.getElementById("cancel-session-btn"),Se=document.getElementById("session-form-title");(q=document.getElementById("add-session-btn"))==null||q.addEventListener("click",()=>{le=null,Se.textContent=o("dash_schedule_new_title"),X.textContent=o("dash_schedule_save"),document.getElementById("session-day").value=ce(1),document.getElementById("session-start-time").value="",document.getElementById("session-end-time").value="",document.getElementById("session-location").value="",T.style.display="block"}),we==null||we.addEventListener("click",()=>{T.style.display="none",le=null}),X==null||X.addEventListener("click",async()=>{const u=document.getElementById("session-day").value,g=document.getElementById("session-start-time").value.trim(),x=document.getElementById("session-end-time").value.trim(),D=document.getElementById("session-location").value.trim();if(!u||!g||!x){alert(o("dash_schedule_required_fields"));return}try{le?await se(A($,"schedules",le),{day:u,startTime:g,endTime:x,location:D}):await Le(te($,"schedules"),{day:u,startTime:g,endTime:x,location:D,createdAt:new Date}),T.style.display="none",le=null}catch(y){console.error("Error saving session:",y)}}),document.querySelectorAll(".edit-session").forEach(u=>{u.addEventListener("click",()=>{le=u.dataset.id,Se.textContent=o("dash_schedule_edit_title"),X.textContent=o("dash_schedule_update"),document.getElementById("session-day").value=u.dataset.day,document.getElementById("session-start-time").value=u.dataset.start,document.getElementById("session-end-time").value=u.dataset.end,document.getElementById("session-location").value=u.dataset.location,T.style.display="block",T.scrollIntoView({behavior:"smooth"})})}),document.querySelectorAll(".delete-session").forEach(u=>{u.addEventListener("click",async()=>{if(confirm(o("dash_schedule_delete_confirm")))try{await Fe(A($,"schedules",u.dataset.id)),le===u.dataset.id&&(T.style.display="none",le=null)}catch(g){console.error("Error deleting session:",g)}})}),(z=document.getElementById("import-csv-btn"))==null||z.addEventListener("click",()=>{const u=document.createElement("input");u.type="file",u.accept=".csv",u.addEventListener("change",Is),u.click()}),(ae=document.getElementById("season-select"))==null||ae.addEventListener("change",u=>{I=u.target.value,H()}),(Q=document.getElementById("goto-deposits-link"))==null||Q.addEventListener("click",u=>{u.preventDefault(),F="deposits",H()}),(oe=document.querySelector(".fee-summary-table tbody"))==null||oe.addEventListener("click",u=>{const g=u.target.closest(".fee-summary-main-row");if(!g)return;const x=g.dataset.feeIndex,D=document.querySelector(`.fee-summary-detail-row[data-fee-detail="${x}"]`);if(!D)return;const y=g.querySelector(".fee-summary-expand-icon"),M=D.classList.toggle("expanded");g.classList.toggle("expanded-row",M),y&&(y.classList.toggle("expanded",M),y.textContent=M?"▼":"▶")}),(pe=document.getElementById("fee-summary-export-btn"))==null||pe.addEventListener("click",()=>{ys()}),(ie=document.getElementById("deposits-season-select"))==null||ie.addEventListener("change",u=>{I=u.target.value,H()}),(ue=document.getElementById("roster-season-select"))==null||ue.addEventListener("change",u=>{I=u.target.value,H()}),(be=document.getElementById("deposits-add-btn"))==null||be.addEventListener("click",()=>{document.getElementById("deposits-add-form").style.display="block",document.getElementById("deposits-add-form").scrollIntoView({behavior:"smooth"})}),(J=document.getElementById("deposits-add-cancel"))==null||J.addEventListener("click",()=>{document.getElementById("deposits-add-form").style.display="none",document.getElementById("deposits-add-name").value="",document.getElementById("deposits-add-balance").value=""}),(re=document.getElementById("deposits-add-save"))==null||re.addEventListener("click",async()=>{const u=document.getElementById("deposits-add-name").value.trim(),g=parseFloat(document.getElementById("deposits-add-balance").value)||0;if(!u){alert("Swimmer name is required.");return}try{await Le(te($,"deposits"),{swimmerName:u,season:I,balance:g,deposit1Amount:null,deposit1Date:null,deposit2Amount:null,deposit2Date:null,deposit3Amount:null,deposit3Date:null,updatedAt:new Date,updatedBy:(w==null?void 0:w.email)||"unknown"}),document.getElementById("deposits-add-form").style.display="none",document.getElementById("deposits-add-name").value="",document.getElementById("deposits-add-balance").value=""}catch(x){console.error("Error adding deposit:",x),alert("Failed to add deposit.")}}),(U=document.getElementById("deposits-upload-balance-btn"))==null||U.addEventListener("click",()=>{const u=document.createElement("input");u.type="file",u.accept=".xls,.xlsx",u.addEventListener("change",async g=>{var y;const x=(y=g.target.files)==null?void 0:y[0];if(g.target.remove(),!x)return;const D=await ds(x);if(!D){alert(o("dash_fee_summary_deposit_parse_error"));return}ls(D.valid,D.errors||[],x.name)}),u.click()}),(K=document.getElementById("deposits-upload-detail-btn"))==null||K.addEventListener("click",()=>{const u=document.createElement("input");u.type="file",u.accept=".xls,.xlsx",u.addEventListener("change",async g=>{var y;const x=(y=g.target.files)==null?void 0:y[0];if(g.target.remove(),!x)return;const D=await ms(x);if(!D){alert(o("dash_fee_summary_deposit_parse_error"));return}ps(D.valid,D.errors||[],x.name)}),u.click()}),(f=document.getElementById("deposits-export-btn"))==null||f.addEventListener("click",()=>{fs()}),hs(),(C=document.getElementById("save-creds-btn"))==null||C.addEventListener("click",async()=>{var y,M,P;const u=document.getElementById("creds-message"),g=((y=document.getElementById("creds-device-id"))==null?void 0:y.value)||"",x=((M=document.getElementById("creds-sub-id"))==null?void 0:M.value)||"",D=((P=document.getElementById("creds-session-id"))==null?void 0:P.value)||"";if(!g||!x||!D){u.textContent="❌ Please fill in all three credential fields.",u.style.color="var(--color-accent)";return}try{await qt(g,x,D),u.textContent="✅ Credentials saved to Firestore.",u.style.color="#16A34A",setTimeout(()=>{u.textContent=""},3e3),H()}catch(xe){u.textContent="❌ Save failed: "+xe.message,u.style.color="var(--color-accent)"}}),(B=document.getElementById("toggle-guide-btn"))==null||B.addEventListener("click",()=>{const u=document.getElementById("credential-guide");u&&(u.style.display=u.style.display==="none"?"block":"none")});const he=document.getElementById("results-athlete-select"),ee=document.getElementById("refetch-one-btn");he==null||he.addEventListener("change",u=>{const g=u.target.value;if(g)Je(g),ee&&(ee.disabled=!1);else{const x=document.getElementById("results-viewer");x&&(x.style.display="none"),ee&&(ee.disabled=!0)}}),ee==null||ee.addEventListener("click",async()=>{var D;const u=he==null?void 0:he.value;if(!u)return;if(!j||!j.sessionId){alert("Please configure API credentials first.");return}ee.disabled=!0,ee.textContent="⏳ Fetching...";const g=document.getElementById("fetch-log");g.style.display="block";const x=(y,M)=>{const P=document.createElement("div");P.textContent=`[${new Date().toLocaleTimeString()}] ${y}`,P.style.color=M?"var(--color-accent)":"var(--text-primary)",g.appendChild(P),g.scrollTop=g.scrollHeight};try{x(`🔄 Force-refetching athlete ${u}...`);const y=((D=he.selectedOptions[0])==null?void 0:D.text)||"",M=await ht(j,u,y,{force:!0,onLog:(P,xe)=>x(`   ${P}`,xe),onBestTimes:P=>x(`   📊 bestTimes: ${P.length} entries`)});x(`✅ Done — ${M.fetched} meets fetched, ${M.failed} failed`),M.errors.length>0&&(M.errors.slice(0,5).forEach(P=>x(`   ⚠ ${P}`,!0)),M.errors.length>5&&x(`   …and ${M.errors.length-5} more`,!0)),Je(u),ut()}catch(y){x(`❌ Refetch failed: ${y.message}`,!0)}finally{ee.disabled=!1,ee.textContent="🔄 Refetch Selected Athlete"}}),(Y=document.getElementById("fetch-all-btn"))==null||Y.addEventListener("click",async()=>{if(_e)return;if(!j||!j.deviceId||!j.sessionId){alert("Please configure and save API credentials first.");return}_e=!0;const u=document.getElementById("fetch-log"),g=document.getElementById("fetch-status"),x=document.getElementById("fetch-all-btn");u.style.display="block",u.innerHTML="",x.disabled=!0,x.textContent="⏳ Fetching...";const D=(y,M)=>{const P=document.createElement("div");P.textContent=`[${new Date().toLocaleTimeString()}] ${y}`,P.style.color=M?"var(--color-accent)":"var(--text-primary)",u.appendChild(P),u.scrollTop=u.scrollHeight};await Ut(j,y=>{switch(y.type){case"start":D(`🚀 Starting fetch for ${y.total} athlete(s)...`),g.textContent=`⏳ 0 / ${y.total}`;break;case"swimmer-start":D(`🔄 ${y.name} (${y.memberId})...`);break;case"step":D(`   📊 ${y.step}: ${y.count} entries`);break;case"log":D(`   ${y.message}`,y.isError);break;case"swimmer-done":y.written?D(`   ✅ Written: ${y.bestTimes} best times, ${y.meets} meets (${y.newMeets} new${y.failedMeets>0?`, ${y.failedMeets} failed`:""})`):D("   ⏭ Skipped: no new meets");const M=document.getElementById(`status-${y.memberId}`);M&&(M.innerHTML=`<span style="color:#16A34A;">✅ ${y.bestTimes} best times, ${y.meets} meets</span>`);break;case"swimmer-error":D(`   ❌ Failed: ${y.error}`,!0);const P=document.getElementById(`status-${y.memberId}`);P&&(P.innerHTML=`<span style="color:var(--color-accent);">❌ ${_(y.error)}</span>`);break;case"progress":g.textContent=`⏳ ${y.index} / ${y.total} (✅ ${y.success} ❌ ${y.failed})`;break;case"done":g.textContent=`✅ Done: ${y.success} succeeded, ${y.failed} failed`,g.style.color=y.failed>0?"var(--color-accent)":"#16A34A",D(""),D(`✅ Fetch complete — ${y.success} succeeded, ${y.failed} failed`),y.errors.length>0&&(D("Error details:",!0),y.errors.forEach(xe=>D(`  • ${xe}`,!0))),_e=!1,x.disabled=!1,x.textContent="🔄 Fetch All Swimmer Results";break;case"error":D(`❌ ${y.message}`,!0),g.textContent="❌ Failed",g.style.color="var(--color-accent)",_e=!1,x.disabled=!1,x.textContent="🔄 Fetch All Swimmer Results";break}})})}}kt();
