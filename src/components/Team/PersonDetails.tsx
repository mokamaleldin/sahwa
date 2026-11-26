import { useState } from "react";
import { Pencil, UserRound, Phone, Trash2, Loader2 } from "lucide-react";
import TeamDialog from "./TeamDialog";
import { ageFromBirthDate } from "../../../shared/team-options.js";
import { roleForVolunteer, volunteerRoleLabel } from "../../../shared/volunteer-roles.js";
import { displayDate, type Volunteer, type VolunteerMeta } from "../../lib/team";
import PersonAccess from "./PersonAccess";

type TabId = "info" | "roles" | "account";

export default function PersonDetails({
  person,
  onClose,
  onEdit,
  onDelete,
  meta,
  onChanged,
}: {
  person: Volunteer;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => Promise<void>;
  meta?: VolunteerMeta;
  onChanged?: () => Promise<void> | void;
}) {
  const [tab, setTab] = useState<TabId>("info");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    if (deleting || !confirmDelete) return;
    setDeleting(true);
    setError("");
    try {
      await onDelete();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر أرشفة المتطوع.");
      setDeleting(false);
    }
  }

  const age = ageFromBirthDate(person.birthDate);
  const hasRolesTab = Boolean(
    meta &&
      onChanged &&
      person.allowed &&
      (person.assignments.length > 0 || person.allowed.assign || person.allowed.level),
  );
  const hasAccountTab = Boolean(meta && onChanged && person.account);
  const tabs: { id: TabId; label: string }[] = [
    { id: "info", label: "ملف المتطوع" },
    ...(hasRolesTab ? [{ id: "roles" as const, label: `الأدوار (${person.assignments.length.toLocaleString("ar-EG")})` }] : []),
    ...(hasAccountTab
      ? [
          {
            id: "account" as const,
            label: person.account?.status === "none" ? "إنشاء حساب" : "الحساب والدخول",
          },
        ]
      : []),
  ];

  const activeTab: TabId = tabs.some((t) => t.id === tab) ? tab : "info";
  const fields = [
    ["الجامعة", person.university],
    ["التخصص", person.major],
    ["السنة الدراسية", person.studyYear],
    ["تاريخ الميلاد", person.birthDate ? displayDate(person.birthDate) : ""],
    [
      "شاب أو بنت",
      person.gender === "شاب" ? "شاب" : person.gender === "بنت" ? "بنت" : "",
    ],
    ["العمر", age === null ? "" : `${age.toLocaleString("ar-EG")} سنة`],
    ["المستوى التنظيمي", person.membershipLevel || "متطوع"],
    ["رقم الهاتف", person.phone],
  ];

  return (
    <TeamDialog title={person.fullName} onClose={onClose} busy={deleting}>
      {tabs.length > 1 && (
        <div className="dialog-tabs" role="tablist" aria-label="أقسام ملف المتطوع">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={activeTab === t.id}
              onClick={() => {
                setTab(t.id);
                setConfirmDelete(false);
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div className="team-form-body">
        {activeTab === "info" && (
          <>
            <div className="team-person-intro">
              <span className="team-avatar team-avatar-large">
                <UserRound size={34} aria-hidden="true" />
              </span>
              <div>
                <h3>{person.fullName}</h3>
                <div className="platform-chips">
                  <span
                    className={`team-status${person.status === "نشط" ? " team-status-active" : ""}`}
                  >
                    {person.status}
                  </span>
                  {person.allowed?.oversightOnly && (
                    <span className="platform-chip platform-chip-gold">
                      تبع الجامعة — للعرض والتنسيق
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-5">
              <p className="text-xs text-brand-muted mb-2">الأدوار في صحوة</p>
              {person.assignments?.length ? (
                <div className="platform-chips">
                  {person.assignments.map((a) => (
                    <span key={a.id} className="platform-chip">
                      {a.title} — {a.scope}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#350E15]">
                  {[volunteerRoleLabel(person), roleForVolunteer(person)?.status]
                    .filter(Boolean)
                    .join(" · ") || "دون دور مسند حاليًا"}
                </p>
              )}
            </div>

            <dl className="team-detail-grid">
              {fields.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>
                    {label === "رقم الهاتف" && value ? (
                      <a
                        className="team-phone"
                        href={`tel:${value.replace(/[^+\d]/g, "")}`}
                      >
                        <Phone size={15} aria-hidden="true" />
                        <span dir="ltr">{value}</span>
                      </a>
                    ) : (
                      value || "—"
                    )}
                  </dd>
                </div>
              ))}
            </dl>

            {error && (
              <p className="team-error mt-5" role="alert">
                {error}
              </p>
            )}
            {confirmDelete && (
              <div className="team-delete-confirm" role="alert">
                <p>هل تريد أرشفة «{person.fullName}» من سجل المتطوعين؟</p>
                <p className="mt-2 text-sm">
                  يختفي السجل من القوائم ويتوقف دخول حسابه إن وُجد، وتبقى بياناته وأدواره ومشاركاته محفوظة.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="team-button team-button-secondary"
                    autoFocus
                    onClick={() => setConfirmDelete(false)}
                    disabled={deleting}
                  >
                    تراجع
                  </button>
                  <button
                    type="button"
                    className="team-button team-button-danger"
                    onClick={() => void remove()}
                    disabled={deleting}
                  >
                    {deleting && <Loader2 size={17} className="animate-spin" aria-hidden="true" />}
                    {deleting ? "جارٍ الأرشفة…" : "نعم، أرشف المتطوع"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "roles" && meta && onChanged && (
          <PersonAccess person={person} meta={meta} onChanged={onChanged} mode="roles" />
        )}

        {activeTab === "account" && meta && onChanged && (
          <PersonAccess person={person} meta={meta} onChanged={onChanged} mode="account" />
        )}
      </div>

      <div className="team-dialog-footer">
        {activeTab === "info" && person.allowed?.edit !== false && (
          <button
            type="button"
            className="team-button"
            onClick={onEdit}
            disabled={deleting || confirmDelete}
          >
            <Pencil size={17} aria-hidden="true" />
            تعديل البيانات الأساسية
          </button>
        )}
        <button
          type="button"
          className="team-button team-button-secondary"
          onClick={onClose}
          disabled={deleting}
        >
          إغلاق
        </button>
        {activeTab === "info" && person.allowed?.archive !== false && (
          <button
            type="button"
            className="team-text-button team-delete-action"
            onClick={() => setConfirmDelete(true)}
            disabled={deleting || confirmDelete}
          >
            <Trash2 size={16} aria-hidden="true" />
            أرشفة المتطوع
          </button>
        )}
      </div>
    </TeamDialog>
  );
}
