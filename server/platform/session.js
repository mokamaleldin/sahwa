import { randomBytes, randomInt } from "node:crypto";
import {
  accountVersion,
  hashPassword,
  readSessionToken,
  sessionCookie,
  settings,
  sharedUser,
  tokenHash,
} from "../auth.js";
import { TeamError } from "../team-data.js";
import { sectorForGender } from "../../shared/platform-roles.js";
import { buildPermissions, canAny, ADMIN_PERMISSIONS, isGlobalAdmin } from "./access.js";

const REMEMBER_SECONDS = 30 * 24 * 60 * 60;
const SESSION_SECONDS = 24 * 60 * 60;
export const TEMPORARY_DAYS = 7;
export const USERNAME = /^[a-z0-9][a-z0-9._-]{2,39}$/;

function sharedConfigured() {
  try {
    settings();
    return true;
  } catch {
    return false;
  }
}

export async function actorFromRow(row, store) {
  const [assignments, grants] = await Promise.all([store.assignmentsOf(row.id), store.grantsOf(row.id)]);
  const actor = {
    kind: "account",
    id: row.id,
    volunteerId: row.id,
    accountId: row.accountId,
    username: row.username,
    fullName: row.fullName,
    university: row.university,
    gender: row.gender,
    sector: sectorForGender(row.gender),
    membershipLevel: row.membershipLevel,
    status: row.status,
    isTest: row.isTest,
    mustChangePassword: row.mustChangePassword,
    assignments: assignments.map((a) => ({ id: a.id, roleId: a.roleId, university: a.university, sector: a.sector })),
    grants,
  };
  actor.permissions = buildPermissions(actor);
  return actor;
}

function sharedActor() {
  const user = sharedUser();
  const actor = {
    kind: "shared",
    id: "sahwa",
    volunteerId: null,
    username: null,
    fullName: "حساب صحوة المشترك",
    university: user.university,
    sector: null,
    membershipLevel: null,
    status: null,
    isTest: false,
    mustChangePassword: false,
    assignments: [],
    grants: [],
  };
  actor.permissions = buildPermissions(actor);
  return actor;
}

// Resolves the signed-in person from the session cookie, checking account
// status, session version, archive state and the test-account guard on every
// request.
export async function currentActor(request, { teamStore, platformStore }) {
  const token = readSessionToken(request);
  if (!token) return null;
  const hash = tokenHash(token);
  if (sharedConfigured() && (await teamStore.hasSharedSession(hash, accountVersion()))) return sharedActor();
  if (!platformStore) return null;
  const row = await platformStore.sessionAccount(hash);
  if (!row || row.accountStatus !== "active" || row.archivedAt) return null;
  return actorFromRow(row, platformStore);
}

export async function requireActor(request, stores, { allowPasswordChange = false } = {}) {
  const actor = await currentActor(request, stores);
  if (!actor) throw new TeamError("سجّل الدخول للوصول إلى مساحة الفريق.", 401, "UNAUTHORIZED");
  if (actor.mustChangePassword && !allowPasswordChange)
    throw new TeamError("غيّر كلمة المرور المؤقتة أولًا.", 403, "PASSWORD_CHANGE_REQUIRED");
  return actor;
}

export function forbidden(message = "لا تملك صلاحية لهذا الإجراء.") {
  return new TeamError(message, 403, "FORBIDDEN");
}

export async function createAccountSession(accountId, remember, request, store) {
  const lifetime = remember ? REMEMBER_SECONDS : SESSION_SECONDS;
  const token = randomBytes(32).toString("base64url");
  await store.saveAccountSession(tokenHash(token), accountId, new Date(Date.now() + lifetime * 1000).toISOString());
  return sessionCookie(token, lifetime, remember, request);
}

// Readable one-time activation secret, unique per call. Never stored in
// plain text; only its scrypt hash is saved.
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
export function temporaryPassword() {
  const pick = (n) => Array.from({ length: n }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
  return `${pick(4)}-${pick(4)}-${pick(4)}`;
}
export async function temporaryCredential() {
  const password = temporaryPassword();
  return { password, hash: await hashPassword(password), expiresAt: new Date(Date.now() + TEMPORARY_DAYS * 86400000).toISOString() };
}

export function validateNewPassword(password, username = "") {
  if (typeof password !== "string" || password.length < 8 || password.length > 128)
    throw new TeamError("كلمة المرور يجب أن تكون من 8 إلى 128 حرفًا.");
  if (username && password.toLowerCase().includes(username.toLowerCase()))
    throw new TeamError("لا تستخدم اسم المستخدم داخل كلمة المرور.");
  if (/^(.)\1+$/.test(password) || ["password", "password123", "12345678", "1234567890"].includes(password.toLowerCase()))
    throw new TeamError("اختر كلمة مرور أقوى.");
}

export function navFor(actor) {
  const has = (permission) => canAny(actor, permission);
  const admin = ADMIN_PERMISSIONS.some(has);
  return {
    dashboard: actor.kind === "account",
    community: has("community.view"),
    workspace: true,
    directory: has("directory.view") && actor.kind === "account",
    guide: has("guide.view"),
    forms: has("forms.submit") || has("forms.review"),
    profile: actor.kind === "account" && has("profile.edit"),
    achievements: actor.kind === "account",
    admin,
    globalAdmin: isGlobalAdmin(actor),
  };
}

export function sessionUser(actor) {
  return {
    id: actor.id,
    fullName: actor.fullName,
    email: actor.kind === "shared" ? sharedUser().email : "",
    username: actor.username,
    kind: actor.kind,
    accessRole: navFor(actor).admin ? "admin" : "volunteer",
    university: actor.university,
    isTest: actor.isTest,
    mustChangePassword: actor.mustChangePassword,
    nav: navFor(actor),
  };
}
