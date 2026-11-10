/**
 * NAVEGADOR DE OPCIONES — pinta las secciones de un dominio como acordeón (cada sección se pliega
 * y muestra un resumen de lo elegido), gestiona la selección (single/multi), el bloqueo ante
 * «Aleatorio», la búsqueda y la navegación lateral por secciones.
 *
 * Estado de plegado:
 *  - Se recuerda por generador en localStorage (`lv:v1:open:<dominio>`); sin nada guardado,
 *    solo la primera sección empieza abierta.
 *  - Mientras hay una búsqueda activa se abren las secciones con resultados (sin tocar lo guardado).
 */
import { $, h } from './dom.js';
import { icon } from './icons.js';
import { store } from '../core/store.js';
import { loadJSON, saveJSON } from '../core/storage.js';
import { esc, fold, debounce, fmtNumber, matchesAll } from '../core/util.js';

const MODE_LABEL = { single: 'Elige una', multi: 'Selección múltiple' };
const OPEN_KEY = id => `lv:v1:open:${id}`;

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
  const neg = sec.polarity === 'negative';
  const tag = `<span class="tag${neg ? ' tag--neg' : ''}">${neg ? 'Evitar' : MODE_LABEL[sec.mode]}</span>`;
  return `<section class="opt-section${cards}" id="sec-${sec.id}" data-section="${sec.id}">
    <header class="opt-section__head">
      <h2 class="opt-section__heading">
        <button type="button" class="opt-section__toggle" data-act="toggle" aria-expanded="false" aria-controls="panel-${sec.id}">
          <span class="opt-section__chev" aria-hidden="true">${icon('down', 18)}</span>
          <span class="opt-section__titles">
            <span class="opt-section__title">${esc(sec.title)}<span class="opt-section__count" data-count-sec>${fmtNumber(sec.options.length)}</span>${neg ? tag : ''}<b class="opt-section__sel" data-sel-count hidden></b></span>
            <span class="opt-section__summary" data-summary hidden></span>
          </span>
        </button>
      </h2>
      <div class="opt-section__tools">
        <button type="button" class="icon-btn" data-act="lock" aria-pressed="false" title="Fijar esta sección: «Aleatorio» no la cambiará" aria-label="Fijar la sección ${esc(sec.title)}">${icon('unlock')}</button>
        <button type="button" class="icon-btn" data-act="clear" title="Quitar la selección de esta sección" aria-label="Quitar la selección de ${esc(sec.title)}">${icon('x')}</button>
      </div>
    </header>
    <div class="opt-section__panel" id="panel-${sec.id}" role="region" aria-label="${esc(sec.title)}" hidden>
      <div class="opt-section__meta">${neg ? '' : tag}${sec.note ? `<p class="opt-section__note">${esc(sec.note)}</p>` : ''}</div>
      ${body}
    </div>
  </section>`;
}

/**
 * @param {object} p
 * @param {object} p.domain      dominio cargado
 * @param {HTMLElement} p.root   contenedor de las secciones
 * @param {HTMLElement} p.nav    contenedor de la navegación lateral
 * @param {HTMLInputElement} p.search  campo de búsqueda
 * @param {HTMLElement} p.status       elemento donde mostrar el recuento de resultados
 * @param {HTMLButtonElement} [p.toggleAll]  botón «Desplegar todo / Plegar todo»
 */
