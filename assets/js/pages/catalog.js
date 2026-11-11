/** Catálogo (/generadores/): filtra por ranura y busca sobre las tarjetas ya renderizadas por el build. */
import { $, $$ } from '../ui/dom.js';
import { initChrome } from '../ui/chrome.js';
import { store } from '../core/store.js';
import { fold, debounce, matchesAll, fmtNumber } from '../core/util.js';

initChrome();

const cards = $$('.card--domain');
const groups = $$('[data-group]');
const filters = $$('[data-filter]');
const search = $('[data-search]');
const empty = $('[data-empty]');
const hits = $('[data-hits]');
const hitsList = $('[data-hits-list]');
const hitsCount = $('[data-hits-count]');
let role = '';
let query = '';

/* --- buscador global de opciones: el índice se baja solo la primera vez que se busca --- */
const MAX_HITS = 40;
let indexPromise = null;
const loadIndex = () => indexPromise || (indexPromise = fetch('/data/search-index.json')
  .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
  .then(raw => ({
    domains: raw.d,
    rows: raw.o.map(([d, id, title, labels]) => ({ d, id, title, labels, folded: labels.map(fold) })),
  }))
  .catch(() => { indexPromise = null; return null; }));

let hitCount = 0;
async function renderHits() {
  const q = query;
  if (q.length < 2) { hits.hidden = true; hitCount = 0; return; }
  const idx = await loadIndex();
  if (!idx || q !== query) return;
  const found = [];
  let total = 0;
  for (const row of idx.rows) {
    for (let i = 0; i < row.labels.length; i++) {
      if (!matchesAll(row.folded[i], q)) continue;
      total++;
      if (found.length < MAX_HITS * 4) found.push({ row, label: row.labels[i], start: row.folded[i].startsWith(q) ? 0 : 1 });
    }
  }
  found.sort((a, b) => a.start - b.start).splice(MAX_HITS);
  hitCount = total;
  hitsCount.textContent = total ? `(${fmtNumber(total)})` : '';
  const items = found.map(({ row, label }) => {
    const [slug, short] = idx.domains[row.d];
    const a = document.createElement('a');
    a.href = `/generadores/${slug}/?q=${encodeURIComponent(label.split(' · ')[0])}#sec-${row.id}`;
    const b = document.createElement('b');
    b.textContent = label;
    const span = document.createElement('span');
    span.textContent = `${short} › ${row.title}`;
    a.append(b, span);
    const li = document.createElement('li');
    li.append(a);
    return li;
  });
  hitsList.replaceChildren(...items);
  hits.hidden = !total;
}

function apply() {
  cards.forEach(c => { c.hidden = !((!role || c.dataset.role === role) && (!query || matchesAll(c.dataset.s, query))); });
  groups.forEach(g => { g.hidden = !g.querySelector('.card--domain:not([hidden])'); });
  const showEmpty = () => { empty.hidden = cards.some(c => !c.hidden) || hitCount > 0; };
  showEmpty();
  renderHits().then(showEmpty);
}

filters.forEach(b => b.addEventListener('click', () => {
  role = b.dataset.filter;
  filters.forEach(x => x.setAttribute('aria-pressed', x === b));
  apply();
}));
search.addEventListener('input', debounce(() => { query = fold(search.value).trim(); apply(); }, 90));

const initial = new URLSearchParams(location.search).get('q');
if (initial) { search.value = initial.slice(0, 80); query = fold(search.value).trim(); apply(); }

function badges() {
  cards.forEach(c => {
    const n = store.countSelected(c.dataset.id);
    const b = c.querySelector('[data-sel]');
    b.hidden = n === 0;
    b.textContent = `${n} elegidas`;
  });
}
store.subscribe(badges);
badges();
