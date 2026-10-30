BEGIN;
-- Preserve the live proof while SMTP is in flight; only its matching delivery may replace it.
ALTER TABLE xiangqi_auth.username_challenges
  ADD COLUMN pending_request_hash text CHECK(pending_request_hash IS NULL OR pending_request_hash ~ '^[0-9a-f]{64}$'),
  ADD COLUMN pending_otp_hash text CHECK(pending_otp_hash IS NULL OR pending_otp_hash ~ '^[0-9a-f]{64}$'),
  ADD COLUMN last_issue_at timestamptz,
  ADD CONSTRAINT username_pending_delivery_pair CHECK((pending_request_hash IS NULL) = (pending_otp_hash IS NULL));
COMMIT;