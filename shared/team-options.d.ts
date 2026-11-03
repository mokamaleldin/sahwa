export const UNIVERSITIES: string[];
export const GENDERS: string[];
export const PERSON_STATUSES: string[];
export function normalizeSearch(value: unknown): string;
export function filterVolunteers<
  T extends {
    fullName: string;
    university: string;
    major: string;
    team: string;
    email: string;
    status: string;
  },
>(
  people: T[],
  filters: { query: string; university: string; status: string },
): T[];
