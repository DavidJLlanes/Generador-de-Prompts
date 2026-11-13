/** Constructor de prompts cruzados (/constructor/). */
import { icon } from '../../assets/js/ui/icons.js';
import { layout } from './layout.mjs';

export function constructorPage({ domains }) {
  const main = `<div class="container">
  <div class="page-head">
    <p class="eyebrow">Constructor</p>
    <h1>Cruza lo que <em>quieras</em></h1>
    <p>Cada ranura es opcional. Elige un generador en cada una, marca las opciones que te interesen y el prompt se ordena y se completa solo, incluso si dejas ranuras vacías.</p>
  </div>
  <div class="constructor__bar">
    <button type="button" class="btn btn--primary" data-act="start">${icon('spark', 18)} Empezar guiado</button>
    <button type="button" class="btn btn--primary" data-act="random-all">${icon('dice', 18)} Combinación aleatoria</button>
    <button type="button" class="btn btn--outline" data-act="ideas">${icon('spark', 18)} Galería de ideas</button>
    <button type="button" class="btn btn--ghost" data-act="clear">${icon('trash', 18)} Vaciar todo</button>
    <label class="quick-toggle"><input type="checkbox" data-act="quick"> Modo rápido</label>
  </div>
  <dialog class="start-dialog" data-start-dialog aria-labelledby="start-title"><div class="start-dialog__panel"><button type="button" class="icon-btn start-dialog__close" data-act="close-start" aria-label="Cerrar">${icon('x', 18)}</button><p class="eyebrow">Constructor</p><h2 id="start-title">¿Cómo quieres empezar?</h2><p>Elige un camino. Después podrás ajustar cualquier parte del prompt.</p><div class="start-dialog__choices"><button type="button" class="start-choice" data-act="inspire"><b>Quiero inspirarme</b><span>Explora ideas preparadas y modifica sus componentes.</span></button><button type="button" class="start-choice" data-act="surprise"><b>Sorpréndeme</b><span>Genera una combinación y úsala como punto de partida.</span></button><button type="button" class="start-choice" data-act="describe-idea"><b>Tengo una idea</b><span>Descríbela en español y elige las opciones sugeridas.</span></button></div></div></dialog>
  <div class="constructor__layout">
    <div class="constructor__board" data-board></div>
    <aside class="constructor__panel" data-panel aria-label="Tu prompt"></aside>
  </div>
  <noscript><p class="notice">El constructor necesita JavaScript para funcionar.</p></noscript>
</div>`;

  return layout({
    path: '/constructor/',
    title: 'Constructor de prompts cruzados para imágenes con IA | Lumen Vitae',
    description: 'Combina personajes, poses, escenarios, clima y fotografía en un único prompt en inglés. Cada ranura es opcional: elige solo lo que necesites.',
    main, script: 'constructor', bodyData: { dock: 'off' }, domains, og: 'constructor',
    jsonld: [{ '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Constructor de prompts de Lumen Vitae', url: 'https://lumenvitae.es/constructor/', applicationCategory: 'DesignApplication', operatingSystem: 'Web', inLanguage: 'es', isAccessibleForFree: true }],
  });
}
