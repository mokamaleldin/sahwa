import { recordVersion, validateEvent, TeamError } from "./team-data.js";
import { json, readInput, errorResponse } from "./http.js";
import { requireActor, forbidden } from "./platform/session.js";
import { can, canAny, eventTarget, scopesFor, volunteerTargets } from "./platform/access.js";
import { CENTRAL, sectorForGender } from "../shared/platform-roles.js";

function readScope(input, fallback) {
  const raw = input && typeof input === "object" ? input : fallback;
  const university = typeof raw?.university === "string" && raw.university && raw.university !== CENTRAL ? raw.university.slice(0, 120) : null;
  const sector = raw?.sector === "youth" || raw?.sector === "women" ? raw.sector : null;
  return { university, sector };
}

// Event records are scoped by university and sector. An event stays private
// until its owner chooses an internal audience for «أهل صحوة».
export function createEventsHandler(store, platformStore) {
  const stores = { teamStore: store, platformStore };
  return async (request) => {
    try {
      const actor = await requireActor(request, stores);
      if (!canAny(actor, "events.view")) throw forbidden("سجل الفعاليات متاح للأدوار المعنية فقط.");
      const isTest = actor.isTest;
      if (request.method === "GET") {
        const [events, people] = await Promise.all([store.listEvents(isTest), store.listResponsibleVolunteers(isTest)]);
        const createScopes = scopesFor(actor, "events.create");
        const visibleEvents = events
          .filter((e) => can(actor, "events.view", eventTarget(e)))
          .map(({ isTest: _hidden, ...e }) => ({
            ...e,
            canEdit: can(actor, "events.edit", eventTarget(e)),
            canDelete: can(actor, "events.delete", eventTarget(e)),
          }));
        const volunteers = people
          .filter((p) => {
            const sector = sectorForGender(p.gender);
            return can(actor, "volunteers.view", volunteerTargets({ ...p, sector }))
              || createScopes.some((s) => (s.university === null || s.university === CENTRAL || s.university === p.university) && (s.sector === null || s.sector === sector));
          })
          .map(({ gender: _g, ...p }) => p);
        return json({
          events: visibleEvents,
          volunteers,
          scopes: createScopes.map(({ university, sector }) => ({ university, sector })),
          canCreate: createScopes.length > 0,
        });
      }
      if (!["POST", "PUT", "DELETE"].includes(request.method)) return json({ error: "طريقة طلب غير متاحة." }, 405);
      const input = await readInput(request);
      if (request.method === "POST") {
        const event = validateEvent(input.event);
        const scope = readScope(input.scope, scopesFor(actor, "events.create")[0]);
        const target = eventTarget(scope);
        if (!can(actor, "events.create", target)) throw forbidden("لا تملك صلاحية إضافة فعالية في هذا النطاق.");
        const audience = input.audience === "internal" ? "internal" : "private";
        const saved = await store.createEvent(event, { ...scope, audience, isTest });
        return json({ event: { ...saved, canEdit: true, canDelete: can(actor, "events.delete", target) } }, 201);
      }
      recordVersion(input);
      const existing = await store.eventById(input.id);
      if (!existing || existing.isTest !== isTest) throw new TeamError("تم تعديل السجل من جهاز آخر، أو لم يعد موجودًا. حدّث القائمة وافتحه من جديد.", 409, "CONFLICT");
      const target = eventTarget(existing);
      if (request.method === "DELETE") {
        if (!can(actor, "events.delete", target)) throw forbidden();
        await store.deleteEvent(input.id, input.revision);
        return json({ deleted: true });
      }
      if (!can(actor, "events.edit", target)) throw forbidden();
      const event = validateEvent(input.event);
      let saved = await store.updateEvent(input.id, input.revision, event);
      if (input.scope !== undefined || input.audience !== undefined) {
        const scope = input.scope !== undefined ? readScope(input.scope) : { university: existing.university, sector: existing.sector };
        if (!can(actor, "events.edit", eventTarget(scope))) throw forbidden("لا يمكنك نقل الفعالية إلى نطاق خارج صلاحياتك.");
        const audience = input.audience === "internal" ? "internal" : input.audience === "private" ? "private" : existing.audience;
        saved = await store.setEventScope(input.id, { ...scope, audience });
      }
      const { isTest: _hidden, ...publicEvent } = saved;
      return json({ event: { ...publicEvent, canEdit: true, canDelete: can(actor, "events.delete", eventTarget(saved)) } });
    } catch (error) {
      return errorResponse(error);
    }
  };
}
