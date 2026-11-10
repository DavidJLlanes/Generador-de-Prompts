/** Fragmentos HTML compartidos por varias páginas. */
import { esc, fold, fmtNumber } from '../../assets/js/core/util.js';
import { SLOT_BY_ID } from '../../data/taxonomy.js';
import { icon } from '../../assets/js/ui/icons.js';

export const fmt = fmtNumber;

/** Tarjeta de un generador (el catálogo la filtra en el navegador mediante data-role y data-s). */
export function domainCard(d) {
  const search = fold(`${d.title} ${d.short} ${d.kicker} ${d.summary}`);
  return `<a class="card card--domain" href="/generadores/${d.slug}/" data-id="${d.id}" data-role="${d.role}" data-s="${esc(search)}">
  <span class="card__role">${esc(SLOT_BY_ID[d.role].es)}</span>
  <span class="card__arrow">${icon('arrow', 18)}</span>
  <h3 class="card__title">${esc(d.title)}</h3>
  <p class="card__kicker">${esc(d.kicker)}</p>
  <p class="card__summary">${esc(d.summary)}</p>
  <div class="card__foot"><span>${d.sections} secciones</span><span>${fmt(d.options)} opciones</span>${d.presets ? `<span>${fmt(d.presets)} ${d.presetsLabel}</span>` : ''}<span class="card__sel" data-sel hidden></span></div>
</a>`;
}

/** Generadores sugeridos para cruzar con uno dado (por afinidad de rol). */
const RELATED = {
  subject: ['poses', 'locations', 'scenarios', 'weather', 'photo', 'faces', 'hairstyles'],
  attribute: ['woman', 'man', 'poses', 'locations', 'photo'],
  action: ['woman', 'man', 'locations', 'scenarios', 'photo'],
  setting: ['woman', 'man', 'cars', 'creatures', 'weather', 'effects', 'photo'],
  atmosphere: ['scenarios', 'landscape', 'woman', 'cars', 'creatures', 'photo'],
  technical: ['woman', 'man', 'cars', 'scenarios', 'landscape'],
};

export function relatedFor(d, domains) {
  const byId = Object.fromEntries(domains.map(x => [x.id, x]));
  return (RELATED[d.role] || []).filter(id => id !== d.id && byId[id]).slice(0, 7).map(id => byId[id]);
}
