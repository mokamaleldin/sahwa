# مساحة فريق صحوة

Routes: `/team`, `/team/volunteers`, `/team/files`. Login opens `/team`. The existing `/studio` editor is preserved and links back to the portal.

## Navigation and sessions

`SiteLayout` owns one shared header and footer. `SessionProvider` shares a deduplicated session client across public pages, Login, and the private area. Navigation uses React Router, including entering/leaving Studio. A confirmed session is reused while navigating; visibility/focus rechecks are throttled, cross-tab changes trigger revalidation, and an outage preserves an already confirmed state. Server cookies and endpoint authorization remain authoritative. No password or session token is stored in browser storage; the storage event contains only a change timestamp.

Studio is displayed at `/studio` inside the shared layout. Its unchanged editor runs in a same-origin private frame served by `/api/studio?embed=1`, with the legacy header/footer hidden. The frame stays mounted after its first visit until logout, retaining the canvas, inputs, and in-progress edits while visiting another page. Its size follows the document; native image-editor dialogs temporarily fill the browser viewport, and desktop preview follows outer-page scrolling. Frame messages validate both origin and source. Embedded content requires the same server session and permits framing only by the same origin. A failed load offers explicit retry instead of an endless spinner.

The logout control lives in the shared team navigation below the main header, including Studio. The main header itself has no logout button.

## Temporary visibility

The volunteer directory and public library are currently hidden using `src/config/features.ts`. Their implementations, data, and APIs remain in source. Their old page routes redirect to `/team` and `/` respectively, and the team portal currently shows Files and Studio. To restore either section, enable its flag. When restoring the library, also restore its Studio navigation link and sitemap entry.

## Google Drive

`src/data/teamFiles.ts` contains the three supplied folder links. Each card opens Drive in another tab. Files stay on Drive; its own sharing and upload permissions continue to apply. Add an entry to this file to add another card. No Drive account access, file migration, or permission changes are performed by the site.

## Shared volunteer directory

The directory uses a **private Vercel Blob store**, accessed only through authenticated `/api/team` handlers. Volunteer records and photos are never committed to git, added to the public build, or stored in browser localStorage. The existing HttpOnly login cookie protects every read, photo, and write. Mutations also require a same-origin request.

### One-time production setup

1. In the existing Vercel **sahwa** project, open **Storage → Create Database → Blob**.
2. Create a store called **sahwa-team-private**, with **Private** access (Frankfurt is a suitable region). Keep it on the existing account/plan; no paid integration is required by the code.
3. Connect it to the **sahwa** project's **Production** environment. Vercel should supply `BLOB_READ_WRITE_TOKEN`, or `BLOB_STORE_ID` with the project's Vercel OIDC identity. Keep these server-only: never use a `VITE_` prefix.
4. Redeploy the production project so the function receives the new environment configuration.
5. Sign in, open `/team/volunteers`, add a test person, reload from a second session, then remove the test record. Check that `/api/team` and its photo URLs return 401 while logged out.

Before a store is connected, the portal, three Drive folders, and Studio work. The directory explicitly says shared storage needs activation and disables saving; it never simulates successful persistence. An authentication/storage outage is shown as an error and must not be mistaken for an empty directory.

### Data and concurrent edits

- `team/v1/volunteers.json`: versioned directory document, up to 2,000 people in this initial small-team implementation.
- `team/v1/photos/<uuid>.<extension>`: optional private, resized portraits. The browser reduces uploads to a maximum 400px edge; the server checks raster format and a 160KiB limit.
- Reads bypass Blob's CDN cache (`useCache: false`) so another device sees the latest writes.
- Directory writes use ETag conditional writes (`ifMatch`) and retry storage races. A per-person revision rejects stale edits with 409 instead of overwriting somebody else's work. Concurrent changes to different people merge.
- A fresh directory is created with overwrite disabled, so simultaneous first additions are retried safely.
- Replaced/deleted photo cleanup is best effort after a committed directory change. Confirmed rejected writes remove the newly uploaded photo when possible. An ambiguous transport failure retains it because a committed record may already reference it; refresh before retrying. A failed cleanup can leave an orphaned private photo.
- The shared team account gives every signed-in holder the same read/edit access. Individual permissions or audit attribution would need individual accounts later.

The academic status and participation status are independent fields. Custom university names and custom roles are supported, and existing custom values appear in filters.

For larger usage, migrate the directory adapter to a relational database; the authenticated HTTP interface and UI can stay the same. Blob is intentionally a small-team starting point, not a general management platform.

## Checks

`npm run test:team`, `npm run test:auth`, `npm run test:library`, `npx tsc --noEmit -p tsconfig.app.json`, `npm run build`.
