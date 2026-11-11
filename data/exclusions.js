// EXCLUSIONES entre opciones: qué cosas NO pueden convivir en un mismo prompt, aunque estén en generadores distintos.
// Documentación: docs/DATA-SCHEMA.md («Exclusiones») y docs/CONTENT-POLICY.md.
//
//  · TAGGING  asigna etiquetas a opciones sin tocar cada una (por sección, grupo, ids, nombre o expresión regular).
//             Las opciones también pueden llevar sus propias `tags` en los datos del dominio.
//  · RULES    pares de lados incompatibles. Cada lado es { tags: [...] } (la opción lleva alguna) o
//             { domains: [...] } (hay algo elegido en alguno de esos generadores).
//             La opción de un lado queda BLOQUEADA mientras haya algo elegido del lado contrario (en otra sección).
//             `drop` indica qué lado se descarta si una selección ya hecha (enlace compartido, aleatorio, guardado)
//             llega con ambos: en las reglas de seguridad se descarta siempre el contenido para adultos.
//
// El índice generado (data/tag-index.js) lo produce `npm run build`; los tests comprueban que está al día.

/** Personajes animados cuya mayoría de edad es inequívoca en su obra original. El resto se trata como «de aspecto joven». */
const ADULT_CHARACTERS = [
  'Elsa (Frozen)', 'Maléfica', 'Cruella de Vil', 'Úrsula (La Sirenita)', 'Reina Malvada (Blancanieves)', 'Madre Gothel (Enredados)',
  'Reina Elinor (Brave)', 'Elastigirl (Los Increíbles)', 'Edna Mode (Los Increíbles)', 'Mirage (Los Increíbles)', 'Mamá Imelda (Coco)',
  'Jessica Rabbit', 'Calhoun (Rompe Ralph)', 'Helga (Atlantis)', 'Fiona (Shrek)', 'Giselle (Encantada)', 'Jane (Tarzán)', 'Sally (Pesadilla antes de Navidad)',
  'Jessie (Toy Story)', 'Bo Peep (Toy Story)', 'Celia (Monstruos S.A.)', 'Colette (Ratatouille)',
  'Makima (Chainsaw Man)', 'Yor Forger (Spy x Family)', 'Boa Hancock (One Piece)', 'Nico Robin (One Piece)', 'Tsunade (Naruto)', 'Yoruichi (Bleach)',
  'Rangiku (Bleach)', 'Revy (Black Lagoon)', 'Faye (Cowboy Bebop)', 'Motoko (Ghost in the Shell)', 'Esdeath (Akame ga Kill)', 'Albedo (Overlord)',
  'Android 18 (Dragon Ball)', 'Chi-Chi (Dragon Ball)', 'Tatsumaki (One Punch Man)', 'Fubuki (One Punch Man)', 'Mirko (My Hero Academia)',
  'C.C. (Code Geass)', 'Riza (Fullmetal Alchemist)', 'Leela (Futurama)', 'Garnet (Steven Universe)',
  'Wonder Woman (animada)', 'Catwoman (DC)', 'Poison Ivy (DC)', 'Harley Quinn (animada)', 'Zatanna (DC)', 'Black Widow (Marvel)', 'Storm (X-Men)',
  'Jean Grey (X-Men)', 'Rogue (X-Men)', 'Mystique (X-Men)', 'Scarlet Witch (Marvel)',
  'Lara Croft (Tomb Raider)', 'Aloy (Horizon)', 'Yennefer (The Witcher)', 'Triss (The Witcher)', 'Tifa (Final Fantasy VII)', 'Aerith (Final Fantasy VII)',
  'Lightning (Final Fantasy XIII)', '2B (NieR Automata)', 'A2 (NieR Automata)', 'Bayonetta', 'Jill Valentine (Resident Evil)', 'Ada Wong (Resident Evil)',
  'Lady Dimitrescu (Resident Evil)', 'Claire (Resident Evil)', 'Sheva (Resident Evil)', 'Chun-Li (Street Fighter)', 'Kitana (Mortal Kombat)',
  'Sonya Blade (Mortal Kombat)', 'Sindel (Mortal Kombat)', 'Juri (Street Fighter)', 'Samus Aran (Metroid)', 'Mercy (Overwatch)', 'Widowmaker (Overwatch)',
  'Tracer (Overwatch)', 'Sombra (Overwatch)', 'Ashe (Overwatch)', 'Mei (Overwatch)', 'Vi (Arcane/LoL)', 'Caitlyn (Arcane/LoL)', 'Miss Fortune (LoL)',
  'Katarina (League of Legends)', 'Evelynn (League of Legends)', 'Abby (The Last of Us)', 'Senua (Hellblade)', 'Kassandra (Assassin\'s Creed)',
  'Quiet (Metal Gear)', 'Kerrigan (StarCraft)', 'Mai Shiranui (Fatal Fury/KOF)', 'Morrigan (Darkstalkers)', 'Nina Williams (Tekken)', 'Helena (Dead or Alive)',
  'Panam (Cyberpunk 2077)', 'Judy (Cyberpunk 2077)', 'Lulu (Final Fantasy X)', 'Liara (Mass Effect)', 'Miranda (Mass Effect)', 'Tali (Mass Effect)',
  'Morrigan (Dragon Age)', 'Serana (Skyrim)', 'Jett (Valorant)', 'Reyna (Valorant)', 'Sage (Valorant)', 'Sophitia (Soul Calibur)', 'Ivy (Soul Calibur)',
  'Taki (Soul Calibur)', 'Lilith (Borderlands)', 'Moxxi (Borderlands)', 'Elizabeth (BioShock)', 'Leona (King of Fighters)',
  'EVA (Metal Gear)',
];

