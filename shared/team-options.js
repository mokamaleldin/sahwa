export const UNIVERSITIES = ["استنيا", "بيلجي", "جليشيم", "عام / مركزي"];
export const GENDERS = ["شاب", "بنت"];
export const VOLUNTEER_AREAS = [
  "أنشطة",
  "إعلام",
  "علاقات عامة",
  "إدارة / مسؤولية عامة",
  "متطوع عام",
];
export const RESPONSIBILITIES = ["عضو", "نائب مسؤول", "مسؤول", "مسؤول جامعة"];
export const PERSON_STATUSES = ["نشط", "غير نشط", "خريج", "متوقف مؤقتًا"];
export function normalizeSearch(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .toLocaleLowerCase("ar")
    .trim();
}
export function filterVolunteers(people, filters) {
  const query = normalizeSearch(filters.query);
  return people
    .filter(
      (p) =>
        (!query ||
          normalizeSearch(
            [p.fullName, p.university, p.major, p.team, p.phone].join(" "),
          ).includes(query)) &&
        (!filters.university || p.university === filters.university) &&
        (!filters.status || p.status === filters.status),
    )
    .sort((a, b) => a.fullName.localeCompare(b.fullName, "ar"));
}

export function todayInIstanbul(now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Istanbul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .formatToParts(now)
      .map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}
export function ageFromBirthDate(value, today = todayInIstanbul()) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    !Number.isFinite(Date.parse(value)) ||
    new Date(value).toISOString().slice(0, 10) !== value ||
    value > today
  )
    return null;
  const [year, month, day] = value.split("-").map(Number),
    [currentYear, currentMonth, currentDay] = today.split("-").map(Number);
  return (
    currentYear -
    year -
    (currentMonth < month || (currentMonth === month && currentDay < day)
      ? 1
      : 0)
  );
}
