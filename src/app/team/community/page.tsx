import { redirect } from "next/navigation";
import { requirePageActor } from "../../../../server/page-auth";

export const metadata = { title: "أهل صحوة" };

export default async function Page() {
  await requirePageActor({ permission: "community.view" });
  redirect("/team#community");
}
