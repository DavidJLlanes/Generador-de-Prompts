import { toSentences, withArticle, sentenceItem, isLong } from '../util.js';
import { aspectNote } from '../../../../data/aspects.js';

/** Conectores de las ranuras que describen dónde y con qué ambiente: sin ellos el escenario se leería como un rasgo más. */
const CONNECTOR = { setting: 'set in ', atmosphere: 'with ' };

/** Piezas → elementos de frase; la primera pieza corta de «escenario» y «atmósfera» lleva su conector. */
function itemsOf(parts) {
  const done = new Set();
  return parts.map(p => {
    const item = sentenceItem(p);
    const conn = CONNECTOR[p.slot];
    if (!conn || p.custom || done.has(p.slot) || isLong(item.t)) return item;
    done.add(p.slot);
    return { ...item, t: conn + item.t };
  });
}

/**
 * Con varios sujetos (Mujer + Hombre, Mujer + Coches) cada uno abre su propia frase nominal
 * («a woman in her 20s, long wavy hair together with a man in his 40s, …») en lugar de fundirlos en una sola.
 * @returns {{opener: string, rest: object[]}}
 */
function openerOf(c) {
  const subs = c.subjects || [];
  if (subs.length < 2) {
    const parts = c.merged ? c.parts.filter(p => p !== c.merged) : c.parts;
    return { opener: c.lead ? `Create the image of ${c.merged ? withArticle(c.merged.text) : c.lead}` : 'Create a highly detailed, high-quality image', rest: parts };
  }
  const used = new Set();
  const phrases = subs.map(s => {
    const own = c.parts.filter(p => p !== s.merged && sentenceItem(p).phrase
      && ((p.slot === 'subject' && s.domains.includes(p.domain)) || (p.slot === 'attribute' && p.owner === s.lead)));
    if (s.merged) used.add(s.merged);
    own.forEach(p => used.add(p));
    return [s.merged ? withArticle(s.merged.text) : s.lead, ...own.map(p => p.text)].join(', ');
  });
  return { opener: `Create the image of ${phrases.join(' together with ')}`, rest: c.parts.filter(p => !used.has(p)) };
}

/** Formato genérico: texto continuo en inglés, válido para cualquier generador de imágenes. */
export function formatText(c, state) {
  if (c.empty) return { id: 'text', blocks: [], text: '' };
  const { opener, rest } = openerOf(c);
  // Sin sujeto con «lead», la frase inicial va sola y el contenido arranca en la oración siguiente.
  const sentences = c.lead
    ? toSentences(itemsOf(rest), opener)
    : [opener + '.', ...toSentences(itemsOf(rest))];
  const note = state.detail !== 'short' ? aspectNote(state.aspect) : '';
  if (note) sentences.push(note);
  for (const r of c.refs || []) sentences.push(r);
  if (c.negative.length) sentences.push(`Avoid: ${c.negative.map(n => n.text).join(', ')}.`);
  if (state.aspect) sentences.push(`Aspect ratio "${state.aspect}".`);
  const text = sentences.join(' ');
  return { id: 'text', blocks: [{ title: 'Prompt', text }], text };
}
