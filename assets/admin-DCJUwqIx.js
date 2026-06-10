import{i as I}from"./theme-toggle-CI3g1rpd.js";import{a as N,r as D}from"./footer-Ca1bpEjX.js";import{o as $,h as B,g,e as f,b as C,n as L,s as w,q as S,k as T,c as O,j as x}from"./firebase-B6pM3H1n.js";I();N();let v=null,d="create";const P=document.getElementById("app");$(C,async n=>{if(!n){window.location.href="/dragonwebsite/signin.html";return}const i=await B(g(f,"users",n.uid));if((i.exists()?i.data().role:null)!=="admin"){window.location.href="/dragonwebsite/dashboard.html";return}v=n,E()});function E(){P.innerHTML=`
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
          ${d==="create"?q():k()}
        </div>
      </main>
    </div>
  `,M(),D()}function q(){return`
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
        <div class="form-group">
          <label class="form-label" for="coach-role">Role *</label>
          <select class="form-input" id="coach-role" required>
            <option value="coach">Coach (no admin access)</option>
            <option value="admin">Admin Coach (can manage coaches)</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary" id="create-coach-btn">Create Coach</button>
        <p id="coach-form-message" class="admin-form-message"></p>
      </form>
    </div>
  `}function k(){return`
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
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody id="coach-table-body">
            <tr><td colspan="5" class="admin-empty">Loading...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `}function M(){var i;document.querySelectorAll(".admin-nav-item[data-tab]").forEach(t=>{t.addEventListener("click",()=>{d=t.dataset.tab,E()})}),(i=document.getElementById("admin-signout"))==null||i.addEventListener("click",async()=>{await L(C),window.location.href="/dragonwebsite/signin.html"});const n=document.getElementById("coach-form");if(n&&n.addEventListener("submit",async t=>{var h;t.preventDefault();const a=document.getElementById("coach-form-message"),u=document.getElementById("create-coach-btn"),s=document.getElementById("coach-email").value.trim(),o=document.getElementById("coach-name").value.trim(),r=document.getElementById("coach-password").value,b=document.getElementById("coach-confirm").value,e=document.getElementById("coach-role").value;if(!s||!o||!r){a.textContent="Please fill in all required fields.",a.className="admin-form-message error";return}if(r!==b){a.textContent="Passwords do not match.",a.className="admin-form-message error";return}if(r.length<6){a.textContent="Password must be at least 6 characters.",a.className="admin-form-message error";return}u.disabled=!0,a.textContent="";try{const l=await fetch("https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBNJKy8UMCzlGjFjEoOesNsIcwQKJnIROA",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:s,password:r,returnSecureToken:!1})});if(!l.ok){const y=((h=(await l.json()).error)==null?void 0:h.message)||"UNKNOWN",A={EMAIL_EXISTS:"A user with this email already exists.",WEAK_PASSWORD:"Password must be at least 6 characters.",INVALID_EMAIL:"Invalid email address.",OPERATION_NOT_ALLOWED:"New accounts are currently disabled. Contact support."};throw new Error(A[y]||`Auth error: ${y}`)}const c=(await l.json()).localId;if(!c)throw new Error("Auth account created but no UID returned. Please check the response.");await w(g(f,"users",c),{email:s,displayName:o,role:e,createdBy:v.uid,createdAt:new Date}),await w(g(f,"coaches",c),{uid:c,email:s,displayName:o,role:e,status:"active",createdBy:v.uid,createdAt:new Date}),a.textContent=`Coach "${o}" (${s}) added successfully.`,a.className="admin-form-message success",n.reset()}catch(p){a.textContent=`Error: ${p.message}`,a.className="admin-form-message error"}u.disabled=!1}),d==="manage"){const t=document.getElementById("coach-table-body"),a=document.getElementById("pending-count");if(!t)return;const u=S(O(f,"coaches"),T("createdAt","desc"));x(u,s=>{let o=0;const r=s.docs.map(b=>{var m,c;const e=b.data();e.status==="pending"&&o++;const h=((c=(m=e.createdAt)==null?void 0:m.toDate)==null?void 0:c.call(m))||new Date(e.createdAt),p=e.role==="admin"?"Admin Coach":"Coach",l=e.role==="admin"?"admin-role-admin":"admin-role-coach";return`
          <tr>
            <td>${e.email||"—"}</td>
            <td>${e.displayName||"—"}</td>
            <td><span class="admin-role-badge ${l}">${p}</span></td>
            <td><span class="admin-status admin-status-${e.status}">${e.status}</span></td>
            <td>${h.toLocaleDateString()}</td>
          </tr>
        `}).join("");t.innerHTML=r||'<tr><td colspan="5" class="admin-empty">No coaches yet.</td></tr>',a.textContent=`${o} pending`},s=>{t.innerHTML=`<tr><td colspan="5" class="admin-empty">Error loading: ${s.message}</td></tr>`})}}
