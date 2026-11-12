/** Galería de poses y de conjuntos: miniaturas, selección, conflictos con las prendas sueltas y puerta de edad. */
export async function run({ b, base, ok, step }) {
  step('[1] Mujer: las dos secciones de galería se montan con sus miniaturas');
  await b.goto(base + '/generadores/mujer/');
  await b.eval('localStorage.clear()');
  await b.goto(base + '/generadores/mujer/');
  await b.waitFor(`document.querySelectorAll('#sec-conjunto-galeria button[data-opt]').length > 1000`, 15000, 'catálogo de conjuntos montado');
  const counts = await b.eval(`return {
    conjuntos: document.querySelectorAll('#sec-conjunto-galeria button[data-opt]').length,
    poses: document.querySelectorAll('#sec-pose-galeria button[data-opt]').length,
    tarjetas: document.querySelectorAll('#sec-conjunto-galeria .opt--thumb').length,
    grupos: document.querySelectorAll('#sec-conjunto-galeria details.opt-group').length,
  }`);
  ok(counts.conjuntos === 1235, `1.235 conjuntos (${counts.conjuntos})`);
  ok(counts.poses === 203, `203 poses (${counts.poses})`);
  ok(counts.tarjetas === counts.conjuntos, 'cada conjunto se pinta como tarjeta con miniatura');
  ok(counts.grupos === 8, `los conjuntos se pliegan en 8 grupos por temporada (${counts.grupos})`);

  step('[2] La miniatura se carga de verdad (no hay 404)');
  await b.eval(`
    const sec = document.querySelector('#sec-conjunto-galeria');
    sec.querySelector('[data-act="toggle"]').click();
    sec.querySelector('details.opt-group').open = true;
    sec.scrollIntoView({ block: 'start' });
    return true;
  `);
  await b.sleep(1200);
  await b.waitFor(`(() => { const i = document.querySelector('#sec-conjunto-galeria details.opt-group[open] img.opt__img'); return i && i.complete && i.naturalWidth > 0; })()`, 8000, 'miniatura cargada');
  const dims = await b.eval(`const i = document.querySelector('#sec-conjunto-galeria details.opt-group[open] img.opt__img'); return [i.naturalWidth, i.naturalHeight, i.getAttribute('loading')];`);
  ok(dims[0] === 360 && dims[1] === 540, `la imagen servida mide 360×540 (${dims[0]}×${dims[1]})`);
  ok(dims[2] === 'lazy', 'las miniaturas se cargan bajo demanda (loading="lazy")');

  step('[3] Elegir un conjunto lo lleva al prompt');
  await b.eval(`document.querySelector('#sec-conjunto-galeria details.opt-group[open] button[data-opt]').click()`);
  await b.sleep(400);
  const chip = await b.eval(`return [...document.querySelectorAll('.chip__text')].map(n => n.textContent).join(' | ')`);
  ok(/^[A-ZÁÉÍÓÚ]/.test(chip) && chip.length > 5, 'el conjunto aparece en «Mi prompt»', chip);
  await b.eval(`document.querySelector('.dock__toggle')?.click()`);
  await b.sleep(300);
  const prompt = await b.eval(`return document.querySelector('.out-block__text')?.textContent || ''`);
  ok(/wearing /.test(prompt), 'el prompt lleva la frase «wearing …» del conjunto', prompt.slice(0, 120));

  step('[4] Elegir una prenda suelta quita el conjunto (conflicto)');
  await b.eval(`document.querySelector('#sec-ropa button[data-opt]').click()`);
  await b.sleep(400);
  const after = await b.eval(`return {
    conjunto: document.querySelectorAll('#sec-conjunto-galeria button[aria-pressed="true"]').length,
    prenda: document.querySelectorAll('#sec-ropa button[aria-pressed="true"]').length,
  }`);
  ok(after.conjunto === 0, 'el conjunto se ha quitado', String(after.conjunto));
  ok(after.prenda === 1, 'la prenda suelta queda elegida', String(after.prenda));

  step('[5] Puerta de edad: las poses sensuales están bloqueadas sin confirmar');
  const blocked = await b.eval(`return document.querySelectorAll('#sec-pose-galeria button[aria-disabled="true"]').length`);
  ok(blocked >= 100, `las poses adult-only se deshabilitan sin confirmar la edad (${blocked})`);
  const safe = await b.eval(`return document.querySelectorAll('#sec-pose-galeria button[data-opt]:not([aria-disabled="true"])').length`);
  ok(safe > 80, `las poses no adultas siguen disponibles (${safe})`);

  step('[6] Poses: elegir una del catálogo sustituye a la pose suelta en Personaje avanzado');
  await b.goto(base + '/generadores/personaje-avanzado/');
  await b.waitFor(`document.querySelectorAll('#sec-pose-galeria button[data-opt]').length === 203`, 15000, 'galería de poses en Personaje avanzado');
  await b.eval(`document.querySelector('#sec-pose-body-pose button[data-opt]').click()`);
  await b.sleep(300);
  await b.eval(`
    const sec = document.querySelector('#sec-pose-galeria');
    sec.querySelector('[data-act="toggle"]').click();
    sec.querySelector('details.opt-group').open = true;
    return true;
  `);
  await b.sleep(400);
  await b.eval(`document.querySelector('#sec-pose-galeria button[data-opt]:not([aria-disabled="true"])').click()`);
  await b.sleep(400);
  const poseState = await b.eval(`return {
    galeria: document.querySelectorAll('#sec-pose-galeria button[aria-pressed="true"]').length,
    suelta: document.querySelectorAll('#sec-pose-body-pose button[aria-pressed="true"]').length,
  }`);
  ok(poseState.galeria === 1 && poseState.suelta === 0, 'la pose de la galería sustituye a la pose suelta', JSON.stringify(poseState));
}
