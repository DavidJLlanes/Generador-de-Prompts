/**
 * CAJÓN DE IDEAS — galería buscable de combinaciones guardadas (presets) de un dominio.
 * Para «Escenarios» son las 1.000 ideas originales de wallpaper. Al elegir una se aplica su
 * selección completa al dominio, sin tocar lo que hayas elegido en otros generadores.
 */
import { h, clear } from './dom.js';
import { icon } from './icons.js';
import { loadPresets } from '../core/registry.js';
import { store } from '../core/store.js';
import { fold, debounce, fmtNumber, matchesAll } from '../core/util.js';
import { toast } from './toast.js';

const PAGE = 60;
const lowerFirst = s => s.charAt(0).toLowerCase() + s.slice(1);

/** Título legible de un preset: su título propio o, si no, las etiquetas de sus piezas principales. */
function titleOf(domain, p) {
  if (p.es) return p.es;
  const bits = [];
  for (const sec of domain.sections) {
    if (sec.slot === 'technical') continue;
    const id = p.sel[sec.id]?.[0];
    const o = id && sec._byId.get(id);
    if (o) bits.push(bits.length ? (sec.joiner ?? ' ') + lowerFirst(o.es) : o.es);
  }
  return bits.join('');
}

function styleOf(domain, p) {
  const bits = [];
  for (const sec of domain.sections) {
    if (sec.slot !== 'technical') continue;
    const o = sec._byId.get(p.sel[sec.id]?.[0]);
    if (o) bits.push(o.es);
  }
  return bits.join(' · ');
}

export async function openPresets(domain) {
  const presets = await loadPresets(domain.id);
  const recipes = domain.meta.presetsLabel === 'recetas';
  const items = presets.map(p => ({ p, title: titleOf(domain, p), style: styleOf(domain, p) }));
  items.forEach(i => { i.f = fold(`${i.title} ${i.style} #${i.p.n}`); });

  let filtered = items;
  let shown = PAGE;

  const list = h('div', { class: 'ideas__list' });
  const more = h('button', { type: 'button', class: 'btn btn--outline', onClick: () => { shown += PAGE; render(); } }, 'Mostrar más');
  const count = h('p', { class: 'ideas__count' });
  const search = h('input', { type: 'search', class: 'field__input', placeholder: recipes ? 'Buscar una receta…' : 'Buscar una idea: «faro», «lluvia», «acuarela»…', 'aria-label': recipes ? 'Buscar recetas' : 'Buscar ideas', autocomplete: 'off' });

  const dialog = h('dialog', { class: 'ideas', 'aria-label': `Ideas de ${domain.meta.short || domain.meta.title}` },
    h('div', { class: 'ideas__panel' },
      h('header', { class: 'ideas__head' },
        h('div', {}, h('h2', { class: 'ideas__title' }, recipes ? 'Recetas de ' : 'Galería de ', h('em', {}, recipes ? (domain.meta.short || domain.meta.title) : 'ideas')), h('p', { class: 'ideas__lead' }, `${fmtNumber(presets.length)} ${recipes ? 'recetas' : 'escenas'} listas para usar. Elige una y se aplicará a «${domain.meta.short || domain.meta.title}»${recipes ? ': luego puedes ajustar cualquier sección.' : '.'}`)),
        h('button', { type: 'button', class: 'icon-btn', 'aria-label': 'Cerrar', onClick: () => dialog.close(), html: icon('x') })),
      h('div', { class: 'field' }, h('span', { class: 'field__icon', html: icon('search') }), search),
      count, list, h('div', { class: 'ideas__more' }, more)));

  function render() {
    clear(list);
    filtered.slice(0, shown).forEach(({ p, title, style }) => list.append(h('button', { type: 'button', class: 'idea', onClick: () => { store.applySelection(domain.id, p.sel); toast(`${recipes ? 'Receta' : 'Idea'} #${p.n} aplicada`); dialog.close(); } },
      h('span', { class: 'idea__n' }, `#${p.n}`), h('span', { class: 'idea__title' }, title), style ? h('span', { class: 'idea__style' }, style) : null)));
    count.textContent = filtered.length ? `${fmtNumber(Math.min(shown, filtered.length))} de ${fmtNumber(filtered.length)}` : 'Sin resultados';
    more.hidden = shown >= filtered.length;
  }
  search.addEventListener('input', debounce(() => {
    const q = fold(search.value).trim();
    filtered = q ? items.filter(i => matchesAll(i.f, q)) : items;
    shown = PAGE;
    render();
  }, 120));

  dialog.addEventListener('close', () => dialog.remove());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  document.body.append(dialog);
  render();
  dialog.showModal();
  search.focus();
}
