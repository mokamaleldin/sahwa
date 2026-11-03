import { test, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import { testDatabase, person, event } from "./helpers/database.js";
import { hashPassword, createSession, verifyPassword } from "../server/auth.js";
import { createAuthHandler } from "../server/auth-api.js";
import { createTeamHandler } from "../server/team-api.js";
import { createEventsHandler } from "../server/events-api.js";
let db, store, hash;
before(async () => {
  ({ db, store } = await testDatabase());
  hash = await hashPassword("fixture-password-only");
  process.env.SAHWA_SESSION_SECRET = "test-only-secret-at-least-32-characters";
});
beforeEach(async () => {
  await db.exec(
    "TRUNCATE sahwa_sessions,sahwa_login_limits,sahwa_events,sahwa_users CASCADE",
  );
  delete process.env.SAHWA_ACCOUNT_EMAIL;
  delete process.env.SAHWA_PASSWORD_HASH;
});
after(async () => {
  await db.close();
});
const req = (
  path,
  method = "GET",
  input,
  cookie = "",
  origin = "https://sahwa.world",
) =>
  new Request(`https://sahwa.world/api/${path}`, {
    method,
    headers: { cookie, origin, "Content-Type": "application/json" },
    ...(input === undefined ? {} : { body: JSON.stringify(input) }),
  });
async function account(role = "admin", email = `${role}@example.invalid`) {
  const user = await store.createVolunteer(
    person({ accessRole: role, email }),
    hash,
  );
  const cookie = await createSession(user.id, true, req("auth"), store);
  return { user, cookie };
}
test("account, event and session records round-trip without exposing hashes", async () => {
  const { user, cookie } = await account();
  const team = createTeamHandler(store),
    events = createEventsHandler(store);
  const created = await team(req("team", "POST", { person: person() }, cookie));
  assert.equal(created.status, 201);
  const p = (await created.json()).person;
  assert.ok(!("passwordHash" in p));
  assert.ok(!("password" in p));
  assert.equal(p.birthDate, "2004-02-29");
  const res = await events(
    req("events", "POST", { event: event({ attendance: 0 }) }, cookie),
  );
  assert.equal(res.status, 201);
  const saved = (await res.json()).event;
  assert.equal(saved.attendance, 0);
  const edited = await events(
    req(
      "events",
      "PUT",
      {
        id: saved.id,
        revision: saved.revision,
        event: event({ attendance: null }),
      },
      cookie,
    ),
  );
  assert.equal(edited.status, 200);
  assert.equal((await edited.json()).event.attendance, null);
  const stale = await events(
    req(
      "events",
      "PUT",
      { id: saved.id, revision: saved.revision, event: event() },
      cookie,
    ),
  );
  assert.equal(stale.status, 409);
  const list = await events(req("events", "GET", undefined, cookie));
  assert.equal((await list.json()).events.length, 1);
  assert.equal(
    (
      await events(
        req("events", "DELETE", { id: saved.id, revision: 2 }, cookie),
      )
    ).status,
    200,
  );
  const session = await createAuthHandler(store)(
    req("auth", "GET", undefined, cookie),
  );
  const data = await session.json();
  assert.equal(data.user.id, user.id);
  assert.equal(data.user.accessRole, "admin");
  assert.ok(!("passwordHash" in data.user));
});
test("ordinary volunteers are denied every administrator read and mutation", async () => {
  const { cookie } = await account("volunteer");
  for (const [handler, path] of [
    [createTeamHandler(store), "team"],
    [createEventsHandler(store), "events"],
  ])
    for (const method of ["GET", "POST", "PUT", "DELETE"])
      assert.equal(
        (
          await handler(
            req(
              path,
              method,
              method === "GET"
                ? undefined
                : { person: person(), event: event() },
              cookie,
            ),
          )
        ).status,
        403,
      );
  assert.equal(
    (await createAuthHandler(store)(req("auth", "GET", undefined, cookie)))
      .status,
    200,
  );
});
test("anonymous requests and cross-origin writes do not read or change team data", async () => {
  const { cookie } = await account();
  const team = createTeamHandler(store);
  assert.equal((await team(req("team"))).status, 401);
  assert.equal(
    (
      await team(
        req(
          "team",
          "POST",
          { person: person() },
          cookie,
          "https://attacker.invalid",
        ),
      )
    ).status,
    403,
  );
  assert.equal((await store.listVolunteers()).length, 1);
});
test("password reset revokes all sessions and stale writes leave current sessions intact", async () => {
  const { user, cookie } = await account("volunteer");
  const nextHash = await hashPassword("new-fixture-password");
  await assert.rejects(
    store.updateVolunteer(user.id, 99, person(), nextHash),
    (e) => e.status === 409,
  );
  assert.equal(
    (await createAuthHandler(store)(req("auth", "GET", undefined, cookie)))
      .status,
    200,
  );
  assert.equal(
    (
      await (
        await createAuthHandler(store)(req("auth", "GET", undefined, cookie))
      ).json()
    ).authenticated,
    true,
  );
  await store.updateVolunteer(
    user.id,
    user.revision,
    person({ email: user.email }),
    nextHash,
  );
  assert.equal(
    (
      await (
        await createAuthHandler(store)(req("auth", "GET", undefined, cookie))
      ).json()
    ).authenticated,
    false,
  );
  assert.equal(
    await verifyPassword(
      "fixture-password-only",
      (await store.credentials(user.email)).passwordHash,
    ),
    false,
  );
});
test("changing a role or disabling an account takes effect on existing sessions", async () => {
  const { user, cookie } = await account();
  await account("admin", "second@example.invalid");
  const updated = await store.updateVolunteer(
    user.id,
    1,
    person({ email: user.email, accessRole: "volunteer" }),
    null,
  );
  assert.equal(
    (await createTeamHandler(store)(req("team", "GET", undefined, cookie)))
      .status,
    403,
  );
  await store.updateVolunteer(
    user.id,
    updated.revision,
    person({ email: user.email, status: "متوقف مؤقتًا" }),
    null,
  );
  assert.equal(
    (await createTeamHandler(store)(req("team", "GET", undefined, cookie)))
      .status,
    401,
  );
});
test("an administrator cannot disable themselves or remove the final administrator", async () => {
  const { user, cookie } = await account();
  const team = createTeamHandler(store);
  assert.equal(
    (
      await team(
        req(
          "team",
          "PUT",
          {
            id: user.id,
            revision: 1,
            person: person({ email: user.email, accessRole: "volunteer" }),
          },
          cookie,
        ),
      )
    ).status,
    400,
  );
  await assert.rejects(
    store.updateVolunteer(
      user.id,
      1,
      person({ email: user.email, accessRole: "volunteer" }),
      null,
    ),
    (e) => e.status === 409,
  );
});
test("the existing shared login bootstraps one administrator once, then cannot recreate it", async () => {
  process.env.SAHWA_ACCOUNT_EMAIL = "legacy@example.invalid";
  process.env.SAHWA_PASSWORD_HASH = hash;
  const auth = createAuthHandler(store),
    input = {
      email: "LEGACY@example.invalid",
      password: "fixture-password-only",
      remember: true,
    };
  const first = await auth(req("auth", "POST", input));
  assert.equal(first.status, 200);
  assert.equal((await first.json()).user.accessRole, "admin");
  assert.equal((await store.listVolunteers()).length, 1);
  const cookie = first.headers.get("set-cookie");
  assert.match(cookie, /HttpOnly; Secure/);
  assert.equal(
    (await auth(req("auth", "DELETE", undefined, cookie))).status,
    200,
  );
  assert.equal(
    (await (await auth(req("auth", "GET", undefined, cookie))).json())
      .authenticated,
    false,
  );
  const second = await auth(req("auth", "POST", input));
  assert.equal(second.status, 200);
  assert.equal((await store.listVolunteers()).length, 1);
});
test("login limits persist in the database and do not reveal account existence", async () => {
  await account();
  const auth = createAuthHandler(store);
  for (let i = 0; i < 10; i++)
    assert.equal(
      (
        await auth(
          req("auth", "POST", {
            email: "missing@example.invalid",
            password: "wrong",
          }),
        )
      ).status,
      401,
    );
  const blocked = await auth(
    req("auth", "POST", {
      email: "missing@example.invalid",
      password: "wrong",
    }),
  );
  assert.equal(blocked.status, 429);
  assert.equal(blocked.headers.get("retry-after"), "900");
});
test("duplicate emails become a clear conflict and SQL-looking text remains text", async () => {
  const { cookie } = await account();
  const team = createTeamHandler(store);
  assert.equal(
    (
      await team(
        req(
          "team",
          "POST",
          { person: person({ email: "admin@example.invalid" }) },
          cookie,
        ),
      )
    ).status,
    409,
  );
  const label = "'; DROP TABLE sahwa_users; --";
  const made = await team(
    req("team", "POST", { person: person({ fullName: label }) }, cookie),
  );
  assert.equal(made.status, 201);
  assert.equal((await made.json()).person.fullName, label);
  assert.equal((await store.listVolunteers()).length, 2);
});
