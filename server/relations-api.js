import { can, canAny, scopesFor } from "./platform/access.js";
import { forbidden, requireActor } from "./platform/session.js";
import { errorResponse, json, readInput } from "./http.js";
import { TeamError, recordVersion, text } from "./team-data.js";
import { CENTRAL, roleById } from "../shared/platform-roles.js";
import { UNIVERSITIES } from "../shared/team-options.js";

const targetOf = (university) => ({ university: university || CENTRAL, team: university ? "university-relations" : "central-relations", sector: null });

function fields(input) {
  const name = text(input, "name", "اسم الجهة أو الشخص", 160, true);
  const kind = text(input, "kind", "نوع الجهة", 120);
  const reason = typeof input.reason === "string" ? input.reason.trim() : "";
  if (reason.length > 3000) throw new TeamError("التفاصيل طويلة جدًا.");
  const link = text(input, "link", "الرابط", 300);
  if (link && !URL.canParse(link)) throw new TeamError("أدخل رابطًا صحيحًا.");
  if (link && !["https:", "http:"].includes(new URL(link).protocol)) throw new TeamError("أدخل رابط ويب صحيحًا.");
  return { name, kind, reason, link };
}

export function createRelationsHandler(teamStore, platformStore) {
  return async (request) => {
    try {
      const actor = await requireActor(request, { teamStore, platformStore });
      if (!canAny(actor, "relations.view") && !canAny(actor, "relations.create")) throw forbidden();
      const [records, assignments] = await Promise.all([platformStore.relations(actor.isTest, actor.permissions), platformStore.assignments(actor.isTest)]);
      const canEdit = (r) => can(actor, "relations.edit", targetOf(r.university))
        && (can(actor, "relations.manage", targetOf(r.university)) || Boolean(actor.volunteerId && r.ownerId === actor.volunteerId));
      const teamMembers = assignments.filter((a) => roleById(a.roleId)?.category === "relations");
      if (request.method === "GET") {
        const places = new Set([CENTRAL, ...UNIVERSITIES, ...teamMembers.map((a) => a.university), ...scopesFor(actor, "relations.create").map((s) => s.university)]);
        const scopes = [...places].filter((u) => u && can(actor, "relations.create", targetOf(u === CENTRAL ? null : u)));
        const members = teamMembers.filter((a) => can(actor, "relations.manage", targetOf(a.university)));
        const names = members.length ? new Map((await platformStore.people(actor.isTest)).map((p) => [p.id, p.fullName])) : new Map();
        return json({ records: records.map((r) => ({ ...r, canEdit: canEdit(r), canAssign: can(actor, "relations.manage", targetOf(r.university)) })),
          scopes, members: members.map((a) => ({ id: a.volunteerId, name: names.get(a.volunteerId), university: a.university })) });
      }
      if (!["POST", "PUT"].includes(request.method)) return json({ error: "طلب غير متاح." },405);
      const input = await readInput(request);
      const creating = request.method === "POST";
      if (!creating) recordVersion(input);
      const record = creating ? null : records.find((r) => r.id === input.id);
      const university = creating ? text(input, "university", "الجامعة", 120) || null : record?.university;
      const target = targetOf(university);
      if (creating ? !can(actor, "relations.create", target) : !record || !canEdit(record)) throw forbidden();
      const previousOwner = creating ? actor.volunteerId : record.ownerId;
      const ownerId = input.ownerId === undefined ? previousOwner : input.ownerId || null;
      if (ownerId !== previousOwner && (!can(actor, "relations.manage", target)
        || (ownerId && !teamMembers.some((a) => a.volunteerId === ownerId && a.university === university)))) throw forbidden();
      const details = fields(input);
      if (creating) return json({ id: await platformStore.registerRelation(actor, university, details, ownerId) }, 201);
      await platformStore.updateRelation(actor, input.id, input.revision, details, ownerId);
      return json({ saved: true });
    } catch (error) { return errorResponse(error); }
  };
}
