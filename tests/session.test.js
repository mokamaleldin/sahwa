import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url), ts = require('typescript');
const target = path.resolve('tmp/session-tests/sessionClient.js');
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, ts.transpileModule(fs.readFileSync('src/lib/sessionClient.ts', 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext } }).outputText);
const { createSessionClient } = await import(pathToFileURL(target).href);
const data = authenticated => Response.json({ authenticated });
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };

test('all consumers share one initial request and route changes reuse the confirmed session', async () => {
  const waiting = deferred(); let calls = 0;
  const client = createSessionClient(async () => { calls++; return waiting.promise; });
  const one = client.refresh(), two = client.refresh(), three = client.refresh();
  assert.equal(calls, 1); assert.equal(client.getSnapshot().status, 'loading');
  waiting.resolve(data(true)); await Promise.all([one, two, three]);
  assert.equal(client.getSnapshot().status, 'authenticated');
  await client.refresh(); assert.equal(calls, 1);
});

test('server failures and malformed responses never masquerade as logout', async () => {
  let response = data(true);
  const client = createSessionClient(async () => response);
  await client.refresh();
  for (const failed of [Response.json({ error: 'غير متاح الآن' }, { status: 503 }), Response.json({ authenticated: 'false' }), new Response('not JSON')]) {
    response = failed; await client.refresh({ force: true });
    assert.equal(client.getSnapshot().status, 'authenticated'); assert.ok(client.getSnapshot().error);
  }
  response = data(false); await client.refresh({ force: true });
  assert.equal(client.getSnapshot().status, 'anonymous');
});

test('an initial outage offers retry rather than showing a false signed-out state', async () => {
  let fail = true;
  const client = createSessionClient(async () => { if (fail) throw new Error('Network unavailable'); return data(true); });
  await client.refresh(); assert.equal(client.getSnapshot().status, 'error');
  assert.match(client.getSnapshot().error, /تعذر الاتصال/);
  fail = false; await client.refresh({ force: true }); assert.equal(client.getSnapshot().status, 'authenticated');
});

test('a delayed pre-login check cannot undo a successful login', async () => {
  const waiting = deferred(); let notified = 0;
  const client = createSessionClient(async (_, options) => options.method === 'POST' ? data(true) : waiting.promise, () => notified++);
  const old = client.refresh();
  await client.signIn({ email: 'fixture@example.com', password: 'fixture-only', remember: true });
  waiting.resolve(data(false)); await old;
  assert.equal(client.getSnapshot().status, 'authenticated'); assert.equal(notified, 1);
  assert.deepEqual(Object.keys(client.getSnapshot()).sort(), ['error', 'status']);
});

test('a delayed pre-logout check cannot sign somebody back in', async () => {
  const waiting = deferred(); let first = true;
  const client = createSessionClient(async (_, options) => {
    if (options.method === 'DELETE') return data(false);
    if (first) { first = false; return data(true); }
    return waiting.promise;
  });
  await client.refresh(); const old = client.refresh({ force: true });
  await client.signOut(); waiting.resolve(data(true)); await old;
  assert.equal(client.getSnapshot().status, 'anonymous');
});

test('failed logout keeps the established session and remains retryable', async () => {
  let fail = true;
  const client = createSessionClient(async (_, options) => options.method === 'DELETE' ? fail ? Response.json({ error: 'تعذر الخروج' }, { status: 503 }) : data(false) : data(true));
  await client.refresh(); await assert.rejects(client.signOut(), /تعذر الخروج/);
  assert.equal(client.getSnapshot().status, 'authenticated');
  fail = false; await client.signOut(); assert.equal(client.getSnapshot().status, 'anonymous');
});
