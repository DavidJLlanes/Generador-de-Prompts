import { formatText } from './text.js';
import { sdSize } from './stable-diffusion.js';

/**
 * Flux: modelo de lenguaje natural sin prompt negativo (no lo admite). Se redacta como texto continuo,
 * sin la frase «Avoid» y con el tamaño sugerido en píxeles.
 */
export function formatFlux(c, state) {
  if (c.empty) return { id: 'flux', blocks: [], text: '' };
  const { text } = formatText({ ...c, negative: [] }, state);
  const { width, height } = sdSize(state.aspect);
  const size = `${width}×${height}`;
  return {
    id: 'flux',
    blocks: [{ title: 'Prompt para Flux', text }, { title: 'Tamaño sugerido', text: size }],
    text: `${text}\nSize: ${width}x${height}`,
  };
}

/** Tamaños que admite DALL·E 3 / ChatGPT (gpt-image): cuadrado, horizontal y vertical. */
export function dalleSize(aspect) {
  const m = /^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/.exec(aspect || '');
  const r = m ? parseFloat(m[1]) / parseFloat(m[2]) : 1;
  if (r >= 1.3) return '1792x1024';
  if (r <= 0.77) return '1024x1792';
  return '1024x1024';
}

/**
 * DALL·E 3 / gpt-image: descripción en lenguaje natural; los negativos se expresan como «Do not include»
 * (estos modelos no tienen campo negativo) y se sugiere el tamaño admitido más cercano.
 */
export function formatDalle(c, state) {
  if (c.empty) return { id: 'dalle', blocks: [], text: '' };
  const neg = c.negative.map(n => n.text);
  const { text: body } = formatText({ ...c, negative: [] }, { ...state, aspect: '' }); // la proporción va como tamaño, no en el texto
  const text = `${body}${neg.length ? ` Do not include: ${neg.join(', ')}.` : ''}`;
  const size = dalleSize(state.aspect);
  return {
    id: 'dalle',
    blocks: [{ title: 'Prompt para DALL·E / gpt-image', text }, { title: 'Tamaño admitido', text: size }],
    text: `${text}\nSize: ${size}`,
  };
}
