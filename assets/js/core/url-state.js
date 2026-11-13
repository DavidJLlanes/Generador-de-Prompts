import { sitePath } from './site-path.js';
/** Codifica/decodifica el prompt para compartirlo en un enlace (#s=…). Base64 URL-safe en UTF-8, sin servidor. */

const toB64Url = s => {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  bytes.forEach(b => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const fromB64Url = s => {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
};

export function encodeState(state) {
  const payload = { s: state.sel, d: state.detail === 'short' ? 0 : 1, b: state.boost ? 1 : 0, a: state.aspect || '' };
  if (state.custom && state.custom.trim()) payload.c = state.custom;
  return toB64Url(JSON.stringify(payload));
}

/** @returns {{sel: object, detail: string, boost: boolean, aspect: string, custom: string} | null} */
export function decodeState(code) {
  try {
    const p = JSON.parse(fromB64Url(code));
    if (!p || typeof p.s !== 'object') return null;
    return { sel: p.s, detail: p.d === 0 ? 'short' : 'rich', boost: p.b !== 0, aspect: typeof p.a === 'string' ? p.a : '', custom: typeof p.c === 'string' ? p.c : '' };
  } catch {
    return null;
  }
}

export const shareUrl = state => `${location.origin}${sitePath('/constructor/')}#s=${encodeState(state)}`;

/** Si la URL trae un prompt compartido, devuelve su estado (y limpia el hash). */
export function readSharedFromLocation() {
  const m = /^#s=([A-Za-z0-9_-]+)$/.exec(location.hash);
  if (!m) return null;
  const decoded = decodeState(m[1]);
  history.replaceState(null, '', location.pathname + location.search);
  return decoded;
}
