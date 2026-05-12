/* =====================================================
 *  KONR — Bootstrap del juego
 * ===================================================== */

function instantiateEnemy(enemyId) {
  const tpl = ENEMIES[enemyId];
  if (!tpl) {
    console.error(`Enemy "${enemyId}" no existe en ENEMIES`);
    return null;
  }
  return {
    id: enemyId,
    name: tpl.name,
    title: tpl.title,
    art: tpl.art,
    image: tpl.image,
    phase2Title: tpl.phase2Title,
    phase2Art: tpl.phase2Art,
    phase2Image: tpl.phase2Image,
    canBreakWall: tpl.canBreakWall || false,
    logIcon: tpl.logIcon || '👻',
    introLine: tpl.introLine,
    victoryFlavor: tpl.victoryFlavor,
    defeatFlavor: tpl.defeatFlavor,
    hp: tpl.hp, maxHp: tpl.maxHp,
    block: 0, phase: 1, intentIdx: 0,
    growth: 0,
    phase1Intents: tpl.phase1Intents,
    phase2Intents: tpl.phase2Intents || tpl.phase1Intents,
    onTurn: tpl.onTurn,
  };
}

function updateFloorInfo() {
  const node = (typeof findNode === 'function' && G.currentNodeId)
    ? findNode(G.currentNodeId)
    : null;
  const floorNum = document.getElementById('floor-num');
  const floorName = document.getElementById('floor-name');
  if (node) {
    if (floorNum) floorNum.textContent = (node.type || 'COMBATE').toUpperCase();
    if (floorName) floorName.textContent = node.name;
  } else {
    if (floorNum) floorNum.textContent = 'COMBATE';
    if (floorName) floorName.textContent = G.enemy?.name || '—';
  }
}

function startGame(continuing = false) {
  const savedScars = parseInt(localStorage.getItem('konr_scars') || '0') || G.scars;
  const savedDeck = continuing ? [...G.deck, ...G.discard, ...G.hand] : null;

  if (!continuing) G.runIdx = 0;

  // Cada combate empieza fresh — HP al máximo, block en 0.
  Object.assign(G, {
    hp: 70,
    maxHp: 70,
    ithyr: 3, maxIthyr: 3,
    block: 0, strength: 0,
    scars: savedScars,
    memories: 0,
    hand: [], discard: [],
    turn: 0, combatOver: false, won: false,
  });

  G.deck = savedDeck && savedDeck.length > 0
    ? shuffle(savedDeck)
    : shuffle(G.customDeck ? [...G.customDeck] : buildStarterDeck());

  const currentEnemyId = G.currentNodeEnemy || RUN_SEQUENCE[G.runIdx] || RUN_SEQUENCE[0];
  G.enemy = instantiateEnemy(currentEnemyId);

  showScreen('screen-run');
  updateUI(G);
  updateFloorInfo();

  renderEnemyArt(G.enemy, 1);
  document.getElementById('enemy-name').textContent = G.enemy.name;
  document.getElementById('enemy-title').textContent = G.enemy.title;
  updateEnemyIntentUI(G);

  G.relicStrength = 0;

  drawCards(G, 4);

  document.getElementById('log-entries').innerHTML =
    `<div class="log-entry log-type-system">${G.enemy.name} aparece. Konr empuña sus armas.</div>`;
  addLogTurnMarker(0);

  if (typeof applyRelicHook === 'function') applyRelicHook('onCombatStart', G);

  const intro = G.enemy.introLine || `${G.enemy.name} se planta frente a Konr.`;
  log(intro);
}

window.playCard = playCard;
window.addCardAndContinue = addCardAndContinue;
window.G = G;

