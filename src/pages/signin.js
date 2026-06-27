/**
 * Sign In Page — Dragon Swim Team
 * Firebase Auth placeholder — config will be wired when API key is provided.
 */

import '../styles/reset.css';
import '../styles/variables.css';
import '../styles/global.css';
import '../styles/navbar.css';
import '../styles/footer.css';
import './signin.css';

import {
  auth,
  db,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  googleProvider,
  sendPasswordResetEmail,
  signOut,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  collection,
} from '../utils/firebase.js';

import { initTheme } from '../components/theme-toggle.js';
import { renderNavbar } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';
import { t } from '../utils/i18n.js';

initTheme();
renderNavbar();

const urlParams = new URLSearchParams(window.location.search);
let isSignUp = urlParams.get('mode') === 'signup';
let isForgot = false;
let failedAttempts = 0;

const app = document.getElementById('app');

function render() {
  app.innerHTML = `
    <section class="section signin-section">
      <div class="container">
        <div class="signin-wrapper">
          <div class="signin-card">
            ${isForgot ? `
            <!-- Forgot Password Header -->
            <div class="signin-header">
              <div class="signin-logo">
                <img src="${import.meta.env.BASE_URL}logo-light.jpg" alt="Dragon Swim Team" class="nav-logo-img light-logo" style="height:60px" />
                <img src="${import.meta.env.BASE_URL}logo-dark.png" alt="Dragon Swim Team" class="nav-logo-img dark-logo" style="height:60px" />
              </div>
              <h1 class="signin-title">${t('signin_forgot_title')}</h1>
              <p class="signin-subtitle">${t('signin_forgot_subtitle')}</p>
            </div>

            <!-- Forgot Password Form -->
            <form class="signin-form" id="forgot-form">
              <div class="form-group">
                <label class="form-label" for="forgot-email">${t('signin_forgot_email')}</label>
                <input class="form-input" type="email" id="forgot-email" placeholder="you@example.com" required />
              </div>
              <button type="submit" class="btn btn-primary btn-lg signin-submit" style="width: 100%;" id="forgot-submit-btn">
                ${t('signin_forgot_btn')}
              </button>
            </form>

            <!-- Success message (hidden by default) -->
            <p id="forgot-success" style="display: none; color: #16A34A; font-size: 14px; text-align: center; margin-top: 10px;"></p>

            <!-- Back to sign in -->
            <div class="signin-toggle">
              <a href="#" id="forgot-back">${t('signin_forgot_back')}</a>
            </div>
            ` : `
            <div class="signin-header">
              <div class="signin-logo">
                <img src="${import.meta.env.BASE_URL}logo-light.jpg" alt="Dragon Swim Team" class="nav-logo-img light-logo" style="height:60px" />
                <img src="${import.meta.env.BASE_URL}logo-dark.png" alt="Dragon Swim Team" class="nav-logo-img dark-logo" style="height:60px" />
              </div>
              <h1 class="signin-title">${isSignUp ? t('signup_title') : t('signin_title')}</h1>
              <p class="signin-subtitle">${t('signin_subtitle')}</p>
            </div>

            <form class="signin-form" id="auth-form">
              ${isSignUp ? `
              ` : ''}
              <div class="form-group">
                <label class="form-label" for="auth-email">${isSignUp ? t('signup_email') : t('signin_email')}</label>
                <input class="form-input" type="email" id="auth-email" placeholder="you@example.com" required ${failedAttempts >= 3 ? 'disabled' : ''} />
              </div>
              <div class="form-group">
                <label class="form-label" for="auth-password">${isSignUp ? t('signup_password') : t('signin_password')}</label>
                <div class="password-group">
                  <input class="form-input" type="password" id="auth-password" placeholder="••••••••" required ${failedAttempts >= 3 ? 'disabled' : ''} />
                  <button type="button" class="password-toggle" data-target="auth-password" aria-label="Show password" ${failedAttempts >= 3 ? 'disabled' : ''}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
              </div>
              ${isSignUp ? `
                <div class="form-group">
                  <label class="form-label" for="auth-confirm">${t('signup_confirm')}</label>
                  <div class="password-group">
                    <input class="form-input" type="password" id="auth-confirm" placeholder="••••••••" required />
                    <button type="button" class="password-toggle" data-target="auth-confirm" aria-label="Show password">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                  </div>
                </div>
              ` : ''}
              ${!isSignUp ? `
                <div class="signin-forgot">
                  <a href="#" id="forgot-link"${failedAttempts >= 3 ? ' style="color: #F59E0B; font-weight: 700; font-size: 1.05em; text-decoration: underline; animation: pulse 1.5s infinite;"' : ''}>${failedAttempts >= 3 ? '⚠ ' : ''}${t('signin_forgot')}</a>
                </div>
              ` : ''}
              <button type="submit" class="btn btn-primary btn-lg signin-submit" id="submit-btn" style="width: 100%;" ${failedAttempts >= 3 ? 'disabled' : ''}>
                ${isSignUp ? t('signup_btn') : t('signin_btn')}
              </button>
            </form>

            <div class="signin-divider">
              <span>or</span>
            </div>

            <button class="btn btn-outline btn-lg signin-google" id="google-signin">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              ${t('signin_google')}
            </button>

            <div class="signin-toggle">
              ${isSignUp
	      ? `${t('signup_has_account')} <a href="#" id="toggle-auth">${t('signup_signin_link')}</a>`
	      : `${t('signin_no_account')} <a href="#" id="toggle-auth">${t('signin_signup_link')}</a>`
	    }
            </div>
            `}

            <p id="auth-error" style="color:red; font-size: 14px; text-align: center; margin-top: 10px; display: none;"></p>
          </div>
        </div>
      </div>
    </section>
  `;

  renderFooter();
  bindEvents();
}

