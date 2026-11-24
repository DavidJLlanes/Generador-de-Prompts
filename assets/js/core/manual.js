/**
 * TEXTO EDITADO A MANO — el prompt generado se puede retocar (a mano o con «Pulir con IA»). La edición solo
 * vale mientras el prompt generado del que partió siga siendo el mismo: si cambias la selección, se descarta
 * y vuelve el prompt generado. No se guarda en disco.
 */
let current = null; // { base, text, by }
const listeners = new Set();

export const manual = {
  set(base, text, by = 'manual') { current = text.trim() && text !== base ? { base, text, by } : null; listeners.forEach(fn => fn()); },
  clear() { if (current) { current = null; listeners.forEach(fn => fn()); } },
  /** El texto editado si corresponde al prompt generado actual; si no, null. */
  for(generated) { return current && current.base === generated ? current : null; },
  /** Texto final a copiar: el editado si lo hay, o el generado. */
  resolve(generated) { return current && current.base === generated ? current.text : generated; },
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
};
