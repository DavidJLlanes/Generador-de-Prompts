import { h } from './dom.js';
import { getAISettings, getAIProviders, loadAIModels, removeAIProvider, saveAIProvider, setAIProvider } from '../core/ai-service.js';

/** Conexión por clave propia, guardada en el navegador del usuario. */
export function openAISettings() {
  const providers = getAIProviders();
  const initial = getAISettings();
  const provider = h('select', { class: 'select', 'aria-label': 'Proveedor de IA' },
    ...Object.entries(providers).map(([id, info]) => h('option', { value: id }, info.label)));
  provider.value = initial.provider || 'openrouter';
  const apiKey = h('input', { class: 'field__input', type: 'password', autocomplete: 'off', spellcheck: 'false', placeholder: 'Pega aquí tu clave API', 'aria-label': 'Clave API' });
  const model = h('input', { class: 'field__input', type: 'text', autocomplete: 'off', spellcheck: 'false', placeholder: 'Toca un modelo de la lista o escribe su ID', 'aria-label': 'Modelo de IA' });
  const modelSearch = h('input', { class: 'field__input ai-settings__model-search', type: 'search', placeholder: 'Filtrar modelos por nombre o ID', 'aria-label': 'Filtrar modelos', hidden: true });
  const modelList = h('div', { class: 'ai-settings__models', role: 'list', 'aria-label': 'Modelos disponibles', hidden: true });
  let availableModels = [];
  const keyLink = h('a', { class: 'btn btn--outline btn--sm', target: '_blank', rel: 'noopener noreferrer' }, 'Obtener clave API ↗');
  const status = h('p', { class: 'idea-interpreter__status', role: 'status', 'aria-live': 'polite' });
  function persistModelWithSavedKey(modelId) {
    const savedKey = getAISettings().accounts[provider.value]?.apiKey;
    if (!savedKey || !modelId.trim()) return false;
    apiKey.value = savedKey;
    saveAIProvider(provider.value, savedKey, modelId);
    setAIProvider(provider.value);
    return true;
  }
  function renderModels() {
    const query = modelSearch.value.trim().toLocaleLowerCase();
    const matches = availableModels.filter(item => `${item.name} ${item.id}`.toLocaleLowerCase().includes(query));
    modelList.replaceChildren(...matches.map(item => h('button', {
      type: 'button', class: `ai-settings__model${model.value === item.id ? ' is-selected' : ''}`,
      'aria-pressed': model.value === item.id ? 'true' : 'false',
      onClick: () => {
        model.value = item.id;
        let saved = false;
        try { saved = persistModelWithSavedKey(item.id); }
        catch (error) { status.textContent = error.message; }
        renderModels();
        status.textContent = saved
          ? `Modelo actualizado y clave conservada: ${item.id}`
          : `Modelo seleccionado: ${item.id}. Pulsa «Guardar y conectar» para conservarlo.`;
      },
    }, h('b', {}, item.name), h('small', {}, item.id))));
    if (availableModels.length) {
      modelSearch.hidden = false;
      modelList.hidden = false;
      status.textContent = query
        ? `Mostrando ${matches.length} de ${availableModels.length} modelos.`
        : `Lista de ${availableModels.length} modelos disponibles. Toca uno para seleccionarlo.`;
    }
  }
  modelSearch.addEventListener('input', renderModels);
  model.addEventListener('input', renderModels);
  model.addEventListener('change', () => {
    try {
      if (persistModelWithSavedKey(model.value)) status.textContent = 'Modelo y clave guardados en este navegador.';
    } catch (error) { status.textContent = error.message; }
  });
  const loadButton = h('button', { type: 'button', class: 'btn btn--outline btn--sm', onClick: async () => {
    loadButton.disabled = true; status.textContent = 'Consultando los modelos de tu cuenta…';
    try {
      availableModels = await loadAIModels(provider.value, apiKey.value);
      modelSearch.value = '';
      renderModels();
      if (!availableModels.length) status.textContent = 'La API no devolvió modelos; escribe el ID manualmente.';
    } catch (error) { status.textContent = `${error.message} Si falla la consulta por el navegador, puedes escribir el ID del modelo manualmente.`; }
    finally { loadButton.disabled = false; }
  } }, 'Cargar modelos');
  const saveButton = h('button', { type: 'button', class: 'btn btn--primary', onClick: () => {
    try {
      const savedKey = getAISettings().accounts[provider.value]?.apiKey;
      const keyToSave = apiKey.value.trim() || savedKey || '';
      saveAIProvider(provider.value, keyToSave, model.value);
      setAIProvider(provider.value);
      status.textContent = 'Clave y modelo guardados en este navegador. Ya puedes usar la IA.';
      apiKey.value = keyToSave;
      apiKey.placeholder = 'Clave guardada · pega otra para reemplazarla';
    } catch (error) { status.textContent = error.message; }
  } }, 'Guardar y conectar');
  const removeButton = h('button', { type: 'button', class: 'btn btn--outline btn--sm', onClick: () => {
    removeAIProvider(provider.value); apiKey.value = ''; model.value = ''; status.textContent = 'Se ha borrado la configuración de este proveedor de este navegador.';
  } }, 'Borrar esta clave');
  const dialog = h('dialog', { class: 'start-dialog ai-settings', 'aria-labelledby': 'ai-settings-title' },
    h('div', { class: 'start-dialog__panel' },
      h('button', { type: 'button', class: 'icon-btn start-dialog__close', 'aria-label': 'Cerrar', onClick: () => dialog.close() }, '×'),
      h('p', { class: 'eyebrow' }, 'Servicio de IA'),
      h('h2', { id: 'ai-settings-title' }, 'Conecta tu propia IA'),
      h('p', {}, 'Elige proveedor, pega tu clave API y selecciona un modelo. Se guarda en este navegador y se usa directamente desde aquí; no tienes que configurar el VPS.'),
      h('label', { class: 'prompt-panel__custom' }, h('span', { class: 'prompt-panel__custom-label' }, 'Proveedor'), provider),
      h('div', { class: 'ai-settings__row' }, keyLink, h('span', { class: 'idea-interpreter__status' }, 'La clave se guarda solo en este navegador.')),
      h('label', { class: 'prompt-panel__custom' }, h('span', { class: 'prompt-panel__custom-label' }, 'Clave API'), apiKey),
      h('div', { class: 'ai-settings__row' }, loadButton, h('span', { class: 'idea-interpreter__status' }, 'También puedes escribir el modelo manualmente.')),
      h('label', { class: 'prompt-panel__custom' }, h('span', { class: 'prompt-panel__custom-label' }, 'Modelo'), model),
      modelSearch, modelList,
      h('p', { class: 'ai-settings__privacy' }, 'La clave se almacena en el almacenamiento local de este navegador y las solicitudes se envían al proveedor elegido. Úsalo en un dispositivo de confianza. El proveedor puede aplicar sus condiciones y cobrar por el uso.'),
      status, h('div', { class: 'idea-interpreter__actions' }, saveButton, removeButton)));

  function fillForProvider() {
    availableModels = [];
    modelSearch.value = '';
    modelSearch.hidden = true;
    modelList.replaceChildren();
    modelList.hidden = true;
    const info = providers[provider.value];
    const account = getAISettings().accounts[provider.value] || {};
    apiKey.value = account.apiKey || '';
    apiKey.placeholder = account.apiKey ? 'Clave guardada · pega otra para reemplazarla' : 'Pega aquí tu clave API';
    model.value = account.model || '';
    keyLink.href = info.keyUrl;
    status.textContent = account.apiKey ? 'Ya tienes una clave guardada para este proveedor.' : '';
  }
  provider.addEventListener('change', fillForProvider);
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => dialog.remove());
  document.body.append(dialog);
  fillForProvider();
  dialog.showModal();
  apiKey.focus();
  return dialog;
}
