import{i as O,t as p}from"./i18n-6jdL3vyQ.js";import{a as q,r as T}from"./footer-BwENUkcq.js";import{o as F,h as j,g as x,e as y,q as C,l as A,c as E,k as I,b as B,t as M,m as _,i as R,w as U,a as V,f as z}from"./firebase-CorBctTj.js";const k=[{key:"firstName",label:"First Name"},{key:"lastName",label:"Last Name"},{key:"gender",label:"Gender"},{key:"age",label:"Age"},{key:"dob",label:"DOB"},{key:"usaSwimmingId",label:"USA Swimming ID"},{key:"status",label:"Status"},{key:"parentFirstName",label:"Parent First Name"},{key:"parentLastName",label:"Parent Last Name"},{key:"parentEmail",label:"Parent Email"},{key:"parentPhone",label:"Parent Phone"},{key:"address",label:"Address"},{key:"ecName",label:"Emergency Contact Name"},{key:"ecPhone",label:"Emergency Contact Phone"}];function H(d,i){const l=d.parent||{},m=d.emergencyContact||{},c=i.dob?Math.floor((new Date-new Date(i.dob))/(365.25*24*60*60*1e3)):"";return{firstName:i.firstName||"",lastName:i.lastName||"",gender:i.gender||"",age:c,dob:i.dob||"",usaSwimmingId:i.usaSwimmingId||"",status:i.status||"pending",parentFirstName:l.firstName||"",parentLastName:l.lastName||"",parentEmail:l.email||"",parentPhone:l.phone||"",address:l.address||"",ecName:m.name||"",ecPhone:m.phone||""}}function K(d,i,l){const m=l&&l.length>0?l:k.map(e=>e.key),c={};for(const e of k)c[e.key]=e;const t=m.map(e=>{var n;return((n=c[e])==null?void 0:n.label)||e}),a=[];for(const e of d){const n=e.swimmers||[];for(const o of n){if(o.deleted)continue;const f=H(e,o);a.push(m.map(r=>L(f[r]??"")).join(","))}}const s=[t.map(e=>L(e)).join(","),...a].join(`
`);J(s,i)}function L(d){return`"${String(d).replace(/"/g,'""')}"`}function J(d,i){const l=new Blob([d],{type:"text/csv;charset=utf-8;"}),m=URL.createObjectURL(l),c=document.createElement("a");c.href=m,c.download=i,document.body.appendChild(c),c.click(),document.body.removeChild(c),URL.revokeObjectURL(m)}O();q();let N=null,u="create",$=[];const W=document.getElementById("app");F(B,async d=>{if(!d){window.location.href="/signin.html";return}const i=await j(x(y,"users",d.uid));if((i.exists()?i.data().role:null)!=="admin"){window.location.href="/dashboard.html";return}N=d;const m=C(E(y,"registrations"),A("createdAt","desc"));I(m,c=>{$=c.docs.map(t=>({id:t.id,...t.data()})),u==="export"&&D()}),D()});function D(){W.innerHTML=`
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <div class="admin-sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <nav class="admin-nav">
          <button class="admin-nav-item ${u==="create"?"active":""}" data-tab="create">
            ➕ Create Coach
          </button>
          <button class="admin-nav-item ${u==="family"?"active":""}" data-tab="family">
            👪 Add Family
          </button>
          <button class="admin-nav-item ${u==="manage"?"active":""}" data-tab="manage">
            👥 Manage Coaches
          </button>
          <button class="admin-nav-item ${u==="export"?"active":""}" data-tab="export">
            📥 Export Data
          </button>
        </nav>
        <div class="admin-sidebar-footer">
          <a href="/dashboard.html" class="admin-nav-item">← Back to Dashboard</a>
          <button class="admin-nav-item" id="admin-signout" style="color: var(--color-accent);">🚪 Sign Out</button>
        </div>
      </aside>

      <main class="admin-main">
        <header class="admin-topbar">
          <h1 class="admin-page-title">${u==="create"?"Create Coach Account":u==="manage"?"Manage Coaches":u==="family"?"Pre-authorize Family":"Export Data"}</h1>
        </header>
        <div class="admin-content">
          ${u==="create"?G():u==="manage"?Q():u==="family"?X():Y()}
        </div>
      </main>
    </div>
  `,Z(),T()}function G(){return`
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
  `}function Q(){return`
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
  `}function X(){return`
    <div class="admin-panel">
      <h3>${p("admin_family_title")}</h3>
      <p class="admin-hint">${p("admin_family_hint")}</p>
      <form id="family-form" class="admin-form">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="family-email">${p("admin_family_email")}</label>
            <input class="form-input" type="email" id="family-email" placeholder="parent@example.com" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="family-name">${p("admin_family_name")}</label>
            <input class="form-input" type="text" id="family-name" placeholder="e.g. John Chen" />
          </div>
        </div>
        <button type="submit" class="btn btn-primary" id="add-family-btn">${p("admin_family_add_btn")}</button>
        <p id="family-form-message" class="admin-form-message"></p>
      </form>
    </div>

    <div class="admin-panel" style="margin-top: 2rem;">
      <h3>${p("admin_family_list_title")}</h3>
      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Status</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="family-table-body">
            <tr><td colspan="5" class="admin-empty">Loading...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `}function Y(){let d=$.length,i=0;const l={pending:0,active:0,inactive:0};for(const t of $){const a=t.swimmers||[];for(const s of a){if(s.deleted)continue;i++;const e=s.status||"pending";l[e]=(l[e]||0)+1}}const m=["Families","Swimmers","Active","Pending","Inactive"],c=[d,i,l.active||0,l.pending||0,l.inactive||0];return`
    <div class="admin-panel">
      <h3>Export All Registration Data</h3>
      <p class="admin-hint">Download a CSV file with every swimmer and their family contact information.</p>

      <table class="admin-table" style="margin: 1.5rem 0; max-width: 600px;">
        <thead>
          <tr>${m.map(t=>`<th>${t}</th>`).join("")}</tr>
        </thead>
        <tbody>
          <tr>${c.map(t=>`<td style="font-weight: 600; font-size: 1.1rem;">${t}</td>`).join("")}</tr>
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
          ${k.map(t=>`
            <label class="checkbox-label" style="display: inline-flex; align-items: center; gap: 0.35rem; cursor: pointer;">
              <input type="checkbox" class="export-col-cb" value="${t.key}" checked />
              <span>${t.label}</span>
            </label>
          `).join("")}
        </div>
      </div>

      <div style="margin-top: 2rem; display: flex; gap: 1rem; align-items: center;">
        <button class="btn btn-primary" id="admin-export-csv-btn" ${i===0?"disabled":""}>
          📥 Download CSV
        </button>
        <span style="color: var(--text-muted); font-size: 0.9rem;" id="export-filename-preview"></span>
      </div>
      <p id="export-message" class="admin-form-message" style="margin-top: 1rem;"></p>
    </div>
  `}function Z(){var l,m,c;document.querySelectorAll(".admin-nav-item[data-tab]").forEach(t=>{t.addEventListener("click",()=>{u=t.dataset.tab,D()})}),(l=document.getElementById("admin-signout"))==null||l.addEventListener("click",async()=>{await M(B),window.location.href="/signin.html"});const d=document.getElementById("coach-form");d&&d.addEventListener("submit",async t=>{var v;t.preventDefault();const a=document.getElementById("coach-form-message"),s=document.getElementById("create-coach-btn"),e=document.getElementById("coach-email").value.trim(),n=document.getElementById("coach-name").value.trim(),o=document.getElementById("coach-password").value,f=document.getElementById("coach-confirm").value,r=document.getElementById("coach-role").value;if(!e||!n||!o){a.textContent="Please fill in all required fields.",a.className="admin-form-message error";return}if(o!==f){a.textContent="Passwords do not match.",a.className="admin-form-message error";return}if(o.length<6){a.textContent="Password must be at least 6 characters.",a.className="admin-form-message error";return}s.disabled=!0,a.textContent="";try{const b=await fetch("https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBNJKy8UMCzlGjFjEoOesNsIcwQKJnIROA",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,password:o,returnSecureToken:!1})});if(!b.ok){const S=((v=(await b.json()).error)==null?void 0:v.message)||"UNKNOWN",P={EMAIL_EXISTS:"A user with this email already exists.",WEAK_PASSWORD:"Password must be at least 6 characters.",INVALID_EMAIL:"Invalid email address.",OPERATION_NOT_ALLOWED:"New accounts are currently disabled. Contact support."};throw new Error(P[S]||`Auth error: ${S}`)}const g=(await b.json()).localId;if(!g)throw new Error("Auth account created but no UID returned. Please check the response.");await _(x(y,"users",g),{email:e,displayName:n,role:r,createdBy:N.uid,createdAt:new Date}),await _(x(y,"coaches",g),{uid:g,email:e,displayName:n,role:r,status:"active",createdBy:N.uid,createdAt:new Date}),a.textContent=`Coach "${n}" (${e}) added successfully.`,a.className="admin-form-message success",d.reset()}catch(h){a.textContent=`Error: ${h.message}`,a.className="admin-form-message error"}s.disabled=!1});const i=document.getElementById("family-form");if(i&&i.addEventListener("submit",async t=>{t.preventDefault();const a=document.getElementById("family-form-message"),s=document.getElementById("add-family-btn"),e=document.getElementById("family-email").value.trim(),n=document.getElementById("family-name").value.trim()||null;if(!e){a.textContent="Email is required.",a.className="admin-form-message error";return}s.disabled=!0,a.textContent="";try{if(!(await R(C(E(y,"families"),U("email","==",e)))).empty)throw new Error(p("admin_family_already_exists"));await V(E(y,"families"),{email:e,parentName:n,status:"pending",registeredUid:null,createdBy:N.uid,createdAt:new Date}),a.textContent=`"${n||e}" added successfully.`,a.className="admin-form-message success",i.reset()}catch(o){a.textContent=`Error: ${o.message}`,a.className="admin-form-message error"}s.disabled=!1}),u==="family"){const t=document.getElementById("family-table-body");if(t){const a=C(E(y,"families"),A("createdAt","desc"));I(a,s=>{const e=s.docs.map(n=>{var h,b;const o=n.data(),f=((b=(h=o.createdAt)==null?void 0:h.toDate)==null?void 0:b.call(h))||new Date(o.createdAt),r=o.status==="registered"?p("admin_family_status_registered"):p("admin_family_status_pending"),v=o.status==="registered"?"admin-status-active":"admin-status-pending";return`
            <tr>
              <td>${o.email||"—"}</td>
              <td>${o.parentName||"—"}</td>
              <td><span class="admin-status ${v}">${r}</span></td>
              <td>${f.toLocaleDateString()}</td>
              <td><button class="btn btn-outline btn-sm family-delete-btn" data-id="${n.id}" data-email="${o.email||""}" style="color: var(--color-accent);">${p("admin_family_delete")}</button></td>
            </tr>
          `}).join("");t.innerHTML=e||'<tr><td colspan="5" class="admin-empty">No families authorized yet.</td></tr>',t.querySelectorAll(".family-delete-btn").forEach(n=>{n.addEventListener("click",async()=>{const o=n.dataset.id,f=n.dataset.email;if(confirm(p("admin_family_delete_confirm")+`

`+f))try{await z(x(y,"families",o))}catch(r){console.error("Error deleting family:",r),alert("Failed to delete: "+r.message)}})})},s=>{t.innerHTML=`<tr><td colspan="5" class="admin-empty">Error loading: ${s.message}</td></tr>`})}}if(u==="manage"){const t=document.getElementById("coach-table-body"),a=document.getElementById("pending-count");if(!t)return;const s=C(E(y,"coaches"),A("createdAt","desc"));I(s,e=>{let n=0;const o=e.docs.map(f=>{var w,g;const r=f.data();r.status==="pending"&&n++;const v=((g=(w=r.createdAt)==null?void 0:w.toDate)==null?void 0:g.call(w))||new Date(r.createdAt),h=r.role==="admin"?"Admin Coach":"Coach",b=r.role==="admin"?"admin-role-admin":"admin-role-coach";return`
          <tr>
            <td>${r.email||"—"}</td>
            <td>${r.displayName||"—"}</td>
            <td><span class="admin-role-badge ${b}">${h}</span></td>
            <td><span class="admin-status admin-status-${r.status}">${r.status}</span></td>
            <td>${v.toLocaleDateString()}</td>
          </tr>
        `}).join("");t.innerHTML=o||'<tr><td colspan="5" class="admin-empty">No coaches yet.</td></tr>',a.textContent=`${n} pending`},e=>{t.innerHTML=`<tr><td colspan="5" class="admin-empty">Error loading: ${e.message}</td></tr>`})}if(u==="export"){const t=document.getElementById("admin-export-csv-btn"),a=document.getElementById("export-filename-preview");if(a){const s=new Date().toISOString().slice(0,10);a.textContent=`dragon-full-roster-${s}.csv`}(m=document.getElementById("export-select-all"))==null||m.addEventListener("click",()=>{document.querySelectorAll(".export-col-cb").forEach(s=>{s.checked=!0})}),(c=document.getElementById("export-deselect-all"))==null||c.addEventListener("click",()=>{document.querySelectorAll(".export-col-cb").forEach(s=>{s.checked=!1})}),t==null||t.addEventListener("click",()=>{const s=[];if(document.querySelectorAll(".export-col-cb:checked").forEach(o=>{s.push(o.value)}),s.length===0){const o=document.getElementById("export-message");o.textContent="Please select at least one column.",o.className="admin-form-message error";return}const e=new Date().toISOString().slice(0,10);K($,`dragon-full-roster-${e}.csv`,s);const n=document.getElementById("export-message");n&&(n.textContent=`Download started — ${s.length} columns.`,n.className="admin-form-message success",setTimeout(()=>{n.textContent="",n.className="admin-form-message"},3e3))})}}
