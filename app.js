"use strict";
/* =========================================================
   Ember: keep your faith fire lit
   ========================================================= */
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const HABITS=[
["bible","Bible reading","Your list"],["study","Bible study","Your list"],["pray","Prayer","Your list"],["fast","Fasting","Your list"],["tithe","Tithing","Your list"],["devo","Devotionals","Your list"],["sun","Sunday service","Your list"],["mid","Mid-week service","Your list"],["lead","Leading a small group","Your list"],["vol","Volunteering","Your list"],["miss","Missions trip","Your list"],["testi","Giving testimony","Your list"],["wn","Witnessing: neighbors","Your list"],["wf","Witnessing: friends","Your list"],["ws","Witnessing: strangers","Your list"],
["journal","Gratitude journaling","Suggested"],["memo","Scripture memory","Suggested"],["worship","Worship time","Suggested"],["kind","Act of kindness","Suggested"],["acct","Accountability check-in","Suggested"],["sabbath","Sabbath rest","Suggested"],["host","Hospitality: meal with someone","Suggested"],["forgive","Forgiveness or reconciliation","Suggested"]];

/* ---------- Saved state ---------- */
let S;try{S=JSON.parse(localStorage.getItem("ember"))}catch(e){}
S=Object.assign({on:["bible","pray","devo","sun"],log:{},tithe:"",links:[],denom:"Nondenominational / Evangelical",tr:"web",book:"John",ch:1,
earn:{},x:{},c:{},spent:0,fz:0,frozen:[],shieldWk:"",ms:[],goal:100,verses:[],rolled:{},read:{},boost:0,sabDay:0,best:0,jarFull:[],q:null},S||{});
const save=()=>{try{localStorage.setItem("ember",JSON.stringify(S))}catch(e){}};
const day=(o=0)=>{const d=new Date();d.setDate(d.getDate()+o);return d.toLocaleDateString("en-CA")};
const done=(id,d=day())=>(S.log[d]||[]).includes(id);
const name=id=>(HABITS.find(h=>h[0]==id)||[,id])[1];
const RM=matchMedia("(prefers-reduced-motion: reduce)");
const fmt=n=>Math.round(n).toLocaleString();
/* keep per-day scratch data to today only */
for(const k of ["rolled","read"]){const t=S[k][day()];S[k]={};if(t)S[k][day()]=t}

/* ---------- Flame shapes ---------- */
const FP="M256 70C300 150 390 190 390 310C390 395 330 450 256 450C182 450 122 395 122 310C122 250 160 215 190 180C195 220 215 235 230 235C215 170 235 120 256 70Z";
const CP="M256 235C285 280 320 300 320 350C320 392 292 420 256 420C220 420 192 392 192 350C192 310 225 290 256 235Z";
const MINI="M12 1C14 6 20 9 20 17C20 23 16 27 12 27C8 27 4 23 4 17C4 13 6 11 8 9C8 12 10 13 11 13C10 9 11 5 12 1Z";
const SHIELD="M12 2l8 3v6c0 5-3.4 9-8 11-4.6-2-8-6-8-11V5z";
const glyph=(c="currentColor")=>`<svg viewBox="0 0 24 28" aria-hidden="true"><path d="${MINI}" fill="${c}"/></svg>`;
const shield=(on=true)=>`<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="${SHIELD}" fill="${on?"#8FC9FF":"none"}" stroke="${on?"#8FC9FF":"currentColor"}" stroke-width="2" stroke-linejoin="round" opacity="${on?1:.45}"/></svg>`;

/* ---------- Streaks, fuel, protection ---------- */
const FUEL={sun:3,lead:2,miss:4,forgive:2};          /* how much each practice grows the flame */
const fuel=id=>FUEL[id]||1;
const lit=(d,ids)=>ids.some(i=>done(i,d));
/* ---------- Schedules: how often each practice happens ----------
   f: daily | weekly | biweekly | monthly | anytime
   d: day of week (0 = Sunday) for weekly/biweekly, day of month for monthly
   a: a Monday in an "on" week, for every-other-week practices */
const DOW=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const SCHED={sun:{f:"weekly",d:0},mid:{f:"weekly",d:3},lead:{f:"weekly",d:2},tithe:{f:"weekly",d:0},sabbath:{f:"weekly",d:0},
acct:{f:"anytime"},host:{f:"anytime"},forgive:{f:"anytime"},miss:{f:"anytime"}};
const FREQ=[["daily","Every day"],["weekly","Once a week"],["biweekly","Every other week"],["monthly","Once a month"],["anytime","Whenever it happens"]];
if(!S.sched)S.sched={};
const sch=id=>Object.assign({f:"daily"},SCHED[id],S.sched[id]);
const DT=d=>new Date(d+"T12:00");
const ds=t=>t.toLocaleDateString("en-CA");
const addD=(d,n)=>{const t=DT(d);t.setDate(t.getDate()+n);return ds(t)};
const monday=d=>addD(d,-((DT(d).getDay()+6)%7));
const wkIdx=(s,d)=>Math.round((DT(monday(d))-DT(s.a||"2026-01-05"))/6048e5);
function pkey(id,d){const s=sch(id);switch(s.f){case"weekly":return monday(d);case"biweekly":return"b"+Math.floor(wkIdx(s,d)/2);case"monthly":return d.slice(0,7);default:return d}}
const periodic=id=>["weekly","biweekly","monthly"].includes(sch(id).f);
function isDue(id,d){const s=sch(id),t=DT(d);switch(s.f){case"daily":return true;case"weekly":return t.getDay()==s.d;
case"biweekly":return t.getDay()==s.d&&((wkIdx(s,d)%2)+2)%2==0;
case"monthly":{const last=new Date(t.getFullYear(),t.getMonth()+1,0).getDate();return t.getDate()==Math.min(s.d||1,last)}
default:return false}}
/* lit earlier in the same week or month (so it isn't owed again) */
function doneEarlier(id,d){if(!periodic(id))return false;const k=pkey(id,d);let x=addD(d,-1);for(let i=0;i<31&&pkey(id,x)==k;i++,x=addD(x,-1))if(done(id,x))return true;return false}
/* the practices that count on a given day */
const expected=(d=day())=>S.on.filter(id=>isDue(id,d)&&!doneEarlier(id,d));
/* flame size: lit fuel / expected fuel. Off-schedule practices add bonus heat. */
const heat=(ids,d=day())=>{const t=expected(d).filter(i=>ids.includes(i)).reduce((a,i)=>a+fuel(i),0),n=ids.filter(i=>done(i,d)).reduce((a,i)=>a+fuel(i),0);return Math.min(1,t?n/t:n?1:0)};
const isSab=d=>S.on.includes("sabbath")&&sch("sabbath").f=="weekly"&&DT(d).getDay()==sch("sabbath").d;
const UNIT={weekly:"week",biweekly:"two weeks",monthly:"month"};
/* streak in weeks or months for scheduled practices; the current period never breaks it */
function pstreak(id){let d=day(),c=0;for(let i=0;i<120;i++){const k=pkey(id,d);let has=false,x=d;for(let j=0;j<31&&pkey(id,x)==k;j++,x=addD(x,-1))if(done(id,x))has=true;if(has)c++;else if(i)break;d=x}return c}
function dueText(id){for(let i=0;i<70;i++){const d=day(i);if(isDue(id,d)){if(!i)return"Due today";if(i==1)return"Due tomorrow";const t=DT(d);return i<7?`Due ${DOW[t.getDay()]}`:`Due ${t.toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"})}`}}return""}
function yearCount(id){const y=String(new Date().getFullYear());return Object.entries(S.log).filter(([d,a])=>d.startsWith(y)&&a.includes(id)).length}
function metaFor(id){const s=sch(id);
if(s.f=="daily"){const n=streak([id]);return n?`${n}-day streak`:"Ready to light"}
if(s.f=="anytime"){if(done(id))return"Lit today. Bonus heat!";const n=yearCount(id);return n?`Lit ${n} time${n>1?"s":""} this year`:"Whenever it happens"}
const n=pstreak(id),u=s.f=="monthly"?"month":s.f=="weekly"?"week":"time";
if(done(id))return n>1?`${n} ${u}s in a row`:"Lit today";
if(doneEarlier(id,day()))return`Lit this ${UNIT[s.f]}`+(n>1?`. ${n} ${u}s in a row`:"");
return dueText(id)+(n?`. ${n} ${u}${n>1?"s":""} in a row`:"")}
const safe=d=>S.frozen.includes(d)||isSab(d);   /* frozen or Sabbath days never break a streak */
function streakInfo(ids){if(!ids.length)return{c:0};let o=lit(day(),ids)?0:1,c=0,start=null,g=0;
while(g++<4000){const d=day(-o);if(lit(d,ids)){c++;start=d}else if(!safe(d))break;o++}return{c,start}}
const streak=ids=>streakInfo(ids).c;
const TIERS=[[100,"Beacon"],[30,"Bonfire"],[14,"Blaze"],[7,"Steady flame"],[3,"Kindling"],[1,"Spark"]];
function tier(st){const i=TIERS.findIndex(t=>st>=t[0]);return i<0?{n:0}:{n:6-i,name:TIERS[i][1],next:TIERS[i-1]}}

/* =========================================================
   Ember economy
   ========================================================= */
const sum=o=>Object.values(o||{}).reduce((a,b)=>a+b,0);
const balance=()=>Object.values(S.earn).reduce((a,e)=>a+sum(e),0)-S.spent;
const monthKey=(d=day())=>d.slice(0,7);
const monthEarned=(m=monthKey())=>Object.entries(S.earn).filter(([d])=>d.startsWith(m)).reduce((a,[,e])=>a+sum(e),0);
const JAR=2500,JAR_BONUS=250,FREEZE_COST=200,FREEZE_MAX=2;
const TMULT=[1,1,1.1,1.2,1.3,1.5,2];   /* streak level multipliers: none, Spark, Kindling, Steady flame, Blaze, Bonfire, Beacon */
const XTRA={ /* going further: embers each, and a daily cap */
ch:{t:"Read another Bible chapter",e:6,cap:10},pray:{t:"Pray 5 more minutes",e:8,cap:12},kind:{t:"Another act of kindness",e:8,cap:10},
memo:{t:"Practice a kept verse",e:6,cap:10},pod:{t:"Listen to a podcast or radio",e:6,cap:3},devo:{t:"Read another devotional",e:6,cap:5}};
const xc=(k,d=day())=>((S.x[d]||{})[k]||0);
const xTotal=(d=day())=>sum(S.x[d]);
const cnt=(k,d=day())=>((S.c[d]||{})[k]||0);
const bump=k=>{const C=S.c[day()]||(S.c[day()]={});C[k]=(C[k]||0)+1;save()};
const boosted=()=>S.boost>Date.now();
function mult(){return Math.round((1+Math.min(1,xTotal()*.1))*TMULT[tier(streak(S.on)).n]*(boosted()?2:1)*100)/100}
function earn(key,base,useMult=true){const E=S.earn[day()]||(S.earn[day()]={});if(key in E)return 0;const a=Math.max(1,Math.round(base*(useMult?mult():1)));E[key]=a;save();return a}
function unearn(key){const E=S.earn[day()];if(E&&key in E){delete E[key];save()}}
/* embers that count toward the daily goal: everything except goal, quest, milestone and jar rewards */
const goalEmbers=()=>Object.entries(S.earn[day()]||{}).filter(([k])=>!/^(q:|goal|m:|jar)/.test(k)).reduce((a,[,v])=>a+v,0);

