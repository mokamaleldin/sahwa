import type { RoleOptionMeta } from "../../lib/team";
const groups = [
  { title: "العام", ids: ["university-volunteer", "central-volunteer"] },
  { title: "فرق الجامعات", ids: ["university-youth-lead", "university-women-lead", "internal-activities-lead", "university-relations-lead", "university-relations-member", "internal-activities-member"] },
  { title: "الفرق والوحدات المركزية", ids: ["central-activities-member", "central-activities-lead", "central-relations-member", "central-relations-lead", "media-member", "media-lead", "finance-lead", "archive-lead", "review-member", "review-lead"] },
  { title: "الإدارة المركزية", ids: ["sahwa-lead", "women-sector-lead"] },
];
export default function OrganizationalRoleOptions({ roles, women, genderKnown = true }: {roles:RoleOptionMeta[];women:boolean;genderKnown?:boolean}) {
  const allowed = roles.filter(r => !genderKnown || (!(r.sector === "women" && !women) && !(r.sector === "youth" && women)));
  const all = [...groups, {title:"أدوار أخرى",ids:allowed.filter(r=>!groups.some(g=>g.ids.includes(r.id))).map(r=>r.id)}];
  return <>{all.map(g=>{
    const options = g.ids.flatMap(id=>allowed.filter(r=>r.id===id));
    return options.length > 0 && <optgroup key={g.title} label={g.title}>{options.map(r=><option key={r.id} value={r.id}>{r.id==="university-volunteer" ? (women?"متطوعة عامة":"متطوع عام") : women && r.titleWomen ? r.titleWomen : r.title}</option>)}</optgroup>;
  })}</>;
}
