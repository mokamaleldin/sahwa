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
import { can, canAny, scopesFor, volunteerTargets, assignmentTarget, mayAssignRole, isGlobalAdmin } from "./access.js";

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

export function directoryGroups(person, assignments) {
  if (!assignments.length) return [person.university ? `الجامعات · ${person.university} · دون تكليف` : "دون تكليف"];
  return [...new Set(assignments.map((a) => {
    const role = roleById(a.roleId);
    return [a.university ? `الجامعات · ${a.university}` : "المركزي", TEAM_TITLES[role?.team], SECTORS[a.sector]].filter(Boolean).join(" · ");
  }))];
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
    const targetRole = roleById(query.roleId);
    const people = holders(realm, query).filter((a) => a.volunteerId !== selfId).map((a) => contactPerson(realm, a));
    return {
      relation: link.relation,
      label: link.label,
      phrase: link.phrase,
      targetTitle: roleTitle(query.roleId, query.sector),
      deferred: Boolean(targetRole?.deferred),
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
export function visibleToViewer(viewer, viewerAssignments, person, personAssignments, policy) {
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
  if (actor.kind === "owner") return { all: realm.people.map((p) => directoryCard(realm, p)), university: [], team: [], groups: [] };
  const viewer = realm.byId.get(actor.volunteerId);
  const viewerAssignments = realm.assignmentsByPerson.get(actor.volunteerId) || [];
  const viewerTeams = new Set(viewerAssignments.flatMap(teamKeys));
  const global = isGlobalAdmin(actor);
  const visible = realm.people
    .filter((p) => global || p.status !== "غير نشط" || p.id === viewer.id)
    .filter((p) => can(actor, "directory.view", volunteerTargets(p, realm.assignmentsByPerson.get(p.id))))
    .filter((p) => global || visibleToViewer(viewer, viewerAssignments, p, realm.assignmentsByPerson.get(p.id) || [], policy));
  const card = (p) => {
    const sameTeam = (realm.assignmentsByPerson.get(p.id) || []).some((a) => teamKeys(a).some((k) => viewerTeams.has(k)));
    const leadsOnly = p.sector && viewer.sector && p.sector !== viewer.sector && !sameTeam && policy !== "all";
    return directoryCard(realm, p, { leadsOnly });
  };
  const groups = viewerAssignments.map((assignment) => {
    const role = roleById(assignment.roleId);
    const key = teamKeys(assignment)[0];
    const contacts = resolveContacts(realm, assignment, viewer.id);
    const managers = new Set(contacts.links.filter((l) => l.relation === "reports" || l.relation === "team").flatMap((l) => l.people.map((p) => p.id)));
    const memberOf = (person) => (realm.assignmentsByPerson.get(person.id) || []).some((other) => {
      if (teamKeys(other).includes(key)) return true;
      return role?.level === "lead" && mayAssignRole({ ...actor, assignments: [assignment] }, other.roleId, assignmentTarget(other));
    });
    const peers = visible.filter((p) => p.id !== viewer.id && (managers.has(p.id) || memberOf(p)));
    return { id: assignment.id, title: roleTitle(assignment.roleId, assignment.sector), scope: scopeLabel(assignment),
      teamTitle: TEAM_TITLES[role?.team] || "", people: peers.map(card), managerIds: [...managers],
      canManage: role?.level === "lead" && can(actor, "roles.assign", assignmentTarget(assignment)) && canAny(actor, "volunteers.view") };
  });
  const teamIds = new Set(groups.flatMap((g) => g.people.map((p) => p.id)));
  return { all: visible.map(card), university: visible.filter((p) => viewer.university && p.university === viewer.university).map(card),
    team: visible.filter((p) => teamIds.has(p.id)).map(card), groups };

}

// A post or event is visible when its audience fields match one of the
// viewer's scopes (base record or any assignment). Null fields mean everyone.
export function viewerScopes(actor) {
  if (actor.kind === "owner") return null;
  return [
    { university: actor.university || null, sector: actor.sector, team: null },
    ...actor.assignments.map((a) => ({ ...assignmentTarget(a), sector: a.sector || actor.sector })),
  ];
}

export function audienceVisible(actor, university, sector, team = null) {
  const target = { university, sector, team };
  if (!can(actor, "community.view", target)) return false;
  const scopes = viewerScopes(actor);
  return scopes === null || scopes.some((s) => (!university || university === s.university) && (!sector || sector === s.sector) && (!team || team === s.team));
}

export function mayRemoveCommunityPost(actor, post) {
  return isGlobalAdmin(actor) || (Boolean(actor.volunteerId) && actor.volunteerId === post.authorVolunteer && canAny(actor, "posts.publish"));
}
export function presentCommunityPost(actor, post) {
  const { authorLabel, authorVolunteer, ...safe } = post;
  const editable = mayRemoveCommunityPost(actor, post);
  return { ...safe, canDelete: editable, canEdit: editable };
}
export function communityData(actor, posts, events, today) {
  const visible = posts.filter((p) => audienceVisible(actor, p.audienceUniversity, p.audienceSector, p.audienceTeam)).map(p => presentCommunityPost(actor, p));
  const visibleEvents = events.filter((e) => {
    if (e.audience === "private") return false;
    const teamAudience = ["internal-activities", "central-activities"].includes(e.team);
    return audienceVisible(actor, e.university || (teamAudience ? CENTRAL : null), e.sector, teamAudience ? e.team : null);
  });
  const weekStart = new Date(Date.parse(today) - 6 * 86400000).toISOString().slice(0, 10);
  const inWeek = (day) => day >= weekStart && day <= today;
  const scopes = scopesFor(actor, "posts.publish").map(({ university, sector, team }) => ({ university, sector, team }));
  return {
    news: visible.filter((p) => p.kind === "news" || p.kind === "current"),
    projects: visible.filter((p) => p.kind === "project" && (!p.happensOn || p.happensOn >= today)),
    achievements: visible.filter((p) => p.kind === "achievement" && inWeek(p.happensOn || new Date(p.createdAt).toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" }))),
    upcomingEvents: visibleEvents.filter((e) => e.eventDate >= today && e.progress !== "completed" && e.progress !== "cancelled").sort((a,b) => a.eventDate.localeCompare(b.eventDate)).map(({id,title,eventDate,university,sector})=>({id,title,eventDate,university,sector,responsible:""})),
    weekEvents: events.filter((e) => inWeek(e.eventDate) && e.progress === "completed" && canAny(actor, "community.view")).map(({id,title,eventDate,university,sector})=>({id,title,eventDate,university,sector,responsible:""})),
    manageablePosts: posts.filter(p=>mayRemoveCommunityPost(actor,p)).map(p=>presentCommunityPost(actor,p)),
    canPublish: scopes.length > 0,
    publishScopes: scopes.filter((s,i) => scopes.findIndex((p) => p.university === s.university && p.sector === s.sector && p.team === s.team) === i),
  };
}

export function workspaceData(actor) {
  const tools = [];
  const add = (permission, id, title, href, page = permission) => {
    if (canAny(actor, permission) && canAny(actor, page)) tools.push({ id, title, href });
  };
  add("volunteers.view", "volunteers", canAny(actor, "permissions.manage") ? "إدارة المتطوعين والحسابات" : "إدارة فريقي وحساباته", "/team/volunteers", "volunteers.open");
  add("events.view", "events", "سجل الفعاليات", "/team/events", "events.open");
  if ((canAny(actor, "relations.view") || canAny(actor, "relations.create")) && canAny(actor, "relations.open"))
    tools.push({ id: "relations", title: "سجل العلاقات", href: "/team/relations" });
  add("forms.manage", "forms", "إدارة النماذج", "/team/forms/manage");
  add("forms.review", "inbox", "الطلبات الواردة", "/team/forms/inbox", "inbox.open");
  add("posts.publish", "publish", "نشر مستجد", "/team/workspace/publish");
  add("studio.use", "studio", "استوديو صحوة", "/team/workspace/studio");
  if (canAny(actor, "audit.view") || canAny(actor, "settings.manage"))
    tools.push({ id: "audit", title: "سجل التغييرات والإعدادات", href: "/team/admin" });
  return tools;
}

export { ROLE_CATEGORIES };
