import type { RoleOptionMeta } from "../../lib/team";

const ROLE_GROUPS = [
  {
    title: "العام",
    ids: ["university-volunteer", "central-volunteer"],
  },
  {
    title: "فريق الجامعة",
    ids: [
      "university-youth-lead",
      "university-women-lead",
      "internal-activities-lead",
      "internal-activities-member",
      "university-relations-lead",
      "university-relations-member",
    ],
  },
  {
    title: "الفرق والوحدات المركزية",
    ids: [
      "central-activities-lead",
      "central-activities-member",
      "central-relations-lead",
      "central-relations-member",
      "media-lead",
      "media-member",
      "finance-lead",
      "archive-lead",
      "review-lead",
      "review-member",
    ],
  },
  {
    title: "الإدارة المركزية",
    ids: ["sahwa-lead", "women-sector-lead"],
  },
];

export default function OrganizationalRoleOptions({
  roles,
  women,
  genderKnown = true,
}: {
  roles: RoleOptionMeta[];
  women: boolean;
  genderKnown?: boolean;
}) {
  const allowed = roles.filter(
    (r) => !genderKnown || (!(r.sector === "women" && !women) && !(r.sector === "youth" && women)),
  );
  const all = [
    ...ROLE_GROUPS,
    {
      title: "أدوار أخرى",
      ids: allowed
        .filter((r) => !ROLE_GROUPS.some((g) => g.ids.includes(r.id)))
        .map((r) => r.id),
    },
  ];
  return (
    <>
      {all.map((g) => {
        const options = g.ids.flatMap((id) => allowed.filter((r) => r.id === id));
        return (
          options.length > 0 && (
            <optgroup key={g.title} label={g.title}>
              {options.map((r) => (
                <option key={r.id} value={r.id}>
                  {(women && r.titleWomen ? r.titleWomen : r.title) + (r.deferred ? " (مؤجل)" : "")}
                </option>
              ))}
            </optgroup>
          )
        );
      })}
    </>
  );
}
