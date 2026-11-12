/**
 * EXCLUSIONES entre opciones (puro, sin DOM). Reglas y etiquetas: data/exclusions.js y data/tag-index.js.
 *
 *  · reasonBlocked(sel, d, s, o)  → texto si esa opción no puede elegirse con la selección actual, o null.
 *  · blockedChecker(sel)          → versión rápida para comprobar muchas opciones de una vez (la usa la interfaz).
 *  · enforce(sel)                 → selección sin los pares incompatibles (enlaces compartidos, aleatorio, guardados).
 *
 * PUERTA DE EDAD: el contenido `adult-only` solo está disponible tras confirmar ser mayor de 18 años
 * (`adult: true`, preferencia del usuario). Sin confirmar, queda bloqueado y se descarta de cualquier selección.
 *
 * Una opción bloqueada no es una opción que «falla»: es una opción que no se puede elegir mientras haya algo
 * incompatible elegido en OTRA sección (elegir de nuevo dentro de la misma sección sigue sustituyendo).
 */
import { RULES } from '../../../data/exclusions.js';
import TAG_INDEX from '../../../data/tag-index.js';
import { pruneFamilies } from './families.js';

const TAGS = new Map(Object.entries(TAG_INDEX).map(([t, keys]) => [t, new Set(keys)]));
const kOf = (d, s, o) => `${d}/${s}/${o}`;
export const hasTag = (d, s, o, tag) => !!TAGS.get(tag)?.has(kOf(d, s, o));

export const GATE_WHY = 'Contenido para mayores de 18 años: confirma tu edad en el aviso de esta página para verlo.';
/** Generadores que tienen alguna opción para adultos (para mostrar el aviso). */
export const ADULT_DOMAINS = new Set([...(TAGS.get('adult-only') || [])].map(k => k.split('/')[0]));

function sideMatches(side, d, s, o) {
  if (side.domains && side.domains.includes(d)) return true;
  return !!side.tags && side.tags.some(t => hasTag(d, s, o, t));
}

/** Opciones elegidas (d, s, o) de una selección. */
function* selected(sel) {
  for (const [d, secs] of Object.entries(sel || {})) for (const [s, ids] of Object.entries(secs || {})) for (const o of ids) yield [d, s, o];
}

/** Para cada regla y lado, lista las opciones elegidas que casan con él. */
function presence(sel) {
  const list = [...selected(sel)];
  return RULES.map(r => ({ a: list.filter(([d, s, o]) => sideMatches(r.a, d, s, o)), b: list.filter(([d, s, o]) => sideMatches(r.b, d, s, o)) }));
}

/** Devuelve una función (d, s, o) → motivo | null para la selección dada. */
export function blockedChecker(sel, { adult = true } = {}) {
  const pres = presence(sel);
  return (d, s, o) => {
    if (!adult && hasTag(d, s, o, 'adult-only')) return GATE_WHY;
    for (let i = 0; i < RULES.length; i++) {
      const r = RULES[i];
      // lado A: se bloquea si hay algo de B elegido en otra sección
      if (sideMatches(r.a, d, s, o) && pres[i].b.some(([d2, s2]) => d2 !== d || s2 !== s)) return r.whyA;
      if (sideMatches(r.b, d, s, o) && pres[i].a.some(([d2, s2]) => d2 !== d || s2 !== s)) return r.whyB;
    }
    return null;
  };
}

export const reasonBlocked = (sel, d, s, o, opts) => blockedChecker(sel, opts)(d, s, o);

/**
 * Quita de la selección lo que choca según las reglas. Devuelve { sel, removed } sin modificar la original.
 * Las reglas se aplican en orden y cada una descarta el lado que indica `drop` (en las de seguridad, el contenido adulto).
 */
export function enforce(sel, { adult = true } = {}) {
  const removed = [];
  let cur = sel;
  if (!adult) { // sin confirmar la mayoría de edad no entra nada `adult-only`
    const next = {};
    for (const [d, secs] of Object.entries(cur)) for (const [s, ids] of Object.entries(secs)) {
      const keep = ids.filter(o => !hasTag(d, s, o, 'adult-only'));
      ids.filter(o => hasTag(d, s, o, 'adult-only')).forEach(o => removed.push({ domain: d, section: s, option: o, rule: 'puerta-de-edad' }));
      if (keep.length) (next[d] ||= {})[s] = keep;
    }
    cur = next;
  }
  for (const r of RULES) {
    const list = [...selected(cur)];
    const A = list.filter(([d, s, o]) => sideMatches(r.a, d, s, o));
    const B = list.filter(([d, s, o]) => sideMatches(r.b, d, s, o));
    // choque solo si hay elegidos en ambos lados y en secciones distintas
    const clash = A.some(([d, s]) => B.some(([d2, s2]) => d !== d2 || s !== s2));
    if (!clash) continue;
    const drop = r.drop === 'a' ? A : B;
    const kill = new Set(drop.map(x => x.join('\u0000')));
    const next = {};
    for (const [d, secs] of Object.entries(cur)) for (const [s, ids] of Object.entries(secs)) {
      const keep = ids.filter(o => !kill.has([d, s, o].join('\u0000')));
      if (keep.length) (next[d] ||= {})[s] = keep;
    }
    drop.forEach(([d, s, o]) => removed.push({ domain: d, section: s, option: o, rule: r.id }));
    cur = next;
  }
  // Un concepto, una elección: de cada familia de secciones (data/families.js) sobrevive la primera.
  const fam = pruneFamilies(cur);
  cur = fam.sel;
  removed.push(...fam.removed);
  return { sel: cur, removed };
}

export const RULE_LIST = RULES;
