import { readFile, readdir } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";
const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) throw new Error("Set DATABASE_URL_UNPOOLED before migrations.");
if (new URL(url).hostname.includes("-pooler"))
  throw new Error("Migrations require the direct, unpooled URL.");
// Only migration 002 used this, to keep the former shared account out of the volunteer list.
const email = process.env.SAHWA_ACCOUNT_EMAIL?.trim().toLowerCase() || "";
const sql = neon(url),
  directory = new URL("../db/migrations/", import.meta.url);
const files = (await readdir(directory))
  .filter((name) => name.endsWith(".sql"))
  .sort();
for (const name of files) {
  const content = await readFile(new URL(name, directory), "utf8");
  const statements = content
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
  await sql.transaction([
    sql.query("SELECT set_config('sahwa.shared_email',$1,true)", [email]),
    ...statements.map((s) => sql.query(s)),
  ]);
  console.log(`Migration ${name} completed.`);
}
