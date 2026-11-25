// The twenty technical role classifications of the Sahwa platform.
// These are platform categories, not regulation text. Each one points to the
// verbatim entries of Chapter 2 (docs/guide/structure.md, parsed by
// src/lib/structureParser.ts) through `guide`, and every reporting or
// coordination link quotes the exact phrase it was read from (`phrase`), so a
// test can prove that no relation was invented.

export const SECTORS = { youth: "الشباب", women: "الطالبات" };
export const CENTRAL = "*central*";
export const sectorForGender = (gender) =>
  gender === "شاب" ? "youth" : gender === "بنت" ? "women" : null;

export const ROLE_CATEGORIES = [
  { id: "leadership", title: "القيادة العامة" },
  { id: "universities", title: "إدارة الجامعات" },
  { id: "activities", title: "الأنشطة" },
  { id: "relations", title: "العلاقات العامة" },
  { id: "media", title: "الإعلام" },
  { id: "support", title: "المساندة الإدارية" },
  { id: "review", title: "المتابعة والمراجعة والتظلمات" },
  { id: "volunteering", title: "التطوع العام" },
];

// sector: "youth" | "women" fixes the sector, "required" takes it from the
// person, "none" means the role is shared by both sectors.
// scope: "university" needs a university on the assignment, "central" never has one.
export const PLATFORM_ROLES = [
  { id: "sahwa-lead", number: 1, title: "مسؤول صحوة", category: "leadership", level: "lead", scope: "central", sector: "none", team: "leadership", guide: { any: ["sahwa-lead"] } },
  { id: "women-sector-lead", number: 2, title: "مسؤولة قطاع الطالبات", category: "leadership", level: "lead", scope: "central", sector: "women", team: "women-sector", guide: { any: ["women-sector-lead"] } },
  { id: "university-youth-lead", number: 3, title: "مسؤول الشباب داخل الجامعة", category: "universities", level: "lead", scope: "university", sector: "youth", team: "university-team", guide: { any: ["university-youth-coordinator"] } },
  { id: "university-women-lead", number: 4, title: "مسؤولة الطالبات داخل الجامعة", category: "universities", level: "lead", scope: "university", sector: "women", team: "university-team", guide: { any: ["university-women-coordinator"] } },
  { id: "internal-activities-member", number: 5, title: "عضو الأنشطة الداخلية", titleWomen: "عضوة الأنشطة الداخلية", category: "activities", level: "member", scope: "university", sector: "required", team: "internal-activities", guide: { youth: ["university-youth-activities-member"], women: ["university-women-activities-member"] } },
  { id: "internal-activities-lead", number: 6, title: "مسؤول الأنشطة الداخلية", titleWomen: "مسؤولة الأنشطة الداخلية", category: "activities", level: "lead", scope: "university", sector: "required", team: "internal-activities", guide: { youth: ["internal-youth-activities"], women: ["internal-women-activities"] } },
  { id: "central-activities-member", number: 7, title: "عضو الأنشطة المركزية", titleWomen: "عضوة الأنشطة المركزية", category: "activities", level: "member", scope: "central", sector: "required", team: "central-activities", guide: { youth: ["central-youth-member"], women: ["central-women-member"] } },
  { id: "central-activities-lead", number: 8, title: "مسؤول الأنشطة المركزية", titleWomen: "مسؤولة الأنشطة المركزية", category: "activities", level: "lead", scope: "central", sector: "required", team: "central-activities", guide: { youth: ["central-youth-lead"], women: ["central-women-lead"] } },
  { id: "university-relations-member", number: 9, title: "عضو العلاقات الجامعية", category: "relations", level: "member", scope: "university", sector: "none", team: "university-relations", guide: { any: ["university-relations-member"] } },
  { id: "university-relations-lead", number: 10, title: "مسؤول العلاقات الجامعية", category: "relations", level: "lead", scope: "university", sector: "none", team: "university-relations", guide: { any: ["university-relations-lead"] } },
  { id: "central-relations-member", number: 11, title: "عضو العلاقات العامة المركزية", category: "relations", level: "member", scope: "central", sector: "none", team: "central-relations", guide: { any: ["central-relations-member"] } },
  { id: "central-relations-lead", number: 12, title: "مسؤول العلاقات العامة المركزية", category: "relations", level: "lead", scope: "central", sector: "none", team: "central-relations", guide: { any: ["central-relations-lead"] } },
  // The platform keeps one media team. The field-media text stays verbatim in
  // the guide and is linked to this card only after the link is approved.
  { id: "media-member", number: 13, title: "عضو الإعلام", category: "media", level: "member", scope: "central", sector: "none", team: "media", guide: { any: ["central-media-member"] }, pendingGuide: ["field-media-member"] },
  { id: "media-lead", number: 14, title: "مسؤول الإعلام المركزي", category: "media", level: "lead", scope: "central", sector: "none", team: "media", guide: { any: ["central-media-lead"] } },
  { id: "finance-lead", number: 15, title: "مسؤول المالية", category: "support", level: "lead", scope: "central", sector: "none", team: "finance", deferred: true, guide: { any: ["finance-lead"] } },
  { id: "archive-lead", number: 16, title: "مسؤول التوثيق والأرشفة المركزية", category: "support", level: "lead", scope: "central", sector: "none", team: "archive", deferred: true, guide: { any: ["records-lead"] } },
  { id: "review-member", number: 17, title: "عضو مجلس المتابعة والمراجعة والتظلمات", category: "review", level: "member", scope: "central", sector: "none", team: "review", deferred: true, guide: { any: ["review-member"] } },
  { id: "review-lead", number: 18, title: "مسؤول مجلس المتابعة والمراجعة والتظلمات", category: "review", level: "lead", scope: "central", sector: "none", team: "review", deferred: true, guide: { any: ["review-lead"] } },
  { id: "university-volunteer", number: 19, title: "متطوع عام داخل الجامعة", titleWomen: "متطوعة عامة داخل الجامعة", category: "volunteering", level: "volunteer", scope: "university", sector: "required", team: "university-team", guide: { any: ["university-volunteers"] } },
  // No dedicated text exists for a central volunteer. The general volunteer
  // definition is linked until a dedicated link is approved.
  { id: "central-volunteer", number: 20, title: "متطوع عام مركزي", titleWomen: "متطوعة عامة مركزية", category: "volunteering", level: "volunteer", scope: "central", sector: "required", team: "central-volunteers", guide: { any: ["membership-levels"] }, guideNeedsApproval: true },
];

