/** Catálogo de generadores (/generadores/). */
import { esc } from '../../assets/js/core/util.js';
import { SLOTS } from '../../data/taxonomy.js';
import { icon } from '../../assets/js/ui/icons.js';
import { layout } from './layout.mjs';
import { domainCard, fmt } from './shared.mjs';

export function catalogPage({ domains, totals }) {
  const filters = [`<button type="button" class="filter" data-filter="" aria-pressed="true">Todos</button>`,
    ...SLOTS.map(s => `<button type="button" class="filter" data-filter="${s.id}" aria-pressed="false">${esc(s.plural)}</button>`)].join('');
  const groups = SLOTS.map(slot => {
    const list = domains.filter(d => d.role === slot.id);
    if (!list.length) return '';
    return `<section class="group" data-group="${slot.id}"><header class="group__head"><h2 class="group__title">${esc(slot.plural)}</h2><p class="group__hint">${esc(slot.hint)}</p></header><div class="grid">${list.map(domainCard).join('')}</div></section>`;
  }).join('');

  const main = `<div class="container">
  <div class="page-head">
    <p class="eyebrow">Generadores</p>
    <h1>Todos los <em>generadores</em></h1>
    <p>${totals.domains} generadores y ${fmt(totals.options)} opciones. Entra en cualquiera, elige lo que te interese y combínalo con los demás desde el constructor.</p>
  </div>
  <div class="toolbar">
    <div class="field"><span class="field__icon">${icon('search')}</span><input class="field__input" type="search" data-search placeholder="Buscar un generador u opción…  (pulsa /)" aria-label="Buscar un generador u opción" autocomplete="off"></div>
    <div class="filters" role="group" aria-label="Filtrar por tipo">${filters}</div>
  </div>
  <section class="hits" data-hits hidden aria-live="polite">
    <h2 class="hits__title">Opciones que coinciden <span data-hits-count></span></h2>
    <ul class="hits__list" data-hits-list></ul>
  </section>
  ${groups}
  <p class="notice" data-empty hidden>Ningún generador coincide con tu búsqueda.</p>
</div>`;

  return layout({
    path: '/generadores/',
    title: 'Generadores de prompts para imágenes con IA | Lumen Vitae',
    description: `Explora ${totals.domains} generadores de prompts: personajes, criaturas, vehículos, paisajes, escenarios, clima, efectos y fotografía. Combínalos para crear imágenes de máxima calidad.`,
    main, script: 'catalog', domains, og: 'generadores',
    jsonld: [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Generadores de prompts', url: 'https://lumenvitae.es/generadores/', inLanguage: 'es' }],
  });
}
