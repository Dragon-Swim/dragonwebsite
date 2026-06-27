import{i as R,t}from"./i18n-DIN1ScE8.js";import{a as W,r as j}from"./footer-Cg_RfItd.js";import{i as w,q as y,c as b,e as o,w as v,d as Q,b as _,m as U,g as m,u as x,n as G,h as I,p as N,j as O,t as V,s as J}from"./firebase-CorBctTj.js";R();W();const K=new URLSearchParams(window.location.search);let l=K.get("mode")==="signup",B=!1,c=0;const X=document.getElementById("app");function $(){X.innerHTML=`
    <section class="section signin-section">
      <div class="container">
        <div class="signin-wrapper">
          <div class="signin-card">
            ${B?`
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
              <h1 class="signin-title">${l?t("signup_title"):t("signin_title")}</h1>
              <p class="signin-subtitle">${t("signin_subtitle")}</p>
            </div>

            <form class="signin-form" id="auth-form">
              ${l?`
              `:""}
              <div class="form-group">
                <label class="form-label" for="auth-email">${l?t("signup_email"):t("signin_email")}</label>
                <input class="form-input" type="email" id="auth-email" placeholder="you@example.com" required ${c>=3?"disabled":""} />
              </div>
              <div class="form-group">
                <label class="form-label" for="auth-password">${l?t("signup_password"):t("signin_password")}</label>
                <div class="password-group">
                  <input class="form-input" type="password" id="auth-password" placeholder="••••••••" required ${c>=3?"disabled":""} />
                  <button type="button" class="password-toggle" data-target="auth-password" aria-label="Show password" ${c>=3?"disabled":""}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
              </div>
              ${l?`
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
              ${l?"":`
                <div class="signin-forgot">
                  <a href="#" id="forgot-link"${c>=3?' style="color: #F59E0B; font-weight: 700; font-size: 1.05em; text-decoration: underline; animation: pulse 1.5s infinite;"':""}>${c>=3?"⚠ ":""}${t("signin_forgot")}</a>
                </div>
              `}
              <button type="submit" class="btn btn-primary btn-lg signin-submit" id="submit-btn" style="width: 100%;" ${c>=3?"disabled":""}>
                ${l?t("signup_btn"):t("signin_btn")}
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
              ${l?`${t("signup_has_account")} <a href="#" id="toggle-auth">${t("signup_signin_link")}</a>`:`${t("signin_no_account")} <a href="#" id="toggle-auth">${t("signin_signup_link")}</a>`}
            </div>
            `}

            <p id="auth-error" style="color:red; font-size: 14px; text-align: center; margin-top: 10px; display: none;"></p>
          </div>
        </div>
      </div>
    </section>
  `,j(),Y()}function Y(){var z,P,L,q,A,F;const E=document.getElementById("auth-error"),C=document.getElementById("submit-btn");function S(e){E&&(E.textContent=e,E.style.display="block")}document.querySelectorAll(".password-toggle").forEach(e=>{e.addEventListener("click",()=>{const s=document.getElementById(e.dataset.target),a=s.type==="password";s.type=a?"text":"password"})}),(z=document.getElementById("toggle-auth"))==null||z.addEventListener("click",e=>{var s;e.preventDefault(),l=!l,B=!1,c=0,(s=document.querySelector(".footer"))==null||s.remove(),$()}),(P=document.getElementById("auth-form"))==null||P.addEventListener("submit",async e=>{var d;e.preventDefault();const s=document.getElementById("auth-email").value,a=document.getElementById("auth-password").value;E.style.display="none",C.disabled=!0;try{if(l){const i=document.getElementById("auth-confirm").value;if(a!==i)throw new Error("Passwords do not match.");const n=s.toLowerCase().trim(),r=await w(y(b(o,"coaches"),v("email","==",n))),g=await w(y(b(o,"families"),v("email","==",n)));let f=null,u=null,p=null;if(r.empty?g.empty||(u=g.docs[0],p="families",f="swimmer"):(u=r.docs[0],p="coaches",f=u.data().role||"coach"),!u)throw new Error(t("signup_unauthorized"));const h=(await Q(_,s,a)).user;if(await U(m(o,"users",h.uid),{email:s,role:f,createdAt:new Date}),await x(m(o,p,u.id),{status:p==="coaches"?"active":"registered",registeredUid:h.uid}),f==="coach"||f==="admin")window.location.href="/dashboard.html";else{const H=y(b(o,"registrations"),v("parentEmails","array-contains",n)),M=await w(H);if(M.empty)window.location.href="/registration.html";else{const T=M.docs[0],D=T.data().editors||[];D.includes(h.uid)||(D.push(h.uid),await x(m(o,"registrations",T.id),{editors:D})),window.location.href="/dashboard.html"}}}else try{const i=await G(_,s,a),n=s.toLowerCase().trim(),r=await I(m(o,"users",i.user.uid)),g=r.exists()?r.data().role:null;if(g==="coach"||g==="admin"){window.location.href="/dashboard.html";return}if((await I(m(o,"registrations",i.user.uid))).exists())window.location.href="/dashboard.html";else{const u=y(b(o,"registrations"),v("parentEmails","array-contains",n));(await w(u)).empty?window.location.href="/registration.html":window.location.href="/dashboard.html"}}catch(i){throw i.code==="auth/wrong-password"||i.code==="auth/invalid-credential"?new Error("Wrong password. Please try again."):i}}catch(i){console.error(i),l||c++,c>=3?(S("Too many failed attempts. Please reset your password below."),(d=document.querySelector(".footer"))==null||d.remove(),$()):(S(i.message||"Authentication failed"),C.disabled=!1)}}),(L=document.getElementById("google-signin"))==null||L.addEventListener("click",async()=>{E.style.display="none";try{const e=await N(_,O),a=e.user.email.toLowerCase().trim(),d=await w(y(b(o,"coaches"),v("email","==",a))),i=await w(y(b(o,"families"),v("email","==",a)));let n=null,r=null,g=null;if(d.empty?i.empty||(r=i.docs[0],g="families",n="swimmer"):(r=d.docs[0],g="coaches",n=r.data().role||"coach"),!r)throw await V(_),new Error(t("signup_unauthorized_google"));if(r.data().status==="pending"&&await x(m(o,g,r.id),{status:g==="coaches"?"active":"registered",registeredUid:e.user.uid}),await U(m(o,"users",e.user.uid),{username:e.user.displayName||"Google User",email:e.user.email,role:n,lastLoginAt:new Date},{merge:!0}),n==="coach"||n==="admin")window.location.href="/dashboard.html";else if((await I(m(o,"registrations",e.user.uid))).exists())window.location.href="/dashboard.html";else{const u=y(b(o,"registrations"),v("parentEmails","array-contains",a)),p=await w(u);if(p.empty)window.location.href="/registration.html";else{const k=p.docs[0],h=k.data().editors||[];h.includes(e.user.uid)||(h.push(e.user.uid),await x(m(o,"registrations",k.id),{editors:h})),window.location.href="/dashboard.html"}}}catch(e){console.error(e),e.code==="auth/popup-closed-by-user"?S("Sign-in popup closed before completion."):e.code==="auth/cancelled-popup-request"||S(e.message||"Google sign in failed")}}),(q=document.getElementById("forgot-link"))==null||q.addEventListener("click",e=>{var s;e.preventDefault(),B=!0,c=0,(s=document.querySelector(".footer"))==null||s.remove(),$()}),(A=document.getElementById("forgot-form"))==null||A.addEventListener("submit",async e=>{e.preventDefault();const s=document.getElementById("forgot-email").value,a=document.getElementById("auth-error"),d=document.getElementById("forgot-success"),i=document.getElementById("forgot-submit-btn");a&&(a.style.display="none"),d&&(d.style.display="none"),i&&(i.disabled=!0);try{await J(_,s),d&&(d.textContent=t("signin_forgot_success"),d.style.display="block")}catch(n){console.error("Password reset error:",n),a&&(a.textContent=n.code==="auth/user-not-found"?t("signin_forgot_error"):n.message||t("signin_forgot_error"),a.style.display="block")}finally{i&&(i.disabled=!1)}}),(F=document.getElementById("forgot-back"))==null||F.addEventListener("click",e=>{var s;e.preventDefault(),B=!1,c=0,(s=document.querySelector(".footer"))==null||s.remove(),$()})}$();
