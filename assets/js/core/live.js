/**
 * PROMPT EN VIVO — servicio compartido: escucha el store, carga bajo demanda los dominios que
 * hagan falta y publica el prompt compuesto. Lo consumen el dock, el panel y el constructor.
 */
import { store } from './store.js';
import { loadDomains } from './registry.js';
import { compose } from './composer.js';

const listeners = new Set();
const domains = {};
let seq = 0;
let current = { state: store.get(), composed: compose({}, store.get()), domains };

async function refresh(state) {
  const mine = ++seq;
  const ids = Object.keys(state.sel);
  if (ids.length) ids.push('photo'); // el acabado de calidad vive en «photo»
  const missing = [...new Set(ids)].filter(id => !domains[id]);
  if (missing.length) {
    try { Object.assign(domains, await loadDomains(missing)); } catch (err) { console.error('[live] no se pudo cargar un dominio', err); }
  }
  if (mine !== seq) return; // llegó un estado más reciente mientras se cargaba
  current = { state, composed: compose(domains, state), domains };
  listeners.forEach(fn => fn(current));
}

store.subscribe(refresh);
refresh(store.get());

export const live = {
  /** Registra un oyente; lo llama ya con el valor actual. Devuelve la función para darse de baja. */
  subscribe(fn) { listeners.add(fn); fn(current); return () => listeners.delete(fn); },
  get: () => current,
};
