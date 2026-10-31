BEGIN;
DO $$ BEGIN
  IF EXISTS(SELECT 1 FROM public.profiles WHERE username_changed_at IS NOT NULL) THEN
    RAISE EXCEPTION 'Cannot remove an active username change history';
  END IF;
  IF EXISTS(SELECT 1 FROM xiangqi_auth.otp_sends WHERE attempted_at>clock_timestamp()-interval '1 hour') THEN
    RAISE EXCEPTION 'Cannot remove an active OTP quota';
  END IF;
END $$;
DROP TABLE xiangqi_auth.otp_sends;
ALTER TABLE public.profiles DROP COLUMN username_changed_at;
COMMIT;
