import{i as y}from"./theme-toggle-CI3g1rpd.js";import{a as w,r as C}from"./footer-Ca1bpEjX.js";import{o as E,h as B,g as $,e as h,b as g,n as A,a as I,c as p,q as N,k as q,j as x}from"./firebase-B6pM3H1n.js";y();w();let b=null,d="create";const D=document.getElementById("app");E(g,async n=>{if(!n){window.location.href="/dragonwebsite/signin.html";return}const r=await B($(h,"users",n.uid));if((r.exists()?r.data().role:null)!=="admin"){window.location.href="/dragonwebsite/dashboard.html";return}b=n,f()});function f(){D.innerHTML=`
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
          ${d==="create"?T():L()}
        </div>
      </main>
    </div>
  `,S(),C()}function T(){return`
    <div class="admin-panel">
      <h3>New Coach</h3>
      <p class="admin-hint">Fill in the coach's details. The account will be created as "pending" and must be processed via the sync script.</p>
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

    <div class="admin-panel" style="margin-top: 1.5rem;">
      <h3>Sync Instructions</h3>
      <p class="admin-hint">After adding coaches, run this command in your terminal to create their Auth accounts:</p>
      <pre class="admin-code">node scripts/create-coaches.mjs</pre>
      <p class="admin-hint" style="margin-top: 0.5rem;">This requires <code>serviceAccountKey.json</code> in the project root.</p>
    </div>
  `}function L(){return`
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
  `}function S(){var r;document.querySelectorAll(".admin-nav-item[data-tab]").forEach(e=>{e.addEventListener("click",()=>{d=e.dataset.tab,f()})}),(r=document.getElementById("admin-signout"))==null||r.addEventListener("click",async()=>{await A(g),window.location.href="/dragonwebsite/signin.html"});const n=document.getElementById("coach-form");if(n&&n.addEventListener("submit",async e=>{e.preventDefault();const a=document.getElementById("coach-form-message"),i=document.getElementById("create-coach-btn"),s=document.getElementById("coach-email").value.trim(),o=document.getElementById("coach-name").value.trim(),c=document.getElementById("coach-password").value,m=document.getElementById("coach-confirm").value;if(!s||!o||!c){a.textContent="Please fill in all required fields.",a.className="admin-form-message error";return}if(c!==m){a.textContent="Passwords do not match.",a.className="admin-form-message error";return}if(c.length<6){a.textContent="Password must be at least 6 characters.",a.className="admin-form-message error";return}i.disabled=!0,a.textContent="";try{await I(p(h,"coaches"),{email:s,displayName:o,password:c,status:"pending",createdBy:b.uid,createdAt:new Date}),a.textContent=`Coach "${o}" (${s}) added as pending. Run the sync script to activate.`,a.className="admin-form-message success",n.reset()}catch(t){a.textContent=`Error: ${t.message}`,a.className="admin-form-message error"}i.disabled=!1}),d==="manage"){const e=document.getElementById("coach-table-body"),a=document.getElementById("pending-count");if(!e)return;const i=N(p(h,"coaches"),q("createdAt","desc"));x(i,s=>{let o=0;const c=s.docs.map(m=>{var l,u;const t=m.data();t.status==="pending"&&o++;const v=((u=(l=t.createdAt)==null?void 0:l.toDate)==null?void 0:u.call(l))||new Date(t.createdAt);return`
          <tr>
            <td>${t.email||"—"}</td>
            <td>${t.displayName||"—"}</td>
            <td><span class="admin-status admin-status-${t.status}">${t.status}</span></td>
            <td>${v.toLocaleDateString()}</td>
          </tr>
        `}).join("");e.innerHTML=c||'<tr><td colspan="4" class="admin-empty">No coaches yet.</td></tr>',a.textContent=`${o} pending`},s=>{e.innerHTML=`<tr><td colspan="4" class="admin-empty">Error loading: ${s.message}</td></tr>`})}}
