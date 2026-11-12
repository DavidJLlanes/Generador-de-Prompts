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

## 2. Miniaturas y galería de resultados

**Por qué:** es lo que más cambiaría la experiencia: ver cómo queda cada estilo, escena, época o pose *antes* de elegirlo, y que la portada enseñe resultados reales.

**Estado:** hecho a medias. Las opciones ya admiten `"thumb"` y el navegador las pinta como tarjetas con imagen (ver `docs/ADDING-CONTENT.md` §7 bis); lo usan la galería de poses y la de conjuntos de Mujer y Personaje avanzado. Falta el resto de generadores.

**Plan**
- Generar una imagen por opción relevante (empezando por `photo/style`, `scenarios`, `girl/era` y poses) con un modelo local; el sitio anterior ya tenía scripts para ComfyUI que sirven de base.
- **Solo contenido apto para todos los públicos**, coherente con `docs/CONTENT-POLICY.md`.
- Formato WebP, ~400 px, cargadas bajo demanda (`loading="lazy"`) y servidas desde `assets/img/`.
- Una galería de resultados en la portada, con el prompt que generó cada imagen.

**Ojo con el peso:** miles de miniaturas inflan el repositorio. Empezar por unas cientos y valorar Git LFS o un directorio aparte servido por nginx. Las 1.438 actuales (poses y conjuntos) ocupan unos 13 MB.

---

## Decisiones abiertas

| Tema | Qué hay que decidir |
|---|---|
| **Contenido que sigue retenido** | Sexo implícito/explícito, desnudez, autolesión y Ann (Persona 5). Ver `docs/CONTENT-POLICY.md`. |
| **Páginas legales** | Se actualizaron (sin licencia de reutilización, datos guardados en el navegador), pero conviene que las revise un profesional antes de publicar. |
| **nginx** | `deploy/nginx.conf.example` no se ha probado en un servidor real. Primer `nginx -t` en el VPS. |

---

## Para activar cuando toque

- **Despliegue automático:** el flujo `.github/workflows/check.yml` ya está; falta crear los 4 secretos (`VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_KNOWN_HOSTS`) siguiendo `docs/DEPLOY.md` §6. Hasta entonces solo valida; no despliega.
- **Lista de personajes adultos:** `ADULT_CHARACTERS` en `data/exclusions.js` es prudente (unas 110 de 305). Ampliarla personaje a personaje, comprobando la edad en su obra, da más opciones de lencería en Personajes animados.
- **Verificación de edad real:** hoy es una confirmación declarativa («Soy mayor de 18 años»). Una verificación de verdad exigiría un servicio externo.
