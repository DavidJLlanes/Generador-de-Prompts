/**
 * FAMILIAS DE SECCIONES — «un concepto, una elección».
 *
 * Muchos generadores describen el mismo rasgo desde sitios distintos: Mujer trae pelo, rostro y
 * vestuario; Peinados, Rostros, Anatomía y Accesorios los desarrollan aparte. Al cruzar generadores
 * se podía acabar con dos colores de pelo o dos conjuntos en el mismo prompt.
 *
 * Una familia agrupa las secciones que hablan de lo mismo: al elegir en una se quita lo elegido en
 * las demás, esté en el generador que esté (lo aplica `assets/js/core/families.js`, y el almacén,
 * el compositor y «Aleatorio» lo respetan).
 *
 * Reglas para editar este archivo:
 *  - Una sección solo puede estar en UNA familia (`npm run validate` lo comprueba).
 *  - Solo van secciones que de verdad son el mismo eje. Dentro de un mismo generador, dos secciones
 *    complementarias (tipo de prenda + color de esa prenda) NO comparten familia.
 *  - `label` es el nombre del concepto que sale en el aviso: «Se quitó «Peinados» (color del pelo)…».
 */
export const FAMILIES = [
  /* ---------- Personaje ---------- */
  { id: 'edad', label: 'edad', sections: ['woman/edad', 'man/edad', 'girl/identity-age', 'faces/edad', 'anatomy/edad'] },
  { id: 'origen', label: 'origen', sections: ['woman/etnia', 'man/etnia', 'girl/identity-heritage'] },
  { id: 'complexion', label: 'complexión', sections: ['woman/cuerpo', 'man/cuerpo', 'girl/identity-build', 'anatomy/tipo-cuerpo'] },
  { id: 'pecho', label: 'pecho', sections: ['woman/pecho', 'girl/body-bust', 'anatomy/pecho'] },
  { id: 'piel-tono', label: 'tono de piel', sections: ['woman/piel', 'man/piel', 'girl/body-skin-tone', 'faces/piel-tono', 'anatomy/piel-tono'] },
  { id: 'piel-textura', label: 'textura de piel', sections: ['girl/body-skin-finish', 'faces/piel-textura', 'anatomy/piel-textura'] },

  /* ---------- Rostro ---------- */
  { id: 'cara-forma', label: 'forma de la cara', sections: ['woman/cara', 'man/cara', 'girl/face-face-shape', 'faces/forma-cara'] },
  { id: 'ojos-color', label: 'color de ojos', sections: ['woman/ojos', 'man/ojos', 'girl/face-eye-color', 'faces/ojos-color'] },
  { id: 'ojos-forma', label: 'forma de los ojos', sections: ['woman/ojosforma', 'girl/face-eye-shape', 'faces/ojos-forma'] },
  { id: 'cejas', label: 'cejas', sections: ['woman/cejas', 'man/cejas', 'girl/face-eyebrows', 'faces/cejas-forma'] },
  { id: 'nariz', label: 'nariz', sections: ['woman/nariz', 'man/nariz', 'girl/face-nose', 'faces/nariz-forma'] },
  { id: 'labios', label: 'labios', sections: ['woman/labios', 'girl/face-lips', 'faces/boca-forma'] },
  { id: 'labios-color', label: 'color de labios', sections: ['woman/colorlabios', 'girl/makeup-lip-color', 'faces/boca-color'] },
  { id: 'expresion', label: 'expresión', sections: ['woman/expresion', 'man/expresion', 'girl/face-expression', 'girl/pose-expression', 'faces/expresion-primaria', 'animated/expresion'] },
  { id: 'unas', label: 'uñas', sections: ['woman/unas', 'girl/makeup-nails'] },

  /* ---------- Pelo ---------- */
  { id: 'pelo-largo', label: 'largo del pelo', sections: ['woman/largo', 'girl/hair-length', 'hairstyles/largo'] },
  { id: 'pelo-textura', label: 'textura del pelo', sections: ['woman/textura', 'girl/hair-texture', 'hairstyles/textura'] },
  { id: 'pelo-estilo', label: 'peinado', sections: ['woman/peinado', 'man/pelo', 'girl/hair-style', 'hairstyles/tipo-peinado'] },
  { id: 'pelo-flequillo', label: 'flequillo', sections: ['woman/flequillo', 'hairstyles/flequillo'] },
  { id: 'pelo-color', label: 'color del pelo', sections: ['woman/colorpelo', 'man/colorpelo', 'girl/hair-color', 'hairstyles/color-principal'] },

  /* ---------- Vestuario ---------- */
  { id: 'vestuario', label: 'vestuario', sections: ['woman/ropa', 'woman/conjunto-galeria', 'girl/conjunto-galeria', 'man/ropa', 'animated/vestuario'] },
  { id: 'calzado', label: 'calzado', sections: ['woman/calzado', 'man/calzado', 'girl/footwear-type'] },
  { id: 'accesorios', label: 'accesorios', sections: ['woman/accesorios', 'man/accesorios'] },
  { id: 'joyas', label: 'joyas', sections: ['girl/accessories-jewelry', 'accessories/joyas-tipo'] },
  { id: 'bolsos', label: 'bolsos', sections: ['girl/accessories-bag', 'accessories/bolsos-tipo'] },
  { id: 'sombreros', label: 'sombreros', sections: ['girl/accessories-headwear', 'accessories/sombreros-tipo'] },
  { id: 'gafas', label: 'gafas', sections: ['girl/accessories-eyewear', 'accessories/gafas-tipo'] },
  { id: 'arma', label: 'arma', sections: ['woman/arma', 'weapons/tipo-arma'] },

  /* ---------- Pose ---------- */
  { id: 'pose', label: 'pose', sections: ['poses/poses', 'woman/pose-galeria', 'girl/pose-galeria', 'girl/pose-body-pose'] },

  /* ---------- Cámara y composición ---------- */
  { id: 'plano', label: 'tipo de plano', sections: ['girl/camera-shot-type', 'landscape/primo-plano', 'landscape/1-plano', 'space/primer-plano'] },
  { id: 'angulo', label: 'ángulo de cámara', sections: ['girl/camera-angle', 'photo/perspective', 'anatomy/perspectiva', 'landscape/2-angulo', 'scenes/punto-vista-camara'] },
  { id: 'objetivo', label: 'objetivo', sections: ['photo/lens', 'girl/camera-lens', 'anatomy/objetivo'] },
  { id: 'profundidad', label: 'profundidad de campo', sections: ['photo/depth-of-field', 'girl/camera-dof', 'anatomy/bokeh', 'anatomy/bokeh-final', 'space/profundidad'] },
  { id: 'composicion', label: 'composición', sections: ['photo/composition', 'anatomy/composicion', 'landscape/composicion'] },

  /* ---------- Luz, clima y atmósfera ---------- */
  { id: 'luz', label: 'iluminación', sections: ['photo/lighting', 'girl/lighting-type', 'interior/iluminacion', 'landscape/ilum-natural', 'anatomy/iluminacion', 'scenes/ilum-atmosferica', 'weather/luz-ambiente', 'space/fuente-luz'] },
  { id: 'clima', label: 'clima', sections: ['weather/tipo-clima', 'girl/setting-weather', 'scenes/clima', 'landscape/clima', 'animated/clima'] },
  { id: 'hora', label: 'hora del día', sections: ['girl/setting-time-of-day', 'scenes/hora-dia', 'landscape/hora', 'animated/hora'] },
  { id: 'estacion', label: 'estación', sections: ['girl/setting-season', 'landscape/estacion'] },
  { id: 'atmosfera', label: 'atmósfera', sections: ['photo/atmosphere', 'anatomy/atmosfera', 'interior/atmosfera'] },
  { id: 'ambiente', label: 'ambiente emocional', sections: ['girl/mood-tone', 'weather/atmosfera-emocional', 'scenes/tono-emocional'] },
  { id: 'paleta', label: 'paleta de color', sections: ['girl/mood-palette', 'scenarios/paleta', 'space/paleta-cosmica'] },

  /* ---------- Lugar y estilo ---------- */
  { id: 'lugar', label: 'lugar', sections: ['locations/locations', 'scenarios/motivo', 'girl/setting-place', 'landscape/locs', 'scenes/ubicacion', 'interior/tipo', 'space/tipo-escena'] },
  { id: 'estilo', label: 'estilo visual', sections: ['photo/style', 'girl/art-style-style', 'scenarios/estilo', 'magic/estilo-representacion', 'space/estilo-astro'] },
];
