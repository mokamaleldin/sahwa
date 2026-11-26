-- Platform simplification: event creator ownership and Ideas Bank form update.
-- Additive and idempotent. Statements must not contain semicolons.

ALTER TABLE sahwa_events ADD COLUMN IF NOT EXISTS created_by_volunteer uuid REFERENCES sahwa_volunteers(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS sahwa_events_creator_idx ON sahwa_events(created_by_volunteer);

UPDATE sahwa_form_definitions
SET title = 'بنك الأفكار',
    description = 'شارك فكرة لنشاط أو مبادرة جديدة في جامعتك أو على مستوى صحوة.',
    fields = '[{"id":"title","label":"اسم الفكرة أو النشاط","type":"short_text","required":true},{"id":"details","label":"اشرح الفكرة باختصار وما الهدف منها","type":"long_text","required":true},{"id":"scope","label":"النطاق","type":"select","required":true,"options":["جامعي","مركزي"]},{"id":"participate","label":"هل ترغب في المشاركة في تنفيذ الفكرة؟","type":"select","required":true,"options":["نعم، أرغب في قيادتها إذا كان مناسبًا","نعم، أرغب في المشاركة فقط","لا، أرغب فقط في الاقتراح"]}]'::jsonb
WHERE slug = 'activities-bank' AND revision = 1
