import"./modulepreload-polyfill-B5Qt9EMX.js";import{o as H,b as W,i as N,h as I,e as y,j as L,q as J,c as D,y as K}from"./firebase-IgpvQS_k.js";import{c as z,s as Q,i as V,g as X,S as Z}from"./meetEntryExport-ROc-jNar.js";const q=["Back","Breast","Fly","Free"],ee={FR:"Free",MED:"Medley",FLY:"Fly",BK:"Back",BR:"Breast",IM:"IM"};function te(e){const t=String(e||"").trim().toUpperCase();return ee[t]||t}function j(e){const t=String((e==null?void 0:e.gender)||"").trim().toUpperCase();return t==="F"?"Female":t==="M"?"Male":""}function ne(e,t){const n=Number(t)-1;return!Number.isInteger(n)||n<0?"":String(e||"").trim().toUpperCase()==="MED"?q[n]||"":String(n+1)}function O(e){const t=(e==null?void 0:e.distance)!=null&&e.distance!==""?`${e.distance} `:"",n=te(e==null?void 0:e.stroke);return`${t}${n}${n?" ":""}Relay`.trim()}function se(e){return[j(e),e==null?void 0:e.ageGroup,O(e),e==null?void 0:e.letter].filter(Boolean).join(" ").trim()}function ae(e){return[e==null?void 0:e.firstName,e==null?void 0:e.lastName].filter(Boolean).join(" ").trim()}function ie(e=[]){const t=new Map,n=new Map,s=[];for(const r of e){const c=((r==null?void 0:r.legs)||[]).map((o,p)=>o?{leg:o,order:p+1}:null).filter(Boolean);if(!c.length)continue;const m={id:r.id||null,eventNo:r.eventNo??null,eventCode:r.eventCode||"",letter:String(r.letter||"").trim().toUpperCase(),title:O(r),label:se(r),sexLabel:j(r),ageGroup:r.ageGroup||"",seconds:Number.isFinite(r.seedSeconds)?r.seedSeconds:null,courseLetter:r.courseLetter||"",legs:c.map(({leg:o,order:p})=>({order:p,name:ae(o),age:(o==null?void 0:o.ageAtMeet)??null,gender:(o==null?void 0:o.gender)||r.gender||null,usaSwimmingId:String((o==null?void 0:o.usaSwimmingId)||"").trim().toUpperCase(),role:ne(r.stroke,p)}))};s.push(m);for(const o of m.legs){if(!o.usaSwimmingId)continue;const p={eventNo:m.eventNo,eventCode:m.eventCode,letter:m.letter,label:m.label,role:o.role,legOrder:o.order,title:m.title};t.has(o.usaSwimmingId)||t.set(o.usaSwimmingId,[]),t.get(o.usaSwimmingId).push(p),n.get(o.usaSwimmingId)||n.set(o.usaSwimmingId,{usaSwimmingId:o.usaSwimmingId,swimmerName:o.name,ageAtMeet:o.age,gender:o.gender})}}const a=(r,c)=>Number(r.eventNo??0)-Number(c.eventNo??0)||String(r.letter).localeCompare(String(c.letter));for(const r of t.values())r.sort(a);return s.sort(a),{bySwimmer:t,squads:s,swimmers:n}}const T=document.getElementById("mp-root"),M=new URLSearchParams(window.location.search),b=(M.get("meet")||"").trim(),A=(M.get("family")||"").trim(),oe=M.get("status")==="all",re=M.get("print")==="1",k=M.get("group")==="sex"?"sex":"family",me="dragonswim@outlook.com",i=e=>String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]),v=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],le=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];function C(e){const t=/^(\d{4})-(\d{2})-(\d{2})/.exec(String(e||""));return t?{y:+t[1],m:+t[2],d:+t[3]}:null}function P(e){const t=C(e);return t?`${le[new Date(Date.UTC(t.y,t.m-1,t.d)).getUTCDay()]} ${v[t.m-1]} ${t.d}`:""}function _(e,t){const n=C(e),s=C(t)||n;return n?s?n.y===s.y&&n.m===s.m?`${v[n.m-1]} ${n.d}–${s.d}, ${n.y}`:n.y===s.y?`${v[n.m-1]} ${n.d} – ${v[s.m-1]} ${s.d}, ${n.y}`:`${v[n.m-1]} ${n.d}, ${n.y} – ${v[s.m-1]} ${s.d}, ${s.y}`:`${v[n.m-1]} ${n.d}, ${n.y}`:""}function E(e){if(!e)return"";const t=String(e),n=new Date(t);if(Number.isNaN(n.getTime()))return P(t);const s=`${v[n.getMonth()]} ${n.getDate()}, ${n.getFullYear()}`;return/T\d{2}:\d{2}/.test(t)?`${s} at ${n.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})}`:s}const x=e=>`$${Number(e).toFixed(2).replace(/\.00$/,"")}`;function G(){const e=new Date;return`${v[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()} at `+e.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})}function R(e,{error:t=!1}={}){T.innerHTML=`<div class="mp-state${t?" mp-state--error":""}">${e}</div>`}function ce(){R("<p>Loading the entry sheet…</p>")}function S(e,t=""){R(`<p>${i(e)}</p>${t?`<p>${t}</p>`:""}`,{error:!0})}async function de(e){try{const t=await N(I(y,"users",e.uid)),n=t.exists()?t.data().role:null,s=e.email&&e.email.toLowerCase()===me;return n==="coach"||n==="admin"||s?"coach":"family"}catch{return"family"}}async function F(e){const t=await N(I(y,"registrations",e.uid));if(t.exists())return{familyId:t.id,family:t.data()};if(e.email)try{const n=await L(J(D(y,"registrations"),K("parentEmails","array-contains",e.email)));if(!n.empty)return{familyId:n.docs[0].id,family:n.docs[0].data()}}catch{}return{familyId:null,family:null}}async function pe({role:e,meetId:t,familyId:n,swimmers:s}){const a=D(y,"meets",t,"entries");if(e==="coach"){const m=(await L(a)).docs.map(o=>({id:o.id,...o.data()}));return A?m.filter(o=>o.familyId===A):m}const r=[];for(const c of s){const m=String(c.usaSwimmingId||"").trim().toUpperCase();if(!(!n||!m))try{const o=await N(I(a,`${n}__${m}`));o.exists()&&r.push({id:o.id,...o.data()})}catch(o){console.warn("meet-print: entry not readable",m,o==null?void 0:o.message)}}return r}async function ue(e){try{return(await L(D(y,"meets",e,"relayEntries"))).docs.map(n=>({id:n.id,...n.data()}))}catch(t){return console.warn("meet-print: relay squads not readable",t==null?void 0:t.message),[]}}async function he(e){const t=[...new Set(e.map(s=>String(s.usaSwimmingId||"").trim()).filter(Boolean))],n={};return await Promise.all(t.map(async s=>{try{const a=await N(I(y,"swimResults",s));n[s]=(a.exists()?a.data().bestTimes:[])||[]}catch{n[s]=[]}})),n}function fe(e,t){const n=new Map;for(const a of e.rows){const r=a.familyId||"unknown";if(!n.has(r)){const o=t.get(r)||null,p=(o==null?void 0:o.parent)||{};n.set(r,{familyId:r,parentName:[p.firstName,p.lastName].filter(Boolean).join(" ")||(o==null?void 0:o.parentName)||(o==null?void 0:o.email)||"",email:p.email||(o==null?void 0:o.email)||"",swimmers:new Map,rows:[]})}const c=n.get(r);c.rows.push(a);const m=a.usaSwimmingId||a.swimmerName;c.swimmers.has(m)||c.swimmers.set(m,{usaSwimmingId:a.usaSwimmingId,swimmerName:a.swimmerName,ageAtMeet:a.ageAtMeet,rows:[]}),c.swimmers.get(m).rows.push(a)}const s=[...n.values()];return s.sort((a,r)=>String(a.parentName).localeCompare(String(r.parentName))),s}async function ge(e){const t=new Map;return await Promise.all(e.map(async n=>{if(!(!n||n==="unknown"))try{const s=await N(I(y,"registrations",n));s.exists()&&t.set(n,s.data())}catch{}})),t}const $e={SCY:"Yards",LCM:"Long Course Meters",SCM:"Short Course Meters"};function ve(e){return e.state==="missing"||!e.seedTimeText?"NT":`${e.seedTimeText}${e.courseLetter||""}`}function ye(e,t=[]){const s=[...e.events.map(a=>({eventNo:a.eventNo,html:`<div class="mp-rep-event">
        <span class="mp-rep-no">#${i(a.eventNo)}</span>
        <span class="mp-rep-label">${i(a.eventSexLabel)} ${i(a.ageGroup)} ${i(a.eventLabel)}</span>
        <span class="mp-rep-time">${i(ve(a))}</span>
      </div>`})),...t.map(a=>({eventNo:a.eventNo,html:`<div class="mp-rep-event mp-rep-event--relay">
        <span class="mp-rep-no">#${i(a.eventNo)}</span>
        <span class="mp-rep-label">${i(a.label)}</span>
        <span class="mp-rep-time mp-rep-role">${i(a.role)}</span>
      </div>`}))].sort((a,r)=>Number(a.eventNo??0)-Number(r.eventNo??0)).map(a=>a.html).join("");return`<div class="mp-rep-swimmer" data-swimmer="${i(e.usaSwimmingId||e.swimmerName)}">
    <div class="mp-rep-name">${i(e.swimmerName)}${e.ageAtMeet!=null?` (${i(e.ageAtMeet)})`:""}</div>
    ${s}
  </div>`}function we(e){const t=(e.courses||[]).map(s=>$e[s]||s).join(" / "),n=[e.sanction?`Sanction: ${i(e.sanction)}`:"",e.location?`Location: ${i(e.location)}`:""].filter(Boolean).join(" &middot; ");return`<header class="mp-head mp-head--report">
    <div class="mp-brand">Dragon Swim Team</div>
    <h1>Individual Meet Entries Report</h1>
    <div class="mp-meet-name">${i(e.name||"Meet")}
      &nbsp;&nbsp;${i(_(e.startDate,e.endDate))}${t?`&nbsp;&nbsp;${i(t)}`:""}</div>
    <div class="mp-meet-meta">
      ${n}${n?"<br />":""}Generated ${i(G())}${e.entryDeadline?` &middot; entries close ${i(E(e.entryDeadline))}`:""}
    </div>
  </header>`}function Se(e,t,n=null){const s=t.filter(l=>!l.relay),a=V(s),r=(n==null?void 0:n.bySwimmer)||new Map,c=new Set(a.map(l=>String(l.usaSwimmingId||"").toUpperCase()));for(const[l,u]of(n==null?void 0:n.swimmers)||new Map){if(c.has(l))continue;const f=String(u.swimmerName||"").trim().split(/\s+/).filter(Boolean);a.push({usaSwimmingId:l,swimmerName:u.swimmerName,lastName:f.length>1?f[f.length-1]:f[0]||"",firstName:f.length>1?f.slice(0,-1).join(" "):"",ageAtMeet:u.ageAtMeet,gender:String(u.gender||"").toUpperCase().startsWith("F")?"F":"M",events:[],relayOnly:!0})}a.sort((l,u)=>String(l.lastName||l.swimmerName).localeCompare(String(u.lastName||u.swimmerName))||String(l.firstName||"").localeCompare(String(u.firstName||"")));const m=(l,u)=>u.length?`<section class="mp-rep-section" data-section="${i(l)}">
      <h2 class="mp-rep-title">${i(l)}</h2>
      ${u.map(f=>ye(f,r.get(String(f.usaSwimmingId||"").toUpperCase())||[])).join("")}
    </section>`:"",o=a.filter(l=>l.gender==="F"),p=a.filter(l=>l.gender==="M"),g=l=>l.reduce((u,f)=>u+f.events.length,0),$=(n==null?void 0:n.squads)||[],w=a.length?`${m("FEMALE",o)}${m("MALE",p)}`:'<div class="mp-note">No entries to show for this meet yet.</div>',h=a.length||$.length?`<div class="mp-rep-totals">
      <div data-metric="female-ies"><span>Female IE's:</span><span>${g(o)}</span></div>
      <div data-metric="male-ies"><span>Male IE's:</span><span>${g(p)}</span></div>
      <div data-metric="total-ies"><span>Total IE's:</span><span>${g(o)+g(p)}</span></div>
      <div data-metric="relay-entries"><span>Relay entries:</span><span>${$.length}</span></div>
      <div data-metric="athletes"><span>Total Athletes:</span><span>${a.length}</span></div>
    </div>`:"",Y=$.length?`<section class="mp-rep-section mp-rep-relays" data-section="RELAYS">
        <h2 class="mp-rep-title">RELAYS</h2>
        ${$.map(l=>`<div class="mp-relay" data-relay="${i(l.eventCode)}-${i(l.letter)}">
          <div class="mp-relay-head">
            <span class="mp-relay-no">#${i(l.eventNo)}</span>
            <span class="mp-relay-label">${i(l.label)}</span>
            <span class="mp-relay-time">${l.seconds==null?"NT":`${i(X(l.seconds))}${i(l.courseLetter)}`}</span>
          </div>
          <ol class="mp-relay-legs">${l.legs.map(u=>`<li>${i(u.name)}${u.age!=null?` (${i(u.age)})`:""}
            <span class="mp-relay-role">${i(u.role)}</span></li>`).join("")}</ol>
        </div>`).join("")}
      </section>`:"";return`${w}${Y}${h}
    <div class="mp-report-note">
      Sorted by surname within each section. Relay times are entered by the coach.
      Send any correction to the coach before the entry deadline.
    </div>`}function be(e){return e.state==="missing"?'<span class="mp-badge mp-badge--bad">No time</span>':e.state==="manual"?'<span class="mp-badge mp-badge--warn">Typed time</span>':e.state==="qualified"?'<span class="mp-badge mp-badge--ok">Qualifies</span>':'<span class="mp-badge mp-badge--muted">Bonus entry</span>'}function Ne(e){return e.map(t=>`
        <tr class="mp-row" data-event="${i(t.eventNo)}">
          <td class="mp-num">${i(P(t.day))}</td>
          <td>${i(t.sessionLabel||"")}</td>
          <td>
            <span class="mp-event-name">#${i(t.eventNo)} ${i(t.eventLabel)}</span>
            <span class="mp-group">${i(t.ageGroup||"")}${t.relay?" · relay":""}</span>
          </td>
          <td class="mp-num">${i(t.seedTimeText||"—")}${t.course?` <span class="mp-group">${i(t.course)}</span>`:""}</td>
          <td class="mp-num">${i(t.standardText||"—")}</td>
          <td>${be(t)}</td>
        </tr>`).join("")}function Ie(e,t,n=[]){var w;const s=e.rows,a=s.filter(h=>h.changed),r=Number(t==null?void 0:t.entryFeePerEvent),c=Number.isFinite(r)?`<div class="mp-fees">
         <span>Estimated entry fees: ${s.length} × ${x(r)}</span>
         <span class="mp-fees-total">${x(s.length*r)}</span>
       </div>`:"",m=s.filter(h=>h.status!=="confirmed"),o=m.length?`<div class="mp-note">${i(Z[m[0].status]||m[0].status)} — not part of the submitted file yet.</div>`:"",p=a.length?`<div class="mp-note mp-note--update">
         Times updated since you submitted:
         ${a.map(h=>`${i(h.eventLabel)} ${i(h.storedSeedTimeText||"—")} → <strong>${i(h.seedTimeText)}</strong>`).join("; ")}
       </div>`:"",g=s.some(h=>h.state==="missing")?'<div class="mp-note mp-note--bad">An event has no seed time yet — the meet does not accept NT, so it cannot be submitted as it stands.</div>':"",$=[e.ageAtMeet!=null?`Age ${e.ageAtMeet} at the meet`:"",((w=s[0])==null?void 0:w.ageGroup)||"",e.usaSwimmingId?`USA-S ${e.usaSwimmingId}`:"no USA Swimming ID"].filter(Boolean).join(" · "),d=n.length?`<div class="mp-note mp-note--relay">Relay: ${n.map(h=>`${i(h.label)} — ${i(h.role)}`).join("; ")}</div>`:"";return s.length?`<article class="mp-swimmer" data-swimmer="${i(e.usaSwimmingId||e.swimmerName)}">
    <div class="mp-swimmer-head"><h3>${i(e.swimmerName)}</h3><span class="mp-swimmer-sub">${i($)}</span></div>
    <table class="mp-events">
      <thead>
        <tr><th>Day</th><th>Session</th><th>Event</th><th>Seed time</th><th>Cut-off</th><th>Status</th></tr>
      </thead>
      <tbody>${Ne(s)}</tbody>
    </table>
    ${d}${o}${p}${g}${c}
  </article>`:`<article class="mp-swimmer" data-swimmer="${i(e.usaSwimmingId||e.swimmerName)}">
      <div class="mp-swimmer-head"><h3>${i(e.swimmerName)}</h3><span class="mp-swimmer-sub">${i($)}</span></div>
      <div class="mp-note">No events entered.</div>
      ${d}
    </article>`}function Me(e,t,n=new Map){const s=[...e.swimmers.values()],a=e.parentName?`${e.parentName}`:"Family",r=[e.email].filter(Boolean).join(" · ");return`<section class="mp-family" data-family="${i(e.familyId)}">
    <div class="mp-family-head">
      <h2>${i(a)}</h2>
      <div class="mp-family-meta">${i(r)}</div>
    </div>
    ${s.map(c=>Ie(c,t,n.get(String(c.usaSwimmingId||"").toUpperCase())||[])).join("")}
    <div class="mp-sign">
      <label><input type="checkbox" /> I confirm these entries are correct, and that any change must be
        reported before the entry deadline.</label>
      <div class="mp-sign-line"><span>Signature</span><span>Date</span></div>
    </div>
  </section>`}function B(e,t,n){const s=Q({rows:e.rows,excluded:n,noId:e.noId}),a=[];return s.missing&&a.push(`<li class="mp-check-error">${s.missing} row(s) have no seed time</li>`),s.noUsaId&&a.push(`<li class="mp-check-error">${s.noUsaId} confirmed swimmer(s) have no USA Swimming ID</li>`),s.notConfirmed&&a.push(`<li class="mp-check-warn">${s.notConfirmed} entr(y/ies) not confirmed and therefore not in the file</li>`),s.refreshed&&a.push(`<li class="mp-check-warn">${s.refreshed} seed time(s) changed since submission — sheets below show the new value</li>`),s.manual&&a.push(`<li class="mp-check-warn">${s.manual} row(s) rely on a typed seed time</li>`),s.bonusOnly&&a.push(`<li class="mp-check-warn">${s.bonusOnly} row(s) are slower than the line (bonus entries)</li>`),`<div class="mp-check">
    <h2>Pre-flight (coach view)</h2>
    <div>${s.swimmerCount} swimmer(s) · ${s.rowCount} event(s) ·
      ${s.qualified} qualifying · deadline ${i(E(t.entryDeadline)||"n/a")}</div>
    ${a.length?`<ul>${a.join("")}</ul>`:"<div>Nothing outstanding.</div>"}
  </div>`}function Te(e){return`<header class="mp-head">
    <div class="mp-brand">Dragon Swim Team</div>
    <h1>Meet entry confirmation</h1>
    <div class="mp-meet-name">${i(e.name||"Meet")}</div>
    <div class="mp-meet-meta">
      ${i(_(e.startDate,e.endDate))}${e.location?` · ${i(e.location)}`:""}
      ${e.entryDeadline?`<br />Entries close ${i(E(e.entryDeadline))}`:""}
      <br />Generated ${i(G())}
    </div>
  </header>`}function U({meet:e,built:t,families:n,role:s,relayReport:a=null}){var m;const r=`<div class="mp-toolbar">
      <button type="button" class="mp-print-btn">🖨 Print / Save as PDF</button>
      <span class="mp-toolbar-note">Choose “Save as PDF” in the print dialog${k==="sex"?" to email the team report to families.":" to email this sheet to the family."}</span>
    </div>`,c=k==="sex"?`<div class="mp-sheet mp-sheet--report" data-meet="${i(e.id||b)}">
        ${we(e)}
        ${s==="coach"?B(t,e,t.excluded):""}
        ${Se(e,t.rows,a)}
      </div>`:`<div class="mp-sheet" data-meet="${i(e.id||b)}">
        ${Te(e)}
        ${s==="coach"?B(t,e,t.excluded):""}
        ${n.length?n.map(o=>Me(o,e,a==null?void 0:a.bySwimmer)).join(""):'<div class="mp-note">No entries to show for this meet yet.</div>'}
      </div>`;T.innerHTML=`${r}${c}`,(m=T.querySelector(".mp-print-btn"))==null||m.addEventListener("click",()=>{try{window.print()}catch{}}),re&&setTimeout(()=>{try{window.print()}catch{}},150)}async function Ce(e){var $;if(!b){S("This link is missing the meet id.","Ask the coach for the link again.");return}const t=await de(e);let n;try{const d=await N(I(y,"meets",b));if(!d.exists()){S("That meet could not be found.","It may have been removed.");return}n={id:d.id,...d.data()}}catch(d){S("Could not read the meet.",i((d==null?void 0:d.message)||""));return}let s=null,a=[];if(t==="family"){const d=await F(e);if(s=d.familyId,a=((($=d.family)==null?void 0:$.swimmers)||[]).filter(w=>!w.deleted),!s){S("We could not find your registration.","Sign in with the account you registered with, or ask the coach.");return}}let r=[];try{r=await pe({role:t,meetId:b,familyId:s,swimmers:a})}catch(d){S("Could not read the entries for this meet.",i((d==null?void 0:d.message)||""));return}const c=await he(r),m=z({meet:n,entries:r,bestTimesById:c,statuses:oe?["confirmed","submitted","draft","declined"]:["confirmed"]}),o=await ge([...new Set(m.rows.map(d=>d.familyId))]);if(t==="family"){const d=await F(e);d.familyId&&o.set(d.familyId,d.family)}const p=fe(m,o),g=ie(await ue(b));if(!p.length){U({meet:n,built:m,families:[],role:t,relayReport:g});return}U({meet:n,built:m,families:p,role:t,relayReport:g})}ce();H(W,e=>{if(!e){window.location.href="/signin.html";return}Ce(e).catch(t=>{console.error("meet-print failed:",t),S("Something went wrong while building the sheet.",i((t==null?void 0:t.message)||""))})});
