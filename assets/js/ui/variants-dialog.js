/**
 * DIÁLOGO «VARIANTES A/B» — cambia UNA sección del prompt por otras cuatro opciones y muestra los prompts
 * resultantes lado a lado, para comparar (¿qué luz funciona mejor?). Elegir una la aplica al prompt.
 */
import { h, clear } from './dom.js';
import { live } from '../core/live.js';
import { store } from '../core/store.js';
import { compose } from '../core/composer.js';
import { renderFormat, FORMAT_BY_ID } from '../core/formats/index.js';
import { variableSections, defaultTarget, makeVariants } from '../core/variants.js';
import { openToolDialog } from './dialog-kit.js';
import { copyText } from './clipboard.js';
import { toast } from './toast.js';

const LETTERS = 'BCDEFGH';

/** Fragmento del prompt alrededor de lo que cambia, con la pieza marcada: lo único distinto entre variantes. */
function snippet(text, parts, radius = 90) {
  const low = text.toLowerCase();
  for (const needle of parts.filter(Boolean)) {
    const at = low.indexOf(needle.toLowerCase());
    if (at < 0) continue;
    const from = Math.max(0, at - radius), to = Math.min(text.length, at + needle.length + radius);
    return [from > 0 ? '…' : '', text.slice(from, at), h('mark', { class: 'var-mark' }, text.slice(at, at + needle.length)), text.slice(at + needle.length, to), to < text.length ? '…' : ''];
  }
  return [text.slice(0, 2 * radius) + (text.length > 2 * radius ? '…' : '')];
}

export function openVariants() {
  const { state, domains } = live.get();
  const sections = variableSections(domains, state);
  if (!sections.length || store.countSelected() === 0) { toast('Elige primero algo en un generador para poder variarlo', { tone: 'warn' }); return; }
  const { dialog, body } = openToolDialog({ id: 'var', title: 'Variantes', emphasis: 'A/B', lead: 'Cambia solo una cosa del prompt y compara el resultado. Úsala para decidir luz, estilo, plano o cualquier otra sección.' });

  const key = s => `${s.domain}/${s.section}`;
  const select = h('select', { class: 'select', 'aria-label': 'Sección que se va a variar' });
  const byDomain = new Map();
  for (const s of sections) {
    if (!byDomain.has(s.domain)) { const g = h('optgroup', { label: s.domainTitle }); byDomain.set(s.domain, g); select.append(g); }
    byDomain.get(s.domain).append(h('option', { value: key(s) }, `${s.title}${s.current.length ? ' · en uso' : ''}`));
  }
  const first = defaultTarget(sections);
  select.value = key(first);
  const grid = h('div', { class: 'var-grid', 'aria-live': 'polite' });
  const status = h('p', { class: 'tool-status', role: 'status' });
  const again = h('button', { type: 'button', class: 'btn btn--outline', onClick: () => roll() }, 'Otras cuatro');
  select.addEventListener('change', () => roll());

  function roll() {
    const current = live.get();
    const [domain, section] = select.value.split('/');
    const variants = makeVariants(current.domains, current.state, { domain, section }, 4);
    clear(grid);
    const target = sections.find(s => key(s) === select.value);
    const sec = current.domains[domain]?._secById?.get(section);
    const now = (current.state.sel[domain]?.[section] || []).map(id => sec?._byId?.get(id)?.es).filter(Boolean).join(', ');
    status.textContent = variants.length ? `Tu prompt actual (A) lleva ${now ? `«${now}»` : 'esta sección vacía'}. Se cambia solo «${target.title}»; formato ${FORMAT_BY_ID[current.state.format].label}.` : 'No hay otras opciones compatibles en esa sección.';
    variants.forEach((v, i) => {
      const st = { ...current.state, sel: v.sel };
      const composed = compose(current.domains, st);
      const text = renderFormat(st.format, composed, st).text;
      const part = composed.parts.find(p => p.domain === domain && p.section === section && p.option === v.option);
      grid.append(h('article', { class: 'var-card' },
        h('span', { class: 'var-card__tag' }, `Variante ${LETTERS[i]}`),
        h('h3', { class: 'var-card__title' }, v.es),
        h('p', { class: 'var-card__text' }, snippet(text, [part?.text, part?.short, v.en])),
        h('details', { class: 'var-card__full' }, h('summary', {}, 'Ver el prompt completo'), h('p', {}, text)),
        h('div', { class: 'var-card__actions' },
          h('button', { type: 'button', class: 'btn btn--primary btn--sm', onClick: () => { store.set({ sel: v.sel }); toast(`«${v.es}» aplicada. Pulsa Deshacer para volver.`); dialog.close(); } }, 'Usar esta'),
          h('button', { type: 'button', class: 'btn btn--outline btn--sm', onClick: () => copyText(text, 'Variante copiada') }, 'Copiar'))));
    });
  }

  body.append(h('div', { class: 'tool-row' }, h('label', { class: 'tool-label' }, 'Qué cambiar', select), again), status, grid);
  roll();
}
