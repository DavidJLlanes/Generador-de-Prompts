/**
 * IMPORTA las miniaturas de las poses del catálogo (data/catalogs/poses.js) desde el clon local de
 * POSE-DB-01 (ギア, @giaaibusi) a assets/img/catalogo/poses/.
 *
 * Uso: node scripts/catalogs/importar-poses.mjs "E:\Downloads\1\ai-pose-gallery-local\pose-clone"
 *
 * Solo copia las poses que están en los datos (los planos frontales). Los nombres en los datos son
 * «sexy-p001», «est-p074», «med-p032»; en el catálogo original, «full_sexy_P001_front.jpg»,
 * «full_single_P001_front.jpg» y «upper80v2_P032_front.jpg».
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from '../lib/domains.mjs';
import sections from '../../data/catalogs/poses.js';

const SRC = process.argv[2] || 'E:\\Downloads\\1\\ai-pose-gallery-local\\pose-clone';
const OUT = path.join(ROOT, 'assets', 'img', 'catalogo', 'poses');
const PREFIX = { sex: 'full_sexy', sexy: 'full_sexy', est: 'full_single', med: 'upper80v2' };

const options = sections.flatMap(s => s.options);
mkdirSync(OUT, { recursive: true });

let copied = 0;
const missing = [];
for (const o of options) {
  const [, series, num] = o.id.match(/^([a-z]+)-p(\d+)$/) || [];
  const prefix = PREFIX[series];
  if (!prefix) throw new Error(`Serie desconocida en ${o.id}`);
  const from = path.join(SRC, 'thumbs', `${prefix}_P${num}_front.jpg`);
  if (!existsSync(from)) { missing.push(o.id); continue; }
  copyFileSync(from, path.join(OUT, `${o.id}.jpg`));
  copied++;
}
if (missing.length) throw new Error(`Faltan miniaturas: ${missing.join(', ')}`);

// Miniaturas de ejecuciones anteriores que ya no corresponden a ninguna pose.
const keep = new Set(options.map(o => `${o.id}.jpg`));
for (const f of readdirSync(OUT)) if (!keep.has(f)) rmSync(path.join(OUT, f));

console.log(`poses: ${copied} miniaturas copiadas a ${path.relative(ROOT, OUT)}`);
