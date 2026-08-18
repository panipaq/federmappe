/* ---------------- Paletten-Ideen ---------------- */
const suggestSlotsEl = document.getElementById('suggestSlots');
const suggestPickerEl = document.getElementById('suggestPicker');
const paletteSuggestionsEl = document.getElementById('paletteSuggestions');
const suggestSlotLabels = ['Basis 1', 'Basis 2 (optional)'];

function renderSuggestSlots(){
    suggestSlotsEl.innerHTML = '';
    suggestBaseIds.forEach((id, i)=>{
        const pencil = id ? palette.find(p=>p.id===id) : null;
        const slot = document.createElement('div');
        slot.className = 'parent-slot' + (pencil ? ' filled' : '');
        slot.innerHTML = `
      <div class="chip" style="${pencil ? `background:${pencil.hex};` : ''}">
        ${pencil ? `<span class="clear-x" data-clear="${i}">✕</span>` : '+'}
      </div>
      <div class="lbl">${pencil ? pencil.name : suggestSlotLabels[i]}</div>
    `;
        slot.querySelector('.chip').addEventListener('click', (e)=>{
            if(e.target.closest('.clear-x')){
                suggestBaseIds[i] = null;
                suggestPickerSlot = null;
                paletteOverrides = {};
                renderSuggestSlots();
                renderSuggestPicker();
                renderPaletteSuggestions();
                return;
            }
            suggestPickerSlot = suggestPickerSlot === i ? null : i;
            renderSuggestPicker();
        });
        suggestSlotsEl.appendChild(slot);
    });
}

function renderSuggestPicker(){
    if(suggestPickerSlot === null){
        suggestPickerEl.style.display = 'none';
        suggestPickerEl.innerHTML = '';
        return;
    }
    const usedIds = suggestBaseIds.filter(Boolean);
    const options = ownedPalette().filter(p=>!usedIds.includes(p.id));
    suggestPickerEl.style.display = '';
    suggestPickerEl.innerHTML = `
    <div class="picker-title">${suggestSlotLabels[suggestPickerSlot]} wählen:</div>
    <div class="picker-grid">
      ${options.map(p=>`<div class="picker-swatch" data-pencil="${p.id}" style="background:${p.hex}" title="${p.name} · Nr. ${p.num}"></div>`).join('')}
    </div>
  `;
    suggestPickerEl.querySelectorAll('.picker-swatch').forEach(el=>{
        el.addEventListener('click', ()=>{
            suggestBaseIds[suggestPickerSlot] = el.dataset.pencil;
            suggestPickerSlot = null;
            paletteOverrides = {};
            renderSuggestSlots();
            renderSuggestPicker();
            renderPaletteSuggestions();
        });
    });
}

const paletteStyleDefs = [
    {
        key: 'harmonic',
        name: 'Harmonisch',
        desc: 'Ruhige, zusammenhängende Palette aus benachbarten Farbtönen — sicher und unaufdringlich.',
        build(a1, a2){
            const t = [];
            t.push({ h:a1.h, s:a1.s, l:a1.l, role:'Basis' });
            t.push({ h:a1.h-38, s:clamp(a1.s-0.05,0.1,1), l:clamp(a1.l-0.06,0.06,0.94), role:'Nachbar kühler' });
            t.push({ h:a1.h+38, s:clamp(a1.s-0.05,0.1,1), l:clamp(a1.l+0.06,0.06,0.94), role:'Nachbar wärmer' });
            if(a2){
                t.push({ h:a2.h, s:a2.s, l:a2.l, role:'2. Basis' });
            } else {
                t.push({ h:a1.h+16, s:clamp(a1.s-0.1,0.1,1), l:clamp(a1.l+0.24,0.06,0.94), role:'Aufhellung' });
            }
            t.push({ h:a1.h, s:clamp(a1.s-0.18,0.05,1), l:clamp(a1.l-0.26,0.06,0.94), role:'Verankerung' });
            return t;
        }
    },
    {
        key: 'contrast',
        name: 'Kontrastreich',
        desc: '60/30/10-Aufteilung mit kräftigem Komplementär-Akzent — lebendig und klar strukturiert.',
        build(a1, a2){
            const t = [];
            t.push({ h:a1.h, s:clamp(a1.s-0.15,0.1,1), l:clamp(a1.l+0.05,0.06,0.94), role:'60% Basis' });
            if(a2){
                t.push({ h:a2.h, s:clamp(a2.s-0.05,0.1,1), l:a2.l, role:'30% Support' });
            } else {
                t.push({ h:a1.h+130, s:clamp(a1.s-0.05,0.1,1), l:clamp(a1.l-0.05,0.06,0.94), role:'30% Support' });
            }
            t.push({ h:a1.h+180, s:clamp(a1.s+0.25,0.1,1), l:clamp(a1.l-0.12,0.06,0.94), role:'10% Akzent' });
            return t;
        }
    },
    {
        key: 'muted',
        name: 'Gedeckt',
        desc: 'Zurückgenommene, entsättigte Variante — gut für Hintergründe oder ruhige Bildstimmungen.',
        build(a1, a2){
            const t = [];
            t.push({ h:a1.h, s:clamp(a1.s-0.3,0.05,1), l:a1.l, role:'Basis gedeckt' });
            t.push({ h:a1.h-20, s:clamp(a1.s-0.34,0.05,1), l:clamp(a1.l-0.22,0.06,0.94), role:'Schatten' });
            t.push({ h:a1.h+20, s:clamp(a1.s-0.34,0.05,1), l:clamp(a1.l+0.22,0.06,0.94), role:'Licht' });
            if(a2){
                t.push({ h:a2.h, s:clamp(a2.s-0.32,0.05,1), l:a2.l, role:'2. Basis gedeckt' });
            } else {
                t.push({ h:a1.h+55, s:clamp(a1.s-0.38,0.05,1), l:a1.l, role:'Nachbar gedeckt' });
            }
            return t;
        }
    }
];

