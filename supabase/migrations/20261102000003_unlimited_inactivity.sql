BEGIN;
SET LOCAL search_path=pg_catalog,public;
LOCK TABLE public.rooms,public.matches IN ACCESS EXCLUSIVE MODE;
-- time_control=0 keeps legacy NULL clock (AI/baseline); ONLINE unlimited rooms store a zero anchor clock, all other shapes are unchanged.
CREATE OR REPLACE FUNCTION xiangqi_room.guard_settings() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$ BEGIN
 IF TG_OP='UPDATE' AND OLD.invite_code IS NOT NULL THEN
  IF NEW.invite_code IS NULL OR NEW.viewer_limit IS DISTINCT FROM OLD.viewer_limit OR NEW.time_control IS DISTINCT FROM OLD.time_control THEN RAISE EXCEPTION 'Room configuration is immutable'; END IF;
  IF NEW.invite_code IS DISTINCT FROM OLD.invite_code AND NOT(OLD.visibility='LOCKED' AND NEW.visibility IN('PUBLIC','CODE_ONLY')) THEN RAISE EXCEPTION 'Room code rotates only when unlocking'; END IF;
 END IF;
 IF NEW.invite_code IS NOT NULL AND (NEW.viewer_limit IS NULL OR NEW.time_control NOT IN(0,300,600,900)) THEN RAISE EXCEPTION 'Invalid managed room configuration'; END IF;
 RETURN NEW;
END $$;
ALTER TABLE public.matches ADD COLUMN inactivity_extensions smallint NOT NULL DEFAULT 0 CHECK (inactivity_extensions BETWEEN 0 AND 2);
ALTER TABLE public.matches DROP CONSTRAINT matches_clock_presence_check;
ALTER TABLE public."matches" ADD CONSTRAINT "matches_clock_presence_check" CHECK (((time_control = 0) AND (clock IS NULL)) OR ((time_control > 0) AND (clock IS NOT NULL)) OR ((mode = 'ONLINE'::text) AND (time_control = 0) AND (clock IS NOT NULL) AND ((clock -> 'redMs'::text) = '0'::jsonb) AND ((clock -> 'blackMs'::text) = '0'::jsonb)));
ALTER TABLE public.matches DROP CONSTRAINT matches_status_and_outcome_invariants;
ALTER TABLE public."matches" ADD CONSTRAINT "matches_status_and_outcome_invariants" CHECK ((((status = 'ACTIVE'::text) AND (outcome IS NULL) AND (ended_at IS NULL)) OR ((status = 'INTERRUPTED'::text) AND (ended_at IS NOT NULL) AND (ended_at >= created_at) AND (proposal IS NULL) AND (outcome IS NOT NULL) AND COALESCE(((jsonb_typeof(outcome) = 'object'::text) AND (outcome ? 'reason'::text) AND (outcome ? 'winner'::text) AND ((outcome ->> 'reason'::text) = ANY (ARRAY['BOTH_OFFLINE'::text, 'SERVER_RESTART'::text, 'AI_UNAVAILABLE'::text])) AND (jsonb_typeof((outcome -> 'winner'::text)) = 'null'::text)), false)) OR ((status = 'FINISHED'::text) AND (ended_at IS NOT NULL) AND (ended_at >= created_at) AND (proposal IS NULL) AND (outcome IS NOT NULL) AND COALESCE(((jsonb_typeof(outcome) = 'object'::text) AND (outcome ? 'reason'::text) AND (outcome ? 'winner'::text) AND ((((outcome ->> 'reason'::text) = ANY (ARRAY['AGREED_DRAW'::text, 'REPETITION'::text, 'DRAW_REPETITION'::text, 'DRAW_NO_CAPTURE'::text, 'DRAW_AGREEMENT'::text])) AND (jsonb_typeof((outcome -> 'winner'::text)) = 'null'::text)) OR (((outcome ->> 'reason'::text) = ANY (ARRAY['CHECKMATE'::text, 'STALEMATE'::text, 'TIMEOUT'::text, 'RESIGN'::text, 'DISCONNECT'::text, 'INACTIVITY'::text])) AND ((outcome ->> 'winner'::text) = ANY (ARRAY['RED'::text, 'BLACK'::text])))) OR (((outcome ->> 'reason'::text) = 'PERPETUAL_CHECK'::text) AND (((outcome ->> 'winner'::text) = ANY (ARRAY['RED'::text, 'BLACK'::text])) OR (jsonb_typeof((outcome -> 'winner'::text)) = 'null'::text)))), false))));
COMMIT;
