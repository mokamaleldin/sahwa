import { test, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { testDatabase, person } from "./helpers/database.js";
import { hashPassword } from "../server/auth.js";
import { createAuthHandler } from "../server/auth-api.js";
import { createTeamHandler } from "../server/team-api.js";
import { createEventsHandler } from "../server/events-api.js";
import { createAdminHandler } from "../server/admin-api.js";
import { createAccountHandler, createPostsHandler } from "../server/account-api.js";
import { createRelationsHandler } from "../server/relations-api.js";
import { createFormsHandler } from "../server/forms-api.js";
import { createPlatformStore } from "../server/platform/store.js";
import { currentActor } from "../server/platform/session.js";
import { loadRealm, dashboardData, directoryData } from "../server/platform/service.js";

let db, store, platform, sharedHash;
const sharedEmail = "sahwa@example.invalid";
const sharedPassword = "shared-fixture-password";
const PASSWORD = "Fixture-Pass-2026";
let passwordHash;
const handlers = () => ({
  auth: createAuthHandler(store, platform),
  team: createTeamHandler(store, platform),
  events: createEventsHandler(store, platform),
  admin: createAdminHandler(store, platform),
  account: createAccountHandler(store, platform),
  posts: createPostsHandler(store, platform),
  forms: createFormsHandler(store, platform),
  relations: createRelationsHandler(store, platform),
});
const req = (path, method = "GET", input, cookie = "") =>
  new Request(`https://sahwa.world/api/${path}`, {
    method,
    headers: { cookie, origin: "https://sahwa.world", "Content-Type": "application/json" },
    ...(input === undefined ? {} : { body: JSON.stringify(input) }),
  });
const cookieOf = (response) => response.headers.get("set-cookie").split(";")[0];

before(async () => {
  const t = await testDatabase();
  db = t.db;
  store = t.store;
  platform = createPlatformStore(() => t.sql);
  sharedHash = await hashPassword(sharedPassword);
  passwordHash = await hashPassword(PASSWORD);
  process.env.SAHWA_SESSION_SECRET = "test-only-secret-at-least-32-characters";
});
beforeEach(async () => {
  await db.exec("TRUNCATE sahwa_shared_sessions,sahwa_account_sessions,sahwa_accounts,sahwa_role_assignments,sahwa_permission_grants,sahwa_audit_log,sahwa_form_submissions,sahwa_profiles,sahwa_posts,sahwa_volunteers,sahwa_login_limits,sahwa_events CASCADE");
  await db.query("INSERT INTO sahwa_accounts(id,volunteer_id,username,email,display_name,password_hash,must_change_password,is_owner) VALUES ('5a4f0000-0000-4000-8000-000000000001',NULL,'owner',$1,'المسؤول العام',$2,false,true) ON CONFLICT (id) DO UPDATE SET email=EXCLUDED.email,password_hash=EXCLUDED.password_hash,status='active'", [sharedEmail, sharedHash]);
});
after(async () => db.close());

// Creates a volunteer with assignments and an active account; returns its session cookie.
async function member(name, { university = "استنيا", gender = "شاب", roles = [], isTest = false, account = true, status = "نشط" } = {}) {
  const saved = await store.createVolunteer(person({ fullName: name, university, gender, status }), { isTest });
  for (const role of roles)
    await platform.addAssignment({ volunteerId: saved.id, roleId: role.roleId, university: role.university ?? null, sector: role.sector ?? null, assignedBy: "test" });
  if (!account) return { id: saved.id };
  const username = `u${randomUUID().slice(0, 8)}`;
  await platform.createAccount({ volunteerId: saved.id, username, passwordHash, mustChange: false, expiresAt: null, createdBy: "test" });
  const response = await handlers().auth(req("auth", "POST", { identifier: username, password: PASSWORD }));
  assert.equal(response.status, 200, `login ${name}`);
  return { id: saved.id, username, cookie: cookieOf(response) };
}
const grant = (volunteerId, permission, scope = {}, effect = "allow") =>
  platform.addGrant({ volunteerId, permission, effect, university: scope.university ?? null, sector: scope.sector ?? null, team: scope.team ?? null, reason: "test", expiresAt: null, grantedBy: "test", grantedByVolunteer: null });

test("username accounts sign in, start with a forced password change, and change it", async () => {
  const { auth, account, team } = handlers();
  const saved = await store.createVolunteer(person({ fullName: "مسؤول جديد" }));
  await platform.createAccount({ volunteerId: saved.id, username: "new.lead", passwordHash, mustChange: true, expiresAt: new Date(Date.now() + 86400000).toISOString(), createdBy: "test" });
  assert.equal((await auth(req("auth", "POST", { identifier: "new.lead", password: "wrong-password" }))).status, 401);
  const login = await auth(req("auth", "POST", { identifier: "NEW.LEAD", password: PASSWORD }));
  assert.equal(login.status, 200);
  const cookie = cookieOf(login);
  const me = await (await auth(req("auth", "GET", undefined, cookie))).json();
  assert.equal(me.user.mustChangePassword, true);
  assert.equal((await team(req("team", "GET", undefined, cookie))).status, 403, "everything else waits for the password change");
  assert.equal((await account(req("account", "POST", { currentPassword: "nope", newPassword: "another-strong-pass" }, cookie))).status, 400);
  const changed = await account(req("account", "POST", { currentPassword: PASSWORD, newPassword: "another-strong-pass" }, cookie));
  assert.equal(changed.status, 200);
  assert.equal((await (await auth(req("auth", "GET", undefined, cookie))).json()).authenticated, false, "old sessions end after a password change");
  const fresh = cookieOf(changed);
  assert.equal((await (await auth(req("auth", "GET", undefined, fresh))).json()).user.mustChangePassword, false);
  const row = (await db.query("SELECT password_hash FROM sahwa_accounts WHERE username='new.lead'")).rows[0];
  assert.ok(row.password_hash.startsWith("scrypt$") && !row.password_hash.includes("another-strong-pass"));
});

test("the owner account signs in with its e-mail and acts as global administrator", async () => {
  const response = await handlers().auth(req("auth", "POST", { email: sharedEmail, password: sharedPassword }));
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.user.kind, "owner");
  assert.equal(data.user.nav.admin, true);
  assert.equal((await handlers().team(req("team", "GET", undefined, cookieOf(response)))).status, 200);
});

test("a university lead with delegated rights cannot reach another university through the API", async () => {
  const { team } = handlers();
  const lead = await member("مسؤول استنيا", { roles: [{ roleId: "university-youth-lead", university: "استنيا", sector: "youth" }] });
  for (const p of ["volunteers.create", "volunteers.edit"]) await grant(lead.id, p, { university: "استنيا", sector: "youth" });
  const outsider = await store.createVolunteer(person({ fullName: "طالب بيلجي", university: "بيلجي" }));
  const women = await store.createVolunteer(person({ fullName: "طالبة استنيا", gender: "بنت" }));
  const listed = (await (await team(req("team", "GET", undefined, lead.cookie))).json()).volunteers.map((v) => v.fullName);
  assert.ok(listed.includes("مسؤول استنيا"));
  assert.ok(!listed.includes("طالب بيلجي") && !listed.includes("طالبة استنيا"), "search never shows people outside the scope");
  assert.equal((await team(req("team", "POST", { person: person({ fullName: "جديد", university: "بيلجي" }) }, lead.cookie))).status, 403);
  assert.equal((await team(req("team", "POST", { person: person({ fullName: "جديدة", gender: "بنت" }) }, lead.cookie))).status, 403);
  assert.equal((await team(req("team", "POST", { person: person({ fullName: "عضو جديد" }) }, lead.cookie))).status, 201);
  assert.equal((await team(req("team", "PUT", { id: outsider.id, revision: outsider.revision, person: person({ fullName: "تعديل", university: "بيلجي" }) }, lead.cookie))).status, 403, "changing an ID in the request exposes nothing");
  assert.equal((await team(req("team", "PUT", { id: women.id, revision: women.revision, person: person({ fullName: "تعديل", gender: "بنت" }) }, lead.cookie))).status, 403);
  const own = await store.createVolunteer(person({ fullName: "عضو استنيا" }));
  assert.equal((await team(req("team", "PUT", { id: own.id, revision: own.revision, person: person({ fullName: "نقل", university: "بيلجي" }) }, lead.cookie))).status, 403, "cannot move a record out of scope");
});

