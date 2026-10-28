import{t as o,i as Gt,a as Gn}from"./i18n-DJ9LIcXy.js";import{k as Te,c as ae,e as k,h as pe,g as L,n as xe,m as lt,a as Bt,q as be,x as Et,i as ot,y as Vt,f as Oe,v as ue,b as bt,o as Vn,l as Nt,u as us,E as Us,r as Ks,w as Ys}from"./firebase-CAICEMn2.js";import{b as Wn,p as Xn,c as Jn,s as Zn}from"./registrationCompleteness-jyrzMcbu.js";import{t as Tt,r as Qn,n as ea,a as Gs,f as ps}from"./news-DzgNqdPV.js";import{X as ta}from"./xlsx-DkFutVy2.js";const Ft=["SCY","LCM"],sa={FR:"Free",BK:"Back",BR:"Breast",FL:"Fly",IM:"IM",MED:"Medley Relay"};function Vs(e){if(e==null||e==="")return null;if(typeof e=="number")return Number.isFinite(e)?e:null;const t=String(e).trim(),s=/^(\d+):(\d{2}(?:\.\d+)?)$/.exec(t);if(s)return+s[1]*60+ +s[2];const n=Number(t);return Number.isFinite(n)?n:null}function Ce(e){return e==null||!Number.isFinite(e)?"—":e<60?e.toFixed(2):`${Math.floor(e/60)}:${(e%60).toFixed(2).padStart(5,"0")}`}function na(e){const t=/^(\d+)\s+([A-Za-z]{2,4})\s+(SCY|LCM|SCM)$/i.exec(String(e||"").trim());if(!t)return null;const s=t[2].toUpperCase();return{distance:+t[1],stroke:s,course:t[3].toUpperCase()}}function Re(e){if(!e)return null;if(e instanceof Date)return Number.isNaN(e.getTime())?null:e;if(typeof e=="object"&&typeof e.toDate=="function")return Re(e.toDate());const t=String(e).trim(),s=/^(\d{4})-(\d{2})-(\d{2})/.exec(t);if(s)return new Date(+s[1],+s[2]-1,+s[3]);const n=new Date(t);return Number.isNaN(n.getTime())?null:n}function Ws(e,t){const s=Re(e),n=Re(t);if(!s||!n)return null;let a=n.getFullYear()-s.getFullYear();return(n.getMonth()<s.getMonth()||n.getMonth()===s.getMonth()&&n.getDate()<s.getDate())&&a--,a}function Xs(e){return e==null||!Number.isFinite(e)?null:e>=15?"Open":e>=13?"13-14":e>=11?"11-12":"10&U"}function aa(e){return e?e==="Open"?["Open"]:e==="10&U"||e==="11-12"?[e,"12&U","Open"]:[e,"Open"]:[]}function oa(e,{qualifyingPeriodStart:t=null}={}){const s={SCY:new Map,LCM:new Map,outOfWindow:new Map},n=Re(t);for(const a of e||[]){const r=na(a.eventCode||`${a.distance||""} ${a.strokeAbbreviation||""} ${a.courseCode||""}`);if(!r||!s[r.course])continue;const i=Vs(a.swimTime??a.bestTime);if(i==null)continue;const d=`${r.distance} ${r.stroke}`,l=String(a.swimDate||"").slice(0,10),m=n&&l&&Re(l)<n?s.outOfWindow:s[r.course],c=m.get(d);(!c||i<c.seconds)&&m.set(d,{seconds:i,date:l,course:r.course})}return s}function ia(e){const t=String(e||"").trim().toLowerCase();return t.startsWith("f")||t.startsWith("g")?"F":t.startsWith("m")||t.startsWith("b")?"M":null}function ra(e,t){var l;const s=(e==null?void 0:e.standards)||{},n=`${e==null?void 0:e.distance} ${e==null?void 0:e.stroke}`,a=[];for(const A of Ft){const m=s[A];if(m==null)continue;const c=(l=t==null?void 0:t[A])==null?void 0:l.get(n);c&&a.push({course:A,bestSeconds:c.seconds,bestDate:c.date||"",standardSeconds:m,gapSeconds:+(c.seconds-m).toFixed(2),qualified:c.seconds<=m})}const r=Ft.every(A=>s[A]==null);if(a.length===0){const A=Ft.map(m=>{var c;return(c=t==null?void 0:t.outOfWindow)==null?void 0:c.get(n)}).filter(Boolean).sort((m,c)=>m.seconds-c.seconds)[0];return{state:"no-time",bestCourse:null,bestSeconds:null,bestDate:"",standardSeconds:null,gapSeconds:null,noStandard:r,staleSeconds:(A==null?void 0:A.seconds)??null,staleDate:(A==null?void 0:A.date)||""}}const i=a.filter(A=>A.qualified);let d;return i.length?d=i.find(A=>A.course==="SCY")||i[0]:d=[...a].sort((A,m)=>A.gapSeconds-m.gapSeconds||(A.course==="SCY"?-1:1))[0],{state:d.qualified?"qualified":"slower",bestCourse:d.course,bestSeconds:d.bestSeconds,bestDate:d.bestDate,standardSeconds:d.standardSeconds,gapSeconds:d.gapSeconds,noStandard:r,staleSeconds:null,staleDate:""}}function la({meet:e,swimmer:t,bestTimes:s}){const n=(e==null?void 0:e.ageDeterminedOn)||(e==null?void 0:e.startDate),a=Ws(t==null?void 0:t.dob,n),r=Xs(a),i=ia(t==null?void 0:t.gender),d=oa(s,{qualifyingPeriodStart:e==null?void 0:e.qualifyingPeriodStart}),l=new Map(((e==null?void 0:e.sessions)||[]).map(u=>[u.id,u])),A=[];String((t==null?void 0:t.usaSwimmingId)||(t==null?void 0:t.usaId)||"").trim()||A.push("no-usa-id"),a==null&&A.push("no-dob"),i||A.push("no-gender");const m=aa(r),c=((e==null?void 0:e.events)||[]).filter(u=>u.gender===i&&m.includes(u.ageGroup)).map(u=>{const y=l.get(u.sessionId)||null;return{key:`${u.eventNo}|${u.ageGroup}`,eventNo:u.eventNo,ageGroup:u.ageGroup,distance:u.distance,stroke:u.stroke,relay:!!u.relay,sessionId:u.sessionId,day:(y==null?void 0:y.date)||"",sessionLabel:y?`${y.day} ${y.start||""}`.trim():"",label:`${u.distance} ${sa[u.stroke]||u.stroke}`,standards:u.standards||{},isOpenGroup:u.ageGroup==="Open",...ra(u,d)}});return c.sort((u,y)=>u.relay-y.relay||String(u.day).localeCompare(String(y.day))||u.isOpenGroup-y.isOpenGroup||u.distance-y.distance||String(u.stroke).localeCompare(String(y.stroke))),{age:a,ageGroup:r,gender:i,blocked:A,canEnter:A.length===0,individual:c.filter(u=>!u.relay),relays:c.filter(u=>u.relay),qualifiedCount:c.filter(u=>!u.relay&&u.state==="qualified").length,meetDate:Re(n)}}function da(e){return e>=6?0:e>=3?1:e>=1?2:0}function Aa(e,t=new Date){const s=Re(e==null?void 0:e.entryDeadline);if(!s)return!1;const n=/T\d{2}:\d{2}/.test(String(e.entryDeadline))?new Date(e.entryDeadline):s;return t.getTime()>n.getTime()}function ca(e){const t=e==null?void 0:e.entryDeadline;if(!t)return"";const s=/T\d{2}:\d{2}/.test(String(t))?new Date(t):Re(t);return!s||Number.isNaN(s.getTime())?"":s.toLocaleString(void 0,{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})}function ma({meet:e,context:t,selected:s,manualTimes:n={}}){var v,B;const a=new Map([...t.individual,...t.relays].map(f=>[f.key,f])),r=(s||[]).map(f=>a.get(f)).filter(Boolean),i=[],d=[],l=(s||[]).filter(f=>!a.has(f));l.length&&i.push({code:"unknown-event",keys:l});const A=r.filter(f=>f.relay);A.length&&i.push({code:"relay-coach-only",labels:A.map(f=>f.label)});const m=r.map(f=>f.key).filter((f,_,x)=>x.indexOf(f)!==_);m.length&&i.push({code:"duplicate",labels:m});const c=(v=e==null?void 0:e.limits)==null?void 0:v.maxEvents;c&&r.length>c&&i.push({code:"too-many-events",count:r.length,max:c});const u=new Map;for(const f of r)f.day&&u.set(f.day,(u.get(f.day)||0)+1);const y=(B=e==null?void 0:e.limits)==null?void 0:B.maxPerDay;if(y)for(const[f,_]of u)_>y&&i.push({code:"too-many-per-day",day:f,count:_,max:y});for(const f of r)if(!f.relay){if(f.state==="slower")d.push({code:"slower-than-line",label:f.label,gapSeconds:f.gapSeconds,eventNo:f.eventNo,bonusAllowed:da(t.qualifiedCount)});else if(f.state==="no-time"){const _=String(n[f.key]||"").trim();_?Vs(_)==null?i.push({code:"bad-seed-time",label:f.label,value:_,key:f.key}):d.push({code:"manual-time",label:f.label,value:_,key:f.key}):i.push({code:"missing-seed-time",label:f.label,eventNo:f.eventNo,key:f.key})}f.isOpenGroup&&t.ageGroup!=="Open"&&d.push({code:"open-event",label:f.label,eventNo:f.eventNo})}const h=new Map;for(const f of r){if(f.relay)continue;const _=`${f.distance} ${f.stroke}`;h.has(_)||h.set(_,[]),h.get(_).push(f)}for(const[,f]of h)f.length>1&&d.push({code:"same-event-twice",labels:f.map(_=>`${_.ageGroup} ${_.label}`)});return{ok:i.length===0,errors:i,warnings:d,counts:{total:r.length,byDay:Object.fromEntries(u),qualified:r.filter(f=>f.state==="qualified").length}}}function ua(e,t){const s=String(t||"").trim().toUpperCase(),n=String(e||"").trim();return!n||!s?null:`${n}__${s}`}function pa(e){const t=new Map;for(const s of e){const n=s.day||"unknown";t.has(n)||t.set(n,{day:n,sessions:new Map});const a=t.get(n);a.sessions.has(s.sessionId)||a.sessions.set(s.sessionId,{sessionId:s.sessionId,label:s.sessionLabel,options:[]}),a.sessions.get(s.sessionId).options.push(s)}return[...t.values()].sort((s,n)=>String(s.day).localeCompare(String(n.day)))}const fs={draft:"meet_entries_status_draft",submitted:"meet_entries_status_submitted",confirmed:"meet_entries_status_confirmed",declined:"meet_entries_status_declined",none:"meet_entries_status_none"},b=e=>String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");function fa(e){if(!e)return null;if(e instanceof Date)return Number.isNaN(e.getTime())?null:e;if(typeof e.toDate=="function")return e.toDate();const t=new Date(e);return Number.isNaN(t.getTime())?null:t}const p={meet:null,role:"family",swimmers:[],familyId:null,actorId:null,entries:new Map,bestTimes:new Map,view:"list",active:null,ctx:null,selected:new Set,manualTimes:{},note:"",status:"draft",search:"",filter:"all",loading:!0,saving:!1,error:"",unsubscribe:null};function Js(){var e,t;(e=p.unsubscribe)==null||e.call(p),p.unsubscribe=null,(t=document.getElementById("meet-entries-container"))==null||t.remove()}function ha({meet:e,role:t,swimmers:s,familyId:n=null,actorId:a=null}){Js();const r=(s||[]).filter(l=>l.usaId);Object.assign(p,{meet:e,role:t,swimmers:s||[],familyId:n,actorId:a,entries:new Map,bestTimes:new Map,loading:!0,error:"",view:t==="family"&&(s||[]).length===1&&r.length===1?"editor":"list",active:null,ctx:null,selected:new Set,manualTimes:{},note:"",status:"draft",search:"",filter:"all",saving:!1});const i=document.createElement("div");i.id="meet-entries-container",i.addEventListener("click",Ea),i.addEventListener("change",ka),i.addEventListener("input",Ia),document.body.appendChild(i);const d=tt()?ya():ga();$e(),Promise.resolve(d).then(()=>{if(p.view!=="editor")return;const l=p.swimmers.find(A=>A.usaId);l&&sn(l)})}function ya(){p.unsubscribe=Te(ae(k,"meets",p.meet.id,"entries"),e=>{p.entries=new Map(e.docs.map(t=>[t.id,{id:t.id,...t.data()}])),p.loading=!1,p.view==="list"?$e():ba()},e=>{console.error("[meetEntries] entries listener failed:",e),p.loading=!1,p.error=e.message||String(e),$e()})}async function ga(){const e=p.swimmers.map(s=>it(s)).filter(Boolean),t=await Promise.all(e.map(s=>pe(L(k,"meets",p.meet.id,"entries",s)).catch(n=>(console.error("[meetEntries] entry read failed:",s,n),null))));for(const s of t)s!=null&&s.exists()&&p.entries.set(s.id,{id:s.id,...s.data()});p.loading=!1,p.view==="list"&&$e()}const tt=()=>p.role==="coach"||p.role==="admin",Zs=()=>Aa(p.meet),Wt=()=>Zs()&&!tt(),it=e=>ua(e.familyId,e.usaId),st=e=>{const t=it(e);return t&&p.entries.get(t)||null},At=e=>{var t;return((t=st(e))==null?void 0:t.status)||"none"},Qs=e=>{var t;return Array.isArray((t=st(e))==null?void 0:t.events)?st(e).events.length:0};function Xt(e){return`<span class="me-badge me-badge--${e}">${b(o(fs[e]||fs.none))}</span>`}async function Ba(e){if(!e)return{list:[]};if(p.bestTimes.has(e))return p.bestTimes.get(e);let t;try{const s=await pe(L(k,"swimResults",e)),n=s.exists()?s.data():{};t={list:n.bestTimes||[],fetchedAt:n.lastFetchSuccessAt||n.lastUpdated||null}}catch(s){console.error("[meetEntries] bestTimes read failed:",s),t={list:[],fetchedAt:null,error:s.message}}return p.bestTimes.set(e,t),t}function $e(){const e=document.getElementById("meet-entries-container");if(!e)return;const t=p.meet;e.innerHTML=`
    <div class="meet-entries-overlay" id="meet-entries-overlay">
      <div class="meet-entries-modal" role="dialog" aria-modal="true" aria-label="${b(t.name||"Meet entries")}">
        <div class="me-header">
          <div class="me-header-text">
            <h2>${b(t.name||"Meet")}</h2>
            <p class="me-sub" id="me-header-meta">${en()}</p>
          </div>
          <button type="button" class="me-close" id="me-close" aria-label="Close">×</button>
        </div>
        <div class="me-body" id="me-body">${p.view==="list"?va():$a()}</div>
        <div class="me-footer" id="me-footer">${tn()}</div>
      </div>
    </div>
  `,p.view==="editor"&&ct()}function ba(){const e=document.getElementById("me-header-meta");e&&(e.innerHTML=en())}function en(){var a,r;const e=[],t=(a=p.meet)==null?void 0:a.startDate,s=(r=p.meet)==null?void 0:r.endDate;t&&e.push(b(`${t}${s&&s!==t?` – ${s}`:""}`));const n=ca(p.meet);return n&&e.push(`${b(o("meet_entries_deadline"))}: ${b(n)}`),Zs()&&e.push(`<strong class="me-closed">${b(o("meet_entries_closed"))}</strong>`),e.join(" · ")}function va(){return tt()?wa():_a()}function _a(){return`<div class="me-family-list">${p.swimmers.map(t=>{var r,i;if(!it(t))return`<div class="me-family-card me-family-card--blocked">
        <strong>${b(t.name)}</strong>
        <p class="me-hint">${b(o("meet_entries_blocked_no_id"))}</p>
      </div>`;const s=At(t),n=st(t),a=((i=(r=n==null?void 0:n.submittedAt)==null?void 0:r.toDate)==null?void 0:i.call(r))||(n!=null&&n.submittedAt?new Date(n.submittedAt):null);return`<div class="me-family-card">
      <div>
        <strong>${b(t.name)}</strong>
        <div class="me-sub">${t.age!=null?`${t.age} · `:""}${b(t.ageGroup||"")}</div>
      </div>
      <div class="me-family-card-right">
        ${Xt(s)}
        <span class="me-sub">${Qs(t)} ${b(o("meet_entries_events_short"))}
          ${a&&!Number.isNaN(a.getTime())?` · ${b(a.toLocaleDateString())}`:""}</span>
        <button type="button" class="btn btn-outline btn-sm" data-action="edit" data-usa="${b(t.usaId)}">
          ${b(o(s==="none"?"meet_entries_enter":"meet_entries_review"))}
        </button>
      </div>
    </div>`}).join("")}</div>`}function wa(){const e=p.swimmers.filter(a=>it(a)),t=p.swimmers.length-e.length,s={none:0,draft:0,submitted:0,confirmed:0,declined:0};for(const a of e)s[At(a)]=(s[At(a)]||0)+1;const n=[["all",o("meet_entries_filter_all")],["submitted",o("meet_entries_filter_submitted")],["confirmed",o("meet_entries_filter_confirmed")],["none",o("meet_entries_filter_none")]];return`
    <div class="me-toolbar">
      <input type="search" id="me-search" class="me-search" placeholder="${b(o("meet_entries_search"))}" value="${b(p.search)}">
      <select id="me-filter" class="me-filter">
        ${n.map(([a,r])=>`<option value="${a}" ${p.filter===a?"selected":""}>${b(r)}</option>`).join("")}
      </select>
      <span class="me-counts">${b(o("meet_entries_counts",{total:e.length,submitted:s.submitted,confirmed:s.confirmed}))}</span>
    </div>
    <div id="me-list-body">${Jt()}</div>
    ${t>0?`<p class="me-hint">${b(o("meet_entries_no_usa_id_hint",{count:t}))}</p>`:""}
  `}function Jt(){const e=p.search.trim().toLowerCase(),t=p.swimmers.filter(s=>it(s)).map(s=>({sw:s,status:At(s),count:Qs(s)})).filter(({sw:s,status:n})=>e&&!String(s.name).toLowerCase().includes(e)?!1:p.filter==="all"?!0:n===p.filter).sort((s,n)=>String(s.sw.name).localeCompare(String(n.sw.name)));return p.loading?`<p class="me-empty">${b(o("meet_entries_loading"))}</p>`:t.length===0?`<p class="me-empty">${b(o("meet_entries_none_match"))}</p>`:`
    <table class="me-table">
      <thead>
        <tr>
          <th>${b(o("meet_entries_col_swimmer"))}</th>
          <th>${b(o("meet_entries_col_group"))}</th>
          <th>${b(o("meet_entries_col_events"))}</th>
          <th>${b(o("meet_entries_col_status"))}</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${t.map(({sw:s,status:n,count:a})=>`
          <tr>
            <td class="me-name">${b(s.name)}</td>
            <td>${s.age!=null?`${s.age} · `:""}${b(s.ageGroup||"")}</td>
            <td>${a}</td>
            <td>${Xt(n)}</td>
            <td class="me-row-action">
              <button type="button" class="btn btn-outline btn-sm" data-action="edit" data-usa="${b(s.usaId)}">
                ${b(o(n==="none"?"meet_entries_add":"meet_entries_review"))}
              </button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `}function $a(){const e=p.active;if(!e)return`<p class="me-empty">${b(o("meet_entries_pick_swimmer"))}</p>`;if(!p.ctx)return`<p class="me-empty">${b(o("meet_entries_loading"))}</p>`;const t=p.ctx.ageGroup==="Open",s=t?p.ctx.individual:p.ctx.individual.filter(l=>!l.isOpenGroup),n=t?[]:p.ctx.individual.filter(l=>l.isOpenGroup),a=pa(s),r=p.ctx.relays,i=Wt(),d=n.some(l=>p.selected.has(l.key));return`
    ${tt()?`<button type="button" class="btn btn-outline btn-sm me-back" data-action="back">← ${b(o("meet_entries_back"))}</button>`:""}
    <div class="me-swimmer-head">
      <div class="me-swimmer-id">
        <h3>${b(e.name)}</h3>
        <p class="me-sub">
          ${b(o("meet_entries_swims_as",{age:p.ctx.age??"—",group:p.ctx.ageGroup||"—",date:p.meet.ageDeterminedOn||p.meet.startDate||""}))}
          · ${b(p.ctx.qualifiedCount>0?o("meet_entries_qualifies_count",{count:p.ctx.qualifiedCount}):o("meet_entries_qualifies_none"))}
          ${p.status!=="none"?` · ${Xt(p.status)}`:""}
        </p>
        ${p.ctx.fetchedAt?`<p class="me-sub me-freshness">${b(o("meet_entries_data_as_of",{date:(fa(p.ctx.fetchedAt)||new Date).toLocaleDateString()}))}</p>`:""}
      </div>
      <div id="me-summary" class="me-summary"></div>
    </div>

    ${i?`<p class="me-alert">${b(o("meet_entries_locked"))}</p>`:""}
    ${p.ctx.blocked.length?`<p class="me-alert">${b(xa())}</p>`:""}
    ${a.length===0&&!p.ctx.blocked.length?`<p class="me-empty">${b(o("meet_entries_no_events"))}</p>`:""}

    ${a.map(l=>`
      <section class="me-day">
        <h4>${b(Zt(l.day))}</h4>
        ${[...l.sessions.values()].map(A=>`
          <div class="me-session">
            ${A.label?`<div class="me-session-label">${b(A.label)}</div>`:""}
            ${A.options.map(m=>hs(m,{isLocked:i})).join("")}
          </div>
        `).join("")}
      </section>
    `).join("")}

    ${n.length?`
      <details class="me-open" ${d?"open":""}>
        <summary>${b(o("meet_entries_open_title"))}</summary>
        <p class="me-hint">${b(o("meet_entries_open_hint"))}</p>
        ${n.map(l=>hs(l,{isLocked:i,markOpen:!0})).join("")}
      </details>
    `:""}

    ${r.length?`
      <section class="me-day">
        <h4>${b(o("meet_entries_relays_title"))}</h4>
        <p class="me-hint">${b(o("meet_entries_relays_hint"))}</p>
        <div class="me-relay-list">
          ${r.map(l=>`<span class="me-relay-chip">#${l.eventNo} ${b(l.ageGroup)} ${b(l.label)}</span>`).join("")}
        </div>
      </section>
    `:""}

    <div id="me-problems" class="me-problems"></div>

    <label class="me-note-label" for="me-note">${b(o(tt()?"meet_entries_coach_note":"meet_entries_note"))}</label>
    <textarea id="me-note" class="me-note" rows="2" placeholder="${b(o("meet_entries_note_placeholder"))}" ${i?"disabled":""}>${b(p.note)}</textarea>
  `}function Zt(e){if(!e||e==="unknown")return o("meet_entries_day_unknown");const t=new Date(`${e}T00:00:00`);return Number.isNaN(t.getTime())?e:t.toLocaleDateString(void 0,{weekday:"short",month:"short",day:"numeric"})}function xa(){const e={"no-usa-id":o("meet_entries_blocked_no_id"),"no-dob":o("meet_entries_blocked_no_dob"),"no-gender":o("meet_entries_blocked_no_gender")};return p.ctx.blocked.map(t=>e[t]||t).join(" ")}function hs(e,{isLocked:t,markOpen:s=!1}){const n=p.selected.has(e.key),a=t||e.relay,r=`me-row me-row--${e.state}${n?" is-selected":""}${s?" is-open":""}`,i=e.state==="no-time"?`
    <span class="me-manual-wrap"${n?"":" hidden"}>
      <input type="text" class="me-manual" data-manual="${b(e.key)}"
             placeholder="${b(o("meet_entries_manual_time"))}"
             value="${b(p.manualTimes[e.key]||"")}" ${t?"disabled":""}>
    </span>`:"";return`
    <div class="${r}" data-event-row="${b(e.key)}">
      <label class="me-row-main">
        <input type="checkbox" data-key="${b(e.key)}" ${n?"checked":""} ${a?"disabled":""}>
        <span class="me-evt-no">#${e.eventNo}</span>
        <span class="me-evt-label">${b(e.ageGroup)} ${b(e.label)}</span>
        <span class="me-evt-time">${Sa(e)}</span>
      </label>
      ${i}
    </div>
  `}function Sa(e){var a,r;if(e.noStandard)return`<span class="me-state me-state--none">${b(o("meet_entries_no_line"))}</span>`;if(e.state==="qualified")return`<span class="me-state me-state--ok">✅ ${b(Ce(e.bestSeconds))} ${b(e.bestCourse)}</span>
      <small>${b(o("meet_entries_line"))} ${b(Ce(e.standardSeconds))}${e.bestDate?` · ${b(e.bestDate)}`:""}</small>`;if(e.state==="slower")return`<span class="me-state me-state--warn">⚠️ ${b(Ce(e.bestSeconds))} ${b(e.bestCourse)}</span>
      <small>${b(o("meet_entries_line"))} ${b(Ce(e.standardSeconds))} · ${b(o("meet_entries_gap",{gap:Number(e.gapSeconds).toFixed(2)}))}</small>`;const t=e.staleSeconds!=null?` <small>${b(o("meet_entries_stale",{time:Ce(e.staleSeconds),date:e.staleDate}))}</small>`:"",s=((a=e.standards)==null?void 0:a.SCY)!=null?`${Ce(e.standards.SCY)} SCY`:((r=e.standards)==null?void 0:r.LCM)!=null?`${Ce(e.standards.LCM)} LCM`:"",n=s?` <small>${b(o("meet_entries_line"))} ${b(s)}</small>`:"";return`<span class="me-state me-state--none">${b(o("meet_entries_no_time"))}</span>${n}${t}`}function tn(){var s;if(p.view==="list")return`<span class="me-footer-note">${b(o("meet_entries_footer_list"))}</span>`;if(!((s=p.ctx)!=null&&s.canEnter))return`<button type="button" class="btn btn-outline btn-sm" data-action="back">${b(o("meet_entries_back"))}</button>`;const e=Wt(),t=p.saving||e?"disabled":"";return tt()?`
      <button type="button" class="btn btn-primary btn-sm" data-action="confirm" ${t}>${b(o("meet_entries_save_confirm"))}</button>
      <button type="button" class="btn btn-outline btn-sm" data-action="save" ${t}>${b(o("meet_entries_save"))}</button>
      <button type="button" class="btn btn-outline btn-sm me-danger" data-action="decline" ${t}>${b(o("meet_entries_decline"))}</button>
      ${p.status==="confirmed"||p.status==="declined"?`<button type="button" class="btn btn-outline btn-sm" data-action="reopen" ${t}>${b(o("meet_entries_reopen"))}</button>`:""}
      <span class="me-footer-note me-save-note"></span>
    `:`
    <button type="button" class="btn btn-primary btn-sm" data-action="submit" ${t}>${b(o("meet_entries_submit"))}</button>
    <button type="button" class="btn btn-outline btn-sm" data-action="draft" ${t}>${b(o("meet_entries_save_draft"))}</button>
    <span class="me-footer-note me-save-note">${b(p.saving?o("meet_entries_saving"):p.error||"")}</span>
  `}function ct(){var a,r;if(!p.ctx)return null;const e=ma({meet:p.meet,context:p.ctx,selected:[...p.selected],manualTimes:p.manualTimes}),t=document.getElementById("me-summary"),s=document.getElementById("me-problems");if(t){const i=(r=(a=p.meet)==null?void 0:a.limits)==null?void 0:r.maxEvents,d=Object.entries(e.counts.byDay||{}).map(([l,A])=>{var m,c;return`${Zt(l)} ${A}/${((c=(m=p.meet)==null?void 0:m.limits)==null?void 0:c.maxPerDay)??"–"}`}).join(" · ");t.innerHTML=`
      <strong>${e.counts.total}${i?` / ${i}`:""}</strong> ${b(o("meet_entries_events_chosen"))}
      ${d?`<div class="me-summary-days">${b(d)}</div>`:""}
    `}if(s){const i=[...e.errors.map(d=>`<li class="me-problem me-problem--error">⛔ ${b(ys(d))}</li>`),...e.warnings.map(d=>`<li class="me-problem me-problem--warn">⚠️ ${b(ys(d))}</li>`)];s.innerHTML=i.length?`<ul>${i.join("")}</ul>`:""}const n=document.querySelector('[data-action="submit"], [data-action="confirm"]');return n&&(n.disabled=p.saving||Wt()||!e.ok),e}function ys(e){switch(e.code){case"too-many-events":return o("meet_entries_err_too_many",{count:e.count,max:e.max});case"too-many-per-day":return o("meet_entries_err_per_day",{day:Zt(e.day),count:e.count,max:e.max});case"relay-coach-only":return o("meet_entries_err_relay");case"missing-seed-time":return o("meet_entries_err_seed_missing",{label:e.label});case"bad-seed-time":return o("meet_entries_err_seed_bad",{label:e.label,value:e.value});case"duplicate":case"unknown-event":return o("meet_entries_err_invalid");case"slower-than-line":return e.bonusAllowed>0?o("meet_entries_warn_slower_bonus",{label:e.label,gap:e.gapSeconds,count:e.bonusAllowed}):o("meet_entries_warn_slower",{label:e.label,gap:e.gapSeconds});case"manual-time":return o("meet_entries_warn_manual",{label:e.label,value:e.value});case"open-event":return o("meet_entries_warn_open",{label:e.label});case"same-event-twice":return o("meet_entries_warn_twice",{labels:e.labels.join(", ")});default:return e.code}}function Ea(e){if(e.target.id==="me-close"||e.target.id==="meet-entries-overlay"){Js();return}const t=e.target.closest("[data-action]");if(!t)return;const s=t.dataset.action;if(s==="back"){p.view="list",p.ctx=null,$e();return}if(s==="edit"){const n=p.swimmers.find(a=>a.usaId===t.dataset.usa);n&&sn(n);return}if(s==="submit"){Ye({status:"submitted"});return}if(s==="draft"){Ye({status:"draft"});return}if(s==="save"){Ye({status:p.status==="none"?"confirmed":p.status});return}if(s==="confirm"){Ye({status:"confirmed"});return}if(s==="decline"){Ye({status:"declined"});return}if(s==="reopen"){Ye({status:"submitted"});return}}function ka(e){if(e.target.id==="me-filter"){p.filter=e.target.value;const s=document.getElementById("me-list-body");s&&(s.innerHTML=Jt());return}const t=e.target.closest('input[type="checkbox"][data-key]');t&&Ca(t.dataset.key,t.checked)}function Ia(e){if(e.target.matches("input[data-manual]")){p.manualTimes[e.target.dataset.manual]=e.target.value,ct();return}if(e.target.id==="me-note"){p.note=e.target.value;return}if(e.target.id==="me-search"){p.search=e.target.value;const t=document.getElementById("me-list-body");t&&(t.innerHTML=Jt())}}function Ca(e,t){t?p.selected.add(e):p.selected.delete(e);const s=[...document.querySelectorAll("[data-event-row]")].find(a=>a.dataset.eventRow===e);if(s){s.classList.toggle("is-selected",t);const a=s.querySelector(".me-manual-wrap");a&&(a.hidden=!t)}const n=document.getElementById("me-footer");n&&(n.innerHTML=tn()),ct()}async function sn(e){p.view="editor",p.active=e,p.ctx=null,p.status=At(e),p.selected=new Set,p.manualTimes={},p.error="";const t=st(e);p.note=(t==null?void 0:t.note)||"";for(const r of(t==null?void 0:t.events)||[]){const i=`${r.eventNo}|${r.ageGroup}`;p.selected.add(i),r.source==="manual"&&r.seedTime&&(p.manualTimes[i]=r.seedTime)}$e();const{list:s,fetchedAt:n,error:a}=await Ba(e.usaId);if(p.ctx=la({meet:p.meet,swimmer:{...e,usaSwimmingId:e.usaId},bestTimes:s}),p.ctx.fetchedAt=n||null,p.ctx.readError=a||null,t){const r=new Map(p.ctx.individual.map(i=>[i.key,i]));for(const i of t.events||[]){const d=`${i.eventNo}|${i.ageGroup}`,l=r.get(d);l&&l.state==="no-time"&&i.seedTime&&!p.manualTimes[d]&&(p.manualTimes[d]=i.seedTime)}}$e()}function Da(){const e=new Map([...p.ctx.individual,...p.ctx.relays].map(s=>[s.key,s])),t=[];for(const s of p.selected){const n=e.get(s);if(!n||n.relay)continue;const a=String(p.manualTimes[s]||"").trim(),r=n.state==="no-time"&&a;t.push({eventNo:n.eventNo,ageGroup:n.ageGroup,distance:n.distance,stroke:n.stroke,sessionId:n.sessionId,day:n.day,course:r?"SCY":n.bestCourse||"SCY",seedTime:r?a:n.bestSeconds!=null?Ce(n.bestSeconds):"",seedSeconds:r?null:n.bestSeconds??null,source:r?"manual":"db",proofDate:r?"":n.bestDate||"",standard:n.standardSeconds??null,qualifies:n.state==="qualified"})}return t.sort((s,n)=>String(s.day).localeCompare(String(n.day))||s.eventNo-n.eventNo),t}async function Ye({status:e}){if(p.saving||!p.ctx)return;const t=p.active,s=it(t);if(!s){p.error=o("meet_entries_blocked_no_id"),$e();return}const n=ct();if(e!=="draft"&&n&&!n.ok){p.error=o("meet_entries_fix_errors");const d=document.querySelector(".me-save-note");d&&(d.textContent=p.error);return}p.saving=!0,p.error="";const a=document.querySelector(".me-save-note");a&&(a.textContent=o("meet_entries_saving"));const r=st(t),i={meetId:p.meet.id,familyId:t.familyId,usaSwimmingId:t.usaId,swimmerName:t.name,ageAtMeet:p.ctx.age,ageGroup:p.ctx.ageGroup,gender:p.ctx.gender,status:e,events:Da(),note:p.note||"",updatedAt:lt(),updatedBy:p.actorId||""};e==="submitted"&&!(r!=null&&r.submittedAt)&&(i.submittedAt=lt()),e==="confirmed"&&(i.confirmedAt=lt());try{await xe(L(k,"meets",p.meet.id,"entries",s),i,{merge:!0}),p.status=e,p.entries.set(s,{...r||{},...i,id:s,status:e}),p.saving=!1,$e()}catch(d){console.error("[meetEntries] save failed:",d),p.saving=!1,p.error=d.message||String(d),ct();const l=document.querySelector(".me-save-note");l&&(l.textContent=p.error)}}const gs={"10 & under":{SCY:{"50 FR":{girls:{B:39.79,BB:35.99,A:32.09,AA:30.89,AAA:29.59,AAAA:28.29},boys:{AAAA:27.49,AAA:28.69,AA:29.89,A:31.09,BB:34.59,B:38.19}},"100 FR":{girls:{B:90.79,BB:81.09,A:71.49,AA:68.29,AAA:64.99,AAAA:61.79},boys:{AAAA:60.69,AAA:63.79,AA:66.79,A:69.79,BB:78.89,B:87.99}},"200 FR":{girls:{B:202.79,BB:180.59,A:158.39,AA:150.99,AAA:143.59,AAAA:136.19},boys:{AAAA:132.69,AAA:138.99,AA:145.29,A:151.59,BB:170.59,B:189.49}},"500 FR":{girls:{B:516.69,BB:465.09,A:413.39,AA:396.19,AAA:378.99,AAAA:361.69},boys:{AAAA:352.99,AAA:369.79,AA:386.59,A:403.39,BB:453.79,B:504.29}},"50 BK":{girls:{B:48.59,BB:43.29,A:37.99,AA:36.19,AAA:34.39,AAAA:32.59},boys:{AAAA:32.19,AAA:33.99,AA:35.79,A:37.59,BB:42.89,B:48.29}},"100 BK":{girls:{B:105.79,BB:93.99,A:82.29,AA:78.39,AAA:74.49,AAAA:70.59},boys:{AAAA:68.99,AAA:72.49,AA:76.09,A:79.59,BB:90.09,B:100.69}},"50 BR":{girls:{B:54.59,BB:48.69,A:42.79,AA:40.89,AAA:38.89,AAAA:36.89},boys:{AAAA:36.39,AAA:38.29,AA:40.19,A:42.09,BB:47.69,B:53.39}},"100 BR":{girls:{B:120.29,BB:106.89,A:93.59,AA:89.09,AAA:84.69,AAAA:80.19},boys:{AAAA:78.79,AAA:82.69,AA:86.59,A:90.59,BB:102.29,B:114.09}},"50 FL":{girls:{B:48.39,BB:42.69,A:36.99,AA:35.09,AAA:33.19,AAAA:31.29},boys:{AAAA:30.79,AAA:32.59,AA:34.29,A:35.99,BB:41.29,B:46.49}},"100 FL":{girls:{B:116.69,BB:101.39,A:86.09,AA:80.99,AAA:75.99,AAAA:70.89},boys:{AAAA:69.79,AAA:74.59,AA:79.49,A:84.39,BB:98.99,B:113.49}},"100 IM":{girls:{B:104.29,BB:93.19,A:82.09,AA:78.39,AAA:74.69,AAAA:70.99},boys:{AAAA:69.79,AAA:73.09,AA:76.39,A:79.69,BB:89.69,B:99.69}},"200 IM":{girls:{B:222.09,BB:198.79,A:175.49,AA:167.69,AAA:159.99,AAAA:152.19},boys:{AAAA:150.89,AAA:158.39,AA:165.89,A:173.49,BB:195.99,B:218.59}},"200 FR-R":{girls:{B:173.19,BB:155.89,A:138.59,AA:132.79,AAA:126.99,AAAA:121.19},boys:{AAAA:120.19,AAA:125.89,AA:131.59,A:137.29,BB:154.49,B:171.69}},"200 MED-R":{girls:{B:194.99,BB:175.49,A:155.99,AA:149.49,AAA:142.99,AAAA:136.49},boys:{AAAA:135.39,AAA:141.79,AA:148.29,A:154.69,BB:173.99,B:193.39}}},SCM:{"50 FR":{girls:{B:43.99,BB:39.79,A:35.49,AA:34.09,AAA:32.69,AAAA:31.29},boys:{AAAA:30.39,AAA:31.69,AA:32.99,A:34.29,BB:38.19,B:42.19}},"100 FR":{girls:{B:100.29,BB:89.69,A:78.99,AA:75.39,AAA:71.89,AAAA:68.29},boys:{AAAA:67.09,AAA:70.39,AA:73.79,A:77.09,BB:87.19,B:97.19}},"200 FR":{girls:{B:223.99,BB:199.49,A:174.99,AA:166.79,AAA:158.59,AAAA:150.39},boys:{AAAA:146.59,AAA:153.59,AA:160.59,A:167.49,BB:188.49,B:209.39}},"400 FR":{girls:{B:452.19,BB:406.89,A:361.69,AA:346.69,AAA:331.59,AAAA:316.49},boys:{AAAA:308.89,AAA:323.59,AA:338.29,A:352.99,BB:397.09,B:441.19}},"50 BK":{girls:{B:53.69,BB:47.79,A:41.89,AA:39.99,AAA:37.99,AAAA:36.09},boys:{AAAA:35.59,AAA:37.59,AA:39.59,A:41.49,BB:47.39,B:53.39}},"100 BK":{girls:{B:116.89,BB:103.89,A:90.89,AA:86.59,AAA:82.29,AAAA:77.99},boys:{AAAA:76.29,AAA:80.09,AA:83.99,A:87.89,BB:99.59,B:111.19}},"50 BR":{girls:{B:60.29,BB:53.79,A:47.29,AA:45.09,AAA:42.99,AAAA:40.79},boys:{AAAA:40.19,AAA:42.29,AA:44.39,A:46.49,BB:52.79,B:58.99}},"100 BR":{girls:{B:132.89,BB:118.19,A:103.39,AA:98.49,AAA:93.59,AAAA:88.69},boys:{AAAA:86.99,AAA:91.39,AA:95.69,A:100.09,BB:113.09,B:126.09}},"50 FL":{girls:{B:53.49,BB:47.19,A:40.89,AA:38.79,AAA:36.69,AAAA:34.59},boys:{AAAA:33.99,AAA:35.99,AA:37.89,A:39.79,BB:45.59,B:51.39}},"100 FL":{girls:{B:128.89,BB:112.09,A:95.19,AA:89.49,AAA:83.89,AAAA:78.29},boys:{AAAA:77.09,AAA:82.49,AA:87.79,A:93.19,BB:109.29,B:125.49}},"100 IM":{girls:{B:115.19,BB:102.99,A:90.69,AA:86.59,AAA:82.49,AAAA:78.39},boys:{AAAA:77.09,AAA:80.79,AA:84.39,A:88.09,BB:99.09,B:110.09}},"200 IM":{girls:{B:245.39,BB:219.59,A:193.89,AA:185.29,AAA:176.79,AAAA:168.19},boys:{AAAA:166.69,AAA:175.09,AA:183.39,A:191.69,BB:216.59,B:241.59}},"200 FR-R":{girls:{B:191.39,BB:172.19,A:153.09,AA:146.69,AAA:140.29,AAAA:133.99},boys:{AAAA:132.79,AAA:139.09,AA:145.39,A:151.69,BB:170.69,B:189.69}},"200 MED-R":{girls:{B:215.49,BB:193.89,A:172.39,AA:165.19,AAA:157.99,AAAA:150.79},boys:{AAAA:149.59,AAA:156.69,AA:163.79,A:170.89,BB:192.29,B:213.69}}},LCM:{"50 FR":{girls:{B:45.29,BB:40.89,A:36.59,AA:35.09,AAA:33.69,AAAA:32.19},boys:{AAAA:31.59,AAA:32.99,AA:34.39,A:35.69,BB:39.79,B:43.89}},"100 FR":{girls:{B:104.09,BB:92.99,A:81.89,AA:78.19,AAA:74.49,AAAA:70.79},boys:{AAAA:69.79,AAA:73.19,AA:76.69,A:80.19,BB:90.59,B:100.99}},"200 FR":{girls:{B:230.99,BB:205.69,A:180.39,AA:171.99,AAA:163.49,AAAA:155.09},boys:{AAAA:151.69,AAA:158.89,AA:166.09,A:173.39,BB:194.99,B:216.69}},"400 FR":{girls:{B:468.59,BB:421.69,A:374.89,AA:359.29,AAA:343.69,AAAA:327.99},boys:{AAAA:320.79,AAA:336.09,AA:351.39,A:366.59,BB:412.49,B:458.29}},"50 BK":{girls:{B:55.79,BB:49.69,A:43.59,AA:41.59,AAA:39.49,AAAA:37.49},boys:{AAAA:36.99,AAA:38.99,AA:41.09,A:43.09,BB:49.29,B:55.39}},"100 BK":{girls:{B:121.59,BB:108.09,A:94.59,AA:90.09,AAA:85.59,AAAA:81.09},boys:{AAAA:79.99,AAA:84.09,AA:88.19,A:92.29,BB:104.49,B:116.69}},"50 BR":{girls:{B:62.19,BB:55.49,A:48.79,AA:46.49,AAA:44.29,AAAA:42.09},boys:{AAAA:41.49,AAA:43.59,AA:45.79,A:47.89,BB:54.39,B:60.89}},"100 BR":{girls:{B:139.39,BB:123.89,A:108.39,AA:103.29,AAA:98.09,AAAA:92.99},boys:{AAAA:91.69,AAA:96.29,AA:100.89,A:105.49,BB:119.19,B:132.89}},"50 FL":{girls:{B:54.49,BB:48.09,A:41.59,AA:39.49,AAA:37.29,AAAA:35.19},boys:{AAAA:34.69,AAA:36.59,AA:38.59,A:40.59,BB:46.39,B:52.29}},"100 FL":{girls:{B:132.79,BB:115.39,A:97.99,AA:92.19,AAA:86.39,AAAA:80.59},boys:{AAAA:79.59,AAA:85.09,AA:90.69,A:96.19,BB:112.89,B:129.49}},"200 IM":{girls:{B:255.69,BB:228.89,A:202.09,AA:193.09,AAA:184.19,AAAA:175.29},boys:{AAAA:172.19,AAA:180.79,AA:189.39,A:197.89,BB:223.69,B:249.49}},"200 FR-R":{girls:{B:197.49,BB:177.79,A:157.99,AA:151.39,AAA:144.79,AAAA:138.29},boys:{AAAA:137.19,AAA:143.69,AA:150.19,A:156.79,BB:176.39,B:195.89}},"200 MED-R":{girls:{B:223.59,BB:201.19,A:178.89,AA:171.39,AAA:163.99,AAAA:156.49},boys:{AAAA:157.59,AAA:165.09,AA:172.59,A:180.09,BB:202.59,B:225.09}}}},"11-12":{SCY:{"50 FR":{girls:{B:33.99,BB:31.69,A:29.29,AA:28.09,AAA:26.99,AAAA:25.79},boys:{AAAA:24.59,AAA:25.79,AA:26.99,A:28.09,BB:30.49,B:32.79}},"100 FR":{girls:{B:74.69,BB:69.39,A:63.99,AA:61.39,AAA:58.69,AAAA:55.99},boys:{AAAA:53.59,AAA:56.19,AA:58.69,A:61.29,BB:66.39,B:71.49}},"200 FR":{girls:{B:162.59,BB:150.89,A:139.29,AA:133.49,AAA:127.69,AAAA:121.89},boys:{AAAA:116.99,AAA:122.59,AA:128.19,A:133.69,BB:144.89,B:155.99}},"500 FR":{girls:{B:436.89,BB:405.69,A:374.49,AA:358.89,AAA:343.29,AAAA:327.69},boys:{AAAA:314.99,AAA:329.99,AA:344.99,A:359.99,BB:389.99,B:419.89}},"1000 FR":{girls:{B:902.69,BB:838.19,A:773.79,AA:741.49,AAA:709.29,AAAA:676.99},boys:{AAAA:662.59,AAA:694.19,AA:725.79,A:757.29,BB:820.39,B:883.49}},"1650 FR":{girls:{B:1507.39,BB:1399.69,A:1292.09,AA:1238.19,AAA:1184.39,AAAA:1130.59},boys:{AAAA:1100.79,AAA:1153.19,AA:1205.59,A:1258.09,BB:1362.89,B:1467.69}},"50 BK":{girls:{B:38.79,BB:35.99,A:33.19,AA:31.79,AAA:30.49,AAAA:29.09},boys:{AAAA:28.19,AAA:29.69,AA:31.19,A:32.69,BB:35.59,B:38.49}},"100 BK":{girls:{B:86.59,BB:79.79,A:72.99,AA:69.59,AAA:66.19,AAAA:62.69},boys:{AAAA:59.49,AAA:62.79,AA:65.99,A:69.29,BB:75.69,B:82.19}},"200 BK":{girls:{B:179.49,BB:166.69,A:153.89,AA:147.49,AAA:140.99,AAAA:134.59},boys:{AAAA:129.69,AAA:135.89,AA:141.99,A:148.19,BB:160.49,B:172.89}},"50 BR":{girls:{B:43.99,BB:40.89,A:37.69,AA:36.19,AAA:34.59,AAAA:32.99},boys:{AAAA:31.49,AAA:33.29,AA:34.99,A:36.69,BB:40.09,B:43.49}},"100 BR":{girls:{B:96.49,BB:89.29,A:82.19,AA:78.59,AAA:75.09,AAAA:71.49},boys:{AAAA:67.79,AAA:71.39,AA:74.89,A:78.39,BB:85.49,B:92.59}},"200 BR":{girls:{B:205.69,BB:190.99,A:176.29,AA:168.99,AAA:161.69,AAAA:154.29},boys:{AAAA:147.29,AAA:154.39,AA:161.39,A:168.39,BB:182.39,B:196.39}},"50 FL":{girls:{B:36.89,BB:34.29,A:31.59,AA:30.29,AAA:28.99,AAAA:27.69},boys:{AAAA:26.69,AAA:28.19,AA:29.69,A:31.19,BB:34.19,B:37.09}},"100 FL":{girls:{B:85.79,BB:78.89,A:72.09,AA:68.59,AAA:65.19,AAAA:61.79},boys:{AAAA:59.09,AAA:62.49,AA:65.89,A:69.29,BB:76.09,B:82.89}},"200 FL":{girls:{B:183.39,BB:170.29,A:157.19,AA:150.59,AAA:144.09,AAAA:137.59},boys:{AAAA:132.39,AAA:138.69,AA:144.99,A:151.39,BB:163.99,B:176.59}},"100 IM":{girls:{B:85.19,BB:79.09,A:73.09,AA:69.99,AAA:66.99,AAAA:63.89},boys:{AAAA:61.09,AAA:63.99,AA:66.99,A:69.99,BB:75.89,B:81.89}},"200 IM":{girls:{B:183.89,BB:170.69,A:157.59,AA:150.99,AAA:144.49,AAAA:137.89},boys:{AAAA:132.09,AAA:138.79,AA:145.59,A:152.29,BB:165.79,B:179.29}},"400 IM":{girls:{B:391.69,BB:363.69,A:335.79,AA:321.79,AAA:307.79,AAAA:293.79},boys:{AAAA:282.79,AAA:296.29,AA:309.79,A:323.19,BB:350.09,B:377.09}},"200 FR-R":{girls:{B:144.79,BB:134.39,A:124.09,AA:118.89,AAA:113.79,AAAA:108.59},boys:{AAAA:104.39,AAA:109.29,AA:114.29,A:119.29,BB:129.19,B:139.09}},"400 FR-R":{girls:{B:318.09,BB:295.39,A:272.69,AA:261.29,AAA:249.99,AAAA:238.59},boys:{AAAA:230.09,AAA:240.99,AA:251.99,A:262.89,BB:284.79,B:306.79}},"200 MED-R":{girls:{B:161.19,BB:149.69,A:138.19,AA:132.39,AAA:126.69,AAAA:120.89},boys:{AAAA:115.59,AAA:121.09,AA:126.59,A:132.09,BB:143.09,B:154.09}},"400 MED-R":{girls:{B:353.49,BB:328.29,A:302.99,AA:290.39,AAA:277.79,AAAA:265.09},boys:{AAAA:254.79,AAA:266.99,AA:279.09,A:291.19,BB:315.49,B:339.79}}},SCM:{"50 FR":{girls:{B:37.59,BB:34.99,A:32.39,AA:31.09,AAA:29.79,AAAA:28.49},boys:{AAAA:27.19,AAA:28.49,AA:29.79,A:31.09,BB:33.69,B:36.29}},"100 FR":{girls:{B:82.49,BB:76.59,A:70.69,AA:67.79,AAA:64.89,AAAA:61.89},boys:{AAAA:59.19,AAA:62.09,AA:64.89,A:67.69,BB:73.29,B:78.99}},"200 FR":{girls:{B:179.59,BB:166.79,A:153.99,AA:147.59,AAA:141.09,AAAA:134.69},boys:{AAAA:129.29,AAA:135.49,AA:141.59,A:147.79,BB:160.09,B:172.39}},"400 FR":{girls:{B:382.29,BB:354.99,A:327.69,AA:314.09,AAA:300.39,AAAA:286.79},boys:{AAAA:275.59,AAA:288.69,AA:301.79,A:314.99,BB:341.19,B:367.49}},"800 FR":{girls:{B:789.89,BB:733.49,A:676.99,AA:648.79,AAA:620.59,AAAA:592.39},boys:{AAAA:579.79,AAA:607.39,AA:634.99,A:662.59,BB:717.89,B:773.09}},"1500 FR":{girls:{B:1498.39,BB:1391.29,A:1284.29,AA:1230.79,AAA:1177.29,AAAA:1123.79},boys:{AAAA:1094.19,AAA:1146.29,AA:1198.39,A:1250.49,BB:1354.69,B:1458.89}},"50 BK":{girls:{B:42.79,BB:39.79,A:36.69,AA:35.19,AAA:33.59,AAAA:32.09},boys:{AAAA:31.19,AAA:32.79,AA:34.49,A:36.09,BB:39.29,B:42.59}},"100 BK":{girls:{B:95.69,BB:88.19,A:80.59,AA:76.89,AAA:73.09,AAAA:69.29},boys:{AAAA:65.79,AAA:69.39,AA:72.89,A:76.49,BB:83.69,B:90.79}},"200 BK":{girls:{B:198.29,BB:184.19,A:169.99,AA:162.89,AAA:155.79,AAAA:148.79},boys:{AAAA:143.29,AAA:150.09,AA:156.89,A:163.69,BB:177.39,B:190.99}},"50 BR":{girls:{B:48.59,BB:45.19,A:41.69,AA:39.89,AAA:38.19,AAAA:36.49},boys:{AAAA:34.89,AAA:36.69,AA:38.59,A:40.49,BB:44.29,B:48.09}},"100 BR":{girls:{B:106.59,BB:98.69,A:90.79,AA:86.89,AAA:82.99,AAAA:78.99},boys:{AAAA:74.99,AAA:78.89,AA:82.79,A:86.69,BB:94.49,B:102.29}},"200 BR":{girls:{B:227.29,BB:211.09,A:194.89,AA:186.69,AAA:178.59,AAAA:170.49},boys:{AAAA:162.79,AAA:170.59,AA:178.29,A:186.09,BB:201.59,B:217.09}},"50 FL":{girls:{B:40.79,BB:37.79,A:34.89,AA:33.49,AAA:31.99,AAAA:30.59},boys:{AAAA:29.59,AAA:31.19,AA:32.79,A:34.49,BB:37.69,B:40.99}},"100 FL":{girls:{B:94.79,BB:87.19,A:79.59,AA:75.79,AAA:72.09,AAAA:68.29},boys:{AAAA:65.29,AAA:68.99,AA:72.79,A:76.49,BB:84.09,B:91.59}},"200 FL":{girls:{B:202.59,BB:188.19,A:173.69,AA:166.49,AAA:159.19,AAAA:151.99},boys:{AAAA:146.29,AAA:153.29,AA:160.29,A:167.19,BB:181.19,B:195.09}},"100 IM":{girls:{B:94.19,BB:87.49,A:80.69,AA:77.39,AAA:73.99,AAAA:70.59},boys:{AAAA:67.49,AAA:70.69,AA:73.99,A:77.29,BB:83.89,B:90.49}},"200 IM":{girls:{B:203.19,BB:188.69,A:174.19,AA:166.89,AAA:159.59,AAAA:152.39},boys:{AAAA:145.99,AAA:153.39,AA:160.89,A:168.29,BB:183.19,B:198.09}},"400 IM":{girls:{B:432.79,BB:401.89,A:370.99,AA:355.59,AAA:340.09,AAAA:324.59},boys:{AAAA:312.49,AAA:327.39,AA:342.29,A:357.19,BB:386.89,B:416.69}},"200 FR-R":{girls:{B:159.89,BB:148.49,A:137.09,AA:131.39,AAA:125.69,AAAA:119.99},boys:{AAAA:115.29,AAA:120.79,AA:126.29,A:131.79,BB:142.79,B:153.69}},"400 FR-R":{girls:{B:351.59,BB:326.39,A:301.29,AA:288.79,AAA:276.19,AAAA:263.69},boys:{AAAA:254.19,AAA:266.29,AA:278.39,A:290.49,BB:314.69,B:338.99}},"200 MED-R":{girls:{B:178.09,BB:165.39,A:152.69,AA:146.29,AAA:139.89,AAAA:133.59},boys:{AAAA:127.79,AAA:133.79,AA:139.89,A:145.99,BB:158.19,B:170.29}},"400 MED-R":{girls:{B:390.59,BB:362.69,A:334.79,AA:320.89,AAA:306.89,AAAA:292.99},boys:{AAAA:281.59,AAA:294.99,AA:308.39,A:321.79,BB:348.59,B:375.39}}},LCM:{"50 FR":{girls:{B:38.49,BB:35.89,A:33.19,AA:31.89,AAA:30.49,AAAA:29.19},boys:{AAAA:28.09,AAA:29.39,AA:30.69,A:32.09,BB:34.79,B:37.39}},"100 FR":{girls:{B:85.59,BB:79.49,A:73.39,AA:70.29,AAA:67.19,AAAA:64.19},boys:{AAAA:61.59,AAA:64.49,AA:67.49,A:70.39,BB:76.19,B:82.09}},"200 FR":{girls:{B:186.39,BB:173.09,A:159.79,AA:153.09,AAA:146.49,AAAA:139.79},boys:{AAAA:134.39,AAA:140.79,AA:147.19,A:153.59,BB:166.39,B:179.19}},"400 FR":{girls:{B:392.89,BB:364.79,A:336.79,AA:322.79,AAA:308.69,AAAA:294.69},boys:{AAAA:285.89,AAA:299.49,AA:313.09,A:326.69,BB:353.89,B:381.09}},"800 FR":{girls:{B:821.59,BB:762.89,A:704.19,AA:674.89,AAA:645.49,AAAA:616.19},boys:{AAAA:600.09,AAA:628.69,AA:657.29,A:685.89,BB:742.99,B:800.19}},"1500 FR":{girls:{B:1566.89,BB:1454.99,A:1342.99,AA:1287.09,AAA:1231.09,AAAA:1175.19},boys:{AAAA:1163.89,AAA:1219.29,AA:1274.69,A:1330.19,BB:1440.99,B:1551.79}},"50 BK":{girls:{B:44.79,BB:41.59,A:38.39,AA:36.79,AAA:35.19,AAAA:33.59},boys:{AAAA:32.59,AAA:34.29,AA:35.99,A:37.69,BB:41.09,B:44.49}},"100 BK":{girls:{B:100.59,BB:92.69,A:84.79,AA:80.79,AAA:76.89,AAAA:72.89},boys:{AAAA:70.39,AAA:74.29,AA:78.09,A:81.89,BB:89.59,B:97.19}},"200 BK":{girls:{B:208.09,BB:193.29,A:178.39,AA:170.99,AAA:163.49,AAAA:156.09},boys:{AAAA:152.19,AAA:159.49,AA:166.69,A:173.99,BB:188.49,B:202.99}},"50 BR":{girls:{B:49.79,BB:46.19,A:42.69,AA:40.89,AAA:39.09,AAAA:37.39},boys:{AAAA:36.09,AAA:38.09,AA:39.99,A:41.99,BB:45.89,B:49.79}},"100 BR":{girls:{B:110.39,BB:102.19,A:93.99,AA:89.99,AAA:85.89,AAAA:81.79},boys:{AAAA:78.99,AAA:83.09,AA:87.19,A:91.29,BB:99.59,B:107.79}},"200 BR":{girls:{B:236.79,BB:219.89,A:202.99,AA:194.49,AAA:186.09,AAAA:177.59},boys:{AAAA:170.99,AAA:179.09,AA:187.19,A:195.39,BB:211.59,B:227.89}},"50 FL":{girls:{B:41.79,BB:38.79,A:35.79,AA:34.29,AAA:32.89,AAAA:31.39},boys:{AAAA:30.29,AAA:31.99,AA:33.59,A:35.29,BB:38.69,B:41.99}},"100 FL":{girls:{B:98.29,BB:90.49,A:82.59,AA:78.69,AAA:74.79,AAAA:70.79},boys:{AAAA:67.79,AAA:71.69,AA:75.59,A:79.49,BB:87.29,B:95.09}},"200 FL":{girls:{B:211.09,BB:195.99,A:180.89,AA:173.39,AAA:165.89,AAAA:158.29},boys:{AAAA:153.59,AAA:160.89,AA:168.29,A:175.59,BB:190.19,B:204.79}},"200 IM":{girls:{B:210.59,BB:195.59,A:180.59,AA:172.99,AAA:165.49,AAAA:157.99},boys:{AAAA:150.59,AAA:158.29,AA:165.99,A:173.69,BB:188.99,B:204.39}},"400 IM":{girls:{B:448.89,BB:416.79,A:384.79,AA:368.69,AAA:352.69,AAAA:336.69},boys:{AAAA:328.39,AAA:344.09,AA:359.69,A:375.39,BB:406.59,B:437.89}},"200 FR-R":{girls:{B:164.29,BB:152.59,A:140.89,AA:134.99,AAA:129.09,AAAA:123.29},boys:{AAAA:120.19,AAA:125.89,AA:131.59,A:137.39,BB:148.79,B:160.19}},"400 FR-R":{girls:{B:363.69,BB:337.69,A:311.79,AA:298.79,AAA:285.79,AAAA:272.79},boys:{AAAA:266.79,AAA:279.49,AA:292.19,A:304.89,BB:330.29,B:355.69}},"200 MED-R":{girls:{B:184.19,BB:170.99,A:157.89,AA:151.29,AAA:144.69,AAAA:138.19},boys:{AAAA:134.79,AAA:141.29,AA:147.69,A:154.09,BB:166.89,B:179.79}},"400 MED-R":{girls:{B:408.79,BB:379.59,A:350.39,AA:335.79,AAA:321.19,AAAA:306.59},boys:{AAAA:299.69,AAA:313.99,AA:328.19,A:342.49,BB:370.99,B:399.59}}}},"13-14":{SCY:{"50 FR":{girls:{B:32.49,BB:30.19,A:27.89,AA:26.69,AAA:25.59,AAAA:24.39},boys:{AAAA:22.39,AAA:23.49,AA:24.59,A:25.59,BB:27.69,B:29.89}},"100 FR":{girls:{B:70.99,BB:65.89,A:60.89,AA:58.29,AAA:55.79,AAAA:53.29},boys:{AAAA:48.69,AAA:51.09,AA:53.39,A:55.69,BB:60.29,B:64.99}},"200 FR":{girls:{B:153.59,BB:142.69,A:131.69,AA:126.19,AAA:120.69,AAAA:115.29},boys:{AAAA:106.89,AAA:111.99,AA:117.09,A:122.19,BB:132.29,B:142.49}},"500 FR":{girls:{B:412.19,BB:382.79,A:353.39,AA:338.59,AAA:323.89,AAAA:309.19},boys:{AAAA:289.29,AAA:303.09,AA:316.89,A:330.59,BB:358.19,B:385.69}},"1000 FR":{girls:{B:851.09,BB:790.29,A:729.49,AA:699.09,AAA:668.69,AAAA:638.29},boys:{AAAA:598.49,AAA:626.99,AA:655.49,A:683.99,BB:740.99,B:797.99}},"1650 FR":{girls:{B:1422.89,BB:1321.19,A:1219.59,AA:1168.79,AAA:1117.99,AAAA:1067.19},boys:{AAAA:1007.19,AAA:1055.19,AA:1103.09,A:1151.09,BB:1246.99,B:1342.89}},"50 BK":{girls:{B:36.19,BB:33.69,A:31.09,AA:29.79,AAA:28.49,AAAA:27.19},boys:{AAAA:25.29,AAA:26.49,AA:27.69,A:28.89,BB:31.29,B:33.69}},"100 BK":{girls:{B:76.89,BB:71.39,A:65.89,AA:63.19,AAA:60.49,AAAA:57.69},boys:{AAAA:53.49,AAA:55.99,AA:58.59,A:61.09,BB:66.19,B:71.29}},"200 BK":{girls:{B:166.39,BB:154.49,A:142.59,AA:136.69,AAA:130.69,AAAA:124.79},boys:{AAAA:115.99,AAA:121.59,AA:127.09,A:132.59,BB:143.69,B:154.69}},"50 BR":{girls:{B:42.09,BB:39.09,A:36.09,AA:34.59,AAA:33.09,AAAA:31.59},boys:{AAAA:28.89,AAA:30.29,AA:31.69,A:33.09,BB:35.79,B:38.59}},"100 BR":{girls:{B:88.69,BB:82.29,A:75.99,AA:72.89,AAA:69.69,AAAA:66.49},boys:{AAAA:60.39,AAA:63.29,AA:66.19,A:68.99,BB:74.79,B:80.49}},"200 BR":{girls:{B:190.99,BB:177.39,A:163.79,AA:156.89,AAA:150.09,AAAA:143.29},boys:{AAAA:131.19,AAA:137.39,AA:143.59,A:149.89,BB:162.39,B:174.89}},"50 FL":{girls:{B:35.79,BB:33.29,A:30.69,AA:29.39,AAA:28.19,AAAA:26.89},boys:{AAAA:24.89,AAA:26.09,AA:27.19,A:28.39,BB:30.79,B:33.19}},"100 FL":{girls:{B:76.79,BB:71.29,A:65.89,AA:63.09,AAA:60.39,AAAA:57.59},boys:{AAAA:52.89,AAA:55.39,AA:57.89,A:60.39,BB:65.49,B:70.49}},"200 FL":{girls:{B:171.19,BB:158.99,A:146.69,AA:140.59,AAA:134.49,AAAA:128.39},boys:{AAAA:117.59,AAA:123.19,AA:128.79,A:134.39,BB:145.59,B:156.79}},"200 IM":{girls:{B:171.79,BB:159.49,A:147.19,AA:141.09,AAA:134.99,AAAA:128.79},boys:{AAAA:118.49,AAA:124.09,AA:129.79,A:135.39,BB:146.69,B:157.99}},"400 IM":{girls:{B:365.79,BB:339.69,A:313.49,AA:300.49,AAA:287.39,AAAA:274.29},boys:{AAAA:253.29,AAA:265.39,AA:277.39,A:289.49,BB:313.59,B:337.69}},"200 FR-R":{girls:{B:136.29,BB:126.59,A:116.89,AA:111.99,AAA:107.09,AAAA:102.29},boys:{AAAA:93.69,AAA:98.19,AA:102.59,A:107.09,BB:115.99,B:124.89}},"400 FR-R":{girls:{B:297.29,BB:275.99,A:254.79,AA:244.19,AAA:233.59,AAAA:222.99},boys:{AAAA:204.89,AAA:214.59,AA:224.39,A:234.19,BB:253.69,B:273.19}},"800 FR-R":{girls:{B:649.19,BB:602.79,A:556.39,AA:533.29,AAA:510.09,AAAA:486.89},boys:{AAAA:453.29,AAA:474.89,AA:496.39,A:517.99,BB:561.19,B:604.39}},"200 MED-R":{girls:{B:149.89,BB:139.19,A:128.49,AA:123.09,AAA:117.79,AAAA:112.39},boys:{AAAA:103.69,AAA:108.59,AA:113.59,A:118.49,BB:128.39,B:138.19}},"400 MED-R":{girls:{B:326.89,BB:303.59,A:280.19,AA:268.59,AAA:256.89,AAAA:245.19},boys:{AAAA:224.49,AAA:235.19,AA:245.89,A:256.49,BB:277.89,B:299.29}}},SCM:{"50 FR":{girls:{B:35.99,BB:33.39,A:30.79,AA:29.49,AAA:28.29,AAAA:26.99},boys:{AAAA:24.79,AAA:25.89,AA:27.09,A:28.29,BB:30.69,B:32.99}},"100 FR":{girls:{B:78.49,BB:72.89,A:67.29,AA:64.49,AAA:61.69,AAAA:58.89},boys:{AAAA:53.89,AAA:56.39,AA:58.99,A:61.49,BB:66.69,B:71.79}},"200 FR":{girls:{B:169.79,BB:157.69,A:145.49,AA:139.49,AAA:133.39,AAAA:127.29},boys:{AAAA:118.09,AAA:123.69,AA:129.39,A:134.99,BB:146.19,B:157.49}},"400 FR":{girls:{B:360.69,BB:334.99,A:309.19,AA:296.29,AAA:283.39,AAAA:270.59},boys:{AAAA:253.19,AAA:265.19,AA:277.29,A:289.29,BB:313.39,B:337.49}},"800 FR":{girls:{B:744.69,BB:691.49,A:638.29,AA:611.69,AAA:585.09,AAAA:558.49},boys:{AAAA:523.69,AAA:548.59,AA:573.59,A:598.49,BB:648.39,B:698.19}},"1500 FR":{girls:{B:1414.29,BB:1313.29,A:1212.29,AA:1161.79,AAA:1111.29,AAAA:1060.79},boys:{AAAA:1001.19,AAA:1048.79,AA:1096.49,A:1144.19,BB:1239.49,B:1334.89}},"50 BK":{girls:{B:39.99,BB:37.19,A:34.29,AA:32.89,AAA:31.49,AAAA:29.99},boys:{AAAA:27.89,AAA:29.19,AA:30.59,A:31.89,BB:34.59,B:37.19}},"100 BK":{girls:{B:84.99,BB:78.89,A:72.89,AA:69.79,AAA:66.79,AAAA:63.79},boys:{AAAA:59.09,AAA:61.89,AA:64.69,A:67.49,BB:73.09,B:78.79}},"200 BK":{girls:{B:183.89,BB:170.69,A:157.59,AA:150.99,AAA:144.49,AAAA:137.89},boys:{AAAA:128.19,AAA:134.29,AA:140.39,A:146.49,BB:158.69,B:170.99}},"50 BR":{girls:{B:46.49,BB:43.19,A:39.89,AA:38.19,AAA:36.49,AAAA:34.89},boys:{AAAA:31.99,AAA:33.49,AA:34.99,A:36.49,BB:39.59,B:42.59}},"100 BR":{girls:{B:97.99,BB:90.99,A:83.99,AA:80.49,AAA:76.99,AAAA:73.49},boys:{AAAA:66.79,AAA:69.89,AA:73.09,A:76.29,BB:82.59,B:88.99}},"200 BR":{girls:{B:211.09,BB:195.99,A:180.89,AA:173.39,AAA:165.89,AAAA:158.29},boys:{AAAA:144.89,AAA:151.79,AA:158.69,A:165.59,BB:179.39,B:193.19}},"50 FL":{girls:{B:39.59,BB:36.79,A:33.89,AA:32.49,AAA:31.09,AAAA:29.69},boys:{AAAA:27.49,AAA:28.79,AA:30.09,A:31.39,BB:33.99,B:36.59}},"100 FL":{girls:{B:84.89,BB:78.79,A:72.79,AA:69.69,AAA:66.69,AAAA:63.69},boys:{AAAA:58.39,AAA:61.19,AA:63.99,A:66.79,BB:72.29,B:77.89}},"200 FL":{girls:{B:189.19,BB:175.69,A:162.19,AA:155.39,AAA:148.59,AAAA:141.89},boys:{AAAA:129.99,AAA:136.19,AA:142.39,A:148.49,BB:160.89,B:173.29}},"200 IM":{girls:{B:189.79,BB:176.19,A:162.69,AA:155.89,AAA:149.09,AAAA:142.39},boys:{AAAA:130.89,AAA:137.09,AA:143.39,A:149.59,BB:162.09,B:174.49}},"400 IM":{girls:{B:404.19,BB:375.29,A:346.39,AA:331.99,AAA:317.59,AAAA:303.09},boys:{AAAA:279.89,AAA:293.19,AA:306.49,A:319.89,BB:346.49,B:373.19}},"200 FR-R":{girls:{B:150.59,BB:139.89,A:129.09,AA:123.69,AAA:118.39,AAAA:112.99},boys:{AAAA:103.59,AAA:108.49,AA:113.39,A:118.39,BB:128.19,B:138.09}},"400 FR-R":{girls:{B:328.49,BB:304.99,A:281.59,AA:269.79,AAA:258.09,AAAA:246.39},boys:{AAAA:226.39,AAA:237.19,AA:247.89,A:258.69,BB:280.29,B:301.79}},"800 FR-R":{girls:{B:717.29,BB:666.09,A:614.89,AA:589.19,AAA:563.59,AAAA:537.99},boys:{AAAA:500.89,AAA:524.69,AA:548.59,A:572.39,BB:620.09,B:667.79}},"200 MED-R":{girls:{B:165.59,BB:153.79,A:141.89,AA:135.99,AAA:130.09,AAAA:124.19},boys:{AAAA:114.59,AAA:119.99,AA:125.49,A:130.89,BB:141.79,B:152.69}},"400 MED-R":{girls:{B:361.29,BB:335.49,A:309.69,AA:296.79,AAA:283.89,AAAA:270.99},boys:{AAAA:247.99,AAA:259.89,AA:271.69,A:283.49,BB:307.09,B:330.69}}},LCM:{"50 FR":{girls:{B:37.19,BB:34.59,A:31.89,AA:30.59,AAA:29.29,AAAA:27.89},boys:{AAAA:25.69,AAA:26.89,AA:28.19,A:29.39,BB:31.79,B:34.29}},"100 FR":{girls:{B:81.19,BB:75.39,A:69.59,AA:66.69,AAA:63.79,AAAA:60.89},boys:{AAAA:56.39,AAA:58.99,AA:61.69,A:64.39,BB:69.79,B:75.09}},"200 FR":{girls:{B:175.29,BB:162.79,A:150.29,AA:143.99,AAA:137.79,AAAA:131.49},boys:{AAAA:122.99,AAA:128.89,AA:134.69,A:140.59,BB:152.29,B:163.99}},"400 FR":{girls:{B:368.09,BB:341.79,A:315.49,AA:302.39,AAA:289.19,AAAA:276.09},boys:{AAAA:261.29,AAA:273.79,AA:286.19,A:298.69,BB:323.49,B:348.39}},"800 FR":{girls:{B:765.49,BB:710.79,A:656.09,AA:628.79,AAA:601.49,AAAA:574.09},boys:{AAAA:540.49,AAA:566.19,AA:591.99,A:617.69,BB:669.19,B:720.59}},"1500 FR":{girls:{B:1468.39,BB:1363.49,A:1258.59,AA:1206.19,AAA:1153.69,AAAA:1101.29},boys:{AAAA:1038.49,AAA:1087.89,AA:1137.39,A:1186.79,BB:1285.69,B:1384.59}},"50 BK":{girls:{B:42.59,BB:39.49,A:36.49,AA:34.99,AAA:33.49,AAAA:31.89},boys:{AAAA:29.69,AAA:31.09,AA:32.49,A:33.89,BB:36.69,B:39.49}},"100 BK":{girls:{B:89.69,BB:83.29,A:76.89,AA:73.69,AAA:70.49,AAAA:67.29},boys:{AAAA:62.79,AAA:65.79,AA:68.69,A:71.69,BB:77.69,B:83.69}},"200 BK":{girls:{B:193.29,BB:179.49,A:165.69,AA:158.79,AAA:151.89,AAAA:144.99},boys:{AAAA:136.29,AAA:142.79,AA:149.29,A:155.79,BB:168.79,B:181.79}},"50 BR":{girls:{B:47.79,BB:44.39,A:40.99,AA:39.29,AAA:37.59,AAAA:35.89},boys:{AAAA:32.99,AAA:34.59,AA:36.19,A:37.69,BB:40.89,B:43.99}},"100 BR":{girls:{B:102.39,BB:94.99,A:87.69,AA:84.09,AAA:80.39,AAAA:76.79},boys:{AAAA:70.29,AAA:73.69,AA:76.99,A:80.39,BB:87.09,B:93.79}},"200 BR":{girls:{B:220.29,BB:204.59,A:188.89,AA:180.99,AAA:173.09,AAAA:165.29},boys:{AAAA:152.09,AAA:159.39,AA:166.59,A:173.79,BB:188.29,B:202.79}},"50 FL":{girls:{B:39.99,BB:37.09,A:34.29,AA:32.79,AAA:31.39,AAAA:29.99},boys:{AAAA:27.99,AAA:29.29,AA:30.59,A:31.89,BB:34.59,B:37.29}},"100 FL":{girls:{B:87.19,BB:80.99,A:74.79,AA:71.69,AAA:68.59,AAAA:65.39},boys:{AAAA:60.29,AAA:63.09,AA:65.99,A:68.89,BB:74.59,B:80.29}},"200 FL":{girls:{B:195.69,BB:181.69,A:167.79,AA:160.79,AAA:153.79,AAAA:146.79},boys:{AAAA:134.79,AAA:141.19,AA:147.59,A:153.99,BB:166.79,B:179.69}},"200 IM":{girls:{B:197.19,BB:183.09,A:168.99,AA:161.99,AAA:154.89,AAAA:147.89},boys:{AAAA:137.19,AAA:143.69,AA:150.19,A:156.69,BB:169.79,B:182.89}},"400 IM":{girls:{B:417.99,BB:388.19,A:358.29,AA:343.39,AAA:328.39,AAAA:313.49},boys:{AAAA:292.99,AAA:306.99,AA:320.89,A:334.89,BB:362.79,B:390.69}},"200 FR-R":{girls:{B:155.59,BB:144.39,A:133.29,AA:127.79,AAA:122.19,AAAA:116.69},boys:{AAAA:107.69,AAA:112.79,AA:117.89,A:123.09,BB:133.29,B:143.59}},"400 FR-R":{girls:{B:340.89,BB:316.49,A:292.19,AA:279.99,AAA:267.79,AAAA:255.69},boys:{AAAA:236.49,AAA:247.69,AA:258.99,A:270.19,BB:292.79,B:315.29}},"800 FR-R":{girls:{B:748.29,BB:694.79,A:641.39,AA:614.59,AAA:587.89,AAAA:561.19},boys:{AAAA:522.99,AAA:547.89,AA:572.79,A:597.69,BB:647.49,B:697.29}},"200 MED-R":{girls:{B:173.29,BB:160.89,A:148.49,AA:142.39,AAA:136.19,AAAA:129.99},boys:{AAAA:119.19,AAA:124.89,AA:130.59,A:136.29,BB:147.59,B:158.99}},"400 MED-R":{girls:{B:378.39,BB:351.39,A:324.29,AA:310.79,AAA:297.29,AAAA:283.79},boys:{AAAA:261.79,AAA:274.29,AA:286.79,A:299.19,BB:324.09,B:349.09}}}},"15-16":{SCY:{"50 FR":{girls:{B:31.79,BB:29.49,A:27.29,AA:26.09,AAA:24.99,AAAA:23.89},boys:{AAAA:21.19,AAA:22.19,AA:23.19,A:24.19,BB:26.29,B:28.29}},"100 FR":{girls:{B:68.79,BB:63.79,A:58.89,AA:56.49,AAA:53.99,AAAA:51.59},boys:{AAAA:46.49,AAA:48.79,AA:50.99,A:53.19,BB:57.59,B:61.99}},"200 FR":{girls:{B:148.99,BB:138.39,A:127.69,AA:122.39,AAA:117.09,AAAA:111.79},boys:{AAAA:101.99,AAA:106.89,AA:111.79,A:116.59,BB:126.29,B:135.99}},"500 FR":{girls:{B:400.99,BB:372.39,A:343.69,AA:329.39,AAA:315.09,AAAA:300.79},boys:{AAAA:276.29,AAA:289.49,AA:302.69,A:315.79,BB:342.09,B:368.39}},"1000 FR":{girls:{B:832.89,BB:773.49,A:713.99,AA:684.19,AAA:654.49,AAAA:624.69},boys:{AAAA:578.89,AAA:606.39,AA:633.99,A:661.59,BB:716.69,B:771.79}},"1650 FR":{girls:{B:1395.89,BB:1296.19,A:1196.49,AA:1146.69,AAA:1096.79,AAAA:1046.89},boys:{AAAA:964.99,AAA:1010.89,AA:1056.89,A:1102.79,BB:1194.69,B:1286.59}},"50 BK":{girls:{B:35.29,BB:32.69,A:30.19,AA:28.99,AAA:27.69,AAAA:26.49},boys:{AAAA:23.79,AAA:24.99,AA:26.09,A:27.19,BB:29.49,B:31.79}},"100 BK":{girls:{B:74.69,BB:69.39,A:64.09,AA:61.39,AAA:58.69,AAAA:56.09},boys:{AAAA:50.69,AAA:53.09,AA:55.49,A:57.89,BB:62.69,B:67.49}},"200 BK":{girls:{B:162.19,BB:150.59,A:139.09,AA:133.29,AAA:127.49,AAAA:121.69},boys:{AAAA:110.69,AAA:115.99,AA:121.29,A:126.59,BB:137.09,B:147.59}},"50 BR":{girls:{B:41.09,BB:38.19,A:35.19,AA:33.79,AAA:32.29,AAAA:30.79},boys:{AAAA:27.49,AAA:28.79,AA:30.09,A:31.39,BB:34.09,B:36.69}},"100 BR":{girls:{B:85.89,BB:79.79,A:73.69,AA:70.59,AAA:67.49,AAAA:64.49},boys:{AAAA:57.69,AAA:60.39,AA:63.19,A:65.89,BB:71.39,B:76.89}},"200 BR":{girls:{B:185.99,BB:172.69,A:159.39,AA:152.79,AAA:146.19,AAAA:139.49},boys:{AAAA:125.29,AAA:131.29,AA:137.29,A:143.19,BB:155.19,B:167.09}},"50 FL":{girls:{B:34.69,BB:32.29,A:29.79,AA:28.59,AAA:27.29,AAAA:26.09},boys:{AAAA:23.69,AAA:24.79,AA:25.89,A:27.09,BB:29.29,B:31.59}},"100 FL":{girls:{B:74.39,BB:69.09,A:63.79,AA:61.09,AAA:58.39,AAAA:55.79},boys:{AAAA:50.39,AAA:52.79,AA:55.19,A:57.59,BB:62.39,B:67.19}},"200 FL":{girls:{B:165.79,BB:153.99,A:142.09,AA:136.19,AAA:130.29,AAAA:124.39},boys:{AAAA:112.69,AAA:118.09,AA:123.39,A:128.79,BB:139.49,B:150.19}},"200 IM":{girls:{B:166.19,BB:154.29,A:142.39,AA:136.49,AAA:130.59,AAAA:124.59},boys:{AAAA:113.19,AAA:118.59,AA:123.99,A:129.39,BB:140.19,B:150.89}},"400 IM":{girls:{B:354.99,BB:329.69,A:304.29,AA:291.59,AAA:278.99,AAAA:266.29},boys:{AAAA:241.59,AAA:253.19,AA:264.69,A:276.19,BB:299.19,B:322.19}},"200 FR-R":{girls:{B:135.19,BB:125.59,A:115.89,AA:111.09,AAA:106.29,AAAA:101.39},boys:{AAAA:91.39,AAA:95.69,AA:100.09,A:104.39,BB:113.09,B:121.79}},"400 FR-R":{girls:{B:294.89,BB:273.79,A:252.79,AA:242.29,AAA:231.69,AAAA:221.19},boys:{AAAA:201.59,AAA:211.19,AA:220.79,A:230.39,BB:249.59,B:268.79}},"800 FR-R":{girls:{B:647.79,BB:601.59,A:555.29,AA:532.19,AAA:508.99,AAAA:485.89},boys:{AAAA:447.79,AAA:469.09,AA:490.39,A:511.79,BB:554.39,B:597.09}},"200 MED-R":{girls:{B:148.09,BB:137.49,A:126.99,AA:121.69,AAA:116.39,AAAA:111.09},boys:{AAAA:100.69,AAA:105.49,AA:110.19,A:114.99,BB:124.59,B:134.19}},"400 MED-R":{girls:{B:323.29,BB:300.19,A:277.09,AA:265.59,AAA:253.99,AAAA:242.49},boys:{AAAA:220.69,AAA:231.19,AA:241.69,A:252.19,BB:273.19,B:294.19}}},SCM:{"50 FR":{girls:{B:35.09,BB:32.59,A:30.09,AA:28.89,AAA:27.59,AAAA:26.39},boys:{AAAA:23.39,AAA:24.59,AA:25.69,A:26.79,BB:28.99,B:31.19}},"100 FR":{girls:{B:75.99,BB:70.49,A:65.09,AA:62.39,AAA:59.69,AAAA:56.99},boys:{AAAA:51.39,AAA:53.89,AA:56.29,A:58.79,BB:63.69,B:68.49}},"200 FR":{girls:{B:164.69,BB:152.89,A:141.19,AA:135.29,AAA:129.39,AAAA:123.49},boys:{AAAA:112.79,AAA:118.09,AA:123.49,A:128.89,BB:139.59,B:150.29}},"400 FR":{girls:{B:350.89,BB:325.79,A:300.79,AA:288.19,AAA:275.69,AAAA:263.19},boys:{AAAA:241.79,AAA:253.29,AA:264.79,A:276.29,BB:299.39,B:322.39}},"800 FR":{girls:{B:728.79,BB:676.79,A:624.69,AA:598.69,AAA:572.69,AAAA:546.59},boys:{AAAA:506.49,AAA:530.59,AA:554.79,A:578.89,BB:627.09,B:675.29}},"1500 FR":{girls:{B:1387.49,BB:1288.39,A:1189.29,AA:1139.79,AAA:1090.19,AAAA:1040.69},boys:{AAAA:959.19,AAA:1004.89,AA:1050.49,A:1096.19,BB:1187.59,B:1278.89}},"50 BK":{girls:{B:38.89,BB:36.19,A:33.39,AA:31.99,AAA:30.59,AAAA:29.19},boys:{AAAA:26.29,AAA:27.59,AA:28.79,A:30.09,BB:32.59,B:35.09}},"100 BK":{girls:{B:82.59,BB:76.69,A:70.79,AA:67.79,AAA:64.89,AAAA:61.99},boys:{AAAA:55.99,AAA:58.59,AA:61.29,A:63.99,BB:69.29,B:74.59}},"200 BK":{girls:{B:179.29,BB:166.49,A:153.69,AA:147.29,AAA:140.89,AAAA:134.49},boys:{AAAA:122.39,AAA:128.19,AA:133.99,A:139.79,BB:151.49,B:163.09}},"50 BR":{girls:{B:45.39,BB:42.19,A:38.89,AA:37.29,AAA:35.69,AAAA:34.09},boys:{AAAA:30.39,AAA:31.79,AA:33.29,A:34.69,BB:37.59,B:40.49}},"100 BR":{girls:{B:94.99,BB:88.19,A:81.39,AA:77.99,AAA:74.59,AAAA:71.19},boys:{AAAA:63.69,AAA:66.79,AA:69.79,A:72.79,BB:78.89,B:84.99}},"200 BR":{girls:{B:205.49,BB:190.89,A:176.19,AA:168.79,AAA:161.49,AAAA:154.19},boys:{AAAA:138.49,AAA:145.09,AA:151.69,A:158.29,BB:171.39,B:184.59}},"50 FL":{girls:{B:38.39,BB:35.59,A:32.89,AA:31.49,AAA:30.19,AAAA:28.79},boys:{AAAA:26.19,AAA:27.39,AA:28.59,A:29.89,BB:32.39,B:34.89}},"100 FL":{girls:{B:82.19,BB:76.29,A:70.39,AA:67.49,AAA:64.59,AAAA:61.59},boys:{AAAA:55.69,AAA:58.39,AA:60.99,A:63.69,BB:68.99,B:74.29}},"200 FL":{girls:{B:183.19,BB:170.09,A:157.09,AA:150.49,AAA:143.99,AAAA:137.39},boys:{AAAA:124.49,AAA:130.39,AA:136.39,A:142.29,BB:154.19,B:165.99}},"200 IM":{girls:{B:183.59,BB:170.49,A:157.39,AA:150.79,AAA:144.29,AAAA:137.69},boys:{AAAA:125.09,AAA:131.09,AA:136.99,A:142.99,BB:154.89,B:166.79}},"400 IM":{girls:{B:392.29,BB:364.29,A:336.29,AA:322.29,AAA:308.19,AAAA:294.19},boys:{AAAA:266.99,AAA:279.69,AA:292.39,A:305.19,BB:330.59,B:355.99}},"200 FR-R":{girls:{B:149.39,BB:138.79,A:128.09,AA:122.79,AAA:117.39,AAAA:112.09},boys:{AAAA:100.99,AAA:105.79,AA:110.59,A:115.39,BB:124.99,B:134.59}},"400 FR-R":{girls:{B:325.89,BB:302.59,A:279.29,AA:267.69,AAA:255.99,AAAA:244.39},boys:{AAAA:222.79,AAA:233.39,AA:243.99,A:254.59,BB:275.79,B:297.09}},"800 FR-R":{girls:{B:715.79,BB:664.69,A:613.59,AA:587.99,AAA:562.49,AAAA:536.89},boys:{AAAA:494.79,AAA:518.39,AA:541.89,A:565.49,BB:612.59,B:659.69}},"200 MED-R":{girls:{B:163.59,BB:151.99,A:140.29,AA:134.39,AAA:128.59,AAAA:122.69},boys:{AAAA:111.19,AAA:116.49,AA:121.79,A:127.09,BB:137.69,B:148.29}},"400 MED-R":{girls:{B:357.19,BB:331.69,A:306.19,AA:293.39,AAA:280.69,AAAA:267.89},boys:{AAAA:243.79,AAA:255.39,AA:267.09,A:278.69,BB:301.89,B:325.09}}},LCM:{"50 FR":{girls:{B:36.09,BB:33.49,A:30.89,AA:29.59,AAA:28.29,AAAA:27.09},boys:{AAAA:24.69,AAA:25.89,AA:26.99,A:28.19,BB:30.59,B:32.89}},"100 FR":{girls:{B:78.39,BB:72.79,A:67.19,AA:64.39,AAA:61.59,AAAA:58.79},boys:{AAAA:53.79,AAA:56.39,AA:58.99,A:61.49,BB:66.69,B:71.79}},"200 FR":{girls:{B:169.19,BB:157.09,A:145.09,AA:138.99,AAA:132.99,AAAA:126.89},boys:{AAAA:117.49,AAA:123.09,AA:128.69,A:134.29,BB:145.39,B:156.59}},"400 FR":{girls:{B:355.19,BB:329.89,A:304.49,AA:291.79,AAA:279.09,AAAA:266.39},boys:{AAAA:250.59,AAA:262.49,AA:274.39,A:286.39,BB:310.19,B:334.09}},"800 FR":{girls:{B:737.79,BB:685.09,A:632.39,AA:605.99,AAA:579.69,AAAA:553.29},boys:{AAAA:520.49,AAA:545.29,AA:569.99,A:594.79,BB:644.39,B:693.99}},"1500 FR":{girls:{B:1413.49,BB:1312.49,A:1211.59,AA:1161.09,AAA:1110.59,AAAA:1060.09},boys:{AAAA:996.19,AAA:1043.59,AA:1091.09,A:1138.49,BB:1233.39,B:1328.29}},"50 BK":{girls:{B:41.19,BB:38.29,A:35.29,AA:33.89,AAA:32.39,AAAA:30.89},boys:{AAAA:28.39,AAA:29.69,AA:31.09,A:32.39,BB:35.09,B:37.79}},"100 BK":{girls:{B:86.89,BB:80.69,A:74.49,AA:71.39,AAA:68.29,AAAA:65.19},boys:{AAAA:59.49,AAA:62.39,AA:65.19,A:67.99,BB:73.69,B:79.39}},"200 BK":{girls:{B:186.79,BB:173.39,A:160.09,AA:153.39,AAA:146.79,AAAA:140.09},boys:{AAAA:129.19,AAA:135.39,AA:141.49,A:147.69,BB:159.99,B:172.29}},"50 BR":{girls:{B:46.19,BB:42.89,A:39.59,AA:37.89,AAA:36.29,AAAA:34.59},boys:{AAAA:31.29,AAA:32.79,AA:34.29,A:35.79,BB:38.79,B:41.79}},"100 BR":{girls:{B:98.59,BB:91.59,A:84.49,AA:80.99,AAA:77.49,AAAA:73.99},boys:{AAAA:67.09,AAA:70.29,AA:73.49,A:76.69,BB:83.09,B:89.49}},"200 BR":{girls:{B:212.49,BB:197.29,A:182.09,AA:174.49,AAA:166.99,AAAA:159.39},boys:{AAAA:145.89,AAA:152.79,AA:159.79,A:166.69,BB:180.59,B:194.49}},"50 FL":{girls:{B:38.99,BB:36.19,A:33.49,AA:32.09,AAA:30.69,AAAA:29.29},boys:{AAAA:26.79,AAA:27.99,AA:29.29,A:30.59,BB:33.09,B:35.69}},"100 FL":{girls:{B:84.29,BB:78.29,A:72.29,AA:69.29,AAA:66.29,AAAA:63.29},boys:{AAAA:57.59,AAA:60.29,AA:63.09,A:65.79,BB:71.29,B:76.79}},"200 FL":{girls:{B:187.79,BB:174.39,A:160.99,AA:154.29,AAA:147.59,AAAA:140.89},boys:{AAAA:128.79,AAA:134.89,AA:141.09,A:147.19,BB:159.49,B:171.69}},"200 IM":{girls:{B:191.19,BB:177.49,A:163.89,AA:156.99,AAA:150.19,AAAA:143.39},boys:{AAAA:132.09,AAA:138.39,AA:144.69,A:150.99,BB:163.59,B:176.19}},"400 IM":{girls:{B:404.69,BB:375.79,A:346.89,AA:332.49,AAA:317.99,AAAA:303.59},boys:{AAAA:281.09,AAA:294.39,AA:307.79,A:321.19,BB:347.99,B:374.69}},"200 FR-R":{girls:{B:156.49,BB:145.39,A:134.19,AA:128.59,AAA:122.99,AAAA:117.39},boys:{AAAA:104.89,AAA:109.89,AA:114.89,A:119.89,BB:129.89,B:139.89}},"400 FR-R":{girls:{B:341.09,BB:316.79,A:292.39,AA:280.19,AAA:267.99,AAAA:255.89},boys:{AAAA:229.89,AAA:240.89,AA:251.79,A:262.79,BB:284.69,B:306.49}},"800 FR-R":{girls:{B:745.39,BB:692.19,A:638.89,AA:612.29,AAA:585.69,AAAA:559.09},boys:{AAAA:512.59,AAA:536.99,AA:561.39,A:585.79,BB:634.69,B:683.49}},"200 MED-R":{girls:{B:173.99,BB:161.49,A:149.09,AA:142.89,AAA:136.69,AAAA:130.49},boys:{AAAA:116.29,AAA:121.89,AA:127.39,A:132.89,BB:143.99,B:155.09}},"400 MED-R":{girls:{B:374.39,BB:347.69,A:320.89,AA:307.59,AAA:294.19,AAAA:280.79},boys:{AAAA:255.89,AAA:268.09,AA:280.19,A:292.39,BB:316.79,B:341.19}}}},"17-18":{SCY:{"50 FR":{girls:{B:31.39,BB:29.09,A:26.89,AA:25.79,AAA:24.69,AAAA:23.49},boys:{AAAA:20.69,AAA:21.69,AA:22.59,A:23.59,BB:25.59,B:27.59}},"100 FR":{girls:{B:68.09,BB:63.19,A:58.39,AA:55.89,AAA:53.49,AAAA:51.09},boys:{AAAA:45.29,AAA:47.39,AA:49.59,A:51.69,BB:55.99,B:60.29}},"200 FR":{girls:{B:147.19,BB:136.69,A:126.19,AA:120.89,AAA:115.69,AAAA:110.39},boys:{AAAA:100.19,AAA:104.99,AA:109.69,A:114.49,BB:123.99,B:133.59}},"500 FR":{girls:{B:396.49,BB:368.19,A:339.89,AA:325.69,AAA:311.59,AAAA:297.39},boys:{AAAA:272.39,AAA:285.39,AA:298.39,A:311.39,BB:337.29,B:363.19}},"1000 FR":{girls:{B:826.09,BB:767.09,A:708.09,AA:678.59,AAA:649.09,AAAA:619.59},boys:{AAAA:570.19,AAA:597.29,AA:624.49,A:651.59,BB:705.89,B:760.19}},"1650 FR":{girls:{B:1367.19,BB:1269.59,A:1171.89,AA:1123.09,AAA:1074.29,AAAA:1025.39},boys:{AAAA:951.79,AAA:997.09,AA:1042.39,A:1087.69,BB:1178.39,B:1268.99}},"50 BK":{girls:{B:34.59,BB:32.19,A:29.69,AA:28.39,AAA:27.19,AAAA:25.99},boys:{AAAA:23.09,AAA:24.19,AA:25.29,A:26.39,BB:28.59,B:30.79}},"100 BK":{girls:{B:73.39,BB:68.09,A:62.89,AA:60.29,AAA:57.69,AAAA:54.99},boys:{AAAA:48.89,AAA:51.29,AA:53.59,A:55.89,BB:60.59,B:65.19}},"200 BK":{girls:{B:158.79,BB:147.39,A:136.09,AA:130.39,AAA:124.79,AAAA:119.09},boys:{AAAA:107.89,AAA:113.09,AA:118.19,A:123.29,BB:133.59,B:143.89}},"50 BR":{girls:{B:40.39,BB:37.49,A:34.59,AA:33.19,AAA:31.69,AAAA:30.29},boys:{AAAA:26.59,AAA:27.89,AA:29.09,A:30.39,BB:32.89,B:35.39}},"100 BR":{girls:{B:84.79,BB:78.79,A:72.69,AA:69.69,AAA:66.69,AAAA:63.59},boys:{AAAA:55.99,AAA:58.69,AA:61.39,A:63.99,BB:69.39,B:74.69}},"200 BR":{girls:{B:184.69,BB:171.49,A:158.29,AA:151.69,AAA:145.09,AAAA:138.49},boys:{AAAA:121.69,AAA:127.49,AA:133.29,A:139.09,BB:150.69,B:162.29}},"50 FL":{girls:{B:34.49,BB:31.99,A:29.59,AA:28.29,AAA:27.09,AAAA:25.89},boys:{AAAA:22.99,AAA:23.99,AA:25.09,A:26.19,BB:28.39,B:30.59}},"100 FL":{girls:{B:73.59,BB:68.29,A:63.09,AA:60.39,AAA:57.79,AAAA:55.19},boys:{AAAA:49.09,AAA:51.39,AA:53.69,A:56.09,BB:60.79,B:65.39}},"200 FL":{girls:{B:162.79,BB:151.19,A:139.49,AA:133.69,AAA:127.89,AAAA:122.09},boys:{AAAA:109.79,AAA:115.09,AA:120.29,A:125.49,BB:135.99,B:146.39}},"200 IM":{girls:{B:163.59,BB:151.89,A:140.19,AA:134.39,AAA:128.49,AAAA:122.69},boys:{AAAA:110.59,AAA:115.89,AA:121.09,A:126.39,BB:136.89,B:147.39}},"400 IM":{girls:{B:350.69,BB:325.59,A:300.59,AA:287.99,AAA:275.49,AAAA:262.99},boys:{AAAA:237.99,AAA:249.39,AA:260.69,A:271.99,BB:294.69,B:317.39}},"200 FR-R":{girls:{B:134.69,BB:125.09,A:115.39,AA:110.59,AAA:105.79,AAAA:100.99},boys:{AAAA:86.69,AAA:90.79,AA:94.89,A:99.09,BB:107.29,B:115.59}},"400 FR-R":{girls:{B:289.49,BB:268.79,A:248.19,AA:237.79,AAA:227.49,AAAA:217.19},boys:{AAAA:190.39,AAA:199.39,AA:208.49,A:217.49,BB:235.69,B:253.79}},"800 FR-R":{girls:{B:632.29,BB:587.19,A:541.99,AA:519.39,AAA:496.79,AAAA:474.29},boys:{AAAA:422.99,AAA:443.09,AA:463.19,A:483.39,BB:523.69,B:563.89}},"200 MED-R":{girls:{B:146.89,BB:136.39,A:125.89,AA:120.69,AAA:115.39,AAAA:110.19},boys:{AAAA:94.69,AAA:99.19,AA:103.69,A:108.19,BB:117.19,B:126.29}},"400 MED-R":{girls:{B:320.29,BB:297.39,A:274.49,AA:263.09,AAA:251.69,AAAA:240.19},boys:{AAAA:207.59,AAA:217.49,AA:227.39,A:237.29,BB:257.09,B:276.79}}},SCM:{"50 FR":{girls:{B:34.69,BB:32.19,A:29.69,AA:28.49,AAA:27.19,AAAA:25.99},boys:{AAAA:22.79,AAA:23.89,AA:24.99,A:26.09,BB:28.29,B:30.39}},"100 FR":{girls:{B:75.19,BB:69.89,A:64.49,AA:61.79,AAA:59.09,AAAA:56.39},boys:{AAAA:49.99,AAA:52.39,AA:54.79,A:57.19,BB:61.89,B:66.69}},"200 FR":{girls:{B:162.69,BB:151.09,A:139.39,AA:133.59,AAA:127.79,AAAA:121.99},boys:{AAAA:110.69,AAA:115.99,AA:121.29,A:126.49,BB:137.09,B:147.59}},"400 FR":{girls:{B:346.89,BB:322.19,A:297.39,AA:284.99,AAA:272.59,AAAA:260.19},boys:{AAAA:238.39,AAA:249.69,AA:261.09,A:272.39,BB:295.09,B:317.79}},"800 FR":{girls:{B:722.79,BB:671.19,A:619.59,AA:593.69,AAA:567.89,AAAA:542.09},boys:{AAAA:498.89,AAA:522.69,AA:546.39,A:570.19,BB:617.69,B:665.19}},"1500 FR":{girls:{B:1358.99,BB:1261.99,A:1164.89,AA:1116.39,AAA:1067.79,AAAA:1019.29},boys:{AAAA:946.09,AAA:991.09,AA:1036.19,A:1081.19,BB:1171.29,B:1261.39}},"50 BK":{girls:{B:38.19,BB:35.49,A:32.79,AA:31.39,AAA:30.09,AAAA:28.69},boys:{AAAA:25.49,AAA:26.69,AA:27.89,A:29.09,BB:31.59,B:33.99}},"100 BK":{girls:{B:81.09,BB:75.29,A:69.49,AA:66.59,AAA:63.69,AAAA:60.79},boys:{AAAA:54.09,AAA:56.59,AA:59.19,A:61.79,BB:66.89,B:72.09}},"200 BK":{girls:{B:175.39,BB:162.89,A:150.39,AA:144.09,AAA:137.79,AAAA:131.59},boys:{AAAA:119.29,AAA:124.89,AA:130.59,A:136.29,BB:147.59,B:158.99}},"50 BR":{girls:{B:44.59,BB:41.39,A:38.29,AA:36.69,AAA:35.09,AAAA:33.49},boys:{AAAA:29.39,AAA:30.79,AA:32.19,A:33.59,BB:36.39,B:39.09}},"100 BR":{girls:{B:93.69,BB:87.09,A:80.39,AA:76.99,AAA:73.69,AAAA:70.29},boys:{AAAA:61.89,AAA:64.89,AA:67.79,A:70.69,BB:76.59,B:82.49}},"200 BR":{girls:{B:204.09,BB:189.49,A:174.89,AA:167.59,AAA:160.39,AAAA:153.09},boys:{AAAA:134.49,AAA:140.89,AA:147.29,A:153.69,BB:166.49,B:179.29}},"50 FL":{girls:{B:38.09,BB:35.39,A:32.59,AA:31.29,AAA:29.89,AAAA:28.59},boys:{AAAA:25.39,AAA:26.59,AA:27.79,A:28.99,BB:31.39,B:33.79}},"100 FL":{girls:{B:81.29,BB:75.49,A:69.69,AA:66.79,AAA:63.89,AAAA:60.99},boys:{AAAA:54.19,AAA:56.79,AA:59.39,A:61.99,BB:67.09,B:72.29}},"200 FL":{girls:{B:179.89,BB:166.99,A:154.19,AA:147.69,AAA:141.29,AAAA:134.89},boys:{AAAA:121.39,AAA:127.09,AA:132.89,A:138.69,BB:150.19,B:161.79}},"200 IM":{girls:{B:180.69,BB:167.79,A:154.89,AA:148.49,AAA:141.99,AAAA:135.59},boys:{AAAA:122.19,AAA:127.99,AA:133.79,A:139.59,BB:151.29,B:162.89}},"400 IM":{girls:{B:387.49,BB:359.79,A:332.09,AA:318.29,AAA:304.49,AAAA:290.59},boys:{AAAA:262.99,AAA:275.49,AA:288.09,A:300.59,BB:325.59,B:350.69}},"200 FR-R":{girls:{B:148.79,BB:138.19,A:127.59,AA:122.29,AAA:116.89,AAAA:111.59},boys:{AAAA:95.79,AAA:100.29,AA:104.89,A:109.49,BB:118.59,B:127.69}},"400 FR-R":{girls:{B:319.89,BB:297.09,A:274.19,AA:262.79,AAA:251.39,AAAA:239.89},boys:{AAAA:210.29,AAA:220.39,AA:230.39,A:240.39,BB:260.39,B:280.39}},"800 FR-R":{girls:{B:698.69,BB:648.79,A:598.89,AA:573.99,AAA:548.99,AAAA:523.99},boys:{AAAA:467.39,AAA:489.59,AA:511.89,A:534.09,BB:578.59,B:623.09}},"200 MED-R":{girls:{B:162.29,BB:150.69,A:139.09,AA:133.29,AAA:127.49,AAAA:121.69},boys:{AAAA:104.59,AAA:109.59,AA:114.59,A:119.59,BB:129.49,B:139.49}},"400 MED-R":{girls:{B:353.89,BB:328.59,A:303.39,AA:290.69,AAA:278.09,AAAA:265.39},boys:{AAAA:229.39,AAA:240.39,AA:251.29,A:262.19,BB:284.09,B:305.89}}},LCM:{"50 FR":{girls:{B:35.89,BB:33.29,A:30.69,AA:29.49,AAA:28.19,AAAA:26.89},boys:{AAAA:23.99,AAA:25.09,AA:26.19,A:27.39,BB:29.59,B:31.89}},"100 FR":{girls:{B:77.69,BB:72.19,A:66.59,AA:63.89,AAA:61.09,AAAA:58.29},boys:{AAAA:52.39,AAA:54.89,AA:57.39,A:59.89,BB:64.89,B:69.89}},"200 FR":{girls:{B:167.69,BB:155.69,A:143.69,AA:137.69,AAA:131.69,AAAA:125.79},boys:{AAAA:114.69,AAA:120.09,AA:125.59,A:131.09,BB:141.99,B:152.89}},"400 FR":{girls:{B:353.39,BB:328.19,A:302.99,AA:290.29,AAA:277.69,AAAA:265.09},boys:{AAAA:244.89,AAA:256.49,AA:268.19,A:279.79,BB:303.09,B:326.49}},"800 FR":{girls:{B:730.29,BB:678.19,A:625.99,AA:599.89,AAA:573.79,AAAA:547.79},boys:{AAAA:508.49,AAA:532.69,AA:556.89,A:581.09,BB:629.49,B:677.89}},"1500 FR":{girls:{B:1400.89,BB:1300.79,A:1200.79,AA:1150.79,AAA:1100.69,AAAA:1050.69},boys:{AAAA:979.39,AAA:1025.99,AA:1072.59,A:1119.29,BB:1212.49,B:1305.79}},"50 BK":{girls:{B:40.99,BB:38.09,A:35.09,AA:33.69,AAA:32.19,AAAA:30.79},boys:{AAAA:27.59,AAA:28.99,AA:30.29,A:31.59,BB:34.19,B:36.79}},"100 BK":{girls:{B:85.89,BB:79.79,A:73.69,AA:70.59,AAA:67.49,AAAA:64.49},boys:{AAAA:58.19,AAA:60.89,AA:63.69,A:66.49,BB:71.99,B:77.49}},"200 BK":{girls:{B:185.79,BB:172.49,A:159.19,AA:152.59,AAA:145.99,AAAA:139.29},boys:{AAAA:126.89,AAA:132.89,AA:138.99,A:144.99,BB:157.09,B:169.19}},"50 BR":{girls:{B:45.59,BB:42.29,A:39.09,AA:37.49,AAA:35.79,AAAA:34.19},boys:{AAAA:30.29,AAA:31.69,AA:33.09,A:34.59,BB:37.49,B:40.29}},"100 BR":{girls:{B:97.49,BB:90.49,A:83.59,AA:80.09,AAA:76.59,AAAA:73.09},boys:{AAAA:65.09,AAA:68.19,AA:71.29,A:74.39,BB:80.59,B:86.69}},"200 BR":{girls:{B:209.89,BB:194.99,A:179.99,AA:172.49,AAA:164.99,AAAA:157.49},boys:{AAAA:141.89,AAA:148.59,AA:155.39,A:162.19,BB:175.69,B:189.19}},"50 FL":{girls:{B:38.39,BB:35.59,A:32.89,AA:31.49,AAA:30.19,AAAA:28.79},boys:{AAAA:25.99,AAA:27.19,AA:28.39,A:29.69,BB:32.09,B:34.59}},"100 FL":{girls:{B:83.59,BB:77.69,A:71.69,AA:68.69,AAA:65.69,AAAA:62.69},boys:{AAAA:55.99,AAA:58.69,AA:61.29,A:63.99,BB:69.29,B:74.59}},"200 FL":{girls:{B:184.49,BB:171.39,A:158.19,AA:151.59,AAA:144.99,AAAA:138.39},boys:{AAAA:125.29,AAA:131.29,AA:137.19,A:143.19,BB:155.09,B:166.99}},"200 IM":{girls:{B:189.29,BB:175.79,A:162.29,AA:155.49,AAA:148.79,AAAA:141.99},boys:{AAAA:128.99,AAA:135.09,AA:141.19,A:147.39,BB:159.59,B:171.89}},"400 IM":{girls:{B:400.29,BB:371.69,A:343.09,AA:328.79,AAA:314.49,AAAA:300.29},boys:{AAAA:275.69,AAA:288.79,AA:301.89,A:315.09,BB:341.29,B:367.59}},"200 FR-R":{girls:{B:154.19,BB:143.19,A:132.19,AA:126.69,AAA:121.19,AAAA:115.59},boys:{AAAA:100.99,AAA:105.79,AA:110.59,A:115.39,BB:124.99,B:134.59}},"400 FR-R":{girls:{B:334.19,BB:310.29,A:286.39,AA:274.49,AAA:262.59,AAAA:250.59},boys:{AAAA:220.49,AAA:230.99,AA:241.49,A:251.99,BB:272.99,B:293.99}},"800 FR-R":{girls:{B:735.79,BB:683.29,A:630.69,AA:604.39,AAA:578.19,AAAA:551.89},boys:{AAAA:490.89,AAA:514.19,AA:537.59,A:560.99,BB:607.69,B:654.49}},"200 MED-R":{girls:{B:171.39,BB:159.09,A:146.89,AA:140.79,AAA:134.69,AAAA:128.49},boys:{AAAA:111.39,AAA:116.69,AA:121.99,A:127.29,BB:137.89,B:148.49}},"400 MED-R":{girls:{B:370.89,BB:344.39,A:317.89,AA:304.69,AAA:291.39,AAAA:278.19},boys:{AAAA:242.89,AAA:254.49,AA:266.09,A:277.59,BB:300.79,B:323.89}}}}},Na={B:"#6B7280",BB:"#2563EB",A:"#059669",AA:"#D97706",AAA:"#DC2626",AAAA:"#B45309"};function nn(e){return e==null||!Number.isFinite(e)?null:e<=10?"10 & under":e<=12?"11-12":e<=14?"13-14":e<=16?"15-16":"17-18"}function Fa(e){if(!e)return null;const t=String(e).trim().toLowerCase();return t.startsWith("f")?"female":t.startsWith("m")?"male":null}function Ra(e){const t=/^(\d+)\s+([A-Za-z]{2,4})/.exec(String(e||"").trim());if(!t)return null;const s=t[2].toUpperCase();return["FR","BK","BR","FL","IM"].includes(s)?{distance:+t[1],stroke:s}:null}function La({age:e,course:t,eventKey:s,gender:n}={}){var c;const a=nn(e),r=Fa(n),i=Ra(s),d=String(t||"").toUpperCase();if(!a||!r||!i||!gs[a])return null;const l=gs[a][d];if(!l)return null;const A=r==="female"?"girls":"boys",m=(c=l[`${i.distance} ${i.stroke}`])==null?void 0:c[A];return m?Object.keys(m).map(u=>({level:u,thresholdSeconds:m[u],color:Na[u]})).sort((u,y)=>u.thresholdSeconds-y.thresholdSeconds):null}const Ve=["Claude Moore Recreation Center","Dulles South Recreation Center","Tysons — OneLife Fitness Tysons"],an=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],De=[{id:"Fall 2026",label:"Fall 2026",start:"2026-09-08",end:"2026-11-09"},{id:"Winter 2026-27",label:"Winter 2026–27",start:"2026-11-10",end:"2027-02-17"},{id:"Spring 2027",label:"Spring 2027",start:"2027-02-18",end:"2027-06-11"},{id:"Summer 2027",label:"Summer 2027",start:"2027-06-12",end:"2027-09-06"}];function mt(e){var t;return((t=De.find(s=>s.id===e))==null?void 0:t.label)||e}function Ma(e=new Date){const t=e.toISOString().slice(0,10);for(const s of De)if(t>=s.start&&t<=s.end)return s.id;return t<De[0].start?De[0].id:De[De.length-1].id}function on(e){return!e||e.authError?!1:!Number.isInteger(e.httpStatus)}function Ta(e){return typeof e=="string"&&e.includes("/GetBestTimesForMember/")}function ja(e){return on(e)&&Ta(e==null?void 0:e.endpoint)}const rn=3;function Oa(e,t){const s=ja(t)?e+1:0;return{count:s,abort:s>=rn}}function ze(e){return String(e??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9\s]/g,"").replace(/\s+/g," ").trim()}function za(e){let t=Number(e)+1,s="";for(;t>0;){const n=(t-1)%26;s=String.fromCharCode(65+n)+s,t=Math.floor((t-1)/26)}return s}function jt(e){if(e==null)return NaN;if(typeof e=="number")return Number.isFinite(e)?e:NaN;let t=String(e).trim();if(!t)return NaN;let s=!1;if(/^\(.*\)$/.test(t)&&(s=!0,t=t.slice(1,-1)),t=t.replace(/[$,\s]/g,""),!/^[+-]?\d*\.?\d+$/.test(t))return NaN;const n=Number(t);return s?-n:n}function qa(e){for(const t of[1,2,3]){const s=e==null?void 0:e[`deposit${t}Amount`],n=Number(s);if(s==null||s===""||!Number.isFinite(n)||n===0)return`deposit${t}Amount`}return null}function ln(e,t,s){const n=ze(s);return n&&(e||[]).find(a=>a&&a.season===t&&ze(a.swimmerName)===n)||null}const dn=e=>!e||e.every(t=>t==null||String(t).trim()===""),Ae=(e,t)=>t>=0&&e&&t<e.length?e[t]:null,An=e=>/name|swimmer/.test(e),Ha=e=>/balance|carry[\s-]*over|credit/.test(e);function Pa(e){const t=String(e??"").toLowerCase().replace(/\s+/g," ").trim();if(!t)return null;const s=/depo|(^|[^a-z])d\s*#?[123](?![0-9])/.test(t),n=/date|日期/.test(t),a=/amount|amt|paid|payment|金额/.test(t),r=t.match(/(?:^|\D)([123])(?:\D|$)/),i=r?r[1]:null;return n?s&&i?{field:`deposit${i}Date`}:s?{simpleDate:!0}:null:s||a?i&&(s||a)?{field:`deposit${i}Amount`}:s?{simpleAmount:!0}:null:null}const cn=e=>e.filter(t=>t&&t.index>=0).map(t=>({...t,letter:za(t.index)}));function Ua(e){if(!Array.isArray(e)||e.length<2)return{valid:[],errors:[],fatal:"no-data-rows",headerRow:-1,columns:[]};let t=-1,s=-1,n=-1;for(let i=0;i<Math.min(10,e.length);i++){const d=e[i];if(!d)continue;let l=-1,A=-1;for(let m=0;m<d.length;m++){const c=String(d[m]??"").toLowerCase().trim();c&&(l<0&&An(c)&&(l=m),A<0&&Ha(c)&&(A=m))}if(l>=0&&A>=0){t=i,s=l,n=A;break}}if(t<0)return{valid:[],errors:[],fatal:"need-name-balance",headerRow:-1,columns:[]};const a=[],r=[];for(let i=t+1;i<e.length;i++){const d=e[i];if(dn(d))continue;const l=String(Ae(d,s)??"").trim();if(!l){r.push({rowNum:i+1,reason:"Missing name."});continue}const A=jt(Ae(d,n));if(!Number.isFinite(A)){r.push({rowNum:i+1,reason:`Invalid balance for "${l}": ${Ae(d,n)??"(empty)"}`});continue}a.push({swimmerName:l,balance:A})}return{valid:a,errors:r,fatal:null,headerRow:t,columns:cn([{field:"name",label:String(Ae(e[t],s)??"name").trim(),index:s},{field:"balance",label:String(Ae(e[t],n)??"balance").trim(),index:n}])}}function Ka(e,t,s){return(e||[]).map(n=>{const a=ln(t,s,n.swimmerName);return{swimmerName:n.swimmerName,balance:n.balance,existingId:a?a.id:null,willCreate:!a,previousBalance:a&&Number.isFinite(Number(a.balance))?Number(a.balance):null}})}function Ya(e){return(e||[]).map(t=>({swimmerName:t.swimmerName,existingId:t.existingId,willCreate:!t.existingId,fields:{balance:Number(t.balance)||0}}))}function Ga(e){const t=c=>({valid:[],errors:[],fatal:c,mode:null,headerRow:-1,columns:[]});if(!Array.isArray(e)||e.length<2)return t("no-data-rows");let s=-1,n=-1,a=null,r={},i={amount:-1,date:-1};for(let c=0;c<Math.min(10,e.length);c++){const u=e[c];if(!u)continue;let y=-1;const h={};let v=-1,B=-1;for(let _=0;_<u.length;_++){const x=String(u[_]??"").toLowerCase().replace(/\s+/g," ").trim();if(!x)continue;if(y<0&&An(x)){y=_;continue}const M=Pa(x);M&&(M.field?h[M.field]=_:M.simpleAmount&&v<0?v=_:M.simpleDate&&B<0&&(B=_))}const f=Object.keys(h).length>0;if(y>=0&&(f||v>=0)){s=c,n=y,r=h,i={amount:v,date:B},a=f?"detail":"simple";break}}if(s<0)return t("need-name-amount");const d=e[s],l=cn([{field:"name",label:String(Ae(d,n)??"name").trim(),index:n},...Object.entries(r).map(([c,u])=>({field:c,label:String(Ae(d,u)??c).trim(),index:u})),...a==="simple"?[{field:"amount",label:String(Ae(d,i.amount)??"amount").trim(),index:i.amount},{field:"date",label:Va(d,i.date),index:i.date}]:[]]),A=[],m=[];for(let c=s+1;c<e.length;c++){const u=e[c];if(dn(u))continue;const y=String(Ae(u,n)??"").trim();if(!y){m.push({rowNum:c+1,reason:"Missing name."});continue}if(a==="simple"){const f=jt(Ae(u,i.amount));if(!Number.isFinite(f)){m.push({rowNum:c+1,reason:`Invalid deposit amount for "${y}": ${Ae(u,i.amount)??"(empty)"}`});continue}const _=i.date>=0?Ae(u,i.date):null;A.push({swimmerName:y,amount:f,date:_?String(_).trim():null});continue}const h={swimmerName:y};let v=!1,B=null;for(const[f,_]of Object.entries(r)){const x=Ae(u,_);if(f.endsWith("Amount")){if(x==null||String(x).trim()==="")continue;const M=jt(x);if(!Number.isFinite(M)){B=`Invalid ${f} for "${y}": ${x}`;break}h[f]=M,v=!0}else{if(x==null||String(x).trim()==="")continue;h[f]=String(x).trim()}}if(B){m.push({rowNum:c+1,reason:B});continue}if(!v){m.push({rowNum:c+1,reason:`No deposit amount for "${y}" — row skipped.`});continue}A.push(h)}return{valid:A,errors:m,fatal:null,mode:a,headerRow:s,columns:l}}function Va(e,t){return(t>=0?String(Ae(e,t)??"").trim():"")||"date"}function Wa(e,t,s){const n=[],a=[],r=[];if(!e||!e.valid)return{rows:n,skipped:a,slotErrors:r};for(const i of e.valid){const d=ln(t,s,i.swimmerName),l=d?d.id:null;if(e.mode!=="simple"){n.push({...i,existingId:l,willCreate:!d});continue}const A=Number(i.amount),m=[1,2,3].find(u=>Number(d==null?void 0:d[`deposit${u}Amount`])===A&&A!==0);if(m){a.push({swimmerName:i.swimmerName,reason:`${i.swimmerName}: $${A.toFixed(2)} is already recorded as Deposit ${m} — skipped to avoid double-counting.`});continue}const c=d?qa(d):"deposit1Amount";if(!c){r.push({swimmerName:i.swimmerName,reason:`${i.swimmerName}: all three deposit slots are already filled — edit the record instead.`});continue}n.push({swimmerName:i.swimmerName,amount:A,date:i.date||null,targetSlot:c,targetLabel:`Deposit ${c.replace(/\D/g,"")}`,existingId:l,willCreate:!d})}return{rows:n,skipped:a,slotErrors:r}}function Xa(e,t){return(t||[]).map(s=>{if(e&&e.mode==="simple"){const a=String(s.targetSlot).replace(/\D/g,""),r={[s.targetSlot]:Number(s.amount)||0},i=`deposit${a}Date`;return s.date&&(r[i]=s.date),{swimmerName:s.swimmerName,existingId:s.existingId,willCreate:!s.existingId,fields:r}}const n={};for(const a of Object.keys(s))/^deposit[123](Amount|Date)$/.test(a)&&(n[a]=s[a]);return{swimmerName:s.swimmerName,existingId:s.existingId,willCreate:!s.existingId,fields:n}})}function Je(e){return String(e??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim()}function Ot(e){const t=Je(e==null?void 0:e.lastName),s=Je(e==null?void 0:e.firstName);return t||s?`${t}\0${s}`:Je(e==null?void 0:e.name)}function Ja(e,t){const s=Ot(e),n=Ot(t);return s<n?-1:s>n?1:0}function Qt(e){return[...e||[]].sort(Ja)}function Za(e){const t=ze(e).split(" ").filter(Boolean);if(t.length===0)return"";const s=t[t.length-1],n=t.slice(0,-1).join(" ");return`${s}\0${n}`}function mn(e){const t=new Map;for(const s of e||[])for(const n of(s==null?void 0:s.swimmers)||[]){if(!n||n.deleted)continue;const a={firstName:n.firstName||"",lastName:n.lastName||""};if(!a.firstName&&!a.lastName)continue;const r=[ze(`${a.firstName} ${a.lastName}`),ze([a.firstName,n.middleName,a.lastName].filter(Boolean).join(" "))];for(const i of r)i&&!t.has(i)&&t.set(i,a)}return t}function Bs(e,t){const s=t==null?void 0:t.get(ze(e));return s?Ot(s):Za(e)}function un(e,t,s){const n=Bs(e,s),a=Bs(t,s);return n<a?-1:n>a?1:0}const vt="volunteerHours";function kt(e){return Math.round((Number(e)||0)*100)/100}function Qa(e,t){return`${e}_${t}`}function qe(e){if(e===""||e==null)return null;const t=Number(e);return!Number.isFinite(t)||t<0?null:kt(t)}function _t(e){return e?[e.firstName,e.lastName].filter(Boolean).join(" ").trim():""}function es(e){const t=[_t(e==null?void 0:e.parent),_t(e==null?void 0:e.spouse)].filter(Boolean);return[...new Set(t)].join(" & ")}function pn(e){var n,a,r;const t=Je((n=e==null?void 0:e.parent)==null?void 0:n.lastName)||Je((a=e==null?void 0:e.spouse)==null?void 0:a.lastName),s=Je((r=e==null?void 0:e.parent)==null?void 0:r.firstName);return`${t}\0${s}`}function ts(e){return((e==null?void 0:e.swimmers)||[]).filter(t=>t&&!t.deleted)}function ss(e){return e?[e.firstName,e.lastName].filter(Boolean).join(" ").trim()||String(e.name||"").trim():""}function fn(e){var t,s;return[...new Set([(t=e==null?void 0:e.parent)==null?void 0:t.email,(s=e==null?void 0:e.spouse)==null?void 0:s.email,...(e==null?void 0:e.parentEmails)||[]].map(n=>String(n||"").toLowerCase().trim()).filter(Boolean))]}function eo(e){return[es(e),_t(e==null?void 0:e.parent),_t(e==null?void 0:e.spouse),...ts(e).map(ss),...fn(e)].join(" ").toLowerCase()}function to(e){return(e||[]).filter(t=>t&&t.id).map(t=>{const s=ts(t).map(ss).filter(Boolean);return{familyId:t.id,label:es(t),sortKey:pn(t),kids:s,kidCount:s.length,emails:fn(t),search:eo(t)}}).sort((t,s)=>t.sortKey.localeCompare(s.sortKey)||t.label.localeCompare(s.label))}function hn({meets:e,registrations:t,hours:s,season:n,meetSeasonOf:a}){const r=new Map((e||[]).map(c=>[c.id,c])),i=new Map((t||[]).map(c=>[c.id,c])),d=typeof a=="function"?a:c=>(c==null?void 0:c.season)||null,l=new Map;for(const c of s||[]){if(!c||!c.familyId)continue;const u=c.meetId?r.get(c.meetId):null;if((u&&d(u)||c.season)!==n)continue;l.has(c.familyId)||l.set(c.familyId,{totalHours:0,meets:[],label:c.familyLabel||""});const h=l.get(c.familyId),v=qe(c.hours)??0;h.totalHours+=v,h.meets.push({meetId:c.meetId||"",meetName:u&&u.name||c.meetName||"Unnamed Meet",startDate:u&&(u.startDate||u.date)||c.startDate||"",hours:v,note:c.note||""})}const A=new Set([...(t||[]).map(c=>c.id),...l.keys()]),m=[];for(const c of A){const u=i.get(c),y=l.get(c)||{totalHours:0,meets:[],label:""};if(!u&&y.meets.length===0)continue;const h=u?ts(u).map(ss).filter(Boolean):[],v=y.meets.slice().sort((B,f)=>String(B.startDate).localeCompare(String(f.startDate))||B.meetName.localeCompare(f.meetName));m.push({familyId:c,label:u&&es(u)||y.label||"—",sortKey:u?pn(u):"",kidCount:h.length,kids:h,totalHours:kt(y.totalHours),meetCount:new Set(v.map(B=>B.meetId)).size,meets:v})}return m.sort((c,u)=>(c.sortKey||c.label).localeCompare(u.sortKey||u.label)||c.label.localeCompare(u.label)),m}function so({registrations:e,hours:t,meetId:s}){const n=new Map;for(const i of t||[])i&&i.meetId===s&&i.familyId&&n.set(i.familyId,i);const a=to(e),r=new Set(a.map(i=>i.familyId));for(const[i,d]of n)r.has(i)||a.push({familyId:i,label:d.familyLabel||"—",sortKey:"",kids:[],kidCount:0,emails:[],search:String(d.familyLabel||"").toLowerCase()});return a.map(i=>{const d=n.get(i.familyId);return{...i,hours:d?qe(d.hours):null,note:d&&d.note||"",updatedBy:d&&(d.updatedBy||d.updatedByEmail)||"",updatedAt:d&&d.updatedAt||null,hasRecord:!!d&&qe(d.hours)!=null}}).sort((i,d)=>i.sortKey.localeCompare(d.sortKey)||i.label.localeCompare(d.label))}function no(e,t){return kt((e||[]).filter(s=>s&&s.meetId===t&&s.familyId).reduce((s,n)=>s+(qe(n.hours)??0),0))}function ao(e){const t=e||[],s=t.filter(n=>n.totalHours>0);return{familyCount:t.length,familiesWithHours:s.length,familiesWithoutHours:t.length-s.length,totalHours:kt(t.reduce((n,a)=>n+a.totalHours,0)),meetCount:new Set(t.flatMap(n=>n.meets.map(a=>a.meetId)).filter(Boolean)).size}}function bs(e){return`"${String(e??"").replace(/"/g,'""')}"`}function yn(e,t){return[e.map(bs).join(","),...t.map(s=>s.map(bs).join(","))].join(`
`)}function oo(e){return yn(["Parents","Kids","Kid Names","Meets","Total Hours"],(e||[]).map(t=>[t.label,t.kidCount,t.kids.join("; "),t.meetCount,t.totalHours]))}function io(e){const t=[];for(const s of e||[])for(const n of s.meets)t.push([s.label,n.meetName,n.startDate||"",n.hours,n.note||"",s.totalHours]);return yn(["Parents","Meet","Date","Hours","Note","Family Season Total"],t)}function O(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function Ne(e){const t=/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec(String(e||"").trim());if(!t)return null;let s=parseInt(t[1],10);const n=parseInt(t[2],10),a=(t[3]||"").toUpperCase();return a==="PM"&&s!==12&&(s+=12),a==="AM"&&s===12&&(s=0),s*60+n}function vs(e){const t=an.indexOf(e);return t===-1?99:t}function ut(e){return e.slice().sort((t,s)=>{const n=vs(t.day)-vs(s.day);if(n)return n;const a=Ne(t.startTime)||0,r=Ne(s.startTime)||0;return a!==r?a-r:String(t.startTime||"").localeCompare(String(s.startTime||""))})}function gn(e){const t=new Set((e.sessionSlots||[]).map(s=>s.period).filter(Boolean));return e.currentPeriod&&t.add(e.currentPeriod),Array.from(t).sort((s,n)=>{const a=De.findIndex(i=>i.id===s),r=De.findIndex(i=>i.id===n);return a===-1&&r===-1?s.localeCompare(n):a===-1?1:r===-1?-1:a-r})}function ro(e){const t=new Map;for(const n of e)t.has(n.location)||t.set(n.location,[]),t.get(n.location).push(n);const s=new Set(Ve);return Array.from(t.keys()).sort((n,a)=>{const r=s.has(n)?Ve.indexOf(n):Ve.length,i=s.has(a)?Ve.indexOf(a):Ve.length;return r!==i?r-i:n.localeCompare(a)}).map(n=>({location:n,slots:ut(t.get(n))}))}function nt(e){return((e.day||"")+" "+(e.startTime||"")+" – "+(e.endTime||"")).trim()}function lo(e,t,s){const n=(e.allRegistrations||[]).find(r=>r.id===t),a=n&&n.swimmers&&n.swimmers[s];if(a&&!a.deleted){const r=n.parent||{};return{name:[a.firstName,a.lastName].filter(Boolean).join(" ")||"Unknown",parentName:[r.firstName,r.lastName].filter(Boolean).join(" ")||"—"}}return{name:"Unknown",parentName:"—"}}function Ao(e,t,s,n){return(e.enrollments||[]).find(a=>a.slotId===t&&a.regId===s&&Number(a.swimmerIndex)===Number(n))}function Bn(e,t){const s=(e.enrollments||[]).filter(n=>n.slotId===t.id);return{confirmed:s.filter(n=>n.status==="confirmed"),undecided:s.filter(n=>n.status==="undecided")}}function co(e,t){const s=Bn(e,t),n=d=>d.map(l=>lo(e,l.regId,l.swimmerIndex).name).filter(l=>l&&l!=="Unknown").sort((l,A)=>l.localeCompare(A)),a=n(s.confirmed),r=n(s.undecided);if(a.length===0&&r.length===0)return'<p style="margin:0;color:var(--text-muted);font-size:0.85rem;">'+o("sched2_no_signups")+"</p>";let i="";return a.length>0&&(i+='<div style="margin:2px 0;"><span style="font-weight:600;">'+o("sched2_confirmed")+":</span> "+O(a.join(", "))+"</div>"),r.length>0&&(i+='<div style="margin:2px 0;color:#d97706;"><span style="font-weight:600;">'+o("sched2_undecided")+":</span> "+O(r.join(", "))+"</div>"),i}function mo(e){return[e.firstName,e.lastName].filter(Boolean).join(" ")||"Unknown"}function uo(e,t,s,n){const a=mo(t),r=(e.enrollments||[]).filter(u=>u.regId===e.familyDataId&&Number(u.swimmerIndex)===Number(s)).map(u=>({e:u,slot:n.get(u.slotId)})).filter(u=>u.slot&&u.slot.period===e.currentPeriod),i=ut(r.filter(u=>u.e.status==="confirmed").map(u=>u.slot)),d=ut(r.filter(u=>u.e.status!=="confirmed").map(u=>u.slot)),l=o("contact_email_address"),A=l?'<a href="mailto:'+O(l)+'" style="color:var(--color-primary,#2563eb);">'+o("sched2_family_contact")+"</a>":"",m=(u,y)=>{const v=y==="confirmed"?'<span style="color:#16a34a;font-weight:600;font-size:0.8rem;white-space:nowrap;">✓ '+o("sched2_confirmed")+"</span>":'<span style="color:#d97706;font-weight:600;font-size:0.8rem;white-space:nowrap;">? '+o("sched2_undecided")+"</span>",B=u.groupLabel?'<span style="display:inline-block;margin-left:8px;background:var(--bg-secondary);color:var(--text-muted);border-radius:6px;padding:1px 8px;font-size:0.75rem;font-weight:500;">'+O(u.groupLabel)+"</span>":"";return`
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:8px 0;border-bottom:1px dashed var(--border-color);flex-wrap:wrap;">
        <div style="min-width:0;">
          <strong style="white-space:nowrap;">${O(nt(u))}</strong>${B}
          <div style="color:var(--text-muted);font-size:0.85rem;margin-top:2px;">${O(u.location||"")}</div>
        </div>
        ${v}
      </div>`};let c;return i.length===0&&d.length===0?c=`<p class="dash-empty" style="padding:1.2rem 0;">${o("sched2_family_not_decided",{name:O(a)})}</p>`:(c=i.map(u=>m(u,"confirmed")).join(""),d.length>0&&(c+=d.map(u=>m(u,"undecided")).join(""),c+='<p style="margin:0.7rem 0 0;color:#d97706;font-size:0.85rem;">⚠️ '+o("sched2_family_undecided_note")+(A?" "+A:"")+"</p>")),`
    <div class="dash-panel" style="margin-bottom:1.5rem;">
      <div class="dash-panel-title" style="border-bottom:1px solid var(--border-color);padding-bottom:0.6rem;">🏊 ${O(a)}</div>
      <div class="dash-panel-body">${c}</div>
    </div>`}function po(e){const t=mt(e.currentPeriod),s=new Map((e.sessionSlots||[]).map(l=>[l.id,l])),n=`
    <div class="dash-section-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
      <div>
        <h2 style="font-size:1.5rem;font-weight:600;color:var(--text-primary);margin:0;">${o("dash_schedule_weekly")}</h2>
        <p style="margin:4px 0 0;color:var(--text-muted);font-size:0.9rem;">${O(t)}</p>
      </div>
    </div>`,a=e.familyData;if(!e.familyDataId||!a||!Array.isArray(a.swimmers))return n+`
      <div class="dash-panel" style="text-align:center;padding:2.5rem 2rem;">
        <p class="dash-empty" style="padding:0;margin-bottom:0.5rem;">${o("sched2_family_no_reg")}</p>
      </div>`;const i=a.swimmers.map((l,A)=>({sw:l,index:A})).filter(l=>!l.sw.deleted);return i.length===0?n+`
      <div class="dash-panel" style="text-align:center;padding:2.5rem 2rem;">
        <p class="dash-empty" style="padding:0;margin-bottom:0.5rem;">${o("sched2_family_no_children")}</p>
      </div>`:(e.sessionSlots||[]).some(l=>l.period===e.currentPeriod)?n+i.map(({sw:l,index:A})=>uo(e,l,A,s)).join(""):n+'<p class="dash-empty">'+o("sched2_no_slots")+"</p>"}function fo(e){if(e.viewMode==="athlete")return wo(e);const t=e.dbRole==="admin",s=ut((e.sessionSlots||[]).filter(i=>i.period===e.currentPeriod)),n=ro(s),a=gn(e),r=mt(e.currentPeriod);return`
    <div class="dash-section-header" style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.5rem;gap:1rem;flex-wrap:wrap;">
      <div style="flex:1;min-width:260px;">
        <h2 style="font-size:1.5rem;font-weight:600;color:var(--text-primary);margin:0;">${o("sched2_title")}</h2>
        <p style="margin:4px 0 0;color:var(--text-muted);font-size:0.85rem;max-width:560px;">${o("sched2_subtitle")}</p>
      </div>
      <div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;"><div class="sched-view-toggle" style="display:inline-flex;border:1px solid var(--border-color);border-radius:8px;overflow:hidden;margin-right:2px;">
          <button type="button" id="sched-view-slot" class="btn btn-sm ${e.viewMode==="slot"?"btn-primary":"btn-outline"}" style="border-radius:0;">${o("sched2_view_slot")}</button>
          <button type="button" id="sched-view-athlete" class="btn btn-sm ${e.viewMode==="athlete"?"btn-primary":"btn-outline"}" style="border-radius:0;">${o("sched2_view_athlete")}</button>
        </div>

        <div style="display:flex;align-items:center;gap:0.5rem;">
          <label class="season-selector-label" for="sched-period-select">${o("sched2_period_label")}:</label>
          <select id="sched-period-select" class="season-select">
            ${a.map(i=>'<option value="'+O(i)+'"'+(i===e.currentPeriod?" selected":"")+">"+O(mt(i))+"</option>").join("")}
          </select>
        </div>
        ${t?'<button class="btn btn-primary btn-sm" id="add-slot-btn">'+o("sched2_add_slot")+"</button>":""}
      </div>
    </div>

    ${t?`
      <div id="add-slot-form" class="dash-panel" style="display:none;margin-bottom:2rem;padding:1.5rem;">
        <h3 style="margin:0 0 1rem;font-weight:600;">${o("sched2_new_slot_title")} — ${O(r)}</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:0.9rem;">
          <select id="slot-location" class="form-input">
            ${Ve.map(i=>"<option>"+O(i)+"</option>").join("")}
          </select>
          <select id="slot-day" class="form-input">
            ${an.map(i=>"<option>"+O(i)+"</option>").join("")}
          </select>
          <input type="text" id="slot-start" class="form-input" placeholder="${o("sched2_slot_start")} (6:30 PM)">
          <input type="text" id="slot-end" class="form-input" placeholder="${o("sched2_slot_end")} (8:30 PM)">
          <input type="text" id="slot-group" class="form-input" placeholder="${o("sched2_slot_group")}">
        </div>
        <div style="margin-top:1rem;display:flex;gap:0.75rem;">
          <button class="btn btn-primary btn-sm" id="save-slot-btn">${o("sched2_save")}</button>
          <button class="btn btn-outline btn-sm" id="cancel-slot-btn">${o("sched2_cancel")}</button>
        </div>
      </div>
    `:""}

    ${s.length===0?'<p class="dash-empty">'+o("sched2_no_slots")+"</p>":n.map(i=>`
          <div class="dash-panel" style="margin-bottom:1.5rem;">
            <div class="dash-panel-title" style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border-color);padding-bottom:0.6rem;">
              <h3 style="margin:0;font-size:1.05rem;font-weight:600;">${O(i.location)}</h3>
              <span class="badge" style="background:var(--bg-secondary);color:var(--text-muted);">${i.slots.length} ${i.slots.length===1?"session":"sessions"}</span>
            </div>
            <div class="dash-panel-body">
              ${i.slots.map(d=>ho(e,d,t)).join("")}
            </div>
          </div>
        `).join("")}
  `}function ho(e,t,s){const n=Bn(e,t),a=n.confirmed.length,r=n.undecided.length,i=t.capacity!=null&&t.capacity!=="",d=i?Number(t.capacity):null,l=d==null?null:Math.max(0,d-a),A=i?"<strong>"+a+" / "+d+"</strong>"+(l===0?' <span style="color:#dc2626;font-size:0.8rem;">'+o("sched2_full")+"</span>":' <span style="color:#16a34a;font-size:0.8rem;">'+o("sched2_open",{open:String(l)})+"</span>"):"<strong>"+a+'</strong> <span style="color:var(--text-muted);font-size:0.8rem;">('+o("sched2_no_capacity")+")</span>",m=o("sched2_confirmed")+": "+A+(r>0?" · "+o("sched2_undecided")+': <span style="color:#d97706;">'+r+"</span>":""),c=s?'<div style="display:flex;align-items:center;gap:0.6rem;flex-wrap:wrap;"><label style="font-size:0.8rem;color:var(--text-muted);white-space:nowrap;">'+o("sched2_capacity")+'<input type="number" min="0" class="slot-capacity-input" data-id="'+t.id+'" value="'+(i?d:"")+'" title="'+o("sched2_capacity_hint")+'" style="width:70px;margin-left:6px;padding:3px 6px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-primary);color:var(--text-primary);" /></label><button class="btn btn-primary btn-sm slot-manage-btn" data-id="'+t.id+'">'+o("sched2_manage_roster")+'</button><button class="btn btn-outline btn-sm slot-delete-btn" data-id="'+t.id+'" style="color:#dc2626;">'+o("sched2_delete_slot")+"</button></div>":"",u=t.groupLabel?'<span style="display:inline-block;margin-left:8px;background:var(--bg-secondary);color:var(--text-muted);border-radius:6px;padding:1px 8px;font-size:0.75rem;font-weight:500;">'+O(t.groupLabel)+"</span>":"";return'<div class="dash-schedule-item" style="padding:0.9rem 1rem;border:1px solid var(--border-color);border-radius:10px;margin-bottom:0.8rem;background:var(--bg-card);"><div style="display:flex;justify-content:space-between;align-items:center;gap:0.75rem;flex-wrap:wrap;"><div><div style="font-weight:600;">'+O(nt(t))+u+'</div><div style="margin-top:4px;color:var(--text-muted);font-size:0.85rem;">'+m+"</div></div>"+c+'</div><div style="display:flex;justify-content:flex-end;margin-top:6px;"><button type="button" class="slot-names-toggle" data-id="'+t.id+'" style="background:none;border:none;cursor:pointer;color:#2563eb;font-size:0.82rem;padding:2px 6px;">▸ '+o("sched2_show_names")+'</button></div><div class="slot-names" id="slot-names-'+t.id+'" style="display:none;margin-top:4px;padding-top:6px;border-top:1px dashed var(--border-color);font-size:0.85rem;">'+co(e,t)+"</div></div>"}const yo={"Claude Moore Recreation Center":"CM","Dulles South Recreation Center":"DS","Tysons — OneLife Fitness Tysons":"TY"};function go(e){return yo[e]||String(e||"").slice(0,2).toUpperCase()}function Bo(e){const t=/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec(String(e||"").trim());if(!t)return e||"";let s=parseInt(t[1],10);const n=parseInt(t[2],10),a=(t[3]||"").toUpperCase();a==="PM"&&s!==12&&(s+=12),a==="AM"&&s===12&&(s=0);let r=s%12;r===0&&(r=12);const i=s>=12?"p":"a";return r+(n?":"+String(n).padStart(2,"0"):"")+i}function bo(e){const t=[];for(const s of e.allRegistrations||[]){const n=s.parent||{},a=(s.swimmers||[]).map((r,i)=>({s:r,i})).filter(r=>!r.s.deleted);a.length!==0&&t.push({regId:s.id,parentName:[n.firstName,n.lastName].filter(Boolean).join(" ")||"—",swimmers:a})}return t.sort((s,n)=>s.parentName.localeCompare(n.parentName)),t}function vo(e){const t=(e.day||"").slice(0,3),s=[e.day,e.startTime+"–"+e.endTime,e.location,e.groupLabel].filter(Boolean).join(" · ");return'<th title="'+O(s)+'">'+O(t)+" "+O(Bo(e.startTime))+'<br><span style="font-weight:400;font-size:0.68rem;color:var(--text-muted);">'+O(go(e.location))+"</span></th>"}function _o(e,t,s,n,a){const r=Ao(e,t.id,s,n),i=r?r.status:null,d=i==="confirmed"?"st-confirmed":i==="undecided"?"st-undecided":"",l=i==="confirmed"?"✓":i==="undecided"?"?":"";return a?'<td><button type="button" class="ath-cell-btn '+d+'" data-slot="'+t.id+'" data-reg="'+O(s)+'" data-idx="'+n+'" data-cur="'+(i||"")+'" title="'+O(nt(t))+'">'+l+"</button></td>":'<td><span class="ath-cell-btn '+d+'" style="display:inline-flex;align-items:center;justify-content:center;border:none;cursor:default;">'+l+"</span></td>"}function wo(e){const t=e.dbRole==="admin",s=ut((e.sessionSlots||[]).filter(d=>d.period===e.currentPeriod)),n=bo(e),a=gn(e),r=mt(e.currentPeriod);let i="";if(i+='<div class="dash-section-header" style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem;gap:1rem;flex-wrap:wrap;"><div style="flex:1;min-width:260px;"><h2 style="font-size:1.5rem;font-weight:600;color:var(--text-primary);margin:0;">'+o("sched2_title")+'</h2><p style="margin:4px 0 0;color:var(--text-muted);font-size:0.85rem;">'+o("sched2_subtitle")+'</p></div><div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;"><div class="sched-view-toggle" style="display:inline-flex;border:1px solid var(--border-color);border-radius:8px;overflow:hidden;"><button type="button" id="sched-view-slot" class="btn btn-sm btn-outline" style="border-radius:0;">'+o("sched2_view_slot")+'</button><button type="button" id="sched-view-athlete" class="btn btn-sm btn-primary" style="border-radius:0;">'+o("sched2_view_athlete")+'</button></div><div style="display:flex;align-items:center;gap:0.5rem;"><label class="season-selector-label" for="sched-period-select">'+o("sched2_period_label")+':</label><select id="sched-period-select" class="season-select">'+a.map(d=>'<option value="'+O(d)+'"'+(d===e.currentPeriod?" selected":"")+">"+O(mt(d))+"</option>").join("")+"</select></div></div></div>",i+='<p style="color:var(--text-muted);font-size:0.82rem;margin:0 0 0.9rem;">'+o("sched2_matrix_hint")+" — "+O(r)+"</p>",s.length===0||n.length===0)return i+='<p class="dash-empty">'+(s.length===0?o("sched2_no_slots"):o("sched2_no_swimmers"))+"</p>",i;i+='<div class="ath-wrap"><table class="ath-matrix" id="ath-matrix">',i+="<thead><tr><th>"+o("sched2_swimmer")+"</th>"+s.map(vo).join("")+"</tr></thead>",i+="<tbody>";for(const d of n){i+='<tr class="ath-family"><td colspan="'+(1+s.length)+'">'+O(d.parentName)+"</td></tr>";for(const l of d.swimmers){const A=l.s,m=l.i,c=[A.firstName,A.lastName].filter(Boolean).join(" ")||"Unknown";i+='<tr><td class="ath-name">'+O(c)+"</td>"+s.map(u=>_o(e,u,d.regId,m,t)).join("")+"</tr>"}}return i+="</tbody></table></div>",i}function _s(e,t,s,n){const a=(n||"").trim().toLowerCase(),i=Qt(e.activeSwimmers||[]).filter(d=>a?[d.firstName,d.lastName,d.parentName].filter(Boolean).join(" ").toLowerCase().includes(a):!0);return i.length===0?'<p class="dash-empty">'+o("sched2_no_swimmers")+"</p>":i.map(d=>{const l=[d.firstName,d.lastName].filter(Boolean).join(" ")||"Unknown",A=d.dob?Math.floor((new Date-new Date(d.dob))/315576e5):null,m=t.enrollments.find(y=>y.slotId===s.id&&y.regId===d._regId&&Number(y.swimmerIndex)===Number(d._swimmerIndex)),c=m?m.status:null,u=(y,h,v,B)=>'<button type="button" data-action="'+h+'" data-reg="'+O(d._regId)+'" data-idx="'+d._swimmerIndex+'" style="padding:3px 10px;border:1px solid var(--border-color);border-radius:999px;cursor:pointer;font-size:0.78rem;white-space:nowrap;'+(B||"")+(v?"background:var(--color-primary,#2563eb);color:#fff;border-color:var(--color-primary,#2563eb);":"background:transparent;color:var(--text-primary);")+'">'+y+"</button>";return`
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:6px 4px;border-bottom:1px solid var(--border-color);flex-wrap:wrap;">
        <div style="min-width:0;">
          <strong style="font-size:0.9rem;">${O(l)}</strong>
          ${A!=null?'<span style="color:var(--text-muted);font-size:0.78rem;margin-left:6px;">'+A+" yrs</span>":""}
          <div style="color:var(--text-muted);font-size:0.75rem;">${o("sched2_family")}: ${O(d.parentName||"—")}</div>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          ${u(o("sched2_confirmed"),"confirm",c==="confirmed")}
          ${u(o("sched2_undecided"),"undecided",c==="undecided")}
          ${c?u("✕ "+o("sched2_remove"),"remove",!1,"color:var(--color-accent,#dc2626);"):""}
        </div>
      </div>
    `}).join("")}function bn(e,t,s,n,a){const r=Ne(s.startTime),i=Ne(s.endTime);if(r==null||i==null)return null;for(const d of t.enrollments){if(d.status!=="confirmed"||d.slotId===s.id||d.regId!==n||Number(d.swimmerIndex)!==Number(a))continue;const l=(e.sessionSlots||[]).find(c=>c.id===d.slotId);if(!l||l.day!==s.day)continue;const A=Ne(l.startTime),m=Ne(l.endTime);if(!(A==null||m==null)&&r<m&&A<i)return l}return null}async function vn(e,t,s,n,a){const r=L(k,"enrollments",`${e.id}_${t}_${s}`);if(n==null){await Oe(r);return}await xe(r,{slotId:e.id,period:e.period||"",regId:t,swimmerIndex:Number(s),status:n,swimmerName:a||"",updatedAt:new Date,updatedBy:"admin"})}function $o(e,t){const s=(e.sessionSlots||[]).find(l=>l.id===t);if(!s)return;const n={enrollments:(e.enrollments||[]).slice()},a=document.createElement("div");a.className="confirm-overlay",a.style.cssText="z-index:2000;",a.innerHTML=`
    <div class="confirm-modal" style="max-width:780px;width:min(94vw,780px);max-height:88vh;display:flex;flex-direction:column;">
      <h3 class="confirm-title" style="flex-shrink:0;">${o("sched2_manage_title",{slot:O(nt(s))})}</h3>
      <input id="slot-search" class="form-input" placeholder="${o("sched2_search_placeholder")}" style="margin:0.5rem 0 0.75rem;width:100%;flex-shrink:0;">
      <div id="slot-manager-body" style="overflow-y:auto;flex:1;min-height:220px;border:1px solid var(--border-color);border-radius:8px;padding:0.5rem;">
        ${_s(e,n,s,"")}
      </div>
      <div class="confirm-actions" style="margin-top:0.75rem;flex-shrink:0;">
        <button class="btn btn-outline btn-sm" id="slot-manager-close">${o("sched2_close")}</button>
      </div>
    </div>
  `,document.body.appendChild(a);const r=a.querySelector("#slot-search"),i=a.querySelector("#slot-manager-body"),d=()=>{i.innerHTML=_s(e,n,s,r.value)};r.addEventListener("input",d),a.querySelector("#slot-manager-close").addEventListener("click",()=>a.remove()),i.addEventListener("click",async l=>{const A=l.target.closest("button[data-action]");if(!A)return;if((e.dbRole||"")!=="admin"){alert(o("sched2_err"));return}const m=A.dataset.reg,c=Number(A.dataset.idx),u=A.dataset.action,y=u==="remove"?null:u==="confirm"?"confirmed":"undecided",h=(e.activeSwimmers||[]).find(B=>B._regId===m&&Number(B._swimmerIndex)===c),v=h?[h.firstName,h.lastName].filter(Boolean).join(" "):"Unknown";if(y==="confirmed"){const B=bn(e,n,s,m,c);if(B){alert(o("sched2_conflict_msg",{name:v,slot:nt(B),time:(B.day||"")+" "+(B.startTime||"")+"–"+(B.endTime||"")}));return}}try{await vn(s,m,c,y,v),n.enrollments=n.enrollments.filter(B=>!(B.slotId===s.id&&B.regId===m&&Number(B.swimmerIndex)===c)),y&&n.enrollments.push({slotId:s.id,period:s.period||"",regId:m,swimmerIndex:c,status:y,swimmerName:v}),d()}catch(B){console.error("Enrollment save failed:",B),alert(o("sched2_err"))}}),a.addEventListener("click",l=>{l.target===a&&a.remove()})}function xo(e){var s,n,a,r,i,d;(s=document.getElementById("sched-period-select"))==null||s.addEventListener("change",l=>{e.onPeriodChange&&e.onPeriodChange(l.target.value)}),(n=document.getElementById("add-slot-btn"))==null||n.addEventListener("click",()=>{const l=document.getElementById("add-slot-form");l&&(l.style.display=l.style.display==="none"?"block":"none")}),(a=document.getElementById("cancel-slot-btn"))==null||a.addEventListener("click",()=>{const l=document.getElementById("add-slot-form");l&&(l.style.display="none")}),(r=document.getElementById("save-slot-btn"))==null||r.addEventListener("click",async()=>{var B,f,_,x,M;const l=((B=document.getElementById("slot-location"))==null?void 0:B.value)||"",A=((f=document.getElementById("slot-day"))==null?void 0:f.value)||"",m=(((_=document.getElementById("slot-start"))==null?void 0:_.value)||"").trim(),c=(((x=document.getElementById("slot-end"))==null?void 0:x.value)||"").trim(),u=(((M=document.getElementById("slot-group"))==null?void 0:M.value)||"").trim();if(!l||!A||!m||!c){alert(o("sched2_required_fields"));return}const y=/^\d{1,2}:\d{2}\s*(AM|PM)?$/i,h=Ne(m),v=Ne(c);if(!y.test(m)||!y.test(c)||h==null||v==null||v<=h){alert(o("sched2_required_fields"));return}try{await Bt(ae(k,"sessionSlots"),{period:e.currentPeriod,location:l,day:A,startTime:m,endTime:c,groupLabel:u,capacity:null,createdAt:new Date});const J=document.getElementById("add-slot-form");J&&(J.style.display="none");const ie=document.getElementById("slot-start"),ge=document.getElementById("slot-end"),fe=document.getElementById("slot-group");ie&&(ie.value=""),ge&&(ge.value=""),fe&&(fe.value="")}catch(J){console.error("Add slot failed:",J),alert(o("sched2_err"))}}),document.querySelectorAll(".slot-manage-btn").forEach(l=>{l.addEventListener("click",()=>$o(e,l.dataset.id))}),document.querySelectorAll(".slot-delete-btn").forEach(l=>{l.addEventListener("click",async()=>{if(confirm(o("sched2_delete_confirm")))try{await Eo(l.dataset.id)}catch(A){console.error("Delete slot failed:",A),alert(o("sched2_err"))}})}),document.querySelectorAll(".slot-capacity-input").forEach(l=>{l.addEventListener("change",async()=>{try{await So(l.dataset.id,l.value)}catch(A){console.error("Capacity update failed:",A),alert(o("sched2_err"))}})}),(i=document.getElementById("sched-view-slot"))==null||i.addEventListener("click",()=>{e.onViewChange&&e.onViewChange("slot")}),(d=document.getElementById("sched-view-athlete"))==null||d.addEventListener("click",()=>{e.onViewChange&&e.onViewChange("athlete")}),document.querySelectorAll(".slot-names-toggle").forEach(l=>{l.addEventListener("click",()=>{const A=document.getElementById("slot-names-"+l.dataset.id);if(!A)return;const m=!A.style.display||A.style.display==="none";A.style.display=m?"block":"none",l.textContent=(m?"▾ ":"▸ ")+o("sched2_show_names")})});const t=document.getElementById("ath-matrix");t==null||t.addEventListener("click",async l=>{const A=l.target.closest("button.ath-cell-btn");if(!A)return;if((e.dbRole||"")!=="admin"){alert(o("sched2_err"));return}const m=(e.sessionSlots||[]).find(f=>f.id===A.dataset.slot);if(!m)return;const c=A.dataset.reg,u=Number(A.dataset.idx),y=A.dataset.cur||"",h=y===""?"confirmed":y==="confirmed"?"undecided":"";if(h==="confirmed"){const f=bn(e,{enrollments:e.enrollments||[]},m,c,u);if(f){const _=(e.activeSwimmers||[]).find(M=>M._regId===c&&Number(M._swimmerIndex)===u),x=_?[_.firstName,_.lastName].filter(Boolean).join(" "):"Unknown";alert(o("sched2_conflict_msg",{name:x,slot:nt(f),time:(f.day||"")+" "+(f.startTime||"")+"–"+(f.endTime||"")}));return}}const v=(e.activeSwimmers||[]).find(f=>f._regId===c&&Number(f._swimmerIndex)===u),B=v?[v.firstName,v.lastName].filter(Boolean).join(" "):"Unknown";try{await vn(m,c,u,h||null,B)}catch(f){console.error("Enrollment save failed:",f),alert(o("sched2_err"))}})}async function So(e,t){const s=String(t??"").trim();let n=null;s!==""&&(n=Math.max(0,Math.floor(Number(s))),!Number.isFinite(n))||await ue(L(k,"sessionSlots",e),{capacity:n})}async function Eo(e){const t=be(ae(k,"enrollments"),Et("slotId","==",e)),s=await ot(t);if(s.size>0){const n=Vt(k);s.docs.forEach(a=>n.delete(a.ref)),await n.commit()}await Oe(L(k,"sessionSlots",e))}const pt="announcements",j={items:[],loaded:!1,editingId:null,draft:null,busy:!1,formMsg:null};function Fe(e,t){j.formMsg=e?{text:e,color:t}:null;const s=document.getElementById("news-form-msg");s&&(s.textContent=e||"",s.style.color=t||"")}function rt(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function ko(){return`
    <div id="news-admin">
      <div class="dash-panel" style="margin-bottom: 1.5rem;">
        <div class="dash-panel-header">
          <h3 style="margin: 0;">Publish a notice</h3>
        </div>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin: var(--space-md) 0;">
          What you publish here shows on the public homepage within seconds — no deployment.
          The <strong>pinned</strong> notice becomes the banner under the navbar; every active notice
          also appears in the News section. Notices start on their <em>Show from</em> date and
          disappear after their <em>Until</em> date, so scheduling ahead is safe.
        </p>

        <form id="news-form" autocomplete="off">
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" for="news-title">Title *</label>
            <input class="form-input" id="news-title" maxlength="120" placeholder="e.g. No practice at Claude Moore, Nov 14–15" />
          </div>

          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" for="news-body">Body * <span style="font-size: 0.75rem; color: var(--text-muted);">(one line = one paragraph; the first paragraph is what the banner shows)</span></label>
            <textarea class="form-input" id="news-body" rows="6" maxlength="4000" style="font-family: inherit; line-height: 1.6; resize: vertical;"></textarea>
          </div>

          <div class="form-row" style="grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
            <div class="form-group">
              <label class="form-label" for="news-level">Level</label>
              <select class="form-input" id="news-level">
                <option value="info">Info (gold)</option>
                <option value="urgent">Urgent (red)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="news-date">Show from *</label>
              <input class="form-input" type="date" id="news-date" />
            </div>
            <div class="form-group">
              <label class="form-label" for="news-until">Until <span style="font-size: 0.75rem; color: var(--text-muted);">(optional)</span></label>
              <input class="form-input" type="date" id="news-until" />
            </div>
          </div>

          <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; margin-bottom: 1rem; cursor: pointer;">
            <input type="checkbox" id="news-pinned" />
            Pin to the top banner (only one notice can be pinned — pinning this one unpins the others)
          </label>

          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: var(--space-md);">
            <button type="submit" class="btn btn-primary btn-sm" id="news-save-btn">Publish</button>
            <button type="button" class="btn btn-outline btn-sm" id="news-reset-btn">New / Clear</button>
          </div>
          <p id="news-form-msg" style="margin-top: 0.5rem; font-size: 0.85rem;"></p>
        </form>
      </div>

      <div class="dash-panel" style="margin-bottom: 1.5rem;">
        <div class="dash-panel-header">
          <h3 style="margin: 0;">Preview</h3>
          <span style="font-size: 0.85rem; color: var(--text-muted);">what a visitor sees</span>
        </div>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin: var(--space-md) 0 0.5rem 0;">Banner (only when pinned):</p>
        <div id="news-preview-banner" style="border-radius: var(--radius-sm); overflow: hidden; margin-bottom: 1rem;"></div>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0 0 0.5rem 0;">News card:</p>
        <div id="news-preview-card" class="news-grid"></div>
      </div>

      <div class="dash-panel">
        <div class="dash-panel-header">
          <h3 style="margin: 0;">All notices</h3>
          <span style="display: flex; align-items: center; gap: 0.75rem;">
            <span id="news-admin-status" style="font-size: 0.85rem; color: var(--text-muted);">Loading…</span>
            <button type="button" class="btn btn-outline btn-sm" id="news-refresh-btn">↻ Refresh</button>
          </span>
        </div>
        <div id="news-list" style="margin-top: var(--space-md);"></div>
      </div>
    </div>
    `}function Io(){var s,n,a;if(!document.getElementById("news-admin"))return;const t=document.getElementById("news-form");if(t){ns(),wt(),j.formMsg&&Fe(j.formMsg.text,j.formMsg.color),t.addEventListener("submit",Fo),(s=document.getElementById("news-reset-btn"))==null||s.addEventListener("click",()=>as(!0)),(n=document.getElementById("news-refresh-btn"))==null||n.addEventListener("click",()=>zt());for(const[r,i]of[["news-title","input"],["news-body","input"],["news-level","change"],["news-date","input"],["news-until","input"],["news-pinned","change"]])(a=document.getElementById(r))==null||a.addEventListener(i,()=>{_n(),wt()});It(),zt()}}function W(e){return document.getElementById(e)}function _n(){var e,t,s,n,a,r;return j.draft={title:((e=W("news-title"))==null?void 0:e.value)??"",body:((t=W("news-body"))==null?void 0:t.value)??"",level:((s=W("news-level"))==null?void 0:s.value)==="urgent"?"urgent":"info",pinned:((n=W("news-pinned"))==null?void 0:n.checked)===!0,date:((a=W("news-date"))==null?void 0:a.value)??"",until:((r=W("news-until"))==null?void 0:r.value)??""},j.draft}function ns(){const e=j.draft;W("news-title")&&(W("news-title").value=(e==null?void 0:e.title)??""),W("news-body")&&(W("news-body").value=(e==null?void 0:e.body)??""),W("news-level")&&(W("news-level").value=(e==null?void 0:e.level)??"info"),W("news-pinned")&&(W("news-pinned").checked=(e==null?void 0:e.pinned)??!1),W("news-date")&&(W("news-date").value=(e==null?void 0:e.date)??Tt()),W("news-until")&&(W("news-until").value=(e==null?void 0:e.until)??""),W("news-save-btn").textContent=j.editingId?"Save changes":"Publish"}function as(e){var t;j.draft=null,j.editingId=null,ns(),wt(),Fe(""),e&&((t=W("news-title"))==null||t.focus())}function wt(){var a,r,i;const e=j.draft||{title:"",body:"",level:"info",pinned:((a=W("news-pinned"))==null?void 0:a.checked)===!0,date:((r=W("news-date"))==null?void 0:r.value)||Tt(),until:((i=W("news-until"))==null?void 0:i.value)||""},t={id:"preview",title:e.title||"Your headline appears here",body:e.body||`The first paragraph is what the banner shows.

A second paragraph appears only in the News card.`,level:e.level,pinned:!0,date:e.date||Tt(),until:e.until||null},s=document.getElementById("news-preview-banner");s&&(s.innerHTML=Qn(t));const n=document.getElementById("news-preview-card");n&&(n.innerHTML=ea([t]))}function Co(e){const t=Gs(e),s={live:{label:"LIVE",color:"#16A34A",bg:"rgba(22, 163, 74, 0.12)"},scheduled:{label:"SCHEDULED",color:"#B45309",bg:"rgba(180, 83, 9, 0.12)"},expired:{label:"EXPIRED",color:"var(--text-muted)",bg:"var(--bg-primary)"}},n=s[t]||s.expired;return`<span style="display: inline-block; padding: 0.1rem 0.45rem; border-radius: 999px; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.04em; color: ${n.color}; background: ${n.bg};">${n.label}</span>`}function It(){const e=document.getElementById("news-list"),t=document.getElementById("news-admin-status");if(!e)return;if(!j.loaded){t&&(t.textContent="Loading…");return}if(t){const n=j.items.filter(a=>Gs(a)==="live").length;t.textContent=`${j.items.length} notice(s) · ${n} live`}if(!j.items.length){e.innerHTML='<p style="color: var(--text-muted); font-size: 0.9rem;">No notices yet. The homepage shows nothing until you publish one.</p>';return}const s=j.items.slice().sort((n,a)=>String(a.date||"").localeCompare(String(n.date||""))).map(n=>{const a=[n.pinned?'<span style="font-size: 0.7rem; font-weight: 600; color: var(--color-accent);">PINNED</span>':"",n.level==="urgent"?'<span style="font-size: 0.7rem; font-weight: 600; color: #DC2626;">URGENT</span>':""].filter(Boolean).join(" · "),r=n.until?` → ${rt(ps(n.until))}`:"",i=n.updatedByEmail||n.createdByEmail||"",d=n.updatedAt?`edited by ${rt(i)}`:"";return`
              <div class="news-admin-row" data-id="${rt(n.id)}" style="display: flex; gap: 1rem; align-items: flex-start; justify-content: space-between; padding: 0.9rem 0; border-top: 1px solid var(--border-color);">
                <div style="min-width: 0;">
                  <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; margin-bottom: 0.25rem;">
                    ${Co(n)} ${a}
                    <span style="font-size: 0.75rem; color: var(--text-muted);">${rt(ps(n.date))}${r}</span>
                  </div>
                  <div style="font-weight: 600; font-size: 0.92rem;">${rt(n.title)}</div>
                  <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.2rem;">${d}</div>
                </div>
                <div style="display: flex; gap: 0.4rem; flex-shrink: 0;">
                  <button type="button" class="btn btn-outline btn-sm" data-action="edit">Edit</button>
                  <button type="button" class="btn btn-outline btn-sm" data-action="delete" style="color: var(--color-accent);">Delete</button>
                </div>
              </div>
            `}).join("");e.innerHTML=s,e.querySelectorAll(".news-admin-row").forEach(n=>{var r,i;const a=n.dataset.id;(r=n.querySelector('[data-action="edit"]'))==null||r.addEventListener("click",()=>Do(a)),(i=n.querySelector('[data-action="delete"]'))==null||i.addEventListener("click",()=>Lo(a))})}function Do(e){var s;const t=j.items.find(n=>n.id===e);t&&(j.editingId=e,j.draft={title:t.title,body:t.body,level:t.level,pinned:t.pinned,date:t.date,until:t.until||""},ns(),wt(),Fe("Editing an existing notice — saving keeps it in place, so families who already dismissed the banner will not see it again.","var(--text-muted)"),(s=document.getElementById("news-form"))==null||s.scrollIntoView({behavior:"smooth",block:"start"}))}async function zt(){const e=document.getElementById("news-admin-status");e&&(e.textContent="Loading…");try{const t=await ot(ae(k,pt));j.items=t.docs.map(s=>({id:s.id,...s.data()})),j.loaded=!0,It()}catch(t){console.error("[news-admin] load failed:",t),e&&(e.textContent=`Load failed: ${t.message}`)}}function No(e){return e.title.trim()?e.title.trim().length>120?"Title is too long (max 120 characters).":e.body.trim()?e.body.length>4e3?"Body is too long (max 4000 characters).":e.date?e.until&&e.until<e.date?'"Until" cannot be earlier than "Show from".':null:'"Show from" date is required.':"Body is required.":"Title is required."}async function Fo(e){if(e.preventDefault(),j.busy)return;const t=_n(),s=No(t);if(s){Fe(`❌ ${s}`,"var(--color-accent)");return}j.busy=!0;const n=W("news-save-btn"),a=n.textContent;n&&(n.disabled=!0,n.textContent="Saving…");const r=bt.currentUser,i={title:t.title.trim(),body:t.body,level:t.level,pinned:t.pinned,date:t.date,until:t.until||null,updatedAt:lt(),updatedBy:(r==null?void 0:r.uid)||null,updatedByEmail:(r==null?void 0:r.email)||null};try{let d=j.editingId;d?await ue(L(k,pt,d),i):d=(await Bt(ae(k,pt),{...i,createdBy:(r==null?void 0:r.uid)||null,createdByEmail:(r==null?void 0:r.email)||null,createdAt:lt()})).id,t.pinned&&await Ro(d);const l={...i,id:d,updatedAt:new Date().toISOString()},A=j.items.findIndex(m=>m.id===d);A>=0?j.items[A]={...j.items[A],...l}:j.items.push(l),as(!1),It(),Fe("✅ Saved. The homepage will show it within a page refresh.","#16A34A"),zt()}catch(d){console.error("[news-admin] save failed:",d),Fe(`❌ Save failed: ${d.message}`,"var(--color-accent)")}finally{j.busy=!1,n&&(n.disabled=!1,n.textContent=a)}}async function Ro(e){const s=(await ot(be(ae(k,pt),Et("pinned","==",!0)))).docs.filter(a=>a.id!==e);if(!s.length)return;const n=Vt(k);s.forEach(a=>n.update(a.ref,{pinned:!1})),await n.commit()}async function Lo(e){const t=j.items.find(n=>n.id===e),s=t?`"${t.title}"`:"this notice";if(window.confirm(`Delete ${s}? The homepage will stop showing it immediately.`))try{await Oe(L(k,pt,e)),j.items=j.items.filter(n=>n.id!==e),j.editingId===e&&as(!1),It(),Fe("🗑 Deleted.","var(--text-muted)")}catch(n){console.error("[news-admin] delete failed:",n),Fe(`❌ Delete failed: ${n.message}`,"var(--color-accent)")}}window.XLSX=ta;Gt();let ve=[],je=null,X=null,os=[],is=[],C=null,ce="swimmer",ee=null,F=null,ye=null,oe=[],He=[],Ze=[],me=null,I=ht(),qt=Ma(),Ht="slot",H="overview",ws=!1;function Mo(){const e=document.getElementById("app");e.innerHTML=`
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; gap: 20px; font-family: sans-serif;">
      <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #f5c518; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <p style="color: #666;">${o("dash_loading")}</p>
      <style>
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    </div>
  `,console.log("Dashboard: Initializing auth listener...");const t=setTimeout(()=>{console.warn("Dashboard: Auth listener timed out — redirecting to signin"),window.location.href="/signin.html"},5e3);Vn(bt,async s=>{if(clearTimeout(t),!s){console.log("Dashboard: No user authenticated, redirecting to signin..."),window.location.href="/signin.html";return}C=s,console.log("Dashboard: User authenticated:",s.email);try{console.log("Dashboard: Fetching user document...");const n=await pe(L(k,"users",s.uid));ee=n.exists()?n.data().role:null;const a=s.email&&s.email.toLowerCase()==="dragonswim@outlook.com";ce=ee==="coach"||ee==="admin"||a?"coach":ee||"swimmer",console.log("Dashboard: Detected role:",ce),ce!=="coach"&&H==="overview"&&(H="schedule"),ws?(console.log("Dashboard: Refreshing UI..."),K()):(console.log("Dashboard: Initializing data listeners..."),To(),ce==="coach"&&Promise.all([ci(),As()]).then(()=>{console.log("Dashboard: Data Hub session:",Q!=null&&Q.dev?"dev proxy":Q!=null&&Q.hasCookie?"saved":"missing"),K()}),ws=!0,K())}catch(n){console.error("Dashboard Critical Error:",n),e.innerHTML=`
        <div style="padding: 40px; text-align: center; font-family: sans-serif; max-width: 500px; margin: 100px auto; border: 1px solid #fee2e2; background: #fef2f2; border-radius: 12px; color: #991b1b;">
          <h2 style="margin-bottom: 16px;">${o("dash_load_failed_title")}</h2>
          <p style="margin-bottom: 24px;">${o("dash_load_failed_msg")}</p>
          <code style="display: block; padding: 12px; background: #fee2e2; border-radius: 6px; font-size: 13px; text-align: left; overflow-x: auto; margin-bottom: 24px;">
            ${n.message||o("dash_unknown_error")}
          </code>
          <button onclick="window.location.reload()" style="padding: 10px 20px; background: #991b1b; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">${o("dash_load_failed_retry")}</button>
        </div>
      `,ce="swimmer"}})}function To(){const e=be(ae(k,"meets"),Nt("createdAt","desc"));Te(e,n=>{ve=n.docs.map(a=>({id:a.id,...a.data()})),K()},n=>{console.error("Error listening to meets:",n)});const t=be(ae(k,"sessionSlots"));Te(t,n=>{os=n.docs.map(a=>({id:a.id,...a.data()})),K()},n=>{console.error("Error listening to sessionSlots:",n)});const s=be(ae(k,"enrollments"));if(Te(s,n=>{is=n.docs.map(a=>({id:a.id,...a.data()})),K()},n=>{console.error("Error listening to enrollments:",n)}),ce==="coach"){const n=be(ae(k,"registrations"),Nt("createdAt","desc"));Te(n,i=>{oe=i.docs.map(d=>({id:d.id,...d.data()})),K()},i=>{console.error("Error listening to registrations:",i)});const a=be(ae(k,"deposits"),Nt("swimmerName","asc"));Te(a,i=>{He=i.docs.map(d=>({id:d.id,...d.data()})),K()},i=>{console.error("Error listening to deposits:",i)});const r=be(ae(k,vt));Te(r,i=>{Ze=i.docs.map(d=>({id:d.id,...d.data()})),K()},i=>{console.error("Error listening to volunteerHours:",i)})}}async function jo(){if(!C)return;const e=L(k,"registrations",C.uid),t=await pe(e);if(t.exists()){ye=t.id,F=t.data(),console.log("fetchFamilyData: found own registration",t.id);return}if(C.email){const s=C.email.toLowerCase().trim();console.log("fetchFamilyData: looking for spouse access with email:",s);try{const n=be(ae(k,"registrations"),Et("parentEmails","array-contains",s)),a=await ot(n);if(console.log("fetchFamilyData: spouse query returned",a.size,"docs"),!a.empty){const r=a.docs[0];ye=r.id,F=r.data(),console.log("fetchFamilyData: found via spouse access",ye,"parentEmails:",F.parentEmails);const i=F.editors||[];i.includes(C.uid)||(i.push(C.uid),await ue(L(k,"registrations",ye),{editors:i}).catch(d=>{console.error("fetchFamilyData: failed to add editor:",d)}),F.editors=i);return}console.warn("fetchFamilyData: no registration found for spouse email",s)}catch(n){console.error("fetchFamilyData: spouse query failed:",n)}}else console.warn("fetchFamilyData: currentUser.email is empty")}function K(){C&&jo().then(()=>{dt()}).catch(e=>{console.error("Error fetching family data:",e),dt()})}function dt(){const e=Po(),t=zo();t&&(X=t);const s=qo();ce==="coach"?Yo(C):Ko(C),Uo(e),Ho(s)}const Oo={name:"meet-name",startDate:"meet-start-date",endDate:"meet-end-date",location:"meet-location",source:"meet-source",season:"meet-season"};function zo(){var s;const e=document.getElementById("add-meet-form");if(!e||e.style.display==="none")return null;const t={};for(const[n,a]of Object.entries(Oo))t[n]=((s=document.getElementById(a))==null?void 0:s.value)??"";return t.season||(t.season=I),t}function Rt(){X=null,je=null;const e=document.getElementById("add-meet-form");e&&(e.style.display="none")}function qo(){const e=document.activeElement;if(!e||!e.id)return null;const t=document.getElementById("add-meet-form");return!t||!t.contains(e)?null:{id:e.id,selStart:typeof e.selectionStart=="number"?e.selectionStart:null,selEnd:typeof e.selectionEnd=="number"?e.selectionEnd:null}}function Ho(e){if(!e)return;const t=document.getElementById(e.id);if(t&&(t.focus(),e.selStart!=null&&typeof t.setSelectionRange=="function"))try{t.setSelectionRange(e.selStart,e.selEnd)}catch{}}function Po(){const e=document.activeElement;return!e||!e.classList||!e.classList.contains("vol-input")?null:{familyId:e.dataset.familyId||"",field:e.classList.contains("vol-note-input")?"note":"hours",selStart:typeof e.selectionStart=="number"?e.selectionStart:null,selEnd:typeof e.selectionEnd=="number"?e.selectionEnd:null}}function Uo(e){if(!e||!e.familyId)return;const t=e.field==="note"?"vol-note-input":"vol-hours-input",s=document.querySelector(`.${t}[data-family-id="${e.familyId}"]`);if(s&&(s.focus(),e.selStart!=null&&typeof s.setSelectionRange=="function"))try{s.setSelectionRange(e.selStart,e.selEnd)}catch{}}function Ko(e){const t=document.getElementById("app");t.innerHTML=`
    <div class="dash-layout">
      <aside class="dash-sidebar" id="dash-sidebar">
        <div class="dash-sidebar-header">
          <a href="/" class="dash-logo">
            <img src="/logo-light.jpg" alt="Dragon Swim Team" class="dash-logo-img light-logo" />
            <img src="/logo-dark.png" alt="Dragon Swim Team" class="dash-logo-img dark-logo" />
          </a>
        </div>
        <nav class="dash-nav">
          <div class="dash-nav-section">
            <span class="dash-nav-label">${o("dash_sidebar_menu")}</span>
            <button class="dash-nav-item ${H==="profile"?"active":""}" data-tab="profile">
              <span class="dash-nav-icon">👤</span> ${o("dash_swimmer_profile_label")}
            </button>
            <button class="dash-nav-item ${H==="plans"?"active":""}" data-tab="plans">
              <span class="dash-nav-icon">📋</span> ${o("dash_swimmer_plans_label")}
            </button>
            <button class="dash-nav-item ${H==="meets"?"active":""}" data-tab="meets">
              <span class="dash-nav-icon">🏆</span> ${o("dash_swimmer_meets_label")}
            </button>
            <button class="dash-nav-item ${H==="results"?"active":""}" data-tab="results">
              <span class="dash-nav-icon">🏊</span> ${o("dash_swimmer_results_label")}
            </button>
            <button class="dash-nav-item ${H==="schedule"?"active":""}" data-tab="schedule">
              <span class="dash-nav-icon">📅</span> ${o("dash_swimmer_schedule_label")}
            </button>
          </div>
          <div class="dash-nav-section" style="margin-top: auto;">
            <span class="dash-nav-label">${o("dash_sidebar_system")}</span>
            ${ee==="admin"?`
            <a href="/admin.html" class="dash-nav-item" style="text-decoration: none;">
              <span class="dash-nav-icon">⚙️</span> ${o("dash_sidebar_admin")}
            </a>
            `:""}
            <button class="dash-nav-item" id="dash-theme-toggle">
              <span class="dash-nav-icon" id="sidebar-theme-icon">🌙</span> ${o("dash_sidebar_theme")}
            </button>
            <button class="dash-nav-item" id="sidebar-signout" style="color: var(--color-accent); margin-top: var(--space-md);">
              <span class="dash-nav-icon">🚪</span> ${o("dash_sidebar_signout")}
            </button>
          </div>
        </nav>
      </aside>

      <main class="dash-main">
        <header class="dash-topbar">
          <div class="dash-topbar-left">
            <button class="dash-hamburger" id="dash-hamburger">
              <span></span><span></span><span></span>
            </button>
            <div>
              <h1 class="dash-page-title">${wn(H)}</h1>
              <p class="dash-page-subtitle">${Go(H)}</p>
            </div>
          </div>
          <div class="dash-topbar-right">
            <div class="dash-user-menu" id="user-menu">
              <button class="dash-user-trigger" id="user-trigger">
                <div class="dash-avatar">${($s()||e.email||o("dash_swimmer_username_fallback")).charAt(0).toUpperCase()}</div>
                <span class="dash-user-name">${$s()||e.email||o("dash_swimmer_username_fallback")}</span>
                <span class="dash-dropdown-arrow">▾</span>
              </button>
              <div class="dash-dropdown" id="user-dropdown" style="display: none;">
                <button class="dash-dropdown-item" id="menu-profile">${o("dash_user_menu_profile")}</button>
                ${ee==="admin"?`<button class="dash-dropdown-item" id="menu-admin">${o("dash_user_menu_admin")}</button>`:""}
                ${C&&C.providerData&&C.providerData[0].providerId==="password"?`<button class="dash-dropdown-item" id="menu-password">🔑 ${o("dash_profile_password_btn")}</button>`:""}
                <button class="dash-dropdown-item" id="menu-signout" style="color: var(--color-accent);">${o("dash_user_menu_signout")}</button>
              </div>
            </div>
          </div>
        </header>

        <div class="dash-content">
          ${$n(H,"swimmer")}
        </div>
      </main>
    </div>
  `,Yn(),Gt(),xn(),H==="results"&&vi()}function Yo(e){const t=document.getElementById("app");t.innerHTML=`
    <div class="dash-layout">
      <aside class="dash-sidebar" id="dash-sidebar">
        <div class="dash-sidebar-header">
          <a href="/" class="dash-logo">
            <img src="/logo-light.jpg" alt="Dragon Swim Team" class="dash-logo-img light-logo" />
            <img src="/logo-dark.png" alt="Dragon Swim Team" class="dash-logo-img dark-logo" />
          </a>
        </div>
        <nav class="dash-nav">
          <div class="dash-nav-section">
            <span class="dash-nav-label">${o("dash_coach_menu")}</span>
            <button class="dash-nav-item ${H==="overview"?"active":""}" data-tab="overview">
              <span class="dash-nav-icon">🏠</span> ${o("dash_coach_overview_label")}
            </button>
            <button class="dash-nav-item ${H==="roster"?"active":""}" data-tab="roster">
              <span class="dash-nav-icon">👥</span> ${o("dash_coach_roster_label")}
            </button>
            <button class="dash-nav-item ${H==="schedule"?"active":""}" data-tab="schedule">
              <span class="dash-nav-icon">⏱️</span> ${o("dash_coach_schedule_label")}
            </button>
            <button class="dash-nav-item ${H==="meets"?"active":""}" data-tab="meets">
              <span class="dash-nav-icon">🏁</span> ${o("dash_coach_meets_label")}
            </button>
            <button class="dash-nav-item ${H==="volunteer"?"active":""}" data-tab="volunteer">
              <span class="dash-nav-icon">🙋</span> ${o("dash_coach_volunteer_label")}
            </button>
            ${ee==="admin"?`
            <button class="dash-nav-item ${H==="feesummary"?"active":""}" data-tab="feesummary">
              <span class="dash-nav-icon">💰</span> ${o("dash_coach_fee_summary_label")}
            </button>
            <button class="dash-nav-item ${H==="deposits"?"active":""}" data-tab="deposits">
              <span class="dash-nav-icon">🏦</span> ${o("dash_coach_deposits_label")}
            </button>
            <button class="dash-nav-item ${H==="news"?"active":""}" data-tab="news">
              <span class="dash-nav-icon">📰</span> ${o("dash_coach_news_label")}
            </button>
            `:""}
            <button class="dash-nav-item ${H==="results"?"active":""}" data-tab="results">
              <span class="dash-nav-icon">🏊</span> Swim Times
            </button>
          </div>
          <div class="dash-nav-section" style="margin-top: auto;">
            <span class="dash-nav-label">${o("dash_sidebar_system")}</span>
            ${ee==="admin"?`
            <a href="/admin.html" class="dash-nav-item" style="text-decoration: none;">
              <span class="dash-nav-icon">⚙️</span> ${o("dash_sidebar_admin")}
            </a>
            `:""}
            <button class="dash-nav-item" id="dash-theme-toggle">
              <span class="dash-nav-icon" id="sidebar-theme-icon">🌙</span> ${o("dash_sidebar_theme")}
            </button>
            <button class="dash-nav-item" id="sidebar-signout" style="color: var(--color-accent); margin-top: var(--space-md);">
              <span class="dash-nav-icon">🚪</span> ${o("dash_sidebar_signout")}
            </button>
          </div>
        </nav>
      </aside>

      <main class="dash-main">
        <header class="dash-topbar">
          <div class="dash-topbar-left">
            <button class="dash-hamburger" id="dash-hamburger">
              <span></span><span></span><span></span>
            </button>
            <div>
              <h1 class="dash-page-title">${wn(H,"coach")}</h1>
            </div>
          </div>
          <div class="dash-topbar-right">
            <div class="badge badge-primary" style="margin-right: 1rem;">${o("dash_coach_badge")}</div>
            <div class="dash-user-menu" id="user-menu">
              <button class="dash-user-trigger" id="user-trigger">
                <div class="dash-avatar" style="background: var(--color-accent); color: white;">${(e.displayName||e.email||o("dash_coach_username_fallback")).charAt(0).toUpperCase()}</div>
                <span class="dash-user-name">${e.displayName||e.email||o("dash_coach_username_fallback")}</span>
                <span class="dash-dropdown-arrow">▾</span>
              </button>
              <div class="dash-dropdown" id="user-dropdown" style="display: none;">
                ${ee==="admin"?`<button class="dash-dropdown-item" id="menu-admin">${o("dash_user_menu_admin")}</button>`:""}
                ${C&&C.providerData&&C.providerData[0].providerId==="password"?`<button class="dash-dropdown-item" id="menu-password">🔑 ${o("dash_profile_password_btn")}</button>`:""}
                <button class="dash-dropdown-item" id="menu-signout" style="color: var(--color-accent);">${o("dash_user_menu_signout")}</button>
              </div>
            </div>
          </div>
        </header>

        <div class="dash-content">
          ${$n(H,"coach")}
        </div>
      </main>
    </div>
  `,H==="results"&&In(),H==="news"&&ee==="admin"&&Io(),Yn(),Gt(),xn()}function $s(){if(!F||!F.parent)return null;const e=F.parent;return[e.firstName,e.lastName].filter(Boolean).join(" ")||null}function wn(e,t="swimmer"){return t==="coach"?{overview:o("dash_coach_tab_overview"),roster:o("dash_coach_tab_roster"),meets:o("dash_coach_tab_meets"),schedule:o("dash_coach_tab_schedule"),results:"Swim Times",feesummary:o("dash_coach_tab_fee_summary"),deposits:o("dash_coach_tab_deposits"),volunteer:o("dash_coach_tab_volunteer"),news:o("dash_coach_tab_news")}[e]||o("dash_coach_tab_overview"):{profile:o("dash_swimmer_tab_profile"),plans:o("dash_swimmer_tab_plans"),meets:o("dash_swimmer_tab_meets"),results:o("dash_swimmer_tab_results"),schedule:o("dash_swimmer_tab_schedule")}[e]||o("dash_swimmer_tab_schedule")}function Go(e){return{profile:o("dash_swimmer_profile_sub"),plans:o("dash_swimmer_plans_sub"),meets:o("dash_swimmer_meets_sub"),results:o("dash_swimmer_results_sub"),schedule:o("dash_swimmer_schedule_sub")}[e]||""}function $n(e,t="swimmer"){if(t==="coach")switch(e){case"overview":return Mt();case"roster":return Li();case"meets":return Os();case"schedule":return zs();case"results":return Bi();case"feesummary":return Mi();case"deposits":return Ti();case"volunteer":return Zi();case"news":return ee==="admin"?ko():Mt();default:return Mt()}switch(e){case"profile":return rr();case"plans":return lr();case"meets":return Os();case"results":return bi();case"schedule":return zs();default:return""}}function xn(){const e=document.getElementById("sidebar-theme-icon");if(e){const t=document.documentElement.getAttribute("data-theme")==="dark";e.textContent=t?"☀️":"🌙"}}function Ct(){const e=[];for(const t of oe)if(t.swimmers)for(let s=0;s<t.swimmers.length;s++){const n=t.swimmers[s];n.deleted||e.push({...n,parentName:rs(t),_regId:t.id,_swimmerIndex:s})}return e}function rs(e){return e.parent&&[e.parent.firstName,e.parent.lastName].filter(Boolean).join(" ")||"—"}function Vo(){const e=new Date;return e.setDate(e.getDate()-30),oe.filter(t=>{var n,a;return(((a=(n=t.createdAt)==null?void 0:n.toDate)==null?void 0:a.call(n))||new Date(t.createdAt))>=e})}function Wo(){const e=[];for(const t of oe){const s=Jn(t);(s.required.length||s.conflicts.length||s.optionalGaps.length)&&e.push({regId:t.id,name:rs(t),audit:s})}return Zn(e)}const Xo={parent:{firstName:"dash_attn_parent_first",lastName:"dash_attn_parent_last",gender:"dash_attn_parent_gender",phone:"dash_attn_parent_phone",address:"dash_attn_parent_address"},emergency:{name:"dash_attn_emergency_name",phone:"dash_attn_emergency_phone"},swimmer:{firstName:"dash_attn_swimmer_first",lastName:"dash_attn_swimmer_last",gender:"dash_attn_gender",dob:"dash_attn_dob",usaSwimmingId:"dash_attn_usa_id"},spouse:{firstName:"dash_attn_spouse_first",lastName:"dash_attn_spouse_last",gender:"dash_attn_spouse_gender",phone:"dash_attn_spouse_phone",email:"dash_attn_spouse_email"}},$t={parent:"dash_attn_scope_parent",swimmer:"dash_attn_scope_swimmer",emergency:"dash_attn_scope_emergency",spouse:"dash_attn_scope_spouse",family:"dash_attn_scope_family",other:"dash_attn_scope_other"},Jo={emergency_name_same_as_parent:"dash_attn_conflict_emergency_name_same",emergency_phone_same_as_parent:"dash_attn_conflict_emergency_phone_same",spouse_name_same_as_parent:"dash_attn_conflict_spouse_name_same",spouse_email_same_as_parent:"dash_attn_conflict_spouse_email_same",parent_email_missing:"dash_attn_conflict_parent_email_missing",parent_emails_missing:"dash_attn_conflict_parent_emails_missing",parent_email_not_in_parent_emails:"dash_attn_conflict_parent_email_not_in_parent_emails",parent_email_mismatch_auth:"dash_attn_conflict_parent_email_mismatch_auth",address_looks_like_email:"dash_attn_conflict_address_email",swimmer_is_account_holder:"dash_attn_conflict_swimmer_is_holder",swimmer_is_spouse:"dash_attn_conflict_swimmer_is_spouse",swimmer_is_adult:"dash_attn_conflict_swimmer_is_adult"};function Sn(e,t){var n;const s=(n=Xo[e])==null?void 0:n[t];return s?o(s):String(t)}function Zo(e){if(e.scope==="family"&&e.field==="activeSwimmers")return o("dash_attn_no_active_swimmers");if(e.field==="__missing__")return o(`dash_attn_${e.scope}_missing`);const t=Sn(e.scope,e.field);if(e.scope==="swimmer"){const n=e.swimmerName||o("dash_coach_unnamed");return`${g(n)}: ${g(t)}`}const s=o($t[e.scope]||$t.other);return`${g(s)}: ${g(t)}`}function Qo(e){const t=Sn(e.scope,e.field);if(e.scope==="swimmer"){const n=e.swimmerName||o("dash_coach_unnamed");return`${g(n)}: ${g(t)}`}const s=o($t[e.scope]||$t.other);return`${g(s)}: ${g(t)}`}function ei(e){const t=Jo[e.type]||"dash_attn_conflict_unknown";return g(o(t,{parentEmail:e.parentEmail||"",authEmail:e.authEmail||"",swimmerName:e.swimmerName||"",age:e.age??""}))}function Lt(e,t,s,n){return s.length?`
    <div class="dash-attn-group">
      <div class="dash-attn-group-label ${t}">${o(e)}</div>
      <div class="dash-attn-list">
        ${s.map(a=>`<span class="dash-attn-chip dash-attn-chip--${t}">${n(a)}</span>`).join("")}
      </div>
    </div>`:""}function ti(e){var n;const t=((n=e==null?void 0:e.toDate)==null?void 0:n.call(e))||(e?new Date(e):null);if(!t||Number.isNaN(t.getTime()))return"";const s=Math.floor((Date.now()-t.getTime())/864e5);return s<=0?o("dash_rel_today"):o("dash_rel_days",{n:s})}function si(e){return(e.swimmers||[]).filter(t=>!t.deleted).map(t=>[t.firstName,t.lastName].filter(Boolean).join(" ")).filter(Boolean).join(", ")}const Qe="/api/usas/TimesSearch",ls="/api/usas/session";let Q=null;async function En(){try{return C?await C.getIdToken():null}catch(e){return console.warn("[usas] getIdToken failed:",e),null}}async function ds(e,t={}){const s=await En(),n={...t.headers||{}};return s&&(n.Authorization=`Bearer ${s}`),fetch(e,{...t,headers:n})}async function As(){try{const e=await ds(ls);Q=e.ok?await e.json():null}catch(e){console.warn("[usas] session status failed:",e),Q=null}return Q}function xs(){return!!(Q&&Q.hasCookie)}async function Ss(e){e||(e=document.getElementById("session-message"));try{const t=await ds(`${ls}/verify`),s=await t.json().catch(()=>({}));return t.ok&&s.valid?e&&(e.textContent=`✅ 连接正常${s.name?`(已登录:${s.name})`:""}`,e.style.color="#16A34A"):e&&(e.textContent="⛔ 会话已失效 —— 重新登录 Data Hub,复制新的 cookie 再粘贴一次。",e.style.color="var(--color-accent)"),await As(),s}catch(t){return e&&(e.textContent=`❌ 验证失败:${t.message}`,e.style.color="var(--color-accent)"),null}}let We=null,et=!1;const xt=!1,de={meetGapMs:5e3,batchSize:10,batchPauseMs:6e4,swimmerGapMs:18e4,retryDelaysMs:[5e3,2e4,6e4],cooldownAfterConsecutive:3,cooldownMs:3e5,emptyCooldownAfter:5,emptyCooldownMs:6e5,abortAfterConsecutiveBlocked:rn},ni=new Set([406,429,500,502,503,504]),Xe=e=>new Promise(t=>setTimeout(t,e)),ai=[{name:"Mock A (incremental + fail/circuit-break)",usaSwimmingId:"MOCK-A",hasId:!0,dob:"2013-06-01",gender:"female"},{name:"Mock B (batch pause)",usaSwimmingId:"MOCK-B",hasId:!0,dob:"2011-02-14",gender:"male"}];function oi(e){const t=e||{};return{AppName:"DataHub","Usas-Sub-Id":t.subId||"","Device-Id":t.deviceId||"","usas-session-id":t.sessionId||""}}function kn(e,t=null){return{endpoint:(e==null?void 0:e.endpoint)||t||null,httpStatus:Number.isInteger(e==null?void 0:e.httpStatus)?e.httpStatus:null,message:(e==null?void 0:e.message)||String(e),retryable:!!(e!=null&&e.retryable),authError:!!(e!=null&&e.authError),responseUnreadable:on(e),at:new Date().toISOString()}}async function Es(e,t,s=null){const n=kn(t,s);try{await xe(L(k,"swimResults",e),{lastFetchError:n},{merge:!0})}catch(a){console.warn("[fetchLog] failed to persist fetch error:",a)}return n}async function ii(e,t){const s=`${Qe}/GetBestTimesForMember/${t}`;return cs(s,e,`GetBestTimesForMember/${t}`)}async function ri(e,t){const s=`${Qe}/GetSwimmerMeets/${t}`;return cs(s,e,`GetSwimmerMeets/${t}`)}function li(e){if(typeof e!="string")return e;const t=e.trim();if(!t||t[0]!=="["&&t[0]!=="{")return e;try{return JSON.parse(t)}catch{return e}}async function di(e,t){const s=new AbortController,n=setTimeout(()=>s.abort(),15e3);try{const a=await En(),r=oi(t);a&&(r.Authorization=`Bearer ${a}`);const i=await fetch(e,{headers:r,signal:s.signal});if(clearTimeout(n),i.ok)return{ok:!0,data:li(await i.json())};let d="";try{d=await i.text()}catch{d="(could not read body)"}const l=new Error(`HTTP ${i.status}: ${d.slice(0,200)}`);return l.endpoint=e,l.httpStatus=i.status,l.authError=i.status===401||i.status===403,l.retryable=ni.has(i.status),{ok:!1,error:l,retryable:l.retryable}}catch(a){if(clearTimeout(n),a.name==="AbortError"){const r=new Error("Timeout (15s)");return r.endpoint=e,r.retryable=!0,{ok:!1,error:r,retryable:!0}}return a.endpoint=e,a.retryable=!0,{ok:!1,error:a,retryable:!0}}}async function cs(e,t,s){const n=de.retryDelaysMs;for(let a=0;;a++){const r=await di(e,t);if(r.ok)return r.data;const i=r.error;if(i.endpoint=i.endpoint||e,!r.retryable)throw i;if(a>=n.length)throw Object.assign(i,{retryable:!0});console.warn(`[fetch] ${s||e} attempt ${a+1} failed: ${i.message} — retrying in ${n[a]}ms`),await Xe(n[a])}}async function Ai(e,t,s){const n=`${Qe}/GetSwimmerMeetTimes/${t}/${s}`;return cs(n,e,`GetSwimmerMeetTimes/${t}/${s}`)}async function ci(){try{const e=await pe(L(k,"settings","swimApi"));if(e.exists())return We=e.data(),We}catch(e){console.warn("Failed to load swim API credentials:",e)}return null}function ft(){const e=[];for(const t of oe)if(t.swimmers)for(let s=0;s<t.swimmers.length;s++){const n=t.swimmers[s];n.deleted||e.push({usaSwimmingId:n.usaSwimmingId||null,name:[n.firstName,n.lastName].filter(Boolean).join(" ")||"Unknown",firstName:n.firstName||"",lastName:n.lastName||"",hasId:!!n.usaSwimmingId,dob:n.dob||null,gender:n.gender||null})}return e}async function mi(e){try{const t=await pe(L(k,"swimResults",e));if(t.exists()){const s=t.data();return!s.initialFullFetchAt&&!s.fullFetchComplete&&Dn(s)&&xe(L(k,"swimResults",e),{initialFullFetchAt:new Date().toISOString(),initialMeetCount:Object.keys(s.meets||{}).length,migratedLegacyInitializedAt:new Date().toISOString()},{merge:!0}).catch(n=>{console.warn(`[fetchNew] failed to backfill legacy marker for ${e}:`,n)}),s.meets||{}}}catch{}return{}}async function ui(e){const t=await pe(L(k,"swimResults",e));if(!t.exists())return!1;const s=t.data(),n=Object.keys(s).filter(d=>d.startsWith("meets."));if(n.length===0)return!1;const a={...s.meets||{}};let r=0;for(const d of n){const l=d.slice(6),A=s[d];!A||typeof A!="object"||(a[l]={...A},r++)}const i={...s};for(const d of n)delete i[d];return i.meets=a,await xe(L(k,"swimResults",e),i),console.log(`[Migrate] ${e}: merged ${r} literal meet fields into meets object`),!0}async function pi(){const e=ft().filter(t=>t.hasId);for(const t of e)try{await ui(t.usaSwimmingId)}catch(s){console.warn(`[Migrate] ${t.usaSwimmingId} failed:`,s)}}async function In(){const e=ft().filter(t=>t.hasId);await Promise.all(e.map(async t=>{const s=document.getElementById(`status-${t.usaSwimmingId}`);if(!s)return;let n={};try{if(!xt){const A=await pe(L(k,"swimResults",t.usaSwimmingId));A.exists()&&(n=A.data().meets||{})}}catch(A){s.innerHTML=`<span style="color:var(--color-accent);">❌ ${g(A.message||"load failed")}</span>`;return}const a=Object.values(n);if(a.length===0){s.innerHTML='<span style="color: var(--text-muted);">— No data yet</span>';return}let r=0,i=0,d=0,l=0;for(const A of a){const m=A.status||(A.swims&&A.swims.length?"ok":"empty");m==="ok"?r++:m==="failed"?i++:d++,l+=(A.swims||[]).length}if(i===0&&d===0)s.innerHTML=`<span style="color:#16A34A;">✅ ${r} meets · ${l} swims</span>`;else{const A=[];i&&A.push(`${i} failed`),d&&A.push(`${d} empty`),s.innerHTML=`<span style="color:var(--color-accent);">⚠ ${a.length} meets · ${A.join(" · ")} — refetch</span>`}}))}async function ks(e,t,s,n,a=null){const r={meetName:t.meetName,meetDates:t.meetDates,meetType:t.meetType,courseCode:t.courseCode,season:t.season,seasonYear:t.seasonYear,fetchedAt:new Date().toISOString(),status:n,swims:s};a&&(r.error=a);const i={[`meets.${t.meetId}`]:r,lastUpdated:new Date().toISOString()};a&&(i.lastFetchError=a),await ue(L(k,"swimResults",e),i)}async function Cn(e,t,s,n={}){const{force:a=!1,onLog:r=()=>{},onBestTimes:i=()=>{}}=n,d=await mi(t),l=f=>{var x;if(a)return!0;const _=d[f];return _?_.status==="ok"?!1:_.status==="failed"||_.status==="empty"?!0:(((x=_.swims)==null?void 0:x.length)||0)===0:!0};let A;try{A=await ii(e,t)}catch(f){throw await Es(t,f,`${Qe}/GetBestTimesForMember/${t}`),f}i(A),await xe(L(k,"swimResults",t),{memberId:t,swimmerName:s,bestTimes:A,lastUpdated:new Date().toISOString(),lastFetchSuccessAt:new Date().toISOString(),lastFetchError:null},{merge:!0});let m;try{m=await ri(e,t)}catch(f){throw await Es(t,f,`${Qe}/GetSwimmerMeets/${t}`),f}const c=m.filter(f=>l(f.meetId));r(`📅 ${m.length} meets total, ${c.length} to fetch${c.length?"":" — all up to date"}`);let u=0,y=0;const h=[];let v=0,B=0;for(let f=0;f<c.length;f++){const _=c[f];try{const x=await Ai(e,t,_.meetId);Array.isArray(x)||console.warn(`[fetch] ${_.meetId}: expected array, got ${typeof x}`,typeof x=="string"?x.slice(0,120):x);const M=Array.isArray(x)?x:[],J=M.length===0?"empty":"ok";await ks(t,_,M,J),u++,v=0,M.length===0?(B++,B>=de.emptyCooldownAfter&&(r(`⚠ 连续 ${B} 场返回空结果,疑似被软降级 — 暂停 ${de.emptyCooldownMs/6e4} 分钟`,!0),await Xe(de.emptyCooldownMs),B=0)):B=0}catch(x){const M=kn(x,`${Qe}/GetSwimmerMeetTimes/${t}/${_.meetId}`);await ks(t,_,[],"failed",M),y++,h.push(`${_.meetName||_.meetId}: ${x.message}`),x.retryable&&(v++,v>=de.cooldownAfterConsecutive&&(r(`⚠ 连续 ${v} 场可重试失败,疑似被限流 — 全局暂停 ${de.cooldownMs/6e4} 分钟`,!0),await Xe(de.cooldownMs),v=0))}f+1<c.length&&((f+1)%de.batchSize===0?(r(`⏸ 已处理 ${f+1}/${c.length} 场,中场休息 ${de.batchPauseMs/6e4} 分钟(保护 API 配额)...`),await Xe(de.batchPauseMs)):await Xe(de.meetGapMs))}return{fetched:u,failed:y,errors:h,bestTimes:A,meets:m}}const fi=new Date("2026-09-19T00:00:00Z");function Dn(e){const t=(e==null?void 0:e.meets)||{};if(Object.keys(t).length===0)return!1;const s=e==null?void 0:e.lastUpdated,n=s!=null&&s.toDate?s.toDate():new Date(s);return n instanceof Date&&!Number.isNaN(n.getTime())&&n<fi}async function hi(e){const t=ft().filter(n=>n.hasId);if(!e)return t;const s=new Set;return await Promise.all(t.map(async n=>{try{let a=!1;if(!xt){const r=await pe(L(k,"swimResults",n.usaSwimmingId));if(r.exists()){const i=r.data(),d=Dn(i);a=!!(i.initialFullFetchAt||i.fullFetchComplete||d),d&&!i.initialFullFetchAt&&!i.fullFetchComplete&&xe(L(k,"swimResults",n.usaSwimmingId),{initialFullFetchAt:new Date().toISOString(),initialMeetCount:Object.keys(i.meets||{}).length,migratedLegacyInitializedAt:new Date().toISOString()},{merge:!0}).catch(l=>{console.warn(`[fetchNew] failed to backfill legacy marker for ${n.usaSwimmingId}:`,l)})}}a||s.add(n.usaSwimmingId)}catch(a){console.warn(`[fetchNew] state read failed for ${n.usaSwimmingId}; treating as new:`,a),s.add(n.usaSwimmingId)}})),t.filter(n=>s.has(n.usaSwimmingId))}async function yi(e,t){const s={initialFullFetchAt:new Date().toISOString(),initialMeetCount:t.meets.length,initialFetchedCount:t.fetched,initialFailedCount:t.failed,lastFetchSuccessAt:new Date().toISOString(),lastFetchError:null};try{await xe(L(k,"swimResults",e),s,{merge:!0})}catch(n){console.warn(`[fetchNew] failed to mark ${e} as initialized:`,n)}return s}async function gi(e,t,s={}){const{newOnly:n=!1}=s,a=await hi(n);if(a.length===0){t(n?{type:"no-new",message:"No new athletes to fetch."}:{type:"error",message:"No swimmers with USA Swimming ID found."});return}t({type:"start",total:a.length,newOnly:n});let r=0,i=0,d=0;const l=[];let A=null,m=null,c=0;for(let u=0;u<a.length;u++){const y=a[u];d=u+1,t({type:"swimmer-start",index:u,total:a.length,name:y.name,memberId:y.usaSwimmingId});let h=null;try{h=await Cn(e,y.usaSwimmingId,y.name,{force:!1,onLog:(f,_)=>t({type:"log",message:f,isError:_}),onBestTimes:f=>t({type:"step",name:y.name,step:"bestTimes",count:f.length})});let v=!1;n&&h.failed===0&&(await yi(y.usaSwimmingId,h),v=!0);const B=h.fetched>0||h.failed>0;t({type:"swimmer-done",name:y.name,memberId:y.usaSwimmingId,bestTimes:h.bestTimes.length,meets:h.meets.length,newMeets:h.fetched,failedMeets:h.failed,written:B,initialComplete:v}),h.failed>0&&l.push(...h.errors.map(f=>`${y.name}: ${f}`)),r++,c=0}catch(v){if(i++,l.push(`${y.name}: ${v.message}`),t({type:"swimmer-error",name:y.name,memberId:y.usaSwimmingId,error:v.message}),v.authError){A={name:y.name,memberId:y.usaSwimmingId,message:v.message,endpoint:v.endpoint||null},t({type:"auth-error",name:y.name,memberId:y.usaSwimmingId,message:v.message,endpoint:v.endpoint||null});break}const B=Oa(c,v);if(c=B.count,B.abort){m={count:c,threshold:de.abortAfterConsecutiveBlocked,attempted:d,total:a.length},t({type:"blocked-abort",...m});break}}t({type:"progress",index:u+1,total:a.length,success:r,failed:i}),h&&u<a.length-1&&(h.fetched>0||h.failed>0)&&(t({type:"log",message:`⏸ 运动员间冷却 ${de.swimmerGapMs/6e4} 分钟...`}),await Xe(de.swimmerGapMs))}t({type:"done",total:a.length,attempted:d,success:r,failed:i,errors:l,authError:A,blockedAbort:m,newOnly:n})}function Bi(){const e=Qt(ft()),t=e.filter(m=>m.hasId),s=e.filter(m=>!m.hasId),n=!!(Q&&Q.hasCookie),a=!!(Q&&Q.invalidAt),r=!!(Q&&Q.dev),i=!n||et,d=a||!n?"var(--color-accent)":"#16A34A",l=r?"🛠 dev — local proxy":a?"⛔ Expired — paste a new cookie":n?"✅ Saved":"⚠ Not configured",A=Q!=null&&Q.savedAt?new Date(Q.savedAt).toLocaleString():"";return`
    <div class="dash-panel" style="margin-bottom: 1.5rem;">
      <div class="dash-panel-header">
        <h3 style="margin: 0;">🔑 Data Hub Session</h3>
        <span id="session-status" style="font-size: 0.85rem; color: ${d};">${l}</span>
      </div>

      <p style="margin: var(--space-md) 0; font-size: 0.85rem; color: var(--text-muted);">
        USA Swimming now requires a signed-in session instead of API keys. The cookie lasts
        <strong>8 hours</strong> and cannot be renewed — paste a fresh one before each results run.
      </p>

      ${r?`
      <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted); border-left: 3px solid var(--border-color); padding-left: 0.6rem;">
        Development build: requests go through the Vite proxy to <code>local-tools/usas-proxy.mjs</code>,
        so there is no session to manage here.
      </p>`:`
      <div class="form-group">
        <label class="form-label">Paste the Data Hub cookie
          <span style="font-size: 0.75rem; color: var(--text-muted);">
            (F12 → Network → filter <code>api/times</code> → any request → Headers → <code>cookie:</code> → Copy value)
          </span>
        </label>
        <textarea class="form-input" id="session-cookie" rows="3" spellcheck="false"
          placeholder="bff_auth_session=..."
          style="font-family: monospace; font-size: 0.75rem; resize: vertical;"></textarea>
      </div>
      <div style="display: flex; gap: 0.75rem; margin-top: 0.75rem; align-items: center; flex-wrap: wrap;">
        <button class="btn btn-primary btn-sm" id="save-session-btn">💾 Save session</button>
        <button class="btn btn-outline btn-sm" id="verify-session-btn">🔍 Test connection</button>
        ${A?`<span style="font-size: 0.8rem; color: var(--text-muted);">saved ${g(A)}</span>`:""}
      </div>
      <p id="session-message" style="margin-top: 0.5rem; font-size: 0.85rem;"></p>`}
    </div>

    <div class="dash-panel" style="margin-bottom: 1.5rem;">
      <div class="dash-panel-header">
        <h3 style="margin: 0;">🔄 Fetch Swim Times</h3>
        <span id="fetch-status" style="font-size: 0.85rem;">${n?"Ready":"⏸ Paused"}</span>
      </div>
      <p style="color: var(--text-muted); margin: var(--space-md) 0; font-size: 0.9rem;">
        Incremental fetch checks <strong>${t.length}</strong> athlete(s) with USA Swimming IDs.
        New athletes get their full meet history; previously fetched meets are skipped.
      </p>
      ${n?"":`
      <p style="margin: 0 0 var(--space-md) 0; font-size: 0.85rem; color: var(--color-accent); border-left: 3px solid var(--color-accent); padding-left: 0.6rem;">
        ⏸ <strong>Paused.</strong> Save a Data Hub session above first — without one every request
        would fail before reaching USA Swimming.
      </p>`}
      <div style="display: flex; gap: 0.75rem; margin-bottom: var(--space-md); flex-wrap: wrap;">
        <button class="btn btn-primary btn-sm" id="fetch-new-btn" data-default-label="🆕 Fetch New Athletes Only" ${i?"disabled":""}>
          ${et?"⏳ Fetching...":"🆕 Fetch New Athletes Only"}
        </button>
        <button class="btn btn-outline btn-sm" id="fetch-all-btn" data-default-label="🔄 Fetch All Swimmer Results" ${i?"disabled":""}>
          ${et?"⏳ Fetching...":"🔄 Fetch All Swimmer Results"}
        </button>
      </div>
      <div id="fetch-log" style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.75rem; max-height: 350px; overflow-y: auto; font-family: monospace; font-size: 0.8rem; line-height: 1.6; display: none;">
      </div>
    </div>

    <div class="dash-panel">
      <h3 style="margin: 0 0 var(--space-md) 0;">📋 Athlete Data Status</h3>
      <div class="roster-table-wrapper" style="max-height: 400px; overflow-y: auto;">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
          <thead>
            <tr style="border-bottom: 2px solid var(--border-color); color: var(--text-muted);">
              <th style="padding: 0.6rem; text-align: left;">Name</th>
              <th style="padding: 0.6rem; text-align: left;">USA Swimming ID</th>
              <th style="padding: 0.6rem; text-align: left;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${t.map(m=>`
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 0.5rem 0.6rem; font-weight: 500;">${g(m.name)}</td>
                <td style="padding: 0.5rem 0.6rem; font-family: monospace; font-size: 0.8rem;">${g(m.usaSwimmingId)}</td>
                <td style="padding: 0.5rem 0.6rem;" id="status-${g(m.usaSwimmingId)}">
                  <span style="color: var(--text-muted);">—</span>
                </td>
              </tr>
            `).join("")}
            ${s.map(m=>`
              <tr style="border-bottom: 1px solid var(--border-color); opacity: 0.6;">
                <td style="padding: 0.5rem 0.6rem;">${g(m.name)}</td>
                <td style="padding: 0.5rem 0.6rem; color: var(--color-accent);">Not set</td>
                <td style="padding: 0.5rem 0.6rem;">⚠ Add USA Swimming ID in Profile</td>
              </tr>
            `).join("")}
            ${e.length===0?`
              <tr><td colspan="3" style="padding: 2rem; text-align: center; color: var(--text-muted);">No athlete data yet</td></tr>
            `:""}
          </tbody>
        </table>
      </div>
    </div>

    ${t.length>0?`
    <div class="dash-panel" style="margin-top: 1.5rem;">
      <h3 style="margin: 0 0 var(--space-md) 0;">📊 View Athlete Results</h3>
      <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: var(--space-md); flex-wrap: wrap;">
        <select class="form-input" id="results-athlete-select" style="max-width: 300px;">
          <option value="">— Select an athlete —</option>
          ${t.map(m=>`<option value="${g(m.usaSwimmingId)}">${g(m.name)}</option>`).join("")}
        </select>
        <button class="btn btn-outline btn-sm" id="refetch-one-btn" disabled>🔄 Refetch Selected Athlete</button>
      </div>
      <div id="results-viewer" style="display: none;">
        <div id="results-content"></div>
      </div>
    </div>
    `:""}
  `}function bi(){if(!F)return`<div class="dash-panel" style="text-align: center; padding: 3rem;">
      <p class="dash-empty">${o("dash_swimmer_results_no_usa_id")}</p>
    </div>`;const e=(F.swimmers||[]).filter(s=>!s.deleted&&s.usaSwimmingId);if(e.length===0)return`<div class="dash-panel" style="text-align: center; padding: 3rem;">
      <p class="dash-empty">${o("dash_swimmer_results_no_usa_id")}</p>
    </div>`;const t=s=>[s.firstName,s.middleName,s.lastName].filter(Boolean).join(" ");return`
    <div class="dash-panel">
      ${e.length>1?`
      <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: var(--space-md); flex-wrap: wrap;">
        <span style="font-size: 0.85rem; color: var(--text-muted);">${o("dash_swimmer_results_select_label")}</span>
        <select class="form-input" id="family-results-select" style="max-width: 300px;">
          ${e.map(s=>`<option value="${g(s.usaSwimmingId)}">${g(t(s))}</option>`).join("")}
        </select>
      </div>
      `:""}
      <div id="results-viewer" style="display: none;">
        <div id="results-content"></div>
      </div>
    </div>
  `}function vi(){const e=document.getElementById("family-results-select");e==null||e.addEventListener("change",s=>{s.target.value&&Is(s.target.value)});const t=((F==null?void 0:F.swimmers)||[]).filter(s=>!s.deleted&&s.usaSwimmingId);t.length>0&&Is(t[0].usaSwimmingId)}function Is(e){const t=((F==null?void 0:F.swimmers)||[]).filter(i=>!i.deleted&&i.usaSwimmingId),s=t.findIndex(i=>i.usaSwimmingId===e);if(s<0)return;const n=t[s],a=e,r={dob:n.dob||null,gender:n.gender||null};Ut(a,{swimmerMeta:r,showDebug:!1,onlyOkMeets:!0,texts:{loading:o("dash_swimmer_results_loading"),noData:o("dash_swimmer_results_no_data"),bestTimesEmpty:o("dash_swimmer_results_no_best_times"),meetHistoryEmpty:o("dash_swimmer_results_no_meets")}})}function Dt(e){if(e==null||e==="")return"—";const t=Number(e);if(isNaN(t))return String(e);if(t<60)return t.toFixed(2);const s=Math.floor(t/60),n=(t%60).toFixed(2);return`${s}:${n.padStart(5,"0")}`}function Nn(e){if(!e)return"";const t=e.toUpperCase();return{B:"ts-b",BB:"ts-bb",A:"ts-a",AA:"ts-aa",AAA:"ts-aaa",AAAA:"ts-aaaa"}[t]||""}function _i(e){return{LCM:"LCM (50m)",SCY:"SCY (25yd)",SCM:"SCM (25m)"}[e]||e||"—"}const Fn={FR:"Free",BK:"Back",BR:"Breast",FL:"Fly",IM:"IM"},wi=[["B","ts-b"],["BB","ts-bb"],["A","ts-a"],["AA","ts-aa"],["AAA","ts-aaa"],["AAAA","ts-aaaa"]];function $i(e){if(e==null||e==="")return null;if(typeof e=="number")return Number.isFinite(e)?e:null;const t=String(e).trim(),s=/^(\d+):(\d{2}(?:\.\d+)?)$/.exec(t);if(s)return+s[1]*60+ +s[2];const n=Number(t);return Number.isFinite(n)?n:null}function xi(e){const t={FREE:"FR",FLY:"FL",BACK:"BK",BREAST:"BR"},s=String(e||"").toUpperCase();return t[s]||s}function Rn(e,t){const s=String(e||"").trim();if(!s)return null;const n=/^(\d+)\s+([A-Za-z]{2,4})\s+([A-Za-z]{2,3})$/.exec(s),a=/^(\d+)\s+([A-Za-z]{2,4})$/.exec(s);if(!n&&!a)return null;const r=n||a,i=+r[1],d=xi(r[2]),l=n?r[3].toUpperCase():((t==null?void 0:t.courseCode)||"").toUpperCase()||null;return!Number.isFinite(i)||!d||!l?null:{distance:i,stroke:d,course:l}}function Ln(e,t){if(!e)return null;const s=new Date(e),n=new Date(t);if(isNaN(s.getTime())||isNaN(n.getTime()))return null;let a=n.getFullYear()-s.getFullYear();return(n.getMonth()<s.getMonth()||n.getMonth()===s.getMonth()&&n.getDate()<s.getDate())&&a--,a}function Si(e,t,s){if(!e||e.length===0)return null;const n=Ln(s==null?void 0:s.dob,e[e.length-1].dateTs),a=String(t||"").split(" ").pop().toUpperCase();return La({age:n,course:a,eventKey:t,gender:s==null?void 0:s.gender})}function Cs(e,t){const s=String(t||"").toUpperCase().trim(),n=[];for(const[a,r]of Object.entries(e||{})){if((r.status||(Array.isArray(r.swims)&&r.swims.length?"ok":"empty"))!=="ok"||!Array.isArray(r.swims)||r.swims.length===0)continue;const d=Pt(r);if(d==null){console.warn("[Trend] no parseable meet date for",a,r.meetDates);continue}let l=null;for(const A of r.swims){const m=Rn(A.eventCode||`${A.distance||""} ${A.strokeAbbreviation||""}`,r);if(!m||`${m.distance} ${m.stroke} ${m.course}`!==s)continue;const c=$i(A.swimTime);c!=null&&(!l||c<l.seconds)&&(l={seconds:c,course:m.course,sw:A})}l&&n.push({meetId:a,meetName:r.meetName||"",dateTs:d,dateLabel:r.meetDates||"",seconds:l.seconds,timeText:Dt(l.seconds),timeStandard:l.sw.timeStandard??null,timeDrop:l.sw.timeDrop??null,finishPosition:l.sw.finishPosition??null,sessionName:l.sw.sessionName??null,course:l.course})}return n.sort((a,r)=>a.dateTs-r.dateTs||a.meetId.localeCompare(r.meetId)),{points:n,count:n.length}}function Ei(e){const t=new Map;for(const a of Object.values(e||{})){if((a.status||(Array.isArray(a.swims)&&a.swims.length?"ok":"empty"))!=="ok"||!Array.isArray(a.swims))continue;const i=new Set;for(const d of a.swims){const l=Rn(d.eventCode||`${d.distance||""} ${d.strokeAbbreviation||""}`,a);if(!l)continue;const A=`${l.distance} ${l.stroke} ${l.course}`;if(i.has(A))continue;i.add(A);const m=t.get(A);m?m.count++:t.set(A,{distance:l.distance,stroke:l.stroke,course:l.course,count:1})}}const s={FR:0,BK:1,BR:2,FL:3,IM:4},n={SCY:0,LCM:1,SCM:2};return[...t.values()].sort((a,r)=>a.distance-r.distance||(s[a.stroke]??9)-(s[r.stroke]??9)||(n[a.course]??9)-(n[r.course]??9)).map(a=>({key:`${a.distance} ${a.stroke} ${a.course}`,label:`${a.distance} ${Fn[a.stroke]||a.stroke} · ${a.course}`,count:a.count}))}function ki(){return wi.map(([e,t])=>`
    <span style="display:inline-flex;align-items:center;gap:0.35rem;">
      <span class="trend-legend-dot ts-dot ${t}"></span>${e}
    </span>`).join("")}function Ii(e){const[t,s,n]=String(e||"").trim().split(/\s+/);return[t,Fn[s]||s,n].filter(Boolean).join(" ")}function Ds(e,t,s){const n=Si(e,t,s),a=Array.isArray(n)&&n.length>0,r=Array.isArray(e)&&e.length>0,i=r?e[e.length-1].dateTs:null,d=Ln(s==null?void 0:s.dob,i),l=d!=null?nn(d):null;let A="";return r&&!a&&(!(s!=null&&s.dob)||!(s!=null&&s.gender)||l==null?A="Add the swimmer's date of birth and gender to show time standard lines.":A=`No time standard lines: USA Swimming publishes no motivational time standards for ${Ii(t)} in the ${l} age group.`),{levelLines:n,hasLines:a,lastAge:d,ageGroup:l,note:A}}function Ns(e,t){if(!e.hasLines||e.ageGroup==null)return"";const s=t!=null&&t.gender?String(t.gender)[0].toUpperCase():"?";return`Level lines: ${e.ageGroup} · ${s}`}function Fs(e){return e.hasLines?`<div class="trend-legend">${ki()}</div>`:e.note?`<p class="trend-note">${g(e.note)}</p>`:""}function Ci(e){const t=e.timeDrop==null?"—":typeof e.timeDrop=="number"?(e.timeDrop>0?"+":"")+e.timeDrop.toFixed(2)+"s":String(e.timeDrop);return[e.meetName,`${e.dateLabel} (${e.course})`,`Time: ${e.timeText} · ${e.timeStandard||"—"}`,`Drop: ${t} · Place: ${e.finishPosition??"—"}`].join(`
`)}function Rs(e,t,s={}){var re;const{width:n=720,height:a=300,margin:r={top:14,right:44,bottom:26,left:48}}=s;if(!e||e.length===0)return'<p class="trend-empty">No swims for this event.</p>';const i=n-r.left-r.right,d=a-r.top-r.bottom,l=Math.min(...e.map(S=>S.dateTs)),A=Math.max(...e.map(S=>S.dateTs)),m=Math.max(A-l,24*3600*1e3),c=l-m*.05,u=A+m*.05,y=S=>r.left+(S-c)/(u-c)*i,h=(t||[]).map(S=>S.thresholdSeconds),v=e.map(S=>S.seconds);let B=Math.min(...v,...h),f=Math.max(...v,...h);const _=(f-B||1)*.08;B-=_,f+=_;const x=S=>r.top+(S-B)/(f-B)*d,J=(S=>{const P=Math.pow(10,Math.floor(Math.log10(S))),U=S/P;return(U<=1?1:U<=2?2:U<=5?5:10)*P})((f-B)/4),ie=[];for(let S=Math.ceil(B/J)*J;S<=f+1e-9&&(ie.push(+S.toFixed(3)),!(ie.length>=6));S+=J);const ge=ie.map(S=>{const P=x(S);return`
      <line x1="${r.left}" x2="${n-r.right}" y1="${P.toFixed(1)}" y2="${P.toFixed(1)}" stroke="var(--border-color)" stroke-opacity="0.4" stroke-width="1" />
      <text x="${r.left-6}" y="${(P+3).toFixed(1)}" text-anchor="end" font-size="10" fill="var(--text-muted)" font-family="var(--font-sans, sans-serif)">${Dt(S)}</text>`}).join("");let fe="";const Le=[];for(let S=0;S<5;S++){const P=c+(u-c)*S/4,U=new Date(P).toLocaleDateString("en-US",{month:"short",year:"2-digit"});if(S>0&&S<4&&U===fe)continue;fe=U;const se=S===0?"start":S===4?"end":"middle";Le.push(`<text x="${y(P).toFixed(1)}" y="${a-8}" text-anchor="${se}" font-size="10" fill="var(--text-muted)" font-family="var(--font-sans, sans-serif)">${U}</text>`)}const Ue=e.length>=2?`<polyline points="${e.map(S=>`${y(S.dateTs).toFixed(1)},${x(S.seconds).toFixed(1)}`).join(" ")}" fill="none" stroke="var(--color-secondary)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />`:"",he=new Map;e.forEach(S=>{const P=he.get(S.dateTs)||[];P.push(S),he.set(S.dateTs,P)});const Se=[];for(const[S,P]of he)P.forEach((U,se)=>{let Ee=y(S);P.length>1&&(Ee+=(se-(P.length-1)/2)*6);const Me=U.timeStandard?String(U.timeStandard).toUpperCase():"",Ke=`ts-dot ${Nn(Me)||"ts-none"}`,w=Me==="AAAA"?5.5:4.5,T=g(Ci(U));Se.push(`
        <circle class="${Ke}" cx="${Ee.toFixed(1)}" cy="${x(U.seconds).toFixed(1)}" r="${w}" />
        <circle cx="${Ee.toFixed(1)}" cy="${x(U.seconds).toFixed(1)}" r="10" fill="transparent" style="cursor:pointer;">
          <title>${T}</title>
        </circle>`)});let te="";if(Array.isArray(t)&&t.length>0){const S=[...t].sort((U,se)=>U.thresholdSeconds-se.thresholdSeconds);let P=null;for(const U of S){const se=x(U.thresholdSeconds);P!=null&&(te+=`<rect x="${r.left}" y="${se.toFixed(1)}" width="${i}" height="${(P-se).toFixed(1)}" fill="${U.color}" fill-opacity="0.06" />`),te+=`
        <line x1="${r.left}" x2="${n-r.right}" y1="${se.toFixed(1)}" y2="${se.toFixed(1)}" stroke="${U.color}" stroke-width="1.2" stroke-dasharray="5 4" />
        <text x="${n-r.right-4}" y="${(se+3).toFixed(1)}" text-anchor="end" font-size="9" fill="var(--text-muted)" font-family="var(--font-sans, sans-serif)">${g(String(U.level))}</text>`,P=se}}return`
    <svg class="trend-chart-svg" viewBox="0 0 ${n} ${a}" width="${n}" height="${a}" role="img" aria-label="Swim time trend chart for ${g(String(((re=e[0])==null?void 0:re.course)||""))}">
      <text x="${r.left}" y="${r.top-4}" font-size="9" fill="var(--text-muted)" font-family="var(--font-sans, sans-serif)">faster ↑</text>
      ${te}
      ${ge}
      ${Ue}
      ${Se}
      ${Le}
    </svg>`}function Pt(e){const t=e.meetDates||"",s=/^(\d{4})-(\d{2})-(\d{2})/.exec(t);if(s)return new Date(+s[1],+s[2]-1,+s[3]).getTime();const n=/^([A-Za-z]{3}) (\d{1,2})/.exec(t),a=/^(\d{4})\s*[/-]\s*(\d{4})/.exec(e.season||"");if(!n||!a)return null;const i={Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12}[n[1]];if(!i)return null;const d=+a[1],l=+a[2],A=i>=9?d:l;return new Date(A,i-1,+n[2]).getTime()}function Di(e){const t={};for(const[n,a]of Object.entries(e)){const r=a.season||"Unknown";t[r]||(t[r]=[]),t[r].push({meetId:n,...a})}const s={};for(const n of Object.keys(t).sort().reverse())s[n]=t[n].sort((a,r)=>{const i=Pt(a),d=Pt(r);return i!=null&&d!=null?d-i:(r.meetDates||"").localeCompare(a.meetDates||"")});return s}function Ni(e){const t={};for(const[s,n]of Object.entries(e||{}))(n.status||(Array.isArray(n.swims)&&n.swims.length?"ok":"empty"))==="ok"&&(t[s]=n);return t}function Fi(e,t="No best times recorded."){return!e||e.length===0?`<p style="color:var(--text-muted);text-align:center;padding:1rem;">${g(t)}</p>`:`
    <div class="roster-table-wrapper" style="max-height: 400px; overflow-y: auto;">
      <table style="width:100%;border-collapse:collapse;font-size:0.85rem;">
        <thead>
          <tr style="border-bottom:2px solid var(--border-color);color:var(--text-muted);">
            <th style="padding:0.5rem;text-align:left;">Event</th>
            <th style="padding:0.5rem;text-align:left;">Best Time</th>
            <th style="padding:0.5rem;text-align:left;">Course</th>
          </tr>
        </thead>
        <tbody>
          ${[...e].sort((n,a)=>n.strokeAbbreviation!==a.strokeAbbreviation?(n.strokeAbbreviation||"").localeCompare(a.strokeAbbreviation||""):(n.distance||0)-(a.distance||0)).map(n=>`
            <tr style="border-bottom:1px solid var(--border-color);">
              <td style="padding:0.4rem 0.5rem;">${n.distance||""} ${n.strokeName||n.stroke||n.strokeAbbreviation||""}</td>
              <td style="padding:0.4rem 0.5rem;font-weight:600;font-family:monospace;">${Dt(n.swimTime??n.bestTime)}</td>
              <td style="padding:0.4rem 0.5rem;">${_i(n.courseCode)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `}function Ri(e,t="No meet history recorded."){if(!e||Object.keys(e).length===0)return`<p style="color:var(--text-muted);text-align:center;padding:1rem;">${g(t)}</p>`;const s=Di(e);let n="";for(const[a,r]of Object.entries(s)){const i=`season-${a.replace(/[^a-zA-Z0-9]/g,"-")}`;n+=`
      <div style="margin-bottom: 0.75rem;">
        <button class="btn btn-outline btn-sm season-toggle" data-season="${g(i)}"
                style="width:100%;text-align:left;font-weight:600;display:flex;justify-content:space-between;align-items:center;">
          <span>📅 ${g(a)} Season (${r.length} meet${r.length>1?"s":""})</span>
          <span class="season-arrow" id="arrow-${g(i)}">▶</span>
        </button>
        <div class="season-meets" id="${g(i)}" style="display:none;margin-top:0.5rem;">
          ${r.map(d=>{var A,m;const l=`meet-${d.meetId}`;return`
              <div style="margin-bottom:0.5rem;border:1px solid var(--border-color);border-radius:var(--radius-sm);overflow:hidden;">
                <button class="btn btn-outline btn-sm meet-toggle" data-meet="${g(l)}"
                        style="width:100%;text-align:left;display:flex;justify-content:space-between;align-items:center;padding:0.5rem 0.75rem;border:none;border-radius:0;">
                  <span>🏁 ${g(d.meetName)} <span style="color:var(--text-muted);font-size:0.8rem;">${g(d.courseCode||"")}</span></span>
                  <span style="font-size:0.75rem;color:var(--text-muted);">
                    ${g(d.meetDates||"")} · ${((A=d.swims)==null?void 0:A.length)||0} swim${(((m=d.swims)==null?void 0:m.length)||0)!==1?"s":""}
                    <span class="meet-arrow" id="m-arrow-${g(l)}">▶</span>
                  </span>
                </button>
                <div class="meet-swims" id="${g(l)}" style="display:none;">
                  ${d.swims&&d.swims.length>0?`
                    <table style="width:100%;border-collapse:collapse;font-size:0.8rem;">
                      <thead>
                        <tr style="border-bottom:1px solid var(--border-color);color:var(--text-muted);background:var(--bg-secondary);">
                          <th style="padding:0.35rem 0.5rem;text-align:left;">Event</th>
                          <th style="padding:0.35rem 0.5rem;text-align:left;">Time</th>
                          <th style="padding:0.35rem 0.5rem;text-align:left;">Session</th>
                          <th style="padding:0.35rem 0.5rem;text-align:left;">Place</th>
                          <th style="padding:0.35rem 0.5rem;text-align:left;">Standard</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${d.swims.map(c=>`
                          <tr style="border-bottom:1px solid var(--border-color);">
                            <td style="padding:0.3rem 0.5rem;">${c.eventCode||`${c.distance||""} ${c.strokeAbbreviation||""}`}</td>
                            <td style="padding:0.3rem 0.5rem;font-family:monospace;font-weight:500;">${Dt(c.swimTime)}</td>
                            <td style="padding:0.3rem 0.5rem;">${c.sessionName||"—"}</td>
                            <td style="padding:0.3rem 0.5rem;">${c.finishPosition!=null?c.finishPosition:"—"}</td>
                            <td style="padding:0.3rem 0.5rem;">
                              ${c.timeStandard?`<span class="ts-badge ${Nn(c.timeStandard)}">${g(c.timeStandard)}</span>`:"—"}
                            </td>
                          </tr>
                        `).join("")}
                      </tbody>
                    </table>
                  `:'<p style="padding:0.5rem;color:var(--text-muted);font-size:0.8rem;">No swim data for this meet.</p>'}
                </div>
              </div>
            `}).join("")}
        </div>
      </div>
    `}return n}async function Ut(e,t={}){var A,m;const{swimmerMeta:s=null,showDebug:n=!0,onlyOkMeets:a=!1,texts:r={}}=t,i={loading:r.loading||"⏳ Loading...",noData:r.noData||"No results data yet. Run a fetch first.",bestTimesEmpty:r.bestTimesEmpty||"No best times recorded.",meetHistoryEmpty:r.meetHistoryEmpty||"No meet history recorded."},d=document.getElementById("results-viewer"),l=document.getElementById("results-content");if(!(!d||!l)){d.style.display="block",l.innerHTML=`<p style="text-align:center;padding:2rem;color:var(--text-muted);">${i.loading}</p>`;try{let c;if(!xt){const B=await pe(L(k,"swimResults",e));if(!B.exists()){l.innerHTML=`<p style="text-align:center;padding:2rem;color:var(--text-muted);">${i.noData}</p>`;return}c=B.data()}console.log("[Results] Loaded data for",e,":",c),console.log("[Results] bestTimes:",(A=c.bestTimes)==null?void 0:A.length,"meets:",Object.keys(c.meets||{}).length);const u=Ei(c.meets),y=s||(xt?ai.find(B=>B.usaSwimmingId===e)||null:ft().find(B=>B.usaSwimmingId===e)||null);let h="";if(u.length>0){const B=[...u].sort((x,M)=>M.count-x.count)[0].key,f=Cs(c.meets,B),_=Ds(f.points,B,y);h=`
      <div style="margin-top:1.5rem;">
        <h4 style="margin:0 0 0.75rem 0;">📈 Performance Trend</h4>
        <div style="display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap;margin-bottom:0.5rem;">
          <select id="trend-event-select" class="form-input" style="max-width:260px;">
            ${u.map(x=>`<option value="${g(x.key)}" ${x.key===B?"selected":""}>${g(x.label)} (${x.count})</option>`).join("")}
          </select>
          <span id="trend-event-count" style="font-size:0.8rem;color:var(--text-muted);">${f.count} swim${f.count===1?"":"s"}</span>
          <span id="trend-level-caption" style="font-size:0.8rem;color:var(--text-muted);margin-left:auto;">${g(Ns(_,y))}</span>
        </div>
        <div id="trend-legend-slot">${Fs(_)}</div>
        <div class="trend-chart" id="trend-chart">${Rs(f.points,_.levelLines)}</div>
      </div>`}const v=a?Ni(c.meets):c.meets||{};l.innerHTML=`
      <div style="margin-bottom:1.5rem;">
        <h4 style="margin:0 0 0.75rem 0;display:flex;align-items:center;gap:0.5rem;">
          🏆 Best Times (${(c.bestTimes||[]).length} entries)
          <span style="font-size:0.75rem;color:var(--text-muted);font-weight:400;">
            Last updated: ${c.lastUpdated?new Date(c.lastUpdated).toLocaleString():"—"}
          </span>
        </h4>
        ${Fi(c.bestTimes,i.bestTimesEmpty)}
      </div>

      <div>
        <h4 style="margin:0 0 0.75rem 0;">📅 Meet History (${Object.keys(v).length} meets)</h4>
        <div id="meet-history-container">
          ${Ri(v,i.meetHistoryEmpty)}
        </div>
      </div>

      ${h}

      ${n?`
      <details style="margin-top:1.5rem;border-top:1px solid var(--border-color);padding-top:1rem;">
        <summary style="cursor:pointer;color:var(--text-muted);font-size:0.8rem;">🔍 Debug: Raw JSON</summary>
        <pre style="background:var(--bg-primary);border:1px solid var(--border-color);border-radius:var(--radius-sm);padding:0.75rem;max-height:400px;overflow:auto;font-size:0.7rem;line-height:1.4;margin-top:0.5rem;">${g(JSON.stringify(c,null,2))}</pre>
      </details>
      `:""}
    `,l.querySelectorAll(".season-toggle").forEach(B=>{B.addEventListener("click",()=>{const f=B.dataset.season,_=document.getElementById(f),x=document.getElementById("arrow-"+f);if(!_)return;const M=_.style.display!=="none";_.style.display=M?"none":"block",x&&(x.textContent=M?"▶":"▼")})}),l.querySelectorAll(".meet-toggle").forEach(B=>{B.addEventListener("click",()=>{const f=B.dataset.meet,_=document.getElementById(f),x=document.getElementById("m-arrow-"+f);if(!_)return;const M=_.style.display!=="none";_.style.display=M?"none":"block",x&&(x.textContent=M?"▶":"▼")})}),(m=document.getElementById("trend-event-select"))==null||m.addEventListener("change",B=>{const f=document.getElementById("trend-chart"),_=document.getElementById("trend-event-count"),x=document.getElementById("trend-legend-slot"),M=document.getElementById("trend-level-caption");if(!f)return;const J=Cs(c.meets,B.target.value),ie=Ds(J.points,B.target.value,y);f.innerHTML=Rs(J.points,ie.levelLines),x&&(x.innerHTML=Fs(ie)),M&&(M.textContent=Ns(ie,y)),_&&(_.textContent=`${J.count} swim${J.count===1?"":"s"}`)})}catch(c){l.innerHTML=`<p style="text-align:center;padding:2rem;color:var(--color-accent);">Failed to load results: ${g(c.message)}</p>`,console.error("loadAthleteResults:",c)}}}function Mt(){var y;const e=Ct(),t=Vo(),s=Wo(),n=Wn(s),a=Xn(s),r=new Map(s.map(h=>[h.regId,h.audit])),i=new Date,d=ve.filter(h=>Pe(h)===I),l=d.map(h=>({meet:h,disp:ms(h,i)})).filter(h=>h.disp.bucket==="upcoming").sort((h,v)=>String(h.meet.startDate||h.meet.date||"").localeCompare(String(v.meet.startDate||v.meet.date||""))),A=((y=l[0])==null?void 0:y.meet)||null,m=A?`${g(A.name||"")} · ${g(A.startDate||A.date||"")}`:"",c=d.filter(h=>!h.feeData||!Array.isArray(h.feeData.swimmers)||h.feeData.swimmers.length===0).sort((h,v)=>String(h.startDate||h.date||"").localeCompare(String(v.startDate||v.date||""))),u=t.slice(0,5).map(h=>({r:h,when:ti(h.createdAt),kids:si(h),miss:r.get(h.id)}));return`
    <p class="dash-overview-meta">${g(o("dash_coach_overview_meta",{season:I}))}</p>

    <div class="dash-stats-row">
      <div class="dash-stat-card">
        <div class="dash-stat-number">${e.length}</div>
        <div class="dash-stat-label">${o("dash_coach_active_athletes")}</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${t.length}</div>
        <div class="dash-stat-label">${o("dash_coach_new_registrations")}</div>
      </div>
      <div class="dash-stat-card accent">
        <div class="dash-stat-number">${l.length}</div>
        <div class="dash-stat-label">${o("dash_coach_upcoming_meets")}</div>
        ${A?`<div class="dash-stat-sub">${o("dash_coach_next_meet")}: ${m}</div>`:""}
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${oe.length}</div>
        <div class="dash-stat-label">${o("dash_coach_registered_families")}</div>
      </div>
    </div>

    <div class="dash-overview-grid">
      <div class="dash-panel dash-panel--wide">
        <h3 class="dash-panel-title">${o("dash_coach_needs_attention")}${s.length?` (${s.length})`:""}</h3>
        <div class="dash-panel-body">
          ${s.length===0?`<p class="dash-empty">${o("dash_coach_needs_attention_empty")}</p>`:`
          <p class="dash-attn-summary">${o("dash_attn_summary",{required:n.required,conflicts:n.conflicts,optional:n.optional})}</p>
          ${a.visible.map(h=>`
            <div class="dash-mini-card">
              <div class="dash-mini-top">
                <span class="dash-mini-name">${g(h.name)}</span>
              </div>
              ${Lt("dash_attn_required","required",h.audit.required,Zo)}
              ${Lt("dash_attn_conflicts","conflicts",h.audit.conflicts,ei)}
              ${Lt("dash_attn_optional","optional",h.audit.optionalGaps,Qo)}
            </div>
          `).join("")+(a.hiddenOptionalCount>0?`<p class="dash-empty">${o("dash_attn_more_optional",{n:a.hiddenOptionalCount})}</p>`:"")}
          `}
        </div>
      </div>
      <div class="dash-panel">
        <h3 class="dash-panel-title">${o("dash_coach_meets_needing_fees")}${c.length?` (${c.length})`:""}</h3>
        <div class="dash-panel-body">
          ${c.length===0?`<p class="dash-empty">${o("dash_coach_meets_needing_fees_empty")}</p>`:c.slice(0,5).map(h=>`
            <div class="dash-mini-card">
              <div class="dash-mini-top">
                <span class="dash-mini-name">${g(h.name||"Unnamed Meet")}</span>
                <span class="dash-mini-when">${g(h.startDate||h.date||"")}</span>
              </div>
              <div class="dash-mini-meta">${g(h.location||"")}</div>
            </div>
          `).join("")+(c.length>5?`<p class="dash-empty">+${c.length-5} …</p>`:"")}
        </div>
      </div>
      <div class="dash-panel">
        <h3 class="dash-panel-title">${o("dash_coach_recent_registrations")}</h3>
        <div class="dash-panel-body">
          ${t.length===0?`<p class="dash-empty">${o("dash_coach_no_recent")}</p>`:u.map(({r:h,when:v,kids:B,miss:f})=>`
            <div class="dash-mini-card">
              <div class="dash-mini-top">
                <span class="dash-mini-name">${rs(h)}</span>
                ${v?`<span class="dash-mini-when">${g(v)}</span>`:""}
              </div>
              <div class="dash-mini-meta">${g(B||"—")}${f?` · <span class="dash-mini-missing">⚠ ${o("dash_attn_needs_info")}</span>`:""}</div>
            </div>
          `).join("")}
        </div>
      </div>

    </div>
  `}function Li(){const e=Qt(Ct()),t=ee==="admin",s=t?`<tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
        <th style="padding: 0.5rem;">${o("dash_coach_roster_name")}</th>
        <th style="padding: 0.5rem;">${o("dash_coach_roster_age")}</th>
        <th style="padding: 0.5rem;">${o("dash_coach_roster_gender")}</th>
        <th style="padding: 0.5rem;">${o("dash_coach_roster_pmt1_amt")}</th>
        <th style="padding: 0.5rem;">${o("dash_coach_roster_pmt1_date")}</th>
        <th style="padding: 0.5rem;">${o("dash_coach_roster_pmt2_amt")}</th>
        <th style="padding: 0.5rem;">${o("dash_coach_roster_pmt2_date")}</th>
        <th style="padding: 0.5rem;">${o("dash_coach_roster_pmt3_amt")}</th>
        <th style="padding: 0.5rem;">${o("dash_coach_roster_pmt3_date")}</th>
      </tr>`:`<tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
        <th style="padding: 1rem;">${o("dash_coach_roster_name")}</th>
        <th style="padding: 1rem;">${o("dash_coach_roster_parent")}</th>
        <th style="padding: 1rem;">${o("dash_coach_roster_age")}</th>
        <th style="padding: 1rem;">${o("dash_coach_roster_gender")}</th>
        <th style="padding: 1rem;">${o("dash_coach_roster_usa_id")}</th>
      </tr>`;function n(r,i){const l=(r.payments||{})[I]||{};return l[i]!=null?l[i]:""}const a="width: 95%; padding: 0.3rem 0.35rem; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-primary); color: var(--text-primary); font-size: 0.75rem;";return`
    <div class="dash-panel">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.75rem;">
        <h3 class="dash-panel-title" style="margin-bottom: 0; border-bottom: none; padding-bottom: 0;">${o("dash_coach_roster_title")} (${e.length} athletes)</h3>
        ${Oi(I)}
      </div>
      <div class="dash-panel-body">
        ${e.length===0?`<p class="dash-empty">${o("dash_coach_no_swimmers")}</p>`:`
        <div class="roster-table-wrapper" style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.8rem; min-width: ${t?"950px":"auto"};">
          <thead>${s}</thead>
          <tbody>
            ${e.map(r=>{const i=r.dob?Math.floor((new Date-new Date(r.dob))/315576e5):"—";return t?`
                  <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 0.4rem 0.5rem; font-weight: 500; white-space: nowrap;">${[r.firstName,r.lastName].filter(Boolean).join(" ")}</td>
                    <td style="padding: 0.4rem 0.5rem;">${i}</td>
                    <td style="padding: 0.4rem 0.5rem;">${r.gender||"—"}</td>
                    <td style="padding: 0.2rem 0.3rem;">
                      <input type="number" step="0.01" min="0"
                        class="roster-pmt-input"
                        data-reg-id="${r._regId}"
                        data-swimmer-index="${r._swimmerIndex}"
                        data-field="amount1"
                        data-season="${I}"
                        value="${n(r,"amount1")}"
                        onchange="window.__updateSwimmerPayment(this)"
                        placeholder="0.00"
                        style="${a}" />
                    </td>
                    <td style="padding: 0.2rem 0.3rem;">
                      <input type="date"
                        class="roster-pmt-input"
                        data-reg-id="${r._regId}"
                        data-swimmer-index="${r._swimmerIndex}"
                        data-field="date1"
                        data-season="${I}"
                        value="${n(r,"date1")}"
                        onchange="window.__updateSwimmerPayment(this)"
                        style="${a}" />
                    </td>
                    <td style="padding: 0.2rem 0.3rem;">
                      <input type="number" step="0.01" min="0"
                        class="roster-pmt-input"
                        data-reg-id="${r._regId}"
                        data-swimmer-index="${r._swimmerIndex}"
                        data-field="amount2"
                        data-season="${I}"
                        value="${n(r,"amount2")}"
                        onchange="window.__updateSwimmerPayment(this)"
                        placeholder="0.00"
                        style="${a}" />
                    </td>
                    <td style="padding: 0.2rem 0.3rem;">
                      <input type="date"
                        class="roster-pmt-input"
                        data-reg-id="${r._regId}"
                        data-swimmer-index="${r._swimmerIndex}"
                        data-field="date2"
                        data-season="${I}"
                        value="${n(r,"date2")}"
                        onchange="window.__updateSwimmerPayment(this)"
                        style="${a}" />
                    </td>
                    <td style="padding: 0.2rem 0.3rem;">
                      <input type="number" step="0.01" min="0"
                        class="roster-pmt-input"
                        data-reg-id="${r._regId}"
                        data-swimmer-index="${r._swimmerIndex}"
                        data-field="amount3"
                        data-season="${I}"
                        value="${n(r,"amount3")}"
                        onchange="window.__updateSwimmerPayment(this)"
                        placeholder="0.00"
                        style="${a}" />
                    </td>
                    <td style="padding: 0.2rem 0.3rem;">
                      <input type="date"
                        class="roster-pmt-input"
                        data-reg-id="${r._regId}"
                        data-swimmer-index="${r._swimmerIndex}"
                        data-field="date3"
                        data-season="${I}"
                        value="${n(r,"date3")}"
                        onchange="window.__updateSwimmerPayment(this)"
                        style="${a}" />
                    </td>
                  </tr>
                `:`
                  <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 1rem; font-weight: 500;">${[r.firstName,r.lastName].filter(Boolean).join(" ")}</td>
                    <td style="padding: 1rem;">${r.parentName}</td>
                    <td style="padding: 1rem;">${i}</td>
                    <td style="padding: 1rem;">${r.gender||"—"}</td>
                    <td style="padding: 1rem;">${r.usaSwimmingId||"—"}</td>
                  </tr>
                `}).join("")}
          </tbody>
        </table>
        </div>
        ${t?`<p class="roster-payment-note">${o("dash_coach_roster_payment_note")}</p>`:""}
        `}
      </div>
    </div>
  `}function Mn(e){const t=ze,s=d=>(Number(d.balance)||0)+(Number(d.deposit1Amount)||0)+(Number(d.deposit2Amount)||0)+(Number(d.deposit3Amount)||0),n=new Map;for(const d of ve){if(Pe(d)!==e)continue;const l=d.feeData;if(!(!l||!l.swimmers||l.swimmers.length===0))for(const A of l.swimmers){const m=t(A.name);if(!m)continue;const c=n.get(m),u=Number(A.total)||0;c?(c.totalFee+=u,c.meetCount+=1,c.meets.push({meetName:d.name||"Unnamed Meet",total:u}),A.name.trim().length>c.displayName.length&&(c.displayName=A.name.trim())):n.set(m,{displayName:A.name.trim(),totalFee:u,meetCount:1,meets:[{meetName:d.name||"Unnamed Meet",total:u}]})}}const a=new Map;for(const d of He){if(d.season!==e)continue;const l=t(d.swimmerName);l&&a.set(l,{id:d.id,total:s(d)})}const r=[];for(const[d,l]of n){const A=a.get(d)||{id:null,total:0};r.push({normalizedName:d,displayName:l.displayName,totalFee:l.totalFee,deposit:A.total,depositId:A.id,balance:A.total-l.totalFee,meetCount:l.meetCount,meets:l.meets}),a.delete(d)}for(const[d,l]of a){const A=He.find(m=>t(m.swimmerName)===d&&m.season===e);r.push({normalizedName:d,displayName:A?A.swimmerName:d,totalFee:0,deposit:l.total,depositId:l.id,balance:l.total,meetCount:0,meets:[]})}const i=mn(oe);return r.sort((d,l)=>un(d.displayName,l.displayName,i)),r}function Mi(){const e=Mn(I),t=e.reduce((i,d)=>i+d.totalFee,0),s=e.reduce((i,d)=>i+d.deposit,0),n=e.filter(i=>i.balance<0).length,a=i=>at(i),r=e.length>0;return`
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem;">
      ${Kn(I)}
      <a class="btn btn-outline btn-sm" id="goto-deposits-link" style="text-decoration: none;">🏦 Manage Deposits</a>
      <button class="btn btn-outline btn-sm" id="fee-summary-export-btn">📥 Export CSV</button>
    </div>

    <div class="dash-stats-row fee-summary-stats">
      <div class="dash-stat-card">
        <div class="dash-stat-number">${e.length}</div>
        <div class="dash-stat-label">${o("dash_fee_summary_total_swimmers")}</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${a(t)}</div>
        <div class="dash-stat-label">${o("dash_fee_summary_total_fees")}</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${a(s)}</div>
        <div class="dash-stat-label">${o("dash_fee_summary_total_deposits")}</div>
      </div>
      <div class="dash-stat-card ${n>0?"accent":""}">
        <div class="dash-stat-number" style="${n>0?"color: var(--color-accent);":""}">${n}</div>
        <div class="dash-stat-label">${o("dash_fee_summary_negative_count")}</div>
      </div>
    </div>

    ${r?`
      <div class="dash-panel">
        <div class="fee-summary-table-wrapper">
          <table class="fee-summary-table">
            <thead>
              <tr>
                <th style="width: 28px;"></th>
                <th>${o("dash_fee_summary_name")}</th>
                <th>${o("dash_fee_summary_deposit")}</th>
                <th>${o("dash_fee_summary_total_fee")}</th>
                <th>${o("dash_fee_summary_meets")}</th>
                <th>${o("dash_fee_summary_balance")}</th>
              </tr>
            </thead>
            <tbody>
              ${e.map((i,d)=>`
                <tr class="fee-summary-main-row fee-summary-row ${i.balance<0?"fee-summary-negative":""}"
                    data-fee-index="${d}" ${i.meets&&i.meets.length>0?'title="Click to see meet details"':""}>
                  <td><span class="fee-summary-expand-icon">${i.meets&&i.meets.length>0?"▶":""}</span></td>
                  <td class="fee-summary-name">${g(i.displayName)}</td>
                  <td>${a(i.deposit)}</td>
                  <td>${a(i.totalFee)}</td>
                  <td>${i.meetCount}</td>
                  <td class="fee-summary-balance" style="font-weight: 700; ${i.balance<0?"color: var(--color-accent);":"color: #16A34A;"}">${a(i.balance)}</td>
                </tr>
                ${i.meets&&i.meets.length>0?`
                <tr class="fee-summary-detail-row" data-fee-detail="${d}">
                  <td colspan="6" class="fee-summary-detail-cell">
                    <table class="fee-summary-mini-table">
                      ${i.meets.map(l=>`
                        <tr>
                          <td class="mini-meet-name">${g(l.meetName)}</td>
                          <td class="mini-meet-fee">${a(l.total)}</td>
                        </tr>
                      `).join("")}
                      <tr class="mini-meet-total">
                        <td>${o("dash_fee_summary_total_fee")}</td>
                        <td class="mini-meet-fee">${a(i.totalFee)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                `:""}
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `:`
      <div class="dash-panel" style="text-align: center; padding: 3rem 2rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">📊</div>
        <p style="color: var(--text-secondary); max-width: 500px; margin: 0 auto;">${o("dash_fee_summary_no_fees")}</p>
      </div>
    `}
  `}function Tn(e){const t=mn(oe);return He.filter(s=>s.season===e).sort((s,n)=>un(s.swimmerName,n.swimmerName,t))}function jn(e){return(Number(e.balance)||0)+(Number(e.deposit1Amount)||0)+(Number(e.deposit2Amount)||0)+(Number(e.deposit3Amount)||0)}function Ti(){const e=Tn(I),t=a=>a!=null?at(a):"—",s=a=>a||"—",n=e.length>0;return`
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem;">
      ${ji(I)}
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <button class="btn btn-outline btn-sm" id="deposits-upload-balance-btn">📤 Upload Carry-over Balance</button>
        <button class="btn btn-outline btn-sm" id="deposits-upload-detail-btn">📤 Upload Deposits</button>
        <button class="btn btn-outline btn-sm" id="deposits-export-btn">📥 Export CSV</button>
      </div>
    </div>

    ${n?`
      <div class="dash-panel">
        <div class="deposits-table-wrapper">
          <table class="deposits-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Balance</th>
                <th>Deposit 1</th>
                <th>Date 1</th>
                <th>Deposit 2</th>
                <th>Date 2</th>
                <th>Deposit 3</th>
                <th>Date 3</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${e.map(a=>{const r=jn(a);return`
                <tr id="${"dep-row-"+a.id}" class="deposits-row">
                  <td class="deposits-name">${g(a.swimmerName)}</td>
                  <td class="deposits-balance">
                    <span class="dep-view">${t(a.balance)}</span>
                    <input class="dep-edit-field dep-input" type="number" value="${a.balance||0}" step="0.01" style="display:none; width: 90px;" />
                  </td>
                  <td class="deposits-d1amt">
                    <span class="dep-view">${t(a.deposit1Amount)}</span>
                    <input class="dep-edit-field dep-input" type="number" value="${a.deposit1Amount||""}" step="0.01" style="display:none; width: 90px;" />
                  </td>
                  <td class="deposits-d1date">
                    <span class="dep-view">${s(a.deposit1Date)}</span>
                    <input class="dep-edit-field dep-input" type="date" value="${a.deposit1Date||""}" style="display:none; width: 130px;" />
                  </td>
                  <td class="deposits-d2amt">
                    <span class="dep-view">${t(a.deposit2Amount)}</span>
                    <input class="dep-edit-field dep-input" type="number" value="${a.deposit2Amount||""}" step="0.01" style="display:none; width: 90px;" />
                  </td>
                  <td class="deposits-d2date">
                    <span class="dep-view">${s(a.deposit2Date)}</span>
                    <input class="dep-edit-field dep-input" type="date" value="${a.deposit2Date||""}" style="display:none; width: 130px;" />
                  </td>
                  <td class="deposits-d3amt">
                    <span class="dep-view">${t(a.deposit3Amount)}</span>
                    <input class="dep-edit-field dep-input" type="number" value="${a.deposit3Amount||""}" step="0.01" style="display:none; width: 90px;" />
                  </td>
                  <td class="deposits-d3date">
                    <span class="dep-view">${s(a.deposit3Date)}</span>
                    <input class="dep-edit-field dep-input" type="date" value="${a.deposit3Date||""}" style="display:none; width: 130px;" />
                  </td>
                  <td class="deposits-total" style="font-weight: 700;">${t(r)}</td>
                  <td class="deposits-actions">
                    <button class="deposits-edit-btn" data-id="${a.id}">✎</button>
                    <button class="deposits-save-btn" data-id="${a.id}" style="display:none;">✓</button>
                    <button class="deposits-cancel-btn" data-id="${a.id}" style="display:none;">✕</button>
                    <button class="deposits-delete-btn" data-id="${a.id}" data-name="${g(a.swimmerName)}" style="color: var(--color-accent);">&times;</button>
                  </td>
                </tr>`}).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `:`
      <div class="dash-panel" style="text-align: center; padding: 3rem 2rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🏦</div>
        <p style="color: var(--text-secondary);">
          No deposit records for ${g(I)}.<br>
          Upload an Excel file or add swimmers below.
        </p>
      </div>
    `}

    <div style="margin-top: 1.5rem;">
      <button class="btn btn-primary btn-sm" id="deposits-add-btn">+ Add Swimmer</button>
    </div>

    <div id="deposits-add-form" class="dash-panel" style="display: none; margin-top: 1rem; padding: 1.5rem;">
      <h3 style="margin-bottom: 1rem;">Add Swimmer Deposit Record</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 1rem; align-items: end;">
        <div class="form-group">
          <label class="form-label">Swimmer Name</label>
          <input type="text" id="deposits-add-name" class="form-input" placeholder="Swimmer name" />
        </div>
        <div class="form-group">
          <label class="form-label">Carry-over Balance ($)</label>
          <input type="number" id="deposits-add-balance" class="form-input" value="0" min="0" step="0.01" />
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-primary btn-sm" id="deposits-add-save">Save</button>
          <button class="btn btn-outline btn-sm" id="deposits-add-cancel">Cancel</button>
        </div>
      </div>
    </div>
  `}function ji(e){const t=yt(),s=e||I||ht();return`
    <div class="season-selector">
      <label class="season-selector-label">${o("dash_season_label")}:</label>
      <select id="deposits-season-select" class="season-select">
        ${t.map(n=>`<option value="${n}" ${n===s?"selected":""}>${n}</option>`).join("")}
      </select>
    </div>
  `}function Oi(e){const t=yt(),s=e||I||ht();return`
    <div class="season-selector">
      <label class="season-selector-label">${o("dash_season_label")}:</label>
      <select id="roster-season-select" class="season-select">
        ${t.map(n=>`<option value="${n}" ${n===s?"selected":""}>${n}</option>`).join("")}
      </select>
    </div>
  `}function Ls(e){switch(e){case"no-data-rows":return o("dash_fee_import_no_data_rows");case"need-name-balance":return o("dash_fee_import_need_name_balance");case"need-name-amount":return o("dash_fee_import_need_name_amount");default:return o("dash_fee_summary_deposit_parse_error")}}function at(e){const t=Number(e)||0;return(t<0?"-$":"$")+Math.abs(t).toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2})}function On(e){if(!e||e.length===0)return"";const t=e.map(s=>`<code>${g(s.field)}</code> ← ${g(s.letter)} ("${g(s.label)}")`);return`<p class="csv-import-summary">${o("dash_fee_import_columns_detected")}: ${t.join(" · ")}</p>`}function zi(e){const t=String(e).match(/^deposit([123])(Amount|Date)$/);return t?`D${t[1]} ${t[2]==="Amount"?"amt":"date"}`:e}async function zn(e){if(!e||e.length===0)return 0;const t={updatedAt:new Date,updatedBy:(C==null?void 0:C.email)||"unknown"},s=Vt(k);for(const n of e)n.existingId?s.update(L(k,"deposits",n.existingId),{...n.fields,...t}):s.set(L(ae(k,"deposits")),{swimmerName:n.swimmerName,season:I,balance:0,deposit1Amount:null,deposit1Date:null,deposit2Amount:null,deposit2Date:null,deposit3Amount:null,deposit3Date:null,...n.fields,...t});return await s.commit(),e.length}function qn({title:e,filename:t,validCount:s,summaryHtml:n,mappingHtml:a,tableHtml:r,errors:i,skipped:d,confirmLabel:l,confirmId:A,cancelId:m,onConfirm:c}){var v;const u=i||[],y=d||[],h=document.createElement("div");h.className="confirm-overlay",h.innerHTML=`
    <div class="confirm-modal csv-import-modal" style="max-width: 900px;">
      <h3 class="confirm-title">${g(e)}</h3>
      <p class="csv-import-filename">${o("dash_fee_summary_deposit_import_file")}: <strong>${g(t)}</strong></p>
      <p class="csv-import-summary">${o("dash_fee_summary_deposit_import_summary",{valid:s,error:u.length})}</p>
      <p class="csv-import-summary" style="color: var(--text-muted);">${o("dash_fee_import_season_note",{season:g(I)})}</p>
      ${n||""}
      ${a||""}
      ${r||""}
      ${u.length>0?`<div class="csv-error-block"><p class="csv-error-title">${o("dash_fee_summary_deposit_import_errors")}</p>${u.map(B=>`<p class="csv-error-item">${B.rowNum?`Row ${B.rowNum}: `:""}${g(B.reason)}</p>`).join("")}</div>`:""}
      ${y.length>0?`<div class="csv-error-block" style="border-color: #d97706;"><p class="csv-error-title" style="color: #d97706;">${o("dash_fee_import_skipped_title")}</p>${y.map(B=>`<p class="csv-error-item">${g(B.reason)}</p>`).join("")}</div>`:""}
      ${s===0?`<p class="csv-no-valid">${o("dash_fee_summary_deposit_import_no_valid")}</p>`:""}
      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="${m}">${o("dash_fee_summary_deposit_import_cancel")}</button>
        ${s>0?`<button class="btn btn-primary btn-sm" id="${A}">${g(l)}</button>`:""}
      </div>
    </div>`,document.body.appendChild(h),h.querySelector("#"+m).addEventListener("click",()=>h.remove()),(v=h.querySelector("#"+A))==null||v.addEventListener("click",()=>{h.remove(),c()}),h.addEventListener("click",B=>{B.target===h&&h.remove()})}const Kt=e=>o(e?"dash_fee_import_will_create":"dash_fee_import_will_update"),Hn=e=>{const t=e.filter(s=>s.willCreate).length;return`<p class="csv-import-summary">${o("dash_fee_import_plan_create_update",{create:t,update:e.length-t})}</p>`};async function qi(e){const t=window.XLSX;if(!t)return alert("Excel parser not loaded."),null;try{const s=await e.arrayBuffer(),n=t.read(new Uint8Array(s),{type:"array"}),a=n.Sheets[n.SheetNames[0]],r=t.utils.sheet_to_json(a,{header:1,defval:null});return Ua(r)}catch(s){return console.error("Error parsing carry-over Excel:",s),null}}function Hi(e,t){const s=Ka(e.valid,He,I),n=s.length>0?`
        <div class="csv-preview-wrapper" style="max-height: 350px;">
          <table class="csv-preview-table" style="font-size: 0.78rem;">
            <thead><tr>
              <th>${o("dash_fee_summary_deposit_header_name")}</th>
              <th>${o("dash_fee_import_col_will")}</th>
              <th>${o("dash_fee_import_col_before")}</th>
              <th>${o("dash_fee_summary_balance")} (${o("dash_fee_import_col_after")})</th>
            </tr></thead>
            <tbody>${s.map(a=>`<tr>
              <td>${g(a.swimmerName)}</td>
              <td>${Kt(a.willCreate)}</td>
              <td style="color: var(--text-muted);">${a.previousBalance===null?"—":at(a.previousBalance)}</td>
              <td style="font-weight: 700; ${a.balance<0?"color: var(--color-accent);":""}">${at(a.balance)}</td>
            </tr>`).join("")}</tbody>
          </table>
        </div>`:"";qn({title:o("dash_fee_import_balance_title"),filename:t,validCount:s.length,summaryHtml:Hn(s),mappingHtml:On(e.columns),tableHtml:n,errors:e.errors,skipped:[],confirmLabel:o("dash_fee_import_confirm_balance",{count:s.length}),confirmId:"carryover-import-confirm",cancelId:"carryover-import-cancel",onConfirm:()=>Pi(s)})}async function Pi(e){if(!(!e||e.length===0))try{const t=await zn(Ya(e));St(`Updated balance for ${t} swimmer(s) in ${I}.`)}catch(t){console.error("Carry-over import failed:",t),St("Failed to import: "+(t.message||""),!0)}}async function Ui(e){const t=window.XLSX;if(!t)return alert("Excel parser not loaded."),null;try{const s=await e.arrayBuffer(),n=t.read(new Uint8Array(s),{type:"array"}),a=n.Sheets[n.SheetNames[0]],r=t.utils.sheet_to_json(a,{header:1,defval:null});return Ga(r)}catch(s){return console.error("Error parsing deposit detail Excel:",s),null}}function Ki(e,t){const{rows:s,skipped:n,slotErrors:a}=Wa(e,He,I),r=e.mode==="simple",i=(e.columns||[]).filter(l=>/^deposit[123](Amount|Date)$/.test(l.field)).map(l=>l.field);let d="";s.length>0&&(r?d=`
        <div class="csv-preview-wrapper" style="max-height: 350px;">
          <table class="csv-preview-table" style="font-size: 0.78rem;">
            <thead><tr>
              <th>${o("dash_fee_summary_deposit_header_name")}</th>
              <th>${o("dash_fee_import_col_will")}</th>
              <th>${o("dash_fee_import_col_target")}</th>
              <th>${o("dash_fee_summary_deposit_header_amount")}</th>
              <th>${o("dash_fee_import_col_date")}</th>
            </tr></thead>
            <tbody>${s.map(l=>`<tr>
              <td>${g(l.swimmerName)}</td>
              <td>${Kt(l.willCreate)}</td>
              <td>${g(l.targetLabel)}</td>
              <td style="font-weight: 700;">${at(l.amount)}</td>
              <td>${l.date?g(l.date):"—"}</td>
            </tr>`).join("")}</tbody>
          </table>
        </div>`:d=`
        <div class="csv-preview-wrapper" style="max-height: 350px;">
          <table class="csv-preview-table" style="font-size: 0.75rem;">
            <thead><tr>
              <th>${o("dash_fee_summary_deposit_header_name")}</th>
              <th>${o("dash_fee_import_col_will")}</th>
              ${i.map(l=>`<th>${zi(l)}</th>`).join("")}
            </tr></thead>
            <tbody>${s.map(l=>`<tr>
              <td>${g(l.swimmerName)}</td>
              <td>${Kt(l.willCreate)}</td>
              ${i.map(A=>`<td>${l[A]==null||l[A]===""?"—":A.endsWith("Amount")?at(l[A]):g(l[A])}</td>`).join("")}
            </tr>`).join("")}</tbody>
          </table>
        </div>`),qn({title:o("dash_fee_import_deposit_title"),filename:t,validCount:s.length,summaryHtml:Hn(s),mappingHtml:On(e.columns),tableHtml:d,errors:[...e.errors||[],...a],skipped:n,confirmLabel:o("dash_fee_import_confirm_deposit",{count:s.length}),confirmId:"detail-import-confirm",cancelId:"detail-import-cancel",onConfirm:()=>Yi(e,s)})}async function Yi(e,t){if(!(!t||t.length===0))try{const s=await zn(Xa(e,t));St(`Updated deposit details for ${s} swimmer(s) in ${I}.`)}catch(s){console.error("Deposit detail import failed:",s),St("Failed to import: "+(s.message||""),!0)}}function Gi(){document.querySelectorAll(".deposits-edit-btn").forEach(e=>{e.addEventListener("click",()=>{const t=e.closest("tr");Ms(t,!0)})}),document.querySelectorAll(".deposits-save-btn").forEach(e=>{e.addEventListener("click",async()=>{const t=e.dataset.id,s=e.closest("tr");if(!t||!s)return;const n=c=>{const u=s.querySelector(c);return u?u.value:null},a=parseFloat(n(".deposits-balance .dep-edit-field"))||0,r=n(".deposits-d1amt .dep-edit-field"),i=n(".deposits-d1date .dep-edit-field"),d=n(".deposits-d2amt .dep-edit-field"),l=n(".deposits-d2date .dep-edit-field"),A=n(".deposits-d3amt .dep-edit-field"),m=n(".deposits-d3date .dep-edit-field");try{await ue(L(k,"deposits",t),{balance:a,deposit1Amount:r?parseFloat(r):null,deposit1Date:i||null,deposit2Amount:d?parseFloat(d):null,deposit2Date:l||null,deposit3Amount:A?parseFloat(A):null,deposit3Date:m||null,updatedAt:new Date,updatedBy:(C==null?void 0:C.email)||"unknown"})}catch(c){console.error("Error saving deposit:",c),alert("Failed to save deposit.")}})}),document.querySelectorAll(".deposits-cancel-btn").forEach(e=>{e.addEventListener("click",()=>{const t=e.closest("tr");Ms(t,!1)})}),document.querySelectorAll(".deposits-delete-btn").forEach(e=>{e.addEventListener("click",async()=>{const t=e.dataset.id,s=e.dataset.name;if(t&&confirm(`Delete deposit record for ${s}?`))try{await Oe(L(k,"deposits",t))}catch(n){console.error("Error deleting deposit:",n),alert("Failed to delete deposit.")}})})}function Ms(e,t){if(!e)return;const s=e.querySelectorAll(".dep-view"),n=e.querySelectorAll(".dep-edit-field"),a=e.querySelector(".deposits-edit-btn"),r=e.querySelector(".deposits-save-btn"),i=e.querySelector(".deposits-cancel-btn"),d=e.querySelector(".deposits-delete-btn");s.forEach(l=>l.style.display=t?"none":""),n.forEach(l=>l.style.display=t?"":"none"),a&&(a.style.display=t?"none":""),r&&(r.style.display=t?"":"none"),i&&(i.style.display=t?"":"none"),d&&(d.style.display=t?"none":"")}function Vi(){const e=Tn(I),t=["Name","Balance","Deposit 1 Amount","Deposit 1 Date","Deposit 2 Amount","Deposit 2 Date","Deposit 3 Amount","Deposit 3 Date","Total"],s=e.map(l=>[l.swimmerName||"",l.balance||0,l.deposit1Amount||"",l.deposit1Date||"",l.deposit2Amount||"",l.deposit2Date||"",l.deposit3Amount||"",l.deposit3Date||"",jn(l)]),n=l=>'"'+String(l).replace(/"/g,'""')+'"',a=[t.map(n).join(","),...s.map(l=>l.map(n).join(","))].join(`
`),r=new Blob([a],{type:"text/csv;charset=utf-8;"}),i=URL.createObjectURL(r),d=document.createElement("a");d.href=i,d.download=`dragon-deposits-${I}.csv`,document.body.appendChild(d),d.click(),document.body.removeChild(d),URL.revokeObjectURL(i)}function Wi(){const e=Mn(I),t=["Swimmer","Deposit","Total Meet Fee","Meets","Balance"],s=e.map(l=>[l.displayName,l.deposit,l.totalFee,l.meetCount,l.balance]),n=l=>'"'+String(l).replace(/"/g,'""')+'"',a=[t.map(n).join(","),...s.map(l=>l.map(n).join(","))].join(`
`),r=new Blob([a],{type:"text/csv;charset=utf-8;"}),i=URL.createObjectURL(r),d=document.createElement("a");d.href=i,d.download=`dragon-fee-summary-${I}.csv`,document.body.appendChild(d),d.click(),document.body.removeChild(d),URL.revokeObjectURL(i)}function Xi(){const e=ve.filter(t=>Pe(t)===I).sort((t,s)=>String(s.startDate||s.date||"").localeCompare(String(t.startDate||t.date||"")));return(!me||!e.some(t=>t.id===me))&&(me=(e.filter(s=>ms(s).bucket==="past")[0]||e[0]||{}).id||null),e}function Ji(){const e=yt(),t=I||ht();return`
    <div class="season-selector">
      <label class="season-selector-label">${o("dash_season_label")}:</label>
      <select id="volunteer-season-select" class="season-select">
        ${e.map(s=>`<option value="${s}" ${s===t?"selected":""}>${s}</option>`).join("")}
      </select>
    </div>
  `}function Ge(e){return(Number(e)||0).toLocaleString(void 0,{maximumFractionDigits:2})}function Zi(){const e=ee==="admin",t=Xi(),s=oe.length>0,n=hn({meets:ve,registrations:oe,hours:Ze,season:I,meetSeasonOf:Pe}),a=ao(n),r=n.filter(m=>m.totalHours>0),i=m=>{const c=m.kidCount===0?'<span class="vol-muted">0</span>':String(m.kidCount),u=m.kids.length?g(m.kids.join(", ")):'<span class="vol-muted">—</span>',y=m.meets.length>0,h=m.totalHours>0?"":' style="display: none;"';return`
      <tr class="fee-summary-main-row vol-summary-row${m.totalHours>0?"":" vol-zero-row"}"
          data-vol-family="${m.familyId}" ${y?'title="Click to see the per-meet breakdown"':""}${h}>
        <td><span class="fee-summary-expand-icon">${y?"▶":""}</span></td>
        <td class="fee-summary-name">${g(m.label||"—")}</td>
        <td>${c}</td>
        <td class="vol-kid-names">${u}</td>
        <td>${m.meetCount}</td>
        <td style="font-weight: 700;">${Ge(m.totalHours)}</td>
      </tr>
      ${y?`
      <tr class="fee-summary-detail-row vol-detail-row" data-vol-detail="${m.familyId}"${h}>
        <td colspan="6" class="fee-summary-detail-cell">
          <table class="fee-summary-mini-table">
            ${m.meets.map(v=>`
              <tr>
                <td class="mini-meet-name">${g(v.meetName)}${v.startDate?` <span class="vol-muted">${g(String(v.startDate))}</span>`:""}${v.note?` <span class="vol-muted">— ${g(v.note)}</span>`:""}</td>
                <td class="mini-meet-fee">${Ge(v.hours)}</td>
              </tr>
            `).join("")}
            <tr class="mini-meet-total">
              <td>${o("dash_volunteer_th_total_hours")}</td>
              <td class="mini-meet-fee">${Ge(m.totalHours)}</td>
            </tr>
          </table>
        </td>
      </tr>`:""}
    `},d=me?so({registrations:oe,hours:Ze,meetId:me}):[],l=me?no(Ze,me):0,A=m=>{const c=m.kids.length?g(m.kids.join(", ")):'<span class="vol-muted">—</span>',u=e?`<input type="number" min="0" step="0.5" inputmode="decimal"
                class="vol-input vol-hours-input" data-family-id="${m.familyId}"
                value="${m.hours==null?"":m.hours}" placeholder="0"
                aria-label="${o("dash_volunteer_th_hours")}" />`:m.hours==null?'<span class="vol-muted">—</span>':Ge(m.hours),y=e?`<input type="text" class="vol-input vol-note-input" data-family-id="${m.familyId}"
                value="${g(m.note)}" placeholder="${o("dash_volunteer_note_placeholder")}"
                aria-label="${o("dash_volunteer_th_note")}" />`:g(m.note||"—");return`
      <tr class="vol-entry-row" data-family-id="${m.familyId}"
          data-vol-search="${g(m.search)}" data-vol-entered="${m.hasRecord?"1":"0"}">
        <td class="vol-entry-family">${g(m.label||"—")}</td>
        <td class="vol-entry-kids">${c}</td>
        <td class="vol-entry-hours">${u}</td>
        <td class="vol-entry-note">${y}</td>
        <td class="vol-status" data-family-id="${m.familyId}">${m.updatedBy?g(m.updatedBy):"—"}</td>
      </tr>`};return`
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.75rem;">
      ${Ji()}
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <button class="btn btn-outline btn-sm" id="volunteer-export-btn">${o("dash_volunteer_export_summary")}</button>
        <button class="btn btn-outline btn-sm" id="volunteer-export-detail-btn">${o("dash_volunteer_export_detail")}</button>
      </div>
    </div>

    <p class="vol-intro">
      ${o("dash_volunteer_intro")}
      ${e?"":`<br><strong>${o("dash_volunteer_admin_only")}</strong>`}
    </p>

    <div class="dash-stats-row">
      <div class="dash-stat-card">
        <div class="dash-stat-number">${a.familiesWithHours}</div>
        <div class="dash-stat-label">${o("dash_volunteer_stat_families")}</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${Ge(a.totalHours)}</div>
        <div class="dash-stat-label">${o("dash_volunteer_stat_total")}</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${a.meetCount}</div>
        <div class="dash-stat-label">${o("dash_volunteer_stat_meets")}</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-number">${a.familiesWithoutHours}</div>
        <div class="dash-stat-label">${o("dash_volunteer_stat_zero")}</div>
      </div>
    </div>

    <div class="dash-panel">
      <h3 class="dash-panel-title">${o("dash_volunteer_summary_title")} — ${g(I)}</h3>
      ${s?`
        ${r.length===0?`<p class="dash-empty">${o("dash_volunteer_empty",{season:I})}</p>`:""}
        <div class="vol-summary-table-wrapper">
          <table class="fee-summary-table vol-summary-table">
            <thead>
              <tr>
                <th style="width: 28px;"></th>
                <th>${o("dash_volunteer_th_family")}</th>
                <th>${o("dash_volunteer_th_kids")}</th>
                <th>${o("dash_volunteer_th_kid_names")}</th>
                <th>${o("dash_volunteer_th_meets")}</th>
                <th>${o("dash_volunteer_th_total_hours")}</th>
              </tr>
            </thead>
            <tbody>
              ${n.map(i).join("")}
            </tbody>
          </table>
        </div>
        ${a.familiesWithoutHours>0?`
        <label class="vol-toggle">
          <input type="checkbox" id="volunteer-show-zero" />
          ${o("dash_volunteer_show_zero")} (${a.familiesWithoutHours})
        </label>`:""}`:`<p class="dash-empty">${o("dash_volunteer_no_families")}</p>`}
    </div>

    <div class="dash-panel" style="margin-top: 1.5rem;">
      <h3 class="dash-panel-title">${o("dash_volunteer_entry_title")}</h3>
      ${t.length===0?`
        <p class="dash-empty">${o("dash_volunteer_no_meets",{season:I})}</p>
      `:`
        <div class="vol-entry-toolbar">
          <div class="season-selector">
            <label class="season-selector-label">${o("dash_volunteer_meet_label")}:</label>
            <select id="volunteer-meet-select" class="season-select">
              ${t.map(m=>`
                <option value="${m.id}" ${m.id===me?"selected":""}>
                  ${g(m.name||"Unnamed Meet")}${m.startDate?` — ${g(m.startDate)}`:""}
                </option>`).join("")}
            </select>
          </div>
          <input type="search" id="volunteer-search" class="form-input vol-search"
                 placeholder="${o("dash_volunteer_search_placeholder")}" />
          <label class="vol-toggle">
            <input type="checkbox" id="volunteer-only-entered" />
            ${o("dash_volunteer_only_entered")}
          </label>
        </div>

        ${d.length===0?`<p class="dash-empty">${o("dash_volunteer_no_families")}</p>`:`
        <div class="vol-entry-table-wrapper">
          <table class="vol-entry-table">
            <thead>
              <tr>
                <th>${o("dash_volunteer_th_family")}</th>
                <th>${o("dash_volunteer_th_kid_names")}</th>
                <th style="width: 110px;">${o("dash_volunteer_th_hours")}</th>
                <th style="width: 220px;">${o("dash_volunteer_th_note")}</th>
                <th style="width: 150px;">${o("dash_volunteer_th_updated")}</th>
              </tr>
            </thead>
            <tbody>
              ${d.map(A).join("")}
            </tbody>
          </table>
        </div>
        <p class="vol-entry-footer">
          ${o("dash_volunteer_meet_total")}: <strong>${Ge(l)}</strong>
          <span id="volunteer-no-match" style="display: none; color: var(--text-muted); margin-left: 1rem;">${o("dash_volunteer_no_match")}</span>
        </p>`}
      `}
    </div>
  `}async function Qi({familyId:e,meetId:t,hours:s,note:n,statusEl:a}){if(ee!=="admin")return console.warn("Non-admin attempted to save volunteer hours — blocked"),a&&(a.textContent=o("dash_volunteer_admin_only")),!1;if(!e||!t)return!1;const r=String(s??"").trim();if(r!==""&&qe(r)==null)return a&&(a.textContent=o("dash_volunteer_invalid_hours")),!1;const i=qe(r),d=String(n??"").trim(),l=Qa(t,e),A=Ze.find(m=>m.id===l);a&&(a.textContent=o("dash_volunteer_saving"));try{if(i==null&&!d)return A&&await Oe(L(k,vt,l)),!0;const m=ve.find(u=>u.id===t),c=oe.find(u=>u.id===e);return await xe(L(k,vt,l),{meetId:t,meetName:m&&m.name||"",season:m&&Pe(m)||I,familyId:e,familyLabel:c?er(c):"",parentEmails:c?tr(c):[],hours:i,note:d||null,updatedAt:new Date,updatedBy:(C==null?void 0:C.displayName)||(C==null?void 0:C.email)||"unknown",updatedByEmail:(C==null?void 0:C.email)||""},{merge:!0}),!0}catch(m){return console.error("Error saving volunteer hours:",m),a&&(a.textContent=o("dash_volunteer_save_failed")),alert("Failed to save volunteer hours. Please try again."),!1}}function er(e){const t=s=>[s==null?void 0:s.firstName,s==null?void 0:s.lastName].filter(Boolean).join(" ").trim();return[...new Set([t(e==null?void 0:e.parent),t(e==null?void 0:e.spouse)].filter(Boolean))].join(" & ")}function tr(e){var t,s;return[...new Set([(t=e==null?void 0:e.parent)==null?void 0:t.email,(s=e==null?void 0:e.spouse)==null?void 0:s.email,...(e==null?void 0:e.parentEmails)||[]].map(n=>String(n||"").toLowerCase().trim()).filter(Boolean))]}async function sr(e){var l,A;const t=e.closest("tr");if(!t)return;const s=me,n=t.dataset.familyId,a=((l=t.querySelector(".vol-hours-input"))==null?void 0:l.value)??"",r=((A=t.querySelector(".vol-note-input"))==null?void 0:A.value)??"",i=t.querySelector(".vol-status");await Qi({familyId:n,meetId:s,hours:a,note:r,statusEl:i})&&(t.dataset.volEntered=qe(a)!=null||r.trim()?"1":"0",i&&(i.textContent=o("dash_volunteer_saved")))}function Ts(){var a,r;const e=(((a=document.getElementById("volunteer-search"))==null?void 0:a.value)||"").trim().toLowerCase(),t=!!((r=document.getElementById("volunteer-only-entered"))!=null&&r.checked);let s=0;document.querySelectorAll(".vol-entry-row").forEach(i=>{const d=!e||(i.dataset.volSearch||"").includes(e),l=!t||i.dataset.volEntered==="1",A=d&&l;i.style.display=A?"":"none",A&&s++});const n=document.getElementById("volunteer-no-match");n&&(n.style.display=s===0?"":"none")}function Pn(e,t){const s=new Blob([e],{type:"text/csv;charset=utf-8;"}),n=URL.createObjectURL(s),a=document.createElement("a");a.href=n,a.download=t,document.body.appendChild(a),a.click(),document.body.removeChild(a),URL.revokeObjectURL(n)}function Un(){return hn({meets:ve,registrations:oe,hours:Ze,season:I,meetSeasonOf:Pe})}function nr(){Pn(oo(Un()),`dragon-volunteer-hours-${I}.csv`)}function ar(){Pn(io(Un()),`dragon-volunteer-hours-detail-${I}.csv`)}function or(){var e,t,s,n,a,r,i,d;(e=document.getElementById("volunteer-season-select"))==null||e.addEventListener("change",l=>{I=l.target.value,me=null,K()}),(t=document.getElementById("volunteer-meet-select"))==null||t.addEventListener("change",l=>{me=l.target.value,K()}),(s=document.getElementById("volunteer-search"))==null||s.addEventListener("input",Ts),(n=document.getElementById("volunteer-only-entered"))==null||n.addEventListener("change",Ts),(a=document.getElementById("volunteer-export-btn"))==null||a.addEventListener("click",nr),(r=document.getElementById("volunteer-export-detail-btn"))==null||r.addEventListener("click",ar),(i=document.getElementById("volunteer-show-zero"))==null||i.addEventListener("change",l=>{document.querySelectorAll(".vol-zero-row").forEach(A=>{A.style.display=l.target.checked?"":"none"})}),document.querySelectorAll(".vol-input").forEach(l=>{l.addEventListener("change",()=>sr(l)),l.addEventListener("keydown",A=>{A.key==="Enter"&&(A.preventDefault(),l.blur())})}),(d=document.querySelector(".vol-summary-table tbody"))==null||d.addEventListener("click",l=>{const A=l.target.closest(".vol-summary-row");if(!A)return;const m=document.querySelector(`.vol-detail-row[data-vol-detail="${A.dataset.volFamily}"]`);if(!m)return;const c=A.querySelector(".fee-summary-expand-icon"),u=m.classList.toggle("expanded");A.classList.toggle("expanded-row",u),c&&(c.classList.toggle("expanded",u),c.textContent=u?"▼":"▶")})}function g(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function ht(){const e=new Date,t=e.getFullYear();return e.getMonth()+1>=9?`${t}-${t+1}`:`${t-1}-${t}`}function ir(e){if(!e)return null;const t=String(e).trim(),s=t.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);if(s){const r=Number(s[1]);return Number(s[2])>=9?`${r}-${r+1}`:`${r-1}-${r}`}const n=new Date(t);return Number.isNaN(n.getTime())?null:n.getMonth()+1>=9?`${n.getFullYear()}-${n.getFullYear()+1}`:`${n.getFullYear()-1}-${n.getFullYear()}`}function Pe(e){return e.season||ir(e.startDate||e.date||null)}function yt(){const e=new Set;for(const a of ve)a.season&&e.add(a.season);for(const a of He)a.season&&e.add(a.season);const t=new Date,s=t.getMonth()>=8?t.getFullYear():t.getFullYear()-1,n=2025;for(let a=Math.max(n,s-1);a<=s+2;a++)e.add(`${a}-${a+1}`);return Array.from(e).sort().reverse()}function Kn(e){const t=yt(),s=e||I||ht();return`
    <div class="season-selector">
      <label class="season-selector-label">${o("dash_season_label")}:</label>
      <select id="season-select" class="season-select">
        ${t.map(n=>`<option value="${n}" ${n===s?"selected":""}>${n}</option>`).join("")}
      </select>
    </div>
  `}window.__updateSwimmerPayment=async function(e){var d,l;if(ee!=="admin"){console.warn("Non-admin attempted to modify payment field — blocked"),K();return}const t=e.dataset.regId,s=parseInt(e.dataset.swimmerIndex),n=e.dataset.field,a=e.dataset.season||I;let r=e.value;n.startsWith("amount")?(r=r===""?null:parseFloat(r),r!=null&&(isNaN(r)||r<0)&&(r=null)):n.startsWith("date")&&(r=r||null);const i=oe.find(A=>A.id===t);if((d=i==null?void 0:i.swimmers)!=null&&d[s]){const A=i.swimmers[s],m={...A.payments||{}},c={...m[a]||{}};c[n]=r,m[a]=c,i.swimmers[s]={...A,payments:m}}try{const A=L(k,"registrations",t),m=await pe(A);if(!m.exists())return;const c=[...m.data().swimmers];if(c[s]){const u=c[s],y={...u.payments||{}},h={...y[a]||{}};h[n]=r,y[a]=h,c[s]={...u,payments:y},await ue(A,{swimmers:c})}}catch(A){console.error("Error updating swimmer payment field:",A);const m=oe.find(c=>c.id===t);if((l=m==null?void 0:m.swimmers)!=null&&l[s]){const c=await pe(L(k,"registrations",t));c.exists()&&(m.swimmers[s]={...c.data().swimmers[s]})}K()}};function rr(){if(!F)return`<div class="dash-panel" style="text-align: center; padding: 3rem;">
      <p class="dash-empty">${o("dash_profile_no_reg")}</p>
      <p style="margin-top: 1rem;"><a href="/registration.html" class="btn btn-primary">${o("dash_profile_complete_reg")}</a></p>
    </div>`;const e=F.parent||{},t=F.spouse,s=F.swimmers||[],n=s.filter(r=>!r.deleted),a=F.emergencyContact||{};return`
    <div class="profile-grid">
      <div class="profile-col">
        <div class="dash-panel">
          <div class="dash-panel-header">
            <h3>${o("dash_profile_parent_title")}</h3>
            <button class="btn btn-outline btn-sm" id="edit-contact-btn">${o("dash_profile_edit")}</button>
          </div>
          <div class="profile-fields">
            <div class="profile-field">
              <span class="profile-label">${o("dash_profile_name")}</span>
              <span class="profile-value">${[e.firstName,e.middleName,e.lastName].filter(Boolean).join(" ")||"—"}</span>
            </div>
            <div class="profile-field">
              <span class="profile-label">${o("dash_profile_gender")}</span>
              <span class="profile-value">${e.gender||"—"}</span>
            </div>
            <div class="profile-field">
              <span class="profile-label">${o("dash_profile_email")}</span>
              <span class="profile-value">${e.email||"—"}</span>
            </div>
            <div class="profile-field">
              <span class="profile-label">${o("dash_profile_phone")}</span>
              <span class="profile-value profile-display" id="display-parent-phone">${e.phone||"—"}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-parent-phone" value="${e.phone||""}" />
            </div>
            <div class="profile-field">
              <span class="profile-label">${o("dash_profile_address")}</span>
              <span class="profile-value profile-display" id="display-parent-address">${e.address||"—"}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-parent-address" value="${e.address||""}" />
            </div>
          </div>
        </div>

        ${t?`
        <div class="dash-panel">
          <h3>${o("dash_profile_spouse_title")}</h3>
          <div class="profile-fields">
            <div class="profile-field">
              <span class="profile-label">${o("dash_profile_name")}</span>
              <span class="profile-value">${[t.firstName,t.middleName,t.lastName].filter(Boolean).join(" ")||"—"}</span>
            </div>
            <div class="profile-field">
              <span class="profile-label">${o("dash_profile_gender")}</span>
              <span class="profile-value">${t.gender||"—"}</span>
            </div>
            <div class="profile-field">
              <span class="profile-label">${o("dash_profile_phone")}</span>
              <span class="profile-value profile-display" id="display-spouse-phone">${t.phone||"—"}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-spouse-phone" value="${t.phone||""}" />
            </div>
            <div class="profile-field">
              <span class="profile-label">${o("dash_profile_email")}</span>
              <span class="profile-value profile-display" id="display-spouse-email">${t.email||"—"}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-spouse-email" value="${t.email||""}" readonly
                title="Spouse email is used for login access and cannot be changed here." />
              <p class="profile-edit-field" style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">Spouse email is tied to login access. Contact admin@dragonswim.com if you need to change it.</p>
            </div>
          </div>
        </div>
        `:""}

        <div class="dash-panel">
          <h3>${o("dash_profile_emergency_title")}</h3>
          <div class="profile-fields">
            <div class="profile-field">
              <span class="profile-label">${o("dash_profile_name")}</span>
              <span class="profile-value profile-display" id="display-emergency-name">${a.name||"—"}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-emergency-name" value="${a.name||""}" />
            </div>
            <div class="profile-field">
              <span class="profile-label">${o("dash_profile_phone")}</span>
              <span class="profile-value profile-display" id="display-emergency-phone">${a.phone||"—"}</span>
              <input class="form-input profile-input profile-edit-field" id="edit-emergency-phone" value="${a.phone||""}" />
            </div>
          </div>
        </div>

        <div class="profile-edit-actions" id="edit-actions" style="display: none;">
          <button class="btn btn-primary btn-sm" id="save-contact-btn">${o("dash_profile_save")}</button>
          <button class="btn btn-outline btn-sm" id="cancel-contact-btn">${o("dash_profile_cancel")}</button>
        </div>
      </div>

      <div class="profile-col">
        <div class="dash-panel">
          <div class="dash-panel-header">
            <h3>${o("dash_profile_swimmers_title")} (${n.length})</h3>
            <button class="btn btn-outline btn-sm" id="add-swimmer-toggle-btn">${o("dash_profile_add_swimmer")}</button>
          </div>
          <div id="add-swimmer-form" style="display: none; margin-bottom: var(--space-md); padding: var(--space-md); border: 1px solid var(--border-color); border-radius: var(--radius-md);">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">${o("dash_profile_swimmer_first")}</label>
                <input class="form-input" id="new-swimmer-first" />
              </div>
              <div class="form-group">
                <label class="form-label">${o("dash_profile_swimmer_last")}</label>
                <input class="form-input" id="new-swimmer-last" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">${o("dash_profile_swimmer_middle")}</label>
                <input class="form-input" id="new-swimmer-middle" />
              </div>
              <div class="form-group">
                <label class="form-label">${o("dash_profile_swimmer_gender")}</label>
                <select class="form-select" id="new-swimmer-gender">
                  <option value="" disabled selected>${o("dash_profile_select_gender")}</option>
                  <option value="male">${o("dash_profile_gender_male")}</option>
                  <option value="female">${o("dash_profile_gender_female")}</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">${o("dash_profile_swimmer_dob")}</label>
                <input class="form-input" type="date" id="new-swimmer-dob" />
              </div>
              <div class="form-group">
                <label class="form-label">${o("dash_profile_swimmer_usa_id")}</label>
                <input class="form-input" id="new-swimmer-usaId" />
              </div>
            </div>
            <div style="display: flex; gap: var(--space-sm); margin-top: var(--space-md);">
              <button class="btn btn-primary btn-sm" id="save-swimmer-btn">${o("dash_profile_save_swimmer")}</button>
              <button class="btn btn-outline btn-sm" id="cancel-swimmer-btn">${o("dash_profile_cancel_swimmer")}</button>
            </div>
          </div>
          ${n.length===0?`<p class="dash-empty">${o("dash_profile_no_swimmers")}</p>`:s.map((r,i)=>r.deleted?"":`

            <div class="swimmer-profile-card">
              <div class="swimmer-profile-info">
                <strong>${[r.firstName,r.middleName,r.lastName].filter(Boolean).join(" ")}</strong>
                <div class="swimmer-profile-meta">
                  <span>${r.gender||"—"}</span>
                  <span>DOB: ${r.dob||"—"}</span>
                  ${r.joinDate?`<span>Joined: ${r.joinDate}</span>`:""}
                </div>
                <div class="swimmer-usa-id" style="display: flex; align-items: center; gap: 8px; margin-top: 6px; flex-wrap: wrap;">
                  <span style="font-size: 0.8rem; color: var(--text-muted);">USA ID:</span>
                  <strong style="font-size: 0.8rem;">${r.usaSwimmingId?g(r.usaSwimmingId):"—"}</strong>
                  <button type="button" class="btn btn-outline btn-sm usa-id-edit-btn" data-index="${i}" style="padding: 0 8px; font-size: 0.7rem;">${r.usaSwimmingId?o("dash_profile_edit"):o("dash_profile_usa_add")}</button>
                  <span class="usa-id-edit-form" data-usa-form="${i}" style="display: none; align-items: center; gap: 6px;">
                    <input type="text" class="form-input usa-id-input" data-input="${i}" value="${g(r.usaSwimmingId||"")}" placeholder="USA Swimming ID" style="width: 170px; padding: 2px 8px; font-size: 0.75rem;" />
                    <button type="button" class="btn btn-primary btn-sm usa-id-save-btn" data-index="${i}" style="padding: 0 8px; font-size: 0.7rem;">${o("dash_profile_save")}</button>
                    <button type="button" class="btn btn-outline btn-sm usa-id-cancel-btn" data-index="${i}" style="padding: 0 8px; font-size: 0.7rem;">${o("dash_profile_cancel")}</button>
                  </span>
                </div>
              </div>
              <button class="btn btn-outline btn-sm delete-swimmer-btn" data-index="${i}" style="color: var(--color-accent); border-color: var(--color-accent);">${o("dash_profile_remove")}</button>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `}function lr(){return`
    <div class="dash-panel" style="text-align: center; padding: 4rem 2rem;">
      <div style="font-size: 3rem; margin-bottom: 1rem;">🚧</div>
      <h2 style="font-size: 1.5rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem;">${o("dash_plans_under_construction")}</h2>
      <p style="color: var(--text-secondary);">${o("dash_swimmer_plans_sub")}</p>
    </div>
  `}function js(e){if(!e)return null;const t=String(e).trim().match(/^(\d{4})[-/.]\d{1,2}[-/.]\d{1,2}/);if(!t)return null;const s=String(t[0]).split(/[-/.]/);return Date.UTC(Number(s[0]),Number(s[1])-1,Number(s[2]))}function ms(e,t=new Date){const s=Date.UTC(t.getFullYear(),t.getMonth(),t.getDate()),n=js(e.startDate||e.date),a=js(e.endDate||e.date||e.startDate);return a!=null&&a<s?{bucket:"past",label:"Completed",cls:"status-completed"}:n!=null&&a!=null&&n<=s&&s<=a?{bucket:"upcoming",label:"In Progress",cls:"status-in-progress"}:{bucket:"upcoming",label:"Upcoming",cls:"status-open"}}function Os(){const e=ee==="admin",t=ce==="coach",s=new Date,n=ve.filter(A=>Pe(A)===I).sort((A,m)=>String(A.startDate||A.date||"").localeCompare(String(m.startDate||m.date||""))),a=n.map(A=>({meet:A,disp:ms(A,s)})),r=a.filter(A=>A.disp.bucket==="upcoming"),i=a.filter(A=>A.disp.bucket==="past").reverse(),d=(A,m)=>{const c=m.bucket==="past"?' style="opacity: 0.78;"':"",u=A.sourceUrl?`<span>🔗 <a href="${g(A.sourceUrl)}" target="_blank" rel="noopener noreferrer">Meet Page</a></span>`:"",y=g(A.startDate&&A.endDate?`${A.startDate} – ${A.endDate}`:A.date||""),h=Array.isArray(A.events)&&A.events.length>0,v=h&&A.events.some(f=>{var _,x;return!f.relay&&(((_=f.standards)==null?void 0:_.SCY)!=null||((x=f.standards)==null?void 0:x.LCM)!=null)}),B=h&&(t||A.entriesOpenToFamilies===!0);return`
        <div class="dash-card"${c}>
          <div class="dash-card-header">
            <h3 class="dash-card-title">${g(A.name||"Unnamed Meet")}</h3>
            <span class="status-badge ${m.cls}">${m.label}</span>
          </div>
          <div class="dash-card-body">
            <div class="dash-card-meta">
              <span>📅 ${y}</span>
              <span>📍 ${g(A.location||"")}</span>
              ${u}
            </div>
            ${v?`<div class="meet-qual-line">⏱ ${o("meet_entries_requires_times")}</div>`:""}
            <div style="display: flex; gap: 0.5rem; margin-top: 1rem; flex-wrap: wrap;">
              ${B?`<button class="btn btn-outline btn-sm meet-entries-btn" data-id="${A.id}">🎽 ${o("meet_entries_open_btn")}</button>`:""}
              ${e?`<button class="btn btn-outline btn-sm meet-fee-btn" data-id="${A.id}" data-name="${g(A.name||"")}">${o("dash_meets_fee")}</button>`:""}
              ${e?`<button class="btn btn-outline btn-sm edit-meet" data-id="${A.id}" data-name="${g(A.name||"")}" data-start="${A.startDate||A.date||""}" data-end="${A.endDate||A.date||""}" data-location="${g(A.location||"")}" data-season="${A.season||I}" data-source="${g(A.sourceUrl||"")}">${o("dash_meets_edit")}</button>`:""}
              ${e?`<button class="btn btn-outline btn-sm delete-meet" data-id="${A.id}" style="color: var(--color-accent); border-color: var(--color-accent);">${o("dash_meets_delete")}</button>`:""}
            </div>
          </div>
        </div>
      `},l=(A,m)=>A.length?`
        <h3 style="font-size: 1rem; font-weight: 600; color: var(--text-primary); margin: 1.5rem 0 0.75rem;">${m} (${A.length})</h3>
        <div class="dash-cards-grid">
          ${A.map(c=>d(c.meet,c.disp)).join("")}
        </div>
      `:"";return`
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem;">
      ${Kn(I)}
      ${e?`<button class="btn btn-primary btn-sm" id="add-meet-btn">${o("dash_meets_add")}</button>`:""}
    </div>

    ${e?`
      <div id="add-meet-form" class="dash-panel" style="${X?"":"display: none;"} margin-bottom: 2rem; padding: 1.5rem;">
        <h3 style="margin-bottom: 1rem;" id="meet-form-title">${je?o("dash_meets_edit_title"):o("dash_meets_new_title")}</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
          <div>
            <label class="form-label" for="meet-name">${o("dash_meets_name_placeholder")}</label>
            <input type="text" id="meet-name" placeholder="${o("dash_meets_name_placeholder")}" class="form-input" value="${g((X==null?void 0:X.name)||"")}">
          </div>
          <div>
            <label class="form-label" for="meet-start-date">${o("dash_meets_start_date_placeholder")}</label>
            <input type="date" id="meet-start-date" class="form-input" title="${o("dash_meets_start_date_placeholder")}" value="${g((X==null?void 0:X.startDate)||"")}">
          </div>
          <div>
            <label class="form-label" for="meet-end-date">${o("dash_meets_end_date_placeholder")}</label>
            <input type="date" id="meet-end-date" class="form-input" title="${o("dash_meets_end_date_placeholder")}" value="${g((X==null?void 0:X.endDate)||"")}">
          </div>
          <div>
            <label class="form-label" for="meet-location">${o("dash_meets_location_placeholder")}</label>
            <input type="text" id="meet-location" placeholder="${o("dash_meets_location_placeholder")}" class="form-input" value="${g((X==null?void 0:X.location)||"")}">
          </div>
          <div>
            <label class="form-label" for="meet-source">${o("dash_meets_source_placeholder")}</label>
            <input type="url" id="meet-source" placeholder="${o("dash_meets_source_placeholder")}" class="form-input" value="${g((X==null?void 0:X.source)||"")}">
          </div>
          <div>
            <label class="form-label" for="meet-season">${o("dash_season_label")}</label>
            <select id="meet-season" class="form-input">
              ${yt().map(A=>`<option value="${A}" ${A===((X==null?void 0:X.season)||I)?"selected":""}>${A}</option>`).join("")}
            </select>
          </div>
        </div>
        <div style="margin-top: 1rem; display: flex; gap: 1rem; align-items: center;">
          <button class="btn btn-primary btn-sm" id="save-meet-btn">${je?o("dash_meets_update"):o("dash_meets_save")}</button>
          <button class="btn btn-outline btn-sm" id="cancel-meet-btn">${o("dash_meets_cancel")}</button>
        </div>
        <p id="meet-form-error" style="display: none; margin-top: 0.75rem; color: var(--color-accent); font-size: var(--fs-sm);"></p>
      </div>
    `:""}

    ${n.length===0?`
      <div class="dash-panel" style="text-align: center; padding: 3rem 2rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">📅</div>
        <p style="color: var(--text-secondary); max-width: 460px; margin: 0 auto;">${o("dash_meets_no_meets_for_season",{season:I})}</p>
        ${e?`<p style="margin: 1rem 0 0;"><button class="btn btn-primary btn-sm" id="add-meet-btn-empty">${o("dash_meets_add")}</button></p>`:""}
      </div>
    `:`
      ${l(r,o("dash_meets_upcoming"))}
      ${l(i,o("dash_meets_past"))}
    `}
  `}function zs(){const e={sessionSlots:os,enrollments:is,currentPeriod:qt,viewMode:Ht,allRegistrations:oe,dbRole:ee,activeSwimmers:ce==="coach"?Ct():[],familyData:F,familyDataId:ye};return ce==="coach"?fo(e):po(e)}function dr(e,t){const s=document.createElement("div");s.className="confirm-overlay",s.innerHTML=`
    <div class="confirm-modal">
      <h3 class="confirm-title">${o("dash_profile_delete_title")}</h3>
      <p class="confirm-body">${o("dash_profile_delete_body1")} <strong style="color: var(--color-accent, #dc3545);">${e}</strong> ${o("dash_profile_delete_body2")}</p>
      <p class="confirm-warning">${o("dash_profile_delete_warning")}</p>
      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="confirm-cancel">${o("dash_profile_delete_cancel")}</button>
        <button class="btn btn-sm" id="confirm-delete" style="background: var(--color-accent, #dc3545); color: white; border: none;">${o("dash_profile_delete_confirm")}</button>
      </div>
    </div>
  `,document.body.appendChild(s),s.querySelector("#confirm-cancel").addEventListener("click",()=>s.remove()),s.querySelector("#confirm-delete").addEventListener("click",async()=>{s.remove();const n=[...F.swimmers];n[t]={...n[t],deleted:!0,deletedAt:new Date().toISOString()};try{await ue(L(k,"registrations",ye),{swimmers:n}),F.swimmers=n,H="profile",K()}catch(a){console.error("Error marking swimmer deleted:",a),alert(o("dash_profile_save_failed"))}}),s.addEventListener("click",n=>{n.target===s&&s.remove()})}function qs(e){return(e||"").trim().toUpperCase()||null}function Hs(e){return/^[0-9A-F]{14}$/.test(e)}async function Ps(e,t){const s=(F==null?void 0:F.swimmers)||[];for(let n=0;n<s.length;n++){const a=s[n];if(!(n===t||a.deleted)&&a.usaSwimmingId&&a.usaSwimmingId.toUpperCase()===e)return a}try{const n=await ot(ae(k,"registrations"));for(const a of n.docs){if(a.id===ye)continue;const r=a.data();for(const i of r.swimmers||[])if(!i.deleted&&i.usaSwimmingId&&i.usaSwimmingId.toUpperCase()===e)return i}}catch(n){console.warn("USA ID duplicate check skipped:",n)}return null}function Ar(){const e=document.createElement("div");e.className="confirm-overlay",e.innerHTML=`
    <div class="confirm-modal" style="max-width: 420px;">
      <h3 class="confirm-title">${o("dash_profile_security_title")}</h3>
      <div style="padding: var(--space-md) 0;">
        <div class="profile-field">
          <label class="form-label" for="modal-current-password">${o("dash_profile_current_password")}</label>
          <input class="form-input" type="password" id="modal-current-password" placeholder="Enter current password" />
        </div>
        <div class="profile-field">
          <label class="form-label" for="modal-new-password">${o("dash_profile_new_password")}</label>
          <input class="form-input" type="password" id="modal-new-password" placeholder="Enter new password" />
        </div>
        <div class="profile-field">
          <label class="form-label" for="modal-confirm-password">${o("dash_profile_confirm_password")}</label>
          <input class="form-input" type="password" id="modal-confirm-password" placeholder="Confirm new password" />
        </div>
        <p id="modal-password-msg" style="font-size: 14px; margin-top: 10px; display: none;"></p>
      </div>
      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="modal-password-cancel">${o("dash_profile_cancel")}</button>
        <button class="btn btn-primary btn-sm" id="modal-password-submit">${o("dash_profile_password_btn")}</button>
      </div>
    </div>
  `,document.body.appendChild(e);const t=e.querySelector("#modal-password-msg");e.querySelector("#modal-password-cancel").addEventListener("click",()=>e.remove()),e.querySelector("#modal-password-submit").addEventListener("click",async()=>{const s=e.querySelector("#modal-current-password").value,n=e.querySelector("#modal-new-password").value,a=e.querySelector("#modal-confirm-password").value;if(t.style.display="none",!s||!n||!a){t.textContent="All fields are required.",t.style.color="var(--color-accent, #DC2626)",t.style.display="block";return}if(n!==a){t.textContent=o("dash_profile_password_mismatch"),t.style.color="var(--color-accent, #DC2626)",t.style.display="block";return}if(n.length<6){t.textContent="Password must be at least 6 characters.",t.style.color="var(--color-accent, #DC2626)",t.style.display="block";return}try{const r=Us.credential(C.email,s);await Ks(C,r),await Ys(C,n),t.textContent=o("dash_profile_password_success"),t.style.color="#16A34A",t.style.display="block",e.querySelector("#modal-current-password").value="",e.querySelector("#modal-new-password").value="",e.querySelector("#modal-confirm-password").value=""}catch(r){console.error("Password update error:",r),r.code==="auth/wrong-password"||r.code==="auth/invalid-credential"?t.textContent=o("dash_profile_password_wrong"):t.textContent=o("dash_profile_password_error")+" "+(r.message||""),t.style.color="var(--color-accent, #DC2626)",t.style.display="block"}}),e.addEventListener("click",s=>{s.target===e&&e.remove()})}function St(e,t){const s=document.getElementById("csv-import-status");s&&s.remove();const n=document.createElement("div");n.id="csv-import-status",n.style.cssText=["padding: var(--space-md) var(--space-lg)","border-radius: var(--radius-md)","margin-bottom: var(--space-lg)","font-size: var(--fs-sm)","font-weight: var(--fw-medium)",t?"background: #fef2f2; border: 1px solid #fee2e2; color: #991b1b":"background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534"].join(";"),n.textContent=e;const a=document.querySelector(".dash-content");a&&a.insertBefore(n,a.firstChild),setTimeout(()=>n.remove(),8e3)}async function cr(e){var d,l,A,m,c,u,y,h,v,B,f,_,x,M,J,ie,ge;const t=window.XLSX;if(!t)return alert("Excel parser not loaded. Please refresh the page."),null;const s=await e.arrayBuffer(),n=t.read(new Uint8Array(s),{type:"array"}),a=n.SheetNames[0],r=n.Sheets[a],i=t.utils.sheet_to_json(r,{header:1,defval:null});try{const fe=((d=i[5])==null?void 0:d[0])||"Unknown Meet",Le=((l=i[7])==null?void 0:l[9])||0,Ue=((A=i[7])==null?void 0:A[36])||0;let he=-1;for(let S=8;S<i.length;S++)if(i[S]&&i[S][1]==="Name"){he=S+2;break}he<0&&(he=11);const Se=[];for(let S=he;S<i.length;S+=2){const P=(m=i[S])==null?void 0:m[1];if(!P||typeof P!="string")break;const U=P.match(/^(.+?)\s*\((\d+)\)\s*$/),se=U?U[1].trim():P.trim(),Ee=U?parseInt(U[2],10):null,Me=((c=i[S])==null?void 0:c[17])||0,Ke=((u=i[S])==null?void 0:u[23])||0,w=((y=i[S])==null?void 0:y[29])||0,T=((h=i[S])==null?void 0:h[38])||0;Se.push({name:se,age:Ee,individualEvents:Me,individualFee:Ke,relayFee:w,total:T})}let te=-1;for(let S=he;S<i.length;S++)if(i[S]&&i[S][9]==="Team Totals"){te=S;break}let re={individualEntries:0,individualFee:0,relayEntries:0,relayFee:0,swimmerSurcharge:{count:0,fee:0},teamSurcharge:0,facilitySurcharge:0,total:0};return te>0&&(re.individualEntries=((v=i[te+1])==null?void 0:v[15])||0,re.individualFee=((B=i[te+1])==null?void 0:B[21])||0,re.relayEntries=((f=i[te+2])==null?void 0:f[15])||0,re.relayFee=((_=i[te+2])==null?void 0:_[21])||0,re.swimmerSurcharge={count:((x=i[te+3])==null?void 0:x[15])||0,fee:((M=i[te+3])==null?void 0:M[21])||0},re.teamSurcharge=((J=i[te+4])==null?void 0:J[21])||0,re.facilitySurcharge=((ie=i[te+5])==null?void 0:ie[21])||0,re.total=((ge=i[te+6])==null?void 0:ge[21])||0),{fileName:e.name,meetName:fe,setupFees:{individualEventFee:Le,swimmerSurcharge:Ue},swimmers:Se,summary:re,uploadedAt:new Date,uploadedBy:(C==null?void 0:C.email)||"unknown"}}catch(fe){return console.error("Error parsing Hy-Tek report:",fe),null}}function mr(e,t,s){const n=s&&s.swimmers&&s.swimmers.length>0;let a="";if(n){const r=s.summary;a+=`
      <div class="fee-summary-grid">
        <div class="fee-summary-card">
          <div class="fee-summary-label">Individual Entries</div>
          <div class="fee-summary-value">${r.individualEntries} events</div>
          <div class="fee-summary-sub">$${r.individualFee.toLocaleString()}</div>
        </div>
        <div class="fee-summary-card">
          <div class="fee-summary-label">Relay Entries</div>
          <div class="fee-summary-value">${r.relayEntries} entries</div>
          <div class="fee-summary-sub">$${r.relayFee.toLocaleString()}</div>
        </div>
        <div class="fee-summary-card">
          <div class="fee-summary-label">Swimmer Surcharge</div>
          <div class="fee-summary-value">${r.swimmerSurcharge.count} swimmers</div>
          <div class="fee-summary-sub">$${r.swimmerSurcharge.fee.toLocaleString()}</div>
        </div>
        <div class="fee-summary-card fee-summary-total">
          <div class="fee-summary-label">${o("dash_meets_fee_summary_total")}</div>
          <div class="fee-summary-value" style="font-size: 1.5rem; font-weight: 700;">$${r.total.toLocaleString()}</div>
        </div>
      </div>

      <div class="fee-table-wrapper">
        <table class="fee-table">
          <thead>
            <tr>
              <th>${o("dash_meets_fee_name")}</th>
              <th>${o("dash_meets_fee_age")}</th>
              <th>${o("dash_meets_fee_events")}</th>
              <th>${o("dash_meets_fee_indiv_fee")}</th>
              <th>${o("dash_meets_fee_relay_fee")}</th>
              <th>${o("dash_meets_fee_total")}</th>
            </tr>
          </thead>
          <tbody>
            ${s.swimmers.map(i=>`
              <tr>
                <td>${i.name}</td>
                <td>${i.age!=null?i.age:"—"}</td>
                <td>${i.individualEvents}</td>
                <td>$${i.individualFee.toLocaleString()}</td>
                <td>$${i.relayFee.toLocaleString()}</td>
                <td><strong>$${i.total.toLocaleString()}</strong></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>

      <div class="fee-meta">
        ${o("dash_meets_fee_uploaded_by")}: <strong>${s.uploadedBy||"—"}</strong>
        ${s.uploadedAt?` &mdash; ${new Date(s.uploadedAt.seconds?s.uploadedAt.seconds*1e3:s.uploadedAt).toLocaleString()}`:""}
      </div>
    `}else a=`<div class="fee-empty">${o("dash_meets_fee_no_data")}</div>`;return`
    <div class="fee-modal-overlay" id="fee-modal-overlay">
      <div class="fee-modal">
        <div class="fee-modal-header">
          <h2>${o("dash_meets_fee_title")}: ${t}</h2>
          <button class="fee-modal-close" id="fee-modal-close" title="${o("dash_meets_fee_close")}">&times;</button>
        </div>
        <div class="fee-modal-body" id="fee-modal-body">
          ${a}
        </div>
        <div class="fee-modal-footer">
          ${n?`<p class="fee-overwrite-hint">${o("dash_meets_fee_upload_overwrite")}</p>`:""}
          <input type="file" id="fee-file-input" accept=".xls,.xlsx" style="display:none;">
          <button class="btn btn-primary btn-sm" id="fee-upload-btn">${o("dash_meets_fee_upload")}</button>
          ${n?`<button class="btn btn-outline btn-sm" id="fee-delete-btn" style="color: var(--color-accent); border-color: var(--color-accent);">${o("dash_meets_fee_delete")}</button>`:""}
        </div>
      </div>
    </div>
  `}async function Yt(e,t){let s=null;try{const c=await pe(L(k,"meets",e));c.exists()&&(s=c.data().feeData||null)}catch(c){console.error("Error fetching meet for fee modal:",c)}const n=document.getElementById("fee-modal-overlay");n&&n.remove();const a=document.createElement("div");a.id="fee-modal-container",a.innerHTML=mr(e,t,s),document.body.appendChild(a);const r=document.getElementById("fee-modal-overlay"),i=document.getElementById("fee-modal-close"),d=document.getElementById("fee-upload-btn"),l=document.getElementById("fee-file-input"),A=document.getElementById("fee-delete-btn"),m=()=>{r==null||r.remove(),a.remove()};i==null||i.addEventListener("click",m),r==null||r.addEventListener("click",c=>{c.target===r&&m()}),d==null||d.addEventListener("click",()=>{l==null||l.click()}),l==null||l.addEventListener("change",async c=>{var v;const u=(v=c.target.files)==null?void 0:v[0];if(!u)return;const y=u.name.split(".").pop().toLowerCase();if(!["xls","xlsx"].includes(y)){alert(o("dash_meets_fee_parse_error"));return}const h=await cr(u);if(!h){alert(o("dash_meets_fee_parse_error"));return}try{await ue(L(k,"meets",e),{feeData:h}),m(),Yt(e,t)}catch(B){console.error("Error uploading fee data:",B),alert("Failed to upload fee data. Please try again.")}}),A==null||A.addEventListener("click",async()=>{if(confirm(o("dash_meets_fee_delete_confirm")))try{await ue(L(k,"meets",e),{feeData:null}),m(),Yt(e,t)}catch(c){console.error("Error deleting fee data:",c),alert("Failed to delete fee data. Please try again.")}})}function ur(e){const t=e.ageDeterminedOn||e.startDate,s=[],n=(a,r)=>{const i=Ws(r.dob,t);s.push({familyId:a,usaId:String(r.usaSwimmingId||"").trim().toUpperCase(),name:[r.firstName,r.lastName].filter(Boolean).join(" ").trim(),dob:r.dob||"",gender:r.gender||"",age:i,ageGroup:Xs(i)})};if(ce==="coach")for(const a of oe)for(const r of a.swimmers||[])r&&!r.deleted&&n(a.id,r);else if(F)for(const a of F.swimmers||[])a&&!a.deleted&&n(ye,a);return s}function pr(e){const t=ve.find(n=>n.id===e);if(!t)return;ha({meet:t,role:ce==="coach"?ee==="admin"?"admin":"coach":"family",swimmers:ur(t),familyId:ye,actorId:(C==null?void 0:C.uid)||null})}function Yn(){var d,l,A,m,c,u,y,h,v,B,f,_,x,M,J,ie,ge,fe,Le,Ue,he,Se,te,re,S,P,U,se,Ee,Me,Ke;pi(),document.querySelectorAll(".dash-nav-item[data-tab]").forEach(w=>{w.addEventListener("click",()=>{H=w.dataset.tab,K()})}),(d=document.getElementById("dash-theme-toggle"))==null||d.addEventListener("click",()=>{Gn(),K()});const e=document.getElementById("dash-hamburger"),t=document.getElementById("dash-sidebar"),s=t==null?void 0:t.closest(".dash-layout");let n=null;const a=()=>{t==null||t.classList.remove("open"),s==null||s.classList.remove("menu-open"),n&&(n.remove(),n=null)};e==null||e.addEventListener("click",w=>{w.stopPropagation();const T=!t.classList.contains("open");T&&!n&&s&&(n=document.createElement("div"),n.className="dash-overlay",n.setAttribute("data-testid","dash-overlay"),n.addEventListener("click",a),s.appendChild(n)),t.classList.toggle("open",T),s==null||s.classList.toggle("menu-open",T)}),document.addEventListener("keydown",w=>{w.key==="Escape"&&a()}),(l=document.getElementById("sidebar-signout"))==null||l.addEventListener("click",async()=>{try{await us(bt),window.location.href="/signin.html"}catch(w){console.error("Error signing out:",w)}});const r=document.getElementById("user-trigger"),i=document.getElementById("user-dropdown");if(r==null||r.addEventListener("click",w=>{w.stopPropagation(),i.style.display=i.style.display==="none"?"block":"none"}),document.addEventListener("click",()=>{i&&(i.style.display="none")}),(A=document.getElementById("menu-profile"))==null||A.addEventListener("click",()=>{H="profile",i.style.display="none",K()}),(m=document.getElementById("menu-signout"))==null||m.addEventListener("click",async()=>{try{await us(bt),window.location.href="/signin.html"}catch(w){console.error("Error signing out:",w)}}),(c=document.getElementById("menu-admin"))==null||c.addEventListener("click",()=>{window.location.href="/admin.html"}),(u=document.getElementById("menu-password"))==null||u.addEventListener("click",()=>{i.style.display="none",Ar()}),(y=document.getElementById("edit-contact-btn"))==null||y.addEventListener("click",()=>{document.querySelectorAll(".profile-display").forEach(w=>w.style.display="none"),document.querySelectorAll(".profile-edit-field").forEach(w=>w.style.display="block"),document.getElementById("edit-actions").style.display="flex",document.getElementById("edit-contact-btn").style.display="none"}),(h=document.getElementById("cancel-contact-btn"))==null||h.addEventListener("click",()=>{document.querySelectorAll(".profile-display").forEach(w=>w.style.display=""),document.querySelectorAll(".profile-edit-field").forEach(w=>w.style.display="none"),document.getElementById("edit-actions").style.display="none",document.getElementById("edit-contact-btn").style.display=""}),(v=document.getElementById("save-contact-btn"))==null||v.addEventListener("click",async()=>{var T,z,ne,q,G,_e;const w={"parent.phone":((T=document.getElementById("edit-parent-phone"))==null?void 0:T.value.trim())||"","parent.address":((z=document.getElementById("edit-parent-address"))==null?void 0:z.value.trim())||""};F.spouse&&(w["spouse.phone"]=((ne=document.getElementById("edit-spouse-phone"))==null?void 0:ne.value.trim())||"",w["spouse.email"]=((q=document.getElementById("edit-spouse-email"))==null?void 0:q.value.trim())||""),w["emergencyContact.name"]=((G=document.getElementById("edit-emergency-name"))==null?void 0:G.value.trim())||"",w["emergencyContact.phone"]=((_e=document.getElementById("edit-emergency-phone"))==null?void 0:_e.value.trim())||"";try{await ue(L(k,"registrations",ye),w),F.parent.phone=w["parent.phone"],F.parent.address=w["parent.address"],F.spouse&&(F.spouse.phone=w["spouse.phone"],F.spouse.email=w["spouse.email"]),F.emergencyContact.name=w["emergencyContact.name"],F.emergencyContact.phone=w["emergencyContact.phone"],H="profile",K()}catch(Be){console.error("Error updating contact:",Be),alert(o("dash_profile_save_failed"))}}),(B=document.getElementById("add-swimmer-toggle-btn"))==null||B.addEventListener("click",()=>{document.getElementById("add-swimmer-form").style.display="block",document.getElementById("add-swimmer-toggle-btn").style.display="none"}),(f=document.getElementById("cancel-swimmer-btn"))==null||f.addEventListener("click",()=>{document.getElementById("add-swimmer-form").style.display="none",document.getElementById("add-swimmer-toggle-btn").style.display=""}),(_=document.getElementById("save-swimmer-btn"))==null||_.addEventListener("click",async()=>{const w=document.getElementById("new-swimmer-first").value.trim(),T=document.getElementById("new-swimmer-last").value.trim();if(!w||!T){alert(o("dash_profile_swimmer_required"));return}const z=qs(document.getElementById("new-swimmer-usaId").value);if(z&&!Hs(z)){alert(o("dash_profile_usa_invalid"));return}if(z&&await Ps(z,-1)){alert(o("dash_profile_usa_duplicate"));return}const ne={firstName:w,lastName:T,middleName:document.getElementById("new-swimmer-middle").value.trim()||null,gender:document.getElementById("new-swimmer-gender").value||null,dob:document.getElementById("new-swimmer-dob").value||null,usaSwimmingId:z,joinDate:null},q=[...F.swimmers,ne];try{await ue(L(k,"registrations",ye),{swimmers:q}),F.swimmers=q,H="profile",K()}catch(G){console.error("Error adding swimmer:",G),alert(o("dash_profile_swimmer_add_failed"))}}),document.querySelectorAll(".delete-swimmer-btn").forEach(w=>{w.addEventListener("click",()=>{const T=parseInt(w.dataset.index),z=F.swimmers[T],ne=[z.firstName,z.lastName].filter(Boolean).join(" ");dr(ne,T)})}),document.querySelectorAll(".usa-id-edit-btn").forEach(w=>{w.addEventListener("click",()=>{const T=parseInt(w.dataset.index),z=document.querySelector(`.usa-id-edit-form[data-usa-form='${T}']`);z&&(z.style.display="flex",w.style.display="none",z.querySelector(".usa-id-input").focus())})}),document.querySelectorAll(".usa-id-cancel-btn").forEach(w=>{w.addEventListener("click",()=>{const T=parseInt(w.dataset.index),z=document.querySelector(`.usa-id-edit-form[data-usa-form='${T}']`),ne=document.querySelector(`.usa-id-edit-btn[data-index='${T}']`);z&&(z.style.display="none"),ne&&(ne.style.display="")})}),document.querySelectorAll(".usa-id-save-btn").forEach(w=>{w.addEventListener("click",async()=>{var Be;const T=parseInt(w.dataset.index),z=F.swimmers[T];if(!z)return;const ne=document.querySelector(`.usa-id-input[data-input='${T}']`),q=qs(ne==null?void 0:ne.value),G=z.usaSwimmingId?z.usaSwimmingId.toUpperCase():null;if(q&&!Hs(q)){alert(o("dash_profile_usa_invalid"));return}if(q===G){(Be=document.querySelector(`.usa-id-cancel-btn[data-index='${T}']`))==null||Be.click();return}if(q&&await Ps(q,T)){alert(o("dash_profile_usa_duplicate"));return}const _e=[...F.swimmers];_e[T]={...z,usaSwimmingId:q};try{await ue(L(k,"registrations",ye),{swimmers:_e}),F.swimmers=_e,H="profile",K()}catch(ke){console.error("Error updating swimmer USA ID:",ke),alert(o("dash_profile_save_failed"))}})}),(x=document.getElementById("update-password-btn"))==null||x.addEventListener("click",async()=>{const w=document.getElementById("password-update-msg"),T=document.getElementById("change-current-password").value,z=document.getElementById("change-new-password").value,ne=document.getElementById("change-confirm-password").value;w.style.display="none",w.style.color="";const q=document.getElementById("update-password-btn");if(q&&(q.disabled=!0),!T||!z||!ne){w.textContent="All fields are required.",w.style.color="var(--color-accent, #DC2626)",w.style.display="block",q&&(q.disabled=!1);return}if(z!==ne){w.textContent=o("dash_profile_password_mismatch"),w.style.color="var(--color-accent, #DC2626)",w.style.display="block",q&&(q.disabled=!1);return}if(z.length<6){w.textContent="Password must be at least 6 characters.",w.style.color="var(--color-accent, #DC2626)",w.style.display="block",q&&(q.disabled=!1);return}try{const G=Us.credential(C.email,T);await Ks(C,G),await Ys(C,z),w.textContent=o("dash_profile_password_success"),w.style.color="#16A34A",w.style.display="block",document.getElementById("change-current-password").value="",document.getElementById("change-new-password").value="",document.getElementById("change-confirm-password").value=""}catch(G){console.error("Password update error:",G),G.code==="auth/wrong-password"||G.code==="auth/invalid-credential"?w.textContent=o("dash_profile_password_wrong"):w.textContent=o("dash_profile_password_error")+" "+(G.message||""),w.style.color="var(--color-accent, #DC2626)",w.style.display="block"}finally{q&&(q.disabled=!1)}}),document.querySelectorAll(".meet-entries-btn").forEach(w=>{w.addEventListener("click",()=>pr(w.dataset.id))}),ce==="coach"){const w=$=>{const D=document.getElementById("meet-form-error");if(!D){$&&alert($);return}D.textContent=$||"",D.style.display=$?"block":"none"},T=($,D,{focusName:R=!1}={})=>{var Z;const N=document.getElementById("add-meet-form");N&&(N.style.display="none"),je=$,X={...D},dt();const V=document.getElementById("add-meet-form");V&&V.scrollIntoView({behavior:"smooth",block:"nearest"}),R&&((Z=document.getElementById("meet-name"))==null||Z.focus())},z=()=>({name:"",startDate:"",endDate:"",location:"",source:"",season:I});(M=document.getElementById("add-meet-btn"))==null||M.addEventListener("click",()=>T(null,z(),{focusName:!0})),(J=document.getElementById("add-meet-btn-empty"))==null||J.addEventListener("click",()=>T(null,z(),{focusName:!0})),(ie=document.getElementById("cancel-meet-btn"))==null||ie.addEventListener("click",()=>{Rt(),dt()}),(ge=document.getElementById("save-meet-btn"))==null||ge.addEventListener("click",async()=>{var le,Y;const $=document.getElementById("meet-name").value.trim(),D=document.getElementById("meet-start-date").value,R=document.getElementById("meet-end-date").value,N=document.getElementById("meet-location").value.trim(),V=((le=document.getElementById("meet-source"))==null?void 0:le.value.trim())||null,Z=((Y=document.getElementById("meet-season"))==null?void 0:Y.value)||I;if(!$||!D||!R){w(o("dash_meets_name_date_required"));return}w(null);try{je?await ue(L(k,"meets",je),{name:$,startDate:D,endDate:R,location:N,season:Z,sourceUrl:V}):await Bt(ae(k,"meets"),{name:$,startDate:D,endDate:R,location:N,season:Z,status:"Open",sourceUrl:V,createdAt:new Date}),Rt(),dt()}catch(we){console.error("Error saving meet:",we),w(`${o("dash_meets_save_failed")} ${(we==null?void 0:we.message)||""}`.trim())}}),document.querySelectorAll(".edit-meet").forEach($=>{$.addEventListener("click",()=>{T($.dataset.id,{name:$.dataset.name||"",startDate:$.dataset.start||"",endDate:$.dataset.end||"",location:$.dataset.location||"",source:$.dataset.source||"",season:$.dataset.season||I},{focusName:!0})})}),document.querySelectorAll(".delete-meet").forEach($=>{$.addEventListener("click",async()=>{if(confirm(o("dash_meets_confirm_delete")))try{const D=$.dataset.id;await Oe(L(k,"meets",D));try{const R=await ot(be(ae(k,vt),Et("meetId","==",D)));await Promise.all(R.docs.map(N=>Oe(N.ref)))}catch(R){console.warn("Volunteer hours cleanup failed for meet",D,R)}je===D&&Rt(),me===D&&(me=null)}catch(D){console.error("Error deleting meet:",D)}})}),document.querySelectorAll(".meet-fee-btn").forEach($=>{$.addEventListener("click",()=>{Yt($.dataset.id,$.dataset.name)})});const ne={sessionSlots:os,enrollments:is,currentPeriod:qt,viewMode:Ht,allRegistrations:oe,dbRole:ee,activeSwimmers:Ct(),onPeriodChange:$=>{qt=$,K()},onViewChange:$=>{Ht=$,K()}};xo(ne),(fe=document.getElementById("season-select"))==null||fe.addEventListener("change",$=>{I=$.target.value,K()}),(Le=document.getElementById("goto-deposits-link"))==null||Le.addEventListener("click",$=>{$.preventDefault(),H="deposits",K()}),(Ue=document.querySelector(".fee-summary-table tbody"))==null||Ue.addEventListener("click",$=>{const D=$.target.closest(".fee-summary-main-row");if(!D)return;const R=D.dataset.feeIndex,N=document.querySelector(`.fee-summary-detail-row[data-fee-detail="${R}"]`);if(!N)return;const V=D.querySelector(".fee-summary-expand-icon"),Z=N.classList.toggle("expanded");D.classList.toggle("expanded-row",Z),V&&(V.classList.toggle("expanded",Z),V.textContent=Z?"▼":"▶")}),(he=document.getElementById("fee-summary-export-btn"))==null||he.addEventListener("click",()=>{Wi()}),(Se=document.getElementById("deposits-season-select"))==null||Se.addEventListener("change",$=>{I=$.target.value,K()}),(te=document.getElementById("roster-season-select"))==null||te.addEventListener("change",$=>{I=$.target.value,K()}),(re=document.getElementById("deposits-add-btn"))==null||re.addEventListener("click",()=>{document.getElementById("deposits-add-form").style.display="block",document.getElementById("deposits-add-form").scrollIntoView({behavior:"smooth"})}),(S=document.getElementById("deposits-add-cancel"))==null||S.addEventListener("click",()=>{document.getElementById("deposits-add-form").style.display="none",document.getElementById("deposits-add-name").value="",document.getElementById("deposits-add-balance").value=""}),(P=document.getElementById("deposits-add-save"))==null||P.addEventListener("click",async()=>{const $=document.getElementById("deposits-add-name").value.trim(),D=parseFloat(document.getElementById("deposits-add-balance").value)||0;if(!$){alert("Swimmer name is required.");return}try{await Bt(ae(k,"deposits"),{swimmerName:$,season:I,balance:D,deposit1Amount:null,deposit1Date:null,deposit2Amount:null,deposit2Date:null,deposit3Amount:null,deposit3Date:null,updatedAt:new Date,updatedBy:(C==null?void 0:C.email)||"unknown"}),document.getElementById("deposits-add-form").style.display="none",document.getElementById("deposits-add-name").value="",document.getElementById("deposits-add-balance").value=""}catch(R){console.error("Error adding deposit:",R),alert("Failed to add deposit.")}}),(U=document.getElementById("deposits-upload-balance-btn"))==null||U.addEventListener("click",()=>{const $=document.createElement("input");$.type="file",$.accept=".xls,.xlsx",$.addEventListener("change",async D=>{var V;const R=(V=D.target.files)==null?void 0:V[0];if(D.target.remove(),!R)return;const N=await qi(R);if(!N){alert(o("dash_fee_summary_deposit_parse_error"));return}if(N.fatal){alert(Ls(N.fatal));return}Hi(N,R.name)}),$.click()}),(se=document.getElementById("deposits-upload-detail-btn"))==null||se.addEventListener("click",()=>{const $=document.createElement("input");$.type="file",$.accept=".xls,.xlsx",$.addEventListener("change",async D=>{var V;const R=(V=D.target.files)==null?void 0:V[0];if(D.target.remove(),!R)return;const N=await Ui(R);if(!N){alert(o("dash_fee_summary_deposit_parse_error"));return}if(N.fatal){alert(Ls(N.fatal));return}Ki(N,R.name)}),$.click()}),(Ee=document.getElementById("deposits-export-btn"))==null||Ee.addEventListener("click",()=>{Vi()}),Gi(),or(),(Me=document.getElementById("save-session-btn"))==null||Me.addEventListener("click",async()=>{const $=document.getElementById("session-message"),D=document.getElementById("session-cookie"),R=((D==null?void 0:D.value)||"").trim();if(!R){$&&($.textContent="请先粘贴 cookie。",$.style.color="var(--color-accent)");return}$&&($.textContent="保存中…",$.style.color="var(--text-muted)");try{const N=await ds(ls,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({cookie:R})}),V=await N.json().catch(()=>({}));if(!N.ok)throw new Error(V.message||`HTTP ${N.status}`);D&&(D.value=""),$&&($.textContent="已保存,正在验证…",$.style.color="var(--text-muted)"),await Ss($),K()}catch(N){$&&($.textContent=`❌ ${N.message}`,$.style.color="var(--color-accent)")}}),(Ke=document.getElementById("verify-session-btn"))==null||Ke.addEventListener("click",()=>{Ss()});const q=document.getElementById("results-athlete-select"),G=document.getElementById("refetch-one-btn");q==null||q.addEventListener("change",$=>{const D=$.target.value;if(D)Ut(D),G&&(G.disabled=!xs());else{const R=document.getElementById("results-viewer");R&&(R.style.display="none"),G&&(G.disabled=!0)}}),G==null||G.addEventListener("click",async()=>{var N;const $=q==null?void 0:q.value;if(!$)return;if(!We||!We.sessionId){alert("Please configure API credentials first.");return}G.disabled=!0,G.textContent="⏳ Fetching...";const D=document.getElementById("fetch-log");D.style.display="block";const R=(V,Z)=>{const le=document.createElement("div");le.textContent=`[${new Date().toLocaleTimeString()}] ${V}`,le.style.color=Z?"var(--color-accent)":"var(--text-primary)",D.appendChild(le),D.scrollTop=D.scrollHeight};try{R(`🔄 Force-refetching athlete ${$}...`);const V=((N=q.selectedOptions[0])==null?void 0:N.text)||"",Z=await Cn(We,$,V,{force:!0,onLog:(le,Y)=>R(`   ${le}`,Y),onBestTimes:le=>R(`   📊 bestTimes: ${le.length} entries`)});R(`✅ Done — ${Z.fetched} meets fetched, ${Z.failed} failed`),Z.errors.length>0&&(Z.errors.slice(0,5).forEach(le=>R(`   ⚠ ${le}`,!0)),Z.errors.length>5&&R(`   …and ${Z.errors.length-5} more`,!0)),Ut($),In()}catch(V){R(`❌ Refetch failed: ${V.message}`,!0)}finally{G.disabled=!1,G.textContent="🔄 Refetch Selected Athlete"}});const _e=async({buttonId:$,newOnly:D})=>{if(et)return;if(!xs()){alert("请先在「🔑 Data Hub Session」里粘贴并保存 cookie。");return}et=!0;const R=document.getElementById("fetch-log"),N=document.getElementById("fetch-status"),V=document.getElementById("fetch-all-btn"),Z=document.getElementById("fetch-new-btn"),le=document.getElementById($);R.style.display="block",R.innerHTML="",[V,Z].forEach(E=>{E&&(E.disabled=!0,E.textContent=E===le?"⏳ Fetching...":E.dataset.defaultLabel||E.textContent)});const Y=(E,gt)=>{const Ie=document.createElement("div");Ie.textContent=`[${new Date().toLocaleTimeString()}] ${E}`,Ie.style.color=gt?"var(--color-accent)":"var(--text-primary)",R.appendChild(Ie),R.scrollTop=R.scrollHeight},we=()=>{et=!1,[V,Z].forEach(E=>{E&&(E.disabled=!1,E.textContent=E.dataset.defaultLabel||E.textContent)})};try{await gi(We,E=>{switch(E.type){case"start":Y(`🚀 Starting ${D?"new-athlete":"full"} fetch for ${E.total} athlete(s)...`),N.textContent=`⏳ 0 / ${E.total}`,N.style.color="var(--text-primary)";break;case"no-new":Y(`🆕 ${E.message}`,!1),N.textContent="✅ No new athletes",N.style.color="#16A34A",we();break;case"swimmer-start":Y(`🔄 ${E.name} (${E.memberId})...`);break;case"step":Y(`   📊 ${E.step}: ${E.count} entries`);break;case"log":Y(`   ${E.message}`,E.isError);break;case"swimmer-done":E.initialComplete&&Y("   🆕 Marked as fully initialized"),E.written?Y(`   ✅ Written: ${E.bestTimes} best times, ${E.meets} meets (${E.newMeets} new${E.failedMeets>0?`, ${E.failedMeets} failed`:""})`):Y("   ⏭ Skipped: no new meets");const gt=document.getElementById(`status-${E.memberId}`);gt&&(gt.innerHTML=`<span style="color:#16A34A;">✅ ${E.bestTimes} best times, ${E.meets} meets</span>`);break;case"swimmer-error":{Y(`   ❌ Failed: ${E.error}`,!0);const Ie=document.getElementById(`status-${E.memberId}`);Ie&&(Ie.innerHTML=`<span style="color:var(--color-accent);">❌ ${g(E.error)}</span>`);break}case"auth-error":Y(`   🔐 Authentication failed — stopping run. Update API credentials. (${E.message})`,!0),N.textContent="❌ Auth error — update credentials",N.style.color="var(--color-accent)";break;case"blocked-abort":Y("",!1),Y(`⛔ Stopping early: ${E.count} athletes in a row failed on their very first request with no response.`,!0),Y("   The API is either unreachable right now, or it is rejecting the request before it gets read.",!0),Y("   Nothing was lost — every meet already fetched is saved, and a later run resumes from there.",!0),N.textContent=`⛔ Stopped early at ${E.attempted} / ${E.total}`,N.style.color="var(--color-accent)";break;case"progress":N.textContent=`⏳ ${E.index} / ${E.total} (✅ ${E.success} ❌ ${E.failed})`;break;case"done":E.authError?(Y(`⛔ Stopped after ${E.attempted}/${E.total} athlete(s): the Data Hub session expired — paste a fresh cookie.`,!0),As().then(()=>K()).catch(()=>{})):E.blockedAbort?Y(`⛔ Run stopped early — ${E.success} succeeded, ${E.failed} failed. Retry when the API is reachable again.`,!0):(N.textContent=`✅ Done: ${E.success} succeeded, ${E.failed} failed`,N.style.color=E.failed>0?"var(--color-accent)":"#16A34A",Y(""),Y(`✅ Fetch complete — ${E.success} succeeded, ${E.failed} failed`)),E.errors.length>0&&(Y("Error details:",!0),E.errors.forEach(Ie=>Y(`  • ${Ie}`,!0))),we();break;case"error":Y(`❌ ${E.message}`,!0),N.textContent="❌ Failed",N.style.color="var(--color-accent)",we();break}},{newOnly:D})}catch(E){Y(`❌ Fetch runner error: ${E.message}`,!0),N.textContent="❌ Failed",N.style.color="var(--color-accent)"}finally{we()}},Be=document.getElementById("fetch-all-btn"),ke=document.getElementById("fetch-new-btn");Be&&(Be.dataset.defaultLabel="🔄 Fetch All Swimmer Results"),ke&&(ke.dataset.defaultLabel="🆕 Fetch New Athletes Only"),Be==null||Be.addEventListener("click",()=>_e({buttonId:"fetch-all-btn",newOnly:!1})),ke==null||ke.addEventListener("click",()=>_e({buttonId:"fetch-new-btn",newOnly:!0}))}}Mo();
