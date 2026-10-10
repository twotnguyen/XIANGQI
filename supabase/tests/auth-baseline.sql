DO $$ BEGIN
  IF current_user='postgres' THEN RAISE EXCEPTION 'Isolated tests require a superuser test administrator distinct from postgres'; END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='app_server') THEN CREATE ROLE app_server NOLOGIN; END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN CREATE ROLE authenticated NOLOGIN; END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='anon') THEN CREATE ROLE anon NOLOGIN; END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='postgres') THEN CREATE ROLE postgres NOLOGIN CREATEROLE BYPASSRLS; END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='supabase_admin') THEN CREATE ROLE supabase_admin NOLOGIN SUPERUSER; END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='supabase_auth_admin') THEN CREATE ROLE supabase_auth_admin NOLOGIN; END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='service_role') THEN CREATE ROLE service_role NOLOGIN; END IF;
END $$;
DO $$ DECLARE row record; BEGIN
  FOR row IN SELECT r.rolname FROM pg_auth_members m JOIN pg_roles g ON g.oid=m.roleid JOIN pg_roles u ON u.oid=m.member JOIN pg_roles r ON r.oid=m.grantor WHERE g.rolname='app_server' AND u.rolname='postgres' LOOP
    EXECUTE format('REVOKE app_server FROM postgres GRANTED BY %I',row.rolname);
  END LOOP;
END $$;
DROP SCHEMA IF EXISTS xiangqi_auth CASCADE;
DROP SCHEMA IF EXISTS auth CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
CREATE SCHEMA auth;
CREATE TABLE auth.users(id uuid PRIMARY KEY, email text UNIQUE, email_change text DEFAULT '', email_confirmed_at timestamptz, raw_user_meta_data jsonb DEFAULT '{}', raw_app_meta_data jsonb DEFAULT '{}', created_at timestamptz DEFAULT now());
CREATE TABLE public.profiles(user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON UPDATE RESTRICT ON DELETE RESTRICT, id uuid GENERATED ALWAYS AS (user_id) STORED, username text CONSTRAINT profiles_username_unique UNIQUE CHECK(username IS NULL OR username ~ '^[a-z0-9_]{3,24}$'), display_name text NOT NULL CONSTRAINT profiles_display_name_check CHECK(char_length(display_name) BETWEEN 1 AND 40 AND display_name=btrim(display_name) AND display_name<>''), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX profiles_username_pattern_idx ON public.profiles(username text_pattern_ops);
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
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
CREATE TRIGGER trg_guard_profile_updates BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.guard_profile_updates();
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
CREATE POLICY app_server_profiles ON public.profiles TO app_server USING(true) WITH CHECK(true);
GRANT SELECT ON public.profiles TO app_server;
GRANT UPDATE(username,display_name,updated_at) ON public.profiles TO app_server;
ALTER TABLE auth.users OWNER TO supabase_auth_admin;
ALTER TABLE public.profiles OWNER TO postgres;
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;
ALTER FUNCTION public.guard_profile_updates() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.handle_new_user(),public.guard_profile_updates() FROM PUBLIC,anon,authenticated,app_server;
GRANT EXECUTE ON FUNCTION public.handle_new_user(),public.guard_profile_updates() TO postgres,service_role;
ALTER SCHEMA auth OWNER TO supabase_admin;
REVOKE ALL ON SCHEMA auth FROM PUBLIC,app_server;
GRANT USAGE ON SCHEMA auth TO postgres,supabase_auth_admin;
GRANT USAGE,CREATE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO app_server;
GRANT CREATE ON DATABASE xiangqi_auth_test TO postgres;
GRANT SELECT ON auth.users TO postgres WITH GRANT OPTION;
GRANT TRIGGER,REFERENCES ON auth.users TO postgres;
GRANT app_server TO supabase_admin WITH ADMIN TRUE;
SET ROLE supabase_admin;
GRANT app_server TO postgres WITH ADMIN TRUE, INHERIT FALSE, SET FALSE GRANTED BY supabase_admin;
RESET ROLE;
