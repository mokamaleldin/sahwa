import { redirect } from "next/navigation";
import { requirePageActor } from "../../../../server/page-auth";

export default async function Page() {
  await requirePageActor();
  redirect("/team/workspace");
}
