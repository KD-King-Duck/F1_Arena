boot(d=>{const rf=$('#rf'),sf=$('#sf'),done=new Set(d.results.map(r=>String(r.race_id)));
const races=d.races.filter(r=>r.season_id==d.sid).sort((a,b)=>a.race_date.localeCompare(b.race_date));
$('#list').innerHTML=d.seasons.length?(races.length?races.map((r,i)=>`<article class="card"><span class="num">${i+1}</span><div><h3>${esc(r.name)}</h3><p>${esc(r.circuit||'Circuit non précisé')} · ${fmt(r.race_date)}${+r.has_sprint?' · <b class="tag">Sprint</b>':''} · ${done.has(String(r.id))?'Résultats saisis':'À venir'}</p></div><div class="acts"><button data-e="${r.id}">Modifier</button><button class="del" data-d="${r.id}">Supprimer</button></div></article>`).join(''):'<p class="empty">Aucun GP dans cette saison. Ajoutes-en un avec le formulaire.</p>'):'<p class="empty">Crée d’abord une saison.</p>';
bindForm(rf,'races',f=>({season_id:d.sid,name:f.nm.value.trim(),circuit:f.circ.value.trim(),race_date:f.dt.value,has_sprint:f.spr.checked?1:0}));
bindList($('#list'),'races',d.races,r=>{rf.nm.value=r.name;rf.circ.value=r.circuit||'';rf.dt.value=r.race_date;rf.spr.checked=!!+r.has_sprint},rf);
sf.onsubmit=async e=>{e.preventDefault();try{await post({t:'seasons',data:{name:sf.sn.value.trim()}});const nd=await load();localStorage.season=nd.seasons.at(-1).id;location.reload()}catch(x){toast(x.message,1)}};
$('#delSeason').onclick=async()=>{if(!d.sid||!confirm('Supprimer cette saison, ses GP et ses résultats ?'))return;try{await del('seasons',d.sid);localStorage.season='';location.reload()}catch(x){toast(x.message,1)}};
if(!d.seasons.length)$$('button',rf).forEach(b=>b.disabled=true)});
