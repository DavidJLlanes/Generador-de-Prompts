/**
 * Servidor estático de desarrollo, sin dependencias. Uso: npm run dev  →  http://localhost:5173
 * (Los módulos ES y el import() dinámico necesitan http://; no funcionan abriendo el HTML con doble clic.)
 */
import { createStaticServer } from './lib/server.mjs';
import { createAIApiServer } from './ai-api.mjs';

const PORT = Number(process.env.PORT) || 5173;
const AI_PORT = Number(process.env.AI_PORT) || 8787;
createAIApiServer().listen(AI_PORT, '127.0.0.1', () => console.log(`Lumen Vitae AI API · http://127.0.0.1:${AI_PORT}`));
createStaticServer({ aiProxyPort: AI_PORT }).listen(PORT, () => console.log(`Lumen Vitae · desarrollo en http://localhost:${PORT}`));
