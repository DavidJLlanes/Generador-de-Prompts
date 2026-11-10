/**
 * TAXONOMÍA — las «ranuras» (slots) en las que se ordena un prompt cruzado.
 *
 * Cada dominio declara un `role` que coincide con el id de una ranura. Un prompt combinado
 * se compone siempre en este orden, con independencia del orden en que el usuario elija:
 *   sujeto → atributos → pose/acción → escenario → atmósfera → técnica y estilo
 *
 * Una sección concreta puede salirse del rol de su dominio con `slot` (p. ej. un «Estilo»
 * dentro de un dominio de escenarios va a la ranura `technical`).
 *
 * `es` es lo que ve el usuario (interfaz en español); `en` solo se usa en los formatos de salida.
 */
export const SLOTS = [
  { id: 'subject', es: 'Sujeto', plural: 'Sujetos', hint: 'Quién o qué protagoniza la imagen.', en: 'Subject' },
  { id: 'attribute', es: 'Atributos', plural: 'Atributos', hint: 'Rostro, peinado, tatuajes, accesorios o anatomía del sujeto.', en: 'Details' },
  { id: 'action', es: 'Pose y acción', plural: 'Poses', hint: 'Postura y lenguaje corporal.', en: 'Pose and action' },
  { id: 'setting', es: 'Escenario', plural: 'Escenarios', hint: 'Dónde ocurre: paisajes, interiores, espacio o localizaciones.', en: 'Setting' },
  { id: 'atmosphere', es: 'Atmósfera', plural: 'Atmósferas', hint: 'Clima, efectos visuales y magia.', en: 'Atmosphere' },
  { id: 'technical', es: 'Técnica y estilo', plural: 'Técnica', hint: 'Cámara, luz, color, estilo y acabado de calidad.', en: 'Style and technique' },
];

export const SLOT_IDS = SLOTS.map(s => s.id);
export const SLOT_BY_ID = Object.fromEntries(SLOTS.map(s => [s.id, s]));
