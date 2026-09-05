/**
 * Home Page — Dragon Swim Team
 * Inspired by clean, modern SaaS landing pages
 */

import '../styles/reset.css';
import '../styles/variables.css';
import '../styles/global.css';
import '../styles/navbar.css';
import '../styles/footer.css';
import './home.css';

import { initTheme } from '../components/theme-toggle.js';
import { renderNavbar } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';
import { t } from '../utils/i18n.js';

// Meet The Team 轮播照片:把照片放进 src/assets/team-photos/ 即可自动收录。
// 顺序按文件名排序(推荐 01-xxx.jpg、02-xxx.jpg …)。
const teamPhotoModules = import.meta.glob('../assets/team-photos/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', { eager: true, import: 'default' });
const teamPhotos = Object.keys(teamPhotoModules).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).map((key) => teamPhotoModules[key]);
const TEAM_SLIDE_MS = 3500; // 每张照片停留 3.5 秒(想改快/改慢改这里)

initTheme();
renderNavbar();

const app = document.getElementById('app');
app.innerHTML = `
  <!-- Hero Section -->
  <section class="hero">
    <div class="hero-grid-bg"></div>
    <div class="container hero-container">
      <div class="hero-left animate-on-scroll">
        <div class="hero-badge badge badge-primary">🏊 Year-Round Competitive Swimming</div>
        <h1 class="hero-title">${t('hero_title')} <span class="text-gradient">Dragon Swim</span></h1>
        <p class="hero-subtitle">${t('hero_subtitle')}</p>
      </div>
      <div class="hero-right">
        <div class="hero-float-grid">
          <!-- Floating feature cards -->
          <div class="hero-float-card hfc-1">
            <div class="hfc-icon">📰</div>
            <div class="hfc-label">News</div>
          </div>
          <a href="${import.meta.env.BASE_URL}signin.html" class="hero-float-card hfc-2">
            <div class="hfc-icon">🏆</div>
            <div class="hfc-label">Swim Meets</div>
          </a>
          <a href="${import.meta.env.BASE_URL}signin.html" class="hero-float-card hfc-3">
            <div class="hfc-icon">📅</div>
            <div class="hfc-label">Schedules</div>
          </a>
          <!-- Central dragon -->
          <div class="hero-central-icon">
            <div class="hero-central-ring"></div>
            <img src="${import.meta.env.BASE_URL}logo-light.jpg" alt="Dragon" style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover; background: var(--border-color); border: 4px solid var(--bg-card); box-shadow: var(--shadow-lg); position: relative; z-index: 10;" />
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

  <!-- Why Dragon Swim Section -->
  <section class="section features-section" style="background: var(--bg-secondary);">
    <div class="container">
      <div class="text-center features-header animate-on-scroll" style="margin: 0 auto var(--space-2xl);">
        <span class="badge badge-primary features-label">${t('why_title')}</span>
        <h2 class="section-title" style="margin-top: var(--space-md);">${t('why_title')}</h2>
        <div class="divider" style="margin: var(--space-md) auto;"></div>
      </div>
      <div class="features-grid animate-on-scroll">
        <div class="card feature-card text-center">
          <div class="feature-icon">🏅</div>
          <h3 class="feature-title">${t('why_coaching')}</h3>
          <p class="feature-desc">${t('why_coaching_desc')}</p>
        </div>
        <div class="card feature-card text-center">
          <div class="feature-icon">🤝</div>
          <h3 class="feature-title">${t('why_community')}</h3>
          <p class="feature-desc">${t('why_community_desc')}</p>
        </div>
        <div class="card feature-card text-center">
          <div class="feature-icon">📅</div>
          <h3 class="feature-title">${t('why_flexibility')}</h3>
          <p class="feature-desc">${t('why_flexibility_desc')}</p>
        </div>
        <div class="card feature-card text-center">
          <div class="feature-icon">🌟</div>
          <h3 class="feature-title">${t('why_growth')}</h3>
          <p class="feature-desc">${t('why_growth_desc')}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Seasons Overview -->
  <section class="section seasons-section">
    <div class="container">
      <div class="text-center animate-on-scroll" style="margin-bottom: var(--space-2xl);">
        <span class="badge badge-primary">Seasons</span>
        <h2 class="section-title" style="margin-top: var(--space-md);">${t('seasons_title')}</h2>
        <div class="divider" style="margin: var(--space-md) auto;"></div>
        <p class="section-subtitle" style="margin: 0 auto;">${t('seasons_subtitle')}</p>
      </div>
      <div class="seasons-grid">
        ${seasonCard('spring', '🌸', '#22C55E')}
        ${seasonCard('summer', '☀️', '#F59E0B')}
        ${seasonCard('fall', '🍂', '#E84D25')}
        ${seasonCard('winter', '❄️', '#3B82F6')}
      </div>

      <div class="season-schedule animate-on-scroll">
        <h3 class="season-schedule-title">2026–2027 Season Schedule &amp; Locations</h3>
        <p class="season-schedule-dates"><strong>Season dates:</strong> Fall: Sep 8 – Nov 9 &nbsp;·&nbsp; Winter: Nov 10 – Feb 17 &nbsp;·&nbsp; Spring: Feb 18 – Jun 11 &nbsp;·&nbsp; Summer: Jun 12 – Labor Day</p>
        <div class="season-location-grid">
          <div class="season-location-card">
            <h4 class="season-location-name">Claude Moore Recreation Center</h4>
            <p class="season-location-line"><strong>Fall &amp; Spring:</strong> Mon &amp; Wed 6:30–8:30 pm (Advanced — group determined by the Head Coach), 7:30–9 pm (All levels); Sat &amp; Sun 12–2 pm</p>
            <p class="season-location-line"><strong>Winter:</strong> Mon &amp; Wed 6–7:30 pm (Advanced), 7:30–9 pm (All levels); Fri 7:30–9 pm (All levels); Sat &amp; Sun 12–2 pm</p>
            <p class="season-location-line"><strong>Summer:</strong> Wed &amp; Fri 6:30–8:30 pm; Sun 12–2 pm &amp; 2–4 pm</p>
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
        <span class="badge badge-primary">${t('home_leadership_badge')}</span>
        <h2 class="section-title" style="margin-top: var(--space-md);">${t('home_coaches_title')}</h2>
        <div class="divider" style="margin: var(--space-md) auto;"></div>
      </div>
      <div class="team-grid animate-on-scroll" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-lg);">
        ${teamCard('Coach Kevin', 'Head Coach', 'Coach Kevin is an ASCA Level 5 Coach\u2014the highest level of ASCA coaching certification\u2014and an ASCA Life Member, maintaining Level 5 status for three consecutive years (2024\u20132026). He has been recognized among the nation\'s top age group coaches, including the ASCA Top 50 in 2019, Top 25 Small Team Coaches in 2025, and Top 5 Small Team Coaches in 2026.\n\nCoach Kevin was a finalist for the 2024 ASCA Top 4 Impact Coach Award and is one of five finalists for the 2026 ASCA Age Group Coach of the Year Award in the Small Team Division. His focus is simple: helping every swimmer reach their potential through strong fundamentals, individualized coaching, and a positive training environment.')}
        ${teamCard('Coach Lisa', 'Coach & Manager', 'Coach Lisa is an expert in stroke technique and fundamentals. By utilizing precise stroke breakdown and biomechanical analysis, she optimizes each swimmer\'s entry angle, catch, and pulling efficiency. As a team manager, Coach Lisa also truly cares about swimmers\' mental health. She is skilled at noticing emotional changes and helping swimmers overcome issues arising from swimming and life, enabling them to achieve their best in a healthy, happy state of mind.')}
        ${teamCard('Coach Sue', 'Coach', 'Coach Sue has been with Dragon Swim Team for more than 15 years and has more than 20 years of coaching experience. She is a master of aquatic conditioning and race strategy, focused on unlocking an athlete\'s full physiological potential through scientific, dynamic, and comprehensive training. Coach Sue eliminates the monotony of one-dimensional practices by designing highly engaging, multi-stroke swim sets that seamlessly transition between butterfly, backstroke, breaststroke, and freestyle. This high-intensity, comprehensive approach not only significantly boosts a swimmer\'s Individual Medley (IM) prowess but also precisely targets different energy systems—from the aerobic base to anaerobic lactate threshold sprinting.')}
      </div>
    </div>
  </section>

  <!-- Mission & Vision Section -->
  <section class="section mission-section">
    <div class="container" style="max-width: 800px; text-align: center;">
      <div class="animate-on-scroll">
        <span class="badge badge-primary">${t('home_mission_badge')}</span>
        <h2 class="section-title" style="margin-top: var(--space-md);">${t('home_mission_title')}</h2>
        <div class="divider" style="margin: var(--space-md) auto;"></div>
        <p class="mission-statement">${t('home_mission_text')}</p>
      </div>
    </div>
  </section>

  <!-- SafeSport Compliance Section -->
  <section class="section safesport-section" id="safesport" style="background: var(--bg-secondary);">
    <div class="container" style="max-width: 800px;">
      <div class="text-center animate-on-scroll" style="margin-bottom: var(--space-2xl);">
        <span class="badge badge-primary">${t('safesport_badge')}</span>
        <h2 class="section-title" style="margin-top: var(--space-md);">${t('safesport_title')}</h2>
        <div class="divider" style="margin: var(--space-md) auto;"></div>
        <p style="color: var(--text-secondary); line-height: 1.8; margin: 0 auto; max-width: 650px;">${t('safesport_intro')}</p>
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
        <span class="badge badge-primary">${t('home_journey_badge')}</span>
        <h2 class="section-title" style="margin-top: var(--space-md);">${t('home_team_title')}</h2>
        <div class="divider" style="margin: var(--space-md) auto;"></div>
        <p class="section-subtitle" style="margin: 0 auto;">${t('home_team_subtitle')}</p>
      </div>
      
      <div class="team-photo-wrapper animate-on-scroll" style="margin-bottom: var(--space-2xl); text-align: center;">
        ${renderTeamSlideshow()}
      </div>
    </div>
  </section>

`;

