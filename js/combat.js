/* =====================================================
 *  KONR — Lógica de combate
 * ===================================================== */

function dealDamageToEnemy(g, amt) {
  const relicBonus = g.relicStrength || 0;
  amt = amt + relicBonus;
  const absorbed = Math.min(g.enemy.block, amt);
  const actual = Math.max(0, amt - g.enemy.block);
  g.enemy.block = Math.max(0, g.enemy.block - amt);
  g.enemy.hp = Math.max(0, g.enemy.hp - actual);

  showPopup(actual, 'enemy');
  const sil = document.getElementById('enemy-sil');
  sil.classList.remove('hit');
  void sil.offsetWidth;
  sil.classList.add('hit');

  updateEnemyUI(g);
  if (g.enemy.hp <= 0) { combatVictory(g); }
}

function gainBlock(g, amt) {
  g.block += amt;
  showPopup(amt, 'block');
  updateBlockDisplay(g);
  updatePlayerHint(g);
  renderStatusEffects(g);
}

function takeDamage(g, amt, source = 'Enemigo') {
  if (g.combatOver) return;
  if (source === 'Enemigo' && g.enemy?.name) source = g.enemy.name;

  const absorbed = Math.min(g.block, amt);
  const actual = amt - absorbed;
  g.block = Math.max(0, g.block - amt);
  g.hp = Math.max(0, g.hp - actual);

  logDamageTaken(source, amt, absorbed, actual);

  if (absorbed > 0 && actual > 0) {
    showPopup(absorbed, 'block-absorbed');
    setTimeout(() => showPopup(actual, 'player'), 150);
    log(`Escudo absorbió ${absorbed}. Vida perdida: ${actual}.`);
  } else if (absorbed > 0 && actual === 0) {
    showPopup(absorbed, 'block-absorbed');
    log(`¡Escudo absorbe todo! (${absorbed} bloqueado)`);
  } else {
    showPopup(actual, 'player');
  }

  const ps = document.getElementById('player-status');
  ps.classList.remove('hit');
  void ps.offsetWidth;
  ps.classList.add('hit');

  updateBlockDisplay(g);
  updatePlayerUI(g);

  // Hook de reliquia: onDamageTaken (recibe el daño REAL en HP, no el bloqueado)
  if (actual > 0 && typeof applyRelicHook === 'function') {
    applyRelicHook('onDamageTaken', g, actual);
  }

  if (g.hp <= 0) { combatDefeat(g); }
}

function drawCards(g, n) {
  let drew = 0;
  for (let i = 0; i < n; i++) {
    if (g.deck.length === 0) break;
    g.hand.push(g.deck.pop());
    drew++;
  }

  if (drew < n) {
    const missed = n - drew;
    if (g.deck.length === 0 && drew === 0) {
      g.hp = Math.max(0, g.hp - missed);
      showPopup(missed, 'player');
      addLogEntry('damage',
        `⏳ <strong>El mazo está vacío</strong> — perdés ${missed} de vida`,
        'El tiempo de Konr se agota.'
      );
      log('El mazo está vacío. El tiempo pesa.');
      updatePlayerUI(g);
      if (g.hp <= 0) { combatDefeat(g); }
    }
  }

  if (drew > 0) {
    addLogEntry('system',
      `Robaste ${drew} carta${drew > 1 ? 's' : ''} — quedan ${g.deck.length} en el mazo`
    );
  }
  renderHand(g);
  updateDeckCount(g);
}

function playCard(g, idx) {
  if (g.combatOver) return;
  const card = CARDS[g.hand[idx]];
  if (!card || g.ithyr < card.cost) return;

  const el = document.querySelectorAll('.card')[idx];
  if (el) { el.classList.add('playing'); }

  logCardPlayed(card);

  setTimeout(() => {
    g.ithyr -= card.cost;
    g.discard.push(g.hand.splice(idx, 1)[0]);
    card.effect(g);
    log(`"${card.name}" — ${card.lore}`);

    // Hook de reliquia: onCardPlay (después del effect, antes del UI refresh)
    if (typeof applyRelicHook === 'function') applyRelicHook('onCardPlay', g, card);

    updateUI(g);
    renderHand(g);
    updateIthyrUI(g);
  }, 200);
}

