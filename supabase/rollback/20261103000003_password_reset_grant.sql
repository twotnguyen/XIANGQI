BEGIN;
DO $$ BEGIN
  IF EXISTS(SELECT 1 FROM xiangqi_auth.password_recoveries WHERE reset_hash IS NOT NULL AND reset_expires_at>clock_timestamp()) THEN
    RAISE EXCEPTION 'Cannot remove an active password reset grant';
  END IF;
END $$;
ALTER TABLE xiangqi_auth.password_recoveries DROP COLUMN reset_operation_hash;
ALTER TABLE xiangqi_auth.password_recoveries DROP COLUMN reset_expires_at;
COMMIT;
