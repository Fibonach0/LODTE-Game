/* =====================================================
 *  KONR — Tienda del Mercader Errante
 *
 *  Servicios disponibles en un nodo type='shop':
 *    1. Comprar carta — 3 al azar de REWARD_POOL
 *    2. Comprar reliquia — 2 al azar de RELICS no poseídas
 *    3. Eliminar una carta del mazo — 75g
 *    4. Vender una carta del mazo — 25g
 *
 *  Inventario se genera en openShopScreen y se guarda en
 *  G.shopInventory para que sea consistente durante la visita.
 *
 *  Precios:
 *    common card  : 50g
 *    uncommon card: 100g
 *    rare card    : 150g
 *    relic price viene de su definición
 *    eliminar     : 75g (1x por visita)
 *    vender       : 25g por carta
 * ===================================================== */

const CARD_PRICES = {
  // Mapeo cardId → precio. Default 75 si no está listada.
  strike: 50, strike2: 60,
  defend: 50, defend2: 60,
  bragi: 100,
  njord: 150, culpa: 80,
  memoria: 60,
  porElla: 200,
  ljuga: 90,
  promesaRota: 130,
  lectura: 80, trance: 100,
  reserva: 70,
};

let _shopCurrentNode = null;
let _shopUsedRemove = false;

function getCardPrice(cardId) {
  return CARD_PRICES[cardId] || 75;
}

function rollShopInventory() {
  // 3 cartas al azar del REWARD_POOL (sin maldiciones)
  const cardPool = REWARD_POOL.filter(id => CARDS[id] && CARDS[id].type !== 'curse');
  const cards = shuffle([...cardPool]).slice(0, 3);

  // 2 reliquias al azar que el jugador NO tenga
  const ownedRelics = new Set(G.relics || []);
  const available = Object.keys(RELICS).filter(id => !ownedRelics.has(id));
  const relics = shuffle(available).slice(0, 2);

  return { cards, relics };
}

function openShopScreen(node) {
  _shopCurrentNode = node;
  _shopUsedRemove = false;
  _shopUsedUpgrade = false;
  // Generar inventario fresco al entrar
  G.shopInventory = rollShopInventory();
  renderShop();
  showScreen('screen-shop');
}

