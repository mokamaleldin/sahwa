import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url)
  throw new Error(
    "Set DATABASE_URL_UNPOOLED in .env.local before running migrations.",
  );
if (new URL(url).hostname.includes("-pooler"))
  throw new Error("Migrations require the direct, unpooled database URL.");
const sql = neon(url);
const migration = await readFile(
  new URL("../db/migrations/001-team.sql", import.meta.url),
  "utf8",
);
// All statements in this migration are static SQL, not request data.
await sql.transaction(
  migration
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => sql.query(s)),
);
console.log("Sahwa team migration completed.");
