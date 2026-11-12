/** Familias de secciones: un concepto, una elección (data/families.js). */
export async function run({ b, base, ok, step }) {
  step('[1] Aviso en la sección: comparte concepto con otro generador');
  await b.goto(base + '/generadores/mujer/');
  await b.eval('localStorage.clear()');
  await b.goto(base + '/generadores/mujer/');
  await b.waitFor(`document.querySelectorAll('#sec-colorpelo button[data-opt]').length > 20`, 10000, 'sección de color de pelo');
  await b.eval(`document.querySelector('#sec-colorpelo [data-act="toggle"]').click(); return true;`);
  await b.sleep(300);
  const note = await b.eval(`return document.querySelector('#sec-colorpelo .opt-section__family')?.textContent || ''`);
  ok(/color del pelo/.test(note) && /Peinados/.test(note), 'la sección avisa de que comparte concepto con Peinados', note);

  step('[2] Elegir en Peinados y luego en Mujer: gana la última y se avisa');
  await b.goto(base + '/generadores/peinados/');
  await b.waitFor(`document.querySelectorAll('#sec-color-principal button[data-opt]').length > 20`, 10000, 'color principal de Peinados');
  await b.eval(`document.querySelector('#sec-color-principal button[data-opt]').click(); return true;`);
  await b.sleep(300);
  const before = await b.eval(`return JSON.parse(localStorage.getItem('lv:v1:workspace')).sel.hairstyles?.['color-principal']?.length || 0`);
  ok(before === 1, 'el color de pelo queda elegido en Peinados');

  await b.goto(base + '/generadores/mujer/');
  await b.waitFor(`document.querySelectorAll('#sec-colorpelo button[data-opt]').length > 20`, 10000, 'color de pelo de Mujer');
  await b.eval(`document.querySelector('#sec-colorpelo button[data-opt]').click(); return true;`);
  await b.sleep(500);
  const state = await b.eval(`const s = JSON.parse(localStorage.getItem('lv:v1:workspace')).sel; return {
    peloMujer: s.woman?.colorpelo?.length || 0,
    peloPeinados: s.hairstyles?.['color-principal']?.length || 0,
  }`);
  ok(state.peloMujer === 1, 'la elección de Mujer se conserva', JSON.stringify(state));
  ok(state.peloPeinados === 0, 'la de Peinados se ha quitado', JSON.stringify(state));
  const toast = await b.eval(`return document.querySelector('.toast')?.textContent || ''`);
  ok(/describe lo mismo/.test(toast), 'el aviso explica que describen lo mismo', toast);

  step('[3] Un enlace viejo con las dos secciones se poda al abrirlo');
  await b.eval(`localStorage.setItem('lv:v1:workspace', JSON.stringify({ v: 1, sel: { woman: { colorpelo: ['jet-black-hair'] }, hairstyles: { 'color-principal': ['pure-jet-black'] } }, locks: {}, detail: 'rich', boost: false, aspect: '', format: 'text', custom: '' })); return true;`);
  await b.goto(base + '/generadores/mujer/');
  await b.waitFor(`document.querySelectorAll('#sec-colorpelo button[data-opt]').length > 20`, 10000, 'Mujer con la selección cargada');
  // La poda ocurre al cargar; se guarda en el siguiente cambio, así que se fuerza uno.
  await b.eval(`document.querySelector('#sec-edad button[data-opt]').click(); return true;`);
  await b.sleep(400);
  const pruned = await b.eval(`const s = JSON.parse(localStorage.getItem('lv:v1:workspace')).sel; return {
    peloMujer: s.woman?.colorpelo?.length || 0,
    peloPeinados: s.hairstyles?.['color-principal']?.length || 0,
  }`);
  ok(pruned.peloMujer === 1 && pruned.peloPeinados === 0, 'solo sobrevive una sección de la familia', JSON.stringify(pruned));

  step('[4] Lo que no comparte concepto no se toca');
  await b.eval(`localStorage.clear()`);
  await b.goto(base + '/generadores/mujer/');
  await b.waitFor(`document.querySelectorAll('#sec-peinado button[data-opt]').length > 20`, 10000, 'sección de peinado');
  await b.eval(`document.querySelector('#sec-peinado button[data-opt]').click(); document.querySelector('#sec-colorpelo button[data-opt]').click(); return true;`);
  await b.sleep(400);
  const both = await b.eval(`const s = JSON.parse(localStorage.getItem('lv:v1:workspace')).sel; return {
    peinado: s.woman?.peinado?.length || 0,
    color: s.woman?.colorpelo?.length || 0,
  }`);
  ok(both.peinado === 1 && both.color === 1, 'peinado y color de pelo conviven (son familias distintas)', JSON.stringify(both));
}
