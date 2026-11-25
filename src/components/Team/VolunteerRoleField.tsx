import TeamComboField, { type ComboGroup } from "./TeamComboField";
import {
  VOLUNTEER_ROLE_GROUPS,
  roleForTitle,
  roleSearchText,
} from "../../../shared/volunteer-roles.js";

const ROLE_GROUPS: ComboGroup[] = VOLUNTEER_ROLE_GROUPS.map((group) => ({
  title: group.title,
  options: group.roles,
}));

export default function VolunteerRoleField({
  value,
  onChange,
}: {
  value: string;
  onChange: (title: string) => void;
}) {
  return (
    <TeamComboField
      label="الدور في صحوة"
      name="roleTitle"
      optional
      fullWidth
      value={value}
      onChange={onChange}
      groups={ROLE_GROUPS}
      normalize={roleSearchText}
      exactMatch={roleForTitle}
      placeholder="اختر دورًا أو اكتب دورًا آخر"
      listLabel="الأدوار في صحوة"
      openLabel="عرض كل الأدوار"
      closeLabel="إغلاق قائمة الأدوار"
    />
  );
}
