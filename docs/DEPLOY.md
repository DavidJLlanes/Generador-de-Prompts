# Despliegue en un VPS (nginx)

La web base es estática y no necesita un servidor de aplicación. La integración IA es opcional y añade un pequeño servicio Node protegido, que mantiene las claves de proveedor fuera del navegador.

## 1. Preparar el servidor (una vez)

```bash
sudo apt update && sudo apt install -y nginx git certbot python3-certbot-nginx

# Carpeta del sitio, con tu usuario como propietario (así `git pull` no necesita sudo)
sudo mkdir -p /var/www/lumenvitae.es && sudo chown "$USER":"$USER" /var/www/lumenvitae.es
git clone https://github.com/DavidJLlanes/Generador-de-Prompts.git /var/www/lumenvitae.es
```

Crea el archivo de cabeceras de seguridad que incluye la configuración (**sin él, `nginx -t` falla**):

```bash
sudo mkdir -p /etc/nginx/snippets
sudo tee /etc/nginx/snippets/lumenvitae-security.conf > /dev/null <<'EOF'
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
EOF
```

Configura nginx a partir de `deploy/nginx.conf.example`:

```bash
sudo cp /var/www/lumenvitae.es/deploy/nginx.conf.example /etc/nginx/sites-available/lumenvitae.es
sudo ln -s /etc/nginx/sites-available/lumenvitae.es /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

HTTPS (Let's Encrypt):

```bash
sudo certbot --nginx -d lumenvitae.es -d www.lumenvitae.es
```

## Configurar IA (opcional)

La IA se puede configurar con OpenRouter, OpenAI, Anthropic Claude o Google Gemini. Usa solo los proveedores que quieras: cada uno necesita su clave y un ID de modelo válido en tu cuenta. Las claves se guardan en `/etc/lumenvitae-ai.env`, nunca en Git ni en el navegador.

1. Comprueba que hay Node.js 20 o superior (`node --version`). Ajusta `ExecStart` de la unidad si `command -v node` no devuelve `/usr/bin/node`.
2. Crea el archivo de entorno y un token aleatorio para que la web pueda autenticarse con su propio servicio:

```bash
sudo install -m 600 -o root -g root /var/www/lumenvitae.es/deploy/lumenvitae-ai.env.example /etc/lumenvitae-ai.env
openssl rand -hex 32
sudo nano /etc/lumenvitae-ai.env
```

Pega el resultado de `openssl rand -hex 32` como `AI_ACCESS_TOKEN`. Completa solo los proveedores que vayas a usar, por ejemplo `OPENROUTER_API_KEY` y `OPENROUTER_MODEL`. Mantén `AI_ALLOWED_ORIGIN=https://lumenvitae.es`.

3. Instala y arranca el servicio:

```bash
sudo cp /var/www/lumenvitae.es/deploy/lumenvitae-ai.service /etc/systemd/system/lumenvitae-ai.service
sudo systemctl daemon-reload
sudo systemctl enable --now lumenvitae-ai
sudo systemctl status lumenvitae-ai --no-pager
```

4. Añade el bloque `location ^~ /api/ai/` de `deploy/nginx.conf.example` al bloque HTTPS de `lumenvitae.es`. No reemplaces la configuración que Certbot ya modificó. Después:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

La web mostrará los proveedores/modelos configurados. Introduce el `AI_ACCESS_TOKEN` en «Configurar conexión IA»; se mantiene solo en la memoria de la pestaña y tendrás que volver a introducirlo tras recargar.

El backend limita tamaño y frecuencia, valida el origen y las respuestas del modelo, y no escribe claves ni textos de prompt en sus logs. El proveedor elegido recibe la descripción o selección que se envía y puede cobrarla o tratarla según sus condiciones. En el código de ejemplo el proxy atiende solo en `127.0.0.1`.

## 2. Publicar cambios

En tu equipo:

```bash
npm run check          # valida datos, regenera páginas y pasa los tests
git add -A && git commit -m "Describe el cambio" && git push
```

En el servidor:

```bash
cd /var/www/lumenvitae.es && git pull
```

No hay paso de compilación en el servidor: los archivos generados (catálogo, páginas, sitemap) ya van en el repositorio. Si cambia el proxy IA, reinícialo con `sudo systemctl restart lumenvitae-ai`.

## 3. Qué hace la configuración de nginx

- Sirve la raíz del repositorio y responde con `404.html` a las rutas inexistentes.
- URLs limpias: `/generadores/mujer/` carga `generadores/mujer/index.html`.
- Compresión (gzip) de HTML, CSS, JS y los archivos de datos.
- Caché: HTML y datos se revalidan siempre; fuentes e imágenes se cachean un año.
- Cabeceras de seguridad (`Content-Security-Policy` estricta, `X-Content-Type-Options`, `Referrer-Policy`). Son las mismas que envía `npm run dev`, así que cualquier incumplimiento aparece en desarrollo.
- Redirección de `www` y de HTTP a HTTPS.
- Proxy same-origin a `lumenvitae-ai.service`; el servicio solo hace falta si activas IA.

## 4. Comprobaciones tras publicar

- `https://lumenvitae.es/` carga y el constructor funciona.
- `https://lumenvitae.es/sitemap.xml` y `/robots.txt` responden.
- Consola del navegador sin errores (la CSP bloquea cualquier recurso no previsto).
- Envía el sitemap a Google Search Console.

## 5. Notas

- El sitio funciona con **rutas absolutas** (`/assets/…`): debe servirse en la raíz de un dominio, no en un subdirectorio.
- Si cambias una fuente o una imagen conservando el nombre, la caché de un año puede servir la antigua: usa un nombre nuevo.
- Copias de seguridad: todo está en git; no hay datos de usuario en el servidor.

## 6. Despliegue automático (GitHub Actions)

El flujo `.github/workflows/check.yml` hace dos cosas:

1. **En cada push y pull request** ejecuta `npm run check` (valida datos, regenera páginas, tests) y falla si `npm run build` cambia algún archivo, es decir, si se subieron páginas generadas desactualizadas.
2. **Solo en `main` y solo si lo anterior pasa**, entra por SSH en el VPS y ejecuta `git pull --ff-only`. Si faltan los secretos, este paso se omite sin error.

### Configurarlo (una vez)

En el **VPS**, crea una clave dedicada y restringida a ese único comando:

```bash
# en tu equipo
ssh-keygen -t ed25519 -f deploy_key -C "github-actions-lumenvitae" -N ""
# en el VPS, en ~/.ssh/authorized_keys del usuario que posee /var/www/lumenvitae.es (una sola línea):
command="cd /var/www/lumenvitae.es && git pull --ff-only",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty ssh-ed25519 AAAA… github-actions-lumenvitae
```

Con `command=` la clave **solo** puede hacer ese `git pull`, aunque alguien la robe. El repositorio es público, así que el `git pull` del VPS no necesita credenciales.

En GitHub, **Settings → Secrets and variables → Actions → New repository secret**:

| Secreto | Valor |
|---|---|
| `VPS_HOST` | IP o dominio del VPS |
| `VPS_USER` | usuario SSH propietario de la carpeta |
| `VPS_SSH_KEY` | contenido del archivo privado `deploy_key` |
| `VPS_KNOWN_HOSTS` | salida de `ssh-keyscan -t ed25519 TU_HOST` (para verificar el servidor) |

Después borra `deploy_key` de tu equipo.
