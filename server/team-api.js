import { recordVersion, validatePerson, TeamError } from "./team-data.js";
import { json, readInput, errorResponse } from "./http.js";
import { requireActor, forbidden } from "./platform/session.js";
import { can, canAny, mayAssignRole, mayManagePerson, volunteerTargets, scopesFor, isGlobalAdmin, buildPermissions, assignmentTarget } from "./platform/access.js";
import { assignmentScope, canRecruit } from "./platform/assignment.js";
import { describeAssignment, directoryGroups, visibleToViewer } from "./platform/service.js";
import { PLATFORM_ROLES, LEGACY_ROLE_MAP, roleById, sectorForGender } from "../shared/platform-roles.js";

const targetsOf = (person, assignments) => volunteerTargets({ ...person, sector: sectorForGender(person.gender) }, assignments);

// Volunteer records, scoped by the actor's permissions. Archive replaces
// hard delete; archived records keep their history and can be restored.
export function createTeamHandler(store, platformStore) {
  const stores = { teamStore: store, platformStore };
  return async (request) => {
    try {
      let actor = await requireActor(request, stores);
      const selected = new URL(request.url).searchParams.get("assignment");
      if (selected && request.method === "GET") {
        const assignment = actor.assignments.find((a) => a.id === selected);
        if (!assignment) throw forbidden();
        actor = { ...actor, assignments: [assignment], grants: actor.grants.filter((g) => g.effect === "deny") };
        actor.permissions = buildPermissions(actor);
      }
      if (!canAny(actor, "volunteers.view")) throw forbidden("هذا القسم متاح للمسؤولين المخولين فقط.");
      const realmTest = actor.isTest;
      if (request.method === "GET") {
        const [people, assignments, policy] = await Promise.all([platformStore.people(realmTest), platformStore.assignments(realmTest), platformStore.setting("directory.crossSector", "leads")]);
        const byPerson = new Map();
        for (const a of assignments) byPerson.set(a.volunteerId, [...(byPerson.get(a.volunteerId) || []), a]);
        const candidates = [];
        const volunteers = [];
        const hasSharedTeamRole = PLATFORM_ROLES.some((r) => r.sector === "none" && mayAssignRole(actor, r.id));
        for (const p of people) {
          const own = byPerson.get(p.id) || [];
          const personWithSector = { ...p, sector: sectorForGender(p.gender) };
          const targets = targetsOf(p, own);
          const groupNames = directoryGroups(p, own);
          const visible = isGlobalAdmin(actor) || visibleToViewer(actor, actor.assignments, personWithSector, own, policy);
          if ((visible || hasSharedTeamRole) && canAny(actor, "roles.assign") && can(actor, "directory.view", targets)) {
            const options = PLATFORM_ROLES.filter((r) => (visible || r.sector === "none")
              && canRecruit(actor, p, own, r.id)
              && !own.some((a) => a.roleId === r.id && (r.scope === "central" || a.university === p.university)));
            if (options.length) candidates.push({ id: p.id, name: p.fullName, university: p.university, gender: p.gender, groups: groupNames, roleIds: options.map((r) => r.id) });
          }
          if (!can(actor, "volunteers.view", targets)) continue;
          const manageEdit = p.id !== actor.volunteerId && mayManagePerson(actor, own, "volunteers.edit", personWithSector);
          const manageStrict = p.id !== actor.volunteerId && mayManagePerson(actor, own);
          const { accountId, username, accountEmail, accountStatus, mustChangePassword, lastLoginAt, lastResetAt, temporaryExpiresAt, accountCreatedAt, isTest, archivedAt, ...person } = p;
          const assignTargetCheck = (a) => {
            const t = { ...assignmentTarget(a), sector: a.sector || personWithSector.sector || null };
            return mayAssignRole(actor, a.roleId, assignmentTarget(a)) || mayAssignRole(actor, a.roleId, t);
          };
          const canEditPerson = manageEdit && can(actor, "volunteers.edit", targets);
          const canAssignPerson = p.id !== actor.volunteerId && !own.some((a) => a.roleId === "sahwa-lead") && can(actor, "roles.assign", targets);
          const canCreateAcc = p.id !== actor.volunteerId && (mayManagePerson(actor, own, "accounts.create", personWithSector) || actor.kind === "owner") && can(actor, "accounts.create", targets);
          volunteers.push({
            ...person,
            groups: groupNames,
            assignments: own.map((a) => ({ ...describeAssignment(a, personWithSector.sector), canChange: assignTargetCheck(a) && !own.some((r) => r.roleId === "sahwa-lead") && actor.volunteerId !== p.id })),
            account: can(actor, "accounts.view", targets)
              ? accountId
                ? { username, email: accountEmail, status: accountStatus, pending: mustChangePassword, lastLoginAt, lastResetAt, temporaryExpiresAt, createdAt: accountCreatedAt }
                : { status: "none" }
              : null,
            allowed: {
              edit: canEditPerson,
              archive: manageStrict && can(actor, "volunteers.archive", targets),
              assign: canAssignPerson,
              createAccount: canCreateAcc,
              resetAccount: p.id !== actor.volunteerId && mayManagePerson(actor, own, "accounts.reset", personWithSector) && can(actor, "accounts.reset", targets),
              suspendAccount: p.id !== actor.volunteerId && mayManagePerson(actor, own, "accounts.suspend", personWithSector) && can(actor, "accounts.suspend", targets),
              level: canEditPerson,
              oversightOnly: !canEditPerson && !canAssignPerson && !canCreateAcc && p.id !== actor.volunteerId,
            },
          });
        }
        return json({
          volunteers, candidates,
          meta: {
            canAssign: canAny(actor, "roles.assign"),
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
        const requested = input.assignment?.roleId;
        if (requested && !roleById(requested)) throw new TeamError("اختر دورًا معتمدًا.");
        const person = validatePerson(requested ? { ...input.person, roleTitle: roleById(requested).title } : input.person);
        const sector = sectorForGender(person.gender);
        const mapped = requested ? { roleId: requested } : LEGACY_ROLE_MAP[person.roleId];
        const role = mapped && roleById(mapped.roleId);
        const scope = role ? assignmentScope(role, { ...person, sector }, { university: input.assignment?.university, sector: mapped.sector }) : null;
        const target = scope?.target || { university: person.university, sector, team: null };
        const createTarget = scope ? { ...scope.target, sector: scope.target.sector || sector } : target;
        if ((!can(actor, "volunteers.create", target) && !can(actor, "volunteers.create", createTarget)) || (role && !canRecruit(actor, person, [], role.id, scope.university)))
          throw forbidden("لا تملك صلاحية إضافة متطوع في هذا النطاق.");
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
        const saved = await store.createVolunteer(person, { isTest: realmTest, assignment: role ? { roleId: role.id, university: scope.university, sector: scope.sector, assignedBy: actor.fullName, source: requested ? "manual" : "legacy" } : null });
        await platformStore.audit({ actor: actor.fullName, actorVolunteer: actor.volunteerId, action: "volunteer.create", target: saved.id, details: { university: person.university }, isTest: realmTest });
        return json({ person: { ...saved, assignments: (await platformStore.assignmentsOf(saved.id)).map((a) => describeAssignment(a, sector)), account: { status: "none" } } }, 201);
      }
      recordVersion(input);
      const existing = await platformStore.person(input.id);
      if (!existing || existing.isTest !== realmTest || existing.archivedAt) throw new TeamError("تم تعديل السجل من جهاز آخر، أو لم يعد موجودًا. حدّث القائمة وافتحه من جديد.", 409, "CONFLICT");
      const own = await platformStore.assignmentsOf(existing.id, { includeScheduled: true });
      const targets = targetsOf(existing, own);
      if (request.method === "DELETE") {
        if (existing.id === actor.volunteerId || !mayManagePerson(actor, own) || !can(actor, "volunteers.archive", targets)) throw forbidden();
        await platformStore.archivePerson(input.id, input.revision);
        await platformStore.audit({ actor: actor.fullName, actorVolunteer: actor.volunteerId, action: "volunteer.archive", target: existing.id, isTest: realmTest });
        return json({ deleted: true, archived: true });
      }
      const existingWithSector = { ...existing, sector: sectorForGender(existing.gender) };
      if (existing.id === actor.volunteerId || !mayManagePerson(actor, own, "volunteers.edit", existingWithSector) || !can(actor, "volunteers.edit", targets)) throw forbidden();
      const person = validatePerson(input.person);
      let legacyChange;
      if (person.responsibility !== existing.responsibility || person.team !== existing.team || (Object.hasOwn(person, "roleId") && person.roleId !== existing.roleId)) {
        const oldMatch = LEGACY_ROLE_MAP[existing.roleId];
        const previous = oldMatch && own.find((a) => a.source === "legacy" && a.roleId === oldMatch.roleId);
        const match = LEGACY_ROLE_MAP[person.roleId];
        if (previous && !mayAssignRole(actor, previous.roleId, assignmentTarget(previous))) throw forbidden();
        let next = null;
        if (match) {
          const role = roleById(match.roleId);
          const scope = assignmentScope(role, { ...person, sector: sectorForGender(person.gender) }, {sector:match.sector});
          if (!canRecruit(actor, { ...person, id:existing.id }, own, role.id, scope.university)) throw forbidden();
          next = { roleId: role.id, ...scope };
        }
        if (previous || next) legacyChange = { oldId: previous?.id || null, next, by: actor.fullName };
      }
      // Moving a person to a university or sector outside the actor's scope is refused.
      if ((person.university !== existing.university || person.gender !== existing.gender) && !can(actor, "volunteers.edit", { university: person.university, sector: sectorForGender(person.gender), team: null }))
        throw forbidden("لا يمكنك نقل السجل إلى نطاق خارج صلاحياتك.");
      const saved = await store.updateVolunteer(input.id, input.revision, person, legacyChange);
      await platformStore.audit({ actor: actor.fullName, actorVolunteer: actor.volunteerId, action: "volunteer.edit", target: existing.id, isTest: realmTest });
      return json({ person: saved });
    } catch (error) {
      return errorResponse(error);
    }
  };
}
