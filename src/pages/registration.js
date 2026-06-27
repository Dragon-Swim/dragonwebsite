/**
 * Registration Page — Dragon Swim Team
 * Family-based registration: parent(s) + swimmers + emergency contact
 */

import '../styles/reset.css';
import '../styles/variables.css';
import '../styles/global.css';
import '../styles/navbar.css';
import '../styles/footer.css';
import './registration.css';

import { initTheme } from '../components/theme-toggle.js';
import { renderNavbar } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';
import { auth, db, doc, setDoc, getDoc, getDocs, query, where, updateDoc, collection, onAuthStateChanged } from '../utils/firebase.js';
import { t } from '../utils/i18n.js';

initTheme();
renderNavbar();

let swimmerCount = 1;
let currentUser = null;

const app = document.getElementById('app');

// ── Template helpers ─────────────────────────────────────────────

function genderOptions() {
  return `
    <option value="" disabled selected>Select...</option>
    <option value="male">${t('reg_gender_male')}</option>
    <option value="female">${t('reg_gender_female')}</option>
  `;
}

function personFields(prefix, opts = {}) {
  const { showGender = true, middleOptional = true } = opts;
  return `
    <div class="form-row">
      <div class="form-group">
        <label class="form-label" for="${prefix}-first">${t('reg_first')}</label>
        <input class="form-input" type="text" id="${prefix}-first" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="${prefix}-last">${t('reg_last')}</label>
        <input class="form-input" type="text" id="${prefix}-last" required />
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label" for="${prefix}-middle">${middleOptional ? t('reg_middle_optional') : t('reg_middle')}</label>
        <input class="form-input" type="text" id="${prefix}-middle" />
      </div>
      ${showGender ? `
        <div class="form-group">
          <label class="form-label" for="${prefix}-gender">${t('reg_gender')}</label>
          <select class="form-select" id="${prefix}-gender" required>
            ${genderOptions()}
          </select>
        </div>
      ` : ''}
    </div>
  `;
}

function parentSection() {
  return `
    <div class="form-section">
      <h2 class="subsection-title">${t('reg_parent_title')}</h2>
      ${personFields('parent')}
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="parent-phone">${t('reg_phone')}</label>
          <input class="form-input" type="tel" id="parent-phone" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="parent-email">${t('reg_email')}</label>
          <input class="form-input" type="email" id="parent-email" required />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="parent-address">${t('reg_address')}</label>
        <input class="form-input" type="text" id="parent-address" required />
      </div>

      <label class="checkbox-label">
        <input type="checkbox" id="has-spouse" />
        <span>${t('reg_parent_add_spouse')}</span>
      </label>

      <div class="spouse-section" id="spouse-section" style="display: none;">
        <div class="section-divider"></div>
        <h3 class="subsection-subtitle">${t('reg_spouse_title')}</h3>
        ${personFields('spouse')}
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="spouse-phone">${t('reg_phone')}</label>
            <input class="form-input" type="tel" id="spouse-phone" />
          </div>
          <div class="form-group">
            <label class="form-label" for="spouse-email">${t('reg_email')}</label>
            <input class="form-input" type="email" id="spouse-email" />
          </div>
        </div>
      </div>
    </div>
  `;
}

function swimmerCard(index) {
  return `
    <div class="swimmer-card" data-swimmer="${index}">
      <div class="swimmer-card-header">
        <span class="swimmer-label">Swimmer #${index}</span>
        ${index > 1 ? `<button type="button" class="btn-remove-swimmer" data-remove="${index}">${t('reg_swimmer_remove')}</button>` : ''}
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="swimmer-${index}-first">${t('reg_swimmer_first')}</label>
          <input class="form-input" type="text" id="swimmer-${index}-first" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="swimmer-${index}-last">${t('reg_swimmer_last')}</label>
          <input class="form-input" type="text" id="swimmer-${index}-last" required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="swimmer-${index}-middle">${t('reg_swimmer_middle')}</label>
          <input class="form-input" type="text" id="swimmer-${index}-middle" />
        </div>
        <div class="form-group">
          <label class="form-label" for="swimmer-${index}-gender">${t('reg_swimmer_gender')}</label>
          <select class="form-select" id="swimmer-${index}-gender" required>
            ${genderOptions()}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="swimmer-${index}-dob">${t('reg_swimmer_dob')}</label>
          <input class="form-input" type="date" id="swimmer-${index}-dob" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="swimmer-${index}-usaId">${t('reg_swimmer_usa_id')}</label>
          <input class="form-input" type="text" id="swimmer-${index}-usaId" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="swimmer-${index}-joinDate">${t('reg_swimmer_join_date')}</label>
          <input class="form-input" type="date" id="swimmer-${index}-joinDate" />
        </div>
        <div class="form-group"></div>
      </div>
    </div>
  `;
}

