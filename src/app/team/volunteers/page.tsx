import Volunteers from "../../../views/TeamVolunteers";
import { requirePageActor } from "../../../../server/page-auth";
export default async function Page() {
  await requirePageActor({ permission: "volunteers.view" });
  return <Volunteers />;
}
