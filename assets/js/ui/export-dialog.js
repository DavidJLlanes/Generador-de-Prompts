/**
 * DIÁLOGO «EXPORTAR» — dos salidas para trabajar en lote fuera de la web:
 *   · Lote en CSV: N prompts aleatorios (respetando lo que tengas elegido y bloqueado) en el formato activo.
 *   · Wildcards: las listas de opciones como archivos .txt para ComfyUI / Stable Diffusion WebUI, en un ZIP.
 */
import { h } from './dom.js';
import { live } from '../core/live.js';
import { store } from '../core/store.js';
import { getCatalog, loadDomains } from '../core/registry.js';
import { FORMAT_BY_ID } from '../core/formats/index.js';
import { shareUrl } from '../core/url-state.js';
import { toCSV, batchRow, BATCH_HEADER, wildcardFiles } from '../core/export.js';
import { zipStore } from '../core/zip.js';
import { buildRandomCombination } from './slot-board.js';
import { openToolDialog, downloadFile } from './dialog-kit.js';
import { toast } from './toast.js';

const MAX_BATCH = 200;
const tick = () => new Promise(r => setTimeout(r, 0)); // deja respirar a la interfaz entre prompts

export function openExport() {
  const { dialog, body } = openToolDialog({ id: 'exp', title: 'Exportar en', emphasis: 'lote', lead: 'Para generar muchas imágenes de golpe con tus programas: prompts en una hoja de cálculo o listas para wildcards.' });

  /* ---------- lote en CSV ---------- */
  const count = h('input', { type: 'number', min: '1', max: String(MAX_BATCH), value: '20', 'aria-label': 'Cuántos prompts' });
  const delim = h('select', { class: 'select', 'aria-label': 'Separador de columnas' },
    h('option', { value: ';' }, 'Punto y coma (Excel en español)'), h('option', { value: ',' }, 'Coma (estándar)'));
  const links = h('input', { type: 'checkbox' });
  const csvStatus = h('p', { class: 'tool-status', role: 'status', 'aria-live': 'polite' });
  const csvBtn = h('button', { type: 'button', class: 'btn btn--primary', onClick: runCsv }, 'Generar y descargar CSV');
  const fmt = h('p', { class: 'tool-note' });

  async function runCsv() {
    const n = Math.min(MAX_BATCH, Math.max(1, Math.round(Number(count.value) || 0)));
    count.value = String(n);
    const state = store.get();
    csvBtn.disabled = true;
    const rows = [];
    try {
      for (let i = 1; i <= n; i++) {
        csvStatus.textContent = `Generando ${i} de ${n}…`;
        const { chosen, sel } = await buildRandomCombination(state);
        const full = { ...Object.fromEntries(Object.entries(state.sel).filter(([id]) => !chosen.includes(id))), ...sel };
        const domains = await loadDomains([...Object.keys(full), 'photo']);
        rows.push(batchRow(domains, state, full, i, links.checked ? st => shareUrl(st) : null));
        if (i % 5 === 0) await tick();
      }
      downloadFile(`prompts-${FORMAT_BY_ID[state.format].id}-${n}.csv`, toCSV(BATCH_HEADER, rows, { delimiter: delim.value }), 'text/csv;charset=utf-8');
      csvStatus.className = 'tool-status';
      csvStatus.textContent = `${n} prompts descargados.`;
    } catch (err) {
      csvStatus.className = 'tool-status is-warn';
      csvStatus.textContent = err.message || 'No se pudo generar el lote.';
    } finally { csvBtn.disabled = false; }
  }

  /* ---------- wildcards ---------- */
  const scope = h('select', { class: 'select', 'aria-label': 'Qué generadores exportar' },
    h('option', { value: 'all' }, 'Todos los generadores'), h('option', { value: 'mine' }, 'Solo los de mi prompt actual'));
  const wcStatus = h('p', { class: 'tool-status', role: 'status', 'aria-live': 'polite' });
  const wcBtn = h('button', { type: 'button', class: 'btn btn--primary', onClick: runWildcards }, 'Descargar ZIP de wildcards');

  async function runWildcards() {
    const ids = scope.value === 'mine' ? store.selectedDomainIds() : getCatalog().domains.map(d => d.id);
    if (!ids.length) { wcStatus.className = 'tool-status is-warn'; wcStatus.textContent = 'No hay ningún generador en tu prompt: elige algo primero o exporta todos.'; return; }
    wcBtn.disabled = true;
    wcStatus.className = 'tool-status';
    wcStatus.textContent = 'Preparando los archivos…';
    try {
      const files = wildcardFiles(await loadDomains(ids));
      downloadFile('generador-de-prompts-wildcards.zip', zipStore(files), 'application/zip');
      wcStatus.textContent = `${files.filter(f => f.name.endsWith('.txt') && f.name.startsWith('wildcards/')).length} listas descargadas. Lee LEEME.txt dentro del ZIP.`;
    } catch (err) {
      wcStatus.className = 'tool-status is-warn';
      wcStatus.textContent = err.message || 'No se pudo preparar el ZIP.';
    } finally { wcBtn.disabled = false; }
  }

  const unsub = live.subscribe(({ state }) => { fmt.textContent = `Se genera en el formato activo: ${FORMAT_BY_ID[state.format].label}. Lo que tengas elegido se conserva; lo bloqueado no cambia.`; });
  dialog.addEventListener('close', unsub);

  body.append(
    h('section', { class: 'tool-block' },
      h('h3', {}, 'Lote de prompts en CSV'),
      h('p', { class: 'tool-note' }, `Hasta ${MAX_BATCH} prompts aleatorios y coherentes, con su proporción y tamaño.`),
      h('div', { class: 'tool-row' }, h('label', { class: 'tool-label' }, 'Cuántos', count), h('label', { class: 'tool-label' }, 'Separador', delim),
        h('label', { class: 'tool-label' }, 'Enlace al constructor', h('span', {}, links, ' incluir'))),
      fmt, h('div', { class: 'tool-row' }, csvBtn), csvStatus),
    h('section', { class: 'tool-block' },
      h('h3', {}, 'Wildcards para ComfyUI y Stable Diffusion WebUI'),
      h('p', { class: 'tool-note' }, 'Un .txt por sección (una opción por línea). En el prompt escribes __generador/seccion__ y el programa elige una al azar. No incluye contenido para adultos ni de menores o aspecto joven.'),
      h('div', { class: 'tool-row' }, h('label', { class: 'tool-label' }, 'Qué exportar', scope)),
      h('div', { class: 'tool-row' }, wcBtn), wcStatus));
}
