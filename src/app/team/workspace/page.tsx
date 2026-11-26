import { redirect } from "next/navigation";
import { requirePageActor } from "../../../../server/page-auth";
import { workspaceData } from "../../../../server/platform/service.js";
export default async function Page() {
  const actor = await requirePageActor();
  const tools = workspaceData(actor);
  const first = tools.find((tool: {id: string}) => tool.id === "events") || tools[0];
  if (first) redirect(first.href);
  return <p className="platform-muted">لا توجد أدوات متاحة لهذا الحساب حاليًا.</p>;
}
