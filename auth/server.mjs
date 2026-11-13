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

async function readState() {
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
}

function parseCookies(request) {
  return Object.fromEntries((request.headers.cookie || '').split(';').map(part => {
    const index = part.indexOf('=');
    if (index < 0) return ['', ''];
    return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())];
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
    if (raw.length > 256_000) throw new Error('Request body too large');
  }
  return raw ? JSON.parse(raw) : {};
}

function requireSameOrigin(request) {
  if (request.headers.origin !== RP_ORIGIN) {
    const error = new Error('Invalid request origin');
    error.status = 403;
    throw error;
  }
}

async function passwordHash(password, salt) {
  return Buffer.from(await scrypt(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 })).toString('base64url');
}

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
}

async function currentSession(request) {
  const token = parseCookies(request)[SESSION_COOKIE];
  if (!token) return null;
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const state = await readState();
  const session = state.sessions.find(item => item.tokenHash === tokenHash && item.expiresAt > Date.now());
  return session || null;
}

function issueSession(response, state) {
  const token = randomBytes(32).toString('base64url');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const expiresAt = Date.now() + SESSION_TTL_MS;
  state.sessions = state.sessions.filter(item => item.expiresAt > Date.now());
  state.sessions.push({ tokenHash, expiresAt, userId: USER_ID.toString('base64url') });
  setCookies(response, [
    sessionCookie(token),
    clearChallengeCookie('lumen_prompt_login_challenge'),
    clearChallengeCookie('lumen_prompt_register_challenge'),
  ]);
  return writeState(state);
}

function beginChallenge(response, challenge, purpose, metadata = {}) {
  const cookieName = purpose === 'login' ? 'lumen_prompt_login_challenge' : 'lumen_prompt_register_challenge';
  const key = randomBytes(24).toString('base64url');
  pending.set(key, { challenge, purpose, expiresAt: Date.now() + CHALLENGE_TTL_MS, ...metadata });
  for (const [id, item] of pending) if (item.expiresAt <= Date.now()) pending.delete(id);
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
    let matches = false;
    if (state.account?.passwordHash && username === state.account.username.toLowerCase() && password.length <= 1024) {
      const actual = Buffer.from(await passwordHash(password, state.account.passwordSalt));
      const expected = Buffer.from(state.account.passwordHash);
      matches = actual.length === expected.length && timingSafeEqual(actual, expected);
    }
    if (!matches) {
      recordLoginFailure(ip);
      return json(response, 401, { error: 'Usuario o contraseña incorrectos.' });
    }
    failedLogins.delete(ip);
    await issueSession(response, state);
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
    const state = await readState();
    const actual = Buffer.from(await passwordHash(currentPassword, state.account.passwordSalt));
    const expected = Buffer.from(state.account.passwordHash);
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
      return json(response, 401, { error: 'La contraseña actual no es correcta.' });
    }
    state.account.passwordSalt = randomBytes(16).toString('base64url');
    state.account.passwordHash = await passwordHash(newPassword, state.account.passwordSalt);
    const token = parseCookies(request)[SESSION_COOKIE];
    const currentHash = token ? createHash('sha256').update(token).digest('hex') : '';
    state.sessions = state.sessions.filter(item => item.tokenHash === currentHash && item.expiresAt > Date.now());
    await writeState(state);
    return json(response, 200, { updated: true });
  }

  if (url.pathname === '/prompt/auth/logout' && request.method === 'POST') {
    requireSameOrigin(request);
    const token = parseCookies(request)[SESSION_COOKIE];
    const state = await readState();
    if (token) {
      const tokenHash = createHash('sha256').update(token).digest('hex');
      state.sessions = state.sessions.filter(item => item.tokenHash !== tokenHash);
      await writeState(state);
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
    const stored = state.credentials.find(item => item.id === body.id);
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
    stored.counter = verification.authenticationInfo.newCounter;
    await issueSession(response, state);
    return json(response, 200, { verified: true });
  }

  if (url.pathname === '/prompt/auth/register/options' && request.method === 'POST') {
    requireSameOrigin(request);
    await readJson(request);
    const state = await readState();
    if (!await currentSession(request)) return json(response, 401, { error: 'Inicia sesión para añadir este dispositivo.' });
    const options = await generateRegistrationOptions({
      rpName: 'Lumen Vitae',
      rpID: RP_ID,
      userID: USER_ID,
      userName: USER_NAME,
      userDisplayName: 'Lumen Vitae',
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
    const state = await readState();
    const savedCredential = {
      id: credential.id,
      publicKey: Buffer.from(credential.publicKey).toString('base64url'),
      counter: credential.counter,
      transports: body.response?.transports || [],
      createdAt: new Date().toISOString(),
    };
    if (!state.credentials.some(item => item.id === credential.id)) {
      state.credentials.push(savedCredential);
    }
    await issueSession(response, state);
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
  console.info(`Cuenta inicial Lumen Vitae creada. Usuario: ${USER_NAME} · Contraseña temporal: ${initialPassword} · Cámbiala en /prompt/enroll.`);
}

createServer((request, response) => {
  handle(request, response).catch(error => {
    const status = Number.isInteger(error.status) ? error.status : 500;
    if (status >= 500) console.error(error);
    json(response, status, { error: status >= 500 ? 'Error interno del servicio de acceso.' : error.message });
  });
}).listen(PORT, HOST, () => {
  console.log(`Lumen Vitae passkey auth listening on http://${HOST}:${PORT}`);
});
