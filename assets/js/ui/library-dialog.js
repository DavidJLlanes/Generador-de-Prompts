/**
 * DIÁLOGO «MIS PROMPTS» — guardar el prompt actual, cargar o copiar uno guardado, ver el historial de
 * copias y exportar/importar todo como archivo JSON. Funciona en el navegador, sin cuentas.
 */
import { h, clear } from './dom.js';
import { icon } from './icons.js';
import { store } from '../core/store.js';
import { compose } from '../core/composer.js';
import { renderFormat } from '../core/formats/index.js';
import { loadDomains } from '../core/registry.js';
import { loadLibrary, saveItem, deleteItem, renameItem, clearHistory, exportLibrary, importLibrary, LIMITS } from '../core/library.js';
import { copyText } from './clipboard.js';
import { toast } from './toast.js';

const fmtDate = ts => new Date(ts).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

/** Texto en formato «text» de una instantánea (carga bajo demanda los dominios que necesita). */
async function previewOf(snap) {
  const ids = Object.keys(snap.sel);
  const domains = await loadDomains([...ids, ...(ids.length || snap.custom ? ['photo'] : [])]);
  const state = { ...store.get(), ...snap, format: 'text' };
  return renderFormat('text', compose(domains, state), state).text;
}

export function openLibrary({ focusName = false } = {}) {
  let tab = 'saved';
  const nameInput = h('input', { type: 'text', class: 'field__input lib__name', placeholder: 'Nombre del prompt (opcional)', 'aria-label': 'Nombre del prompt a guardar', maxlength: String(LIMITS.name), autocomplete: 'off' });
  const list = h('div', { class: 'lib__list' });
  const tabs = h('div', { class: 'tabs', role: 'tablist', 'aria-label': 'Secciones' });
  const fileInput = h('input', { type: 'file', accept: 'application/json,.json', class: 'sr-only', tabindex: '-1', 'aria-label': 'Importar archivo JSON' });

  const saveBtn = h('button', { type: 'button', class: 'btn btn--primary', onClick: () => {
    const item = saveItem(nameInput.value, store.get());
    if (!item) { toast('Elige algo primero: no hay nada que guardar', { tone: 'warn' }); return; }
    nameInput.value = '';
    tab = 'saved';
    toast('Prompt guardado');
    render();
  } }, h('span', { html: icon('bookmark') }), 'Guardar el prompt actual');

  const dialog = h('dialog', { class: 'lib', 'aria-label': 'Mis prompts' },
    h('div', { class: 'lib__panel' },
      h('header', { class: 'lib__head' },
        h('div', {}, h('h2', { class: 'lib__title' }, 'Mis ', h('em', {}, 'prompts')),
          h('p', { class: 'lib__lead' }, 'Se guardan en este navegador, sin cuentas. Exporta un archivo para llevarlos a otro equipo.')),
        h('button', { type: 'button', class: 'icon-btn', 'aria-label': 'Cerrar', html: icon('x'), onClick: () => dialog.close() })),
      h('div', { class: 'lib__save' }, nameInput, saveBtn),
      tabs, list,
      h('footer', { class: 'lib__foot' },
        h('button', { type: 'button', class: 'btn btn--outline btn--sm', onClick: () => {
          const lib = loadLibrary();
          if (!lib.saved.length && !lib.history.length) { toast('Aún no hay nada que exportar', { tone: 'warn' }); return; }
          const url = URL.createObjectURL(new Blob([exportLibrary()], { type: 'application/json' }));
          const a = h('a', { href: url, download: 'lumenvitae-prompts.json' });
          document.body.append(a); a.click(); a.remove(); URL.revokeObjectURL(url);
        } }, h('span', { html: icon('download', 16) }), 'Exportar'),
        h('button', { type: 'button', class: 'btn btn--outline btn--sm', onClick: () => fileInput.click() }, h('span', { html: icon('upload', 16) }), 'Importar'),
        fileInput)));

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    fileInput.value = '';
    if (!file) return;
    if (file.size > 2_000_000) { toast('El archivo es demasiado grande', { tone: 'warn' }); return; }
    try {
      const { added, skipped } = importLibrary(await file.text());
      toast(added ? `${added} prompt${added === 1 ? '' : 's'} importado${added === 1 ? '' : 's'}${skipped ? ` (${skipped} repetido${skipped === 1 ? '' : 's'} u omitido${skipped === 1 ? '' : 's'})` : ''}` : 'No había prompts nuevos que importar');
      tab = 'saved';
      render();
    } catch (err) { toast(err.message, { tone: 'warn' }); }
  });

  function itemEl(it, kind) {
    const pre = h('p', { class: 'lib__preview' }, 'Cargando vista previa…');
    previewOf(it.snap).then(t => { pre.textContent = t.slice(0, 220) + (t.length > 220 ? '…' : ''); }).catch(() => { pre.textContent = '(no se pudo generar la vista previa)'; });
    const n = Object.values(it.snap.sel).reduce((a, s) => a + Object.values(s).reduce((b, ids) => b + ids.length, 0), 0);
    const title = kind === 'saved'
      ? h('input', { type: 'text', class: 'lib__item-name', value: it.name, maxlength: String(LIMITS.name), 'aria-label': 'Nombre del prompt', onChange: e => { renameItem(it.id, e.target.value); } })
      : h('span', { class: 'lib__item-name lib__item-name--static' }, `Copiado ${fmtDate(it.ts)}`);
    return h('article', { class: 'lib__item' },
      h('div', { class: 'lib__item-top' }, title, h('span', { class: 'lib__meta' }, `${n} ${n === 1 ? 'opción' : 'opciones'}${kind === 'saved' ? ` · ${fmtDate(it.ts)}` : ''}`)),
      pre,
      h('div', { class: 'lib__item-actions' },
        h('button', { type: 'button', class: 'btn btn--primary btn--sm', onClick: () => { store.loadSnapshot(it.snap); toast('Prompt cargado'); dialog.close(); } }, 'Cargar'),
        h('button', { type: 'button', class: 'btn btn--outline btn--sm', onClick: async () => { try { await copyText(await previewOf(it.snap), 'Prompt copiado'); } catch { toast('No se pudo copiar', { tone: 'warn' }); } } }, h('span', { html: icon('copy', 16) }), 'Copiar'),
        kind === 'history' ? h('button', { type: 'button', class: 'btn btn--ghost btn--sm', onClick: () => { saveItem('', { ...store.get(), ...it.snap }); toast('Guardado en «Guardados»'); tab = 'saved'; render(); } }, h('span', { html: icon('bookmark', 16) }), 'Guardar') : null,
        h('button', { type: 'button', class: 'btn btn--ghost btn--sm', 'aria-label': 'Borrar', onClick: () => { deleteItem(kind, it.id); render(); } }, h('span', { html: icon('trash', 16) }), 'Borrar')));
  }

  function render() {
    const lib = loadLibrary();
    clear(tabs);
    [['saved', `Guardados (${lib.saved.length})`], ['history', `Historial (${lib.history.length})`]].forEach(([id, label]) =>
      tabs.append(h('button', { type: 'button', role: 'tab', class: `tab${tab === id ? ' is-active' : ''}`, 'aria-selected': String(tab === id), onClick: () => { tab = id; render(); } }, label)));
    clear(list);
    const items = tab === 'saved' ? lib.saved : lib.history;
    if (!items.length) {
      list.append(h('div', { class: 'empty' },
        h('p', { class: 'empty__title' }, tab === 'saved' ? 'Aún no has guardado ningún prompt' : 'El historial está vacío'),
        h('p', {}, tab === 'saved' ? 'Monta un prompt, ponle un nombre arriba y pulsa «Guardar el prompt actual».' : 'Cada vez que copias un prompt se anota aquí automáticamente (los últimos 30).')));
      return;
    }
    items.forEach(it => list.append(itemEl(it, tab)));
    if (tab === 'history') list.append(h('button', { type: 'button', class: 'btn btn--ghost btn--sm lib__clear', onClick: () => { clearHistory(); render(); } }, 'Vaciar el historial'));
  }

  dialog.addEventListener('close', () => dialog.remove());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  document.body.append(dialog);
  render();
  dialog.showModal();
  if (focusName) nameInput.focus();
}
