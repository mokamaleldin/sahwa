import { randomUUID } from 'node:crypto';
import { hasSession, privateHeaders, sameOrigin } from './auth.js';
import { PHOTO_ID, UUID, TeamError, validatePerson, parsePhoto } from './team-data.js';
import { storageConfigured } from './team-store.js';

const MAX_BODY = 240 * 1024;
const json = (data, status = 200) => Response.json(data, { status, headers: privateHeaders });

async function readInput(request) {
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new TeamError('طلب غير صالح.', 415);
  if (Number(request.headers.get('content-length')) > MAX_BODY) throw new TeamError('حجم الطلب كبير.', 413);
  const raw = await request.text();
  if (Buffer.byteLength(raw) > MAX_BODY) throw new TeamError('حجم الطلب كبير.', 413);
  try {
    const input = JSON.parse(raw);
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error();
    return input;
  } catch { throw new TeamError('بيانات الطلب غير صالحة.'); }
}

export function createTeamHandler(store) {
  return async function handle(request) {
    let newPhotoId;
    let committed = false;
    try {
      if (!hasSession(request)) return json({ error: 'سجّل الدخول للوصول إلى مساحة الفريق.', code: 'UNAUTHORIZED' }, 401);
      const method = request.method;
      const url = new URL(request.url);
      if (method === 'GET') {
        const photoId = url.searchParams.get('photo');
        if (photoId !== null) {
          if (!PHOTO_ID.test(photoId)) throw new TeamError('الصورة غير موجودة.', 404);
          const result = await store.readPhoto(photoId);
          if (!result) throw new TeamError('الصورة غير موجودة.', 404);
          return new Response(result.stream, { headers: { ...privateHeaders, 'Content-Type': result.blob.contentType, 'X-Content-Type-Options': 'nosniff' } });
        }
        if (!storageConfigured()) return json({ volunteers: [], storageReady: false });
        const { document } = await store.readDirectory();
        return json({ volunteers: document.volunteers, storageReady: true });
      }
      if (!['POST', 'PUT', 'DELETE'].includes(method)) return json({ error: 'طريقة طلب غير متاحة.' }, 405);
      if (!sameOrigin(request)) return json({ error: 'أعد تحميل الصفحة وحاول مجددًا.' }, 403);
      const input = await readInput(request);
      if (!storageConfigured()) throw new TeamError('يجب تفعيل الحفظ المشترك أولًا.', 503, 'STORAGE_NOT_CONFIGURED');
      const creating = method === 'POST';
      if (!creating && (!UUID.test(input.id || '') || !Number.isSafeInteger(input.revision) || input.revision < 1)) throw new TeamError('راجع السجل ثم حاول مرة أخرى.');
      const person = method === 'DELETE' ? undefined : validatePerson(input.person);
      const photo = method === 'DELETE' ? undefined : parsePhoto(input.photo);
      let photoId;
      if (photo === null) photoId = null;
      else if (photo) {
        newPhotoId = `${randomUUID()}.${photo.extension}`;
        await store.savePhoto(newPhotoId, photo);
        photoId = newPhotoId;
      }
      const result = await store.mutate({
        action: creating ? 'create' : method === 'DELETE' ? 'delete' : 'update',
        id: creating ? randomUUID() : input.id, revision: input.revision, person, photoId, now: new Date().toISOString(),
      });
      committed = true;
      if (result.previousPhotoId && (method === 'DELETE' || photoId !== undefined) && result.previousPhotoId !== photoId) {
        try { await store.deletePhoto(result.previousPhotoId); } catch { console.error('Team photo cleanup unavailable'); }
      }
      return json({ person: result.person }, creating ? 201 : 200);
    } catch (error) {
      if (newPhotoId && !committed) {
        try { await store.deletePhoto(newPhotoId); } catch { console.error('Team photo cleanup unavailable'); }
      }
      if (error instanceof TeamError) return json({ error: error.message, code: error.code }, error.status);
      console.error('Team data request could not complete');
      return json({ error: 'تعذر الاتصال ببيانات الفريق. حاول مجددًا بعد قليل.', code: 'UNAVAILABLE' }, 503);
    }
  };
}