/* light or unlight a practice */
function toggle(id){const d=day(),a=S.log[d]||(S.log[d]=[]);const i=a.indexOf(id);
if(i<0){a.push(id);save();const g=earn("lit:"+id,10*fuel(id));return{g,b:surprise(id)}}
a.splice(i,1);unearn("lit:"+id);save();return null}
const mark=id=>done(id)?null:toggle(id);
function extra(k){const X=S.x[day()]||(S.x[day()]={});if((X[k]||0)>=XTRA[k].cap)return 0;X[k]=(X[k]||0)+1;save();return earn(`x:${k}:${X[k]}`,XTRA[k].e)}
/* do a practice: lights it first, then counts extras */
function doMore(id,k){if(id&&S.on.includes(id)&&!done(id))return toggle(id);const g=extra(k);return g?{g}:null}

/* surprise bonuses: rolled once per practice per day */
const GUSTS=["A gust of wind fanned your flame.","You found a glowing coal.","A stray spark caught.","Fresh kindling!","Someone threw another log on your fire."];
function surprise(id){const r=S.rolled[day()]||(S.rolled[day()]=[]);if(r.includes(id))return null;r.push(id);save();const x=Math.random();
if(x<.04){S.boost=Date.now()+15*6e4;save();return"Wildfire! Double embers for the next 15 minutes."}
if(x<.15){const n=15+Math.floor(Math.random()*26);earn("b:"+Date.now(),n,false);return`${GUSTS[Math.floor(Math.random()*GUSTS.length)]} +${n} embers`}
return null}

/* daily goals: three a day, picked once and kept */
const litN=()=>expected().filter(i=>done(i)).length;
const litAny=()=>S.on.filter(i=>done(i)).length;
const allLit=()=>{const e=expected();return e.length>0&&e.every(i=>done(i))};
const QUESTS=[
{id:"light2",t:"Light 2 practices",ok:()=>S.on.length>=2,n:2,v:litAny,r:20},
{id:"all",t:"Light everything due today",ok:()=>expected().length>=2,n:1,v:()=>+allLit(),r:40},
{id:"ch2",t:"Read 2 Bible chapters",ok:()=>S.on.includes("bible"),n:2,v:()=>+done("bible")+xc("ch"),r:25},
{id:"pray",t:"Pray 5 extra minutes",ok:()=>S.on.includes("pray"),n:1,v:()=>xc("pray")+cnt("prayed"),r:25},
{id:"kind",t:"Do an extra act of kindness",ok:()=>S.on.includes("kind"),n:1,v:()=>xc("kind"),r:20},
{id:"memo",t:"Practice a kept verse",ok:()=>S.verses.length>0,n:1,v:()=>cnt("mq"),r:25},
{id:"pod",t:"Listen to a podcast or Christian radio",ok:()=>true,n:1,v:()=>xc("pod"),r:20},
{id:"devo",t:"Read a devotional",ok:()=>S.on.includes("devo"),n:1,v:()=>+done("devo"),r:20},
{id:"more3",t:"Go further 3 times",ok:()=>true,n:3,v:()=>xTotal(),r:30},
{id:"keep",t:"Keep a new verse",ok:()=>true,n:1,v:()=>cnt("kept"),r:15}];
const hash=s=>{let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0};
function todayQuests(){if(!S.q||S.q.d!==day()){const pool=QUESTS.filter(q=>q.ok()).sort((a,b)=>hash(day()+a.id)-hash(day()+b.id));S.q={d:day(),ids:pool.slice(0,3).map(q=>q.id)};save()}
return S.q.ids.map(id=>QUESTS.find(q=>q.id==id)).filter(Boolean)}
const claimed=k=>k in (S.earn[day()]||{});

/* streak milestones: [days, embers, gives a streak freeze] */
const MILES=[[3,30],[7,70,1],[14,150],[30,300,1],[50,500],[100,1000,1],[365,3650,1]];

/* check and pay out every reward that has been reached */
function rewards(){const out=[];
for(const q of todayQuests())if(q.v()>=q.n&&!claimed("q:"+q.id)){earn("q:"+q.id,q.r,false);out.push(`Goal complete: ${q.t}. +${q.r} embers`)}
if(goalEmbers()>=S.goal&&!claimed("goal")){earn("goal",20,false);out.push("Daily ember goal met! +20 embers")}
const {c:st,start}=streakInfo(S.on);if(st>S.best)S.best=st;
for(const [m,r,f] of MILES)if(st>=m&&!S.ms.includes(start+":"+m)){S.ms.push(start+":"+m);earn(`m:${m}:${start}`,r,false);let gift="";if(f&&S.fz<FREEZE_MAX){S.fz++;gift=" and a streak freeze"}out.push(`${m}-day streak! +${r} embers${gift}`)}
const mk=monthKey();if(monthEarned()>=JAR&&!S.jarFull.includes(mk)){S.jarFull.push(mk);earn("jar",JAR_BONUS,false);out.push(`Your jar is full! +${JAR_BONUS} embers`)}
save();out.forEach(toast);chip();return out.length}

/* weekly free freeze, and freezes used automatically for missed days */
function weekKey(){const d=new Date();d.setDate(d.getDate()-((d.getDay()+6)%7));return d.toLocaleDateString("en-CA")}
function guard(){const notes=[];
if(S.shieldWk!==weekKey()){const first=!S.shieldWk;S.shieldWk=weekKey();if(S.fz<FREEZE_MAX){S.fz++;notes.push(first?"You start with a streak freeze. It protects your streak if you miss a day.":"Shield your flame: a free streak freeze arrived for this week.")}}
let o=1;const gap=[];while(o<60){const d=day(-o);if(lit(d,S.on)||safe(d))break;gap.push(d);o++}
if(gap.length&&o<60){const before=day(-o);const had=lit(before,S.on)||S.frozen.includes(before);
if(had&&S.fz>=gap.length){S.fz-=gap.length;S.frozen.push(...gap);notes.push(gap.length>1?`${gap.length} streak freezes kept your streak safe.`:"A streak freeze kept your streak safe yesterday.")}}
save();notes.forEach(toast)}

/* ---------- Feedback: toast, floating numbers, embers ---------- */
const TQ=[];let tBusy=false,tT1=0,tT2=0;
/* now=true replaces whatever is showing, for instant feedback */
function toast(m,now){if(now){TQ.length=0;clearTimeout(tT1);clearTimeout(tT2);TQ.push(m);nextToast();return}TQ.push(m);if(!tBusy)nextToast()}
function nextToast(){const t=$("#toast"),m=TQ.shift();if(!m){tBusy=false;t.classList.remove("on");return}tBusy=true;t.textContent=m;t.classList.add("on");tT1=setTimeout(()=>{t.classList.remove("on");tT2=setTimeout(nextToast,200)},TQ.length>1?1500:2600)}
function plus(el,n){if(!n||!el)return;const r=el.getBoundingClientRect(),e=document.createElement("span");e.className="plus";e.textContent="+"+n;e.style.left=r.left+r.width/2+"px";e.style.top=r.top+"px";document.body.appendChild(e);
if(RM.matches||!e.animate){setTimeout(()=>e.remove(),900);return}e.animate([{transform:"translate(-50%,0)",opacity:1},{transform:"translate(-50%,-46px)",opacity:0}],{duration:1100,easing:"cubic-bezier(.2,.7,.4,1)"}).onfinish=()=>e.remove()}
function burst(el,N=12,H=90){if(!el||RM.matches||!el.animate)return;const r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
for(let i=0;i<N;i++){const e=document.createElement("i");e.className="emb";e.style.left=x+"px";e.style.top=y+"px";document.body.appendChild(e);
const dx=(Math.random()-.5)*(N>12?200:70),dy=-60-Math.random()*H,sc=.4+Math.random()*.9;
e.animate([{transform:`translate(0,0) scale(${sc})`,opacity:1},{transform:`translate(${dx}px,${dy}px) scale(0)`,opacity:0}],{duration:700+Math.random()*500,easing:"cubic-bezier(.2,.7,.4,1)"}).onfinish=()=>e.remove()}}
/* show the result of earning: embers, +number, surprise, rewards */
function fx(el,res,n=12){if(!res)return;burst(el,n);plus(el,res.g);if(res.b)toast(res.b);rewards();chip()}
function chip(){const b=$("#bal");b.innerHTML=`${glyph()}<span>${fmt(balance())}</span>`;b.setAttribute("aria-label",`Ember jar: ${fmt(balance())} embers`);
if(!RM.matches&&b.animate)b.animate([{transform:"scale(1)"},{transform:"scale(1.12)"},{transform:"scale(1)"}],{duration:350})}
$("#bal").onclick=()=>go("jar");

/* =========================================================
   Today
   ========================================================= */
