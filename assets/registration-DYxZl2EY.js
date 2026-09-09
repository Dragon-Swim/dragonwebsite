import{i as A,t}from"./i18n-DXvg7HwR.js";import{a as j,r as F}from"./footer-DbUefdaU.js";import{o as P,h as T,g as E,e as w,q as V,w as x,c as z,i as M,u as R,b as H,m as O}from"./firebase-CorBctTj.js";A();j();let I=1,v=null;const W=document.getElementById("app");function a(e,i=!0){return i?`${e}<span class="req-star" aria-hidden="true">*</span>`:e}function C(e){return(e||"").toLowerCase().replace(/[.,'’`\-]/g," ").replace(/\s+/g," ").trim()}function q(e,i){return C(`${e||""} ${i||""}`)}function S(e){let i=(e||"").replace(/\D/g,"");return i.length===11&&i.startsWith("1")&&(i=i.slice(1)),i}function N(){return`
    <option value="" disabled selected>Select...</option>
    <option value="male">${t("reg_gender_male")}</option>
    <option value="female">${t("reg_gender_female")}</option>
  `}function L(e,i={}){const{showGender:o=!0,middleOptional:n=!0}=i;return`
    <div class="form-row">
      <div class="form-group">
        <label class="form-label" for="${e}-first">${a(t("reg_first"))}</label>
        <input class="form-input" type="text" id="${e}-first" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="${e}-last">${a(t("reg_last"))}</label>
        <input class="form-input" type="text" id="${e}-last" required />
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label" for="${e}-middle">${a(n?t("reg_middle_optional"):t("reg_middle"),!n)}</label>
        <input class="form-input" type="text" id="${e}-middle" ${n?"":"required"} />
      </div>
      ${o?`
        <div class="form-group">
          <label class="form-label" for="${e}-gender">${a(t("reg_gender"))}</label>
          <select class="form-select" id="${e}-gender" required>
            ${N()}
          </select>
        </div>
      `:""}
    </div>
  `}function G(e){return`
    <div class="form-section">
      <h2 class="subsection-title">${t("reg_parent_title")}</h2>
      ${L("parent")}
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="parent-phone">${a(t("reg_phone"))}</label>
          <input class="form-input" type="tel" id="parent-phone" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="parent-email">${a(t("reg_email"))}</label>
          <input class="form-input" type="email" id="parent-email" value="${e||""}" readonly required
            title="Email is linked to your sign-in account and cannot be changed here." />
          <p class="reg-email-note" style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Email is tied to your sign-in account. Contact admin@dragonswim.com if you need to change it.</p>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="parent-address">${a(t("reg_address"))}</label>
        <input class="form-input" type="text" id="parent-address" required />
      </div>

      <label class="checkbox-label">
        <input type="checkbox" id="has-spouse" />
        <span>${t("reg_parent_add_spouse")}</span>
      </label>

      <div class="spouse-section" id="spouse-section" style="display: none;">
        <div class="section-divider"></div>
        <h3 class="subsection-subtitle">${t("reg_spouse_title")}</h3>
        ${L("spouse")}
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
  `}function k(e){return`
    <div class="swimmer-card" data-swimmer="${e}">
      <div class="swimmer-card-header">
        <span class="swimmer-label">Swimmer #${e}</span>
        ${e>1?`<button type="button" class="btn-remove-swimmer" data-remove="${e}">${t("reg_swimmer_remove")}</button>`:""}
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="swimmer-${e}-first">${a(t("reg_swimmer_first"))}</label>
          <input class="form-input" type="text" id="swimmer-${e}-first" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="swimmer-${e}-last">${a(t("reg_swimmer_last"))}</label>
          <input class="form-input" type="text" id="swimmer-${e}-last" required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="swimmer-${e}-middle">${t("reg_swimmer_middle")}</label>
          <input class="form-input" type="text" id="swimmer-${e}-middle" />
        </div>
        <div class="form-group">
          <label class="form-label" for="swimmer-${e}-gender">${a(t("reg_swimmer_gender"))}</label>
          <select class="form-select" id="swimmer-${e}-gender" required>
            ${N()}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="swimmer-${e}-dob">${a(t("reg_swimmer_dob"))}</label>
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
  `}function J(){return`
    <div class="form-section">
      <h2 class="subsection-title">${t("reg_swimmers_title")}</h2>
      <div id="swimmers-container">
        ${Array.from({length:I},(e,i)=>k(i+1)).join("")}
      </div>
      <button type="button" class="btn-add-swimmer" id="btn-add-swimmer">${t("reg_swimmer_add")}</button>
    </div>
  `}function K(){return`
    <div class="form-section">
      <h2 class="subsection-title">${t("reg_emergency_title")}</h2>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="emergency-name">${a(t("reg_emergency_name"))}</label>
          <input class="form-input" type="text" id="emergency-name" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="emergency-phone">${a(t("reg_emergency_phone"))}</label>
          <input class="form-input" type="tel" id="emergency-phone" required />
        </div>
      </div>
    </div>
  `}function Q(){W.innerHTML=`
    <section class="section">
      <div class="container" style="max-width: 800px;">

        <div class="text-center" style="margin-bottom: var(--space-2xl);">
          <h1 class="section-title">${t("reg_title")}</h1>
          <div class="divider" style="margin: var(--space-md) auto;"></div>
          <p class="section-subtitle" style="margin: 0 auto;">${t("reg_subtitle")}</p>
        </div>

        <form class="reg-form-wrapper" id="reg-form">
          ${G((v==null?void 0:v.email)||"")}
          ${J()}
          ${K()}

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
  `,X()}function X(){const e=document.getElementById("has-spouse"),i=document.getElementById("spouse-section");function o(){const s=e.checked;i.style.display=s?"block":"none",i.querySelectorAll("input, select, textarea").forEach(r=>{r.disabled=!s})}e.addEventListener("change",o),o(),document.getElementById("btn-add-swimmer").addEventListener("click",()=>{I++,document.getElementById("swimmers-container").insertAdjacentHTML("beforeend",k(I)),n()});function n(){document.querySelectorAll(".btn-remove-swimmer").forEach(s=>{s.replaceWith(s.cloneNode(!0)),s=document.querySelector(`[data-remove="${s.dataset.remove}"]`),s&&s.addEventListener("click",()=>{const r=document.querySelector(`.swimmer-card[data-swimmer="${s.dataset.remove}"]`);r&&r.remove(),Y()})})}n();const l=document.getElementById("reg-form"),d=document.getElementById("reg-form-error");l.addEventListener("invalid",s=>{s.target.classList.add("is-invalid")},!0);function c(){const s=_=>document.getElementById(_).value.trim(),r=(_,D)=>{document.getElementById(_).setCustomValidity(D||"")},g=q(s("parent-first"),s("parent-last")),p=s("parent-email").toLowerCase(),y=S(s("parent-phone")),$=document.getElementById("has-spouse").checked,b=q(s("spouse-first"),s("spouse-last"));r("spouse-last",$&&g&&b&&b===g?t("reg_err_spouse_name_same"):"");const f=s("spouse-email").toLowerCase();r("spouse-email",$&&p&&f&&f===p?t("reg_err_spouse_email_same"):"");const u=C(s("emergency-name"));r("emergency-name",g&&u&&u===g?t("reg_err_emergency_name_same"):"");const m=S(s("emergency-phone"));r("emergency-phone",y&&m&&m===y?t("reg_err_emergency_phone_same"):"")}function h(){l.checkValidity();const s=[...l.elements].filter(r=>r.validity&&r.willValidate);return s.some(r=>r.validity.valueMissing)?"missing":s.some(r=>!r.validity.valid)?"conflict":null}const B=s=>{var r;(r=s.target.classList)==null||r.remove("is-invalid"),c()};l.addEventListener("input",B),l.addEventListener("change",B),document.getElementById("reg-submit").addEventListener("click",()=>{c();const s=h();d.textContent=s==="missing"?t("reg_required_error"):s==="conflict"?t("reg_conflict_error"):"",d.classList.toggle("is-visible",s!==null)}),l.addEventListener("submit",async s=>{s.preventDefault(),d.textContent="",d.classList.remove("is-visible");const r=document.getElementById("reg-submit");r.disabled=!0;const g={firstName:document.getElementById("parent-first").value.trim(),lastName:document.getElementById("parent-last").value.trim(),middleName:document.getElementById("parent-middle").value.trim()||null,gender:document.getElementById("parent-gender").value,phone:document.getElementById("parent-phone").value.trim(),email:document.getElementById("parent-email").value.trim(),address:document.getElementById("parent-address").value.trim()};let p=null;document.getElementById("has-spouse").checked&&(p={firstName:document.getElementById("spouse-first").value.trim(),lastName:document.getElementById("spouse-last").value.trim(),middleName:document.getElementById("spouse-middle").value.trim()||null,gender:document.getElementById("spouse-gender").value||null,phone:document.getElementById("spouse-phone").value.trim()||null,email:document.getElementById("spouse-email").value.trim()||null});const y=[];document.querySelectorAll(".swimmer-card").forEach(u=>{const m=u.dataset.swimmer;y.push({firstName:document.getElementById(`swimmer-${m}-first`).value.trim(),lastName:document.getElementById(`swimmer-${m}-last`).value.trim(),middleName:document.getElementById(`swimmer-${m}-middle`).value.trim()||null,gender:document.getElementById(`swimmer-${m}-gender`).value,dob:document.getElementById(`swimmer-${m}-dob`).value,usaSwimmingId:document.getElementById(`swimmer-${m}-usaId`).value.trim()||null,joinDate:document.getElementById(`swimmer-${m}-joinDate`).value||null})});const b={name:document.getElementById("emergency-name").value.trim(),phone:document.getElementById("emergency-phone").value.trim()},f=[g.email.toLowerCase().trim()];if(p&&p.email){const u=p.email.toLowerCase().trim();f.includes(u)||f.push(u)}try{await O(E(w,"registrations",v.uid),{parent:g,spouse:p,swimmers:y,emergencyContact:b,notes:document.getElementById("reg-notes").value.trim()||null,parentEmails:f,editors:[v.uid],createdAt:new Date}),window.location.href="/dashboard.html"}catch(u){console.error("Failed to submit registration:",u),alert("Failed to submit registration. Please try again."),r.disabled=!1}})}function Y(){const e=document.querySelectorAll(".swimmer-card");e.forEach((o,n)=>{const l=n+1;o.dataset.swimmer=l,o.querySelector(".swimmer-label").textContent=`Swimmer #${l}`;const d=o.querySelector(".btn-remove-swimmer");d&&(d.dataset.remove=l,d.style.display=e.length>1?"":"none"),o.querySelectorAll("input, select").forEach(c=>{const h=c.id;c.id=h.replace(/swimmer-\d+-/,`swimmer-${l}-`)})});const i=document.querySelector('.swimmer-card[data-swimmer="1"] .btn-remove-swimmer');i&&(i.style.display=e.length>1?"":"none")}P(H,async e=>{if(!e){window.location.href="/signin.html?mode=signup";return}if(v=e,(await T(E(w,"registrations",e.uid))).exists()){window.location.href="/dashboard.html";return}if(e.email){const o=V(z(w,"registrations"),x("parentEmails","array-contains",e.email.toLowerCase().trim())),n=await M(o);if(!n.empty){const l=n.docs[0],c=l.data().editors||[];c.includes(e.uid)||(c.push(e.uid),await R(E(w,"registrations",l.id),{editors:c})),window.location.href="/dashboard.html";return}}Q(),F()});
