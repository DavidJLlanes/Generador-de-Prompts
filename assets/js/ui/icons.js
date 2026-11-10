/** Iconos SVG en línea (trazo 1.6, 20×20). Se devuelven como cadenas para usar con `html:` o innerHTML. */
const P = {
  copy: '<rect x="7" y="7" width="10" height="10" rx="2"/><path d="M13 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>',
  check: '<path d="m4.5 10.5 3.5 3.5 7.5-8"/>',
  x: '<path d="m5.5 5.5 9 9m0-9-9 9"/>',
  lock: '<rect x="4.5" y="9" width="11" height="8" rx="2"/><path d="M7 9V6.5a3 3 0 0 1 6 0V9"/>',
  unlock: '<rect x="4.5" y="9" width="11" height="8" rx="2"/><path d="M7 9V6.5a3 3 0 0 1 5.6-1.5"/>',
  dice: '<rect x="3.5" y="3.5" width="13" height="13" rx="3"/><circle cx="7.5" cy="7.5" r=".8" fill="currentColor"/><circle cx="12.5" cy="12.5" r=".8" fill="currentColor"/><circle cx="10" cy="10" r=".8" fill="currentColor"/>',
  link: '<path d="M8.5 11.5a3 3 0 0 0 4.2 0l2.6-2.6a3 3 0 0 0-4.2-4.2l-.9.9"/><path d="M11.5 8.5a3 3 0 0 0-4.2 0l-2.6 2.6a3 3 0 0 0 4.2 4.2l.9-.9"/>',
  up: '<path d="m5 12.5 5-5 5 5"/>',
  down: '<path d="m5 7.5 5 5 5-5"/>',
  search: '<circle cx="9" cy="9" r="5"/><path d="m13 13 3.5 3.5"/>',
  trash: '<path d="M4 6h12M8 6V4h4v2m-6 0 .7 10h6.6L14 6"/>',
  menu: '<path d="M3.5 6h13M3.5 10h13M3.5 14h13"/>',
  arrow: '<path d="M4 10h12m-5-5 5 5-5 5"/>',
  layers: '<path d="m10 3 7 4-7 4-7-4 7-4Z"/><path d="m3 10.5 7 4 7-4"/><path d="m3 13.5 7 4 7-4"/>',
  spark: '<path d="M10 2.5 11.7 8.3 17.5 10l-5.8 1.7L10 17.5l-1.7-5.8L2.5 10l5.8-1.7L10 2.5Z"/>',
  sliders: '<path d="M4 6h8m4 0h0M4 14h2m4 0h6"/><circle cx="14" cy="6" r="1.8"/><circle cx="8" cy="14" r="1.8"/>',
  grid: '<rect x="3.5" y="3.5" width="5.5" height="5.5" rx="1.2"/><rect x="11" y="3.5" width="5.5" height="5.5" rx="1.2"/><rect x="3.5" y="11" width="5.5" height="5.5" rx="1.2"/><rect x="11" y="11" width="5.5" height="5.5" rx="1.2"/>',
};

export function icon(name, size = 18) {
  return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${P[name] || ''}</svg>`;
}
