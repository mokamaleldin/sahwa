import { requirePageActor } from "../../../../server/page-auth";
import { platformStore } from "../../../../server/platform/store.js";
import { loadRealm, directoryData } from "../../../../server/platform/service.js";
import PeopleDirectory from "../../../views/platform/PeopleDirectory";
import PageHeading from "../../../components/shared/PageIdentity";

export const metadata = { title: "فريق صحوة" };

export default async function Page() {
  const actor = await requirePageActor({ permission: "directory.view" });
  if (actor.kind !== "account") {
    return (<><PageHeading title="فريق صحوة" description="دليل التعارف بين المتطوعين." /><p className="platform-empty">دليل التعارف يعتمد على سجلك الشخصي. ادخل بحسابك الشخصي لاستخدامه.</p></>);
  }
  const [realm, policy] = await Promise.all([loadRealm(platformStore, actor.isTest), platformStore.setting("directory.crossSector", "leads")]);
  return <PeopleDirectory data={directoryData(actor, realm, policy)} policy={policy} />;
}
