import test from 'node:test';
import assert from 'node:assert/strict';
import { loadAllDomains, loadPresetsFor } from '../scripts/lib/domains.mjs';
import { compose } from '../assets/js/core/composer.js';
import { renderFormat } from '../assets/js/core/formats/index.js';
import { mjRatio } from '../assets/js/core/formats/midjourney.js';
import { randomSelection } from '../assets/js/core/random.js';
import { conflictsOf, resolveConflicts } from '../assets/js/core/conflicts.js';
import { encodeState, decodeState } from '../assets/js/core/url-state.js';
import { store } from '../assets/js/core/store.js';
import * as lib from '../assets/js/core/library.js';

const domains = Object.fromEntries((await loadAllDomains()).map(x => [x.domain.id, x.domain]));
const sec = (d, id) => domains[d].sections.find(s => s.id === id);
const opt = (d, s, i = 0) => sec(d, s).options[i];
const base = (sel = {}, extra = {}) => ({ v: 1, sel, locks: {}, detail: 'rich', boost: false, aspect: '', format: 'text', custom: '', ...extra });

test('el texto libre viaja en UTF-8 dentro del enlace compartido', () => {
  const text = 'una sombrilla roja — ñandú 日本 🌧';
  const back = decodeState(encodeState({ ...base({ woman: { edad: ['a'] } }), custom: text }));
  assert.equal(back.custom, text);
});

test('texto libre: genera prompt por sí solo, va al final y en «natural» queda aparte', () => {
  const only = compose(domains, base({}, { custom: '  a small red umbrella  ' }));
  assert.equal(only.empty, false);
  assert.match(renderFormat('text', only, base()).text, /a small red umbrella/i);
  const state = base({ woman: { edad: [opt('woman', 'edad').id] } }, { custom: 'cinematic fog' });
  const c = compose(domains, state);
  assert.equal(c.parts.at(-1).custom, true, 'el texto libre es la última pieza');
  const nat = renderFormat('natural', c, state).text;
  assert.match(nat, /^Additional details: cinematic fog\.$/m); // el texto del usuario se respeta tal cual
  assert.doesNotMatch(nat.split('\n').find(l => l.startsWith('Style and technique')) || '', /cinematic fog/i, 'no se repite dentro de la técnica');
  assert.equal(compose(domains, base({}, { custom: '   ' })).empty, true, 'solo espacios no cuenta como contenido');
});

test('Midjourney: proporción entera y --no al final', () => {
  assert.equal(mjRatio('9:19.5'), '6:13'); // 18:39 reducida a su mínima expresión
  assert.equal(mjRatio('16:9'), '16:9');
  assert.equal(mjRatio('1:1'), '1:1');
  assert.equal(mjRatio(''), '');
  const sel = { woman: { edad: [opt('woman', 'edad').id] } };
  const state = base(sel, { boost: true, aspect: '9:19.5' });
  const text = renderFormat('midjourney', compose(domains, state), state).text;
  assert.match(text, /^a woman, /);
  assert.match(text, / --ar 6:13 --no .+$/);
  assert.doesNotMatch(renderFormat('midjourney', compose(domains, base(sel)), base()).text, /--ar/);
});

test('conflictos: elegir una idea vacía motivo/ambiente/detalle y se avisa de qué se quitó', () => {
  const sc = domains.scenarios;
  assert.deepEqual(conflictsOf(sc, 'ideas').sort(), ['ambiente', 'detalle', 'motivo']);
  assert.deepEqual(conflictsOf(sc, 'motivo'), ['ideas']);
  assert.deepEqual(conflictsOf(sc, 'estilo'), [], 'el estilo sí convive con una idea');
  assert.deepEqual(conflictsOf(domains.cars, 'escena-foto'), ['escena-ilustracion']);
  store.clearAll();
  store.toggleOption('scenarios', sec('scenarios', 'motivo'), opt('scenarios', 'motivo').id, sc);
  store.toggleOption('scenarios', sec('scenarios', 'estilo'), opt('scenarios', 'estilo').id, sc);
  const cleared = store.toggleOption('scenarios', sec('scenarios', 'ideas'), opt('scenarios', 'ideas').id, sc);
  assert.deepEqual(cleared.map(x => x.section), ['motivo']);
  assert.ok(cleared.every(x => x.kind === 'conflict'));
  assert.deepEqual(store.selectedIds('scenarios', 'motivo'), []);
  assert.equal(store.selectedIds('scenarios', 'estilo').length, 1, 'lo que no choca se conserva');
  assert.equal(store.selectedIds('scenarios', 'ideas').length, 1);
  store.clearAll();
});

test('conflictos en el aleatorio: nunca quedan los dos lados y se respetan los bloqueos', () => {
  const sc = domains.scenarios;
  const both = () => ({ ideas: ['i'], motivo: ['m'], ambiente: ['a'] });
  for (const r of [0.1, 0.9]) {
    const out = resolveConflicts(sc, both(), { rng: () => r });
    assert.ok(!(out.ideas && (out.motivo || out.ambiente)));
  }
  const locked = resolveConflicts(sc, both(), { locked: { ideas: true }, rng: () => 0.1 });
  assert.ok(locked.ideas && !locked.motivo && !locked.ambiente, 'si «ideas» está bloqueada, se quitan las demás');
  const rng = (() => { let n = 11; return () => ((n = (n * 16807) % 2147483647) / 2147483647); })();
  for (let i = 0; i < 60; i++) {
    const out = randomSelection([sc], base(), rng).scenarios || {};
    assert.ok(!(out.ideas && (out.motivo || out.ambiente || out.detalle)), 'el aleatorio no mezcla idea y piezas');
  }
});

