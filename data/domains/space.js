// FUENTE DE DATOS de este generador. Edítala a mano para añadir o cambiar opciones.
// Esquema y reglas: docs/DATA-SCHEMA.md · Validar con: npm run validate · Reconstruir índices: npm run build
export default {
  "schema": 1,
  "id": "space",
  "slug": "espacio",
  "role": "setting",
  "order": 53,
  "meta": {"title":"Espacio","short":"Espacio","kicker":"Astrofotografía · Nebulosas · Galaxias · Planetas · Cosmos","summary":"Generador de prompts para fotos del espacio con IA: nebulosas, galaxias, planetas, lunas, estrellas y mas. Muchisimas opciones y estilos.","intro":"Crea imágenes del cosmos: nebulosas, galaxias, planetas, lunas, estrellas y fenómenos imposibles, con sus colores y sus escenas.","presetsLabel":"recetas"},
  "sections": [
    {
      "id": "tipo-escena",
      "title": "Tipo de escena cósmica",
      "mode": "single",
      "options": [
        {"id":"colorful-nebula","es":"Nebulosa colorida","en":"colorful nebula"},
        {"id":"spiral-galaxy","es":"Galaxia espiral","en":"spiral galaxy"},
        {"id":"giant-planet","es":"Planeta gigante","en":"giant planet"},
        {"id":"detailed-moon","es":"Luna detallada","en":"detailed moon"},
        {"id":"brilliant-star","es":"Estrella brillante","en":"brilliant star"},
        {"id":"distant-solar-system","es":"Sistema solar lejano","en":"distant solar system"},
        {"id":"black-hole","es":"Agujero negro","en":"black hole"},
        {"id":"exploding-supernova","es":"Supernova en explosión","en":"exploding supernova"},
        {"id":"comet-with-tail","es":"Cometa con cola","en":"comet with tail"},
        {"id":"asteroid-field","es":"Campo de asteroides","en":"asteroid field"},
        {"id":"star-cluster","es":"Cúmulo de estrellas","en":"star cluster"},
        {"id":"deep-field-of-galaxies","es":"Campo profundo de galaxias","en":"deep field of galaxies"},
        {"id":"planetary-aurora","es":"Aurora planetaria","en":"planetary aurora"},
        {"id":"cosmic-eclipse","es":"Eclipse cósmico","en":"cosmic eclipse"},
        {"id":"wormhole","es":"Agujero de gusano","en":"wormhole"},
        {"id":"meteor-shower","es":"Lluvia de meteoros","en":"meteor shower"},
        {"id":"panoramic-milky-way","es":"Vía Láctea panorámica","en":"panoramic Milky Way"},
        {"id":"protoplanetary-disk","es":"Disco protoplanetario","en":"protoplanetary disk"},
        {"id":"planetary-rings","es":"Anillos planetarios","en":"planetary rings"},
        {"id":"stellar-gas-storm","es":"Tormenta de gas estelar","en":"stellar gas storm"},
        {"id":"dark-cosmic-void","es":"Vacío cósmico oscuro","en":"dark cosmic void"},
        {"id":"colliding-galaxies","es":"Colisión de galaxias","en":"colliding galaxies"},
        {"id":"space-station-backdrop","es":"Estación espacial al fondo","en":"space station backdrop"},
        {"id":"planetary-horizon-from-orbit","es":"Horizonte planetario desde órbita","en":"planetary horizon from orbit"}
      ]
    },
    {
      "id": "tipo-nebulosa",
      "title": "Tipo de nebulosa",
      "mode": "single",
      "options": [
        {"id":"red-emission-nebula","es":"Nebulosa de emisión roja","en":"red emission nebula"},
        {"id":"blue-reflection-nebula","es":"Nebulosa de reflexión azul","en":"blue reflection nebula"},
        {"id":"ring-planetary-nebula","es":"Nebulosa planetaria anular","en":"ring planetary nebula"},
        {"id":"dense-dark-nebula","es":"Nebulosa oscura densa","en":"dense dark nebula"},
        {"id":"supernova-remnant","es":"Remanente de supernova","en":"supernova remnant"},
        {"id":"pillars-of-creation","es":"Pilares de creación","en":"pillars of creation"},
        {"id":"star-forming-nebula","es":"Nebulosa de formación estelar","en":"star-forming nebula"},
        {"id":"symmetric-bipolar-nebula","es":"Nebulosa bipolar simétrica","en":"symmetric bipolar nebula"},
        {"id":"butterfly-nebula","es":"Nebulosa de mariposa","en":"butterfly nebula"},
        {"id":"expanding-gas-bubble","es":"Burbuja de gas en expansión","en":"expanding gas bubble"},
        {"id":"filamentary-nebula","es":"Nebulosa filamentosa","en":"filamentary nebula"},
        {"id":"giant-molecular-cloud","es":"Nube molecular gigante","en":"giant molecular cloud"},
        {"id":"chaotic-multicolored-nebula","es":"Nebulosa multicolor caótica","en":"chaotic multicolored nebula"},
        {"id":"no-nebula","es":"Sin nebulosa","en":"no nebula"}
      ]
    },
    {
      "id": "tipo-galaxia",
      "title": "Tipo de galaxia",
      "mode": "single",
      "options": [
        {"id":"majestic-spiral-galaxy","es":"Espiral majestuosa","en":"majestic spiral galaxy"},
        {"id":"barred-spiral-galaxy","es":"Espiral barrada","en":"barred spiral galaxy"},
        {"id":"massive-elliptical-galaxy","es":"Elíptica masiva","en":"massive elliptical galaxy"},
        {"id":"chaotic-irregular-galaxy","es":"Irregular caótica","en":"chaotic irregular galaxy"},
        {"id":"ring-galaxy","es":"Galaxia anular","en":"ring galaxy"},
        {"id":"smooth-lenticular-galaxy","es":"Lenticular suave","en":"smooth lenticular galaxy"},
        {"id":"colliding-galaxy-pair","es":"Par en colisión","en":"colliding galaxy pair"},
        {"id":"dwarf-galaxy","es":"Galaxia enana","en":"dwarf galaxy"},
        {"id":"edge-on-galaxy","es":"Vista de canto","en":"edge-on galaxy"},
        {"id":"face-on-galaxy","es":"Vista frontal completa","en":"face-on galaxy"},
        {"id":"active-galactic-nucleus","es":"Galaxia con núcleo activo","en":"active galactic nucleus"},
        {"id":"whirlpool-with-companion","es":"Remolino con compañera","en":"whirlpool with companion"},
        {"id":"no-galaxy","es":"Sin galaxia","en":"no galaxy"}
      ]
    },
    {
      "id": "tipo-planeta",
      "title": "Tipo de planeta",
      "mode": "single",
      "options": [
        {"id":"banded-gas-giant","es":"Gigante gaseoso bandeado","en":"banded gas giant"},
        {"id":"gas-giant-with-great-storm","es":"Gigante con gran tormenta","en":"gas giant with great storm"},
        {"id":"rocky-terrestrial-planet","es":"Rocoso terrestre","en":"rocky terrestrial planet"},
        {"id":"frozen-ice-world","es":"Mundo de hielo","en":"frozen ice world"},
        {"id":"molten-lava-world","es":"Mundo de lava ardiente","en":"molten lava world"},
        {"id":"blue-ocean-world","es":"Mundo oceánico azul","en":"blue ocean world"},
        {"id":"arid-desert-planet","es":"Planeta desértico árido","en":"arid desert planet"},
        {"id":"ringed-planet","es":"Planeta con anillos","en":"ringed planet"},
        {"id":"green-super-earth","es":"Súper-Tierra verde","en":"green super-earth"},
        {"id":"hot-jupiter","es":"Júpiter caliente","en":"hot jupiter"},
        {"id":"sunless-rogue-planet","es":"Planeta errante sin sol","en":"sunless rogue planet"},
        {"id":"bluish-ice-giant","es":"Gigante de hielo azulado","en":"bluish ice giant"},
        {"id":"toxic-cloudy-world","es":"Mundo tóxico nuboso","en":"toxic cloudy world"},
        {"id":"exotic-alien-planet","es":"Planeta alienígena exótico","en":"exotic alien planet"},
        {"id":"habitable-earth-like-planet","es":"Planeta tierra-like habitable","en":"habitable earth-like planet"},
        {"id":"no-planet","es":"Sin planeta","en":"no planet"}
      ]
    },
    {
      "id": "tipo-luna",
      "title": "Tipo de luna / satélite",
      "mode": "single",
      "options": [
        {"id":"cratered-rocky-moon","es":"Luna rocosa craterizada","en":"cratered rocky moon"},
        {"id":"bright-icy-moon","es":"Luna helada brillante","en":"bright icy moon"},
        {"id":"active-volcanic-moon","es":"Luna volcánica activa","en":"active volcanic moon"},
        {"id":"subsurface-ocean-moon","es":"Luna oceánica bajo hielo","en":"subsurface ocean moon"},
        {"id":"captured-asteroid-moon","es":"Asteroide capturado","en":"captured asteroid moon"},
        {"id":"tidally-locked-moon","es":"Luna anclada por marea","en":"tidally locked moon"},
        {"id":"rusty-red-moon","es":"Luna roja oxidada","en":"rusty red moon"},
        {"id":"multiple-aligned-moons","es":"Múltiples lunas alineadas","en":"multiple aligned moons"},
        {"id":"giant-moon-in-the-sky","es":"Luna gigante en el cielo","en":"giant moon in the sky"},
        {"id":"moon-with-thin-atmosphere","es":"Luna con atmósfera tenue","en":"moon with thin atmosphere"},
        {"id":"shattered-moon-ring","es":"Luna fragmentada en anillo","en":"shattered moon ring"},
        {"id":"no-moon","es":"Sin luna","en":"no moon"}
      ]
    },
    {
      "id": "tipo-estrella",
      "title": "Tipo de estrella / sol",
      "mode": "single",
      "options": [
        {"id":"enormous-red-giant","es":"Gigante roja enorme","en":"enormous red giant"},
        {"id":"blue-supergiant","es":"Supergigante azul","en":"blue supergiant"},
        {"id":"dense-white-dwarf","es":"Enana blanca densa","en":"dense white dwarf"},
        {"id":"neutron-star","es":"Estrella de neutrones","en":"neutron star"},
        {"id":"double-binary-system","es":"Sistema binario doble","en":"double binary system"},
        {"id":"newborn-protostar","es":"Protoestrella naciente","en":"newborn protostar"},
        {"id":"sun-like-yellow-dwarf","es":"Enana amarilla tipo Sol","en":"sun-like yellow dwarf"},
        {"id":"dim-brown-dwarf","es":"Enana marrón tenue","en":"dim brown dwarf"},
        {"id":"pulsating-variable-star","es":"Estrella variable pulsante","en":"pulsating variable star"},
        {"id":"hypervelocity-runaway-star","es":"Estrella fugaz hipervelocidad","en":"hypervelocity runaway star"},
        {"id":"sun-with-solar-flares","es":"Sol con erupciones solares","en":"sun with solar flares"},
        {"id":"three-suns-in-the-sky","es":"Tres soles en el cielo","en":"three suns in the sky"},
        {"id":"no-featured-star","es":"Sin estrella protagonista","en":"no featured star"}
      ]
    },
    {
      "id": "fenomeno",
      "title": "Fenómeno cósmico",
      "mode": "single",
      "options": [
        {"id":"glowing-accretion-disk","es":"Disco de acreción brillante","en":"glowing accretion disk"},
        {"id":"pulsar-jets","es":"Chorros de pulsar","en":"pulsar jets"},
        {"id":"dazzling-quasar","es":"Quásar deslumbrante","en":"dazzling quasar"},
        {"id":"gravitational-lensing","es":"Lente gravitacional","en":"gravitational lensing"},
        {"id":"gamma-ray-burst","es":"Estallido de rayos gamma","en":"gamma-ray burst"},
        {"id":"magnetar-field-lines","es":"Magnetar con campos","en":"magnetar field lines"},
        {"id":"visible-stellar-wind","es":"Viento estelar visible","en":"visible stellar wind"},
        {"id":"hinted-dark-matter","es":"Materia oscura sugerida","en":"hinted dark matter"},
        {"id":"gravitational-waves","es":"Ondas gravitacionales","en":"gravitational waves"},
        {"id":"relativistic-galactic-jet","es":"Jet relativista de galaxia","en":"relativistic galactic jet"},
        {"id":"planetary-magnetic-storm","es":"Tormenta magnética planetaria","en":"planetary magnetic storm"},
        {"id":"none-clean-and-clear","es":"Ninguno claro y limpio","en":"none, clean and clear"}
      ]
    },
    {
      "id": "paleta-cosmica",
      "title": "Paleta de color cósmica",
      "note": "Multiselección: combina varios colores dominantes",
      "mode": "multi",
      "options": [
        {"id":"deep-blue","es":"Azul profundo","en":"deep blue"},
        {"id":"nebula-magenta","es":"Magenta nebuloso","en":"nebula magenta"},
        {"id":"stellar-pink","es":"Rosa estelar","en":"stellar pink"},
        {"id":"cosmic-purple","es":"Púrpura cósmico","en":"cosmic purple"},
        {"id":"electric-cyan","es":"Cian eléctrico","en":"electric cyan"},
        {"id":"emerald-green","es":"Verde esmeralda","en":"emerald green"},
        {"id":"solar-gold","es":"Dorado solar","en":"solar gold"},
        {"id":"fiery-orange","es":"Naranja ardiente","en":"fiery orange"},
        {"id":"crimson-red","es":"Rojo carmesí","en":"crimson red"},
        {"id":"bright-turquoise","es":"Turquesa brillante","en":"bright turquoise"},
        {"id":"intense-violet","es":"Violeta intenso","en":"intense violet"},
        {"id":"warm-amber","es":"Ámbar cálido","en":"warm amber"},
        {"id":"dark-indigo","es":"Índigo oscuro","en":"dark indigo"},
        {"id":"pure-stellar-white","es":"Blanco estelar puro","en":"pure stellar white"},
        {"id":"absolute-black-void","es":"Negro absoluto vacío","en":"absolute black void"},
        {"id":"rainbow-multicolor","es":"Multicolor arcoíris","en":"rainbow multicolor"},
        {"id":"cool-bluish-tones","es":"Tonos fríos azulados","en":"cool bluish tones"},
        {"id":"warm-golden-tones","es":"Tonos cálidos dorados","en":"warm golden tones"},
        {"id":"soft-ethereal-pastel","es":"Pastel etéreo suave","en":"soft ethereal pastel"},
        {"id":"vibrant-neon-saturated","es":"Saturado vibrante neón","en":"vibrant neon saturated"}
      ]
    },
    {
      "id": "composicion-gas",
      "title": "Composición de gas / material",
      "mode": "single",
      "options": [
        {"id":"glowing-red-hydrogen","es":"Hidrógeno rojo brillante","en":"glowing red hydrogen"},
        {"id":"teal-oxygen-glow","es":"Oxígeno azul verdoso","en":"teal oxygen glow"},
        {"id":"golden-sulfur","es":"Azufre dorado","en":"golden sulfur"},
        {"id":"luminous-ionized-gas","es":"Gas ionizado luminoso","en":"luminous ionized gas"},
        {"id":"dark-dust-lanes","es":"Carriles de polvo oscuro","en":"dark dust lanes"},
        {"id":"dense-molecular-clouds","es":"Nubes moleculares densas","en":"dense molecular clouds"},
        {"id":"incandescent-plasma","es":"Plasma incandescente","en":"incandescent plasma"},
        {"id":"ice-and-crystals","es":"Hielo y cristales","en":"ice and crystals"},
        {"id":"golden-stardust","es":"Polvo estelar dorado","en":"golden stardust"},
        {"id":"energy-filaments","es":"Filamentos de energía","en":"energy filaments"},
        {"id":"diffuse-cosmic-mist","es":"Niebla cósmica difusa","en":"diffuse cosmic mist"},
        {"id":"rocky-metallic-material","es":"Material rocoso y metálico","en":"rocky metallic material"}
      ]
    },
    {
      "id": "estrellas-fondo",
      "title": "Estrellas de fondo",
      "mode": "single",
      "options": [
        {"id":"dense-starfield","es":"Campo estelar denso","en":"dense starfield"},
        {"id":"sparse-scattered-stars","es":"Estrellas dispersas","en":"sparse scattered stars"},
        {"id":"milky-way-band","es":"Banda de la Vía Láctea","en":"Milky Way band"},
        {"id":"nearby-bright-cluster","es":"Cúmulo brillante cercano","en":"nearby bright cluster"},
        {"id":"twinkling-stars","es":"Estrellas centelleantes","en":"twinkling stars"},
        {"id":"few-stars-in-the-void","es":"Pocas estrellas en vacío","en":"few stars in the void"},
        {"id":"stars-with-cross-flares","es":"Estrellas con destellos cruzados","en":"stars with cross flares"},
        {"id":"thousands-of-distant-points","es":"Miles de puntos lejanos","en":"thousands of distant points"},
        {"id":"varied-colored-stars","es":"Estrellas de colores variados","en":"varied colored stars"},
        {"id":"near-black-deep-background","es":"Fondo casi negro profundo","en":"near-black deep background"}
      ]
    },
    {
      "id": "anillos",
      "title": "Anillos / discos",
      "mode": "single",
      "options": [
        {"id":"icy-ring-system","es":"Sistema de anillos helados","en":"icy ring system"},
        {"id":"thin-dusty-rings","es":"Anillos de polvo finos","en":"thin dusty rings"},
        {"id":"swirling-accretion-disk","es":"Disco de acreción giratorio","en":"swirling accretion disk"},
        {"id":"protoplanetary-disk","es":"Disco protoplanetario","en":"protoplanetary disk"},
        {"id":"debris-ring","es":"Anillo de escombros","en":"debris ring"},
        {"id":"spectacular-multiple-rings","es":"Anillos múltiples espectaculares","en":"spectacular multiple rings"},
        {"id":"glowing-gas-ring","es":"Anillo de gas brillante","en":"glowing gas ring"},
        {"id":"diffuse-surrounding-halo","es":"Halo difuso envolvente","en":"diffuse surrounding halo"},
        {"id":"edge-on-disk","es":"Disco visto de canto","en":"edge-on disk"},
        {"id":"no-rings","es":"Sin anillos","en":"no rings"}
      ]
    },
    {
      "id": "atmosfera-planeta",
      "title": "Atmósfera planetaria",
      "mode": "single",
      "options": [
        {"id":"thick-swirling-clouds","es":"Nubes espesas arremolinadas","en":"thick swirling clouds"},
        {"id":"banded-storms","es":"Tormentas bandeadas","en":"banded storms"},
        {"id":"great-oval-storm","es":"Gran tormenta ovalada","en":"great oval storm"},
        {"id":"thin-translucent-haze","es":"Bruma fina translúcida","en":"thin translucent haze"},
        {"id":"polar-auroras","es":"Auroras en los polos","en":"polar auroras"},
        {"id":"clear-clean-atmosphere","es":"Atmósfera clara limpia","en":"clear clean atmosphere"},
        {"id":"toxic-yellow-clouds","es":"Nubes tóxicas amarillas","en":"toxic yellow clouds"},
        {"id":"polar-vortices","es":"Vórtices polares","en":"polar vortices"},
        {"id":"lightning-in-the-clouds","es":"Relámpagos en las nubes","en":"lightning in the clouds"},
        {"id":"earth-like-blue-atmosphere","es":"Atmósfera azul terrestre","en":"earth-like blue atmosphere"},
        {"id":"reddish-martian-haze","es":"Neblina rojiza marciana","en":"reddish martian haze"},
        {"id":"airless-no-atmosphere","es":"Sin atmósfera","en":"airless, no atmosphere"}
      ]
    },
    {
      "id": "superficie-planeta",
      "title": "Superficie / terreno",
      "mode": "single",
      "options": [
        {"id":"impact-craters","es":"Cráteres de impacto","en":"impact craters"},
        {"id":"deep-canyons","es":"Cañones profundos","en":"deep canyons"},
        {"id":"vast-blue-oceans","es":"Océanos azules vastos","en":"vast blue oceans"},
        {"id":"polar-ice-caps","es":"Casquetes polares de hielo","en":"polar ice caps"},
        {"id":"glowing-lava-rivers","es":"Ríos de lava brillante","en":"glowing lava rivers"},
        {"id":"mountain-ranges","es":"Cadenas montañosas","en":"mountain ranges"},
        {"id":"endless-sand-dunes","es":"Dunas de arena interminables","en":"endless sand dunes"},
        {"id":"alien-vegetation","es":"Vegetación alienígena","en":"alien vegetation"},
        {"id":"nighttime-city-lights","es":"Luces de ciudades nocturnas","en":"nighttime city lights"},
        {"id":"cracked-glaciers","es":"Glaciares agrietados","en":"cracked glaciers"},
        {"id":"smoking-volcanoes","es":"Volcanes humeantes","en":"smoking volcanoes"},
        {"id":"gray-rocky-plains","es":"Llanuras rocosas grises","en":"gray rocky plains"},
        {"id":"no-surface-detail","es":"Sin detalle de superficie","en":"no surface detail"}
      ]
    },
    {
      "id": "primer-plano",
      "title": "Elemento en primer plano",
      "mode": "single",
      "options": [
        {"id":"silhouette-of-a-moon","es":"Silueta de una luna","en":"silhouette of a moon"},
        {"id":"curved-planet-edge","es":"Borde curvo de un planeta","en":"curved planet edge"},
        {"id":"distant-spacecraft","es":"Nave espacial lejana","en":"distant spacecraft"},
        {"id":"nearby-rocky-asteroid","es":"Asteroide rocoso cercano","en":"nearby rocky asteroid"},
        {"id":"horizon-of-a-world","es":"Horizonte de un mundo","en":"horizon of a world"},
        {"id":"orbital-station","es":"Estación orbital","en":"orbital station"},
        {"id":"floating-astronaut","es":"Astronauta flotando","en":"floating astronaut"},
        {"id":"gas-giant-ring-edge","es":"Anillo de un gigante gaseoso","en":"gas giant ring edge"},
        {"id":"space-telescope","es":"Telescopio espacial","en":"space telescope"},
        {"id":"megastructure-remnants","es":"Restos de una megaestructura","en":"megastructure remnants"},
        {"id":"no-foreground-open-sky","es":"Sin primer plano cielo abierto","en":"no foreground, open sky"}
      ]
    },
    {
      "id": "actividad",
      "title": "Eventos / actividad",
      "note": "Multiselección de eventos",
      "mode": "multi",
      "options": [
        {"id":"star-birth","es":"Nacimiento de estrellas","en":"star birth"},
        {"id":"supernova-explosion","es":"Explosión de supernova","en":"supernova explosion"},
        {"id":"galaxy-collision","es":"Colisión de galaxias","en":"galaxy collision"},
        {"id":"passing-comet","es":"Cometa cruzando","en":"passing comet"},
        {"id":"solar-flare-eruption","es":"Erupción solar","en":"solar flare eruption"},
        {"id":"meteor-shower","es":"Lluvia de meteoros","en":"meteor shower"},
        {"id":"eclipse-in-progress","es":"Eclipse en progreso","en":"eclipse in progress"},
        {"id":"planetary-transit","es":"Tránsito planetario","en":"planetary transit"},
        {"id":"black-hole-merger","es":"Fusión de agujeros negros","en":"black hole merger"},
        {"id":"magnetic-storm","es":"Tormenta magnética","en":"magnetic storm"},
        {"id":"expanding-gas-cloud","es":"Expansión de nube de gas","en":"expanding gas cloud"},
        {"id":"planetary-alignment","es":"Alineación planetaria","en":"planetary alignment"}
      ]
    },
    {
      "id": "fuente-luz",
      "title": "Fuente de luz cósmica",
      "mode": "single",
      "options": [
        {"id":"warm-distant-sun","es":"Sol distante cálido","en":"warm distant sun"},
        {"id":"bright-central-star","es":"Estrella central brillante","en":"bright central star"},
        {"id":"self-glowing-gas","es":"Resplandor del gas mismo","en":"self-glowing gas"},
        {"id":"two-suns-lighting","es":"Dos soles iluminando","en":"two suns lighting"},
        {"id":"black-hole-glow","es":"Brillo de agujero negro","en":"black hole glow"},
        {"id":"reflected-planet-light","es":"Luz reflejada de un planeta","en":"reflected planet light"},
        {"id":"cold-distant-blue-light","es":"Luz fría azulada lejana","en":"cold distant blue light"},
        {"id":"supernova-flash","es":"Destello de supernova","en":"supernova flash"},
        {"id":"cosmic-bioluminescence","es":"Bioluminiscencia cósmica","en":"cosmic bioluminescence"},
        {"id":"faint-mysterious-gloom","es":"Penumbra tenue misteriosa","en":"faint mysterious gloom"}
      ]
    },
    {
      "id": "escala-cosmica",
      "title": "Escala",
      "mode": "single",
      "options": [
        {"id":"close-surface-detail","es":"Detalle de superficie cercano","en":"close surface detail"},
        {"id":"full-planetary-scale","es":"Escala planetaria completa","en":"full planetary scale"},
        {"id":"solar-system-scale","es":"Escala de sistema solar","en":"solar system scale"},
        {"id":"enormous-galactic-scale","es":"Escala galáctica enorme","en":"enormous galactic scale"},
        {"id":"immense-cosmic-web","es":"Red cósmica inmensa","en":"immense cosmic web"},
        {"id":"close-up-of-gas-and-dust","es":"Primer plano de gas y polvo","en":"close-up of gas and dust"},
        {"id":"wide-field-panorama","es":"Panorámica de campo amplio","en":"wide-field panorama"},
        {"id":"intimate-single-object-view","es":"Vista íntima de un astro","en":"intimate single-object view"},
        {"id":"multiple-objects-in-scene","es":"Múltiples objetos en escena","en":"multiple objects in scene"},
        {"id":"overwhelming-vastness","es":"Inmensidad abrumadora","en":"overwhelming vastness"}
      ]
    },
    {
      "id": "punto-vista",
      "title": "Punto de vista",
      "mode": "single",
      "options": [
        {"id":"from-orbit","es":"Desde la órbita","en":"from orbit"},
        {"id":"from-a-moon-s-surface","es":"Desde la superficie de una luna","en":"from a moon's surface"},
        {"id":"deep-space-telescope","es":"Telescopio de espacio profundo","en":"deep space telescope"},
        {"id":"inside-the-nebula","es":"Dentro de la nebulosa","en":"inside the nebula"},
        {"id":"from-a-spacecraft-window","es":"Desde la ventana de una nave","en":"from a spacecraft window"},
        {"id":"top-down-descending-view","es":"Vista cenital descendente","en":"top-down descending view"},
        {"id":"looking-toward-the-horizon","es":"Mirando hacia el horizonte","en":"looking toward the horizon"},
        {"id":"floating-in-the-void","es":"Flotando en el vacío","en":"floating in the void"},
        {"id":"from-a-distant-planet","es":"Desde un planeta lejano","en":"from a distant planet"},
        {"id":"dramatic-close-approach","es":"Acercamiento dramático","en":"dramatic close approach"}
      ]
    },
    {
      "id": "estilo-astro",
      "title": "Estilo astronómico",
      "mode": "single",
      "options": [
        {"id":"hubble-deep-space-style","es":"Estilo Hubble espacio profundo","en":"Hubble deep space style"},
        {"id":"james-webb-infrared-style","es":"Estilo James Webb infrarrojo","en":"James Webb infrared style"},
        {"id":"long-exposure-astrophotography","es":"Astrofotografía larga exposición","en":"long-exposure astrophotography"},
        {"id":"nasa-scientific-visualization","es":"Visualización científica NASA","en":"NASA scientific visualization"},
        {"id":"conceptual-sci-fi-art","es":"Arte sci-fi conceptual","en":"conceptual sci-fi art"},
        {"id":"retro-pulp-space-art","es":"Arte espacial retro pulp","en":"retro pulp space art"},
        {"id":"photorealistic-3d-render","es":"Render 3D fotorrealista","en":"photorealistic 3d render"},
        {"id":"cosmic-oil-painting","es":"Pintura cósmica al óleo","en":"cosmic oil painting"},
        {"id":"scientific-false-color","es":"Falso color científico","en":"scientific false color"},
        {"id":"cinematic-hyperrealism","es":"Hiperrealismo cinematográfico","en":"cinematic hyperrealism"},
        {"id":"dreamy-ethereal-watercolor","es":"Acuarela etérea soñadora","en":"dreamy ethereal watercolor"},
        {"id":"epic-astronomy-documentary","es":"Documental astronómico épico","en":"epic astronomy documentary"}
      ]
    },
    {
      "id": "polvo-cosmico",
      "title": "Polvo y nubes cósmicas",
      "mode": "single",
      "options": [
        {"id":"dark-dust-lanes","es":"Carriles de polvo oscuro","en":"dark dust lanes"},
        {"id":"glowing-illuminated-dust","es":"Polvo brillante iluminado","en":"glowing illuminated dust"},
        {"id":"delicate-thin-filaments","es":"Filamentos finos delicados","en":"delicate thin filaments"},
        {"id":"dense-molecular-cloud","es":"Nube molecular densa","en":"dense molecular cloud"},
        {"id":"diffuse-enveloping-mist","es":"Niebla difusa envolvente","en":"diffuse enveloping mist"},
        {"id":"translucent-gas-veils","es":"Velos de gas translúcidos","en":"translucent gas veils"},
        {"id":"eroded-dust-columns","es":"Columnas de polvo erosionadas","en":"eroded dust columns"},
        {"id":"iridescent-golden-dust","es":"Polvo dorado iridiscente","en":"iridescent golden dust"},
        {"id":"no-dust-clean-sky","es":"Sin polvo cielo limpio","en":"no dust, clean sky"}
      ]
    },
    {
      "id": "cometa",
      "title": "Cometa / cola",
      "mode": "single",
      "options": [
        {"id":"bright-blue-ion-tail","es":"Cola de iones azul brillante","en":"bright blue ion tail"},
        {"id":"golden-dust-tail","es":"Cola de polvo dorada","en":"golden dust tail"},
        {"id":"dramatic-double-tail","es":"Doble cola dramática","en":"dramatic double tail"},
        {"id":"fragmenting-comet","es":"Cometa fragmentándose","en":"fragmenting comet"},
        {"id":"bright-icy-nucleus","es":"Núcleo helado brillante","en":"bright icy nucleus"},
        {"id":"faint-distant-comet","es":"Cometa lejano tenue","en":"faint distant comet"},
        {"id":"very-long-curved-tail","es":"Cola larguísima curvada","en":"very long curved tail"},
        {"id":"several-comets-at-once","es":"Varios cometas a la vez","en":"several comets at once"},
        {"id":"no-comet","es":"Sin cometa","en":"no comet"}
      ]
    },
    {
      "id": "via-lactea",
      "title": "Vía Láctea / fondo galáctico",
      "mode": "single",
      "options": [
        {"id":"visible-galactic-band","es":"Banda galáctica visible","en":"visible galactic band"},
        {"id":"bright-galactic-core","es":"Núcleo galáctico brillante","en":"bright galactic core"},
        {"id":"central-dark-rift","es":"Grieta oscura central","en":"central dark rift"},
        {"id":"galaxy-seen-edge-on","es":"Galaxia vista de canto","en":"galaxy seen edge-on"},
        {"id":"full-arch-over-landscape","es":"Arco completo sobre el paisaje","en":"full arch over landscape"},
        {"id":"distant-galaxies-background","es":"Fondo de galaxias lejanas","en":"distant galaxies background"},
        {"id":"saturated-galactic-sky","es":"Cielo galáctico saturado","en":"saturated galactic sky"},
        {"id":"no-milky-way","es":"Sin Vía Láctea","en":"no Milky Way"}
      ]
    },
    {
      "id": "profundidad",
      "title": "Profundidad / capas",
      "mode": "single",
      "options": [
        {"id":"multiple-depth-layers","es":"Múltiples capas de profundidad","en":"multiple depth layers"},
        {"id":"planet-front-nebula-behind","es":"Planeta delante, nebulosa detrás","en":"planet front, nebula behind"},
        {"id":"immense-empty-depth","es":"Profundidad vacía inmensa","en":"immense empty depth"},
        {"id":"sharp-foreground-soft-background","es":"Primer plano nítido, fondo difuso","en":"sharp foreground, soft background"},
        {"id":"overlapping-gas-strata","es":"Estratos de gas superpuestos","en":"overlapping gas strata"},
        {"id":"three-dimensional-feel","es":"Sensación tridimensional","en":"three-dimensional feel"},
        {"id":"flat-single-plane","es":"Todo en un plano plano","en":"flat single plane"},
        {"id":"receding-perspective","es":"Perspectiva que se aleja","en":"receding perspective"}
      ]
    },
    {
      "id": "fenomeno-luz",
      "title": "Fenómenos de luz",
      "note": "Multiselección de efectos de luz",
      "mode": "multi",
      "options": [
        {"id":"gravitational-lens-arcs","es":"Arcos de lente gravitacional","en":"gravitational lens arcs"},
        {"id":"light-echoes","es":"Ecos de luz","en":"light echoes"},
        {"id":"god-rays-through-dust","es":"Rayos de luz entre el polvo","en":"god rays through dust"},
        {"id":"lens-flares","es":"Destellos de lente","en":"lens flares"},
        {"id":"glowing-surrounding-halo","es":"Halo brillante envolvente","en":"glowing surrounding halo"},
        {"id":"diffraction-star-spikes","es":"Difracción en púas estelares","en":"diffraction star spikes"},
        {"id":"chromatic-reflections","es":"Reflejos cromáticos","en":"chromatic reflections"},
        {"id":"atmospheric-glow","es":"Resplandor atmosférico","en":"atmospheric glow"},
        {"id":"subtle-rim-glow","es":"Brillo de borde sutil","en":"subtle rim glow"},
        {"id":"none-neutral-light","es":"Ninguno luz neutra","en":"none, neutral light"}
      ]
    },
    {
      "id": "rareza",
      "title": "Rareza / realismo",
      "mode": "single",
      "options": [
        {"id":"plausible-scientific-realism","es":"Realista plausible científico","en":"plausible scientific realism"},
        {"id":"exotic-alien","es":"Exótico alienígena","en":"exotic alien"},
        {"id":"impossible-fantasy","es":"Fantasía imposible","en":"impossible fantasy"},
        {"id":"hyper-saturated-artistic","es":"Hipersaturado artístico","en":"hyper-saturated artistic"},
        {"id":"surreal-dreamlike","es":"Onírico surrealista","en":"surreal dreamlike"},
        {"id":"clean-minimalist","es":"Minimalista limpio","en":"clean minimalist"},
        {"id":"epic-grandiose","es":"Épico grandioso","en":"epic grandiose"},
        {"id":"mysterious-enigmatic","es":"Misterioso enigmático","en":"mysterious enigmatic"}
      ]
    },
    {
      "id": "mood",
      "title": "Mood cósmico",
      "mode": "single",
      "options": [
        {"id":"serene-and-peaceful","es":"Sereno y pacífico","en":"serene and peaceful"},
        {"id":"awe-inspiring-sublime","es":"Sobrecogedor sublime","en":"awe-inspiring sublime"},
        {"id":"ominous-threatening","es":"Ominoso amenazante","en":"ominous threatening"},
        {"id":"lonely-melancholic","es":"Solitario melancólico","en":"lonely melancholic"},
        {"id":"majestic-imposing","es":"Majestuoso imponente","en":"majestic imposing"},
        {"id":"violent-chaotic","es":"Violento caótico","en":"violent chaotic"},
        {"id":"mystical-spiritual","es":"Místico espiritual","en":"mystical spiritual"},
        {"id":"hopeful-luminous","es":"Esperanzador luminoso","en":"hopeful luminous"},
        {"id":"cold-and-infinite","es":"Frío e infinito","en":"cold and infinite"},
        {"id":"warm-and-inviting","es":"Cálido y acogedor","en":"warm and inviting"}
      ]
    },
    {
      "id": "detalle-emisivo",
      "title": "Detalles luminosos",
      "mode": "single",
      "options": [
        {"id":"incandescent-central-core","es":"Núcleo central incandescente","en":"incandescent central core"},
        {"id":"bright-twinkling-stars","es":"Estrellas centelleantes brillantes","en":"bright twinkling stars"},
        {"id":"pulsing-latent-gas","es":"Gas pulsante latente","en":"pulsing latent gas"},
        {"id":"neon-glowing-edges","es":"Bordes con brillo neón","en":"neon glowing edges"},
        {"id":"floating-bioluminescence","es":"Bioluminiscencia flotante","en":"floating bioluminescence"},
        {"id":"scattered-energy-flashes","es":"Destellos de energía dispersos","en":"scattered energy flashes"},
        {"id":"soft-diffuse-glow","es":"Resplandor suave difuso","en":"soft diffuse glow"},
        {"id":"no-glow-muted","es":"Sin brillos apagado","en":"no glow, muted"}
      ]
    },
    {
      "id": "extra",
      "title": "Toque final / rasgo único",
      "mode": "single",
      "options": [
        {"id":"none-clean-and-direct","es":"Ninguno limpio y directo","en":"none, clean and direct"},
        {"id":"distant-civilization-lights","es":"Luces de civilización lejana","en":"distant civilization lights"},
        {"id":"ancient-megastructure","es":"Megaestructura antigua","en":"ancient megastructure"},
        {"id":"mysterious-pulsing-signal","es":"Señal misteriosa pulsante","en":"mysterious pulsing signal"},
        {"id":"recognizable-constellation-shape","es":"Constelación con forma reconocible","en":"recognizable constellation shape"},
        {"id":"spacetime-mirage","es":"Espejismo de espacio-tiempo","en":"spacetime mirage"},
        {"id":"reflection-in-a-visor","es":"Reflejo en un visor","en":"reflection in a visor"},
        {"id":"impossible-surreal-detail","es":"Detalle imposible surrealista","en":"impossible surreal detail"},
        {"id":"hypnotic-perfect-symmetry","es":"Simetría perfecta hipnótica","en":"hypnotic perfect symmetry"},
        {"id":"tiny-human-scale-touch","es":"Toque de escala humana diminuta","en":"tiny human-scale touch"}
      ]
    }
  ]
};
