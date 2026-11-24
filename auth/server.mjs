import { createServer } from 'node:http';
import { randomBytes, createHash, timingSafeEqual, scrypt as scryptCallback } from 'node:crypto';
import { mkdir, rename, writeFile, chmod, readFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';

const HOST = process.env.AUTH_HOST || '127.0.0.1';
const PORT = Number(process.env.AUTH_PORT || 4011);
const RP_ID = process.env.RP_ID || 'djl.com.es';
const RP_ORIGIN = process.env.RP_ORIGIN || `https://${RP_ID}`;
const DATA_DIR = process.env.DATA_DIR || '/var/lib/lumen-prompt';
const STATE_FILE = path.join(DATA_DIR, 'auth-state.json');
const SESSION_COOKIE = 'lumen_prompt_session';
const CHALLENGE_TTL_MS = 5 * 60_000;
const SESSION_TTL_MS = 30 * 24 * 60 * 60_000;
const USER_ID = Buffer.from('lumen-vitae-owner-account-v1');
const USER_NAME = 'david';
const scrypt = promisify(scryptCallback);
const pending = new Map();
const failedLogins = new Map();

await mkdir(DATA_DIR, { recursive: true, mode: 0o700 });

let stateCache = null;
let stateQueue = Promise.resolve();

/** Estado en memoria: este proceso es el único que escribe el archivo, así que no hace falta leerlo en cada petición. */
async function readState() {
  if (!stateCache) stateCache = await loadStateFile();
  return structuredClone(stateCache);
}

/** Lee-modifica-escribe en serie: dos peticiones simultáneas (login y logout) no se pisan los cambios. */
function mutateState(fn) {
  const run = stateQueue.then(async () => {
    const state = await readState();
    const result = await fn(state);
    await writeState(state);
    return result;
  });
  stateQueue = run.catch(() => {});
  return run;
}

async function loadStateFile() {
  try {
    const value = JSON.parse(await readFile(STATE_FILE, 'utf8'));
    return {
      account: value.account || null,
      credentials: Array.isArray(value.credentials) ? value.credentials : [],
      sessions: Array.isArray(value.sessions) ? value.sessions : [],
    };
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return { account: null, credentials: [], sessions: [] };
  }
}

async function writeState(state) {
  const temporary = `${STATE_FILE}.${process.pid}.${randomBytes(5).toString('hex')}.tmp`;
  await writeFile(temporary, JSON.stringify(state), { mode: 0o600 });
  await chmod(temporary, 0o600);
  await rename(temporary, STATE_FILE);
  stateCache = structuredClone(state);
}

function parseCookies(request) {
  return Object.fromEntries((request.headers.cookie || '').split(';').map(part => {
    const index = part.indexOf('=');
    if (index < 0) return ['', ''];
    let value = part.slice(index + 1).trim();
    try { value = decodeURIComponent(value); } catch { /* cookie mal codificada: se usa tal cual */ }
    return [part.slice(0, index).trim(), value];
  }).filter(([name]) => name));
}

function setCookies(response, cookies) {
  response.setHeader('Set-Cookie', cookies);
}

function sessionCookie(token, maxAge = Math.floor(SESSION_TTL_MS / 1000)) {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/prompt/; Max-Age=${maxAge}; Secure; HttpOnly; SameSite=Lax`;
}

function clearChallengeCookie(name) {
  return `${name}=; Path=/prompt/auth/; Max-Age=0; Secure; HttpOnly; SameSite=Strict`;
}

function json(response, status, value, extraHeaders = {}) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...extraHeaders,
  });
  response.end(JSON.stringify(value));
}

function noContent(response, status = 204) {
  response.writeHead(status, { 'Cache-Control': 'no-store' });
  response.end();
}

async function readJson(request) {
  let raw = '';
  for await (const chunk of request) {
    raw += chunk;
    if (raw.length > 256_000) { const error = new Error('Solicitud demasiado grande.'); error.status = 413; throw error; }
  }
  if (!raw) return {};
  let value;
  try { value = JSON.parse(raw); } catch { value = null; }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    const error = new Error('Solicitud no válida.');
    error.status = 400;
    throw error;
  }
  return value;
}

function requireSameOrigin(request) {
  if (request.headers.origin !== RP_ORIGIN) {
    const error = new Error('Invalid request origin');
    error.status = 403;
    throw error;
  }
}

// scrypt usa ~32 MB por cálculo: se limita cuántos corren a la vez para que una ráfaga de intentos no agote la memoria.
const MAX_HASHES = 2;
let activeHashes = 0;
const hashWaiters = [];
async function withHashSlot(fn) {
  if (activeHashes >= MAX_HASHES) await new Promise(resolve => hashWaiters.push(resolve));
  activeHashes++;
  try { return await fn(); } finally { activeHashes--; hashWaiters.shift()?.(); }
}

function passwordHash(password, salt) {
  return withHashSlot(() => rawPasswordHash(password, salt));
}

async function rawPasswordHash(password, salt) {
  return Buffer.from(await scrypt(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 })).toString('base64url');
}

const MAX_TRACKED_IPS = 10_000;
const MAX_PENDING = 1_000;

function loginBlocked(ip) {
  const record = failedLogins.get(ip);
  if (!record) return 0;
  if (record.blockedUntil > Date.now()) return record.blockedUntil - Date.now();
  if (record.startedAt + 15 * 60_000 < Date.now()) failedLogins.delete(ip);
  return 0;
}

function recordLoginFailure(ip) {
  const now = Date.now();
  let record = failedLogins.get(ip);
  if (!record || record.startedAt + 15 * 60_000 < now) record = { count: 0, startedAt: now, blockedUntil: 0 };
  record.count++;
  if (record.count >= 5) record.blockedUntil = now + 10 * 60_000;
  failedLogins.set(ip, record);
  if (failedLogins.size > MAX_TRACKED_IPS) {
    for (const [key, item] of failedLogins) if (item.blockedUntil < now && item.startedAt + 15 * 60_000 < now) failedLogins.delete(key);
    while (failedLogins.size > MAX_TRACKED_IPS) failedLogins.delete(failedLogins.keys().next().value);
  }
}

/** Intentos en curso por IP: cuentan como fallos hasta que terminan, así una ráfaga en paralelo no esquiva el límite. */
const inFlight = new Map();
function beginAttempt(ip) {
  const n = (inFlight.get(ip) || 0) + 1;
  inFlight.set(ip, n);
  const record = failedLogins.get(ip);
  return (record?.count || 0) + n - 1 >= 5;
}
function endAttempt(ip) {
  const n = (inFlight.get(ip) || 1) - 1;
  if (n > 0) inFlight.set(ip, n); else inFlight.delete(ip);
}

async function currentSession(request) {
  const token = parseCookies(request)[SESSION_COOKIE];
  if (!token) return null;
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const state = await readState();
  const session = state.sessions.find(item => item.tokenHash === tokenHash && item.expiresAt > Date.now());
  return session || null;
}

function issueSession(response, mutate = () => {}) {
  const token = randomBytes(32).toString('base64url');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const expiresAt = Date.now() + SESSION_TTL_MS;
  setCookies(response, [
    sessionCookie(token),
    clearChallengeCookie('lumen_prompt_login_challenge'),
    clearChallengeCookie('lumen_prompt_register_challenge'),
  ]);
  return mutateState(state => {
    mutate(state);
    state.sessions = state.sessions.filter(item => item.expiresAt > Date.now());
    state.sessions.push({ tokenHash, expiresAt, userId: USER_ID.toString('base64url') });
  });
}

function beginChallenge(response, challenge, purpose, metadata = {}) {
  const cookieName = purpose === 'login' ? 'lumen_prompt_login_challenge' : 'lumen_prompt_register_challenge';
  const key = randomBytes(24).toString('base64url');
  pending.set(key, { challenge, purpose, expiresAt: Date.now() + CHALLENGE_TTL_MS, ...metadata });
  for (const [id, item] of pending) if (item.expiresAt <= Date.now()) pending.delete(id);
  while (pending.size > MAX_PENDING) pending.delete(pending.keys().next().value);
  setCookies(response, [`${cookieName}=${key}; Path=/prompt/auth/; Max-Age=300; Secure; HttpOnly; SameSite=Strict`]);
}

function takeChallenge(request, purpose) {
  const name = purpose === 'login' ? 'lumen_prompt_login_challenge' : 'lumen_prompt_register_challenge';
  const key = parseCookies(request)[name];
  const item = key ? pending.get(key) : null;
  if (!item || item.purpose !== purpose || item.expiresAt <= Date.now()) {
    const error = new Error('La solicitud ha caducado. Vuelve a intentarlo.');
    error.status = 400;
    throw error;
  }
  pending.delete(key);
  return item;
}

async function handle(request, response) {
  const url = new URL(request.url, RP_ORIGIN);

  if (url.pathname === '/auth/check' && request.method === 'GET') {
    return noContent(response, await currentSession(request) ? 204 : 401);
  }

  if (url.pathname === '/prompt/auth/status' && request.method === 'GET') {
    const state = await readState();
    return json(response, 200, {
      authenticated: Boolean(await currentSession(request)),
      hasPasskey: state.credentials.length > 0,
      hasAccount: Boolean(state.account?.passwordHash),
      username: state.account?.username || null,
    });
  }

  if (url.pathname === '/prompt/auth/register/status' && request.method === 'GET') {
    const state = await readState();
    return json(response, 200, {
      hasPasskey: state.credentials.length > 0,
      authenticated: Boolean(await currentSession(request)),
      hasAccount: Boolean(state.account?.passwordHash),
      username: state.account?.username || null,
    });
  }

  if (url.pathname === '/prompt/auth/login/password' && request.method === 'POST') {
    requireSameOrigin(request);
    const ip = request.headers['x-real-ip'] || request.socket.remoteAddress || 'unknown';
    const wait = loginBlocked(ip);
    if (wait) return json(response, 429, { error: `Demasiados intentos. Prueba de nuevo en ${Math.ceil(wait / 60_000)} min.` });
    const body = await readJson(request);
    const username = typeof body.username === 'string' ? body.username.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const state = await readState();
    if (beginAttempt(ip)) { endAttempt(ip); return json(response, 429, { error: 'Demasiados intentos a la vez. Espera unos minutos.' }); }
    let matches = false;
    try {
      // Se calcula el hash aunque el usuario no exista: misma duración en ambos casos.
      const salt = state.account?.passwordSalt || 'sin-cuenta';
      const actual = Buffer.from(await passwordHash(password.slice(0, 1024), salt));
      const expected = Buffer.from(state.account?.passwordHash || '');
      matches = Boolean(state.account?.passwordHash) && username === state.account.username.toLowerCase() && password.length <= 1024
        && actual.length === expected.length && timingSafeEqual(actual, expected);
    } finally { endAttempt(ip); }
    if (!matches) {
      recordLoginFailure(ip);
      return json(response, 401, { error: 'Usuario o contraseña incorrectos.' });
    }
    failedLogins.delete(ip);
    await issueSession(response);
    return json(response, 200, { authenticated: true, username: state.account.username });
  }

  if (url.pathname === '/prompt/auth/register/password' && request.method === 'POST') {
    requireSameOrigin(request);
    if (!await currentSession(request)) return json(response, 401, { error: 'Inicia sesión para cambiar la contraseña.' });
    const body = await readJson(request);
    const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';
    if (newPassword.length < 8 || Buffer.byteLength(newPassword) > 1024) {
      return json(response, 400, { error: 'La nueva contraseña debe tener al menos 8 caracteres.' });
    }
    const ip = request.headers['x-real-ip'] || request.socket.remoteAddress || 'unknown';
    const wait = loginBlocked(ip);
    if (wait) return json(response, 429, { error: `Demasiados intentos. Prueba de nuevo en ${Math.ceil(wait / 60_000)} min.` });
    const state = await readState();
    const actual = Buffer.from(await passwordHash(currentPassword.slice(0, 1024), state.account.passwordSalt));
    const expected = Buffer.from(state.account.passwordHash);
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
      recordLoginFailure(ip);
      return json(response, 401, { error: 'La contraseña actual no es correcta.' });
    }
    const passwordSalt = randomBytes(16).toString('base64url');
    const newHash = await passwordHash(newPassword, passwordSalt);
    const token = parseCookies(request)[SESSION_COOKIE];
    const currentHash = token ? createHash('sha256').update(token).digest('hex') : '';
    await mutateState(next => {
      next.account.passwordSalt = passwordSalt;
      next.account.passwordHash = newHash;
      next.sessions = next.sessions.filter(item => item.tokenHash === currentHash && item.expiresAt > Date.now());
    });
    return json(response, 200, { updated: true });
  }

  if (url.pathname === '/prompt/auth/logout' && request.method === 'POST') {
    requireSameOrigin(request);
    const token = parseCookies(request)[SESSION_COOKIE];
    if (token) {
      const tokenHash = createHash('sha256').update(token).digest('hex');
      await mutateState(state => { state.sessions = state.sessions.filter(item => item.tokenHash !== tokenHash); });
    }
    setCookies(response, [`${SESSION_COOKIE}=; Path=/prompt/; Max-Age=0; Secure; HttpOnly; SameSite=Lax`]);
    return json(response, 200, { loggedOut: true });
  }

  if (url.pathname === '/prompt/auth/login/options' && request.method === 'GET') {
    const state = await readState();
    if (!state.credentials.length) return json(response, 409, { error: 'Aún no hay una passkey registrada.' });
    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      allowCredentials: state.credentials.map(credential => ({
        id: credential.id,
        type: 'public-key',
        transports: credential.transports,
      })),
      userVerification: 'required',
      timeout: 60_000,
    });
    beginChallenge(response, options.challenge, 'login');
    return json(response, 200, options);
  }

  if (url.pathname === '/prompt/auth/login/verify' && request.method === 'POST') {
    requireSameOrigin(request);
    const body = await readJson(request);
    const challenge = takeChallenge(request, 'login').challenge;
    const state = await readState();
    const stored = typeof body.id === 'string' ? state.credentials.find(item => item.id === body.id) : null;
    if (!stored) return json(response, 401, { error: 'Passkey no reconocida.' });

    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: challenge,
      expectedOrigin: RP_ORIGIN,
      expectedRPID: RP_ID,
      credential: {
        id: stored.id,
        publicKey: Buffer.from(stored.publicKey, 'base64url'),
        counter: stored.counter,
        transports: stored.transports,
      },
      requireUserVerification: true,
    });

    if (!verification.verified) return json(response, 401, { error: 'No se pudo verificar la passkey.' });
    const newCounter = verification.authenticationInfo.newCounter;
    await issueSession(response, next => {
      const item = next.credentials.find(c => c.id === stored.id);
      if (item) item.counter = newCounter;
    });
    return json(response, 200, { verified: true });
  }

  if (url.pathname === '/prompt/auth/register/options' && request.method === 'POST') {
    requireSameOrigin(request);
    await readJson(request);
    const state = await readState();
    if (!await currentSession(request)) return json(response, 401, { error: 'Inicia sesión para añadir este dispositivo.' });
    const options = await generateRegistrationOptions({
      rpName: 'Generador de Prompts',
      rpID: RP_ID,
      userID: USER_ID,
      userName: USER_NAME,
      userDisplayName: 'Generador de Prompts',
      attestationType: 'none',
      timeout: 60_000,
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'required',
      },
      supportedAlgorithmIDs: [-7, -257],
      excludeCredentials: state.credentials.map(credential => ({
        id: credential.id,
        type: 'public-key',
        transports: credential.transports,
      })),
    });
    beginChallenge(response, options.challenge, 'register');
    return json(response, 200, options);
  }

  if (url.pathname === '/prompt/auth/register/verify' && request.method === 'POST') {
    requireSameOrigin(request);
    const body = await readJson(request);
    const challengeState = takeChallenge(request, 'register');
    if (!await currentSession(request)) return json(response, 401, { error: 'Tu sesión caducó. Inicia sesión de nuevo.' });
    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: challengeState.challenge,
      expectedOrigin: RP_ORIGIN,
      expectedRPID: RP_ID,
      requireUserVerification: true,
    });
    if (!verification.verified || !verification.registrationInfo) {
      return json(response, 400, { error: 'No se pudo registrar la passkey.' });
    }

    const { credential } = verification.registrationInfo;
    const savedCredential = {
      id: credential.id,
      publicKey: Buffer.from(credential.publicKey).toString('base64url'),
      counter: credential.counter,
      transports: Array.isArray(body.response?.transports) ? body.response.transports.filter(t => typeof t === 'string').slice(0, 8) : [],
      createdAt: new Date().toISOString(),
    };
    await issueSession(response, next => {
      if (!next.credentials.some(item => item.id === credential.id)) next.credentials.push(savedCredential);
    });
    return json(response, 200, { verified: true });
  }

  return json(response, 404, { error: 'Not found' });
}

const initialState = await readState();
if (!initialState.account?.passwordHash) {
  const initialPassword = randomBytes(18).toString('base64url');
  const salt = randomBytes(16).toString('base64url');
  initialState.account = { username: USER_NAME, passwordSalt: salt, passwordHash: await passwordHash(initialPassword, salt) };
  await writeState(initialState);
  console.info(`Cuenta inicial Generador de Prompts creada. Usuario: ${USER_NAME} · Contraseña temporal: ${initialPassword} · Cámbiala en /prompt/enroll.`);
}

createServer((request, response) => {
  handle(request, response).catch(error => {
    const status = Number.isInteger(error.status) ? error.status : 500;
    if (status >= 500) console.error(error);
    json(response, status, { error: status >= 500 ? 'Error interno del servicio de acceso.' : error.message });
  });
}).listen(PORT, HOST, () => {
  console.log(`Generador de Prompts passkey auth listening on http://${HOST}:${PORT}`);
});
