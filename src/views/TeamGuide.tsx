"use client";

import { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  ArrowUpLeft,
  BadgeCheck,
  Building2,
  Check,
  Clock3,
  FileText,
  GitBranch,
  Network,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import PageHeading from "../components/shared/PageIdentity";
import TeamDialog from "../components/Team/TeamDialog";
import { roleById, type ResponsibilityCard } from "../data/sahwaGuide";
import { structureUnitById, type StructureUnit } from "../data/sahwaStructure";

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
      "المجلس، الفرق الجامعية والمركزية، واختصاصات الفرق والأعضاء.",
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
    <TeamDialog title="تفاصيل المسؤولية" onClose={onClose}>
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


function UnitButton({
  unitId,
  onSelect,
  small = false,
}: {
  unitId: string;
  onSelect: (unit: StructureUnit) => void;
  small?: boolean;
}) {
  const unit = structureUnitById.get(unitId);
  if (!unit) return null;
  return (
    <button
      type="button"
      className={small ? "guide-map-unit-trigger guide-map-unit-trigger-small" : "guide-map-unit-trigger"}
      onClick={() => onSelect(unit)}
      aria-label={"عرض اختصاص " + unit.title}
    >
      <span className="guide-map-unit-text">
        <span className="guide-map-unit-eyebrow">{unit.eyebrow}</span>
        <strong>{unit.title}</strong>
        <span className="guide-map-unit-summary">{unit.summary}</span>
      </span>
      <ArrowUpLeft size={19} aria-hidden="true" />
    </button>
  );
}

function UnitDialog({
  unit,
  onClose,
  onSelectRole,
}: {
  unit: StructureUnit;
  onClose: () => void;
  onSelectRole: (role: ResponsibilityCard) => void;
}) {
  return (
    <TeamDialog title="اختصاص الفريق" onClose={onClose}>
      <div className="guide-role-dialog-intro">
        <span className="guide-role-dialog-icon" aria-hidden="true">
          <Network size={26} />
        </span>
        <div>
          <span className="guide-map-dialog-eyebrow">{unit.eyebrow}</span>
          <h3>{unit.title}</h3>
          <p>{unit.summary}</p>
        </div>
      </div>
      <dl className="guide-role-fields">
        <div>
          <dt>الدور الأساسي</dt>
          <dd><p>{unit.mission}</p></dd>
        </div>
        <div>
          <dt>ماذا يفعل الفريق؟</dt>
          <dd><ul>{unit.responsibilities.map((item) => <li key={item}>{item}</li>)}</ul></dd>
        </div>
        <div>
          <dt>حدود الصلاحيات</dt>
          <dd><ul>{unit.authority.map((item) => <li key={item}>{item}</li>)}</ul></dd>
        </div>
        <div>
          <dt>التنسيق والارتباط</dt>
          <dd><ul>{unit.coordination.map((item) => <li key={item}>{item}</li>)}</ul></dd>
        </div>
        {unit.roleIds.length > 0 && (
          <div>
            <dt>الأدوار داخل الفريق</dt>
            <dd className="guide-map-dialog-roles">
              {unit.roleIds.map((roleId) => (
                <RoleButton key={roleId} roleId={roleId} onSelect={onSelectRole} compact />
              ))}
            </dd>
          </div>
        )}
      </dl>
      <div className="team-dialog-footer">
        <button type="button" className="team-button" onClick={onClose}>إغلاق</button>
      </div>
    </TeamDialog>
  );
}

export default function TeamGuide() {
  const [selectedRole, setSelectedRole] = useState<ResponsibilityCard | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<StructureUnit | null>(null);
  const openRole = (role: ResponsibilityCard) => {
    setSelectedUnit(null);
    setSelectedRole(role);
  };
  const openUnit = (unit: StructureUnit) => {
    setSelectedRole(null);
    setSelectedUnit(unit);
  };
  const openRoleById = (roleId: string) => {
    const role = roleById.get(roleId);
    if (role) openRole(role);
  };

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
          <h2 id="guide-chapters-title">خريطة دليل صحوة</h2>
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
          <h2 id="guide-structure-title">كيف يتكوّن فريق صحوة؟</h2>
          <p>
            خريطة واحدة توضح المجلس والفرق الجامعية والمركزية وأدوار الأعضاء.
            اضغط على أي فريق لمعرفة اختصاصه، أو على أي منصب لمعرفة مسؤوليته وصلاحياته.
          </p>
        </div>

        <div className="guide-map" aria-label="الهيكل التنظيمي التفاعلي لصحوة">
          <div className="guide-map-board-wrap">
            <article className="guide-map-board" aria-label="مجلس إدارة صحوة وأعضاؤه">
              <button
                type="button"
                className="guide-map-board-trigger"
                onClick={() => openRoleById("board")}
                aria-label="عرض اختصاص مجلس إدارة صحوة"
              >
                <span className="guide-map-board-symbol"><UsersRound size={26} aria-hidden="true" /></span>
                <span>
                  <small>التوجيه والإشراف العام</small>
                  <strong>مجلس إدارة صحوة</strong>
                  <span>ستة أعضاء · السياسات والقرارات الكبرى</span>
                </span>
                <ArrowUpLeft size={20} aria-hidden="true" />
              </button>
              <div className="guide-map-board-members" aria-label="أعضاء المجلس">
                {councilRoles.map((roleId) => (
                  <RoleButton key={roleId} roleId={roleId} onSelect={openRole} compact />
                ))}
              </div>
            </article>
          </div>

          <div className="guide-map-stem" aria-hidden="true"><span /></div>

          <div className="guide-map-branches">
            <article className="guide-map-branch guide-map-branch-university">
              <div className="guide-map-branch-head">
                <Building2 size={23} aria-hidden="true" />
                <span>مسار الجامعة</span>
              </div>
              <UnitButton unitId="universities" onSelect={openUnit} />
              <div className="guide-map-branch-line" aria-hidden="true" />

              <div className="guide-map-pair">
                <section className="guide-map-team">
                  <UnitButton unitId="university-youth" onSelect={openUnit} small />
                  <div className="guide-map-team-roles">
                    <RoleButton roleId="university-youth-coordinator" onSelect={openRole} compact />
                    <RoleButton roleId="internal-youth-activities" onSelect={openRole} compact />
                    <RoleButton roleId="university-activities-member" onSelect={openRole} compact />
                  </div>
                </section>
                <section className="guide-map-team">
                  <UnitButton unitId="university-women" onSelect={openUnit} small />
                  <div className="guide-map-team-roles">
                    <RoleButton roleId="university-women-coordinator" onSelect={openRole} compact />
                    <RoleButton roleId="internal-women-activities" onSelect={openRole} compact />
                    <RoleButton roleId="university-activities-member" onSelect={openRole} compact />
                  </div>
                </section>
              </div>

              <div className="guide-map-subheading"><span>فرق مساندة داخل الجامعة</span></div>
              <div className="guide-map-pair">
                <section className="guide-map-team">
                  <UnitButton unitId="university-media" onSelect={openUnit} small />
                  <div className="guide-map-team-roles">
                    <RoleButton roleId="field-media-lead" onSelect={openRole} compact />
                    <RoleButton roleId="field-media-member" onSelect={openRole} compact />
                  </div>
                </section>
                <section className="guide-map-team">
                  <UnitButton unitId="university-relations" onSelect={openUnit} small />
                  <div className="guide-map-team-roles">
                    <RoleButton roleId="university-relations-lead" onSelect={openRole} compact />
                    <RoleButton roleId="university-relations-member" onSelect={openRole} compact />
                  </div>
                </section>
              </div>
              <div className="guide-map-flex-role">
                <span>لجنة أخرى عند الحاجة</span>
                <RoleButton roleId="additional-committee-lead" onSelect={openRole} compact />
              </div>
            </article>

            <article className="guide-map-branch guide-map-branch-central">
              <div className="guide-map-branch-head">
                <GitBranch size={23} aria-hidden="true" />
                <span>المسار المشترك</span>
              </div>
              <UnitButton unitId="central" onSelect={openUnit} />
              <div className="guide-map-branch-line" aria-hidden="true" />

              <div className="guide-map-pair">
                <section className="guide-map-team">
                  <UnitButton unitId="central-youth" onSelect={openUnit} small />
                  <div className="guide-map-team-roles">
                    <RoleButton roleId="central-youth-lead" onSelect={openRole} compact />
                    <RoleButton roleId="central-youth-member" onSelect={openRole} compact />
                  </div>
                </section>
                <section className="guide-map-team">
                  <UnitButton unitId="central-women" onSelect={openUnit} small />
                  <div className="guide-map-team-roles">
                    <RoleButton roleId="central-women-lead" onSelect={openRole} compact />
                    <RoleButton roleId="central-women-member" onSelect={openRole} compact />
                  </div>
                </section>
              </div>

              <div className="guide-map-subheading"><span>وحدات مركزية قائمة</span></div>
              <div className="guide-map-pair">
                <section className="guide-map-team">
                  <UnitButton unitId="central-media" onSelect={openUnit} small />
                  <div className="guide-map-team-roles">
                    <RoleButton roleId="central-media-lead" onSelect={openRole} compact />
                    <RoleButton roleId="central-media-member" onSelect={openRole} compact />
                  </div>
                </section>
                <section className="guide-map-team">
                  <UnitButton unitId="central-relations" onSelect={openUnit} small />
                  <div className="guide-map-team-roles">
                    <RoleButton roleId="central-relations-lead" onSelect={openRole} compact />
                    <RoleButton roleId="central-relations-member" onSelect={openRole} compact />
                  </div>
                </section>
              </div>

              <div className="guide-map-planned">
                <div className="guide-map-subheading">
                  <span>وحدات مقترحة للتأسيس لاحقًا</span>
                  <small>غير مفعّلة</small>
                </div>
                <div className="guide-map-planned-grid">
                  {["programs", "review", "expansion", "technology"].map((unitId) => (
                    <UnitButton key={unitId} unitId={unitId} onSelect={openUnit} small />
                  ))}
                </div>
              </div>
            </article>
          </div>

          <div className="guide-map-equality">
            <Check size={17} aria-hidden="true" />
            <p>العمل الجامعي والمركزي مساران متكاملان؛ لكل منهما قراراته وأنشطته وأعضاؤه. لا يلغي أحدهما دور الآخر.</p>
          </div>

          <div className="guide-map-contribution">
            <UnitButton unitId="participation" onSelect={openUnit} />
            <div className="guide-map-contribution-roles">
              <RoleButton roleId="volunteer" onSelect={openRole} />
              <RoleButton roleId="event-lead" onSelect={openRole} />
              <RoleButton roleId="event-member" onSelect={openRole} />
            </div>
          </div>
        </div>
      </section>

      {selectedRole && (
        <RoleDialog role={selectedRole} onClose={() => setSelectedRole(null)} />
      )}
      {selectedUnit && (
        <UnitDialog
          unit={selectedUnit}
          onClose={() => setSelectedUnit(null)}
          onSelectRole={openRole}
        />
      )}
    </>
  );
}
