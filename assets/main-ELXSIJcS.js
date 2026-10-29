import"./modulepreload-polyfill-B5Qt9EMX.js";import{i as $,t}from"./i18n-Dxgloy5T.js";import{a as x,r as E}from"./footer-Cbj4AXjT.js";import{t as k,b as I,g as M,c as j,r as D,d as T,i as V,p as g}from"./news-CmlwDKK8.js";const F="/assets/980639303bf1d86ee10c28975f44ac03-D6wAvmae.jpg",B="/assets/DSC_0235-BcK4YLPT.jpg",L="/assets/DSC_0484-DNBuOau_.jpg",O="/assets/DSC_0491-DjuYdXrf.jpg",R="/assets/DSC_0530-jKnjlx_M.jpg",N="/assets/DSC_0915%20(2)-Ba7p0FwD.jpg",P="/assets/DSC_1000%20(2)-DIpZBNi1.jpg",z="/assets/IMG_4429-B7GHJQMZ.jpg",K="/assets/IMG_8124-BbgwW0FJ.jpg",W={DEV:!1,VITE_FIREBASE_API_KEY:"AIzaSyBNJKy8UMCzlGjFjEoOesNsIcwQKJnIROA",VITE_FIREBASE_PROJECT_ID:"dragonwebsite-db"},b="dragon.home.announcements.v1",_=50,H=6e3,m=W||{},w=typeof window<"u",J=w&&(window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1")&&m.DEV===!0&&m.VITE_USE_FIREBASE_EMULATOR==="true";function i(e){if(!(!e||typeof e!="object")){if("stringValue"in e)return e.stringValue;if("booleanValue"in e)return e.booleanValue===!0;if("integerValue"in e)return Number(e.integerValue);if("doubleValue"in e)return Number(e.doubleValue);if("timestampValue"in e)return e.timestampValue;if("nullValue"in e)return null;if("arrayValue"in e)return(e.arrayValue.values||[]).map(i)}}function U(e){const s=e&&e.fields||{},n=String(e&&e.name||"").split("/").pop();if(!n)return null;const o=i(s.level),r=i(s.until),c={id:n,title:String(i(s.title)||"").trim(),body:String(i(s.body)||""),level:o==="urgent"?"urgent":"info",pinned:i(s.pinned)===!0,date:String(i(s.date)||""),until:r?String(r):null,updatedAt:i(s.updatedAt)||null};return!c.title||!c.body.trim()?null:c}function Y(e){return(e&&e.documents||[]).map(U).filter(Boolean)}function G(){if(!w)return[];try{const e=window.localStorage.getItem(b),s=e?JSON.parse(e):[];return Array.isArray(s)?s.filter(a=>a&&a.id&&a.title):[]}catch{return[]}}function q(e){try{const s=k(),a=(Array.isArray(e)?e:[]).filter(n=>I(n)||n.date>s).slice(0,_);window.localStorage.setItem(b,JSON.stringify(a))}catch{}}function Q(){const e=m.VITE_FIREBASE_PROJECT_ID,s=m.VITE_FIREBASE_API_KEY;return!e||!s?null:`https://firestore.googleapis.com/v1/projects/${e}/databases/(default)/documents/announcements?pageSize=${_}&key=${s}`}async function X({timeoutMs:e=H}={}){if(J)throw new Error("emulator mode: announcements REST read skipped");const s=Q();if(!s)throw new Error("firebase config missing (VITE_FIREBASE_*)");const a=new AbortController,n=setTimeout(()=>a.abort(),e);try{const o=await fetch(s,{signal:a.signal,cache:"no-store"});if(o.status===404)return v([]);if(!o.ok)throw new Error(`HTTP ${o.status}`);const r=await o.json();return v(Y(r))}finally{clearTimeout(n)}}function v(e){return e.length&&q(e),e}function Z(){const e=G(),s=X().then(a=>({items:a,fromCache:!1})).catch(a=>({items:e,fromCache:!0,error:a}));return{cached:e,fresh:s}}const u=Object.assign({"../assets/team-photos/980639303bf1d86ee10c28975f44ac03.jpg":F,"../assets/team-photos/DSC_0235.jpg":B,"../assets/team-photos/DSC_0484.jpg":L,"../assets/team-photos/DSC_0491.jpg":O,"../assets/team-photos/DSC_0530.jpg":R,"../assets/team-photos/DSC_0915 (2).jpg":N,"../assets/team-photos/DSC_1000 (2).jpg":P,"../assets/team-photos/IMG_4429.jpg":z,"../assets/team-photos/IMG_8124.jpg":K}),f=Object.keys(u).sort((e,s)=>e.localeCompare(s,void 0,{numeric:!0})).map(e=>u[e]),ee=3500;$();x();const{cached:se,fresh:ae}=Z(),l=M(se),y=j(l),te=document.getElementById("app");te.innerHTML=`
  <div id="news-banner-slot">${D(y)}</div>

  <!-- Hero Section -->
  <section class="hero">
    <div class="hero-grid-bg"></div>
    <div class="container hero-container">
      <div class="hero-left animate-on-scroll">
        <div class="hero-badge badge badge-primary">🏊 Year-Round Competitive Swimming</div>
        <h1 class="hero-title">${t("hero_title")} <span class="text-gradient">Dragon Swim</span></h1>
        <p class="hero-subtitle">${t("hero_subtitle")}</p>
      </div>
      <div class="hero-right">
        <div class="hero-float-grid">
          <!-- Floating feature cards -->
          <a href="#news" class="hero-float-card hfc-1" aria-label="${t("news_title")}">
            <div class="hfc-icon">📰</div>
            <div class="hfc-label">News</div>
            <span class="hfc-dot" id="news-dot" aria-hidden="true" ${l.length?"":"hidden"}></span>
          </a>
          <a href="/signin.html" class="hero-float-card hfc-2">
            <div class="hfc-icon">🏆</div>
            <div class="hfc-label">Swim Meets</div>
          </a>
          <a href="/signin.html" class="hero-float-card hfc-3">
            <div class="hfc-icon">📅</div>
            <div class="hfc-label">Schedules</div>
          </a>
          <!-- Central dragon -->
          <div class="hero-central-icon">
            <div class="hero-central-ring"></div>
            <img src="/logo-light.jpg" alt="Dragon" style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover; background: var(--border-color); border: 4px solid var(--bg-card); box-shadow: var(--shadow-lg); position: relative; z-index: 10;" />
          </div>
          <!-- Connecting dots -->
          <div class="hero-dot dot-1"></div>
          <div class="hero-dot dot-2"></div>
          <div class="hero-dot dot-3"></div>
          <div class="hero-dot dot-4"></div>
          <!-- Connector lines (done via CSS) -->
        </div>
      </div>
    </div>
    <!-- Decorative dots at section corners -->
    <div class="corner-dot corner-tl"></div>
    <div class="corner-dot corner-tr"></div>
    <div class="corner-dot corner-bl"></div>
    <div class="corner-dot corner-br"></div>
  </section>

  ${T(l,{pending:l.length===0})}

  <!-- Why Dragon Swim Section -->
  <section class="section features-section" style="background: var(--bg-secondary);">
    <div class="container">
      <div class="text-center features-header animate-on-scroll" style="margin: 0 auto var(--space-2xl);">
        <span class="badge badge-primary features-label">${t("why_title")}</span>
        <h2 class="section-title" style="margin-top: var(--space-md);">${t("why_title")}</h2>
        <div class="divider" style="margin: var(--space-md) auto;"></div>
      </div>
      <div class="features-grid animate-on-scroll">
        <div class="card feature-card text-center">
          <div class="feature-icon">🏅</div>
          <h3 class="feature-title">${t("why_coaching")}</h3>
          <p class="feature-desc">${t("why_coaching_desc")}</p>
        </div>
        <div class="card feature-card text-center">
          <div class="feature-icon">🤝</div>
          <h3 class="feature-title">${t("why_community")}</h3>
          <p class="feature-desc">${t("why_community_desc")}</p>
        </div>
        <div class="card feature-card text-center">
          <div class="feature-icon">📅</div>
          <h3 class="feature-title">${t("why_flexibility")}</h3>
          <p class="feature-desc">${t("why_flexibility_desc")}</p>
        </div>
        <div class="card feature-card text-center">
          <div class="feature-icon">🌟</div>
          <h3 class="feature-title">${t("why_growth")}</h3>
          <p class="feature-desc">${t("why_growth_desc")}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Seasons Overview -->
  <section class="section seasons-section">
    <div class="container">
      <div class="text-center animate-on-scroll" style="margin-bottom: var(--space-2xl);">
        <span class="badge badge-primary">Seasons</span>
        <h2 class="section-title" style="margin-top: var(--space-md);">${t("seasons_title")}</h2>
        <div class="divider" style="margin: var(--space-md) auto;"></div>
        <p class="section-subtitle" style="margin: 0 auto;">${t("seasons_subtitle")}</p>
      </div>
      <div class="seasons-grid">
        ${p("spring","🌸","#22C55E")}
        ${p("summer","☀️","#F59E0B")}
        ${p("fall","🍂","#E84D25")}
        ${p("winter","❄️","#3B82F6")}
      </div>

      <div class="season-schedule animate-on-scroll">
        <h3 class="season-schedule-title">2026–2027 Season Schedule &amp; Locations</h3>
        <p class="season-schedule-dates"><strong>Season dates:</strong> Fall: Sep 8 – Nov 9 &nbsp;·&nbsp; Winter: Nov 10 – Feb 17 &nbsp;·&nbsp; Spring: Feb 18 – Jun 11 &nbsp;·&nbsp; Summer: Jun 12 – Labor Day</p>
        <div class="season-location-grid">
          <div class="season-location-card">
            <h4 class="season-location-name">Claude Moore Recreation Center</h4>
            <p class="season-location-line"><strong>Fall &amp; Spring:</strong> Mon &amp; Wed 6:30–8:30 pm (Advanced — group determined by the Head Coach), 7:30–9 pm (All levels); Fri 7–9 pm (All levels); Sat &amp; Sun 12–2 pm</p>
            <p class="season-location-line"><strong>Winter:</strong> Mon &amp; Wed 6–7:30 pm (Advanced), 7:30–9 pm (All levels); Fri 7–9 pm (All levels); Sat &amp; Sun 12–2 pm</p>
            <p class="season-location-line"><strong>Summer:</strong> Wed 6:30–8:30 pm; Fri 7–9 pm; Sun 12–2 pm &amp; 2–4 pm</p>
          </div>
          <div class="season-location-card">
            <h4 class="season-location-name">Dulles South Recreation Center</h4>
            <p class="season-location-line"><strong>Fall, Spring &amp; Winter:</strong> Mon &amp; Fri 7:30–9 pm; Sat &amp; Sun 3–5 pm</p>
            <p class="season-location-line"><strong>Summer:</strong> Mon 7:30–9 pm; Sat 2–4 pm</p>
          </div>
          <div class="season-location-card">
            <h4 class="season-location-name">Tysons — OneLife Fitness Tysons</h4>
            <p class="season-location-line"><strong>Year-round:</strong> Tue &amp; Wed 6:30–8:30 pm; Sat &amp; Sun 8–10 am</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Meet the Coaches Section -->
  <section class="section coaches-section" style="background: var(--bg-secondary);">
    <div class="container">
      <div class="text-center animate-on-scroll" style="margin-bottom: var(--space-2xl);">
        <span class="badge badge-primary">${t("home_leadership_badge")}</span>
        <h2 class="section-title" style="margin-top: var(--space-md);">${t("home_coaches_title")}</h2>
        <div class="divider" style="margin: var(--space-md) auto;"></div>
      </div>
      <div class="team-grid animate-on-scroll" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-lg);">
        ${h("Coach Kevin","Head Coach",`Coach Kevin is an ASCA Level 5 Coach—the highest level of ASCA coaching certification—and an ASCA Life Member, maintaining Level 5 status for three consecutive years (2024–2026). He has been recognized among the nation's top age group coaches, including the ASCA Top 50 in 2019, Top 25 Small Team Coaches in 2025, and Top 5 Small Team Coaches in 2026.

Coach Kevin was a finalist for the 2024 ASCA Top 4 Impact Coach Award and is one of five finalists for the 2026 ASCA Age Group Coach of the Year Award in the Small Team Division. His focus is simple: helping every swimmer reach their potential through strong fundamentals, individualized coaching, and a positive training environment.`)}
        ${h("Coach Lisa","Coach & Manager","Coach Lisa is an expert in stroke technique and fundamentals. By utilizing precise stroke breakdown and biomechanical analysis, she optimizes each swimmer's entry angle, catch, and pulling efficiency. As a team manager, Coach Lisa also truly cares about swimmers' mental health. She is skilled at noticing emotional changes and helping swimmers overcome issues arising from swimming and life, enabling them to achieve their best in a healthy, happy state of mind.")}
        ${h("Coach Sue","Coach","Coach Sue has been with Dragon Swim Team for more than 15 years and has more than 20 years of coaching experience. She is a master of aquatic conditioning and race strategy, focused on unlocking an athlete's full physiological potential through scientific, dynamic, and comprehensive training. Coach Sue eliminates the monotony of one-dimensional practices by designing highly engaging, multi-stroke swim sets that seamlessly transition between butterfly, backstroke, breaststroke, and freestyle. This high-intensity, comprehensive approach not only significantly boosts a swimmer's Individual Medley (IM) prowess but also precisely targets different energy systems—from the aerobic base to anaerobic lactate threshold sprinting.")}
      </div>
    </div>
  </section>

  <!-- Mission & Vision Section -->
  <section class="section mission-section">
    <div class="container" style="max-width: 800px; text-align: center;">
      <div class="animate-on-scroll">
        <span class="badge badge-primary">${t("home_mission_badge")}</span>
        <h2 class="section-title" style="margin-top: var(--space-md);">${t("home_mission_title")}</h2>
        <div class="divider" style="margin: var(--space-md) auto;"></div>
        <p class="mission-statement">${t("home_mission_text")}</p>
      </div>
    </div>
  </section>

  <!-- SafeSport Compliance Section -->
  <section class="section safesport-section" id="safesport" style="background: var(--bg-secondary);">
    <div class="container" style="max-width: 800px;">
      <div class="text-center animate-on-scroll" style="margin-bottom: var(--space-2xl);">
        <span class="badge badge-primary">${t("safesport_badge")}</span>
        <h2 class="section-title" style="margin-top: var(--space-md);">${t("safesport_title")}</h2>
        <div class="divider" style="margin: var(--space-md) auto;"></div>
        <p style="color: var(--text-secondary); line-height: 1.8; margin: 0 auto; max-width: 650px;">${t("safesport_intro")}</p>
      </div>
      <div class="animate-on-scroll">
        <div class="safesport-links">
          <a href="https://www.usaswimming.org/safe-sport/report-a-concern" target="_blank" rel="noopener" class="safesport-link">
            <span class="safesport-link-title">Report a Concern</span>
            <span class="safesport-link-desc">Report misconduct, abuse, or safety violations to USA Swimming</span>
          </a>
          <a href="https://www.usaswimming.org/articles-landing-page/2017/04/06/2017-athlete-protection-policies" target="_blank" rel="noopener" class="safesport-link">
            <span class="safesport-link-title">Athlete Protection Policy</span>
            <span class="safesport-link-desc">USA Swimming's MAAPP policies for athlete safety</span>
          </a>
          <a href="https://www.usaswimming.org/safe-sport/club-tool-kit#team-templates" target="_blank" rel="noopener" class="safesport-link">
            <span class="safesport-link-title">Code of Conduct</span>
            <span class="safesport-link-desc">Club toolkit with team templates and conduct guidelines</span>
          </a>
          <a href="https://safesport.i-sight.com/portal" target="_blank" rel="noopener" class="safesport-link">
            <span class="safesport-link-title">Online Reporting Form</span>
            <span class="safesport-link-desc">Submit a report directly through the SafeSport portal</span>
          </a>
          <a href="https://uscenterforsafesport.org/" target="_blank" rel="noopener" class="safesport-link">
            <span class="safesport-link-title">Safe Sport</span>
            <span class="safesport-link-desc">U.S. Center for SafeSport — training, resources, and response</span>
          </a>
          <a href="https://www.usaswimming.org/swimmers-parents/parents/safe-sport-for-parents" target="_blank" rel="noopener" class="safesport-link">
            <span class="safesport-link-title">Safe Sport for Parents</span>
            <span class="safesport-link-desc">USA Swimming parent education and SafeSport resources</span>
          </a>
          <a href="https://www.usaswimming.org/articles-landing-page/2017/04/05/free-safe-sport-training-for-athletes" target="_blank" rel="noopener" class="safesport-link">
            <span class="safesport-link-title">Safe Sport for Athletes</span>
            <span class="safesport-link-desc">Free SafeSport training courses for athletes</span>
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- Meet the Team Section -->
  <section class="section team-intro-section">
    <div class="container">
      <div class="text-center animate-on-scroll" style="margin-bottom: var(--space-2xl);">
        <span class="badge badge-primary">${t("home_journey_badge")}</span>
        <h2 class="section-title" style="margin-top: var(--space-md);">${t("home_team_title")}</h2>
        <div class="divider" style="margin: var(--space-md) auto;"></div>
        <p class="section-subtitle" style="margin: 0 auto;">${t("home_team_subtitle")}</p>
      </div>
      
      <div class="team-photo-wrapper animate-on-scroll" style="margin-bottom: var(--space-2xl); text-align: center;">
        ${ie()}
      </div>
    </div>
  </section>

