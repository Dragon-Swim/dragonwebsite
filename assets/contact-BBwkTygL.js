import{i as c,t as e}from"./i18n-C8EWnRiK.js";import{a as l,r as s}from"./footer-DoA2MGdd.js";import{a as n,c as r,e as i}from"./firebase-B6pM3H1n.js";c();l();const d=document.getElementById("app");d.innerHTML=`
  <section class="section" style="min-height: calc(100vh - var(--nav-height)); display: flex; align-items: center;">
    <div class="container" style="max-width: 800px;">
      <div class="text-center" style="margin-bottom: var(--space-2xl);">
        <h1 class="section-title animate-on-scroll">${e("contact_page_title")}</h1>
        <div class="divider" style="margin: var(--space-md) auto;"></div>
        <p class="section-subtitle" style="margin: 0 auto;">${e("contact_page_subtitle")}</p>
      </div>

      <div class="contact-form-wrapper" style="background: var(--bg-card); border-radius: var(--radius-lg); padding: var(--space-2xl); border: 1px solid var(--border-color);">
        <form class="contact-form" id="contact-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="contact-name">${e("contact_name_label")}</label>
              <input class="form-input" type="text" id="contact-name" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="contact-email">${e("contact_email_label")}</label>
              <input class="form-input" type="email" id="contact-email" required />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="contact-phone">${e("contact_phone_label")}</label>
            <input class="form-input" type="tel" id="contact-phone" />
          </div>
          <div class="form-group">
            <label class="form-label" for="contact-reason">${e("contact_reason_label")}</label>
            <select class="form-select" id="contact-reason" required>
              <option value="" disabled selected>${e("contact_reason_placeholder")}</option>
              <option value="tryout">${e("contact_reason_tryout")}</option>
              <option value="meet">${e("contact_reason_meet")}</option>
              <option value="question">${e("contact_reason_question")}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="contact-date">${e("contact_date_label")}</label>
            <input class="form-input" type="date" id="contact-date" />
          </div>
          <div class="form-group">
            <label class="form-label" for="contact-message">${e("contact_details_label")}</label>
            <textarea class="form-textarea" id="contact-message" rows="3" placeholder="${e("contact_details_placeholder")}" required></textarea>
          </div>
          <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;">${e("contact_btn_send")}</button>
        </form>

        <div class="contact-success" id="contact-success" style="display: none;">
          <div class="success-icon" style="font-size: 3rem; text-align: center; margin-bottom: 1rem;">✅</div>
          <p style="text-align: center; font-size: 1.25rem;">${e("contact_success_message")}</p>
        </div>
      </div>
    </div>
  </section>
`;s();document.getElementById("contact-form").addEventListener("submit",async t=>{t.preventDefault();const o=t.target.querySelector('button[type="submit"]');o.disabled=!0;try{await n(r(i,"contacts"),{name:document.getElementById("contact-name").value.trim(),email:document.getElementById("contact-email").value.trim(),phone:document.getElementById("contact-phone").value.trim()||null,reason:document.getElementById("contact-reason").value,preferredDate:document.getElementById("contact-date").value||null,message:document.getElementById("contact-message").value.trim(),createdAt:new Date}),document.getElementById("contact-form").style.display="none",document.getElementById("contact-success").style.display="block"}catch(a){console.error("Failed to submit contact form:",a),alert(e("contact_alert_failed")),o.disabled=!1}});const m={root:null,rootMargin:"0px",threshold:.15},u=new IntersectionObserver((t,o)=>{t.forEach(a=>{a.isIntersecting&&(a.target.classList.add("animate-visible"),o.unobserve(a.target))})},m);document.querySelectorAll(".animate-on-scroll").forEach(t=>{u.observe(t)});