test("nobody escalates: no self-assignment, no higher roles, no resetting a higher official", async () => {
  const { admin } = handlers();
  const head = await member("مسؤول صحوة", { roles: [{ roleId: "sahwa-lead" }] });
  const activity = await member("مسؤول أنشطة", { roles: [{ roleId: "internal-activities-lead", university: "استنيا", sector: "youth" }] });
  await grant(activity.id, "roles.assign", { university: "استنيا", sector: "youth" });
  await grant(activity.id, "accounts.reset", { university: "استنيا", sector: "youth" });
  const target = await member("عضو", { account: false });
  assert.equal((await admin(req("admin", "POST", { action: "assign-role", volunteerId: target.id, roleId: "sahwa-lead" }, activity.cookie))).status, 403);
  assert.equal((await admin(req("admin", "POST", { action: "assign-role", volunteerId: target.id, roleId: "university-youth-lead", university: "استنيا" }, activity.cookie))).status, 403);
  assert.equal((await admin(req("admin", "POST", { action: "assign-role", volunteerId: activity.id, roleId: "internal-activities-member", university: "استنيا" }, activity.cookie))).status, 403, "no self-assignment");
  assert.equal((await admin(req("admin", "POST", { action: "assign-role", volunteerId: target.id, roleId: "internal-activities-member", university: "بيلجي" }, activity.cookie))).status, 403, "outside university");
  assert.equal((await admin(req("admin", "POST", { action: "assign-role", volunteerId: target.id, roleId: "internal-activities-member", university: "استنيا" }, activity.cookie))).status, 200);
  assert.equal((await admin(req("admin", "POST", { action: "reset-account", volunteerId: head.id }, activity.cookie))).status, 403, "cannot reset the head of Sahwa");
  assert.equal((await admin(req("admin", "POST", { action: "grant", volunteerId: activity.id, permission: "volunteers.view", reason: "self" }, activity.cookie))).status, 403);
  assert.equal((await admin(req("admin", "POST", { action: "grant", volunteerId: target.id, permission: "volunteers.view", reason: "x" }, activity.cookie))).status, 403, "no delegation without permissions.delegate");
  const levels = await admin(req("admin", "POST", { action: "set-level", volunteerId: head.id, level: "متطوع" }, activity.cookie));
  assert.equal(levels.status, 403);
});

test("delegation only passes on permissions the delegator holds, within scope", async () => {
  const { admin } = handlers();
  const lead = await member("مسؤول", { roles: [{ roleId: "university-youth-lead", university: "استنيا", sector: "youth" }] });
  await grant(lead.id, "permissions.delegate", { university: "استنيا", sector: "youth" });
  const helper = await member("مساعد", { account: false });
  assert.equal((await admin(req("admin", "POST", { action: "grant", volunteerId: helper.id, permission: "events.view", university: "استنيا", sector: "youth", reason: "تنسيق" }, lead.cookie))).status, 200);
  assert.equal((await admin(req("admin", "POST", { action: "grant", volunteerId: helper.id, permission: "events.view", university: "بيلجي", sector: "youth", reason: "x" }, lead.cookie))).status, 403);
  assert.equal((await admin(req("admin", "POST", { action: "grant", volunteerId: helper.id, permission: "volunteers.archive", university: "بيلجي", sector: "youth", reason: "x" }, lead.cookie))).status, 403, "outside archival scope");
  assert.equal((await admin(req("admin", "POST", { action: "grant", volunteerId: helper.id, permission: "permissions.manage", reason: "x" }, lead.cookie))).status, 403);
});

test("university and sector leads manage accounts strictly in their scope and never touch sahwa-lead", async () => {
  const { admin } = handlers();
  const head = await member("مسؤول صحوة", { roles: [{ roleId: "sahwa-lead" }] });
  const uniLead = await member("مسؤول استنيا", { roles: [{ roleId: "university-youth-lead", university: "استنيا", sector: "youth" }] });
  const ownVol = await member("طالب استنيا", { university: "استنيا", gender: "شاب", account: false });
  const otherVol = await member("طالب بيلجي", { university: "بيلجي", gender: "شاب", account: false });
  const womanVol = await member("طالبة استنيا", { university: "استنيا", gender: "بنت", account: false });
  const created = await admin(req("admin", "POST", { action: "create-account", volunteerId: ownVol.id, email: "own@sahwa.test", password: "Fixture-Pass-9x" }, uniLead.cookie));
  assert.equal(created.status, 201, "university lead creates accounts in their own university & sector");
  assert.equal((await admin(req("admin", "POST", { action: "create-account", volunteerId: otherVol.id, email: "other@sahwa.test", password: "Fixture-Pass-9x" }, uniLead.cookie))).status, 403, "cannot touch another university");
  assert.equal((await admin(req("admin", "POST", { action: "create-account", volunteerId: womanVol.id, email: "woman@sahwa.test", password: "Fixture-Pass-9x" }, uniLead.cookie))).status, 403, "cannot touch another sector");
  assert.equal((await admin(req("admin", "POST", { action: "reset-account", volunteerId: head.id }, uniLead.cookie))).status, 403, "cannot touch sahwa-lead");
  const listed = await (await admin(new Request("https://sahwa.world/api/admin?view=accounts", { headers: { cookie: uniLead.cookie } }))).json();
  assert.equal(listed.groups.length, 1);
  assert.equal(listed.groups[0].title, "استنيا");
  assert.ok(listed.groups[0].people.some((p) => p.fullName === "طالب استنيا"), "shows all volunteers in scope, not only officials");
});

test("account creation by the head of Sahwa reuses existing accounts and returns one-time credentials", async () => {
  const { admin, auth } = handlers();
  const head = await member("رئيس", { roles: [{ roleId: "sahwa-lead" }] });
  const lead = await member("أحمد محمد", { account: false, roles: [{ roleId: "university-youth-lead", university: "استنيا", sector: "youth" }] });
  const created = await admin(req("admin", "POST", { action: "create-account", volunteerId: lead.id }, head.cookie));
  assert.equal(created.status, 201);
  const body = await created.json();
  assert.equal(body.username, "ahmed.mohamed");
  assert.match(body.temporaryPassword, /^[a-z2-9]{4}-[a-z2-9]{4}-[a-z2-9]{4}$/);
  const again = await (await admin(req("admin", "POST", { action: "create-account", volunteerId: lead.id }, head.cookie))).json();
  assert.equal(again.existing, true);
  assert.ok(!("temporaryPassword" in again));
  assert.equal((await db.query("SELECT count(*)::int AS c FROM sahwa_accounts WHERE volunteer_id=$1", [lead.id])).rows[0].c, 1);
  const stored = (await db.query("SELECT password_hash FROM sahwa_accounts WHERE volunteer_id=$1", [lead.id])).rows[0].password_hash;
  assert.ok(!stored.includes(body.temporaryPassword));
  const audit = JSON.stringify((await db.query("SELECT details FROM sahwa_audit_log")).rows);
  assert.ok(!audit.includes(body.temporaryPassword), "secrets never reach the audit log");
  const login = await auth(req("auth", "POST", { identifier: body.username, password: body.temporaryPassword }));
  assert.equal(login.status, 200);
  assert.equal((await login.json()).user.mustChangePassword, true);
});

