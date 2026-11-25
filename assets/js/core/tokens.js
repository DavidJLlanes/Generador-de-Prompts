/**
 * PRESUPUESTO DE TOKENS Y PRIORIDAD (puro, sin DOM).
 *
 * Los modelos con codificador CLIP (Stable Diffusion, SDXL…) leen como mucho 75 tokens por bloque: lo que se pasa
 * se corta o se procesa aparte según el programa, y las primeras palabras pesan más. Flux lee más (T5: 512 tokens
 * en dev, 256 en schnell) y Midjourney rinde mejor con prompts cortos. Aquí se estima cuánto ocupa el prompt y,
 * si no cabe, qué piezas quedarían fuera. El recuento es APROXIMADO (no lleva el vocabulario real del modelo).
 */

/** Orden con «Estilo y escena primero»: sujeto, técnica/estilo, escenario, acción, atributos y atmósfera. */
export const PRIORITY_SLOTS = ['subject', 'technical', 'setting', 'action', 'attribute', 'atmosphere'];

/** Piezas ordenadas por importancia (estable dentro de cada ranura). Sin `priority` devuelve el orden normal. */
export function orderParts(parts, priority) {
  if (!priority) return parts;
  const rank = p => { const i = PRIORITY_SLOTS.indexOf(p.slot); return i < 0 ? PRIORITY_SLOTS.length : i; };
  return parts.map((p, i) => [p, i]).sort((a, b) => rank(a[0]) - rank(b[0]) || a[1] - b[1]).map(x => x[0]);
}

/** Tokens aproximados de un texto: palabras cortas = 1, largas = ~1 cada 7 letras, cifras ~1 cada 3, cada signo = 1. */
export function estimateTokens(text) {
  const items = String(text || '').match(/[A-Za-z']+|\d+|[^\sA-Za-z\d]/g) || [];
  let n = 0;
  items.forEach((t, i) => {
    if (/^[A-Za-z']/.test(t)) n += t.length <= 8 ? 1 : Math.ceil(t.length / 7);
    else if (/^\d/.test(t)) n += Math.ceil(t.length / 3);
    else if (t === '-' && /[A-Za-z]$/.test(items[i - 1] || '') && /^[A-Za-z]/.test(items[i + 1] || '')) n += 0; // guion dentro de una palabra
    else n += 1;
  });
  return n;
}

/** Límites por formato. `limit`: lo que el modelo lee; `soft`: lo recomendable. Los formatos que no figuran no tienen aviso. */
export const BUDGETS = {
  sd: { limit: 75, label: 'Stable Diffusion', note: 'Los modelos CLIP leen 75 tokens por bloque; lo que pasa de ahí se corta o se procesa aparte según el programa.' },
  flux: { limit: 512, soft: 256, label: 'Flux', note: 'Flux dev lee hasta 512 tokens (schnell, 256).' },
  midjourney: { soft: 150, label: 'Midjourney', note: 'Midjourney rinde mejor con prompts de unos 30 a 150 tokens: más largo suele diluir el resultado.' },
};

/**
 * @param {string} formatId
 * @param {{text: string, budgetText?: string, pieces?: {text: string, part?: object}[]}} result  salida de un formato
 * @returns {null | {tokens: number, limit: number|null, soft: number|null, level: 'ok'|'high'|'over', cut: object[], label: string, note: string}}
 *   `cut`: piezas (compuestas) que quedarían por encima del límite, en orden.
 */
export function budgetReport(formatId, result) {
  const b = BUDGETS[formatId];
  if (!b || !result?.text) return null;
  const tokens = estimateTokens(result.budgetText ?? result.text);
  const level = b.limit && tokens > b.limit ? 'over' : (b.soft && tokens > b.soft ? 'high' : 'ok');
  const cut = [];
  const edge = b.limit ?? b.soft;
  if (level !== 'ok' && edge && result.pieces) {
    let acc = 0;
    for (const piece of result.pieces) {
      acc += estimateTokens(piece.text) + 1; // +1: la coma que la separa de la siguiente
      if (acc > edge && piece.part) cut.push(piece.part);
    }
  }
  return { tokens, limit: b.limit ?? null, soft: b.soft ?? null, level, cut, label: b.label, note: b.note };
}
