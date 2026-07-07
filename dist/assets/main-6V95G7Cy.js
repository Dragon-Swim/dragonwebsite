import{i as r,t as e}from"./i18n-CRIkWtj0.js";import{a as n,r as c}from"./footer-CudQORaQ.js";r();n();const l=document.getElementById("app");l.innerHTML=`
  <!-- Hero Section -->
  <section class="hero">
    <div class="hero-grid-bg"></div>
    <div class="container hero-container">
      <div class="hero-left animate-on-scroll">
        <div class="hero-badge badge badge-primary">🏊 Year-Round Competitive Swimming</div>
        <h1 class="hero-title">${e("hero_title")} <span class="text-gradient">Dragon Swim</span></h1>
        <p class="hero-subtitle">${e("hero_subtitle")}</p>
      </div>
      <div class="hero-right">
        <div class="hero-float-grid">
          <!-- Floating feature cards -->
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

  <!-- Mission & Vision Section -->
  <section class="section mission-section" style="background: var(--bg-secondary);">
    <div class="container" style="max-width: 800px; text-align: center;">
      <div class="animate-on-scroll">
        <span class="badge badge-primary">${e("home_mission_badge")}</span>
        <h2 class="section-title" style="margin-top: var(--space-md);">${e("home_mission_title")}</h2>
        <div class="divider" style="margin: var(--space-md) auto;"></div>
        <p class="mission-statement">${e("home_mission_text")}</p>
      </div>
    </div>
  </section>

  <!-- Why Dragon Swim Section -->
  <section class="section features-section">
    <div class="container">
      <div class="text-center features-header animate-on-scroll" style="margin: 0 auto var(--space-2xl);">
        <span class="badge badge-primary features-label">${e("why_title")}</span>
        <h2 class="section-title" style="margin-top: var(--space-md);">${e("why_title")}</h2>
        <div class="divider" style="margin: var(--space-md) auto;"></div>
      </div>
      <div class="features-grid animate-on-scroll">
        <div class="card feature-card text-center">
          <div class="feature-icon">🏅</div>
          <h3 class="feature-title">${e("why_coaching")}</h3>
          <p class="feature-desc">${e("why_coaching_desc")}</p>
        </div>
        <div class="card feature-card text-center">
          <div class="feature-icon">🤝</div>
          <h3 class="feature-title">${e("why_community")}</h3>
          <p class="feature-desc">${e("why_community_desc")}</p>
        </div>
        <div class="card feature-card text-center">
          <div class="feature-icon">📅</div>
          <h3 class="feature-title">${e("why_flexibility")}</h3>
          <p class="feature-desc">${e("why_flexibility_desc")}</p>
        </div>
        <div class="card feature-card text-center">
          <div class="feature-icon">🌟</div>
          <h3 class="feature-title">${e("why_growth")}</h3>
          <p class="feature-desc">${e("why_growth_desc")}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Meet the Team Section -->
  <section class="section team-intro-section">
    <div class="container">
      <div class="text-center animate-on-scroll" style="margin-bottom: var(--space-2xl);">
        <span class="badge badge-primary">${e("home_journey_badge")}</span>
        <h2 class="section-title" style="margin-top: var(--space-md);">${e("home_team_title")}</h2>
        <div class="divider" style="margin: var(--space-md) auto;"></div>
        <p class="section-subtitle" style="margin: 0 auto;">${e("home_team_subtitle")}</p>
      </div>
      
      <div class="team-photo-wrapper animate-on-scroll" style="margin-bottom: var(--space-2xl); text-align: center;">
        <div style="width: 100%; max-width: 900px; height: 400px; background: var(--bg-secondary); border-radius: var(--radius-lg); display: inline-flex; align-items: center; justify-content: center; border: 2px dashed var(--border-color); margin: 0 auto;">
          <span style="color: var(--text-muted); font-weight: var(--fw-medium);">[ Team Photo ]</span>
        </div>
      </div>
    </div>
  </section>

  <!-- Meet the Coaches Section -->
  <section class="section coaches-section" style="background: var(--bg-secondary);">
    <div class="container">
      <div class="text-center animate-on-scroll" style="margin-bottom: var(--space-2xl);">
        <span class="badge badge-primary">${e("home_leadership_badge")}</span>
        <h2 class="section-title" style="margin-top: var(--space-md);">${e("home_coaches_title")}</h2>
        <div class="divider" style="margin: var(--space-md) auto;"></div>
      </div>
      <div class="team-grid animate-on-scroll" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-lg);">
        ${o("Coach Kevin","Head Coach","As an ASCA Level 5 Coach and ASCA Life Member, Coach Kevin brings elite, nationally recognized expertise to the pool deck. Consistently ranked among the country's best, Coach Kevin was named to the ASCA Top 50 Age Group Coaches list in 2019 and the Top 25 Age Group Coaches for Small Teams in 2025. Under his leadership, the team achieved ASCA Top 100 Age Group Team honors in both 2020 and 2021. Most recently, Coach Kevin's dedication to athlete development was recognized on a national scale as a finalist for the 2024 ASCA Top 4 Impact Coach award.")}
        ${o("Coach Lisa","Coach","Coach Lisa understands that in competitive swimming, details dictate success. Dedicated to building an unbreakable foundation for every athlete, Coach Lisa is an expert in stroke technique and fundamentals. By utilizing precise stroke breakdown and biomechanical analysis, they optimize each swimmer's entry angle, catch, and pulling efficiency. Beyond meticulous underwater technique, Coach Lisa places a heavy emphasis on core strength, seamlessly bridging the gap between dryland conditioning and holding a flawless underwater streamline. Whether working with developing swimmers or elite athletes aiming for national cuts, Coach Lisa helps them find their breakthrough through zero-flaw fundamentals, allowing them to move through the water with maximum efficiency and injury prevention.")}
        ${o("Coach Sue","Coach","Coach Sue is a master of aquatic conditioning and race strategy, focused on unlocking an athlete's full physiological potential through scientific and dynamic comprehensive training. Coach Sue eliminates the monotony of one-dimensional practices by designing highly engaging, multi-stroke swim sets that seamlessly transition between butterfly, backstroke, breaststroke, and freestyle. This high-intensity, comprehensive approach not only significantly boosts a swimmer's Individual Medley (IM) prowess but also precisely targets different energy systems—from the aerobic base to anaerobic lactate threshold sprinting. In Coach Sue's practices, every meticulously crafted set is designed to build stroke control under extreme fatigue, finely tune pacing awareness, and forge mental toughness for race day.")}
      </div>
    </div>
  </section>

  <!-- Seasons Overview -->
  <section class="section seasons-section">
    <div class="container">
      <div class="text-center animate-on-scroll" style="margin-bottom: var(--space-2xl);">
        <span class="badge badge-primary">Seasons</span>
        <h2 class="section-title" style="margin-top: var(--space-md);">${e("seasons_title")}</h2>
        <div class="divider" style="margin: var(--space-md) auto;"></div>
        <p class="section-subtitle" style="margin: 0 auto;">${e("seasons_subtitle")}</p>
      </div>
      <div class="seasons-grid">
        ${i("spring","🌸","#22C55E")}
        ${i("summer","☀️","#F59E0B")}
        ${i("fall","🍂","#E84D25")}
        ${i("winter","❄️","#3B82F6")}
      </div>
    </div>
  </section>

  <!-- SafeSport Compliance Section -->
  <section class="section safesport-section" id="safesport" style="background: var(--bg-secondary);">
    <div class="container" style="max-width: 800px;">
      <div class="text-center animate-on-scroll" style="margin-bottom: var(--space-2xl);">
        <span class="badge badge-primary">${e("safesport_badge")}</span>
        <h2 class="section-title" style="margin-top: var(--space-md);">${e("safesport_title")}</h2>
        <div class="divider" style="margin: var(--space-md) auto;"></div>
        <p style="color: var(--text-secondary); line-height: 1.8; margin: 0 auto; max-width: 650px;">${e("safesport_intro")}</p>
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

`;c();const d={root:null,rootMargin:"0px",threshold:.15},p=new IntersectionObserver((s,t)=>{s.forEach(a=>{a.isIntersecting&&(a.target.classList.add("animate-visible"),t.unobserve(a.target))})},d);document.querySelectorAll(".animate-on-scroll").forEach(s=>{p.observe(s)});function i(s,t,a){return`
    <div class="card season-card" style="--season-accent: ${a}">
      <div class="season-emoji">${t}</div>
      <h3 class="season-name">${e("season_"+s)}</h3>
      <p class="season-dates">${e("season_"+s+"_dates")}</p>
      <p class="season-desc">${e("season_"+s+"_desc")}</p>
    </div>
  `}function o(s,t,a){return`
    <div class="card team-card text-center">
      <div class="team-img-placeholder" style="width: 120px; height: 120px; border-radius: 50%; background: var(--border-color); margin: 0 auto var(--space-md); overflow: hidden; border: 3px solid var(--color-primary);">
        <img src="/placeholder-coach.jpg" alt="${s}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0;" onload="this.style.opacity=1" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Cpath fill=%22%23ccc%22 d=%22M50 50c11 0 20-9 20-20s-9-20-20-20-20 9-20 20 9 20 20 20zm0 10c-13.3 0-40 6.7-40 20v10h80V80c0-13.3-26.7-20-40-20z%22/%3E%3C/svg%3E'" />
      </div>
      <h3 class="team-name" style="font-family: var(--font-display); font-size: var(--fs-lg); margin-bottom: var(--space-xs);">${s}</h3>
      <p class="team-role" style="font-size: var(--fs-sm); font-weight: var(--fw-semibold); color: var(--color-accent); margin-bottom: var(--space-sm);">${t}</p>
      <p class="team-desc" style="font-size: var(--fs-sm); color: var(--text-secondary);">${a}</p>
    </div>
  `}
