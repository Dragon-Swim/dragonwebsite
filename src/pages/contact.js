/**
 * Contact Page — Dragon Swim Team
 */

import '../styles/reset.css';
import '../styles/variables.css';
import '../styles/global.css';
import '../styles/navbar.css';
import '../styles/footer.css';
import './contact.css';

import { initTheme } from '../components/theme-toggle.js';
import { renderNavbar } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';
import { db, collection, addDoc } from '../utils/firebase.js';
import { t } from '../utils/i18n.js';
import emailjs from '@emailjs/browser';

// Initialize EmailJS (public key is safe to expose — restricted by domain whitelist in EmailJS dashboard)
emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

initTheme();
renderNavbar();

const app = document.getElementById('app');
app.innerHTML = `
  <section class="section" style="min-height: calc(100vh - var(--nav-height)); display: flex; align-items: center;">
    <div class="container" style="max-width: 800px;">
      <div class="text-center" style="margin-bottom: var(--space-2xl);">
        <h1 class="section-title animate-on-scroll">${t('contact_page_title')}</h1>
        <div class="divider" style="margin: var(--space-md) auto;"></div>
        <p class="section-subtitle" style="margin: 0 auto;">${t('contact_page_subtitle')}</p>
      </div>

      <div class="contact-form-wrapper" style="background: var(--bg-card); border-radius: var(--radius-lg); padding: var(--space-2xl); border: 1px solid var(--border-color);">
        <form class="contact-form" id="contact-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="contact-name">${t('contact_name_label')}</label>
              <input class="form-input" type="text" id="contact-name" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="contact-email">${t('contact_email_label')}</label>
              <input class="form-input" type="email" id="contact-email" required />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="contact-phone">${t('contact_phone_label')}</label>
            <input class="form-input" type="tel" id="contact-phone" />
          </div>
          <div class="form-group">
            <label class="form-label" for="contact-reason">${t('contact_reason_label')}</label>
            <select class="form-select" id="contact-reason" required>
              <option value="" disabled selected>${t('contact_reason_placeholder')}</option>
              <option value="tryout">${t('contact_reason_tryout')}</option>
              <option value="meet">${t('contact_reason_meet')}</option>
              <option value="question">${t('contact_reason_question')}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="contact-date">${t('contact_date_label')}</label>
            <input class="form-input" type="date" id="contact-date" />
          </div>
          <div class="form-group">
            <label class="form-label" for="contact-message">${t('contact_details_label')}</label>
            <textarea class="form-textarea" id="contact-message" rows="3" placeholder="${t('contact_details_placeholder')}" required></textarea>
          </div>
          <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;">${t('contact_btn_send')}</button>
        </form>

        <div class="contact-success" id="contact-success" style="display: none;">
          <div class="success-icon" style="font-size: 3rem; text-align: center; margin-bottom: 1rem;">✅</div>
          <p style="text-align: center; font-size: 1.25rem;">${t('contact_success_message')}</p>
        </div>
      </div>
    </div>
  </section>
`;

renderFooter();

// Form submit
document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;

  const formData = {
    name: document.getElementById('contact-name').value.trim(),
    email: document.getElementById('contact-email').value.trim(),
    phone: document.getElementById('contact-phone').value.trim() || null,
    reason: document.getElementById('contact-reason').value,
    preferredDate: document.getElementById('contact-date').value || null,
    message: document.getElementById('contact-message').value.trim(),
  };

  try {
    await addDoc(collection(db, 'contacts'), {
      ...formData,
      createdAt: new Date()
    });

    // Also send notification email via EmailJS (fire-and-forget)
    emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || 'Not provided',
        reason: formData.reason,
        preferred_date: formData.preferredDate || 'Not specified',
        message: formData.message,
      }
    ).catch(err => console.warn('EmailJS delivery failed (data saved in Firestore):', err));

    document.getElementById('contact-form').style.display = 'none';
    document.getElementById('contact-success').style.display = 'block';
  } catch (err) {
    console.error('Failed to submit contact form:', err);
    alert(t('contact_alert_failed'));
    btn.disabled = false;
  }
});

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
