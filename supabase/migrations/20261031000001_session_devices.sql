BEGIN;

-- Opaque per-browser device id (HttpOnly cookie), stored as SHA-256 hex. Not a fingerprint.
ALTER TABLE xiangqi_auth.app_sessions
  ADD COLUMN device_hash text CHECK (device_hash IS NULL OR device_hash ~ '^[0-9a-f]{64}$');

CREATE INDEX app_sessions_user_created_idx
  ON xiangqi_auth.app_sessions (user_id, created_at DESC);

COMMIT;
