-- Migration 6: schema-fixes
-- Addresses review findings:
-- 1. [P1] Add DISCONNECT outcome reason and tie status to outcome reasons
-- 2. [P2] Harden matches JSONB checks (position, clock) against empty objects and invalid types
-- 3. [P2] Harden handle_new_user trigger to reject invalid signup_username instead of silent NULL
-- 4. [P2] Remove error swallowing in private.is_auth_session_active
-- 5. Revoke EXECUTE on SECURITY DEFINER triggers from PUBLIC/anon/authenticated

-- 1. Harden matches constraints
ALTER TABLE public.matches
  DROP CONSTRAINT IF EXISTS matches_position_json_check,
  DROP CONSTRAINT IF EXISTS matches_clock_json_check,
  DROP CONSTRAINT IF EXISTS matches_outcome_json_check,
  DROP CONSTRAINT IF EXISTS matches_status_invariants;

ALTER TABLE public.matches
  ADD CONSTRAINT matches_position_json_check CHECK (
    COALESCE(
      jsonb_typeof(position) = 'object'
      AND position ? 'board'
      AND jsonb_typeof(position->'board') = 'array'
      AND jsonb_array_length(position->'board') = 90
      AND position ? 'turn'
      AND (position->>'turn') IN ('RED', 'BLACK'),
      false
    )
  );

ALTER TABLE public.matches
  ADD CONSTRAINT matches_clock_json_check CHECK (
    clock IS NULL OR COALESCE(
      jsonb_typeof(clock) = 'object'
      AND clock ? 'redMs'
      AND jsonb_typeof(clock->'redMs') = 'number'
      AND (clock->>'redMs')::bigint >= 0
      AND clock ? 'blackMs'
      AND jsonb_typeof(clock->'blackMs') = 'number'
      AND (clock->>'blackMs')::bigint >= 0
      AND (
        NOT (clock ? 'runningSinceEpochMs')
        OR (clock->'runningSinceEpochMs') IS NULL
        OR jsonb_typeof(clock->'runningSinceEpochMs') = 'null'
        OR (
          jsonb_typeof(clock->'runningSinceEpochMs') = 'number'
          AND (clock->>'runningSinceEpochMs')::bigint >= 0
        )
      ),
      false
    )
  );

ALTER TABLE public.matches
  ADD CONSTRAINT matches_status_and_outcome_invariants CHECK (
    (
      status = 'ACTIVE'
      AND outcome IS NULL
      AND ended_at IS NULL
      AND (proposal IS NULL OR (mode = 'ONLINE' AND jsonb_typeof(proposal) = 'object'))
    )
    OR
    (
      status = 'INTERRUPTED'
      AND ended_at IS NOT NULL
      AND ended_at >= created_at
      AND proposal IS NULL
      AND outcome IS NOT NULL
      AND COALESCE(
        jsonb_typeof(outcome) = 'object'
        AND (outcome->>'reason') IN ('BOTH_OFFLINE', 'SERVER_RESTART', 'AI_UNAVAILABLE')
        AND (outcome->'winner' IS NULL OR jsonb_typeof(outcome->'winner') = 'null'),
        false
      )
    )
    OR
    (
      status = 'FINISHED'
      AND ended_at IS NOT NULL
      AND ended_at >= created_at
      AND proposal IS NULL
      AND outcome IS NOT NULL
      AND COALESCE(
        jsonb_typeof(outcome) = 'object'
        AND (
          (
            (outcome->>'reason') IN ('AGREED_DRAW', 'REPETITION')
            AND (outcome->'winner' IS NULL OR jsonb_typeof(outcome->'winner') = 'null')
          )
          OR
          (
            (outcome->>'reason') IN ('CHECKMATE', 'STALEMATE', 'TIMEOUT', 'RESIGN', 'DISCONNECT')
            AND (outcome->>'winner') IN ('RED', 'BLACK')
          )
        ),
        false
      )
    )
  );

-- 2. Harden handle_new_user to reject invalid signup_username
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

  IF v_raw_username IS NOT NULL THEN
    IF v_raw_username !~ '^[a-z0-9_]{3,24}$' THEN
      RAISE EXCEPTION 'Invalid username format in signup metadata: %', v_raw_username;
    END IF;
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

-- 3. Remove exception swallowing from private.is_auth_session_active
CREATE OR REPLACE FUNCTION private.is_auth_session_active(p_session_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.sessions
    WHERE id = p_session_id AND user_id = p_user_id
  ) AND NOT EXISTS (
    SELECT 1 FROM private.revoked_sessions
    WHERE session_id = p_session_id
  );
END;
$$;

-- 4. Revoke excessive EXECUTE on trigger functions
REVOKE ALL ON FUNCTION public.guard_profile_updates() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.guard_match_updates() FROM PUBLIC, anon, authenticated;
