/**
 * Páginas legales. El texto es el del titular de la web anterior; solo se han ajustado los datos
 * técnicos que cambian en esta versión (almacenamiento local, enlaces compartidos, tipografías propias).
 * Recomendación: revisarlas con asesoramiento legal antes de publicar.
 */
import { esc } from '../../assets/js/core/util.js';
import { layout } from './layout.mjs';

const UPDATED = 'noviembre de 2026';
const CONTACT = 'djl@djl.red';

// Cada sección: [título, ...bloques]. Un bloque es texto, o { list: [...] }, o { callout: '...' }.
const DOCS = {
  'aviso-legal': {
    title: 'Aviso legal',
    description: 'Aviso legal de Lumen Vitae: datos del titular, condiciones de uso, propiedad intelectual y legislación aplicable.',
    sections: [
      ['1. Datos identificativos',
        'En cumplimiento del deber de información recogido en la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se facilitan a continuación los datos del titular de este sitio web:',
        { list: ['Titular: David', 'Localidad: León (España)', `Correo electrónico: ${CONTACT}`, 'Sitio web: lumenvitae.es'] }],
      ['2. Objeto',
        'El presente aviso legal regula el acceso, la navegación y el uso del sitio web Lumen Vitae (en adelante, «el Sitio»), una plataforma gratuita que ofrece herramientas para crear descripciones de texto («prompts») destinadas a generadores de imágenes por inteligencia artificial.',
        'El acceso al Sitio es libre y gratuito, y atribuye a quien lo realiza la condición de usuario, lo que implica la aceptación plena de las condiciones recogidas en este aviso legal desde el momento en que se accede.'],
      ['3. Condiciones de acceso y uso',
        'El usuario se compromete a hacer un uso adecuado y lícito del Sitio y de sus contenidos, de conformidad con la legislación vigente, la buena fe y el orden público. En particular, el usuario se obliga a:',
        { list: ['No utilizar el Sitio con fines o efectos ilícitos, lesivos de derechos o intereses de terceros.', 'No introducir ni difundir contenidos o programas que puedan provocar daños en los sistemas informáticos del titular o de terceros.', 'No intentar acceder, manipular o alterar el funcionamiento, los archivos o el código del Sitio sin autorización.'] },
        'El titular podrá interrumpir el servicio o retirar el acceso a aquellos usuarios que incumplan estas condiciones.'],
      ['4. Propiedad intelectual e industrial',
        'El diseño del Sitio, su código fuente, la estructura de navegación, los textos, las herramientas de creación de prompts y los demás elementos que lo integran son titularidad de David o cuenta con la correspondiente autorización para su uso, y están protegidos por la normativa de propiedad intelectual e industrial.',
        'El código fuente del Sitio se publica bajo la licencia <a href="https://polyformproject.org/licenses/noncommercial/1.0.0" rel="noopener">PolyForm Noncommercial 1.0.0</a> y los textos y datos (las opciones y sus descripciones) bajo <a href="https://creativecommons.org/licenses/by-nc/4.0/deed.es" rel="noopener">Creative Commons Atribución-NoComercial 4.0</a>: puedes usarlos, copiarlos y adaptarlos citando la fuente, siempre que no sea con fines comerciales. Cualquier uso con ánimo de lucro requiere la autorización expresa del titular. El acceso al Sitio no otorga al usuario ningún otro derecho de propiedad sobre sus elementos.'],
      ['5. Exclusión de responsabilidad',
        'El Sitio es una herramienta de apoyo a la creatividad. Los prompts generados son sugerencias de texto, y las imágenes resultantes se producen en plataformas de terceros ajenas a Lumen Vitae. El titular no se hace responsable del uso que el usuario haga de los prompts ni de las imágenes que obtenga a partir de ellos.',
        'El titular no garantiza la disponibilidad y continuidad ininterrumpida del Sitio, ni la ausencia de errores en sus contenidos, si bien empleará los medios razonables para evitarlos, corregirlos o actualizarlos. El titular queda exonerado de cualquier responsabilidad por los daños y perjuicios que pudieran derivarse de la falta de disponibilidad temporal del Sitio.'],
      ['6. Enlaces a terceros',
        'El Sitio puede contener enlaces a páginas o servicios de terceros (por ejemplo, plataformas de generación de imágenes por inteligencia artificial). El titular no asume responsabilidad alguna sobre los contenidos, políticas o prácticas de dichos sitios externos, cuyo acceso se realiza bajo la exclusiva responsabilidad del usuario.'],
      ['7. Protección de datos', 'El tratamiento de los datos en relación con el Sitio se rige por lo dispuesto en la <a href="/legal/privacidad/">Política de Privacidad</a> y la <a href="/legal/cookies/">Política de Cookies</a>, que forman parte integrante de este aviso legal.'],
      ['8. Legislación aplicable y jurisdicción',
        'Las presentes condiciones se rigen por la legislación española. Para la resolución de cualquier controversia que pudiera derivarse del acceso o uso del Sitio, las partes se someten a los juzgados y tribunales que resulten competentes conforme a derecho.',
        `Para cualquier consulta relacionada con este aviso legal, puedes escribir a <a href="mailto:${CONTACT}">${CONTACT}</a>.`],
    ],
  },
  privacidad: {
    title: 'Política de privacidad',
    description: 'Política de privacidad de Lumen Vitae: la herramienta funciona en tu navegador, sin cuentas ni envío de tus selecciones a ningún servidor.',
    lead: { callout: '<strong>En resumen:</strong> Lumen Vitae funciona por completo en tu navegador. No tiene cuentas de usuario, no pide registro y no envía tus selecciones ni tus prompts a ningún servidor. Lo que creas se queda en tu dispositivo.' },
    sections: [
      ['1. Responsable del tratamiento', 'El responsable del tratamiento de los datos relacionados con este sitio web es:', { list: ['Titular: David', 'Localidad: León (España)', `Correo electrónico: ${CONTACT}`] }],
      ['2. Qué datos tratamos',
        'Lumen Vitae es una herramienta de uso libre que se ejecuta íntegramente en el navegador del usuario. Por su diseño:',
        { list: [
          'No solicitamos datos personales: no hay formularios de registro, ni alta de cuentas, ni suscripciones.',
          'No recopilamos información en servidores: las opciones que eliges y los prompts que generas no se transmiten ni se almacenan en ningún sistema del titular.',
          'Almacenamiento local: para que puedas continuar donde lo dejaste, tus selecciones se guardan únicamente en el almacenamiento local (localStorage) de tu propio navegador. Esa información permanece en tu dispositivo y no es accesible para el titular.',
          'Enlaces para compartir: si pulsas «Copiar enlace», tu selección se codifica dentro del propio enlace (en la parte tras «#»), que no se envía a ningún servidor al abrirse. Solo la conocen quienes reciban ese enlace de ti.',
          'Mis prompts: si guardas un prompt o lo copias, queda en el almacenamiento local de tu navegador (guardados y un historial de las últimas copias). Puedes exportarlo e importarlo como archivo en tu dispositivo; nada de ello se envía al titular.',
          'Tipografías propias: las fuentes se sirven desde este mismo sitio, por lo que no se realizan peticiones a servicios de terceros (como Google Fonts) al visitarlo.',
        ] },
        'Si decides contactar voluntariamente por correo electrónico, trataremos los datos que nos facilites en tu mensaje (como tu dirección de correo y el contenido de la consulta) con la única finalidad de atenderla.'],
      ['3. Finalidad del tratamiento', 'La información almacenada localmente en tu navegador tiene como única finalidad recordar tus selecciones para mejorar tu experiencia de uso. Los datos que nos envíes por correo se tratan solo para responder a tu consulta.'],
      ['4. Legitimación', 'La base legal para el almacenamiento local de tus preferencias es tu consentimiento al utilizar la herramienta, así como el interés legítimo en ofrecer un servicio funcional. En el caso de las consultas por correo, la base es tu consentimiento al dirigirte voluntariamente al titular.'],
      ['5. Conservación de los datos', 'Los datos guardados en el almacenamiento local permanecen en tu navegador hasta que tú los elimines (borrando los datos de navegación del sitio o usando el botón «Vaciar» del panel «Mi prompt»). Los correos electrónicos se conservarán durante el tiempo necesario para gestionar tu consulta y, en su caso, durante los plazos legalmente exigibles.'],
      ['6. Destinatarios', 'No cedemos ni comunicamos datos a terceros. Al no recopilar información personal en servidores, no existe transferencia de datos derivada del uso de las herramientas. Ten en cuenta que, cuando copias un prompt y lo utilizas en una plataforma externa de generación de imágenes, dicho texto pasa a regirse por la política de privacidad de esa plataforma, ajena a Lumen Vitae.'],
      ['7. Tus derechos',
        'Como titular de tus datos, la normativa de protección de datos (RGPD y LOPDGDD) te reconoce los derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad. Dado que no almacenamos datos personales en servidores, puedes ejercer de forma directa la supresión de la información guardada localmente borrándola desde tu propio navegador en cualquier momento.',
        `Para cualquier otra cuestión relativa a tus derechos, puedes escribir a <a href="mailto:${CONTACT}">${CONTACT}</a>. También tienes derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" rel="noopener">www.aepd.es</a>) si consideras que tus derechos no han sido atendidos.`],
      ['8. Cambios en esta política', 'Esta política de privacidad podrá actualizarse para adaptarse a cambios normativos o de funcionamiento del Sitio. La fecha de la última revisión figura al inicio de esta página.'],
    ],
  },
  cookies: {
    title: 'Política de cookies',
    description: 'Política de cookies de Lumen Vitae: no se usan cookies de seguimiento, publicitarias ni de analítica; solo almacenamiento local para recordar tus selecciones.',
    lead: { callout: '<strong>En resumen:</strong> Lumen Vitae no utiliza cookies de seguimiento, ni publicitarias, ni de analítica. Solo emplea el almacenamiento local de tu navegador para recordar tus selecciones dentro de las herramientas.' },
    sections: [
      ['1. ¿Qué son las cookies?', 'Las cookies son pequeños archivos de texto que los sitios web guardan en el dispositivo del usuario cuando los visita. Sirven para almacenar y recuperar información sobre la navegación. Junto a ellas existen otras tecnologías de almacenamiento en el navegador, como el almacenamiento local (localStorage), que cumplen una función similar de guardar datos en tu equipo.'],
      ['2. ¿Usa cookies este sitio?',
        'Lumen Vitae no instala cookies propias ni de terceros con fines de seguimiento, perfilado, publicidad o medición de audiencia. No utilizamos herramientas de analítica que requieran consentimiento de cookies.',
        'Lo único que el Sitio guarda en tu navegador es la información necesaria para recordar las opciones que eliges, y lo hace mediante el almacenamiento local, no mediante cookies.'],
      ['3. Almacenamiento local que utilizamos',
        'El Sitio guarda en el localStorage de tu navegador los siguientes datos, exclusivamente técnicos y funcionales:',
        { list: [
          '<code>lv:v1:workspace</code>: tu selección actual de opciones en los generadores, y tus preferencias del panel «Mi prompt» (nivel de detalle, calidad máxima, proporción, formato de salida y secciones fijadas).',
          '<code>lv:v1:library</code>: tus prompts guardados en «Mis prompts» y el historial de los últimos prompts copiados.',
          '<code>lv:v1:open:&lt;generador&gt;</code>: qué secciones de cada generador dejaste abiertas o plegadas.',
        ] },
        'Esta información se almacena únicamente en tu dispositivo, no se transmite a ningún servidor y no permite identificarte personalmente.'],
      ['4. Cookies de terceros', 'El Sitio no incorpora cookies de terceros. Ten en cuenta que, si desde aquí accedes a plataformas externas de generación de imágenes por inteligencia artificial, dichas plataformas podrán utilizar sus propias cookies, sujetas a sus respectivas políticas, ajenas a Lumen Vitae.'],
      ['5. Cómo gestionar o eliminar el almacenamiento',
        'Puedes eliminar en cualquier momento la información que el Sitio haya guardado en tu navegador. Para ello puedes:',
        { list: ['Pulsar «Vaciar» en el panel «Mi prompt» para borrar tu selección actual.', 'Borrar los datos de navegación del sitio desde la configuración de tu navegador (sección de privacidad o datos de sitios).', 'Utilizar el modo de navegación privada o de incógnito, que no conserva el almacenamiento al cerrar la ventana.', 'Configurar tu navegador para bloquear o limitar el almacenamiento de datos de sitios web.'] },
        'Cada navegador ofrece estas opciones en su menú de ajustes. Eliminar el almacenamiento local solo implica que el Sitio dejará de recordar tus selecciones previas; no afecta al funcionamiento de las herramientas.'],
      ['6. Cambios en esta política', `Si en el futuro el Sitio incorporase cookies que requieran consentimiento, esta política se actualizaría y se solicitaría tu autorización previa cuando proceda. La fecha de la última revisión figura al inicio de esta página. Para cualquier duda, escribe a <a href="mailto:${CONTACT}">${CONTACT}</a>.`],
    ],
  },
  terminos: {
    title: 'Términos de uso',
    description: 'Términos de uso de Lumen Vitae: servicio gratuito de creación de prompts para imágenes con IA, uso correcto y exclusión de garantías.',
    sections: [
      ['1. Aceptación de los términos', `El uso del sitio web Lumen Vitae (en adelante, «el Servicio») implica la aceptación plena de los presentes términos de uso. Si no estás de acuerdo con ellos, te rogamos que no utilices el Servicio. El responsable del Servicio es David, con domicilio en León (España) y correo de contacto <a href="mailto:${CONTACT}">${CONTACT}</a>.`],
      ['2. Descripción del servicio',
        'Lumen Vitae es una colección de herramientas gratuitas que ayudan al usuario a construir descripciones de texto («prompts») para generadores de imágenes basados en inteligencia artificial. El usuario selecciona opciones dentro de cada herramienta y el Servicio compone automáticamente un texto, en inglés, que puede copiar y utilizar en plataformas externas de IA.',
        { callout: '<strong>Importante:</strong> Lumen Vitae genera texto, no imágenes. Las imágenes se crean en plataformas de terceros (como Midjourney, DALL·E, Stable Diffusion u otras), que tienen sus propias condiciones y licencias.' }],
      ['3. Gratuidad', 'El acceso y uso del Servicio es totalmente gratuito y no requiere registro. El titular no cobra por el uso de las herramientas ni condiciona su disponibilidad al pago de cantidad alguna.'],
      ['4. Uso correcto del servicio',
        'El usuario se compromete a utilizar el Servicio conforme a la ley, la buena fe y estos términos. En particular, se compromete a no emplear el Servicio para:',
        { list: ['Crear contenidos ilícitos, difamatorios, que vulneren derechos de terceros o que resulten contrarios a la dignidad de las personas.', 'Generar prompts orientados a producir material que infrinja la legislación vigente.', 'Realizar acciones que puedan dañar, sobrecargar o deteriorar el funcionamiento del Servicio.'] },
        'El usuario es el único responsable del uso que haga de los prompts generados y de las imágenes que obtenga a partir de ellos en plataformas de terceros.'],
      ['5. Propiedad intelectual del servicio', 'El Servicio, incluyendo su diseño, código, estructura y herramientas, es titularidad de David y está protegido por la normativa de propiedad intelectual. Su código se distribuye bajo PolyForm Noncommercial 1.0.0 y sus textos y datos bajo Creative Commons Atribución-NoComercial 4.0 (consulta el <a href="/legal/aviso-legal/">Aviso legal</a>): se pueden usar y adaptar sin ánimo de lucro, citando la fuente, y cualquier uso comercial requiere autorización expresa. Los textos de prompt que generes mediante las herramientas puedes utilizarlos libremente para tus proyectos.'],
      ['6. Prompts e imágenes generadas', 'El Servicio se limita a facilitar la redacción de prompts. El titular no garantiza ningún resultado concreto al utilizar dichos prompts en generadores de IA, ya que la imagen final depende de la plataforma elegida, de su modelo y de factores ajenos a Lumen Vitae. La titularidad, los derechos y el uso comercial de las imágenes generadas se rigen por las condiciones de la plataforma de inteligencia artificial que utilices, que debes consultar y respetar.'],
      ['7. Disponibilidad del servicio', 'El titular procurará mantener el Servicio disponible y en correcto funcionamiento, pero no garantiza la ausencia de interrupciones, errores o indisponibilidades temporales debidas a mantenimiento, causas técnicas o ajenas a su control. El titular podrá modificar, suspender o retirar el Servicio, total o parcialmente, en cualquier momento.'],
      ['8. Exclusión de garantías y responsabilidad', 'El Servicio se ofrece «tal cual», sin garantías de ningún tipo. En la máxima medida permitida por la ley, el titular no será responsable de los daños o perjuicios, directos o indirectos, que pudieran derivarse del uso o de la imposibilidad de uso del Servicio, ni del uso que el usuario haga de los prompts o de las imágenes generadas con plataformas de terceros.'],
      ['9. Enlaces y servicios de terceros', 'El Servicio puede mencionar o enlazar plataformas de terceros. El titular no controla ni se responsabiliza de dichos servicios externos, que se rigen por sus propios términos y políticas. El acceso a ellos se realiza bajo la responsabilidad del usuario.'],
      ['10. Modificaciones de los términos', 'El titular podrá actualizar estos términos de uso en cualquier momento. Los cambios serán efectivos desde su publicación en esta página. Se recomienda revisarlos periódicamente; la fecha de la última actualización figura al inicio del documento.'],
      ['11. Legislación aplicable', `Estos términos se rigen por la legislación española. Para cualquier controversia derivada del uso del Servicio, las partes se someten a los juzgados y tribunales competentes conforme a derecho. Para cualquier consulta, puedes contactar en <a href="mailto:${CONTACT}">${CONTACT}</a>.`],
    ],
  },
};

const block = b => typeof b === 'string' ? `<p>${b}</p>` : b.list ? `<ul>${b.list.map(i => `<li>${i}</li>`).join('')}</ul>` : `<div class="callout">${b.callout}</div>`;

export const LEGAL_SLUGS = Object.keys(DOCS);

export function legalPage(slug, domains) {
  const d = DOCS[slug];
  const main = `<div class="container">
  <div class="page-head"><p class="eyebrow">Legal</p><h1>${esc(d.title)}</h1></div>
  <div class="prose">
    <p class="meta">Última actualización: ${UPDATED}</p>
    ${d.lead ? block(d.lead) : ''}
    ${d.sections.map(([h, ...blocks]) => `<h2>${esc(h)}</h2>${blocks.map(block).join('')}`).join('\n')}
  </div>
</div>`;
  return layout({ path: `/legal/${slug}/`, title: `${d.title} | Lumen Vitae`, description: d.description, main, script: 'static', bodyData: { dock: 'off' }, domains });
}
