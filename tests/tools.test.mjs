import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadAllDomains } from '../scripts/lib/domains.mjs';
import { buildImportIndexData } from '../scripts/lib/import-index.mjs';
import { compose } from '../assets/js/core/composer.js';
import { renderFormat } from '../assets/js/core/formats/index.js';
import { cleanMj, mjFlags } from '../assets/js/core/formats/midjourney.js';
import { sdNegative } from '../assets/js/core/formats/stable-diffusion.js';
import { lintComposed, mediumOf, ratioOf } from '../assets/js/core/lint.js';
import { estimateTokens, orderParts, budgetReport } from '../assets/js/core/tokens.js';
import { makeVariants, variableSections, defaultTarget } from '../assets/js/core/variants.js';
import { buildImportIndex, parsePrompt, aspectIdFor } from '../assets/js/core/importer.js';
import { wildcardFiles, wildcardLines, toCSV, csvField, batchRow, BATCH_HEADER } from '../assets/js/core/export.js';
import { zipStore, crc32 } from '../assets/js/core/zip.js';
import { randomSelection } from '../assets/js/core/random.js';
import { seededRng } from '../assets/js/core/util.js';
import { store } from '../assets/js/core/store.js';
import * as lib from '../assets/js/core/library.js';

const all = (await loadAllDomains()).map(x => x.domain);
const domains = Object.fromEntries(all.map(d => [d.id, d]));
const opt = (d, s, i = 0) => domains[d].sections.find(x => x.id === s).options[i];
const byEn = (d, s, en) => domains[d].sections.find(x => x.id === s).options.find(o => o.en === en);
const base = (sel = {}, extra = {}) => ({ v: 1, sel, locks: {}, attach: {}, detail: 'short', boost: false, aspect: '', format: 'text', custom: '', adult: false, priority: false, mj: cleanMj(), ...extra });

/* ---------- detector de contradicciones ---------- */

const fake = (...texts) => ({ parts: texts.map((t, i) => ({ domain: 'x', section: 's' + i, option: 'o' + i, short: t, text: t, es: t })) });

test('lint: avisa de pares que se contradicen entre piezas distintas', () => {
  const ids = c => lintComposed(c, {}).map(w => w.id);
  assert.deepEqual(ids(fake('moonlit night', 'harsh noon sunlight')), ['time']);
  assert.deepEqual(ids(fake('close-up portrait', 'full-body shot')), ['shot']);
  assert.deepEqual(ids(fake('photorealistic', 'anime style')), ['medium']);
  assert.deepEqual(ids(fake('black and white', 'vibrant colors')), ['palette']);
  assert.deepEqual(ids(fake('eyes closed', 'direct gaze at the camera')), ['gaze']);
  assert.deepEqual(ids(fake('snowy winter forest', 'scorching summer heat')), ['season']);
});

test('lint: una sola pieza que menciona ambos lados, o piezas compatibles, no avisan', () => {
  assert.deepEqual(lintComposed(fake('from night to harsh noon sunlight'), {}), []);
  assert.deepEqual(lintComposed(fake('moonlit night', 'moonlight reflections'), {}), []);
  assert.deepEqual(lintComposed(fake('red dress', 'city street'), {}), []);
});

test('lint: ignora el acabado automático y reconoce el texto libre del usuario', () => {
  const c = fake('moonlit night');
  c.parts.push({ domain: 'photo', section: 'finishing', option: 'x', short: 'harsh noon sunlight', text: 'harsh noon sunlight', es: 'auto', boost: true });
  assert.deepEqual(lintComposed(c, {}), []);
  c.parts.push({ domain: '_custom', section: '_custom', option: 'custom', short: 'bright daylight', text: 'bright daylight', es: 'Texto libre', custom: true });
  const w = lintComposed(c, {});
  assert.equal(w.length, 1);
  assert.ok(w[0].parts.some(p => p.custom), 'señala el texto libre para poder quitarlo');
});

