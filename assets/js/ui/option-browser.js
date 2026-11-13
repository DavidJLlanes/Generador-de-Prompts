import { sitePath } from '../core/site-path.js';
/**
 * NAVEGADOR DE OPCIONES — pinta las secciones de un dominio como acordeón (cada sección se pliega
 * y muestra un resumen de lo elegido), gestiona la selección (single/multi), el bloqueo ante
 * «Aleatorio», la búsqueda y la navegación lateral por secciones.
 *
 * Estado de plegado:
 *  - Se recuerda por generador en localStorage (`lv:v1:open:<dominio>`); sin nada guardado,
 *    solo la primera sección empieza abierta.
 *  - Las secciones con `foldGroups` pintan cada subgrupo como <details> (cerrado por defecto).
 *  - Mientras hay una búsqueda activa se abren las secciones con resultados (sin tocar lo guardado).
 */
import { $, h } from './dom.js';
import { icon } from './icons.js';
import { store } from '../core/store.js';
import { domainMeta } from '../core/registry.js';
import { loadJSON, saveJSON } from '../core/storage.js';
import { toast } from './toast.js';
import { blockedChecker } from '../core/exclusions.js';
import { familyOf, familySiblings } from '../core/families.js';
import { esc, fold, debounce, fmtNumber, matchesAll } from '../core/util.js';

const MODE_LABEL = { single: 'Elige una', multi: 'Selección múltiple' };
const OPEN_KEY = id => `lv:v1:open:${id}`;

