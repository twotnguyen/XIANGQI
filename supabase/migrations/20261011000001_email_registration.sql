BEGIN;
-- Upgrade the audited September schema; preserve verified existing accounts.
ALTER TABLE public.profiles ADD COLUMN completed_at timestamptz;
ALTER TABLE public.profiles ADD COLUMN registration_pending boolean NOT NULL DEFAULT true;
ALTER TABLE public.profiles DROP CONSTRAINT profiles_username_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_check
  CHECK (username IS NULL OR username ~ '^[a-zA-Z0-9_]{3,20}$');
CREATE UNIQUE INDEX profiles_username_lower_unique ON public.profiles (lower(username)) WHERE username IS NOT NULL;
UPDATE public.profiles p SET completed_at = p.created_at, registration_pending = false
FROM auth.users u WHERE u.id = p.user_id AND u.email_confirmed_at IS NOT NULL
  AND p.username ~ '^[a-zA-Z0-9_]{3,20}$';

-- Auth records may exist while email confirmation is pending; no username reservation.
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  RETURN NEW;
END;
$$;
CREATE OR REPLACE FUNCTION public.guard_profile_updates() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NEW.user_id <> OLD.user_id THEN RAISE EXCEPTION 'Cannot change user_id in profiles'; END IF;
  IF OLD.username IS NOT NULL AND NEW.username IS DISTINCT FROM OLD.username THEN
    RAISE EXCEPTION 'Username is immutable once set';
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

CREATE SCHEMA xiangqi_auth;
REVOKE ALL ON SCHEMA xiangqi_auth FROM PUBLIC;
-- Definer view exposes only the columns the application needs, without auth schema access.
CREATE VIEW xiangqi_auth.accounts WITH (security_barrier=true) AS
  SELECT id,email,email_confirmed_at,raw_user_meta_data,created_at FROM auth.users;
ALTER VIEW xiangqi_auth.accounts OWNER TO postgres;
REVOKE ALL ON xiangqi_auth.accounts FROM PUBLIC,anon,authenticated;
GRANT SELECT ON xiangqi_auth.accounts TO app_server;

-- Remember only this migration's grant, never overwrite the platform owner's membership.
CREATE TABLE xiangqi_auth.role_provisioning (grantor name PRIMARY KEY CHECK(grantor='postgres'));
ALTER TABLE xiangqi_auth.role_provisioning ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON xiangqi_auth.role_provisioning FROM PUBLIC,anon,authenticated,app_server;
DO $$ BEGIN
  IF current_user='postgres' AND NOT pg_has_role(current_user,'app_server','SET') THEN
    IF EXISTS(SELECT 1 FROM pg_auth_members m JOIN pg_roles g ON g.oid=m.roleid JOIN pg_roles u ON u.oid=m.member JOIN pg_roles r ON r.oid=m.grantor WHERE g.rolname='app_server' AND u.rolname='postgres' AND r.rolname='postgres') THEN
      RAISE EXCEPTION 'Existing postgres grant requires membership review';
    END IF;
    GRANT app_server TO postgres WITH INHERIT FALSE, SET TRUE, ADMIN FALSE GRANTED BY postgres;
    INSERT INTO xiangqi_auth.role_provisioning VALUES('postgres');
  END IF;
  IF NOT pg_has_role(current_user,'app_server','SET') THEN
    RAISE EXCEPTION 'Runtime login cannot SET ROLE app_server';
  END IF;
END $$;
CREATE TABLE xiangqi_auth.registration_intents (
  email text PRIMARY KEY,
  nonce text NOT NULL UNIQUE CHECK(length(nonce)=43),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL
);
ALTER TABLE xiangqi_auth.registration_intents ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON xiangqi_auth.registration_intents FROM PUBLIC;
CREATE TABLE xiangqi_auth.registration_drafts (
  token_hash text PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  username text NOT NULL CHECK(username ~ '^[a-zA-Z0-9_]{3,20}$'),
  created_at timestamptz NOT NULL,
  last_sent_at timestamptz NOT NULL
);
ALTER TABLE xiangqi_auth.registration_drafts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON xiangqi_auth.registration_drafts FROM PUBLIC;
CREATE TABLE xiangqi_auth.username_reservations (
  username_key text PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL
);
ALTER TABLE xiangqi_auth.username_reservations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON xiangqi_auth.username_reservations FROM PUBLIC;

CREATE FUNCTION xiangqi_auth.guard_email_immutable() RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF OLD.email IS NOT NULL AND (NEW.email IS DISTINCT FROM OLD.email
     OR (NEW.email_change IS DISTINCT FROM OLD.email_change AND COALESCE(NEW.email_change, '') <> '')) THEN
    RAISE EXCEPTION 'Email is immutable';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER xiangqi_email_immutable BEFORE UPDATE ON auth.users
FOR EACH ROW EXECUTE FUNCTION xiangqi_auth.guard_email_immutable();
GRANT USAGE ON SCHEMA public, xiangqi_auth TO app_server;
GRANT SELECT,INSERT,UPDATE ON public.profiles TO app_server;
GRANT SELECT,INSERT,UPDATE,DELETE ON xiangqi_auth.registration_intents,xiangqi_auth.registration_drafts,xiangqi_auth.username_reservations TO app_server;
CREATE POLICY app_server_intents ON xiangqi_auth.registration_intents TO app_server USING(true) WITH CHECK(true);
CREATE POLICY app_server_drafts ON xiangqi_auth.registration_drafts TO app_server USING(true) WITH CHECK(true);
CREATE POLICY app_server_username_reservations ON xiangqi_auth.username_reservations TO app_server USING(true) WITH CHECK(true);
DO $$ BEGIN
  IF NOT has_schema_privilege('app_server','xiangqi_auth','USAGE')
    OR NOT has_table_privilege('app_server','xiangqi_auth.accounts','SELECT')
    OR NOT has_table_privilege('app_server','public.profiles','INSERT')
    OR NOT has_table_privilege('app_server','public.profiles','UPDATE')
    OR NOT has_table_privilege('app_server','xiangqi_auth.registration_intents','INSERT')
    OR NOT has_table_privilege('app_server','xiangqi_auth.registration_drafts','INSERT')
    OR NOT has_table_privilege('app_server','xiangqi_auth.username_reservations','SELECT') THEN
    RAISE EXCEPTION 'Registration grants failed';
  END IF;
END $$;
COMMIT;
