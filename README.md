<div align="center">

![Generador de Prompts — Constructor modular para imágenes con IA](assets/img/og/home.jpg)

# Generador de Prompts

**Constructor modular de prompts para imágenes con IA.**
Combina generadores (personajes, escenarios, coches, criaturas, fotografía…) en un único prompt y expórtalo para ChatGPT/Gemini, DALL·E, Stable Diffusion, Flux, Midjourney o Ideogram.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES%20Modules-F7DF1E?logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A5%2020-5FA04E?logo=nodedotjs&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-instalable-5A0FC8?logo=pwa&logoColor=white)
![WebAuthn](https://img.shields.io/badge/WebAuthn-passkeys-4285F4?logo=webauthn&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?logo=nginx&logoColor=white)
![systemd](https://img.shields.io/badge/systemd-servicio-FFD43B?logo=linux&logoColor=black)
![GitHub Actions](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)
![Sin dependencias](https://img.shields.io/badge/dependencias%20frontend-0-success)

</div>

---

## Índice

- [Qué es](#qué-es)
- [Características](#características)
- [Stack tecnológico](#stack-tecnológico)
- [Uso](#uso)
- [Desarrollo local](#desarrollo-local)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Scripts](#scripts)
- [Despliegue en un VPS](#despliegue-en-un-vps)
- [Integración continua](#integración-continua)
- [Seguridad y privacidad](#seguridad-y-privacidad)
- [Política de contenido](#política-de-contenido)
- [Documentación](#documentación)
- [Licencia](#licencia)

## Qué es

Generador de Prompts es un sitio **100 % estático** (HTML, CSS y módulos ES nativos, sin framework ni bundler) que ayuda a escribir prompts largos y coherentes para generadores de imágenes. La interfaz está en **español** y los prompts se generan en **inglés**: cada opción lleva un texto visible (`es`) y el texto que entra en el prompt (`en`).

En lugar de un cuadro de texto vacío, eliges opciones de **28 generadores** temáticos. El motor las ordena por *ranuras* (sujeto → atributos → acción → escenario → atmósfera → técnica) y produce un prompt completo sin importar en qué orden las elegiste ni cuántos generadores mezcles.

El catálogo actual ronda los **22.000 opciones**, **750 secciones** y **1.000 ideas y recetas** de partida. Todo se deriva de los archivos de datos en `data/`.

## Características

- **28 generadores** combinables: Personajes femeninos y masculinos, Personaje avanzado (épocas y culturas), Personajes animados, Rostros, Peinados, Anatomía, Accesorios, Tatuajes, Animales, Criaturas, Cosas extrañas, Magia, Efectos visuales, Vehículos, Coches míticos y actuales, Cohetes, Espacio, Armas, Objetos, Interiores, Paisajes, Escenas, Escenarios y mundos, Clima, Localizaciones, Poses y Fotografía y estilo.
- **Un único prompt entre páginas:** la selección persiste en el navegador, así que puedes ir de un personaje a «Escenarios» y a «Clima» construyendo una sola composición. El dock «Mi prompt» la muestra en cualquier página.
- **Siete formatos de salida:** texto continuo, bloques por ranura (ChatGPT/Gemini), positivo/negativo con tamaño (Stable Diffusion), texto sin negativo con tamaño (Flux), descripción natural con tamaño admitido (DALL·E / gpt-image), parámetros `--ar`/`--no` (Midjourney) y JSON estructurado (Ideogram).
- **Prueba rápida en la portada:** elige generador y proporción (o deja que decida el azar) y genera un prompt al momento. Puedes bloquear etiquetas y relanzar el resto, abrir el «Prompt del día» (el mismo para todos), ver el historial con favoritos y compartir por enlace. No toca tu selección del constructor.
- **Plantillas de partida:** 18 combinaciones de varios generadores (retrato editorial, clásico en un puerto de montaña, dragón en la tormenta, ciudad cyberpunk…) para cargar con un toque desde la portada o el constructor y retocar. Se pueden deshacer.
- **Retoque del prompt final:** edítalo a mano, púlelo con tu IA («Pulir con IA», con tu propia clave) o compara dos variantes con las diferencias marcadas.
- **Aleatorio coherente:** cada tirada tiene un ánimo (suave, neutro o intenso) y no mezcla rasgos de tonos opuestos. Con varios sujetos, eliges a cuál se aplican los atributos (rostro, peinado…).
- **Nivel de detalle** conciso o detallado, y modo «Calidad máxima».
- **Acordeón por sección** con resumen de lo elegido, contador y búsqueda instantánea (atajo `/`).
- **Coherencia automática:** familias de secciones que describen el mismo concepto (no te deja acabar con dos colores de pelo), avisos de compatibilidad y de redundancia, y exclusiones entre contenido adulto y personajes menores o de aspecto joven.
- **Aleatorio** con bloqueo de secciones, **presets/recetas**, **biblioteca** de prompts guardados y **enlaces compartibles** con la selección en la URL.
- **Asistente de ideas local** que interpreta una descripción en español y propone opciones del catálogo, sin enviar nada fuera.
- **IA opcional con tu propia clave:** OpenRouter, OpenAI, Anthropic o Google Gemini, llamados directamente desde el navegador.
- **PWA:** instalable, con service worker y manifiesto.
- **SEO y accesibilidad:** páginas generadas con metadatos, Open Graph y JSON-LD; HTML semántico, `aria-*`, foco visible y `prefers-reduced-motion`.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Cliente | HTML5, CSS3 en capas (`tokens → base → layout → components`), JavaScript con módulos ES nativos |
| Generación del sitio | Scripts de Node.js (≥ 20) sin dependencias: validan los datos y generan catálogo, páginas, sitemap y manifiesto |
| Pruebas | `node:test` (unitarias) y pruebas end-to-end con Chrome/Edge sin cabeza |
| Autenticación | Node.js + [`@simplewebauthn/server`](https://simplewebauthn.dev/) (cuenta con contraseña y passkeys opcionales) |
| Servidor | Nginx (sitio estático + `auth_request`), systemd |
| CI/CD | GitHub Actions (`npm run check` y despliegue por SSH) |

> El frontend **no tiene dependencias npm**. La única dependencia del proyecto es la del servicio de autenticación (`auth/`), que solo se instala en el servidor.

## Uso

### Construir un prompt

1. Entra en **Generadores** y abre uno (por ejemplo, *Personajes femeninos* o *Coches*).
2. Despliega las secciones y elige opciones. Algunas son de **elige una** y otras de **selección múltiple**. El buscador filtra las opciones y abre las secciones con resultados.
3. Mezcla otros generadores si quieres: *Escenarios*, *Clima*, *Fotografía*… Cada uno aporta su parte al mismo prompt.
4. Abre **Mi prompt** (o el **Constructor**) para ver el resultado, cambiar de formato y ajustar el nivel de detalle.
5. Copia el prompt y pégalo en tu generador de imágenes.

### Atajos y herramientas

| Acción | Cómo |
|---|---|
| Buscar en el generador | Pulsa `/` |
| Plegar o desplegar todas las secciones | Botón **Desplegar todo / Plegar todo** |
| Fijar una sección | Icono del candado: «Aleatorio» no la cambiará |
| Vaciar una sección | Icono ✕ de su cabecera |
| Compartir una selección | Copia el enlace del constructor: la selección va en la URL |
| Guardar un prompt | Biblioteca, desde el constructor |

### Conectar una IA (opcional)

En **Constructor → Configurar IA** elige el proveedor, introduce tu clave y selecciona un modelo. La clave se guarda solo en tu navegador. Sin IA activada, todo funciona igualmente con el asistente local.

## Desarrollo local

Requisitos: **Node.js 20 o superior** (CI usa Node 22). Para las pruebas end-to-end, Chrome o Edge.

```bash
git clone https://github.com/DavidJLlanes/Generador-de-Prompts.git
cd Generador-de-Prompts
npm run dev          # http://localhost:5173/prompt/
```

No hay `npm install` para el frontend. El sitio se publica bajo la ruta `/prompt` (definida en `assets/js/core/site-path.js`), de ahí la URL local.

### Flujo de trabajo

El contenido vive en `data/domains/*.js`; todo lo demás se **deriva** de él. Después de tocar datos o plantillas:

```bash
npm run check        # validar datos + regenerar páginas + pasar los tests
```

y haz commit **incluyendo los archivos generados** (`data/catalog.js`, páginas HTML, sitemap…). Están versionados a propósito para que el servidor no necesite Node, y la CI falla si quedan desactualizados.

## Estructura del proyecto

```text
├── data/                 Fuente de verdad: dominios, catálogos, presets, familias, exclusiones
│   ├── domains/          Un archivo por generador (28)
│   └── catalogs/         Secciones compartidas (poses, vestuario)
├── assets/
│   ├── js/core/          Lógica pura: compositor, formatos, aleatorio, esquema, store, IA
│   ├── js/ui/            Componentes de interfaz (acordeón de opciones, dock, paneles)
│   ├── js/pages/         Punto de entrada de cada tipo de página
│   └── css/              tokens → base → layout → components
├── scripts/              Validación, build, servidor de desarrollo, auditoría de accesibilidad
├── auth/                 Servicio de acceso (cuenta + passkeys) para el despliegue privado
├── deploy/               Ejemplo de Nginx y unidad de systemd
├── e2e/                  Pruebas de navegador (suites numeradas)
├── tests/                Pruebas unitarias con node:test
├── docs/                 Arquitectura, esquema de datos, cómo añadir contenido, despliegue
├── generadores/ · constructor/ · guias/ · legal/    Páginas HTML generadas
└── .github/workflows/    CI y despliegue
```

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor estático de desarrollo en `localhost:5173/prompt/` |
| `npm run validate` | Valida los datos contra el esquema |
| `npm run build` | Genera catálogo, páginas, sitemap, robots y manifiesto |
| `npm test` | Pruebas unitarias (`node:test`) |
| `npm run check` | `validate` + `build` + `test` |
| `npm run test:e2e` | Pruebas de extremo a extremo en Chrome/Edge sin cabeza |
| `npm run audit:data` | Auditoría de calidad de los datos: duplicados, mayúsculas, inglés sospechoso |
| `npm run audit:a11y` | Auditoría de accesibilidad con axe-core (`npm i -D axe-core` o `AXE_PATH`) |
| `npm run og` | Genera las imágenes Open Graph |

## Despliegue en un VPS

El sitio se sirve como **archivos estáticos con Nginx** y se protege con un pequeño servicio de autenticación (`auth/`) detrás de `auth_request`. La guía completa está en [`docs/DEPLOY.md`](docs/DEPLOY.md); este es el resumen.

**Requisitos del servidor:** Nginx con HTTPS, Node.js ≥ 20, systemd y Git.

### 1. Clonar el sitio

```bash
git clone https://github.com/DavidJLlanes/Generador-de-Prompts.git /var/www/djl.com.es/prompt
```

> Si cambias el dominio o la ruta, actualiza `BASE_PATH` en `assets/js/core/site-path.js`, regenera con `npm run check` y revisa las rutas de `deploy/nginx.conf.example` y `deploy/lumen-prompt-auth.service`.

### 2. Servicio de autenticación

```bash
cd /var/www/djl.com.es/prompt/auth
sudo npm ci --omit=dev
sudo install -d -o www-data -g www-data -m 700 /var/lib/lumen-prompt
sudo cp ../deploy/lumen-prompt-auth.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now lumen-prompt-auth
```

En el primer arranque se crea la cuenta y una contraseña temporal aleatoria. Léela una sola vez en los registros y cámbiala en `/prompt/enroll`:

```bash
sudo journalctl -u lumen-prompt-auth -n 40 --no-pager
```

La sesión dura 30 días y las passkeys son opcionales. Variables del servicio (en la unidad de systemd): `AUTH_HOST`, `AUTH_PORT` (por defecto `4011`), `RP_ID`, `RP_ORIGIN` y `DATA_DIR`.

### 3. Nginx

Copia las ubicaciones de [`deploy/nginx.conf.example`](deploy/nginx.conf.example) dentro del bloque HTTPS de tu dominio, y valida:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Puntos a tener en cuenta:

- Las ubicaciones de login y registro deben incluir `proxy_set_header X-Real-IP $remote_addr;` para limitar los intentos fallidos por IP.
- Si tu dominio aplica una **CSP**, `connect-src` debe permitir `'self'` y los proveedores de IA que uses: `https://openrouter.ai`, `https://api.openai.com`, `https://api.anthropic.com` y `https://generativelanguage.googleapis.com`.
- Las carpetas internas (`docs`, `deploy`, `scripts`, `tests`, `e2e`, `node_modules`) ya quedan denegadas en el ejemplo.

### 4. Actualizar

```bash
git -C /var/www/djl.com.es/prompt pull --ff-only origin main
sudo systemctl restart lumen-prompt-auth    # solo si cambió auth/
```

Como las páginas generadas están versionadas, **el servidor no necesita Node para servir el sitio**, solo para el servicio de autenticación.

## Integración continua

El flujo [`check.yml`](.github/workflows/check.yml) se ejecuta en cada push a `main` y en cada pull request:

1. **`check`**: ejecuta `npm run check` con Node 22 y falla si `npm run build` deja archivos sin versionar (generados desactualizados).
2. **`deploy`** (solo en `main`): se conecta por SSH al VPS y ejecuta `git pull --ff-only`.

El despliegue automático se activa creando estos secretos del repositorio. Sin ellos, el paso se omite y solo se valida:

| Secreto | Contenido |
|---|---|
| `VPS_HOST` | Host o IP del servidor |
| `VPS_USER` | Usuario SSH de despliegue |
| `VPS_SSH_KEY` | Clave privada de despliegue |
| `VPS_KNOWN_HOSTS` | Huella del servidor (`ssh-keyscan`) |

Se recomienda una clave dedicada con comando forzado en `authorized_keys` (detalle en [`docs/DEPLOY.md`](docs/DEPLOY.md)).

## Seguridad y privacidad

- **Sin IA activada, nada sale del navegador.** Las selecciones y los prompts viven en `localStorage`.
- **Las claves de IA** se guardan solo en tu navegador y se envían directamente al proveedor cuando pides una función de IA. No pasan por el servidor de Generador de Prompts ni se incluyen en el repositorio. Usa claves con límite de gasto.
- Las respuestas del modelo se tratan como **datos**: solo se aceptan IDs presentes en el catálogo, que el cliente vuelve a validar, y las sugerencias nunca se seleccionan solas.
- La **CSP** limita las conexiones salientes a los cuatro proveedores admitidos.
- El acceso al despliegue privado usa sesión con cookie, contraseña con `scrypt`, límite de intentos por IP y passkeys WebAuthn opcionales.

## Política de contenido

La web es pública. Se admite moda y estética adulta de buen gusto **solo para personajes adultos**; un sistema de exclusiones impide combinarla con menores o con personajes de aspecto joven, y los generadores afectados muestran un aviso de mayoría de edad. No se publican desnudez, contenido sexual explícito ni referencias a autolesión. Detalle completo en [`docs/CONTENT-POLICY.md`](docs/CONTENT-POLICY.md).

## Documentación

| Documento | Contenido |
|---|---|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Principios, flujo de datos, compositor, formatos, familias y decisiones |
| [`docs/DATA-SCHEMA.md`](docs/DATA-SCHEMA.md) | Esquema de los archivos de datos |
| [`docs/ADDING-CONTENT.md`](docs/ADDING-CONTENT.md) | Cómo añadir opciones, secciones y generadores |
| [`docs/CONTENT-POLICY.md`](docs/CONTENT-POLICY.md) | Qué se admite, qué no y cómo se bloquea |
| [`docs/DEPLOY.md`](docs/DEPLOY.md) | Despliegue y actualización en el VPS |
| [`pendiente.md`](pendiente.md) | Tareas aplazadas y decisiones abiertas |

## Licencia

Todos los derechos reservados © David Jiménez Llanes. El código y los datos se publican para consulta; no se concede licencia de reutilización. Para cualquier uso distinto, contacta con el autor.