export const rolesById = new Map(PLATFORM_ROLES.map((role) => [role.id, role]));
export const roleById = (id) => rolesById.get(id);

export function roleTitle(roleId, sector) {
  const role = roleById(roleId);
  if (!role) return roleId;
  return sector === "women" && role.titleWomen ? role.titleWomen : role.title;
}

export function guideEntriesFor(roleId, sector) {
  const role = roleById(roleId);
  if (!role) return [];
  return role.guide.any || role.guide[sector] || [];
}

// Teams split by sector are separate teams per sector.
const SECTOR_TEAMS = new Set(["internal-activities", "central-activities", "university-team", "central-volunteers"]);
export function teamKeys(assignment) {
  const role = roleById(assignment.roleId);
  if (!role) return [];
  const key = (team) =>
    [team, role.scope === "university" ? assignment.university || "" : "", SECTOR_TEAMS.has(team) ? assignment.sector || "" : ""].join("|");
  const keys = [key(role.team)];
  // Chapter 2.1 places the internal activities committee inside the
  // university youth or women team.
  if (role.team === "internal-activities") keys.push(key("university-team"));
  return keys;
}

export const TEAM_TITLES = {
  leadership: "القيادة العامة",
  "women-sector": "قطاع الطالبات",
  "university-team": "فريق الجامعة",
  "internal-activities": "لجنة الأنشطة الداخلية",
  "central-activities": "الأنشطة المركزية",
  "university-relations": "العلاقات الجامعية",
  "central-relations": "العلاقات العامة المركزية",
  media: "الإعلام",
  finance: "المالية",
  archive: "التوثيق والأرشفة",
  review: "مجلس المتابعة والمراجعة والتظلمات",
  "central-volunteers": "التطوع العام المركزي",
};

// Who may assign which role (anti-escalation). Only a global administrator
// may assign roles outside this list. Assigning still needs the
// `roles.assign` permission over the target scope.
export const ASSIGNABLE_BY = {
  "women-sector-lead": ["university-women-lead", "internal-activities-lead", "internal-activities-member", "central-activities-lead", "central-activities-member", "university-volunteer", "central-volunteer"],
  "university-youth-lead": ["internal-activities-lead", "internal-activities-member", "university-volunteer"],
  "university-women-lead": ["internal-activities-lead", "internal-activities-member", "university-volunteer"],
  "internal-activities-lead": ["internal-activities-member"],
  "central-activities-lead": ["central-activities-member", "central-volunteer"],
  "university-relations-lead": ["university-relations-member"],
  "central-relations-lead": ["central-relations-member"],
  "media-lead": ["media-member"],
};

