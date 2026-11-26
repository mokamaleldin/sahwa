import { requirePageActor } from "../../../../server/page-auth";
import { canAny, isGlobalAdmin } from "../../../../server/platform/access.js";
import AdminPanel from "../../../views/platform/AdminPanel";

export const metadata = { title: "لوحة التحكم" };

export default async function Page({ searchParams }: { searchParams?: Promise<{ tab?: string }> }) {
  const actor = await requirePageActor({
    permission: ["accounts.view", "permissions.manage", "permissions.delegate", "audit.view", "settings.manage", "forms.manage"],
  });
  const params = searchParams ? await searchParams : {};
  const initialTab = typeof params?.tab === "string" ? params.tab : undefined;
  const abilities = {
    accounts: canAny(actor, "accounts.view"),
    global: isGlobalAdmin(actor),
    grants: canAny(actor, "permissions.manage") || canAny(actor, "permissions.delegate"),
    forms: canAny(actor, "forms.manage") && isGlobalAdmin(actor),
    audit: canAny(actor, "audit.view"),
    settings: canAny(actor, "settings.manage") || isGlobalAdmin(actor),
  };
  return <AdminPanel abilities={abilities} initialTab={initialTab} />;
}
