# Despliegue en un VPS (nginx)

El sitio es **100 % estático**: el servidor solo sirve archivos. No hace falta Node, base de datos ni proceso en segundo plano.

## 1. Preparar el servidor (una vez)

```bash
sudo apt update && sudo apt install -y nginx git certbot python3-certbot-nginx
sudo git clone https://github.com/DavidJLlanes/Generador-de-Prompts.git /var/www/lumenvitae
```

Configura nginx a partir de `deploy/nginx.conf.example`:

```bash
sudo cp /var/www/lumenvitae/deploy/nginx.conf.example /etc/nginx/sites-available/lumenvitae
sudo ln -s /etc/nginx/sites-available/lumenvitae /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

HTTPS (Let's Encrypt):

```bash
sudo certbot --nginx -d lumenvitae.es -d www.lumenvitae.es
```

## 2. Publicar cambios

En tu equipo:

```bash
npm run check          # valida datos, regenera páginas y pasa los tests
git add -A && git commit -m "Describe el cambio" && git push
```

En el servidor:

```bash
cd /var/www/lumenvitae && git pull
```

No hay paso de compilación en el servidor: los archivos generados (catálogo, páginas, sitemap) ya van en el repositorio.

## 3. Qué hace la configuración de nginx

- Sirve la raíz del repositorio y responde con `404.html` a las rutas inexistentes.
- URLs limpias: `/generadores/mujer/` carga `generadores/mujer/index.html`.
- Compresión (gzip) de HTML, CSS, JS y los archivos de datos.
- Caché: HTML y datos se revalidan siempre; fuentes e imágenes se cachean un año.
- Cabeceras de seguridad (`Content-Security-Policy` estricta, `X-Content-Type-Options`, `Referrer-Policy`). Son las mismas que envía `npm run dev`, así que cualquier incumplimiento aparece en desarrollo.
- Redirección de `www` y de HTTP a HTTPS.

## 4. Comprobaciones tras publicar

- `https://lumenvitae.es/` carga y el constructor funciona.
- `https://lumenvitae.es/sitemap.xml` y `/robots.txt` responden.
- Consola del navegador sin errores (la CSP bloquea cualquier recurso no previsto).
- Envía el sitemap a Google Search Console.

## 5. Notas

- El sitio funciona con **rutas absolutas** (`/assets/…`): debe servirse en la raíz de un dominio, no en un subdirectorio.
- Si cambias una fuente o una imagen conservando el nombre, la caché de un año puede servir la antigua: usa un nombre nuevo.
- Copias de seguridad: todo está en git; no hay datos de usuario en el servidor.
