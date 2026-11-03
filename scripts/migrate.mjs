import { readFile, readdir } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";
const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) throw new Error("Set DATABASE_URL_UNPOOLED before migrations.");
if (new URL(url).hostname.includes("-pooler"))
  throw new Error("Migrations require the direct, unpooled URL.");
const email = process.env.SAHWA_ACCOUNT_EMAIL?.trim().toLowerCase();
if (!email)
  throw new Error(
    "Set SAHWA_ACCOUNT_EMAIL before migrations so the shared account is excluded from the volunteer directory.",
  );
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
