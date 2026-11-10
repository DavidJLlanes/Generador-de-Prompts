# Pendiente

Lo que **no se ha hecho todavía**, para retomarlo cuando toque. Se actualiza a mano: cuando algo se haga, se mueve a `README.md` o a `docs/` y se borra de aquí.

> Estos puntos se dejaron fuera de la tanda de mejoras en curso (coherencia entre secciones y recetas, funciones de usuario, SEO y calidad técnica). El detalle de lo que sí se hizo está en el historial de commits.

---

## 1. Probar los prompts con un generador de imágenes real

**Por qué:** el objetivo de la web es conseguir imágenes de altísima calidad, y hasta ahora todo se ha verificado de forma *estructural* (los textos se componen bien, en inglés y sin marcadores sueltos), **no generando imágenes**.

**Cómo hacerlo**
1. Elegir 10-15 combinaciones variadas: un retrato, un coche con escena, un paisaje con clima, una criatura, una escena de la galería de ideas…
2. Generar cada una en el modelo que más se use (ChatGPT/Gemini, Flux/Stable Diffusion, Ideogram o Midjourney) con el formato correspondiente.
3. Anotar por prompt: ¿respeta el sujeto?, ¿ignora piezas?, ¿el bloque de «Calidad máxima» ayuda o estorba?, ¿se pasa de largo (límite de tokens en Stable Diffusion)?
4. Con eso, ajustar: los textos de `finishing` y `avoid` en `data/domains/photo.js`, los valores por defecto del panel y qué piezas deberían llevar descripción larga (`rich`).

**Resultado esperado:** una lista corta de cambios con evidencia, en lugar de suposiciones.

---

## 3. Despliegue automático con GitHub Actions

**Por qué:** hoy cada publicación exige `git pull` a mano en el VPS y no hay nada que impida subir un cambio que rompa los tests.

**Plan**
- Un flujo `.github/workflows/check.yml` que en cada push y pull request ejecute `npm run check` (validar datos, regenerar páginas, tests).
- Un segundo paso, solo en `main` y solo si el anterior pasa, que entre por SSH al VPS y ejecute `cd /var/www/lumenvitae.es && git pull --ff-only`.
- Guardar la clave SSH de despliegue como *secret* del repositorio (clave dedicada, sin acceso a nada más, con `command=` restringido en `authorized_keys`).
- Comprobar que los archivos generados (catálogo, páginas, sitemap) están al día: si `npm run build` cambia algo, el flujo debe fallar.

**Esbozo**
```yaml
name: check
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm run check
      - run: git diff --exit-code   # los generados deben estar versionados
```

---

## 5. Miniaturas y galería de resultados

**Por qué:** es lo que más cambiaría la experiencia: ver cómo queda cada estilo, escena, época o pose *antes* de elegirlo, y que la portada enseñe resultados reales.

**Plan**
- Generar una imagen por opción relevante (empezando por `photo/style`, `scenarios`, `girl/era`, coches y poses) con un modelo local; el sitio anterior ya tenía scripts para ComfyUI que sirven de base.
- **Solo contenido apto para todos los públicos**, coherente con `docs/CONTENT-POLICY.md`.
- Formato WebP, ~400 px, cargadas bajo demanda (`loading="lazy"`) y servidas desde `assets/img/thumbs/`.
- Datos: un campo opcional `thumb` en cada opción (documentarlo en `docs/DATA-SCHEMA.md`), de modo que las secciones sin imagen sigan funcionando.
- Una galería de resultados en la portada, con el prompt que generó cada imagen.

**Ojo con el peso:** miles de miniaturas inflan el repositorio. Empezar por unas cientos y valorar Git LFS o un directorio aparte servido por nginx.

---

## Decisiones abiertas

| Tema | Qué hay que decidir |
|---|---|
| **Contenido retenido** | 119 elementos apartados por la política de contenido (están en `new-held-content.json`, **fuera del repositorio**). Decidir si se recupera alguno o si se endurece la política. |
| **«Tensión sexual no resuelta»** | Etiqueta dudosa que se dejó (su prompt en inglés es «unresolved tension»). |
| **«Suki»** | Las ideas 81, 82 y 94 asumen que es un gato. Confirmarlo o corregirlo en `data/domains/scenarios.js`. |
| **Licencia** | No hay ninguna: el código queda con todos los derechos reservados. Elegir una (p. ej. MIT para el código y CC BY para el contenido) y añadir `LICENSE`. |
| **Páginas legales** | El texto es el del titular de la web anterior con ajustes técnicos. Conviene una revisión legal antes de publicar. |
| **nginx** | `deploy/nginx.conf.example` no se ha probado en un servidor real. Primer `nginx -t` en el VPS. |
