import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { BlobError, BlobPreconditionFailedError } from '@vercel/blob';
import { COOKIE_NAME, createSession } from '../server/auth.js';
import { createTeamStore } from '../server/team-store.js';
import { createTeamHandler } from '../server/team-api.js';
import { validatePerson, parsePhoto } from '../server/team-data.js';
import { PERSON_STATUSES, filterVolunteers } from '../shared/team-options.js';

const keys = ['SAHWA_ACCOUNT_EMAIL', 'SAHWA_PASSWORD_HASH', 'SAHWA_SESSION_SECRET', 'BLOB_STORE_ID', 'BLOB_READ_WRITE_TOKEN'];
const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
before(() => {
  process.env.SAHWA_ACCOUNT_EMAIL = 'fixture@example.com';
  process.env.SAHWA_PASSWORD_HASH = 'fixture-only-hash';
  process.env.SAHWA_SESSION_SECRET = 'fixture-only-secret-of-more-than-32-characters';
  process.env.BLOB_STORE_ID = 'fixture-private-store';
});
after(() => { for (const key of keys) { if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key]; } });

function person(overrides = {}) {
  return { fullName: 'شخص تجريبي للاختبار', gender: 'شاب', university: 'استنيا', major: 'تخصص تجريبي', studyYear: 'الثالثة', studyStatus: 'طالب', workArea: 'إعلام', workScope: 'عام / مركزي', role: 'عضو', joinedAt: '2026-10-15', phone: '+90 555 000 1234', skills: 'التصميم', status: PERSON_STATUSES[0], ...overrides };
}

function memoryBlob() {
  const files = new Map();
  let revision = 0;
  return {
    files,
    async get(path, options) {
      assert.equal(options.access, 'private'); assert.equal(options.useCache, false);
      const file = files.get(path);
      if (!file) return null;
      return { statusCode: 200, stream: new Response(file.body).body, blob: { etag: file.etag, contentType: file.contentType } };
    },
    async put(path, body, options) {
      assert.equal(options.access, 'private'); assert.equal(options.addRandomSuffix, false);
      const current = files.get(path);
      if (options.ifMatch && options.ifMatch !== current?.etag) throw new BlobPreconditionFailedError();
      if (current && !options.allowOverwrite) throw new BlobError('This pathname already exists');
      const etag = `"revision-${++revision}"`;
      files.set(path, { body, contentType: options.contentType, etag });
      return { etag };
    },
    async del(path) { files.delete(path); },
  };
}

function request(method = 'GET', input, options = {}) {
  const token = createSession().token;
  return new Request(`https://sahwa.world/api/team${options.query || ''}`, {
    method,
    headers: { Cookie: `${COOKIE_NAME}=${token}`, ...(method === 'GET' ? {} : { Origin: 'https://sahwa.world', 'Content-Type': 'application/json' }), ...options.headers },
    ...(input === undefined ? {} : { body: JSON.stringify(input) }),
  });
}

test('every directory read, photo and mutation requires the server login; writes reject cross-site origins', async () => {
  const blob = memoryBlob(), handle = createTeamHandler(createTeamStore(blob));
  for (const method of ['GET', 'POST', 'PUT', 'DELETE']) {
    const response = await handle(request(method, method === 'GET' ? undefined : {}, { headers: { Cookie: '' } }));
    assert.equal(response.status, 401);
    assert.match(response.headers.get('cache-control'), /no-store/);
    assert.match(response.headers.get('vary'), /Cookie/);
  }
  assert.equal((await handle(request('GET', undefined, { query: '?photo=abc.jpg', headers: { Cookie: '' } }))).status, 401);
  assert.equal((await handle(request('POST', { person: person() }, { headers: { Origin: 'https://other.example' } }))).status, 403);
  assert.equal(blob.files.size, 0);
});

test('central CRUD survives fresh handlers; student status stays independent of participation; stale edit/delete fails', async () => {
  const blob = memoryBlob();
  let handle = createTeamHandler(createTeamStore(blob));
  const created = await handle(request('POST', { person: person({ studyStatus: 'خريج', status: PERSON_STATUSES[0], university: 'جامعة أخرى', role: 'منسق خاص' }) }));
  assert.equal(created.status, 201);
  const { person: saved } = await created.json();
  assert.equal(saved.studyStatus, 'خريج'); assert.equal(saved.status, PERSON_STATUSES[0]);
  handle = createTeamHandler(createTeamStore(blob));
  const listed = await (await handle(request())).json();
  assert.equal(listed.volunteers[0].id, saved.id); assert.equal(listed.storageReady, true);
  const edited = await handle(request('PUT', { id: saved.id, revision: saved.revision, person: person({ status: PERSON_STATUSES[2] }) }));
  assert.equal(edited.status, 200);
  const { person: updated } = await edited.json();
  assert.equal(updated.revision, 2); assert.equal(updated.status, PERSON_STATUSES[2]);
  const stale = await handle(request('PUT', { id: saved.id, revision: 1, person: person({ fullName: 'نسخة قديمة' }) }));
  assert.equal(stale.status, 409); assert.equal((await stale.json()).code, 'CONFLICT');
  assert.equal((await handle(request('DELETE', { id: saved.id, revision: 1 }))).status, 409);
  assert.equal((await handle(request('DELETE', { id: saved.id, revision: 2 }))).status, 200);
  assert.equal((await (await handle(request())).json()).volunteers.length, 0);
});

