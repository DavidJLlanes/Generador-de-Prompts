# Cómo añadir contenido

Todo el contenido se añade editando archivos de `data/`. Después, siempre:

```bash
npm run check     # valida, regenera las páginas y pasa los tests
```

y se hace commit **incluyendo los archivos generados**.

## 1. Añadir una opción

Abre el dominio (`data/domains/weather.js`), busca la sección y añade una línea:

```js
{"id":"red-sky","es":"Cielo rojo","en":"blood-red sky"},
```

- `id`: kebab-case, único en la sección.
- `es`: lo que ve el usuario. `en`: lo que entra en el prompt.
- Para el modo «Detallado» añade `"rich": "…"` con la descripción larga en inglés.

## 2. Añadir una sección

Añade un objeto al array `sections` del dominio (ver [DATA-SCHEMA.md](DATA-SCHEMA.md)). Elige:

- `mode`: `single` si las opciones son excluyentes (una edad), `multi` si se pueden sumar (efectos).
- `slot`: solo si debe ir a otra ranura que la de su dominio.
- `chance: 0` si no quieres que «Aleatorio» la toque.

## 3. Añadir un generador nuevo

1. Crea `data/domains/<id>.js` (el nombre del archivo **debe** coincidir con el `id`). Copia la estructura de un dominio pequeño, p. ej. `weather.js`.
2. Elige `role` (la ranura) y un `order` dentro de su rango.
3. Pon un `slug` en español (será la URL) y `meta.title`, `meta.summary` (SEO) y `meta.intro`.
4. `npm run check`. El build crea la página, la tarjeta del catálogo, el pie y el sitemap; el validador y los tests te dirán qué falta.
5. Si el generador debe sugerirse al lado de otros, añádelo a `RELATED` en `scripts/pages/shared.mjs`.

No hay que tocar ningún otro archivo: la interfaz, el compositor y los formatos funcionan con cualquier dominio válido.

## 4. Añadir ideas (presets)

Añade entradas a `data/presets/<dominio>.js`. Cada una necesita un `n` único y un `sel` con ids que existan. Una idea con título propio lleva `es`; las combinaciones lo componen solas. Si un dominio tiene presets, su página muestra el botón de la galería.

## 5. Añadir un formato de salida

1. Crea `assets/js/core/formats/<nombre>.js` exportando `(composed, state) => ({ id, blocks: [{title, text}], text })`.
2. Regístralo en `assets/js/core/formats/index.js` con su etiqueta y su ayuda.
3. Añade un test en `tests/engine.test.mjs`.

Las pestañas del panel «Mi prompt» se generan solas a partir de esa lista.

## 6. Añadir una proporción

Añádela a `ASPECTS` en `data/aspects.js` con su `kind`; la nota de composición en inglés se toma de `ASPECT_NOTES`.

## 7. Cómo escribir buenas opciones

- **Una idea por opción.** «hair in a loose braid», no «braid, red, long, wet».
- **`en` reutilizable:** debe funcionar junto a cualquier otra pieza. Evita referencias a otras opciones («the same as above»).
- **`rich` concreto:** materiales, luz, escala y detalles visibles; sin adjetivos vacíos («beautiful», «amazing»).
- **Nada de texto dentro de la imagen.** Si hay carteles o libros, di que no son legibles.
- **Etiquetas `es` cortas** (≤ 6 palabras cuando se pueda) y sin punto final.
- **Contenido público:** revisa la [política de contenido](CONTENT-POLICY.md); `npm test` rechaza términos bloqueados.

## 7 bis. Opciones con miniatura

Las opciones pueden llevar `"thumb"` con la ruta a una imagen dentro de `/assets/`; la tarjeta se pinta entonces con la imagen arriba y la etiqueta debajo. Se usa en los dos catálogos con galería:

| Datos | Qué contiene | Miniaturas | Se muestra en |
|---|---|---|---|
| `data/catalogs/poses.js` | 203 poses con nombre en español y prompt en inglés | `assets/img/catalogo/poses/` | Mujer y Personaje avanzado (sección «Pose (galería)») |
| `data/catalogs/vestuario.js` | 1.235 conjuntos completos | `assets/img/catalogo/vestuario/` | Mujer y Personaje avanzado (sección «Conjunto completo (galería)») |

No hay que tocar esos archivos a mano para corregir textos sueltos: el de vestuario se regenera con `node scripts/catalogs/generar-vestuario.mjs <ruta del clon de COSTUME-DB-01>` (el glosario está en `scripts/catalogs/glosario-vestuario.mjs`) y sus miniaturas se copian desde el clon con el mismo comando; las de las poses, con `node scripts/catalogs/importar-poses.mjs <ruta del clon de POSE-DB-01>`. Después, `npm run check`.

Si una opción con miniatura no encuentra su archivo, fallan `npm run validate` y los tests.

## 8. Renombrar o borrar

- **Nunca cambies el `id` de una opción o sección publicada**: rompería enlaces compartidos y selecciones guardadas (los ids desconocidos se ignoran sin error, pero se pierde la selección).
- Para retirar una opción, bórrala. Para corregir su texto, edita `es`, `en` o `rich`.
