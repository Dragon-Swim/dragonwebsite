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

/**
 * Renders a label's text, appending a small red asterisk when the field is
 * required. The asterisk is decorative (aria-hidden) — the `required` attribute
 * on the control itself is what assistive technology announces.
 */
function reqLabel(text, isRequired = true) {
  return isRequired
    ? `${text}<span class="req-star" aria-hidden="true">*</span>`
    : text;
}

/**
 * Normalizes a name for comparison: case, surrounding/duplicate whitespace and
 * punctuation people sprinkle into names ("John A. Smith" vs "john a smith").
 */
function normalizeName(value) {
  return (value || '')
    .toLowerCase()
    .replace(/[.,'’`\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Joins a first/last pair into one comparable name. */
function fullName(first, last) {
  return normalizeName(`${first || ''} ${last || ''}`);
}

/**
 * Digits only, with a leading US country code dropped, so the same number
 * written as "555-111-2222", "5551112222" or "+1 (555) 111 2222" compares equal.
 */
function normalizePhone(value) {
  let digits = (value || '').replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1);
  return digits;
}

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
        <label class="form-label" for="${prefix}-first">${reqLabel(t('reg_first'))}</label>
        <input class="form-input" type="text" id="${prefix}-first" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="${prefix}-last">${reqLabel(t('reg_last'))}</label>
        <input class="form-input" type="text" id="${prefix}-last" required />
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label" for="${prefix}-middle">${reqLabel(middleOptional ? t('reg_middle_optional') : t('reg_middle'), !middleOptional)}</label>
        <input class="form-input" type="text" id="${prefix}-middle" ${middleOptional ? '' : 'required'} />
      </div>
      ${showGender ? `
        <div class="form-group">
          <label class="form-label" for="${prefix}-gender">${reqLabel(t('reg_gender'))}</label>
          <select class="form-select" id="${prefix}-gender" required>
            ${genderOptions()}
          </select>
        </div>
      ` : ''}
    </div>
  `;
}

function parentSection(email) {
  return `
    <div class="form-section">
      <h2 class="subsection-title">${t('reg_parent_title')}</h2>
      ${personFields('parent')}
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="parent-phone">${reqLabel(t('reg_phone'))}</label>
          <input class="form-input" type="tel" id="parent-phone" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="parent-email">${reqLabel(t('reg_email'))}</label>
          <input class="form-input" type="email" id="parent-email" value="${email || ''}" readonly required
            title="Email is linked to your sign-in account and cannot be changed here." />
          <p class="reg-email-note" style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Email is tied to your sign-in account. Contact admin@dragonswim.com if you need to change it.</p>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="parent-address">${reqLabel(t('reg_address'))}</label>
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
          <label class="form-label" for="swimmer-${index}-first">${reqLabel(t('reg_swimmer_first'))}</label>
          <input class="form-input" type="text" id="swimmer-${index}-first" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="swimmer-${index}-last">${reqLabel(t('reg_swimmer_last'))}</label>
          <input class="form-input" type="text" id="swimmer-${index}-last" required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="swimmer-${index}-middle">${t('reg_swimmer_middle')}</label>
          <input class="form-input" type="text" id="swimmer-${index}-middle" />
        </div>
        <div class="form-group">
          <label class="form-label" for="swimmer-${index}-gender">${reqLabel(t('reg_swimmer_gender'))}</label>
          <select class="form-select" id="swimmer-${index}-gender" required>
            ${genderOptions()}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="swimmer-${index}-dob">${reqLabel(t('reg_swimmer_dob'))}</label>
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
          <label class="form-label" for="emergency-name">${reqLabel(t('reg_emergency_name'))}</label>
          <input class="form-input" type="text" id="emergency-name" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="emergency-phone">${reqLabel(t('reg_emergency_phone'))}</label>
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

        <form class="reg-form-wrapper" id="reg-form">
          ${parentSection(currentUser?.email || '')}
          ${swimmersSection()}
          ${emergencySection()}

          <div class="form-section">
            <div class="form-group">
              <label class="form-label" for="reg-notes">${t('reg_notes')}</label>
              <textarea class="form-textarea" id="reg-notes" rows="3" placeholder="Any medical conditions, allergies, or other info we should know..."></textarea>
            </div>
          </div>

          <div class="reg-form-error" id="reg-form-error" role="alert"></div>

          <button type="submit" class="btn btn-primary btn-lg reg-submit" id="reg-submit">${t('reg_submit')}</button>

          <div class="reg-success" id="reg-success" style="display: none;">
            <div class="success-icon">✅</div>
            <p>${t('reg_success')}</p>
          </div>
        </form>

      </div>
    </section>
  `;

  bindEvents();
}

// ── Events ───────────────────────────────────────────────────────

function bindEvents() {
  // Spouse toggle. Hidden controls are disabled as well: a control that is only
  // display:none is still constraint-validated by the browser, which would
  // block submission on fields the user cannot see or fill in.
  const spouseToggle = document.getElementById('has-spouse');
  const spouseSection = document.getElementById('spouse-section');

  function applySpouseVisibility() {
    const show = spouseToggle.checked;
    spouseSection.style.display = show ? 'block' : 'none';
    spouseSection.querySelectorAll('input, select, textarea').forEach((el) => {
      el.disabled = !show;
    });
  }
  spouseToggle.addEventListener('change', applySpouseVisibility);
  applySpouseVisibility();

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

  // ── Validation ───────────────────────────────────────────────────
  const form = document.getElementById('reg-form');
  const errorBox = document.getElementById('reg-form-error');

  // Disabled controls are skipped by constraint validation, which is why the
  // hidden spouse block is disabled while collapsed (see applySpouseVisibility).
  // `invalid` does not bubble — listen in the capture phase.
  form.addEventListener('invalid', (e) => {
    e.target.classList.add('is-invalid');
  }, true);

  // ── Cross-field rules ────────────────────────────────────────────
  // Expressed through setCustomValidity so they ride the same native validation
  // path as the required attributes: browser bubble, red border, summary line.
  /**
   * - a spouse must not share the account holder's name or email
   * - the emergency contact must not be the account holder (name or phone)
   * Rules only apply to fields that are filled in; the spouse block is skipped
   * entirely while it is collapsed.
   */
  function applyCrossFieldRules() {
    const value = (id) => document.getElementById(id).value.trim();
    const setError = (id, message) => {
      document.getElementById(id).setCustomValidity(message || '');
    };

    const holderName = fullName(value('parent-first'), value('parent-last'));
    const holderEmail = value('parent-email').toLowerCase();
    const holderPhone = normalizePhone(value('parent-phone'));

    // Spouse — optional block, only checked while enabled.
    const spouseEnabled = document.getElementById('has-spouse').checked;
    const spouseName = fullName(value('spouse-first'), value('spouse-last'));
    setError('spouse-last',
      spouseEnabled && holderName && spouseName && spouseName === holderName
        ? t('reg_err_spouse_name_same')
        : '');

    const spouseEmail = value('spouse-email').toLowerCase();
    setError('spouse-email',
      spouseEnabled && holderEmail && spouseEmail && spouseEmail === holderEmail
        ? t('reg_err_spouse_email_same')
        : '');

    // Emergency contact — always required, so always compared.
    const emergencyName = normalizeName(value('emergency-name'));
    setError('emergency-name',
      holderName && emergencyName && emergencyName === holderName
        ? t('reg_err_emergency_name_same')
        : '');

    const emergencyPhone = normalizePhone(value('emergency-phone'));
    setError('emergency-phone',
      holderPhone && emergencyPhone && emergencyPhone === holderPhone
        ? t('reg_err_emergency_phone_same')
        : '');
  }

  /**
   * Runs native validation (which fires `invalid` and therefore marks fields)
   * and reports which kind of problem is left, if any.
   */
  function validationFailure() {
    form.checkValidity();
    const controls = [...form.elements].filter((el) => el.validity && el.willValidate);
    if (controls.some((el) => el.validity.valueMissing)) return 'missing';
    if (controls.some((el) => !el.validity.valid)) return 'conflict';
    return null;
  }

  // Keep the rules current on every edit, so an implicit submit (pressing Enter
  // in a text field, which never clicks the button) is validated too.
  const revalidate = (e) => {
    e.target.classList?.remove('is-invalid');
    applyCrossFieldRules();
  };
  form.addEventListener('input', revalidate);
  form.addEventListener('change', revalidate);

  // Clicking submit fires this *before* native validation runs, so it is where
  // we can explain why nothing happened.
  document.getElementById('reg-submit').addEventListener('click', () => {
    applyCrossFieldRules();
    const failure = validationFailure();
    errorBox.textContent =
      failure === 'missing' ? t('reg_required_error') :
      failure === 'conflict' ? t('reg_conflict_error') : '';
    errorBox.classList.toggle('is-visible', failure !== null);
  });

  // Submit — the browser only fires this once every rendered required field has
  // a value, so nothing below runs on an incomplete form.
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.textContent = '';
    errorBox.classList.remove('is-visible');

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

    // Build parentEmails for spouse access lookup. Deduped to mirror the admin
    // panel: a shared address must never appear twice in the array.
    const parentEmails = [parent.email.toLowerCase().trim()];
    if (spouse && spouse.email) {
      const spouseEmail = spouse.email.toLowerCase().trim();
      if (!parentEmails.includes(spouseEmail)) parentEmails.push(spouseEmail);
    }

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

      // User is already whitelisted — go straight to dashboard
      window.location.href = import.meta.env.BASE_URL + 'dashboard.html';
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
