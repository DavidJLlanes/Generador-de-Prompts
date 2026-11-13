/** Asistente local de ideas: traduce una descripción breve en opciones revisables del catálogo. */
import { h, clear } from './dom.js';
import { getCatalog, loadDomain } from '../core/registry.js';
import { store } from '../core/store.js';
import { reasonBlocked } from '../core/exclusions.js';
import { fold } from '../core/util.js';
import { toast } from './toast.js';
import { getAIConfig, getAIProvider, refineIdeaWithAI, setAIProvider } from '../core/ai-service.js';
import { openAISettings } from './ai-settings.js';

const STOP = new Set('una uno un el la las los de del en con y o que para por quiero crear imagen foto fotografía retrato escena estilo aspecto como'.split(' '));
const ALIASES = {
  pelirroja: 'rojo roja pelirrojo cobrizo cobre cabello pelo', pelirrojo: 'rojo roja pelirroja cobrizo cobre cabello pelo',
  melena: 'cabello pelo peinado',
  bosque: 'bosque arboles arbol arboleda hayedo selva forest', arbol: 'arboles bosque arboleda hayedo',
  niebla: 'bruma neblina niebla', brumoso: 'niebla bruma neblina', cinematografica: 'cinematografico cine pelicula film cinematica',
  cinematografico: 'cinematografica cine pelicula film cinematica', mujer: 'femenina mujer adulta', hombre: 'masculino hombre varon',
  sonriendo: 'sonrisa sonriente feliz alegre', sonreir: 'sonrisa sonriente feliz alegre', riendo: 'sonrisa sonriente feliz alegre',
  enfadado: 'enfadada enojado enojada furioso furiosa ira', enojado: 'enfadada enfadado enojada furiosa ira',
  sorprendido: 'sorprendida sorpresa asombro asombrada',
  chica: 'mujer femenina joven', chico: 'hombre masculino joven', joven: 'veinteañera veinteañero juvenil',
  atardecer: 'ocaso puesta sol anochecer hora dorada golden hour', ocaso: 'atardecer puesta sol anochecer',
  amanecer: 'alba primera luz sunrise', amaneciendo: 'amanecer alba primera luz sunrise', anocheciendo: 'atardecer ocaso anochecer',
  atardeciendo: 'atardecer ocaso puesta sol anochecer', lluvia: 'lluvioso lluviosa lluvia aguacero llovizna',
  lloviendo: 'lluvia lluvioso lluviosa aguacero llovizna', nieve: 'nevado nevada copos ventisca', nevando: 'nieve nevado nevada copos',
  tormenta: 'tormentoso relampago trueno rayos', sonrisa: 'sonriente feliz alegre contenta', triste: 'tristeza melancolica melancolico afligida',
  enfadada: 'enfadado enojada furiosa ira', sorprendida: 'sorpresa asombro asombrada', azul: 'azulada azulado celeste cobalto',
  rojo: 'roja rojizo escarlata carmesi granate', rubio: 'rubia dorado miel platino', moreno: 'morena oscuro castaño',
  elegante: 'sofisticada sofisticado refinada refinado', playa: 'costa mar arena litoral', costa: 'playa litoral orilla mar',
  noche: 'nocturno nocturna oscuridad medianoche', dia: 'diurno diurna luz solar', primerplano: 'primer plano close up rostro cara',
  retrato: 'rostro cara retrato primer plano busto', ojos: 'ojo mirada iris', labios: 'labio boca',
  pelo: 'cabello peinado melena', cabello: 'pelo peinado melena', ropa: 'vestuario vestido prendas', vestido: 'ropa vestuario prendas',
  coche: 'automovil auto vehiculo', ciudad: 'urbano urbana calles edificios', antiguo: 'antigua vintage historico clasico',
  futurista: 'futurismo sci fi ciencia ficcion tecnologico', fantasia: 'fantastico magico magia mitico',
  terror: 'horror oscuro siniestro miedo', minimalista: 'minimal limpio sencillo', vapor: 'humo niebla bruma',
};

