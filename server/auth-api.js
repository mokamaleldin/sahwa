import { verifyPassword, expiredCookie, sameOrigin, readSessionToken, tokenHash } from "./auth.js";
import { json, readInput, errorResponse } from "./http.js";
import { currentActor, createAccountSession, sessionUser } from "./platform/session.js";

// Keeps timing similar when an account does not exist.
const DUMMY_HASH = "scrypt$16384$00000000000000000000000000000000$" + "0".repeat(64);
const IDENTIFIER = /^(?:[a-z0-9][a-z0-9._-]{2,39}|[^\s@]{1,64}@[^\s@]{1,190})$/;

// Every person signs in with their own account: e-mail or username, and the
// password set by the administrator (or by themselves later).
export function createAuthHandler(store, platformStore) {
  const stores = { teamStore: store, platformStore };
  return async (request) => {
    try {
      if (request.method === "GET") {
        const actor = await currentActor(request, stores);
        return json({ authenticated: Boolean(actor), user: actor ? sessionUser(actor) : null });
      }
      if (request.method === "DELETE") {
        if (!sameOrigin(request)) return json({ error: "أعد تحميل الصفحة وحاول مجددًا." }, 403);
        const token = readSessionToken(request);
        if (token && platformStore) await platformStore.deleteAccountSession(tokenHash(token));
        return json({ authenticated: false, user: null }, 200, { "Set-Cookie": expiredCookie(request) });
      }
      if (request.method !== "POST") return json({ error: "طريقة طلب غير متاحة." }, 405);
      const input = await readInput(request, 2048);
      const identifier = input.identifier ?? input.email;
      if (typeof identifier !== "string" || identifier.length > 254 || typeof input.password !== "string" || input.password.length > 256)
        return json({ error: "راجع بيانات الدخول." }, 400);
      const login = identifier.trim().toLowerCase();
      const ip = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      if (!(await store.consumeLoginLimit([tokenHash(`email:${login}`), tokenHash(`ip:${ip}`)])))
        return json({ error: "محاولات دخول كثيرة. حاول بعد 15 دقيقة." }, 429, { "Retry-After": "900" });
      const invalid = () => json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." }, 401);
      if (!platformStore || !IDENTIFIER.test(login)) return invalid();
      const account = await platformStore.accountForLogin(login);
      const valid = await verifyPassword(input.password, account?.passwordHash || DUMMY_HASH);
      if (!account || !valid || account.archivedAt) return invalid();
      if (account.accountStatus !== "active") return json({ error: "هذا الحساب موقوف. تواصل مع المسؤول المختص." }, 403);
      if (account.mustChangePassword && account.temporaryExpiresAt && new Date(account.temporaryExpiresAt) < new Date())
        return json({ error: "انتهت صلاحية كلمة المرور المؤقتة. اطلب من المسؤول إعادة ضبط الحساب." }, 401);
      const cookie = await createAccountSession(account.accountId, input.remember !== false, request, platformStore);
      const previous = readSessionToken(request);
      if (previous) await platformStore.deleteAccountSession(tokenHash(previous));
      const actor = await currentActor(new Request(request.url, { headers: { cookie: cookie.split(";")[0] } }), stores);
      return json({ authenticated: true, user: actor ? sessionUser(actor) : null }, 200, { "Set-Cookie": cookie });
    } catch (error) {
      return errorResponse(error);
    }
  };
}
