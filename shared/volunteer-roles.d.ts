export interface VolunteerRoleOption {
  id: string;
  title: string;
  detailLabel?: string;
  status?: string;
  keywords?: string;
}
export const VOLUNTEER_ROLE_GROUPS: { title: string; roles: VolunteerRoleOption[] }[];
export const volunteerRolesById: ReadonlyMap<string, VolunteerRoleOption>;
export function roleSearchText(value: string): string;
export function roleForTitle(title: string): VolunteerRoleOption | undefined;
interface VolunteerAssignment {
  roleId?: string | null;
  team: string;
  responsibility: string;
}
export function roleForVolunteer(person: VolunteerAssignment): VolunteerRoleOption | undefined;
export function volunteerRoleLabel(person: VolunteerAssignment): string;