test("suspending an account or ending a role takes effect on the server immediately", async () => {
  const { admin, team, auth } = handlers();
  const head = await member("رئيس", { roles: [{ roleId: "sahwa-lead" }] });
  const lead = await member("مسؤول", { roles: [{ roleId: "university-youth-lead", university: "استنيا", sector: "youth" }] });
  assert.equal((await team(req("team", "GET", undefined, lead.cookie))).status, 200);
  const assignment = (await db.query("SELECT id FROM sahwa_role_assignments WHERE volunteer_id=$1", [lead.id])).rows[0].id;
  assert.equal((await admin(req("admin", "POST", { action: "end-role", assignmentId: assignment }, head.cookie))).status, 200);
  assert.equal((await team(req("team", "GET", undefined, lead.cookie))).status, 403, "ending the role removes its tools");
  assert.equal((await db.query("SELECT count(*)::int AS c FROM sahwa_volunteers WHERE id=$1", [lead.id])).rows[0].c, 1, "the person stays");
  assert.equal((await admin(req("admin", "POST", { action: "suspend-account", volunteerId: lead.id }, head.cookie))).status, 200);
  assert.equal((await (await auth(req("auth", "GET", undefined, lead.cookie))).json()).authenticated, false);
  assert.equal((await auth(req("auth", "POST", { identifier: lead.username, password: PASSWORD }))).status, 403);
  assert.equal((await admin(req("admin", "POST", { action: "reactivate-account", volunteerId: lead.id }, head.cookie))).status, 200);
  assert.equal((await auth(req("auth", "POST", { identifier: lead.username, password: PASSWORD }))).status, 200);
});

test("explicit deny overrides a role default and archived people lose access", async () => {
  const { team, auth } = handlers();
  const lead = await member("مسؤول", { roles: [{ roleId: "university-youth-lead", university: "استنيا", sector: "youth" }] });
  const g = await grant(lead.id, "volunteers.view", {}, "deny");
  assert.equal((await team(req("team", "GET", undefined, lead.cookie))).status, 403);
  await platform.revokeGrant(g, "test");
  assert.equal((await team(req("team", "GET", undefined, lead.cookie))).status, 200);
  const row = await platform.person(lead.id);
  await platform.archivePerson(lead.id, row.revision);
  assert.equal((await (await auth(req("auth", "GET", undefined, lead.cookie))).json()).authenticated, false);
});

test("accounts are created with e-mail and password, and sign in with e-mail or internal username", async () => {
  const { admin, auth } = handlers();
  const owner = cookieOf(await auth(req("auth", "POST", { identifier: sharedEmail, password: sharedPassword })));
  const lead = await member("سارة أحمد", { gender: "بنت", account: false, roles: [{ roleId: "women-sector-lead" }] });
  const created = await admin(req("admin", "POST", { action: "create-account", volunteerId: lead.id, email: "Sara@Sahwa.com", username: "sara.lead", password: "Fixture-Pass-9x", requireChange: false }, owner));
  assert.equal(created.status, 201);
  const body = await created.json();
  assert.equal(body.chosenPassword, true);
  assert.equal(body.temporaryPassword, undefined);
  for (const identifier of ["sara@sahwa.com", "SARA.LEAD"]) assert.equal((await auth(req("auth", "POST", { identifier, password: "Fixture-Pass-9x" }))).status, 200);
  const other = await member("آخر", { account: false });
  assert.equal((await admin(req("admin", "POST", { action: "create-account", volunteerId: other.id, email: "sara@sahwa.com", password: "Fixture-Pass-9x" }, owner))).status, 409, "e-mail unique");
  assert.equal((await admin(req("admin", "POST", { action: "create-account", volunteerId: other.id, username: "sara.lead", password: "Fixture-Pass-9x" }, owner))).status, 409, "username unique");
});

test("account creation supports an initial chosen password (still requiring change on first login) or auto-generated temporary password", async () => {
  const { admin, auth } = handlers();
  const head = await member("رئيس", { roles: [{ roleId: "sahwa-lead" }] });
  const lead = await member("خالد علي", { account: false, roles: [{ roleId: "media-lead" }] });
  assert.equal((await admin(req("admin", "POST", { action: "create-account", volunteerId: lead.id, email: "khaled@sahwa.com", password: "short" }, head.cookie))).status, 400);
  const created = await (await admin(req("admin", "POST", { action: "create-account", volunteerId: lead.id, email: "khaled@sahwa.com", password: "Fixture-Pass-9x", requireChange: false }, head.cookie))).json();
  assert.equal(created.chosenPassword, true);
  assert.equal(created.temporaryPassword, undefined);
  const login = await auth(req("auth", "POST", { identifier: "khaled@sahwa.com", password: "Fixture-Pass-9x" }));
  assert.equal(login.status, 200);
  assert.equal((await login.json()).user.mustChangePassword, true);
  assert.equal((await admin(req("admin", "POST", { action: "reset-account", volunteerId: lead.id, password: "short" }, head.cookie))).status, 400);
  const stored = (await db.query("SELECT password_hash FROM sahwa_accounts WHERE volunteer_id=$1", [lead.id])).rows[0].password_hash;
  assert.ok(!stored.includes("Fixture-Pass-9x"));
  const autoVol = await member("سالم نور", { account: false, roles: [{ roleId: "media-member" }] });
  const auto = await (await admin(req("admin", "POST", { action: "create-account", volunteerId: autoVol.id, email: "salem@sahwa.com" }, head.cookie))).json();
  assert.equal(auto.chosenPassword, false);
  assert.ok(auto.temporaryPassword);
  const autoLogin = await auth(req("auth", "POST", { identifier: "salem@sahwa.com", password: auto.temporaryPassword }));
  assert.equal(autoLogin.status, 200);
  assert.equal((await autoLogin.json()).user.mustChangePassword, true);
});

test("contacts resolve to the people actually assigned, update on reassignment, and show vacancies", async () => {
  const lead1 = await member("خالد", { roles: [{ roleId: "internal-activities-lead", university: "استنيا", sector: "youth" }], account: false });
  await member("ليلى", { gender: "بنت", roles: [{ roleId: "internal-activities-lead", university: "استنيا", sector: "women" }], account: false });
  await member("عمر", { university: "بيلجي", roles: [{ roleId: "internal-activities-lead", university: "بيلجي", sector: "youth" }], account: false });
  const m = await member("يوسف", { roles: [{ roleId: "internal-activities-member", university: "استنيا", sector: "youth" }] });
  const actorOf = async (cookie) => currentActor(req("auth", "GET", undefined, cookie), { teamStore: store, platformStore: platform });
  let data = dashboardData(await actorOf(m.cookie), await loadRealm(platform, false));
  const reports = data.roles[0].contacts.links.find((l) => l.relation === "reports");
  assert.equal(reports.phrase, "مسؤول الأنشطة الداخلية للشباب");
  assert.deepEqual(reports.people.map((p) => p.name), ["خالد"], "same university and sector only");
  const assignment = (await db.query("SELECT id FROM sahwa_role_assignments WHERE volunteer_id=$1", [lead1.id])).rows[0].id;
  await platform.endAssignment(assignment, "test");
  data = dashboardData(await actorOf(m.cookie), await loadRealm(platform, false));
  assert.equal(data.roles[0].contacts.links[0].vacant, true);
  await member("سعيد", { roles: [{ roleId: "internal-activities-lead", university: "استنيا", sector: "youth" }], account: false });
  data = dashboardData(await actorOf(m.cookie), await loadRealm(platform, false));
  assert.deepEqual(data.roles[0].contacts.links[0].people.map((p) => p.name), ["سعيد"]);
  const multi = await member("متعدد", { roles: [{ roleId: "internal-activities-lead", university: "بيلجي", sector: "youth" }, { roleId: "media-member" }] });
  const multiData = dashboardData(await actorOf(multi.cookie), await loadRealm(platform, false));
  assert.equal(multiData.roles.length, 2, "one card per role");
  assert.ok(multiData.roles.find((r) => r.roleId === "internal-activities-lead").contacts.followers.length === 0);
});

