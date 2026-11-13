/**
 * Servidor estático de desarrollo, sin dependencias. Uso: npm run dev  →  http://localhost:5173
 * (Los módulos ES y el import() dinámico necesitan http://; no funcionan abriendo el HTML con doble clic.)
 */
import { createStaticServer } from './lib/server.mjs';

const PORT = Number(process.env.PORT) || 5173;
createStaticServer().listen(PORT, () => console.log(`Lumen Vitae · desarrollo en http://localhost:${PORT}`));
