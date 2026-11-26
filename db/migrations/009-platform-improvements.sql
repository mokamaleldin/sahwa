-- Additive migration: inbox/relation/form removal flags.
ALTER TABLE sahwa_form_submissions ADD COLUMN IF NOT EXISTS archived_from_inbox_at timestamptz;
ALTER TABLE sahwa_form_submissions ADD COLUMN IF NOT EXISTS relation_archived_at timestamptz;
ALTER TABLE sahwa_form_definitions ADD COLUMN IF NOT EXISTS archived_at timestamptz;
