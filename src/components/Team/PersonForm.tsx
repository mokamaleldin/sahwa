import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import TeamDialog from "./TeamDialog";
import {
  EMPTY_PERSON,
  type Volunteer,
  type VolunteerInput,
} from "../../lib/team";
import {
  GENDERS,
  PERSON_STATUSES,
  UNIVERSITIES,
  VOLUNTEER_AREAS,
  RESPONSIBILITIES,
  STUDY_YEARS,
  MAJORS,
  normalizeMajor,
  todayInIstanbul,
} from "../../../shared/team-options.js";

export default function PersonForm({
  person,
  onSave,
  onClose,
}: {
  person: Volunteer | null;
  onSave: (input: VolunteerInput) => Promise<void>;
  onClose: () => void;
}) {
  const [input, setInput] = useState<VolunteerInput>({
    ...EMPTY_PERSON,
    ...person,
    birthDate: person?.birthDate || "",
    phone: person?.phone || "",
  });
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const update = (key: keyof VolunteerInput, value: string) =>
    setInput((previous) => ({ ...previous, [key]: value }));
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await onSave({ ...input, major: normalizeMajor(input.major) });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر حفظ البيانات.");
      setBusy(false);
    }
  }
  const areas = [
    ...new Set([...VOLUNTEER_AREAS, ...(input.team ? [input.team] : [])]),
  ];
  const responsibilities = [
    ...new Set([
      ...RESPONSIBILITIES,
      ...(input.responsibility ? [input.responsibility] : []),
    ]),
  ];
  const statuses = [
    ...new Set([
      ...PERSON_STATUSES,
      ...(person?.status && !PERSON_STATUSES.includes(person.status) ? [person.status] : []),
    ]),
  ];
  const studyYears = [
    ...new Set([...STUDY_YEARS, ...(input.studyYear && !STUDY_YEARS.includes(input.studyYear) ? [input.studyYear] : [])]),
  ];
  return (
    <TeamDialog
      title={person ? "تعديل ملف المتطوع" : "إضافة متطوع"}
      busy={busy}
      onClose={onClose}
    >
      <form onSubmit={submit} aria-busy={busy}>
        <fieldset className="team-form-body" disabled={busy}>
          <div className="team-form-section">
            <h3>البيانات الأساسية</h3>
            <div className="team-form-grid">
              <label className="team-field">
                <span>اسم المتطوع *</span>
                <input
                  required
                  autoFocus
                  autoComplete="name"
                  value={input.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  maxLength={120}
                />
              </label>
              <label className="team-field">
                <span>الجامعة *</span>
                <input
                  required
                  list="sahwa-universities"
                  value={input.university}
                  onChange={(e) => update("university", e.target.value)}
                  maxLength={120}
                />
                <datalist id="sahwa-universities">
                  {UNIVERSITIES.map((university) => (
                    <option key={university} value={university} />
                  ))}
                </datalist>
              </label>
              <label className="team-field">
                <span>الحالة الحالية *</span>
                <select
                  required
                  value={input.status}
                  onChange={(e) => update("status", e.target.value)}
                >
                  {statuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </label>
              <label className="team-field">
                <span>شاب أو بنت *</span>
                <select
                  required
                  value={input.gender}
                  onChange={(e) => update("gender", e.target.value)}
                >
                  <option value="">اختر</option>
                  {GENDERS.map((gender) => (
                    <option key={gender}>{gender}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          <div className="team-form-section">
            <h3>
              بيانات إضافية <small>اختيارية</small>
            </h3>
            <div className="team-form-grid">
              <label className="team-field">
                <span>
                  تاريخ الميلاد <small>اختياري</small>
                </span>
                <input
                  type="date"
                  min="1900-01-01"
                  max={todayInIstanbul()}
                  value={input.birthDate}
                  onChange={(e) => update("birthDate", e.target.value)}
                />
                <small>نحسب العمر تلقائيًا ونظهره في كارت المتطوع.</small>
              </label>
              <label className="team-field">
                <span>
                  مجال التطوع <small>اختياري</small>
                </span>
                <select
                  value={input.team}
                  onChange={(e) => update("team", e.target.value)}
                >
                  <option value="">غير محدد</option>
                  {areas.map((area) => (
                    <option key={area}>{area}</option>
                  ))}
                </select>
              </label>
              <label className="team-field">
                <span>
                  المسؤولية <small>اختياري</small>
                </span>
                <select
                  value={input.responsibility}
                  onChange={(e) => update("responsibility", e.target.value)}
                >
                  <option value="">بدون مسؤولية محددة</option>
                  {responsibilities.map((responsibility) => (
                    <option key={responsibility}>{responsibility}</option>
                  ))}
                </select>
              </label>
              <label className="team-field">
                <span>
                  رقم الهاتف <small>اختياري</small>
                </span>
                <input
                  type="tel"
                  dir="ltr"
                  autoComplete="tel"
                  maxLength={30}
                  value={input.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="+90 ..."
                />
              </label>
              <label className="team-field">
                <span>
                  التخصص <small>اختياري</small>
                </span>
                <input
                  list="sahwa-majors"
                  maxLength={120}
                  value={input.major}
                  onChange={(e) => update("major", e.target.value)}
                  onBlur={() => update("major", normalizeMajor(input.major))}
                  placeholder="اختر تخصصًا أو اكتب تخصصًا جديدًا"
                />
                <datalist id="sahwa-majors">
                  {MAJORS.map((major) => (
                    <option key={major} value={major} />
                  ))}
                </datalist>
                <small>اقتراحات عربية موحّدة، ويمكن إضافة تخصص غير موجود.</small>
              </label>
              <label className="team-field">
                <span>
                  السنة الدراسية <small>اختياري</small>
                </span>
                <select
                  value={input.studyYear}
                  onChange={(e) => update("studyYear", e.target.value)}
                >
                  <option value="">غير محدد</option>
                  {studyYears.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          {error && (
            <p className="team-error mt-5" role="alert">
              {error}
            </p>
          )}
        </fieldset>
        <div className="team-dialog-footer">
          <button className="team-button" disabled={busy}>
            {busy && (
              <Loader2 className="animate-spin" size={17} aria-hidden="true" />
            )}
            {busy ? "جارٍ الحفظ…" : person ? "حفظ التعديلات" : "إضافة المتطوع"}
          </button>
          <button
            type="button"
            className="team-button team-button-secondary"
            onClick={onClose}
            disabled={busy}
          >
            إلغاء
          </button>
        </div>
      </form>
    </TeamDialog>
  );
}
