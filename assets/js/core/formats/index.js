import { formatText } from './text.js';
import { formatNatural } from './natural.js';
import { formatSD } from './stable-diffusion.js';
import { formatIdeogram } from './ideogram.js';
import { formatMidjourney } from './midjourney.js';
import { formatFlux, formatDalle } from './flux-dalle.js';

/**
 * Catálogo de formatos de salida. Añadir uno nuevo = crear su módulo y registrarlo aquí:
 * la interfaz (pestañas del panel «Mi prompt») se construye a partir de esta lista.
 */
export const FORMATS = [
  { id: 'text', label: 'Texto', hint: 'Una sola línea en inglés, válida para cualquier generador de imágenes.', run: formatText },
  { id: 'natural', label: 'ChatGPT / Gemini', hint: 'Redacción en lenguaje natural, por bloques.', run: formatNatural },
  { id: 'sd', label: 'Stable Diffusion', hint: 'Prompt positivo y negativo por separado, con tamaño sugerido.', run: formatSD },
  { id: 'flux', label: 'Flux', hint: 'Texto continuo sin prompt negativo (Flux no lo admite), con tamaño sugerido.', run: formatFlux },
  { id: 'dalle', label: 'DALL·E / gpt-image', hint: 'Descripción natural; los negativos pasan a «Do not include» y se sugiere un tamaño admitido.', run: formatDalle },
  { id: 'ideogram', label: 'Ideogram (JSON)', hint: 'JSON estructurado con descripción, estilo y composición.', run: formatIdeogram },
  { id: 'midjourney', label: 'Midjourney', hint: 'Descripción corta con los parámetros --ar y --no al final.', run: formatMidjourney },
];

export const FORMAT_BY_ID = Object.fromEntries(FORMATS.map(f => [f.id, f]));

export function renderFormat(id, composed, state) {
  return (FORMAT_BY_ID[id] || FORMATS[0]).run(composed, state);
}
