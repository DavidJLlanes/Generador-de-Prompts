/**
 * Servidor estático sin dependencias, compartido por `npm run dev` y por las pruebas de navegador.
 * Envía las mismas cabeceras de seguridad que se recomiendan en producción (deploy/nginx.conf.example),
 * de modo que cualquier incumplimiento de la CSP aparece en desarrollo y en las pruebas.
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { BASE_PATH } from '../../assets/js/core/site-path.js';
import { ROOT } from './domains.mjs';

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
};

export const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://openrouter.ai https://api.openai.com https://api.anthropic.com https://generativelanguage.googleapis.com; base-uri 'self'; form-action 'self'; frame-ancestors 'self'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

async function resolveFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  if (!clean.startsWith(BASE_PATH + '/')) return null;
  const target = path.normalize(path.join(ROOT, clean.slice(BASE_PATH.length)));
  if (target !== ROOT && !target.startsWith(ROOT + path.sep)) return null; // evita salir de la carpeta del proyecto
  try {
    const s = await stat(target);
    return s.isDirectory() ? path.join(target, 'index.html') : target;
  } catch { return null; }
}

/** @returns {import('node:http').Server} servidor sin iniciar: llama a `.listen(puerto)` (0 = puerto libre). */
export function createStaticServer() {
  return createServer(async (req, res) => {
    const pathname = req.url.split('?')[0];
    if (pathname === '/' || pathname === BASE_PATH) {
      res.writeHead(302, { Location: BASE_PATH + '/' + req.url.slice(pathname.length) });
      res.end();
      return;
    }
    let file = await resolveFile(req.url).catch(() => null);
    let status = 200;
    if (!file) { file = path.join(ROOT, '404.html'); status = 404; }
    try {
      const body = await readFile(file);
      res.writeHead(status, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store', ...SECURITY_HEADERS });
      res.end(body);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 · No encontrado');
    }
  });
}
