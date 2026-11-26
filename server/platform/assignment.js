import { CENTRAL, roleById, sectorForGender } from "../../shared/platform-roles.js";
import { TeamError } from "../team-data.js";
import { can, isGlobalAdmin, isProtectedLead, mayAssignRole } from "./access.js";

// The assignment's own scope, used both for validation and permission checks.
export function assignmentScope(role, person, input) {
  if (!role) throw new TeamError("اختر دورًا من التصنيفات المعتمدة.");
  let sector = null;
  if (role.sector === "youth" || role.sector === "women") sector = role.sector;
  else if (role.sector === "required") sector = (["youth", "women"].includes(input.sector) ? input.sector : null) || person.sector;
  if ((role.sector !== "none") && !sector) throw new TeamError("حدد القطاع (شباب/طالبات) لهذا الدور.");
  if (sector && person.sector && sector !== person.sector) throw new TeamError("قطاع الدور لا يطابق النوع المسجل لهذا الشخص.");
  const university = role.scope === "university" ? (typeof input.university === "string" ? input.university.trim().slice(0, 120) : "") || person.university || null : null;
  if (role.scope === "university" && !university) throw new TeamError("حدد الجامعة لهذا الدور.");
  return { university, sector, team: role.team, target: { university: university || CENTRAL, sector, team: role.team } };
}

// An existing volunteer may join a central team from any campus. Campus leads
// may recruit only from their campus, and protected leadership is never a target.
export function canRecruit(actor, person, assignments, roleId, university = null) {
  if (person.id === actor.volunteerId || person.archivedAt || isProtectedLead(assignments)) return false;
  const role = roleById(roleId);
  if (!role || !mayAssignRole(actor, roleId)) return false;
  const sector = sectorForGender(person.gender);
  if (["youth", "women"].includes(role.sector) && role.sector !== sector) return false;
  if (role.sector === "required" && !sector) return false;
  const scope = assignmentScope(role, { ...person, sector }, { university });
  if (!isGlobalAdmin(actor) && role.scope === "university" && person.university !== scope.university) return false;
  return mayAssignRole(actor, roleId, scope.target) && can(actor, "roles.assign", scope.target);
}
