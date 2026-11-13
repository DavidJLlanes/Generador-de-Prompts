# Seguimiento del flujo de creación de prompts

## Implementado

- Inicio guiado: inspiración, combinación aleatoria o descripción de una idea.
- Asistente local en español: propone opciones del catálogo y permite revisarlas antes de añadirlas.
- Perfiles de salida y revisión estructural del prompt.
- Deshacer cambios recientes.
- Búsqueda del catálogo con sinónimos frecuentes.
- Equivalencias para expresiones habituales en español, como «sonriendo», «está lloviendo» o «melena», acotadas a sus secciones correspondientes.
- Resultados del asistente sin preselección: la persona marca solo las coincidencias que quiere añadir.
- Revisión del prompt con aviso de texto libre que repite literalmente una opción ya seleccionada.
- Aviso de acumulación con recuento por ranura para que se puedan revisar selecciones redundantes.
- Modo rápido compacto para pantallas pequeñas.
- Revisión visual del modo rápido en móvil y escritorio.
- Afinado semántico opcional del asistente con IA: la respuesta solo puede ordenar IDs del catálogo y queda sin marcar para que la persona decida.
- Revisión opcional de redundancias semánticas mediante una acción manual; marca las selecciones posibles y permite quitar cualquiera desde el aviso.
- Proxy de IA para OpenRouter, OpenAI, Anthropic Claude y Google Gemini; las claves viven en el VPS, no en el navegador ni en Git.
- Las galerías «Conjunto completo» y «Pose» quedan fuera de estos cambios.

## Para una siguiente fase

- El asistente ya pondera contexto básico por sección, usa equivalencias españolas y puede corregir algunas erratas de una o dos letras cuando la coincidencia es inequívoca.
- Las equivalencias del asistente se limitan a sus secciones de intención y se respeta el género indicado, para evitar resultados cruzados como sugerencias masculinas en una idea de mujer.
- La corrección de erratas exige una coincidencia única y limita la distancia permitida según la longitud de la palabra; también descarta opciones de rostro cuyo rótulo indique explícitamente el género contrario.
- Las sugerencias incompatibles se omiten o ajustan al aplicarlas, con aviso; la revisión del prompt avisa si se acumulan demasiadas opciones en una ranura.
- Las equivalencias locales siguen ampliándose a partir de consultas reales. El modo IA aporta interpretación contextual cuando se configura una clave desde la web.
- Conectar el proveedor y modelo desde «Configurar conexión IA» en el navegador donde se vaya a utilizar.
