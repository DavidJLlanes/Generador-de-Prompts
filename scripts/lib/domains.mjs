/** Utilidades de Node para leer los dominios y presets desde data/. */
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const DOMAINS_DIR = path.join(ROOT, 'data', 'domains');
export const PRESETS_DIR = path.join(ROOT, 'data', 'presets');

const imp = file => import(pathToFileURL(file).href).then(m => m.default);

/** Carga todos los dominios, ordenados por `order`. */
export async function loadAllDomains() {
  const files = readdirSync(DOMAINS_DIR).filter(f => f.endsWith('.js')).sort();
  const out = [];
  for (const f of files) {
    const d = await imp(path.join(DOMAINS_DIR, f));
    out.push({ file: f, domain: d });
  }
  return out.sort((a, b) => a.domain.order - b.domain.order);
}

/** Carga los presets de un dominio, o null si no tiene. */
export async function loadPresetsFor(id) {
  try { return await imp(path.join(PRESETS_DIR, `${id}.js`)); } catch { return null; }
}
