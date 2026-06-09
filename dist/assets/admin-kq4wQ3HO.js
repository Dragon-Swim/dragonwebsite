import{i as E}from"./theme-toggle-CI3g1rpd.js";import{a as C,r as N}from"./footer-Ca1bpEjX.js";import{o as A,h as I,g as $,e as p,b,n as B,a as D,c as g,q as S,k as T,j as L}from"./firebase-B6pM3H1n.js";E();C();let y=null,d="create";const O=document.getElementById("app");A(b,async n=>{if(!n){window.location.href="/dragonwebsite/signin.html";return}const i=await I($(p,"users",n.uid));if((i.exists()?i.data().role:null)!=="admin"){window.location.href="/dragonwebsite/dashboard.html";return}y=n,v()});function v(){O.innerHTML=`
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <div class="admin-sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <nav class="admin-nav">
          <button class="admin-nav-item ${d==="create"?"active":""}" data-tab="create">
            ➕ Create Coach
          </button>
          <button class="admin-nav-item ${d==="manage"?"active":""}" data-tab="manage">
            👥 Manage Coaches
          </button>
        </nav>
        <div class="admin-sidebar-footer">
          <a href="/dragonwebsite/dashboard.html" class="admin-nav-item">← Back to Dashboard</a>
          <button class="admin-nav-item" id="admin-signout" style="color: var(--color-accent);">🚪 Sign Out</button>
        </div>
      </aside>

      <main class="admin-main">
        <header class="admin-topbar">
          <h1 class="admin-page-title">${d==="create"?"Create Coach Account":"Manage Coaches"}</h1>
        </header>
        <div class="admin-content">
          ${d==="create"?x():P()}
        </div>
      </main>
    </div>
  `,q(),N()}function x(){return`
    <div class="admin-panel">
      <h3>New Coach</h3>
      <p class="admin-hint">Fill in the coach's details. The account will be created immediately.</p>
      <form id="coach-form" class="admin-form">
        <div class="form-group">
          <label class="form-label" for="coach-email">Email *</label>
          <input class="form-input" type="email" id="coach-email" placeholder="coach@example.com" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="coach-name">Display Name *</label>
          <input class="form-input" type="text" id="coach-name" placeholder="e.g. Coach Thompson" required />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="coach-password">Temporary Password *</label>
            <input class="form-input" type="password" id="coach-password" placeholder="••••••••" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="coach-confirm">Confirm Password *</label>
            <input class="form-input" type="password" id="coach-confirm" placeholder="••••••••" required />
          </div>
        </div>
        <button type="submit" class="btn btn-primary" id="create-coach-btn">Create Coach</button>
        <p id="coach-form-message" class="admin-form-message"></p>
      </form>
    </div>
  `}function P(){return`
    <div class="admin-panel">
      <div class="admin-panel-header">
        <h3>All Coach Accounts</h3>
        <span class="admin-badge" id="pending-count">0 pending</span>
      </div>
      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody id="coach-table-body">
            <tr><td colspan="4" class="admin-empty">Loading...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `}function q(){var i;document.querySelectorAll(".admin-nav-item[data-tab]").forEach(t=>{t.addEventListener("click",()=>{d=t.dataset.tab,v()})}),(i=document.getElementById("admin-signout"))==null||i.addEventListener("click",async()=>{await B(b),window.location.href="/dragonwebsite/signin.html"});const n=document.getElementById("coach-form");if(n&&n.addEventListener("submit",async t=>{var e;t.preventDefault();const a=document.getElementById("coach-form-message"),l=document.getElementById("create-coach-btn"),s=document.getElementById("coach-email").value.trim(),r=document.getElementById("coach-name").value.trim(),c=document.getElementById("coach-password").value,u=document.getElementById("coach-confirm").value;if(!s||!r||!c){a.textContent="Please fill in all required fields.",a.className="admin-form-message error";return}if(c!==u){a.textContent="Passwords do not match.",a.className="admin-form-message error";return}if(c.length<6){a.textContent="Password must be at least 6 characters.",a.className="admin-form-message error";return}l.disabled=!0,a.textContent="";try{const o=await fetch("https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBNJKy8UMCzlGjFjEoOesNsIcwQKJnIROA",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:s,password:c,returnSecureToken:!1})});if(!o.ok){const f=((e=(await o.json()).error)==null?void 0:e.message)||"UNKNOWN",w={EMAIL_EXISTS:"A user with this email already exists.",WEAK_PASSWORD:"Password must be at least 6 characters.",INVALID_EMAIL:"Invalid email address.",OPERATION_NOT_ALLOWED:"New accounts are currently disabled. Contact support."};throw new Error(w[f]||`Auth error: ${f}`)}await D(g(p,"coaches"),{email:s,displayName:r,status:"active",createdBy:y.uid,createdAt:new Date}),a.textContent=`Coach "${r}" (${s}) added successfully.`,a.className="admin-form-message success",n.reset()}catch(m){a.textContent=`Error: ${m.message}`,a.className="admin-form-message error"}l.disabled=!1}),d==="manage"){const t=document.getElementById("coach-table-body"),a=document.getElementById("pending-count");if(!t)return;const l=S(g(p,"coaches"),T("createdAt","desc"));L(l,s=>{let r=0;const c=s.docs.map(u=>{var o,h;const e=u.data();e.status==="pending"&&r++;const m=((h=(o=e.createdAt)==null?void 0:o.toDate)==null?void 0:h.call(o))||new Date(e.createdAt);return`
          <tr>
            <td>${e.email||"—"}</td>
            <td>${e.displayName||"—"}</td>
            <td><span class="admin-status admin-status-${e.status}">${e.status}</span></td>
            <td>${m.toLocaleDateString()}</td>
          </tr>
        `}).join("");t.innerHTML=c||'<tr><td colspan="4" class="admin-empty">No coaches yet.</td></tr>',a.textContent=`${r} pending`},s=>{t.innerHTML=`<tr><td colspan="4" class="admin-empty">Error loading: ${s.message}</td></tr>`})}}
