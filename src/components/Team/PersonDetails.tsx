import { Pencil, UserRound } from "lucide-react";
import TeamDialog from "./TeamDialog";
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
  const fields = [
    ["الجامعة", person.university],
    ["التخصص", person.major],
    ["السنة الدراسية", person.studyYear],
    ["تاريخ الميلاد", person.birthDate ? displayDate(person.birthDate) : ""],
    [
      "شباب / طالبات",
      person.gender === "شاب"
        ? "شباب"
        : person.gender === "طالبة"
          ? "طالبات"
          : "",
    ],
    ["الفريق", person.team],
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
              <dd dir={label === "البريد الإلكتروني" ? "ltr" : undefined}>
                {value || "—"}
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
