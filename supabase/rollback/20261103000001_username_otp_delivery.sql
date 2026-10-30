BEGIN;
ALTER TABLE xiangqi_auth.username_challenges
  DROP CONSTRAINT username_pending_delivery_pair,
  DROP COLUMN pending_request_hash,
  DROP COLUMN pending_otp_hash,
  DROP COLUMN last_issue_at;
COMMIT;