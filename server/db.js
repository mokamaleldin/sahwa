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

// The platform tables (migration 004) are additive and idempotent. When a
// deployment reaches a database that does not have them yet, they are
// created once per server instance before the first query.
export function ensurePlatformSchema(client) {
  if (!schema) {
    schema = (async () => {
      const [state] = await client.query(
        "SELECT to_regclass('public.sahwa_form_submissions') IS NOT NULL AS ready, EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sahwa_events' AND column_name='audience') AS events",
      );
      if (state?.ready && state?.events) return;
      const statements = readFileSync(join(process.cwd(), "db/migrations/004-platform.sql"), "utf8")
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean);
      try {
        await client.transaction(statements.map((s) => client.query(s)));
      } catch (error) {
        // Another instance may have created the same objects at the same moment.
        const [again] = await client.query("SELECT to_regclass('public.sahwa_form_submissions') IS NOT NULL AS ready");
        if (!again?.ready) throw error;
      }
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
