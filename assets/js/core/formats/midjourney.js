/** Midjourney: descripción corta separada por comas + parámetros `--ar` y `--no` al final. */

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

/** Usa siempre las etiquetas cortas (`en`): Midjourney rinde mejor con descripciones concisas. */
export function formatMidjourney(c, state) {
  if (c.empty) return { id: 'midjourney', blocks: [], text: '' };
  const body = [c.lead, ...c.parts.map(p => p.short)].filter(Boolean).join(', ');
  const ar = mjRatio(state.aspect);
  const no = c.negative.length ? c.negative.map(n => n.text).join(', ') : '';
  const text = `${body}${ar ? ` --ar ${ar}` : ''}${no ? ` --no ${no}` : ''}`;
  return { id: 'midjourney', blocks: [{ title: 'Prompt para Midjourney', text }], text };
}
