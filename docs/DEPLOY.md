# Despliegue en djl.com.es/prompt/

El repositorio se publica en `/var/www/djl.com.es/prompt`. El HTML, el sitemap y el manifiesto ya vienen generados en Git. Para cambiar el prefijo de URL, edita `assets/js/core/site-path.js` y ejecuta `npm run build` antes de publicar.

## Primera instalación

Con un usuario con permisos de escritura en `/var/www/djl.com.es`:

```bash
git clone https://github.com/DavidJLlanes/Generador-de-Prompts.git /var/www/djl.com.es/prompt
```

Añade las ubicaciones de `deploy/nginx.conf.example` al bloque HTTPS existente de `djl.com.es`. Después, aplica la configuración:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

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
