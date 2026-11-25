import { normalizeSearch } from "./team-options.js";

export const VOLUNTEER_ROLE_GROUPS = [
  {
    title: "العضوية العامة",
    roles: [
      { id: "sahwa-member", title: "عضو صحوة", keywords: "عضو داخل الجامعة عضو فاعل" },
      { id: "volunteer", title: "متطوع", keywords: "متطوعة متطوع عام خارج اللجان" },
      { id: "former-member", title: "عضو سابق", keywords: "خريج قديم" },
    ],
  },
  {
    title: "فرق الجامعات",
    roles: [
      { id: "university-youth-coordinator", title: "مسؤول الشباب داخل الجامعة" },
      { id: "university-women-coordinator", title: "مسؤولة الطالبات داخل الجامعة" },
      { id: "internal-activities-lead", title: "مسؤول الأنشطة الداخلية", keywords: "مسؤولة الأنشطة الداخلية للشباب للطالبات" },
      { id: "university-activities-member", title: "عضو أنشطة", keywords: "عضوة لجنة الأنشطة الداخلية للشباب للطالبات داخلي" },
      { id: "university-relations-lead", title: "مسؤول العلاقات الجامعية", keywords: "مسؤول العلاقات في الجامعة مندوب" },
      { id: "university-relations-member", title: "عضو العلاقات الجامعية", keywords: "عضو العلاقات في الجامعة مندوب" },
      { id: "additional-committee-lead", title: "مسؤول لجنة جامعية أخرى", detailLabel: "اسم اللجنة", keywords: "مسؤولة لجنة إضافية" },
      { id: "additional-committee-member", title: "عضو لجنة جامعية أخرى", detailLabel: "اسم اللجنة", keywords: "عضوة لجنة إضافية" },
    ],
  },
  {
    title: "الفرق والوحدات المركزية",
    roles: [
      { id: "central-activities-member", title: "عضو الأنشطة المركزية", keywords: "عضو أنشطة مركزي عضوة أنشطة الشباب الطالبات" },
      { id: "central-media-member", title: "عضو الإعلام المركزي", keywords: "عضوة إعلام" },
      { id: "central-relations-member", title: "عضو العلاقات العامة المركزية", keywords: "عضوة علاقات" },
    ],
  },
  {
    title: "الوحدات المركزية — مستقبلية",
    roles: [
      { id: "expansion-lead", title: "مسؤول التوسع والتدريب" },
      { id: "expansion-member", title: "عضو فريق التوسع والتدريب" },
      { id: "technology-lead", title: "المسؤول التقني", keywords: "التقنية والمنصة" },
      { id: "technology-member", title: "عضو الفريق التقني", keywords: "التقنية والمنصة" },
      { id: "programs-lead", title: "مسؤول البرامج والبحوث", keywords: "البرامج والأبحاث" },
      { id: "programs-member", title: "عضو البرامج والبحوث", keywords: "البرامج والأبحاث الفريق العلمي والبحثي" },
    ],
  },
  {
    title: "المساندة الإدارية والمراجعة",
    roles: [
      { id: "finance", title: "المساندة المالية" },
      { id: "records", title: "التوثيق والأرشفة", keywords: "الأرشفة المركزية" },
      { id: "review-member", title: "عضو المتابعة والمراجعة والتظلمات" },
    ],
  },
  {
    title: "مجلس الإدارة المركزي",
    roles: [
      { id: "sahwa-lead", title: "مسؤول صحوة" },
      { id: "women-sector-lead", title: "مسؤولة قطاع الطالبات" },
      { id: "central-youth-lead", title: "مسؤول أنشطة الشباب المركزية" },
      { id: "central-women-lead", title: "مسؤولة أنشطة الطالبات المركزية" },
      { id: "central-media-lead", title: "مسؤول الإعلام المركزي" },
      { id: "central-relations-lead", title: "مسؤول العلاقات العامة المركزية" },
    ],
  },
];

const LEGACY_ROLE_ALIASES = new Map([
  ["internal-youth-activities", "internal-activities-lead"],
  ["internal-women-activities", "internal-activities-lead"],
  ["university-youth-activities-member", "university-activities-member"],
  ["university-women-activities-member", "university-activities-member"],
  ["university-youth-member", "sahwa-member"],
  ["university-women-member", "sahwa-member"],
  ["additional-committee-women-lead", "additional-committee-lead"],
  ["additional-committee-women-member", "additional-committee-member"],
  ["central-youth-member", "central-activities-member"],
  ["central-women-member", "central-activities-member"],
]);

const roles = VOLUNTEER_ROLE_GROUPS.flatMap((group) => group.roles);
export const volunteerRolesById = new Map(roles.map((role) => [role.id, role]));

export function roleSearchText(value) {
  return normalizeSearch(value).replace(/مس[ؤئو]و?ل/g, "مسول").replace(/\s+/g, " ");
}

const rolesByTitle = new Map(roles.map((role) => [roleSearchText(role.title), role]));
export const roleForTitle = (title) => rolesByTitle.get(roleSearchText(title));

export function roleForVolunteer(person) {
  const id = LEGACY_ROLE_ALIASES.get(person.roleId) || person.roleId;
  return volunteerRolesById.get(id);
}

export function volunteerRoleLabel(person) {
  const title = roleForVolunteer(person)?.title || person.responsibility;
  return [...new Set([title, person.team].filter(Boolean))].join(" — ");
}
