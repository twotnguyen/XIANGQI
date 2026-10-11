BEGIN;
SET LOCAL search_path=pg_catalog,public;
LOCK TABLE public.rooms IN ACCESS EXCLUSIVE MODE;
DO $$ BEGIN
 IF (SELECT pg_catalog.md5(pg_catalog.pg_get_functiondef('xiangqi_room.guard_settings()'::pg_catalog.regprocedure))) IS DISTINCT FROM 'cc010113700c96512b49314e0fe01886' THEN RAISE EXCEPTION 'Room settings guard differs from audited migration 000006'; END IF;
END $$;
-- Unknown legacy opening dates remain NULL; managed transitions record actual SQL time.
ALTER TABLE public.rooms ADD COLUMN public_opened_at timestamptz;
CREATE INDEX rooms_public_opened ON public.rooms(public_opened_at DESC,id DESC) WHERE visibility='PUBLIC' AND closed_at IS NULL AND invite_code IS NOT NULL;
CREATE OR REPLACE FUNCTION xiangqi_room.guard_settings() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$ BEGIN
 IF TG_OP='UPDATE' AND OLD.invite_code IS NOT NULL THEN
  IF NEW.invite_code IS NULL OR NEW.viewer_limit IS DISTINCT FROM OLD.viewer_limit OR NEW.time_control IS DISTINCT FROM OLD.time_control THEN RAISE EXCEPTION 'Room configuration is immutable'; END IF;
  IF NEW.invite_code IS DISTINCT FROM OLD.invite_code AND NOT(OLD.visibility='LOCKED' AND NEW.visibility IN('PUBLIC','CODE_ONLY')) THEN RAISE EXCEPTION 'Room code rotates only when unlocking'; END IF;
 END IF;
 IF NEW.invite_code IS NOT NULL AND (NEW.viewer_limit IS NULL OR NEW.time_control NOT IN(300,600,900)) THEN RAISE EXCEPTION 'Invalid managed room configuration'; END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION xiangqi_room.guard_settings() FROM PUBLIC,anon,authenticated;
COMMIT;