function optionHTML(o) {
  const s = esc(fold(`${o.es} ${o.en} ${o.name || ''}`));
  const tip = esc((o.name ? `${o.name} — ` : '') + o.en.slice(0, 180));
  if (o.thumb) {
    return `<button type="button" class="opt opt--thumb" data-opt="${o.id}" data-s="${s}" aria-pressed="false" title="${tip}">
      <img class="opt__img" src="${sitePath(o.thumb)}" alt="" loading="lazy" decoding="async">
      <span class="opt__label"><span class="opt__title">${esc(o.es)}</span>${o.name ? `<span class="opt__sub">${esc(o.name)}</span>` : ''}</span></button>`;
  }
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
    ? groups.map(g => {
      const list = sec.options.filter(o => o.group === g.id);
      const items = `<div class="opt-list">${list.map(optionHTML).join('')}</div>`;
      if (!sec.foldGroups) return `<div class="opt-group" data-group="${g.id}"><h3 class="opt-group__title">${esc(g.title)}</h3>${items}</div>`;
      return `<details class="opt-group opt-group--fold" data-group="${g.id}"><summary class="opt-group__summary"><span class="opt-group__chev" aria-hidden="true">${icon('down', 14)}</span><span class="opt-group__title">${esc(g.title)}</span><span class="opt-group__count" data-count-group>${fmtNumber(list.length)}</span><b class="opt-group__sel" data-group-sel hidden></b></summary>${items}</details>`;
    }).join('')
    : `<div class="opt-list">${sec.options.map(optionHTML).join('')}</div>`;
  const cards = sec.options.some(o => o.info) ? ' opt-section--cards' : '';
  const thumbs = sec.options.some(o => o.thumb) ? ' opt-section--thumbs' : '';
  const neg = sec.polarity === 'negative';
  const tag = `<span class="tag${neg ? ' tag--neg' : ''}">${neg ? 'Evitar' : MODE_LABEL[sec.mode]}</span>`;
  /* La sección comparte concepto con otras: aviso de que elegir aquí sustituye a lo de allí (data/families.js) */
  const family = familyOf(domain.id, sec.id);
  const others = family
    ? [...new Set(familySiblings(domain.id, sec.id).filter(x => x.domain !== domain.id).map(x => domainMeta(x.domain)?.short || x.domain))]
    : [];
  const familyNote = others.length
    ? `<p class="opt-section__family">Mismo concepto (${esc(family.label)}) que ${esc(others.join(', '))}: lo que elijas aquí sustituye a lo elegido allí.</p>`
    : '';
  return `<section class="opt-section${cards}${thumbs}" id="sec-${sec.id}" data-section="${sec.id}">
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
      <div class="opt-section__meta">${neg ? '' : tag}${familyNote}${sec.note ? `<p class="opt-section__note">${esc(sec.note)}</p>` : ''}</div>
      <p class="opt-section__block" data-block role="status" hidden></p>
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
      block: $('[data-block]', el),
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
    if (opt && opt.getAttribute('aria-disabled') === 'true') { toast(opt.dataset.why || 'Esta opción no se puede combinar con lo que ya elegiste.', { tone: 'warn' }); return; }
    if (opt) {
      const cleared = store.toggleOption(domain.id, sec, opt.dataset.opt, domain);
      if (cleared.length) {
        const name = x => `«${x.title || domainMeta(x.domain)?.short || x.domain}»${x.label && !x.title ? ` (${x.label})` : ''}`;
        const fam = cleared.filter(x => x.kind === 'family');
        const con = cleared.filter(x => x.kind === 'conflict');
        const list = arr => arr.map(name).join(', ');
        toast(fam.length && !con.length
          ? `Se quitó ${list(fam)}: describe lo mismo que «${sec.title}»`
          : con.length && !fam.length
            ? `Se quitó ${list(con)}: no combina con «${sec.title}»`
            : `Se quitó ${list(cleared)}: no puede convivir con «${sec.title}»`);
      }
      return;
    }
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

  /* --- exclusiones: deshabilita lo que no se puede combinar con lo ya elegido (data/exclusions.js) --- */
  let blockSig = '';
  function paintBlocks(state) {
    const sig = JSON.stringify([state.sel, state.adult === true]);
    if (sig === blockSig) return;
    blockSig = sig;
    const check = blockedChecker(state.sel, { adult: state.adult === true });
    for (const sec of domain.sections) {
      const r = refs.get(sec.id);
      let n = 0;
      const reasons = new Set();
      r.el.querySelectorAll('button[data-opt]').forEach(b => {
        const why = check(domain.id, sec.id, b.dataset.opt);
        b.classList.toggle('is-blocked', !!why);
        if (why) { b.setAttribute('aria-disabled', 'true'); b.dataset.why = why; n++; reasons.add(why); }
        else { b.removeAttribute('aria-disabled'); delete b.dataset.why; }
      });
      r.el.classList.toggle('is-blocked', n > 0 && n === sec.options.length);
      r.block.hidden = n === 0;
      if (n) r.block.textContent = `${n === sec.options.length ? 'Sección bloqueada' : `${n} ${n === 1 ? 'opción bloqueada' : 'opciones bloqueadas'}`}: ${[...reasons].slice(0, 2).join(' ')}`;
    }
  }

  /* --- sincroniza la interfaz con el estado --- */
  function paint(state) {
    paintBlocks(state);
    for (const sec of domain.sections) {
      const ids = state.sel[domain.id]?.[sec.id] || [];
      const locked = !!state.locks[domain.id]?.[sec.id];
      const key = ids.join('|') + (locked ? '#L' : '');
      if (prev.get(sec.id) === key) continue;
      prev.set(sec.id, key);
      const set = new Set(ids);
      const r = refs.get(sec.id);
      r.el.querySelectorAll('button[data-opt]').forEach(b => { const on = set.has(b.dataset.opt); b.setAttribute('aria-pressed', on); b.classList.toggle('is-on', on); });
      r.el.querySelectorAll('.opt-group--fold').forEach(g => {
        const n = g.querySelectorAll('button[data-opt].is-on').length;
        const b = $('[data-group-sel]', g);
        b.textContent = n; b.hidden = n === 0;
      });
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
    /* Subgrupos plegables: al buscar se abren los que tienen resultados; al limpiar se restaura lo que había */
    const folds = root.querySelectorAll('.opt-group--fold');
    if (q && !query) folds.forEach(g => { g.dataset.was = g.open ? '1' : ''; });
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
    folds.forEach(g => { g.open = q ? !g.hidden : !!g.dataset.was; if (!q) delete g.dataset.was; });
    renderAll();
    status.textContent = q ? (shown ? `${fmtNumber(shown)} ${shown === 1 ? 'resultado' : 'resultados'}` : 'Sin resultados') : '';
    status.classList.toggle('is-empty', !!q && !shown);
  }
  search.addEventListener('input', debounce(() => filter(search.value), 90));

  /* --- sección activa en la navegación lateral --- */
  const links = new Map();
  navLink.forEach((a, id) => links.set(id, a));
  const strip = () => nav.scrollWidth > nav.clientWidth + 2 && getComputedStyle(nav).display === 'flex'; // tira horizontal (pantallas estrechas)
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      navLink.forEach(a => a.classList.remove('is-active'));
      const a = links.get(en.target.dataset.section);
      if (!a) return;
      a.classList.add('is-active');
      if (strip()) nav.scrollTo({ left: a.offsetLeft - (nav.clientWidth - a.offsetWidth) / 2, behavior: 'smooth' }); // la pastilla activa siempre a la vista
    });
  }, { rootMargin: '-25% 0px -65% 0px' });
  /* Con ratón, la rueda desplaza la tira horizontal (salvo en los extremos, donde sigue moviendo la página). */
  nav.addEventListener('wheel', e => {
    if (!strip() || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    const max = nav.scrollWidth - nav.clientWidth;
    if ((e.deltaY < 0 && nav.scrollLeft <= 0) || (e.deltaY > 0 && nav.scrollLeft >= max - 1)) return;
    nav.scrollLeft += e.deltaY;
    e.preventDefault();
  }, { passive: false });
  secEl.forEach(el => io.observe(el));

  return { filter, setAll };
}