function endTurn() {
  const g = G;
  if (g.combatOver) return;

  document.getElementById('btn-end-turn').disabled = true;
  g.turn++;
  g.strength = 0;
  g.enemy.block = 0;

  if (g.block > 0) {
    addLogEntry('block', `🛡 Escudo persiste: <strong>${g.block}</strong> al próximo turno`);
  }

  log('El enemigo se prepara...');
  addLogTurnMarker(g.turn);

  setTimeout(() => {
    if (!g.combatOver) {
      const canBreakWall = g.enemy.canBreakWall && g.enemy.phase === 2;
      const highShield = g.block >= 10;

      if (canBreakWall && highShield && !g.enemy.usedWallBreak) {
        g.enemy.usedWallBreak = true;
        logEnemyAction('Romper Muralla — 5 energía', `Destruye ${g.block} escudo + 8 daño`);
        addLogEntry('enemy',
          `💥 <strong>${g.enemy.name} sacrifica 5 de energía</strong> para romper tu muralla`,
          'Escudo destruido completamente'
        );
        const shieldLost = g.block;
        g.block = 0;
        updateBlockDisplay(g);
        showPopup(shieldLost, 'block-absorbed');
        setTimeout(() => {
          takeDamage(g, 8, 'Romper Muralla');
          updateEnemyIntentUI(g);
        }, 400);
        log(`¡${g.enemy.name} rompe tu muralla de ${shieldLost} de escudo!`);
      } else {
        const intents = g.enemy.phase === 2 ? g.enemy.phase2Intents : g.enemy.phase1Intents;
        const intent = intents[g.enemy.intentIdx % intents.length];
        logEnemyAction(intent.name, intent.dmg ? `${intent.dmg} de daño` : '');
        g.enemy.onTurn(g);
      }
    }

    g.ithyr = g.maxIthyr;
    drawCards(g, 2);

    // Hook de reliquia: onTurnStart (al empezar el nuevo turno del jugador)
    if (!g.combatOver && typeof applyRelicHook === 'function') {
      applyRelicHook('onTurnStart', g);
    }

    updateUI(g);
    document.getElementById('btn-end-turn').disabled = false;
  }, 600);
}

function combatVictory(g) {
  g.combatOver = true;
  g.won = true;

  const node = (typeof findNode === 'function' && g.currentNodeId)
    ? findNode(g.currentNodeId)
    : null;
  let goldEarned = 15;
  if (node?.type === 'elite') goldEarned = 35;
  else if (node?.type === 'boss') goldEarned = 100;
  g.gold = (g.gold || 0) + goldEarned;
  addLogEntry('skill', `🪙 <strong>+${goldEarned} oro</strong> por la victoria`);

  if (typeof applyRelicHook === 'function') applyRelicHook('onVictory', g);

  setTimeout(() => showReward(), 800);
}

function combatDefeat(g) {
  if (g.combatOver) return;
  g.combatOver = true;
  g.won = false;
  g.scars++;
  localStorage.setItem('konr_scars', g.scars);

  const scarData = {
    name: 'La Mano que Falló',
    desc: '"Volviste a caer. La cicatriz arde en la palma derecha — la que rompió el sello."'
  };

  setTimeout(() => {
    showScreen('screen-result');
    document.getElementById('result-title').textContent = 'Caíste';
    document.getElementById('result-title').className = 'result-title defeat';
    document.getElementById('result-flavor').textContent =
      g.enemy?.defeatFlavor || `"${g.enemy?.name || 'El enemigo'} te conoce demasiado bien."`;
    document.getElementById('result-sub').textContent =
      `Konr despierta donde empezó. Cicatriz #${g.scars}.`;
    document.getElementById('result-btn').textContent = 'Volver al inicio';

    const sr = document.getElementById('scar-reveal');
    sr.style.display = 'block';
    document.getElementById('scar-name').textContent = scarData.name;
    document.getElementById('scar-desc').textContent = scarData.desc;
  }, 600);
}

