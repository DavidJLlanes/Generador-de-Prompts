/**
 * Mapa de palabras de color (inglés) → hexadecimal, usado por el formato Ideogram para rellenar
 * las paletas de color a partir de lo que el usuario ha elegido.
 */
export const COLOR_HEX = {
  black: '#111111', jet: '#0E0E12', charcoal: '#2A2A2E', white: '#F5F5F5', ivory: '#F2EAD3', cream: '#EFE3C8',
  grey: '#8A8A8A', gray: '#8A8A8A', silver: '#C7CBD1', blonde: '#E6C68A', platinum: '#E8E2D0', brunette: '#5A3A22',
  brown: '#6B4226', chestnut: '#6E4B2A', auburn: '#7A3B2E', chocolate: '#3E2620', ginger: '#C25B2C', copper: '#B26B3A',
  crimson: '#8C1C2B', scarlet: '#B0202E', burgundy: '#5A1620', maroon: '#5A1F2A', red: '#B11226',
  pink: '#E89CB0', rose: '#D96A86', coral: '#E37B6A', peach: '#F0B49B', magenta: '#C0399F',
  purple: '#7A3FA0', violet: '#8B5CF6', lavender: '#B9A2E3', navy: '#1B2A4A', azure: '#3F7FD0', blue: '#2E5EAA',
  cyan: '#2BB6C4', turquoise: '#2EC4B6', teal: '#1F8A8A', emerald: '#1E9E63', olive: '#6B6B2E', green: '#2E8B57',
  lime: '#9BCB3C', golden: '#C9A227', gold: '#C9A227', amber: '#C8821E', orange: '#D2691E', yellow: '#E8C84C',
  beige: '#D9C6A5', tan: '#C49A6C', nude: '#E6C2A6', caramel: '#A9743B', bronze: '#9C6B3C',
  porcelain: '#F0D6C6', fair: '#EAC6AE', ebony: '#3B2A22',
};

const WORDS = Object.keys(COLOR_HEX);

/** Hexadecimales de las palabras de color que aparecen en un texto (sin repetir, en orden). */
export function hexesIn(text) {
  const t = String(text || '').toLowerCase();
  const out = [];
  for (const w of WORDS) if (new RegExp(`\\b${w}\\b`).test(t) && !out.includes(COLOR_HEX[w])) out.push(COLOR_HEX[w]);
  return out;
}

/** Entre `min` y `max` colores únicos, completando con `pad` si faltan. */
export function palette(texts, min, max, pad) {
  const out = [];
  texts.forEach(t => hexesIn(t).forEach(h => { if (!out.includes(h)) out.push(h); }));
  pad.forEach(h => { if (out.length < min && !out.includes(h)) out.push(h); });
  return out.slice(0, max);
}
