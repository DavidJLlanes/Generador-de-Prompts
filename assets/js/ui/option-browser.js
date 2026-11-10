/**
 * NAVEGADOR DE OPCIONES — pinta las secciones de un dominio, gestiona la selección (single/multi),
 * el bloqueo ante «Aleatorio», la búsqueda y la navegación lateral por secciones.
 */
import { $, $$, h } from './dom.js';
import { icon } from './icons.js';
import { store } from '../core/store.js';
import { esc, fold, debounce, fmtNumber, matchesAll } from '../core/util.js';

const MODE_LABEL = { single: 'Elige una', multi: 'Selección múltiple' };

function optionHTML(o) {
  const s = esc(fold(`${o.es} ${o.en} ${o.name || ''}`));
  const tip = esc((o.name ? `${o.name} — ` : '') + o.en.slice(0, 180));
  if (o.info && o.info.length) {
    return `<div class="opt-card" data-s="${s}">
      <button type="button" class="opt opt--card" data-opt="${o.id}" aria-pressed="false" title="${tip}">
        <span class="opt__title">${esc(o.es)}</span><span class="opt__sub">${esc(o.name || '')}</span></button>
      <details class="opt-card__more"><summary>Ver detalle</summary><dl>${o.info.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl></details></div>`;
  }
  return `<button type="button" class="opt" data-opt="${o.id}" data-s="${s}" aria-pressed="false" title="${tip}">${esc(o.es)}</button>`;
}

function sectionHTML(domain, sec) {
  const groups = sec.groups || [];
  const body = groups.length
    ? groups.map(g => `<div class="opt-group" data-group="${g.id}"><h3 class="opt-group__title">${esc(g.title)}</h3><div class="opt-list">${sec.options.filter(o => o.group === g.id).map(optionHTML).join('')}</div></div>`).join('')
    : `<div class="opt-list">${sec.options.map(optionHTML).join('')}</div>`;
  const cards = sec.options.some(o => o.info) ? ' opt-section--cards' : '';
  return `<section class="opt-section${cards}" id="sec-${sec.id}" data-section="${sec.id}">
    <header class="opt-section__head">
      <div class="opt-section__titles">
        <h2 class="opt-section__title">${esc(sec.title)}<span class="opt-section__count" data-count-sec>${fmtNumber(sec.options.length)}</span></h2>
        ${sec.note ? `<p class="opt-section__note">${esc(sec.note)}</p>` : ''}
      </div>
      <div class="opt-section__tools">
        <span class="tag${sec.polarity === 'negative' ? ' tag--neg' : ''}">${sec.polarity === 'negative' ? 'Evitar' : MODE_LABEL[sec.mode]}</span>
        <button type="button" class="icon-btn" data-act="lock" aria-pressed="false" title="Fijar esta sección: «Aleatorio» no la cambiará" aria-label="Fijar la sección ${esc(sec.title)}">${icon('unlock')}</button>
        <button type="button" class="icon-btn" data-act="clear" title="Quitar la selección de esta sección" aria-label="Quitar la selección de ${esc(sec.title)}">${icon('x')}</button>
      </div>
    </header>
    ${body}
  </section>`;
}

/**
 * @param {object} p
 * @param {object} p.domain      dominio cargado
 * @param {HTMLElement} p.root   contenedor de las secciones
 * @param {HTMLElement} p.nav    contenedor de la navegación lateral
 * @param {HTMLInputElement} p.search  campo de búsqueda
 * @param {HTMLElement} p.status       elemento donde mostrar el recuento de resultados
 */
export function mountOptionBrowser({ domain, root, nav, search, status }) {
  root.innerHTML = domain.sections.map(s => sectionHTML(domain, s)).join('');
  nav.replaceChildren(...domain.sections.map(s => h('a', { class: 'sec-nav__link', href: `#sec-${s.id}`, dataset: { navSec: s.id } },
    h('span', { class: 'sec-nav__text' }, s.title), h('b', { class: 'sec-nav__badge', 'data-nav-count': '', hidden: true }))));

  const secEl = new Map(domain.sections.map(s => [s.id, $(`#sec-${CSS.escape(s.id)}`, root)]));
  const navLink = new Map(domain.sections.map(s => [s.id, $(`[data-nav-sec="${CSS.escape(s.id)}"]`, nav)]));
  const prev = new Map();

  /* --- interacción (delegación) --- */
  root.addEventListener('click', e => {
    const secNode = e.target.closest('[data-section]');
    if (!secNode) return;
    const sec = domain._secById.get(secNode.dataset.section);
    const opt = e.target.closest('button[data-opt]');
    if (opt) { store.toggleOption(domain.id, sec, opt.dataset.opt); return; }
    const act = e.target.closest('[data-act]');
    if (!act) return;
    if (act.dataset.act === 'clear') store.setSection(domain.id, sec.id, []);
    if (act.dataset.act === 'lock') store.toggleLock(domain.id, sec.id);
  });

  /* --- sincroniza la interfaz con el estado --- */
  function paint(state) {
    for (const sec of domain.sections) {
      const ids = state.sel[domain.id]?.[sec.id] || [];
      const locked = !!state.locks[domain.id]?.[sec.id];
      const key = ids.join('|') + (locked ? '#L' : '');
      if (prev.get(sec.id) === key) continue;
      prev.set(sec.id, key);
      const set = new Set(ids);
      const el = secEl.get(sec.id);
      el.querySelectorAll('button[data-opt]').forEach(b => { const on = set.has(b.dataset.opt); b.setAttribute('aria-pressed', on); b.classList.toggle('is-on', on); });
      el.classList.toggle('has-selection', ids.length > 0);
      const lock = el.querySelector('[data-act="lock"]');
      lock.setAttribute('aria-pressed', locked);
      lock.classList.toggle('is-on', locked);
      lock.innerHTML = icon(locked ? 'lock' : 'unlock');
      const badge = navLink.get(sec.id).querySelector('[data-nav-count]');
      badge.hidden = ids.length === 0;
      badge.textContent = ids.length;
    }
  }
  store.subscribe(paint);
  paint(store.get());

  /* --- búsqueda --- */
  function filter(raw) {
    const q = fold(raw).trim();
    let shown = 0;
    for (const sec of domain.sections) {
      const el = secEl.get(sec.id);
      let secShown = 0;
      el.querySelectorAll('[data-s]').forEach(n => { const hide = !!q && !matchesAll(n.dataset.s, q); n.hidden = hide; if (!hide) secShown++; });
      el.querySelectorAll('.opt-group').forEach(g => { g.hidden = !!q && !g.querySelector('[data-s]:not([hidden])'); });
      el.hidden = !!q && secShown === 0;
      navLink.get(sec.id).hidden = el.hidden;
      shown += secShown;
    }
    status.textContent = q ? (shown ? `${fmtNumber(shown)} ${shown === 1 ? 'resultado' : 'resultados'}` : 'Sin resultados') : '';
    status.classList.toggle('is-empty', !!q && !shown);
  }
  search.addEventListener('input', debounce(() => filter(search.value), 90));

  /* --- sección activa en la navegación lateral --- */
  const links = new Map();
  navLink.forEach((a, id) => links.set(id, a));
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { navLink.forEach(a => a.classList.remove('is-active')); links.get(en.target.dataset.section)?.classList.add('is-active'); } });
  }, { rootMargin: '-25% 0px -65% 0px' });
  secEl.forEach(el => io.observe(el));

  return { filter };
}
