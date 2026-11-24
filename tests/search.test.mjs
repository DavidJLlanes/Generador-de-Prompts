import test from 'node:test';
import assert from 'node:assert/strict';
import { matchesAll, fold } from '../assets/js/core/util.js';

const m = (text, q) => matchesAll(fold(text), q);

test('busca por inicio de palabra, no por trozos dentro de otra', () => {
  assert.ok(m('Ferrari 250 GT', 'ferr'));
  assert.ok(!m('Vestido de terciopelo rojo', 'pelo'));
  assert.ok(m('Tuning de época · hot-rod (hasta 1945)', 'hot-rod'));
  assert.ok(m('Ford Mustang · 1964', 'mustang 1964'));
});

test('admite género y plural', () => {
  assert.ok(m('Pelirrojo cobre', 'pelirroja'));
  assert.ok(m('Pelirrojo cobre', 'pelirrojas'));
  assert.ok(m('Dragón clásico', 'dragones'));
  assert.ok(m('Lluvia ligera', 'lluvias'));
});

test('sin acentos y en cualquier orden', () => {
  assert.ok(m('Escena fotográfica', 'FOTOGRAFICA escena'));
  assert.ok(!m('Escena fotográfica', 'escena nocturna'));
});
