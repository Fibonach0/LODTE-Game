/* =====================================================
 *  KONR — Definiciones de cartas
 *
 *  Cada carta:
 *    id     — clave interna (igual que la del objeto)
 *    name   — nombre visible
 *    type   — attack | skill | power | memory | curse
 *    cost   — coste en Íthyr
 *    art    — emoji (fallback usado si no hay `image`)
 *    image  — opcional. Path a una ilustración renderizada
 *             (relativa a index.html). Si está, reemplaza al emoji.
 *    desc   — descripción mecánica corta
 *    lore   — texto de ambientación
 *    effect(g) — función que ejecuta la carta sobre el estado g
 * ===================================================== */

const CARDS = {

  /* ─── ATTACKS BÁSICOS ─────────────────────────────── */

  strike: {
    id: 'strike', name: 'Golpe', type: 'attack', cost: 1, art: '⚔️',
    image: 'assets/cards/strike_art.png',
    desc: 'Inflige 6 de daño.',
    lore: '"La mano que partió el sello, también puede luchar."',
    effect(g) {
      const eb = g.enemy.block;
      dealDamageToEnemy(g, 6 + g.strength);
      logAttackOnEnemy('Golpe', 6 + g.strength, eb, Math.max(0, 6 + g.strength - eb));
    }
  },

  strike2: {
    id: 'strike2', name: 'Estocada', type: 'attack', cost: 1, art: '🗡️',
    image: 'assets/cards/strike2_art.png',
    desc: 'Inflige 9 de daño.',
    lore: '"Sin honor. Solo necesidad."',
    effect(g) {
      const eb = g.enemy.block;
      dealDamageToEnemy(g, 9 + g.strength);
      logAttackOnEnemy('Estocada', 9 + g.strength, eb, Math.max(0, 9 + g.strength - eb));
    }
  },

  /* ─── DEFENSAS ─────────────────────────────────────── */

  defend: {
    id: 'defend', name: 'Escudo', type: 'skill', cost: 1, art: '🛡️',
    image: 'assets/cards/defend_art.png',
    desc: 'Gana 5 de escudo.',
    lore: '"No fue suficiente entonces. Quizás ahora."',
    effect(g) {
      gainBlock(g, 5);
      logBlockGained('Escudo', 5);
    }
  },

  defend2: {
    id: 'defend2', name: 'Último Escudo', type: 'skill', cost: 1, art: '🔰',
    image: 'assets/cards/ultimo_escudo_art.png',
    desc: 'Gana 8 de escudo.',
    lore: '"Esta vez no dejaré que pase."',
    effect(g) {
      gainBlock(g, 8);
      logBlockGained('Último Escudo', 8);
    }
  },

  /* ─── PODERES Y EFECTOS ESPECIALES ─────────────────── */

  bragi: {
    id: 'bragi', name: 'Edicto de Bragi', type: 'power', cost: 1, art: '⚖️',
    image: 'assets/cards/bragi_art.png',
    desc: '+2 de fuerza este turno.',
    lore: '"El dios del orden que Konr traicionó."',
    effect(g) {
      g.strength += 2;
      addLogEntry('skill', '⚖ <strong>Edicto de Bragi</strong> → +2 Fuerza este turno');
      log('El poder de Bragi fluye... pero se siente hueco.');
      updateStatusEffects(g);
    }
  },

  njord: {
    id: 'njord', name: 'Furia de Njord', type: 'attack', cost: 2, art: '🌊',
    image: 'assets/cards/njord_art.png',
    desc: 'Inflige 16 de daño. Recibís 4.',
    lore: '"El caos tiene su precio."',
    effect(g) {
      const eb = g.enemy.block;
      dealDamageToEnemy(g, 16 + g.strength);
      logAttackOnEnemy('Furia de Njord', 16 + g.strength, eb, Math.max(0, 16 + g.strength - eb));
      takeDamage(g, 4, 'Contragolpe de Njord');
      log('La furia de Njord no distingue amigos de enemigos.');
    }
  },

  culpa: {
    id: 'culpa', name: 'Culpa', type: 'attack', cost: 1, art: '💔',
    image: 'assets/cards/culpa_art.png',
    desc: 'Inflige 10. Recibís 2.',
    lore: '"Nunca desaparece del todo."',
    effect(g) {
      const eb = g.enemy.block;
      dealDamageToEnemy(g, 10 + g.strength);
      logAttackOnEnemy('Culpa', 10 + g.strength, eb, Math.max(0, 10 + g.strength - eb));
      takeDamage(g, 2, 'Culpa (autoinfligido)');
    }
  },

  /* ─── MEMORIAS Y CARTAS NARRATIVAS ─────────────────── */

  memoria: {
    id: 'memoria', name: 'Fragmento', type: 'memory', cost: 0, art: '🕯️',
    image: 'assets/cards/fragmento_art.png',
    desc: 'Gana 1 Memoria. Sin costo.',
    lore: '"Lo que Konr no puede seguir ignorando."',
    effect(g) {
      g.memories++;
      addLogEntry('skill', `🕯 <strong>Fragmento</strong> → Memorias: ${g.memories}`);
      log(`Memoria recuperada. Total: ${g.memories}`);
      updateStatusEffects(g);
    }
  },

  porElla: {
    id: 'porElla', name: 'Por Mikkja', type: 'attack', cost: 3, art: '🌑',
    image: 'assets/cards/por_mikkja_art.png',
    desc: 'Inflige 22. Gana 1 Memoria.',
    lore: '"Así empezó todo. Así terminará."',
    effect(g) {
      const eb = g.enemy.block;
      const dmg = 22 + g.strength;
      dealDamageToEnemy(g, dmg);
      logAttackOnEnemy('Por Mikkja', dmg, eb, Math.max(0, dmg - eb));
      g.memories++;
      updateStatusEffects(g);
    }
  },

  /* ─── HABILIDADES TÁCTICAS ─────────────────────────── */

  ljuga: {
    id: 'ljuga', name: 'Engaño de Ljuga', type: 'skill', cost: 1, art: '🐍',
    image: 'assets/cards/ljuga_art.png',
    desc: 'Enemigo pierde 6 escudo. Robá 1.',
    lore: '"La diosa del engaño no distingue víctimas."',
    effect(g) {
      const stripped = Math.min(g.enemy.block, 6);
      if (g.enemy.block > 0) {
        g.enemy.block = Math.max(0, g.enemy.block - 6);
        updateEnemyUI(g);
      }
      addLogEntry('skill',
        `🐍 <strong>Engaño de Ljuga</strong>`,
        stripped > 0 ? `Valdra pierde ${stripped} de escudo` : 'Sin escudo que romper'
      );
      drawCards(g, 1);
      log('Ljuga susurra. El eco tropieza.');
    }
  },

  promesaRota: {
    id: 'promesaRota', name: 'Promesa Rota', type: 'attack', cost: 2, art: '🩸',
    image: 'assets/cards/promesa_rota_art.png',
    desc: 'Inflige 12 más 3 por cada Memoria.',
    lore: '"La dije que volvería."',
    effect(g) {
      const eb = g.enemy.block;
      const dmg = 12 + g.strength + (g.memories * 3);
      dealDamageToEnemy(g, dmg);
      logAttackOnEnemy('Promesa Rota', dmg, eb, Math.max(0, dmg - eb));
      log(`Promesa Rota: 12 + ${g.memories}×3 = ${dmg}`);
    }
  },

  lectura: {
    id: 'lectura', name: 'Lectura', type: 'skill', cost: 1, art: '📖',
    image: 'assets/cards/lectura_art.png',
    desc: 'Robá 2 cartas adicionales este turno.',
    lore: '"En los textos del Umbral, Konr buscaba respuestas. Solo encontró más preguntas."',
    effect(g) {
      drawCards(g, 2);
      addLogEntry('skill', '📖 <strong>Lectura</strong> → +2 cartas robadas ahora');
      log('Konr lee los fragmentos del Umbral. Roba 2 cartas.');
    }
  },

  trance: {
    id: 'trance', name: 'Trance', type: 'skill', cost: 2, art: '🌀',
    image: 'assets/cards/trance_art.png',
    desc: 'Descartá tu mano. Robá 4 cartas frescas.',
    lore: '"A veces hay que soltar todo para poder ver."',
    effect(g) {
      const discarded = g.hand.length;
      while (g.hand.length) { g.discard.push(g.hand.pop()); }
      addLogEntry('skill', `🌀 <strong>Trance</strong> → descartó ${discarded} cartas, roba 4`);
      drawCards(g, 4);
      log(`Trance: descartaste ${discarded} cartas, robaste 4.`);
    }
  },

  reserva: {
    id: 'reserva', name: 'Reserva', type: 'power', cost: 0, art: '⚡',
    image: 'assets/cards/reserva_art.png',
    desc: 'Necesitás 2 en mano. Da +1 Íthyr. Consume ambas.',
    lore: '"Konr aprendió a guardar algo para cuando más lo necesita."',
    effect(g) {
      const reservaInHand = g.hand.filter(c => c === 'reserva').length;
      if (reservaInHand < 1) {
        addLogEntry('system', '⚡ <strong>Reserva</strong> — sin par en mano, no activa');
        log('Necesitás al menos 2 Reservas en mano para activar.');
        return;
      }
      const secondIdx = g.hand.indexOf('reserva');
      if (secondIdx !== -1) {
        g.discard.push(g.hand.splice(secondIdx, 1)[0]);
        renderHand(g);
      }
      g.ithyr += 1;
      addLogEntry('skill', `⚡ <strong>Reserva × 2</strong> → +1 Íthyr temporal (total: ${g.ithyr})`);
      log('Las dos Reservas se combinan. +1 Íthyr este turno.');
      updateIthyrUI(g);
    }
  },

  /* ─── MALDICIONES (curse) ──────────────────────────── */

  herida: {
    id: 'herida', name: 'Herida Abierta', type: 'curse', cost: 1, art: '🩸',
    image: 'assets/cards/herida_art.png',
    desc: 'No hace nada. Ocupa la mano.',
    lore: '"La palma sigue ardiendo. Siempre."',
    effect(g) {
      addLogEntry('curse', '☠ <strong>Herida Abierta</strong> — no hace nada');
      log('"La herida late. El pasado no sana."');
    }
  },

  agotamiento: {
    id: 'agotamiento', name: 'Agotamiento', type: 'curse', cost: 0, art: '💀',
    image: 'assets/cards/agotamiento_art.png',
    desc: 'Descartá 2 cartas al azar.',
    lore: '"Konr ya no recuerda por qué sube."',
    effect(g) {
      const lost = [];
      for (let i = 0; i < 2; i++) {
        if (g.hand.length > 0) {
          const ri = Math.floor(Math.random() * g.hand.length);
          lost.push(CARDS[g.hand[ri]]?.name || '?');
          g.discard.push(g.hand.splice(ri, 1)[0]);
        }
      }
      addLogEntry('curse', `☠ <strong>Agotamiento</strong> → descartó: ${lost.join(', ')}`);
      renderHand(g);
      log('El agotamiento te roba dos cartas.');
    }
  },

  duda: {
    id: 'duda', name: 'Duda', type: 'curse', cost: 2, art: '🌀',
    image: 'assets/cards/duda_art.png',
    desc: 'Cuesta 2. Gana 3 de escudo.',
    lore: '"¿Y si ya era tarde cuando rompiste el sello?"',
    effect(g) {
      gainBlock(g, 3);
      logBlockGained('Duda (maldición)', 3);
      addLogEntry('curse', '🌀 <strong>Duda</strong> — 2 Íthyr por solo 3 escudo');
      log('"La duda pesa más que la armadura."');
    }
  },

  /* ─── CARTAS MEJORADAS (+versions) ─────────────────── *
   *  Versiones upgradeables. Se obtienen en la tienda por
   *  100g (Mejorar una carta). Cada mejora hace la carta más
   *  fuerte de forma significativa pero mantiene el coste.
   * ─────────────────────────────────────────────────────── */

  strikePlus: {
    id: 'strikePlus', name: 'Golpe+', type: 'attack', cost: 1, art: '⚔️',
    image: 'assets/cards/strike_art.png',
    desc: 'Inflige 9 de daño.',
    lore: '"La mano que partió el sello, ahora golpea con eco."',
    effect(g) {
      const eb = g.enemy.block;
      dealDamageToEnemy(g, 9 + g.strength);
      logAttackOnEnemy('Golpe+', 9 + g.strength, eb, Math.max(0, 9 + g.strength - eb));
    }
  },

  defendPlus: {
    id: 'defendPlus', name: 'Escudo+', type: 'skill', cost: 1, art: '🛡️',
    image: 'assets/cards/defend_art.png',
    desc: 'Gana 8 de escudo.',
    lore: '"Esta vez Konr sabe dónde caen los golpes."',
    effect(g) {
      gainBlock(g, 8);
      logBlockGained('Escudo+', 8);
    }
  },

  bragiPlus: {
    id: 'bragiPlus', name: 'Edicto de Bragi+', type: 'power', cost: 1, art: '⚖️',
    image: 'assets/cards/bragi_art.png',
    desc: '+3 de fuerza este turno.',
    lore: '"El dios traicionado aún acude cuando lo invocan."',
    effect(g) {
      g.strength += 3;
      addLogEntry('skill', '⚖ <strong>Edicto de Bragi+</strong> → +3 Fuerza este turno');
      log('El poder de Bragi fluye con más fuerza.');
      updateStatusEffects(g);
    }
  },

  culpaPlus: {
    id: 'culpaPlus', name: 'Culpa+', type: 'attack', cost: 1, art: '💔',
    image: 'assets/cards/culpa_art.png',
    desc: 'Inflige 14. Recibís 1.',
    lore: '"La culpa duele, pero ya menos."',
    effect(g) {
      const eb = g.enemy.block;
      dealDamageToEnemy(g, 14 + g.strength);
      logAttackOnEnemy('Culpa+', 14 + g.strength, eb, Math.max(0, 14 + g.strength - eb));
      takeDamage(g, 1, 'Culpa (autoinfligido)');
    }
  },

};

// Mapa de upgrades: cardId base → cardId mejorado.
// Solo las cartas listadas son upgradeables en la tienda.
const UPGRADE_MAP = {
  strike: 'strikePlus',
  defend: 'defendPlus',
  bragi: 'bragiPlus',
  culpa: 'culpaPlus',
};
