import{i as Q,t as o}from"./i18n-DIN1ScE8.js";import{a as O,r as Z}from"./footer-BdAPnbv4.js";import{i as w,q as y,c as b,e as i,w as v,d as N,b as x,m as H,g as u,u as S,n as V,h as A,p as Y,j as J,t as K,s as X}from"./firebase-CorBctTj.js";Q();O();const ee=new URLSearchParams(window.location.search);let m=ee.get("mode")==="signup",I=!1,h=0;const te=document.getElementById("app");function C(){te.innerHTML=`
    <section class="section signin-section">
      <div class="container">
        <div class="signin-wrapper">
          <div class="signin-card">
            ${I?`
            <!-- Forgot Password Header -->
            <div class="signin-header">
              <div class="signin-logo">
                <img src="/logo-light.jpg" alt="Dragon Swim Team" class="nav-logo-img light-logo" style="height:60px" />
                <img src="/logo-dark.png" alt="Dragon Swim Team" class="nav-logo-img dark-logo" style="height:60px" />
              </div>
              <h1 class="signin-title">${o("signin_forgot_title")}</h1>
              <p class="signin-subtitle">${o("signin_forgot_subtitle")}</p>
            </div>

            <!-- Forgot Password Form -->
            <form class="signin-form" id="forgot-form">
              <div class="form-group">
                <label class="form-label" for="forgot-email">${o("signin_forgot_email")}</label>
                <input class="form-input" type="email" id="forgot-email" placeholder="you@example.com" required />
              </div>
              <button type="submit" class="btn btn-primary btn-lg signin-submit" style="width: 100%;" id="forgot-submit-btn">
                ${o("signin_forgot_btn")}
              </button>
            </form>

            <!-- Success message (hidden by default) -->
            <p id="forgot-success" style="display: none; color: #16A34A; font-size: 14px; text-align: center; margin-top: 10px;"></p>

            <!-- Back to sign in -->
            <div class="signin-toggle">
              <a href="#" id="forgot-back">${o("signin_forgot_back")}</a>
            </div>
            `:`
            <div class="signin-header">
              <div class="signin-logo">
                <img src="/logo-light.jpg" alt="Dragon Swim Team" class="nav-logo-img light-logo" style="height:60px" />
                <img src="/logo-dark.png" alt="Dragon Swim Team" class="nav-logo-img dark-logo" style="height:60px" />
              </div>
              <h1 class="signin-title">${m?o("signup_title"):o("signin_title")}</h1>
              <p class="signin-subtitle">${o("signin_subtitle")}</p>
            </div>

            <form class="signin-form" id="auth-form">
              ${m?`
              `:""}
              <div class="form-group">
                <label class="form-label" for="auth-email">${m?o("signup_email"):o("signin_email")}</label>
                <input class="form-input" type="email" id="auth-email" placeholder="you@example.com" required ${h>=3?"disabled":""} />
              </div>
              <div class="form-group">
                <label class="form-label" for="auth-password">${m?o("signup_password"):o("signin_password")}</label>
                <div class="password-group">
                  <input class="form-input" type="password" id="auth-password" placeholder="••••••••" required ${h>=3?"disabled":""} />
                  <button type="button" class="password-toggle" data-target="auth-password" aria-label="Show password" ${h>=3?"disabled":""}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
              </div>
              ${m?`
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
                  <label class="form-label" for="auth-confirm">${o("signup_confirm")}</label>
                  <div class="password-group">
                    <input class="form-input" type="password" id="auth-confirm" placeholder="••••••••" required />
                    <button type="button" class="password-toggle" data-target="auth-confirm" aria-label="Show password">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                  </div>
                </div>
              `:""}
              ${m?"":`
                <div class="signin-forgot">
                  <a href="#" id="forgot-link"${h>=3?' style="color: #F59E0B; font-weight: 700; font-size: 1.05em; text-decoration: underline; animation: pulse 1.5s infinite;"':""}>${h>=3?"⚠ ":""}${o("signin_forgot")}</a>
                </div>
              `}
              <button type="submit" class="btn btn-primary btn-lg signin-submit" id="submit-btn" style="width: 100%;" ${h>=3?"disabled":""}>
                ${m?o("signup_btn"):o("signin_btn")}
              </button>
            </form>

            <div class="signin-divider">
              <span>or</span>
            </div>

            <button class="btn btn-outline btn-lg signin-google" id="google-signin">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              ${o("signin_google")}
            </button>

            <div class="signin-toggle">
              ${m?`${o("signup_has_account")} <a href="#" id="toggle-auth">${o("signup_signin_link")}</a>`:`${o("signin_no_account")} <a href="#" id="toggle-auth">${o("signin_signup_link")}</a>`}
            </div>
            `}

            <p id="auth-error" style="color:red; font-size: 14px; text-align: center; margin-top: 10px; display: none;"></p>
          </div>
        </div>
      </div>
    </section>
  `,Z(),se()}function se(){var q,F,L,R,T,M,U;const k=document.getElementById("auth-error"),P=document.getElementById("submit-btn");function _(e){k&&(k.textContent=e,k.style.display="block")}document.querySelectorAll(".password-toggle").forEach(e=>{e.addEventListener("click",()=>{const a=document.getElementById(e.dataset.target),t=a.type==="password";a.type=t?"text":"password"})});function W(e){const a=document.getElementById("pw-strength"),t=document.getElementById("pw-bar-fill"),r=document.getElementById("pw-label");if(!a||!t||!r)return;if(!e){a.style.display="none";return}a.style.display="block";const s={length:e.length>=8,upper:/[A-Z]/.test(e),lower:/[a-z]/.test(e),digit:/[0-9]/.test(e),special:/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(e)};let n=0;for(const[l,$]of Object.entries(s)){const d=document.querySelector(`.password-strength-rule[data-rule="${l}"]`);if(!d)continue;const c=d.querySelector(".rule-icon");$?(c.textContent="✅",d.style.color="#16A34A",n++):(c.textContent="❌",d.style.color="")}const g=n/5*100;t.style.width=g+"%",n<=2?(t.style.background="#DC2626",r.textContent="Weak",r.style.color="#DC2626"):n<=4?(t.style.background="#F59E0B",r.textContent="Fair",r.style.color="#F59E0B"):(t.style.background="#16A34A",r.textContent="Strong",r.style.color="#16A34A")}(q=document.getElementById("auth-password"))==null||q.addEventListener("input",e=>{W(e.target.value)}),(F=document.getElementById("toggle-auth"))==null||F.addEventListener("click",e=>{var a;e.preventDefault(),m=!m,I=!1,h=0,(a=document.querySelector(".footer"))==null||a.remove(),C()}),(L=document.getElementById("auth-form"))==null||L.addEventListener("submit",async e=>{var r;e.preventDefault();const a=document.getElementById("auth-email").value,t=document.getElementById("auth-password").value;k.style.display="none",P.disabled=!0;try{if(m){const s=document.getElementById("auth-confirm").value;if(t!==s)throw new Error("Passwords do not match.");const n={length:t.length>=8,upper:/[A-Z]/.test(t),lower:/[a-z]/.test(t),digit:/[0-9]/.test(t),special:/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(t)};if(Object.values(n).filter(Boolean).length<5)throw new Error("Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.");const l=a.toLowerCase().trim(),$=await w(y(b(i,"coaches"),v("email","==",l))),d=await w(y(b(i,"families"),v("email","==",l)));let c=null,p=null,f=null;if($.empty?d.empty||(p=d.docs[0],f="families",c="swimmer"):(p=$.docs[0],f="coaches",c=p.data().role||"coach"),!p)throw new Error(o("signup_unauthorized"));const E=(await N(x,a,t)).user;if(await H(u(i,"users",E.uid),{email:a,role:c,createdAt:new Date}),await S(u(i,f,p.id),{status:f==="coaches"?"active":"registered",registeredUid:E.uid}),c==="coach"||c==="admin")window.location.href="/dashboard.html";else{const B=y(b(i,"registrations"),v("parentEmails","array-contains",l)),j=await w(B);if(j.empty)window.location.href="/registration.html";else{const G=j.docs[0],D=G.data().editors||[];D.includes(E.uid)||(D.push(E.uid),await S(u(i,"registrations",G.id),{editors:D})),window.location.href="/dashboard.html"}}}else try{const s=await V(x,a,t),n=a.toLowerCase().trim(),g=await A(u(i,"users",s.user.uid)),l=g.exists()?g.data().role:null;if(l==="removed"){const d=await w(y(b(i,"coaches"),v("email","==",n))),c=await w(y(b(i,"families"),v("email","==",n)));if(!d.empty){const p=d.docs[0].data().role||"coach";await S(u(i,"users",s.user.uid),{role:p}),window.location.href="/dashboard.html";return}if(!c.empty){if(await S(u(i,"users",s.user.uid),{role:"swimmer"}),(await A(u(i,"registrations",s.user.uid))).exists()){window.location.href="/dashboard.html";return}const f=y(b(i,"registrations"),v("parentEmails","array-contains",n)),z=await w(f);if(!z.empty){const E=z.docs[0],B=E.data().editors||[];B.includes(s.user.uid)||(B.push(s.user.uid),await S(u(i,"registrations",E.id),{editors:B})),window.location.href="/dashboard.html";return}window.location.href="/registration.html";return}throw new Error("Your access has been revoked. Please contact admin@dragonswim.com.")}if(l==="coach"||l==="admin"){window.location.href="/dashboard.html";return}if((await A(u(i,"registrations",s.user.uid))).exists())window.location.href="/dashboard.html";else{const d=y(b(i,"registrations"),v("parentEmails","array-contains",n));(await w(d)).empty?window.location.href="/registration.html":window.location.href="/dashboard.html"}}catch(s){throw s.code==="auth/wrong-password"||s.code==="auth/invalid-credential"?new Error("Wrong password. Please try again."):s}}catch(s){console.error(s),m||h++,h>=3?(_("Too many failed attempts. Please reset your password below."),(r=document.querySelector(".footer"))==null||r.remove(),C()):(_(s.message||"Authentication failed"),P.disabled=!1)}}),(R=document.getElementById("google-signin"))==null||R.addEventListener("click",async()=>{k.style.display="none";try{const e=await Y(x,J),t=e.user.email.toLowerCase().trim(),r=await w(y(b(i,"coaches"),v("email","==",t))),s=await w(y(b(i,"families"),v("email","==",t)));let n=null,g=null,l=null;if(r.empty?s.empty||(g=s.docs[0],l="families",n="swimmer"):(g=r.docs[0],l="coaches",n=g.data().role||"coach"),!g)throw await K(x),new Error(o("signup_unauthorized_google"));if(g.data().status==="pending"&&await S(u(i,l,g.id),{status:l==="coaches"?"active":"registered",registeredUid:e.user.uid}),await H(u(i,"users",e.user.uid),{username:e.user.displayName||"Google User",email:e.user.email,role:n,lastLoginAt:new Date},{merge:!0}),n==="coach"||n==="admin")window.location.href="/dashboard.html";else if((await A(u(i,"registrations",e.user.uid))).exists())window.location.href="/dashboard.html";else{const d=y(b(i,"registrations"),v("parentEmails","array-contains",t)),c=await w(d);if(c.empty)window.location.href="/registration.html";else{const p=c.docs[0],f=p.data().editors||[];f.includes(e.user.uid)||(f.push(e.user.uid),await S(u(i,"registrations",p.id),{editors:f})),window.location.href="/dashboard.html"}}}catch(e){console.error("Google sign-in error:",e.code,e.message),e.code==="auth/popup-closed-by-user"?_("Sign-in popup was closed before completing. Please try again."):e.code==="auth/cancelled-popup-request"?_("Google sign-in was cancelled. This may be due to a popup blocker, or the domain may not be authorized in Firebase Console (Authentication > Settings > Authorized domains)."):e.code==="auth/unauthorized-domain"?_("This domain is not authorized for Google sign-in. Please add it in Firebase Console > Authentication > Settings > Authorized domains."):_(e.message||"Google sign in failed")}}),(T=document.getElementById("forgot-link"))==null||T.addEventListener("click",e=>{var a;e.preventDefault(),I=!0,h=0,(a=document.querySelector(".footer"))==null||a.remove(),C()}),(M=document.getElementById("forgot-form"))==null||M.addEventListener("submit",async e=>{e.preventDefault();const a=document.getElementById("forgot-email").value,t=document.getElementById("auth-error"),r=document.getElementById("forgot-success"),s=document.getElementById("forgot-submit-btn");t&&(t.style.display="none"),r&&(r.style.display="none"),s&&(s.disabled=!0);try{await X(x,a),r&&(r.textContent=o("signin_forgot_success"),r.style.display="block")}catch(n){console.error("Password reset error:",n),t&&(t.textContent=n.code==="auth/user-not-found"?o("signin_forgot_error"):n.message||o("signin_forgot_error"),t.style.display="block")}finally{s&&(s.disabled=!1)}}),(U=document.getElementById("forgot-back"))==null||U.addEventListener("click",e=>{var a;e.preventDefault(),I=!1,h=0,(a=document.querySelector(".footer"))==null||a.remove(),C()})}C();