window.addEventListener('DOMContentLoaded', () => {
  const saved = parseInt(localStorage.getItem('konr_scars') || '0');
  G.scars = saved;
  if (saved > 0) {
    document.getElementById('title-scars').style.display = 'block';
    document.getElementById('title-scar-num').textContent = saved;
  }

  if (typeof loadRun === 'function' && hasSavedRun()) {
    loadRun();
    const newRunBtn = document.getElementById('btn-new-run');
    if (newRunBtn) newRunBtn.style.display = 'inline-block';
    const ascendBtn = document.querySelector('#screen-title .btn-primary');
    if (ascendBtn) ascendBtn.textContent = 'Continuar';
  }

  document.querySelector('#screen-title .btn-primary').addEventListener('click', () => openMap());
  document.getElementById('btn-end-turn').addEventListener('click', () => endTurn());
  document.querySelector('#screen-reward .btn-secondary').addEventListener('click', () => skipReward());
  document.getElementById('result-btn').addEventListener('click', () => handleResultBtn());
  document.querySelector('#screen-result .btn-secondary').addEventListener('click', () => {
    if (typeof resetMapState === 'function') resetMapState();
    showScreen('screen-title');
  });

  document.getElementById('map-btn-title').addEventListener('click', () => showScreen('screen-title'));

  const newRunBtn = document.getElementById('btn-new-run');
  if (newRunBtn) {
    newRunBtn.addEventListener('click', () => {
      if (!confirm('¿Empezar un run nuevo? Esto borra tu progreso actual del mapa.')) return;
      if (typeof resetMapState === 'function') resetMapState();
      newRunBtn.style.display = 'none';
      const ascendBtn = document.querySelector('#screen-title .btn-primary');
      if (ascendBtn) ascendBtn.textContent = 'Ascender';
    });
  }

  document.getElementById('btn-abandon-combat').addEventListener('click', () => abandonCombat());

  const restHealBtn = document.getElementById('rest-heal');
  if (restHealBtn) restHealBtn.addEventListener('click', () => restHeal());
  const restSkipBtn = document.getElementById('rest-skip');
  if (restSkipBtn) restSkipBtn.addEventListener('click', () => restSkip());

  const shopUpgrade = document.getElementById('shop-upgrade-btn');
  if (shopUpgrade) shopUpgrade.addEventListener('click', () => shopOpenUpgradeDialog());
  const shopRemove = document.getElementById('shop-remove-btn');
  if (shopRemove) shopRemove.addEventListener('click', () => shopOpenRemoveDialog());
  const shopSell = document.getElementById('shop-sell-btn');
  if (shopSell) shopSell.addEventListener('click', () => shopOpenSellDialog());
  const shopLeaveBtn = document.getElementById('shop-leave-btn');
  if (shopLeaveBtn) shopLeaveBtn.addEventListener('click', () => shopLeave());
  const shopSelectorCancel = document.getElementById('shop-card-selector-cancel');
  if (shopSelectorCancel) shopSelectorCancel.addEventListener('click', () => shopCloseCardSelector());

  const ruinsSkipBtn = document.getElementById('ruins-skip');
  if (ruinsSkipBtn) ruinsSkipBtn.addEventListener('click', () => ruinsSkip());

  document.getElementById('btn-deck-editor').addEventListener('click', () => openDeckEditor());
  document.getElementById('btn-editor-back').addEventListener('click', () => showScreen('screen-title'));
  document.getElementById('btn-editor-save').addEventListener('click', () => saveDeckAndPlay());
  document.getElementById('btn-reset-deck').addEventListener('click', () => {
    editorDeck = buildStarterDeck();
    renderEditorPool();
    renderDeckList();
    updateEditorCount();
  });
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      editorFilter = btn.dataset.filter;
      renderEditorPool();
    });
  });

  document.getElementById('log-tab').addEventListener('click', () => toggleLog());
  document.querySelector('.log-clear').addEventListener('click', () => clearLog());

  document.getElementById('card-preview-add').addEventListener('click', () => confirmAddToDeck());
  document.getElementById('card-preview-close').addEventListener('click', () => closeCardPreview());
  document.getElementById('card-preview-overlay').addEventListener('click', () => closeCardPreview());
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' &&
        document.getElementById('card-preview-overlay').classList.contains('visible')) {
      closeCardPreview();
    }
  });
});
