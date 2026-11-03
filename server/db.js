import { neon } from "@neondatabase/serverless";
let sql;
export function getSql() {
  if (!sql) {
    if (!process.env.DATABASE_URL)
      throw new Error("Database is not configured");
    sql = neon(process.env.DATABASE_URL);
  }
  return sql;
}
