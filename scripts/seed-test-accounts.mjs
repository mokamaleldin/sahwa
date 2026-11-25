// Creates the isolated test accounts (one per technical role plus edge cases).
// Test records carry is_test=true: they never appear in Sahwa's real data or
// statistics, cannot see real records, and cannot sign in on production.
//
// Local:   SAHWA_LOCAL_DB=.local-db node scripts/seed-test-accounts.mjs
// Neon:    node --env-file=.env.preview scripts/seed-test-accounts.mjs --non-production
//          (a Neon branch used for development or preview only)
import { hashPassword } from "../server/auth.js";
import { createTeamStore } from "../server/team-store.js";
import { createPlatformStore } from "../server/platform/store.js";

const PASSWORD = "Sahwa2345";
const env = process.env;

if (env.VERCEL_ENV === "production" || env.SAHWA_ENV === "production") {
  console.error("Refusing to seed test accounts in production.");
  process.exit(1);
}

async function client() {
  if (env.SAHWA_LOCAL_DB) {
    const { PGlite } = await import("@electric-sql/pglite");
    const { pgliteClient, migrate } = await import("../server/pglite.js");
    const db = new PGlite(env.SAHWA_LOCAL_DB);
    await migrate(db, env.SAHWA_ACCOUNT_EMAIL?.trim().toLowerCase() || "");
    return { sql: pgliteClient(db), close: () => db.close(), label: `local database ${env.SAHWA_LOCAL_DB}` };
  }
  const url = env.DATABASE_URL_UNPOOLED || env.DATABASE_URL;
  if (!url) throw new Error("Set SAHWA_LOCAL_DB, or DATABASE_URL_UNPOOLED for a non-production Neon branch.");
  if (!process.argv.includes("--non-production"))
    throw new Error("Pass --non-production to confirm this Neon database is a development or preview branch.");
  const host = new URL(url).hostname;
  if (env.SAHWA_PRODUCTION_DB_HOST && host === env.SAHWA_PRODUCTION_DB_HOST)
    throw new Error("This URL matches SAHWA_PRODUCTION_DB_HOST. Refusing.");
  const { neon } = await import("@neondatabase/serverless");
  return { sql: neon(url), close: async () => {}, label: host };
}

const U1 = "استنيا";
const U2 = "بيلجي";
const youth = "شاب";
const women = "بنت";

// [username, name, gender, university, roles[], options]
const ACCOUNTS = [
  ["test.admin", "تجريبي — مسؤول صحوة", youth, U1, [["sahwa-lead"]]],
  ["test.women.admin", "تجريبي — مسؤولة قطاع الطالبات", women, U1, [["women-sector-lead"]]],
  ["test.uni.men", "تجريبي — مسؤول الشباب (استنيا)", youth, U1, [["university-youth-lead", U1]]],
  ["test.uni.women", "تجريبي — مسؤولة الطالبات (استنيا)", women, U1, [["university-women-lead", U1]]],
  ["test.activity.local", "تجريبي — عضو الأنشطة الداخلية", youth, U1, [["internal-activities-member", U1, "youth"]]],
  ["test.activity.local.lead", "تجريبي — مسؤول الأنشطة الداخلية", youth, U1, [["internal-activities-lead", U1, "youth"]]],
  ["test.activity.central", "تجريبي — عضو الأنشطة المركزية", youth, U1, [["central-activities-member", null, "youth"]]],
  ["test.activity.central.lead", "تجريبي — مسؤول الأنشطة المركزية", youth, U1, [["central-activities-lead", null, "youth"]]],
  ["test.pr.local", "تجريبي — عضو العلاقات الجامعية", youth, U1, [["university-relations-member", U1]]],
  ["test.pr.local.lead", "تجريبي — مسؤول العلاقات الجامعية", youth, U1, [["university-relations-lead", U1]]],
  ["test.pr.central", "تجريبي — عضو العلاقات العامة المركزية", youth, U1, [["central-relations-member"]]],
  ["test.pr.central.lead", "تجريبي — مسؤول العلاقات العامة المركزية", youth, U1, [["central-relations-lead"]]],
  ["test.media", "تجريبي — عضو الإعلام", youth, U1, [["media-member"]]],
  ["test.media.lead", "تجريبي — مسؤول الإعلام المركزي", youth, U1, [["media-lead"]]],
  ["test.finance", "تجريبي — مسؤول المالية", youth, U1, [["finance-lead"]]],
  ["test.archive", "تجريبي — مسؤول التوثيق والأرشفة", youth, U1, [["archive-lead"]]],
  ["test.review", "تجريبي — عضو مجلس المتابعة والمراجعة", youth, U1, [["review-member"]]],
  ["test.review.lead", "تجريبي — مسؤول مجلس المتابعة والمراجعة", youth, U1, [["review-lead"]]],
  ["test.volunteer.local", "تجريبي — متطوع عام داخل الجامعة", youth, U1, [["university-volunteer", U1, "youth"]]],
  ["test.volunteer.central", "تجريبي — متطوع عام مركزي", youth, U1, [["central-volunteer", null, "youth"]]],
  // Additional cases
  ["test.activity.local.women", "تجريبي — عضوة الأنشطة الداخلية", women, U1, [["internal-activities-member", U1, "women"]]],
  ["test.activity.local.lead.women", "تجريبي — مسؤولة الأنشطة الداخلية", women, U1, [["internal-activities-lead", U1, "women"]]],
  ["test.activity.central.lead.women", "تجريبي — مسؤولة الأنشطة المركزية", women, U1, [["central-activities-lead", null, "women"]]],
  ["test.uni.men.2", "تجريبي — مسؤول الشباب (بيلجي)", youth, U2, [["university-youth-lead", U2]]],
  ["test.uni.women.2", "تجريبي — مسؤولة الطالبات (بيلجي)", women, U2, [["university-women-lead", U2]]],
  ["test.multi", "تجريبي — متعدد الأدوار", youth, U2, [["internal-activities-member", U2, "youth"], ["media-member"]]],
  ["test.inactive", "تجريبي — متطوع غير نشط", youth, U1, [["university-volunteer", U1, "youth"]], { status: "غير نشط" }],
];
const WITHOUT_ACCOUNT = [["تجريبي — متطوع بلا حساب", youth, U1, [["university-volunteer", U1, "youth"]]]];

