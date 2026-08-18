/* ---------------- Modus-Tabs (Farbschemata / Familien-Check / Paletten-Ideen) ---------------- */
const schemeSection = document.getElementById('schemeSection');
const familySection = document.getElementById('familySection');
const suggestSection = document.getElementById('suggestSection');

document.getElementById('modeTabs').addEventListener('click', (e)=>{
    const btn = e.target.closest('.mode-tab');
    if(!btn) return;
    appMode = btn.dataset.mode;
    document.querySelectorAll('.mode-tab').forEach(b=>b.classList.toggle('active', b.dataset.mode===appMode));
    schemeSection.style.display = appMode==='schemes' ? '' : 'none';
    familySection.style.display = appMode==='family' ? '' : 'none';
    suggestSection.style.display = appMode==='suggest' ? '' : 'none';
    if(appMode==='family') renderFamilyCheck();
    if(appMode==='suggest') renderPaletteSuggestions();
});

/* ---------------- Schema-Tabs ---------------- */
const schemeTabs = document.getElementById('schemeTabs');
function renderTabs(){
    schemeTabs.innerHTML = '';
    Object.entries(schemeDefs).forEach(([key,def])=>{
        const b = document.createElement('button');
        b.className = 'scheme-tab' + (key===currentScheme?' active':'');
        b.textContent = def.label;
        b.addEventListener('click', ()=>{ currentScheme = key; overrides={}; renderAll(); });
        schemeTabs.appendChild(b);
    });
}

/* ---------------- Master render ---------------- */
function renderAll(){
    renderSwatches();
    renderSelectedInfo();
    renderTabs();
    renderSuggestion();
    if(appMode === 'family') renderFamilyCheck();
    if(appMode === 'suggest') renderPaletteSuggestions();

    const owned = ownedPalette();
    if(owned.length === 0){
        resultsEl.innerHTML = '<p style="font-size:13px;color:var(--ink-soft);">Wähle über „⚙︎ Auswahl" mindestens einen Stift aus, den du besitzt.</p>';
        wheelSvg.innerHTML = '';
        copyText.value = '';
        return;
    }

    let base = owned.find(p=>p.id===selectedId);
    if(!base){ base = owned[0]; selectedId = base.id; }

    const scheme = generateScheme(base, currentScheme);

    const displayedMatched = scheme.matched.map((m,i)=>{
        const overrideId = overrides[i];
        if(overrideId){
            const chosen = (m.candidates || []).find(c=>c.id===overrideId);
            if(chosen){
                return { ...m, pencil: chosen, dist: chosen.dist, isOverride: true };
            }
            delete overrides[i]; // Stift nicht mehr verfügbar (z. B. abgewählt)
        }
        return m;
    });
    const renderScheme = { targets: scheme.targets, matched: displayedMatched, baseHsl: scheme.baseHsl };

    renderWheelGradient();
    renderWheel(renderScheme, base);
    renderResults(renderScheme, base);
}

async function init(){
    swatchGrid.innerHTML = '<p style="color:rgba(247,242,231,0.5);font-size:12px;grid-column:1/-1;">Lade deine Auswahl…</p>';
    await loadPalette();
    if(!palette.find(p=>p.id===selectedId)){
        const fallback = palette.find(p=>p.owned) || palette[0];
        selectedId = fallback ? fallback.id : selectedId;
    }
    renderAll();
}
init();