export function mountOptionBrowser({ domain, root, nav, search, status, toggleAll }) {
  root.classList.add('opt-sections');
  root.innerHTML = domain.sections.map(s => sectionHTML(domain, s)).join('');
  nav.replaceChildren(...domain.sections.map(s => h('a', { class: 'sec-nav__link', href: `#sec-${s.id}`, dataset: { navSec: s.id } },
    h('span', { class: 'sec-nav__text' }, s.title), h('b', { class: 'sec-nav__badge', 'data-nav-count': '', hidden: true }))));

  const secEl = new Map(domain.sections.map(s => [s.id, $(`#sec-${CSS.escape(s.id)}`, root)]));
  const navLink = new Map(domain.sections.map(s => [s.id, $(`[data-nav-sec="${CSS.escape(s.id)}"]`, nav)]));
  const refs = new Map(domain.sections.map(s => {
    const el = secEl.get(s.id);
    return [s.id, {
      el,
      toggle: $('[data-act="toggle"]', el),
      panel: $('.opt-section__panel', el),
      summary: $('[data-summary]', el),
      selCount: $('[data-sel-count]', el),
      lock: $('[data-act="lock"]', el),
      badge: $('[data-nav-count]', navLink.get(s.id)),
      labels: new Map(s.options.map(o => [o.id, o.es])),
    }];
  }));
  const prev = new Map();

  /* --- plegado: estado guardado + estado temporal de la búsqueda --- */
  const known = new Set(domain.sections.map(s => s.id));
  const stored = loadJSON(OPEN_KEY(domain.id));
  const openSet = new Set(Array.isArray(stored) ? stored.filter(id => known.has(id)) : domain.sections.slice(0, 1).map(s => s.id));
  const persist = () => saveJSON(OPEN_KEY(domain.id), [...openSet]);

  let query = '';
  const matches = new Map();      // id de sección → resultados de la búsqueda actual
  const override = new Map();     // id → bool: decisiones manuales mientras hay búsqueda activa

  const isOpen = id => override.has(id) ? override.get(id) : (query ? (matches.get(id) || 0) > 0 : openSet.has(id));

  function renderOpen(id) {
    const r = refs.get(id);
    const open = isOpen(id);
    r.el.classList.toggle('is-open', open);
    r.toggle.setAttribute('aria-expanded', open);
    r.panel.hidden = !open;
  }

  function renderToggleAll() {
    if (!toggleAll) return;
    const visible = domain.sections.filter(s => !secEl.get(s.id).hidden);
    const allOpen = visible.length > 0 && visible.every(s => isOpen(s.id));
    toggleAll.textContent = allOpen ? 'Plegar todo' : 'Desplegar todo';
    toggleAll.setAttribute('aria-label', allOpen ? 'Plegar todas las secciones' : 'Desplegar todas las secciones');
    toggleAll.disabled = visible.length === 0;
    toggleAll.dataset.state = allOpen ? 'open' : 'closed';
  }

  const renderAll = () => { domain.sections.forEach(s => renderOpen(s.id)); renderToggleAll(); };

  function setOpen(id, open) {
    if (query) override.set(id, open);
    else { open ? openSet.add(id) : openSet.delete(id); persist(); }
    renderOpen(id);
    renderToggleAll();
  }

  function setAll(open) {
    const ids = domain.sections.filter(s => !secEl.get(s.id).hidden).map(s => s.id);
    if (query) ids.forEach(id => override.set(id, open));
    else { ids.forEach(id => (open ? openSet.add(id) : openSet.delete(id))); persist(); }
    renderAll();
  }

  if (toggleAll) toggleAll.addEventListener('click', () => setAll(toggleAll.dataset.state !== 'open'));

  /* --- interacción (delegación) --- */
  root.addEventListener('click', e => {
    const secNode = e.target.closest('[data-section]');
    if (!secNode) return;
    const sec = domain._secById.get(secNode.dataset.section);
    const opt = e.target.closest('button[data-opt]');
    if (opt) { store.toggleOption(domain.id, sec, opt.dataset.opt); return; }
    const act = e.target.closest('[data-act]');
    if (!act) return;
    if (act.dataset.act === 'toggle') setOpen(sec.id, !isOpen(sec.id));
    if (act.dataset.act === 'clear') store.setSection(domain.id, sec.id, []);
    if (act.dataset.act === 'lock') store.toggleLock(domain.id, sec.id);
  });

  /* Abrir la sección al ir a ella desde la navegación (o desde un enlace #sec-…) */
  nav.addEventListener('click', e => {
    const a = e.target.closest('[data-nav-sec]');
    if (a) setOpen(a.dataset.navSec, true);
  });
  const hashId = decodeURIComponent(location.hash || '').replace(/^#sec-/, '');
  if (known.has(hashId)) {
    openSet.add(hashId);
    persist();
    requestAnimationFrame(() => secEl.get(hashId).scrollIntoView());
  }

  /* --- sincroniza la interfaz con el estado --- */
  function paint(state) {
    for (const sec of domain.sections) {
      const ids = state.sel[domain.id]?.[sec.id] || [];
      const locked = !!state.locks[domain.id]?.[sec.id];
      const key = ids.join('|') + (locked ? '#L' : '');
      if (prev.get(sec.id) === key) continue;
      prev.set(sec.id, key);
      const set = new Set(ids);
      const r = refs.get(sec.id);
      r.el.querySelectorAll('button[data-opt]').forEach(b => { const on = set.has(b.dataset.opt); b.setAttribute('aria-pressed', on); b.classList.toggle('is-on', on); });
      r.el.classList.toggle('has-selection', ids.length > 0);
      r.lock.setAttribute('aria-pressed', locked);
      r.lock.classList.toggle('is-on', locked);
      r.lock.innerHTML = icon(locked ? 'lock' : 'unlock');
      r.summary.textContent = ids.map(id => r.labels.get(id) || id).join(', ');
      r.summary.hidden = ids.length === 0;
      r.selCount.textContent = ids.length;
      r.selCount.hidden = ids.length === 0;
      r.badge.hidden = ids.length === 0;
      r.badge.textContent = ids.length;
    }
  }
  store.subscribe(paint);
  paint(store.get());
  renderAll();

  /* --- búsqueda --- */
  function filter(raw) {
    const q = fold(raw).trim();
    if (q !== query) override.clear();
    query = q;
    let shown = 0;
    for (const sec of domain.sections) {
      const el = secEl.get(sec.id);
      let secShown = 0;
      el.querySelectorAll('[data-s]').forEach(n => { const hide = !!q && !matchesAll(n.dataset.s, q); n.hidden = hide; if (!hide) secShown++; });
      el.querySelectorAll('.opt-group').forEach(g => { g.hidden = !!q && !g.querySelector('[data-s]:not([hidden])'); });
      el.hidden = !!q && secShown === 0;
      navLink.get(sec.id).hidden = el.hidden;
      matches.set(sec.id, secShown);
      shown += secShown;
    }
    renderAll();
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

  return { filter, setAll };
}
