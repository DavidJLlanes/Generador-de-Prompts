/**
 * GENERADOR del catálogo de vestuario (data/catalogs/vestuario.js y sus miniaturas).
 *
 * Uso: node scripts/catalogs/generar-vestuario.mjs "E:\Downloads\1\costume-clone"
 *
 * Lee el index.html del clon local de COSTUME-DB-01 (catálogo de ギア / @giaaibusi), copia las
 * miniaturas a assets/img/catalogo/vestuario/ y escribe un módulo de datos con una opción por
 * conjunto: etiqueta en español (compuesta con scripts/catalogs/glosario-vestuario.mjs) y prompt
 * en inglés (los propios términos del catálogo, reordenados por prenda).
 *
 * El catálogo se regenera solo cuando cambia el origen; los retoques a mano van después en
 * data/catalogs/vestuario.js.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from '../lib/domains.mjs';
import { COLORS, MATERIALS, PATTERNS, SIZES, DETAILS, GARMENTS, AGREEMENT, KIND } from './glosario-vestuario.mjs';

const SRC = process.argv[2] || 'E:\\Downloads\\1\\costume-clone';
const OUT_IMG = path.join(ROOT, 'assets', 'img', 'catalogo', 'vestuario');
const OUT_DATA = path.join(ROOT, 'data', 'catalogs', 'vestuario.js');

const GROUPS = {
  Primavera: ['primavera', 'Primavera'],
  Verano: ['verano', 'Verano'],
  Otoño: ['otono', 'Otoño'],
  Invierno: ['invierno', 'Invierno'],
  Lencería: ['lenceria', 'Lencería'],
  Sexy: ['sexy', 'Sexy'],
  'Traje de baño': ['bano', 'Traje de baño'],
  Fiesta: ['fiesta', 'Fiesta'],
};
const ADULT_GROUPS = new Set(['lenceria', 'sexy']);
const EN_DETAILS = { ribbon: 'a ribbon', frill: 'frills' };

const file = path.join(SRC, 'index.html');
if (!existsSync(file)) throw new Error(`No encuentro ${file}`);
const html = readFileSync(file, 'utf8');
const start = html.indexOf('const D=');
const end = html.indexOf('];', start);
const items = JSON.parse(html.slice(start + 8, end + 1));

const unknown = new Set();
const usedGroups = new Set();
let copied = 0;

/** Separa los términos en grupos «modificadores + prenda», conservando el orden original. */
function chunks(tokens) {
  const out = [];
  let pending = [];
  for (const t of tokens) {
    const kind = KIND[t];
    if (!kind) { unknown.add(t); continue; }
    if (kind === 'garment') { out.push({ garment: t, mods: pending }); pending = []; }
    else pending.push(t);
  }
  // Modificadores sueltos al final: se pegan a la última prenda (o se ignoran si no hay ninguna).
  if (pending.length && out.length) out[out.length - 1].mods.push(...pending);
  return out;
}

const article = s => (/^[aeiou]/i.test(s) ? 'an ' : 'a ') + s;

function describe(list) {
  const parts = chunks(list).map(({ garment, mods }) => {
    const [noun, gender, number] = GARMENTS[garment];
    const materials = mods.filter(m => MATERIALS[m]);
    const colour = [...mods].reverse().find(m => COLORS[m]);
    const sizes = mods.filter(m => SIZES[m]);
    const patt = mods.filter(m => PATTERNS[m]);
    const dets = mods.filter(m => DETAILS[m]);
    const adjs = mods.filter(m => AGREEMENT[m]);
    const plural = number === 'p';

    let es = noun;
    if (sizes.length) es += ' ' + sizes.map(s => SIZES[s]).join(' ');
    if (adjs.length) es += ' ' + adjs.map(a => AGREEMENT[a][gender === 'f' ? (plural ? 'fp' : 'f') : (plural ? 'mp' : 'm')]).join(' ');
    if (patt.length) es += ' ' + patt.map(p => PATTERNS[p]).join(' y ');
    if (materials.length) es += ' de ' + materials.map(m => MATERIALS[m]).join(' y ');
    if (colour) es += ' en ' + COLORS[colour];
    if (dets.length) es += ' con ' + dets.map(d => DETAILS[d]).join(' y ');

    // Inglés: mismos términos, en el orden natural del inglés (color · adjetivo · tamaño · estampado · material · prenda).
    const enWords = [colour, ...adjs, ...sizes, ...patt, ...materials, garment].filter(Boolean);
    let en = enWords.join(' ');
    if (!plural) en = article(en);
    if (dets.length) en += ' with ' + dets.map(d => EN_DETAILS[d]).join(' and ');
    return { es, en };
  });
  const esList = parts.map(p => p.es);
  let esText = esList.length > 1 ? esList.slice(0, -1).join(', ') + ' y ' + esList.at(-1) : esList[0] || '';
  esText = esText.charAt(0).toUpperCase() + esText.slice(1);
  // Etiquetas por encima de 110 caracteres: se recortan los detalles y se abrevian los pantalones cortos.
  if (esText.length > 110) esText = esText.replace(/ con (lazo|volantes)( y (lazo|volantes))?/g, '').replace(/^Pantalones cortos/, 'Shorts');
  return { es: esText, en: parts.map(p => p.en).join(', ') };
}

