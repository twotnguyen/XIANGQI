BEGIN;
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
DROP TABLE xiangqi_auth.username_challenges;
COMMIT;
