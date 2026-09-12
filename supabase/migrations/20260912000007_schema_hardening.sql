-- Migration 7: schema-hardening
-- Addresses review findings on PR #6:
-- 1. [P1] Clock constraint must require non-negative integer runningSinceEpochMs when clock is present (no NULL/missing allowed)
-- 2. [P2] Fix SQL NULL bypass in match_moves.move (reject move = '{}')
-- 3. [P2] Fix SQL NULL bypass in matches AI mode (reject AI match with ai_level = NULL)
-- 4. [P2] Fix signup trigger: reject email signup with missing, empty, or whitespace username

-- 1. Harden matches clock check
ALTER TABLE public.matches
  DROP CONSTRAINT IF EXISTS matches_clock_json_check;

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
      AND clock ? 'runningSinceEpochMs'
      AND jsonb_typeof(clock->'runningSinceEpochMs') = 'number'
      AND (clock->>'runningSinceEpochMs')::bigint >= 0,
      false
    )
  );

-- 2. Harden matches mode invariants check against SQL NULL
ALTER TABLE public.matches
  DROP CONSTRAINT IF EXISTS matches_mode_invariants;

ALTER TABLE public.matches
  ADD CONSTRAINT matches_mode_invariants CHECK (
    COALESCE(
      (
        mode = 'ONLINE'
        AND room_id IS NOT NULL
        AND red_user_id IS NOT NULL
        AND black_user_id IS NOT NULL
        AND red_user_id <> black_user_id
        AND ai_side IS NULL
        AND ai_level IS NULL
      )
      OR
      (
        mode = 'AI'
        AND room_id IS NULL
        AND ai_level IS NOT NULL
        AND ai_level IN ('EASY', 'MEDIUM', 'HARD')
        AND ai_side IS NOT NULL
        AND (
          (ai_side = 'RED' AND red_user_id IS NULL AND black_user_id IS NOT NULL)
          OR
          (ai_side = 'BLACK' AND black_user_id IS NULL AND red_user_id IS NOT NULL)
        )
      ),
      false
    )
  );

-- 3. Harden match_moves.move JSON check against SQL NULL (reject move = '{}')
ALTER TABLE public.match_moves
  DROP CONSTRAINT IF EXISTS match_moves_move_json_check;

ALTER TABLE public.match_moves
  ADD CONSTRAINT match_moves_move_json_check CHECK (
    COALESCE(
      jsonb_typeof(move) = 'object'
      AND move ? 'from'
      AND move ? 'to'
      AND jsonb_typeof(move->'from') = 'object'
      AND jsonb_typeof(move->'to') = 'object'
      AND (move->'from' ? 'x') AND (move->'from' ? 'y')
      AND (move->'to' ? 'x') AND (move->'to' ? 'y')
      AND (move->'from'->>'x') ~ '^[0-8]$'
      AND (move->'from'->>'y') ~ '^[0-9]$'
      AND (move->'to'->>'x') ~ '^[0-8]$'
      AND (move->'to'->>'y') ~ '^[0-9]$'
      AND NOT (move->'from'->>'x' = move->'to'->>'x' AND move->'from'->>'y' = move->'to'->>'y'),
      false
    )
  );

-- 4. Harden handle_new_user to reject blank/missing username for email signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
