/**
 * TONO — clasifica de forma heurística una opción como «suave» (+1), «intensa» (−1) o neutra (0).
 * Lo usa el aleatorio para no mezclar, en una misma tirada, «cachorro adorable» con «colmillos y sonrisa
 * malévola». Solo mira etiquetas cortas: las descripciones largas (poses, personajes con nombre propio,
 * recetas) son neutras porque ahí las palabras sueltas engañan («Demon Slayer», «calm direct gaze»).
 */
const INTENSE = /\b(sneers?|fangs?|demonic|demon|terrifying|menacing|malevolent|sinister|evil|wicked|bloodthirsty|bloody|gore|gory|undead|zombie|skull|horrific|horror|creepy|ghostly|monstrous|furious|fury|rage|angry|snarling|snarl|aggressive|grim|ominous|savage|brutal|fierce|haunting|haunted|nightmare|apocalyptic|dystopian|deadly|cursed|cruel|vengeful|menace|scary|spooky|eerie|wrathful|vampire|doom|dread)\b/i;
const SOFT = /\b(gentle|sweet|cute|adorable|tender|kind|serene|peaceful|cheerful|smiling|cozy|innocent|friendly|playful|joyful|happy|lovely|delicate|dreamy|pastel|fluffy|cuddly|tranquil|sunny|charming|wholesome|affectionate|angelic|radiant)\b/i;

const MAX_LEN = 70;

/** @returns {-1|0|1} −1 intensa, +1 suave, 0 neutra o ambigua */
export function toneOf(text) {
  const t = String(text || '');
  if (t.length > MAX_LEN || /\bfrom\b/i.test(t)) return 0;
  const hard = INTENSE.test(t), soft = SOFT.test(t);
  return hard === soft ? 0 : hard ? -1 : 1;
}

/** Estados de ánimo posibles de una tirada y su peso. */
export const MOODS = [['soft', 0.4], ['neutral', 0.4], ['intense', 0.2]];

/** ¿Choca la opción con el ánimo de la tirada? */
export const clashesWithMood = (tone, mood) => (mood === 'soft' && tone < 0) || (mood === 'intense' && tone > 0);

/** Elige un ánimo con los pesos de MOODS a partir de un número aleatorio en [0,1). */
export function moodFrom(r) {
  let acc = 0;
  for (const [m, w] of MOODS) { acc += w; if (r < acc) return m; }
  return 'neutral';
}
