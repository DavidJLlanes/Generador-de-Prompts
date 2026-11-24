/**
 * ACCIONES RÁPIDAS — copiar el prompt actual y generar al azar, reutilizables desde cualquier botón
 * (panel de prompt, barra del constructor, cabecera de cada generador, dock).
 */
import { live } from '../core/live.js';
import { store } from '../core/store.js';
import { loadDomain } from '../core/registry.js';
import { randomSelection } from '../core/random.js';
import { renderFormat } from '../core/formats/index.js';
import { recordHistory } from '../core/library.js';
import { copyText } from './clipboard.js';
import { manual } from '../core/manual.js';
import { randomizeAll } from './slot-board.js';
import { toast } from './toast.js';

/** Copia el prompt compuesto con el formato elegido (o avisa si aún no hay nada). */
export function copyCurrentPrompt() {
  const { composed, state } = live.get();
  if (composed.empty) { toast('Elige algo primero', { tone: 'warn' }); return; }
  copyText(manual.resolve(renderFormat(state.format, composed, state).text), 'Prompt copiado');
  recordHistory(state);
}

/** Aleatorio según el contexto: en la página de un generador, ese generador; en el resto, una combinación completa. */
export async function randomizeHere() {
  try {
    const id = document.body.dataset.domainId;
    if (id) {
      const domain = await loadDomain(id);
      const sel = randomSelection([domain], store.get(), Math.random, 12);
      store.applySelection(domain.id, sel[domain.id] || {});
    } else {
      await randomizeAll();
    }
  } catch { toast('No se pudo generar la combinación', { tone: 'warn' }); }
}
