import { BASE_PATH } from '../assets/js/core/site-path.js';
/**
 * Genera las imágenes Open Graph (1200×630, WebP; home también como JPEG) de cada página:
 *   assets/img/og/<nombre>.webp   (home, generadores, constructor, <slug del generador>, guias, guia-<slug>)
 * Requiere Chrome o Edge (o CHROME_PATH). Uso: npm run og [-- home]   — después, npm run build para enlazarlas.
 * Las imágenes se versionan en git: no hace falta regenerarlas salvo que cambien títulos o cifras.
 */
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/domains.mjs';
import { createStaticServer } from './lib/server.mjs';
import { launch, findChrome } from './lib/chrome.mjs';
import catalog from '../data/catalog.js';
import { SLOT_BY_ID } from '../data/taxonomy.js';
import { esc, fmtNumber } from '../assets/js/core/util.js';
import { GUIDES, readingMinutes } from './pages/guides-content.mjs';

if (!findChrome()) { console.error('✖ No se encontró Chrome ni Edge (define CHROME_PATH).'); process.exit(1); }

const OUT = path.join(ROOT, 'assets', 'img', 'og');
mkdirSync(OUT, { recursive: true });
const { totals } = catalog;

/** Lista de imágenes: nombre de archivo, kicker, título (la parte tras la primera palabra va en cursiva dorada) y datos. */
const items = [
  { name: 'home', kicker: 'Generador de prompts para imágenes con IA', title: 'Crea prompts para tus imágenes.', facts: `${totals.domains} generadores · ${fmtNumber(totals.options)} opciones` },
  { name: 'generadores', kicker: 'Catálogo', title: 'Todos los generadores', facts: `${totals.domains} generadores · ${fmtNumber(totals.options)} opciones` },
  { name: 'constructor', kicker: 'Constructor', title: 'Cruza lo que quieras', facts: 'Sujeto · Escenario · Atmósfera · Técnica' },
  { name: 'guias', kicker: 'Guías', title: 'Aprende a describir imágenes', facts: `${GUIDES.length} guías prácticas` },
  ...catalog.domains.map(d => ({ name: d.slug, kicker: `${SLOT_BY_ID[d.role].es} · ${d.kicker}`, title: d.title, facts: `${d.sections} secciones · ${fmtNumber(d.options)} opciones${d.presets ? ` · ${fmtNumber(d.presets)} ${d.presetsLabel}` : ''}` })),
  ...GUIDES.map(g => ({ name: `guia-${g.slug}`, kicker: `Guía · ${readingMinutes(g.body)} min de lectura`, title: g.title, facts: 'djl.com.es/prompt/guias' })),
];

const sizeFor = t => (t.length > 70 ? 56 : t.length > 48 ? 68 : t.length > 28 ? 82 : 100);
const titleHtml = t => { const i = t.indexOf(' '); return i < 0 ? esc(t) : `${esc(t.slice(0, i))} <em>${esc(t.slice(i + 1))}</em>`; };
const onlyName = process.argv[2] || '';
const selectedItems = onlyName ? items.filter(it => it.name === onlyName) : items;
if (onlyName && selectedItems.length === 0) throw new Error(`No existe una imagen OG llamada «${onlyName}»`);

function html(it) {
  const isHome = it.name === 'home';
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:"Instrument Serif";src:url("${BASE_PATH}/assets/fonts/instrument-serif.woff2") format("woff2");font-style:normal}
@font-face{font-family:"Instrument Serif";src:url("${BASE_PATH}/assets/fonts/instrument-serif-italic.woff2") format("woff2");font-style:italic}
@font-face{font-family:"Inter";src:url("${BASE_PATH}/assets/fonts/inter-variable.woff2") format("woff2");font-weight:300 700}
@font-face{font-family:"JetBrains Mono";src:url("${BASE_PATH}/assets/fonts/jetbrains-mono-variable.woff2") format("woff2");font-weight:400 500}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;overflow:hidden;position:relative;background:#12100e;color:#efe8da;font-family:Inter,sans-serif}
.home-art{position:absolute;inset:0;background:url('${BASE_PATH}/assets/img/og/home-background.webp') center/cover no-repeat}
.home-art:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,#12100e 0%,rgba(18,16,14,.96) 25%,rgba(18,16,14,.72) 47%,rgba(18,16,14,.08) 78%),linear-gradient(0deg,rgba(18,16,14,.52),transparent 32%,rgba(18,16,14,.16))}
.is-home .title{top:250px;right:610px;font-size:72px;line-height:1.04}
.glow{position:absolute;inset:0;background:radial-gradient(760px 420px at 92% -6%,rgba(214,178,124,.30),transparent 62%),radial-gradient(640px 380px at -8% 108%,rgba(120,90,60,.22),transparent 60%)}
.frame{position:absolute;inset:26px;border:1px solid rgba(239,232,218,.12);border-radius:26px}
.brand{position:absolute;left:78px;top:64px;display:flex;align-items:center;gap:14px;font:400 36px "Instrument Serif",serif}
.brand svg{width:34px;height:34px;color:#d6b27c}.brand em{color:#d6b27c}
.kicker{position:absolute;left:78px;top:190px;right:90px;font:500 19px "JetBrains Mono",monospace;letter-spacing:.17em;text-transform:uppercase;color:#d6b27c;line-height:1.5}
.title{position:absolute;left:78px;right:90px;top:250px;font:400 ${sizeFor(it.title)}px/1.02 "Instrument Serif",serif;letter-spacing:-.02em}
.title em{color:#d6b27c}
.foot{position:absolute;left:78px;right:90px;bottom:64px;display:flex;justify-content:space-between;align-items:center;font:400 21px "JetBrains Mono",monospace;color:#8d8475}
.foot b{font-weight:500;color:#bdb4a4}
</style></head><body class="${isHome ? 'is-home' : ''}">${isHome ? '<div class="home-art"></div>' : ''}<div class="glow"></div><div class="frame"></div>
<div class="brand"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1.5 14.4 9.6 22.5 12l-8.1 2.4L12 22.5l-2.4-8.1L1.5 12l8.1-2.4L12 1.5Z"/></svg><span>Lumen <em>Vitae</em></span></div>
<div class="kicker">${esc(it.kicker)}</div>
<div class="title">${titleHtml(it.title)}</div>
<div class="foot"><span>${esc(it.facts)}</span><b>djl.com.es/prompt</b></div></body></html>`;
}

const server = createStaticServer();
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}${BASE_PATH}`;
const b = await launch({ width: 1200, height: 630 });
try {
  await b.goto(base + '/404.html', 100); // mismo origen: así se cargan las tipografías del sitio
  const { frameTree } = await b.send('Page.getFrameTree');
  for (const it of selectedItems) {
    await b.send('Page.setDocumentContent', { frameId: frameTree.frame.id, html: html(it) });
    await b.eval(`await Promise.all(['400 80px "Instrument Serif"','italic 400 80px "Instrument Serif"','500 20px "JetBrains Mono"','400 20px "JetBrains Mono"','400 20px Inter'].map(f=>document.fonts.load(f))); await document.fonts.ready; return true`);
    await b.sleep(120);
    await b.shot(path.join(OUT, `${it.name}.webp`), { type: 'webp' });
    if (it.name === 'home') await b.shot(path.join(OUT, 'home.jpg'), { type: 'jpeg' });
    process.stdout.write('.');
  }
  console.log(`\n✔ ${selectedItems.length} imágenes en assets/img/og/`);
} finally {
  await b.close();
  server.close();
}