renderFooter();

// ── Intersection Observer for Animations ──
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.15
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.animate-on-scroll').forEach(el => {
  observer.observe(el);
});

// ── Meet The Team 照片轮播 ──
// 每张停留 TEAM_SLIDE_MS(默认 3 秒),淡入淡出切换,循环播放;鼠标悬停暂停。
// 系统开启"减少动态效果"(prefers-reduced-motion)时保持第一张,不自动轮播。
const teamSlideshow = document.getElementById('team-slideshow');
if (teamSlideshow) {
  const slides = Array.from(teamSlideshow.querySelectorAll('.team-slide'));
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (slides.length > 1 && !reducedMotion) {
    let slideIndex = 0;
    let slideTimer = null;
    const showSlide = (index) => {
      slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
    };
    const stopSlideshow = () => {
      if (slideTimer) {
        clearInterval(slideTimer);
        slideTimer = null;
      }
    };
    const startSlideshow = () => {
      stopSlideshow();
      slideTimer = setInterval(() => {
        slideIndex = (slideIndex + 1) % slides.length;
        showSlide(slideIndex);
      }, TEAM_SLIDE_MS);
    };
    showSlide(0);
    startSlideshow();
    teamSlideshow.addEventListener('mouseenter', stopSlideshow);
    teamSlideshow.addEventListener('mouseleave', startSlideshow);
  }
}