// Afinidad entre palabras de la idea y el selector más probable. Da prioridad a la sección
// correcta cuando la misma palabra aparece también en labios, ropa, clima o paleta.
const FOCUSES = [
  { words: ['pelirroja', 'pelirrojo', 'pelo', 'cabello', 'melena', 'peinado', 'rubio', 'moreno'], sections: ['colorpelo', 'peinado', 'textura', 'largo', 'raya', 'flequillo'] },
  { words: ['ojos', 'ojo', 'mirada'], sections: ['ojos', 'ojosforma'] },
  { words: ['labios', 'labio', 'boca'], sections: ['labios', 'colorlabios'] },
  { words: ['sonrisa', 'sonriente', 'sonriendo', 'sonreir', 'riendo', 'triste', 'enfadada', 'enfadado', 'enojado', 'sorprendida', 'sorprendido'], sections: ['expresion'] },
  { words: ['bosque', 'arbol', 'selva', 'playa', 'costa', 'ciudad', 'montana', 'desierto'], sections: ['motivo', 'ideas'] },
  { words: ['niebla', 'lluvia', 'lloviendo', 'nieve', 'nevando', 'tormenta', 'viento', 'clima'], sections: ['tipo-niebla', 'tipo-lluvia', 'tipo-nieve', 'tipo-clima', 'ambiente'] },
  { words: ['atardecer', 'atardeciendo', 'ocaso', 'amanecer', 'amaneciendo', 'anocheciendo', 'noche', 'dia', 'luz'], sections: ['ambiente', 'paleta', 'luz-ambiente', 'cielo-color'] },
  { words: ['cinematografica', 'cinematografico', 'fotografia', 'camara', 'objetivo'], sections: ['estilo', 'style', 'camera', 'lens'] },
  { words: ['vestido', 'ropa', 'vestuario'], sections: ['ropa', 'colorropa', 'tejido'] },
];

function words(text) {
  return fold(text).split(/[^a-z0-9]+/).filter(w => w.length > 2 && !STOP.has(w));
}

function editDistanceAtMostTwo(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 3;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  let prev2 = null;
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]; let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) cur[j] = Math.min(cur[j], prev2[j - 2] + 1);
      rowMin = Math.min(rowMin, cur[j]);
    }
    if (rowMin > 2) return 3;
    prev2 = prev; prev = cur;
  }
  return prev[b.length];
}

function termsFor(query, vocabulary) {
  const original = words(query);
  const out = new Set(original);
  let corrected = false;
  for (const w of original) {
    if (w.length >= 5 && !vocabulary.has(w)) {
      const maxDistance = w.length >= 7 ? 2 : 1;
      let best = 3; let candidates = [];
      for (const known of vocabulary) {
        if (Math.abs(known.length - w.length) > 2) continue;
        const distance = editDistanceAtMostTwo(w, known);
        if (distance < best) { best = distance; candidates = [known]; }
        else if (distance === best) candidates.push(known);
      }
      if (best <= maxDistance && candidates.length === 1) { out.add(candidates[0]); corrected = true; }
    }
    for (const alias of (ALIASES[w] || '').split(' ')) if (alias) out.add(fold(alias));
  }
  return { original, terms: [...out], corrected };
}

function explicitGender(original) {
  if (original.some(w => ['mujer', 'chica', 'femenina'].includes(w))) return 'mujer';
  if (original.some(w => ['hombre', 'chico', 'masculino', 'varon'].includes(w))) return 'hombre';
  return null;
}

function conflictsWithExplicitGender(gender, slug, sectionId, label) {
  if (!gender) return false;
  if (gender === 'mujer' && slug === 'hombre') return true;
  if (gender === 'hombre' && slug === 'mujer') return true;
  if (slug !== 'rostros' || sectionId !== 'genero') return false;
  const labelWords = new Set(words(label));
  return gender === 'mujer'
    ? labelWords.has('hombre') || labelWords.has('varon')
    : labelWords.has('mujer') || labelWords.has('mujeres');
}

async function loadSearchIndex() {
  const res = await fetch('/data/search-index.json');
  if (!res.ok) throw new Error('No se pudo cargar el índice del catálogo');
  return res.json();
}

