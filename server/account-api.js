import { hashPassword, verifyPassword, readSessionToken, tokenHash } from "./auth.js";
import { TeamError, date } from "./team-data.js";
import { json, readInput, errorResponse } from "./http.js";
import { requireActor, forbidden, validateNewPassword, createAccountSession } from "./platform/session.js";
import { RESERVED } from "./platform/usernames.js";
import { ageFromBirthDate } from "../shared/team-options.js";
import { can, canAny } from "./platform/access.js";
import { audienceVisible } from "./platform/service.js";
import { CENTRAL } from "../shared/platform-roles.js";

const HANDLE = /^[a-z0-9][a-z0-9._-]{2,29}$/;
const OPTIONAL_PUBLIC = ["university", "major", "work", "skills", "participation", "links", "roles"];
const DIRECTORY = ["major", "bio", "skills", "work"];

function clean(value, max, label) {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string" || value.length > max * 2 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) throw new TeamError(`راجع حقل ${label}.`);
  const trimmed = value.trim();
  if ([...trimmed].length > max) throw new TeamError(`${label} يجب ألا يتجاوز ${max} حرفًا.`);
  return trimmed;
}

function safeLink(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.toString() : null;
  } catch {
    return null;
  }
}

export function validateProfile(input) {
  const handle = clean(input.handle, 30, "اسم المستخدم للصفحة").toLowerCase();
  if (handle && (!HANDLE.test(handle) || RESERVED.has(handle) || handle.startsWith("test.")))
    throw new TeamError("اسم المستخدم للصفحة يكون من 3 إلى 30 حرفًا لاتينيًا أو أرقامًا أو (. _ -)، وغير محجوز.");
  const links = Array.isArray(input.links) ? input.links.slice(0, 6) : [];
  const parsedLinks = links.map((link) => {
    const label = clean(link?.label, 40, "اسم الرابط");
    const url = safeLink(String(link?.url || "").trim());
    if (!url) throw new TeamError("الروابط يجب أن تبدأ بـ https://");
    return { label, url };
  });
  const pick = (list, allowed) => (Array.isArray(list) ? [...new Set(list.filter((f) => allowed.includes(f)))] : []);
  return {
    handle: handle || null,
    displayName: clean(input.displayName, 80, "الاسم المعروض"),
    bio: clean(input.bio, 300, "النبذة"),
    work: clean(input.work, 120, "العمل أو المجال المهني"),
    skills: clean(input.skills, 300, "المهارات والاهتمامات"),
    participation: clean(input.participation, 500, "مشاركتي في صحوة"),
    links: parsedLinks,
    directoryFields: pick(input.directoryFields, DIRECTORY),
    publicFields: pick(input.publicFields, OPTIONAL_PUBLIC),
    isPublic: input.isPublic === true,
  };
}

export function createAccountHandler(teamStore, platformStore) {
  const stores = { teamStore, platformStore };
  return async (request) => {
    try {
      const actor = await requireActor(request, stores, { allowPasswordChange: true });
      if (request.method === "GET") {
        if (actor.kind !== "account") return json({ profile: null });
        if (actor.mustChangePassword) return json({ mustChangePassword: true });
        return json({ profile: (await platformStore.profile(actor.volunteerId)) || null });
      }
      if (request.method !== "POST" && request.method !== "PUT") return json({ error: "طريقة طلب غير متاحة." }, 405);
      const input = await readInput(request, 16 * 1024);
      if (request.method === "POST") {
        // Change password: the current one (or the temporary one) is required.
        const current = await platformStore.accountPasswordHash(actor.accountId);
        if (typeof input.currentPassword !== "string" || !(await verifyPassword(input.currentPassword, current)))
          throw new TeamError("كلمة المرور الحالية غير صحيحة.", 400, "WRONG_PASSWORD");
        validateNewPassword(input.newPassword, actor.username);
        if (input.newPassword === input.currentPassword) throw new TeamError("اختر كلمة مرور جديدة مختلفة.");
        await platformStore.changePassword(actor.accountId, await hashPassword(input.newPassword));
        await platformStore.audit({ actor: `${actor.fullName} (${actor.username})`, actorVolunteer: actor.volunteerId, action: "account.password-change", target: actor.volunteerId, isTest: actor.isTest });
        // Other sessions end with the version bump; this browser gets a fresh one.
        const previous = readSessionToken(request);
        if (previous) await platformStore.deleteAccountSession(tokenHash(previous));
        const cookie = await createAccountSession(actor.accountId, true, request, platformStore);
        return json({ changed: true }, 200, { "Set-Cookie": cookie });
      }
      if (actor.mustChangePassword) throw new TeamError("غيّر كلمة المرور المؤقتة أولًا.", 403, "PASSWORD_CHANGE_REQUIRED");
      if (actor.kind !== "account") throw forbidden("حساب المسؤول العام لا يرتبط بملف متطوع.");
      if (!can(actor, "profile.edit", {})) throw forbidden();
      const profile = validateProfile(input.profile || {});
      if (profile.handle) {
        const owner = await platformStore.handleOwner(profile.handle);
        if (owner && owner !== actor.volunteerId) throw new TeamError("اسم المستخدم هذا مستخدم بالفعل. اختر اسمًا آخر.", 409, "HANDLE_TAKEN");
      }
      if (profile.isPublic) {
        if (!profile.handle) throw new TeamError("اختر اسم مستخدم للصفحة قبل نشرها.");
        const person = await platformStore.person(actor.volunteerId);
        const age = ageFromBirthDate(person.birthDate);
        // Public pages for minors need an approved policy first.
        if (age === null || age < 18) throw new TeamError("نشر الصفحة العامة متاح لمن أتم 18 عامًا ومسجل تاريخ ميلاده، إلى أن تُعتمد سياسة للقاصرين.");
      }
      await platformStore.saveProfile(actor.volunteerId, profile);
      return json({ profile: await platformStore.profile(actor.volunteerId) });
    } catch (error) {
      if (error?.code === "23505") return json({ error: "اسم المستخدم هذا مستخدم بالفعل. اختر اسمًا آخر." }, 409);
      return errorResponse(error);
    }
  };
}

