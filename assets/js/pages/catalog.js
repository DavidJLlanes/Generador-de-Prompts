import { sitePath } from '../core/site-path.js';
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
// Alias de intención para las búsquedas habituales: una consulta puede encontrar etiquetas
// que usan otra palabra (p. ej. «pelo» también encuentra «cabello» y «peinado»).
const INTENTS = {
  pelo: 'cabello peinado peinados', cabello: 'pelo peinado peinados', peinado: 'pelo cabello peinados',
  cara: 'rostro cara facial', rostro: 'cara facial', ojos: 'ojo mirada iris', labios: 'labio boca maquillaje',
  fondo: 'escenario paisaje interior exterior', lugar: 'escenario paisaje localización', tiempo: 'clima atmósfera lluvia nieve niebla',
  luz: 'iluminación iluminación luz', ropa: 'vestuario ropa prendas', cámara: 'fotografía cámara objetivo lente',
  tristeza: 'triste melancólica llorando', 'pelo rojo': 'pelirrojo cobrizo', 'pelo rubio': 'rubio', 'pelo moreno': 'moreno castano',
  'pelo negro': 'negro azabache', 'pelo castaño': 'castano', 'pelo blanco': 'canoso platino', pelirroja: 'pelirrojo cobrizo', alegría: 'feliz alegre sonrisa', móvil: 'teléfono wallpaper fondo pantalla',
};
const INTENTS_F = Object.fromEntries(Object.entries(INTENTS).map(([k, v]) => [fold(k), v])); // la consulta llega sin acentos
const termsFor = q => [q, ...(INTENTS_F[fold(q)] || '').split(' ').filter(Boolean)];

/* --- buscador global: el índice se baja solo la primera vez que se busca ---
   Encuentra opciones (en español y en inglés), secciones («Versión», «Escena fotográfica»…) y subgrupos
   («Míticos · 1960s») de todos los generadores, y agrupa los resultados por sección: cada bloque enlaza a la
   sección completa del generador, ya desplegada, además de a cada opción concreta. */
const MAX_SECTIONS = 14;
const OPTS_PER_SECTION = 8;
let indexPromise = null;
const loadIndex = () => indexPromise || (indexPromise = fetch(sitePath('/data/search-index.json'))
  .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
  .then(raw => ({
    domains: raw.d,
    rows: raw.o.map(([d, id, title, labels, gIdx = [], groups = [], en = {}]) => ({
      d, id, title, labels, gIdx, groups,
      folded: labels.map((l, k) => fold(en[k] ? `${l} ${en[k]}` : l)),
      ftitle: fold(title), fdomain: fold(raw.d[d][1]), fgroups: groups.map(([, t]) => fold(t)),
    })),
  }))
  .catch(() => { indexPromise = null; return null; }));

const make = (tag, cls, text) => { const el = document.createElement(tag); if (cls) el.className = cls; if (text != null) el.textContent = text; return el; };
const genUrl = (slug, params, sec) => sitePath(`/generadores/${slug}/${params ? `?${new URLSearchParams(params)}` : ''}#sec-${sec}`);

let hitCount = 0;
async function renderHits() {
  const q = query;
  if (q.length < 2) { hits.hidden = true; hitCount = 0; return; }
  const idx = await loadIndex();
  if (!idx || q !== query) return;
  const terms = termsFor(q);
  const hit = text => terms.some(term => matchesAll(text, term));
  const blocks = [];
  let total = 0;
  for (const row of idx.rows) {
    const sectionHit = hit(row.ftitle) || (!hit(row.fdomain) && hit(`${row.fdomain} ${row.ftitle}`));
    const groupHits = row.fgroups.map((g, k) => (hit(g) ? k : -1)).filter(k => k >= 0);
    const opts = [];
    for (let i = 0; i < row.labels.length; i++) if (hit(row.folded[i])) opts.push(i);
    if (!sectionHit && !groupHits.length && !opts.length) continue;
    total += opts.length + (sectionHit ? 1 : 0) + groupHits.length;
    const starts = opts.some(i => row.folded[i].startsWith(q));
    blocks.push({ row, sectionHit, groupHits, opts, rank: sectionHit ? 0 : groupHits.length ? 1 : starts ? 2 : 3 });
  }
  blocks.sort((x, y) => x.rank - y.rank || y.opts.length - x.opts.length);
  hitCount = total;
  hitsCount.textContent = total ? `(${fmtNumber(total)})` : '';
  hitsList.replaceChildren(...blocks.slice(0, MAX_SECTIONS).map(({ row, sectionHit, groupHits, opts }) => {
    const [slug, short] = idx.domains[row.d];
    const li = make('li', 'hit-sec');
    const head = make('a', 'hit-sec__head');
    head.href = genUrl(slug, null, row.id);
    head.append(make('b', '', `${short} › ${row.title}`), make('span', '', `Ver la sección completa · ${fmtNumber(row.labels.length)} opciones`));
    li.append(head);
    const chips = make('div', 'hit-sec__opts');
    for (const k of groupHits) {
      const a = make('a', 'hit-chip hit-chip--group', `${row.groups[k][1]} · ${fmtNumber(row.gIdx.filter(x => x === k).length)}`);
      a.href = genUrl(slug, { g: row.groups[k][0] }, row.id);
      chips.append(a);
    }
    for (const i of opts.sort((x, y) => (row.folded[x].startsWith(q) ? 0 : 1) - (row.folded[y].startsWith(q) ? 0 : 1)).slice(0, OPTS_PER_SECTION)) {
      const a = make('a', 'hit-chip', row.labels[i]);
      a.href = genUrl(slug, { q: row.labels[i].split(' · ')[0] }, row.id);
      chips.append(a);
    }
    if (opts.length > OPTS_PER_SECTION) {
      const more = make('a', 'hit-chip hit-chip--more', `+${fmtNumber(opts.length - OPTS_PER_SECTION)} más`);
      more.href = genUrl(slug, { q: search.value.trim() }, row.id);
      chips.append(more);
    }
    if (chips.childElementCount) li.append(chips);
    else if (sectionHit) head.classList.add('is-only');
    return li;
  }));
  hits.hidden = !total;
}

function apply() {
  const terms = termsFor(query);
  cards.forEach(c => { c.hidden = !((!role || c.dataset.role === role) && (!query || terms.some(term => matchesAll(c.dataset.s, term)))); });
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
