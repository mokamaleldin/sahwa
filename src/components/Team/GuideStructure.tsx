"use client";

import { useState } from "react";
import {
  ArrowUpLeft,
  BadgeCheck,
  Building2,
  Clock3,
  GitBranch,
  Network,
  UsersRound,
} from "lucide-react";
import TeamDialog from "./TeamDialog";
import { roleById, type ResponsibilityCard } from "../../data/sahwaGuide";
import { structureUnitById, type StructureUnit } from "../../data/sahwaStructure";
import { governanceRoles } from "../../data/sahwaGovernance";
import GuideGovernanceTopics, { GuideGovernanceBlocks } from "./GuideGovernance";

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

function RoleDialog({ role, onClose }: { role: ResponsibilityCard; onClose: () => void }) {
  const documented = governanceRoles[role.id];
  const extraTasks = role.tasks.slice(2);

  return (
    <TeamDialog title="مهام وصلاحيات المنصب" onClose={onClose}>
      <div className="guide-role-dialog-intro">
        <span className="guide-role-dialog-icon" aria-hidden="true"><BadgeCheck size={26} /></span>
        <div>
          <h3>{role.title}</h3>
          <p>{role.connection}</p>
        </div>
      </div>
      {documented ? (
        <>
          {role.id === "central-women-member" && (
            <p className="guide-governance-role-scope">
              هذه المسؤوليات تخص عضوة أنشطة الطالبات المركزية في فريقها، ولا تمنحها سلطة على الجامعات أو الوحدات الأخرى.
            </p>
          )}
          {role.id === "central-youth-member" && (
            <p className="guide-governance-role-scope">
              هذه المسؤوليات تخص عضو أنشطة الشباب المركزية في فريقه، ولا تمنحه سلطة على الجامعات أو الوحدات الأخرى.
            </p>
          )}
          <GuideGovernanceBlocks blocks={documented.blocks} />
        </>
      ) : (
        <>
          <p className="guide-legacy-role-note">
            هذا الدور وارد في المسودة السابقة، ولم يُذكر له وصف مستقل في النسخة التفصيلية الجديدة.
          </p>
          <dl className="guide-role-fields guide-role-fields-short">
            <div><dt>الدور باختصار</dt><dd><p>{role.objective}</p></dd></div>
            <div><dt>المهام الأساسية</dt><dd><ul>{role.tasks.slice(0, 2).map(item => <li key={item}>{item}</li>)}</ul></dd></div>
            <div><dt>يحتاج موافقة على</dt><dd><ul>{role.approvals.map(item => <li key={item}>{item}</li>)}</ul></dd></div>
          </dl>
          <details className="guide-more-details">
            <summary>باقي التفاصيل من المسودة السابقة</summary>
            <dl className="guide-role-fields guide-role-fields-secondary">
              {extraTasks.length > 0 && <div><dt>مهام أخرى</dt><dd><ul>{extraTasks.map(item => <li key={item}>{item}</li>)}</ul></dd></div>}
              <div><dt>المخرجات</dt><dd><ul>{role.outputs.map(item => <li key={item}>{item}</li>)}</ul></dd></div>
              <div><dt>التنسيق مع</dt><dd><ul>{role.coordination.map(item => <li key={item}>{item}</li>)}</ul></dd></div>
              <div><dt>البديل عند الغياب</dt><dd><p>{role.substitute}</p></dd></div>
            </dl>
          </details>
        </>
      )}
      <div className="team-dialog-footer">
        <button type="button" className="team-button" onClick={onClose}>إغلاق</button>
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
      data-unit-id={unit.id}
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

function UnitDialog({ unit, onClose, onSelectRole }: {
  unit: StructureUnit;
  onClose: () => void;
  onSelectRole: (role: ResponsibilityCard) => void;
}) {
  const extraResponsibilities = unit.responsibilities.slice(2);
  return (
    <TeamDialog title="اختصاص الفريق" onClose={onClose}>
      <div className="guide-role-dialog-intro">
        <span className="guide-role-dialog-icon" aria-hidden="true"><Network size={26} /></span>
        <div>
          <span className="guide-map-dialog-eyebrow">{unit.eyebrow}</span>
          <h3>{unit.title}</h3>
          <p>{unit.summary}</p>
        </div>
      </div>
      {unit.proposed && (
        <p className="guide-unit-proposed-note">
          هذه الوحدة مقترحة ولم تُفعّل بعد. لا تبدأ عملها إلا بعد اعتمادها وتحديد صلاحياتها.
        </p>
      )}
      <dl className="guide-role-fields guide-role-fields-short">
        <div>
          <dt>ماذا يفعل الفريق؟</dt>
          <dd><ul>{unit.responsibilities.slice(0, 2).map((item) => <li key={item}>{item}</li>)}</ul></dd>
        </div>
        <div>
          <dt>حدود الصلاحيات</dt>
          <dd><ul>{unit.authority.map((item) => <li key={item}>{item}</li>)}</ul></dd>
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
      <details className="guide-more-details">
        <summary>المزيد عن الفريق</summary>
        <dl className="guide-role-fields guide-role-fields-secondary">
          <div>
            <dt>الدور الأساسي</dt>
            <dd><p>{unit.mission}</p></dd>
          </div>
          {extraResponsibilities.length > 0 && (
            <div>
              <dt>مهام أخرى</dt>
              <dd><ul>{extraResponsibilities.map((item) => <li key={item}>{item}</li>)}</ul></dd>
            </div>
          )}
          <div>
            <dt>التنسيق مع</dt>
            <dd><ul>{unit.coordination.map((item) => <li key={item}>{item}</li>)}</ul></dd>
          </div>
        </dl>
      </details>
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

export default function GuideStructure() {
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
      <section
        id="guide-structure-map"
        tabIndex={-1}
        className="guide-structure"
        aria-labelledby="guide-structure-title"
      >
      <div className="guide-draft-notice" role="note">
        <span className="guide-draft-icon" aria-hidden="true">
          <Clock3 size={22} />
        </span>
        <div>
          <strong>نسخة أولية — غير معتمدة نهائيًا</strong>
          <p>تُراجع ثم تُعتمد.</p>
        </div>
      </div>
        <div className="guide-section-heading guide-section-heading-center">
          <a href="#guide-structure">الباب الثاني: الهيكل الإداري والأدوار والصلاحيات</a>
          <h2 id="guide-structure-title">مين مسؤول عن إيه في صحوة؟</h2>
          <p>
            اضغط على أي منصب لقراءة مهامه وصلاحياته وحدودها كاملة وفق المسودة الجديدة، أو اختر فريقًا لمعرفة اختصاصه. وأسفل الخريطة تجد قواعد العمل والقرارات والتقارير.
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
                      roles={["field-media-member"]}
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

        <GuideGovernanceTopics />
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