function renderShop() {
  if (!G.shopInventory) return;
  const inv = G.shopInventory;
  const goldEl = document.getElementById('shop-gold');
  if (goldEl) goldEl.textContent = G.gold || 0;

  // ─── Cartas ───
  const cardsEl = document.getElementById('shop-cards');
  cardsEl.innerHTML = '';
  inv.cards.forEach(cardId => {
    const c = CARDS[cardId];
    if (!c) return;
    const price = getCardPrice(cardId);
    const canAfford = (G.gold || 0) >= price;
    const wrap = document.createElement('div');
    wrap.className = 'shop-item shop-item-card';
    wrap.innerHTML = `
      <div class="card ${canAfford ? '' : 'unplayable'}">
        <div class="card-type-bar ${c.type}"></div>
        <div class="card-cost ${c.cost === 0 ? 'free' : ''}">${c.cost}</div>
        ${typeof renderCardArt === 'function' ? renderCardArt(c) : `<div class="card-art">${c.art}</div>`}
        <div class="card-name">${c.name}</div>
        <div class="card-divider"></div>
        <div class="card-desc">${c.desc}</div>
        <div class="card-type-label">${c.type}</div>
      </div>
      <button class="shop-buy-btn ${canAfford ? '' : 'disabled'}"
              data-buy="card" data-card-id="${cardId}"
              ${canAfford ? '' : 'disabled'}>
        🪙 ${price}
      </button>
    `;
    cardsEl.appendChild(wrap);
  });

  // ─── Reliquias ───
  const relicsEl = document.getElementById('shop-relics');
  relicsEl.innerHTML = '';
  inv.relics.forEach(relicId => {
    const r = RELICS[relicId];
    if (!r) return;
    const canAfford = (G.gold || 0) >= r.price;
    const wrap = document.createElement('div');
    wrap.className = 'shop-item shop-item-relic';
    wrap.innerHTML = `
      <div class="shop-relic-card ${canAfford ? '' : 'unaffordable'}">
        <div class="shop-relic-icon">${r.art}</div>
        <div class="shop-relic-name">${r.name}</div>
        <div class="shop-relic-desc">${r.description}</div>
        <div class="shop-relic-rarity">${r.rarity}</div>
      </div>
      <button class="shop-buy-btn ${canAfford ? '' : 'disabled'}"
              data-buy="relic" data-relic-id="${relicId}"
              ${canAfford ? '' : 'disabled'}>
        🪙 ${r.price}
      </button>
    `;
    relicsEl.appendChild(wrap);
  });

  // ─── Servicios ───
  const removeBtn = document.getElementById('shop-remove-btn');
  const sellBtn = document.getElementById('shop-sell-btn');
  if (removeBtn) {
    const canRemove = !_shopUsedRemove && (G.gold || 0) >= 75;
    removeBtn.disabled = !canRemove;
    removeBtn.textContent = _shopUsedRemove
      ? 'Ya eliminaste una carta'
      : `🪙 75 — Eliminar una carta`;
  }
  if (sellBtn) {
    sellBtn.disabled = false;
    sellBtn.textContent = '🪙 +25 — Vender una carta';
  }

  const upgradeBtn = document.getElementById('shop-upgrade-btn');
  if (upgradeBtn) {
    const canUpgrade = !_shopUsedUpgrade && (G.gold || 0) >= 100;
    upgradeBtn.disabled = !canUpgrade;
    upgradeBtn.textContent = _shopUsedUpgrade
      ? 'Ya mejoraste una carta'
      : '🪙 100 — Mejorar una carta';
  }

  // Bind dinámico de botones de compra
  cardsEl.querySelectorAll('[data-buy="card"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.cardId;
      shopBuyCard(id);
    });
  });
  relicsEl.querySelectorAll('[data-buy="relic"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.relicId;
      shopBuyRelic(id);
    });
  });
}

function shopBuyCard(cardId) {
  const price = getCardPrice(cardId);
  if ((G.gold || 0) < price) return;
  G.gold -= price;
  G.deck.push(cardId);
  // Sacar la carta del inventario para que no se pueda volver a comprar
  G.shopInventory.cards = G.shopInventory.cards.filter(id => id !== cardId);
  if (typeof saveRun === 'function') saveRun();
  renderShop();
}

function shopBuyRelic(relicId) {
  const r = RELICS[relicId];
  if (!r) return;
  if ((G.gold || 0) < r.price) return;
  G.gold -= r.price;
  addRelic(relicId);
  G.shopInventory.relics = G.shopInventory.relics.filter(id => id !== relicId);
  if (typeof saveRun === 'function') saveRun();
  renderShop();
}

/* ─── Eliminar carta del mazo ────────────────────────── */

function shopOpenRemoveDialog() {
  if (_shopUsedRemove) return;
  if ((G.gold || 0) < 75) return;
  // Usamos el mismo modal de preview que el deck-editor adaptado:
  // listamos las cartas del mazo y el jugador clickea una.
  shopOpenCardSelector('remove');
}

function shopOpenSellDialog() {
  shopOpenCardSelector('sell');
}

let _shopUsedUpgrade = false;

function shopOpenUpgradeDialog() {
  if (_shopUsedUpgrade) return;
  if ((G.gold || 0) < 100) return;
  shopOpenCardSelector('upgrade');
}

function shopUpgradeCard(cardId) {
  if (_shopUsedUpgrade) return;
  if ((G.gold || 0) < 100) return;
  const upgraded = UPGRADE_MAP[cardId];
  if (!upgraded) {
    alert('Esa carta no se puede mejorar todavía.');
    return;
  }
  G.gold -= 100;
  // Saca UNA instancia del cardId base y la reemplaza por la versión +
  _removeOneFromDeck(cardId);
  G.deck.push(upgraded);
  _shopUsedUpgrade = true;
  if (typeof saveRun === 'function') saveRun();
  shopCloseCardSelector();
  renderShop();
}

