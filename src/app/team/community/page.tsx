import { requirePageActor } from "../../../../server/page-auth";
import { platformStore } from "../../../../server/platform/store.js";
import { communityData } from "../../../../server/platform/service.js";
import { todayInIstanbul } from "../../../../shared/team-options.js";
import Community from "../../../views/platform/Community";

export const metadata = { title: "أهل صحوة" };

export default async function Page() {
  const actor = await requirePageActor({ permission: "community.view" });
  const [posts, events] = await Promise.all([platformStore.posts(actor.isTest), platformStore.internalEvents(actor.isTest)]);
  const data = communityData(actor, posts, events, todayInIstanbul());
  return <Community data={data} university={actor.university || ""} />;
}
