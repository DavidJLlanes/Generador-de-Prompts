import test from 'node:test';
import assert from 'node:assert/strict';
import { loadAllDomains } from '../scripts/lib/domains.mjs';
import { compose } from '../assets/js/core/composer.js';
import { renderFormat } from '../assets/js/core/formats/index.js';
import { encodeState, decodeState } from '../assets/js/core/url-state.js';

const domains = Object.fromEntries((await loadAllDomains()).map(x => [x.domain.id, x.domain]));
const firstOpt = (d, s) => { const sec = domains[d].sections.find(x => x.id === s); return sec.options[0]; };
// Primer generador de atributos cuya primera opción sobrevive a las exclusiones junto a Mujer y Hombre.
let attrDomain, attrSec;
outer: for (const d of Object.values(domains).filter(x => x.role === 'attribute')) {
  for (const s of d.sections.filter(x => x.polarity !== 'negative' && x.options.length)) {
    const sel = { woman: { edad: [firstOpt('woman', 'edad').id] }, man: { edad: [firstOpt('man', 'edad').id] }, [d.id]: { [s.id]: [s.options[0].id] } };
    if (compose(domains, { v: 1, sel, locks: {}, detail: 'rich', boost: false, attach: {} }).parts.some(p => p.slot === 'attribute')) { attrDomain = d; attrSec = s; break outer; }
  }
}
assert.ok(attrDomain, 'hay algún generador de atributos utilizable');

function state(attach = {}) {
  return {
    v: 1, locks: {}, detail: 'rich', boost: false, aspect: '', format: 'text', adult: false, attach,
    sel: {
      woman: { edad: [firstOpt('woman', 'edad').id] },
      man: { edad: [firstOpt('man', 'edad').id] },
      [attrDomain.id]: { [attrSec.id]: [attrSec.options[0].id] },
    },
  };
}

test('con dos sujetos, los atributos van al primero por defecto y al elegido si se asigna', () => {
  const attrText = attrSec.options[0].en;
  const c1 = compose(domains, state());
  assert.equal(c1.subjects.length, 2);
  const p1 = c1.parts.find(p => p.slot === 'attribute');
  assert.equal(p1.owner, c1.subjects[0].lead);
  const c2 = compose(domains, state({ [attrDomain.id]: c1.subjects[1].lead }));
  assert.equal(c2.parts.find(p => p.slot === 'attribute').owner, c1.subjects[1].lead);
  // El texto del atributo aparece dentro de la frase del segundo sujeto, no de la del primero.
  const s2 = state({ [attrDomain.id]: c1.subjects[1].lead });
  const text = renderFormat('text', compose(domains, s2), s2).text;
  const opener = text.split(' together with ');
  assert.ok(opener.length === 2);
  assert.ok(!opener[0].toLowerCase().includes(attrText.toLowerCase()) || attrText.length < 4, 'el atributo no debe quedar en el primer sujeto');
});

test('formato natural: una línea de atributos por sujeto', () => {
  const s = state();
  const c = compose(domains, s);
  const text = renderFormat('natural', c, s).text;
  assert.match(text, new RegExp(`Details \\(${c.subjects[0].lead}\\)`));
});

test('una asignación inválida cae al primer sujeto', () => {
  const c = compose(domains, state({ [attrDomain.id]: 'a unicorn' }));
  assert.equal(c.parts.find(p => p.slot === 'attribute').owner, c.subjects[0].lead);
});

test('el enlace compartido conserva la asignación', () => {
  const s = state({ [attrDomain.id]: 'a man' });
  assert.deepEqual(decodeState(encodeState(s)).attach, { [attrDomain.id]: 'a man' });
});
