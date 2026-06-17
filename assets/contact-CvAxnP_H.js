import{i as E,t as r}from"./i18n-DXCkrhfE.js";import{a as T,r as j}from"./footer-ByCGAPtM.js";import{a as x,c as S,e as R}from"./firebase-DKR4RDCB.js";class l{constructor(t=0,a="Network Error"){this.status=t,this.text=a}}const B=()=>{if(!(typeof localStorage>"u"))return{get:e=>Promise.resolve(localStorage.getItem(e)),set:(e,t)=>Promise.resolve(localStorage.setItem(e,t)),remove:e=>Promise.resolve(localStorage.removeItem(e))}},o={origin:"https://api.emailjs.com",blockHeadless:!1,storageProvider:B()},f=e=>e?typeof e=="string"?{publicKey:e}:e.toString()==="[object Object]"?e:{}:{},H=(e,t="https://api.emailjs.com")=>{if(!e)return;const a=f(e);o.publicKey=a.publicKey,o.blockHeadless=a.blockHeadless,o.storageProvider=a.storageProvider,o.blockList=a.blockList,o.limitRate=a.limitRate,o.origin=a.origin||t},v=async(e,t,a={})=>{const s=await fetch(o.origin+e,{method:"POST",headers:a,body:t}),i=await s.text(),n=new l(s.status,i);if(s.ok)return n;throw n},g=(e,t,a)=>{if(!e||typeof e!="string")throw"The public key is required. Visit https://dashboard.emailjs.com/admin/account";if(!t||typeof t!="string")throw"The service ID is required. Visit https://dashboard.emailjs.com/admin";if(!a||typeof a!="string")throw"The template ID is required. Visit https://dashboard.emailjs.com/admin/templates"},$=e=>{if(e&&e.toString()!=="[object Object]")throw"The template params have to be the object. Visit https://www.emailjs.com/docs/sdk/send/"},h=e=>e.webdriver||!e.languages||e.languages.length===0,y=()=>new l(451,"Unavailable For Headless Browser"),q=(e,t)=>{if(!Array.isArray(e))throw"The BlockList list has to be an array";if(typeof t!="string")throw"The BlockList watchVariable has to be a string"},I=e=>{var t;return!((t=e.list)!=null&&t.length)||!e.watchVariable},F=(e,t)=>e instanceof FormData?e.get(t):e[t],_=(e,t)=>{if(I(e))return!1;q(e.list,e.watchVariable);const a=F(t,e.watchVariable);return typeof a!="string"?!1:e.list.includes(a)},w=()=>new l(403,"Forbidden"),V=(e,t)=>{if(typeof e!="number"||e<0)throw"The LimitRate throttle has to be a positive number";if(t&&typeof t!="string")throw"The LimitRate ID has to be a non-empty string"},D=async(e,t,a)=>{const s=Number(await a.get(e)||0);return t-Date.now()+s},k=async(e,t,a)=>{if(!t.throttle||!a)return!1;V(t.throttle,t.id);const s=t.id||e;return await D(s,t.throttle,a)>0?!0:(await a.set(s,Date.now().toString()),!1)},L=()=>new l(429,"Too Many Requests"),K=async(e,t,a,s)=>{const i=f(s),n=i.publicKey||o.publicKey,d=i.blockHeadless||o.blockHeadless,m=i.storageProvider||o.storageProvider,u={...o.blockList,...i.blockList},p={...o.limitRate,...i.limitRate};return d&&h(navigator)?Promise.reject(y()):(g(n,e,t),$(a),a&&_(u,a)?Promise.reject(w()):await k(location.pathname,p,m)?Promise.reject(L()):v("/api/v1.0/email/send",JSON.stringify({lib_version:"4.4.1",user_id:n,service_id:e,template_id:t,template_params:a}),{"Content-type":"application/json"}))},O=e=>{if(!e||e.nodeName!=="FORM")throw"The 3rd parameter is expected to be the HTML form element or the style selector of the form"},N=e=>typeof e=="string"?document.querySelector(e):e,M=async(e,t,a,s)=>{const i=f(s),n=i.publicKey||o.publicKey,d=i.blockHeadless||o.blockHeadless,m=o.storageProvider||i.storageProvider,u={...o.blockList,...i.blockList},p={...o.limitRate,...i.limitRate};if(d&&h(navigator))return Promise.reject(y());const b=N(a);g(n,e,t),O(b);const c=new FormData(b);return _(u,c)?Promise.reject(w()):await k(location.pathname,p,m)?Promise.reject(L()):(c.append("lib_version","4.4.1"),c.append("service_id",e),c.append("template_id",t),c.append("user_id",n),v("/api/v1.0/email/send-form",c))},P={init:H,send:K,sendForm:M,EmailJSResponseStatus:l};P.init("nmrqLWXR_kGaoS459");E();T();const A=document.getElementById("app");A.innerHTML=`
  <section class="section" style="min-height: calc(100vh - var(--nav-height)); display: flex; align-items: center;">
    <div class="container" style="max-width: 800px;">
      <div class="text-center" style="margin-bottom: var(--space-2xl);">
        <h1 class="section-title animate-on-scroll">${r("contact_page_title")}</h1>
        <div class="divider" style="margin: var(--space-md) auto;"></div>
        <p class="section-subtitle" style="margin: 0 auto;">${r("contact_page_subtitle")}</p>
      </div>

      <div class="contact-form-wrapper" style="background: var(--bg-card); border-radius: var(--radius-lg); padding: var(--space-2xl); border: 1px solid var(--border-color);">
        <form class="contact-form" id="contact-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="contact-name">${r("contact_name_label")}</label>
              <input class="form-input" type="text" id="contact-name" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="contact-email">${r("contact_email_label")}</label>
              <input class="form-input" type="email" id="contact-email" required />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="contact-phone">${r("contact_phone_label")}</label>
            <input class="form-input" type="tel" id="contact-phone" />
          </div>
          <div class="form-group">
            <label class="form-label" for="contact-reason">${r("contact_reason_label")}</label>
            <select class="form-select" id="contact-reason" required>
              <option value="" disabled selected>${r("contact_reason_placeholder")}</option>
              <option value="tryout">${r("contact_reason_tryout")}</option>
              <option value="meet">${r("contact_reason_meet")}</option>
              <option value="question">${r("contact_reason_question")}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="contact-date">${r("contact_date_label")}</label>
            <input class="form-input" type="date" id="contact-date" />
          </div>
          <div class="form-group">
            <label class="form-label" for="contact-message">${r("contact_details_label")}</label>
            <textarea class="form-textarea" id="contact-message" rows="3" placeholder="${r("contact_details_placeholder")}" required></textarea>
          </div>
          <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;">${r("contact_btn_send")}</button>
        </form>

        <div class="contact-success" id="contact-success" style="display: none;">
          <div class="success-icon" style="font-size: 3rem; text-align: center; margin-bottom: 1rem;">✅</div>
          <p style="text-align: center; font-size: 1.25rem;">${r("contact_success_message")}</p>
        </div>
      </div>
    </div>
  </section>
`;j();document.getElementById("contact-form").addEventListener("submit",async e=>{e.preventDefault();const t=e.target.querySelector('button[type="submit"]');t.disabled=!0;const a={name:document.getElementById("contact-name").value.trim(),email:document.getElementById("contact-email").value.trim(),phone:document.getElementById("contact-phone").value.trim()||null,reason:document.getElementById("contact-reason").value,preferredDate:document.getElementById("contact-date").value||null,message:document.getElementById("contact-message").value.trim()};try{await x(S(R,"contacts"),{...a,createdAt:new Date}),P.send("service_czb2nff","template_xv57lco",{name:a.name,email:a.email,phone:a.phone||"Not provided",reason:a.reason,preferred_date:a.preferredDate||"Not specified",message:a.message}).catch(s=>console.warn("EmailJS delivery failed (data saved in Firestore):",s)),document.getElementById("contact-form").style.display="none",document.getElementById("contact-success").style.display="block"}catch(s){console.error("Failed to submit contact form:",s),alert(r("contact_alert_failed")),t.disabled=!1}});const z={root:null,rootMargin:"0px",threshold:.15},J=new IntersectionObserver((e,t)=>{e.forEach(a=>{a.isIntersecting&&(a.target.classList.add("animate-visible"),t.unobserve(a.target))})},z);document.querySelectorAll(".animate-on-scroll").forEach(e=>{J.observe(e)});