function shopOpenCardSelector(mode) {
  const dialog = document.getElementById('shop-card-selector');
  const list = document.getElementById('shop-card-selector-list');
  const titleEl = document.getElementById('shop-card-selector-title');
  if (!dialog || !list || !titleEl) return;

  titleEl.textContent =
    mode === 'remove'  ? 'Elegí una carta para ELIMINAR del mazo (75g)'
  : mode === 'sell'    ? 'Elegí una carta para VENDER (+25g)'
  : mode === 'upgrade' ? 'Elegí una carta para MEJORAR (100g)'
  : 'Elegí una carta';

  list.innerHTML = '';
  // Mazo completo del run = deck + discard + hand
  const fullDeck = [...(G.deck || []), ...(G.discard || []), ...(G.hand || [])];

  // En modo upgrade, filtrar a solo las que se pueden mejorar
  const eligible = (mode === 'upgrade' && typeof UPGRADE_MAP !== 'undefined')
    ? fullDeck.filter(id => !!UPGRADE_MAP[id])
    : fullDeck;

  if (eligible.length === 0) {
    list.innerHTML = mode === 'upgrade'
      ? '<div style="padding:20px;text-align:center;color:var(--text3);">No tenés cartas que se puedan mejorar.</div>'
      : '<div style="padding:20px;text-align:center;color:var(--text3);">Tu mazo está vacío.</div>';
  } else {
    const counts = {};
    eligible.forEach(id => { counts[id] = (counts[id] || 0) + 1; });
    Object.entries(counts).forEach(([cardId, count]) => {
      const c = CARDS[cardId];
      if (!c) return;
      const item = document.createElement('button');
      item.className = 'shop-deck-pick';
      // Para upgrade, mostrar también la versión mejorada
      const upgradeNote = mode === 'upgrade' && UPGRADE_MAP[cardId]
        ? ` → ${CARDS[UPGRADE_MAP[cardId]]?.name || ''}`
        : '';
      item.innerHTML = `
        <span class="shop-pick-art">${c.art}</span>
        <span class="shop-pick-name">${c.name}${upgradeNote}</span>
        <span class="shop-pick-count">×${count}</span>
        <span class="shop-pick-type">${c.type}</span>
      `;
      item.addEventListener('click', () => {
        if (mode === 'remove')       shopRemoveCard(cardId);
        else if (mode === 'sell')    shopSellCard(cardId);
        else if (mode === 'upgrade') shopUpgradeCard(cardId);
      });
      list.appendChild(item);
    });
  }
  dialog.classList.add('visible');
}

function shopCloseCardSelector() {
  const dialog = document.getElementById('shop-card-selector');
  if (dialog) dialog.classList.remove('visible');
}

function _removeOneFromDeck(cardId) {
  // Saca una sola instancia del cardId de cualquiera de deck/discard/hand
  const pile = G.deck.indexOf(cardId) !== -1 ? G.deck
              : G.discard.indexOf(cardId) !== -1 ? G.discard
              : G.hand;
  const idx = pile.indexOf(cardId);
  if (idx !== -1) pile.splice(idx, 1);
}

function shopRemoveCard(cardId) {
  if (_shopUsedRemove) return;
  if ((G.gold || 0) < 75) return;
  G.gold -= 75;
  _removeOneFromDeck(cardId);
  _shopUsedRemove = true;
  if (typeof saveRun === 'function') saveRun();
  shopCloseCardSelector();
  renderShop();
}

function shopSellCard(cardId) {
  G.gold = (G.gold || 0) + 25;
  _removeOneFromDeck(cardId);
  if (typeof saveRun === 'function') saveRun();
  shopCloseCardSelector();
  renderShop();
}

/* ─── Salir de la tienda ─────────────────────────────── */

function shopLeave() {
  // Marcamos el nodo como completado (la tienda fue una visita única)
  if (_shopCurrentNode && typeof markNodeCompleted === 'function') {
    markNodeCompleted(_shopCurrentNode.id);
  }
  G.shopInventory = null;
  _shopCurrentNode = null;
  if (typeof openMap === 'function') openMap();
}
