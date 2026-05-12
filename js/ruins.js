/* =====================================================
 *  KONR — Ruinas (encontrar reliquias)
 *
 *  Cuando el jugador entra a un nodo type='ruins', se
 *  muestran 2 reliquias al azar (de las que NO posee).
 *  Elige una, la otra desaparece. O puede irse sin nada.
 *  Una vez visitado, el nodo queda completado.
 * ===================================================== */

let _ruinsCurrentNode = null;

function openRuinsScreen(node) {
  _ruinsCurrentNode = node;

  // Elegir 2 reliquias al azar de las que el jugador NO tenga
  const owned = new Set(G.relics || []);
  const available = Object.keys(RELICS).filter(id => !owned.has(id));
  const offers = (typeof shuffle === 'function')
    ? shuffle([...available]).slice(0, 2)
    : available.slice(0, 2);

  document.getElementById('ruins-title').textContent = node.name;
  document.getElementById('ruins-flavor').textContent =
    node.description || 'Polvo y silencio. Algo brilla entre las piedras.';

  const list = document.getElementById('ruins-options');
  list.innerHTML = '';

  if (offers.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'ruins-empty';
    empty.textContent = 'Las ruinas están vacías. Ya descubriste todo lo que escondían.';
    list.appendChild(empty);
  } else {
    offers.forEach(id => {
      const r = RELICS[id];
      if (!r) return;
      const card = document.createElement('button');
      card.className = 'ruins-relic-pick';
      card.innerHTML = `
        <div class="ruins-relic-icon">${r.art}</div>
        <div class="ruins-relic-name">${r.name}</div>
        <div class="ruins-relic-desc">${r.description}</div>
        <div class="ruins-relic-rarity">${r.rarity}</div>
      `;
      card.addEventListener('click', () => ruinsPick(id));
      list.appendChild(card);
    });
  }

  showScreen('screen-ruins');
}

function ruinsPick(relicId) {
  if (relicId && typeof addRelic === 'function') {
    addRelic(relicId);
  }
  if (_ruinsCurrentNode && typeof markNodeCompleted === 'function') {
    markNodeCompleted(_ruinsCurrentNode.id);
  }
  _ruinsCurrentNode = null;
  if (typeof openMap === 'function') openMap();
}

function ruinsSkip() {
  if (_ruinsCurrentNode && typeof markNodeCompleted === 'function') {
    markNodeCompleted(_ruinsCurrentNode.id);
  }
  _ruinsCurrentNode = null;
  if (typeof openMap === 'function') openMap();
}
