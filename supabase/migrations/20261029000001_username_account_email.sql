BEGIN;
-- Username-only members keep an immutable technical Auth credential; real contact email is tracked here.
DO $$ BEGIN
  IF to_regclass('xiangqi_auth.account_origins') IS NULL
    OR NOT EXISTS(SELECT 1 FROM pg_catalog.pg_trigger WHERE tgname='xiangqi_origin_immutable' AND tgrelid='xiangqi_auth.account_origins'::regclass)
    OR to_regclass('xiangqi_auth.username_accounts') IS NOT NULL THEN
    RAISE EXCEPTION 'Username account email migration preconditions differ';
  END IF;
END $$;
CREATE TABLE xiangqi_auth.username_accounts (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text CHECK(email IS NULL OR (email=lower(email) AND email NOT LIKE '%.xiangqi.invalid')),
  verified_at timestamptz,
  pending_email text CHECK(pending_email IS NULL OR (pending_email=lower(pending_email) AND pending_email NOT LIKE '%.xiangqi.invalid')),
  otp_hash text CHECK(otp_hash IS NULL OR otp_hash ~ '^[0-9a-f]{64}$'),
  last_sent_at timestamptz,
  expires_at timestamptz,
  attempts integer NOT NULL DEFAULT 0 CHECK(attempts BETWEEN 0 AND 5),
  CHECK((email IS NULL) = (verified_at IS NULL)),
  CHECK(pending_email IS NULL OR (verified_at IS NULL AND otp_hash IS NOT NULL AND expires_at IS NOT NULL)),
  CHECK(pending_email IS NOT NULL OR (otp_hash IS NULL AND expires_at IS NULL AND attempts=0))
);
-- Verified contact is never replaced or re-owned once set.
CREATE FUNCTION xiangqi_auth.guard_username_account() RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF NEW.user_id IS DISTINCT FROM OLD.user_id
    OR (OLD.email IS NOT NULL AND NEW.email IS DISTINCT FROM OLD.email)
    OR (OLD.verified_at IS NOT NULL AND NEW.verified_at IS DISTINCT FROM OLD.verified_at) THEN
    RAISE EXCEPTION 'Verified contact is immutable';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER xiangqi_username_account_immutable BEFORE UPDATE ON xiangqi_auth.username_accounts
FOR EACH ROW EXECUTE FUNCTION xiangqi_auth.guard_username_account();
-- Only the one-time technical -> verified key promotion on the same row is allowed.
CREATE FUNCTION xiangqi_auth.guard_origin_update() RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF NEW IS NOT DISTINCT FROM OLD THEN RETURN NEW; END IF;
  IF OLD.method='email' AND NEW.user_id=OLD.user_id AND NEW.method=OLD.method AND NEW.created_at=OLD.created_at
    AND OLD.email_key=OLD.user_id::text||'@username.xiangqi.invalid'
    AND NEW.email_key IS NOT NULL AND NEW.email_key<>OLD.email_key
    AND EXISTS(SELECT 1 FROM xiangqi_auth.username_accounts a WHERE a.user_id=OLD.user_id AND a.email=NEW.email_key AND a.verified_at IS NOT NULL) THEN
    RETURN NEW;
  END IF;
  RAISE EXCEPTION 'Actor origin is immutable';
END;
$$;
DROP TRIGGER xiangqi_origin_immutable ON xiangqi_auth.account_origins;
CREATE TRIGGER xiangqi_origin_immutable BEFORE UPDATE ON xiangqi_auth.account_origins
FOR EACH ROW EXECUTE FUNCTION xiangqi_auth.guard_origin_update();
REVOKE ALL ON FUNCTION xiangqi_auth.guard_username_account() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION xiangqi_auth.guard_origin_update() FROM PUBLIC,anon,authenticated;
ALTER TABLE xiangqi_auth.username_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE xiangqi_auth.username_accounts FORCE ROW LEVEL SECURITY;
REVOKE ALL ON xiangqi_auth.username_accounts FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE ON xiangqi_auth.username_accounts TO app_server;
CREATE POLICY username_account_server ON xiangqi_auth.username_accounts FOR ALL TO app_server USING(true) WITH CHECK(true);
GRANT UPDATE (email_key) ON xiangqi_auth.account_origins TO app_server;
COMMIT;