test('lint: proporción apaisada con composición vertical y al revés', () => {
  assert.equal(lintComposed(fake('vertical composition'), { aspect: '16:9' })[0]?.id, 'aspect');
  assert.equal(lintComposed(fake('panoramic view'), { aspect: '9:16' })[0]?.id, 'aspect');
  assert.deepEqual(lintComposed(fake('vertical composition'), { aspect: '9:16' }), []);
  assert.equal(ratioOf('16:9'), 16 / 9);
  assert.equal(ratioOf(''), null);
});

test('lint: en miles de combinaciones aleatorias las alertas son pocas y solo de reglas conocidas', () => {
  const rng = seededRng('lint-test');
  const roles = ['woman', 'photo', 'landscape', 'weather', 'scenarios', 'poses'];
  const known = new Set(['time', 'season', 'shot', 'medium', 'palette', 'focus', 'lightquality', 'gaze', 'tone', 'aspect']);
  let flagged = 0, n = 0;
  for (let i = 0; i < 400; i++) {
    const state = base({}, { boost: true, aspect: ['', '16:9', '9:16'][i % 3] });
    state.sel = randomSelection(roles.filter(() => rng() < 0.6).map(id => domains[id]), state, rng, 4);
    const c = compose(domains, state);
    if (c.empty) continue;
    n++;
    const w = lintComposed(c, state);
    if (w.length) flagged++;
    for (const x of w) assert.ok(known.has(x.id) && x.parts.length >= 1 && x.text);
  }
  assert.ok(flagged / n < 0.35, `demasiados avisos: ${flagged}/${n}`);
});

test('mediumOf: foto, dibujo o nada si se mezclan', () => {
  assert.equal(mediumOf(fake('raw photo', 'city')), 'photo');
  assert.equal(mediumOf(fake('anime style', 'city')), 'drawn');
  assert.equal(mediumOf(fake('raw photo', 'anime style')), null);
  assert.equal(mediumOf(fake('city')), null);
});

/* ---------- tokens y prioridad ---------- */

test('tokens: estimación razonable y estable', () => {
  assert.equal(estimateTokens(''), 0);
  assert.equal(estimateTokens('red dress'), 2);
  assert.equal(estimateTokens('red dress, city'), 4); // la coma cuenta
  assert.ok(estimateTokens('photorealistic extraordinarily') > estimateTokens('photo extra'));
  assert.equal(estimateTokens('ultra-high-resolution'), estimateTokens('ultra high resolution'), 'los guiones dentro de una palabra no suman');
});

test('prioridad: sujeto, técnica y escenario primero; estable dentro de cada ranura', () => {
  const parts = [{ slot: 'atmosphere', short: 'fog' }, { slot: 'attribute', short: 'hair' }, { slot: 'technical', short: '85mm' }, { slot: 'setting', short: 'street' }, { slot: 'subject', short: 'woman' }, { slot: 'technical', short: 'bokeh' }];
  assert.deepEqual(orderParts(parts, true).map(p => p.short), ['woman', '85mm', 'bokeh', 'street', 'hair', 'fog']);
  assert.equal(orderParts(parts, false), parts, 'sin prioridad no toca el orden');
});

test('Stable Diffusion: el aviso de tokens señala qué piezas quedarían fuera y la prioridad las reordena', () => {
  const sel = {
    woman: { edad: [opt('woman', 'edad').id], ropa: [opt('woman', 'ropa').id], peinado: [opt('woman', 'peinado').id], colorpelo: [opt('woman', 'colorpelo').id], ojos: [opt('woman', 'ojos').id] },
    landscape: { estacion: [opt('landscape', 'estacion').id], hora: [opt('landscape', 'hora').id] },
    photo: { style: [opt('photo', 'style').id], lighting: [opt('photo', 'lighting').id], lens: [opt('photo', 'lens').id], camera: [opt('photo', 'camera').id], quality: [opt('photo', 'quality').id] },
  };
  const state = base(sel, { format: 'sd', boost: true });
  const out = renderFormat('sd', compose(domains, state), state);
  const rep = budgetReport('sd', out);
  assert.equal(rep.limit, 75);
  assert.ok(rep.tokens > 0 && ['ok', 'over'].includes(rep.level));
  if (rep.level === 'over') { assert.ok(rep.cut.length >= 1); assert.ok(rep.cut.every(p => p.es)); }
  const prio = renderFormat('sd', compose(domains, { ...state, priority: true }), { ...state, priority: true });
  const head = t => t.split('\n')[0].replace('Positive prompt: ', '');
  assert.notEqual(head(prio.text), head(out.text), 'cambia el orden del positivo');
  assert.equal(prio.text.split('\n')[2], out.text.split('\n')[2], 'el tamaño no cambia');
  assert.equal(budgetReport('text', { text: 'x' }), null, 'sin límite conocido no hay informe');
  assert.equal(budgetReport('midjourney', { text: 'a, b', budgetText: 'a, b' }).level, 'ok');
});

