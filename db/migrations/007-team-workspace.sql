-- Additive migration. Original form answers, event history and accounts are retained.
ALTER TABLE sahwa_events ADD COLUMN IF NOT EXISTS team varchar(64);
ALTER TABLE sahwa_events ADD COLUMN IF NOT EXISTS created_by_volunteer uuid REFERENCES sahwa_volunteers(id);
ALTER TABLE sahwa_events ADD COLUMN IF NOT EXISTS progress text CHECK (progress IN ('planned', 'completed', 'cancelled'));
ALTER TABLE sahwa_posts ADD COLUMN IF NOT EXISTS audience_team varchar(64);
ALTER TABLE sahwa_form_submissions ADD COLUMN IF NOT EXISTS relation_record jsonb;
ALTER TABLE sahwa_form_submissions ADD COLUMN IF NOT EXISTS relation_owner uuid REFERENCES sahwa_volunteers(id);
ALTER TABLE sahwa_form_submissions ADD COLUMN IF NOT EXISTS direct_relation boolean NOT NULL DEFAULT false;

-- Evaluate the server-resolved permission instances against the stored row.
CREATE OR REPLACE FUNCTION sahwa_scope_allows(acl jsonb, action text, u text, sec text, t text)
RETURNS boolean LANGUAGE SQL IMMUTABLE AS $$
  SELECT EXISTS (SELECT 1 FROM jsonb_to_recordset(acl->'allow') AS p(permission text, university text, sector text, team text)
    WHERE p.permission=action AND (p.university IS NULL OR p.university=u) AND (p.sector IS NULL OR p.sector=sec) AND (p.team IS NULL OR p.team=t))
    AND NOT EXISTS (SELECT 1 FROM jsonb_to_recordset(acl->'deny') AS p(permission text, university text, sector text, team text)
    WHERE p.permission=action AND (p.university IS NULL OR p.university=u) AND (p.sector IS NULL OR p.sector=sec) AND (p.team IS NULL OR p.team=t))
$$;

INSERT INTO sahwa_form_definitions(id,slug,title,description,fields,routing,active,sort_order)
VALUES ('6f0e5d4a-1b1a-4c55-9a51-0a0000000005','general-suggestions','المقترحات العامة','اقتراح موجه إلى مسؤول صحوة.',
  '[{"id":"title","label":"العنوان","type":"short_text","required":true},{"id":"details","label":"المقترح","type":"long_text","required":true}]'::jsonb,
  '{"by":"fixed","role":"sahwa-lead"}'::jsonb,true,50) ON CONFLICT (slug) DO NOTHING;

-- Repair records added after the original migration only when the technical role is unambiguous and there is no assignment history.
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
WHERE v.archived_at IS NULL AND NOT EXISTS (SELECT 1 FROM sahwa_role_assignments prior WHERE prior.volunteer_id=v.id)
  AND (m.sector_rule IN ('none', 'youth', 'women') OR v.gender IN ('شاب', 'بنت'))
  AND (m.scope = 'central' OR v.university <> '')
  -- A fixed-sector role must agree with the recorded gender, otherwise it goes to review.
  AND NOT (m.sector_rule = 'youth' AND v.gender = 'بنت')
  AND NOT (m.sector_rule = 'women' AND v.gender = 'شاب')
ON CONFLICT DO NOTHING;

WITH first_upgrade AS (
  INSERT INTO sahwa_settings(key,value) VALUES ('workspace.publicBioMigrated','true'::jsonb)
  ON CONFLICT (key) DO NOTHING RETURNING key
)
UPDATE sahwa_profiles SET public_fields=public_fields || '["bio"]'::jsonb
WHERE is_public AND bio<>'' AND NOT (public_fields ? 'bio') AND EXISTS (SELECT 1 FROM first_upgrade);
