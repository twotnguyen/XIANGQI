BEGIN;
-- Remove only password operation proofs; preserve credentials, accounts and sessions.
DROP TABLE xiangqi_auth.password_recoveries;
ALTER TABLE xiangqi_auth.app_sessions DROP COLUMN password_change_hash;
COMMIT;
