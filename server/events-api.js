import { recordVersion, validateEvent, TeamError } from "./team-data.js";
import { json, readInput, errorResponse } from "./http.js";
import { requireActor, forbidden } from "./platform/session.js";
import { can, canAny, denied, eventTarget, operationScopes, scopeMatches, scopesFor, volunteerTargets } from "./platform/access.js";
import { todayInIstanbul } from "../shared/team-options.js";
import { CENTRAL, sectorForGender } from "../shared/platform-roles.js";

function creationScope(actor, requested) {
  const options = operationScopes(actor, "events.create");
  const match = !requested ? options[0] : options.find((s) =>
    (s.university || null) === (requested.university || null) && s.sector === (requested.sector || null)
      && (requested.team === undefined || requested.team === s.team));
  if (!match) throw forbidden("اختر نطاقًا من تكليفاتك المتاحة.");
  return { ...match, university: match.university === CENTRAL ? null : match.university };
}

function isLegacyUntagged(event) {
  return !event.university && !event.sector && !event.team;
}

function hasWideEventRight(actor, permission, event) {
  const target = eventTarget(event);
  if (denied(actor, permission, target)) return false;
  return scopesFor(actor, permission).some((s) => s.university === null);
}

function editable(actor, event) {
  const target = eventTarget(event);
  if (denied(actor, "events.edit", target)) return false;
  if (can(actor, "events.manage", target)) return true;
  if (isLegacyUntagged(event) && hasWideEventRight(actor, "events.manage", event)) return true;
  const mine = actor.volunteerId && [event.creatorId, event.responsibleId].includes(actor.volunteerId);
  return Boolean(mine && actor.status === "نشط"
    && (event.responsibleId === actor.volunteerId || can(actor, "events.edit", target) || can(actor, "events.create", target)));
}

function deletable(actor, event) {
  const target = eventTarget(event);
  if (denied(actor, "events.delete", target)) return false;
  if (can(actor, "events.delete", target) && (can(actor, "events.manage", target) || (actor.volunteerId && event.creatorId === actor.volunteerId))) return true;
  if (isLegacyUntagged(event) && hasWideEventRight(actor, "events.delete", event)) return true;
  return false;
}

async function responsibleOptions(platform, actor, targets) {
  const [people, assignments] = await Promise.all([platform.people(actor.isTest), platform.assignments(actor.isTest)]);
  const byPerson = new Map();
  for (const a of assignments) {
    if (!byPerson.has(a.volunteerId)) byPerson.set(a.volunteerId, []);
    byPerson.get(a.volunteerId).push(a);
  }
  return people.filter((p) => {
    const scopes = volunteerTargets({ ...p, sector: sectorForGender(p.gender) }, byPerson.get(p.id));
    return p.status === "نشط" && targets.some((t) => can(actor, "events.manage", t)
      || (isLegacyUntagged(t) && hasWideEventRight(actor, "events.manage", t))
      || (t.team === "women-sector" && sectorForGender(p.gender) === "women") || scopeMatches(t, scopes)
      || (t.team === "university-team" && scopeMatches({ ...t, team: null }, scopes)));
  }).map(({ id, fullName, university }) => ({ id, fullName, university }));
}

function progressValue(value) {
  if (value == null || value === "") return null;
  if (!["planned", "completed", "cancelled"].includes(value)) throw new TeamError("اختر حالة فعالية صحيحة.");
  return value;
}

export function createEventsHandler(store, platformStore) {
  return async (request) => {
    try {
      const actor = await requireActor(request, { teamStore: store, platformStore });
      const { isTest } = actor;
      const options = operationScopes(actor, "events.create");
      const present = (e) => ({ ...e, canEdit: editable(actor, e), canDelete: deletable(actor, e), canPublish: can(actor, "events.publish", eventTarget(e)) || (isLegacyUntagged(e) && hasWideEventRight(actor, "events.publish", e)) });
      if (request.method === "GET") {
        if (!canAny(actor, "events.view") && !options.length) throw forbidden();
        const events = canAny(actor, "events.view") ? await store.listEvents(isTest, actor.permissions) : [];
        const editTargets = events.filter((e) => editable(actor, e)).map(eventTarget);
        const volunteers = options.length || editTargets.length ? await responsibleOptions(platformStore, actor, [...options, ...editTargets]) : [];
        return json({ events: events.map(present), volunteers, scopes: options.map((s) => ({ ...s, canPublish: can(actor, "events.publish", eventTarget(s)) })), canCreate: options.length > 0 });
      }
      if (!["POST", "PUT", "DELETE"].includes(request.method)) return json({ error: "طلب غير متاح." }, 405);
      const input = await readInput(request);
      const creating = request.method === "POST";
      if (!creating) recordVersion(input);
      const existing = creating ? null : await store.eventById(input.id);
      if (!creating && (!existing || existing.isTest !== isTest)) throw new TeamError("تعذر العثور على السجل. حدّث القائمة.", 409, "CONFLICT");
      const scope = creating ? creationScope(actor, input.scope) : eventTarget(existing);
      const target = eventTarget(scope);
      if (request.method === "DELETE") {
        if (!deletable(actor, existing)) throw forbidden();
        await store.deleteEvent(input.id, input.revision);
        await platformStore.audit({ actor: actor.fullName, actorVolunteer: actor.volunteerId, action: "event.delete", details: { title: existing.title }, isTest });
        return json({ deleted: true });
      }
      if (!creating && !editable(actor, existing)) throw forbidden();
      if (!creating && input.scope && (eventTarget(input.scope).university !== target.university || (input.scope.sector || null) !== target.sector || (input.scope.team !== undefined && input.scope.team !== target.team)))
        throw forbidden("نطاق الفعالية مرتبط بالتكليف الذي سُجّلت من خلاله.");
      const event = validateEvent(input.event);
      const audience = input.audience === undefined ? existing?.audience || "private" : input.audience;
      if (!["private", "internal"].includes(audience)) throw new TeamError("اختر جمهورًا صحيحًا.");
      if (audience !== (existing?.audience || "private") && !can(actor, "events.publish", target) && !(existing && isLegacyUntagged(existing) && hasWideEventRight(actor, "events.publish", existing))) throw forbidden();
      if (event.responsibleId && event.responsibleId !== existing?.responsibleId) {
        const options = await responsibleOptions(platformStore, actor, [target]);
        if (!options.some((p) => p.id === event.responsibleId)) throw new TeamError("اختر مسؤولًا من القائمة المتاحة لهذه الفعالية.");
      }
      const progress = input.progress === undefined ? existing?.progress || null : progressValue(input.progress);
      if (progress === "completed" && (!event.eventDate || event.eventDate > todayInIstanbul())) throw new TeamError("اختر تاريخًا صحيحًا للفعالية المكتملة.");
      const saved = creating
        ? await store.createEvent(event, { ...scope, audience, progress, creatorId: actor.volunteerId, isTest })
        : await store.updateEvent(input.id, input.revision, event, { audience, progress });
      return json({ event: present(saved) }, creating ? 201 : 200);
    } catch (error) {
      return errorResponse(error);
    }
  };
}
