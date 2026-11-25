import FormsInbox from "../../../../views/platform/FormsInbox";
import { requirePageActor } from "../../../../../server/page-auth";
export const metadata = { title: "الطلبات الواردة" };
export default async function Page() {
  await requirePageActor();
  return <FormsInbox />;
}
