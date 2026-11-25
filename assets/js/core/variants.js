/**
 * VARIANTES A/B (puro, sin DOM): cambia UNA sección del prompt por otras opciones y devuelve las selecciones
 * resultantes, para compararlas lado a lado («¿qué luz funciona mejor?»). Respeta las exclusiones entre
 * generadores, la puerta de edad y los bloqueos de «Aleatorio».
 */
import { enforce, blockedChecker } from './exclusions.js';
import { SLOT_BY_ID } from '../../../data/taxonomy.js';

const MIN_OPTIONS = 3;

/** Secciones que se pueden variar: las de los generadores con selección. Primero las que ya tienen algo elegido. */
export function variableSections(domains, state) {
  const out = [];
  for (const did of Object.keys(state.sel || {})) {
    const dom = domains[did];
    if (!dom) continue;
    for (const sec of dom.sections) {
      if (sec.polarity === 'negative' || sec.options.length < MIN_OPTIONS) continue;
      const current = state.sel[did]?.[sec.id] || [];
      out.push({ domain: did, section: sec.id, title: sec.title, slot: sec.slot || dom.role, current, count: sec.options.length, domainTitle: dom.meta?.short || dom.meta?.title || did });
    }
  }
  return out.sort((a, b) => (b.current.length > 0) - (a.current.length > 0));
}

/** Sección que más sentido tiene variar por defecto: una de técnica o atmósfera ya elegida; si no, la primera elegida. */
export function defaultTarget(list) {
  const used = list.filter(s => s.current.length);
  return used.find(s => s.slot === 'technical') || used.find(s => s.slot === 'atmosphere') || used[0] || list[0] || null;
}

const shuffle = (arr, rng) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/**
 * @param {Record<string, object>} domains  dominios cargados
 * @param {object} state                    estado del store
 * @param {{domain: string, section: string}} target
 * @param {number} [n=4]
 * @returns {{option: string, es: string, en: string, sel: object}[]}  hasta `n` variantes con otra opción cada una
 *   (menos si no hay suficientes compatibles); `sel` es la selección completa de cada una.
 */
export function makeVariants(domains, state, target, n = 4, rng = Math.random) {
  const sec = domains[target.domain]?.sections.find(s => s.id === target.section);
  if (!sec) return [];
  const without = structuredClone(state.sel || {});
  if (without[target.domain]) { delete without[target.domain][target.section]; if (!Object.keys(without[target.domain]).length) delete without[target.domain]; }
  const blocked = blockedChecker(without, { adult: state.adult === true });
  const current = new Set(state.sel?.[target.domain]?.[target.section] || []);
  const pool = shuffle(sec.options.filter(o => !current.has(o.id) && !blocked(target.domain, sec.id, o.id)), rng);
  const out = [];
  for (const o of pool) {
    if (out.length >= n) break;
    const sel = structuredClone(without);
    (sel[target.domain] ||= {})[sec.id] = [o.id];
    const safe = enforce(sel, { adult: state.adult === true }).sel;
    if (!safe[target.domain]?.[sec.id]?.includes(o.id)) continue; // una regla descartó justo esta opción
    out.push({ option: o.id, es: o.es, en: o.en, sel: safe });
  }
  return out;
}

export const slotLabel = id => SLOT_BY_ID[id]?.es || id;
