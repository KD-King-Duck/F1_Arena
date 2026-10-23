const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=s=>new Date(s+'T00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'});
async function api(q='',o){const r=await fetch('api.php'+q,o);let j;try{j=await r.json()}catch{throw new Error('API injoignable : démarre Apache et MySQL, puis importe F1_BDD.sql')}if(j.error)throw new Error(j.error);return j}
const post=b=>api('',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});
const del=(t,id)=>api(`?t=${t}&id=${id}`,{method:'DELETE'});
const load=()=>api('?t=all');
function toast(m,bad){let t=$('#toast');if(!t){t=document.createElement('div');t.id='toast';document.body.append(t)}t.textContent=m;t.className='show'+(bad?' bad':'');clearTimeout(t._h);t._h=setTimeout(()=>t.className='',3500)}
const logo='<svg viewBox="0 0 64 28" class="mark" aria-hidden="true"><path d="M0 4h17l-3 5H0zM0 12h12l-3 5H0zM24 2h40l-3 6H31l-2 4h24l-3 6H26l-3 8h-9z"/></svg>';
const pages=[['index','Accueil'],['calendar','Calendrier'],['results','Résultats'],['standings','Classement'],['drivers','Pilotes'],['teams','Écuries']];
const seasonId=ss=>{const s=+localStorage.season;return ss.some(x=>x.id==s)?s:ss[0]?.id};
function nav(ss){const cur=location.pathname.split('/').pop().replace('.html','')||'index';
$('#nav').innerHTML=`<a class="brand" href="index.html">${logo}<b>Arena</b></a><nav>${pages.map(([p,l])=>`<a href="${p}.html"${p==cur?' class="on"':''}>${l}</a>`).join('')}</nav><select id="seasonSel" aria-label="Saison">${ss.map(s=>`<option value="${s.id}"${s.id==seasonId(ss)?' selected':''}>${esc(s.name)}</option>`).join('')}</select>`;
$('#seasonSel').onchange=e=>{localStorage.season=e.target.value;location.reload()}}
async function boot(fn){try{const d=await load();nav(d.seasons);d.sid=seasonId(d.seasons);await fn(d)}catch(e){nav([]);toast(e.message,1)}}
function compute(d){const rs=d.races.filter(r=>r.season_id==d.sid),rid=new Set(rs.map(r=>String(r.id))),pts={};
d.scoring.forEach(s=>pts[s.kind+s.position]=+s.points);const D={},T={};
d.drivers.forEach(x=>D[x.id]={...x,pts:0,wins:0,podiums:0});d.teams.forEach(x=>T[x.id]={...x,pts:0,wins:0,podiums:0});
d.results.filter(r=>rid.has(String(r.race_id))).forEach(r=>{const p=pts[r.kind+r.position]||0,a=D[r.driver_id],t=T[r.team_id];
for(const o of[a,t])if(o){o.pts+=p;if(r.kind=='gp'){if(r.position==1)o.wins++;if(r.position<=3)o.podiums++}}});
const by=(a,b)=>b.pts-a.pts||b.wins-a.wins||b.podiums-a.podiums||a.name.localeCompare(b.name);
return{drivers:Object.values(D).sort(by),teams:Object.values(T).sort(by),races:rs}}
function bindForm(f,t,get){f.onsubmit=async e=>{e.preventDefault();try{await post({t,id:f.rid.value||null,data:get(f)});location.reload()}catch(x){toast(x.message,1)}};
f.addEventListener('reset',()=>setTimeout(()=>f.rid.value='',0))}
function bindList(el,t,rows,fill,f){el.onclick=async e=>{const b=e.target.closest('button');if(!b)return;
if(b.dataset.d){if(!confirm('Supprimer définitivement ? Les résultats liés seront aussi supprimés.'))return;try{await del(t,b.dataset.d);location.reload()}catch(x){toast(x.message,1)}}
else if(b.dataset.e){fill(rows.find(r=>r.id==b.dataset.e));f.rid.value=b.dataset.e;f.scrollIntoView({behavior:'smooth'})}}}
