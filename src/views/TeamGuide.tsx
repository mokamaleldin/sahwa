"use client";

import { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  ArrowDown,
  ArrowUpLeft,
  BadgeCheck,
  BookOpenCheck,
  Building2,
  Check,
  CircleDot,
  Clock3,
  FileText,
  GitBranch,
  GraduationCap,
  Handshake,
  Lightbulb,
  Megaphone,
  Network,
  Scale,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import PageHeading from "../components/shared/PageIdentity";
import TeamDialog from "../components/Team/TeamDialog";
import {
  responsibilityCards,
  responsibilityGroups,
  roleById,
  type ResponsibilityCard,
} from "../data/sahwaGuide";

const guideChapters = [
  {
    number: "01",
    title: "هوية صحوة",
    description: "القصة، الرؤية، الرسالة، الأهداف الأربعة والمبادئ العامة.",
    icon: Sparkles,
    available: false,
  },
  {
    number: "02",
    title: "الميثاق والقيم",
    description:
      "حقوق المتطوعين وواجباتهم، الأخلاق والأخوة والتعامل والاختلاف ودستور صحوة.",
    icon: ShieldCheck,
    available: false,
  },
  {
    number: "03",
    title: "الهيكل والصلاحيات",
    description:
      "المجلس، الفرق الجامعية والمركزية، التفويض، القرار وبطاقات المسؤوليات.",
    icon: Network,
    available: true,
  },
  {
    number: "04",
    title: "السياسات والإجراءات",
    description:
      "المال والإعلام والأنشطة والشكاوى والتظلمات والبيانات والأرشفة.",
    icon: FileText,
    available: false,
  },
];

const councilRoles = [
  "sahwa-lead",
  "women-sector-lead",
  "central-youth-lead",
  "central-women-lead",
  "central-media-lead",
  "central-relations-lead",
];

const centralUnits = [
  {
    title: "الإعلام المركزي",
    description:
      "الهوية والمحتوى والتصاميم والتغطية والأرشفة ودعم إعلام الجامعات.",
    status: "موجود الآن",
    active: true,
    icon: Megaphone,
    roles: ["central-media-lead", "central-media-member"],
  },
  {
    title: "العلاقات العامة المركزية",
    description:
      "الشراكات والتواصل المؤسسي وبنك العلاقات ودعم مندوبي الجامعات.",
    status: "موجود الآن",
    active: true,
    icon: Handshake,
    roles: ["central-relations-lead", "central-relations-member"],
  },
  {
    title: "البرامج والبحث",
    description:
      "البحث والتخطيط وإعداد البرامج العلمية والتربوية والتعليمية ومراجعتها.",
    status: "قريبًا",
    active: false,
    icon: BookOpenCheck,
    roles: [],
  },
  {
    title: "المتابعة والمراجعة والتظلمات",
    description:
      "متابعة التعثر واقتراح التحسين واستقبال الشكاوى والتظلمات بإجراءات عادلة.",
    status: "قريبًا",
    active: false,
    icon: Scale,
    roles: [],
  },
  {
    title: "التوسع والتدريب",
    description:
      "دراسة الجامعات الجديدة وتأسيس الفرق وتدريب المسؤولين والكوادر.",
    status: "قريبًا",
    active: false,
    icon: GraduationCap,
    roles: [],
  },
  {
    title: "التقنية والمنصة",
    description:
      "تطوير الموقع والأنظمة الداخلية والبيانات والصلاحيات كفريق مستقل.",
    status: "قريبًا",
    active: false,
    icon: GitBranch,
    roles: [],
  },
];

const decisionLevels = [
  {
    number: "01",
    title: "مجلس الإدارة",
    text: "يقرر الاتجاه والسياسات والتغييرات الكبرى، ولا يدير التفاصيل الصغيرة.",
  },
  {
    number: "02",
    title: "مسؤول الجامعة",
    text: "يقرر أنشطة جامعته المعتادة ويدير فريقها داخل التفويض المعتمد.",
  },
  {
    number: "03",
    title: "مسؤول الوحدة",
    text: "يدير اختصاصه ويوزع الملفات ويفوض العمل للآخرين.",
  },
  {
    number: "04",
    title: "المتطوع وقائد الفعالية",
    text: "يقترح ويقود وينفذ داخل تفويض واضح، بلا سلسلة موافقات غير ضرورية.",
  },
];

function RoleButton({
  roleId,
  onSelect,
  compact = false,
}: {
  roleId: string;
  onSelect: (role: ResponsibilityCard) => void;
  compact?: boolean;
}) {
  const role = roleById.get(roleId);
  if (!role) return null;
  return (
    <button
      type="button"
      className={`guide-role-button${compact ? " guide-role-button-compact" : ""}`}
      onClick={() => onSelect(role)}
      data-role-id={role.id}
    >
      <span>{role.title}</span>
      <ArrowUpLeft size={15} aria-hidden="true" />
    </button>
  );
}

function RoleDialog({
  role,
  onClose,
}: {
  role: ResponsibilityCard;
  onClose: () => void;
}) {
  const fields = [
    {
      label: "المسمى والارتباط",
      content: (
        <>
          <strong>{role.title}</strong>
          <span>{role.connection}</span>
        </>
      ),
    },
    { label: "الهدف", content: <p>{role.objective}</p> },
    {
      label: "المهام والصلاحيات",
      content: (
        <ul>
          {role.tasks.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ),
    },
    {
      label: "يحتاج موافقة على",
      content: (
        <ul>
          {role.approvals.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ),
    },
    {
      label: "المخرجات",
      content: (
        <ul>
          {role.outputs.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ),
    },
    {
      label: "التنسيق",
      content: (
        <ul>
          {role.coordination.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ),
    },
    { label: "البديل", content: <p>{role.substitute}</p> },
  ];
  return (
    <TeamDialog title="بطاقة المسؤولية" onClose={onClose}>
      <div className="guide-role-dialog-intro">
        <span className="guide-role-dialog-icon" aria-hidden="true">
          <BadgeCheck size={26} />
        </span>
        <div>
          <h3>{role.title}</h3>
          <p>{role.connection}</p>
        </div>
      </div>
      <dl className="guide-role-fields">
        {fields.map((field) => (
          <div key={field.label}>
            <dt>{field.label}</dt>
            <dd>{field.content}</dd>
          </div>
        ))}
      </dl>
      <div className="team-dialog-footer">
        <button type="button" className="team-button" onClick={onClose}>
          فهمت المسؤولية
        </button>
      </div>
    </TeamDialog>
  );
}

export default function TeamGuide() {
  const [selectedRole, setSelectedRole] =
    useState<ResponsibilityCard | null>(null);

  return (
    <>
      <Helmet>
        <title>دليل صحوة | صحوة</title>
      </Helmet>
      <PageHeading
        title="دليل صحوة"
        description="مرجع بسيط يوضح كيف نعمل، ومن يقرر ماذا، وكيف يستطيع كل متطوع أن يبادر ويقود."
      />

      <div className="guide-draft-notice" role="note">
        <span className="guide-draft-icon" aria-hidden="true">
          <Clock3 size={22} />
        </span>
        <div>
          <strong>نسخة 1.1 — مسودة للنقاش</strong>
          <p>
            الهيكل غير معتمد نهائيًا بعد. المقترح أن يُجرّب 90 يومًا ثم يُراجع
            مع مسؤولي الجامعات والفرق قبل الاعتماد.
          </p>
        </div>
      </div>

      <section className="guide-chapters" aria-labelledby="guide-chapters-title">
        <div className="guide-section-heading">
          <span>محتويات الدليل</span>
          <h2 id="guide-chapters-title">أربعة أبواب، نبدأ بالأكثر إلحاحًا</h2>
        </div>
        <div className="guide-chapter-grid">
          {guideChapters.map((chapter) => {
            const Icon = chapter.icon;
            const content = (
              <>
                <div className="guide-chapter-top">
                  <span className="guide-chapter-number">{chapter.number}</span>
                  <Icon size={23} aria-hidden="true" />
                </div>
                <h3>{chapter.title}</h3>
                <p>{chapter.description}</p>
                <span className="guide-chapter-status">
                  {chapter.available ? "مفتوح الآن" : "قريبًا"}
                </span>
              </>
            );
            return chapter.available ? (
              <a
                key={chapter.number}
                href="#guide-structure"
                className="guide-chapter-card guide-chapter-card-active"
              >
                {content}
              </a>
            ) : (
              <article
                key={chapter.number}
                className="guide-chapter-card guide-chapter-card-soon"
              >
                {content}
              </article>
            );
          })}
        </div>
      </section>

      <section
        id="guide-structure"
        className="guide-structure"
        aria-labelledby="guide-structure-title"
      >
        <div className="guide-section-heading guide-section-heading-center">
          <span>03 — الهيكل والصلاحيات</span>
          <h2 id="guide-structure-title">وضوح بلا مركزية خانقة</h2>
          <p>
            الهيكل يوضح نطاق القرار والمسؤولية، لكنه لا يجعل الأفكار تنزل من
            أعلى إلى أسفل. المبادرة يمكن أن تبدأ من أي متطوع.
          </p>
        </div>

        <div className="guide-principles" aria-label="المبادئ التنظيمية">
          {[
            "الفرق الجامعية والمركزية شريكتان؛ لا توجد درجة أهم من الأخرى.",
            "كل عضو صاحب دور، ويستطيع اقتراح مشروع أو قيادة فعالية.",
            "المسؤول ينظم ويمكّن ويفوض، ولا يحتكر الأفكار أو التنفيذ.",
            "القرار يبقى في أدنى مستوى يملك صلاحيته، ولا يُصعّد بلا حاجة.",
          ].map((principle) => (
            <div key={principle}>
              <Check size={17} aria-hidden="true" />
              <p>{principle}</p>
            </div>
          ))}
        </div>

        <article className="guide-org-card guide-council-card">
          <div className="guide-org-title">
            <span className="guide-org-icon" aria-hidden="true">
              <UsersRound size={25} />
            </span>
            <div>
              <span>المستوى الاستراتيجي</span>
              <h3>مجلس إدارة صحوة</h3>
              <p>6 أعضاء — صوت لكل عضو، وصوت ترجيح مقترح عند التعادل.</p>
            </div>
          </div>
          <RoleButton roleId="board" onSelect={setSelectedRole} compact />
          <div className="guide-council-grid">
            {councilRoles.map((roleId, index) => (
              <div className="guide-council-role" key={roleId}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <RoleButton roleId={roleId} onSelect={setSelectedRole} />
              </div>
            ))}
          </div>
        </article>

        <div className="guide-connector" aria-hidden="true">
          <span />
          <ArrowDown size={18} />
        </div>

        <article className="guide-org-card">
          <div className="guide-org-title guide-org-title-center">
            <span className="guide-org-icon" aria-hidden="true">
              <Network size={25} />
            </span>
            <div>
              <span>مستويان متعاونان</span>
              <h3>الجامعات تقود محليًا، والفرق المركزية تخدم المشترك</h3>
            </div>
          </div>
          <div className="guide-two-sides">
            <div className="guide-side-card">
              <Building2 size={24} aria-hidden="true" />
              <h4>الفرق الجامعية</h4>
              <p>قيادة وأنشطة ومبادرات نابعة من احتياج طلاب كل جامعة.</p>
              <div className="guide-side-roles">
                <RoleButton
                  roleId="university-youth-coordinator"
                  onSelect={setSelectedRole}
                  compact
                />
                <RoleButton
                  roleId="university-women-coordinator"
                  onSelect={setSelectedRole}
                  compact
                />
              </div>
            </div>
            <div className="guide-side-card">
              <GitBranch size={24} aria-hidden="true" />
              <h4>الفرق المركزية</h4>
              <p>أنشطة مشتركة وخدمات ومعايير وأدوات تدعم صحوة كلها.</p>
              <div className="guide-side-roles">
                <RoleButton
                  roleId="central-youth-lead"
                  onSelect={setSelectedRole}
                  compact
                />
                <RoleButton
                  roleId="central-women-lead"
                  onSelect={setSelectedRole}
                  compact
                />
              </div>
            </div>
          </div>
          <p className="guide-partnership-note">
            العلاقة بين الطرفين: تعاون وتنسيق، لا تعطيل وتسلسل موافقات. نطاق
            النشاط هو الذي يحدد إن كان جامعيًا أو مركزيًا، لا أهميته ولا مكانه.
          </p>
        </article>

        <article className="guide-org-card">
          <div className="guide-org-title guide-org-title-center">
            <span className="guide-org-icon" aria-hidden="true">
              <Building2 size={25} />
            </span>
            <div>
              <span>داخل كل جامعة</span>
              <h3>فريق صحوة الجامعي</h3>
              <p>إدارة محلية مرنة بأهداف صحوة العامة.</p>
            </div>
          </div>
          <div className="guide-university-grid">
            <div className="guide-university-team">
              <h4>فريق الشباب</h4>
              <RoleButton
                roleId="university-youth-coordinator"
                onSelect={setSelectedRole}
              />
              <RoleButton
                roleId="internal-youth-activities"
                onSelect={setSelectedRole}
              />
              <RoleButton
                roleId="university-activities-member"
                onSelect={setSelectedRole}
              />
              <RoleButton
                roleId="additional-committee-lead"
                onSelect={setSelectedRole}
              />
            </div>
            <div className="guide-university-team">
              <h4>فريق الطالبات</h4>
              <RoleButton
                roleId="university-women-coordinator"
                onSelect={setSelectedRole}
              />
              <RoleButton
                roleId="internal-women-activities"
                onSelect={setSelectedRole}
              />
              <RoleButton
                roleId="university-activities-member"
                onSelect={setSelectedRole}
              />
              <RoleButton
                roleId="additional-committee-lead"
                onSelect={setSelectedRole}
              />
            </div>
          </div>
          <div className="guide-shared-services">
            <div>
              <Megaphone size={20} aria-hidden="true" />
              <h4>الإعلام الميداني</h4>
              <RoleButton
                roleId="field-media-lead"
                onSelect={setSelectedRole}
                compact
              />
              <RoleButton
                roleId="field-media-member"
                onSelect={setSelectedRole}
                compact
              />
            </div>
            <div>
              <Handshake size={20} aria-hidden="true" />
              <h4>العلاقات الجامعية</h4>
              <RoleButton
                roleId="university-relations-lead"
                onSelect={setSelectedRole}
                compact
              />
              <RoleButton
                roleId="university-relations-member"
                onSelect={setSelectedRole}
                compact
              />
            </div>
          </div>
        </article>

        <section className="guide-units" aria-labelledby="guide-units-title">
          <div className="guide-section-heading">
            <span>الوحدات المركزية المشتركة</span>
            <h3 id="guide-units-title">ما يعمل الآن وما ينتظر فريقه</h3>
            <p>
              لا نعرض وحدة كأنها موجودة قبل وجود مسؤول وأعضاء ومهام فعلية.
            </p>
          </div>
          <div className="guide-units-grid">
            {centralUnits.map((unit) => {
              const Icon = unit.icon;
              return (
                <article
                  key={unit.title}
                  className={`guide-unit-card${unit.active ? " guide-unit-active" : " guide-unit-soon"}`}
                >
                  <div className="guide-unit-top">
                    <Icon size={22} aria-hidden="true" />
                    <span>{unit.status}</span>
                  </div>
                  <h4>{unit.title}</h4>
                  <p>{unit.description}</p>
                  {unit.roles.length > 0 && (
                    <div className="guide-unit-roles">
                      {unit.roles.map((roleId) => (
                        <RoleButton
                          key={roleId}
                          roleId={roleId}
                          onSelect={setSelectedRole}
                          compact
                        />
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section className="guide-decisions" aria-labelledby="guide-decisions-title">
          <div className="guide-section-heading guide-section-heading-center">
            <span>كيف يتحرك القرار؟</span>
            <h3 id="guide-decisions-title">الصلاحية تتحرك مع المسؤولية</h3>
          </div>
          <div className="guide-decision-grid">
            {decisionLevels.map((level) => (
              <article key={level.number}>
                <span>{level.number}</span>
                <h4>{level.title}</h4>
                <p>{level.text}</p>
              </article>
            ))}
          </div>
          <div className="guide-idea-note">
            <Lightbulb size={23} aria-hidden="true" />
            <p>
              الفكرة قد تبدأ من أي متطوع. إن كانت داخل التفويض تُنفذ مباشرة،
              وإن احتاجت موارد أو صلاحيات إضافية تُرفع لصاحب الاختصاص فقط.
            </p>
          </div>
        </section>

        <section
          className="guide-responsibilities"
          aria-labelledby="guide-responsibilities-title"
        >
          <div className="guide-section-heading">
            <span>بطاقات المسؤوليات</span>
            <h3 id="guide-responsibilities-title">
              كل دور يعرف ما له وما عليه
            </h3>
            <p>
              اضغط على أي دور لعرض الهدف والصلاحيات والموافقات والمخرجات
              والتنسيق والبديل.
            </p>
          </div>
          <div className="guide-responsibility-groups">
            {responsibilityGroups.map((group) => {
              const roles = responsibilityCards.filter(
                (role) => role.group === group.id,
              );
              return (
                <section key={group.id} aria-labelledby={`group-${group.id}`}>
                  <div className="guide-responsibility-group-heading">
                    <CircleDot size={16} aria-hidden="true" />
                    <h4 id={`group-${group.id}`}>{group.label}</h4>
                    <span>{roles.length.toLocaleString("ar-EG")} أدوار</span>
                  </div>
                  <div className="guide-responsibility-list">
                    {roles.map((role) => (
                      <RoleButton
                        key={role.id}
                        roleId={role.id}
                        onSelect={setSelectedRole}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </section>

        <section className="guide-governance-summary" aria-label="ضوابط التطبيق">
          <div>
            <ShieldCheck size={23} aria-hidden="true" />
            <h3>تفويض واضح</h3>
            <p>
              كل تفويض يحدد المهمة والصلاحيات والموارد والمدة والجهة التي يُرجع
              إليها عند الحاجة.
            </p>
          </div>
          <div>
            <UsersRound size={23} aria-hidden="true" />
            <h3>قيادة دون احتكار</h3>
            <p>
              نجاح المسؤول يُقاس ببناء فريق قادر، لا بعدد الأعمال التي يحتفظ
              بها لنفسه.
            </p>
          </div>
          <div>
            <Scale size={23} aria-hidden="true" />
            <h3>مساءلة عادلة</h3>
            <p>
              لا يفصل شخص منفرد في شكوى تخص قراره، وتُراجع الصلاحيات بعد فترة
              التجربة.
            </p>
          </div>
        </section>
      </section>

      {selectedRole && (
        <RoleDialog role={selectedRole} onClose={() => setSelectedRole(null)} />
      )}
    </>
  );
}
