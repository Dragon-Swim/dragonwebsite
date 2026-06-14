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
        <h1 class="hero-title">Train, Compete &amp; Grow with <span class="text-gradient">Dragon Swim</span></h1>
        <p class="hero-subtitle">${t('hero_subtitle')}</p>
        <div class="hero-actions">
          <a href="${import.meta.env.BASE_URL}registration.html" class="btn btn-gradient btn-lg">
            ${t('hero_cta')} <span class="btn-arrow">→</span>
          </a>
          <a href="${import.meta.env.BASE_URL}signin.html" class="btn btn-outline btn-lg">Sign In</a>
        </div>
      </div>
      <div class="hero-right">
        <div class="hero-float-grid">
          <!-- Floating feature cards -->
          <div class="hero-float-card hfc-1">
            <div class="hfc-icon">🏊‍♂️</div>
            <div class="hfc-label">Swim Plans</div>
          </div>
          <div class="hero-float-card hfc-2">
            <div class="hfc-icon">🏆</div>
            <div class="hfc-label">Swim Meets</div>
          </div>
          <div class="hero-float-card hfc-3">
            <div class="hfc-icon">📅</div>
            <div class="hfc-label">Schedules</div>
          </div>
          <div class="hero-float-card hfc-4">
            <div class="hfc-icon">💬</div>
            <div class="hfc-label">Coach Chat</div>
          </div>
          <!-- Central dragon -->
          <div class="hero-central-icon">
            <div class="hero-central-ring"></div>
            <img src="${import.meta.env.BASE_URL}placeholder-hero.jpg" alt="Dragon" style="width: 110px; height: 110px; border-radius: 50%; object-fit: cover; background: var(--border-color); border: 4px solid var(--bg-card); box-shadow: var(--shadow-lg); position: relative; z-index: 10;" />
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

  <!-- Meet the Team Section -->
  <section class="section team-intro-section">
    <div class="container">
      <div class="text-center animate-on-scroll" style="margin-bottom: var(--space-2xl);">
        <span class="badge badge-primary">Our Journey</span>
        <h2 class="section-title" style="margin-top: var(--space-md);">Meet The Team</h2>
        <div class="divider" style="margin: var(--space-md) auto;"></div>
        <p class="section-subtitle" style="margin: 0 auto;">Dedicated professionals committed to helping you reach your full potential in the water.</p>
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
        <span class="badge badge-primary">Leadership</span>
        <h2 class="section-title" style="margin-top: var(--space-md);">Meet Our Coaches</h2>
        <div class="divider" style="margin: var(--space-md) auto;"></div>
      </div>
      <div class="team-grid animate-on-scroll" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-lg);">
        ${teamCard('Coach Kevin', 'Head Coach', 'As an ASCA Level 5 Coach and ASCA Life Member, Coach Kevin brings elite, nationally recognized expertise to the pool deck. Consistently ranked among the country\'s best, Coach Kevin was named to the ASCA Top 50 Age Group Coaches list in 2019 and the Top 25 Age Group Coaches for Small Teams in 2025. Under his leadership, the team achieved ASCA Top 100 Age Group Team honors in both 2020 and 2021. Most recently, Coach Kevin\'s dedication to athlete development was recognized on a national scale as a finalist for the 2024 ASCA Top 4 Impact Coach award.')}
        ${teamCard('Coach Lisa', 'Coach', 'Coach Lisa understands that in competitive swimming, details dictate success. Dedicated to building an unbreakable foundation for every athlete, Coach Lisa is an expert in stroke technique and fundamentals. By utilizing precise stroke breakdown and biomechanical analysis, they optimize each swimmer\'s entry angle, catch, and pulling efficiency. Beyond meticulous underwater technique, Coach Lisa places a heavy emphasis on core strength, seamlessly bridging the gap between dryland conditioning and holding a flawless underwater streamline. Whether working with developing swimmers or elite athletes aiming for national cuts, Coach Lisa helps them find their breakthrough through zero-flaw fundamentals, allowing them to move through the water with maximum efficiency and injury prevention.')}
        ${teamCard('Coach Sue', 'Coach', 'Coach Sue is a master of aquatic conditioning and race strategy, focused on unlocking an athlete\'s full physiological potential through scientific and dynamic comprehensive training. Coach Sue eliminates the monotony of one-dimensional practices by designing highly engaging, multi-stroke swim sets that seamlessly transition between butterfly, backstroke, breaststroke, and freestyle. This high-intensity, comprehensive approach not only significantly boosts a swimmer\'s Individual Medley (IM) prowess but also precisely targets different energy systems—from the aerobic base to anaerobic lactate threshold sprinting. In Coach Sue\'s practices, every meticulously crafted set is designed to build stroke control under extreme fatigue, finely tune pacing awareness, and forge mental toughness for race day.')}
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
    </div>
  </section>

  <!-- CTA Section -->
  <section class="cta-section">
    <div class="container text-center animate-on-scroll">
      <h2 class="cta-title">Ready to Dive In?</h2>
      <p class="cta-subtitle">Join Dragon Swim Team today and start your competitive journey.</p>
      <div class="cta-actions">
        <a href="${import.meta.env.BASE_URL}registration.html" class="btn btn-primary btn-lg">${t('hero_cta')} →</a>
        <a href="${import.meta.env.BASE_URL}contact.html" class="btn btn-outline btn-lg" style="border-color: #555; color: #ccc;">Talk to a Coach</a>
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
