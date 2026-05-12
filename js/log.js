/* =====================================================
 *  KONR — Sistema de log de combate (panel lateral)
 *  Mantiene el historial de jugadas y eventos del combate.
 * ===================================================== */

let logOpen = false;
let logCount = 0;
let currentTurn = 0;

function toggleLog() {
  logOpen = !logOpen;
  document.getElementById('log-panel').classList.toggle('open', logOpen);
  document.getElementById('log-tab').innerHTML = logOpen
    ? `<div class="log-badge" id="log-badge"></div>▶ Historial`
    : `<div class="log-badge ${logCount > 0 ? 'visible' : ''}" id="log-badge">${logCount}</div>◀ Historial`;
  if (logOpen) { logCount = 0; updateLogBadge(); scrollLogToBottom(); }
}

function updateLogBadge() {
  const badge = document.getElementById('log-badge');
  if (!badge) return;
  if (!logOpen && logCount > 0) {
    badge.textContent = logCount;
    badge.classList.add('visible');
  } else {
    badge.classList.remove('visible');
  }
}

function scrollLogToBottom() {
  const el = document.getElementById('log-entries');
  if (el) el.scrollTop = el.scrollHeight;
}

function clearLog() {
  document.getElementById('log-entries').innerHTML =
    '<div class="log-entry log-type-system">Historial limpiado.</div>';
}

function addLogTurnMarker(turn) {
  const el = document.getElementById('log-entries');
  if (!el) return;
  const div = document.createElement('div');
  div.className = 'log-turn-marker';
  div.textContent = turn === 0 ? '— Turno inicial —' : `— Turno ${turn} —`;
  el.appendChild(div);
}

function addLogEntry(type, html, math = '') {
  const el = document.getElementById('log-entries');
  if (!el) return;
  const div = document.createElement('div');
  div.className = `log-entry log-type-${type}`;
  div.innerHTML = html + (math ? `<div class="log-math">${math}</div>` : '');
  el.appendChild(div);
  if (!logOpen) { logCount++; updateLogBadge(); }
  scrollLogToBottom();
}

/* ─── Helpers para eventos específicos ───────────────── */

function logCardPlayed(card) {
  const typeClass = {
    attack: 'card', skill: 'skill', power: 'skill',
    memory: 'card', curse: 'curse'
  }[card.type] || 'card';
  addLogEntry(typeClass,
    `<strong>${card.name}</strong> <span style="color:var(--text3);font-size:10px;">[${card.type} · ${card.cost} Íthyr]</span>`,
    `<span style="font-style:italic;color:var(--text3);">${card.lore}</span>`
  );
}

function logAttackOnEnemy(cardName, rawDmg, enemyBlock, actualDmg) {
  const enemyName = (typeof G !== 'undefined' && G.enemy?.name) ? G.enemy.name : 'el enemigo';
  if (enemyBlock > 0) {
    addLogEntry('attack',
      `⚔ <strong>${cardName}</strong> → ${enemyName}`,
      `<span>${rawDmg} daño</span> − <span>${enemyBlock} escudo</span> = <span style="color:#ff6060;">${actualDmg} vida perdida</span>`
    );
  } else {
    addLogEntry('attack',
      `⚔ <strong>${cardName}</strong> → ${enemyName}`,
      `<span style="color:#ff6060;">${actualDmg} daño directo</span>`
    );
  }
}

function logDamageTaken(source, rawDmg, absorbed, actual) {
  if (absorbed > 0 && actual > 0) {
    addLogEntry('damage',
      `💥 <strong>${source}</strong> → Konr`,
      `<span>${rawDmg} daño</span> − <span style="color:#5aaaff;">🛡 ${absorbed} escudo</span> = <span style="color:#ff6060;">${actual} vida perdida</span>`
    );
  } else if (absorbed > 0 && actual === 0) {
    addLogEntry('block',
      `🛡 <strong>${source}</strong> → bloqueado totalmente`,
      `<span>${rawDmg} daño</span> − <span style="color:#5aaaff;">🛡 ${absorbed} escudo</span> = <span style="color:#5aaaff;">0 daño</span>`
    );
  } else {
    addLogEntry('damage',
      `💥 <strong>${source}</strong> → Konr`,
      `<span style="color:#ff6060;">${actual} daño directo (sin escudo)</span>`
    );
  }
}

function logBlockGained(cardName, amt) {
  addLogEntry('block', `🛡 <strong>${cardName}</strong> → +${amt} escudo`);
}

function logEnemyAction(actionName, details) {
  const enemyName = (typeof G !== 'undefined' && G.enemy?.name) ? G.enemy.name : 'Enemigo';
  // Icono según el tipo: 👻 para Ecos, 🐻 para criaturas. Default 👻.
  const icon = (typeof G !== 'undefined' && G.enemy?.logIcon) ? G.enemy.logIcon : '👻';
  addLogEntry('enemy',
    `${icon} <strong>${enemyName}:</strong> ${actionName}`,
    details ? `<span>${details}</span>` : ''
  );
}

function logCurseAdded(curseName) {
  addLogEntry('curse', `☠ Maldición "<strong>${curseName}</strong>" agregada al mazo`);
}

function logSystem(msg) {
  addLogEntry('system', msg);
}
