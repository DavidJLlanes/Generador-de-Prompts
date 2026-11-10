/** Una página por generador (/generadores/<slug>/). El contenido interactivo lo monta pages/domain.js. */
import { esc } from '../../assets/js/core/util.js';
import { SLOT_BY_ID } from '../../data/taxonomy.js';
import { icon } from '../../assets/js/ui/icons.js';
import { layout } from './layout.mjs';
import { fmt, relatedFor } from './shared.mjs';

export function domainPage({ d, domain, domains }) {
  const meta = domain.meta;
  const rel = relatedFor(d, domains);
  const path = `/generadores/${d.slug}/`;
  const intro = meta.intro || meta.summary;

  const main = `<div class="container domain-hero">
  <div class="domain-hero__top"><a href="/">Inicio</a><span aria-hidden="true">/</span><a href="/generadores/">Generadores</a><span aria-hidden="true">/</span><span>${esc(meta.short || meta.title)}</span></div>
  <h1>${esc(meta.title)}</h1>
  <p class="domain-hero__kicker">${esc(SLOT_BY_ID[d.role].es)}${meta.kicker ? ` · ${esc(meta.kicker)}` : ''}</p>
  <p class="domain-hero__intro">${esc(intro)}</p>
  <div class="domain-hero__actions">
    <button type="button" class="btn btn--primary" data-act="random">${icon('dice', 18)} Aleatorio</button>
    ${d.presets ? `<button type="button" class="btn btn--outline" data-act="ideas">${icon('spark', 18)} Galería de ${fmt(d.presets)} ideas</button>` : ''}
    <button type="button" class="btn btn--ghost" data-act="clear-domain">${icon('trash', 18)} Vaciar</button>
    <a class="btn btn--ghost" href="/constructor/">Ir al constructor ${icon('arrow', 16)}</a>
    <span class="domain-hero__facts">${d.sections} secciones · ${fmt(d.options)} opciones</span>
  </div>
</div>
<div class="container">
  ${rel.length ? `<div class="cross-strip"><span class="cross-strip__label">Cruza con</span>${rel.map(r => `<a class="domain-pill" href="/generadores/${r.slug}/">${esc(r.short)}</a>`).join('')}</div>` : ''}
  <div class="domain-layout">
    <aside class="domain-nav" aria-label="Secciones de ${esc(meta.short || meta.title)}">
      <p class="domain-nav__title">Secciones</p>
      <nav class="sec-nav" data-nav></nav>
    </aside>
    <div class="domain-main">
      <div class="domain-toolbar">
        <div class="field"><span class="field__icon">${icon('search')}</span><input class="field__input" type="search" data-search placeholder="Buscar en ${esc(meta.short || meta.title)}…  (pulsa /)" aria-label="Buscar opciones en ${esc(meta.short || meta.title)}" autocomplete="off"></div>
        <span class="search-status" data-status role="status"></span>
      </div>
      <div data-sections aria-busy="true"><p class="notice">Cargando las opciones…</p></div>
      <noscript><p class="notice">Este generador necesita JavaScript para funcionar.</p></noscript>
    </div>
  </div>
</div>`;

  const title = `${meta.title} · Generador de prompts para imágenes con IA | Lumen Vitae`;
  return layout({
    path, title, description: meta.summary, main, script: 'domain', bodyData: { 'domain-id': d.id, 'domain-slug': d.slug }, domains,
    jsonld: [
      { '@context': 'https://schema.org', '@type': 'WebApplication', name: `${meta.title} · Lumen Vitae`, url: `https://lumenvitae.es${path}`, applicationCategory: 'DesignApplication', operatingSystem: 'Web', inLanguage: 'es', isAccessibleForFree: true, description: meta.summary },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://lumenvitae.es/' },
        { '@type': 'ListItem', position: 2, name: 'Generadores', item: 'https://lumenvitae.es/generadores/' },
        { '@type': 'ListItem', position: 3, name: meta.short || meta.title, item: `https://lumenvitae.es${path}` },
      ] },
    ],
  });
}
