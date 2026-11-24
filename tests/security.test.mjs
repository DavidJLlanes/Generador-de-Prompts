import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { SECURITY_HEADERS } from '../scripts/lib/server.mjs';

const nginx = readFileSync(new URL('../deploy/nginx.conf.example', import.meta.url), 'utf8');

test('la CSP de producción (nginx) es la misma que la de desarrollo', () => {
  assert.ok(nginx.includes(`add_header Content-Security-Policy "${SECURITY_HEADERS['Content-Security-Policy']}" always;`));
});

test('los hashes CSP de login y enroll coinciden con sus scripts en línea', () => {
  for (const f of ['login', 'enroll']) {
    const html = readFileSync(new URL(`../auth/${f}.html`, import.meta.url), 'utf8');
    const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
    assert.ok(scripts.length > 0);
    for (const code of scripts) {
      const hash = `'sha256-${createHash('sha256').update(code).digest('base64')}'`;
      assert.ok(nginx.includes(hash), `${f}.html: falta ${hash} en deploy/nginx.conf.example`);
    }
  }
});

test('nginx no sirve el código del servicio de acceso ni archivos internos', () => {
  assert.match(nginx, /location \^~ \/prompt\/auth\/ \{\s*return 404;/);
  assert.match(nginx, /node_modules\|auth\)/);
  for (const h of ['Strict-Transport-Security', 'X-Content-Type-Options', 'Referrer-Policy', "frame-ancestors 'none'"]) assert.ok(nginx.includes(h), h);
});

test('la CSP no permite scripts en línea ni de terceros en la aplicación', () => {
  const csp = SECURITY_HEADERS['Content-Security-Policy'];
  assert.match(csp, /script-src 'self';/);
  assert.doesNotMatch(csp, /script-src[^;]*unsafe/);
  assert.match(csp, /object-src 'none'/);
});
