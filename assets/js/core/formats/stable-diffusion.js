import { clamp } from '../util.js';
import { orderParts } from '../tokens.js';
import { mediumOf } from '../lint.js';

const BASE_NEGATIVE = 'lowres, blurry, deformed, bad anatomy, extra limbs, watermark, text, signature';
const QUALITY_TAGS = 'masterpiece, best quality, ultra detailed, sharp focus';
/** Si el sujeto es una persona, se refuerzan los fallos típicos de manos y rostro. */
const HUMAN_NEGATIVE = 'bad hands, extra fingers, mutated hands, poorly drawn face, cross-eyed';
/** Lo contrario del medio elegido: con una foto se evita lo dibujado y al revés. */
const OPPOSITE = { photo: 'cartoon, illustration, painting, 3d render, cgi', drawn: 'photograph, photorealistic, realistic photo' };

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

const isPerson = c => (c.subjects || []).some(s => /\b(woman|man|girl|boy|person|character)\b/i.test(s.lead || ''));

/**
 * Negativo coherente con el prompt: lo que haya elegido el usuario (o el básico), más lo contrario del medio
 * (con una foto, «cartoon, illustration…») y los fallos típicos de manos y rostro si el sujeto es una persona.
 * Sin términos repetidos.
 */
export function sdNegative(c) {
  const chosen = c.negative.length ? c.negative.map(n => n.text) : [BASE_NEGATIVE];
  const extra = [OPPOSITE[mediumOf(c)] || '', isPerson(c) ? HUMAN_NEGATIVE : ''];
  const seen = new Set();
  return [...chosen, ...extra].join(', ').split(',').map(t => t.trim()).filter(t => t && !seen.has(t.toLowerCase()) && seen.add(t.toLowerCase())).join(', ');
}

/** Piezas del prompt positivo, en su orden final (con «Estilo y escena primero», si está activo). */
export function sdPieces(c, state) {
  return [...(state.boost ? [{ text: QUALITY_TAGS }] : []), ...orderParts(c.parts, state.priority).map(p => ({ text: p.short, part: p }))];
}

/**
 * Stable Diffusion / Flux / ComfyUI: prompt positivo y negativo por separado.
 * Usa siempre las etiquetas cortas (`en`): los modelos CLIP admiten pocos tokens.
 */
export function formatSD(c, state) {
  if (c.empty) return { id: 'sd', blocks: [], text: '' };
  const pieces = sdPieces(c, state);
  const positive = pieces.map(p => p.text).filter(Boolean).join(', ');
  const negative = sdNegative(c);
  const { width, height } = sdSize(state.aspect);
  const size = `${width}×${height}`;
  const blocks = [
    { title: 'Prompt positivo', text: positive },
    { title: 'Prompt negativo', text: negative },
    { title: 'Tamaño sugerido', text: size },
  ];
  const text = `Positive prompt: ${positive}\nNegative prompt: ${negative}\nSize: ${width}x${height}`;
  return { id: 'sd', blocks, text, pieces, budgetText: positive };
}
