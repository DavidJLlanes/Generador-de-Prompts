/** Bloqueos entre opciones incompatibles: menores/adultos (seguridad), personajes animados, día/noche. */
const q = (sel, fn) => `const e=document.querySelector(${JSON.stringify(sel)}); return ${fn}`;
const click = sel => `document.querySelector(${JSON.stringify(sel)}).click()`;
const confirmAdult = b => b.eval(`const x=document.querySelector('.adult-notice .btn'); if (x && !x.closest('.adult-notice').classList.contains('is-on')) x.click()`);

export async function run({ b, base, ok, step }) {
  step('[A] Con un niño elegido, Mujer y el contenido adulto quedan bloqueados');
  await b.goto(base + '/generadores/rostros/'); await b.eval('localStorage.clear()'); await b.goto(base + '/generadores/rostros/');
  await b.waitFor(`document.querySelectorAll('.opt-section').length > 5`, 8000);
  await confirmAdult(b); await b.sleep(200);
  await b.eval(click('#sec-edad [data-act="toggle"]')); await b.sleep(200);
  await b.eval(click('#sec-edad button[data-opt="child-3-7-years"]')); await b.sleep(400);
  ok(await b.eval(q('#sec-edad button[data-opt="child-3-7-years"]', `e.classList.contains('is-on')`)), 'se puede elegir la edad de un niño en Rostros');
  const sensual = await b.eval(`return [...document.querySelectorAll('#sec-boca-forma button[data-opt]')].filter(x=>/sensual/i.test(x.textContent)).every(x=>x.getAttribute('aria-disabled')==='true')`);
  ok(sensual, 'la boca «Sensual seductora» queda bloqueada');
  await b.goto(base + '/generadores/mujer/');
  await b.waitFor(`document.querySelectorAll('.opt-section').length > 5`, 8000);
  ok(await b.eval(`return [...document.querySelectorAll('#sec-pecho button[data-opt]')].every(x=>x.getAttribute('aria-disabled')==='true')`), 'todas las opciones de «Busto» están bloqueadas');
  ok(await b.eval(`return !document.querySelector('#sec-pecho [data-block]').hidden && /Sección bloqueada/.test(document.querySelector('#sec-pecho [data-block]').textContent)`), 'la sección muestra el aviso de bloqueo');
  await b.eval(click('#sec-edad [data-act="toggle"]')); await b.sleep(200);
  await b.eval(click('#sec-edad button[data-opt]')); await b.sleep(300);
  ok((await b.eval(`return document.querySelectorAll('#sec-edad button.is-on').length`)) === 0, 'tampoco se puede elegir una mujer: Mujer es solo para adultos');
  ok(/solo para personajes adultos/i.test(await b.eval(`return document.querySelector('.toast')?.textContent || ''`)), 'avisa del motivo al pulsar');

  step('[B] Con lencería elegida, no se puede elegir un niño');
  await b.eval('localStorage.clear()'); await b.goto(base + '/generadores/mujer/');
  await b.waitFor(`document.querySelectorAll('.opt-section').length > 5`, 8000);
  await confirmAdult(b); await b.sleep(200);
  await b.eval(click('#sec-ropa [data-act="toggle"]')); await b.sleep(200);
  await b.eval(`[...document.querySelectorAll('#sec-ropa button[data-opt]')].find(x=>/Lencería de satén/.test(x.textContent)).click()`); await b.sleep(400);
  await b.goto(base + '/generadores/rostros/');
  await b.waitFor(`document.querySelectorAll('.opt-section').length > 5`, 8000);
  ok(await b.eval(q('#sec-edad button[data-opt="child-3-7-years"]', `e.getAttribute('aria-disabled')==='true'`)), 'la edad de niño queda bloqueada');
  ok(await b.eval(q('#sec-edad button[data-opt="young-adult-25-35"]', `e.getAttribute('aria-disabled')!=='true'`)), 'las edades adultas siguen disponibles');
  await b.eval(click('#sec-edad [data-act="toggle"]')); await b.sleep(100);
  await b.eval(click('#sec-edad button[data-opt="child-3-7-years"]')); await b.sleep(300);
  ok(!(await b.eval(q('#sec-edad button[data-opt="child-3-7-years"]', `e.classList.contains('is-on')`))), 'pulsarla no la selecciona');

  step('[C] Personajes animados: solo los verificados como adultos admiten lencería');
  await b.eval('localStorage.clear()'); await b.goto(base + '/generadores/personajes-animados/');
  await b.waitFor(`document.querySelectorAll('.opt-section').length > 5`, 8000);
  await confirmAdult(b); await b.sleep(200);
  await b.eval(click('#sec-personaje [data-act="toggle"]')); await b.sleep(200);
  await b.eval(`[...document.querySelectorAll('#sec-personaje button[data-opt]')].find(x=>/^Riley/.test(x.textContent)).click()`); await b.sleep(400);
  const lingerieBlocked = () => b.eval(`return [...document.querySelectorAll('#sec-vestuario button[data-opt]')].filter(x=>/Lencería/.test(x.textContent)).every(x=>x.getAttribute('aria-disabled')==='true')`);
  ok(await lingerieBlocked(), 'con Riley elegida la lencería está bloqueada');
  await b.eval(`[...document.querySelectorAll('#sec-personaje button[data-opt]')].find(x=>/^Elsa/.test(x.textContent)).click()`); await b.sleep(400);
  ok(!(await lingerieBlocked()), 'con Elsa (adulta verificada) la lencería está disponible');

  step('[D] Día y noche');
  await b.eval('localStorage.clear()'); await b.goto(base + '/generadores/paisajes/');
  await b.waitFor(`document.querySelectorAll('.opt-section').length > 5`, 8000);
  await b.eval(click('#sec-hora [data-act="toggle"]')); await b.sleep(200);
  await b.eval(click('#sec-hora button[data-opt="harsh-noon-sunlight"]')); await b.sleep(300);
  await b.goto(base + '/generadores/clima/');
  await b.waitFor(`document.querySelectorAll('.opt-section').length > 5`, 8000);
  ok(await b.eval(q('#sec-luz-ambiente button[data-opt="moonlight"]', `e.getAttribute('aria-disabled')==='true'`)), 'con el mediodía elegido, la luz de luna queda bloqueada');
  ok(await b.eval(q('#sec-luz-ambiente button[data-opt="clear-daylight"]', `e.getAttribute('aria-disabled')!=='true'`)), 'y la luz de día sigue disponible');

  step('[E] Aviso de contenido para adultos y puerta de edad');
  await b.eval('localStorage.clear()'); await b.goto(base + '/generadores/mujer/');
  await b.waitFor(`document.querySelectorAll('.opt-section').length > 5`, 8000);
  ok(await b.eval(`return !!document.querySelector('.adult-notice') && !document.querySelector('.adult-notice').classList.contains('is-on')`), 'Mujer muestra el aviso de contenido para mayores de 18 años');
  ok(await b.eval(`return [...document.querySelectorAll('#sec-pecho button[data-opt]')].every(x=>x.getAttribute('aria-disabled')==='true') && /18 años/.test(document.querySelector('#sec-pecho [data-block]').textContent)`), 'sin confirmar, «Busto» está bloqueado y explica por qué');
  await b.eval(click('#sec-pecho [data-act="toggle"]')); await b.sleep(150);
  await b.eval(click('#sec-pecho button[data-opt]')); await b.sleep(300);
  ok((await b.eval(`return document.querySelectorAll('#sec-pecho button.is-on').length`)) === 0, 'pulsar una opción bloqueada no la elige');
  await b.eval(click('.adult-notice .btn')); await b.sleep(400);
  ok(await b.eval(`return document.querySelector('.adult-notice').classList.contains('is-on') && [...document.querySelectorAll('#sec-pecho button[data-opt]')].every(x=>x.getAttribute('aria-disabled')!=='true')`), 'al confirmar la edad, las opciones se desbloquean');
  await b.eval(click('#sec-pecho button[data-opt]')); await b.sleep(300);
  ok((await b.eval(`return document.querySelectorAll('#sec-pecho button.is-on').length`)) === 1, 'y ya se pueden elegir');
  await b.eval(click('.adult-notice .btn')); await b.sleep(400);
  ok((await b.eval(`return document.querySelectorAll('#sec-pecho button.is-on').length`)) === 0, 'ocultar el contenido adulto retira lo que se había elegido');
  await b.eval(click('#sec-edad [data-act="toggle"]')); await b.sleep(150);
  await b.eval(click('#sec-edad button[data-opt]')); await b.sleep(300);
  await b.eval(click('.dock__toggle')); await b.sleep(500);
  ok(await b.eval(`return document.querySelectorAll('.prompt-panel__refs .switch__input').length === 2`), 'el panel ofrece adjuntar una referencia de pose y otra de vestuario');
  await b.eval(`document.querySelectorAll('.prompt-panel__refs .switch__input')[0].click()`); await b.sleep(500);
  ok(/attached pose reference image/.test(await b.eval(`return document.querySelector('.out-block__text').textContent`)), 'con la referencia de pose, el prompt pide usar la imagen adjunta');
  await b.goto(base + '/generadores/paisajes/');
  await b.waitFor(`document.querySelectorAll('.opt-section').length > 5`, 8000);
  ok(await b.eval(`return !document.querySelector('.adult-notice')`), 'los generadores sin contenido adulto no muestran el aviso');
}