function generatePaletteSuggestions(){
    const bases = suggestBaseIds.filter(Boolean).map(id=>palette.find(p=>p.id===id)).filter(Boolean);
    if(bases.length === 0) return null;

    const a1 = rgbToHsl(hexToRgb(bases[0].hex));
    const a2 = bases[1] ? rgbToHsl(hexToRgb(bases[1].hex)) : null;
    const pool = ownedPalette();
    if(pool.length === 0) return [];

    const usedGlobal = new Set(); // über alle drei Paletten hinweg, damit sie sich stärker unterscheiden

    const result = paletteStyleDefs.map(style=>{
        const targets = style.build(a1, a2).map(t=>({ ...t, h: clampHue(t.h) }));
        const members = targets.map(t=>{
            const ranked = pool
                .map(p=>({ ...p, dist: hslDist(rgbToHsl(hexToRgb(p.hex)), t) }))
                .sort((x,y)=>x.dist-y.dist);
            let chosen = ranked.find(c=>!usedGlobal.has(c.id));
            if(!chosen) chosen = ranked[0];
            if(chosen) usedGlobal.add(chosen.id);
            return { pencil: chosen, role: t.role, candidates: ranked.slice(0,8) };
        });
        return { style, members };
    });

    // Overrides anwenden (falls Nutzer eine Alternative gewählt hat)
    result.forEach(pal=>{
        pal.members.forEach((m,i)=>{
            const key = `${pal.style.key}-${i}`;
            const overrideId = paletteOverrides[key];
            if(overrideId){
                const alt = m.candidates.find(c=>c.id===overrideId);
                if(alt){ m.pencil = alt; m.isOverride = true; }
                else { delete paletteOverrides[key]; }
            }
        });
    });

    return result;
}

function renderPaletteSuggestions(){
    renderSuggestSlots();
    renderSuggestPicker();

    const bases = suggestBaseIds.filter(Boolean);
    if(bases.length === 0){
        paletteSuggestionsEl.innerHTML = `<p class="family-empty">Wähle mindestens eine Ausgangsfarbe — dann schlage ich dir drei Paletten mit unterschiedlichem Charakter vor.</p>`;
        return;
    }
    if(ownedPalette().length === 0){
        paletteSuggestionsEl.innerHTML = `<p class="family-empty">Wähle über „⚙︎ Auswahl" mindestens ein paar Stifte aus, die du besitzt.</p>`;
        return;
    }

    const palettes = generatePaletteSuggestions();
    const ALT_MAX_DIST = 70;
    paletteSuggestionsEl.innerHTML = palettes.map(pal=>`
    <div class="palette-card">
      <div class="palette-card-head">
        <div>
          <div class="palette-name">${pal.style.name}</div>
          <div class="palette-desc">${pal.style.desc}</div>
        </div>
        <button class="palette-copy-btn" data-key="${pal.style.key}">Kopieren</button>
      </div>
      <div class="palette-members">
        ${pal.members.map((m,i)=>{
            const alternatives = (m.candidates || [])
                .filter(c => c.id !== m.pencil.id && c.dist <= ALT_MAX_DIST)
                .slice(0,5);
            const altRowHtml = alternatives.length ? `
            <div class="alt-row">
              ${alternatives.map(a=>`<button class="alt-swatch" data-key="${pal.style.key}" data-idx="${i}" data-pencil="${a.id}" style="background:${a.hex}" title="${a.name} · Nr. ${a.num}"></button>`).join('')}
            </div>` : '';
            const resetHtml = m.isOverride ? `<button class="reset-alt-btn" data-key="${pal.style.key}" data-idx="${i}">↺ Beste Wahl</button>` : '';
            return `
            <div class="palette-member">
              <div class="swatch" style="background:${m.pencil.hex}"></div>
              <div class="role">${m.role}</div>
              <div class="pname">${m.pencil.name}</div>
              <div class="pnum">Nr. ${m.pencil.num}</div>
              ${resetHtml}
              ${altRowHtml}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `).join('');

    paletteSuggestionsEl.querySelectorAll('.palette-copy-btn').forEach(btn=>{
        btn.addEventListener('click', ()=>{
            const pal = palettes.find(p=>p.style.key === btn.dataset.key);
            const text = `${pal.style.name}\n` + pal.members.map(m=>`${m.role} — Nr. ${m.pencil.num} — ${m.pencil.name}`).join('\n');
            copyTextFallback(text);
            btn.textContent = 'Kopiert!';
            setTimeout(()=>{ btn.textContent = 'Kopieren'; }, 1500);
        });
    });

    paletteSuggestionsEl.querySelectorAll('.alt-swatch').forEach(el=>{
        el.addEventListener('click', ()=>{
            paletteOverrides[`${el.dataset.key}-${el.dataset.idx}`] = el.dataset.pencil;
            renderPaletteSuggestions();
        });
    });
    paletteSuggestionsEl.querySelectorAll('.reset-alt-btn').forEach(el=>{
        el.addEventListener('click', ()=>{
            delete paletteOverrides[`${el.dataset.key}-${el.dataset.idx}`];
            renderPaletteSuggestions();
        });
    });
}

function copyTextFallback(text){
    try{
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
    } catch(e){
        if(navigator.clipboard && navigator.clipboard.writeText){
            navigator.clipboard.writeText(text).catch(()=>{});
        }
    }
}
