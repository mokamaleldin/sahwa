import { TeamError, UUID, date } from "./team-data.js";
import { json, readInput, errorResponse } from "./http.js";
import { requireActor, forbidden, temporaryCredential, validateNewPassword } from "./platform/session.js";
import { hashPassword } from "./auth.js";
import {
  PERMISSIONS,
  PERMISSION_KEYS,
  NON_DELEGABLE,
  can,
  canAny,
  covers,
  isGlobalAdmin,
  mayAssignRole,
  mayManagePerson,
  scopesFor,
  volunteerTargets,
} from "./platform/access.js";
import { describeAssignment, loadRealm } from "./platform/service.js";
import { uniqueUsername } from "./platform/usernames.js";
import {
  CENTRAL,
  LEGACY_ROLE_MAP,
  LEGACY_SUGGESTIONS,
  PLATFORM_ROLES,
  TEAM_TITLES,
  roleById,
  roleTitle,
  sectorForGender,
} from "../shared/platform-roles.js";
import { volunteerRolesById } from "../shared/volunteer-roles.js";

const LEVELS = ["متطوع", "عضو فاعل", "مسؤول"];
const nullableText = (value, max) => (typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null);
const sectorValue = (value) => (value === "youth" || value === "women" ? value : null);
const uuid = (value, label = "السجل") => {
  if (typeof value !== "string" || !UUID.test(value)) throw new TeamError(`${label} غير صالح.`);
  return value;
};

async function loadTarget(platformStore, actor, volunteerId) {
  const person = await platformStore.person(uuid(volunteerId, "المتطوع"));
  if (!person || person.isTest !== actor.isTest) throw new TeamError("المتطوع غير موجود.", 404, "NOT_FOUND");
  const assignments = await platformStore.assignmentsOf(person.id);
  const sector = sectorForGender(person.gender);
  return { person: { ...person, sector }, assignments, targets: volunteerTargets({ ...person, sector }, assignments) };
}

// The assignment's own scope, used both for validation and permission checks.
export function assignmentScope(role, person, input) {
  if (!role) throw new TeamError("اختر دورًا من التصنيفات المعتمدة.");
  let sector = null;
  if (role.sector === "youth" || role.sector === "women") sector = role.sector;
  else if (role.sector === "required") sector = sectorValue(input.sector) || person.sector;
  if ((role.sector !== "none") && !sector) throw new TeamError("حدد القطاع (شباب/طالبات) لهذا الدور.");
  if (sector && person.sector && sector !== person.sector) throw new TeamError("قطاع الدور لا يطابق النوع المسجل لهذا الشخص.");
  const university = role.scope === "university" ? nullableText(input.university, 120) || person.university || null : null;
  if (role.scope === "university" && !university) throw new TeamError("حدد الجامعة لهذا الدور.");
  return { university, sector, team: role.team, target: { university: university || CENTRAL, sector, team: role.team } };
}

function actorLabel(actor) {
  return actor.kind === "shared" ? "حساب صحوة المشترك" : `${actor.fullName} (${actor.username})`;
}

function grantInput(input) {
  const permission = typeof input.permission === "string" ? input.permission : "";
  if (!PERMISSION_KEYS.has(permission)) throw new TeamError("اختر صلاحية من القائمة.");
  const effect = input.effect === "deny" ? "deny" : "allow";
  const university = nullableText(input.university, 120);
  const sector = sectorValue(input.sector);
  const team = nullableText(input.team, 64);
  if (team && !TEAM_TITLES[team]) throw new TeamError("اختر فريقًا من القائمة.");
  const expiresOn = input.expiresOn ? date(String(input.expiresOn), "تاريخ انتهاء") : "";
  const reason = typeof input.reason === "string" ? input.reason.trim().slice(0, 300) : "";
  if (!reason) throw new TeamError("اكتب سبب منح الصلاحية أو منعها.");
  return { permission, effect, university, sector, team, reason, expiresAt: expiresOn ? `${expiresOn}T23:59:59+03:00` : null };
}

// Legacy titles that the migration could not match with confidence.
function reviewItems(realm, people) {
  const assigned = new Set(realm.assignments.map((a) => a.volunteerId));
  return people
    .filter((p) => !assigned.has(p.id) && (p.roleId || p.responsibility))
    .map((p) => {
      const legacy = p.roleId ? volunteerRolesById.get(p.roleId) : null;
      const clear = p.roleId ? LEGACY_ROLE_MAP[p.roleId] : null;
      const suggestion = p.roleId ? LEGACY_SUGGESTIONS[p.roleId] : null;
      let reason = "المسمى الحالي لا يطابق أيًّا من التصنيفات العشرين بصورة واضحة.";
      if (clear) reason = "المطابقة تحتاج جامعة أو نوعًا (شاب/بنت) يتوافق مع الدور.";
      else if (suggestion) reason = suggestion.reason;
      return {
        id: p.id,
        fullName: p.fullName,
        university: p.university,
        gender: p.gender,
        currentTitle: legacy?.title || p.responsibility,
        detail: p.team,
        suggestedRole: clear?.roleId || suggestion?.roleId || null,
        suggestedTitle: clear?.roleId || suggestion?.roleId ? roleTitle(clear?.roleId || suggestion.roleId, clear?.sector || sectorForGender(p.gender)) : "",
        reason,
      };
    });
}

