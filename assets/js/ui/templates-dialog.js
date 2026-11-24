/**
 * PLANTILLAS — combinaciones listas de varios generadores (data/templates.js). Se cargan con un toque en el
 * constructor y se retocan. Al cargar una se sustituye la selección actual (se puede deshacer).
 */
import { h, clear } from './dom.js';
import { icon } from './icons.js';
import { store } from '../core/store.js';
import { domainMeta } from '../core/registry.js';
import { sitePath } from '../core/site-path.js';
import { TEMPLATES } from '../../../data/templates.js';
import { toast } from './toast.js';

export const templateById = id => TEMPLATES.find(t => t.id === id) || null;

/** Carga una plantilla en el workspace (sustituye la selección; «Deshacer» la recupera). */
export function applyTemplate(t) {
  const hadSomething = Object.keys(store.get().sel).length > 0;
  store.set({ sel: t.sel, aspect: t.aspect || '', attach: {} }); // un solo paso: «Deshacer» recupera lo anterior entero
  toast(hadSomething ? `Plantilla «${t.title}» cargada. Si querías lo anterior, pulsa Deshacer.` : `Plantilla «${t.title}» cargada: retócala a tu gusto`);
}

const domainsOf = t => Object.keys(t.sel).map(id => domainMeta(id)?.short).filter(Boolean);

function card(t, onUse) {
  return h('article', { class: 'tpl-card' },
    h('div', { class: 'tpl-card__top' },
      h('span', { class: 'tpl-card__ratio', 'aria-label': `Proporción ${t.aspect}` }, t.aspect),
      h('span', { class: 'tpl-card__tags' }, t.tags.join(' · '))),
    h('h3', { class: 'tpl-card__title' }, t.title),
    h('p', { class: 'tpl-card__desc' }, t.desc),
    h('p', { class: 'tpl-card__domains' }, domainsOf(t).join(' + ')),
    h('button', { type: 'button', class: 'btn btn--primary btn--sm', onClick: () => onUse(t) }, 'Usar plantilla', h('span', { html: icon('arrow', 16) })));
}

/** Abre el cajón de plantillas. Fuera del constructor, usar una lleva allí. */
export function openTemplates() {
  const onConstructor = location.pathname.endsWith('/constructor/');
  const tags = [...new Set(TEMPLATES.flatMap(t => t.tags))];
  let active = '';
  const list = h('div', { class: 'tpl-grid' });
  const chips = h('div', { class: 'tpl-filters', role: 'group', 'aria-label': 'Filtrar plantillas' });
  const use = t => {
    if (!onConstructor) { location.href = sitePath(`/constructor/?plantilla=${encodeURIComponent(t.id)}`); return; }
    applyTemplate(t);
    dialog.close();
  };
  function render() {
    clear(chips);
    for (const tag of ['', ...tags]) {
      chips.append(h('button', { type: 'button', class: `chip-filter${active === tag ? ' is-active' : ''}`, 'aria-pressed': String(active === tag), onClick: () => { active = tag; render(); } }, tag || `Todas (${TEMPLATES.length})`));
    }
    clear(list);
    list.append(...TEMPLATES.filter(t => !active || t.tags.includes(active)).map(t => card(t, use)));
  }
  const dialog = h('dialog', { class: 'ideas tpl-dialog', 'aria-labelledby': 'tpl-title' },
    h('div', { class: 'ideas__panel' },
      h('header', { class: 'ideas__head' },
        h('div', {},
          h('h2', { class: 'ideas__title', id: 'tpl-title' }, 'Plantillas ', h('em', {}, 'de partida')),
          h('p', { class: 'ideas__lead' }, 'Combinaciones de varios generadores listas para usar. Carga una y cambia lo que quieras.')),
        h('button', { type: 'button', class: 'icon-btn', 'aria-label': 'Cerrar', html: icon('x'), onClick: () => dialog.close() })),
      chips, list));
  dialog.addEventListener('close', () => dialog.remove());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  render();
  document.body.append(dialog);
  dialog.showModal();
}
