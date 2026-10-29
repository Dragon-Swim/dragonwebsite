import"./modulepreload-polyfill-B5Qt9EMX.js";import{t as o,i as rs,a as ha}from"./i18n-CFnhfkwt.js";import{n as Ee,g as M,e as E,m as at,f as He,k as je,c as ae,i as qe,h as he,a as xt,q as Se,x as Lt,y as is,v as be,b as St,o as ya,l as Ut,u as Is,E as un,r as pn,w as fn}from"./firebase-CAICEMn2.js";import{b as ls,g as xe,p as ga,c as ba,v as Ba,s as va,d as _a,k as wa,e as $a,f as xa,h as Sa,j as Ea,a as Ca}from"./meetEntryExport-C8Xz4HGa.js";import{b as Ia,p as ka,c as Na,s as Fa}from"./registrationCompleteness-jyrzMcbu.js";import{t as Vt,r as Da,n as La,a as hn,f as ks}from"./news-BQzoN4cc.js";import{X as Ma}from"./xlsx-DkFutVy2.js";const Gt=["A","B","C","D"],Et=4;function yn(e,t){const s=String(e||"").trim(),n=String(t||"").trim().toUpperCase();return!s||!n?null:`${s}__${n}`}function gn(e){const t=new Map;for(const s of(e==null?void 0:e.events)||[]){if(!(s!=null&&s.relay))continue;const n=s.eventCode||String(s.eventNo);t.has(n)||t.set(n,{...s,eventCode:n})}return[...t.values()].sort((s,n)=>Number(s.eventNo)-Number(n.eventNo))}function ds({meet:e,event:t,legs:s=[],squadsInEvent:n=1}={}){const a=[],i=[],r=s.filter(Boolean);r.length!==Et&&a.push({code:"leg-count",count:r.length,need:Et});const d=r.map(u=>String((u==null?void 0:u.usaSwimmingId)||"").trim().toUpperCase());d.some(u=>!u)&&a.push({code:"leg-without-usa-id",legs:r.filter(u=>!String((u==null?void 0:u.usaSwimmingId)||"").trim()).length});const l=d.filter((u,y)=>u&&d.indexOf(u)!==y);l.length&&a.push({code:"duplicate-swimmer",ids:[...new Set(l)]});const A=Number(e==null?void 0:e.relayLimitPerClub);Number.isFinite(A)&&A>0&&n>A&&a.push({code:"too-many-squads",count:n,max:A});const m=(t==null?void 0:t.eventSex)||(t==null?void 0:t.gender),c=(e==null?void 0:e.ageDeterminedOn)||(e==null?void 0:e.startDate);for(const[u,y]of r.entries()){const p=u+1;if(m&&m!=="X"&&y.gender){const f=String(y.gender).trim().toUpperCase().startsWith("F")||String(y.gender).trim().toUpperCase().startsWith("G")?"F":String(y.gender).trim().toUpperCase().startsWith("M")||String(y.gender).trim().toUpperCase().startsWith("B")?"M":null;f&&f!==m&&a.push({code:"leg-sex-mismatch",leg:p,eventSex:m,legSex:f})}const g=y.ageAtMeet!=null?Number(y.ageAtMeet):ls(y.dob,c);if(Number.isFinite(g)){const f=Number.isFinite(t==null?void 0:t.ageMin)?t.ageMin:null,B=Number.isFinite(t==null?void 0:t.ageMax)?t.ageMax:null;f!=null&&g<f&&a.push({code:"leg-too-young",leg:p,age:g,min:f}),B!=null&&B<100&&g>B&&a.push({code:"leg-too-old",leg:p,age:g,max:B})}else y.usaSwimmingId?i.push({code:"leg-age-unknown",leg:p,name:y.swimmerName||y.lastName||""}):a.push({code:"leg-unidentified",leg:p})}return{ok:a.length===0,errors:a,warnings:i}}function Ra({meet:e,event:t,squad:s}){const n=((s==null?void 0:s.legs)||[]).filter(Boolean).map((a,i)=>({usaSwimmingId:a.usaSwimmingId,lastName:a.lastName||"",firstName:a.firstName||"",middleInitial:a.middleInitial||"",dob:a.dob||null,ageAtMeet:a.ageAtMeet??(a.dob?ls(a.dob,(e==null?void 0:e.ageDeterminedOn)||(e==null?void 0:e.startDate)):null),gender:a.gender||(t==null?void 0:t.eventSex)||(t==null?void 0:t.gender)||"",seconds:a.seconds??null,courseLetter:a.courseLetter||null,order:i+1}));return{letter:(s==null?void 0:s.letter)||"A",eventCode:(t==null?void 0:t.eventCode)||String((t==null?void 0:t.eventNo)||""),eventSex:(t==null?void 0:t.gender)||(t==null?void 0:t.eventSex)||"",distance:(t==null?void 0:t.distance)??null,stroke:(t==null?void 0:t.stroke)||"",ageMin:(t==null?void 0:t.ageMin)??null,ageMax:(t==null?void 0:t.ageMax)??null,eventAge:null,swimDate:(e==null?void 0:e.startDate)||null,seconds:(s==null?void 0:s.seedSeconds)??null,courseLetter:(s==null?void 0:s.courseLetter)||null,legs:n}}const Bt="relay-entries-container",S={meet:null,swimmers:[],events:[],squads:new Map,unsubscribe:null,view:"list",edit:null,saving:!1,error:"",actorId:null},R=e=>String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]);function Ta({meet:e,swimmers:t=[],actorId:s=null}){bn(),Object.assign(S,{meet:e,swimmers:t.filter(a=>a.usaId),events:gn(e),squads:new Map,view:"list",edit:null,saving:!1,error:"",actorId:s});const n=document.createElement("div");n.id=Bt,document.body.appendChild(n),_e(),S.unsubscribe=je(ae(E,"meets",e.id,"relayEntries"),a=>{const i=new Map;for(const r of a.docs){const d={id:r.id,...r.data()},l=d.eventCode||r.id.split("__")[0];i.has(l)||i.set(l,[]),i.get(l).push(d)}for(const r of i.values())r.sort((d,l)=>String(d.letter).localeCompare(String(l.letter)));S.squads=i,S.view==="list"&&_e()},a=>{S.error=a.message,_e()})}function bn(){var e,t;(e=S.unsubscribe)==null||e.call(S),S.unsubscribe=null,(t=document.getElementById(Bt))==null||t.remove()}function ja(e){const t=String((e==null?void 0:e.eventSex)||(e==null?void 0:e.gender)||"").toUpperCase();return S.swimmers.filter(s=>{const n=String(s.gender||"").toUpperCase(),a=n.startsWith("F")||n.startsWith("G"),i=n.startsWith("M")||n.startsWith("B");if(t&&t!=="X"&&(t==="F"&&!a||t==="M"&&!i))return!1;const r=Number(s.age);return!(Number.isFinite(r)&&(Number.isFinite(e==null?void 0:e.ageMin)&&r<e.ageMin||Number.isFinite(e==null?void 0:e.ageMax)&&e.ageMax<100&&r>e.ageMax))}).sort((s,n)=>String(s.lastName||s.name).localeCompare(String(n.lastName||n.name)))}function Mt(e){return S.squads.get(String(e))||[]}function Oa(){var t;const e=Number((t=S.meet)==null?void 0:t.relayLimitPerClub);return Number.isFinite(e)&&e>0?Math.min(e,Gt.length):Gt.length}function _e(){const e=document.getElementById(Bt);if(!e)return;const t=S.meet;e.innerHTML=`
    <div class="meet-entries-overlay" id="relay-overlay">
      <div class="meet-entries-modal" role="dialog" aria-modal="true" aria-label="${R(o("meet_relays_title"))}">
        <div class="me-header">
          <div class="me-header-text">
            <h2>${R((t==null?void 0:t.name)||"Meet")}</h2>
            <p class="me-sub">${R(o("meet_relays_sub"))}</p>
          </div>
          <button type="button" class="me-close" id="relay-close" aria-label="Close">×</button>
        </div>
        <div class="me-body" id="relay-body">
          ${S.view==="edit"?qa():za()}
        </div>
        <div class="me-footer" id="relay-footer">${Pa()}</div>
      </div>
    </div>
  `,S.view==="edit"&&As()}function za(){if(!S.events.length)return`<p class="me-empty">${R(o("meet_relays_no_events"))}</p>`;const e=Oa(),t=S.events.map(s=>{const n=Mt(s.eventCode),a=[];for(let i=0;i<e;i+=1){const r=Gt[i],d=n.find(l=>String(l.letter).toUpperCase()===r);a.push(d?Ua(s,d,r):`<button type="button" class="btn btn-outline btn-sm mr-add" data-action="add" data-code="${R(s.eventCode)}" data-letter="${r}">+ ${R(r)}</button>`)}return`<tr data-relay-row="${R(s.eventCode)}">
      <td class="mr-event">
        <strong>#${R(s.eventCode)}</strong>
        <span class="me-sub">${R(s.gender||"")} ${R(s.ageGroup||"")} ${R(s.distance||"")} ${R(s.stroke||"")}</span>
      </td>
      <td class="mr-slots">${a.join(" ")}</td>
    </tr>`}).join("");return`
    <table class="mr-table">
      <thead><tr><th>${R(o("meet_relays_event"))}</th><th>${R(o("meet_relays_squads"))}</th></tr></thead>
      <tbody>${t}</tbody>
    </table>
    ${S.error?`<p class="me-error">${R(S.error)}</p>`:""}
  `}function Ua(e,t,s){const n=(t.legs||[]).map(i=>Ha(i)).filter(Boolean),a=t.seedSeconds!=null?` · ${xe(t.seedSeconds)}`:"";return`<span class="mr-squad" data-squad="${R(t.id||"")}">
      <span class="mr-squad-letter">${R(s)}</span>
      <span class="mr-squad-names">${R(n.join(" · ")||o("meet_relays_empty_squad"))}${R(a)}</span>
      <button type="button" class="btn btn-outline btn-sm" data-action="edit" data-code="${R(e.eventCode)}" data-letter="${s}">${R(o("meet_relays_edit"))}</button>
    </span>`}function Ha(e){return e.lastName?e.lastName:String(e.swimmerName||"").trim().split(/\s+/).slice(-1)[0]||String(e.usaSwimmingId||"")}function qa(){const e=S.events.find(i=>String(i.eventCode)===String(S.edit.eventCode)),t=ja(e),s=i=>`<option value="">${R(o("meet_relays_pick"))}</option>`+t.map(d=>{const l=R(d.usaId),A=`${d.lastName||d.name}, ${d.firstName||""}`.replace(/,\s*$/,""),m=String(i||"")===String(d.usaId)?" selected":"";return`<option value="${l}"${m}>${R(A)} (${R(d.age??"?")})</option>`}).join(""),n=S.edit.legs||[],a=Array.from({length:Et},(i,r)=>{var d;return`
    <label class="mr-leg">
      <span class="mr-leg-no">${R(o("meet_relays_leg"))} ${r+1}</span>
      <select data-leg="${r}">${s((d=n[r])==null?void 0:d.usaId)}</select>
    </label>`}).join("");return`
    <div class="mr-editor">
      <div class="mr-editor-head">
        <strong>#${R(S.edit.eventCode)}</strong>
        <span class="me-sub">${R((e==null?void 0:e.gender)||"")} ${R((e==null?void 0:e.ageGroup)||"")} ${R((e==null?void 0:e.distance)||"")} ${R((e==null?void 0:e.stroke)||"")} · ${R(o("meet_relays_squad"))} ${R(S.edit.letter)}</span>
      </div>
      <div class="mr-legs">${a}</div>
      <label class="mr-seed">
        <span>${R(o("meet_relays_seed"))}</span>
        <input type="text" id="relay-seed" placeholder="1:47.25" value="${R(S.edit.seedTime||"")}" />
      </label>
      <div class="mr-errors" id="relay-errors"></div>
      <p class="me-sub">${R(o("meet_relays_pool_hint").replace("{n}",String(t.length)))}</p>
    </div>
  `}function Pa(){var e;if(S.view==="edit"){const t=S.saving?"disabled":"",s=(e=S.edit)!=null&&e.existing?`<button type="button" class="btn btn-outline btn-sm me-danger" data-action="delete" ${t}>${R(o("meet_relays_delete"))}</button>`:"";return`
      <button type="button" class="btn btn-primary btn-sm" data-action="save" ${t}>${R(S.saving?o("meet_relays_saving"):o("meet_relays_save"))}</button>
      ${s}
      <button type="button" class="btn btn-outline btn-sm" data-action="back" ${t}>${R(o("meet_relays_back"))}</button>
      <span class="me-footer-note me-save-note" id="relay-note">${R(S.error||"")}</span>
    `}return`<span class="me-footer-note">${R(o("meet_relays_footer"))}</span>`}function Bn(){var e;return S.events.find(t=>{var s;return String(t.eventCode)===String((s=S.edit)==null?void 0:s.eventCode)}),(((e=S.edit)==null?void 0:e.legs)||[]).map(t=>{if(!t)return null;const s=S.swimmers.find(n=>String(n.usaId)===String(t.usaId));return{...s||{},...t,usaSwimmingId:t.usaId,gender:(s==null?void 0:s.gender)||t.gender}})}function As(){var i;const e=document.getElementById("relay-errors");if(!e)return;const t=S.events.find(r=>{var d;return String(r.eventCode)===String((d=S.edit)==null?void 0:d.eventCode)}),s=Bn(),n=Mt((i=S.edit)==null?void 0:i.eventCode).filter(r=>{var d;return String(r.letter).toUpperCase()!==String((d=S.edit)==null?void 0:d.letter).toUpperCase()}).length,a=ds({meet:S.meet,event:t,legs:s,squadsInEvent:n+1});if(!a.errors.length){e.innerHTML=`<span class="mr-ok">${R(o("meet_relays_ok"))}</span>`;return}e.innerHTML=a.errors.map(r=>`<span class="me-error">${R(Ka(r))}</span>`).join("")}function Ka(e){return{"leg-count":o("meet_relays_err_legs").replace("{count}",String(e.count??0)),"duplicate-swimmer":o("meet_relays_err_dup").replace("{ids}",(e.ids||[]).join(", ")),"leg-without-usa-id":o("meet_relays_err_noid"),"leg-sex-mismatch":o("meet_relays_err_sex").replace("{leg}",String(e.leg??"?")),"leg-too-young":o("meet_relays_err_young").replace("{leg}",String(e.leg??"?")).replace("{age}",String(e.age??"?")).replace("{min}",String(e.min??"?")),"leg-too-old":o("meet_relays_err_old").replace("{leg}",String(e.leg??"?")).replace("{age}",String(e.age??"?")).replace("{max}",String(e.max??"?")),"too-many-squads":o("meet_relays_err_cap").replace("{count}",String(e.count??"?")).replace("{max}",String(e.max??"?")),"leg-unidentified":o("meet_relays_err_unknown_leg").replace("{leg}",String(e.leg??"?"))}[e.code]||e.code}document.addEventListener("click",e=>{if(!document.getElementById(Bt))return;if(e.target.id==="relay-close"||e.target.id==="relay-overlay"){bn();return}const t=e.target.closest("[data-action]");if(!t)return;const{action:s,code:n,letter:a}=t.dataset;s==="add"?Ns(n,a,null):s==="edit"?Ns(n,a,Mt(n).find(i=>String(i.letter).toUpperCase()===a)||null):s==="back"?(S.view="list",S.error="",_e()):s==="save"?Ya():s==="delete"&&Va()});document.addEventListener("change",e=>{if(!document.getElementById(Bt))return;const t=e.target.closest("select[data-leg]");if(!t)return;const s=Number(t.dataset.leg),n=t.value,a=S.swimmers.find(i=>String(i.usaId)===n)||null;S.edit.legs[s]=a?{usaId:a.usaId,firstName:a.firstName,lastName:a.lastName,dob:a.dob,gender:a.gender,ageAtMeet:a.age}:null,As()});document.addEventListener("input",e=>{e.target.id==="relay-seed"&&(S.edit.seedTime=e.target.value)});function Ns(e,t,s){const n=[0,1,2,3].map(()=>null);s&&(s.legs||[]).slice(0,Et).forEach((a,i)=>{n[i]={usaId:a.usaSwimmingId,firstName:a.firstName,lastName:a.lastName,dob:a.dob,gender:a.gender,ageAtMeet:a.ageAtMeet}}),S.edit={eventCode:e,letter:t,legs:n,existing:!!s,seedTime:(s==null?void 0:s.seedSeconds)!=null?xe(s.seedSeconds):""},S.error="",S.view="edit",_e()}async function Ya(){const{eventCode:e,letter:t}=S.edit,s=S.events.find(l=>String(l.eventCode)===String(e)),n=Bn(),a=Mt(e).filter(l=>String(l.letter).toUpperCase()!==String(t).toUpperCase()).length;if(!ds({meet:S.meet,event:s,legs:n,squadsInEvent:a+1}).ok){S.error="",As();return}const r=ga(S.edit.seedTime),d=yn(e,t);S.saving=!0,_e();try{await Ee(M(E,"meets",S.meet.id,"relayEntries",d),{meetId:S.meet.id,eventNo:s.eventNo??null,eventCode:e,ageGroup:s.ageGroup||null,gender:s.gender||null,distance:s.distance??null,stroke:s.stroke||null,letter:t,legs:n.filter(Boolean).map(l=>({usaSwimmingId:l.usaId,firstName:l.firstName||"",lastName:l.lastName||"",dob:l.dob||null,ageAtMeet:l.ageAtMeet??null,gender:l.gender||null})),seedSeconds:r??null,courseLetter:"Y",status:"confirmed",updatedAt:at(),updatedBy:S.actorId||null}),S.saving=!1,S.view="list",_e()}catch(l){S.saving=!1,S.error=l.message,_e()}}async function Va(){const{eventCode:e,letter:t}=S.edit,s=yn(e,t);S.saving=!0,_e();try{await He(M(E,"meets",S.meet.id,"relayEntries",s)),S.saving=!1,S.view="list",_e()}catch(n){S.saving=!1,S.error=n.message,_e()}}const Ga=160,Wa={A0:[["typeCode",1,2],["org",3,1],["version",4,8],["fileCode",12,2],["description",14,30],["softwareName",44,20],["softwareVersion",64,10],["contactName",74,20],["contactPhone",94,12],["fileDate",106,8],["submittedByLsc",156,2]],B1:[["typeCode",1,2],["org",3,1],["meetName",12,30],["address1",42,22],["address2",64,22],["city",86,20],["state",106,2],["postal",108,10],["country",118,3],["meetCode",121,1],["startDate",122,8],["endDate",130,8],["course",150,1]],C1:[["typeCode",1,2],["org",3,1],["teamCode",12,6],["teamName",18,30],["abbrev",48,16],["address1",64,22],["address2",86,22],["city",108,20],["state",128,2],["postal",130,10],["country",140,3],["region",143,1],["teamCode5th",150,1]],C2:[["typeCode",1,2],["org",3,1],["teamCode",12,6],["coachName",18,30],["coachPhone",48,12],["entryCount",60,6],["athleteCount",66,6],["relayEntryCount",72,5],["relayNameCount",77,6],["splitCount",83,6],["shortTeamName",89,16],["teamCode5th",150,1]],D0:[["typeCode",1,2],["org",3,1],["name",12,28],["uss",40,12],["attach",52,1],["citizen",53,3],["dob",56,8],["age",64,2],["sex",66,1],["eventSex",67,1],["distance",68,4],["stroke",72,1],["eventNo",73,4],["eventAge",77,4],["swimDate",81,8],["seedTime",89,8],["seedCourse",97,1],["prelimTime",98,8],["prelimCourse",106,1],["swimOffTime",107,8],["swimOffCourse",115,1],["finalsTime",116,8],["finalsCourse",124,1],["prelimHeat",125,2],["prelimLane",127,2],["finalsHeat",129,2],["finalsLane",131,2],["prelimPlace",133,3],["finalsPlace",136,3],["points",139,4],["eventTimeClass",143,2],["flightStatus",145,1]],D3:[["typeCode",1,2],["uss14",3,14],["preferredName",17,15],["ethnicity",32,2],["juniorHigh",34,1],["seniorHigh",35,1],["ymca",36,1],["college",37,1],["summerLeague",38,1],["masters",39,1],["disabledSports",40,1],["waterPolo",41,1],["none",42,1]],E0:[["typeCode",1,2],["org",3,1],["relayLetter",12,1],["teamCode",13,6],["f0Count",19,2],["eventSex",21,1],["distance",22,4],["stroke",26,1],["eventNo",27,4],["eventAge",31,4],["totalAge",35,3],["swimDate",38,8],["seedTime",46,8],["seedCourse",54,1]],F0:[["typeCode",1,2],["org",3,1],["teamCode",16,6],["relayLetter",22,1],["name",23,28],["uss",51,12],["citizen",63,3],["dob",66,8],["age",74,2],["sex",76,1],["prelimLeg",77,1],["swimOffLeg",78,1],["finalsLeg",79,1],["legTime",80,8],["legCourse",88,1]],Z0:[["typeCode",1,2],["org",3,1],["fileCode",12,2],["notes",14,30],["bCount",44,3],["meetCount",47,3],["cCount",50,4],["teamCount",54,4],["dCount",58,6],["swimmerCount",64,6],["eCount",70,5],["fCount",75,6],["gCount",81,6],["batchNumber",87,5],["newMembers",92,3],["renewMembers",95,3],["memberChanges",98,3],["memberDeletes",101,3]]},Wt={FR:"1",BK:"2",BR:"3",FL:"4",IM:"5",FR_RELAY:"6",MED_RELAY:"7"},Xa={SCY:"Y",LCM:"L",SCM:"S"};function Ke(e){if(!e)return"";if(e instanceof Date)return Number.isNaN(e.getTime())?"":`${tt(e.getMonth()+1,2)}${tt(e.getDate(),2)}${e.getFullYear()}`;const t=String(e).trim();if(/^\d{8}$/.test(t))return t;const s=/^(\d{4})-(\d{2})-(\d{2})/.exec(t);if(s)return`${s[2]}${s[3]}${s[1]}`;const n=/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(t);return n?`${tt(n[1],2)}${tt(n[2],2)}${n[3]}`:""}function tt(e,t){return String(e??"").padStart(t,"0")}function Ht(e){if(e==null||!Number.isFinite(Number(e)))return"";const t=Math.round(Number(e)*100)/100;return(t<60?t.toFixed(2):`${Math.floor(t/60)}:${(t%60).toFixed(2).padStart(5,"0")}`).padStart(8," ")}function Fs(e,t){const s=Number.isFinite(Number(e))?tt(Math.max(0,Number(e)),2):"UN",n=Number(t)>=100||!Number.isFinite(Number(t))?"OV":tt(Math.max(0,Number(t)),2);return`${s}${n}`}function Ds(e){const t=String(e??"").trim(),s=/^(\d+)([A-Za-z]*)$/.exec(t);return s?`${s[1].padStart(3," ")}${(s[2]||" ").slice(0,1)}`:t.slice(0,4)}function Ls({last:e,first:t,mi:s}={}){const n=String(e||"").trim(),a=String(t||"").trim(),i=String(s||"").trim().replace(/\.$/,"");if(!n&&!a)return"";const r=[a,i].filter(Boolean).join(" ");return r?`${n}, ${r}`:n}function Ms(e){return String(e||"").trim().toUpperCase().slice(0,12)}function Za(e){return String(e||"").trim().toUpperCase().slice(0,14)}const Ja=new Set(["distance","totalAge","f0Count","seedTime","prelimTime","swimOffTime","finalsTime","legTime","prelimHeat","prelimLane","finalsHeat","finalsLane","prelimPlace","finalsPlace","points","entryCount","athleteCount","relayEntryCount","relayNameCount","splitCount","bCount","meetCount","cCount","teamCount","dCount","swimmerCount","eCount","fCount","gCount","batchNumber","newMembers","renewMembers","memberChanges","memberDeletes","prelimLeg","swimOffLeg","finalsLeg"]);function Te(e,t={}){const s=Wa[e];if(!s)throw new Error(`writeRecord: unknown SDIF record type '${e}'`);const n=new Array(Ga).fill(" ");for(const[a,i,r]of s){const d=a==="typeCode"?e:t[a];if(d==null||d==="")continue;const l=String(d).slice(0,r),A=Ja.has(a)?l.padStart(r," "):l.padEnd(r," ");for(let m=0;m<A.length;m+=1)n[i-1+m]=A[m]}return n.join("")}function Qa({file:e={},meet:t={},club:s={},entries:n=[],relays:a=[],today:i=new Date}={}){const r=[],d=so(t.courses);r.push(Te("A0",{org:e.org||"1",version:e.version||"V3",fileCode:e.fileCode||"20",description:e.description||"Meet Entries",softwareName:e.softwareName||"Dragon Swim Team",softwareVersion:e.softwareVersion||"1.0",contactName:e.contactName||"",contactPhone:e.contactPhone||"",fileDate:Ke(e.fileDate||i)})),r.push(Te("B1",{org:"1",meetName:t.name||"",address1:t.address1||"",address2:t.address2||"",city:t.city||"",state:t.state||"",postal:t.postal||"",country:t.country||"USA",meetCode:t.meetCode||"1",startDate:Ke(t.startDate),endDate:Ke(t.endDate),course:d[0]||"Y"})),r.push(Te("C1",{org:"1",teamCode:(s.teamCode||"").slice(0,6),teamName:s.name||"",abbrev:s.abbrev||"",address1:s.address1||"",address2:s.address2||"",city:s.city||"",state:s.state||"",postal:s.postal||"",country:s.country||"USA",region:s.region||""}));const l=new Map;for(const p of n){const g=p.usaSwimmingId||p.swimmerName;l.has(g)||l.set(g,[]),l.get(g).push(p)}let A=0,m=0;for(const[,p]of l){p[0];let g=!1;for(const f of p)r.push(Te("D0",{org:"1",name:Ls({last:f.lastName,first:f.firstName,mi:f.middleInitial}),uss:Ms(f.usaSwimmingId),attach:f.attach||"",citizen:f.citizen||"",dob:Ke(f.dob),age:f.ageAtMeet!=null?f.ageAtMeet:"",sex:f.gender||"",eventSex:f.eventSex||f.gender||"",distance:f.distance!=null?f.distance:"",stroke:f.strokeCode||eo(f),eventNo:Ds(f.eventCode||f.eventNo),eventAge:f.eventAge||Fs(f.ageMin,f.ageMax),swimDate:f.swimDate?Ke(f.swimDate):"",seedTime:f.seconds==null?"NT".padStart(7," ")+" ":Ht(f.seconds),seedCourse:f.courseLetter||""})),A+=1,g||(r.push(Te("D3",{uss14:Za(f.usaSwimmingId),preferredName:f.preferredName||""})),g=!0);m+=1}const c=d[0]||"Y";let u=0,y=0;for(const p of a){const g=(p.legs||[]).slice(0,4);g.length&&(r.push(Te("E0",{org:"1",relayLetter:(p.letter||"A").slice(0,1),teamCode:(s.teamCode||"").slice(0,6),f0Count:g.length,eventSex:p.eventSex||"",distance:p.distance!=null?p.distance:"",stroke:to(p),eventNo:Ds(p.eventCode),eventAge:p.eventAge||Fs(p.ageMin,p.ageMax),swimDate:Ke(p.swimDate||t.startDate),seedTime:p.seconds==null?"NT".padStart(7," ")+" ":Ht(p.seconds),seedCourse:p.courseLetter||c})),u+=1,g.forEach((f,B)=>{r.push(Te("F0",{org:"1",teamCode:(s.teamCode||"").slice(0,6),relayLetter:(p.letter||"A").slice(0,1),name:Ls({last:f.lastName,first:f.firstName,mi:f.middleInitial}),uss:Ms(f.usaSwimmingId),citizen:f.citizen||"",dob:Ke(f.dob),age:f.ageAtMeet!=null?f.ageAtMeet:"",sex:f.gender||p.eventSex||"",prelimLeg:B+1,swimOffLeg:"0",finalsLeg:"0",legTime:f.seconds==null?"":Ht(f.seconds),legCourse:f.seconds==null?"":f.courseLetter||c})),y+=1}))}return r.push(Te("Z0",{org:"1",fileCode:"02",notes:`Meet entries for ${t.name||"meet"}`.slice(0,30),bCount:1,meetCount:1,cCount:1,teamCount:1,dCount:A,swimmerCount:m,eCount:u,fCount:y,gCount:0,batchNumber:1})),`${r.join(`\r
`)}\r
`}function eo(e){const t=e.relay?e.stroke==="MED"?"MED_RELAY":"FR_RELAY":e.stroke;return Wt[t]||""}function to(e){const t=String(e.strokeCode??e.stroke??"").trim().toUpperCase();return t==="6"||t==="7"?t:t==="MED"||t==="MEDLEY"||t==="MED_RELAY"?Wt.MED_RELAY:t==="FR"||t==="FREE"||t==="FR_RELAY"?Wt.FR_RELAY:""}function so(e){const t=(e||[]).map(s=>Xa[s]||s).filter(Boolean);return t.length?t:["Y"]}const no=(()=>{const e=new Uint32Array(256);for(let t=0;t<256;t+=1){let s=t;for(let n=0;n<8;n+=1)s=s&1?3988292384^s>>>1:s>>>1;e[t]=s>>>0}return e})();function ao(e){let t=4294967295;for(let s=0;s<e.length;s+=1)t=no[(t^e[s])&255]^t>>>8;return(t^4294967295)>>>0}function oo(e=new Date){const t=e instanceof Date&&!Number.isNaN(e.getTime())?e:new Date,s=Math.max(1980,t.getFullYear()),n=t.getHours()<<11|t.getMinutes()<<5|Math.floor(t.getSeconds()/2),a=s-1980<<9|t.getMonth()+1<<5|t.getDate();return{time:n&65535,date:a&65535}}function Rs(e){const t=String(e??"");if(typeof TextEncoder<"u")return new TextEncoder().encode(t);const s=[];for(let n=0;n<t.length;n+=1){let a=t.codePointAt(n);a>65535&&(n+=1),a<128?s.push(a):a<2048?s.push(192|a>>6,128|a&63):a<65536?s.push(224|a>>12,128|a>>6&63,128|a&63):s.push(240|a>>18,128|a>>12&63,128|a>>6&63,128|a&63)}return Uint8Array.from(s)}class ro{constructor(){this.chunks=[],this.length=0}bytes(t){return this.chunks.push(t),this.length+=t.length,this}u16(t){return this.bytes(Uint8Array.of(t&255,t>>>8&255))}u32(t){return this.bytes(Uint8Array.of(t&255,t>>>8&255,t>>>16&255,t>>>24&255))}toUint8Array(){const t=new Uint8Array(this.length);let s=0;for(const n of this.chunks)t.set(n,s),s+=n.length;return t}}function io(e=[],{date:t=new Date}={}){const s=new ro,n=[],a=oo(t);let i=0;for(const l of e){const A=String(l.name||"").replace(/\\/g,"/");if(!A)throw new Error("zipStore: every entry needs a name");const m=Rs(A),c=typeof l.data=="string"?Rs(l.data):lo(l.data),u=ao(c);s.u32(67324752),s.u16(20),s.u16(2048),s.u16(0),s.u16(a.time),s.u16(a.date),s.u32(u),s.u32(c.length),s.u32(c.length),s.u16(m.length),s.u16(0),s.bytes(m),s.bytes(c),n.push({nameBytes:m,crc:u,size:c.length,offset:i}),i+=30+m.length+c.length}const r=i;for(const l of n)s.u32(33639248),s.u16(20),s.u16(20),s.u16(2048),s.u16(0),s.u16(a.time),s.u16(a.date),s.u32(l.crc),s.u32(l.size),s.u32(l.size),s.u16(l.nameBytes.length),s.u16(0),s.u16(0),s.u16(0),s.u16(0),s.u32(0),s.u32(l.offset),s.bytes(l.nameBytes);const d=s.length-r;return s.u32(101010256),s.u16(0),s.u16(0),s.u16(n.length),s.u16(n.length),s.u32(d),s.u32(r),s.u16(0),s.toUint8Array()}function lo(e){if(e instanceof Uint8Array)return e;if(Array.isArray(e))return Uint8Array.from(e);if(e&&typeof e.buffer=="object"&&typeof e.byteLength=="number")return new Uint8Array(e.buffer,e.byteOffset||0,e.byteLength);throw new Error("zipStore: data must be a string or bytes")}const Rt={abbrev:"DRAG",lsc:"PV",teamCode:"PVDRAG",name:"Dragon Swim Team",city:"Herndon",state:"VA",postal:"20171",region:"1",contact:"dragonswim@outlook.com",website:"dragonswim.org"},vn=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];function Ao(e){const t=/^(\d{4})-(\d{2})-(\d{2})/.exec(String(e||""));return t?`${t[3]}${vn[Number(t[2])-1]}${t[1]}`:"undated"}function co({meet:e,club:t=Rt}){const s=String((e==null?void 0:e.name)||"Meet").replace(/[\\/:*?"<>|]/g," ").replace(/\s+/g," ").trim();return`${t.abbrev}-${t.lsc}-Entries-${s}-${Ao(e==null?void 0:e.startDate)}-001.ZIP`}function mo({meet:e,club:t=Rt,summary:s,relayCount:n,fileName:a,cl2Name:i,now:r=new Date}){const d=`${vn[r.getMonth()]} ${r.getDate()}, ${r.getFullYear()}`,l=i||String(a||"").replace(/\.ZIP$/i,".CL2");return[`${t.name} - team entry file`,"=".repeat(`${t.name} - team entry file`.length),"",`Meet:      ${(e==null?void 0:e.name)||""}`,`Dates:     ${(e==null?void 0:e.startDate)||""} to ${(e==null?void 0:e.endDate)||(e==null?void 0:e.startDate)||""}`,e!=null&&e.sanction?`Sanction:  ${e.sanction}`:"Sanction:  (not recorded)",`Generated: ${d} by ${t.website}`,"","Files in this archive","---------------------",`  ${l}`,"      Hy-Tek Meet Manager entry file: SDIF v3, plain single-byte text,","      160-character records, no compression.","  README.TXT","      this note.","","How to import (Hy-Tek Meet Manager)","-----------------------------------",`File > Import > Entries, then select ${l} from this archive.`,"The CL2 is the Standard Data Interchange Format (SDIF v3) published by","USA Swimming in 1998; Meet Manager accepts SDIF entry files produced by","software other than Team Manager.","","Contents","--------",`${(s==null?void 0:s.swimmerCount)??0} swimmers, ${(s==null?void 0:s.rowCount)??0} individual entries, ${n??0} relay squads.`,"","Questions","---------",`${t.contact}  /  ${t.website}`,""].join(`\r
`)}function uo({meet:e,entries:t=[],relays:s=[],swimmerById:n={},bestTimesById:a={},club:i=Rt,now:r=new Date,includeUnconfirmed:d=!1}={}){const l=H=>n[String(H||"").trim().toUpperCase()]||{},A=ba({meet:e,entries:t,bestTimesById:a,statuses:d?["confirmed","submitted","draft"]:["confirmed"]}),m=A.rows.map(H=>{const J=l(H.usaSwimmingId);return{...H,dob:H.dob||J.dob||null,lastName:J.lastName||H.lastName,firstName:J.firstName||H.firstName,middleInitial:J.middleInitial||""}}),c=Ba({rows:m,meet:e,excluded:A.excluded,noId:A.noId}),u=va({rows:m,excluded:A.excluded,noId:A.noId}),y=gn(e),p=new Map(y.map(H=>[String(H.eventCode),H])),g={};for(const H of s){const J=String(H.eventCode||"");g[J]=(g[J]||0)+1}const f=[...c.errors],B=[];for(const H of s){const J=p.get(String(H.eventCode||""));if(!J){f.push({code:"unknown-relay-event",eventCode:H.eventCode,detail:"not a relay event of this meet"});continue}const we=(H.legs||[]).map(ie=>{const ve=l(ie.usaSwimmingId);return{...ve,...ie,gender:ie.gender||ve.gender||J.gender}}),Ie=ds({meet:e,event:J,legs:we,squadsInEvent:g[String(H.eventCode)]||1});if(!Ie.ok){f.push({code:"relay-squad-invalid",letter:H.letter,eventCode:H.eventCode,detail:Ie.errors.map(ie=>ie.code).join(", ")});continue}B.push(Ra({meet:e,event:J,squad:{...H,legs:we}}))}const $=co({meet:e,club:i});if(f.length)return{ok:!1,errors:f,warnings:c.warnings,summary:u,relayCount:B.length,fileName:$};const x=Qa({file:{contactName:i.name,contactPhone:"",fileDate:r},meet:e,club:i,entries:m,relays:B,today:r}),D=$.replace(/\.ZIP$/i,".CL2"),Q=mo({meet:e,club:i,summary:u,relayCount:B.length,fileName:$,cl2Name:D,now:r}),re=io([{name:D,data:x},{name:"README.TXT",data:Q}],{date:r});return{ok:!0,errors:[],warnings:c.warnings,summary:u,relayCount:B.length,fileName:$,cl2Name:D,cl2Text:x,readme:Q,zipBytes:re}}function po(e,t,s="application/zip"){const n=new Blob([e],{type:s}),a=URL.createObjectURL(n),i=document.createElement("a");i.href=a,i.download=t,document.body.appendChild(i),i.click(),document.body.removeChild(i),URL.revokeObjectURL(a)}async function fo({meet:e,swimmers:t=[],onProgress:s=()=>{}}){const n=e==null?void 0:e.id;if(!n)return{ok:!1,message:"This meet has no id."};if(!Array.isArray(e.events)||!e.events.length)return{ok:!1,message:"This meet has no event table yet."};try{s("Reading entries…");const i=(await qe(ae(E,"meets",n,"entries"))).docs.map(y=>({id:y.id,...y.data()}));s("Reading relay squads…");const d=(await qe(ae(E,"meets",n,"relayEntries"))).docs.map(y=>({id:y.id,...y.data()})),l=[...new Set(i.map(y=>String(y.usaSwimmingId||"").trim().toUpperCase()).filter(Boolean))];s(`Reading times for ${l.length} swimmer(s)…`);const A={};await Promise.all(l.map(async y=>{try{const p=await he(M(E,"swimResults",y));A[y]=(p.exists()?p.data().bestTimes:[])||[]}catch{A[y]=[]}}));const m={};for(const y of t){const p=String(y.usaId||y.usaSwimmingId||"").trim().toUpperCase();p&&(m[p]=y)}s("Building the .cl2…");const c=uo({meet:e,entries:i,relays:d,swimmerById:m,bestTimesById:A,club:Rt,now:new Date});if(!c.ok){const y=c.errors.map(p=>p.code).join(", ");return{ok:!1,message:`Nothing exported — ${c.errors.length} problem(s): ${y}`,summary:c.summary}}s("Zipping…"),po(c.zipBytes,c.fileName);const u=c.summary;return{ok:!0,fileName:c.fileName,summary:u,message:`${c.fileName} — ${u.swimmerCount} swimmers, ${u.rowCount} entries, ${c.relayCount} relay squads`}}catch(a){return{ok:!1,message:(a==null?void 0:a.message)||String(a)}}}const Ts={draft:"meet_entries_status_draft",submitted:"meet_entries_status_submitted",confirmed:"meet_entries_status_confirmed",declined:"meet_entries_status_declined",none:"meet_entries_status_none"},v=e=>String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");function ho(e){if(!e)return null;if(e instanceof Date)return Number.isNaN(e.getTime())?null:e;if(typeof e.toDate=="function")return e.toDate();const t=new Date(e);return Number.isNaN(t.getTime())?null:t}const h={meet:null,role:"family",swimmers:[],familyId:null,actorId:null,entries:new Map,bestTimes:new Map,view:"list",active:null,ctx:null,selected:new Set,manualTimes:{},note:"",status:"draft",search:"",filter:"all",loading:!0,saving:!1,error:"",unsubscribe:null};function Xt(){var e,t;(e=h.unsubscribe)==null||e.call(h),h.unsubscribe=null,(t=document.getElementById("meet-entries-container"))==null||t.remove()}function yo({meet:e,role:t,swimmers:s,familyId:n=null,actorId:a=null}){Xt();const i=(s||[]).filter(l=>l.usaId);Object.assign(h,{meet:e,role:t,swimmers:s||[],familyId:n,actorId:a,entries:new Map,bestTimes:new Map,loading:!0,error:"",view:t==="family"&&(s||[]).length===1&&i.length===1?"editor":"list",active:null,ctx:null,selected:new Set,manualTimes:{},note:"",status:"draft",search:"",filter:"all",saving:!1});const r=document.createElement("div");r.id="meet-entries-container",r.addEventListener("click",Io),r.addEventListener("change",ko),r.addEventListener("input",No),document.body.appendChild(r);const d=Fe()?go():bo();De(),Promise.resolve(d).then(()=>{if(h.view!=="editor")return;const l=h.swimmers.find(A=>A.usaId);l&&Sn(l)})}function go(){h.unsubscribe=je(ae(E,"meets",h.meet.id,"entries"),e=>{h.entries=new Map(e.docs.map(t=>[t.id,{id:t.id,...t.data()}])),h.loading=!1,h.view==="list"?De():vo()},e=>{console.error("[meetEntries] entries listener failed:",e),h.loading=!1,h.error=e.message||String(e),De()})}async function bo(){const e=h.swimmers.map(s=>mt(s)).filter(Boolean),t=await Promise.all(e.map(s=>he(M(E,"meets",h.meet.id,"entries",s)).catch(n=>(console.error("[meetEntries] entry read failed:",s,n),null))));for(const s of t)s!=null&&s.exists()&&h.entries.set(s.id,{id:s.id,...s.data()});h.loading=!1,h.view==="list"&&De()}const Fe=()=>h.role==="coach"||h.role==="admin",_n=()=>Ea(h.meet),cs=()=>_n()&&!Fe(),mt=e=>$a(e.familyId,e.usaId),dt=e=>{const t=mt(e);return t&&h.entries.get(t)||null},ft=e=>{var t;return((t=dt(e))==null?void 0:t.status)||"none"},wn=e=>{var t;return Array.isArray((t=dt(e))==null?void 0:t.events)?dt(e).events.length:0};function ms(e){return`<span class="me-badge me-badge--${e}">${v(o(Ts[e]||Ts.none))}</span>`}async function Bo(e){if(!e)return{list:[]};if(h.bestTimes.has(e))return h.bestTimes.get(e);let t;try{const s=await he(M(E,"swimResults",e)),n=s.exists()?s.data():{};t={list:n.bestTimes||[],fetchedAt:n.lastFetchSuccessAt||n.lastUpdated||null}}catch(s){console.error("[meetEntries] bestTimes read failed:",s),t={list:[],fetchedAt:null,error:s.message}}return h.bestTimes.set(e,t),t}function De(){const e=document.getElementById("meet-entries-container");if(!e)return;const t=h.meet;e.innerHTML=`
    <div class="meet-entries-overlay" id="meet-entries-overlay">
      <div class="meet-entries-modal" role="dialog" aria-modal="true" aria-label="${v(t.name||"Meet entries")}">
        <div class="me-header">
          <div class="me-header-text">
            <h2>${v(t.name||"Meet")}</h2>
            <p class="me-sub" id="me-header-meta">${$n()}</p>
          </div>
          <button type="button" class="me-close" id="me-close" aria-label="Close">×</button>
        </div>
        <div class="me-body" id="me-body">${h.view==="list"?_o():xo()}</div>
        <div class="me-footer" id="me-footer">${xn()}</div>
      </div>
    </div>
  `,h.view==="editor"&&ht()}function vo(){const e=document.getElementById("me-header-meta");e&&(e.innerHTML=$n())}function $n(){var a,i;const e=[],t=(a=h.meet)==null?void 0:a.startDate,s=(i=h.meet)==null?void 0:i.endDate;t&&e.push(v(`${t}${s&&s!==t?` – ${s}`:""}`));const n=xa(h.meet);return n&&e.push(`${v(o("meet_entries_deadline"))}: ${v(n)}`),_n()&&e.push(`<strong class="me-closed">${v(o("meet_entries_closed"))}</strong>`),e.join(" · ")}function _o(){return Fe()?$o():wo()}function wo(){return`<div class="me-family-list">${h.swimmers.map(t=>{var i,r;if(!mt(t))return`<div class="me-family-card me-family-card--blocked">
        <strong>${v(t.name)}</strong>
        <p class="me-hint">${v(o("meet_entries_blocked_no_id"))}</p>
      </div>`;const s=ft(t),n=dt(t),a=((r=(i=n==null?void 0:n.submittedAt)==null?void 0:i.toDate)==null?void 0:r.call(i))||(n!=null&&n.submittedAt?new Date(n.submittedAt):null);return`<div class="me-family-card">
      <div>
        <strong>${v(t.name)}</strong>
        <div class="me-sub">${t.age!=null?`${t.age} · `:""}${v(t.ageGroup||"")}</div>
      </div>
      <div class="me-family-card-right">
        ${ms(s)}
        <span class="me-sub">${wn(t)} ${v(o("meet_entries_events_short"))}
          ${a&&!Number.isNaN(a.getTime())?` · ${v(a.toLocaleDateString())}`:""}</span>
        <button type="button" class="btn btn-outline btn-sm" data-action="edit" data-usa="${v(t.usaId)}">
          ${v(o(s==="none"?"meet_entries_enter":"meet_entries_review"))}
        </button>
      </div>
    </div>`}).join("")}</div>`}function $o(){const e=h.swimmers.filter(a=>mt(a)),t=h.swimmers.length-e.length,s={none:0,draft:0,submitted:0,confirmed:0,declined:0};for(const a of e)s[ft(a)]=(s[ft(a)]||0)+1;const n=[["all",o("meet_entries_filter_all")],["submitted",o("meet_entries_filter_submitted")],["confirmed",o("meet_entries_filter_confirmed")],["none",o("meet_entries_filter_none")]];return`
    <div class="me-toolbar">
      <input type="search" id="me-search" class="me-search" placeholder="${v(o("meet_entries_search"))}" value="${v(h.search)}">
      <select id="me-filter" class="me-filter">
        ${n.map(([a,i])=>`<option value="${a}" ${h.filter===a?"selected":""}>${v(i)}</option>`).join("")}
      </select>
      <span class="me-counts">${v(o("meet_entries_counts",{total:e.length,submitted:s.submitted,confirmed:s.confirmed}))}</span>
    </div>
    <div id="me-list-body">${us()}</div>
    ${t>0?`<p class="me-hint">${v(o("meet_entries_no_usa_id_hint",{count:t}))}</p>`:""}
  `}function us(){const e=h.search.trim().toLowerCase(),t=h.swimmers.filter(s=>mt(s)).map(s=>({sw:s,status:ft(s),count:wn(s)})).filter(({sw:s,status:n})=>e&&!String(s.name).toLowerCase().includes(e)?!1:h.filter==="all"?!0:n===h.filter).sort((s,n)=>String(s.sw.name).localeCompare(String(n.sw.name)));return h.loading?`<p class="me-empty">${v(o("meet_entries_loading"))}</p>`:t.length===0?`<p class="me-empty">${v(o("meet_entries_none_match"))}</p>`:`
    <table class="me-table">
      <thead>
        <tr>
          <th>${v(o("meet_entries_col_swimmer"))}</th>
          <th>${v(o("meet_entries_col_group"))}</th>
          <th>${v(o("meet_entries_col_events"))}</th>
          <th>${v(o("meet_entries_col_status"))}</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${t.map(({sw:s,status:n,count:a})=>`
          <tr>
            <td class="me-name">${v(s.name)}</td>
            <td>${s.age!=null?`${s.age} · `:""}${v(s.ageGroup||"")}</td>
            <td>${a}</td>
            <td>${ms(n)}</td>
            <td class="me-row-action">
              <button type="button" class="btn btn-outline btn-sm" data-action="edit" data-usa="${v(s.usaId)}">
                ${v(o(n==="none"?"meet_entries_add":"meet_entries_review"))}
              </button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `}function xo(){const e=h.active;if(!e)return`<p class="me-empty">${v(o("meet_entries_pick_swimmer"))}</p>`;if(!h.ctx)return`<p class="me-empty">${v(o("meet_entries_loading"))}</p>`;const t=h.ctx.ageGroup==="Open",s=t?h.ctx.individual:h.ctx.individual.filter(l=>!l.isOpenGroup),n=t?[]:h.ctx.individual.filter(l=>l.isOpenGroup),a=Sa(s),i=h.ctx.relays,r=cs(),d=n.some(l=>h.selected.has(l.key));return`
    ${Fe()?`<button type="button" class="btn btn-outline btn-sm me-back" data-action="back">← ${v(o("meet_entries_back"))}</button>`:""}
    <div class="me-swimmer-head">
      <div class="me-swimmer-id">
        <h3>${v(e.name)}</h3>
        <p class="me-sub">
          ${v(o("meet_entries_swims_as",{age:h.ctx.age??"—",group:h.ctx.ageGroup||"—",date:h.meet.ageDeterminedOn||h.meet.startDate||""}))}
          · ${v(h.ctx.qualifiedCount>0?o("meet_entries_qualifies_count",{count:h.ctx.qualifiedCount}):o("meet_entries_qualifies_none"))}
          ${h.status!=="none"?` · ${ms(h.status)}`:""}
        </p>
        ${h.ctx.fetchedAt?`<p class="me-sub me-freshness">${v(o("meet_entries_data_as_of",{date:(ho(h.ctx.fetchedAt)||new Date).toLocaleDateString()}))}</p>`:""}
      </div>
      <div id="me-summary" class="me-summary"></div>
    </div>

    ${r?`<p class="me-alert">${v(o("meet_entries_locked"))}</p>`:""}
    ${h.ctx.blocked.length?`<p class="me-alert">${v(So())}</p>`:""}
    ${a.length===0&&!h.ctx.blocked.length?`<p class="me-empty">${v(o("meet_entries_no_events"))}</p>`:""}

    ${a.map(l=>`
      <section class="me-day">
        <h4>${v(ps(l.day))}</h4>
        ${[...l.sessions.values()].map(A=>`
          <div class="me-session">
            ${A.label?`<div class="me-session-label">${v(A.label)}</div>`:""}
            ${A.options.map(m=>js(m,{isLocked:r})).join("")}
          </div>
        `).join("")}
      </section>
    `).join("")}

    ${n.length?`
      <details class="me-open" ${d?"open":""}>
        <summary>${v(o("meet_entries_open_title"))}</summary>
        <p class="me-hint">${v(o("meet_entries_open_hint"))}</p>
        ${n.map(l=>js(l,{isLocked:r,markOpen:!0})).join("")}
      </details>
    `:""}

    ${i.length?`
      <section class="me-day">
        <h4>${v(o("meet_entries_relays_title"))}</h4>
        <p class="me-hint">${v(o("meet_entries_relays_hint"))}</p>
        <div class="me-relay-list">
          ${i.map(l=>`<span class="me-relay-chip">#${l.eventNo} ${v(l.ageGroup)} ${v(l.label)}</span>`).join("")}
        </div>
      </section>
    `:""}

    <div id="me-problems" class="me-problems"></div>

    <label class="me-note-label" for="me-note">${v(o(Fe()?"meet_entries_coach_note":"meet_entries_note"))}</label>
    <textarea id="me-note" class="me-note" rows="2" placeholder="${v(o("meet_entries_note_placeholder"))}" ${r?"disabled":""}>${v(h.note)}</textarea>
  `}function ps(e){if(!e||e==="unknown")return o("meet_entries_day_unknown");const t=new Date(`${e}T00:00:00`);return Number.isNaN(t.getTime())?e:t.toLocaleDateString(void 0,{weekday:"short",month:"short",day:"numeric"})}function So(){const e={"no-usa-id":o("meet_entries_blocked_no_id"),"no-dob":o("meet_entries_blocked_no_dob"),"no-gender":o("meet_entries_blocked_no_gender")};return h.ctx.blocked.map(t=>e[t]||t).join(" ")}function js(e,{isLocked:t,markOpen:s=!1}){const n=h.selected.has(e.key),a=t||e.relay,i=`me-row me-row--${e.state}${n?" is-selected":""}${s?" is-open":""}`,r=e.state==="no-time"?`
    <span class="me-manual-wrap"${n?"":" hidden"}>
      <input type="text" class="me-manual" data-manual="${v(e.key)}"
             placeholder="${v(o("meet_entries_manual_time"))}"
             value="${v(h.manualTimes[e.key]||"")}" ${t?"disabled":""}>
    </span>`:"";return`
    <div class="${i}" data-event-row="${v(e.key)}">
      <label class="me-row-main">
        <input type="checkbox" data-key="${v(e.key)}" ${n?"checked":""} ${a?"disabled":""}>
        <span class="me-evt-no">#${e.eventNo}</span>
        <span class="me-evt-label">${v(e.ageGroup)} ${v(e.label)}</span>
        <span class="me-evt-time">${Eo(e)}</span>
      </label>
      ${r}
    </div>
  `}function Eo(e){var a,i;if(e.noStandard)return`<span class="me-state me-state--none">${v(o("meet_entries_no_line"))}</span>`;if(e.state==="qualified")return`<span class="me-state me-state--ok">✅ ${v(xe(e.bestSeconds))} ${v(e.bestCourse)}</span>
      <small>${v(o("meet_entries_line"))} ${v(xe(e.standardSeconds))}${e.bestDate?` · ${v(e.bestDate)}`:""}</small>`;if(e.state==="slower")return`<span class="me-state me-state--warn">⚠️ ${v(xe(e.bestSeconds))} ${v(e.bestCourse)}</span>
      <small>${v(o("meet_entries_line"))} ${v(xe(e.standardSeconds))} · ${v(o("meet_entries_gap",{gap:Number(e.gapSeconds).toFixed(2)}))}</small>`;const t=e.staleSeconds!=null?` <small>${v(o("meet_entries_stale",{time:xe(e.staleSeconds),date:e.staleDate}))}</small>`:"",s=((a=e.standards)==null?void 0:a.SCY)!=null?`${xe(e.standards.SCY)} SCY`:((i=e.standards)==null?void 0:i.LCM)!=null?`${xe(e.standards.LCM)} LCM`:"",n=s?` <small>${v(o("meet_entries_line"))} ${v(s)}</small>`:"";return`<span class="me-state me-state--none">${v(o("meet_entries_no_time"))}</span>${n}${t}`}function qt(e,t){var a;return`<a class="btn btn-outline btn-sm me-print" href="${`/meet-print.html?meet=${encodeURIComponent(((a=h.meet)==null?void 0:a.id)||"")}${e}`}" target="_blank" rel="noopener">${v(t)}</a>`}function xn(){var n;if(h.view==="list"){const a=Fe()?`<button type="button" class="btn btn-outline btn-sm" data-action="relays">${v(o("meet_entries_relays_btn"))}</button>`:"",i=Fe()?`<button type="button" class="btn btn-primary btn-sm" data-action="export-zip">${v(o("meet_entries_export_zip"))}</button>`:"";return`<span class="me-footer-note">${v(o("meet_entries_footer_list"))}</span><span class="me-footer-note me-save-note" id="me-export-note"></span>`+i+a+qt("",o("meet_entries_print_all"))+qt("&group=sex",o("meet_entries_print_team"))}if(!((n=h.ctx)!=null&&n.canEnter))return`<button type="button" class="btn btn-outline btn-sm" data-action="back">${v(o("meet_entries_back"))}</button>`;const e=cs(),t=h.saving||e?"disabled":"",s=qt(Fe()?`&family=${encodeURIComponent(h.familyId||"")}`:"&status=all",o("meet_entries_print_sheet"));return Fe()?`
      <button type="button" class="btn btn-primary btn-sm" data-action="confirm" ${t}>${v(o("meet_entries_save_confirm"))}</button>
      <button type="button" class="btn btn-outline btn-sm" data-action="save" ${t}>${v(o("meet_entries_save"))}</button>
      <button type="button" class="btn btn-outline btn-sm me-danger" data-action="decline" ${t}>${v(o("meet_entries_decline"))}</button>
      ${h.status==="confirmed"||h.status==="declined"?`<button type="button" class="btn btn-outline btn-sm" data-action="reopen" ${t}>${v(o("meet_entries_reopen"))}</button>`:""}
      ${s}
      <span class="me-footer-note me-save-note"></span>
    `:`
    <button type="button" class="btn btn-primary btn-sm" data-action="submit" ${t}>${v(o("meet_entries_submit"))}</button>
    <button type="button" class="btn btn-outline btn-sm" data-action="draft" ${t}>${v(o("meet_entries_save_draft"))}</button>
    ${s}
    <span class="me-footer-note me-save-note">${v(h.saving?o("meet_entries_saving"):h.error||"")}</span>
  `}async function Co(){const e=document.getElementById("me-export-note"),t=document.querySelector('#meet-entries-container [data-action="export-zip"]'),s=(n,a=!1)=>{e&&(e.textContent=n,e.classList.toggle("me-error",a))};t&&(t.disabled=!0),s("Preparing…");try{const n=await fo({meet:h.meet,swimmers:h.swimmers,onProgress:a=>s(a)});s(n.ok?`✅ ${n.message}`:`⛔ ${n.message}`,!n.ok)}finally{t&&(t.disabled=!1)}}function ht(){var a,i;if(!h.ctx)return null;const e=wa({meet:h.meet,context:h.ctx,selected:[...h.selected],manualTimes:h.manualTimes}),t=document.getElementById("me-summary"),s=document.getElementById("me-problems");if(t){const r=(i=(a=h.meet)==null?void 0:a.limits)==null?void 0:i.maxEvents,d=Object.entries(e.counts.byDay||{}).map(([l,A])=>{var m,c;return`${ps(l)} ${A}/${((c=(m=h.meet)==null?void 0:m.limits)==null?void 0:c.maxPerDay)??"–"}`}).join(" · ");t.innerHTML=`
      <strong>${e.counts.total}${r?` / ${r}`:""}</strong> ${v(o("meet_entries_events_chosen"))}
      ${d?`<div class="me-summary-days">${v(d)}</div>`:""}
    `}if(s){const r=[...e.errors.map(d=>`<li class="me-problem me-problem--error">⛔ ${v(Os(d))}</li>`),...e.warnings.map(d=>`<li class="me-problem me-problem--warn">⚠️ ${v(Os(d))}</li>`)];s.innerHTML=r.length?`<ul>${r.join("")}</ul>`:""}const n=document.querySelector('[data-action="submit"], [data-action="confirm"]');return n&&(n.disabled=h.saving||cs()||!e.ok),e}function Os(e){switch(e.code){case"too-many-events":return o("meet_entries_err_too_many",{count:e.count,max:e.max});case"too-many-per-day":return o("meet_entries_err_per_day",{day:ps(e.day),count:e.count,max:e.max});case"relay-coach-only":return o("meet_entries_err_relay");case"missing-seed-time":return o("meet_entries_err_seed_missing",{label:e.label});case"bad-seed-time":return o("meet_entries_err_seed_bad",{label:e.label,value:e.value});case"duplicate":case"unknown-event":return o("meet_entries_err_invalid");case"slower-than-line":return e.bonusAllowed>0?o("meet_entries_warn_slower_bonus",{label:e.label,gap:e.gapSeconds,count:e.bonusAllowed}):o("meet_entries_warn_slower",{label:e.label,gap:e.gapSeconds});case"manual-time":return o("meet_entries_warn_manual",{label:e.label,value:e.value});case"open-event":return o("meet_entries_warn_open",{label:e.label});case"same-event-twice":return o("meet_entries_warn_twice",{labels:e.labels.join(", ")});default:return e.code}}function Io(e){if(e.target.id==="me-close"||e.target.id==="meet-entries-overlay"){Xt();return}const t=e.target.closest("[data-action]");if(!t)return;const s=t.dataset.action;if(s==="export-zip"){Co();return}if(s==="back"){h.view="list",h.ctx=null,De();return}if(s==="relays"){const n=h.meet,a=h.swimmers,i=h.actorId;Xt(),Ta({meet:n,swimmers:a,actorId:i});return}if(s==="edit"){const n=h.swimmers.find(a=>a.usaId===t.dataset.usa);n&&Sn(n);return}if(s==="submit"){Je({status:"submitted"});return}if(s==="draft"){Je({status:"draft"});return}if(s==="save"){Je({status:h.status==="none"?"confirmed":h.status});return}if(s==="confirm"){Je({status:"confirmed"});return}if(s==="decline"){Je({status:"declined"});return}if(s==="reopen"){Je({status:"submitted"});return}}function ko(e){if(e.target.id==="me-filter"){h.filter=e.target.value;const s=document.getElementById("me-list-body");s&&(s.innerHTML=us());return}const t=e.target.closest('input[type="checkbox"][data-key]');t&&Fo(t.dataset.key,t.checked)}function No(e){if(e.target.matches("input[data-manual]")){h.manualTimes[e.target.dataset.manual]=e.target.value,ht();return}if(e.target.id==="me-note"){h.note=e.target.value;return}if(e.target.id==="me-search"){h.search=e.target.value;const t=document.getElementById("me-list-body");t&&(t.innerHTML=us())}}function Fo(e,t){t?h.selected.add(e):h.selected.delete(e);const s=[...document.querySelectorAll("[data-event-row]")].find(a=>a.dataset.eventRow===e);if(s){s.classList.toggle("is-selected",t);const a=s.querySelector(".me-manual-wrap");a&&(a.hidden=!t)}const n=document.getElementById("me-footer");n&&(n.innerHTML=xn()),ht()}async function Sn(e){h.view="editor",h.active=e,h.ctx=null,h.status=ft(e),h.selected=new Set,h.manualTimes={},h.error="";const t=dt(e);h.note=(t==null?void 0:t.note)||"";for(const i of(t==null?void 0:t.events)||[]){const r=`${i.eventNo}|${i.ageGroup}`;h.selected.add(r),i.source==="manual"&&i.seedTime&&(h.manualTimes[r]=i.seedTime)}De();const{list:s,fetchedAt:n,error:a}=await Bo(e.usaId);if(h.ctx=_a({meet:h.meet,swimmer:{...e,usaSwimmingId:e.usaId},bestTimes:s}),h.ctx.fetchedAt=n||null,h.ctx.readError=a||null,t){const i=new Map(h.ctx.individual.map(r=>[r.key,r]));for(const r of t.events||[]){const d=`${r.eventNo}|${r.ageGroup}`,l=i.get(d);l&&l.state==="no-time"&&r.seedTime&&!h.manualTimes[d]&&(h.manualTimes[d]=r.seedTime)}}De()}function Do(){const e=new Map([...h.ctx.individual,...h.ctx.relays].map(s=>[s.key,s])),t=[];for(const s of h.selected){const n=e.get(s);if(!n||n.relay)continue;const a=String(h.manualTimes[s]||"").trim(),i=n.state==="no-time"&&a;t.push({eventNo:n.eventNo,ageGroup:n.ageGroup,distance:n.distance,stroke:n.stroke,sessionId:n.sessionId,day:n.day,course:i?"SCY":n.bestCourse||"SCY",seedTime:i?a:n.bestSeconds!=null?xe(n.bestSeconds):"",seedSeconds:i?null:n.bestSeconds??null,source:i?"manual":"db",proofDate:i?"":n.bestDate||"",standard:n.standardSeconds??null,qualifies:n.state==="qualified"})}return t.sort((s,n)=>String(s.day).localeCompare(String(n.day))||s.eventNo-n.eventNo),t}async function Je({status:e}){if(h.saving||!h.ctx)return;const t=h.active,s=mt(t);if(!s){h.error=o("meet_entries_blocked_no_id"),De();return}const n=ht();if(e!=="draft"&&n&&!n.ok){h.error=o("meet_entries_fix_errors");const d=document.querySelector(".me-save-note");d&&(d.textContent=h.error);return}h.saving=!0,h.error="";const a=document.querySelector(".me-save-note");a&&(a.textContent=o("meet_entries_saving"));const i=dt(t),r={meetId:h.meet.id,familyId:t.familyId,usaSwimmingId:t.usaId,swimmerName:t.name,ageAtMeet:h.ctx.age,ageGroup:h.ctx.ageGroup,gender:h.ctx.gender,status:e,events:Do(),note:h.note||"",updatedAt:at(),updatedBy:h.actorId||""};e==="submitted"&&!(i!=null&&i.submittedAt)&&(r.submittedAt=at()),e==="confirmed"&&(r.confirmedAt=at());try{await Ee(M(E,"meets",h.meet.id,"entries",s),r,{merge:!0}),h.status=e,h.entries.set(s,{...i||{},...r,id:s,status:e}),h.saving=!1,De()}catch(d){console.error("[meetEntries] save failed:",d),h.saving=!1,h.error=d.message||String(d),ht();const l=document.querySelector(".me-save-note");l&&(l.textContent=h.error)}}const zs={"10 & under":{SCY:{"50 FR":{girls:{B:39.79,BB:35.99,A:32.09,AA:30.89,AAA:29.59,AAAA:28.29},boys:{AAAA:27.49,AAA:28.69,AA:29.89,A:31.09,BB:34.59,B:38.19}},"100 FR":{girls:{B:90.79,BB:81.09,A:71.49,AA:68.29,AAA:64.99,AAAA:61.79},boys:{AAAA:60.69,AAA:63.79,AA:66.79,A:69.79,BB:78.89,B:87.99}},"200 FR":{girls:{B:202.79,BB:180.59,A:158.39,AA:150.99,AAA:143.59,AAAA:136.19},boys:{AAAA:132.69,AAA:138.99,AA:145.29,A:151.59,BB:170.59,B:189.49}},"500 FR":{girls:{B:516.69,BB:465.09,A:413.39,AA:396.19,AAA:378.99,AAAA:361.69},boys:{AAAA:352.99,AAA:369.79,AA:386.59,A:403.39,BB:453.79,B:504.29}},"50 BK":{girls:{B:48.59,BB:43.29,A:37.99,AA:36.19,AAA:34.39,AAAA:32.59},boys:{AAAA:32.19,AAA:33.99,AA:35.79,A:37.59,BB:42.89,B:48.29}},"100 BK":{girls:{B:105.79,BB:93.99,A:82.29,AA:78.39,AAA:74.49,AAAA:70.59},boys:{AAAA:68.99,AAA:72.49,AA:76.09,A:79.59,BB:90.09,B:100.69}},"50 BR":{girls:{B:54.59,BB:48.69,A:42.79,AA:40.89,AAA:38.89,AAAA:36.89},boys:{AAAA:36.39,AAA:38.29,AA:40.19,A:42.09,BB:47.69,B:53.39}},"100 BR":{girls:{B:120.29,BB:106.89,A:93.59,AA:89.09,AAA:84.69,AAAA:80.19},boys:{AAAA:78.79,AAA:82.69,AA:86.59,A:90.59,BB:102.29,B:114.09}},"50 FL":{girls:{B:48.39,BB:42.69,A:36.99,AA:35.09,AAA:33.19,AAAA:31.29},boys:{AAAA:30.79,AAA:32.59,AA:34.29,A:35.99,BB:41.29,B:46.49}},"100 FL":{girls:{B:116.69,BB:101.39,A:86.09,AA:80.99,AAA:75.99,AAAA:70.89},boys:{AAAA:69.79,AAA:74.59,AA:79.49,A:84.39,BB:98.99,B:113.49}},"100 IM":{girls:{B:104.29,BB:93.19,A:82.09,AA:78.39,AAA:74.69,AAAA:70.99},boys:{AAAA:69.79,AAA:73.09,AA:76.39,A:79.69,BB:89.69,B:99.69}},"200 IM":{girls:{B:222.09,BB:198.79,A:175.49,AA:167.69,AAA:159.99,AAAA:152.19},boys:{AAAA:150.89,AAA:158.39,AA:165.89,A:173.49,BB:195.99,B:218.59}},"200 FR-R":{girls:{B:173.19,BB:155.89,A:138.59,AA:132.79,AAA:126.99,AAAA:121.19},boys:{AAAA:120.19,AAA:125.89,AA:131.59,A:137.29,BB:154.49,B:171.69}},"200 MED-R":{girls:{B:194.99,BB:175.49,A:155.99,AA:149.49,AAA:142.99,AAAA:136.49},boys:{AAAA:135.39,AAA:141.79,AA:148.29,A:154.69,BB:173.99,B:193.39}}},SCM:{"50 FR":{girls:{B:43.99,BB:39.79,A:35.49,AA:34.09,AAA:32.69,AAAA:31.29},boys:{AAAA:30.39,AAA:31.69,AA:32.99,A:34.29,BB:38.19,B:42.19}},"100 FR":{girls:{B:100.29,BB:89.69,A:78.99,AA:75.39,AAA:71.89,AAAA:68.29},boys:{AAAA:67.09,AAA:70.39,AA:73.79,A:77.09,BB:87.19,B:97.19}},"200 FR":{girls:{B:223.99,BB:199.49,A:174.99,AA:166.79,AAA:158.59,AAAA:150.39},boys:{AAAA:146.59,AAA:153.59,AA:160.59,A:167.49,BB:188.49,B:209.39}},"400 FR":{girls:{B:452.19,BB:406.89,A:361.69,AA:346.69,AAA:331.59,AAAA:316.49},boys:{AAAA:308.89,AAA:323.59,AA:338.29,A:352.99,BB:397.09,B:441.19}},"50 BK":{girls:{B:53.69,BB:47.79,A:41.89,AA:39.99,AAA:37.99,AAAA:36.09},boys:{AAAA:35.59,AAA:37.59,AA:39.59,A:41.49,BB:47.39,B:53.39}},"100 BK":{girls:{B:116.89,BB:103.89,A:90.89,AA:86.59,AAA:82.29,AAAA:77.99},boys:{AAAA:76.29,AAA:80.09,AA:83.99,A:87.89,BB:99.59,B:111.19}},"50 BR":{girls:{B:60.29,BB:53.79,A:47.29,AA:45.09,AAA:42.99,AAAA:40.79},boys:{AAAA:40.19,AAA:42.29,AA:44.39,A:46.49,BB:52.79,B:58.99}},"100 BR":{girls:{B:132.89,BB:118.19,A:103.39,AA:98.49,AAA:93.59,AAAA:88.69},boys:{AAAA:86.99,AAA:91.39,AA:95.69,A:100.09,BB:113.09,B:126.09}},"50 FL":{girls:{B:53.49,BB:47.19,A:40.89,AA:38.79,AAA:36.69,AAAA:34.59},boys:{AAAA:33.99,AAA:35.99,AA:37.89,A:39.79,BB:45.59,B:51.39}},"100 FL":{girls:{B:128.89,BB:112.09,A:95.19,AA:89.49,AAA:83.89,AAAA:78.29},boys:{AAAA:77.09,AAA:82.49,AA:87.79,A:93.19,BB:109.29,B:125.49}},"100 IM":{girls:{B:115.19,BB:102.99,A:90.69,AA:86.59,AAA:82.49,AAAA:78.39},boys:{AAAA:77.09,AAA:80.79,AA:84.39,A:88.09,BB:99.09,B:110.09}},"200 IM":{girls:{B:245.39,BB:219.59,A:193.89,AA:185.29,AAA:176.79,AAAA:168.19},boys:{AAAA:166.69,AAA:175.09,AA:183.39,A:191.69,BB:216.59,B:241.59}},"200 FR-R":{girls:{B:191.39,BB:172.19,A:153.09,AA:146.69,AAA:140.29,AAAA:133.99},boys:{AAAA:132.79,AAA:139.09,AA:145.39,A:151.69,BB:170.69,B:189.69}},"200 MED-R":{girls:{B:215.49,BB:193.89,A:172.39,AA:165.19,AAA:157.99,AAAA:150.79},boys:{AAAA:149.59,AAA:156.69,AA:163.79,A:170.89,BB:192.29,B:213.69}}},LCM:{"50 FR":{girls:{B:45.29,BB:40.89,A:36.59,AA:35.09,AAA:33.69,AAAA:32.19},boys:{AAAA:31.59,AAA:32.99,AA:34.39,A:35.69,BB:39.79,B:43.89}},"100 FR":{girls:{B:104.09,BB:92.99,A:81.89,AA:78.19,AAA:74.49,AAAA:70.79},boys:{AAAA:69.79,AAA:73.19,AA:76.69,A:80.19,BB:90.59,B:100.99}},"200 FR":{girls:{B:230.99,BB:205.69,A:180.39,AA:171.99,AAA:163.49,AAAA:155.09},boys:{AAAA:151.69,AAA:158.89,AA:166.09,A:173.39,BB:194.99,B:216.69}},"400 FR":{girls:{B:468.59,BB:421.69,A:374.89,AA:359.29,AAA:343.69,AAAA:327.99},boys:{AAAA:320.79,AAA:336.09,AA:351.39,A:366.59,BB:412.49,B:458.29}},"50 BK":{girls:{B:55.79,BB:49.69,A:43.59,AA:41.59,AAA:39.49,AAAA:37.49},boys:{AAAA:36.99,AAA:38.99,AA:41.09,A:43.09,BB:49.29,B:55.39}},"100 BK":{girls:{B:121.59,BB:108.09,A:94.59,AA:90.09,AAA:85.59,AAAA:81.09},boys:{AAAA:79.99,AAA:84.09,AA:88.19,A:92.29,BB:104.49,B:116.69}},"50 BR":{girls:{B:62.19,BB:55.49,A:48.79,AA:46.49,AAA:44.29,AAAA:42.09},boys:{AAAA:41.49,AAA:43.59,AA:45.79,A:47.89,BB:54.39,B:60.89}},"100 BR":{girls:{B:139.39,BB:123.89,A:108.39,AA:103.29,AAA:98.09,AAAA:92.99},boys:{AAAA:91.69,AAA:96.29,AA:100.89,A:105.49,BB:119.19,B:132.89}},"50 FL":{girls:{B:54.49,BB:48.09,A:41.59,AA:39.49,AAA:37.29,AAAA:35.19},boys:{AAAA:34.69,AAA:36.59,AA:38.59,A:40.59,BB:46.39,B:52.29}},"100 FL":{girls:{B:132.79,BB:115.39,A:97.99,AA:92.19,AAA:86.39,AAAA:80.59},boys:{AAAA:79.59,AAA:85.09,AA:90.69,A:96.19,BB:112.89,B:129.49}},"200 IM":{girls:{B:255.69,BB:228.89,A:202.09,AA:193.09,AAA:184.19,AAAA:175.29},boys:{AAAA:172.19,AAA:180.79,AA:189.39,A:197.89,BB:223.69,B:249.49}},"200 FR-R":{girls:{B:197.49,BB:177.79,A:157.99,AA:151.39,AAA:144.79,AAAA:138.29},boys:{AAAA:137.19,AAA:143.69,AA:150.19,A:156.79,BB:176.39,B:195.89}},"200 MED-R":{girls:{B:223.59,BB:201.19,A:178.89,AA:171.39,AAA:163.99,AAAA:156.49},boys:{AAAA:157.59,AAA:165.09,AA:172.59,A:180.09,BB:202.59,B:225.09}}}},"11-12":{SCY:{"50 FR":{girls:{B:33.99,BB:31.69,A:29.29,AA:28.09,AAA:26.99,AAAA:25.79},boys:{AAAA:24.59,AAA:25.79,AA:26.99,A:28.09,BB:30.49,B:32.79}},"100 FR":{girls:{B:74.69,BB:69.39,A:63.99,AA:61.39,AAA:58.69,AAAA:55.99},boys:{AAAA:53.59,AAA:56.19,AA:58.69,A:61.29,BB:66.39,B:71.49}},"200 FR":{girls:{B:162.59,BB:150.89,A:139.29,AA:133.49,AAA:127.69,AAAA:121.89},boys:{AAAA:116.99,AAA:122.59,AA:128.19,A:133.69,BB:144.89,B:155.99}},"500 FR":{girls:{B:436.89,BB:405.69,A:374.49,AA:358.89,AAA:343.29,AAAA:327.69},boys:{AAAA:314.99,AAA:329.99,AA:344.99,A:359.99,BB:389.99,B:419.89}},"1000 FR":{girls:{B:902.69,BB:838.19,A:773.79,AA:741.49,AAA:709.29,AAAA:676.99},boys:{AAAA:662.59,AAA:694.19,AA:725.79,A:757.29,BB:820.39,B:883.49}},"1650 FR":{girls:{B:1507.39,BB:1399.69,A:1292.09,AA:1238.19,AAA:1184.39,AAAA:1130.59},boys:{AAAA:1100.79,AAA:1153.19,AA:1205.59,A:1258.09,BB:1362.89,B:1467.69}},"50 BK":{girls:{B:38.79,BB:35.99,A:33.19,AA:31.79,AAA:30.49,AAAA:29.09},boys:{AAAA:28.19,AAA:29.69,AA:31.19,A:32.69,BB:35.59,B:38.49}},"100 BK":{girls:{B:86.59,BB:79.79,A:72.99,AA:69.59,AAA:66.19,AAAA:62.69},boys:{AAAA:59.49,AAA:62.79,AA:65.99,A:69.29,BB:75.69,B:82.19}},"200 BK":{girls:{B:179.49,BB:166.69,A:153.89,AA:147.49,AAA:140.99,AAAA:134.59},boys:{AAAA:129.69,AAA:135.89,AA:141.99,A:148.19,BB:160.49,B:172.89}},"50 BR":{girls:{B:43.99,BB:40.89,A:37.69,AA:36.19,AAA:34.59,AAAA:32.99},boys:{AAAA:31.49,AAA:33.29,AA:34.99,A:36.69,BB:40.09,B:43.49}},"100 BR":{girls:{B:96.49,BB:89.29,A:82.19,AA:78.59,AAA:75.09,AAAA:71.49},boys:{AAAA:67.79,AAA:71.39,AA:74.89,A:78.39,BB:85.49,B:92.59}},"200 BR":{girls:{B:205.69,BB:190.99,A:176.29,AA:168.99,AAA:161.69,AAAA:154.29},boys:{AAAA:147.29,AAA:154.39,AA:161.39,A:168.39,BB:182.39,B:196.39}},"50 FL":{girls:{B:36.89,BB:34.29,A:31.59,AA:30.29,AAA:28.99,AAAA:27.69},boys:{AAAA:26.69,AAA:28.19,AA:29.69,A:31.19,BB:34.19,B:37.09}},"100 FL":{girls:{B:85.79,BB:78.89,A:72.09,AA:68.59,AAA:65.19,AAAA:61.79},boys:{AAAA:59.09,AAA:62.49,AA:65.89,A:69.29,BB:76.09,B:82.89}},"200 FL":{girls:{B:183.39,BB:170.29,A:157.19,AA:150.59,AAA:144.09,AAAA:137.59},boys:{AAAA:132.39,AAA:138.69,AA:144.99,A:151.39,BB:163.99,B:176.59}},"100 IM":{girls:{B:85.19,BB:79.09,A:73.09,AA:69.99,AAA:66.99,AAAA:63.89},boys:{AAAA:61.09,AAA:63.99,AA:66.99,A:69.99,BB:75.89,B:81.89}},"200 IM":{girls:{B:183.89,BB:170.69,A:157.59,AA:150.99,AAA:144.49,AAAA:137.89},boys:{AAAA:132.09,AAA:138.79,AA:145.59,A:152.29,BB:165.79,B:179.29}},"400 IM":{girls:{B:391.69,BB:363.69,A:335.79,AA:321.79,AAA:307.79,AAAA:293.79},boys:{AAAA:282.79,AAA:296.29,AA:309.79,A:323.19,BB:350.09,B:377.09}},"200 FR-R":{girls:{B:144.79,BB:134.39,A:124.09,AA:118.89,AAA:113.79,AAAA:108.59},boys:{AAAA:104.39,AAA:109.29,AA:114.29,A:119.29,BB:129.19,B:139.09}},"400 FR-R":{girls:{B:318.09,BB:295.39,A:272.69,AA:261.29,AAA:249.99,AAAA:238.59},boys:{AAAA:230.09,AAA:240.99,AA:251.99,A:262.89,BB:284.79,B:306.79}},"200 MED-R":{girls:{B:161.19,BB:149.69,A:138.19,AA:132.39,AAA:126.69,AAAA:120.89},boys:{AAAA:115.59,AAA:121.09,AA:126.59,A:132.09,BB:143.09,B:154.09}},"400 MED-R":{girls:{B:353.49,BB:328.29,A:302.99,AA:290.39,AAA:277.79,AAAA:265.09},boys:{AAAA:254.79,AAA:266.99,AA:279.09,A:291.19,BB:315.49,B:339.79}}},SCM:{"50 FR":{girls:{B:37.59,BB:34.99,A:32.39,AA:31.09,AAA:29.79,AAAA:28.49},boys:{AAAA:27.19,AAA:28.49,AA:29.79,A:31.09,BB:33.69,B:36.29}},"100 FR":{girls:{B:82.49,BB:76.59,A:70.69,AA:67.79,AAA:64.89,AAAA:61.89},boys:{AAAA:59.19,AAA:62.09,AA:64.89,A:67.69,BB:73.29,B:78.99}},"200 FR":{girls:{B:179.59,BB:166.79,A:153.99,AA:147.59,AAA:141.09,AAAA:134.69},boys:{AAAA:129.29,AAA:135.49,AA:141.59,A:147.79,BB:160.09,B:172.39}},"400 FR":{girls:{B:382.29,BB:354.99,A:327.69,AA:314.09,AAA:300.39,AAAA:286.79},boys:{AAAA:275.59,AAA:288.69,AA:301.79,A:314.99,BB:341.19,B:367.49}},"800 FR":{girls:{B:789.89,BB:733.49,A:676.99,AA:648.79,AAA:620.59,AAAA:592.39},boys:{AAAA:579.79,AAA:607.39,AA:634.99,A:662.59,BB:717.89,B:773.09}},"1500 FR":{girls:{B:1498.39,BB:1391.29,A:1284.29,AA:1230.79,AAA:1177.29,AAAA:1123.79},boys:{AAAA:1094.19,AAA:1146.29,AA:1198.39,A:1250.49,BB:1354.69,B:1458.89}},"50 BK":{girls:{B:42.79,BB:39.79,A:36.69,AA:35.19,AAA:33.59,AAAA:32.09},boys:{AAAA:31.19,AAA:32.79,AA:34.49,A:36.09,BB:39.29,B:42.59}},"100 BK":{girls:{B:95.69,BB:88.19,A:80.59,AA:76.89,AAA:73.09,AAAA:69.29},boys:{AAAA:65.79,AAA:69.39,AA:72.89,A:76.49,BB:83.69,B:90.79}},"200 BK":{girls:{B:198.29,BB:184.19,A:169.99,AA:162.89,AAA:155.79,AAAA:148.79},boys:{AAAA:143.29,AAA:150.09,AA:156.89,A:163.69,BB:177.39,B:190.99}},"50 BR":{girls:{B:48.59,BB:45.19,A:41.69,AA:39.89,AAA:38.19,AAAA:36.49},boys:{AAAA:34.89,AAA:36.69,AA:38.59,A:40.49,BB:44.29,B:48.09}},"100 BR":{girls:{B:106.59,BB:98.69,A:90.79,AA:86.89,AAA:82.99,AAAA:78.99},boys:{AAAA:74.99,AAA:78.89,AA:82.79,A:86.69,BB:94.49,B:102.29}},"200 BR":{girls:{B:227.29,BB:211.09,A:194.89,AA:186.69,AAA:178.59,AAAA:170.49},boys:{AAAA:162.79,AAA:170.59,AA:178.29,A:186.09,BB:201.59,B:217.09}},"50 FL":{girls:{B:40.79,BB:37.79,A:34.89,AA:33.49,AAA:31.99,AAAA:30.59},boys:{AAAA:29.59,AAA:31.19,AA:32.79,A:34.49,BB:37.69,B:40.99}},"100 FL":{girls:{B:94.79,BB:87.19,A:79.59,AA:75.79,AAA:72.09,AAAA:68.29},boys:{AAAA:65.29,AAA:68.99,AA:72.79,A:76.49,BB:84.09,B:91.59}},"200 FL":{girls:{B:202.59,BB:188.19,A:173.69,AA:166.49,AAA:159.19,AAAA:151.99},boys:{AAAA:146.29,AAA:153.29,AA:160.29,A:167.19,BB:181.19,B:195.09}},"100 IM":{girls:{B:94.19,BB:87.49,A:80.69,AA:77.39,AAA:73.99,AAAA:70.59},boys:{AAAA:67.49,AAA:70.69,AA:73.99,A:77.29,BB:83.89,B:90.49}},"200 IM":{girls:{B:203.19,BB:188.69,A:174.19,AA:166.89,AAA:159.59,AAAA:152.39},boys:{AAAA:145.99,AAA:153.39,AA:160.89,A:168.29,BB:183.19,B:198.09}},"400 IM":{girls:{B:432.79,BB:401.89,A:370.99,AA:355.59,AAA:340.09,AAAA:324.59},boys:{AAAA:312.49,AAA:327.39,AA:342.29,A:357.19,BB:386.89,B:416.69}},"200 FR-R":{girls:{B:159.89,BB:148.49,A:137.09,AA:131.39,AAA:125.69,AAAA:119.99},boys:{AAAA:115.29,AAA:120.79,AA:126.29,A:131.79,BB:142.79,B:153.69}},"400 FR-R":{girls:{B:351.59,BB:326.39,A:301.29,AA:288.79,AAA:276.19,AAAA:263.69},boys:{AAAA:254.19,AAA:266.29,AA:278.39,A:290.49,BB:314.69,B:338.99}},"200 MED-R":{girls:{B:178.09,BB:165.39,A:152.69,AA:146.29,AAA:139.89,AAAA:133.59},boys:{AAAA:127.79,AAA:133.79,AA:139.89,A:145.99,BB:158.19,B:170.29}},"400 MED-R":{girls:{B:390.59,BB:362.69,A:334.79,AA:320.89,AAA:306.89,AAAA:292.99},boys:{AAAA:281.59,AAA:294.99,AA:308.39,A:321.79,BB:348.59,B:375.39}}},LCM:{"50 FR":{girls:{B:38.49,BB:35.89,A:33.19,AA:31.89,AAA:30.49,AAAA:29.19},boys:{AAAA:28.09,AAA:29.39,AA:30.69,A:32.09,BB:34.79,B:37.39}},"100 FR":{girls:{B:85.59,BB:79.49,A:73.39,AA:70.29,AAA:67.19,AAAA:64.19},boys:{AAAA:61.59,AAA:64.49,AA:67.49,A:70.39,BB:76.19,B:82.09}},"200 FR":{girls:{B:186.39,BB:173.09,A:159.79,AA:153.09,AAA:146.49,AAAA:139.79},boys:{AAAA:134.39,AAA:140.79,AA:147.19,A:153.59,BB:166.39,B:179.19}},"400 FR":{girls:{B:392.89,BB:364.79,A:336.79,AA:322.79,AAA:308.69,AAAA:294.69},boys:{AAAA:285.89,AAA:299.49,AA:313.09,A:326.69,BB:353.89,B:381.09}},"800 FR":{girls:{B:821.59,BB:762.89,A:704.19,AA:674.89,AAA:645.49,AAAA:616.19},boys:{AAAA:600.09,AAA:628.69,AA:657.29,A:685.89,BB:742.99,B:800.19}},"1500 FR":{girls:{B:1566.89,BB:1454.99,A:1342.99,AA:1287.09,AAA:1231.09,AAAA:1175.19},boys:{AAAA:1163.89,AAA:1219.29,AA:1274.69,A:1330.19,BB:1440.99,B:1551.79}},"50 BK":{girls:{B:44.79,BB:41.59,A:38.39,AA:36.79,AAA:35.19,AAAA:33.59},boys:{AAAA:32.59,AAA:34.29,AA:35.99,A:37.69,BB:41.09,B:44.49}},"100 BK":{girls:{B:100.59,BB:92.69,A:84.79,AA:80.79,AAA:76.89,AAAA:72.89},boys:{AAAA:70.39,AAA:74.29,AA:78.09,A:81.89,BB:89.59,B:97.19}},"200 BK":{girls:{B:208.09,BB:193.29,A:178.39,AA:170.99,AAA:163.49,AAAA:156.09},boys:{AAAA:152.19,AAA:159.49,AA:166.69,A:173.99,BB:188.49,B:202.99}},"50 BR":{girls:{B:49.79,BB:46.19,A:42.69,AA:40.89,AAA:39.09,AAAA:37.39},boys:{AAAA:36.09,AAA:38.09,AA:39.99,A:41.99,BB:45.89,B:49.79}},"100 BR":{girls:{B:110.39,BB:102.19,A:93.99,AA:89.99,AAA:85.89,AAAA:81.79},boys:{AAAA:78.99,AAA:83.09,AA:87.19,A:91.29,BB:99.59,B:107.79}},"200 BR":{girls:{B:236.79,BB:219.89,A:202.99,AA:194.49,AAA:186.09,AAAA:177.59},boys:{AAAA:170.99,AAA:179.09,AA:187.19,A:195.39,BB:211.59,B:227.89}},"50 FL":{girls:{B:41.79,BB:38.79,A:35.79,AA:34.29,AAA:32.89,AAAA:31.39},boys:{AAAA:30.29,AAA:31.99,AA:33.59,A:35.29,BB:38.69,B:41.99}},"100 FL":{girls:{B:98.29,BB:90.49,A:82.59,AA:78.69,AAA:74.79,AAAA:70.79},boys:{AAAA:67.79,AAA:71.69,AA:75.59,A:79.49,BB:87.29,B:95.09}},"200 FL":{girls:{B:211.09,BB:195.99,A:180.89,AA:173.39,AAA:165.89,AAAA:158.29},boys:{AAAA:153.59,AAA:160.89,AA:168.29,A:175.59,BB:190.19,B:204.79}},"200 IM":{girls:{B:210.59,BB:195.59,A:180.59,AA:172.99,AAA:165.49,AAAA:157.99},boys:{AAAA:150.59,AAA:158.29,AA:165.99,A:173.69,BB:188.99,B:204.39}},"400 IM":{girls:{B:448.89,BB:416.79,A:384.79,AA:368.69,AAA:352.69,AAAA:336.69},boys:{AAAA:328.39,AAA:344.09,AA:359.69,A:375.39,BB:406.59,B:437.89}},"200 FR-R":{girls:{B:164.29,BB:152.59,A:140.89,AA:134.99,AAA:129.09,AAAA:123.29},boys:{AAAA:120.19,AAA:125.89,AA:131.59,A:137.39,BB:148.79,B:160.19}},"400 FR-R":{girls:{B:363.69,BB:337.69,A:311.79,AA:298.79,AAA:285.79,AAAA:272.79},boys:{AAAA:266.79,AAA:279.49,AA:292.19,A:304.89,BB:330.29,B:355.69}},"200 MED-R":{girls:{B:184.19,BB:170.99,A:157.89,AA:151.29,AAA:144.69,AAAA:138.19},boys:{AAAA:134.79,AAA:141.29,AA:147.69,A:154.09,BB:166.89,B:179.79}},"400 MED-R":{girls:{B:408.79,BB:379.59,A:350.39,AA:335.79,AAA:321.19,AAAA:306.59},boys:{AAAA:299.69,AAA:313.99,AA:328.19,A:342.49,BB:370.99,B:399.59}}}},"13-14":{SCY:{"50 FR":{girls:{B:32.49,BB:30.19,A:27.89,AA:26.69,AAA:25.59,AAAA:24.39},boys:{AAAA:22.39,AAA:23.49,AA:24.59,A:25.59,BB:27.69,B:29.89}},"100 FR":{girls:{B:70.99,BB:65.89,A:60.89,AA:58.29,AAA:55.79,AAAA:53.29},boys:{AAAA:48.69,AAA:51.09,AA:53.39,A:55.69,BB:60.29,B:64.99}},"200 FR":{girls:{B:153.59,BB:142.69,A:131.69,AA:126.19,AAA:120.69,AAAA:115.29},boys:{AAAA:106.89,AAA:111.99,AA:117.09,A:122.19,BB:132.29,B:142.49}},"500 FR":{girls:{B:412.19,BB:382.79,A:353.39,AA:338.59,AAA:323.89,AAAA:309.19},boys:{AAAA:289.29,AAA:303.09,AA:316.89,A:330.59,BB:358.19,B:385.69}},"1000 FR":{girls:{B:851.09,BB:790.29,A:729.49,AA:699.09,AAA:668.69,AAAA:638.29},boys:{AAAA:598.49,AAA:626.99,AA:655.49,A:683.99,BB:740.99,B:797.99}},"1650 FR":{girls:{B:1422.89,BB:1321.19,A:1219.59,AA:1168.79,AAA:1117.99,AAAA:1067.19},boys:{AAAA:1007.19,AAA:1055.19,AA:1103.09,A:1151.09,BB:1246.99,B:1342.89}},"50 BK":{girls:{B:36.19,BB:33.69,A:31.09,AA:29.79,AAA:28.49,AAAA:27.19},boys:{AAAA:25.29,AAA:26.49,AA:27.69,A:28.89,BB:31.29,B:33.69}},"100 BK":{girls:{B:76.89,BB:71.39,A:65.89,AA:63.19,AAA:60.49,AAAA:57.69},boys:{AAAA:53.49,AAA:55.99,AA:58.59,A:61.09,BB:66.19,B:71.29}},"200 BK":{girls:{B:166.39,BB:154.49,A:142.59,AA:136.69,AAA:130.69,AAAA:124.79},boys:{AAAA:115.99,AAA:121.59,AA:127.09,A:132.59,BB:143.69,B:154.69}},"50 BR":{girls:{B:42.09,BB:39.09,A:36.09,AA:34.59,AAA:33.09,AAAA:31.59},boys:{AAAA:28.89,AAA:30.29,AA:31.69,A:33.09,BB:35.79,B:38.59}},"100 BR":{girls:{B:88.69,BB:82.29,A:75.99,AA:72.89,AAA:69.69,AAAA:66.49},boys:{AAAA:60.39,AAA:63.29,AA:66.19,A:68.99,BB:74.79,B:80.49}},"200 BR":{girls:{B:190.99,BB:177.39,A:163.79,AA:156.89,AAA:150.09,AAAA:143.29},boys:{AAAA:131.19,AAA:137.39,AA:143.59,A:149.89,BB:162.39,B:174.89}},"50 FL":{girls:{B:35.79,BB:33.29,A:30.69,AA:29.39,AAA:28.19,AAAA:26.89},boys:{AAAA:24.89,AAA:26.09,AA:27.19,A:28.39,BB:30.79,B:33.19}},"100 FL":{girls:{B:76.79,BB:71.29,A:65.89,AA:63.09,AAA:60.39,AAAA:57.59},boys:{AAAA:52.89,AAA:55.39,AA:57.89,A:60.39,BB:65.49,B:70.49}},"200 FL":{girls:{B:171.19,BB:158.99,A:146.69,AA:140.59,AAA:134.49,AAAA:128.39},boys:{AAAA:117.59,AAA:123.19,AA:128.79,A:134.39,BB:145.59,B:156.79}},"200 IM":{girls:{B:171.79,BB:159.49,A:147.19,AA:141.09,AAA:134.99,AAAA:128.79},boys:{AAAA:118.49,AAA:124.09,AA:129.79,A:135.39,BB:146.69,B:157.99}},"400 IM":{girls:{B:365.79,BB:339.69,A:313.49,AA:300.49,AAA:287.39,AAAA:274.29},boys:{AAAA:253.29,AAA:265.39,AA:277.39,A:289.49,BB:313.59,B:337.69}},"200 FR-R":{girls:{B:136.29,BB:126.59,A:116.89,AA:111.99,AAA:107.09,AAAA:102.29},boys:{AAAA:93.69,AAA:98.19,AA:102.59,A:107.09,BB:115.99,B:124.89}},"400 FR-R":{girls:{B:297.29,BB:275.99,A:254.79,AA:244.19,AAA:233.59,AAAA:222.99},boys:{AAAA:204.89,AAA:214.59,AA:224.39,A:234.19,BB:253.69,B:273.19}},"800 FR-R":{girls:{B:649.19,BB:602.79,A:556.39,AA:533.29,AAA:510.09,AAAA:486.89},boys:{AAAA:453.29,AAA:474.89,AA:496.39,A:517.99,BB:561.19,B:604.39}},"200 MED-R":{girls:{B:149.89,BB:139.19,A:128.49,AA:123.09,AAA:117.79,AAAA:112.39},boys:{AAAA:103.69,AAA:108.59,AA:113.59,A:118.49,BB:128.39,B:138.19}},"400 MED-R":{girls:{B:326.89,BB:303.59,A:280.19,AA:268.59,AAA:256.89,AAAA:245.19},boys:{AAAA:224.49,AAA:235.19,AA:245.89,A:256.49,BB:277.89,B:299.29}}},SCM:{"50 FR":{girls:{B:35.99,BB:33.39,A:30.79,AA:29.49,AAA:28.29,AAAA:26.99},boys:{AAAA:24.79,AAA:25.89,AA:27.09,A:28.29,BB:30.69,B:32.99}},"100 FR":{girls:{B:78.49,BB:72.89,A:67.29,AA:64.49,AAA:61.69,AAAA:58.89},boys:{AAAA:53.89,AAA:56.39,AA:58.99,A:61.49,BB:66.69,B:71.79}},"200 FR":{girls:{B:169.79,BB:157.69,A:145.49,AA:139.49,AAA:133.39,AAAA:127.29},boys:{AAAA:118.09,AAA:123.69,AA:129.39,A:134.99,BB:146.19,B:157.49}},"400 FR":{girls:{B:360.69,BB:334.99,A:309.19,AA:296.29,AAA:283.39,AAAA:270.59},boys:{AAAA:253.19,AAA:265.19,AA:277.29,A:289.29,BB:313.39,B:337.49}},"800 FR":{girls:{B:744.69,BB:691.49,A:638.29,AA:611.69,AAA:585.09,AAAA:558.49},boys:{AAAA:523.69,AAA:548.59,AA:573.59,A:598.49,BB:648.39,B:698.19}},"1500 FR":{girls:{B:1414.29,BB:1313.29,A:1212.29,AA:1161.79,AAA:1111.29,AAAA:1060.79},boys:{AAAA:1001.19,AAA:1048.79,AA:1096.49,A:1144.19,BB:1239.49,B:1334.89}},"50 BK":{girls:{B:39.99,BB:37.19,A:34.29,AA:32.89,AAA:31.49,AAAA:29.99},boys:{AAAA:27.89,AAA:29.19,AA:30.59,A:31.89,BB:34.59,B:37.19}},"100 BK":{girls:{B:84.99,BB:78.89,A:72.89,AA:69.79,AAA:66.79,AAAA:63.79},boys:{AAAA:59.09,AAA:61.89,AA:64.69,A:67.49,BB:73.09,B:78.79}},"200 BK":{girls:{B:183.89,BB:170.69,A:157.59,AA:150.99,AAA:144.49,AAAA:137.89},boys:{AAAA:128.19,AAA:134.29,AA:140.39,A:146.49,BB:158.69,B:170.99}},"50 BR":{girls:{B:46.49,BB:43.19,A:39.89,AA:38.19,AAA:36.49,AAAA:34.89},boys:{AAAA:31.99,AAA:33.49,AA:34.99,A:36.49,BB:39.59,B:42.59}},"100 BR":{girls:{B:97.99,BB:90.99,A:83.99,AA:80.49,AAA:76.99,AAAA:73.49},boys:{AAAA:66.79,AAA:69.89,AA:73.09,A:76.29,BB:82.59,B:88.99}},"200 BR":{girls:{B:211.09,BB:195.99,A:180.89,AA:173.39,AAA:165.89,AAAA:158.29},boys:{AAAA:144.89,AAA:151.79,AA:158.69,A:165.59,BB:179.39,B:193.19}},"50 FL":{girls:{B:39.59,BB:36.79,A:33.89,AA:32.49,AAA:31.09,AAAA:29.69},boys:{AAAA:27.49,AAA:28.79,AA:30.09,A:31.39,BB:33.99,B:36.59}},"100 FL":{girls:{B:84.89,BB:78.79,A:72.79,AA:69.69,AAA:66.69,AAAA:63.69},boys:{AAAA:58.39,AAA:61.19,AA:63.99,A:66.79,BB:72.29,B:77.89}},"200 FL":{girls:{B:189.19,BB:175.69,A:162.19,AA:155.39,AAA:148.59,AAAA:141.89},boys:{AAAA:129.99,AAA:136.19,AA:142.39,A:148.49,BB:160.89,B:173.29}},"200 IM":{girls:{B:189.79,BB:176.19,A:162.69,AA:155.89,AAA:149.09,AAAA:142.39},boys:{AAAA:130.89,AAA:137.09,AA:143.39,A:149.59,BB:162.09,B:174.49}},"400 IM":{girls:{B:404.19,BB:375.29,A:346.39,AA:331.99,AAA:317.59,AAAA:303.09},boys:{AAAA:279.89,AAA:293.19,AA:306.49,A:319.89,BB:346.49,B:373.19}},"200 FR-R":{girls:{B:150.59,BB:139.89,A:129.09,AA:123.69,AAA:118.39,AAAA:112.99},boys:{AAAA:103.59,AAA:108.49,AA:113.39,A:118.39,BB:128.19,B:138.09}},"400 FR-R":{girls:{B:328.49,BB:304.99,A:281.59,AA:269.79,AAA:258.09,AAAA:246.39},boys:{AAAA:226.39,AAA:237.19,AA:247.89,A:258.69,BB:280.29,B:301.79}},"800 FR-R":{girls:{B:717.29,BB:666.09,A:614.89,AA:589.19,AAA:563.59,AAAA:537.99},boys:{AAAA:500.89,AAA:524.69,AA:548.59,A:572.39,BB:620.09,B:667.79}},"200 MED-R":{girls:{B:165.59,BB:153.79,A:141.89,AA:135.99,AAA:130.09,AAAA:124.19},boys:{AAAA:114.59,AAA:119.99,AA:125.49,A:130.89,BB:141.79,B:152.69}},"400 MED-R":{girls:{B:361.29,BB:335.49,A:309.69,AA:296.79,AAA:283.89,AAAA:270.99},boys:{AAAA:247.99,AAA:259.89,AA:271.69,A:283.49,BB:307.09,B:330.69}}},LCM:{"50 FR":{girls:{B:37.19,BB:34.59,A:31.89,AA:30.59,AAA:29.29,AAAA:27.89},boys:{AAAA:25.69,AAA:26.89,AA:28.19,A:29.39,BB:31.79,B:34.29}},"100 FR":{girls:{B:81.19,BB:75.39,A:69.59,AA:66.69,AAA:63.79,AAAA:60.89},boys:{AAAA:56.39,AAA:58.99,AA:61.69,A:64.39,BB:69.79,B:75.09}},"200 FR":{girls:{B:175.29,BB:162.79,A:150.29,AA:143.99,AAA:137.79,AAAA:131.49},boys:{AAAA:122.99,AAA:128.89,AA:134.69,A:140.59,BB:152.29,B:163.99}},"400 FR":{girls:{B:368.09,BB:341.79,A:315.49,AA:302.39,AAA:289.19,AAAA:276.09},boys:{AAAA:261.29,AAA:273.79,AA:286.19,A:298.69,BB:323.49,B:348.39}},"800 FR":{girls:{B:765.49,BB:710.79,A:656.09,AA:628.79,AAA:601.49,AAAA:574.09},boys:{AAAA:540.49,AAA:566.19,AA:591.99,A:617.69,BB:669.19,B:720.59}},"1500 FR":{girls:{B:1468.39,BB:1363.49,A:1258.59,AA:1206.19,AAA:1153.69,AAAA:1101.29},boys:{AAAA:1038.49,AAA:1087.89,AA:1137.39,A:1186.79,BB:1285.69,B:1384.59}},"50 BK":{girls:{B:42.59,BB:39.49,A:36.49,AA:34.99,AAA:33.49,AAAA:31.89},boys:{AAAA:29.69,AAA:31.09,AA:32.49,A:33.89,BB:36.69,B:39.49}},"100 BK":{girls:{B:89.69,BB:83.29,A:76.89,AA:73.69,AAA:70.49,AAAA:67.29},boys:{AAAA:62.79,AAA:65.79,AA:68.69,A:71.69,BB:77.69,B:83.69}},"200 BK":{girls:{B:193.29,BB:179.49,A:165.69,AA:158.79,AAA:151.89,AAAA:144.99},boys:{AAAA:136.29,AAA:142.79,AA:149.29,A:155.79,BB:168.79,B:181.79}},"50 BR":{girls:{B:47.79,BB:44.39,A:40.99,AA:39.29,AAA:37.59,AAAA:35.89},boys:{AAAA:32.99,AAA:34.59,AA:36.19,A:37.69,BB:40.89,B:43.99}},"100 BR":{girls:{B:102.39,BB:94.99,A:87.69,AA:84.09,AAA:80.39,AAAA:76.79},boys:{AAAA:70.29,AAA:73.69,AA:76.99,A:80.39,BB:87.09,B:93.79}},"200 BR":{girls:{B:220.29,BB:204.59,A:188.89,AA:180.99,AAA:173.09,AAAA:165.29},boys:{AAAA:152.09,AAA:159.39,AA:166.59,A:173.79,BB:188.29,B:202.79}},"50 FL":{girls:{B:39.99,BB:37.09,A:34.29,AA:32.79,AAA:31.39,AAAA:29.99},boys:{AAAA:27.99,AAA:29.29,AA:30.59,A:31.89,BB:34.59,B:37.29}},"100 FL":{girls:{B:87.19,BB:80.99,A:74.79,AA:71.69,AAA:68.59,AAAA:65.39},boys:{AAAA:60.29,AAA:63.09,AA:65.99,A:68.89,BB:74.59,B:80.29}},"200 FL":{girls:{B:195.69,BB:181.69,A:167.79,AA:160.79,AAA:153.79,AAAA:146.79},boys:{AAAA:134.79,AAA:141.19,AA:147.59,A:153.99,BB:166.79,B:179.69}},"200 IM":{girls:{B:197.19,BB:183.09,A:168.99,AA:161.99,AAA:154.89,AAAA:147.89},boys:{AAAA:137.19,AAA:143.69,AA:150.19,A:156.69,BB:169.79,B:182.89}},"400 IM":{girls:{B:417.99,BB:388.19,A:358.29,AA:343.39,AAA:328.39,AAAA:313.49},boys:{AAAA:292.99,AAA:306.99,AA:320.89,A:334.89,BB:362.79,B:390.69}},"200 FR-R":{girls:{B:155.59,BB:144.39,A:133.29,AA:127.79,AAA:122.19,AAAA:116.69},boys:{AAAA:107.69,AAA:112.79,AA:117.89,A:123.09,BB:133.29,B:143.59}},"400 FR-R":{girls:{B:340.89,BB:316.49,A:292.19,AA:279.99,AAA:267.79,AAAA:255.69},boys:{AAAA:236.49,AAA:247.69,AA:258.99,A:270.19,BB:292.79,B:315.29}},"800 FR-R":{girls:{B:748.29,BB:694.79,A:641.39,AA:614.59,AAA:587.89,AAAA:561.19},boys:{AAAA:522.99,AAA:547.89,AA:572.79,A:597.69,BB:647.49,B:697.29}},"200 MED-R":{girls:{B:173.29,BB:160.89,A:148.49,AA:142.39,AAA:136.19,AAAA:129.99},boys:{AAAA:119.19,AAA:124.89,AA:130.59,A:136.29,BB:147.59,B:158.99}},"400 MED-R":{girls:{B:378.39,BB:351.39,A:324.29,AA:310.79,AAA:297.29,AAAA:283.79},boys:{AAAA:261.79,AAA:274.29,AA:286.79,A:299.19,BB:324.09,B:349.09}}}},"15-16":{SCY:{"50 FR":{girls:{B:31.79,BB:29.49,A:27.29,AA:26.09,AAA:24.99,AAAA:23.89},boys:{AAAA:21.19,AAA:22.19,AA:23.19,A:24.19,BB:26.29,B:28.29}},"100 FR":{girls:{B:68.79,BB:63.79,A:58.89,AA:56.49,AAA:53.99,AAAA:51.59},boys:{AAAA:46.49,AAA:48.79,AA:50.99,A:53.19,BB:57.59,B:61.99}},"200 FR":{girls:{B:148.99,BB:138.39,A:127.69,AA:122.39,AAA:117.09,AAAA:111.79},boys:{AAAA:101.99,AAA:106.89,AA:111.79,A:116.59,BB:126.29,B:135.99}},"500 FR":{girls:{B:400.99,BB:372.39,A:343.69,AA:329.39,AAA:315.09,AAAA:300.79},boys:{AAAA:276.29,AAA:289.49,AA:302.69,A:315.79,BB:342.09,B:368.39}},"1000 FR":{girls:{B:832.89,BB:773.49,A:713.99,AA:684.19,AAA:654.49,AAAA:624.69},boys:{AAAA:578.89,AAA:606.39,AA:633.99,A:661.59,BB:716.69,B:771.79}},"1650 FR":{girls:{B:1395.89,BB:1296.19,A:1196.49,AA:1146.69,AAA:1096.79,AAAA:1046.89},boys:{AAAA:964.99,AAA:1010.89,AA:1056.89,A:1102.79,BB:1194.69,B:1286.59}},"50 BK":{girls:{B:35.29,BB:32.69,A:30.19,AA:28.99,AAA:27.69,AAAA:26.49},boys:{AAAA:23.79,AAA:24.99,AA:26.09,A:27.19,BB:29.49,B:31.79}},"100 BK":{girls:{B:74.69,BB:69.39,A:64.09,AA:61.39,AAA:58.69,AAAA:56.09},boys:{AAAA:50.69,AAA:53.09,AA:55.49,A:57.89,BB:62.69,B:67.49}},"200 BK":{girls:{B:162.19,BB:150.59,A:139.09,AA:133.29,AAA:127.49,AAAA:121.69},boys:{AAAA:110.69,AAA:115.99,AA:121.29,A:126.59,BB:137.09,B:147.59}},"50 BR":{girls:{B:41.09,BB:38.19,A:35.19,AA:33.79,AAA:32.29,AAAA:30.79},boys:{AAAA:27.49,AAA:28.79,AA:30.09,A:31.39,BB:34.09,B:36.69}},"100 BR":{girls:{B:85.89,BB:79.79,A:73.69,AA:70.59,AAA:67.49,AAAA:64.49},boys:{AAAA:57.69,AAA:60.39,AA:63.19,A:65.89,BB:71.39,B:76.89}},"200 BR":{girls:{B:185.99,BB:172.69,A:159.39,AA:152.79,AAA:146.19,AAAA:139.49},boys:{AAAA:125.29,AAA:131.29,AA:137.29,A:143.19,BB:155.19,B:167.09}},"50 FL":{girls:{B:34.69,BB:32.29,A:29.79,AA:28.59,AAA:27.29,AAAA:26.09},boys:{AAAA:23.69,AAA:24.79,AA:25.89,A:27.09,BB:29.29,B:31.59}},"100 FL":{girls:{B:74.39,BB:69.09,A:63.79,AA:61.09,AAA:58.39,AAAA:55.79},boys:{AAAA:50.39,AAA:52.79,AA:55.19,A:57.59,BB:62.39,B:67.19}},"200 FL":{girls:{B:165.79,BB:153.99,A:142.09,AA:136.19,AAA:130.29,AAAA:124.39},boys:{AAAA:112.69,AAA:118.09,AA:123.39,A:128.79,BB:139.49,B:150.19}},"200 IM":{girls:{B:166.19,BB:154.29,A:142.39,AA:136.49,AAA:130.59,AAAA:124.59},boys:{AAAA:113.19,AAA:118.59,AA:123.99,A:129.39,BB:140.19,B:150.89}},"400 IM":{girls:{B:354.99,BB:329.69,A:304.29,AA:291.59,AAA:278.99,AAAA:266.29},boys:{AAAA:241.59,AAA:253.19,AA:264.69,A:276.19,BB:299.19,B:322.19}},"200 FR-R":{girls:{B:135.19,BB:125.59,A:115.89,AA:111.09,AAA:106.29,AAAA:101.39},boys:{AAAA:91.39,AAA:95.69,AA:100.09,A:104.39,BB:113.09,B:121.79}},"400 FR-R":{girls:{B:294.89,BB:273.79,A:252.79,AA:242.29,AAA:231.69,AAAA:221.19},boys:{AAAA:201.59,AAA:211.19,AA:220.79,A:230.39,BB:249.59,B:268.79}},"800 FR-R":{girls:{B:647.79,BB:601.59,A:555.29,AA:532.19,AAA:508.99,AAAA:485.89},boys:{AAAA:447.79,AAA:469.09,AA:490.39,A:511.79,BB:554.39,B:597.09}},"200 MED-R":{girls:{B:148.09,BB:137.49,A:126.99,AA:121.69,AAA:116.39,AAAA:111.09},boys:{AAAA:100.69,AAA:105.49,AA:110.19,A:114.99,BB:124.59,B:134.19}},"400 MED-R":{girls:{B:323.29,BB:300.19,A:277.09,AA:265.59,AAA:253.99,AAAA:242.49},boys:{AAAA:220.69,AAA:231.19,AA:241.69,A:252.19,BB:273.19,B:294.19}}},SCM:{"50 FR":{girls:{B:35.09,BB:32.59,A:30.09,AA:28.89,AAA:27.59,AAAA:26.39},boys:{AAAA:23.39,AAA:24.59,AA:25.69,A:26.79,BB:28.99,B:31.19}},"100 FR":{girls:{B:75.99,BB:70.49,A:65.09,AA:62.39,AAA:59.69,AAAA:56.99},boys:{AAAA:51.39,AAA:53.89,AA:56.29,A:58.79,BB:63.69,B:68.49}},"200 FR":{girls:{B:164.69,BB:152.89,A:141.19,AA:135.29,AAA:129.39,AAAA:123.49},boys:{AAAA:112.79,AAA:118.09,AA:123.49,A:128.89,BB:139.59,B:150.29}},"400 FR":{girls:{B:350.89,BB:325.79,A:300.79,AA:288.19,AAA:275.69,AAAA:263.19},boys:{AAAA:241.79,AAA:253.29,AA:264.79,A:276.29,BB:299.39,B:322.39}},"800 FR":{girls:{B:728.79,BB:676.79,A:624.69,AA:598.69,AAA:572.69,AAAA:546.59},boys:{AAAA:506.49,AAA:530.59,AA:554.79,A:578.89,BB:627.09,B:675.29}},"1500 FR":{girls:{B:1387.49,BB:1288.39,A:1189.29,AA:1139.79,AAA:1090.19,AAAA:1040.69},boys:{AAAA:959.19,AAA:1004.89,AA:1050.49,A:1096.19,BB:1187.59,B:1278.89}},"50 BK":{girls:{B:38.89,BB:36.19,A:33.39,AA:31.99,AAA:30.59,AAAA:29.19},boys:{AAAA:26.29,AAA:27.59,AA:28.79,A:30.09,BB:32.59,B:35.09}},"100 BK":{girls:{B:82.59,BB:76.69,A:70.79,AA:67.79,AAA:64.89,AAAA:61.99},boys:{AAAA:55.99,AAA:58.59,AA:61.29,A:63.99,BB:69.29,B:74.59}},"200 BK":{girls:{B:179.29,BB:166.49,A:153.69,AA:147.29,AAA:140.89,AAAA:134.49},boys:{AAAA:122.39,AAA:128.19,AA:133.99,A:139.79,BB:151.49,B:163.09}},"50 BR":{girls:{B:45.39,BB:42.19,A:38.89,AA:37.29,AAA:35.69,AAAA:34.09},boys:{AAAA:30.39,AAA:31.79,AA:33.29,A:34.69,BB:37.59,B:40.49}},"100 BR":{girls:{B:94.99,BB:88.19,A:81.39,AA:77.99,AAA:74.59,AAAA:71.19},boys:{AAAA:63.69,AAA:66.79,AA:69.79,A:72.79,BB:78.89,B:84.99}},"200 BR":{girls:{B:205.49,BB:190.89,A:176.19,AA:168.79,AAA:161.49,AAAA:154.19},boys:{AAAA:138.49,AAA:145.09,AA:151.69,A:158.29,BB:171.39,B:184.59}},"50 FL":{girls:{B:38.39,BB:35.59,A:32.89,AA:31.49,AAA:30.19,AAAA:28.79},boys:{AAAA:26.19,AAA:27.39,AA:28.59,A:29.89,BB:32.39,B:34.89}},"100 FL":{girls:{B:82.19,BB:76.29,A:70.39,AA:67.49,AAA:64.59,AAAA:61.59},boys:{AAAA:55.69,AAA:58.39,AA:60.99,A:63.69,BB:68.99,B:74.29}},"200 FL":{girls:{B:183.19,BB:170.09,A:157.09,AA:150.49,AAA:143.99,AAAA:137.39},boys:{AAAA:124.49,AAA:130.39,AA:136.39,A:142.29,BB:154.19,B:165.99}},"200 IM":{girls:{B:183.59,BB:170.49,A:157.39,AA:150.79,AAA:144.29,AAAA:137.69},boys:{AAAA:125.09,AAA:131.09,AA:136.99,A:142.99,BB:154.89,B:166.79}},"400 IM":{girls:{B:392.29,BB:364.29,A:336.29,AA:322.29,AAA:308.19,AAAA:294.19},boys:{AAAA:266.99,AAA:279.69,AA:292.39,A:305.19,BB:330.59,B:355.99}},"200 FR-R":{girls:{B:149.39,BB:138.79,A:128.09,AA:122.79,AAA:117.39,AAAA:112.09},boys:{AAAA:100.99,AAA:105.79,AA:110.59,A:115.39,BB:124.99,B:134.59}},"400 FR-R":{girls:{B:325.89,BB:302.59,A:279.29,AA:267.69,AAA:255.99,AAAA:244.39},boys:{AAAA:222.79,AAA:233.39,AA:243.99,A:254.59,BB:275.79,B:297.09}},"800 FR-R":{girls:{B:715.79,BB:664.69,A:613.59,AA:587.99,AAA:562.49,AAAA:536.89},boys:{AAAA:494.79,AAA:518.39,AA:541.89,A:565.49,BB:612.59,B:659.69}},"200 MED-R":{girls:{B:163.59,BB:151.99,A:140.29,AA:134.39,AAA:128.59,AAAA:122.69},boys:{AAAA:111.19,AAA:116.49,AA:121.79,A:127.09,BB:137.69,B:148.29}},"400 MED-R":{girls:{B:357.19,BB:331.69,A:306.19,AA:293.39,AAA:280.69,AAAA:267.89},boys:{AAAA:243.79,AAA:255.39,AA:267.09,A:278.69,BB:301.89,B:325.09}}},LCM:{"50 FR":{girls:{B:36.09,BB:33.49,A:30.89,AA:29.59,AAA:28.29,AAAA:27.09},boys:{AAAA:24.69,AAA:25.89,AA:26.99,A:28.19,BB:30.59,B:32.89}},"100 FR":{girls:{B:78.39,BB:72.79,A:67.19,AA:64.39,AAA:61.59,AAAA:58.79},boys:{AAAA:53.79,AAA:56.39,AA:58.99,A:61.49,BB:66.69,B:71.79}},"200 FR":{girls:{B:169.19,BB:157.09,A:145.09,AA:138.99,AAA:132.99,AAAA:126.89},boys:{AAAA:117.49,AAA:123.09,AA:128.69,A:134.29,BB:145.39,B:156.59}},"400 FR":{girls:{B:355.19,BB:329.89,A:304.49,AA:291.79,AAA:279.09,AAAA:266.39},boys:{AAAA:250.59,AAA:262.49,AA:274.39,A:286.39,BB:310.19,B:334.09}},"800 FR":{girls:{B:737.79,BB:685.09,A:632.39,AA:605.99,AAA:579.69,AAAA:553.29},boys:{AAAA:520.49,AAA:545.29,AA:569.99,A:594.79,BB:644.39,B:693.99}},"1500 FR":{girls:{B:1413.49,BB:1312.49,A:1211.59,AA:1161.09,AAA:1110.59,AAAA:1060.09},boys:{AAAA:996.19,AAA:1043.59,AA:1091.09,A:1138.49,BB:1233.39,B:1328.29}},"50 BK":{girls:{B:41.19,BB:38.29,A:35.29,AA:33.89,AAA:32.39,AAAA:30.89},boys:{AAAA:28.39,AAA:29.69,AA:31.09,A:32.39,BB:35.09,B:37.79}},"100 BK":{girls:{B:86.89,BB:80.69,A:74.49,AA:71.39,AAA:68.29,AAAA:65.19},boys:{AAAA:59.49,AAA:62.39,AA:65.19,A:67.99,BB:73.69,B:79.39}},"200 BK":{girls:{B:186.79,BB:173.39,A:160.09,AA:153.39,AAA:146.79,AAAA:140.09},boys:{AAAA:129.19,AAA:135.39,AA:141.49,A:147.69,BB:159.99,B:172.29}},"50 BR":{girls:{B:46.19,BB:42.89,A:39.59,AA:37.89,AAA:36.29,AAAA:34.59},boys:{AAAA:31.29,AAA:32.79,AA:34.29,A:35.79,BB:38.79,B:41.79}},"100 BR":{girls:{B:98.59,BB:91.59,A:84.49,AA:80.99,AAA:77.49,AAAA:73.99},boys:{AAAA:67.09,AAA:70.29,AA:73.49,A:76.69,BB:83.09,B:89.49}},"200 BR":{girls:{B:212.49,BB:197.29,A:182.09,AA:174.49,AAA:166.99,AAAA:159.39},boys:{AAAA:145.89,AAA:152.79,AA:159.79,A:166.69,BB:180.59,B:194.49}},"50 FL":{girls:{B:38.99,BB:36.19,A:33.49,AA:32.09,AAA:30.69,AAAA:29.29},boys:{AAAA:26.79,AAA:27.99,AA:29.29,A:30.59,BB:33.09,B:35.69}},"100 FL":{girls:{B:84.29,BB:78.29,A:72.29,AA:69.29,AAA:66.29,AAAA:63.29},boys:{AAAA:57.59,AAA:60.29,AA:63.09,A:65.79,BB:71.29,B:76.79}},"200 FL":{girls:{B:187.79,BB:174.39,A:160.99,AA:154.29,AAA:147.59,AAAA:140.89},boys:{AAAA:128.79,AAA:134.89,AA:141.09,A:147.19,BB:159.49,B:171.69}},"200 IM":{girls:{B:191.19,BB:177.49,A:163.89,AA:156.99,AAA:150.19,AAAA:143.39},boys:{AAAA:132.09,AAA:138.39,AA:144.69,A:150.99,BB:163.59,B:176.19}},"400 IM":{girls:{B:404.69,BB:375.79,A:346.89,AA:332.49,AAA:317.99,AAAA:303.59},boys:{AAAA:281.09,AAA:294.39,AA:307.79,A:321.19,BB:347.99,B:374.69}},"200 FR-R":{girls:{B:156.49,BB:145.39,A:134.19,AA:128.59,AAA:122.99,AAAA:117.39},boys:{AAAA:104.89,AAA:109.89,AA:114.89,A:119.89,BB:129.89,B:139.89}},"400 FR-R":{girls:{B:341.09,BB:316.79,A:292.39,AA:280.19,AAA:267.99,AAAA:255.89},boys:{AAAA:229.89,AAA:240.89,AA:251.79,A:262.79,BB:284.69,B:306.49}},"800 FR-R":{girls:{B:745.39,BB:692.19,A:638.89,AA:612.29,AAA:585.69,AAAA:559.09},boys:{AAAA:512.59,AAA:536.99,AA:561.39,A:585.79,BB:634.69,B:683.49}},"200 MED-R":{girls:{B:173.99,BB:161.49,A:149.09,AA:142.89,AAA:136.69,AAAA:130.49},boys:{AAAA:116.29,AAA:121.89,AA:127.39,A:132.89,BB:143.99,B:155.09}},"400 MED-R":{girls:{B:374.39,BB:347.69,A:320.89,AA:307.59,AAA:294.19,AAAA:280.79},boys:{AAAA:255.89,AAA:268.09,AA:280.19,A:292.39,BB:316.79,B:341.19}}}},"17-18":{SCY:{"50 FR":{girls:{B:31.39,BB:29.09,A:26.89,AA:25.79,AAA:24.69,AAAA:23.49},boys:{AAAA:20.69,AAA:21.69,AA:22.59,A:23.59,BB:25.59,B:27.59}},"100 FR":{girls:{B:68.09,BB:63.19,A:58.39,AA:55.89,AAA:53.49,AAAA:51.09},boys:{AAAA:45.29,AAA:47.39,AA:49.59,A:51.69,BB:55.99,B:60.29}},"200 FR":{girls:{B:147.19,BB:136.69,A:126.19,AA:120.89,AAA:115.69,AAAA:110.39},boys:{AAAA:100.19,AAA:104.99,AA:109.69,A:114.49,BB:123.99,B:133.59}},"500 FR":{girls:{B:396.49,BB:368.19,A:339.89,AA:325.69,AAA:311.59,AAAA:297.39},boys:{AAAA:272.39,AAA:285.39,AA:298.39,A:311.39,BB:337.29,B:363.19}},"1000 FR":{girls:{B:826.09,BB:767.09,A:708.09,AA:678.59,AAA:649.09,AAAA:619.59},boys:{AAAA:570.19,AAA:597.29,AA:624.49,A:651.59,BB:705.89,B:760.19}},"1650 FR":{girls:{B:1367.19,BB:1269.59,A:1171.89,AA:1123.09,AAA:1074.29,AAAA:1025.39},boys:{AAAA:951.79,AAA:997.09,AA:1042.39,A:1087.69,BB:1178.39,B:1268.99}},"50 BK":{girls:{B:34.59,BB:32.19,A:29.69,AA:28.39,AAA:27.19,AAAA:25.99},boys:{AAAA:23.09,AAA:24.19,AA:25.29,A:26.39,BB:28.59,B:30.79}},"100 BK":{girls:{B:73.39,BB:68.09,A:62.89,AA:60.29,AAA:57.69,AAAA:54.99},boys:{AAAA:48.89,AAA:51.29,AA:53.59,A:55.89,BB:60.59,B:65.19}},"200 BK":{girls:{B:158.79,BB:147.39,A:136.09,AA:130.39,AAA:124.79,AAAA:119.09},boys:{AAAA:107.89,AAA:113.09,AA:118.19,A:123.29,BB:133.59,B:143.89}},"50 BR":{girls:{B:40.39,BB:37.49,A:34.59,AA:33.19,AAA:31.69,AAAA:30.29},boys:{AAAA:26.59,AAA:27.89,AA:29.09,A:30.39,BB:32.89,B:35.39}},"100 BR":{girls:{B:84.79,BB:78.79,A:72.69,AA:69.69,AAA:66.69,AAAA:63.59},boys:{AAAA:55.99,AAA:58.69,AA:61.39,A:63.99,BB:69.39,B:74.69}},"200 BR":{girls:{B:184.69,BB:171.49,A:158.29,AA:151.69,AAA:145.09,AAAA:138.49},boys:{AAAA:121.69,AAA:127.49,AA:133.29,A:139.09,BB:150.69,B:162.29}},"50 FL":{girls:{B:34.49,BB:31.99,A:29.59,AA:28.29,AAA:27.09,AAAA:25.89},boys:{AAAA:22.99,AAA:23.99,AA:25.09,A:26.19,BB:28.39,B:30.59}},"100 FL":{girls:{B:73.59,BB:68.29,A:63.09,AA:60.39,AAA:57.79,AAAA:55.19},boys:{AAAA:49.09,AAA:51.39,AA:53.69,A:56.09,BB:60.79,B:65.39}},"200 FL":{girls:{B:162.79,BB:151.19,A:139.49,AA:133.69,AAA:127.89,AAAA:122.09},boys:{AAAA:109.79,AAA:115.09,AA:120.29,A:125.49,BB:135.99,B:146.39}},"200 IM":{girls:{B:163.59,BB:151.89,A:140.19,AA:134.39,AAA:128.49,AAAA:122.69},boys:{AAAA:110.59,AAA:115.89,AA:121.09,A:126.39,BB:136.89,B:147.39}},"400 IM":{girls:{B:350.69,BB:325.59,A:300.59,AA:287.99,AAA:275.49,AAAA:262.99},boys:{AAAA:237.99,AAA:249.39,AA:260.69,A:271.99,BB:294.69,B:317.39}},"200 FR-R":{girls:{B:134.69,BB:125.09,A:115.39,AA:110.59,AAA:105.79,AAAA:100.99},boys:{AAAA:86.69,AAA:90.79,AA:94.89,A:99.09,BB:107.29,B:115.59}},"400 FR-R":{girls:{B:289.49,BB:268.79,A:248.19,AA:237.79,AAA:227.49,AAAA:217.19},boys:{AAAA:190.39,AAA:199.39,AA:208.49,A:217.49,BB:235.69,B:253.79}},"800 FR-R":{girls:{B:632.29,BB:587.19,A:541.99,AA:519.39,AAA:496.79,AAAA:474.29},boys:{AAAA:422.99,AAA:443.09,AA:463.19,A:483.39,BB:523.69,B:563.89}},"200 MED-R":{girls:{B:146.89,BB:136.39,A:125.89,AA:120.69,AAA:115.39,AAAA:110.19},boys:{AAAA:94.69,AAA:99.19,AA:103.69,A:108.19,BB:117.19,B:126.29}},"400 MED-R":{girls:{B:320.29,BB:297.39,A:274.49,AA:263.09,AAA:251.69,AAAA:240.19},boys:{AAAA:207.59,AAA:217.49,AA:227.39,A:237.29,BB:257.09,B:276.79}}},SCM:{"50 FR":{girls:{B:34.69,BB:32.19,A:29.69,AA:28.49,AAA:27.19,AAAA:25.99},boys:{AAAA:22.79,AAA:23.89,AA:24.99,A:26.09,BB:28.29,B:30.39}},"100 FR":{girls:{B:75.19,BB:69.89,A:64.49,AA:61.79,AAA:59.09,AAAA:56.39},boys:{AAAA:49.99,AAA:52.39,AA:54.79,A:57.19,BB:61.89,B:66.69}},"200 FR":{girls:{B:162.69,BB:151.09,A:139.39,AA:133.59,AAA:127.79,AAAA:121.99},boys:{AAAA:110.69,AAA:115.99,AA:121.29,A:126.49,BB:137.09,B:147.59}},"400 FR":{girls:{B:346.89,BB:322.19,A:297.39,AA:284.99,AAA:272.59,AAAA:260.19},boys:{AAAA:238.39,AAA:249.69,AA:261.09,A:272.39,BB:295.09,B:317.79}},"800 FR":{girls:{B:722.79,BB:671.19,A:619.59,AA:593.69,AAA:567.89,AAAA:542.09},boys:{AAAA:498.89,AAA:522.69,AA:546.39,A:570.19,BB:617.69,B:665.19}},"1500 FR":{girls:{B:1358.99,BB:1261.99,A:1164.89,AA:1116.39,AAA:1067.79,AAAA:1019.29},boys:{AAAA:946.09,AAA:991.09,AA:1036.19,A:1081.19,BB:1171.29,B:1261.39}},"50 BK":{girls:{B:38.19,BB:35.49,A:32.79,AA:31.39,AAA:30.09,AAAA:28.69},boys:{AAAA:25.49,AAA:26.69,AA:27.89,A:29.09,BB:31.59,B:33.99}},"100 BK":{girls:{B:81.09,BB:75.29,A:69.49,AA:66.59,AAA:63.69,AAAA:60.79},boys:{AAAA:54.09,AAA:56.59,AA:59.19,A:61.79,BB:66.89,B:72.09}},"200 BK":{girls:{B:175.39,BB:162.89,A:150.39,AA:144.09,AAA:137.79,AAAA:131.59},boys:{AAAA:119.29,AAA:124.89,AA:130.59,A:136.29,BB:147.59,B:158.99}},"50 BR":{girls:{B:44.59,BB:41.39,A:38.29,AA:36.69,AAA:35.09,AAAA:33.49},boys:{AAAA:29.39,AAA:30.79,AA:32.19,A:33.59,BB:36.39,B:39.09}},"100 BR":{girls:{B:93.69,BB:87.09,A:80.39,AA:76.99,AAA:73.69,AAAA:70.29},boys:{AAAA:61.89,AAA:64.89,AA:67.79,A:70.69,BB:76.59,B:82.49}},"200 BR":{girls:{B:204.09,BB:189.49,A:174.89,AA:167.59,AAA:160.39,AAAA:153.09},boys:{AAAA:134.49,AAA:140.89,AA:147.29,A:153.69,BB:166.49,B:179.29}},"50 FL":{girls:{B:38.09,BB:35.39,A:32.59,AA:31.29,AAA:29.89,AAAA:28.59},boys:{AAAA:25.39,AAA:26.59,AA:27.79,A:28.99,BB:31.39,B:33.79}},"100 FL":{girls:{B:81.29,BB:75.49,A:69.69,AA:66.79,AAA:63.89,AAAA:60.99},boys:{AAAA:54.19,AAA:56.79,AA:59.39,A:61.99,BB:67.09,B:72.29}},"200 FL":{girls:{B:179.89,BB:166.99,A:154.19,AA:147.69,AAA:141.29,AAAA:134.89},boys:{AAAA:121.39,AAA:127.09,AA:132.89,A:138.69,BB:150.19,B:161.79}},"200 IM":{girls:{B:180.69,BB:167.79,A:154.89,AA:148.49,AAA:141.99,AAAA:135.59},boys:{AAAA:122.19,AAA:127.99,AA:133.79,A:139.59,BB:151.29,B:162.89}},"400 IM":{girls:{B:387.49,BB:359.79,A:332.09,AA:318.29,AAA:304.49,AAAA:290.59},boys:{AAAA:262.99,AAA:275.49,AA:288.09,A:300.59,BB:325.59,B:350.69}},"200 FR-R":{girls:{B:148.79,BB:138.19,A:127.59,AA:122.29,AAA:116.89,AAAA:111.59},boys:{AAAA:95.79,AAA:100.29,AA:104.89,A:109.49,BB:118.59,B:127.69}},"400 FR-R":{girls:{B:319.89,BB:297.09,A:274.19,AA:262.79,AAA:251.39,AAAA:239.89},boys:{AAAA:210.29,AAA:220.39,AA:230.39,A:240.39,BB:260.39,B:280.39}},"800 FR-R":{girls:{B:698.69,BB:648.79,A:598.89,AA:573.99,AAA:548.99,AAAA:523.99},boys:{AAAA:467.39,AAA:489.59,AA:511.89,A:534.09,BB:578.59,B:623.09}},"200 MED-R":{girls:{B:162.29,BB:150.69,A:139.09,AA:133.29,AAA:127.49,AAAA:121.69},boys:{AAAA:104.59,AAA:109.59,AA:114.59,A:119.59,BB:129.49,B:139.49}},"400 MED-R":{girls:{B:353.89,BB:328.59,A:303.39,AA:290.69,AAA:278.09,AAAA:265.39},boys:{AAAA:229.39,AAA:240.39,AA:251.29,A:262.19,BB:284.09,B:305.89}}},LCM:{"50 FR":{girls:{B:35.89,BB:33.29,A:30.69,AA:29.49,AAA:28.19,AAAA:26.89},boys:{AAAA:23.99,AAA:25.09,AA:26.19,A:27.39,BB:29.59,B:31.89}},"100 FR":{girls:{B:77.69,BB:72.19,A:66.59,AA:63.89,AAA:61.09,AAAA:58.29},boys:{AAAA:52.39,AAA:54.89,AA:57.39,A:59.89,BB:64.89,B:69.89}},"200 FR":{girls:{B:167.69,BB:155.69,A:143.69,AA:137.69,AAA:131.69,AAAA:125.79},boys:{AAAA:114.69,AAA:120.09,AA:125.59,A:131.09,BB:141.99,B:152.89}},"400 FR":{girls:{B:353.39,BB:328.19,A:302.99,AA:290.29,AAA:277.69,AAAA:265.09},boys:{AAAA:244.89,AAA:256.49,AA:268.19,A:279.79,BB:303.09,B:326.49}},"800 FR":{girls:{B:730.29,BB:678.19,A:625.99,AA:599.89,AAA:573.79,AAAA:547.79},boys:{AAAA:508.49,AAA:532.69,AA:556.89,A:581.09,BB:629.49,B:677.89}},"1500 FR":{girls:{B:1400.89,BB:1300.79,A:1200.79,AA:1150.79,AAA:1100.69,AAAA:1050.69},boys:{AAAA:979.39,AAA:1025.99,AA:1072.59,A:1119.29,BB:1212.49,B:1305.79}},"50 BK":{girls:{B:40.99,BB:38.09,A:35.09,AA:33.69,AAA:32.19,AAAA:30.79},boys:{AAAA:27.59,AAA:28.99,AA:30.29,A:31.59,BB:34.19,B:36.79}},"100 BK":{girls:{B:85.89,BB:79.79,A:73.69,AA:70.59,AAA:67.49,AAAA:64.49},boys:{AAAA:58.19,AAA:60.89,AA:63.69,A:66.49,BB:71.99,B:77.49}},"200 BK":{girls:{B:185.79,BB:172.49,A:159.19,AA:152.59,AAA:145.99,AAAA:139.29},boys:{AAAA:126.89,AAA:132.89,AA:138.99,A:144.99,BB:157.09,B:169.19}},"50 BR":{girls:{B:45.59,BB:42.29,A:39.09,AA:37.49,AAA:35.79,AAAA:34.19},boys:{AAAA:30.29,AAA:31.69,AA:33.09,A:34.59,BB:37.49,B:40.29}},"100 BR":{girls:{B:97.49,BB:90.49,A:83.59,AA:80.09,AAA:76.59,AAAA:73.09},boys:{AAAA:65.09,AAA:68.19,AA:71.29,A:74.39,BB:80.59,B:86.69}},"200 BR":{girls:{B:209.89,BB:194.99,A:179.99,AA:172.49,AAA:164.99,AAAA:157.49},boys:{AAAA:141.89,AAA:148.59,AA:155.39,A:162.19,BB:175.69,B:189.19}},"50 FL":{girls:{B:38.39,BB:35.59,A:32.89,AA:31.49,AAA:30.19,AAAA:28.79},boys:{AAAA:25.99,AAA:27.19,AA:28.39,A:29.69,BB:32.09,B:34.59}},"100 FL":{girls:{B:83.59,BB:77.69,A:71.69,AA:68.69,AAA:65.69,AAAA:62.69},boys:{AAAA:55.99,AAA:58.69,AA:61.29,A:63.99,BB:69.29,B:74.59}},"200 FL":{girls:{B:184.49,BB:171.39,A:158.19,AA:151.59,AAA:144.99,AAAA:138.39},boys:{AAAA:125.29,AAA:131.29,AA:137.19,A:143.19,BB:155.09,B:166.99}},"200 IM":{girls:{B:189.29,BB:175.79,A:162.29,AA:155.49,AAA:148.79,AAAA:141.99},boys:{AAAA:128.99,AAA:135.09,AA:141.19,A:147.39,BB:159.59,B:171.89}},"400 IM":{girls:{B:400.29,BB:371.69,A:343.09,AA:328.79,AAA:314.49,AAAA:300.29},boys:{AAAA:275.69,AAA:288.79,AA:301.89,A:315.09,BB:341.29,B:367.59}},"200 FR-R":{girls:{B:154.19,BB:143.19,A:132.19,AA:126.69,AAA:121.19,AAAA:115.59},boys:{AAAA:100.99,AAA:105.79,AA:110.59,A:115.39,BB:124.99,B:134.59}},"400 FR-R":{girls:{B:334.19,BB:310.29,A:286.39,AA:274.49,AAA:262.59,AAAA:250.59},boys:{AAAA:220.49,AAA:230.99,AA:241.49,A:251.99,BB:272.99,B:293.99}},"800 FR-R":{girls:{B:735.79,BB:683.29,A:630.69,AA:604.39,AAA:578.19,AAAA:551.89},boys:{AAAA:490.89,AAA:514.19,AA:537.59,A:560.99,BB:607.69,B:654.49}},"200 MED-R":{girls:{B:171.39,BB:159.09,A:146.89,AA:140.79,AAA:134.69,AAAA:128.49},boys:{AAAA:111.39,AAA:116.69,AA:121.99,A:127.29,BB:137.89,B:148.49}},"400 MED-R":{girls:{B:370.89,BB:344.39,A:317.89,AA:304.69,AAA:291.39,AAAA:278.19},boys:{AAAA:242.89,AAA:254.49,AA:266.09,A:277.59,BB:300.79,B:323.89}}}}},Lo={B:"#6B7280",BB:"#2563EB",A:"#059669",AA:"#D97706",AAA:"#DC2626",AAAA:"#B45309"};function En(e){return e==null||!Number.isFinite(e)?null:e<=10?"10 & under":e<=12?"11-12":e<=14?"13-14":e<=16?"15-16":"17-18"}function Mo(e){if(!e)return null;const t=String(e).trim().toLowerCase();return t.startsWith("f")?"female":t.startsWith("m")?"male":null}function Ro(e){const t=/^(\d+)\s+([A-Za-z]{2,4})/.exec(String(e||"").trim());if(!t)return null;const s=t[2].toUpperCase();return["FR","BK","BR","FL","IM"].includes(s)?{distance:+t[1],stroke:s}:null}function To({age:e,course:t,eventKey:s,gender:n}={}){var c;const a=En(e),i=Mo(n),r=Ro(s),d=String(t||"").toUpperCase();if(!a||!i||!r||!zs[a])return null;const l=zs[a][d];if(!l)return null;const A=i==="female"?"girls":"boys",m=(c=l[`${r.distance} ${r.stroke}`])==null?void 0:c[A];return m?Object.keys(m).map(u=>({level:u,thresholdSeconds:m[u],color:Lo[u]})).sort((u,y)=>u.thresholdSeconds-y.thresholdSeconds):null}const et=["Claude Moore Recreation Center","Dulles South Recreation Center","Tysons — OneLife Fitness Tysons"],Cn=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],Oe=[{id:"Fall 2026",label:"Fall 2026",start:"2026-09-08",end:"2026-11-09"},{id:"Winter 2026-27",label:"Winter 2026–27",start:"2026-11-10",end:"2027-02-17"},{id:"Spring 2027",label:"Spring 2027",start:"2027-02-18",end:"2027-06-11"},{id:"Summer 2027",label:"Summer 2027",start:"2027-06-12",end:"2027-09-06"}];function yt(e){var t;return((t=Oe.find(s=>s.id===e))==null?void 0:t.label)||e}function jo(e=new Date){const t=e.toISOString().slice(0,10);for(const s of Oe)if(t>=s.start&&t<=s.end)return s.id;return t<Oe[0].start?Oe[0].id:Oe[Oe.length-1].id}function In(e){return!e||e.authError?!1:!Number.isInteger(e.httpStatus)}function Oo(e){return typeof e=="string"&&e.includes("/GetBestTimesForMember/")}function zo(e){return In(e)&&Oo(e==null?void 0:e.endpoint)}const kn=3;function Uo(e,t){const s=zo(t)?e+1:0;return{count:s,abort:s>=kn}}function Ve(e){return String(e??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9\s]/g,"").replace(/\s+/g," ").trim()}function Ho(e){let t=Number(e)+1,s="";for(;t>0;){const n=(t-1)%26;s=String.fromCharCode(65+n)+s,t=Math.floor((t-1)/26)}return s}function Zt(e){if(e==null)return NaN;if(typeof e=="number")return Number.isFinite(e)?e:NaN;let t=String(e).trim();if(!t)return NaN;let s=!1;if(/^\(.*\)$/.test(t)&&(s=!0,t=t.slice(1,-1)),t=t.replace(/[$,\s]/g,""),!/^[+-]?\d*\.?\d+$/.test(t))return NaN;const n=Number(t);return s?-n:n}function qo(e){for(const t of[1,2,3]){const s=e==null?void 0:e[`deposit${t}Amount`],n=Number(s);if(s==null||s===""||!Number.isFinite(n)||n===0)return`deposit${t}Amount`}return null}function Nn(e,t,s){const n=Ve(s);return n&&(e||[]).find(a=>a&&a.season===t&&Ve(a.swimmerName)===n)||null}const Fn=e=>!e||e.every(t=>t==null||String(t).trim()===""),fe=(e,t)=>t>=0&&e&&t<e.length?e[t]:null,Dn=e=>/name|swimmer/.test(e),Po=e=>/balance|carry[\s-]*over|credit/.test(e);function Ko(e){const t=String(e??"").toLowerCase().replace(/\s+/g," ").trim();if(!t)return null;const s=/depo|(^|[^a-z])d\s*#?[123](?![0-9])/.test(t),n=/date|日期/.test(t),a=/amount|amt|paid|payment|金额/.test(t),i=t.match(/(?:^|\D)([123])(?:\D|$)/),r=i?i[1]:null;return n?s&&r?{field:`deposit${r}Date`}:s?{simpleDate:!0}:null:s||a?r&&(s||a)?{field:`deposit${r}Amount`}:s?{simpleAmount:!0}:null:null}const Ln=e=>e.filter(t=>t&&t.index>=0).map(t=>({...t,letter:Ho(t.index)}));function Yo(e){if(!Array.isArray(e)||e.length<2)return{valid:[],errors:[],fatal:"no-data-rows",headerRow:-1,columns:[]};let t=-1,s=-1,n=-1;for(let r=0;r<Math.min(10,e.length);r++){const d=e[r];if(!d)continue;let l=-1,A=-1;for(let m=0;m<d.length;m++){const c=String(d[m]??"").toLowerCase().trim();c&&(l<0&&Dn(c)&&(l=m),A<0&&Po(c)&&(A=m))}if(l>=0&&A>=0){t=r,s=l,n=A;break}}if(t<0)return{valid:[],errors:[],fatal:"need-name-balance",headerRow:-1,columns:[]};const a=[],i=[];for(let r=t+1;r<e.length;r++){const d=e[r];if(Fn(d))continue;const l=String(fe(d,s)??"").trim();if(!l){i.push({rowNum:r+1,reason:"Missing name."});continue}const A=Zt(fe(d,n));if(!Number.isFinite(A)){i.push({rowNum:r+1,reason:`Invalid balance for "${l}": ${fe(d,n)??"(empty)"}`});continue}a.push({swimmerName:l,balance:A})}return{valid:a,errors:i,fatal:null,headerRow:t,columns:Ln([{field:"name",label:String(fe(e[t],s)??"name").trim(),index:s},{field:"balance",label:String(fe(e[t],n)??"balance").trim(),index:n}])}}function Vo(e,t,s){return(e||[]).map(n=>{const a=Nn(t,s,n.swimmerName);return{swimmerName:n.swimmerName,balance:n.balance,existingId:a?a.id:null,willCreate:!a,previousBalance:a&&Number.isFinite(Number(a.balance))?Number(a.balance):null}})}function Go(e){return(e||[]).map(t=>({swimmerName:t.swimmerName,existingId:t.existingId,willCreate:!t.existingId,fields:{balance:Number(t.balance)||0}}))}function Wo(e){const t=c=>({valid:[],errors:[],fatal:c,mode:null,headerRow:-1,columns:[]});if(!Array.isArray(e)||e.length<2)return t("no-data-rows");let s=-1,n=-1,a=null,i={},r={amount:-1,date:-1};for(let c=0;c<Math.min(10,e.length);c++){const u=e[c];if(!u)continue;let y=-1;const p={};let g=-1,f=-1;for(let $=0;$<u.length;$++){const x=String(u[$]??"").toLowerCase().replace(/\s+/g," ").trim();if(!x)continue;if(y<0&&Dn(x)){y=$;continue}const D=Ko(x);D&&(D.field?p[D.field]=$:D.simpleAmount&&g<0?g=$:D.simpleDate&&f<0&&(f=$))}const B=Object.keys(p).length>0;if(y>=0&&(B||g>=0)){s=c,n=y,i=p,r={amount:g,date:f},a=B?"detail":"simple";break}}if(s<0)return t("need-name-amount");const d=e[s],l=Ln([{field:"name",label:String(fe(d,n)??"name").trim(),index:n},...Object.entries(i).map(([c,u])=>({field:c,label:String(fe(d,u)??c).trim(),index:u})),...a==="simple"?[{field:"amount",label:String(fe(d,r.amount)??"amount").trim(),index:r.amount},{field:"date",label:Xo(d,r.date),index:r.date}]:[]]),A=[],m=[];for(let c=s+1;c<e.length;c++){const u=e[c];if(Fn(u))continue;const y=String(fe(u,n)??"").trim();if(!y){m.push({rowNum:c+1,reason:"Missing name."});continue}if(a==="simple"){const B=Zt(fe(u,r.amount));if(!Number.isFinite(B)){m.push({rowNum:c+1,reason:`Invalid deposit amount for "${y}": ${fe(u,r.amount)??"(empty)"}`});continue}const $=r.date>=0?fe(u,r.date):null;A.push({swimmerName:y,amount:B,date:$?String($).trim():null});continue}const p={swimmerName:y};let g=!1,f=null;for(const[B,$]of Object.entries(i)){const x=fe(u,$);if(B.endsWith("Amount")){if(x==null||String(x).trim()==="")continue;const D=Zt(x);if(!Number.isFinite(D)){f=`Invalid ${B} for "${y}": ${x}`;break}p[B]=D,g=!0}else{if(x==null||String(x).trim()==="")continue;p[B]=String(x).trim()}}if(f){m.push({rowNum:c+1,reason:f});continue}if(!g){m.push({rowNum:c+1,reason:`No deposit amount for "${y}" — row skipped.`});continue}A.push(p)}return{valid:A,errors:m,fatal:null,mode:a,headerRow:s,columns:l}}function Xo(e,t){return(t>=0?String(fe(e,t)??"").trim():"")||"date"}function Zo(e,t,s){const n=[],a=[],i=[];if(!e||!e.valid)return{rows:n,skipped:a,slotErrors:i};for(const r of e.valid){const d=Nn(t,s,r.swimmerName),l=d?d.id:null;if(e.mode!=="simple"){n.push({...r,existingId:l,willCreate:!d});continue}const A=Number(r.amount),m=[1,2,3].find(u=>Number(d==null?void 0:d[`deposit${u}Amount`])===A&&A!==0);if(m){a.push({swimmerName:r.swimmerName,reason:`${r.swimmerName}: $${A.toFixed(2)} is already recorded as Deposit ${m} — skipped to avoid double-counting.`});continue}const c=d?qo(d):"deposit1Amount";if(!c){i.push({swimmerName:r.swimmerName,reason:`${r.swimmerName}: all three deposit slots are already filled — edit the record instead.`});continue}n.push({swimmerName:r.swimmerName,amount:A,date:r.date||null,targetSlot:c,targetLabel:`Deposit ${c.replace(/\D/g,"")}`,existingId:l,willCreate:!d})}return{rows:n,skipped:a,slotErrors:i}}function Jo(e,t){return(t||[]).map(s=>{if(e&&e.mode==="simple"){const a=String(s.targetSlot).replace(/\D/g,""),i={[s.targetSlot]:Number(s.amount)||0},r=`deposit${a}Date`;return s.date&&(i[r]=s.date),{swimmerName:s.swimmerName,existingId:s.existingId,willCreate:!s.existingId,fields:i}}const n={};for(const a of Object.keys(s))/^deposit[123](Amount|Date)$/.test(a)&&(n[a]=s[a]);return{swimmerName:s.swimmerName,existingId:s.existingId,willCreate:!s.existingId,fields:n}})}function ot(e){return String(e??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim()}function Jt(e){const t=ot(e==null?void 0:e.lastName),s=ot(e==null?void 0:e.firstName);return t||s?`${t}\0${s}`:ot(e==null?void 0:e.name)}function Qo(e,t){const s=Jt(e),n=Jt(t);return s<n?-1:s>n?1:0}function fs(e){return[...e||[]].sort(Qo)}function er(e){const t=Ve(e).split(" ").filter(Boolean);if(t.length===0)return"";const s=t[t.length-1],n=t.slice(0,-1).join(" ");return`${s}\0${n}`}function Mn(e){const t=new Map;for(const s of e||[])for(const n of(s==null?void 0:s.swimmers)||[]){if(!n||n.deleted)continue;const a={firstName:n.firstName||"",lastName:n.lastName||""};if(!a.firstName&&!a.lastName)continue;const i=[Ve(`${a.firstName} ${a.lastName}`),Ve([a.firstName,n.middleName,a.lastName].filter(Boolean).join(" "))];for(const r of i)r&&!t.has(r)&&t.set(r,a)}return t}function Us(e,t){const s=t==null?void 0:t.get(Ve(e));return s?Jt(s):er(e)}function Rn(e,t,s){const n=Us(e,s),a=Us(t,s);return n<a?-1:n>a?1:0}const Ct="volunteerHours";function Tt(e){return Math.round((Number(e)||0)*100)/100}function tr(e,t){return`${e}_${t}`}function Ge(e){if(e===""||e==null)return null;const t=Number(e);return!Number.isFinite(t)||t<0?null:Tt(t)}function It(e){return e?[e.firstName,e.lastName].filter(Boolean).join(" ").trim():""}function hs(e){const t=[It(e==null?void 0:e.parent),It(e==null?void 0:e.spouse)].filter(Boolean);return[...new Set(t)].join(" & ")}function Tn(e){var n,a,i;const t=ot((n=e==null?void 0:e.parent)==null?void 0:n.lastName)||ot((a=e==null?void 0:e.spouse)==null?void 0:a.lastName),s=ot((i=e==null?void 0:e.parent)==null?void 0:i.firstName);return`${t}\0${s}`}function ys(e){return((e==null?void 0:e.swimmers)||[]).filter(t=>t&&!t.deleted)}function gs(e){return e?[e.firstName,e.lastName].filter(Boolean).join(" ").trim()||String(e.name||"").trim():""}function jn(e){var t,s;return[...new Set([(t=e==null?void 0:e.parent)==null?void 0:t.email,(s=e==null?void 0:e.spouse)==null?void 0:s.email,...(e==null?void 0:e.parentEmails)||[]].map(n=>String(n||"").toLowerCase().trim()).filter(Boolean))]}function sr(e){return[hs(e),It(e==null?void 0:e.parent),It(e==null?void 0:e.spouse),...ys(e).map(gs),...jn(e)].join(" ").toLowerCase()}function nr(e){return(e||[]).filter(t=>t&&t.id).map(t=>{const s=ys(t).map(gs).filter(Boolean);return{familyId:t.id,label:hs(t),sortKey:Tn(t),kids:s,kidCount:s.length,emails:jn(t),search:sr(t)}}).sort((t,s)=>t.sortKey.localeCompare(s.sortKey)||t.label.localeCompare(s.label))}function On({meets:e,registrations:t,hours:s,season:n,meetSeasonOf:a}){const i=new Map((e||[]).map(c=>[c.id,c])),r=new Map((t||[]).map(c=>[c.id,c])),d=typeof a=="function"?a:c=>(c==null?void 0:c.season)||null,l=new Map;for(const c of s||[]){if(!c||!c.familyId)continue;const u=c.meetId?i.get(c.meetId):null;if((u&&d(u)||c.season)!==n)continue;l.has(c.familyId)||l.set(c.familyId,{totalHours:0,meets:[],label:c.familyLabel||""});const p=l.get(c.familyId),g=Ge(c.hours)??0;p.totalHours+=g,p.meets.push({meetId:c.meetId||"",meetName:u&&u.name||c.meetName||"Unnamed Meet",startDate:u&&(u.startDate||u.date)||c.startDate||"",hours:g,note:c.note||""})}const A=new Set([...(t||[]).map(c=>c.id),...l.keys()]),m=[];for(const c of A){const u=r.get(c),y=l.get(c)||{totalHours:0,meets:[],label:""};if(!u&&y.meets.length===0)continue;const p=u?ys(u).map(gs).filter(Boolean):[],g=y.meets.slice().sort((f,B)=>String(f.startDate).localeCompare(String(B.startDate))||f.meetName.localeCompare(B.meetName));m.push({familyId:c,label:u&&hs(u)||y.label||"—",sortKey:u?Tn(u):"",kidCount:p.length,kids:p,totalHours:Tt(y.totalHours),meetCount:new Set(g.map(f=>f.meetId)).size,meets:g})}return m.sort((c,u)=>(c.sortKey||c.label).localeCompare(u.sortKey||u.label)||c.label.localeCompare(u.label)),m}function ar({registrations:e,hours:t,meetId:s}){const n=new Map;for(const r of t||[])r&&r.meetId===s&&r.familyId&&n.set(r.familyId,r);const a=nr(e),i=new Set(a.map(r=>r.familyId));for(const[r,d]of n)i.has(r)||a.push({familyId:r,label:d.familyLabel||"—",sortKey:"",kids:[],kidCount:0,emails:[],search:String(d.familyLabel||"").toLowerCase()});return a.map(r=>{const d=n.get(r.familyId);return{...r,hours:d?Ge(d.hours):null,note:d&&d.note||"",updatedBy:d&&(d.updatedBy||d.updatedByEmail)||"",updatedAt:d&&d.updatedAt||null,hasRecord:!!d&&Ge(d.hours)!=null}}).sort((r,d)=>r.sortKey.localeCompare(d.sortKey)||r.label.localeCompare(d.label))}function or(e,t){return Tt((e||[]).filter(s=>s&&s.meetId===t&&s.familyId).reduce((s,n)=>s+(Ge(n.hours)??0),0))}function rr(e){const t=e||[],s=t.filter(n=>n.totalHours>0);return{familyCount:t.length,familiesWithHours:s.length,familiesWithoutHours:t.length-s.length,totalHours:Tt(t.reduce((n,a)=>n+a.totalHours,0)),meetCount:new Set(t.flatMap(n=>n.meets.map(a=>a.meetId)).filter(Boolean)).size}}function Hs(e){return`"${String(e??"").replace(/"/g,'""')}"`}function zn(e,t){return[e.map(Hs).join(","),...t.map(s=>s.map(Hs).join(","))].join(`
`)}function ir(e){return zn(["Parents","Kids","Kid Names","Meets","Total Hours"],(e||[]).map(t=>[t.label,t.kidCount,t.kids.join("; "),t.meetCount,t.totalHours]))}function lr(e){const t=[];for(const s of e||[])for(const n of s.meets)t.push([s.label,n.meetName,n.startDate||"",n.hours,n.note||"",s.totalHours]);return zn(["Parents","Meet","Date","Hours","Note","Family Season Total"],t)}function U(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function ze(e){const t=/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec(String(e||"").trim());if(!t)return null;let s=parseInt(t[1],10);const n=parseInt(t[2],10),a=(t[3]||"").toUpperCase();return a==="PM"&&s!==12&&(s+=12),a==="AM"&&s===12&&(s=0),s*60+n}function qs(e){const t=Cn.indexOf(e);return t===-1?99:t}function gt(e){return e.slice().sort((t,s)=>{const n=qs(t.day)-qs(s.day);if(n)return n;const a=ze(t.startTime)||0,i=ze(s.startTime)||0;return a!==i?a-i:String(t.startTime||"").localeCompare(String(s.startTime||""))})}function Un(e){const t=new Set((e.sessionSlots||[]).map(s=>s.period).filter(Boolean));return e.currentPeriod&&t.add(e.currentPeriod),Array.from(t).sort((s,n)=>{const a=Oe.findIndex(r=>r.id===s),i=Oe.findIndex(r=>r.id===n);return a===-1&&i===-1?s.localeCompare(n):a===-1?1:i===-1?-1:a-i})}function dr(e){const t=new Map;for(const n of e)t.has(n.location)||t.set(n.location,[]),t.get(n.location).push(n);const s=new Set(et);return Array.from(t.keys()).sort((n,a)=>{const i=s.has(n)?et.indexOf(n):et.length,r=s.has(a)?et.indexOf(a):et.length;return i!==r?i-r:n.localeCompare(a)}).map(n=>({location:n,slots:gt(t.get(n))}))}function At(e){return((e.day||"")+" "+(e.startTime||"")+" – "+(e.endTime||"")).trim()}function Ar(e,t,s){const n=(e.allRegistrations||[]).find(i=>i.id===t),a=n&&n.swimmers&&n.swimmers[s];if(a&&!a.deleted){const i=n.parent||{};return{name:[a.firstName,a.lastName].filter(Boolean).join(" ")||"Unknown",parentName:[i.firstName,i.lastName].filter(Boolean).join(" ")||"—"}}return{name:"Unknown",parentName:"—"}}function cr(e,t,s,n){return(e.enrollments||[]).find(a=>a.slotId===t&&a.regId===s&&Number(a.swimmerIndex)===Number(n))}function Hn(e,t){const s=(e.enrollments||[]).filter(n=>n.slotId===t.id);return{confirmed:s.filter(n=>n.status==="confirmed"),undecided:s.filter(n=>n.status==="undecided")}}function mr(e,t){const s=Hn(e,t),n=d=>d.map(l=>Ar(e,l.regId,l.swimmerIndex).name).filter(l=>l&&l!=="Unknown").sort((l,A)=>l.localeCompare(A)),a=n(s.confirmed),i=n(s.undecided);if(a.length===0&&i.length===0)return'<p style="margin:0;color:var(--text-muted);font-size:0.85rem;">'+o("sched2_no_signups")+"</p>";let r="";return a.length>0&&(r+='<div style="margin:2px 0;"><span style="font-weight:600;">'+o("sched2_confirmed")+":</span> "+U(a.join(", "))+"</div>"),i.length>0&&(r+='<div style="margin:2px 0;color:#d97706;"><span style="font-weight:600;">'+o("sched2_undecided")+":</span> "+U(i.join(", "))+"</div>"),r}function ur(e){return[e.firstName,e.lastName].filter(Boolean).join(" ")||"Unknown"}function pr(e,t,s,n){const a=ur(t),i=(e.enrollments||[]).filter(u=>u.regId===e.familyDataId&&Number(u.swimmerIndex)===Number(s)).map(u=>({e:u,slot:n.get(u.slotId)})).filter(u=>u.slot&&u.slot.period===e.currentPeriod),r=gt(i.filter(u=>u.e.status==="confirmed").map(u=>u.slot)),d=gt(i.filter(u=>u.e.status!=="confirmed").map(u=>u.slot)),l=o("contact_email_address"),A=l?'<a href="mailto:'+U(l)+'" style="color:var(--color-primary,#2563eb);">'+o("sched2_family_contact")+"</a>":"",m=(u,y)=>{const g=y==="confirmed"?'<span style="color:#16a34a;font-weight:600;font-size:0.8rem;white-space:nowrap;">✓ '+o("sched2_confirmed")+"</span>":'<span style="color:#d97706;font-weight:600;font-size:0.8rem;white-space:nowrap;">? '+o("sched2_undecided")+"</span>",f=u.groupLabel?'<span style="display:inline-block;margin-left:8px;background:var(--bg-secondary);color:var(--text-muted);border-radius:6px;padding:1px 8px;font-size:0.75rem;font-weight:500;">'+U(u.groupLabel)+"</span>":"";return`
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:8px 0;border-bottom:1px dashed var(--border-color);flex-wrap:wrap;">
        <div style="min-width:0;">
          <strong style="white-space:nowrap;">${U(At(u))}</strong>${f}
          <div style="color:var(--text-muted);font-size:0.85rem;margin-top:2px;">${U(u.location||"")}</div>
        </div>
        ${g}
      </div>`};let c;return r.length===0&&d.length===0?c=`<p class="dash-empty" style="padding:1.2rem 0;">${o("sched2_family_not_decided",{name:U(a)})}</p>`:(c=r.map(u=>m(u,"confirmed")).join(""),d.length>0&&(c+=d.map(u=>m(u,"undecided")).join(""),c+='<p style="margin:0.7rem 0 0;color:#d97706;font-size:0.85rem;">⚠️ '+o("sched2_family_undecided_note")+(A?" "+A:"")+"</p>")),`
    <div class="dash-panel" style="margin-bottom:1.5rem;">
      <div class="dash-panel-title" style="border-bottom:1px solid var(--border-color);padding-bottom:0.6rem;">🏊 ${U(a)}</div>
      <div class="dash-panel-body">${c}</div>
    </div>`}function fr(e){const t=yt(e.currentPeriod),s=new Map((e.sessionSlots||[]).map(l=>[l.id,l])),n=`
    <div class="dash-section-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
      <div>
        <h2 style="font-size:1.5rem;font-weight:600;color:var(--text-primary);margin:0;">${o("dash_schedule_weekly")}</h2>
        <p style="margin:4px 0 0;color:var(--text-muted);font-size:0.9rem;">${U(t)}</p>
      </div>
    </div>`,a=e.familyData;if(!e.familyDataId||!a||!Array.isArray(a.swimmers))return n+`
      <div class="dash-panel" style="text-align:center;padding:2.5rem 2rem;">
        <p class="dash-empty" style="padding:0;margin-bottom:0.5rem;">${o("sched2_family_no_reg")}</p>
      </div>`;const r=a.swimmers.map((l,A)=>({sw:l,index:A})).filter(l=>!l.sw.deleted);return r.length===0?n+`
      <div class="dash-panel" style="text-align:center;padding:2.5rem 2rem;">
        <p class="dash-empty" style="padding:0;margin-bottom:0.5rem;">${o("sched2_family_no_children")}</p>
      </div>`:(e.sessionSlots||[]).some(l=>l.period===e.currentPeriod)?n+r.map(({sw:l,index:A})=>pr(e,l,A,s)).join(""):n+'<p class="dash-empty">'+o("sched2_no_slots")+"</p>"}function hr(e){if(e.viewMode==="athlete")return $r(e);const t=e.dbRole==="admin",s=gt((e.sessionSlots||[]).filter(r=>r.period===e.currentPeriod)),n=dr(s),a=Un(e),i=yt(e.currentPeriod);return`
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
            ${a.map(r=>'<option value="'+U(r)+'"'+(r===e.currentPeriod?" selected":"")+">"+U(yt(r))+"</option>").join("")}
          </select>
        </div>
        ${t?'<button class="btn btn-primary btn-sm" id="add-slot-btn">'+o("sched2_add_slot")+"</button>":""}
      </div>
    </div>

    ${t?`
      <div id="add-slot-form" class="dash-panel" style="display:none;margin-bottom:2rem;padding:1.5rem;">
        <h3 style="margin:0 0 1rem;font-weight:600;">${o("sched2_new_slot_title")} — ${U(i)}</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:0.9rem;">
          <select id="slot-location" class="form-input">
            ${et.map(r=>"<option>"+U(r)+"</option>").join("")}
          </select>
          <select id="slot-day" class="form-input">
            ${Cn.map(r=>"<option>"+U(r)+"</option>").join("")}
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

    ${s.length===0?'<p class="dash-empty">'+o("sched2_no_slots")+"</p>":n.map(r=>`
          <div class="dash-panel" style="margin-bottom:1.5rem;">
            <div class="dash-panel-title" style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border-color);padding-bottom:0.6rem;">
              <h3 style="margin:0;font-size:1.05rem;font-weight:600;">${U(r.location)}</h3>
              <span class="badge" style="background:var(--bg-secondary);color:var(--text-muted);">${r.slots.length} ${r.slots.length===1?"session":"sessions"}</span>
            </div>
            <div class="dash-panel-body">
              ${r.slots.map(d=>yr(e,d,t)).join("")}
            </div>
          </div>
        `).join("")}
  `}function yr(e,t,s){const n=Hn(e,t),a=n.confirmed.length,i=n.undecided.length,r=t.capacity!=null&&t.capacity!=="",d=r?Number(t.capacity):null,l=d==null?null:Math.max(0,d-a),A=r?"<strong>"+a+" / "+d+"</strong>"+(l===0?' <span style="color:#dc2626;font-size:0.8rem;">'+o("sched2_full")+"</span>":' <span style="color:#16a34a;font-size:0.8rem;">'+o("sched2_open",{open:String(l)})+"</span>"):"<strong>"+a+'</strong> <span style="color:var(--text-muted);font-size:0.8rem;">('+o("sched2_no_capacity")+")</span>",m=o("sched2_confirmed")+": "+A+(i>0?" · "+o("sched2_undecided")+': <span style="color:#d97706;">'+i+"</span>":""),c=s?'<div style="display:flex;align-items:center;gap:0.6rem;flex-wrap:wrap;"><label style="font-size:0.8rem;color:var(--text-muted);white-space:nowrap;">'+o("sched2_capacity")+'<input type="number" min="0" class="slot-capacity-input" data-id="'+t.id+'" value="'+(r?d:"")+'" title="'+o("sched2_capacity_hint")+'" style="width:70px;margin-left:6px;padding:3px 6px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-primary);color:var(--text-primary);" /></label><button class="btn btn-primary btn-sm slot-manage-btn" data-id="'+t.id+'">'+o("sched2_manage_roster")+'</button><button class="btn btn-outline btn-sm slot-delete-btn" data-id="'+t.id+'" style="color:#dc2626;">'+o("sched2_delete_slot")+"</button></div>":"",u=t.groupLabel?'<span style="display:inline-block;margin-left:8px;background:var(--bg-secondary);color:var(--text-muted);border-radius:6px;padding:1px 8px;font-size:0.75rem;font-weight:500;">'+U(t.groupLabel)+"</span>":"";return'<div class="dash-schedule-item" style="padding:0.9rem 1rem;border:1px solid var(--border-color);border-radius:10px;margin-bottom:0.8rem;background:var(--bg-card);"><div style="display:flex;justify-content:space-between;align-items:center;gap:0.75rem;flex-wrap:wrap;"><div><div style="font-weight:600;">'+U(At(t))+u+'</div><div style="margin-top:4px;color:var(--text-muted);font-size:0.85rem;">'+m+"</div></div>"+c+'</div><div style="display:flex;justify-content:flex-end;margin-top:6px;"><button type="button" class="slot-names-toggle" data-id="'+t.id+'" style="background:none;border:none;cursor:pointer;color:#2563eb;font-size:0.82rem;padding:2px 6px;">▸ '+o("sched2_show_names")+'</button></div><div class="slot-names" id="slot-names-'+t.id+'" style="display:none;margin-top:4px;padding-top:6px;border-top:1px dashed var(--border-color);font-size:0.85rem;">'+mr(e,t)+"</div></div>"}const gr={"Claude Moore Recreation Center":"CM","Dulles South Recreation Center":"DS","Tysons — OneLife Fitness Tysons":"TY"};function br(e){return gr[e]||String(e||"").slice(0,2).toUpperCase()}function Br(e){const t=/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec(String(e||"").trim());if(!t)return e||"";let s=parseInt(t[1],10);const n=parseInt(t[2],10),a=(t[3]||"").toUpperCase();a==="PM"&&s!==12&&(s+=12),a==="AM"&&s===12&&(s=0);let i=s%12;i===0&&(i=12);const r=s>=12?"p":"a";return i+(n?":"+String(n).padStart(2,"0"):"")+r}function vr(e){const t=[];for(const s of e.allRegistrations||[]){const n=s.parent||{},a=(s.swimmers||[]).map((i,r)=>({s:i,i:r})).filter(i=>!i.s.deleted);a.length!==0&&t.push({regId:s.id,parentName:[n.firstName,n.lastName].filter(Boolean).join(" ")||"—",swimmers:a})}return t.sort((s,n)=>s.parentName.localeCompare(n.parentName)),t}function _r(e){const t=(e.day||"").slice(0,3),s=[e.day,e.startTime+"–"+e.endTime,e.location,e.groupLabel].filter(Boolean).join(" · ");return'<th title="'+U(s)+'">'+U(t)+" "+U(Br(e.startTime))+'<br><span style="font-weight:400;font-size:0.68rem;color:var(--text-muted);">'+U(br(e.location))+"</span></th>"}function wr(e,t,s,n,a){const i=cr(e,t.id,s,n),r=i?i.status:null,d=r==="confirmed"?"st-confirmed":r==="undecided"?"st-undecided":"",l=r==="confirmed"?"✓":r==="undecided"?"?":"";return a?'<td><button type="button" class="ath-cell-btn '+d+'" data-slot="'+t.id+'" data-reg="'+U(s)+'" data-idx="'+n+'" data-cur="'+(r||"")+'" title="'+U(At(t))+'">'+l+"</button></td>":'<td><span class="ath-cell-btn '+d+'" style="display:inline-flex;align-items:center;justify-content:center;border:none;cursor:default;">'+l+"</span></td>"}function $r(e){const t=e.dbRole==="admin",s=gt((e.sessionSlots||[]).filter(d=>d.period===e.currentPeriod)),n=vr(e),a=Un(e),i=yt(e.currentPeriod);let r="";if(r+='<div class="dash-section-header" style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem;gap:1rem;flex-wrap:wrap;"><div style="flex:1;min-width:260px;"><h2 style="font-size:1.5rem;font-weight:600;color:var(--text-primary);margin:0;">'+o("sched2_title")+'</h2><p style="margin:4px 0 0;color:var(--text-muted);font-size:0.85rem;">'+o("sched2_subtitle")+'</p></div><div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;"><div class="sched-view-toggle" style="display:inline-flex;border:1px solid var(--border-color);border-radius:8px;overflow:hidden;"><button type="button" id="sched-view-slot" class="btn btn-sm btn-outline" style="border-radius:0;">'+o("sched2_view_slot")+'</button><button type="button" id="sched-view-athlete" class="btn btn-sm btn-primary" style="border-radius:0;">'+o("sched2_view_athlete")+'</button></div><div style="display:flex;align-items:center;gap:0.5rem;"><label class="season-selector-label" for="sched-period-select">'+o("sched2_period_label")+':</label><select id="sched-period-select" class="season-select">'+a.map(d=>'<option value="'+U(d)+'"'+(d===e.currentPeriod?" selected":"")+">"+U(yt(d))+"</option>").join("")+"</select></div></div></div>",r+='<p style="color:var(--text-muted);font-size:0.82rem;margin:0 0 0.9rem;">'+o("sched2_matrix_hint")+" — "+U(i)+"</p>",s.length===0||n.length===0)return r+='<p class="dash-empty">'+(s.length===0?o("sched2_no_slots"):o("sched2_no_swimmers"))+"</p>",r;r+='<div class="ath-wrap"><table class="ath-matrix" id="ath-matrix">',r+="<thead><tr><th>"+o("sched2_swimmer")+"</th>"+s.map(_r).join("")+"</tr></thead>",r+="<tbody>";for(const d of n){r+='<tr class="ath-family"><td colspan="'+(1+s.length)+'">'+U(d.parentName)+"</td></tr>";for(const l of d.swimmers){const A=l.s,m=l.i,c=[A.firstName,A.lastName].filter(Boolean).join(" ")||"Unknown";r+='<tr><td class="ath-name">'+U(c)+"</td>"+s.map(u=>wr(e,u,d.regId,m,t)).join("")+"</tr>"}}return r+="</tbody></table></div>",r}function Ps(e,t,s,n){const a=(n||"").trim().toLowerCase(),r=fs(e.activeSwimmers||[]).filter(d=>a?[d.firstName,d.lastName,d.parentName].filter(Boolean).join(" ").toLowerCase().includes(a):!0);return r.length===0?'<p class="dash-empty">'+o("sched2_no_swimmers")+"</p>":r.map(d=>{const l=[d.firstName,d.lastName].filter(Boolean).join(" ")||"Unknown",A=d.dob?Math.floor((new Date-new Date(d.dob))/315576e5):null,m=t.enrollments.find(y=>y.slotId===s.id&&y.regId===d._regId&&Number(y.swimmerIndex)===Number(d._swimmerIndex)),c=m?m.status:null,u=(y,p,g,f)=>'<button type="button" data-action="'+p+'" data-reg="'+U(d._regId)+'" data-idx="'+d._swimmerIndex+'" style="padding:3px 10px;border:1px solid var(--border-color);border-radius:999px;cursor:pointer;font-size:0.78rem;white-space:nowrap;'+(f||"")+(g?"background:var(--color-primary,#2563eb);color:#fff;border-color:var(--color-primary,#2563eb);":"background:transparent;color:var(--text-primary);")+'">'+y+"</button>";return`
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:6px 4px;border-bottom:1px solid var(--border-color);flex-wrap:wrap;">
        <div style="min-width:0;">
          <strong style="font-size:0.9rem;">${U(l)}</strong>
          ${A!=null?'<span style="color:var(--text-muted);font-size:0.78rem;margin-left:6px;">'+A+" yrs</span>":""}
          <div style="color:var(--text-muted);font-size:0.75rem;">${o("sched2_family")}: ${U(d.parentName||"—")}</div>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          ${u(o("sched2_confirmed"),"confirm",c==="confirmed")}
          ${u(o("sched2_undecided"),"undecided",c==="undecided")}
          ${c?u("✕ "+o("sched2_remove"),"remove",!1,"color:var(--color-accent,#dc2626);"):""}
        </div>
      </div>
    `}).join("")}function qn(e,t,s,n,a){const i=ze(s.startTime),r=ze(s.endTime);if(i==null||r==null)return null;for(const d of t.enrollments){if(d.status!=="confirmed"||d.slotId===s.id||d.regId!==n||Number(d.swimmerIndex)!==Number(a))continue;const l=(e.sessionSlots||[]).find(c=>c.id===d.slotId);if(!l||l.day!==s.day)continue;const A=ze(l.startTime),m=ze(l.endTime);if(!(A==null||m==null)&&i<m&&A<r)return l}return null}async function Pn(e,t,s,n,a){const i=M(E,"enrollments",`${e.id}_${t}_${s}`);if(n==null){await He(i);return}await Ee(i,{slotId:e.id,period:e.period||"",regId:t,swimmerIndex:Number(s),status:n,swimmerName:a||"",updatedAt:new Date,updatedBy:"admin"})}function xr(e,t){const s=(e.sessionSlots||[]).find(l=>l.id===t);if(!s)return;const n={enrollments:(e.enrollments||[]).slice()},a=document.createElement("div");a.className="confirm-overlay",a.style.cssText="z-index:2000;",a.innerHTML=`
    <div class="confirm-modal" style="max-width:780px;width:min(94vw,780px);max-height:88vh;display:flex;flex-direction:column;">
      <h3 class="confirm-title" style="flex-shrink:0;">${o("sched2_manage_title",{slot:U(At(s))})}</h3>
      <input id="slot-search" class="form-input" placeholder="${o("sched2_search_placeholder")}" style="margin:0.5rem 0 0.75rem;width:100%;flex-shrink:0;">
      <div id="slot-manager-body" style="overflow-y:auto;flex:1;min-height:220px;border:1px solid var(--border-color);border-radius:8px;padding:0.5rem;">
        ${Ps(e,n,s,"")}
      </div>
      <div class="confirm-actions" style="margin-top:0.75rem;flex-shrink:0;">
        <button class="btn btn-outline btn-sm" id="slot-manager-close">${o("sched2_close")}</button>
      </div>
    </div>
  `,document.body.appendChild(a);const i=a.querySelector("#slot-search"),r=a.querySelector("#slot-manager-body"),d=()=>{r.innerHTML=Ps(e,n,s,i.value)};i.addEventListener("input",d),a.querySelector("#slot-manager-close").addEventListener("click",()=>a.remove()),r.addEventListener("click",async l=>{const A=l.target.closest("button[data-action]");if(!A)return;if((e.dbRole||"")!=="admin"){alert(o("sched2_err"));return}const m=A.dataset.reg,c=Number(A.dataset.idx),u=A.dataset.action,y=u==="remove"?null:u==="confirm"?"confirmed":"undecided",p=(e.activeSwimmers||[]).find(f=>f._regId===m&&Number(f._swimmerIndex)===c),g=p?[p.firstName,p.lastName].filter(Boolean).join(" "):"Unknown";if(y==="confirmed"){const f=qn(e,n,s,m,c);if(f){alert(o("sched2_conflict_msg",{name:g,slot:At(f),time:(f.day||"")+" "+(f.startTime||"")+"–"+(f.endTime||"")}));return}}try{await Pn(s,m,c,y,g),n.enrollments=n.enrollments.filter(f=>!(f.slotId===s.id&&f.regId===m&&Number(f.swimmerIndex)===c)),y&&n.enrollments.push({slotId:s.id,period:s.period||"",regId:m,swimmerIndex:c,status:y,swimmerName:g}),d()}catch(f){console.error("Enrollment save failed:",f),alert(o("sched2_err"))}}),a.addEventListener("click",l=>{l.target===a&&a.remove()})}function Sr(e){var s,n,a,i,r,d;(s=document.getElementById("sched-period-select"))==null||s.addEventListener("change",l=>{e.onPeriodChange&&e.onPeriodChange(l.target.value)}),(n=document.getElementById("add-slot-btn"))==null||n.addEventListener("click",()=>{const l=document.getElementById("add-slot-form");l&&(l.style.display=l.style.display==="none"?"block":"none")}),(a=document.getElementById("cancel-slot-btn"))==null||a.addEventListener("click",()=>{const l=document.getElementById("add-slot-form");l&&(l.style.display="none")}),(i=document.getElementById("save-slot-btn"))==null||i.addEventListener("click",async()=>{var f,B,$,x,D;const l=((f=document.getElementById("slot-location"))==null?void 0:f.value)||"",A=((B=document.getElementById("slot-day"))==null?void 0:B.value)||"",m=((($=document.getElementById("slot-start"))==null?void 0:$.value)||"").trim(),c=(((x=document.getElementById("slot-end"))==null?void 0:x.value)||"").trim(),u=(((D=document.getElementById("slot-group"))==null?void 0:D.value)||"").trim();if(!l||!A||!m||!c){alert(o("sched2_required_fields"));return}const y=/^\d{1,2}:\d{2}\s*(AM|PM)?$/i,p=ze(m),g=ze(c);if(!y.test(m)||!y.test(c)||p==null||g==null||g<=p){alert(o("sched2_required_fields"));return}try{await xt(ae(E,"sessionSlots"),{period:e.currentPeriod,location:l,day:A,startTime:m,endTime:c,groupLabel:u,capacity:null,createdAt:new Date});const Q=document.getElementById("add-slot-form");Q&&(Q.style.display="none");const re=document.getElementById("slot-start"),H=document.getElementById("slot-end"),J=document.getElementById("slot-group");re&&(re.value=""),H&&(H.value=""),J&&(J.value="")}catch(Q){console.error("Add slot failed:",Q),alert(o("sched2_err"))}}),document.querySelectorAll(".slot-manage-btn").forEach(l=>{l.addEventListener("click",()=>xr(e,l.dataset.id))}),document.querySelectorAll(".slot-delete-btn").forEach(l=>{l.addEventListener("click",async()=>{if(confirm(o("sched2_delete_confirm")))try{await Cr(l.dataset.id)}catch(A){console.error("Delete slot failed:",A),alert(o("sched2_err"))}})}),document.querySelectorAll(".slot-capacity-input").forEach(l=>{l.addEventListener("change",async()=>{try{await Er(l.dataset.id,l.value)}catch(A){console.error("Capacity update failed:",A),alert(o("sched2_err"))}})}),(r=document.getElementById("sched-view-slot"))==null||r.addEventListener("click",()=>{e.onViewChange&&e.onViewChange("slot")}),(d=document.getElementById("sched-view-athlete"))==null||d.addEventListener("click",()=>{e.onViewChange&&e.onViewChange("athlete")}),document.querySelectorAll(".slot-names-toggle").forEach(l=>{l.addEventListener("click",()=>{const A=document.getElementById("slot-names-"+l.dataset.id);if(!A)return;const m=!A.style.display||A.style.display==="none";A.style.display=m?"block":"none",l.textContent=(m?"▾ ":"▸ ")+o("sched2_show_names")})});const t=document.getElementById("ath-matrix");t==null||t.addEventListener("click",async l=>{const A=l.target.closest("button.ath-cell-btn");if(!A)return;if((e.dbRole||"")!=="admin"){alert(o("sched2_err"));return}const m=(e.sessionSlots||[]).find(B=>B.id===A.dataset.slot);if(!m)return;const c=A.dataset.reg,u=Number(A.dataset.idx),y=A.dataset.cur||"",p=y===""?"confirmed":y==="confirmed"?"undecided":"";if(p==="confirmed"){const B=qn(e,{enrollments:e.enrollments||[]},m,c,u);if(B){const $=(e.activeSwimmers||[]).find(D=>D._regId===c&&Number(D._swimmerIndex)===u),x=$?[$.firstName,$.lastName].filter(Boolean).join(" "):"Unknown";alert(o("sched2_conflict_msg",{name:x,slot:At(B),time:(B.day||"")+" "+(B.startTime||"")+"–"+(B.endTime||"")}));return}}const g=(e.activeSwimmers||[]).find(B=>B._regId===c&&Number(B._swimmerIndex)===u),f=g?[g.firstName,g.lastName].filter(Boolean).join(" "):"Unknown";try{await Pn(m,c,u,p||null,f)}catch(B){console.error("Enrollment save failed:",B),alert(o("sched2_err"))}})}async function Er(e,t){const s=String(t??"").trim();let n=null;s!==""&&(n=Math.max(0,Math.floor(Number(s))),!Number.isFinite(n))||await be(M(E,"sessionSlots",e),{capacity:n})}async function Cr(e){const t=Se(ae(E,"enrollments"),Lt("slotId","==",e)),s=await qe(t);if(s.size>0){const n=is(E);s.docs.forEach(a=>n.delete(a.ref)),await n.commit()}await He(M(E,"sessionSlots",e))}const bt="announcements",z={items:[],loaded:!1,editingId:null,draft:null,busy:!1,formMsg:null};function Ue(e,t){z.formMsg=e?{text:e,color:t}:null;const s=document.getElementById("news-form-msg");s&&(s.textContent=e||"",s.style.color=t||"")}function ut(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function Ir(){return`
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
    `}function kr(){var s,n,a;if(!document.getElementById("news-admin"))return;const t=document.getElementById("news-form");if(t){bs(),kt(),z.formMsg&&Ue(z.formMsg.text,z.formMsg.color),t.addEventListener("submit",Lr),(s=document.getElementById("news-reset-btn"))==null||s.addEventListener("click",()=>Bs(!0)),(n=document.getElementById("news-refresh-btn"))==null||n.addEventListener("click",()=>Qt());for(const[i,r]of[["news-title","input"],["news-body","input"],["news-level","change"],["news-date","input"],["news-until","input"],["news-pinned","change"]])(a=document.getElementById(i))==null||a.addEventListener(r,()=>{Kn(),kt()});jt(),Qt()}}function ee(e){return document.getElementById(e)}function Kn(){var e,t,s,n,a,i;return z.draft={title:((e=ee("news-title"))==null?void 0:e.value)??"",body:((t=ee("news-body"))==null?void 0:t.value)??"",level:((s=ee("news-level"))==null?void 0:s.value)==="urgent"?"urgent":"info",pinned:((n=ee("news-pinned"))==null?void 0:n.checked)===!0,date:((a=ee("news-date"))==null?void 0:a.value)??"",until:((i=ee("news-until"))==null?void 0:i.value)??""},z.draft}function bs(){const e=z.draft;ee("news-title")&&(ee("news-title").value=(e==null?void 0:e.title)??""),ee("news-body")&&(ee("news-body").value=(e==null?void 0:e.body)??""),ee("news-level")&&(ee("news-level").value=(e==null?void 0:e.level)??"info"),ee("news-pinned")&&(ee("news-pinned").checked=(e==null?void 0:e.pinned)??!1),ee("news-date")&&(ee("news-date").value=(e==null?void 0:e.date)??Vt()),ee("news-until")&&(ee("news-until").value=(e==null?void 0:e.until)??""),ee("news-save-btn").textContent=z.editingId?"Save changes":"Publish"}function Bs(e){var t;z.draft=null,z.editingId=null,bs(),kt(),Ue(""),e&&((t=ee("news-title"))==null||t.focus())}function kt(){var a,i,r;const e=z.draft||{title:"",body:"",level:"info",pinned:((a=ee("news-pinned"))==null?void 0:a.checked)===!0,date:((i=ee("news-date"))==null?void 0:i.value)||Vt(),until:((r=ee("news-until"))==null?void 0:r.value)||""},t={id:"preview",title:e.title||"Your headline appears here",body:e.body||`The first paragraph is what the banner shows.

A second paragraph appears only in the News card.`,level:e.level,pinned:!0,date:e.date||Vt(),until:e.until||null},s=document.getElementById("news-preview-banner");s&&(s.innerHTML=Da(t));const n=document.getElementById("news-preview-card");n&&(n.innerHTML=La([t]))}function Nr(e){const t=hn(e),s={live:{label:"LIVE",color:"#16A34A",bg:"rgba(22, 163, 74, 0.12)"},scheduled:{label:"SCHEDULED",color:"#B45309",bg:"rgba(180, 83, 9, 0.12)"},expired:{label:"EXPIRED",color:"var(--text-muted)",bg:"var(--bg-primary)"}},n=s[t]||s.expired;return`<span style="display: inline-block; padding: 0.1rem 0.45rem; border-radius: 999px; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.04em; color: ${n.color}; background: ${n.bg};">${n.label}</span>`}function jt(){const e=document.getElementById("news-list"),t=document.getElementById("news-admin-status");if(!e)return;if(!z.loaded){t&&(t.textContent="Loading…");return}if(t){const n=z.items.filter(a=>hn(a)==="live").length;t.textContent=`${z.items.length} notice(s) · ${n} live`}if(!z.items.length){e.innerHTML='<p style="color: var(--text-muted); font-size: 0.9rem;">No notices yet. The homepage shows nothing until you publish one.</p>';return}const s=z.items.slice().sort((n,a)=>String(a.date||"").localeCompare(String(n.date||""))).map(n=>{const a=[n.pinned?'<span style="font-size: 0.7rem; font-weight: 600; color: var(--color-accent);">PINNED</span>':"",n.level==="urgent"?'<span style="font-size: 0.7rem; font-weight: 600; color: #DC2626;">URGENT</span>':""].filter(Boolean).join(" · "),i=n.until?` → ${ut(ks(n.until))}`:"",r=n.updatedByEmail||n.createdByEmail||"",d=n.updatedAt?`edited by ${ut(r)}`:"";return`
              <div class="news-admin-row" data-id="${ut(n.id)}" style="display: flex; gap: 1rem; align-items: flex-start; justify-content: space-between; padding: 0.9rem 0; border-top: 1px solid var(--border-color);">
                <div style="min-width: 0;">
                  <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; margin-bottom: 0.25rem;">
                    ${Nr(n)} ${a}
                    <span style="font-size: 0.75rem; color: var(--text-muted);">${ut(ks(n.date))}${i}</span>
                  </div>
                  <div style="font-weight: 600; font-size: 0.92rem;">${ut(n.title)}</div>
                  <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.2rem;">${d}</div>
                </div>
                <div style="display: flex; gap: 0.4rem; flex-shrink: 0;">
                  <button type="button" class="btn btn-outline btn-sm" data-action="edit">Edit</button>
                  <button type="button" class="btn btn-outline btn-sm" data-action="delete" style="color: var(--color-accent);">Delete</button>
                </div>
              </div>
            `}).join("");e.innerHTML=s,e.querySelectorAll(".news-admin-row").forEach(n=>{var i,r;const a=n.dataset.id;(i=n.querySelector('[data-action="edit"]'))==null||i.addEventListener("click",()=>Fr(a)),(r=n.querySelector('[data-action="delete"]'))==null||r.addEventListener("click",()=>Rr(a))})}function Fr(e){var s;const t=z.items.find(n=>n.id===e);t&&(z.editingId=e,z.draft={title:t.title,body:t.body,level:t.level,pinned:t.pinned,date:t.date,until:t.until||""},bs(),kt(),Ue("Editing an existing notice — saving keeps it in place, so families who already dismissed the banner will not see it again.","var(--text-muted)"),(s=document.getElementById("news-form"))==null||s.scrollIntoView({behavior:"smooth",block:"start"}))}async function Qt(){const e=document.getElementById("news-admin-status");e&&(e.textContent="Loading…");try{const t=await qe(ae(E,bt));z.items=t.docs.map(s=>({id:s.id,...s.data()})),z.loaded=!0,jt()}catch(t){console.error("[news-admin] load failed:",t),e&&(e.textContent=`Load failed: ${t.message}`)}}function Dr(e){return e.title.trim()?e.title.trim().length>120?"Title is too long (max 120 characters).":e.body.trim()?e.body.length>4e3?"Body is too long (max 4000 characters).":e.date?e.until&&e.until<e.date?'"Until" cannot be earlier than "Show from".':null:'"Show from" date is required.':"Body is required.":"Title is required."}async function Lr(e){if(e.preventDefault(),z.busy)return;const t=Kn(),s=Dr(t);if(s){Ue(`❌ ${s}`,"var(--color-accent)");return}z.busy=!0;const n=ee("news-save-btn"),a=n.textContent;n&&(n.disabled=!0,n.textContent="Saving…");const i=St.currentUser,r={title:t.title.trim(),body:t.body,level:t.level,pinned:t.pinned,date:t.date,until:t.until||null,updatedAt:at(),updatedBy:(i==null?void 0:i.uid)||null,updatedByEmail:(i==null?void 0:i.email)||null};try{let d=z.editingId;d?await be(M(E,bt,d),r):d=(await xt(ae(E,bt),{...r,createdBy:(i==null?void 0:i.uid)||null,createdByEmail:(i==null?void 0:i.email)||null,createdAt:at()})).id,t.pinned&&await Mr(d);const l={...r,id:d,updatedAt:new Date().toISOString()},A=z.items.findIndex(m=>m.id===d);A>=0?z.items[A]={...z.items[A],...l}:z.items.push(l),Bs(!1),jt(),Ue("✅ Saved. The homepage will show it within a page refresh.","#16A34A"),Qt()}catch(d){console.error("[news-admin] save failed:",d),Ue(`❌ Save failed: ${d.message}`,"var(--color-accent)")}finally{z.busy=!1,n&&(n.disabled=!1,n.textContent=a)}}async function Mr(e){const s=(await qe(Se(ae(E,bt),Lt("pinned","==",!0)))).docs.filter(a=>a.id!==e);if(!s.length)return;const n=is(E);s.forEach(a=>n.update(a.ref,{pinned:!1})),await n.commit()}async function Rr(e){const t=z.items.find(n=>n.id===e),s=t?`"${t.title}"`:"this notice";if(window.confirm(`Delete ${s}? The homepage will stop showing it immediately.`))try{await He(M(E,bt,e)),z.items=z.items.filter(n=>n.id!==e),z.editingId===e&&Bs(!1),jt(),Ue("🗑 Deleted.","var(--text-muted)")}catch(n){console.error("[news-admin] delete failed:",n),Ue(`❌ Delete failed: ${n.message}`,"var(--color-accent)")}}window.XLSX=Ma;rs();let Ce=[],Ye=null,te=null,vs=[],_s=[],N=null,ye="swimmer",oe=null,T=null,Be=null,ce=[],We=[],rt=[],ge=null,k=_t(),es=jo(),ts="slot",K="overview",Ks=!1;function Tr(){const e=document.getElementById("app");e.innerHTML=`
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; gap: 20px; font-family: sans-serif;">
      <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #f5c518; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <p style="color: #666;">${o("dash_loading")}</p>
      <style>
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    </div>
  `,console.log("Dashboard: Initializing auth listener...");const t=setTimeout(()=>{console.warn("Dashboard: Auth listener timed out — redirecting to signin"),window.location.href="/signin.html"},5e3);ya(St,async s=>{if(clearTimeout(t),!s){console.log("Dashboard: No user authenticated, redirecting to signin..."),window.location.href="/signin.html";return}N=s,console.log("Dashboard: User authenticated:",s.email);try{console.log("Dashboard: Fetching user document...");const n=await he(M(E,"users",s.uid));oe=n.exists()?n.data().role:null;const a=s.email&&s.email.toLowerCase()==="dragonswim@outlook.com";ye=oe==="coach"||oe==="admin"||a?"coach":oe||"swimmer",console.log("Dashboard: Detected role:",ye),ye!=="coach"&&K==="overview"&&(K="schedule"),Ks?(console.log("Dashboard: Refreshing UI..."),G()):(console.log("Dashboard: Initializing data listeners..."),jr(),ye==="coach"&&Promise.all([mi(),Ss()]).then(()=>{console.log("Dashboard: Data Hub session:",ne!=null&&ne.dev?"dev proxy":ne!=null&&ne.hasCookie?"saved":"missing"),G()}),Ks=!0,G())}catch(n){console.error("Dashboard Critical Error:",n),e.innerHTML=`
        <div style="padding: 40px; text-align: center; font-family: sans-serif; max-width: 500px; margin: 100px auto; border: 1px solid #fee2e2; background: #fef2f2; border-radius: 12px; color: #991b1b;">
          <h2 style="margin-bottom: 16px;">${o("dash_load_failed_title")}</h2>
          <p style="margin-bottom: 24px;">${o("dash_load_failed_msg")}</p>
          <code style="display: block; padding: 12px; background: #fee2e2; border-radius: 6px; font-size: 13px; text-align: left; overflow-x: auto; margin-bottom: 24px;">
            ${n.message||o("dash_unknown_error")}
          </code>
          <button onclick="window.location.reload()" style="padding: 10px 20px; background: #991b1b; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">${o("dash_load_failed_retry")}</button>
        </div>
      `,ye="swimmer"}})}function jr(){const e=Se(ae(E,"meets"),Ut("createdAt","desc"));je(e,n=>{Ce=n.docs.map(a=>({id:a.id,...a.data()})),G()},n=>{console.error("Error listening to meets:",n)});const t=Se(ae(E,"sessionSlots"));je(t,n=>{vs=n.docs.map(a=>({id:a.id,...a.data()})),G()},n=>{console.error("Error listening to sessionSlots:",n)});const s=Se(ae(E,"enrollments"));if(je(s,n=>{_s=n.docs.map(a=>({id:a.id,...a.data()})),G()},n=>{console.error("Error listening to enrollments:",n)}),ye==="coach"){const n=Se(ae(E,"registrations"),Ut("createdAt","desc"));je(n,r=>{ce=r.docs.map(d=>({id:d.id,...d.data()})),G()},r=>{console.error("Error listening to registrations:",r)});const a=Se(ae(E,"deposits"),Ut("swimmerName","asc"));je(a,r=>{We=r.docs.map(d=>({id:d.id,...d.data()})),G()},r=>{console.error("Error listening to deposits:",r)});const i=Se(ae(E,Ct));je(i,r=>{rt=r.docs.map(d=>({id:d.id,...d.data()})),G()},r=>{console.error("Error listening to volunteerHours:",r)})}}async function Or(){if(!N)return;const e=M(E,"registrations",N.uid),t=await he(e);if(t.exists()){Be=t.id,T=t.data(),console.log("fetchFamilyData: found own registration",t.id);return}if(N.email){const s=N.email.toLowerCase().trim();console.log("fetchFamilyData: looking for spouse access with email:",s);try{const n=Se(ae(E,"registrations"),Lt("parentEmails","array-contains",s)),a=await qe(n);if(console.log("fetchFamilyData: spouse query returned",a.size,"docs"),!a.empty){const i=a.docs[0];Be=i.id,T=i.data(),console.log("fetchFamilyData: found via spouse access",Be,"parentEmails:",T.parentEmails);const r=T.editors||[];r.includes(N.uid)||(r.push(N.uid),await be(M(E,"registrations",Be),{editors:r}).catch(d=>{console.error("fetchFamilyData: failed to add editor:",d)}),T.editors=r);return}console.warn("fetchFamilyData: no registration found for spouse email",s)}catch(n){console.error("fetchFamilyData: spouse query failed:",n)}}else console.warn("fetchFamilyData: currentUser.email is empty")}function G(){N&&Or().then(()=>{pt()}).catch(e=>{console.error("Error fetching family data:",e),pt()})}function pt(){const e=Pr(),t=Ur();t&&(te=t);const s=Hr();ye==="coach"?Vr(N):Yr(N),Kr(e),qr(s)}const zr={name:"meet-name",startDate:"meet-start-date",endDate:"meet-end-date",location:"meet-location",source:"meet-source",season:"meet-season"};function Ur(){var s;const e=document.getElementById("add-meet-form");if(!e||e.style.display==="none")return null;const t={};for(const[n,a]of Object.entries(zr))t[n]=((s=document.getElementById(a))==null?void 0:s.value)??"";return t.season||(t.season=k),t}function Pt(){te=null,Ye=null;const e=document.getElementById("add-meet-form");e&&(e.style.display="none")}function Hr(){const e=document.activeElement;if(!e||!e.id)return null;const t=document.getElementById("add-meet-form");return!t||!t.contains(e)?null:{id:e.id,selStart:typeof e.selectionStart=="number"?e.selectionStart:null,selEnd:typeof e.selectionEnd=="number"?e.selectionEnd:null}}function qr(e){if(!e)return;const t=document.getElementById(e.id);if(t&&(t.focus(),e.selStart!=null&&typeof t.setSelectionRange=="function"))try{t.setSelectionRange(e.selStart,e.selEnd)}catch{}}function Pr(){const e=document.activeElement;return!e||!e.classList||!e.classList.contains("vol-input")?null:{familyId:e.dataset.familyId||"",field:e.classList.contains("vol-note-input")?"note":"hours",selStart:typeof e.selectionStart=="number"?e.selectionStart:null,selEnd:typeof e.selectionEnd=="number"?e.selectionEnd:null}}function Kr(e){if(!e||!e.familyId)return;const t=e.field==="note"?"vol-note-input":"vol-hours-input",s=document.querySelector(`.${t}[data-family-id="${e.familyId}"]`);if(s&&(s.focus(),e.selStart!=null&&typeof s.setSelectionRange=="function"))try{s.setSelectionRange(e.selStart,e.selEnd)}catch{}}function Yr(e){const t=document.getElementById("app");t.innerHTML=`
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
            <button class="dash-nav-item ${K==="profile"?"active":""}" data-tab="profile">
              <span class="dash-nav-icon">👤</span> ${o("dash_swimmer_profile_label")}
            </button>
            <button class="dash-nav-item ${K==="plans"?"active":""}" data-tab="plans">
              <span class="dash-nav-icon">📋</span> ${o("dash_swimmer_plans_label")}
            </button>
            <button class="dash-nav-item ${K==="meets"?"active":""}" data-tab="meets">
              <span class="dash-nav-icon">🏆</span> ${o("dash_swimmer_meets_label")}
            </button>
            <button class="dash-nav-item ${K==="results"?"active":""}" data-tab="results">
              <span class="dash-nav-icon">🏊</span> ${o("dash_swimmer_results_label")}
            </button>
            <button class="dash-nav-item ${K==="schedule"?"active":""}" data-tab="schedule">
              <span class="dash-nav-icon">📅</span> ${o("dash_swimmer_schedule_label")}
            </button>
          </div>
          <div class="dash-nav-section" style="margin-top: auto;">
            <span class="dash-nav-label">${o("dash_sidebar_system")}</span>
            ${oe==="admin"?`
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
              <h1 class="dash-page-title">${Yn(K)}</h1>
              <p class="dash-page-subtitle">${Gr(K)}</p>
            </div>
          </div>
          <div class="dash-topbar-right">
            <div class="dash-user-menu" id="user-menu">
              <button class="dash-user-trigger" id="user-trigger">
                <div class="dash-avatar">${(Ys()||e.email||o("dash_swimmer_username_fallback")).charAt(0).toUpperCase()}</div>
                <span class="dash-user-name">${Ys()||e.email||o("dash_swimmer_username_fallback")}</span>
                <span class="dash-dropdown-arrow">▾</span>
              </button>
              <div class="dash-dropdown" id="user-dropdown" style="display: none;">
                <button class="dash-dropdown-item" id="menu-profile">${o("dash_user_menu_profile")}</button>
                ${oe==="admin"?`<button class="dash-dropdown-item" id="menu-admin">${o("dash_user_menu_admin")}</button>`:""}
                ${N&&N.providerData&&N.providerData[0].providerId==="password"?`<button class="dash-dropdown-item" id="menu-password">🔑 ${o("dash_profile_password_btn")}</button>`:""}
                <button class="dash-dropdown-item" id="menu-signout" style="color: var(--color-accent);">${o("dash_user_menu_signout")}</button>
              </div>
            </div>
          </div>
        </header>

        <div class="dash-content">
          ${Vn(K,"swimmer")}
        </div>
      </main>
    </div>
  `,fa(),rs(),Gn(),K==="results"&&_i()}function Vr(e){const t=document.getElementById("app");t.innerHTML=`
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
            <button class="dash-nav-item ${K==="overview"?"active":""}" data-tab="overview">
              <span class="dash-nav-icon">🏠</span> ${o("dash_coach_overview_label")}
            </button>
            <button class="dash-nav-item ${K==="roster"?"active":""}" data-tab="roster">
              <span class="dash-nav-icon">👥</span> ${o("dash_coach_roster_label")}
            </button>
            <button class="dash-nav-item ${K==="schedule"?"active":""}" data-tab="schedule">
              <span class="dash-nav-icon">⏱️</span> ${o("dash_coach_schedule_label")}
            </button>
            <button class="dash-nav-item ${K==="meets"?"active":""}" data-tab="meets">
              <span class="dash-nav-icon">🏁</span> ${o("dash_coach_meets_label")}
            </button>
            <button class="dash-nav-item ${K==="volunteer"?"active":""}" data-tab="volunteer">
              <span class="dash-nav-icon">🙋</span> ${o("dash_coach_volunteer_label")}
            </button>
            ${oe==="admin"?`
            <button class="dash-nav-item ${K==="feesummary"?"active":""}" data-tab="feesummary">
              <span class="dash-nav-icon">💰</span> ${o("dash_coach_fee_summary_label")}
            </button>
            <button class="dash-nav-item ${K==="deposits"?"active":""}" data-tab="deposits">
              <span class="dash-nav-icon">🏦</span> ${o("dash_coach_deposits_label")}
            </button>
            <button class="dash-nav-item ${K==="news"?"active":""}" data-tab="news">
              <span class="dash-nav-icon">📰</span> ${o("dash_coach_news_label")}
            </button>
            `:""}
            <button class="dash-nav-item ${K==="results"?"active":""}" data-tab="results">
              <span class="dash-nav-icon">🏊</span> Swim Times
            </button>
          </div>
          <div class="dash-nav-section" style="margin-top: auto;">
            <span class="dash-nav-label">${o("dash_sidebar_system")}</span>
            ${oe==="admin"?`
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
              <h1 class="dash-page-title">${Yn(K,"coach")}</h1>
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
                ${oe==="admin"?`<button class="dash-dropdown-item" id="menu-admin">${o("dash_user_menu_admin")}</button>`:""}
                ${N&&N.providerData&&N.providerData[0].providerId==="password"?`<button class="dash-dropdown-item" id="menu-password">🔑 ${o("dash_profile_password_btn")}</button>`:""}
                <button class="dash-dropdown-item" id="menu-signout" style="color: var(--color-accent);">${o("dash_user_menu_signout")}</button>
              </div>
            </div>
          </div>
        </header>

        <div class="dash-content">
          ${Vn(K,"coach")}
        </div>
      </main>
    </div>
  `,K==="results"&&Jn(),K==="news"&&oe==="admin"&&kr(),fa(),rs(),Gn()}function Ys(){if(!T||!T.parent)return null;const e=T.parent;return[e.firstName,e.lastName].filter(Boolean).join(" ")||null}function Yn(e,t="swimmer"){return t==="coach"?{overview:o("dash_coach_tab_overview"),roster:o("dash_coach_tab_roster"),meets:o("dash_coach_tab_meets"),schedule:o("dash_coach_tab_schedule"),results:"Swim Times",feesummary:o("dash_coach_tab_fee_summary"),deposits:o("dash_coach_tab_deposits"),volunteer:o("dash_coach_tab_volunteer"),news:o("dash_coach_tab_news")}[e]||o("dash_coach_tab_overview"):{profile:o("dash_swimmer_tab_profile"),plans:o("dash_swimmer_tab_plans"),meets:o("dash_swimmer_tab_meets"),results:o("dash_swimmer_tab_results"),schedule:o("dash_swimmer_tab_schedule")}[e]||o("dash_swimmer_tab_schedule")}function Gr(e){return{profile:o("dash_swimmer_profile_sub"),plans:o("dash_swimmer_plans_sub"),meets:o("dash_swimmer_meets_sub"),results:o("dash_swimmer_results_sub"),schedule:o("dash_swimmer_schedule_sub")}[e]||""}function Vn(e,t="swimmer"){if(t==="coach")switch(e){case"overview":return Yt();case"roster":return Ri();case"meets":return ln();case"schedule":return dn();case"results":return Bi();case"feesummary":return Ti();case"deposits":return ji();case"volunteer":return Qi();case"news":return oe==="admin"?Ir():Yt();default:return Yt()}switch(e){case"profile":return ll();case"plans":return dl();case"meets":return ln();case"results":return vi();case"schedule":return dn();default:return""}}function Gn(){const e=document.getElementById("sidebar-theme-icon");if(e){const t=document.documentElement.getAttribute("data-theme")==="dark";e.textContent=t?"☀️":"🌙"}}function Ot(){const e=[];for(const t of ce)if(t.swimmers)for(let s=0;s<t.swimmers.length;s++){const n=t.swimmers[s];n.deleted||e.push({...n,parentName:ws(t),_regId:t.id,_swimmerIndex:s})}return e}function ws(e){return e.parent&&[e.parent.firstName,e.parent.lastName].filter(Boolean).join(" ")||"—"}function Wr(){const e=new Date;return e.setDate(e.getDate()-30),ce.filter(t=>{var n,a;return(((a=(n=t.createdAt)==null?void 0:n.toDate)==null?void 0:a.call(n))||new Date(t.createdAt))>=e})}function Xr(){const e=[];for(const t of ce){const s=Na(t);(s.required.length||s.conflicts.length||s.optionalGaps.length)&&e.push({regId:t.id,name:ws(t),audit:s})}return Fa(e)}const Zr={parent:{firstName:"dash_attn_parent_first",lastName:"dash_attn_parent_last",gender:"dash_attn_parent_gender",phone:"dash_attn_parent_phone",address:"dash_attn_parent_address"},emergency:{name:"dash_attn_emergency_name",phone:"dash_attn_emergency_phone"},swimmer:{firstName:"dash_attn_swimmer_first",lastName:"dash_attn_swimmer_last",gender:"dash_attn_gender",dob:"dash_attn_dob",usaSwimmingId:"dash_attn_usa_id"},spouse:{firstName:"dash_attn_spouse_first",lastName:"dash_attn_spouse_last",gender:"dash_attn_spouse_gender",phone:"dash_attn_spouse_phone",email:"dash_attn_spouse_email"}},Nt={parent:"dash_attn_scope_parent",swimmer:"dash_attn_scope_swimmer",emergency:"dash_attn_scope_emergency",spouse:"dash_attn_scope_spouse",family:"dash_attn_scope_family",other:"dash_attn_scope_other"},Jr={emergency_name_same_as_parent:"dash_attn_conflict_emergency_name_same",emergency_phone_same_as_parent:"dash_attn_conflict_emergency_phone_same",spouse_name_same_as_parent:"dash_attn_conflict_spouse_name_same",spouse_email_same_as_parent:"dash_attn_conflict_spouse_email_same",parent_email_missing:"dash_attn_conflict_parent_email_missing",parent_emails_missing:"dash_attn_conflict_parent_emails_missing",parent_email_not_in_parent_emails:"dash_attn_conflict_parent_email_not_in_parent_emails",parent_email_mismatch_auth:"dash_attn_conflict_parent_email_mismatch_auth",address_looks_like_email:"dash_attn_conflict_address_email",swimmer_is_account_holder:"dash_attn_conflict_swimmer_is_holder",swimmer_is_spouse:"dash_attn_conflict_swimmer_is_spouse",swimmer_is_adult:"dash_attn_conflict_swimmer_is_adult"};function Wn(e,t){var n;const s=(n=Zr[e])==null?void 0:n[t];return s?o(s):String(t)}function Qr(e){if(e.scope==="family"&&e.field==="activeSwimmers")return o("dash_attn_no_active_swimmers");if(e.field==="__missing__")return o(`dash_attn_${e.scope}_missing`);const t=Wn(e.scope,e.field);if(e.scope==="swimmer"){const n=e.swimmerName||o("dash_coach_unnamed");return`${b(n)}: ${b(t)}`}const s=o(Nt[e.scope]||Nt.other);return`${b(s)}: ${b(t)}`}function ei(e){const t=Wn(e.scope,e.field);if(e.scope==="swimmer"){const n=e.swimmerName||o("dash_coach_unnamed");return`${b(n)}: ${b(t)}`}const s=o(Nt[e.scope]||Nt.other);return`${b(s)}: ${b(t)}`}function ti(e){const t=Jr[e.type]||"dash_attn_conflict_unknown";return b(o(t,{parentEmail:e.parentEmail||"",authEmail:e.authEmail||"",swimmerName:e.swimmerName||"",age:e.age??""}))}function Kt(e,t,s,n){return s.length?`
    <div class="dash-attn-group">
      <div class="dash-attn-group-label ${t}">${o(e)}</div>
      <div class="dash-attn-list">
        ${s.map(a=>`<span class="dash-attn-chip dash-attn-chip--${t}">${n(a)}</span>`).join("")}
      </div>
    </div>`:""}function si(e){var n;const t=((n=e==null?void 0:e.toDate)==null?void 0:n.call(e))||(e?new Date(e):null);if(!t||Number.isNaN(t.getTime()))return"";const s=Math.floor((Date.now()-t.getTime())/864e5);return s<=0?o("dash_rel_today"):o("dash_rel_days",{n:s})}function ni(e){return(e.swimmers||[]).filter(t=>!t.deleted).map(t=>[t.firstName,t.lastName].filter(Boolean).join(" ")).filter(Boolean).join(", ")}const it="/api/usas/TimesSearch",$s="/api/usas/session";let ne=null;async function Xn(){try{return N?await N.getIdToken():null}catch(e){return console.warn("[usas] getIdToken failed:",e),null}}async function xs(e,t={}){const s=await Xn(),n={...t.headers||{}};return s&&(n.Authorization=`Bearer ${s}`),fetch(e,{...t,headers:n})}async function Ss(){try{const e=await xs($s);ne=e.ok?await e.json():null}catch(e){console.warn("[usas] session status failed:",e),ne=null}return ne}function Vs(){return!!(ne&&ne.hasCookie)}async function Gs(e){e||(e=document.getElementById("session-message"));try{const t=await xs(`${$s}/verify`),s=await t.json().catch(()=>({}));return t.ok&&s.valid?e&&(e.textContent=`✅ 连接正常${s.name?`(已登录:${s.name})`:""}`,e.style.color="#16A34A"):e&&(e.textContent="⛔ 会话已失效 —— 重新登录 Data Hub,复制新的 cookie 再粘贴一次。",e.style.color="var(--color-accent)"),await Ss(),s}catch(t){return e&&(e.textContent=`❌ 验证失败:${t.message}`,e.style.color="var(--color-accent)"),null}}let st=null,lt=!1;const Ft=!1,pe={meetGapMs:5e3,batchSize:10,batchPauseMs:6e4,swimmerGapMs:18e4,retryDelaysMs:[5e3,2e4,6e4],cooldownAfterConsecutive:3,cooldownMs:3e5,emptyCooldownAfter:5,emptyCooldownMs:6e5,abortAfterConsecutiveBlocked:kn},ai=new Set([406,429,500,502,503,504]),nt=e=>new Promise(t=>setTimeout(t,e)),oi=[{name:"Mock A (incremental + fail/circuit-break)",usaSwimmingId:"MOCK-A",hasId:!0,dob:"2013-06-01",gender:"female"},{name:"Mock B (batch pause)",usaSwimmingId:"MOCK-B",hasId:!0,dob:"2011-02-14",gender:"male"}];function ri(e){const t=e||{};return{AppName:"DataHub","Usas-Sub-Id":t.subId||"","Device-Id":t.deviceId||"","usas-session-id":t.sessionId||""}}function Zn(e,t=null){return{endpoint:(e==null?void 0:e.endpoint)||t||null,httpStatus:Number.isInteger(e==null?void 0:e.httpStatus)?e.httpStatus:null,message:(e==null?void 0:e.message)||String(e),retryable:!!(e!=null&&e.retryable),authError:!!(e!=null&&e.authError),responseUnreadable:In(e),at:new Date().toISOString()}}async function Ws(e,t,s=null){const n=Zn(t,s);try{await Ee(M(E,"swimResults",e),{lastFetchError:n},{merge:!0})}catch(a){console.warn("[fetchLog] failed to persist fetch error:",a)}return n}async function ii(e,t){const s=`${it}/GetBestTimesForMember/${t}`;return Es(s,e,`GetBestTimesForMember/${t}`)}async function li(e,t){const s=`${it}/GetSwimmerMeets/${t}`;return Es(s,e,`GetSwimmerMeets/${t}`)}function di(e){if(typeof e!="string")return e;const t=e.trim();if(!t||t[0]!=="["&&t[0]!=="{")return e;try{return JSON.parse(t)}catch{return e}}async function Ai(e,t){const s=new AbortController,n=setTimeout(()=>s.abort(),15e3);try{const a=await Xn(),i=ri(t);a&&(i.Authorization=`Bearer ${a}`);const r=await fetch(e,{headers:i,signal:s.signal});if(clearTimeout(n),r.ok)return{ok:!0,data:di(await r.json())};let d="";try{d=await r.text()}catch{d="(could not read body)"}const l=new Error(`HTTP ${r.status}: ${d.slice(0,200)}`);return l.endpoint=e,l.httpStatus=r.status,l.authError=r.status===401||r.status===403,l.retryable=ai.has(r.status),{ok:!1,error:l,retryable:l.retryable}}catch(a){if(clearTimeout(n),a.name==="AbortError"){const i=new Error("Timeout (15s)");return i.endpoint=e,i.retryable=!0,{ok:!1,error:i,retryable:!0}}return a.endpoint=e,a.retryable=!0,{ok:!1,error:a,retryable:!0}}}async function Es(e,t,s){const n=pe.retryDelaysMs;for(let a=0;;a++){const i=await Ai(e,t);if(i.ok)return i.data;const r=i.error;if(r.endpoint=r.endpoint||e,!i.retryable)throw r;if(a>=n.length)throw Object.assign(r,{retryable:!0});console.warn(`[fetch] ${s||e} attempt ${a+1} failed: ${r.message} — retrying in ${n[a]}ms`),await nt(n[a])}}async function ci(e,t,s){const n=`${it}/GetSwimmerMeetTimes/${t}/${s}`;return Es(n,e,`GetSwimmerMeetTimes/${t}/${s}`)}async function mi(){try{const e=await he(M(E,"settings","swimApi"));if(e.exists())return st=e.data(),st}catch(e){console.warn("Failed to load swim API credentials:",e)}return null}function vt(){const e=[];for(const t of ce)if(t.swimmers)for(let s=0;s<t.swimmers.length;s++){const n=t.swimmers[s];n.deleted||e.push({usaSwimmingId:n.usaSwimmingId||null,name:[n.firstName,n.lastName].filter(Boolean).join(" ")||"Unknown",firstName:n.firstName||"",lastName:n.lastName||"",hasId:!!n.usaSwimmingId,dob:n.dob||null,gender:n.gender||null})}return e}async function ui(e){try{const t=await he(M(E,"swimResults",e));if(t.exists()){const s=t.data();return!s.initialFullFetchAt&&!s.fullFetchComplete&&ea(s)&&Ee(M(E,"swimResults",e),{initialFullFetchAt:new Date().toISOString(),initialMeetCount:Object.keys(s.meets||{}).length,migratedLegacyInitializedAt:new Date().toISOString()},{merge:!0}).catch(n=>{console.warn(`[fetchNew] failed to backfill legacy marker for ${e}:`,n)}),s.meets||{}}}catch{}return{}}async function pi(e){const t=await he(M(E,"swimResults",e));if(!t.exists())return!1;const s=t.data(),n=Object.keys(s).filter(d=>d.startsWith("meets."));if(n.length===0)return!1;const a={...s.meets||{}};let i=0;for(const d of n){const l=d.slice(6),A=s[d];!A||typeof A!="object"||(a[l]={...A},i++)}const r={...s};for(const d of n)delete r[d];return r.meets=a,await Ee(M(E,"swimResults",e),r),console.log(`[Migrate] ${e}: merged ${i} literal meet fields into meets object`),!0}async function fi(){const e=vt().filter(t=>t.hasId);for(const t of e)try{await pi(t.usaSwimmingId)}catch(s){console.warn(`[Migrate] ${t.usaSwimmingId} failed:`,s)}}async function Jn(){const e=vt().filter(t=>t.hasId);await Promise.all(e.map(async t=>{const s=document.getElementById(`status-${t.usaSwimmingId}`);if(!s)return;let n={};try{if(!Ft){const A=await he(M(E,"swimResults",t.usaSwimmingId));A.exists()&&(n=A.data().meets||{})}}catch(A){s.innerHTML=`<span style="color:var(--color-accent);">❌ ${b(A.message||"load failed")}</span>`;return}const a=Object.values(n);if(a.length===0){s.innerHTML='<span style="color: var(--text-muted);">— No data yet</span>';return}let i=0,r=0,d=0,l=0;for(const A of a){const m=A.status||(A.swims&&A.swims.length?"ok":"empty");m==="ok"?i++:m==="failed"?r++:d++,l+=(A.swims||[]).length}if(r===0&&d===0)s.innerHTML=`<span style="color:#16A34A;">✅ ${i} meets · ${l} swims</span>`;else{const A=[];r&&A.push(`${r} failed`),d&&A.push(`${d} empty`),s.innerHTML=`<span style="color:var(--color-accent);">⚠ ${a.length} meets · ${A.join(" · ")} — refetch</span>`}}))}async function Xs(e,t,s,n,a=null){const i={meetName:t.meetName,meetDates:t.meetDates,meetType:t.meetType,courseCode:t.courseCode,season:t.season,seasonYear:t.seasonYear,fetchedAt:new Date().toISOString(),status:n,swims:s};a&&(i.error=a);const r={[`meets.${t.meetId}`]:i,lastUpdated:new Date().toISOString()};a&&(r.lastFetchError=a),await be(M(E,"swimResults",e),r)}async function Qn(e,t,s,n={}){const{force:a=!1,onLog:i=()=>{},onBestTimes:r=()=>{}}=n,d=await ui(t),l=B=>{var x;if(a)return!0;const $=d[B];return $?$.status==="ok"?!1:$.status==="failed"||$.status==="empty"?!0:(((x=$.swims)==null?void 0:x.length)||0)===0:!0};let A;try{A=await ii(e,t)}catch(B){throw await Ws(t,B,`${it}/GetBestTimesForMember/${t}`),B}r(A),await Ee(M(E,"swimResults",t),{memberId:t,swimmerName:s,bestTimes:A,lastUpdated:new Date().toISOString(),lastFetchSuccessAt:new Date().toISOString(),lastFetchError:null},{merge:!0});let m;try{m=await li(e,t)}catch(B){throw await Ws(t,B,`${it}/GetSwimmerMeets/${t}`),B}const c=m.filter(B=>l(B.meetId));i(`📅 ${m.length} meets total, ${c.length} to fetch${c.length?"":" — all up to date"}`);let u=0,y=0;const p=[];let g=0,f=0;for(let B=0;B<c.length;B++){const $=c[B];try{const x=await ci(e,t,$.meetId);Array.isArray(x)||console.warn(`[fetch] ${$.meetId}: expected array, got ${typeof x}`,typeof x=="string"?x.slice(0,120):x);const D=Array.isArray(x)?x:[],Q=D.length===0?"empty":"ok";await Xs(t,$,D,Q),u++,g=0,D.length===0?(f++,f>=pe.emptyCooldownAfter&&(i(`⚠ 连续 ${f} 场返回空结果,疑似被软降级 — 暂停 ${pe.emptyCooldownMs/6e4} 分钟`,!0),await nt(pe.emptyCooldownMs),f=0)):f=0}catch(x){const D=Zn(x,`${it}/GetSwimmerMeetTimes/${t}/${$.meetId}`);await Xs(t,$,[],"failed",D),y++,p.push(`${$.meetName||$.meetId}: ${x.message}`),x.retryable&&(g++,g>=pe.cooldownAfterConsecutive&&(i(`⚠ 连续 ${g} 场可重试失败,疑似被限流 — 全局暂停 ${pe.cooldownMs/6e4} 分钟`,!0),await nt(pe.cooldownMs),g=0))}B+1<c.length&&((B+1)%pe.batchSize===0?(i(`⏸ 已处理 ${B+1}/${c.length} 场,中场休息 ${pe.batchPauseMs/6e4} 分钟(保护 API 配额)...`),await nt(pe.batchPauseMs)):await nt(pe.meetGapMs))}return{fetched:u,failed:y,errors:p,bestTimes:A,meets:m}}const hi=new Date("2026-09-19T00:00:00Z");function ea(e){const t=(e==null?void 0:e.meets)||{};if(Object.keys(t).length===0)return!1;const s=e==null?void 0:e.lastUpdated,n=s!=null&&s.toDate?s.toDate():new Date(s);return n instanceof Date&&!Number.isNaN(n.getTime())&&n<hi}async function yi(e){const t=vt().filter(n=>n.hasId);if(!e)return t;const s=new Set;return await Promise.all(t.map(async n=>{try{let a=!1;if(!Ft){const i=await he(M(E,"swimResults",n.usaSwimmingId));if(i.exists()){const r=i.data(),d=ea(r);a=!!(r.initialFullFetchAt||r.fullFetchComplete||d),d&&!r.initialFullFetchAt&&!r.fullFetchComplete&&Ee(M(E,"swimResults",n.usaSwimmingId),{initialFullFetchAt:new Date().toISOString(),initialMeetCount:Object.keys(r.meets||{}).length,migratedLegacyInitializedAt:new Date().toISOString()},{merge:!0}).catch(l=>{console.warn(`[fetchNew] failed to backfill legacy marker for ${n.usaSwimmingId}:`,l)})}}a||s.add(n.usaSwimmingId)}catch(a){console.warn(`[fetchNew] state read failed for ${n.usaSwimmingId}; treating as new:`,a),s.add(n.usaSwimmingId)}})),t.filter(n=>s.has(n.usaSwimmingId))}async function gi(e,t){const s={initialFullFetchAt:new Date().toISOString(),initialMeetCount:t.meets.length,initialFetchedCount:t.fetched,initialFailedCount:t.failed,lastFetchSuccessAt:new Date().toISOString(),lastFetchError:null};try{await Ee(M(E,"swimResults",e),s,{merge:!0})}catch(n){console.warn(`[fetchNew] failed to mark ${e} as initialized:`,n)}return s}async function bi(e,t,s={}){const{newOnly:n=!1}=s,a=await yi(n);if(a.length===0){t(n?{type:"no-new",message:"No new athletes to fetch."}:{type:"error",message:"No swimmers with USA Swimming ID found."});return}t({type:"start",total:a.length,newOnly:n});let i=0,r=0,d=0;const l=[];let A=null,m=null,c=0;for(let u=0;u<a.length;u++){const y=a[u];d=u+1,t({type:"swimmer-start",index:u,total:a.length,name:y.name,memberId:y.usaSwimmingId});let p=null;try{p=await Qn(e,y.usaSwimmingId,y.name,{force:!1,onLog:(B,$)=>t({type:"log",message:B,isError:$}),onBestTimes:B=>t({type:"step",name:y.name,step:"bestTimes",count:B.length})});let g=!1;n&&p.failed===0&&(await gi(y.usaSwimmingId,p),g=!0);const f=p.fetched>0||p.failed>0;t({type:"swimmer-done",name:y.name,memberId:y.usaSwimmingId,bestTimes:p.bestTimes.length,meets:p.meets.length,newMeets:p.fetched,failedMeets:p.failed,written:f,initialComplete:g}),p.failed>0&&l.push(...p.errors.map(B=>`${y.name}: ${B}`)),i++,c=0}catch(g){if(r++,l.push(`${y.name}: ${g.message}`),t({type:"swimmer-error",name:y.name,memberId:y.usaSwimmingId,error:g.message}),g.authError){A={name:y.name,memberId:y.usaSwimmingId,message:g.message,endpoint:g.endpoint||null},t({type:"auth-error",name:y.name,memberId:y.usaSwimmingId,message:g.message,endpoint:g.endpoint||null});break}const f=Uo(c,g);if(c=f.count,f.abort){m={count:c,threshold:pe.abortAfterConsecutiveBlocked,attempted:d,total:a.length},t({type:"blocked-abort",...m});break}}t({type:"progress",index:u+1,total:a.length,success:i,failed:r}),p&&u<a.length-1&&(p.fetched>0||p.failed>0)&&(t({type:"log",message:`⏸ 运动员间冷却 ${pe.swimmerGapMs/6e4} 分钟...`}),await nt(pe.swimmerGapMs))}t({type:"done",total:a.length,attempted:d,success:i,failed:r,errors:l,authError:A,blockedAbort:m,newOnly:n})}function Bi(){const e=fs(vt()),t=e.filter(m=>m.hasId),s=e.filter(m=>!m.hasId),n=!!(ne&&ne.hasCookie),a=!!(ne&&ne.invalidAt),i=!!(ne&&ne.dev),r=!n||lt,d=a||!n?"var(--color-accent)":"#16A34A",l=i?"🛠 dev — local proxy":a?"⛔ Expired — paste a new cookie":n?"✅ Saved":"⚠ Not configured",A=ne!=null&&ne.savedAt?new Date(ne.savedAt).toLocaleString():"";return`
    <div class="dash-panel" style="margin-bottom: 1.5rem;">
      <div class="dash-panel-header">
        <h3 style="margin: 0;">🔑 Data Hub Session</h3>
        <span id="session-status" style="font-size: 0.85rem; color: ${d};">${l}</span>
      </div>

      <p style="margin: var(--space-md) 0; font-size: 0.85rem; color: var(--text-muted);">
        USA Swimming now requires a signed-in session instead of API keys. The cookie lasts
        <strong>8 hours</strong> and cannot be renewed — paste a fresh one before each results run.
      </p>

      ${i?`
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
        ${A?`<span style="font-size: 0.8rem; color: var(--text-muted);">saved ${b(A)}</span>`:""}
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
        <button class="btn btn-primary btn-sm" id="fetch-new-btn" data-default-label="🆕 Fetch New Athletes Only" ${r?"disabled":""}>
          ${lt?"⏳ Fetching...":"🆕 Fetch New Athletes Only"}
        </button>
        <button class="btn btn-outline btn-sm" id="fetch-all-btn" data-default-label="🔄 Fetch All Swimmer Results" ${r?"disabled":""}>
          ${lt?"⏳ Fetching...":"🔄 Fetch All Swimmer Results"}
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
                <td style="padding: 0.5rem 0.6rem; font-weight: 500;">${b(m.name)}</td>
                <td style="padding: 0.5rem 0.6rem; font-family: monospace; font-size: 0.8rem;">${b(m.usaSwimmingId)}</td>
                <td style="padding: 0.5rem 0.6rem;" id="status-${b(m.usaSwimmingId)}">
                  <span style="color: var(--text-muted);">—</span>
                </td>
              </tr>
            `).join("")}
            ${s.map(m=>`
              <tr style="border-bottom: 1px solid var(--border-color); opacity: 0.6;">
                <td style="padding: 0.5rem 0.6rem;">${b(m.name)}</td>
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
          ${t.map(m=>`<option value="${b(m.usaSwimmingId)}">${b(m.name)}</option>`).join("")}
        </select>
        <button class="btn btn-outline btn-sm" id="refetch-one-btn" disabled>🔄 Refetch Selected Athlete</button>
      </div>
      <div id="results-viewer" style="display: none;">
        <div id="results-content"></div>
      </div>
    </div>
    `:""}
  `}function vi(){if(!T)return`<div class="dash-panel" style="text-align: center; padding: 3rem;">
      <p class="dash-empty">${o("dash_swimmer_results_no_usa_id")}</p>
    </div>`;const e=(T.swimmers||[]).filter(s=>!s.deleted&&s.usaSwimmingId);if(e.length===0)return`<div class="dash-panel" style="text-align: center; padding: 3rem;">
      <p class="dash-empty">${o("dash_swimmer_results_no_usa_id")}</p>
    </div>`;const t=s=>[s.firstName,s.middleName,s.lastName].filter(Boolean).join(" ");return`
    <div class="dash-panel">
      ${e.length>1?`
      <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: var(--space-md); flex-wrap: wrap;">
        <span style="font-size: 0.85rem; color: var(--text-muted);">${o("dash_swimmer_results_select_label")}</span>
        <select class="form-input" id="family-results-select" style="max-width: 300px;">
          ${e.map(s=>`<option value="${b(s.usaSwimmingId)}">${b(t(s))}</option>`).join("")}
        </select>
      </div>
      `:""}
      <div id="results-viewer" style="display: none;">
        <div id="results-content"></div>
      </div>
    </div>
  `}function _i(){const e=document.getElementById("family-results-select");e==null||e.addEventListener("change",s=>{s.target.value&&Zs(s.target.value)});const t=((T==null?void 0:T.swimmers)||[]).filter(s=>!s.deleted&&s.usaSwimmingId);t.length>0&&Zs(t[0].usaSwimmingId)}function Zs(e){const t=((T==null?void 0:T.swimmers)||[]).filter(r=>!r.deleted&&r.usaSwimmingId),s=t.findIndex(r=>r.usaSwimmingId===e);if(s<0)return;const n=t[s],a=e,i={dob:n.dob||null,gender:n.gender||null};ns(a,{swimmerMeta:i,showDebug:!1,onlyOkMeets:!0,texts:{loading:o("dash_swimmer_results_loading"),noData:o("dash_swimmer_results_no_data"),bestTimesEmpty:o("dash_swimmer_results_no_best_times"),meetHistoryEmpty:o("dash_swimmer_results_no_meets")}})}function zt(e){if(e==null||e==="")return"—";const t=Number(e);if(isNaN(t))return String(e);if(t<60)return t.toFixed(2);const s=Math.floor(t/60),n=(t%60).toFixed(2);return`${s}:${n.padStart(5,"0")}`}function ta(e){if(!e)return"";const t=e.toUpperCase();return{B:"ts-b",BB:"ts-bb",A:"ts-a",AA:"ts-aa",AAA:"ts-aaa",AAAA:"ts-aaaa"}[t]||""}function wi(e){return{LCM:"LCM (50m)",SCY:"SCY (25yd)",SCM:"SCM (25m)"}[e]||e||"—"}const sa={FR:"Free",BK:"Back",BR:"Breast",FL:"Fly",IM:"IM"},$i=[["B","ts-b"],["BB","ts-bb"],["A","ts-a"],["AA","ts-aa"],["AAA","ts-aaa"],["AAAA","ts-aaaa"]];function xi(e){if(e==null||e==="")return null;if(typeof e=="number")return Number.isFinite(e)?e:null;const t=String(e).trim(),s=/^(\d+):(\d{2}(?:\.\d+)?)$/.exec(t);if(s)return+s[1]*60+ +s[2];const n=Number(t);return Number.isFinite(n)?n:null}function Si(e){const t={FREE:"FR",FLY:"FL",BACK:"BK",BREAST:"BR"},s=String(e||"").toUpperCase();return t[s]||s}function na(e,t){const s=String(e||"").trim();if(!s)return null;const n=/^(\d+)\s+([A-Za-z]{2,4})\s+([A-Za-z]{2,3})$/.exec(s),a=/^(\d+)\s+([A-Za-z]{2,4})$/.exec(s);if(!n&&!a)return null;const i=n||a,r=+i[1],d=Si(i[2]),l=n?i[3].toUpperCase():((t==null?void 0:t.courseCode)||"").toUpperCase()||null;return!Number.isFinite(r)||!d||!l?null:{distance:r,stroke:d,course:l}}function aa(e,t){if(!e)return null;const s=new Date(e),n=new Date(t);if(isNaN(s.getTime())||isNaN(n.getTime()))return null;let a=n.getFullYear()-s.getFullYear();return(n.getMonth()<s.getMonth()||n.getMonth()===s.getMonth()&&n.getDate()<s.getDate())&&a--,a}function Ei(e,t,s){if(!e||e.length===0)return null;const n=aa(s==null?void 0:s.dob,e[e.length-1].dateTs),a=String(t||"").split(" ").pop().toUpperCase();return To({age:n,course:a,eventKey:t,gender:s==null?void 0:s.gender})}function Js(e,t){const s=String(t||"").toUpperCase().trim(),n=[];for(const[a,i]of Object.entries(e||{})){if((i.status||(Array.isArray(i.swims)&&i.swims.length?"ok":"empty"))!=="ok"||!Array.isArray(i.swims)||i.swims.length===0)continue;const d=ss(i);if(d==null){console.warn("[Trend] no parseable meet date for",a,i.meetDates);continue}let l=null;for(const A of i.swims){const m=na(A.eventCode||`${A.distance||""} ${A.strokeAbbreviation||""}`,i);if(!m||`${m.distance} ${m.stroke} ${m.course}`!==s)continue;const c=xi(A.swimTime);c!=null&&(!l||c<l.seconds)&&(l={seconds:c,course:m.course,sw:A})}l&&n.push({meetId:a,meetName:i.meetName||"",dateTs:d,dateLabel:i.meetDates||"",seconds:l.seconds,timeText:zt(l.seconds),timeStandard:l.sw.timeStandard??null,timeDrop:l.sw.timeDrop??null,finishPosition:l.sw.finishPosition??null,sessionName:l.sw.sessionName??null,course:l.course})}return n.sort((a,i)=>a.dateTs-i.dateTs||a.meetId.localeCompare(i.meetId)),{points:n,count:n.length}}function Ci(e){const t=new Map;for(const a of Object.values(e||{})){if((a.status||(Array.isArray(a.swims)&&a.swims.length?"ok":"empty"))!=="ok"||!Array.isArray(a.swims))continue;const r=new Set;for(const d of a.swims){const l=na(d.eventCode||`${d.distance||""} ${d.strokeAbbreviation||""}`,a);if(!l)continue;const A=`${l.distance} ${l.stroke} ${l.course}`;if(r.has(A))continue;r.add(A);const m=t.get(A);m?m.count++:t.set(A,{distance:l.distance,stroke:l.stroke,course:l.course,count:1})}}const s={FR:0,BK:1,BR:2,FL:3,IM:4},n={SCY:0,LCM:1,SCM:2};return[...t.values()].sort((a,i)=>a.distance-i.distance||(s[a.stroke]??9)-(s[i.stroke]??9)||(n[a.course]??9)-(n[i.course]??9)).map(a=>({key:`${a.distance} ${a.stroke} ${a.course}`,label:`${a.distance} ${sa[a.stroke]||a.stroke} · ${a.course}`,count:a.count}))}function Ii(){return $i.map(([e,t])=>`
    <span style="display:inline-flex;align-items:center;gap:0.35rem;">
      <span class="trend-legend-dot ts-dot ${t}"></span>${e}
    </span>`).join("")}function ki(e){const[t,s,n]=String(e||"").trim().split(/\s+/);return[t,sa[s]||s,n].filter(Boolean).join(" ")}function Qs(e,t,s){const n=Ei(e,t,s),a=Array.isArray(n)&&n.length>0,i=Array.isArray(e)&&e.length>0,r=i?e[e.length-1].dateTs:null,d=aa(s==null?void 0:s.dob,r),l=d!=null?En(d):null;let A="";return i&&!a&&(!(s!=null&&s.dob)||!(s!=null&&s.gender)||l==null?A="Add the swimmer's date of birth and gender to show time standard lines.":A=`No time standard lines: USA Swimming publishes no motivational time standards for ${ki(t)} in the ${l} age group.`),{levelLines:n,hasLines:a,lastAge:d,ageGroup:l,note:A}}function en(e,t){if(!e.hasLines||e.ageGroup==null)return"";const s=t!=null&&t.gender?String(t.gender)[0].toUpperCase():"?";return`Level lines: ${e.ageGroup} · ${s}`}function tn(e){return e.hasLines?`<div class="trend-legend">${Ii()}</div>`:e.note?`<p class="trend-note">${b(e.note)}</p>`:""}function Ni(e){const t=e.timeDrop==null?"—":typeof e.timeDrop=="number"?(e.timeDrop>0?"+":"")+e.timeDrop.toFixed(2)+"s":String(e.timeDrop);return[e.meetName,`${e.dateLabel} (${e.course})`,`Time: ${e.timeText} · ${e.timeStandard||"—"}`,`Drop: ${t} · Place: ${e.finishPosition??"—"}`].join(`
`)}function sn(e,t,s={}){var me;const{width:n=720,height:a=300,margin:i={top:14,right:44,bottom:26,left:48}}=s;if(!e||e.length===0)return'<p class="trend-empty">No swims for this event.</p>';const r=n-i.left-i.right,d=a-i.top-i.bottom,l=Math.min(...e.map(C=>C.dateTs)),A=Math.max(...e.map(C=>C.dateTs)),m=Math.max(A-l,24*3600*1e3),c=l-m*.05,u=A+m*.05,y=C=>i.left+(C-c)/(u-c)*r,p=(t||[]).map(C=>C.thresholdSeconds),g=e.map(C=>C.seconds);let f=Math.min(...g,...p),B=Math.max(...g,...p);const $=(B-f||1)*.08;f-=$,B+=$;const x=C=>i.top+(C-f)/(B-f)*d,Q=(C=>{const Y=Math.pow(10,Math.floor(Math.log10(C))),V=C/Y;return(V<=1?1:V<=2?2:V<=5?5:10)*Y})((B-f)/4),re=[];for(let C=Math.ceil(f/Q)*Q;C<=B+1e-9&&(re.push(+C.toFixed(3)),!(re.length>=6));C+=Q);const H=re.map(C=>{const Y=x(C);return`
      <line x1="${i.left}" x2="${n-i.right}" y1="${Y.toFixed(1)}" y2="${Y.toFixed(1)}" stroke="var(--border-color)" stroke-opacity="0.4" stroke-width="1" />
      <text x="${i.left-6}" y="${(Y+3).toFixed(1)}" text-anchor="end" font-size="10" fill="var(--text-muted)" font-family="var(--font-sans, sans-serif)">${zt(C)}</text>`}).join("");let J="";const we=[];for(let C=0;C<5;C++){const Y=c+(u-c)*C/4,V=new Date(Y).toLocaleDateString("en-US",{month:"short",year:"2-digit"});if(C>0&&C<4&&V===J)continue;J=V;const de=C===0?"start":C===4?"end":"middle";we.push(`<text x="${y(Y).toFixed(1)}" y="${a-8}" text-anchor="${de}" font-size="10" fill="var(--text-muted)" font-family="var(--font-sans, sans-serif)">${V}</text>`)}const Ie=e.length>=2?`<polyline points="${e.map(C=>`${y(C.dateTs).toFixed(1)},${x(C.seconds).toFixed(1)}`).join(" ")}" fill="none" stroke="var(--color-secondary)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />`:"",ie=new Map;e.forEach(C=>{const Y=ie.get(C.dateTs)||[];Y.push(C),ie.set(C.dateTs,Y)});const ve=[];for(const[C,Y]of ie)Y.forEach((V,de)=>{let Le=y(C);Y.length>1&&(Le+=(de-(Y.length-1)/2)*6);const Pe=V.timeStandard?String(V.timeStandard).toUpperCase():"",Ze=`ts-dot ${ta(Pe)||"ts-none"}`,_=Pe==="AAAA"?5.5:4.5,O=b(Ni(V));ve.push(`
        <circle class="${Ze}" cx="${Le.toFixed(1)}" cy="${x(V.seconds).toFixed(1)}" r="${_}" />
        <circle cx="${Le.toFixed(1)}" cy="${x(V.seconds).toFixed(1)}" r="10" fill="transparent" style="cursor:pointer;">
          <title>${O}</title>
        </circle>`)});let le="";if(Array.isArray(t)&&t.length>0){const C=[...t].sort((V,de)=>V.thresholdSeconds-de.thresholdSeconds);let Y=null;for(const V of C){const de=x(V.thresholdSeconds);Y!=null&&(le+=`<rect x="${i.left}" y="${de.toFixed(1)}" width="${r}" height="${(Y-de).toFixed(1)}" fill="${V.color}" fill-opacity="0.06" />`),le+=`
        <line x1="${i.left}" x2="${n-i.right}" y1="${de.toFixed(1)}" y2="${de.toFixed(1)}" stroke="${V.color}" stroke-width="1.2" stroke-dasharray="5 4" />
        <text x="${n-i.right-4}" y="${(de+3).toFixed(1)}" text-anchor="end" font-size="9" fill="var(--text-muted)" font-family="var(--font-sans, sans-serif)">${b(String(V.level))}</text>`,Y=de}}return`
    <svg class="trend-chart-svg" viewBox="0 0 ${n} ${a}" width="${n}" height="${a}" role="img" aria-label="Swim time trend chart for ${b(String(((me=e[0])==null?void 0:me.course)||""))}">
      <text x="${i.left}" y="${i.top-4}" font-size="9" fill="var(--text-muted)" font-family="var(--font-sans, sans-serif)">faster ↑</text>
      ${le}
      ${H}
      ${Ie}
      ${ve}
      ${we}
    </svg>`}function ss(e){const t=e.meetDates||"",s=/^(\d{4})-(\d{2})-(\d{2})/.exec(t);if(s)return new Date(+s[1],+s[2]-1,+s[3]).getTime();const n=/^([A-Za-z]{3}) (\d{1,2})/.exec(t),a=/^(\d{4})\s*[/-]\s*(\d{4})/.exec(e.season||"");if(!n||!a)return null;const r={Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12}[n[1]];if(!r)return null;const d=+a[1],l=+a[2],A=r>=9?d:l;return new Date(A,r-1,+n[2]).getTime()}function Fi(e){const t={};for(const[n,a]of Object.entries(e)){const i=a.season||"Unknown";t[i]||(t[i]=[]),t[i].push({meetId:n,...a})}const s={};for(const n of Object.keys(t).sort().reverse())s[n]=t[n].sort((a,i)=>{const r=ss(a),d=ss(i);return r!=null&&d!=null?d-r:(i.meetDates||"").localeCompare(a.meetDates||"")});return s}function Di(e){const t={};for(const[s,n]of Object.entries(e||{}))(n.status||(Array.isArray(n.swims)&&n.swims.length?"ok":"empty"))==="ok"&&(t[s]=n);return t}function Li(e,t="No best times recorded."){return!e||e.length===0?`<p style="color:var(--text-muted);text-align:center;padding:1rem;">${b(t)}</p>`:`
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
              <td style="padding:0.4rem 0.5rem;font-weight:600;font-family:monospace;">${zt(n.swimTime??n.bestTime)}</td>
              <td style="padding:0.4rem 0.5rem;">${wi(n.courseCode)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `}function Mi(e,t="No meet history recorded."){if(!e||Object.keys(e).length===0)return`<p style="color:var(--text-muted);text-align:center;padding:1rem;">${b(t)}</p>`;const s=Fi(e);let n="";for(const[a,i]of Object.entries(s)){const r=`season-${a.replace(/[^a-zA-Z0-9]/g,"-")}`;n+=`
      <div style="margin-bottom: 0.75rem;">
        <button class="btn btn-outline btn-sm season-toggle" data-season="${b(r)}"
                style="width:100%;text-align:left;font-weight:600;display:flex;justify-content:space-between;align-items:center;">
          <span>📅 ${b(a)} Season (${i.length} meet${i.length>1?"s":""})</span>
          <span class="season-arrow" id="arrow-${b(r)}">▶</span>
        </button>
        <div class="season-meets" id="${b(r)}" style="display:none;margin-top:0.5rem;">
          ${i.map(d=>{var A,m;const l=`meet-${d.meetId}`;return`
              <div style="margin-bottom:0.5rem;border:1px solid var(--border-color);border-radius:var(--radius-sm);overflow:hidden;">
                <button class="btn btn-outline btn-sm meet-toggle" data-meet="${b(l)}"
                        style="width:100%;text-align:left;display:flex;justify-content:space-between;align-items:center;padding:0.5rem 0.75rem;border:none;border-radius:0;">
                  <span>🏁 ${b(d.meetName)} <span style="color:var(--text-muted);font-size:0.8rem;">${b(d.courseCode||"")}</span></span>
                  <span style="font-size:0.75rem;color:var(--text-muted);">
                    ${b(d.meetDates||"")} · ${((A=d.swims)==null?void 0:A.length)||0} swim${(((m=d.swims)==null?void 0:m.length)||0)!==1?"s":""}
                    <span class="meet-arrow" id="m-arrow-${b(l)}">▶</span>
                  </span>
                </button>
                <div class="meet-swims" id="${b(l)}" style="display:none;">
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
                            <td style="padding:0.3rem 0.5rem;font-family:monospace;font-weight:500;">${zt(c.swimTime)}</td>
                            <td style="padding:0.3rem 0.5rem;">${c.sessionName||"—"}</td>
                            <td style="padding:0.3rem 0.5rem;">${c.finishPosition!=null?c.finishPosition:"—"}</td>
                            <td style="padding:0.3rem 0.5rem;">
                              ${c.timeStandard?`<span class="ts-badge ${ta(c.timeStandard)}">${b(c.timeStandard)}</span>`:"—"}
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
    `}return n}async function ns(e,t={}){var A,m;const{swimmerMeta:s=null,showDebug:n=!0,onlyOkMeets:a=!1,texts:i={}}=t,r={loading:i.loading||"⏳ Loading...",noData:i.noData||"No results data yet. Run a fetch first.",bestTimesEmpty:i.bestTimesEmpty||"No best times recorded.",meetHistoryEmpty:i.meetHistoryEmpty||"No meet history recorded."},d=document.getElementById("results-viewer"),l=document.getElementById("results-content");if(!(!d||!l)){d.style.display="block",l.innerHTML=`<p style="text-align:center;padding:2rem;color:var(--text-muted);">${r.loading}</p>`;try{let c;if(!Ft){const f=await he(M(E,"swimResults",e));if(!f.exists()){l.innerHTML=`<p style="text-align:center;padding:2rem;color:var(--text-muted);">${r.noData}</p>`;return}c=f.data()}console.log("[Results] Loaded data for",e,":",c),console.log("[Results] bestTimes:",(A=c.bestTimes)==null?void 0:A.length,"meets:",Object.keys(c.meets||{}).length);const u=Ci(c.meets),y=s||(Ft?oi.find(f=>f.usaSwimmingId===e)||null:vt().find(f=>f.usaSwimmingId===e)||null);let p="";if(u.length>0){const f=[...u].sort((x,D)=>D.count-x.count)[0].key,B=Js(c.meets,f),$=Qs(B.points,f,y);p=`
      <div style="margin-top:1.5rem;">
        <h4 style="margin:0 0 0.75rem 0;">📈 Performance Trend</h4>
        <div style="display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap;margin-bottom:0.5rem;">
          <select id="trend-event-select" class="form-input" style="max-width:260px;">
            ${u.map(x=>`<option value="${b(x.key)}" ${x.key===f?"selected":""}>${b(x.label)} (${x.count})</option>`).join("")}
          </select>
          <span id="trend-event-count" style="font-size:0.8rem;color:var(--text-muted);">${B.count} swim${B.count===1?"":"s"}</span>
          <span id="trend-level-caption" style="font-size:0.8rem;color:var(--text-muted);margin-left:auto;">${b(en($,y))}</span>
        </div>
        <div id="trend-legend-slot">${tn($)}</div>
        <div class="trend-chart" id="trend-chart">${sn(B.points,$.levelLines)}</div>
      </div>`}const g=a?Di(c.meets):c.meets||{};l.innerHTML=`
      <div style="margin-bottom:1.5rem;">
        <h4 style="margin:0 0 0.75rem 0;display:flex;align-items:center;gap:0.5rem;">
          🏆 Best Times (${(c.bestTimes||[]).length} entries)
          <span style="font-size:0.75rem;color:var(--text-muted);font-weight:400;">
            Last updated: ${c.lastUpdated?new Date(c.lastUpdated).toLocaleString():"—"}
          </span>
        </h4>
        ${Li(c.bestTimes,r.bestTimesEmpty)}
      </div>

      <div>
        <h4 style="margin:0 0 0.75rem 0;">📅 Meet History (${Object.keys(g).length} meets)</h4>
        <div id="meet-history-container">
          ${Mi(g,r.meetHistoryEmpty)}
        </div>
      </div>

      ${p}

      ${n?`
      <details style="margin-top:1.5rem;border-top:1px solid var(--border-color);padding-top:1rem;">
        <summary style="cursor:pointer;color:var(--text-muted);font-size:0.8rem;">🔍 Debug: Raw JSON</summary>
        <pre style="background:var(--bg-primary);border:1px solid var(--border-color);border-radius:var(--radius-sm);padding:0.75rem;max-height:400px;overflow:auto;font-size:0.7rem;line-height:1.4;margin-top:0.5rem;">${b(JSON.stringify(c,null,2))}</pre>
      </details>
      `:""}
    `,l.querySelectorAll(".season-toggle").forEach(f=>{f.addEventListener("click",()=>{const B=f.dataset.season,$=document.getElementById(B),x=document.getElementById("arrow-"+B);if(!$)return;const D=$.style.display!=="none";$.style.display=D?"none":"block",x&&(x.textContent=D?"▶":"▼")})}),l.querySelectorAll(".meet-toggle").forEach(f=>{f.addEventListener("click",()=>{const B=f.dataset.meet,$=document.getElementById(B),x=document.getElementById("m-arrow-"+B);if(!$)return;const D=$.style.display!=="none";$.style.display=D?"none":"block",x&&(x.textContent=D?"▶":"▼")})}),(m=document.getElementById("trend-event-select"))==null||m.addEventListener("change",f=>{const B=document.getElementById("trend-chart"),$=document.getElementById("trend-event-count"),x=document.getElementById("trend-legend-slot"),D=document.getElementById("trend-level-caption");if(!B)return;const Q=Js(c.meets,f.target.value),re=Qs(Q.points,f.target.value,y);B.innerHTML=sn(Q.points,re.levelLines),x&&(x.innerHTML=tn(re)),D&&(D.textContent=en(re,y)),$&&($.textContent=`${Q.count} swim${Q.count===1?"":"s"}`)})}catch(c){l.innerHTML=`<p style="text-align:center;padding:2rem;color:var(--color-accent);">Failed to load results: ${b(c.message)}</p>`,console.error("loadAthleteResults:",c)}}}function Yt(){var y;const e=Ot(),t=Wr(),s=Xr(),n=Ia(s),a=ka(s),i=new Map(s.map(p=>[p.regId,p.audit])),r=new Date,d=Ce.filter(p=>Xe(p)===k),l=d.map(p=>({meet:p,disp:Cs(p,r)})).filter(p=>p.disp.bucket==="upcoming").sort((p,g)=>String(p.meet.startDate||p.meet.date||"").localeCompare(String(g.meet.startDate||g.meet.date||""))),A=((y=l[0])==null?void 0:y.meet)||null,m=A?`${b(A.name||"")} · ${b(A.startDate||A.date||"")}`:"",c=d.filter(p=>!p.feeData||!Array.isArray(p.feeData.swimmers)||p.feeData.swimmers.length===0).sort((p,g)=>String(p.startDate||p.date||"").localeCompare(String(g.startDate||g.date||""))),u=t.slice(0,5).map(p=>({r:p,when:si(p.createdAt),kids:ni(p),miss:i.get(p.id)}));return`
    <p class="dash-overview-meta">${b(o("dash_coach_overview_meta",{season:k}))}</p>

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
        <div class="dash-stat-number">${ce.length}</div>
        <div class="dash-stat-label">${o("dash_coach_registered_families")}</div>
      </div>
    </div>

    <div class="dash-overview-grid">
      <div class="dash-panel dash-panel--wide">
        <h3 class="dash-panel-title">${o("dash_coach_needs_attention")}${s.length?` (${s.length})`:""}</h3>
        <div class="dash-panel-body">
          ${s.length===0?`<p class="dash-empty">${o("dash_coach_needs_attention_empty")}</p>`:`
          <p class="dash-attn-summary">${o("dash_attn_summary",{required:n.required,conflicts:n.conflicts,optional:n.optional})}</p>
          ${a.visible.map(p=>`
            <div class="dash-mini-card">
              <div class="dash-mini-top">
                <span class="dash-mini-name">${b(p.name)}</span>
              </div>
              ${Kt("dash_attn_required","required",p.audit.required,Qr)}
              ${Kt("dash_attn_conflicts","conflicts",p.audit.conflicts,ti)}
              ${Kt("dash_attn_optional","optional",p.audit.optionalGaps,ei)}
            </div>
          `).join("")+(a.hiddenOptionalCount>0?`<p class="dash-empty">${o("dash_attn_more_optional",{n:a.hiddenOptionalCount})}</p>`:"")}
          `}
        </div>
      </div>
      <div class="dash-panel">
        <h3 class="dash-panel-title">${o("dash_coach_meets_needing_fees")}${c.length?` (${c.length})`:""}</h3>
        <div class="dash-panel-body">
          ${c.length===0?`<p class="dash-empty">${o("dash_coach_meets_needing_fees_empty")}</p>`:c.slice(0,5).map(p=>`
            <div class="dash-mini-card">
              <div class="dash-mini-top">
                <span class="dash-mini-name">${b(p.name||"Unnamed Meet")}</span>
                <span class="dash-mini-when">${b(p.startDate||p.date||"")}</span>
              </div>
              <div class="dash-mini-meta">${b(p.location||"")}</div>
            </div>
          `).join("")+(c.length>5?`<p class="dash-empty">+${c.length-5} …</p>`:"")}
        </div>
      </div>
      <div class="dash-panel">
        <h3 class="dash-panel-title">${o("dash_coach_recent_registrations")}</h3>
        <div class="dash-panel-body">
          ${t.length===0?`<p class="dash-empty">${o("dash_coach_no_recent")}</p>`:u.map(({r:p,when:g,kids:f,miss:B})=>`
            <div class="dash-mini-card">
              <div class="dash-mini-top">
                <span class="dash-mini-name">${ws(p)}</span>
                ${g?`<span class="dash-mini-when">${b(g)}</span>`:""}
              </div>
              <div class="dash-mini-meta">${b(f||"—")}${B?` · <span class="dash-mini-missing">⚠ ${o("dash_attn_needs_info")}</span>`:""}</div>
            </div>
          `).join("")}
        </div>
      </div>

    </div>
  `}function Ri(){const e=fs(Ot()),t=oe==="admin",s=t?`<tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
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
      </tr>`;function n(i,r){const l=(i.payments||{})[k]||{};return l[r]!=null?l[r]:""}const a="width: 95%; padding: 0.3rem 0.35rem; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-primary); color: var(--text-primary); font-size: 0.75rem;";return`
    <div class="dash-panel">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.75rem;">
        <h3 class="dash-panel-title" style="margin-bottom: 0; border-bottom: none; padding-bottom: 0;">${o("dash_coach_roster_title")} (${e.length} athletes)</h3>
        ${zi(k)}
      </div>
      <div class="dash-panel-body">
        ${e.length===0?`<p class="dash-empty">${o("dash_coach_no_swimmers")}</p>`:`
        <div class="roster-table-wrapper" style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.8rem; min-width: ${t?"950px":"auto"};">
          <thead>${s}</thead>
          <tbody>
            ${e.map(i=>{const r=i.dob?Math.floor((new Date-new Date(i.dob))/315576e5):"—";return t?`
                  <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 0.4rem 0.5rem; font-weight: 500; white-space: nowrap;">${[i.firstName,i.lastName].filter(Boolean).join(" ")}</td>
                    <td style="padding: 0.4rem 0.5rem;">${r}</td>
                    <td style="padding: 0.4rem 0.5rem;">${i.gender||"—"}</td>
                    <td style="padding: 0.2rem 0.3rem;">
                      <input type="number" step="0.01" min="0"
                        class="roster-pmt-input"
                        data-reg-id="${i._regId}"
                        data-swimmer-index="${i._swimmerIndex}"
                        data-field="amount1"
                        data-season="${k}"
                        value="${n(i,"amount1")}"
                        onchange="window.__updateSwimmerPayment(this)"
                        placeholder="0.00"
                        style="${a}" />
                    </td>
                    <td style="padding: 0.2rem 0.3rem;">
                      <input type="date"
                        class="roster-pmt-input"
                        data-reg-id="${i._regId}"
                        data-swimmer-index="${i._swimmerIndex}"
                        data-field="date1"
                        data-season="${k}"
                        value="${n(i,"date1")}"
                        onchange="window.__updateSwimmerPayment(this)"
                        style="${a}" />
                    </td>
                    <td style="padding: 0.2rem 0.3rem;">
                      <input type="number" step="0.01" min="0"
                        class="roster-pmt-input"
                        data-reg-id="${i._regId}"
                        data-swimmer-index="${i._swimmerIndex}"
                        data-field="amount2"
                        data-season="${k}"
                        value="${n(i,"amount2")}"
                        onchange="window.__updateSwimmerPayment(this)"
                        placeholder="0.00"
                        style="${a}" />
                    </td>
                    <td style="padding: 0.2rem 0.3rem;">
                      <input type="date"
                        class="roster-pmt-input"
                        data-reg-id="${i._regId}"
                        data-swimmer-index="${i._swimmerIndex}"
                        data-field="date2"
                        data-season="${k}"
                        value="${n(i,"date2")}"
                        onchange="window.__updateSwimmerPayment(this)"
                        style="${a}" />
                    </td>
                    <td style="padding: 0.2rem 0.3rem;">
                      <input type="number" step="0.01" min="0"
                        class="roster-pmt-input"
                        data-reg-id="${i._regId}"
                        data-swimmer-index="${i._swimmerIndex}"
                        data-field="amount3"
                        data-season="${k}"
                        value="${n(i,"amount3")}"
                        onchange="window.__updateSwimmerPayment(this)"
                        placeholder="0.00"
                        style="${a}" />
                    </td>
                    <td style="padding: 0.2rem 0.3rem;">
                      <input type="date"
                        class="roster-pmt-input"
                        data-reg-id="${i._regId}"
                        data-swimmer-index="${i._swimmerIndex}"
                        data-field="date3"
                        data-season="${k}"
                        value="${n(i,"date3")}"
                        onchange="window.__updateSwimmerPayment(this)"
                        style="${a}" />
                    </td>
                  </tr>
                `:`
                  <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 1rem; font-weight: 500;">${[i.firstName,i.lastName].filter(Boolean).join(" ")}</td>
                    <td style="padding: 1rem;">${i.parentName}</td>
                    <td style="padding: 1rem;">${r}</td>
                    <td style="padding: 1rem;">${i.gender||"—"}</td>
                    <td style="padding: 1rem;">${i.usaSwimmingId||"—"}</td>
                  </tr>
                `}).join("")}
          </tbody>
        </table>
        </div>
        ${t?`<p class="roster-payment-note">${o("dash_coach_roster_payment_note")}</p>`:""}
        `}
      </div>
    </div>
  `}function oa(e){const t=Ve,s=d=>(Number(d.balance)||0)+(Number(d.deposit1Amount)||0)+(Number(d.deposit2Amount)||0)+(Number(d.deposit3Amount)||0),n=new Map;for(const d of Ce){if(Xe(d)!==e)continue;const l=d.feeData;if(!(!l||!l.swimmers||l.swimmers.length===0))for(const A of l.swimmers){const m=t(A.name);if(!m)continue;const c=n.get(m),u=Number(A.total)||0;c?(c.totalFee+=u,c.meetCount+=1,c.meets.push({meetName:d.name||"Unnamed Meet",total:u}),A.name.trim().length>c.displayName.length&&(c.displayName=A.name.trim())):n.set(m,{displayName:A.name.trim(),totalFee:u,meetCount:1,meets:[{meetName:d.name||"Unnamed Meet",total:u}]})}}const a=new Map;for(const d of We){if(d.season!==e)continue;const l=t(d.swimmerName);l&&a.set(l,{id:d.id,total:s(d)})}const i=[];for(const[d,l]of n){const A=a.get(d)||{id:null,total:0};i.push({normalizedName:d,displayName:l.displayName,totalFee:l.totalFee,deposit:A.total,depositId:A.id,balance:A.total-l.totalFee,meetCount:l.meetCount,meets:l.meets}),a.delete(d)}for(const[d,l]of a){const A=We.find(m=>t(m.swimmerName)===d&&m.season===e);i.push({normalizedName:d,displayName:A?A.swimmerName:d,totalFee:0,deposit:l.total,depositId:l.id,balance:l.total,meetCount:0,meets:[]})}const r=Mn(ce);return i.sort((d,l)=>Rn(d.displayName,l.displayName,r)),i}function Ti(){const e=oa(k),t=e.reduce((r,d)=>r+d.totalFee,0),s=e.reduce((r,d)=>r+d.deposit,0),n=e.filter(r=>r.balance<0).length,a=r=>ct(r),i=e.length>0;return`
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem;">
      ${pa(k)}
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

    ${i?`
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
              ${e.map((r,d)=>`
                <tr class="fee-summary-main-row fee-summary-row ${r.balance<0?"fee-summary-negative":""}"
                    data-fee-index="${d}" ${r.meets&&r.meets.length>0?'title="Click to see meet details"':""}>
                  <td><span class="fee-summary-expand-icon">${r.meets&&r.meets.length>0?"▶":""}</span></td>
                  <td class="fee-summary-name">${b(r.displayName)}</td>
                  <td>${a(r.deposit)}</td>
                  <td>${a(r.totalFee)}</td>
                  <td>${r.meetCount}</td>
                  <td class="fee-summary-balance" style="font-weight: 700; ${r.balance<0?"color: var(--color-accent);":"color: #16A34A;"}">${a(r.balance)}</td>
                </tr>
                ${r.meets&&r.meets.length>0?`
                <tr class="fee-summary-detail-row" data-fee-detail="${d}">
                  <td colspan="6" class="fee-summary-detail-cell">
                    <table class="fee-summary-mini-table">
                      ${r.meets.map(l=>`
                        <tr>
                          <td class="mini-meet-name">${b(l.meetName)}</td>
                          <td class="mini-meet-fee">${a(l.total)}</td>
                        </tr>
                      `).join("")}
                      <tr class="mini-meet-total">
                        <td>${o("dash_fee_summary_total_fee")}</td>
                        <td class="mini-meet-fee">${a(r.totalFee)}</td>
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
  `}function ra(e){const t=Mn(ce);return We.filter(s=>s.season===e).sort((s,n)=>Rn(s.swimmerName,n.swimmerName,t))}function ia(e){return(Number(e.balance)||0)+(Number(e.deposit1Amount)||0)+(Number(e.deposit2Amount)||0)+(Number(e.deposit3Amount)||0)}function ji(){const e=ra(k),t=a=>a!=null?ct(a):"—",s=a=>a||"—",n=e.length>0;return`
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem;">
      ${Oi(k)}
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
              ${e.map(a=>{const i=ia(a);return`
                <tr id="${"dep-row-"+a.id}" class="deposits-row">
                  <td class="deposits-name">${b(a.swimmerName)}</td>
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
                  <td class="deposits-total" style="font-weight: 700;">${t(i)}</td>
                  <td class="deposits-actions">
                    <button class="deposits-edit-btn" data-id="${a.id}">✎</button>
                    <button class="deposits-save-btn" data-id="${a.id}" style="display:none;">✓</button>
                    <button class="deposits-cancel-btn" data-id="${a.id}" style="display:none;">✕</button>
                    <button class="deposits-delete-btn" data-id="${a.id}" data-name="${b(a.swimmerName)}" style="color: var(--color-accent);">&times;</button>
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
          No deposit records for ${b(k)}.<br>
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
  `}function Oi(e){const t=wt(),s=e||k||_t();return`
    <div class="season-selector">
      <label class="season-selector-label">${o("dash_season_label")}:</label>
      <select id="deposits-season-select" class="season-select">
        ${t.map(n=>`<option value="${n}" ${n===s?"selected":""}>${n}</option>`).join("")}
      </select>
    </div>
  `}function zi(e){const t=wt(),s=e||k||_t();return`
    <div class="season-selector">
      <label class="season-selector-label">${o("dash_season_label")}:</label>
      <select id="roster-season-select" class="season-select">
        ${t.map(n=>`<option value="${n}" ${n===s?"selected":""}>${n}</option>`).join("")}
      </select>
    </div>
  `}function nn(e){switch(e){case"no-data-rows":return o("dash_fee_import_no_data_rows");case"need-name-balance":return o("dash_fee_import_need_name_balance");case"need-name-amount":return o("dash_fee_import_need_name_amount");default:return o("dash_fee_summary_deposit_parse_error")}}function ct(e){const t=Number(e)||0;return(t<0?"-$":"$")+Math.abs(t).toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2})}function la(e){if(!e||e.length===0)return"";const t=e.map(s=>`<code>${b(s.field)}</code> ← ${b(s.letter)} ("${b(s.label)}")`);return`<p class="csv-import-summary">${o("dash_fee_import_columns_detected")}: ${t.join(" · ")}</p>`}function Ui(e){const t=String(e).match(/^deposit([123])(Amount|Date)$/);return t?`D${t[1]} ${t[2]==="Amount"?"amt":"date"}`:e}async function da(e){if(!e||e.length===0)return 0;const t={updatedAt:new Date,updatedBy:(N==null?void 0:N.email)||"unknown"},s=is(E);for(const n of e)n.existingId?s.update(M(E,"deposits",n.existingId),{...n.fields,...t}):s.set(M(ae(E,"deposits")),{swimmerName:n.swimmerName,season:k,balance:0,deposit1Amount:null,deposit1Date:null,deposit2Amount:null,deposit2Date:null,deposit3Amount:null,deposit3Date:null,...n.fields,...t});return await s.commit(),e.length}function Aa({title:e,filename:t,validCount:s,summaryHtml:n,mappingHtml:a,tableHtml:i,errors:r,skipped:d,confirmLabel:l,confirmId:A,cancelId:m,onConfirm:c}){var g;const u=r||[],y=d||[],p=document.createElement("div");p.className="confirm-overlay",p.innerHTML=`
    <div class="confirm-modal csv-import-modal" style="max-width: 900px;">
      <h3 class="confirm-title">${b(e)}</h3>
      <p class="csv-import-filename">${o("dash_fee_summary_deposit_import_file")}: <strong>${b(t)}</strong></p>
      <p class="csv-import-summary">${o("dash_fee_summary_deposit_import_summary",{valid:s,error:u.length})}</p>
      <p class="csv-import-summary" style="color: var(--text-muted);">${o("dash_fee_import_season_note",{season:b(k)})}</p>
      ${n||""}
      ${a||""}
      ${i||""}
      ${u.length>0?`<div class="csv-error-block"><p class="csv-error-title">${o("dash_fee_summary_deposit_import_errors")}</p>${u.map(f=>`<p class="csv-error-item">${f.rowNum?`Row ${f.rowNum}: `:""}${b(f.reason)}</p>`).join("")}</div>`:""}
      ${y.length>0?`<div class="csv-error-block" style="border-color: #d97706;"><p class="csv-error-title" style="color: #d97706;">${o("dash_fee_import_skipped_title")}</p>${y.map(f=>`<p class="csv-error-item">${b(f.reason)}</p>`).join("")}</div>`:""}
      ${s===0?`<p class="csv-no-valid">${o("dash_fee_summary_deposit_import_no_valid")}</p>`:""}
      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="${m}">${o("dash_fee_summary_deposit_import_cancel")}</button>
        ${s>0?`<button class="btn btn-primary btn-sm" id="${A}">${b(l)}</button>`:""}
      </div>
    </div>`,document.body.appendChild(p),p.querySelector("#"+m).addEventListener("click",()=>p.remove()),(g=p.querySelector("#"+A))==null||g.addEventListener("click",()=>{p.remove(),c()}),p.addEventListener("click",f=>{f.target===p&&p.remove()})}const as=e=>o(e?"dash_fee_import_will_create":"dash_fee_import_will_update"),ca=e=>{const t=e.filter(s=>s.willCreate).length;return`<p class="csv-import-summary">${o("dash_fee_import_plan_create_update",{create:t,update:e.length-t})}</p>`};async function Hi(e){const t=window.XLSX;if(!t)return alert("Excel parser not loaded."),null;try{const s=await e.arrayBuffer(),n=t.read(new Uint8Array(s),{type:"array"}),a=n.Sheets[n.SheetNames[0]],i=t.utils.sheet_to_json(a,{header:1,defval:null});return Yo(i)}catch(s){return console.error("Error parsing carry-over Excel:",s),null}}function qi(e,t){const s=Vo(e.valid,We,k),n=s.length>0?`
        <div class="csv-preview-wrapper" style="max-height: 350px;">
          <table class="csv-preview-table" style="font-size: 0.78rem;">
            <thead><tr>
              <th>${o("dash_fee_summary_deposit_header_name")}</th>
              <th>${o("dash_fee_import_col_will")}</th>
              <th>${o("dash_fee_import_col_before")}</th>
              <th>${o("dash_fee_summary_balance")} (${o("dash_fee_import_col_after")})</th>
            </tr></thead>
            <tbody>${s.map(a=>`<tr>
              <td>${b(a.swimmerName)}</td>
              <td>${as(a.willCreate)}</td>
              <td style="color: var(--text-muted);">${a.previousBalance===null?"—":ct(a.previousBalance)}</td>
              <td style="font-weight: 700; ${a.balance<0?"color: var(--color-accent);":""}">${ct(a.balance)}</td>
            </tr>`).join("")}</tbody>
          </table>
        </div>`:"";Aa({title:o("dash_fee_import_balance_title"),filename:t,validCount:s.length,summaryHtml:ca(s),mappingHtml:la(e.columns),tableHtml:n,errors:e.errors,skipped:[],confirmLabel:o("dash_fee_import_confirm_balance",{count:s.length}),confirmId:"carryover-import-confirm",cancelId:"carryover-import-cancel",onConfirm:()=>Pi(s)})}async function Pi(e){if(!(!e||e.length===0))try{const t=await da(Go(e));Dt(`Updated balance for ${t} swimmer(s) in ${k}.`)}catch(t){console.error("Carry-over import failed:",t),Dt("Failed to import: "+(t.message||""),!0)}}async function Ki(e){const t=window.XLSX;if(!t)return alert("Excel parser not loaded."),null;try{const s=await e.arrayBuffer(),n=t.read(new Uint8Array(s),{type:"array"}),a=n.Sheets[n.SheetNames[0]],i=t.utils.sheet_to_json(a,{header:1,defval:null});return Wo(i)}catch(s){return console.error("Error parsing deposit detail Excel:",s),null}}function Yi(e,t){const{rows:s,skipped:n,slotErrors:a}=Zo(e,We,k),i=e.mode==="simple",r=(e.columns||[]).filter(l=>/^deposit[123](Amount|Date)$/.test(l.field)).map(l=>l.field);let d="";s.length>0&&(i?d=`
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
              <td>${b(l.swimmerName)}</td>
              <td>${as(l.willCreate)}</td>
              <td>${b(l.targetLabel)}</td>
              <td style="font-weight: 700;">${ct(l.amount)}</td>
              <td>${l.date?b(l.date):"—"}</td>
            </tr>`).join("")}</tbody>
          </table>
        </div>`:d=`
        <div class="csv-preview-wrapper" style="max-height: 350px;">
          <table class="csv-preview-table" style="font-size: 0.75rem;">
            <thead><tr>
              <th>${o("dash_fee_summary_deposit_header_name")}</th>
              <th>${o("dash_fee_import_col_will")}</th>
              ${r.map(l=>`<th>${Ui(l)}</th>`).join("")}
            </tr></thead>
            <tbody>${s.map(l=>`<tr>
              <td>${b(l.swimmerName)}</td>
              <td>${as(l.willCreate)}</td>
              ${r.map(A=>`<td>${l[A]==null||l[A]===""?"—":A.endsWith("Amount")?ct(l[A]):b(l[A])}</td>`).join("")}
            </tr>`).join("")}</tbody>
          </table>
        </div>`),Aa({title:o("dash_fee_import_deposit_title"),filename:t,validCount:s.length,summaryHtml:ca(s),mappingHtml:la(e.columns),tableHtml:d,errors:[...e.errors||[],...a],skipped:n,confirmLabel:o("dash_fee_import_confirm_deposit",{count:s.length}),confirmId:"detail-import-confirm",cancelId:"detail-import-cancel",onConfirm:()=>Vi(e,s)})}async function Vi(e,t){if(!(!t||t.length===0))try{const s=await da(Jo(e,t));Dt(`Updated deposit details for ${s} swimmer(s) in ${k}.`)}catch(s){console.error("Deposit detail import failed:",s),Dt("Failed to import: "+(s.message||""),!0)}}function Gi(){document.querySelectorAll(".deposits-edit-btn").forEach(e=>{e.addEventListener("click",()=>{const t=e.closest("tr");an(t,!0)})}),document.querySelectorAll(".deposits-save-btn").forEach(e=>{e.addEventListener("click",async()=>{const t=e.dataset.id,s=e.closest("tr");if(!t||!s)return;const n=c=>{const u=s.querySelector(c);return u?u.value:null},a=parseFloat(n(".deposits-balance .dep-edit-field"))||0,i=n(".deposits-d1amt .dep-edit-field"),r=n(".deposits-d1date .dep-edit-field"),d=n(".deposits-d2amt .dep-edit-field"),l=n(".deposits-d2date .dep-edit-field"),A=n(".deposits-d3amt .dep-edit-field"),m=n(".deposits-d3date .dep-edit-field");try{await be(M(E,"deposits",t),{balance:a,deposit1Amount:i?parseFloat(i):null,deposit1Date:r||null,deposit2Amount:d?parseFloat(d):null,deposit2Date:l||null,deposit3Amount:A?parseFloat(A):null,deposit3Date:m||null,updatedAt:new Date,updatedBy:(N==null?void 0:N.email)||"unknown"})}catch(c){console.error("Error saving deposit:",c),alert("Failed to save deposit.")}})}),document.querySelectorAll(".deposits-cancel-btn").forEach(e=>{e.addEventListener("click",()=>{const t=e.closest("tr");an(t,!1)})}),document.querySelectorAll(".deposits-delete-btn").forEach(e=>{e.addEventListener("click",async()=>{const t=e.dataset.id,s=e.dataset.name;if(t&&confirm(`Delete deposit record for ${s}?`))try{await He(M(E,"deposits",t))}catch(n){console.error("Error deleting deposit:",n),alert("Failed to delete deposit.")}})})}function an(e,t){if(!e)return;const s=e.querySelectorAll(".dep-view"),n=e.querySelectorAll(".dep-edit-field"),a=e.querySelector(".deposits-edit-btn"),i=e.querySelector(".deposits-save-btn"),r=e.querySelector(".deposits-cancel-btn"),d=e.querySelector(".deposits-delete-btn");s.forEach(l=>l.style.display=t?"none":""),n.forEach(l=>l.style.display=t?"":"none"),a&&(a.style.display=t?"none":""),i&&(i.style.display=t?"":"none"),r&&(r.style.display=t?"":"none"),d&&(d.style.display=t?"none":"")}function Wi(){const e=ra(k),t=["Name","Balance","Deposit 1 Amount","Deposit 1 Date","Deposit 2 Amount","Deposit 2 Date","Deposit 3 Amount","Deposit 3 Date","Total"],s=e.map(l=>[l.swimmerName||"",l.balance||0,l.deposit1Amount||"",l.deposit1Date||"",l.deposit2Amount||"",l.deposit2Date||"",l.deposit3Amount||"",l.deposit3Date||"",ia(l)]),n=l=>'"'+String(l).replace(/"/g,'""')+'"',a=[t.map(n).join(","),...s.map(l=>l.map(n).join(","))].join(`
`),i=new Blob([a],{type:"text/csv;charset=utf-8;"}),r=URL.createObjectURL(i),d=document.createElement("a");d.href=r,d.download=`dragon-deposits-${k}.csv`,document.body.appendChild(d),d.click(),document.body.removeChild(d),URL.revokeObjectURL(r)}function Xi(){const e=oa(k),t=["Swimmer","Deposit","Total Meet Fee","Meets","Balance"],s=e.map(l=>[l.displayName,l.deposit,l.totalFee,l.meetCount,l.balance]),n=l=>'"'+String(l).replace(/"/g,'""')+'"',a=[t.map(n).join(","),...s.map(l=>l.map(n).join(","))].join(`
`),i=new Blob([a],{type:"text/csv;charset=utf-8;"}),r=URL.createObjectURL(i),d=document.createElement("a");d.href=r,d.download=`dragon-fee-summary-${k}.csv`,document.body.appendChild(d),d.click(),document.body.removeChild(d),URL.revokeObjectURL(r)}function Zi(){const e=Ce.filter(t=>Xe(t)===k).sort((t,s)=>String(s.startDate||s.date||"").localeCompare(String(t.startDate||t.date||"")));return(!ge||!e.some(t=>t.id===ge))&&(ge=(e.filter(s=>Cs(s).bucket==="past")[0]||e[0]||{}).id||null),e}function Ji(){const e=wt(),t=k||_t();return`
    <div class="season-selector">
      <label class="season-selector-label">${o("dash_season_label")}:</label>
      <select id="volunteer-season-select" class="season-select">
        ${e.map(s=>`<option value="${s}" ${s===t?"selected":""}>${s}</option>`).join("")}
      </select>
    </div>
  `}function Qe(e){return(Number(e)||0).toLocaleString(void 0,{maximumFractionDigits:2})}function Qi(){const e=oe==="admin",t=Zi(),s=ce.length>0,n=On({meets:Ce,registrations:ce,hours:rt,season:k,meetSeasonOf:Xe}),a=rr(n),i=n.filter(m=>m.totalHours>0),r=m=>{const c=m.kidCount===0?'<span class="vol-muted">0</span>':String(m.kidCount),u=m.kids.length?b(m.kids.join(", ")):'<span class="vol-muted">—</span>',y=m.meets.length>0,p=m.totalHours>0?"":' style="display: none;"';return`
      <tr class="fee-summary-main-row vol-summary-row${m.totalHours>0?"":" vol-zero-row"}"
          data-vol-family="${m.familyId}" ${y?'title="Click to see the per-meet breakdown"':""}${p}>
        <td><span class="fee-summary-expand-icon">${y?"▶":""}</span></td>
        <td class="fee-summary-name">${b(m.label||"—")}</td>
        <td>${c}</td>
        <td class="vol-kid-names">${u}</td>
        <td>${m.meetCount}</td>
        <td style="font-weight: 700;">${Qe(m.totalHours)}</td>
      </tr>
      ${y?`
      <tr class="fee-summary-detail-row vol-detail-row" data-vol-detail="${m.familyId}"${p}>
        <td colspan="6" class="fee-summary-detail-cell">
          <table class="fee-summary-mini-table">
            ${m.meets.map(g=>`
              <tr>
                <td class="mini-meet-name">${b(g.meetName)}${g.startDate?` <span class="vol-muted">${b(String(g.startDate))}</span>`:""}${g.note?` <span class="vol-muted">— ${b(g.note)}</span>`:""}</td>
                <td class="mini-meet-fee">${Qe(g.hours)}</td>
              </tr>
            `).join("")}
            <tr class="mini-meet-total">
              <td>${o("dash_volunteer_th_total_hours")}</td>
              <td class="mini-meet-fee">${Qe(m.totalHours)}</td>
            </tr>
          </table>
        </td>
      </tr>`:""}
    `},d=ge?ar({registrations:ce,hours:rt,meetId:ge}):[],l=ge?or(rt,ge):0,A=m=>{const c=m.kids.length?b(m.kids.join(", ")):'<span class="vol-muted">—</span>',u=e?`<input type="number" min="0" step="0.5" inputmode="decimal"
                class="vol-input vol-hours-input" data-family-id="${m.familyId}"
                value="${m.hours==null?"":m.hours}" placeholder="0"
                aria-label="${o("dash_volunteer_th_hours")}" />`:m.hours==null?'<span class="vol-muted">—</span>':Qe(m.hours),y=e?`<input type="text" class="vol-input vol-note-input" data-family-id="${m.familyId}"
                value="${b(m.note)}" placeholder="${o("dash_volunteer_note_placeholder")}"
                aria-label="${o("dash_volunteer_th_note")}" />`:b(m.note||"—");return`
      <tr class="vol-entry-row" data-family-id="${m.familyId}"
          data-vol-search="${b(m.search)}" data-vol-entered="${m.hasRecord?"1":"0"}">
        <td class="vol-entry-family">${b(m.label||"—")}</td>
        <td class="vol-entry-kids">${c}</td>
        <td class="vol-entry-hours">${u}</td>
        <td class="vol-entry-note">${y}</td>
        <td class="vol-status" data-family-id="${m.familyId}">${m.updatedBy?b(m.updatedBy):"—"}</td>
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
        <div class="dash-stat-number">${Qe(a.totalHours)}</div>
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
      <h3 class="dash-panel-title">${o("dash_volunteer_summary_title")} — ${b(k)}</h3>
      ${s?`
        ${i.length===0?`<p class="dash-empty">${o("dash_volunteer_empty",{season:k})}</p>`:""}
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
              ${n.map(r).join("")}
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
        <p class="dash-empty">${o("dash_volunteer_no_meets",{season:k})}</p>
      `:`
        <div class="vol-entry-toolbar">
          <div class="season-selector">
            <label class="season-selector-label">${o("dash_volunteer_meet_label")}:</label>
            <select id="volunteer-meet-select" class="season-select">
              ${t.map(m=>`
                <option value="${m.id}" ${m.id===ge?"selected":""}>
                  ${b(m.name||"Unnamed Meet")}${m.startDate?` — ${b(m.startDate)}`:""}
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
          ${o("dash_volunteer_meet_total")}: <strong>${Qe(l)}</strong>
          <span id="volunteer-no-match" style="display: none; color: var(--text-muted); margin-left: 1rem;">${o("dash_volunteer_no_match")}</span>
        </p>`}
      `}
    </div>
  `}async function el({familyId:e,meetId:t,hours:s,note:n,statusEl:a}){if(oe!=="admin")return console.warn("Non-admin attempted to save volunteer hours — blocked"),a&&(a.textContent=o("dash_volunteer_admin_only")),!1;if(!e||!t)return!1;const i=String(s??"").trim();if(i!==""&&Ge(i)==null)return a&&(a.textContent=o("dash_volunteer_invalid_hours")),!1;const r=Ge(i),d=String(n??"").trim(),l=tr(t,e),A=rt.find(m=>m.id===l);a&&(a.textContent=o("dash_volunteer_saving"));try{if(r==null&&!d)return A&&await He(M(E,Ct,l)),!0;const m=Ce.find(u=>u.id===t),c=ce.find(u=>u.id===e);return await Ee(M(E,Ct,l),{meetId:t,meetName:m&&m.name||"",season:m&&Xe(m)||k,familyId:e,familyLabel:c?tl(c):"",parentEmails:c?sl(c):[],hours:r,note:d||null,updatedAt:new Date,updatedBy:(N==null?void 0:N.displayName)||(N==null?void 0:N.email)||"unknown",updatedByEmail:(N==null?void 0:N.email)||""},{merge:!0}),!0}catch(m){return console.error("Error saving volunteer hours:",m),a&&(a.textContent=o("dash_volunteer_save_failed")),alert("Failed to save volunteer hours. Please try again."),!1}}function tl(e){const t=s=>[s==null?void 0:s.firstName,s==null?void 0:s.lastName].filter(Boolean).join(" ").trim();return[...new Set([t(e==null?void 0:e.parent),t(e==null?void 0:e.spouse)].filter(Boolean))].join(" & ")}function sl(e){var t,s;return[...new Set([(t=e==null?void 0:e.parent)==null?void 0:t.email,(s=e==null?void 0:e.spouse)==null?void 0:s.email,...(e==null?void 0:e.parentEmails)||[]].map(n=>String(n||"").toLowerCase().trim()).filter(Boolean))]}async function nl(e){var l,A;const t=e.closest("tr");if(!t)return;const s=ge,n=t.dataset.familyId,a=((l=t.querySelector(".vol-hours-input"))==null?void 0:l.value)??"",i=((A=t.querySelector(".vol-note-input"))==null?void 0:A.value)??"",r=t.querySelector(".vol-status");await el({familyId:n,meetId:s,hours:a,note:i,statusEl:r})&&(t.dataset.volEntered=Ge(a)!=null||i.trim()?"1":"0",r&&(r.textContent=o("dash_volunteer_saved")))}function on(){var a,i;const e=(((a=document.getElementById("volunteer-search"))==null?void 0:a.value)||"").trim().toLowerCase(),t=!!((i=document.getElementById("volunteer-only-entered"))!=null&&i.checked);let s=0;document.querySelectorAll(".vol-entry-row").forEach(r=>{const d=!e||(r.dataset.volSearch||"").includes(e),l=!t||r.dataset.volEntered==="1",A=d&&l;r.style.display=A?"":"none",A&&s++});const n=document.getElementById("volunteer-no-match");n&&(n.style.display=s===0?"":"none")}function ma(e,t){const s=new Blob([e],{type:"text/csv;charset=utf-8;"}),n=URL.createObjectURL(s),a=document.createElement("a");a.href=n,a.download=t,document.body.appendChild(a),a.click(),document.body.removeChild(a),URL.revokeObjectURL(n)}function ua(){return On({meets:Ce,registrations:ce,hours:rt,season:k,meetSeasonOf:Xe})}function al(){ma(ir(ua()),`dragon-volunteer-hours-${k}.csv`)}function ol(){ma(lr(ua()),`dragon-volunteer-hours-detail-${k}.csv`)}function rl(){var e,t,s,n,a,i,r,d;(e=document.getElementById("volunteer-season-select"))==null||e.addEventListener("change",l=>{k=l.target.value,ge=null,G()}),(t=document.getElementById("volunteer-meet-select"))==null||t.addEventListener("change",l=>{ge=l.target.value,G()}),(s=document.getElementById("volunteer-search"))==null||s.addEventListener("input",on),(n=document.getElementById("volunteer-only-entered"))==null||n.addEventListener("change",on),(a=document.getElementById("volunteer-export-btn"))==null||a.addEventListener("click",al),(i=document.getElementById("volunteer-export-detail-btn"))==null||i.addEventListener("click",ol),(r=document.getElementById("volunteer-show-zero"))==null||r.addEventListener("change",l=>{document.querySelectorAll(".vol-zero-row").forEach(A=>{A.style.display=l.target.checked?"":"none"})}),document.querySelectorAll(".vol-input").forEach(l=>{l.addEventListener("change",()=>nl(l)),l.addEventListener("keydown",A=>{A.key==="Enter"&&(A.preventDefault(),l.blur())})}),(d=document.querySelector(".vol-summary-table tbody"))==null||d.addEventListener("click",l=>{const A=l.target.closest(".vol-summary-row");if(!A)return;const m=document.querySelector(`.vol-detail-row[data-vol-detail="${A.dataset.volFamily}"]`);if(!m)return;const c=A.querySelector(".fee-summary-expand-icon"),u=m.classList.toggle("expanded");A.classList.toggle("expanded-row",u),c&&(c.classList.toggle("expanded",u),c.textContent=u?"▼":"▶")})}function b(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function _t(){const e=new Date,t=e.getFullYear();return e.getMonth()+1>=9?`${t}-${t+1}`:`${t-1}-${t}`}function il(e){if(!e)return null;const t=String(e).trim(),s=t.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);if(s){const i=Number(s[1]);return Number(s[2])>=9?`${i}-${i+1}`:`${i-1}-${i}`}const n=new Date(t);return Number.isNaN(n.getTime())?null:n.getMonth()+1>=9?`${n.getFullYear()}-${n.getFullYear()+1}`:`${n.getFullYear()-1}-${n.getFullYear()}`}function Xe(e){return e.season||il(e.startDate||e.date||null)}function wt(){const e=new Set;for(const a of Ce)a.season&&e.add(a.season);for(const a of We)a.season&&e.add(a.season);const t=new Date,s=t.getMonth()>=8?t.getFullYear():t.getFullYear()-1,n=2025;for(let a=Math.max(n,s-1);a<=s+2;a++)e.add(`${a}-${a+1}`);return Array.from(e).sort().reverse()}function pa(e){const t=wt(),s=e||k||_t();return`
    <div class="season-selector">
      <label class="season-selector-label">${o("dash_season_label")}:</label>
      <select id="season-select" class="season-select">
        ${t.map(n=>`<option value="${n}" ${n===s?"selected":""}>${n}</option>`).join("")}
      </select>
    </div>
  `}window.__updateSwimmerPayment=async function(e){var d,l;if(oe!=="admin"){console.warn("Non-admin attempted to modify payment field — blocked"),G();return}const t=e.dataset.regId,s=parseInt(e.dataset.swimmerIndex),n=e.dataset.field,a=e.dataset.season||k;let i=e.value;n.startsWith("amount")?(i=i===""?null:parseFloat(i),i!=null&&(isNaN(i)||i<0)&&(i=null)):n.startsWith("date")&&(i=i||null);const r=ce.find(A=>A.id===t);if((d=r==null?void 0:r.swimmers)!=null&&d[s]){const A=r.swimmers[s],m={...A.payments||{}},c={...m[a]||{}};c[n]=i,m[a]=c,r.swimmers[s]={...A,payments:m}}try{const A=M(E,"registrations",t),m=await he(A);if(!m.exists())return;const c=[...m.data().swimmers];if(c[s]){const u=c[s],y={...u.payments||{}},p={...y[a]||{}};p[n]=i,y[a]=p,c[s]={...u,payments:y},await be(A,{swimmers:c})}}catch(A){console.error("Error updating swimmer payment field:",A);const m=ce.find(c=>c.id===t);if((l=m==null?void 0:m.swimmers)!=null&&l[s]){const c=await he(M(E,"registrations",t));c.exists()&&(m.swimmers[s]={...c.data().swimmers[s]})}G()}};function ll(){if(!T)return`<div class="dash-panel" style="text-align: center; padding: 3rem;">
      <p class="dash-empty">${o("dash_profile_no_reg")}</p>
      <p style="margin-top: 1rem;"><a href="/registration.html" class="btn btn-primary">${o("dash_profile_complete_reg")}</a></p>
    </div>`;const e=T.parent||{},t=T.spouse,s=T.swimmers||[],n=s.filter(i=>!i.deleted),a=T.emergencyContact||{};return`
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
          ${n.length===0?`<p class="dash-empty">${o("dash_profile_no_swimmers")}</p>`:s.map((i,r)=>i.deleted?"":`

            <div class="swimmer-profile-card">
              <div class="swimmer-profile-info">
                <strong>${[i.firstName,i.middleName,i.lastName].filter(Boolean).join(" ")}</strong>
                <div class="swimmer-profile-meta">
                  <span>${i.gender||"—"}</span>
                  <span>DOB: ${i.dob||"—"}</span>
                  ${i.joinDate?`<span>Joined: ${i.joinDate}</span>`:""}
                </div>
                <div class="swimmer-usa-id" style="display: flex; align-items: center; gap: 8px; margin-top: 6px; flex-wrap: wrap;">
                  <span style="font-size: 0.8rem; color: var(--text-muted);">USA ID:</span>
                  <strong style="font-size: 0.8rem;">${i.usaSwimmingId?b(i.usaSwimmingId):"—"}</strong>
                  <button type="button" class="btn btn-outline btn-sm usa-id-edit-btn" data-index="${r}" style="padding: 0 8px; font-size: 0.7rem;">${i.usaSwimmingId?o("dash_profile_edit"):o("dash_profile_usa_add")}</button>
                  <span class="usa-id-edit-form" data-usa-form="${r}" style="display: none; align-items: center; gap: 6px;">
                    <input type="text" class="form-input usa-id-input" data-input="${r}" value="${b(i.usaSwimmingId||"")}" placeholder="USA Swimming ID" style="width: 170px; padding: 2px 8px; font-size: 0.75rem;" />
                    <button type="button" class="btn btn-primary btn-sm usa-id-save-btn" data-index="${r}" style="padding: 0 8px; font-size: 0.7rem;">${o("dash_profile_save")}</button>
                    <button type="button" class="btn btn-outline btn-sm usa-id-cancel-btn" data-index="${r}" style="padding: 0 8px; font-size: 0.7rem;">${o("dash_profile_cancel")}</button>
                  </span>
                </div>
              </div>
              <button class="btn btn-outline btn-sm delete-swimmer-btn" data-index="${r}" style="color: var(--color-accent); border-color: var(--color-accent);">${o("dash_profile_remove")}</button>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `}function dl(){return`
    <div class="dash-panel" style="text-align: center; padding: 4rem 2rem;">
      <div style="font-size: 3rem; margin-bottom: 1rem;">🚧</div>
      <h2 style="font-size: 1.5rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem;">${o("dash_plans_under_construction")}</h2>
      <p style="color: var(--text-secondary);">${o("dash_swimmer_plans_sub")}</p>
    </div>
  `}function rn(e){if(!e)return null;const t=String(e).trim().match(/^(\d{4})[-/.]\d{1,2}[-/.]\d{1,2}/);if(!t)return null;const s=String(t[0]).split(/[-/.]/);return Date.UTC(Number(s[0]),Number(s[1])-1,Number(s[2]))}function Cs(e,t=new Date){const s=Date.UTC(t.getFullYear(),t.getMonth(),t.getDate()),n=rn(e.startDate||e.date),a=rn(e.endDate||e.date||e.startDate);return a!=null&&a<s?{bucket:"past",label:"Completed",cls:"status-completed"}:n!=null&&a!=null&&n<=s&&s<=a?{bucket:"upcoming",label:"In Progress",cls:"status-in-progress"}:{bucket:"upcoming",label:"Upcoming",cls:"status-open"}}function ln(){const e=oe==="admin",t=ye==="coach",s=new Date,n=Ce.filter(A=>Xe(A)===k).sort((A,m)=>String(A.startDate||A.date||"").localeCompare(String(m.startDate||m.date||""))),a=n.map(A=>({meet:A,disp:Cs(A,s)})),i=a.filter(A=>A.disp.bucket==="upcoming"),r=a.filter(A=>A.disp.bucket==="past").reverse(),d=(A,m)=>{const c=m.bucket==="past"?' style="opacity: 0.78;"':"",u=A.sourceUrl?`<span>🔗 <a href="${b(A.sourceUrl)}" target="_blank" rel="noopener noreferrer">Meet Page</a></span>`:"",y=b(A.startDate&&A.endDate?`${A.startDate} – ${A.endDate}`:A.date||""),p=Array.isArray(A.events)&&A.events.length>0,g=p&&A.events.some($=>{var x,D;return!$.relay&&(((x=$.standards)==null?void 0:x.SCY)!=null||((D=$.standards)==null?void 0:D.LCM)!=null)}),f=p&&(t||A.entriesOpenToFamilies===!0),B=p&&!t;return`
        <div class="dash-card"${c}>
          <div class="dash-card-header">
            <h3 class="dash-card-title">${b(A.name||"Unnamed Meet")}</h3>
            <span class="status-badge ${m.cls}">${m.label}</span>
          </div>
          <div class="dash-card-body">
            <div class="dash-card-meta">
              <span>📅 ${y}</span>
              <span>📍 ${b(A.location||"")}</span>
              ${u}
            </div>
            ${g?`<div class="meet-qual-line">⏱ ${o("meet_entries_requires_times")}</div>`:""}
            <div style="display: flex; gap: 0.5rem; margin-top: 1rem; flex-wrap: wrap;">
              ${f?`<button class="btn btn-outline btn-sm meet-entries-btn" data-id="${A.id}">🎽 ${o("meet_entries_open_btn")}</button>`:""}
              ${B?`<a class="btn btn-outline btn-sm meet-sheet-link" href="/meet-print.html?meet=${encodeURIComponent(A.id)}" target="_blank" rel="noopener">🖨 ${o("meet_sheet_open_btn")}</a>`:""}
              ${e?`<button class="btn btn-outline btn-sm meet-fee-btn" data-id="${A.id}" data-name="${b(A.name||"")}">${o("dash_meets_fee")}</button>`:""}
              ${e?`<button class="btn btn-outline btn-sm edit-meet" data-id="${A.id}" data-name="${b(A.name||"")}" data-start="${A.startDate||A.date||""}" data-end="${A.endDate||A.date||""}" data-location="${b(A.location||"")}" data-season="${A.season||k}" data-source="${b(A.sourceUrl||"")}">${o("dash_meets_edit")}</button>`:""}
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
      ${pa(k)}
      ${e?`<button class="btn btn-primary btn-sm" id="add-meet-btn">${o("dash_meets_add")}</button>`:""}
    </div>

    ${e?`
      <div id="add-meet-form" class="dash-panel" style="${te?"":"display: none;"} margin-bottom: 2rem; padding: 1.5rem;">
        <h3 style="margin-bottom: 1rem;" id="meet-form-title">${Ye?o("dash_meets_edit_title"):o("dash_meets_new_title")}</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
          <div>
            <label class="form-label" for="meet-name">${o("dash_meets_name_placeholder")}</label>
            <input type="text" id="meet-name" placeholder="${o("dash_meets_name_placeholder")}" class="form-input" value="${b((te==null?void 0:te.name)||"")}">
          </div>
          <div>
            <label class="form-label" for="meet-start-date">${o("dash_meets_start_date_placeholder")}</label>
            <input type="date" id="meet-start-date" class="form-input" title="${o("dash_meets_start_date_placeholder")}" value="${b((te==null?void 0:te.startDate)||"")}">
          </div>
          <div>
            <label class="form-label" for="meet-end-date">${o("dash_meets_end_date_placeholder")}</label>
            <input type="date" id="meet-end-date" class="form-input" title="${o("dash_meets_end_date_placeholder")}" value="${b((te==null?void 0:te.endDate)||"")}">
          </div>
          <div>
            <label class="form-label" for="meet-location">${o("dash_meets_location_placeholder")}</label>
            <input type="text" id="meet-location" placeholder="${o("dash_meets_location_placeholder")}" class="form-input" value="${b((te==null?void 0:te.location)||"")}">
          </div>
          <div>
            <label class="form-label" for="meet-source">${o("dash_meets_source_placeholder")}</label>
            <input type="url" id="meet-source" placeholder="${o("dash_meets_source_placeholder")}" class="form-input" value="${b((te==null?void 0:te.source)||"")}">
          </div>
          <div>
            <label class="form-label" for="meet-season">${o("dash_season_label")}</label>
            <select id="meet-season" class="form-input">
              ${wt().map(A=>`<option value="${A}" ${A===((te==null?void 0:te.season)||k)?"selected":""}>${A}</option>`).join("")}
            </select>
          </div>
        </div>
        <div style="margin-top: 1rem; display: flex; gap: 1rem; align-items: center;">
          <button class="btn btn-primary btn-sm" id="save-meet-btn">${Ye?o("dash_meets_update"):o("dash_meets_save")}</button>
          <button class="btn btn-outline btn-sm" id="cancel-meet-btn">${o("dash_meets_cancel")}</button>
        </div>
        <p id="meet-form-error" style="display: none; margin-top: 0.75rem; color: var(--color-accent); font-size: var(--fs-sm);"></p>
      </div>
    `:""}

    ${n.length===0?`
      <div class="dash-panel" style="text-align: center; padding: 3rem 2rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">📅</div>
        <p style="color: var(--text-secondary); max-width: 460px; margin: 0 auto;">${o("dash_meets_no_meets_for_season",{season:k})}</p>
        ${e?`<p style="margin: 1rem 0 0;"><button class="btn btn-primary btn-sm" id="add-meet-btn-empty">${o("dash_meets_add")}</button></p>`:""}
      </div>
    `:`
      ${l(i,o("dash_meets_upcoming"))}
      ${l(r,o("dash_meets_past"))}
    `}
  `}function dn(){const e={sessionSlots:vs,enrollments:_s,currentPeriod:es,viewMode:ts,allRegistrations:ce,dbRole:oe,activeSwimmers:ye==="coach"?Ot():[],familyData:T,familyDataId:Be};return ye==="coach"?hr(e):fr(e)}function Al(e,t){const s=document.createElement("div");s.className="confirm-overlay",s.innerHTML=`
    <div class="confirm-modal">
      <h3 class="confirm-title">${o("dash_profile_delete_title")}</h3>
      <p class="confirm-body">${o("dash_profile_delete_body1")} <strong style="color: var(--color-accent, #dc3545);">${e}</strong> ${o("dash_profile_delete_body2")}</p>
      <p class="confirm-warning">${o("dash_profile_delete_warning")}</p>
      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" id="confirm-cancel">${o("dash_profile_delete_cancel")}</button>
        <button class="btn btn-sm" id="confirm-delete" style="background: var(--color-accent, #dc3545); color: white; border: none;">${o("dash_profile_delete_confirm")}</button>
      </div>
    </div>
  `,document.body.appendChild(s),s.querySelector("#confirm-cancel").addEventListener("click",()=>s.remove()),s.querySelector("#confirm-delete").addEventListener("click",async()=>{s.remove();const n=[...T.swimmers];n[t]={...n[t],deleted:!0,deletedAt:new Date().toISOString()};try{await be(M(E,"registrations",Be),{swimmers:n}),T.swimmers=n,K="profile",G()}catch(a){console.error("Error marking swimmer deleted:",a),alert(o("dash_profile_save_failed"))}}),s.addEventListener("click",n=>{n.target===s&&s.remove()})}function An(e){return(e||"").trim().toUpperCase()||null}function cn(e){return/^[0-9A-F]{14}$/.test(e)}async function mn(e,t){const s=(T==null?void 0:T.swimmers)||[];for(let n=0;n<s.length;n++){const a=s[n];if(!(n===t||a.deleted)&&a.usaSwimmingId&&a.usaSwimmingId.toUpperCase()===e)return a}try{const n=await qe(ae(E,"registrations"));for(const a of n.docs){if(a.id===Be)continue;const i=a.data();for(const r of i.swimmers||[])if(!r.deleted&&r.usaSwimmingId&&r.usaSwimmingId.toUpperCase()===e)return r}}catch(n){console.warn("USA ID duplicate check skipped:",n)}return null}function cl(){const e=document.createElement("div");e.className="confirm-overlay",e.innerHTML=`
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
  `,document.body.appendChild(e);const t=e.querySelector("#modal-password-msg");e.querySelector("#modal-password-cancel").addEventListener("click",()=>e.remove()),e.querySelector("#modal-password-submit").addEventListener("click",async()=>{const s=e.querySelector("#modal-current-password").value,n=e.querySelector("#modal-new-password").value,a=e.querySelector("#modal-confirm-password").value;if(t.style.display="none",!s||!n||!a){t.textContent="All fields are required.",t.style.color="var(--color-accent, #DC2626)",t.style.display="block";return}if(n!==a){t.textContent=o("dash_profile_password_mismatch"),t.style.color="var(--color-accent, #DC2626)",t.style.display="block";return}if(n.length<6){t.textContent="Password must be at least 6 characters.",t.style.color="var(--color-accent, #DC2626)",t.style.display="block";return}try{const i=un.credential(N.email,s);await pn(N,i),await fn(N,n),t.textContent=o("dash_profile_password_success"),t.style.color="#16A34A",t.style.display="block",e.querySelector("#modal-current-password").value="",e.querySelector("#modal-new-password").value="",e.querySelector("#modal-confirm-password").value=""}catch(i){console.error("Password update error:",i),i.code==="auth/wrong-password"||i.code==="auth/invalid-credential"?t.textContent=o("dash_profile_password_wrong"):t.textContent=o("dash_profile_password_error")+" "+(i.message||""),t.style.color="var(--color-accent, #DC2626)",t.style.display="block"}}),e.addEventListener("click",s=>{s.target===e&&e.remove()})}function Dt(e,t){const s=document.getElementById("csv-import-status");s&&s.remove();const n=document.createElement("div");n.id="csv-import-status",n.style.cssText=["padding: var(--space-md) var(--space-lg)","border-radius: var(--radius-md)","margin-bottom: var(--space-lg)","font-size: var(--fs-sm)","font-weight: var(--fw-medium)",t?"background: #fef2f2; border: 1px solid #fee2e2; color: #991b1b":"background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534"].join(";"),n.textContent=e;const a=document.querySelector(".dash-content");a&&a.insertBefore(n,a.firstChild),setTimeout(()=>n.remove(),8e3)}async function ml(e){var d,l,A,m,c,u,y,p,g,f,B,$,x,D,Q,re,H;const t=window.XLSX;if(!t)return alert("Excel parser not loaded. Please refresh the page."),null;const s=await e.arrayBuffer(),n=t.read(new Uint8Array(s),{type:"array"}),a=n.SheetNames[0],i=n.Sheets[a],r=t.utils.sheet_to_json(i,{header:1,defval:null});try{const J=((d=r[5])==null?void 0:d[0])||"Unknown Meet",we=((l=r[7])==null?void 0:l[9])||0,Ie=((A=r[7])==null?void 0:A[36])||0;let ie=-1;for(let C=8;C<r.length;C++)if(r[C]&&r[C][1]==="Name"){ie=C+2;break}ie<0&&(ie=11);const ve=[];for(let C=ie;C<r.length;C+=2){const Y=(m=r[C])==null?void 0:m[1];if(!Y||typeof Y!="string")break;const V=Y.match(/^(.+?)\s*\((\d+)\)\s*$/),de=V?V[1].trim():Y.trim(),Le=V?parseInt(V[2],10):null,Pe=((c=r[C])==null?void 0:c[17])||0,Ze=((u=r[C])==null?void 0:u[23])||0,_=((y=r[C])==null?void 0:y[29])||0,O=((p=r[C])==null?void 0:p[38])||0;ve.push({name:de,age:Le,individualEvents:Pe,individualFee:Ze,relayFee:_,total:O})}let le=-1;for(let C=ie;C<r.length;C++)if(r[C]&&r[C][9]==="Team Totals"){le=C;break}let me={individualEntries:0,individualFee:0,relayEntries:0,relayFee:0,swimmerSurcharge:{count:0,fee:0},teamSurcharge:0,facilitySurcharge:0,total:0};return le>0&&(me.individualEntries=((g=r[le+1])==null?void 0:g[15])||0,me.individualFee=((f=r[le+1])==null?void 0:f[21])||0,me.relayEntries=((B=r[le+2])==null?void 0:B[15])||0,me.relayFee=(($=r[le+2])==null?void 0:$[21])||0,me.swimmerSurcharge={count:((x=r[le+3])==null?void 0:x[15])||0,fee:((D=r[le+3])==null?void 0:D[21])||0},me.teamSurcharge=((Q=r[le+4])==null?void 0:Q[21])||0,me.facilitySurcharge=((re=r[le+5])==null?void 0:re[21])||0,me.total=((H=r[le+6])==null?void 0:H[21])||0),{fileName:e.name,meetName:J,setupFees:{individualEventFee:we,swimmerSurcharge:Ie},swimmers:ve,summary:me,uploadedAt:new Date,uploadedBy:(N==null?void 0:N.email)||"unknown"}}catch(J){return console.error("Error parsing Hy-Tek report:",J),null}}function ul(e,t,s){const n=s&&s.swimmers&&s.swimmers.length>0;let a="";if(n){const i=s.summary;a+=`
      <div class="fee-summary-grid">
        <div class="fee-summary-card">
          <div class="fee-summary-label">Individual Entries</div>
          <div class="fee-summary-value">${i.individualEntries} events</div>
          <div class="fee-summary-sub">$${i.individualFee.toLocaleString()}</div>
        </div>
        <div class="fee-summary-card">
          <div class="fee-summary-label">Relay Entries</div>
          <div class="fee-summary-value">${i.relayEntries} entries</div>
          <div class="fee-summary-sub">$${i.relayFee.toLocaleString()}</div>
        </div>
        <div class="fee-summary-card">
          <div class="fee-summary-label">Swimmer Surcharge</div>
          <div class="fee-summary-value">${i.swimmerSurcharge.count} swimmers</div>
          <div class="fee-summary-sub">$${i.swimmerSurcharge.fee.toLocaleString()}</div>
        </div>
        <div class="fee-summary-card fee-summary-total">
          <div class="fee-summary-label">${o("dash_meets_fee_summary_total")}</div>
          <div class="fee-summary-value" style="font-size: 1.5rem; font-weight: 700;">$${i.total.toLocaleString()}</div>
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
            ${s.swimmers.map(r=>`
              <tr>
                <td>${r.name}</td>
                <td>${r.age!=null?r.age:"—"}</td>
                <td>${r.individualEvents}</td>
                <td>$${r.individualFee.toLocaleString()}</td>
                <td>$${r.relayFee.toLocaleString()}</td>
                <td><strong>$${r.total.toLocaleString()}</strong></td>
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
  `}async function os(e,t){let s=null;try{const c=await he(M(E,"meets",e));c.exists()&&(s=c.data().feeData||null)}catch(c){console.error("Error fetching meet for fee modal:",c)}const n=document.getElementById("fee-modal-overlay");n&&n.remove();const a=document.createElement("div");a.id="fee-modal-container",a.innerHTML=ul(e,t,s),document.body.appendChild(a);const i=document.getElementById("fee-modal-overlay"),r=document.getElementById("fee-modal-close"),d=document.getElementById("fee-upload-btn"),l=document.getElementById("fee-file-input"),A=document.getElementById("fee-delete-btn"),m=()=>{i==null||i.remove(),a.remove()};r==null||r.addEventListener("click",m),i==null||i.addEventListener("click",c=>{c.target===i&&m()}),d==null||d.addEventListener("click",()=>{l==null||l.click()}),l==null||l.addEventListener("change",async c=>{var g;const u=(g=c.target.files)==null?void 0:g[0];if(!u)return;const y=u.name.split(".").pop().toLowerCase();if(!["xls","xlsx"].includes(y)){alert(o("dash_meets_fee_parse_error"));return}const p=await ml(u);if(!p){alert(o("dash_meets_fee_parse_error"));return}try{await be(M(E,"meets",e),{feeData:p}),m(),os(e,t)}catch(f){console.error("Error uploading fee data:",f),alert("Failed to upload fee data. Please try again.")}}),A==null||A.addEventListener("click",async()=>{if(confirm(o("dash_meets_fee_delete_confirm")))try{await be(M(E,"meets",e),{feeData:null}),m(),os(e,t)}catch(c){console.error("Error deleting fee data:",c),alert("Failed to delete fee data. Please try again.")}})}function pl(e){const t=e.ageDeterminedOn||e.startDate,s=[],n=(a,i)=>{const r=ls(i.dob,t);s.push({familyId:a,usaId:String(i.usaSwimmingId||"").trim().toUpperCase(),name:[i.firstName,i.lastName].filter(Boolean).join(" ").trim(),firstName:i.firstName||"",lastName:i.lastName||"",dob:i.dob||"",gender:i.gender||"",age:r,ageGroup:Ca(r)})};if(ye==="coach")for(const a of ce)for(const i of a.swimmers||[])i&&!i.deleted&&n(a.id,i);else if(T)for(const a of T.swimmers||[])a&&!a.deleted&&n(Be,a);return s}function fl(e){const t=Ce.find(n=>n.id===e);if(!t)return;yo({meet:t,role:ye==="coach"?oe==="admin"?"admin":"coach":"family",swimmers:pl(t),familyId:Be,actorId:(N==null?void 0:N.uid)||null})}function fa(){var d,l,A,m,c,u,y,p,g,f,B,$,x,D,Q,re,H,J,we,Ie,ie,ve,le,me,C,Y,V,de,Le,Pe,Ze;fi(),document.querySelectorAll(".dash-nav-item[data-tab]").forEach(_=>{_.addEventListener("click",()=>{K=_.dataset.tab,G()})}),(d=document.getElementById("dash-theme-toggle"))==null||d.addEventListener("click",()=>{ha(),G()});const e=document.getElementById("dash-hamburger"),t=document.getElementById("dash-sidebar"),s=t==null?void 0:t.closest(".dash-layout");let n=null;const a=()=>{t==null||t.classList.remove("open"),s==null||s.classList.remove("menu-open"),n&&(n.remove(),n=null)};e==null||e.addEventListener("click",_=>{_.stopPropagation();const O=!t.classList.contains("open");O&&!n&&s&&(n=document.createElement("div"),n.className="dash-overlay",n.setAttribute("data-testid","dash-overlay"),n.addEventListener("click",a),s.appendChild(n)),t.classList.toggle("open",O),s==null||s.classList.toggle("menu-open",O)}),document.addEventListener("keydown",_=>{_.key==="Escape"&&a()}),(l=document.getElementById("sidebar-signout"))==null||l.addEventListener("click",async()=>{try{await Is(St),window.location.href="/signin.html"}catch(_){console.error("Error signing out:",_)}});const i=document.getElementById("user-trigger"),r=document.getElementById("user-dropdown");if(i==null||i.addEventListener("click",_=>{_.stopPropagation(),r.style.display=r.style.display==="none"?"block":"none"}),document.addEventListener("click",()=>{r&&(r.style.display="none")}),(A=document.getElementById("menu-profile"))==null||A.addEventListener("click",()=>{K="profile",r.style.display="none",G()}),(m=document.getElementById("menu-signout"))==null||m.addEventListener("click",async()=>{try{await Is(St),window.location.href="/signin.html"}catch(_){console.error("Error signing out:",_)}}),(c=document.getElementById("menu-admin"))==null||c.addEventListener("click",()=>{window.location.href="/admin.html"}),(u=document.getElementById("menu-password"))==null||u.addEventListener("click",()=>{r.style.display="none",cl()}),(y=document.getElementById("edit-contact-btn"))==null||y.addEventListener("click",()=>{document.querySelectorAll(".profile-display").forEach(_=>_.style.display="none"),document.querySelectorAll(".profile-edit-field").forEach(_=>_.style.display="block"),document.getElementById("edit-actions").style.display="flex",document.getElementById("edit-contact-btn").style.display="none"}),(p=document.getElementById("cancel-contact-btn"))==null||p.addEventListener("click",()=>{document.querySelectorAll(".profile-display").forEach(_=>_.style.display=""),document.querySelectorAll(".profile-edit-field").forEach(_=>_.style.display="none"),document.getElementById("edit-actions").style.display="none",document.getElementById("edit-contact-btn").style.display=""}),(g=document.getElementById("save-contact-btn"))==null||g.addEventListener("click",async()=>{var O,q,Ae,P,X,ke;const _={"parent.phone":((O=document.getElementById("edit-parent-phone"))==null?void 0:O.value.trim())||"","parent.address":((q=document.getElementById("edit-parent-address"))==null?void 0:q.value.trim())||""};T.spouse&&(_["spouse.phone"]=((Ae=document.getElementById("edit-spouse-phone"))==null?void 0:Ae.value.trim())||"",_["spouse.email"]=((P=document.getElementById("edit-spouse-email"))==null?void 0:P.value.trim())||""),_["emergencyContact.name"]=((X=document.getElementById("edit-emergency-name"))==null?void 0:X.value.trim())||"",_["emergencyContact.phone"]=((ke=document.getElementById("edit-emergency-phone"))==null?void 0:ke.value.trim())||"";try{await be(M(E,"registrations",Be),_),T.parent.phone=_["parent.phone"],T.parent.address=_["parent.address"],T.spouse&&(T.spouse.phone=_["spouse.phone"],T.spouse.email=_["spouse.email"]),T.emergencyContact.name=_["emergencyContact.name"],T.emergencyContact.phone=_["emergencyContact.phone"],K="profile",G()}catch($e){console.error("Error updating contact:",$e),alert(o("dash_profile_save_failed"))}}),(f=document.getElementById("add-swimmer-toggle-btn"))==null||f.addEventListener("click",()=>{document.getElementById("add-swimmer-form").style.display="block",document.getElementById("add-swimmer-toggle-btn").style.display="none"}),(B=document.getElementById("cancel-swimmer-btn"))==null||B.addEventListener("click",()=>{document.getElementById("add-swimmer-form").style.display="none",document.getElementById("add-swimmer-toggle-btn").style.display=""}),($=document.getElementById("save-swimmer-btn"))==null||$.addEventListener("click",async()=>{const _=document.getElementById("new-swimmer-first").value.trim(),O=document.getElementById("new-swimmer-last").value.trim();if(!_||!O){alert(o("dash_profile_swimmer_required"));return}const q=An(document.getElementById("new-swimmer-usaId").value);if(q&&!cn(q)){alert(o("dash_profile_usa_invalid"));return}if(q&&await mn(q,-1)){alert(o("dash_profile_usa_duplicate"));return}const Ae={firstName:_,lastName:O,middleName:document.getElementById("new-swimmer-middle").value.trim()||null,gender:document.getElementById("new-swimmer-gender").value||null,dob:document.getElementById("new-swimmer-dob").value||null,usaSwimmingId:q,joinDate:null},P=[...T.swimmers,Ae];try{await be(M(E,"registrations",Be),{swimmers:P}),T.swimmers=P,K="profile",G()}catch(X){console.error("Error adding swimmer:",X),alert(o("dash_profile_swimmer_add_failed"))}}),document.querySelectorAll(".delete-swimmer-btn").forEach(_=>{_.addEventListener("click",()=>{const O=parseInt(_.dataset.index),q=T.swimmers[O],Ae=[q.firstName,q.lastName].filter(Boolean).join(" ");Al(Ae,O)})}),document.querySelectorAll(".usa-id-edit-btn").forEach(_=>{_.addEventListener("click",()=>{const O=parseInt(_.dataset.index),q=document.querySelector(`.usa-id-edit-form[data-usa-form='${O}']`);q&&(q.style.display="flex",_.style.display="none",q.querySelector(".usa-id-input").focus())})}),document.querySelectorAll(".usa-id-cancel-btn").forEach(_=>{_.addEventListener("click",()=>{const O=parseInt(_.dataset.index),q=document.querySelector(`.usa-id-edit-form[data-usa-form='${O}']`),Ae=document.querySelector(`.usa-id-edit-btn[data-index='${O}']`);q&&(q.style.display="none"),Ae&&(Ae.style.display="")})}),document.querySelectorAll(".usa-id-save-btn").forEach(_=>{_.addEventListener("click",async()=>{var $e;const O=parseInt(_.dataset.index),q=T.swimmers[O];if(!q)return;const Ae=document.querySelector(`.usa-id-input[data-input='${O}']`),P=An(Ae==null?void 0:Ae.value),X=q.usaSwimmingId?q.usaSwimmingId.toUpperCase():null;if(P&&!cn(P)){alert(o("dash_profile_usa_invalid"));return}if(P===X){($e=document.querySelector(`.usa-id-cancel-btn[data-index='${O}']`))==null||$e.click();return}if(P&&await mn(P,O)){alert(o("dash_profile_usa_duplicate"));return}const ke=[...T.swimmers];ke[O]={...q,usaSwimmingId:P};try{await be(M(E,"registrations",Be),{swimmers:ke}),T.swimmers=ke,K="profile",G()}catch(Me){console.error("Error updating swimmer USA ID:",Me),alert(o("dash_profile_save_failed"))}})}),(x=document.getElementById("update-password-btn"))==null||x.addEventListener("click",async()=>{const _=document.getElementById("password-update-msg"),O=document.getElementById("change-current-password").value,q=document.getElementById("change-new-password").value,Ae=document.getElementById("change-confirm-password").value;_.style.display="none",_.style.color="";const P=document.getElementById("update-password-btn");if(P&&(P.disabled=!0),!O||!q||!Ae){_.textContent="All fields are required.",_.style.color="var(--color-accent, #DC2626)",_.style.display="block",P&&(P.disabled=!1);return}if(q!==Ae){_.textContent=o("dash_profile_password_mismatch"),_.style.color="var(--color-accent, #DC2626)",_.style.display="block",P&&(P.disabled=!1);return}if(q.length<6){_.textContent="Password must be at least 6 characters.",_.style.color="var(--color-accent, #DC2626)",_.style.display="block",P&&(P.disabled=!1);return}try{const X=un.credential(N.email,O);await pn(N,X),await fn(N,q),_.textContent=o("dash_profile_password_success"),_.style.color="#16A34A",_.style.display="block",document.getElementById("change-current-password").value="",document.getElementById("change-new-password").value="",document.getElementById("change-confirm-password").value=""}catch(X){console.error("Password update error:",X),X.code==="auth/wrong-password"||X.code==="auth/invalid-credential"?_.textContent=o("dash_profile_password_wrong"):_.textContent=o("dash_profile_password_error")+" "+(X.message||""),_.style.color="var(--color-accent, #DC2626)",_.style.display="block"}finally{P&&(P.disabled=!1)}}),document.querySelectorAll(".meet-entries-btn").forEach(_=>{_.addEventListener("click",()=>fl(_.dataset.id))}),ye==="coach"){const _=w=>{const F=document.getElementById("meet-form-error");if(!F){w&&alert(w);return}F.textContent=w||"",F.style.display=w?"block":"none"},O=(w,F,{focusName:j=!1}={})=>{var se;const L=document.getElementById("add-meet-form");L&&(L.style.display="none"),Ye=w,te={...F},pt();const Z=document.getElementById("add-meet-form");Z&&Z.scrollIntoView({behavior:"smooth",block:"nearest"}),j&&((se=document.getElementById("meet-name"))==null||se.focus())},q=()=>({name:"",startDate:"",endDate:"",location:"",source:"",season:k});(D=document.getElementById("add-meet-btn"))==null||D.addEventListener("click",()=>O(null,q(),{focusName:!0})),(Q=document.getElementById("add-meet-btn-empty"))==null||Q.addEventListener("click",()=>O(null,q(),{focusName:!0})),(re=document.getElementById("cancel-meet-btn"))==null||re.addEventListener("click",()=>{Pt(),pt()}),(H=document.getElementById("save-meet-btn"))==null||H.addEventListener("click",async()=>{var ue,W;const w=document.getElementById("meet-name").value.trim(),F=document.getElementById("meet-start-date").value,j=document.getElementById("meet-end-date").value,L=document.getElementById("meet-location").value.trim(),Z=((ue=document.getElementById("meet-source"))==null?void 0:ue.value.trim())||null,se=((W=document.getElementById("meet-season"))==null?void 0:W.value)||k;if(!w||!F||!j){_(o("dash_meets_name_date_required"));return}_(null);try{Ye?await be(M(E,"meets",Ye),{name:w,startDate:F,endDate:j,location:L,season:se,sourceUrl:Z}):await xt(ae(E,"meets"),{name:w,startDate:F,endDate:j,location:L,season:se,status:"Open",sourceUrl:Z,createdAt:new Date}),Pt(),pt()}catch(Ne){console.error("Error saving meet:",Ne),_(`${o("dash_meets_save_failed")} ${(Ne==null?void 0:Ne.message)||""}`.trim())}}),document.querySelectorAll(".edit-meet").forEach(w=>{w.addEventListener("click",()=>{O(w.dataset.id,{name:w.dataset.name||"",startDate:w.dataset.start||"",endDate:w.dataset.end||"",location:w.dataset.location||"",source:w.dataset.source||"",season:w.dataset.season||k},{focusName:!0})})}),document.querySelectorAll(".delete-meet").forEach(w=>{w.addEventListener("click",async()=>{if(confirm(o("dash_meets_confirm_delete")))try{const F=w.dataset.id;await He(M(E,"meets",F));try{const j=await qe(Se(ae(E,Ct),Lt("meetId","==",F)));await Promise.all(j.docs.map(L=>He(L.ref)))}catch(j){console.warn("Volunteer hours cleanup failed for meet",F,j)}Ye===F&&Pt(),ge===F&&(ge=null)}catch(F){console.error("Error deleting meet:",F)}})}),document.querySelectorAll(".meet-fee-btn").forEach(w=>{w.addEventListener("click",()=>{os(w.dataset.id,w.dataset.name)})});const Ae={sessionSlots:vs,enrollments:_s,currentPeriod:es,viewMode:ts,allRegistrations:ce,dbRole:oe,activeSwimmers:Ot(),onPeriodChange:w=>{es=w,G()},onViewChange:w=>{ts=w,G()}};Sr(Ae),(J=document.getElementById("season-select"))==null||J.addEventListener("change",w=>{k=w.target.value,G()}),(we=document.getElementById("goto-deposits-link"))==null||we.addEventListener("click",w=>{w.preventDefault(),K="deposits",G()}),(Ie=document.querySelector(".fee-summary-table tbody"))==null||Ie.addEventListener("click",w=>{const F=w.target.closest(".fee-summary-main-row");if(!F)return;const j=F.dataset.feeIndex,L=document.querySelector(`.fee-summary-detail-row[data-fee-detail="${j}"]`);if(!L)return;const Z=F.querySelector(".fee-summary-expand-icon"),se=L.classList.toggle("expanded");F.classList.toggle("expanded-row",se),Z&&(Z.classList.toggle("expanded",se),Z.textContent=se?"▼":"▶")}),(ie=document.getElementById("fee-summary-export-btn"))==null||ie.addEventListener("click",()=>{Xi()}),(ve=document.getElementById("deposits-season-select"))==null||ve.addEventListener("change",w=>{k=w.target.value,G()}),(le=document.getElementById("roster-season-select"))==null||le.addEventListener("change",w=>{k=w.target.value,G()}),(me=document.getElementById("deposits-add-btn"))==null||me.addEventListener("click",()=>{document.getElementById("deposits-add-form").style.display="block",document.getElementById("deposits-add-form").scrollIntoView({behavior:"smooth"})}),(C=document.getElementById("deposits-add-cancel"))==null||C.addEventListener("click",()=>{document.getElementById("deposits-add-form").style.display="none",document.getElementById("deposits-add-name").value="",document.getElementById("deposits-add-balance").value=""}),(Y=document.getElementById("deposits-add-save"))==null||Y.addEventListener("click",async()=>{const w=document.getElementById("deposits-add-name").value.trim(),F=parseFloat(document.getElementById("deposits-add-balance").value)||0;if(!w){alert("Swimmer name is required.");return}try{await xt(ae(E,"deposits"),{swimmerName:w,season:k,balance:F,deposit1Amount:null,deposit1Date:null,deposit2Amount:null,deposit2Date:null,deposit3Amount:null,deposit3Date:null,updatedAt:new Date,updatedBy:(N==null?void 0:N.email)||"unknown"}),document.getElementById("deposits-add-form").style.display="none",document.getElementById("deposits-add-name").value="",document.getElementById("deposits-add-balance").value=""}catch(j){console.error("Error adding deposit:",j),alert("Failed to add deposit.")}}),(V=document.getElementById("deposits-upload-balance-btn"))==null||V.addEventListener("click",()=>{const w=document.createElement("input");w.type="file",w.accept=".xls,.xlsx",w.addEventListener("change",async F=>{var Z;const j=(Z=F.target.files)==null?void 0:Z[0];if(F.target.remove(),!j)return;const L=await Hi(j);if(!L){alert(o("dash_fee_summary_deposit_parse_error"));return}if(L.fatal){alert(nn(L.fatal));return}qi(L,j.name)}),w.click()}),(de=document.getElementById("deposits-upload-detail-btn"))==null||de.addEventListener("click",()=>{const w=document.createElement("input");w.type="file",w.accept=".xls,.xlsx",w.addEventListener("change",async F=>{var Z;const j=(Z=F.target.files)==null?void 0:Z[0];if(F.target.remove(),!j)return;const L=await Ki(j);if(!L){alert(o("dash_fee_summary_deposit_parse_error"));return}if(L.fatal){alert(nn(L.fatal));return}Yi(L,j.name)}),w.click()}),(Le=document.getElementById("deposits-export-btn"))==null||Le.addEventListener("click",()=>{Wi()}),Gi(),rl(),(Pe=document.getElementById("save-session-btn"))==null||Pe.addEventListener("click",async()=>{const w=document.getElementById("session-message"),F=document.getElementById("session-cookie"),j=((F==null?void 0:F.value)||"").trim();if(!j){w&&(w.textContent="请先粘贴 cookie。",w.style.color="var(--color-accent)");return}w&&(w.textContent="保存中…",w.style.color="var(--text-muted)");try{const L=await xs($s,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({cookie:j})}),Z=await L.json().catch(()=>({}));if(!L.ok)throw new Error(Z.message||`HTTP ${L.status}`);F&&(F.value=""),w&&(w.textContent="已保存,正在验证…",w.style.color="var(--text-muted)"),await Gs(w),G()}catch(L){w&&(w.textContent=`❌ ${L.message}`,w.style.color="var(--color-accent)")}}),(Ze=document.getElementById("verify-session-btn"))==null||Ze.addEventListener("click",()=>{Gs()});const P=document.getElementById("results-athlete-select"),X=document.getElementById("refetch-one-btn");P==null||P.addEventListener("change",w=>{const F=w.target.value;if(F)ns(F),X&&(X.disabled=!Vs());else{const j=document.getElementById("results-viewer");j&&(j.style.display="none"),X&&(X.disabled=!0)}}),X==null||X.addEventListener("click",async()=>{var L;const w=P==null?void 0:P.value;if(!w)return;if(!st||!st.sessionId){alert("Please configure API credentials first.");return}X.disabled=!0,X.textContent="⏳ Fetching...";const F=document.getElementById("fetch-log");F.style.display="block";const j=(Z,se)=>{const ue=document.createElement("div");ue.textContent=`[${new Date().toLocaleTimeString()}] ${Z}`,ue.style.color=se?"var(--color-accent)":"var(--text-primary)",F.appendChild(ue),F.scrollTop=F.scrollHeight};try{j(`🔄 Force-refetching athlete ${w}...`);const Z=((L=P.selectedOptions[0])==null?void 0:L.text)||"",se=await Qn(st,w,Z,{force:!0,onLog:(ue,W)=>j(`   ${ue}`,W),onBestTimes:ue=>j(`   📊 bestTimes: ${ue.length} entries`)});j(`✅ Done — ${se.fetched} meets fetched, ${se.failed} failed`),se.errors.length>0&&(se.errors.slice(0,5).forEach(ue=>j(`   ⚠ ${ue}`,!0)),se.errors.length>5&&j(`   …and ${se.errors.length-5} more`,!0)),ns(w),Jn()}catch(Z){j(`❌ Refetch failed: ${Z.message}`,!0)}finally{X.disabled=!1,X.textContent="🔄 Refetch Selected Athlete"}});const ke=async({buttonId:w,newOnly:F})=>{if(lt)return;if(!Vs()){alert("请先在「🔑 Data Hub Session」里粘贴并保存 cookie。");return}lt=!0;const j=document.getElementById("fetch-log"),L=document.getElementById("fetch-status"),Z=document.getElementById("fetch-all-btn"),se=document.getElementById("fetch-new-btn"),ue=document.getElementById(w);j.style.display="block",j.innerHTML="",[Z,se].forEach(I=>{I&&(I.disabled=!0,I.textContent=I===ue?"⏳ Fetching...":I.dataset.defaultLabel||I.textContent)});const W=(I,$t)=>{const Re=document.createElement("div");Re.textContent=`[${new Date().toLocaleTimeString()}] ${I}`,Re.style.color=$t?"var(--color-accent)":"var(--text-primary)",j.appendChild(Re),j.scrollTop=j.scrollHeight},Ne=()=>{lt=!1,[Z,se].forEach(I=>{I&&(I.disabled=!1,I.textContent=I.dataset.defaultLabel||I.textContent)})};try{await bi(st,I=>{switch(I.type){case"start":W(`🚀 Starting ${F?"new-athlete":"full"} fetch for ${I.total} athlete(s)...`),L.textContent=`⏳ 0 / ${I.total}`,L.style.color="var(--text-primary)";break;case"no-new":W(`🆕 ${I.message}`,!1),L.textContent="✅ No new athletes",L.style.color="#16A34A",Ne();break;case"swimmer-start":W(`🔄 ${I.name} (${I.memberId})...`);break;case"step":W(`   📊 ${I.step}: ${I.count} entries`);break;case"log":W(`   ${I.message}`,I.isError);break;case"swimmer-done":I.initialComplete&&W("   🆕 Marked as fully initialized"),I.written?W(`   ✅ Written: ${I.bestTimes} best times, ${I.meets} meets (${I.newMeets} new${I.failedMeets>0?`, ${I.failedMeets} failed`:""})`):W("   ⏭ Skipped: no new meets");const $t=document.getElementById(`status-${I.memberId}`);$t&&($t.innerHTML=`<span style="color:#16A34A;">✅ ${I.bestTimes} best times, ${I.meets} meets</span>`);break;case"swimmer-error":{W(`   ❌ Failed: ${I.error}`,!0);const Re=document.getElementById(`status-${I.memberId}`);Re&&(Re.innerHTML=`<span style="color:var(--color-accent);">❌ ${b(I.error)}</span>`);break}case"auth-error":W(`   🔐 Authentication failed — stopping run. Update API credentials. (${I.message})`,!0),L.textContent="❌ Auth error — update credentials",L.style.color="var(--color-accent)";break;case"blocked-abort":W("",!1),W(`⛔ Stopping early: ${I.count} athletes in a row failed on their very first request with no response.`,!0),W("   The API is either unreachable right now, or it is rejecting the request before it gets read.",!0),W("   Nothing was lost — every meet already fetched is saved, and a later run resumes from there.",!0),L.textContent=`⛔ Stopped early at ${I.attempted} / ${I.total}`,L.style.color="var(--color-accent)";break;case"progress":L.textContent=`⏳ ${I.index} / ${I.total} (✅ ${I.success} ❌ ${I.failed})`;break;case"done":I.authError?(W(`⛔ Stopped after ${I.attempted}/${I.total} athlete(s): the Data Hub session expired — paste a fresh cookie.`,!0),Ss().then(()=>G()).catch(()=>{})):I.blockedAbort?W(`⛔ Run stopped early — ${I.success} succeeded, ${I.failed} failed. Retry when the API is reachable again.`,!0):(L.textContent=`✅ Done: ${I.success} succeeded, ${I.failed} failed`,L.style.color=I.failed>0?"var(--color-accent)":"#16A34A",W(""),W(`✅ Fetch complete — ${I.success} succeeded, ${I.failed} failed`)),I.errors.length>0&&(W("Error details:",!0),I.errors.forEach(Re=>W(`  • ${Re}`,!0))),Ne();break;case"error":W(`❌ ${I.message}`,!0),L.textContent="❌ Failed",L.style.color="var(--color-accent)",Ne();break}},{newOnly:F})}catch(I){W(`❌ Fetch runner error: ${I.message}`,!0),L.textContent="❌ Failed",L.style.color="var(--color-accent)"}finally{Ne()}},$e=document.getElementById("fetch-all-btn"),Me=document.getElementById("fetch-new-btn");$e&&($e.dataset.defaultLabel="🔄 Fetch All Swimmer Results"),Me&&(Me.dataset.defaultLabel="🆕 Fetch New Athletes Only"),$e==null||$e.addEventListener("click",()=>ke({buttonId:"fetch-all-btn",newOnly:!1})),Me==null||Me.addEventListener("click",()=>ke({buttonId:"fetch-new-btn",newOnly:!0}))}}Tr();
