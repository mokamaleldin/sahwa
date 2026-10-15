# صحوة

The public Sahwa website and Sahwa Studio share this repository and the existing Vercel project.

- `/`: public homepage.
- `/universities`: university pages.
- `/social`: university groups, social links, and contact information.
- `/library`: public image catalogue and the physical library's location.
- `/login`: shared team login.
- `/studio`: authenticated poster editor with the three existing templates.

The old contact page and its components have been removed. Existing `/contact` links redirect to `/social`.

## Development and validation

```sh
npm ci
npm run dev
npm run build
npm run test:auth
npm run test:library
```

Vite serves the public React pages locally. `/api/auth` and `/studio` require the Vercel Node.js function runtime; plain Vite does not serve API functions.

## Shared login

Set these server-only environment variables in the existing Vercel project before deployment:

- `SAHWA_ACCOUNT_EMAIL`: the shared team email address.
- `SAHWA_PASSWORD_HASH`: `scrypt$16384$<32-character salt hex>$<64-character derived key hex>` using Node's `scrypt`, a 32-byte key, `N=16384`, `r=8`, and `p=1`.
- `SAHWA_SESSION_SECRET`: a random secret of at least 32 characters.

Never prefix these with `VITE_` or commit their values. No database or Google sign-in is used. The email is a login identifier and does not provide access to the email account.

The HTTP-only, Secure, SameSite cookie remembers login for 30 days by default. Unchecking “remember me” creates a browser-session cookie whose token expires after 24 hours. Logout clears the cookie on the current device. Changing the password hash or signing secret invalidates previously issued sessions. A shared account does not identify individual users or support individual access revocation. There is no custom persistent login rate limiter; the project uses the platform's default traffic protection.

## Studio

`studio/index.html` is served by `api/studio.js` only after session verification. Its assets are in `public/studio-assets/` and load only when the editor opens. They include the existing embedded fonts, original template elements, editor, portrait tools, and PNG exporter. Template assets are public and contain no account secrets; access control applies to the editor page.

The existing local draft keys and rendering code are preserved. Drafts from the separate Studio hostname stay in that browser origin and are not automatically copied to the main site's origin. PNG export defaults to 3240 × 3900 pixels.

## Library

The library is a public page within the main site. Each book card displays its supplied template
image; title, author, and category metadata power Arabic search, accessible labels, category filters,
and pagination. A book's presence means it belongs to the physical collection; there is no lending
status or reservation system. Register real artwork in `public/library/books.json` following
`public/library/books/README.md`. The manifest starts empty until actual book images are supplied.
The page includes the supplied opening artwork, address/map preview, and Google Maps directions.

Google Drive and volunteer registration are outside this change.
