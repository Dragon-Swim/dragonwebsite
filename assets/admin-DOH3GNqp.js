import{i as H,t as p}from"./i18n-eZG49-MJ.js";import{X}from"./xlsx-DkFutVy2.js";import{o as V,h as B,g as $,e as v,q as C,l as R,c as _,k as F,b as O,t as z,i as N,w as k,a as q,u as L,f as A}from"./firebase-CorBctTj.js";const T=[{key:"firstName",label:"First Name"},{key:"lastName",label:"Last Name"},{key:"gender",label:"Gender"},{key:"age",label:"Age"},{key:"dob",label:"DOB"},{key:"usaSwimmingId",label:"USA Swimming ID"},{key:"status",label:"Status"},{key:"parentFirstName",label:"Parent First Name"},{key:"parentLastName",label:"Parent Last Name"},{key:"parentEmail",label:"Parent Email"},{key:"parentPhone",label:"Parent Phone"},{key:"address",label:"Address"},{key:"ecName",label:"Emergency Contact Name"},{key:"ecPhone",label:"Emergency Contact Phone"}];function G(u,r){const e=u.parent||{},i=u.emergencyContact||{},n=r.dob?Math.floor((new Date-new Date(r.dob))/(365.25*24*60*60*1e3)):"";return{firstName:r.firstName||"",lastName:r.lastName||"",gender:r.gender||"",age:n,dob:r.dob||"",usaSwimmingId:r.usaSwimmingId||"",status:r.status||"pending",parentFirstName:e.firstName||"",parentLastName:e.lastName||"",parentEmail:e.email||"",parentPhone:e.phone||"",address:e.address||"",ecName:i.name||"",ecPhone:i.phone||""}}function J(u,r,e){const i=e&&e.length>0?e:T.map(t=>t.key),n={};for(const t of T)n[t.key]=t;const o=i.map(t=>{var h;return((h=n[t])==null?void 0:h.label)||t}),a=[];for(const t of u){const h=t.swimmers||[];for(const c of h){if(c.deleted)continue;const f=G(t,c);a.push(i.map(y=>M(f[y]??"")).join(","))}}const l=[o.map(t=>M(t)).join(","),...a].join(`
`);Q(l,r)}function M(u){return`"${String(u).replace(/"/g,'""')}"`}function Q(u,r){const e=new Blob([u],{type:"text/csv;charset=utf-8;"}),i=URL.createObjectURL(e),n=document.createElement("a");n.href=i,n.download=r,document.body.appendChild(n),n.click(),document.body.removeChild(n),URL.revokeObjectURL(i)}window.XLSX=X;H();let S=null,x="coach",I=[];const W=document.getElementById("app");V(O,async u=>{if(!u){window.location.href="/signin.html";return}const r=await B($(v,"users",u.uid));if((r.exists()?r.data().role:null)!=="admin"){window.location.href="/dashboard.html";return}S=u;const i=C(_(v,"registrations"),R("createdAt","desc"));F(i,n=>{I=n.docs.map(o=>({id:o.id,...o.data()})),x==="export"&&U()}),U()});function U(){W.innerHTML=`
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <div class="admin-sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <nav class="admin-nav">
          <button class="admin-nav-item ${x==="coach"?"active":""}" data-tab="coach">
            👥 Add Coach
          </button>
          <button class="admin-nav-item ${x==="family"?"active":""}" data-tab="family">
            👪 Add Family
          </button>
          <button class="admin-nav-item ${x==="export"?"active":""}" data-tab="export">
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
          <h1 class="admin-page-title">${x==="coach"?"Add Coach":x==="family"?"Add Family":"Export Data"}</h1>
        </header>
        <div class="admin-content">
          ${x==="coach"?K():x==="family"?Y():Z()}
        </div>
      </main>
    </div>
  `,ee()}function K(){return`
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
  `}function Y(){return`
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
      <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color);">
        <p class="admin-hint">Or upload an Excel file (.xls/.xlsx) with columns: <strong>email</strong>, <strong>name</strong></p>
        <button class="btn btn-outline btn-sm" id="family-upload-btn">📤 ${p("admin_family_upload_btn")}</button>
        <p id="family-upload-message" class="admin-form-message"></p>
      </div>
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
  `}function Z(){let u=I.length,r=0;const e={pending:0,active:0,inactive:0};for(const o of I){const a=o.swimmers||[];for(const l of a){if(l.deleted)continue;r++;const t=l.status||"pending";e[t]=(e[t]||0)+1}}const i=["Families","Swimmers","Active","Pending","Inactive"],n=[u,r,e.active||0,e.pending||0,e.inactive||0];return`
    <div class="admin-panel">
      <h3>Export All Registration Data</h3>
      <p class="admin-hint">Download a CSV file with every swimmer and their family contact information.</p>

      <table class="admin-table" style="margin: 1.5rem 0; max-width: 600px;">
        <thead>
          <tr>${i.map(o=>`<th>${o}</th>`).join("")}</tr>
        </thead>
        <tbody>
          <tr>${n.map(o=>`<td style="font-weight: 600; font-size: 1.1rem;">${o}</td>`).join("")}</tr>
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
          ${T.map(o=>`
            <label class="checkbox-label" style="display: inline-flex; align-items: center; gap: 0.35rem; cursor: pointer;">
              <input type="checkbox" class="export-col-cb" value="${o.key}" checked />
              <span>${o.label}</span>
            </label>
          `).join("")}
        </div>
      </div>

      <div style="margin-top: 2rem; display: flex; gap: 1rem; align-items: center;">
        <button class="btn btn-primary" id="admin-export-csv-btn" ${r===0?"disabled":""}>
          📥 Download CSV
        </button>
        <span style="color: var(--text-muted); font-size: 0.9rem;" id="export-filename-preview"></span>
      </div>
      <p id="export-message" class="admin-form-message" style="margin-top: 1rem;"></p>
    </div>
  `}function ee(){var i,n,o;document.querySelectorAll(".admin-nav-item[data-tab]").forEach(a=>{a.addEventListener("click",()=>{x=a.dataset.tab,U()})}),(i=document.getElementById("admin-signout"))==null||i.addEventListener("click",async()=>{await z(O),window.location.href="/signin.html"});const u=document.getElementById("coach-form");u&&u.addEventListener("submit",async a=>{a.preventDefault();const l=document.getElementById("coach-form-message"),t=document.getElementById("create-coach-btn"),h=document.getElementById("coach-email").value.trim(),c=document.getElementById("coach-name").value.trim()||null,f=document.getElementById("coach-role").value;if(!h){l.textContent="Email is required.",l.className="admin-form-message error";return}t.disabled=!0,l.textContent="";try{if(!(await N(C(_(v,"coaches"),k("email","==",h)))).empty)throw new Error("A coach with this email already exists.");if(!(await N(C(_(v,"families"),k("email","==",h)))).empty)throw new Error("This email is already in the family whitelist.");await q(_(v,"coaches"),{email:h,displayName:c,role:f,status:"pending",registeredUid:null,createdBy:S.uid,createdAt:new Date}),l.textContent=`Coach "${c||h}" added to whitelist. They can now sign up with this email.`,l.className="admin-form-message success",u.reset()}catch(y){l.textContent=`Error: ${y.message}`,l.className="admin-form-message error"}t.disabled=!1});const r=document.getElementById("family-form");r&&r.addEventListener("submit",async a=>{a.preventDefault();const l=document.getElementById("family-form-message"),t=document.getElementById("add-family-btn"),h=document.getElementById("family-email").value.trim(),c=document.getElementById("family-name").value.trim()||null;if(!h){l.textContent="Email is required.",l.className="admin-form-message error";return}t.disabled=!0,l.textContent="";try{if(!(await N(C(_(v,"families"),k("email","==",h)))).empty)throw new Error(p("admin_family_already_exists"));await q(_(v,"families"),{email:h,parentName:c,status:"pending",registeredUid:null,createdBy:S.uid,createdAt:new Date}),l.textContent=`"${c||h}" added successfully.`,l.className="admin-form-message success",r.reset()}catch(f){l.textContent=`Error: ${f.message}`,l.className="admin-form-message error"}t.disabled=!1});const e=document.getElementById("family-upload-btn");if(e&&e.addEventListener("click",()=>{const a=document.createElement("input");a.type="file",a.accept=".xls,.xlsx",a.addEventListener("change",te),a.click()}),x==="family"){const a=document.getElementById("family-table-body");if(a){const l=C(_(v,"families"),R("createdAt","desc"));F(l,t=>{const h=t.docs.map(c=>{var s,b;const f=c.data(),y=((b=(s=f.createdAt)==null?void 0:s.toDate)==null?void 0:b.call(s))||new Date(f.createdAt),g=f.status==="registered"?p("admin_family_status_registered"):p("admin_family_status_pending"),d=f.status==="registered"?"admin-status-active":"admin-status-pending";return`
            <tr>
              <td>${f.email||"—"}</td>
              <td>${f.parentName||"—"}</td>
              <td><span class="admin-status ${d}">${g}</span></td>
              <td>${y.toLocaleDateString()}</td>
              <td><button class="btn btn-outline btn-sm family-delete-btn" data-id="${c.id}" data-email="${f.email||""}" style="color: var(--color-accent);">${p("admin_family_delete")}</button></td>
            </tr>
          `}).join("");a.innerHTML=h||'<tr><td colspan="5" class="admin-empty">No families authorized yet.</td></tr>',a.querySelectorAll(".family-delete-btn").forEach(c=>{c.addEventListener("click",async()=>{const f=c.dataset.id,y=c.dataset.email;if(confirm(p("admin_family_delete_confirm")+`

`+y))try{const g=await B($(v,"families",f)),d=g.exists()?g.data().registeredUid:null,s=C(_(v,"registrations"),k("parentEmails","array-contains",y)),b=await N(s);let E=[];b.empty||(E=(b.docs[0].data().parentEmails||[]).filter(w=>w!==y&&w!==""));for(const m of E){const w=await N(C(_(v,"families"),k("email","==",m)));if(!w.empty){if(confirm("This family has another parent: "+m+`

Their whitelist entry is still active. Remove them too?

OK = Remove both  |  Cancel = Remove only `+y))for(const P of w.docs){const j=P.data().registeredUid;j&&await L($(v,"users",j),{role:"removed"}).catch(()=>{}),await A($(v,"families",P.id))}break}}d&&await L($(v,"users",d),{role:"removed"}).catch(()=>{}),await A($(v,"families",f))}catch(g){console.error("Error deleting family:",g),alert("Failed to delete: "+g.message)}})})},t=>{a.innerHTML=`<tr><td colspan="5" class="admin-empty">Error loading: ${t.message}</td></tr>`})}}if(x==="coach"){const a=document.getElementById("coach-table-body"),l=document.getElementById("pending-count");if(!a)return;const t=C(_(v,"coaches"),R("createdAt","desc"));F(t,h=>{let c=0;const f=h.docs.map(y=>{var w,D;const g=y.data();g.status==="pending"&&c++;const d=((D=(w=g.createdAt)==null?void 0:w.toDate)==null?void 0:D.call(w))||new Date(g.createdAt),s=g.role==="admin"?"Admin Coach":"Coach",b=g.role==="admin"?"admin-role-admin":"admin-role-coach",E=g.status==="active"?"active":"pending",m=g.status==="active"?"admin-status-active":"admin-status-pending";return`
          <tr>
            <td>${g.email||"—"}</td>
            <td>${g.displayName||"—"}</td>
            <td><span class="admin-role-badge ${b}">${s}</span></td>
            <td><span class="admin-status ${m}">${E}</span></td>
            <td>${d.toLocaleDateString()}</td>
            <td><button class="btn btn-outline btn-sm coach-delete-btn" data-id="${y.id}" data-email="${g.email||""}" style="color: var(--color-accent);">Delete</button></td>
          </tr>
        `}).join("");a.innerHTML=f||'<tr><td colspan="6" class="admin-empty">No coaches yet.</td></tr>',l.textContent=`${c} pending`,a.querySelectorAll(".coach-delete-btn").forEach(y=>{y.addEventListener("click",async()=>{const g=y.dataset.id,d=y.dataset.email;if(confirm(`Remove this coach authorization?

`+d))try{const s=await B($(v,"coaches",g)),b=s.exists()?s.data().registeredUid:null;b&&await L($(v,"users",b),{role:"removed"}).catch(()=>{}),await A($(v,"coaches",g))}catch(s){console.error("Error deleting coach:",s),alert("Failed to delete: "+s.message)}})})},h=>{a.innerHTML=`<tr><td colspan="6" class="admin-empty">Error loading: ${h.message}</td></tr>`})}if(x==="export"){const a=document.getElementById("admin-export-csv-btn"),l=document.getElementById("export-filename-preview");if(l){const t=new Date().toISOString().slice(0,10);l.textContent=`dragon-full-roster-${t}.csv`}(n=document.getElementById("export-select-all"))==null||n.addEventListener("click",()=>{document.querySelectorAll(".export-col-cb").forEach(t=>{t.checked=!0})}),(o=document.getElementById("export-deselect-all"))==null||o.addEventListener("click",()=>{document.querySelectorAll(".export-col-cb").forEach(t=>{t.checked=!1})}),a==null||a.addEventListener("click",()=>{const t=[];if(document.querySelectorAll(".export-col-cb:checked").forEach(f=>{t.push(f.value)}),t.length===0){const f=document.getElementById("export-message");f.textContent="Please select at least one column.",f.className="admin-form-message error";return}const h=new Date().toISOString().slice(0,10);J(I,`dragon-full-roster-${h}.csv`,t);const c=document.getElementById("export-message");c&&(c.textContent=`Download started — ${t.length} columns.`,c.className="admin-form-message success",setTimeout(()=>{c.textContent="",c.className="admin-form-message"},3e3))})}}async function te(u){var g;const r=(g=u.target.files)==null?void 0:g[0];if(u.target.remove(),!r)return;const e=document.getElementById("family-upload-message");e&&(e.textContent="",e.className="admin-form-message");const i=window.XLSX;if(!i){e&&(e.textContent="Excel parser not loaded. Please refresh the page.",e.className="admin-form-message error");return}let n;try{const d=await r.arrayBuffer(),s=i.read(new Uint8Array(d),{type:"array"}),b=s.Sheets[s.SheetNames[0]];n=i.utils.sheet_to_json(b,{header:1,defval:null})}catch(d){console.error("Excel parse error:",d),e&&(e.textContent=p("admin_family_upload_parse_error"),e.className="admin-form-message error");return}if(!n||n.length<2){e&&(e.textContent=p("admin_family_upload_empty"),e.className="admin-form-message error");return}const o=n[0];if(!o){e&&(e.textContent=p("admin_family_upload_parse_error"),e.className="admin-form-message error");return}const a=o.findIndex(d=>d&&String(d).toLowerCase().trim()==="email"),l=o.findIndex(d=>d&&String(d).toLowerCase().trim()==="name");if(a===-1){e&&(e.textContent=p("admin_family_upload_parse_error"),e.className="admin-form-message error");return}const t=[],h=new Set;for(let d=1;d<n.length;d++){const s=n[d];if(!s||s.every(w=>w==null||String(w).trim()===""))continue;const b=s[a]?String(s[a]).trim():"",E=l!==-1&&s[l]?String(s[l]).trim():"";if(!b)continue;if(!b.includes("@")||!b.includes(".")){t.push({email:b,name:E,rowNum:d+1,error:"Invalid email format"});continue}const m=b.toLowerCase();if(h.has(m)){t.push({email:b,name:E,rowNum:d+1,error:"Duplicate email in file"});continue}h.add(m),t.push({email:b,name:E,rowNum:d+1})}if(t.length===0){e&&(e.textContent=p("admin_family_upload_empty"),e.className="admin-form-message error");return}let c=[];try{c=(await N(_(v,"families"))).docs.map(s=>({id:s.id,...s.data()}))}catch(d){console.error("Error fetching families:",d),e&&(e.textContent=p("admin_family_upload_error"),e.className="admin-form-message error");return}const f=new Map;for(const d of c)f.set((d.email||"").toLowerCase(),d);const y=ae(t,f);ne(y,r.name)}function ae(u,r){const e={new:[],update:[],conflict:[],skip:[],errors:[]};for(const i of u){if(i.error){e.errors.push(i);continue}const n=i.email.toLowerCase(),o=r.get(n);if(!o){e.new.push(i);continue}const a=(o.parentName||"").trim(),l=(i.name||"").trim();!l&&!a||a.toLowerCase()===l.toLowerCase()?e.skip.push(i):!a&&l?e.update.push({...i,existingId:o.id}):e.conflict.push({...i,existingId:o.id,existingName:a})}return e}function ne(u,r){var b,E;const{new:e,update:i,conflict:n,skip:o,errors:a}=u,l=e.length+i.length+n.length+o.length+a.length,t=n.length>0,h=e.length+i.length>0,c=m=>String(m).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),f=(m,w)=>`<span class="status-badge ${w}">${m}</span>`,y=[...e.map(m=>({...m,status:"new"})),...i.map(m=>({...m,status:"updated"})),...n.map(m=>({...m,status:"conflict"})),...o.map(m=>({...m,status:"skipped"})),...a.map(m=>({...m,status:"error"}))],g=y.length>0?`
    <div class="family-preview-table-wrapper">
      <table class="family-preview-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Email</th>
            <th>${p("admin_family_conflict_col_excel_name")}</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${y.map(m=>`
            <tr>
              <td>${m.rowNum||"—"}</td>
              <td>${c(m.email)}</td>
              <td>${c(m.name||"—")}</td>
              <td>${f(m.status,m.status)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `:"",d=t?`
    <div class="family-conflict-block">
      <p class="family-conflict-title">${p("admin_family_upload_conflicts_title")}</p>
      <p class="family-conflict-hint">${p("admin_family_upload_conflict_hint")}</p>
      <div class="family-conflict-table-wrapper">
        <table class="family-conflict-table">
          <thead>
            <tr>
              <th>${p("admin_family_conflict_col_email")}</th>
              <th>${p("admin_family_conflict_col_excel_name")}</th>
              <th>${p("admin_family_conflict_col_existing_name")}</th>
            </tr>
          </thead>
          <tbody>
            ${n.map(m=>`
              <tr>
                <td>${c(m.email)}</td>
                <td>${c(m.name||"—")}</td>
                <td>${c(m.existingName||"—")}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `:"",s=document.createElement("div");s.className="confirm-overlay",s.innerHTML=`
    <div class="confirm-modal family-import-modal">
      <h3 class="confirm-title">${p("admin_family_upload_title")}</h3>
      <p class="family-import-filename">${p("admin_family_upload_file")}: <strong>${c(r)}</strong></p>

      <div class="family-summary">
        <span class="family-summary-item new">${p("admin_family_upload_summary",{total:String(l),new:String(e.length),updated:String(i.length),conflict:String(n.length),skipped:String(o.length)})}</span>
        ${a.length>0?`<span class="family-summary-item conflict">⚠ ${a.length} errors</span>`:""}
      </div>

      ${d}

      ${t?`<p class="confirm-warning" style="text-align: center;">${p("admin_family_upload_conflict_hint")}</p>`:`<p style="text-align: center; color: #16A34A; font-weight: var(--fw-semibold); margin-bottom: 1rem;">✅ ${p("admin_family_upload_no_conflicts")}</p>`}

      ${g}

      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="family-import-cancel">${p("admin_family_upload_cancel")}</button>
        ${h&&!t?`<button class="btn btn-primary btn-sm" id="family-import-confirm">${p("admin_family_upload_confirm",{count:String(e.length+i.length)})}</button>`:""}
      </div>
    </div>
  `,document.body.appendChild(s),(b=s.querySelector("#family-import-cancel"))==null||b.addEventListener("click",()=>s.remove()),(E=s.querySelector("#family-import-confirm"))==null||E.addEventListener("click",async()=>{s.remove(),await ie(u)}),s.addEventListener("click",m=>{m.target===s&&s.remove()})}async function ie(u){const{new:r,update:e}=u,i=r.length+e.length,n=document.getElementById("family-upload-message");if(i!==0)try{for(const o of r)await q(_(v,"families"),{email:o.email,parentName:o.name||null,status:"pending",registeredUid:null,createdBy:(S==null?void 0:S.uid)||null,createdAt:new Date});for(const o of e)await L($(v,"families",o.existingId),{parentName:o.name});n&&(n.textContent=p("admin_family_upload_success",{count:String(i)}),n.className="admin-form-message success")}catch(o){console.error("Batch import error:",o),n&&(n.textContent=p("admin_family_upload_error"),n.className="admin-form-message error")}}
