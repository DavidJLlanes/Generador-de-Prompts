/** Utilidades puras, sin dependencias del DOM (se pueden usar también en Node). */

export const slugify = (s, max = 56) =>
  String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, max).replace(/-$/, '') || 'x';

/** Texto sin acentos y en minúsculas, para búsquedas tolerantes. */
export const fold = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ESC[c]);

/** Variantes de una palabra buscada: tal cual, sin plural y con el otro género (pelirroja → pelirrojo, dragones → dragon). */
function variants(t) {
  const out = new Set([t]);
  const bases = [t];
  if (t.length >= 5 && t.endsWith('es')) bases.push(t.slice(0, -2));
  if (t.length >= 4 && t.endsWith('s')) bases.push(t.slice(0, -1));
  for (const b of bases) {
    out.add(b);
    if (b.length >= 4 && /[ao]$/.test(b)) out.add(b.slice(0, -1) + (b.endsWith('a') ? 'o' : 'a'));
  }
  return [...out];
}

/** Palabras sueltas de un texto, sin acentos ni signos, con espacio delante de cada una (para buscar por inicio de palabra). */
export const wordText = s => ` ${fold(s).replace(/[^a-z0-9]+/g, ' ').trim()} `;

/**
 * Búsqueda por palabras: cada palabra de la consulta debe ser el comienzo de alguna palabra del texto, en cualquier
 * orden («ferr» encuentra «Ferrari»; «pelo» no encuentra «terciopelo»), admitiendo plural y género.
 * `haystack` ya viene sin acentos y en minúsculas.
 */
export const matchesAll = (haystack, query) => {
  const words = wordText(haystack);
  return fold(query).split(/[^a-z0-9]+/).filter(Boolean).every(t => variants(t).some(v => words.includes(` ${v}`)));
};

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
export const isLong = t => t.length > 130 || /[.!?]\s/.test(t) || /[.!?]$/.test(t);

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
    // Cada pieza puede ser texto o {t, phrase}: `phrase` fuerza a unirla con comas aunque sea larga
    // (descripciones de ropa, peinado o expresión del sujeto, que son frases nominales, no oraciones).
    const t = String(typeof raw === 'object' && raw ? raw.t : raw || '').trim();
    const phrase = typeof raw === 'object' && raw ? !!raw.phrase : false;
    if (!t) continue;
    if (!phrase && isLong(t)) { flush(); out.push(endSentence(capFirst(t))); } else buf.push(t);
  }
  flush();
  return out;
}

/** Ranuras cuyas piezas describen al sujeto como frases nominales (se unen con comas). */
const PHRASE_SLOTS = new Set(['subject', 'attribute', 'action']);
/** Prepara una pieza compuesta para `toSentences`: las frases largas del sujeto no se parten en oraciones. */
export const sentenceItem = p => ({ t: p.text, phrase: PHRASE_SLOTS.has(p.slot) && !/[.!?](\s|$)/.test(p.text) });

const NF = new Intl.NumberFormat('es-ES', { useGrouping: 'always' });
export const fmtNumber = n => NF.format(n);

/**
 * Generador pseudoaleatorio con semilla (mulberry32 sobre un hash de la cadena): misma semilla, misma secuencia.
 * Sirve para el «prompt del día»: todo el mundo obtiene el mismo el mismo día.
 * @param {string} seed
 * @returns {() => number} función que devuelve números en [0, 1)
 */
export function seededRng(seed) {
  let h = 1779033703 ^ String(seed).length;
  for (let i = 0; i < String(seed).length; i++) { h = Math.imul(h ^ String(seed).charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  let a = (h = Math.imul(h ^ (h >>> 16), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) ^ (h >>> 16);
  return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
