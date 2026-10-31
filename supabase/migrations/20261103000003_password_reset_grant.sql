BEGIN;
ALTER TABLE xiangqi_auth.password_recoveries ADD COLUMN reset_expires_at timestamptz;
ALTER TABLE xiangqi_auth.password_recoveries ADD COLUMN reset_operation_hash text
  CHECK(reset_operation_hash IS NULL OR reset_operation_hash ~ '^[0-9a-f]{64}$');
UPDATE xiangqi_auth.password_recoveries SET reset_expires_at=expires_at WHERE reset_hash IS NOT NULL;
ALTER TABLE xiangqi_auth.password_recoveries ADD CONSTRAINT password_reset_deadline_pair
  CHECK((reset_hash IS NULL) = (reset_expires_at IS NULL));
ALTER TABLE xiangqi_auth.password_recoveries ADD CONSTRAINT password_reset_operation_grant
  CHECK(reset_operation_hash IS NULL OR reset_hash IS NOT NULL);
COMMIT;
