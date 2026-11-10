/**
 * PROPORCIONES (aspect ratio).
 * `label` va en español (interfaz). `kind` elige la nota de composición, en inglés, que se añade
 * al prompt (los prompts son siempre en inglés). `{r}` se sustituye por la proporción.
 */
export const ASPECT_NOTES = {
  square: 'Square format: balanced composition with the subject centered or on a third and even margins on all sides.',
  tall: 'Vertical format ({r}): composition built in height with the subject in the central third, breathing room above and below, and elements that guide the eye vertically.',
  phone: 'Vertical phone-screen format ({r}): main subject in the lower-middle third, with the upper third kept calmer and softly textured so the clock and widgets do not cover the subject, and the bottom strip free of critical detail because of the dock; the scene develops in height with layered depth.',
  landscape: 'Horizontal format ({r}): balanced landscape composition with the subject on a third and the horizon on the upper or lower third.',
  wide: 'Horizontal desktop format ({r}): panoramic composition with the main subject on a third (rule of thirds) and the opposite side calmer for desktop icons; horizon on the lower or upper third as the scene requires.',
  ultra: 'Ultra-wide format ({r}): panoramic composition that extends horizontally, with the subject in the center or on a third and secondary elements and atmosphere filling the edges; nothing essential near the borders, which must not be cropped.',
};

export const ASPECTS = [
  { id: '', label: 'Sin definir', kind: 'none', group: '' },
  { id: '1:1', label: '1:1 · Cuadrado', kind: 'square', group: 'Cuadrado' },
  { id: '4:5', label: '4:5 · Vertical Instagram', kind: 'tall', group: 'Vertical' },
  { id: '3:4', label: '3:4 · Retrato', kind: 'tall', group: 'Vertical' },
  { id: '2:3', label: '2:3 · Foto vertical', kind: 'tall', group: 'Vertical' },
  { id: '9:16', label: '9:16 · Móvil / stories', kind: 'phone', group: 'Móvil' },
  { id: '9:19.5', label: '9:19.5 · iPhone Pro Max', kind: 'phone', group: 'Móvil' },
  { id: '9:20', label: '9:20 · Móvil alto', kind: 'phone', group: 'Móvil' },
  { id: '5:4', label: '5:4 · Clásico', kind: 'landscape', group: 'Horizontal' },
  { id: '4:3', label: '4:3 · Pantalla clásica', kind: 'landscape', group: 'Horizontal' },
  { id: '3:2', label: '3:2 · Foto horizontal', kind: 'landscape', group: 'Horizontal' },
  { id: '16:10', label: '16:10 · Escritorio', kind: 'wide', group: 'Horizontal' },
  { id: '16:9', label: '16:9 · Panorámico', kind: 'wide', group: 'Horizontal' },
  { id: '21:9', label: '21:9 · Ultrawide', kind: 'ultra', group: 'Ultraancho' },
  { id: '32:9', label: '32:9 · Super ultrawide', kind: 'ultra', group: 'Ultraancho' },
];

export const ASPECT_BY_ID = Object.fromEntries(ASPECTS.map(a => [a.id, a]));

/** Nota de composición en inglés para una proporción (cadena vacía si no hay). */
export function aspectNote(id) {
  const a = ASPECT_BY_ID[id];
  if (!a || a.kind === 'none') return '';
  return (ASPECT_NOTES[a.kind] || '').replace('{r}', id);
}
