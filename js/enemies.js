/* =====================================================
 *  KONR — Definiciones de enemigos
 * ===================================================== */

const ENEMIES = {

  valdra: {
    name: 'Eco de Valdra',
    title: '"La Mentora Caída"',
    art: '🌫️',
    image: 'assets/enemies/valdra_phase1_art.png',
    phase2Title: '"El Eco Desencadenado"',
    phase2Art: '💀',
    phase2Image: 'assets/enemies/valdra_phase2_art.png',
    canBreakWall: true,
    logIcon: '👻',
    introLine: 'El eco de Valdra te reconoce. "Sabía que volverías, Konr."',
    victoryFlavor: '"El eco de Valdra se disuelve. Su voz se apaga."',
    defeatFlavor: '"El eco de Valdra te conoce demasiado bien."',
    hp: 70, maxHp: 70, block: 0,
    phase: 1,

    phase1Intents: [
      { name: 'Golpe del Umbral', dmg: 10, effect(g) { takeDamage(g, 10); } },
      { name: 'Espejo de Culpa', dmg: 0,
        effect(g) {
          g.enemy.block += 8;
          updateEnemyUI(g);
          log('Valdra invoca un escudo tejido con tu culpa.');
        }
      },
      { name: 'Doble Estocada', dmg: 14,
        effect(g) { takeDamage(g, 7); takeDamage(g, 7); }
      },
      { name: 'Maldición', dmg: 5,
        effect(g) {
          takeDamage(g, 5, 'Maldición de Valdra');
          const curses = ['herida', 'duda'];
          const c = curses[Math.floor(Math.random() * curses.length)];
          g.discard.push(c);
          updateDeckCount(g);
          logCurseAdded(CARDS[c].name);
          log(`Valdra implanta "${CARDS[c].name}" en tu mazo.`);
        }
      },
    ],

    phase2Intents: [
      { name: 'Furia del Umbral', dmg: 14, effect(g) { takeDamage(g, 14); } },
      { name: 'Recuerdo Forzado', dmg: 8,
        effect(g) {
          takeDamage(g, 8);
          g.discard.push('herida');
          updateDeckCount(g);
          log('"¿Lo recuerdas, Konr? Una herida más en tu mazo."');
        }
      },
      { name: 'Tormenta Triple', dmg: 18,
        effect(g) { takeDamage(g, 6); takeDamage(g, 6); takeDamage(g, 6); }
      },
      { name: 'Golpe Inevitable', dmg: 12,
        effect(g) {
          const absorbed = Math.min(g.block, 6);
          g.block = Math.max(0, g.block - 6);
          renderStatusEffects(g);
          takeDamage(g, 12);
          log('"Valdra atraviesa parte de tu escudo. Te conoce."');
        }
      },
    ],

    intentIdx: 0,

    onTurn(g) {
      const inPhase2 = this.hp <= Math.floor(this.maxHp * 0.45);
      if (inPhase2 && this.phase === 1) {
        this.phase = 2;
        this.intentIdx = 0;
        document.getElementById('enemy-title').textContent = this.phase2Title || '"Forma final"';
        renderEnemyArt(this, 2);
        log('Valdra cambia. "Basta de contenerme, Konr."');
        updateEnemyIntentUI(g);
        return;
      }
      const intents = this.phase === 1 ? this.phase1Intents : this.phase2Intents;
      const i = intents[this.intentIdx % intents.length];
      i.effect(g);
      this.intentIdx++;
      updateEnemyIntentUI(g);
    }
  },

  oso: {
    name: 'Oso del Bosque',
    title: '"El Guardián de Myrkviðr"',
    art: '🐻',
    image: 'assets/enemies/oso_art.png',
    logIcon: '🐻',
    introLine: 'Algo enorme se mueve entre los árboles. Konr empuña la espada.',
    victoryFlavor: '"El oso cae con un último gruñido. El bosque queda en silencio."',
    defeatFlavor: '"El oso era más fuerte. Konr cae bajo sus garras."',
    hp: 80, maxHp: 80, block: 0,
    phase: 1,

    phase1Intents: [
      { name: 'Zarpazo Doble', dmg: 12,
        effect(g) { takeDamage(g, 6, 'Zarpazo (1)'); takeDamage(g, 6, 'Zarpazo (2)'); }
      },
      { name: 'Embestida', dmg: 14,
        effect(g) {
          takeDamage(g, 14, 'Embestida del Oso');
          log('El oso te embiste de lleno. Hueso contra hueso.');
        }
      },
      { name: 'Rugido', dmg: 0,
        effect(g) {
          g.enemy.block += 10;
          updateEnemyUI(g);
          addLogEntry('enemy', `🐻 <strong>Rugido</strong> — el oso ruge y se cubre`, '+10 escudo');
          log('El oso ruge. Las hojas tiemblan.');
        }
      },
      { name: 'Tarascada', dmg: 9,
        effect(g) {
          if (g.block > 0) {
            const stripped = Math.min(g.block, 5);
            g.block = Math.max(0, g.block - 5);
            renderStatusEffects(g);
            updateBlockDisplay(g);
            addLogEntry('enemy',
              `🐻 <strong>Tarascada</strong> — los colmillos atraviesan tu guardia`,
              `Ignora ${stripped} de escudo`
            );
          }
          takeDamage(g, 9, 'Tarascada');
          log('Los colmillos pasan el acero. La sangre brota.');
        }
      },
    ],

    phase2Intents: null,
    intentIdx: 0,

    onTurn(g) {
      const i = this.phase1Intents[this.intentIdx % this.phase1Intents.length];
      i.effect(g);
      this.intentIdx++;
      updateEnemyIntentUI(g);
    }
  },

  bandidos: {
    name: 'Bandidos del Camino',
    title: '"Los que esperan en los pasos"',
    art: '🗡️',
    image: 'assets/enemies/bandidos_art.png',
    logIcon: '🗡️',
    introLine: '"Tu bolsa o tu vida, viajero." Tres figuras emergen del camino.',
    victoryFlavor: '"Los bandidos huyen o caen. El camino queda libre."',
    defeatFlavor: '"Te dejaron sangrando en el camino. Despertás más tarde, sin nada."',
    hp: 55, maxHp: 55, block: 0,
    phase: 1,

    phase1Intents: [
      { name: 'Cuchilladas', dmg: 8,
        effect(g) {
          takeDamage(g, 3, 'Cuchillada (1)');
          takeDamage(g, 3, 'Cuchillada (2)');
          takeDamage(g, 2, 'Cuchillada (3)');
          log('Cuchillos rápidos buscan tu carne.');
        }
      },
      { name: 'Estocada Limpia', dmg: 11,
        effect(g) {
          takeDamage(g, 11, 'Estocada de los bandidos');
          log('Una estocada precisa. Los bandidos saben dónde duele.');
        }
      },
      { name: 'Cubrirse', dmg: 0,
        effect(g) {
          g.enemy.block += 6;
          updateEnemyUI(g);
          addLogEntry('enemy', `🗡️ <strong>Cubrirse</strong> — los bandidos se atrincheran`, '+6 escudo');
          log('Los bandidos se cubren detrás de las rocas.');
        }
      },
      { name: 'Robo', dmg: 4,
        effect(g) {
          takeDamage(g, 4, 'Cuchillazo distractor');
          if (g.hand.length > 0) {
            const ri = Math.floor(Math.random() * g.hand.length);
            const stolenId = g.hand.splice(ri, 1)[0];
            const stolen = CARDS[stolenId];
            g.discard.push(stolenId);
            renderHand(g);
            addLogEntry('enemy',
              `🗡️ <strong>Robo</strong> — te arrebatan "${stolen?.name || '?'}"`,
              'Descartada al mazo de descarte'
            );
            log(`Te arrebatan "${stolen?.name || '?'}" de la mano.`);
          }
        }
      },
    ],

    phase2Intents: null,
    intentIdx: 0,

    onTurn(g) {
      const i = this.phase1Intents[this.intentIdx % this.phase1Intents.length];
      i.effect(g);
      this.intentIdx++;
      updateEnemyIntentUI(g);
    }
  },

  ninoSinNombre: {
    name: 'El Niño Sin Nombre',
    title: '"Lo que dejaste atrás"',
    art: '👶',
    image: 'assets/enemies/nino_sin_nombre_art.png',
    logIcon: '👤',
    introLine: 'Un niño pequeño te mira. No tiene nombre. Pero te conoce.',
    victoryFlavor: '"El niño se desvanece sin un grito. Konr sigue caminando."',
    defeatFlavor: '"El niño creció demasiado. Konr no pudo enfrentar lo que dejó atrás."',
    hp: 40, maxHp: 40, block: 0,
    phase: 1,

    phase1Intents: [
      { name: 'Susurro', dmg: 4,
        effect(g) {
          const dmg = 4 + (g.enemy.growth || 0);
          takeDamage(g, dmg, 'Susurro del niño');
          log('"Tendrías que haberme buscado, Konr."');
        }
      },
      { name: 'Mirada', dmg: 6,
        effect(g) {
          const dmg = 6 + (g.enemy.growth || 0);
          takeDamage(g, dmg, 'Mirada del niño');
          log('Te mira. Pesa más que cualquier golpe.');
        }
      },
      { name: 'Crecer', dmg: 0,
        effect(g) {
          g.enemy.growth = (g.enemy.growth || 0) + 2;
          g.enemy.hp = Math.min(g.enemy.maxHp, g.enemy.hp + 8);
          g.enemy.maxHp += 4;
          updateEnemyUI(g);
          addLogEntry('enemy',
            `👤 <strong>Crecer</strong> — el niño envejece un año más`,
            `+2 daño futuro · +8 HP · maxHp ahora ${g.enemy.maxHp}`
          );
          log('El niño crece. Cada turno se parece más a un adulto.');
        }
      },
      { name: 'Reproche', dmg: 8,
        effect(g) {
          const dmg = 8 + (g.enemy.growth || 0);
          takeDamage(g, dmg, 'Reproche');
          log('"Pudiste haberme salvado."');
        }
      },
    ],

    phase2Intents: null,
    intentIdx: 0,

    onTurn(g) {
      if (g.enemy.growth === undefined) g.enemy.growth = 0;
      const i = this.phase1Intents[this.intentIdx % this.phase1Intents.length];
      i.effect(g);
      this.intentIdx++;
      updateEnemyIntentUI(g);
    }
  },

  enjambre: {
    name: 'Enjambre de Abejas',
    title: '"Las pequeñas furias del bosque"',
    art: '🐝',
    image: 'assets/enemies/enjambre_art.png',
    logIcon: '🐝',
    introLine: 'Un zumbido cubre el aire. Konr golpeó algo que no debía.',
    victoryFlavor: '"El enjambre se dispersa. Konr respira."',
    defeatFlavor: '"Mil aguijones. Konr cae con la piel hinchada."',
    hp: 35, maxHp: 35, block: 0,
    phase: 1,

    phase1Intents: [
      { name: 'Aguijón Múltiple', dmg: 6,
        effect(g) {
          takeDamage(g, 2, 'Aguijón');
          takeDamage(g, 1, 'Aguijón');
          takeDamage(g, 2, 'Aguijón');
          takeDamage(g, 1, 'Aguijón');
        }
      },
      { name: 'Aguijonazo', dmg: 4,
        effect(g) {
          takeDamage(g, 1, 'Aguijón');
          takeDamage(g, 1, 'Aguijón');
          takeDamage(g, 1, 'Aguijón');
          takeDamage(g, 1, 'Aguijón');
        }
      },
      { name: 'Aguijón Múltiple', dmg: 5,
        effect(g) {
          takeDamage(g, 2, 'Aguijón');
          takeDamage(g, 2, 'Aguijón');
          takeDamage(g, 1, 'Aguijón');
        }
      },
    ],

    phase2Intents: null,
    intentIdx: 0,

    onTurn(g) {
      const i = this.phase1Intents[this.intentIdx % this.phase1Intents.length];
      i.effect(g);
      this.intentIdx++;
      updateEnemyIntentUI(g);
    }
  },

};
