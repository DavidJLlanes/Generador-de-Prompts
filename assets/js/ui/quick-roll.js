import { sitePath } from '../core/site-path.js';
/**
 * PRUEBA RÁPIDA (portada) — prompt aleatorio con generador y proporción a elegir. Es un juego aparte: no toca
 * la selección del constructor salvo con «Abrir en el constructor». Extras: bloquear piezas y relanzar el
 * resto, «prompt del día» (misma semilla para todos), historial con favoritos y compartir por enlace.
 */
import { $ } from './dom.js';
import { store } from '../core/store.js';
import { loadDomains, domainMeta } from '../core/registry.js';
import { randomSelection } from '../core/random.js';
import { compose } from '../core/composer.js';
import { renderFormat } from '../core/formats/index.js';
import { ASPECTS, ASPECT_BY_ID } from '../../../data/aspects.js';
import { buildRandomCombination } from './slot-board.js';
import { shareUrl } from '../core/url-state.js';
import { loadJSON, saveJSON } from '../core/storage.js';
import { seededRng } from '../core/util.js';
import { icon } from './icons.js';
import { copyText } from './clipboard.js';
import { toast } from './toast.js';

const HISTORY_KEY = 'lv:v1:quick';
const HISTORY_MAX = 24;
const dayKey = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const dayLabel = () => new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
const pickOne = (arr, rng) => arr[Math.floor(rng() * arr.length)];
const make = (tag, cls, text) => { const el = document.createElement(tag); if (cls) el.className = cls; if (text != null) el.textContent = text; return el; };

function loadHistory() {
  const raw = loadJSON(HISTORY_KEY, []);
  return Array.isArray(raw) ? raw.filter(x => x && typeof x.text === 'string' && x.sel && typeof x.sel === 'object').slice(0, HISTORY_MAX) : [];
}
function saveHistory(list) {
  // Si hay demasiadas, se descartan las más antiguas que no sean favoritas.
  const out = [...list];
  while (out.length > HISTORY_MAX) { const i = out.map(x => !x.fav).lastIndexOf(true); out.splice(i === -1 ? out.length - 1 : i, 1); }
  saveJSON(HISTORY_KEY, out);
  return out;
}