function swimmersSection() {
  return `
    <div class="form-section">
      <h2 class="subsection-title">${t('reg_swimmers_title')}</h2>
      <div id="swimmers-container">
        ${Array.from({ length: swimmerCount }, (_, i) => swimmerCard(i + 1)).join('')}
      </div>
      <button type="button" class="btn-add-swimmer" id="btn-add-swimmer">${t('reg_swimmer_add')}</button>
    </div>
  `;
}

function emergencySection() {
  return `
    <div class="form-section">
      <h2 class="subsection-title">${t('reg_emergency_title')}</h2>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="emergency-name">${t('reg_emergency_name')}</label>
          <input class="form-input" type="text" id="emergency-name" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="emergency-phone">${t('reg_emergency_phone')}</label>
          <input class="form-input" type="tel" id="emergency-phone" required />
        </div>
      </div>
    </div>
  `;
}

// ── Render ───────────────────────────────────────────────────────

function render() {
  app.innerHTML = `
    <section class="section">
      <div class="container" style="max-width: 800px;">

        <div class="text-center" style="margin-bottom: var(--space-2xl);">
          <h1 class="section-title">${t('reg_title')}</h1>
          <div class="divider" style="margin: var(--space-md) auto;"></div>
          <p class="section-subtitle" style="margin: 0 auto;">${t('reg_subtitle')}</p>
        </div>

        <div class="reg-form-wrapper" id="reg-form-wrapper">
          ${parentSection()}
          ${swimmersSection()}
          ${emergencySection()}

          <div class="form-section">
            <div class="form-group">
              <label class="form-label" for="reg-notes">${t('reg_notes')}</label>
              <textarea class="form-textarea" id="reg-notes" rows="3" placeholder="Any medical conditions, allergies, or other info we should know..."></textarea>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-lg reg-submit" id="reg-submit">${t('reg_submit')}</button>

          <div class="reg-success" id="reg-success" style="display: none;">
            <div class="success-icon">✅</div>
            <p>${t('reg_success')}</p>
          </div>
        </div>

      </div>
    </section>
  `;

  bindEvents();
}

// ── Events ───────────────────────────────────────────────────────

