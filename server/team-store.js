import { randomUUID } from "node:crypto";
import { getSql } from "./db.js";
import { TeamError } from "./team-data.js";

const USER_FIELDS = `id, full_name AS "fullName", email, access_role AS "accessRole", university, major,
  study_year AS "studyYear", birth_date::text AS "birthDate", gender, team, responsibility, status, revision,
  created_at AS "createdAt", updated_at AS "updatedAt"`;
const EVENT_FIELDS = `id, title, event_date::text AS "eventDate", responsible, attendance, notes, revision`;
const conflict = () =>
  new TeamError(
    "تم تعديل السجل من جهاز آخر، أو لم يعد موجودًا. حدّث القائمة وافتحه من جديد.",
    409,
    "CONFLICT",
  );
const values = (p) => [
  p.fullName,
  p.email,
  p.accessRole,
  p.university,
  p.major,
  p.studyYear,
  p.birthDate || null,
  p.gender,
  p.team,
  p.responsibility,
  p.status,
];

export function createTeamStore(getClient = getSql) {
  const query = (statement, params = []) =>
    getClient().query(statement, params);
  return {
    async listVolunteers() {
      return query(
        `SELECT ${USER_FIELDS} FROM sahwa_users ORDER BY full_name, id`,
      );
    },
    async credentials(email) {
      return (
        (
          await query(
            `SELECT ${USER_FIELDS}, password_hash AS "passwordHash" FROM sahwa_users WHERE email=$1`,
            [email],
          )
        )[0] ?? null
      );
    },
    async bootstrap(email, hash) {
      // The legacy account becomes the first admin only while the directory is empty.
      const sql = getClient();
      await sql.transaction([
        sql.query("SELECT pg_advisory_xact_lock(752026)"),
        sql.query(
          `INSERT INTO sahwa_users (id, full_name, email, password_hash, access_role, university)
          SELECT $1, 'مسؤول صحوة', $2, $3, 'admin', 'عام / مركزي'
          WHERE NOT EXISTS (SELECT 1 FROM sahwa_users)`,
          [randomUUID(), email, hash],
        ),
      ]);
    },
    async createVolunteer(person, passwordHash) {
      const rows = await query(
        `INSERT INTO sahwa_users
        (id, full_name, email, access_role, university, major, study_year, birth_date, gender, team, responsibility, status, password_hash)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING ${USER_FIELDS}`,
        [randomUUID(), ...values(person), passwordHash],
      );
      return rows[0];
    },
    async updateVolunteer(id, revision, person, passwordHash) {
      const sql = getClient();
      const results = await sql.transaction([
        sql.query("SELECT pg_advisory_xact_lock(752026)"),
        sql.query(
          `WITH changed AS (UPDATE sahwa_users SET full_name=$3, email=$4, access_role=$5, university=$6, major=$7,
          study_year=$8, birth_date=$9, gender=$10, team=$11, responsibility=$12, status=$13,
          password_hash=COALESCE($14,password_hash), revision=revision+1, updated_at=now()
          WHERE id=$1 AND revision=$2 AND (
            access_role <> 'admin' OR status NOT IN ('نشط','خريج') OR ($5='admin' AND $13 IN ('نشط','خريج'))
            OR (SELECT count(*) FROM sahwa_users WHERE access_role='admin' AND status IN ('نشط','خريج'))>1
          ) RETURNING *), cleared AS (
            DELETE FROM sahwa_sessions WHERE user_id IN (SELECT id FROM changed) AND $14::text IS NOT NULL
          ) SELECT ${USER_FIELDS} FROM changed`,
          [id, revision, ...values(person), passwordHash || null],
        ),
      ]);
      if (!results[1].length) throw conflict();
      return results[1][0];
    },
    async saveSession(hash, userId, expires) {
      const sql = getClient();
      await sql.transaction([
        sql.query("DELETE FROM sahwa_sessions WHERE expires_at <= now()"),
        sql.query(
          "INSERT INTO sahwa_sessions(token_hash,user_id,expires_at) VALUES ($1,$2,$3)",
          [hash, userId, expires],
        ),
      ]);
    },
    async sessionUser(hash) {
      return (
        (
          await query(
            `SELECT ${USER_FIELDS} FROM sahwa_users WHERE id=(
        SELECT user_id FROM sahwa_sessions WHERE token_hash=$1 AND expires_at>now())`,
            [hash],
          )
        )[0] ?? null
      );
    },
    async deleteSession(hash) {
      await query("DELETE FROM sahwa_sessions WHERE token_hash=$1", [hash]);
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
    async listEvents() {
      return query(
        `SELECT ${EVENT_FIELDS} FROM sahwa_events ORDER BY event_date DESC, created_at DESC`,
      );
    },
    async createEvent(event, userId) {
      return (
        await query(
          `INSERT INTO sahwa_events(id,title,event_date,responsible,attendance,notes,created_by)
        VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING ${EVENT_FIELDS}`,
          [
            randomUUID(),
            event.title,
            event.eventDate,
            event.responsible,
            event.attendance,
            event.notes,
            userId,
          ],
        )
      )[0];
    },
    async updateEvent(id, revision, event) {
      const rows = await query(
        `UPDATE sahwa_events SET title=$3,event_date=$4,responsible=$5,attendance=$6,notes=$7,
        revision=revision+1,updated_at=now() WHERE id=$1 AND revision=$2 RETURNING ${EVENT_FIELDS}`,
        [
          id,
          revision,
          event.title,
          event.eventDate,
          event.responsible,
          event.attendance,
          event.notes,
        ],
      );
      if (!rows.length) throw conflict();
      return rows[0];
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
