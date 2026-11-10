/** Utilidades puras, sin dependencias del DOM (se pueden usar también en Node). */

export const slugify = (s, max = 56) =>
  String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, max).replace(/-$/, '') || 'x';

/** Texto sin acentos y en minúsculas, para búsquedas tolerantes. */
export const fold = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ESC[c]);

/** Búsqueda por palabras: todas deben aparecer, en cualquier orden. `haystack` ya viene sin acentos y en minúsculas. */
export const matchesAll = (haystack, query) => fold(query).split(/\s+/).filter(Boolean).every(t => haystack.includes(t));

export const uniq =arr => [...new Set(arr)];
export const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

export function debounce(fn, ms = 120) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

/** Asegura puntuación final. */
export const endSentence = s => (/[.!?]$/.test(s.trim()) ? s.trim() : s.trim() + '.');

/** Artículo indefinido inglés para una frase («an elderly woman», «a young woman»). */
const AN = /^([aeiou]|(8\d?|11|18)(?=\D|$))/i; // vocal, o «80-year-old», «18-year-old», «11-year-old» (se leen con vocal)
export const withArticle = t => (/^(a|an|the)\s/i.test(t) ? t : `${AN.test(t) ? 'an' : 'a'} ${t}`);

const capFirst = s => s.replace(/^([a-z])/, c => c.toUpperCase());
const isLong = t => t.length > 130 || /[.!?]\s/.test(t) || /[.!?]$/.test(t);

/**
 * Convierte una lista de piezas en oraciones legibles: las etiquetas cortas consecutivas se unen
 * con comas en una sola frase, y cada descripción larga (párrafo) es una oración propia.
 * `opener` es la frase inicial («Create the image of a woman»): se funde con la primera frase
 * corta si la hay; si no, queda como oración independiente.
 * @returns {string[]}
 */
export function toSentences(texts, opener = '') {
  const out = [];
  let buf = opener ? [opener] : [];
  const flush = () => { if (buf.length) { out.push(endSentence(capFirst(buf.join(', ')))); buf = []; } };
  for (const raw of texts) {
    const t = String(raw || '').trim();
    if (!t) continue;
    if (isLong(t)) { flush(); out.push(endSentence(capFirst(t))); } else buf.push(t);
  }
  flush();
  return out;
}

const NF = new Intl.NumberFormat('es-ES', { useGrouping: 'always' });
export const fmtNumber = n => NF.format(n);
