import { GENDERS, STUDY_STATUSES, WORK_AREAS, WORK_SCOPES, PERSON_STATUSES } from '../shared/team-options.js';

export class TeamError extends Error {
  constructor(message, status = 400, code = 'INVALID_INPUT') {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
export const PHOTO_ID = /^[a-f0-9-]{36}\.(jpg|png|webp)$/;

function text(input, key, label, max, required = false) {
  const value = input[key] ?? '';
  if (typeof value !== 'string' || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) {
    throw new TeamError(`راجع حقل ${label}.`);
  }
  const clean = value.trim();
  if (required && !clean) throw new TeamError(`أدخل ${label}.`);
  return clean;
}

export function validatePerson(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TeamError('بيانات الشخص غير صالحة.');
  const person = {
    fullName: text(input, 'fullName', 'الاسم الكامل', 120, true),
    gender: text(input, 'gender', 'النوع', 20, true),
    university: text(input, 'university', 'الجامعة', 120, true),
    major: text(input, 'major', 'التخصص', 120),
    studyYear: text(input, 'studyYear', 'السنة الدراسية', 60),
    studyStatus: text(input, 'studyStatus', 'الحالة الدراسية', 20, true),
    workArea: text(input, 'workArea', 'مجال العمل', 80, true),
    workScope: text(input, 'workScope', 'نطاق العمل', 80, true),
    role: text(input, 'role', 'الدور', 80, true),
    joinedAt: text(input, 'joinedAt', 'تاريخ الانضمام', 10),
    phone: text(input, 'phone', 'رقم الهاتف', 30),
    skills: text(input, 'skills', 'المهارات', 1000),
    status: text(input, 'status', 'حالة الشخص داخل صحوة', 80, true),
  };
  for (const [key, choices] of Object.entries({ gender: GENDERS, studyStatus: STUDY_STATUSES, workArea: WORK_AREAS, workScope: WORK_SCOPES, status: PERSON_STATUSES })) {
    if (!choices.includes(person[key])) throw new TeamError('اختر قيمة صحيحة من القوائم.');
  }
  if (person.joinedAt && (!/^\d{4}-\d{2}-\d{2}$/.test(person.joinedAt) || !Number.isFinite(Date.parse(person.joinedAt)) || new Date(person.joinedAt).toISOString().slice(0, 10) !== person.joinedAt)) {
    throw new TeamError('أدخل تاريخ انضمام صحيحًا.');
  }
  if (person.phone && (!/^[+\d\s()\-]+$/.test(person.phone) || person.phone.replace(/\D/g, '').length < 7 || person.phone.replace(/\D/g, '').length > 16)) {
    throw new TeamError('أدخل رقم هاتف صحيحًا، ويمكن إضافة رمز الدولة.');
  }
  return person;
}

export function parsePhoto(value) {
  if (value === undefined || value === null) return value;
  if (typeof value !== 'string') throw new TeamError('الصورة غير صالحة.');
  const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  if (!match) throw new TeamError('اختر صورة JPG أو PNG أو WebP.');
  const bytes = Buffer.from(match[2], 'base64');
  if (!bytes.length || bytes.length > 160 * 1024) throw new TeamError('حجم الصورة كبير. اختر صورة أصغر.');
  const [type] = match.slice(1);
  const valid = type === 'jpeg' ? bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
    : type === 'png' ? bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      : bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP';
  if (!valid) throw new TeamError('محتوى الصورة غير صالح.');
  return { bytes, extension: type === 'jpeg' ? 'jpg' : type, contentType: `image/${type}` };
}

export function applyPersonChange(document, change) {
  if (!Array.isArray(document.volunteers)) throw new Error('Invalid team document');
  const people = [...document.volunteers];
  const index = people.findIndex(person => person.id === change.id);
  if (change.action === 'create') {
    if (index >= 0) throw new TeamError('هذا السجل موجود بالفعل.', 409, 'CONFLICT');
    if (people.length >= 2000) throw new TeamError('وصل الدليل إلى الحد المتاح حاليًا.', 409);
    people.push({ ...change.person, id: change.id, revision: 1, createdAt: change.now, updatedAt: change.now, photoId: change.photoId ?? null });
  } else {
    if (index < 0) throw new TeamError('هذا الشخص لم يعد موجودًا في الدليل.', 404, 'NOT_FOUND');
    if (people[index].revision !== change.revision) throw new TeamError('تم تعديل هذا الشخص من جهاز آخر. حدّث القائمة وافتح بياناته من جديد قبل الحفظ.', 409, 'CONFLICT');
    if (change.action === 'delete') people.splice(index, 1);
    else people[index] = {
      ...people[index], ...change.person, revision: people[index].revision + 1, updatedAt: change.now,
      photoId: change.photoId === undefined ? people[index].photoId : change.photoId,
    };
  }
  return { schemaVersion: 1, volunteers: people };
}
