BEGIN;
SET LOCAL search_path=pg_catalog,public;
LOCK TABLE public.rooms,public.room_members,xiangqi_room.rematch_offers IN ACCESS EXCLUSIVE MODE;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM xiangqi_room.rematch_offers)
 THEN RAISE EXCEPTION 'Custom rematch writes exist; rollback refused'; END IF;
END $$;
DROP TRIGGER rematch_seat_change ON public.room_members;
DROP FUNCTION xiangqi_room.close_rematch_on_seat_change();
DROP TRIGGER rematch_waiting_exit ON public.rooms;
DROP FUNCTION xiangqi_room.close_rematch_offers();
DROP TABLE xiangqi_room.rematch_offers;
COMMIT;
