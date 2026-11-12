# Arquitectura

## Principios

1. **Los datos mandan.** Todo el contenido vive en `data/domains/*.js`. El código no conoce ningún generador concreto: añadir un generador es añadir un archivo de datos.
2. **Una sola fuente de verdad.** El catálogo, las páginas HTML, el sitemap y los contadores de la web se *derivan* de los datos (`npm run build`); nunca se editan a mano.
3. **Sitio estático y sin servidor.** Todo ocurre en el navegador. El servidor solo sirve archivos: se despliega con `git pull`.
4. **Lógica pura y testeable.** El compositor, los formatos, el aleatorio y el esquema no tocan el DOM y se prueban en Node.
5. **Interfaz en español, prompts en inglés.** Cada opción lleva `es` (lo que se ve) y `en` (lo que se escribe en el prompt).
6. **Sin dependencias.** Ni framework ni paquetes npm: HTML, CSS y módulos ES nativos.

## Flujo de datos

```
 data/domains/*.js ──► scripts/build.mjs ──► data/catalog.js + páginas HTML + sitemap
        │
        │  import() dinámico (solo los dominios que se usan)
        ▼
  core/registry.js ─► core/live.js ◄── core/store.js ◄── clics del usuario (ui/*)
                          │             (selección persistida en localStorage)
                          ▼
                  core/composer.js ──► core/formats/* ──► texto del prompt
                  (ordena por ranuras)   (text · natural · sd · ideogram)
```

## El cruce de generadores

Cada dominio declara un `role` que es una **ranura**; un prompt combinado se compone siempre en este orden, sea cual sea el orden en que el usuario elija:

`subject → attribute → action → setting → atmosphere → technical`

(sujeto, atributos, pose/acción, escenario, atmósfera, técnica y estilo — ver `data/taxonomy.js`).

- Un dominio sin selección **no aporta nada**: no hay ranuras obligatorias. Una «Mujer» sin escenario genera un prompt completo.
- Una sección puede salirse del rol de su dominio con `slot` (p. ej. el «Estilo» de «Escenarios» va a `technical`).
- El **estado es global** (`core/store.js`, clave `lv:v1:workspace` en `localStorage`): la selección sobrevive entre páginas, de modo que se puede ir de «Mujer» a «Escenarios» a «Clima» construyendo un único prompt. El dock «Mi prompt» y el constructor lo muestran en cualquier página.

### Compositor (`core/composer.js`)

Función pura `compose(domains, state)`. Pasos:

1. Recorre las selecciones de cada dominio cargado y las convierte en *piezas* `{slot, domain, section, option, text, short, es}`. Los ids obsoletos (tras editar datos) se ignoran.
2. Aplica las **reglas** del dominio (`rules`): p. ej. si el motivo es una miniatura se añade una frase de integración con el ambiente.
3. Si «Calidad máxima» está activa y el usuario no ha elegido nada a mano, añade el acabado y los negativos de `photo`.
4. Ordena por `[ranura, orden de dominio, orden de sección, orden de elección]`, elimina textos repetidos y calcula el *lead* («a woman») fundiéndolo con la primera pieza si esta ya nombra al sujeto.

### Formatos de salida (`core/formats/`)

Presentan las piezas; no deciden nada del contenido. Cada formato es un módulo `(composed, state) → {id, blocks, text}` registrado en `formats/index.js`; la interfaz construye las pestañas a partir de esa lista.

| Formato | Salida |
|---|---|
| `text` | Texto continuo: etiquetas cortas en una frase y cada descripción larga como oración propia |
| `natural` | Bloques por ranura (Subject, Setting…) para ChatGPT/Gemini |
| `sd` | Prompt positivo y negativo por separado + tamaño sugerido (≈1 Mpx, múltiplos de 64) |
| `ideogram` | JSON estructurado (descripción, estilo, composición, paletas deducidas) |

### Nivel de detalle

Cada opción tiene un texto corto `en` y, opcionalmente, uno largo `rich`. «Detallado» usa `rich` cuando existe; «Conciso» usa siempre `en` (y Stable Diffusion también, por el límite de tokens).

## Dominios compartidos

Los generadores originales repetían las mismas secciones de cámara y estilo (en 9-12 variantes distintas) y las mismas poses y localizaciones repetidas. Se unificaron en tres dominios reutilizables:

- **`photo`** (técnica): composición, perspectiva, objetivo, profundidad de campo, cámara, iluminación, atmósfera, etalonaje, estilo, calidad, acabado de calidad y negativos.
- **`poses`** (acción) y **`locations`** (escenario): bibliotecas con descripción detallada de cada elemento.

### Catálogos con miniatura

