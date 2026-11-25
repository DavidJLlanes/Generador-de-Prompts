/** Piezas comunes de los diálogos de herramientas (importar, variantes, exportar): el marco y la descarga de archivos. */
import { h } from './dom.js';
import { icon } from './icons.js';

/**
 * Crea y abre un diálogo con cabecera y cuerpo desplazable. Se elimina del DOM al cerrarse.
 * @returns {{dialog: HTMLDialogElement, body: HTMLElement}}
 */
export function openToolDialog({ title, emphasis, lead, id }) {
  const body = h('div', { class: 'tool-body' });
  const dialog = h('dialog', { class: 'ideas tool-dialog', 'aria-labelledby': `${id}-title` },
    h('div', { class: 'ideas__panel' },
      h('header', { class: 'ideas__head' },
        h('div', {},
          h('h2', { class: 'ideas__title', id: `${id}-title` }, title, ' ', h('em', {}, emphasis)),
          h('p', { class: 'ideas__lead' }, lead)),
        h('button', { type: 'button', class: 'icon-btn', 'aria-label': 'Cerrar', html: icon('x'), onClick: () => dialog.close() })),
      body));
  dialog.addEventListener('close', () => dialog.remove());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  document.body.append(dialog);
  dialog.showModal();
  return { dialog, body };
}

/** Descarga un archivo generado en el navegador. */
export function downloadFile(name, data, type) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = h('a', { href: url, download: name });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
