/* ---------------- Wheel (Farbkreis-Visualisierung) ---------------- */
const wheelOuter = document.getElementById('wheelOuter');
const wheelSvg = document.getElementById('wheelSvg');
const wheelBaseLabel = document.getElementById('wheelBaseLabel');

function hueToXY(hue, radius, cx=160, cy=160){
    const angle = (hue - 90) * Math.PI/180;
    return { x: cx + radius*Math.cos(angle), y: cy + radius*Math.sin(angle) };
}

function renderWheelGradient(){
    const stops = [];
    for(let h=0; h<=360; h+=30){
        stops.push(`hsl(${h},72%,54%) ${ (h/360)*100 }%`);
    }
    wheelOuter.style.background = `conic-gradient(${stops.join(',')})`;
}

function renderWheel(scheme, base){
    wheelSvg.innerHTML = '';
    const markerR = 118;
    const idealR = 148;

    const isNeutral = (pencil) => rgbToHsl(hexToRgb(pencil.hex)).s < 0.12;

    const matchedPts = scheme.matched.map((m,i)=>{
        const hue = isNeutral(m.pencil) ? scheme.targets[i].h : rgbToHsl(hexToRgb(m.pencil.hex)).h;
        return hueToXY(hue, markerR);
    });
    const idealPts = scheme.targets.map(t => hueToXY(t.h, idealR));

    // connecting polygon between matched pencils
    if(matchedPts.length===2){
        wheelSvg.appendChild(svgLine(matchedPts[0], matchedPts[1], 'var(--gold)', 2));
    } else if(matchedPts.length>2){
        const poly = document.createElementNS('http://www.w3.org/2000/svg','polygon');
        poly.setAttribute('points', matchedPts.map(p=>`${p.x},${p.y}`).join(' '));
        poly.setAttribute('fill', 'none');
        poly.setAttribute('stroke', 'var(--gold)');
        poly.setAttribute('stroke-width', '2');
        wheelSvg.appendChild(poly);
    }

    // dashed lines: ideal -> matched
    scheme.targets.forEach((t,i)=>{
        wheelSvg.appendChild(svgLine(idealPts[i], matchedPts[i], 'rgba(90,80,60,0.5)', 1, true));
    });

    // ideal hollow markers
    idealPts.forEach(p=>{
        wheelSvg.appendChild(svgCircle(p, 6, 'transparent', 'rgba(32,28,20,0.55)', 1.5));
    });

    // matched filled markers
    scheme.matched.forEach((m,i)=>{
        const pt = matchedPts[i];
        const neutral = isNeutral(m.pencil);
        const area = scheme.targets[i].area;
        const r = area === '60 %' ? 13 : area === '30 %' ? 10 : area === '10 %' ? 7.5 : 10;
        const circle = svgCircle(pt, r, m.pencil.hex, 'white', 2);
        if(neutral){ circle.setAttribute('stroke-dasharray','2,2'); }
        const title = document.createElementNS('http://www.w3.org/2000/svg','title');
        title.textContent = m.pencil.name + (area ? ` — ${area} Fläche` : '') + (neutral ? ' — neutraler Ton ohne eigenen Farbton, an Zielposition eingeordnet' : '');
        circle.appendChild(title);
        wheelSvg.appendChild(circle);
    });

    wheelBaseLabel.innerHTML = `Basis<b>${base.name}</b>Nr. ${base.num}`;
}

function svgLine(p1,p2,color,width,dashed){
    const l = document.createElementNS('http://www.w3.org/2000/svg','line');
    l.setAttribute('x1',p1.x); l.setAttribute('y1',p1.y);
    l.setAttribute('x2',p2.x); l.setAttribute('y2',p2.y);
    l.setAttribute('stroke', color);
    l.setAttribute('stroke-width', width);
    if(dashed) l.setAttribute('stroke-dasharray','3,3');
    return l;
}
function svgCircle(p,r,fill,stroke,sw){
    const c = document.createElementNS('http://www.w3.org/2000/svg','circle');
    c.setAttribute('cx',p.x); c.setAttribute('cy',p.y); c.setAttribute('r',r);
    c.setAttribute('fill',fill); c.setAttribute('stroke',stroke); c.setAttribute('stroke-width',sw);
    return c;
}
