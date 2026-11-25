/** Datos del importador de prompts (data/import-index.json): una entrada por opción con su texto en inglés. */
export function buildImportIndexData(domains) {
  const sections = [];
  const options = [];
  domains.forEach((d, di) => {
    d.sections.forEach(s => {
      if (s.polarity === 'negative') return; // lo negativo no se importa a la selección
      const si = sections.push([di, s.id, s.mode === 'single' ? 1 : 0]) - 1;
      for (const o of s.options) options.push(o.rich && o.rich !== o.en ? [si, o.id, o.en, o.rich] : [si, o.id, o.en]);
    });
  });
  return { d: domains.map(d => d.id), l: domains.map(d => d.lead || ''), s: sections, o: options };
}
