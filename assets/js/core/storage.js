/** Acceso seguro a localStorage (puede lanzar en modo privado o con el almacenamiento bloqueado). */

const mem = new Map();

export function loadJSON(key, fallback = null) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return mem.has(key) ? mem.get(key) : fallback;
  }
}

export function saveJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    mem.set(key, value);
  }
}

export function removeKey(key) {
  try { window.localStorage.removeItem(key); } catch { /* sin almacenamiento */ }
  mem.delete(key);
}
