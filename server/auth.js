import { createHash, createHmac, scrypt, timingSafeEqual, randomBytes } from 'node:crypto';
import { promisify } from 'node:util';

const deriveKey = promisify(scrypt);
export const COOKIE_NAME = '__Host-sahwa_session';
const REMEMBER_SECONDS = 30 * 24 * 60 * 60;
const SESSION_SECONDS = 24 * 60 * 60;

export function settings() {
  const email = process.env.SAHWA_ACCOUNT_EMAIL?.trim().toLowerCase();
  const passwordHash = process.env.SAHWA_PASSWORD_HASH;
  const secret = process.env.SAHWA_SESSION_SECRET;
  if (!email || !passwordHash || !secret || secret.length < 32) {
    throw new Error('Shared login is not configured');
  }
  return { email, passwordHash, secret };
}

function equal(left, right) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function accountVersion(config) {
  return createHash('sha256').update(`${config.email}\0${config.passwordHash}`).digest('base64url');
}

export async function verifyCredentials(email, password, config = settings()) {
  if (typeof email !== 'string' || typeof password !== 'string' || email.length > 254 || password.length > 256) return false;
  const [algorithm, cost, salt, expected] = config.passwordHash.split('$');
  if (algorithm !== 'scrypt' || cost !== '16384' || !/^[a-f0-9]{32}$/.test(salt || '') || !/^[a-f0-9]{64}$/.test(expected || '')) {
    throw new Error('Shared login hash is invalid');
  }
  const actual = await deriveKey(password, salt, 32, { N: 16384, r: 8, p: 1 });
  const validPassword = equal(actual.toString('hex'), expected);
  const validEmail = equal(email.trim().toLowerCase(), config.email);
  return validPassword && validEmail;
}

export function createSession(remember = true, config = settings(), now = Date.now()) {
  const lifetime = remember ? REMEMBER_SECONDS : SESSION_SECONDS;
  const payload = Buffer.from(JSON.stringify({
    exp: Math.floor(now / 1000) + lifetime,
    account: accountVersion(config),
    nonce: randomBytes(12).toString('base64url'),
  })).toString('base64url');
  const signature = createHmac('sha256', config.secret).update(payload).digest('base64url');
  return { token: `${payload}.${signature}`, lifetime };
}

export function hasSession(request, config = settings(), now = Date.now()) {
  const cookie = request.headers.get('cookie') || '';
  const token = cookie.split(';').map(part => part.trim()).find(part => part.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1);
  if (!token || token.length > 2048) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;
  const expected = createHmac('sha256', config.secret).update(payload).digest('base64url');
  if (!equal(signature, expected)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    const seconds = Math.floor(now / 1000);
    return Number.isSafeInteger(data.exp) && data.exp > seconds && data.exp <= seconds + REMEMBER_SECONDS
      && equal(data.account || '', accountVersion(config));
  } catch {
    return false;
  }
}

export function sessionCookie(token, lifetime, remember = true) {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax${remember ? `; Max-Age=${lifetime}` : ''}`;
}

export function expiredCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export const privateHeaders = {
  'Cache-Control': 'private, no-store, max-age=0',
  'Vary': 'Cookie',
  'X-Robots-Tag': 'noindex, nofollow',
};

export function sameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
