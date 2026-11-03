import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import { createTeamStore } from "../../server/team-store.js";
export async function testDatabase() {
  const db = new PGlite();
  await db.exec(
    await readFile(
      new URL("../../db/migrations/001-team.sql", import.meta.url),
      "utf8",
    ),
  );
  const sql = {
    query(text, params = []) {
      return {
        text,
        params,
        then(resolve, reject) {
          return db
            .query(text, params)
            .then((r) => r.rows)
            .then(resolve, reject);
        },
      };
    },
    transaction(queries) {
      return db.transaction(async (tx) => {
        const results = [];
        for (const q of queries)
          results.push((await tx.query(q.text, q.params)).rows);
        return results;
      });
    },
  };
  return { db, store: createTeamStore(() => sql) };
}
export const person = (overrides = {}) => ({
  fullName: "أحمد محمد",
  email: "ahmed@example.invalid",
  university: "استنيا",
  major: "هندسة",
  studyYear: "الثانية",
  birthDate: "2004-02-29",
  gender: "شاب",
  team: "الإعلام",
  responsibility: "متطوع",
  status: "نشط",
  accessRole: "volunteer",
  password: "fixture-password-only",
  ...overrides,
});
export const event = (overrides = {}) => ({
  title: "لقاء صحوة",
  eventDate: "2026-11-03",
  responsible: "أحمد",
  attendance: null,
  notes: "",
  ...overrides,
});
