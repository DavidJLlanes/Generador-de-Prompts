/**
 * PLANTILLAS — combinaciones de varios generadores listas para cargar con un toque y retocar.
 * Se muestran en la portada y en el constructor («Plantillas»). Cada una guarda ids de opciones reales:
 * `npm test` comprueba que existen y que componen un prompt sin conflictos.
 * Campos: id, title, desc, tags (filtros), aspect (proporción), sel ({ dominio: { sección: [ids] } }).
 */
export const TEMPLATES = [
 {"id": "retrato-editorial", "title": "Retrato editorial de moda", "desc": "Mujer de mirada intensa, maquillaje editorial y luz de estudio suave.", "tags": [ "Retrato" ], "aspect": "4:5", "sel": { "woman": { "edad": [ "woman-in-her-late-20s" ], "colorpelo": [ "rich-chocolate-brown-hair" ], "maquillaje": [ "creative-editorial-makeup-with-graphic-liner" ], "expresion": [ "piercing-focused-gaze" ] }, "photo": { "style": [ "high-fashion-editorial-photography" ], "lighting": [ "soft-studio-softbox-lighting" ], "lens": [ "85mm-portrait" ] } } },
 
 {"id": "retrato-cine-hombre", "title": "Retrato masculino de cine", "desc": "Hombre con barba de varios días, luz Rembrandt y clave baja.", "tags": [ "Retrato" ], "aspect": "4:5", "sel": { "man": { "edad": [ "man-in-his-mid-30s" ], "barba": [ "5-o-clock-shadow-stubble" ], "expresion": [ "serious-intense-expression" ], "ropa": [ "wearing-a-denim-jacket" ] }, "photo": { "style": [ "cinematic-film-still" ], "lighting": [ "dramatic-rembrandt-lighting" ], "lens": [ "85mm-portrait" ] } } },
 
 {"id": "mustang-montana", "title": "Clásico en un puerto de montaña", "desc": "Ford Mustang restomod en un paso de montaña otoñal a la hora dorada.", "tags": [ "Vehículos" ], "aspect": "16:9", "sel": { "cars": { "car": [ "ford-mustang-1964" ], "version": [ "tuning-de-epoca-restomod-1946-1969" ], "color": [ "verde-britanico" ], "escena-foto": [ "paso-de-montana-en-otono" ] }, "photo": { "lighting": [ "warm-golden-hour-light" ], "lens": [ "35mm-documentary" ] } } },
 
 {"id": "superdeportivo-neon", "title": "Superdeportivo en noche de neón", "desc": "Lamborghini Countach en una escena synthwave con luces de neón.", "tags": [ "Vehículos", "Fondos" ], "aspect": "21:9", "sel": { "cars": { "car": [ "lamborghini-countach-1974" ], "color": [ "blanco-perla" ], "escena-foto": [ "synthwave-neon" ] }, "photo": { "lighting": [ "neon-cyberpunk-lighting" ], "style": [ "cinematic-film-still" ] } } },
 
 {"id": "montana-amanecer", "title": "Montañas al amanecer entre niebla", "desc": "Paisaje épico con niebla en los valles y la primera luz dorada.", "tags": [ "Paisaje", "Fondos" ], "aspect": "16:9", "sel": { "landscape": { "tipo": [ "majestic-mountain-landscape" ], "hora": [ "golden-dawn-sunrise" ], "clima": [ "thick-heavy-fog" ] }, "photo": { "lens": [ "14mm-ultra-wide" ], "atmosphere": [ "majestic-imposing" ] } } },
 
 {"id": "aurora-lago", "title": "Aurora boreal sobre un lago", "desc": "Noche polar, lago en calma y aurora reflejada en el agua.", "tags": [ "Paisaje", "Fondos" ], "aspect": "16:9", "sel": { "landscape": { "tipo": [ "peaceful-mountain-lake" ], "hora": [ "starlit-night-sky" ], "clima": [ "dancing-aurora-borealis" ] }, "photo": { "atmosphere": [ "serene-peaceful" ] } } },
 
 {"id": "fondo-movil-desierto", "title": "Fondo de móvil: dunas al atardecer", "desc": "Desierto minimalista con un atardecer ardiente, en vertical.", "tags": [ "Fondos", "Paisaje" ], "aspect": "9:16", "sel": { "landscape": { "tipo": [ "vast-desert-landscape" ], "hora": [ "burning-orange-sunset" ], "clima": [ "crystal-clear-perfect-weather" ] }, "photo": { "atmosphere": [ "clean-minimalist" ] } } },
 
 {"id": "dragon-tormenta", "title": "Dragón en la tormenta", "desc": "Un dragón sobre montañas bajo una tormenta eléctrica.", "tags": [ "Fantasía" ], "aspect": "16:9", "sel": { "creatures": { "especie": [ "ancient-dragon-species" ] }, "landscape": { "tipo": [ "majestic-mountain-landscape" ], "clima": [ "thunderstorm-with-lightning" ] }, "photo": { "style": [ "epic-fantasy-art" ], "atmosphere": [ "dramatic-epic" ] } } },
 
 {"id": "bosque-encantado", "title": "Bosque encantado", "desc": "Bosque denso con neblina bioluminiscente y ambiente mágico.", "tags": [ "Fantasía", "Paisaje" ], "aspect": "2:3", "sel": { "landscape": { "tipo": [ "dense-old-growth-forest" ], "hora": [ "twilight-dusk-hour" ], "clima": [ "glowing-bioluminescent-mist" ] }, "photo": { "style": [ "studio-ghibli-anime-style" ], "atmosphere": [ "magical-enchanting" ] } } },
 
 {"id": "hechicero", "title": "Hechicero lanzando un hechizo", "desc": "Hombre mayor de barba larga invocando magia de fuego.", "tags": [ "Fantasía", "Retrato" ], "aspect": "2:3", "sel": { "man": { "edad": [ "distinguished-gray-haired-man-in-his-60s" ], "barba": [ "full-long-beard" ], "expresion": [ "strong-determined-expression" ] }, "magic": { "elemento-primario": [ "pure-fire" ] }, "photo": { "style": [ "dark-fantasy-art" ], "lighting": [ "rim-backlit" ] } } },
 
 {"id": "gotico", "title": "Retrato gótico romántico", "desc": "Mujer de estética gótica, luz de velas y atmósfera sombría.", "tags": [ "Retrato", "Fantasía" ], "aspect": "4:5", "sel": { "woman": { "edad": [ "woman-in-her-30s" ], "maquillaje": [ "soft-goth-makeup-dark-tones" ], "expresion": [ "enigmatic-mysterious-expression" ] }, "photo": { "style": [ "gothic-romantic" ], "lighting": [ "candlelight" ], "atmosphere": [ "gloomy-ominous" ] } } },
 
 {"id": "mascota", "title": "Retrato de una mascota adorable", "desc": "Primer plano con fondo desenfocado y luz de ventana.", "tags": [ "Animales", "Retrato" ], "aspect": "1:1", "sel": { "animals": { "especie": [ "dog" ], "personalidad": [ "playful-mischievous" ] }, "photo": { "lighting": [ "soft-window-light" ], "lens": [ "85mm-portrait" ], "atmosphere": [ "warm-cozy-comforting" ] } } },
 
 {"id": "nebulosa", "title": "Planeta frente a una nebulosa", "desc": "Escena espacial con un planeta anillado y una nebulosa de fondo.", "tags": [ "Espacio", "Fondos" ], "aspect": "16:9", "sel": { "space": { "tipo-escena": [ "giant-planet" ], "tipo-nebulosa": [ "red-emission-nebula" ], "anillos": [ "icy-ring-system" ] }, "photo": { "atmosphere": [ "timeless-eternal" ] } } },
 
 {"id": "salon-nordico", "title": "Salón nórdico acogedor", "desc": "Interior escandinavo con madera, plantas y luz cálida de tarde.", "tags": [ "Interiores" ], "aspect": "3:2", "sel": { "interior": { "tipo": [ "living-room-interior" ], "estilo": [ "scandinavian-design" ], "vegetacion": [ "decorative-houseplants" ] }, "photo": { "lighting": [ "soft-window-light" ], "atmosphere": [ "warm-cozy-comforting" ] } } },
 
 {"id": "calle-documental", "title": "Fotografía de calle documental", "desc": "Hombre en la ciudad, estilo documental con película analógica.", "tags": [ "Retrato" ], "aspect": "3:2", "sel": { "man": { "edad": [ "man-in-his-40s" ], "ropa": [ "wearing-a-parka-jacket-and-cargo-pants" ], "expresion": [ "thoughtful-pensive-expression" ] }, "photo": { "style": [ "documentary-photography" ], "lens": [ "35mm-documentary" ] } } },
 
 {"id": "reliquia", "title": "Reliquia mágica de producto", "desc": "Objeto antiguo de oro con runas, iluminado como foto de producto.", "tags": [ "Objetos" ], "aspect": "1:1", "sel": { "objects": { "tipo": [ "protective-amulet" ], "material-primario": [ "pure-gold" ], "simbolos": [ "ancient-runes" ] }, "photo": { "lighting": [ "soft-studio-softbox-lighting" ], "lens": [ "extreme-macro" ] } } },
 
 {"id": "acuarela-costa", "title": "Acuarela de acantilados", "desc": "Paisaje costero pintado en acuarela suave.", "tags": [ "Paisaje", "Ilustración" ], "aspect": "3:2", "sel": { "landscape": { "tipo": [ "towering-coastal-cliffs" ], "hora": [ "bright-morning-daylight" ] }, "photo": { "style": [ "soft-watercolor" ] } } },
 
 {"id": "cyberpunk-lluvia", "title": "Ciudad cyberpunk bajo la lluvia", "desc": "Ciudad futurista, lluvia y luces de neón reflejadas en el suelo.", "tags": [ "Fondos", "Fantasía" ], "aspect": "9:16", "sel": { "landscape": { "tipo": [ "futuristic-cyberpunk-cityscape" ], "hora": [ "dark-early-morning-darkness" ], "clima": [ "heavy-downpour-rain" ] }, "photo": { "style": [ "cyberpunk-neon" ], "lighting": [ "neon-cyberpunk-lighting" ] } } }
];
