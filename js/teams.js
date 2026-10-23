boot(d=>{const c=compute(d),f=$('#f');
$('#list').innerHTML=c.teams.length?c.teams.map(t=>{const ds=d.drivers.filter(x=>x.team_id==t.id).map(x=>esc(x.name)).join(', ')||'Aucun pilote';
return `<article class="card" style="--c:${esc(t.color)}"><span class="bar"></span><div><h3>${esc(t.name)}</h3><p>${ds} · ${t.pts} pts</p></div><div class="acts"><button data-e="${t.id}">Modifier</button><button class="del" data-d="${t.id}">Supprimer</button></div></article>`}).join(''):'<p class="empty">Aucune écurie. Crée la première avec le formulaire.</p>';
bindForm(f,'teams',f=>({name:f.nm.value.trim(),color:f.col.value}));
bindList($('#list'),'teams',d.teams,r=>{f.nm.value=r.name;f.col.value=r.color},f)});