function flame(){return `<div class="fl"><svg viewBox="0 0 200 240" aria-hidden="true"><defs>
<radialGradient id="gl" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FF8A3D" stop-opacity=".6"/><stop offset=".55" stop-color="#F5B042" stop-opacity=".14"/><stop offset="1" stop-color="#F5B042" stop-opacity="0"/></radialGradient>
<linearGradient id="fo" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FF7A2E"/><stop offset=".55" stop-color="#F5B042"/><stop offset="1" stop-color="#FFD98A"/></linearGradient></defs>
<circle class="glow" cx="100" cy="150" r="110" fill="url(#gl)"/>
<ellipse cx="100" cy="228" rx="38" ry="5" fill="#000" opacity=".3"/>
<g class="body"><g transform="translate(-40.8 -22.5) scale(.55)"><path class="outer" d="${FP}" fill="url(#fo)"/><path class="core" d="${CP}" fill="#FFF3DC"/></g></g></svg></div>`}
const mini=f=>`<svg viewBox="0 0 24 28" aria-hidden="true"><path d="${MINI}" transform="translate(12 27) scale(${(.4+.6*f).toFixed(2)}) translate(-12 -27)" fill="${f?"#F5B042":"#4A3866"}" opacity="${f?(.5+.5*f).toFixed(2):1}"/></svg>`;
const row=(id,o)=>`<button class="hr" data-t="${id}" ${o?'data-o="1"':""} aria-pressed="false"><span class="ring">${glyph()}</span><span class="t"><b>${esc(name(id))}</b><span class="mut" data-s></span></span><span class="gain" data-g></span></button>`;
function today(){
const on=S.on,ex=expected(),rest=on.filter(i=>!ex.includes(i));
$("#main").innerHTML=`<section class="hero2"><p class="dt">${new Date().toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"})}</p>${flame()}<h2 class="big" id="hh"></h2><p class="hs" id="hs"></p><p class="tier" id="tier" hidden></p><div class="wk" id="wk" role="img"></div></section>
<div class="sheet">${!on.length?`<div class="empty"><p>Pick the practices that keep your fire going this season.</p><button class="btn" onclick="cust()">Choose practices</button></div>`
:ex.length?ex.map(id=>row(id)).join(""):`<div class="empty"><p>Nothing is due today. Anything you light below is bonus heat.</p></div>`}</div>
${rest.length?`<div class="card list"><h3>Also on your list</h3><p class="mut" style="margin:0 2px 4px">Weekly, monthly and whenever-it-happens practices. Lighting one counts for its week or month and adds bonus heat today.</p>${rest.map(id=>row(id,1)).join("")}</div>`:""}
<div id="goals"></div><div id="further"></div>`;
$$(".hr").forEach(b=>b.onclick=()=>{const id=b.dataset.t;
if(!done(id)&&doneEarlier(id,day())){toast(`${name(id)} is already lit this ${UNIT[sch(id).f]}. ${dueText(id).replace("Due","Next one is due")}.`);return}
const t0=tier(streak(S.on)).n,a0=allLit();const res=toggle(id);paint();chip();
if(!res){paintGoals();return}
fx(b.querySelector(".ring"),res,12*fuel(id));
if(!a0&&allLit())burst($(".fl svg"),34,170);else if(tier(streak(S.on)).n>t0)burst($(".fl svg"),22,130);
paint();paintGoals()});
bindFlame();paint(true);paintGoals()}
/* tap the big flame: normal flicker, then slow, then still, then normal again */
const FLICK=["dancing","slow","still"],FLICK_MSG=["Your flame is dancing again.","Flame slowed down.","Flame is still. Tap again to let it dance."];
function bindFlame(){const f=$(".fl");if(!f)return;const set=()=>{f.dataset.flick=S.flick||0;f.setAttribute("aria-label",`Your flame, flickering: ${FLICK[S.flick||0]}. Tap to change.`)};
f.setAttribute("role","button");f.tabIndex=0;set();
const step=()=>{S.flick=((S.flick||0)+1)%3;save();set();toast(FLICK_MSG[S.flick],true)};
f.onclick=step;f.onkeydown=e=>{if(e.key=="Enter"||e.key==" "){e.preventDefault();step()}}}
function paint(first){
const on=S.on,ex=expected(),m=ex.length,n=litN(),p=heat(on),st=streak(on),fl=$(".fl");if(!fl)return;
if(first&&!RM.matches){fl.style.setProperty("--p",0);fl.toggleAttribute("data-zero",true);requestAnimationFrame(()=>requestAnimationFrame(()=>{fl.style.setProperty("--p",p);fl.toggleAttribute("data-zero",!p)}))}
else{fl.style.setProperty("--p",p);fl.toggleAttribute("data-zero",!p)}
const left=m-n,late=new Date().getHours()>=18,warm=[1,2,3,4,5,6,7].some(o=>lit(day(-o),on)),T=tier(st),any=litAny();
fl.style.setProperty("--t",T.n);
$("#hh").textContent=!on.length?"Nothing to light yet":!m?(any?"Bonus heat":"A quiet day"):n==m?"Burning bright":n?`${n} of ${m} lit`:"Light the first one";
$("#hs").textContent=!on.length?"Your fire starts with one practice"
:!m?(st?`${st}-day streak. `:"")+(any?"Everything you lit today is extra.":"Nothing is due today. Light anything to keep your streak.")
:n==m?(st>1?`${st}-day streak. Everything due today is lit.`:"Everything due today is lit")
:st&&!any?`${st}-day streak. `+(isSab(day())?"It's your Sabbath, so your streak is safe today.":late?"Light one before midnight to keep it.":"Light one to keep it going.")
:st?`${st}-day streak`+(late?`. The night's still young: ${left} left to light.`:"")
:warm?"The embers are still warm. Rekindle today."
:"Tap a practice below to light it";
const tv=$("#tier");tv.hidden=!T.n;if(T.n)tv.innerHTML=`<b>${T.name}</b>`+(T.next?`<span>${T.next[0]-st} more day${T.next[0]-st>1?"s":""} to ${T.next[1]}</span>`:`<span>As bright as it gets</span>`);
const W=[6,5,4,3,2,1,0].map(o=>{const d=new Date();d.setDate(d.getDate()-o);const k=day(-o),e=expected(k),c=e.filter(i=>done(i,k)).length;return{o,f:heat(on,k),c,m:e.length,full:e.length&&c==e.length,ice:S.frozen.includes(k),l:d.toLocaleDateString(undefined,{weekday:"narrow"}),w:d.toLocaleDateString(undefined,{weekday:"long"})}});
$("#wk").setAttribute("aria-label","Last 7 days: "+W.map(x=>`${x.w} ${x.ice?"protected by a streak freeze":x.c+" of "+x.m}`).join(", "));
$("#wk").innerHTML=W.map(x=>`<div class="${x.o?"":"now"} ${x.full?"full":""}">${x.ice&&!x.f?`<span class="icon-ice">${shield()}</span>`:mini(x.f)}<span>${x.l}</span></div>`).join("");
$$(".hr").forEach(b=>{const id=b.dataset.t,blocked=!done(id)&&doneEarlier(id,day());b.setAttribute("aria-pressed",done(id));b.classList.toggle("held",blocked);b.querySelector("[data-s]").textContent=metaFor(id);
const g=(S.earn[day()]||{})["lit:"+id];b.querySelector("[data-g]").innerHTML=g?`+${g}`:blocked?"":`<span class="mut">${Math.round(10*fuel(id)*mult())}</span>`})}

/* goals and going further (shared by Today and Jar) */
function goalsHTML(){const e=goalEmbers(),pct=Math.min(100,e/S.goal*100),qs=todayQuests();
return `<div class="card"><div class="gh"><h3>Today's goals</h3><span class="pill" title="Today's ember multiplier">${mult()}× embers${boosted()?" (Wildfire)":""}</span></div>
<div class="eg"><div class="row" style="justify-content:space-between"><span>Daily ember goal</span><b>${fmt(Math.min(e,S.goal))} / ${fmt(S.goal)}</b></div><div class="bar" role="progressbar" aria-label="Daily ember goal" aria-valuemin="0" aria-valuemax="${S.goal}" aria-valuenow="${Math.min(e,S.goal)}"><i style="width:${pct}%"></i></div></div>
${qs.map(q=>{const v=Math.min(q.v(),q.n),ok=claimed("q:"+q.id);return `<div class="qr ${ok?"ok":""}"><span class="qc" aria-hidden="true">${ok?glyph():""}</span><span class="t">${q.t}${q.n>1?` <span class="mut">${v}/${q.n}</span>`:""}</span><span class="rw">${ok?"Done":"+"+q.r}</span></div>`}).join("")}
<p class="mut" style="margin:10px 0 0">New goals every day at midnight.</p></div>`}
function furtherHTML(){const R=[];const on=i=>S.on.includes(i);
if(on("pray"))R.push(["pray","Pray 5 more minutes","Starts a 5-minute prayer timer"]);
if(on("kind"))R.push(["kind","Log another act of kindness","Every kindness counts"]);
if(on("bible"))R.push(["ch","Read another Bible chapter","Opens the Bible tab"]);
if(on("devo"))R.push(["devo","Read another devotional","Opens Devos"]);
R.push(["memo",S.verses.length?"Practice a kept verse":"Keep a verse to memorize",S.verses.length?"Quick memory practice":"Tap any verse in the Bible tab"]);
R.push(["radio","Tune in to Christian radio","Opens the Radio tab"]);R.push(["pod","Listen to a podcast episode","Opens podcasts in Grow"]);
return `<div class="card list"><h3>Go further</h3><p class="mut" style="margin:0 2px 4px">Each extra earns embers and raises today's multiplier by 0.1×, up to 2×.</p>
${R.map(([k,t,s])=>`<button class="pl" data-x="${k}"><span class="t"><b>${t}</b><span class="mut">${s}</span></span><span class="pill">+${Math.round((XTRA[k]||XTRA.pod).e*mult())}</span></button>`).join("")}</div>`}
function paintGoals(){const g=$("#goals");if(g)g.innerHTML=goalsHTML();const f=$("#further");if(f){f.innerHTML=furtherHTML();bindFurther()}}
function bindFurther(){$$("[data-x]").forEach(b=>b.onclick=()=>{const k=b.dataset.x;
if(k=="pray")return prayTimer();
if(k=="kind"){const r=doMore("kind","kind");if(!r)return toast("That's the most kindness Ember can count today. Keep going anyway.");fx(b.querySelector(".pill"),r);refresh();return}
if(k=="ch")return go("bible");if(k=="devo")return go("devos");
if(k=="memo")return S.verses.length?go("grow","memory"):go("bible");
if(k=="pod")return go("grow","pods");if(k=="radio")return go("radio")})}
function refresh(){if(tab=="today"){paint();paintGoals()}else if(tab=="jar")jar();chip()}

/* prayer timer */
let ptI=null;
function prayTimer(){const D=$("#dlg");clearInterval(ptI);let end=0;
D.innerHTML=`<h2 class="serif">Five more minutes</h2><p class="mut">Set your phone down and pray. Ember will let you know when time's up.</p><p class="clock" id="clk" aria-live="off">5:00</p><div class="row"><button class="btn" id="pst">Start</button><button class="btn ghost" id="pcx">Close</button></div>`;
D.showModal();
$("#pcx").onclick=()=>{clearInterval(ptI);D.close()};
$("#pst").onclick=()=>{end=Date.now()+5*6e4;$("#pst").disabled=true;$("#pst").textContent="Praying…";
ptI=setInterval(()=>{const l=Math.max(0,end-Date.now()),sec=Math.ceil(l/1e3);$("#clk").textContent=`${Math.floor(sec/60)}:${String(sec%60).padStart(2,"0")}`;
if(!l){clearInterval(ptI);$("#clk").textContent="Amen";const b=$("#pst");b.disabled=false;b.textContent="Finish";b.onclick=()=>{bump("prayed");const r=doMore("pray","pray");D.close();if(r)fx($("#bal"),r);else{rewards();toast("Prayer time logged.")}refresh()}}},250)}}

/* =========================================================
   Jar: the reward hub
   ========================================================= */
