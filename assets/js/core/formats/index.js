import { formatText } from './text.js';
import { formatNatural } from './natural.js';
import { formatSD } from './stable-diffusion.js';
import { formatIdeogram } from './ideogram.js';
import { formatMidjourney } from './midjourney.js';

/**
 * Catálogo de formatos de salida. Añadir uno nuevo = crear su módulo y registrarlo aquí:
 * la interfaz (pestañas del panel «Mi prompt») se construye a partir de esta lista.
 */
export const FORMATS = [
  { id: 'text', label: 'Texto', hint: 'Una sola línea en inglés, válida para cualquier generador de imágenes.', run: formatText },
  { id: 'natural', label: 'ChatGPT / Gemini', hint: 'Redacción en lenguaje natural, por bloques.', run: formatNatural },
  { id: 'sd', label: 'Stable Diffusion / Flux', hint: 'Prompt positivo y negativo por separado, con tamaño sugerido.', run: formatSD },
  { id: 'ideogram', label: 'Ideogram (JSON)', hint: 'JSON estructurado con descripción, estilo y composición.', run: formatIdeogram },
  { id: 'midjourney', label: 'Midjourney', hint: 'Descripción corta con los parámetros --ar y --no al final.', run: formatMidjourney },
];

export const FORMAT_BY_ID = Object.fromEntries(FORMATS.map(f => [f.id, f]));

export function renderFormat(id, composed, state) {
  return (FORMAT_BY_ID[id] || FORMATS[0]).run(composed, state);
}
