BEGIN;
LOCK TABLE public.matches, xiangqi_room.match_undo_offers, public.match_events IN ACCESS EXCLUSIVE MODE;
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM xiangqi_room.match_undo_offers) OR EXISTS (SELECT 1 FROM public.match_events WHERE type='STILL_HERE') THEN
   RAISE EXCEPTION 'Online undo or still-here data exists; rollback would lose history';
 END IF;
END $$;
ALTER TABLE public.match_events DROP CONSTRAINT match_events_type_check;
ALTER TABLE public.match_events ADD CONSTRAINT match_events_type_check CHECK (type IN ('START','MOVE','UNDO','PROPOSAL_CREATED','PROPOSAL_RESOLVED','RESULT'));
DROP TRIGGER match_undo_terminal ON public.matches;
DROP FUNCTION xiangqi_room.close_match_undo_offers();
DROP TABLE xiangqi_room.match_undo_offers;
COMMIT;
