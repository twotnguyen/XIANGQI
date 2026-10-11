BEGIN;
SET LOCAL search_path=pg_catalog,public;
LOCK TABLE public.rooms,xiangqi_room.room_blocks,xiangqi_room.seat_invites,xiangqi_room.outbox IN ACCESS EXCLUSIVE MODE;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM xiangqi_room.room_blocks)
 OR EXISTS(SELECT 1 FROM xiangqi_room.seat_invites)
 OR EXISTS(SELECT 1 FROM xiangqi_room.outbox WHERE type LIKE 'ROOM_SEAT%' OR type='room.viewer-kicked')
 THEN RAISE EXCEPTION 'Viewer feature writes exist; rollback refused'; END IF;
 IF (SELECT array_agg(attname::text ORDER BY attnum) FROM pg_catalog.pg_attribute WHERE attrelid='xiangqi_room.room_blocks'::pg_catalog.regclass AND attnum>0 AND NOT attisdropped) IS DISTINCT FROM ARRAY['room_id','user_id','created_at']
 OR (SELECT array_agg(attname::text ORDER BY attnum) FROM pg_catalog.pg_attribute WHERE attrelid='xiangqi_room.seat_invites'::pg_catalog.regclass AND attnum>0 AND NOT attisdropped) IS DISTINCT FROM ARRAY['id','room_id','inviter_id','invitee_id','status','created_at','expires_at','resolved_at']
 OR (SELECT pg_catalog.md5(pg_catalog.pg_get_functiondef(p.oid)) FROM pg_catalog.pg_proc p WHERE p.oid='xiangqi_room.close_seat_invites()'::pg_catalog.regprocedure) IS DISTINCT FROM '7573db9f0196dea6020d812ba1cb8ac6'
 OR (SELECT pg_catalog.pg_get_indexdef(i.indexrelid) FROM pg_catalog.pg_index i WHERE i.indexrelid='xiangqi_room.seat_invite_pending_room'::pg_catalog.regclass) IS DISTINCT FROM 'CREATE UNIQUE INDEX seat_invite_pending_room ON xiangqi_room.seat_invites USING btree (room_id) WHERE (status = ''PENDING''::text)'
 OR (SELECT pg_catalog.pg_get_triggerdef(t.oid) FROM pg_catalog.pg_trigger t WHERE t.tgrelid='public.rooms'::pg_catalog.regclass AND t.tgname='seat_invite_waiting_exit') IS DISTINCT FROM 'CREATE TRIGGER seat_invite_waiting_exit AFTER UPDATE OF status ON public.rooms FOR EACH ROW WHEN (((old.status = ''WAITING''::text) AND (new.status <> ''WAITING''::text))) EXECUTE FUNCTION xiangqi_room.close_seat_invites()'
 THEN RAISE EXCEPTION 'Viewer metadata changed; rollback refused'; END IF;
END $$;
DROP TRIGGER seat_invite_waiting_exit ON public.rooms;
DROP FUNCTION xiangqi_room.close_seat_invites();
DROP TABLE xiangqi_room.seat_invites;
DROP TABLE xiangqi_room.room_blocks;
COMMIT;
