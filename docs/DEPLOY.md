# Despliegue con passkeys en djl.com.es/prompt/

El repositorio se publica en `/var/www/djl.com.es/prompt`. El HTML, el sitemap y el manifiesto ya vienen generados en Git. Para cambiar el prefijo de URL, edita `assets/js/core/site-path.js` y ejecuta `npm run build` antes de publicar.

## Primera instalación

Con un usuario con permisos de escritura en `/var/www/djl.com.es`:

```bash
git clone https://github.com/DavidJLlanes/Generador-de-Prompts.git /var/www/djl.com.es/prompt
```

Instala las dependencias del servicio de passkeys y prepara su almacenamiento:

```bash
node --version
cd /var/www/djl.com.es/prompt/auth
sudo npm install --omit=dev --no-package-lock
sudo install -d -o www-data -g www-data -m 700 /var/lib/lumen-prompt
sudo cp /var/www/djl.com.es/prompt/deploy/lumen-prompt-auth.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now lumen-prompt-auth
```

Genera un código aleatorio de un solo uso para guardar la primera passkey en tu dispositivo. Este código se usa solo para activar el primer dispositivo; no es una contraseña de acceso:

```bash
sudo -u www-data sh -c 'umask 077; openssl rand -hex 32 > /var/lib/lumen-prompt/bootstrap-token'
sudo chmod 600 /var/lib/lumen-prompt/bootstrap-token
sudo cat /var/lib/lumen-prompt/bootstrap-token
```

Copia ese código para introducirlo una vez en `https://djl.com.es/prompt/enroll`. Tras registrar la primera passkey, el servidor borra el código. No lo compartas ni lo guardes en Git.

Sustituye en el bloque HTTPS de `djl.com.es` las ubicaciones anteriores de `/prompt` por las de `deploy/nginx.conf.example`. Borra las directivas `auth_basic` y `auth_basic_user_file` anteriores, incluidas las de `location = /prompt` y `location ^~ /prompt/`. Después de guardar la nueva configuración, valida y aplícala:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Ya aplicada la configuración nueva, elimina el archivo de claves de Basic Auth para retirar por completo el sistema anterior:

```bash
sudo rm -f /etc/nginx/.htpasswd-lumen-prompt
```

Al abrir `https://djl.com.es/prompt/`, elige «Entrar con Face ID o huella». Las sesiones duran 24 horas; al caducar, confirmas la passkey de nuevo en el dispositivo. Para vincular otro móvil u ordenador, abre `/prompt/enroll` desde un dispositivo donde ya hayas iniciado sesión, pulsa «Vincular otro dispositivo» y comparte el código temporal. En el otro dispositivo, abre `/prompt/enroll`, pega ese código y crea la passkey. La invitación caduca en 15 minutos, se puede usar una sola vez y no elimina las passkeys existentes. No se guardan datos biométricos en el VPS.

Si pierdes todos los dispositivos registrados, puedes crear otro código de recuperación en el VPS. Ese código sustituye las passkeys anteriores al registrar la nueva:

```bash
sudo -u www-data sh -c 'umask 077; openssl rand -hex 32 > /var/lib/lumen-prompt/bootstrap-token'
sudo chmod 600 /var/lib/lumen-prompt/bootstrap-token
sudo cat /var/lib/lumen-prompt/bootstrap-token
```

Introduce el código en `https://djl.com.es/prompt/enroll`. Se elimina al completar el registro.

Si el dominio ya aplica una política CSP, su directiva `connect-src` debe permitir `'self'` y los orígenes de los proveedores de IA que uses: `https://openrouter.ai`, `https://api.openai.com`, `https://api.anthropic.com` y `https://generativelanguage.googleapis.com`. La clave se introduce en «Constructor → Configurar IA» y se guarda en el navegador para el nuevo dominio.

El sitemap está en `https://djl.com.es/prompt/sitemap.xml`. Para anunciarlo a los buscadores, añade esa URL al `robots.txt` de la raíz de `djl.com.es` sin sustituir sus reglas actuales.

## Actualizaciones

```bash
git -C /var/www/djl.com.es/prompt pull --ff-only origin main
sudo systemctl restart lumen-prompt-auth
```

GitHub Actions puede actualizar esa misma carpeta si están configurados los secretos `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY` y `VPS_KNOWN_HOSTS`. Si la clave de despliegue tiene un comando forzado en `authorized_keys`, apunta ese comando al nuevo checkout:

```text
command="git -C /var/www/djl.com.es/prompt pull --ff-only origin main",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty ssh-ed25519 AAAA… github-actions-lumenvitae
```
