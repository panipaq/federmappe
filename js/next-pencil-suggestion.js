/* ---------------- Empfehlung: nächster Stift (Sidebar) ---------------- */
function suggestNextPencils(n){
    const owned = ownedPalette().filter(p=>!isNeutralPencil(p));
    const nonOwned = palette.filter(p=>!p.owned && !isNeutralPencil(p));
    if(owned.length===0 || nonOwned.length===0) return [];

    const ownedHues = owned
        .map(p=>({ p, h: rgbToHsl(hexToRgb(p.hex)).h }))
        .sort((a,b)=>a.h-b.h);

    function boundingNeighbors(h){
        const m = ownedHues.length;
        if(m===1) return { low: ownedHues[0].p, high: ownedHues[0].p };
        for(let i=0;i<m;i++){
            const a = ownedHues[i];
            const b = ownedHues[(i+1)%m];
            let aH = a.h;
            let bH = b.h <= aH ? b.h + 360 : b.h;
            let hh = h < aH ? h + 360 : h;
            if(hh >= aH && hh <= bH){
                return { low: a.p, high: b.p };
            }
        }
        return { low: ownedHues[m-1].p, high: ownedHues[0].p };
    }

    const ranked = nonOwned.map(cand=>{
        const h = rgbToHsl(hexToRgb(cand.hex)).h;
        let minDist = Infinity;
        ownedHues.forEach(o=>{
            let d = Math.abs(o.h - h);
            d = Math.min(d, 360-d);
            if(d < minDist) minDist = d;
        });
        const { low, high } = boundingNeighbors(h);
        return { pencil: cand, gapDist: minDist, low, high };
    });

    ranked.sort((a,b)=> b.gapDist - a.gapDist);

    // Ergebnisse etwas hue-divers halten: keine zwei Empfehlungen mit fast identischem Farbton direkt hintereinander
    const picked = [];
    for(const r of ranked){
        if(picked.length >= n) break;
        const h = rgbToHsl(hexToRgb(r.pencil.hex)).h;
        const tooClose = picked.some(p=>{
            const ph = rgbToHsl(hexToRgb(p.pencil.hex)).h;
            let d = Math.abs(ph - h);
            d = Math.min(d, 360-d);
            return d < 12;
        });
        if(!tooClose) picked.push(r);
    }
    return picked;
}

const suggestionBox = document.getElementById('suggestionBox');

function renderSuggestion(){
    const owned = ownedPalette();
    const nonOwned = palette.filter(p=>!p.owned);

    if(owned.length===0){
        suggestionBox.innerHTML = `<p class="suggestion-empty">Wähle zuerst deine Stifte über „⚙︎ Auswahl" aus — dann zeige ich dir hier, welche neuen Stifte deine Sammlung am sinnvollsten ergänzen.</p>`;
        return;
    }
    if(nonOwned.length===0){
        suggestionBox.innerHTML = `<p class="suggestion-empty">Du besitzt schon alle 120 Farben — es gibt nichts mehr zu ergänzen.</p>`;
        return;
    }
    if(owned.every(isNeutralPencil)){
        suggestionBox.innerHTML = `<p class="suggestion-empty">Du hast bisher nur neutrale Töne (Schwarz/Weiß/Grau) ausgewählt — wähle mindestens eine bunte Farbe, damit ich Ergänzungen vorschlagen kann.</p>`;
        return;
    }

    const suggestions = suggestNextPencils(5);
    if(!suggestions.length){ suggestionBox.innerHTML=''; return; }
    if(suggestionIndex >= suggestions.length) suggestionIndex = 0;
    const s = suggestions[suggestionIndex];

    suggestionBox.innerHTML = `
    <div class="suggestion-label" style="margin:0 2px 8px;">Empfehlung: nächster Stift</div>
    <div class="suggestion-slider">
      <button class="slider-arrow" id="prevSuggestion" aria-label="Vorherige Empfehlung">‹</button>
      <div class="suggestion-card">
        <div class="pencil-tip">
          <div class="cap"></div>
          <div class="body" style="background:${s.pencil.hex}"></div>
          <div class="point"></div>
          <div class="lead"></div>
        </div>
        <div class="suggestion-text">
          <div class="suggestion-name">${s.pencil.name}<span class="suggestion-num">Nr. ${s.pencil.num}</span></div>
          <p class="suggestion-desc">Liegt zwischen <b>${s.low.name}</b> und <b>${s.high.name}</b> auf dem Farbkreis.</p>
        </div>
      </div>
      <button class="slider-arrow" id="nextSuggestion" aria-label="Nächste Empfehlung">›</button>
    </div>
    <div class="slider-footer">
      <span class="slider-counter">${suggestionIndex+1} / ${suggestions.length}</span>
      <button class="mark-owned-btn" id="markOwnedBtn">Hab ich jetzt</button>
    </div>
  `;

    document.getElementById('prevSuggestion').onclick = ()=>{
        suggestionIndex = (suggestionIndex - 1 + suggestions.length) % suggestions.length;
        renderSuggestion();
    };
    document.getElementById('nextSuggestion').onclick = ()=>{
        suggestionIndex = (suggestionIndex + 1) % suggestions.length;
        renderSuggestion();
    };
    document.getElementById('markOwnedBtn').onclick = ()=>{
        s.pencil.owned = true;
        savePalette();
        suggestionIndex = 0;
        renderAll();
    };
}
