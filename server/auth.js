import {
  createHash,
  createHmac,
  scrypt,
  timingSafeEqual,
  randomBytes,
} from "node:crypto";
import { promisify } from "node:util";
import { TeamError } from "./team-data.js";

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
export const publicUser = (user) => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  accessRole: user.accessRole,
  university: user.university,
});
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
export function settings() {
  const email = process.env.SAHWA_ACCOUNT_EMAIL?.trim().toLowerCase();
  const passwordHash = process.env.SAHWA_PASSWORD_HASH;
  if (!email || !passwordHash)
    throw new Error("Shared account configuration unavailable");
  return { email, passwordHash };
}
export const sharedUser = (config = settings()) => ({
  id: "sahwa",
  fullName: "فريق صحوة",
  email: config.email,
  accessRole: "admin",
  university: "عام / مركزي",
});
export const accountVersion = (config = settings()) =>
  createHash("sha256")
    .update(`${config.email}\0${config.passwordHash}`)
    .digest("hex");
export async function verifyCredentials(email, password, config = settings()) {
  const validPassword = await verifyPassword(password, config.passwordHash);
  return (
    validPassword &&
    typeof email === "string" &&
    equal(email.trim().toLowerCase(), config.email)
  );
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
export async function createSession(remember, request, store) {
  const lifetime = remember ? REMEMBER_SECONDS : SESSION_SECONDS;
  const token = randomBytes(32).toString("base64url");
  await store.saveSession(
    tokenHash(token),
    accountVersion(),
    new Date(Date.now() + lifetime * 1000).toISOString(),
  );
  return sessionCookie(token, lifetime, remember, request);
}
export async function currentUser(request, store) {
  const token = readSessionToken(request);
  if (!token) return null;
  const config = settings();
  return (await store.hasSharedSession(
    tokenHash(token),
    accountVersion(config),
  ))
    ? sharedUser(config)
    : null;
}
export async function requireUser(request, store, admin = false) {
  const user = await currentUser(request, store);
  if (!user)
    throw new TeamError(
      "سجّل الدخول للوصول إلى مساحة الفريق.",
      401,
      "UNAUTHORIZED",
    );
  if (admin && user.accessRole !== "admin")
    throw new TeamError("هذا القسم متاح للمسؤولين فقط.", 403, "FORBIDDEN");
  return user;
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
