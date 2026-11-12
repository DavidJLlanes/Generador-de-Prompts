/**
 * Valida todos los dominios y presets de data/. Sale con código 1 si hay errores.
 * Uso: npm run validate
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import { ROOT, loadAllDomains, loadPresetsFor } from './lib/domains.mjs';
import { validateDomain, validatePresets } from '../assets/js/core/schema.js';
import { FAMILIES } from '../data/families.js';

const all = await loadAllDomains();
let errors = [];
const warnings = [];

const ids = new Map(), slugs = new Map();
for (const { file, domain: d } of all) {
  if (file !== `${d.id}.js`) errors.push(`${file}: el nombre del archivo debe ser «${d.id}.js»`);
  if (ids.has(d.id)) errors.push(`id duplicado «${d.id}»`);
  if (slugs.has(d.slug)) errors.push(`slug duplicado «${d.slug}»`);
  ids.set(d.id, true); slugs.set(d.slug, true);
  const r = validateDomain(d);
  errors.push(...r.errors);
  warnings.push(...r.warnings);
  for (const s of d.sections) for (const o of s.options) {
    if (o.thumb && !existsSync(path.join(ROOT, o.thumb))) errors.push(`${d.id}/${s.id}/${o.id}: falta la imagen ${o.thumb}`);
  }
  const presets = await loadPresetsFor(d.id);
  if (presets) errors.push(...validatePresets(presets, d));
}

const secs = all.reduce((n, x) => n + x.domain.sections.length, 0);
const opts = all.reduce((n, x) => n + x.domain.sections.reduce((m, s) => m + s.options.length, 0), 0);
console.log(`Dominios: ${all.length} · Secciones: ${secs} · Opciones: ${opts}`);

/* ---------- Familias de secciones (data/families.js): un concepto, una elección ---------- */
const valid = new Set(all.flatMap(x => x.domain.sections.map(s => `${x.domain.id}/${s.id}`)));
const inFamily = new Map();
let familySections = 0;
for (const f of FAMILIES) {
  if (!f.sections.every(k => valid.has(k))) errors.push(`familias › «${f.id}»: ${f.sections.filter(k => !valid.has(k)).join(', ')}`);
  for (const k of f.sections) {
    if (inFamily.has(k)) errors.push(`familias › «${k}» está en «${inFamily.get(k)}» y en «${f.id}»`);
    inFamily.set(k, f.id);
    familySections++;
  }
}
console.log(`Familias: ${FAMILIES.length} · secciones agrupadas: ${familySections}`);

if (warnings.length) {
  console.log(`\n${warnings.length} aviso(s) (no bloquean):`);
  warnings.slice(0, 15).forEach(w => console.log('  · ' + w));
  if (warnings.length > 15) console.log(`  … y ${warnings.length - 15} más`);
}
if (errors.length) {
  console.error(`\n✖ ${errors.length} error(es):`);
  errors.slice(0, 40).forEach(e => console.error('  ✖ ' + e));
  if (errors.length > 40) console.error(`  … y ${errors.length - 40} más`);
  process.exit(1);
}
console.log('\n✔ Datos válidos');
