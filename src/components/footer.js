/**
 * Footer Component — Dragon Swim Team
 */

import { t } from '../utils/i18n.js';

/**
 * Render the footer into the page.
 */
export function renderFooter() {
  const footer = document.createElement('footer');
  footer.className = 'footer';
  footer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="footer-logo">
            <span class="nav-logo-icon">🐉</span>
            <span class="nav-logo-text">Dragon<span class="text-gradient">Swim</span></span>
          </div>
          <p class="footer-tagline">${t('footer_tagline')}</p>
        </div>
        <div class="footer-links">
          <h4 class="footer-heading">Legal & Compliance</h4>
          <ul class="footer-list">
            <li><a href="${import.meta.env.BASE_URL}privacy.html">Privacy Policy</a></li>
            <li><a href="${import.meta.env.BASE_URL}terms.html">Terms & Conditions</a></li>
            <li><a href="${import.meta.env.BASE_URL}#safesport">USA SafeSport Compliance</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>${t('footer_rights')}</p>
      </div>
    </div>
  `;

  document.body.appendChild(footer);
}
