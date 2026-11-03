import { useState } from "react";
import { Pencil, UserRound, Phone, Trash2, Loader2 } from "lucide-react";
import TeamDialog from "./TeamDialog";
import { ageFromBirthDate } from "../../../shared/team-options.js";
import { displayDate, type Volunteer } from "../../lib/team";

export default function PersonDetails({
  person,
  onClose,
  onEdit,
  onDelete,
}: {
  person: Volunteer;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => Promise<void>;
}) {
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
      setError(reason instanceof Error ? reason.message : "تعذر حذف المتطوع.");
      setDeleting(false);
    }
  }
  const age = ageFromBirthDate(person.birthDate);
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
    ["مجال التطوع", person.team],
    ["رقم الهاتف", person.phone],
    ["المسؤولية", person.responsibility],
  ];
  return (
    <TeamDialog title="ملف المتطوع" onClose={onClose} busy={deleting}>
      <div className="team-form-body">
        <div className="team-person-intro">
          <span className="team-avatar team-avatar-large">
            <UserRound size={34} />
          </span>
          <div>
            <h3>{person.fullName}</h3>
            <span
              className={`team-status${person.status === "نشط" ? " team-status-active" : ""}`}
            >
              {person.status}
            </span>
          </div>
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
          <p className="team-error mt-5" role="alert">{error}</p>
        )}
        {confirmDelete && (
          <div className="team-delete-confirm" role="alert">
            <p>هل تريد حذف «{person.fullName}» نهائيًا من سجل المتطوعين؟</p>
            <p className="mt-2 text-sm">لن تُحذف الفعاليات المرتبطة به، لكن سيُزال اسمه من حقل المسؤول عنها إذا كان مرتبطًا بها.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="team-button team-button-danger"
                onClick={() => void remove()}
                disabled={deleting}
              >
                {deleting && <Loader2 size={17} className="animate-spin" aria-hidden="true" />}
                {deleting ? "جارٍ الحذف…" : "نعم، احذف المتطوع"}
              </button>
              <button
                type="button"
                className="team-button team-button-secondary"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
              >
                تراجع
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="team-dialog-footer">
        <button className="team-button" onClick={onEdit} disabled={deleting || confirmDelete}>
          <Pencil size={17} />
          تعديل البيانات الأساسية
        </button>
        <button className="team-button team-button-secondary" onClick={onClose} disabled={deleting}>
          إغلاق
        </button>
        <button
          type="button"
          className="team-text-button team-delete-action"
          onClick={() => setConfirmDelete(true)}
          disabled={deleting || confirmDelete}
        >
          <Trash2 size={16} aria-hidden="true" />
          حذف المتطوع
        </button>
      </div>
    </TeamDialog>
  );
}
