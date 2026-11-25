import TeamGuide from "../../../views/TeamGuide";
import { requirePageUser } from "../../../../server/page-auth";

export const metadata = { title: "لائحة صحوة" };

export default async function GuidePage() {
  await requirePageUser();
  return <TeamGuide />;
}
