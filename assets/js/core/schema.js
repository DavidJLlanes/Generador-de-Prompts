/**
 * VALIDADOR del esquema de datos (v1). Funciona igual en Node (scripts/validate-data.mjs)
 * y en el navegador. Devuelve listas de errores (bloquean) y avisos (informan).
 * El esquema está documentado en docs/DATA-SCHEMA.md.
 */
import { SLOT_IDS } from '../../../data/taxonomy.js';

const ID_RX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MODES = ['single', 'multi'];
const isStr = v => typeof v === 'string' && v.trim().length > 0;

/**
 * @param {object} d  Dominio exportado por data/domains/<id>.js
 * @returns {{errors: string[], warnings: string[]}}
 */
export function validateDomain(d) {
  const errors = [];
  const warnings = [];
  const at = (path, msg) => errors.push(`${d?.id || '?'} › ${path}: ${msg}`);
  const warn = (path, msg) => warnings.push(`${d?.id || '?'} › ${path}: ${msg}`);

  if (!d || typeof d !== 'object') return { errors: ['dominio vacío'], warnings };
  if (d.schema !== 1) at('schema', `debe ser 1 (es ${d.schema})`);
  if (!ID_RX.test(d.id || '')) at('id', 'id no válido (minúsculas, números y guiones)');
  if (!ID_RX.test(d.slug || '')) at('slug', 'slug no válido');
  if (!SLOT_IDS.includes(d.role)) at('role', `debe ser uno de ${SLOT_IDS.join(', ')}`);
  if (typeof d.order !== 'number') at('order', 'debe ser un número');
  if (!d.meta || !isStr(d.meta.title)) at('meta.title', 'falta el título');
  if (!d.meta || !isStr(d.meta.summary)) at('meta.summary', 'falta el resumen (se usa en SEO)');
  if (d.meta && !isStr(d.meta.short)) warn('meta.short', 'falta el nombre corto');
  if (d.lead != null && !isStr(d.lead)) at('lead', 'debe ser texto en inglés');
  if (!Array.isArray(d.sections) || !d.sections.length) { at('sections', 'debe tener al menos una sección'); return { errors, warnings }; }

  const secIds = new Set();
  d.sections.forEach((s, i) => {
    const sp = `sections[${i}]${s && s.id ? ` (${s.id})` : ''}`;
    if (!ID_RX.test(s.id || '')) at(sp, 'id de sección no válido');
    if (secIds.has(s.id)) at(sp, 'id de sección duplicado');
    secIds.add(s.id);
    if (!isStr(s.title)) at(sp, 'falta el título');
    if (!MODES.includes(s.mode)) at(sp, `mode debe ser ${MODES.join(' o ')}`);
    if (s.slot !== undefined && !SLOT_IDS.includes(s.slot)) at(sp, `slot desconocido «${s.slot}»`);
    if (s.polarity !== undefined && s.polarity !== 'negative') at(sp, 'polarity solo admite «negative»');
    if (s.joiner !== undefined && typeof s.joiner !== 'string') at(sp, 'joiner debe ser texto');
    if (s.chance !== undefined && !(typeof s.chance === 'number' && s.chance >= 0 && s.chance <= 1)) at(sp, 'chance debe ser un número entre 0 y 1');
    if (!Array.isArray(s.options) || !s.options.length) { at(sp, 'sin opciones'); return; }

    const groupIds = new Set();
    (s.groups || []).forEach((g, gi) => {
      if (!ID_RX.test(g.id || '')) at(`${sp}.groups[${gi}]`, 'id de grupo no válido');
      if (groupIds.has(g.id)) at(`${sp}.groups[${gi}]`, 'id de grupo duplicado');
      groupIds.add(g.id);
      if (!isStr(g.title)) at(`${sp}.groups[${gi}]`, 'falta el título del grupo');
    });

    const optIds = new Set();
    const seenEn = new Map();
    s.options.forEach((o, oi) => {
      const op = `${sp}.options[${oi}]`;
      if (!ID_RX.test(o.id || '')) at(op, `id no válido «${o.id}»`);
      if (optIds.has(o.id)) at(op, `id duplicado «${o.id}»`);
      optIds.add(o.id);
      if (!isStr(o.es)) at(op, 'falta «es» (texto de interfaz en español)');
      if (!isStr(o.en)) at(op, 'falta «en» (texto del prompt en inglés)');
      if (o.rich !== undefined && !isStr(o.rich)) at(op, '«rich» debe ser texto');
      if (o.group !== undefined && !groupIds.has(o.group)) at(op, `grupo inexistente «${o.group}»`);
      if (o.tags !== undefined && !(Array.isArray(o.tags) && o.tags.every(isStr))) at(op, '«tags» debe ser una lista de textos');
      if (o.info !== undefined && !(Array.isArray(o.info) && o.info.every(p => Array.isArray(p) && p.length === 2 && isStr(p[0]) && isStr(p[1])))) at(op, '«info» debe ser una lista de pares [etiqueta, texto]');
      if (isStr(o.en)) {
        const k = o.en.toLowerCase().trim();
        if (seenEn.has(k)) warn(op, `texto en inglés repetido en la misma sección («${o.en.slice(0, 40)}»)`);
        seenEn.set(k, true);
      }
      if (isStr(o.es) && o.es.length > 110) warn(op, 'etiqueta en español muy larga (>110)');
    });
    if (groupIds.size) {
      const used = new Set(s.options.map(o => o.group).filter(Boolean));
      for (const g of groupIds) if (!used.has(g)) warn(sp, `grupo sin opciones «${g}»`);
    }
  });

  (d.rules || []).forEach((r, i) => {
    const rp = `rules[${i}]`;
    if (!ID_RX.test(r.id || '')) at(rp, 'id de regla no válido');
    const sec = d.sections.find(s => s.id === r.when?.section);
    if (!sec) { at(rp, `when.section inexistente «${r.when?.section}»`); return; }
    if (!r.when.tag && !r.when.option) at(rp, 'when necesita «tag» u «option»');
    if (r.when.option && !sec.options.some(o => o.id === r.when.option)) at(rp, `when.option inexistente «${r.when.option}»`);
    if (!SLOT_IDS.includes(r.add?.slot)) at(rp, 'add.slot desconocido');
    if (!isStr(r.add?.en)) at(rp, 'add.en debe ser texto en inglés');
  });

  return { errors, warnings };
}

/** Comprueba que cada preset apunta a secciones y opciones que existen. */
export function validatePresets(presets, domain) {
  const errors = [];
  const seen = new Set();
  presets.forEach(p => {
    if (seen.has(p.n)) errors.push(`presets › n duplicado ${p.n}`);
    seen.add(p.n);
    for (const [secId, ids] of Object.entries(p.sel || {})) {
      const sec = domain.sections.find(s => s.id === secId);
      if (!sec) { errors.push(`presets › #${p.n}: sección inexistente «${secId}»`); continue; }
      for (const id of ids) if (!sec.options.some(o => o.id === id)) errors.push(`presets › #${p.n}: opción inexistente «${secId}/${id}»`);
    }
  });
  return errors;
}
