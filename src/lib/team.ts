export interface VolunteerInput {
  fullName: string;
  university: string;
  major: string;
  studyYear: string;
  birthDate: string;
  gender: string;
  team: string;
  responsibility: string;
  roleTitle?: string;
  roleDetail?: string;
  status: string;
  phone: string;
}
export interface VolunteerAssignment {
  id: string;
  roleId: string;
  title: string;
  scope: string;
  university: string | null;
  sector: string | null;
  deferred: boolean;
}
export interface VolunteerAccount {
  status: "none" | "active" | "suspended";
  username?: string;
  email?: string | null;
  pending?: boolean;
  lastLoginAt?: string | null;
  lastResetAt?: string | null;
}
export interface VolunteerAllowed {
  edit: boolean;
  archive: boolean;
  assign: boolean;
  createAccount: boolean;
  resetAccount: boolean;
  suspendAccount: boolean;
  level: boolean;
}
export interface RoleOptionMeta {
  id: string;
  title: string;
  titleWomen: string | null;
  scope: string;
  sector: string;
  deferred: boolean;
}
export interface VolunteerMeta {
  canCreate: boolean;
  assignableRoles: RoleOptionMeta[];
  globalAdmin: boolean;
}
export interface Volunteer extends VolunteerInput {
  roleId?: string | null;
  id: string;
  revision: number;
  membershipLevel?: string;
  assignments: VolunteerAssignment[];
  account?: VolunteerAccount | null;
  allowed?: VolunteerAllowed;
}
export const EMPTY_PERSON: VolunteerInput = {
  fullName: "",
  university: "",
  major: "",
  studyYear: "",
  birthDate: "",
  gender: "",
  team: "",
  responsibility: "",
  status: "نشط",
  phone: "",
};
export interface SahwaEventInput {
  title: string;
  eventDate: string;
  responsibleId: string | null;
  preserveLegacyResponsible?: boolean;
  attendance: number | null;
  notes: string;
}
export interface ResponsibleVolunteer {
  id: string;
  fullName: string;
  university: string;
  status: string;
}
export interface SahwaEvent extends SahwaEventInput {
  responsible: string;
  id: string;
  revision: number;
  university?: string | null;
  sector?: string | null;
  audience?: "private" | "internal";
  canEdit?: boolean;
  canDelete?: boolean;
}
export interface EventScope {
  university: string | null;
  sector: string | null;
}
export interface EventExtra {
  scope?: EventScope;
  audience: "private" | "internal";
}
export async function teamRequest<T>(
  options: RequestInit = {},
  path = "/api/team",
): Promise<T> {
  const response = await fetch(path, {
    ...options,
    cache: "no-store",
    credentials: "same-origin",
  });
  if (response.status === 401) {
    window.dispatchEvent(new Event("sahwa:unauthorized"));
    throw new Error("انتهت الجلسة. سجّل الدخول مجددًا.");
  }
  const result = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(result?.error || "تعذر حفظ التعديل. حاول مجددًا.");
  if (!result) throw new Error("تعذر قراءة البيانات. حاول مجددًا.");
  return result as T;
}
export const displayDate = (value: string) =>
  new Date(`${value}T12:00:00Z`).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
