/**
 * DIÁLOGO «IMPORTAR UN PROMPT» — pega un prompt en inglés (de esta web o de otra parte) y se desglosa en
 * opciones de los generadores; lo que no se reconoce pasa al texto libre. Se aplica sustituyendo o añadiendo
 * a lo que ya hay (un solo paso de «Deshacer»).
 */
import { h, clear } from './dom.js';
import { store, CUSTOM_MAX } from '../core/store.js';
import { loadDomains } from '../core/registry.js';
import { sitePath } from '../core/site-path.js';
import { buildImportIndex, parsePrompt } from '../core/importer.js';
import { enforce } from '../core/exclusions.js';
import { ASPECT_BY_ID } from '../../../data/aspects.js';
import { openToolDialog } from './dialog-kit.js';
import { toast } from './toast.js';

let indexPromise = null;
const loadIndex = () => indexPromise || (indexPromise = fetch(sitePath('/data/import-index.json'))
  .then(r => { if (!r.ok) throw new Error('No se pudo cargar el índice del importador.'); return r.json(); })
  .then(buildImportIndex)
  .catch(err => { indexPromise = null; throw err; }));

/** Mezcla una selección importada con la actual: las secciones de elección única se sustituyen y el resto se une. */
export function mergeSelections(current, incoming, domains) {
  const out = structuredClone(current);
  for (const [d, secs] of Object.entries(incoming)) for (const [s, ids] of Object.entries(secs)) {
    const single = domains[d]?._secById?.get(s)?.mode === 'single';
    const have = out[d]?.[s] || [];
    ((out[d] ||= {})[s]) = single ? ids.slice(0, 1) : [...new Set([...have, ...ids])];
  }
  return out;
}

export function openImport() {
  const { dialog, body } = openToolDialog({ id: 'imp', title: 'Importar un', emphasis: 'prompt', lead: 'Pega un prompt en inglés y lo convierto en opciones de los generadores. Lo que no reconozca va al texto libre.' });
  const input = h('textarea', { class: 'field__textarea', rows: '6', maxlength: '6000', spellcheck: 'false', placeholder: 'Pega aquí un prompt: de esta web (cualquier formato) o de otro sitio, también con parámetros de Midjourney…', 'aria-label': 'Prompt a importar' });
  const status = h('p', { class: 'tool-status', role: 'status', 'aria-live': 'polite' });
  const result = h('div', { class: 'tool-body' });
  let parsed = null;
  let domains = {};
  let kept = null; // selección tras quitar lo que choca y lo que el usuario descarte

  const analyze = h('button', { type: 'button', class: 'btn btn--primary', onClick: run }, 'Analizar');

  async function run() {
    const text = input.value.trim();
    if (!text) { status.textContent = 'Pega primero un prompt.'; status.className = 'tool-status is-warn'; return; }
    analyze.disabled = true;
    status.className = 'tool-status';
    status.textContent = 'Analizando…';
    try {
      const index = await loadIndex();
      parsed = parsePrompt(text, index);
      domains = await loadDomains(Object.keys(parsed.sel));
      kept = structuredClone(parsed.sel);
      show();
    } catch (err) {
      status.className = 'tool-status is-warn';
      status.textContent = err.message || 'No se pudo analizar el prompt.';
    } finally { analyze.disabled = false; }
  }

  function label(m) {
    const o = domains[m.domain]?._secById?.get(m.section)?._byId?.get(m.option);
    return { es: o?.es || m.en, section: domains[m.domain]?._secById?.get(m.section)?.title || m.section };
  }

  function show() {
    clear(result);
    const state = store.get();
    const safe = enforce(kept, { adult: state.adult === true });
    const dropped = safe.removed.length;
    kept = safe.sel;
    const shown = parsed.matches.filter(m => kept[m.domain]?.[m.section]?.includes(m.option));
    const n = shown.length;
    status.className = 'tool-status';
    status.textContent = n || parsed.custom
      ? `${n} ${n === 1 ? 'opción reconocida' : 'opciones reconocidas'}${parsed.custom ? ' y texto libre' : ''}${parsed.aspect ? ` · proporción ${parsed.aspect}` : ''}.${dropped ? ` ${dropped} se descartó por incompatible o por la puerta de edad.` : ''}`
      : 'No encontré nada que importar en ese texto.';
    if (!n && !parsed.custom) return;

    if (n) {
      const chips = h('div', { class: 'imp-chips' });
      shown.forEach(m => {
        const l = label(m);
        chips.append(h('button', { type: 'button', class: 'chip chip--removable imp-chip', title: `Quitar de la importación (${l.section})`, 'aria-label': `Quitar ${l.es}`, onClick: () => {
          kept[m.domain][m.section] = kept[m.domain][m.section].filter(x => x !== m.option);
          if (!kept[m.domain][m.section].length) delete kept[m.domain][m.section];
          if (!Object.keys(kept[m.domain]).length) delete kept[m.domain];
          show();
        } }, l.es, h('small', {}, l.section)));
      });
      result.append(h('div', { class: 'tool-block' }, h('h3', {}, 'Opciones reconocidas'), chips));
    }
    if (parsed.custom) result.append(h('div', { class: 'tool-block' }, h('h3', {}, 'Texto libre'), h('p', { class: 'imp-custom' }, parsed.custom), h('p', { class: 'tool-note' }, 'No coincide con ninguna opción: se añade tal cual al final del prompt.')));
    for (const note of parsed.ignored) result.append(h('p', { class: 'tool-note' }, note));
    result.append(h('div', { class: 'tool-row' },
      h('button', { type: 'button', class: 'btn btn--primary', onClick: () => apply(false) }, 'Sustituir mi prompt'),
      h('button', { type: 'button', class: 'btn btn--outline', onClick: () => apply(true) }, 'Añadir a mi prompt')));
  }

  function apply(add) {
    const state = store.get();
    const hadSomething = store.totalItems() > 0;
    const sel = add ? mergeSelections(state.sel, kept, domains) : kept;
    const custom = add ? [state.custom.trim(), parsed.custom].filter(Boolean).join(', ').slice(0, CUSTOM_MAX) : parsed.custom;
    const aspect = ASPECT_BY_ID[parsed.aspect] ? parsed.aspect : state.aspect;
    store.set({ sel, custom, aspect, ...(add ? {} : { attach: {} }) });
    toast(hadSomething && !add ? 'Prompt importado. Si querías lo anterior, pulsa Deshacer.' : 'Prompt importado');
    dialog.close();
  }

  body.append(input, h('div', { class: 'tool-row' }, analyze), status, result,
    h('p', { class: 'tool-note' }, 'Funciona con el texto de cualquier formato de esta web y con prompts de otros sitios. Se ignora el prompt negativo, «Avoid» y los parámetros (--v, --s…); la proporción sí se aprovecha.'));
  input.focus();
}
