import{i as R,t}from"./i18n-DIN1ScE8.js";import{a as W,r as j}from"./footer-Cg_RfItd.js";import{i as w,q as y,c as b,e as n,w as v,d as Q,b as _,m as T,g as m,u as B,n as G,h as U,p as N,j as O,t as V,s as J}from"./firebase-CorBctTj.js";R();W();const K=new URLSearchParams(window.location.search);let r=K.get("mode")==="signup",k=!1,d=0;const X=document.getElementById("app");function $(){X.innerHTML=`
    <section class="section signin-section">
      <div class="container">
        <div class="signin-wrapper">
          <div class="signin-card">
            ${k?`
            <!-- Forgot Password Header -->
            <div class="signin-header">
              <div class="signin-logo">
                <img src="/logo-light.jpg" alt="Dragon Swim Team" class="nav-logo-img light-logo" style="height:60px" />
                <img src="/logo-dark.png" alt="Dragon Swim Team" class="nav-logo-img dark-logo" style="height:60px" />
              </div>
              <h1 class="signin-title">${t("signin_forgot_title")}</h1>
              <p class="signin-subtitle">${t("signin_forgot_subtitle")}</p>
            </div>

            <!-- Forgot Password Form -->
            <form class="signin-form" id="forgot-form">
              <div class="form-group">
                <label class="form-label" for="forgot-email">${t("signin_forgot_email")}</label>
                <input class="form-input" type="email" id="forgot-email" placeholder="you@example.com" required />
              </div>
              <button type="submit" class="btn btn-primary btn-lg signin-submit" style="width: 100%;" id="forgot-submit-btn">
                ${t("signin_forgot_btn")}
              </button>
            </form>

            <!-- Success message (hidden by default) -->
            <p id="forgot-success" style="display: none; color: #16A34A; font-size: 14px; text-align: center; margin-top: 10px;"></p>

            <!-- Back to sign in -->
            <div class="signin-toggle">
              <a href="#" id="forgot-back">${t("signin_forgot_back")}</a>
            </div>
            `:`
            <div class="signin-header">
              <div class="signin-logo">
                <img src="/logo-light.jpg" alt="Dragon Swim Team" class="nav-logo-img light-logo" style="height:60px" />
                <img src="/logo-dark.png" alt="Dragon Swim Team" class="nav-logo-img dark-logo" style="height:60px" />
              </div>
              <h1 class="signin-title">${r?t("signup_title"):t("signin_title")}</h1>
              <p class="signin-subtitle">${t("signin_subtitle")}</p>
            </div>

            <form class="signin-form" id="auth-form">
              ${r?`
              `:""}
              <div class="form-group">
                <label class="form-label" for="auth-email">${r?t("signup_email"):t("signin_email")}</label>
                <input class="form-input" type="email" id="auth-email" placeholder="you@example.com" required ${d>=3?"disabled":""} />
              </div>
              <div class="form-group">
                <label class="form-label" for="auth-password">${r?t("signup_password"):t("signin_password")}</label>
                <div class="password-group">
                  <input class="form-input" type="password" id="auth-password" placeholder="••••••••" required ${d>=3?"disabled":""} />
                  <button type="button" class="password-toggle" data-target="auth-password" aria-label="Show password" ${d>=3?"disabled":""}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
              </div>
              ${r?`
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
              ${r?"":`
                <div class="signin-forgot">
                  <a href="#" id="forgot-link"${d>=3?' style="color: #F59E0B; font-weight: 700; font-size: 1.05em; text-decoration: underline; animation: pulse 1.5s infinite;"':""}>${d>=3?"⚠ ":""}${t("signin_forgot")}</a>
                </div>
              `}
              <button type="submit" class="btn btn-primary btn-lg signin-submit" id="submit-btn" style="width: 100%;" ${d>=3?"disabled":""}>
                ${r?t("signup_btn"):t("signin_btn")}
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
              ${r?`${t("signup_has_account")} <a href="#" id="toggle-auth">${t("signup_signin_link")}</a>`:`${t("signin_no_account")} <a href="#" id="toggle-auth">${t("signin_signup_link")}</a>`}
            </div>
            `}

            <p id="auth-error" style="color:red; font-size: 14px; text-align: center; margin-top: 10px; display: none;"></p>
          </div>
        </div>
      </div>
    </section>
  `,j(),Y()}function Y(){var C,z,P,L,q,A;const E=document.getElementById("auth-error"),I=document.getElementById("submit-btn");function S(e){E&&(E.textContent=e,E.style.display="block")}document.querySelectorAll(".password-toggle").forEach(e=>{e.addEventListener("click",()=>{const s=document.getElementById(e.dataset.target),o=s.type==="password";s.type=o?"text":"password"})}),(C=document.getElementById("toggle-auth"))==null||C.addEventListener("click",e=>{var s;e.preventDefault(),r=!r,k=!1,d=0,(s=document.querySelector(".footer"))==null||s.remove(),$()}),(z=document.getElementById("auth-form"))==null||z.addEventListener("submit",async e=>{var l;e.preventDefault();const s=document.getElementById("auth-email").value,o=document.getElementById("auth-password").value;E.style.display="none",I.disabled=!0;try{if(r){const i=document.getElementById("auth-confirm").value;if(o!==i)throw new Error("Passwords do not match.");const a=s.toLowerCase().trim(),c=await w(y(b(n,"coaches"),v("email","==",a))),g=await w(y(b(n,"families"),v("email","==",a)));let p=null,f=null,h=null;if(c.empty?g.empty||(f=g.docs[0],h="families",p="swimmer"):(f=c.docs[0],h="coaches",p=f.data().role||"coach"),!f)throw new Error(t("signup_unauthorized"));const u=(await Q(_,s,o)).user;if(await T(m(n,"users",u.uid),{email:s,role:p,createdAt:new Date}),await B(m(n,h,f.id),{status:h==="coaches"?"active":"registered",registeredUid:u.uid}),p==="coach"||p==="admin")window.location.href="/dashboard.html";else{const H=y(b(n,"registrations"),v("parentEmails","array-contains",a)),F=await w(H);if(F.empty)window.location.href="/registration.html";else{const M=F.docs[0],D=M.data().editors||[];D.includes(u.uid)||(D.push(u.uid),await B(m(n,"registrations",M.id),{editors:D})),window.location.href="/dashboard.html"}}}else try{const i=await G(_,s,o),a=s.toLowerCase().trim();if((await U(m(n,"registrations",i.user.uid))).exists())window.location.href="/dashboard.html";else{const g=y(b(n,"registrations"),v("parentEmails","array-contains",a));(await w(g)).empty?window.location.href="/registration.html":window.location.href="/dashboard.html"}}catch(i){throw i.code==="auth/wrong-password"||i.code==="auth/invalid-credential"?new Error("Wrong password. Please try again."):i}}catch(i){console.error(i),r||d++,d>=3?(S("Too many failed attempts. Please reset your password below."),(l=document.querySelector(".footer"))==null||l.remove(),$()):(S(i.message||"Authentication failed"),I.disabled=!1)}}),(P=document.getElementById("google-signin"))==null||P.addEventListener("click",async()=>{E.style.display="none";try{const e=await N(_,O),o=e.user.email.toLowerCase().trim(),l=await w(y(b(n,"coaches"),v("email","==",o))),i=await w(y(b(n,"families"),v("email","==",o)));let a=null,c=null,g=null;if(l.empty?i.empty||(c=i.docs[0],g="families",a="swimmer"):(c=l.docs[0],g="coaches",a=c.data().role||"coach"),!c)throw await V(_),new Error(t("signup_unauthorized_google"));if(c.data().status==="pending"&&await B(m(n,g,c.id),{status:g==="coaches"?"active":"registered",registeredUid:e.user.uid}),await T(m(n,"users",e.user.uid),{username:e.user.displayName||"Google User",email:e.user.email,role:a,lastLoginAt:new Date},{merge:!0}),a==="coach"||a==="admin")window.location.href="/dashboard.html";else if((await U(m(n,"registrations",e.user.uid))).exists())window.location.href="/dashboard.html";else{const f=y(b(n,"registrations"),v("parentEmails","array-contains",o)),h=await w(f);if(h.empty)window.location.href="/registration.html";else{const x=h.docs[0],u=x.data().editors||[];u.includes(e.user.uid)||(u.push(e.user.uid),await B(m(n,"registrations",x.id),{editors:u})),window.location.href="/dashboard.html"}}}catch(e){console.error(e),e.code==="auth/popup-closed-by-user"?S("Sign-in popup closed before completion."):e.code==="auth/cancelled-popup-request"||S(e.message||"Google sign in failed")}}),(L=document.getElementById("forgot-link"))==null||L.addEventListener("click",e=>{var s;e.preventDefault(),k=!0,d=0,(s=document.querySelector(".footer"))==null||s.remove(),$()}),(q=document.getElementById("forgot-form"))==null||q.addEventListener("submit",async e=>{e.preventDefault();const s=document.getElementById("forgot-email").value,o=document.getElementById("auth-error"),l=document.getElementById("forgot-success"),i=document.getElementById("forgot-submit-btn");o&&(o.style.display="none"),l&&(l.style.display="none"),i&&(i.disabled=!0);try{await J(_,s),l&&(l.textContent=t("signin_forgot_success"),l.style.display="block")}catch(a){console.error("Password reset error:",a),o&&(o.textContent=a.code==="auth/user-not-found"?t("signin_forgot_error"):a.message||t("signin_forgot_error"),o.style.display="block")}finally{i&&(i.disabled=!1)}}),(A=document.getElementById("forgot-back"))==null||A.addEventListener("click",e=>{var s;e.preventDefault(),k=!1,d=0,(s=document.querySelector(".footer"))==null||s.remove(),$()})}$();
