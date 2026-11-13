import { sitePath } from '../../assets/js/core/site-path.js';
/** Orquesta la generación de todas las páginas y archivos estáticos derivados. */
import { SITE, layout } from './layout.mjs';
import { homePage } from './home.mjs';
import { catalogPage } from './catalog.mjs';
import { constructorPage } from './constructor.mjs';
import { domainPage } from './domain.mjs';
import { legalPage, LEGAL_SLUGS } from './legal.mjs';
import { guidesIndexPage, guidePage } from './guides.mjs';
import { GUIDES } from './guides-content.mjs';

export async function buildPages({ domains, totals, all, write }) {
  const urls = [];
  const page = (urlPath, html, { index = true } = {}) => {
    write(urlPath === '/' ? 'index.html' : `${urlPath.replace(/^\//, '')}index.html`, html);
    if (index) urls.push({ path: urlPath });
  };

  page('/', homePage({ domains, totals }));
  page('/generadores/', catalogPage({ domains, totals }));
  page('/constructor/', constructorPage({ domains }));
  for (const { domain } of all) {
    const d = domains.find(x => x.id === domain.id);
    page(`/generadores/${d.slug}/`, domainPage({ d, domain, domains }));
  }
  page('/guias/', guidesIndexPage({ domains }));
  for (const g of GUIDES) page(`/guias/${g.slug}/`, guidePage(g, { domains }));
  for (const slug of LEGAL_SLUGS) page(`/legal/${slug}/`, legalPage(slug, domains));

  // 404 (no indexable)
  write('404.html', layout({
    path: '/404.html', title: 'Página no encontrada | Lumen Vitae', description: 'La página que buscas no existe.', domains, script: 'static', bodyData: { dock: 'off' }, noindex: true,
    main: `<div class="container"><div class="page-head"><p class="eyebrow">Error 404</p><h1>Esta página <em>no existe</em></h1><p>Puede que el enlace esté roto o que la página se haya movido.</p><div class="hero__cta"><a class="btn btn--primary" href="/">Volver al inicio</a><a class="btn btn--outline" href="/generadores/">Ver generadores</a></div></div></div>`,
  }));

  // sitemap, robots y manifiesto
  // Sin <lastmod> ni <priority>: un valor inexacto es peor que ninguno (los buscadores ignoran la prioridad)
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${SITE.url}${u.path}</loc></url>`).join('\n')}\n</urlset>\n`);
  write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`);
  write('manifest.webmanifest', JSON.stringify({
    name: 'Lumen Vitae · Generador de prompts', short_name: 'Lumen Vitae', description: 'Constructor modular de prompts para imágenes con IA.',
    id: sitePath('/'), lang: 'es', start_url: sitePath('/'), scope: sitePath('/'), display: 'standalone', background_color: SITE.themeColor, theme_color: SITE.themeColor,
    icons: [
      { src: sitePath('/assets/img/icon-192.png'), sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: sitePath('/assets/img/icon-512.png'), sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: sitePath('/assets/img/icon-maskable-512.png'), sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }, null, 2) + '\n');
  console.log(`páginas: ${urls.length} indexables + 404 · sitemap, robots y manifiesto`);
}
