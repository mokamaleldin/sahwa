import { createTeamHandler } from "../../../../server/team-api.js";
import { teamStore } from "../../../../server/team-store.js";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const handle = createTeamHandler(teamStore);
export const GET = handle;
export const POST = handle;
export const PUT = handle;
