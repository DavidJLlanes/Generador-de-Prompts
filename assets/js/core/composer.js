/**
 * COMPOSITOR — convierte la selección (de uno o varios dominios) en un prompt estructurado.
 *
 * Es una función pura: recibe los dominios cargados y el estado y devuelve las piezas ordenadas
 * por ranura (sujeto → atributos → acción → escenario → atmósfera → técnica). Los formatos de
 * salida (assets/js/core/formats/) se encargan únicamente de presentar esas piezas.
 *
 * Cruzar prompts = seleccionar en varios dominios a la vez. Si un dominio no tiene selección
 * simplemente no aporta nada: una «Mujer» sin escenario genera igualmente un prompt completo.
 */
import { SLOT_IDS } from '../../../data/taxonomy.js';
import { enforce } from './exclusions.js';

const SLOT_INDEX = Object.fromEntries(SLOT_IDS.map((id, i) => [id, i]));

function ruleMatches(rule, domain, bySection) {
  const ids = bySection[rule.when.section] || [];
  if (!ids.length) return false;
  if (rule.when.option) return ids.includes(rule.when.option);
  const sec = domain.sections.find(s => s.id === rule.when.section);
  return !!sec && ids.some(id => sec.options.find(o => o.id === id)?.tags?.includes(rule.when.tag));
}

/**
 * @param {Record<string, object>} domains  dominios ya cargados, por id
 * @param {object} state                     estado del store
 * @returns {{parts: object[], negative: object[], lead: string|null, merged: object|null, empty: boolean, slots: object[]}}
 */
export function compose(domains, state) {
  state = { ...state, sel: enforce(state.sel).sel }; // el prompt nunca lleva pares incompatibles (data/exclusions.js)
  const rich = state.detail !== 'short';
  const textOf = o => (rich && o.rich ? o.rich : o.en);
  const parts = [];
  const negative = [];

  for (const did of Object.keys(state.sel)) {
    const dom = domains[did];
    if (!dom) continue;
    const bySection = state.sel[did] || {};

    dom.sections.forEach((sec, si) => {
      const ids = bySection[sec.id];
      if (!ids || !ids.length) return;
      ids.forEach((oid, k) => {
        const opt = sec.options.find(o => o.id === oid);
        if (!opt) return; // id obsoleto tras editar los datos: se ignora
        if (sec.polarity === 'negative') {
          negative.push({ text: opt.en, domain: did, section: sec.id, option: opt.id });
          return;
        }
        const slot = sec.slot || dom.role;
        parts.push({ slot, domain: did, section: sec.id, option: opt.id, text: textOf(opt), short: opt.en, es: opt.es, key: [SLOT_INDEX[slot], dom.order, si, k] });
      });
    });

    for (const rule of dom.rules || []) {
      if (ruleMatches(rule, dom, bySection)) {
        parts.push({ slot: rule.add.slot, domain: did, section: '_rule', option: rule.id, text: rule.add.en, short: rule.add.en, es: 'Ajuste automático', key: [SLOT_INDEX[rule.add.slot], dom.order, 999, 0] });
      }
    }
  }

  // Texto libre del usuario: va al final de la ranura técnica y no se reordena ni se deduplica con las opciones.
  const custom = (state.custom || '').trim();
  if (custom) parts.push({ slot: 'technical', domain: '_custom', section: '_custom', option: 'custom', text: custom, short: custom, es: 'Texto libre', custom: true, key: [SLOT_INDEX.technical, 1e6, 0, 0] });

  // Acabado de máxima calidad (interruptor «Calidad máxima»): solo si no se ha elegido nada a mano.
  const photo = domains.photo;
  if (state.boost && photo && parts.length) {
    const chosen = state.sel.photo || {};
    const fin = photo.sections.find(s => s.id === 'finishing');
    if (fin && !(chosen.finishing || []).length) {
      const si = photo.sections.indexOf(fin);
      fin.options.forEach((o, k) => parts.push({ slot: 'technical', domain: 'photo', section: 'finishing', option: o.id, text: textOf(o), short: o.en, es: o.es, boost: true, key: [SLOT_INDEX.technical, photo.order, si, k] }));
    }
    const avoid = photo.sections.find(s => s.id === 'avoid');
    if (avoid && !(chosen.avoid || []).length) avoid.options.forEach(o => negative.push({ text: o.en, domain: 'photo', section: 'avoid', option: o.id, boost: true }));
  }

  // Orden estable por [ranura, orden de dominio, orden de sección, orden de elección].
  parts.sort((a, b) => a.key[0] - b.key[0] || a.key[1] - b.key[1] || a.key[2] - b.key[2] || a.key[3] - b.key[3]);

  // Sin textos repetidos.
  const seen = new Set();
  const unique = parts.filter(p => { const k = p.text.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });

  const leadPart = unique.find(p => domains[p.domain]?.role === 'subject' && domains[p.domain]?.lead);
  const lead = leadPart ? domains[leadPart.domain].lead : null;

  // Si la primera pieza del sujeto ya nombra al sujeto («woman in her late 20s»), se funde con la frase inicial.
  let merged = null;
  if (lead) {
    const noun = lead.replace(/^an?\s+/i, '').split(' ').pop();
    const nounRx = new RegExp(`\\b${noun}s?\\b`, 'i');
    // La primera pieza corta del sujeto que ya lo nombra (puede no ser la primera de todas: p. ej. tras una época).
    merged = unique.find(p => p.slot === 'subject' && p.text.length < 130 && nounRx.test(p.text)) || null;
  }

  const slots = SLOT_IDS.map(id => ({ slot: id, parts: unique.filter(p => p.slot === id) })).filter(s => s.parts.length);
  return { parts: unique, negative, lead, merged, empty: unique.length === 0, slots };
}