function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function jarSVG(fill){const R=rng(7),dots=[];for(let r=0;r<10;r++)for(let c=0;c<6;c++)dots.push([46+c*13.6+(R()-.5)*7+(r%2?6:0),182-r*12.2+(R()-.5)*5,3.4+R()*2.6]);
const k=Math.round(Math.min(1,fill)*dots.length);
return `<svg class="jar" viewBox="0 0 170 210" role="img" aria-label="Jar ${Math.round(Math.min(1,fill)*100)} percent full"><defs><radialGradient id="eg"><stop offset="0" stop-color="#FFE3A3"/><stop offset=".5" stop-color="#F5B042"/><stop offset="1" stop-color="#FF7A2E"/></radialGradient>
<clipPath id="jc"><path d="M46 42h78v10c18 8 26 22 26 40v88c0 14-10 22-24 22H44c-14 0-24-8-24-22V92c0-18 8-32 26-40z"/></clipPath></defs>
<rect x="40" y="18" width="90" height="22" rx="6" fill="#4A3866"/><rect x="40" y="18" width="90" height="7" rx="3.5" fill="#5D4880"/>
<g clip-path="url(#jc)"><rect x="0" y="0" width="170" height="210" fill="#ffffff08"/>${dots.slice(0,k).map(([x,y,r],i)=>`<circle class="jd" style="--d:${i*12}ms" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="url(#eg)"/>`).join("")}</g>
<path d="M46 42h78v10c18 8 26 22 26 40v88c0 14-10 22-24 22H44c-14 0-24-8-24-22V92c0-18 8-32 26-40z" fill="none" stroke="#FFF3DC" stroke-opacity=".5" stroke-width="3"/>
<path d="M34 100v70" stroke="#FFF3DC" stroke-opacity=".25" stroke-width="5" stroke-linecap="round"/></svg>`}
function yearHTML(){const y=new Date().getFullYear(),now=new Date(),M=[];let litDays=0;
for(let m=0;m<=now.getMonth();m++){const dim=new Date(y,m+1,0).getDate(),cells=[];
for(let d=1;d<=dim;d++){const dt=new Date(y,m,d);if(dt>now)break;const k=dt.toLocaleDateString("en-CA"),f=heat(S.on,k),ice=S.frozen.includes(k)&&!f;if(f)litDays++;
cells.push(`<i class="${f?"on":""} ${f==1?"full":""} ${ice?"ice":""}" style="--f:${f.toFixed(2)}" title="${dt.toLocaleDateString(undefined,{month:"short",day:"numeric"})}"></i>`)}
M.push(`<div class="ym"><span>${new Date(y,m,1).toLocaleDateString(undefined,{month:"short"})}</span>${cells.join("")}</div>`)}
return `<div class="card"><h3>Year of fire</h3><p class="mut">${litDays} day${litDays==1?"":"s"} lit in ${y}. Brighter dots mean more of your practices lit that day.</p><div class="yr" role="img" aria-label="${litDays} days lit this year">${M.join("")}</div></div>`}
function jar(){
const bal=balance(),me=monthEarned(),st=streakInfo(S.on).c,T=tier(st),mn=new Date().toLocaleDateString(undefined,{month:"long"});
$("#main").innerHTML=`<section class="band jarband">${jarSVG(me/JAR)}<h2>${fmt(bal)}</h2><p class="jl">embers in your jar</p>
<div class="chips"><span class="pill dark">${mult()}× today</span><span class="pill dark">${shield()} ${S.fz} freeze${S.fz==1?"":"s"}</span></div>
<p>${me>=JAR?`Your ${mn} jar is full. You earned the ${JAR_BONUS}-ember bonus.`:`${mn}: ${fmt(me)} of ${fmt(JAR)}. Fill the jar this month for ${JAR_BONUS} bonus embers.`}</p></section>
<div class="card"><h3>Daily ember goal</h3><p class="mut">Pick a pace. Hitting it each day earns 20 bonus embers.</p>
<div class="seg" role="radiogroup" aria-label="Daily ember goal">${[[50,"Casual"],[100,"Regular"],[150,"Serious"],[250,"Intense"]].map(([v,l])=>`<button role="radio" aria-checked="${S.goal==v}" data-goal="${v}"><b>${l}</b><span>${v}</span></button>`).join("")}</div></div>
${goalsHTML()}
<div class="card"><h3>Your streak</h3>
<div class="sk"><span class="skn">${st}</span><span><b>${st==1?"day":"days"}${T.n?`, ${T.name}`:""}</b><span class="mut">Best: ${S.best} day${S.best==1?"":"s"}. Streak level multiplier: ${TMULT[T.n]}×</span></span></div>
<div class="fz"><span class="fzi">${[0,1].map(i=>shield(i<S.fz)).join("")}</span><span class="t"><b>Streak freezes: ${S.fz} of ${FREEZE_MAX}</b><span class="mut">Used automatically when you miss a day.</span></span></div>
<div class="row" style="flex-wrap:wrap"><button class="btn" id="buy" ${S.fz>=FREEZE_MAX||bal<FREEZE_COST?"disabled":""}>Buy a freeze for ${FREEZE_COST} embers</button><button class="btn ghost" id="share">Share your flame</button></div>
<p class="mut" id="buym" aria-live="polite">${S.fz>=FREEZE_MAX?"You're holding the most freezes you can.":bal<FREEZE_COST?`${fmt(FREEZE_COST-bal)} more embers to buy one.`:""}</p>
<p class="mut" style="margin:0"><b>Shield your flame:</b> a free freeze arrives every Monday.${S.on.includes("sabbath")?` <b>Sabbath rest</b> is on, so ${DOW[sch("sabbath").d]}s never break your streak.`:""}</p></div>
<div class="card list"><h3>Streak milestones</h3>${MILES.map(([m,r,f])=>{const got=S.best>=m;return `<div class="qr ${got?"ok":""}"><span class="qc" aria-hidden="true">${got?glyph():""}</span><span class="t">${m}-day streak <span class="mut">${f?"+ a free freeze":""}</span></span><span class="rw">${got?"Reached":"+"+fmt(r)}</span></div>`}).join("")}</div>
${yearHTML()}
<div class="card list"><details><summary>How embers work</summary><ul>
<li>Lighting a practice earns 10 embers times its fuel. Sunday service earns 30, Missions trip 40.</li>
<li>Going further (extra chapters, prayer time, kindness, verses, podcasts, devotionals) earns 6 to 8 embers each and raises today's multiplier by 0.1×, up to 2×.</li>
<li>Streak levels multiply everything: Kindling 1.1×, Steady flame 1.2×, Blaze 1.3×, Bonfire 1.5×, Beacon 2×.</li>
<li>Surprises: sometimes lighting a practice finds bonus embers, or starts a Wildfire with double embers for 15 minutes.</li>
<li>Daily goals, your ember goal, streak milestones and a full jar all pay bonus embers.</li>
<li>Unlighting a practice takes its embers back out.</li></ul></details></div>`;
$$("[data-goal]").forEach(b=>b.onclick=()=>{S.goal=+b.dataset.goal;save();rewards();jar()});
$("#buy").onclick=()=>{if(S.fz>=FREEZE_MAX||balance()<FREEZE_COST)return;S.spent+=FREEZE_COST;S.fz++;save();toast("Streak freeze ready. Your flame is shielded.");chip();jar()};
$("#share").onclick=shareFlame}

/* Kindle a friend: a shareable image of your flame */
async function shareFlame(){const st=streak(S.on),T=tier(st),c=document.createElement("canvas");c.width=1080;c.height=1350;const x=c.getContext("2d");
try{await document.fonts.load('600 120px "Fraunces"')}catch(e){}
x.fillStyle="#1A0E2B";x.fillRect(0,0,1080,1350);
const g=x.createRadialGradient(540,600,20,540,600,520);g.addColorStop(0,"rgba(255,138,61,.55)");g.addColorStop(1,"rgba(255,138,61,0)");x.fillStyle=g;x.fillRect(0,0,1080,1350);
x.save();x.translate(540-256*1.25,170);x.scale(1.25,1.25);const fg=x.createLinearGradient(0,450,0,70);fg.addColorStop(0,"#FF7A2E");fg.addColorStop(.55,"#F5B042");fg.addColorStop(1,"#FFD98A");x.fillStyle=fg;x.fill(new Path2D(FP));x.fillStyle="#FFF3DC";x.fill(new Path2D(CP));x.restore();
x.textAlign="center";x.fillStyle="#FFF3DC";x.font='600 132px "Fraunces", Georgia, serif';x.fillText(st?`${st} day${st==1?"":"s"}`:"Just lit",540,920);
x.fillStyle="#FFD98A";x.font='600 56px "Fraunces", Georgia, serif';x.fillText(T.n?T.name:"A new spark",540,1010);
x.fillStyle="#B7A6CC";x.font="40px system-ui, sans-serif";x.fillText("Keeping my faith fire lit with Ember",540,1180);
const msg=st?`I've kept my faith fire lit for ${st} day${st==1?"":"s"} (${T.name}). Want to keep yours lit with me?`:"I'm starting to keep my faith fire lit. Want to join me?";
const blob=await new Promise(r=>c.toBlob(r,"image/png"));
try{const f=new File([blob],"ember-flame.png",{type:"image/png"});if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],text:msg});return}}catch(e){if(e&&e.name=="AbortError")return}
const url=c.toDataURL("image/png"),D=$("#dlg");
D.innerHTML=`<h2 class="serif">Share your flame</h2><img src="${url}" alt="Your Ember flame: ${esc(msg)}" style="width:100%;border-radius:14px;margin:10px 0"><p class="mut">${esc(msg)}</p><div class="row" style="flex-wrap:wrap"><button class="btn" id="cpy">Copy message</button><a class="btn ghost" href="${url}" download="ember-flame.png">Save image</a><button class="btn ghost" id="shx">Close</button></div><p class="mut" id="cpm" aria-live="polite"></p>`;
D.showModal();$("#shx").onclick=()=>D.close();$("#cpy").onclick=async()=>{try{await navigator.clipboard.writeText(msg);$("#cpm").textContent="Copied. Paste it with the image."}catch(e){$("#cpm").textContent="Couldn't copy here. Press and hold the message to copy it."}}}

/* =========================================================
   Customize
   ========================================================= */
function cust(){let h=`<h2 class="serif">What keeps your fire going?</h2><p class="mut">Switch on what fits this season and set how often each one happens. Weekly and monthly practices only count on their day, and whenever-it-happens practices are always a bonus.</p>`;
const thisOn=id=>{const s=sch(id);return s.f!="biweekly"||((wkIdx(s,day())%2)+2)%2==0};
for(const g of ["Your list","Suggested"]){h+=`<h3 class="sub">${g}</h3>`;for(const [id,n] of HABITS.filter(x=>x[2]==g)){const s=sch(id),c=S.on.includes(id);
h+=`<div class="cu"><label class="tog"><input type="checkbox" value="${id}" ${c?"checked":""}>${n}${FUEL[id]?` <span class="mut">${FUEL[id]}× fuel</span>`:""}</label>
<div class="sch" data-for="${id}" ${c?"":"hidden"}><select data-f aria-label="How often: ${esc(n)}">${FREQ.map(([v,l])=>`<option value="${v}" ${s.f==v?"selected":""}>${l}</option>`).join("")}</select>
<select data-d aria-label="Which day: ${esc(n)}">${DOW.map((l,i)=>`<option value="${i}" ${(s.d??0)==i?"selected":""}>${l}s</option>`).join("")}</select>
<label class="dm">Day <input data-m type="number" min="1" max="28" value="${s.f=="monthly"?s.d||1:1}" aria-label="Day of the month: ${esc(n)}"></label>
<select data-a aria-label="Which weeks: ${esc(n)}"><option value="this" ${thisOn(id)?"selected":""}>Starting this week</option><option value="next" ${thisOn(id)?"":"selected"}>Starting next week</option></select></div></div>`}}
$("#dlg").innerHTML=h+`<p><button class="btn" id="ok">Save practices</button></p>`;$("#dlg").showModal();
const vis=box=>{const f=box.querySelector("[data-f]").value;box.querySelector("[data-d]").hidden=!["weekly","biweekly"].includes(f);box.querySelector(".dm").hidden=f!="monthly";box.querySelector("[data-a]").hidden=f!="biweekly"};
$$("#dlg .sch").forEach(box=>{vis(box);box.querySelector("[data-f]").onchange=()=>vis(box)});
$$("#dlg .tog input").forEach(i=>i.onchange=()=>{$(`#dlg .sch[data-for="${i.value}"]`).hidden=!i.checked});
$("#ok").onclick=()=>{S.on=$$("#dlg .tog input:checked").map(i=>i.value);
for(const box of $$("#dlg .sch")){const id=box.dataset.for;if(!S.on.includes(id))continue;const f=box.querySelector("[data-f]").value,o={f};
if(f=="weekly"||f=="biweekly")o.d=+box.querySelector("[data-d]").value;
if(f=="monthly")o.d=Math.min(28,Math.max(1,+box.querySelector("[data-m]").value||1));
if(f=="biweekly"){const m=monday(day());o.a=box.querySelector("[data-a]").value=="this"?m:addD(m,7)}
S.sched[id]=o}
if(sch("sabbath").f=="weekly")S.sabDay=sch("sabbath").d;
S.q=null;save();$("#dlg").close();go(tab)}}
$("#cust").onclick=cust;

