/**
 * IMPORTADOR DE PROMPTS (puro, sin DOM): convierte un prompt en inglés (de esta web o de otra parte) en una
 * selección de opciones. Busca en el texto las frases que coinciden con el inglés de alguna opción (la más larga
 * primero) y manda el resto al texto libre, para no perder nada.
 *
 * Entiende el texto de los formatos de la web (Texto, ChatGPT/Gemini, Stable Diffusion, Flux, DALL·E, Ideogram,
 * Midjourney) y de otros programas: quita los parámetros `--ar`, `--v`…, los pesos «(palabra:1.2)», las etiquetas
 * `<lora:…>` y la parte de «Avoid» / prompt negativo.
 */
import { ASPECTS } from '../../../data/aspects.js';
import { CUSTOM_MAX } from './store.js';
import { ratioOf } from './lint.js';

/** Palabras de relleno: no cuentan como contenido (si solo sobran estas, el fragmento está «cubierto»). */
const FILLER = new Set(('a an the of in on at with and or to for from by as is are was her his their its this that it into over under '
  + 'create image highly detailed high quality subject details setting atmosphere style technique additional pose action format reference '
  + 'woman man girl boy car creature animal weapon vehicle rocket object character chimera together set').split(' '));

const MAX_TOKENS = 120;
const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/** Texto → tokens: palabras (con su forma original) y «,» como separador (cualquier puntuación fuerte). */
function tokenize(text) {
  const out = [];
  for (const m of String(text).matchAll(/[A-Za-z0-9]+|[,.;:!?\n]+/g)) {
    if (/^[,.;:!?\n]/.test(m[0])) { if (out.length && out.at(-1).w !== ',') out.push({ w: ',', raw: ',' }); }
    else out.push({ w: m[0].toLowerCase(), raw: m[0] });
  }
  while (out.at(-1)?.w === ',') out.pop();
  return out;
}

const keyOf = text => tokenize(text).map(t => t.w).join(' ');

/**
 * Prepara el índice a partir de data/import-index.json.
 * @returns {{map: Map<string, object[]>, lens: number[], leads: Set<string>}}
 */
export function buildImportIndex(raw) {
  const map = new Map();
  const lens = new Set();
  const add = (text, entry) => {
    const key = keyOf(text);
    const n = key ? key.split(' ').length : 0;
    if (!n || n > MAX_TOKENS) return;
    lens.add(n);
    const list = map.get(key);
    if (list) { if (!list.some(e => e.si === entry.si && e.option === entry.option)) list.push(entry); } else map.set(key, [entry]);
  };
  for (const [si, option, en, rich] of raw.o) {
    const [di, section, single] = raw.s[si];
    const entry = { si, domain: raw.d[di], section, option, single: single === 1, en };
    add(en, entry);
    if (rich) add(rich, entry);
  }
  return { map, lens: [...lens].sort((a, b) => b - a), leads: new Set(raw.l.filter(Boolean).map(norm)) };
}

