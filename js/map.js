/* =====================================================
 *  KONR — Mapa de Fornheim
 *
 *  Define los nodos del mundo y la lógica de viaje.
 *  Cada nodo:
 *    id, name, x, y (% sobre el mapa)
 *    type: start | combat | elite | rest | event | boss
 *    enemyId (combat/elite/boss) o eventId (event)
 *    neighbors[]
 *    description (tooltip)
 *
 *  Reglas:
 *    - Start siempre disponible
 *    - Un nodo es reachable si CUALQUIER vecino está completado
 *    - Completados pueden revisitarse (gris)
 *    - Boss completado = run terminado
 * ===================================================== */

const MAP_NODES = [
  /* ─── Punto de partida ────────────────────────── */
  {
    id: 'duneborg',
    name: 'Duneborg',
    x: 13, y: 9,
    type: 'start',
    description: 'La capital de Konr. Punto de partida del peregrinaje.',
    neighbors: ['kuthul']
  },

  /* ─── Camino principal hacia el sur ────────────── */
  {
    id: 'kuthul',
    name: 'Paso de Kuthul',
    x: 31, y: 23,
    type: 'combat',
    enemyId: 'bandidos',
    description: 'Cruzar las montañas. Los bandidos esperan en los pasos.',
    neighbors: ['duneborg', 'mjolby', 'fir_coille', 'mercader']
  },
  {
    id: 'mjolby',
    name: 'Mjölby',
    x: 41, y: 11,
    type: 'rest',
    description: 'Aldea pacífica. Curar las heridas, descansar.',
    neighbors: ['kuthul', 'pilzstadt', 'svellheim', 'mercader']
  },
  {
    id: 'pilzstadt',
    name: 'Pilzstadt',
    x: 51, y: 11,
    type: 'event',
    eventId: 'hongos',
    description: 'La ciudad de los hongos. La gente come cosas raras acá.',
    neighbors: ['mjolby', 'cruce_norte']
  },
  {
    id: 'strondheim',
    name: 'Strondheim',
    x: 87, y: 9,
    type: 'elite',
    enemyId: 'ninoSinNombre',
    description: 'Las ruinas en la isla del norte. Algo no se quedó muerto.',
    neighbors: ['cruce_norte']
  },
  /* ─── Mercader Errante (tienda) ──────────────── */
  {
    id: 'mercader',
    name: 'Mercader Errante',
    x: 35, y: 27,
    type: 'shop',
    description: 'Una hoguera en el camino. La Orden del Tabernero Errante recibe a Konr con vino y oro.',
    neighbors: ['mjolby', 'kuthul', 'fir_coille']
  },
  /* ─── Cruce de océano (gate a Strondheim) ────── */
  {
    id: 'cruce_norte',
    name: 'Travesía Marina',
    x: 70, y: 9,
    type: 'crossing',
    eventId: 'cruce_marino',
    description: 'El mar entre la costa y la isla. Konr puede cruzar por agua o por aire.',
    neighbors: ['pilzstadt', 'strondheim']
  },
  /* ─── Ruinas olvidadas (reliquia gratis) ────── */
  {
    id: 'ruinas_olvidadas',
    name: 'Ruinas Olvidadas',
    x: 13, y: 56,
    type: 'ruins',
    description: 'Piedras quebradas y runas borradas. Algo brilla entre el polvo.',
    neighbors: ['drekka_parbat', 'fir_coille']
  },
  {
    id: 'fir_coille',
    name: 'Fir-Coille',
    x: 28, y: 42,
    type: 'combat',
    enemyId: 'oso',
    description: 'Bosque antiguo. Algo enorme se mueve entre los árboles.',
    neighbors: ['kuthul', 'svellheim', 'myrkvidr', 'drekka_parbat', 'mercader', 'ruinas_olvidadas']
  },
  {
    id: 'drekka_parbat',
    name: 'Drekka Parbat',
    x: 6, y: 47,
    type: 'elite',
    enemyId: 'oso',
    description: 'Fortaleza al borde del acantilado. Un oso más viejo, más sabio.',
    neighbors: ['fir_coille', 'ruinas_olvidadas']
  },
  {
    id: 'svellheim',
    name: 'Svellheim',
    x: 49, y: 24,
    type: 'combat',
    enemyId: 'ninoSinNombre',
    description: 'Bastión nevado. Algo te observa desde la nieve, pequeño y paciente.',
    neighbors: ['mjolby', 'fir_coille', 'khatun']
  },
  {
    id: 'khatun',
    name: 'Khatun',
    x: 47, y: 33,
    type: 'combat',
    enemyId: 'enjambre',
    description: 'Pico solitario. Un enjambre cubre la senda — Konr pasó cerca de algo que no debía.',
    neighbors: ['svellheim', 'myrkvidr']
  },
  {
    id: 'myrkvidr',
    name: 'Myrkviðr',
    x: 38, y: 40,
    type: 'combat',
    enemyId: 'bandidos',
    description: 'El Bosque Oscuro. Bandidos asaltan a viajeros agotados.',
    neighbors: ['fir_coille', 'khatun', 'cazador_senda', 'vatnaborg']
  },
  {
    id: 'cazador_senda',
    name: 'Senda del Cazador',
    x: 45, y: 47,
    type: 'event',
    eventId: 'carruaje',
    description: 'Un sendero lateral en el bosque. Algo pide ayuda.',
    neighbors: ['myrkvidr', 'vatnaborg']
  },

  /* ─── Boss ─────────────────────────────────────── */
  {
    id: 'vatnaborg',
    name: 'Vatnaborg',
    x: 51, y: 49,
    type: 'boss',
    enemyId: 'valdra',
    description: 'Las ruinas. El final del camino. Donde todo empezó.',
    neighbors: ['myrkvidr', 'cazador_senda']
  }
];

