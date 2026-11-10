/** Plantilla común de todas las páginas: <head> con SEO, cabecera, pie y carga del script de página. */
import { esc } from '../../assets/js/core/util.js';
import { icon } from '../../assets/js/ui/icons.js';
import { existsSync } from 'node:fs';
import { ROOT } from '../lib/domains.mjs';

export const SITE = {
  name: 'Lumen Vitae',
  origin: 'https://lumenvitae.es',
  themeColor: '#12100e',
  year: new Date().getFullYear(),
};

const MARK = '<svg class="brand__mark" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 1.5 14.4 9.6 22.5 12l-8.1 2.4L12 22.5l-2.4-8.1L1.5 12l8.1-2.4L12 1.5Z"/></svg>';

function header() {
  return `<a class="skip-link" href="#main">Saltar al contenido</a>
<header class="site-header">
  <div class="container site-header__inner">
    <a class="brand" href="/" aria-label="Lumen Vitae, inicio">${MARK}<span class="brand__name">Lumen <em>Vitae</em></span></a>
    <nav class="site-nav" id="site-nav" aria-label="Principal">
      <a href="/generadores/">Generadores</a>
      <a href="/constructor/">Constructor</a>
      <a href="/generadores/escenarios/">Escenarios</a>
      <a href="/guias/">Guías</a>
    </nav>
    <div class="site-header__actions">
      <button type="button" class="btn btn--outline btn--sm" data-dock-open>${icon('layers', 16)}<span class="btn__label">Mi prompt</span><span class="badge" data-count hidden>0</span></button>
      <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="site-nav" aria-label="Abrir el menú">${icon('menu', 20)}</button>
    </div>
  </div>
</header>`;
}

function footer(domains) {
  const top = domains.filter(d => ['woman', 'man', 'scenarios', 'landscape', 'creatures', 'weather', 'photo'].includes(d.id));
  return `<footer class="site-footer">
  <div class="container footer-grid">
    <div>
      <a class="brand" href="/" aria-label="Lumen Vitae, inicio">${MARK}<span class="brand__name">Lumen <em>Vitae</em></span></a>
      <p class="footer-blurb">Constructor modular de prompts para imágenes con IA. La interfaz está en español y los prompts salen siempre en inglés.</p>
    </div>
    <div><h2>Generadores</h2><ul>${top.map(d => `<li><a href="/generadores/${d.slug}/">${esc(d.short)}</a></li>`).join('')}<li><a href="/generadores/">Ver todos</a></li></ul></div>
    <div><h2>Herramientas</h2><ul><li><a href="/constructor/">Constructor</a></li><li><a href="/generadores/escenarios/">Galería de ideas</a></li><li><a href="/guias/">Guías</a></li></ul></div>
    <div><h2>Legal</h2><ul><li><a href="/legal/aviso-legal/">Aviso legal</a></li><li><a href="/legal/privacidad/">Privacidad</a></li><li><a href="/legal/cookies/">Cookies</a></li><li><a href="/legal/terminos/">Términos de uso</a></li></ul></div>
  </div>
  <div class="container footer-base"><span>© ${SITE.year} Lumen Vitae</span><span>Los prompts no contienen datos personales y se procesan en tu navegador.</span></div>
</footer>`;
}

/**
 * @param {object} p
 * @param {string} p.path           ruta canónica con barra final, p. ej. «/generadores/clima/»
 * @param {string} p.title          <title> completo
 * @param {string} p.description    meta description
 * @param {string} p.main           HTML de <main>
 * @param {string} [p.script]       módulo de página, p. ej. «domain»
 * @param {object} [p.bodyData]     atributos data-* del <body>
 * @param {object[]} [p.jsonld]     objetos JSON-LD
 * @param {object[]} p.domains      catálogo (para el pie)
 * @param {boolean} [p.noindex]
 * @param {string} [p.og]           nombre de la imagen social en assets/img/og/ (sin extensión); si no existe, se usa la genérica
 */
export function layout({ path, title, description, main, script, bodyData = {}, jsonld = [], domains, noindex = false, og = '' }) {
  const ogFile = og && existsSync(`${ROOT}/assets/img/og/${og}.webp`);
  const image = `${SITE.origin}${ogFile ? `/assets/img/og/${og}.webp` : '/assets/img/og-image.webp'}`;
  const url = SITE.origin + path;
  const data = Object.entries(bodyData).map(([k, v]) => ` data-${k}="${esc(v)}"`).join('');
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="${SITE.themeColor}">
<meta name="robots" content="${noindex ? 'noindex' : 'index, follow, max-image-preview:large'}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:locale" content="es_ES">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${image}">
${ogFile ? `<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
` : ''}<meta property="og:image:alt" content="${esc(title)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${image}">
<link rel="icon" type="image/webp" sizes="32x32" href="/assets/img/32.webp">
<link rel="icon" type="image/webp" sizes="64x64" href="/assets/img/64.webp">
<link rel="apple-touch-icon" href="/assets/img/180.webp">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="preload" href="/assets/fonts/instrument-serif.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/inter-variable.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/main.css">
${jsonld.map(o => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n')}
</head>
<body${data}>
${header()}
<main id="main">
${main}
</main>
${footer(domains)}
${script ? `<script type="module" src="/assets/js/pages/${script}.js"></script>` : ''}
</body>
</html>
`;
}
