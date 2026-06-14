import{i as P}from"./i18n-cfzYsXIq.js";import{a as O,r as T}from"./footer-9Zbu_KFG.js";import{o as j,h as q,g as w,e as f,q as I,k as S,c as D,j as $,b as L,p as R,l as k}from"./firebase-8Bk_msJm.js";const E=[{key:"firstName",label:"First Name"},{key:"lastName",label:"Last Name"},{key:"gender",label:"Gender"},{key:"age",label:"Age"},{key:"dob",label:"DOB"},{key:"usaSwimmingId",label:"USA Swimming ID"},{key:"status",label:"Status"},{key:"parentFirstName",label:"Parent First Name"},{key:"parentLastName",label:"Parent Last Name"},{key:"parentEmail",label:"Parent Email"},{key:"parentPhone",label:"Parent Phone"},{key:"address",label:"Address"},{key:"ecName",label:"Emergency Contact Name"},{key:"ecPhone",label:"Emergency Contact Phone"}];function M(r,n){const s=r.parent||{},i=r.emergencyContact||{},a=n.dob?Math.floor((new Date-new Date(n.dob))/(365.25*24*60*60*1e3)):"";return{firstName:n.firstName||"",lastName:n.lastName||"",gender:n.gender||"",age:a,dob:n.dob||"",usaSwimmingId:n.usaSwimmingId||"",status:n.status||"pending",parentFirstName:s.firstName||"",parentLastName:s.lastName||"",parentEmail:s.email||"",parentPhone:s.phone||"",address:s.address||"",ecName:i.name||"",ecPhone:i.phone||""}}function F(r,n,s){const i=s&&s.length>0?s:E.map(t=>t.key),a={};for(const t of E)a[t.key]=t;const e=i.map(t=>{var l;return((l=a[t])==null?void 0:l.label)||t}),o=[];for(const t of r){const l=t.swimmers||[];for(const u of l){if(u.deleted)continue;const d=M(t,u);o.push(i.map(h=>A(d[h]??"")).join(","))}}const c=[e.map(t=>A(t)).join(","),...o].join(`
`);U(c,n)}function A(r){return`"${String(r).replace(/"/g,'""')}"`}function U(r,n){const s=new Blob([r],{type:"text/csv;charset=utf-8;"}),i=URL.createObjectURL(s),a=document.createElement("a");a.href=i,a.download=n,document.body.appendChild(a),a.click(),document.body.removeChild(a),URL.revokeObjectURL(i)}P();O();let x=null,m="create",v=[];const V=document.getElementById("app");j(L,async r=>{if(!r){window.location.href="/dragonwebsite/signin.html";return}const n=await q(w(f,"users",r.uid));if((n.exists()?n.data().role:null)!=="admin"){window.location.href="/dragonwebsite/dashboard.html";return}x=r;const i=I(D(f,"registrations"),S("createdAt","desc"));$(i,a=>{v=a.docs.map(e=>({id:e.id,...e.data()})),m==="export"&&C()}),C()});function C(){V.innerHTML=`
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <div class="admin-sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <nav class="admin-nav">
          <button class="admin-nav-item ${m==="create"?"active":""}" data-tab="create">
            ➕ Create Coach
          </button>
          <button class="admin-nav-item ${m==="manage"?"active":""}" data-tab="manage">
            👥 Manage Coaches
          </button>
          <button class="admin-nav-item ${m==="export"?"active":""}" data-tab="export">
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
          <h1 class="admin-page-title">${m==="create"?"Create Coach Account":m==="manage"?"Manage Coaches":"Export Data"}</h1>
        </header>
        <div class="admin-content">
          ${m==="create"?_():m==="manage"?K():z()}
        </div>
      </main>
    </div>
  `,H(),T()}function _(){return`
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
  `}function K(){return`
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
  `}function z(){let r=v.length,n=0;const s={pending:0,active:0,inactive:0};for(const e of v){const o=e.swimmers||[];for(const c of o){if(c.deleted)continue;n++;const t=c.status||"pending";s[t]=(s[t]||0)+1}}const i=["Families","Swimmers","Active","Pending","Inactive"],a=[r,n,s.active||0,s.pending||0,s.inactive||0];return`
    <div class="admin-panel">
      <h3>Export All Registration Data</h3>
      <p class="admin-hint">Download a CSV file with every swimmer and their family contact information.</p>

      <table class="admin-table" style="margin: 1.5rem 0; max-width: 600px;">
        <thead>
          <tr>${i.map(e=>`<th>${e}</th>`).join("")}</tr>
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
          ${E.map(e=>`
            <label class="checkbox-label" style="display: inline-flex; align-items: center; gap: 0.35rem; cursor: pointer;">
              <input type="checkbox" class="export-col-cb" value="${e.key}" checked />
              <span>${e.label}</span>
            </label>
          `).join("")}
        </div>
      </div>

      <div style="margin-top: 2rem; display: flex; gap: 1rem; align-items: center;">
        <button class="btn btn-primary" id="admin-export-csv-btn" ${n===0?"disabled":""}>
          📥 Download CSV
        </button>
        <span style="color: var(--text-muted); font-size: 0.9rem;" id="export-filename-preview"></span>
      </div>
      <p id="export-message" class="admin-form-message" style="margin-top: 1rem;"></p>
    </div>
  `}function H(){var n,s,i;document.querySelectorAll(".admin-nav-item[data-tab]").forEach(a=>{a.addEventListener("click",()=>{m=a.dataset.tab,C()})}),(n=document.getElementById("admin-signout"))==null||n.addEventListener("click",async()=>{await R(L),window.location.href="/dragonwebsite/signin.html"});const r=document.getElementById("coach-form");if(r&&r.addEventListener("submit",async a=>{var h;a.preventDefault();const e=document.getElementById("coach-form-message"),o=document.getElementById("create-coach-btn"),c=document.getElementById("coach-email").value.trim(),t=document.getElementById("coach-name").value.trim(),l=document.getElementById("coach-password").value,u=document.getElementById("coach-confirm").value,d=document.getElementById("coach-role").value;if(!c||!t||!l){e.textContent="Please fill in all required fields.",e.className="admin-form-message error";return}if(l!==u){e.textContent="Passwords do not match.",e.className="admin-form-message error";return}if(l.length<6){e.textContent="Password must be at least 6 characters.",e.className="admin-form-message error";return}o.disabled=!0,e.textContent="";try{const b=await fetch("https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBNJKy8UMCzlGjFjEoOesNsIcwQKJnIROA",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:c,password:l,returnSecureToken:!1})});if(!b.ok){const N=((h=(await b.json()).error)==null?void 0:h.message)||"UNKNOWN",B={EMAIL_EXISTS:"A user with this email already exists.",WEAK_PASSWORD:"Password must be at least 6 characters.",INVALID_EMAIL:"Invalid email address.",OPERATION_NOT_ALLOWED:"New accounts are currently disabled. Contact support."};throw new Error(B[N]||`Auth error: ${N}`)}const p=(await b.json()).localId;if(!p)throw new Error("Auth account created but no UID returned. Please check the response.");await k(w(f,"users",p),{email:c,displayName:t,role:d,createdBy:x.uid,createdAt:new Date}),await k(w(f,"coaches",p),{uid:p,email:c,displayName:t,role:d,status:"active",createdBy:x.uid,createdAt:new Date}),e.textContent=`Coach "${t}" (${c}) added successfully.`,e.className="admin-form-message success",r.reset()}catch(y){e.textContent=`Error: ${y.message}`,e.className="admin-form-message error"}o.disabled=!1}),m==="manage"){const a=document.getElementById("coach-table-body"),e=document.getElementById("pending-count");if(!a)return;const o=I(D(f,"coaches"),S("createdAt","desc"));$(o,c=>{let t=0;const l=c.docs.map(u=>{var g,p;const d=u.data();d.status==="pending"&&t++;const h=((p=(g=d.createdAt)==null?void 0:g.toDate)==null?void 0:p.call(g))||new Date(d.createdAt),y=d.role==="admin"?"Admin Coach":"Coach",b=d.role==="admin"?"admin-role-admin":"admin-role-coach";return`
          <tr>
            <td>${d.email||"—"}</td>
            <td>${d.displayName||"—"}</td>
            <td><span class="admin-role-badge ${b}">${y}</span></td>
            <td><span class="admin-status admin-status-${d.status}">${d.status}</span></td>
            <td>${h.toLocaleDateString()}</td>
          </tr>
        `}).join("");a.innerHTML=l||'<tr><td colspan="5" class="admin-empty">No coaches yet.</td></tr>',e.textContent=`${t} pending`},c=>{a.innerHTML=`<tr><td colspan="5" class="admin-empty">Error loading: ${c.message}</td></tr>`})}if(m==="export"){const a=document.getElementById("admin-export-csv-btn"),e=document.getElementById("export-filename-preview");if(e){const o=new Date().toISOString().slice(0,10);e.textContent=`dragon-full-roster-${o}.csv`}(s=document.getElementById("export-select-all"))==null||s.addEventListener("click",()=>{document.querySelectorAll(".export-col-cb").forEach(o=>{o.checked=!0})}),(i=document.getElementById("export-deselect-all"))==null||i.addEventListener("click",()=>{document.querySelectorAll(".export-col-cb").forEach(o=>{o.checked=!1})}),a==null||a.addEventListener("click",()=>{const o=[];if(document.querySelectorAll(".export-col-cb:checked").forEach(l=>{o.push(l.value)}),o.length===0){const l=document.getElementById("export-message");l.textContent="Please select at least one column.",l.className="admin-form-message error";return}const c=new Date().toISOString().slice(0,10);F(v,`dragon-full-roster-${c}.csv`,o);const t=document.getElementById("export-message");t&&(t.textContent=`Download started — ${o.length} columns.`,t.className="admin-form-message success",setTimeout(()=>{t.textContent="",t.className="admin-form-message"},3e3))})}}
