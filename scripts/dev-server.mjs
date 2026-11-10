/**
 * Servidor estático de desarrollo, sin dependencias. Uso: npm run dev  →  http://localhost:5173
 * (Los módulos ES y el import() dinámico necesitan http://; no funcionan abriendo el HTML con doble clic.)
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { ROOT } from './lib/domains.mjs';

const PORT = Number(process.env.PORT) || 5173;
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
};

/**
 * Las mismas cabeceras de seguridad que se recomiendan en producción (deploy/nginx.conf.example):
 * así cualquier incumplimiento de la CSP aparece en desarrollo y no en el servidor.
 */
const SECURITY_HEADERS = {
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
    if (s.isDirectory()) return path.join(target, 'index.html');
    return target;
  } catch { return null; }
}

createServer(async (req, res) => {
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
}).listen(PORT, () => console.log(`Lumen Vitae · desarrollo en http://localhost:${PORT}`));
