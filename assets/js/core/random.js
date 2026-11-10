/**
 * ALEATORIO — elige opciones al azar respetando secciones bloqueadas y la probabilidad
 * `chance` de cada sección (por defecto 0,6; ponla a 0 para excluir una sección del azar).
 */
const DEFAULT_CHANCE = 0.6;

/** Máximo de secciones que rellena «Aleatorio» por dominio según su ranura: mantiene el prompt coherente. */
export const SLOT_CAPS = { subject: 9, attribute: 3, action: 1, setting: 4, atmosphere: 3, technical: 5 };

function pick(arr, rng) { return arr[Math.floor(rng() * arr.length)]; }

/**
 * @param {object[]} domains  dominios cargados cuya selección se va a regenerar
 * @param {object} state      estado actual (para respetar bloqueos y mantener lo bloqueado)
 * @param {number|((domain: object) => number)} [maxSections]  tope de secciones nuevas por dominio
 * @returns {Record<string, Record<string, string[]>>} selección nueva solo de esos dominios
 */
export function randomSelection(domains, state, rng = Math.random, maxSections = Infinity) {
  const out = {};
  for (const dom of domains) {
    const selection = {};
    for (const sec of dom.sections) {
      if (sec.polarity === 'negative') continue;
      if (state.locks[dom.id]?.[sec.id]) {
        const keep = state.sel[dom.id]?.[sec.id];
        if (keep && keep.length) selection[sec.id] = keep;
        continue;
      }
      const chance = typeof sec.chance === 'number' ? sec.chance : DEFAULT_CHANCE;
      if (rng() >= chance) continue;
      const n = sec.mode === 'multi' && rng() < 0.15 ? 2 : 1;
      const pool = sec.options.slice();
      const chosen = [];
      for (let i = 0; i < n && pool.length; i++) chosen.push(pool.splice(Math.floor(rng() * pool.length), 1)[0].id);
      if (chosen.length) selection[sec.id] = chosen;
    }
    const cap = typeof maxSections === 'function' ? maxSections(dom) : maxSections;
    const free = Object.keys(selection).filter(id => !state.locks[dom.id]?.[id]);
    while (free.length > cap) delete selection[free.splice(Math.floor(rng() * free.length), 1)[0]];
    if (Object.keys(selection).length) out[dom.id] = selection;
  }
  return out;
}

export { pick };
