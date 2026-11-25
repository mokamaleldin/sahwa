import { requirePageActor } from "../../../../server/page-auth";
import AccountSettings from "../../../views/platform/AccountSettings";
import PageHeading from "../../../components/shared/PageIdentity";

export const metadata = { title: "إعدادات الحساب" };

export default async function Page() {
  const actor = await requirePageActor({ allowPasswordChange: true });
  if (actor.kind !== "account")
    return (<><PageHeading title="إعدادات الحساب" description="" /><p className="platform-empty">الحساب المشترك تُدار كلمة مروره من متغيرات الخادم، لا من هنا.</p></>);
  return <AccountSettings username={actor.username} forced={actor.mustChangePassword} />;
}
