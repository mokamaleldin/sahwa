-- Sahwa internal platform, phase one: role assignments, individual accounts,
-- scoped permission overrides, audit log, internal posts, forms and profiles.
-- Additive and re-runnable. Existing volunteer rows, legacy role_id values
-- and events are kept. Statements must not contain semicolons.

ALTER TABLE sahwa_volunteers ADD COLUMN IF NOT EXISTS membership_level text NOT NULL DEFAULT 'متطوع' CHECK (membership_level IN ('متطوع', 'عضو فاعل', 'مسؤول'));
ALTER TABLE sahwa_volunteers ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;
ALTER TABLE sahwa_volunteers ADD COLUMN IF NOT EXISTS archived_at timestamptz;
CREATE INDEX IF NOT EXISTS sahwa_volunteers_realm_idx ON sahwa_volunteers(is_test, archived_at);

CREATE TABLE IF NOT EXISTS sahwa_role_assignments (
  id uuid PRIMARY KEY,
  volunteer_id uuid NOT NULL REFERENCES sahwa_volunteers(id) ON DELETE CASCADE,
  role_id varchar(64) NOT NULL,
  university varchar(120),
  sector text CHECK (sector IN ('youth', 'women')),
  starts_on date,
  ends_on date,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'legacy', 'test')),
  assigned_by varchar(160) NOT NULL DEFAULT '',
  ended_by varchar(160) NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz
);
CREATE INDEX IF NOT EXISTS sahwa_role_assignments_volunteer_idx ON sahwa_role_assignments(volunteer_id, status);
CREATE INDEX IF NOT EXISTS sahwa_role_assignments_role_idx ON sahwa_role_assignments(role_id, status);
CREATE UNIQUE INDEX IF NOT EXISTS sahwa_role_assignments_active_unique ON sahwa_role_assignments(volunteer_id, role_id, COALESCE(university, ''), COALESCE(sector, '')) WHERE status = 'active';

