import{i as O,t as s}from"./i18n-DIN1ScE8.js";import{a as Q,r as Z}from"./footer-Cg_RfItd.js";import{i as w,q as y,c as b,e as r,w as v,d as G,b as $,m as j,g as m,u as x,n as N,h as D,p as V,j as J,t as K,s as X}from"./firebase-CorBctTj.js";O();Q();const Y=new URLSearchParams(window.location.search);let u=Y.get("mode")==="signup",C=!1,p=0;const ee=document.getElementById("app");function B(){ee.innerHTML=`
    <section class="section signin-section">
      <div class="container">
        <div class="signin-wrapper">
          <div class="signin-card">
            ${C?`
            <!-- Forgot Password Header -->
            <div class="signin-header">
              <div class="signin-logo">
                <img src="/logo-light.jpg" alt="Dragon Swim Team" class="nav-logo-img light-logo" style="height:60px" />
                <img src="/logo-dark.png" alt="Dragon Swim Team" class="nav-logo-img dark-logo" style="height:60px" />
              </div>
              <h1 class="signin-title">${s("signin_forgot_title")}</h1>
              <p class="signin-subtitle">${s("signin_forgot_subtitle")}</p>
            </div>

            <!-- Forgot Password Form -->
            <form class="signin-form" id="forgot-form">
              <div class="form-group">
                <label class="form-label" for="forgot-email">${s("signin_forgot_email")}</label>
                <input class="form-input" type="email" id="forgot-email" placeholder="you@example.com" required />
              </div>
              <button type="submit" class="btn btn-primary btn-lg signin-submit" style="width: 100%;" id="forgot-submit-btn">
                ${s("signin_forgot_btn")}
              </button>
            </form>

            <!-- Success message (hidden by default) -->
            <p id="forgot-success" style="display: none; color: #16A34A; font-size: 14px; text-align: center; margin-top: 10px;"></p>

            <!-- Back to sign in -->
            <div class="signin-toggle">
              <a href="#" id="forgot-back">${s("signin_forgot_back")}</a>
            </div>
            `:`
            <div class="signin-header">
              <div class="signin-logo">
                <img src="/logo-light.jpg" alt="Dragon Swim Team" class="nav-logo-img light-logo" style="height:60px" />
                <img src="/logo-dark.png" alt="Dragon Swim Team" class="nav-logo-img dark-logo" style="height:60px" />
              </div>
              <h1 class="signin-title">${u?s("signup_title"):s("signin_title")}</h1>
              <p class="signin-subtitle">${s("signin_subtitle")}</p>
            </div>

            <form class="signin-form" id="auth-form">
              ${u?`
              `:""}
              <div class="form-group">
                <label class="form-label" for="auth-email">${u?s("signup_email"):s("signin_email")}</label>
                <input class="form-input" type="email" id="auth-email" placeholder="you@example.com" required ${p>=3?"disabled":""} />
              </div>
              <div class="form-group">
                <label class="form-label" for="auth-password">${u?s("signup_password"):s("signin_password")}</label>
                <div class="password-group">
                  <input class="form-input" type="password" id="auth-password" placeholder="••••••••" required ${p>=3?"disabled":""} />
                  <button type="button" class="password-toggle" data-target="auth-password" aria-label="Show password" ${p>=3?"disabled":""}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
              </div>
              ${u?`
                <div class="password-strength-meter" id="pw-strength" style="display:none;">
                  <div class="password-strength-rules">
                    <span class="password-strength-rule" data-rule="length"><span class="rule-icon">❌</span> 8+ chars</span>
                    <span class="password-strength-rule" data-rule="upper"><span class="rule-icon">❌</span> A-Z</span>
                    <span class="password-strength-rule" data-rule="lower"><span class="rule-icon">❌</span> a-z</span>
                    <span class="password-strength-rule" data-rule="digit"><span class="rule-icon">❌</span> 0-9</span>
                    <span class="password-strength-rule" data-rule="special"><span class="rule-icon">❌</span> !@#$</span>
                  </div>
                  <div class="password-strength-bar">
                    <div class="password-strength-bar-fill" id="pw-bar-fill" style="width: 0%;"></div>
                  </div>
                  <div class="password-strength-label" id="pw-label"></div>
                </div>
                <div class="form-group">
                  <label class="form-label" for="auth-confirm">${s("signup_confirm")}</label>
                  <div class="password-group">
                    <input class="form-input" type="password" id="auth-confirm" placeholder="••••••••" required />
                    <button type="button" class="password-toggle" data-target="auth-confirm" aria-label="Show password">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                  </div>
                </div>
              `:""}
              ${u?"":`
                <div class="signin-forgot">
                  <a href="#" id="forgot-link"${p>=3?' style="color: #F59E0B; font-weight: 700; font-size: 1.05em; text-decoration: underline; animation: pulse 1.5s infinite;"':""}>${p>=3?"⚠ ":""}${s("signin_forgot")}</a>
                </div>
              `}
              <button type="submit" class="btn btn-primary btn-lg signin-submit" id="submit-btn" style="width: 100%;" ${p>=3?"disabled":""}>
                ${u?s("signup_btn"):s("signin_btn")}
              </button>
            </form>

            <div class="signin-divider">
              <span>or</span>
            </div>

            <button class="btn btn-outline btn-lg signin-google" id="google-signin">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              ${s("signin_google")}
            </button>

            <div class="signin-toggle">
              ${u?`${s("signup_has_account")} <a href="#" id="toggle-auth">${s("signup_signin_link")}</a>`:`${s("signin_no_account")} <a href="#" id="toggle-auth">${s("signin_signup_link")}</a>`}
            </div>
            `}

            <p id="auth-error" style="color:red; font-size: 14px; text-align: center; margin-top: 10px; display: none;"></p>
          </div>
        </div>
      </div>
    </section>
  `,Z(),te()}function te(){var P,z,q,L,F,M,T;const _=document.getElementById("auth-error"),A=document.getElementById("submit-btn");function S(e){_&&(_.textContent=e,_.style.display="block")}document.querySelectorAll(".password-toggle").forEach(e=>{e.addEventListener("click",()=>{const o=document.getElementById(e.dataset.target),t=o.type==="password";o.type=t?"text":"password"})});function H(e){const o=document.getElementById("pw-strength"),t=document.getElementById("pw-bar-fill"),i=document.getElementById("pw-label");if(!o||!t||!i)return;if(!e){o.style.display="none";return}o.style.display="block";const a={length:e.length>=8,upper:/[A-Z]/.test(e),lower:/[a-z]/.test(e),digit:/[0-9]/.test(e),special:/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(e)};let n=0;for(const[l,E]of Object.entries(a)){const g=document.querySelector(`.password-strength-rule[data-rule="${l}"]`);if(!g)continue;const c=g.querySelector(".rule-icon");E?(c.textContent="✅",g.style.color="#16A34A",n++):(c.textContent="❌",g.style.color="")}const d=n/5*100;t.style.width=d+"%",n<=2?(t.style.background="#DC2626",i.textContent="Weak",i.style.color="#DC2626"):n<=4?(t.style.background="#F59E0B",i.textContent="Fair",i.style.color="#F59E0B"):(t.style.background="#16A34A",i.textContent="Strong",i.style.color="#16A34A")}(P=document.getElementById("auth-password"))==null||P.addEventListener("input",e=>{H(e.target.value)}),(z=document.getElementById("toggle-auth"))==null||z.addEventListener("click",e=>{var o;e.preventDefault(),u=!u,C=!1,p=0,(o=document.querySelector(".footer"))==null||o.remove(),B()}),(q=document.getElementById("auth-form"))==null||q.addEventListener("submit",async e=>{var i;e.preventDefault();const o=document.getElementById("auth-email").value,t=document.getElementById("auth-password").value;_.style.display="none",A.disabled=!0;try{if(u){const a=document.getElementById("auth-confirm").value;if(t!==a)throw new Error("Passwords do not match.");const n={length:t.length>=8,upper:/[A-Z]/.test(t),lower:/[a-z]/.test(t),digit:/[0-9]/.test(t),special:/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(t)};if(Object.values(n).filter(Boolean).length<5)throw new Error("Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.");const l=o.toLowerCase().trim(),E=await w(y(b(r,"coaches"),v("email","==",l))),g=await w(y(b(r,"families"),v("email","==",l)));let c=null,h=null,f=null;if(E.empty?g.empty||(h=g.docs[0],f="families",c="swimmer"):(h=E.docs[0],f="coaches",c=h.data().role||"coach"),!h)throw new Error(s("signup_unauthorized"));const k=(await G($,o,t)).user;if(await j(m(r,"users",k.uid),{email:o,role:c,createdAt:new Date}),await x(m(r,f,h.id),{status:f==="coaches"?"active":"registered",registeredUid:k.uid}),c==="coach"||c==="admin")window.location.href="/dashboard.html";else{const W=y(b(r,"registrations"),v("parentEmails","array-contains",l)),R=await w(W);if(R.empty)window.location.href="/registration.html";else{const U=R.docs[0],I=U.data().editors||[];I.includes(k.uid)||(I.push(k.uid),await x(m(r,"registrations",U.id),{editors:I})),window.location.href="/dashboard.html"}}}else try{const a=await N($,o,t),n=o.toLowerCase().trim(),d=await D(m(r,"users",a.user.uid)),l=d.exists()?d.data().role:null;if(l==="coach"||l==="admin"){window.location.href="/dashboard.html";return}if((await D(m(r,"registrations",a.user.uid))).exists())window.location.href="/dashboard.html";else{const g=y(b(r,"registrations"),v("parentEmails","array-contains",n));(await w(g)).empty?window.location.href="/registration.html":window.location.href="/dashboard.html"}}catch(a){throw a.code==="auth/wrong-password"||a.code==="auth/invalid-credential"?new Error("Wrong password. Please try again."):a}}catch(a){console.error(a),u||p++,p>=3?(S("Too many failed attempts. Please reset your password below."),(i=document.querySelector(".footer"))==null||i.remove(),B()):(S(a.message||"Authentication failed"),A.disabled=!1)}}),(L=document.getElementById("google-signin"))==null||L.addEventListener("click",async()=>{_.style.display="none";try{const e=await V($,J),t=e.user.email.toLowerCase().trim(),i=await w(y(b(r,"coaches"),v("email","==",t))),a=await w(y(b(r,"families"),v("email","==",t)));let n=null,d=null,l=null;if(i.empty?a.empty||(d=a.docs[0],l="families",n="swimmer"):(d=i.docs[0],l="coaches",n=d.data().role||"coach"),!d)throw await K($),new Error(s("signup_unauthorized_google"));if(d.data().status==="pending"&&await x(m(r,l,d.id),{status:l==="coaches"?"active":"registered",registeredUid:e.user.uid}),await j(m(r,"users",e.user.uid),{username:e.user.displayName||"Google User",email:e.user.email,role:n,lastLoginAt:new Date},{merge:!0}),n==="coach"||n==="admin")window.location.href="/dashboard.html";else if((await D(m(r,"registrations",e.user.uid))).exists())window.location.href="/dashboard.html";else{const g=y(b(r,"registrations"),v("parentEmails","array-contains",t)),c=await w(g);if(c.empty)window.location.href="/registration.html";else{const h=c.docs[0],f=h.data().editors||[];f.includes(e.user.uid)||(f.push(e.user.uid),await x(m(r,"registrations",h.id),{editors:f})),window.location.href="/dashboard.html"}}}catch(e){console.error(e),e.code==="auth/popup-closed-by-user"?S("Sign-in popup closed before completion."):e.code==="auth/cancelled-popup-request"||S(e.message||"Google sign in failed")}}),(F=document.getElementById("forgot-link"))==null||F.addEventListener("click",e=>{var o;e.preventDefault(),C=!0,p=0,(o=document.querySelector(".footer"))==null||o.remove(),B()}),(M=document.getElementById("forgot-form"))==null||M.addEventListener("submit",async e=>{e.preventDefault();const o=document.getElementById("forgot-email").value,t=document.getElementById("auth-error"),i=document.getElementById("forgot-success"),a=document.getElementById("forgot-submit-btn");t&&(t.style.display="none"),i&&(i.style.display="none"),a&&(a.disabled=!0);try{await X($,o),i&&(i.textContent=s("signin_forgot_success"),i.style.display="block")}catch(n){console.error("Password reset error:",n),t&&(t.textContent=n.code==="auth/user-not-found"?s("signin_forgot_error"):n.message||s("signin_forgot_error"),t.style.display="block")}finally{a&&(a.disabled=!1)}}),(T=document.getElementById("forgot-back"))==null||T.addEventListener("click",e=>{var o;e.preventDefault(),C=!1,p=0,(o=document.querySelector(".footer"))==null||o.remove(),B()})}B();
