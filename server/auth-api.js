import {
  currentUser,
  publicUser,
  verifyCredentials,
  sharedUser,
  createSession,
  expiredCookie,
  sameOrigin,
  readSessionToken,
  tokenHash,
} from "./auth.js";
import { json, readInput, errorResponse } from "./http.js";

export function createAuthHandler(store) {
  return async (request) => {
    try {
      if (request.method === "GET") {
        const user = await currentUser(request, store);
        return json({
          authenticated: Boolean(user),
          user: user ? publicUser(user) : null,
        });
      }
      if (request.method === "DELETE") {
        if (!sameOrigin(request))
          return json({ error: "أعد تحميل الصفحة وحاول مجددًا." }, 403);
        const token = readSessionToken(request);
        if (token) await store.deleteSession(tokenHash(token));
        return json({ authenticated: false, user: null }, 200, {
          "Set-Cookie": expiredCookie(request),
        });
      }
      if (request.method !== "POST")
        return json({ error: "طريقة طلب غير متاحة." }, 405);
      const input = await readInput(request, 2048);
      if (
        typeof input.email !== "string" ||
        input.email.length > 254 ||
        typeof input.password !== "string" ||
        input.password.length > 256
      )
        return json({ error: "راجع بيانات الدخول." }, 400);
      const email = input.email.trim().toLowerCase();
      const ip =
        request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
        "unknown";
      if (
        !(await store.consumeLoginLimit([
          tokenHash(`email:${email}`),
          tokenHash(`ip:${ip}`),
        ]))
      )
        return json({ error: "محاولات دخول كثيرة. حاول بعد 15 دقيقة." }, 429, {
          "Retry-After": "900",
        });
      if (!(await verifyCredentials(email, input.password)))
        return json(
          { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." },
          401,
        );
      const user = sharedUser();
      const cookie = await createSession(
        input.remember !== false,
        request,
        store,
      );
      // A new sign-in replaces this browser's previous session.
      const previous = readSessionToken(request);
      if (previous) await store.deleteSession(tokenHash(previous));
      return json({ authenticated: true, user: publicUser(user) }, 200, {
        "Set-Cookie": cookie,
      });
    } catch (error) {
      return errorResponse(error);
    }
  };
}
