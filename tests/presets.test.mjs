import test from 'node:test';
import assert from 'node:assert/strict';
import { loadAllDomains, loadPresetsFor } from '../scripts/lib/domains.mjs';

const all = await loadAllDomains();

test('ninguna receta o idea incumple el modo de elección de su sección', async () => {
  let checked = 0;
  for (const { domain: d } of all) {
    const presets = await loadPresetsFor(d.id);
    if (!presets) continue;
    for (const p of presets) {
      for (const [secId, ids] of Object.entries(p.sel)) {
        const sec = d.sections.find(s => s.id === secId);
        if (sec.mode === 'single') assert.equal(ids.length, 1, `${d.id} #${p.n}: «${secId}» es de elección única y trae ${ids.length}`);
        assert.equal(new Set(ids).size, ids.length, `${d.id} #${p.n}: «${secId}» repite opciones`);
        checked++;
      }
    }
  }
  assert.ok(checked > 1000, `se revisaron ${checked} selecciones`);
});

test('ningún preset mezcla secciones en conflicto', async () => {
  for (const { domain: d } of all) {
    const presets = await loadPresetsFor(d.id);
    if (!presets) continue;
    for (const p of presets) {
      for (const c of d.conflicts || []) {
        const hasA = c.a.some(s => p.sel[s]?.length), hasB = c.b.some(s => p.sel[s]?.length);
        assert.ok(!(hasA && hasB), `${d.id} #${p.n}: mezcla secciones en conflicto (${c.id})`);
      }
    }
  }
});

test('las secciones de elección única de los generadores heredados son la norma; las múltiples, la excepción', () => {
  for (const id of ['weather', 'weapons', 'interior', 'tattoos', 'accessories', 'anatomy', 'magic']) {
    const d = all.find(x => x.domain.id === id).domain;
    const multi = d.sections.filter(s => s.mode === 'multi').length;
    assert.ok(multi <= 10, `${id}: demasiadas secciones múltiples (${multi}); revisa si son realmente acumulables`);
  }
});
