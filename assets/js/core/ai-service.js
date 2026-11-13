/** Cliente del servicio IA propio. El token de acceso vive solo en memoria, nunca en storage. */
let accessToken = '';
let selectedProvider = '';
let configPromise;

export function setAIAccessToken(value) {
  accessToken = String(value || '').trim();
}

export function hasAIAccessToken() {
  return accessToken.length >= 32;
}

export function setAIProvider(value) { selectedProvider = String(value || ''); }
export function getAIProvider() { return selectedProvider; }

export async function getAIConfig({ refresh = false } = {}) {
  if (refresh || !configPromise) {
    configPromise = fetch('/api/ai/config', { cache: 'no-store' }).then(async response => {
      if (!response.ok) throw new Error('No se pudo consultar la configuración del servicio IA.');
      const config = await response.json();
      return { providers: Array.isArray(config.providers) ? config.providers : [] };
    }).catch(error => { configPromise = null; throw error; });
  }
  return configPromise;
}

async function post(path, payload) {
  if (!hasAIAccessToken()) throw new Error('Introduce el token de acceso del servicio IA.');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 50_000);
  try {
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const messages = {
        access_denied: 'El token de acceso no coincide con el configurado en el servidor.',
        provider_unavailable: 'Ese proveedor no está configurado en el servidor.',
        rate_limited: 'Se alcanzó el límite temporal de solicitudes. Espera un minuto y prueba otra vez.',
        provider_error: 'El proveedor no respondió correctamente. Comprueba su clave, el modelo y el saldo disponible.',
      };
      throw new Error(messages[data.error] || 'No se pudo completar la solicitud al servicio IA.');
    }
    return data;
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('La solicitud al servicio IA tardó demasiado.');
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export const refineIdeaWithAI = (idea, candidates) => post('/api/ai/refine', { provider: selectedProvider, idea, candidates });
export const reviewSelectionWithAI = selected => post('/api/ai/review', { provider: selectedProvider, selected });
