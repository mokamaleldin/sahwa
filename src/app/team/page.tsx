import { requirePageActor } from "../../../server/page-auth";
import { platformStore } from "../../../server/platform/store.js";
import { canAny } from "../../../server/platform/access.js";
import { loadRealm, dashboardData, communityData } from "../../../server/platform/service.js";
import { todayInIstanbul } from "../../../shared/team-options.js";
import { roleById } from "../../../shared/platform-roles.js";
import { roleText, generalVolunteerText } from "../../lib/roleTexts";
import Dashboard from "../../views/platform/Dashboard";
import Community from "../../views/platform/Community";

export const metadata = { title: "لوحتي" };

export default async function Page({ searchParams }: { searchParams: Promise<{ publish?: string }> }) {
  const actor = await requirePageActor();
  const feed = canAny(actor, "community.view");
  const [realm, posts, events, params] = await Promise.all([
    actor.kind === "owner" ? null : loadRealm(platformStore, actor.isTest),
    feed ? platformStore.posts(actor.isTest) : [], feed ? platformStore.internalEvents(actor.isTest) : [], searchParams,
  ]);
  const roles = realm ? dashboardData(actor, realm).roles.map((r: { roleId: string; sector: string | null }) => ({ ...r, text: roleText(r.roleId, r.sector) })) : [];
  const today = todayInIstanbul();
  const community = communityData(actor, posts, events, today);
  const boardMember = roles.some((r: {roleId: string}) => ["sahwa-lead", "women-sector-lead", "central-activities-lead", "media-lead", "central-relations-lead"].includes(r.roleId));
  return <Dashboard name={actor.fullName} women={actor.sector === "women"} roles={roles} owner={actor.kind === "owner"} boardMember={boardMember} general={generalVolunteerText()}
    reviewActivity={actor.kind === "account" && actor.status !== "نشط" && actor.assignments.some((a: {roleId: string}) => roleById(a.roleId)?.level === "lead")}>
    {(feed || community.canPublish) && <Community key={params.publish || "read"} data={community} showFeed={feed} publish={params.publish === "1"} />}
  </Dashboard>;
}
