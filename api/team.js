import { createTeamStore } from '../server/team-store.js';
import { createTeamHandler } from '../server/team-api.js';

const handle = createTeamHandler(createTeamStore());
export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
