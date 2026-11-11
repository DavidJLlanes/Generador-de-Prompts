import { toSentences, sentenceItem, endSentence } from '../util.js';
import { SLOT_BY_ID } from '../../../../data/taxonomy.js';
import { aspectNote } from '../../../../data/aspects.js';

/** Redacción en lenguaje natural, organizada por bloques: pensada para ChatGPT, Gemini y similares. */
export function formatNatural(c, state) {
  if (c.empty) return { id: 'natural', blocks: [], text: '' };
  const lines = [`Create a highly detailed, high-quality image${c.lead ? ` of ${c.lead}` : ''}.`];
  for (const s of c.slots) {
    const parts = s.parts.filter(p => !p.custom); // el texto libre del usuario va aparte
    if (parts.length) lines.push(`${SLOT_BY_ID[s.slot].en}: ${toSentences(parts.map(sentenceItem)).join(' ')}`);
  }
  const custom = c.parts.find(p => p.custom);
  if (custom) lines.push(`Additional details: ${endSentence(custom.text)}`);
  const note = state.detail !== 'short' ? aspectNote(state.aspect) : '';
  if (note) lines.push(`Format: ${note}`);
  if ((c.refs || []).length) lines.push(`Reference images: ${c.refs.join(' ')}`);
  if (c.negative.length) lines.push(`Avoid: ${c.negative.map(n => n.text).join(', ')}.`);
  if (state.aspect) lines.push(`Aspect ratio: ${state.aspect}.`);
  const text = lines.join('\n');
  return { id: 'natural', blocks: [{ title: 'Prompt', text }], text };
}
