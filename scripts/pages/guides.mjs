/** Páginas de guías: índice (/guias/) y un artículo por guía (/guias/<slug>/). */
import { esc } from '../../assets/js/core/util.js';
import { icon } from '../../assets/js/ui/icons.js';
import { layout, SITE } from './layout.mjs';
import { GUIDES, readingMinutes } from './guides-content.mjs';

const fmtDate = iso => new Date(iso + 'T12:00:00Z').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export function guidesIndexPage({ domains }) {
  const cards = GUIDES.map(g => `<a class="card" href="/guias/${g.slug}/">
    <span class="card__role">Guía · ${readingMinutes(g.body)} min de lectura</span>
    <span class="card__arrow">${icon('arrow', 18)}</span>
    <h2 class="card__title">${esc(g.title)}</h2>
    <p class="card__summary">${esc(g.description)}</p>
  </a>`).join('\n');
  const main = `<div class="container">
  <div class="page-head">
    <p class="eyebrow">Guías</p>
    <h1>Aprende a <em>describir</em> imágenes</h1>
    <p>Pautas prácticas para escribir mejores prompts, cruzar generadores y adaptar el resultado a cada modelo y a cada pantalla.</p>
  </div>
  <div class="grid">${cards}</div>
</div>`;
  return layout({
    path: '/guias/', title: 'Guías de prompts para imágenes con IA | Lumen Vitae',
    description: 'Guías prácticas para escribir prompts de calidad, cruzar generadores y adaptar el resultado a ChatGPT, Stable Diffusion, Flux, Ideogram, Midjourney y a cada pantalla.',
    main, script: 'static', bodyData: { dock: 'off' }, domains, og: 'guias',
    jsonld: [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Guías de Lumen Vitae', url: `${SITE.url}/guias/`, inLanguage: 'es' }],
  });
}

export function guidePage(g, { domains }) {
  const path = `/guias/${g.slug}/`;
  const others = GUIDES.filter(x => x.slug !== g.slug);
  const main = `<div class="container">
  <div class="page-head">
    <div class="domain-hero__top"><a href="/">Inicio</a><span aria-hidden="true">/</span><a href="/guias/">Guías</a></div>
    <h1>${esc(g.title)}</h1>
    <p class="guide-meta">${fmtDate(g.date)} · ${readingMinutes(g.body)} min de lectura</p>
  </div>
  <article class="prose">${g.body}</article>
  <aside class="guide-more" aria-label="Más guías">
    <h2>Sigue <em>leyendo</em></h2>
    <ul>${others.map(o => `<li><a href="/guias/${o.slug}/">${esc(o.title)}</a></li>`).join('')}</ul>
  </aside>
</div>`;
  return layout({
    path, title: `${g.title} | Lumen Vitae`, description: g.description, main, script: 'static', bodyData: { dock: 'off' }, domains, og: `guia-${g.slug}`,
    jsonld: [
      { '@context': 'https://schema.org', '@type': 'Article', headline: g.title, description: g.description, datePublished: g.date, dateModified: g.date, inLanguage: 'es', author: { '@type': 'Organization', name: SITE.name }, publisher: { '@type': 'Organization', name: SITE.name }, mainEntityOfPage: `${SITE.url}${path}`, image: `${SITE.url}/assets/img/og/guia-${g.slug}.webp` },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE.url}/` },
        { '@type': 'ListItem', position: 2, name: 'Guías', item: `${SITE.url}/guias/` },
        { '@type': 'ListItem', position: 3, name: g.title, item: `${SITE.url}${path}` },
      ] },
    ],
  });
}
