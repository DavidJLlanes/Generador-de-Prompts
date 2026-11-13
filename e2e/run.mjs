import { BASE_PATH } from '../assets/js/core/site-path.js';
/**
 * Pruebas de extremo a extremo en un navegador real. Uso: npm run test:e2e
 *
 *   · arranca el servidor estático en un puerto libre (con la CSP de producción),
 *   · abre Chrome/Edge sin cabeza y ejecuta las suites de e2e/suites/ en orden,
 *   · falla si alguna comprobación no se cumple o si aparece un error de consola/red.
 *
 * Requiere Chrome o Edge instalado (o CHROME_PATH). Con E2E_OPTIONAL=1 se omite sin error si no hay navegador.
 * Opcional: E2E_ONLY=03 para ejecutar solo las suites cuyo nombre contenga ese texto.
 */
import { readdirSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';
import { createStaticServer } from '../scripts/lib/server.mjs';
import { findChrome, launch } from '../scripts/lib/chrome.mjs';

if (!findChrome()) {
  const msg = 'No se encontró Chrome ni Edge (define CHROME_PATH). Pruebas de navegador omitidas.';
  if (process.env.E2E_OPTIONAL) { console.log('⚠ ' + msg); process.exit(0); }
  console.error('✖ ' + msg);
  process.exit(1);
}

const here = path.dirname(fileURLToPath(import.meta.url));
const server = createStaticServer();
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}${BASE_PATH}`;
const b = await launch();

let pass = 0, fail = 0;
const ctx = {
  b, base,
  shots: path.join(here, 'shots'),
  step: title => console.log(`\n${title}`),
  ok: (cond, msg, extra = '') => { cond ? pass++ : fail++; console.log(`  ${cond ? '✔' : '✖'} ${msg}${!cond && extra ? '  →  ' + extra : ''}`); },
};

try {
  const files = readdirSync(path.join(here, 'suites')).filter(f => f.endsWith('.mjs')).sort().filter(f => !process.env.E2E_ONLY || f.includes(process.env.E2E_ONLY));
  for (const f of files) {
    console.log(`\n══ ${f} ══`);
    b.clearLogs();
    try { await (await import(pathToFileURL(path.join(here, 'suites', f)).href)).run(ctx); }
    catch (e) { fail++; console.log(`  ✖ EXCEPCIÓN: ${e.message}`); }
    const errors = b.logs.filter(l => !/favicon/.test(l));
    ctx.ok(errors.length === 0, `sin errores de consola ni de red en ${f}`, errors.slice(0, 3).join(' | '));
  }
} finally {
  await b.close();
  server.close();
}
console.log(`\nRESULTADO: ${pass} correctas, ${fail} fallidas`);
process.exit(fail ? 1 : 0);