`data/catalogs/poses.js` y `data/catalogs/vestuario.js` exportan **secciones completas** que `woman` y `girl` añaden a las suyas con `.concat(...)`. Así el mismo contenido sirve a los dos generadores sin duplicar datos, y cada uno declara sus `conflicts` (elegir un conjunto completo vacía las prendas sueltas; elegir una pose de la galería vacía la pose por piezas).

Las secciones llevan `slot` propio (`action` para las poses, `attribute` para el conjunto), de modo que el compositor las ordena en su sitio aunque vivan en un dominio de sujeto. Las opciones con `thumb` se pintan como tarjetas con imagen (`assets/js/ui/option-browser.js`), con `loading="lazy"` y dentro de subgrupos plegados: las 1.438 miniaturas no se descargan hasta que se abre el grupo.

### Familias de secciones

Varios generadores describen el mismo rasgo: Mujer trae pelo, rostro y vestuario; Peinados, Rostros, Anatomía y Accesorios los desarrollan aparte. Al cruzarlos se podía acabar con dos colores de pelo o dos conjuntos en el mismo prompt.

`data/families.js` agrupa las secciones que son **el mismo concepto** y `assets/js/core/families.js` lo aplica en tres sitios:

- **Al elegir** (`store.toggleOption`): se vacían las secciones hermanas de la familia, estén en el generador que estén, y la interfaz avisa de qué se quitó y por qué.
- **Al entrar una selección ya hecha** (`enforce`, usado por enlaces compartidos, guardados, recetas y `localStorage`): se queda la primera sección de cada familia y se descartan las demás.
- **En «Aleatorio»**: como pasa por `enforce`, nunca deja dos secciones del mismo concepto.

La sección lo anuncia en su cabecera («Mismo concepto (color del pelo) que Peinados…»). Una sección solo puede estar en una familia y `npm run validate` falla si alguna no existe o está repetida. No se meten en la misma familia dos secciones complementarias (tipo de prenda y color de esa prenda), solo las que compiten por el mismo eje.

## Páginas y SEO

Las páginas son HTML generado (`scripts/pages/*.mjs`) con `<title>`, descripción, canonical, Open Graph y JSON-LD propios; el contenido interactivo lo monta el JavaScript. Cada generador tiene su URL en español (`/generadores/mujer/`). Cabecera y pie salen de una única plantilla (`scripts/pages/layout.mjs`).

## Interfaz

- **CSS** en capas: `tokens` (variables) → `base` → `layout` → `components/*`. Un solo acento (dorado), tema oscuro cálido, tipografías propias (Instrument Serif, Inter, JetBrains Mono).
- **JS de interfaz** con un `h()` mínimo (hyperscript) y delegación de eventos; sin framework.
- **Secciones como acordeón** (`ui/option-browser.js`): cada sección de un generador es una tarjeta plegable cuya cabecera muestra el nº de opciones y un resumen de lo elegido; en escritorio las cerradas se reparten en dos columnas y las abiertas ocupan todo el ancho. Solo la primera sección empieza abierta. Lo que el usuario despliega se recuerda por generador en `localStorage` (`lv:v1:open:<dominio>`); la búsqueda abre temporalmente las secciones con resultados sin modificar lo guardado, y los enlaces de la navegación (`#sec-…`) abren su sección. El botón «Desplegar todo / Plegar todo» está en la barra del generador.
- **Rendimiento:** cada página importa solo los dominios que necesita; los paneles de opciones usan `content-visibility: auto`; las 1.000 ideas se cargan solo al abrir la galería.
- **Accesibilidad:** HTML semántico, `aria-pressed` en opciones, `aria-expanded`/`aria-controls` en las cabeceras de sección, foco visible, `prefers-reduced-motion`, atajo `/` para buscar.

## Seguridad

Sin cookies, sin terceros y sin ejecución de contenido de usuario (todo se escapa o se crea con `createTextNode`). CSP estricta recomendada y probada en desarrollo (`scripts/dev-server.mjs` envía las mismas cabeceras que `deploy/nginx.conf.example`).

## Decisiones y alternativas descartadas

| Decisión | Motivo |
|---|---|
| Módulos ES nativos, sin bundler | Despliegue con `git pull`, cero dependencias y depuración directa |
| Datos como `.js` y no `.json` | Se pueden importar de forma nativa y admiten comentarios |
| Un archivo por dominio con carga bajo demanda | Cada página descarga solo lo que usa (≈30–110 KB por dominio) |
| Estado global en `localStorage` | Es lo que hace posible el cruce entre páginas sin servidor |
| Artefactos generados versionados en git | El servidor no necesita Node |
