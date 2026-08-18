/* ---------------- Speichern & Laden ---------------- */
const STORAGE_KEY = 'palette-state-v1';

async function savePalette(){
    try{
        await window.storage.set(STORAGE_KEY, JSON.stringify(palette), false);
    } catch(e){
        console.error('Speichern fehlgeschlagen:', e);
    }
}

async function loadPalette(){
    try{
        const result = await window.storage.get(STORAGE_KEY, false);
        if(result && result.value){
            const saved = JSON.parse(result.value);
            if(Array.isArray(saved) && saved.length){
                palette = saved;
            }
        }
    } catch(e){
        // Noch nichts gespeichert — Standardliste bleibt aktiv.
    }
}