export function openIdeaInterpreter() {
  const description = h('textarea', { class: 'field__textarea', rows: 3, maxlength: 500, placeholder: 'Ejemplo: retrato de una mujer pelirroja en un bosque con niebla, estilo cinematográfico', 'aria-label': 'Describe tu idea en español' });
  const find = h('button', { type: 'button', class: 'btn btn--primary' }, 'Buscar opciones');
  const aiOptIn = h('input', { type: 'checkbox' });
  const aiToggle = h('label', { class: 'idea-interpreter__ai-toggle' }, aiOptIn, h('span', {}, h('b', {}, 'Afinar estas sugerencias con IA'), h('small', {}, 'Envía la idea y hasta 40 opciones al proveedor elegido; puede tener coste.')));
  const aiSettings = h('button', { type: 'button', class: 'btn btn--outline btn--sm', onClick: () => openAISettings() }, 'Configurar conexión IA');
  const status = h('p', { class: 'idea-interpreter__status', role: 'status', 'aria-live': 'polite' });
  const results = h('div', { class: 'idea-interpreter__results' });
  const apply = h('button', { type: 'button', class: 'btn btn--primary', disabled: true }, 'Añadir selección al prompt');
  const catalogLink = h('a', { class: 'btn btn--outline', href: '/generadores/' }, 'Abrir catálogo');
  const dialog = h('dialog', { class: 'start-dialog idea-interpreter', 'aria-labelledby': 'idea-interpreter-title' },
    h('div', { class: 'start-dialog__panel' },
      h('button', { type: 'button', class: 'icon-btn start-dialog__close', 'aria-label': 'Cerrar', onClick: () => dialog.close() }, '×'),
      h('p', { class: 'eyebrow' }, 'Asistente de ideas'), h('h2', { id: 'idea-interpreter-title' }, 'Describe la imagen que tienes en mente'),
      h('p', {}, 'El asistente buscará opciones del catálogo. Revisa las coincidencias y decide cuáles añadir.'), description,
      h('div', { class: 'idea-interpreter__ai' }, aiToggle, aiSettings),
      h('div', { class: 'idea-interpreter__actions' }, find, catalogLink), status, results, apply));

  let matches = [];
  find.addEventListener('click', async () => {
    const query = description.value.trim();
    if (!query) { status.textContent = 'Escribe una idea con algún detalle concreto, por ejemplo pelo, lugar o ambiente.'; return; }
    find.disabled = true; apply.disabled = true; status.textContent = 'Buscando coincidencias…'; clear(results); matches = [];
    try {
      const index = await loadSearchIndex();
      const { original, terms, corrected } = termsFor(query, new Set(index.o.flatMap(row => row[3].flatMap(words))));
      const gender = explicitGender(original);
      const focusedTerms = new Map();
      for (const focus of FOCUSES) {
        if (!focus.words.some(w => original.includes(w))) continue;
        const permitted = new Set(focus.sections);
        for (const word of original) {
          if (!focus.words.includes(word)) continue;
          const aliases = (ALIASES[word] || '').split(' ').filter(Boolean).map(fold);
          for (const term of [word, ...aliases]) focusedTerms.set(term, permitted);
        }
      }
      const scored = [];
      for (let d = 0; d < index.d.length; d++) {
        const [slug, short] = index.d[d];
        const meta = getCatalog().domains.find(x => x.slug === slug);
        if (!meta) continue;
        if (slug === 'poses') continue; // se respeta la galería de poses excluida del trabajo
        for (const [domainIndex, sectionId, title, labels] of index.o) {
          if (domainIndex !== d || /conjunto completo|galer[ií]a/i.test(title)) continue;
          for (const label of labels) {
            if (conflictsWithExplicitGender(gender, slug, sectionId, label)) continue;
            const folded = fold(label);
            const labelWords = new Set(words(label));
            const hits = terms.filter(term => labelWords.has(term) && (!focusedTerms.has(term) || focusedTerms.get(term).has(sectionId)));
            if (!hits.length) continue;
            const phrase = fold(query);
            const focus = FOCUSES.filter(f => f.words.some(w => original.includes(w)) && f.sections.includes(sectionId)).length;
            const fullPhrase = phrase.length > 5 && folded.includes(phrase) ? 8 : 0;
            const originalHits = original.filter(w => labelWords.has(w)).length;
            scored.push({ id: meta.id, slug, short, sectionId, title, label, matchKey: `${slug}::${sectionId}::${fold(label)}`, score: hits.length * 2 + originalHits * 2 + focus * 7 + fullPhrase });
          }
        }
      }
      const seen = new Set();
      const ranked = scored.sort((a, b) => b.score - a.score).filter(x => { const key = `${x.slug}/${x.sectionId}`; if (seen.has(key)) return false; seen.add(key); return true; });
      matches = ranked.slice(0, 14);
      if (!matches.length) { status.textContent = 'No encontré opciones claras. Prueba con palabras más concretas o abre el catálogo.'; return; }
      let statusBase = `He encontrado ${matches.length} coincidencias${terms.length > original.length ? ' con equivalencias' : ''}${corrected ? ' y una posible corrección ortográfica' : ''}. Marca las que encajan; el texto original no se añade al prompt.`;
      if (aiOptIn.checked) {
        status.textContent = 'Afinando coincidencias con IA…';
        try {
          const config = await getAIConfig();
          const providerId = config.providers.some(p => p.id === getAIProvider()) ? getAIProvider() : config.providers[0]?.id;
          if (!providerId) throw new Error('Configura tu proveedor y clave API en «Conectar una IA».');
          if (getAIProvider() !== providerId) setAIProvider(providerId);
          const candidates = ranked.slice(0, 40).map(m => ({ id: m.matchKey, label: m.label, section: m.title, domain: m.short }));
          const ai = await refineIdeaWithAI(query, candidates);
          const byKey = new Map(ranked.map(m => [m.matchKey, m]));
          const ordered = ai.selected_ids.map(id => byKey.get(id)).filter(Boolean);
          if (ordered.length) {
            matches = ordered;
            statusBase = `La IA afinó las coincidencias a ${matches.length} opciones del catálogo. Revisa y marca solo las que quieras añadir.`;
          } else {
            statusBase = 'La IA no encontró coincidencias claras entre las opciones recuperadas; revisa las coincidencias locales.';
          }
        } catch (err) {
          statusBase = `No se pudo afinar con IA: ${err.message} Se muestran las coincidencias locales.`;
        }
      }
      status.textContent = statusBase;
      matches.forEach((m, i) => {
        const checkbox = h('input', { type: 'checkbox', dataset: { match: String(i) }, onChange: () => { apply.disabled = !results.querySelector('input:checked'); } });
        const label = h('label', { class: 'idea-match' }, checkbox, h('span', {}, h('b', {}, m.label), h('small', {}, `${m.short} · ${m.title}`)));
        results.append(label);
      });
      apply.disabled = true;
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
      let skipped = 0;
      let adjusted = 0;
      let added = 0;
      let unchanged = 0;
      for (const item of chosen) {
        const domain = bySlug.get(item.id);
        const section = domain?._secById.get(item.sectionId);
        const option = section?.options.find(o => o.es === item.label);
        if (!section || !option) continue;
        if (store.isSelected(domain.id, section.id, option.id)) { unchanged++; continue; }
        const why = reasonBlocked(store.get().sel, domain.id, section.id, option.id, { adult: store.get().adult });
        if (why) { skipped++; continue; }
        added++;
        adjusted += store.toggleOption(domain.id, section, option.id, domain).length;
      }
      const notices = [`${added} añadidas`];
      if (skipped) notices.push(`${skipped} omitidas por incompatibilidad`);
      if (adjusted) notices.push(`${adjusted} selecciones relacionadas ajustadas`);
      if (unchanged) notices.push(`${unchanged} ya estaban seleccionadas`);
      const notice = notices.join(' · ');
      toast(notice, { tone: skipped ? 'warn' : 'ok' });
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
