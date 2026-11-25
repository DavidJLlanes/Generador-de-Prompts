/**
 * BIBLIOTECA — prompts guardados e historial de copias, en el navegador (localStorage), sin cuentas.
 * Un elemento guarda una «instantánea» del prompt: la selección y sus ajustes, no el texto resultante,
 * para que siga siendo válido si se amplían los datos. Se puede exportar e importar como JSON.
 *
 *   { v: 1, saved: [Item], history: [Item] }
 *   Item = { id, name, ts, snap: { sel, detail, boost, aspect, custom }, rating?: 0-5, model?: string }
 *   `rating` (estrellas) y `model` (dónde lo usaste) los pone el usuario en «Guardados»; no cuentan para detectar duplicados.
 */
import { loadJSON, saveJSON } from './storage.js';
import { sanitizeSel, CUSTOM_MAX } from './store.js';

const KEY = 'lv:v1:library';
export const LIMITS = { saved: 200, history: 30, name: 80, model: 40 };
export const MAX_RATING = 5;

const empty = () => ({ v: 1, saved: [], history: [] });

/** Instantánea limpia de un estado del store (lo único que se guarda). */
export function snapshotOf(state) {
  return {
    sel: sanitizeSel(state.sel),
    detail: state.detail === 'short' ? 'short' : 'rich',
    boost: state.boost !== false,
    aspect: typeof state.aspect === 'string' ? state.aspect : '',
    custom: typeof state.custom === 'string' ? state.custom.slice(0, CUSTOM_MAX) : '',
  };
}

const isEmptySnap = s => !Object.keys(s.sel).length && !s.custom.trim();
const signature = s => JSON.stringify([s.sel, s.detail, s.boost, s.aspect, s.custom]);
const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const cleanRating = v => (Number.isInteger(v) && v >= 0 && v <= MAX_RATING ? v : 0);

function cleanItem(raw) {
  if (!raw || typeof raw !== 'object' || !raw.snap || typeof raw.snap !== 'object') return null;
  const snap = snapshotOf(raw.snap);
  if (isEmptySnap(snap)) return null;
  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id.slice(0, 40) : newId(),
    name: String(raw.name || 'Sin nombre').trim().slice(0, LIMITS.name) || 'Sin nombre',
    ts: Number.isFinite(raw.ts) ? raw.ts : Date.now(),
    snap,
    rating: cleanRating(raw.rating),
    model: typeof raw.model === 'string' ? raw.model.trim().slice(0, LIMITS.model) : '',
  };
}

function normalize(raw) {
  if (!raw || typeof raw !== 'object') return empty();
  const saved = (Array.isArray(raw.saved) ? raw.saved : []).map(cleanItem).filter(Boolean).slice(0, LIMITS.saved);
  const history = (Array.isArray(raw.history) ? raw.history : []).map(cleanItem).filter(Boolean).slice(0, LIMITS.history);
  return { v: 1, saved, history };
}

export const loadLibrary = () => normalize(loadJSON(KEY));
const persist = lib => { saveJSON(KEY, lib); return lib; };

/** Guarda el prompt actual con un nombre. Devuelve el elemento, o null si no hay nada que guardar. */
export function saveItem(name, state) {
  const snap = snapshotOf(state);
  if (isEmptySnap(snap)) return null;
  const lib = loadLibrary();
  const item = { id: newId(), name: String(name || '').trim().slice(0, LIMITS.name) || 'Mi prompt', ts: Date.now(), snap };
  lib.saved = [item, ...lib.saved].slice(0, LIMITS.saved);
  persist(lib);
  return item;
}

/** Pone las estrellas (0 las quita) a un prompt guardado. */
export function rateItem(id, rating) {
  const lib = loadLibrary();
  const it = lib.saved.find(x => x.id === id);
  if (it) it.rating = cleanRating(rating);
  return persist(lib);
}

