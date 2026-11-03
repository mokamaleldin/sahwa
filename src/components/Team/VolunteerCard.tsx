import { ChevronLeft, UserRound } from "lucide-react";
import type { Volunteer } from "../../lib/team";
import { ageFromBirthDate } from "../../../shared/team-options.js";

export default function VolunteerCard({
  person,
  onOpen,
}: {
  person: Volunteer;
  onOpen: () => void;
}) {
  const age = ageFromBirthDate(person.birthDate);
  return (
    <button
      type="button"
      className="team-person-card"
      onClick={onOpen}
      aria-label={`عرض بيانات ${person.fullName}`}
    >
      <div className="team-person-card-top">
        <span className="team-avatar">
          <UserRound size={26} aria-hidden="true" />
        </span>
        <div className="team-person-tags">
          <span
            className={`team-status${person.status === "نشط" ? " team-status-active" : ""}`}
          >
            {person.status}
          </span>
          {age !== null && (
            <span className="team-age">{age.toLocaleString("ar-EG")} سنة</span>
          )}
        </div>
      </div>
      <h3>{person.fullName}</h3>
      <p className="team-person-university">
        {[person.university, person.gender].filter(Boolean).join(" · ")}
      </p>
      <p className="team-person-major">
        {[person.major, person.studyYear].filter(Boolean).join(" · ") || "—"}
      </p>
      <div className="team-person-role">
        <strong>{person.responsibility || "متطوع"}</strong>
        <span>{person.team || "مجال التطوع غير محدد"}</span>
      </div>
      <span className="team-person-open">
        عرض الملف
        <ChevronLeft size={16} aria-hidden="true" />
      </span>
    </button>
  );
}
