import test from 'node:test';
import assert from 'node:assert/strict';
import { wordDiff } from '../assets/js/core/diff.js';
import { manual } from '../assets/js/core/manual.js';

test('wordDiff marca lo quitado y lo añadido por palabras', () => {
  const d = wordDiff('a red car at night', 'a blue car at dawn');
  const del = d.filter(x => x.k === 'del').map(x => x.t.trim()).join(' ');
  const add = d.filter(x => x.k === 'add').map(x => x.t.trim()).join(' ');
  assert.equal(del, 'red night');
  assert.equal(add, 'blue dawn');
  assert.equal(d.filter(x => x.k !== 'add').map(x => x.t).join(''), 'a red car at night');
  assert.equal(d.filter(x => x.k !== 'del').map(x => x.t).join(''), 'a blue car at dawn');
});

test('wordDiff de textos iguales no tiene cambios', () => {
  assert.deepEqual(wordDiff('same text', 'same text'), [{ t: 'same text', k: 'same' }]);
});

test('manual: solo vale para el prompt generado del que partió', () => {
  manual.set('base', 'editado');
  assert.equal(manual.resolve('base'), 'editado');
  assert.equal(manual.resolve('otra base'), 'otra base');
  assert.equal(manual.for('otra base'), null);
  manual.set('base', 'base'); // igual al generado = sin edición
  assert.equal(manual.for('base'), null);
});

import { seededRng } from '../assets/js/core/util.js';
import { loadAllDomains } from '../scripts/lib/domains.mjs';
import { randomSelection } from '../assets/js/core/random.js';

test('seededRng: misma semilla, misma secuencia; semillas distintas, distinta', () => {
  const a = seededRng('daily-2026-11-24'), b = seededRng('daily-2026-11-24'), c = seededRng('daily-2026-11-25');
  const sa = Array.from({ length: 5 }, a), sb = Array.from({ length: 5 }, b), sc = Array.from({ length: 5 }, c);
  assert.deepEqual(sa, sb);
  assert.notDeepEqual(sa, sc);
  assert.ok(sa.every(x => x >= 0 && x < 1));
});

test('el prompt del día es reproducible: la misma semilla da la misma selección', async () => {
  const domains = Object.fromEntries((await loadAllDomains()).map(x => [x.domain.id, x.domain]));
  const st = { v: 1, sel: {}, locks: {}, adult: false };
  const pick = seed => randomSelection([domains.woman, domains.scenarios], st, seededRng(seed), 12);
  assert.deepEqual(pick('daily-x'), pick('daily-x'));
  assert.notDeepEqual(pick('daily-x'), pick('daily-y'));
});
