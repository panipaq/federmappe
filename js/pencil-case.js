/* ---------------- Rendering: Stiftedose (Sidebar) ---------------- */
const swatchGrid = document.getElementById('swatchGrid');
const pencilCount = document.getElementById('pencilCount');
const selectedInfo = document.getElementById('selectedInfo');
const editArea = document.getElementById('editArea');

function renderSwatches(){
    swatchGrid.innerHTML = '';
    const owned = ownedPalette();
    owned.forEach(p=>{
        const el = document.createElement('div');
        el.className = 'pencil' + (p.id===selectedId ? ' active':'');
        el.style.background = p.hex;
        el.title = p.num + ' · ' + p.name;
        el.innerHTML = '<div class="tip"></div>';
        el.addEventListener('click', ()=>{ selectedId = p.id; editingId=null; overrides={}; renderAll(); });
        el.addEventListener('dblclick', ()=>{ selectedId=p.id; editingId=p.id; overrides={}; renderAll(); });
        swatchGrid.appendChild(el);
    });
    pencilCount.textContent = owned.length + ' von ' + palette.length + ' Stiften ausgewählt';
}

function renderSelectedInfo(){
    const p = palette.find(x=>x.id===selectedId);
    if(!p){ selectedInfo.innerHTML=''; editArea.innerHTML=''; return; }
    selectedInfo.innerHTML = `
    <div class="chip" style="background:${p.hex}"></div>
    <div class="txt">
      <div class="name">${p.name}</div>
      <div class="meta">Nr. ${p.num} · ${p.hex}</div>
    </div>
  `;

    if(editingId === p.id){
        editArea.innerHTML = `
      <div class="edit-row">
        <input type="text" id="editName" value="${p.name}" placeholder="Name">
        <input type="text" id="editNum" value="${p.num}" placeholder="Nr." style="max-width:56px;">
        <input type="color" id="editHex" value="${p.hex}">
      </div>
      <div class="edit-row">
        <button id="saveEdit">Speichern</button>
        <button id="cancelEdit">Abbrechen</button>
        <button class="danger" id="deleteEdit">Entfernen</button>
      </div>
    `;
        document.getElementById('saveEdit').onclick = ()=>{
            p.name = document.getElementById('editName').value || p.name;
            p.num = document.getElementById('editNum').value || p.num;
            p.hex = document.getElementById('editHex').value || p.hex;
            editingId = null;
            savePalette();
            renderAll();
        };
        document.getElementById('cancelEdit').onclick = ()=>{ editingId=null; renderAll(); };
        document.getElementById('deleteEdit').onclick = ()=>{
            palette = palette.filter(x=>x.id!==p.id);
            if(palette.length){ selectedId = palette[0].id; }
            editingId = null;
            savePalette();
            renderAll();
        };
    } else {
        editArea.innerHTML = `<div class="edit-row"><button id="startEdit">Bearbeiten</button></div>`;
        document.getElementById('startEdit').onclick = ()=>{ editingId = p.id; renderAll(); };
    }
}

document.getElementById('addPencilBtn').addEventListener('click', ()=>{
    const np = { id: uid(), num: '—', name: 'Neuer Stift', hex: '#8899AA', owned: true };
    palette.push(np);
    selectedId = np.id;
    editingId = np.id;
    savePalette();
    renderAll();
});

/* ---------------- Auswahl-Overlay ---------------- */
const overlayBackdrop = document.getElementById('overlayBackdrop');
const overlayGrid = document.getElementById('overlayGrid');

function renderOverlay(){
    overlayGrid.innerHTML = '';
    palette.forEach(p=>{
        const item = document.createElement('label');
        item.className = 'overlay-item' + (p.owned ? ' checked' : '');
        item.innerHTML = `
      <input type="checkbox" ${p.owned ? 'checked' : ''}>
      <div class="chip" style="background:${p.hex}"></div>
      <div class="lbl"><b>${p.name}</b>Nr. ${p.num}</div>
    `;
        const checkbox = item.querySelector('input');
        checkbox.addEventListener('change', ()=>{
            p.owned = checkbox.checked;
            item.classList.toggle('checked', p.owned);
            savePalette();
            renderAll();
        });
        overlayGrid.appendChild(item);
    });
}

document.getElementById('settingsBtn').addEventListener('click', ()=>{
    renderOverlay();
    overlayBackdrop.classList.add('open');
});
document.getElementById('overlayClose').addEventListener('click', ()=>{
    overlayBackdrop.classList.remove('open');
});
overlayBackdrop.addEventListener('click', (e)=>{
    if(e.target === overlayBackdrop) overlayBackdrop.classList.remove('open');
});
document.getElementById('selectAll').addEventListener('click', ()=>{
    palette.forEach(p=>p.owned = true);
    renderOverlay();
    savePalette();
    renderAll();
});
document.getElementById('selectNone').addEventListener('click', ()=>{
    palette.forEach(p=>p.owned = false);
    renderOverlay();
    savePalette();
    renderAll();
});