const { sql, close, label } = await client();
try {
  const team = createTeamStore(() => sql);
  const platform = createPlatformStore(() => sql);
  const hash = await hashPassword(PASSWORD);
  const existing = new Map((await platform.people(true)).map((p) => [p.fullName, p]));
  async function ensurePerson(name, gender, university, roles, options = {}) {
    let person = existing.get(name);
    if (!person) {
      person = await team.createVolunteer(
        { fullName: name, university, gender, status: options.status || "نشط", birthDate: "2000-01-01", team: "", responsibility: "", phone: "", major: "", studyYear: "" },
        { isTest: true },
      );
      existing.set(name, person);
    }
    for (const [roleId, roleUniversity = null, sector = null] of roles) {
      const fixed = { "women-sector-lead": "women", "university-women-lead": "women", "university-youth-lead": "youth" }[roleId] || sector;
      try {
        await platform.addAssignment({ volunteerId: person.id, roleId, university: roleUniversity, sector: fixed, assignedBy: "بذرة الحسابات التجريبية", source: "test" });
      } catch (error) {
        if (error.code !== "DUPLICATE_ASSIGNMENT") throw error;
      }
    }
    return person;
  }
  const report = [];
  for (const [username, name, gender, university, roles, options] of ACCOUNTS) {
    const person = await ensurePerson(name, gender, university, roles, options);
    if (!(await platform.usernameTaken(username)))
      await platform.createAccount({ volunteerId: person.id, username, passwordHash: hash, mustChange: false, expiresAt: null, createdBy: "بذرة الحسابات التجريبية" });
    report.push({ username, name });
  }
  for (const [name, gender, university, roles] of WITHOUT_ACCOUNT) await ensurePerson(name, gender, university, roles);
  // One internal event and one opportunity so the test realm is not empty.
  if (!(await platform.posts(true)).length) {
    await platform.createPost({ kind: "opportunity", title: "فرصة تجريبية: تصوير لقاء الاستقبال", body: "منشور تجريبي في البيئة المعزولة.", skills: "تصوير، مونتاج", link: "", happensOn: "", audienceUniversity: null, audienceSector: null, authorLabel: "بذرة تجريبية", authorVolunteer: null, isTest: true });
    await team.createEvent({ title: "فعالية تجريبية — لقاء استنيا", eventDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), responsibleId: null, attendance: null, notes: "" }, { university: U1, sector: "youth", audience: "internal", isTest: true });
  }
  console.log(`Seeded ${report.length} test accounts into ${label} (password: ${PASSWORD}, test realm only).`);
  for (const r of report) console.log(`  ${r.username.padEnd(34)} ${r.name}`);
} finally {
  await close();
}
