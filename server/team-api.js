import { recordVersion, validatePerson, TeamError } from "./team-data.js";
import { json, readInput, errorResponse } from "./http.js";
import { requireActor, forbidden } from "./platform/session.js";
import { can, canAny, mayAssignRole, mayManagePerson, volunteerTargets, scopesFor, isGlobalAdmin } from "./platform/access.js";
import { describeAssignment } from "./platform/service.js";
import { PLATFORM_ROLES, sectorForGender } from "../shared/platform-roles.js";

const targetsOf = (person, assignments) => volunteerTargets({ ...person, sector: sectorForGender(person.gender) }, assignments);

// Volunteer records, scoped by the actor's permissions. Archive replaces
// hard delete; archived records keep their history and can be restored.
export function createTeamHandler(store, platformStore) {
  const stores = { teamStore: store, platformStore };
  return async (request) => {
    try {
      const actor = await requireActor(request, stores);
      if (!canAny(actor, "volunteers.view")) throw forbidden("هذا القسم متاح للمسؤولين المخولين فقط.");
      const realmTest = actor.isTest;
      if (request.method === "GET") {
        const [people, assignments] = await Promise.all([platformStore.people(realmTest), platformStore.assignments(realmTest)]);
        const byPerson = new Map();
        for (const a of assignments) byPerson.set(a.volunteerId, [...(byPerson.get(a.volunteerId) || []), a]);
        const volunteers = [];
        for (const p of people) {
          const own = byPerson.get(p.id) || [];
          const targets = targetsOf(p, own);
          if (!can(actor, "volunteers.view", targets)) continue;
          const manage = p.id !== actor.volunteerId && mayManagePerson(actor, own);
          const { accountId, username, accountEmail, accountStatus, mustChangePassword, lastLoginAt, lastResetAt, temporaryExpiresAt, accountCreatedAt, isTest, archivedAt, ...person } = p;
          volunteers.push({
            ...person,
            assignments: own.map(describeAssignment),
            account: can(actor, "accounts.view", targets)
              ? accountId
                ? { username, email: accountEmail, status: accountStatus, pending: mustChangePassword, lastLoginAt, lastResetAt, temporaryExpiresAt, createdAt: accountCreatedAt }
                : { status: "none" }
              : null,
            allowed: {
              edit: can(actor, "volunteers.edit", targets),
              archive: manage && can(actor, "volunteers.archive", targets),
              assign: p.id !== actor.volunteerId && can(actor, "roles.assign", targets),
              createAccount: manage && can(actor, "accounts.create", targets),
              resetAccount: manage && can(actor, "accounts.reset", targets),
              suspendAccount: manage && can(actor, "accounts.suspend", targets),
              level: manage && can(actor, "volunteers.edit", targets),
            },
          });
        }
        return json({
          volunteers,
          meta: {
            canCreate: canAny(actor, "volunteers.create"),
            createScopes: scopesFor(actor, "volunteers.create").map(({ university, sector }) => ({ university, sector })),
            assignableRoles: PLATFORM_ROLES.filter((r) => mayAssignRole(actor, r.id)).map((r) => ({ id: r.id, title: r.title, titleWomen: r.titleWomen || null, scope: r.scope, sector: r.sector, deferred: Boolean(r.deferred) })),
            globalAdmin: isGlobalAdmin(actor),
          },
        });
      }
      if (!["POST", "PUT", "DELETE"].includes(request.method)) return json({ error: "طريقة طلب غير متاحة." }, 405);
      const input = await readInput(request);
      if (request.method === "POST") {
        const person = validatePerson(input.person);
        const target = { university: person.university, sector: sectorForGender(person.gender), team: null };
        if (!can(actor, "volunteers.create", target)) throw forbidden("لا تملك صلاحية إضافة متطوع في هذا النطاق.");
        // Look for an existing record first, without revealing people outside the actor's scope.
        const same = await platformStore.sameNamePeople(realmTest, person.fullName);
        if (same.length && input.confirmDuplicate !== true) {
          const visible = same.filter((p) => can(actor, "volunteers.view", targetsOf(p, [])));
          throw new TeamError(
            visible.length
              ? `يوجد سجل باسم «${visible[0].fullName}» في ${visible[0].university}. افتحه وأضف الدور إليه بدل إنشاء سجل جديد، أو أكد أنه شخص مختلف.`
              : "قد يكون هذا الشخص مسجلًا في نطاق آخر. تواصل مع مسؤول صحوة قبل إنشاء سجل جديد، أو أكد أنه شخص مختلف.",
            409,
            "POSSIBLE_DUPLICATE",
          );
        }
        const saved = await store.createVolunteer(person, { isTest: realmTest });
        await platformStore.audit({ actor: actor.fullName, actorVolunteer: actor.volunteerId, action: "volunteer.create", target: saved.id, details: { university: person.university }, isTest: realmTest });
        return json({ person: { ...saved, assignments: [], account: { status: "none" } } }, 201);
      }
      recordVersion(input);
      const existing = await platformStore.person(input.id);
      if (!existing || existing.isTest !== realmTest || existing.archivedAt) throw new TeamError("تم تعديل السجل من جهاز آخر، أو لم يعد موجودًا. حدّث القائمة وافتحه من جديد.", 409, "CONFLICT");
      const own = await platformStore.assignmentsOf(existing.id);
      const targets = targetsOf(existing, own);
      if (request.method === "DELETE") {
        if (existing.id === actor.volunteerId || !mayManagePerson(actor, own) || !can(actor, "volunteers.archive", targets)) throw forbidden();
        await platformStore.archivePerson(input.id, input.revision);
        await platformStore.audit({ actor: actor.fullName, actorVolunteer: actor.volunteerId, action: "volunteer.archive", target: existing.id, isTest: realmTest });
        return json({ deleted: true, archived: true });
      }
      if (!can(actor, "volunteers.edit", targets)) throw forbidden();
      const person = validatePerson(input.person);
      // Moving a person to a university or sector outside the actor's scope is refused.
      if (!can(actor, "volunteers.edit", { university: person.university, sector: sectorForGender(person.gender), team: null }))
        throw forbidden("لا يمكنك نقل السجل إلى نطاق خارج صلاحياتك.");
      const saved = await store.updateVolunteer(input.id, input.revision, person);
      await platformStore.audit({ actor: actor.fullName, actorVolunteer: actor.volunteerId, action: "volunteer.edit", target: existing.id, isTest: realmTest });
      return json({ person: saved });
    } catch (error) {
      return errorResponse(error);
    }
  };
}
