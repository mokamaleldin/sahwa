CREATE TABLE IF NOT EXISTS sahwa_users (
  id uuid PRIMARY KEY,
  full_name varchar(120) NOT NULL,
  email varchar(254) NOT NULL UNIQUE CHECK (email = lower(email)),
  password_hash text NOT NULL,
  access_role text NOT NULL DEFAULT 'volunteer' CHECK (access_role IN ('admin', 'volunteer')),
  university varchar(120) NOT NULL,
  major varchar(120) NOT NULL DEFAULT '',
  study_year varchar(60) NOT NULL DEFAULT '',
  birth_date date,
  gender text NOT NULL DEFAULT '' CHECK (gender IN ('', 'شاب', 'طالبة')),
  team varchar(80) NOT NULL DEFAULT '',
  responsibility varchar(120) NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'نشط' CHECK (status IN ('نشط', 'غير نشط', 'خريج', 'متوقف مؤقتًا')),
  revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sahwa_sessions (
  token_hash char(64) PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES sahwa_users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS sahwa_sessions_user_idx ON sahwa_sessions(user_id);
CREATE INDEX IF NOT EXISTS sahwa_sessions_expiry_idx ON sahwa_sessions(expires_at);
CREATE TABLE IF NOT EXISTS sahwa_login_limits (
  key char(64) PRIMARY KEY,
  attempts integer NOT NULL,
  expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS sahwa_events (
  id uuid PRIMARY KEY,
  title varchar(160) NOT NULL,
  event_date date NOT NULL,
  responsible varchar(120) NOT NULL,
  attendance integer CHECK (attendance BETWEEN 0 AND 1000000),
  notes varchar(1000) NOT NULL DEFAULT '',
  revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
  created_by uuid REFERENCES sahwa_users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sahwa_events_date_idx ON sahwa_events(event_date DESC, created_at DESC);
