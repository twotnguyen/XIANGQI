BEGIN;

DROP INDEX IF EXISTS xiangqi_auth.app_sessions_user_created_idx;
ALTER TABLE xiangqi_auth.app_sessions DROP COLUMN IF EXISTS device_hash;

COMMIT;
