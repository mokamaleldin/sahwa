import { requireUser, hashPassword } from "./auth.js";
import { TeamError, recordVersion, validatePerson } from "./team-data.js";
import { json, readInput, errorResponse } from "./http.js";

export function createTeamHandler(store) {
  return async (request) => {
    try {
      const user = await requireUser(request, store, true);
      if (request.method === "GET")
        return json({ volunteers: await store.listVolunteers() });
      if (!["POST", "PUT"].includes(request.method))
        return json({ error: "طريقة طلب غير متاحة." }, 405);
      const input = await readInput(request);
      const creating = request.method === "POST";
      if (!creating) recordVersion(input);
      const person = validatePerson(input.person, creating);
      if (
        !creating &&
        input.id === user.id &&
        (person.accessRole !== "admin" ||
          !["نشط", "خريج"].includes(person.status))
      )
        throw new TeamError(
          "لا يمكنك إيقاف حسابك أو إزالة صلاحياتك من هنا. اطلب من مسؤول آخر تنفيذ ذلك.",
        );
      const passwordHash = person.password
        ? await hashPassword(person.password)
        : null;
      const saved = creating
        ? await store.createVolunteer(person, passwordHash)
        : await store.updateVolunteer(
            input.id,
            input.revision,
            person,
            passwordHash,
          );
      return json({ person: saved }, creating ? 201 : 200);
    } catch (error) {
      return errorResponse(error);
    }
  };
}
