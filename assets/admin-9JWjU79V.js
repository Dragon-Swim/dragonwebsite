import{i as V,t as i}from"./i18n-CRIkWtj0.js";import{X}from"./xlsx-DkFutVy2.js";import{o as z,h as q,g as N,e as v,q as S,l as F,c as E,k as T,b as O,t as G,i as L,w as I,a as P,u as A,f as R}from"./firebase-CorBctTj.js";const j=[{key:"firstName",label:"First Name"},{key:"lastName",label:"Last Name"},{key:"gender",label:"Gender"},{key:"age",label:"Age"},{key:"dob",label:"DOB"},{key:"usaSwimmingId",label:"USA Swimming ID"},{key:"status",label:"Status"},{key:"parentFirstName",label:"Parent First Name"},{key:"parentLastName",label:"Parent Last Name"},{key:"parentEmail",label:"Parent Email"},{key:"parentPhone",label:"Parent Phone"},{key:"address",label:"Address"},{key:"ecName",label:"Emergency Contact Name"},{key:"ecPhone",label:"Emergency Contact Phone"}];function J(f,n){const e=f.parent||{},o=f.emergencyContact||{},r=n.dob?Math.floor((new Date-new Date(n.dob))/(365.25*24*60*60*1e3)):"";return{firstName:n.firstName||"",lastName:n.lastName||"",gender:n.gender||"",age:r,dob:n.dob||"",usaSwimmingId:n.usaSwimmingId||"",status:n.status||"pending",parentFirstName:e.firstName||"",parentLastName:e.lastName||"",parentEmail:e.email||"",parentPhone:e.phone||"",address:e.address||"",ecName:o.name||"",ecPhone:o.phone||""}}function Q(f,n,e){const o=e&&e.length>0?e:j.map(a=>a.key),r={};for(const a of j)r[a.key]=a;const m=o.map(a=>{var u;return((u=r[a])==null?void 0:u.label)||a}),d=[];for(const a of f){const u=a.swimmers||[];for(const p of u){if(p.deleted)continue;const l=J(a,p);d.push(o.map(g=>H(l[g]??"")).join(","))}}const c=[m.map(a=>H(a)).join(","),...d].join(`
`);W(c,n)}function H(f){return`"${String(f).replace(/"/g,'""')}"`}function W(f,n){const e=new Blob([f],{type:"text/csv;charset=utf-8;"}),o=URL.createObjectURL(e),r=document.createElement("a");r.href=o,r.download=n,document.body.appendChild(r),r.click(),document.body.removeChild(r),URL.revokeObjectURL(o)}window.XLSX=X;V();let C=null,_="coach",k=[];const K=document.getElementById("app");function w(f){return String(f).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}z(O,async f=>{if(!f){window.location.href="/signin.html";return}const n=await q(N(v,"users",f.uid));if((n.exists()?n.data().role:null)!=="admin"){window.location.href="/dashboard.html";return}C=f;const o=S(E(v,"registrations"),F("createdAt","desc"));T(o,r=>{k=r.docs.map(m=>({id:m.id,...m.data()})),(_==="export"||_==="editreg")&&D()}),D()});function D(){K.innerHTML=`
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <div class="admin-sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <nav class="admin-nav">
          <button class="admin-nav-item ${_==="coach"?"active":""}" data-tab="coach">
            👥 Add Coach
          </button>
          <button class="admin-nav-item ${_==="family"?"active":""}" data-tab="family">
            👪 Add Family
          </button>
          <button class="admin-nav-item ${_==="export"?"active":""}" data-tab="export">
            📥 Export Data
          </button>
          <button class="admin-nav-item ${_==="editreg"?"active":""}" data-tab="editreg">
            ✏️ Edit Registrations
          </button>
        </nav>
        <div class="admin-sidebar-footer">
          <a href="/dashboard.html" class="admin-nav-item">← Back to Dashboard</a>
          <button class="admin-nav-item" id="admin-signout" style="color: var(--color-accent);">🚪 Sign Out</button>
        </div>
      </aside>

      <main class="admin-main">
        <header class="admin-topbar">
          <h1 class="admin-page-title">${_==="coach"?"Add Coach":_==="family"?"Add Family":_==="editreg"?"Edit Registrations":"Export Data"}</h1>
        </header>
        <div class="admin-content">
          ${_==="coach"?Y():_==="family"?Z():_==="editreg"?te():ee()}
        </div>
      </main>
    </div>
  `,ne()}function Y(){return`
    <div class="admin-panel">
      <h3>Pre-authorize Coach</h3>
      <p class="admin-hint">Add a coach's email to the whitelist. They will create their own account and set their own password when they sign up.</p>
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

    <div class="admin-panel" style="margin-top: 2rem;">
      <div class="admin-panel-header">
        <h3>All Coaches</h3>
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
  `}function Z(){return`
    <div class="admin-panel">
      <h3>${i("admin_family_title")}</h3>
      <p class="admin-hint">${i("admin_family_hint")}</p>
      <form id="family-form" class="admin-form">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="family-email">${i("admin_family_email")}</label>
            <input class="form-input" type="email" id="family-email" placeholder="parent@example.com" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="family-name">${i("admin_family_name")}</label>
            <input class="form-input" type="text" id="family-name" placeholder="e.g. John Chen" />
          </div>
        </div>
        <button type="submit" class="btn btn-primary" id="add-family-btn">${i("admin_family_add_btn")}</button>
        <p id="family-form-message" class="admin-form-message"></p>
      </form>
      <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color);">
        <p class="admin-hint">Or upload an Excel file (.xls/.xlsx) with columns: <strong>email</strong>, <strong>name</strong></p>
        <button class="btn btn-outline btn-sm" id="family-upload-btn">📤 ${i("admin_family_upload_btn")}</button>
        <p id="family-upload-message" class="admin-form-message"></p>
      </div>
    </div>

    <div class="admin-panel" style="margin-top: 2rem;">
      <h3>${i("admin_family_list_title")}</h3>
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
  `}function ee(){let f=k.length,n=0;const e={pending:0,active:0,inactive:0};for(const m of k){const d=m.swimmers||[];for(const c of d){if(c.deleted)continue;n++;const a=c.status||"pending";e[a]=(e[a]||0)+1}}const o=["Families","Swimmers","Active","Pending","Inactive"],r=[f,n,e.active||0,e.pending||0,e.inactive||0];return`
    <div class="admin-panel">
      <h3>Export All Registration Data</h3>
      <p class="admin-hint">Download a CSV file with every swimmer and their family contact information.</p>

      <table class="admin-table" style="margin: 1.5rem 0; max-width: 600px;">
        <thead>
          <tr>${o.map(m=>`<th>${m}</th>`).join("")}</tr>
        </thead>
        <tbody>
          <tr>${r.map(m=>`<td style="font-weight: 600; font-size: 1.1rem;">${m}</td>`).join("")}</tr>
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
          ${j.map(m=>`
            <label class="checkbox-label" style="display: inline-flex; align-items: center; gap: 0.35rem; cursor: pointer;">
              <input type="checkbox" class="export-col-cb" value="${m.key}" checked />
              <span>${m.label}</span>
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
  `}function te(){const f=k;return`
    <div class="admin-panel" style="max-width: 100%;">
      <h3>${i("admin_edit_tab")}</h3>
      <p class="admin-hint">Click a family row to view and edit their registration data.</p>
      <input type="text" class="edit-reg-search" id="edit-reg-search" placeholder="${i("admin_edit_search")}" />
      <div class="edit-reg-table-wrapper">
        <table class="edit-reg-table">
          <thead>
            <tr>
              <th>Parent Name</th>
              <th>Email</th>
              <th>Swimmers</th>
              <th>Status</th>
              <th>Registered</th>
              <th>Last Edited</th>
            </tr>
          </thead>
          <tbody id="edit-reg-table-body">
            ${f.length===0?`<tr><td colspan="6" class="admin-empty">${i("admin_edit_no_results")}</td></tr>`:f.map(n=>{var a,u,p,l;const e=n.parent||{},o=[e.firstName,e.lastName].filter(Boolean).join(" ")||"—",r=(n.swimmers||[]).filter(g=>!g.deleted),m=r.length>0?'<span class="admin-status admin-status-active">active</span>':'<span class="admin-status admin-status-pending">pending</span>',d=((u=(a=n.createdAt)==null?void 0:a.toDate)==null?void 0:u.call(a))||new Date(n.createdAt||0),c=((l=(p=n.lastEditedAt)==null?void 0:p.toDate)==null?void 0:l.call(p))||(n.lastEditedAt?new Date(n.lastEditedAt):null);return`
                  <tr data-reg-id="${w(n.id||"")}" class="edit-reg-row">
                    <td><strong>${w(o)}</strong></td>
                    <td>${w(e.email||"—")}</td>
                    <td>${r.length}</td>
                    <td>${m}</td>
                    <td>${d.toLocaleDateString()}</td>
                    <td>${c?c.toLocaleDateString():"—"}</td>
                  </tr>
                `}).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}function ae(f){var l,g;const n=document.createElement("div");n.className="confirm-overlay",n.id="edit-reg-overlay";const e=f.parent||{},o=f.spouse||null,r=(f.swimmers||[]).filter(s=>!s.deleted),m=f.emergencyContact||{},d=f.notes||"",c=(s,t)=>`
    <select class="form-input" id="${t}">
      <option value="male" ${(s||"").toLowerCase()==="male"?"selected":""}>${i("admin_edit_gender_male")}</option>
      <option value="female" ${(s||"").toLowerCase()==="female"?"selected":""}>${i("admin_edit_gender_female")}</option>
    </select>
  `,a=(s,t)=>`
    <div class="edit-reg-grid">
      <div class="edit-reg-field">
        <label>${i("admin_edit_field_firstName")}</label>
        <input type="text" id="${s}-firstName" value="${w(t.firstName||"")}" />
      </div>
      <div class="edit-reg-field">
        <label>${i("admin_edit_field_lastName")}</label>
        <input type="text" id="${s}-lastName" value="${w(t.lastName||"")}" />
      </div>
      <div class="edit-reg-field">
        <label>${i("admin_edit_field_middleName")}</label>
        <input type="text" id="${s}-middleName" value="${w(t.middleName||"")}" />
      </div>
      <div class="edit-reg-field">
        <label>${i("admin_edit_field_gender")}</label>
        ${c(t.gender,`${s}-gender`)}
      </div>
      <div class="edit-reg-field">
        <label>${i("admin_edit_field_email")}</label>
        <input type="email" id="${s}-email" value="${w(t.email||"")}" />
      </div>
      <div class="edit-reg-field">
        <label>${i("admin_edit_field_phone")}</label>
        <input type="text" id="${s}-phone" value="${w(t.phone||"")}" />
      </div>
      ${s==="parent"?`
        <div class="edit-reg-field full-width">
          <label>${i("admin_edit_field_address")}</label>
          <input type="text" id="${s}-address" value="${w(t.address||"")}" />
        </div>
      `:""}
    </div>
  `,u=(s,t)=>`
    <div class="edit-reg-swimmer-card" data-swimmer-idx="${t}">
      <div class="edit-reg-swimmer-header">
        <span class="edit-reg-swimmer-label">Swimmer ${t+1}</span>
        <button class="edit-reg-swimmer-remove" data-remove-swimmer="${t}">${i("admin_edit_swimmer_remove")}</button>
      </div>
      <div class="edit-reg-swimmer-fields">
        <div class="edit-reg-field">
          <label>${i("admin_edit_field_firstName")}</label>
          <input type="text" id="swimmer-${t}-firstName" value="${w(s.firstName||"")}" />
        </div>
        <div class="edit-reg-field">
          <label>${i("admin_edit_field_lastName")}</label>
          <input type="text" id="swimmer-${t}-lastName" value="${w(s.lastName||"")}" />
        </div>
        <div class="edit-reg-field">
          <label>${i("admin_edit_field_middleName")}</label>
          <input type="text" id="swimmer-${t}-middleName" value="${w(s.middleName||"")}" />
        </div>
        <div class="edit-reg-field">
          <label>${i("admin_edit_field_gender")}</label>
          ${c(s.gender,`swimmer-${t}-gender`)}
        </div>
        <div class="edit-reg-field">
          <label>${i("admin_edit_field_dob")}</label>
          <input type="date" id="swimmer-${t}-dob" value="${w(s.dob||"")}" />
        </div>
        <div class="edit-reg-field">
          <label>${i("admin_edit_field_usaSwimmingId")}</label>
          <input type="text" id="swimmer-${t}-usaSwimmingId" value="${w(s.usaSwimmingId||"")}" />
        </div>
      </div>
    </div>
  `;n.innerHTML=`
    <div class="confirm-modal edit-reg-modal">
      <h3 class="confirm-title">${i("admin_edit_title")}</h3>
      <div class="edit-reg-body">
        <!-- Parent -->
        <div class="edit-reg-section">
          <p class="edit-reg-section-title">${i("admin_edit_section_parent")}</p>
          ${a("parent",e)}
        </div>

        <!-- Spouse -->
        <div class="edit-reg-section">
          <p class="edit-reg-section-title">${i("admin_edit_section_spouse")}</p>
          ${o?a("spouse",o):`<p class="edit-reg-no-spouse">${i("admin_edit_no_spouse")}</p>`}
          <!-- Always render hidden spouse fields so admin can add spouse -->
          <div id="spouse-fields" style="${o?"":"display:none;"}">
            ${o?"":a("spouse",{})}
          </div>
          ${o?"":'<button class="edit-reg-add-swimmer-btn" id="add-spouse-btn" style="width:auto;">+ Add Spouse</button>'}
        </div>

        <!-- Swimmers -->
        <div class="edit-reg-section">
          <p class="edit-reg-section-title">${i("admin_edit_section_swimmers")}</p>
          <div class="edit-reg-swimmers" id="swimmers-container">
            ${r.map((s,t)=>u(s,t)).join("")}
          </div>
          <button class="edit-reg-add-swimmer-btn" id="add-swimmer-btn">${i("admin_edit_swimmer_add")}</button>
        </div>

        <!-- Emergency Contact -->
        <div class="edit-reg-section">
          <p class="edit-reg-section-title">${i("admin_edit_section_emergency")}</p>
          <div class="edit-reg-grid">
            <div class="edit-reg-field">
              <label>${i("admin_edit_field_firstName")}</label>
              <input type="text" id="emergency-name" value="${w(m.name||"")}" />
            </div>
            <div class="edit-reg-field">
              <label>${i("admin_edit_field_phone")}</label>
              <input type="text" id="emergency-phone" value="${w(m.phone||"")}" />
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div class="edit-reg-section">
          <p class="edit-reg-section-title">${i("admin_edit_section_notes")}</p>
          <div class="edit-reg-field full-width">
            <textarea id="edit-notes" placeholder="Internal notes...">${w(d)}</textarea>
          </div>
        </div>
      </div>

      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="edit-reg-cancel">${i("admin_edit_cancel_btn")}</button>
        <button class="btn btn-primary btn-sm" id="edit-reg-save">${i("admin_edit_save_btn")}</button>
      </div>
    </div>
  `,document.body.appendChild(n);let p=r.length;n.querySelector("#edit-reg-cancel").addEventListener("click",()=>n.remove()),n.addEventListener("click",s=>{s.target===n&&n.remove()}),(l=n.querySelector("#add-spouse-btn"))==null||l.addEventListener("click",()=>{const s=document.getElementById("spouse-fields");s&&(s.style.display="block",s.innerHTML=a("spouse",{}));const t=n.querySelector("#add-spouse-btn");t&&t.remove()}),n.addEventListener("click",s=>{const t=s.target.closest("[data-remove-swimmer]");if(!t)return;const h=t.closest(".edit-reg-swimmer-card");h&&(h.style.display="none",h.dataset.removed="true")}),(g=n.querySelector("#add-swimmer-btn"))==null||g.addEventListener("click",()=>{const s=document.getElementById("swimmers-container"),t={firstName:"",lastName:"",middleName:"",gender:"",dob:"",usaSwimmingId:""},h=document.createElement("div");h.innerHTML=u(t,p),s.appendChild(h.firstElementChild),p++}),n.querySelector("#edit-reg-save").addEventListener("click",async()=>{await ie(f.id,n),n.remove(),D()})}async function ie(f,n){const e=l=>{var g;return((g=n.querySelector("#"+l))==null?void 0:g.value)||""},o={firstName:e("parent-firstName"),lastName:e("parent-lastName"),middleName:e("parent-middleName")||null,gender:e("parent-gender"),email:e("parent-email"),phone:e("parent-phone"),address:e("parent-address")},r=e("spouse-firstName");let m=null;(r||e("spouse-lastName")||e("spouse-email"))&&(m={firstName:r,lastName:e("spouse-lastName"),middleName:e("spouse-middleName")||null,gender:e("spouse-gender")||null,email:e("spouse-email")||null,phone:e("spouse-phone")||null});const d=[];n.querySelectorAll(".edit-reg-swimmer-card").forEach(l=>{if(l.dataset.removed==="true")return;const g=l.dataset.swimmerIdx;d.push({firstName:e(`swimmer-${g}-firstName`),lastName:e(`swimmer-${g}-lastName`),middleName:e(`swimmer-${g}-middleName`)||null,gender:e(`swimmer-${g}-gender`),dob:e(`swimmer-${g}-dob`)||null,usaSwimmingId:e(`swimmer-${g}-usaSwimmingId`)||null})});const a={name:e("emergency-name"),phone:e("emergency-phone")},u=[o.email];if(m&&m.email){const l=m.email.toLowerCase().trim();l&&!u.includes(l)&&u.push(l)}const p={parent:o,spouse:m,swimmers:d,emergencyContact:a,notes:e("edit-notes")||null,parentEmails:u,lastEditedBy:(C==null?void 0:C.email)||"unknown",lastEditedAt:new Date};try{await A(N(v,"registrations",f),p);const l=document.getElementById("family-upload-message");l&&(l.textContent=i("admin_edit_save_success"),l.className="admin-form-message success",setTimeout(()=>{l.textContent="",l.className="admin-form-message"},3e3))}catch(l){console.error("Error saving registration:",l),alert(i("admin_edit_save_error")+": "+l.message)}}function ne(){var o,r,m;document.querySelectorAll(".admin-nav-item[data-tab]").forEach(d=>{d.addEventListener("click",()=>{_=d.dataset.tab,D()})}),(o=document.getElementById("admin-signout"))==null||o.addEventListener("click",async()=>{await G(O),window.location.href="/signin.html"});const f=document.getElementById("coach-form");f&&f.addEventListener("submit",async d=>{d.preventDefault();const c=document.getElementById("coach-form-message"),a=document.getElementById("create-coach-btn"),u=document.getElementById("coach-email").value.trim(),p=document.getElementById("coach-name").value.trim()||null,l=document.getElementById("coach-role").value;if(!u){c.textContent="Email is required.",c.className="admin-form-message error";return}a.disabled=!0,c.textContent="";try{if(!(await L(S(E(v,"coaches"),I("email","==",u)))).empty)throw new Error("A coach with this email already exists.");if(!(await L(S(E(v,"families"),I("email","==",u)))).empty)throw new Error("This email is already in the family whitelist.");await P(E(v,"coaches"),{email:u,displayName:p,role:l,status:"pending",registeredUid:null,createdBy:C.uid,createdAt:new Date}),c.textContent=`Coach "${p||u}" added to whitelist. They can now sign up with this email.`,c.className="admin-form-message success",f.reset()}catch(g){c.textContent=`Error: ${g.message}`,c.className="admin-form-message error"}a.disabled=!1});const n=document.getElementById("family-form");n&&n.addEventListener("submit",async d=>{d.preventDefault();const c=document.getElementById("family-form-message"),a=document.getElementById("add-family-btn"),u=document.getElementById("family-email").value.trim(),p=document.getElementById("family-name").value.trim()||null;if(!u){c.textContent="Email is required.",c.className="admin-form-message error";return}a.disabled=!0,c.textContent="";try{if(!(await L(S(E(v,"families"),I("email","==",u)))).empty)throw new Error(i("admin_family_already_exists"));await P(E(v,"families"),{email:u,parentName:p,status:"pending",registeredUid:null,createdBy:C.uid,createdAt:new Date}),c.textContent=`"${p||u}" added successfully.`,c.className="admin-form-message success",n.reset()}catch(l){c.textContent=`Error: ${l.message}`,c.className="admin-form-message error"}a.disabled=!1});const e=document.getElementById("family-upload-btn");if(e&&e.addEventListener("click",()=>{const d=document.createElement("input");d.type="file",d.accept=".xls,.xlsx",d.addEventListener("change",se),d.click()}),_==="family"){const d=document.getElementById("family-table-body");if(d){const c=S(E(v,"families"),F("createdAt","desc"));T(c,a=>{const u=a.docs.map(p=>{var h,b;const l=p.data(),g=((b=(h=l.createdAt)==null?void 0:h.toDate)==null?void 0:b.call(h))||new Date(l.createdAt),s=l.status==="registered"?i("admin_family_status_registered"):i("admin_family_status_pending"),t=l.status==="registered"?"admin-status-active":"admin-status-pending";return`
            <tr>
              <td>${l.email||"—"}</td>
              <td>${l.parentName||"—"}</td>
              <td><span class="admin-status ${t}">${s}</span></td>
              <td>${g.toLocaleDateString()}</td>
              <td><button class="btn btn-outline btn-sm family-delete-btn" data-id="${p.id}" data-email="${l.email||""}" style="color: var(--color-accent);">${i("admin_family_delete")}</button></td>
            </tr>
          `}).join("");d.innerHTML=u||'<tr><td colspan="5" class="admin-empty">No families authorized yet.</td></tr>',d.querySelectorAll(".family-delete-btn").forEach(p=>{p.addEventListener("click",async()=>{const l=p.dataset.id,g=p.dataset.email;if(confirm(i("admin_family_delete_confirm")+`

`+g))try{const s=await q(N(v,"families",l)),t=s.exists()?s.data().registeredUid:null,h=S(E(v,"registrations"),I("parentEmails","array-contains",g)),b=await L(h);let y=[];b.empty||(y=(b.docs[0].data().parentEmails||[]).filter($=>$!==g&&$!==""));for(const x of y){const $=await L(S(E(v,"families"),I("email","==",x)));if(!$.empty){if(confirm("This family has another parent: "+x+`

Their whitelist entry is still active. Remove them too?

OK = Remove both  |  Cancel = Remove only `+g))for(const M of $.docs){const U=M.data().registeredUid;U&&await A(N(v,"users",U),{role:"removed"}).catch(()=>{}),await R(N(v,"families",M.id))}break}}t&&await A(N(v,"users",t),{role:"removed"}).catch(()=>{}),await R(N(v,"families",l))}catch(s){console.error("Error deleting family:",s),alert("Failed to delete: "+s.message)}})})},a=>{d.innerHTML=`<tr><td colspan="5" class="admin-empty">Error loading: ${a.message}</td></tr>`})}}if(_==="coach"){const d=document.getElementById("coach-table-body"),c=document.getElementById("pending-count");if(!d)return;const a=S(E(v,"coaches"),F("createdAt","desc"));T(a,u=>{let p=0;const l=u.docs.map(g=>{var $,B;const s=g.data();s.status==="pending"&&p++;const t=((B=($=s.createdAt)==null?void 0:$.toDate)==null?void 0:B.call($))||new Date(s.createdAt),h=s.role==="admin"?"Admin Coach":"Coach",b=s.role==="admin"?"admin-role-admin":"admin-role-coach",y=s.status==="active"?"active":"pending",x=s.status==="active"?"admin-status-active":"admin-status-pending";return`
          <tr>
            <td>${s.email||"—"}</td>
            <td>${s.displayName||"—"}</td>
            <td><span class="admin-role-badge ${b}">${h}</span></td>
            <td><span class="admin-status ${x}">${y}</span></td>
            <td>${t.toLocaleDateString()}</td>
            <td><button class="btn btn-outline btn-sm coach-delete-btn" data-id="${g.id}" data-email="${s.email||""}" style="color: var(--color-accent);">Delete</button></td>
          </tr>
        `}).join("");d.innerHTML=l||'<tr><td colspan="6" class="admin-empty">No coaches yet.</td></tr>',c.textContent=`${p} pending`,d.querySelectorAll(".coach-delete-btn").forEach(g=>{g.addEventListener("click",async()=>{const s=g.dataset.id,t=g.dataset.email;if(confirm(`Remove this coach authorization?

`+t))try{const h=await q(N(v,"coaches",s)),b=h.exists()?h.data().registeredUid:null;b&&await A(N(v,"users",b),{role:"removed"}).catch(()=>{}),await R(N(v,"coaches",s))}catch(h){console.error("Error deleting coach:",h),alert("Failed to delete: "+h.message)}})})},u=>{d.innerHTML=`<tr><td colspan="6" class="admin-empty">Error loading: ${u.message}</td></tr>`})}if(_==="export"){const d=document.getElementById("admin-export-csv-btn"),c=document.getElementById("export-filename-preview");if(c){const a=new Date().toISOString().slice(0,10);c.textContent=`dragon-full-roster-${a}.csv`}(r=document.getElementById("export-select-all"))==null||r.addEventListener("click",()=>{document.querySelectorAll(".export-col-cb").forEach(a=>{a.checked=!0})}),(m=document.getElementById("export-deselect-all"))==null||m.addEventListener("click",()=>{document.querySelectorAll(".export-col-cb").forEach(a=>{a.checked=!1})}),d==null||d.addEventListener("click",()=>{const a=[];if(document.querySelectorAll(".export-col-cb:checked").forEach(l=>{a.push(l.value)}),a.length===0){const l=document.getElementById("export-message");l.textContent="Please select at least one column.",l.className="admin-form-message error";return}const u=new Date().toISOString().slice(0,10);Q(k,`dragon-full-roster-${u}.csv`,a);const p=document.getElementById("export-message");p&&(p.textContent=`Download started — ${a.length} columns.`,p.className="admin-form-message success",setTimeout(()=>{p.textContent="",p.className="admin-form-message"},3e3))})}if(_==="editreg"){const d=document.getElementById("edit-reg-search"),c=document.getElementById("edit-reg-table-body");d&&c&&(d.addEventListener("input",()=>{const a=d.value.toLowerCase().trim();c.querySelectorAll(".edit-reg-row").forEach(u=>{const p=u.textContent.toLowerCase();u.style.display=a===""||p.includes(a)?"":"none"})}),c.querySelectorAll(".edit-reg-row").forEach(a=>{a.addEventListener("click",()=>{const u=a.dataset.regId,p=k.find(l=>l.id===u);p&&ae(p)})}))}}async function se(f){var s;const n=(s=f.target.files)==null?void 0:s[0];if(f.target.remove(),!n)return;const e=document.getElementById("family-upload-message");e&&(e.textContent="",e.className="admin-form-message");const o=window.XLSX;if(!o){e&&(e.textContent="Excel parser not loaded. Please refresh the page.",e.className="admin-form-message error");return}let r;try{const t=await n.arrayBuffer(),h=o.read(new Uint8Array(t),{type:"array"}),b=h.Sheets[h.SheetNames[0]];r=o.utils.sheet_to_json(b,{header:1,defval:null})}catch(t){console.error("Excel parse error:",t),e&&(e.textContent=i("admin_family_upload_parse_error"),e.className="admin-form-message error");return}if(!r||r.length<2){e&&(e.textContent=i("admin_family_upload_empty"),e.className="admin-form-message error");return}const m=r[0];if(!m){e&&(e.textContent=i("admin_family_upload_parse_error"),e.className="admin-form-message error");return}const d=m.findIndex(t=>t&&String(t).toLowerCase().trim()==="email"),c=m.findIndex(t=>t&&String(t).toLowerCase().trim()==="name");if(d===-1){e&&(e.textContent=i("admin_family_upload_parse_error"),e.className="admin-form-message error");return}const a=[],u=new Set;for(let t=1;t<r.length;t++){const h=r[t];if(!h||h.every($=>$==null||String($).trim()===""))continue;const b=h[d]?String(h[d]).trim():"",y=c!==-1&&h[c]?String(h[c]).trim():"";if(!b)continue;if(!b.includes("@")||!b.includes(".")){a.push({email:b,name:y,rowNum:t+1,error:"Invalid email format"});continue}const x=b.toLowerCase();if(u.has(x)){a.push({email:b,name:y,rowNum:t+1,error:"Duplicate email in file"});continue}u.add(x),a.push({email:b,name:y,rowNum:t+1})}if(a.length===0){e&&(e.textContent=i("admin_family_upload_empty"),e.className="admin-form-message error");return}let p=[];try{p=(await L(E(v,"families"))).docs.map(h=>({id:h.id,...h.data()}))}catch(t){console.error("Error fetching families:",t),e&&(e.textContent=i("admin_family_upload_error"),e.className="admin-form-message error");return}const l=new Map;for(const t of p)l.set((t.email||"").toLowerCase(),t);const g=le(a,l);de(g,n.name)}function le(f,n){const e={new:[],update:[],conflict:[],skip:[],errors:[]};for(const o of f){if(o.error){e.errors.push(o);continue}const r=o.email.toLowerCase(),m=n.get(r);if(!m){e.new.push(o);continue}const d=(m.parentName||"").trim(),c=(o.name||"").trim();!c&&!d||d.toLowerCase()===c.toLowerCase()?e.skip.push(o):!d&&c?e.update.push({...o,existingId:m.id}):e.conflict.push({...o,existingId:m.id,existingName:d})}return e}function de(f,n){var h,b;const{new:e,update:o,conflict:r,skip:m,errors:d}=f,c=e.length+o.length+r.length+m.length+d.length,a=r.length>0,u=e.length+o.length>0,p=(y,x)=>`<span class="status-badge ${x}">${y}</span>`,l=[...e.map(y=>({...y,status:"new"})),...o.map(y=>({...y,status:"updated"})),...r.map(y=>({...y,status:"conflict"})),...m.map(y=>({...y,status:"skipped"})),...d.map(y=>({...y,status:"error"}))],g=l.length>0?`
    <div class="family-preview-table-wrapper">
      <table class="family-preview-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Email</th>
            <th>${i("admin_family_conflict_col_excel_name")}</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${l.map(y=>`
            <tr>
              <td>${y.rowNum||"—"}</td>
              <td>${w(y.email)}</td>
              <td>${w(y.name||"—")}</td>
              <td>${p(y.status,y.status)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `:"",s=a?`
    <div class="family-conflict-block">
      <p class="family-conflict-title">${i("admin_family_upload_conflicts_title")}</p>
      <p class="family-conflict-hint">${i("admin_family_upload_conflict_hint")}</p>
      <div class="family-conflict-table-wrapper">
        <table class="family-conflict-table">
          <thead>
            <tr>
              <th>${i("admin_family_conflict_col_email")}</th>
              <th>${i("admin_family_conflict_col_excel_name")}</th>
              <th>${i("admin_family_conflict_col_existing_name")}</th>
            </tr>
          </thead>
          <tbody>
            ${r.map(y=>`
              <tr>
                <td>${w(y.email)}</td>
                <td>${w(y.name||"—")}</td>
                <td>${w(y.existingName||"—")}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `:"",t=document.createElement("div");t.className="confirm-overlay",t.innerHTML=`
    <div class="confirm-modal family-import-modal">
      <h3 class="confirm-title">${i("admin_family_upload_title")}</h3>
      <p class="family-import-filename">${i("admin_family_upload_file")}: <strong>${w(n)}</strong></p>

      <div class="family-summary">
        <span class="family-summary-item new">${i("admin_family_upload_summary",{total:String(c),new:String(e.length),updated:String(o.length),conflict:String(r.length),skipped:String(m.length)})}</span>
        ${d.length>0?`<span class="family-summary-item conflict">⚠ ${d.length} errors</span>`:""}
      </div>

      ${s}

      ${a?`<p class="confirm-warning" style="text-align: center;">${i("admin_family_upload_conflict_hint")}</p>`:`<p style="text-align: center; color: #16A34A; font-weight: var(--fw-semibold); margin-bottom: 1rem;">✅ ${i("admin_family_upload_no_conflicts")}</p>`}

      ${g}

      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="family-import-cancel">${i("admin_family_upload_cancel")}</button>
        ${u&&!a?`<button class="btn btn-primary btn-sm" id="family-import-confirm">${i("admin_family_upload_confirm",{count:String(e.length+o.length)})}</button>`:""}
      </div>
    </div>
  `,document.body.appendChild(t),(h=t.querySelector("#family-import-cancel"))==null||h.addEventListener("click",()=>t.remove()),(b=t.querySelector("#family-import-confirm"))==null||b.addEventListener("click",async()=>{t.remove(),await oe(f)}),t.addEventListener("click",y=>{y.target===t&&t.remove()})}async function oe(f){const{new:n,update:e}=f,o=n.length+e.length,r=document.getElementById("family-upload-message");if(o!==0)try{for(const m of n)await P(E(v,"families"),{email:m.email,parentName:m.name||null,status:"pending",registeredUid:null,createdBy:(C==null?void 0:C.uid)||null,createdAt:new Date});for(const m of e)await A(N(v,"families",m.existingId),{parentName:m.name});r&&(r.textContent=i("admin_family_upload_success",{count:String(o)}),r.className="admin-form-message success")}catch(m){console.error("Batch import error:",m),r&&(r.textContent=i("admin_family_upload_error"),r.className="admin-form-message error")}}
