import { palette } from '../color-words.js';

const ILLUSTRATION = /illustration|anime|manga|painting|watercolor|gouache|ink|comic|vector|3d|render|pixel|concept art|cartoon|drawing|sketch|paper|woodblock|print|porcelain/i;

function mediumOf(styleText) {
  if (/3d|render|porcelain/i.test(styleText)) return '3D render';
  if (/anime|manga/i.test(styleText)) return 'anime illustration';
  if (/watercolor/i.test(styleText)) return 'watercolor painting';
  if (/oil|painting/i.test(styleText)) return 'oil painting';
  if (/paper/i.test(styleText)) return 'layered paper-cut artwork';
  if (/print|woodblock/i.test(styleText)) return 'woodblock print';
  return 'digital illustration';
}

/**
 * JSON estructurado al estilo Ideogram, generalizado a cualquier combinación de dominios:
 * descripción general, estilo (luz, fotografía, paleta) y descomposición compositiva.
 */
export function formatIdeogram(c) {
  if (c.empty) return { id: 'ideogram', blocks: [], text: '' };
  const slot = id => c.parts.filter(p => p.slot === id).map(p => p.short);
  const photo = id => c.parts.filter(p => p.domain === 'photo' && p.section === id).map(p => p.short);
  const subject = slot('subject'), attrs = slot('attribute'), action = slot('action'), setting = slot('setting'), atmos = slot('atmosphere');

  const styleText = photo('style').join(' ');
  const isPhoto = !styleText || !ILLUSTRATION.test(styleText);
  const medium = isPhoto ? 'photograph' : mediumOf(styleText);
  const lead = c.lead || 'a scene';

  let hld = `A ${isPhoto ? (photo('quality')[0] || 'cinematic') + ' photograph' : medium} of ${lead}`;
  if (subject.length) hld += `, ${subject.slice(0, 3).join(', ')}`;
  if (action[0]) hld += `, ${action[0]}`;
  if (setting[0]) hld += `, set in ${setting[0]}`;
  hld += '.';

  const lighting = [...photo('lighting'), ...atmos.slice(0, 2)].join(', ') || 'soft natural lighting with gentle shadows';
  const aesthetics = [...new Set([...photo('quality'), ...photo('color-grading'), ...photo('finishing'), 'polished', 'professional'])].join(', ');
  const photoField = ['composition', 'perspective', 'lens', 'camera', 'depth-of-field'].flatMap(photo).join(', ') || '50mm lens, eye-level angle, natural depth of field';
  const allText = c.parts.map(p => p.short);
  const globalPalette = palette(allText, 4, 8, ['#111111', '#8A8A8A', '#F5F5F5', '#C9A227']);

  const style = isPhoto
    ? { aesthetics, lighting, photo: photoField, medium: 'photograph', color_palette: globalPalette }
    : { aesthetics, lighting, medium, art_style: `${photo('style').join(', ')}, detailed rendering, clean readable composition`, color_palette: globalPalette };

  const subjectDesc = [`${lead.charAt(0).toUpperCase() + lead.slice(1)} in the foreground`, ...subject, ...attrs].join(', ') + (action.length ? `; ${action.join(', ')}` : '') + '.';
  const elements = [{ type: 'obj', bbox: [120, 60, 880, 960], desc: subjectDesc, color_palette: palette([...subject, ...attrs], 3, 5, ['#2A2A2E', '#C7CBD1', '#F5F5F5']) }];
  if (atmos.length || photo('lighting').length) {
    elements.push({ type: 'obj', bbox: [0, 0, 1000, 1000], desc: `Ambient light and atmosphere filling the scene (${lighting}), adding depth, soft falloff and a cohesive mood wrapping around the subject.`, color_palette: palette([...atmos, ...photo('lighting'), ...photo('color-grading')], 3, 5, ['#2A2A2E', '#8A8A8A', '#F5F5F5']) });
  }

  const json = {
    high_level_description: hld,
    style_description: style,
    compositional_deconstruction: {
      background: setting.length ? setting.join(', ') : 'A clean neutral studio backdrop with a smooth gradient, soft even lighting, a subtle vignette and gentle separation around the subject.',
      elements,
    },
  };
  const text = JSON.stringify(json, null, 2);
  return { id: 'ideogram', blocks: [{ title: 'JSON para Ideogram', text }], text };
}
