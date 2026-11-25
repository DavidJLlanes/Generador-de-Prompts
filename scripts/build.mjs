/**
 * BUILD — genera los artefactos derivados a partir de data/ (la única fuente de verdad):
 *   · data/catalog.js            índice ligero de dominios (lo carga cada página)
 *   · generadores/<slug>/…       una página HTML por generador (SEO)
 *   · páginas estáticas          inicio, catálogo, constructor, legales y 404
 *   · sitemap.xml
 * Los artefactos se versionan en git: en el servidor basta con `git pull`.
 * Uso: npm run build
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT, loadAllDomains, loadPresetsFor } from './lib/domains.mjs';
import { buildPages } from './pages/index.mjs';
import { tagIndexSource } from './lib/tags.mjs';

const all = await loadAllDomains();
const write = (rel, content) => {
  const file = path.join(ROOT, rel);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, content, 'utf8');
};

/* ---------- catálogo ---------- */
const domains = [];
let presetCount = 0;
for (const { domain: d } of all) {
  const presets = await loadPresetsFor(d.id);
  if (presets) presetCount += presets.length;
  domains.push({
    id: d.id, slug: d.slug, role: d.role, order: d.order, lead: d.lead || null,
    title: d.meta.title, short: d.meta.short || d.meta.title, kicker: d.meta.kicker || '', summary: d.meta.summary,
    sections: d.sections.length,
    options: d.sections.reduce((n, s) => n + s.options.length, 0),
    presets: presets ? presets.length : 0,
    presetsLabel: d.meta.presetsLabel || 'ideas',
  });
}
const totals = {
  domains: domains.length,
  sections: domains.reduce((n, d) => n + d.sections, 0),
  options: domains.reduce((n, d) => n + d.options, 0),
  presets: presetCount,
};
write('data/catalog.js', `// GENERADO por scripts/build.mjs a partir de data/domains/*.js — no editar a mano.\nexport default ${JSON.stringify({ totals, domains }, null, 2)};\n`);
console.log(`catálogo: ${totals.domains} dominios · ${totals.sections} secciones · ${totals.options} opciones · ${totals.presets} ideas y recetas`);

/* ---------- índice de etiquetas para las exclusiones (data/exclusions.js) ---------- */
write('data/tag-index.js', tagIndexSource(all));

/* ---------- índice del buscador global (se carga bajo demanda desde /generadores/) ---------- */
// { d: [[slug, nombre corto]],
//   o: [[dominio, id de sección, título de sección, [etiquetas es…], [índice de subgrupo por opción | -1], [[id, título] de subgrupos], {i: texto en inglés corto}]] }
// El inglés solo se guarda si es corto y distinto del español: permite buscar «widebody» o «sunset» sin duplicar el peso.
const foldText = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const searchIndex = {
  d: all.map(({ domain: d }) => [d.slug, d.meta.short || d.meta.title]),
  o: all.flatMap(({ domain: d }, i) => d.sections.map(s => {
    const groups = (s.groups || []).map(g => [g.id, g.title]);
    const gIndex = new Map(groups.map(([id], k) => [id, k]));
    const en = {};
    s.options.forEach((o, k) => { if (o.en.length <= 48 && foldText(o.en) !== foldText(o.es)) en[k] = o.en; });
    return [i, s.id, s.title, s.options.map(o => o.es), s.options.map(o => (o.group && gIndex.has(o.group) ? gIndex.get(o.group) : -1)), groups, en];
  })),
};
write('data/search-index.json', JSON.stringify(searchIndex));
console.log(`buscador: ${searchIndex.o.reduce((n, s) => n + s[3].length, 0)} etiquetas indexadas`);

/* ---------- índice del importador de prompts (se carga bajo demanda desde el constructor) ---------- */
// { d: [id de dominio], l: [«lead» de cada dominio o ''], s: [[índice de dominio, id de sección, 1 si es de elección única]],
//   o: [[índice de sección, id de opción, texto en inglés corto, texto largo (solo si existe)]] }
// Permite convertir un prompt pegado (de esta web o ajeno) en selección: coincide frases de las opciones con su texto en inglés.
import { buildImportIndexData } from './lib/import-index.mjs';
write('data/import-index.json', JSON.stringify(buildImportIndexData(all.map(x => x.domain))));
console.log('importador: índice de frases generado');

/* ---------- páginas, sitemap, robots y manifiesto ---------- */
await buildPages({ domains, totals, all, write });