CREATE TABLE IF NOT EXISTS sahwa_accounts (
  id uuid PRIMARY KEY,
  volunteer_id uuid NOT NULL UNIQUE REFERENCES sahwa_volunteers(id) ON DELETE CASCADE,
  username varchar(40) NOT NULL UNIQUE CHECK (username = lower(username) AND username ~ '^[a-z0-9][a-z0-9._-]{2,39}$'),
  password_hash text NOT NULL,
  must_change_password boolean NOT NULL DEFAULT true,
  temporary_expires_at timestamptz,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  session_version integer NOT NULL DEFAULT 1,
  last_login_at timestamptz,
  last_reset_at timestamptz,
  password_changed_at timestamptz,
  created_by varchar(160) NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sahwa_account_sessions (
  token_hash char(64) PRIMARY KEY,
  account_id uuid NOT NULL REFERENCES sahwa_accounts(id) ON DELETE CASCADE,
  session_version integer NOT NULL,
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS sahwa_account_sessions_account_idx ON sahwa_account_sessions(account_id);
CREATE INDEX IF NOT EXISTS sahwa_account_sessions_expiry_idx ON sahwa_account_sessions(expires_at);

CREATE TABLE IF NOT EXISTS sahwa_permission_grants (
  id uuid PRIMARY KEY,
  volunteer_id uuid NOT NULL REFERENCES sahwa_volunteers(id) ON DELETE CASCADE,
  permission varchar(64) NOT NULL,
  effect text NOT NULL CHECK (effect IN ('allow', 'deny')),
  scope_university varchar(120),
  scope_sector text CHECK (scope_sector IN ('youth', 'women')),
  scope_team varchar(64),
  reason varchar(300) NOT NULL DEFAULT '',
  expires_at timestamptz,
  granted_by varchar(160) NOT NULL DEFAULT '',
  granted_by_volunteer uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  revoked_by varchar(160) NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS sahwa_permission_grants_volunteer_idx ON sahwa_permission_grants(volunteer_id);

CREATE TABLE IF NOT EXISTS sahwa_audit_log (
  id uuid PRIMARY KEY,
  actor varchar(160) NOT NULL,
  actor_volunteer uuid,
  action varchar(64) NOT NULL,
  target_volunteer uuid,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_test boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sahwa_audit_log_created_idx ON sahwa_audit_log(is_test, created_at DESC);

CREATE TABLE IF NOT EXISTS sahwa_settings (
  key varchar(64) PRIMARY KEY,
  value jsonb NOT NULL,
  updated_by varchar(160) NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO sahwa_settings(key, value) VALUES ('directory.crossSector', '"leads"'::jsonb) ON CONFLICT (key) DO NOTHING;

-- Events stay private unless an authorized person sets an internal audience.
ALTER TABLE sahwa_events ADD COLUMN IF NOT EXISTS university varchar(120);
ALTER TABLE sahwa_events ADD COLUMN IF NOT EXISTS sector text CHECK (sector IN ('youth', 'women'));
ALTER TABLE sahwa_events ADD COLUMN IF NOT EXISTS audience text NOT NULL DEFAULT 'private' CHECK (audience IN ('private', 'internal'));
ALTER TABLE sahwa_events ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS sahwa_posts (
  id uuid PRIMARY KEY,
  kind text NOT NULL CHECK (kind IN ('news', 'current', 'project', 'achievement', 'opportunity')),
  title varchar(160) NOT NULL,
  body varchar(2000) NOT NULL DEFAULT '',
  skills varchar(300) NOT NULL DEFAULT '',
  link varchar(500) NOT NULL DEFAULT '',
  happens_on date,
  audience_university varchar(120),
  audience_sector text CHECK (audience_sector IN ('youth', 'women')),
  author_label varchar(160) NOT NULL DEFAULT '',
  author_volunteer uuid,
  is_test boolean NOT NULL DEFAULT false,
  archived_at timestamptz,
  revision integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sahwa_posts_realm_idx ON sahwa_posts(is_test, archived_at, created_at DESC);

CREATE TABLE IF NOT EXISTS sahwa_profiles (
  volunteer_id uuid PRIMARY KEY REFERENCES sahwa_volunteers(id) ON DELETE CASCADE,
  handle varchar(30) UNIQUE CHECK (handle IS NULL OR (handle = lower(handle) AND handle ~ '^[a-z0-9][a-z0-9._-]{2,29}$')),
  display_name varchar(80) NOT NULL DEFAULT '',
  bio varchar(300) NOT NULL DEFAULT '',
  work varchar(120) NOT NULL DEFAULT '',
  skills varchar(300) NOT NULL DEFAULT '',
  participation varchar(500) NOT NULL DEFAULT '',
  links jsonb NOT NULL DEFAULT '[]'::jsonb,
  directory_fields jsonb NOT NULL DEFAULT '["major","bio","skills"]'::jsonb,
  public_fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_public boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sahwa_form_definitions (
  id uuid PRIMARY KEY,
  slug varchar(64) NOT NULL UNIQUE,
  title varchar(120) NOT NULL,
  description varchar(600) NOT NULL DEFAULT '',
  fields jsonb NOT NULL,
  routing jsonb NOT NULL,
  audience jsonb NOT NULL DEFAULT '{"sectors":["youth","women"]}'::jsonb,
  active boolean NOT NULL DEFAULT false,
  confidential boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 100,
  revision integer NOT NULL DEFAULT 1,
  updated_by varchar(160) NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sahwa_form_submissions (
  id uuid PRIMARY KEY,
  form_id uuid NOT NULL REFERENCES sahwa_form_definitions(id),
  form_snapshot jsonb NOT NULL,
  submitter_volunteer uuid REFERENCES sahwa_volunteers(id) ON DELETE SET NULL,
  answers jsonb NOT NULL,
  route_role varchar(64) NOT NULL,
  route_university varchar(120),
  route_sector text CHECK (route_sector IN ('youth', 'women')),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'accepted', 'postponed', 'rejected', 'closed')),
  response varchar(1000) NOT NULL DEFAULT '',
  responded_by varchar(160) NOT NULL DEFAULT '',
  is_test boolean NOT NULL DEFAULT false,
  revision integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sahwa_form_submissions_route_idx ON sahwa_form_submissions(is_test, route_role, created_at DESC);
CREATE INDEX IF NOT EXISTS sahwa_form_submissions_submitter_idx ON sahwa_form_submissions(submitter_volunteer);

INSERT INTO sahwa_form_definitions(id, slug, title, description, fields, routing, active, confidential, sort_order) VALUES
('6f0e5d4a-1b1a-4c55-9a51-0a0000000001', 'activities-bank', 'بنك الأنشطة', 'شارك فكرة لنشاط داخل جامعتك أو نشاط مركزي.', '[{"id":"title","label":"عنوان الفكرة","type":"short_text","required":true},{"id":"details","label":"شرح مختصر","type":"long_text","required":true},{"id":"scope","label":"النطاق","type":"select","required":true,"options":["جامعي","مركزي"]}]'::jsonb, '{"by":"scope","university":"internal-activities-lead","central":"central-activities-lead"}'::jsonb, true, false, 10),
('6f0e5d4a-1b1a-4c55-9a51-0a0000000002', 'relations-bank', 'بنك العلاقات', 'اقترح جهة أو شخصًا يمكن التعاون معه.', '[{"id":"name","label":"اسم الجهة أو الشخص","type":"short_text","required":true},{"id":"kind","label":"نوع الجهة","type":"short_text","required":false},{"id":"reason","label":"سبب الاقتراح وفرصة التعاون","type":"long_text","required":true},{"id":"link","label":"رابط أو وسيلة تواصل متاحة","type":"url","required":false},{"id":"scope","label":"النطاق","type":"select","required":true,"options":["جامعي","مركزي"]}]'::jsonb, '{"by":"scope","university":"university-relations-lead","central":"central-relations-lead"}'::jsonb, true, false, 20),
('6f0e5d4a-1b1a-4c55-9a51-0a0000000003', 'media-ideas', 'بنك الأفكار الإعلامية', 'شارك فكرة محتوى أو حملة إعلامية.', '[{"id":"title","label":"العنوان","type":"short_text","required":true},{"id":"details","label":"الشرح","type":"long_text","required":true},{"id":"kind","label":"نوع المحتوى","type":"short_text","required":false},{"id":"link","label":"رابط مرجعي","type":"url","required":false}]'::jsonb, '{"by":"fixed","role":"media-lead"}'::jsonb, true, false, 30),
('6f0e5d4a-1b1a-4c55-9a51-0a0000000004', 'complaints', 'الشكاوى والتظلمات', 'مسار سري مستقل. غير مفعل إلى أن تُعتمد جهة الاستقبال ومسار الوصول الآمن.', '[{"id":"kind","label":"نوع الشكوى","type":"short_text","required":true},{"id":"concerned","label":"الجهة أو الشخص المعني إن وجد","type":"short_text","required":false},{"id":"details","label":"وصف الواقعة","type":"long_text","required":true},{"id":"request","label":"المطلوب أو الأثر","type":"long_text","required":false}]'::jsonb, '{"by":"fixed","role":"review-lead"}'::jsonb, false, true, 40)
ON CONFLICT (slug) DO NOTHING;

-- Clear legacy role matches become active assignments. The legacy role_id
-- column is kept untouched, and ambiguous titles stay for manual review.
INSERT INTO sahwa_role_assignments(id, volunteer_id, role_id, university, sector, status, source, assigned_by)
SELECT md5('legacy:' || v.id::text)::uuid, v.id, m.role_id,
  CASE WHEN m.scope = 'university' THEN v.university ELSE NULL END,
  CASE m.sector_rule WHEN 'youth' THEN 'youth' WHEN 'women' THEN 'women' WHEN 'gender' THEN (CASE v.gender WHEN 'شاب' THEN 'youth' WHEN 'بنت' THEN 'women' END) ELSE NULL END,
  'active', 'legacy', 'ترحيل السجل الحالي'
FROM sahwa_volunteers v
JOIN (VALUES
  ('sahwa-lead', 'sahwa-lead', 'central', 'none'),
  ('women-sector-lead', 'women-sector-lead', 'central', 'women'),
  ('central-youth-lead', 'central-activities-lead', 'central', 'youth'),
  ('central-women-lead', 'central-activities-lead', 'central', 'women'),
  ('central-media-lead', 'media-lead', 'central', 'none'),
  ('central-relations-lead', 'central-relations-lead', 'central', 'none'),
  ('university-youth-coordinator', 'university-youth-lead', 'university', 'youth'),
  ('university-women-coordinator', 'university-women-lead', 'university', 'women'),
  ('internal-activities-lead', 'internal-activities-lead', 'university', 'gender'),
  ('internal-youth-activities', 'internal-activities-lead', 'university', 'youth'),
  ('internal-women-activities', 'internal-activities-lead', 'university', 'women'),
  ('university-activities-member', 'internal-activities-member', 'university', 'gender'),
  ('university-youth-activities-member', 'internal-activities-member', 'university', 'youth'),
  ('university-women-activities-member', 'internal-activities-member', 'university', 'women'),
  ('university-relations-lead', 'university-relations-lead', 'university', 'none'),
  ('university-relations-member', 'university-relations-member', 'university', 'none'),
  ('central-activities-member', 'central-activities-member', 'central', 'gender'),
  ('central-youth-member', 'central-activities-member', 'central', 'youth'),
  ('central-women-member', 'central-activities-member', 'central', 'women'),
  ('central-media-member', 'media-member', 'central', 'none'),
  ('central-relations-member', 'central-relations-member', 'central', 'none'),
  ('review-member', 'review-member', 'central', 'none')
) AS m(legacy_id, role_id, scope, sector_rule) ON m.legacy_id = v.role_id
WHERE v.is_test = false AND v.archived_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM sahwa_role_assignments prior WHERE prior.volunteer_id=v.id)
  AND (m.sector_rule IN ('none', 'youth', 'women') OR v.gender IN ('شاب', 'بنت'))
  AND (m.scope = 'central' OR v.university <> '')
  -- A fixed-sector role must agree with the recorded gender, otherwise it goes to review.
  AND NOT (m.sector_rule = 'youth' AND v.gender = 'بنت')
  AND NOT (m.sector_rule = 'women' AND v.gender = 'شاب')
ON CONFLICT DO NOTHING;

-- Membership level follows Chapter 2.1 definitions for the migrated roles:
-- an assigned lead is «مسؤول», a committee or team member is «عضو فاعل».
UPDATE sahwa_volunteers v SET membership_level = 'مسؤول'
WHERE v.membership_level = 'متطوع' AND EXISTS (SELECT 1 FROM sahwa_role_assignments a WHERE a.volunteer_id = v.id AND a.status = 'active' AND a.source = 'legacy' AND a.role_id IN ('sahwa-lead', 'women-sector-lead', 'central-activities-lead', 'media-lead', 'central-relations-lead', 'university-youth-lead', 'university-women-lead', 'internal-activities-lead', 'university-relations-lead'));
UPDATE sahwa_volunteers v SET membership_level = 'عضو فاعل'
WHERE v.membership_level = 'متطوع' AND EXISTS (SELECT 1 FROM sahwa_role_assignments a WHERE a.volunteer_id = v.id AND a.status = 'active' AND a.source = 'legacy' AND a.role_id IN ('internal-activities-member', 'central-activities-member', 'university-relations-member', 'central-relations-member', 'media-member', 'review-member'))
