import TeamForms from "../../../views/TeamForms";
import { requirePageActor } from "../../../../server/page-auth";
export const metadata = { title: "النماذج والاقتراحات" };
export default async function Page() {
  await requirePageActor();
  return <TeamForms />;
}
