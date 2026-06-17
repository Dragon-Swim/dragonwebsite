import{t as e,u as i,a as l}from"./i18n-DXCkrhfE.js";function c(){const a=document.createElement("nav");a.className="navbar",a.id="navbar",a.innerHTML=`
    <div class="nav-container container">
      <a href="/dragonwebsite/" class="nav-logo">
        <img src="/dragonwebsite/logo-light.jpg" alt="Dragon Swim Team" class="nav-logo-img light-logo" />
        <img src="/dragonwebsite/logo-dark.png" alt="Dragon Swim Team" class="nav-logo-img dark-logo" />
      </a>

      <div class="nav-links" id="nav-links">
        <a href="/dragonwebsite/" class="nav-link ${t("/dragonwebsite/")}">${e("nav_home")}</a>
        <a href="/dragonwebsite/dashboard.html" class="nav-link ${t("/dragonwebsite/dashboard.html")}">Dashboard</a>
        <a href="/dragonwebsite/signin.html?mode=signup" class="nav-link ${t("/dragonwebsite/registration.html")||t("/dragonwebsite/signin.html")}">${e("nav_registration")}</a>
        <a href="/dragonwebsite/contact.html" class="nav-link ${t("/dragonwebsite/contact.html")}">${e("nav_contact")}</a>
        <a href="/dragonwebsite/signin.html" class="nav-link nav-link-signin ${t("/dragonwebsite/signin.html")}">${e("nav_signin")}</a>
      </div>

      <div class="nav-actions">
        <button class="nav-theme-toggle" id="theme-toggle" aria-label="Toggle theme"></button>
        <button class="nav-hamburger" id="nav-hamburger" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  `,document.body.prepend(a),i(),document.getElementById("theme-toggle").addEventListener("click",l);const n=document.getElementById("nav-hamburger"),s=document.getElementById("nav-links");n.addEventListener("click",()=>{n.classList.toggle("active"),s.classList.toggle("open")}),s.querySelectorAll(".nav-link").forEach(o=>{o.addEventListener("click",()=>{n.classList.remove("active"),s.classList.remove("open")})}),window.addEventListener("scroll",()=>{a.classList.toggle("scrolled",window.scrollY>10)})}function t(a){const n=window.location.pathname;return a==="/dragonwebsite/"&&(n==="/dragonwebsite/"||n==="/dragonwebsite/index.html")||a!=="/dragonwebsite/"&&n===a?"active":""}function d(){const a=document.createElement("footer");a.className="footer",a.innerHTML=`
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="footer-logo">
            <span class="nav-logo-icon">🐉</span>
            <span class="nav-logo-text">Dragon<span class="text-gradient">Swim</span></span>
          </div>
          <p class="footer-tagline">${e("footer_tagline")}</p>
        </div>
        <div class="footer-links">
          <h4 class="footer-heading">Legal & Compliance</h4>
          <ul class="footer-list">
            <li><a href="/dragonwebsite/privacy.html">Privacy Policy</a></li>
            <li><a href="/dragonwebsite/terms.html">Terms & Conditions</a></li>
            <li><a href="/dragonwebsite/#safesport">USA SafeSport Compliance</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4 class="footer-heading">${e("footer_contact")}</h4>
          <ul class="footer-list">
            <li>${e("contact_email_address")}</li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>${e("footer_rights")}</p>
      </div>
    </div>
  `,document.body.appendChild(a)}export{c as a,d as r};
