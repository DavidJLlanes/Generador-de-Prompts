/**
 * DIÁLOGO «COMPARAR» — dos versiones de un prompt lado a lado con las diferencias marcadas por palabras:
 * lo que sale de A en rojo tachado, lo que entra en B en claro. Sirve para probar variantes (A/B).
 */
import { h } from './dom.js';
import { icon } from './icons.js';
import { wordDiff } from '../core/diff.js';
import { copyText } from './clipboard.js';

/**
 * @param {{a: string, b: string, onPinB?: () => void}} opts  `onPinB`: fijar B como nuevo A
 */
export function openCompare({ a, b, onPinB }) {
  const diff = wordDiff(a, b);
  const side = (kinds, mark) => h('pre', { class: 'cmp__text' },
    ...diff.filter(d => d.k === 'same' || d.k === kinds).map(d => d.k === 'same' ? d.t : h('mark', { class: `cmp__mark cmp__mark--${mark}` }, d.t)));
  const changes = diff.filter(d => d.k !== 'same').length;
  const dialog = h('dialog', { class: 'lib cmp', 'aria-labelledby': 'cmp-title' },
    h('div', { class: 'lib__panel' },
      h('header', { class: 'lib__head' },
        h('div', {},
          h('h2', { class: 'lib__title', id: 'cmp-title' }, 'Comparar ', h('em', {}, 'variantes')),
          h('p', { class: 'lib__lead' }, changes ? 'En A está tachado lo que desaparece; en B, resaltado lo que entra.' : 'Las dos versiones son idénticas.')),
        h('button', { type: 'button', class: 'icon-btn', 'aria-label': 'Cerrar', html: icon('x'), onClick: () => dialog.close() })),
      h('div', { class: 'cmp__grid' },
        h('section', { class: 'cmp__col' }, h('h3', {}, 'A (guardada)'), side('del', 'del'),
          h('button', { type: 'button', class: 'btn btn--outline btn--sm', onClick: () => copyText(a, 'Versión A copiada') }, h('span', { html: icon('copy', 16) }), 'Copiar A')),
        h('section', { class: 'cmp__col' }, h('h3', {}, 'B (actual)'), side('add', 'add'),
          h('button', { type: 'button', class: 'btn btn--primary btn--sm', onClick: () => copyText(b, 'Versión B copiada') }, h('span', { html: icon('copy', 16) }), 'Copiar B'))),
      onPinB ? h('button', { type: 'button', class: 'btn btn--ghost btn--sm cmp__pin', onClick: () => { onPinB(); dialog.close(); } }, 'Usar la actual como nueva A') : null));
  dialog.addEventListener('close', () => dialog.remove());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  document.body.append(dialog);
  dialog.showModal();
}
