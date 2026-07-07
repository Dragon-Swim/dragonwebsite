/**
 * Navbar Component — Dragon Swim Team
 * Responsive navigation with mobile hamburger menu.
 */

import { t } from '../utils/i18n.js';
import { toggleTheme, updateToggleIcon } from './theme-toggle.js';

/**
 * Render the navbar into the page.
 */
export function renderNavbar() {
  const nav = document.createElement('nav');
  nav.className = 'navbar';
  nav.id = 'navbar';
  nav.innerHTML = `
    <div class="nav-container container">
      <a href="${import.meta.env.BASE_URL}" class="nav-logo">
        <img src="${import.meta.env.BASE_URL}logo-light.jpg" alt="Dragon Swim Team" class="nav-logo-img light-logo" />
        <img src="${import.meta.env.BASE_URL}logo-dark.png" alt="Dragon Swim Team" class="nav-logo-img dark-logo" />
      </a>

      <div class="nav-links" id="nav-links">
        <a href="${import.meta.env.BASE_URL}safesport.html" class="nav-link ${isActive(import.meta.env.BASE_URL + 'safesport.html')}">${t('nav_safesport')}</a>
        <a href="${import.meta.env.BASE_URL}" class="nav-link ${isActive(import.meta.env.BASE_URL)}">${t('nav_home')}</a>
        <a href="${import.meta.env.BASE_URL}dashboard.html" class="nav-link ${isActive(import.meta.env.BASE_URL + 'dashboard.html')}">Dashboard</a>
        <a href="${import.meta.env.BASE_URL}signin.html?mode=signup" class="nav-link ${isActive(import.meta.env.BASE_URL + 'registration.html') || isActive(import.meta.env.BASE_URL + 'signin.html')}">${t('nav_registration')}</a>

        <a href="${import.meta.env.BASE_URL}signin.html" class="nav-link nav-link-signin ${isActive(import.meta.env.BASE_URL + 'signin.html')}">${t('nav_signin')}</a>
      </div>

      <div class="nav-actions">
        <button class="nav-theme-toggle" id="theme-toggle" aria-label="Toggle theme"></button>
        <button class="nav-hamburger" id="nav-hamburger" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  `;

  document.body.prepend(nav);

  // Theme toggle
  updateToggleIcon();
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

  // Mobile menu
  const hamburger = document.getElementById('nav-hamburger');
  const links = document.getElementById('nav-links');
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    links.classList.toggle('open');
  });

  // Close mobile menu on link click
  links.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      links.classList.remove('open');
    });
  });

  // Scroll effect on navbar
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 10);
  });
}

function isActive(path) {
  const current = window.location.pathname;
  if (path === import.meta.env.BASE_URL && (current === import.meta.env.BASE_URL || current === import.meta.env.BASE_URL + 'index.html')) return 'active';
  if (path !== import.meta.env.BASE_URL && current === path) return 'active';
  return '';
}
