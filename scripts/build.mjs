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
    id: d.id, slug: d.slug, role: d.role, order: d.order,
    title: d.meta.title, short: d.meta.short || d.meta.title, kicker: d.meta.kicker || '', summary: d.meta.summary,
    sections: d.sections.length,
    options: d.sections.reduce((n, s) => n + s.options.length, 0),
    presets: presets ? presets.length : 0,
  });
}
const totals = {
  domains: domains.length,
  sections: domains.reduce((n, d) => n + d.sections, 0),
  options: domains.reduce((n, d) => n + d.options, 0),
  presets: presetCount,
};
write('data/catalog.js', `// GENERADO por scripts/build.mjs a partir de data/domains/*.js — no editar a mano.\nexport default ${JSON.stringify({ totals, domains }, null, 2)};\n`);
console.log(`catálogo: ${totals.domains} dominios · ${totals.sections} secciones · ${totals.options} opciones · ${totals.presets} ideas`);

/* ---------- páginas, sitemap, robots y manifiesto ---------- */
await buildPages({ domains, totals, all, write });
