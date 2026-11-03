export const UNIVERSITIES: string[];
export const GENDERS: string[];
export const VOLUNTEER_AREAS: string[];
export const RESPONSIBILITIES: string[];
export const PERSON_STATUSES: string[];
export function normalizeSearch(value: unknown): string;
export function filterVolunteers<
  T extends {
    fullName: string;
    university: string;
    major: string;
    team: string;
    phone: string;
    status: string;
  },
>(
  people: T[],
  filters: { query: string; university: string; status: string },
): T[];

export function todayInIstanbul(now?: Date): string;
export function ageFromBirthDate(
  value: string | null | undefined,
  today?: string,
): number | null;
