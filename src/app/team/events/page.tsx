import Events from "../../../views/TeamEvents";
import { requirePageActor } from "../../../../server/page-auth";
export default async function Page() {
  await requirePageActor({ permission: "events.view" });
  return <Events />;
}
