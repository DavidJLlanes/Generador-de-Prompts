/**
 * FAMILIAS DE SECCIONES (puro, sin DOM). Datos: data/families.js.
 *
 * Un mismo rasgo puede estar descrito en varios generadores (Mujer trae el pelo, Peinados lo
 * desarrolla, Personaje avanzado lo repite). Una familia agrupa esas secciones: al elegir en una
 * se quitan las demás de su familia, estén donde estén, para que el prompt no diga dos veces lo mismo.
 *
 *  · familyOf(d, s)         → familia de la sección, o null.
 *  · familySiblings(d, s)   → secciones de la misma familia (sin contar la dada).
 *  · clearFamily(sel, …)    → selección sin las hermanas; devuelve { sel, removed }.
 *  · pruneFamilies(sel)     → deja solo la primera sección de cada familia (enlaces, aleatorio, guardados).
 */
import { FAMILIES } from '../../../data/families.js';

const BY_SECTION = new Map();
for (const f of FAMILIES) for (const key of f.sections) BY_SECTION.set(key, f);

export const FAMILY_LIST = FAMILIES;

/** @returns {{id: string, label: string, sections: string[]}|null} */
export const familyOf = (domain, section) => BY_SECTION.get(`${domain}/${section}`) || null;

/** Secciones de la misma familia que la dada, con la etiqueta del concepto. */
export function familySiblings(domain, section) {
  const f = familyOf(domain, section);
  if (!f) return [];
  const self = `${domain}/${section}`;
  return f.sections.filter(k => k !== self).map(k => {
    const [d, s] = k.split('/');
    return { domain: d, section: s, label: f.label };
  });
}

/**
 * Quita de la selección las secciones hermanas de (domain, section) que tengan algo elegido.
 * La sección elegida se conserva: es la que gana.
 */
export function clearFamily(sel, domain, section) {
  const removed = familySiblings(domain, section).filter(x => sel?.[x.domain]?.[x.section]?.length);
  if (!removed.length) return { sel, removed: [] };
  const next = { ...sel };
  for (const x of removed) {
    const dom = { ...next[x.domain] };
    delete dom[x.section];
    if (Object.keys(dom).length) next[x.domain] = dom;
    else delete next[x.domain];
  }
  return { sel: next, removed };
}

/** Deja la primera sección de cada familia y descarta las demás (para selecciones ya hechas). */
export function pruneFamilies(sel) {
  const seen = new Set();
  const removed = [];
  const next = {};
  for (const [d, secs] of Object.entries(sel || {})) {
    for (const [s, ids] of Object.entries(secs || {})) {
      if (!Array.isArray(ids) || !ids.length) continue;
      const f = familyOf(d, s);
      if (f && seen.has(f.id)) {
        ids.forEach(o => removed.push({ domain: d, section: s, option: o, rule: `familia:${f.label}` }));
        continue;
      }
      if (f) seen.add(f.id);
      (next[d] ||= {})[s] = ids;
    }
  }
  return { sel: next, removed };
}
