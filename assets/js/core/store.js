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
 *     adult: boolean                                             // ha confirmado ser mayor de 18 años (muestra el contenido para adultos)
 *     refPose, refCostume: boolean                               // añadirá una imagen de referencia de pose / vestuario
 *   }
 */
import { loadJSON, saveJSON } from './storage.js';
import { FORMATS as FORMAT_LIST } from './formats/index.js';
import { conflictsOf } from './conflicts.js';
import { clearFamily } from './families.js';
import { enforce, reasonBlocked } from './exclusions.js';

const KEY = 'lv:v1:workspace';
const FORMATS = FORMAT_LIST.map(f => f.id);
export const CUSTOM_MAX = 800;

const fresh = () => ({ v: 1, sel: {}, locks: {}, detail: 'rich', boost: true, aspect: '', format: 'text', custom: '', adult: false, refPose: false, refCostume: false });

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
    adult: raw.adult === true,
    refPose: raw.refPose === true,
    refCostume: raw.refCostume === true,
    sel: enforce(sanitizeSel(raw.sel), { adult: raw.adult === true }).sel,
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
  const safe = enforce(next.sel, { adult: next.adult === true });
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
   * Cambia (o quita) una opción respetando el modo de la sección (single / multi), los conflictos del
   * dominio y las familias de secciones (data/families.js).
   * @param {object} [domain]  dominio cargado; si se pasa, se aplican sus `conflicts` y sus títulos
   * @returns {{domain: string, section: string, label: string|null, kind: 'family'|'conflict', title: string|null}[]}
   *          secciones que se vaciaron, para avisar al usuario
   */
  toggleOption(domainId, section, optionId, domain) {
    const cur = state.sel[domainId]?.[section.id] || [];
    const adding = !cur.includes(optionId);
    if (adding && reasonBlocked(state.sel, domainId, section.id, optionId, { adult: state.adult })) return []; // bloqueada: la interfaz ya la deshabilita
    const next = !adding
      ? cur.filter(x => x !== optionId)
      : section.mode === 'single' ? [optionId] : [...cur, optionId];

    // Lo que deja de tener sentido al añadir: secciones en conflicto y hermanas de la misma familia.
    const clashes = adding ? conflictsOf(domain, section.id).filter(id => state.sel[domainId]?.[id]?.length) : [];
    const fam = adding ? clearFamily(state.sel, domainId, section.id) : { sel: state.sel, removed: [] };
    const cleared = [
      ...fam.removed.map(x => ({ ...x, kind: 'family' })),
      ...clashes.map(id => ({ domain: domainId, section: id, label: null, kind: 'conflict' })),
    ].filter((x, i, all) => all.findIndex(y => y.domain === x.domain && y.section === x.section) === i);

    const sel = { ...fam.sel };
    const dom = { ...(sel[domainId] || {}) };
    if (next.length) dom[section.id] = next; else delete dom[section.id];
    clashes.forEach(id => delete dom[id]);
    if (Object.keys(dom).length) sel[domainId] = dom; else delete sel[domainId];
    commit({ ...state, sel });

    // El título solo se conoce para las secciones del generador abierto; el resto, por el nombre del generador.
    return cleared.map(x => ({
      ...x,
      title: x.domain === domainId ? (domain?._secById?.get(x.section)?.title || null) : null,
    }));
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
  clearAll() { commit({ ...fresh(), detail: state.detail, boost: state.boost, aspect: state.aspect, format: state.format, locks: state.locks, adult: state.adult, refPose: state.refPose, refCostume: state.refCostume }); },

  /** Carga un prompt guardado: sustituye selección y ajustes del prompt, y conserva formato y bloqueos. */
  loadSnapshot(snap) {
    const n = normalize({ v: 1, ...snap, format: state.format, locks: state.locks, adult: state.adult });
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
    if ('adult' in partial) next.adult = partial.adult === true;
    if ('refPose' in partial) next.refPose = !!partial.refPose;
    if ('refCostume' in partial) next.refCostume = !!partial.refCostume;
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
