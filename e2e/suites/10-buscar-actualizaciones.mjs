/** Menú «Buscar actualizaciones»: compara esta pestaña, el servidor y GitHub (GitHub simulado). */
const stub = (remote) => `
  const real = window.fetch.__real || window.fetch;
  window.fetch = Object.assign((url, o) => String(url).startsWith('https://raw.githubusercontent.com/')
    ? ${remote === null ? "Promise.reject(new TypeError('blocked'))" : `Promise.resolve(new Response(JSON.stringify(${JSON.stringify(remote)}), { status: 200 }))`}
    : real(url, o), { __real: real });`;
const open = `document.querySelector('[data-update-check]').click()`;
const text = `return document.querySelector('.tool-dialog')?.textContent || ''`;

export async function run({ b, base, ok, step }) {
  step('[1] Misma versión que GitHub');
  await b.goto(base + '/constructor/', 600);
  ok(await b.eval(`return !!document.querySelector('.site-nav [data-update-check]')`), 'el menú tiene «Buscar actualizaciones»');
  const server = await b.eval(`return fetch(document.querySelector('link[rel=manifest]').href.replace('manifest.webmanifest','data/version.json')).then(r=>r.json())`);
  ok(/^[0-9a-f]{10}$/.test(server.id), 'el servidor publica data/version.json con un id', JSON.stringify(server));
  await b.eval(stub(server)); await b.eval(open);
  await b.waitFor(`document.querySelector('.tool-dialog .update-rows')`, 6000, 'resultado');
  ok(/última versión/.test(await b.eval(text)), 'dice que estás en la última versión');
  await b.eval(`document.querySelector('.tool-dialog .icon-btn').click()`); await b.sleep(200);

  step('[2] GitHub distinto: muestra el comando');
  await b.eval(stub({ version: '9.9.9', id: 'ffffffffff' })); await b.eval(open);
  await b.waitFor(`document.querySelector('.tool-dialog .update-cmd')`, 6000, 'comando');
  ok(/no coincide con GitHub/.test(await b.eval(text)), 'avisa de que no coincide');
  ok(/git -C .* pull --ff-only origin main/.test(await b.eval(`return document.querySelector('.update-cmd').textContent`)), 'enseña el comando de actualización');
  await b.eval(`document.querySelector('.tool-dialog .icon-btn').click()`); await b.sleep(200);

  step('[3] Sin acceso a GitHub');
  await b.eval(stub(null)); await b.eval(open);
  await b.waitFor(`document.querySelector('.tool-dialog .update-rows')`, 6000, 'resultado');
  ok(/No se pudo consultar GitHub/.test(await b.eval(text)), 'explica que no pudo consultar GitHub');
  ok(await b.eval(`return !document.querySelector('.tool-dialog .update-cmd')`), 'no sugiere actualizar sin datos');
}