/* ─── Estado del mapa ────────────────────────────────── */

const SAVE_KEY = 'konr_run_save_v1';

function initMapState() {
  if (!G.map) G.map = {};
  G.map.completed = G.map.completed || new Set();
  G.map.current = G.map.current || null;
}

function resetMapState() {
  G.map = {
    completed: new Set(),
    current: null
  };
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
}

/* ─── Persistencia ───────────────────────────────────── */

function saveRun() {
  try {
    initMapState();
    const data = {
      completed: [...G.map.completed],
      current: G.map.current,
      hp: G.hp,
      maxHp: G.maxHp,
      scars: G.scars,
      gold: G.gold || 0,
      relics: [...(G.relics || [])],
      customDeck: G.customDeck || null,
      runDeck: [...(G.deck || []), ...(G.discard || []), ...(G.hand || [])]
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('No se pudo guardar el run:', e.message);
  }
}

function loadRun() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.completed)) return false;
    G.map = {
      completed: new Set(data.completed),
      current: data.current || null
    };
    if (typeof data.hp === 'number') G.hp = data.hp;
    if (typeof data.maxHp === 'number') G.maxHp = data.maxHp;
    if (typeof data.scars === 'number') G.scars = data.scars;
    if (typeof data.gold === 'number') G.gold = data.gold;
    if (Array.isArray(data.relics)) G.relics = data.relics;
    if (data.customDeck) G.customDeck = data.customDeck;
    if (Array.isArray(data.runDeck) && data.runDeck.length > 0) {
      G.deck = data.runDeck;
      G.discard = [];
      G.hand = [];
    }
    return true;
  } catch (e) {
    console.warn('No se pudo cargar el run:', e.message);
    return false;
  }
}

function hasSavedRun() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    return data && Array.isArray(data.completed) && data.completed.length > 0;
  } catch (e) { return false; }
}

/* ─── Reachability ───────────────────────────────────── */

function findNode(id) {
  return MAP_NODES.find(n => n.id === id);
}

// Mínimo de pisos requeridos para acceder al boss del run.
// Un "piso" = cualquier nodo completado que no sea start ni boss.
const MIN_PISOS_FOR_BOSS = 7;

function countPisosCompleted() {
  initMapState();
  return [...G.map.completed].filter(id => {
    const n = findNode(id);
    return n && n.type !== 'start' && n.type !== 'boss';
  }).length;
}

function isReachable(node) {
  initMapState();
  if (node.type === 'start' && !G.map.completed.has(node.id)) return true;
  if (G.map.completed.has(node.id)) return true;

  // Reachability básica: algún vecino completado
  const neighborOk = node.neighbors.some(nid => G.map.completed.has(nid));
  if (!neighborOk) return false;

  // Gate del boss: necesita un mínimo de pisos antes de aparecer alcanzable
  if (node.type === 'boss') {
    const pisosDone = countPisosCompleted();
    if (pisosDone < MIN_PISOS_FOR_BOSS) return false;
  }

  return true;
}

