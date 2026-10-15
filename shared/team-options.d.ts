export const UNIVERSITIES: string[];
export const GENDERS: string[];
export const STUDY_STATUSES: string[];
export const WORK_AREAS: string[];
export const WORK_SCOPES: string[];
export const ROLES: string[];
export const PERSON_STATUSES: string[];
export function normalizeSearch(value: unknown): string;
export function filterVolunteers<T extends { fullName: string; university: string; major: string; skills: string; phone: string; workArea: string; role: string; studyStatus: string; status: string; gender: string }>(people: T[], filters: { query: string; university: string; workArea: string; role: string; studyStatus: string; status: string; gender: string }): T[];
