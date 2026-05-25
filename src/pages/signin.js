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
  doc,
  setDoc
} from '../utils/firebase.js';

import { initTheme } from '../components/theme-toggle.js';
import { renderNavbar } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';
import { t } from '../utils/i18n.js';

initTheme();
renderNavbar();

const urlParams = new URLSearchParams(window.location.search);
let isSignUp = urlParams.get('mode') === 'signup';

const app = document.getElementById('app');

function render() {
  app.innerHTML = `
    <section class="section signin-section">
      <div class="container">
        <div class="signin-wrapper">
          <div class="signin-card">
            <div class="signin-header">
              <div class="signin-logo">
                <img src="${import.meta.env.BASE_URL}logo-light.jpg" alt="Dragon Swim Team" class="nav-logo-img, light-logo" style="height:60px" />
                <img src="${import.meta.env.BASE_URL}logo-dark.png" alt="Dragon Swim Team" class="nav-logo-img, dark-logo" style="height:60px" />
              </div>
              <h1 class="signin-title">${isSignUp ? t('signup_title') : t('signin_title')}</h1>
              <p class="signin-subtitle">${t('signin_subtitle')}</p>
            </div>

            <form class="signin-form" id="auth-form">
              ${isSignUp ? `
              ` : ''}
              <div class="form-group">
                <label class="form-label" for="auth-email">${isSignUp ? t('signup_email') : t('signin_email')}</label>
                <input class="form-input" type="email" id="auth-email" placeholder="you@example.com" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="auth-password">${isSignUp ? t('signup_password') : t('signin_password')}</label>
                <input class="form-input" type="password" id="auth-password" placeholder="••••••••" required />
              </div>
              ${isSignUp ? `
                <div class="form-group">
                  <label class="form-label" for="auth-confirm">${t('signup_confirm')}</label>
                  <input class="form-input" type="password" id="auth-confirm" placeholder="••••••••" required />
                </div>
              ` : ''}
              ${!isSignUp ? `
                <div class="signin-forgot">
                  <a href="#">${t('signin_forgot')}</a>
                </div>
              ` : ''}
              <button type="submit" class="btn btn-primary btn-lg signin-submit" id="submit-btn" style="width: 100%;">
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

  // Toggle sign-in / sign-up
  document.getElementById('toggle-auth')?.addEventListener('click', (e) => {
    e.preventDefault();
    isSignUp = !isSignUp;
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

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
          email: email,
          role: "swimmer",
          createdAt: new Date()
        });

        window.location.href = import.meta.env.BASE_URL + 'registration.html';
      } else {
        // Sign In
        try {
          await signInWithEmailAndPassword(auth, email, password);
          window.location.href = import.meta.env.BASE_URL + 'dashboard.html';
        } catch (error) {
          if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            throw new Error('Wrong password. Please try again.');
          }
          throw error;
        }
      }
    } catch (error) {
      console.error(error);
      showError(error.message || 'Authentication failed');
      btnEl.disabled = false;
    }
  });

  // Google sign-in
  document.getElementById('google-signin')?.addEventListener('click', async () => {
    errorEl.style.display = 'none';
    try {
      const result = await signInWithPopup(auth, googleProvider);

      // Attempt to save to firestore - use setDoc with merge:true so we don't overwrite if they exist
      await setDoc(doc(db, "users", result.user.uid), {
        username: result.user.displayName || "Google User",
        email: result.user.email,
        role: "swimmer",
        lastLoginAt: new Date()
      }, { merge: true });

      window.location.href = import.meta.env.BASE_URL + 'dashboard.html';
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
}

render();
