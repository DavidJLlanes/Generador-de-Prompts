/**
 * GLOSARIO del catálogo de vestuario: traduce los términos en inglés del catálogo original
 * (que usa una lista cerrada de 86 palabras) a etiquetas en español y agrupa las prendas
 * para componer «falda plisada de pana en negro con lazo» a partir de «black corduroy pleated skirt ribbon».
 *
 * Se usa solo al regenerar data/catalogs/vestuario.js (scripts/catalogs/generar-vestuario.mjs).
 * Si un término nuevo aparece en el catálogo, el generador falla: añádelo aquí.
 */

/** Colores: se colocan al final como «en negro», así no hay que concordar. */
export const COLORS = {
  black: 'negro', white: 'blanco', ivory: 'marfil', beige: 'beige', grey: 'gris', red: 'rojo',
  blue: 'azul', navy: 'azul marino', gold: 'dorado', silver: 'plateado', brown: 'marrón', pink: 'rosa',
  green: 'verde', mint: 'menta', yellow: 'amarillo', khaki: 'caqui', burgundy: 'granate', orange: 'naranja',
  olive: 'oliva', lavender: 'lavanda', purple: 'morado', cream: 'crema',
};

/** Materiales: van detrás de la prenda con «de». */
export const MATERIALS = {
  knit: 'punto', lace: 'encaje', leather: 'cuero', satin: 'satén', denim: 'denim', fur: 'piel',
  suede: 'ante', wool: 'lana', velvet: 'terciopelo', corduroy: 'pana', chiffon: 'gasa', tulle: 'tul', mesh: 'malla',
};

/** Estampados: adjetivo invariable. */
export const PATTERNS = { floral: 'floral', 'polka-dot': 'de lunares' };

/** Tamaño: se pega al sustantivo sin concordancia. */
export const SIZES = { mini: 'mini', midi: 'midi', maxi: 'maxi' };

/** Detalles: van al final con «con». */
export const DETAILS = { ribbon: 'lazo', frill: 'volantes' };

/** Prendas: [etiqueta en español, género (m/f), número (s/p)]. */
export const GARMENTS = {
  skirt: ['falda', 'f', 's'], dress: ['vestido', 'm', 's'], camisole: ['camisola', 'f', 's'],
  cardigan: ['cárdigan', 'm', 's'], jacket: ['chaqueta', 'f', 's'], coat: ['abrigo', 'm', 's'],
  shirt: ['camisa', 'f', 's'], blouse: ['blusa', 'f', 's'], pants: ['pantalones', 'm', 'p'],
  jeans: ['vaqueros', 'm', 'p'], shorts: ['pantalones cortos', 'm', 'p'], socks: ['calcetines', 'm', 'p'],
  stockings: ['medias', 'f', 'p'], tights: ['medias', 'f', 'p'], sandals: ['sandalias', 'f', 'p'],
  boots: ['botas', 'f', 'p'], heels: ['tacones', 'm', 'p'], sneakers: ['zapatillas', 'f', 'p'],
  loafers: ['mocasines', 'm', 'p'], pumps: ['zapatos de salón', 'm', 'p'], bag: ['bolso', 'm', 's'],
  tote: ['bolso tote', 'm', 's'], necklace: ['collar', 'm', 's'], choker: ['gargantilla', 'f', 's'],
  belt: ['cinturón', 'm', 's'], gloves: ['guantes', 'm', 'p'], turtleneck: ['jersey de cuello alto', 'm', 's'],
  sunglasses: ['gafas de sol', 'f', 'p'], scarf: ['bufanda', 'f', 's'], robe: ['albornoz', 'm', 's'],
  swimsuit: ['bañador', 'm', 's'], sweater: ['jersey', 'm', 's'], beret: ['boina', 'f', 's'],
  vest: ['chaleco', 'm', 's'], hoodie: ['sudadera', 'f', 's'], apron: ['delantal', 'm', 's'],
  beanie: ['gorro', 'm', 's'], muffler: ['bufanda', 'f', 's'], hat: ['sombrero', 'm', 's'],
  headband: ['diadema', 'f', 's'], corset: ['corsé', 'm', 's'], bra: ['sujetador', 'm', 's'],
  briefs: ['bragas', 'f', 'p'],
};

/** Adjetivos que sí concuerdan (terminan en -o en masculino singular). */
export const AGREEMENT = { pleated: { m: 'plisado', f: 'plisada', mp: 'plisados', fp: 'plisadas' } };

export const KIND = {
  ...Object.fromEntries(Object.keys(COLORS).map(k => [k, 'color'])),
  ...Object.fromEntries(Object.keys(MATERIALS).map(k => [k, 'material'])),
  ...Object.fromEntries(Object.keys(PATTERNS).map(k => [k, 'pattern'])),
  ...Object.fromEntries(Object.keys(SIZES).map(k => [k, 'size'])),
  ...Object.fromEntries(Object.keys(DETAILS).map(k => [k, 'detail'])),
  ...Object.fromEntries(Object.keys(AGREEMENT).map(k => [k, 'agreement'])),
  ...Object.fromEntries(Object.keys(GARMENTS).map(k => [k, 'garment'])),
};
