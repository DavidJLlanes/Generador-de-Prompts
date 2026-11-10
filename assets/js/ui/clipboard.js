import { toast } from './toast.js';

/** Copia texto al portapapeles (con alternativa para navegadores o contextos sin la API moderna). */
export async function copyText(text, okMessage = 'Copiado al portapapeles') {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
    document.body.append(ta);
    ta.select();
    try { document.execCommand('copy'); } catch { toast('No se pudo copiar. Selecciona el texto a mano.', { tone: 'warn' }); ta.remove(); return false; }
    ta.remove();
  }
  toast(okMessage);
  return true;
}
