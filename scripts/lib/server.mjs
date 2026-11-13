/**
 * Servidor estático sin dependencias, compartido por `npm run dev` y por las pruebas de navegador.
 * Envía las mismas cabeceras de seguridad que se recomiendan en producción (deploy/nginx.conf.example),
 * de modo que cualquier incumplimiento de la CSP aparece en desarrollo y en las pruebas.
 */
import { createServer, request as httpRequest } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { ROOT } from './domains.mjs';

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
};

export const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

async function resolveFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  const target = path.normalize(path.join(ROOT, clean));
  if (!target.startsWith(ROOT)) return null; // evita salir de la carpeta del proyecto
  try {
    const s = await stat(target);
    return s.isDirectory() ? path.join(target, 'index.html') : target;
  } catch { return null; }
}

/** @returns {import('node:http').Server} servidor sin iniciar: llama a `.listen(puerto)` (0 = puerto libre). */
export function createStaticServer({ aiProxyPort = 0 } = {}) {
  return createServer(async (req, res) => {
    if (aiProxyPort && req.url?.startsWith('/api/ai/')) {
      const proxy = httpRequest({ hostname: '127.0.0.1', port: aiProxyPort, path: req.url, method: req.method, headers: req.headers }, upstream => {
        res.writeHead(upstream.statusCode || 502, upstream.headers);
        upstream.pipe(res);
      });
      proxy.on('error', () => {
        if (!res.headersSent) res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'ai_service_unavailable' }));
      });
      req.pipe(proxy);
      return;
    }
    let file = await resolveFile(req.url);
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
