/**
 * AUDITORÍA DE DATOS — lista problemas de calidad en las opciones de todos los generadores:
 * mayúsculas tipo «Título De Libro», etiquetas repetidas en una sección, textos en inglés con
 * palabras en español o acentos, palabras repetidas, espacios y signos sueltos.
 * Uso: node scripts/audit-data.mjs [--json]   (no cambia nada; solo informa)
 */
import { loadAllDomains } from './lib/domains.mjs';

const fold = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const SMALL = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'y', 'e', 'o', 'u', 'en', 'con', 'a', 'al', 'por', 'para', 'sin', 'sobre', 'tras', 'entre', 'un', 'una']);
const SPANISH_IN_EN = /\b(de|del|con|y|para|sobre|una?|los|las|muy|estilo|luz|cielo|noche|ciudad|mujer|hombre|pelo|ojos|fondo)\b|[áéíóúñ¿¡]/i;

/** «Paisaje de Papel Recortado»: 3+ palabras y todas las palabras con contenido empiezan por mayúscula. */
export function isTitleCase(es) {
  const words = es.split(/\s+/).filter(w => /^[\p{L}]/u.test(w));
  const content = words.filter(w => !SMALL.has(w.toLowerCase()));
  return content.length >= 3 && content.slice(1).every(w => /^\p{Lu}\p{Ll}/u.test(w));
}

/** Pasa «Paisaje de Papel Recortado» a «Paisaje de papel recortado» (respeta siglas y números). */
export function sentenceCase(es) {
  let first = true;
  return es.replace(/[\p{L}][\p{L}'’-]*/gu, w => {
    if (first) { first = false; return w; }
    return /^\p{Lu}\p{Ll}+$/u.test(w) ? w.toLowerCase() : w; // «LED», «3D», «McQueen» se quedan igual
  });
}

export async function auditData() {
  const all = (await loadAllDomains()).map(x => x.domain);
  const issues = [];
  const add = (kind, d, s, o, detail) => issues.push({ kind, domain: d.id, section: s.id, option: o?.id, es: o?.es, en: o?.en, detail });
  for (const d of all) for (const s of d.sections) {
    const seenEs = new Map(), seenEn = new Map();
    for (const o of s.options) {
      const kEs = fold(o.es.trim()), kEn = fold(o.en.trim());
      if (seenEs.has(kEs)) add('es-duplicada', d, s, o, `igual que ${seenEs.get(kEs)}`); else seenEs.set(kEs, o.id);
      if (seenEn.has(kEn)) add('en-duplicada', d, s, o, `igual que ${seenEn.get(kEn)}`); else seenEn.set(kEn, o.id);
      if (isTitleCase(o.es)) add('mayusculas-titulo', d, s, o, sentenceCase(o.es));
      if (/\s{2,}|^\s|\s$/.test(o.es) || /\s{2,}|^\s|\s$/.test(o.en)) add('espacios', d, s, o);
      if (/\b(\p{L}{3,}) \1\b/iu.test(o.en)) add('en-palabra-repetida', d, s, o);
      if (SPANISH_IN_EN.test(o.en)) add('en-con-espanol', d, s, o);
      if (/[.,;]$/.test(o.es.trim())) add('es-signo-final', d, s, o);
      if (/^\p{Ll}/u.test(o.es)) add('es-minuscula-inicial', d, s, o);
    }
  }
  return issues;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const issues = await auditData();
  if (process.argv.includes('--json')) { console.log(JSON.stringify(issues, null, 1)); process.exit(0); }
  const by = Map.groupBy ? Map.groupBy(issues, i => i.kind) : issues.reduce((m, i) => m.set(i.kind, [...(m.get(i.kind) || []), i]), new Map());
  for (const [kind, list] of by) {
    console.log(`\n■ ${kind}: ${list.length}`);
    for (const i of list.slice(0, 8)) console.log(`   ${i.domain} › ${i.section} › ${i.option}  «${i.es}» / «${i.en}»${i.detail ? `  → ${i.detail}` : ''}`);
  }
  console.log(`\nTotal: ${issues.length}`);
}
