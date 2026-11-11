# Política de contenido

La web es **pública**. Se admite moda y estética adulta de buen gusto (lencería, boudoir elegante, busto, látex, poses y atmósferas sensuales) **solo para personajes adultos**, y un sistema de bloqueos (ver «Exclusiones») impide combinarla con menores o con personajes de aspecto joven. El contenido explícito y la autolesión no se admiten en ninguna parte.

## Qué no se publica (en ningún generador)

- Desnudez, contenido sexual explícito o pornográfico, y niveles «explícitos» de cualquier sección («Sexo implícito», «Sexo explícito gráfico», «Desnudez vulnerabilidad»).
- Referencias a autolesión o suicidio («Suicidio contemplativo», «Casi suicida»).
- Material que sexualice a menores o a personajes que puedan parecerlo.
- Ann (Persona 5): es una estudiante de instituto y su elemento era un traje de látex. No se reincorpora.

## Qué se admite: etiqueta `adult-only`

Las opciones de moda íntima y tono sensual llevan la etiqueta **`adult-only`**:

| Dónde | Qué |
|---|---|
| **Mujer** (`woman`) | Sección «Busto», lencería y ropa interior, estilos «sexy elegante», látex, «Seductora», ojos «sensuales» |
| **Personaje avanzado** (`girl`, 18 a 80 años) | «Cuerpo · Busto», prendas íntimas, látex, mirada seductora, «fotografía boudoir» |
| **Personajes animados** | Lencería y corsés de vestuario; EVA (Metal Gear) |
| **Rostros** | Boca «Sensual seductora», expresión «Placer sensual» |
| **Fotografía** | Atmósfera «Sensual erótico», estilo «Boudoir elegante» |
| **Poses / Localizaciones** | Grupo «Sensuales y sexys · elegante» y la ducha de lluvia tropical |

## Exclusiones: cómo se bloquea la combinación con menores

Todo vive en `data/exclusions.js` (reglas y etiquetas) y se aplica en `assets/js/core/exclusions.js`.

- **Menores** (`minor`): bebé, niño y adolescente de Rostros y Anatomía, cabello de bebé/niño/adolescente y las versiones «niña pequeña» y «adolescente» de los personajes animados.
- **Aspecto joven** (`youthful`): «aparente más joven», «boyish/girlish young», «cara aniñada» y **todos los personajes animados que no estén verificados como adultos** (hay una lista cerrada de adultos en `ADULT_CHARACTERS`; el resto se bloquea por defecto, porque muchos son menores o lo parecen).

Reglas de seguridad:

1. `adult-only` ⊥ `minor` / `youthful`. Con un menor o un personaje de aspecto joven elegido, el contenido adulto queda **bloqueado** (y al revés).
2. Mujer, Hombre y Personaje avanzado ⊥ `minor`: con la edad de un niño elegida, esos tres generadores quedan **bloqueados** enteros (y con uno de ellos elegido no se puede elegir un niño).

Qué significa «bloqueado»: la opción se ve atenuada y con borde discontinuo, no se puede elegir y al pulsarla un aviso explica el motivo; la sección muestra un aviso («Sección bloqueada: …»).

**Cuatro barreras**, para que ninguna vía lo salte:
1. La interfaz deshabilita las opciones.
2. El almacén (`store`) rechaza elegir una opción bloqueada y **descarta** el contenido adulto de cualquier selección que llegue ya hecha (enlace compartido, receta, guardado, `localStorage`).
3. «Aleatorio» nunca deja un par incompatible.
4. El compositor vuelve a aplicarlo antes de generar el texto: aunque llegue una selección manipulada, el prompt no sale con el par.

Fuera del contenido adulto, las mismas reglas bloquean también incompatibilidades lógicas: día/noche, frío/calor (nieve, hielo) y rostro masculino con Mujer / rostro femenino con Hombre.

## Cómo se vigila

`npm test` ejecuta:

- `tests/data.test.mjs` → **falla** si un prompt contiene términos explícitos (en cualquier generador); si algo de moda íntima, busto, látex o tono sensual no lleva `adult-only`; y si los generadores de adultos ofrecen una edad menor de 18.
- `tests/exclusions.test.mjs` → comprueba los bloqueos en ambos sentidos, la lista de personajes adultos, el almacén, el compositor, 300 «Aleatorio» sin pares incompatibles y que ninguna receta o idea mezcle opciones incompatibles. También verifica que `data/tag-index.js` está al día (`npm run build`).
- `e2e/suites/05-exclusiones.mjs` → lo mismo, en el navegador.

## Al añadir contenido nuevo

1. Si dudas de una opción, no la añadas.
2. Moda íntima o tono sensual: ponle `"tags": ["adult-only"]` (o añádela a `TAGGING`) y solo en clave elegante y sin desnudez; el test lo exige.
3. Un personaje animado nuevo está bloqueado por defecto para contenido adulto. Para permitirlo, comprueba que es adulto en su obra y añádelo a `ADULT_CHARACTERS`.
4. Una opción que represente a un menor debe llevar `minor` (en `TAGGING`).
5. Ejecuta `npm run check`.
6. No incluyas texto que deba aparecer dentro de la imagen, nombres de personas reales ni marcas registradas que no sean de dominio público cultural.

### Contenido que no se pudo trasladar

- **Campos de texto libre** de «Personaje avanzado»: el constructor trabaja con opciones (el texto libre del panel «Mi prompt» lo cubre). Ese texto libre **no se filtra**: lo escribe la persona usuaria.
- **Rótulos de texto dentro de la imagen** de los coches y los **nombres de estilo en español** que el generador original incrustaba por error: se omitieron.
