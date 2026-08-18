/* ---------------- Zentraler App-Zustand ---------------- */
let palette = createDefaultPalette();

let selectedId = palette.find(p=>p.num===118).id; // Scharlachrot als sinnvoller Startwert
let currentScheme = 'complementary';
let overrides = {}; // slot-index -> pencil id (manuell gewählte Alternative)
let editingId = null;

let appMode = 'schemes';

let familyParentIds = [null, null, null, null];
let familyPickerSlot = null;

let suggestBaseIds = [null, null];
let suggestPickerSlot = null;
let paletteOverrides = {};

let suggestionIndex = 0;

function ownedPalette(){
    return palette.filter(p=>p.owned);
}
