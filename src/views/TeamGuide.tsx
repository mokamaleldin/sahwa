"use client";

import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  ArrowUpLeft,
  BadgeCheck,
  Building2,
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
import GuideIdentity from "../components/Team/GuideIdentity";
import { roleById, type ResponsibilityCard } from "../data/sahwaGuide";
import { structureUnitById, type StructureUnit } from "../data/sahwaStructure";

const guideChapters = [
  {
    number: "01",
    title: "هوية صحوة",
    description: "القصة، الرؤية، الرسالة، الأهداف الأربعة والمبادئ العامة.",
    icon: Sparkles,
    available: true,
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


function OrganizationTeam({
  unitId,
  roles,
  onSelectUnit,
  onSelectRole,
}: {
  unitId: string;
  roles: string[];
  onSelectUnit: (unit: StructureUnit) => void;
  onSelectRole: (role: ResponsibilityCard) => void;
}) {
  return (
    <section className="guide-map-team">
      <UnitButton unitId={unitId} onSelect={onSelectUnit} small />
      <div className="guide-map-team-link" aria-hidden="true" />
      <div className="guide-map-team-roles">
        {roles.map((roleId) => (
          <div className="guide-map-team-role" key={roleId}>
            <RoleButton roleId={roleId} onSelect={onSelectRole} compact />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function TeamGuide() {
  const [activeChapter, setActiveChapter] = useState("01");
  useEffect(() => {
    const syncChapterFromHash = () => {
      const hash = window.location.hash;
      if (hash === "#guide-structure") setActiveChapter("03");
      else if (hash === "#guide-identity" || hash.startsWith("#guide-identity-")) setActiveChapter("01");
    };
    syncChapterFromHash();
    window.addEventListener("hashchange", syncChapterFromHash);
    return () => window.removeEventListener("hashchange", syncChapterFromHash);
  }, []);

  const changeChapter = (chapter: string) => {
    setActiveChapter(chapter);
    const hash = chapter === "03" ? "#guide-structure" : "#guide-identity";
    window.history.replaceState(null, "", window.location.pathname + window.location.search + hash);
  };

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
        description="تعرف إلى هوية صحوة وقصتها ورؤيتها وأهدافها، ثم اكتشف كيف يتكوّن فريقها وتُوزّع المسؤوليات."
      />

      <div className="guide-draft-notice" role="note">
        <span className="guide-draft-icon" aria-hidden="true">
          <Clock3 size={22} />
        </span>
        <div>
          <strong>نسخة أولية — غير معتمدة نهائيًا</strong>
          <p>تُراجع ثم تُعتمد.</p>
        </div>
      </div>

      <section className="guide-chapters" aria-labelledby="guide-chapters-title">
        <div className="guide-section-heading">
          <span>محتويات الدليل</span>
          <h2 id="guide-chapters-title">خريطة دليل صحوة</h2>
        </div>
        <div className="guide-chapter-grid" role="tablist" aria-label="أبواب دليل صحوة">
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
                  {chapter.available ? activeChapter === chapter.number ? "القسم المعروض" : "اضغط للعرض" : "قريبًا"}
                </span>
              </>
            );
            return chapter.available ? (
              <button
                key={chapter.number}
                id={`guide-chapter-tab-${chapter.number}`}
                type="button"
                role="tab"
                aria-selected={activeChapter === chapter.number}
                aria-controls="guide-chapter-panel"
                className={`guide-chapter-card guide-chapter-card-active${activeChapter === chapter.number ? " guide-chapter-card-selected" : ""}`}
                onClick={() => changeChapter(chapter.number)}
              >
                {content}
              </button>
            ) : (
              <article
                key={chapter.number}
                className="guide-chapter-card guide-chapter-card-soon"
                aria-label={`${chapter.title} — قريبًا`}
              >
                {content}
              </article>
            );
          })}
        </div>
      </section>

      <div
        id="guide-chapter-panel"
        role="tabpanel"
        tabIndex={0}
        aria-labelledby={`guide-chapter-tab-${activeChapter}`}
        className="guide-chapter-panel"
      >
      {activeChapter === "01" && <GuideIdentity />}

      {activeChapter === "03" && <section
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
            <article className="guide-map-board" aria-label="مجلس إدارة صحوة">
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
            </article>

            <div className="guide-map-council-link" aria-hidden="true" />
            <section className="guide-map-council-members" aria-label="الأعضاء الستة لمجلس إدارة صحوة">
              <div className="guide-map-council-heading">أعضاء مجلس الإدارة</div>
              <div className="guide-map-board-members">
                {councilRoles.map((roleId) => (
                  <div className="guide-map-council-member" key={roleId}>
                    <RoleButton roleId={roleId} onSelect={openRole} compact />
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="guide-map-stem" aria-hidden="true"><span /></div>


          <div className="guide-map-branches">
            <article className="guide-map-branch guide-map-branch-university">
              <div className="guide-map-branch-head">
                <Building2 size={23} aria-hidden="true" />
                <span>مسار الجامعة</span>
              </div>
              <UnitButton unitId="universities" onSelect={openUnit} />
              <div className="guide-map-branch-root-link" aria-hidden="true" />

              <div className="guide-map-branch-tree">
                <div className="guide-map-tree-tier">
                  <div className="guide-map-subheading"><span>فريقا الشباب والطالبات</span></div>
                  <div className="guide-map-pair">
                    <OrganizationTeam
                      unitId="university-youth"
                      roles={["university-youth-coordinator", "internal-youth-activities", "university-activities-member"]}
                      onSelectUnit={openUnit}
                      onSelectRole={openRole}
                    />
                    <OrganizationTeam
                      unitId="university-women"
                      roles={["university-women-coordinator", "internal-women-activities", "university-activities-member"]}
                      onSelectUnit={openUnit}
                      onSelectRole={openRole}
                    />
                  </div>
                </div>

                <div className="guide-map-tree-tier">
                  <div className="guide-map-subheading"><span>فرق مساندة داخل الجامعة</span></div>
                  <div className="guide-map-pair">
                    <OrganizationTeam
                      unitId="university-media"
                      roles={["field-media-lead", "field-media-member"]}
                      onSelectUnit={openUnit}
                      onSelectRole={openRole}
                    />
                    <OrganizationTeam
                      unitId="university-relations"
                      roles={["university-relations-lead", "university-relations-member"]}
                      onSelectUnit={openUnit}
                      onSelectRole={openRole}
                    />
                  </div>
                </div>

                <div className="guide-map-tree-tier guide-map-tree-tier-optional">
                  <div className="guide-map-flex-role">
                    <span>لجنة إضافية عند الحاجة</span>
                    <RoleButton roleId="additional-committee-lead" onSelect={openRole} compact />
                  </div>
                </div>
              </div>
            </article>

            <article className="guide-map-branch guide-map-branch-central">
              <div className="guide-map-branch-head">
                <GitBranch size={23} aria-hidden="true" />
                <span>المسار المشترك بين الجامعات</span>
              </div>
              <UnitButton unitId="central" onSelect={openUnit} />
              <div className="guide-map-branch-root-link" aria-hidden="true" />

              <div className="guide-map-branch-tree">
                <div className="guide-map-tree-tier">
                  <div className="guide-map-subheading"><span>فرق الأنشطة المركزية</span></div>
                  <div className="guide-map-pair">
                    <OrganizationTeam
                      unitId="central-youth"
                      roles={["central-youth-lead", "central-youth-member"]}
                      onSelectUnit={openUnit}
                      onSelectRole={openRole}
                    />
                    <OrganizationTeam
                      unitId="central-women"
                      roles={["central-women-lead", "central-women-member"]}
                      onSelectUnit={openUnit}
                      onSelectRole={openRole}
                    />
                  </div>
                </div>

                <div className="guide-map-tree-tier">
                  <div className="guide-map-subheading"><span>وحدات مركزية قائمة</span></div>
                  <div className="guide-map-pair">
                    <OrganizationTeam
                      unitId="central-media"
                      roles={["central-media-lead", "central-media-member"]}
                      onSelectUnit={openUnit}
                      onSelectRole={openRole}
                    />
                    <OrganizationTeam
                      unitId="central-relations"
                      roles={["central-relations-lead", "central-relations-member"]}
                      onSelectUnit={openUnit}
                      onSelectRole={openRole}
                    />
                  </div>
                </div>

                <div className="guide-map-tree-tier guide-map-tree-tier-optional">
                  <div className="guide-map-planned">
                    <div className="guide-map-subheading">
                      <span>وحدات مقترحة للتأسيس لاحقًا</span>
                      <small>غير مفعّلة</small>
                    </div>
                    <div className="guide-map-planned-grid">
                      {["programs", "review", "expansion", "technology"].map((unitId) => (
                        <div className="guide-map-planned-item" key={unitId}>
                          <UnitButton unitId={unitId} onSelect={openUnit} small />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>

        </div>
      </section>}
      </div>

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