const options = [];
const seen = new Map();
const repeated = [];
for (const item of items) {
  const g = GROUPS[item.categoria];
  if (!g) throw new Error(`Categoría desconocida: ${item.categoria}`);
  usedGroups.add(g[0]);
  const id = item.id.toLowerCase();
  const tokens = String(item.keywords || '').trim().split(/\s+/).filter(Boolean);
  const { es, en } = describe(tokens);
  const opt = { id, es, en: 'wearing ' + en, group: g[0], thumb: `/assets/img/catalogo/vestuario/${id}.webp` };
  if (ADULT_GROUPS.has(g[0])) opt.tags = ['adult-only'];

  // Mismo texto = mismo prompt: se conserva el primero y se anota (el catálogo original repite conjuntos).
  if (seen.has(opt.en)) { repeated.push(`${id}=${seen.get(opt.en)}`); continue; }
  seen.set(opt.en, id);
  options.push(opt);

  mkdirSync(OUT_IMG, { recursive: true });
  const from = path.join(SRC, 'thumbs', `${item.id}.webp`);
  if (!existsSync(from)) throw new Error(`Falta la miniatura ${from}`);
  copyFileSync(from, path.join(OUT_IMG, `${id}.webp`));
  copied++;
}

if (unknown.size) throw new Error('Términos sin traducir en el glosario: ' + [...unknown].join(', '));

// Miniaturas de ejecuciones anteriores que ya no corresponden a ninguna opción.
const keep = new Set(options.map(o => `${o.id}.webp`));
for (const f of readdirSync(OUT_IMG)) if (!keep.has(f)) rmSync(path.join(OUT_IMG, f));

const groups = Object.entries(GROUPS).filter(([, [id]]) => usedGroups.has(id)).map(([, [id, title]]) => ({ id, title }));
const json = arr => '[\n' + arr.map(o => '      ' + JSON.stringify(o)).join(',\n') + '\n    ]';
const src = `// FUENTE DE DATOS del catálogo de vestuario. GENERADO por scripts/catalogs/generar-vestuario.mjs
// a partir de COSTUME-DB-01 (ギア, @giaaibusi); no editar a mano: vuelve a generarlo o corrige el origen.
// Esquema y reglas: docs/DATA-SCHEMA.md · Validar con: npm run validate
export default [
  {
    "id": "conjunto-galeria",
    "title": "Conjunto completo (galería)",
    "note": "${options.length} conjuntos de referencia con miniatura. Al elegir uno sustituye a las secciones de vestuario sueltas.",
    "mode": "single",
    "slot": "attribute",
    "foldGroups": true,
    "chance": 0.3,
    "groups": ${JSON.stringify(groups)},
    "options": ${json(options)}
  }
];
`;
mkdirSync(path.dirname(OUT_DATA), { recursive: true });
writeFileSync(OUT_DATA, src, 'utf8');
console.log(`vestuario: ${options.length} conjuntos (${repeated.length} repetidos omitidos) · ${groups.length} grupos · ${copied} miniaturas copiadas`);
console.log(`escrito ${path.relative(ROOT, OUT_DATA)}`);


