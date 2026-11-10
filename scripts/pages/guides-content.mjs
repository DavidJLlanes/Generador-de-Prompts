/**
 * Contenido de las guías (/guias/). Cada guía: { slug, title, description, date, body (HTML de confianza) }.
 * Se redacta con cautela sobre los modelos de imagen: cambian con frecuencia, así que se dan pautas de
 * partida y se remite siempre a la documentación de cada herramienta.
 */
export const GUIDES = [
  {
    slug: 'como-escribir-un-prompt-de-calidad',
    title: 'Cómo escribir un prompt de calidad para imágenes con IA',
    description: 'Guía práctica para describir imágenes con IA: qué incluir, en qué orden, cómo evitar contradicciones y cómo iterar sin perder lo que funciona.',
    date: '2026-11-10',
    body: `
<p>Un buen prompt no <em>pide</em> una imagen: la <strong>describe</strong>. Imagina que se la cuentas por teléfono a un fotógrafo o a una ilustradora que no puede hacerte preguntas. Todo lo que no digas lo decidirá el modelo por su cuenta, y rara vez coincidirá con lo que tenías en la cabeza.</p>

<h2>Las seis piezas de un prompt</h2>
<p>Casi cualquier imagen se puede describir con seis piezas. Lumen Vitae las usa, en este orden, para componer tu prompt:</p>
<ol>
  <li><strong>Sujeto:</strong> quién o qué protagoniza la imagen («una mujer de unos treinta años», «un dragón de porcelana»).</li>
  <li><strong>Atributos:</strong> rasgos concretos del sujeto: rostro, peinado, vestuario, accesorios, tatuajes.</li>
  <li><strong>Pose y acción:</strong> qué está haciendo y cómo está colocado.</li>
  <li><strong>Escenario:</strong> dónde ocurre: un paisaje, un interior, una localización.</li>
  <li><strong>Atmósfera:</strong> clima, hora del día, niebla, efectos.</li>
  <li><strong>Técnica y estilo:</strong> cámara, objetivo, iluminación, color, medio artístico.</li>
</ol>
<p>No hace falta usar las seis. Si no te importa el fondo, déjalo sin elegir: es mejor omitir una pieza que rellenarla con algo al azar.</p>

<h2>Sé concreto: materiales, formas y luz</h2>
<p>Las palabras vagas («bonito», «increíble», «espectacular») apenas aportan información. Las concretas, sí. Compara:</p>
<ul>
  <li><strong>Vago:</strong> una chica guapa en un bosque.</li>
  <li><strong>Concreto:</strong> una mujer de unos treinta años con una trenza larga y un abrigo de lana verde oscuro, de pie entre abedules al amanecer, con niebla baja y luz dorada de lado.</li>
</ul>
<p>Piensa en materiales (lana, latón, cristal), formas (silueta alargada, arcos apuntados), escala (diminuto, monumental) y, sobre todo, en la <strong>luz</strong>: de dónde viene, qué color tiene y qué sombras crea.</p>

<h2>Evita las contradicciones</h2>
<p>Los modelos intentan complacerlo todo, y cuando dos piezas chocan suele ganar una al azar. Algunos choques típicos:</p>
<ul>
  <li>«Luz de mediodía» y «noche cerrada» en el mismo prompt.</li>
  <li>Decir el color del pelo en el peinado y otra vez en el color de pelo.</li>
  <li>Un estilo de acuarela junto a una cámara y un objetivo concretos.</li>
</ul>
<p>Por eso Lumen Vitae hace que muchas secciones sean de <em>elección única</em> y avisa cuando una elección deja sin efecto otra («Se quitó el motivo: no combina con la idea destacada»).</p>

<h2>La calidad no está en las etiquetas mágicas</h2>
<p>Palabras como «8K», «obra maestra» o «ultra detallado» pueden ayudar algo o nada, según el modelo y la herramienta. Lo que suele marcar la diferencia es lo de siempre: una <strong>composición</strong> clara, una <strong>luz</strong> bien descrita, una <strong>óptica</strong> creíble y materiales concretos. El interruptor «Calidad máxima» de Lumen Vitae añade un acabado cuidado, pero puedes apagarlo si tu modelo rinde mejor sin él.</p>

<h2>Qué quieres evitar también cuenta</h2>
<p>Muchos modelos admiten un «prompt negativo» o una lista de exclusiones: texto dentro de la imagen, deformaciones, copias de elementos, aspecto plástico. En Lumen Vitae lo encuentras en la sección <em>Evitar</em> de «Fotografía y estilo», y cada formato de salida lo coloca donde corresponde.</p>

<h2>Itera con método</h2>
<ol>
  <li>Empieza por lo esencial: sujeto, escenario y luz.</li>
  <li>Genera, mira y cambia <strong>una sola cosa</strong> cada vez. Si cambias cinco, no sabrás cuál ayudó.</li>
  <li>Guarda las versiones que funcionan. En «Mis prompts» puedes guardarlas con nombre y exportarlas.</li>
  <li>Usa una receta o una idea de la galería como punto de partida y ajusta desde ahí.</li>
</ol>
<p>¿Quieres verlo en práctica? Abre el <a href="/constructor/">constructor</a> y combina un personaje, un escenario y una cámara.</p>`,
  },
  {
    slug: 'cruzar-generadores-en-un-solo-prompt',
    title: 'Cruzar generadores: personajes, escenarios y clima en un solo prompt',
    description: 'Cómo combinar un personaje, un escenario, el clima y la fotografía en un único prompt con el constructor de Lumen Vitae, y qué hace cada ranura.',
    date: '2026-11-10',
    body: `
<p>La idea central de Lumen Vitae es que cada generador es una <strong>pieza</strong>, no una web aparte. Puedes poner a una mujer en uno de los escenarios de la galería, añadir niebla y elegir una cámara, y todo acaba en <strong>un único prompt</strong> ordenado.</p>

<h2>Las ranuras</h2>
<p>Los 28 generadores se reparten en seis ranuras: sujeto, atributos, pose y acción, escenario, atmósfera y técnica. El prompt final se compone siempre en ese orden, sin importar en qué orden elijas.</p>
<p><strong>Cada ranura es opcional.</strong> Si eliges una mujer y ningún escenario, el prompt se genera igualmente. Lo que no eliges, simplemente no entra.</p>

<h2>Un ejemplo paso a paso</h2>
<ol>
  <li>En <a href="/generadores/mujer/">Mujer</a> elige la edad, un peinado y un vestuario (o parte de una receta).</li>
  <li>En <a href="/generadores/poses/">Poses</a> elige una postura.</li>
  <li>En <a href="/generadores/escenarios/">Escenarios</a> elige un motivo y un ambiente, por ejemplo «una casa de té suspendida sobre un lago» en «una noche de lluvia».</li>
  <li>En <a href="/generadores/clima/">Clima</a> añade una niebla ligera.</li>
  <li>En <a href="/generadores/fotografia-y-estilo/">Fotografía y estilo</a> elige una iluminación y un objetivo.</li>
</ol>
<p>Tu selección se conserva al cambiar de página. El botón <em>Mi prompt</em> te muestra en cualquier momento el resultado, y el <a href="/constructor/">constructor</a> lo presenta ranura por ranura.</p>

<h2>Cuando dos cosas no combinan</h2>
<p>Algunas piezas se excluyen entre sí. Una idea destacada de «Escenarios» ya trae su propio motivo y ambiente, así que al elegirla se quitan esos dos y se te avisa. Lo mismo pasa con la escena fotográfica y la ilustrada de «Coches». Además, la mayoría de las secciones son de elección única, para que no mezcles «soleado» con «tormenta».</p>

<h2>Herramientas que ahorran tiempo</h2>
<ul>
  <li><strong>Recetas:</strong> combinaciones ya montadas y coherentes en los generadores principales. Elige una y ajusta lo que quieras.</li>
  <li><strong>Galería de ideas:</strong> 1.000 escenas de wallpaper en «Escenarios».</li>
  <li><strong>Aleatorio:</strong> rellena el generador (o todo el constructor) al azar. Con el candado de cada sección puedes <em>fijar</em> lo que te gusta y relanzar el resto.</li>
  <li><strong>Texto libre:</strong> añade tus propios detalles al final del prompt, mejor en inglés.</li>
  <li><strong>Enlace para compartir:</strong> «Copiar enlace» codifica tu selección dentro del propio enlace.</li>
</ul>

<h2>Nivel de detalle</h2>
<p>«Conciso» usa descripciones cortas; «Detallado» usa las largas cuando existen (escenas, coches, ropa o peinados, entre otras). Si tu modelo tiene un límite de longitud, prueba primero en conciso.</p>
<p>¿Listo? Abre el <a href="/constructor/">constructor</a> y pulsa «Combinación aleatoria» para ver un ejemplo.</p>`,
  },
  {
    slug: 'prompts-para-chatgpt-stable-diffusion-flux-ideogram-midjourney',
    title: 'Prompts para ChatGPT, Stable Diffusion, Flux, Ideogram y Midjourney: qué cambia',
    description: 'Diferencias prácticas entre escribir un prompt para ChatGPT o Gemini, Stable Diffusion o Flux, Ideogram y Midjourney, y qué formato de Lumen Vitae usar en cada caso.',
    date: '2026-11-10',
    body: `
<p>El mismo prompt no rinde igual en todos los modelos. Unos entienden bien el lenguaje natural; otros prefieren etiquetas cortas, y casi todos tienen sus propios parámetros. Lumen Vitae prepara el prompt en <strong>cinco formatos</strong> para que no tengas que reescribirlo a mano.</p>

<table>
  <thead><tr><th>Formato</th><th>Cómo es</th><th>Úsalo con</th></tr></thead>
  <tbody>
    <tr><td><strong>Texto</strong></td><td>Texto continuo en inglés, en frases</td><td>Cualquier generador</td></tr>
    <tr><td><strong>ChatGPT / Gemini</strong></td><td>Lenguaje natural, por bloques (Subject, Setting…)</td><td>Asistentes de chat que generan imágenes</td></tr>
    <tr><td><strong>Stable Diffusion / Flux</strong></td><td>Prompt positivo y negativo, con tamaño sugerido</td><td>ComfyUI, interfaces de Stable Diffusion, Flux</td></tr>
    <tr><td><strong>Ideogram (JSON)</strong></td><td>Descripción, estilo y composición estructurados</td><td>Ideogram, si admite descripciones estructuradas</td></tr>
    <tr><td><strong>Midjourney</strong></td><td>Descripción corta con <code>--ar</code> y <code>--no</code></td><td>Midjourney</td></tr>
  </tbody>
</table>

<h2>ChatGPT y Gemini</h2>
<p>Los asistentes de chat entienden bien las instrucciones completas, así que el formato <em>ChatGPT / Gemini</em> redacta el prompt en bloques claros y añade una línea «Avoid» con lo que no quieres. Puedes pegarlo tal cual o pedirle al asistente que lo adapte.</p>

<h2>Stable Diffusion y Flux</h2>
<p>Los modelos de Stable Diffusion más extendidos procesan el texto en bloques de longitud limitada (del orden de 77 tokens), por lo que conviene un prompt <strong>conciso</strong>: etiquetas cortas separadas por comas. Por eso este formato usa siempre las descripciones cortas, y separa el <em>prompt negativo</em>, que se escribe en su propio campo. Flux suele aceptar descripciones más largas, pero comprueba la documentación de la herramienta que uses. El formato incluye también un <strong>tamaño sugerido</strong> (en torno a un megapíxel y múltiplos de 64) para tu proporción.</p>

<h2>Ideogram</h2>
<p>El formato JSON organiza la imagen en descripción general, estilo (luz, fotografía, paleta de color) y composición del fondo y los elementos. Úsalo solo si tu versión de Ideogram admite este tipo de descripción estructurada; si no, copia el formato <em>Texto</em>.</p>

<h2>Midjourney</h2>
<p>Midjourney funciona mejor con descripciones breves y parámetros al final. Lumen Vitae añade <code>--ar</code> con la proporción y <code>--no</code> con lo que quieres evitar. Como Midjourney pide proporciones con números enteros, una proporción como 9:19.5 se convierte en su equivalente reducida (6:13).</p>

<h2>Consejos para todos</h2>
<ul>
  <li>Prueba el mismo prompt en dos modelos y compara: es la mejor forma de aprender qué entiende cada uno.</li>
  <li>Empieza en «Conciso» y pasa a «Detallado» si el resultado se queda corto.</li>
  <li>Los modelos cambian con frecuencia: trata estas pautas como un punto de partida y consulta la documentación de tu herramienta.</li>
</ul>
<p>Elige el formato en el panel <em>Mi prompt</em> de cualquier <a href="/generadores/">generador</a> o en el <a href="/constructor/">constructor</a>.</p>`,
  },
  {
    slug: 'proporciones-para-fondos-de-pantalla',
    title: 'Proporciones para fondos de pantalla: móvil, escritorio y ultraancho',
    description: 'Qué proporción elegir para un wallpaper de móvil, tablet, escritorio o monitor ultraancho, y cómo componer la imagen para que nada tape el motivo.',
    date: '2026-11-10',
    body: `
<p>Un fondo de pantalla se ve distinto en cada dispositivo: los iconos, el reloj y el dock tapan partes de la imagen, y cada pantalla tiene su proporción. Elegir bien la proporción <em>antes</em> de generar evita recortes y composiciones que no funcionan.</p>

<h2>Qué proporción usar</h2>
<table>
  <thead><tr><th>Proporción</th><th>Para</th></tr></thead>
  <tbody>
    <tr><td>9:19.5</td><td>iPhone de pantalla grande (Pro Max)</td></tr>
    <tr><td>9:16 · 9:20</td><td>Móviles estándar y altos, stories</td></tr>
    <tr><td>3:4 · 2:3 · 4:5</td><td>Tablet vertical, retrato, Instagram</td></tr>
    <tr><td>1:1</td><td>Cuadrado: avatares y redes</td></tr>
    <tr><td>16:10 · 16:9</td><td>Portátiles y monitores de escritorio</td></tr>
    <tr><td>21:9 · 32:9</td><td>Monitores ultraanchos</td></tr>
  </tbody>
</table>
<p>Si dudas, mira la resolución de tu pantalla en los ajustes del dispositivo y calcula su proporción dividiendo ancho entre alto.</p>

<h2>Móvil: respeta las zonas de la pantalla</h2>
<p>En el móvil, el <strong>tercio superior</strong> lo ocupan el reloj y los widgets, y la franja inferior, el dock de aplicaciones. Para que no tapen el motivo:</p>
<ul>
  <li>Coloca el sujeto en el tercio central o inferior-central.</li>
  <li>Deja el tercio superior más sereno y con textura suave.</li>
  <li>Evita detalles esenciales justo en el borde inferior.</li>
</ul>
<p>Cuando eliges una proporción de móvil, Lumen Vitae añade esta indicación de composición al prompt (en inglés), sin que tengas que escribirla.</p>

<h2>Escritorio y ultraancho</h2>
<p>En el escritorio, los iconos suelen ir a un lado: sitúa el motivo siguiendo la <strong>regla de tercios</strong> y deja el lado opuesto más tranquilo. En un monitor ultraancho, la imagen se extiende en horizontal; coloca elementos secundarios y atmósfera en los extremos y evita que lo importante quede cerca de los bordes, donde puede recortarse.</p>

<h2>Resolución</h2>
<p>Genera a la mayor resolución que permita tu modelo y, si hace falta, escala después con una herramienta de ampliación. Para un móvil, intenta que la imagen alcance al menos la resolución nativa de la pantalla. Cada herramienta tiene sus propios límites de tamaño: comprueba los de la tuya.</p>

<h2>Por dónde empezar</h2>
<p>La <a href="/generadores/escenarios/">galería de Escenarios</a> reúne 1.000 ideas pensadas como wallpapers. Elige una, indica tu proporción en el panel <em>Mi prompt</em> y copia el resultado.</p>`,
  },
];

export const wordsOf = html => html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
export const readingMinutes = html => Math.max(1, Math.round(wordsOf(html) / 200));
