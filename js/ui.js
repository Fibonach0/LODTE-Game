/* =====================================================
 *  KONR — Helpers de UI / DOM
 * ===================================================== */

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function log(msg) {
  const el = document.getElementById('combat-log');
  el.textContent = msg;
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = '';
}

function showPopup(amt, side) {
  if (amt === 0) return;
  const el = document.createElement('div');
  el.className = `dmg-popup ${side === 'block-absorbed' ? 'block' : side}`;
  if (side === 'block' || side === 'block-absorbed') el.textContent = `🛡 -${amt}`;
  else if (side === 'heal') el.textContent = `+${amt} ❤`;
  else el.textContent = `-${amt}`;
  if (side === 'block-absorbed') {
    el.style.left = '15%';
    el.style.top = '35%';
    el.style.color = '#5aaaff';
  }
  document.querySelector('.arena').appendChild(el);
  setTimeout(() => el.remove(), 900);
}

function updateUI(g) {
  updatePlayerUI(g);
  updateEnemyUI(g);
  updateIthyrUI(g);
  renderStatusEffects(g);
  updateDeckCount(g);
}

function updatePlayerUI(g) {
  const pct = (g.hp / g.maxHp) * 100;
  document.getElementById('bar-hp').style.width = pct + '%';
  document.getElementById('hp-num').textContent = `${g.hp}/${g.maxHp}`;
  document.getElementById('scar-count').textContent = g.scars;
  const goldEl = document.getElementById('combat-gold');
  if (goldEl) goldEl.textContent = `🪙 ${g.gold ?? 0}`;
  if (typeof renderRelicsHUD === 'function') renderRelicsHUD();
  updatePlayerHint(g);
}

function updatePlayerHint(g) {
  const hints = [];
  if (g.block > 0)    hints.push(`Escudo: ${g.block}`);
  if (g.strength > 0) hints.push(`Fuerza: +${g.strength}`);
  if (g.memories > 0) hints.push(`Memorias: ${g.memories}`);
  document.getElementById('player-hint').textContent =
    hints.length ? hints.join(' · ') : 'Jugá cartas para atacar o defenderte.';
}

function renderStatusEffects(g) {
  const el = document.getElementById('status-effects');
  let html = '';
  if (g.strength > 0) html += `<span class="effect-badge effect-str">Fuerza +${g.strength}</span>`;
  if (g.memories > 0) html += `<span class="effect-badge effect-vuln">Memorias ${g.memories}</span>`;
  el.innerHTML = html;
}

function updateStatusEffects(g) { renderStatusEffects(g); }

function updateBlockDisplay(g) {
  const el = document.getElementById('block-display');
  const num = document.getElementById('block-num');
  if (g.block > 0) {
    el.style.display = 'block';
    num.textContent = g.block;
  } else {
    el.style.display = 'none';
    num.textContent = '0';
  }
  const topNum = document.getElementById('topbar-block-num');
  const blockBar = document.getElementById('bar-block');
  if (g.block > 0) {
    topNum.style.display = 'block';
    topNum.textContent = `🛡 ${g.block}`;
    blockBar.style.width = Math.min(100, (g.block / g.maxHp) * 100) + '%';
  } else {
    topNum.style.display = 'none';
    blockBar.style.width = '0%';
  }
}

function updateEnemyUI(g) {
  const e = g.enemy;
  const pct = (e.hp / e.maxHp) * 100;
  document.getElementById('enemy-hp-bar').style.width = pct + '%';
  document.getElementById('enemy-hp-num').textContent = `${e.hp} / ${e.maxHp}`;

  // Badge chico debajo del enemigo
  const bd = document.getElementById('enemy-block-badge');
  if (bd) {
    if (e.block > 0) {
      bd.textContent = `Escudo: ${e.block}`;
      bd.classList.add('visible');
    } else {
      bd.classList.remove('visible');
    }
  }

  // Overlay GRANDE encima del enemigo
  const overlay = document.getElementById('enemy-block-overlay');
  const num = document.getElementById('enemy-block-num');
  if (overlay && num) {
    if (e.block > 0) {
      num.textContent = e.block;
      overlay.classList.add('visible');
    } else {
      overlay.classList.remove('visible');
    }
  }
}

