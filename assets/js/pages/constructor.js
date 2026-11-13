/** Constructor (/constructor/): tablero de ranuras + panel de prompt, con aleatorio total e ideas. */
import { $ } from '../ui/dom.js';
import { initChrome } from '../ui/chrome.js';
import { store } from '../core/store.js';
import { loadDomain } from '../core/registry.js';
import { createPromptPanel } from '../ui/prompt-panel.js';
import { mountSlotBoard, randomizeAll } from '../ui/slot-board.js';
import { openPresets } from '../ui/presets-drawer.js';
import { toast } from '../ui/toast.js';

initChrome();

$('[data-panel]').append(createPromptPanel({ variant: 'inline' }).el);
mountSlotBoard($('[data-board]'));

$('[data-act="random-all"]').addEventListener('click', () => randomizeAll().catch(() => toast('No se pudo generar la combinación', { tone: 'warn' })));
$('[data-act="clear"]').addEventListener('click', () => store.clearAll());
$('[data-act="ideas"]').addEventListener('click', () => loadDomain('scenarios').then(openPresets).catch(() => toast('No se pudieron cargar las ideas', { tone: 'warn' })));
const startDialog = $('[data-start-dialog]');
$('[data-act="start"]').addEventListener('click', () => startDialog.showModal());
$('[data-act="close-start"]').addEventListener('click', () => startDialog.close());
$('[data-act="inspire"]').addEventListener('click', () => { startDialog.close(); loadDomain('scenarios').then(openPresets).catch(() => toast('No se pudieron cargar las ideas', { tone: 'warn' })); });
$('[data-act="surprise"]').addEventListener('click', () => { startDialog.close(); randomizeAll().catch(() => toast('No se pudo generar la combinación', { tone: 'warn' })); });
const quick = $('[data-act="quick"]');
quick.checked = localStorage.getItem('lv:quick-mode') === '1';
document.body.classList.toggle('quick-mode', quick.checked);
quick.addEventListener('change', () => { document.body.classList.toggle('quick-mode', quick.checked); localStorage.setItem('lv:quick-mode', quick.checked ? '1' : '0'); });
