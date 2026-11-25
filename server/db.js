import { neon } from "@neondatabase/serverless";
let sql;
let local;

// SAHWA_LOCAL_DB points at a PGlite data folder for local development only.
// It is refused in production builds so it can never replace Neon there.
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

function lazyLocal() {
  return {
    query(text, params = []) {
      return { text, params, then: (resolve, reject) => localClient().then((client) => client.query(text, params)).then(resolve, reject) };
    },
    transaction: (queries) => localClient().then((client) => client.transaction(queries)),
  };
}

export function usingLocalDatabase() {
  return Boolean(process.env.SAHWA_LOCAL_DB) && process.env.VERCEL_ENV !== "production" && process.env.VERCEL !== "1";
}

export function getSql() {
  if (!sql) {
    if (usingLocalDatabase()) sql = lazyLocal();
    else {
      if (!process.env.DATABASE_URL) throw new Error("Database is not configured");
      sql = neon(process.env.DATABASE_URL);
    }
  }
  return sql;
}
