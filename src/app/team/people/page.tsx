import { requirePageActor } from "../../../../server/page-auth";
import { platformStore } from "../../../../server/platform/store.js";
import { loadRealm, directoryData } from "../../../../server/platform/service.js";
import PeopleDirectory from "../../../views/platform/PeopleDirectory";

export const metadata = { title: "فريق صحوة" };

export default async function Page() {
  const actor = await requirePageActor({ permission: "directory.view" });
  const [realm, policy] = await Promise.all([loadRealm(platformStore, actor.isTest), platformStore.setting("directory.crossSector", "leads")]);
  return <PeopleDirectory data={directoryData(actor, realm, policy)} policy={policy} />;
}
