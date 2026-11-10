/**
 * TABLERO DE RANURAS — vista del constructor: una fila por ranura (sujeto, atributos, pose,
 * escenario, atmósfera, técnica) con los generadores disponibles y lo elegido en cada una.
 * Es lo que hace visible el cruce: cada ranura es opcional y se combina con las demás.
 */
import { h, clear } from './dom.js';
import { icon } from './icons.js';
import { live } from '../core/live.js';
import { store } from '../core/store.js';
import { domainsByRole, loadDomains } from '../core/registry.js';
import { randomSelection, SLOT_CAPS } from '../core/random.js';
import { SLOTS } from '../../../data/taxonomy.js';
import { toast } from './toast.js';

const pickOne = arr => arr[Math.floor(Math.random() * arr.length)];

/** Aleatorio de una ranura: usa los generadores con selección; si no hay ninguno, elige uno al azar. */
export async function randomizeSlot(slotId) {
  const metas = domainsByRole(slotId);
  const state = store.get();
  let ids = metas.filter(m => state.sel[m.id]).map(m => m.id);
  if (!ids.length) ids = [pickOne(metas).id];
  const loaded = await loadDomains(ids);
  const sel = randomSelection(ids.map(i => loaded[i]), state, Math.random, d => SLOT_CAPS[d.role]);
  ids.forEach(id => store.applySelection(id, sel[id] || {}));
}

/** Aleatorio total: una combinación completa y coherente entre ranuras. */
export async function randomizeAll() {
  const state = store.get();
  const plan = { subject: 1, attribute: 0.45, action: 0.55, setting: 0.85, atmosphere: 0.5, technical: 1 };
  const chosen = [];
  for (const slot of SLOTS) {
    const metas = domainsByRole(slot.id);
    const existing = metas.filter(m => state.sel[m.id]).map(m => m.id);
    if (existing.length) chosen.push(...existing);
    else if (Math.random() < plan[slot.id]) chosen.push(slot.id === 'technical' ? 'photo' : pickOne(metas).id);
  }
  const loaded = await loadDomains(chosen);
  const sel = randomSelection(chosen.map(i => loaded[i]), state, Math.random, d => SLOT_CAPS[d.role]);
  store.replaceSelection({ ...Object.fromEntries(Object.entries(state.sel).filter(([id]) => !chosen.includes(id))), ...sel });
}

export function mountSlotBoard(root) {
  const rows = new Map();

  for (const slot of SLOTS) {
    const pills = h('div', { class: 'slot__pills' });
    const chips = h('div', { class: 'slot__chips' });
    const count = h('span', { class: 'slot__count' });
    const row = h('article', { class: 'slot', dataset: { slot: slot.id } },
      h('header', { class: 'slot__head' },
        h('div', {},
          h('h2', { class: 'slot__title' }, slot.es, count),
          h('p', { class: 'slot__hint' }, slot.hint)),
        h('div', { class: 'slot__tools' },
          h('button', { type: 'button', class: 'icon-btn', title: `Aleatorio en «${slot.es}»`, 'aria-label': `Aleatorio en ${slot.es}`, html: icon('dice'), onClick: () => randomizeSlot(slot.id).catch(() => toast('No se pudo cargar el generador', { tone: 'warn' })) }),
          h('button', { type: 'button', class: 'icon-btn', title: `Vaciar «${slot.es}»`, 'aria-label': `Vaciar ${slot.es}`, html: icon('trash'), onClick: () => domainsByRole(slot.id).forEach(m => store.clearDomain(m.id)) }))),
      pills, chips);
    rows.set(slot.id, { row, pills, chips, count });
    root.append(row);
  }

  function pillFor(meta, n) {
    return h('a', { class: `domain-pill${n ? ' has-selection' : ''}`, href: `/generadores/${meta.slug}/`, title: meta.summary },
      meta.short, n ? h('b', { class: 'domain-pill__n' }, n) : null);
  }

  live.subscribe(({ composed }) => {
    for (const slot of SLOTS) {
      const r = rows.get(slot.id);
      const metas = domainsByRole(slot.id);
      clear(r.pills);
      metas.forEach(m => r.pills.append(pillFor(m, store.countSelected(m.id))));

      clear(r.chips);
      const parts = (composed.slots.find(s => s.slot === slot.id)?.parts || []).filter(p => !p.boost);
      parts.forEach(p => r.chips.append(h('button', { type: 'button', class: 'chip chip--removable', title: 'Quitar', 'aria-label': `Quitar ${p.es}`, onClick: () => p.section !== '_rule' && store.removeOption(p.domain, p.section, p.option) },
        h('span', { class: 'chip__text' }, p.es), p.section !== '_rule' ? h('span', { html: icon('x', 14) }) : null)));
      r.count.textContent = parts.length ? String(parts.length) : '';
      r.row.classList.toggle('has-selection', parts.length > 0);
    }
  });
}