// ── 渲染轮播(空照片时显示原占位) ──
function renderTeamSlideshow() {
  if (teamPhotos.length === 0) {
    return `
      <div style="width: 100%; max-width: 900px; height: 400px; background: var(--bg-secondary); border-radius: var(--radius-lg); display: inline-flex; align-items: center; justify-content: center; border: 2px dashed var(--border-color); margin: 0 auto;">
        <span style="color: var(--text-muted); font-weight: var(--fw-medium);">[ Team Photo ]</span>
      </div>
    `;
  }
  return `
    <div class="team-slideshow" id="team-slideshow" role="region" aria-label="Dragon Swim team photos">
      ${teamPhotos.map((src, i) => `<img class="team-slide${i === 0 ? ' active' : ''}" src="${src}" alt="Dragon Swim team photo ${i + 1}" />`).join('')}
    </div>
  `;
}

// ── Helpers ──
function seasonCard(season, emoji, accentColor) {
  return `
    <div class="card season-card" style="--season-accent: ${accentColor}">
      <div class="season-emoji">${emoji}</div>
      <h3 class="season-name">${t('season_' + season)}</h3>
      <p class="season-dates">${t('season_' + season + '_dates')}</p>
      <p class="season-desc">${t('season_' + season + '_desc')}</p>
    </div>
  `;
}


function teamCard(name, role, desc) {
  return `
    <div class="card team-card text-center">
      <div class="team-img-placeholder" style="width: 120px; height: 120px; border-radius: 50%; background: var(--border-color); margin: 0 auto var(--space-md); overflow: hidden; border: 3px solid var(--color-primary);">
        <img src="${import.meta.env.BASE_URL}placeholder-coach.jpg" alt="${name}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0;" onload="this.style.opacity=1" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Cpath fill=%22%23ccc%22 d=%22M50 50c11 0 20-9 20-20s-9-20-20-20-20 9-20 20 9 20 20 20zm0 10c-13.3 0-40 6.7-40 20v10h80V80c0-13.3-26.7-20-40-20z%22/%3E%3C/svg%3E'" />
      </div>
      <h3 class="team-name" style="font-family: var(--font-display); font-size: var(--fs-lg); margin-bottom: var(--space-xs);">${name}</h3>
      <p class="team-role" style="font-size: var(--fs-sm); font-weight: var(--fw-semibold); color: var(--color-accent); margin-bottom: var(--space-sm);">${role}</p>
      <p class="team-desc" style="font-size: var(--fs-sm); color: var(--text-secondary);">${desc}</p>
    </div>
  `;
}
