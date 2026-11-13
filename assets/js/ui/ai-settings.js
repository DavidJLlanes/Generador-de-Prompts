import { h } from './dom.js';
import { getAIConfig, getAIProvider, hasAIAccessToken, setAIAccessToken, setAIProvider } from '../core/ai-service.js';

/** Ajustes temporales del proxy. Nunca pide ni conserva claves de OpenAI/proveedores en el navegador. */
export function openAISettings() {
  const provider = h('select', { class: 'select', 'aria-label': 'Proveedor de IA' });
  const token = h('input', { class: 'field__input', type: 'password', autocomplete: 'off', spellcheck: 'false', placeholder: 'Token de acceso del proxy (32 caracteres o más)', 'aria-label': 'Token de acceso del proxy IA', onInput: e => setAIAccessToken(e.target.value) });
  const status = h('p', { class: 'idea-interpreter__status', role: 'status', 'aria-live': 'polite' }, 'Consultando el servicio…');
  const clearToken = h('button', { type: 'button', class: 'btn btn--outline btn--sm', onClick: () => { token.value = ''; setAIAccessToken(''); status.textContent = 'Token borrado de la memoria de esta pestaña.'; } }, 'Borrar token');
  const done = h('button', { type: 'button', class: 'btn btn--primary', onClick: () => dialog.close() }, 'Listo');
  const dialog = h('dialog', { class: 'start-dialog ai-settings', 'aria-labelledby': 'ai-settings-title' },
    h('div', { class: 'start-dialog__panel' },
      h('button', { type: 'button', class: 'icon-btn start-dialog__close', 'aria-label': 'Cerrar', onClick: () => dialog.close() }, '×'),
      h('p', { class: 'eyebrow' }, 'Servicio de IA'),
      h('h2', { id: 'ai-settings-title' }, 'Conexión segura al servidor'),
      h('p', {}, 'Las claves de OpenAI, Anthropic, Gemini y OpenRouter se configuran solo en el servidor. Aquí introduces únicamente el token de acceso del proxy.'),
      h('label', { class: 'prompt-panel__custom' }, h('span', { class: 'prompt-panel__custom-label' }, 'Proveedor y modelo'), provider),
      h('label', { class: 'prompt-panel__custom' }, h('span', { class: 'prompt-panel__custom-label' }, 'Token del proxy'), token),
      h('p', { class: 'ai-settings__privacy' }, 'Al usar IA se enviará la descripción o las selecciones al servidor de Lumen Vitae y al proveedor elegido. El proveedor puede aplicar sus condiciones de uso y cobrar por solicitud. El token se conserva solo en la memoria de esta pestaña y se borra al recargar o cerrar la página.'),
      status, h('div', { class: 'idea-interpreter__actions' }, clearToken, done)));

  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => dialog.remove());
  document.body.append(dialog);
  dialog.showModal();
  getAIConfig({ refresh: true }).then(config => {
    provider.replaceChildren(...config.providers.map(p => h('option', { value: p.id }, `${p.label} · ${p.model}`)));
    if (!config.providers.length) {
      provider.disabled = true;
      status.textContent = 'El servicio responde, pero aún no tiene ningún proveedor y modelo configurados.';
      return;
    }
    provider.disabled = false;
    const current = config.providers.some(p => p.id === getAIProvider()) ? getAIProvider() : config.providers[0].id;
    provider.value = current;
    setAIProvider(current);
    provider.addEventListener('change', () => setAIProvider(provider.value));
    status.textContent = hasAIAccessToken() ? 'Conexión preparada. El token sigue solo en memoria.' : 'Elige proveedor e introduce el token de acceso del proxy.';
  }).catch(() => {
    provider.disabled = true;
    status.textContent = 'No se encuentra el servicio IA. Configura scripts/ai-api.mjs y el proxy de nginx en el servidor.';
  });
  token.focus();
  return dialog;
}
