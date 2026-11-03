import { createAuthHandler } from "../../../../server/auth-api.js";
import { teamStore } from "../../../../server/team-store.js";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const handle = createAuthHandler(teamStore);
export const GET = handle;
export const POST = handle;
export const DELETE = handle;
