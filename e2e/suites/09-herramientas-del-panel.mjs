/** Herramientas del panel: avisos de contradicción, tokens y prioridad, ajustes de Midjourney, importar, variantes A/B, exportar y valoraciones. */
const clickByText = (sel, text) => `[...document.querySelectorAll(${JSON.stringify(sel)})].find(e=>e.textContent.trim().includes(${JSON.stringify(text)})).click()`;
const type = (sel, value) => `const s=document.querySelector(${JSON.stringify(sel)}); s.focus(); s.value=${JSON.stringify(value)}; s.dispatchEvent(new Event('input',{bubbles:true}))`;
const out = `return [...document.querySelectorAll('.prompt-panel__out .out-block__text, .prompt-panel__out .out-edit__text')].map(e=>e.value||e.textContent).join('\\n')`;

export async function run({ b, base, ok, step }) {
  step('[1] Menú Herramientas, tokens y ajustes por formato');
  await b.goto(base + '/constructor/'); await b.eval('localStorage.clear()');
  await b.goto(base + '/constructor/?plantilla=mustang-montana', 1200); // coche + paisaje + fotografía: sujeto, escenario y técnica en ranuras distintas
  await b.waitFor(`document.querySelector('.prompt-panel__out .out-block__text')`, 8000, 'prompt de la plantilla');
  ok(await b.eval(`const d=document.querySelector('.tools-menu'); return !!d && d.querySelectorAll('.tools-menu__item').length === 3`), 'el menú Herramientas tiene tres entradas');
  await b.eval(`document.querySelector('.tools-menu summary').click()`); await b.sleep(200);
  ok(await b.eval(`return document.querySelector('.tools-menu').open`), 'se abre');
  await b.eval(`document.body.click()`); await b.sleep(200);
  ok(!(await b.eval(`return document.querySelector('.tools-menu').open`)), 'se cierra al pulsar fuera');
  ok(await b.eval(`return document.querySelector('.prompt-tokens').textContent === ''`), 'en el formato Texto no hay recuento de tokens');
  await b.eval(`document.querySelector('.prompt-panel .tab[data-format="sd"]').click()`); await b.sleep(400);
  ok(/≈ \d+ tokens de 75/.test(await b.eval(`return document.querySelector('.prompt-tokens').textContent`)), 'Stable Diffusion muestra los tokens frente al límite de 75');
  ok(await b.eval(`return !document.querySelector('.prompt-panel .switch input[type=checkbox]:not([hidden])') || [...document.querySelectorAll('.prompt-panel__controls .switch')].some(s=>/Estilo y escena primero/.test(s.textContent) && !s.hidden)`), 'aparece «Estilo y escena primero»');
  const before = await b.eval(out);
  await b.eval(`[...document.querySelectorAll('.prompt-panel__controls .switch')].find(s=>/Estilo y escena primero/.test(s.textContent)).querySelector('input').click()`); await b.sleep(400);
  ok(await b.eval(out) !== before, 'activarla reordena el prompt');
  ok(await b.eval(`return JSON.parse(localStorage.getItem('lv:v1:workspace')).priority === true`), 'la preferencia se guarda');
  await b.eval(`document.querySelector('.prompt-panel .tab[data-format="midjourney"]').click()`); await b.sleep(400);
  ok(await b.eval(`return !document.querySelector('.prompt-panel__mj').hidden`), 'los ajustes de Midjourney aparecen en su pestaña');
  await b.eval(`const v=document.querySelector('.prompt-panel__mj select'); v.value='7'; v.dispatchEvent(new Event('change',{bubbles:true}))`); await b.sleep(250);
  await b.eval(`const i=document.querySelector('.prompt-panel__mj input[type=number]'); i.value='300'; i.dispatchEvent(new Event('change',{bubbles:true}))`); await b.sleep(250);
  await b.eval(`document.querySelector('.prompt-panel__mj .mj-field--check input').click()`); await b.sleep(400);
  ok(/ --v 7 --raw --s 300/.test(await b.eval(out)), 'el prompt de Midjourney lleva --v 7 --raw --s 300', await b.eval(out));
  await b.eval(`document.querySelector('.prompt-panel .tab[data-format="text"]').click()`); await b.sleep(300);
  ok(await b.eval(`return document.querySelector('.prompt-panel__mj').hidden`), 'fuera de Midjourney se ocultan');

  step('[2] Aviso de contradicciones');
  await b.eval(`const w=JSON.parse(localStorage.getItem('lv:v1:workspace')); w.sel={photo:{lighting:['moonlight-silver']}, woman:{edad:[Object.keys({})[0]||'x']}}; w.sel={photo:{lighting:['moonlight-silver']}}; w.custom='harsh noon sunlight'; localStorage.setItem('lv:v1:workspace', JSON.stringify(w))`);
  await b.goto(base + '/constructor/', 900);
  await b.waitFor(`document.querySelector('.prompt-review__warn')`, 6000, 'aviso de contradicción');
  ok(/Hora del día/.test(await b.eval(`return document.querySelector('.prompt-review__warn').textContent`)), 'avisa de noche frente a pleno día');
  await b.eval(`document.querySelector('.prompt-review__warn .chip--removable').click()`); await b.sleep(500);
  ok(!(await b.eval(`return !!document.querySelector('.prompt-review__warn')`)), 'quitar una de las dos piezas resuelve el aviso');

  step('[3] Importar un prompt');
  await b.eval('localStorage.clear()');
  await b.goto(base + '/constructor/', 700);
  await b.eval(`document.querySelector('.tools-menu summary').click()`);
  await b.eval(clickByText('.tools-menu__item', 'Importar un prompt')); await b.sleep(400);
  ok(await b.eval(`return !!document.querySelector('dialog.tool-dialog[open]')`), 'se abre el diálogo');
  await b.eval(type('dialog.tool-dialog textarea', 'a tiny crimson teapot floating above a velvet cushion, 85mm portrait lens, shallow depth of field --ar 16:9 --v 7 --no text'));
  await b.eval(clickByText('dialog.tool-dialog .btn', 'Analizar'));
  await b.waitFor(`/reconocid/.test(document.querySelector('dialog.tool-dialog .tool-status').textContent)`, 8000, 'resultado del análisis');
  ok(await b.eval(`return document.querySelectorAll('dialog.tool-dialog .imp-chip').length >= 1`), 'muestra las opciones reconocidas');
  ok(/crimson teapot/.test(await b.eval(`return document.querySelector('dialog.tool-dialog .imp-custom').textContent`)), 'lo que no reconoce va al texto libre');
  await b.eval(clickByText('dialog.tool-dialog .btn', 'Sustituir mi prompt')); await b.sleep(700);
  ok(!(await b.eval(`return !!document.querySelector('dialog.tool-dialog[open]')`)), 'se cierra al aplicar');
  const ws = await b.eval(`return JSON.parse(localStorage.getItem('lv:v1:workspace'))`);
  ok(ws.aspect === '16:9' && /crimson teapot/.test(ws.custom) && Object.keys(ws.sel).length >= 1, 'la selección, el texto libre y la proporción se aplican');
  await b.eval(clickByText('.prompt-panel__actions .btn', 'Deshacer')); await b.sleep(400);
  ok(await b.eval(`return Object.keys(JSON.parse(localStorage.getItem('lv:v1:workspace')).sel).length === 0`), 'Deshacer lo revierte de una vez');

  step('[4] Variantes A/B');
  await b.goto(base + '/constructor/?plantilla=retrato-editorial', 1200);
  await b.waitFor(`document.querySelector('.prompt-panel__out .out-block__text')`, 8000);
  const sel0 = await b.eval(`return localStorage.getItem('lv:v1:workspace')`);
  await b.eval(`document.querySelector('.tools-menu summary').click()`);
  await b.eval(clickByText('.tools-menu__item', 'Variantes A/B')); await b.sleep(500);
  ok(await b.eval(`return document.querySelectorAll('dialog.tool-dialog .var-card').length === 4`), 'muestra cuatro variantes');
  const t0 = await b.eval(`return document.querySelector('dialog.tool-dialog .var-card__text').textContent`);
  await b.eval(clickByText('dialog.tool-dialog .btn', 'Otras cuatro')); await b.sleep(400);
  ok(await b.eval(`return document.querySelectorAll('dialog.tool-dialog .var-card').length === 4`), '«Otras cuatro» vuelve a tirar');
  await b.eval(`document.querySelector('dialog.tool-dialog .var-card .btn--primary').click()`); await b.sleep(600);
  ok(await b.eval(`return localStorage.getItem('lv:v1:workspace')`) !== sel0, 'usar una variante cambia la selección');
  ok(t0.length > 30, 'cada variante muestra su prompt');

  step('[5] Exportar en lote');
  await b.eval(`document.querySelector('.tools-menu summary').click()`);
  await b.eval(clickByText('.tools-menu__item', 'Exportar en lote')); await b.sleep(400);
  await b.eval(`document.querySelector('dialog.tool-dialog input[type=number]').value='3'`);
  await b.eval(clickByText('dialog.tool-dialog .btn', 'Generar y descargar CSV'));
  await b.waitFor(`/3 prompts descargados/.test(document.querySelector('dialog.tool-dialog .tool-status').textContent)`, 20000, 'CSV generado');
  ok(true, 'el lote CSV de 3 prompts se genera');
  await b.eval(clickByText('dialog.tool-dialog .btn', 'Descargar ZIP de wildcards'));
  await b.waitFor(`/listas descargadas/.test(document.querySelectorAll('dialog.tool-dialog .tool-status')[1].textContent)`, 20000, 'ZIP de wildcards');
  ok(true, 'el ZIP de wildcards se genera');
  await b.eval(`document.querySelector('dialog.tool-dialog .icon-btn').click()`); await b.sleep(300);

  step('[6] Valoraciones en Mis prompts');
  await b.eval(clickByText('.prompt-panel__actions .btn', 'Mis prompts'));
  await b.waitFor(`document.querySelector('dialog.lib[open]')`, 4000);
  await b.eval(type('dialog.lib .lib__name', 'Retrato valorado'));
  await b.eval(`document.querySelector('dialog.lib .lib__save .btn--primary').click()`); await b.sleep(500);
  await b.eval(`document.querySelectorAll('dialog.lib .lib__item .star')[3].click()`); await b.sleep(200);
  await b.eval(`const m=document.querySelector('dialog.lib .lib__model'); m.value='Flux dev'; m.dispatchEvent(new Event('change',{bubbles:true}))`); await b.sleep(250);
  const lib = await b.eval(`return JSON.parse(localStorage.getItem('lv:v1:library')).saved[0]`);
  ok(lib.rating === 4 && lib.model === 'Flux dev', 'estrellas y modelo se guardan', JSON.stringify({ r: lib.rating, m: lib.model }));
  ok(await b.eval(`return document.querySelectorAll('dialog.lib .star.is-on').length === 4`), 'se pintan las cuatro estrellas');
  await b.eval(`document.querySelectorAll('dialog.lib .lib__item .star')[3].click()`); await b.sleep(200);
  ok(await b.eval(`return JSON.parse(localStorage.getItem('lv:v1:library')).saved[0].rating`) === 0, 'pulsar la misma estrella otra vez la quita');
}
