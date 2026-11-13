/** Asistente local de ideas: traduce una descripción breve en opciones revisables del catálogo. */
import { h, clear } from './dom.js';
import { getCatalog, loadDomain } from '../core/registry.js';
import { store } from '../core/store.js';
import { fold } from '../core/util.js';
import { toast } from './toast.js';

const STOP = new Set('una uno un el la las los de del en con y o que para por quiero crear imagen foto fotografía retrato escena estilo aspecto como'.split(' '));
const ALIASES = {
  pelirroja: 'rojo roja pelirrojo cobrizo cobre cabello pelo', pelirrojo: 'rojo roja pelirroja cobrizo cobre cabello pelo',
  bosque: 'bosque arboles arbol árbol arboleda hayedo selva', niebla: 'niebla bruma neblina',
  cinematografica: 'cinematografico cine pelicula película film', cinematografico: 'cinematografica cine pelicula película film',
  mujer: 'mujer femenina', hombre: 'hombre masculino', joven: 'joven veinteañera veinteañero',
  atardecer: 'atardecer ocaso puesta sol anochecer golden hour', amanecer: 'amanecer alba sunrise',
  sonrisa: 'sonrisa sonriente feliz alegre', triste: 'tristeza melancolica melancólico', lluvioso: 'lluvia lluvia lluvia',
  azul: 'azul azulada azulado', elegante: 'elegante sofisticada sofisticado', playa: 'playa costa mar arena',
  noche: 'noche nocturno nocturna oscuridad', primerplano: 'primer plano close up rostro cara',
};

function words(text) {
  return fold(text).split(/[^a-z0-9]+/).filter(w => w.length > 2 && !STOP.has(w));
}

function termsFor(query) {
  const out = new Set(words(query));
  for (const w of [...out]) for (const alias of (ALIASES[w] || '').split(' ')) if (alias) out.add(fold(alias));
  return [...out];
}

async function loadSearchIndex() {
  const res = await fetch('/data/search-index.json');
  if (!res.ok) throw new Error('No se pudo cargar el índice del catálogo');
  return res.json();
}

export function openIdeaInterpreter() {
  const description = h('textarea', { class: 'field__textarea', rows: 3, maxlength: 500, placeholder: 'Ejemplo: retrato de una mujer pelirroja en un bosque con niebla, estilo cinematográfico', 'aria-label': 'Describe tu idea en español' });
  const find = h('button', { type: 'button', class: 'btn btn--primary' }, 'Buscar opciones');
  const status = h('p', { class: 'idea-interpreter__status', role: 'status', 'aria-live': 'polite' });
  const results = h('div', { class: 'idea-interpreter__results' });
  const apply = h('button', { type: 'button', class: 'btn btn--primary', disabled: true }, 'Añadir selección al prompt');
  const catalogLink = h('a', { class: 'btn btn--outline', href: '/generadores/' }, 'Abrir catálogo');
  const dialog = h('dialog', { class: 'start-dialog idea-interpreter', 'aria-labelledby': 'idea-interpreter-title' },
    h('div', { class: 'start-dialog__panel' },
      h('button', { type: 'button', class: 'icon-btn start-dialog__close', 'aria-label': 'Cerrar', onClick: () => dialog.close() }, '×'),
      h('p', { class: 'eyebrow' }, 'Asistente de ideas'), h('h2', { id: 'idea-interpreter-title' }, 'Describe la imagen que tienes en mente'),
      h('p', {}, 'El asistente buscará opciones del catálogo. Revisa las coincidencias y decide cuáles añadir.'), description,
      h('div', { class: 'idea-interpreter__actions' }, find, catalogLink), status, results, apply));

  let matches = [];
  find.addEventListener('click', async () => {
    const query = description.value.trim();
    const terms = termsFor(query);
    if (!query || terms.length < 1) { status.textContent = 'Escribe una idea con algún detalle concreto, por ejemplo pelo, lugar o ambiente.'; return; }
    find.disabled = true; apply.disabled = true; status.textContent = 'Buscando coincidencias…'; clear(results); matches = [];
    try {
      const index = await loadSearchIndex();
      const scored = [];
      for (let d = 0; d < index.d.length; d++) {
        const [slug, short] = index.d[d];
        const meta = getCatalog().domains.find(x => x.slug === slug);
        if (!meta) continue;
        if (slug === 'poses') continue; // se respeta la galería de poses excluida del trabajo
        for (const [domainIndex, sectionId, title, labels] of index.o) {
          if (domainIndex !== d || /conjunto completo|galer[ií]a/i.test(title)) continue;
          for (const label of labels) {
            const folded = fold(label);
            const hits = terms.filter(term => folded.includes(term));
            if (!hits.length) continue;
            const phrase = fold(query);
            scored.push({ id: meta.id, slug, short, sectionId, title, label, score: hits.length * 3 + (phrase.length > 4 && folded.includes(phrase) ? 8 : 0) });
          }
        }
      }
      const seen = new Set();
      matches = scored.sort((a, b) => b.score - a.score).filter(x => { const key = `${x.slug}/${x.sectionId}`; if (seen.has(key)) return false; seen.add(key); return true; }).slice(0, 14);
      if (!matches.length) { status.textContent = 'No encontré opciones claras. Prueba con palabras más concretas o abre el catálogo.'; return; }
      status.textContent = `He encontrado ${matches.length} coincidencias. Marca las que encajan; el texto original no se convierte automáticamente en prompt.`;
      matches.forEach((m, i) => {
        const checkbox = h('input', { type: 'checkbox', checked: i < 8, dataset: { match: String(i) } });
        const label = h('label', { class: 'idea-match' }, checkbox, h('span', {}, h('b', {}, m.label), h('small', {}, `${m.short} · ${m.title}`)));
        results.append(label);
      });
      apply.disabled = !matches.length;
    } catch (err) {
      status.textContent = 'No se pudo consultar el catálogo. Puedes abrirlo directamente.';
    } finally { find.disabled = false; }
  });

  apply.addEventListener('click', async () => {
    const chosen = [...results.querySelectorAll('input:checked')].map(x => matches[Number(x.dataset.match)]).filter(Boolean);
    if (!chosen.length) { toast('Marca al menos una opción', { tone: 'warn' }); return; }
    apply.disabled = true;
    try {
      const domains = await Promise.all([...new Set(chosen.map(x => x.id))].map(loadDomain));
      const bySlug = new Map(domains.map(d => [d.id, d]));
      for (const item of chosen) {
        const domain = bySlug.get(item.id);
        const section = domain?._secById.get(item.sectionId);
        const option = section?.options.find(o => o.es === item.label);
        if (section && option) store.toggleOption(domain.id, section, option.id, domain);
      }
      toast(`${chosen.length} opciones añadidas al prompt`);
      dialog.close();
    } catch (err) { toast('No se pudieron aplicar todas las opciones', { tone: 'warn' }); }
    finally { apply.disabled = false; }
  });
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => dialog.remove());
  document.body.append(dialog);
  dialog.showModal();
  description.focus();
}
