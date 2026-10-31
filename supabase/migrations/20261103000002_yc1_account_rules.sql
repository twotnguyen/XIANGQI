BEGIN;
ALTER TABLE public.profiles ADD COLUMN username_changed_at timestamptz;
-- Existing reservations expire exactly 30 days after a successful rename.
UPDATE public.profiles p SET username_changed_at=history.changed_at
FROM (
  SELECT owner_id,max(expires_at-interval '30 days') AS changed_at
  FROM xiangqi_auth.username_reservations
  WHERE expires_at-interval '30 days'<=clock_timestamp()
  GROUP BY owner_id
) history
WHERE p.user_id=history.owner_id;
CREATE TABLE xiangqi_auth.otp_sends (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_hash text NOT NULL CHECK(email_hash ~ '^[0-9a-f]{64}$'),
  attempted_at timestamptz NOT NULL
);
CREATE INDEX otp_sends_user_time ON xiangqi_auth.otp_sends(user_id,attempted_at);
CREATE INDEX otp_sends_email_time ON xiangqi_auth.otp_sends(email_hash,attempted_at);
ALTER TABLE xiangqi_auth.otp_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE xiangqi_auth.otp_sends FORCE ROW LEVEL SECURITY;
REVOKE ALL ON xiangqi_auth.otp_sends FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,DELETE ON xiangqi_auth.otp_sends TO app_server;
GRANT USAGE ON SEQUENCE xiangqi_auth.otp_sends_id_seq TO app_server;
CREATE POLICY otp_sends_server ON xiangqi_auth.otp_sends TO app_server USING(true) WITH CHECK(true);
COMMIT;
