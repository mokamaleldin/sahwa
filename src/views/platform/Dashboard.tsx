import { ChevronDown } from "lucide-react";
import type { GovernanceBlock } from "../../data/sahwaGovernance";
import Link from "next/link";
import type { StructureEntry } from "../../lib/structureParser";
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

// Split only on top-level role topics; numbered responsibility subheadings stay inside.
function topicSections(blocks: GovernanceBlock[]) {
  const sections: { title: string; blocks: GovernanceBlock[] }[] = [];
  for (const block of blocks) {
    if (block.kind === "heading" && !/^\d+\./.test(block.text)) {
      sections.push({ title: block.text, blocks: [] });
    } else {
      if (!sections.length) sections.push({ title: "التعريف والدور الأساسي", blocks: [] });
      sections[sections.length - 1].blocks.push(block);
    }
  }
  return sections;
}

function Topic({ title, blocks, wide = false }: { title: string; blocks: GovernanceBlock[]; wide?: boolean }) {
  return <details className={`platform-details dashboard-topic${wide ? " dashboard-topic-wide" : ""}`}>
    <summary>{title}<ChevronDown size={18} aria-hidden="true" /></summary>
    <div><GuideGovernanceBlocks blocks={blocks} /></div>
  </details>;
}

function RoleCard({ role }: { role: DashboardRole }) {
  const sections = role.text.entries.flatMap((entry) => topicSections(entry.blocks));
  const first = sections[0];
  const definition = first && (/التعريف|الدور الأساسي|^الدور$/.test(first.title)) ? first : null;
  const remaining = definition ? sections.slice(1) : sections;
  return <article className="platform-card platform-role-card" aria-labelledby={`role-${role.id}`}>
    <div className="platform-role-head">
      <div><h3 id={`role-${role.id}`} className="font-heading">{role.title}</h3>
        <div className="platform-chips"><span className="platform-chip">{role.scope}</span>{role.teamTitle && <span className="platform-chip platform-chip-muted">{role.teamTitle}</span>}</div>
      </div>
    </div>
    <div className="dashboard-role-columns">
      <section className="platform-definition">
        <h4 className="font-heading">{definition?.title || "التعريف والدور الأساسي"}</h4>
        {definition ? <GuideGovernanceBlocks blocks={definition.blocks} /> : role.text.definition ? <GuideGovernanceBlocks blocks={[role.text.definition]} /> : <p className="platform-muted">لا يوجد تعريف مستقل معتمد لهذا الدور.</p>}
      </section>
      <section className="dashboard-contact-panel">
        <h4 className="font-heading">مع من أتواصل؟</h4>
        <div className="platform-contacts">
          {role.contacts.links.map((link, i) => <div className="platform-contact" key={i}>
            <span className="platform-contact-label">{link.label}<br /><small>{RELATION_TITLES[link.relation]}</small></span>
            <span>{link.vacant ? <span className="platform-contact-vacant">{link.targetTitle}: غير معيّن حاليًا</span> : <People people={link.people} />}</span>
          </div>)}
          {role.contacts.followers.length > 0 && <div className="platform-contact"><span className="platform-contact-label">المسؤولون التابعون لك</span><People people={role.contacts.followers} /></div>}
          {!role.contacts.links.length && !role.contacts.followers.length && <p className="platform-muted">لا توجد جهات تواصل مسجلة لهذا التكليف.</p>}
        </div>
        <p className="platform-muted mt-2">التنسيق والتواصل لا يعنيان التبعية، ولا يخوّلان التكليف.</p>
      </section>
    </div>
    <details className="platform-details dashboard-topic"><summary>تفاصيل دوري ومسؤولياتي وصلاحياتي<ChevronDown size={18} /></summary><div>{remaining.map((section, i) => <section key={i} className="mb-5"><h4 className="font-heading text-brand-primary">{section.title}</h4><GuideGovernanceBlocks blocks={section.blocks} /></section>)}<Link href="/team/guide" className="team-text-button">الرجوع إلى لائحة صحوة</Link></div></details>
    {role.text.status && <p className="platform-muted">حالة النص في اللائحة: {role.text.status}</p>}
    {role.text.needsApproval && <p className="platform-notice">لا يوجد نص مستقل لهذا الدور في الباب الثاني؛ يُعرض تعريف المتطوع العام إلى أن يُعتمد الربط.</p>}
    {role.text.pendingTitles.length > 0 && <p className="platform-notice">نص «{role.text.pendingTitles.join("، ")}» محفوظ في لائحة صحوة، ويُربط بهذه البطاقة بعد اعتماد الربط.</p>}
  </article>;
}

interface Props {
  name: string; roles: DashboardRole[]; owner: boolean; reviewActivity: boolean;
  boardMember: boolean; general: StructureEntry | null; children: ReactNode;
}
export default function Dashboard({ name, roles, owner, reviewActivity, boardMember, general, children }: Props) {
  return <>
    <section className="platform-welcome-hero dashboard-welcome">
      <div className="platform-welcome-main">
        <h1 className="font-heading">أهلًا بك يا {name.trim().split(/\s+/)[0]} في صحوتك</h1>
        <p>جزاك الله خيرًا على ما تبذله من وقتك وجهدك في صحوة</p>
        <div className="dashboard-daily-message">
          <p><strong>قال رسول الله ﷺ:</strong></p>
          <p className="dashboard-verse">«فوالله لأن يهدي الله بك رجلًا واحدًا خير لك من حمر النعم» — متفق عليه.</p>
          <p>لعل لقاءً ساهمت في إقامته، أو كلمةً ساعدت في إيصالها، أو جهدًا بذلته ولم يلتفت إليه أحد، يكون سببًا في صلاح إنسان، وأثرًا يمتد إلى ما بعد عمرك.</p>
          <p className="mt-2">بارك الله في وقتك وعملك، وتقبّل منك.</p>
        </div>
      </div>
    </section>
    {children}
    <section aria-labelledby="my-role">
      <h2 id="my-role" className="platform-section-title font-heading">دوري في صحوة</h2>
      {reviewActivity && <p className="platform-notice">صلاحيات العمل معلّقة بسبب حالة النشاط. يُرجى مراجعة تكليفك مع مسؤولك.</p>}
      {roles.length ? <div className="dashboard-roles">{roles.map((role) => <RoleCard key={role.id} role={role} />)}</div>
        : <><p className="platform-muted">{owner ? "حساب إدارة المنصة" : "لم يُسند إليك دور تنظيمي بعد."}</p>{!owner && general && <Topic title={general.title} blocks={general.blocks} wide />}</>}
      <div className="platform-row mt-4"><Link className="team-text-button" href="/team/guide">{boardMember ? "مجلس الإدارة المركزي واتخاذ القرار — لائحة صحوة" : "الهيكل وقواعد اتخاذ القرار — لائحة صحوة"}</Link></div>
    </section>
  </>;
}
