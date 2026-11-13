import { createServer } from 'node:http';
import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, rename, writeFile, chmod, unlink } from 'node:fs/promises';
import path from 'node:path';
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
const BOOTSTRAP_TOKEN_FILE = path.join(DATA_DIR, 'bootstrap-token');
const SESSION_COOKIE = 'lumen_prompt_session';
const CHALLENGE_TTL_MS = 5 * 60_000;
const SESSION_TTL_MS = 24 * 60 * 60_000;
const USER_ID = Buffer.from('lumen-vitae-owner-account-v1');
const USER_NAME = 'david';
const pending = new Map();

await mkdir(DATA_DIR, { recursive: true, mode: 0o700 });

async function readState() {
  try {
    const value = JSON.parse(await readFile(STATE_FILE, 'utf8'));
    return {
      credentials: Array.isArray(value.credentials) ? value.credentials : [],
      sessions: Array.isArray(value.sessions) ? value.sessions : [],
    };
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return { credentials: [], sessions: [] };
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
    });
  }

  if (url.pathname === '/prompt/auth/register/status' && request.method === 'GET') {
    const state = await readState();
    return json(response, 200, {
      hasPasskey: state.credentials.length > 0,
      authenticated: Boolean(await currentSession(request)),
    });
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
    const body = await readJson(request);
    const state = await readState();
    let bootstrapTokenHash = null;
    const session = await currentSession(request);
    if (!session) {
      const supplied = typeof body.setupToken === 'string' ? body.setupToken.trim() : '';
      let expected = '';
      try { expected = (await readFile(BOOTSTRAP_TOKEN_FILE, 'utf8')).trim(); } catch {}
      const suppliedBytes = Buffer.from(supplied);
      const expectedBytes = Buffer.from(expected);
      if (!supplied || !expected || suppliedBytes.length !== expectedBytes.length
        || !timingSafeEqual(suppliedBytes, expectedBytes)) {
        return json(response, 401, { error: 'El código de activación no es válido.' });
      }
      bootstrapTokenHash = createHash('sha256').update(supplied).digest('hex');
    }
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
      excludeCredentials: bootstrapTokenHash ? [] : state.credentials.map(credential => ({
        id: credential.id,
        type: 'public-key',
        transports: credential.transports,
      })),
    });
    beginChallenge(response, options.challenge, 'register', { bootstrapTokenHash });
    return json(response, 200, options);
  }

  if (url.pathname === '/prompt/auth/register/verify' && request.method === 'POST') {
    requireSameOrigin(request);
    const body = await readJson(request);
    const challengeState = takeChallenge(request, 'register');
    const { setupToken = '', ...credentialResponse } = body;
    if (challengeState.bootstrapTokenHash) {
      let expected = '';
      try { expected = (await readFile(BOOTSTRAP_TOKEN_FILE, 'utf8')).trim(); } catch {}
      const suppliedHash = createHash('sha256').update(String(setupToken).trim()).digest('hex');
      const expectedHash = expected ? createHash('sha256').update(expected).digest('hex') : '';
      if (!expectedHash || suppliedHash.length !== expectedHash.length
        || !timingSafeEqual(Buffer.from(suppliedHash), Buffer.from(expectedHash))
        || suppliedHash !== challengeState.bootstrapTokenHash) {
        return json(response, 401, { error: 'El código de activación ha caducado. Vuelve a empezar.' });
      }
    } else if (!await currentSession(request)) {
      return json(response, 401, { error: 'Tu sesión caducó. Entra con tu passkey y vuelve a intentarlo.' });
    }
    const verification = await verifyRegistrationResponse({
      response: credentialResponse,
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
      transports: credentialResponse.response?.transports || [],
      createdAt: new Date().toISOString(),
    };
    if (challengeState.bootstrapTokenHash) {
      state.credentials = [savedCredential];
      state.sessions = [];
    } else if (!state.credentials.some(item => item.id === credential.id)) {
      state.credentials.push(savedCredential);
    }
    await issueSession(response, state);
    if (challengeState.bootstrapTokenHash) await unlink(BOOTSTRAP_TOKEN_FILE).catch(() => {});
    return json(response, 200, { verified: true });
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

  return json(response, 404, { error: 'Not found' });
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
