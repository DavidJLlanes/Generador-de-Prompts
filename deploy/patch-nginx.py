#!/usr/bin/env python3
"""
Añade al sitio de Nginx las cabeceras de seguridad de deploy/nginx.conf.example y bloquea /prompt/auth/.
Uso (como root):  python3 deploy/patch-nginx.py [/etc/nginx/sites-enabled/djl.com.es]

- Hace copia de seguridad, muestra los cambios, comprueba con «nginx -t» y recarga.
- Si la comprobación falla, restaura la copia: nunca deja Nginx roto.
- Si ya estaba aplicado, no toca nada.
"""
import difflib, re, shutil, subprocess, sys, time

path = sys.argv[1] if len(sys.argv) > 1 else '/etc/nginx/sites-enabled/djl.com.es'
original = open(path).read()
if 'location ^~ /prompt/auth/ {' in original:
    sys.exit('Ya estaba aplicado: no se cambia nada.')

COMMON = [
    'add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;',
    'add_header X-Content-Type-Options "nosniff" always;',
    'add_header Referrer-Policy "strict-origin-when-cross-origin" always;',
    'add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()" always;',
]
LOGIN_CSP = ("add_header Content-Security-Policy \"default-src 'none'; "
             "script-src 'sha256-6cKrCQs1bcUyfOYPDV9DTwrKEaYy356cNPTEJc8Frfg=' 'sha256-sKG38MKTTkiCHCFF9uuv/ZUwW+qDI2wAFYZ8diYwExg='; "
             "style-src 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'\" always;")
APP_CSP = ("add_header Content-Security-Policy \"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; "
           "img-src 'self' data:; font-src 'self'; connect-src 'self' https://openrouter.ai https://api.openai.com "
           "https://api.anthropic.com https://generativelanguage.googleapis.com; worker-src 'self'; manifest-src 'self'; "
           "object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'\" always;")
NO_STORE = 'add_header Cache-Control "no-store" always;'

lines = original.split('\n')
out = []
for line in lines:
    indent = re.match(r'\s*', line).group(0)
    stripped = line.strip()
    if stripped == 'location ^~ /prompt/ {':
        out += [f'{indent}location ^~ /prompt/auth/ {{', f'{indent}    return 404;', f'{indent}}}', '']
    if stripped.startswith('location = /prompt/package.json'):
        out.append(f'{indent}location ~ ^/prompt/(?:package(?:-lock)?\\.json|pendiente\\.md)$ {{ deny all; }}')
        continue
    out.append(line.replace('node_modules)(?:/|$) { deny all; }', 'node_modules|auth)(?:/|$) { deny all; }'))
    # Login y enroll: tras su try_files. Si al bloque le falta el Cache-Control no-store, se añade también.
    if stripped.startswith('try_files /prompt/auth/login.html') or stripped.startswith('try_files /prompt/auth/enroll.html'):
        block = '\n'.join(lines[lines.index(line):lines.index(line) + 6])
        extra = [] if 'Cache-Control' in block else [NO_STORE]
        out += [indent + h for h in extra + COMMON + [LOGIN_CSP]]
    # Resto del sitio: tras auth_request.
    if stripped == 'auth_request /prompt/auth/check;':
        out += [indent + h for h in COMMON + [APP_CSP]]

new = '\n'.join(out)
added = new.count('Content-Security-Policy') - original.count('Content-Security-Policy')
if added != 3 or 'location ^~ /prompt/auth/ {' not in new:
    sys.exit(f'No reconozco la estructura del archivo (CSP añadidas: {added}). No se ha cambiado nada.')

print(''.join(difflib.unified_diff(original.splitlines(True), new.splitlines(True), 'antes', 'después')))
backup = f'/root/{path.rsplit("/", 1)[-1]}.bak-{time.strftime("%Y%m%d-%H%M%S")}'
shutil.copy2(path, backup)
open(path, 'w').write(new)

test = subprocess.run(['nginx', '-t'], capture_output=True, text=True)
if test.returncode != 0:
    shutil.copy2(backup, path)
    print(test.stderr)
    sys.exit(f'ERROR en nginx -t: restaurado el original. No se ha cambiado nada. (copia: {backup})')
subprocess.run(['systemctl', 'reload', 'nginx'], check=True)
print(f'OK: aplicado y Nginx recargado. Copia de seguridad: {backup}')
print(f'Para deshacer:  cp {backup} {path} && systemctl reload nginx')
