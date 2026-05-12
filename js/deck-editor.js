/* =====================================================
 *  KONR — Constructor de mazo
 *  Permite armar un mazo de >=50 cartas con límites por tipo.
 * ===================================================== */

let editorDeck = [];
let editorFilter = 'all';

function openDeckEditor() {
  editorDeck = [...(G.customDeck || buildStarterDeck())];
  renderEditorPool();
  renderDeckList();
  updateEditorCount();
  showScreen('screen-deck-editor');
}

function renderEditorPool() {
  const el = document.getElementById('card-pool');
  el.innerHTML = '';
  const seen = new Set();
  ALL_PLAYABLE_CARDS.forEach(cardId => {
    if (seen.has(cardId)) return;
    seen.add(cardId);
    const c = CARDS[cardId];
    if (!c) return;
    if (editorFilter !== 'all' && c.type !== editorFilter) return;

    const countInDeck = editorDeck.filter(id => id === cardId).length;
    const isCurse = c.type === 'curse';
    const div = document.createElement('div');
    div.className = `pool-card${countInDeck > 0 ? ' in-deck' : ''}`;
    div.title = `${c.desc}\n${c.lore}`;
    div.innerHTML = `
      <div class="card-type-bar ${c.type}" style="${isCurse ? 'background:#8b2020;' : ''}"></div>
      <div class="card-cost" style="${c.cost === 0 ? 'background:var(--teal);color:var(--teal2);' : ''}">${c.cost}</div>
      <div class="card-count-badge">${countInDeck}</div>
      ${renderCardArt(c)}
      <div class="card-name" style="${isCurse ? 'color:#8a5a5a;' : ''}">${c.name}</div>
    `;
    div.addEventListener('click', () => openCardPreview(cardId));
    el.appendChild(div);
  });
}

/* ─── Preview modal ─────────────────────────────────── *
 *  Click en pool-card abre vista grande con desc + lore.
 *  Desde ahí se confirma "Agregar al mazo".
 * ──────────────────────────────────────────────────────── */

let previewedCardId = null;

function openCardPreview(cardId) {
  const c = CARDS[cardId];
  if (!c) return;
  previewedCardId = cardId;

  const overlay = document.getElementById('card-preview-overlay');
  const card = document.getElementById('card-preview-card');
  const meta = document.getElementById('card-preview-meta');
  const addBtn = document.getElementById('card-preview-add');

  const isCurse = c.type === 'curse';
  const typeLabels = { attack: 'Ataque', skill: 'Habilidad', power: 'Poder', memory: 'Memoria', curse: 'Maldición' };

  // Render del cuerpo de la carta (versión grande)
  card.innerHTML = `
    <div class="card-type-bar ${c.type}" style="${isCurse ? 'background:#8b2020;' : ''}"></div>
    <div class="card-cost ${c.cost === 0 ? 'free' : ''}" style="${isCurse ? 'background:#4a1010;color:#c43030;' : ''}">${c.cost}</div>
    ${renderCardArt(c)}
    <div class="card-preview-name" style="${isCurse ? 'color:#8a5a5a;' : ''}">${c.name}</div>
    <div class="card-preview-type">${typeLabels[c.type] || c.type} · ${c.cost} Íthyr</div>
    <div class="card-preview-divider"></div>
    <div class="card-preview-desc" style="${isCurse ? 'color:#a07070;' : ''}">${c.desc}</div>
    <div class="card-preview-lore" style="${isCurse ? 'color:#7a5a5a;' : ''}">${c.lore}</div>
  `;

  // Estado del botón "Agregar" (respeta el límite por carta)
  const maxAllowed = CARD_MAX[cardId] || DEFAULT_MAX;
  const current = editorDeck.filter(id => id === cardId).length;
  meta.textContent = `En tu mazo: ${current} / ${maxAllowed}`;
  if (current >= maxAllowed) {
    addBtn.disabled = true;
    addBtn.textContent = 'Límite alcanzado';
  } else {
    addBtn.disabled = false;
    addBtn.textContent = 'Agregar al mazo';
  }

  overlay.classList.add('visible');
}

function closeCardPreview() {
  document.getElementById('card-preview-overlay').classList.remove('visible');
  previewedCardId = null;
}