/* ---------- Midjourney y negativo de Stable Diffusion ---------- */

test('Midjourney: parámetros acotados y en orden, --raw según la versión', () => {
  assert.deepEqual(cleanMj({ stylize: 5000, chaos: -4, weird: '12', v: 'xx', raw: 'sí' }), { v: '', stylize: 1000, chaos: 0, weird: 12, raw: false });
  assert.deepEqual(mjFlags({ v: '7', raw: true, stylize: 250, chaos: 20, weird: 100 }), ['--v 7', '--raw', '--s 250', '--chaos 20', '--weird 100']);
  assert.deepEqual(mjFlags({ v: '6.1', raw: true }), ['--v 6.1', '--style raw']);
  assert.deepEqual(mjFlags({ v: 'niji 6' }), ['--niji 6']);
  assert.deepEqual(mjFlags({}), []);
  const state = base({ woman: { edad: [opt('woman', 'edad').id] } }, { format: 'midjourney', aspect: '16:9', mj: { v: '7', stylize: 300, raw: true } });
  const text = renderFormat('midjourney', compose(domains, state), state).text;
  assert.match(text, / --ar 16:9 --v 7 --raw --s 300( --no .+)?$/);
});

test('store: los ajustes de Midjourney y la prioridad se guardan limpios', () => {
  store.set({ priority: true, mj: { v: '7', stylize: '2000', chaos: '' } });
  assert.equal(store.get().priority, true);
  assert.deepEqual(store.get().mj, { v: '7', stylize: 1000, chaos: null, weird: null, raw: false });
  store.set({ mj: { stylize: '' }, priority: false });
  assert.equal(store.get().mj.stylize, null);
  assert.equal(store.get().mj.v, '7', 'cambiar un campo no borra los demás');
  store.clearAll();
  assert.equal(store.get().priority, false);
});

test('negativo de SD: coherente con el medio y con personas, sin términos repetidos', () => {
  const photo = fake('raw photo, 85mm');
  photo.negative = []; photo.subjects = [{ lead: 'a woman' }];
  const neg = sdNegative(photo);
  assert.match(neg, /cartoon/);
  assert.match(neg, /bad hands/);
  const terms = neg.split(', ').map(t => t.toLowerCase());
  assert.equal(new Set(terms).size, terms.length, 'sin repetidos');
  const anime = fake('anime style'); anime.negative = [{ text: 'blurry, lowres' }]; anime.subjects = [{ lead: 'a car' }];
  const n2 = sdNegative(anime);
  assert.match(n2, /^blurry, lowres/);
  assert.match(n2, /photorealistic/);
  assert.doesNotMatch(n2, /bad hands/, 'un coche no lleva el negativo de manos');
});

/* ---------- variantes A/B ---------- */

