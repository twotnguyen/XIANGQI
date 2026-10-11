-- Apply only before accepting new registrations; otherwise restore from the reviewed backup.
BEGIN;
DO $$ BEGIN
  IF EXISTS(SELECT 1 FROM xiangqi_auth.registration_intents)
    OR EXISTS(SELECT 1 FROM xiangqi_auth.registration_drafts)
    OR EXISTS(SELECT 1 FROM xiangqi_auth.username_reservations)
    OR EXISTS(SELECT 1 FROM public.profiles WHERE completed_at IS NOT NULL AND completed_at IS DISTINCT FROM created_at)
    OR EXISTS(SELECT 1 FROM public.profiles WHERE username IS NOT NULL AND username !~ '^[a-z0-9_]{3,24}$') THEN
    RAISE EXCEPTION 'Rollback requires backup review after registration writes';
  END IF;
END $$;
DROP TRIGGER xiangqi_email_immutable ON auth.users;
CREATE OR REPLACE FUNCTION public.guard_profile_updates()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  IF NEW.user_id <> OLD.user_id THEN
    RAISE EXCEPTION 'Cannot change user_id in profiles';
  END IF;

  IF OLD.username IS NOT NULL AND NEW.username IS DISTINCT FROM OLD.username THEN
    RAISE EXCEPTION 'Username is immutable once set';
  END IF;

  IF NEW.username IS NOT NULL AND NEW.username !~ '^[a-z0-9_]{3,24}$' THEN
    RAISE EXCEPTION 'Invalid username format';
  END IF;

  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_provider text;
  v_raw_username text;
  v_raw_display text;
  v_username text := NULL;
  v_display_name text;
  v_has_username_key boolean;
BEGIN
  v_provider := COALESCE(NEW.raw_app_meta_data->>'provider', 'email');
  v_has_username_key := (NEW.raw_user_meta_data ? 'signup_username');
  v_raw_username := NEW.raw_user_meta_data->>'signup_username';
  v_raw_display := NULLIF(btrim(NEW.raw_user_meta_data->>'signup_display_name'), '');

  -- If provider is email OR metadata explicitly contains signup_username:
  IF v_provider = 'email' OR v_has_username_key THEN
    IF v_raw_username IS NULL OR btrim(v_raw_username) = '' THEN
      RAISE EXCEPTION 'signup_username is required for email signup and cannot be blank';
    END IF;
    IF btrim(v_raw_username) !~ '^[a-z0-9_]{3,24}$' THEN
      RAISE EXCEPTION 'Invalid username format in signup metadata: %', v_raw_username;
    END IF;
    v_username := btrim(v_raw_username);
  ELSE
    -- Google / OAuth onboarding: username starts as NULL
    v_username := NULL;
  END IF;

  IF v_raw_display IS NOT NULL THEN
    v_display_name := substring(v_raw_display FROM 1 FOR 40);
  ELSE
    v_raw_display := NULLIF(btrim(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')), '');
    IF v_raw_display IS NOT NULL THEN
      v_display_name := substring(v_raw_display FROM 1 FOR 40);
    ELSE
      v_display_name := 'Người chơi';
    END IF;
  END IF;

  IF v_display_name IS NULL OR btrim(v_display_name) = '' THEN
    v_display_name := 'Người chơi';
  END IF;

  INSERT INTO public.profiles (user_id, username, display_name, created_at, updated_at)
  VALUES (NEW.id, v_username, v_display_name, now(), now());

  RETURN NEW;
END;
$function$
;
DROP INDEX public.profiles_username_lower_unique;
ALTER TABLE public.profiles DROP CONSTRAINT profiles_username_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_check CHECK(username IS NULL OR username ~ '^[a-z0-9_]{3,24}$');
ALTER TABLE public.profiles DROP COLUMN completed_at, DROP COLUMN registration_pending;
REVOKE INSERT,UPDATE ON public.profiles FROM app_server;
-- Table-level REVOKE also removes these pre-existing column grants.
GRANT UPDATE(username,display_name,updated_at) ON public.profiles TO app_server;
DO $$ BEGIN
  IF EXISTS(SELECT 1 FROM xiangqi_auth.role_provisioning WHERE grantor='postgres') THEN
    REVOKE app_server FROM postgres GRANTED BY postgres;
  END IF;
END $$;
DROP SCHEMA xiangqi_auth CASCADE;
COMMIT;
