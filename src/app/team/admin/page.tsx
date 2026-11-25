import { requirePageActor } from "../../../../server/page-auth";
import { canAny, isGlobalAdmin } from "../../../../server/platform/access.js";
import AdminPanel from "../../../views/platform/AdminPanel";

export const metadata = { title: "لوحة التحكم الإدارية" };

export default async function Page() {
  const actor = await requirePageActor({ permission: ["accounts.view", "permissions.manage", "permissions.delegate", "audit.view", "settings.manage", "forms.manage"] });
  const abilities = {
    accounts: canAny(actor, "accounts.view"),
    global: isGlobalAdmin(actor),
    grants: canAny(actor, "permissions.manage") || canAny(actor, "permissions.delegate"),
    forms: canAny(actor, "forms.manage") && isGlobalAdmin(actor),
    audit: canAny(actor, "audit.view"),
    settings: canAny(actor, "settings.manage"),
  };
  return <AdminPanel abilities={abilities} />;
}
