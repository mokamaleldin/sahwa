export const UNIVERSITIES = ['استنيا', 'بيلجي', 'جليشيم'];
export const GENDERS = ['شاب', 'بنت'];
export const STUDY_STATUSES = ['طالب', 'خريج'];
export const WORK_AREAS = ['أنشطة', 'علاقات عامة', 'إعلام', 'إدارة / مسؤولية عامة', 'متطوع عام'];
export const WORK_SCOPES = [...UNIVERSITIES, 'عام / مركزي'];
export const ROLES = ['عضو', 'نائب مسؤول', 'مسؤول', 'مسؤول جامعة'];
export const PERSON_STATUSES = [
  'متطوع حاليًا',
  'متوقف مؤقتًا',
  'من أهل صحوة – غير متطوع حاليًا',
  'انتهت مشاركته مع الفريق',
  'تم إنهاء مشاركته',
];

export function normalizeSearch(value) {
  return String(value || '').normalize('NFKC').replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').toLocaleLowerCase('ar').trim();
}

export function filterVolunteers(people, filters) {
  const query = normalizeSearch(filters.query);
  return people.filter(person => {
    if (query && !normalizeSearch([person.fullName, person.university, person.major, person.skills, person.phone].join(' ')).includes(query)) return false;
    return ['university', 'workArea', 'role', 'studyStatus', 'status', 'gender']
      .every(key => !filters[key] || person[key] === filters[key]);
  }).sort((a, b) => a.fullName.localeCompare(b.fullName, 'ar'));
}
