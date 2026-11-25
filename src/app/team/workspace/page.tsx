import Link from "next/link";
import { ArrowUpLeft, Hourglass } from "lucide-react";
import { requirePageActor } from "../../../../server/page-auth";
import { workspaceData } from "../../../../server/platform/service.js";
import PageHeading from "../../../components/shared/PageIdentity";

export const metadata = { title: "مساحة العمل" };

interface Tool { id: string; title: string; description: string; href: string }

export default async function Page() {
  const actor = await requirePageActor();
  const data = workspaceData(actor) as { categories: { id: string; title: string; tools: Tool[] }[]; later: { id: string; title: string }[] };
  return (
    <>
      <PageHeading title="مساحة العمل" description="الأدوات التي يتيحها لك دورك وصلاحياتك. تختلف من شخص لآخر." />
      {data.categories.length ? data.categories.map((category) => (
        <section key={category.id} aria-labelledby={`ws-${category.id}`}>
          <h2 id={`ws-${category.id}`} className="platform-section-title font-heading">{category.title}</h2>
          <div className="platform-grid platform-grid-3">
            {category.tools.map((tool) => (
              <Link key={tool.id + tool.href} href={tool.href} className="platform-card block hover:border-[#D6AD63]">
                <h3 className="font-heading">{tool.title}</h3>
                <p>{tool.description}</p>
                <span className="team-card-action">فتح <ArrowUpLeft size={16} aria-hidden="true" /></span>
              </Link>
            ))}
          </div>
        </section>
      )) : (
        <p className="platform-empty">لا توجد أدوات عمل مخصصة لدورك حاليًا. يمكنك متابعة أهل صحوة، والتعرف على الفريق، وتقديم أفكارك من النماذج. عند تكليفك بمهمة يمكن للمسؤول المختص منحك وصولًا محددًا.</p>
      )}
      {data.later.length > 0 && (
        <section aria-labelledby="ws-later">
          <h2 id="ws-later" className="platform-section-title font-heading">تطوير لاحق</h2>
          <div className="platform-grid platform-grid-3">
            {data.later.map((c) => (
              <div key={c.id} className="platform-card">
                <h3 className="font-heading flex items-center gap-2"><Hourglass size={18} aria-hidden="true" />{c.title}</h3>
                <p>الدور مسجل في المنصة ومرتبط بنصه الرسمي. مساحة العمل التفصيلية تُطوَّر بعد اعتماد احتياجاتها.</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
