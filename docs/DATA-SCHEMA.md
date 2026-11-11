# Esquema de datos (v1)

Cada generador es un módulo ES en `data/domains/<id>.js` con una exportación por defecto. El validador (`assets/js/core/schema.js`, ejecutado por `npm run validate` y por los tests) comprueba todo lo descrito aquí.

## Dominio

```js
export default {
  "schema": 1,
  "id": "weather",              // id único, minúsculas y guiones; coincide con el nombre del archivo
  "slug": "clima",              // URL en español: /generadores/clima/
  "role": "atmosphere",         // ranura: subject | attribute | action | setting | atmosphere | technical
  "order": 70,                  // orden entre dominios (menor = antes)
  "lead": "a woman",            // opcional, solo dominios `subject`: sustantivo inicial del prompt
  "meta": {
    "title": "Clima",           // obligatorio
    "short": "Clima",           // nombre corto (menús y pills)
    "kicker": "Atmósfera · Cielo · Precipitación",
    "summary": "…",             // obligatorio: se usa como meta description (SEO)
    "intro": "…"                // texto de la cabecera de la página
  },
  "rules": [ … ],               // opcional, ver «Reglas»
  "sections": [ … ]
};
```

### Orden por rangos recomendados

| Ranura | `order` |
|---|---|
| subject | 10–19 |
| attribute | 30–39 |
| action | 40–49 |
| setting | 50–69 |
| atmosphere | 70–79 |
| technical | 90–99 |

## Sección

```js
{
  "id": "tipo-clima",           // único dentro del dominio
  "title": "Tipo de clima general",
  "note": "…",                  // opcional: texto de ayuda bajo el título
  "mode": "multi",              // "single" (elige una) o "multi" (varias)
  "slot": "technical",          // opcional: sale de la ranura del dominio
  "polarity": "negative",       // opcional: sus opciones van al prompt negativo («Evitar»)
  "foldGroups": true,           // opcional: cada grupo (`groups`) se pinta como subdesplegable
  "chance": 0.6,                // opcional (0–1): probabilidad en «Aleatorio»; 0 = nunca
  "joiner": ", con ",           // opcional: conector al componer el título de una idea guardada
  "groups": [ { "id": "disney", "title": "Disney" } ],   // opcional: subgrupos visuales
  "options": [ … ]
}
```

## Opción

```js
{ "id": "light-fog", "es": "Neblina ligera", "en": "light fog" }
```

| Campo | Obligatorio | Descripción |
|---|---|---|
| `id` | sí | Único dentro de la sección. **No lo cambies** una vez publicado: los enlaces compartidos y las selecciones guardadas lo usan |
| `es` | sí | Etiqueta en español que ve el usuario |
| `en` | sí | Texto corto en inglés que entra en el prompt |
| `rich` | no | Versión larga en inglés para el modo «Detallado» |
| `group` | no | Id de un grupo de la sección |
| `tags` | no | Lista de etiquetas; las usan las reglas (p. ej. `["miniature"]`) |
| `name` | no | Nombre corto en inglés (bibliotecas: poses y localizaciones) |
| `info` | no | Lista de pares `[etiqueta, texto]` en español que se muestra como detalle de la tarjeta |

## Reglas

Añaden una frase al prompt cuando se cumple una condición dentro del propio dominio:

```js
"rules": [{
  "id": "miniature-world",
  "when": { "section": "motivo", "tag": "miniature" },     // o { "section": "...", "option": "id" }
  "add":  { "slot": "setting", "en": "because the subject is a small object or miniature, …" }
}]
```

## Presets

`data/presets/<dominio>.js` exporta una lista ordenada de combinaciones guardadas:

```js
export default [
  { "n": 1,   "es": "Las Médulas bajo la luna roja", "sel": { "ideas": ["idea-001"] } },
  { "n": 103, "sel": { "motivo": ["a-tea-house…"], "ambiente": ["under-a-violet-sky"], "estilo": ["…"] } }
];
```

`sel` es un mapa `sección → ids de opción`. Si falta `es`, el título se compone con las etiquetas de las secciones principales y sus `joiner`. Cada preset debe apuntar a opciones que existan (lo comprueba el validador).

## Estado del usuario (referencia)

Guardado en `localStorage["lv:v1:workspace"]`:

```js
{ v: 1, sel: { [dominio]: { [sección]: [ids…] } }, locks: {…}, detail: "rich"|"short", boost: true, aspect: "9:16", format: "text" }
```

## Reglas de escritura

- **Prompts siempre en inglés** (`en`, `rich`, `name`); **interfaz siempre en español** (`es`, títulos, notas, `info`).
- `en` corto y reutilizable; el detalle largo va en `rich`.
- Nada de texto que deba aparecer *dentro* de la imagen: usa «sin texto legible».
- Respeta la [política de contenido](CONTENT-POLICY.md).