test('biblioteca: guardar, historial sin duplicados, exportar e importar sin repetir', () => {
  const state = base({ woman: { edad: ['x'] } }, { custom: 'hola' });
  assert.equal(lib.saveItem('vacío', base()), null, 'no se guarda un prompt vacío');
  const it = lib.saveItem('  Mi retrato  ', state);
  assert.equal(it.name, 'Mi retrato');
  lib.recordHistory(state); lib.recordHistory(state);
  assert.equal(lib.loadLibrary().history.length, 1, 'copias idénticas seguidas se anotan una vez');
  const json = lib.exportLibrary();
  assert.equal(JSON.parse(json).saved.length, 1);
  assert.deepEqual(lib.importLibrary(json), { added: 0, skipped: 1 }, 'importar lo mismo no duplica');
  const other = JSON.stringify({ v: 1, saved: [{ name: 'Otro', ts: 1, snap: { sel: { weather: { 'tipo-clima': ['clear-sunny'] } }, custom: '' } }, { name: 'roto' }], history: [] });
  assert.deepEqual(lib.importLibrary(other), { added: 1, skipped: 1 }, 'importa lo válido y descarta lo roto');
  assert.throws(() => lib.importLibrary('esto no es json'), /JSON válido/);
  assert.throws(() => lib.importLibrary(JSON.stringify({ hola: 1 })), /exportación/);
  lib.deleteItem('saved', it.id);
  assert.equal(lib.loadLibrary().saved.length, 1);
  lib.clearHistory();
  assert.equal(lib.loadLibrary().history.length, 0);
  const flood = JSON.stringify({ v: 1, saved: Array.from({ length: 300 }, (_, i) => ({ name: 'n' + i, snap: { sel: { d: { s: ['o' + i] } } } })), history: [] });
  lib.importLibrary(flood);
  assert.ok(lib.loadLibrary().saved.length <= lib.LIMITS.saved, 'se respeta el máximo de guardados');
});

test('store: loadSnapshot restaura selección, ajustes y texto libre, y conserva el formato', () => {
  store.clearAll(); store.set({ format: 'sd' });
  store.loadSnapshot({ sel: { woman: { edad: ['a'] } }, detail: 'short', boost: false, aspect: '1:1', custom: 'hola' });
  const s = store.get();
  assert.deepEqual([s.detail, s.boost, s.aspect, s.custom, s.format], ['short', false, '1:1', 'hola', 'sd']);
  assert.equal(store.totalItems(), 2, 'una opción + texto libre');
  store.clearAll();
  assert.equal(store.get().custom, '', 'vaciar también limpia el texto libre');
  store.set({ format: 'text' });
});

test('recetas: cada una compone un prompt completo y nunca incluye contenido retenido', async () => {
  const BLOCK = /\b(latex|garters?|chemise|lingerie|babydoll|negligee|bralette|thong|bust|breasts?)\b/i;
  let total = 0;
  for (const id of ['woman', 'man', 'creatures', 'animals', 'vehicles', 'landscape', 'interior', 'space', 'magic', 'animated', 'girl']) {
    const presets = await loadPresetsFor(id);
    assert.ok(presets && presets.length >= 5, id + ' debería tener recetas');
    assert.equal(domains[id].meta.presetsLabel, 'recetas');
    for (const p of presets) {
      const state = base({ [id]: p.sel });
      const text = renderFormat('text', compose(domains, state), state).text;
      assert.ok(text.length > 150, `${id} · ${p.es}: prompt demasiado corto`);
      assert.doesNotMatch(text, BLOCK, `${id} · ${p.es}`);
      total++;
    }
  }
  assert.ok(total >= 66, 'hay recetas suficientes: ' + total);
});

test('descripciones largas de ropa: se integran en la frase del sujeto, con su «wearing»', () => {
  const cloth = sec('woman', 'ropa').options.filter(o => o.rich);
  assert.ok(cloth.length > 100, 'la ropa de mujer tiene descripciones largas');
  assert.ok(cloth.filter(o => /^wearing\b/i.test(o.en)).every(o => /^wearing\b/i.test(o.rich)), 'conservan el verbo «wearing»');
  const o = cloth.find(x => x.rich.length > 130);
  const state = base({ woman: { edad: [opt('woman', 'edad').id], ropa: [o.id] } });
  const first = renderFormat('text', compose(domains, state), state).text.split(/\. /)[0];
  assert.ok(first.includes(o.rich), 'la ropa va en la primera oración, unida por comas, no como párrafo aparte');
  const short = { ...state, detail: 'short' };
  const shortText = renderFormat('text', compose(domains, short), short).text;
  assert.ok(shortText.includes(o.en) && !shortText.includes(o.rich), 'en modo conciso se usa el texto corto');
});
