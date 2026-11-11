import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT, loadAllDomains, loadPresetsFor } from '../scripts/lib/domains.mjs';
import { validateDomain, validatePresets } from '../assets/js/core/schema.js';
import catalog from '../data/catalog.js';
import { SLOT_IDS } from '../data/taxonomy.js';

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
// 1) Nunca, en ningún generador: contenido explícito, desnudez, pornografía o autolesión.
const BLOCKED_PROMPT = /(thong|g-string|panties|boobs?|busty|nipples?|topless|naked|nudity|explicit|sensual|erotic|sexy|porn\w*|nsfw|suicid\w*)/i;
// «desnudo/desnuda» se omite a propósito: en español significa también «sobrio/vacío» (paredes desnudas);
// la desnudez se vigila en los prompts en inglés (naked, nudity, topless…).
const BLOCKED_LABEL = /(expl[ií]cit|er[oó]tic|porn|nsfw|suicid)/i;
// 2) Moda íntima, busto y látex: solo en los generadores de personajes ADULTOS (mujer y personaje avanzado, 18+).
//    Fuera de ellos (animados, rostros, fotografía, escenas…) el sujeto podría ser joven o ambiguo.
const ADULT_ONLY_PROMPT = /(lingerie|boudoir|garters?|bralette|balconette|bustier|cleavage|bust|latex|chemise|babydoll|negligee|teddy|lace set|body harness|open-cup)/i;
const ADULT_ONLY_LABEL = /(lencer[ií]a|busto|pecho|boudoir)/i;
const ADULT_DOMAINS = new Set(['woman', 'girl']);

test('política de contenido: ningún prompt contiene términos explícitos', () => {
  const bad = [];
  for (const { domain: d } of all) for (const s of d.sections) for (const o of s.options) {
    if (BLOCKED_PROMPT.test([o.en, o.rich || '', o.name || ''].join(' '))) bad.push(`${d.id}/${s.id}/${o.id}`);
    if (BLOCKED_LABEL.test(o.es)) bad.push(`${d.id}/${s.id}/${o.id} [es]`);
  }
  assert.deepEqual(bad, [], 'contenido que no debe publicarse; revisa docs/CONTENT-POLICY.md');
});

test('política de contenido: la moda íntima y el busto solo existen en los generadores de adultos', () => {
  const bad = [];
  for (const { domain: d } of all) {
    if (ADULT_DOMAINS.has(d.id)) continue;
    for (const s of d.sections) for (const o of s.options) {
      if (ADULT_ONLY_PROMPT.test([o.en, o.rich || '', o.name || ''].join(' '))) bad.push(`${d.id}/${s.id}/${o.id}`);
      if (/^(lencer[ií]a|boudoir)/i.test(o.es)) bad.push(`${d.id}/${s.id}/${o.id} [es]`);
    }
  }
  assert.deepEqual(bad, [], 'solo woman y girl (personajes adultos) admiten este contenido');
});

test('los generadores de adultos declaran la edad mínima de 18 años', () => {
  const youngest = d => d.sections.find(s => /edad|age/i.test(s.id)).options.map(o => o.en).join(' | ');
  for (const id of ADULT_DOMAINS) {
    const d = all.find(x => x.domain.id === id).domain;
    assert.doesNotMatch(youngest(d), /(1[0-7]|teen\w*|child\w*|girl|minor)/i, `${id}: edades no adultas`);
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
