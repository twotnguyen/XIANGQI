BEGIN;
ALTER TABLE xiangqi_auth.login_attempts DROP CONSTRAINT login_attempts_username_key_check;
ALTER TABLE xiangqi_auth.login_attempts ADD CONSTRAINT login_attempts_identifier_key_check
  CHECK(username_key ~ '^[a-z0-9_]{3,20}$' OR username_key ~ '^email:[0-9a-f]{64}$');
COMMIT;