test("forms route by the submitter's real record; inactive and complaint forms are refused", async () => {
  const { forms } = handlers();
  const activityLead = await member("مسؤول أنشطة", { roles: [{ roleId: "internal-activities-lead", university: "استنيا", sector: "youth" }] });
  const otherLead = await member("مسؤول أنشطة بيلجي", { university: "بيلجي", roles: [{ roleId: "internal-activities-lead", university: "بيلجي", sector: "youth" }] });
  const volunteer = await member("متطوع", { roles: [{ roleId: "university-volunteer", university: "استنيا", sector: "youth" }] });
  const list = await (await forms(req("forms", "GET", undefined, volunteer.cookie))).json();
  const bank = list.forms.find((f) => f.slug === "activities-bank");
  assert.equal(bank.title, "بنك الأفكار");
  assert.ok(!list.forms.some((f) => f.slug === "complaints"));
  const submit = await forms(req("forms", "POST", { formId: bank.id, answers: { title: "رحلة", details: "تفاصيل", scope: "جامعي", participate: "نعم، أرغب في المشاركة فقط" }, routeUniversity: "بيلجي" }, volunteer.cookie));
  assert.equal(submit.status, 201);
  const leadInbox = await (await forms(new Request("https://sahwa.world/api/forms?view=inbox", { headers: { cookie: activityLead.cookie } }))).json();
  assert.equal(leadInbox.submissions.length, 1);
  assert.equal(leadInbox.submissions[0].answers.title, "رحلة");
  assert.ok(leadInbox.scopeLabel.includes("استنيا"));
  const uniLead = await member("مسؤول استنيا", { roles: [{ roleId: "university-youth-lead", university: "استنيا", sector: "youth" }] });
  const uniInbox = await (await forms(new Request("https://sahwa.world/api/forms?view=inbox", { headers: { cookie: uniLead.cookie } }))).json();
  assert.equal(uniInbox.submissions.length, 1, "university lead receives their university's submissions");
  const otherInbox = await (await forms(new Request("https://sahwa.world/api/forms?view=inbox", { headers: { cookie: otherLead.cookie } }))).json();
  assert.equal(otherInbox.submissions.length, 0, "a client-supplied university does not reroute the request");
  const complaints = (await db.query("SELECT id FROM sahwa_form_definitions WHERE slug='complaints'")).rows[0].id;
  assert.equal((await forms(req("forms", "POST", { formId: complaints, answers: { kind: "x", details: "y" } }, volunteer.cookie))).status, 409);
  await db.query("UPDATE sahwa_form_definitions SET active=true WHERE slug='complaints'");
  assert.equal((await forms(req("forms", "POST", { formId: complaints, answers: { kind: "x", details: "y" } }, volunteer.cookie))).status, 409, "confidential path stays closed even if toggled in the database");
  const owner = await handlers().auth(req("auth", "POST", { email: sharedEmail, password: sharedPassword }));
  const save = await forms(req("forms", "PUT", { action: "save-form", id: complaints, revision: 1, form: { title: "الشكاوى", fields: [{ id: "kind", label: "نوع", type: "short_text" }], active: true } }, cookieOf(owner)));
  assert.equal(save.status, 409);
  const mine = await (await forms(req("forms", "GET", undefined, volunteer.cookie))).json();
  assert.equal(mine.submissions.length, 1);
  assert.equal((await forms(req("forms","DELETE",{id:mine.submissions[0].id},volunteer.cookie))).status,200);
  assert.equal((await (await forms(req("forms","GET",undefined,volunteer.cookie))).json()).submissions.length,0);
  assert.ok(await platform.submission(mine.submissions[0].id), "recipient retains the record");
});

test("profiles: unique handles, private by default, public projection only, unpublish blocks access", async () => {
  const { account } = handlers();
  const a = await member("سارة", { gender: "بنت" });
  const b = await member("مريم", { gender: "بنت" });
  const save = (cookie, profile) => account(req("account", "PUT", { profile }, cookie));
  assert.equal((await save(a.cookie, { handle: "sara", bio: "نبذة", isPublic: true, publicFields: ["university"] })).status, 200);
  assert.equal((await save(b.cookie, { handle: "sara" })).status, 409);
  assert.equal((await save(b.cookie, { handle: "admin" })).status, 400);
  assert.equal((await save(b.cookie, { links: [{ label: "x", url: "javascript:alert(1)" }] })).status, 400);
  const pub = await platform.publicProfile("sara");
  assert.equal(pub.bio, "نبذة");
  assert.ok(!("phone" in pub));
  await save(a.cookie, { handle: "sara", isPublic: false });
  assert.equal(await platform.publicProfile("sara"), undefined);
  const minor = await store.createVolunteer(person({ fullName: "قاصر", birthDate: "2015-01-01" }));
  await platform.createAccount({ volunteerId: minor.id, username: "minor.one", passwordHash, mustChange: false, expiresAt: null, createdBy: "t" });
  const login = await handlers().auth(req("auth", "POST", { identifier: "minor.one", password: PASSWORD }));
  assert.equal((await save(cookieOf(login), { handle: "minor1", isPublic: true })).status, 400);
});

test("directory keeps sectors apart by default and shows only allowed fields", async () => {
  const viewer = await member("شاب", { roles: [{ roleId: "university-volunteer", university: "استنيا", sector: "youth" }] });
  await member("شاب آخر", { university: "بيلجي", account: false });
  await member("طالبة", { gender: "بنت", account: false });
  await member("مسؤولة", { gender: "بنت", roles: [{ roleId: "university-women-lead", university: "استنيا", sector: "women" }], account: false });
  await member("جنة", { gender: "بنت", university: "استنيا", roles: [{ roleId: "university-relations-lead", university: "استنيا", sector: null }], account: false });
  await member("زميلة إعلام", { gender: "بنت", roles: [{ roleId: "media-member" }], account: false });
  await member("غير نشط", { status: "غير نشط", account: false });
  const actor = await currentActor(req("auth", "GET", undefined, viewer.cookie), { teamStore: store, platformStore: platform });
  const realm = await loadRealm(platform, false);
  const allCards = directoryData(actor, realm, "leads").all;
  const names = allCards.map((c) => c.name);
  assert.ok(names.includes("شاب آخر"), "across universities");
  assert.ok(!names.includes("طالبة"));
  assert.ok(names.includes("مسؤولة"), "official leads stay reachable");
  assert.ok(!names.includes("غير نشط"));
  assert.ok(!directoryData(actor, realm, "none").all.some((c) => c.name === "مسؤولة"));
  const janna = allCards.find((c) => c.name === "جنة");
  assert.equal(janna.roles[0].title, "مسؤولة العلاقات الجامعية");
  assert.equal(janna.roles[0].university, "استنيا");
  const card = allCards.find((c) => c.name === "شاب آخر");
  assert.ok(!("phone" in card) && !("birthDate" in card) && !("status" in card));
});

test("global Sahwa lead directory matches the non-archived register without exposing administrative fields", async () => {
  const head = await member("المسؤول العام", { roles: [{ roleId: "sahwa-lead" }] });
  await member("متطوعة", { gender: "بنت", account: false });
  await member("غير نشط", { status: "غير نشط", account: false });
  const actor = await currentActor(req("auth", "GET", undefined, head.cookie), { platformStore: platform });
  const realm = await loadRealm(platform, false);
  const directory = directoryData(actor, realm, "leads").all;
  assert.equal(directory.length, realm.people.length);
  assert.ok(directory.every((card) => !("phone" in card) && !("birthDate" in card) && !("status" in card)));
});

