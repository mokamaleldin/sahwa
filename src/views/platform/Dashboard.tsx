import { BookOpenCheck, CalendarDays, ChevronDown, ClipboardList, LayoutGrid, Lightbulb, UsersRound } from "lucide-react";
import Link from "next/link";
import PageHeading from "../../components/shared/PageIdentity";
import { GuideGovernanceBlocks } from "../../components/Team/GuideGovernance";
import type { RoleText } from "../../lib/roleTexts";

interface ContactPerson { id: string; name: string; role: string; scope: string }
interface ContactLink { relation: string; label: string; phrase: string; targetTitle: string; people: ContactPerson[]; vacant: boolean }
export interface DashboardRole {
  id: string; roleId: string; title: string; number: number | null; scope: string; teamTitle: string; deferred: boolean;
  contacts: { links: ContactLink[]; followers: ContactPerson[] };
  text: RoleText;
}
export interface DashboardProps {
  person: { fullName: string; university: string; major: string; membershipLevel: string; status: string; teams: string[]; username: string };
  roles: DashboardRole[];
  eventsThisYear: number | null;
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
  const links = role.contacts.links.filter((l) => {
    const key = l.people.map((p) => p.id).join(",") || l.targetTitle;
    if (l.relation !== "reports" && seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return (
    <article className="platform-card platform-role-card" aria-labelledby={`role-${role.id}`}>
      <div className="platform-role-head">
        <div>
          <h3 id={`role-${role.id}`} className="font-heading">{role.title}</h3>
          <div className="platform-chips">
            <span className="platform-chip">{role.scope}</span>
            {role.teamTitle && <span className="platform-chip platform-chip-muted">{role.teamTitle}</span>}
            {role.deferred && <span className="platform-chip platform-chip-gold">مساحة العمل مؤجلة</span>}
          </div>
        </div>
        {role.number && <span className="platform-role-number">{String(role.number).padStart(2, "0")}</span>}
      </div>
      {role.text.definition && (
        <div className="platform-definition">
          <GuideGovernanceBlocks blocks={[role.text.definition]} />
        </div>
      )}
      <div>
        <h4 className="text-sm text-[#350E15] font-semibold mb-1">أتواصل مع مين؟</h4>
        {links.length || role.contacts.followers.length ? (
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
            {role.contacts.followers.length > 0 && (
              <div className="platform-contact">
                <span className="platform-contact-label">يتبعونك وفق نصوص أدوارهم</span>
                <People people={role.contacts.followers} />
              </div>
            )}
          </div>
        ) : (
          <p className="platform-muted">لا يحدد النص الرسمي لهذا الدور جهة تبعية ثابتة يمكن ربطها بشخص. ارجع إلى النص الكامل أدناه.</p>
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
    </article>
  );
}

export default function Dashboard({ person, roles, eventsThisYear }: DashboardProps) {
  const shortcuts = [
    { href: "/team/community", label: "أهل صحوة", icon: UsersRound },
    { href: "/team/workspace", label: "مساحة العمل", icon: LayoutGrid },
    { href: "/team/guide", label: "دليل صحوة", icon: BookOpenCheck },
    { href: "/team/forms", label: "قدّم فكرة", icon: Lightbulb },
  ];
  return (
    <>
      <PageHeading title="لوحتي" description="من أنت في صحوة، وما أدوارك، ومن تتواصل معه." />
      <section className="platform-card mb-6" aria-label="بطاقتي">
        <div className="platform-person">
          <div>
            <h1 className="font-heading">{person.fullName}</h1>
            <p className="platform-muted">{[person.university, person.major].filter(Boolean).join(" — ")}</p>
          </div>
          <div className="platform-chips">
            {person.membershipLevel && <span className="platform-chip platform-chip-gold">{person.membershipLevel}</span>}
            {person.teams.map((t) => <span key={t} className="platform-chip">{t}</span>)}
            <span className="platform-chip platform-chip-muted" title="حالة العضوية تظهر لك وحدك">{person.status}</span>
          </div>
        </div>
      </section>
      <nav className="platform-shortcuts mb-6" aria-label="اختصارات">
        {shortcuts.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="platform-shortcut"><Icon size={20} aria-hidden="true" />{label}</Link>
        ))}
      </nav>
      <h2 className="platform-section-title font-heading">دوري في صحوة <small>{roles.length ? `${roles.length.toLocaleString("ar-EG")} ${roles.length === 1 ? "دور" : "أدوار"}` : ""}</small></h2>
      {roles.length ? (
        <div className="platform-grid">{roles.map((role) => <RoleCard key={role.id} role={role} />)}</div>
      ) : (
        <p className="platform-empty">لا يوجد دور تنظيمي مسند لك حاليًا. يمكنك المشاركة في الفرص وتقديم الأفكار، وسيظهر دورك هنا عند تكليفك.</p>
      )}
      {eventsThisYear !== null && (
        <section className="platform-card" aria-label="ملخص">
          <div className="platform-row">
            <div className="flex items-center gap-3"><span className="team-icon team-icon-small"><CalendarDays size={22} aria-hidden="true" /></span><span className="platform-muted">فعاليات مسجلة نفذتها صحوة هذا العام</span></div>
            <span className="platform-stat">{eventsThisYear.toLocaleString("ar-EG")}</span>
          </div>
          <p className="platform-muted mt-2">من سجل الفعاليات: الفعاليات ذات التاريخ من بداية العام حتى اليوم.</p>
        </section>
      )}
      <p className="platform-muted mt-6"><ClipboardList size={14} className="inline" aria-hidden="true" /> النصوص التنظيمية تُعرض كما وردت في النظام الإداري لصحوة دون إعادة صياغة.</p>
    </>
  );
}
