import { normalizeSearch } from "./team-options.js";

export const VOLUNTEER_ROLE_GROUPS = [
  {
    title: "فرق الجامعات",
    roles: [
      { id: "university-youth-coordinator", title: "مسؤول الشباب داخل الجامعة" },
      { id: "university-women-coordinator", title: "مسؤولة الطالبات داخل الجامعة" },
      { id: "internal-youth-activities", title: "مسؤول الأنشطة الداخلية للشباب" },
      { id: "internal-women-activities", title: "مسؤولة الأنشطة الداخلية للطالبات" },
      { id: "university-youth-activities-member", title: "عضو لجنة الأنشطة الداخلية للشباب" },
      { id: "university-women-activities-member", title: "عضوة لجنة الأنشطة الداخلية للطالبات" },
      { id: "university-relations-lead", title: "مسؤول العلاقات الجامعية" },
      { id: "university-relations-member", title: "عضو العلاقات الجامعية" },
      { id: "field-media-member", title: "عضو الإعلام الميداني بالجامعة" },
      { id: "field-media-women-member", title: "عضوة الإعلام الميداني بالجامعة" },
      { id: "university-youth-member", title: "عضو فاعل في فريق الشباب بالجامعة" },
      { id: "university-women-member", title: "عضوة فاعلة في فريق الطالبات بالجامعة" },
      { id: "additional-committee-lead", title: "مسؤول لجنة جامعية أخرى", detailLabel: "اسم اللجنة", keywords: "لجنة إضافية" },
      { id: "additional-committee-women-lead", title: "مسؤولة لجنة جامعية أخرى", detailLabel: "اسم اللجنة", keywords: "لجنة إضافية" },
      { id: "additional-committee-member", title: "عضو لجنة جامعية أخرى", detailLabel: "اسم اللجنة", keywords: "لجنة إضافية" },
      { id: "additional-committee-women-member", title: "عضوة لجنة جامعية أخرى", detailLabel: "اسم اللجنة", keywords: "لجنة إضافية" },
      { id: "university-youth-followup", title: "مسؤول متابعة جامعات الشباب", status: "عند تفعيل المنصب" },
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
  {
    title: "الفرق والوحدات المركزية",
    roles: [
      { id: "central-youth-member", title: "عضو أنشطة الشباب المركزية" },
      { id: "central-women-member", title: "عضوة أنشطة الطالبات المركزية" },
      { id: "central-media-member", title: "عضو الإعلام المركزي" },
      { id: "central-relations-member", title: "عضو العلاقات العامة المركزية" },
      { id: "expansion-lead", title: "مسؤول التوسع والتدريب", status: "وحدة قيد التنظيم" },
      { id: "expansion-member", title: "عضو فريق التوسع والتدريب", status: "وحدة قيد التنظيم" },
      { id: "technology-lead", title: "المسؤول التقني", status: "وحدة مقترحة", keywords: "التقنية والمنصة" },
      { id: "technology-member", title: "عضو الفريق التقني", status: "وحدة مقترحة", keywords: "التقنية والمنصة" },
      { id: "programs-lead", title: "مسؤول البرامج والبحوث", status: "وحدة مستقبلية", keywords: "البرامج والبحوث" },
      { id: "programs-member", title: "عضو الفريق العلمي والبحثي", status: "وحدة مستقبلية", keywords: "البرامج والبحوث" },
    ],
  },
  {
    title: "المساندة الإدارية والمراجعة",
    roles: [
      { id: "finance", title: "المساندة المالية" },
      { id: "records", title: "التوثيق والأرشفة المركزية" },
      { id: "review-member", title: "عضو المتابعة والمراجعة والتظلمات", status: "قيد الاعتماد" },
    ],
  },
  {
    title: "المشاركة والتكليف",
    roles: [
      { id: "volunteer", title: "متطوع عام خارج اللجان" },
      { id: "event-lead", title: "قائد فعالية" },
      { id: "event-member", title: "عضو فريق فعالية" },
      { id: "acting-role", title: "مكلّف بالإنابة", detailLabel: "المنصب المكلّف بالإنابة عنه", keywords: "نائب بديل" },
    ],
  },
];

const roles = VOLUNTEER_ROLE_GROUPS.flatMap((group) => group.roles);
export const volunteerRolesById = new Map(roles.map((role) => [role.id, role]));

export function roleSearchText(value) {
  return normalizeSearch(value).replace(/مس[ؤئو]و?ل/g, "مسول").replace(/\s+/g, " ");
}

const rolesByTitle = new Map(roles.map((role) => [roleSearchText(role.title), role]));
export const roleForTitle = (title) => rolesByTitle.get(roleSearchText(title));

export function roleForVolunteer(person) {
  return volunteerRolesById.get(person.roleId);
}

export function volunteerRoleLabel(person) {
  const title = roleForVolunteer(person)?.title || person.responsibility;
  return [...new Set([title, person.team].filter(Boolean))].join(" — ");
}
