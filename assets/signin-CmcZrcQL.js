import{i as C,t as e}from"./i18n-6jdL3vyQ.js";import{a as q,r as L}from"./footer-BwENUkcq.js";import{i as B,q as k,c as x,e as d,w as I,d as z,b as g,m as S,g as p,u as D,n as A,p as F,j as M,t as T,s as U}from"./firebase-CorBctTj.js";C();q();const H=new URLSearchParams(window.location.search);let a=H.get("mode")==="signup",f=!1,r=0;const W=document.getElementById("app");function u(){W.innerHTML=`
    <section class="section signin-section">
      <div class="container">
        <div class="signin-wrapper">
          <div class="signin-card">
            ${f?`
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
              <h1 class="signin-title">${a?e("signup_title"):e("signin_title")}</h1>
              <p class="signin-subtitle">${e("signin_subtitle")}</p>
            </div>

            <form class="signin-form" id="auth-form">
              ${a?`
              `:""}
              <div class="form-group">
                <label class="form-label" for="auth-email">${a?e("signup_email"):e("signin_email")}</label>
                <input class="form-input" type="email" id="auth-email" placeholder="you@example.com" required ${r>=3?"disabled":""} />
              </div>
              <div class="form-group">
                <label class="form-label" for="auth-password">${a?e("signup_password"):e("signin_password")}</label>
                <div class="password-group">
                  <input class="form-input" type="password" id="auth-password" placeholder="••••••••" required ${r>=3?"disabled":""} />
                  <button type="button" class="password-toggle" data-target="auth-password" aria-label="Show password" ${r>=3?"disabled":""}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
              </div>
              ${a?`
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
              ${a?"":`
                <div class="signin-forgot">
                  <a href="#" id="forgot-link"${r>=3?' style="color: #F59E0B; font-weight: 700; font-size: 1.05em; text-decoration: underline; animation: pulse 1.5s infinite;"':""}>${r>=3?"⚠ ":""}${e("signin_forgot")}</a>
                </div>
              `}
              <button type="submit" class="btn btn-primary btn-lg signin-submit" id="submit-btn" style="width: 100%;" ${r>=3?"disabled":""}>
                ${a?e("signup_btn"):e("signin_btn")}
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
              ${a?`${e("signup_has_account")} <a href="#" id="toggle-auth">${e("signup_signin_link")}</a>`:`${e("signin_no_account")} <a href="#" id="toggle-auth">${e("signin_signup_link")}</a>`}
            </div>
            `}

            <p id="auth-error" style="color:red; font-size: 14px; text-align: center; margin-top: 10px; display: none;"></p>
          </div>
        </div>
      </div>
    </section>
  `,L(),j()}function j(){var w,y,b,v,E,_;const c=document.getElementById("auth-error"),h=document.getElementById("submit-btn");function m(t){c&&(c.textContent=t,c.style.display="block")}document.querySelectorAll(".password-toggle").forEach(t=>{t.addEventListener("click",()=>{const s=document.getElementById(t.dataset.target),i=s.type==="password";s.type=i?"text":"password"})}),(w=document.getElementById("toggle-auth"))==null||w.addEventListener("click",t=>{var s;t.preventDefault(),a=!a,f=!1,r=0,(s=document.querySelector(".footer"))==null||s.remove(),u()}),(y=document.getElementById("auth-form"))==null||y.addEventListener("submit",async t=>{var n;t.preventDefault();const s=document.getElementById("auth-email").value,i=document.getElementById("auth-password").value;c.style.display="none",h.disabled=!0;try{if(a){const o=document.getElementById("auth-confirm").value;if(i!==o)throw new Error("Passwords do not match.");const l=await B(k(x(d,"families"),I("email","==",s.toLowerCase().trim())));if(l.empty)throw new Error(e("signup_unauthorized"));const $=(await z(g,s,i)).user;await S(p(d,"users",$.uid),{email:s,role:"swimmer",createdAt:new Date});const P=l.docs[0];await D(p(d,"families",P.id),{status:"registered",registeredUid:$.uid}),window.location.href="/registration.html"}else try{await A(g,s,i),window.location.href="/dashboard.html"}catch(o){throw o.code==="auth/wrong-password"||o.code==="auth/invalid-credential"?new Error("Wrong password. Please try again."):o}}catch(o){console.error(o),a||r++,r>=3?(m("Too many failed attempts. Please reset your password below."),(n=document.querySelector(".footer"))==null||n.remove(),u()):(m(o.message||"Authentication failed"),h.disabled=!1)}}),(b=document.getElementById("google-signin"))==null||b.addEventListener("click",async()=>{c.style.display="none";try{const t=await F(g,M),s=t.user.email,i=await B(k(x(d,"families"),I("email","==",s.toLowerCase().trim())));if(i.empty)throw await T(g),new Error(e("signup_unauthorized_google"));const n=i.docs[0];n.data().status==="pending"&&await D(p(d,"families",n.id),{status:"registered",registeredUid:t.user.uid}),await S(p(d,"users",t.user.uid),{username:t.user.displayName||"Google User",email:t.user.email,role:"swimmer",lastLoginAt:new Date},{merge:!0}),window.location.href="/dashboard.html"}catch(t){console.error(t),t.code==="auth/popup-closed-by-user"?m("Sign-in popup closed before completion."):t.code==="auth/cancelled-popup-request"||m(t.message||"Google sign in failed")}}),(v=document.getElementById("forgot-link"))==null||v.addEventListener("click",t=>{var s;t.preventDefault(),f=!0,r=0,(s=document.querySelector(".footer"))==null||s.remove(),u()}),(E=document.getElementById("forgot-form"))==null||E.addEventListener("submit",async t=>{t.preventDefault();const s=document.getElementById("forgot-email").value,i=document.getElementById("auth-error"),n=document.getElementById("forgot-success"),o=document.getElementById("forgot-submit-btn");i&&(i.style.display="none"),n&&(n.style.display="none"),o&&(o.disabled=!0);try{await U(g,s),n&&(n.textContent=e("signin_forgot_success"),n.style.display="block")}catch(l){console.error("Password reset error:",l),i&&(i.textContent=l.code==="auth/user-not-found"?e("signin_forgot_error"):l.message||e("signin_forgot_error"),i.style.display="block")}finally{o&&(o.disabled=!1)}}),(_=document.getElementById("forgot-back"))==null||_.addEventListener("click",t=>{var s;t.preventDefault(),f=!1,r=0,(s=document.querySelector(".footer"))==null||s.remove(),u()})}u();