test("event creation is scoped; everyone can read the register; community sharing stays private by default", async () => {
  const { events, posts } = handlers();
  const lead = await member("مسؤول", { roles: [{ roleId: "university-youth-lead", university: "استنيا", sector: "youth" }] });
  const other = await member("مسؤول بيلجي", { university: "بيلجي", roles: [{ roleId: "university-youth-lead", university: "بيلجي", sector: "youth" }] });
  const created = await events(req("events", "POST", { event: { title: "لقاء استنيا", eventDate: "2099-01-01" }, scope: { university: "بيلجي", sector: "youth" } }, lead.cookie));
  assert.equal(created.status, 403, "cannot create in another university");
  const ok = await events(req("events", "POST", { event: { title: "لقاء استنيا", eventDate: "2099-01-01" }, scope: { university: "استنيا", sector: "youth" } }, lead.cookie));
  assert.equal(ok.status, 201);
  assert.equal((await (await events(req("events", "GET", undefined, other.cookie))).json()).events.length, 1);
  const volunteer = await member("متطوع", { roles: [{ roleId: "university-volunteer", university: "استنيا", sector: "youth" }] });
  const readOnly = await (await events(req("events", "GET", undefined, volunteer.cookie))).json();
  assert.equal(readOnly.events.length, 1);
  assert.equal(readOnly.canCreate, false);
  assert.ok(readOnly.events.every((e) => e.canEdit === false && e.canDelete === false));
  assert.equal((await platform.internalEvents(false)).length, 0, "private by default");
  assert.equal((await posts(req("posts", "POST", { kind: "news", title: "للجميع" }, lead.cookie))).status, 201, "publishers can publish to everyone");
  assert.equal((await posts(req("posts", "POST", { kind: "news", title: "لاستنيا", audienceUniversity: "استنيا", audienceSector: "youth" }, lead.cookie))).status, 201);
  const seen = await (await posts(req("posts", "GET", undefined, other.cookie))).json();
  assert.equal(seen.posts.length, 2);
  assert.ok(seen.posts.every(p=>!("authorLabel" in p) && !("authorVolunteer" in p) && p.canDelete===false));
  assert.equal((await posts(req("posts","DELETE",{id:seen.posts[0].id,revision:seen.posts[0].revision},other.cookie))).status,403);
  assert.equal((await posts(req("posts","DELETE",{id:seen.posts[0].id,revision:seen.posts[0].revision},lead.cookie))).status,200);
});

test("activities members can read the complete register but cannot create or edit by default", async () => {
  const { events } = handlers();
  const lead = await member("مسؤول أنشطة", { roles: [{ roleId: "internal-activities-lead", university: "استنيا", sector: "youth" }] });
  const memberA = await member("عضو أ", { roles: [{ roleId: "internal-activities-member", university: "استنيا", sector: "youth" }] });
  const memberB = await member("عضو ب", { roles: [{ roleId: "internal-activities-member", university: "استنيا", sector: "youth" }] });
  const leadEv = await (await events(req("events", "POST", { event: { title: "فعالية المسؤول", eventDate: "2099-02-01" }, scope: { university: "استنيا", sector: "youth" } }, lead.cookie))).json();
  const aCreate = await events(req("events", "POST", { event: { title: "فعالية أ", eventDate: "2099-02-02" }, scope: { university: "استنيا", sector: "youth" } }, memberA.cookie));
  assert.equal(aCreate.status, 403, "activities member is read-only");
  assert.equal((await events(req("events", "PUT", { id: leadEv.event.id, revision: leadEv.event.revision, event: { title: "تعديل غير مسموح" } }, memberA.cookie))).status, 403, "member cannot edit someone else's event");
  const bList = await (await events(req("events", "GET", undefined, memberB.cookie))).json();
  assert.equal(bList.events.length, 1, "member sees the complete register");
  assert.equal(bList.canCreate, false);
  assert.ok(bList.events.every((e) => e.canEdit === false), "member cannot edit events created by others");
  assert.equal((await events(req("events", "POST", { event: { title: "فعالية بيلجي" }, scope: { university: "بيلجي", sector: "youth" } }, memberA.cookie))).status, 403, "cannot add in another university");
});

test("the migration maps clear legacy roles and leaves the rest for review", async () => {
  const fresh = await testDatabase({
    beforePlatform: async (raw) => {
      const add = (name, gender, roleId, university = "استنيا") =>
        raw.query("INSERT INTO sahwa_volunteers(id,full_name,university,gender,status,role_id,responsibility) VALUES ($1,$2,$3,$4,'نشط',$5,'x')", [randomUUID(), name, university, gender, roleId]);
      await add("أ", "شاب", "university-youth-coordinator");
      await add("ب", "بنت", "internal-activities-lead");
      await add("ج", "بنت", "university-youth-coordinator");
      await add("د", "شاب", "sahwa-member");
      await add("هـ", "بنت", "central-women-lead");
      await add("و", "شاب", "expansion-lead");
    },
  });
  const rows = (await fresh.db.query("SELECT v.full_name AS name, a.role_id, a.university, a.sector, v.membership_level FROM sahwa_role_assignments a JOIN sahwa_volunteers v ON v.id=a.volunteer_id ORDER BY v.full_name")).rows;
  assert.deepEqual(rows.map((r) => [r.name, r.role_id, r.university, r.sector, r.membership_level]), [
    ["أ", "university-youth-lead", "استنيا", "youth", "مسؤول"],
    ["ب", "internal-activities-lead", "استنيا", "women", "مسؤول"],
    ["هـ", "central-activities-lead", null, "women", "مسؤول"],
  ]);
  assert.equal((await fresh.db.query("SELECT count(*)::int AS c FROM sahwa_volunteers")).rows[0].c, 6, "nobody removed");
  assert.equal((await fresh.db.query("SELECT count(*)::int AS c FROM sahwa_volunteers WHERE role_id IS NOT NULL")).rows[0].c, 6, "legacy values kept");
  await fresh.db.close();
});

test("central teams recruit across campuses, replace or end an appointment without deleting the person, and issue access once", async () => {
  const { admin, team } = handlers();
  const lead = await member("قائد تجريبي", {roles:[{roleId:"central-activities-lead",sector:"youth"}]});
  const newPerson = await member("طالب جامعة أخرى",{university:"بيلجي",account:false});
  const report = await (await team(req("team","GET",undefined,lead.cookie))).json();
  assert.ok(report.candidates.find((p) => p.id === newPerson.id).roleIds.includes("central-activities-member"));
  const assign = (data) => admin(req("admin","POST",data,lead.cookie));
  const attached = await assign({action:"assign-role",volunteerId:newPerson.id,roleId:"central-activities-member"});
  assert.equal(attached.status,200);
  const id = (await attached.json()).id;
  const fresh = await (await team(req("team","GET",undefined,lead.cookie))).json();
  assert.ok(fresh.volunteers.find((p) => p.id === newPerson.id).allowed.createAccount);
  const actor = await currentActor(req("auth","GET",undefined,lead.cookie),{platformStore:platform});
  const groups = directoryData(actor,await loadRealm(platform,false)).groups;
  assert.deepEqual(groups[0].people.map((p) => p.id),[newPerson.id]);
  const create = () => assign({action:"create-account",volunteerId:newPerson.id});
  const issued = await Promise.all([create(),create()]);
  assert.deepEqual(issued.map((r) => r.status).sort(),[200,201]);
  const active = await assign({action:"replace-role",assignmentId:id,volunteerId:newPerson.id,roleId:"central-activities-member"});
  assert.equal(active.status,200);
  assert.equal((await assign({action:"end-role",assignmentId:(await active.json()).id})).status,200);
  assert.equal((await platform.assignmentsOf(newPerson.id)).length,0);
  assert.equal((await platform.accountForVolunteer(newPerson.id)).accountStatus,"active");
  const created = await team(req("team","POST",{person:person({fullName:"عضو جديد باختبار",university:"جليشيم"}),assignment:{roleId:"central-activities-member"}},lead.cookie));
  assert.equal(created.status,201);
  assert.equal((await created.json()).person.assignments[0].roleId,"central-activities-member");
});

test("account changes require coverage of every appointment and cannot touch the head of Sahwa",async () => {
  const {admin,team} = handlers();
  const uni = await member("قائد محلي",{roles:[{roleId:"university-youth-lead",university:"استنيا",sector:"youth"}]});
  for (const p of ["accounts.reset","accounts.suspend","permissions.delegate"]) await grant(uni.id,p,{university:"استنيا",sector:"youth"});
  const person = await member("عضو بفريقين",{roles:["استنيا","بيلجي"].map((university) => ({roleId:"internal-activities-member",university,sector:"youth"}))});
  const head = await member("رئيس تجريبي",{roles:[{roleId:"sahwa-lead"}]});
  for (const target of [person,head]) for (const action of ["suspend-account","reset-account"]) {
    assert.equal((await admin(req("admin","POST",{action,volunteerId:target.id},uni.cookie))).status,403);
  }
  assert.equal((await team(req("team","PUT",{id:head.id,revision:1,person:{...await platform.person(head.id),status:"غير نشط"}},uni.cookie))).status,403);
  assert.equal((await admin(req("admin","POST",{action:"grant",volunteerId:head.id,permission:"events.view",reason:"اختبار"},uni.cookie))).status,403);
});

