import{i as g}from"./theme-toggle-CI3g1rpd.js";import{a as v,r as f,t}from"./footer-DF3ari8b.js";import{a as b,c as y,e as w}from"./firebase-B8poFbjz.js";g();v();let d=1;const $=document.getElementById("app");function u(){return`
    <option value="" disabled selected>Select...</option>
    <option value="male">${t("reg_gender_male")}</option>
    <option value="female">${t("reg_gender_female")}</option>
  `}function c(e,s={}){const{showGender:r=!0,middleOptional:a=!0}=s;return`
    <div class="form-row">
      <div class="form-group">
        <label class="form-label" for="${e}-first">${t("reg_first")}</label>
        <input class="form-input" type="text" id="${e}-first" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="${e}-last">${t("reg_last")}</label>
        <input class="form-input" type="text" id="${e}-last" required />
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label" for="${e}-middle">${a?t("reg_middle_optional"):t("reg_middle")}</label>
        <input class="form-input" type="text" id="${e}-middle" />
      </div>
      ${r?`
        <div class="form-group">
          <label class="form-label" for="${e}-gender">${t("reg_gender")}</label>
          <select class="form-select" id="${e}-gender" required>
            ${u()}
          </select>
        </div>
      `:""}
    </div>
  `}function _(){return`
    <div class="form-section">
      <h2 class="subsection-title">${t("reg_parent_title")}</h2>
      ${c("parent")}
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="parent-phone">${t("reg_phone")}</label>
          <input class="form-input" type="tel" id="parent-phone" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="parent-email">${t("reg_email")}</label>
          <input class="form-input" type="email" id="parent-email" required />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="parent-address">${t("reg_address")}</label>
        <input class="form-input" type="text" id="parent-address" required />
      </div>

      <label class="checkbox-label">
        <input type="checkbox" id="has-spouse" />
        <span>${t("reg_parent_add_spouse")}</span>
      </label>

      <div class="spouse-section" id="spouse-section" style="display: none;">
        <div class="section-divider"></div>
        <h3 class="subsection-subtitle">${t("reg_spouse_title")}</h3>
        ${c("spouse")}
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
  `}function p(e){return`
    <div class="swimmer-card" data-swimmer="${e}">
      <div class="swimmer-card-header">
        <span class="swimmer-label">Swimmer #${e}</span>
        ${e>1?`<button type="button" class="btn-remove-swimmer" data-remove="${e}">${t("reg_swimmer_remove")}</button>`:""}
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="swimmer-${e}-first">${t("reg_swimmer_first")}</label>
          <input class="form-input" type="text" id="swimmer-${e}-first" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="swimmer-${e}-last">${t("reg_swimmer_last")}</label>
          <input class="form-input" type="text" id="swimmer-${e}-last" required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="swimmer-${e}-middle">${t("reg_swimmer_middle")}</label>
          <input class="form-input" type="text" id="swimmer-${e}-middle" />
        </div>
        <div class="form-group">
          <label class="form-label" for="swimmer-${e}-gender">${t("reg_swimmer_gender")}</label>
          <select class="form-select" id="swimmer-${e}-gender" required>
            ${u()}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="swimmer-${e}-dob">${t("reg_swimmer_dob")}</label>
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
  `}function h(){return`
    <div class="form-section">
      <h2 class="subsection-title">${t("reg_swimmers_title")}</h2>
      <div id="swimmers-container">
        ${Array.from({length:d},(e,s)=>p(s+1)).join("")}
      </div>
      <button type="button" class="btn-add-swimmer" id="btn-add-swimmer">${t("reg_swimmer_add")}</button>
    </div>
  `}function E(){return`
    <div class="form-section">
      <h2 class="subsection-title">${t("reg_emergency_title")}</h2>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="emergency-name">${t("reg_emergency_name")}</label>
          <input class="form-input" type="text" id="emergency-name" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="emergency-phone">${t("reg_emergency_phone")}</label>
          <input class="form-input" type="tel" id="emergency-phone" required />
        </div>
      </div>
    </div>
  `}function I(){$.innerHTML=`
    <section class="section">
      <div class="container" style="max-width: 800px;">

        <div class="text-center" style="margin-bottom: var(--space-2xl);">
          <h1 class="section-title">${t("reg_title")}</h1>
          <div class="divider" style="margin: var(--space-md) auto;"></div>
          <p class="section-subtitle" style="margin: 0 auto;">${t("reg_subtitle")}</p>
        </div>

        <div class="reg-form-wrapper" id="reg-form-wrapper">
          ${_()}
          ${h()}
          ${E()}

          <div class="form-section">
            <div class="form-group">
              <label class="form-label" for="reg-notes">${t("reg_notes")}</label>
              <textarea class="form-textarea" id="reg-notes" rows="3" placeholder="Any medical conditions, allergies, or other info we should know..."></textarea>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-lg reg-submit" id="reg-submit">${t("reg_submit")}</button>

          <div class="reg-success" id="reg-success" style="display: none;">
            <div class="success-icon">✅</div>
            <p>${t("reg_success")}</p>
          </div>
        </div>

      </div>
    </section>
  `,B()}function B(){document.getElementById("has-spouse").addEventListener("change",s=>{document.getElementById("spouse-section").style.display=s.target.checked?"block":"none"}),document.getElementById("btn-add-swimmer").addEventListener("click",()=>{d++,document.getElementById("swimmers-container").insertAdjacentHTML("beforeend",p(d)),e()});function e(){document.querySelectorAll(".btn-remove-swimmer").forEach(s=>{s.replaceWith(s.cloneNode(!0)),s=document.querySelector(`[data-remove="${s.dataset.remove}"]`),s&&s.addEventListener("click",()=>{const r=document.querySelector(`.swimmer-card[data-swimmer="${s.dataset.remove}"]`);r&&r.remove(),q()})})}e(),document.getElementById("reg-submit").addEventListener("click",async()=>{const s=document.getElementById("reg-submit");s.disabled=!0;const r={firstName:document.getElementById("parent-first").value.trim(),lastName:document.getElementById("parent-last").value.trim(),middleName:document.getElementById("parent-middle").value.trim()||null,gender:document.getElementById("parent-gender").value,phone:document.getElementById("parent-phone").value.trim(),email:document.getElementById("parent-email").value.trim(),address:document.getElementById("parent-address").value.trim()};let a=null;document.getElementById("has-spouse").checked&&(a={firstName:document.getElementById("spouse-first").value.trim(),lastName:document.getElementById("spouse-last").value.trim(),middleName:document.getElementById("spouse-middle").value.trim()||null,gender:document.getElementById("spouse-gender").value||null,phone:document.getElementById("spouse-phone").value.trim()||null,email:document.getElementById("spouse-email").value.trim()||null});const l=[];document.querySelectorAll(".swimmer-card").forEach(i=>{const m=i.dataset.swimmer;l.push({firstName:document.getElementById(`swimmer-${m}-first`).value.trim(),lastName:document.getElementById(`swimmer-${m}-last`).value.trim(),middleName:document.getElementById(`swimmer-${m}-middle`).value.trim()||null,gender:document.getElementById(`swimmer-${m}-gender`).value,dob:document.getElementById(`swimmer-${m}-dob`).value,usaSwimmingId:document.getElementById(`swimmer-${m}-usaId`).value.trim()||null,joinDate:document.getElementById(`swimmer-${m}-joinDate`).value||null})});const n={name:document.getElementById("emergency-name").value.trim(),phone:document.getElementById("emergency-phone").value.trim()};try{await b(y(w,"registrations"),{parent:r,spouse:a,swimmers:l,emergencyContact:n,notes:document.getElementById("reg-notes").value.trim()||null,createdAt:new Date}),document.getElementById("reg-form-wrapper").querySelectorAll(".form-section, #reg-submit").forEach(i=>i.style.display="none"),document.getElementById("reg-success").style.display="flex"}catch(i){console.error("Failed to submit registration:",i),alert("Failed to submit registration. Please try again."),s.disabled=!1}})}function q(){const e=document.querySelectorAll(".swimmer-card");e.forEach((r,a)=>{const l=a+1;r.dataset.swimmer=l,r.querySelector(".swimmer-label").textContent=`Swimmer #${l}`;const o=r.querySelector(".btn-remove-swimmer");o&&(o.dataset.remove=l,o.style.display=e.length>1?"":"none"),r.querySelectorAll("input, select").forEach(n=>{const i=n.id;n.id=i.replace(/swimmer-\d+-/,`swimmer-${l}-`)})});const s=document.querySelector('.swimmer-card[data-swimmer="1"] .btn-remove-swimmer');s&&(s.style.display=e.length>1?"":"none")}I();f();
