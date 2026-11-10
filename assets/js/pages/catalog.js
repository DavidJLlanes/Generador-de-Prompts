/** Catálogo (/generadores/): filtra por ranura y busca sobre las tarjetas ya renderizadas por el build. */
import { $, $$ } from '../ui/dom.js';
import { initChrome } from '../ui/chrome.js';
import { store } from '../core/store.js';
import { fold, debounce, matchesAll } from '../core/util.js';

initChrome();

const cards = $$('.card--domain');
const groups = $$('[data-group]');
const filters = $$('[data-filter]');
const search = $('[data-search]');
const empty = $('[data-empty]');
let role = '';
let query = '';

function apply() {
  cards.forEach(c => { c.hidden = !((!role || c.dataset.role === role) && (!query || matchesAll(c.dataset.s, query))); });
  groups.forEach(g => { g.hidden = !g.querySelector('.card--domain:not([hidden])'); });
  empty.hidden = cards.some(c => !c.hidden);
}

filters.forEach(b => b.addEventListener('click', () => {
  role = b.dataset.filter;
  filters.forEach(x => x.setAttribute('aria-pressed', x === b));
  apply();
}));
search.addEventListener('input', debounce(() => { query = fold(search.value).trim(); apply(); }, 90));

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
