import { requirePageActor } from "../../../../server/page-auth";
import AccountSettings from "../../../views/platform/AccountSettings";

export const metadata = { title: "إعدادات الحساب" };

export default async function Page() {
  const actor = await requirePageActor({ allowPasswordChange: true });
  return <AccountSettings username={actor.username} forced={actor.mustChangePassword} />;
}
