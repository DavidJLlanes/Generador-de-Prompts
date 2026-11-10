import { toSentences, withArticle, sentenceItem } from '../util.js';
import { aspectNote } from '../../../../data/aspects.js';

/** Formato genérico: texto continuo en inglés, válido para cualquier generador de imágenes. */
export function formatText(c, state) {
  if (c.empty) return { id: 'text', blocks: [], text: '' };
  const parts = c.merged ? c.parts.filter(p => p !== c.merged) : c.parts;
  const opener = c.lead
    ? `Create the image of ${c.merged ? withArticle(c.merged.text) : c.lead}`
    : 'Create a highly detailed, high-quality image';
  // Sin sujeto con «lead», la frase inicial va sola y el contenido arranca en la oración siguiente.
  const sentences = c.lead
    ? toSentences(parts.map(sentenceItem), opener)
    : [opener + '.', ...toSentences(parts.map(sentenceItem))];
  const note = state.detail !== 'short' ? aspectNote(state.aspect) : '';
  if (note) sentences.push(note);
  if (c.negative.length) sentences.push(`Avoid: ${c.negative.map(n => n.text).join(', ')}.`);
  if (state.aspect) sentences.push(`Aspect ratio "${state.aspect}".`);
  const text = sentences.join(' ');
  return { id: 'text', blocks: [{ title: 'Prompt', text }], text };
}
