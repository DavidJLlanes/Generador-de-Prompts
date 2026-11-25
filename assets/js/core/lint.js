/**
 * REVISIÓN DE CONTRADICCIONES (puro, sin DOM).
 *
 * Las exclusiones (data/exclusions.js) impiden elegir pares incompatibles entre secciones concretas, pero hay
 * choques que solo se ven en el texto del prompt: una escena «de noche» con un acabado «a pleno sol», un plano
 * «primer plano» junto a un «cuerpo entero», un estilo fotográfico con un «anime», lo que el usuario escribe en
 * el texto libre… Aquí se detectan leyendo las piezas ya compuestas. Solo avisa: nunca cambia la selección.
 *
 * Cada regla define grupos de palabras que no deben convivir. Hay choque cuando dos piezas DISTINTAS caen en
 * grupos distintos de la misma regla (una sola pieza que diga «del día a la noche» no cuenta).
 */
import { toneOf } from './tone.js';

const rx = s => new RegExp(`\\b(?:${s})\\b`, 'i');

export const LINT_RULES = [
  { id: 'time', title: 'Hora del día', groups: {
    night: { label: 'noche', rx: rx('night(?:time)?|midnight|moonlit|moonlight|starlit|starry sky|nocturnal|after dark') },
    day: { label: 'pleno día', rx: rx('midday|high noon|noon sun\\w*|broad daylight|bright daylight|harsh noon\\w*|sunny day|clear blue sky') },
  } },
  { id: 'season', title: 'Estación o temperatura', groups: {
    cold: { label: 'frío o invierno', rx: rx('winter|snow(?:y|fall|storm)?|blizzard|frozen (?:lake|landscape|tundra|ground|river|wasteland)|frosty|icy|ice age|glacial') },
    hot: { label: 'calor o verano', rx: rx('summer|scorching|heat ?wave|sweltering|blazing heat|desert heat') },
  } },
  { id: 'shot', title: 'Tipo de plano', groups: {
    close: { label: 'primer plano', rx: rx('close-?up|extreme close|macro|headshot|tight crop|face filling the frame') },
    wide: { label: 'plano general', rx: rx('full[- ]body|full[- ]length|wide shot|extreme wide|establishing shot|aerial view|drone view|bird\'?s[- ]eye|panoramic') },
  } },
  { id: 'medium', title: 'Medio o estilo visual', groups: {
    photo: { label: 'fotografía', rx: rx('photograph\\w*|photo-?realistic|hyper-?realistic|dslr|raw photo|film still|documentary photo\\w*') },
    drawn: { label: 'ilustración o dibujo', rx: rx('anime|manga|cartoon\\w*|illustration|watercolou?r|oil painting|pixel art|comic(?: book)?|cel[- ]shad\\w*|vector art|low[- ]poly|claymation|flat design|ink drawing|pencil sketch|gouache|tempera|fresco|woodcut|linocut|lithograph|etching|engraving|screen print|risograph|cyanotype|charcoal drawing|soft pastel|oil pastel|impasto|oil painting|acrylic painting|digital painting|ukiyo-e|in the style of') },
  } },
  { id: 'palette', title: 'Color', groups: {
    mono: { label: 'blanco y negro', rx: rx('black and white|black-and-white|monochrom\\w*|grayscale|greyscale|sepia|b&w') },
    vivid: { label: 'colores vivos', rx: rx('vibrant colou?rs?|vivid colou?rs?|saturated|colou?rful|neon|rainbow|technicolor|candy colou?rs?') },
  } },
  { id: 'focus', title: 'Profundidad de campo', groups: {
    shallow: { label: 'fondo desenfocado', rx: rx('shallow depth of field|bokeh|blurred background|f\\/1\\.\\d') },
    deep: { label: 'todo enfocado', rx: rx('deep depth of field|deep focus|everything in focus|f\\/(?:8|11|16|22)|front-to-back sharp\\w*') },
  } },
  { id: 'lightquality', title: 'Calidad de la luz', groups: {
    soft: { label: 'luz suave', rx: rx('soft(?:box)? (?:diffused )?(?:light|lighting)|diffused (?:light|lighting)|overcast light|gentle (?:light|glow)') },
    hard: { label: 'luz dura', rx: rx('harsh (?:light|lighting|sunlight|shadows?)|hard (?:light|lighting|shadows?)|high-contrast hard light') },
  } },
  { id: 'gaze', title: 'Mirada', groups: {
    closed: { label: 'ojos cerrados', rx: rx('eyes (?:closed|shut)|closed eyes|sleeping') },
    direct: { label: 'mirada a cámara', rx: rx('direct gaze|looking (?:directly )?(?:at|into) the (?:camera|viewer|lens)|eye contact|piercing gaze') },
  } },
];