/* =========================================================
   Bible
   ========================================================= */
const BOOKS="Genesis,Exodus,Leviticus,Numbers,Deuteronomy,Joshua,Judges,Ruth,1 Samuel,2 Samuel,1 Kings,2 Kings,1 Chronicles,2 Chronicles,Ezra,Nehemiah,Esther,Job,Psalms,Proverbs,Ecclesiastes,Song of Solomon,Isaiah,Jeremiah,Lamentations,Ezekiel,Daniel,Hosea,Joel,Amos,Obadiah,Jonah,Micah,Nahum,Habakkuk,Zephaniah,Haggai,Zechariah,Malachi,Matthew,Mark,Luke,John,Acts,Romans,1 Corinthians,2 Corinthians,Galatians,Ephesians,Philippians,Colossians,1 Thessalonians,2 Thessalonians,1 Timothy,2 Timothy,Titus,Philemon,Hebrews,James,1 Peter,2 Peter,1 John,2 John,3 John,Jude,Revelation".split(",");
/* free versions Ember can show (public domain, via bible-api.com): [code, name, language] */
const TRS=[["web","World English Bible","English"],["kjv","King James Version","English"],["asv","American Standard Version (1901)","English"],["bsb","Berean Standard Bible","English"],["bbe","Bible in Basic English","English"],["darby","Darby Bible","English"],["dra","Douay-Rheims 1899 American Edition","English"],["webbe","World English Bible, British Edition","English"],["oeb-us","Open English Bible, US Edition","English"],["oeb-cw","Open English Bible, Commonwealth Edition","English"],
["rv1909","Reina Valera 1909","Spanish"],["bes","La Biblia en Español Sencillo","Spanish"],["pddpt","Palabra de Dios para ti","Spanish"],["vbl","Versión Biblia Libre","Spanish"],
["cherokee","Cherokee New Testament","Other languages"],["cuv-simp","Chinese Union Version (Simplified)","Other languages"],["cuv","Chinese Union Version (Traditional)","Other languages"],["bkr","Bible kralická (Czech)","Other languages"],["danish","Danish Bible","Other languages"],["statenvertaling","Statenvertaling (Dutch)","Other languages"],["biblia","Finnish Bible","Other languages"],["luther1912","Luther Bible 1912 (German)","Other languages"],["leningrad","Hebrew Leningrad Codex","Other languages"],["karoli","Károli Bible (Hungarian)","Other languages"],["riveduta","Riveduta 1924 (Italian)","Other languages"],["bungo","Japanese Bungo (Classical)","Other languages"],["kougo","Japanese Kougo (Colloquial)","Other languages"],["korean","Korean Revised Version","Other languages"],["clementine","Clementine Latin Vulgate","Other languages"],["norwegian","Norwegian Bible","Other languages"],["gdanska","Gdańska Bible (Polish)","Other languages"],["rccv","Romanian Corrected Cornilescu","Other languages"],["synodal","Russian Synodal Translation","Other languages"],["swahili","Swahili Bible","Other languages"],["swedish","Swedish Bible","Other languages"],["tagalog","Ang Dating Biblia (Tagalog)","Other languages"],["cadman","Cadman Bible 1934 (Vietnamese)","Other languages"]];
const TR=Object.fromEntries(TRS.map(t=>[t[0],t[1]]));
/* copyrighted versions open on Bible Gateway: [code, name] */
const BGV=[["NKJV","New King James Version"],["NIV","New International Version"],["AMP","Amplified Bible"],["AMPC","Amplified Bible, Classic Edition"],["ESV","English Standard Version"],["NLT","New Living Translation"],["CSB","Christian Standard Bible"],["NASB","New American Standard Bible"],["NASB1995","New American Standard Bible 1995"],["LSB","Legacy Standard Bible"],["MSG","The Message"],["TPT","The Passion Translation"],["NRSVUE","New Revised Standard Version, Updated Edition"],["RSV","Revised Standard Version"],["NET","New English Translation"],["CEB","Common English Bible"],["CEV","Contemporary English Version"],["GNT","Good News Translation"],["NCV","New Century Version"],["NIRV","New International Reader's Version"],["ERV","Easy-to-Read Version"],["ICB","International Children's Bible"],["TLB","The Living Bible"],["NLV","New Life Version"],["MEV","Modern English Version"],["KJ21","21st Century King James Version"],["AKJV","Authorized (King James) Version"],["EXB","Expanded Bible"],["VOICE","The Voice"],["PHILLIPS","J.B. Phillips New Testament"],["CJB","Complete Jewish Bible"],["TLV","Tree of Life Version"],["NOG","Names of God Bible"],["LEB","Lexham English Bible"],["ISV","International Standard Version"],["NCB","New Catholic Bible"],["NABRE","New American Bible, Revised Edition"],["RSVCE","Revised Standard Version Catholic Edition"],["NRSVCE","New Revised Standard Version Catholic Edition"],["RVR1960","Reina-Valera 1960 (Spanish)"],["NVI","Nueva Versión Internacional (Spanish)"],["NTV","Nueva Traducción Viviente (Spanish)"],["LBLA","La Biblia de las Américas (Spanish)"]];
const bgUrl=code=>`https://www.biblegateway.com/passage/?search=${encodeURIComponent(S.book+" "+S.ch)}&version=${code}`;
const CHL=`<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,CHR=CHL.replace("M15 5l-7 7 7 7","M9 5l7 7-7 7");
const EXT=`<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M14 5h5v5M19 5l-8 8M17 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
/* reading button: light it, then add more readings, then counted */
const XK={bible:"ch",devo:"devo"};
const counted=ref=>(S.read[day()]||[]).includes(ref);
function lbState(id,ref){if(!done(id))return["Light today's reading",false];if(!counted(ref))return[id=="bible"?"Add this chapter to your jar":"Add this reading to your jar",true];return["Counted today",true]}
const lb=(id,ref)=>{const [t]=lbState(id,ref);return `<span class="ring">${glyph()}</span>${t}`};
const isKept=r=>S.verses.some(v=>v.r==r);
async function fetchPassage(ref,tr,el,markId,head=true){
el.innerHTML=`<p class="mut">Turning pages to ${esc(ref)}…</p>`;let r;
try{r=await fetch(`https://bible-api.com/${encodeURIComponent(ref)}?translation=${tr}`)}catch(e){el.innerHTML=`<p class="err">Couldn't load ${esc(ref)}. Check your connection, then try again.</p>`;return null}
if(!r.ok){el.innerHTML=`<p class="err">Couldn't find ${esc(ref)}. Try another chapter.</p>`;return "nf"}
try{const j=await r.json(),R=j.reference;
const vr=v=>`${v.book_name} ${v.chapter}:${v.verse}`;
el.innerHTML=`${head?`<h3>${esc(R)}</h3><p class="mut tn">${esc(j.translation_name||TR[tr])}</p>`:""}<p class="mut hint">Tap a verse to keep it for memory practice.</p><div class="verses">${j.verses.map((v,i)=>`<p data-v="${i}" class="${isKept(vr(v))?"kept":""}" tabindex="0" role="button" aria-pressed="${isKept(vr(v))}"><sup>${v.verse}</sup>${esc(v.text.trim())}</p>`).join("")}</div>${markId?`<button class="lightbtn" id="mk" aria-pressed="${done(markId)}">${lb(markId,R)}</button>`:""}`;
el.querySelectorAll("[data-v]").forEach(p=>{const v=j.verses[p.dataset.v],k=vr(v);const tg=()=>{if(isKept(k)){S.verses=S.verses.filter(x=>x.r!=k);toast(`Removed ${k}.`)}else{S.verses.push({r:k,t:v.text.trim().replace(/\s+/g," ")});bump("kept");toast(`Kept ${k}. Practice it in Grow.`);rewards()}save();p.classList.toggle("kept",isKept(k));p.setAttribute("aria-pressed",isKept(k))};
p.onclick=tg;p.onkeydown=e=>{if(e.key=="Enter"||e.key==" "){e.preventDefault();tg()}}});
if(markId)$("#mk").onclick=e=>{const b=e.currentTarget;let res=null;const rd=S.read[day()]||(S.read[day()]=[]);
if(!done(markId)){res=toggle(markId);rd.push(R)}else if(!counted(R)){const g=extra(XK[markId]);rd.push(R);res=g?{g}:null;if(!g)toast("You've hit today's limit for extra readings. Keep reading anyway.")}
save();b.setAttribute("aria-pressed","true");b.innerHTML=lb(markId,R);if(res)fx(b.querySelector(".ring"),res)};return j}
catch(e){el.innerHTML=`<p class="err">Couldn't read ${esc(ref)}. Try again.</p>`;return null}}
function trOptions(){const favs=TRS.filter(t=>isFav("tr:"+t[0])),o=t=>`<option value="${t[0]}" ${t[0]==S.tr?"selected":""}>${esc(t[1])}</option>`;
return (favs.length?`<optgroup label="Your favorites">${favs.map(o).join("")}</optgroup>`:"")+["English","Spanish","Other languages"].map(g=>`<optgroup label="${g}">${TRS.filter(t=>t[2]==g).map(o).join("")}</optgroup>`).join("")}
function bgChips(){const f=BGV.filter(v=>isFav("bg:"+v[0]));return f.length?f.map(([c,n])=>`<a class="chip" href="${bgUrl(c)}" target="_blank" rel="noopener" data-earn="ch" title="${esc(n)}">${c}</a>`).join(""):`<p class="mut" style="margin:0">Tap the ember beside any version below to pin it here.</p>`}
function otherVersions(){return `<h3>Other versions</h3><p class="mut" style="margin:0 2px 8px">NKJV, NIV, Amplified and other modern versions are copyrighted, so they open this chapter on Bible Gateway. Reading there still lights your Bible reading.</p>
<div class="chips2" data-strip="bgchips">${bgChips()}</div>
<details><summary>All ${BGV.length} versions</summary>${BGV.map(([c,n])=>`<div class="h fp"><span class="t"><b>${esc(n)}</b><span class="mut">${c}</span></span>${favBtn("bg:"+c,n)}<a class="pill" href="${bgUrl(c)}" target="_blank" rel="noopener" data-earn="ch">Open</a></div>`).join("")}</details>`}
function bible(){
$("#main").innerHTML=`<section class="band"><div class="bt"><button class="nb" id="pv" aria-label="Previous chapter">${CHL}</button><h2 id="ref" aria-live="polite">${esc(S.book)} ${S.ch}</h2><button class="nb" id="nx" aria-label="Next chapter">${CHR}</button></div>
<div class="ctl"><select id="bk" aria-label="Book">${BOOKS.map(b=>`<option ${b==S.book?"selected":""}>${b}</option>`).join("")}</select><input id="ch" type="number" min="1" inputmode="numeric" value="${S.ch}" aria-label="Chapter">
<div class="trrow"><select id="tr" aria-label="Translation">${trOptions()}</select><span id="trf">${favBtn("tr:"+S.tr,TR[S.tr])}</span></div></div></section><div class="card" id="txt"></div><div class="card list" id="ov">${otherVersions()}</div>`;
const load=async dir=>{S.book=$("#bk").value;S.ch=Math.max(1,+$("#ch").value||1);$("#ch").value=S.ch;S.tr=$("#tr").value;save();$("#ref").textContent=`${S.book} ${S.ch}`;$("#trf").innerHTML=favBtn("tr:"+S.tr,TR[S.tr]);
let j=await fetchPassage(`${S.book} ${S.ch}`,S.tr,$("#txt"),"bible",false);
if(j==="nf"&&dir>0){const i=BOOKS.indexOf(S.book);if(i<65){S.book=BOOKS[i+1];S.ch=1;$("#bk").value=S.book;$("#ch").value=1;save();$("#ref").textContent=`${S.book} 1`;j=await fetchPassage(`${S.book} 1`,S.tr,$("#txt"),"bible",false)}}
if(j&&j!=="nf")$("#ref").textContent=j.reference;$("#ov").innerHTML=otherVersions()};
$("#bk").onchange=()=>{$("#ch").value=1;load(0)};$("#ch").onchange=()=>load(0);$("#tr").onchange=()=>load(0);
$("#pv").onclick=()=>{$("#ch").value=Math.max(1,$("#ch").value-1);load(-1)};$("#nx").onclick=()=>{$("#ch").value=+$("#ch").value+1;load(1)};load(0)}

