export const UNIVERSITIES = ["استنيا", "بيلجي", "جليشيم", "عام / مركزي"];
export const GENDERS = ["شاب", "طالبة"];
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
            [p.fullName, p.university, p.major, p.team, p.email].join(" "),
          ).includes(query)) &&
        (!filters.university || p.university === filters.university) &&
        (!filters.status || p.status === filters.status),
    )
    .sort((a, b) => a.fullName.localeCompare(b.fullName, "ar"));
}