function updateEnemyIntentUI(g) {
  const e = g.enemy;
  const intents = e.phase === 2 ? e.phase2Intents : e.phase1Intents;
  const next = intents[e.intentIdx % intents.length];
  const txt = next.dmg
    ? `⚠ Intenta: ${next.name} (${next.dmg} dmg)`
    : `Intenta: ${next.name}`;
  document.getElementById('enemy-intent').textContent = txt;
}

function updateIthyrUI(g) {
  const el = document.getElementById('ithyr-display');
  let html = '';
  for (let i = 0; i < g.maxIthyr; i++) {
    html += `<div class="ithyr-crystal ${i < g.ithyr ? 'full' : 'empty'}">${i < g.ithyr ? '◆' : '◇'}</div>`;
  }
  el.innerHTML = html;
  document.getElementById('ithyr-num').textContent = `${g.ithyr}/${g.maxIthyr}`;
}

function updateDeckCount(g) {
  const deckEl = document.getElementById('deck-count');
  const discardEl = document.getElementById('discard-count');
  const remaining = g.deck.length;
  if (remaining === 0) {
    deckEl.innerHTML = `<span style="color:var(--red2);font-weight:600;">Mazo: VACÍO ⚠</span>`;
  } else if (remaining <= 3) {
    deckEl.innerHTML = `<span style="color:var(--gold);">Mazo: ${remaining} ⚠</span>`;
  } else {
    deckEl.textContent = `Mazo: ${remaining}`;
  }
  discardEl.textContent = `Descarte: ${g.discard.length}`;
}

function renderCardArt(c) {
  if (c.image) {
    return `<div class="card-art has-image"><img src="${c.image}" alt="${c.name}"></div>`;
  }
  return `<div class="card-art">${c.art}</div>`;
}

function renderEnemyArt(enemy, phase = 1) {
  const sil = document.getElementById('enemy-sil');
  if (!sil) return;
  const img = (phase === 2 && enemy.phase2Image) ? enemy.phase2Image : enemy.image;
  if (img) {
    sil.innerHTML = `<img src="${img}" alt="${enemy.name}">`;
    sil.classList.add('has-image');
  } else {
    const art = (phase === 2 && enemy.phase2Art) ? enemy.phase2Art : enemy.art;
    sil.classList.remove('has-image');
    sil.textContent = art;
  }
}

function renderHand(g) {
  const el = document.getElementById('hand-cards');
  el.innerHTML = '';
  g.hand.forEach((cardId, idx) => {
    const c = CARDS[cardId];
    if (!c) return;
    const canPlay = g.ithyr >= c.cost;
    const isCurse = c.type === 'curse';
    el.innerHTML += `
    <div class="card ${canPlay ? '' : 'unplayable'} ${isCurse ? 'curse-card' : ''}"
         onclick="playCard(G,${idx})"
         title="${c.lore}"
         style="${isCurse ? 'border-color:#4a1010;opacity:0.75;' : ''}">
      <div class="card-type-bar ${c.type}" style="${isCurse ? 'background:#8b2020;' : ''}"></div>
      <div class="card-cost ${c.cost === 0 ? 'free' : ''}" style="${isCurse ? 'background:#4a1010;color:#c43030;' : ''}">${c.cost}</div>
      ${renderCardArt(c)}
      <div class="card-name" style="${isCurse ? 'color:#8a5a5a;' : ''}">${c.name}</div>
      <div class="card-divider"></div>
      <div class="card-desc" style="${isCurse ? 'color:#6a4a4a;' : ''}">${c.desc}</div>
      <div class="card-type-label" style="${isCurse ? 'color:#6a3a3a;' : ''}">${c.type}</div>
    </div>`;
  });
}