const OFFICIAL_GROUPS = [
  { id: "board", title: "مجلس الإدارة المركزي", roles: ["sahwa-lead", "women-sector-lead", "central-activities-lead", "media-lead", "central-relations-lead"] },
  { id: "universities", title: "مسؤولو الجامعات", roles: ["university-youth-lead", "university-women-lead"] },
  { id: "other-leads", title: "المسؤولون الآخرون", roles: ["internal-activities-lead", "university-relations-lead", "finance-lead", "archive-lead", "review-lead"] },
  { id: "central-members", title: "أعضاء الفرق المركزية", roles: ["central-activities-member", "media-member", "central-relations-member", "review-member"] },
];

export function createAdminHandler(teamStore, platformStore) {
  const stores = { teamStore, platformStore };
  return async (request) => {
    try {
      const actor = await requireActor(request, stores);
      const isTest = actor.isTest;
      const label = actorLabel(actor);
      const audit = (action, target, details) => platformStore.audit({ actor: label, actorVolunteer: actor.volunteerId, action, target, details, isTest });

      if (request.method === "GET") {
        const view = new URL(request.url).searchParams.get("view") || "officials";
        if (view === "officials") {
          if (!canAny(actor, "accounts.view")) throw forbidden();
          const realm = await loadRealm(platformStore, isTest);
          const accounts = new Map((await platformStore.people(isTest)).map((p) => [p.id, p]));
          const groups = OFFICIAL_GROUPS.map((group) => ({
            id: group.id,
            title: group.title,
            people: realm.assignments
              .filter((a) => group.roles.includes(a.roleId))
              .filter((a) => can(actor, "accounts.view", volunteerTargets(realm.byId.get(a.volunteerId), realm.assignmentsByPerson.get(a.volunteerId))))
              .map((a) => {
                const p = accounts.get(a.volunteerId);
                const own = realm.assignmentsByPerson.get(a.volunteerId) || [];
                const targets = volunteerTargets(realm.byId.get(a.volunteerId), own);
                const manage = a.volunteerId !== actor.volunteerId && mayManagePerson(actor, own);
                return {
                  volunteerId: a.volunteerId,
                  fullName: p.fullName,
                  university: p.university,
                  role: describeAssignment(a),
                  account: p.accountId ? { username: p.username, status: p.accountStatus, pending: p.mustChangePassword, lastResetAt: p.lastResetAt, lastLoginAt: p.lastLoginAt } : { status: "none" },
                  canCreate: manage && can(actor, "accounts.create", targets),
                  canReset: manage && can(actor, "accounts.reset", targets),
                  canSuspend: manage && can(actor, "accounts.suspend", targets),
                };
              }),
          }));
          return json({ groups });
        }
        if (view === "review") {
          if (!isGlobalAdmin(actor)) throw forbidden();
          const realm = await loadRealm(platformStore, isTest);
          return json({ items: reviewItems(realm, realm.people) });
        }
        if (view === "grants") {
          if (!canAny(actor, "permissions.manage") && !canAny(actor, "permissions.delegate")) throw forbidden();
          const [grants, people] = await Promise.all([platformStore.allGrants(isTest), platformStore.people(isTest)]);
          return json({
            grants: isGlobalAdmin(actor) ? grants : grants.filter((g) => g.grantedBy === label),
            people: people.map((p) => ({ id: p.id, fullName: p.fullName, university: p.university })),
            permissions: PERMISSIONS.map((p) => ({ ...p, delegable: !NON_DELEGABLE.has(p.key) })),
            teams: Object.entries(TEAM_TITLES).map(([id, title]) => ({ id, title })),
            delegateScopes: isGlobalAdmin(actor) ? null : scopesFor(actor, "permissions.delegate"),
          });
        }
        if (view === "audit") {
          if (!canAny(actor, "audit.view")) throw forbidden();
          return json({ log: await platformStore.auditLog(isTest) });
        }
        if (view === "archived") {
          if (!isGlobalAdmin(actor)) throw forbidden();
          return json({ people: (await platformStore.people(isTest, { includeArchived: true })).filter((p) => p.archivedAt).map((p) => ({ id: p.id, fullName: p.fullName, university: p.university, archivedAt: p.archivedAt })) });
        }
        if (view === "settings") {
          if (!canAny(actor, "settings.manage")) throw forbidden();
          return json({ settings: { "directory.crossSector": await platformStore.setting("directory.crossSector", "leads") } });
        }
        if (view === "person") {
          const { person, assignments, targets } = await loadTarget(platformStore, actor, new URL(request.url).searchParams.get("id"));
          if (!can(actor, "volunteers.view", targets)) throw forbidden();
          const history = await platformStore.assignmentsOf(person.id, { includeEnded: true });
          const grants = canAny(actor, "permissions.manage") ? await platformStore.grantsOf(person.id) : [];
          return json({ assignments: history.map((a) => ({ ...describeAssignment(a), status: a.status, startsOn: a.startsOn, endsOn: a.endsOn, assignedBy: a.assignedBy })), active: assignments.length, grants });
        }
        return json({ error: "طلب غير معروف." }, 400);
      }

      if (request.method !== "POST") return json({ error: "طريقة طلب غير متاحة." }, 405);
      const input = await readInput(request, 32 * 1024);
      const action = input.action;

      if (action === "assign-role") {
        const { person, assignments, targets } = await loadTarget(platformStore, actor, input.volunteerId);
        if (person.archivedAt) throw new TeamError("السجل مؤرشف.", 409);
        if (person.id === actor.volunteerId) throw forbidden("لا يمكنك تعديل أدوارك بنفسك.");
        const role = roleById(input.roleId);
        const scope = assignmentScope(role, person, input);
        if (!mayAssignRole(actor, role.id)) throw forbidden("لا تملك حق إسناد هذا الدور.");
        if (!can(actor, "roles.assign", scope.target) || !can(actor, "roles.assign", targets)) throw forbidden("هذا الإسناد خارج نطاق صلاحياتك.");
        const startsOn = input.startsOn ? date(String(input.startsOn), "تاريخ بداية التكليف") : "";
        const id = await platformStore.addAssignment({ volunteerId: person.id, roleId: role.id, university: scope.university, sector: scope.sector, startsOn, assignedBy: label, source: isTest ? "test" : "manual" });
        await audit("role.assign", person.id, { roleId: role.id, university: scope.university, sector: scope.sector, assignmentId: id, previousCount: assignments.length });
        return json({ assigned: true, id });
      }

      if (action === "end-role") {
        const assignment = await platformStore.assignment(uuid(input.assignmentId, "الإسناد"));
        if (!assignment) throw new TeamError("الإسناد غير موجود.", 404);
        const { person } = await loadTarget(platformStore, actor, assignment.volunteerId);
        if (person.id === actor.volunteerId) throw forbidden("لا يمكنك تعديل أدوارك بنفسك.");
        const role = roleById(assignment.roleId);
        const target = { university: assignment.university || CENTRAL, sector: assignment.sector, team: role?.team || null };
        if (!mayAssignRole(actor, assignment.roleId) || !can(actor, "roles.assign", target)) throw forbidden("إنهاء هذا الدور خارج نطاق صلاحياتك.");
        await platformStore.endAssignment(assignment.id, label);
        await audit("role.end", person.id, { roleId: assignment.roleId, university: assignment.university, sector: assignment.sector });
        return json({ ended: true });
      }

      if (action === "set-level") {
        const { person, assignments, targets } = await loadTarget(platformStore, actor, input.volunteerId);
        if (!LEVELS.includes(input.level)) throw new TeamError("اختر المستوى التنظيمي من القائمة.");
        if (person.id === actor.volunteerId || !mayManagePerson(actor, assignments) || !can(actor, "volunteers.edit", targets)) throw forbidden();
        await platformStore.setMembershipLevel(person.id, input.level);
        await audit("volunteer.level", person.id, { from: person.membershipLevel, to: input.level });
        return json({ saved: true });
      }

      if (["create-account", "reset-account", "suspend-account", "reactivate-account"].includes(action)) {
        const { person, assignments, targets } = await loadTarget(platformStore, actor, input.volunteerId);
        if (person.archivedAt) throw new TeamError("السجل مؤرشف.", 409);
        if (person.id === actor.volunteerId) throw forbidden("لا يمكنك إدارة حسابك من هنا. استخدم إعدادات الحساب.");
        if (!mayManagePerson(actor, assignments)) throw forbidden("هذا الشخص يحمل دورًا لا تملك إدارته.");
        const permission = { "create-account": "accounts.create", "reset-account": "accounts.reset", "suspend-account": "accounts.suspend", "reactivate-account": "accounts.suspend" }[action];
        if (!can(actor, permission, targets)) throw forbidden();
        const account = await platformStore.accountForVolunteer(person.id);
        // The administrator may set the initial password; otherwise a unique
        // temporary one is generated. Only the hash is ever stored.
        async function credentialFor() {
          if (typeof input.password === "string" && input.password) {
            validateNewPassword(input.password);
            const mustChange = input.requireChange !== false;
            return { chosen: true, hash: await hashPassword(input.password), expiresAt: null, mustChange };
          }
          return { ...(await temporaryCredential()), mustChange: true };
        }
        if (action === "create-account") {
          // An existing account is reused; its password is never replaced here.
          if (account) return json({ existing: true, username: account.username, status: account.accountStatus }, 200);
          const username = await uniqueUsername(person.fullName, (u) => platformStore.usernameTaken(u));
          const credential = await credentialFor();
          await platformStore.createAccount({ volunteerId: person.id, username, passwordHash: credential.hash, mustChange: credential.mustChange, expiresAt: credential.expiresAt, createdBy: label });
          await audit("account.create", person.id, { username });
          return json({ created: true, fullName: person.fullName, university: person.university, username, temporaryPassword: credential.password, chosenPassword: Boolean(credential.chosen), expiresAt: credential.expiresAt }, 201);
        }
        if (!account) throw new TeamError("لا يوجد حساب لهذا الشخص بعد.", 404);
        if (action === "reset-account") {
          const credential = await credentialFor();
          await platformStore.resetAccount(account.accountId, credential.hash, credential.expiresAt, credential.mustChange);
          await audit("account.reset", person.id, { username: account.username });
          return json({ reset: true, fullName: person.fullName, username: account.username, temporaryPassword: credential.password, chosenPassword: Boolean(credential.chosen), expiresAt: credential.expiresAt });
        }
        const status = action === "suspend-account" ? "suspended" : "active";
        await platformStore.setAccountStatus(account.accountId, status);
        await audit(action === "suspend-account" ? "account.suspend" : "account.reactivate", person.id, { username: account.username });
        return json({ status });
      }

      if (action === "grant") {
        const { person } = await loadTarget(platformStore, actor, input.volunteerId);
        if (person.id === actor.volunteerId) throw forbidden("لا يمكنك تعديل صلاحياتك بنفسك.");
        const grant = grantInput(input);
        if (!isGlobalAdmin(actor)) {
          // Delegation: only permissions the actor holds, within the actor's
          // delegation scope, never the non-delegable ones, never a deny.
          const instance = { university: grant.university, sector: grant.sector, team: grant.team };
          const delegates = scopesFor(actor, "permissions.delegate").some((s) => covers(s, instance));
          const holds = scopesFor(actor, grant.permission).some((s) => covers(s, instance));
          if (!delegates || !holds || NON_DELEGABLE.has(grant.permission) || grant.effect === "deny") throw forbidden("لا يمكنك تفويض صلاحية لا تملكها أو خارج نطاقك.");
        }
        const id = await platformStore.addGrant({ ...grant, volunteerId: person.id, grantedBy: label, grantedByVolunteer: actor.volunteerId });
        await audit(grant.effect === "deny" ? "permission.deny" : "permission.grant", person.id, { permission: grant.permission, university: grant.university, sector: grant.sector, team: grant.team, expiresAt: grant.expiresAt, reason: grant.reason, id });
        return json({ granted: true, id });
      }

      if (action === "revoke-grant") {
        const grant = await platformStore.grant(uuid(input.grantId, "الصلاحية"));
        if (!grant) throw new TeamError("الصلاحية غير موجودة أو أُلغيت.", 404);
        const { person } = await loadTarget(platformStore, actor, grant.volunteerId);
        if (person.id === actor.volunteerId) throw forbidden("لا يمكنك تعديل صلاحياتك بنفسك.");
        if (!isGlobalAdmin(actor) && grant.grantedByVolunteer !== actor.volunteerId) throw forbidden();
        await platformStore.revokeGrant(grant.id, label);
        await audit("permission.revoke", person.id, { permission: grant.permission, id: grant.id });
        return json({ revoked: true });
      }

      if (action === "restore") {
        if (!isGlobalAdmin(actor)) throw forbidden();
        const id = uuid(input.volunteerId, "المتطوع");
        const person = await platformStore.person(id);
        if (!person || person.isTest !== isTest) throw new TeamError("المتطوع غير موجود.", 404);
        await platformStore.restorePerson(id);
        await audit("volunteer.restore", id, {});
        return json({ restored: true });
      }

      if (action === "settings") {
        if (!canAny(actor, "settings.manage")) throw forbidden();
        if (input.key !== "directory.crossSector" || !["none", "leads", "all"].includes(input.value)) throw new TeamError("قيمة غير صالحة.");
        await platformStore.setSetting(input.key, input.value, label);
        await audit("settings.update", null, { key: input.key, value: input.value });
        return json({ saved: true });
      }

      return json({ error: "إجراء غير معروف." }, 400);
    } catch (error) {
      return errorResponse(error);
    }
  };
}

export const ROLE_OPTIONS = PLATFORM_ROLES.map((r) => ({ id: r.id, title: r.title }));
