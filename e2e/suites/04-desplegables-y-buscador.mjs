/** Subdesplegables por grupo (coches y otros) y buscador global de opciones. */
const input = (sel, value) => `const s=document.querySelector(${JSON.stringify(sel)}); s.value=${JSON.stringify(value)}; s.dispatchEvent(new Event('input',{bubbles:true}))`;

export async function run({ b, base, ok, step }) {
  step('[A] Coches: subdesplegables por año');
  await b.goto(base + '/generadores/coches/'); await b.eval('localStorage.clear()'); await b.goto(base + '/generadores/coches/');
  await b.waitFor(`document.querySelectorAll('.opt-section').length === 5`, 10000, 'secciones de coches');
  await b.eval(`document.querySelector('#sec-car [data-act="toggle"]').click()`); await b.sleep(300);
  ok((await b.eval(`return document.querySelectorAll('#sec-car details.opt-group--fold').length`)) === 25, 'los 25 grupos son desplegables');
  ok((await b.eval(`return document.querySelectorAll('#sec-car details[open]').length`)) === 0, 'empiezan todos cerrados');
  const titles = await b.eval(`return [...document.querySelectorAll('#sec-car .opt-group__title')].map(e=>e.textContent)`);
  ok(titles[0] === 'Míticos · 1880s' && titles[14] === 'Míticos · 2020s' && titles[15] === 'Actuales · 2016' && titles[24] === 'Actuales · 2025', 'los grupos van en orden cronológico');
  const names = await b.eval(`return [...document.querySelectorAll('#sec-car details[data-group="actuales-2018"] button[data-opt]')].map(e=>e.textContent)`);
  const sorted = [...names].sort((x, y) => x.localeCompare(y, 'es', { sensitivity: 'base', numeric: true }));
  ok(names.length > 5 && JSON.stringify(names) === JSON.stringify(sorted), 'dentro de un año los coches van por orden alfabético de marca y modelo');
  await b.eval(`document.querySelector('#sec-car details[data-group="actuales-2018"] summary').click()`); await b.sleep(200);
  ok(await b.eval(`return document.querySelector('#sec-car details[data-group="actuales-2018"]').open`), 'pulsar el resumen abre el grupo');
  await b.eval(`document.querySelector('#sec-car details[data-group="actuales-2018"] button[data-opt]').click()`); await b.sleep(300);
  ok((await b.eval(`return document.querySelector('#sec-car details[data-group="actuales-2018"] [data-group-sel]').textContent`)) === '1', 'el grupo muestra cuántos hay elegidos');
  await b.eval(input('[data-search]', 'ferrari')); await b.sleep(400);
  ok((await b.eval(`return document.querySelectorAll('#sec-car details[open]:not([hidden])').length`)) > 1, 'la búsqueda abre los grupos con resultados');
  ok(!(await b.eval(`return document.querySelector('#sec-car details[data-group="miticos-1880s"]').open`)), 'y deja cerrados los que no tienen');
  await b.eval(input('[data-search]', '')); await b.sleep(400);
  ok((await b.eval(`return document.querySelectorAll('#sec-car details[open]').length`)) === 1, 'al limpiar la búsqueda vuelve el estado anterior');

  step('[B] Buscador global');
  await b.goto(base + '/generadores/');
  await b.waitFor(`document.querySelector('[data-search]')`, 5000);
  await b.eval(input('[data-search]', 'ferrari 250'));
  await b.waitFor(`!document.querySelector('[data-hits]').hidden`, 6000, 'resultados del buscador global');
  const hitTexts = await b.eval(`return [...document.querySelectorAll('[data-hits-list] a')].map(a=>a.textContent)`);
  ok(hitTexts.length >= 1 && hitTexts.every(t => /ferrari/i.test(t) && /Coches/i.test(t)), 'encuentra opciones de otros generadores', hitTexts.slice(0, 2).join(' | '));
  const href = await b.eval(`return document.querySelector('[data-hits-list] a').getAttribute('href')`);
  ok(/^\/generadores\/coches\/\?q=.+#sec-car$/.test(href), 'el enlace lleva al generador, a la sección y con la búsqueda', href);
  await b.goto(base + href);
  await b.waitFor(`document.querySelectorAll('.opt-section').length === 5`, 10000);
  await b.sleep(500);
  ok((await b.eval(`return document.querySelector('[data-search]').value`)).length > 0, 'la página del generador llega con la búsqueda rellenada');
  ok((await b.eval(`return document.querySelectorAll('#sec-car details[open]:not([hidden])').length`)) >= 1, 'y con el grupo de coincidencias abierto');

  step('[C] Inicio');
  await b.goto(base + '/');
  ok((await b.eval(`return !!document.querySelector('form.hero__search input[name="q"]')`)), 'el inicio tiene el buscador de opciones');
}
