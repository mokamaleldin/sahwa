import Link from "next/link";
import { requirePageActor } from "../../../../server/page-auth";
import { workspaceData } from "../../../../server/platform/service.js";
export const metadata = { title: "مساحة العمل" };
export default async function Page() {
  const actor = await requirePageActor();
  const tools = workspaceData(actor);
  return <section><h1 className="font-heading text-2xl text-brand-primary">مساحة العمل</h1><p className="platform-muted mb-5">اختر الأداة التي تحتاجها من القائمة أو من البطاقات أدناه.</p><div className="platform-shortcuts">{tools.map((tool: {id:string;title:string;href:string}) => <Link key={tool.id} href={tool.href} className="platform-shortcut">{tool.title}</Link>)}</div>{!tools.length && <p className="platform-muted">لا توجد أدوات متاحة لهذا الحساب حاليًا.</p>}</section>;
}
