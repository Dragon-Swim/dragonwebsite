import{t as r}from"./i18n-DJ9LIcXy.js";function d(e=new Date){const n=e.getFullYear(),t=String(e.getMonth()+1).padStart(2,"0"),s=String(e.getDate()).padStart(2,"0");return`${n}-${t}-${s}`}function b(e,n=new Date){if(!e)return!1;const t=d(n);return!(e.date&&t<e.date||e.until&&t>e.until)}function u(e,n=new Date){return(Array.isArray(e)?e:[]).filter(t=>b(t,n)).sort((t,s)=>String(s.date||"").localeCompare(String(t.date||"")))}function v(e,n=new Date){return u(e,n).find(t=>t.pinned===!0)||null}function $(e){if(!e)return"";const n=new Date(`${e}T12:00:00`);return Number.isNaN(n.getTime())?e:n.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}function B(e,n=new Date){const t=d(n);return e.until&&t>e.until?"expired":e.date&&t<e.date?"scheduled":"live"}const m="dragon.home.banner.dismissed.v1";function p(){try{const e=window.localStorage.getItem(m),n=e?JSON.parse(e):[];return Array.isArray(n)?n:[]}catch{return[]}}function h(e){try{const n=p().filter(t=>t!==e);n.push(e),window.localStorage.setItem(m,JSON.stringify(n.slice(-20)))}catch{}}function i(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function w(e){return String(e??"").split(`
`).map(n=>n.trim()).filter(Boolean)}function S(e,n=new Date){const t=v(e,n);return t?p().includes(t.id)?null:t:null}function A(e){if(!e)return"";const[n]=w(e.body),t=e.level==="urgent";return`
      <div class="news-banner${t?" is-urgent":""}" role="status" aria-live="polite">
        <div class="container news-banner-inner">
          <span class="news-banner-icon" aria-hidden="true">${t?"📣":"📰"}</span>
          <div class="news-banner-body">
            <strong class="news-banner-title">${i(e.title)}</strong>
            ${n?`<span class="news-banner-text">${i(n)}</span>`:""}
          </div>
          <a class="news-banner-link" href="#news">${r("news_read_more")}</a>
          <button type="button" class="news-banner-close" id="news-banner-close" aria-label="${r("news_dismiss")}" title="${r("news_dismiss")}">&#10005;</button>
        </div>
      </div>
    `}function g(e){return(Array.isArray(e)?e:[]).map(D).join("")}function D(e){const n=e.level==="urgent",t=w(e.body).map(a=>`<p>${i(a)}</p>`).join(""),s=e.link&&e.link.href?(()=>{const a=/^https?:/i.test(e.link.href);return`<a class="news-card-link" href="${i(e.link.href)}"${a?' target="_blank" rel="noopener"':""}>${i(e.link.label||r("news_read_more"))} &rarr;</a>`})():"";return`
      <article class="news-card${n?" is-urgent":""}">
        <div class="news-card-meta">
          <time class="news-card-date" datetime="${i(e.date||"")}">${i($(e.date))}</time>
          ${e.pinned?`<span class="news-card-pin">${r("news_pinned")}</span>`:""}
        </div>
        <h3 class="news-card-title">${i(e.title)}</h3>
        <div class="news-card-body">${t}</div>
        ${s}
      </article>
    `}function I(e,{pending:n=!1}={}){const t=Array.isArray(e)?e:[],s=t.length?g(t):n?"":`<p class="news-empty">${r("news_empty")}</p>`;return`
      <section class="section news-section" id="news">
        <div class="container">
          <div class="text-center animate-on-scroll" style="margin-bottom: var(--space-2xl);">
            <span class="badge badge-primary">${r("news_badge")}</span>
            <h2 class="section-title" style="margin-top: var(--space-md);">${r("news_title")}</h2>
            <div class="divider" style="margin: var(--space-md) auto;"></div>
            <p class="section-subtitle" style="margin: 0 auto;">${r("news_subtitle")}</p>
          </div>
          <div class="news-grid" id="news-grid">${s}</div>
        </div>
      </section>
    `}function N(e,{pending:n=!1}={}){const t=u(e),s=S(t),a=document.getElementById("news-banner-slot");if(a){const f=!!a.querySelector(".news-banner");a.innerHTML=A(s);const c=a.querySelector(".news-banner"),y=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;c&&!f&&!y&&(c.style.opacity="0",c.style.transition="opacity 220ms ease",requestAnimationFrame(()=>{c.style.opacity="1"}))}const o=document.getElementById("news-grid");o&&(o.innerHTML=t.length?g(t):n?"":`<p class="news-empty">${r("news_empty")}</p>`);const l=document.getElementById("news-dot");return l&&(l.hidden=t.length===0),_(s),t}function _(e){const n=document.querySelector(".news-banner"),t=document.getElementById("news-banner-close");!n||!t||!e||t.addEventListener("click",()=>{h(e.id),n.style.transition="opacity 150ms ease",n.style.opacity="0",window.setTimeout(()=>n.remove(),160)})}export{B as a,b,S as c,I as d,$ as f,u as g,_ as i,g as n,N as p,A as r,d as t};
