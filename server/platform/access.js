// Central permission model: role defaults + scoped per-person overrides.
// Deny by default. A permission instance carries a scope
// {university, sector, team}; a null field means "any". A target matches an
// instance when every non-null scope field equals the target's field. Any
// matching deny override wins over every allow.
import { ASSIGNABLE_BY, CENTRAL, roleById } from "../../shared/platform-roles.js";

const PAGE_ACTIONS = {
  "volunteers.open": ["volunteers.view", "volunteers.create", "accounts.view"],
  "events.open": ["events.view", "events.create"],
  "relations.open": ["relations.view", "relations.create"],
  "inbox.open": ["forms.review"],
};

export const PERMISSIONS = [
  { key: "community.view", label: "عرض صفحة أهل صحوة", base: true },
  { key: "directory.view", label: "عرض دليل التعارف (فريق صحوة)", base: true },
  { key: "guide.view", label: "عرض دليل صحوة", base: true },
  { key: "forms.submit", label: "تقديم النماذج والاقتراحات", base: true },
  { key: "profile.edit", label: "تعديل الملف الشخصي", base: true },
  { key: "volunteers.open", label: "فتح صفحة إدارة الفريق" },
  { key: "events.open", label: "فتح صفحة الفعاليات" },
  { key: "relations.open", label: "فتح صفحة العلاقات" },
  { key: "inbox.open", label: "فتح صفحة الوارد" },
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
  { key: "events.view", label: "عرض سجل الفعاليات", base: true },
  { key: "events.create", label: "إضافة فعالية" },
  { key: "events.edit", label: "تعديل فعالية" },
  { key: "events.manage", label: "تعديل جميع الفعاليات في النطاق" },
  { key: "relations.view", label: "قراءة سجل العلاقات" },
  { key: "relations.create", label: "إضافة علاقة" },
  { key: "relations.edit", label: "تعديل العلاقات المكلف بها" },
  { key: "relations.manage", label: "تعديل جميع العلاقات في النطاق" },
  { key: "events.delete", label: "حذف فعالية" },
  { key: "events.publish", label: "تحديد جمهور الفعالية داخليًا" },
  { key: "posts.publish", label: "نشر في أهل صحوة" },
  { key: "studio.use", label: "استخدام استوديو صحوة" },
  { key: "files.view", label: "الملفات الأساسية", hidden: true },
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

const managedTeam = ["volunteers.view", "volunteers.create", "volunteers.edit", "roles.assign", "accounts.view", "accounts.create"];
const activities = ["events.view", "events.create", "events.edit", "events.publish", "posts.publish"];
const rights = (keys, target) => keys.map((key) => [key, target]);
const studio = ["studio.use", scope()];
const central = scope(CENTRAL, S, "central-activities");
const internal = scope(U, S, "internal-activities");
const campus = scope(U, S);
const women = scope(null, "women");
const media = scope(CENTRAL, null, "media");
const localRelations = scope(U, null, "university-relations");
const centralRelations = scope(CENTRAL, null, "central-relations");
const relationsLead = (target) => [
  ...rights([...managedTeam, "relations.view", "relations.create", "relations.edit", "relations.manage", "forms.review"], target), studio,
];

const ROLE_DEFAULTS = {
  "sahwa-lead": PERMISSIONS.filter((p) => !p.base && p.key !== "forms.review").map((p) => [p.key, scope()]).concat([["forms.review", scope(CENTRAL, null, "leadership")]]),
  "women-sector-lead": [
    ...rights([...managedTeam, ...activities, "events.manage", "events.delete", "forms.review", "accounts.reset", "accounts.suspend"], women),
    studio,
  ],
  "university-youth-lead": [
    ...rights([...managedTeam, ...activities, "events.manage", "events.delete", "forms.review", "accounts.reset", "accounts.suspend"], campus),
    studio,
  ],
  "internal-activities-lead": [
    ...rights([...managedTeam, "forms.review"], internal),
    ...rights(["events.view", "events.create", "events.publish", "posts.publish"], internal),
    ...rights(["events.edit", "events.manage", "events.delete"], campus),
    studio,
  ],
  "internal-activities-member": [],
  "central-activities-lead": [
    ...rights([...managedTeam, "forms.review"], central),
    ["volunteers.view", scope(null, S, "internal-activities")],
    ...rights(["events.view", "events.create", "events.publish", "posts.publish"], central),
    ...rights(["events.edit", "events.manage", "events.delete", "events.publish"], scope(null, S)),
    studio,
  ],
  "central-activities-member": [],
  "university-relations-lead": relationsLead(localRelations),
  "university-relations-member": [["relations.view", localRelations]],
  "central-relations-lead": [
    ...relationsLead(centralRelations),
    ...rights(["volunteers.view", "roles.assign", "accounts.view"], scope(null, null, "university-relations")),
  ],
  "central-relations-member": [["relations.view", centralRelations]],
  "media-lead": [...rights([...managedTeam, "forms.review"], media), studio],
};
ROLE_DEFAULTS["university-women-lead"] = ROLE_DEFAULTS["university-youth-lead"];

export function roleDefaults(roleId) {
  const defaults = ROLE_DEFAULTS[roleId] || [];
  const role = roleById(roleId);
  if (role?.level !== "lead" || defaults.some(([key]) => key === "events.create")) return defaults;
  const target = scope(role.scope === "university" ? U : CENTRAL, role.sector === "none" ? null : S, role.team);
  return [...defaults, ...rights(["events.create", "events.edit", "events.delete"], target)];
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
    for (const p of PERMISSIONS) allow.push({ permission: p.key, ...(p.key === "forms.review" ? scope(CENTRAL, null, "leadership") : scope()), source: "owner" });
    return { allow, deny };
  }
  for (const key of BASE) allow.push({ permission: key, ...scope(), source: "base" });
  const active = actor.status === "نشط";
  for (const assignment of active ? actor.assignments || [] : []) {
    const role = roleById(assignment.roleId);
    if (!role || (role.scope === "university" && !assignment.university)
      || (role.sector === "required" && !["youth", "women"].includes(assignment.sector))
      || (["youth","women"].includes(role.sector) && assignment.sector !== role.sector)) continue;
    for (const [permission, template] of roleDefaults(assignment.roleId))
      allow.push({ permission, ...fill(template, assignment), source: `role:${assignment.roleId}` });
  }
  for (const grant of actor.grants || []) {
    if (!PERMISSION_KEYS.has(grant.permission) || (!active && !BASE.includes(grant.permission))) continue;
    const entry = { permission: grant.permission, university: grant.university ?? null, sector: grant.sector ?? null, team: grant.team ?? null, source: `grant:${grant.id}` };
    (grant.effect === "deny" ? deny : allow).push(entry);
  }
  for (const [permission, actions] of Object.entries(PAGE_ACTIONS)) {
    for (const entry of allow.filter((a) => actions.includes(a.permission) &&
      !deny.some((d) => d.permission === a.permission && covers(d, a)))) {
      allow.push({ ...entry, permission });
    }
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

// Keep creation tied to one actual appointment or grant, including for
// people who hold several roles. Identical destinations appear only once.
export function operationScopes(actor, permission) {
  const scopes = [];
  for (const a of scopesFor(actor, permission)) {
    const team = a.team || (a.source.startsWith("role:") ? roleById(a.source.slice(5))?.team : null) || null;
    const target = { university: a.university, sector: a.sector, team };
    if (can(actor, permission, target) && !scopes.some((s) => s.university === target.university && s.sector === target.sector && s.team === team)) scopes.push(target);
  }
  return scopes;
}

export function denied(actor, permission, target) {
  return actor.permissions.deny.some((d) => d.permission === permission && scopeMatches(d, target));
}

export function isGlobalAdmin(actor) {
  return actor.kind === "owner" || (actor.assignments.some((a) => a.roleId === "sahwa-lead") && can(actor, "permissions.manage"));
}

export function assignmentTarget(a) {
  return { university: a.university || CENTRAL, sector: a.sector || null, team: roleById(a.roleId)?.team || null };
}

// Candidate scopes under which an actor may assign or manage a volunteer's role.
// For central, sector-neutral member roles (e.g. `media-member`), campus and
// sector leads may also assign/manage them for volunteers in their own campus/sector.
export function assignmentManageTargets(assignment, person = null) {
  const base = assignmentTarget(assignment);
  const role = roleById(assignment.roleId);
  const personSector = person ? (person.sector ?? null) : null;
  const targets = [base];
  if (!base.sector && personSector) targets.push({ ...base, sector: personSector });
  if (person && role?.scope === "central" && role.sector === "none" && role.level === "member") {
    targets.push({ university: person.university || null, sector: personSector, team: role.team });
  }
  return targets;
}

export function mayAssignRole(actor, roleId, target) {
  if (isGlobalAdmin(actor)) return !target || can(actor, "roles.assign", target);
  return actor.assignments.some((a) => {
    if (!ASSIGNABLE_BY[a.roleId]?.includes(roleId)) return false;
    if (!target) return canAny(actor, "roles.assign");
    const own = roleById(a.roleId);
    return (own.scope !== "university" || a.university === target.university)
      && (!a.sector || a.sector === target.sector)
      && can(actor, "roles.assign", target);
  });
}

export function isProtectedLead(assignments) {
  return assignments.some((a) => a.roleId === "sahwa-lead");
}

export function mayManagePerson(actor, assignments, permission, person = null) {
  if (isProtectedLead(assignments)) return false;
  if (isGlobalAdmin(actor)) return true;
  const personSector = person ? (person.sector ?? null) : null;
  const coversAll = assignments.every((a) =>
    assignmentManageTargets(a, person).some(
      (target) => mayAssignRole(actor, a.roleId, target) && (!permission || can(actor, permission, target)),
    ),
  );
  if (coversAll) return true;
  // Campus and sector leads may edit basic records or create initial accounts
  // for non-higher volunteers belonging to their campus/sector (for example,
  // a campus student who also works with central Media), while never managing
  // higher officials or people assigned to another university.
  if (person && (permission === "volunteers.edit" || permission === "accounts.create" || !permission)) {
    const base = { university: person.university || null, sector: personSector, team: null };
    const effective = permission || "volunteers.edit";
    if (!can(actor, effective, base)) return false;
    const hasHigherLead = assignments.some((a) => {
      const role = roleById(a.roleId);
      if (role?.level !== "lead") return false;
      const target = { ...assignmentTarget(a), sector: a.sector || personSector || null };
      return !mayAssignRole(actor, a.roleId, target);
    });
    if (hasHigherLead) return false;
    const actorUniversities = new Set(
      actor.assignments.filter((a) => roleById(a.roleId)?.scope === "university" && a.university).map((a) => a.university),
    );
    if (actorUniversities.size > 0 && assignments.some((a) => a.university && !actorUniversities.has(a.university))) return false;
    return true;
  }
  return false;
}

// Scope targets of a volunteer: always keep the person's campus/sector base
// alongside each active assignment, so university and sector leads always see
// every volunteer in their campus/sector even when the volunteer serves on a
// central team (e.g. Media) or a sector-neutral team (e.g. Relations).
export function volunteerTargets(volunteer, assignments = []) {
  const base = { university: volunteer.university || null, sector: volunteer.sector || null, team: null };
  const roleTargets = assignments.map((a) => ({ ...assignmentTarget(a), sector: a.sector || volunteer.sector || null }));
  return [base, ...roleTargets];
}

export function eventTarget(event) {
  return { university: event.university || CENTRAL, sector: event.sector || null, team: event.team || null };
}

export const ADMIN_PERMISSIONS = ["accounts.view", "permissions.manage", "permissions.delegate", "audit.view", "settings.manage", "forms.manage"];
