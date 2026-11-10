/** Funciones de usuario y coherencia: texto libre, Mis prompts (guardar/cargar/historial), recetas y conflictos. */
const clickByText = (sel, text) => `[...document.querySelectorAll(${JSON.stringify(sel)})].find(e=>e.textContent.trim().includes(${JSON.stringify(text)})).click()`;
const type = (sel, value) => `const s=document.querySelector(${JSON.stringify(sel)}); s.focus(); s.value=${JSON.stringify(value)}; s.dispatchEvent(new Event('input',{bubbles:true}))`;

export async function run({ b, base, ok, step }) {
  step('[A] Texto libre');
  await b.goto(base + '/generadores/mujer/'); await b.eval('localStorage.clear()'); await b.goto(base + '/generadores/mujer/');
  await b.waitFor(`document.querySelectorAll('.opt-section').length > 5`, 8000);
  await b.eval(`document.querySelector('#sec-edad button[data-opt]').click()`); await b.sleep(300);
  await b.eval(`document.querySelector('.dock__toggle').click()`); await b.sleep(400);
  await b.eval(type('.prompt-panel .field__textarea', 'a small red umbrella, cinematic fog'));
  await b.sleep(700);
  const out = await b.eval(`return document.querySelector('.out-block__text').textContent`);
  ok(/a small red umbrella, cinematic fog/i.test(out), 'el texto libre se añade al prompt');
  ok((await b.eval(`return document.querySelector('.prompt-panel .field__textarea').value`)) === 'a small red umbrella, cinematic fog', 'escribir no pisa lo que el usuario teclea');
  ok(/Texto libre/.test(await b.eval(`return document.querySelector('.prompt-panel__summary').textContent`)), 'aparece como «Texto libre» en el resumen');
  await b.eval(`document.querySelector('.tab[data-format="natural"]').click()`); await b.sleep(300);
  ok(/Additional details: a small red umbrella/.test(await b.eval(`return document.querySelector('.out-block__text').textContent`)), 'en el formato ChatGPT/Gemini va en «Additional details»');
  await b.eval(`document.querySelector('.tab[data-format="midjourney"]').click()`); await b.sleep(300);
  ok(/--no /.test(await b.eval(`return document.querySelector('.out-block__text').textContent`)), 'el formato Midjourney lleva --no');
  await b.eval(`document.querySelector('.tab[data-format="text"]').click()`);

  step('[B] Mis prompts: guardar, historial, cargar');
  await b.eval(clickByText('.prompt-panel__actions .btn', 'Copiar prompt')); await b.sleep(300);
  await b.eval(clickByText('.prompt-panel__actions .btn', 'Mis prompts'));
  await b.waitFor(`document.querySelector('dialog.lib[open]')`, 4000, 'diálogo Mis prompts');
  ok(/Guardados \(0\)/.test(await b.eval(`return document.querySelector('dialog.lib .tabs').textContent`)), 'empieza sin guardados');
  ok(/Historial \(1\)/.test(await b.eval(`return document.querySelector('dialog.lib .tabs').textContent`)), 'copiar el prompt lo anota en el historial');
  await b.eval(type('dialog.lib .lib__name', 'Retrato con paraguas'));
  await b.eval(`document.querySelector('dialog.lib .lib__save .btn--primary').click()`); await b.sleep(500);
  ok(/Guardados \(1\)/.test(await b.eval(`return document.querySelector('dialog.lib .tabs').textContent`)), 'guardar añade el prompt a «Guardados»');
  ok((await b.eval(`return document.querySelector('dialog.lib .lib__item-name').value`)) === 'Retrato con paraguas', 'conserva el nombre elegido');
  await b.waitFor(`/Create the image/.test(document.querySelector('dialog.lib .lib__preview')?.textContent || '')`, 5000, 'vista previa');
  ok(true, 'muestra una vista previa del prompt guardado');
  await b.eval(`document.querySelector('dialog.lib .icon-btn').click()`); await b.sleep(300);
  await b.eval(`document.querySelector('.prompt-panel__actions .btn--ghost').click()`); await b.sleep(500); // Vaciar
  ok((await b.eval(`return document.querySelector('.prompt-panel .field__textarea').value`)) === '', 'Vaciar limpia también el texto libre');
  await b.eval(clickByText('.prompt-panel__actions .btn', 'Mis prompts'));
  await b.waitFor(`document.querySelector('dialog.lib[open]')`, 4000);
  await b.eval(clickByText('dialog.lib .lib__item-actions .btn', 'Cargar')); await b.sleep(700);
  ok(!(await b.eval(`return !!document.querySelector('dialog.lib[open]')`)), 'cargar cierra el diálogo');
  ok(/a small red umbrella/i.test(await b.eval(`return document.querySelector('.out-block__text').textContent`)), 'cargar restaura selección y texto libre');
  ok((await b.eval(`return document.querySelector('.prompt-panel .field__textarea').value`)) === 'a small red umbrella, cinematic fog', 'el campo de texto libre vuelve a mostrar lo cargado');
  const stored = await b.eval(`return JSON.parse(localStorage.getItem('lv:v1:library')).saved.length`);
  ok(stored === 1, 'la biblioteca se guarda en el navegador (localStorage)');

  step('[C] Recetas de un generador');
  await b.goto(base + '/generadores/mujer/'); await b.eval('localStorage.removeItem("lv:v1:workspace")'); await b.goto(base + '/generadores/mujer/');
  await b.waitFor(`document.querySelectorAll('.opt-section').length > 5`, 8000);
  ok(/Ver 6 recetas/.test(await b.eval(`return document.querySelector('[data-act="ideas"]').textContent`)), 'Mujer ofrece «Ver 6 recetas»');
  await b.eval(`document.querySelector('[data-act="ideas"]').click()`);
  await b.waitFor(`document.querySelectorAll('.idea').length === 6`, 5000, 'recetas');
  ok(/Recetas de/.test(await b.eval(`return document.querySelector('dialog.ideas .ideas__title').textContent`)), 'el cajón se titula «Recetas de …»');
  await b.eval(`document.querySelector('.idea').click()`); await b.sleep(700);
  ok(+(await b.eval(`return document.querySelector('[data-count]').textContent`)) >= 8, 'una receta rellena 8 o más secciones');
  await b.eval(`document.querySelector('.dock__toggle').click()`); await b.sleep(500);
  const r = await b.eval(`return document.querySelector('.out-block__text').textContent`);
  ok(/^Create the image of an? [^,.]*woman/.test(r) && r.length > 600, 'la receta compone un prompt largo y coherente', r.slice(0, 90));
  ok(!/[áéíóúñ¿¡]/.test(r), 'y en inglés');

  step('[D] Conflictos entre secciones');
  await b.goto(base + '/generadores/escenarios/'); await b.eval('localStorage.clear()'); await b.goto(base + '/generadores/escenarios/');
  await b.waitFor(`document.querySelectorAll('.opt-section').length === 6`, 8000);
  await b.eval(`document.querySelector('#sec-motivo button[data-opt]').click(); document.querySelector('#sec-estilo button[data-opt]').click();`); await b.sleep(400);
  await b.eval(`document.querySelector('#sec-ideas button[data-opt]').click()`); await b.sleep(500);
  ok((await b.eval(`return document.querySelectorAll('#sec-motivo button[aria-pressed="true"]').length`)) === 0, 'elegir una idea destacada quita el motivo');
  ok((await b.eval(`return document.querySelectorAll('#sec-estilo button[aria-pressed="true"]').length`)) === 1, 'pero conserva el estilo, que no choca');
  ok(/Se quitó «Motivo»/.test(await b.eval(`return document.querySelector('.toast')?.textContent || ''`)), 'avisa: «Se quitó «Motivo»…»');
  await b.goto(base + '/generadores/clima/');
  await b.waitFor(`document.querySelectorAll('.opt-section').length > 5`, 8000);
  await b.eval(`const o=document.querySelectorAll('#sec-tipo-clima button[data-opt]'); o[0].click(); o[3].click();`); await b.sleep(300);
  ok((await b.eval(`return document.querySelectorAll('#sec-tipo-clima button[aria-pressed="true"]').length`)) === 1, 'el tipo de clima es de elección única (no mezcla «soleado» con «lluvia»)');
}
