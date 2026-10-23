boot(d=>{const c=compute(d),done=new Set(d.results.map(r=>String(r.race_id)));
const nx=c.races.filter(r=>!done.has(String(r.id))).sort((a,b)=>a.race_date.localeCompare(b.race_date))[0];
$('#next').innerHTML='<h2>Prochain GP</h2>'+(nx?`<p class="big">${esc(nx.name)}</p><p class="mut">${esc(nx.circuit||'')} · ${fmt(nx.race_date)}${+nx.has_sprint?' · Sprint':''}</p><a class="btn small" href="results.html">Saisir les résultats</a>`:'<p class="empty">Aucun GP à venir. <a href="calendar.html">Ajoutes-en un</a>.</p>');
const li=(a,fn)=>a.length?a.slice(0,5).map((x,i)=>`<li><i>${i+1}</i><span>${fn(x)}</span><b>${x.pts}</b></li>`).join(''):'<li class="empty">Rien à afficher pour l’instant.</li>';
$('#topD').innerHTML=li(c.drivers,x=>esc(x.name));
$('#topT').innerHTML=li(c.teams,x=>`<em style="background:${esc(x.color)}"></em>${esc(x.name)}`)});
