// Central permission model: role defaults + scoped per-person overrides.
// Deny by default. A permission instance carries a scope
// {university, sector, team}; a null field means "any". A target matches an
// instance when every non-null scope field equals the target's field. Any
// matching deny override wins over every allow.
import { ASSIGNABLE_BY, CENTRAL, roleById } from "../../shared/platform-roles.js";

export const PERMISSIONS = [
  { key: "community.view", label: "عرض صفحة أهل صحوة", base: true },
  { key: "directory.view", label: "عرض دليل التعارف (فريق صحوة)", base: true },
  { key: "guide.view", label: "عرض دليل صحوة", base: true },
  { key: "forms.submit", label: "تقديم النماذج والاقتراحات", base: true },
  { key: "profile.edit", label: "تعديل الملف الشخصي", base: true },
  { key: "volunteers.view", label: "عرض سجل المتطوعين (إدارة)" },
  { key: "volunteers.create", label: "إضافة سجل متطوع" },
  { key: "volunteers.edit", label: "تعديل بيانات متطوع" },
  { key: "volunteers.archive", label: "أرشفة سجل متطوع" },
  { key: "roles.assign", label: "إسناد الأدوار وإنهاؤها" },
  { key: "accounts.view", label: "عرض حالة الحسابات" },
  { key: "accounts.create", label: "إنشاء حساب دخول" },
  { key: "accounts.reset", label: "إعادة ضبط كلمة المرور" },
  { key: "accounts.suspend", label: "إيقاف الحساب وإعادة تفعيله" },
  { key: "permissions.manage", label: "إدارة الصلاحيات الإضافية" },
  { key: "permissions.delegate", label: "تفويض صلاحيات يملكها" },
  { key: "audit.view", label: "عرض سجل التغييرات الإدارية" },
  { key: "settings.manage", label: "إدارة إعدادات المنصة" },
  { key: "events.view", label: "عرض سجل الفعاليات" },
  { key: "events.create", label: "إضافة فعالية" },
  { key: "events.edit", label: "تعديل فعالية" },
  { key: "events.delete", label: "حذف فعالية" },
  { key: "events.publish", label: "تحديد جمهور الفعالية داخليًا" },
  { key: "posts.publish", label: "نشر في أهل صحوة" },
  { key: "studio.use", label: "استخدام استوديو صحوة" },
  { key: "files.view", label: "الملفات الأساسية" },
  { key: "forms.review", label: "متابعة الطلبات الواردة" },
  { key: "forms.manage", label: "إدارة تعريفات النماذج" },
];
export const PERMISSION_KEYS = new Set(PERMISSIONS.map((p) => p.key));
const BASE = PERMISSIONS.filter((p) => p.base).map((p) => p.key);
// Never delegated by anyone but a global administrator.
export const NON_DELEGABLE = new Set(["permissions.manage", "permissions.delegate", "settings.manage", "forms.manage", "audit.view"]);

const U = "@university";
const S = "@sector";
const scope = (university = null, sector = null, team = null) => ({ university, sector, team });

// Default permissions per role. Only what the requirements document
// describes as uncontroversial is granted. Management of volunteers and
// accounts by leads other than مسؤول صحوة stays denied until it is
// granted explicitly from the admin panel.
const ROLE_DEFAULTS = {
  "sahwa-lead": PERMISSIONS.filter((p) => !p.base).map((p) => [p.key, scope()]),
  "women-sector-lead": [
    ["volunteers.view", scope(null, "women")],
    ["events.view", scope(null, "women")],
    ["events.create", scope(null, "women")],
    ["events.edit", scope(null, "women")],
    ["posts.publish", scope(null, "women")],
    ["studio.use", scope()],
    ["files.view", scope()],
  ],
  "university-youth-lead": [
    ["volunteers.view", scope(U, S)],
    ["events.view", scope(U, S)],
    ["events.create", scope(U, S)],
    ["events.edit", scope(U, S)],
    ["posts.publish", scope(U, S)],
    ["studio.use", scope()],
    ["files.view", scope()],
  ],
  "internal-activities-lead": [
    ["volunteers.view", scope(U, S, "internal-activities")],
    ["events.view", scope(U, S)],
    ["events.create", scope(U, S)],
    ["events.edit", scope(U, S)],
    ["studio.use", scope()],
    ["files.view", scope()],
  ],
  "internal-activities-member": [["events.view", scope(U, S)]],
  "central-activities-lead": [
    ["volunteers.view", scope(null, S, "central-activities")],
    ["events.view", scope(CENTRAL, S)],
    ["events.create", scope(CENTRAL, S)],
    ["events.edit", scope(CENTRAL, S)],
    ["studio.use", scope()],
    ["files.view", scope()],
  ],
  "central-activities-member": [["events.view", scope(CENTRAL, S)]],
  "university-relations-lead": [
    ["volunteers.view", scope(U, null, "university-relations")],
    ["studio.use", scope()],
    ["files.view", scope()],
  ],
  "central-relations-lead": [
    ["volunteers.view", scope(null, null, "central-relations")],
    ["studio.use", scope()],
    ["files.view", scope()],
  ],
  "media-lead": [
    ["volunteers.view", scope(null, null, "media")],
    ["studio.use", scope()],
    ["files.view", scope()],
  ],
};
ROLE_DEFAULTS["university-women-lead"] = ROLE_DEFAULTS["university-youth-lead"];