test("a live session loses work tools on pause, keeps its personal profile and can submit ideas",async () => {
  const { admin,team,events,forms,account,posts } = handlers();
  const lead = await member("مسؤول متوقف",{roles:[{roleId:"internal-activities-lead",university:"استنيا",sector:"youth"}]});
  await grant(lead.id,"relations.create");
  await db.query("UPDATE sahwa_volunteers SET status='متوقف مؤقتًا' WHERE id=$1",[lead.id]);
  for(const [handler,path,method,input] of [
    [team,"team","GET"],[events,"events","POST",{event:{title:"لقاء"}}],[forms,"forms?view=inbox","GET"],
    [posts,"posts","POST",{kind:"news",title:"خبر"}],[admin,"admin","POST",{action:"settings",key:"directory.crossSector",value:"all"}],
  ]) assert.equal((await handler(req(path,method,input,lead.cookie))).status,403,path);
  assert.equal((await account(req("account","PUT",{profile:{handle:"fixture.person",bio:"نبذة"}},lead.cookie))).status,200);
  const bank = (await platform.forms()).find((f) => f.slug==="general-suggestions");
  assert.equal((await forms(req("forms","POST",{formId:bank.id,answers:{title:"عنوان",details:"اقتراح"}},lead.cookie))).status,201);
  assert.equal((await platform.assignmentsOf(lead.id)).length,1);
});

test("an event is scoped to its selected assignment; sector central activities lead and responsible volunteer can edit, while cross-sector edits remain forbidden",async () => {
  const {events} = handlers();
  const scope = {roleId:"central-activities-lead",sector:"youth"};
  const one = await member("منشئ",{roles:[scope,{roleId:"internal-activities-lead",university:"استنيا",sector:"youth"}]});
  const two = await member("مسؤول زميل",{roles:[scope]});
  const womenLead = await member("مسؤولة أنشطة",{gender:"بنت",roles:[{roleId:"central-activities-lead",sector:"women"}]});
  const assigned = await member("عضو مكلف",{university:"بيلجي",roles:[{roleId:"central-activities-member",sector:"youth"}]});
  const visible = await (await events(req("events","GET",undefined,one.cookie))).json();
  const target = visible.scopes.find((s) => s.team === "central-activities");
  const made = await events(req("events","POST",{scope:target,event:{title:"فعالية",responsibleId:assigned.id},audience:"internal"},one.cookie));
  assert.equal(made.status,201);
  const record = (await made.json()).event;
  const edit = (cookie,extra={}) => events(req("events","PUT",{id:record.id,revision:record.revision,event:{...record,title:"تحديث"},...extra},cookie));
  assert.equal((await edit(womenLead.cookie)).status,403);
  assert.equal((await edit(one.cookie,{scope:{university:"بيلجي",sector:"youth"}})).status,403);
  assert.equal((await store.eventById(record.id)).title,"فعالية");
  assert.equal((await edit(assigned.cookie)).status,200);
  const afterAssigned = await store.eventById(record.id);
  assert.equal((await events(req("events","PUT",{id:record.id,revision:afterAssigned.revision,event:{...afterAssigned,title:"تحديث المركزي"}},two.cookie))).status,200);
  assert.equal((await platform.internalEvents(false)).length,1);
});

test("campus leads see and manage all campus-sector volunteers (including Media & Relations), Media sees only Media, and Central Activities has read-only campus oversight", async () => {
  const { team, admin, events } = handlers();
  const ghina = await member("غنى", { university: "استنيا", gender: "بنت", roles: [{ roleId: "university-women-lead", university: "استنيا", sector: "women" }] });
  const mariam = await member("مريم", { university: "استنيا", gender: "بنت", roles: [{ roleId: "internal-activities-lead", university: "استنيا", sector: "women" }], account: false });
  const fatima = await member("فاطمة", { university: "استنيا", gender: "بنت", roles: [{ roleId: "internal-activities-member", university: "استنيا", sector: "women" }], account: false });
  const asmaa = await member("أسماء", { university: "استنيا", gender: "بنت", roles: [{ roleId: "media-member" }], account: false });
  const campusRel = await member("سلمى", { university: "استنيا", gender: "بنت", roles: [{ roleId: "university-relations-member", university: "استنيا" }], account: false });
  const unassigned = await member("نور", { university: "استنيا", gender: "بنت", account: false });
  await member("أحمد", { university: "استنيا", gender: "شاب", account: false });
  const mediaLead = await member("مسؤول الإعلام", { university: "بيلجي", gender: "شاب", roles: [{ roleId: "media-lead" }] });
  const centralRelLead = await member("مسؤول العلاقات", { university: "بيلجي", gender: "شاب", roles: [{ roleId: "central-relations-lead" }] });
  const centralWomenAct = await member("مسؤولة الأنشطة المركزية", { university: "بيلجي", gender: "بنت", roles: [{ roleId: "central-activities-lead", sector: "women" }] });

  // Ghina sees all female volunteers at Istinye including Media, Relations, Activities, and Unassigned — never males
  const ghinaData = await (await team(req("team", "GET", undefined, ghina.cookie))).json();
  const ghinaNames = ghinaData.volunteers.map((v) => v.fullName);
  for (const name of ["مريم", "فاطمة", "أسماء", "سلمى", "نور"]) assert.ok(ghinaNames.includes(name), `Ghina should see ${name}`);
  assert.ok(!ghinaNames.includes("أحمد"), "Ghina never sees youth sector");
  const asmaaCard = ghinaData.volunteers.find((v) => v.id === asmaa.id);
  assert.equal(asmaaCard.allowed.edit, true, "Ghina can edit Asmaa's basic campus info");
  assert.equal(asmaaCard.allowed.createAccount, true, "Ghina can create an account for Asmaa");
  assert.equal(asmaaCard.assignments[0].canChange, true, "Ghina can manage media-member on her own campus/sector volunteers");
  // Ghina can assign campus relations & media-member to female students at Istinye
  assert.equal((await admin(req("admin", "POST", { action: "assign-role", volunteerId: unassigned.id, roleId: "university-relations-member", university: "استنيا" }, ghina.cookie))).status, 200);
  assert.equal((await admin(req("admin", "POST", { action: "assign-role", volunteerId: unassigned.id, roleId: "media-member" }, ghina.cookie))).status, 200);
  // Ghina can add a new female volunteer at Istinye directly as media-member, but never media-lead or central relations or other campuses/sectors
  assert.equal((await team(req("team", "POST", { person: person({ fullName: "طالبة إعلام جديدة", university: "استنيا", gender: "بنت" }), assignment: { roleId: "media-member" } }, ghina.cookie))).status, 201);
  const otherCampusWoman = await member("طالبة بيلجي", { university: "بيلجي", gender: "بنت", account: false });
  assert.equal((await admin(req("admin", "POST", { action: "assign-role", volunteerId: otherCampusWoman.id, roleId: "media-member" }, ghina.cookie))).status, 403, "campus lead cannot assign media-member to another campus");
  assert.equal((await admin(req("admin", "POST", { action: "assign-role", volunteerId: unassigned.id, roleId: "media-lead" }, ghina.cookie))).status, 403, "campus lead cannot assign media-lead");
  assert.equal((await admin(req("admin", "POST", { action: "assign-role", volunteerId: unassigned.id, roleId: "central-relations-member" }, ghina.cookie))).status, 403, "campus lead cannot assign central relations");
  // Ghina can create account for Asmaa
  assert.equal((await admin(req("admin", "POST", { action: "create-account", volunteerId: asmaa.id }, ghina.cookie))).status, 201);

  // Media lead sees ONLY media members in volunteers, and can recruit existing volunteers across sectors
  const mediaData = await (await team(req("team", "GET", undefined, mediaLead.cookie))).json();
  assert.deepEqual(mediaData.volunteers.map((v) => v.fullName).sort(), ["أسماء", "طالبة إعلام جديدة", "مسؤول الإعلام", "نور"].sort());
  assert.ok(mediaData.candidates.some((c) => c.id === fatima.id && c.roleIds.includes("media-member")), "Media lead can recruit existing campus member without duplicating");

  // Central Relations lead sees university relations members across campuses
  const relData = await (await team(req("team", "GET", undefined, centralRelLead.cookie))).json();
  assert.ok(relData.volunteers.some((v) => v.id === campusRel.id), "Central relations sees university relations");

  // Central Activities lead sees university internal activities leads & members as read-only oversight
  const actData = await (await team(req("team", "GET", undefined, centralWomenAct.cookie))).json();
  const mariamView = actData.volunteers.find((v) => v.id === mariam.id);
  assert.ok(mariamView, "Central activities sees university internal activities lead");
  assert.equal(mariamView.allowed.oversightOnly, true, "University internal activities stay under university management");
  assert.equal(mariamView.allowed.edit, false);
  assert.equal(mariamView.allowed.assign, false);
  // Central Activities lead can edit & delete university events in her sector AND legacy untagged events
  const campusEv = await (await events(req("events", "POST", { event: { title: "نشاط استنيا" }, scope: { university: "استنيا", sector: "women", team: "university-team" } }, ghina.cookie))).json();
  assert.equal((await events(req("events", "PUT", { id: campusEv.event.id, revision: campusEv.event.revision, event: { title: "نشاط استنيا معدل" } }, centralWomenAct.cookie))).status, 200);
  const legacyEv = await store.createEvent({ title: "فعالية قديمة", eventDate: "2025-01-01", responsibleId: null, attendance: 10, notes: "" }, { university: null, sector: null, team: null });
  assert.equal((await events(req("events", "PUT", { id: legacyEv.id, revision: legacyEv.revision, event: { title: "فعالية قديمة معدلة" } }, centralWomenAct.cookie))).status, 200);
  const updatedLegacy = await store.eventById(legacyEv.id);
  assert.equal((await events(req("events", "DELETE", { id: updatedLegacy.id, revision: updatedLegacy.revision }, centralWomenAct.cookie))).status, 200);
});

