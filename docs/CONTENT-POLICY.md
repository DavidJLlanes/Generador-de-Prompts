# Política de contenido

La web es **pública**. Se admite moda y estética adulta de buen gusto (lencería, boudoir elegante, busto, látex) **únicamente en los generadores de personajes adultos**; el contenido explícito no se admite en ninguna parte.

## Qué no se publica (en ningún generador)

- Desnudez, contenido sexual explícito o pornográfico, y niveles «explícitos» de cualquier sección.
- Referencias a autolesión o suicidio.
- Material que sexualice a menores o a personajes que puedan parecerlo.

## Qué se admite, y solo dónde

| Contenido | Dónde |
|---|---|
| Lencería, boudoir «de catálogo», corsés, ligueros, látex, tallas de busto, mirada seductora | **Mujer** (`woman`) y **Personaje avanzado** (`girl`, 18 a 80 años) |
| Poses elegantes del grupo «Sensuales y sexys · elegante» y una localización de ducha tropical | Poses y Localizaciones (descripciones sobrias y sin desnudez) |

**Por qué solo ahí:** `woman` y `girl` solo admiten edades adultas. El resto de generadores (personajes animados, rostros, fotografía, escenas, magia…) se combinan con sujetos que pueden ser jóvenes o ambiguos, así que no llevan moda íntima, busto ni etiquetas sensuales. Un test lo comprueba (ver más abajo).

## Contenido que se mantiene fuera

Del contenido apartado al migrar el sitio anterior (127 elementos) se reincorporó el de `woman`, `girl` y unas pocas poses y localizaciones. **Sigue fuera** (están en `new-held-content.json`, fuera del repositorio, y no debe subirse nunca):

| Contenido | Motivo |
|---|---|
| Lencería, vestuario sugerente y personajes sugerentes de «Personajes animados» (p. ej. Ann de Persona 5) | Muchos personajes animados son menores o lo parecen |
| Expresiones y atmósferas «sensual/erótico» de Rostros y Fotografía | Son transversales: se cruzan con cualquier sujeto |
| «Sexo implícito», «Sexo explícito gráfico» y «Desnudez vulnerabilidad» de Escenas | Contenido explícito |
| «Suicidio contemplativo» (Escenas) y «Casi suicida» (Magia) | Autolesión |

Si quieres reincorporar alguno, debe ir solo a un generador de adultos y pasar los tests.

### Contenido que no se pudo trasladar

- **Campos de texto libre** de «Personaje avanzado» («Detalle extra de identidad» y «Añadir texto personalizado al prompt»): el constructor trabaja con opciones, no con texto escrito a mano. (El texto libre del panel «Mi prompt» cubre ese caso.)
- **Rótulos de texto dentro de la imagen** de los coches (p. ej. «collector series no. 12 of 500» o la insignia de versión): se omiten a propósito para que las imágenes no lleven texto.
- **Nombres de estilo en español** que el generador de coches original incrustaba por error en 100 plantillas de ilustración: se eliminaron.

### Criterios dudosos que se dejaron

Estética «pin-up», ropa deportiva y la palabra «nude» como color (labios, uñas, beige). La etiqueta «Tensión sexual no resuelta» se eliminó.

## Cómo se vigila

`npm test` ejecuta `tests/data.test.mjs`, que **falla** si:

1. un prompt (`en`, `rich`, `name`) o una etiqueta contiene términos explícitos en **cualquier** generador (`BLOCKED_PROMPT`, `BLOCKED_LABEL`);
2. aparece lencería, boudoir, busto, látex u otros términos de moda íntima **fuera** de `woman` y `girl` (`ADULT_ONLY_PROMPT`);
3. un generador de adultos ofrece una edad menor de 18 años.

También comprueba que los prompts estén en inglés. Para endurecer o ampliar las listas, edita esas expresiones en el archivo.

## Al añadir contenido nuevo

1. Si dudas de una opción, no la añadas.
2. El contenido íntimo o sensual solo va en un generador de adultos, en clave elegante y sin desnudez.
3. Ejecuta `npm run check`.
4. No incluyas texto que deba aparecer dentro de la imagen, nombres de personas reales ni marcas registradas que no sean de dominio público cultural (los personajes animados ya existentes se mantienen como referencia estilística).
