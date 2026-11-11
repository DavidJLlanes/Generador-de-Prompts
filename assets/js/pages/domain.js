/** Página de un generador (/generadores/<slug>/): carga el dominio y monta el navegador de opciones. */
import { $ } from '../ui/dom.js';
import { initChrome } from '../ui/chrome.js';
import { loadDomain } from '../core/registry.js';
import { store } from '../core/store.js';
import { randomSelection } from '../core/random.js';
import { mountOptionBrowser } from '../ui/option-browser.js';
import { openPresets } from '../ui/presets-drawer.js';
import { toast } from '../ui/toast.js';
import { mountAdultNotice, hasAdultContent } from '../ui/adult-notice.js';

initChrome();

const id = document.body.dataset.domainId;
const root = $('[data-sections]');

try {
  const domain = await loadDomain(id);
  root.removeAttribute('aria-busy');
  if (hasAdultContent(id)) mountAdultNotice({ anchor: root });
  const toggleAll = $('[data-toggle-all]');
  const search = $('[data-search]');
  const { filter } = mountOptionBrowser({ domain, root, nav: $('[data-nav]'), search, status: $('[data-status]'), toggleAll });
  /* Llegada desde el buscador global: ?q=… rellena la búsqueda y abre lo que coincide */
  const q = new URLSearchParams(location.search).get('q');
  if (q) { search.value = q.slice(0, 80); filter(search.value); }
  toggleAll.hidden = false;

  $('[data-act="random"]').addEventListener('click', () => {
    const sel = randomSelection([domain], store.get(), Math.random, 12);
    store.applySelection(domain.id, sel[domain.id] || {});
  });
  $('[data-act="clear-domain"]').addEventListener('click', () => store.clearDomain(domain.id));
  const ideas = $('[data-act="ideas"]');
  if (ideas) ideas.addEventListener('click', () => openPresets(domain).catch(() => toast('No se pudieron cargar las ideas', { tone: 'warn' })));
} catch (err) {
  console.error(err);
  root.removeAttribute('aria-busy');
  root.innerHTML = '<p class="notice">No se pudo cargar este generador. Recarga la página o inténtalo más tarde.</p>';
}
