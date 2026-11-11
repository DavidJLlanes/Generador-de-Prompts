/**
 * AVISO DE CONTENIDO PARA ADULTOS — se muestra en los generadores que tienen opciones `adult-only`.
 * Mientras no se confirme ser mayor de 18 años, esas opciones están bloqueadas y no entran en ningún prompt
 * (ver assets/js/core/exclusions.js). La confirmación es una preferencia local (`adult` en «lv:v1:workspace»).
 */
import { h } from './dom.js';
import { store } from '../core/store.js';
import { ADULT_DOMAINS } from '../core/exclusions.js';

export const hasAdultContent = domainId => ADULT_DOMAINS.has(domainId);

/** Inserta el aviso antes de `anchor` y lo mantiene sincronizado con el estado. */
export function mountAdultNotice({ anchor }) {
  const text = h('p', { class: 'adult-notice__text' });
  const btn = h('button', { type: 'button', class: 'btn btn--outline btn--sm', onClick: () => store.set({ adult: !store.get().adult }) });
  const box = h('aside', { class: 'adult-notice', role: 'region', 'aria-label': 'Aviso de contenido para adultos' }, text, btn);
  anchor.before(box);

  function render(state) {
    const on = state.adult === true;
    box.classList.toggle('is-on', on);
    text.replaceChildren(
      h('strong', {}, on ? 'Contenido para adultos activado. ' : 'Contenido para mayores de 18 años. '),
      on
        ? 'Verás lencería, boudoir, busto, látex y poses o ambientes sensuales. Nunca se combinan con menores ni con personajes de aspecto joven: esas opciones se bloquean solas.'
        : 'Este generador incluye opciones de moda y estética para adultos (lencería, boudoir, busto, látex, poses y ambientes sensuales). Están bloqueadas hasta que confirmes que eres mayor de edad, y aun así se bloquean con menores o personajes de aspecto joven.');
    btn.textContent = on ? 'Ocultar contenido para adultos' : 'Soy mayor de 18 años: mostrar';
    btn.setAttribute('aria-pressed', on);
  }
  store.subscribe(render);
  render(store.get());
  return box;
}
