// Embedded PostgreSQL (PGlite) for tests and local development only.
// It mirrors the small part of the Neon client the stores use:
// sql.query(text, params) resolving to rows, and sql.transaction(queries).
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

export function pgliteClient(db) {
  return {
    query(text, params = []) {
      return {
        text,
        params,
        then(resolve, reject) {
          return db.query(text, params).then((result) => result.rows).then(resolve, reject);
        },
      };
    },
    transaction(queries) {
      return db.transaction(async (tx) => {
        const results = [];
        for (const query of queries) results.push((await tx.query(query.text, query.params)).rows);
        return results;
      });
    },
  };
}

export async function migrate(db, sharedEmail = "") {
  // Resolved at runtime from the project root (scripts, tests and next dev run there).
  const directory = join(process.cwd(), "db", "migrations");
  const files = (await readdir(directory)).filter((name) => name.endsWith(".sql")).sort();
  for (const name of files) {
    const content = await readFile(join(directory, name), "utf8");
    const statements = content.split(";").map((s) => s.trim()).filter(Boolean);
    await db.transaction(async (tx) => {
      await tx.query("SELECT set_config('sahwa.shared_email',$1,true)", [sharedEmail]);
      for (const statement of statements) await tx.query(statement);
    });
  }
}
