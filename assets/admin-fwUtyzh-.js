import{i as O,t as y}from"./i18n-DIN1ScE8.js";import{o as V,h as L,g as w,e as d,q as x,l as _,c as v,k as B,b as j,t as z,i as $,w as k,a as U,u as A,f as I}from"./firebase-CorBctTj.js";const F=[{key:"firstName",label:"First Name"},{key:"lastName",label:"Last Name"},{key:"gender",label:"Gender"},{key:"age",label:"Age"},{key:"dob",label:"DOB"},{key:"usaSwimmingId",label:"USA Swimming ID"},{key:"status",label:"Status"},{key:"parentFirstName",label:"Parent First Name"},{key:"parentLastName",label:"Parent Last Name"},{key:"parentEmail",label:"Parent Email"},{key:"parentPhone",label:"Parent Phone"},{key:"address",label:"Address"},{key:"ecName",label:"Emergency Contact Name"},{key:"ecPhone",label:"Emergency Contact Phone"}];function H(c,l){const r=c.parent||{},p=c.emergencyContact||{},u=l.dob?Math.floor((new Date-new Date(l.dob))/(365.25*24*60*60*1e3)):"";return{firstName:l.firstName||"",lastName:l.lastName||"",gender:l.gender||"",age:u,dob:l.dob||"",usaSwimmingId:l.usaSwimmingId||"",status:l.status||"pending",parentFirstName:r.firstName||"",parentLastName:r.lastName||"",parentEmail:r.email||"",parentPhone:r.phone||"",address:r.address||"",ecName:p.name||"",ecPhone:p.phone||""}}function G(c,l,r){const p=r&&r.length>0?r:F.map(t=>t.key),u={};for(const t of F)u[t.key]=t;const e=p.map(t=>{var s;return((s=u[t])==null?void 0:s.label)||t}),a=[];for(const t of c){const s=t.swimmers||[];for(const i of s){if(i.deleted)continue;const m=H(t,i);a.push(p.map(o=>M(m[o]??"")).join(","))}}const n=[e.map(t=>M(t)).join(","),...a].join(`
`);J(n,l)}function M(c){return`"${String(c).replace(/"/g,'""')}"`}function J(c,l){const r=new Blob([c],{type:"text/csv;charset=utf-8;"}),p=URL.createObjectURL(r),u=document.createElement("a");u.href=p,u.download=l,document.body.appendChild(u),u.click(),document.body.removeChild(u),URL.revokeObjectURL(p)}O();let q=null,h="create",N=[];const Q=document.getElementById("app");V(j,async c=>{if(!c){window.location.href="/signin.html";return}const l=await L(w(d,"users",c.uid));if((l.exists()?l.data().role:null)!=="admin"){window.location.href="/dashboard.html";return}q=c;const p=x(v(d,"registrations"),_("createdAt","desc"));B(p,u=>{N=u.docs.map(e=>({id:e.id,...e.data()})),h==="export"&&P()}),P()});function P(){Q.innerHTML=`
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <div class="admin-sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <nav class="admin-nav">
          <button class="admin-nav-item ${h==="create"?"active":""}" data-tab="create">
            ➕ Create Coach
          </button>
          <button class="admin-nav-item ${h==="family"?"active":""}" data-tab="family">
            👪 Add Family
          </button>
          <button class="admin-nav-item ${h==="manage"?"active":""}" data-tab="manage">
            👥 Manage Coaches
          </button>
          <button class="admin-nav-item ${h==="export"?"active":""}" data-tab="export">
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
          <h1 class="admin-page-title">${h==="create"?"Pre-authorize Coach":h==="manage"?"Manage Coaches":h==="family"?"Pre-authorize Family":"Export Data"}</h1>
        </header>
        <div class="admin-content">
          ${h==="create"?K():h==="manage"?W():h==="family"?X():Y()}
        </div>
      </main>
    </div>
  `,Z()}function K(){return`
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
  `}function W(){return`
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
  `}function X(){return`
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
  `}function Y(){let c=N.length,l=0;const r={pending:0,active:0,inactive:0};for(const e of N){const a=e.swimmers||[];for(const n of a){if(n.deleted)continue;l++;const t=n.status||"pending";r[t]=(r[t]||0)+1}}const p=["Families","Swimmers","Active","Pending","Inactive"],u=[c,l,r.active||0,r.pending||0,r.inactive||0];return`
    <div class="admin-panel">
      <h3>Export All Registration Data</h3>
      <p class="admin-hint">Download a CSV file with every swimmer and their family contact information.</p>

      <table class="admin-table" style="margin: 1.5rem 0; max-width: 600px;">
        <thead>
          <tr>${p.map(e=>`<th>${e}</th>`).join("")}</tr>
        </thead>
        <tbody>
          <tr>${u.map(e=>`<td style="font-weight: 600; font-size: 1.1rem;">${e}</td>`).join("")}</tr>
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
          ${F.map(e=>`
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
  `}function Z(){var r,p,u;document.querySelectorAll(".admin-nav-item[data-tab]").forEach(e=>{e.addEventListener("click",()=>{h=e.dataset.tab,P()})}),(r=document.getElementById("admin-signout"))==null||r.addEventListener("click",async()=>{await z(j),window.location.href="/signin.html"});const c=document.getElementById("coach-form");c&&c.addEventListener("submit",async e=>{e.preventDefault();const a=document.getElementById("coach-form-message"),n=document.getElementById("create-coach-btn"),t=document.getElementById("coach-email").value.trim(),s=document.getElementById("coach-name").value.trim()||null,i=document.getElementById("coach-role").value;if(!t){a.textContent="Email is required.",a.className="admin-form-message error";return}n.disabled=!0,a.textContent="";try{if(!(await $(x(v(d,"coaches"),k("email","==",t)))).empty)throw new Error("A coach with this email already exists.");if(!(await $(x(v(d,"families"),k("email","==",t)))).empty)throw new Error("This email is already in the family whitelist.");await U(v(d,"coaches"),{email:t,displayName:s,role:i,status:"pending",registeredUid:null,createdBy:q.uid,createdAt:new Date}),a.textContent=`Coach "${s||t}" added to whitelist. They can now sign up with this email.`,a.className="admin-form-message success",c.reset()}catch(m){a.textContent=`Error: ${m.message}`,a.className="admin-form-message error"}n.disabled=!1});const l=document.getElementById("family-form");if(l&&l.addEventListener("submit",async e=>{e.preventDefault();const a=document.getElementById("family-form-message"),n=document.getElementById("add-family-btn"),t=document.getElementById("family-email").value.trim(),s=document.getElementById("family-name").value.trim()||null;if(!t){a.textContent="Email is required.",a.className="admin-form-message error";return}n.disabled=!0,a.textContent="";try{if(!(await $(x(v(d,"families"),k("email","==",t)))).empty)throw new Error(y("admin_family_already_exists"));await U(v(d,"families"),{email:t,parentName:s,status:"pending",registeredUid:null,createdBy:q.uid,createdAt:new Date}),a.textContent=`"${s||t}" added successfully.`,a.className="admin-form-message success",l.reset()}catch(i){a.textContent=`Error: ${i.message}`,a.className="admin-form-message error"}n.disabled=!1}),h==="family"){const e=document.getElementById("family-table-body");if(e){const a=x(v(d,"families"),_("createdAt","desc"));B(a,n=>{const t=n.docs.map(s=>{var f,g;const i=s.data(),m=((g=(f=i.createdAt)==null?void 0:f.toDate)==null?void 0:g.call(f))||new Date(i.createdAt),o=i.status==="registered"?y("admin_family_status_registered"):y("admin_family_status_pending"),E=i.status==="registered"?"admin-status-active":"admin-status-pending";return`
            <tr>
              <td>${i.email||"—"}</td>
              <td>${i.parentName||"—"}</td>
              <td><span class="admin-status ${E}">${o}</span></td>
              <td>${m.toLocaleDateString()}</td>
              <td><button class="btn btn-outline btn-sm family-delete-btn" data-id="${s.id}" data-email="${i.email||""}" style="color: var(--color-accent);">${y("admin_family_delete")}</button></td>
            </tr>
          `}).join("");e.innerHTML=t||'<tr><td colspan="5" class="admin-empty">No families authorized yet.</td></tr>',e.querySelectorAll(".family-delete-btn").forEach(s=>{s.addEventListener("click",async()=>{const i=s.dataset.id,m=s.dataset.email;if(confirm(y("admin_family_delete_confirm")+`

`+m))try{const o=await L(w(d,"families",i)),E=o.exists()?o.data().registeredUid:null,f=x(v(d,"registrations"),k("parentEmails","array-contains",m)),g=await $(f);let D=[];g.empty||(D=(g.docs[0].data().parentEmails||[]).filter(b=>b!==m&&b!==""));for(const C of D){const b=await $(x(v(d,"families"),k("email","==",C)));if(!b.empty){if(confirm("This family has another parent: "+C+`

Their whitelist entry is still active. Remove them too?

OK = Remove both  |  Cancel = Remove only `+m))for(const R of b.docs){const T=R.data().registeredUid;T&&await A(w(d,"users",T),{role:"removed"}).catch(()=>{}),await I(w(d,"families",R.id))}break}}E&&await A(w(d,"users",E),{role:"removed"}).catch(()=>{}),await I(w(d,"families",i))}catch(o){console.error("Error deleting family:",o),alert("Failed to delete: "+o.message)}})})},n=>{e.innerHTML=`<tr><td colspan="5" class="admin-empty">Error loading: ${n.message}</td></tr>`})}}if(h==="manage"){const e=document.getElementById("coach-table-body"),a=document.getElementById("pending-count");if(!e)return;const n=x(v(d,"coaches"),_("createdAt","desc"));B(n,t=>{let s=0;const i=t.docs.map(m=>{var b,S;const o=m.data();o.status==="pending"&&s++;const E=((S=(b=o.createdAt)==null?void 0:b.toDate)==null?void 0:S.call(b))||new Date(o.createdAt),f=o.role==="admin"?"Admin Coach":"Coach",g=o.role==="admin"?"admin-role-admin":"admin-role-coach",D=o.status==="active"?"active":"pending",C=o.status==="active"?"admin-status-active":"admin-status-pending";return`
          <tr>
            <td>${o.email||"—"}</td>
            <td>${o.displayName||"—"}</td>
            <td><span class="admin-role-badge ${g}">${f}</span></td>
            <td><span class="admin-status ${C}">${D}</span></td>
            <td>${E.toLocaleDateString()}</td>
            <td><button class="btn btn-outline btn-sm coach-delete-btn" data-id="${m.id}" data-email="${o.email||""}" style="color: var(--color-accent);">Delete</button></td>
          </tr>
        `}).join("");e.innerHTML=i||'<tr><td colspan="6" class="admin-empty">No coaches yet.</td></tr>',a.textContent=`${s} pending`,e.querySelectorAll(".coach-delete-btn").forEach(m=>{m.addEventListener("click",async()=>{const o=m.dataset.id,E=m.dataset.email;if(confirm(`Remove this coach authorization?

`+E))try{const f=await L(w(d,"coaches",o)),g=f.exists()?f.data().registeredUid:null;g&&await A(w(d,"users",g),{role:"removed"}).catch(()=>{}),await I(w(d,"coaches",o))}catch(f){console.error("Error deleting coach:",f),alert("Failed to delete: "+f.message)}})})},t=>{e.innerHTML=`<tr><td colspan="6" class="admin-empty">Error loading: ${t.message}</td></tr>`})}if(h==="export"){const e=document.getElementById("admin-export-csv-btn"),a=document.getElementById("export-filename-preview");if(a){const n=new Date().toISOString().slice(0,10);a.textContent=`dragon-full-roster-${n}.csv`}(p=document.getElementById("export-select-all"))==null||p.addEventListener("click",()=>{document.querySelectorAll(".export-col-cb").forEach(n=>{n.checked=!0})}),(u=document.getElementById("export-deselect-all"))==null||u.addEventListener("click",()=>{document.querySelectorAll(".export-col-cb").forEach(n=>{n.checked=!1})}),e==null||e.addEventListener("click",()=>{const n=[];if(document.querySelectorAll(".export-col-cb:checked").forEach(i=>{n.push(i.value)}),n.length===0){const i=document.getElementById("export-message");i.textContent="Please select at least one column.",i.className="admin-form-message error";return}const t=new Date().toISOString().slice(0,10);G(N,`dragon-full-roster-${t}.csv`,n);const s=document.getElementById("export-message");s&&(s.textContent=`Download started — ${n.length} columns.`,s.className="admin-form-message success",setTimeout(()=>{s.textContent="",s.className="admin-form-message"},3e3))})}}
