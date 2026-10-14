import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { scryptSync } from 'node:crypto';
import { GET as authStatus, POST as login, DELETE as logout } from '../api/auth.js';
import { GET as studio } from '../api/studio.js';
import { COOKIE_NAME, createSession, hasSession, settings } from '../server/auth.js';

const email = 'team@example.com';
const password = 'fixture-only-password';
const salt = '0123456789abcdef0123456789abcdef';
const envKeys = ['SAHWA_ACCOUNT_EMAIL', 'SAHWA_PASSWORD_HASH', 'SAHWA_SESSION_SECRET'];
const previous = Object.fromEntries(envKeys.map(key => [key, process.env[key]]));

before(() => {
  process.env.SAHWA_ACCOUNT_EMAIL = email;
  process.env.SAHWA_PASSWORD_HASH = `scrypt$16384$${salt}$${scryptSync(password, salt, 32).toString('hex')}`;
  process.env.SAHWA_SESSION_SECRET = 'fixture-only-signing-secret-32-characters-minimum';
});

after(() => {
  for (const key of envKeys) {
    if (previous[key] === undefined) delete process.env[key];
    else process.env[key] = previous[key];
  }
});

function request(path = '/api/auth', options = {}) {
  return new Request(`https://sahwa.world${path}`, options);
}

function credentials(input = { email, password }, origin = 'https://sahwa.world') {
  return request('/api/auth', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify(input),
  });
}

function cookieRequest(token, path = '/api/auth') {
  return request(path, { headers: { Cookie: `${COOKIE_NAME}=${token}` } });
}

test('direct Studio access requires a session and is never publicly cached', async () => {
  const result = await studio(request('/studio'));
  assert.equal(result.status, 303);
  assert.equal(result.headers.get('location'), '/login');
  assert.match(result.headers.get('cache-control'), /no-store/);
});

test('invalid credentials receive the same generic error and no cookie', async () => {
  const wrongPassword = await login(credentials({ email, password: 'wrong' }));
  const wrongEmail = await login(credentials({ email: 'someone@example.com', password }));
  assert.equal(wrongPassword.status, 401);
  assert.equal(wrongEmail.status, 401);
  assert.deepEqual(await wrongPassword.json(), await wrongEmail.json());
  assert.equal(wrongPassword.headers.get('set-cookie'), null);
});

test('valid login issues a protected cookie remembered for 30 days', async () => {
  const result = await login(credentials({ email: email.toUpperCase(), password, remember: true }));
  assert.equal(result.status, 200);
  const cookie = result.headers.get('set-cookie');
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /SameSite=Lax/);
  assert.match(cookie, /Max-Age=2592000/);
  const token = cookie.split(';')[0].slice(COOKIE_NAME.length + 1);
  assert.deepEqual(await authStatus(cookieRequest(token)).json(), { authenticated: true });
  assert.doesNotMatch(cookie, new RegExp(password));
});

test('disabling remember-me creates a session cookie', async () => {
  const result = await login(credentials({ email, password, remember: false }));
  assert.equal(result.status, 200);
  assert.doesNotMatch(result.headers.get('set-cookie'), /Max-Age/);
});

test('signed session opens the complete existing editor with rebased assets', async () => {
  const { token } = createSession();
  const result = await studio(cookieRequest(token, '/studio'));
  assert.equal(result.status, 200);
  const html = await result.text();
  assert.match(html, /id="template-options"/);
  assert.match(html, /id="logout-button"/);
  assert.match(html, /\/studio-assets\/template-assets\.js/);
  assert.match(html, /3240 × 3900/);
  assert.match(result.headers.get('cache-control'), /no-store/);
  assert.doesNotMatch(html, new RegExp(password));
});

test('tampered and expired cookies cannot open the editor', async () => {
  const { token } = createSession();
  const parts = token.split('.');
  const tampered = `${parts[0]}.${parts[1][0] === 'a' ? 'b' : 'a'}${parts[1].slice(1)}`;
  const expired = createSession(false, settings(), Date.now() - 25 * 60 * 60 * 1000).token;
  for (const invalid of [tampered, expired, token + '.extra', 'bad-cookie']) {
    assert.equal(hasSession(cookieRequest(invalid)), false);
    assert.equal((await studio(cookieRequest(invalid, '/studio'))).status, 303);
  }
});

test('changing the account password configuration invalidates existing sessions', () => {
  const config = settings();
  const { token } = createSession(true, config);
  assert.equal(hasSession(cookieRequest(token), { ...config, passwordHash: config.passwordHash + 'changed' }), false);
});

test('cross-site login and logout are rejected', async () => {
  assert.equal((await login(credentials({ email, password }, 'https://other.example'))).status, 403);
  assert.equal(logout(request('/api/auth', { method: 'DELETE', headers: { Origin: 'https://other.example' } })).status, 403);
});

test('logout expires the current browser cookie', async () => {
  const result = logout(request('/api/auth', { method: 'DELETE', headers: { Origin: 'https://sahwa.world' } }));
  assert.equal(result.status, 200);
  assert.match(result.headers.get('set-cookie'), /Max-Age=0/);
  assert.deepEqual(await result.json(), { authenticated: false });
});

test('malformed and oversized login requests fail without issuing sessions', async () => {
  assert.equal((await login(credentials(null))).status, 400);
  assert.equal((await login(credentials({ email, password: 'x'.repeat(2500) }))).status, 413);
  assert.equal((await login(request('/api/auth', { method: 'POST', headers: { Origin: 'https://sahwa.world' }, body: 'not-json' }))).status, 415);
});
