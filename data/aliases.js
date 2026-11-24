/**
 * ALIAS DE OPCIONES — ids que se fusionaron con otra opción (duplicados con la misma etiqueta). Se mantienen para que
 * los prompts guardados, los enlaces compartidos y las bibliotecas exportadas sigan funcionando: al cargarlos, cada id
 * antiguo se cambia por el que se conserva. Los ids son únicos solo dentro de su sección, por eso el alias es por sección.
 * Formato: { dominio: { sección: { idAntiguo: idActual } } }.
 */
export const OPTION_ALIASES = {
  "man": {
    "colorpelo": {
      "jet-black-hair-2": "jet-black-hair"
    }
  },
  "vehicles": {
    "llantas-ruedas": {
      "crystal-wheels-2": "crystal-wheels"
    }
  },
  "tattoos": {
    "ubicacion-cuello": {
      "back-of-neck-2": "back-of-neck"
    }
  },
  "girl": {
    "face-nose": {
      "wide-nose": "broad-nose"
    },
    "face-lips": {
      "thin-elegant-lips": "slim-elegant-lips"
    },
    "top-type": {
      "bandeau": "tube-top"
    },
    "top-fit": {
      "bodycon-style": "form-fitting"
    }
  },
  "photo": {
    "composition": {
      "perfectly-symmetrical": "perfect-symmetry"
    },
    "perspective": {
      "four-dimensional-perspective": "4d-perspective",
      "extreme-low-worm-s-eye": "extreme-low-worm-s",
      "extreme-low-worm-eye-angle": "extreme-low-worm-s",
      "three-quarter": "three-quarter-angle",
      "eye-level-perspective": "eye-level",
      "eye-level-perspective-2": "eye-level",
      "low-angle-looking-up": "bottom-up",
      "extremely-low-worm-s-view": "extremely-low",
      "very-low-looking-up": "extremely-low",
      "extremely-high-bird-s-view": "extremely-high",
      "very-high-looking-down": "extremely-high",
      "dutch-angle-tilt": "dutch-tilt-angle",
      "fisheye-distortion": "fisheye"
    },
    "lens": {
      "shot-on-85mm-portrait-lens": "85mm-portrait",
      "85mm-portrait-lens": "85mm-portrait",
      "35mm-documentary-lens": "35mm-documentary",
      "14mm-ultra-wide-lens": "14mm-ultra-wide",
      "24mm-wide-angle-lens-2": "24mm-wide-angle",
      "135mm-telephoto-lens": "135mm-telephoto",
      "200mm-compressed-perspective": "200mm-compression",
      "extreme-macro-lens": "extreme-macro",
      "perspective-shift-lens": "perspective-shift"
    },
    "depth-of-field": {
      "selective-focus-blur": "selective-focus",
      "soft-dreamy": "soft-dreamy-focus"
    },
    "camera": {
      "shot-on-hasselblad-medium-format": "hasselblad-medium-format"
    },
    "lighting": {
      "golden-hour-light": "warm-golden-hour-light",
      "window-light": "soft-window-light",
      "window-light-quality": "soft-window-light",
      "low-key-dark-lighting": "low-key-dark",
      "high-key-bright-lighting": "high-key-bright",
      "candlelight-intimate": "candlelight",
      "ethereal-spectral": "ethereal-spectral-light"
    },
    "color-grading": {
      "cyanmagenta-limited": "cyan-magenta-limited",
      "soft-pastel": "soft-pastel-grade",
      "soft-pastel-colors": "soft-pastel-grade",
      "fire-red": "fire-red-spectrum"
    },
    "style": {
      "digital-illustration": "digital-painting-illustration",
      "photorealistic-3d-render": "photorealistic-3d",
      "fashion-editorial": "high-fashion-editorial-photography",
      "high-fashion-editorial": "high-fashion-editorial-photography",
      "anime-illustration": "anime-illustration-style",
      "pixel-art": "pixel-art-style",
      "cel-shaded": "cel-shaded-illustration",
      "low-poly-minimalist": "low-poly-minimal",
      "analog-film-photography": "analog-photography",
      "long-exposure-night": "long-exposure-night-photography",
      "vibrant-acrylic-painting": "vibrant-acrylic",
      "dramatic-charcoal-drawing": "dramatic-charcoal",
      "surrealist-dreamlike-painting": "surreal-dreamlike",
      "comic-book-manga-style": "comic-book-manga",
      "pixel-art-retro-style": "retro-pixel-art",
      "sci-fi-concept": "sci-fi-concept-art",
      "documentary-style": "documentary-photography",
      "low-poly-3d": "low-poly-3d-render",
      "solarpunk": "solarpunk-aesthetic",
      "dieselpunk": "dieselpunk-art",
      "cottagecore": "cottagecore-aesthetic",
      "dark-academia": "dark-academia-aesthetic"
    }
  }
};
