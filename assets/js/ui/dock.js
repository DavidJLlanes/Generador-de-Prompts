/**
 * DOCK «Mi prompt» — barra inferior persistente en todas las páginas con generadores.
 * Muestra cuántas opciones llevas, un extracto del prompt y se despliega en un panel completo.
 */
import { h } from './dom.js';
import { icon } from './icons.js';
import { live } from '../core/live.js';
import { store } from '../core/store.js';
import { renderFormat } from '../core/formats/index.js';
import { createPromptPanel } from './prompt-panel.js';
import { copyText } from './clipboard.js';

let api = null;

export function mountDock() {
  if (api) return api;
  const panel = createPromptPanel({ variant: 'dock' });
  const sheet = h('div', { class: 'dock__sheet', id: 'dock-sheet', role: 'region', 'aria-label': 'Mi prompt', hidden: true },
    h('div', { class: 'container' },
      h('div', { class: 'dock__sheet-head' },
        h('h2', { class: 'dock__title' }, 'Mi ', h('em', {}, 'prompt')),
        h('button', { type: 'button', class: 'btn btn--ghost btn--sm', 'aria-label': 'Cerrar el panel', onClick: () => close() }, h('span', { html: icon('down') }), 'Cerrar')),
      panel.el));

  const count = h('span', { class: 'dock__count' });
  const preview = h('p', { class: 'dock__preview', 'aria-hidden': 'true' });
  const toggle = h('button', { type: 'button', class: 'dock__toggle', 'aria-expanded': 'false', 'aria-controls': 'dock-sheet', onClick: () => (isOpen() ? close() : open()) },
    h('span', { class: 'dock__chev', html: icon('up') }), count);
  const copy = h('button', { type: 'button', class: 'btn btn--primary btn--sm', onClick: () => { const { composed, state } = live.get(); if (!composed.empty) copyText(renderFormat(state.format, composed, state).text, 'Prompt copiado'); } }, h('span', { html: icon('copy', 16) }), 'Copiar');
  const bar = h('div', { class: 'dock__bar' }, h('div', { class: 'container dock__bar-inner' }, toggle, preview, copy));

  const root = h('div', { class: 'dock is-empty', id: 'dock' }, sheet, bar);
  document.body.append(root);

  const isOpen = () => !sheet.hidden;
  function open() { sheet.hidden = false; toggle.setAttribute('aria-expanded', 'true'); root.classList.add('is-open'); document.body.classList.add('dock-open'); sync(); }
  function close() { sheet.hidden = true; toggle.setAttribute('aria-expanded', 'false'); root.classList.remove('is-open'); document.body.classList.remove('dock-open'); sync(); }
  function sync() {
    const n = store.countSelected();
    const visible = n > 0 || isOpen();
    root.classList.toggle('is-empty', !visible);
    document.body.classList.toggle('has-dock', visible);
  }

  live.subscribe(({ state, composed }) => {
    const n = store.countSelected();
    const d = store.selectedDomainIds().length;
    count.textContent = n ? `${n} ${n === 1 ? 'opción' : 'opciones'} · ${d} ${d === 1 ? 'generador' : 'generadores'}` : 'Mi prompt';
    preview.textContent = composed.empty ? '' : renderFormat('text', composed, { ...state, detail: 'short', aspect: '' }).text.slice(0, 220);
    copy.disabled = composed.empty;
    sync();
  });

  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen()) close(); });
  api = { open, close, isOpen };
  return api;
}
