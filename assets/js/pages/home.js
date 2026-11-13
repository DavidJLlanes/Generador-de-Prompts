import { sitePath } from '../core/site-path.js';
/** Inicio (/): chrome común y el botón «Probar este cruce», que rellena un prompt de ejemplo. */
import { $ } from '../ui/dom.js';
import { initChrome } from '../ui/chrome.js';
import { store } from '../core/store.js';
import { loadDomains } from '../core/registry.js';
import { toast } from '../ui/toast.js';

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
