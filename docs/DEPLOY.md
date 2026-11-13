# Acceso privado en djl.com.es/prompt/

La web se sirve en `/var/www/djl.com.es/prompt`. El acceso usa usuario y contraseña con una sesión de 30 días. El navegador puede guardar la contraseña y rellenarla mediante Face ID o huella. También se pueden añadir passkeys opcionales por dispositivo.

## Primera instalación del servicio

Con un usuario con permisos de escritura en `/var/www/djl.com.es`:

```bash
git clone https://github.com/DavidJLlanes/Generador-de-Prompts.git /var/www/djl.com.es/prompt
node --version
cd /var/www/djl.com.es/prompt/auth
sudo npm install --omit=dev --no-package-lock
sudo install -d -o www-data -g www-data -m 700 /var/lib/lumen-prompt
sudo cp /var/www/djl.com.es/prompt/deploy/lumen-prompt-auth.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now lumen-prompt-auth
```

En el primer arranque se crea la cuenta `david` y una contraseña temporal aleatoria. Consúltala una vez en los registros del servicio:

```bash
sudo journalctl -u lumen-prompt-auth -n 40 --no-pager
```

Entra en `https://djl.com.es/prompt/login` con esa cuenta y cambia la contraseña en `https://djl.com.es/prompt/enroll`. Guarda la nueva contraseña en el gestor del navegador para poder usar Face ID o huella al rellenarla. La sesión dura 30 días. Las passkeys son opcionales y se añaden desde la página de cuenta.

## Nginx

Dentro del bloque HTTPS existente de `djl.com.es`, instala las ubicaciones de `deploy/nginx.conf.example`. Elimina todas las directivas `auth_basic` y `auth_basic_user_file` que se hubieran añadido para `/prompt`. Valida y recarga Nginx:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Elimina el archivo de contraseñas del antiguo Basic Auth, si existe:

```bash
sudo rm -f /etc/nginx/.htpasswd-lumen-prompt
```

Las ubicaciones proxy de `/prompt/auth/login/` y `/prompt/auth/register/` deben incluir `proxy_set_header X-Real-IP $remote_addr;` para limitar los intentos fallidos por IP.

Si el dominio ya aplica una política CSP, su directiva `connect-src` debe permitir `'self'` y los orígenes de los proveedores de IA que uses: `https://openrouter.ai`, `https://api.openai.com`, `https://api.anthropic.com` y `https://generativelanguage.googleapis.com`. La clave se introduce en «Constructor → Configurar IA» y se guarda en el navegador.

El sitemap está en `https://djl.com.es/prompt/sitemap.xml`. Para anunciarlo a los buscadores, añade esa URL al `robots.txt` de la raíz de `djl.com.es` sin sustituir sus reglas actuales.

## Actualizaciones

```bash
git -C /var/www/djl.com.es/prompt pull --ff-only origin main
sudo systemctl restart lumen-prompt-auth
```

GitHub Actions puede actualizar esa misma carpeta si están configurados los secretos `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY` y `VPS_KNOWN_HOSTS`. Si la clave de despliegue tiene un comando forzado en `authorized_keys`, apunta ese comando al checkout:

```text
command="git -C /var/www/djl.com.es/prompt pull --ff-only origin main",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty ssh-ed25519 AAAA… github-actions-lumenvitae
```
