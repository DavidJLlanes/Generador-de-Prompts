import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT, loadAllDomains, loadPresetsFor } from '../scripts/lib/domains.mjs';
import { validateDomain, validatePresets } from '../assets/js/core/schema.js';
import catalog from '../data/catalog.js';
import { SLOT_IDS } from '../data/taxonomy.js';
import { effectiveTags } from '../scripts/lib/tags.mjs';

const all = await loadAllDomains();

test('todos los dominios cumplen el esquema (sin errores)', () => {
  for (const { domain } of all) {
    const { errors } = validateDomain(domain);
    assert.deepEqual(errors, [], `${domain.id}: ${errors.slice(0, 3).join(' | ')}`);
  }
});

test('los presets apuntan a opciones que existen', async () => {
  for (const { domain } of all) {
    const presets = await loadPresetsFor(domain.id);
    if (presets) assert.deepEqual(validatePresets(presets, domain), []);
  }
});

test('el catálogo generado está al día con los datos (ejecuta «npm run build» si falla)', () => {
  assert.equal(catalog.domains.length, all.length);
  for (const { domain: d } of all) {
    const c = catalog.domains.find(x => x.id === d.id);
    assert.ok(c, `falta ${d.id} en el catálogo`);
    assert.equal(c.options, d.sections.reduce((n, s) => n + s.options.length, 0), `${d.id}: nº de opciones desactualizado`);
    assert.equal(c.sections, d.sections.length, `${d.id}: nº de secciones desactualizado`);
  }
});

test('cada generador tiene su página y aparece en el sitemap', () => {
  const sitemap = readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  for (const { domain: d } of all) {
    assert.ok(existsSync(path.join(ROOT, 'generadores', d.slug, 'index.html')), `falta la página de ${d.slug}`);
    assert.ok(sitemap.includes(`/generadores/${d.slug}/`), `${d.slug} no está en el sitemap`);
  }
});

test('los roles de los dominios son ranuras válidas y hay al menos un dominio por ranura', () => {
  for (const slot of SLOT_IDS) assert.ok(all.some(x => x.domain.role === slot), `ninguna ranura «${slot}»`);
});

/* ---------- Política de contenido (ver docs/CONTENT-POLICY.md) ---------- */
const TAGS = effectiveTags(all);
const tagsOf = (d, s, o) => TAGS.get(`${d.id}/${s.id}/${o.id}`) || new Set();
// 1) Nunca, en ningún generador ni con ninguna etiqueta: contenido explícito, desnudez, pornografía o autolesión.
const HARD_BLOCKED = /\b(boobs?|busty|nipples?|topless|naked|nudity|explicit|porn\w*|nsfw|suicid\w*)\b/i;
const HARD_BLOCKED_LABEL = /(expl[ií]cit|porn|nsfw|suicid)/i;
// «desnudo/desnuda» se omite a propósito: en español significa también «sobrio/vacío» (paredes desnudas);
// la desnudez se vigila en los prompts en inglés (naked, nudity, topless…).
// 2) Moda íntima, busto, látex y tono sensual: solo en opciones con la etiqueta «adult-only», que las reglas de
//    data/exclusions.js bloquean ante menores y personajes de aspecto joven.
const ADULT_ONLY_PROMPT = /\b(lingerie|boudoir|garters?|bralette|balconette|bustier|cleavage|bust(?! shot)|latex|chemise|babydoll|negligee|teddy|lace set|body harness|open-cup|thong|g-string|panties|sensual|erotic|sexy)\b/i;
const ADULT_ONLY_LABEL = /(lencer[ií]a|er[oó]tic|boudoir|sensual)/i;

test('política de contenido: ningún prompt contiene términos explícitos', () => {
  const bad = [];
  for (const { domain: d } of all) for (const s of d.sections) for (const o of s.options) {
    if (HARD_BLOCKED.test([o.en, o.rich || '', o.name || ''].join(' '))) bad.push(`${d.id}/${s.id}/${o.id}`);
    if (HARD_BLOCKED_LABEL.test(o.es)) bad.push(`${d.id}/${s.id}/${o.id} [es]`);
  }
  assert.deepEqual(bad, [], 'contenido que no debe publicarse; revisa docs/CONTENT-POLICY.md');
});

test('política de contenido: la moda íntima, el busto y lo sensual llevan la etiqueta «adult-only»', () => {
  const bad = [];
  for (const { domain: d } of all) for (const s of d.sections) for (const o of s.options) {
    const hit = ADULT_ONLY_PROMPT.test([o.en, o.rich || '', o.name || ''].join(' ')) || ADULT_ONLY_LABEL.test(o.es);
    if (hit && !tagsOf(d, s, o).has('adult-only')) bad.push(`${d.id}/${s.id}/${o.id}`);
  }
  assert.deepEqual(bad, [], 'falta la etiqueta adult-only (en tags o en TAGGING de data/exclusions.js)');
});

test('el contenido «adult-only» se bloquea ante cualquier menor o personaje de aspecto joven', () => {
  const adult = [], young = [];
  for (const { domain: d } of all) for (const s of d.sections) for (const o of s.options) {
    const t = tagsOf(d, s, o);
    if (t.has('adult-only')) adult.push(`${d.id}/${s.id}/${o.id}`);
    if (t.has('minor') || t.has('youthful')) young.push(`${d.id}/${s.id}/${o.id}`);
  }
  assert.ok(adult.length > 100, 'debe haber contenido adult-only: ' + adult.length);
  assert.ok(young.length > 200, 'debe haber menores / aspecto joven (incluye personajes animados no verificados): ' + young.length);
  assert.ok(young.some(k => k.startsWith('faces/edad/child')) && young.some(k => k.startsWith('animated/version/')), 'cubre rostros y versiones animadas');
});

test('los generadores de adultos declaran la edad mínima de 18 años', () => {
  const youngest = d => d.sections.find(s => /edad|age/i.test(s.id)).options.map(o => o.en).join(' | ');
  for (const id of ['woman', 'girl']) {
    const d = all.find(x => x.domain.id === id).domain;
    assert.doesNotMatch(youngest(d), /\b(1[0-7]|teen\w*|child\w*|girl|minor)\b/i, `${id}: edades no adultas`);
  }
});

test('los prompts están en inglés: las palabras españolas comunes no aparecen en en/rich', () => {
  // Se excluyen los artículos (el, los, las) porque coinciden con nombres propios como «Las Médulas».
  const SPANISH = /\b(luz|cielo|noche|agua|piedra|madera|sobre|entre|bajo|con una?|del|pero|donde)\b/i;
  const bad = [];
  for (const { domain: d } of all) for (const s of d.sections) for (const o of s.options) {
    for (const f of ['en', 'rich']) if (o[f] && SPANISH.test(o[f])) bad.push(`${d.id}/${s.id}/${o.id} [${f}]: ${o[f].slice(0, 50)}`);
  }
  assert.equal(bad.length, 0, `${bad.length} posibles textos en español en campos de prompt:\n${bad.slice(0, 8).join('\n')}`);
});
