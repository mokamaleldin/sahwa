import { ChevronDown } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { GuideGovernanceBlocks } from "../../components/Team/GuideGovernance";
import type { RoleText } from "../../lib/roleTexts";

interface ContactPerson { id: string; name: string; role: string; scope: string }
interface ContactLink { relation: string; label: string; phrase: string; targetTitle: string; people: ContactPerson[]; vacant: boolean }
export interface DashboardRole {
  id: string; roleId: string; title: string; number: number | null; scope: string; teamTitle: string; deferred: boolean;
  contacts: { links: ContactLink[]; followers: ContactPerson[] };
  text: RoleText;
}
const RELATION_TITLES: Record<string, string> = { reports: "التبعية", coordinates: "التنسيق والتواصل", team: "ضمن الفريق" };

function People({ people }: { people: ContactPerson[] }) {
  return (
    <span>
      {people.map((p, i) => (
        <span key={p.id + i} className="block">
          <span className="platform-contact-name">{p.name}</span> <span className="platform-muted">— {p.role} ({p.scope})</span>
        </span>
      ))}
    </span>
  );
}

function RoleCard({ role }: { role: DashboardRole }) {
  const seen = new Set<string>();
  const reports = role.contacts.links.filter((link) => link.relation === "reports" || link.relation === "team");
  const managers = reports.flatMap((link) => link.people).filter((p) => !seen.has(p.id) && Boolean(seen.add(p.id)));
  const links = role.contacts.links.filter((l) => !reports.includes(l)).flatMap((l) => {
    const people = l.people.filter((p) => !seen.has(p.id) && Boolean(seen.add(p.id)));
    return people.length || l.vacant ? [{ ...l, people }] : [];
  });
  const followers = role.contacts.followers.filter((p) => !seen.has(p.id) && Boolean(seen.add(p.id)));
  return (
    <article className="platform-card platform-role-card" aria-labelledby={`role-${role.id}`}>
      <div className="platform-role-head">
        <div>
          <h3 id={`role-${role.id}`} className="font-heading">{role.title}</h3>
          <div className="platform-chips">
            <span className="platform-chip">{role.scope}</span>
            {role.teamTitle && <span className="platform-chip platform-chip-muted">{role.teamTitle}</span>}

          </div>
        </div>

      </div>
      {managers.length > 0 && <p className="platform-muted">المسؤول المباشر · <strong>{managers.map((p) => p.name).join("، ")}</strong></p>}
      {reports.filter((l) => l.vacant).map((l) => <p key={l.targetTitle} className="platform-muted">{l.targetTitle} · غير معيّن حاليًا</p>)}
      <details className="platform-details"><summary>التعريف والمسؤوليات والصلاحيات والتواصل <ChevronDown size={16} /></summary><div>
      {role.text.definition && (
        <div className="platform-definition">
          <GuideGovernanceBlocks blocks={[role.text.definition]} />
        </div>
      )}
      <div>
        <h4 className="text-sm text-[#350E15] font-semibold mb-1">أتواصل مع مين؟</h4>
        {links.length || followers.length ? (
          <div className="platform-contacts">
            {links.map((link, i) => (
              <div className="platform-contact" key={i}>
                <span className="platform-contact-label">{link.label}<br /><small>{RELATION_TITLES[link.relation]}</small></span>
                <span>
                  <span className="platform-muted block">«{link.phrase}»</span>
                  {link.vacant ? <span className="platform-contact-vacant">{link.targetTitle}: غير معيّن حاليًا</span> : <People people={link.people} />}
                </span>
              </div>
            ))}
            {followers.length > 0 && (
              <div className="platform-contact">
                <span className="platform-contact-label">يتبعونك وفق نصوص أدوارهم</span>
                <People people={followers} />
              </div>
            )}
          </div>
        ) : (
          <p className="platform-muted">لا توجد جهات تواصل إضافية لهذا التكليف.</p>
        )}
        <p className="platform-muted mt-2">التنسيق والتواصل لا يعنيان التبعية، ولا يخوّلان التكليف.</p>
      </div>
      {role.text.position && (
        <details className="platform-details">
          <summary>الموقع الإداري والتبعية والتواصل — النص الرسمي<ChevronDown size={18} aria-hidden="true" /></summary>
          <div><GuideGovernanceBlocks blocks={[role.text.position]} /></div>
        </details>
      )}
      <details className="platform-details">
        <summary>النص الكامل للدور من الباب الثاني{role.text.status ? ` (${role.text.status})` : ""}<ChevronDown size={18} aria-hidden="true" /></summary>
        <div>
          {role.text.entries.length ? role.text.entries.map((entry) => (
            <section key={entry.id} className="mb-4">
              <h4 className="font-heading text-[#752026] mb-2">{entry.title}</h4>
              <GuideGovernanceBlocks blocks={entry.blocks} />
            </section>
          )) : <p className="platform-muted">لم يُعثر على النص المرتبط بهذا الدور.</p>}
          {role.text.needsApproval && <p className="platform-notice">لا يوجد نص مستقل لهذا الدور في الباب الثاني؛ يُعرض تعريف المتطوع العام إلى أن يُعتمد الربط.</p>}
          {role.text.pendingTitles.length > 0 && <p className="platform-notice">نص «{role.text.pendingTitles.join("، ")}» محفوظ في دليل صحوة، ويُربط بهذه البطاقة بعد اعتماد الربط.</p>}
        </div>
      </details>
      </div></details>
    </article>
  );
}

interface Props {
  name: string;
  roles: DashboardRole[];
  owner: boolean;
  reviewActivity: boolean;
  tools: { id: string; title: string; href: string }[];
  children: ReactNode;
}
export default function Dashboard({ name, roles, owner, reviewActivity, tools, children }: Props) {
  return <>
    <section className="dashboard-welcome">
      <h1 className="font-heading">أهلًا، {name.trim().split(/\s+/)[0]}</h1>
      <p>شكرًا على تطوعك في صحوة، جزاك الله خيرًا على وقتك وجهدك.</p>
    </section>
    <section aria-labelledby="my-role">
      <h2 id="my-role" className="platform-section-title font-heading">دوري في صحوة</h2>
      {reviewActivity && <p className="platform-notice">صلاحيات العمل معلّقة بسبب حالة النشاط. يُرجى مراجعة تكليفك مع مسؤولك.</p>}
      {roles.length ? <div className="platform-grid">{roles.map((role) => <RoleCard key={role.id} role={role} />)}</div>
        : <p className="platform-muted">{owner ? "حساب إدارة المنصة" : "لم يُسند إليك دور تنظيمي بعد."}</p>}
    </section>
    {tools.length > 0 && <section id="workspace">
      <h2 className="platform-section-title font-heading">مساحة العمل</h2>
      <div className="platform-shortcuts">{tools.map((tool) => <Link key={tool.id} className="platform-shortcut" href={tool.href}>{tool.title}</Link>)}</div>
    </section>}
    {children}
  </>;
}
