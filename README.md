# صحوة

The public Sahwa website and Sahwa Studio share this repository and the existing Vercel project.

- `/`: public homepage.
- `/universities`: university pages.
- `/social`: university groups, social links, and contact information.
- `/login`: shared team login.
- `/studio`: authenticated poster editor with the three existing templates.

The old contact page and its components have been removed. Existing `/contact` links redirect to `/social`.

## Development and validation

```sh
npm ci
npm run dev
npm run build
npm run test:auth
npm run test:studio
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

Google Drive, the library, and volunteer registration are outside this change.

## Poster typography and portrait matting

Title baselines are computed from the actual font's ink bounds and a visible gap, within each original Photoshop title frame. Native shaping, safe optional kashida, the existing fonts, and the two-line limit are preserved. Regression tests rasterize Arabic headings with and without diacritics and check the resulting pixels, including the reported `في مصر / الرئيس` overlap.

Portrait removal runs MODNet FP32 through ONNX Runtime Web 1.23.2 in a module worker on the user's device. The model is pinned to Xenova/modnet revision `7aaa8a27c987ae9452a60443a7afeb6b2a52843a`, verified with SHA-256 `07c308cf0fc7e6e8b2065a12ed7fc07e1de8febb7dc7839d7b7f15dd66584df9`, and cached locally when available. First use downloads the 25.9 MB model and the WASM runtime; photographs are never uploaded. Inference uses a 1024-pixel longest edge, with memory-error fallbacks to 768/512, aspect-preserving padding, and continuous alpha rather than a hard segmentation threshold. Output retains up to a 2048-pixel longest edge.

A two-pass foreground/background color estimator reduces contamination from the old background without squaring alpha. The edge editor offers erase, restore, eight-step undo, zoom, and contrasting backgrounds. Saving re-estimates foreground colors from the original photo and the edited mask. Automatic matting cannot guarantee an exact result on every photograph; ambiguous hair, hands, and clothing can be corrected with the brush. Previously saved cutouts can be processed again from their retained original file.

Licenses are included under `public/studio-assets/licenses/`: MODNet models/code are Apache-2.0; ONNX Runtime and the BiRefNet reference foreground-color algorithm are MIT. References: [MODNet](https://github.com/ZHKKKe/MODNet), [pinned ONNX model](https://huggingface.co/Xenova/modnet/tree/7aaa8a27c987ae9452a60443a7afeb6b2a52843a), [ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/), and [foreground estimation](https://github.com/ZhengPeng7/BiRefNet/blob/main/image_proc.py). Sahwa's JavaScript adaptation adds browser memory bounds and separable running-sum filters.
