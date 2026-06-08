import{u as o,t as r}from"./theme-toggle-CI3g1rpd.js";const l={en:{nav_home:"Home",nav_registration:"Registration",nav_contact:"Contact",nav_signin:"Sign In",hero_title:"Train Like a Dragon",hero_subtitle:"Join our competitive swim team and unlock your full potential in the water. Seasonal programs for all skill levels.",hero_cta:"Register Now",hero_cta_secondary:"Learn More",about_title:"About Dragon Swim",about_text:"Dragon Swim Team is a year-round competitive and recreational swimming program dedicated to developing swimmers of all ages and abilities. Our experienced coaching staff provides personalized training through seasonal programs designed to build technique, endurance, and team spirit.",seasons_title:"Our Seasons",seasons_subtitle:"Join us any time of year. Each season offers a unique training focus.",season_spring:"Spring",season_spring_dates:"March – May",season_spring_desc:"Technique refinement and race preparation. Focus on stroke mechanics and starts.",season_summer:"Summer",season_summer_dates:"June – August",season_summer_desc:"Intensive training and competition season. Daily practices with meet preparation.",season_fall:"Fall",season_fall_dates:"September – November",season_fall_desc:"Endurance building and base conditioning. Preparing for the winter championship season.",season_winter:"Winter",season_winter_dates:"December – February",season_winter_desc:"Championship season. Peak performance training and major competitions.",why_title:"Why Dragon Swim?",why_coaching:"Expert Coaching",why_coaching_desc:"Our certified coaches bring years of competitive and coaching experience.",why_community:"Strong Community",why_community_desc:"Be part of a supportive team that celebrates every achievement.",why_flexibility:"Flexible Scheduling",why_flexibility_desc:"Multiple practice times to fit your busy schedule.",why_growth:"Personal Growth",why_growth_desc:"Develop discipline, confidence, and lifelong fitness habits.",reg_title:"Season Registration",reg_subtitle:"Register your family to start training with Dragon Swim.",reg_select_season:"Select a Season",reg_parent_title:"Parent / Guardian",reg_first:"First Name",reg_last:"Last Name",reg_middle:"Middle Name",reg_middle_optional:"Middle Name (Optional)",reg_gender:"Gender",reg_gender_male:"Male",reg_gender_female:"Female",reg_phone:"Phone Number",reg_email:"Email Address",reg_address:"Home Address",reg_parent_add_spouse:"Add spouse / partner information",reg_spouse_title:"Spouse / Partner",reg_swimmers_title:"Swimmers",reg_swimmer_first:"First Name",reg_swimmer_last:"Last Name",reg_swimmer_middle:"Middle Name (Optional)",reg_swimmer_gender:"Gender",reg_swimmer_dob:"Date of Birth",reg_swimmer_usa_id:"USA Swimming ID (Optional)",reg_swimmer_join_date:"Join Date (Optional)",reg_swimmer_add:"+ Add Another Swimmer",reg_swimmer_remove:"Remove",reg_emergency_title:"Emergency Contact",reg_emergency_name:"Contact Name",reg_emergency_phone:"Contact Phone",reg_notes:"Additional Notes",reg_submit:"Submit Registration",reg_success:"Registration submitted successfully! We'll be in touch soon.",contact_title:"Contact Our Coaches",contact_subtitle:"Have questions? Reach out to our coaching team directly.",contact_coaches_title:"Meet the Coaches",contact_form_title:"Send a Message",contact_name:"Your Name",contact_email:"Your Email",contact_subject:"Subject",contact_message:"Message",contact_send:"Send Message",contact_success:"Message sent! Our team will get back to you shortly.",contact_hours_title:"Office Hours",contact_hours:"Monday – Friday: 4:00 PM – 7:00 PM",contact_email_label:"Email Us",contact_email_address:"coach@dragonswim.com",signin_title:"Welcome Back",signin_subtitle:"Sign in to manage your registrations and communicate with coaches.",signin_email:"Email Address",signin_password:"Password",signin_btn:"Sign In",signin_forgot:"Forgot password?",signin_no_account:"Don't have an account?",signin_signup_link:"Sign Up",signup_title:"Create Account",signup_name:"Full Name",signup_email:"Email Address",signup_password:"Password",signup_confirm:"Confirm Password",signup_btn:"Create Account",signup_has_account:"Already have an account?",signup_signin_link:"Sign In",signin_google:"Continue with Google",footer_tagline:"Training champions in and out of the water.",footer_links:"Quick Links",footer_contact:"Get in Touch",footer_rights:"© 2026 Dragon Swim Team. All rights reserved."}};let c="en";function n(e){const a=l[c];return(a==null?void 0:a[e])??e}function d(){const e=document.createElement("nav");e.className="navbar",e.id="navbar",e.innerHTML=`
    <div class="nav-container container">
      <a href="/dragonwebsite/" class="nav-logo">
        <img src="/dragonwebsite/logo-light.jpg" alt="Dragon Swim Team" class="nav-logo-img light-logo" />
        <img src="/dragonwebsite/logo-dark.png" alt="Dragon Swim Team" class="nav-logo-img dark-logo" />
      </a>

      <div class="nav-links" id="nav-links">
        <a href="/dragonwebsite/" class="nav-link ${t("/dragonwebsite/")}">${n("nav_home")}</a>
        <a href="/dragonwebsite/dashboard.html" class="nav-link ${t("/dragonwebsite/dashboard.html")}">Dashboard</a>
        <a href="/dragonwebsite/signin.html?mode=signup" class="nav-link ${t("/dragonwebsite/registration.html")||t("/dragonwebsite/signin.html")}">${n("nav_registration")}</a>
        <a href="/dragonwebsite/contact.html" class="nav-link ${t("/dragonwebsite/contact.html")}">${n("nav_contact")}</a>
        <a href="/dragonwebsite/signin.html" class="nav-link nav-link-signin ${t("/dragonwebsite/signin.html")}">${n("nav_signin")}</a>
      </div>

      <div class="nav-actions">
        <button class="nav-theme-toggle" id="theme-toggle" aria-label="Toggle theme"></button>
        <button class="nav-hamburger" id="nav-hamburger" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  `,document.body.prepend(e),o(),document.getElementById("theme-toggle").addEventListener("click",r);const a=document.getElementById("nav-hamburger"),i=document.getElementById("nav-links");a.addEventListener("click",()=>{a.classList.toggle("active"),i.classList.toggle("open")}),i.querySelectorAll(".nav-link").forEach(s=>{s.addEventListener("click",()=>{a.classList.remove("active"),i.classList.remove("open")})}),window.addEventListener("scroll",()=>{e.classList.toggle("scrolled",window.scrollY>10)})}function t(e){const a=window.location.pathname;return e==="/dragonwebsite/"&&(a==="/dragonwebsite/"||a==="/dragonwebsite/index.html")||e!=="/dragonwebsite/"&&a===e?"active":""}function m(){const e=document.createElement("footer");e.className="footer",e.innerHTML=`
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="footer-logo">
            <span class="nav-logo-icon">🐉</span>
            <span class="nav-logo-text">Dragon<span class="text-gradient">Swim</span></span>
          </div>
          <p class="footer-tagline">${n("footer_tagline")}</p>
        </div>
        <div class="footer-links">
          <h4 class="footer-heading">Legal & Compliance</h4>
          <ul class="footer-list">
            <li><a href="/dragonwebsite/privacy.html">Privacy Policy</a></li>
            <li><a href="/dragonwebsite/terms.html">Terms & Conditions</a></li>
            <li><a href="/dragonwebsite/safesport.html">USA SafeSport Compliance</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4 class="footer-heading">${n("footer_contact")}</h4>
          <ul class="footer-list">
            <li>${n("contact_email_address")}</li>
            <li>${n("contact_hours")}</li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>${n("footer_rights")}</p>
      </div>
    </div>
  `,document.body.appendChild(e)}export{d as a,m as r,n as t};
