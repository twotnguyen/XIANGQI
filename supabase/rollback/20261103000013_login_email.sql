BEGIN;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM xiangqi_auth.login_attempts WHERE username_key LIKE 'email:%') THEN
    RAISE EXCEPTION 'Cannot roll back while email login attempt records exist';
  END IF;
END $$;
ALTER TABLE xiangqi_auth.login_attempts DROP CONSTRAINT login_attempts_identifier_key_check;
ALTER TABLE xiangqi_auth.login_attempts ADD CONSTRAINT login_attempts_username_key_check
  CHECK(username_key ~ '^[a-z0-9_]{3,20}$');
COMMIT;
