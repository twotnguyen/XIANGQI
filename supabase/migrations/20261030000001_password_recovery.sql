BEGIN;
ALTER TABLE xiangqi_auth.app_sessions ADD COLUMN password_change_hash text
  CHECK(password_change_hash IS NULL OR password_change_hash ~ '^[0-9a-f]{64}$');
GRANT UPDATE(password_change_hash) ON xiangqi_auth.app_sessions TO app_server;
CREATE TABLE xiangqi_auth.password_recoveries (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  request_hash text NOT NULL UNIQUE CHECK(request_hash ~ '^[0-9a-f]{64}$'),
  contact_email text NOT NULL CHECK(contact_email=lower(contact_email) AND contact_email NOT LIKE '%.xiangqi.invalid'),
  otp_hash text CHECK(otp_hash IS NULL OR otp_hash ~ '^[0-9a-f]{64}$'),
  sent_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts integer NOT NULL DEFAULT 0 CHECK(attempts BETWEEN 0 AND 5),
  reset_hash text CHECK(reset_hash IS NULL OR reset_hash ~ '^[0-9a-f]{64}$'),
  consumed_at timestamptz,
  CHECK(expires_at=sent_at + interval '180 seconds'),
  CHECK(otp_hash IS NULL OR reset_hash IS NULL),
  CHECK(consumed_at IS NULL OR (otp_hash IS NULL AND reset_hash IS NULL))
);
ALTER TABLE xiangqi_auth.password_recoveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE xiangqi_auth.password_recoveries FORCE ROW LEVEL SECURITY;
REVOKE ALL ON xiangqi_auth.password_recoveries FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON xiangqi_auth.password_recoveries TO app_server;
CREATE POLICY password_recovery_server ON xiangqi_auth.password_recoveries TO app_server USING(true) WITH CHECK(true);
COMMIT;
