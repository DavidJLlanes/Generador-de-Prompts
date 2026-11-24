import test from 'node:test';
import assert from 'node:assert/strict';
import { TEMPLATES } from '../data/templates.js';
import { ASPECT_BY_ID } from '../data/aspects.js';
import { loadAllDomains } from '../scripts/lib/domains.mjs';
import { compose } from '../assets/js/core/composer.js';
import { renderFormat } from '../assets/js/core/formats/index.js';
import { enforce } from '../assets/js/core/exclusions.js';

const domains = Object.fromEntries((await loadAllDomains()).map(x => [x.domain.id, x.domain]));

test('plantillas: ids únicos, título, descripción, etiquetas y proporción válida', () => {
  assert.ok(TEMPLATES.length >= 15);
  assert.equal(new Set(TEMPLATES.map(t => t.id)).size, TEMPLATES.length);
  for (const t of TEMPLATES) {
    assert.ok(t.title && t.desc && t.tags.length, t.id);
    assert.ok(ASPECT_BY_ID[t.aspect], `${t.id}: proporción ${t.aspect}`);
  }
});

test('plantillas: todas las opciones existen y componen un prompt sin conflictos', () => {
  for (const t of TEMPLATES) {
    for (const [d, secs] of Object.entries(t.sel)) for (const [s, ids] of Object.entries(secs)) {
      const sec = domains[d]?.sections.find(x => x.id === s);
      assert.ok(sec, `${t.id}: ${d}/${s}`);
      for (const id of ids) assert.ok(sec.options.some(o => o.id === id), `${t.id}: ${d}/${s}/${id}`);
    }
    assert.deepEqual(enforce(t.sel, { adult: false }).sel, t.sel, `${t.id}: las exclusiones quitarían algo`);
    const st = { v: 1, sel: t.sel, locks: {}, attach: {}, detail: 'rich', boost: true, aspect: t.aspect, format: 'text', adult: false };
    const text = renderFormat('text', compose(domains, st), st).text;
    assert.ok(text.length > 120 && text.endsWith(`Aspect ratio "${t.aspect}".`), t.id);
  }
});