const IGNORED = p => p.boost || p.section === '_rule';
const hay = p => `${p.short || ''} ${p.text || ''}`;
const ref = p => ({ domain: p.domain, section: p.section, option: p.option, custom: !!p.custom, es: p.es || 'Texto libre' });

/** Primer par de piezas distintas que caen en grupos distintos de la regla, o null. */
function clash(rule, parts) {
  const hits = Object.entries(rule.groups).map(([key, g]) => [key, parts.filter(p => g.rx.test(hay(p)))]).filter(([, list]) => list.length);
  for (let i = 0; i < hits.length; i++) for (let j = i + 1; j < hits.length; j++) {
    for (const a of hits[i][1]) for (const b of hits[j][1]) {
      if (a !== b) return { a, b, ga: rule.groups[hits[i][0]], gb: rule.groups[hits[j][0]] };
    }
  }
  return null;
}

const label = p => `«${(p.es || 'Texto libre').slice(0, 56)}»`;

/** Número de la proporción «a:b» (ancho / alto), o null. */
export function ratioOf(aspect) {
  const m = /^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/.exec(aspect || '');
  return m ? parseFloat(m[1]) / parseFloat(m[2]) : null;
}

/**
 * @param {{parts: object[]}} composed  resultado de `compose`
 * @param {{aspect?: string}} [state]
 * @returns {{id: string, title: string, text: string, parts: {domain: string, section: string, option: string, custom: boolean, es: string}[]}[]}
 */
export function lintComposed(composed, state = {}) {
  const parts = (composed?.parts || []).filter(p => !IGNORED(p));
  const out = [];
  for (const rule of LINT_RULES) {
    const c = clash(rule, parts);
    if (c) out.push({ id: rule.id, title: rule.title, text: `${label(c.a)} habla de ${c.ga.label} y ${label(c.b)} de ${c.gb.label}. Elige una de las dos o el modelo tendrá que adivinar.`, parts: [ref(c.a), ref(c.b)] });
  }

  // Tono: opciones «suaves» junto a «intensas» (las mismas que evita el aleatorio).
  const soft = parts.find(p => !p.custom && toneOf(p.short) > 0);
  const hard = parts.find(p => !p.custom && toneOf(p.short) < 0);
  if (soft && hard) out.push({ id: 'tone', title: 'Tono', text: `${label(soft)} es dulce y ${label(hard)} es oscuro o agresivo. Si los mezclas a propósito, vale; si no, quita uno.`, parts: [ref(soft), ref(hard)] });

  // Proporción frente a palabras de orientación.
  const r = ratioOf(state.aspect);
  if (r) {
    const bad = r >= 1.5 ? parts.find(p => /\b(?:vertical (?:format|composition|orientation)|portrait orientation|tall composition)\b/i.test(hay(p)))
      : r <= 0.67 ? parts.find(p => /\b(?:panoramic|horizontal (?:format|composition)|wide landscape|ultra-?wide)\b/i.test(hay(p))) : null;
    if (bad) out.push({ id: 'aspect', title: 'Proporción', text: `${label(bad)} no encaja con la proporción ${state.aspect}: ${r >= 1.5 ? 'es apaisada' : 'es vertical'}.`, parts: [ref(bad)] });
  }
  return out;
}

/** Medio dominante del prompt: 'photo', 'drawn' o null si no hay (o si se mezclan). Lo usan los formatos para ajustar el negativo. */
export function mediumOf(composed) {
  const parts = (composed?.parts || []).filter(p => !IGNORED(p));
  const medium = LINT_RULES.find(r => r.id === 'medium');
  const photo = parts.some(p => medium.groups.photo.rx.test(hay(p)));
  const drawn = parts.some(p => medium.groups.drawn.rx.test(hay(p)));
  return photo === drawn ? null : photo ? 'photo' : 'drawn';
}
