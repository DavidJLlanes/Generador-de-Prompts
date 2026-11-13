/**
 * PANEL DE PROMPT — muestra el prompt compuesto en el formato elegido y los controles que lo
 * afectan (detalle, calidad máxima, proporción). Se usa en el dock inferior y en el constructor.
 */
import { h, clear } from './dom.js';
import { icon } from './icons.js';
import { live } from '../core/live.js';
import { store, CUSTOM_MAX } from '../core/store.js';
import { FORMATS, FORMAT_BY_ID, renderFormat } from '../core/formats/index.js';
import { ASPECTS } from '../../../data/aspects.js';
import { SLOT_BY_ID } from '../../../data/taxonomy.js';
import { shareUrl } from '../core/url-state.js';
import { recordHistory } from '../core/library.js';
import { fmtNumber, debounce } from '../core/util.js';
import { copyText } from './clipboard.js';
import { openLibrary } from './library-dialog.js';
import { toast } from './toast.js';

function aspectSelect() {
  const select = h('select', { class: 'select', 'aria-label': 'Proporción de la imagen', onChange: e => store.set({ aspect: e.target.value }) });
  const groups = new Map();
  for (const a of ASPECTS) {
    if (!a.group) { select.append(h('option', { value: a.id }, a.label)); continue; }
    if (!groups.has(a.group)) { const g = h('optgroup', { label: a.group }); groups.set(a.group, g); select.append(g); }
    groups.get(a.group).append(h('option', { value: a.id }, a.label));
  }
  return select;
}

function segmented(items, onPick, label) {
  const root = h('div', { class: 'segmented', role: 'group', 'aria-label': label });
  items.forEach(([value, text]) => root.append(h('button', { type: 'button', class: 'segmented__btn', dataset: { value }, 'aria-pressed': 'false', onClick: () => onPick(value) }, text)));
  return root;
}

