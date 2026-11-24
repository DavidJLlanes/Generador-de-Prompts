import { sitePath } from '../core/site-path.js';
/** Inicio (/): chrome común y el botón «Probar este cruce», que rellena un prompt de ejemplo. */
import { $ } from '../ui/dom.js';
import { initChrome } from '../ui/chrome.js';
import { store } from '../core/store.js';
import { loadDomains } from '../core/registry.js';
import { toast } from '../ui/toast.js';
import { domainMeta } from '../core/registry.js';
import { randomSelection, SLOT_CAPS } from '../core/random.js';
import { compose } from '../core/composer.js';
import { renderFormat } from '../core/formats/index.js';
import { ASPECTS, ASPECT_BY_ID } from '../../../data/aspects.js';
import { buildRandomCombination } from '../ui/slot-board.js';
import { copyText } from '../ui/clipboard.js';

initChrome();

/** Ejemplo de cruce: se buscan las opciones por su texto en inglés para no depender de ids concretos. */
const RECIPE = [
  ['woman', 'edad', /early 20s/],
  ['woman', 'expresion', /calm|serene|neutral/],
  ['scenarios', 'motivo', /tea house/],
  ['scenarios', 'ambiente', /rainy night/],
  ['weather', 'tipo-clima', /light fog|misty/],
  ['photo', 'lighting', /golden|soft/],
  ['scenarios', 'estilo', /35 mm/],
];

const btn = $('[data-act="try-cross"]');
if (btn) btn.addEventListener('click', async () => {
  btn.disabled = true;
  try {
    const domains = await loadDomains([...new Set(RECIPE.map(r => r[0]))]);
    store.clearAll();
    for (const [d, s, rx] of RECIPE) {
      const sec = domains[d].sections.find(x => x.id === s);
      const opt = sec && (sec.options.find(o => rx.test(o.en)) || sec.options[0]);
      if (opt) store.toggleOption(d, sec, opt.id);
    }
    location.href = sitePath('/constructor/');
  } catch {
    toast('No se pudo preparar el ejemplo', { tone: 'warn' });
    btn.disabled = false;
  }
});

/* ── Prueba rápida: prompt aleatorio con generador y proporción a elegir (no toca el workspace) ── */
const quick = $('[data-quick]');
if (quick) {
  const genSel = $('[data-quick-gen]', quick);
  const aspectSel = $('[data-quick-aspect]', quick);
  const rollBtn = $('[data-quick-roll]', quick);
  const copyBtn = $('[data-quick-copy]', quick);
  const openBtn = $('[data-quick-open]', quick);
  const result = $('[data-quick-result]', quick);
  const textEl = $('[data-quick-text]', quick);
  const tagsEl = $('[data-quick-tags]', quick);
  const frame = $('[data-quick-frame]', quick);
  const ratioEl = $('[data-quick-ratio]', quick);
  let last = null;
  let busy = false;

  const pickOne = arr => arr[Math.floor(Math.random() * arr.length)];

  function showFrame(aspectId) {
    const [a, b] = aspectId.split(':').map(Number);
    frame.style.setProperty('--r', a && b ? String(a / b) : '1.7778');
    ratioEl.textContent = aspectId || 'libre';
  }

  async function generate() {
    const base = { ...store.get(), sel: {}, locks: {}, custom: '', aspect: '', format: 'text', detail: 'rich', boost: true, refPose: false, refCostume: false };
    const genId = genSel.value;
    for (let attempt = 0; attempt < 5; attempt++) {
      let sel;
      if (genId) {
        const d = (await loadDomains([genId]))[genId];
        sel = randomSelection([d], base, Math.random, 12);
      } else {
        sel = (await buildRandomCombination(base)).sel;
      }
      const aspect = aspectSel.value === 'random' ? pickOne(ASPECTS.filter(a => a.id)).id : aspectSel.value;
      const state = { ...base, sel, aspect };
      const domains = await loadDomains([...new Set([...Object.keys(sel), 'photo'])]);
      const composed = compose(domains, state);
      if (composed.empty) continue;
      return { state, sel, aspect, text: renderFormat('text', composed, state).text };
    }
    return null;
  }

  async function roll() {
    if (busy) return;
    busy = true;
    rollBtn.classList.add('is-rolling');
    try {
      const out = await generate();
      if (!out) { toast('No salió nada con esa combinación. Prueba otra vez o elige otro generador.', { tone: 'warn' }); return; }
      last = out;
      textEl.textContent = out.text;
      tagsEl.replaceChildren(...[
        ...Object.keys(out.sel).map(id => domainMeta(id)?.short).filter(Boolean),
        out.aspect ? (ASPECT_BY_ID[out.aspect]?.label || out.aspect).split(' · ')[0] : 'Sin proporción',
      ].map(t => { const el = document.createElement('span'); el.className = 'quick__tag'; el.textContent = t; return el; }));
      showFrame(out.aspect);
      copyBtn.disabled = openBtn.disabled = false;
      result.classList.remove('is-fresh'); void result.offsetWidth; result.classList.add('is-fresh');
    } catch (err) {
      console.error(err);
      toast('No se pudo generar el prompt', { tone: 'warn' });
    } finally {
      busy = false;
      setTimeout(() => rollBtn.classList.remove('is-rolling'), 600);
    }
  }

  rollBtn.addEventListener('click', roll);
  copyBtn.addEventListener('click', () => { if (last) copyText(last.text, 'Prompt copiado'); });
  openBtn.addEventListener('click', () => {
    if (!last) return;
    store.replaceSelection(last.sel);
    store.set({ aspect: last.aspect });
    location.href = sitePath('/constructor/');
  });
  genSel.addEventListener('change', roll);
  aspectSel.addEventListener('change', () => { if (last) roll(); });

  // Primer prompt automático cuando la sección entra en pantalla (no se descargan datos antes de hacer falta).
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) { io.disconnect(); roll(); } }, { rootMargin: '200px' });
    io.observe(quick);
  } else roll();
}