// Reporting (`reports`), coordination (`coordinates`) and team membership
// (`team`) links quoted from Chapter 2. `phrase` must appear verbatim in the
// role's own guide entries, or in `sourceEntry` when given.
// university: "same" resolves in the viewer's university; "any" lists all.
export function roleLinks(roleId, sector) {
  const women = sector === "women";
  switch (roleId) {
    case "sahwa-lead":
      return [{ relation: "coordinates", label: "يتابع بالتنسيق", phrase: "قطاع الطالبات عبر مسؤولة القطاع", target: "women-sector-lead" }];
    case "women-sector-lead":
      return [
        { relation: "reports", label: "تتبع إداريًا", phrase: "مسؤول صحوة في الشؤون الإدارية العامة", target: "sahwa-lead" },
        { relation: "coordinates", label: "تنسق مع", phrase: "مسؤول صحوة", target: "sahwa-lead" },
      ];
    case "university-youth-lead":
      return [
        { relation: "reports", label: "يتبع إداريًا", phrase: "مسؤول صحوة، عبر مسؤول متابعة جامعات الشباب عند تفعيل المنصب", target: "sahwa-lead" },
        { relation: "coordinates", label: "يتواصل مع", phrase: "مسؤولة الطالبات بالجامعة", target: "university-women-lead", university: "same" },
      ];
    case "university-women-lead":
      return [
        { relation: "reports", label: "تتبع إداريًا", phrase: "مسؤولة قطاع الطالبات", target: "women-sector-lead" },
        { relation: "coordinates", label: "تتواصل مع", phrase: "مسؤول الشباب بالجامعة", target: "university-youth-lead", university: "same" },
      ];
    case "internal-activities-lead":
      return women
        ? [
            { relation: "reports", label: "تتبع إداريًا", phrase: "مسؤولة الطالبات داخل الجامعة", target: "university-women-lead", university: "same" },
            { relation: "coordinates", label: "تتواصل مع", phrase: "أنشطة الطالبات المركزية", target: "central-activities-lead", sector: "women" },
            { relation: "coordinates", label: "تتواصل مع", phrase: "الإعلام", target: "media-lead" },
            { relation: "coordinates", label: "تتواصل مع", phrase: "العلاقات الجامعية", target: "university-relations-lead", university: "same" },
          ]
        : [
            { relation: "reports", label: "يتبع إداريًا", phrase: "مسؤول الشباب داخل الجامعة", target: "university-youth-lead", university: "same" },
            { relation: "coordinates", label: "يتواصل مع", phrase: "الأنشطة المركزية", target: "central-activities-lead", sector: "youth" },
            { relation: "coordinates", label: "يتواصل مع", phrase: "الإعلام", target: "media-lead" },
            { relation: "coordinates", label: "يتواصل مع", phrase: "العلاقات الجامعية", target: "university-relations-lead", university: "same" },
          ];
    case "internal-activities-member":
      return women
        ? [{ relation: "reports", label: "تتبع", phrase: "مسؤولة الأنشطة الداخلية للطالبات", target: "internal-activities-lead", sector: "women", university: "same" }]
        : [{ relation: "reports", label: "يتبع", phrase: "مسؤول الأنشطة الداخلية للشباب", target: "internal-activities-lead", sector: "youth", university: "same" }];
    case "central-activities-lead":
      return women
        ? [
            { relation: "reports", label: "تتبع إداريًا", phrase: "مسؤولة قطاع الطالبات", target: "women-sector-lead" },
            { relation: "coordinates", label: "تتواصل مع", phrase: "مسؤول أنشطة الشباب المركزية", target: "central-activities-lead", sector: "youth" },
            { relation: "coordinates", label: "تتواصل مع", phrase: "الإعلام", target: "media-lead" },
          ]
        : [
            { relation: "reports", label: "يتبع إداريًا", phrase: "مسؤول صحوة", target: "sahwa-lead" },
            { relation: "coordinates", label: "يتواصل مع", phrase: "مسؤولة أنشطة الطالبات المركزية", target: "central-activities-lead", sector: "women" },
            { relation: "coordinates", label: "يتواصل مع", phrase: "الإعلام", target: "media-lead" },
          ];
    case "central-activities-member":
      return women
        ? [{ relation: "reports", label: "تتبع", phrase: "مسؤولة أنشطة الطالبات المركزية", target: "central-activities-lead", sector: "women" }]
        : [{ relation: "reports", label: "يتبع", phrase: "مسؤول أنشطة الشباب المركزية", target: "central-activities-lead", sector: "youth" }];
    case "university-relations-member":
      return [
        { relation: "team", label: "ضمن الفريق", phrase: "مسؤول العلاقات الجامعية", target: "university-relations-lead", university: "same" },
        { relation: "coordinates", label: "تنسق تخصصيًا مع", phrase: "العلاقات العامة المركزية", target: "central-relations-lead" },
      ];
    case "university-relations-lead":
      return [{ relation: "coordinates", label: "تنسق تخصصيًا مع", phrase: "العلاقات العامة المركزية", target: "central-relations-lead" }];
    case "central-relations-member":
      return [{ relation: "reports", label: "يتبع", phrase: "مسؤول العلاقات العامة المركزية", target: "central-relations-lead" }];
    case "central-relations-lead":
      return [
        { relation: "reports", label: "يتبع إداريًا", phrase: "مسؤول صحوة", target: "sahwa-lead" },
        { relation: "coordinates", label: "ينسق تخصصيًا مع", phrase: "مسؤولي العلاقات الجامعية", target: "university-relations-lead", university: "any" },
      ];
    case "media-member":
      return [{ relation: "reports", label: "يتبع", phrase: "مسؤول الإعلام المركزي", target: "media-lead" }];
    case "media-lead":
    case "finance-lead":
    case "archive-lead":
      return [{ relation: "reports", label: "يتبع إداريًا", phrase: "مسؤول صحوة", target: "sahwa-lead" }];
    case "review-lead":
      return [{ relation: "reports", label: "يرتبط إداريًا بـ", phrase: "مسؤول صحوة", target: "sahwa-lead" }];
    case "review-member":
      return [{ relation: "reports", label: "يتبع تنظيميًا", phrase: "مسؤول المجلس في توزيع الأعمال", target: "review-lead" }];
    case "university-volunteer":
      return women
        ? [{ relation: "team", label: "ضمن فريق الطالبات داخل الجامعة", phrase: "مسؤولة الطالبات داخل الجامعة", target: "university-women-lead", university: "same", sourceEntry: "university-women" }]
        : [{ relation: "team", label: "ضمن فريق الشباب داخل الجامعة", phrase: "مسؤول الشباب داخل الجامعة", target: "university-youth-lead", university: "same", sourceEntry: "university-youth" }];
    default:
      return [];
  }
}

