BEGIN;
SET LOCAL search_path=pg_catalog,public;
LOCK TABLE public.matches IN ACCESS EXCLUSIVE MODE;
CREATE TEMP TABLE outcome_guard (status text, outcome jsonb, ended_at timestamptz, created_at timestamptz, proposal jsonb) ON COMMIT DROP;
ALTER TABLE outcome_guard ADD CONSTRAINT expected CHECK ((((status = 'ACTIVE'::text) AND (outcome IS NULL) AND (ended_at IS NULL)) OR ((status = 'INTERRUPTED'::text) AND (ended_at IS NOT NULL) AND (ended_at >= created_at) AND (proposal IS NULL) AND (outcome IS NOT NULL) AND COALESCE(((jsonb_typeof(outcome) = 'object'::text) AND (outcome ? 'reason'::text) AND (outcome ? 'winner'::text) AND ((outcome ->> 'reason'::text) = ANY (ARRAY['BOTH_OFFLINE'::text, 'SERVER_RESTART'::text, 'AI_UNAVAILABLE'::text, 'ABORTED'::text])) AND (jsonb_typeof((outcome -> 'winner'::text)) = 'null'::text)), false)) OR ((status = 'FINISHED'::text) AND (ended_at IS NOT NULL) AND (ended_at >= created_at) AND (proposal IS NULL) AND (outcome IS NOT NULL) AND COALESCE(((jsonb_typeof(outcome) = 'object'::text) AND (outcome ? 'reason'::text) AND (outcome ? 'winner'::text) AND ((((outcome ->> 'reason'::text) = ANY (ARRAY['AGREED_DRAW'::text, 'REPETITION'::text, 'DRAW_REPETITION'::text, 'DRAW_NO_CAPTURE'::text, 'DRAW_AGREEMENT'::text])) AND (jsonb_typeof((outcome -> 'winner'::text)) = 'null'::text)) OR (((outcome ->> 'reason'::text) = ANY (ARRAY['CHECKMATE'::text, 'STALEMATE'::text, 'TIMEOUT'::text, 'RESIGN'::text, 'DISCONNECT'::text, 'INACTIVITY'::text])) AND ((outcome ->> 'winner'::text) = ANY (ARRAY['RED'::text, 'BLACK'::text])))) OR (((outcome ->> 'reason'::text) = 'PERPETUAL_CHECK'::text) AND (((outcome ->> 'winner'::text) = ANY (ARRAY['RED'::text, 'BLACK'::text])) OR (jsonb_typeof((outcome -> 'winner'::text)) = 'null'::text)))), false))));
DO $$ DECLARE actual text; expected text; BEGIN
 SELECT pg_get_constraintdef(oid) INTO actual FROM pg_constraint WHERE conrelid='public.matches'::regclass AND conname='matches_status_and_outcome_invariants' AND contype='c' AND convalidated;
 SELECT pg_get_constraintdef(oid) INTO expected FROM pg_constraint WHERE conrelid='pg_temp.outcome_guard'::regclass AND conname='expected';
 IF md5(actual) IS DISTINCT FROM md5(expected) THEN RAISE EXCEPTION 'Match outcome metadata differs from audited baseline'; END IF;
 ALTER TABLE public.matches DROP CONSTRAINT matches_status_and_outcome_invariants;
 EXECUTE 'ALTER TABLE public.matches ADD CONSTRAINT matches_status_and_outcome_invariants ' || replace(expected, '''DRAW_AGREEMENT''::text', '''DRAW_AGREEMENT''::text, ''DRAW_SIMULTANEOUS_DISCONNECT''::text');
END $$;
COMMIT;
