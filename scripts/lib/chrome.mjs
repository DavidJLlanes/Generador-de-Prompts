/**
 * Controlador mínimo de Chrome/Edge por el protocolo de depuración (CDP), sin dependencias.
 * Solo se usa en las pruebas de navegador (`npm run test:e2e`).
 * Busca el navegador en las rutas habituales o en la variable de entorno CHROME_PATH.
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const CANDIDATES = {
  win32: ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'],
  darwin: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', '/Applications/Chromium.app/Contents/MacOS/Chromium'],
  linux: ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/microsoft-edge'],
};

export function findChrome() {
  if (process.env.CHROME_PATH) return existsSync(process.env.CHROME_PATH) ? process.env.CHROME_PATH : null;
  return (CANDIDATES[process.platform] || []).find(existsSync) || null;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

/** Arranca un navegador sin cabeza y devuelve su API de control. */
export async function launch({ width = 1440, height = 1000 } = {}) {
  const exe = findChrome();
  if (!exe) throw new Error('No se encontró Chrome ni Edge. Instálalo o define CHROME_PATH con la ruta del ejecutable.');
  const dir = mkdtempSync(path.join(tmpdir(), 'lv-chrome-'));
  const proc = spawn(exe, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${dir}`, '--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--no-first-run', `--window-size=${width},${height}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });

  const port = await new Promise((resolve, reject) => {
    let buf = '';
    const t = setTimeout(() => reject(new Error('Chrome no arrancó a tiempo')), 15000);
    proc.stderr.on('data', d => { buf += d; const m = /DevTools listening on ws:\/\/[\d.]+:(\d+)\//.exec(buf); if (m) { clearTimeout(t); resolve(+m[1]); } });
    proc.on('exit', code => { clearTimeout(t); reject(new Error('Chrome terminó antes de tiempo (código ' + code + ')')); });
  });

  let target;
  for (let i = 0; i < 50 && !target; i++) {
    try { target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t => t.type === 'page'); } catch { /* aún no */ }
    if (!target) await sleep(100);
  }
  if (!target) throw new Error('No se encontró la pestaña de Chrome');

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

  let id = 0;
  const pending = new Map(), listeners = [], logs = [];
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(m.error.message)) : res(m.result); return; }
    if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type)) logs.push(`[console.${m.params.type}] ${m.params.args.map(a => a.value ?? a.description ?? '').join(' ')}`);
    if (m.method === 'Runtime.exceptionThrown') logs.push(`[exception] ${m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text}`);
    if (m.method === 'Network.responseReceived' && m.params.response.status >= 400) logs.push(`[http ${m.params.response.status}] ${m.params.response.url}`);
    if (m.method === 'Network.loadingFailed' && !m.params.canceled) logs.push(`[net-fail] ${m.params.errorText}`);
    listeners.forEach(l => l(m));
  };
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });

  const api = {
    logs, send, sleep,
    /** Navega y espera a la carga completa (y un margen para que el JS monte la interfaz). */
    async goto(url, settle = 700) {
      const loaded = new Promise(r => { const l = m => { if (m.method === 'Page.loadEventFired') { listeners.splice(listeners.indexOf(l), 1); r(); } }; listeners.push(l); });
      await send('Page.navigate', { url });
      await Promise.race([loaded, sleep(15000)]);
      await sleep(settle);
    },
    /** Ejecuta código en la página (admite await) y devuelve el valor de `return`. */
    async eval(expr) {
      const r = await send('Runtime.evaluate', { expression: `(async()=>{ ${expr} })()`, awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
      return r.result.value;
    },
    async waitFor(cond, timeout = 8000, label = cond) {
      const t0 = Date.now();
      while (Date.now() - t0 < timeout) { if (await api.eval(`return !!(${cond})`)) return true; await sleep(100); }
      throw new Error('tiempo agotado esperando: ' + label);
    },
    async viewport(w, h) { await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 700 }); await sleep(250); },
    async shot(file, { type = 'png' } = {}) {
      const { data } = await send('Page.captureScreenshot', { format: type, ...(type === 'webp' ? { quality: 86 } : {}) });
      writeFileSync(file, Buffer.from(data, 'base64'));
    },
    clearLogs: () => { logs.length = 0; },
    async close() {
      try { await send('Browser.close'); } catch { /* ya cerrado */ }
      try { ws.close(); } catch { /* ya cerrado */ }
      proc.kill();
      await sleep(200);
      try { rmSync(dir, { recursive: true, force: true }); } catch { /* el perfil puede seguir bloqueado en Windows */ }
    },
  };
  return api;
}
