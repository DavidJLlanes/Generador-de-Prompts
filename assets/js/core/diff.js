/** Diferencia por palabras entre dos textos (LCS). Pura y sin DOM, para comparar variantes de un prompt. */
const MAX_WORDS = 1500;

/**
 * @returns {{t: string, k: 'same'|'del'|'add'}[]}  secuencia de trozos; las palabras llevan su espacio final
 */
export function wordDiff(a, b) {
  const x = String(a).split(/(?<=\s)/), y = String(b).split(/(?<=\s)/);
  if (x.length > MAX_WORDS || y.length > MAX_WORDS) return [{ t: a, k: 'del' }, { t: b, k: 'add' }];
  const norm = s => s.trim();
  const n = x.length, m = y.length;
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) {
    dp[i][j] = norm(x[i]) === norm(y[j]) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  }
  const out = [];
  const push = (t, k) => { const last = out[out.length - 1]; if (last && last.k === k) last.t += t; else out.push({ t, k }); };
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (norm(x[i]) === norm(y[j])) { push(y[j], 'same'); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) push(x[i++], 'del');
    else push(y[j++], 'add');
  }
  while (i < n) push(x[i++], 'del');
  while (j < m) push(y[j++], 'add');
  return out;
}
