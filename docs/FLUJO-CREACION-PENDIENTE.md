# Seguimiento del flujo de creación de prompts

## Implementado

- Inicio guiado: inspiración, combinación aleatoria o descripción de una idea.
- Asistente local en español: propone opciones del catálogo y permite revisarlas antes de añadirlas.
- Perfiles de salida y revisión estructural del prompt.
- Deshacer cambios recientes.
- Búsqueda del catálogo con sinónimos frecuentes.
- Modo rápido compacto para pantallas pequeñas.
- Las galerías «Conjunto completo» y «Pose» quedan fuera de estos cambios.

## Para una siguiente fase

- El asistente ya pondera contexto básico por sección, usa equivalencias españolas y puede corregir algunas erratas de una o dos letras cuando la coincidencia es inequívoca.
- Las equivalencias del asistente se limitan a sus secciones de intención y se respeta el género indicado, para evitar resultados cruzados como sugerencias masculinas en una idea de mujer.
- Las sugerencias incompatibles se omiten o ajustan al aplicarlas, con aviso; la revisión del prompt avisa si se acumulan demasiadas opciones en una ranura.
- Mantener una comprensión abierta de paráfrasis y relaciones entre conceptos: la versión local sigue limitada al vocabulario del catálogo y a reglas explícitas.
- Si se quiere comprensión abierta, diseñar y conectar un servicio de IA con consentimiento explícito y gestión segura de claves. No incluir claves privadas en el JavaScript público.
- Ampliar las equivalencias a partir de consultas reales y revisar casos ambiguos de corrección ortográfica.
- Revisar visualmente el modo rápido en móvil y escritorio.
- Considerar sugerencias para incompatibilidades y redundancias del prompt además de las comprobaciones estructurales actuales.