/* =========================================================
   Devotionals
   ========================================================= */
const doy=Math.floor((new Date()-new Date(new Date().getFullYear(),0,0))/864e5),dom=new Date().getDate();
const PLANS=[
["Proverbs: wisdom for the day","One chapter a day, restarting each month.",`Proverbs ${dom}`],
["Psalms: pray the prayers","Cycle through all 150 psalms over the year.",`Psalm ${doy%150+1}`],
["Gospel of John","Meet Jesus, one chapter at a time.",`John ${doy%21+1}`],
["Gospel of Mark","The shortest gospel, full of action.",`Mark ${doy%16+1}`],
["Sermon on the Mount","Matthew 5 to 7, a core text for living it out.",`Matthew ${5+doy%3}`],
["Romans: the gospel explained","A chapter a day through Paul's big argument.",`Romans ${doy%16+1}`],
["Acts: the early church","How the first believers lived and shared their faith.",`Acts ${doy%28+1}`],
["Genesis: beginnings","Creation, the fall, and God's promise to Abraham.",`Genesis ${doy%50+1}`],
["Psalms of Ascent","Songs pilgrims sang on the road to Jerusalem.",`Psalm ${120+doy%15}`],
["Isaiah: comfort my people","Hope and promise from Isaiah 40 to 66.",`Isaiah ${40+doy%27}`],
["Ephesians: who you are in Christ","Six chapters on grace, identity and the church.",`Ephesians ${doy%6+1}`],
["Philippians: joy","Paul's letter of joy, written from prison.",`Philippians ${doy%4+1}`],
["James: faith that works","Practical wisdom for everyday faith.",`James ${doy%5+1}`],
["1 John: walking in love","Assurance, light and love.",`1 John ${doy%5+1}`]];
/* free devotional websites: [id, name, description, url, group] */
const DEVLINKS=[
["odb","Our Daily Bread","A short reading, scripture and reflection each day","https://www.odb.org/","Daily devotionals"],
["utmost","My Utmost for His Highest","Oswald Chambers' classic, one entry a day","https://utmost.org/","Daily devotionals"],
["solidjoys","Solid Joys","John Piper's short daily devotional from Desiring God","https://www.desiringgod.org/solidjoys","Daily devotionals"],
["heartlight","Heartlight","Eleven free daily devotionals","https://heartlight.org/devotionals","Daily devotionals"],
["intouch","In Touch Daily Devotions","Charles Stanley and In Touch Ministries","https://www.intouch.org/","Daily devotionals"],
["upperroom","The Upper Room","A daily devotional written by readers around the world","https://www.upperroom.org/","Daily devotionals"],
["p31","Proverbs 31 Ministries","Encouragement for Today, written for women","https://proverbs31.org/read/devotions","Daily devotionals"],
["crosswalk","Crosswalk devotionals","Dozens of free daily devotionals","https://www.crosswalk.com/devotionals/","Daily devotionals"],
["bgdev","Bible Gateway devotionals","Daily devotionals from many authors","https://www.biblegateway.com/devotionals/","Daily devotionals"],
["youversion","YouVersion reading plans","Thousands of free plans on every topic","https://www.bible.com/reading-plans","Reading plans and apps"],
["studylight","StudyLight devotionals","37 free devotionals, classic and modern","https://www.studylight.org/devotionals/","Reading plans and apps"],
["morneve","Spurgeon's Morning and Evening","Charles Spurgeon's classic, twice a day","https://www.ccel.org/ccel/spurgeon/morneve","Classics"],
["ccel","Christian Classics Ethereal Library","Centuries of Christian writing, free to read","https://ccel.org","Classics"],
["pray","Pray as You Go","Daily guided prayer with music and scripture","https://pray-as-you-go.org/","Catholic and liturgical"],
["usccb","Daily Mass readings","Today's readings from the USCCB","https://bible.usccb.org/","Catholic and liturgical"]];
const Q=["What does this passage say about who God is?","What is one thing to believe, change, or do today?","Who could you pray for or encourage because of this?"];
async function openPlan(i){const p=PLANS[i],el=$("#dv");if(!el)return;$$("[data-p]").forEach(x=>x.toggleAttribute("aria-current",x.dataset.p==i));el.hidden=false;el.scrollIntoView({behavior:RM.matches?"auto":"smooth",block:"start"});
const j=await fetchPassage(p[2],S.tr,el,"devo");if(j&&j!=="nf")el.insertAdjacentHTML("beforeend",`<h3 class="sub serif">Let it simmer</h3><ol>${Q.map(q=>`<li>${q}</li>`).join("")}</ol>`)}
function devos(){const G2=[...new Set(DEVLINKS.map(d=>d[4]))];
$("#main").innerHTML=`<section class="band"><h2>Devotionals</h2><p>Reading plans you can read right here, plus free devotionals from around the web. Tap the ember to keep your favorites at the top.</p></section>
<div class="card list"><h3>Your favorites</h3><div data-strip="plan:,dev:">${stripHTML(["plan:","dev:"])}</div></div>
<div class="card list"><h3>Reading plans</h3><p class="mut" style="margin:0 2px 4px">Each gives you a chapter for today, chosen by the date. Read more than one to add embers.</p>${PLANS.map((p,i)=>`<div class="h prow"><button class="pl" data-p="${i}"><span class="t"><b>${p[0]}</b><span class="mut">${p[1]}</span></span><span class="pill">${p[2]}</span></button>${favBtn("plan:"+i,p[0])}</div>`).join("")}</div>
<div class="card" id="dv" hidden></div>
${G2.map(g=>`<div class="card list"><h3>${g}</h3>${DEVLINKS.filter(d=>d[4]==g).map(([id,n,s2,u])=>`<div class="h"><a class="t lk2" href="${u}" target="_blank" rel="noopener" data-earn="devo"><b>${esc(n)}</b><span class="mut">${esc(s2)}</span></a>${favBtn("dev:"+id,n)}<a class="pill" href="${u}" target="_blank" rel="noopener" data-earn="devo">Read</a></div>`).join("")}</div>`).join("")}
<p class="mut" style="margin:0 4px 14px">Devotional sites open in your browser. Opening one lights Devotionals for today.</p>`;
$$("[data-p]").forEach(b=>b.onclick=()=>openPlan(+b.dataset.p))}

/* =========================================================
   Church
   ========================================================= */
const MO="(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\\.?\\s+\\d{1,2}",WD="(?:mon|tue|wed|thu|fri|sat|sun)[a-z]*",TM="\\d{1,2}(?::\\d{2})?\\s?(?:am|pm|a\\.m\\.|p\\.m\\.)";
const RX=new RegExp(`(${MO}(?:st|nd|rd|th)?|\\b\\d{1,2}/\\d{1,2}(?:/\\d{2,4})?\\b|\\b${WD}\\b|${TM})`,"gi");
function church(){
$("#main").innerHTML=`<section class="band"><h2>Church</h2><p>Give, keep your church's links close, and find what's coming up.</p></section>
<div class="card"><h3>Give</h3><p class="mut">Save your church's giving page. It opens in your browser, so payment details never touch Ember.</p><input id="tl" type="url" placeholder="https://yourchurch.org/give" value="${esc(S.tithe)}" aria-label="Giving link"><div class="row"><button class="btn" id="tg">Give now</button><button class="btn ghost" id="ts">Save link</button></div><p id="tm" class="mut" aria-live="polite"></p></div>
<div class="card list"><h3>Church links</h3><p class="mut" style="margin:0 2px 6px">Website, livestream, social pages: one tap away.</p><div id="ll"></div><div class="row" style="margin:10px 0 4px"><input id="ln" placeholder="Name, like Instagram" aria-label="Link name"><input id="lu" type="url" placeholder="https://" aria-label="Link address"></div><p><button class="btn ghost" id="la">Add link</button></p></div>
<div class="card"><h3>Find events</h3><p class="mut">Instagram, Facebook and TikTok don't let apps read their posts. Copy the text of a post, bulletin or newsletter and paste it here. Ember picks out the lines with dates and times.</p><textarea id="an" rows="5" placeholder="Paste announcements here" aria-label="Announcements"></textarea><button class="btn" id="ax">Find events</button><div id="ao" aria-live="polite"></div></div>`;
const links=()=>{$("#ll").innerHTML=S.links.length?S.links.map((l,i)=>`<div class="h"><a class="t" href="${esc(l.u)}" target="_blank" rel="noopener"><b>${esc(l.n)}</b></a><button class="btn ghost sm" data-r="${i}" aria-label="Remove ${esc(l.n)}">Remove</button></div>`).join(""):`<p class="mut" style="margin:6px 2px">No links yet. Add your first one below.</p>`;$$("[data-r]").forEach(b=>b.onclick=()=>{S.links.splice(b.dataset.r,1);save();links()})};links();
const ok=u=>/^https?:\/\//i.test(u);
$("#ts").onclick=()=>{const u=$("#tl").value.trim();if(u&&!ok(u)){$("#tm").textContent="The link must start with http:// or https://";return}S.tithe=u;save();$("#tm").textContent=u?"Link saved.":"Link cleared."};
$("#tg").onclick=()=>{if(!S.tithe){$("#tm").textContent="Paste your giving link and save it first.";return}window.open(S.tithe,"_blank","noopener");const tOn=S.on.includes("tithe"),already=done("tithe")||doneEarlier("tithe",day());const res=tOn&&!already?mark("tithe"):null;$("#tm").textContent=!tOn?"Giving page opened.":already?`Giving page opened. Tithing is already lit this ${UNIT[sch("tithe").f]||"day"}.`:"Giving page opened. Tithing is lit.";if(res)fx($("#tg"),res)};
$("#la").onclick=()=>{const u=$("#lu").value.trim(),n=$("#ln").value.trim()||u;if(!ok(u)){$("#lu").focus();return}S.links.push({n,u});save();$("#ln").value=$("#lu").value="";links()};
$("#ax").onclick=()=>{const L=$("#an").value.split(/\n+/).map(s=>s.trim()).filter(s=>s.length>5);const hits=L.filter(l=>{RX.lastIndex=0;return RX.test(l)});
$("#ao").innerHTML=hits.length?`<p class="mut" style="margin:14px 0 0">${hits.length} line${hits.length>1?"s":""} worth circling</p>`+hits.map(l=>`<div class="h"><span>${esc(l).replace(RX,m=>`<mark>${m}</mark>`)}</span></div>`).join(""):`<p class="mut">No dates or times found. Paste text that includes them.</p>`}}

