/* ---------------- Farb-Helfer ---------------- */
function hexToRgb(hex){
    hex = hex.replace('#','');
    if(hex.length===3) hex = hex.split('').map(c=>c+c).join('');
    const n = parseInt(hex,16);
    return { r:(n>>16)&255, g:(n>>8)&255, b:n&255 };
}
function rgbToHex({r,g,b}){
    return '#' + [r,g,b].map(v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('');
}
function rgbToHsl({r,g,b}){
    r/=255; g/=255; b/=255;
    const max=Math.max(r,g,b), min=Math.min(r,g,b);
    let h,s,l=(max+min)/2;
    if(max===min){ h=0; s=0; }
    else{
        const d = max-min;
        s = l>0.5 ? d/(2-max-min) : d/(max+min);
        switch(max){
            case r: h=((g-b)/d + (g<b?6:0)); break;
            case g: h=((b-r)/d + 2); break;
            case b: h=((r-g)/d + 4); break;
        }
        h*=60;
    }
    return {h,s,l};
}
function hslToRgb(h,s,l){
    h = ((h%360)+360)%360;
    const c = (1-Math.abs(2*l-1))*s;
    const x = c*(1-Math.abs((h/60)%2 -1));
    const m = l - c/2;
    let r,g,b;
    if(h<60){ r=c;g=x;b=0; } else if(h<120){ r=x;g=c;b=0; }
    else if(h<180){ r=0;g=c;b=x; } else if(h<240){ r=0;g=x;b=c; }
    else if(h<300){ r=x;g=0;b=c; } else { r=c;g=0;b=x; }
    return { r:(r+m)*255, g:(g+m)*255, b:(b+m)*255 };
}
function rgbDist(a,b){
    return Math.sqrt((a.r-b.r)**2 + (a.g-b.g)**2 + (a.b-b.b)**2);
}
/* Gewichtete Distanz im HSL-Raum: Farbton zählt am stärksten, Sättigung/Helligkeit
   dienen nur als Tie-Breaker zwischen ähnlich farbtontreuen Stiften. */
const HUE_WEIGHT = 3, SAT_WEIGHT = 0.5, LIGHT_WEIGHT = 0.5;
function hslDist(pHsl, target){
    let dh = Math.abs(pHsl.h - target.h);
    dh = Math.min(dh, 360 - dh); // 0..180
    const ds = Math.abs(pHsl.s - target.s) * 100; // 0..100
    const dl = Math.abs(pHsl.l - target.l) * 100; // 0..100
    return dh*HUE_WEIGHT + ds*SAT_WEIGHT + dl*LIGHT_WEIGHT;
}
function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }
function uid(){ return 'p'+Math.random().toString(36).slice(2,9); }
function clampHue(h){ return ((h%360)+360)%360; }
function isNeutralPencil(p){
    return rgbToHsl(hexToRgb(p.hex)).s < 0.12;
}
