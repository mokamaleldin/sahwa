import { requirePageActor } from "../../../../server/page-auth";
import { canAny, isGlobalAdmin } from "../../../../server/platform/access.js";
import AdminPanel from "../../../views/platform/AdminPanel";

export const metadata = { title: "لوحة التحكم" };

export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const actor = await requirePageActor({ permission: ["permissions.manage", "permissions.delegate", "audit.view", "settings.manage", "forms.manage"] });
  const abilities = {
    accounts: canAny(actor, "accounts.view"),
    global: isGlobalAdmin(actor),
    grants: canAny(actor, "permissions.manage") || canAny(actor, "permissions.delegate"),
    forms: canAny(actor, "forms.manage"),
    audit: canAny(actor, "audit.view"),
    settings: canAny(actor, "settings.manage") || isGlobalAdmin(actor),
  };
  const tab = (await searchParams).tab;
  return <AdminPanel key={tab} initial={tab} abilities={abilities} />;
}
