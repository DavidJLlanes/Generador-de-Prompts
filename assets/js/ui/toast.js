import { h } from './dom.js';

let host;
let timer;

/** Aviso breve y accesible (role=status) en la parte inferior de la pantalla. */
export function toast(message, { tone = 'ok' } = {}) {
  if (!host) {
    host = h('div', { class: 'toast-host', role: 'status', 'aria-live': 'polite' });
    document.body.append(host);
  }
  const el = h('div', { class: `toast toast--${tone}` }, message);
  host.replaceChildren(el);
  requestAnimationFrame(() => el.classList.add('is-in'));
  clearTimeout(timer);
  timer = setTimeout(() => { el.classList.remove('is-in'); setTimeout(() => el.remove(), 250); }, 2200);
}
