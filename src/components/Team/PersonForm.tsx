import { useId, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import TeamDialog from "./TeamDialog";
import TeamComboField, { type ComboGroup, type ComboOption } from "./TeamComboField";
import VolunteerRoleField from "./VolunteerRoleField";
import { roleForTitle, roleForVolunteer, volunteerRoleLabel } from "../../../shared/volunteer-roles.js";
import {
  EMPTY_PERSON,
  type Volunteer,
  type VolunteerInput, type RoleOptionMeta,
} from "../../lib/team";
import {
  GENDERS,
  PERSON_STATUSES,
  UNIVERSITIES,
  STUDY_YEARS,
  MAJORS,
  MAJOR_SEARCH_KEYWORDS,
  normalizeMajor,
  normalizeSearch,
  todayInIstanbul,
} from "../../../shared/team-options.js";

const UNIVERSITY_GROUPS: ComboGroup[] = [
  {
    options: UNIVERSITIES.map((title, index) => ({
      id: `university-${index}`,
      title,
    })),
  },
];

const MAJOR_OPTIONS: ComboOption[] = MAJORS.map((title, index) => ({
  id: `major-${index}`,
  title,
  keywords: MAJOR_SEARCH_KEYWORDS.get(title),
}));

const MAJOR_GROUPS: ComboGroup[] = [{ options: MAJOR_OPTIONS }];

const MAJOR_BY_TITLE = new Map(
  MAJOR_OPTIONS.map((option) => [normalizeSearch(option.title), option]),
);

function exactMajor(raw: string): ComboOption | undefined {
  const normalized = normalizeMajor(raw);
  return normalized ? MAJOR_BY_TITLE.get(normalizeSearch(normalized)) : undefined;
}

export default function PersonForm({
  person,
  volunteers = [],
  roles,
  onSave,
  onClose,
}: {
  person: Volunteer | null;
  volunteers?: Volunteer[];
  roles?: RoleOptionMeta[];
  onSave: (input: VolunteerInput) => Promise<void>;
  onClose: () => void;
}) {
  const idPrefix = useId();
  const [input, setInput] = useState<VolunteerInput>({
    ...EMPTY_PERSON,
    ...person,
    birthDate: person?.birthDate || "",
    phone: person?.phone || "",
  });
  const [assignmentRoleId, setAssignmentRoleId] = useState("");
  const previousRole = person && roleForVolunteer(person);
  const originalTitle = previousRole?.title || (person ? volunteerRoleLabel(person) : "");
  const originalDetail = previousRole?.detailLabel && person ? person.team : "";
  const [roleTitle, setRoleTitle] = useState(originalTitle);
  const [roleDetail, setRoleDetail] = useState(originalDetail);
  const [editedRole, setEditedRole] = useState(false);
  const selectedRole = roleForTitle(roleTitle);
  const roleChanged = roleTitle !== originalTitle
    || roleDetail !== originalDetail
    || (editedRole && Boolean(selectedRole) && !previousRole);
  const detailSuggestions = selectedRole?.detailLabel
    ? [...new Set(volunteers
        .filter((other) => normalizeSearch(other.university) === normalizeSearch(input.university)
          && roleForVolunteer(other)?.detailLabel === selectedRole.detailLabel)
        .map((other) => other.team).filter(Boolean))]
    : [];
  const detailRequired = !person || roleChanged || Boolean(originalDetail);
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
      await onSave({
        ...input,
        major: normalizeMajor(input.major),
        ...(roles ? (!person ? { assignmentRoleId } : {}) : (!person || roleChanged ? { roleTitle, roleDetail } : {})),
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر حفظ البيانات.");
      setBusy(false);
    }
  }
  const statuses = [
    ...new Set([
      ...PERSON_STATUSES,
      ...(person?.status && !PERSON_STATUSES.includes(person.status) ? [person.status] : []),
    ]),
  ];
  const studyYears = [
    ...new Set([...STUDY_YEARS, ...(input.studyYear && !STUDY_YEARS.includes(input.studyYear) ? [input.studyYear] : [])]),
  ];
  const nameId = `${idPrefix}-name`;
  const statusId = `${idPrefix}-status`;
  const genderId = `${idPrefix}-gender`;
  const detailId = `${idPrefix}-detail`;
  const birthDateId = `${idPrefix}-birth-date`;
  const birthHintId = `${idPrefix}-birth-hint`;
  const phoneId = `${idPrefix}-phone`;
  const studyYearId = `${idPrefix}-study-year`;

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
              <div className="team-field">
                <label htmlFor={nameId}>اسم المتطوع *</label>
                <input
                  id={nameId}
                  name="fullName"
                  required
                  autoFocus
                  autoComplete="name"
                  value={input.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  maxLength={120}
                />
              </div>
              <TeamComboField
                label="الجامعة"
                name="university"
                required
                value={input.university}
                onChange={(value) => update("university", value)}
                groups={UNIVERSITY_GROUPS}
                placeholder="اختر الجامعة أو اكتب جامعة أخرى"
                listLabel="الجامعات"
                openLabel="عرض الجامعات"
                closeLabel="إغلاق قائمة الجامعات"
              />
              <div className="team-field">
                <label htmlFor={statusId}>الحالة الحالية *</label>
                <select
                  id={statusId}
                  name="status"
                  required
                  value={input.status}
                  onChange={(e) => update("status", e.target.value)}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="team-field">
                <label htmlFor={genderId}>شاب أو بنت *</label>
                <select
                  id={genderId}
                  name="gender"
                  required
                  value={input.gender}
                  onChange={(e) => update("gender", e.target.value)}
                >
                  <option value="">اختر</option>
                  {GENDERS.map((gender) => (
                    <option key={gender} value={gender}>{gender}</option>
                  ))}
                </select>
              </div>
              {roles ? (!person && <label className="team-field"><span>الدور التنظيمي *</span>
                <select required value={assignmentRoleId} onChange={(e) => setAssignmentRoleId(e.target.value)}>
                  <option value="">اختر الدور</option>{roles.filter((r) => (r.sector !== "women" || input.gender === "بنت") && (r.sector !== "youth" || input.gender === "شاب"))
                    .map((r) => <option key={r.id} value={r.id}>{input.gender === "بنت" && r.titleWomen ? r.titleWomen : r.title}</option>)}
                </select></label>) : <VolunteerRoleField
                value={roleTitle}
                onChange={(title) => {
                  setEditedRole(true);
                  if (roleForTitle(title)?.detailLabel !== selectedRole?.detailLabel) setRoleDetail("");
                  setRoleTitle(title);
                }}
              />}
              {!roles && selectedRole?.detailLabel && (
                detailSuggestions.length > 0 ? (
                  <TeamComboField
                    label={selectedRole.detailLabel}
                    name="roleDetail"
                    required={detailRequired}
                    fullWidth
                    maxLength={80}
                    value={roleDetail}
                    onChange={setRoleDetail}
                    groups={[
                      {
                        options: detailSuggestions.map((detail, index) => ({
                          id: `detail-${index}`,
                          title: detail,
                        })),
                      },
                    ]}
                    placeholder="اختر لجنة مسجّلة أو اكتب اسم اللجنة"
                    listLabel={selectedRole.detailLabel}
                  />
                ) : (
                  <div className="team-field team-field-full">
                    <label htmlFor={detailId}>
                      {selectedRole.detailLabel}
                      {detailRequired ? " *" : ""}
                    </label>
                    <input
                      id={detailId}
                      name="roleDetail"
                      required={detailRequired}
                      maxLength={80}
                      value={roleDetail}
                      onChange={(event) => setRoleDetail(event.target.value)}
                    />
                  </div>
                )
              )}
            </div>
          </div>
          <div className="team-form-section">
            <h3>
              بيانات إضافية <small>اختيارية</small>
            </h3>
            <div className="team-form-grid">
              <div className="team-field">
                <label htmlFor={birthDateId}>
                  تاريخ الميلاد <small>اختياري</small>
                </label>
                <input
                  id={birthDateId}
                  name="birthDate"
                  type="date"
                  min="1900-01-01"
                  max={todayInIstanbul()}
                  aria-describedby={birthHintId}
                  value={input.birthDate}
                  onChange={(e) => update("birthDate", e.target.value)}
                />
                <small id={birthHintId}>نحسب العمر تلقائيًا ونظهره في كارت المتطوع.</small>
              </div>
              <div className="team-field">
                <label htmlFor={phoneId}>
                  رقم الهاتف <small>اختياري</small>
                </label>
                <input
                  id={phoneId}
                  name="phone"
                  type="tel"
                  dir="ltr"
                  autoComplete="tel"
                  maxLength={30}
                  value={input.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="+90 ..."
                />
              </div>
              <TeamComboField
                label="التخصص"
                name="major"
                optional
                value={input.major}
                onChange={(value) => update("major", value)}
                onBlurValue={() => update("major", normalizeMajor(input.major))}
                groups={MAJOR_GROUPS}
                exactMatch={exactMajor}
                placeholder="اختر تخصصًا أو اكتب تخصصًا جديدًا"
                listLabel="التخصصات"
                openLabel="عرض التخصصات"
                closeLabel="إغلاق قائمة التخصصات"
                hint="اقتراحات عربية موحّدة، ويمكن إضافة تخصص غير موجود."
              />
              <div className="team-field">
                <label htmlFor={studyYearId}>
                  السنة الدراسية <small>اختياري</small>
                </label>
                <select
                  id={studyYearId}
                  name="studyYear"
                  value={input.studyYear}
                  onChange={(e) => update("studyYear", e.target.value)}
                >
                  <option value="">غير محدد</option>
                  {studyYears.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          {error && (
            <p className="team-error mt-5" role="alert">
              {error}
            </p>
          )}
        </fieldset>
        <div className="team-dialog-footer">
          <button type="submit" className="team-button" disabled={busy}>
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
