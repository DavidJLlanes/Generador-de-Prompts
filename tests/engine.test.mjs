import test from 'node:test';
import assert from 'node:assert/strict';
import { loadAllDomains } from '../scripts/lib/domains.mjs';
import { compose } from '../assets/js/core/composer.js';
import { renderFormat, FORMATS } from '../assets/js/core/formats/index.js';
import { sdSize } from '../assets/js/core/formats/stable-diffusion.js';
import { randomSelection } from '../assets/js/core/random.js';
import { encodeState, decodeState } from '../assets/js/core/url-state.js';
import { store } from '../assets/js/core/store.js';
import { aspectNote } from '../data/aspects.js';
import { toSentences } from '../assets/js/core/util.js';

const domains = Object.fromEntries((await loadAllDomains()).map(x => [x.domain.id, x.domain]));
const sec = (d, id) => domains[d].sections.find(s => s.id === id);
const opt = (d, s, i = 0) => sec(d, s).options[i];
const base = (sel = {}, extra = {}) => ({ v: 1, sel, locks: {}, detail: 'rich', boost: false, aspect: '', format: 'text', ...extra });

test('una mujer SIN escenario genera igualmente un prompt completo', () => {
  const state = base({ woman: { edad: [opt('woman', 'edad').id] } });
  const c = compose(domains, state);
  assert.equal(c.empty, false);
  assert.equal(c.lead, 'a woman');
  const text = renderFormat('text', c, state).text;
  assert.match(text, /^Create the image of an? [^,.]*woman/);
  assert.doesNotMatch(text, /woman, (woman|young|elderly|mature)/, 'no repite el sujeto («a woman, woman in…»)');
});

test('la frase inicial conserva «a woman» si la primera pieza no nombra al sujeto', () => {
  const state = base({ woman: { etnia: [opt('woman', 'etnia').id] } });
  const c = compose(domains, state);
  assert.equal(c.merged, null);
  assert.match(renderFormat('text', c, state).text, /^Create the image of a woman, /);
});

test('el artículo se ajusta a la vocal: «an elderly woman», «a young woman»', async () => {
  const { withArticle } = await import('../assets/js/core/util.js');
  assert.equal(withArticle('elderly woman'), 'an elderly woman');
  assert.equal(withArticle('young woman'), 'a young woman');
  assert.equal(withArticle('a tall man'), 'a tall man');
  assert.equal(withArticle('80-year-old woman'), 'an 80-year-old woman');
  assert.equal(withArticle('18-year-old woman'), 'an 18-year-old woman');
  assert.equal(withArticle('25-year-old woman'), 'a 25-year-old woman');
  assert.equal(withArticle('28-year-old woman'), 'a 28-year-old woman');
});

test('cruzar: mujer + escenario + clima + técnica se ordenan por ranura, no por orden de elección', () => {
  const state = base({
    photo: { lighting: [opt('photo', 'lighting').id] },
    weather: { 'tipo-clima': [opt('weather', 'tipo-clima').id] },
    scenarios: { ambiente: [opt('scenarios', 'ambiente').id] },
    woman: { edad: [opt('woman', 'edad').id] },
  });
  const c = compose(domains, state);
  const order = c.parts.map(p => p.slot);
  assert.deepEqual(order, [...order].sort((a, b) => ['subject', 'attribute', 'action', 'setting', 'atmosphere', 'technical'].indexOf(a) - ['subject', 'attribute', 'action', 'setting', 'atmosphere', 'technical'].indexOf(b)));
  assert.deepEqual(c.slots.map(s => s.slot), ['subject', 'setting', 'atmosphere', 'technical']);
});

test('detalle «rich» usa el texto largo; «short» usa el corto', () => {
  const m = opt('scenarios', 'motivo');
  assert.ok(m.rich && m.rich.length > m.en.length * 2, 'el motivo debe tener descripción larga');
  const rich = compose(domains, base({ scenarios: { motivo: [m.id] } }, { detail: 'rich' }));
  const short = compose(domains, base({ scenarios: { motivo: [m.id] } }, { detail: 'short' }));
  assert.equal(rich.parts[0].text, m.rich);
  assert.equal(short.parts[0].text, m.en);
});

