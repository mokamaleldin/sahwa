import Events from "../../../views/TeamEvents";
import { requirePageUser } from "../../../../server/page-auth";
export default async function Page() {
  await requirePageUser(true);
  return <Events />;
}