/* =========================================================
   Grow
   ========================================================= */
const G=[
["Lead a small group",["Start with a clear purpose: study, prayer, or community. Say it out loud in week one.","Prepare 3 to 5 open questions, not a lecture. Aim to talk about a third of the time.","Begin with a simple icebreaker and end with prayer requests, then follow up during the week.","Create safety: confidentiality, no fixing or interrupting, and never force anyone to share.","Pray for each member by name and invite others to lead sections so the group grows leaders."]],
["Public speaking",["Build around one main idea you can say in a sentence.","Open with a story or question, give two or three points, close with one clear action.","Speak slower than feels natural and pause between points. Silence is fine.","Practice out loud three times, once standing, and time yourself.","Look at friendly faces, breathe, and remember you are serving, not performing."]],
["Share your testimony",["Keep it to 3 minutes: life before, how you met Jesus, life since.","Be specific and honest. Skip church jargon a friend wouldn't understand.","Focus on what Jesus did, not on how bad or good you were.","Close with one sentence that invites a question or a next step.","Write it down and rehearse it with a friend so it feels natural."]],
["Witnessing: neighbors, friends, strangers",["Pray first, then look for natural openings: needs, questions, and stories.","Neighbors: build trust through meals, help, and consistency. Friends: be honest about your faith without pressure.","Strangers: be kind, ask permission to share, and listen more than you talk.","Ask questions like \"What do you think happens after we die?\" and really listen.","Share your story, offer a Bible or invite them to church, and accept a no with grace."]]];
const POD={
"Nondenominational / Evangelical":["The Bible Project","Ask Pastor John","The Craig Groeschel Leadership Podcast"],
"Baptist":["Ask Pastor John","The Briefing with Albert Mohler","The Gospel Coalition Podcast"],
"Reformed / Presbyterian":["Renewing Your Mind","The Gospel Coalition Podcast","Ask Pastor John"],
"Catholic":["Pray as You Go","The Bishop Barron Podcast","Catholic Answers Live"],
"Methodist / Wesleyan":["Seedbed Daily Text","The Bible Project","Pray as You Go"],
"Pentecostal / Charismatic":["Elevation with Steven Furtick","The Craig Groeschel Leadership Podcast","The Bible Project"],
"Lutheran":["Issues, Etc.","The Lutheran Hour","The Bible Project"],
"Orthodox":["Ancient Faith Today","Lord Have Mercy","Ancient Faith Radio"],
"Anglican / Episcopal":["Mere Fidelity","Ask NT Wright Anything","The Bible Project"]};
/* Featured podcasts with direct links: [name, who, Apple Podcasts, Spotify] */
const FEAT=[
["HTB Church","Holy Trinity Brompton, London","https://podcasts.apple.com/podcast/id1351338998","https://open.spotify.com/show/6TQUDmNb3SxZ4IwN45NYNw"],
["The Crazy Love Podcast","Francis Chan and friends, Crazy Love Ministries","https://podcasts.apple.com/podcast/id1007053996","https://open.spotify.com/show/34HxTaXogxr7FHDdkebrM9"]];
function memoryHTML(){return `<div class="card list" id="memory"><h3>Memory verses</h3>${S.verses.length?`<p class="mut" style="margin:0 2px 4px">Fill in the blanks from memory. Each verse you know earns embers.</p>`+S.verses.map((v,i)=>`<button class="pl" data-mv="${i}"><span class="t"><b>${esc(v.r)}</b><span class="mut clamp">${esc(v.t)}</span></span><span class="pill">Practice</span></button>`).join(""):`<p class="mut" style="margin:0 2px 14px">Tap any verse in the Bible or Devos tab to keep it here for practice.</p>`}</div>`}
function quiz(i){const v=S.verses[i];if(!v)return;const D=$("#dlg"),w=v.t.split(" "),R=Math.random()<.5?0:1;let k=0;
const html=w.map(x=>{const core=x.replace(/[^A-Za-z']/g,"");if(core.length>3&&(k++%2==R))return `<span class="blank" style="width:${Math.max(3,core.length)*.62}em" aria-label="blank"></span>${esc(x.slice(x.indexOf(core)+core.length))}`;return esc(x)}).join(" ");
D.innerHTML=`<h2 class="serif">${esc(v.r)}</h2><p class="mut">Say the verse out loud, filling in the blanks. Then check yourself.</p><p class="quiz" id="qz">${html}</p>
<div class="row" style="flex-wrap:wrap" id="qa"><button class="btn" id="qs">Show the verse</button><button class="btn ghost" id="qx">Close</button></div><p><button class="btn ghost sm" id="qr">Remove this verse</button></p>`;
D.showModal();
$("#qx").onclick=()=>D.close();
$("#qr").onclick=()=>{S.verses.splice(i,1);save();D.close();toast(`Removed ${v.r}.`);grow()};
$("#qs").onclick=()=>{$("#qz").textContent=v.t;bump("mq");$("#qa").innerHTML=`<button class="btn" id="qy">I knew it</button><button class="btn ghost" id="qn">Still learning</button>`;
$("#qy").onclick=()=>{const r=doMore("memo","memo");D.close();if(r)fx($("#bal"),r);else rewards();toast(r?"Hidden in your heart.":"Nice work. That's the most practice Ember can count today.")};
$("#qn").onclick=()=>{D.close();rewards();toast("Keep at it. Practice counts toward today's goal.")}}}
function grow(section){
$("#main").innerHTML=`<section class="band"><h2>Grow</h2><p>Memory verses, practical guides for serving and sharing your faith, and podcasts from your tradition.</p></section>
${memoryHTML()}
<div class="card list"><h3>Guides</h3>${G.map(g=>`<details><summary>${g[0]}</summary><ul>${g[1].map(x=>`<li>${x}</li>`).join("")}</ul></details>`).join("")}</div>
<div class="card list" id="pods"><h3>Podcasts</h3><h4 class="ph">Your favorites</h4><div data-strip="pod:">${stripHTML(["pod:"])}</div>
<h4 class="ph">Featured</h4>${FEAT.map(([n,w])=>podRow("pod:"+n)).join("")}
<h4 class="ph">From your tradition</h4><label class="mut" for="dn" style="margin:0 2px">Your tradition</label><select id="dn">${Object.keys(POD).map(k=>`<option ${k==S.denom?"selected":""}>${k}</option>`).join("")}</select><div id="po"></div><p class="mut" style="margin:6px 2px 14px">Listening adds embers, up to 3 a day across podcasts and radio. Tradition picks open a search in Apple Podcasts. Compare what you hear with what your own pastor teaches.</p></div>`;
$$("[data-mv]").forEach(b=>b.onclick=()=>quiz(+b.dataset.mv));
const pods=()=>{$("#po").innerHTML=POD[S.denom].map(p=>podRow("pod:"+p)).join("")};
$("#dn").onchange=e=>{S.denom=e.target.value;save();pods()};pods();
if(section){const el=document.getElementById(section);if(el)el.scrollIntoView({block:"start"})}}

/* =========================================================
   Radio
   ========================================================= */
/* [id, name, description, official site, group] */
const RADIO=[
["klove","K-LOVE","America's largest Christian music network","https://www.klove.com/","Contemporary Christian"],
["air1","Air1","Worship music around the clock","https://www.air1.com/","Worship and praise"],
["wayfm","WAY-FM","Christian hits for families","https://www.wayfm.com/","Contemporary Christian"],
["joyfm","The Joy FM","Florida's Christian music station","https://www.thejoyfm.com/","Contemporary Christian"],
["ksbj","KSBJ 89.3","Houston, Texas","https://www.ksbj.org/","Contemporary Christian"],
["wgts","WGTS 91.9","Washington, D.C.","https://www.wgts919.com/","Contemporary Christian"],
["z88","Z88.3","Orlando, Florida","https://www.z88.fm/","Contemporary Christian"],
["flr","Family Life Radio","Christian music and encouragement","https://www.myflr.org/","Contemporary Christian"],
["praise","Premier Praise","Worship music from the UK","https://premierchristianradio.com/how-to-listen/","Worship and praise"],
["livingworship","Living Worship Radio","24/7 worship from Orlando, Florida","https://livingworship.radio/","Worship and praise"],
["worshiplive","Worship Live 24/7","Nonstop praise and worship","https://www.worshiplive.com/","Worship and praise"],
["abiding","Abiding Radio","Hymns, sacred and instrumental music","https://www.abidingradio.com/","Hymns and sacred music"],
["bbn","Bible Broadcasting Network","Hymns, Bible teaching and sacred music","https://www.bbnradio.org/","Hymns and sacred music"],
["moody","Moody Radio","Bible teaching, talk and music","https://www.moodyradio.org/","Teaching and talk"],
["afr","American Family Radio","Talk, teaching and inspirational music","https://www.afr.net/","Teaching and talk"],
["premier","Premier Christian Radio","News, teaching and music from London","https://premierchristianradio.com/how-to-listen/","Teaching and talk"],
["holyculture","Holy Culture Radio","Christian hip-hop and R&P","https://holyculture.net/","Gospel and hip-hop"],
["pgospel","Premier Gospel","Gospel music from the UK","https://premierchristianradio.com/how-to-listen/","Gospel and hip-hop"],
["radiou","RadioU","Christian rock, alternative and hip-hop","https://radiou.com/","Rock and alternative"],
["crnet","ChristianRock.Net","Internet-only Christian rock","https://www.christianrock.net/","Rock and alternative"],
["relevant","Relevant Radio","Catholic talk and prayer","https://relevantradio.com/","Catholic"],
["ewtn","EWTN Radio","Global Catholic radio","https://www.ewtn.com/radio","Catholic"],
["avemaria","Ave Maria Radio","Catholic talk radio","https://avemariaradio.net/","Catholic"],
["radiomaria","Radio Maria USA","Catholic prayer and teaching","https://www.radiomaria.us/","Catholic"],
["afrorth","Ancient Faith Radio","Orthodox Christian music and talk","https://www.ancientfaith.com/","Orthodox"],
["nuevavida","Radio Nueva Vida","Música cristiana y enseñanza bíblica","https://www.radionuevavida.com/","En español"],
["ucb","UCB","Christian radio across the UK","https://www.ucb.co.uk/","Around the world"],
["crossrhythms","Cross Rhythms","Christian music from the UK","https://www.crossrhythms.co.uk/","Around the world"],
["hope","Hope 103.2","Sydney, Australia","https://hope1032.com.au/","Around the world"],
["vision","Vision Christian Radio","Australia-wide","https://vision.org.au/","Around the world"],
["lifefm","Life FM","New Zealand","https://www.lifefm.co.nz/","Around the world"],
["chvn","CHVN","Winnipeg, Canada","https://www.chvnradio.com/","Around the world"]];
/* artist radio inside streaming apps: [artist, description] */
const ARTISTS=[["Hillsong UNITED","Youthful worship from Sydney, Australia"],["Hillsong Worship","Worship anthems from Hillsong Church"],["Hillsong Young & Free","Upbeat worship from Hillsong's youth"],["Bethel Music","Worship collective from Redding, California"],["Bethel Live","Bethel Music's live worship recordings"],["Jesus Culture","Worship born out of a youth revival"],["Elevation Worship","Worship from Elevation Church"],["Maverick City Music","Gospel-infused worship collective"],["Passion","Worship from the Passion student gatherings"],["Planetshakers","High-energy worship from Melbourne"],["Brandon Lake","Worship leader and songwriter"],["Forrest Frank","Feel-good Christian pop"]];
const aKey=n=>"radio:a-"+n.toLowerCase().replace(/[^a-z0-9]+/g,"-");
function radio(){const G3=[...new Set(RADIO.map(r=>r[4]))];
$("#main").innerHTML=`<section class="band"><h2>Christian radio</h2><p>${RADIO.length} stations and ${ARTISTS.length} worship artist radios, from worship and hymns to hip-hop, Catholic and Orthodox. Each opens the station's own site to listen live.</p></section>
<div class="card list"><h3>Your favorites</h3><div data-strip="radio:">${stripHTML(["radio:"])}</div></div>
${G3.map(g=>`<div class="card list"><h3>${g}</h3>${RADIO.filter(r=>r[4]==g).map(r=>podRow("radio:"+r[0])).join("")}</div>`+(g=="Worship and praise"?`<div class="card list"><h3>Worship artist radio</h3><p class="mut" style="margin:0 2px 4px">Each opens the artist in Spotify or YouTube Music. Tap the artist's Radio there for nonstop music from them and similar artists.</p>${ARTISTS.map(([n])=>podRow(aKey(n))).join("")}</div>`:"")).join("")}
<div class="card list"><a class="lk" href="https://tunein.com/search/?query=christian%20radio" target="_blank" rel="noopener"><span class="t"><b>Find more on TuneIn</b><span class="mut">Thousands of Christian stations worldwide</span></span>${EXT}</a></div>
<p class="mut" style="margin:0 4px 14px">Listening adds embers, up to 3 a day across radio and podcasts.</p>`}

/* =========================================================
   Favorites: tap the ember to keep something at the top
   ========================================================= */
if(!S.fav)S.fav=[];
const isFav=k=>S.fav.includes(k);
const favBtn=(k,label)=>`<button class="fav" data-fav="${esc(k)}" aria-pressed="${isFav(k)}" aria-label="Favorite: ${esc(label||k)}" title="Favorite">${glyph()}</button>`;
const ITEMS={};
RADIO.forEach(([id,n,s2,u])=>ITEMS["radio:"+id]={n,s:s2,links:[["Listen",u]],earn:"pod"});
ARTISTS.forEach(([n,d])=>ITEMS[aKey(n)]={n:n+" Radio",s:d,links:[["Spotify",`https://open.spotify.com/search/${encodeURIComponent(n)}`],["YouTube",`https://music.youtube.com/search?q=${encodeURIComponent(n+" radio")}`]],earn:"pod"});
FEAT.forEach(([n,w,a,sp])=>ITEMS["pod:"+n]={n,s:w,links:[["Apple",a],["Spotify",sp]],earn:"pod"});
Object.values(POD).flat().forEach(n=>{if(!ITEMS["pod:"+n])ITEMS["pod:"+n]={n,s:"Search in Apple Podcasts",links:[["Listen",`https://podcasts.apple.com/us/search?term=${encodeURIComponent(n)}`]],earn:"pod"}});
DEVLINKS.forEach(([id,n,s2,u])=>ITEMS["dev:"+id]={n,s:s2,links:[["Read",u]],earn:"devo"});
PLANS.forEach((p,i)=>ITEMS["plan:"+i]={n:p[0],s:`Today: ${p[2]}`,act:()=>openPlan(i)});
BGV.forEach(([c,n])=>ITEMS["bg:"+c]={n,s:c});TRS.forEach(([c,n])=>ITEMS["tr:"+c]={n,s:"Free in Ember"});
function podRow(k){const it=ITEMS[k];if(!it)return"";return `<div class="h fp"><span class="t"><b>${esc(it.n)}</b><span class="mut">${esc(it.s)}</span></span>${favBtn(k,it.n)}<span class="pb">${it.links.map(([l,u])=>`<a class="pill" href="${u}" target="_blank" rel="noopener" data-earn="${it.earn}" aria-label="${esc(it.n)}: ${l}">${l}</a>`).join("")}</span></div>`}
function stripHTML(prefixes){const ks=S.fav.filter(k=>prefixes.some(p=>k.startsWith(p))&&ITEMS[k]);
if(!ks.length)return `<p class="mut" style="margin:4px 2px 12px">Tap the ember ${glyph()} beside anything to keep it here.</p>`.replace(glyph(),`<span class="inl">${glyph()}</span>`);
return ks.map(k=>{const it=ITEMS[k];return it.act?`<div class="h fp"><button class="pl" data-act="${esc(k)}"><span class="t"><b>${esc(it.n)}</b><span class="mut">${esc(it.s)}</span></span><span class="pill">Read</span></button>${favBtn(k,it.n)}</div>`:podRow(k)}).join("")}
function renderStrips(){$$("[data-strip]").forEach(el=>{const t=el.dataset.strip;el.innerHTML=t=="bgchips"?bgChips():stripHTML(t.split(","))});const tr=$("#tr");if(tr)tr.innerHTML=trOptions()}
function toggleFav(k){const on=!isFav(k);S.fav=on?[...S.fav,k]:S.fav.filter(x=>x!=k);save();
$$(".fav").forEach(b=>{if(b.dataset.fav==k){b.setAttribute("aria-pressed",on);if(on&&!RM.matches&&b.animate)b.animate([{transform:"scale(1)"},{transform:"scale(1.35)"},{transform:"scale(1)"}],{duration:350})}});
renderStrips();const it=ITEMS[k];toast(on?`${it?it.n:"Added"} is now a favorite.`:`Removed ${it?it.n:"it"} from favorites.`)}
/* one listener for favorites, favorite shortcuts, and links that earn embers */
document.addEventListener("click",e=>{
const f=e.target.closest(".fav");if(f){e.preventDefault();toggleFav(f.dataset.fav);return}
const ac=e.target.closest("[data-act]");if(ac){const it=ITEMS[ac.dataset.act];if(it&&it.act)it.act();return}
const a=e.target.closest("a[data-earn]");if(!a)return;const k=a.dataset.earn;let res=null;
if(k=="pod"){const g=extra("pod");if(g){res={g};toast(`+${g} embers. Enjoy listening.`)}}
else if(k=="devo")res=doMore("devo","devo");
else if(k=="ch"){const R=`${S.book} ${S.ch}`,rd=S.read[day()]||(S.read[day()]=[]);if(!done("bible")){res=toggle("bible");rd.push(R)}else if(!counted(R)){const g=extra("ch");rd.push(R);res=g?{g}:null}save()}
if(res)fx(a,res)});

/* =========================================================
   Router
   ========================================================= */
/* tab icons: simple line drawings, 24x24 */
const ICON={today:'<path d="M12 3c1.6 3.6 6 5.6 6 11a6 6 0 0 1-12 0c0-3 1.8-5 3.4-6.6.3 2 1.4 3.1 2.6 3.1-1-3 0-5.5 0-7.5z"/>',
jar:'<path d="M8 3h8v3H8z"/><path d="M7.5 6h9c1.6 1 2.5 2.6 2.5 4.5V18a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-7.5C5 8.6 5.9 7 7.5 6z"/><path d="M9 14.5a3 3 0 0 0 6 0"/>',
bible:'<path d="M6 3.5h11.5v14H7.5A1.5 1.5 0 0 0 6 19z"/><path d="M6 19a1.5 1.5 0 0 0 1.5 1.5h10v-3"/><path d="M11.75 6.5v7M9.25 9h5"/>',
devos:'<path d="M4 10h12v3.5A5.5 5.5 0 0 1 10.5 19h-1A5.5 5.5 0 0 1 4 13.5z"/><path d="M16 11.5h1.25a2.25 2.25 0 0 1 0 4.5H15.5"/><path d="M8 3.5c0 1.5 1 1.5 1 3M12 3.5c0 1.5 1 1.5 1 3"/>',
radio:'<rect x="3.5" y="9" width="17" height="11" rx="2.5"/><path d="M7 9l9.5-5"/><circle cx="8.5" cy="14.5" r="2"/><path d="M13.5 13h4M13.5 16h4"/>',
grow:'<path d="M12 21v-9"/><path d="M12 12c0-4 3-6.5 7.5-6.5 0 4-3 6.5-7.5 6.5z"/><path d="M12 14.5c0-3.2-2.5-5.5-6.5-5.5 0 3.2 2.5 5.5 6.5 5.5z"/>',
church:'<path d="M12 2.5v4M10 4.5h4"/><path d="M5 21v-9.5l7-5 7 5V21z"/><path d="M10 21v-3.5a2 2 0 0 1 4 0V21"/>'};
const TABS=[["today","Today",today],["jar","Jar",jar],["bible","Bible",bible],["devos","Devos",devos],["radio","Radio",radio],["grow","Grow",grow],["church","Church",church]];
let tab="today";
$("#nav").innerHTML=TABS.map(t=>`<button role="tab" data-n="${t[0]}"><span class="ic"><svg viewBox="0 0 24 24" aria-hidden="true">${ICON[t[0]]}</svg></span><span class="lb">${t[1]}</span></button>`).join("");
function go(n,section){tab=n;$$("#nav button").forEach(b=>b.setAttribute("aria-selected",b.dataset.n==n));$("#main").scrollTop=0;TABS.find(t=>t[0]==n)[2](section)}
$$("#nav button").forEach(b=>b.onclick=()=>go(b.dataset.n));
guard();chip();go("today");rewards();
if("serviceWorker"in navigator)addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