test('la regla de miniatura se activa solo con un motivo etiquetado «miniature»', () => {
  const mini = sec('scenarios', 'motivo').options.find(o => o.tags?.includes('miniature'));
  const normal = sec('scenarios', 'motivo').options.find(o => !o.tags);
  assert.ok(mini && normal);
  const withMini = compose(domains, base({ scenarios: { motivo: [mini.id] } }));
  const withNormal = compose(domains, base({ scenarios: { motivo: [normal.id] } }));
  assert.ok(withMini.parts.some(p => p.section === '_rule'));
  assert.ok(!withNormal.parts.some(p => p.section === '_rule'));
});

test('«Calidad máxima» añade acabado y negativos solo si hay prompt y no se eligió nada a mano', () => {
  const sel = { woman: { edad: [opt('woman', 'edad').id] } };
  const off = compose(domains, base(sel, { boost: false }));
  const on = compose(domains, base(sel, { boost: true }));
  assert.ok(on.parts.length > off.parts.length);
  assert.ok(on.negative.length > 0 && off.negative.length === 0);
  assert.equal(compose(domains, base({}, { boost: true })).empty, true, 'sin selección no hay prompt aunque haya boost');
  const manual = compose(domains, base({ ...sel, photo: { finishing: [opt('photo', 'finishing', 1).id] } }, { boost: true }));
  assert.equal(manual.parts.filter(p => p.section === 'finishing').length, 1);
});

test('los ids obsoletos se ignoran sin romper el prompt', () => {
  const c = compose(domains, base({ woman: { edad: ['no-existe'] }, ghost: { x: ['y'] } }));
  assert.equal(c.empty, true);
});

test('todos los formatos producen salida y el JSON de Ideogram es válido', () => {
  const state = base({
    woman: { edad: [opt('woman', 'edad').id] }, scenarios: { motivo: [opt('scenarios', 'motivo').id] },
    photo: { style: [opt('photo', 'style').id], lighting: [opt('photo', 'lighting').id] },
  }, { boost: true, aspect: '9:19.5' });
  const c = compose(domains, state);
  for (const f of FORMATS) {
    const out = renderFormat(f.id, c, state);
    assert.ok(out.text.length > 20, `${f.id} vacío`);
  }
  const json = JSON.parse(renderFormat('ideogram', c, state).text);
  assert.ok(json.high_level_description && json.style_description && json.compositional_deconstruction.elements.length >= 1);
  assert.match(renderFormat('text', c, state).text, /Aspect ratio "9:19\.5"\.$/);
  assert.match(renderFormat('sd', c, state).text, /Negative prompt: .+\nSize: \d+x\d+$/);
});

test('el prompt final es siempre inglés: sin letras acentuadas propias del español en las piezas', () => {
  const c = compose(domains, base({ woman: { edad: [opt('woman', 'edad').id] }, scenarios: { ideas: [opt('scenarios', 'ideas', 2).id] }, weather: { 'tipo-clima': [opt('weather', 'tipo-clima').id] } }));
  const text = renderFormat('text', c, base({}, {})).text;
  // se permiten nombres propios (León, Médulas…), pero no palabras como «lluvia» o «noche»
  assert.doesNotMatch(text, /\b(lluvia|noche|cielo|piedra|madera|con|sobre)\b/i);
});

test('sdSize devuelve múltiplos de 64 y respeta la proporción', () => {
  for (const a of ['1:1', '9:16', '16:9', '9:19.5', '32:9', '']) {
    const { width, height } = sdSize(a);
    assert.equal(width % 64, 0); assert.equal(height % 64, 0);
    assert.ok(width >= 512 && height >= 512 && width <= 2048 && height <= 2048);
  }
  assert.ok(sdSize('16:9').width > sdSize('16:9').height);
  assert.ok(sdSize('9:16').width < sdSize('9:16').height);
});

test('aspectNote da nota para proporciones conocidas y nada para «sin definir»', () => {
  assert.match(aspectNote('9:19.5'), /phone-screen/);
  assert.match(aspectNote('21:9'), /Ultra-wide/);
  assert.equal(aspectNote(''), '');
});

test('estado compartible: codificar y decodificar es reversible', () => {
  const s = base({ woman: { edad: ['a'] }, weather: { x: ['b', 'c'] } }, { detail: 'short', boost: true, aspect: '16:9' });
  const back = decodeState(encodeState(s));
  assert.deepEqual(back, { sel: s.sel, detail: 'short', boost: true, aspect: '16:9', custom: '' });
  assert.equal(decodeState('%%%no-valido'), null);
});

