const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>[...root.querySelectorAll(s)];
document.addEventListener("DOMContentLoaded",()=>{
 const toggle=$(".menu-toggle"),links=$(".navlinks");
 if(toggle&&links)toggle.addEventListener("click",()=>links.classList.toggle("open"));
 const page=document.body.dataset.page;
 $$(".navlinks a").forEach(a=>{if(a.dataset.page===page)a.classList.add("active")});
 if(page==="home")renderHome();
 if(page==="standings")renderStandings();
 if(page==="drivers")renderDrivers();
 if(page==="teams")renderTeams();
 if(page==="calendar")renderCalendar();
 if(page==="predictions")renderPredictions();
});
function driverRow(d,i){return `<tr><td class="pos ${i<3?'top':''}">${i+1}</td><td><div class="driver-cell"><span class="driver-avatar">${d.code}</span><span><span class="team-mark" style="background:${d.color}"></span>${d.first} ${d.last}</span></div></td><td class="muted">${d.team}</td><td class="points">${d.points}</td></tr>`}
function renderHome(){
 const table=$("#home-standings"); if(table)table.innerHTML=[...drivers].sort((a,b)=>b.points-a.points).slice(0,5).map(driverRow).join("");
 const race=$("#next-race");if(race)race.innerHTML=`<div class="round">ROUND 04 / NEXT UP</div><h3>Bahrain Grand Prix</h3><p>Sakhir · Bahrain · 10–12 APR</p><div class="bar"><span style="width:42%"></span></div><p style="margin-top:10px;font-size:11px">SEASON PROGRESS <strong>42%</strong></p>`;
 const count=$("#driver-count");if(count)count.textContent=drivers.length;
}
function renderStandings(){
 const body=$("#standings-body");if(!body)return;
 const draw=()=>{let term=($("#driver-search")?.value||"").toLowerCase();let list=[...drivers].filter(d=>(d.first+" "+d.last+" "+d.team).toLowerCase().includes(term)).sort((a,b)=>b.points-a.points);body.innerHTML=list.map(driverRow).join("")||`<tr><td colspan="4" class="empty">No drivers found.</td></tr>`};
 $("#driver-search")?.addEventListener("input",draw);draw();
 const teamBody=$("#team-standings-body");if(teamBody)teamBody.innerHTML=[...teams].sort((a,b)=>b.points-a.points).map((t,i)=>`<tr><td class="pos ${i<3?'top':''}">${i+1}</td><td><span class="team-mark" style="background:${t.color}"></span><strong>${t.name}</strong></td><td class="muted">${t.drivers.join(" · ")}</td><td class="points">${t.points}</td></tr>`).join("");
}
function renderDrivers(){
 const grid=$("#drivers-grid");if(!grid)return;
 const draw=()=>{let term=($("#driver-search")?.value||"").toLowerCase();let list=drivers.filter(d=>(d.first+" "+d.last+" "+d.team).toLowerCase().includes(term));grid.innerHTML=list.map(d=>`<article class="card driver-card"><div class="driver-top" style="border-color:${d.color}"><span class="driver-number">${d.number}</span><span class="tag">${d.country}</span></div><div class="card-pad"><div class="muted">${d.team}</div><h3>${d.first}<br>${d.last}</h3><div class="driver-meta"><span class="muted">SEASON POINTS</span><strong>${d.points}</strong></div></div></article>`).join("")||`<div class="empty">No drivers found.</div>`};
 $("#driver-search")?.addEventListener("input",draw);draw();
}
function renderTeams(){
 const grid=$("#teams-grid");if(!grid)return;
 grid.innerHTML=teams.map(t=>`<article class="card team-card" style="--team-color:${t.color}"><div class="eyebrow">${t.short} / CONSTRUCTOR</div><h3>${t.name}</h3><div class="team-drivers">${t.drivers.map(d=>`<span class="pill">${d}</span>`).join("")}</div><div class="driver-meta"><span class="muted">CONSTRUCTOR POINTS</span><strong>${t.points}</strong></div><div class="bar"><span style="width:${Math.max(4,t.points/510*100)}%;background:${t.color}"></span></div></article>`).join("");
}
function renderCalendar(){
 const list=$("#calendar-list");if(!list)return;
 const draw=()=>{let f=$("#race-filter")?.value||"all";list.innerHTML=races.filter(r=>f==="all"||r.status===f).map(r=>`<div class="calendar-row"><div class="calendar-round">${String(r.round).padStart(2,"0")}</div><div><h3>${r.name}</h3><p>${r.country} · ${r.date}</p></div><span class="tag">${r.sprint?"SPRINT":"GRAND PRIX"} · ${r.status==="completed"?"COMPLETED":"UPCOMING"}</span></div>`).join("")};
 $("#race-filter")?.addEventListener("change",draw);draw();
}
function renderPredictions(){
 const form=$("#prediction-form");if(!form)return;
 const opts=drivers.map(d=>`<option value="${d.id}">${d.first} ${d.last}</option>`).join("");
 const teamOpts=teams.map(t=>`<option>${t.name}</option>`).join("");
 form.innerHTML=[
 ["winner","Race winner",opts],["podium2","2nd place",opts],["podium3","3rd place",opts],
 ["pole","Pole position",opts],["fastest","Fastest lap",opts],["team","Top constructor",teamOpts]
 ].map(([name,label,options])=>`<div class="prediction-field"><label for="${name}">${label}</label><select class="field" id="${name}" name="${name}"><option value="">Select your pick</option>${options}</select></div>`).join("")+
 `<div class="prediction-field"><label for="safety">Safety car?</label><select class="field" id="safety" name="safety"><option value="">Choose</option><option>Yes</option><option>No</option></select></div>`;
 const saved=JSON.parse(localStorage.getItem("f1arena-prediction")||"null");
 if(saved)Object.entries(saved).forEach(([k,v])=>{let el=$("#"+k);if(el)el.value=v});
 form.addEventListener("submit",e=>{e.preventDefault();let data={};new FormData(form).forEach((v,k)=>data[k]=v);localStorage.setItem("f1arena-prediction",JSON.stringify(data));$("#prediction-message").textContent="Prediction saved on this device. Connect a backend to store it in your MySQL database.";$("#prediction-message").hidden=false});
}
