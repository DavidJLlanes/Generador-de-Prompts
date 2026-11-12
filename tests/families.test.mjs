/** Familias de secciones: un concepto, una elección (data/families.js). */
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadAllDomains } from '../scripts/lib/domains.mjs';
import { FAMILIES } from '../data/families.js';
import { familyOf, familySiblings, clearFamily, pruneFamilies } from '../assets/js/core/families.js';
import { enforce } from '../assets/js/core/exclusions.js';
import { compose } from '../assets/js/core/composer.js';
import { randomSelection } from '../assets/js/core/random.js';
import { store } from '../assets/js/core/store.js';

const all = await loadAllDomains();
const domains = Object.fromEntries(all.map(x => [x.domain.id, x.domain]));
const sectionIds = new Map(all.map(x => [x.domain.id, new Set(x.domain.sections.map(s => s.id))]));
const base = (sel = {}) => ({ v: 1, sel, locks: {}, detail: 'rich', boost: false, aspect: '', format: 'text', custom: '' });

test('el mapa de familias es coherente: secciones existentes, sin duplicados y con etiqueta', () => {
  const seen = new Map();
  const bad = [];
  for (const f of FAMILIES) {
    assert.ok(f.id && /^[a-z0-9-]+$/.test(f.id), `id de familia no válido: ${f.id}`);
    assert.ok(f.label && typeof f.label === 'string', `familia sin etiqueta: ${f.id}`);
    assert.ok(Array.isArray(f.sections) && f.sections.length > 1, `familia con menos de dos secciones: ${f.id}`);
    for (const key of f.sections) {
      const [d, s] = key.split('/');
      assert.ok(sectionIds.get(d)?.has(s), `familia ${f.id}: sección inexistente «${key}»`);
      if (seen.has(key)) bad.push(`${key} está en «${seen.get(key)}» y en «${f.id}»`);
      seen.set(key, f.id);
    }
  }
  assert.deepEqual(bad, [], 'una sección solo puede estar en una familia');
});

test('las familias cubren lo que se solapa entre Mujer y los generadores especializados', () => {
  for (const [d, s] of [['woman', 'colorpelo'], ['woman', 'ropa'], ['woman', 'peinado'], ['faces', 'ojos-color'], ['poses', 'poses'], ['photo', 'lighting']]) {
    assert.ok(familyOf(d, s), `«${d}/${s}» debería estar en una familia`);
  }
  assert.deepEqual(familySiblings('woman', 'colorpelo').map(x => `${x.domain}/${x.section}`).sort(), ['girl/hair-color', 'hairstyles/color-principal', 'man/colorpelo'].sort());
  assert.deepEqual(familySiblings('photo', 'composition').length, 2);
  assert.equal(familyOf('cars', 'marca'), null, 'lo que no se solapa no entra en ninguna familia');
});

test('elegir en una sección quita las hermanas de la misma familia, estén donde estén', () => {
  store.clearAll();
  const hair = domains.hairstyles;
  const sec = hair.sections.find(s => s.id === 'color-principal');
  store.toggleOption('hairstyles', sec, sec.options[0].id, hair);
  assert.equal(store.selectedIds('hairstyles', 'color-principal').length, 1);

  const woman = domains.woman;
  const wsec = woman.sections.find(s => s.id === 'colorpelo');
  const cleared = store.toggleOption('woman', wsec, wsec.options[0].id, woman);
  assert.deepEqual(store.selectedIds('hairstyles', 'color-principal'), [], 'el color de pelo de Peinados se ha quitado');
  assert.equal(store.selectedIds('woman', 'colorpelo').length, 1, 'gana la última elección');
  assert.equal(cleared.length, 1);
  assert.equal(cleared[0].kind, 'family');
  assert.equal(cleared[0].domain, 'hairstyles');
  assert.equal(cleared[0].label, 'color del pelo');
  assert.equal(cleared[0].title, null, 'de otro generador no se conoce el título de la sección');

  // Lo de otra familia (el peinado) no se toca
  store.toggleOption('woman', woman.sections.find(s => s.id === 'peinado'), woman.sections.find(s => s.id === 'peinado').options[0].id, woman);
  assert.equal(store.selectedIds('woman', 'colorpelo').length, 1);
  store.clearAll();
});

test('quitar una opción no arrastra a su familia', () => {
  store.clearAll();
  const woman = domains.woman;
  const sec = woman.sections.find(s => s.id === 'colorpelo');
  store.toggleOption('woman', sec, sec.options[0].id, woman);
  const out = store.toggleOption('woman', sec, sec.options[0].id, woman);
  assert.deepEqual(out, []);
  assert.equal(store.selectedIds('woman', 'colorpelo').length, 0);
  store.clearAll();
});

test('las selecciones ya hechas (enlaces, guardados, recetas) se podan al entrar', () => {
  const womanOpt = domains.woman.sections.find(s => s.id === 'colorpelo').options[0].id;
  const hairOpt = domains.hairstyles.sections.find(s => s.id === 'color-principal').options[0].id;
  const dup = { woman: { colorpelo: [womanOpt] }, hairstyles: { 'color-principal': [hairOpt] } };
  const { sel, removed } = enforce(dup);
  assert.equal(sel.woman.colorpelo.length, 1);
  assert.equal(sel.hairstyles, undefined, 'la segunda sección de la familia se descarta');
  assert.ok(removed.some(r => r.rule.startsWith('familia:')));

  const parts = compose(domains, base(dup)).parts;
  assert.equal(parts.filter(p => /hair/.test(p.text)).length, 1, 'el prompt no repite el pelo: ' + parts.map(p => p.text).join(' | '));
});

test('«Aleatorio» con varios generadores no deja dos secciones de la misma familia', () => {
  for (const seed of [0.05, 0.35, 0.6, 0.85]) {
    const doms = [domains.woman, domains.hairstyles, domains.faces, domains.poses, domains.photo, domains.locations];
    const sel = randomSelection(doms, base(), () => seed, 12);
    const seen = new Set();
    for (const [d, secs] of Object.entries(sel)) for (const s of Object.keys(secs)) {
      const f = familyOf(d, s);
      if (!f) continue;
      assert.ok(!seen.has(f.id), `«${d}/${s}» repite la familia ${f.id} (semilla ${seed})`);
      seen.add(f.id);
    }
  }
});
