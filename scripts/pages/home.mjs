/** Página de inicio. */
import { esc } from '../../assets/js/core/util.js';
import { SLOTS } from '../../data/taxonomy.js';
import { icon } from '../../assets/js/ui/icons.js';
import { layout } from './layout.mjs';
import { fmt } from './shared.mjs';

const MARQUEE = [
  '35 mm analog photography', 'golden hour backlight', 'a tea house suspended over a lake', 'soft volumetric fog', 'long wavy auburn hair',
  'bioluminescent sea at night', 'cinematic teal and orange grading', 'a porcelain dragon among clouds', 'rain-soaked neon street', 'macro depth of field',
  'ancient stone bridge between two mountains', 'oil painting with visible brushwork', 'standing with arms crossed, confident gaze', 'aurora borealis over snow',
  'steampunk airship above a Victorian harbor', 'shallow depth of field, creamy bokeh', 'a glass lotus on black water', 'dramatic chiaroscuro lighting',
  'thunderstorm on the horizon', 'layered paper-cut diorama', 'a fox crossing a lavender field', 'ultra-wide 21:9 panorama',
];

export function homePage({ domains, totals }) {
  const marquee = [...MARQUEE, ...MARQUEE].map(t => `<span class="marquee__item">${esc(t)}</span>`).join('');
  const index = SLOTS.map(slot => {
    const list = domains.filter(d => d.role === slot.id);
    return `<div class="role-row"><div><h3 class="role-row__title">${esc(slot.plural)}</h3><p class="role-row__hint">${esc(slot.hint)}</p></div>
      <div class="role-row__pills">${list.map(d => `<a class="domain-pill" href="/generadores/${d.slug}/" title="${esc(d.summary)}">${esc(d.short)}</a>`).join('')}</div></div>`;
  }).join('');

  const main = `
<section class="hero">
  <div class="container hero__inner">
    <div class="hero__copy">
    <p class="dateline"><b>Lumen Vitae</b><span>·</span>Generador de prompts para imágenes con IA</p>
    <h1 class="hero__title">Prompts de <em>máxima calidad</em>, pieza a pieza.</h1>
    <p class="hero__lead">${totals.domains} generadores, más de ${fmt(Math.floor(totals.options / 1000) * 1000)} opciones y un constructor que cruza personajes, escenarios, clima y fotografía en un único prompt en inglés.</p>
    <div class="hero__cta">
      <a class="btn btn--primary btn--lg" href="/constructor/">Abrir el constructor ${icon('arrow', 18)}</a>
      <a class="btn btn--outline btn--lg" href="/generadores/">Explorar generadores</a>
    </div>
    <form class="hero__search field" action="/generadores/" method="get" role="search">
      <span class="field__icon">${icon('search')}</span>
      <input class="field__input" type="search" name="q" placeholder="Busca una opción: Ferrari, dragón, lluvia…" aria-label="Buscar una opción en todos los generadores" autocomplete="off">
    </form>
    </div>
    <div class="hero__visual" aria-hidden="true">
      <div class="mock">
        <div class="mock__bar"><span></span><span></span><span></span><b>Mi prompt</b></div>
        <div class="mock__rows">
          <div class="mock__row"><i>Sujeto</i><span>young adult woman, calm expression</span></div>
          <div class="mock__row"><i>Escenario</i><span>a tea house over a lake</span></div>
          <div class="mock__row"><i>Atmósfera</i><span>rainy night, light fog</span></div>
          <div class="mock__row"><i>Técnica</i><span>35 mm analog photography</span></div>
        </div>
        <p class="mock__text">Create the image of a woman, young adult woman in her early 20s, calm neutral expression. A traditional Japanese tea house suspended over a lake, on a rainy night<span class="mock__caret"></span></p>
      </div>
    </div>
  </div>
  <div class="marquee" aria-hidden="true"><div class="marquee__track">${marquee}</div></div>
</section>

<section class="section">
  <div class="container">
    <div class="section__head"><p class="eyebrow">Cómo funciona</p><h2 class="section__title">Tres pasos, <em>un prompt</em></h2></div>
    <div class="steps">
      <div class="step"><h3>Elige piezas</h3><p>Entra en cualquier generador y pulsa las opciones que quieras. Cada una trae su descripción en inglés lista para el modelo.</p></div>
      <div class="step"><h3>Cruza generadores</h3><p>Tu selección se conserva entre páginas. Pon un personaje en un escenario, añade clima y una cámara: todo se ordena solo.</p></div>
      <div class="step"><h3>Copia en tu formato</h3><p>Texto libre, redacción para ChatGPT o Gemini, prompt positivo y negativo para Stable Diffusion o Flux, o el JSON de Ideogram.</p></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section__head"><p class="eyebrow">Cruce de generadores</p><h2 class="section__title">Cada ranura es <em>opcional</em></h2>
      <p class="section__lead">Elige una mujer y un escenario, o solo la mujer: el prompt se completa igual. Lo que no eliges, simplemente no entra.</p></div>
    <div class="demo">
      <div class="demo__board">
        <div class="demo__row"><span class="demo__label">Sujeto</span><span class="demo__value">Mujer · veintipocos, expresión serena</span></div>
        <div class="demo__row is-off"><span class="demo__label">Pose</span><span class="demo__value">Sin elegir: no se incluye</span></div>
        <div class="demo__row"><span class="demo__label">Escenario</span><span class="demo__value">Una casa de té suspendida sobre un lago</span></div>
        <div class="demo__row"><span class="demo__label">Atmósfera</span><span class="demo__value">Noche de lluvia · niebla ligera</span></div>
        <div class="demo__row"><span class="demo__label">Técnica</span><span class="demo__value">Fotografía analógica de 35 mm</span></div>
      </div>
      <div class="demo__out">
        <span class="eyebrow" style="margin:0">Resultado (resumido)</span>
        <pre>Create the image of a woman, young adult woman in her early 20s, calm neutral expression. A traditional Japanese tea house suspended over a lake, on a rainy night. Light fog. 35 mm analog photography, soft natural light. Ultra-high-resolution finish. Aspect ratio "9:16".</pre>
        <button type="button" class="btn btn--primary" data-act="try-cross">Probar este cruce ${icon('arrow', 16)}</button>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section__head"><p class="eyebrow">Todo el catálogo</p><h2 class="section__title">${totals.domains} generadores, <em>seis ranuras</em></h2></div>
    <div class="role-index">${index}</div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="stats">
      <div class="stat"><span class="stat__n">${totals.domains}</span><span class="stat__l">generadores</span></div>
      <div class="stat"><span class="stat__n">${fmt(totals.sections)}</span><span class="stat__l">secciones</span></div>
      <div class="stat"><span class="stat__n">${fmt(totals.options)}</span><span class="stat__l">opciones</span></div>
      <div class="stat"><span class="stat__n">${fmt(totals.presets)}</span><span class="stat__l">ideas y recetas</span></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section__head"><p class="eyebrow">Formatos de salida</p><h2 class="section__title">El mismo prompt, <em>para cada modelo</em></h2></div>
    <div class="formats">
      <div class="format"><h3>Texto</h3><p>Una descripción continua en inglés, válida en cualquier generador de imágenes.</p><code>Create the image of a woman, …</code></div>
      <div class="format"><h3>ChatGPT / Gemini</h3><p>Redacción en lenguaje natural, organizada por bloques de sujeto, escenario y técnica.</p><code>Setting: A traditional Japanese tea house…</code></div>
      <div class="format"><h3>Stable Diffusion / Flux</h3><p>Prompt positivo y negativo por separado, con el tamaño sugerido para tu proporción.</p><code>Negative prompt: lowres, blurry, …</code></div>
      <div class="format"><h3>Ideogram (JSON)</h3><p>Descripción, estilo y composición estructurados, con paletas de color deducidas.</p><code>{ "high_level_description": … }</code></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="cta-band"><h2>Empieza con una <em>idea</em></h2><p>Explora ${fmt(totals.presets)} ideas y recetas listas para usar o construye la tuya desde cero.</p>
      <div class="hero__cta" style="justify-content:center;margin-top:0"><a class="btn btn--primary btn--lg" href="/constructor/">Abrir el constructor</a><a class="btn btn--outline btn--lg" href="/generadores/escenarios/">Ver la galería de ideas</a></div></div>
  </div>
</section>`;

  return layout({
    path: '/',
    title: 'Lumen Vitae · Generador de prompts para imágenes con IA',
    description: `Construye prompts de máxima calidad para imágenes con IA: ${totals.domains} generadores, más de ${fmt(Math.floor(totals.options / 1000) * 1000)} opciones y un constructor que cruza personajes, escenarios, clima y fotografía. Interfaz en español, prompts en inglés.`,
    main, script: 'home', domains, og: 'home',
    jsonld: [{ '@context': 'https://schema.org', '@type': 'WebSite', name: 'Lumen Vitae', url: 'https://lumenvitae.es/', inLanguage: 'es' }],
  });
}
