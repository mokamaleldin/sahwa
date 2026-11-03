export interface VolunteerInput {
  fullName: string;
  university: string;
  major: string;
  studyYear: string;
  birthDate: string;
  gender: string;
  team: string;
  responsibility: string;
  status: string;
  phone: string;
}
export interface Volunteer extends VolunteerInput {
  id: string;
  revision: number;
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