`;E();V(y);ae.then(({items:e,error:s,fromCache:a})=>{if(a&&s){console.warn("[news] 读不到公告,沿用缓存:",s.message),l.length===0&&g([],{pending:!1});return}g(e)});document.querySelectorAll('a[href="#news"]').forEach(e=>{e.addEventListener("click",s=>{const a=document.getElementById("news");if(!a)return;s.preventDefault();const n=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;a.scrollIntoView({behavior:n?"auto":"smooth",block:"start"}),history.replaceState(null,"","#news")})});const ne={root:null,rootMargin:"0px",threshold:.15},oe=new IntersectionObserver((e,s)=>{e.forEach(a=>{a.isIntersecting&&(a.target.classList.add("animate-visible"),s.unobserve(a.target))})},ne);document.querySelectorAll(".animate-on-scroll").forEach(e=>{oe.observe(e)});const d=document.getElementById("team-slideshow");if(d){const e=Array.from(d.querySelectorAll(".team-slide")),s=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;if(e.length>1&&!s){let a=0,n=null;const o=S=>{e.forEach((A,C)=>A.classList.toggle("active",C===S))},r=()=>{n&&(clearInterval(n),n=null)},c=()=>{r(),n=setInterval(()=>{a=(a+1)%e.length,o(a)},ee)};o(0),c(),d.addEventListener("mouseenter",r),d.addEventListener("mouseleave",c)}}function ie(){return f.length===0?`
      <div style="width: 100%; max-width: 900px; height: 400px; background: var(--bg-secondary); border-radius: var(--radius-lg); display: inline-flex; align-items: center; justify-content: center; border: 2px dashed var(--border-color); margin: 0 auto;">
        <span style="color: var(--text-muted); font-weight: var(--fw-medium);">[ Team Photo ]</span>
      </div>
    `:`
    <div class="team-slideshow" id="team-slideshow" role="region" aria-label="Dragon Swim team photos">
      ${f.map((e,s)=>`<img class="team-slide${s===0?" active":""}" src="${e}" alt="Dragon Swim team photo ${s+1}" />`).join("")}
    </div>
  `}function p(e,s,a){return`
    <div class="card season-card" style="--season-accent: ${a}">
      <div class="season-emoji">${s}</div>
      <h3 class="season-name">${t("season_"+e)}</h3>
      <p class="season-dates">${t("season_"+e+"_dates")}</p>
      <p class="season-desc">${t("season_"+e+"_desc")}</p>
    </div>
  `}function h(e,s,a){return`
    <div class="card team-card text-center">
      <div class="team-img-placeholder" style="width: 120px; height: 120px; border-radius: 50%; background: var(--border-color); margin: 0 auto var(--space-md); overflow: hidden; border: 3px solid var(--color-primary);">
        <img src="/placeholder-coach.jpg" alt="${e}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0;" onload="this.style.opacity=1" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Cpath fill=%22%23ccc%22 d=%22M50 50c11 0 20-9 20-20s-9-20-20-20-20 9-20 20 9 20 20 20zm0 10c-13.3 0-40 6.7-40 20v10h80V80c0-13.3-26.7-20-40-20z%22/%3E%3C/svg%3E'" />
      </div>
      <h3 class="team-name" style="font-family: var(--font-display); font-size: var(--fs-lg); margin-bottom: var(--space-xs);">${e}</h3>
      <p class="team-role" style="font-size: var(--fs-sm); font-weight: var(--fw-semibold); color: var(--color-accent); margin-bottom: var(--space-sm);">${s}</p>
      <p class="team-desc" style="font-size: var(--fs-sm); color: var(--text-secondary);">${a}</p>
    </div>
  `}
