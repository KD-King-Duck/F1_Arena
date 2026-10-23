boot(d=>{const races=d.races.filter(r=>r.season_id==d.sid).sort((a,b)=>a.race_date.localeCompare(b.race_date)),rs=$('#race'),ks=$('#kind'),box=$('#rows');
if(!races.length||!d.drivers.length){$('#entry').innerHTML='<p class="empty">Il faut au moins un GP dans le <a href="calendar.html">calendrier</a> et un pilote dans la liste des <a href="drivers.html">pilotes</a>.</p>'}
else{rs.innerHTML=races.map(r=>`<option value="${r.id}">${esc(r.name)}</option>`).join('');
const opts='<option value="">—</option>'+d.drivers.map(x=>`<option value="${x.id}">${x.number!=null?'#'+esc(x.number)+' ':''}${esc(x.name)}</option>`).join('');
const fill=()=>{const ex=d.results.filter(x=>x.race_id==rs.value&&x.kind==ks.value);
box.innerHTML=d.drivers.map((_,i)=>`<label class="pos"><span>P${i+1}</span><select data-p="${i+1}">${opts}</select></label>`).join('');
$$('select',box).forEach(s=>{const e=ex.find(x=>x.position==s.dataset.p);if(e)s.value=e.driver_id})};
const kinds=()=>{const r=races.find(x=>x.id==rs.value);ks.innerHTML='<option value="gp">Grand Prix</option>'+(+r.has_sprint?'<option value="sprint">Sprint</option>':'');fill()};
rs.onchange=kinds;ks.onchange=fill;kinds();
$('#save').onclick=async()=>{const rows=$$('select',box).filter(s=>s.value).map(s=>{const dr=d.drivers.find(x=>x.id==s.value);return{position:+s.dataset.p,driver_id:+s.value,team_id:dr.team_id?+dr.team_id:null}});
if(new Set(rows.map(r=>r.driver_id)).size<rows.length)return toast('Un pilote apparaît deux fois',1);
try{await post({t:'results',race_id:+rs.value,kind:ks.value,rows});d.results=d.results.filter(x=>!(x.race_id==rs.value&&x.kind==ks.value)).concat(rows.map(r=>({...r,race_id:rs.value,kind:ks.value})));toast('Résultats enregistrés')}catch(e){toast(e.message,1)}}}
const V={};d.scoring.forEach(s=>V[s.kind+s.position]=s.points);let n=Math.max(10,...d.scoring.map(s=>+s.position));
const drawS=()=>{$('#scoring').innerHTML='<tr><th>Position</th><th>Grand Prix</th><th>Sprint</th></tr>'+Array.from({length:n},(_,i)=>`<tr><td>P${i+1}</td>`+['gp','sprint'].map(k=>`<td><input type="number" min="0" data-k="${k}" data-p="${i+1}" value="${V[k+(i+1)]??0}"></td>`).join('')+'</tr>').join('')};
$('#scoring').oninput=e=>{const i=e.target;V[i.dataset.k+i.dataset.p]=+i.value||0};
$('#addPos').onclick=()=>{n++;drawS()};
$('#saveScoring').onclick=async()=>{const rows=[];for(let p=1;p<=n;p++)for(const k of['gp','sprint'])if(V[k+p])rows.push({kind:k,position:p,points:V[k+p]});try{await post({t:'scoring',rows});toast('Barème enregistré')}catch(e){toast(e.message,1)}};
drawS()});
