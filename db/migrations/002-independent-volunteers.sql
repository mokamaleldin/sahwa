CREATE TABLE IF NOT EXISTS sahwa_volunteers (
  id uuid PRIMARY KEY,
  full_name varchar(120) NOT NULL,
  university varchar(120) NOT NULL,
  birth_date date,
  gender text NOT NULL CHECK (gender IN ('', 'شاب', 'بنت')),
  status text NOT NULL CHECK (status IN ('نشط', 'غير نشط', 'خريج', 'متوقف مؤقتًا')),
  team varchar(80) NOT NULL DEFAULT '',
  responsibility varchar(120) NOT NULL DEFAULT '',
  phone varchar(30) NOT NULL DEFAULT '',
  major varchar(120) NOT NULL DEFAULT '',
  study_year varchar(60) NOT NULL DEFAULT '',
  revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO sahwa_volunteers (id,full_name,university,birth_date,gender,status,team,responsibility,major,study_year,revision,created_at,updated_at)
SELECT id,full_name,university,birth_date,CASE WHEN gender='طالبة' THEN 'بنت' ELSE gender END,status,team,responsibility,major,study_year,revision,created_at,updated_at
FROM sahwa_users WHERE email <> current_setting('sahwa.shared_email')
ON CONFLICT (id) DO NOTHING;
CREATE TABLE IF NOT EXISTS sahwa_shared_sessions (
  token_hash char(64) PRIMARY KEY,
  account_version char(64) NOT NULL,
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS sahwa_shared_sessions_expiry_idx ON sahwa_shared_sessions(expires_at);
ALTER TABLE sahwa_events ALTER COLUMN event_date DROP NOT NULL;
ALTER TABLE sahwa_events ADD COLUMN IF NOT EXISTS responsible_id uuid REFERENCES sahwa_volunteers(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS sahwa_events_responsible_idx ON sahwa_events(responsible_id);
UPDATE sahwa_events e SET responsible_id=(SELECT v.id FROM sahwa_volunteers v WHERE v.full_name=e.responsible LIMIT 1)
WHERE e.responsible_id IS NULL AND (SELECT count(*) FROM sahwa_volunteers v WHERE v.full_name=e.responsible)=1;
