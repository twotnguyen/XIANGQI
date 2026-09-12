-- Migration 1: roles-private-profiles
-- 09-DATABASE-DESIGN.md: Section 4, 13, 15

-- 1. Setup role app_server and schema private
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_server') THEN
    CREATE ROLE app_server WITH LOGIN;
  END IF;
END $$;

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO app_server;
GRANT USAGE ON SCHEMA public TO app_server;

-- 2. public.profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid NOT NULL,
  username text NULL,
  display_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (user_id),
  CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES auth.users(id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT profiles_username_unique UNIQUE (username),
  CONSTRAINT profiles_username_check CHECK (
    username IS NULL OR username ~ '^[a-z0-9_]{3,24}$'
  ),
  CONSTRAINT profiles_display_name_check CHECK (
    char_length(display_name) BETWEEN 1 AND 40
    AND display_name = btrim(display_name)
    AND display_name <> ''
  )
);

CREATE INDEX IF NOT EXISTS profiles_username_pattern_idx
  ON public.profiles (username text_pattern_ops);

-- Guard trigger for public.profiles updates
CREATE OR REPLACE FUNCTION public.guard_profile_updates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

DROP TRIGGER IF EXISTS trg_guard_profile_updates ON public.profiles;
CREATE TRIGGER trg_guard_profile_updates
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_profile_updates();

-- Trigger for auth.users to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_raw_username text;
  v_raw_display text;
  v_username text := NULL;
  v_display_name text;
BEGIN
  v_raw_username := NULLIF(btrim(NEW.raw_user_meta_data->>'signup_username'), '');
  v_raw_display := NULLIF(btrim(NEW.raw_user_meta_data->>'signup_display_name'), '');

  IF v_raw_username IS NOT NULL AND v_raw_username ~ '^[a-z0-9_]{3,24}$' THEN
    v_username := v_raw_username;
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
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3. private.revoked_sessions
CREATE TABLE IF NOT EXISTS private.revoked_sessions (
  session_id uuid NOT NULL,
  user_id uuid NOT NULL,
  revoked_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  CONSTRAINT revoked_sessions_pkey PRIMARY KEY (session_id),
  CONSTRAINT revoked_sessions_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.profiles(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT revoked_sessions_expires_at_check CHECK (expires_at > revoked_at)
);

CREATE INDEX IF NOT EXISTS revoked_sessions_user_id_idx ON private.revoked_sessions (user_id);
CREATE INDEX IF NOT EXISTS revoked_sessions_expires_at_idx ON private.revoked_sessions (expires_at);

-- 4. private.is_auth_session_active
CREATE OR REPLACE FUNCTION private.is_auth_session_active(p_session_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_active boolean := false;
BEGIN
  IF EXISTS (
    SELECT 1 FROM auth.sessions
    WHERE id = p_session_id AND user_id = p_user_id
  ) AND NOT EXISTS (
    SELECT 1 FROM private.revoked_sessions
    WHERE session_id = p_session_id
  ) THEN
    v_active := true;
  END IF;

  RETURN v_active;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

REVOKE ALL ON FUNCTION private.is_auth_session_active(uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.is_auth_session_active(uuid, uuid) TO app_server;

-- 5. RLS & Grants for Migration 1
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

ALTER TABLE private.revoked_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.revoked_sessions FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.profiles FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE private.revoked_sessions FROM PUBLIC, anon, authenticated;

GRANT SELECT, UPDATE (username, display_name, updated_at) ON public.profiles TO app_server;
GRANT SELECT, INSERT, DELETE, UPDATE (expires_at) ON private.revoked_sessions TO app_server;

DROP POLICY IF EXISTS app_server_profiles ON public.profiles;
CREATE POLICY app_server_profiles ON public.profiles
  FOR ALL TO app_server USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS app_server_revoked_sessions ON private.revoked_sessions;
CREATE POLICY app_server_revoked_sessions ON private.revoked_sessions
  FOR ALL TO app_server USING (true) WITH CHECK (true);
