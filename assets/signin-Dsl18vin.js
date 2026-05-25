import{i as B}from"./theme-toggle-CI3g1rpd.js";import{a as I,t as e,r as k}from"./footer-DF3ari8b.js";import{d as A,b as r,u as C,s as b,g as v,e as w,l as D,m as P,i as q}from"./firebase-B8poFbjz.js";B();I();let i=!1;const S=document.getElementById("app");function y(){S.innerHTML=`
    <section class="section signin-section">
      <div class="container">
        <div class="signin-wrapper">
          <div class="signin-card">
            <div class="signin-header">
              <div class="signin-logo">
                <img src="/dragonwebsite/logo-light.jpg" alt="Dragon Swim Team" class="nav-logo-img, light-logo" style="height:60px" />
                <img src="/dragonwebsite/logo-dark.png" alt="Dragon Swim Team" class="nav-logo-img, dark-logo" style="height:60px" />
              </div>
              <h1 class="signin-title">${i?e("signup_title"):e("signin_title")}</h1>
              <p class="signin-subtitle">${e("signin_subtitle")}</p>
            </div>

            <form class="signin-form" id="auth-form">
              ${i?`
                <div class="form-group">
                  <label class="form-label" for="auth-name">${e("signup_name")}</label>
                  <input class="form-input" type="text" id="auth-name" placeholder="Username" required />
                </div>
                <div class="form-group">
                  <label class="form-label" for="auth-phone">${e("reg_phone")}</label>
                  <input class="form-input" type="tel" id="auth-phone" placeholder="(555) 123-4567" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="auth-dob">${e("reg_dob")}</label>
                  <input class="form-input" type="date" id="auth-dob" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="auth-experience">${e("reg_experience")}</label>
                  <select class="form-select" id="auth-experience">
                    <option value="" disabled selected>Select your experience level...</option>
                    <option value="beginner">${e("reg_exp_beginner")}</option>
                    <option value="intermediate">${e("reg_exp_intermediate")}</option>
                    <option value="advanced">${e("reg_exp_advanced")}</option>
                    <option value="competitive">${e("reg_exp_competitive")}</option>
                  </select>
                </div>
              `:""}
              <div class="form-group">
                <label class="form-label" for="auth-email">${i?e("signup_email"):e("signin_email")}</label>
                <input class="form-input" type="email" id="auth-email" placeholder="you@example.com" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="auth-password">${i?e("signup_password"):e("signin_password")}</label>
                <input class="form-input" type="password" id="auth-password" placeholder="••••••••" required />
              </div>
              ${i?`
                <div class="form-group">
                  <label class="form-label" for="auth-confirm">${e("signup_confirm")}</label>
                  <input class="form-input" type="password" id="auth-confirm" placeholder="••••••••" required />
                </div>
              `:""}
              ${i?"":`
                <div class="signin-forgot">
                  <a href="#">${e("signin_forgot")}</a>
                </div>
              `}
              <button type="submit" class="btn btn-primary btn-lg signin-submit" id="submit-btn" style="width: 100%;">
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
            
            <p id="auth-error" style="color:red; font-size: 14px; text-align: center; margin-top: 10px; display: none;"></p>
          </div>
        </div>
      </div>
    </section>
  `,k(),z()}function z(){var c,u,g;const o=document.getElementById("auth-error"),d=document.getElementById("submit-btn");function s(t){o&&(o.textContent=t,o.style.display="block")}(c=document.getElementById("toggle-auth"))==null||c.addEventListener("click",t=>{var n;t.preventDefault(),i=!i,(n=document.querySelector(".footer"))==null||n.remove(),y()}),(u=document.getElementById("auth-form"))==null||u.addEventListener("submit",async t=>{var p,m,h;t.preventDefault();const n=document.getElementById("auth-email").value,l=document.getElementById("auth-password").value;o.style.display="none",d.disabled=!0;try{if(i){const a=document.getElementById("auth-name").value,_=document.getElementById("auth-confirm").value,$=((p=document.getElementById("auth-phone"))==null?void 0:p.value.trim())||null,E=((m=document.getElementById("auth-dob"))==null?void 0:m.value)||null,x=((h=document.getElementById("auth-experience"))==null?void 0:h.value)||null;if(l!==_)throw new Error("Passwords do not match.");const f=(await A(r,n,l)).user;await C(f,{displayName:a}),await b(v(w,"users",f.uid),{username:a,email:n,phone:$,dob:E,experience:x,role:"swimmer",createdAt:new Date}),window.location.href="/dragonwebsite/dashboard.html"}else try{await D(r,n,l),window.location.href="/dragonwebsite/dashboard.html"}catch(a){throw a.code==="auth/wrong-password"||a.code==="auth/invalid-credential"?new Error("Wrong password. Please try again."):a}}catch(a){console.error(a),s(a.message||"Authentication failed"),d.disabled=!1}}),(g=document.getElementById("google-signin"))==null||g.addEventListener("click",async()=>{o.style.display="none";try{const t=await P(r,q);await b(v(w,"users",t.user.uid),{username:t.user.displayName||"Google User",email:t.user.email,role:"swimmer",lastLoginAt:new Date},{merge:!0}),window.location.href="/dragonwebsite/dashboard.html"}catch(t){console.error(t),t.code==="auth/popup-closed-by-user"?s("Sign-in popup closed before completion."):t.code==="auth/cancelled-popup-request"||s(t.message||"Google sign in failed")}})}y();
