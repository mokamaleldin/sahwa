import { todayInIstanbul, normalizeMajor } from "../shared/team-options.js";

export class TeamError extends Error {
  constructor(message, status = 400, code = "INVALID_INPUT") {
    super(message);
    this.status = status;
    this.code = code;
  }
}
export const UUID =
  /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
export function text(input, key, label, max, required = false) {
  const value = input[key] ?? "";
  if (
    typeof value !== "string" ||
    value.length > max ||
    /[\u0000-\u001f\u007f]/.test(value)
  )
    throw new TeamError(`راجع حقل ${label}.`);
  const clean = value.trim();
  if (required && !clean) throw new TeamError(`أدخل ${label}.`);
  return clean;
}
export function date(value, label, required = false) {
  if (!value && !required) return "";
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    !Number.isFinite(Date.parse(value)) ||
    new Date(value).toISOString().slice(0, 10) !== value
  )
    throw new TeamError(`أدخل ${label} صحيحًا.`);
  return value;
}
export function validatePerson(input) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new TeamError("بيانات المتطوع غير صالحة.");
  const person = {
    fullName: text(input, "fullName", "اسم المتطوع", 120, true),
    university: text(input, "university", "الجامعة", 120, true),
    gender: text(input, "gender", "شاب أو بنت", 20, true),
    status: text(input, "status", "الحالة الحالية", 30, true),
    birthDate: date(
      text(input, "birthDate", "تاريخ الميلاد", 10),
      "تاريخ ميلاد",
    ),
    team: text(input, "team", "مجال التطوع", 80),
    responsibility: text(input, "responsibility", "المسؤولية", 120),
    phone: text(input, "phone", "رقم الهاتف", 30).replace(/[٠-٩]/g, (digit) =>
      String(digit.charCodeAt(0) - 1632),
    ),
    major: normalizeMajor(text(input, "major", "التخصص", 120)),
    studyYear: text(input, "studyYear", "السنة الدراسية", 60),
  };
  if (
    !["شاب", "بنت"].includes(person.gender) ||
    !["نشط", "غير نشط", "خريج", "متوقف مؤقتًا"].includes(person.status)
  )
    throw new TeamError("اختر قيمة صحيحة من القوائم.");
  if (
    person.birthDate &&
    (person.birthDate > todayInIstanbul() || person.birthDate < "1900-01-01")
  )
    throw new TeamError("راجع تاريخ الميلاد.");
  if (
    person.phone &&
    (!/^[+\d\s()\-]+$/.test(person.phone) ||
      person.phone.replace(/\D/g, "").length < 7 ||
      person.phone.replace(/\D/g, "").length > 16)
  )
    throw new TeamError("أدخل رقم هاتف صحيحًا، ويمكن إضافة رمز الدولة.");
  return person;
}
export function validateEvent(input) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new TeamError("بيانات الفعالية غير صالحة.");
  const attendance =
    input.attendance === "" ||
    input.attendance === null ||
    input.attendance === undefined
      ? null
      : input.attendance;
  if (
    attendance !== null &&
    (!Number.isSafeInteger(attendance) ||
      attendance < 0 ||
      attendance > 1000000)
  )
    throw new TeamError(
      "عدد الحضور يجب أن يكون عددًا صحيحًا من صفر إلى مليون، أو اتركه فارغًا.",
    );
  const responsibleId =
    input.responsibleId === "" ||
    input.responsibleId === undefined ||
    input.responsibleId === null
      ? null
      : input.responsibleId;
  if (
    responsibleId !== null &&
    (typeof responsibleId !== "string" || !UUID.test(responsibleId))
  )
    throw new TeamError("اختر المسؤول من قائمة المتطوعين.");
  const notes = input.notes ?? "";
  if (
    typeof notes !== "string" ||
    notes.length > 1000 ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(notes)
  )
    throw new TeamError("الملاحظات يجب ألا تتجاوز 1000 حرف.");
  return {
    title: text(input, "title", "اسم الفعالية", 160, true),
    eventDate: date(
      text(input, "eventDate", "تاريخ الفعالية", 10),
      "تاريخ فعالية",
    ),
    responsibleId,
    attendance,
    notes: notes.trim(),
    preserveLegacyResponsible:
      input.preserveLegacyResponsible === true && responsibleId === null,
  };
}
export function recordVersion(input) {
  if (
    !UUID.test(input.id ?? "") ||
    !Number.isSafeInteger(input.revision) ||
    input.revision < 1
  )
    throw new TeamError("حدّث القائمة ثم حاول مجددًا.");
}