test("volunteers can self-edit personal data (e.g. birthDate) to unlock public profiles without changing university or gender", async () => {
  const { account } = handlers();
  const saved = await store.createVolunteer(person({ fullName: "يزن", birthDate: "2015-01-01", university: "استنيا", gender: "شاب" }));
  await platform.createAccount({ volunteerId: saved.id, username: "yazan.test", passwordHash, mustChange: false, expiresAt: null, createdBy: "test" });
  const login = await handlers().auth(req("auth", "POST", { identifier: "yazan.test", password: PASSWORD }));
  const cookie = cookieOf(login);
  // Initially blocked from publishing because birthDate was wrong (< 18)
  assert.equal((await account(req("account", "PUT", { profile: { handle: "yazan", isPublic: true } }, cookie))).status, 400);
  // Yazan fixes his own birthDate and phone
  const updated = await account(req("account", "PUT", { personal: { fullName: "يزن أحمد", birthDate: "2001-05-10", phone: "+90 555 111 22 33", major: "Software engineering", studyYear: "السنة الرابعة", university: "بيلجي", gender: "بنت" } }, cookie));
  assert.equal(updated.status, 200);
  const refreshed = await platform.person(saved.id);
  assert.equal(refreshed.fullName, "يزن أحمد");
  assert.equal(refreshed.birthDate, "2001-05-10");
  assert.equal(refreshed.major, "هندسة البرمجيات");
  assert.equal(refreshed.university, "استنيا", "self-edit never changes university");
  assert.equal(refreshed.gender, "شاب", "self-edit never changes gender");
  // Now Yazan can publish his public profile!
  assert.equal((await account(req("account", "PUT", { profile: { handle: "yazan", isPublic: true } }, cookie))).status, 200);
  // Login and self-edit are both recorded in audit log
  const actions = (await platform.auditLog(false)).map((e) => e.action);
  assert.ok(actions.includes("account.login"));
  assert.ok(actions.includes("volunteer.self-edit"));
});

test("relations, inbox submissions, custom forms and posts support full edit/delete with proper authorization", async () => {
  const { forms, relations, posts, auth } = handlers();
  const owner = cookieOf(await auth(req("auth", "POST", { email: sharedEmail, password: sharedPassword })));
  const centralRel = await member("علاقات مركزي", { roles: [{ roleId: "central-relations-lead" }] });
  const uniLead = await member("مسؤول جامعة", { roles: [{ roleId: "university-youth-lead", university: "استنيا", sector: "youth" }] });
  const volunteer = await member("متطوع", { roles: [{ roleId: "university-volunteer", university: "استنيا", sector: "youth" }] });

  // 1. Relations delete & inbox delete independence
  const relBank = (await platform.forms()).find((f) => f.slug === "relations-bank");
  const sub = await (await forms(req("forms", "POST", { formId: relBank.id, answers: { name: "مؤسسة الأفق", reason: "شراكة", scope: "مركزي" } }, volunteer.cookie))).json();
  assert.equal((await forms(req("forms", "PUT", { action: "respond", id: sub.id, revision: 1, status: "accepted" }, centralRel.cookie))).status, 200);
  // Deleting from inbox keeps accepted relation in relations ledger
  assert.equal((await forms(req("forms", "DELETE", { target: "inbox", id: sub.id, revision: 2 }, centralRel.cookie))).status, 200);
  assert.equal((await (await forms(req("forms?view=inbox", "GET", undefined, centralRel.cookie))).json()).submissions.length, 0);
  const relRows = (await (await relations(req("relations", "GET", undefined, centralRel.cookie))).json()).records;
  assert.equal(relRows.length, 1);
  assert.equal(relRows[0].canDelete, true);
  // Unauthorized user cannot delete relation
  assert.equal((await relations(req("relations", "DELETE", { id: relRows[0].id, revision: relRows[0].revision }, uniLead.cookie))).status, 403);
  // Authorized lead deletes relation
  assert.equal((await relations(req("relations", "DELETE", { id: relRows[0].id, revision: relRows[0].revision }, centralRel.cookie))).status, 200);
  assert.equal((await (await relations(req("relations", "GET", undefined, centralRel.cookie))).json()).records.length, 0);

  // 2. Custom form deletion (while protecting system forms)
  assert.equal((await forms(req("forms", "PUT", { action: "save-form", form: { title: "نموذج مؤقت", description: "تجربة", fields: [{ id: "title", label: "العنوان", type: "short_text", required: true }], audience: { sectors: ["youth", "women"] }, active: true, routing: { by: "fixed", role: "sahwa-lead" } } }, owner))).status, 200);
  const customForm = (await platform.forms()).find((f) => f.title === "نموذج مؤقت");
  assert.ok(customForm);
  assert.equal((await forms(req("forms", "DELETE", { target: "form", id: relBank.id, revision: relBank.revision }, owner))).status, 409, "relations-bank is protected");
  assert.equal((await forms(req("forms", "DELETE", { target: "form", id: customForm.id, revision: customForm.revision }, owner))).status, 200);
  assert.ok(!(await platform.forms()).some((f) => f.id === customForm.id));

  // 3. Community post editing
  const createdPost = await (await posts(req("posts", "POST", { kind: "news", title: "عنوان أولي", body: "تفاصيل" }, uniLead.cookie))).json();
  assert.equal((await posts(req("posts", "PUT", { id: createdPost.id, revision: 1, kind: "project", title: "عنوان معدل", body: "تفاصيل محدثة" }, volunteer.cookie))).status, 403);
  assert.equal((await posts(req("posts", "PUT", { id: createdPost.id, revision: 1, kind: "project", title: "عنوان معدل", body: "تفاصيل محدثة" }, uniLead.cookie))).status, 200);
  const edited = await platform.post(createdPost.id);
  assert.equal(edited.title, "عنوان معدل");
  assert.equal(edited.kind, "project");
});

