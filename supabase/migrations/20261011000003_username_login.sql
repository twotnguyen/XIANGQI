BEGIN;
-- App-owned proof enforces fixed deadlines even after a Supabase token refresh.
CREATE TABLE xiangqi_auth.app_sessions (
  token_hash text PRIMARY KEY CHECK(token_hash ~ '^[0-9a-f]{64}$'),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  remember boolean NOT NULL,
  revoked_at timestamptz,
  CHECK(expires_at = created_at + CASE WHEN remember THEN interval '720 hours' ELSE interval '12 hours' END)
);
CREATE INDEX app_sessions_user_idx ON xiangqi_auth.app_sessions(user_id);
CREATE INDEX app_sessions_expiry_idx ON xiangqi_auth.app_sessions(expires_at);
ALTER TABLE xiangqi_auth.app_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE xiangqi_auth.app_sessions FORCE ROW LEVEL SECURITY;
REVOKE ALL ON xiangqi_auth.app_sessions FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,DELETE ON xiangqi_auth.app_sessions TO app_server;
GRANT UPDATE(revoked_at) ON xiangqi_auth.app_sessions TO app_server;
CREATE POLICY app_server_sessions ON xiangqi_auth.app_sessions TO app_server USING(true) WITH CHECK(true);
CREATE TABLE xiangqi_auth.login_attempts (
  username_key text PRIMARY KEY CHECK(username_key ~ '^[a-z0-9_]{3,20}$'),
  failures timestamptz[] NOT NULL DEFAULT '{}',
  blocked_until timestamptz,
  CHECK(cardinality(failures)<=5 AND array_position(failures,NULL) IS NULL)
);
ALTER TABLE xiangqi_auth.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE xiangqi_auth.login_attempts FORCE ROW LEVEL SECURITY;
REVOKE ALL ON xiangqi_auth.login_attempts FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON xiangqi_auth.login_attempts TO app_server;
CREATE POLICY app_server_login_attempts ON xiangqi_auth.login_attempts TO app_server USING(true) WITH CHECK(true);
COMMIT;
