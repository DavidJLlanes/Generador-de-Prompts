/**
 * ESTADO GLOBAL del espacio de trabajo («Mi prompt»).
 * Es la única fuente de verdad de lo que el usuario ha elegido y se comparte entre páginas
 * mediante localStorage, de modo que se puede ir de «Mujer» a «Escenarios» y a «Clima»
 * construyendo un único prompt cruzado.
 *
 *   state = {
 *     v: 1,
 *     sel:   { [domainId]: { [sectionId]: [optionId, ...] } },   // selección (el orden se conserva)
 *     locks: { [domainId]: { [sectionId]: true } },              // secciones fijadas ante «Aleatorio»
 *     detail: 'rich' | 'short',                                  // nivel de detalle del prompt
 *     boost: boolean,                                            // añadir acabado de máxima calidad
 *     aspect: string,                                            // id de proporción ('' = sin definir)
 *     format: 'text' | 'natural' | 'sd' | 'ideogram' | 'midjourney'   // formato de salida activo
 *     custom: string                                             // texto libre del usuario (máx. 800)
 *   }
 */
import { loadJSON, saveJSON } from './storage.js';
import { FORMATS as FORMAT_LIST } from './formats/index.js';
import { conflictsOf } from './conflicts.js';
import { enforce, reasonBlocked } from './exclusions.js';

const KEY = 'lv:v1:workspace';
const FORMATS = FORMAT_LIST.map(f => f.id);
export const CUSTOM_MAX = 800;

const fresh = () => ({ v: 1, sel: {}, locks: {}, detail: 'rich', boost: true, aspect: '', format: 'text', custom: '' });

export function sanitizeSel(sel) {
  const out = {};
  if (!sel || typeof sel !== 'object') return out;
  for (const [d, secs] of Object.entries(sel)) {
    if (!secs || typeof secs !== 'object') continue;
    for (const [s, ids] of Object.entries(secs)) {
      if (!Array.isArray(ids)) continue;
      const clean = ids.filter(x => typeof x === 'string');
      if (clean.length) (out[d] ||= {})[s] = clean;
    }
  }
  return out;
}

function normalize(raw) {
  const base = fresh();
  if (!raw || raw.v !== 1) return base;
  return {
    ...base,
    sel: enforce(sanitizeSel(raw.sel)).sel,
    locks: raw.locks && typeof raw.locks === 'object' ? raw.locks : {},
    detail: raw.detail === 'short' ? 'short' : 'rich',
    boost: raw.boost !== false,
    aspect: typeof raw.aspect === 'string' ? raw.aspect : '',
    format: FORMATS.includes(raw.format) ? raw.format : 'text',
    custom: typeof raw.custom === 'string' ? raw.custom.slice(0, CUSTOM_MAX) : '',
  };
}

let state = normalize(loadJSON(KEY));
const subs = new Set();
let queued = false;

function commit(next) {
  // Última barrera: ninguna vía (enlace, aleatorio, guardado, receta) puede dejar un par incompatible.
  const safe = enforce(next.sel);
  state = safe.removed.length ? { ...next, sel: safe.sel } : next;
  saveJSON(KEY, state);
  if (queued) return;
  queued = true;
  queueMicrotask(() => { queued = false; subs.forEach(fn => fn(state)); });
}

