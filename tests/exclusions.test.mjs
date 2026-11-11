/** Exclusiones entre opciones: menores/adultos (seguridad), día/noche, frío/calor y género del rostro. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadAllDomains, loadPresetsFor, ROOT } from '../scripts/lib/domains.mjs';
import { effectiveTags, tagIndexSource } from '../scripts/lib/tags.mjs';
import { reasonBlocked, enforce, blockedChecker, GATE_WHY } from '../assets/js/core/exclusions.js';
import { compose } from '../assets/js/core/composer.js';
import { renderFormat } from '../assets/js/core/formats/index.js';
import { randomSelection } from '../assets/js/core/random.js';
import { store } from '../assets/js/core/store.js';

const all = await loadAllDomains();
const domains = Object.fromEntries(all.map(x => [x.domain.id, x.domain]));
const TAGS = effectiveTags(all);
const base = (sel = {}) => ({ v: 1, sel, locks: {}, detail: 'rich', boost: false, aspect: '', format: 'text', custom: '' });
const optBy = (d, s, pred) => domains[d].sections.find(x => x.id === s).options.find(pred);
const byEs = (d, s, es) => optBy(d, s, o => o.es === es);
const textOf = sel => renderFormat('text', compose(domains, base(sel)), base(sel)).text;

const child = ['faces', 'edad', 'child-3-7-years'];
const teen = ['animated', 'version', 'as-a-teenage-version-of-herself'];
const lingerie = ['woman', 'ropa', byEs('woman', 'ropa', 'Lencería de satén').id];
const sel = (...refs) => refs.reduce((acc, [d, s, o]) => { (acc[d] ||= {})[s] = [o]; return acc; }, {});

test('el índice de etiquetas generado está al día (ejecuta «npm run build» si falla)', () => {
  assert.equal(readFileSync(`${ROOT}/data/tag-index.js`, 'utf8').replace(/\r\n/g, '\n'), tagIndexSource(all));
});

test('seguridad: el contenido para adultos se bloquea con un menor, y el menor con contenido para adultos', () => {
  const withChild = sel(child);
  assert.ok(reasonBlocked(withChild, ...lingerie), 'la lencería no se puede elegir con un niño elegido');
  assert.ok(reasonBlocked(withChild, 'woman', 'pecho', domains.woman.sections.find(s => s.id === 'pecho').options[0].id));
  assert.ok(reasonBlocked(withChild, 'photo', 'style', byEs('photo', 'style', 'Boudoir elegante').id));
  const withAdult = sel(['woman', ...lingerie.slice(1)]);
  assert.ok(reasonBlocked(withAdult, ...child), 'la edad de un niño no se puede elegir con lencería elegida');
  assert.equal(reasonBlocked({}, ...lingerie), null, 'sin menores todo se puede elegir');
});

test('seguridad: un personaje animado solo admite contenido adulto si está verificado como adulto', () => {
  const elsa = byEs('animated', 'personaje', 'Elsa (Frozen)');
  const riley = byEs('animated', 'personaje', 'Riley (Del Revés)');
  const ann = byEs('animated', 'personaje', 'Anna (Frozen)');
  const satin = ['animated', 'vestuario', byEs('animated', 'vestuario', 'Lencería de seda y satén').id];
  assert.equal(reasonBlocked(sel(['animated', 'personaje', elsa.id]), ...satin), null, 'Elsa es adulta');
  assert.ok(reasonBlocked(sel(['animated', 'personaje', riley.id]), ...satin), 'Riley es una niña');
  assert.ok(reasonBlocked(sel(['animated', 'personaje', ann.id]), ...satin), 'sin verificar → bloqueado por defecto');
  assert.ok(reasonBlocked(sel(['animated', 'personaje', elsa.id], teen), ...satin), 'Elsa en versión adolescente: bloqueado aunque sea adulta');
  assert.ok(reasonBlocked(sel(teen), ...satin), 'la versión adolescente bloquea el contenido adulto');
});

test('seguridad: los generadores de adultos (Mujer, Hombre, Personaje avanzado) se bloquean ante un menor', () => {
  const blocked = blockedChecker(sel(child));
  for (const d of ['woman', 'man', 'girl']) {
    const sec = domains[d].sections[0];
    assert.ok(blocked(d, sec.id, sec.options[0].id), `${d} debería estar bloqueado`);
  }
  const women = sel(['woman', 'edad', domains.woman.sections[0].options[0].id]);
  assert.ok(reasonBlocked(women, ...child), 'y al revés: con una mujer elegida no se elige un niño');
  assert.equal(reasonBlocked(women, 'faces', 'edad', 'young-adult-25-35'), null, 'una edad adulta sí convive');
});

test('el prompt nunca compone un par incompatible aunque la selección ya llegue hecha', () => {
  const sneaky = sel(child, lingerie);
  const text = textOf(sneaky);
  assert.match(text, /child/i);
  assert.doesNotMatch(text, /lingerie|boudoir|satin lingerie/i, 'el contenido adulto se descarta ante un menor');
  assert.equal(enforce(sneaky).removed.length, 1);
});

test('el almacén descarta la selección incompatible al cargar o aplicar (enlace, receta, guardado)', () => {
  store.clearAll();
  store.set({ adult: true });
  store.replaceSelection(sel(child, lingerie));
  assert.deepEqual(store.selectedIds('woman', 'ropa'), [], 'la lencería no entra');
  assert.deepEqual(store.selectedIds('faces', 'edad'), ['child-3-7-years']);
  store.clearAll();
  const section = domains.faces.sections.find(s => s.id === 'edad');
  store.toggleOption('woman', domains.woman.sections.find(s => s.id === 'ropa'), lingerie[2], domains.woman);
  store.toggleOption('faces', section, 'child-3-7-years', domains.faces); // bloqueada
  assert.deepEqual(store.selectedIds('faces', 'edad'), [], 'elegir un niño con lencería elegida no hace nada');
  store.clearAll();
  store.set({ adult: false });
});

test('puerta de edad: sin confirmar los 18 años, el contenido adult-only está bloqueado y no entra en ningún prompt', () => {
  assert.equal(reasonBlocked({}, ...lingerie, { adult: false }), GATE_WHY);
  assert.equal(reasonBlocked({}, ...lingerie, { adult: true }), null);
  assert.equal(reasonBlocked({}, 'woman', 'edad', domains.woman.sections[0].options[0].id, { adult: false }), null, 'lo demás no cambia');
  const withLingerie = sel(lingerie);
  assert.equal(enforce(withLingerie, { adult: false }).removed[0].rule, 'puerta-de-edad');
  assert.equal(enforce(withLingerie, { adult: true }).removed.length, 0);
  assert.doesNotMatch(textOf(withLingerie), /satin lingerie/i, 'compose sin confirmar no incluye la lencería');
  const confirmed = base(withLingerie); confirmed.adult = true;
  assert.match(renderFormat('text', compose(domains, confirmed), confirmed).text, /satin lingerie/i);
  store.clearAll();
  store.replaceSelection(withLingerie);
  assert.deepEqual(store.selectedIds('woman', 'ropa'), [], 'ni el almacén ni los enlaces compartidos la admiten sin confirmar');
  store.set({ adult: true });
  store.replaceSelection(withLingerie);
  assert.equal(store.selectedIds('woman', 'ropa').length, 1);
  store.set({ adult: false });
  assert.deepEqual(store.selectedIds('woman', 'ropa'), [], 'al desactivar el contenido adulto se retira lo ya elegido');
  store.clearAll();
});

test('imágenes de referencia de pose y vestuario: el prompt de texto pide usar las adjuntas', () => {
  const s = sel(['woman', 'edad', domains.woman.sections[0].options[0].id]);
  const none = renderFormat('text', compose(domains, base(s)), base(s)).text;
  assert.doesNotMatch(none, /reference image/i);
  const st = { ...base(s), refPose: true, refCostume: true };
  const text = renderFormat('text', compose(domains, st), st).text;
  assert.match(text, /attached pose reference image/);
  assert.match(text, /attached costume reference image/);
  assert.match(renderFormat('natural', compose(domains, st), st).text, /^Reference images: .+attached pose/m);
  assert.deepEqual(compose(domains, { ...base({}), refPose: true }).refs, [], 'sin prompt no se añade nada');
});

test('día contra noche, frío contra calor y género del rostro', () => {
  const noon = ['landscape', 'hora', 'harsh-noon-sunlight'];
  const night = ['weather', 'luz-ambiente', 'moonlight'];
  assert.ok(reasonBlocked(sel(noon), ...night));
  assert.ok(reasonBlocked(sel(night), ...noon));
  const snow = ['weather', 'tipo-nieve', domains.weather.sections.find(s => s.id === 'tipo-nieve').options[0].id];
  const summer = ['landscape', 'estacion', 'vibrant-hot-summer'];
  assert.ok(reasonBlocked(sel(snow), ...summer));
  assert.ok(reasonBlocked(sel(summer), ...snow));
  assert.equal(reasonBlocked(sel(noon), 'weather', 'luz-ambiente', 'clear-daylight'), null, 'mediodía y luz de día sí combinan');
  const woman = ['woman', 'edad', domains.woman.sections[0].options[0].id];
  assert.ok(reasonBlocked(sel(woman), 'faces', 'genero', 'masculine-male'), 'mujer + rostro masculino');
  assert.equal(reasonBlocked(sel(woman), 'faces', 'genero', 'feminine-female'), null);
  assert.ok(reasonBlocked(sel(['man', domains.man.sections[0].id, domains.man.sections[0].options[0].id]), 'faces', 'genero', 'feminine-female'), 'hombre + rostro femenino');
});

test('«Aleatorio» (todos los generadores a la vez) nunca deja un par incompatible', () => {
  let seed = 7;
  const rng = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
  const list = Object.values(domains);
  for (let i = 0; i < 300; i++) {
    const out = randomSelection(list, base(), rng, 9);
    assert.equal(enforce(out).removed.length, 0, 'iteración ' + i);
    const closed = randomSelection(list, base(), rng, 9); // la puerta de edad está cerrada por defecto
    assert.equal(enforce(closed, { adult: false }).removed.length, 0, 'sin contenido adulto sin confirmar: ' + i);
  }
});

test('ninguna receta o idea guardada mezcla opciones incompatibles', async () => {
  for (const { domain: d } of all) {
    const presets = await loadPresetsFor(d.id);
    for (const p of presets || []) assert.equal(enforce({ [d.id]: p.sel }).removed.length, 0, `${d.id} #${p.n}: ${p.es}`);
  }
});

test('las etiquetas de seguridad cubren lo importante', () => {
  const has = (k, t) => TAGS.get(k)?.has(t);
  assert.ok(has('anatomy/edad/toddler', 'minor') && has('faces/edad/teenager-13-17', 'minor') && has('hairstyles/edad/child-hair', 'minor'));
  assert.ok(has('animated/personaje/' + byEs('animated', 'personaje', 'Riley (Del Revés)').id, 'youthful'));
  assert.ok(has('animated/personaje/' + byEs('animated', 'personaje', 'Elsa (Frozen)').id, 'adult'));
  assert.ok(!has('animated/personaje/' + byEs('animated', 'personaje', 'Elsa (Frozen)').id, 'youthful'));
});
