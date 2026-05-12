/* =====================================================
 *  KONR — Estado global del juego y constantes de mazo
 * ===================================================== */

// Estado del run actual.
const G = {
  hp: 70, maxHp: 70,
  ithyr: 3, maxIthyr: 3,
  block: 0, strength: 0,
  scars: 0,
  memories: 0,
  gold: 0,
  relics: [],
  deck: [], hand: [], discard: [],
  enemy: null,
  turn: 0,
  combatOver: false,
  won: false,
  runIdx: 0,
};

const ALL_PLAYABLE_CARDS = [
  'strike', 'strike2', 'defend', 'defend2', 'bragi', 'njord', 'culpa',
  'memoria', 'porElla', 'ljuga', 'promesaRota', 'lectura', 'trance',
  'reserva', 'herida', 'agotamiento', 'duda'
];

const CARD_MAX = { herida: 6, agotamiento: 4, duda: 4 };
const DEFAULT_MAX = 8;

const REWARD_POOL = ['njord', 'culpa', 'promesaRota', 'ljuga', 'porElla', 'bragi', 'reserva', 'reserva', 'lectura'];

const RUN_SEQUENCE = ['oso', 'valdra'];

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildStarterDeck() {
  return shuffle([
    'strike', 'strike', 'strike', 'strike', 'strike', 'strike', 'strike', 'strike',
    'defend', 'defend', 'defend', 'defend', 'defend', 'defend',
    'bragi', 'bragi',
    'memoria', 'memoria', 'memoria',
    'culpa', 'culpa',
    'lectura', 'lectura',
    'ljuga',
    'promesaRota',
    'strike2', 'strike2', 'strike2',
    'defend2', 'defend2',
    'njord',
    'porElla',
    'herida', 'herida', 'herida',
    'agotamiento', 'agotamiento',
    'duda', 'duda',
    'trance',
    'reserva', 'reserva',
  ]);
}