function bindEvents() {
  const errorEl = document.getElementById('auth-error');
  const btnEl = document.getElementById('submit-btn');

  function showError(msg) {
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
    }
  }

  // Password visibility toggle
  document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
    });
  });

  // Toggle sign-in / sign-up
  document.getElementById('toggle-auth')?.addEventListener('click', (e) => {
    e.preventDefault();
    isSignUp = !isSignUp;
    isForgot = false;
    failedAttempts = 0;
    // Remove old footer before re-render
    document.querySelector('.footer')?.remove();
    render();
  });

  // Form submit
  document.getElementById('auth-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;

    errorEl.style.display = 'none';
    btnEl.disabled = true;

    try {
      if (isSignUp) {
        const confirm = document.getElementById('auth-confirm').value;
        if (password !== confirm) {
          throw new Error('Passwords do not match.');
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check both coaches and families whitelists
        const coachesSnap = await getDocs(
          query(collection(db, 'coaches'), where('email', '==', normalizedEmail))
        );
        const familiesSnap = await getDocs(
          query(collection(db, 'families'), where('email', '==', normalizedEmail))
        );

        // Determine role and whitelist source
        let userRole = null;
        let whitelistDoc = null;
        let whitelistCollection = null;

        if (!coachesSnap.empty) {
          whitelistDoc = coachesSnap.docs[0];
          whitelistCollection = 'coaches';
          userRole = whitelistDoc.data().role || 'coach';
        } else if (!familiesSnap.empty) {
          whitelistDoc = familiesSnap.docs[0];
          whitelistCollection = 'families';
          userRole = 'swimmer';
        }

        if (!whitelistDoc) {
          throw new Error(t('signup_unauthorized'));
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save user role
        await setDoc(doc(db, "users", user.uid), {
          email: email,
          role: userRole,
          createdAt: new Date()
        });

        // Mark whitelist entry as registered
        await updateDoc(doc(db, whitelistCollection, whitelistDoc.id), {
          status: whitelistCollection === 'coaches' ? 'active' : 'registered',
          registeredUid: user.uid,
        });

        // Coaches go directly to dashboard
        if (userRole === 'coach' || userRole === 'admin') {
          window.location.href = import.meta.env.BASE_URL + 'dashboard.html';
        } else {
          // Swimmer: check if spouse already registered this family
          const spouseQ = query(
            collection(db, 'registrations'),
            where('parentEmails', 'array-contains', normalizedEmail)
          );
          const spouseSnap = await getDocs(spouseQ);
          if (!spouseSnap.empty) {
            // Already registered by spouse — add as editor, go to dashboard
            const regDoc = spouseSnap.docs[0];
            const editors = regDoc.data().editors || [];
            if (!editors.includes(user.uid)) {
              editors.push(user.uid);
              await updateDoc(doc(db, 'registrations', regDoc.id), { editors });
            }
            window.location.href = import.meta.env.BASE_URL + 'dashboard.html';
          } else {
            window.location.href = import.meta.env.BASE_URL + 'registration.html';
          }
        }
      } else {
        // Sign In
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const normalizedEmail = email.toLowerCase().trim();

          // Check user role first — coach/admin go directly to dashboard
          const userDocSnap = await getDoc(doc(db, 'users', userCredential.user.uid));
          const userRole = userDocSnap.exists() ? userDocSnap.data().role : null;
          if (userRole === 'coach' || userRole === 'admin') {
            window.location.href = import.meta.env.BASE_URL + 'dashboard.html';
            return;
          }

          // Check own registration first
          const regSnap = await getDoc(doc(db, 'registrations', userCredential.user.uid));
          if (regSnap.exists()) {
            window.location.href = import.meta.env.BASE_URL + 'dashboard.html';
          } else {
            // Check if spouse registered — email in parentEmails
            const spouseQ = query(
              collection(db, 'registrations'),
              where('parentEmails', 'array-contains', normalizedEmail)
            );
            const spouseSnap = await getDocs(spouseQ);
            if (!spouseSnap.empty) {
              window.location.href = import.meta.env.BASE_URL + 'dashboard.html';
            } else {
              window.location.href = import.meta.env.BASE_URL + 'registration.html';
            }
          }
        } catch (error) {
          if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            throw new Error('Wrong password. Please try again.');
          }
          throw error;
        }
      }
    } catch (error) {
      console.error(error);
      // Track failed attempts for sign-in mode only
      if (!isSignUp) {
        failedAttempts++;
      }
      if (failedAttempts >= 3) {
        showError('Too many failed attempts. Please reset your password below.');
        // Re-render to lock the form and highlight forgot password link
        document.querySelector('.footer')?.remove();
        render();
      } else {
        showError(error.message || 'Authentication failed');
        btnEl.disabled = false;
      }
    }
  });

  // Google sign-in
  document.getElementById('google-signin')?.addEventListener('click', async () => {
    errorEl.style.display = 'none';
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email;
      const normalizedEmail = email.toLowerCase().trim();

      // Check both coaches and families whitelists
      const coachesSnap = await getDocs(
        query(collection(db, 'coaches'), where('email', '==', normalizedEmail))
      );
      const familiesSnap = await getDocs(
        query(collection(db, 'families'), where('email', '==', normalizedEmail))
      );

      // Determine role and whitelist source
      let userRole = null;
      let whitelistDoc = null;
      let whitelistCollection = null;

      if (!coachesSnap.empty) {
        whitelistDoc = coachesSnap.docs[0];
        whitelistCollection = 'coaches';
        userRole = whitelistDoc.data().role || 'coach';
      } else if (!familiesSnap.empty) {
        whitelistDoc = familiesSnap.docs[0];
        whitelistCollection = 'families';
        userRole = 'swimmer';
      }

      if (!whitelistDoc) {
        // Not authorized — sign out and show error
        await signOut(auth);
        throw new Error(t('signup_unauthorized_google'));
      }

      // Mark as active/registered if still pending
      if (whitelistDoc.data().status === 'pending') {
        await updateDoc(doc(db, whitelistCollection, whitelistDoc.id), {
          status: whitelistCollection === 'coaches' ? 'active' : 'registered',
          registeredUid: result.user.uid,
        });
      }

      // Save/update user profile
      await setDoc(doc(db, "users", result.user.uid), {
        username: result.user.displayName || "Google User",
        email: result.user.email,
        role: userRole,
        lastLoginAt: new Date()
      }, { merge: true });

      // Coaches go to dashboard; swimmers check registrations
      if (userRole === 'coach' || userRole === 'admin') {
        window.location.href = import.meta.env.BASE_URL + 'dashboard.html';
      } else {
        // Check own registration first
        const regSnap = await getDoc(doc(db, 'registrations', result.user.uid));
        if (regSnap.exists()) {
          window.location.href = import.meta.env.BASE_URL + 'dashboard.html';
        } else {
          // Check if spouse registered — email in parentEmails
          const spouseQ = query(
            collection(db, 'registrations'),
            where('parentEmails', 'array-contains', normalizedEmail)
          );
          const spouseSnap = await getDocs(spouseQ);
          if (!spouseSnap.empty) {
            // Add as editor, go to dashboard
            const regDoc = spouseSnap.docs[0];
            const editors = regDoc.data().editors || [];
            if (!editors.includes(result.user.uid)) {
              editors.push(result.user.uid);
              await updateDoc(doc(db, 'registrations', regDoc.id), { editors });
            }
            window.location.href = import.meta.env.BASE_URL + 'dashboard.html';
          } else {
            window.location.href = import.meta.env.BASE_URL + 'registration.html';
          }
        }
      }
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/popup-closed-by-user') {
        showError('Sign-in popup closed before completion.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        // Do nothing, another popup was opened
      } else {
        showError(error.message || 'Google sign in failed');
      }
    }
  });

  // ── Forgot Password Flow ──

  // Click "Forgot password?" link
  document.getElementById('forgot-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    isForgot = true;
    failedAttempts = 0;
    document.querySelector('.footer')?.remove();
    render();
  });

  // Submit forgot password form
  document.getElementById('forgot-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value;
    const errorEl2 = document.getElementById('auth-error');
    const successEl = document.getElementById('forgot-success');
    const submitBtn = document.getElementById('forgot-submit-btn');

    // Clear previous messages
    if (errorEl2) errorEl2.style.display = 'none';
    if (successEl) successEl.style.display = 'none';
    if (submitBtn) submitBtn.disabled = true;

    try {
      await sendPasswordResetEmail(auth, email);
      if (successEl) {
        successEl.textContent = t('signin_forgot_success');
        successEl.style.display = 'block';
      }
    } catch (error) {
      console.error('Password reset error:', error);
      if (errorEl2) {
        errorEl2.textContent = error.code === 'auth/user-not-found'
          ? t('signin_forgot_error')
          : (error.message || t('signin_forgot_error'));
        errorEl2.style.display = 'block';
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  // Click "Back to sign in"
  document.getElementById('forgot-back')?.addEventListener('click', (e) => {
    e.preventDefault();
    isForgot = false;
    failedAttempts = 0;
    document.querySelector('.footer')?.remove();
    render();
  });
}

render();
