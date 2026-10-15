import { get, put, del, BlobPreconditionFailedError } from '@vercel/blob';
import { TeamError, applyPersonChange } from './team-data.js';

const DIRECTORY = 'team/v1/volunteers.json';
const PHOTO_PREFIX = 'team/v1/photos/';
const EMPTY = { schemaVersion: 1, volunteers: [] };

export function storageConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

function requireStorage() {
  if (!storageConfigured()) throw new TeamError('دليل المتطوعين جاهز، ويحتاج تفعيل الحفظ المشترك قبل إضافة البيانات.', 503, 'STORAGE_NOT_CONFIGURED');
}

export function createTeamStore(blob = { get, put, del }) {
  async function readDirectory() {
    requireStorage();
    const result = await blob.get(DIRECTORY, { access: 'private', useCache: false });
    if (!result) return { document: structuredClone(EMPTY), etag: null };
    const document = await new Response(result.stream).json();
    if (document.schemaVersion !== 1 || !Array.isArray(document.volunteers)) throw new Error('Invalid team document');
    return { document, etag: result.blob.etag };
  }

  async function mutate(change) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const { document, etag } = await readDirectory();
      const old = document.volunteers.find(person => person.id === change.id);
      const updated = applyPersonChange(document, change);
      try {
        await blob.put(DIRECTORY, JSON.stringify(updated), {
          access: 'private', addRandomSuffix: false, contentType: 'application/json',
          allowOverwrite: Boolean(etag), ...(etag ? { ifMatch: etag } : {}),
        });
        return { person: updated.volunteers.find(person => person.id === change.id) ?? null, previousPhotoId: old?.photoId };
      } catch (error) {
        // Retry only storage races. The next read checks the edited person's revision again.
        if (error instanceof BlobPreconditionFailedError) continue;
        // A simultaneous first create has no ETag yet. Retry only if the file
        // appeared since our read; never hide an unavailable/forbidden store.
        if (!etag) {
          const latest = await readDirectory();
          if (latest.etag) {
            const existing = latest.document.volunteers.find(person => person.id === change.id);
            if (existing && change.action === 'create') return { person: existing, previousPhotoId: undefined };
            continue;
          }
        }
        throw error;
      }
    }
    throw new TeamError('هناك تعديلات أخرى الآن. حدّث القائمة وحاول مجددًا.', 409, 'CONFLICT');
  }

  return {
    readDirectory, mutate,
    async savePhoto(id, photo) {
      requireStorage();
      await blob.put(PHOTO_PREFIX + id, photo.bytes, { access: 'private', addRandomSuffix: false, contentType: photo.contentType });
    },
    async readPhoto(id) {
      requireStorage();
      return blob.get(PHOTO_PREFIX + id, { access: 'private', useCache: false });
    },
    async deletePhoto(id) {
      if (id) await blob.del(PHOTO_PREFIX + id);
    },
  };
}
