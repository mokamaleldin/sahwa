import Volunteers from "../../../views/TeamVolunteers";
import { requirePageUser } from "../../../../server/page-auth";
export default async function Page() {
  await requirePageUser(true);
  return <Volunteers />;
}
