import { readFileSync } from "node:fs";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";
let sql;
let local;
let schema;

// SAHWA_LOCAL_DB points at a PGlite data folder for local development only.
// One instance per process: Next dev loads route handlers and pages as
// separate module graphs, and two PGlite instances on one folder diverge.
async function localClient() {
  if (!local) local = globalThis.__sahwaLocalDb;
  if (!local) {
    local = globalThis.__sahwaLocalDb = (async () => {
      const { PGlite } = await import("@electric-sql/pglite");
      const { pgliteClient, migrate } = await import("./pglite.js");
      const db = new PGlite(process.env.SAHWA_LOCAL_DB);
      await migrate(db, process.env.SAHWA_ACCOUNT_EMAIL?.trim().toLowerCase() || "");
      return pgliteClient(db);
    })();
  }
  return local;
}

// Platform migrations (004, 005) are additive and idempotent. When a
// deployment reaches a database that does not have them yet, they run once
// per server instance before the first query.
const PLATFORM_MIGRATIONS = ["004-platform.sql", "005-owner-email-login.sql", "006-platform-simplification.sql", "007-team-workspace.sql"];

async function applied(client) {
  const [state] = await client.query(
    `SELECT to_regclass('public.sahwa_form_submissions') IS NOT NULL AS "m004",
       EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sahwa_accounts' AND column_name='is_owner') AS "m005",
       EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sahwa_events' AND column_name='created_by_volunteer') AS "m006",
       to_regprocedure('sahwa_scope_allows(jsonb,text,text,text,text)') IS NOT NULL AS "m007"`,
  );
  return state || {};
}

function migrationStatements(name) {
  return readFileSync(join(process.cwd(), "db", "migrations", name), "utf8")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

// The general administrator comes from server variables (never from the
// repository). It is created once; later password changes made inside the
// platform are kept.
export async function ensureOwner(client, env = process.env) {
  const email = env.SAHWA_OWNER_EMAIL?.trim().toLowerCase();
  const hash = env.SAHWA_OWNER_PASSWORD_HASH?.trim();
  if (!email || !/^scrypt\$16384\$[a-f0-9]{32}\$[a-f0-9]{64}$/.test(hash || "")) return;
  const username = email.split("@")[0].toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, 40).padEnd(3, "0");
  await client.query(
    `INSERT INTO sahwa_accounts(id, volunteer_id, username, email, display_name, password_hash, must_change_password, is_owner, created_by)
     SELECT '5a4f0000-0000-4000-8000-000000000001'::uuid, NULL::uuid, $1::varchar, $2::varchar, 'المسؤول العام', $3::text, false, true, 'إعداد المنصة'
     WHERE NOT EXISTS (SELECT 1 FROM sahwa_accounts WHERE is_owner OR email = $2::varchar OR username = $1::varchar)`,
    [username, email, hash],
  );
}

export function ensurePlatformSchema(client) {
  if (!schema) {
    schema = (async () => {
      const before = await applied(client);
      for (const name of PLATFORM_MIGRATIONS) {
        const key = `m${name.slice(0, 3)}`;
        if (before[key]) continue;
        try {
          await client.transaction(migrationStatements(name).map((s) => client.query(s)));
        } catch (error) {
          // Another instance may have applied the same migration at the same moment.
          if (!(await applied(client))[key]) throw error;
        }
      }
      await ensureOwner(client);
    })().catch((error) => {
      schema = undefined;
      throw error;
    });
  }
  return schema;
}

function deferred(ready, client) {
  return {
    query(text, params = []) {
      return { text, params, then: (resolve, reject) => ready().then(() => client().query(text, params)).then(resolve, reject) };
    },
    transaction: (queries) => ready().then(() => client().transaction(queries.map((q) => client().query(q.text, q.params)))),
  };
}

export function usingLocalDatabase() {
  return Boolean(process.env.SAHWA_LOCAL_DB) && process.env.VERCEL_ENV !== "production" && process.env.VERCEL !== "1";
}

export function getSql() {
  if (!sql) {
    if (usingLocalDatabase()) {
      sql = {
        query(text, params = []) {
          return { text, params, then: (resolve, reject) => localClient().then((c) => c.query(text, params)).then(resolve, reject) };
        },
        transaction: (queries) => localClient().then((c) => c.transaction(queries)),
      };
    } else {
      if (!process.env.DATABASE_URL) throw new Error("Database is not configured");
      const client = neon(process.env.DATABASE_URL);
      sql = deferred(() => ensurePlatformSchema(client), () => client);
    }
  }
  return sql;
}
