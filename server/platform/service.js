import {
  CENTRAL,

  ROLE_CATEGORIES,
  SECTORS,
  TEAM_TITLES,
  roleById,
  roleLinks,
  roleTitle,
  sectorForGender,
  teamKeys,
} from "../../shared/platform-roles.js";
import { can, canAny, scopesFor, volunteerTargets } from "./access.js";

export function scopeLabel(assignment) {
  const role = roleById(assignment.roleId);
  const parts = [];
  if (role?.scope === "university") parts.push(assignment.university || "جامعة غير محددة");
  else parts.push("مركزي");
  if (assignment.sector) parts.push(SECTORS[assignment.sector]);
  return parts.join(" — ");
}

export function describeAssignment(assignment) {
  const role = roleById(assignment.roleId);
  return {
    id: assignment.id,
    roleId: assignment.roleId,
    title: roleTitle(assignment.roleId, assignment.sector),
    number: role?.number ?? null,
    category: role?.category ?? null,
    team: role?.team ?? null,
    teamTitle: TEAM_TITLES[role?.team] || "",
    university: assignment.university,
    sector: assignment.sector,
    scope: scopeLabel(assignment),
    deferred: Boolean(role?.deferred),
    known: Boolean(role),
  };
}

// Everything of one realm (real or test) needed to resolve names. Test and
// real records never mix.
export async function loadRealm(store, isTest) {
  const [people, assignments, profiles] = await Promise.all([store.people(isTest), store.assignments(isTest), store.profiles(isTest)]);
  const byId = new Map(people.map((p) => [p.id, { ...p, sector: sectorForGender(p.gender) }]));
  const assignmentsByPerson = new Map();
  for (const a of assignments) {
    if (!byId.has(a.volunteerId)) continue;
    if (!assignmentsByPerson.has(a.volunteerId)) assignmentsByPerson.set(a.volunteerId, []);
    assignmentsByPerson.get(a.volunteerId).push(a);
  }
  return {
    people: [...byId.values()],
    byId,
    assignments: assignments.filter((a) => byId.has(a.volunteerId)),
    assignmentsByPerson,
    profiles: new Map(profiles.map((p) => [p.volunteerId, p])),
  };
}

function holders(realm, { roleId, sector, university }) {
  return realm.assignments.filter(
    (a) =>
      a.roleId === roleId &&
      (sector === undefined || a.sector === sector) &&
      (university === undefined || a.university === university),
  );
}

function linkTarget(link, assignment) {
  const target = roleById(link.target);
  const sector = target.sector === "youth" || target.sector === "women" ? target.sector : target.sector === "required" ? link.sector ?? assignment.sector : undefined;
  const university = target.scope === "university" ? (link.university === "same" ? assignment.university : undefined) : undefined;
  return { roleId: link.target, sector: target.sector === "none" ? undefined : sector, university };
}

const contactPerson = (realm, a) => {
  const person = realm.byId.get(a.volunteerId);
  return { id: person.id, name: person.fullName, role: roleTitle(a.roleId, a.sector), scope: scopeLabel(a) };
};

// Resolves each quoted relation to the people who currently hold the target
// role in the matching scope. A vacant role keeps its title with no name.
export function resolveContacts(realm, assignment, selfId) {
  const links = roleLinks(assignment.roleId, assignment.sector).map((link) => {
    const query = linkTarget(link, assignment);
    const people = holders(realm, query).filter((a) => a.volunteerId !== selfId).map((a) => contactPerson(realm, a));
    return {
      relation: link.relation,
      label: link.label,
      phrase: link.phrase,
      targetTitle: roleTitle(query.roleId, query.sector),
      people,
      vacant: people.length === 0,
    };
  });
  // Reverse reporting lines: people whose own quoted «يتبع» points at this assignment.
  const followers = [];
  for (const other of realm.assignments) {
    if (other.volunteerId === selfId) continue;
    for (const link of roleLinks(other.roleId, other.sector)) {
      if (link.relation !== "reports" || link.target !== assignment.roleId) continue;
      const query = linkTarget(link, other);
      if (query.sector !== undefined && query.sector !== assignment.sector) continue;
      if (query.university !== undefined && query.university !== assignment.university) continue;
      followers.push(contactPerson(realm, other));
    }
  }
  return { links, followers };
}

export function dashboardData(actor, realm, { eventsThisYear = null } = {}) {
  const person = realm.byId.get(actor.volunteerId);
  const assignments = realm.assignmentsByPerson.get(actor.volunteerId) || [];
  const teams = [...new Set(assignments.map((a) => TEAM_TITLES[roleById(a.roleId)?.team]).filter(Boolean))];
  return {
    person: {
      fullName: person.fullName,
      university: person.university,
      major: person.major,
      membershipLevel: person.membershipLevel,
      status: person.status,
      teams,
      username: actor.username,
    },
    roles: assignments.map((a) => ({ ...describeAssignment(a), contacts: resolveContacts(realm, a, actor.volunteerId) })),
    eventsThisYear,
  };
}

