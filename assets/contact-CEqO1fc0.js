import{i as o}from"./theme-toggle-CI3g1rpd.js";import{a as s,r as l}from"./footer-Ca1bpEjX.js";import{a as r,c,e as n}from"./firebase-DS2n7X8_.js";o();s();const i=document.getElementById("app");i.innerHTML=`
  <section class="section" style="min-height: calc(100vh - var(--nav-height)); display: flex; align-items: center;">
    <div class="container" style="max-width: 800px;">
      <div class="text-center" style="margin-bottom: var(--space-2xl);">
        <h1 class="section-title animate-on-scroll">Contact a Coach</h1>
        <div class="divider" style="margin: var(--space-md) auto;"></div>
        <p class="section-subtitle" style="margin: 0 auto;">Get in touch with a coach to evaluate your placement.</p>
      </div>

      <div class="contact-form-wrapper" style="background: var(--bg-card); border-radius: var(--radius-lg); padding: var(--space-2xl); border: 1px solid var(--border-color);">
        <form class="contact-form" id="contact-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="contact-name">First & Last Name</label>
              <input class="form-input" type="text" id="contact-name" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="contact-email">Email Address</label>
              <input class="form-input" type="email" id="contact-email" required />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="contact-phone">Phone Number (Optional)</label>
            <input class="form-input" type="tel" id="contact-phone" />
          </div>
          <div class="form-group">
            <label class="form-label" for="contact-reason">Reason for Contact</label>
            <select class="form-select" id="contact-reason" required>
              <option value="" disabled selected>Select a reason...</option>
              <option value="tryout">Schedule a Tryout</option>
              <option value="meet">Register for a Meet</option>
              <option value="question">General Questions</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="contact-date">Preferred Date (If applicable)</label>
            <input class="form-input" type="date" id="contact-date" />
          </div>
          <div class="form-group">
            <label class="form-label" for="contact-message">Additional Details</label>
            <textarea class="form-textarea" id="contact-message" rows="3" placeholder="Tell us roughly your experience level so we can pair you with the right coach, or any other details." required></textarea>
          </div>
          <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;">Send Email</button>
        </form>
        
        <div class="contact-success" id="contact-success" style="display: none;">
          <div class="success-icon" style="font-size: 3rem; text-align: center; margin-bottom: 1rem;">✅</div>
          <p style="text-align: center; font-size: 1.25rem;">Appointment request sent! A coach will be in touch shortly.</p>
        </div>
      </div>
    </div>
  </section>
`;l();document.getElementById("contact-form").addEventListener("submit",async e=>{e.preventDefault();const a=e.target.querySelector('button[type="submit"]');a.disabled=!0;try{await r(c(n,"contacts"),{name:document.getElementById("contact-name").value.trim(),email:document.getElementById("contact-email").value.trim(),phone:document.getElementById("contact-phone").value.trim()||null,reason:document.getElementById("contact-reason").value,preferredDate:document.getElementById("contact-date").value||null,message:document.getElementById("contact-message").value.trim(),createdAt:new Date}),document.getElementById("contact-form").style.display="none",document.getElementById("contact-success").style.display="block"}catch(t){console.error("Failed to submit contact form:",t),alert("Failed to send message. Please try again."),a.disabled=!1}});const d={root:null,rootMargin:"0px",threshold:.15},m=new IntersectionObserver((e,a)=>{e.forEach(t=>{t.isIntersecting&&(t.target.classList.add("animate-visible"),a.unobserve(t.target))})},d);document.querySelectorAll(".animate-on-scroll").forEach(e=>{m.observe(e)});
