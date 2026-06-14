import '../styles/reset.css';
import '../styles/variables.css';
import '../styles/global.css';
import '../styles/navbar.css';
import '../styles/footer.css';

import { initTheme } from '../components/theme-toggle.js';
import { renderNavbar } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';

initTheme();
renderNavbar();

const app = document.getElementById('app');
app.innerHTML = `
  <section class="section" style="min-height: calc(100vh - var(--nav-height)); align-content: center;">
    <div class="container" style="max-width: 800px;">
      <h1 class="section-title">Privacy Policy</h1>
      <div class="divider" style="margin: var(--space-md) 0;"></div>
      <div style="background: var(--bg-card); padding: var(--space-2xl); border-radius: var(--radius-lg); border: 1px solid var(--border-color); color: var(--text-secondary); line-height: 1.8;">
        <h2 style="font-size: 1.25rem; font-weight: 600; color: var(--text-primary); margin: 1.5rem 0 0.75rem;">1. Information We Collect</h2>
        <p>Dragon Swim Team collects personal information that you voluntarily provide when registering, including but not limited to: parent/guardian names, swimmer names and ages, contact details (email address, phone number), emergency contact information, and medical information relevant to swimmer safety. We may also collect information automatically through standard web technologies such as cookies and analytics tools when you use our website.</p>

        <h2 style="font-size: 1.25rem; font-weight: 600; color: var(--text-primary); margin: 1.5rem 0 0.75rem;">2. How We Use Your Information</h2>
        <p>We use the information we collect to: (a) manage team registration and roster placement; (b) communicate meet schedules, practice updates, and team announcements; (c) ensure swimmer safety through emergency contact and medical awareness; (d) comply with USA Swimming and SafeSport requirements; and (e) improve our website and member experience. We do not sell, rent, or trade your personal information to third parties for marketing purposes.</p>

        <h2 style="font-size: 1.25rem; font-weight: 600; color: var(--text-primary); margin: 1.5rem 0 0.75rem;">3. Data Protection</h2>
        <p>We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, or disclosure. Our platform uses Firebase Authentication and Firestore, which provide secure, encrypted data storage and transmission. Access to personal data is restricted to authorized team administrators and coaches on a need-to-know basis.</p>

        <h2 style="font-size: 1.25rem; font-weight: 600; color: var(--text-primary); margin: 1.5rem 0 0.75rem;">4. Third-Party Services</h2>
        <p>Our website uses third-party services including Firebase (Google Cloud Platform) for authentication and data storage, and EmailJS for contact form delivery. These services have their own privacy policies governing how they handle data. We also link to external platforms such as USA Swimming and the U.S. Center for SafeSport for compliance resources. We are not responsible for the privacy practices of these external sites.</p>

        <h2 style="font-size: 1.25rem; font-weight: 600; color: var(--text-primary); margin: 1.5rem 0 0.75rem;">5. Data Retention & Your Rights</h2>
        <p>We retain your personal information for as long as your family is actively registered with the team. Upon request, you may review, update, or request deletion of your personal data by contacting us. Some records may be retained as required for compliance with USA Swimming membership obligations or other legal requirements.</p>

        <h2 style="font-size: 1.25rem; font-weight: 600; color: var(--text-primary); margin: 1.5rem 0 0.75rem;">6. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy or wish to exercise your data rights, please contact us through our <a href="contact.html" style="color: var(--color-primary);">Contact page</a>.</p>

        <p style="margin-top: 2rem; font-size: 0.875rem; color: var(--text-muted);"><em>Last updated: June 2026</em></p>
      </div>
    </div>
  </section>
`;

renderFooter();
