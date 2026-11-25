// Runs the platform locally on an embedded PostgreSQL folder (.local-db) with
// the isolated test accounts. Development only; Neon is untouched.
import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";

const env = { ...process.env, SAHWA_LOCAL_DB: process.env.SAHWA_LOCAL_DB || ".local-db" };
if (!env.SAHWA_SESSION_SECRET) env.SAHWA_SESSION_SECRET = `local-dev-only-${randomBytes(24).toString("hex")}`;
const seed = spawnSync(process.execPath, ["scripts/seed-test-accounts.mjs"], { env, stdio: "inherit" });
if (seed.status !== 0) process.exit(seed.status ?? 1);
const port = process.env.PORT || "3000";
const child = spawn("npx", ["next", "dev", "--port", port], { env, stdio: "inherit" });
child.on("exit", (code) => process.exit(code ?? 0));
