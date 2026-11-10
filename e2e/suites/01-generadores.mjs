/** Generadores, cruce entre páginas, formatos, constructor, galería de ideas, catálogo, enlace compartido y móvil. */
import catalog from '../../data/catalog.js';

const input = (sel, value) => `const s=document.querySelector(${JSON.stringify(sel)}); s.value=${JSON.stringify(value)}; s.dispatchEvent(new Event('input',{bubbles:true}))`;

export async function run({ b, base, ok, step }) {
  const wom = catalog.domains.find(d => d.id === 'woman');
  const nDomains = catalog.domains.length;

  step('[1] Generador «Mujer»: carga, selección y dock');
  await b.goto(base + '/generadores/mujer/');
  await b.eval('localStorage.clear()');
  await b.goto(base + '/generadores/mujer/');
  await b.waitFor(`document.querySelectorAll('.opt-section').length > 5`, 8000, 'secciones renderizadas');
  ok((await b.eval(`return document.querySelectorAll('.opt-section').length`)) === wom.sections, `renderiza las ${wom.sections} secciones de Mujer`);
  ok((await b.eval(`return document.querySelectorAll('button[data-opt]').length`)) === wom.options, `renderiza las ${wom.options} opciones`);
  ok(await b.eval(`return document.querySelector('.dock').classList.contains('is-empty')`), 'dock oculto sin selección');
  await b.eval(`document.querySelector('#sec-edad button[data-opt]').click()`);
  await b.sleep(300);
  ok(await b.eval(`return document.querySelector('#sec-edad button[data-opt]').getAttribute('aria-pressed') === 'true'`), 'la opción queda marcada (aria-pressed)');
  ok(!(await b.eval(`return document.querySelector('.dock').classList.contains('is-empty')`)), 'el dock aparece con 1 opción');
  ok((await b.eval(`return document.querySelector('[data-count]').textContent`)) === '1', 'el contador de «Mi prompt» marca 1');
  const preview = await b.eval(`return document.querySelector('.dock__preview').textContent`);
  ok(/^Create the image of an? [^,.]*woman/.test(preview), 'la vista previa empieza por «Create the image of a… woman»', preview.slice(0, 60));
  await b.eval(`document.querySelectorAll('#sec-edad button[data-opt]')[1].click()`);
  await b.sleep(200);
  ok((await b.eval(`return document.querySelectorAll('#sec-edad button[aria-pressed="true"]').length`)) === 1, 'sección de elección única: solo queda 1 marcada');

  step('[2] Búsqueda dentro del generador');
  await b.eval(input('[data-search]', 'pelo'));
  await b.sleep(400);
  const shown = await b.eval(`return [...document.querySelectorAll('.opt-section')].filter(s=>!s.hidden).length`);
  ok(shown > 0 && shown < wom.sections, `la búsqueda oculta secciones sin resultados (${shown}/${wom.sections} visibles)`);
  ok(/resultado/.test(await b.eval(`return document.querySelector('[data-status]').textContent`)), 'muestra recuento de resultados');
  await b.eval(input('[data-search]', ''));

  step('[3] Cruce: la selección persiste y se combina con otro generador');
  await b.goto(base + '/generadores/escenarios/');
  await b.waitFor(`document.querySelectorAll('.opt-section').length === 6`, 8000, 'secciones de escenarios');
  ok((await b.eval(`return document.querySelector('[data-count]').textContent`)) === '1', 'el contador conserva la selección de Mujer en otra página');
  await b.eval(`document.querySelector('#sec-motivo button[data-opt]').click(); document.querySelector('#sec-ambiente button[data-opt]').click();`);
  await b.sleep(500);
  ok((await b.eval(`return document.querySelector('[data-count]').textContent`)) === '3', 'el contador suma las opciones de ambos generadores (3)');
  await b.eval(`document.querySelector('.dock__toggle').click()`);
  await b.sleep(400);
  const text = await b.eval(`return document.querySelector('.out-block__text').textContent`);
  ok(/^Create the image of an? [^,.]*woman/.test(text), 'el prompt cruzado empieza por la mujer');
  ok(/aquarium|piano/i.test(text), 'incluye el motivo del escenario elegido', text.slice(0, 200));
  ok(/Avoid:/.test(text), 'incluye los negativos de «Calidad máxima»');
  ok(!/[áéíóúñ¿¡]/.test(text.replace(/Médulas|León|María|Café/g, '')), 'el prompt está en inglés (sin acentos del español)');

  step('[4] Formatos de salida');
  for (const f of ['natural', 'sd', 'ideogram', 'midjourney', 'text']) {
    await b.eval(`document.querySelector('.tab[data-format="${f}"]').click()`);
    await b.sleep(250);
    const out = await b.eval(`return [...document.querySelectorAll('.out-block__text')].map(e=>e.textContent).join('\\n---\\n')`);
    const good = { natural: /^Create a highly detailed/m, sd: /masterpiece/, ideogram: /high_level_description/, midjourney: /^a woman, /, text: /^Create the image of/ }[f].test(out);
    ok(good && out.length > 50, `formato «${f}» genera salida válida (${out.length} car.)`);
    if (f === 'ideogram') { try { JSON.parse(out); ok(true, 'el JSON de Ideogram es parseable'); } catch (e) { ok(false, 'JSON de Ideogram parseable', e.message); } }
  }
  await b.eval(`document.querySelector('.segmented__btn[data-value="short"]').click()`);
  await b.sleep(250);
  const shortLen = await b.eval(`return document.querySelector('.out-block__text').textContent.length`);
  await b.eval(`document.querySelector('.segmented__btn[data-value="rich"]').click()`);
  await b.sleep(250);
  const richLen = await b.eval(`return document.querySelector('.out-block__text').textContent.length`);
  ok(richLen > shortLen * 1.5, `«Detallado» (${richLen}) es mucho más largo que «Conciso» (${shortLen})`);
  await b.eval(`const s=document.querySelector('.prompt-panel__controls select'); s.value='9:19.5'; s.dispatchEvent(new Event('change',{bubbles:true}))`);
  await b.sleep(250);
  ok(/Aspect ratio "9:19\.5"/.test(await b.eval(`return document.querySelector('.out-block__text').textContent`)), 'la proporción se añade al prompt');

  step('[5] Constructor');
  await b.goto(base + '/constructor/');
  await b.waitFor(`document.querySelectorAll('.slot').length === 6`, 8000, 'tablero de ranuras');
  ok((await b.eval(`return document.querySelectorAll('.slot').length`)) === 6, 'muestra las 6 ranuras');
  ok((await b.eval(`return document.querySelectorAll('.slot.has-selection').length`)) >= 2, 'resalta las ranuras con selección (sujeto y escenario)');
  ok(await b.eval(`return !document.querySelector('.dock')`), 'no monta el dock (el panel ya está en la página)');
  await b.eval(`document.querySelector('[data-act="clear"]').click()`);
  await b.sleep(300);
  ok(/Tu prompt aparecerá aquí/.test(await b.eval(`return document.querySelector('.empty__title')?.textContent || ''`)), 'vaciar todo deja el estado vacío');
  await b.eval(`document.querySelector('[data-act="random-all"]').click()`);
  await b.waitFor(`document.querySelector('.out-block__text')`, 6000, 'prompt aleatorio');
  ok((await b.eval(`return document.querySelector('.out-block__text').textContent.length`)) > 200, 'la combinación aleatoria genera un prompt');
  const nRandom = await b.eval(`return +document.querySelector('[data-count]').textContent`);
  ok(nRandom > 0 && nRandom < 45, `la combinación aleatoria es contenida (${nRandom} opciones)`);

  step('[6] Galería de ideas (escenarios)');
  await b.eval(`document.querySelector('[data-act="clear"]').click()`);
  await b.eval(`document.querySelector('[data-act="ideas"]').click()`);
  await b.waitFor(`document.querySelector('dialog.ideas[open]')`, 6000, 'cajón de ideas');
  await b.waitFor(`document.querySelectorAll('.idea').length > 10`, 4000, 'ideas');
  ok((await b.eval(`return document.querySelectorAll('.idea').length`)) === 60, 'carga 60 ideas por página');
  await b.eval(input('dialog.ideas input', 'lluvia'));
  await b.sleep(500);
  ok(/de \d+/.test(await b.eval(`return document.querySelector('.ideas__count').textContent`)), 'la búsqueda de ideas filtra');
  await b.eval(`document.querySelector('.idea').click()`);
  await b.sleep(600);
  ok(!(await b.eval(`return !!document.querySelector('dialog.ideas[open]')`)), 'elegir una idea cierra el cajón');
  ok((await b.eval(`return document.querySelectorAll('.slot.has-selection').length`)) >= 1, 'la idea queda aplicada al tablero');
  ok((await b.eval(`return document.querySelector('.out-block__text').textContent.length`)) > 300, 'la idea genera un prompt largo');

  step('[7] Catálogo y navegación');
  await b.goto(base + '/generadores/');
  ok((await b.eval(`return document.querySelectorAll('.card--domain').length`)) === nDomains, `el catálogo lista ${nDomains} generadores`);
  const nSetting = catalog.domains.filter(d => d.role === 'setting').length;
  await b.eval(`document.querySelector('[data-filter="setting"]').click()`);
  await b.sleep(200);
  ok((await b.eval(`return [...document.querySelectorAll('.card--domain')].filter(c=>!c.hidden).length`)) === nSetting, `el filtro «Escenarios» deja ${nSetting} tarjetas`);
  await b.eval(input('[data-search]', 'zzzzqx'));
  await b.sleep(300);
  ok((await b.eval(`return [...document.querySelectorAll('.card--domain')].filter(c=>!c.hidden).length`)) === 0, 'filtro + búsqueda sin coincidencias oculta todas las tarjetas');
  ok(!(await b.eval(`return document.querySelector('[data-empty]').hidden`)), 'aparece el mensaje de «ningún generador coincide»');

  step('[8] Compartir por enlace');
  await b.goto(base + '/generadores/clima/');
  await b.waitFor(`document.querySelectorAll('.opt-section').length > 3`, 8000);
  await b.eval(`document.querySelector('[data-act="clear-domain"]').click(); document.querySelector('#sec-tipo-clima button[data-opt]').click()`);
  await b.sleep(400);
  const code = await b.eval(`const m = await import('/assets/js/core/url-state.js'); const {store} = await import('/assets/js/core/store.js'); store.set({custom:'una sombrilla roja — ñandú'}); return m.encodeState(store.get())`);
  await b.eval('localStorage.clear()');
  await b.goto(`${base}/constructor/#s=${code}`);
  await b.waitFor(`document.querySelector('.out-block__text')`, 6000, 'prompt desde enlace');
  const shared = await b.eval(`return document.querySelector('.out-block__text').textContent`);
  ok(/^Create/.test(shared), 'un enlace compartido restaura el prompt en un navegador limpio');
  ok(/sombrilla roja — ñandú/.test(shared), 'el texto libre con acentos y símbolos viaja intacto en el enlace');
  ok(!/#s=/.test(await b.eval(`return location.hash`)), 'el hash se limpia tras cargar');

  step('[9] Responsive (móvil 390 px)');
  await b.viewport(390, 844);
  for (const p of ['/', '/generadores/mujer/', '/constructor/', '/generadores/', '/guias/']) {
    await b.goto(base + p, 900);
    const over = await b.eval(`return document.documentElement.scrollWidth - window.innerWidth`);
    ok(over <= 1, `${p}: sin desbordamiento horizontal en móvil`, `sobran ${over}px`);
  }
  await b.viewport(1440, 1000);
}
