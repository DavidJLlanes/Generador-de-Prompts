/** «Buscar actualizaciones»: compara la versión de esta pestaña, la del servidor y la que hay en GitHub (rama main). */
import { sitePath } from '../core/site-path.js';
import { BUILD } from '../../../data/version.js';
import { h } from './dom.js';
import { openToolDialog } from './dialog-kit.js';

const REPO = 'DavidJLlanes/Generador-de-Prompts';
const REMOTE = `https://raw.githubusercontent.com/${REPO}/main/data/version.json`;
export const PULL_COMMAND = 'git -C /var/www/djl.com.es/prompt pull --ff-only origin main';

async function readJson(url) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(String(res.status));
  const data = await res.json();
  if (!data || typeof data.id !== 'string') throw new Error('formato');
  return data;
}

/** Estado según los tres ids: 'ok' | 'reload' | 'behind' | 'offline'. Puro, para poder probarlo. */
export function compareVersions(running, server, remote) {
  if (!remote) return 'offline';
  if (server && server.id !== running.id) return 'reload';
  return remote.id === running.id ? 'ok' : 'behind';
}

export async function checkUpdates() {
  const [server, remote] = await Promise.all([
    readJson(`${sitePath('/data/version.json')}?t=${Date.now()}`).catch(() => null),
    readJson(`${REMOTE}?t=${Date.now()}`).catch(() => null),
  ]);
  return { running: BUILD, server, remote, state: compareVersions(BUILD, server, remote) };
}

const label = v => `${v.version} · ${v.id}`;

async function clearCachesAndReload() {
  try { await Promise.all((await caches.keys()).map(k => caches.delete(k))); } catch { /* sin Cache API */ }
  location.reload();
}

export function openUpdateCheck() {
  const { dialog, body } = openToolDialog({ title: 'Buscar', emphasis: 'actualizaciones', lead: 'Compara esta página con el servidor y con GitHub.', id: 'update' });
  const out = h('div', { class: 'tool-card', 'aria-live': 'polite' }, h('p', {}, 'Comprobando…'));
  body.append(out);

  checkUpdates().then(r => {
    const rows = h('dl', { class: 'update-rows' },
      h('dt', {}, 'Esta pestaña'), h('dd', {}, label(r.running)),
      h('dt', {}, 'Servidor'), h('dd', {}, r.server ? label(r.server) : 'no disponible'),
      h('dt', {}, 'GitHub (main)'), h('dd', {}, r.remote ? label(r.remote) : 'no disponible'));
    const say = {
      ok: ['Estás en la última versión.', 'Esta pestaña, el servidor y GitHub coinciden.'],
      reload: ['Hay una versión más nueva en el servidor.', 'Esta pestaña se cargó antes de actualizarlo. Recarga para usarla.'],
      behind: ['Tu servidor no coincide con GitHub.', 'Si has publicado cambios, actualiza el servidor con el comando de abajo. Si el servidor va por delante de GitHub, no hace falta hacer nada.'],
      offline: ['No se pudo consultar GitHub.', 'Comprueba la conexión. Si el sitio tiene una CSP, su connect-src debe permitir https://raw.githubusercontent.com.'],
    }[r.state];
    out.replaceChildren(
      h('h3', { class: 'tool-card__title' }, say[0]),
      h('p', { class: 'tool-note' }, say[1]),
      rows,
      ...(r.state === 'reload' ? [h('button', { type: 'button', class: 'btn btn--primary', onClick: clearCachesAndReload }, 'Recargar ahora')] : []),
      ...(r.state === 'behind' ? [h('code', { class: 'update-cmd' }, PULL_COMMAND),
        h('button', { type: 'button', class: 'btn btn--outline btn--sm', onClick: e => { navigator.clipboard?.writeText(PULL_COMMAND); e.currentTarget.textContent = 'Copiado'; } }, 'Copiar comando')] : []));
  });
  return dialog;
}
