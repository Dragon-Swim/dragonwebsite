import{i as Q,t as l}from"./i18n-xMjO5e8v.js";import{X as Y}from"./xlsx-DkFutVy2.js";import{o as K,h as U,g as C,e as y,q as I,l as O,c as x,k as H,b as J,t as Z,i as A,w as q,a as V,u as R,f as P}from"./firebase-CorBctTj.js";import{l as ee,n as j,a as te,A as ae}from"./registrationCompleteness-jyrzMcbu.js";const X=[{key:"firstName",label:"First Name"},{key:"lastName",label:"Last Name"},{key:"gender",label:"Gender"},{key:"age",label:"Age"},{key:"dob",label:"DOB"},{key:"usaSwimmingId",label:"USA Swimming ID"},{key:"status",label:"Status"},{key:"parentFirstName",label:"Parent First Name"},{key:"parentLastName",label:"Parent Last Name"},{key:"parentEmail",label:"Parent Email"},{key:"parentPhone",label:"Parent Phone"},{key:"address",label:"Address"},{key:"ecName",label:"Emergency Contact Name"},{key:"ecPhone",label:"Emergency Contact Phone"}];function ie(r,s){const e=r.parent||{},d=r.emergencyContact||{},m=s.dob?Math.floor((new Date-new Date(s.dob))/(365.25*24*60*60*1e3)):"";return{firstName:s.firstName||"",lastName:s.lastName||"",gender:s.gender||"",age:m,dob:s.dob||"",usaSwimmingId:s.usaSwimmingId||"",status:s.status||"pending",parentFirstName:e.firstName||"",parentLastName:e.lastName||"",parentEmail:e.email||"",parentPhone:e.phone||"",address:e.address||"",ecName:d.name||"",ecPhone:d.phone||""}}function se(r,s,e){const d=e&&e.length>0?e:X.map(u=>u.key),m={};for(const u of X)m[u.key]=u;const o=d.map(u=>{var b;return((b=m[u])==null?void 0:b.label)||u}),f=[];for(const u of r){const b=u.swimmers||[];for(const v of b){if(v.deleted)continue;const c=ie(u,v);f.push(d.map(i=>W(c[i]??"")).join(","))}}const g=[o.map(u=>W(u)).join(","),...f].join(`
`);ne(g,s)}function W(r){return`"${String(r).replace(/"/g,'""')}"`}function ne(r,s){const e=new Blob([r],{type:"text/csv;charset=utf-8;"}),d=URL.createObjectURL(e),m=document.createElement("a");m.href=d,m.download=s,document.body.appendChild(m),m.click(),document.body.removeChild(m),URL.revokeObjectURL(d)}window.XLSX=Y;Q();let k=null,$="coach",D=[];const le=document.getElementById("app");function w(r){return String(r).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}K(J,async r=>{if(!r){window.location.href="/signin.html";return}const s=await U(C(y,"users",r.uid));if((s.exists()?s.data().role:null)!=="admin"){window.location.href="/dashboard.html";return}k=r;const d=I(x(y,"registrations"),O("createdAt","desc"));H(d,m=>{D=m.docs.map(o=>({id:o.id,...o.data()})),($==="export"||$==="editreg")&&T()}),T()});function T(){le.innerHTML=`
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <div class="admin-sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <nav class="admin-nav">
          <button class="admin-nav-item ${$==="coach"?"active":""}" data-tab="coach">
            👥 Add Coach
          </button>
          <button class="admin-nav-item ${$==="family"?"active":""}" data-tab="family">
            👪 Add Family
          </button>
          <button class="admin-nav-item ${$==="export"?"active":""}" data-tab="export">
            📥 Export Data
          </button>
          <button class="admin-nav-item ${$==="editreg"?"active":""}" data-tab="editreg">
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
          <div class="admin-topbar-left">
            <button class="admin-hamburger" id="admin-hamburger" aria-label="Toggle menu" title="Menu">
              <span></span><span></span><span></span>
            </button>
            <h1 class="admin-page-title">${$==="coach"?"Add Coach":$==="family"?"Add Family":$==="editreg"?"Edit Registrations":"Export Data"}</h1>
          </div>
        </header>
        <div class="admin-content">
          ${$==="coach"?de():$==="family"?oe():$==="editreg"?me():re()}
        </div>
      </main>
    </div>
  `,fe()}function de(){return`
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
  `}function oe(){return`
    <div class="admin-panel">
      <h3>${l("admin_family_title")}</h3>
      <p class="admin-hint">${l("admin_family_hint")}</p>
      <form id="family-form" class="admin-form">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="family-email">${l("admin_family_email")}</label>
            <input class="form-input" type="email" id="family-email" placeholder="parent@example.com" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="family-name">${l("admin_family_name")}</label>
            <input class="form-input" type="text" id="family-name" placeholder="e.g. John Chen" />
          </div>
        </div>
        <button type="submit" class="btn btn-primary" id="add-family-btn">${l("admin_family_add_btn")}</button>
        <p id="family-form-message" class="admin-form-message"></p>
      </form>
      <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color);">
        <p class="admin-hint">Or upload an Excel file (.xls/.xlsx) with columns: <strong>email</strong>, <strong>name</strong></p>
        <button class="btn btn-outline btn-sm" id="family-upload-btn">📤 ${l("admin_family_upload_btn")}</button>
        <p id="family-upload-message" class="admin-form-message"></p>
      </div>
    </div>

    <div class="admin-panel" style="margin-top: 2rem;">
      <h3>${l("admin_family_list_title")}</h3>
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
  `}function re(){let r=D.length,s=0;const e={pending:0,active:0,inactive:0};for(const o of D){const f=o.swimmers||[];for(const g of f){if(g.deleted)continue;s++;const u=g.status||"pending";e[u]=(e[u]||0)+1}}const d=["Families","Swimmers","Active","Pending","Inactive"],m=[r,s,e.active||0,e.pending||0,e.inactive||0];return`
    <div class="admin-panel">
      <h3>Export All Registration Data</h3>
      <p class="admin-hint">Download a CSV file with every swimmer and their family contact information.</p>

      <div class="admin-table-wrapper" style="margin: 1.5rem 0; max-width: 600px;">
        <table class="admin-table">
          <thead>
            <tr>${d.map(o=>`<th>${o}</th>`).join("")}</tr>
          </thead>
          <tbody>
            <tr>${m.map(o=>`<td style="font-weight: 600; font-size: 1.1rem;">${o}</td>`).join("")}</tr>
          </tbody>
        </table>
      </div>

      <div class="admin-panel" style="background: var(--bg-secondary, #f9fafb); margin-top: 1.5rem;">
        <h4>CSV Columns</h4>
        <p class="admin-hint">
          One row per swimmer. Families with multiple swimmers appear on multiple rows with the same parent info.
          <button type="button" class="btn btn-outline btn-sm" id="export-select-all" style="margin-left: 1rem;">Select All</button>
          <button type="button" class="btn btn-outline btn-sm" id="export-deselect-all">Deselect All</button>
        </p>
        <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; margin: 1rem 0;" id="export-column-checkboxes">
          ${X.map(o=>`
            <label class="checkbox-label" style="display: inline-flex; align-items: center; gap: 0.35rem; cursor: pointer;">
              <input type="checkbox" class="export-col-cb" value="${o.key}" checked />
              <span>${o.label}</span>
            </label>
          `).join("")}
        </div>
      </div>

      <div style="margin-top: 2rem; display: flex; gap: 1rem; align-items: center;">
        <button class="btn btn-primary" id="admin-export-csv-btn" ${s===0?"disabled":""}>
          📥 Download CSV
        </button>
        <span style="color: var(--text-muted); font-size: 0.9rem;" id="export-filename-preview"></span>
      </div>
      <p id="export-message" class="admin-form-message" style="margin-top: 1rem;"></p>
    </div>
  `}function me(){const r=D;return`
    <div class="admin-panel" style="max-width: 100%;">
      <h3>${l("admin_edit_tab")}</h3>
      <p class="admin-hint">Click a family row to view and edit their registration data.</p>
      <input type="text" class="edit-reg-search" id="edit-reg-search" placeholder="${l("admin_edit_search")}" />
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
            ${r.length===0?`<tr><td colspan="6" class="admin-empty">${l("admin_edit_no_results")}</td></tr>`:r.map(s=>{var u,b,v,c;const e=s.parent||{},d=[e.firstName,e.lastName].filter(Boolean).join(" ")||"—",m=(s.swimmers||[]).filter(i=>!i.deleted),o=m.length>0?'<span class="admin-status admin-status-active">active</span>':'<span class="admin-status admin-status-pending">pending</span>',f=((b=(u=s.createdAt)==null?void 0:u.toDate)==null?void 0:b.call(u))||new Date(s.createdAt||0),g=((c=(v=s.lastEditedAt)==null?void 0:v.toDate)==null?void 0:c.call(v))||(s.lastEditedAt?new Date(s.lastEditedAt):null);return`
                  <tr data-reg-id="${w(s.id||"")}" class="edit-reg-row">
                    <td><strong>${w(d)}</strong></td>
                    <td>${w(e.email||"—")}</td>
                    <td>${m.length}</td>
                    <td>${o}</td>
                    <td>${f.toLocaleDateString()}</td>
                    <td>${g?g.toLocaleDateString():"—"}</td>
                  </tr>
                `}).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}function ce(r){var c,i;const s=document.createElement("div");s.className="confirm-overlay",s.id="edit-reg-overlay";const e=r.parent||{},d=r.spouse||null,m=(r.swimmers||[]).filter(a=>!a.deleted),o=r.emergencyContact||{},f=r.notes||"",g=(a,t)=>`
    <select class="form-input" id="${t}">
      <option value="male" ${(a||"").toLowerCase()==="male"?"selected":""}>${l("admin_edit_gender_male")}</option>
      <option value="female" ${(a||"").toLowerCase()==="female"?"selected":""}>${l("admin_edit_gender_female")}</option>
    </select>
  `,u=(a,t)=>`
    <div class="edit-reg-grid">
      <div class="edit-reg-field">
        <label>${l("admin_edit_field_firstName")}</label>
        <input type="text" id="${a}-firstName" value="${w(t.firstName||"")}" />
      </div>
      <div class="edit-reg-field">
        <label>${l("admin_edit_field_lastName")}</label>
        <input type="text" id="${a}-lastName" value="${w(t.lastName||"")}" />
      </div>
      <div class="edit-reg-field">
        <label>${l("admin_edit_field_middleName")}</label>
        <input type="text" id="${a}-middleName" value="${w(t.middleName||"")}" />
      </div>
      <div class="edit-reg-field">
        <label>${l("admin_edit_field_gender")}</label>
        ${g(t.gender,`${a}-gender`)}
      </div>
      <div class="edit-reg-field">
        <label>${l("admin_edit_field_email")}</label>
        <input type="email" id="${a}-email" value="${w(t.email||"")}" />
      </div>
      <div class="edit-reg-field">
        <label>${l("admin_edit_field_phone")}</label>
        <input type="text" id="${a}-phone" value="${w(t.phone||"")}" />
      </div>
      ${a==="parent"?`
        <div class="edit-reg-field full-width">
          <label>${l("admin_edit_field_address")}</label>
          <input type="text" id="${a}-address" value="${w(t.address||"")}" />
        </div>
      `:""}
    </div>
  `,b=(a,t)=>`
    <div class="edit-reg-swimmer-card" data-swimmer-idx="${t}">
      <div class="edit-reg-swimmer-header">
        <span class="edit-reg-swimmer-label">Swimmer ${t+1}</span>
        <button class="edit-reg-swimmer-remove" data-remove-swimmer="${t}">${l("admin_edit_swimmer_remove")}</button>
      </div>
      <div class="edit-reg-swimmer-fields">
        <div class="edit-reg-field">
          <label>${l("admin_edit_field_firstName")}</label>
          <input type="text" id="swimmer-${t}-firstName" value="${w(a.firstName||"")}" />
        </div>
        <div class="edit-reg-field">
          <label>${l("admin_edit_field_lastName")}</label>
          <input type="text" id="swimmer-${t}-lastName" value="${w(a.lastName||"")}" />
        </div>
        <div class="edit-reg-field">
          <label>${l("admin_edit_field_middleName")}</label>
          <input type="text" id="swimmer-${t}-middleName" value="${w(a.middleName||"")}" />
        </div>
        <div class="edit-reg-field">
          <label>${l("admin_edit_field_gender")}</label>
          ${g(a.gender,`swimmer-${t}-gender`)}
        </div>
        <div class="edit-reg-field">
          <label>${l("admin_edit_field_dob")}</label>
          <input type="date" id="swimmer-${t}-dob" value="${w(a.dob||"")}" />
        </div>
        <div class="edit-reg-field">
          <label>${l("admin_edit_field_usaSwimmingId")}</label>
          <input type="text" id="swimmer-${t}-usaSwimmingId" value="${w(a.usaSwimmingId||"")}" />
        </div>
      </div>
    </div>
  `;s.innerHTML=`
    <div class="confirm-modal edit-reg-modal">
      <h3 class="confirm-title">${l("admin_edit_title")}</h3>
      <div class="edit-reg-body">
        <!-- Parent -->
        <div class="edit-reg-section">
          <p class="edit-reg-section-title">${l("admin_edit_section_parent")}</p>
          ${u("parent",e)}
        </div>

        <!-- Spouse -->
        <div class="edit-reg-section">
          <p class="edit-reg-section-title">${l("admin_edit_section_spouse")}</p>
          ${d?u("spouse",d):`<p class="edit-reg-no-spouse">${l("admin_edit_no_spouse")}</p>`}
          <!-- Always render hidden spouse fields so admin can add spouse -->
          <div id="spouse-fields" style="${d?"":"display:none;"}">
            ${d?"":u("spouse",{})}
          </div>
          ${d?"":'<button class="edit-reg-add-swimmer-btn" id="add-spouse-btn" style="width:auto;">+ Add Spouse</button>'}
        </div>

        <!-- Swimmers -->
        <div class="edit-reg-section">
          <p class="edit-reg-section-title">${l("admin_edit_section_swimmers")}</p>
          <div class="edit-reg-swimmers" id="swimmers-container">
            ${m.map((a,t)=>b(a,t)).join("")}
          </div>
          <button class="edit-reg-add-swimmer-btn" id="add-swimmer-btn">${l("admin_edit_swimmer_add")}</button>
        </div>

        <!-- Emergency Contact -->
        <div class="edit-reg-section">
          <p class="edit-reg-section-title">${l("admin_edit_section_emergency")}</p>
          <div class="edit-reg-grid">
            <div class="edit-reg-field">
              <label>${l("admin_edit_field_firstName")}</label>
              <input type="text" id="emergency-name" value="${w(o.name||"")}" />
            </div>
            <div class="edit-reg-field">
              <label>${l("admin_edit_field_phone")}</label>
              <input type="text" id="emergency-phone" value="${w(o.phone||"")}" />
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div class="edit-reg-section">
          <p class="edit-reg-section-title">${l("admin_edit_section_notes")}</p>
          <div class="edit-reg-field full-width">
            <textarea id="edit-notes" placeholder="Internal notes...">${w(f)}</textarea>
          </div>
        </div>
      </div>

      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="edit-reg-cancel">${l("admin_edit_cancel_btn")}</button>
        <button class="btn btn-primary btn-sm" id="edit-reg-save">${l("admin_edit_save_btn")}</button>
      </div>
    </div>
  `,document.body.appendChild(s);let v=m.length;s.querySelector("#edit-reg-cancel").addEventListener("click",()=>s.remove()),s.addEventListener("click",a=>{a.target===s&&s.remove()}),(c=s.querySelector("#add-spouse-btn"))==null||c.addEventListener("click",()=>{const a=document.getElementById("spouse-fields");a&&(a.style.display="block",a.innerHTML=u("spouse",{}));const t=s.querySelector("#add-spouse-btn");t&&t.remove()}),s.addEventListener("click",a=>{const t=a.target.closest("[data-remove-swimmer]");if(!t)return;const n=t.closest(".edit-reg-swimmer-card");n&&(n.style.display="none",n.dataset.removed="true")}),(i=s.querySelector("#add-swimmer-btn"))==null||i.addEventListener("click",()=>{const a=document.getElementById("swimmers-container"),t={firstName:"",lastName:"",middleName:"",gender:"",dob:"",usaSwimmingId:""},n=document.createElement("div");n.innerHTML=b(t,v),a.appendChild(n.firstElementChild),v++}),s.querySelector("#edit-reg-save").addEventListener("click",async()=>{await pe(r.id,s),s.remove(),T()})}function ue(r,s,e){if(ee(r==null?void 0:r.address))return l("reg_err_address_email");const d=j(`${(r==null?void 0:r.firstName)||""} ${(r==null?void 0:r.lastName)||""}`),m=s?j(`${s.firstName||""} ${s.lastName||""}`):"";for(const o of e){const f=j(`${o.firstName||""} ${o.lastName||""}`);if(!f)continue;const g=te(o.dob);if(!(g===null||g<ae)){if(d&&f===d)return l("reg_err_swimmer_is_holder");if(m&&f===m)return l("reg_err_swimmer_is_spouse")}}return null}async function pe(r,s){const e=i=>{var a;return((a=s.querySelector("#"+i))==null?void 0:a.value)||""},d={firstName:e("parent-firstName"),lastName:e("parent-lastName"),middleName:e("parent-middleName")||null,gender:e("parent-gender"),email:e("parent-email"),phone:e("parent-phone"),address:e("parent-address")},m=e("spouse-firstName");let o=null;(m||e("spouse-lastName")||e("spouse-email"))&&(o={firstName:m,lastName:e("spouse-lastName"),middleName:e("spouse-middleName")||null,gender:e("spouse-gender")||null,email:e("spouse-email")||null,phone:e("spouse-phone")||null});const f=[];s.querySelectorAll(".edit-reg-swimmer-card").forEach(i=>{if(i.dataset.removed==="true")return;const a=i.dataset.swimmerIdx;f.push({firstName:e(`swimmer-${a}-firstName`),lastName:e(`swimmer-${a}-lastName`),middleName:e(`swimmer-${a}-middleName`)||null,gender:e(`swimmer-${a}-gender`),dob:e(`swimmer-${a}-dob`)||null,usaSwimmingId:e(`swimmer-${a}-usaSwimmingId`)||null})});const u={name:e("emergency-name"),phone:e("emergency-phone")},b=[d.email];if(o&&o.email){const i=o.email.toLowerCase().trim();i&&!b.includes(i)&&b.push(i)}const v={parent:d,spouse:o,swimmers:f,emergencyContact:u,notes:e("edit-notes")||null,parentEmails:b,lastEditedBy:(k==null?void 0:k.email)||"unknown",lastEditedAt:new Date},c=ue(d,o,f);if(c){const i=document.getElementById("family-upload-message");i&&(i.textContent=c,i.className="admin-form-message error");return}try{await R(C(y,"registrations",r),v);const i=document.getElementById("family-upload-message");i&&(i.textContent=l("admin_edit_save_success"),i.className="admin-form-message success",setTimeout(()=>{i.textContent="",i.className="admin-form-message"},3e3))}catch(i){console.error("Error saving registration:",i),alert(l("admin_edit_save_error")+": "+i.message)}}function fe(){var u,b,v;const r=document.getElementById("admin-hamburger"),s=document.querySelector(".admin-sidebar"),e=document.querySelector(".admin-layout");let d=null;const m=()=>{s==null||s.classList.remove("open"),e==null||e.classList.remove("menu-open"),d&&(d.remove(),d=null)};r==null||r.addEventListener("click",c=>{c.stopPropagation();const i=!s.classList.contains("open");i&&!d&&e&&(d=document.createElement("div"),d.className="admin-overlay",d.setAttribute("data-testid","admin-overlay"),d.addEventListener("click",m),e.appendChild(d)),s.classList.toggle("open",i),e==null||e.classList.toggle("menu-open",i)}),document.addEventListener("keydown",c=>{c.key==="Escape"&&m()}),document.querySelectorAll(".admin-nav-item[data-tab]").forEach(c=>{c.addEventListener("click",()=>{$=c.dataset.tab,T()})}),(u=document.getElementById("admin-signout"))==null||u.addEventListener("click",async()=>{await Z(J),window.location.href="/signin.html"});const o=document.getElementById("coach-form");o&&o.addEventListener("submit",async c=>{c.preventDefault();const i=document.getElementById("coach-form-message"),a=document.getElementById("create-coach-btn"),t=document.getElementById("coach-email").value.trim(),n=document.getElementById("coach-name").value.trim()||null,p=document.getElementById("coach-role").value;if(!t){i.textContent="Email is required.",i.className="admin-form-message error";return}a.disabled=!0,i.textContent="";try{if(!(await A(I(x(y,"coaches"),q("email","==",t)))).empty)throw new Error("A coach with this email already exists.");if(!(await A(I(x(y,"families"),q("email","==",t)))).empty)throw new Error("This email is already in the family whitelist.");await V(x(y,"coaches"),{email:t,displayName:n,role:p,status:"pending",registeredUid:null,createdBy:k.uid,createdAt:new Date}),i.textContent=`Coach "${n||t}" added to whitelist. They can now sign up with this email.`,i.className="admin-form-message success",o.reset()}catch(_){i.textContent=`Error: ${_.message}`,i.className="admin-form-message error"}a.disabled=!1});const f=document.getElementById("family-form");f&&f.addEventListener("submit",async c=>{c.preventDefault();const i=document.getElementById("family-form-message"),a=document.getElementById("add-family-btn"),t=document.getElementById("family-email").value.trim(),n=document.getElementById("family-name").value.trim()||null;if(!t){i.textContent="Email is required.",i.className="admin-form-message error";return}a.disabled=!0,i.textContent="";try{if(!(await A(I(x(y,"families"),q("email","==",t)))).empty)throw new Error(l("admin_family_already_exists"));await V(x(y,"families"),{email:t,parentName:n,status:"pending",registeredUid:null,createdBy:k.uid,createdAt:new Date}),i.textContent=`"${n||t}" added successfully.`,i.className="admin-form-message success",f.reset()}catch(p){i.textContent=`Error: ${p.message}`,i.className="admin-form-message error"}a.disabled=!1});const g=document.getElementById("family-upload-btn");if(g&&g.addEventListener("click",()=>{const c=document.createElement("input");c.type="file",c.accept=".xls,.xlsx",c.addEventListener("change",ge),c.click()}),$==="family"){const c=document.getElementById("family-table-body");if(c){const i=I(x(y,"families"),O("createdAt","desc"));H(i,a=>{const t=a.docs.map(n=>{var E,S;const p=n.data(),_=((S=(E=p.createdAt)==null?void 0:E.toDate)==null?void 0:S.call(E))||new Date(p.createdAt),h=p.status==="registered"?l("admin_family_status_registered"):l("admin_family_status_pending"),N=p.status==="registered"?"admin-status-active":"admin-status-pending";return`
            <tr>
              <td>${p.email||"—"}</td>
              <td>${p.parentName||"—"}</td>
              <td><span class="admin-status ${N}">${h}</span></td>
              <td>${_.toLocaleDateString()}</td>
              <td><button class="btn btn-outline btn-sm family-delete-btn" data-id="${n.id}" data-email="${p.email||""}" style="color: var(--color-accent);">${l("admin_family_delete")}</button></td>
            </tr>
          `}).join("");c.innerHTML=t||'<tr><td colspan="5" class="admin-empty">No families authorized yet.</td></tr>',c.querySelectorAll(".family-delete-btn").forEach(n=>{n.addEventListener("click",async()=>{const p=n.dataset.id,_=n.dataset.email;if(confirm(l("admin_family_delete_confirm")+`

`+_))try{const h=await U(C(y,"families",p)),N=h.exists()?h.data().registeredUid:null,E=I(x(y,"registrations"),q("parentEmails","array-contains",_)),S=await A(E);let F=[];S.empty||(F=(S.docs[0].data().parentEmails||[]).filter(L=>L!==_&&L!==""));for(const B of F){const L=await A(I(x(y,"families"),q("email","==",B)));if(!L.empty){if(confirm("This family has another parent: "+B+`

Their whitelist entry is still active. Remove them too?

OK = Remove both  |  Cancel = Remove only `+_))for(const z of L.docs){const G=z.data().registeredUid;G&&await R(C(y,"users",G),{role:"removed"}).catch(()=>{}),await P(C(y,"families",z.id))}break}}N&&await R(C(y,"users",N),{role:"removed"}).catch(()=>{}),await P(C(y,"families",p))}catch(h){console.error("Error deleting family:",h),alert("Failed to delete: "+h.message)}})})},a=>{c.innerHTML=`<tr><td colspan="5" class="admin-empty">Error loading: ${a.message}</td></tr>`})}}if($==="coach"){const c=document.getElementById("coach-table-body"),i=document.getElementById("pending-count");if(!c)return;const a=I(x(y,"coaches"),O("createdAt","desc"));H(a,t=>{let n=0;const p=t.docs.map(_=>{var L,M;const h=_.data();h.status==="pending"&&n++;const N=((M=(L=h.createdAt)==null?void 0:L.toDate)==null?void 0:M.call(L))||new Date(h.createdAt),E=h.role==="admin"?"Admin Coach":"Coach",S=h.role==="admin"?"admin-role-admin":"admin-role-coach",F=h.status==="active"?"active":"pending",B=h.status==="active"?"admin-status-active":"admin-status-pending";return`
          <tr>
            <td>${h.email||"—"}</td>
            <td>${h.displayName||"—"}</td>
            <td><span class="admin-role-badge ${S}">${E}</span></td>
            <td><span class="admin-status ${B}">${F}</span></td>
            <td>${N.toLocaleDateString()}</td>
            <td><button class="btn btn-outline btn-sm coach-delete-btn" data-id="${_.id}" data-email="${h.email||""}" style="color: var(--color-accent);">Delete</button></td>
          </tr>
        `}).join("");c.innerHTML=p||'<tr><td colspan="6" class="admin-empty">No coaches yet.</td></tr>',i.textContent=`${n} pending`,c.querySelectorAll(".coach-delete-btn").forEach(_=>{_.addEventListener("click",async()=>{const h=_.dataset.id,N=_.dataset.email;if(confirm(`Remove this coach authorization?

`+N))try{const E=await U(C(y,"coaches",h)),S=E.exists()?E.data().registeredUid:null;S&&await R(C(y,"users",S),{role:"removed"}).catch(()=>{}),await P(C(y,"coaches",h))}catch(E){console.error("Error deleting coach:",E),alert("Failed to delete: "+E.message)}})})},t=>{c.innerHTML=`<tr><td colspan="6" class="admin-empty">Error loading: ${t.message}</td></tr>`})}if($==="export"){const c=document.getElementById("admin-export-csv-btn"),i=document.getElementById("export-filename-preview");if(i){const a=new Date().toISOString().slice(0,10);i.textContent=`dragon-full-roster-${a}.csv`}(b=document.getElementById("export-select-all"))==null||b.addEventListener("click",()=>{document.querySelectorAll(".export-col-cb").forEach(a=>{a.checked=!0})}),(v=document.getElementById("export-deselect-all"))==null||v.addEventListener("click",()=>{document.querySelectorAll(".export-col-cb").forEach(a=>{a.checked=!1})}),c==null||c.addEventListener("click",()=>{const a=[];if(document.querySelectorAll(".export-col-cb:checked").forEach(p=>{a.push(p.value)}),a.length===0){const p=document.getElementById("export-message");p.textContent="Please select at least one column.",p.className="admin-form-message error";return}const t=new Date().toISOString().slice(0,10);se(D,`dragon-full-roster-${t}.csv`,a);const n=document.getElementById("export-message");n&&(n.textContent=`Download started — ${a.length} columns.`,n.className="admin-form-message success",setTimeout(()=>{n.textContent="",n.className="admin-form-message"},3e3))})}if($==="editreg"){const c=document.getElementById("edit-reg-search"),i=document.getElementById("edit-reg-table-body");c&&i&&(c.addEventListener("input",()=>{const a=c.value.toLowerCase().trim();i.querySelectorAll(".edit-reg-row").forEach(t=>{const n=t.textContent.toLowerCase();t.style.display=a===""||n.includes(a)?"":"none"})}),i.querySelectorAll(".edit-reg-row").forEach(a=>{a.addEventListener("click",()=>{const t=a.dataset.regId,n=D.find(p=>p.id===t);n&&ce(n)})}))}}async function ge(r){var a;const s=(a=r.target.files)==null?void 0:a[0];if(r.target.remove(),!s)return;const e=document.getElementById("family-upload-message");e&&(e.textContent="",e.className="admin-form-message");const d=window.XLSX;if(!d){e&&(e.textContent="Excel parser not loaded. Please refresh the page.",e.className="admin-form-message error");return}let m;try{const t=await s.arrayBuffer(),n=d.read(new Uint8Array(t),{type:"array"}),p=n.Sheets[n.SheetNames[0]];m=d.utils.sheet_to_json(p,{header:1,defval:null})}catch(t){console.error("Excel parse error:",t),e&&(e.textContent=l("admin_family_upload_parse_error"),e.className="admin-form-message error");return}if(!m||m.length<2){e&&(e.textContent=l("admin_family_upload_empty"),e.className="admin-form-message error");return}const o=m[0];if(!o){e&&(e.textContent=l("admin_family_upload_parse_error"),e.className="admin-form-message error");return}const f=o.findIndex(t=>t&&String(t).toLowerCase().trim()==="email"),g=o.findIndex(t=>t&&String(t).toLowerCase().trim()==="name");if(f===-1){e&&(e.textContent=l("admin_family_upload_parse_error"),e.className="admin-form-message error");return}const u=[],b=new Set;for(let t=1;t<m.length;t++){const n=m[t];if(!n||n.every(N=>N==null||String(N).trim()===""))continue;const p=n[f]?String(n[f]).trim():"",_=g!==-1&&n[g]?String(n[g]).trim():"";if(!p)continue;if(!p.includes("@")||!p.includes(".")){u.push({email:p,name:_,rowNum:t+1,error:"Invalid email format"});continue}const h=p.toLowerCase();if(b.has(h)){u.push({email:p,name:_,rowNum:t+1,error:"Duplicate email in file"});continue}b.add(h),u.push({email:p,name:_,rowNum:t+1})}if(u.length===0){e&&(e.textContent=l("admin_family_upload_empty"),e.className="admin-form-message error");return}let v=[];try{v=(await A(x(y,"families"))).docs.map(n=>({id:n.id,...n.data()}))}catch(t){console.error("Error fetching families:",t),e&&(e.textContent=l("admin_family_upload_error"),e.className="admin-form-message error");return}const c=new Map;for(const t of v)c.set((t.email||"").toLowerCase(),t);const i=he(u,c);ye(i,s.name)}function he(r,s){const e={new:[],update:[],skip:[],errors:[]};for(const d of r){if(d.error){e.errors.push(d);continue}const m=d.email.toLowerCase(),o=s.get(m);if(!o){e.new.push(d);continue}const f=(o.parentName||"").trim(),g=(d.name||"").trim();g?f.toLowerCase()===g.toLowerCase()?e.skip.push(d):e.update.push({...d,existingId:o.id,existingName:f}):e.skip.push(d)}return e}function ye(r,s){var a,t;const{new:e,update:d,skip:m,errors:o}=r,f=e.length+d.length+m.length+o.length,g=e.length+d.length>0,u=d.filter(n=>n.existingName).length,b=(n,p)=>`<span class="status-badge ${p}">${n}</span>`,v=[...e.map(n=>({...n,status:"new"})),...d.map(n=>({...n,status:"updated"})),...m.map(n=>({...n,status:"skipped"})),...o.map(n=>({...n,status:"error"}))],c=v.length>0?`
    <div class="family-preview-table-wrapper">
      <table class="family-preview-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Email</th>
            <th>${l("admin_family_conflict_col_excel_name")}</th>
            <th>${l("admin_family_conflict_col_existing_name")}</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${v.map(n=>`
            <tr>
              <td>${n.rowNum||"—"}</td>
              <td>${w(n.email)}</td>
              <td>${w(n.name||"—")}</td>
              <td>${w(n.existingName||"—")}</td>
              <td>${b(n.status,n.status)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `:"",i=document.createElement("div");i.className="confirm-overlay",i.innerHTML=`
    <div class="confirm-modal family-import-modal">
      <h3 class="confirm-title">${l("admin_family_upload_title")}</h3>
      <p class="family-import-filename">${l("admin_family_upload_file")}: <strong>${w(s)}</strong></p>

      <div class="family-summary">
        <span class="family-summary-item new">${l("admin_family_upload_summary",{total:String(f),new:String(e.length),updated:String(d.length),skipped:String(m.length)})}</span>
        ${o.length>0?`<span class="family-summary-item conflict">⚠ ${o.length} errors</span>`:""}
      </div>

      ${u>0?`<p class="confirm-warning" style="text-align: center;">${l("admin_family_upload_replace_hint",{count:String(u)})}</p>`:""}

      ${c}

      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="family-import-cancel">${l("admin_family_upload_cancel")}</button>
        ${g?`<button class="btn btn-primary btn-sm" id="family-import-confirm">${l("admin_family_upload_confirm",{count:String(e.length+d.length)})}</button>`:""}
      </div>
    </div>
  `,document.body.appendChild(i),(a=i.querySelector("#family-import-cancel"))==null||a.addEventListener("click",()=>i.remove()),(t=i.querySelector("#family-import-confirm"))==null||t.addEventListener("click",async()=>{i.remove(),await be(r)}),i.addEventListener("click",n=>{n.target===i&&i.remove()})}async function be(r){const{new:s,update:e}=r,d=s.length+e.length,m=document.getElementById("family-upload-message");if(d!==0)try{for(const o of s)await V(x(y,"families"),{email:o.email,parentName:o.name||null,status:"pending",registeredUid:null,createdBy:(k==null?void 0:k.uid)||null,createdAt:new Date});for(const o of e)await R(C(y,"families",o.existingId),{parentName:o.name});m&&(m.textContent=l("admin_family_upload_success",{count:String(d)}),m.className="admin-form-message success")}catch(o){console.error("Batch import error:",o),m&&(m.textContent=l("admin_family_upload_error"),m.className="admin-form-message error")}}