function getNodeState(node) {
  initMapState();
  if (G.map.completed.has(node.id)) return 'completed';
  if (G.map.current === node.id) return 'current';
  if (isReachable(node)) return 'available';
  return 'locked';
}

function markNodeCompleted(nodeId) {
  initMapState();
  G.map.completed.add(nodeId);
  G.map.current = nodeId;
  saveRun();
}

/* ─── Conexiones SVG ─────────────────────────────────── */

function getConnections() {
  const seen = new Set();
  const pairs = [];
  MAP_NODES.forEach(node => {
    node.neighbors.forEach(nid => {
      const key = [node.id, nid].sort().join(':');
      if (seen.has(key)) return;
      seen.add(key);
      const target = findNode(nid);
      if (!target) return;
      pairs.push([node, target]);
    });
  });
  return pairs;
}

function renderConnections() {
  // Las rutas se dibujan dentro del SVG estilizado, en el <g id="map-routes">
  const routesG = document.getElementById('map-routes');
  if (!routesG) return;
  routesG.innerHTML = '';
  initMapState();
  const NS = 'http://www.w3.org/2000/svg';
  getConnections().forEach(([a, b]) => {
    const line = document.createElementNS(NS, 'line');
    line.setAttribute('x1', a.x);
    line.setAttribute('y1', a.y);
    line.setAttribute('x2', b.x);
    line.setAttribute('y2', b.y);
    let cls = 'map-line';
    const aDone = G.map.completed.has(a.id);
    const bDone = G.map.completed.has(b.id);
    if (aDone && bDone) cls += ' walked';
    else if (aDone || bDone) cls += ' open';
    else cls += ' locked';
    line.setAttribute('class', cls);
    routesG.appendChild(line);
  });
}

// Mapeo type → emoji para íconos de nodos (placeholder hasta tener SVG dibujado)
const NODE_ICONS = {
  start: '🏰',
  combat: '⚔',
  elite: '☠',
  rest: '🔥',
  event: '📜',
  boss: '👑',
  shop: '🪙',
  crossing: '⛵',
  ruins: '🏛'
};

/* ─── Apertura y render del mapa ─────────────────────── */

function openMap() {
  initMapState();
  if (G.map.completed.size === 0) {
    G.map.completed.add('duneborg');
    G.map.current = 'duneborg';
    saveRun();
  }
  renderMap();
  showScreen('screen-map');
}

function renderMap() {
  initMapState();
  // Dibujar las rutas primero (van debajo de los nodos)
  renderConnections();

  const nodesG = document.getElementById('map-nodes-svg');
  if (!nodesG) return;
  nodesG.innerHTML = '';

  const NS = 'http://www.w3.org/2000/svg';

  MAP_NODES.forEach(node => {
    const state = getNodeState(node);
    const icon = NODE_ICONS[node.type] || '·';

    // Tooltip enriquecido para el boss
    let tooltip = node.description;
    if (node.type === 'boss') {
      const done = countPisosCompleted();
      tooltip = done >= MIN_PISOS_FOR_BOSS
        ? `${node.description} — Listo (${done} pisos)`
        : `${node.description}\n\n⚠ Necesitás ${MIN_PISOS_FOR_BOSS} pisos (${done}/${MIN_PISOS_FOR_BOSS}).`;
    }

    // Grupo del nodo: contiene la base circular, el ícono y la etiqueta
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', `svg-node svg-node-${node.type} svg-node-${state}`);
    g.setAttribute('transform', `translate(${node.x}, ${node.y})`);
    g.dataset.nodeId = node.id;

    // Tooltip nativo
    const title = document.createElementNS(NS, 'title');
    title.textContent = tooltip;
    g.appendChild(title);

    // Base circular del nodo (hit area + estilo)
    const baseR = node.type === 'boss' ? 4 : 3;
    const circle = document.createElementNS(NS, 'circle');
    circle.setAttribute('cx', 0);
    circle.setAttribute('cy', 0);
    circle.setAttribute('r', baseR);
    circle.setAttribute('class', 'svg-node-base');
    g.appendChild(circle);

    // Ícono (texto emoji centrado)
    const txt = document.createElementNS(NS, 'text');
    txt.setAttribute('x', 0);
    txt.setAttribute('y', 0);
    txt.setAttribute('text-anchor', 'middle');
    txt.setAttribute('dominant-baseline', 'central');
    txt.setAttribute('class', 'svg-node-icon');
    txt.setAttribute('font-size', node.type === 'boss' ? '4.5' : '3.5');
    txt.textContent = icon;
    g.appendChild(txt);

    // Etiqueta debajo
    const label = document.createElementNS(NS, 'text');
    label.setAttribute('x', 0);
    label.setAttribute('y', baseR + 2.5);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('class', 'svg-node-label');
    label.setAttribute('font-size', '1.8');
    label.textContent = node.name;
    g.appendChild(label);

    // Click handler para nodos accesibles
    if (state === 'available' || state === 'current' || state === 'completed') {
      g.style.cursor = 'pointer';
      g.addEventListener('click', () => travelTo(node.id));
    }

    nodesG.appendChild(g);
  });

  updateMapHUD();
}

