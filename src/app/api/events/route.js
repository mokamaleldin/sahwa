import { createEventsHandler } from "../../../../server/events-api.js";
import { teamStore } from "../../../../server/team-store.js";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const handle = createEventsHandler(teamStore);
export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
