import {
  createHmac,
  scrypt,
  timingSafeEqual,
  randomBytes,
} from "node:crypto";
import { promisify } from "node:util";

const deriveKey = promisify(scrypt);
export const COOKIE_NAME = "__Host-sahwa_session";
const LOCAL_COOKIE = "sahwa_session";
const REMEMBER_SECONDS = 30 * 24 * 60 * 60;
const SESSION_SECONDS = 24 * 60 * 60;
export const privateHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  Vary: "Cookie",
  "X-Robots-Tag": "noindex, nofollow",
};
export function sessionSecret() {
  const secret = process.env.SAHWA_SESSION_SECRET;
  if (!secret || secret.length < 32)
    throw new Error("Session configuration unavailable");
  return secret;
}
function equal(a, b) {
  const left = Buffer.from(a),
    right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const key = await deriveKey(password, salt, 32, { N: 16384, r: 8, p: 1 });
  return `scrypt$16384$${salt}$${key.toString("hex")}`;
}
export async function verifyPassword(password, hash) {
  const [algorithm, cost, salt, expected] = String(hash || "").split("$");
  if (
    typeof password !== "string" ||
    password.length > 256 ||
    algorithm !== "scrypt" ||
    cost !== "16384" ||
    !/^[a-f0-9]{32}$/.test(salt || "") ||
    !/^[a-f0-9]{64}$/.test(expected || "")
  )
    return false;
  const actual = await deriveKey(password, salt, 32, { N: 16384, r: 8, p: 1 });
  return equal(actual.toString("hex"), expected);
}
export function tokenHash(token, secret = sessionSecret()) {
  return createHmac("sha256", secret).update(token).digest("hex");
}
function local(request) {
  const url = new URL(request.url);
  return (
    url.protocol === "http:" &&
    ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
  );
}
export function readSessionToken(request) {
  const name = local(request) ? LOCAL_COOKIE : COOKIE_NAME;
  const token = (request.headers.get("cookie") || "")
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(`${name}=`))
    ?.slice(name.length + 1);
  return token && /^[A-Za-z0-9_-]{43}$/.test(token) ? token : null;
}
export function sessionCookie(token, lifetime, remember, request) {
  return `${local(request) ? LOCAL_COOKIE : COOKIE_NAME}=${token}; Path=/; HttpOnly;${local(request) ? "" : " Secure;"} SameSite=Lax${remember ? `; Max-Age=${lifetime}` : ""}`;
}
export function expiredCookie(request) {
  return sessionCookie("", 0, true, request);
}
export function sameOrigin(request) {
  try {
    return (
      Boolean(request.headers.get("origin")) &&
      new URL(request.headers.get("origin")).origin ===
        new URL(request.url).origin
    );
  } catch {
    return false;
  }
}
