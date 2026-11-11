/**
 * ETIQUETAS EFECTIVAS de cada opción = las `tags` propias de los datos + las que asigna TAGGING (data/exclusions.js).
 * Se usa en el build (índice data/tag-index.js) y en los tests. Lanza error si una regla de TAGGING apunta a
 * algo que no existe: así un cambio en los datos no deja una exclusión de seguridad huérfana.
 */
import { TAGGING, TAG_NAMES } from '../../data/exclusions.js';

const key = (d, s, o) => `${d}/${s}/${o}`;

export function effectiveTags(all) {
  const byId = new Map(all.map(({ domain: d }) => [d.id, d]));
  const tags = new Map();
  const add = (k, t) => { if (!tags.has(k)) tags.set(k, new Set()); tags.get(k).add(t); };

  for (const { domain: d } of all) for (const s of d.sections) for (const o of s.options) for (const t of o.tags || []) add(key(d.id, s.id, o.id), t);

  for (const [i, rule] of TAGGING.entries()) {
    const [domId, secId] = rule.domain ? [rule.domain, rule.section] : rule.section.split('/');
    const dom = byId.get(domId);
    const sec = dom?.sections.find(s => s.id === secId);
    if (!sec) throw new Error(`TAGGING[${i}]: no existe la sección ${domId}/${secId}`);
    let opts = sec.options;
    if (rule.group) opts = opts.filter(o => o.group === rule.group);
    if (rule.ids) {
      const missing = rule.ids.filter(id => !opts.some(o => o.id === id));
      if (missing.length) throw new Error(`TAGGING[${i}]: ids inexistentes en ${domId}/${secId}: ${missing.join(', ')}`);
      opts = opts.filter(o => rule.ids.includes(o.id));
    }
    if (rule.es) {
      const missing = rule.es.filter(n => !opts.some(o => o.es === n));
      if (missing.length) throw new Error(`TAGGING[${i}]: nombres inexistentes en ${domId}/${secId}: ${missing.join(' | ')}`);
      opts = opts.filter(o => rule.es.includes(o.es));
    }
    if (rule.without) opts = opts.filter(o => !tags.get(key(domId, secId, o.id))?.has(rule.without));
    if (!opts.length) throw new Error(`TAGGING[${i}]: no alcanza ninguna opción (${domId}/${secId})`);
    for (const o of opts) add(key(domId, secId, o.id), rule.tag);
  }
  return tags;
}

/** Contenido de data/tag-index.js: { etiqueta: ["dominio/sección/opción", …] } solo con las etiquetas que usan las reglas. */
export function tagIndexSource(all) {
  const tags = effectiveTags(all);
  const out = {};
  for (const t of TAG_NAMES) out[t] = [];
  for (const [k, set] of tags) for (const t of set) if (out[t]) out[t].push(k);
  for (const t of TAG_NAMES) out[t].sort();
  return `// GENERADO por scripts/build.mjs a partir de data/domains/*.js y data/exclusions.js — no editar a mano.\nexport default ${JSON.stringify(out, null, 1)};\n`;
}
