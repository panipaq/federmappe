/* ---------------- Ergebniskarten (Farbschemata) ---------------- */
const resultsEl = document.getElementById('results');
const copyText = document.getElementById('copyText');
const schemeTitle = document.getElementById('schemeTitle');
const schemeDesc = document.getElementById('schemeDesc');

function tagFor(dist){
    if(dist < 15) return {cls:'exact', label:'Exakt'};
    if(dist < 45) return {cls:'near', label:'Nah'};
    return {cls:'approx', label:'Näherung'};
}

function renderResults(scheme, base){
    resultsEl.innerHTML = '';
    scheme.matched.forEach((m,i)=>{
        const isBaseCard = m.pencil.id === base.id;
        const tag = isBaseCard ? {cls:'base', label:'Basis'} : tagFor(m.dist);
        const ALT_MAX_DIST = 70;
        const alternatives = (m.candidates || [])
            .filter(c => c.id !== m.pencil.id && c.dist <= ALT_MAX_DIST)
            .slice(0,5);
        const altRowHtml = alternatives.length ? `
      <div class="alt-row">
        ${alternatives.map(a=>`<button class="alt-swatch" data-slot="${i}" data-pencil="${a.id}" style="background:${a.hex}" title="${a.name} · Nr. ${a.num}"></button>`).join('')}
      </div>` : '';
        const resetHtml = m.isOverride ? `<button class="reset-alt-btn" data-slot="${i}">↺ Beste Wahl</button>` : '';

        const area = m.target.area;
        const areaHtml = area ? `<div class="area-badge">${area} Fläche</div>` : '';

        const card = document.createElement('div');
        card.className = 'result-card';
        if(area) card.style.paddingTop = '26px';
        card.innerHTML = `
      ${areaHtml}
      <div class="pencil-tip">
        <div class="cap"></div>
        <div class="body" style="background:${m.pencil.hex}"></div>
        <div class="point"></div>
        <div class="lead"></div>
      </div>
      <div class="rname">${m.pencil.name}</div>
      <div class="rnum">Nr. ${m.pencil.num}</div>
      <span class="rtag ${tag.cls}">${tag.label}</span>
      ${resetHtml}
      ${altRowHtml}
    `;
        resultsEl.appendChild(card);
    });

    const def = schemeDefs[currentScheme];
    schemeTitle.textContent = def.label;
    schemeDesc.textContent = def.desc;

    copyText.value = `${def.label} — Basis: ${base.name} (Nr. ${base.num})\n` +
        scheme.matched.map(m=>`${m.target.area ? m.target.area + ' — ' : ''}Nr. ${m.pencil.num} — ${m.pencil.name}`).join('\n');
}

resultsEl.addEventListener('click', (e)=>{
    const altBtn = e.target.closest('.alt-swatch');
    if(altBtn){
        const slot = parseInt(altBtn.dataset.slot, 10);
        overrides[slot] = altBtn.dataset.pencil;
        renderAll();
        return;
    }
    const resetBtn = e.target.closest('.reset-alt-btn');
    if(resetBtn){
        const slot = parseInt(resetBtn.dataset.slot, 10);
        delete overrides[slot];
        renderAll();
    }
});
