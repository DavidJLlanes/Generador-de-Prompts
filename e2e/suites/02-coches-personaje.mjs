/** Generadores grandes: «Coches» (1.000 opciones en una sección) y «Personaje avanzado» (80 secciones, recetas, épocas). */
const input = (sel, value) => `const s=document.querySelector(${JSON.stringify(sel)}); s.value=${JSON.stringify(value)}; s.dispatchEvent(new Event('input',{bubbles:true}))`;
const visible = sel => `return [...document.querySelectorAll(${JSON.stringify(sel)})].filter(x=>!x.closest('[hidden]') && !x.hidden).length`;

export async function run({ b, base, ok, step }) {
  step('[A] Coches');
  await b.goto(base + '/generadores/coches/'); await b.eval('localStorage.clear()'); await b.goto(base + '/generadores/coches/');
  await b.waitFor(`document.querySelectorAll('.opt-section').length === 5`, 10000, 'secciones de coches');
  ok((await b.eval(`return document.querySelectorAll('#sec-car button[data-opt]').length`)) === 1000, 'la sección «Coche» renderiza los 1.000 coches');
  ok((await b.eval(`return document.querySelectorAll('#sec-car .opt-group').length`)) === 25, 'agrupa por década (míticos) y año (actuales): 25 grupos');
  await b.eval(input('[data-search]', 'ferrari')); await b.sleep(400);
  const fer = await b.eval(visible('#sec-car button[data-opt]'));
  ok(fer > 5 && fer < 100, `buscar «ferrari» deja ${fer} coches`);
  await b.eval(input('[data-search]', 'alemania 1886')); await b.sleep(400);
  ok((await b.eval(visible('#sec-car button[data-opt]'))) >= 1, 'la búsqueda combina palabras en cualquier orden («alemania 1886»)');
  await b.eval(input('[data-search]', '')); await b.sleep(300);
  await b.eval(`document.querySelector('#sec-car button[data-opt="benz-patent-motorwagen-1886"]').click(); document.querySelector('#sec-color button[data-opt]').click(); document.querySelector('#sec-escena-foto button[data-opt]').click();`);
  await b.sleep(600);
  await b.eval(`document.querySelector('.dock__toggle').click()`); await b.sleep(500);
  const t = await b.eval(`return document.querySelector('.out-block__text').textContent`);
  ok(/^Create the image of a car, the 1886 Benz Patent-Motorwagen from Germany/.test(t), 'el prompt empieza con el coche elegido', t.slice(0, 120));
  ok(/finished in/.test(t), 'incluye el color y acabado');
  ok(/Ultra-realistic automotive photograph of the car/.test(t), 'incluye la escena fotográfica sin el coche duplicado');
  ok(!/\{[a-z]+\}/i.test(t), 'no quedan marcadores sin sustituir');
  await b.eval(`document.querySelector('#sec-escena-ilustracion button[data-opt]').click()`); await b.sleep(400);
  ok((await b.eval(`return document.querySelectorAll('#sec-escena-foto button[aria-pressed="true"]').length`)) === 0, 'elegir una escena ilustrada quita la fotográfica (conflicto declarado)');
  ok(/Se quitó/.test(await b.eval(`return document.querySelector('.toast')?.textContent || ''`)), 'avisa de lo que se quitó');

  step('[B] Cruce coche + mujer');
  await b.goto(base + '/generadores/mujer/');
  await b.waitFor(`document.querySelectorAll('.opt-section').length > 5`);
  await b.eval(`document.querySelector('#sec-edad button[data-opt]').click()`); await b.sleep(400);
  await b.eval(`document.querySelector('.dock__toggle').click()`); await b.sleep(500);
  const x = await b.eval(`return document.querySelector('.out-block__text').textContent`);
  ok(/Benz Patent-Motorwagen/.test(x) && /woman/.test(x), 'la selección del coche se cruza con la de la mujer');

  step('[C] Personaje avanzado');
  await b.goto(base + '/generadores/personaje-avanzado/'); await b.eval('localStorage.clear()'); await b.goto(base + '/generadores/personaje-avanzado/');
  await b.waitFor(`document.querySelectorAll('.opt-section').length > 50`, 10000, 'secciones');
  ok((await b.eval(`return document.querySelectorAll('.opt-section').length`)) === 80, 'renderiza 80 secciones');
  ok(await b.eval(`return !!document.querySelector('#sec-body-bust') && [...document.querySelectorAll('[data-s]')].some(e=>/large bust/.test(e.dataset.s)) && ![...document.querySelectorAll('[data-s]')].some(e=>/topless|naked|nipple|explicit|nsfw/.test(e.dataset.s))`), 'el generador de adultos incluye la sección de busto y lencería, sin contenido explícito');
  ok(/Ver 6 recetas|Ver 11 recetas/.test(await b.eval(`return document.querySelector('[data-act="ideas"]').textContent`)), 'el botón habla de «recetas», no de «ideas»');
  await b.eval(`document.querySelector('[data-act="ideas"]').click()`);
  await b.waitFor(`document.querySelector('dialog.ideas[open]')`, 6000);
  await b.waitFor(`document.querySelectorAll('.idea').length > 5`, 4000);
  ok((await b.eval(`return document.querySelectorAll('.idea').length`)) === 11, 'la galería ofrece las 11 recetas (5 estilos + 6 culturas)');
  await b.eval(`[...document.querySelectorAll('.idea')].find(e=>/Japonesa/.test(e.textContent)).click()`);
  await b.sleep(700);
  ok(+(await b.eval(`return document.querySelector('[data-count]').textContent`)) >= 10, 'la receta «Cultura · Japonesa» aplica 10 o más opciones');
  await b.eval(`document.querySelector('#sec-identity-age button[data-opt="age-25"]').click()`);
  await b.eval(`document.querySelector('#sec-era button[data-opt="1950s"]').click()`);
  await b.sleep(400);
  await b.eval(`document.querySelector('.dock__toggle').click()`); await b.sleep(500);
  const g = await b.eval(`return document.querySelector('.out-block__text').textContent`);
  ok(/Japanese/.test(g), 'el prompt refleja la cultura elegida');
  ok(/Styled in the 1950s manner/.test(g), 'la época 1950s añade su descripción completa');
  ok(/^Create the image of a 25-year-old woman/.test(g), 'la edad se funde con la frase inicial («a 25-year-old woman»)', g.slice(0, 110));
}
