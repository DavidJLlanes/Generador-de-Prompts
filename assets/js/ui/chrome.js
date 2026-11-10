/**
 * CHROME — comportamiento común de todas las páginas: menú móvil, enlace activo, contador de
 * «Mi prompt», dock inferior y carga de prompts compartidos por enlace.
 */
import { $, $$ } from './dom.js';
import { store } from '../core/store.js';
import { readSharedFromLocation } from '../core/url-state.js';
import { mountDock } from './dock.js';
import { toast } from './toast.js';

export function initChrome() {
  // Prompt compartido (#s=…): se carga antes de pintar nada que dependa del estado.
  const shared = readSharedFromLocation();
  if (shared) {
    store.replaceSelection(shared.sel);
    store.set({ detail: shared.detail, boost: shared.boost, aspect: shared.aspect, custom: shared.custom });
    queueMicrotask(() => toast('Prompt compartido cargado'));
  }

  // Menú móvil
  const toggle = $('.nav-toggle');
  const nav = $('#site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', open);
      nav.classList.toggle('is-open', open);
    });
    nav.addEventListener('click', e => { if (e.target.closest('a')) { toggle.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); } });
  }

  // Enlace activo
  const path = location.pathname;
  $$('.site-nav a').forEach(a => {
    const href = a.getAttribute('href');
    const active = href === '/' ? path === '/' : path.startsWith(href) && !(href === '/generadores/' && path.startsWith('/generadores/escenarios'));
    a.classList.toggle('is-active', active);
    if (active) a.setAttribute('aria-current', 'page');
  });

  // Dock (salvo en páginas que ya muestran el panel inline)
  const dock = document.body.dataset.dock === 'off' ? null : mountDock();

  // Botón «Mi prompt» de la cabecera + contador
  const badge = $('[data-count]');
  const refreshBadge = () => {
    const n = store.totalItems();
    if (badge) { badge.textContent = n; badge.hidden = n === 0; }
  };
  refreshBadge();
  store.subscribe(refreshBadge);
  $$('[data-dock-open]').forEach(btn => btn.addEventListener('click', () => {
    if (dock) dock.isOpen() ? dock.close() : dock.open();
    else location.href = '/constructor/';
  }));

  // Atajo «/» para ir al buscador de la página
  document.addEventListener('keydown', e => {
    if (e.key !== '/' || e.target.closest('input, textarea, select, [contenteditable]')) return;
    const search = $('[data-search]');
    if (search) { e.preventDefault(); search.focus(); }
  });

  return { dock };
}
