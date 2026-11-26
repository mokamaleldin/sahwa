import Link from "next/link";
import { ArrowUpLeft, CalendarDays, Hourglass, Inbox, Palette, ShieldCheck, UsersRound } from "lucide-react";
import { requirePageActor } from "../../../../server/page-auth";
import { workspaceData } from "../../../../server/platform/service.js";
import PageHeading from "../../../components/shared/PageIdentity";

export const metadata = { title: "مساحة العمل" };

interface Tool { id: string; title: string; description: string; href: string }

const ICONS: Record<string, typeof UsersRound> = {
  volunteers: UsersRound,
  events: CalendarDays,
  inbox: Inbox,
  admin: ShieldCheck,
  studio: Palette,
};

export default async function Page() {
  const actor = await requirePageActor();
  const data = workspaceData(actor) as { tools: Tool[]; later: { id: string; title: string }[] };

  return (
    <>
      <PageHeading title="مساحة العمل" description="الأدوات المتاحة لدورك وصلاحياتك في مكان واحد." />
      {data.tools.length ? (
        <div className="platform-grid platform-grid-3">
          {data.tools.map((tool) => {
            const Icon = ICONS[tool.id] || ShieldCheck;
            return (
              <Link key={tool.id} href={tool.href} className="platform-card platform-tool-card block hover:border-[#D6AD63]">
                <span className="team-icon team-icon-small mb-4">
                  <Icon size={22} strokeWidth={1.6} aria-hidden="true" />
                </span>
                <h2 className="font-heading">{tool.title}</h2>
                <p>{tool.description}</p>
                <span className="team-card-action">
                  فتح
                  <ArrowUpLeft size={16} aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="platform-empty">
          لا توجد أدوات عمل مخصصة لدورك حاليًا. يمكنك متابعة مستجدات أهل صحوة من لوحتك، وتقديم أفكارك من صفحة النماذج.
        </p>
      )}
      {data.later.length > 0 && (
        <section aria-labelledby="ws-later">
          <h2 id="ws-later" className="platform-section-title font-heading">مساحات قيد التطوير</h2>
          <div className="platform-grid platform-grid-3">
            {data.later.map((c) => (
              <div key={c.id} className="platform-card">
                <h3 className="font-heading flex items-center gap-2">
                  <Hourglass size={18} aria-hidden="true" />
                  {c.title}
                </h3>
                <p>الدور مسجل ومرتبط بنصه الرسمي، وستُضاف أدواته التفصيلية قريبًا.</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
