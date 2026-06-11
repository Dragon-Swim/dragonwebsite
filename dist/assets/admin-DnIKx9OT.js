import{i as k}from"./i18n-Do8R_3uV.js";import{a as L,r as O}from"./footer-7sDl51H8.js";import{d as T,A as q}from"./csv-C9YWrFDk.js";import{o as P,h as M,g as w,e as g,q as I,k as $,c as D,j as S,b as N,n as j,s as A}from"./firebase-B6pM3H1n.js";k();L();let x=null,c="create",y=[];const R=document.getElementById("app");P(N,async i=>{if(!i){window.location.href="/dragonwebsite/signin.html";return}const l=await M(w(g,"users",i.uid));if((l.exists()?l.data().role:null)!=="admin"){window.location.href="/dragonwebsite/dashboard.html";return}x=i;const u=I(D(g,"registrations"),$("createdAt","desc"));S(u,a=>{y=a.docs.map(e=>({id:e.id,...e.data()})),c==="export"&&E()}),E()});function E(){R.innerHTML=`
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <div class="admin-sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <nav class="admin-nav">
          <button class="admin-nav-item ${c==="create"?"active":""}" data-tab="create">
            ➕ Create Coach
          </button>
          <button class="admin-nav-item ${c==="manage"?"active":""}" data-tab="manage">
            👥 Manage Coaches
          </button>
          <button class="admin-nav-item ${c==="export"?"active":""}" data-tab="export">
            📥 Export Data
          </button>
        </nav>
        <div class="admin-sidebar-footer">
          <a href="/dragonwebsite/dashboard.html" class="admin-nav-item">← Back to Dashboard</a>
          <button class="admin-nav-item" id="admin-signout" style="color: var(--color-accent);">🚪 Sign Out</button>
        </div>
      </aside>

      <main class="admin-main">
        <header class="admin-topbar">
          <h1 class="admin-page-title">${c==="create"?"Create Coach Account":c==="manage"?"Manage Coaches":"Export Data"}</h1>
        </header>
        <div class="admin-content">
          ${c==="create"?V():c==="manage"?F():K()}
        </div>
      </main>
    </div>
  `,U(),O()}function V(){return`
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
  `}function F(){return`
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
  `}function K(){let i=y.length,l=0;const d={pending:0,active:0,inactive:0};for(const e of y){const t=e.swimmers||[];for(const s of t){if(s.deleted)continue;l++;const n=s.status||"pending";d[n]=(d[n]||0)+1}}const u=["Families","Swimmers","Active","Pending","Inactive"],a=[i,l,d.active||0,d.pending||0,d.inactive||0];return`
    <div class="admin-panel">
      <h3>Export All Registration Data</h3>
      <p class="admin-hint">Download a CSV file with every swimmer and their family contact information.</p>

      <table class="admin-table" style="margin: 1.5rem 0; max-width: 600px;">
        <thead>
          <tr>${u.map(e=>`<th>${e}</th>`).join("")}</tr>
        </thead>
        <tbody>
          <tr>${a.map(e=>`<td style="font-weight: 600; font-size: 1.1rem;">${e}</td>`).join("")}</tr>
        </tbody>
      </table>

      <div class="admin-panel" style="background: var(--bg-secondary, #f9fafb); margin-top: 1.5rem;">
        <h4>CSV Columns</h4>
        <p class="admin-hint">
          One row per swimmer. Families with multiple swimmers appear on multiple rows with the same parent info.
          <button type="button" class="btn btn-outline btn-sm" id="export-select-all" style="margin-left: 1rem;">Select All</button>
          <button type="button" class="btn btn-outline btn-sm" id="export-deselect-all">Deselect All</button>
        </p>
        <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; margin: 1rem 0;" id="export-column-checkboxes">
          ${q.map(e=>`
            <label class="checkbox-label" style="display: inline-flex; align-items: center; gap: 0.35rem; cursor: pointer;">
              <input type="checkbox" class="export-col-cb" value="${e.key}" checked />
              <span>${e.label}</span>
            </label>
          `).join("")}
        </div>
      </div>

      <div style="margin-top: 2rem; display: flex; gap: 1rem; align-items: center;">
        <button class="btn btn-primary" id="admin-export-csv-btn" ${l===0?"disabled":""}>
          📥 Download CSV
        </button>
        <span style="color: var(--text-muted); font-size: 0.9rem;" id="export-filename-preview"></span>
      </div>
      <p id="export-message" class="admin-form-message" style="margin-top: 1rem;"></p>
    </div>
  `}function U(){var l,d,u;document.querySelectorAll(".admin-nav-item[data-tab]").forEach(a=>{a.addEventListener("click",()=>{c=a.dataset.tab,E()})}),(l=document.getElementById("admin-signout"))==null||l.addEventListener("click",async()=>{await j(N),window.location.href="/dragonwebsite/signin.html"});const i=document.getElementById("coach-form");if(i&&i.addEventListener("submit",async a=>{var b;a.preventDefault();const e=document.getElementById("coach-form-message"),t=document.getElementById("create-coach-btn"),s=document.getElementById("coach-email").value.trim(),n=document.getElementById("coach-name").value.trim(),r=document.getElementById("coach-password").value,v=document.getElementById("coach-confirm").value,o=document.getElementById("coach-role").value;if(!s||!n||!r){e.textContent="Please fill in all required fields.",e.className="admin-form-message error";return}if(r!==v){e.textContent="Passwords do not match.",e.className="admin-form-message error";return}if(r.length<6){e.textContent="Password must be at least 6 characters.",e.className="admin-form-message error";return}t.disabled=!0,e.textContent="";try{const p=await fetch("https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBNJKy8UMCzlGjFjEoOesNsIcwQKJnIROA",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:s,password:r,returnSecureToken:!1})});if(!p.ok){const C=((b=(await p.json()).error)==null?void 0:b.message)||"UNKNOWN",B={EMAIL_EXISTS:"A user with this email already exists.",WEAK_PASSWORD:"Password must be at least 6 characters.",INVALID_EMAIL:"Invalid email address.",OPERATION_NOT_ALLOWED:"New accounts are currently disabled. Contact support."};throw new Error(B[C]||`Auth error: ${C}`)}const m=(await p.json()).localId;if(!m)throw new Error("Auth account created but no UID returned. Please check the response.");await A(w(g,"users",m),{email:s,displayName:n,role:o,createdBy:x.uid,createdAt:new Date}),await A(w(g,"coaches",m),{uid:m,email:s,displayName:n,role:o,status:"active",createdBy:x.uid,createdAt:new Date}),e.textContent=`Coach "${n}" (${s}) added successfully.`,e.className="admin-form-message success",i.reset()}catch(f){e.textContent=`Error: ${f.message}`,e.className="admin-form-message error"}t.disabled=!1}),c==="manage"){const a=document.getElementById("coach-table-body"),e=document.getElementById("pending-count");if(!a)return;const t=I(D(g,"coaches"),$("createdAt","desc"));S(t,s=>{let n=0;const r=s.docs.map(v=>{var h,m;const o=v.data();o.status==="pending"&&n++;const b=((m=(h=o.createdAt)==null?void 0:h.toDate)==null?void 0:m.call(h))||new Date(o.createdAt),f=o.role==="admin"?"Admin Coach":"Coach",p=o.role==="admin"?"admin-role-admin":"admin-role-coach";return`
          <tr>
            <td>${o.email||"—"}</td>
            <td>${o.displayName||"—"}</td>
            <td><span class="admin-role-badge ${p}">${f}</span></td>
            <td><span class="admin-status admin-status-${o.status}">${o.status}</span></td>
            <td>${b.toLocaleDateString()}</td>
          </tr>
        `}).join("");a.innerHTML=r||'<tr><td colspan="5" class="admin-empty">No coaches yet.</td></tr>',e.textContent=`${n} pending`},s=>{a.innerHTML=`<tr><td colspan="5" class="admin-empty">Error loading: ${s.message}</td></tr>`})}if(c==="export"){const a=document.getElementById("admin-export-csv-btn"),e=document.getElementById("export-filename-preview");if(e){const t=new Date().toISOString().slice(0,10);e.textContent=`dragon-full-roster-${t}.csv`}(d=document.getElementById("export-select-all"))==null||d.addEventListener("click",()=>{document.querySelectorAll(".export-col-cb").forEach(t=>{t.checked=!0})}),(u=document.getElementById("export-deselect-all"))==null||u.addEventListener("click",()=>{document.querySelectorAll(".export-col-cb").forEach(t=>{t.checked=!1})}),a==null||a.addEventListener("click",()=>{const t=[];if(document.querySelectorAll(".export-col-cb:checked").forEach(r=>{t.push(r.value)}),t.length===0){const r=document.getElementById("export-message");r.textContent="Please select at least one column.",r.className="admin-form-message error";return}const s=new Date().toISOString().slice(0,10);T(y,`dragon-full-roster-${s}.csv`,t);const n=document.getElementById("export-message");n&&(n.textContent=`Download started — ${t.length} columns.`,n.className="admin-form-message success",setTimeout(()=>{n.textContent="",n.className="admin-form-message"},3e3))})}}