test("central activities lead dashboard contacts resolve university leads, internal activities leads, media, and relations", async () => {
  const actLead = await member("مسؤول الأنشطة المركزية", { roles: [{ roleId: "central-activities-lead", sector: "youth" }] });
  await member("مسؤول شباب استنيا", { roles: [{ roleId: "university-youth-lead", university: "استنيا", sector: "youth" }], account: false });
  await member("مسؤول أنشطة استنيا", { roles: [{ roleId: "internal-activities-lead", university: "استنيا", sector: "youth" }], account: false });
  await member("مسؤول الإعلام", { roles: [{ roleId: "media-lead" }], account: false });
  await member("مسؤول العلاقات", { roles: [{ roleId: "central-relations-lead" }], account: false });
  const actor = await currentActor(req("auth", "GET", undefined, actLead.cookie), { platformStore: platform });
  const data = dashboardData(actor, await loadRealm(platform, false));
  const coordNames = data.roles[0].contacts.links.filter((l) => l.relation === "coordinates").flatMap((l) => l.people.map((p) => p.name));
  for (const name of ["مسؤول شباب استنيا", "مسؤول أنشطة استنيا", "مسؤول الإعلام", "مسؤول العلاقات"]) {
    assert.ok(coordNames.includes(name), `Expected ${name} in central-activities-lead contacts`);
  }
  const financeLink = data.roles[0].contacts.links.find((l) => l.targetTitle === "مسؤول المالية");
  assert.equal(financeLink?.deferred, true);
});

test("the relations ledger reuses accepted bank proposals and limits changes to the assigned contact",async () => {
  const {forms,relations} = handlers();
  const central = await member("مسؤول علاقات",{roles:[{roleId:"central-relations-lead"}]});
  const campus = await member("علاقات الجامعة",{roles:[{roleId:"university-relations-lead",university:"استنيا"}]});
  const peer = await member("عضو علاقات",{roles:[{roleId:"central-relations-member"}]});
  const bank = (await platform.forms()).find((f) => f.slug==="relations-bank");
  const proposal = await forms(req("forms","POST",{formId:bank.id,answers:{name:"جهة تجريبية",reason:"تعاون",scope:"مركزي"}},peer.cookie));
  const {id} = await proposal.json();
  assert.equal((await forms(req("forms","PUT",{action:"respond",id,revision:1,status:"accepted"},central.cookie))).status,200);
  const rows = async (cookie) => (await (await relations(req("relations","GET",undefined,cookie))).json()).records;
  const accepted = (await rows(peer.cookie))[0];
  assert.equal(accepted.id,id);
  assert.deepEqual(await rows(campus.cookie),[]);
  assert.equal((await relations(req("relations","PUT",{id,revision:accepted.revision,name:"اسم آخر"},peer.cookie))).status,403);
  const changed = await relations(req("relations","PUT",{id,revision:accepted.revision,name:"اسم السجل",ownerId:peer.id},central.cookie));
  assert.equal(changed.status,200);
  await grant(peer.id,"relations.edit",{university:"*central*",team:"central-relations"});
  assert.equal((await relations(req("relations","PUT",{id,revision:accepted.revision+1,name:"متابعة"},peer.cookie))).status,200);
  assert.equal((await platform.submission(id)).answers.name,"جهة تجريبية");
  assert.equal((await relations(req("relations","POST",{name:"علاقة مباشرة"},central.cookie))).status,201);
  const inbox = await (await forms(req("forms?view=inbox","GET",undefined,central.cookie))).json();
  assert.equal(inbox.submissions.length,1);
  assert.equal((await rows(central.cookie)).length,2);
});

test("campus leads can create, rename and archive local volunteers while preserving organizational assignments", async () => {
  const { team } = handlers();
  for (const [gender, sector, roleId] of [["شاب","youth","university-youth-lead"],["بنت","women","university-women-lead"]]) {
    const lead = await member("مسؤول " + sector, {gender,roles:[{roleId,university:"استنيا",sector}]});
    const created = await team(req("team","POST",{person:person({fullName:"متطوع جديد "+sector,gender,team:"",responsibility:""}),assignment:{roleId:"university-volunteer"}},lead.cookie));
    assert.equal(created.status,201);
    const local = (await created.json()).person;
    // Reproduce migrated records whose legacy role text is blank although
    // the current role is stored in sahwa_role_assignments.
    await db.query("UPDATE sahwa_volunteers SET team='', responsibility='', role_id=NULL WHERE id=$1",[local.id]);
    const listed = (await (await team(req("team","GET",undefined,lead.cookie))).json()).volunteers.find(p=>p.id===local.id);
    assert.ok(listed.allowed.edit && listed.allowed.archive);
    const before = await platform.assignmentsOf(local.id);
    const update = await team(req("team","PUT",{id:local.id,revision:listed.revision,person:{...listed,fullName:"الاسم المعدل "+sector}},lead.cookie));
    assert.equal(update.status,200);
    const edited = (await update.json()).person;
    assert.equal(edited.fullName,"الاسم المعدل "+sector);
    assert.deepEqual(await platform.assignmentsOf(local.id),before);
    const outsider = await member("جامعة أخرى "+sector,{university:"بيلجي",gender,account:false});
    const outsiderRow = await platform.person(outsider.id);
    assert.equal((await team(req("team","DELETE",{id:outsider.id,revision:outsiderRow.revision},lead.cookie))).status,403);
    const peer = await member("مسؤول مركزي "+sector,{gender,account:false,roles:[{roleId:"central-activities-lead",sector}]});
    const peerRow = await platform.person(peer.id);
    assert.equal((await team(req("team","DELETE",{id:peer.id,revision:peerRow.revision},lead.cookie))).status,403);
    const own = await platform.person(lead.id);
    assert.equal((await team(req("team","DELETE",{id:lead.id,revision:own.revision},lead.cookie))).status,403);
    assert.equal((await team(req("team","DELETE",{id:local.id,revision:edited.revision},lead.cookie))).status,200);
    assert.ok((await platform.person(local.id)).archivedAt);
  }
});

test("campus archival includes locally managed neutral roles but protects unrelated and scheduled assignments", async () => {
  const { team } = handlers();
  const lead = await member("مسؤولة الجامعة", { gender:"بنت", roles:[{roleId:"university-women-lead",university:"استنيا",sector:"women"}] });
  const localMedia = await member("متطوعة إعلام", {gender:"بنت",account:false,roles:[{roleId:"media-member"}]});
  const localRelations = await member("متطوعة علاقات", {gender:"بنت",account:false,roles:[{roleId:"university-relations-member",university:"استنيا"}]});
  const central = await member("متطوعة مركزية", {gender:"بنت",account:false,roles:[{roleId:"central-activities-member",sector:"women"}]});
  const otherSector = await member("متطوع شباب", {account:false});
  const scheduled = await member("تكليف مستقبلي", {gender:"بنت",account:false});
  await platform.addAssignment({volunteerId:scheduled.id,roleId:"central-activities-lead",university:null,sector:"women",startsOn:"2099-01-01",assignedBy:"test"});
  const data = (await (await team(req("team","GET",undefined,lead.cookie))).json()).volunteers;
  for(const v of [localMedia,localRelations]) {
    const row=data.find(p=>p.id===v.id);
    assert.equal(row.allowed.archive,true);
    assert.equal((await team(req("team","DELETE",{id:v.id,revision:row.revision},lead.cookie))).status,200);
  }
  for(const v of [central,otherSector,scheduled]) {
    const row=await platform.person(v.id);
    assert.notEqual(data.find(p=>p.id===v.id)?.allowed.archive,true);
    assert.equal((await team(req("team","DELETE",{id:v.id,revision:row.revision},lead.cookie))).status,403);
  }
});
