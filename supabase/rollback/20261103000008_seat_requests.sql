BEGIN;
SET LOCAL search_path=pg_catalog,public;
LOCK TABLE public.rooms,xiangqi_room.seat_requests,xiangqi_room.outbox IN ACCESS EXCLUSIVE MODE;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM xiangqi_room.seat_requests)
 OR EXISTS(SELECT 1 FROM xiangqi_room.outbox WHERE type LIKE 'room.seat-request-%' OR type='room.removed')
 THEN RAISE EXCEPTION 'Seat request writes exist; rollback refused'; END IF;
 IF (SELECT array_agg(attname::text ORDER BY attnum) FROM pg_catalog.pg_attribute WHERE attrelid='xiangqi_room.seat_requests'::pg_catalog.regclass AND attnum>0 AND NOT attisdropped) IS DISTINCT FROM ARRAY['id','room_id','requester_id','status','created_at','expires_at','resolved_at']
 THEN RAISE EXCEPTION 'Seat request metadata changed; rollback refused'; END IF;
END $$;
DROP TRIGGER seat_request_waiting_exit ON public.rooms;
DROP FUNCTION xiangqi_room.close_seat_requests();
DROP TABLE xiangqi_room.seat_requests;
COMMIT;
