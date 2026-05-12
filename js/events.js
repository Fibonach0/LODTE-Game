/* =====================================================
 *  KONR — Eventos narrativos
 * ===================================================== */

const EVENTS = {

  carruaje: {
    title: 'El carruaje volcado',
    description:
      'Una mujer joven está apoyada contra un carruaje partido. ' +
      'Un eje rajado, las ruedas en el barro. Te ve y te llama: ' +
      '"Por favor, ayudame... mi marido está atrapado debajo." ' +
      'Su voz es perfecta. Demasiado.',
    options: [
      {
        label: 'Acercarse al carruaje',
        description: 'Parece desesperada. Konr no puede ignorarla.',
        effect(node) {
          G.eventBonusReward = true;
          G.currentNodeEnemy = 'bandidos';
          G.currentNodeId = node.id;
          G.hp = Math.max(1, (G.hp || G.maxHp || 70) - 3);
          startGame(true);
        }
      },
      {
        label: 'Lanzar una piedra al carruaje',
        description: 'Probar antes de acercarse. Si es una trampa, vas a saberlo.',
        effect(node) {
          markNodeCompleted(node.id);
          if (typeof saveRun === 'function') saveRun();
          if (typeof openMap === 'function') openMap();
        }
      },
      {
        label: 'Seguir camino',
        description: 'No te fíes de voces ajenas en Myrkviðr.',
        effect(node) {
          markNodeCompleted(node.id);
          if (typeof saveRun === 'function') saveRun();
          if (typeof openMap === 'function') openMap();
        }
      }
    ]
  },

  cruce_marino: {
    title: 'La Travesía',
    description:
      'El mar entre Konr y la isla. Un viejo pescador ofrece su barca por unas monedas. ' +
      'Más arriba, un domador de águilas-niebla pide más oro pero promete un viaje sin tormentas.',
    options: [
      {
        label: 'Cruzar por agua (-8 HP)',
        description: 'Las olas y el frío. Konr llega magullado.',
        effect(node) {
          G.hp = Math.max(1, (G.hp || G.maxHp || 70) - 8);
          markNodeCompleted(node.id);
          if (typeof saveRun === 'function') saveRun();
          if (typeof openMap === 'function') openMap();
        }
      },
      {
        label: 'Cruzar por aire (-40 oro)',
        description: 'Konr no toca el mar. Pero la bolsa pesa menos.',
        effect(node) {
          if ((G.gold || 0) < 40) {
            alert('No tenés suficiente oro. Conseguí más o usá la barca.');
            return;
          }
          G.gold -= 40;
          markNodeCompleted(node.id);
          if (typeof saveRun === 'function') saveRun();
          if (typeof openMap === 'function') openMap();
        }
      },
      {
        label: 'No cruzar — volver',
        description: 'No es momento. Otra ruta queda abierta.',
        effect(node) {
          if (typeof openMap === 'function') openMap();
        }
      }
    ]
  },

  hongos: {
    title: 'Hongos del Sueño',
    description:
      'En Pilzstadt, un viejo te ofrece hongos rojos en un cuenco de madera. ' +
      '"Una porción cura. Dos abren los ojos. Tres... no las recomiendo." ' +
      'Sus dientes son negros.',
    options: [
      {
        label: 'Una porción',
        description: 'Curar HP de forma segura.',
        effect(node) {
          const heal = Math.max(20, Math.floor((G.maxHp || 70) * 0.4));
          G.hp = Math.min(G.maxHp || 70, (G.hp || G.maxHp || 70) + heal);
          markNodeCompleted(node.id);
          if (typeof saveRun === 'function') saveRun();
          if (typeof openMap === 'function') openMap();
        }
      },
      {
        label: 'Dos porciones',
        description: 'Curar mucho más, pero te dejan una Memoria.',
        effect(node) {
          const heal = Math.max(35, Math.floor((G.maxHp || 70) * 0.7));
          G.hp = Math.min(G.maxHp || 70, (G.hp || G.maxHp || 70) + heal);
          G.deck.push('memoria');
          markNodeCompleted(node.id);
          if (typeof saveRun === 'function') saveRun();
          if (typeof openMap === 'function') openMap();
        }
      },
      {
        label: 'Rechazar',
        description: 'No es momento de aventuras químicas.',
        effect(node) {
          markNodeCompleted(node.id);
          if (typeof saveRun === 'function') saveRun();
          if (typeof openMap === 'function') openMap();
        }
      }
    ]
  },

};

let _eventCurrentNode = null;

function openEventScreen(node) {
  const ev = EVENTS[node.eventId];
  if (!ev) {
    console.warn(`Evento "${node.eventId}" no existe — completando nodo`);
    markNodeCompleted(node.id);
    if (typeof openMap === 'function') openMap();
    return;
  }
  _eventCurrentNode = node;

  document.getElementById('event-title').textContent = ev.title;
  document.getElementById('event-description').textContent = ev.description;

  const optsEl = document.getElementById('event-options');
  optsEl.innerHTML = '';
  ev.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'event-option';
    btn.innerHTML = `
      <div class="event-option-label">${opt.label}</div>
      <div class="event-option-desc">${opt.description}</div>
    `;
    btn.addEventListener('click', () => {
      try { opt.effect(node); }
      catch (e) { console.error('Event effect crashed:', e); }
    });
    optsEl.appendChild(btn);
  });

  showScreen('screen-event');
}
