import { requirePageActor } from "../../../../../server/page-auth";
import FormsManager from "../../../../views/platform/FormsManager";

export const metadata = { title: "إدارة النماذج" };

export default async function Page() {
  await requirePageActor({ permission: "forms.manage" });
  return <FormsManager />;
}
