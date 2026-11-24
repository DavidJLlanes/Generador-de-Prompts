import test from 'node:test';
import assert from 'node:assert/strict';
import { loadAllDomains } from '../scripts/lib/domains.mjs';
import { randomSelection } from '../assets/js/core/random.js';
import { toneOf, moodFrom } from '../assets/js/core/tone.js';

const domains = Object.fromEntries((await loadAllDomains()).map(x => [x.domain.id, x.domain]));
const state = { v: 1, sel: {}, locks: {}, adult: false };

test('toneOf: etiquetas cortas con tono; largas y personajes con nombre, neutras', () => {
  assert.equal(toneOf('soft gentle smile'), 1);
  assert.equal(toneOf('fierce angry expression'), -1);
  assert.equal(toneOf('calm neutral expression'), 0);
  assert.equal(toneOf('Nezuko from Demon Slayer, long black hair, bamboo muzzle'), 0);
  assert.equal(toneOf('cute fierce'), 0, 'tonos mezclados = ambiguo');
  assert.equal(toneOf('x'.repeat(100) + ' sinister'), 0);
});

test('moodFrom reparte según los pesos', () => {
  assert.equal(moodFrom(0), 'soft');
  assert.equal(moodFrom(0.5), 'neutral');
  assert.equal(moodFrom(0.95), 'intense');
});

function toneOfSelection(sel) {
  const tones = [];
  for (const [did, secs] of Object.entries(sel)) for (const [sid, ids] of Object.entries(secs)) {
    const s = domains[did].sections.find(x => x.id === sid);
    for (const id of ids) tones.push(toneOf(s.options.find(o => o.id === id).en));
  }
  return tones;
}

test('con ánimo suave nunca sale una opción intensa (y al revés), en muchos dominios', () => {
  const ids = ['animals', 'woman', 'man', 'creatures', 'faces', 'weather'].filter(i => domains[i]);
  for (const mood of ['soft', 'intense']) {
    for (let i = 0; i < 60; i++) {
      const sel = randomSelection(ids.map(x => domains[x]), state, Math.random, 12, { mood });
      for (const t of toneOfSelection(sel)) assert.ok(mood === 'soft' ? t >= 0 : t <= 0, `ánimo ${mood} con tono ${t}`);
    }
  }
});

test('en ánimo neutro una tirada no mezcla tonos opuestos', () => {
  const ids = ['animals', 'woman', 'faces', 'creatures'].filter(i => domains[i]);
  for (let i = 0; i < 120; i++) {
    const sel = randomSelection(ids.map(x => domains[x]), state, Math.random, 12, { mood: 'neutral' });
    const tones = toneOfSelection(sel);
    assert.ok(!(tones.includes(1) && tones.includes(-1)), 'mezcla suave + intenso');
  }
});
