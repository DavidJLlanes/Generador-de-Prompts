import { sitePath } from '../core/site-path.js';
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
import { randomizeHere } from './quick-actions.js';
import { getAIConfig, getAIProvider, reviewSelectionWithAI, setAIProvider, polishPromptWithAI } from '../core/ai-service.js';
import { manual } from '../core/manual.js';
import { openCompare } from './compare-dialog.js';
import { openAISettings } from './ai-settings.js';
import { lintComposed } from '../core/lint.js';
import { budgetReport } from '../core/tokens.js';
import { MJ_VERSIONS, MJ_RANGES } from '../core/formats/midjourney.js';
import { openImport } from './import-dialog.js';
import { openVariants } from './variants-dialog.js';
import { openExport } from './export-dialog.js';

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

function normalizeReviewText(value) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ').trim();
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

  const priorityInput = h('input', { type: 'checkbox', class: 'switch__input', onChange: e => store.set({ priority: e.target.checked }) });
  const priority = h('label', { class: 'switch', title: 'Pone primero el sujeto, el estilo y el escenario, y deja para el final los detalles finos y la atmósfera. En Stable Diffusion y Midjourney lo que va antes pesa más.' }, priorityInput, h('span', { class: 'switch__track', 'aria-hidden': 'true' }), h('span', { class: 'switch__label' }, 'Estilo y escena primero'));

  // Ajustes de Midjourney: solo visibles en esa pestaña. Vacío = no se añade el parámetro.
  const mjVersion = h('select', { class: 'select', 'aria-label': 'Versión de Midjourney', onChange: e => store.set({ mj: { v: e.target.value } }) }, MJ_VERSIONS.map(([v, l]) => h('option', { value: v }, l)));
  const mjNumber = (key, label) => {
    const [lo, hi] = MJ_RANGES[key];
    const input = h('input', { type: 'number', min: String(lo), max: String(hi), step: '1', placeholder: '—', 'aria-label': `${label} (${lo} a ${hi})` });
    input.addEventListener('change', () => store.set({ mj: { [key]: input.value } }));
    return { key, input, el: h('label', { class: 'mj-field' }, `${label} (${lo}–${hi})`, input) };
  };
  const mjFields = [mjNumber('stylize', 'Stylize'), mjNumber('chaos', 'Chaos'), mjNumber('weird', 'Weird')];
  const mjRawInput = h('input', { type: 'checkbox', onChange: e => store.set({ mj: { raw: e.target.checked } }) });
  const mjBox = h('div', { class: 'prompt-panel__mj', role: 'group', 'aria-label': 'Parámetros de Midjourney', hidden: true },
    h('label', { class: 'mj-field' }, 'Versión', mjVersion), mjFields.map(f => f.el), h('label', { class: 'mj-field mj-field--check' }, mjRawInput, 'Raw'));

  const hint = h('p', { class: 'prompt-panel__hint' });
  const out = h('div', { class: 'prompt-panel__out', 'aria-live': 'polite' });
  const meta = h('p', { class: 'prompt-panel__meta' });
  const tokensBox = h('div', { class: 'prompt-tokens' });
  const summary = h('div', { class: 'prompt-panel__summary' });
  const review = h('div', { class: 'prompt-review', role: 'status', 'aria-live': 'polite' });
  const aiReviewStatus = h('p', { class: 'idea-interpreter__status', role: 'status', 'aria-live': 'polite' });
  let latestComposed = null;
  let aiProviders = [];
  let aiFindings = null;
  const aiReviewButton = h('button', { type: 'button', class: 'btn btn--outline btn--sm', hidden: true, onClick: async () => {
    const selected = (latestComposed?.parts || []).filter(p => !p.boost && p.section !== '_rule').map(p => ({
      id: `${p.domain}::${p.section}::${p.option}`,
      label: p.es || 'Texto libre', meaning: (p.custom ? p.text : p.short || p.text || '').slice(0, 240), section: p.section, domain: p.domain,
    }));
    if (selected.length < 2) return;
    const providerId = aiProviders.some(p => p.id === getAIProvider()) ? getAIProvider() : aiProviders[0]?.id;
    if (!providerId) { openAISettings(); return; }
    if (getAIProvider() !== providerId) setAIProvider(providerId);
    aiReviewButton.disabled = true;
    aiReviewStatus.textContent = `Revisando ${selected.length} selecciones con ${aiProviders.find(p => p.id === providerId)?.label || 'IA'}…`;
    try {
      const result = await reviewSelectionWithAI(selected);
      const signature = selected.map(p => p.id + ':' + p.meaning).join('|');
      aiFindings = { signature, groups: result.groups || [] };
      aiReviewStatus.textContent = aiFindings.groups.length ? 'Revisión terminada. Comprueba los posibles duplicados señalados.' : 'La IA no detectó repeticiones semánticas claras.';
      render(live.get());
    } catch (error) {
      aiReviewStatus.textContent = error.message;
    } finally { aiReviewButton.disabled = false; }
  } }, 'Buscar redundancias con IA');
  const aiReviewActions = h('div', { class: 'prompt-review__ai', hidden: true }, aiReviewButton, aiReviewStatus,
    h('small', {}, 'Al pulsar, se enviarán las selecciones al proveedor configurado; puede tener coste.'));

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
  const copyBtn = h('button', { type: 'button', class: 'btn btn--primary', onClick: () => { if (lastText) { copyText(manual.resolve(lastText), 'Prompt copiado'); recordHistory(store.get()); } } }, h('span', { html: icon('copy') }), 'Copiar prompt');
  const randomBtn = h('button', { type: 'button', class: 'btn btn--primary', onClick: () => randomizeHere() }, h('span', { html: icon('dice') }), 'Aleatorio');
  const linkBtn = h('button', { type: 'button', class: 'btn btn--outline', onClick: () => store.totalItems() ? copyText(shareUrl(store.get()), 'Enlace copiado') : toast('Elige algo primero', { tone: 'warn' }) }, h('span', { html: icon('link') }), 'Copiar enlace');
  const libBtn = h('button', { type: 'button', class: 'btn btn--outline', onClick: () => openLibrary() }, h('span', { html: icon('bookmark') }), 'Mis prompts');
  let editing = false;
  let compareA = null;
  let polishing = false;
  const editBtn = h('button', { type: 'button', class: 'btn btn--outline', title: 'Retoca el texto a mano antes de copiarlo', onClick: () => { editing = !editing; if (!editing) manual.clear(); render(live.get()); } }, 'Editar');
  const polishBtn = h('button', { type: 'button', class: 'btn btn--outline', title: 'Reescribe el prompt con fluidez usando tu IA configurada (se envía el texto al proveedor; puede tener coste)', onClick: async () => {
    if (!lastText) return;
    if (!aiProviders.length) { openAISettings(); return; }
    const providerId = aiProviders.some(p => p.id === getAIProvider()) ? getAIProvider() : aiProviders[0].id;
    if (getAIProvider() !== providerId) setAIProvider(providerId);
    const base = lastText;
    polishing = true; render(live.get());
    try {
      const { prompt } = await polishPromptWithAI(manual.resolve(base), FORMAT_BY_ID[store.get().format].label);
      manual.set(base, prompt, 'ai');
      editing = true;
      toast('Prompt pulido con IA. Puedes retocarlo o restaurar el original.');
    } catch (error) { toast(error.message, { tone: 'warn' }); }
    polishing = false; render(live.get());
  } }, h('span', { html: icon('spark') }), 'Pulir con IA');
  const compareBtn = h('button', { type: 'button', class: 'btn btn--outline', onClick: () => {
    if (!lastText) return;
    const now = manual.resolve(lastText);
    if (compareA == null) { compareA = now; toast('Guardada como versión A. Cambia algo y pulsa «Comparar con A».'); render(live.get()); return; }
    openCompare({ a: compareA, b: now, onPinB: () => { compareA = now; render(live.get()); } });
  } }, 'Fijar como A');
  const clearBtn = h('button', { type: 'button', class: 'btn btn--ghost', onClick: () => store.clearAll() }, h('span', { html: icon('trash') }), 'Vaciar');
  const undoBtn = h('button', { type: 'button', class: 'btn btn--outline', onClick: () => store.undo() }, 'Deshacer');

  // Herramientas: importar un prompt ajeno, variantes A/B y exportación en lote.
  const toolsItems = [
    ['Importar un prompt', 'Pega un prompt y lo convierto en opciones', openImport],
    ['Variantes A/B', 'Cambia una sección y compara cuatro prompts', openVariants],
    ['Exportar en lote', 'CSV de prompts aleatorios o wildcards', openExport],
  ];
  const toolsMenu = h('details', { class: 'tools-menu' },
    h('summary', { class: 'btn btn--outline', 'aria-haspopup': 'true' }, 'Herramientas'),
    h('div', { class: 'tools-menu__list' }, toolsItems.map(([title, sub, fn]) => h('button', { type: 'button', class: 'tools-menu__item', onClick: () => { toolsMenu.open = false; fn(); } }, title, h('small', {}, sub)))));
  const closeTools = e => { if (toolsMenu.open && !toolsMenu.contains(e.target)) toolsMenu.open = false; };
  document.addEventListener('click', closeTools);
  toolsMenu.addEventListener('keydown', e => { if (e.key === 'Escape' && toolsMenu.open) { e.stopPropagation(); toolsMenu.open = false; toolsMenu.querySelector('summary').focus(); } });

  const el = h('section', { class: `prompt-panel prompt-panel--${variant}`, 'aria-label': 'Tu prompt' },
    tabs,
    h('div', { class: 'prompt-panel__controls' }, detail, boost, profile, aspect, priority),
    mjBox,
    customField,
    refs,
    hint, out, meta, tokensBox, review, aiReviewActions, summary,
    h('div', { class: 'prompt-panel__actions' }, copyBtn, randomBtn, linkBtn, libBtn, editBtn, polishBtn, compareBtn, undoBtn, clearBtn, toolsMenu));

  const removePart = p => (p.custom ? store.set({ custom: '' }) : store.removeOption(p.domain, p.section, p.option));
  const partChips = (parts, cls = 'prompt-review__chips') => h('div', { class: cls }, parts.map(p => h('button', { type: 'button', class: 'chip chip--removable', title: 'Quitar del prompt', 'aria-label': `Quitar ${p.es}`, onClick: () => removePart(p) }, p.es)));

  /** Cuántos tokens ocupa el prompt en el formato activo y qué quedaría fuera si no cabe. */
  function renderTokens(rep, state) {
    clear(tokensBox);
    tokensBox.className = `prompt-tokens${rep ? ` is-${rep.level}` : ''}`;
    if (!rep) return;
    const edge = rep.limit ?? rep.soft;
    tokensBox.append(h('p', { class: 'prompt-tokens__line' }, `≈ ${rep.tokens} tokens${edge ? ` de ${edge}${rep.limit ? '' : ' recomendados'}` : ''} (cálculo aproximado). ${rep.level === 'ok' ? '' : rep.note}`));
    if (rep.cut.length) {
      const shown = rep.cut.slice(0, 8);
      const row = h('div', { class: 'prompt-tokens__cut' }, h('span', {}, rep.limit ? 'Quedarían fuera:' : 'Pasan de lo recomendado:'));
      row.append(partChips(shown, 'prompt-review__chips'));
      if (rep.cut.length > shown.length) row.append(h('span', {}, `y ${rep.cut.length - shown.length} más`));
      tokensBox.append(row);
    }
    if (rep.level !== 'ok' && ['sd', 'midjourney'].includes(state.format) && !state.priority) {
      tokensBox.append(h('div', {}, h('button', { type: 'button', class: 'btn btn--outline btn--sm', onClick: () => store.set({ priority: true }) }, 'Poner estilo y escena primero')));
    }
  }

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
    latestComposed = composed;
    const signature = composed.parts.filter(p => !p.boost && p.section !== '_rule').map(p => `${p.domain}::${p.section}::${p.option}:${p.custom ? p.text : p.short || ''}`).join('|');
    if (aiFindings && aiFindings.signature !== signature) aiFindings = null;
    el.querySelectorAll('.tab').forEach(t => { const on = t.dataset.format === state.format; t.classList.toggle('is-active', on); t.setAttribute('aria-selected', on); });
    detail.querySelectorAll('.segmented__btn').forEach(b => b.setAttribute('aria-pressed', b.dataset.value === state.detail));
    boostInput.checked = state.boost;
    priorityInput.checked = state.priority === true;
    priority.hidden = !['sd', 'midjourney'].includes(state.format);
    mjBox.hidden = state.format !== 'midjourney';
    if (document.activeElement !== mjVersion) mjVersion.value = state.mj.v;
    mjFields.forEach(f => { if (document.activeElement !== f.input) f.input.value = state.mj[f.key] ?? ''; });
    mjRawInput.checked = state.mj.raw === true;
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
        h('a', { class: 'btn btn--outline btn--sm', href: sitePath('/generadores/') }, 'Explorar generadores')));
      meta.textContent = '';
      renderTokens(null, state);
      copyBtn.disabled = linkBtn.disabled = clearBtn.disabled = editBtn.disabled = polishBtn.disabled = compareBtn.disabled = true;
    } else {
      copyBtn.disabled = linkBtn.disabled = clearBtn.disabled = editBtn.disabled = compareBtn.disabled = false;
      polishBtn.disabled = polishing;
      const result = renderFormat(state.format, composed, state);
      lastText = result.text;
      const edited = manual.for(result.text);
      const finalText = edited ? edited.text : result.text;
      if (editing || edited) {
        // Editor: el texto final es lo que se copia; solo vale mientras no cambie la selección.
        const box = h('textarea', { class: 'field__textarea out-edit__text', rows: '8', spellcheck: 'false', 'aria-label': 'Prompt editable' });
        box.value = finalText;
        const tag = h('span', { class: 'out-edit__tag' });
        const restore = h('button', { type: 'button', class: 'btn btn--ghost btn--sm', onClick: () => { manual.clear(); render(live.get()); } }, 'Restaurar original');
        const sync = () => {
          const e = manual.for(result.text);
          tag.textContent = e?.by === 'ai' ? 'Pulido con IA' : e ? 'Editado a mano' : 'Modo edición';
          restore.hidden = !e;
          const finalNow = e ? e.text : result.text;
          meta.textContent = `${fmtNumber(finalNow.trim().split(/\s+/).length)} palabras · ${fmtNumber(finalNow.length)} caracteres`;
        };
        box.addEventListener('input', () => { manual.set(result.text, box.value); sync(); });
        sync();
        out.append(h('div', { class: 'out-edit' },
          h('div', { class: 'out-edit__bar' }, tag, h('span', {}, 'Si cambias la selección, se vuelve al prompt generado.'), restore),
          box));
      } else {
        const many = result.blocks.length > 1;
        result.blocks.forEach(b => out.append(h('div', { class: 'out-block' },
          many ? h('div', { class: 'out-block__head' }, h('h3', {}, b.title), h('button', { type: 'button', class: 'btn btn--ghost btn--sm', onClick: () => copyText(b.text, `${b.title} copiado`) }, h('span', { html: icon('copy', 16) }), 'Copiar')) : null,
          h('pre', { class: `out-block__text${state.format === 'ideogram' ? ' is-json' : ''}`, tabindex: '0' }, b.text))));
      }
      renderTokens(budgetReport(state.format, result), state);
      const words = finalText.trim().split(/\s+/).length;
      meta.textContent = `${fmtNumber(words)} palabras · ${fmtNumber(finalText.length)} caracteres`;
    }
    renderSummary(composed);
    undoBtn.disabled = !store.canUndo();
    editBtn.textContent = editing ? 'Terminar edición' : 'Editar';
    compareBtn.textContent = compareA == null ? 'Fijar como A' : 'Comparar con A';
    polishBtn.lastChild.textContent = polishing ? 'Puliendo…' : 'Pulir con IA';
    clear(review);
    if (!composed.empty) {
      const hasSubject = composed.slots.some(s => s.slot === 'subject' && s.parts.some(p => !p.boost));
      const selectedSlots = composed.slots.filter(s => s.parts.some(p => !p.boost)).length;
      const notes = [];
      if (!hasSubject) notes.push('Añade un sujeto para que la imagen tenga un protagonista claro.');
      if (selectedSlots === 1) notes.push('Solo hay una categoría seleccionada; puedes enriquecerlo con escenario, pose o estilo.');
      const crowded = composed.slots
        .filter(s => ['attribute', 'setting', 'atmosphere', 'technical'].includes(s.slot))
        .map(s => ({ slot: s.slot, count: s.parts.filter(p => !p.boost).length }))
        .filter(s => s.count > 8);
      if (crowded.length) {
        const detail = crowded.map(s => `${s.count} en ${SLOT_BY_ID[s.slot].es.toLowerCase()}`).join(' y ');
        notes.push(`Hay ${detail}; comprueba si cada opción añade algo distinto al prompt.`);
      }
      const customText = composed.parts.find(p => p.custom)?.text;
      if (customText) {
        const normalizedCustom = ` ${normalizeReviewText(customText)} `;
        const repeated = composed.parts.find(p => !p.custom && !p.boost && p.section !== '_rule' && p.short && normalizeReviewText(p.short).split(' ').length >= 3 && normalizedCustom.includes(` ${normalizeReviewText(p.short)} `));
        if (repeated) notes.push(`El texto libre repite «${repeated.short.slice(0, 72)}${repeated.short.length > 72 ? '…' : ''}», que ya está seleccionado; puedes quitar una de las dos apariciones.`);
      }
      if (state.aspect && !['sd', 'midjourney', 'dalle'].includes(state.format)) notes.push(`La proporción ${state.aspect} se expresa en la descripción del formato elegido.`);
      const clashes = lintComposed(composed, state);
      for (const w of clashes) review.append(h('div', { class: 'prompt-review__warn' }, h('p', {}, h('strong', {}, `${w.title}: `), w.text), partChips(w.parts)));
      if (notes.length) review.append(h('p', { class: 'prompt-review__note' }, 'Revisión: ', notes.join(' ')));
      else if (!clashes.length) review.append(h('p', { class: 'prompt-review__ok' }, 'La estructura incluye sujeto y varias categorías. Revisa el resultado antes de copiarlo.'));
      if (aiFindings?.signature === signature) {
        if (!aiFindings.groups.length) review.append(h('p', { class: 'prompt-review__note' }, 'Revisión IA: no detectó repeticiones semánticas claras.'));
        for (const group of aiFindings.groups) {
          const items = group.ids.map(id => composed.parts.find(p => `${p.domain}::${p.section}::${p.option}` === id)).filter(Boolean);
          if (items.length < 2) continue;
          const chips = h('div', { class: 'prompt-review__chips' });
          items.forEach(p => chips.append(h('button', { type: 'button', class: 'chip chip--removable', title: 'Quitar del prompt', 'aria-label': `Quitar ${p.es}`, onClick: () => (p.custom ? store.set({ custom: '' }) : store.removeOption(p.domain, p.section, p.option)) }, p.es)));
          review.append(h('div', { class: 'prompt-review__note' }, h('p', {}, 'Posible repetición: ', group.reason || 'estas opciones pueden describir el mismo detalle.'), chips));
        }
      }
    }
    const reviewable = composed.parts.filter(p => !p.boost && p.section !== '_rule').length >= 2;
    aiReviewActions.hidden = !reviewable || !aiProviders.length;
    aiReviewButton.hidden = false;
  }

  const refreshAI = () => getAIConfig().then(config => { aiProviders = config.providers || []; render(live.get()); }).catch(() => {});
  refreshAI();
  window.addEventListener('lumen-ai-config-change', refreshAI);
  const off = live.subscribe(render);
  return { el, destroy: () => { off(); document.removeEventListener('click', closeTools); window.removeEventListener('lumen-ai-config-change', refreshAI); } };
}
