/**
 * Auditoría de accesibilidad con axe-core sobre las páginas y estados principales (WCAG 2.x A/AA + buenas prácticas).
 * Uso: npm run audit:a11y   (requiere Chrome/Edge y axe-core: `npm i -D axe-core`, o AXE_PATH=/ruta/a/axe.min.js)
 * Sale con código 1 si hay violaciones de impacto serio o crítico.
 */
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { createStaticServer } from './lib/server.mjs';
import { findChrome, launch } from './lib/chrome.mjs';

const require = createRequire(import.meta.url);
let axePath = process.env.AXE_PATH;
if (!axePath) { try { axePath = require.resolve('axe-core/axe.min.js'); } catch { /* se avisa abajo */ } }
if (!axePath) { console.error('✖ Falta axe-core. Instálalo con «npm i -D axe-core» o define AXE_PATH con la ruta a axe.min.js.'); process.exit(1); }
if (!findChrome()) { console.error('✖ No se encontró Chrome ni Edge (define CHROME_PATH).'); process.exit(1); }
const AXE = readFileSync(axePath, 'utf8');

const server = createStaticServer();
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const clickText = (sel, text) => `[...document.querySelectorAll(${JSON.stringify(sel)})].find(e=>e.textContent.includes(${JSON.stringify(text)})).click()`;
// Cada caso: nombre, ruta y preparación opcional (estados interactivos).
const CASES = [
  { name: 'Inicio', path: '/' },
  { name: 'Catálogo', path: '/generadores/' },
  { name: 'Generador (Mujer)', path: '/generadores/mujer/', wait: `document.querySelectorAll('.opt-section').length > 5` },
  { name: 'Generador con selección y dock abierto', path: '/generadores/mujer/', wait: `document.querySelectorAll('.opt-section').length > 5`, setup: `document.querySelector('#sec-edad button[data-opt]').click(); await new Promise(r=>setTimeout(r,400)); document.querySelector('.dock__toggle').click(); await new Promise(r=>setTimeout(r,500));` },
  { name: 'Generador con tarjetas (Poses)', path: '/generadores/poses/', wait: `document.querySelectorAll('.opt-card').length > 5` },
  { name: 'Coches (1.000 opciones)', path: '/generadores/coches/', wait: `document.querySelectorAll('#sec-car button[data-opt]').length === 1000` },
  { name: 'Constructor', path: '/constructor/', wait: `document.querySelectorAll('.slot').length === 6`, setup: `document.querySelector('[data-act="random-all"]').click(); await new Promise(r=>setTimeout(r,1200));` },
  { name: 'Galería de ideas (diálogo)', path: '/generadores/escenarios/', wait: `document.querySelectorAll('.opt-section').length === 6`, setup: `document.querySelector('[data-act="ideas"]').click(); await new Promise(r=>setTimeout(r,1200));` },
  { name: 'Mis prompts (diálogo)', path: '/constructor/', wait: `document.querySelectorAll('.slot').length === 6`, setup: `document.querySelector('[data-act="random-all"]').click(); await new Promise(r=>setTimeout(r,1000)); ${clickText('.prompt-panel__actions .btn', 'Mis prompts')}; await new Promise(r=>setTimeout(r,700));` },
  { name: 'Guías (índice)', path: '/guias/' },
  { name: 'Guía (artículo)', path: '/guias/como-escribir-un-prompt-de-calidad/' },
  { name: 'Legal', path: '/legal/privacidad/' },
  { name: '404', path: '/no-existe/' },
];

const b = await launch();
let serious = 0, total = 0;
try {
  for (const c of CASES) {
    await b.goto(base + c.path, 400);
    await b.eval('localStorage.clear()');
    await b.goto(base + c.path, 400);
    if (c.wait) await b.waitFor(c.wait, 12000, c.name);
    if (c.setup) await b.eval(c.setup);
    const violations = await b.eval(`${AXE}
      const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } });
      return r.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, n: v.nodes.length, sample: v.nodes.slice(0, 2).map(n => n.target.join(' ') + ' → ' + (n.failureSummary || '').split('\\n').slice(1, 2).join('').trim().slice(0, 110)) }));`);
    total += violations.length;
    const bad = violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
    serious += bad.length;
    console.log(`\n${violations.length ? (bad.length ? '✖' : '⚠') : '✔'} ${c.name} (${c.path}): ${violations.length} violación(es)${bad.length ? `, ${bad.length} seria(s)` : ''}`);
    for (const v of violations) console.log(`    [${v.impact}] ${v.id} ×${v.n}: ${v.help}\n        ${v.sample.join('\n        ')}`);
  }
} finally {
  await b.close();
  server.close();
}
console.log(`\nTOTAL: ${total} violaciones, ${serious} serias o críticas`);
process.exit(serious ? 1 : 0);