test('variantes: cambian solo la sección elegida y respetan las exclusiones', () => {
  const sel = { woman: { edad: [opt('woman', 'edad').id] }, photo: { lighting: [opt('photo', 'lighting').id], style: [opt('photo', 'style').id] } };
  const state = base(sel);
  const list = variableSections(domains, state);
  assert.ok(list.length > 5 && list[0].current.length, 'primero las secciones en uso');
  assert.ok(list.every(s => s.count >= 3));
  const target = defaultTarget(list);
  assert.ok(target.current.length, 'por defecto, una sección ya elegida');
  const variants = makeVariants(domains, state, target, 4, seededRng('v'));
  assert.equal(variants.length, 4);
  assert.equal(new Set(variants.map(v => v.option)).size, 4, 'cuatro opciones distintas');
  for (const v of variants) {
    assert.notDeepEqual(v.sel[target.domain][target.section], state.sel[target.domain][target.section]);
    assert.deepEqual(v.sel.woman, state.sel.woman, 'lo demás no cambia');
    assert.equal(v.sel.photo[target.section === 'lighting' ? 'style' : 'lighting'][0], state.sel.photo[target.section === 'lighting' ? 'style' : 'lighting'][0]);
  }
  assert.deepEqual(state.sel.photo.lighting, [opt('photo', 'lighting').id], 'no modifica el estado original');
  assert.deepEqual(makeVariants(domains, state, { domain: 'nope', section: 'x' }), []);
});

test('variantes: sin la puerta de edad no salen opciones para adultos', () => {
  const state = base({ woman: { edad: [opt('woman', 'edad').id] } });
  const vs = makeVariants(domains, state, { domain: 'woman', section: 'ropa' }, 12, seededRng('adult'));
  assert.ok(vs.length > 0);
  for (const v of vs) {
    const o = domains.woman.sections.find(s => s.id === 'ropa').options.find(x => x.id === v.option);
    assert.ok(o, v.option);
    assert.equal((v.sel.woman.ropa || [])[0], v.option);
  }
});

/* ---------- importador ---------- */

const importIndex = buildImportIndex(JSON.parse(readFileSync(new URL('../data/import-index.json', import.meta.url), 'utf8')));

test('importador: el índice generado está al día con los datos', () => {
  const fresh = JSON.stringify(buildImportIndexData(all));
  assert.equal(readFileSync(new URL('../data/import-index.json', import.meta.url), 'utf8'), fresh, 'ejecuta «npm run build»');
});

test('importador: un prompt de la propia web vuelve a ser casi la misma selección (todos los formatos)', () => {
  const rng = seededRng('roundtrip');
  const roles = ['woman', 'man', 'landscape', 'scenarios', 'weather', 'photo', 'poses', 'cars'];
  for (const [format, detail] of [['text', 'short'], ['text', 'rich'], ['natural', 'short'], ['sd', 'short'], ['midjourney', 'short'], ['flux', 'rich']]) {
    let hit = 0, miss = 0, extra = 0;
    for (let i = 0; i < 60; i++) {
      const state = base({}, { format, detail });
      state.sel = randomSelection(roles.filter(() => rng() < 0.45).map(id => domains[id]), state, rng, 4);
      const c = compose(domains, state);
      if (c.empty) continue;
      const r = parsePrompt(renderFormat(format, c, state).text, importIndex);
      const want = new Set(c.parts.filter(p => !p.custom).map(p => `${p.domain}/${p.section}/${p.option}`));
      const got = new Set(r.matches.map(m => `${m.domain}/${m.section}/${m.option}`));
      for (const w of want) got.has(w) ? hit++ : miss++;
      for (const g of got) if (!want.has(g)) extra++;
    }
    assert.ok(hit / (hit + miss) > 0.9, `${format}/${detail}: recupera ${hit} de ${hit + miss}`);
    assert.ok(hit / (hit + extra) > 0.88, `${format}/${detail}: ${extra} sobran`);
  }
});

test('importador: lo no reconocido pasa al texto libre, sin perderse', () => {
  const lens = byEn('photo', 'lens', opt('photo', 'lens').en);
  const r = parsePrompt(`${lens.en}, a tiny crimson teapot floating above a velvet cushion`, importIndex);
  assert.ok(r.matches.some(m => m.option === lens.id));
  assert.match(r.custom, /crimson teapot floating above a velvet cushion/);
  assert.equal(parsePrompt('', importIndex).custom, '');
  assert.deepEqual(parsePrompt('   ', importIndex).sel, {});
});

