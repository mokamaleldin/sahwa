-- Personal owner account, e-mail login, and removal of the shared account's
-- sessions. Additive and re-runnable. Statements must not contain semicolons.

ALTER TABLE sahwa_accounts ALTER COLUMN volunteer_id DROP NOT NULL;
ALTER TABLE sahwa_accounts ADD COLUMN IF NOT EXISTS email varchar(254) CHECK (email IS NULL OR (email = lower(email) AND email LIKE '%_@_%'));
ALTER TABLE sahwa_accounts ADD COLUMN IF NOT EXISTS is_owner boolean NOT NULL DEFAULT false;
ALTER TABLE sahwa_accounts ADD COLUMN IF NOT EXISTS display_name varchar(120) NOT NULL DEFAULT '';
CREATE UNIQUE INDEX IF NOT EXISTS sahwa_accounts_email_unique ON sahwa_accounts(email) WHERE email IS NOT NULL;

-- The owner account itself is created at runtime from the server variables
-- SAHWA_OWNER_EMAIL and SAHWA_OWNER_PASSWORD_HASH, so no password hash is
-- ever stored in the repository.

-- The shared account no longer exists: end every shared session.
DELETE FROM sahwa_shared_sessions
