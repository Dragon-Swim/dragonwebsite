import{i as Fe,t as n,a as ut}from"./i18n-CRIkWtj0.js";import{o as ht,h as Z,g as k,e as g,b as Le,q as _e,l as Se,c as J,k as De,u as K,t as He,E as Ze,r as et,v as tt,a as Ce,f as Ne,w as ft,i as yt,m as Me,x as je}from"./firebase-BSPq4bKM.js";import{X as vt}from"./xlsx-DkFutVy2.js";window.XLSX=vt;Fe();const Ae=[{id:1,name:"Endurance Base Building",season:"Winter 2026",daysPerWeek:4,priority:"High",progress:72,tasks:"18 / 25 workouts completed",due:"Feb 28, 2026",status:"In Progress"},{id:2,name:"Sprint Technique Focus",season:"Spring 2026",daysPerWeek:3,priority:"Medium",progress:45,tasks:"9 / 20 workouts completed",due:"Mar 15, 2026",status:"In Progress"},{id:3,name:"Stroke Refinement (Butterfly)",season:"Summer 2026",daysPerWeek:5,priority:"Low",progress:0,tasks:"0 / 12 workouts completed",due:"Apr 30, 2026",status:"Not Started"},{id:4,name:"Fall Conditioning",season:"Fall 2025",daysPerWeek:3,priority:"High",progress:100,tasks:"30 / 30 workouts completed",due:"Nov 20, 2025",status:"Completed"}];let ne=[],te=null,qe=[],se=null,v=null,le="swimmer",Y=null,B=null,ce=null,me=[],pe=[],$=ke(),N="overview",Ue=!1;function gt(){const t=document.getElementById("app");t.innerHTML=`
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; gap: 20px; font-family: sans-serif;">
      <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #f5c518; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <p style="color: #666;">${n("dash_loading")}</p>
      <style>
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    </div>
  `,console.log("Dashboard: Initializing auth listener...");const e=setTimeout(()=>{console.warn("Dashboard: Auth listener timed out — redirecting to signin"),window.location.href="/signin.html"},5e3);ht(Le,async a=>{if(clearTimeout(e),!a){console.log("Dashboard: No user authenticated, redirecting to signin..."),window.location.href="/signin.html";return}v=a,console.log("Dashboard: User authenticated:",a.email);try{console.log("Dashboard: Fetching user document...");const s=await Z(k(g,"users",a.uid));Y=s.exists()?s.data().role:null;const i=a.email&&a.email.toLowerCase()==="dragonswim@outlook.com";le=Y==="coach"||Y==="admin"||i?"coach":Y||"swimmer",console.log("Dashboard: Detected role:",le),Ue?(console.log("Dashboard: Refreshing UI..."),q()):(console.log("Dashboard: Initializing data listeners..."),bt(),le==="coach"&&At().then(()=>{console.log("Dashboard: Swim API credentials loaded:",!!L)}),Ue=!0,q())}catch(s){console.error("Dashboard Critical Error:",s),t.innerHTML=`
        <div style="padding: 40px; text-align: center; font-family: sans-serif; max-width: 500px; margin: 100px auto; border: 1px solid #fee2e2; background: #fef2f2; border-radius: 12px; color: #991b1b;">
          <h2 style="margin-bottom: 16px;">${n("dash_load_failed_title")}</h2>
          <p style="margin-bottom: 24px;">${n("dash_load_failed_msg")}</p>
          <code style="display: block; padding: 12px; background: #fee2e2; border-radius: 6px; font-size: 13px; text-align: left; overflow-x: auto; margin-bottom: 24px;">
            ${s.message||n("dash_unknown_error")}
          </code>
          <button onclick="window.location.reload()" style="padding: 10px 20px; background: #991b1b; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">${n("dash_load_failed_retry")}</button>
        </div>
      `,le="swimmer"}})}function bt(){const t=_e(J(g,"meets"),Se("createdAt","desc"));De(t,a=>{ne=a.docs.map(s=>({id:s.id,...s.data()})),q()},a=>{console.error("Error listening to meets:",a)});const e=_e(J(g,"schedules"),Se("createdAt","asc"));if(De(e,a=>{qe=a.docs.map(s=>({id:s.id,...s.data()})),q()},a=>{console.error("Error listening to schedules:",a)}),le==="coach"){const a=_e(J(g,"registrations"),Se("createdAt","desc"));De(a,i=>{me=i.docs.map(o=>({id:o.id,...o.data()})),q()},i=>{console.error("Error listening to registrations:",i)});const s=_e(J(g,"deposits"),Se("swimmerName","asc"));De(s,i=>{pe=i.docs.map(o=>({id:o.id,...o.data()})),q()},i=>{console.error("Error listening to deposits:",i)})}}async function wt(){if(!v)return;const t=k(g,"registrations",v.uid),e=await Z(t);if(e.exists()){ce=e.id,B=e.data(),console.log("fetchFamilyData: found own registration",e.id);return}if(v.email){const a=v.email.toLowerCase().trim();console.log("fetchFamilyData: looking for spouse access with email:",a);try{const s=_e(J(g,"registrations"),ft("parentEmails","array-contains",a)),i=await yt(s);if(console.log("fetchFamilyData: spouse query returned",i.size,"docs"),!i.empty){const o=i.docs[0];ce=o.id,B=o.data(),console.log("fetchFamilyData: found via spouse access",ce,"parentEmails:",B.parentEmails);const r=B.editors||[];r.includes(v.uid)||(r.push(v.uid),await K(k(g,"registrations",ce),{editors:r}).catch(d=>{console.error("fetchFamilyData: failed to add editor:",d)}),B.editors=r);return}console.warn("fetchFamilyData: no registration found for spouse email",a)}catch(s){console.error("fetchFamilyData: spouse query failed:",s)}}else console.warn("fetchFamilyData: currentUser.email is empty")}function q(){v&&wt().then(()=>{Oe()}).catch(t=>{console.error("Error fetching family data:",t),Oe()})}function Oe(){le==="coach"?Et(v):$t(v)}const _t=["dash_day_sunday","dash_day_monday","dash_day_tuesday","dash_day_wednesday","dash_day_thursday","dash_day_friday","dash_day_saturday"];function ae(t){return n(_t[t]||"dash_day_monday")}function $t(t){const e=document.getElementById("app");e.innerHTML=`
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
            <span class="dash-nav-label">${n("dash_sidebar_menu")}</span>
            <button class="dash-nav-item ${N==="overview"?"active":""}" data-tab="overview">
              <span class="dash-nav-icon">📊</span> ${n("dash_swimmer_overview_label")}
            </button>
            <button class="dash-nav-item ${N==="profile"?"active":""}" data-tab="profile">
              <span class="dash-nav-icon">👤</span> ${n("dash_swimmer_profile_label")}
            </button>
            <button class="dash-nav-item ${N==="plans"?"active":""}" data-tab="plans">
              <span class="dash-nav-icon">📋</span> ${n("dash_swimmer_plans_label")}
            </button>
            <button class="dash-nav-item ${N==="meets"?"active":""}" data-tab="meets">
              <span class="dash-nav-icon">🏆</span> ${n("dash_swimmer_meets_label")}
            </button>
            <button class="dash-nav-item ${N==="schedule"?"active":""}" data-tab="schedule">
              <span class="dash-nav-icon">📅</span> ${n("dash_swimmer_schedule_label")}
            </button>
          </div>
          <div class="dash-nav-section" style="margin-top: auto;">
            <span class="dash-nav-label">${n("dash_sidebar_system")}</span>
            ${Y==="admin"?`
            <a href="/admin.html" class="dash-nav-item" style="text-decoration: none;">
              <span class="dash-nav-icon">⚙️</span> ${n("dash_sidebar_admin")}
            </a>
            `:""}
            <button class="dash-nav-item" id="dash-theme-toggle">
              <span class="dash-nav-icon" id="sidebar-theme-icon">🌙</span> ${n("dash_sidebar_theme")}
            </button>
            <button class="dash-nav-item" id="sidebar-signout" style="color: var(--color-accent); margin-top: var(--space-md);">
              <span class="dash-nav-icon">🚪</span> ${n("dash_sidebar_signout")}
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
              <h1 class="dash-page-title">${st(N)}</h1>
              <p class="dash-page-subtitle">${xt(N)}</p>
            </div>
          </div>
          <div class="dash-topbar-right">
            <div class="dash-user-menu" id="user-menu">
              <button class="dash-user-trigger" id="user-trigger">
                <div class="dash-avatar">${(Ve()||t.email||n("dash_swimmer_username_fallback")).charAt(0).toUpperCase()}</div>
                <span class="dash-user-name">${Ve()||t.email||n("dash_swimmer_username_fallback")}</span>
                <span class="dash-dropdown-arrow">▾</span>
              </button>
              <div class="dash-dropdown" id="user-dropdown" style="display: none;">
                <button class="dash-dropdown-item" id="menu-profile">${n("dash_user_menu_profile")}</button>
                ${Y==="admin"?`<button class="dash-dropdown-item" id="menu-admin">${n("dash_user_menu_admin")}</button>`:""}
                ${v&&v.providerData&&v.providerData[0].providerId==="password"?`<button class="dash-dropdown-item" id="menu-password">🔑 ${n("dash_profile_password_btn")}</button>`:""}
                <button class="dash-dropdown-item" id="menu-signout" style="color: var(--color-accent);">${n("dash_user_menu_signout")}</button>
              </div>
            </div>
          </div>
        </header>

        <div class="dash-content">
          ${at(N,"swimmer")}
        </div>
      </main>
    </div>
  `,pt(),Fe(),nt()}function Et(t){const e=document.getElementById("app");e.innerHTML=`
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
            <span class="dash-nav-label">${n("dash_coach_menu")}</span>
            <button class="dash-nav-item ${N==="overview"?"active":""}" data-tab="overview">
              <span class="dash-nav-icon">🏠</span> ${n("dash_coach_overview_label")}
            </button>
            <button class="dash-nav-item ${N==="roster"?"active":""}" data-tab="roster">
              <span class="dash-nav-icon">👥</span> ${n("dash_coach_roster_label")}
            </button>
            <button class="dash-nav-item ${N==="meets"?"active":""}" data-tab="meets">
              <span class="dash-nav-icon">🏁</span> ${n("dash_coach_meets_label")}
            </button>
            <button class="dash-nav-item ${N==="schedule"?"active":""}" data-tab="schedule">
              <span class="dash-nav-icon">⏱️</span> ${n("dash_coach_schedule_label")}
            </button>
            <button class="dash-nav-item ${N==="results"?"active":""}" data-tab="results">
              <span class="dash-nav-icon">🏊</span> Swim Times
            </button>
            ${Y==="admin"?`
            <button class="dash-nav-item ${N==="feesummary"?"active":""}" data-tab="feesummary">
              <span class="dash-nav-icon">💰</span> ${n("dash_coach_fee_summary_label")}
            </button>
            <button class="dash-nav-item ${N==="deposits"?"active":""}" data-tab="deposits">
              <span class="dash-nav-icon">🏦</span> ${n("dash_coach_deposits_label")}
            </button>
            `:""}
          </div>
          <div class="dash-nav-section" style="margin-top: auto;">
            <span class="dash-nav-label">${n("dash_sidebar_system")}</span>
            ${Y==="admin"?`
            <a href="/admin.html" class="dash-nav-item" style="text-decoration: none;">
              <span class="dash-nav-icon">⚙️</span> ${n("dash_sidebar_admin")}
            </a>
            `:""}
            <button class="dash-nav-item" id="dash-theme-toggle">
              <span class="dash-nav-icon" id="sidebar-theme-icon">🌙</span> ${n("dash_sidebar_theme")}
            </button>
            <button class="dash-nav-item" id="sidebar-signout" style="color: var(--color-accent); margin-top: var(--space-md);">
              <span class="dash-nav-icon">🚪</span> ${n("dash_sidebar_signout")}
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
              <h1 class="dash-page-title">Coach: ${st(N,"coach")}</h1>
              <p class="dash-page-subtitle">${n("dash_coach_topbar_sub")}</p>
            </div>
          </div>
          <div class="dash-topbar-right">
            <div class="badge badge-primary" style="margin-right: 1rem;">${n("dash_coach_badge")}</div>
            <div class="dash-user-menu" id="user-menu">
              <button class="dash-user-trigger" id="user-trigger">
                <div class="dash-avatar" style="background: var(--color-accent); color: white;">${(t.displayName||t.email||n("dash_coach_username_fallback")).charAt(0).toUpperCase()}</div>
                <span class="dash-user-name">${t.displayName||t.email||n("dash_coach_username_fallback")}</span>
                <span class="dash-dropdown-arrow">▾</span>
              </button>
              <div class="dash-dropdown" id="user-dropdown" style="display: none;">
                ${Y==="admin"?`<button class="dash-dropdown-item" id="menu-admin">${n("dash_user_menu_admin")}</button>`:""}
                ${v&&v.providerData&&v.providerData[0].providerId==="password"?`<button class="dash-dropdown-item" id="menu-password">🔑 ${n("dash_profile_password_btn")}</button>`:""}
                <button class="dash-dropdown-item" id="menu-signout" style="color: var(--color-accent);">${n("dash_user_menu_signout")}</button>
              </div>
            </div>
          </div>
        </header>

        <div class="dash-content">
          ${at(N,"coach")}
        </div>
      </main>
    </div>
  `,pt(),Fe(),nt()}function Ve(){if(!B||!B.parent)return null;const t=B.parent;return[t.firstName,t.lastName].filter(Boolean).join(" ")||null}function st(t,e="swimmer"){return e==="coach"?{overview:n("dash_coach_tab_overview"),roster:n("dash_coach_tab_roster"),meets:n("dash_coach_tab_meets"),schedule:n("dash_coach_tab_schedule"),results:"Swim Times",feesummary:n("dash_coach_tab_fee_summary"),deposits:n("dash_coach_tab_deposits")}[t]||n("dash_coach_tab_overview"):{overview:n("dash_swimmer_tab_overview"),profile:n("dash_swimmer_tab_profile"),plans:n("dash_swimmer_tab_plans"),meets:n("dash_swimmer_tab_meets"),schedule:n("dash_swimmer_tab_schedule")}[t]||n("dash_swimmer_tab_overview")}function xt(t){return{overview:n("dash_swimmer_overview_sub"),profile:n("dash_swimmer_profile_sub"),plans:n("dash_swimmer_plans_sub"),meets:n("dash_swimmer_meets_sub"),schedule:n("dash_swimmer_schedule_sub")}[t]||""}function at(t,e="swimmer"){if(e==="coach")switch(t){case"overview":return We();case"roster":return Ut();case"meets":return Je();case"schedule":return Ke();case"results":return jt();case"feesummary":return Ot();case"deposits":return Vt();default:return We()}switch(t){case"overview":return ns();case"profile":return rs();case"plans":return ds();case"meets":return Je();case"schedule":return Ke();default:return""}}function nt(){const t=document.getElementById("sidebar-theme-icon");if(t){const e=document.documentElement.getAttribute("data-theme")==="dark";t.textContent=e?"☀️":"🌙"}}function ot(){const t=[];for(const e of me)if(e.swimmers)for(let a=0;a<e.swimmers.length;a++){const s=e.swimmers[a];s.deleted||t.push({...s,parentName:it(e),_regId:e.id,_swimmerIndex:a})}return t}function it(t){return t.parent&&[t.parent.firstName,t.parent.lastName].filter(Boolean).join(" ")||"—"}function It(){const t=new Date;return t.setDate(t.getDate()-30),me.filter(e=>{var s,i;return(((i=(s=e.createdAt)==null?void 0:s.toDate)==null?void 0:i.call(s))||new Date(e.createdAt))>=t})}const ze="https://times-api.usaswimming.org/swims/TimesSearch";let L=null,fe=!1;const V={meetGapMs:3e3,batchSize:15,batchPauseMs:6e4,swimmerGapMs:18e4,retryDelaysMs:[5e3,2e4,6e4],cooldownAfterConsecutive:3,cooldownMs:3e5,emptyCooldownAfter:5,emptyCooldownMs:6e5},St=new Set([406,429,500,502,503,504]),ye=t=>new Promise(e=>setTimeout(e,t));function Pe(t){return{AppName:"DataHub","Usas-Sub-Id":t.subId||"","Device-Id":t.deviceId||"","usas-session-id":t.sessionId||""}}async function Dt(t,e){const a=`${ze}/GetBestTimesForMember/${e}`,s=await fetch(a,{headers:Pe(t)});if(!s.ok)throw new Error(`HTTP ${s.status}`);return s.json()}async function kt(t,e){const a=`${ze}/GetSwimmerMeets/${e}`,s=await fetch(a,{headers:Pe(t)});if(!s.ok)throw new Error(`HTTP ${s.status}`);return s.json()}async function Bt(t,e){const a=new AbortController,s=setTimeout(()=>a.abort(),15e3);try{const i=await fetch(t,{headers:Pe(e),signal:a.signal});if(clearTimeout(s),i.ok)return{ok:!0,data:await i.json()};let o="";try{o=await i.text()}catch{o="(could not read body)"}return{ok:!1,error:new Error(`HTTP ${i.status}: ${o.slice(0,200)}`),retryable:St.has(i.status)}}catch(i){return clearTimeout(s),i.name==="AbortError"?{ok:!1,error:new Error("Timeout (15s)"),retryable:!0}:{ok:!1,error:i,retryable:!0}}}async function Ct(t,e,a){const s=`${ze}/GetSwimmerMeetTimes/${e}/${a}`,i=V.retryDelaysMs;for(let o=0;;o++){const r=await Bt(s,t);if(r.ok)return r.data;if(!r.retryable)throw r.error;if(o>=i.length)throw Object.assign(r.error,{retryable:!0});console.warn(`[fetchMeetTimes] ${e}/${a} attempt ${o+1} failed: ${r.error.message} — retrying in ${i[o]}ms`),await ye(i[o])}}async function At(){try{const t=await Z(k(g,"settings","swimApi"));if(t.exists())return L=t.data(),L}catch(t){console.warn("Failed to load swim API credentials:",t)}return null}async function Lt(t,e,a){const s={deviceId:t.trim(),subId:e.trim(),sessionId:a.trim(),updatedAt:new Date,updatedBy:(v==null?void 0:v.email)||"unknown"};await Me(k(g,"settings","swimApi"),s),L=s}function Re(){const t=[];for(const e of me)if(e.swimmers)for(let a=0;a<e.swimmers.length;a++){const s=e.swimmers[a];s.deleted||t.push({usaSwimmingId:s.usaSwimmingId||null,name:[s.firstName,s.lastName].filter(Boolean).join(" ")||"Unknown",hasId:!!s.usaSwimmingId})}return t}async function Nt(t){try{const e=await Z(k(g,"swimResults",t));if(e.exists())return e.data().meets||{}}catch{}return{}}async function Tt(t){const e=await Z(k(g,"swimResults",t));if(!e.exists())return!1;const a=e.data(),s=Object.keys(a).filter(d=>d.startsWith("meets."));if(s.length===0)return!1;const i={...a.meets||{}};let o=0;for(const d of s){const l=d.slice(6),m=a[d];!m||typeof m!="object"||(i[l]={...m},o++)}const r={...a};for(const d of s)delete r[d];return r.meets=i,await Me(k(g,"swimResults",t),r),console.log(`[Migrate] ${t}: merged ${o} literal meet fields into meets object`),!0}async function Ft(){const t=Re().filter(e=>e.hasId);for(const e of t)try{await Tt(e.usaSwimmingId)}catch(a){console.warn(`[Migrate] ${e.usaSwimmingId} failed:`,a)}}async function Xe(t,e,a,s){const i={[`meets.${e.meetId}`]:{meetName:e.meetName,meetDates:e.meetDates,meetType:e.meetType,courseCode:e.courseCode,season:e.season,seasonYear:e.seasonYear,fetchedAt:new Date().toISOString(),status:s,swims:a},lastUpdated:new Date().toISOString()};await K(k(g,"swimResults",t),i)}async function rt(t,e,a,s={}){const{force:i=!1,onLog:o=()=>{},onBestTimes:r=()=>{}}=s,d=await Nt(e),l=F=>{var U;if(i)return!0;const P=d[F];return P?P.status==="ok"?!1:P.status==="failed"||P.status==="empty"?!0:(((U=P.swims)==null?void 0:U.length)||0)===0:!0},m=await Dt(t,e);r(m),await Me(k(g,"swimResults",e),{memberId:e,swimmerName:a,bestTimes:m,lastUpdated:new Date().toISOString()},{merge:!0});const u=await kt(t,e),p=u.filter(F=>l(F.meetId));o(`📅 ${u.length} meets total, ${p.length} to fetch${p.length?"":" — all up to date"}`);let b=0,_=0;const S=[];let x=0,D=0;for(let F=0;F<p.length;F++){const P=p[F];try{const U=await Ct(t,e,P.meetId),Q=Array.isArray(U)?U:[],oe=Q.length===0?"empty":"ok";await Xe(e,P,Q,oe),b++,x=0,Q.length===0?(D++,D>=V.emptyCooldownAfter&&(o(`⚠ 连续 ${D} 场返回空结果,疑似被软降级 — 暂停 ${V.emptyCooldownMs/6e4} 分钟`,!0),await ye(V.emptyCooldownMs),D=0)):D=0}catch(U){await Xe(e,P,[],"failed"),_++,S.push(`${P.meetName||P.meetId}: ${U.message}`),U.retryable&&(x++,x>=V.cooldownAfterConsecutive&&(o(`⚠ 连续 ${x} 场可重试失败,疑似被限流 — 全局暂停 ${V.cooldownMs/6e4} 分钟`,!0),await ye(V.cooldownMs),x=0))}F+1<p.length&&((F+1)%V.batchSize===0?(o(`⏸ 已处理 ${F+1}/${p.length} 场,中场休息 ${V.batchPauseMs/6e4} 分钟(保护 API 配额)...`),await ye(V.batchPauseMs)):await ye(V.meetGapMs))}return{fetched:b,failed:_,errors:S,bestTimes:m,meets:u}}async function Mt(t,e){const a=Re().filter(r=>r.hasId);if(a.length===0){e({type:"error",message:"No swimmers with USA Swimming ID found."});return}e({type:"start",total:a.length});let s=0,i=0;const o=[];for(let r=0;r<a.length;r++){const d=a[r];e({type:"swimmer-start",index:r,total:a.length,name:d.name,memberId:d.usaSwimmingId});let l=null;try{l=await rt(t,d.usaSwimmingId,d.name,{force:!1,onLog:(u,p)=>e({type:"log",message:u,isError:p}),onBestTimes:u=>e({type:"step",name:d.name,step:"bestTimes",count:u.length})});const m=l.fetched>0||l.failed>0;e({type:"swimmer-done",name:d.name,memberId:d.usaSwimmingId,bestTimes:l.bestTimes.length,meets:l.meets.length,newMeets:l.fetched,failedMeets:l.failed,written:m}),l.failed>0&&o.push(...l.errors.map(u=>`${d.name}: ${u}`)),s++}catch(m){i++,o.push(`${d.name}: ${m.message}`),e({type:"swimmer-error",name:d.name,memberId:d.usaSwimmingId,error:m.message})}e({type:"progress",index:r+1,total:a.length,success:s,failed:i}),l&&r<a.length-1&&(l.fetched>0||l.failed>0)&&(e({type:"log",message:`⏸ 运动员间冷却 ${V.swimmerGapMs/6e4} 分钟...`}),await ye(V.swimmerGapMs))}e({type:"done",total:a.length,success:s,failed:i,errors:o})}function jt(){const t=Re(),e=t.filter(o=>o.hasId),a=t.filter(o=>!o.hasId),s=L&&L.deviceId&&L.sessionId;return`
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
            <input class="form-input" id="creds-device-id" placeholder="Copy from Data Hub" value="${E((L==null?void 0:L.deviceId)||"")}" style="font-family: monospace; font-size: 0.8rem;" />
          </div>
          <div class="form-group">
            <label class="form-label">Usas-Sub-Id <span style="font-size:0.75rem;color:var(--text-muted);">(set once — tied to your account)</span></label>
            <input class="form-input" id="creds-sub-id" placeholder="UUID format" value="${E((L==null?void 0:L.subId)||"")}" style="font-family: monospace; font-size: 0.8rem;" />
          </div>
          <div class="form-group">
            <label class="form-label">usas-session-id <span style="color: var(--color-accent);" title="Expires after a few hours to a day">⚠ expires</span></label>
            <input class="form-input" id="creds-session-id" placeholder="32-char hex — expires, update when broken" value="${E((L==null?void 0:L.sessionId)||"")}" style="font-family: monospace; font-size: 0.8rem;" />
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
          <td style="padding: 0.4rem 0.5rem; color: var(--text-muted);">32-character hex (e.g. <code>6F7FF3AF...</code>). <strong>Expires after a few hours to a day</strong>. You'll need to log in to Data Hub again and copy a fresh one when it stops working.</td>
        </tr>
      </table>
      <p style="margin: 0.75rem 0 0 0; font-size: 0.8rem; color: var(--color-accent);">
        ⚠ <strong>Tip:</strong> Device-Id and Usas-Sub-Id only need to be set once. The session-id is the one you'll need to update periodically — if fetching suddenly fails with auth errors, just log in to Data Hub again and copy a fresh session-id.
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
        Fetch results from USA Swimming for <strong>${e.length}</strong> athlete(s).
        Previously fetched meets are skipped automatically (incremental update).
      </p>
      <div style="display: flex; gap: 0.75rem; margin-bottom: var(--space-md);">
        <button class="btn btn-primary btn-sm" id="fetch-all-btn" ${!s||fe?"disabled":""}>
          ${fe?"⏳ Fetching...":"🔄 Fetch All Swimmer Results"}
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
            ${e.map(o=>`
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 0.5rem 0.6rem; font-weight: 500;">${E(o.name)}</td>
                <td style="padding: 0.5rem 0.6rem; font-family: monospace; font-size: 0.8rem;">${E(o.usaSwimmingId)}</td>
                <td style="padding: 0.5rem 0.6rem;" id="status-${E(o.usaSwimmingId)}">
                  <span style="color: var(--text-muted);">—</span>
                </td>
              </tr>
            `).join("")}
            ${a.map(o=>`
              <tr style="border-bottom: 1px solid var(--border-color); opacity: 0.6;">
                <td style="padding: 0.5rem 0.6rem;">${E(o.name)}</td>
                <td style="padding: 0.5rem 0.6rem; color: var(--color-accent);">Not set</td>
                <td style="padding: 0.5rem 0.6rem;">⚠ Add USA Swimming ID in Profile</td>
              </tr>
            `).join("")}
            ${t.length===0?`
              <tr><td colspan="3" style="padding: 2rem; text-align: center; color: var(--text-muted);">No athlete data yet</td></tr>
            `:""}
          </tbody>
        </table>
      </div>
    </div>

    ${e.length>0?`
    <div class="dash-panel" style="margin-top: 1.5rem;">
      <h3 style="margin: 0 0 var(--space-md) 0;">📊 View Athlete Results</h3>
      <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: var(--space-md); flex-wrap: wrap;">
        <select class="form-input" id="results-athlete-select" style="max-width: 300px;">
          <option value="">— Select an athlete —</option>
          ${e.map(o=>`<option value="${E(o.usaSwimmingId)}">${E(o.name)}</option>`).join("")}
        </select>
        <button class="btn btn-outline btn-sm" id="refetch-one-btn" disabled>🔄 Refetch Selected Athlete</button>
      </div>
      <div id="results-viewer" style="display: none;">
        <div id="results-content"></div>
      </div>
    </div>
    `:""}
  `}function dt(t){if(t==null||t==="")return"—";const e=Number(t);if(isNaN(e))return String(t);if(e<60)return e.toFixed(2);const a=Math.floor(e/60),s=(e%60).toFixed(2);return`${a}:${s.padStart(5,"0")}`}function qt(t){if(!t)return"";const e=t.toUpperCase();return{B:"ts-b",BB:"ts-bb",A:"ts-a",AA:"ts-aa",AAA:"ts-aaa",AAAA:"ts-aaaa"}[e]||""}function zt(t){return{LCM:"LCM (50m)",SCY:"SCY (25yd)",SCM:"SCM (25m)"}[t]||t||"—"}function Pt(t){const e={};for(const[s,i]of Object.entries(t)){const o=i.season||"Unknown";e[o]||(e[o]=[]),e[o].push({meetId:s,...i})}const a={};for(const s of Object.keys(e).sort().reverse())a[s]=e[s].sort((i,o)=>{const r=i.meetDates||"";return(o.meetDates||"").localeCompare(r)});return a}function Rt(t){return!t||t.length===0?'<p style="color:var(--text-muted);text-align:center;padding:1rem;">No best times recorded.</p>':`
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
          ${[...t].sort((a,s)=>a.strokeAbbreviation!==s.strokeAbbreviation?(a.strokeAbbreviation||"").localeCompare(s.strokeAbbreviation||""):(a.distance||0)-(s.distance||0)).map(a=>`
            <tr style="border-bottom:1px solid var(--border-color);">
              <td style="padding:0.4rem 0.5rem;">${a.distance||""} ${a.strokeName||a.stroke||a.strokeAbbreviation||""}</td>
              <td style="padding:0.4rem 0.5rem;font-weight:600;font-family:monospace;">${dt(a.swimTime??a.bestTime)}</td>
              <td style="padding:0.4rem 0.5rem;">${zt(a.courseCode)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `}function Ht(t){if(!t||Object.keys(t).length===0)return'<p style="color:var(--text-muted);text-align:center;padding:1rem;">No meet history recorded.</p>';const e=Pt(t);let a="";for(const[s,i]of Object.entries(e)){const o=`season-${s.replace(/[^a-zA-Z0-9]/g,"-")}`;a+=`
      <div style="margin-bottom: 0.75rem;">
        <button class="btn btn-outline btn-sm season-toggle" data-season="${E(o)}"
                style="width:100%;text-align:left;font-weight:600;display:flex;justify-content:space-between;align-items:center;">
          <span>📅 ${E(s)} Season (${i.length} meet${i.length>1?"s":""})</span>
          <span class="season-arrow" id="arrow-${E(o)}">▶</span>
        </button>
        <div class="season-meets" id="${E(o)}" style="display:none;margin-top:0.5rem;">
          ${i.map(r=>{var l,m;const d=`meet-${r.meetId}`;return`
              <div style="margin-bottom:0.5rem;border:1px solid var(--border-color);border-radius:var(--radius-sm);overflow:hidden;">
                <button class="btn btn-outline btn-sm meet-toggle" data-meet="${E(d)}"
                        style="width:100%;text-align:left;display:flex;justify-content:space-between;align-items:center;padding:0.5rem 0.75rem;border:none;border-radius:0;">
                  <span>🏁 ${E(r.meetName)} <span style="color:var(--text-muted);font-size:0.8rem;">${E(r.courseCode||"")}</span></span>
                  <span style="font-size:0.75rem;color:var(--text-muted);">
                    ${E(r.meetDates||"")} · ${((l=r.swims)==null?void 0:l.length)||0} swim${(((m=r.swims)==null?void 0:m.length)||0)!==1?"s":""}
                    <span class="meet-arrow" id="m-arrow-${E(d)}">▶</span>
                  </span>
                </button>
                <div class="meet-swims" id="${E(d)}" style="display:none;">
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
                        ${r.swims.map(u=>`
                          <tr style="border-bottom:1px solid var(--border-color);">
                            <td style="padding:0.3rem 0.5rem;">${u.eventCode||`${u.distance||""} ${u.strokeAbbreviation||""}`}</td>
                            <td style="padding:0.3rem 0.5rem;font-family:monospace;font-weight:500;">${dt(u.swimTime)}</td>
                            <td style="padding:0.3rem 0.5rem;">${u.sessionName||"—"}</td>
                            <td style="padding:0.3rem 0.5rem;">${u.finishPosition!=null?u.finishPosition:"—"}</td>
                            <td style="padding:0.3rem 0.5rem;">
                              ${u.timeStandard?`<span class="ts-badge ${qt(u.timeStandard)}">${E(u.timeStandard)}</span>`:"—"}
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
    `}return a}async function Ye(t){var s;const e=document.getElementById("results-viewer"),a=document.getElementById("results-content");if(!(!e||!a)){e.style.display="block",a.innerHTML='<p style="text-align:center;padding:2rem;color:var(--text-muted);">⏳ Loading...</p>';try{const i=await Z(k(g,"swimResults",t));if(!i.exists()){a.innerHTML='<p style="text-align:center;padding:2rem;color:var(--text-muted);">No results data yet. Run a fetch first.</p>';return}const o=i.data();console.log("[Results] Loaded data for",t,":",o),console.log("[Results] bestTimes:",(s=o.bestTimes)==null?void 0:s.length,"meets:",Object.keys(o.meets||{}).length),a.innerHTML=`
      <div style="margin-bottom:1.5rem;">
        <h4 style="margin:0 0 0.75rem 0;display:flex;align-items:center;gap:0.5rem;">
          🏆 Best Times (${(o.bestTimes||[]).length} entries)
          <span style="font-size:0.75rem;color:var(--text-muted);font-weight:400;">
            Last updated: ${o.lastUpdated?new Date(o.lastUpdated).toLocaleString():"—"}
          </span>
        </h4>
        ${Rt(o.bestTimes)}
      </div>

      <div>
        <h4 style="margin:0 0 0.75rem 0;">📅 Meet History (${Object.keys(o.meets||{}).length} meets)</h4>
        <div id="meet-history-container">
          ${Ht(o.meets)}
        </div>
      </div>

      <details style="margin-top:1.5rem;border-top:1px solid var(--border-color);padding-top:1rem;">
        <summary style="cursor:pointer;color:var(--text-muted);font-size:0.8rem;">🔍 Debug: Raw JSON</summary>
        <pre style="background:var(--bg-primary);border:1px solid var(--border-color);border-radius:var(--radius-sm);padding:0.75rem;max-height:400px;overflow:auto;font-size:0.7rem;line-height:1.4;margin-top:0.5rem;">${E(JSON.stringify(o,null,2))}</pre>
      </details>
    `,a.querySelectorAll(".season-toggle").forEach(r=>{r.addEventListener("click",()=>{const d=r.dataset.season,l=document.getElementById(d),m=document.getElementById("arrow-"+d);if(!l)return;const u=l.style.display!=="none";l.style.display=u?"none":"block",m&&(m.textContent=u?"▶":"▼")})}),a.querySelectorAll(".meet-toggle").forEach(r=>{r.addEventListener("click",()=>{const d=r.dataset.meet,l=document.getElementById(d),m=document.getElementById("m-arrow-"+d);if(!l)return;const u=l.style.display!=="none";l.style.display=u?"none":"block",m&&(m.textContent=u?"▶":"▼")})})}catch(i){a.innerHTML=`<p style="text-align:center;padding:2rem;color:var(--color-accent);">Failed to load results: ${E(i.message)}</p>`,console.error("loadAthleteResults:",i)}}}function We(){const t=ot(),e=It(),a=ne.filter(s=>s.status!=="Completed");return`
    <div class="dash-stats-row">
      <div class="dash-stat-card">
        <div class="dash-stat-number">${t.length}</div>
        <div class="dash-stat-label">${n("dash_coach_active_athletes")}</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${e.length}</div>
        <div class="dash-stat-label">${n("dash_coach_new_registrations")}</div>
      </div>
      <div class="dash-stat-card accent">
        <div class="dash-stat-number">${a.length}</div>
        <div class="dash-stat-label">${n("dash_coach_upcoming_meets")}</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${me.length}</div>
        <div class="dash-stat-label">${n("dash_coach_registered_families")}</div>
      </div>
    </div>

    <div class="dash-overview-grid">
      <div class="dash-panel">
        <h3 class="dash-panel-title">${n("dash_coach_top_athletes")}</h3>
        <div class="dash-panel-body">
          ${t.length===0?`<p class="dash-empty">${n("dash_coach_no_swimmers")}</p>`:t.slice(0,5).map(s=>`
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
        <h3 class="dash-panel-title">${n("dash_coach_recent_registrations")}</h3>
        <div class="dash-panel-body">
          ${e.length===0?`<p class="dash-empty">${n("dash_coach_no_recent")}</p>`:e.slice(0,5).map(s=>`
            <div class="dash-mini-card">
              <div class="dash-mini-top"><span class="dash-mini-name">${it(s)}</span></div>
              <div class="dash-mini-meta">${s.swimmers?s.swimmers.filter(i=>!i.deleted).length:0} swimmer(s)</div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `}function Ut(){const t=ot(),e=Y==="admin",a=e?`<tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
        <th style="padding: 0.5rem;">${n("dash_coach_roster_name")}</th>
        <th style="padding: 0.5rem;">${n("dash_coach_roster_age")}</th>
        <th style="padding: 0.5rem;">${n("dash_coach_roster_gender")}</th>
        <th style="padding: 0.5rem;">${n("dash_coach_roster_pmt1_amt")}</th>
        <th style="padding: 0.5rem;">${n("dash_coach_roster_pmt1_date")}</th>
        <th style="padding: 0.5rem;">${n("dash_coach_roster_pmt2_amt")}</th>
        <th style="padding: 0.5rem;">${n("dash_coach_roster_pmt2_date")}</th>
        <th style="padding: 0.5rem;">${n("dash_coach_roster_pmt3_amt")}</th>
        <th style="padding: 0.5rem;">${n("dash_coach_roster_pmt3_date")}</th>
      </tr>`:`<tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
        <th style="padding: 1rem;">${n("dash_coach_roster_name")}</th>
        <th style="padding: 1rem;">${n("dash_coach_roster_parent")}</th>
        <th style="padding: 1rem;">${n("dash_coach_roster_age")}</th>
        <th style="padding: 1rem;">${n("dash_coach_roster_gender")}</th>
        <th style="padding: 1rem;">${n("dash_coach_roster_usa_id")}</th>
      </tr>`;function s(o,r){const l=(o.payments||{})[$]||{};return l[r]!=null?l[r]:""}const i="width: 95%; padding: 0.3rem 0.35rem; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-primary); color: var(--text-primary); font-size: 0.75rem;";return`
    <div class="dash-panel">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.75rem;">
        <h3 class="dash-panel-title" style="margin-bottom: 0; border-bottom: none; padding-bottom: 0;">${n("dash_coach_roster_title")} (${t.length} athletes)</h3>
        ${Yt($)}
      </div>
      <div class="dash-panel-body">
        ${t.length===0?`<p class="dash-empty">${n("dash_coach_no_swimmers")}</p>`:`
        <div class="roster-table-wrapper" style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.8rem; min-width: ${e?"950px":"auto"};">
          <thead>${a}</thead>
          <tbody>
            ${t.map(o=>{const r=o.dob?Math.floor((new Date-new Date(o.dob))/315576e5):"—";return e?`
                  <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 0.4rem 0.5rem; font-weight: 500; white-space: nowrap;">${[o.firstName,o.lastName].filter(Boolean).join(" ")}</td>
                    <td style="padding: 0.4rem 0.5rem;">${r}</td>
                    <td style="padding: 0.4rem 0.5rem;">${o.gender||"—"}</td>
                    <td style="padding: 0.2rem 0.3rem;">
                      <input type="number" step="0.01" min="0"
                        class="roster-pmt-input"
                        data-reg-id="${o._regId}"
                        data-swimmer-index="${o._swimmerIndex}"
                        data-field="amount1"
                        data-season="${$}"
                        value="${s(o,"amount1")}"
                        onchange="window.__updateSwimmerPayment(this)"
                        placeholder="0.00"
                        style="${i}" />
                    </td>
                    <td style="padding: 0.2rem 0.3rem;">
                      <input type="date"
                        class="roster-pmt-input"
                        data-reg-id="${o._regId}"
                        data-swimmer-index="${o._swimmerIndex}"
                        data-field="date1"
                        data-season="${$}"
                        value="${s(o,"date1")}"
                        onchange="window.__updateSwimmerPayment(this)"
                        style="${i}" />
                    </td>
                    <td style="padding: 0.2rem 0.3rem;">
                      <input type="number" step="0.01" min="0"
                        class="roster-pmt-input"
                        data-reg-id="${o._regId}"
                        data-swimmer-index="${o._swimmerIndex}"
                        data-field="amount2"
                        data-season="${$}"
                        value="${s(o,"amount2")}"
                        onchange="window.__updateSwimmerPayment(this)"
                        placeholder="0.00"
                        style="${i}" />
                    </td>
                    <td style="padding: 0.2rem 0.3rem;">
                      <input type="date"
                        class="roster-pmt-input"
                        data-reg-id="${o._regId}"
                        data-swimmer-index="${o._swimmerIndex}"
                        data-field="date2"
                        data-season="${$}"
                        value="${s(o,"date2")}"
                        onchange="window.__updateSwimmerPayment(this)"
                        style="${i}" />
                    </td>
                    <td style="padding: 0.2rem 0.3rem;">
                      <input type="number" step="0.01" min="0"
                        class="roster-pmt-input"
                        data-reg-id="${o._regId}"
                        data-swimmer-index="${o._swimmerIndex}"
                        data-field="amount3"
                        data-season="${$}"
                        value="${s(o,"amount3")}"
                        onchange="window.__updateSwimmerPayment(this)"
                        placeholder="0.00"
                        style="${i}" />
                    </td>
                    <td style="padding: 0.2rem 0.3rem;">
                      <input type="date"
                        class="roster-pmt-input"
                        data-reg-id="${o._regId}"
                        data-swimmer-index="${o._swimmerIndex}"
                        data-field="date3"
                        data-season="${$}"
                        value="${s(o,"date3")}"
                        onchange="window.__updateSwimmerPayment(this)"
                        style="${i}" />
                    </td>
                  </tr>
                `:`
                  <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 1rem; font-weight: 500;">${[o.firstName,o.lastName].filter(Boolean).join(" ")}</td>
                    <td style="padding: 1rem;">${o.parentName}</td>
                    <td style="padding: 1rem;">${r}</td>
                    <td style="padding: 1rem;">${o.gender||"—"}</td>
                    <td style="padding: 1rem;">${o.usaSwimmingId||"—"}</td>
                  </tr>
                `}).join("")}
          </tbody>
        </table>
        </div>
        ${e?`<p class="roster-payment-note">${n("dash_coach_roster_payment_note")}</p>`:""}
        `}
      </div>
    </div>
  `}function lt(t){const e=r=>(r||"").trim().toLowerCase().replace(/\s+/g," "),a=r=>(Number(r.balance)||0)+(Number(r.deposit1Amount)||0)+(Number(r.deposit2Amount)||0)+(Number(r.deposit3Amount)||0),s=new Map;for(const r of ne){if(r.season&&r.season!==t)continue;const d=r.feeData;if(!(!d||!d.swimmers||d.swimmers.length===0))for(const l of d.swimmers){const m=e(l.name);if(!m)continue;const u=s.get(m),p=Number(l.total)||0;u?(u.totalFee+=p,u.meetCount+=1,u.meets.push({meetName:r.name||"Unnamed Meet",total:p}),l.name.trim().length>u.displayName.length&&(u.displayName=l.name.trim())):s.set(m,{displayName:l.name.trim(),totalFee:p,meetCount:1,meets:[{meetName:r.name||"Unnamed Meet",total:p}]})}}const i=new Map;for(const r of pe){if(r.season&&r.season!==t)continue;const d=e(r.swimmerName);d&&i.set(d,{id:r.id,total:a(r)})}const o=[];for(const[r,d]of s){const l=i.get(r)||{id:null,total:0};o.push({normalizedName:r,displayName:d.displayName,totalFee:d.totalFee,deposit:l.total,depositId:l.id,balance:l.total-d.totalFee,meetCount:d.meetCount,meets:d.meets}),i.delete(r)}for(const[r,d]of i){const l=pe.find(m=>e(m.swimmerName)===r&&m.season===t);o.push({normalizedName:r,displayName:l?l.swimmerName:r,totalFee:0,deposit:d.total,depositId:d.id,balance:d.total,meetCount:0,meets:[]})}return o.sort((r,d)=>r.balance<0&&d.balance>=0?-1:r.balance>=0&&d.balance<0?1:r.displayName.localeCompare(d.displayName)),o}function Ot(){const t=lt($),e=t.reduce((r,d)=>r+d.totalFee,0),a=t.reduce((r,d)=>r+d.deposit,0),s=t.filter(r=>r.balance<0).length,i=r=>"$"+Number(r).toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2}),o=t.length>0;return`
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem;">
      ${as($)}
      <a class="btn btn-outline btn-sm" id="goto-deposits-link" style="text-decoration: none;">🏦 Manage Deposits</a>
      <button class="btn btn-outline btn-sm" id="fee-summary-export-btn">📥 Export CSV</button>
    </div>

    <div class="dash-stats-row">
      <div class="dash-stat-card">
        <div class="dash-stat-number">${t.length}</div>
        <div class="dash-stat-label">${n("dash_fee_summary_total_swimmers")}</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${i(e)}</div>
        <div class="dash-stat-label">${n("dash_fee_summary_total_fees")}</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${i(a)}</div>
        <div class="dash-stat-label">${n("dash_fee_summary_total_deposits")}</div>
      </div>
      <div class="dash-stat-card ${s>0?"accent":""}">
        <div class="dash-stat-number" style="${s>0?"color: var(--color-accent);":""}">${s}</div>
        <div class="dash-stat-label">${n("dash_fee_summary_negative_count")}</div>
      </div>
    </div>

    ${o?`
      <div class="dash-panel">
        <div class="fee-summary-table-wrapper">
          <table class="fee-summary-table">
            <thead>
              <tr>
                <th style="width: 28px;"></th>
                <th>${n("dash_fee_summary_name")}</th>
                <th>${n("dash_fee_summary_deposit")}</th>
                <th>${n("dash_fee_summary_total_fee")}</th>
                <th>${n("dash_fee_summary_meets")}</th>
                <th>${n("dash_fee_summary_balance")}</th>
              </tr>
            </thead>
            <tbody>
              ${t.map((r,d)=>`
                <tr class="fee-summary-main-row fee-summary-row ${r.balance<0?"fee-summary-negative":""}"
                    data-fee-index="${d}" ${r.meets&&r.meets.length>0?'title="Click to see meet details"':""}>
                  <td><span class="fee-summary-expand-icon">${r.meets&&r.meets.length>0?"▶":""}</span></td>
                  <td class="fee-summary-name">${E(r.displayName)}</td>
                  <td>${i(r.deposit)}</td>
                  <td>${i(r.totalFee)}</td>
                  <td>${r.meetCount}</td>
                  <td class="fee-summary-balance" style="font-weight: 700; ${r.balance<0?"color: var(--color-accent);":"color: #16A34A;"}">${i(r.balance)}</td>
                </tr>
                ${r.meets&&r.meets.length>0?`
                <tr class="fee-summary-detail-row" data-fee-detail="${d}">
                  <td colspan="6" class="fee-summary-detail-cell">
                    <table class="fee-summary-mini-table">
                      ${r.meets.map(l=>`
                        <tr>
                          <td class="mini-meet-name">${E(l.meetName)}</td>
                          <td class="mini-meet-fee">${i(l.total)}</td>
                        </tr>
                      `).join("")}
                      <tr class="mini-meet-total">
                        <td>${n("dash_fee_summary_total_fee")}</td>
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
        <p style="color: var(--text-secondary); max-width: 500px; margin: 0 auto;">${n("dash_fee_summary_no_fees")}</p>
      </div>
    `}
  `}function ct(t){return pe.filter(e=>e.season===t).sort((e,a)=>(e.swimmerName||"").localeCompare(a.swimmerName||""))}function mt(t){return(Number(t.balance)||0)+(Number(t.deposit1Amount)||0)+(Number(t.deposit2Amount)||0)+(Number(t.deposit3Amount)||0)}function Vt(){const t=ct($),e=i=>i!=null?"$"+Number(i).toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2}):"—",a=i=>i||"—",s=t.length>0;return`
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem;">
      ${Xt($)}
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
              ${t.map(i=>{const o=mt(i);return`
                <tr id="${"dep-row-"+i.id}" class="deposits-row">
                  <td class="deposits-name">${E(i.swimmerName)}</td>
                  <td class="deposits-balance">
                    <span class="dep-view">${e(i.balance)}</span>
                    <input class="dep-edit-field dep-input" type="number" value="${i.balance||0}" step="0.01" style="display:none; width: 90px;" />
                  </td>
                  <td class="deposits-d1amt">
                    <span class="dep-view">${e(i.deposit1Amount)}</span>
                    <input class="dep-edit-field dep-input" type="number" value="${i.deposit1Amount||""}" step="0.01" style="display:none; width: 90px;" />
                  </td>
                  <td class="deposits-d1date">
                    <span class="dep-view">${a(i.deposit1Date)}</span>
                    <input class="dep-edit-field dep-input" type="date" value="${i.deposit1Date||""}" style="display:none; width: 130px;" />
                  </td>
                  <td class="deposits-d2amt">
                    <span class="dep-view">${e(i.deposit2Amount)}</span>
                    <input class="dep-edit-field dep-input" type="number" value="${i.deposit2Amount||""}" step="0.01" style="display:none; width: 90px;" />
                  </td>
                  <td class="deposits-d2date">
                    <span class="dep-view">${a(i.deposit2Date)}</span>
                    <input class="dep-edit-field dep-input" type="date" value="${i.deposit2Date||""}" style="display:none; width: 130px;" />
                  </td>
                  <td class="deposits-d3amt">
                    <span class="dep-view">${e(i.deposit3Amount)}</span>
                    <input class="dep-edit-field dep-input" type="number" value="${i.deposit3Amount||""}" step="0.01" style="display:none; width: 90px;" />
                  </td>
                  <td class="deposits-d3date">
                    <span class="dep-view">${a(i.deposit3Date)}</span>
                    <input class="dep-edit-field dep-input" type="date" value="${i.deposit3Date||""}" style="display:none; width: 130px;" />
                  </td>
                  <td class="deposits-total" style="font-weight: 700;">${e(o)}</td>
                  <td class="deposits-actions">
                    <button class="deposits-edit-btn" data-id="${i.id}">✎</button>
                    <button class="deposits-save-btn" data-id="${i.id}" style="display:none;">✓</button>
                    <button class="deposits-cancel-btn" data-id="${i.id}" style="display:none;">✕</button>
                    <button class="deposits-delete-btn" data-id="${i.id}" data-name="${E(i.swimmerName)}" style="color: var(--color-accent);">&times;</button>
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
          No deposit records for ${E($)}.<br>
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
  `}function Xt(t){const e=Be(),a=t||$||ke();return`
    <div class="season-selector">
      <label class="season-selector-label">${n("dash_season_label")}:</label>
      <select id="deposits-season-select" class="season-select">
        ${e.map(s=>`<option value="${s}" ${s===a?"selected":""}>${s}</option>`).join("")}
      </select>
    </div>
  `}function Yt(t){const e=Be(),a=t||$||ke();return`
    <div class="season-selector">
      <label class="season-selector-label">${n("dash_season_label")}:</label>
      <select id="roster-season-select" class="season-select">
        ${e.map(s=>`<option value="${s}" ${s===a?"selected":""}>${s}</option>`).join("")}
      </select>
    </div>
  `}async function Wt(t){const e=window.XLSX;if(!e)return alert("Excel parser not loaded."),null;try{const a=await t.arrayBuffer(),s=e.read(new Uint8Array(a),{type:"array"}),i=s.Sheets[s.SheetNames[0]],o=e.utils.sheet_to_json(i,{header:1,defval:null});if(!o||o.length<2)return{valid:[],errors:[{rowNum:1,reason:"File has no data rows."}]};let r=-1,d=-1,l=-1;for(let p=0;p<Math.min(10,o.length);p++){const b=o[p];if(b){r=-1,d=-1;for(let _=0;_<b.length;_++){const S=String(b[_]||"").toLowerCase().trim();(S.includes("name")||S.includes("swimmer"))&&(r=_),S.includes("balance")&&(d=_)}if(r>=0&&d>=0){l=p;break}}}if(l<0)return{valid:[],errors:[{rowNum:0,reason:"Expected columns: Name, Balance."}]};const m=[],u=[];for(let p=l+1;p<o.length;p++){const b=o[p];if(!b||b.every(x=>x==null||String(x).trim()===""))continue;const _=String(b[r]||"").trim();if(!_){u.push({rowNum:p+1,reason:"Missing name."});continue}const S=Number(b[d]);if(isNaN(S)||S<0){u.push({rowNum:p+1,reason:`Invalid balance for "${_}": ${b[d]}`});continue}m.push({swimmerName:_,balance:S})}return{valid:m,errors:u}}catch(a){return console.error("Error parsing carry-over Excel:",a),null}}function Gt(t,e,a){var i;const s=document.createElement("div");s.className="confirm-overlay",s.innerHTML=`
    <div class="confirm-modal csv-import-modal">
      <h3 class="confirm-title">Import Carry-over Balance</h3>
      <p class="csv-import-filename">File: <strong>${E(a)}</strong></p>
      <p class="csv-import-summary">${t.length} record(s), ${e.length} error(s)</p>
      <p style="font-size: 0.85rem; color: var(--color-accent); margin-bottom: 0.75rem;">⚠ This will <strong>overwrite</strong> existing balance values for matching swimmers in season <strong>${E($)}</strong>.</p>
      ${t.length>0?`
        <div class="csv-preview-wrapper">
          <table class="csv-preview-table">
            <thead><tr><th>Name</th><th>Balance</th></tr></thead>
            <tbody>${t.map(o=>`<tr><td>${E(o.swimmerName)}</td><td>$${Number(o.balance).toLocaleString(void 0,{minimumFractionDigits:2})}</td></tr>`).join("")}</tbody>
          </table>
        </div>`:""}
      ${e.length>0?`<div class="csv-error-block"><p class="csv-error-title">Errors</p>${e.map(o=>`<p class="csv-error-item">Row ${o.rowNum}: ${E(o.reason)}</p>`).join("")}</div>`:""}
      ${t.length===0?'<p class="csv-no-valid">No valid records found.</p>':""}
      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="carryover-import-cancel">Cancel</button>
        ${t.length>0?'<button class="btn btn-primary btn-sm" id="carryover-import-confirm">Import</button>':""}
      </div>
    </div>`,document.body.appendChild(s),s.querySelector("#carryover-import-cancel").addEventListener("click",()=>s.remove()),(i=s.querySelector("#carryover-import-confirm"))==null||i.addEventListener("click",async()=>{s.remove(),await Jt(t)}),s.addEventListener("click",o=>{o.target===s&&s.remove()})}async function Jt(t){if(!t||t.length===0)return;const e=a=>(a||"").trim().toLowerCase().replace(/\s+/g," ");try{const a=je(g);for(const s of t){const i=pe.find(o=>o.season===$&&e(o.swimmerName)===e(s.swimmerName));if(i)a.update(k(g,"deposits",i.id),{balance:Number(s.balance),updatedAt:new Date,updatedBy:(v==null?void 0:v.email)||"unknown"});else{const o=k(J(g,"deposits"));a.set(o,{swimmerName:s.swimmerName,season:$,balance:Number(s.balance),deposit1Amount:null,deposit1Date:null,deposit2Amount:null,deposit2Date:null,deposit3Amount:null,deposit3Date:null,updatedAt:new Date,updatedBy:(v==null?void 0:v.email)||"unknown"})}}await a.commit(),X(`Updated balance for ${t.length} swimmer(s) in ${$}.`)}catch(a){console.error("Carry-over import failed:",a),X("Failed to import: "+(a.message||""),!0)}}async function Kt(t){const e=window.XLSX;if(!e)return alert("Excel parser not loaded."),null;try{const a=await t.arrayBuffer(),s=e.read(new Uint8Array(a),{type:"array"}),i=s.Sheets[s.SheetNames[0]],o=e.utils.sheet_to_json(i,{header:1,defval:null});if(!o||o.length<2)return{valid:[],errors:[{rowNum:1,reason:"File has no data rows."}]};let r=-1;const d={};let l=-1;for(let p=0;p<Math.min(10,o.length);p++){const b=o[p];if(!b)continue;let _=-1;const S={};for(let x=0;x<b.length;x++){const D=String(b[x]||"").toLowerCase().trim();D.includes("name")||D.includes("swimmer")?_=x:/deposit\s*1.*amount/i.test(D)||/d1\s*.*amt/i.test(D)?S.deposit1Amount=x:/deposit\s*1.*date/i.test(D)||/d1\s*.*date/i.test(D)?S.deposit1Date=x:/deposit\s*2.*amount/i.test(D)||/d2\s*.*amt/i.test(D)?S.deposit2Amount=x:/deposit\s*2.*date/i.test(D)||/d2\s*.*date/i.test(D)?S.deposit2Date=x:/deposit\s*3.*amount/i.test(D)||/d3\s*.*amt/i.test(D)?S.deposit3Amount=x:(/deposit\s*3.*date/i.test(D)||/d3\s*.*date/i.test(D))&&(S.deposit3Date=x)}if(_>=0){r=_,Object.assign(d,S),l=p;break}}if(l<0)return{valid:[],errors:[{rowNum:0,reason:'Expected a header row with "Name" column.'}]};const m=[],u=[];for(let p=l+1;p<o.length;p++){const b=o[p];if(!b||b.every(x=>x==null||String(x).trim()===""))continue;const _=String(b[r]||"").trim();if(!_){u.push({rowNum:p+1,reason:"Missing name."});continue}const S={swimmerName:_};for(const[x,D]of Object.entries(d))if(D>=0&&D<b.length){const F=b[D];x.includes("Amount")?S[x]=F!=null?Number(F):null:S[x]=F?String(F).trim():null}m.push(S)}return{valid:m,errors:u}}catch(a){return console.error("Error parsing deposit detail Excel:",a),null}}function Qt(t,e,a){var i;const s=document.createElement("div");s.className="confirm-overlay",s.innerHTML=`
    <div class="confirm-modal csv-import-modal" style="max-width: 900px;">
      <h3 class="confirm-title">Import Deposit Details</h3>
      <p class="csv-import-filename">File: <strong>${E(a)}</strong></p>
      <p class="csv-import-summary">${t.length} record(s), ${e.length} error(s)</p>
      <p style="font-size: 0.85rem; color: var(--color-accent); margin-bottom: 0.75rem;">⚠ This will <strong>overwrite</strong> existing deposit fields for matching swimmers in season <strong>${E($)}</strong>.</p>
      ${t.length>0?`
        <div class="csv-preview-wrapper" style="max-height: 350px;">
          <table class="csv-preview-table" style="font-size: 0.75rem;">
            <thead><tr><th>Name</th><th>D1 Amt</th><th>D1 Date</th><th>D2 Amt</th><th>D2 Date</th><th>D3 Amt</th><th>D3 Date</th></tr></thead>
            <tbody>${t.map(o=>`<tr>
              <td>${E(o.swimmerName)}</td>
              <td>${o.deposit1Amount!=null?"$"+Number(o.deposit1Amount).toFixed(2):"—"}</td>
              <td>${o.deposit1Date||"—"}</td>
              <td>${o.deposit2Amount!=null?"$"+Number(o.deposit2Amount).toFixed(2):"—"}</td>
              <td>${o.deposit2Date||"—"}</td>
              <td>${o.deposit3Amount!=null?"$"+Number(o.deposit3Amount).toFixed(2):"—"}</td>
              <td>${o.deposit3Date||"—"}</td>
            </tr>`).join("")}</tbody>
          </table>
        </div>`:""}
      ${e.length>0?`<div class="csv-error-block"><p class="csv-error-title">Errors</p>${e.map(o=>`<p class="csv-error-item">Row ${o.rowNum}: ${E(o.reason)}</p>`).join("")}</div>`:""}
      ${t.length===0?'<p class="csv-no-valid">No valid records found.</p>':""}
      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="detail-import-cancel">Cancel</button>
        ${t.length>0?'<button class="btn btn-primary btn-sm" id="detail-import-confirm">Import</button>':""}
      </div>
    </div>`,document.body.appendChild(s),s.querySelector("#detail-import-cancel").addEventListener("click",()=>s.remove()),(i=s.querySelector("#detail-import-confirm"))==null||i.addEventListener("click",async()=>{s.remove(),await Zt(t)}),s.addEventListener("click",o=>{o.target===s&&s.remove()})}async function Zt(t){if(!t||t.length===0)return;const e=a=>(a||"").trim().toLowerCase().replace(/\s+/g," ");try{const a=je(g);for(const s of t){const i=pe.find(r=>r.season===$&&e(r.swimmerName)===e(s.swimmerName)),o={updatedAt:new Date,updatedBy:(v==null?void 0:v.email)||"unknown"};if("deposit1Amount"in s&&(o.deposit1Amount=s.deposit1Amount),"deposit1Date"in s&&(o.deposit1Date=s.deposit1Date),"deposit2Amount"in s&&(o.deposit2Amount=s.deposit2Amount),"deposit2Date"in s&&(o.deposit2Date=s.deposit2Date),"deposit3Amount"in s&&(o.deposit3Amount=s.deposit3Amount),"deposit3Date"in s&&(o.deposit3Date=s.deposit3Date),i)a.update(k(g,"deposits",i.id),o);else{const r=k(J(g,"deposits"));a.set(r,{swimmerName:s.swimmerName,season:$,balance:0,deposit1Amount:null,deposit1Date:null,deposit2Amount:null,deposit2Date:null,deposit3Amount:null,deposit3Date:null,...o})}}await a.commit(),X(`Updated deposit details for ${t.length} swimmer(s) in ${$}.`)}catch(a){console.error("Deposit detail import failed:",a),X("Failed to import: "+(a.message||""),!0)}}function es(){document.querySelectorAll(".deposits-edit-btn").forEach(t=>{t.addEventListener("click",()=>{const e=t.closest("tr");Ge(e,!0)})}),document.querySelectorAll(".deposits-save-btn").forEach(t=>{t.addEventListener("click",async()=>{const e=t.dataset.id,a=t.closest("tr");if(!e||!a)return;const s=p=>{const b=a.querySelector(p);return b?b.value:null},i=parseFloat(s(".deposits-balance .dep-edit-field"))||0,o=s(".deposits-d1amt .dep-edit-field"),r=s(".deposits-d1date .dep-edit-field"),d=s(".deposits-d2amt .dep-edit-field"),l=s(".deposits-d2date .dep-edit-field"),m=s(".deposits-d3amt .dep-edit-field"),u=s(".deposits-d3date .dep-edit-field");try{await K(k(g,"deposits",e),{balance:i,deposit1Amount:o?parseFloat(o):null,deposit1Date:r||null,deposit2Amount:d?parseFloat(d):null,deposit2Date:l||null,deposit3Amount:m?parseFloat(m):null,deposit3Date:u||null,updatedAt:new Date,updatedBy:(v==null?void 0:v.email)||"unknown"})}catch(p){console.error("Error saving deposit:",p),alert("Failed to save deposit.")}})}),document.querySelectorAll(".deposits-cancel-btn").forEach(t=>{t.addEventListener("click",()=>{const e=t.closest("tr");Ge(e,!1)})}),document.querySelectorAll(".deposits-delete-btn").forEach(t=>{t.addEventListener("click",async()=>{const e=t.dataset.id,a=t.dataset.name;if(e&&confirm(`Delete deposit record for ${a}?`))try{await Ne(k(g,"deposits",e))}catch(s){console.error("Error deleting deposit:",s),alert("Failed to delete deposit.")}})})}function Ge(t,e){if(!t)return;const a=t.querySelectorAll(".dep-view"),s=t.querySelectorAll(".dep-edit-field"),i=t.querySelector(".deposits-edit-btn"),o=t.querySelector(".deposits-save-btn"),r=t.querySelector(".deposits-cancel-btn"),d=t.querySelector(".deposits-delete-btn");a.forEach(l=>l.style.display=e?"none":""),s.forEach(l=>l.style.display=e?"":"none"),i&&(i.style.display=e?"none":""),o&&(o.style.display=e?"":"none"),r&&(r.style.display=e?"":"none"),d&&(d.style.display=e?"none":"")}function ts(){const t=ct($),e=["Name","Balance","Deposit 1 Amount","Deposit 1 Date","Deposit 2 Amount","Deposit 2 Date","Deposit 3 Amount","Deposit 3 Date","Total"],a=t.map(l=>[l.swimmerName||"",l.balance||0,l.deposit1Amount||"",l.deposit1Date||"",l.deposit2Amount||"",l.deposit2Date||"",l.deposit3Amount||"",l.deposit3Date||"",mt(l)]),s=l=>'"'+String(l).replace(/"/g,'""')+'"',i=[e.map(s).join(","),...a.map(l=>l.map(s).join(","))].join(`
`),o=new Blob([i],{type:"text/csv;charset=utf-8;"}),r=URL.createObjectURL(o),d=document.createElement("a");d.href=r,d.download=`dragon-deposits-${$}.csv`,document.body.appendChild(d),d.click(),document.body.removeChild(d),URL.revokeObjectURL(r)}function ss(){const t=lt($),e=["Swimmer","Deposit","Total Meet Fee","Meets","Balance"],a=t.map(l=>[l.displayName,l.deposit,l.totalFee,l.meetCount,l.balance]),s=l=>'"'+String(l).replace(/"/g,'""')+'"',i=[e.map(s).join(","),...a.map(l=>l.map(s).join(","))].join(`
`),o=new Blob([i],{type:"text/csv;charset=utf-8;"}),r=URL.createObjectURL(o),d=document.createElement("a");d.href=r,d.download=`dragon-fee-summary-${$}.csv`,document.body.appendChild(d),d.click(),document.body.removeChild(d),URL.revokeObjectURL(r)}function E(t){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function ke(){const t=new Date,e=t.getFullYear();return t.getMonth()+1>=9?`${e}-${e+1}`:`${e-1}-${e}`}function Be(){const t=new Set;for(const i of ne)i.season&&t.add(i.season);for(const i of pe)i.season&&t.add(i.season);const e=new Date,a=e.getMonth()>=8?e.getFullYear():e.getFullYear()-1,s=2025;for(let i=Math.max(s,a-1);i<=a+2;i++)t.add(`${i}-${i+1}`);return Array.from(t).sort().reverse()}function as(t){const e=Be(),a=t||$||ke();return`
    <div class="season-selector">
      <label class="season-selector-label">${n("dash_season_label")}:</label>
      <select id="season-select" class="season-select">
        ${e.map(s=>`<option value="${s}" ${s===a?"selected":""}>${s}</option>`).join("")}
      </select>
    </div>
  `}window.__updateSwimmerPayment=async function(t){var d,l;if(Y!=="admin"){console.warn("Non-admin attempted to modify payment field — blocked"),q();return}const e=t.dataset.regId,a=parseInt(t.dataset.swimmerIndex),s=t.dataset.field,i=t.dataset.season||$;let o=t.value;s.startsWith("amount")?(o=o===""?null:parseFloat(o),o!=null&&(isNaN(o)||o<0)&&(o=null)):s.startsWith("date")&&(o=o||null);const r=me.find(m=>m.id===e);if((d=r==null?void 0:r.swimmers)!=null&&d[a]){const m=r.swimmers[a],u={...m.payments||{}},p={...u[i]||{}};p[s]=o,u[i]=p,r.swimmers[a]={...m,payments:u}}try{const m=k(g,"registrations",e),u=await Z(m);if(!u.exists())return;const p=[...u.data().swimmers];if(p[a]){const b=p[a],_={...b.payments||{}},S={..._[i]||{}};S[s]=o,_[i]=S,p[a]={...b,payments:_},await K(m,{swimmers:p})}}catch(m){console.error("Error updating swimmer payment field:",m);const u=me.find(p=>p.id===e);if((l=u==null?void 0:u.swimmers)!=null&&l[a]){const p=await Z(k(g,"registrations",e));p.exists()&&(u.swimmers[a]={...p.data().swimmers[a]})}q()}};function ns(){const t=Ae.filter(s=>s.status!=="Completed").length,e=Ae.filter(s=>s.status==="Completed").length,a=ne.filter(s=>s.status!=="Completed").length;return`
    <div class="dash-stats-row">
      <div class="dash-stat-card">
        <div class="dash-stat-number">${Ae.length}</div>
        <div class="dash-stat-label">${n("dash_swimmer_total_plans")}</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${t}</div>
        <div class="dash-stat-label">${n("dash_swimmer_active_plans")}</div>
      </div>
      <div class="dash-stat-card accent">
        <div class="dash-stat-number">${e}</div>
        <div class="dash-stat-label">${n("dash_swimmer_completed")}</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${a}</div>
        <div class="dash-stat-label">${n("dash_swimmer_upcoming_meets")}</div>
      </div>
    </div>

    <div class="dash-overview-grid">
      <div class="dash-panel">
        <h3 class="dash-panel-title">${n("dash_swimmer_active_plans_title")}</h3>
        <div class="dash-panel-body" style="text-align: center; padding: 2rem;">
          <p style="color: var(--text-secondary);">${n("dash_plans_under_construction")}</p>
        </div>
      </div>
      <div class="dash-panel">
        <h3 class="dash-panel-title">${n("dash_swimmer_upcoming_meets_title")}</h3>
        <div class="dash-panel-body">
          ${ne.filter(s=>s.status!=="Completed").map(s=>os(s)).join("")}
        </div>
      </div>
    </div>

    <div class="dash-panel">
      <h3 class="dash-panel-title">${n("dash_swimmer_today_practice")}</h3>
      <div class="dash-panel-body">
        ${is()}
      </div>
    </div>
  `}function os(t){const e=t.status||"Open",a=t.startDate&&t.endDate?`${t.startDate} – ${t.endDate}`:t.date||"";return`
    <div class="dash-mini-card">
      <div class="dash-mini-top">
        <span class="dash-mini-name">${t.name||"Untitled Meet"}</span>
        <span class="status-badge status-${e.toLowerCase().replace(" ","-")}">${e}</span>
      </div>
      <div class="dash-mini-meta">${a} · ${t.location||""}</div>
    </div>
  `}function is(){const t=new Date().getDay(),e=ae(t),a=qe.filter(s=>s.day===e);return a.length===0?`<p class="dash-empty">${n("dash_swimmer_rest_day")} (${e}). Rest day! 🎉</p>`:a.map(s=>`
    <div class="dash-mini-card">
      <div class="dash-mini-top">
        <span class="dash-mini-name">${s.startTime} – ${s.endTime}</span>
      </div>
      <div class="dash-mini-meta">${s.location||""}</div>
    </div>
  `).join("")}function rs(){if(!B)return`<div class="dash-panel" style="text-align: center; padding: 3rem;">
      <p class="dash-empty">${n("dash_profile_no_reg")}</p>
      <p style="margin-top: 1rem;"><a href="/registration.html" class="btn btn-primary">${n("dash_profile_complete_reg")}</a></p>
    </div>`;const t=B.parent||{},e=B.spouse,a=B.swimmers||[],s=B.emergencyContact||{};return`
    <div class="profile-grid">
      <div class="profile-col">
        <div class="dash-panel">
          <div class="dash-panel-header">
            <h3>${n("dash_profile_parent_title")}</h3>
            <button class="btn btn-outline btn-sm" id="edit-contact-btn">${n("dash_profile_edit")}</button>
          </div>
          <div class="profile-fields">
            <div class="profile-field">
              <span class="profile-label">${n("dash_profile_name")}</span>
              <span class="profile-value">${[t.firstName,t.middleName,t.lastName].filter(Boolean).join(" ")||"—"}</span>
            </div>
            <div class="profile-field">
              <span class="profile-label">${n("dash_profile_gender")}</span>
              <span class="profile-value">${t.gender||"—"}</span>
            </div>
            <div class="profile-field">
              <span class="profile-label">${n("dash_profile_email")}</span>
              <span class="profile-value">${t.email||"—"}</span>
            </div>
            <div class="profile-field">
              <span class="profile-label">${n("dash_profile_phone")}</span>
              <span class="profile-value profile-display" id="display-parent-phone">${t.phone||"—"}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-parent-phone" value="${t.phone||""}" />
            </div>
            <div class="profile-field">
              <span class="profile-label">${n("dash_profile_address")}</span>
              <span class="profile-value profile-display" id="display-parent-address">${t.address||"—"}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-parent-address" value="${t.address||""}" />
            </div>
          </div>
        </div>

        ${e?`
        <div class="dash-panel">
          <h3>${n("dash_profile_spouse_title")}</h3>
          <div class="profile-fields">
            <div class="profile-field">
              <span class="profile-label">${n("dash_profile_name")}</span>
              <span class="profile-value">${[e.firstName,e.middleName,e.lastName].filter(Boolean).join(" ")||"—"}</span>
            </div>
            <div class="profile-field">
              <span class="profile-label">${n("dash_profile_gender")}</span>
              <span class="profile-value">${e.gender||"—"}</span>
            </div>
            <div class="profile-field">
              <span class="profile-label">${n("dash_profile_phone")}</span>
              <span class="profile-value profile-display" id="display-spouse-phone">${e.phone||"—"}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-spouse-phone" value="${e.phone||""}" />
            </div>
            <div class="profile-field">
              <span class="profile-label">${n("dash_profile_email")}</span>
              <span class="profile-value profile-display" id="display-spouse-email">${e.email||"—"}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-spouse-email" value="${e.email||""}" readonly
                title="Spouse email is used for login access and cannot be changed here." />
              <p class="profile-edit-field" style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">Spouse email is tied to login access. Contact admin@dragonswim.com if you need to change it.</p>
            </div>
          </div>
        </div>
        `:""}

        <div class="dash-panel">
          <h3>${n("dash_profile_emergency_title")}</h3>
          <div class="profile-fields">
            <div class="profile-field">
              <span class="profile-label">${n("dash_profile_name")}</span>
              <span class="profile-value profile-display" id="display-emergency-name">${s.name||"—"}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-emergency-name" value="${s.name||""}" />
            </div>
            <div class="profile-field">
              <span class="profile-label">${n("dash_profile_phone")}</span>
              <span class="profile-value profile-display" id="display-emergency-phone">${s.phone||"—"}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-emergency-phone" value="${s.phone||""}" />
            </div>
          </div>
        </div>

        <div class="profile-edit-actions" id="edit-actions" style="display: none;">
          <button class="btn btn-primary btn-sm" id="save-contact-btn">${n("dash_profile_save")}</button>
          <button class="btn btn-outline btn-sm" id="cancel-contact-btn">${n("dash_profile_cancel")}</button>
        </div>
      </div>

      <div class="profile-col">
        <div class="dash-panel">
          <div class="dash-panel-header">
            <h3>${n("dash_profile_swimmers_title")} (${a.length})</h3>
            <button class="btn btn-outline btn-sm" id="add-swimmer-toggle-btn">${n("dash_profile_add_swimmer")}</button>
          </div>
          <div id="add-swimmer-form" style="display: none; margin-bottom: var(--space-md); padding: var(--space-md); border: 1px solid var(--border-color); border-radius: var(--radius-md);">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">${n("dash_profile_swimmer_first")}</label>
                <input class="form-input" id="new-swimmer-first" />
              </div>
              <div class="form-group">
                <label class="form-label">${n("dash_profile_swimmer_last")}</label>
                <input class="form-input" id="new-swimmer-last" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">${n("dash_profile_swimmer_middle")}</label>
                <input class="form-input" id="new-swimmer-middle" />
              </div>
              <div class="form-group">
                <label class="form-label">${n("dash_profile_swimmer_gender")}</label>
                <select class="form-select" id="new-swimmer-gender">
                  <option value="" disabled selected>${n("dash_profile_select_gender")}</option>
                  <option value="male">${n("dash_profile_gender_male")}</option>
                  <option value="female">${n("dash_profile_gender_female")}</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">${n("dash_profile_swimmer_dob")}</label>
                <input class="form-input" type="date" id="new-swimmer-dob" />
              </div>
              <div class="form-group">
                <label class="form-label">${n("dash_profile_swimmer_usa_id")}</label>
                <input class="form-input" id="new-swimmer-usaId" />
              </div>
            </div>
            <div style="display: flex; gap: var(--space-sm); margin-top: var(--space-md);">
              <button class="btn btn-primary btn-sm" id="save-swimmer-btn">${n("dash_profile_save_swimmer")}</button>
              <button class="btn btn-outline btn-sm" id="cancel-swimmer-btn">${n("dash_profile_cancel_swimmer")}</button>
            </div>
          </div>
          ${a.filter(i=>!i.deleted).length===0?`<p class="dash-empty">${n("dash_profile_no_swimmers")}</p>`:a.map((i,o)=>i.deleted?"":`

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
              <button class="btn btn-outline btn-sm delete-swimmer-btn" data-index="${o}" style="color: var(--color-accent); border-color: var(--color-accent);">${n("dash_profile_remove")}</button>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `}function ds(){return`
    <div class="dash-panel" style="text-align: center; padding: 4rem 2rem;">
      <div style="font-size: 3rem; margin-bottom: 1rem;">🚧</div>
      <h2 style="font-size: 1.5rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem;">${n("dash_plans_under_construction")}</h2>
      <p style="color: var(--text-secondary);">${n("dash_swimmer_plans_sub")}</p>
    </div>
  `}function Je(){const t=Y==="admin";return`
    <div class="dash-section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2 style="font-size: 1.5rem; font-weight: 600; color: var(--text-primary);">${n("dash_meets_upcoming")}</h2>
      ${t?`<button class="btn btn-primary btn-sm" id="add-meet-btn">${n("dash_meets_add")}</button>`:""}
    </div>

    ${t?`
      <div id="add-meet-form" class="dash-panel" style="display: none; margin-bottom: 2rem; padding: 1.5rem;">
        <h3 style="margin-bottom: 1rem;" id="meet-form-title">${n("dash_meets_new_title")}</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
          <input type="text" id="meet-name" placeholder="${n("dash_meets_name_placeholder")}" class="form-input">
          <input type="date" id="meet-start-date" class="form-input" title="${n("dash_meets_start_date_placeholder")}">
          <input type="date" id="meet-end-date" class="form-input" title="${n("dash_meets_end_date_placeholder")}">
          <input type="text" id="meet-location" placeholder="${n("dash_meets_location_placeholder")}" class="form-input">
          <select id="meet-season" class="form-input">
            ${Be().map(e=>`<option value="${e}" ${e===$?"selected":""}>${e}</option>`).join("")}
          </select>
        </div>
        <div style="margin-top: 1rem; display: flex; gap: 1rem;">
          <button class="btn btn-primary btn-sm" id="save-meet-btn">${n("dash_meets_save")}</button>
          <button class="btn btn-outline btn-sm" id="cancel-meet-btn">${n("dash_meets_cancel")}</button>
        </div>
      </div>
    `:""}

    <div class="dash-cards-grid">
      ${ne.length===0?`<p class="dash-empty">${n("dash_meets_no_meets")}</p>`:ne.map(e=>`
        <div class="dash-card">
          <div class="dash-card-header">
            <h3 class="dash-card-title">${e.name}</h3>
            <span class="status-badge status-${(e.status||"Open").toLowerCase().replace(" ","-")}">${e.status||"Open"}</span>
          </div>
          <div class="dash-card-body">
            <div class="dash-card-meta">
              <span>📅 ${e.startDate&&e.endDate?`${e.startDate} – ${e.endDate}`:e.date||""}</span>
              <span>📍 ${e.location}</span>
            </div>
            <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
              ${t?`<button class="btn btn-outline btn-sm meet-fee-btn" data-id="${e.id}" data-name="${e.name||""}">${n("dash_meets_fee")}</button>`:""}
              ${t?`<button class="btn btn-outline btn-sm edit-meet" data-id="${e.id}" data-name="${e.name||""}" data-start="${e.startDate||e.date||""}" data-end="${e.endDate||e.date||""}" data-location="${e.location||""}" data-season="${e.season||$}">${n("dash_meets_edit")}</button>`:""}
              ${t?`<button class="btn btn-outline btn-sm delete-meet" data-id="${e.id}" style="color: var(--color-accent); border-color: var(--color-accent);">${n("dash_meets_delete")}</button>`:""}
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `}function Ke(){const t=Y==="admin";[0,1,2,3,4,5,6].map(a=>ae(a));const e=[1,2,3,4,5,6,0];return`
    <div class="dash-section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2 style="font-size: 1.5rem; font-weight: 600; color: var(--text-primary);">${n("dash_schedule_weekly")}</h2>
      ${t?`<button class="btn btn-primary btn-sm" id="add-session-btn">${n("dash_schedule_add")}</button><button class="btn btn-outline btn-sm" id="import-csv-btn">${n("dash_schedule_import_csv")}</button>`:""}
    </div>

    ${t?`
      <div id="add-session-form" class="dash-panel" style="display: none; margin-bottom: 2rem; padding: 1.5rem;">
        <h3 style="margin-bottom: 1rem;" id="session-form-title">${n("dash_schedule_new_title")}</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem;">
          <select id="session-day" class="form-input">
            ${e.map(a=>`<option value="${ae(a)}">${ae(a)}</option>`).join("")}
          </select>
          <input type="text" id="session-start-time" placeholder="${n("dash_schedule_start_time_placeholder")}" class="form-input">
          <input type="text" id="session-end-time" placeholder="${n("dash_schedule_end_time_placeholder")}" class="form-input">
          <input type="text" id="session-location" placeholder="${n("dash_schedule_location_placeholder")}" class="form-input">
        </div>
        <div style="margin-top: 1rem; display: flex; gap: 1rem;">
          <button class="btn btn-primary btn-sm" id="save-session-btn">${n("dash_schedule_save")}</button>
          <button class="btn btn-outline btn-sm" id="cancel-session-btn">${n("dash_schedule_cancel")}</button>
        </div>
      </div>
    `:""}

    <div class="dash-schedule-grid">
      ${e.map(a=>{const s=ae(a),i=qe.filter(o=>o.day===s);return`
          <div class="dash-schedule-day">
            <h3 class="dash-schedule-day-name">${s}</h3>
            ${i.length===0?`<p class="dash-empty-sm">${n("dash_schedule_no_practice")}</p>`:i.map(o=>`
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
  `}function ls(t,e){const a=document.createElement("div");a.className="confirm-overlay",a.innerHTML=`
    <div class="confirm-modal">
      <h3 class="confirm-title">${n("dash_profile_delete_title")}</h3>
      <p class="confirm-body">${n("dash_profile_delete_body1")} <strong style="color: var(--color-accent, #dc3545);">${t}</strong> ${n("dash_profile_delete_body2")}</p>
      <p class="confirm-warning">${n("dash_profile_delete_warning")}</p>
      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="confirm-cancel">${n("dash_profile_delete_cancel")}</button>
        <button class="btn btn-sm" id="confirm-delete" style="background: var(--color-accent, #dc3545); color: white; border: none;">${n("dash_profile_delete_confirm")}</button>
      </div>
    </div>
  `,document.body.appendChild(a),a.querySelector("#confirm-cancel").addEventListener("click",()=>a.remove()),a.querySelector("#confirm-delete").addEventListener("click",async()=>{a.remove();const s=[...B.swimmers];s[e]={...s[e],deleted:!0,deletedAt:new Date().toISOString()};try{await K(k(g,"registrations",ce),{swimmers:s}),B.swimmers=s,N="profile",q()}catch(i){console.error("Error marking swimmer deleted:",i),alert(n("dash_profile_save_failed"))}}),a.addEventListener("click",s=>{s.target===a&&a.remove()})}function cs(){const t=document.createElement("div");t.className="confirm-overlay",t.innerHTML=`
    <div class="confirm-modal" style="max-width: 420px;">
      <h3 class="confirm-title">${n("dash_profile_security_title")}</h3>
      <div style="padding: var(--space-md) 0;">
        <div class="profile-field">
          <label class="form-label" for="modal-current-password">${n("dash_profile_current_password")}</label>
          <input class="form-input" type="password" id="modal-current-password" placeholder="Enter current password" />
        </div>
        <div class="profile-field">
          <label class="form-label" for="modal-new-password">${n("dash_profile_new_password")}</label>
          <input class="form-input" type="password" id="modal-new-password" placeholder="Enter new password" />
        </div>
        <div class="profile-field">
          <label class="form-label" for="modal-confirm-password">${n("dash_profile_confirm_password")}</label>
          <input class="form-input" type="password" id="modal-confirm-password" placeholder="Confirm new password" />
        </div>
        <p id="modal-password-msg" style="font-size: 14px; margin-top: 10px; display: none;"></p>
      </div>
      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="modal-password-cancel">${n("dash_profile_cancel")}</button>
        <button class="btn btn-primary btn-sm" id="modal-password-submit">${n("dash_profile_password_btn")}</button>
      </div>
    </div>
  `,document.body.appendChild(t);const e=t.querySelector("#modal-password-msg");t.querySelector("#modal-password-cancel").addEventListener("click",()=>t.remove()),t.querySelector("#modal-password-submit").addEventListener("click",async()=>{const a=t.querySelector("#modal-current-password").value,s=t.querySelector("#modal-new-password").value,i=t.querySelector("#modal-confirm-password").value;if(e.style.display="none",!a||!s||!i){e.textContent="All fields are required.",e.style.color="var(--color-accent, #DC2626)",e.style.display="block";return}if(s!==i){e.textContent=n("dash_profile_password_mismatch"),e.style.color="var(--color-accent, #DC2626)",e.style.display="block";return}if(s.length<6){e.textContent="Password must be at least 6 characters.",e.style.color="var(--color-accent, #DC2626)",e.style.display="block";return}try{const o=Ze.credential(v.email,a);await et(v,o),await tt(v,s),e.textContent=n("dash_profile_password_success"),e.style.color="#16A34A",e.style.display="block",t.querySelector("#modal-current-password").value="",t.querySelector("#modal-new-password").value="",t.querySelector("#modal-confirm-password").value=""}catch(o){console.error("Password update error:",o),o.code==="auth/wrong-password"||o.code==="auth/invalid-credential"?e.textContent=n("dash_profile_password_wrong"):e.textContent=n("dash_profile_password_error")+" "+(o.message||""),e.style.color="var(--color-accent, #DC2626)",e.style.display="block"}}),t.addEventListener("click",a=>{a.target===t&&t.remove()})}function Qe(t){const e=[];let a="",s=!1;for(let i=0;i<t.length;i++){const o=t[i];o==='"'?s=!s:o===","&&!s?(e.push(a.trim()),a=""):a+=o}return e.push(a.trim()),e.length>0&&e[0].charCodeAt(0)===65279&&(e[0]=e[0].slice(1)),e}function ms(t){const a=t.split(/\r?\n/).filter(o=>o.trim().length>0);if(a.length===0)return{headers:[],rows:[]};const s=Qe(a[0]),i=a.slice(1).map(o=>Qe(o));return{headers:s,rows:i}}function ps(t,e){if(!t||t.length<4)return{valid:!1,reason:n("dash_csv_error_too_few_cols"),rowNum:e};const[a,s,i,o]=t.map(m=>(m||"").trim());if(!a)return{valid:!1,reason:n("dash_csv_error_missing_day"),rowNum:e};const r=a.toLowerCase(),d=[0,1,2,3,4,5,6].find(m=>ae(m).toLowerCase()===r);if(d===void 0)return{valid:!1,reason:n("dash_csv_error_invalid_day",{day:a}),rowNum:e};const l=ae(d);return s?/^\d{1,2}:\d{2}\s*(AM|PM)?$/i.test(s)?i?/^\d{1,2}:\d{2}\s*(AM|PM)?$/i.test(i)?{valid:!0,day:l,startTime:s,endTime:i,location:o||"",rowNum:e}:{valid:!1,reason:n("dash_csv_error_invalid_time",{field:"EndTime",value:i}),rowNum:e}:{valid:!1,reason:n("dash_csv_error_missing_end"),rowNum:e}:{valid:!1,reason:n("dash_csv_error_invalid_time",{field:"StartTime",value:s}),rowNum:e}:{valid:!1,reason:n("dash_csv_error_missing_start"),rowNum:e}}function X(t,e){const a=document.getElementById("csv-import-status");a&&a.remove();const s=document.createElement("div");s.id="csv-import-status",s.style.cssText=["padding: var(--space-md) var(--space-lg)","border-radius: var(--radius-md)","margin-bottom: var(--space-lg)","font-size: var(--fs-sm)","font-weight: var(--fw-medium)",e?"background: #fef2f2; border: 1px solid #fee2e2; color: #991b1b":"background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534"].join(";"),s.textContent=t;const i=document.querySelector(".dash-content");i&&i.insertBefore(s,i.firstChild),setTimeout(()=>s.remove(),8e3)}async function us(t){var u;const e=(u=t.target.files)==null?void 0:u[0];if(t.target.remove(),!e)return;if(!e.name.toLowerCase().endsWith(".csv")){X(n("dash_csv_error_not_csv"),!0);return}if(e.size>5e5){X(n("dash_csv_error_too_large"),!0);return}let a;try{a=await e.text()}catch(p){console.error("Error reading CSV file:",p),X(n("dash_csv_error_unknown"),!0);return}if(!a||a.trim().length===0){X(n("dash_csv_error_empty"),!0);return}const{headers:s,rows:i}=ms(a),o=["day","starttime","endtime","location"],r=s.map(p=>p.replace(/\s/g,"").toLowerCase());if(!o.every(p=>r.includes(p))||s.length<4){X(n("dash_csv_error_bad_header"),!0);return}const l=[],m=[];i.forEach((p,b)=>{const _=ps(p,b+2);_.valid?l.push({day:_.day,startTime:_.startTime,endTime:_.endTime,location:_.location||""}):m.push({rowNum:_.rowNum,reason:_.reason})}),hs(l,m,e.name)}function hs(t,e,a){var l;const s=a.replace(/</g,"&lt;").replace(/>/g,"&gt;"),i=t.length,o=e.length,r=m=>m.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),d=document.createElement("div");d.className="confirm-overlay",d.innerHTML=`
    <div class="confirm-modal csv-import-modal">
      <h3 class="confirm-title">${n("dash_csv_import_title")}</h3>
      <p class="csv-import-filename">${n("dash_csv_import_file")}: <strong>${s}</strong></p>
      <p class="csv-import-summary">${n("dash_csv_import_summary",{valid:String(i),error:String(o)})}</p>
      ${t.length>0?`
        <div class="csv-preview-wrapper">
          <table class="csv-preview-table">
            <thead>
              <tr>
                <th>${n("dash_csv_header_day")}</th>
                <th>${n("dash_csv_header_start")}</th>
                <th>${n("dash_csv_header_end")}</th>
                <th>${n("dash_csv_header_location")}</th>
              </tr>
            </thead>
            <tbody>
              ${t.map(m=>`
                <tr>
                  <td>${r(m.day)}</td>
                  <td>${r(m.startTime)}</td>
                  <td>${r(m.endTime)}</td>
                  <td>${r(m.location||"")}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `:""}
      ${e.length>0?`
        <div class="csv-error-block">
          <p class="csv-error-title">${n("dash_csv_import_errors")}</p>
          ${e.map(m=>`<p class="csv-error-item">${n("dash_csv_import_row")} ${m.rowNum}: ${r(m.reason)}</p>`).join("")}
        </div>
      `:""}
      ${t.length===0?`
        <p class="csv-no-valid">${n("dash_csv_import_no_valid")}</p>
      `:""}
      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="csv-import-cancel">${n("dash_csv_import_cancel")}</button>
        ${t.length>0?`<button class="btn btn-primary btn-sm" id="csv-import-confirm">${n("dash_csv_import_confirm",{count:String(i)})}</button>`:""}
      </div>
    </div>
  `,document.body.appendChild(d),d.querySelector("#csv-import-cancel").addEventListener("click",()=>d.remove()),(l=d.querySelector("#csv-import-confirm"))==null||l.addEventListener("click",async()=>{d.remove(),await fs(t)}),d.addEventListener("click",m=>{m.target===d&&d.remove()})}async function fs(t){if(!t||t.length===0)return;const e=document.getElementById("csv-import-status");e&&e.remove();try{const a=je(g),s=J(g,"schedules");t.forEach(i=>{const o=k(s);a.set(o,{day:i.day,startTime:i.startTime,endTime:i.endTime,location:i.location||"",createdAt:new Date})}),await a.commit(),X(n("dash_csv_import_success",{count:String(t.length)}))}catch(a){console.error("CSV import batch write failed:",a),a.code==="permission-denied"?X(n("dash_csv_error_permission"),!0):a.code==="unavailable"?X(n("dash_csv_error_network"),!0):X(n("dash_csv_error_unknown")+" "+(a.message||""),!0)}}async function ys(t){var d,l,m,u,p,b,_,S,x,D,F,P,U,Q,oe,ve,ge;const e=window.XLSX;if(!e)return alert("Excel parser not loaded. Please refresh the page."),null;const a=await t.arrayBuffer(),s=e.read(new Uint8Array(a),{type:"array"}),i=s.SheetNames[0],o=s.Sheets[i],r=e.utils.sheet_to_json(o,{header:1,defval:null});try{const ue=((d=r[5])==null?void 0:d[0])||"Unknown Meet",$e=((l=r[7])==null?void 0:l[9])||0,Ee=((m=r[7])==null?void 0:m[36])||0;let ee=-1;for(let T=8;T<r.length;T++)if(r[T]&&r[T][1]==="Name"){ee=T+2;break}ee<0&&(ee=11);const be=[];for(let T=ee;T<r.length;T+=2){const ie=(u=r[T])==null?void 0:u[1];if(!ie||typeof ie!="string")break;const re=ie.match(/^(.+?)\s*\((\d+)\)\s*$/),xe=re?re[1].trim():ie.trim(),h=re?parseInt(re[2],10):null,j=((p=r[T])==null?void 0:p[17])||0,z=((b=r[T])==null?void 0:b[23])||0,R=((_=r[T])==null?void 0:_[29])||0,C=((S=r[T])==null?void 0:S[38])||0;be.push({name:xe,age:h,individualEvents:j,individualFee:z,relayFee:R,total:C})}let O=-1;for(let T=ee;T<r.length;T++)if(r[T]&&r[T][9]==="Team Totals"){O=T;break}let W={individualEntries:0,individualFee:0,relayEntries:0,relayFee:0,swimmerSurcharge:{count:0,fee:0},teamSurcharge:0,facilitySurcharge:0,total:0};return O>0&&(W.individualEntries=((x=r[O+1])==null?void 0:x[15])||0,W.individualFee=((D=r[O+1])==null?void 0:D[21])||0,W.relayEntries=((F=r[O+2])==null?void 0:F[15])||0,W.relayFee=((P=r[O+2])==null?void 0:P[21])||0,W.swimmerSurcharge={count:((U=r[O+3])==null?void 0:U[15])||0,fee:((Q=r[O+3])==null?void 0:Q[21])||0},W.teamSurcharge=((oe=r[O+4])==null?void 0:oe[21])||0,W.facilitySurcharge=((ve=r[O+5])==null?void 0:ve[21])||0,W.total=((ge=r[O+6])==null?void 0:ge[21])||0),{fileName:t.name,meetName:ue,setupFees:{individualEventFee:$e,swimmerSurcharge:Ee},swimmers:be,summary:W,uploadedAt:new Date,uploadedBy:(v==null?void 0:v.email)||"unknown"}}catch(ue){return console.error("Error parsing Hy-Tek report:",ue),null}}function vs(t,e,a){const s=a&&a.swimmers&&a.swimmers.length>0;let i="";if(s){const o=a.summary;i+=`
      <div class="fee-summary-grid">
        <div class="fee-summary-card">
          <div class="fee-summary-label">Individual Entries</div>
          <div class="fee-summary-value">${o.individualEntries} events</div>
          <div class="fee-summary-sub">$${o.individualFee.toLocaleString()}</div>
        </div>
        <div class="fee-summary-card">
          <div class="fee-summary-label">Relay Entries</div>
          <div class="fee-summary-value">${o.relayEntries} entries</div>
          <div class="fee-summary-sub">$${o.relayFee.toLocaleString()}</div>
        </div>
        <div class="fee-summary-card">
          <div class="fee-summary-label">Swimmer Surcharge</div>
          <div class="fee-summary-value">${o.swimmerSurcharge.count} swimmers</div>
          <div class="fee-summary-sub">$${o.swimmerSurcharge.fee.toLocaleString()}</div>
        </div>
        <div class="fee-summary-card fee-summary-total">
          <div class="fee-summary-label">${n("dash_meets_fee_summary_total")}</div>
          <div class="fee-summary-value" style="font-size: 1.5rem; font-weight: 700;">$${o.total.toLocaleString()}</div>
        </div>
      </div>

      <div class="fee-table-wrapper">
        <table class="fee-table">
          <thead>
            <tr>
              <th>${n("dash_meets_fee_name")}</th>
              <th>${n("dash_meets_fee_age")}</th>
              <th>${n("dash_meets_fee_events")}</th>
              <th>${n("dash_meets_fee_indiv_fee")}</th>
              <th>${n("dash_meets_fee_relay_fee")}</th>
              <th>${n("dash_meets_fee_total")}</th>
            </tr>
          </thead>
          <tbody>
            ${a.swimmers.map(r=>`
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
        ${n("dash_meets_fee_uploaded_by")}: <strong>${a.uploadedBy||"—"}</strong>
        ${a.uploadedAt?` &mdash; ${new Date(a.uploadedAt.seconds?a.uploadedAt.seconds*1e3:a.uploadedAt).toLocaleString()}`:""}
      </div>
    `}else i=`<div class="fee-empty">${n("dash_meets_fee_no_data")}</div>`;return`
    <div class="fee-modal-overlay" id="fee-modal-overlay">
      <div class="fee-modal">
        <div class="fee-modal-header">
          <h2>${n("dash_meets_fee_title")}: ${e}</h2>
          <button class="fee-modal-close" id="fee-modal-close" title="${n("dash_meets_fee_close")}">&times;</button>
        </div>
        <div class="fee-modal-body" id="fee-modal-body">
          ${i}
        </div>
        <div class="fee-modal-footer">
          ${s?`<p class="fee-overwrite-hint">${n("dash_meets_fee_upload_overwrite")}</p>`:""}
          <input type="file" id="fee-file-input" accept=".xls,.xlsx" style="display:none;">
          <button class="btn btn-primary btn-sm" id="fee-upload-btn">${n("dash_meets_fee_upload")}</button>
          ${s?`<button class="btn btn-outline btn-sm" id="fee-delete-btn" style="color: var(--color-accent); border-color: var(--color-accent);">${n("dash_meets_fee_delete")}</button>`:""}
        </div>
      </div>
    </div>
  `}async function Te(t,e){let a=null;try{const p=await Z(k(g,"meets",t));p.exists()&&(a=p.data().feeData||null)}catch(p){console.error("Error fetching meet for fee modal:",p)}const s=document.getElementById("fee-modal-overlay");s&&s.remove();const i=document.createElement("div");i.id="fee-modal-container",i.innerHTML=vs(t,e,a),document.body.appendChild(i);const o=document.getElementById("fee-modal-overlay"),r=document.getElementById("fee-modal-close"),d=document.getElementById("fee-upload-btn"),l=document.getElementById("fee-file-input"),m=document.getElementById("fee-delete-btn"),u=()=>{o==null||o.remove(),i.remove()};r==null||r.addEventListener("click",u),o==null||o.addEventListener("click",p=>{p.target===o&&u()}),d==null||d.addEventListener("click",()=>{l==null||l.click()}),l==null||l.addEventListener("change",async p=>{var x;const b=(x=p.target.files)==null?void 0:x[0];if(!b)return;const _=b.name.split(".").pop().toLowerCase();if(!["xls","xlsx"].includes(_)){alert(n("dash_meets_fee_parse_error"));return}const S=await ys(b);if(!S){alert(n("dash_meets_fee_parse_error"));return}try{await K(k(g,"meets",t),{feeData:S}),u(),Te(t,e)}catch(D){console.error("Error uploading fee data:",D),alert("Failed to upload fee data. Please try again.")}}),m==null||m.addEventListener("click",async()=>{if(confirm(n("dash_meets_fee_delete_confirm")))try{await K(k(g,"meets",t),{feeData:null}),u(),Te(t,e)}catch(p){console.error("Error deleting fee data:",p),alert("Failed to delete fee data. Please try again.")}})}function pt(){var i,o,r,d,l,m,u,p,b,_,S,x,D,F,P,U,Q,oe,ve,ge,ue,$e,Ee,ee,be,O,W,T,ie,re,xe;Ft(),document.querySelectorAll(".dash-nav-item[data-tab]").forEach(h=>{h.addEventListener("click",()=>{N=h.dataset.tab,q()})}),(i=document.getElementById("dash-theme-toggle"))==null||i.addEventListener("click",()=>{ut(),q()});const t=document.getElementById("dash-hamburger"),e=document.getElementById("dash-sidebar");t==null||t.addEventListener("click",()=>{e.classList.toggle("open")}),(o=document.getElementById("sidebar-signout"))==null||o.addEventListener("click",async()=>{try{await He(Le),window.location.href="/signin.html"}catch(h){console.error("Error signing out:",h)}});const a=document.getElementById("user-trigger"),s=document.getElementById("user-dropdown");if(a==null||a.addEventListener("click",h=>{h.stopPropagation(),s.style.display=s.style.display==="none"?"block":"none"}),document.addEventListener("click",()=>{s&&(s.style.display="none")}),(r=document.getElementById("menu-profile"))==null||r.addEventListener("click",()=>{N="profile",s.style.display="none",q()}),(d=document.getElementById("menu-signout"))==null||d.addEventListener("click",async()=>{try{await He(Le),window.location.href="/signin.html"}catch(h){console.error("Error signing out:",h)}}),(l=document.getElementById("menu-admin"))==null||l.addEventListener("click",()=>{window.location.href="/admin.html"}),(m=document.getElementById("menu-password"))==null||m.addEventListener("click",()=>{s.style.display="none",cs()}),(u=document.getElementById("edit-contact-btn"))==null||u.addEventListener("click",()=>{document.querySelectorAll(".profile-display").forEach(h=>h.style.display="none"),document.querySelectorAll(".profile-edit-field").forEach(h=>h.style.display="block"),document.getElementById("edit-actions").style.display="flex",document.getElementById("edit-contact-btn").style.display="none"}),(p=document.getElementById("cancel-contact-btn"))==null||p.addEventListener("click",()=>{document.querySelectorAll(".profile-display").forEach(h=>h.style.display=""),document.querySelectorAll(".profile-edit-field").forEach(h=>h.style.display="none"),document.getElementById("edit-actions").style.display="none",document.getElementById("edit-contact-btn").style.display=""}),(b=document.getElementById("save-contact-btn"))==null||b.addEventListener("click",async()=>{var j,z,R,C,H,he;const h={"parent.phone":((j=document.getElementById("edit-parent-phone"))==null?void 0:j.value.trim())||"","parent.address":((z=document.getElementById("edit-parent-address"))==null?void 0:z.value.trim())||""};B.spouse&&(h["spouse.phone"]=((R=document.getElementById("edit-spouse-phone"))==null?void 0:R.value.trim())||"",h["spouse.email"]=((C=document.getElementById("edit-spouse-email"))==null?void 0:C.value.trim())||""),h["emergencyContact.name"]=((H=document.getElementById("edit-emergency-name"))==null?void 0:H.value.trim())||"",h["emergencyContact.phone"]=((he=document.getElementById("edit-emergency-phone"))==null?void 0:he.value.trim())||"";try{await K(k(g,"registrations",ce),h),B.parent.phone=h["parent.phone"],B.parent.address=h["parent.address"],B.spouse&&(B.spouse.phone=h["spouse.phone"],B.spouse.email=h["spouse.email"]),B.emergencyContact.name=h["emergencyContact.name"],B.emergencyContact.phone=h["emergencyContact.phone"],N="profile",q()}catch(Ie){console.error("Error updating contact:",Ie),alert(n("dash_profile_save_failed"))}}),(_=document.getElementById("add-swimmer-toggle-btn"))==null||_.addEventListener("click",()=>{document.getElementById("add-swimmer-form").style.display="block",document.getElementById("add-swimmer-toggle-btn").style.display="none"}),(S=document.getElementById("cancel-swimmer-btn"))==null||S.addEventListener("click",()=>{document.getElementById("add-swimmer-form").style.display="none",document.getElementById("add-swimmer-toggle-btn").style.display=""}),(x=document.getElementById("save-swimmer-btn"))==null||x.addEventListener("click",async()=>{const h=document.getElementById("new-swimmer-first").value.trim(),j=document.getElementById("new-swimmer-last").value.trim();if(!h||!j){alert(n("dash_profile_swimmer_required"));return}const z={firstName:h,lastName:j,middleName:document.getElementById("new-swimmer-middle").value.trim()||null,gender:document.getElementById("new-swimmer-gender").value||null,dob:document.getElementById("new-swimmer-dob").value||null,usaSwimmingId:document.getElementById("new-swimmer-usaId").value.trim()||null,joinDate:null},R=[...B.swimmers,z];try{await K(k(g,"registrations",ce),{swimmers:R}),B.swimmers=R,N="profile",q()}catch(C){console.error("Error adding swimmer:",C),alert(n("dash_profile_swimmer_add_failed"))}}),document.querySelectorAll(".delete-swimmer-btn").forEach(h=>{h.addEventListener("click",()=>{const j=parseInt(h.dataset.index),z=B.swimmers[j],R=[z.firstName,z.lastName].filter(Boolean).join(" ");ls(R,j)})}),(D=document.getElementById("update-password-btn"))==null||D.addEventListener("click",async()=>{const h=document.getElementById("password-update-msg"),j=document.getElementById("change-current-password").value,z=document.getElementById("change-new-password").value,R=document.getElementById("change-confirm-password").value;h.style.display="none",h.style.color="";const C=document.getElementById("update-password-btn");if(C&&(C.disabled=!0),!j||!z||!R){h.textContent="All fields are required.",h.style.color="var(--color-accent, #DC2626)",h.style.display="block",C&&(C.disabled=!1);return}if(z!==R){h.textContent=n("dash_profile_password_mismatch"),h.style.color="var(--color-accent, #DC2626)",h.style.display="block",C&&(C.disabled=!1);return}if(z.length<6){h.textContent="Password must be at least 6 characters.",h.style.color="var(--color-accent, #DC2626)",h.style.display="block",C&&(C.disabled=!1);return}try{const H=Ze.credential(v.email,j);await et(v,H),await tt(v,z),h.textContent=n("dash_profile_password_success"),h.style.color="#16A34A",h.style.display="block",document.getElementById("change-current-password").value="",document.getElementById("change-new-password").value="",document.getElementById("change-confirm-password").value=""}catch(H){console.error("Password update error:",H),H.code==="auth/wrong-password"||H.code==="auth/invalid-credential"?h.textContent=n("dash_profile_password_wrong"):h.textContent=n("dash_profile_password_error")+" "+(H.message||""),h.style.color="var(--color-accent, #DC2626)",h.style.display="block"}finally{C&&(C.disabled=!1)}}),le==="coach"){const h=document.getElementById("add-meet-form"),j=document.getElementById("save-meet-btn"),z=document.getElementById("cancel-meet-btn"),R=document.getElementById("meet-form-title");(F=document.getElementById("add-meet-btn"))==null||F.addEventListener("click",()=>{te=null,R.textContent=n("dash_meets_new_title"),j.textContent=n("dash_meets_save"),document.getElementById("meet-name").value="",document.getElementById("meet-start-date").value="",document.getElementById("meet-end-date").value="",document.getElementById("meet-location").value="",h.style.display="block"}),z==null||z.addEventListener("click",()=>{h.style.display="none",te=null}),j==null||j.addEventListener("click",async()=>{var A;const c=document.getElementById("meet-name").value.trim(),y=document.getElementById("meet-start-date").value,w=document.getElementById("meet-end-date").value,I=document.getElementById("meet-location").value.trim(),f=((A=document.getElementById("meet-season"))==null?void 0:A.value)||$;if(!c||!y||!w){alert(n("dash_meets_name_date_required"));return}try{te?await K(k(g,"meets",te),{name:c,startDate:y,endDate:w,location:I,season:f}):await Ce(J(g,"meets"),{name:c,startDate:y,endDate:w,location:I,season:f,status:"Open",createdAt:new Date}),h.style.display="none",te=null}catch(M){console.error("Error saving meet:",M)}}),document.querySelectorAll(".edit-meet").forEach(c=>{c.addEventListener("click",()=>{te=c.dataset.id,R.textContent=n("dash_meets_edit_title"),j.textContent=n("dash_meets_update"),document.getElementById("meet-name").value=c.dataset.name,document.getElementById("meet-start-date").value=c.dataset.start,document.getElementById("meet-end-date").value=c.dataset.end,document.getElementById("meet-location").value=c.dataset.location;const y=document.getElementById("meet-season");y&&(y.value=c.dataset.season||$),h.style.display="block",h.scrollIntoView({behavior:"smooth"})})}),document.querySelectorAll(".delete-meet").forEach(c=>{c.addEventListener("click",async()=>{if(confirm(n("dash_meets_confirm_delete")))try{await Ne(k(g,"meets",c.dataset.id)),te===c.dataset.id&&(h.style.display="none",te=null)}catch(y){console.error("Error deleting meet:",y)}})}),document.querySelectorAll(".meet-fee-btn").forEach(c=>{c.addEventListener("click",()=>{Te(c.dataset.id,c.dataset.name)})});const C=document.getElementById("add-session-form"),H=document.getElementById("save-session-btn"),he=document.getElementById("cancel-session-btn"),Ie=document.getElementById("session-form-title");(P=document.getElementById("add-session-btn"))==null||P.addEventListener("click",()=>{se=null,Ie.textContent=n("dash_schedule_new_title"),H.textContent=n("dash_schedule_save"),document.getElementById("session-day").value=ae(1),document.getElementById("session-start-time").value="",document.getElementById("session-end-time").value="",document.getElementById("session-location").value="",C.style.display="block"}),he==null||he.addEventListener("click",()=>{C.style.display="none",se=null}),H==null||H.addEventListener("click",async()=>{const c=document.getElementById("session-day").value,y=document.getElementById("session-start-time").value.trim(),w=document.getElementById("session-end-time").value.trim(),I=document.getElementById("session-location").value.trim();if(!c||!y||!w){alert(n("dash_schedule_required_fields"));return}try{se?await K(k(g,"schedules",se),{day:c,startTime:y,endTime:w,location:I}):await Ce(J(g,"schedules"),{day:c,startTime:y,endTime:w,location:I,createdAt:new Date}),C.style.display="none",se=null}catch(f){console.error("Error saving session:",f)}}),document.querySelectorAll(".edit-session").forEach(c=>{c.addEventListener("click",()=>{se=c.dataset.id,Ie.textContent=n("dash_schedule_edit_title"),H.textContent=n("dash_schedule_update"),document.getElementById("session-day").value=c.dataset.day,document.getElementById("session-start-time").value=c.dataset.start,document.getElementById("session-end-time").value=c.dataset.end,document.getElementById("session-location").value=c.dataset.location,C.style.display="block",C.scrollIntoView({behavior:"smooth"})})}),document.querySelectorAll(".delete-session").forEach(c=>{c.addEventListener("click",async()=>{if(confirm(n("dash_schedule_delete_confirm")))try{await Ne(k(g,"schedules",c.dataset.id)),se===c.dataset.id&&(C.style.display="none",se=null)}catch(y){console.error("Error deleting session:",y)}})}),(U=document.getElementById("import-csv-btn"))==null||U.addEventListener("click",()=>{const c=document.createElement("input");c.type="file",c.accept=".csv",c.addEventListener("change",us),c.click()}),(Q=document.getElementById("season-select"))==null||Q.addEventListener("change",c=>{$=c.target.value,q()}),(oe=document.getElementById("goto-deposits-link"))==null||oe.addEventListener("click",c=>{c.preventDefault(),N="deposits",q()}),(ve=document.querySelector(".fee-summary-table tbody"))==null||ve.addEventListener("click",c=>{const y=c.target.closest(".fee-summary-main-row");if(!y)return;const w=y.dataset.feeIndex,I=document.querySelector(`.fee-summary-detail-row[data-fee-detail="${w}"]`);if(!I)return;const f=y.querySelector(".fee-summary-expand-icon"),A=I.classList.toggle("expanded");y.classList.toggle("expanded-row",A),f&&(f.classList.toggle("expanded",A),f.textContent=A?"▼":"▶")}),(ge=document.getElementById("fee-summary-export-btn"))==null||ge.addEventListener("click",()=>{ss()}),(ue=document.getElementById("deposits-season-select"))==null||ue.addEventListener("change",c=>{$=c.target.value,q()}),($e=document.getElementById("roster-season-select"))==null||$e.addEventListener("change",c=>{$=c.target.value,q()}),(Ee=document.getElementById("deposits-add-btn"))==null||Ee.addEventListener("click",()=>{document.getElementById("deposits-add-form").style.display="block",document.getElementById("deposits-add-form").scrollIntoView({behavior:"smooth"})}),(ee=document.getElementById("deposits-add-cancel"))==null||ee.addEventListener("click",()=>{document.getElementById("deposits-add-form").style.display="none",document.getElementById("deposits-add-name").value="",document.getElementById("deposits-add-balance").value=""}),(be=document.getElementById("deposits-add-save"))==null||be.addEventListener("click",async()=>{const c=document.getElementById("deposits-add-name").value.trim(),y=parseFloat(document.getElementById("deposits-add-balance").value)||0;if(!c){alert("Swimmer name is required.");return}try{await Ce(J(g,"deposits"),{swimmerName:c,season:$,balance:y,deposit1Amount:null,deposit1Date:null,deposit2Amount:null,deposit2Date:null,deposit3Amount:null,deposit3Date:null,updatedAt:new Date,updatedBy:(v==null?void 0:v.email)||"unknown"}),document.getElementById("deposits-add-form").style.display="none",document.getElementById("deposits-add-name").value="",document.getElementById("deposits-add-balance").value=""}catch(w){console.error("Error adding deposit:",w),alert("Failed to add deposit.")}}),(O=document.getElementById("deposits-upload-balance-btn"))==null||O.addEventListener("click",()=>{const c=document.createElement("input");c.type="file",c.accept=".xls,.xlsx",c.addEventListener("change",async y=>{var f;const w=(f=y.target.files)==null?void 0:f[0];if(y.target.remove(),!w)return;const I=await Wt(w);if(!I){alert(n("dash_fee_summary_deposit_parse_error"));return}Gt(I.valid,I.errors||[],w.name)}),c.click()}),(W=document.getElementById("deposits-upload-detail-btn"))==null||W.addEventListener("click",()=>{const c=document.createElement("input");c.type="file",c.accept=".xls,.xlsx",c.addEventListener("change",async y=>{var f;const w=(f=y.target.files)==null?void 0:f[0];if(y.target.remove(),!w)return;const I=await Kt(w);if(!I){alert(n("dash_fee_summary_deposit_parse_error"));return}Qt(I.valid,I.errors||[],w.name)}),c.click()}),(T=document.getElementById("deposits-export-btn"))==null||T.addEventListener("click",()=>{ts()}),es(),(ie=document.getElementById("save-creds-btn"))==null||ie.addEventListener("click",async()=>{var f,A,M;const c=document.getElementById("creds-message"),y=((f=document.getElementById("creds-device-id"))==null?void 0:f.value)||"",w=((A=document.getElementById("creds-sub-id"))==null?void 0:A.value)||"",I=((M=document.getElementById("creds-session-id"))==null?void 0:M.value)||"";if(!y||!w||!I){c.textContent="❌ Please fill in all three credential fields.",c.style.color="var(--color-accent)";return}try{await Lt(y,w,I),c.textContent="✅ Credentials saved to Firestore.",c.style.color="#16A34A",setTimeout(()=>{c.textContent=""},3e3),q()}catch(we){c.textContent="❌ Save failed: "+we.message,c.style.color="var(--color-accent)"}}),(re=document.getElementById("toggle-guide-btn"))==null||re.addEventListener("click",()=>{const c=document.getElementById("credential-guide");c&&(c.style.display=c.style.display==="none"?"block":"none")});const de=document.getElementById("results-athlete-select"),G=document.getElementById("refetch-one-btn");de==null||de.addEventListener("change",c=>{const y=c.target.value;if(y)Ye(y),G&&(G.disabled=!1);else{const w=document.getElementById("results-viewer");w&&(w.style.display="none"),G&&(G.disabled=!0)}}),G==null||G.addEventListener("click",async()=>{var I;const c=de==null?void 0:de.value;if(!c)return;if(!L||!L.sessionId){alert("Please configure API credentials first.");return}G.disabled=!0,G.textContent="⏳ Fetching...";const y=document.getElementById("fetch-log");y.style.display="block";const w=(f,A)=>{const M=document.createElement("div");M.textContent=`[${new Date().toLocaleTimeString()}] ${f}`,M.style.color=A?"var(--color-accent)":"var(--text-primary)",y.appendChild(M),y.scrollTop=y.scrollHeight};try{w(`🔄 Force-refetching athlete ${c}...`);const f=((I=de.selectedOptions[0])==null?void 0:I.text)||"",A=await rt(L,c,f,{force:!0,onLog:(M,we)=>w(`   ${M}`,we),onBestTimes:M=>w(`   📊 bestTimes: ${M.length} entries`)});w(`✅ Done — ${A.fetched} meets fetched, ${A.failed} failed`),A.errors.length>0&&(A.errors.slice(0,5).forEach(M=>w(`   ⚠ ${M}`,!0)),A.errors.length>5&&w(`   …and ${A.errors.length-5} more`,!0)),Ye(c)}catch(f){w(`❌ Refetch failed: ${f.message}`,!0)}finally{G.disabled=!1,G.textContent="🔄 Refetch Selected Athlete"}}),(xe=document.getElementById("fetch-all-btn"))==null||xe.addEventListener("click",async()=>{if(fe)return;if(!L||!L.deviceId||!L.sessionId){alert("Please configure and save API credentials first.");return}fe=!0;const c=document.getElementById("fetch-log"),y=document.getElementById("fetch-status"),w=document.getElementById("fetch-all-btn");c.style.display="block",c.innerHTML="",w.disabled=!0,w.textContent="⏳ Fetching...";const I=(f,A)=>{const M=document.createElement("div");M.textContent=`[${new Date().toLocaleTimeString()}] ${f}`,M.style.color=A?"var(--color-accent)":"var(--text-primary)",c.appendChild(M),c.scrollTop=c.scrollHeight};await Mt(L,f=>{switch(f.type){case"start":I(`🚀 Starting fetch for ${f.total} athlete(s)...`),y.textContent=`⏳ 0 / ${f.total}`;break;case"swimmer-start":I(`🔄 ${f.name} (${f.memberId})...`);break;case"step":I(`   📊 ${f.step}: ${f.count} entries`);break;case"log":I(`   ${f.message}`,f.isError);break;case"swimmer-done":f.written?I(`   ✅ Written: ${f.bestTimes} best times, ${f.meets} meets (${f.newMeets} new${f.failedMeets>0?`, ${f.failedMeets} failed`:""})`):I("   ⏭ Skipped: no new meets");const A=document.getElementById(`status-${f.memberId}`);A&&(A.innerHTML=`<span style="color:#16A34A;">✅ ${f.bestTimes} best times, ${f.meets} meets</span>`);break;case"swimmer-error":I(`   ❌ Failed: ${f.error}`,!0);const M=document.getElementById(`status-${f.memberId}`);M&&(M.innerHTML=`<span style="color:var(--color-accent);">❌ ${E(f.error)}</span>`);break;case"progress":y.textContent=`⏳ ${f.index} / ${f.total} (✅ ${f.success} ❌ ${f.failed})`;break;case"done":y.textContent=`✅ Done: ${f.success} succeeded, ${f.failed} failed`,y.style.color=f.failed>0?"var(--color-accent)":"#16A34A",I(""),I(`✅ Fetch complete — ${f.success} succeeded, ${f.failed} failed`),f.errors.length>0&&(I("Error details:",!0),f.errors.forEach(we=>I(`  • ${we}`,!0))),fe=!1,w.disabled=!1,w.textContent="🔄 Fetch All Swimmer Results";break;case"error":I(`❌ ${f.message}`,!0),y.textContent="❌ Failed",y.style.color="var(--color-accent)",fe=!1,w.disabled=!1,w.textContent="🔄 Fetch All Swimmer Results";break}})})}}gt();
