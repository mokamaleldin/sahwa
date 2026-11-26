import { requirePageActor } from "../../../../server/page-auth";
import { canAny, isGlobalAdmin } from "../../../../server/platform/access.js";
import AdminPanel from "../../../views/platform/AdminPanel";

export const metadata = { title: "سجل التغييرات والإعدادات" };

export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const actor = await requirePageActor({ permission: ["audit.view", "settings.manage"] });
  const abilities = {
    audit: canAny(actor, "audit.view"),
    settings: canAny(actor, "settings.manage") || isGlobalAdmin(actor),
  };
  const tab = (await searchParams).tab;
  return <AdminPanel key={tab} initial={tab} abilities={abilities} />;
}