test('importador: parámetros de Midjourney, pesos, LoRA, negativos y JSON', () => {
  const lens = opt('photo', 'lens').en;
  const mj = parsePrompt(`${lens} --ar 6:13 --v 7 --s 250 --no text, watermark`, importIndex);
  assert.equal(mj.aspect, '9:19.5', '«6:13» de Midjourney equivale a 9:19.5');
  assert.ok(mj.matches.length >= 1);
  assert.doesNotMatch(mj.custom, /--|watermark|250/);
  const sd = parsePrompt(`Positive prompt: (${lens}:1.3) <lora:foo:0.8>\nNegative prompt: blurry\nSize: 832x1216`, importIndex);
  assert.ok(sd.matches.length >= 1);
  assert.doesNotMatch(sd.custom, /blurry|lora|832/);
  const json = parsePrompt(JSON.stringify({ high_level_description: lens, palette: ['#112233'] }), importIndex);
  assert.ok(json.matches.length >= 1);
  assert.doesNotMatch(json.custom, /#112233/);
  assert.equal(parsePrompt('Aspect ratio "16:9".', importIndex).aspect, '16:9');
  assert.equal(aspectIdFor('7:3'), '21:9', '7:3 es 2,33, igual que 21:9');
  assert.equal(aspectIdFor('5:7'), '', 'sin equivalente en la lista');
  assert.equal(aspectIdFor('18:39'), '9:19.5');
});

test('importador: en secciones de elección única solo entra la primera', () => {
  const sec = domains.photo.sections.find(s => s.mode === 'single' && s.options.length > 3);
  const [a, b] = [sec.options[0], sec.options[1]].filter(o => o.en.split(' ').length >= 2);
  if (!a || !b) return;
  const r = parsePrompt(`${a.en}, ${b.en}`, importIndex);
  const ids = Object.values(r.sel.photo || {}).flat();
  assert.ok(!(ids.includes(a.id) && ids.includes(b.id)) || r.sel.photo[sec.id]?.length !== 2);
});

test('importador: tarda poco con un texto largo', () => {
  const long = Array.from({ length: 80 }, (_, i) => `${opt('photo', 'lens', i % 5).en}, scene number ${i}`).join(', ');
  const t0 = Date.now();
  parsePrompt(long, importIndex);
  assert.ok(Date.now() - t0 < 1500);
});

/* ---------- exportar ---------- */

test('wildcards: un .txt por sección, sin adultos, menores ni aspecto joven y sin sintaxis que rompa', () => {
  const files = wildcardFiles({ woman: domains.woman, faces: domains.faces, photo: domains.photo });
  const names = files.map(f => f.name);
  assert.ok(names.includes('LEEME.txt') && names.includes('indice.txt'));
  assert.ok(names.some(n => n === `wildcards/photo/${domains.photo.sections[0].id}.txt`));
  assert.ok(names.every(n => !/\.\./.test(n)), 'sin rutas peligrosas');
  const joined = files.filter(f => f.name.startsWith('wildcards/')).map(f => f.content).join('\n');
  assert.doesNotMatch(joined, /[{}|]/, 'sin caracteres de la sintaxis {a|b}');
  // La sección de pecho de «woman» es solo para adultos: no sale.
  assert.ok(!names.includes('wildcards/woman/pecho.txt'));
  // Ninguna lista de edad de «faces» lleva las opciones de menores.
  const age = files.find(f => f.name === 'wildcards/faces/edad.txt')?.content || '';
  assert.ok(age.length > 20, 'la lista de edad existe');
  assert.doesNotMatch(age, /teenager|child|baby/i);
  const lines = wildcardLines('photo', domains.photo.sections[0]);
  assert.equal(new Set(lines.map(l => l.toLowerCase())).size, lines.length, 'sin repetidos');
  assert.ok(files.find(f => f.name.endsWith('plantilla-ejemplo.txt'))?.content.includes('__woman/'));
});

test('CSV: separador, comillas, BOM y protección contra fórmulas', () => {
  assert.equal(csvField('hola'), 'hola');
  assert.equal(csvField('a, b'), '"a, b"');
  assert.equal(csvField('a; b', ';'), '"a; b"');
  assert.equal(csvField('di "hola"'), '"di ""hola"""');
  assert.equal(csvField('=HYPERLINK("x")'), '"\'=HYPERLINK(""x"")"');
  assert.equal(csvField('-3'), "'-3");
  const csv = toCSV(['a', 'b'], [[1, 'x; y'], [2, 'línea\nnueva']]);
  assert.ok(csv.startsWith('﻿'));
  assert.equal(csv.split('\r\n')[0], '﻿a;b');
  assert.equal(toCSV(['a'], [], { bom: false }), 'a\r\n');
});

test('lote: una fila por prompt con las columnas esperadas', () => {
  const sel = { woman: { edad: [opt('woman', 'edad').id] }, photo: { lighting: [opt('photo', 'lighting').id] } };
  const row = batchRow(domains, base({}, { format: 'sd', aspect: '16:9', boost: true }), sel, 3, st => `link-${Object.keys(st.sel).length}`);
  assert.equal(row.length, BATCH_HEADER.length);
  assert.equal(row[0], 3);
  assert.ok(row[1].length > 10 && row[2].length > 5, 'positivo y negativo');
  assert.equal(row[3], '16:9');
  assert.match(row[4], /^\d+×\d+$/);
  assert.equal(row[5], 'link-2');
  const mj = batchRow(domains, base({}, { format: 'midjourney' }), sel, 1);
  assert.equal(mj[2], '', 'Midjourney no tiene negativo aparte');
});

test('ZIP: estructura válida, CRC correcto y contenido UTF-8', () => {
  assert.equal(crc32(new TextEncoder().encode('123456789')), 0xCBF43926, 'CRC-32 de referencia');
  const zip = zipStore([{ name: 'a/uno.txt', content: 'hola ñandú' }, { name: 'dos.txt', content: '' }]);
  const dv = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
  assert.equal(dv.getUint32(0, true), 0x04034B50, 'cabecera local');
  assert.equal(dv.getUint32(zip.length - 22, true), 0x06054B50, 'fin del directorio central');
  assert.equal(dv.getUint16(zip.length - 22 + 10, true), 2, 'dos archivos');
  const bytes = new TextEncoder().encode('hola ñandú').length;
  assert.equal(new TextDecoder().decode(zip.slice(30 + 9, 30 + 9 + bytes)), 'hola ñandú');
});

/* ---------- valoraciones ---------- */

test('biblioteca: estrellas y modelo se guardan, se limpian y alimentan el resumen', () => {
  const mk = (name, ids) => lib.saveItem(name, base({ woman: { edad: [ids[0]] }, photo: { lighting: [ids[1]] } }));
  const a = mk('a', ['x1', 'l1']), b = mk('b', ['x2', 'l1']), c = mk('c', ['x3', 'l2']);
  lib.rateItem(a.id, 5); lib.rateItem(b.id, 4); lib.rateItem(c.id, 2);
  lib.setItemModel(a.id, '  Flux dev '); lib.setItemModel(b.id, 'Flux dev'); lib.setItemModel(c.id, 'Midjourney');
  lib.rateItem(c.id, 99); // fuera de rango: se ignora y queda sin estrellas
  const saved = lib.loadLibrary().saved;
  assert.equal(saved.find(i => i.id === c.id).rating, 0);
  assert.equal(saved.find(i => i.id === a.id).model, 'Flux dev');
  lib.rateItem(c.id, 2);
  const info = lib.libraryInsights(lib.loadLibrary().saved);
  assert.equal(info.rated, 3); assert.equal(info.good, 2);
  assert.deepEqual(info.top.map(t => [t.option, t.count]), [['l1', 2]], 'solo lo que se repite en los de 4-5★');
  assert.deepEqual(info.models.map(m => [m.model, m.avg, m.n]), [['Flux dev', 4.5, 2], ['Midjourney', 2, 1]]);
  // Exportar e importar conserva valoración y modelo
  const json = lib.exportLibrary();
  lib.deleteItem('saved', a.id);
  assert.equal(lib.importLibrary(json).added >= 1, true);
  assert.ok(lib.loadLibrary().saved.some(i => i.rating === 5 && i.model === 'Flux dev'));
  for (const it of lib.loadLibrary().saved) lib.deleteItem('saved', it.id);
});
