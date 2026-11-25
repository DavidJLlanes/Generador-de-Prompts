/**
 * EXPORTAR (puro, sin DOM): wildcards para ComfyUI / Stable Diffusion WebUI y lotes de prompts en CSV.
 *
 *  · Wildcards: un `.txt` por sección (una opción por línea, en inglés), en una carpeta por generador, listo para
 *    usar con `__generador/seccion__`. NO se exportan las opciones de adultos, de menores ni de aspecto joven
 *    (etiquetas `adult-only`, `minor`, `youthful`): fuera de la web no habría nadie que aplicara las exclusiones
 *    entre generadores, así que esas listas no salen nunca.
 *  · CSV: una fila por prompt, con BOM y separador elegible para que Excel lo abra bien con acentos.
 */
import { hasTag } from './exclusions.js';
import { compose } from './composer.js';
import { renderFormat } from './formats/index.js';

const BLOCKED_TAGS = ['adult-only', 'minor', 'youthful'];
const safeLine = t => String(t).replace(/[|]/g, '/').replace(/[{}]/g, m => (m === '{' ? '(' : ')')).replace(/\s+/g, ' ').replace(/^#+\s*/, '').trim();

/** Líneas exportables de una sección (sin repetir, sin opciones bloqueadas, sin caracteres de la sintaxis `{a|b}`). */
export function wildcardLines(domainId, section) {
  const seen = new Set();
  const out = [];
  for (const o of section.options) {
    if (BLOCKED_TAGS.some(t => hasTag(domainId, section.id, o.id, t))) continue;
    const line = safeLine(o.en);
    if (line && !seen.has(line.toLowerCase())) { seen.add(line.toLowerCase()); out.push(line); }
  }
  return out;
}

const README = `GENERADOR DE PROMPTS · wildcards
================================
Cada archivo .txt es una lista de opciones (una por línea, en inglés). En el prompt escribes
__generador/seccion__ y el programa elige una línea al azar cada vez que generas.

Dónde copiar la carpeta "wildcards":
  · Stable Diffusion WebUI (A1111 / Forge) con la extensión sd-dynamic-prompts:
      stable-diffusion-webui/extensions/sd-dynamic-prompts/wildcards/
  · ComfyUI con ComfyUI-Impact-Pack (nodo ImpactWildcardProcessor):
      ComfyUI/custom_nodes/ComfyUI-Impact-Pack/custom_wildcards/
    Si tu versión no reconoce las subcarpetas, copia los .txt sueltos y usa __seccion__.

Prueba con el archivo plantilla-ejemplo.txt: pégalo en el prompt y genera varias imágenes.
Las listas de «Evitar» (carpeta con nombre neg-…) van en el prompt negativo.

No se incluyen las opciones para adultos ni las de menores o de aspecto joven.
`;

/**
 * @param {Record<string, object>} domains  dominios cargados (los que se exportan)
 * @returns {{name: string, content: string}[]}  archivos listos para comprimir en un ZIP
 */
export function wildcardFiles(domains) {
  const files = [];
  const index = [];
  for (const dom of Object.values(domains)) {
    for (const sec of dom.sections) {
      const lines = wildcardLines(dom.id, sec);
      if (lines.length < 2) continue;
      const neg = sec.polarity === 'negative';
      const file = `${neg ? 'neg-' : ''}${sec.id}`;
      files.push({ name: `wildcards/${dom.id}/${file}.txt`, content: lines.join('\n') + '\n' });
      index.push({ token: `${dom.id}/${file}`, title: `${dom.meta?.short || dom.id} · ${sec.title}`, count: lines.length, neg });
    }
  }
  // Plantilla de ejemplo con secciones reales de los generadores exportados.
  const pick = (id, n) => index.filter(i => !i.neg && i.token.startsWith(id + '/')).slice(0, n).map(i => `__${i.token}__`);
  const sample = [...pick('woman', 3), ...pick('landscape', 2), ...pick('photo', 2)];
  if (sample.length >= 3) files.push({ name: 'wildcards/plantilla-ejemplo.txt', content: sample.join(', ') + '\n' });
  files.push({ name: 'LEEME.txt', content: README });
  files.push({ name: 'indice.txt', content: index.map(i => `__${i.token}__\t${i.count}\t${i.title}`).join('\n') + '\n' });
  return files;
}

/* ---------- CSV ---------- */

/** Escapa un campo CSV. Los que empiezan por = + - @ llevan un apóstrofo delante para que Excel no los ejecute como fórmula. */
export function csvField(v, delimiter = ',') {
  let s = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /["\n\r]/.test(s) || s.includes(delimiter) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * @param {string[]} header
 * @param {(string|number)[][]} rows
 * @param {{delimiter?: ',' | ';', bom?: boolean}} [opts]  `;` es lo que espera Excel en español
 */
export function toCSV(header, rows, { delimiter = ';', bom = true } = {}) {
  const line = r => r.map(v => csvField(v, delimiter)).join(delimiter);
  return (bom ? '﻿' : '') + [line(header), ...rows.map(line)].join('\r\n') + '\r\n';
}

export const BATCH_HEADER = ['n', 'prompt', 'negativo', 'proporcion', 'tamano', 'enlace'];

/**
 * Fila de un prompt para el CSV. `sel` es la selección de esa tirada; el resto del estado (formato, detalle…) es el actual.
 * @param {(state: object) => string} [linkOf]  genera el enlace compartible (necesita `location`, por eso se inyecta)
 */
export function batchRow(domains, state, sel, n, linkOf) {
  const st = { ...state, sel };
  const result = renderFormat(st.format, compose(domains, st), st);
  const block = title => result.blocks.find(b => b.title === title)?.text || '';
  const prompt = result.blocks[0]?.text || '';
  return [n, prompt, block('Prompt negativo'), st.aspect || '', block('Tamaño sugerido') || block('Tamaño admitido'), linkOf ? linkOf(st) : ''];
}
