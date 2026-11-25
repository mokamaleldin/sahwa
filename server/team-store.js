import { randomUUID } from "node:crypto";
import { getSql } from "./db.js";
import { TeamError } from "./team-data.js";
const VOLUNTEER_FIELDS = `id, full_name AS "fullName", university, major, study_year AS "studyYear", COALESCE(birth_date::text,'') AS "birthDate", gender, team, responsibility, role_id AS "roleId", phone, status, revision, membership_level AS "membershipLevel"`;
const EVENT_FIELDS = `e.id, e.title, COALESCE(e.event_date::text,'') AS "eventDate", e.responsible_id AS "responsibleId", COALESCE(v.full_name,e.responsible,'') AS responsible, e.attendance, e.notes, e.revision, e.university, e.sector, e.audience, e.is_test AS "isTest"`;
const conflict = () =>
  new TeamError(
    "تم تعديل السجل من جهاز آخر، أو لم يعد موجودًا. حدّث القائمة وافتحه من جديد.",
    409,
    "CONFLICT",
  );
const values = (p) => [
  p.fullName,
  p.university,
  p.birthDate || null,
  p.gender,
  p.status,
  p.team,
  p.responsibility,
  p.phone,
  p.major,
  p.studyYear,
  p.roleId ?? null,
];
export function createTeamStore(getClient = getSql) {
  const query = (statement, params = []) =>
    getClient().query(statement, params);
  async function eventById(id) {
    return (
      await query(
        `SELECT ${EVENT_FIELDS} FROM sahwa_events e LEFT JOIN sahwa_volunteers v ON v.id=e.responsible_id WHERE e.id=$1`,
        [id],
      )
    )[0];
  }
  return {
    async listVolunteers() {
      return query(
        `SELECT ${VOLUNTEER_FIELDS} FROM sahwa_volunteers WHERE archived_at IS NULL ORDER BY full_name,id`,
      );
    },
    async listResponsibleVolunteers(isTest = false) {
      return query(
        `SELECT id, full_name AS "fullName", university, status, gender FROM sahwa_volunteers WHERE is_test=$1 AND archived_at IS NULL ORDER BY full_name,id`,
        [isTest],
      );
    },
    async createVolunteer(person, { isTest = false } = {}) {
      return (
        await query(
          `INSERT INTO sahwa_volunteers(id,full_name,university,birth_date,gender,status,team,responsibility,phone,major,study_year,role_id,is_test) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING ${VOLUNTEER_FIELDS}`,
          [randomUUID(), ...values(person), isTest],
        )
      )[0];
    },
    async updateVolunteer(id, revision, person) {
      const rows = await query(
        `UPDATE sahwa_volunteers SET full_name=$3,university=$4,birth_date=$5,gender=$6,status=$7,team=$8,responsibility=$9,phone=$10,major=$11,study_year=$12,
          role_id=CASE
            WHEN $14::boolean THEN $13::varchar
            WHEN team=$8::varchar AND responsibility=$9::varchar THEN role_id
            ELSE NULL END,
          revision=revision+1,updated_at=now() WHERE id=$1 AND revision=$2 RETURNING ${VOLUNTEER_FIELDS}`,
        [id, revision, ...values(person), Object.hasOwn(person, "roleId")],
      );
      if (!rows.length) throw conflict();
      return rows[0];
    },
    async deleteVolunteer(id, revision) {
      const rows = await query(
        "DELETE FROM sahwa_volunteers WHERE id=$1 AND revision=$2 RETURNING id",
        [id, revision],
      );
      if (!rows.length) throw conflict();
    },
    async consumeLoginLimit(keys) {
      const sql = getClient();
      const results = await sql.transaction([
        sql.query("DELETE FROM sahwa_login_limits WHERE expires_at <= now()"),
        ...keys.map((key) =>
          sql.query(
            `INSERT INTO sahwa_login_limits(key,attempts,expires_at) VALUES ($1,1,now()+interval '15 minutes')
          ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN sahwa_login_limits.expires_at<=now() THEN 1 ELSE sahwa_login_limits.attempts+1 END,
          expires_at=CASE WHEN sahwa_login_limits.expires_at<=now() THEN now()+interval '15 minutes' ELSE sahwa_login_limits.expires_at END
          RETURNING attempts`,
            [key],
          ),
        ),
      ]);
      return results[1][0].attempts <= 10 && results[2][0].attempts <= 50;
    },
    async listEvents(isTest = false) {
      return query(
        `SELECT ${EVENT_FIELDS} FROM sahwa_events e LEFT JOIN sahwa_volunteers v ON v.id=e.responsible_id WHERE e.is_test=$1 ORDER BY e.event_date DESC NULLS LAST,e.created_at DESC`,
        [isTest],
      );
    },
    eventById,
    async createEvent(event, scope = {}) {
      const id = randomUUID();
      await query(
        `INSERT INTO sahwa_events(id,title,event_date,responsible_id,responsible,attendance,notes,university,sector,audience,is_test) VALUES ($1,$2,$3,$4,'',$5,$6,$7,$8,$9,$10)`,
        [
          id,
          event.title,
          event.eventDate || null,
          event.responsibleId,
          event.attendance,
          event.notes,
          scope.university ?? null,
          scope.sector ?? null,
          scope.audience ?? "private",
          Boolean(scope.isTest),
        ],
      );
      return eventById(id);
    },
    async setEventScope(id, scope) {
      await query("UPDATE sahwa_events SET university=$2, sector=$3, audience=$4 WHERE id=$1", [id, scope.university ?? null, scope.sector ?? null, scope.audience ?? "private"]);
      return eventById(id);
    },
    async updateEvent(id, revision, event) {
      const rows = await query(
        `UPDATE sahwa_events SET title=$3,event_date=$4,responsible_id=$5,responsible=CASE WHEN $8::boolean AND responsible_id IS NULL THEN responsible ELSE '' END,attendance=$6,notes=$7,revision=revision+1,updated_at=now() WHERE id=$1 AND revision=$2 RETURNING id`,
        [
          id,
          revision,
          event.title,
          event.eventDate || null,
          event.responsibleId,
          event.attendance,
          event.notes,
          event.preserveLegacyResponsible,
        ],
      );
      if (!rows.length) throw conflict();
      return eventById(id);
    },
    async deleteEvent(id, revision) {
      const rows = await query(
        "DELETE FROM sahwa_events WHERE id=$1 AND revision=$2 RETURNING id",
        [id, revision],
      );
      if (!rows.length) throw conflict();
    },
  };
}
export const teamStore = createTeamStore();
