import { redirect } from "next/navigation";
import { requirePageActor } from "../../../../server/page-auth";

export const metadata = { title: "ملفي الشخصي" };

export default async function Page() {
  await requirePageActor({ allowPasswordChange: true });
  redirect("/team/account?tab=profile");
}
