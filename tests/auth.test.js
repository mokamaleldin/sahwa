import test from "node:test";
import assert from "node:assert/strict";
import {
  hashPassword,
  verifyPassword,
  sessionCookie,
  expiredCookie,
  readSessionToken,
  sameOrigin,
  requireUser,
  tokenHash,
} from "../server/auth.js";
const request = (url = "https://sahwa.world/", headers = {}) =>
  new Request(url, { headers });
test("passwords are salted and verified without storing plaintext", async () => {
  const hash = await hashPassword("fixture-password-only");
  assert.ok(await verifyPassword("fixture-password-only", hash));
  assert.equal(await verifyPassword("wrong", hash), false);
  assert.notEqual(hash, await hashPassword("fixture-password-only"));
  assert.ok(!hash.includes("fixture-password-only"));
});
test("production cookies are host scoped, HttpOnly, Secure and SameSite", () => {
  const token = "a".repeat(43),
    req = request();
  const cookie = sessionCookie(token, 3600, true, req);
  assert.match(cookie, /^__Host-sahwa_session=/);
  assert.match(cookie, /HttpOnly; Secure; SameSite=Lax; Max-Age=3600/);
  assert.ok(!cookie.includes("Domain="));
  assert.equal(readSessionToken(request(undefined, { cookie })), token);
  assert.match(expiredCookie(req), /Max-Age=0/);
  assert.ok(!sessionCookie(token, 3600, false, req).includes("Max-Age"));
});
test("local development cookies work over localhost; remote cookies remain secure", () => {
  assert.match(
    sessionCookie("a".repeat(43), 1, true, request("http://localhost:3000/")),
    /^sahwa_session=/,
  );
  assert.match(
    sessionCookie("a".repeat(43), 1, true, request("http://example.com/")),
    /Secure/,
  );
});
test("sessions and administrator access fail closed for invalid or inactive users", async () => {
  process.env.SAHWA_SESSION_SECRET = "test-only-secret-at-least-32-characters";
  const token = "a".repeat(43),
    req = request(undefined, { cookie: `__Host-sahwa_session=${token}` });
  assert.notEqual(tokenHash(token), token);
  await assert.rejects(requireUser(request(), {}), (e) => e.status === 401);
  await assert.rejects(
    requireUser(req, {
      sessionUser: async () => ({
        status: "متوقف مؤقتًا",
        accessRole: "admin",
      }),
    }),
    (e) => e.status === 401,
  );
  await assert.rejects(
    requireUser(
      req,
      { sessionUser: async () => ({ status: "نشط", accessRole: "volunteer" }) },
      true,
    ),
    (e) => e.status === 403,
  );
});
test("mutations require an exact matching origin", () => {
  assert.ok(sameOrigin(request(undefined, { origin: "https://sahwa.world" })));
  assert.equal(sameOrigin(request()), false);
  assert.equal(
    sameOrigin(request(undefined, { origin: "https://attacker.invalid" })),
    false,
  );
});
