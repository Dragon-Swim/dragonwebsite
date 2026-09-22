import{i as R,t}from"./i18n-xMjO5e8v.js";import{a as V,r as z}from"./footer-CwjWw8Ec.js";import{o as G,h as H,g as B,e as $,q as O,w as W,c as Y,i as J,u as K,b as Q,m as U}from"./firebase-CorBctTj.js";import{d as F,n as q,l as X,a as Z,A as ee}from"./registrationCompleteness-jyrzMcbu.js";R();V();let S=1,y=null;const te=document.getElementById("app");function l(e,i=!0){return i?`${e}<span class="req-star" aria-hidden="true">*</span>`:e}function M(e,i){return q(`${e||""} ${i||""}`)}function x(){return`
    <option value="" disabled selected>Select...</option>
    <option value="male">${t("reg_gender_male")}</option>
    <option value="female">${t("reg_gender_female")}</option>
  `}function T(e,i={}){const{showGender:o=!0,middleOptional:n=!0}=i;return`
    <div class="form-row">
      <div class="form-group">
        <label class="form-label" for="${e}-first">${l(t("reg_first"))}</label>
        <input class="form-input" type="text" id="${e}-first" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="${e}-last">${l(t("reg_last"))}</label>
        <input class="form-input" type="text" id="${e}-last" required />
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label" for="${e}-middle">${l(n?t("reg_middle_optional"):t("reg_middle"),!n)}</label>
        <input class="form-input" type="text" id="${e}-middle" ${n?"":"required"} />
      </div>
      ${o?`
        <div class="form-group">
          <label class="form-label" for="${e}-gender">${l(t("reg_gender"))}</label>
          <select class="form-select" id="${e}-gender" required>
            ${x()}
          </select>
        </div>
      `:""}
    </div>
  `}function se(e){return`
    <div class="form-section">
      <h2 class="subsection-title">${t("reg_parent_title")}</h2>
      ${T("parent")}
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="parent-phone">${l(t("reg_phone"))}</label>
          <input class="form-input" type="tel" id="parent-phone" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="parent-email">${l(t("reg_email"))}</label>
          <input class="form-input" type="email" id="parent-email" value="${e||""}" readonly required
            title="Email is linked to your sign-in account and cannot be changed here." />
          <p class="reg-email-note" style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Email is tied to your sign-in account. Contact admin@dragonswim.com if you need to change it.</p>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="parent-address">${l(t("reg_address"))}</label>
        <input class="form-input" type="text" id="parent-address" required />
      </div>

      <label class="checkbox-label">
        <input type="checkbox" id="has-spouse" />
        <span>${t("reg_parent_add_spouse")}</span>
      </label>

      <div class="spouse-section" id="spouse-section" style="display: none;">
        <div class="section-divider"></div>
        <h3 class="subsection-subtitle">${t("reg_spouse_title")}</h3>
        ${T("spouse")}
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="spouse-phone">${t("reg_phone")}</label>
            <input class="form-input" type="tel" id="spouse-phone" />
          </div>
          <div class="form-group">
            <label class="form-label" for="spouse-email">${t("reg_email")}</label>
            <input class="form-input" type="email" id="spouse-email" />
          </div>
        </div>
      </div>
    </div>
  `}function P(e){return`
    <div class="swimmer-card" data-swimmer="${e}">
      <div class="swimmer-card-header">
        <span class="swimmer-label">Swimmer #${e}</span>
        ${e>1?`<button type="button" class="btn-remove-swimmer" data-remove="${e}">${t("reg_swimmer_remove")}</button>`:""}
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="swimmer-${e}-first">${l(t("reg_swimmer_first"))}</label>
          <input class="form-input" type="text" id="swimmer-${e}-first" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="swimmer-${e}-last">${l(t("reg_swimmer_last"))}</label>
          <input class="form-input" type="text" id="swimmer-${e}-last" required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="swimmer-${e}-middle">${t("reg_swimmer_middle")}</label>
          <input class="form-input" type="text" id="swimmer-${e}-middle" />
        </div>
        <div class="form-group">
          <label class="form-label" for="swimmer-${e}-gender">${l(t("reg_swimmer_gender"))}</label>
          <select class="form-select" id="swimmer-${e}-gender" required>
            ${x()}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="swimmer-${e}-dob">${l(t("reg_swimmer_dob"))}</label>
          <input class="form-input" type="date" id="swimmer-${e}-dob" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="swimmer-${e}-usaId">${t("reg_swimmer_usa_id")}</label>
          <input class="form-input" type="text" id="swimmer-${e}-usaId" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="swimmer-${e}-joinDate">${t("reg_swimmer_join_date")}</label>
          <input class="form-input" type="date" id="swimmer-${e}-joinDate" />
        </div>
        <div class="form-group"></div>
      </div>
    </div>
  `}function re(){return`
    <div class="form-section">
      <h2 class="subsection-title">${t("reg_swimmers_title")}</h2>
      <div id="swimmers-container">
        ${Array.from({length:S},(e,i)=>P(i+1)).join("")}
      </div>
      <button type="button" class="btn-add-swimmer" id="btn-add-swimmer">${t("reg_swimmer_add")}</button>
    </div>
  `}function ie(){return`
    <div class="form-section">
      <h2 class="subsection-title">${t("reg_emergency_title")}</h2>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="emergency-name">${l(t("reg_emergency_name"))}</label>
          <input class="form-input" type="text" id="emergency-name" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="emergency-phone">${l(t("reg_emergency_phone"))}</label>
          <input class="form-input" type="tel" id="emergency-phone" required />
        </div>
      </div>
    </div>
  `}function ae(){te.innerHTML=`
    <section class="section">
      <div class="container" style="max-width: 800px;">

        <div class="text-center" style="margin-bottom: var(--space-2xl);">
          <h1 class="section-title">${t("reg_title")}</h1>
          <div class="divider" style="margin: var(--space-md) auto;"></div>
          <p class="section-subtitle" style="margin: 0 auto;">${t("reg_subtitle")}</p>
        </div>

        <form class="reg-form-wrapper" id="reg-form">
          ${se((y==null?void 0:y.email)||"")}
          ${re()}
          ${ie()}

          <div class="form-section">
            <div class="form-group">
              <label class="form-label" for="reg-notes">${t("reg_notes")}</label>
              <textarea class="form-textarea" id="reg-notes" rows="3" placeholder="Any medical conditions, allergies, or other info we should know..."></textarea>
            </div>
          </div>

          <div class="reg-form-error" id="reg-form-error" role="alert"></div>

          <button type="submit" class="btn btn-primary btn-lg reg-submit" id="reg-submit">${t("reg_submit")}</button>

          <div class="reg-success" id="reg-success" style="display: none;">
            <div class="success-icon">✅</div>
            <p>${t("reg_success")}</p>
          </div>
        </form>

      </div>
    </section>
  `,le()}function le(){const e=document.getElementById("has-spouse"),i=document.getElementById("spouse-section");function o(){const s=e.checked;i.style.display=s?"block":"none",i.querySelectorAll("input, select, textarea").forEach(r=>{r.disabled=!s})}e.addEventListener("change",o),o(),document.getElementById("btn-add-swimmer").addEventListener("click",()=>{S++,document.getElementById("swimmers-container").insertAdjacentHTML("beforeend",P(S)),n()});function n(){document.querySelectorAll(".btn-remove-swimmer").forEach(s=>{s.replaceWith(s.cloneNode(!0)),s=document.querySelector(`[data-remove="${s.dataset.remove}"]`),s&&s.addEventListener("click",()=>{const r=document.querySelector(`.swimmer-card[data-swimmer="${s.dataset.remove}"]`);r&&r.remove(),oe()})})}n();const a=document.getElementById("reg-form"),d=document.getElementById("reg-form-error");a.addEventListener("invalid",s=>{s.target.classList.add("is-invalid")},!0);function c(){const s=h=>document.getElementById(h).value.trim(),r=(h,v)=>{document.getElementById(h).setCustomValidity(v||"")},u=M(s("parent-first"),s("parent-last")),g=s("parent-email").toLowerCase(),b=F(s("parent-phone")),_=document.getElementById("has-spouse").checked,w=M(s("spouse-first"),s("spouse-last"));r("spouse-last",_&&u&&w&&w===u?t("reg_err_spouse_name_same"):"");const f=s("spouse-email").toLowerCase();r("spouse-email",_&&g&&f&&f===g?t("reg_err_spouse_email_same"):"");const p=q(s("emergency-name"));r("emergency-name",u&&p&&p===u?t("reg_err_emergency_name_same"):"");const m=F(s("emergency-phone"));r("emergency-phone",b&&m&&m===b?t("reg_err_emergency_phone_same"):""),r("parent-address",X(s("parent-address"))?t("reg_err_address_email"):"");const N=_?w:"";document.querySelectorAll(".swimmer-card").forEach(h=>{const v=h.dataset.swimmer,A=document.getElementById(`swimmer-${v}-first`),C=document.getElementById(`swimmer-${v}-last`);if(!A)return;const k=q(`${A.value.trim()} ${C?C.value.trim():""}`),D=Z(s(`swimmer-${v}-dob`)),j=D!==null&&D>=ee;let I="";j&&u&&k===u?I=t("reg_err_swimmer_is_holder"):j&&N&&k===N&&(I=t("reg_err_swimmer_is_spouse")),r(`swimmer-${v}-first`,I)})}function E(){a.checkValidity();const s=[...a.elements].filter(r=>r.validity&&r.willValidate);return s.some(r=>r.validity.valueMissing)?"missing":s.some(r=>!r.validity.valid)?"conflict":null}const L=s=>{var r;(r=s.target.classList)==null||r.remove("is-invalid"),c()};a.addEventListener("input",L),a.addEventListener("change",L),document.getElementById("reg-submit").addEventListener("click",()=>{c();const s=E();d.textContent=s==="missing"?t("reg_required_error"):s==="conflict"?t("reg_conflict_error"):"",d.classList.toggle("is-visible",s!==null)}),a.addEventListener("submit",async s=>{s.preventDefault(),d.textContent="",d.classList.remove("is-visible");const r=document.getElementById("reg-submit");r.disabled=!0;const u={firstName:document.getElementById("parent-first").value.trim(),lastName:document.getElementById("parent-last").value.trim(),middleName:document.getElementById("parent-middle").value.trim()||null,gender:document.getElementById("parent-gender").value,phone:document.getElementById("parent-phone").value.trim(),email:document.getElementById("parent-email").value.trim(),address:document.getElementById("parent-address").value.trim()};let g=null;document.getElementById("has-spouse").checked&&(g={firstName:document.getElementById("spouse-first").value.trim(),lastName:document.getElementById("spouse-last").value.trim(),middleName:document.getElementById("spouse-middle").value.trim()||null,gender:document.getElementById("spouse-gender").value||null,phone:document.getElementById("spouse-phone").value.trim()||null,email:document.getElementById("spouse-email").value.trim()||null});const b=[];document.querySelectorAll(".swimmer-card").forEach(p=>{const m=p.dataset.swimmer;b.push({firstName:document.getElementById(`swimmer-${m}-first`).value.trim(),lastName:document.getElementById(`swimmer-${m}-last`).value.trim(),middleName:document.getElementById(`swimmer-${m}-middle`).value.trim()||null,gender:document.getElementById(`swimmer-${m}-gender`).value,dob:document.getElementById(`swimmer-${m}-dob`).value,usaSwimmingId:document.getElementById(`swimmer-${m}-usaId`).value.trim()||null,joinDate:document.getElementById(`swimmer-${m}-joinDate`).value||null})});const w={name:document.getElementById("emergency-name").value.trim(),phone:document.getElementById("emergency-phone").value.trim()},f=[u.email.toLowerCase().trim()];if(g&&g.email){const p=g.email.toLowerCase().trim();f.includes(p)||f.push(p)}try{await U(B($,"registrations",y.uid),{parent:u,spouse:g,swimmers:b,emergencyContact:w,notes:document.getElementById("reg-notes").value.trim()||null,parentEmails:f,editors:[y.uid],createdAt:new Date}),window.location.href="/dashboard.html"}catch(p){console.error("Failed to submit registration:",p),alert("Failed to submit registration. Please try again."),r.disabled=!1}})}function oe(){const e=document.querySelectorAll(".swimmer-card");e.forEach((o,n)=>{const a=n+1;o.dataset.swimmer=a,o.querySelector(".swimmer-label").textContent=`Swimmer #${a}`;const d=o.querySelector(".btn-remove-swimmer");d&&(d.dataset.remove=a,d.style.display=e.length>1?"":"none"),o.querySelectorAll("input, select").forEach(c=>{const E=c.id;c.id=E.replace(/swimmer-\d+-/,`swimmer-${a}-`)})});const i=document.querySelector('.swimmer-card[data-swimmer="1"] .btn-remove-swimmer');i&&(i.style.display=e.length>1?"":"none")}G(Q,async e=>{if(!e){window.location.href="/signin.html?mode=signup";return}if(y=e,(await H(B($,"registrations",e.uid))).exists()){window.location.href="/dashboard.html";return}if(e.email){const o=O(Y($,"registrations"),W("parentEmails","array-contains",e.email.toLowerCase().trim())),n=await J(o);if(!n.empty){const a=n.docs[0],c=a.data().editors||[];c.includes(e.uid)||(c.push(e.uid),await K(B($,"registrations",a.id),{editors:c})),window.location.href="/dashboard.html";return}}ae(),z()});