// Directory visibility. Same sector is visible; the other sector only shows
// official lead role holders by default (setting "leads"), or nobody ("none").
// Shared teams (media, relations) show their members to each other.
function visibleToViewer(viewer, viewerAssignments, person, personAssignments, policy) {
  if (person.id === viewer.id) return true;
  if (!person.sector || !viewer.sector || person.sector === viewer.sector) return true;
  const viewerTeams = new Set(viewerAssignments.flatMap(teamKeys));
  if (personAssignments.some((a) => teamKeys(a).some((k) => viewerTeams.has(k)))) return true;
  if (policy === "all") return true;
  if (policy === "leads") return personAssignments.some((a) => roleById(a.roleId)?.level === "lead");
  return false;
}

const DIRECTORY_FIELDS = new Set(["major", "bio", "skills", "work"]);

export function directoryCard(realm, person, { leadsOnly = false } = {}) {
  const profile = realm.profiles.get(person.id);
  const shown = new Set((profile?.directoryFields || []).filter((f) => DIRECTORY_FIELDS.has(f)));
  const assignments = (realm.assignmentsByPerson.get(person.id) || []).filter((a) => !leadsOnly || roleById(a.roleId)?.level === "lead");
  return {
    id: person.id,
    name: profile?.displayName || person.fullName,
    university: person.university,
    sector: person.sector,
    major: shown.has("major") && !leadsOnly ? person.major : "",
    bio: shown.has("bio") && !leadsOnly ? profile?.bio || "" : "",
    skills: shown.has("skills") && !leadsOnly ? profile?.skills || "" : "",
    work: shown.has("work") && !leadsOnly ? profile?.work || "" : "",
    roles: assignments.map((a) => ({ title: roleTitle(a.roleId, a.sector), scope: scopeLabel(a), team: TEAM_TITLES[roleById(a.roleId)?.team] || "" })),
    profileUrl: profile?.isPublic && profile?.handle && !leadsOnly ? `/u/${profile.handle}` : "",
  };
}

export function directoryData(actor, realm, policy = "leads") {
  if (actor.kind !== "account") return { all: [], university: [], team: [] };
  const viewer = realm.byId.get(actor.volunteerId);
  const viewerAssignments = realm.assignmentsByPerson.get(actor.volunteerId) || [];
  const viewerTeams = new Set(viewerAssignments.flatMap(teamKeys));
  const visible = realm.people
    .filter((p) => p.status !== "غير نشط" || p.id === viewer.id)
    .filter((p) => can(actor, "directory.view", volunteerTargets(p, realm.assignmentsByPerson.get(p.id))))
    .filter((p) => visibleToViewer(viewer, viewerAssignments, p, realm.assignmentsByPerson.get(p.id) || [], policy));
  const card = (p) => {
    const sameTeam = (realm.assignmentsByPerson.get(p.id) || []).some((a) => teamKeys(a).some((k) => viewerTeams.has(k)));
    const leadsOnly = p.sector && viewer.sector && p.sector !== viewer.sector && !sameTeam && policy !== "all";
    return directoryCard(realm, p, { leadsOnly });
  };
  return {
    all: visible.map(card),
    university: visible.filter((p) => viewer.university && p.university === viewer.university).map(card),
    team: visible
      .filter((p) => p.id !== viewer.id && (realm.assignmentsByPerson.get(p.id) || []).some((a) => teamKeys(a).some((k) => viewerTeams.has(k))))
      .map(card),
  };
}

// A post or event is visible when its audience fields match one of the
// viewer's scopes (base record or any assignment). Null fields mean everyone.
export function viewerScopes(actor) {
  if (actor.kind === "shared") return null;
  return [
    { university: actor.university || null, sector: actor.sector },
    ...actor.assignments.map((a) => ({ university: a.university || CENTRAL, sector: a.sector || actor.sector })),
  ];
}

export function audienceVisible(actor, university, sector) {
  const scopes = viewerScopes(actor);
  if (scopes === null) return true;
  return scopes.some((s) => (!university || university === s.university) && (!sector || sector === s.sector));
}

