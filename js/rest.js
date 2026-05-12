/* =====================================================
 *  KONR — Pantalla de descanso (rest nodes)
 *  Cura HP. Pendiente: opción de eliminar/upgradear carta.
 * ===================================================== */

let _restCurrentNode = null;

function openRestScreen(node) {
  _restCurrentNode = node;
  document.getElementById('rest-title').textContent = node.name;
  document.getElementById('rest-flavor').textContent =
    node.description || 'Konr se sienta junto al fuego.';

  // Calcula la cantidad de cura (30% del HP máximo, mínimo 15)
  const heal = Math.max(15, Math.floor((G.maxHp || 70) * 0.3));
  const currentHp = G.hp ?? G.maxHp ?? 70;
  const newHp = Math.min(G.maxHp || 70, currentHp + heal);
  const realHeal = newHp - currentHp;

  const desc = realHeal > 0
    ? `Curar ${realHeal} HP (${currentHp} → ${newHp})`
    : 'Estás al máximo de vida — nada que curar';

  document.getElementById('rest-heal-desc').textContent = desc;
  const healBtn = document.getElementById('rest-heal');
  healBtn.disabled = realHeal === 0;
  healBtn.style.opacity = realHeal === 0 ? '0.4' : '1';
  healBtn.style.cursor = realHeal === 0 ? 'not-allowed' : 'pointer';

  showScreen('screen-rest');
}

function restHeal() {
  if (!_restCurrentNode) return;
  const heal = Math.max(15, Math.floor((G.maxHp || 70) * 0.3));
  const before = G.hp ?? G.maxHp ?? 70;
  G.hp = Math.min(G.maxHp || 70, before + heal);
  // Marcar nodo y volver al mapa
  markNodeCompleted(_restCurrentNode.id);
  _restCurrentNode = null;
  if (typeof openMap === 'function') openMap();
}

function restSkip() {
  if (!_restCurrentNode) return;
  // No marcar como completado: el jugador puede volver a usarlo después
  _restCurrentNode = null;
  if (typeof openMap === 'function') openMap();
}
