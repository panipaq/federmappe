/* ---------------- Familien-Check ---------------- */
const parentSlots = document.getElementById('parentSlots');
const parentPicker = document.getElementById('parentPicker');
const familyResultsEl = document.getElementById('familyResults');

const parentSlotLabels = ['Grundfarbe 1', 'Grundfarbe 2', 'Grundfarbe 3', 'Weiß/Schwarz (optional)'];

function renderParentSlots(){
    parentSlots.innerHTML = '';
    familyParentIds.forEach((id, i)=>{
        const pencil = id ? palette.find(p=>p.id===id) : null;
        const slot = document.createElement('div');
        slot.className = 'parent-slot' + (pencil ? ' filled' : '');
        slot.innerHTML = `
      <div class="chip" style="${pencil ? `background:${pencil.hex};` : ''}">
        ${pencil ? `<span class="clear-x" data-clear="${i}">✕</span>` : '+'}
      </div>
      <div class="lbl">${pencil ? pencil.name : parentSlotLabels[i]}</div>
    `;
        slot.querySelector('.chip').addEventListener('click', (e)=>{
            if(e.target.closest('.clear-x')){
                familyParentIds[i] = null;
                familyPickerSlot = null;
                renderParentSlots();
                renderFamilyPicker();
                renderFamilyCheck();
                return;
            }
            familyPickerSlot = familyPickerSlot === i ? null : i;
            renderFamilyPicker();
        });
        parentSlots.appendChild(slot);
    });
}

function renderFamilyPicker(){
    if(familyPickerSlot === null){
        parentPicker.style.display = 'none';
        parentPicker.innerHTML = '';
        return;
    }
    const usedIds = familyParentIds.filter(Boolean);
    const options = ownedPalette().filter(p=>!usedIds.includes(p.id));
    parentPicker.style.display = '';
    parentPicker.innerHTML = `
    <div class="picker-title">${parentSlotLabels[familyPickerSlot]} wählen:</div>
    <div class="picker-grid">
      ${options.map(p=>`<div class="picker-swatch" data-pencil="${p.id}" style="background:${p.hex}" title="${p.name} · Nr. ${p.num}"></div>`).join('')}
    </div>
  `;
    parentPicker.querySelectorAll('.picker-swatch').forEach(el=>{
        el.addEventListener('click', ()=>{
            familyParentIds[familyPickerSlot] = el.dataset.pencil;
            familyPickerSlot = null;
            renderParentSlots();
            renderFamilyPicker();
            renderFamilyCheck();
        });
    });
}

function computeFamilyFit(parents){
    const hueParents = parents
        .filter(p=>!isNeutralPencil(p))
        .map(p=>({ p, ...rgbToHsl(hexToRgb(p.hex)) }))
        .sort((a,b)=>a.h-b.h);
    if(hueParents.length < 2) return null;

    const allHsl = parents.map(p=>({ p, ...rgbToHsl(hexToRgb(p.hex)) }));
    const darkRef = allHsl.reduce((min,c)=> c.l<min.l ? c : min, allHsl[0]);
    const lightRef = allHsl.reduce((max,c)=> c.l>max.l ? c : max, allHsl[0]);

    function bounding(h){
        const m = hueParents.length;
        for(let i=0;i<m;i++){
            const a = hueParents[i], b = hueParents[(i+1)%m];
            const aH = a.h;
            const bH = b.h <= aH ? b.h + 360 : b.h;
            const hh = h < aH ? h + 360 : h;
            if(hh >= aH && hh <= bH){
                const span = (bH - aH) || 1;
                return { low: a, high: b, t: (hh-aH)/span };
            }
        }
        return { low: hueParents[m-1], high: hueParents[0], t: 0.5 };
    }

    return function evaluate(pencil){
        const hsl = rgbToHsl(hexToRgb(pencil.hex));
        const { low, high, t } = bounding(hsl.h);
        const mixS = low.s + (high.s - low.s) * t;
        const mixL = low.l + (high.l - low.l) * t;

        let expectedS;
        if(hsl.l >= mixL){
            const span = (lightRef.l - mixL) || 0.0001;
            const frac = clamp((hsl.l - mixL) / span, 0, 1.4);
            expectedS = mixS + (lightRef.s - mixS) * frac;
        } else {
            const span = (mixL - darkRef.l) || 0.0001;
            const frac = clamp((mixL - hsl.l) / span, 0, 1.4);
            expectedS = mixS + (darkRef.s - mixS) * frac;
        }
        expectedS = Math.max(0, expectedS);

        const satOverage = Math.max(0, hsl.s - expectedS);
        const outOfRange = Math.max(0, hsl.l - lightRef.l, darkRef.l - hsl.l);
        const score = satOverage*120 + outOfRange*60;

        return { pencil, score, low: low.p, high: high.p };
    };
}

function familyTagFor(score){
    if(score < 12) return {cls:'exact', label:'Passt gut'};
    if(score < 30) return {cls:'near', label:'Leicht außerhalb'};
    return {cls:'approx', label:'Passt nicht'};
}

function renderFamilyCheck(){
    renderParentSlots();
    renderFamilyPicker();

    const parents = familyParentIds.filter(Boolean).map(id=>palette.find(p=>p.id===id)).filter(Boolean);
    const chromaticCount = parents.filter(p=>!isNeutralPencil(p)).length;

    if(chromaticCount < 2){
        familyResultsEl.innerHTML = `<p class="family-empty">Wähle mindestens zwei farbige Grundfarben (z. B. Rot und Blau, besser noch plus Gelb) — Weiß/Schwarz ist optional für Aufhellungen/Abdunklungen.</p>`;
        return;
    }

    const evaluate = computeFamilyFit(parents);
    const parentIds = new Set(parents.map(p=>p.id));
    const candidates = ownedPalette().filter(p=>!parentIds.has(p.id));

    if(candidates.length === 0){
        familyResultsEl.innerHTML = `<p class="family-empty">Alle deine ausgewählten Stifte sind bereits als Grundfarbe zugewiesen.</p>`;
        return;
    }

    const results = candidates.map(evaluate).sort((a,b)=>a.score-b.score);

    familyResultsEl.innerHTML = results.map(r=>{
        const tag = familyTagFor(r.score);
        const isNeutralCand = isNeutralPencil(r.pencil);
        const desc = isNeutralCand
            ? 'Neutraler Ton — dient eher zum Aufhellen/Abdunkeln als zum Mischen.'
            : `Liegt im Mischbereich zwischen <b>${r.low.name}</b> und <b>${r.high.name}</b>.`;
        return `
      <div class="result-card family-card">
        <div class="pencil-tip">
          <div class="cap"></div>
          <div class="body" style="background:${r.pencil.hex}"></div>
          <div class="point"></div>
          <div class="lead"></div>
        </div>
        <div class="rname">${r.pencil.name}</div>
        <div class="rnum">Nr. ${r.pencil.num}</div>
        <span class="rtag ${tag.cls}">${tag.label}</span>
        <p class="rdesc">${desc}</p>
      </div>
    `;
    }).join('');
}
