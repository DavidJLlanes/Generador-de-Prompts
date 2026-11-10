/**
 * CONFLICTOS entre secciones de un dominio (puro, sin DOM).
 * Un dominio puede declarar `conflicts: [{ id, a: [secciones], b: [secciones] }]`: las secciones de `a`
 * no pueden convivir con las de `b`. Al elegir una opción en una de ellas, se vacían las del otro lado.
 * Ejemplo: en «Escenarios», una idea destacada ya trae su propio motivo y ambiente.
 */

/** Secciones que quedan incompatibles al elegir algo en `sectionId`. */
export function conflictsOf(domain, sectionId) {
  const out = new Set();
  for (const c of domain?.conflicts || []) {
    if (c.a.includes(sectionId)) c.b.forEach(s => out.add(s));
    if (c.b.includes(sectionId)) c.a.forEach(s => out.add(s));
  }
  out.delete(sectionId);
  return [...out];
}

/**
 * Resuelve los conflictos de una selección ya hecha de un dominio (p. ej. al azar): si hay secciones de
 * ambos lados, conserva uno al azar y elimina el otro. Respeta las secciones bloqueadas.
 * @param {Record<string, string[]>} selection  mapa sección -> ids (se modifica y se devuelve)
 */
export function resolveConflicts(domain, selection, { locked = {}, rng = Math.random } = {}) {
  for (const c of domain?.conflicts || []) {
    const hasA = c.a.filter(s => selection[s]?.length);
    const hasB = c.b.filter(s => selection[s]?.length);
    if (!hasA.length || !hasB.length) continue;
    const dropA = hasA.every(s => !locked[s]) && (hasB.some(s => locked[s]) || rng() < 0.5);
    const drop = dropA ? hasA : hasB;
    drop.forEach(s => { if (!locked[s]) delete selection[s]; });
  }
  return selection;
}
