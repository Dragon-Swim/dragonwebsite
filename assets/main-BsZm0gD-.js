import{t as a,i as $}from"./i18n-CWIaZc2X.js";import{a as k,r as C}from"./footer-ByNUqTun.js";const x="/assets/980639303bf1d86ee10c28975f44ac03-D6wAvmae.jpg",A="/assets/DSC_0235-BcK4YLPT.jpg",D="/assets/DSC_0484-DNBuOau_.jpg",M="/assets/DSC_0491-DjuYdXrf.jpg",j="/assets/DSC_0530-jKnjlx_M.jpg",T="/assets/DSC_0915%20(2)-Ba7p0FwD.jpg",I="/assets/DSC_1000%20(2)-DIpZBNi1.jpg",E="/assets/IMG_4429-B7GHJQMZ.jpg",B="/assets/IMG_8124-BbgwW0FJ.jpg",F=[{id:"dulles-south-weekend-2026-10-24",date:"2026-10-22",until:"2026-10-25",level:"urgent",pinned:!0,title:"Weekend Update: No Dulles South Training, Oct 24–25",body:`There is no training at Dulles South this Saturday and Sunday (10/24 & 10/25).

All other locations keep their regular weekend practices, unchanged.

Dulles South swimmers who would still like to get in the water this weekend are welcome to join a practice at another location. Please let your coach know in advance so we can plan lane space.`}];function L(e=new Date){const s=e.getFullYear(),t=String(e.getMonth()+1).padStart(2,"0"),n=String(e.getDate()).padStart(2,"0");return`${s}-${t}-${n}`}function N(e,s=new Date){const t=L(s);return!(e.date&&t<e.date||e.until&&t>e.until)}function v(e=new Date){return F.filter(s=>N(s,e)).sort((s,t)=>String(t.date||"").localeCompare(String(s.date||"")))}function O(e=new Date){return v(e).find(s=>s.pinned===!0)||null}function P(e){if(!e)return"";const s=new Date(`${e}T12:00:00`);return Number.isNaN(s.getTime())?e:s.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}const u="dragon.home.banner.dismissed.v1";function f(){try{const e=window.localStorage.getItem(u),s=e?JSON.parse(e):[];return Array.isArray(s)?s:[]}catch{return[]}}function z(e){try{const s=f().filter(t=>t!==e);s.push(e),window.localStorage.setItem(u,JSON.stringify(s.slice(-20)))}catch{}}function i(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function w(e){return String(e??"").split(`
`).map(s=>s.trim()).filter(Boolean)}function W(){return v()}function H(){const e=O();return e?f().includes(e.id)?null:e:null}function q(e){if(!e)return"";const[s]=w(e.body),t=e.level==="urgent";return`
      <div class="news-banner${t?" is-urgent":""}" role="status" aria-live="polite">
        <div class="container news-banner-inner">
          <span class="news-banner-icon" aria-hidden="true">${t?"📣":"📰"}</span>
          <div class="news-banner-body">
            <strong class="news-banner-title">${i(e.title)}</strong>
            ${s?`<span class="news-banner-text">${i(s)}</span>`:""}
          </div>
          <a class="news-banner-link" href="#news">${a("news_read_more")}</a>
          <button type="button" class="news-banner-close" id="news-banner-close" aria-label="${a("news_dismiss")}" title="${a("news_dismiss")}">&#10005;</button>
        </div>
      </div>
    `}function U(e){const s=Array.isArray(e)?e:[],t=s.length?s.map(Y).join(""):`<p class="news-empty">${a("news_empty")}</p>`;return`
      <section class="section news-section" id="news">
        <div class="container">
          <div class="text-center animate-on-scroll" style="margin-bottom: var(--space-2xl);">
            <span class="badge badge-primary">${a("news_badge")}</span>
            <h2 class="section-title" style="margin-top: var(--space-md);">${a("news_title")}</h2>
            <div class="divider" style="margin: var(--space-md) auto;"></div>
            <p class="section-subtitle" style="margin: 0 auto;">${a("news_subtitle")}</p>
          </div>
          <div class="news-grid">${t}</div>
        </div>
      </section>
    `}function Y(e){const s=e.level==="urgent",t=w(e.body).map(o=>`<p>${i(o)}</p>`).join(""),n=e.link&&e.link.href?(()=>{const o=/^https?:/i.test(e.link.href);return`<a class="news-card-link" href="${i(e.link.href)}"${o?' target="_blank" rel="noopener"':""}>${i(e.link.label||a("news_read_more"))} &rarr;</a>`})():"";return`
      <article class="news-card${s?" is-urgent":""}">
        <div class="news-card-meta">
          <time class="news-card-date" datetime="${i(e.date||"")}">${i(P(e.date))}</time>
          ${e.pinned?`<span class="news-card-pin">${a("news_pinned")}</span>`:""}
        </div>
        <h3 class="news-card-title">${i(e.title)}</h3>
        <div class="news-card-body">${t}</div>
        ${n}
      </article>
    `}function G(e){const s=document.querySelector(".news-banner"),t=document.getElementById("news-banner-close");!s||!t||!e||t.addEventListener("click",()=>{z(e.id),s.style.transition="opacity 150ms ease",s.style.opacity="0",window.setTimeout(()=>s.remove(),160)})}const m=Object.assign({"../assets/team-photos/980639303bf1d86ee10c28975f44ac03.jpg":x,"../assets/team-photos/DSC_0235.jpg":A,"../assets/team-photos/DSC_0484.jpg":D,"../assets/team-photos/DSC_0491.jpg":M,"../assets/team-photos/DSC_0530.jpg":j,"../assets/team-photos/DSC_0915 (2).jpg":T,"../assets/team-photos/DSC_1000 (2).jpg":I,"../assets/team-photos/IMG_4429.jpg":E,"../assets/team-photos/IMG_8124.jpg":B}),h=Object.keys(m).sort((e,s)=>e.localeCompare(s,void 0,{numeric:!0})).map(e=>m[e]),J=3500;$();k();const g=W(),b=H(),K=document.getElementById("app");K.innerHTML=`
  ${q(b)}

  <!-- Hero Section -->
  <section class="hero">
    <div class="hero-grid-bg"></div>
    <div class="container hero-container">
      <div class="hero-left animate-on-scroll">
        <div class="hero-badge badge badge-primary">🏊 Year-Round Competitive Swimming</div>
        <h1 class="hero-title">${a("hero_title")} <span class="text-gradient">Dragon Swim</span></h1>
        <p class="hero-subtitle">${a("hero_subtitle")}</p>
      </div>
      <div class="hero-right">
        <div class="hero-float-grid">
          <!-- Floating feature cards -->
          <a href="#news" class="hero-float-card hfc-1" aria-label="${a("news_title")}">
            <div class="hfc-icon">📰</div>
            <div class="hfc-label">News</div>
            ${g.length?'<span class="hfc-dot" aria-hidden="true"></span>':""}
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

  ${U(g)}

  <!-- Why Dragon Swim Section -->
  <section class="section features-section" style="background: var(--bg-secondary);">
    <div class="container">
      <div class="text-center features-header animate-on-scroll" style="margin: 0 auto var(--space-2xl);">
        <span class="badge badge-primary features-label">${a("why_title")}</span>
        <h2 class="section-title" style="margin-top: var(--space-md);">${a("why_title")}</h2>
        <div class="divider" style="margin: var(--space-md) auto;"></div>
      </div>
      <div class="features-grid animate-on-scroll">
        <div class="card feature-card text-center">
          <div class="feature-icon">🏅</div>
          <h3 class="feature-title">${a("why_coaching")}</h3>
          <p class="feature-desc">${a("why_coaching_desc")}</p>
        </div>
        <div class="card feature-card text-center">
          <div class="feature-icon">🤝</div>
          <h3 class="feature-title">${a("why_community")}</h3>
          <p class="feature-desc">${a("why_community_desc")}</p>
        </div>
        <div class="card feature-card text-center">
          <div class="feature-icon">📅</div>
          <h3 class="feature-title">${a("why_flexibility")}</h3>
          <p class="feature-desc">${a("why_flexibility_desc")}</p>
        </div>
        <div class="card feature-card text-center">
          <div class="feature-icon">🌟</div>
          <h3 class="feature-title">${a("why_growth")}</h3>
          <p class="feature-desc">${a("why_growth_desc")}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Seasons Overview -->
  <section class="section seasons-section">
    <div class="container">
      <div class="text-center animate-on-scroll" style="margin-bottom: var(--space-2xl);">
        <span class="badge badge-primary">Seasons</span>
        <h2 class="section-title" style="margin-top: var(--space-md);">${a("seasons_title")}</h2>
        <div class="divider" style="margin: var(--space-md) auto;"></div>
        <p class="section-subtitle" style="margin: 0 auto;">${a("seasons_subtitle")}</p>
      </div>
      <div class="seasons-grid">
        ${l("spring","🌸","#22C55E")}
        ${l("summer","☀️","#F59E0B")}
        ${l("fall","🍂","#E84D25")}
        ${l("winter","❄️","#3B82F6")}
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
        <span class="badge badge-primary">${a("home_leadership_badge")}</span>
        <h2 class="section-title" style="margin-top: var(--space-md);">${a("home_coaches_title")}</h2>
        <div class="divider" style="margin: var(--space-md) auto;"></div>
      </div>
      <div class="team-grid animate-on-scroll" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-lg);">
        ${c("Coach Kevin","Head Coach",`Coach Kevin is an ASCA Level 5 Coach—the highest level of ASCA coaching certification—and an ASCA Life Member, maintaining Level 5 status for three consecutive years (2024–2026). He has been recognized among the nation's top age group coaches, including the ASCA Top 50 in 2019, Top 25 Small Team Coaches in 2025, and Top 5 Small Team Coaches in 2026.

Coach Kevin was a finalist for the 2024 ASCA Top 4 Impact Coach Award and is one of five finalists for the 2026 ASCA Age Group Coach of the Year Award in the Small Team Division. His focus is simple: helping every swimmer reach their potential through strong fundamentals, individualized coaching, and a positive training environment.`)}
        ${c("Coach Lisa","Coach & Manager","Coach Lisa is an expert in stroke technique and fundamentals. By utilizing precise stroke breakdown and biomechanical analysis, she optimizes each swimmer's entry angle, catch, and pulling efficiency. As a team manager, Coach Lisa also truly cares about swimmers' mental health. She is skilled at noticing emotional changes and helping swimmers overcome issues arising from swimming and life, enabling them to achieve their best in a healthy, happy state of mind.")}
        ${c("Coach Sue","Coach","Coach Sue has been with Dragon Swim Team for more than 15 years and has more than 20 years of coaching experience. She is a master of aquatic conditioning and race strategy, focused on unlocking an athlete's full physiological potential through scientific, dynamic, and comprehensive training. Coach Sue eliminates the monotony of one-dimensional practices by designing highly engaging, multi-stroke swim sets that seamlessly transition between butterfly, backstroke, breaststroke, and freestyle. This high-intensity, comprehensive approach not only significantly boosts a swimmer's Individual Medley (IM) prowess but also precisely targets different energy systems—from the aerobic base to anaerobic lactate threshold sprinting.")}
      </div>
    </div>
  </section>

  <!-- Mission & Vision Section -->
  <section class="section mission-section">
    <div class="container" style="max-width: 800px; text-align: center;">
      <div class="animate-on-scroll">
        <span class="badge badge-primary">${a("home_mission_badge")}</span>
        <h2 class="section-title" style="margin-top: var(--space-md);">${a("home_mission_title")}</h2>
        <div class="divider" style="margin: var(--space-md) auto;"></div>
        <p class="mission-statement">${a("home_mission_text")}</p>
      </div>
    </div>
  </section>

  <!-- SafeSport Compliance Section -->
  <section class="section safesport-section" id="safesport" style="background: var(--bg-secondary);">
    <div class="container" style="max-width: 800px;">
      <div class="text-center animate-on-scroll" style="margin-bottom: var(--space-2xl);">
        <span class="badge badge-primary">${a("safesport_badge")}</span>
        <h2 class="section-title" style="margin-top: var(--space-md);">${a("safesport_title")}</h2>
        <div class="divider" style="margin: var(--space-md) auto;"></div>
        <p style="color: var(--text-secondary); line-height: 1.8; margin: 0 auto; max-width: 650px;">${a("safesport_intro")}</p>
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
        <span class="badge badge-primary">${a("home_journey_badge")}</span>
        <h2 class="section-title" style="margin-top: var(--space-md);">${a("home_team_title")}</h2>
        <div class="divider" style="margin: var(--space-md) auto;"></div>
        <p class="section-subtitle" style="margin: 0 auto;">${a("home_team_subtitle")}</p>
      </div>
      
      <div class="team-photo-wrapper animate-on-scroll" style="margin-bottom: var(--space-2xl); text-align: center;">
        ${Z()}
      </div>
    </div>
  </section>

`;C();G(b);document.querySelectorAll('a[href="#news"]').forEach(e=>{e.addEventListener("click",s=>{const t=document.getElementById("news");if(!t)return;s.preventDefault();const n=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;t.scrollIntoView({behavior:n?"auto":"smooth",block:"start"}),history.replaceState(null,"","#news")})});const R={root:null,rootMargin:"0px",threshold:.15},V=new IntersectionObserver((e,s)=>{e.forEach(t=>{t.isIntersecting&&(t.target.classList.add("animate-visible"),s.unobserve(t.target))})},R);document.querySelectorAll(".animate-on-scroll").forEach(e=>{V.observe(e)});const r=document.getElementById("team-slideshow");if(r){const e=Array.from(r.querySelectorAll(".team-slide")),s=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;if(e.length>1&&!s){let t=0,n=null;const o=y=>{e.forEach((_,S)=>_.classList.toggle("active",S===y))},d=()=>{n&&(clearInterval(n),n=null)},p=()=>{d(),n=setInterval(()=>{t=(t+1)%e.length,o(t)},J)};o(0),p(),r.addEventListener("mouseenter",d),r.addEventListener("mouseleave",p)}}function Z(){return h.length===0?`
      <div style="width: 100%; max-width: 900px; height: 400px; background: var(--bg-secondary); border-radius: var(--radius-lg); display: inline-flex; align-items: center; justify-content: center; border: 2px dashed var(--border-color); margin: 0 auto;">
        <span style="color: var(--text-muted); font-weight: var(--fw-medium);">[ Team Photo ]</span>
      </div>
    `:`
    <div class="team-slideshow" id="team-slideshow" role="region" aria-label="Dragon Swim team photos">
      ${h.map((e,s)=>`<img class="team-slide${s===0?" active":""}" src="${e}" alt="Dragon Swim team photo ${s+1}" />`).join("")}
    </div>
  `}function l(e,s,t){return`
    <div class="card season-card" style="--season-accent: ${t}">
      <div class="season-emoji">${s}</div>
      <h3 class="season-name">${a("season_"+e)}</h3>
      <p class="season-dates">${a("season_"+e+"_dates")}</p>
      <p class="season-desc">${a("season_"+e+"_desc")}</p>
    </div>
  `}function c(e,s,t){return`
    <div class="card team-card text-center">
      <div class="team-img-placeholder" style="width: 120px; height: 120px; border-radius: 50%; background: var(--border-color); margin: 0 auto var(--space-md); overflow: hidden; border: 3px solid var(--color-primary);">
        <img src="/placeholder-coach.jpg" alt="${e}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0;" onload="this.style.opacity=1" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Cpath fill=%22%23ccc%22 d=%22M50 50c11 0 20-9 20-20s-9-20-20-20-20 9-20 20 9 20 20 20zm0 10c-13.3 0-40 6.7-40 20v10h80V80c0-13.3-26.7-20-40-20z%22/%3E%3C/svg%3E'" />
      </div>
      <h3 class="team-name" style="font-family: var(--font-display); font-size: var(--fs-lg); margin-bottom: var(--space-xs);">${e}</h3>
      <p class="team-role" style="font-size: var(--fs-sm); font-weight: var(--fw-semibold); color: var(--color-accent); margin-bottom: var(--space-sm);">${s}</p>
      <p class="team-desc" style="font-size: var(--fs-sm); color: var(--text-secondary);">${t}</p>
    </div>
  `}