function bindEvents() {
  // Spouse toggle
  document.getElementById('has-spouse').addEventListener('change', (e) => {
    document.getElementById('spouse-section').style.display = e.target.checked ? 'block' : 'none';
  });

  // Add swimmer
  document.getElementById('btn-add-swimmer').addEventListener('click', () => {
    swimmerCount++;
    const container = document.getElementById('swimmers-container');
    container.insertAdjacentHTML('beforeend', swimmerCard(swimmerCount));
    // Re-bind remove buttons (existing + new)
    bindRemoveButtons();
  });

  // Remove swimmer
  function bindRemoveButtons() {
    document.querySelectorAll('.btn-remove-swimmer').forEach(btn => {
      // avoid duplicate listeners
      btn.replaceWith(btn.cloneNode(true));
      btn = document.querySelector(`[data-remove="${btn.dataset.remove}"]`);
      if (!btn) return;
      btn.addEventListener('click', () => {
        const card = document.querySelector(`.swimmer-card[data-swimmer="${btn.dataset.remove}"]`);
        if (card) card.remove();
        // Re-number remaining cards
        renumberSwimmers();
      });
    });
  }
  bindRemoveButtons();

  // Submit
  document.getElementById('reg-submit').addEventListener('click', async () => {
    const btn = document.getElementById('reg-submit');
    btn.disabled = true;

    // Collect parent data
    const parent = {
      firstName: document.getElementById('parent-first').value.trim(),
      lastName: document.getElementById('parent-last').value.trim(),
      middleName: document.getElementById('parent-middle').value.trim() || null,
      gender: document.getElementById('parent-gender').value,
      phone: document.getElementById('parent-phone').value.trim(),
      email: document.getElementById('parent-email').value.trim(),
      address: document.getElementById('parent-address').value.trim(),
    };

    // Collect spouse data (if checkbox checked)
    let spouse = null;
    if (document.getElementById('has-spouse').checked) {
      spouse = {
        firstName: document.getElementById('spouse-first').value.trim(),
        lastName: document.getElementById('spouse-last').value.trim(),
        middleName: document.getElementById('spouse-middle').value.trim() || null,
        gender: document.getElementById('spouse-gender').value || null,
        phone: document.getElementById('spouse-phone').value.trim() || null,
        email: document.getElementById('spouse-email').value.trim() || null,
      };
    }

    // Collect swimmers
    const swimmers = [];
    const cards = document.querySelectorAll('.swimmer-card');
    cards.forEach(card => {
      const idx = card.dataset.swimmer;
      swimmers.push({
        firstName: document.getElementById(`swimmer-${idx}-first`).value.trim(),
        lastName: document.getElementById(`swimmer-${idx}-last`).value.trim(),
        middleName: document.getElementById(`swimmer-${idx}-middle`).value.trim() || null,
        gender: document.getElementById(`swimmer-${idx}-gender`).value,
        dob: document.getElementById(`swimmer-${idx}-dob`).value,
        usaSwimmingId: document.getElementById(`swimmer-${idx}-usaId`).value.trim() || null,
        joinDate: document.getElementById(`swimmer-${idx}-joinDate`).value || null,
      });
    });

    const emergencyContact = {
      name: document.getElementById('emergency-name').value.trim(),
      phone: document.getElementById('emergency-phone').value.trim(),
    };

    // Build parentEmails for spouse access lookup
    const parentEmails = [parent.email.toLowerCase().trim()];
    if (spouse && spouse.email) parentEmails.push(spouse.email.toLowerCase().trim());

    try {
      await setDoc(doc(db, 'registrations', currentUser.uid), {
        parent,
        spouse,
        swimmers,
        emergencyContact,
        notes: document.getElementById('reg-notes').value.trim() || null,
        parentEmails,
        editors: [currentUser.uid],
        createdAt: new Date()
      });

      document.getElementById('reg-form-wrapper').querySelectorAll('.form-section, #reg-submit').forEach(el => el.style.display = 'none');
      document.getElementById('reg-success').style.display = 'flex';
    } catch (err) {
      console.error('Failed to submit registration:', err);
      alert('Failed to submit registration. Please try again.');
      btn.disabled = false;
    }
  });
}

function renumberSwimmers() {
  const cards = document.querySelectorAll('.swimmer-card');
  cards.forEach((card, i) => {
    const newIdx = i + 1;
    card.dataset.swimmer = newIdx;
    card.querySelector('.swimmer-label').textContent = `Swimmer #${newIdx}`;
    const removeBtn = card.querySelector('.btn-remove-swimmer');
    if (removeBtn) {
      removeBtn.dataset.remove = newIdx;
      removeBtn.style.display = cards.length > 1 ? '' : 'none';
    }
    // Update input ids — re-assign ids for all child inputs
    card.querySelectorAll('input, select').forEach(input => {
      const oldId = input.id;
      input.id = oldId.replace(/swimmer-\d+-/, `swimmer-${newIdx}-`);
    });
  });
  // Show/hide remove on first card
  const firstRemove = document.querySelector('.swimmer-card[data-swimmer="1"] .btn-remove-swimmer');
  if (firstRemove) firstRemove.style.display = cards.length > 1 ? '' : 'none';
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = import.meta.env.BASE_URL + 'signin.html?mode=signup';
    return;
  }
  currentUser = user;

  // If this user already owns a registration, go to dashboard
  const ownSnap = await getDoc(doc(db, 'registrations', user.uid));
  if (ownSnap.exists()) {
    window.location.href = import.meta.env.BASE_URL + 'dashboard.html';
    return;
  }

  // Check if spouse registered this family — user's email in parentEmails
  if (user.email) {
    const q = query(
      collection(db, 'registrations'),
      where('parentEmails', 'array-contains', user.email.toLowerCase().trim())
    );
    const spouseSnap = await getDocs(q);
    if (!spouseSnap.empty) {
      const regDoc = spouseSnap.docs[0];
      const data = regDoc.data();
      const editors = data.editors || [];
      if (!editors.includes(user.uid)) {
        editors.push(user.uid);
        await updateDoc(doc(db, 'registrations', regDoc.id), { editors });
      }
      window.location.href = import.meta.env.BASE_URL + 'dashboard.html';
      return;
    }
  }

  render();
  renderFooter();
});
