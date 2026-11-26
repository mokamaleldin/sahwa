import { ChevronDown } from "lucide-react";
import type { GovernanceBlock } from "../../data/sahwaGovernance";
import type { StructureEntry, StructureChapter } from "../../lib/structureParser";
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
            <span><span className="platform-muted block">«{link.phrase}»</span>{link.vacant ? <span className="platform-contact-vacant">{link.targetTitle}: غير معيّن حاليًا</span> : <People people={link.people} />}</span>
          </div>)}
          {role.contacts.followers.length > 0 && <div className="platform-contact"><span className="platform-contact-label">يتبعونك وفق نصوص أدوارهم</span><People people={role.contacts.followers} /></div>}
          {!role.contacts.links.length && !role.contacts.followers.length && <p className="platform-muted">لا توجد جهات تواصل مسجلة لهذا التكليف.</p>}
        </div>
        <p className="platform-muted mt-2">التنسيق والتواصل لا يعنيان التبعية، ولا يخوّلان التكليف.</p>
      </section>
    </div>
    <div className="dashboard-topic-grid">{remaining.map((section, i) => <Topic key={i} {...section} wide={/مسؤوليات|الموقع الإداري/.test(section.title)} />)}</div>
    {role.text.status && <p className="platform-muted">حالة النص في اللائحة: {role.text.status}</p>}
    {role.text.needsApproval && <p className="platform-notice">لا يوجد نص مستقل لهذا الدور في الباب الثاني؛ يُعرض تعريف المتطوع العام إلى أن يُعتمد الربط.</p>}
    {role.text.pendingTitles.length > 0 && <p className="platform-notice">نص «{role.text.pendingTitles.join("، ")}» محفوظ في لائحة صحوة، ويُربط بهذه البطاقة بعد اعتماد الربط.</p>}
  </article>;
}

const WELCOME_MESSAGES = [
  { verse: "وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ", source: "المائدة: ٢", reflection: "حين تبذل وقتك في بناء بيئة صالحة للشباب، فأنت تشارك في عمل لا يحمله فرد وحده. بارك الله في وقتك وعملك." },
  { verse: "فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ", source: "الزلزلة: ٧", reflection: "لا تستصغر مهمة تؤديها بإخلاص، فكل جهد نافع له أثر، وإن لم ترَ نتيجته اليوم." },
  { verse: "وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ", source: "النجم: ٣٩", reflection: "سعيك في ثغر الشباب يبدأ بالنية الصالحة وإتقان ما بين يديك، لا بكثرة الكلام عن العمل." },
  { verse: "وَمَا تُقَدِّمُوا لِأَنفُسِكُم مِّنْ خَيْرٍ تَجِدُوهُ عِندَ اللَّهِ", source: "البقرة: ١١٠", reflection: "ما تقدمه من وقت وجهد في الخير ليس ضائعًا. نسأل الله أن يتقبل منك ويبارك في عملك." },
  { verse: "إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ", source: "الحجرات: ١٠", reflection: "من أجمل ما نبنيه في صحوة أخوة صادقة، نعين فيها بعضنا على الخير ونحفظ فيها حق بعضنا." },
  { verse: "وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ", source: "التوبة: ١٠٥", reflection: "اجعل الإخلاص والإتقان أساس عملك، سواء كنت في مقدمة الفريق أو تعمل بعيدًا عن الأنظار." },
  { verse: "إِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ الْمُحْسِنِينَ", source: "التوبة: ١٢٠", reflection: "ليس كل أثر يُقاس بالأرقام؛ قد تترك كلمة أو موقف أو مساعدة أثرًا في حياة إنسان." },
];

interface Props {
  name: string;
  roles: DashboardRole[];
  owner: boolean;
  reviewActivity: boolean;
  today: string;
  board: StructureEntry | null;
  general: StructureEntry | null;
  decisions: StructureChapter[];
  children: ReactNode;
}
export default function Dashboard({ name, roles, owner, reviewActivity, today, board, general, decisions, children }: Props) {
  const day = Math.floor(Date.parse(today) / 86400000);
  const message = WELCOME_MESSAGES[((day % WELCOME_MESSAGES.length) + WELCOME_MESSAGES.length) % WELCOME_MESSAGES.length];
  return <>
    <section className="platform-welcome-hero dashboard-welcome">
      <div className="platform-welcome-main">
        <h1 className="font-heading">أهلًا بك يا {name.trim().split(/\s+/)[0]} في صحوة</h1>
        <p>شكرًا على تطوعك في صحوة، جزاك الله خيرًا على وقتك وجهدك.</p>
        <div className="dashboard-daily-message">
          <p className="dashboard-verse">﴿{message.verse}﴾ <small>({message.source})</small></p>
          <p>{message.reflection}</p>
        </div>
      </div>
    </section>
    {children}
    <section aria-labelledby="my-role">
      <h2 id="my-role" className="platform-section-title font-heading">دوري في صحوة</h2>
      {reviewActivity && <p className="platform-notice">صلاحيات العمل معلّقة بسبب حالة النشاط. يُرجى مراجعة تكليفك مع مسؤولك.</p>}
      {roles.length ? <div className="dashboard-roles">{roles.map((role) => <RoleCard key={role.id} role={role} />)}</div>
        : <><p className="platform-muted">{owner ? "حساب إدارة المنصة" : "لم يُسند إليك دور تنظيمي بعد."}</p>{!owner && general && <Topic title={general.title} blocks={general.blocks} wide />}</>}
    </section>
    {board && <section><h2 className="platform-section-title font-heading">{board.title}</h2><div className="platform-card dashboard-topic-grid">{topicSections(board.blocks).map((topic,i) => <Topic key={i} {...topic} wide={/مسؤوليات|تكوين/.test(topic.title)} />)}</div></section>}
    {decisions.length > 0 && <section><h2 className="platform-section-title font-heading">اتخاذ القرار والتفويض — الباب الثالث</h2><p className="platform-muted">النصوص التنظيمية من لائحة صحوة؛ تبقى البنود المقترحة غير نافذة قبل اعتمادها.</p><div className="dashboard-topic-grid">{decisions.map((chapter) => <Topic key={chapter.id} title={chapter.label} blocks={chapter.blocks} wide={chapter.id === "3.1"} />)}</div></section>}
  </>;
}