test('concurrent initial additions and edits to different people merge; concurrent edits to one person conflict', async () => {
  const blob = memoryBlob();
  const first = createTeamStore(blob), second = createTeamStore(blob);
  const a = randomUUID(), b = randomUUID();
  const change = id => ({ action: 'create', id, person: person(), now: '2026-10-15T12:00:00.000Z' });
  await Promise.all([first.mutate(change(a)), second.mutate(change(b))]);
  assert.equal((await first.readDirectory()).document.volunteers.length, 2);
  await Promise.all([
    first.mutate({ ...change(a), action: 'update', revision: 1, person: person({ fullName: 'الاسم الأول' }) }),
    second.mutate({ ...change(b), action: 'update', revision: 1, person: person({ fullName: 'الاسم الثاني' }) }),
  ]);
  assert.deepEqual((await first.readDirectory()).document.volunteers.map(p => p.fullName).sort(), ['الاسم الأول', 'الاسم الثاني'].sort());
  const outcomes = await Promise.allSettled([
    first.mutate({ ...change(a), action: 'update', revision: 2, person: person({ role: 'مسؤول' }) }),
    second.mutate({ ...change(a), action: 'update', revision: 2, person: person({ role: 'نائب مسؤول' }) }),
  ]);
  assert.equal(outcomes.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal(outcomes.find(r => r.status === 'rejected').reason.status, 409);
});

test('unconfigured storage is explicit and never pretends a write succeeded; a storage failure is not an empty directory', async () => {
  const storeId = process.env.BLOB_STORE_ID, token = process.env.BLOB_READ_WRITE_TOKEN;
  delete process.env.BLOB_STORE_ID; delete process.env.BLOB_READ_WRITE_TOKEN;
  try {
    const handle = createTeamHandler(createTeamStore(memoryBlob()));
    assert.deepEqual(await (await handle(request())).json(), { volunteers: [], storageReady: false });
    const write = await handle(request('POST', { person: person() }));
    assert.equal(write.status, 503); assert.equal((await write.json()).code, 'STORAGE_NOT_CONFIGURED');
  } finally { process.env.BLOB_STORE_ID = storeId; if (token !== undefined) process.env.BLOB_READ_WRITE_TOKEN = token; }
  const broken = createTeamHandler(createTeamStore({ async get() { throw new Error('storage failure'); } }));
  const response = await broken(request());
  assert.equal(response.status, 503); assert.equal((await response.json()).volunteers, undefined);
});

test('private raster photos require login, reject SVG/path traversal, and are removed with the person', async () => {
  const blob = memoryBlob(), handle = createTeamHandler(createTeamStore(blob));
  const image = `data:image/png;base64,${Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0]).toString('base64')}`;
  const response = await handle(request('POST', { person: person(), photo: image }));
  const { person: saved } = await response.json();
  assert.equal(response.status, 201); assert.match(saved.photoId, /\.png$/);
  const photo = await handle(request('GET', undefined, { query: `?photo=${saved.photoId}` }));
  assert.equal(photo.status, 200); assert.equal(photo.headers.get('content-type'), 'image/png'); assert.match(photo.headers.get('cache-control'), /no-store/);
  await photo.arrayBuffer();
  for (const value of ['data:image/svg+xml;base64,PHN2Zz4=', 'data:image/png;base64,PHN2Zz4=']) assert.throws(() => parsePhoto(value));
  assert.equal((await handle(request('GET', undefined, { query: '?photo=../../auth.js' }))).status, 404);
  await handle(request('DELETE', { id: saved.id, revision: saved.revision }));
  assert.equal((await handle(request('GET', undefined, { query: `?photo=${saved.photoId}` }))).status, 404);
});

test('failed stale updates clean up newly uploaded photos without changing the current record', async () => {
  const blob = memoryBlob(), handle = createTeamHandler(createTeamStore(blob));
  const saved = (await (await handle(request('POST', { person: person() }))).json()).person;
  const image = `data:image/jpeg;base64,${Buffer.from([255, 216, 255, 0]).toString('base64')}`;
  const response = await handle(request('PUT', { id: saved.id, revision: 99, person: person(), photo: image }));
  assert.equal(response.status, 409); assert.equal(blob.files.size, 1);
});

test('invalid dates, oversized bodies, unsupported status and malformed requests are rejected', async () => {
  for (const overrides of [{ fullName: '' }, { status: 'invalid' }, { joinedAt: '2026-02-30' }, { phone: 'abc' }, { skills: 'x'.repeat(1001) }]) assert.throws(() => validatePerson(person(overrides)));
  const handle = createTeamHandler(createTeamStore(memoryBlob()));
  assert.equal((await handle(request('POST', { person: person(), photo: 'x'.repeat(250000) }))).status, 413);
  assert.equal((await handle(request('POST', null))).status, 400);
  assert.equal((await handle(request('POST', {}, { headers: { 'Content-Type': 'text/plain' } }))).status, 415);
  assert.equal((await handle(request('PUT', { id: '../x', revision: 1, person: person() }))).status, 400);
});

test('Arabic search and all six exact filters combine, including custom university and role', () => {
  const people = [person({ fullName: 'أَحْمَد عَلِي', university: 'جامعة خاصة', role: 'منسق', studyStatus: 'خريج', status: PERSON_STATUSES[2], gender: 'شاب' }), person({ fullName: 'اسم آخر', gender: 'بنت' })];
  const filters = { query: 'احمد علي', university: 'جامعة خاصة', workArea: 'إعلام', role: 'منسق', studyStatus: 'خريج', status: PERSON_STATUSES[2], gender: 'شاب' };
  assert.equal(filterVolunteers(people, filters).length, 1);
  assert.equal(filterVolunteers(people, { ...filters, studyStatus: 'طالب' }).length, 0);
  assert.equal(filterVolunteers(people, { ...filters, query: 'تصميم' }).length, 1);
});
