boot(d=>{const c=compute(d),f=$('#f');
f.team.innerHTML='<option value="">Sans écurie</option>'+d.teams.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join('');
$('#list').innerHTML=c.drivers.length?c.drivers.map(x=>{const t=d.teams.find(t=>t.id==x.team_id);
return `<article class="card" style="--c:${esc(t?.color||'#555')}"><span class="num">${x.number??'–'}</span><div><h3>${esc(x.name)}</h3><p>${t?esc(t.name):'Sans écurie'} · ${x.pts} pts</p></div><div class="acts"><button data-e="${x.id}">Modifier</button><button class="del" data-d="${x.id}">Supprimer</button></div></article>`}).join(''):'<p class="empty">Aucun pilote. Crée le premier avec le formulaire.</p>';
bindForm(f,'drivers',f=>({name:f.nm.value.trim(),number:f.num.value?+f.num.value:null,team_id:f.team.value?+f.team.value:null}));
bindList($('#list'),'drivers',d.drivers,r=>{f.nm.value=r.name;f.num.value=r.number??'';f.team.value=r.team_id??''},f)});
