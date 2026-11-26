import { ChevronLeft, KeyRound, UserRound } from "lucide-react";
import type { Volunteer } from "../../lib/team";
import { ageFromBirthDate } from "../../../shared/team-options.js";
import { roleForVolunteer, volunteerRoleLabel } from "../../../shared/volunteer-roles.js";

export default function VolunteerCard({
  person,
  onOpen,
}: {
  person: Volunteer;
  onOpen: () => void;
}) {
  const role = roleForVolunteer(person);
  const age = ageFromBirthDate(person.birthDate);
  const hasAssignments = Boolean(person.assignments?.length);
  const accountLabel = person.account
    ? person.account.status === "active"
      ? "لديه حساب"
      : person.account.status === "suspended"
        ? "حساب موقوف"
        : "بدون حساب"
    : "";

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
        <strong>
          {hasAssignments
            ? person.assignments.map((a) => a.title).join("، ")
            : volunteerRoleLabel(person) || "الدور غير محدد"}
        </strong>
        {role?.status && <span>{role.status}</span>}
        {(person.allowed?.oversightOnly || (person.allowed && !hasAssignments)) && (
          <div className="platform-chips mt-1">
            {person.allowed?.oversightOnly && (
              <span className="platform-chip platform-chip-gold">تبع الجامعة — للعرض</span>
            )}
            {person.allowed && !hasAssignments && (
              <span className="platform-chip platform-chip-muted">دون دور مسند</span>
            )}
          </div>
        )}
      </div>
      <span className="team-person-open">
        <span className="flex items-center gap-1.5">
          {accountLabel ? (
            <>
              <KeyRound size={13} aria-hidden="true" />
              {accountLabel}
            </>
          ) : (
            "عرض الملف"
          )}
        </span>
        <ChevronLeft size={16} aria-hidden="true" />
      </span>
    </button>
  );
}
