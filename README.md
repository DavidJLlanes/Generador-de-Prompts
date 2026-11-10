# Lumen Vitae

Constructor modular de **prompts para imágenes con IA**. La interfaz está en español; los prompts salen siempre en inglés.

- **28 generadores** (personajes, coches, criaturas, vehículos, paisajes, escenarios, clima, efectos, fotografía…), **744 secciones** y **18.751 opciones**.
- **Cruce de generadores:** pon una mujer en un escenario, añade clima y una cámara. Cada ranura es opcional: una mujer sin escenario genera igualmente un prompt completo.
- **1.000 ideas de escenas** (galería buscable), **1.000 coches** (500 míticos y 500 actuales) con 183 escenas fotográficas e ilustradas, y cientos de miles de combinaciones propias.
- **4 formatos de salida:** texto, ChatGPT/Gemini, Stable Diffusion/Flux (positivo + negativo) e Ideogram (JSON).
- Compartir el prompt por enlace, bloquear secciones ante «Aleatorio», nivel de detalle y «Calidad máxima».
- Sitio **estático**: sin servidor de aplicación, sin base de datos, sin cuentas ni cookies.

## Puesta en marcha

Requiere Node 20 o superior **solo para desarrollar** (no hace falta en el servidor).

```bash
npm run dev        # http://localhost:5173  (servidor estático con las cabeceras de producción)
npm run validate   # valida todos los datos contra el esquema
npm run build      # regenera catálogo, páginas HTML, sitemap, robots y manifiesto
npm test           # tests del motor, de los datos y de la política de contenido
npm run check      # validate + build + test (úsalo antes de cada commit)
```

> Los módulos ES y el `import()` dinámico necesitan `http://`; no funcionan abriendo los HTML con doble clic.

## Estructura

```
.
├── index.html, 404.html, sitemap.xml, robots.txt, manifest.webmanifest   ← generados
├── constructor/  generadores/  legal/                                     ← páginas generadas
├── assets/
│   ├── css/        tokens → base → layout → components/*   (main.css los importa)
│   ├── fonts/      tipografías alojadas en el propio sitio
│   ├── img/        iconos y miniatura social
│   └── js/
│       ├── core/   lógica pura: compositor, formatos, aleatorio, esquema, estado
│       ├── ui/     componentes de interfaz (dock, panel, navegador de opciones…)
│       └── pages/  un punto de entrada por tipo de página
├── data/
│   ├── domains/    UN archivo por generador: la fuente de verdad del contenido
│   ├── presets/    combinaciones guardadas (las 1.000 ideas)
│   ├── taxonomy.js ranuras en las que se ordena un prompt cruzado
│   ├── aspects.js  proporciones y su nota de composición
│   └── catalog.js  índice ligero (GENERADO)
├── scripts/        build, validación, servidor de desarrollo y plantillas de página
├── tests/          motor, datos y política de contenido
├── deploy/         configuración de ejemplo para nginx
└── docs/           arquitectura, esquema de datos, guía para añadir contenido y despliegue
```

## Origen del contenido

| Generador | Procede de |
|---|---|
| 22 generadores (mujer, hombre, criaturas, clima…) | Las páginas HTML del sitio anterior, convertidas a datos |
| Fotografía y estilo, Poses, Localizaciones | Secciones repetidas de los anteriores, unificadas |
| Escenarios | Las 1.000 ideas de wallpaper (`index2`), con prompts reescritos en inglés |
| Coches | `full/modules/car`: 1.000 coches y 183 escenas (versión completa; la carpeta `car` solo tenía 33) |
| Personaje avanzado | `girl/data.js`: épocas, culturas, moda, maquillaje, poses y escenarios |

No se migró la sección NSFW. Lo que quedó fuera por la [política de contenido](docs/CONTENT-POLICY.md) o por no ser representable como opción (campos de texto libre) está explicado allí.

## Documentación

| Documento | Para qué sirve |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Cómo está construido y por qué |
| [docs/DATA-SCHEMA.md](docs/DATA-SCHEMA.md) | Formato exacto de los archivos de datos |
| [docs/ADDING-CONTENT.md](docs/ADDING-CONTENT.md) | Añadir opciones, secciones, generadores, formatos e ideas |
| [docs/DEPLOY.md](docs/DEPLOY.md) | Publicar en un VPS con nginx |
| [docs/CONTENT-POLICY.md](docs/CONTENT-POLICY.md) | Qué contenido se admite y cómo se vigila |

## Flujo de trabajo

1. Edita los datos en `data/domains/*.js` (o el código en `assets/`).
2. `npm run check`.
3. Haz commit **incluyendo los archivos generados** (catálogo, páginas, sitemap).
4. En el servidor basta con `git pull`: no se compila nada allí.

## Pendiente de decidir

- **Licencia.** No se ha añadido ninguna; mientras tanto el código queda con todos los derechos reservados.
- **Revisión legal** de las páginas de `/legal/` antes de publicar (el texto es el del sitio anterior, con ajustes técnicos).
