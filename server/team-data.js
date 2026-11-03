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
export function validatePerson(input, creating = true) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new TeamError("بيانات المتطوع غير صالحة.");
  const person = {
    fullName: text(input, "fullName", "اسم المتطوع", 120, true),
    email: text(input, "email", "البريد الإلكتروني", 254, true).toLowerCase(),
    university: text(input, "university", "الجامعة", 120, true),
    major: text(input, "major", "التخصص", 120),
    studyYear: text(input, "studyYear", "السنة الدراسية", 60),
    birthDate: date(
      text(input, "birthDate", "تاريخ الميلاد", 10),
      "تاريخ ميلاد",
    ),
    gender: text(input, "gender", "شباب / طالبات", 20),
    team: text(input, "team", "الفريق", 80),
    responsibility: text(input, "responsibility", "المسؤولية", 120),
    status: text(input, "status", "الحالة", 30, true),
    accessRole: text(input, "accessRole", "الصلاحيات", 20, true),
  };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(person.email))
    throw new TeamError("أدخل بريدًا إلكترونيًا صحيحًا.");
  if (
    !["", "شاب", "طالبة"].includes(person.gender) ||
    !["نشط", "غير نشط", "خريج", "متوقف مؤقتًا"].includes(person.status) ||
    !["admin", "volunteer"].includes(person.accessRole)
  )
    throw new TeamError("اختر قيمة صحيحة من القوائم.");
  if (
    person.birthDate &&
    (person.birthDate > new Date().toISOString().slice(0, 10) ||
      person.birthDate < "1900-01-01")
  )
    throw new TeamError("راجع تاريخ الميلاد.");
  const password = input.password ?? "";
  if (
    typeof password !== "string" ||
    password.length > 256 ||
    ((creating || password) && password.length < 10)
  )
    throw new TeamError("كلمة المرور يجب أن تكون من 10 إلى 256 حرفًا.");
  return { ...person, password };
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
      text(input, "eventDate", "تاريخ الفعالية", 10, true),
      "تاريخ فعالية",
      true,
    ),
    responsible: text(input, "responsible", "المسؤول عن الفعالية", 120, true),
    attendance,
    notes: notes.trim(),
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
