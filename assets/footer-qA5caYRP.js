import{t as n,u as i,a as l}from"./i18n-eZG49-MJ.js";function c(){const a=document.createElement("nav");a.className="navbar",a.id="navbar",a.innerHTML=`
    <div class="nav-container container">
      <a href="/" class="nav-logo">
        <img src="/logo-light.jpg" alt="Dragon Swim Team" class="nav-logo-img light-logo" />
        <img src="/logo-dark.png" alt="Dragon Swim Team" class="nav-logo-img dark-logo" />
      </a>

      <div class="nav-links" id="nav-links">
        <a href="/" class="nav-link ${s("/")}">${n("nav_home")}</a>
        <a href="/dashboard.html" class="nav-link ${s("/dashboard.html")}">Dashboard</a>
        <a href="/signin.html?mode=signup" class="nav-link ${s("/registration.html")||s("/signin.html")}">${n("nav_registration")}</a>

        <a href="/signin.html" class="nav-link nav-link-signin ${s("/signin.html")}">${n("nav_signin")}</a>
      </div>

      <div class="nav-actions">
        <button class="nav-theme-toggle" id="theme-toggle" aria-label="Toggle theme"></button>
        <button class="nav-hamburger" id="nav-hamburger" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  `,document.body.prepend(a),i(),document.getElementById("theme-toggle").addEventListener("click",l);const e=document.getElementById("nav-hamburger"),t=document.getElementById("nav-links");e.addEventListener("click",()=>{e.classList.toggle("active"),t.classList.toggle("open")}),t.querySelectorAll(".nav-link").forEach(o=>{o.addEventListener("click",()=>{e.classList.remove("active"),t.classList.remove("open")})}),window.addEventListener("scroll",()=>{a.classList.toggle("scrolled",window.scrollY>10)})}function s(a){const e=window.location.pathname;return a==="/"&&(e==="/"||e==="/index.html")||a!=="/"&&e===a?"active":""}function d(){const a=document.createElement("footer");a.className="footer",a.innerHTML=`
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
            <li><a href="/privacy.html">Privacy Policy</a></li>
            <li><a href="/terms.html">Terms & Conditions</a></li>
            <li><a href="/#safesport">USA SafeSport Compliance</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4 class="footer-heading">${n("footer_contact")}</h4>
          <ul class="footer-list">
            <li>${n("contact_email_address")}</li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>${n("footer_rights")}</p>
      </div>
    </div>
  `,document.body.appendChild(a)}export{c as a,d as r};
