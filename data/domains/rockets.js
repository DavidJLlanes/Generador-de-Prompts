// FUENTE DE DATOS de este generador. Edítala a mano para añadir o cambiar opciones.
// Esquema y reglas: docs/DATA-SCHEMA.md · Validar con: npm run validate · Reconstruir índices: npm run build
export default {
  "schema": 1,
  "id": "rockets",
  "slug": "cohetes",
  "role": "subject",
  "order": 17,
  "lead": "a rocket",
  "meta": {"title":"Cohetes","short":"Cohetes","kicker":"Diseñador de Cohetes · Naves Espaciales · Lanzamientos · Exploración","summary":"Generador de prompts para cohetes y naves espaciales con IA. Elige tipo, estilo de imagen, colores, escenario y mucho mas.","intro":"Diseña un cohete o una nave espacial: tipo, propulsión, forma y colores principales. Sitúalo en el espacio o en un escenario y aplícale un estilo de imagen."},
  "sections": [
    {
      "id": "tipo-cohete",
      "title": "Tipo de cohete",
      "mode": "single",
      "options": [
        {"id":"orbital-launch-rocket","es":"Cohete orbital de lanzamiento","en":"orbital launch rocket"},
        {"id":"suborbital-rocket","es":"Cohete suborbital","en":"suborbital rocket"},
        {"id":"heavy-lift-launch-vehicle","es":"Cohete pesado de carga","en":"heavy-lift launch vehicle"},
        {"id":"giant-super-heavy-rocket","es":"Súper cohete gigante","en":"giant super heavy rocket"},
        {"id":"reusable-rocket-booster","es":"Cohete reutilizable","en":"reusable rocket booster"},
        {"id":"space-shuttle-orbiter","es":"Lanzadera espacial transbordador","en":"space shuttle orbiter"},
        {"id":"sci-fi-starship","es":"Nave estelar sci-fi","en":"sci-fi starship"},
        {"id":"interplanetary-cruiser","es":"Crucero interplanetario","en":"interplanetary cruiser"},
        {"id":"generation-ship","es":"Nave generacional","en":"generation ship"},
        {"id":"lunar-lander-module","es":"Módulo de aterrizaje lunar","en":"lunar lander module"},
        {"id":"ion-drive-probe","es":"Sonda de propulsión iónica","en":"ion-drive probe"},
        {"id":"retro-1950s-rocket","es":"Cohete retro años 50","en":"retro 1950s rocket"},
        {"id":"toy-model-rocket","es":"Cohete de juguete modelo","en":"toy model rocket"},
        {"id":"military-ballistic-missile","es":"Misil balístico militar","en":"military ballistic missile"},
        {"id":"crewed-space-capsule","es":"Cápsula tripulada","en":"crewed space capsule"},
        {"id":"scientific-sounding-rocket","es":"Cohete sonda científico","en":"scientific sounding rocket"},
        {"id":"cryogenic-fueled-launcher","es":"Lanzadera de combustible criogénico","en":"cryogenic fueled launcher"},
        {"id":"solid-fuel-rocket","es":"Cohete de combustible sólido","en":"solid fuel rocket"},
        {"id":"nuclear-thermal-rocket","es":"Cohete de propulsión nuclear","en":"nuclear thermal rocket"},
        {"id":"solar-sail-craft","es":"Vela solar impulsada","en":"solar sail craft"},
        {"id":"brass-steampunk-rocket","es":"Cohete steampunk de latón","en":"brass steampunk rocket"},
        {"id":"landing-exploration-craft","es":"Ojiva exploradora de aterrizaje","en":"landing exploration craft"}
      ]
    },
    {
      "id": "era",
      "title": "Era / época",
      "mode": "single",
      "options": [
        {"id":"1960s-space-race-era","es":"Carrera espacial años 60","en":"1960s space race era"},
        {"id":"1950s-pulp-retrofuturism","es":"Retrofuturismo pulp años 50","en":"1950s pulp retrofuturism"},
        {"id":"shuttle-era","es":"Era de los transbordadores","en":"shuttle era"},
        {"id":"modern-private-spaceflight","es":"Era espacial moderna privada","en":"modern private spaceflight"},
        {"id":"near-future-2040","es":"Futuro cercano 2040","en":"near future 2040"},
        {"id":"far-future-advanced","es":"Futuro lejano avanzado","en":"far future advanced"},
        {"id":"golden-age-sci-fi","es":"Ciencia ficción dorada","en":"golden age sci-fi"},
        {"id":"post-apocalyptic-dystopia","es":"Distopía post-apocalíptica","en":"post-apocalyptic dystopia"},
        {"id":"solarpunk-utopia","es":"Utopía solarpunk","en":"solarpunk utopia"},
        {"id":"victorian-steampunk","es":"Steampunk victoriano","en":"Victorian steampunk"},
        {"id":"1940s-dieselpunk","es":"Dieselpunk años 40","en":"1940s dieselpunk"},
        {"id":"cold-war-atompunk","es":"Atompunk guerra fría","en":"cold war atompunk"},
        {"id":"corporate-cyberpunk","es":"Cyberpunk corporativo","en":"corporate cyberpunk"},
        {"id":"ancient-alien-antiquity","es":"Antigüedad alienígena","en":"ancient alien antiquity"},
        {"id":"timeless-eternal","es":"Atemporal eterno","en":"timeless eternal"}
      ]
    },
    {
      "id": "etapas",
      "title": "Etapas / configuración",
      "mode": "single",
      "options": [
        {"id":"single-stage-to-orbit","es":"Monoetapa SSTO","en":"single-stage to orbit"},
        {"id":"classic-two-stage","es":"Dos etapas clásico","en":"classic two-stage"},
        {"id":"three-stage-heavy","es":"Tres etapas pesado","en":"three-stage heavy"},
        {"id":"twin-strap-on-boosters","es":"Propulsores laterales gemelos","en":"twin strap-on boosters"},
        {"id":"four-side-boosters","es":"Cuatro propulsores laterales","en":"four side boosters"},
        {"id":"reinforced-central-core","es":"Núcleo central reforzado","en":"reinforced central core"},
        {"id":"upper-stage-with-fairing","es":"Etapa superior con cofia","en":"upper stage with fairing"},
        {"id":"clustered-multiple-boosters","es":"Racimo de propulsores múltiples","en":"clustered multiple boosters"},
        {"id":"separate-landing-stage","es":"Etapa de aterrizaje separada","en":"separate landing stage"},
        {"id":"vertically-stacked-stack","es":"Configuración apilada vertical","en":"vertically stacked stack"},
        {"id":"single-monolithic-body","es":"Cohete monolítico único","en":"single monolithic body"},
        {"id":"radial-booster-ring","es":"Anillo de propulsores radiales","en":"radial booster ring"}
      ]
    },
    {
      "id": "escala",
      "title": "Tamaño / escala",
      "mode": "single",
      "options": [
        {"id":"colossal-kilometer-tall-rocket","es":"Cohete colosal kilométrico","en":"colossal kilometer-tall rocket"},
        {"id":"gigantic-super-heavy","es":"Súper pesado gigantesco","en":"gigantic super-heavy"},
        {"id":"large-imposing","es":"Grande imponente","en":"large imposing"},
        {"id":"medium-standard-size","es":"Tamaño mediano estándar","en":"medium standard size"},
        {"id":"compact-agile","es":"Compacto ágil","en":"compact agile"},
        {"id":"small-sounding-rocket","es":"Pequeño cohete sonda","en":"small sounding rocket"},
        {"id":"miniature-toy-scale","es":"Miniatura de juguete","en":"miniature toy scale"},
        {"id":"human-scale-comparison","es":"Escala humana comparativa","en":"human-scale comparison"},
        {"id":"dwarfing-skyscrapers","es":"Empequeñece rascacielos","en":"dwarfing skyscrapers"},
        {"id":"visible-from-space","es":"Visible desde el espacio","en":"visible from space"}
      ]
    },
    {
      "id": "fuselaje",
      "title": "Forma del fuselaje",
      "mode": "single",
      "options": [
        {"id":"sleek-classic-cylinder","es":"Cilindro esbelto clásico","en":"sleek classic cylinder"},
        {"id":"sharp-aerodynamic-cone","es":"Cono aerodinámico afilado","en":"sharp aerodynamic cone"},
        {"id":"robust-industrial-tube","es":"Tubo robusto industrial","en":"robust industrial tube"},
        {"id":"retro-bullet-silhouette","es":"Silueta de bala retro","en":"retro bullet silhouette"},
        {"id":"bulbous-organic-hull","es":"Casco bulboso orgánico","en":"bulbous organic hull"},
        {"id":"segmented-modular-fuselage","es":"Fuselaje segmentado modular","en":"segmented modular fuselage"},
        {"id":"exposed-lattice-structure","es":"Estructura de celosía expuesta","en":"exposed lattice structure"},
        {"id":"curved-bionic-design","es":"Diseño biónico curvo","en":"curved bionic design"},
        {"id":"angular-faceted-body","es":"Cuerpo facetado angular","en":"angular faceted body"},
        {"id":"coaxial-double-hull","es":"Doble casco coaxial","en":"coaxial double hull"},
        {"id":"narrow-wasp-waist","es":"Cintura estrecha avispa","en":"narrow wasp waist"},
        {"id":"visible-reinforcing-rings","es":"Anillos reforzados visibles","en":"visible reinforcing rings"}
      ]
    },
    {
      "id": "cofia",
      "title": "Cofia / cono de nariz",
      "mode": "single",
      "options": [
        {"id":"classic-ogive-nose-cone","es":"Cono ojival clásico","en":"classic ogive nose cone"},
        {"id":"sharp-needle-tip","es":"Punta afilada aguja","en":"sharp needle tip"},
        {"id":"blunt-rounded-fairing","es":"Cofia roma redondeada","en":"blunt rounded fairing"},
        {"id":"split-clamshell-fairing","es":"Cofia bivalva que se abre","en":"split clamshell fairing"},
        {"id":"docked-crew-capsule","es":"Cápsula tripulada acoplada","en":"docked crew capsule"},
        {"id":"nose-cone-with-windows","es":"Cono con ventanas","en":"nose cone with windows"},
        {"id":"elongated-payload-fairing","es":"Cofia de carga alargada","en":"elongated payload fairing"},
        {"id":"ablative-heat-shield","es":"Escudo térmico ablativo","en":"ablative heat shield"},
        {"id":"exposed-antennas-and-sensors","es":"Antena y sensores expuestos","en":"exposed antennas and sensors"},
        {"id":"tip-with-waving-flag","es":"Punta con bandera ondeante","en":"tip with waving flag"},
        {"id":"retro-cone-with-small-fins","es":"Cono retro con aletas pequeñas","en":"retro cone with small fins"}
      ]
    },
    {
      "id": "aletas",
      "title": "Aletas / estabilizadores",
      "mode": "single",
      "options": [
        {"id":"four-large-retro-fins","es":"Cuatro aletas retro grandes","en":"four large retro fins"},
        {"id":"three-triangular-fins","es":"Tres aletas triangulares","en":"three triangular fins"},
        {"id":"grid-fins","es":"Aletas tipo rejilla","en":"grid fins"},
        {"id":"finless-clean-profile","es":"Sin aletas perfil limpio","en":"finless clean profile"},
        {"id":"curved-aerodynamic-fins","es":"Aletas curvas aerodinámicas","en":"curved aerodynamic fins"},
        {"id":"deployable-folding-fins","es":"Aletas plegables desplegables","en":"deployable folding fins"},
        {"id":"extended-landing-legs","es":"Patas de aterrizaje extendidas","en":"extended landing legs"},
        {"id":"glowing-neon-fins","es":"Aletas neón luminosas","en":"glowing neon fins"},
        {"id":"canard-stabilizers","es":"Estabilizadores de canard","en":"canard stabilizers"},
        {"id":"carnival-rocket-fins","es":"Aletas de cohete de feria","en":"carnival rocket fins"},
        {"id":"dart-style-finlets","es":"Alerones tipo dardo","en":"dart-style finlets"}
      ]
    },
    {
      "id": "propulsion",
      "title": "Sistema de propulsión",
      "mode": "single",
      "options": [
        {"id":"cluster-of-chemical-engines","es":"Racimo de motores químicos","en":"cluster of chemical engines"},
        {"id":"single-high-thrust-engine","es":"Motor único de gran empuje","en":"single high-thrust engine"},
        {"id":"thirty-three-engine-array","es":"Treinta y tres motores","en":"thirty-three engine array"},
        {"id":"blue-ion-propulsion","es":"Propulsión iónica azul","en":"blue ion propulsion"},
        {"id":"glowing-plasma-engine","es":"Motor de plasma brillante","en":"glowing plasma engine"},
        {"id":"nuclear-thermal-engine","es":"Cohete nuclear térmico","en":"nuclear thermal engine"},
        {"id":"experimental-fusion-drive","es":"Motor de fusión experimental","en":"experimental fusion drive"},
        {"id":"thrust-vectoring-nozzles","es":"Toberas de vectorización","en":"thrust-vectoring nozzles"},
        {"id":"solid-rocket-motors","es":"Propulsores de combustible sólido","en":"solid rocket motors"},
        {"id":"cryogenic-hydrogen-engine","es":"Motor criogénico de hidrógeno","en":"cryogenic hydrogen engine"},
        {"id":"sci-fi-antigravity-drive","es":"Propulsión antigravedad sci-fi","en":"sci-fi antigravity drive"},
        {"id":"warp-curvature-drive","es":"Motor warp de curvatura","en":"warp curvature drive"},
        {"id":"engineless-solar-sail","es":"Vela solar sin motor","en":"engineless solar sail"}
      ]
    },
    {
      "id": "llama",
      "title": "Llama / escape del motor",
      "mode": "single",
      "options": [
        {"id":"intense-orange-flame","es":"Llamarada naranja intensa","en":"intense orange flame"},
        {"id":"bright-yellow-fire","es":"Fuego amarillo brillante","en":"bright yellow fire"},
        {"id":"electric-blue-plasma","es":"Plasma azul eléctrico","en":"electric blue plasma"},
        {"id":"near-invisible-hydrogen-exhaust","es":"Escape de hidrógeno casi invisible","en":"near-invisible hydrogen exhaust"},
        {"id":"toxic-green-flames","es":"Llamas verdes tóxicas","en":"toxic green flames"},
        {"id":"purple-ion-glow","es":"Resplandor púrpura iónico","en":"purple ion glow"},
        {"id":"pillar-of-smoke-and-fire","es":"Columna de humo y fuego","en":"pillar of smoke and fire"},
        {"id":"mach-shock-diamonds","es":"Anillos de choque Mach","en":"mach shock diamonds"},
        {"id":"long-incandescent-trail","es":"Estela incandescente larga","en":"long incandescent trail"},
        {"id":"blinding-white-fire","es":"Fuego blanco cegador","en":"blinding white fire"},
        {"id":"scattered-sparks-and-embers","es":"Chispas y brasas dispersas","en":"scattered sparks and embers"},
        {"id":"rippling-warp-energy","es":"Energía de curvatura ondulante","en":"rippling warp energy"},
        {"id":"flameless-cold-propulsion","es":"Sin llama propulsión fría","en":"flameless cold propulsion"}
      ]
    },
    {
      "id": "fase",
      "title": "Fase / momento del vuelo",
      "mode": "single",
      "options": [
        {"id":"standing-on-the-launch-pad","es":"En la plataforma de lanzamiento","en":"standing on the launch pad"},
        {"id":"ignition-and-engine-start","es":"Encendido e ignición","en":"ignition and engine start"},
        {"id":"dramatic-liftoff","es":"Despegue dramático","en":"dramatic liftoff"},
        {"id":"powerful-vertical-ascent","es":"Ascenso vertical potente","en":"powerful vertical ascent"},
        {"id":"breaking-through-the-clouds","es":"Atravesando las nubes","en":"breaking through the clouds"},
        {"id":"max-dynamic-pressure","es":"Máxima presión dinámica","en":"max dynamic pressure"},
        {"id":"stage-separation","es":"Separación de etapas","en":"stage separation"},
        {"id":"weightless-in-orbit","es":"En órbita ingrávido","en":"weightless in orbit"},
        {"id":"fiery-atmospheric-reentry","es":"Reentrada ardiente","en":"fiery atmospheric reentry"},
        {"id":"controlled-descent","es":"Descenso controlado","en":"controlled descent"},
        {"id":"propulsive-landing","es":"Aterrizaje propulsivo","en":"propulsive landing"},
        {"id":"orbital-docking","es":"Acoplamiento orbital","en":"orbital docking"},
        {"id":"spectacular-explosion","es":"Explosión espectacular","en":"spectacular explosion"},
        {"id":"technical-exploded-view","es":"Vista de despiece técnico","en":"technical exploded view"}
      ]
    },
    {
      "id": "material",
      "title": "Material / acabado del casco",
      "mode": "single",
      "options": [
        {"id":"mirror-polished-stainless-steel","es":"Acero inoxidable pulido espejo","en":"mirror-polished stainless steel"},
        {"id":"brushed-matte-steel","es":"Acero cepillado mate","en":"brushed matte steel"},
        {"id":"classic-silver-aluminum","es":"Aluminio plateado clásico","en":"classic silver aluminum"},
        {"id":"smooth-white-ceramic","es":"Cerámica blanca lisa","en":"smooth white ceramic"},
        {"id":"woven-carbon-fiber","es":"Fibra de carbono tejida","en":"woven carbon fiber"},
        {"id":"aged-patinated-copper","es":"Cobre envejecido patinado","en":"aged patinated copper"},
        {"id":"riveted-steampunk-brass","es":"Latón steampunk remachado","en":"riveted steampunk brass"},
        {"id":"iridescent-titanium","es":"Titanio iridiscente","en":"iridescent titanium"},
        {"id":"reflective-space-gold-foil","es":"Oro espacial reflectante","en":"reflective space gold foil"},
        {"id":"flat-matte-painted-shell","es":"Pintura mate cubierta","en":"flat matte painted shell"},
        {"id":"scorched-heat-shield-tiles","es":"Escudo térmico chamuscado","en":"scorched heat-shield tiles"},
        {"id":"glossy-retro-chrome","es":"Cromado brillante retro","en":"glossy retro chrome"},
        {"id":"exotic-alien-alloy","es":"Aleación alienígena exótica","en":"exotic alien alloy"},
        {"id":"transparent-glass-hull","es":"Casco transparente de cristal","en":"transparent glass hull"}
      ]
    },
    {
      "id": "colores",
      "title": "Colores principales",
      "note": "Multiselección: combina varios colores dominantes",
      "mode": "multi",
      "options": [
        {"id":"pure-white","es":"Blanco puro","en":"pure white"},
        {"id":"matte-black","es":"Negro mate","en":"matte black"},
        {"id":"vivid-red","es":"Rojo intenso","en":"vivid red"},
        {"id":"bright-orange","es":"Naranja brillante","en":"bright orange"},
        {"id":"golden-yellow","es":"Amarillo dorado","en":"golden yellow"},
        {"id":"lime-green","es":"Verde lima","en":"lime green"},
        {"id":"military-green","es":"Verde militar","en":"military green"},
        {"id":"sky-blue","es":"Azul cielo","en":"sky blue"},
        {"id":"deep-navy-blue","es":"Azul marino profundo","en":"deep navy blue"},
        {"id":"electric-cyan","es":"Cian eléctrico","en":"electric cyan"},
        {"id":"royal-purple","es":"Púrpura real","en":"royal purple"},
        {"id":"neon-magenta","es":"Magenta neón","en":"neon magenta"},
        {"id":"pastel-pink","es":"Rosa pastel","en":"pastel pink"},
        {"id":"metallic-silver","es":"Plata metálico","en":"metallic silver"},
        {"id":"metallic-gold","es":"Oro metálico","en":"metallic gold"},
        {"id":"copper-bronze","es":"Cobre bronce","en":"copper bronze"},
        {"id":"steel-gray","es":"Gris acero","en":"steel gray"},
        {"id":"turquoise","es":"Turquesa","en":"turquoise"},
        {"id":"dark-crimson","es":"Carmesí oscuro","en":"dark crimson"},
        {"id":"emerald-green","es":"Verde esmeralda","en":"emerald green"},
        {"id":"burnt-orange","es":"Naranja quemado","en":"burnt orange"},
        {"id":"cobalt-blue","es":"Azul cobalto","en":"cobalt blue"},
        {"id":"classic-white-and-red","es":"Blanco y rojo clásico","en":"classic white and red"},
        {"id":"luxurious-black-and-gold","es":"Negro y dorado lujoso","en":"luxurious black and gold"},
        {"id":"iridescent-rainbow","es":"Iridiscente arcoíris","en":"iridescent rainbow"},
        {"id":"holographic-chrome","es":"Cromo holográfico","en":"holographic chrome"}
      ]
    },
    {
      "id": "librea",
      "title": "Esquema de pintura / librea",
      "mode": "single",
      "options": [
        {"id":"clean-minimal-livery","es":"Librea limpia minimalista","en":"clean minimal livery"},
        {"id":"racing-stripes","es":"Bandas de carrera","en":"racing stripes"},
        {"id":"checkerboard-pattern","es":"Patrón de tablero ajedrez","en":"checkerboard pattern"},
        {"id":"military-camouflage","es":"Camuflaje militar","en":"military camouflage"},
        {"id":"smooth-gradient-fade","es":"Degradado suave","en":"smooth gradient fade"},
        {"id":"geometric-color-blocks","es":"Bloques de color geométricos","en":"geometric color blocks"},
        {"id":"technical-calibration-lines","es":"Líneas técnicas de calibración","en":"technical calibration lines"},
        {"id":"retro-1960s-pattern","es":"Patrón retro de los 60","en":"retro 1960s pattern"},
        {"id":"painted-hot-rod-flames","es":"Llamas pintadas hot-rod","en":"painted hot-rod flames"},
        {"id":"stars-and-constellations","es":"Estrellas y constelaciones","en":"stars and constellations"},
        {"id":"glowing-neon-pinstripes","es":"Líneas de neón luminosas","en":"glowing neon pinstripes"},
        {"id":"weathered-battle-finish","es":"Acabado desgastado de guerra","en":"weathered battle finish"},
        {"id":"unmarked-stealth-matte","es":"Mate sin marcas sigiloso","en":"unmarked stealth matte"}
      ]
    },
    {
      "id": "insignias",
      "title": "Marcas / insignias",
      "note": "Multiselección de emblemas",
      "mode": "multi",
      "options": [
        {"id":"national-flag","es":"Bandera nacional","en":"national flag"},
        {"id":"corporate-logo","es":"Logotipo corporativo","en":"corporate logo"},
        {"id":"mission-patch-insignia","es":"Insignia de misión","en":"mission patch insignia"},
        {"id":"stenciled-serial-number","es":"Número de serie estarcido","en":"stenciled serial number"},
        {"id":"warning-symbols","es":"Símbolos de advertencia","en":"warning symbols"},
        {"id":"space-agency-emblem","es":"Emblema de agencia espacial","en":"space agency emblem"},
        {"id":"painted-rocket-name","es":"Nombre del cohete pintado","en":"painted rocket name"},
        {"id":"sponsor-markings","es":"Marcas de patrocinadores","en":"sponsor markings"},
        {"id":"heraldic-coat-of-arms","es":"Escudo de armas heráldico","en":"heraldic coat of arms"},
        {"id":"alien-glyphs","es":"Glifos alienígenas","en":"alien glyphs"},
        {"id":"retro-pulp-iconography","es":"Iconografía retro pulp","en":"retro pulp iconography"},
        {"id":"flight-tally-marks","es":"Marcas de registro de vuelos","en":"flight tally marks"}
      ]
    },
    {
      "id": "superficie",
      "title": "Detalles de superficie",
      "mode": "single",
      "options": [
        {"id":"visible-rivets-and-panels","es":"Remaches y paneles visibles","en":"visible rivets and panels"},
        {"id":"fine-panel-lines","es":"Líneas de panel finas","en":"fine panel lines"},
        {"id":"exposed-pipes-and-conduits","es":"Tuberías y conductos expuestos","en":"exposed pipes and conduits"},
        {"id":"cryogenic-frost-and-ice","es":"Escarcha y hielo criogénico","en":"cryogenic frost and ice"},
        {"id":"venting-condensation","es":"Condensación humeante","en":"venting condensation"},
        {"id":"seamless-smooth-surface","es":"Superficie lisa sin costuras","en":"seamless smooth surface"},
        {"id":"rough-industrial-textures","es":"Texturas industriales rugosas","en":"rough industrial textures"},
        {"id":"portholes-and-hatches","es":"Ventanillas y escotillas","en":"portholes and hatches"},
        {"id":"connected-cables-and-umbilicals","es":"Cables y umbilicales conectados","en":"connected cables and umbilicals"},
        {"id":"radiators-and-thermal-fins","es":"Radiadores y aletas térmicas","en":"radiators and thermal fins"},
        {"id":"sensors-and-thin-antennas","es":"Sensores y antenas finas","en":"sensors and thin antennas"},
        {"id":"nozzle-with-inner-detail","es":"Tobera con detalles internos","en":"nozzle with inner detail"}
      ]
    },
    {
      "id": "desgaste",
      "title": "Desgaste / conservación",
      "mode": "single",
      "options": [
        {"id":"pristine-factory-new","es":"Nuevo impecable de fábrica","en":"pristine factory-new"},
        {"id":"lightly-used","es":"Ligeramente usado","en":"lightly used"},
        {"id":"launch-soot-marks","es":"Marcas de hollín del lanzamiento","en":"launch soot marks"},
        {"id":"reentry-scorching","es":"Chamuscado por reentrada","en":"reentry scorching"},
        {"id":"travel-worn","es":"Desgastado por el viaje","en":"travel-worn"},
        {"id":"rusted-and-corroded","es":"Oxidado y corroído","en":"rusted and corroded"},
        {"id":"covered-in-lunar-dust","es":"Cubierto de polvo lunar","en":"covered in lunar dust"},
        {"id":"micrometeorite-pitting","es":"Impactos de micrometeoritos","en":"micrometeorite pitting"},
        {"id":"peeling-paint","es":"Pintura descascarillada","en":"peeling paint"},
        {"id":"museum-restored","es":"Restaurado de museo","en":"museum-restored"},
        {"id":"abandoned-and-rusty","es":"Abandonado y oxidado","en":"abandoned and rusty"},
        {"id":"freshly-recovered-after-flight","es":"Recién recuperado tras volar","en":"freshly recovered after flight"}
      ]
    },
    {
      "id": "escenario",
      "title": "Escenario / entorno",
      "mode": "single",
      "options": [
        {"id":"launch-pad-at-dawn","es":"Plataforma de lanzamiento al amanecer","en":"launch pad at dawn"},
        {"id":"futuristic-spaceport-complex","es":"Complejo espacial futurista","en":"futuristic spaceport complex"},
        {"id":"remote-arid-desert","es":"Desierto árido remoto","en":"remote arid desert"},
        {"id":"cleared-tropical-jungle","es":"Selva tropical despejada","en":"cleared tropical jungle"},
        {"id":"oceanside-coast","es":"Costa junto al océano","en":"oceanside coast"},
        {"id":"offshore-sea-platform","es":"Plataforma marina en alta mar","en":"offshore sea platform"},
        {"id":"arctic-snowy-plain","es":"Llanura nevada ártica","en":"arctic snowy plain"},
        {"id":"reddish-martian-surface","es":"Superficie de Marte rojiza","en":"reddish Martian surface"},
        {"id":"gray-lunar-surface","es":"Superficie lunar gris","en":"gray lunar surface"},
        {"id":"low-earth-orbit","es":"Órbita terrestre baja","en":"low Earth orbit"},
        {"id":"starry-deep-space","es":"Espacio profundo estrellado","en":"starry deep space"},
        {"id":"colorful-cosmic-nebula","es":"Nebulosa colorida cósmica","en":"colorful cosmic nebula"},
        {"id":"asteroid-field","es":"Campo de asteroides","en":"asteroid field"},
        {"id":"rings-of-a-gas-giant","es":"Anillos de un gigante gaseoso","en":"rings of a gas giant"},
        {"id":"exotic-alien-planet","es":"Planeta alienígena exótico","en":"exotic alien planet"},
        {"id":"retrofuturistic-city","es":"Ciudad retrofuturista","en":"retrofuturistic city"},
        {"id":"orbital-megastructure","es":"Megaestructura orbital","en":"orbital megastructure"},
        {"id":"giant-industrial-hangar","es":"Hangar industrial gigante","en":"giant industrial hangar"},
        {"id":"underground-silo-bunker","es":"Búnker subterráneo de silo","en":"underground silo bunker"},
        {"id":"dramatic-lightning-storm","es":"Tormenta eléctrica dramática","en":"dramatic lightning storm"},
        {"id":"nighttime-aurora-borealis","es":"Aurora boreal nocturna","en":"nighttime aurora borealis"},
        {"id":"endless-white-salt-flat","es":"Salina blanca infinita","en":"endless white salt flat"},
        {"id":"cliff-above-the-sea","es":"Acantilado sobre el mar","en":"cliff above the sea"},
        {"id":"antarctic-research-base","es":"Base en la Antártida","en":"Antarctic research base"},
        {"id":"emerging-underwater-launch","es":"Lanzamiento submarino emergente","en":"emerging underwater launch"},
        {"id":"steaming-volcanic-crater","es":"Cráter volcánico humeante","en":"steaming volcanic crater"},
        {"id":"space-station-in-background","es":"Estación espacial al fondo","en":"space station in background"},
        {"id":"solar-eclipse-backdrop","es":"Eclipse solar de fondo","en":"solar eclipse backdrop"},
        {"id":"golden-sunset-horizon","es":"Atardecer dorado en el horizonte","en":"golden sunset horizon"},
        {"id":"clear-bright-blue-sky","es":"Cielo despejado azul brillante","en":"clear bright blue sky"}
      ]
    },
    {
      "id": "cielo",
      "title": "Cielo / fondo cósmico",
      "mode": "single",
      "options": [
        {"id":"clear-blue-sky","es":"Cielo azul despejado","en":"clear blue sky"},
        {"id":"golden-dawn-sky","es":"Cielo dorado del amanecer","en":"golden dawn sky"},
        {"id":"purple-twilight","es":"Crepúsculo púrpura","en":"purple twilight"},
        {"id":"starry-night-sky","es":"Cielo nocturno estrellado","en":"starry night sky"},
        {"id":"dramatic-storm-clouds","es":"Nubes tormentosas dramáticas","en":"dramatic storm clouds"},
        {"id":"visible-milky-way","es":"Vía Láctea visible","en":"visible Milky Way"},
        {"id":"multicolored-nebula","es":"Nebulosa multicolor","en":"multicolored nebula"},
        {"id":"blue-earth-from-space","es":"Tierra azul desde el espacio","en":"blue Earth from space"},
        {"id":"twin-alien-moons","es":"Dos lunas alienígenas","en":"twin alien moons"},
        {"id":"giant-sun-on-horizon","es":"Sol gigante en el horizonte","en":"giant sun on horizon"},
        {"id":"distant-asteroid-belt","es":"Cinturón de asteroides lejano","en":"distant asteroid belt"},
        {"id":"hazy-orange-polluted-sky","es":"Cielo contaminado naranja","en":"hazy orange polluted sky"},
        {"id":"absolute-black-void","es":"Vacío negro absoluto","en":"absolute black void"},
        {"id":"meteor-shower","es":"Lluvia de meteoros","en":"meteor shower"}
      ]
    },
    {
      "id": "apoyo",
      "title": "Elementos de apoyo",
      "note": "Multiselección de elementos de la escena",
      "mode": "multi",
      "options": [
        {"id":"launch-tower","es":"Torre de lanzamiento","en":"launch tower"},
        {"id":"connected-umbilical-arms","es":"Brazos umbilicales conectados","en":"connected umbilical arms"},
        {"id":"cloud-of-smoke-and-steam","es":"Nube de humo y vapor","en":"cloud of smoke and steam"},
        {"id":"crowd-of-spectators","es":"Multitud de espectadores","en":"crowd of spectators"},
        {"id":"ground-support-vehicles","es":"Vehículos de tierra","en":"ground support vehicles"},
        {"id":"reflection-in-the-water","es":"Reflejo en el agua","en":"reflection in the water"},
        {"id":"powerful-floodlights","es":"Reflectores potentes","en":"powerful floodlights"},
        {"id":"walking-astronauts","es":"Astronautas caminando","en":"walking astronauts"},
        {"id":"cranes-and-scaffolding","es":"Grúas y andamios","en":"cranes and scaffolding"},
        {"id":"waving-flags","es":"Banderas ondeando","en":"waving flags"},
        {"id":"scattering-birds","es":"Pájaros dispersándose","en":"scattering birds"},
        {"id":"orbiting-satellites","es":"Satélites en órbita","en":"orbiting satellites"},
        {"id":"another-rocket-in-background","es":"Otro cohete al fondo","en":"another rocket in background"},
        {"id":"tracking-drones","es":"Drones de seguimiento","en":"tracking drones"}
      ]
    },
    {
      "id": "clima",
      "title": "Clima / condiciones",
      "mode": "single",
      "options": [
        {"id":"clear-sunny-day","es":"Día despejado soleado","en":"clear sunny day"},
        {"id":"partly-cloudy","es":"Cielo parcialmente nublado","en":"partly cloudy"},
        {"id":"low-rolling-fog","es":"Niebla baja envolvente","en":"low rolling fog"},
        {"id":"heavy-rain","es":"Lluvia intensa","en":"heavy rain"},
        {"id":"thunderstorm-with-lightning","es":"Tormenta con relámpagos","en":"thunderstorm with lightning"},
        {"id":"falling-snow","es":"Nieve cayendo","en":"falling snow"},
        {"id":"dust-blowing-wind","es":"Viento que arrastra polvo","en":"dust-blowing wind"},
        {"id":"scorching-heat-haze","es":"Calor abrasador con calima","en":"scorching heat haze"},
        {"id":"cold-clear-night","es":"Noche fría despejada","en":"cold clear night"},
        {"id":"toxic-alien-atmosphere","es":"Atmósfera alienígena tóxica","en":"toxic alien atmosphere"},
        {"id":"airless-vacuum","es":"Vacío sin atmósfera","en":"airless vacuum"},
        {"id":"aurora-and-glowing-particles","es":"Aurora y partículas brillantes","en":"aurora and glowing particles"}
      ]
    },
    {
      "id": "efectos",
      "title": "Efectos especiales",
      "note": "Multiselección de efectos visuales",
      "mode": "multi",
      "options": [
        {"id":"massive-exhaust-plume","es":"Columna de escape masiva","en":"massive exhaust plume"},
        {"id":"sonic-shockwave","es":"Onda de choque sónica","en":"sonic shockwave"},
        {"id":"distorted-heat-waves","es":"Ondas de calor distorsionadas","en":"distorted heat waves"},
        {"id":"flying-sparks-and-embers","es":"Chispas y brasas volando","en":"flying sparks and embers"},
        {"id":"shedding-ice-chunks","es":"Hielo desprendiéndose","en":"shedding ice chunks"},
        {"id":"cinematic-lens-flares","es":"Destellos de lente cinemáticos","en":"cinematic lens flares"},
        {"id":"spiraling-vapor-trail","es":"Estela de vapor en espiral","en":"spiraling vapor trail"},
        {"id":"kicked-up-debris-and-dust","es":"Escombros y polvo levantado","en":"kicked-up debris and dust"},
        {"id":"intense-chrome-reflections","es":"Reflejos cromados intensos","en":"intense chrome reflections"},
        {"id":"glowing-floating-particles","es":"Partículas flotantes brillantes","en":"glowing floating particles"},
        {"id":"reentry-plasma-glow","es":"Resplandor atmosférico de reentrada","en":"reentry plasma glow"},
        {"id":"vapor-condensation-ring","es":"Anillo de condensación de vapor","en":"vapor condensation ring"}
      ]
    },
    {
      "id": "referencia-humana",
      "title": "Escala / referencia",
      "mode": "single",
      "options": [
        {"id":"no-reference-pure-scale","es":"Sin referencia escala pura","en":"no reference pure scale"},
        {"id":"tiny-astronaut-beside-it","es":"Astronauta diminuto al lado","en":"tiny astronaut beside it"},
        {"id":"minuscule-engineering-crew","es":"Equipo de ingenieros minúsculos","en":"minuscule engineering crew"},
        {"id":"ant-sized-vehicles","es":"Vehículos como hormigas","en":"ant-sized vehicles"},
        {"id":"compared-to-an-airplane","es":"Comparado con un avión","en":"compared to an airplane"},
        {"id":"next-to-a-tall-building","es":"Junto a un edificio alto","en":"next to a tall building"},
        {"id":"dwarfing-a-whole-city","es":"Empequeñece una ciudad","en":"dwarfing a whole city"},
        {"id":"held-in-a-giant-hand","es":"Sostenido en una mano gigante","en":"held in a giant hand"},
        {"id":"on-a-table-as-a-model","es":"Sobre una mesa como maqueta","en":"on a table as a model"},
        {"id":"seen-from-a-satellite","es":"Visto desde un satélite","en":"seen from a satellite"}
      ]
    },
    {
      "id": "carga",
      "title": "Tripulación / carga",
      "mode": "single",
      "options": [
        {"id":"uncrewed-automated","es":"No tripulado automático","en":"uncrewed automated"},
        {"id":"crewed-capsule-aboard","es":"Cápsula con tripulación","en":"crewed capsule aboard"},
        {"id":"communications-satellite-payload","es":"Satélite de comunicaciones","en":"communications satellite payload"},
        {"id":"space-telescope-payload","es":"Telescopio espacial","en":"space telescope payload"},
        {"id":"exploration-rover-cargo","es":"Róver de exploración","en":"exploration rover cargo"},
        {"id":"colony-supply-cargo","es":"Suministros para colonia","en":"colony supply cargo"},
        {"id":"interplanetary-probe","es":"Sonda interplanetaria","en":"interplanetary probe"},
        {"id":"microsatellite-constellation","es":"Constelación de microsatélites","en":"microsatellite constellation"},
        {"id":"classified-military-payload","es":"Carga militar clasificada","en":"classified military payload"},
        {"id":"space-tourists-aboard","es":"Turistas espaciales","en":"space tourists aboard"},
        {"id":"pioneer-test-animals","es":"Animales de prueba pioneros","en":"pioneer test animals"},
        {"id":"sample-return-capsule","es":"Cápsula de retorno de muestras","en":"sample return capsule"}
      ]
    },
    {
      "id": "nivel-tecnologico",
      "title": "Nivel tecnológico",
      "mode": "single",
      "options": [
        {"id":"plausible-real-technology","es":"Tecnología real plausible","en":"plausible real technology"},
        {"id":"cutting-edge-engineering","es":"Ingeniería de vanguardia","en":"cutting-edge engineering"},
        {"id":"analog-retro-technology","es":"Retrotecnología analógica","en":"analog retro-technology"},
        {"id":"jury-rigged-and-patched","es":"Improvisado y remendado","en":"jury-rigged and patched"},
        {"id":"ultra-advanced-alien-tech","es":"Ultra avanzado alienígena","en":"ultra-advanced alien tech"},
        {"id":"impossible-exotic-energy","es":"Energía exótica imposible","en":"impossible exotic energy"},
        {"id":"clockwork-mechanical","es":"Mecánico de relojería","en":"clockwork mechanical"},
        {"id":"living-organic-biotech","es":"Biotecnología orgánica viva","en":"living organic biotech"},
        {"id":"magic-tech-hybrid","es":"Híbrido mágico-tecnológico","en":"magic-tech hybrid"},
        {"id":"self-repairing-nanotech","es":"Nanotecnología autorreparable","en":"self-repairing nanotech"}
      ]
    },
    {
      "id": "inspiracion",
      "title": "Inspiración real",
      "mode": "single",
      "options": [
        {"id":"saturn-v-inspired","es":"Estilo Saturno V","en":"Saturn V inspired"},
        {"id":"modern-reusable-rocket-style","es":"Estilo cohete reutilizable moderno","en":"modern reusable rocket style"},
        {"id":"stainless-steel-starship-style","es":"Estilo nave de acero inoxidable","en":"stainless steel starship style"},
        {"id":"classic-soyuz-style","es":"Estilo Soyuz clásico","en":"classic Soyuz style"},
        {"id":"shuttle-with-boosters-style","es":"Estilo transbordador con propulsores","en":"shuttle with boosters style"},
        {"id":"historic-v2-style","es":"Estilo V2 histórico","en":"historic V2 style"},
        {"id":"european-ariane-style","es":"Estilo Ariane europeo","en":"European Ariane style"},
        {"id":"comic-pulp-rocket-style","es":"Estilo cohete pulp de cómic","en":"comic pulp rocket style"},
        {"id":"tintin-moon-rocket-style","es":"Estilo Tintín a la Luna","en":"Tintin moon rocket style"},
        {"id":"classic-movie-rocketship-style","es":"Estilo nave de película clásica","en":"classic movie rocketship style"},
        {"id":"fully-original-design","es":"Diseño totalmente original","en":"fully original design"}
      ]
    },
    {
      "id": "proposito",
      "title": "Propósito / misión",
      "mode": "single",
      "options": [
        {"id":"scientific-exploration-mission","es":"Misión científica de exploración","en":"scientific exploration mission"},
        {"id":"commercial-satellite-launch","es":"Lanzamiento comercial de satélite","en":"commercial satellite launch"},
        {"id":"historic-crewed-mission","es":"Misión tripulada histórica","en":"historic crewed mission"},
        {"id":"planetary-colonization","es":"Colonización planetaria","en":"planetary colonization"},
        {"id":"military-defense-mission","es":"Misión militar de defensa","en":"military defense mission"},
        {"id":"luxury-space-tourism","es":"Turismo espacial de lujo","en":"luxury space tourism"},
        {"id":"emergency-rescue-mission","es":"Rescate de emergencia","en":"emergency rescue mission"},
        {"id":"experimental-prototype-test","es":"Prueba experimental de prototipo","en":"experimental prototype test"},
        {"id":"interstellar-first-contact","es":"Primer contacto interestelar","en":"interstellar first contact"},
        {"id":"epic-planetary-evacuation","es":"Evacuación planetaria épica","en":"epic planetary evacuation"},
        {"id":"competitive-space-race","es":"Carrera espacial competitiva","en":"competitive space race"}
      ]
    },
    {
      "id": "detalle-emisivo",
      "title": "Luces / detalles emisivos",
      "mode": "single",
      "options": [
        {"id":"no-lights-powered-down","es":"Sin luces apagado","en":"no lights, powered down"},
        {"id":"blinking-navigation-lights","es":"Luces de navegación parpadeantes","en":"blinking navigation lights"},
        {"id":"warm-lit-windows","es":"Ventanas iluminadas cálidas","en":"warm lit windows"},
        {"id":"glowing-neon-strips","es":"Franjas de neón brillantes","en":"glowing neon strips"},
        {"id":"incandescent-core-reactor","es":"Reactor central incandescente","en":"incandescent core reactor"},
        {"id":"glowing-energy-runes","es":"Runas energéticas brillantes","en":"glowing energy runes"},
        {"id":"ground-tracking-spotlights","es":"Focos de seguimiento terrestres","en":"ground tracking spotlights"},
        {"id":"idle-engine-glow","es":"Resplandor de motores en reposo","en":"idle engine glow"},
        {"id":"floating-holographic-panels","es":"Paneles holográficos flotantes","en":"floating holographic panels"},
        {"id":"laser-comms-flash","es":"Destello de comunicaciones láser","en":"laser comms flash"}
      ]
    },
    {
      "id": "extra",
      "title": "Toque final / rasgo único",
      "mode": "single",
      "options": [
        {"id":"none-clean-and-direct","es":"Ninguno limpio y directo","en":"none, clean and direct"},
        {"id":"projected-countdown-timer","es":"Cuenta atrás proyectada","en":"projected countdown timer"},
        {"id":"hand-painted-mascot-logo","es":"Mascota o logo pintado a mano","en":"hand-painted mascot logo"},
        {"id":"rebellious-hull-graffiti","es":"Grafiti rebelde en el casco","en":"rebellious hull graffiti"},
        {"id":"festive-celebration-decor","es":"Decoración festiva de celebración","en":"festive celebration decor"},
        {"id":"heroic-battle-damage","es":"Daño de batalla heroico","en":"heroic battle damage"},
        {"id":"improvised-homemade-mod","es":"Modificación casera improvisada","en":"improvised homemade mod"},
        {"id":"mysterious-alien-element","es":"Elemento alienígena misterioso","en":"mysterious alien element"},
        {"id":"steampunk-gear-detail","es":"Detalle steampunk de engranajes","en":"steampunk gear detail"},
        {"id":"premium-collector-finish","es":"Acabado de coleccionista premium","en":"premium collector finish"}
      ]
    }
  ]
};