function updateMapHUD() {
  initMapState();
  const hpEl = document.getElementById('map-hp');
  const scarsEl = document.getElementById('map-scars');
  const progressEl = document.getElementById('map-progress');
  if (hpEl) hpEl.textContent = `${G.hp ?? G.maxHp ?? 70} / ${G.maxHp ?? 70}`;
  if (scarsEl) scarsEl.textContent = G.scars ?? 0;
  const goldEl = document.getElementById('map-gold');
  if (goldEl) goldEl.textContent = `🪙 ${G.gold ?? 0}`;
  if (typeof renderRelicsHUD === 'function') renderRelicsHUD();
  const total = MAP_NODES.filter(n => n.type !== 'start' && n.type !== 'event' && n.type !== 'shop').length;
  const done = [...G.map.completed].filter(id => {
    const n = findNode(id);
    return n && n.type !== 'start' && n.type !== 'event' && n.type !== 'shop';
  }).length;
  if (progressEl) progressEl.textContent = `${done} / ${total}`;
}

/* ─── Viajar a un nodo ───────────────────────────────── */

function travelTo(nodeId) {
  const node = findNode(nodeId);
  if (!node) return;
  if (!isReachable(node)) return;

  G.map.current = nodeId;

  switch (node.type) {
    case 'start':
      markNodeCompleted(nodeId);
      renderMap();
      break;

    case 'combat':
    case 'elite':
    case 'boss':
      startCombatAtNode(node);
      break;

    case 'rest':
      handleRestNode(node);
      break;

    case 'event':
      handleEventNode(node);
      break;

    case 'crossing':
      handleCrossingNode(node);
      break;

    case 'ruins':
      handleRuinsNode(node);
      break;

    case 'shop':
      handleShopNode(node);
      break;
  }
}

function startCombatAtNode(node) {
  G.currentNodeEnemy = node.enemyId;
  G.currentNodeId = node.id;
  startGame(true);
}

function handleRestNode(node) {
  if (typeof openRestScreen === 'function') {
    openRestScreen(node);
  } else {
    const heal = Math.max(15, Math.floor((G.maxHp || 70) * 0.3));
    G.hp = Math.min(G.maxHp || 70, (G.hp || G.maxHp || 70) + heal);
    markNodeCompleted(node.id);
    saveRun();
    renderMap();
  }
}

function handleShopNode(node) {
  if (typeof openShopScreen === 'function') {
    openShopScreen(node);
  } else {
    alert('Mercader no disponible (shop.js no cargado).');
    markNodeCompleted(node.id);
    if (typeof openMap === 'function') openMap();
  }
}

function handleCrossingNode(node) {
  // Reusa el sistema de eventos: cada crossing tiene un eventId
  if (typeof openEventScreen === 'function') {
    openEventScreen(node);
  } else {
    alert('Cruce no disponible (events.js no cargado).');
    markNodeCompleted(node.id);
    if (typeof openMap === 'function') openMap();
  }
}

function handleRuinsNode(node) {
  if (typeof openRuinsScreen === 'function') {
    openRuinsScreen(node);
  } else {
    alert('Ruinas no disponibles (ruins.js no cargado).');
    markNodeCompleted(node.id);
    if (typeof openMap === 'function') openMap();
  }
}

function handleEventNode(node) {
  if (typeof openEventScreen === 'function') {
    openEventScreen(node);
  } else {
    // Fallback si events.js no está cargado
    alert(`Evento en ${node.name}: ${node.description}\n(Pendiente de implementar)`);
    markNodeCompleted(node.id);
    if (typeof openMap === 'function') openMap();
  }
}
