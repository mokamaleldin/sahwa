import { ArrowUpLeft, ChevronDown, ClipboardList, HeartHandshake, LayoutGrid, UserRound } from "lucide-react";
import Link from "next/link";
import { GuideGovernanceBlocks } from "../../components/Team/GuideGovernance";
import type { RoleText } from "../../lib/roleTexts";
import Community, { type CommunityData } from "./Community";

interface ContactPerson { id: string; name: string; role: string; scope: string }
interface ContactLink { relation: string; label: string; phrase: string; targetTitle: string; people: ContactPerson[]; vacant: boolean }
export interface DashboardRole {
  id: string;
  roleId: string;
  title: string;
  number: number | null;
  scope: string;
  teamTitle: string;
  deferred: boolean;
  contacts: { links: ContactLink[]; followers: ContactPerson[] };
  text: RoleText;
}
export interface DashboardProps {
  person: {
    fullName: string;
    university: string;
    major: string;
    membershipLevel: string;
    status: string;
    teams: string[];
    username: string;
  };
  roles: DashboardRole[];
  community: CommunityData;
  isOwner?: boolean;
  hasWorkspace?: boolean;
}

const RELATION_TITLES: Record<string, string> = {
  reports: "التبعية",
  coordinates: "التنسيق والتواصل",
  team: "ضمن الفريق",
};

function firstWord(fullName: string) {
  const clean = fullName.trim();
  if (!clean || clean === "المسؤول العام") return "";
  return clean.split(/\s+/)[0] || "";
}

function People({ people }: { people: ContactPerson[] }) {
  return (
    <span>
      {people.map((p, i) => (
        <span key={p.id + i} className="block">
          <span className="platform-contact-name">{p.name}</span>{" "}
          <span className="platform-muted">— {p.role} ({p.scope})</span>
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
                <span className="platform-contact-label">
                  {link.label}
                  <br />
                  <small>{RELATION_TITLES[link.relation]}</small>
                </span>
                <span>
                  <span className="platform-muted block">«{link.phrase}»</span>
                  {link.vacant ? (
                    <span className="platform-contact-vacant">{link.targetTitle}: غير معيّن حاليًا</span>
                  ) : (
                    <People people={link.people} />
                  )}
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
          <summary>
            الموقع الإداري والتبعية والتواصل — النص الرسمي
            <ChevronDown size={18} aria-hidden="true" />
          </summary>
          <div>
            <GuideGovernanceBlocks blocks={[role.text.position]} />
          </div>
        </details>
      )}

      <details className="platform-details">
        <summary>
          النص الكامل للدور من اللائحة{role.text.status ? ` (${role.text.status})` : ""}
          <ChevronDown size={18} aria-hidden="true" />
        </summary>
        <div>
          {role.text.entries.length ? (
            role.text.entries.map((entry) => (
              <section key={entry.id} className="mb-4">
                <h4 className="font-heading text-[#752026] mb-2">{entry.title}</h4>
                <GuideGovernanceBlocks blocks={entry.blocks} />
              </section>
            ))
          ) : (
            <p className="platform-muted">لم يُعثر على النص المرتبط بهذا الدور.</p>
          )}
          {role.text.needsApproval && (
            <p className="platform-notice">لا يوجد نص مستقل لهذا الدور في الباب الثاني؛ يُعرض تعريف المتطوع العام إلى أن يُعتمد الربط.</p>
          )}
          {role.text.pendingTitles.length > 0 && (
            <p className="platform-notice">نص «{role.text.pendingTitles.join("، ")}» محفوظ في دليل صحوة، ويُربط بهذه البطاقة بعد اعتماد الربط.</p>
          )}
        </div>
      </details>
    </article>
  );
}

export default function Dashboard({ person, roles, community, isOwner = false, hasWorkspace = false }: DashboardProps) {
  const first = firstWord(person.fullName);
  const greeting = first ? `أهلًا يا ${first}` : "أهلًا بك في صحوة";

  return (
    <>
      <section className="platform-welcome-hero mb-8" aria-label="الترحيب">
        <div className="platform-welcome-main">
          <div className="platform-welcome-eyebrow">
            <HeartHandshake size={16} aria-hidden="true" />
            <span>نوّرت بيتك في صحوة</span>
          </div>
          <h1 className="font-heading">{greeting}</h1>
          <p className="platform-welcome-message">
            جزاك الله خيرًا على وقتك وجهدك معنا. هنا تجد هويتك التنظيمية وأحدث مستجدات أهل صحوة.
          </p>
          {!isOwner && (
            <div className="platform-chips mt-3">
              {person.university && <span className="platform-chip">{[person.university, person.major].filter(Boolean).join(" — ")}</span>}
              {person.membershipLevel && <span className="platform-chip platform-chip-gold">{person.membershipLevel}</span>}
              {person.teams.map((t) => (
                <span key={t} className="platform-chip platform-chip-muted">{t}</span>
              ))}
            </div>
          )}
        </div>
        <div className="platform-welcome-actions">
          <Link href="/team/account" className="team-button team-button-secondary">
            <UserRound size={16} aria-hidden="true" />
            حسابي
          </Link>
          {hasWorkspace && (
            <Link href="/team/workspace" className="team-button">
              <LayoutGrid size={16} aria-hidden="true" />
              مساحة العمل
              <ArrowUpLeft size={16} aria-hidden="true" />
            </Link>
          )}
        </div>
      </section>

      <section aria-labelledby="identity-heading">
        <h2 id="identity-heading" className="platform-section-title font-heading" style={{ marginTop: 0 }}>
          هويتي التنظيمية
          {roles.length > 0 && (
            <small>
              {roles.length.toLocaleString("ar-EG")} {roles.length === 1 ? "دور" : "أدوار"}
            </small>
          )}
        </h2>
        {isOwner ? (
          <div className="platform-card">
            <div className="platform-row">
              <div>
                <h3 className="font-heading mb-1">المسؤول العام للمنصة</h3>
                <p>تملك الصلاحيات الكاملة لإدارة المتطوعين والحسابات والأدوار والنماذج من مساحة العمل.</p>
              </div>
              <Link href="/team/workspace" className="team-button team-button-secondary">
                فتح مساحة العمل
                <ArrowUpLeft size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        ) : roles.length ? (
          <>
            <div className="platform-grid">
              {roles.map((role) => (
                <RoleCard key={role.id} role={role} />
              ))}
            </div>
            <p className="platform-muted -mt-3">
              <ClipboardList size={14} className="inline ml-1" aria-hidden="true" />
              النصوص التنظيمية تُعرض حرفيًا كما وردت في النظام الإداري لصحوة دون زيادة أو نقصان.
            </p>
          </>
        ) : (
          <p className="platform-empty">
            لا يوجد دور تنظيمي مسند لك حاليًا. يمكنك متابعة مستجدات صحوة أدناه والمشاركة بأفكارك من صفحة النماذج.
          </p>
        )}
      </section>

      <Community data={community} university={person.university} embedded />
    </>
  );
}