export function createPromptPanel({ variant = 'inline' } = {}) {
  const tabs = h('div', { class: 'tabs', role: 'tablist', 'aria-label': 'Formato de salida' },
    FORMATS.map(f => h('button', { type: 'button', role: 'tab', class: 'tab', dataset: { format: f.id }, 'aria-selected': 'false', onClick: () => store.set({ format: f.id }) }, f.label)));

  const detail = segmented([['rich', 'Detallado'], ['short', 'Conciso']], v => store.set({ detail: v }), 'Nivel de detalle');
  const boostInput = h('input', { type: 'checkbox', class: 'switch__input', onChange: e => store.set({ boost: e.target.checked }) });
  const boost = h('label', { class: 'switch', title: 'Añade un acabado de máxima calidad y los negativos habituales' }, boostInput, h('span', { class: 'switch__track', 'aria-hidden': 'true' }), h('span', { class: 'switch__label' }, 'Calidad máxima'));
  const aspect = aspectSelect();
  const profile = h('select', { class: 'select prompt-profile', 'aria-label': 'Perfil de salida', onChange: e => {
    const profiles = { editorial: { format: 'natural', aspect: '4:5', detail: 'rich', boost: true }, phone: { format: 'text', aspect: '9:19.5', detail: 'rich', boost: true }, product: { format: 'sd', aspect: '1:1', detail: 'rich', boost: true }, social: { format: 'ideogram', aspect: '4:5', detail: 'short', boost: true }, character: { format: 'midjourney', aspect: '2:3', detail: 'rich', boost: true } };
    if (profiles[e.target.value]) store.set(profiles[e.target.value]);
  } }, h('option', { value: '' }, 'Perfil de salida…'), h('option', { value: 'editorial' }, 'Retrato editorial'), h('option', { value: 'phone' }, 'Wallpaper móvil'), h('option', { value: 'product' }, 'Producto cuadrado'), h('option', { value: 'social' }, 'Publicación vertical'), h('option', { value: 'character' }, 'Personaje vertical'));

  const hint = h('p', { class: 'prompt-panel__hint' });
  const out = h('div', { class: 'prompt-panel__out', 'aria-live': 'polite' });
  const meta = h('p', { class: 'prompt-panel__meta' });
  const summary = h('div', { class: 'prompt-panel__summary' });
  const review = h('div', { class: 'prompt-review', role: 'status', 'aria-live': 'polite' });

  // Texto libre: se escribe aquí y se añade al final del prompt (mejor en inglés).
  const customBox = h('textarea', { class: 'field__textarea', rows: '2', maxlength: String(CUSTOM_MAX), placeholder: 'Añade tus propios detalles, mejor en inglés: «a small red umbrella», «cinematic fog»…', 'aria-label': 'Texto libre para añadir al prompt' });
  const customCount = h('span', { class: 'prompt-panel__count' });
  customBox.addEventListener('input', debounce(() => store.set({ custom: customBox.value }), 250));
  const customField = h('label', { class: 'prompt-panel__custom' }, h('span', { class: 'prompt-panel__custom-label' }, 'Texto libre'), customBox, customCount);

  // Imágenes de referencia: si las vas a adjuntar en tu herramienta de IA, el prompt le pide usarlas.
  const refPoseInput = h('input', { type: 'checkbox', class: 'switch__input', onChange: e => store.set({ refPose: e.target.checked }) });
  const refCostumeInput = h('input', { type: 'checkbox', class: 'switch__input', onChange: e => store.set({ refCostume: e.target.checked }) });
  const refSwitch = (input, label, title) => h('label', { class: 'switch', title }, input, h('span', { class: 'switch__track', 'aria-hidden': 'true' }), h('span', { class: 'switch__label' }, label));
  const refNote = h('p', { class: 'prompt-panel__ref-note' });
  const refs = h('div', { class: 'prompt-panel__refs' },
    h('span', { class: 'prompt-panel__custom-label' }, 'Imágenes de referencia'),
    h('div', { class: 'prompt-panel__ref-switches' },
      refSwitch(refPoseInput, 'Adjuntaré una pose', 'Añade al prompt la orden de seguir la pose de la imagen adjunta (un maniquí o dibujo de pose)'),
      refSwitch(refCostumeInput, 'Adjuntaré un vestuario', 'Añade al prompt la orden de vestir al personaje como en la imagen adjunta')),
    refNote);

  let lastText = '';
  const copyBtn = h('button', { type: 'button', class: 'btn btn--primary', onClick: () => { if (lastText) { copyText(lastText, 'Prompt copiado'); recordHistory(store.get()); } } }, h('span', { html: icon('copy') }), 'Copiar prompt');
  const linkBtn = h('button', { type: 'button', class: 'btn btn--outline', onClick: () => store.totalItems() ? copyText(shareUrl(store.get()), 'Enlace copiado') : toast('Elige algo primero', { tone: 'warn' }) }, h('span', { html: icon('link') }), 'Copiar enlace');
  const libBtn = h('button', { type: 'button', class: 'btn btn--outline', onClick: () => openLibrary() }, h('span', { html: icon('bookmark') }), 'Mis prompts');
  const clearBtn = h('button', { type: 'button', class: 'btn btn--ghost', onClick: () => store.clearAll() }, h('span', { html: icon('trash') }), 'Vaciar');
  const undoBtn = h('button', { type: 'button', class: 'btn btn--outline', onClick: () => store.undo() }, 'Deshacer');

  const el = h('section', { class: `prompt-panel prompt-panel--${variant}`, 'aria-label': 'Tu prompt' },
    tabs,
    h('div', { class: 'prompt-panel__controls' }, detail, boost, profile, aspect),
    customField,
    refs,
    hint, out, meta, review, summary,
    h('div', { class: 'prompt-panel__actions' }, copyBtn, linkBtn, libBtn, undoBtn, clearBtn));

  function renderSummary(composed) {
    clear(summary);
    if (composed.empty) return;
    for (const s of composed.slots) {
      const manual = s.parts.filter(p => !p.boost && p.section !== '_rule');
      const auto = s.parts.length - manual.length;
      if (!manual.length && !auto) continue;
      const row = h('div', { class: 'summary-row' }, h('span', { class: 'summary-row__label' }, SLOT_BY_ID[s.slot].es));
      const chips = h('div', { class: 'summary-row__chips' });
      manual.forEach(p => chips.append(h('button', { type: 'button', class: 'chip chip--removable', title: 'Quitar', 'aria-label': `Quitar ${p.es}`, onClick: () => (p.custom ? store.set({ custom: '' }) : store.removeOption(p.domain, p.section, p.option)) }, h('span', { class: 'chip__text' }, p.es), h('span', { html: icon('x', 14) }))));
      if (auto) chips.append(h('span', { class: 'chip chip--auto', title: 'Se añade con «Calidad máxima» o por una regla automática' }, 'Automático'));
      row.append(chips);
      summary.append(row);
    }
    if (composed.negative.length) summary.append(h('div', { class: 'summary-row' }, h('span', { class: 'summary-row__label' }, 'Evitar'), h('div', { class: 'summary-row__chips' }, h('span', { class: 'chip chip--neg' }, `${composed.negative.length} exclusiones`))));
  }

  function render({ state, composed }) {
    el.querySelectorAll('.tab').forEach(t => { const on = t.dataset.format === state.format; t.classList.toggle('is-active', on); t.setAttribute('aria-selected', on); });
    detail.querySelectorAll('.segmented__btn').forEach(b => b.setAttribute('aria-pressed', b.dataset.value === state.detail));
    boostInput.checked = state.boost;
    refPoseInput.checked = state.refPose === true;
    refCostumeInput.checked = state.refCostume === true;
    const refOk = state.format === 'text' || state.format === 'natural';
    refNote.textContent = refOk ? 'Adjunta tú la imagen en ChatGPT, Gemini u otra herramienta que admita referencias.' : 'Solo se añade en los formatos Texto y ChatGPT / Gemini.';
    aspect.value = state.aspect;
    profile.value = '';
    if (document.activeElement !== customBox && customBox.value !== state.custom) customBox.value = state.custom;
    customCount.textContent = state.custom ? `${state.custom.length}/${CUSTOM_MAX}` : '';
    hint.textContent = FORMAT_BY_ID[state.format].hint;

    clear(out);
    if (composed.empty) {
      lastText = '';
      out.append(h('div', { class: 'empty' },
        h('p', { class: 'empty__title' }, 'Tu prompt aparecerá aquí'),
        h('p', {}, 'Elige opciones en cualquier generador. Puedes mezclar sujeto, escenario, clima y fotografía: si no eliges algo, simplemente no se incluye.'),
        h('a', { class: 'btn btn--outline btn--sm', href: '/generadores/' }, 'Explorar generadores')));
      meta.textContent = '';
      copyBtn.disabled = linkBtn.disabled = clearBtn.disabled = true;
    } else {
      copyBtn.disabled = linkBtn.disabled = clearBtn.disabled = false;
      const result = renderFormat(state.format, composed, state);
      lastText = result.text;
      const many = result.blocks.length > 1;
      result.blocks.forEach(b => out.append(h('div', { class: 'out-block' },
        many ? h('div', { class: 'out-block__head' }, h('h3', {}, b.title), h('button', { type: 'button', class: 'btn btn--ghost btn--sm', onClick: () => copyText(b.text, `${b.title} copiado`) }, h('span', { html: icon('copy', 16) }), 'Copiar')) : null,
        h('pre', { class: `out-block__text${state.format === 'ideogram' ? ' is-json' : ''}`, tabindex: '0' }, b.text))));
      const words = result.text.trim().split(/\s+/).length;
      meta.textContent = `${fmtNumber(words)} palabras · ${fmtNumber(result.text.length)} caracteres`;
    }
    renderSummary(composed);
    undoBtn.disabled = !store.canUndo();
    clear(review);
    if (!composed.empty) {
      const hasSubject = composed.slots.some(s => s.slot === 'subject' && s.parts.some(p => !p.boost));
      const selectedSlots = composed.slots.filter(s => s.parts.some(p => !p.boost)).length;
      const notes = [];
      if (!hasSubject) notes.push('Añade un sujeto para que la imagen tenga un protagonista claro.');
      if (selectedSlots === 1) notes.push('Solo hay una categoría seleccionada; puedes enriquecerlo con escenario, pose o estilo.');
      if (state.aspect && !['sd', 'midjourney'].includes(state.format)) notes.push(`La proporción ${state.aspect} se expresa en la descripción del formato elegido.`);
      if (notes.length) review.append(h('p', { class: 'prompt-review__note' }, 'Revisión: ', notes.join(' ')));
      else review.append(h('p', { class: 'prompt-review__ok' }, 'La estructura incluye sujeto y varias categorías. Revisa el resultado antes de copiarlo.'));
    }
  }

  const off = live.subscribe(render);
  return { el, destroy: off };
}