export function mountQuickRoll(quick) {
  const genSel = $('[data-quick-gen]', quick);
  const aspectSel = $('[data-quick-aspect]', quick);
  const rollBtn = $('[data-quick-roll]', quick);
  const dailyBtn = $('[data-quick-daily]', quick);
  const copyBtn = $('[data-quick-copy]', quick);
  const openBtn = $('[data-quick-open]', quick);
  const shareBtn = $('[data-quick-share]', quick);
  const result = $('[data-quick-result]', quick);
  const textEl = $('[data-quick-text]', quick);
  const tagsEl = $('[data-quick-tags]', quick);
  const frame = $('[data-quick-frame]', quick);
  const ratioEl = $('[data-quick-ratio]', quick);
  const lockHint = $('[data-quick-lockhint]', quick);
  const histBox = $('[data-quick-history]', quick);
  const histList = $('[data-quick-history-list]', quick);
  const histCount = $('[data-quick-history-count]', quick);

  let last = null;
  let busy = false;
  const lockedDomains = new Set();
  let lockAspect = false;
  let history = loadHistory();

  function showFrame(aspectId) {
    const [a, b] = aspectId.split(':').map(Number);
    frame.style.setProperty('--r', a && b ? String(a / b) : '1.7778');
    ratioEl.textContent = aspectId || 'libre';
  }

  async function generate({ daily }) {
    const rng = daily ? seededRng(`daily-${dayKey()}`) : Math.random;
    const live = store.get();
    const genId = daily ? '' : genSel.value;
    const aspectChoice = daily ? 'random' : aspectSel.value;
    const base = { ...live, adult: daily ? false : live.adult, sel: {}, locks: {}, custom: '', aspect: '', format: 'text', detail: 'rich', boost: true, refPose: false, refCostume: false, attach: {} };

    // Piezas bloqueadas (solo en modo «combinación completa»): se conservan tal cual y se relanza el resto.
    const locked = daily || genId || !last ? [] : [...lockedDomains].filter(id => last.sel[id]);
    if (locked.length) {
      const loaded = await loadDomains(locked);
      for (const id of locked) {
        base.sel[id] = last.sel[id];
        base.locks[id] = Object.fromEntries(loaded[id].sections.map(s => [s.id, true]));
      }
    }

    for (let attempt = 0; attempt < 5; attempt++) {
      let sel;
      if (genId) {
        const d = (await loadDomains([genId]))[genId];
        sel = randomSelection([d], base, rng, 12);
      } else {
        sel = (await buildRandomCombination(base, rng)).sel;
      }
      for (const id of locked) sel[id] = last.sel[id];
      const aspect = lockAspect && last ? last.aspect : aspectChoice === 'random' ? pickOne(ASPECTS.filter(a => a.id), rng).id : aspectChoice;
      const state = { ...base, sel, aspect };
      const domains = await loadDomains([...new Set([...Object.keys(sel), 'photo'])]);
      const composed = compose(domains, state);
      if (composed.empty) continue;
      return { sel, aspect, text: renderFormat('text', composed, state).text, daily, ts: Date.now() };
    }
    return null;
  }

  function renderTags(out) {
    const ids = Object.keys(out.sel);
    const items = ids.map(id => ({ id, label: domainMeta(id)?.short })).filter(x => x.label);
    const canLock = !out.daily && !genSel.value;
    tagsEl.replaceChildren();
    if (out.daily) tagsEl.append(make('span', 'quick__tag quick__tag--daily', `Prompt del día · ${dayLabel()}`));
    for (const it of items) {
      if (!canLock) { tagsEl.append(make('span', 'quick__tag', it.label)); continue; }
      const on = lockedDomains.has(it.id);
      const b = make('button', `quick__tag quick__tag--btn${on ? ' is-locked' : ''}`);
      b.type = 'button';
      b.setAttribute('aria-pressed', String(on));
      b.title = on ? 'Desbloquear: se volverá a sortear' : 'Bloquear: se conserva al volver a generar';
      b.innerHTML = icon(on ? 'lock' : 'unlock', 12);
      b.append(' ' + it.label);
      b.addEventListener('click', () => { on ? lockedDomains.delete(it.id) : lockedDomains.add(it.id); renderTags(out); });
      tagsEl.append(b);
    }
    const aspectLabel = out.aspect ? (ASPECT_BY_ID[out.aspect]?.label || out.aspect).split(' · ')[0] : 'Sin proporción';
    if (canLock && out.aspect) {
      const b = make('button', `quick__tag quick__tag--btn${lockAspect ? ' is-locked' : ''}`);
      b.type = 'button';
      b.setAttribute('aria-pressed', String(lockAspect));
      b.title = lockAspect ? 'Desbloquear la proporción' : 'Bloquear la proporción al volver a generar';
      b.innerHTML = icon(lockAspect ? 'lock' : 'unlock', 12);
      b.append(' ' + aspectLabel);
      b.addEventListener('click', () => { lockAspect = !lockAspect; renderTags(out); });
      tagsEl.append(b);
    } else tagsEl.append(make('span', 'quick__tag', aspectLabel));
    lockHint.hidden = !canLock;
  }

  function show(out) {
    last = out;
    textEl.textContent = out.text;
    showFrame(out.aspect);
    renderTags(out);
    copyBtn.disabled = openBtn.disabled = shareBtn.disabled = false;
    result.classList.remove('is-fresh'); void result.offsetWidth; result.classList.add('is-fresh');
  }

  async function roll(daily = false) {
    if (busy) return;
    busy = true;
    rollBtn.classList.add('is-rolling');
    try {
      const out = await generate({ daily });
      if (!out) { toast('No salió nada con esa combinación. Prueba otra vez o elige otro generador.', { tone: 'warn' }); return; }
      show(out);
      history = saveHistory([{ ...out, fav: false }, ...history.filter(x => x.text !== out.text)]);
      renderHistory();
    } catch (err) {
      console.error(err);
      toast('No se pudo generar el prompt', { tone: 'warn' });
    } finally {
      busy = false;
      setTimeout(() => rollBtn.classList.remove('is-rolling'), 600);
    }
  }

  const linkOf = out => shareUrl({ sel: out.sel, detail: 'rich', boost: true, aspect: out.aspect, custom: '', attach: {} });

  function renderHistory() {
    histBox.hidden = !history.length;
    histCount.textContent = String(history.length);
    histList.replaceChildren(...history.map((it, i) => {
      const li = make('li', `quick__hist-item${it.fav ? ' is-fav' : ''}`);
      const snippet = make('button', 'quick__hist-text', it.text.slice(0, 110) + (it.text.length > 110 ? '…' : ''));
      snippet.type = 'button';
      snippet.title = 'Ver este prompt';
      snippet.addEventListener('click', () => { show(it); window.scrollTo({ top: quick.getBoundingClientRect().top + scrollY - 80, behavior: 'smooth' }); });
      const fav = make('button', 'icon-btn quick__fav');
      fav.type = 'button';
      fav.setAttribute('aria-pressed', String(!!it.fav));
      fav.setAttribute('aria-label', it.fav ? 'Quitar de favoritos' : 'Marcar como favorito');
      fav.title = fav.getAttribute('aria-label');
      fav.innerHTML = icon('bookmark', 16);
      fav.addEventListener('click', () => { history[i] = { ...it, fav: !it.fav }; history = saveHistory(history); renderHistory(); });
      const copy = make('button', 'icon-btn');
      copy.type = 'button';
      copy.setAttribute('aria-label', 'Copiar este prompt');
      copy.title = 'Copiar';
      copy.innerHTML = icon('copy', 16);
      copy.addEventListener('click', () => copyText(it.text, 'Prompt copiado'));
      li.append(snippet, fav, copy);
      return li;
    }));
  }

  rollBtn.addEventListener('click', () => roll(false));
  dailyBtn.addEventListener('click', () => roll(true));
  copyBtn.addEventListener('click', () => { if (last) copyText(last.text, 'Prompt copiado'); });
  openBtn.addEventListener('click', () => {
    if (!last) return;
    store.replaceSelection(last.sel);
    store.set({ aspect: last.aspect, attach: {} });
    location.href = sitePath('/constructor/');
  });
  shareBtn.addEventListener('click', async () => {
    if (!last) return;
    const url = linkOf(last);
    if (navigator.share) {
      try { await navigator.share({ title: 'Generador de Prompts', text: last.text.slice(0, 140) + '…', url }); return; }
      catch (e) { if (e?.name === 'AbortError') return; }
    }
    copyText(url, 'Enlace copiado: quien lo abra verá este prompt en el constructor');
  });
  genSel.addEventListener('change', () => roll(false));
  aspectSel.addEventListener('change', () => { if (last) roll(false); });
  renderHistory();

  // Primer prompt automático cuando la sección entra en pantalla (no se descargan datos antes de hacer falta).
  if ('IntersectionObserver' in window) {
    // Solo cuando ya se ve de verdad (no antes): evita bajar cientos de KB de datos a quien no llega a esta sección.
    const io = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) { io.disconnect(); roll(false); } }, { threshold: 0.3 });
    io.observe(quick);
  } else roll(false);
}
