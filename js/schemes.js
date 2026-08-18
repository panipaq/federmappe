/* ---------------- Schema-Definitionen ---------------- */
const schemeDefs = {
    complementary: {
        label: 'Komplementär',
        desc: 'Zwei Farben, die sich auf dem Farbkreis exakt gegenüberliegen. Maximaler Kontrast — gut für Akzente und Spannung.',
        offsets: [0, 180]
    },
    analogous: {
        label: 'Analog',
        desc: 'Drei benachbarte Farbtöne. Wirkt harmonisch und ruhig, da alle Farben eng verwandt sind.',
        offsets: [-30, 0, 30]
    },
    triadic: {
        label: 'Triadisch',
        desc: 'Drei Farben im gleichen Abstand (120°) auf dem Farbkreis. Lebendig und ausgewogen zugleich.',
        offsets: [0, 120, 240]
    },
    splitComplementary: {
        label: 'Split-Komplementär',
        desc: 'Basisfarbe plus die beiden Nachbarn ihrer Komplementärfarbe. Kontrastreich, aber etwas softer als reines Komplementär.',
        offsets: [0, 150, 210]
    },
    square: {
        label: 'Quadratisch',
        desc: 'Vier Farben im gleichen Abstand (90°). Sehr abwechslungsreich — am besten mit einer Farbe als Hauptfarbe führen.',
        offsets: [0, 90, 180, 270]
    },
    rectangle: {
        label: 'Rechteckig',
        desc: 'Zwei Komplementärpaare, ungleich verteilt (60°/180°/240°). Reich an Kontrast mit mehr Ausgewogenheit als Quadratisch.',
        offsets: [0, 60, 180, 240]
    },
    monochromatic: {
        label: 'Monochromatisch',
        desc: 'Ein Farbton in verschiedenen Helligkeiten — inklusive deiner Basis selbst. Dezent und elegant, ideal für Schattierungen und Volumen.',
        offsets: [0, 0, 0, 0],
        lightness: [0, -0.24, 0.16, 0.32]
    },
    sixtyThirtyTen: {
        label: '60/30/10',
        desc: 'Nicht nur Farbton, sondern auch Flächenanteil: 60 % ruhige Grundfläche, 30 % unterstützende Farbe, 10 % kräftiger Akzent. Praktisch für ein ganzes Bild statt nur ein Farbschema.',
        offsets: [0, -24, 172],
        areas: ['60 %', '30 %', '10 %'],
        satAdjust: [-0.18, -0.05, 0.22],
        lightAdjust: [0.06, 0, -0.10]
    }
};

/* ---------------- Schema-Berechnung ---------------- */
function generateScheme(base, key){
    const def = schemeDefs[key];
    const baseHsl = rgbToHsl(hexToRgb(base.hex));
    const targets = def.offsets.map((off,i)=>{
        let h = baseHsl.h + off;
        let s = baseHsl.s;
        let l = baseHsl.l;
        if(key === 'monochromatic'){
            l = clamp(baseHsl.l + def.lightness[i], 0.06, 0.94);
            s = clamp(baseHsl.s, 0.15, 1);
        }
        if(key === 'sixtyThirtyTen'){
            s = clamp(baseHsl.s + def.satAdjust[i], 0.1, 1);
            l = clamp(baseHsl.l + def.lightAdjust[i], 0.06, 0.94);
        }
        return {
            h: ((h%360)+360)%360, s, l,
            isBase: off===0 && key!=='monochromatic' && i===0,
            area: def.areas ? def.areas[i] : null
        };
    });

    const pool = ownedPalette();
    const used = new Set();
    const matched = targets.map(t=>{
        const ranked = pool
            .map(p=>({ ...p, dist: hslDist(rgbToHsl(hexToRgb(p.hex)), t) }))
            .sort((a,b)=>a.dist-b.dist);
        let chosen = ranked.find(c=>!used.has(c.id));
        if(!chosen) chosen = ranked[0];
        if(chosen) used.add(chosen.id);
        return { target: t, pencil: chosen, dist: chosen ? chosen.dist : Infinity, candidates: ranked.slice(0,8) };
    });

    return { targets, matched, baseHsl };
}