export function communityData(actor, posts, events, today) {
  const visiblePosts = posts.filter((p) => audienceVisible(actor, p.audienceUniversity, p.audienceSector));
  const visibleEvents = events.filter((e) => audienceVisible(actor, e.university, e.sector));
  const weekAgo = new Date(new Date(`${today}T00:00:00Z`).getTime() - 7 * 86400000).toISOString().slice(0, 10);
  const byKind = (kind) => visiblePosts.filter((p) => p.kind === kind);
  return {
    news: byKind("news"),
    current: byKind("current"),
    projects: byKind("project"),
    achievements: byKind("achievement"),
    opportunities: byKind("opportunity"),
    upcomingEvents: visibleEvents.filter((e) => e.eventDate && e.eventDate >= today).reverse(),
    weekEvents: visibleEvents.filter((e) => e.eventDate && e.eventDate < today && e.eventDate >= weekAgo),
    canPublish: canAny(actor, "posts.publish"),
    publishScopes: scopesFor(actor, "posts.publish").map((s) => ({ university: s.university, sector: s.sector })),
  };
}

// Workspace tools are listed by real permissions; deferred categories only
// show a «later» notice to holders of those roles.
export function workspaceData(actor) {
  const has = (p) => canAny(actor, p);
  const roleIds = new Set(actor.assignments.map((a) => a.roleId));
  const tools = [];
  const add = (category, tool) => tools.push({ category, ...tool });
  const global = actor.kind === "shared" || roleIds.has("sahwa-lead");
  const HOME = [
    ["sahwa-lead", "sahwa-admin"], ["women-sector-lead", "women-admin"], ["university-youth-lead", "universities"], ["university-women-lead", "universities"],
    ["internal-activities-lead", "internal-activities"], ["internal-activities-member", "internal-activities"], ["central-activities-lead", "central-activities"],
    ["central-activities-member", "central-activities"], ["university-relations-lead", "university-relations"], ["university-relations-member", "university-relations"],
    ["central-relations-lead", "central-relations"], ["central-relations-member", "central-relations"], ["media-lead", "media"], ["media-member", "media"],
  ];
  const home = global ? "sahwa-admin" : HOME.find(([roleId]) => roleIds.has(roleId))?.[1] || "sahwa-admin";
  if (has("accounts.view") || has("permissions.manage") || has("audit.view"))
    add(home, { id: "admin", title: "لوحة التحكم الإدارية", description: "الحسابات والأدوار والصلاحيات وسجل التغييرات.", href: "/team/admin" });
  if (has("volunteers.view"))
    add(home, { id: "volunteers", title: "إدارة المتطوعين", description: "سجل المتطوعين في نطاقك وأدوارهم وحساباتهم.", href: "/team/volunteers" });
  if (has("events.view")) add(home, { id: "events", title: "سجل الفعاليات", description: "الفعاليات المسجلة في نطاقك.", href: "/team/events" });
  if (has("forms.review") || actor.assignments.some((a) => ["internal-activities-lead", "central-activities-lead", "university-relations-lead", "central-relations-lead", "media-lead"].includes(a.roleId)))
    add("requests", { id: "inbox", title: "الطلبات الواردة", description: "الأفكار والطلبات الموجهة إليك بحسب نطاقك.", href: "/team/forms/inbox" });
  if (has("files.view")) add("files", { id: "files", title: "الملفات الأساسية", description: "مجلدات صحوة المشتركة.", href: "/team/files" });
  if (has("studio.use")) add("studio", { id: "studio", title: "استوديو صحوة", description: "القوالب وأدوات التصميم بهوية صحوة.", href: "/studio" });

  const CATEGORIES = [
    { id: "sahwa-admin", title: "إدارة صحوة" },
    { id: "women-admin", title: "إدارة قطاع الطالبات" },
    { id: "universities", title: "إدارة الجامعات" },
    { id: "internal-activities", title: "الأنشطة الداخلية" },
    { id: "central-activities", title: "الأنشطة المركزية" },
    { id: "university-relations", title: "العلاقات الجامعية" },
    { id: "central-relations", title: "العلاقات العامة المركزية" },
    { id: "media", title: "الإعلام" },
    { id: "requests", title: "الطلبات الواردة" },
    { id: "files", title: "الملفات" },
    { id: "studio", title: "استوديو صحوة" },
    { id: "finance", title: "المالية", later: true, role: "finance-lead" },
    { id: "archive", title: "التوثيق والأرشفة", later: true, role: "archive-lead" },
    { id: "review", title: "المتابعة والمراجعة والتظلمات", later: true, roles: ["review-lead", "review-member"] },
  ];
  const later = CATEGORIES.filter((c) => c.later && (global || roleIds.has(c.role) || (c.roles || []).some((r) => roleIds.has(r))));
  return {
    categories: CATEGORIES.filter((c) => !c.later)
      .map((c) => ({ id: c.id, title: c.title, tools: tools.filter((t) => t.category === c.id) }))
      .filter((c) => c.tools.length),
    later: later.map((c) => ({ id: c.id, title: c.title })),
  };
}

export { ROLE_CATEGORIES };