test('store: modo single reemplaza, multi acumula, vaciar limpia dominios', async () => {
  store.clearAll();
  const single = { id: 's', mode: 'single' }, multi = { id: 'm', mode: 'multi' };
  store.toggleOption('d', single, 'a'); store.toggleOption('d', single, 'b');
  assert.deepEqual(store.selectedIds('d', 's'), ['b']);
  store.toggleOption('d', multi, 'a'); store.toggleOption('d', multi, 'b'); store.toggleOption('d', multi, 'a');
  assert.deepEqual(store.selectedIds('d', 'm'), ['b']);
  assert.equal(store.countSelected(), 2);
  store.clearDomain('d');
  assert.deepEqual(store.selectedDomainIds(), []);
});

test('aleatorio: solo ids válidos, respeta bloqueos y excluye acabado/negativos', () => {
  const rng = (() => { let n = 7; return () => ((n = (n * 16807) % 2147483647) / 2147483647); })();
  const state = base({ woman: { edad: ['fijo'] } }, { locks: { woman: { edad: true } } });
  const out = randomSelection([domains.woman, domains.photo, domains.scenarios], state, rng);
  assert.deepEqual(out.woman.edad, ['fijo']);
  for (const [did, secs] of Object.entries(out)) for (const [sid, ids] of Object.entries(secs)) {
    if (did === 'woman' && sid === 'edad') continue;
    ids.forEach(id => assert.ok(sec(did, sid).options.some(o => o.id === id), `${did}/${sid}/${id}`));
  }
  assert.ok(!out.photo?.finishing && !out.photo?.avoid);
});

test('toSentences: etiquetas cortas en una frase, párrafos largos como oraciones propias', () => {
  assert.deepEqual(toSentences(['red hair', 'green eyes'], 'Create the image of a woman'), ['Create the image of a woman, red hair, green eyes.']);
  const long = 'a traditional tea house of light wood, with paper doors and a wooden veranda over a lake of still water, reflected perfectly under a rainy sky.';
  const out = toSentences(['red hair', long, 'light fog'], 'Create the image of a woman');
  assert.equal(out.length, 3);
  assert.match(out[0], /^Create the image of a woman, red hair.$/);
  assert.match(out[1], /^A traditional tea house/);
  assert.match(out[2], /^Light fog.$/);
  assert.deepEqual(toSentences([]), []);
});

test('la búsqueda por palabras exige todas, en cualquier orden', async () => {
  const { matchesAll, fold } = await import('../assets/js/core/util.js');
  const hay = fold('Benz Patent-Motorwagen · 1886 · Alemania');
  assert.equal(matchesAll(hay, 'alemania 1886'), true);
  assert.equal(matchesAll(hay, '1886 BENZ'), true);
  assert.equal(matchesAll(hay, 'alemania 1999'), false);
  assert.equal(matchesAll(hay, '   '), true, 'una búsqueda vacía no filtra');
});

test('la edad se funde con «a woman» aunque la primera pieza del sujeto sea un párrafo largo (época)', () => {
  const era = opt('girl', 'era', 5); // una década: su texto «rich» es largo y no nombra al sujeto
  const age = sec('girl', 'identity-age').options.find(o => o.en.startsWith('25-year-old'));
  const state = base({ girl: { era: [era.id], 'identity-age': [age.id] } });
  const text = renderFormat('text', compose(domains, state), state).text;
  assert.match(text, /^Create the image of a 25-year-old woman/);
  assert.match(text, /Styled in the 1950s manner/);
});

test('el dominio «cars» separa el coche de la escena: ninguna escena trae marcadores ni el coche incrustado', () => {
  for (const id of ['escena-foto', 'escena-ilustracion']) {
    for (const o of sec('cars', id).options) {
      assert.doesNotMatch(o.en, /\{[A-Za-z]+\}/, `${id}/${o.id}: marcador sin sustituir`);
      assert.match(o.en, /\bthe car\b|\bcar\b/i, `${id}/${o.id}: no menciona al coche`);
    }
  }
  assert.equal(sec('cars', 'car').options.length, 1000);
});

test('«girl» es un generador de adultos: edades de 18 a 80 y sin términos explícitos', () => {
  const ages = sec('girl', 'identity-age').options.map(o => o.en).join(' | ');
  assert.doesNotMatch(ages, /(1[0-7]-year|teen\w*|child\w*|girl)/i);
  assert.ok(sec('girl', 'identity-age').options.some(o => o.en.startsWith('18-year-old')));
  const all = domains.girl.sections.flatMap(s => s.options.map(o => o.en)).join(' | ');
  assert.doesNotMatch(all, /(topless|naked|nude|nipples?|explicit|nsfw|porn\w*)/i);
});
