import{i as R,t as y}from"./i18n-DIN1ScE8.js";import{o as U,h as q,g as E,e as h,q as v,l as k,c as g,k as A,b as P,t as j,i as $,w as N,a as _,f as B,u as O}from"./firebase-CorBctTj.js";const D=[{key:"firstName",label:"First Name"},{key:"lastName",label:"Last Name"},{key:"gender",label:"Gender"},{key:"age",label:"Age"},{key:"dob",label:"DOB"},{key:"usaSwimmingId",label:"USA Swimming ID"},{key:"status",label:"Status"},{key:"parentFirstName",label:"Parent First Name"},{key:"parentLastName",label:"Parent Last Name"},{key:"parentEmail",label:"Parent Email"},{key:"parentPhone",label:"Parent Phone"},{key:"address",label:"Address"},{key:"ecName",label:"Emergency Contact Name"},{key:"ecPhone",label:"Emergency Contact Phone"}];function V(r,o){const l=r.parent||{},m=r.emergencyContact||{},c=o.dob?Math.floor((new Date-new Date(o.dob))/(365.25*24*60*60*1e3)):"";return{firstName:o.firstName||"",lastName:o.lastName||"",gender:o.gender||"",age:c,dob:o.dob||"",usaSwimmingId:o.usaSwimmingId||"",status:o.status||"pending",parentFirstName:l.firstName||"",parentLastName:l.lastName||"",parentEmail:l.email||"",parentPhone:l.phone||"",address:l.address||"",ecName:m.name||"",ecPhone:m.phone||""}}function z(r,o,l){const m=l&&l.length>0?l:D.map(t=>t.key),c={};for(const t of D)c[t.key]=t;const e=m.map(t=>{var s;return((s=c[t])==null?void 0:s.label)||t}),a=[];for(const t of r){const s=t.swimmers||[];for(const i of s){if(i.deleted)continue;const u=V(t,i);a.push(m.map(d=>F(u[d]??"")).join(","))}}const n=[e.map(t=>F(t)).join(","),...a].join(`
`);H(n,o)}function F(r){return`"${String(r).replace(/"/g,'""')}"`}function H(r,o){const l=new Blob([r],{type:"text/csv;charset=utf-8;"}),m=URL.createObjectURL(l),c=document.createElement("a");c.href=m,c.download=o,document.body.appendChild(c),c.click(),document.body.removeChild(c),URL.revokeObjectURL(m)}R();let S=null,p="create",C=[];const G=document.getElementById("app");U(P,async r=>{if(!r){window.location.href="/signin.html";return}const o=await q(E(h,"users",r.uid));if((o.exists()?o.data().role:null)!=="admin"){window.location.href="/dashboard.html";return}S=r;const m=v(g(h,"registrations"),k("createdAt","desc"));A(m,c=>{C=c.docs.map(e=>({id:e.id,...e.data()})),p==="export"&&I()}),I()});function I(){G.innerHTML=`
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <div class="admin-sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <nav class="admin-nav">
          <button class="admin-nav-item ${p==="create"?"active":""}" data-tab="create">
            ➕ Create Coach
          </button>
          <button class="admin-nav-item ${p==="family"?"active":""}" data-tab="family">
            👪 Add Family
          </button>
          <button class="admin-nav-item ${p==="manage"?"active":""}" data-tab="manage">
            👥 Manage Coaches
          </button>
          <button class="admin-nav-item ${p==="export"?"active":""}" data-tab="export">
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
          <h1 class="admin-page-title">${p==="create"?"Pre-authorize Coach":p==="manage"?"Manage Coaches":p==="family"?"Pre-authorize Family":"Export Data"}</h1>
        </header>
        <div class="admin-content">
          ${p==="create"?J():p==="manage"?Q():p==="family"?W():X()}
        </div>
      </main>
    </div>
  `,Y()}function J(){return`
    <div class="admin-panel">
      <h3>Pre-authorize Coach</h3>
      <p class="admin-hint">Add a coach's email to the whitelist. They will create their own account and set their own password when they sign up. For Gmail addresses, they can use Google sign-in directly.</p>
      <form id="coach-form" class="admin-form">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="coach-email">Email *</label>
            <input class="form-input" type="email" id="coach-email" placeholder="coach@example.com" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="coach-name">Display Name (optional)</label>
            <input class="form-input" type="text" id="coach-name" placeholder="e.g. Coach Thompson" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="coach-role">Role *</label>
          <select class="form-input" id="coach-role" required>
            <option value="coach">Coach (no admin access)</option>
            <option value="admin">Admin Coach (can manage coaches)</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary" id="create-coach-btn">Add Coach</button>
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
              <th></th>
            </tr>
          </thead>
          <tbody id="coach-table-body">
            <tr><td colspan="6" class="admin-empty">Loading...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `}function W(){return`
    <div class="admin-panel">
      <h3>${y("admin_family_title")}</h3>
      <p class="admin-hint">${y("admin_family_hint")}</p>
      <form id="family-form" class="admin-form">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="family-email">${y("admin_family_email")}</label>
            <input class="form-input" type="email" id="family-email" placeholder="parent@example.com" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="family-name">${y("admin_family_name")}</label>
            <input class="form-input" type="text" id="family-name" placeholder="e.g. John Chen" />
          </div>
        </div>
        <button type="submit" class="btn btn-primary" id="add-family-btn">${y("admin_family_add_btn")}</button>
        <p id="family-form-message" class="admin-form-message"></p>
      </form>
    </div>

    <div class="admin-panel" style="margin-top: 2rem;">
      <h3>${y("admin_family_list_title")}</h3>
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
  `}function X(){let r=C.length,o=0;const l={pending:0,active:0,inactive:0};for(const e of C){const a=e.swimmers||[];for(const n of a){if(n.deleted)continue;o++;const t=n.status||"pending";l[t]=(l[t]||0)+1}}const m=["Families","Swimmers","Active","Pending","Inactive"],c=[r,o,l.active||0,l.pending||0,l.inactive||0];return`
    <div class="admin-panel">
      <h3>Export All Registration Data</h3>
      <p class="admin-hint">Download a CSV file with every swimmer and their family contact information.</p>

      <table class="admin-table" style="margin: 1.5rem 0; max-width: 600px;">
        <thead>
          <tr>${m.map(e=>`<th>${e}</th>`).join("")}</tr>
        </thead>
        <tbody>
          <tr>${c.map(e=>`<td style="font-weight: 600; font-size: 1.1rem;">${e}</td>`).join("")}</tr>
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
          ${D.map(e=>`
            <label class="checkbox-label" style="display: inline-flex; align-items: center; gap: 0.35rem; cursor: pointer;">
              <input type="checkbox" class="export-col-cb" value="${e.key}" checked />
              <span>${e.label}</span>
            </label>
          `).join("")}
        </div>
      </div>

      <div style="margin-top: 2rem; display: flex; gap: 1rem; align-items: center;">
        <button class="btn btn-primary" id="admin-export-csv-btn" ${o===0?"disabled":""}>
          📥 Download CSV
        </button>
        <span style="color: var(--text-muted); font-size: 0.9rem;" id="export-filename-preview"></span>
      </div>
      <p id="export-message" class="admin-form-message" style="margin-top: 1rem;"></p>
    </div>
  `}function Y(){var l,m,c;document.querySelectorAll(".admin-nav-item[data-tab]").forEach(e=>{e.addEventListener("click",()=>{p=e.dataset.tab,I()})}),(l=document.getElementById("admin-signout"))==null||l.addEventListener("click",async()=>{await j(P),window.location.href="/signin.html"});const r=document.getElementById("coach-form");r&&r.addEventListener("submit",async e=>{e.preventDefault();const a=document.getElementById("coach-form-message"),n=document.getElementById("create-coach-btn"),t=document.getElementById("coach-email").value.trim(),s=document.getElementById("coach-name").value.trim()||null,i=document.getElementById("coach-role").value;if(!t){a.textContent="Email is required.",a.className="admin-form-message error";return}n.disabled=!0,a.textContent="";try{if(!(await $(v(g(h,"coaches"),N("email","==",t)))).empty)throw new Error("A coach with this email already exists.");if(!(await $(v(g(h,"families"),N("email","==",t)))).empty)throw new Error("This email is already in the family whitelist.");await _(g(h,"coaches"),{email:t,displayName:s,role:i,status:"pending",registeredUid:null,createdBy:S.uid,createdAt:new Date}),a.textContent=`Coach "${s||t}" added to whitelist. They can now sign up with this email.`,a.className="admin-form-message success",r.reset()}catch(u){a.textContent=`Error: ${u.message}`,a.className="admin-form-message error"}n.disabled=!1});const o=document.getElementById("family-form");if(o&&o.addEventListener("submit",async e=>{e.preventDefault();const a=document.getElementById("family-form-message"),n=document.getElementById("add-family-btn"),t=document.getElementById("family-email").value.trim(),s=document.getElementById("family-name").value.trim()||null;if(!t){a.textContent="Email is required.",a.className="admin-form-message error";return}n.disabled=!0,a.textContent="";try{if(!(await $(v(g(h,"families"),N("email","==",t)))).empty)throw new Error(y("admin_family_already_exists"));await _(g(h,"families"),{email:t,parentName:s,status:"pending",registeredUid:null,createdBy:S.uid,createdAt:new Date}),a.textContent=`"${s||t}" added successfully.`,a.className="admin-form-message success",o.reset()}catch(i){a.textContent=`Error: ${i.message}`,a.className="admin-form-message error"}n.disabled=!1}),p==="family"){const e=document.getElementById("family-table-body");if(e){const a=v(g(h,"families"),k("createdAt","desc"));A(a,n=>{const t=n.docs.map(s=>{var f,b;const i=s.data(),u=((b=(f=i.createdAt)==null?void 0:f.toDate)==null?void 0:b.call(f))||new Date(i.createdAt),d=i.status==="registered"?y("admin_family_status_registered"):y("admin_family_status_pending"),w=i.status==="registered"?"admin-status-active":"admin-status-pending";return`
            <tr>
              <td>${i.email||"—"}</td>
              <td>${i.parentName||"—"}</td>
              <td><span class="admin-status ${w}">${d}</span></td>
              <td>${u.toLocaleDateString()}</td>
              <td><button class="btn btn-outline btn-sm family-delete-btn" data-id="${s.id}" data-email="${i.email||""}" style="color: var(--color-accent);">${y("admin_family_delete")}</button></td>
            </tr>
          `}).join("");e.innerHTML=t||'<tr><td colspan="5" class="admin-empty">No families authorized yet.</td></tr>',e.querySelectorAll(".family-delete-btn").forEach(s=>{s.addEventListener("click",async()=>{const i=s.dataset.id,u=s.dataset.email;if(confirm(y("admin_family_delete_confirm")+`

`+u))try{await B(E(h,"families",i))}catch(d){console.error("Error deleting family:",d),alert("Failed to delete: "+d.message)}})})},n=>{e.innerHTML=`<tr><td colspan="5" class="admin-empty">Error loading: ${n.message}</td></tr>`})}}if(p==="manage"){const e=document.getElementById("coach-table-body"),a=document.getElementById("pending-count");if(!e)return;const n=v(g(h,"coaches"),k("createdAt","desc"));A(n,t=>{let s=0;const i=t.docs.map(u=>{var x,L;const d=u.data();d.status==="pending"&&s++;const w=((L=(x=d.createdAt)==null?void 0:x.toDate)==null?void 0:L.call(x))||new Date(d.createdAt),f=d.role==="admin"?"Admin Coach":"Coach",b=d.role==="admin"?"admin-role-admin":"admin-role-coach",T=d.status==="active"?"active":"pending",M=d.status==="active"?"admin-status-active":"admin-status-pending";return`
          <tr>
            <td>${d.email||"—"}</td>
            <td>${d.displayName||"—"}</td>
            <td><span class="admin-role-badge ${b}">${f}</span></td>
            <td><span class="admin-status ${M}">${T}</span></td>
            <td>${w.toLocaleDateString()}</td>
            <td><button class="btn btn-outline btn-sm coach-delete-btn" data-id="${u.id}" data-email="${d.email||""}" style="color: var(--color-accent);">Delete</button></td>
          </tr>
        `}).join("");e.innerHTML=i||'<tr><td colspan="6" class="admin-empty">No coaches yet.</td></tr>',a.textContent=`${s} pending`,e.querySelectorAll(".coach-delete-btn").forEach(u=>{u.addEventListener("click",async()=>{const d=u.dataset.id,w=u.dataset.email;if(confirm(`Remove this coach authorization?

`+w))try{const f=await q(E(h,"coaches",d)),b=f.exists()?f.data().registeredUid:null;b&&await O(E(h,"users",b),{role:"removed"}).catch(()=>{}),await B(E(h,"coaches",d))}catch(f){console.error("Error deleting coach:",f),alert("Failed to delete: "+f.message)}})})},t=>{e.innerHTML=`<tr><td colspan="6" class="admin-empty">Error loading: ${t.message}</td></tr>`})}if(p==="export"){const e=document.getElementById("admin-export-csv-btn"),a=document.getElementById("export-filename-preview");if(a){const n=new Date().toISOString().slice(0,10);a.textContent=`dragon-full-roster-${n}.csv`}(m=document.getElementById("export-select-all"))==null||m.addEventListener("click",()=>{document.querySelectorAll(".export-col-cb").forEach(n=>{n.checked=!0})}),(c=document.getElementById("export-deselect-all"))==null||c.addEventListener("click",()=>{document.querySelectorAll(".export-col-cb").forEach(n=>{n.checked=!1})}),e==null||e.addEventListener("click",()=>{const n=[];if(document.querySelectorAll(".export-col-cb:checked").forEach(i=>{n.push(i.value)}),n.length===0){const i=document.getElementById("export-message");i.textContent="Please select at least one column.",i.className="admin-form-message error";return}const t=new Date().toISOString().slice(0,10);z(C,`dragon-full-roster-${t}.csv`,n);const s=document.getElementById("export-message");s&&(s.textContent=`Download started — ${n.length} columns.`,s.className="admin-form-message success",setTimeout(()=>{s.textContent="",s.className="admin-form-message"},3e3))})}}
