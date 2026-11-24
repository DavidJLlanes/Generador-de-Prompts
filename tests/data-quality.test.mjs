import test from 'node:test';
import assert from 'node:assert/strict';
import { auditData } from '../scripts/audit-data.mjs';
import { loadAllDomains } from '../scripts/lib/domains.mjs';
import { OPTION_ALIASES } from '../data/aliases.js';
import { sanitizeSel } from '../assets/js/core/store.js';

const issues = await auditData();
const domains = Object.fromEntries((await loadAllDomains()).map(x => [x.domain.id, x.domain]));

test('no hay etiquetas repetidas en una sección (salvo poses de subgrupos distintos)', () => {
  const dup = issues.filter(i => i.kind === 'es-duplicada' && i.section !== 'pose-galeria');
  assert.deepEqual(dup.map(i => `${i.domain}/${i.section}/${i.option}`), []);
});

test('ningún texto en inglés repetido en una sección', () => {
  assert.deepEqual(issues.filter(i => i.kind === 'en-duplicada').map(i => i.option), []);
});

test('todas las etiquetas empiezan por mayúscula y sin espacios sobrantes', () => {
  assert.deepEqual(issues.filter(i => ['es-minuscula-inicial', 'espacios', 'es-signo-final'].includes(i.kind)).map(i => `${i.domain}/${i.option}`), []);
});

test('los alias apuntan a opciones que existen y los ids antiguos ya no existen', () => {
  for (const [d, bySec] of Object.entries(OPTION_ALIASES)) for (const [sid, map] of Object.entries(bySec)) {
    const sec = domains[d].sections.find(s => s.id === sid);
    assert.ok(sec, `${d}/${sid} no existe`);
    const ids = new Set(sec.options.map(o => o.id));
    for (const [old, now] of Object.entries(map)) {
      assert.ok(ids.has(now), `${d}/${sid}: ${now} no existe`);
      assert.ok(!ids.has(old), `${d}/${sid}: ${old} debería haberse fusionado`);
    }
  }
});

test('una selección guardada con ids antiguos se traduce y no se duplica', () => {
  const out = sanitizeSel({ photo: { lens: ['85mm-portrait-lens', 'shot-on-85mm-portrait-lens', '85mm-portrait'], other: ['85mm-portrait-lens'] } });
  assert.deepEqual(out.photo.lens, ['85mm-portrait']);
  assert.deepEqual(out.photo.other, ['85mm-portrait-lens'], 'en otra sección el id no se toca');
});
