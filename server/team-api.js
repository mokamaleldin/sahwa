import { requireUser } from "./auth.js";
import { recordVersion, validatePerson } from "./team-data.js";
import { json, readInput, errorResponse } from "./http.js";

export function createTeamHandler(store) {
  return async (request) => {
    try {
      await requireUser(request, store, true);
      if (request.method === "GET")
        return json({ volunteers: await store.listVolunteers() });
      if (!["POST", "PUT"].includes(request.method))
        return json({ error: "طريقة طلب غير متاحة." }, 405);
      const input = await readInput(request);
      const creating = request.method === "POST";
      if (!creating) recordVersion(input);
      const person = validatePerson(input.person);
      const saved = creating
        ? await store.createVolunteer(person)
        : await store.updateVolunteer(input.id, input.revision, person);
      return json({ person: saved }, creating ? 201 : 200);
    } catch (error) {
      return errorResponse(error);
    }
  };
}
