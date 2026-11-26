import { randomUUID } from "node:crypto";
import { getSql } from "./db.js";
import { TeamError } from "./team-data.js";
const VOLUNTEER_FIELDS = `id, full_name AS "fullName", university, major, study_year AS "studyYear", COALESCE(birth_date::text,'') AS "birthDate", gender, team, responsibility, role_id AS "roleId", phone, status, revision, membership_level AS "membershipLevel"`;
const EVENT_FIELDS = `e.id, e.title, COALESCE(e.event_date::text,'') AS "eventDate", e.responsible_id AS "responsibleId", COALESCE(v.full_name,e.responsible,'') AS responsible, e.attendance, e.notes, e.revision, e.university, e.sector, e.team, e.created_by_volunteer AS "creatorId", e.progress, e.audience, e.is_test AS "isTest"`;
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
    async createVolunteer(person, { isTest = false, assignment = null } = {}) {
      const id = randomUUID();
      const sql = getClient();
      const insert = sql.query(
        `INSERT INTO sahwa_volunteers(id,full_name,university,birth_date,gender,status,team,responsibility,phone,major,study_year,role_id,is_test) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING ${VOLUNTEER_FIELDS}`,
        [id, ...values(person), isTest],
      );
      if (!assignment) return (await insert)[0];
      const assign = sql.query(
        `INSERT INTO sahwa_role_assignments(id,volunteer_id,role_id,university,sector,assigned_by,source) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [randomUUID(), id, assignment.roleId, assignment.university, assignment.sector, assignment.assignedBy, assignment.source || "manual"],
      );
      return (await sql.transaction([insert, assign]))[0][0];
    },
    async updateVolunteer(id, revision, person, legacyChange) {
      const update = `UPDATE sahwa_volunteers SET full_name=$3,university=$4,birth_date=$5,gender=$6,status=$7,team=$8,responsibility=$9,phone=$10,major=$11,study_year=$12,
          role_id=CASE
            WHEN $14::boolean THEN $13::varchar
            WHEN team=$8::varchar AND responsibility=$9::varchar THEN role_id
            ELSE NULL END,
          revision=revision+1,updated_at=now() WHERE id=$1 AND revision=$2 RETURNING ${VOLUNTEER_FIELDS}`;
      const params = [id, revision, ...values(person), Object.hasOwn(person, "roleId")];
      let statement = update;
      if (legacyChange) {
        const { oldId, next, by } = legacyChange;
        params.push(oldId, next?.roleId || null, next?.university || null, next?.sector || null, by, randomUUID());
        statement = `WITH saved AS (${update}), ended AS (
          UPDATE sahwa_role_assignments SET status='ended',ends_on=CURRENT_DATE,ended_at=now(),ended_by=$19
          WHERE id=$15::uuid AND volunteer_id IN (SELECT id FROM saved) AND source='legacy' AND status='active' RETURNING id
        ), added AS (
          INSERT INTO sahwa_role_assignments(id,volunteer_id,role_id,university,sector,assigned_by,source)
          SELECT $20,saved.id,$16,$17,$18,$19,'legacy' FROM saved
          WHERE $16::varchar IS NOT NULL AND (SELECT count(*) FROM ended)>=0 ON CONFLICT DO NOTHING
        ) SELECT * FROM saved`;
      }
      const rows = await query(statement, params);
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
    async listEvents(isTest = false, permissions = null) {
      return query(
        `SELECT ${EVENT_FIELDS} FROM sahwa_events e LEFT JOIN sahwa_volunteers v ON v.id=e.responsible_id WHERE e.is_test=$1 AND ($2::jsonb IS NULL OR sahwa_scope_allows($2::jsonb,'events.view',COALESCE(e.university,'*central*'),e.sector,e.team)) ORDER BY e.event_date DESC NULLS LAST,e.created_at DESC`,
        [isTest, permissions ? JSON.stringify(permissions) : null],
      );
    },
    eventById,
    async createEvent(event, scope = {}) {
      const id = randomUUID();
      await query(
        `INSERT INTO sahwa_events(id,title,event_date,responsible_id,responsible,attendance,notes,university,sector,audience,is_test,team,created_by_volunteer,progress) VALUES ($1,$2,$3,$4,'',$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
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
          Boolean(scope.isTest), scope.team || null, scope.creatorId || null, scope.progress || null,
        ],
      );
      return eventById(id);
    },
    async updateEvent(id, revision, event, options = {}) {
      const rows = await query(
        `UPDATE sahwa_events SET title=$3,event_date=$4,responsible_id=$5,responsible=CASE WHEN $8::boolean AND responsible_id IS NULL THEN responsible ELSE '' END,attendance=$6,notes=$7,audience=COALESCE($9,audience),progress=CASE WHEN $10::boolean THEN $11::text ELSE progress END,revision=revision+1,updated_at=now() WHERE id=$1 AND revision=$2 RETURNING id`,
        [
          id,
          revision,
          event.title,
          event.eventDate || null,
          event.responsibleId,
          event.attendance,
          event.notes,
          Boolean(event.preserveLegacyResponsible), options.audience ?? null, Object.hasOwn(options, "progress"), options.progress ?? null,
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