/** Anota en qué modelo o programa se usó un prompt guardado. */
export function setItemModel(id, model) {
  const lib = loadLibrary();
  const it = lib.saved.find(x => x.id === id);
  if (it) it.model = String(model || '').trim().slice(0, LIMITS.model);
  return persist(lib);
}

/**
 * Qué te funciona: de los prompts guardados con estrellas, las opciones que se repiten en los de 4-5 estrellas
 * y la media por modelo. Solo cuenta lo que el usuario ha valorado.
 * @returns {{rated: number, good: number, top: {domain: string, section: string, option: string, count: number}[], models: {model: string, avg: number, n: number}[]}}
 */
export function libraryInsights(saved) {
  const rated = saved.filter(i => i.rating > 0);
  const good = rated.filter(i => i.rating >= 4);
  const count = new Map();
  for (const it of good) for (const [d, secs] of Object.entries(it.snap.sel)) for (const [s, ids] of Object.entries(secs)) for (const o of ids) {
    const k = [d, s, o].join('\u0000');
    count.set(k, (count.get(k) || 0) + 1);
  }
  const top = [...count].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).slice(0, 8)
    .map(([k, n]) => { const [domain, section, option] = k.split('\u0000'); return { domain, section, option, count: n }; });
  const byModel = new Map();
  for (const it of rated) if (it.model) { const m = byModel.get(it.model) || { sum: 0, n: 0 }; m.sum += it.rating; m.n++; byModel.set(it.model, m); }
  const models = [...byModel].map(([model, m]) => ({ model, avg: m.sum / m.n, n: m.n })).sort((a, b) => b.avg - a.avg || b.n - a.n);
  return { rated: rated.length, good: good.length, top, models };
}

export function deleteItem(kind, id) {
  const lib = loadLibrary();
  lib[kind] = lib[kind].filter(x => x.id !== id);
  return persist(lib);
}

export function renameItem(id, name) {
  const lib = loadLibrary();
  const it = lib.saved.find(x => x.id === id);
  if (it) it.name = String(name || '').trim().slice(0, LIMITS.name) || it.name;
  return persist(lib);
}

/** Registra una copia en el historial (sin repetir la anterior idéntica). */
export function recordHistory(state) {
  const snap = snapshotOf(state);
  if (isEmptySnap(snap)) return;
  const lib = loadLibrary();
  if (lib.history[0] && signature(lib.history[0].snap) === signature(snap)) return;
  lib.history = [{ id: newId(), name: '', ts: Date.now(), snap }, ...lib.history].slice(0, LIMITS.history);
  persist(lib);
}

export function clearHistory() {
  const lib = loadLibrary();
  lib.history = [];
  return persist(lib);
}

/** Serializa toda la biblioteca para descargarla. */
export const exportLibrary = () => JSON.stringify(loadLibrary(), null, 2);

/**
 * Importa un JSON exportado: valida, limpia y FUSIONA con lo existente (no borra nada, evita duplicados).
 * @returns {{added: number, skipped: number}}
 * @throws {Error} si el archivo no tiene el formato esperado
 */
export function importLibrary(text) {
  let raw;
  try { raw = JSON.parse(text); } catch { throw new Error('El archivo no es un JSON válido.'); }
  if (!raw || typeof raw !== 'object' || raw.v !== 1 || !Array.isArray(raw.saved)) throw new Error('El archivo no parece una exportación de Generador de Prompts.');
  const incoming = normalize(raw);
  const lib = loadLibrary();
  const known = new Set(lib.saved.map(x => signature(x.snap)));
  let added = 0;
  for (const it of incoming.saved) {
    if (known.has(signature(it.snap))) continue;
    known.add(signature(it.snap));
    lib.saved.push({ ...it, id: newId() });
    added++;
  }
  lib.saved = lib.saved.slice(0, LIMITS.saved);
  persist(lib);
  return { added, skipped: raw.saved.length - added }; // duplicados, vacíos o con formato inválido
}
