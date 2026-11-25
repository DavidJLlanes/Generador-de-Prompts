/** Identificador de versión: hash del contenido publicado (páginas, JS, CSS y datos). Cambia solo si cambia algo que se sirve. */
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';

const DIRS = ['assets', 'data', 'generadores', 'constructor', 'guias', 'legal'];
const FILES = ['index.html', '404.html', 'service-worker.js', 'manifest.webmanifest'];
const SKIP = new Set(['data/version.json', 'data/version.js']); // se generan a partir del hash: no entran en él

function walk(root, dir, out) {
  for (const name of readdirSync(path.join(root, dir)).sort()) {
    const rel = `${dir}/${name}`;
    if (statSync(path.join(root, rel)).isDirectory()) walk(root, rel, out);
    else if (!SKIP.has(rel)) out.push(rel);
  }
}

export function buildId(root) {
  const files = [];
  for (const d of DIRS) if (existsSync(path.join(root, d))) walk(root, d, files);
  for (const f of FILES) if (existsSync(path.join(root, f))) files.push(f);
  const hash = createHash('sha256');
  for (const rel of files.sort()) hash.update(rel).update('\0').update(readFileSync(path.join(root, rel))).update('\0');
  return hash.digest('hex').slice(0, 10);
}

export function versionFiles(root) {
  const { version } = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
  const info = { version, id: buildId(root) };
  return {
    json: JSON.stringify(info) + '\n',
    js: `// Generado por «npm run build»: identifica esta versión del sitio.\nexport const BUILD = ${JSON.stringify(info)};\n`,
  };
}
