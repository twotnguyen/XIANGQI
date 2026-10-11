BEGIN;
DO $$ BEGIN
  IF EXISTS(SELECT 1 FROM xiangqi_auth.app_sessions) OR EXISTS(SELECT 1 FROM xiangqi_auth.login_attempts) THEN
    RAISE EXCEPTION 'Login rollback requires a reviewed backup and empty login data';
  END IF;
END $$;
DROP TABLE xiangqi_auth.app_sessions;
DROP TABLE xiangqi_auth.login_attempts;
COMMIT;
