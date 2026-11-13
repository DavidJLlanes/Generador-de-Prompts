import { sitePath } from './site-path.js';
/**
 * REGISTRO — conoce todos los dominios (por el catálogo ligero) y carga los datos de cada uno
 * bajo demanda con import() dinámico, de modo que ninguna página descarga más de lo que usa.
 */
import catalog from '../../../data/catalog.js';
import { fold, matchesAll } from './util.js';

const cache = new Map();

export const getCatalog = () => catalog;
export const domainMeta = id => catalog.domains.find(d => d.id === id) || null;
export const domainBySlug = slug => catalog.domains.find(d => d.slug === slug) || null;
export const domainsByRole = role => catalog.domains.filter(d => d.role === role);

function prepare(d) {
  for (const s of d.sections) {
    s._byId = new Map(s.options.map(o => [o.id, o]));
    s._groupById = new Map((s.groups || []).map(g => [g.id, g]));
  }
  d._secById = new Map(d.sections.map(s => [s.id, s]));
  return d;
}

/** Carga (una sola vez) los datos completos de un dominio. */
export function loadDomain(id) {
  if (!domainMeta(id)) return Promise.reject(new Error(`Dominio desconocido: ${id}`));
  if (!cache.has(id)) cache.set(id, import(sitePath(`/data/domains/${id}.js`)).then(m => prepare(m.default)));
  return cache.get(id);
}

/** Carga varios dominios y devuelve un objeto { id: dominio }. */
export async function loadDomains(ids) {
  const list = await Promise.all([...new Set(ids)].map(loadDomain));
  return Object.fromEntries(list.map(d => [d.id, d]));
}

/** Carga los presets de un dominio, si los tiene. */
export function loadPresets(id) {
  return import(sitePath(`/data/presets/${id}.js`)).then(m => m.default);
}

/** Búsqueda en el catálogo (título, nombre corto, kicker y resumen). */
export function searchDomains(query, role) {
  const q = fold(query).trim();
  return catalog.domains.filter(d => (!role || d.role === role) && (!q || matchesAll(fold(`${d.title} ${d.short} ${d.kicker} ${d.summary}`), q)));
}
