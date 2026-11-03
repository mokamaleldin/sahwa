export const UNIVERSITIES = ["استنيا", "بيلجي", "جليشيم", "عام / مركزي"];
export const GENDERS = ["شاب", "بنت"];
export const VOLUNTEER_AREAS = [
  "أنشطة",
  "إعلام",
  "علاقات عامة",
  "متطوع عام",
  "إدارة (مسؤولية عامة)",
];
export const RESPONSIBILITIES = ["عضو", "نائب مسؤول", "مسؤول"];
export const PERSON_STATUSES = ["نشط", "متوقف مؤقتًا", "غير نشط"];
export const STUDY_YEARS = [
  "سنة تحضيرية",
  "السنة الأولى",
  "السنة الثانية",
  "السنة الثالثة",
  "السنة الرابعة",
  "السنة الخامسة فأعلى",
  "متخرج",
];
export const MAJORS = [
  "أحياء جزيئية وعلم الوراثة",
  "هندسة الحاسوب",
  "العمارة",
  "الصيدلة",
  "العلاج الطبيعي وإعادة التأهيل",
  "طب الأسنان",
  "هندسة البرمجيات",
  "الهندسة الطبية الحيوية",
  "علم النفس",
  "التجارة الدولية والأعمال",
  "الطب البشري",
  "إدارة الأعمال",
  "العمارة الداخلية والتصميم البيئي",
  "نظم المعلومات الإدارية",
  "تكنولوجيا الطائرات",
  "هندسة الطيران",
  "اللغات",
  "التصميم الجرافيكي",
  "الهندسة المدنية",
  "هندسة الميكانيكا",
  "هندسة الكهرباء والإلكترونيات",
  "الهندسة الصناعية",
  "هندسة الطاقة المتجددة",
  "فنون الطهي",
  "التغذية والحميات",
  "تقنيات تعويضات الأسنان",
  "اللغة التركية وآدابها",
  "اللغة الإنجليزية وآدابها",
  "السينما والتلفزيون",
];
const MAJOR_ALIASES = [
  ["أحياء جزيئية وعلم الوراثة", "Molecular biology and genetics", "Genetics"],
  ["هندسة الحاسوب", "Computer engineering"],
  ["العمارة", "Architecture", "Architectural engineering", "هندسة عمارة", "هندسه عماره", "عمارة", "عماره", "العمارة - Architecture"],
  ["الصيدلة", "Pharmacy", "صيدلة", "صيدلية"],
  ["العلاج الطبيعي وإعادة التأهيل", "Physiotherapy and rehabilitation", "Physiotherapy", "Physical therapy", "علاج طبيعي", "العلاج الطبيعي", "علاج فيزيائي وإعادة تأهيل", "علاج طبيعي physiotherapy"],
  ["طب الأسنان", "Dentistry"],
  ["هندسة البرمجيات", "Software engineer", "Software engineering", "Yazılım mühendisliği", "هندسة برمجيات", "هندسة برمجة", "هندسة برمجه", "هندسة البرمجة"],
  ["الهندسة الطبية الحيوية", "Biomedical engineering", "Biomedical", "هندسة طبية", "هندسه طبيه"],
  ["علم النفس", "Psychology", "Psikoloji"],
  ["التجارة الدولية والأعمال", "International trade and business"],
  ["الطب البشري", "طب بشري", "tip", "tıp"],
  ["إدارة الأعمال", "Business administration", "اداره اعمال"],
  ["العمارة الداخلية والتصميم البيئي", "عمارة داخلية وتصميم بيئي", "عمارة داخلية", "عمارة داخلي"],
  ["نظم المعلومات الإدارية", "Management information systems"],
  ["تكنولوجيا الطائرات", "Aircraft technology"],
  ["هندسة الطيران", "هندسة طيران", "هندسة الطيران"],
  ["اللغات", "لغة", "لغه"],
  ["التصميم الجرافيكي", "قرافيك ذيزاين", "Graphic design"],
  ["الهندسة المدنية", "Civil engineering", "هندسة مدنية"],
  ["هندسة الميكانيكا", "هندسة ميكانيكية", "Mechanical engineering"],
  ["هندسة الكهرباء والإلكترونيات", "electrical and electronics engineering", "هندسة الكهرباء", "هندسة كهرباء"],
  ["الهندسة الصناعية", "هندسة صناعية", "Industrial engineering"],
  ["هندسة الطاقة المتجددة", "Renewable energy engineering"],
  ["فنون الطهي", "Gastronomy"],
  ["التغذية والحميات", "تغذية وحمية علاجية"],
  ["تقنيات تعويضات الأسنان", "Diş protez teknolojisi", "diş protez"],
  ["اللغة التركية وآدابها", "Yeni türk dili/ yüksek lisans"],
  ["اللغة الإنجليزية وآدابها", "Phd in english language and Literature"],
  ["السينما والتلفزيون", "Cinema and television"],
];
export function normalizeMajor(value) {
  const clean = String(value || "").trim();
  if (!clean) return "";
  const match = MAJOR_ALIASES.find((aliases) =>
    aliases.some((alias) => normalizeSearch(alias) === normalizeSearch(clean)),
  );
  return match ? match[0] : clean;
}
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
        (!filters.status || p.status === filters.status) &&
        (!filters.gender || p.gender === filters.gender) &&
        (!filters.studyYear || p.studyYear === filters.studyYear),
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
