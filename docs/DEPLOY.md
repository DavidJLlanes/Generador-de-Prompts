# Despliegue protegido en djl.com.es/prompt/

El repositorio se publica en `/var/www/djl.com.es/prompt`. El HTML, el sitemap y el manifiesto ya vienen generados en Git. Para cambiar el prefijo de URL, edita `assets/js/core/site-path.js` y ejecuta `npm run build` antes de publicar.

## Primera instalación

Con un usuario con permisos de escritura en `/var/www/djl.com.es`:

```bash
git clone https://github.com/DavidJLlanes/Generador-de-Prompts.git /var/www/djl.com.es/prompt
```

Instala la utilidad para crear usuarios y contraseñas de Nginx y crea el primer acceso (sustituye `david` por el usuario que quieras):

```bash
sudo apt update && sudo apt install apache2-utils
sudo htpasswd -c /etc/nginx/.htpasswd-lumen-prompt david
sudo chown root:www-data /etc/nginx/.htpasswd-lumen-prompt
sudo chmod 640 /etc/nginx/.htpasswd-lumen-prompt
```

El segundo comando solicita la contraseña sin mostrarla en pantalla. No la pongas en Git ni en una URL.

Añade las ubicaciones de `deploy/nginx.conf.example` dentro del bloque HTTPS existente de `djl.com.es`. Estas ubicaciones protegen la página y todos sus recursos, y desactivan la caché de contenido protegido. Después, valida y aplica la configuración:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Al abrir `https://djl.com.es/prompt/`, el navegador mostrará su cuadro nativo de usuario y contraseña. Guarda el acceso en el gestor de contraseñas del dispositivo para que iPhone/iPad lo rellenen con Face ID o Android con huella. La app puede seguir añadiéndose a la pantalla de inicio; el service worker anterior se elimina para que no pueda mostrar una copia en caché sin validar el acceso con Nginx.

Para cambiar la contraseña de un usuario existente, ejecuta `sudo htpasswd /etc/nginx/.htpasswd-lumen-prompt david`. Para añadir otro usuario, ejecuta el mismo comando con otro nombre. No uses `-c` al actualizar o añadir usuarios, porque ese parámetro recrea el archivo y borraría los demás accesos.

Si el dominio ya aplica una política CSP, su directiva `connect-src` debe permitir `'self'` y los orígenes de los proveedores de IA que uses: `https://openrouter.ai`, `https://api.openai.com`, `https://api.anthropic.com` y `https://generativelanguage.googleapis.com`. La clave se introduce en «Constructor → Configurar IA» y se guarda en el navegador para el nuevo dominio.

El sitemap está en `https://djl.com.es/prompt/sitemap.xml`. Para anunciarlo a los buscadores, añade esa URL al `robots.txt` de la raíz de `djl.com.es` sin sustituir sus reglas actuales.

## Actualizaciones

```bash
git -C /var/www/djl.com.es/prompt pull --ff-only origin main
```

GitHub Actions puede actualizar esa misma carpeta si están configurados los secretos `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY` y `VPS_KNOWN_HOSTS`. Si la clave de despliegue tiene un comando forzado en `authorized_keys`, apunta ese comando al nuevo checkout:

```text
command="git -C /var/www/djl.com.es/prompt pull --ff-only origin main",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty ssh-ed25519 AAAA… github-actions-lumenvitae
```
