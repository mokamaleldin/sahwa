import { randomUUID } from "node:crypto";
import { getSql } from "../db.js";
import { TeamError } from "../team-data.js";

const PERSON = `v.id, v.full_name AS "fullName", v.university, v.major, v.study_year AS "studyYear", COALESCE(v.birth_date::text,'') AS "birthDate", v.gender, v.team, v.responsibility, v.role_id AS "roleId", v.phone, v.status, v.revision, v.membership_level AS "membershipLevel", v.is_test AS "isTest", v.archived_at AS "archivedAt"`;
const ASSIGNMENT = `a.id, a.volunteer_id AS "volunteerId", a.role_id AS "roleId", a.university, a.sector, COALESCE(a.starts_on::text,'') AS "startsOn", COALESCE(a.ends_on::text,'') AS "endsOn", a.status, a.source, a.assigned_by AS "assignedBy", a.created_at AS "createdAt"`;
const ACCOUNT = `c.id AS "accountId", c.username, c.email AS "accountEmail", c.status AS "accountStatus", c.must_change_password AS "mustChangePassword", c.temporary_expires_at AS "temporaryExpiresAt", c.last_login_at AS "lastLoginAt", c.last_reset_at AS "lastResetAt", c.created_at AS "accountCreatedAt"`;
const POST = `p.id, p.kind, p.title, p.body, p.skills, p.link, COALESCE(p.happens_on::text,'') AS "happensOn", p.audience_university AS "audienceUniversity", p.audience_sector AS "audienceSector", p.author_label AS "authorLabel", p.revision, p.created_at AS "createdAt"`;
const FORM = `f.id, f.slug, f.title, f.description, f.fields, f.routing, f.audience, f.active, f.confidential, f.sort_order AS "sortOrder", f.revision`;
const SUBMISSION = `s.id, s.form_id AS "formId", s.form_snapshot AS "form", s.answers, s.route_role AS "routeRole", s.route_university AS "routeUniversity", s.route_sector AS "routeSector", s.status, s.response, s.responded_by AS "respondedBy", s.revision, s.created_at AS "createdAt", s.submitter_volunteer AS "submitterId"`;
const PROFILE = `pr.volunteer_id AS "volunteerId", pr.handle, pr.display_name AS "displayName", pr.bio, pr.work, pr.skills, pr.participation, pr.links, pr.directory_fields AS "directoryFields", pr.public_fields AS "publicFields", pr.is_public AS "isPublic"`;

const conflict = () => new TeamError("تم تعديل السجل من جهاز آخر، أو لم يعد موجودًا. حدّث الصفحة وحاول مجددًا.", 409, "CONFLICT");

