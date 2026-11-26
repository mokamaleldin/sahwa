import { createRelationsHandler } from "../../../../server/relations-api.js";
import { stores } from "../../../../server/platform/stores.js";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const handle = createRelationsHandler(stores.teamStore, stores.platformStore);
export const GET = handle;
export const PUT = handle;
export const POST = handle;
