import TeamFiles from "../../../views/TeamFiles";
import { requirePageActor } from "../../../../server/page-auth";
export default async function Page() {
  await requirePageActor({ permission: "files.view" });
  return <TeamFiles />;
}