/** Quita lo que no es descripción: JSON, etiquetas de formato, parámetros, negativos, pesos. Devuelve el texto y lo que se leyó de él. */
function preprocess(input) {
  let text = String(input || '');
  const notes = { aspect: '', ignored: [] };
  const trimmed = text.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const strings = [];
      const walk = v => { if (typeof v === 'string') { if (!/^#[0-9a-f]{3,8}$/i.test(v)) strings.push(v); } else if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') Object.values(v).forEach(walk); };
      walk(JSON.parse(trimmed));
      text = strings.join('. ');
    } catch { /* no era JSON: se trata como texto */ }
  }
  // Midjourney / otros: los parámetros empiezan en el primer « --palabra».
  const cut = text.search(/\s--[a-z]+/i);
  if (cut >= 0) {
    const params = text.slice(cut);
    const ar = /--(?:ar|aspect)\s+(\d+(?:\.\d+)?:\d+(?:\.\d+)?)/i.exec(params);
    if (ar) notes.aspect = ar[1];
    if (/--no\s/i.test(params)) notes.ignored.push('Se ignoró la parte «--no».');
    text = text.slice(0, cut);
  }
  // Stable Diffusion: «Positive prompt: … / Negative prompt: … / Size: …».
  const pos = /Positive prompt:\s*([^\n]*)/i.exec(text);
  if (pos) { text = pos[1]; notes.ignored.push('Se ignoró el prompt negativo y el tamaño.'); }
  else if (/Negative prompt:/i.test(text)) { text = text.split(/Negative prompt:/i)[0]; notes.ignored.push('Se ignoró el prompt negativo.'); }
  // Proporción escrita en el texto: «Aspect ratio "9:16".» / «Aspect ratio: 16:9.»
  text = text.replace(/Aspect ratio[:\s]*"?(\d+(?:\.\d+)?:\d+(?:\.\d+)?)"?\.?/gi, (_, r) => { notes.aspect ||= r; return ' '; });
  // Lo que se pide evitar no se importa.
  if (/(?:^|\s)(?:Avoid|Do not include):/i.test(text)) notes.ignored.push('Se ignoró la parte «Avoid» / «Do not include».');
  text = text.replace(/(?:^|\s)(?:Avoid|Do not include):[^\n]*/gi, ' ');
  // Líneas de formato de la web que no describen la imagen.
  text = text.split('\n').filter(l => !/^\s*(?:Format|Reference images|Size):/i.test(l)).join('\n');
  text = text.replace(/<[^>]*>/g, ' ').replace(/\bBREAK\b/g, ',').replace(/\(([^()]*?)(?::\s*-?\d+(?:\.\d+)?)?\)/g, '$1').replace(/[()[\]{}]/g, ' ');
  return { text, notes };
}

/** Proporción del texto (o de `--ar`) → id de la lista de la web que la representa, o ''. */
export function aspectIdFor(value) {
  if (!value) return '';
  const exact = ASPECTS.find(a => a.id === value);
  if (exact) return exact.id;
  const r = ratioOf(value);
  const near = r && ASPECTS.find(a => a.id && Math.abs((ratioOf(a.id) / r) - 1) < 0.005); // p. ej. «6:13» de Midjourney = «9:19.5»
  return near ? near.id : '';
}

/**
 * @param {string} input
 * @param {ReturnType<typeof buildImportIndex>} index
 * @returns {{sel: Record<string, Record<string, string[]>>, custom: string, aspect: string,
 *   matches: {domain: string, section: string, option: string, en: string}[], leftovers: string[], ignored: string[]}}
 */
export function parsePrompt(input, index) {
  const { text, notes } = preprocess(input);
  const tokens = tokenize(text);
  const items = []; // { kind: 'match', entries, len, words } | { kind: 'word', t } | { kind: 'comma' }

  // 1) Frases más largas primero. Las de una sola palabra solo cuentan cuando son todo el fragmento (más abajo).
  for (let i = 0; i < tokens.length;) {
    if (tokens[i].w === ',') { items.push({ kind: 'comma' }); i++; continue; }
    let found = null;
    for (const len of index.lens) {
      if (len < 2 || i + len > tokens.length) continue;
      if (tokens[i + len - 1].w === ',') continue;
      const key = tokens.slice(i, i + len).map(t => t.w).join(' ');
      const entries = index.map.get(key);
      if (entries) { found = { kind: 'match', entries, len, words: tokens.slice(i, i + len).filter(t => t.w !== ',').length }; break; }
    }
    if (found) { found.rawText = tokens.slice(i, i + found.len).filter(t => t.w !== ',').map(t => t.raw).join(' '); items.push(found); i += found.len; } else { items.push({ kind: 'word', t: tokens[i] }); i++; }
  }

  // 2) Fragmentos (separados por comas fuera de las frases reconocidas).
  const chunks = [[]];
  for (const it of items) { if (it.kind === 'comma') chunks.push([]); else chunks.at(-1).push(it); }
  const content = it => it.kind === 'word' && !FILLER.has(it.t.w);
  const selected = [];
  const leftovers = [];
  const extra = [];
  const matchedOf = chunk => chunk.filter(it => it.kind === 'match');

  for (const chunk of chunks) {
    if (!chunk.length) continue;
    let ms = matchedOf(chunk);
    const free = chunk.filter(content);
    if (!ms.length) {
      // Fragmento de una sola palabra de contenido que es una opción por sí sola («bokeh», «Ferrari»).
      const key = free.map(it => it.t.w).join(' ');
      const entries = free.length && free.length <= 3 ? index.map.get(key) : null;
      if (entries && key && chunk.every(it => it.kind === 'word')) { selected.push({ entries, words: free.length }); continue; }
      if (!free.length) continue; // solo relleno («create the image of a»)
      leftovers.push(chunk.filter(it => it.kind === 'word').map(it => it.t.raw).join(' '));
      continue;
    }
    const matchedWords = ms.reduce((n, m) => n + m.words, 0);
    if (!free.length) { ms.forEach(m => selected.push(m)); continue; }
    if (matchedWords >= 2 * free.length) { ms.forEach(m => selected.push(m)); extra.push(free.map(it => it.t.raw).join(' ')); continue; }
    // Fragmento dominado por lo no reconocido: se guarda entero como texto libre (reconstruido desde los tokens).
    leftovers.push(chunk.map(it => (it.kind === 'match' ? it.rawText : it.t.raw)).join(' '));
  }

  // 3) A selección: una opción por entrada; en secciones de elección única, la primera gana.
  const sel = {};
  const matches = [];
  const taken = new Set();
  const placed = new Set();
  // Cuando el mismo texto existe en varios generadores, gana el que ya aparece en el resto del prompt (p. ej. «Mujer»).
  const affinity = {};
  for (const m of selected) if (m.entries.length === 1) affinity[m.entries[0].domain] = (affinity[m.entries[0].domain] || 0) + 1;
  const rank = e => -(affinity[e.domain] || 0);
  for (const m of selected) {
    const free = m.entries.filter(e => !taken.has(`${e.domain}/${e.section}`) || !e.single);
    const e = [...free].sort((a, b) => rank(a) - rank(b)).find(x => !placed.has(`${x.domain}/${x.section}/${x.option}`)) || null;
    if (!e) continue;
    placed.add(`${e.domain}/${e.section}/${e.option}`);
    if (e.single) taken.add(`${e.domain}/${e.section}`);
    const list = ((sel[e.domain] ||= {})[e.section] ||= []);
    if (!list.includes(e.option)) list.push(e.option);
    matches.push({ domain: e.domain, section: e.section, option: e.option, en: e.en });
  }

  const custom = [...extra, ...leftovers].map(s => s.trim()).filter(Boolean).join(', ').slice(0, CUSTOM_MAX);
  return { sel, custom, aspect: aspectIdFor(notes.aspect), matches, leftovers: [...extra, ...leftovers], ignored: notes.ignored };
}