export function createPlatformStore(getClient = getSql) {
  const query = (statement, params = []) => getClient().query(statement, params);
  const one = async (statement, params) => (await query(statement, params))[0];

  return {
    // Sessions and accounts
    async sessionAccount(hash) {
      return one(
        `SELECT c.id AS "accountId", c.username, c.email, c.is_owner AS "isOwner", c.display_name AS "displayName", c.status AS "accountStatus", c.must_change_password AS "mustChangePassword", ${PERSON}
         FROM sahwa_account_sessions s JOIN sahwa_accounts c ON c.id=s.account_id LEFT JOIN sahwa_volunteers v ON v.id=c.volunteer_id
         WHERE s.token_hash=$1 AND s.expires_at>now() AND s.session_version=c.session_version`,
        [hash],
      );
    },
    async saveAccountSession(hash, accountId, expires) {
      const sql = getClient();
      await sql.transaction([
        sql.query("DELETE FROM sahwa_account_sessions WHERE expires_at<=now()"),
        sql.query("INSERT INTO sahwa_account_sessions(token_hash,account_id,session_version,expires_at) SELECT $1,id,session_version,$3 FROM sahwa_accounts WHERE id=$2", [hash, accountId, expires]),
        sql.query("UPDATE sahwa_accounts SET last_login_at=now() WHERE id=$1", [accountId]),
      ]);
    },
    async deleteAccountSession(hash) {
      await query("DELETE FROM sahwa_account_sessions WHERE token_hash=$1", [hash]);
    },
    // Login by e-mail or username.
    async accountForLogin(identifier) {
      return one(
        `SELECT c.id AS "accountId", c.password_hash AS "passwordHash", c.status AS "accountStatus", c.temporary_expires_at AS "temporaryExpiresAt", c.must_change_password AS "mustChangePassword", c.is_owner AS "isOwner", v.archived_at AS "archivedAt"
         FROM sahwa_accounts c LEFT JOIN sahwa_volunteers v ON v.id=c.volunteer_id
         WHERE (c.username=$1 OR c.email=$1) AND (c.is_owner OR v.id IS NOT NULL)`,
        [identifier],
      );
    },
    async emailTaken(email) {
      return Boolean(await one("SELECT 1 AS x FROM sahwa_accounts WHERE email=$1", [email]));
    },
    async accountPasswordHash(accountId) {
      return (await one("SELECT password_hash AS hash FROM sahwa_accounts WHERE id=$1", [accountId]))?.hash;
    },
    async usernameTaken(username) {
      return Boolean(await one("SELECT 1 AS x FROM sahwa_accounts WHERE username=$1", [username]));
    },
    async accountForVolunteer(volunteerId) {
      return one(`SELECT ${ACCOUNT}, c.volunteer_id AS "volunteerId" FROM sahwa_accounts c WHERE c.volunteer_id=$1`, [volunteerId]);
    },
    async createAccount({ volunteerId, username, email = null, passwordHash, mustChange, expiresAt, createdBy }) {
      return one(
        `INSERT INTO sahwa_accounts(id,volunteer_id,username,email,password_hash,must_change_password,temporary_expires_at,created_by,last_reset_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,now()) RETURNING id`,
        [randomUUID(), volunteerId, username, email, passwordHash, mustChange, expiresAt, createdBy],
      );
    },
    async resetAccount(accountId, passwordHash, expiresAt, mustChange = true) {
      await query(
        `UPDATE sahwa_accounts SET password_hash=$2, must_change_password=$4, temporary_expires_at=$3, last_reset_at=now(), session_version=session_version+1, updated_at=now() WHERE id=$1`,
        [accountId, passwordHash, expiresAt, mustChange],
      );
    },
    async setAccountStatus(accountId, status) {
      await query(`UPDATE sahwa_accounts SET status=$2, session_version=session_version+1, updated_at=now() WHERE id=$1`, [accountId, status]);
    },
    async changePassword(accountId, passwordHash) {
      const sql = getClient();
      await sql.transaction([
        sql.query(
          `UPDATE sahwa_accounts SET password_hash=$2, must_change_password=false, temporary_expires_at=NULL, password_changed_at=now(), session_version=session_version+1, updated_at=now() WHERE id=$1`,
          [accountId, passwordHash],
        ),
      ]);
    },
    async updateOwnerDisplayName(accountId, displayName) {
      await query(`UPDATE sahwa_accounts SET display_name=$2, updated_at=now() WHERE id=$1 AND is_owner=true`, [accountId, displayName]);
    },

    // People and assignments
    async person(id) {
      return one(`SELECT ${PERSON} FROM sahwa_volunteers v WHERE v.id=$1`, [id]);
    },
    async people(isTest, { includeArchived = false } = {}) {
      return query(
        `SELECT ${PERSON}, ${ACCOUNT} FROM sahwa_volunteers v LEFT JOIN sahwa_accounts c ON c.volunteer_id=v.id
         WHERE v.is_test=$1 ${includeArchived ? "" : "AND v.archived_at IS NULL"} ORDER BY v.full_name, v.id`,
        [isTest],
      );
    },
    async assignments(isTest, { includeEnded = false } = {}) {
      return query(
        `SELECT ${ASSIGNMENT} FROM sahwa_role_assignments a JOIN sahwa_volunteers v ON v.id=a.volunteer_id
         WHERE v.is_test=$1 AND v.archived_at IS NULL ${includeEnded ? "" : "AND a.status='active'"} ORDER BY a.created_at`,
        [isTest],
      );
    },
    async assignmentsOf(volunteerId, { includeEnded = false } = {}) {
      return query(
        `SELECT ${ASSIGNMENT} FROM sahwa_role_assignments a WHERE a.volunteer_id=$1 ${includeEnded ? "" : "AND a.status='active'"} ORDER BY a.status, a.created_at`,
        [volunteerId],
      );
    },
    async assignment(id) {
      return one(`SELECT ${ASSIGNMENT} FROM sahwa_role_assignments a WHERE a.id=$1`, [id]);
    },
    async addAssignment({ volunteerId, roleId, university, sector, startsOn, assignedBy, source = "manual" }) {
      const rows = await query(
        `INSERT INTO sahwa_role_assignments(id,volunteer_id,role_id,university,sector,starts_on,assigned_by,source) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT DO NOTHING RETURNING id`,
        [randomUUID(), volunteerId, roleId, university, sector, startsOn || null, assignedBy, source],
      );
      if (!rows.length) throw new TeamError("هذا الدور مسند بالفعل لهذا الشخص في النطاق نفسه.", 409, "DUPLICATE_ASSIGNMENT");
      return rows[0].id;
    },
    async endAssignment(id, endedBy) {
      const rows = await query(
        `UPDATE sahwa_role_assignments SET status='ended', ended_at=now(), ends_on=COALESCE(ends_on, CURRENT_DATE), ended_by=$2 WHERE id=$1 AND status='active' RETURNING id`,
        [id, endedBy],
      );
      if (!rows.length) throw conflict();
    },
    async setMembershipLevel(volunteerId, level) {
      await query("UPDATE sahwa_volunteers SET membership_level=$2, revision=revision+1, updated_at=now() WHERE id=$1", [volunteerId, level]);
    },
    async archivePerson(id, revision) {
      const rows = await query("UPDATE sahwa_volunteers SET archived_at=now(), revision=revision+1, updated_at=now() WHERE id=$1 AND revision=$2 AND archived_at IS NULL RETURNING id", [id, revision]);
      if (!rows.length) throw conflict();
      await query("DELETE FROM sahwa_account_sessions WHERE account_id IN (SELECT id FROM sahwa_accounts WHERE volunteer_id=$1)", [id]);
    },
    async restorePerson(id) {
      const rows = await query("UPDATE sahwa_volunteers SET archived_at=NULL, revision=revision+1, updated_at=now() WHERE id=$1 AND archived_at IS NOT NULL RETURNING id", [id]);
      if (!rows.length) throw conflict();
    },
    async sameNamePeople(isTest, fullName) {
      return query(`SELECT ${PERSON} FROM sahwa_volunteers v WHERE v.is_test=$1 AND v.archived_at IS NULL AND lower(trim(v.full_name))=lower(trim($2))`, [isTest, fullName]);
    },

    // Grants
    async grantsOf(volunteerId) {
      return query(
        `SELECT id, permission, effect, scope_university AS university, scope_sector AS sector, scope_team AS team, reason, expires_at AS "expiresAt", granted_by AS "grantedBy", created_at AS "createdAt"
         FROM sahwa_permission_grants WHERE volunteer_id=$1 AND revoked_at IS NULL AND (expires_at IS NULL OR expires_at>now()) ORDER BY created_at`,
        [volunteerId],
      );
    },
    async allGrants(isTest) {
      return query(
        `SELECT g.id, g.volunteer_id AS "volunteerId", v.full_name AS "fullName", g.permission, g.effect, g.scope_university AS university, g.scope_sector AS sector, g.scope_team AS team, g.reason, g.expires_at AS "expiresAt", g.granted_by AS "grantedBy", g.created_at AS "createdAt"
         FROM sahwa_permission_grants g JOIN sahwa_volunteers v ON v.id=g.volunteer_id
         WHERE v.is_test=$1 AND g.revoked_at IS NULL AND (g.expires_at IS NULL OR g.expires_at>now()) ORDER BY g.created_at DESC`,
        [isTest],
      );
    },
    async grant(id) {
      return one(`SELECT id, volunteer_id AS "volunteerId", permission, effect, scope_university AS university, scope_sector AS sector, scope_team AS team, granted_by_volunteer AS "grantedByVolunteer" FROM sahwa_permission_grants WHERE id=$1 AND revoked_at IS NULL`, [id]);
    },
    async addGrant(g) {
      return (await one(
        `INSERT INTO sahwa_permission_grants(id,volunteer_id,permission,effect,scope_university,scope_sector,scope_team,reason,expires_at,granted_by,granted_by_volunteer) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
        [randomUUID(), g.volunteerId, g.permission, g.effect, g.university, g.sector, g.team, g.reason, g.expiresAt, g.grantedBy, g.grantedByVolunteer],
      )).id;
    },
    async revokeGrant(id, revokedBy) {
      const rows = await query("UPDATE sahwa_permission_grants SET revoked_at=now(), revoked_by=$2 WHERE id=$1 AND revoked_at IS NULL RETURNING id", [id, revokedBy]);
      if (!rows.length) throw conflict();
    },

    // Audit and settings
    async audit(entry) {
      await query(
        "INSERT INTO sahwa_audit_log(id,actor,actor_volunteer,action,target_volunteer,details,is_test) VALUES ($1,$2,$3,$4,$5,$6,$7)",
        [randomUUID(), entry.actor, entry.actorVolunteer || null, entry.action, entry.target || null, JSON.stringify(entry.details || {}), Boolean(entry.isTest)],
      );
    },
    async auditLog(isTest, limit = 200) {
      return query(
        `SELECT l.id, l.actor, l.action, l.details, l.created_at AS "createdAt", v.full_name AS "targetName"
         FROM sahwa_audit_log l LEFT JOIN sahwa_volunteers v ON v.id=l.target_volunteer WHERE l.is_test=$1 ORDER BY l.created_at DESC LIMIT $2`,
        [isTest, limit],
      );
    },
    async setting(key, fallback) {
      const row = await one("SELECT value FROM sahwa_settings WHERE key=$1", [key]);
      return row ? row.value : fallback;
    },
    async setSetting(key, value, updatedBy) {
      await query(
        "INSERT INTO sahwa_settings(key,value,updated_by) VALUES ($1,$2,$3) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_by=EXCLUDED.updated_by, updated_at=now()",
        [key, JSON.stringify(value), updatedBy],
      );
    },

    // Community
    async posts(isTest) {
      return query(`SELECT ${POST} FROM sahwa_posts p WHERE p.is_test=$1 AND p.archived_at IS NULL ORDER BY p.created_at DESC LIMIT 200`, [isTest]);
    },
    async post(id) {
      return one(`SELECT ${POST}, p.is_test AS "isTest" FROM sahwa_posts p WHERE p.id=$1 AND p.archived_at IS NULL`, [id]);
    },
    async createPost(p) {
      return (await one(
        `INSERT INTO sahwa_posts(id,kind,title,body,skills,link,happens_on,audience_university,audience_sector,author_label,author_volunteer,is_test) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
        [randomUUID(), p.kind, p.title, p.body, p.skills, p.link, p.happensOn || null, p.audienceUniversity, p.audienceSector, p.authorLabel, p.authorVolunteer, p.isTest],
      )).id;
    },
    async archivePost(id, revision) {
      const rows = await query("UPDATE sahwa_posts SET archived_at=now(), revision=revision+1 WHERE id=$1 AND revision=$2 AND archived_at IS NULL RETURNING id", [id, revision]);
      if (!rows.length) throw conflict();
    },
    async internalEvents(isTest) {
      return query(
        `SELECT e.id, e.title, COALESCE(e.event_date::text,'') AS "eventDate", e.university, e.sector, COALESCE(v.full_name,'') AS responsible
         FROM sahwa_events e LEFT JOIN sahwa_volunteers v ON v.id=e.responsible_id
         WHERE e.is_test=$1 AND e.audience='internal' ORDER BY e.event_date DESC NULLS LAST LIMIT 200`,
        [isTest],
      );
    },
    async eventsThisYear(isTest, year) {
      return (await one(
        "SELECT count(*)::int AS count FROM sahwa_events WHERE is_test=$1 AND event_date >= make_date($2,1,1) AND event_date <= CURRENT_DATE",
        [isTest, year],
      )).count;
    },

    // Forms
    async forms() {
      return query(`SELECT ${FORM} FROM sahwa_form_definitions f ORDER BY f.sort_order, f.title`);
    },
    async form(id) {
      return one(`SELECT ${FORM} FROM sahwa_form_definitions f WHERE f.id=$1`, [id]);
    },
    async updateForm(id, revision, f, updatedBy) {
      const rows = await query(
        `UPDATE sahwa_form_definitions SET title=$3, description=$4, fields=$5, audience=$6, active=$7, sort_order=$8, routing=COALESCE($10::jsonb, routing), revision=revision+1, updated_by=$9, updated_at=now() WHERE id=$1 AND revision=$2 RETURNING id`,
        [id, revision, f.title, f.description, JSON.stringify(f.fields), JSON.stringify(f.audience), f.active, f.sortOrder, updatedBy, f.routing ? JSON.stringify(f.routing) : null],
      );
      if (!rows.length) throw conflict();
    },
    async createForm(f, updatedBy) {
      return (await one(
        `INSERT INTO sahwa_form_definitions(id,slug,title,description,fields,routing,audience,active,confidential,sort_order,updated_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,false,$9,$10) RETURNING id`,
        [randomUUID(), f.slug, f.title, f.description, JSON.stringify(f.fields), JSON.stringify(f.routing), JSON.stringify(f.audience), f.active, f.sortOrder, updatedBy],
      )).id;
    },
    async createSubmission(s) {
      return (await one(
        `INSERT INTO sahwa_form_submissions(id,form_id,form_snapshot,submitter_volunteer,answers,route_role,route_university,route_sector,is_test) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
        [randomUUID(), s.formId, JSON.stringify(s.form), s.submitterId, JSON.stringify(s.answers), s.routeRole, s.routeUniversity, s.routeSector, s.isTest],
      )).id;
    },
    async submissionsBy(volunteerId) {
      return query(`SELECT ${SUBMISSION} FROM sahwa_form_submissions s WHERE s.submitter_volunteer=$1 ORDER BY s.created_at DESC`, [volunteerId]);
    },
    async submissionsForRoles(isTest, roleIds) {
      if (!roleIds.length) return [];
      return query(
        `SELECT ${SUBMISSION}, v.full_name AS "submitterName", v.university AS "submitterUniversity" FROM sahwa_form_submissions s LEFT JOIN sahwa_volunteers v ON v.id=s.submitter_volunteer
         WHERE s.is_test=$1 AND s.route_role = ANY($2) ORDER BY s.created_at DESC LIMIT 300`,
        [isTest, roleIds],
      );
    },
    async submission(id) {
      return one(`SELECT ${SUBMISSION}, s.is_test AS "isTest" FROM sahwa_form_submissions s WHERE s.id=$1`, [id]);
    },
    async respond(id, revision, status, response, by) {
      const rows = await query(
        "UPDATE sahwa_form_submissions SET status=$3, response=$4, responded_by=$5, revision=revision+1, updated_at=now() WHERE id=$1 AND revision=$2 RETURNING id",
        [id, revision, status, response, by],
      );
      if (!rows.length) throw conflict();
    },

    // Profiles
    async profile(volunteerId) {
      return one(`SELECT ${PROFILE} FROM sahwa_profiles pr WHERE pr.volunteer_id=$1`, [volunteerId]);
    },
    async profiles(isTest) {
      return query(`SELECT ${PROFILE} FROM sahwa_profiles pr JOIN sahwa_volunteers v ON v.id=pr.volunteer_id WHERE v.is_test=$1`, [isTest]);
    },
    async handleOwner(handle) {
      return (await one("SELECT volunteer_id AS id FROM sahwa_profiles WHERE handle=$1", [handle]))?.id;
    },
    async saveProfile(volunteerId, p) {
      await query(
        `INSERT INTO sahwa_profiles(volunteer_id,handle,display_name,bio,work,skills,participation,links,directory_fields,public_fields,is_public,updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,now())
         ON CONFLICT (volunteer_id) DO UPDATE SET handle=EXCLUDED.handle, display_name=EXCLUDED.display_name, bio=EXCLUDED.bio, work=EXCLUDED.work, skills=EXCLUDED.skills,
           participation=EXCLUDED.participation, links=EXCLUDED.links, directory_fields=EXCLUDED.directory_fields, public_fields=EXCLUDED.public_fields, is_public=EXCLUDED.is_public, updated_at=now()`,
        [volunteerId, p.handle, p.displayName, p.bio, p.work, p.skills, p.participation, JSON.stringify(p.links), JSON.stringify(p.directoryFields), JSON.stringify(p.publicFields), p.isPublic],
      );
    },
    // The public page reads a limited projection only. Test, archived and
    // suspended people are never public.
    async publicProfile(handle) {
      return one(
        `SELECT ${PROFILE}, v.full_name AS "fullName", v.university, v.major, COALESCE(v.birth_date::text,'') AS "birthDate", v.gender
         FROM sahwa_profiles pr JOIN sahwa_volunteers v ON v.id=pr.volunteer_id LEFT JOIN sahwa_accounts c ON c.volunteer_id=v.id
         WHERE pr.handle=$1 AND pr.is_public=true AND v.is_test=false AND v.archived_at IS NULL AND (c.id IS NULL OR c.status='active')`,
        [handle],
      );
    },
  };
}

export const platformStore = createPlatformStore();
