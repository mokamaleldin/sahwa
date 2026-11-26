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
  assert.equal((await admin(req("admin", "POST", { action: "grant", volunteerId: helper.id, permission: "volunteers.archive", university: "استنيا", sector: "youth", reason: "x" }, lead.cookie))).status, 403, "not held");
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

test("accounts are created with e-mail and username, and sign in with either", async () => {
  const { admin, auth } = handlers();
  const owner = cookieOf(await auth(req("auth", "POST", { identifier: sharedEmail, password: sharedPassword })));
  const lead = await member("سارة أحمد", { gender: "بنت", account: false, roles: [{ roleId: "women-sector-lead" }] });
  const created = await admin(req("admin", "POST", { action: "create-account", volunteerId: lead.id, email: "Sara@Sahwa.com", username: "sara.lead", password: "Fixture-Pass-9x", requireChange: false }, owner));
  assert.equal(created.status, 201);
  for (const identifier of ["sara@sahwa.com", "SARA.LEAD"]) assert.equal((await auth(req("auth", "POST", { identifier, password: "Fixture-Pass-9x" }))).status, 200);
  const other = await member("آخر", { account: false });
  assert.equal((await admin(req("admin", "POST", { action: "create-account", volunteerId: other.id, email: "sara@sahwa.com", password: "Fixture-Pass-9x" }, owner))).status, 409, "e-mail unique");
  assert.equal((await admin(req("admin", "POST", { action: "create-account", volunteerId: other.id, username: "sara.lead", password: "Fixture-Pass-9x" }, owner))).status, 409, "username unique");
});

test("the administrator can set the initial password and choose whether it must change", async () => {
  const { admin, auth } = handlers();
  const head = await member("رئيس", { roles: [{ roleId: "sahwa-lead" }] });
  const lead = await member("خالد علي", { account: false, roles: [{ roleId: "media-lead" }] });
  const created = await (await admin(req("admin", "POST", { action: "create-account", volunteerId: lead.id, password: "Fixture-Pass-9x", requireChange: false }, head.cookie))).json();
  assert.equal(created.chosenPassword, true);
  assert.ok(!("temporaryPassword" in created) || created.temporaryPassword === undefined);
  const login = await auth(req("auth", "POST", { identifier: created.username, password: "Fixture-Pass-9x" }));
  assert.equal(login.status, 200);
  assert.equal((await login.json()).user.mustChangePassword, false);
  assert.equal((await admin(req("admin", "POST", { action: "reset-account", volunteerId: lead.id, password: "short" }, head.cookie))).status, 400);
  const stored = (await db.query("SELECT password_hash FROM sahwa_accounts WHERE volunteer_id=$1", [lead.id])).rows[0].password_hash;
  assert.ok(!stored.includes("Fixture-Pass-9x"));
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
  await member("زميلة إعلام", { gender: "بنت", roles: [{ roleId: "media-member" }], account: false });
  await member("غير نشط", { status: "غير نشط", account: false });
  const actor = await currentActor(req("auth", "GET", undefined, viewer.cookie), { teamStore: store, platformStore: platform });
  const realm = await loadRealm(platform, false);
  const names = directoryData(actor, realm, "leads").all.map((c) => c.name);
  assert.ok(names.includes("شاب آخر"), "across universities");
  assert.ok(!names.includes("طالبة"));
  assert.ok(names.includes("مسؤولة"), "official leads stay reachable");
  assert.ok(!names.includes("غير نشط"));
  assert.ok(!directoryData(actor, realm, "none").all.some((c) => c.name === "مسؤولة"));
  const card = directoryData(actor, realm, "leads").all.find((c) => c.name === "شاب آخر");
  assert.ok(!("phone" in card) && !("birthDate" in card) && !("status" in card));
});

test("events are scoped to the university and sector, and stay private unless shared", async () => {
  const { events, posts } = handlers();
  const lead = await member("مسؤول", { roles: [{ roleId: "university-youth-lead", university: "استنيا", sector: "youth" }] });
  const other = await member("مسؤول بيلجي", { university: "بيلجي", roles: [{ roleId: "university-youth-lead", university: "بيلجي", sector: "youth" }] });
  const created = await events(req("events", "POST", { event: { title: "لقاء استنيا", eventDate: "2099-01-01" }, scope: { university: "بيلجي", sector: "youth" } }, lead.cookie));
  assert.equal(created.status, 403, "cannot create in another university");
  const ok = await events(req("events", "POST", { event: { title: "لقاء استنيا", eventDate: "2099-01-01" }, scope: { university: "استنيا", sector: "youth" } }, lead.cookie));
  assert.equal(ok.status, 201);
  assert.equal((await (await events(req("events", "GET", undefined, other.cookie))).json()).events.length, 0);
  const volunteer = await member("متطوع", { roles: [{ roleId: "university-volunteer", university: "استنيا", sector: "youth" }] });
  assert.equal((await events(req("events", "GET", undefined, volunteer.cookie))).status, 403);
  assert.equal((await platform.internalEvents(false)).length, 0, "private by default");
  assert.equal((await posts(req("posts", "POST", { kind: "news", title: "للجميع" }, lead.cookie))).status, 403, "cannot publish to everyone");
  assert.equal((await posts(req("posts", "POST", { kind: "news", title: "لاستنيا", audienceUniversity: "استنيا", audienceSector: "youth" }, lead.cookie))).status, 201);
  const seen = await (await posts(req("posts", "GET", undefined, other.cookie))).json();
  assert.equal(seen.posts.length, 0);
});

test("activities members can add events in their university and only edit events they created", async () => {
  const { events } = handlers();
  const lead = await member("مسؤول أنشطة", { roles: [{ roleId: "internal-activities-lead", university: "استنيا", sector: "youth" }] });
  const memberA = await member("عضو أ", { roles: [{ roleId: "internal-activities-member", university: "استنيا", sector: "youth" }] });
  const memberB = await member("عضو ب", { roles: [{ roleId: "internal-activities-member", university: "استنيا", sector: "youth" }] });
  const leadEv = await (await events(req("events", "POST", { event: { title: "فعالية المسؤول", eventDate: "2099-02-01" }, scope: { university: "استنيا", sector: "youth" } }, lead.cookie))).json();
  const aCreate = await events(req("events", "POST", { event: { title: "فعالية أ", eventDate: "2099-02-02" }, scope: { university: "استنيا", sector: "youth" } }, memberA.cookie));
  assert.equal(aCreate.status, 201, "activities member can create an event in their university");
  const aEv = (await aCreate.json()).event;
  assert.equal((await events(req("events", "PUT", { id: aEv.id, revision: aEv.revision, event: { title: "فعالية أ المعدلة", eventDate: "2099-02-02" } }, memberA.cookie))).status, 200, "creator can edit their own event");
  assert.equal((await events(req("events", "PUT", { id: leadEv.event.id, revision: leadEv.event.revision, event: { title: "تعديل غير مسموح" } }, memberA.cookie))).status, 403, "member cannot edit someone else's event");
  const bList = await (await events(req("events", "GET", undefined, memberB.cookie))).json();
  assert.equal(bList.events.length, 2, "member sees all university events");
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