export const TAGGING = [
  /* --- contenido solo para adultos (lencería, boudoir, busto, látex, poses y ambientes sensuales) --- */
  { tag: 'adult-only', domain: 'woman', section: 'pecho' },
  { tag: 'adult-only', domain: 'girl', section: 'body-bust' },
  { tag: 'adult-only', domain: 'woman', section: 'ropa', group: 'sexy-elegante' },
  { tag: 'adult-only', domain: 'woman', section: 'ropa', group: 'lenceria-y-ropa-interior-elegante' },
  { tag: 'adult-only', domain: 'poses', section: 'poses', group: 'sex' },
  // (las opciones sueltas reincorporadas llevan `tags: ["adult-only"]` en su dominio)

  /* --- menores y personajes de aspecto joven --- */
  { tag: 'minor', domain: 'anatomy', section: 'edad', ids: ['infant', 'toddler', 'child', 'adolescent'] },
  { tag: 'minor', domain: 'faces', section: 'edad', ids: ['baby-0-2-years', 'child-3-7-years', 'older-child-8-12', 'teenager-13-17'] },
  { tag: 'minor', domain: 'hairstyles', section: 'edad', ids: ['baby-hair', 'child-hair', 'teenage-hair'] },
  { tag: 'minor', domain: 'animated', section: 'version', ids: ['as-a-small-child-version-of-herself', 'as-a-teenage-version-of-herself'] },
  { tag: 'youthful', domain: 'faces', section: 'edad', ids: ['appears-younger'] },
  { tag: 'youthful', domain: 'faces', section: 'genero', ids: ['boyish-young', 'girlish-young'] },
  { tag: 'youthful', domain: 'woman', section: 'cara', ids: ['youthful-baby-face'] },
  { tag: 'youthful', domain: 'girl', section: 'face-face-shape', ids: ['youthful-baby-face'] },
  { tag: 'youthful', domain: 'girl', section: 'face-cheeks', ids: ['youthful-full-cheeks'] },
  // Personajes animados: solo los verificados como adultos admiten contenido para adultos; el resto cuenta como «de aspecto joven».
  { tag: 'adult', domain: 'animated', section: 'personaje', es: ADULT_CHARACTERS },
  { tag: 'youthful', domain: 'animated', section: 'personaje', without: 'adult' },

  /* --- hora del día --- */
  { tag: 'night', section: 'landscape/hora', ids: ['starlit-night-sky', 'midnight-with-full-moon', 'dark-early-morning-darkness', 'endless-polar-night'] },
  { tag: 'night', section: 'animated/hora', ids: ['under-a-starry-night-sky', 'in-soft-moonlight'] },
  { tag: 'night', section: 'scenes/hora-dia', ids: ['starlit-night', 'deep-midnight', 'dark-early-morning'] },
  { tag: 'night', section: 'weather/luz-ambiente', ids: ['dim-darkness', 'near-total-darkness', 'complete-darkness', 'moonlight', 'starlight'] },
  { tag: 'day', section: 'landscape/hora', ids: ['bright-morning-daylight', 'harsh-noon-sunlight', 'afternoon-with-long-shadows'] },
  { tag: 'day', section: 'animated/hora', ids: ['in-bright-morning-light', 'at-midday', 'in-golden-afternoon-light'] },
  { tag: 'day', section: 'scenes/hora-dia', ids: ['early-morning', 'harsh-noon', 'afternoon-shadows'] },
  { tag: 'day', section: 'weather/luz-ambiente', ids: ['bright-sunlight', 'clear-daylight', 'cloudy-daylight'] },

  /* --- frío y calor --- */
  { tag: 'cold', domain: 'weather', section: 'tipo-nieve' },
  { tag: 'cold', section: 'weather/temperatura', ids: ['extremely-cold', 'very-cold', 'cold', 'freezing-glacial', 'frost-biting'] },
  { tag: 'cold', section: 'landscape/estacion', ids: ['frozen-winter-landscape', 'crystalline-ice-age-winter', 'ancient-ice-age-epoch'] },
  { tag: 'hot', section: 'weather/temperatura', ids: ['hot', 'extremely-hot', 'scorching', 'burning'] },
  { tag: 'hot', section: 'landscape/estacion', ids: ['vibrant-hot-summer', 'eternal-endless-summer', 'severe-drought-period'] },

  /* --- género del rostro --- */
  { tag: 'male', section: 'faces/genero', ids: ['masculine-male', 'strong-masculine', 'transmasculine', 'boyish-young'] },
  { tag: 'female', section: 'faces/genero', ids: ['feminine-female', 'delicate-feminine', 'transfeminine', 'girlish-young'] },
];