export function roleDefaults(roleId) {
  return ROLE_DEFAULTS[roleId] || [];
}

function fill(template, assignment) {
  const value = (field, token) => (template[field] === token ? assignment[field] ?? null : template[field]);
  return {
    university: value("university", U),
    sector: value("sector", S),
    team: template.team,
  };
}

// actor: { kind, isTest, volunteerId, assignments: [{roleId, university, sector}], grants: [...] }
export function buildPermissions(actor) {
  const allow = [];
  const deny = [];
  if (actor.kind === "owner") {
    for (const p of PERMISSIONS) allow.push({ permission: p.key, ...scope(), source: "owner" });
    return { allow, deny };
  }
  for (const key of BASE) allow.push({ permission: key, ...scope(), source: "base" });
  for (const assignment of actor.assignments || []) {
    for (const [permission, template] of roleDefaults(assignment.roleId))
      allow.push({ permission, ...fill(template, assignment), source: `role:${assignment.roleId}` });
  }
  for (const grant of actor.grants || []) {
    const entry = { permission: grant.permission, university: grant.university ?? null, sector: grant.sector ?? null, team: grant.team ?? null, source: `grant:${grant.id}` };
    (grant.effect === "deny" ? deny : allow).push(entry);
  }
  return { allow, deny };
}

export function scopeMatches(instance, target) {
  const targets = Array.isArray(target) ? target : [target];
  return targets.some((t) =>
    ["university", "sector", "team"].every((field) => instance[field] === null || instance[field] === undefined || instance[field] === (t?.[field] ?? null)),
  );
}

// Deny wins when it covers the target.
export function can(actor, permission, target = {}) {
  const { allow, deny } = actor.permissions;
  if (deny.some((d) => d.permission === permission && scopeMatches(d, target))) return false;
  return allow.some((a) => a.permission === permission && scopeMatches(a, target));
}

// Whether the actor holds the permission anywhere (for showing pages and tools).
export function canAny(actor, permission) {
  const { allow, deny } = actor.permissions;
  const allows = allow.filter((a) => a.permission === permission);
  if (!allows.length) return false;
  // A global deny removes the permission entirely.
  return !deny.some((d) => d.permission === permission && d.university === null && d.sector === null && d.team === null)
    && allows.some((a) => !deny.some((d) => d.permission === permission && covers(d, a)));
}

// Whether instance `outer` covers every target `inner` could match.
export function covers(outer, inner) {
  return ["university", "sector", "team"].every((field) => outer[field] === null || outer[field] === undefined || outer[field] === inner[field]);
}

// The allow instances of a permission that are not cancelled by a deny.
export function scopesFor(actor, permission) {
  return actor.permissions.allow.filter((a) => a.permission === permission && !actor.permissions.deny.some((d) => d.permission === permission && covers(d, a)));
}

export function isGlobalAdmin(actor) {
  return actor.kind === "owner" || actor.permissions.allow.some((a) => a.permission === "permissions.manage" && a.university === null && a.sector === null && a.team === null)
    && !actor.permissions.deny.some((d) => d.permission === "permissions.manage");
}

export function assignableRoles(actor) {
  if (isGlobalAdmin(actor)) return null; // every role
  const set = new Set();
  for (const assignment of actor.assignments || []) for (const roleId of ASSIGNABLE_BY[assignment.roleId] || []) set.add(roleId);
  return set;
}

export function mayAssignRole(actor, roleId) {
  const allowed = assignableRoles(actor);
  return allowed === null || allowed.has(roleId);
}

// A non-global actor may only act on accounts of people whose every active
// role is one the actor may assign, so nobody resets a higher official.
export function mayManagePerson(actor, targetAssignments) {
  if (isGlobalAdmin(actor)) return true;
  const allowed = assignableRoles(actor);
  return targetAssignments.every((a) => allowed.has(a.roleId));
}

// Scope targets of a volunteer: the base record and each active assignment.
export function volunteerTargets(volunteer, assignments = []) {
  const base = { university: volunteer.university || null, sector: volunteer.sector || null, team: null };
  return [
    base,
    ...assignments.map((a) => ({
      university: a.university || (roleById(a.roleId)?.scope === "central" ? CENTRAL : null),
      sector: a.sector || volunteer.sector || null,
      team: roleById(a.roleId)?.team || null,
    })),
  ];
}

export function eventTarget(event) {
  return { university: event.university || CENTRAL, sector: event.sector || null, team: null };
}

export const ADMIN_PERMISSIONS = ["accounts.view", "permissions.manage", "permissions.delegate", "audit.view", "settings.manage", "forms.manage"];
