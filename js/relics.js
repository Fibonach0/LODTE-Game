/* =====================================================
 *  KONR — Reliquias / Memorias
 *
 *  Items pasivos que el jugador acumula. Cada reliquia tiene
 *  hooks que se llaman en momentos específicos del combate.
 *
 *  Hooks disponibles:
 *    onCombatStart(g)     — al empezar combate
 *    onTurnStart(g)       — al empezar cada turno del jugador
 *    onCardPlay(g, card)  — al jugar una carta
 *    onDamageTaken(g, n)  — al recibir daño (n = HP perdido real)
 *    onVictory(g)         — al ganar el combate
 * ===================================================== */

const RELICS = {

  anilloSello: {
    id: 'anilloSello',
    name: 'Anillo del Sello',
    description: 'Empezás cada combate con +3 escudo.',
    art: '💍',
    price: 100,
    rarity: 'common',
    hooks: {
      onCombatStart(g) {
        g.block += 3;
        if (typeof updateBlockDisplay === 'function') updateBlockDisplay(g);
        if (typeof addLogEntry === 'function') {
          addLogEntry('skill', '💍 <strong>Anillo del Sello</strong> → +3 escudo inicial');
        }
      }
    }
  },

  dienteOso: {
    id: 'dienteOso',
    name: 'Diente del Oso',
    description: '+1 daño permanente a todos tus ataques.',
    art: '🦷',
    price: 150,
    rarity: 'rare',
    hooks: {
      onCombatStart(g) {
        g.relicStrength = (g.relicStrength || 0) + 1;
        if (typeof addLogEntry === 'function') {
          addLogEntry('skill', '🦷 <strong>Diente del Oso</strong> → +1 daño permanente');
        }
      }
    }
  },

  plumaCuervo: {
    id: 'plumaCuervo',
    name: 'Pluma de Cuervo',
    description: 'Robás 1 carta extra al inicio del combate.',
    art: '🪶',
    price: 100,
    rarity: 'common',
    hooks: {
      onCombatStart(g) {
        if (typeof drawCards === 'function') drawCards(g, 1);
        if (typeof addLogEntry === 'function') {
          addLogEntry('skill', '🪶 <strong>Pluma de Cuervo</strong> → +1 carta inicial');
        }
      }
    }
  },

  brujulaNorte: {
    id: 'brujulaNorte',
    name: 'Brújula del Norte',
    description: '+5 oro extra al ganar cualquier combate.',
    art: '🧭',
    price: 80,
    rarity: 'common',
    hooks: {
      onVictory(g) {
        g.gold = (g.gold || 0) + 5;
        if (typeof addLogEntry === 'function') {
          addLogEntry('skill', '🧭 <strong>Brújula del Norte</strong> → +5 oro');
        }
      }
    }
  },

  lagrimaMikkja: {
    id: 'lagrimaMikkja',
    name: 'Lágrima de Mikkja',
    description: 'Curás 3 HP al inicio de cada turno.',
    art: '💧',
    price: 200,
    rarity: 'rare',
    hooks: {
      onTurnStart(g) {
        if (g.hp >= g.maxHp) return;
        const heal = 3;
        g.hp = Math.min(g.maxHp, g.hp + heal);
        if (typeof updatePlayerUI === 'function') updatePlayerUI(g);
        if (typeof addLogEntry === 'function') {
          addLogEntry('skill', `💧 <strong>Lágrima de Mikkja</strong> → +${heal} HP`);
        }
      }
    }
  },

  cuernoBragi: {
    id: 'cuernoBragi',
    name: 'Cuerno de Bragi',
    description: '+1 Íthyr máximo cada turno (4 en vez de 3).',
    art: '🎺',
    price: 220,
    rarity: 'rare',
    hooks: {
      onCombatStart(g) {
        g.maxIthyr = 4;
        g.ithyr = 4;
        if (typeof updateIthyrUI === 'function') updateIthyrUI(g);
        if (typeof addLogEntry === 'function') {
          addLogEntry('skill', '🎺 <strong>Cuerno de Bragi</strong> → maxIthyr 3 → 4');
        }
      }
    }
  },

  sangreNjord: {
    id: 'sangreNjord',
    name: 'Sangre de Njord',
    description: 'Al recibir daño, devolvés la mitad al enemigo.',
    art: '🩸',
    price: 300,
    rarity: 'legendary',
    hooks: {
      onDamageTaken(g, actual) {
        if (!g.enemy || g.enemy.hp <= 0) return;
        if (actual <= 0) return;
        const reflected = Math.floor(actual / 2);
        if (reflected <= 0) return;
        g.enemy.hp = Math.max(0, g.enemy.hp - reflected);
        if (typeof updateEnemyUI === 'function') updateEnemyUI(g);
        if (typeof addLogEntry === 'function') {
          addLogEntry('skill', `🩸 <strong>Sangre de Njord</strong> → ${reflected} dmg reflejado`);
        }
      }
    }
  },

  espinaLjuga: {
    id: 'espinaLjuga',
    name: 'Espina de Ljuga',
    description: 'Cada 3 cartas jugadas en combate, robás 1 extra.',
    art: '🌹',
    price: 150,
    rarity: 'rare',
    hooks: {
      onCombatStart(g) {
        g.espinaCounter = 0;
      },
      onCardPlay(g) {
        g.espinaCounter = (g.espinaCounter || 0) + 1;
        if (g.espinaCounter >= 3) {
          g.espinaCounter = 0;
          if (typeof drawCards === 'function') drawCards(g, 1);
          if (typeof addLogEntry === 'function') {
            addLogEntry('skill', `🌹 <strong>Espina de Ljuga</strong> → +1 carta`);
          }
        }
      }
    }
  },

};

/* ─── Aplicar hooks ──────────────────────────────────── */
function applyRelicHook(hookName, g, ...args) {
  if (!g || !Array.isArray(g.relics)) return;
  g.relics.forEach(id => {
    const r = RELICS[id];
    if (!r || !r.hooks || typeof r.hooks[hookName] !== 'function') return;
    try {
      r.hooks[hookName](g, ...args);
    } catch (e) {
      console.error(`Reliquia ${id} hook ${hookName} falló:`, e);
    }
  });
}

/* ─── HUD: render de reliquias ───────────────────────── */
function renderRelicsHUD() {
  const containers = [
    document.getElementById('map-relics'),
    document.getElementById('combat-relics')
  ];
  containers.forEach(el => {
    if (!el) return;
    el.innerHTML = '';
    if (!Array.isArray(G.relics) || G.relics.length === 0) return;
    G.relics.forEach(id => {
      const r = RELICS[id];
      if (!r) return;
      const div = document.createElement('div');
      div.className = 'relic-icon';
      div.title = `${r.name} — ${r.description}`;
      div.innerHTML = r.image
        ? `<img src="${r.image}" alt="${r.name}">`
        : `<span class="relic-emoji">${r.art}</span>`;
      el.appendChild(div);
    });
  });
}

function addRelic(id) {
  if (!RELICS[id]) return false;
  if (!Array.isArray(G.relics)) G.relics = [];
  if (G.relics.includes(id)) return false;
  G.relics.push(id);
  if (typeof saveRun === 'function') saveRun();
  renderRelicsHUD();
  return true;
}