function confirmAddToDeck() {
  if (!previewedCardId) return;
  addToDeck(previewedCardId);
  // Refresca el "En tu mazo: X/Y" sin cerrar — así podés sumar varias copias.
  const c = CARDS[previewedCardId];
  if (!c) { closeCardPreview(); return; }
  const maxAllowed = CARD_MAX[previewedCardId] || DEFAULT_MAX;
  const current = editorDeck.filter(id => id === previewedCardId).length;
  document.getElementById('card-preview-meta').textContent = `En tu mazo: ${current} / ${maxAllowed}`;
  const addBtn = document.getElementById('card-preview-add');
  if (current >= maxAllowed) {
    addBtn.disabled = true;
    addBtn.textContent = 'Límite alcanzado';
  }
}

function renderDeckList() {
  const el = document.getElementById('deck-list');
  if (editorDeck.length === 0) {
    el.innerHTML = '<div style="padding:16px;text-align:center;font-style:italic;color:var(--text3);font-size:12px;">Mazo vacío — agregá cartas desde la izquierda</div>';
    return;
  }

  // Agrupar por tipo y nombre
  const counts = {};
  editorDeck.forEach(id => { counts[id] = (counts[id] || 0) + 1; });
  const sorted = Object.entries(counts).sort((a, b) => {
    const ca = CARDS[a[0]], cb = CARDS[b[0]];
    const typeOrder = { attack: 0, skill: 1, power: 2, memory: 3, curse: 4 };
    return (typeOrder[ca?.type] || 0) - (typeOrder[cb?.type] || 0)
        || a[0].localeCompare(b[0]);
  });

  el.innerHTML = '';
  sorted.forEach(([cardId, count]) => {
    const c = CARDS[cardId];
    if (!c) return;
    const isCurse = c.type === 'curse';
    for (let i = 0; i < count; i++) {
      const div = document.createElement('div');
      div.className = 'deck-list-item';
      div.innerHTML = `
        <span class="dli-art">${c.art}</span>
        <span class="dli-name" style="${isCurse ? 'color:#8a5a5a;' : ''}">${c.name}</span>
        <span class="dli-type">${c.cost} Íthyr</span>
        <span class="dli-remove">✕</span>
      `;
      div.addEventListener('click', () => removeFromDeck(cardId));
      el.appendChild(div);
    }
  });
}

function addToDeck(cardId) {
  const maxAllowed = CARD_MAX[cardId] || DEFAULT_MAX;
  const current = editorDeck.filter(id => id === cardId).length;
  if (current >= maxAllowed) {
    // Flash visual del badge cuando se alcanza el límite
    const el = document.getElementById('deck-size-badge');
    el.style.borderColor = 'var(--red2)';
    setTimeout(() => el.style.borderColor = 'var(--border2)', 800);
    return;
  }
  editorDeck.push(cardId);
  renderEditorPool();
  renderDeckList();
  updateEditorCount();
}

function removeFromDeck(cardId) {
  const idx = editorDeck.indexOf(cardId);
  if (idx !== -1) { editorDeck.splice(idx, 1); }
  renderEditorPool();
  renderDeckList();
  updateEditorCount();
}

function updateEditorCount() {
  const count = editorDeck.length;
  const el = document.getElementById('editor-deck-count');
  el.textContent = count;
  el.className = count >= 50 ? 'ok' : count >= 30 ? 'warn' : 'bad';

  const badge = document.getElementById('deck-size-badge');
  badge.style.borderColor =
    count >= 50 ? 'var(--teal2)' :
    count >= 30 ? 'var(--gold)'  :
                  'var(--red2)';

  // Habilita/deshabilita el botón "Guardar y Jugar"
  const saveBtn = document.getElementById('btn-editor-save');
  saveBtn.style.opacity = count >= 50 ? '1' : '0.4';
  saveBtn.disabled = count < 50;
}

function saveDeckAndPlay() {
  if (editorDeck.length < 50) {
    alert(`Necesitás al menos 50 cartas. Tenés ${editorDeck.length}.`);
    return;
  }
  G.customDeck = [...editorDeck];
  startGame(false);
}
