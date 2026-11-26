import { requirePageActor } from "../../../server/page-auth";
import { platformStore } from "../../../server/platform/store.js";
import { loadRealm, dashboardData, communityData, workspaceData } from "../../../server/platform/service.js";
import { todayInIstanbul } from "../../../shared/team-options.js";
import { roleText } from "../../lib/roleTexts";
import Dashboard from "../../views/platform/Dashboard";
import type { CommunityData } from "../../views/platform/Community";

export const metadata = { title: "لوحتي" };

export default async function Page() {
  const actor = await requirePageActor();
  const [posts, internalEvents] = await Promise.all([
    platformStore.posts(actor.isTest),
    platformStore.internalEvents(actor.isTest),
  ]);
  const community = communityData(actor, posts, internalEvents, todayInIstanbul()) as CommunityData;
  const ws = workspaceData(actor);
  const hasWorkspace = ws.tools.length > 0 || ws.later.length > 0;

  if (actor.kind === "owner") {
    return (
      <Dashboard
        isOwner
        hasWorkspace={hasWorkspace}
        person={{
          fullName: actor.fullName,
          university: "",
          major: "",
          membershipLevel: "مسؤول عام",
          status: "نشط",
          teams: [],
          username: actor.username,
        }}
        roles={[]}
        community={community}
      />
    );
  }

  const realm = await loadRealm(platformStore, actor.isTest);
  const data = dashboardData(actor, realm);
  const roles = data.roles.map((role: { roleId: string; sector: string | null }) => ({
    ...role,
    text: roleText(role.roleId, role.sector),
  }));

  return (
    <Dashboard
      hasWorkspace={hasWorkspace}
      person={data.person}
      roles={roles}
      community={community}
    />
  );
}
