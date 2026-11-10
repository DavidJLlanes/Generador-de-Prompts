import { clamp } from '../util.js';

const BASE_NEGATIVE = 'lowres, blurry, deformed, bad anatomy, extra limbs, watermark, text, signature';
const QUALITY_TAGS = 'masterpiece, best quality, ultra detailed, sharp focus';

/** Tamaño sugerido (≈1 megapíxel, múltiplos de 64) para una proporción «a:b». */
export function sdSize(aspect) {
  const m = /^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/.exec(aspect || '');
  const r = m ? parseFloat(m[1]) / parseFloat(m[2]) : 1;
  const area = 1024 * 1024;
  const snap = v => clamp(Math.round(v / 64) * 64, 512, 2048);
  const w = snap(Math.sqrt(area * r));
  const h = snap(area / w);
  return { width: w, height: h };
}

/**
 * Stable Diffusion / Flux / ComfyUI: prompt positivo y negativo por separado.
 * Usa siempre las etiquetas cortas (`en`): los modelos CLIP admiten pocos tokens.
 */
export function formatSD(c, state) {
  if (c.empty) return { id: 'sd', blocks: [], text: '' };
  const positive = [state.boost ? QUALITY_TAGS : '', ...c.parts.map(p => p.short)].filter(Boolean).join(', ');
  const negative = c.negative.length ? c.negative.map(n => n.text).join(', ') : BASE_NEGATIVE;
  const { width, height } = sdSize(state.aspect);
  const size = `${width}×${height}`;
  const blocks = [
    { title: 'Prompt positivo', text: positive },
    { title: 'Prompt negativo', text: negative },
    { title: 'Tamaño sugerido', text: size },
  ];
  const text = `Positive prompt: ${positive}\nNegative prompt: ${negative}\nSize: ${width}x${height}`;
  return { id: 'sd', blocks, text };
}