function showReward() {
  showScreen('screen-reward');
  const isBonus = !!G.eventBonusReward;
  const cardsToShow = isBonus ? 4 : 3;
  let pool;
  if (isBonus) {
    const topTier = ['porElla', 'njord', 'promesaRota'];
    const guaranteed = topTier[Math.floor(Math.random() * topTier.length)];
    const rest = shuffle([...REWARD_POOL].filter(c => c !== guaranteed)).slice(0, cardsToShow - 1);
    pool = shuffle([guaranteed, ...rest]);
  } else {
    pool = shuffle([...REWARD_POOL]).slice(0, cardsToShow);
  }
  G.eventBonusReward = false;

  const titleEl = document.querySelector('#screen-reward .reward-title');
  const subEl = document.querySelector('#screen-reward .reward-sub');
  if (titleEl) titleEl.textContent = isBonus
    ? 'El precio del oro de los bandidos'
    : 'Elegí una carta para tu mazo';
  if (subEl) subEl.textContent = isBonus
    ? '"Sus bolsillos llevaban más de lo que merecían."'
    : '"Cada cicatriz es también una herramienta."';

  const el = document.getElementById('reward-cards');
  el.innerHTML = '';
  pool.forEach(cardId => {
    const c = CARDS[cardId];
    if (!c) return;
    el.innerHTML += `
    <div class="reward-card-wrap">
      <div class="card" onclick="addCardAndContinue('${cardId}')">
        <div class="card-type-bar ${c.type}"></div>
        <div class="card-cost ${c.cost === 0 ? 'free' : ''}">${c.cost}</div>
        ${renderCardArt(c)}
        <div class="card-name">${c.name}</div>
        <div class="card-divider"></div>
        <div class="card-desc">${c.desc}</div>
        <div class="card-type-label">${c.type}</div>
      </div>
      <div class="reward-card-hint">Agregar al mazo</div>
    </div>`;
  });
}

function addCardAndContinue(cardId) {
  G.deck.push(cardId);
  showVictoryScreen();
}

function skipReward() {
  showVictoryScreen();
}

function showVictoryScreen() {
  showScreen('screen-result');
  const node = (typeof findNode === 'function' && G.currentNodeId)
    ? findNode(G.currentNodeId)
    : null;
  const isBossVictory = node?.type === 'boss';
  const enemyName = G.enemy?.name || 'el enemigo';
  const flavor = G.enemy?.victoryFlavor || `"${enemyName} cae. Konr sigue en pie."`;

  if (isBossVictory) {
    document.getElementById('result-title').textContent = 'El Final del Camino';
    document.getElementById('result-title').className = 'result-title victory';
    document.getElementById('result-flavor').textContent = flavor;
    document.getElementById('result-sub').textContent =
      'El peregrinaje a Vatnaborg ha terminado. Konr enfrentó la verdad.';
    document.getElementById('result-btn').textContent = 'Volver al inicio';
  } else {
    document.getElementById('result-title').textContent = 'Victoria';
    document.getElementById('result-title').className = 'result-title victory';
    document.getElementById('result-flavor').textContent = flavor;
    document.getElementById('result-sub').textContent =
      'El camino continúa. Elegí el próximo destino.';
    document.getElementById('result-btn').textContent = 'Continuar al mapa';
  }
  document.getElementById('scar-reveal').style.display = 'none';
}

function abandonCombat() {
  const node = (typeof findNode === 'function' && G.currentNodeId)
    ? findNode(G.currentNodeId)
    : null;
  const enemyName = G.enemy?.name || 'el enemigo';
  const msg = `¿Abandonar el combate contra ${enemyName}?\n\n`
    + `Volvés al mapa con tu HP y mazo actuales.\n`
    + `${node ? node.name : 'Este nodo'} seguirá disponible para reintentar.`;
  if (!confirm(msg)) return;

  G.combatOver = true;
  G.won = false;
  G.currentNodeEnemy = null;
  G.currentNodeId = null;

  if (typeof saveRun === 'function') saveRun();

  if (typeof openMap === 'function') {
    openMap();
  } else {
    showScreen('screen-title');
  }
}

function handleResultBtn() {
  if (G.won) {
    if (typeof markNodeCompleted === 'function' && G.currentNodeId) {
      markNodeCompleted(G.currentNodeId);
    }
    const node = (typeof findNode === 'function' && G.currentNodeId)
      ? findNode(G.currentNodeId)
      : null;
    if (node?.type === 'boss') {
      if (typeof resetMapState === 'function') resetMapState();
      G.currentNodeEnemy = null;
      G.currentNodeId = null;
      showScreen('screen-title');
    } else {
      G.currentNodeEnemy = null;
      G.currentNodeId = null;
      if (typeof saveRun === 'function') saveRun();
      if (typeof openMap === 'function') {
        openMap();
      } else {
        showScreen('screen-title');
      }
    }
  } else {
    if (typeof resetMapState === 'function') resetMapState();
    G.currentNodeEnemy = null;
    G.currentNodeId = null;
    showScreen('screen-title');
  }
}
