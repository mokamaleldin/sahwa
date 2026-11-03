import { requireUser } from "./auth.js";
import { recordVersion, validateEvent } from "./team-data.js";
import { json, readInput, errorResponse } from "./http.js";

export function createEventsHandler(store) {
  return async (request) => {
    try {
      const user = await requireUser(request, store, true);
      if (request.method === "GET")
        return json({ events: await store.listEvents() });
      if (!["POST", "PUT", "DELETE"].includes(request.method))
        return json({ error: "طريقة طلب غير متاحة." }, 405);
      const input = await readInput(request);
      if (request.method !== "POST") recordVersion(input);
      if (request.method === "DELETE") {
        await store.deleteEvent(input.id, input.revision);
        return json({ deleted: true });
      }
      const event = validateEvent(input.event);
      const saved =
        request.method === "POST"
          ? await store.createEvent(event, user.id)
          : await store.updateEvent(input.id, input.revision, event);
      return json({ event: saved }, request.method === "POST" ? 201 : 200);
    } catch (error) {
      return errorResponse(error);
    }
  };
}
