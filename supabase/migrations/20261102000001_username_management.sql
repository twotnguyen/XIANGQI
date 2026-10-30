BEGIN;
-- OTP proofs for username change (US-P2-20) and username recovery (US-P2-21); one live proof per user and purpose.
CREATE TABLE xiangqi_auth.username_challenges (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  purpose text NOT NULL CHECK(purpose IN ('username-change','username-recovery')),
  request_hash text NOT NULL UNIQUE CHECK(request_hash ~ '^[0-9a-f]{64}$'),
  contact_email text NOT NULL CHECK(contact_email=lower(contact_email) AND contact_email NOT LIKE '%.xiangqi.invalid'),
  verified_hash text CHECK(verified_hash IS NULL OR verified_hash ~ '^[0-9a-f]{64}$'),
  verified_expires_at timestamptz,
  otp_hash text CHECK(otp_hash IS NULL OR otp_hash ~ '^[0-9a-f]{64}$'),
  sent_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts integer NOT NULL DEFAULT 0 CHECK(attempts BETWEEN 0 AND 5),
  PRIMARY KEY(user_id,purpose),
  CHECK(expires_at=sent_at + interval '180 seconds'),
  CHECK((verified_hash IS NULL) = (verified_expires_at IS NULL)),
  CHECK(verified_hash IS NULL OR otp_hash IS NULL),
  CHECK(verified_hash IS NULL OR purpose='username-change')
);
ALTER TABLE xiangqi_auth.username_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE xiangqi_auth.username_challenges FORCE ROW LEVEL SECURITY;
REVOKE ALL ON xiangqi_auth.username_challenges FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON xiangqi_auth.username_challenges TO app_server;
CREATE POLICY username_challenge_server ON xiangqi_auth.username_challenges TO app_server USING(true) WITH CHECK(true);

-- Replaces the 20261011 guard: a rename needs this user's live verified username-change proof (US-P2-20).
-- Invoker rights: app_server reads the proof through its own granted policy; no definer bypass of RLS.
CREATE OR REPLACE FUNCTION public.guard_profile_updates() RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF NEW.user_id <> OLD.user_id THEN RAISE EXCEPTION 'Cannot change user_id in profiles'; END IF;
  IF OLD.username IS NOT NULL AND NEW.username IS DISTINCT FROM OLD.username AND (
    NEW.username IS NULL OR NOT EXISTS(
      SELECT 1 FROM xiangqi_auth.username_challenges c
      WHERE c.user_id=OLD.user_id AND c.purpose='username-change'
        AND c.verified_hash IS NOT NULL AND c.verified_expires_at > pg_catalog.now())
  ) THEN
    RAISE EXCEPTION 'Username change requires a verified proof';
  END IF;
  IF NEW.username IS NOT NULL AND NEW.username !~ '^[a-zA-Z0-9_]{3,20}$' THEN
    RAISE EXCEPTION 'Invalid username format';
  END IF;
  IF OLD.completed_at IS NOT NULL AND NEW.completed_at IS DISTINCT FROM OLD.completed_at THEN
    RAISE EXCEPTION 'Cannot remove completed registration';
  END IF;
  RETURN NEW;
END;
$$;
COMMIT;