const NO_ADULT = 'Contenido solo para personajes adultos: hay elegido un menor o un personaje de aspecto joven.';
const NO_MINOR = 'Este generador es solo para personajes adultos: hay elegida una edad de niño, adolescente o bebé.';

export const RULES = [
  { id: 'adultos-vs-menores', a: { tags: ['adult-only'] }, b: { tags: ['minor', 'youthful'] }, drop: 'a', safety: true,
    whyA: NO_ADULT, whyB: 'Hay contenido solo para adultos elegido (lencería, busto, poses o ambientes sensuales): no se puede combinar con un menor ni con un personaje de aspecto joven.' },
  { id: 'menores-vs-generadores-adultos', a: { domains: ['woman', 'man', 'girl'] }, b: { tags: ['minor'] }, drop: 'b', safety: true,
    whyA: NO_MINOR, whyB: 'Hay elegido un personaje adulto (Mujer, Hombre o Personaje avanzado): no se puede combinar con la edad de un niño, adolescente o bebé.' },
  { id: 'dia-vs-noche', a: { tags: ['night'] }, b: { tags: ['day'] }, drop: 'b',
    whyA: 'No combina con la luz de día que ya elegiste.', whyB: 'No combina con la noche que ya elegiste.' },
  { id: 'frio-vs-calor', a: { tags: ['cold'] }, b: { tags: ['hot'] }, drop: 'b',
    whyA: 'No combina con el calor que ya elegiste.', whyB: 'No combina con el frío o la nieve que ya elegiste.' },
  { id: 'rostro-masculino-vs-mujer', a: { domains: ['woman', 'girl'] }, b: { tags: ['male'] }, drop: 'b',
    whyA: 'Elegiste un rostro masculino en «Rostros».', whyB: 'Ya hay una mujer elegida (Mujer o Personaje avanzado).' },
  { id: 'rostro-femenino-vs-hombre', a: { domains: ['man'] }, b: { tags: ['female'] }, drop: 'b',
    whyA: 'Elegiste un rostro femenino en «Rostros».', whyB: 'Ya hay un hombre elegido en «Hombre».' },
];

/** Etiquetas que deben existir en el índice (las usan las reglas). */
export const TAG_NAMES = [...new Set(RULES.flatMap(r => [...(r.a.tags || []), ...(r.b.tags || [])]))];
