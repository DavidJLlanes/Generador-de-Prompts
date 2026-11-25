/** Midjourney: descripción corta separada por comas + parámetros (`--ar`, versión, `--raw`, `--s`…) y `--no` al final. */
import { orderParts } from '../tokens.js';
import { mediumOf } from '../lint.js';

const gcd = (a, b) => (b ? gcd(b, a % b) : a);

/**
 * Midjourney espera proporciones enteras: «9:19.5» pasa a «18:39». Devuelve '' si no hay proporción.
 * @param {string} aspect  «ancho:alto», con decimales opcionales
 */
export function mjRatio(aspect) {
  const m = /^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/.exec(aspect || '');
  if (!m) return '';
  const scale = Math.max(m[1].split('.')[1]?.length || 0, m[2].split('.')[1]?.length || 0);
  const k = 10 ** scale;
  let w = Math.round(parseFloat(m[1]) * k), h = Math.round(parseFloat(m[2]) * k);
  const g = gcd(w, h);
  w /= g; h /= g;
  return `${w}:${h}`;
}

/** Versiones que se ofrecen ('' = no añadir `--v`: Midjourney usa la suya por defecto). */
export const MJ_VERSIONS = [['', 'Por defecto'], ['8.1', 'V8.1'], ['7', 'V7'], ['6.1', 'V6.1'], ['niji 6', 'Niji 6']];
/** Rangos de los parámetros numéricos (documentación de Midjourney). */
export const MJ_RANGES = { stylize: [0, 1000], chaos: [0, 100], weird: [0, 3000] };
export const MJ_DEFAULT = Object.freeze({ v: '', stylize: null, chaos: null, weird: null, raw: false });

const intIn = (v, [lo, hi]) => {
  if (v === '' || v == null) return null;
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : null;
};

/** Ajustes de Midjourney limpios (valores fuera de rango se acotan; `null` = no añadir el parámetro). */
export function cleanMj(raw) {
  const r = raw && typeof raw === 'object' ? raw : {};
  return {
    v: MJ_VERSIONS.some(([id]) => id === r.v) ? r.v : '',
    stylize: intIn(r.stylize, MJ_RANGES.stylize),
    chaos: intIn(r.chaos, MJ_RANGES.chaos),
    weird: intIn(r.weird, MJ_RANGES.weird),
    raw: r.raw === true,
  };
}

/** Parámetros de los ajustes, en el orden en que se escriben. `--raw` en V6 se escribe `--style raw`. */
export function mjFlags(raw) {
  const mj = cleanMj(raw);
  const out = [];
  if (mj.v) out.push(mj.v.startsWith('niji') ? `--${mj.v}` : `--v ${mj.v}`);
  if (mj.raw) out.push(mj.v.startsWith('6') ? '--style raw' : '--raw');
  if (mj.stylize != null) out.push(`--s ${mj.stylize}`);
  if (mj.chaos != null) out.push(`--chaos ${mj.chaos}`);
  if (mj.weird != null) out.push(`--weird ${mj.weird}`);
  return out;
}

/** Lo contrario del medio elegido, para `--no`: con una foto se evita lo dibujado y al revés. */
const OPPOSITE = { photo: ['cartoon', 'illustration', 'painting'], drawn: ['photograph', 'photorealistic'] };

/** Piezas del cuerpo en el orden final (con «Estilo y escena primero», si está activo). */
export function mjPieces(c, state) {
  return [...(c.lead ? [{ text: c.lead }] : []), ...orderParts(c.parts, state.priority).map(p => ({ text: p.short, part: p }))];
}

/** Usa siempre las etiquetas cortas (`en`): Midjourney rinde mejor con descripciones concisas. */
export function formatMidjourney(c, state) {
  if (c.empty) return { id: 'midjourney', blocks: [], text: '' };
  const pieces = mjPieces(c, state);
  const body = pieces.map(p => p.text).filter(Boolean).join(', ');
  const ar = mjRatio(state.aspect);
  const chosen = c.negative.map(n => n.text);
  const no = [...new Set([...chosen, ...(OPPOSITE[mediumOf(c)] || [])])].join(', ');
  const flags = mjFlags(state.mj);
  const text = `${body}${ar ? ` --ar ${ar}` : ''}${flags.length ? ` ${flags.join(' ')}` : ''}${no ? ` --no ${no}` : ''}`;
  return { id: 'midjourney', blocks: [{ title: 'Prompt para Midjourney', text }], text, pieces, budgetText: body };
}
