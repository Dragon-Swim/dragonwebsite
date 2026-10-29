import"./modulepreload-polyfill-B5Qt9EMX.js";import{o as P,b as O,h as y,g as v,e as $,i as E,q as _,c as k,x as q}from"./firebase-CAICEMn2.js";import{c as H,s as G,i as Y,S as J}from"./meetEntryExport-C8Xz4HGa.js";const T=document.getElementById("mp-root"),b=new URLSearchParams(window.location.search),w=(b.get("meet")||"").trim(),D=(b.get("family")||"").trim(),W=b.get("status")==="all",z=b.get("print")==="1",M=b.get("group")==="sex"?"sex":"family",K="dragonswim@outlook.com",a=e=>String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]),h=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],Q=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];function I(e){const t=/^(\d{4})-(\d{2})-(\d{2})/.exec(String(e||""));return t?{y:+t[1],m:+t[2],d:+t[3]}:null}function F(e){const t=I(e);return t?`${Q[new Date(Date.UTC(t.y,t.m-1,t.d)).getUTCDay()]} ${h[t.m-1]} ${t.d}`:""}function B(e,t){const n=I(e),s=I(t)||n;return n?s?n.y===s.y&&n.m===s.m?`${h[n.m-1]} ${n.d}–${s.d}, ${n.y}`:n.y===s.y?`${h[n.m-1]} ${n.d} – ${h[s.m-1]} ${s.d}, ${n.y}`:`${h[n.m-1]} ${n.d}, ${n.y} – ${h[s.m-1]} ${s.d}, ${s.y}`:`${h[n.m-1]} ${n.d}, ${n.y}`:""}function N(e){if(!e)return"";const t=String(e),n=new Date(t);if(Number.isNaN(n.getTime()))return F(t);const s=`${h[n.getMonth()]} ${n.getDate()}, ${n.getFullYear()}`;return/T\d{2}:\d{2}/.test(t)?`${s} at ${n.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})}`:s}const x=e=>`$${Number(e).toFixed(2).replace(/\.00$/,"")}`;function U(){const e=new Date;return`${h[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()} at `+e.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})}function R(e,{error:t=!1}={}){T.innerHTML=`<div class="mp-state${t?" mp-state--error":""}">${e}</div>`}function V(){R("<p>Loading the entry sheet…</p>")}function g(e,t=""){R(`<p>${a(e)}</p>${t?`<p>${t}</p>`:""}`,{error:!0})}async function X(e){try{const t=await y(v($,"users",e.uid)),n=t.exists()?t.data().role:null,s=e.email&&e.email.toLowerCase()===K;return n==="coach"||n==="admin"||s?"coach":"family"}catch{return"family"}}async function A(e){const t=await y(v($,"registrations",e.uid));if(t.exists())return{familyId:t.id,family:t.data()};if(e.email)try{const n=await E(_(k($,"registrations"),q("parentEmails","array-contains",e.email)));if(!n.empty)return{familyId:n.docs[0].id,family:n.docs[0].data()}}catch{}return{familyId:null,family:null}}async function Z({role:e,meetId:t,familyId:n,swimmers:s}){const i=k($,"meets",t,"entries");if(e==="coach"){const c=(await E(i)).docs.map(o=>({id:o.id,...o.data()}));return D?c.filter(o=>o.familyId===D):c}const m=[];for(const d of s){const c=String(d.usaSwimmingId||"").trim().toUpperCase();if(!(!n||!c))try{const o=await y(v(i,`${n}__${c}`));o.exists()&&m.push({id:o.id,...o.data()})}catch(o){console.warn("meet-print: entry not readable",c,o==null?void 0:o.message)}}return m}async function ee(e){const t=[...new Set(e.map(s=>String(s.usaSwimmingId||"").trim()).filter(Boolean))],n={};return await Promise.all(t.map(async s=>{try{const i=await y(v($,"swimResults",s));n[s]=(i.exists()?i.data().bestTimes:[])||[]}catch{n[s]=[]}})),n}function te(e,t){const n=new Map;for(const i of e.rows){const m=i.familyId||"unknown";if(!n.has(m)){const o=t.get(m)||null,u=(o==null?void 0:o.parent)||{};n.set(m,{familyId:m,parentName:[u.firstName,u.lastName].filter(Boolean).join(" ")||(o==null?void 0:o.parentName)||(o==null?void 0:o.email)||"",email:u.email||(o==null?void 0:o.email)||"",swimmers:new Map,rows:[]})}const d=n.get(m);d.rows.push(i);const c=i.usaSwimmingId||i.swimmerName;d.swimmers.has(c)||d.swimmers.set(c,{usaSwimmingId:i.usaSwimmingId,swimmerName:i.swimmerName,ageAtMeet:i.ageAtMeet,rows:[]}),d.swimmers.get(c).rows.push(i)}const s=[...n.values()];return s.sort((i,m)=>String(i.parentName).localeCompare(String(m.parentName))),s}async function ne(e){const t=new Map;return await Promise.all(e.map(async n=>{if(!(!n||n==="unknown"))try{const s=await y(v($,"registrations",n));s.exists()&&t.set(n,s.data())}catch{}})),t}const se={SCY:"Yards",LCM:"Long Course Meters",SCM:"Short Course Meters"};function ae(e){return e.state==="missing"||!e.seedTimeText?"NT":`${e.seedTimeText}${e.courseLetter||""}`}function ie(e){const t=e.events.map(n=>`<div class="mp-rep-event">
        <span class="mp-rep-no">#${a(n.eventNo)}</span>
        <span class="mp-rep-label">${a(n.eventSexLabel)} ${a(n.ageGroup)} ${a(n.eventLabel)}</span>
        <span class="mp-rep-time">${a(ae(n))}</span>
      </div>`).join("");return`<div class="mp-rep-swimmer" data-swimmer="${a(e.usaSwimmingId||e.swimmerName)}">
    <div class="mp-rep-name">${a(e.swimmerName)}${e.ageAtMeet!=null?` (${a(e.ageAtMeet)})`:""}</div>
    ${t}
  </div>`}function oe(e){const t=(e.courses||[]).map(s=>se[s]||s).join(" / "),n=[e.sanction?`Sanction: ${a(e.sanction)}`:"",e.location?`Location: ${a(e.location)}`:""].filter(Boolean).join(" &middot; ");return`<header class="mp-head mp-head--report">
    <div class="mp-brand">Dragon Swim Team</div>
    <h1>Individual Meet Entries Report</h1>
    <div class="mp-meet-name">${a(e.name||"Meet")}
      &nbsp;&nbsp;${a(B(e.startDate,e.endDate))}${t?`&nbsp;&nbsp;${a(t)}`:""}</div>
    <div class="mp-meet-meta">
      ${n}${n?"<br />":""}Generated ${a(U())}${e.entryDeadline?` &middot; entries close ${a(N(e.entryDeadline))}`:""}
    </div>
  </header>`}function re(e,t){const n=t.filter(p=>!p.relay),s=t.filter(p=>p.relay),i=Y(n),m=(p,S)=>S.length?`<section class="mp-rep-section" data-section="${a(p)}">
      <h2 class="mp-rep-title">${a(p)}</h2>
      ${S.map(ie).join("")}
    </section>`:"",d=i.filter(p=>p.gender==="F"),c=i.filter(p=>p.gender==="M"),o=p=>p.reduce((S,j)=>S+j.events.length,0),f=i.length?`${m("FEMALE",d)}${m("MALE",c)}`:'<div class="mp-note">No entries to show for this meet yet.</div>',r=i.length?`<div class="mp-rep-totals">
      <div><span>Female IE's:</span><span>${o(d)}</span></div>
      <div><span>Male IE's:</span><span>${o(c)}</span></div>
      <div><span>Total IE's:</span><span>${o(d)+o(c)}</span></div>
      <div><span>Total Athletes:</span><span>${i.length}</span></div>
    </div>`:"",l=s.length?'<div class="mp-note">Relay entries are arranged by the coach and are not listed per swimmer.</div>':"";return`${f}${r}${l}
    <div class="mp-report-note">
      Sorted by surname within each section. Send any correction to the coach before the entry deadline.
    </div>`}function me(e){return e.state==="missing"?'<span class="mp-badge mp-badge--bad">No time</span>':e.state==="manual"?'<span class="mp-badge mp-badge--warn">Typed time</span>':e.state==="qualified"?'<span class="mp-badge mp-badge--ok">Qualifies</span>':'<span class="mp-badge mp-badge--muted">Bonus entry</span>'}function ce(e){return e.map(t=>`
        <tr class="mp-row" data-event="${a(t.eventNo)}">
          <td class="mp-num">${a(F(t.day))}</td>
          <td>${a(t.sessionLabel||"")}</td>
          <td>
            <span class="mp-event-name">#${a(t.eventNo)} ${a(t.eventLabel)}</span>
            <span class="mp-group">${a(t.ageGroup||"")}${t.relay?" · relay":""}</span>
          </td>
          <td class="mp-num">${a(t.seedTimeText||"—")}${t.course?` <span class="mp-group">${a(t.course)}</span>`:""}</td>
          <td class="mp-num">${a(t.standardText||"—")}</td>
          <td>${me(t)}</td>
        </tr>`).join("")}function de(e,t){var r;const n=e.rows,s=n.filter(l=>l.changed),i=Number(t==null?void 0:t.entryFeePerEvent),m=Number.isFinite(i)?`<div class="mp-fees">
         <span>Estimated entry fees: ${n.length} × ${x(i)}</span>
         <span class="mp-fees-total">${x(n.length*i)}</span>
       </div>`:"",d=n.filter(l=>l.status!=="confirmed"),c=d.length?`<div class="mp-note">${a(J[d[0].status]||d[0].status)} — not part of the submitted file yet.</div>`:"",o=s.length?`<div class="mp-note mp-note--update">
         Times updated since you submitted:
         ${s.map(l=>`${a(l.eventLabel)} ${a(l.storedSeedTimeText||"—")} → <strong>${a(l.seedTimeText)}</strong>`).join("; ")}
       </div>`:"",u=n.some(l=>l.state==="missing")?'<div class="mp-note mp-note--bad">An event has no seed time yet — the meet does not accept NT, so it cannot be submitted as it stands.</div>':"",f=[e.ageAtMeet!=null?`Age ${e.ageAtMeet} at the meet`:"",((r=n[0])==null?void 0:r.ageGroup)||"",e.usaSwimmingId?`USA-S ${e.usaSwimmingId}`:"no USA Swimming ID"].filter(Boolean).join(" · ");return n.length?`<article class="mp-swimmer" data-swimmer="${a(e.usaSwimmingId||e.swimmerName)}">
    <div class="mp-swimmer-head"><h3>${a(e.swimmerName)}</h3><span class="mp-swimmer-sub">${a(f)}</span></div>
    <table class="mp-events">
      <thead>
        <tr><th>Day</th><th>Session</th><th>Event</th><th>Seed time</th><th>Cut-off</th><th>Status</th></tr>
      </thead>
      <tbody>${ce(n)}</tbody>
    </table>
    ${c}${o}${u}${m}
  </article>`:`<article class="mp-swimmer" data-swimmer="${a(e.usaSwimmingId||e.swimmerName)}">
      <div class="mp-swimmer-head"><h3>${a(e.swimmerName)}</h3><span class="mp-swimmer-sub">${a(f)}</span></div>
      <div class="mp-note">No events entered.</div>
    </article>`}function le(e,t){const n=[...e.swimmers.values()],s=e.parentName?`${e.parentName}`:"Family",i=[e.email].filter(Boolean).join(" · ");return`<section class="mp-family" data-family="${a(e.familyId)}">
    <div class="mp-family-head">
      <h2>${a(s)}</h2>
      <div class="mp-family-meta">${a(i)}</div>
    </div>
    ${n.map(m=>de(m,t)).join("")}
    <div class="mp-sign">
      <label><input type="checkbox" /> I confirm these entries are correct, and that any change must be
        reported before the entry deadline.</label>
      <div class="mp-sign-line"><span>Signature</span><span>Date</span></div>
    </div>
  </section>`}function L(e,t,n){const s=G({rows:e.rows,excluded:n,noId:e.noId}),i=[];return s.missing&&i.push(`<li class="mp-check-error">${s.missing} row(s) have no seed time</li>`),s.noUsaId&&i.push(`<li class="mp-check-error">${s.noUsaId} confirmed swimmer(s) have no USA Swimming ID</li>`),s.notConfirmed&&i.push(`<li class="mp-check-warn">${s.notConfirmed} entr(y/ies) not confirmed and therefore not in the file</li>`),s.refreshed&&i.push(`<li class="mp-check-warn">${s.refreshed} seed time(s) changed since submission — sheets below show the new value</li>`),s.manual&&i.push(`<li class="mp-check-warn">${s.manual} row(s) rely on a typed seed time</li>`),s.bonusOnly&&i.push(`<li class="mp-check-warn">${s.bonusOnly} row(s) are slower than the line (bonus entries)</li>`),`<div class="mp-check">
    <h2>Pre-flight (coach view)</h2>
    <div>${s.swimmerCount} swimmer(s) · ${s.rowCount} event(s) ·
      ${s.qualified} qualifying · deadline ${a(N(t.entryDeadline)||"n/a")}</div>
    ${i.length?`<ul>${i.join("")}</ul>`:"<div>Nothing outstanding.</div>"}
  </div>`}function pe(e){return`<header class="mp-head">
    <div class="mp-brand">Dragon Swim Team</div>
    <h1>Meet entry confirmation</h1>
    <div class="mp-meet-name">${a(e.name||"Meet")}</div>
    <div class="mp-meet-meta">
      ${a(B(e.startDate,e.endDate))}${e.location?` · ${a(e.location)}`:""}
      ${e.entryDeadline?`<br />Entries close ${a(N(e.entryDeadline))}`:""}
      <br />Generated ${a(U())}
    </div>
  </header>`}function C({meet:e,built:t,families:n,role:s}){var d;const i=`<div class="mp-toolbar">
      <button type="button" class="mp-print-btn">🖨 Print / Save as PDF</button>
      <span class="mp-toolbar-note">Choose “Save as PDF” in the print dialog${M==="sex"?" to email the team report to families.":" to email this sheet to the family."}</span>
    </div>`,m=M==="sex"?`<div class="mp-sheet mp-sheet--report" data-meet="${a(e.id||w)}">
        ${oe(e)}
        ${s==="coach"?L(t,e,t.excluded):""}
        ${re(e,t.rows)}
      </div>`:`<div class="mp-sheet" data-meet="${a(e.id||w)}">
        ${pe(e)}
        ${s==="coach"?L(t,e,t.excluded):""}
        ${n.length?n.map(c=>le(c,e)).join(""):'<div class="mp-note">No entries to show for this meet yet.</div>'}
      </div>`;T.innerHTML=`${i}${m}`,(d=T.querySelector(".mp-print-btn"))==null||d.addEventListener("click",()=>{try{window.print()}catch{}}),z&&setTimeout(()=>{try{window.print()}catch{}},150)}async function ue(e){var f;if(!w){g("This link is missing the meet id.","Ask the coach for the link again.");return}const t=await X(e);let n;try{const r=await y(v($,"meets",w));if(!r.exists()){g("That meet could not be found.","It may have been removed.");return}n={id:r.id,...r.data()}}catch(r){g("Could not read the meet.",a((r==null?void 0:r.message)||""));return}let s=null,i=[];if(t==="family"){const r=await A(e);if(s=r.familyId,i=(((f=r.family)==null?void 0:f.swimmers)||[]).filter(l=>!l.deleted),!s){g("We could not find your registration.","Sign in with the account you registered with, or ask the coach.");return}}let m=[];try{m=await Z({role:t,meetId:w,familyId:s,swimmers:i})}catch(r){g("Could not read the entries for this meet.",a((r==null?void 0:r.message)||""));return}const d=await ee(m),c=H({meet:n,entries:m,bestTimesById:d,statuses:W?["confirmed","submitted","draft","declined"]:["confirmed"]}),o=await ne([...new Set(c.rows.map(r=>r.familyId))]);if(t==="family"){const r=await A(e);r.familyId&&o.set(r.familyId,r.family)}const u=te(c,o);if(!u.length){C({meet:n,built:c,families:[],role:t});return}C({meet:n,built:c,families:u,role:t})}V();P(O,e=>{if(!e){window.location.href="/signin.html";return}ue(e).catch(t=>{console.error("meet-print failed:",t),g("Something went wrong while building the sheet.",a((t==null?void 0:t.message)||""))})});
