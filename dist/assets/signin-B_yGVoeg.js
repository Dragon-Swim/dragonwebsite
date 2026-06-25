import{i as k,t as e}from"./i18n-C1hpdw3r.js";import{a as x,r as I}from"./footer-BsZ6FkZw.js";import{d as S,b as u,l as E,g as _,e as $,m as P,n as D,i as A,s as C}from"./firebase-DKR4RDCB.js";k();x();const q=new URLSearchParams(window.location.search);let i=q.get("mode")==="signup",m=!1,a=0;const L=document.getElementById("app");function d(){L.innerHTML=`
    <section class="section signin-section">
      <div class="container">
        <div class="signin-wrapper">
          <div class="signin-card">
            ${m?`
            <!-- Forgot Password Header -->
            <div class="signin-header">
              <div class="signin-logo">
                <img src="/logo-light.jpg" alt="Dragon Swim Team" class="nav-logo-img light-logo" style="height:60px" />
                <img src="/logo-dark.png" alt="Dragon Swim Team" class="nav-logo-img dark-logo" style="height:60px" />
              </div>
              <h1 class="signin-title">${e("signin_forgot_title")}</h1>
              <p class="signin-subtitle">${e("signin_forgot_subtitle")}</p>
            </div>

            <!-- Forgot Password Form -->
            <form class="signin-form" id="forgot-form">
              <div class="form-group">
                <label class="form-label" for="forgot-email">${e("signin_forgot_email")}</label>
                <input class="form-input" type="email" id="forgot-email" placeholder="you@example.com" required />
              </div>
              <button type="submit" class="btn btn-primary btn-lg signin-submit" style="width: 100%;" id="forgot-submit-btn">
                ${e("signin_forgot_btn")}
              </button>
            </form>

            <!-- Success message (hidden by default) -->
            <p id="forgot-success" style="display: none; color: #16A34A; font-size: 14px; text-align: center; margin-top: 10px;"></p>

            <!-- Back to sign in -->
            <div class="signin-toggle">
              <a href="#" id="forgot-back">${e("signin_forgot_back")}</a>
            </div>
            `:`
            <div class="signin-header">
              <div class="signin-logo">
                <img src="/logo-light.jpg" alt="Dragon Swim Team" class="nav-logo-img light-logo" style="height:60px" />
                <img src="/logo-dark.png" alt="Dragon Swim Team" class="nav-logo-img dark-logo" style="height:60px" />
              </div>
              <h1 class="signin-title">${i?e("signup_title"):e("signin_title")}</h1>
              <p class="signin-subtitle">${e("signin_subtitle")}</p>
            </div>

            <form class="signin-form" id="auth-form">
              ${i?`
              `:""}
              <div class="form-group">
                <label class="form-label" for="auth-email">${i?e("signup_email"):e("signin_email")}</label>
                <input class="form-input" type="email" id="auth-email" placeholder="you@example.com" required ${a>=3?"disabled":""} />
              </div>
              <div class="form-group">
                <label class="form-label" for="auth-password">${i?e("signup_password"):e("signin_password")}</label>
                <div class="password-group">
                  <input class="form-input" type="password" id="auth-password" placeholder="••••••••" required ${a>=3?"disabled":""} />
                  <button type="button" class="password-toggle" data-target="auth-password" aria-label="Show password" ${a>=3?"disabled":""}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
              </div>
              ${i?`
                <div class="form-group">
                  <label class="form-label" for="auth-confirm">${e("signup_confirm")}</label>
                  <div class="password-group">
                    <input class="form-input" type="password" id="auth-confirm" placeholder="••••••••" required />
                    <button type="button" class="password-toggle" data-target="auth-confirm" aria-label="Show password">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                  </div>
                </div>
              `:""}
              ${i?"":`
                <div class="signin-forgot">
                  <a href="#" id="forgot-link"${a>=3?' style="color: #F59E0B; font-weight: 700; font-size: 1.05em; text-decoration: underline; animation: pulse 1.5s infinite;"':""}>${a>=3?"⚠ ":""}${e("signin_forgot")}</a>
                </div>
              `}
              <button type="submit" class="btn btn-primary btn-lg signin-submit" id="submit-btn" style="width: 100%;" ${a>=3?"disabled":""}>
                ${i?e("signup_btn"):e("signin_btn")}
              </button>
            </form>

            <div class="signin-divider">
              <span>or</span>
            </div>

            <button class="btn btn-outline btn-lg signin-google" id="google-signin">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              ${e("signin_google")}
            </button>

            <div class="signin-toggle">
              ${i?`${e("signup_has_account")} <a href="#" id="toggle-auth">${e("signup_signin_link")}</a>`:`${e("signin_no_account")} <a href="#" id="toggle-auth">${e("signin_signup_link")}</a>`}
            </div>
            `}

            <p id="auth-error" style="color:red; font-size: 14px; text-align: center; margin-top: 10px; display: none;"></p>
          </div>
        </div>
      </div>
    </section>
  `,I(),z()}function z(){var f,h,b,y,v,w;const l=document.getElementById("auth-error"),p=document.getElementById("submit-btn");function g(t){l&&(l.textContent=t,l.style.display="block")}document.querySelectorAll(".password-toggle").forEach(t=>{t.addEventListener("click",()=>{const s=document.getElementById(t.dataset.target),n=s.type==="password";s.type=n?"text":"password"})}),(f=document.getElementById("toggle-auth"))==null||f.addEventListener("click",t=>{var s;t.preventDefault(),i=!i,m=!1,a=0,(s=document.querySelector(".footer"))==null||s.remove(),d()}),(h=document.getElementById("auth-form"))==null||h.addEventListener("submit",async t=>{var r;t.preventDefault();const s=document.getElementById("auth-email").value,n=document.getElementById("auth-password").value;l.style.display="none",p.disabled=!0;try{if(i){const o=document.getElementById("auth-confirm").value;if(n!==o)throw new Error("Passwords do not match.");const B=(await S(u,s,n)).user;await E(_($,"users",B.uid),{email:s,role:"swimmer",createdAt:new Date}),window.location.href="/registration.html"}else try{await P(u,s,n),window.location.href="/dashboard.html"}catch(o){throw o.code==="auth/wrong-password"||o.code==="auth/invalid-credential"?new Error("Wrong password. Please try again."):o}}catch(o){console.error(o),i||a++,a>=3?(g("Too many failed attempts. Please reset your password below."),(r=document.querySelector(".footer"))==null||r.remove(),d()):(g(o.message||"Authentication failed"),p.disabled=!1)}}),(b=document.getElementById("google-signin"))==null||b.addEventListener("click",async()=>{l.style.display="none";try{const t=await D(u,A);await E(_($,"users",t.user.uid),{username:t.user.displayName||"Google User",email:t.user.email,role:"swimmer",lastLoginAt:new Date},{merge:!0}),window.location.href="/dashboard.html"}catch(t){console.error(t),t.code==="auth/popup-closed-by-user"?g("Sign-in popup closed before completion."):t.code==="auth/cancelled-popup-request"||g(t.message||"Google sign in failed")}}),(y=document.getElementById("forgot-link"))==null||y.addEventListener("click",t=>{var s;t.preventDefault(),m=!0,a=0,(s=document.querySelector(".footer"))==null||s.remove(),d()}),(v=document.getElementById("forgot-form"))==null||v.addEventListener("submit",async t=>{t.preventDefault();const s=document.getElementById("forgot-email").value,n=document.getElementById("auth-error"),r=document.getElementById("forgot-success"),o=document.getElementById("forgot-submit-btn");n&&(n.style.display="none"),r&&(r.style.display="none"),o&&(o.disabled=!0);try{await C(u,s),r&&(r.textContent=e("signin_forgot_success"),r.style.display="block")}catch(c){console.error("Password reset error:",c),n&&(n.textContent=c.code==="auth/user-not-found"?e("signin_forgot_error"):c.message||e("signin_forgot_error"),n.style.display="block")}finally{o&&(o.disabled=!1)}}),(w=document.getElementById("forgot-back"))==null||w.addEventListener("click",t=>{var s;t.preventDefault(),m=!1,a=0,(s=document.querySelector(".footer"))==null||s.remove(),d()})}d();