const KINDS = ["news", "current", "project", "achievement", "opportunity"];

export function createPostsHandler(teamStore, platformStore) {
  const stores = { teamStore, platformStore };
  return async (request) => {
    try {
      const actor = await requireActor(request, stores);
      if (request.method === "GET") {
        if (!canAny(actor, "community.view")) throw forbidden();
        const posts = (await platformStore.posts(actor.isTest)).filter((p) => audienceVisible(actor, p.audienceUniversity, p.audienceSector));
        return json({ posts });
      }
      const input = await readInput(request, 8 * 1024);
      if (request.method === "POST") {
        const kind = KINDS.includes(input.kind) ? input.kind : null;
        if (!kind) throw new TeamError("اختر نوع المنشور.");
        const audienceUniversity = typeof input.audienceUniversity === "string" && input.audienceUniversity.trim() ? input.audienceUniversity.trim().slice(0, 120) : null;
        const audienceSector = input.audienceSector === "youth" || input.audienceSector === "women" ? input.audienceSector : null;
        // The audience must lie inside the publisher's own scope.
        if (!can(actor, "posts.publish", { university: audienceUniversity || CENTRAL, sector: audienceSector, team: null })
          && !can(actor, "posts.publish", { university: audienceUniversity, sector: audienceSector, team: null }))
          throw new TeamError("حدد جمهورًا داخل نطاق صلاحيتك للنشر.", 403, "FORBIDDEN");
        const title = clean(input.title, 160, "العنوان");
        if (!title) throw new TeamError("أدخل العنوان.");
        const link = input.link ? safeLink(String(input.link).trim()) : "";
        if (input.link && !link) throw new TeamError("الرابط يجب أن يبدأ بـ https://");
        const id = await platformStore.createPost({
          kind,
          title,
          body: clean(input.body, 2000, "التفاصيل"),
          skills: clean(input.skills, 300, "المهارات المطلوبة"),
          link: link || "",
          happensOn: input.happensOn ? date(String(input.happensOn), "تاريخ") : "",
          audienceUniversity,
          audienceSector,
          authorLabel: actor.fullName,
          authorVolunteer: actor.volunteerId,
          isTest: actor.isTest,
        });
        await platformStore.audit({ actor: actor.fullName, actorVolunteer: actor.volunteerId, action: "post.publish", details: { kind, title, audienceUniversity, audienceSector }, isTest: actor.isTest });
        return json({ id }, 201);
      }
      if (request.method === "DELETE") {
        const post = await platformStore.post(String(input.id || ""));
        if (!post || post.isTest !== actor.isTest) throw new TeamError("المنشور غير موجود.", 404);
        if (!can(actor, "posts.publish", { university: post.audienceUniversity || CENTRAL, sector: post.audienceSector, team: null })
          && !can(actor, "posts.publish", { university: post.audienceUniversity, sector: post.audienceSector, team: null }))
          throw forbidden();
        await platformStore.archivePost(post.id, Number(input.revision));
        return json({ archived: true });
      }
      return json({ error: "طريقة طلب غير متاحة." }, 405);
    } catch (error) {
      return errorResponse(error);
    }
  };
}
