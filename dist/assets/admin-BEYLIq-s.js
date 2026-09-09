import{i as Q,t as d}from"./i18n-DXvg7HwR.js";import{X as W}from"./xlsx-DkFutVy2.js";import{o as K,h as j,g as C,e as y,q as I,l as U,c as x,k as O,b as J,t as Y,i as D,w as q,a as H,u as R,f as M}from"./firebase-CorBctTj.js";const V=[{key:"firstName",label:"First Name"},{key:"lastName",label:"Last Name"},{key:"gender",label:"Gender"},{key:"age",label:"Age"},{key:"dob",label:"DOB"},{key:"usaSwimmingId",label:"USA Swimming ID"},{key:"status",label:"Status"},{key:"parentFirstName",label:"Parent First Name"},{key:"parentLastName",label:"Parent Last Name"},{key:"parentEmail",label:"Parent Email"},{key:"parentPhone",label:"Parent Phone"},{key:"address",label:"Address"},{key:"ecName",label:"Emergency Contact Name"},{key:"ecPhone",label:"Emergency Contact Phone"}];function Z(c,n){const e=c.parent||{},o=c.emergencyContact||{},m=n.dob?Math.floor((new Date-new Date(n.dob))/(365.25*24*60*60*1e3)):"";return{firstName:n.firstName||"",lastName:n.lastName||"",gender:n.gender||"",age:m,dob:n.dob||"",usaSwimmingId:n.usaSwimmingId||"",status:n.status||"pending",parentFirstName:e.firstName||"",parentLastName:e.lastName||"",parentEmail:e.email||"",parentPhone:e.phone||"",address:e.address||"",ecName:o.name||"",ecPhone:o.phone||""}}function ee(c,n,e){const o=e&&e.length>0?e:V.map(p=>p.key),m={};for(const p of V)m[p.key]=p;const r=o.map(p=>{var b;return((b=m[p])==null?void 0:b.label)||p}),g=[];for(const p of c){const b=p.swimmers||[];for(const v of b){if(v.deleted)continue;const s=Z(p,v);g.push(o.map(l=>G(s[l]??"")).join(","))}}const h=[r.map(p=>G(p)).join(","),...g].join(`
`);te(h,n)}function G(c){return`"${String(c).replace(/"/g,'""')}"`}function te(c,n){const e=new Blob([c],{type:"text/csv;charset=utf-8;"}),o=URL.createObjectURL(e),m=document.createElement("a");m.href=o,m.download=n,document.body.appendChild(m),m.click(),document.body.removeChild(m),URL.revokeObjectURL(o)}window.XLSX=W;Q();let k=null,$="coach",A=[];const ae=document.getElementById("app");function w(c){return String(c).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}K(J,async c=>{if(!c){window.location.href="/signin.html";return}const n=await j(C(y,"users",c.uid));if((n.exists()?n.data().role:null)!=="admin"){window.location.href="/dashboard.html";return}k=c;const o=I(x(y,"registrations"),U("createdAt","desc"));O(o,m=>{A=m.docs.map(r=>({id:r.id,...r.data()})),($==="export"||$==="editreg")&&T()}),T()});function T(){ae.innerHTML=`
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
          ${$==="coach"?ie():$==="family"?ne():$==="editreg"?de():se()}
        </div>
      </main>
    </div>
  `,re()}function ie(){return`
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
  `}function ne(){return`
    <div class="admin-panel">
      <h3>${d("admin_family_title")}</h3>
      <p class="admin-hint">${d("admin_family_hint")}</p>
      <form id="family-form" class="admin-form">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="family-email">${d("admin_family_email")}</label>
            <input class="form-input" type="email" id="family-email" placeholder="parent@example.com" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="family-name">${d("admin_family_name")}</label>
            <input class="form-input" type="text" id="family-name" placeholder="e.g. John Chen" />
          </div>
        </div>
        <button type="submit" class="btn btn-primary" id="add-family-btn">${d("admin_family_add_btn")}</button>
        <p id="family-form-message" class="admin-form-message"></p>
      </form>
      <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color);">
        <p class="admin-hint">Or upload an Excel file (.xls/.xlsx) with columns: <strong>email</strong>, <strong>name</strong></p>
        <button class="btn btn-outline btn-sm" id="family-upload-btn">📤 ${d("admin_family_upload_btn")}</button>
        <p id="family-upload-message" class="admin-form-message"></p>
      </div>
    </div>

    <div class="admin-panel" style="margin-top: 2rem;">
      <h3>${d("admin_family_list_title")}</h3>
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
  `}function se(){let c=A.length,n=0;const e={pending:0,active:0,inactive:0};for(const r of A){const g=r.swimmers||[];for(const h of g){if(h.deleted)continue;n++;const p=h.status||"pending";e[p]=(e[p]||0)+1}}const o=["Families","Swimmers","Active","Pending","Inactive"],m=[c,n,e.active||0,e.pending||0,e.inactive||0];return`
    <div class="admin-panel">
      <h3>Export All Registration Data</h3>
      <p class="admin-hint">Download a CSV file with every swimmer and their family contact information.</p>

      <div class="admin-table-wrapper" style="margin: 1.5rem 0; max-width: 600px;">
        <table class="admin-table">
          <thead>
            <tr>${o.map(r=>`<th>${r}</th>`).join("")}</tr>
          </thead>
          <tbody>
            <tr>${m.map(r=>`<td style="font-weight: 600; font-size: 1.1rem;">${r}</td>`).join("")}</tr>
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
          ${V.map(r=>`
            <label class="checkbox-label" style="display: inline-flex; align-items: center; gap: 0.35rem; cursor: pointer;">
              <input type="checkbox" class="export-col-cb" value="${r.key}" checked />
              <span>${r.label}</span>
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
  `}function de(){const c=A;return`
    <div class="admin-panel" style="max-width: 100%;">
      <h3>${d("admin_edit_tab")}</h3>
      <p class="admin-hint">Click a family row to view and edit their registration data.</p>
      <input type="text" class="edit-reg-search" id="edit-reg-search" placeholder="${d("admin_edit_search")}" />
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
            ${c.length===0?`<tr><td colspan="6" class="admin-empty">${d("admin_edit_no_results")}</td></tr>`:c.map(n=>{var p,b,v,s;const e=n.parent||{},o=[e.firstName,e.lastName].filter(Boolean).join(" ")||"—",m=(n.swimmers||[]).filter(l=>!l.deleted),r=m.length>0?'<span class="admin-status admin-status-active">active</span>':'<span class="admin-status admin-status-pending">pending</span>',g=((b=(p=n.createdAt)==null?void 0:p.toDate)==null?void 0:b.call(p))||new Date(n.createdAt||0),h=((s=(v=n.lastEditedAt)==null?void 0:v.toDate)==null?void 0:s.call(v))||(n.lastEditedAt?new Date(n.lastEditedAt):null);return`
                  <tr data-reg-id="${w(n.id||"")}" class="edit-reg-row">
                    <td><strong>${w(o)}</strong></td>
                    <td>${w(e.email||"—")}</td>
                    <td>${m.length}</td>
                    <td>${r}</td>
                    <td>${g.toLocaleDateString()}</td>
                    <td>${h?h.toLocaleDateString():"—"}</td>
                  </tr>
                `}).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}function le(c){var s,l;const n=document.createElement("div");n.className="confirm-overlay",n.id="edit-reg-overlay";const e=c.parent||{},o=c.spouse||null,m=(c.swimmers||[]).filter(a=>!a.deleted),r=c.emergencyContact||{},g=c.notes||"",h=(a,t)=>`
    <select class="form-input" id="${t}">
      <option value="male" ${(a||"").toLowerCase()==="male"?"selected":""}>${d("admin_edit_gender_male")}</option>
      <option value="female" ${(a||"").toLowerCase()==="female"?"selected":""}>${d("admin_edit_gender_female")}</option>
    </select>
  `,p=(a,t)=>`
    <div class="edit-reg-grid">
      <div class="edit-reg-field">
        <label>${d("admin_edit_field_firstName")}</label>
        <input type="text" id="${a}-firstName" value="${w(t.firstName||"")}" />
      </div>
      <div class="edit-reg-field">
        <label>${d("admin_edit_field_lastName")}</label>
        <input type="text" id="${a}-lastName" value="${w(t.lastName||"")}" />
      </div>
      <div class="edit-reg-field">
        <label>${d("admin_edit_field_middleName")}</label>
        <input type="text" id="${a}-middleName" value="${w(t.middleName||"")}" />
      </div>
      <div class="edit-reg-field">
        <label>${d("admin_edit_field_gender")}</label>
        ${h(t.gender,`${a}-gender`)}
      </div>
      <div class="edit-reg-field">
        <label>${d("admin_edit_field_email")}</label>
        <input type="email" id="${a}-email" value="${w(t.email||"")}" />
      </div>
      <div class="edit-reg-field">
        <label>${d("admin_edit_field_phone")}</label>
        <input type="text" id="${a}-phone" value="${w(t.phone||"")}" />
      </div>
      ${a==="parent"?`
        <div class="edit-reg-field full-width">
          <label>${d("admin_edit_field_address")}</label>
          <input type="text" id="${a}-address" value="${w(t.address||"")}" />
        </div>
      `:""}
    </div>
  `,b=(a,t)=>`
    <div class="edit-reg-swimmer-card" data-swimmer-idx="${t}">
      <div class="edit-reg-swimmer-header">
        <span class="edit-reg-swimmer-label">Swimmer ${t+1}</span>
        <button class="edit-reg-swimmer-remove" data-remove-swimmer="${t}">${d("admin_edit_swimmer_remove")}</button>
      </div>
      <div class="edit-reg-swimmer-fields">
        <div class="edit-reg-field">
          <label>${d("admin_edit_field_firstName")}</label>
          <input type="text" id="swimmer-${t}-firstName" value="${w(a.firstName||"")}" />
        </div>
        <div class="edit-reg-field">
          <label>${d("admin_edit_field_lastName")}</label>
          <input type="text" id="swimmer-${t}-lastName" value="${w(a.lastName||"")}" />
        </div>
        <div class="edit-reg-field">
          <label>${d("admin_edit_field_middleName")}</label>
          <input type="text" id="swimmer-${t}-middleName" value="${w(a.middleName||"")}" />
        </div>
        <div class="edit-reg-field">
          <label>${d("admin_edit_field_gender")}</label>
          ${h(a.gender,`swimmer-${t}-gender`)}
        </div>
        <div class="edit-reg-field">
          <label>${d("admin_edit_field_dob")}</label>
          <input type="date" id="swimmer-${t}-dob" value="${w(a.dob||"")}" />
        </div>
        <div class="edit-reg-field">
          <label>${d("admin_edit_field_usaSwimmingId")}</label>
          <input type="text" id="swimmer-${t}-usaSwimmingId" value="${w(a.usaSwimmingId||"")}" />
        </div>
      </div>
    </div>
  `;n.innerHTML=`
    <div class="confirm-modal edit-reg-modal">
      <h3 class="confirm-title">${d("admin_edit_title")}</h3>
      <div class="edit-reg-body">
        <!-- Parent -->
        <div class="edit-reg-section">
          <p class="edit-reg-section-title">${d("admin_edit_section_parent")}</p>
          ${p("parent",e)}
        </div>

        <!-- Spouse -->
        <div class="edit-reg-section">
          <p class="edit-reg-section-title">${d("admin_edit_section_spouse")}</p>
          ${o?p("spouse",o):`<p class="edit-reg-no-spouse">${d("admin_edit_no_spouse")}</p>`}
          <!-- Always render hidden spouse fields so admin can add spouse -->
          <div id="spouse-fields" style="${o?"":"display:none;"}">
            ${o?"":p("spouse",{})}
          </div>
          ${o?"":'<button class="edit-reg-add-swimmer-btn" id="add-spouse-btn" style="width:auto;">+ Add Spouse</button>'}
        </div>

        <!-- Swimmers -->
        <div class="edit-reg-section">
          <p class="edit-reg-section-title">${d("admin_edit_section_swimmers")}</p>
          <div class="edit-reg-swimmers" id="swimmers-container">
            ${m.map((a,t)=>b(a,t)).join("")}
          </div>
          <button class="edit-reg-add-swimmer-btn" id="add-swimmer-btn">${d("admin_edit_swimmer_add")}</button>
        </div>

        <!-- Emergency Contact -->
        <div class="edit-reg-section">
          <p class="edit-reg-section-title">${d("admin_edit_section_emergency")}</p>
          <div class="edit-reg-grid">
            <div class="edit-reg-field">
              <label>${d("admin_edit_field_firstName")}</label>
              <input type="text" id="emergency-name" value="${w(r.name||"")}" />
            </div>
            <div class="edit-reg-field">
              <label>${d("admin_edit_field_phone")}</label>
              <input type="text" id="emergency-phone" value="${w(r.phone||"")}" />
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div class="edit-reg-section">
          <p class="edit-reg-section-title">${d("admin_edit_section_notes")}</p>
          <div class="edit-reg-field full-width">
            <textarea id="edit-notes" placeholder="Internal notes...">${w(g)}</textarea>
          </div>
        </div>
      </div>

      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="edit-reg-cancel">${d("admin_edit_cancel_btn")}</button>
        <button class="btn btn-primary btn-sm" id="edit-reg-save">${d("admin_edit_save_btn")}</button>
      </div>
    </div>
  `,document.body.appendChild(n);let v=m.length;n.querySelector("#edit-reg-cancel").addEventListener("click",()=>n.remove()),n.addEventListener("click",a=>{a.target===n&&n.remove()}),(s=n.querySelector("#add-spouse-btn"))==null||s.addEventListener("click",()=>{const a=document.getElementById("spouse-fields");a&&(a.style.display="block",a.innerHTML=p("spouse",{}));const t=n.querySelector("#add-spouse-btn");t&&t.remove()}),n.addEventListener("click",a=>{const t=a.target.closest("[data-remove-swimmer]");if(!t)return;const i=t.closest(".edit-reg-swimmer-card");i&&(i.style.display="none",i.dataset.removed="true")}),(l=n.querySelector("#add-swimmer-btn"))==null||l.addEventListener("click",()=>{const a=document.getElementById("swimmers-container"),t={firstName:"",lastName:"",middleName:"",gender:"",dob:"",usaSwimmingId:""},i=document.createElement("div");i.innerHTML=b(t,v),a.appendChild(i.firstElementChild),v++}),n.querySelector("#edit-reg-save").addEventListener("click",async()=>{await oe(c.id,n),n.remove(),T()})}async function oe(c,n){const e=s=>{var l;return((l=n.querySelector("#"+s))==null?void 0:l.value)||""},o={firstName:e("parent-firstName"),lastName:e("parent-lastName"),middleName:e("parent-middleName")||null,gender:e("parent-gender"),email:e("parent-email"),phone:e("parent-phone"),address:e("parent-address")},m=e("spouse-firstName");let r=null;(m||e("spouse-lastName")||e("spouse-email"))&&(r={firstName:m,lastName:e("spouse-lastName"),middleName:e("spouse-middleName")||null,gender:e("spouse-gender")||null,email:e("spouse-email")||null,phone:e("spouse-phone")||null});const g=[];n.querySelectorAll(".edit-reg-swimmer-card").forEach(s=>{if(s.dataset.removed==="true")return;const l=s.dataset.swimmerIdx;g.push({firstName:e(`swimmer-${l}-firstName`),lastName:e(`swimmer-${l}-lastName`),middleName:e(`swimmer-${l}-middleName`)||null,gender:e(`swimmer-${l}-gender`),dob:e(`swimmer-${l}-dob`)||null,usaSwimmingId:e(`swimmer-${l}-usaSwimmingId`)||null})});const p={name:e("emergency-name"),phone:e("emergency-phone")},b=[o.email];if(r&&r.email){const s=r.email.toLowerCase().trim();s&&!b.includes(s)&&b.push(s)}const v={parent:o,spouse:r,swimmers:g,emergencyContact:p,notes:e("edit-notes")||null,parentEmails:b,lastEditedBy:(k==null?void 0:k.email)||"unknown",lastEditedAt:new Date};try{await R(C(y,"registrations",c),v);const s=document.getElementById("family-upload-message");s&&(s.textContent=d("admin_edit_save_success"),s.className="admin-form-message success",setTimeout(()=>{s.textContent="",s.className="admin-form-message"},3e3))}catch(s){console.error("Error saving registration:",s),alert(d("admin_edit_save_error")+": "+s.message)}}function re(){var p,b,v;const c=document.getElementById("admin-hamburger"),n=document.querySelector(".admin-sidebar"),e=document.querySelector(".admin-layout");let o=null;const m=()=>{n==null||n.classList.remove("open"),e==null||e.classList.remove("menu-open"),o&&(o.remove(),o=null)};c==null||c.addEventListener("click",s=>{s.stopPropagation();const l=!n.classList.contains("open");l&&!o&&e&&(o=document.createElement("div"),o.className="admin-overlay",o.setAttribute("data-testid","admin-overlay"),o.addEventListener("click",m),e.appendChild(o)),n.classList.toggle("open",l),e==null||e.classList.toggle("menu-open",l)}),document.addEventListener("keydown",s=>{s.key==="Escape"&&m()}),document.querySelectorAll(".admin-nav-item[data-tab]").forEach(s=>{s.addEventListener("click",()=>{$=s.dataset.tab,T()})}),(p=document.getElementById("admin-signout"))==null||p.addEventListener("click",async()=>{await Y(J),window.location.href="/signin.html"});const r=document.getElementById("coach-form");r&&r.addEventListener("submit",async s=>{s.preventDefault();const l=document.getElementById("coach-form-message"),a=document.getElementById("create-coach-btn"),t=document.getElementById("coach-email").value.trim(),i=document.getElementById("coach-name").value.trim()||null,u=document.getElementById("coach-role").value;if(!t){l.textContent="Email is required.",l.className="admin-form-message error";return}a.disabled=!0,l.textContent="";try{if(!(await D(I(x(y,"coaches"),q("email","==",t)))).empty)throw new Error("A coach with this email already exists.");if(!(await D(I(x(y,"families"),q("email","==",t)))).empty)throw new Error("This email is already in the family whitelist.");await H(x(y,"coaches"),{email:t,displayName:i,role:u,status:"pending",registeredUid:null,createdBy:k.uid,createdAt:new Date}),l.textContent=`Coach "${i||t}" added to whitelist. They can now sign up with this email.`,l.className="admin-form-message success",r.reset()}catch(_){l.textContent=`Error: ${_.message}`,l.className="admin-form-message error"}a.disabled=!1});const g=document.getElementById("family-form");g&&g.addEventListener("submit",async s=>{s.preventDefault();const l=document.getElementById("family-form-message"),a=document.getElementById("add-family-btn"),t=document.getElementById("family-email").value.trim(),i=document.getElementById("family-name").value.trim()||null;if(!t){l.textContent="Email is required.",l.className="admin-form-message error";return}a.disabled=!0,l.textContent="";try{if(!(await D(I(x(y,"families"),q("email","==",t)))).empty)throw new Error(d("admin_family_already_exists"));await H(x(y,"families"),{email:t,parentName:i,status:"pending",registeredUid:null,createdBy:k.uid,createdAt:new Date}),l.textContent=`"${i||t}" added successfully.`,l.className="admin-form-message success",g.reset()}catch(u){l.textContent=`Error: ${u.message}`,l.className="admin-form-message error"}a.disabled=!1});const h=document.getElementById("family-upload-btn");if(h&&h.addEventListener("click",()=>{const s=document.createElement("input");s.type="file",s.accept=".xls,.xlsx",s.addEventListener("change",me),s.click()}),$==="family"){const s=document.getElementById("family-table-body");if(s){const l=I(x(y,"families"),U("createdAt","desc"));O(l,a=>{const t=a.docs.map(i=>{var E,S;const u=i.data(),_=((S=(E=u.createdAt)==null?void 0:E.toDate)==null?void 0:S.call(E))||new Date(u.createdAt),f=u.status==="registered"?d("admin_family_status_registered"):d("admin_family_status_pending"),N=u.status==="registered"?"admin-status-active":"admin-status-pending";return`
            <tr>
              <td>${u.email||"—"}</td>
              <td>${u.parentName||"—"}</td>
              <td><span class="admin-status ${N}">${f}</span></td>
              <td>${_.toLocaleDateString()}</td>
              <td><button class="btn btn-outline btn-sm family-delete-btn" data-id="${i.id}" data-email="${u.email||""}" style="color: var(--color-accent);">${d("admin_family_delete")}</button></td>
            </tr>
          `}).join("");s.innerHTML=t||'<tr><td colspan="5" class="admin-empty">No families authorized yet.</td></tr>',s.querySelectorAll(".family-delete-btn").forEach(i=>{i.addEventListener("click",async()=>{const u=i.dataset.id,_=i.dataset.email;if(confirm(d("admin_family_delete_confirm")+`

`+_))try{const f=await j(C(y,"families",u)),N=f.exists()?f.data().registeredUid:null,E=I(x(y,"registrations"),q("parentEmails","array-contains",_)),S=await D(E);let F=[];S.empty||(F=(S.docs[0].data().parentEmails||[]).filter(L=>L!==_&&L!==""));for(const B of F){const L=await D(I(x(y,"families"),q("email","==",B)));if(!L.empty){if(confirm("This family has another parent: "+B+`

Their whitelist entry is still active. Remove them too?

OK = Remove both  |  Cancel = Remove only `+_))for(const X of L.docs){const z=X.data().registeredUid;z&&await R(C(y,"users",z),{role:"removed"}).catch(()=>{}),await M(C(y,"families",X.id))}break}}N&&await R(C(y,"users",N),{role:"removed"}).catch(()=>{}),await M(C(y,"families",u))}catch(f){console.error("Error deleting family:",f),alert("Failed to delete: "+f.message)}})})},a=>{s.innerHTML=`<tr><td colspan="5" class="admin-empty">Error loading: ${a.message}</td></tr>`})}}if($==="coach"){const s=document.getElementById("coach-table-body"),l=document.getElementById("pending-count");if(!s)return;const a=I(x(y,"coaches"),U("createdAt","desc"));O(a,t=>{let i=0;const u=t.docs.map(_=>{var L,P;const f=_.data();f.status==="pending"&&i++;const N=((P=(L=f.createdAt)==null?void 0:L.toDate)==null?void 0:P.call(L))||new Date(f.createdAt),E=f.role==="admin"?"Admin Coach":"Coach",S=f.role==="admin"?"admin-role-admin":"admin-role-coach",F=f.status==="active"?"active":"pending",B=f.status==="active"?"admin-status-active":"admin-status-pending";return`
          <tr>
            <td>${f.email||"—"}</td>
            <td>${f.displayName||"—"}</td>
            <td><span class="admin-role-badge ${S}">${E}</span></td>
            <td><span class="admin-status ${B}">${F}</span></td>
            <td>${N.toLocaleDateString()}</td>
            <td><button class="btn btn-outline btn-sm coach-delete-btn" data-id="${_.id}" data-email="${f.email||""}" style="color: var(--color-accent);">Delete</button></td>
          </tr>
        `}).join("");s.innerHTML=u||'<tr><td colspan="6" class="admin-empty">No coaches yet.</td></tr>',l.textContent=`${i} pending`,s.querySelectorAll(".coach-delete-btn").forEach(_=>{_.addEventListener("click",async()=>{const f=_.dataset.id,N=_.dataset.email;if(confirm(`Remove this coach authorization?

`+N))try{const E=await j(C(y,"coaches",f)),S=E.exists()?E.data().registeredUid:null;S&&await R(C(y,"users",S),{role:"removed"}).catch(()=>{}),await M(C(y,"coaches",f))}catch(E){console.error("Error deleting coach:",E),alert("Failed to delete: "+E.message)}})})},t=>{s.innerHTML=`<tr><td colspan="6" class="admin-empty">Error loading: ${t.message}</td></tr>`})}if($==="export"){const s=document.getElementById("admin-export-csv-btn"),l=document.getElementById("export-filename-preview");if(l){const a=new Date().toISOString().slice(0,10);l.textContent=`dragon-full-roster-${a}.csv`}(b=document.getElementById("export-select-all"))==null||b.addEventListener("click",()=>{document.querySelectorAll(".export-col-cb").forEach(a=>{a.checked=!0})}),(v=document.getElementById("export-deselect-all"))==null||v.addEventListener("click",()=>{document.querySelectorAll(".export-col-cb").forEach(a=>{a.checked=!1})}),s==null||s.addEventListener("click",()=>{const a=[];if(document.querySelectorAll(".export-col-cb:checked").forEach(u=>{a.push(u.value)}),a.length===0){const u=document.getElementById("export-message");u.textContent="Please select at least one column.",u.className="admin-form-message error";return}const t=new Date().toISOString().slice(0,10);ee(A,`dragon-full-roster-${t}.csv`,a);const i=document.getElementById("export-message");i&&(i.textContent=`Download started — ${a.length} columns.`,i.className="admin-form-message success",setTimeout(()=>{i.textContent="",i.className="admin-form-message"},3e3))})}if($==="editreg"){const s=document.getElementById("edit-reg-search"),l=document.getElementById("edit-reg-table-body");s&&l&&(s.addEventListener("input",()=>{const a=s.value.toLowerCase().trim();l.querySelectorAll(".edit-reg-row").forEach(t=>{const i=t.textContent.toLowerCase();t.style.display=a===""||i.includes(a)?"":"none"})}),l.querySelectorAll(".edit-reg-row").forEach(a=>{a.addEventListener("click",()=>{const t=a.dataset.regId,i=A.find(u=>u.id===t);i&&le(i)})}))}}async function me(c){var a;const n=(a=c.target.files)==null?void 0:a[0];if(c.target.remove(),!n)return;const e=document.getElementById("family-upload-message");e&&(e.textContent="",e.className="admin-form-message");const o=window.XLSX;if(!o){e&&(e.textContent="Excel parser not loaded. Please refresh the page.",e.className="admin-form-message error");return}let m;try{const t=await n.arrayBuffer(),i=o.read(new Uint8Array(t),{type:"array"}),u=i.Sheets[i.SheetNames[0]];m=o.utils.sheet_to_json(u,{header:1,defval:null})}catch(t){console.error("Excel parse error:",t),e&&(e.textContent=d("admin_family_upload_parse_error"),e.className="admin-form-message error");return}if(!m||m.length<2){e&&(e.textContent=d("admin_family_upload_empty"),e.className="admin-form-message error");return}const r=m[0];if(!r){e&&(e.textContent=d("admin_family_upload_parse_error"),e.className="admin-form-message error");return}const g=r.findIndex(t=>t&&String(t).toLowerCase().trim()==="email"),h=r.findIndex(t=>t&&String(t).toLowerCase().trim()==="name");if(g===-1){e&&(e.textContent=d("admin_family_upload_parse_error"),e.className="admin-form-message error");return}const p=[],b=new Set;for(let t=1;t<m.length;t++){const i=m[t];if(!i||i.every(N=>N==null||String(N).trim()===""))continue;const u=i[g]?String(i[g]).trim():"",_=h!==-1&&i[h]?String(i[h]).trim():"";if(!u)continue;if(!u.includes("@")||!u.includes(".")){p.push({email:u,name:_,rowNum:t+1,error:"Invalid email format"});continue}const f=u.toLowerCase();if(b.has(f)){p.push({email:u,name:_,rowNum:t+1,error:"Duplicate email in file"});continue}b.add(f),p.push({email:u,name:_,rowNum:t+1})}if(p.length===0){e&&(e.textContent=d("admin_family_upload_empty"),e.className="admin-form-message error");return}let v=[];try{v=(await D(x(y,"families"))).docs.map(i=>({id:i.id,...i.data()}))}catch(t){console.error("Error fetching families:",t),e&&(e.textContent=d("admin_family_upload_error"),e.className="admin-form-message error");return}const s=new Map;for(const t of v)s.set((t.email||"").toLowerCase(),t);const l=ce(p,s);pe(l,n.name)}function ce(c,n){const e={new:[],update:[],skip:[],errors:[]};for(const o of c){if(o.error){e.errors.push(o);continue}const m=o.email.toLowerCase(),r=n.get(m);if(!r){e.new.push(o);continue}const g=(r.parentName||"").trim(),h=(o.name||"").trim();h?g.toLowerCase()===h.toLowerCase()?e.skip.push(o):e.update.push({...o,existingId:r.id,existingName:g}):e.skip.push(o)}return e}function pe(c,n){var a,t;const{new:e,update:o,skip:m,errors:r}=c,g=e.length+o.length+m.length+r.length,h=e.length+o.length>0,p=o.filter(i=>i.existingName).length,b=(i,u)=>`<span class="status-badge ${u}">${i}</span>`,v=[...e.map(i=>({...i,status:"new"})),...o.map(i=>({...i,status:"updated"})),...m.map(i=>({...i,status:"skipped"})),...r.map(i=>({...i,status:"error"}))],s=v.length>0?`
    <div class="family-preview-table-wrapper">
      <table class="family-preview-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Email</th>
            <th>${d("admin_family_conflict_col_excel_name")}</th>
            <th>${d("admin_family_conflict_col_existing_name")}</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${v.map(i=>`
            <tr>
              <td>${i.rowNum||"—"}</td>
              <td>${w(i.email)}</td>
              <td>${w(i.name||"—")}</td>
              <td>${w(i.existingName||"—")}</td>
              <td>${b(i.status,i.status)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `:"",l=document.createElement("div");l.className="confirm-overlay",l.innerHTML=`
    <div class="confirm-modal family-import-modal">
      <h3 class="confirm-title">${d("admin_family_upload_title")}</h3>
      <p class="family-import-filename">${d("admin_family_upload_file")}: <strong>${w(n)}</strong></p>

      <div class="family-summary">
        <span class="family-summary-item new">${d("admin_family_upload_summary",{total:String(g),new:String(e.length),updated:String(o.length),skipped:String(m.length)})}</span>
        ${r.length>0?`<span class="family-summary-item conflict">⚠ ${r.length} errors</span>`:""}
      </div>

      ${p>0?`<p class="confirm-warning" style="text-align: center;">${d("admin_family_upload_replace_hint",{count:String(p)})}</p>`:""}

      ${s}

      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="family-import-cancel">${d("admin_family_upload_cancel")}</button>
        ${h?`<button class="btn btn-primary btn-sm" id="family-import-confirm">${d("admin_family_upload_confirm",{count:String(e.length+o.length)})}</button>`:""}
      </div>
    </div>
  `,document.body.appendChild(l),(a=l.querySelector("#family-import-cancel"))==null||a.addEventListener("click",()=>l.remove()),(t=l.querySelector("#family-import-confirm"))==null||t.addEventListener("click",async()=>{l.remove(),await ue(c)}),l.addEventListener("click",i=>{i.target===l&&l.remove()})}async function ue(c){const{new:n,update:e}=c,o=n.length+e.length,m=document.getElementById("family-upload-message");if(o!==0)try{for(const r of n)await H(x(y,"families"),{email:r.email,parentName:r.name||null,status:"pending",registeredUid:null,createdBy:(k==null?void 0:k.uid)||null,createdAt:new Date});for(const r of e)await R(C(y,"families",r.existingId),{parentName:r.name});m&&(m.textContent=d("admin_family_upload_success",{count:String(o)}),m.className="admin-form-message success")}catch(r){console.error("Batch import error:",r),m&&(m.textContent=d("admin_family_upload_error"),m.className="admin-form-message error")}}
