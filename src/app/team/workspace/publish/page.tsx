import { requirePageActor } from "../../../../../server/page-auth";
import { platformStore } from "../../../../../server/platform/store.js";
import { communityData } from "../../../../../server/platform/service.js";
import { todayInIstanbul } from "../../../../../shared/team-options.js";
import Community from "../../../../views/platform/Community";
export const metadata = { title: "نشر مستجد" };
export default async function Page() {
  const actor = await requirePageActor({ permission: "posts.publish" });
  return <Community data={communityData(actor, await platformStore.posts(actor.isTest), [], todayInIstanbul())} showFeed={false} publish={false} workspace />;
}
