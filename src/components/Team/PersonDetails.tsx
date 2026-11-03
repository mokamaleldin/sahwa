import { Pencil, UserRound, Phone } from "lucide-react";
import TeamDialog from "./TeamDialog";
import { ageFromBirthDate } from "../../../shared/team-options.js";
import { displayDate, type Volunteer } from "../../lib/team";

export default function PersonDetails({
  person,
  onClose,
  onEdit,
}: {
  person: Volunteer;
  onClose: () => void;
  onEdit: () => void;
}) {
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
    <TeamDialog title="ملف المتطوع" onClose={onClose}>
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
      </div>
      <div className="team-dialog-footer">
        <button className="team-button" onClick={onEdit}>
          <Pencil size={17} />
          تعديل البيانات الأساسية
        </button>
        <button className="team-button team-button-secondary" onClick={onClose}>
          إغلاق
        </button>
      </div>
    </TeamDialog>
  );
}
