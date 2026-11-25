import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { pgliteClient } from "../server/pglite.js";
import { ensurePlatformSchema } from "../server/db.js";

test("a database with only the older migrations gets the platform tables on first use", async () => {
  const db = new PGlite();
  await db.exec(await readFile("db/migrations/001-team.sql", "utf8"));
  const second = await readFile("db/migrations/002-independent-volunteers.sql", "utf8");
  await db.transaction(async (tx) => {
    await tx.query("SELECT set_config('sahwa.shared_email','x@y',true)");
    for (const s of second.split(";").map((x) => x.trim()).filter(Boolean)) await tx.query(s);
  });
  await db.exec(await readFile("db/migrations/003-volunteer-role.sql", "utf8"));
  await db.query("INSERT INTO sahwa_volunteers(id,full_name,university,gender,status,role_id) VALUES ($1,'مسؤول صحوة','استنيا','شاب','نشط','sahwa-lead')", [randomUUID()]);
  await ensurePlatformSchema(pgliteClient(db));
  const roles = (await db.query("SELECT role_id FROM sahwa_role_assignments")).rows;
  assert.deepEqual(roles.map((r) => r.role_id), ["sahwa-lead"]);
  assert.equal((await db.query("SELECT count(*)::int AS c FROM sahwa_volunteers")).rows[0].c, 1);
  assert.equal((await db.query("SELECT to_regclass('public.sahwa_accounts') IS NOT NULL AS ok")).rows[0].ok, true);
  await db.close();
});