export const store = {
  get: () => state,

  /** Suscribe un callback que recibe el estado; devuelve la función para darse de baja. */
  subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },

  /**
   * Cambia (o quita) una opción respetando el modo de la sección (single / multi) y los conflictos del
   * dominio. Devuelve los ids de las secciones que se vaciaron por ser incompatibles (para avisar al usuario).
   * @param {object} [domain]  dominio cargado; si se pasa, se aplican sus `conflicts`
   * @returns {string[]}
   */
  toggleOption(domainId, section, optionId, domain) {
    const cur = state.sel[domainId]?.[section.id] || [];
    const adding = !cur.includes(optionId);
    if (adding && reasonBlocked(state.sel, domainId, section.id, optionId)) return []; // bloqueada: la interfaz ya la deshabilita
    const next = !adding
      ? cur.filter(x => x !== optionId)
      : section.mode === 'single' ? [optionId] : [...cur, optionId];
    const cleared = adding ? conflictsOf(domain, section.id).filter(id => state.sel[domainId]?.[id]?.length) : [];
    const sel = { ...state.sel };
    const dom = { ...(sel[domainId] || {}) };
    if (next.length) dom[section.id] = next; else delete dom[section.id];
    cleared.forEach(id => delete dom[id]);
    if (Object.keys(dom).length) sel[domainId] = dom; else delete sel[domainId];
    commit({ ...state, sel });
    return cleared;
  },

  removeOption(domainId, sectionId, optionId) {
    store.setSection(domainId, sectionId, (state.sel[domainId]?.[sectionId] || []).filter(x => x !== optionId));
  },

  /** Sustituye las opciones elegidas de una sección. */
  setSection(domainId, sectionId, ids) {
    const sel = { ...state.sel };
    const dom = { ...(sel[domainId] || {}) };
    if (ids.length) dom[sectionId] = ids; else delete dom[sectionId];
    if (Object.keys(dom).length) sel[domainId] = dom; else delete sel[domainId];
    commit({ ...state, sel });
  },

  clearDomain(domainId) {
    const sel = { ...state.sel };
    delete sel[domainId];
    commit({ ...state, sel });
  },

  /** Vacía selección y texto libre; conserva las preferencias (detalle, calidad, proporción, formato, bloqueos). */
  clearAll() { commit({ ...fresh(), detail: state.detail, boost: state.boost, aspect: state.aspect, format: state.format, locks: state.locks }); },

  /** Carga un prompt guardado: sustituye selección y ajustes del prompt, y conserva formato y bloqueos. */
  loadSnapshot(snap) {
    const n = normalize({ v: 1, ...snap, format: state.format, locks: state.locks });
    commit({ ...state, sel: n.sel, detail: n.detail, boost: n.boost, aspect: n.aspect, custom: n.custom });
  },

  /** Aplica una selección completa de un dominio (preset), sustituyendo la que hubiera de ese dominio. */
  applySelection(domainId, selection) {
    const sel = { ...state.sel };
    const clean = sanitizeSel({ [domainId]: selection })[domainId];
    if (clean) sel[domainId] = clean; else delete sel[domainId];
    commit({ ...state, sel });
  },

  /** Reemplaza TODA la selección (enlace compartido, aleatorio global). */
  replaceSelection(sel) { commit({ ...state, sel: sanitizeSel(sel) }); },

  set(partial) {
    const next = { ...state };
    if ('detail' in partial) next.detail = partial.detail === 'short' ? 'short' : 'rich';
    if ('boost' in partial) next.boost = !!partial.boost;
    if ('aspect' in partial) next.aspect = String(partial.aspect || '');
    if ('format' in partial && FORMATS.includes(partial.format)) next.format = partial.format;
    if ('custom' in partial) next.custom = String(partial.custom || '').slice(0, CUSTOM_MAX);
    commit(next);
  },

  toggleLock(domainId, sectionId) {
    const locks = { ...state.locks };
    const dom = { ...(locks[domainId] || {}) };
    if (dom[sectionId]) delete dom[sectionId]; else dom[sectionId] = true;
    if (Object.keys(dom).length) locks[domainId] = dom; else delete locks[domainId];
    commit({ ...state, locks });
  },

  isLocked: (domainId, sectionId) => !!state.locks[domainId]?.[sectionId],
  isSelected: (domainId, sectionId, optionId) => !!state.sel[domainId]?.[sectionId]?.includes(optionId),
  selectedIds: (domainId, sectionId) => state.sel[domainId]?.[sectionId] || [],

  countSelected(domainId) {
    const doms = domainId ? [state.sel[domainId] || {}] : Object.values(state.sel);
    return doms.reduce((n, secs) => n + Object.values(secs).reduce((m, ids) => m + ids.length, 0), 0);
  },
  /** Opciones elegidas + 1 si hay texto libre: lo que cuenta el botón «Mi prompt». */
  totalItems: () => store.countSelected() + (state.custom.trim() ? 1 : 0),
  countInSection: (domainId, sectionId) => (state.sel[domainId]?.[sectionId] || []).length,
  selectedDomainIds: () => Object.keys(state.sel),
};
