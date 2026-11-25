import TeamGuide from "../../../views/TeamGuide";
import { requirePageActor } from "../../../../server/page-auth";

export const metadata = { title: "لائحة صحوة" };

export default async function GuidePage() {
  await requirePageActor({ permission: "guide.view" });
  return <TeamGuide />;
}
