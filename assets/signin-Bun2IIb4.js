import{i as v,t}from"./i18n-dQsv5kZQ.js";import{a as b,r as y}from"./footer-CmM59U3h.js";import{d as E,b as l,s as p,g as m,e as h,l as _,m as $,i as B}from"./firebase-B6pM3H1n.js";v();b();const x=new URLSearchParams(window.location.search);let s=x.get("mode")==="signup";const k=document.getElementById("app");function w(){k.innerHTML=`
    <section class="section signin-section">
      <div class="container">
        <div class="signin-wrapper">
          <div class="signin-card">
            <div class="signin-header">
              <div class="signin-logo">
                <img src="/dragonwebsite/logo-light.jpg" alt="Dragon Swim Team" class="nav-logo-img light-logo" style="height:60px" />
                <img src="/dragonwebsite/logo-dark.png" alt="Dragon Swim Team" class="nav-logo-img dark-logo" style="height:60px" />
              </div>
              <h1 class="signin-title">${s?t("signup_title"):t("signin_title")}</h1>
              <p class="signin-subtitle">${t("signin_subtitle")}</p>
            </div>

            <form class="signin-form" id="auth-form">
              ${s?`
              `:""}
              <div class="form-group">
                <label class="form-label" for="auth-email">${s?t("signup_email"):t("signin_email")}</label>
                <input class="form-input" type="email" id="auth-email" placeholder="you@example.com" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="auth-password">${s?t("signup_password"):t("signin_password")}</label>
                <div class="password-group">
                  <input class="form-input" type="password" id="auth-password" placeholder="••••••••" required />
                  <button type="button" class="password-toggle" data-target="auth-password" aria-label="Show password">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
              </div>
              ${s?`
                <div class="form-group">
                  <label class="form-label" for="auth-confirm">${t("signup_confirm")}</label>
                  <div class="password-group">
                    <input class="form-input" type="password" id="auth-confirm" placeholder="••••••••" required />
                    <button type="button" class="password-toggle" data-target="auth-confirm" aria-label="Show password">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                  </div>
                </div>
              `:""}
              ${s?"":`
                <div class="signin-forgot">
                  <a href="#">${t("signin_forgot")}</a>
                </div>
              `}
              <button type="submit" class="btn btn-primary btn-lg signin-submit" id="submit-btn" style="width: 100%;">
                ${s?t("signup_btn"):t("signin_btn")}
              </button>
            </form>

            <div class="signin-divider">
              <span>or</span>
            </div>

            <button class="btn btn-outline btn-lg signin-google" id="google-signin">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              ${t("signin_google")}
            </button>

            <div class="signin-toggle">
              ${s?`${t("signup_has_account")} <a href="#" id="toggle-auth">${t("signup_signin_link")}</a>`:`${t("signin_no_account")} <a href="#" id="toggle-auth">${t("signin_signup_link")}</a>`}
            </div>
            
            <p id="auth-error" style="color:red; font-size: 14px; text-align: center; margin-top: 10px; display: none;"></p>
          </div>
        </div>
      </div>
    </section>
  `,y(),I()}function I(){var c,g,u;const a=document.getElementById("auth-error"),d=document.getElementById("submit-btn");function r(e){a&&(a.textContent=e,a.style.display="block")}document.querySelectorAll(".password-toggle").forEach(e=>{e.addEventListener("click",()=>{const i=document.getElementById(e.dataset.target),n=i.type==="password";i.type=n?"text":"password"})}),(c=document.getElementById("toggle-auth"))==null||c.addEventListener("click",e=>{var i;e.preventDefault(),s=!s,(i=document.querySelector(".footer"))==null||i.remove(),w()}),(g=document.getElementById("auth-form"))==null||g.addEventListener("submit",async e=>{e.preventDefault();const i=document.getElementById("auth-email").value,n=document.getElementById("auth-password").value;a.style.display="none",d.disabled=!0;try{if(s){const o=document.getElementById("auth-confirm").value;if(n!==o)throw new Error("Passwords do not match.");const f=(await E(l,i,n)).user;await p(m(h,"users",f.uid),{email:i,role:"swimmer",createdAt:new Date}),window.location.href="/dragonwebsite/registration.html"}else try{await _(l,i,n),window.location.href="/dragonwebsite/dashboard.html"}catch(o){throw o.code==="auth/wrong-password"||o.code==="auth/invalid-credential"?new Error("Wrong password. Please try again."):o}}catch(o){console.error(o),r(o.message||"Authentication failed"),d.disabled=!1}}),(u=document.getElementById("google-signin"))==null||u.addEventListener("click",async()=>{a.style.display="none";try{const e=await $(l,B);await p(m(h,"users",e.user.uid),{username:e.user.displayName||"Google User",email:e.user.email,role:"swimmer",lastLoginAt:new Date},{merge:!0}),window.location.href="/dragonwebsite/dashboard.html"}catch(e){console.error(e),e.code==="auth/popup-closed-by-user"?r("Sign-in popup closed before completion."):e.code==="auth/cancelled-popup-request"||r(e.message||"Google sign in failed")}})}w();