// Legacy volunteer role ids (shared/volunteer-roles.js) with a clear match.
// The sector of "required" roles comes from the alias when the alias names it,
// otherwise from the person's recorded gender. Anything else goes to review.
export const LEGACY_ROLE_MAP = {
  "sahwa-lead": { roleId: "sahwa-lead" },
  "women-sector-lead": { roleId: "women-sector-lead" },
  "central-youth-lead": { roleId: "central-activities-lead", sector: "youth" },
  "central-women-lead": { roleId: "central-activities-lead", sector: "women" },
  "central-media-lead": { roleId: "media-lead" },
  "central-relations-lead": { roleId: "central-relations-lead" },
  "university-youth-coordinator": { roleId: "university-youth-lead" },
  "university-women-coordinator": { roleId: "university-women-lead" },
  "internal-activities-lead": { roleId: "internal-activities-lead" },
  "internal-youth-activities": { roleId: "internal-activities-lead", sector: "youth" },
  "internal-women-activities": { roleId: "internal-activities-lead", sector: "women" },
  "university-activities-member": { roleId: "internal-activities-member" },
  "university-youth-activities-member": { roleId: "internal-activities-member", sector: "youth" },
  "university-women-activities-member": { roleId: "internal-activities-member", sector: "women" },
  "university-relations-lead": { roleId: "university-relations-lead" },
  "university-relations-member": { roleId: "university-relations-member" },
  "central-activities-member": { roleId: "central-activities-member" },
  "central-youth-member": { roleId: "central-activities-member", sector: "youth" },
  "central-women-member": { roleId: "central-activities-member", sector: "women" },
  "central-media-member": { roleId: "media-member" },
  "central-relations-member": { roleId: "central-relations-member" },
  "review-member": { roleId: "review-member" },
};

// Suggestions shown to the administrator for confirmation; never applied
// automatically.
export const LEGACY_SUGGESTIONS = {
  "sahwa-member": { roleId: "university-volunteer", reason: "«عضو صحوة» عام؛ قد يكون متطوعًا عامًا داخل الجامعة أو عضوًا في لجنة لم تُسجل." },
  finance: { roleId: "finance-lead", reason: "«المساندة المالية» لا تحدد إن كان الشخص مسؤول المالية أو عضوًا في الفريق المالي، والعضوية غير مفعلة في هذا الإصدار." },
  records: { roleId: "archive-lead", reason: "«التوثيق والأرشفة» لا تحدد إن كان الشخص المسؤول أو عضوًا، والعضوية غير مفعلة في هذا الإصدار." },
};
