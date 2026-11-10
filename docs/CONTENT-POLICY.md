# Política de contenido

La web es **pública y para todos los públicos**: no se admite contenido sexual explícito ni sugerente.

## Qué no se publica

- Desnudez, contenido sexual explícito o erótico, lencería/«boudoir» y expresiones o poses concebidas para resultar seductoras.
- Selectores de partes del cuerpo con intención sexualizadora (p. ej. tallas de busto).
- Referencias a autolesión o suicidio.

## Qué se hizo con el contenido heredado

Al migrar los generadores del sitio anterior se **excluyó por completo** la sección NSFW y se auditó el resto (≈18.000 textos). Se **apartaron 119 elementos** (68 de los generadores originales y 51 de «Personaje avanzado»), sin borrarlos del equipo del titular:

| Motivo | Elementos |
|---|---|
| Sección de tallas de busto (`woman`) | 19 |
| Lencería, «boudoir» y similares; expresiones «sensual/erótico/seductor»; niveles explícitos de una sección de escenas | 46 |
| Autolesión / suicidio | 2 |
| Poses sugerentes | 1 |
| «Personaje avanzado»: tallas de busto (26), prendas íntimas, lencería y fetichistas, y el tejido «latex» (25) | 51 |

La lista completa está en `new-held-content.json`, **fuera de este repositorio** (en la carpeta de trabajo local) y no debe subirse nunca. Si algún elemento retenido se considera aceptable, puede reincorporarse a mano a su dominio.

### Contenido que no se pudo trasladar

- **Campos de texto libre** de «Personaje avanzado» («Detalle extra de identidad» y «Añadir texto personalizado al prompt»): el constructor trabaja con opciones, no con texto escrito a mano.
- **Rótulos de texto dentro de la imagen** de los coches (p. ej. «collector series no. 12 of 500» o la insignia de versión): se omiten a propósito para que las imágenes no lleven texto.
- **Nombres de estilo en español** que el generador de coches original incrustaba por error en 100 plantillas de ilustración: se eliminaron.

### Criterios dudosos que se dejaron

Se mantuvieron por no ser explícitos: corsés como prenda de vestir, estética «pin-up», ropa deportiva, la palabra «nude» como color (labios, uñas, beige) y la etiqueta «Tensión sexual no resuelta» (tópico romántico cuyo prompt en inglés es «unresolved tension»). Revísalos si quieres una política más estricta.

## Cómo se vigila

`npm test` ejecuta `tests/data.test.mjs`, que **falla** si un prompt (`en`, `rich`, `name`) contiene términos bloqueados o una etiqueta en español contiene términos explícitos. También comprueba que los prompts estén en inglés. Para endurecer o ampliar la lista, edita las expresiones `BLOCKED_PROMPT` y `BLOCKED_LABEL` en ese archivo.

## Al añadir contenido nuevo

1. Si dudas de una opción, no la añadas.
2. Ejecuta `npm run check`.
3. No incluyas texto que deba aparecer dentro de la imagen, nombres de personas reales ni marcas registradas que no sean de dominio público cultural (los personajes animados ya existentes se mantienen como referencia estilística).
