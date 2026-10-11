BEGIN;
SET LOCAL search_path=pg_catalog,public;
LOCK TABLE public.rooms,xiangqi_room.side_swap_offers,xiangqi_room.outbox IN ACCESS EXCLUSIVE MODE;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM xiangqi_room.side_swap_offers)
 OR EXISTS(SELECT 1 FROM xiangqi_room.outbox WHERE type LIKE 'ROOM_SWAP%')
 THEN RAISE EXCEPTION 'Side swap feature writes exist; rollback refused'; END IF;
 IF (SELECT relowner='postgres'::pg_catalog.regrole AND relacl::text='{postgres=arwdDxtm/postgres,app_server=arw/postgres}' AND relkind='r' AND NOT relrowsecurity AND NOT relforcerowsecurity AND reloptions IS NULL FROM pg_catalog.pg_class WHERE oid='xiangqi_room.side_swap_offers'::pg_catalog.regclass) IS DISTINCT FROM true
 OR (SELECT pg_catalog.md5(pg_catalog.pg_get_functiondef(p.oid))='74c2b849f766a3a59b0e478be659d49d' AND p.proowner='postgres'::pg_catalog.regrole AND NOT p.prosecdef AND p.proconfig=ARRAY['search_path=""'] AND p.proacl::text='{postgres=X/postgres}' FROM pg_catalog.pg_proc p WHERE p.oid='xiangqi_room.close_side_swap_offers()'::pg_catalog.regprocedure) IS DISTINCT FROM true
 OR (SELECT pg_catalog.md5(string_agg(conname || ':' || pg_catalog.pg_get_constraintdef(oid),E'\n' ORDER BY conname)) FROM pg_catalog.pg_constraint WHERE conrelid='xiangqi_room.side_swap_offers'::pg_catalog.regclass) IS DISTINCT FROM 'b9fc3815e3728c054c2d0de78066c6c5'
 OR (SELECT array_agg(attname::text ORDER BY attnum) FROM pg_catalog.pg_attribute WHERE attrelid='xiangqi_room.side_swap_offers'::pg_catalog.regclass AND attnum>0 AND NOT attisdropped) IS DISTINCT FROM ARRAY['id','room_id','proposer_id','responder_id','status','created_at','expires_at','resolved_at']
 OR EXISTS(SELECT 1 FROM pg_catalog.pg_attribute WHERE attrelid='xiangqi_room.side_swap_offers'::pg_catalog.regclass AND attnum>0 AND (atthasdef OR attacl IS NOT NULL OR attgenerated<>'' OR attidentity<>''))
 OR EXISTS(SELECT 1 FROM pg_catalog.pg_attribute WHERE attrelid='xiangqi_room.side_swap_offers'::pg_catalog.regclass AND attnum>0 AND NOT attisdropped AND (attnotnull IS DISTINCT FROM (attname NOT IN('resolved_at')) OR atttypmod<>-1 OR atttypid IS DISTINCT FROM CASE WHEN attname IN('id','room_id','proposer_id','responder_id') THEN 'pg_catalog.uuid'::pg_catalog.regtype WHEN attname='status' THEN 'pg_catalog.text'::pg_catalog.regtype WHEN attname IN('created_at','expires_at','resolved_at') THEN 'pg_catalog.timestamptz'::pg_catalog.regtype END))
 OR EXISTS(SELECT 1 FROM pg_catalog.pg_constraint WHERE conrelid='xiangqi_room.side_swap_offers'::pg_catalog.regclass AND NOT convalidated)
 OR (SELECT count(*) FROM pg_catalog.pg_index WHERE indrelid='xiangqi_room.side_swap_offers'::pg_catalog.regclass)<>2
 OR (SELECT pg_catalog.pg_get_indexdef(i.indexrelid)='CREATE UNIQUE INDEX side_swap_pending_room ON xiangqi_room.side_swap_offers USING btree (room_id) WHERE (status = ''PENDING''::text)' AND i.indisvalid AND i.indisready AND i.indislive FROM pg_catalog.pg_index i WHERE i.indexrelid='xiangqi_room.side_swap_pending_room'::pg_catalog.regclass) IS DISTINCT FROM true
 OR (SELECT count(*) FROM pg_catalog.pg_trigger WHERE tgrelid='xiangqi_room.side_swap_offers'::pg_catalog.regclass AND NOT tgisinternal)<>0
 OR (SELECT pg_catalog.pg_get_triggerdef(t.oid)='CREATE TRIGGER side_swap_waiting_exit AFTER UPDATE OF status ON public.rooms FOR EACH ROW WHEN (((old.status = ''WAITING''::text) AND (new.status <> ''WAITING''::text))) EXECUTE FUNCTION xiangqi_room.close_side_swap_offers()' AND t.tgenabled='O' FROM pg_catalog.pg_trigger t WHERE t.tgrelid='public.rooms'::pg_catalog.regclass AND t.tgname='side_swap_waiting_exit') IS DISTINCT FROM true
 THEN RAISE EXCEPTION 'Side swap metadata changed; rollback refused'; END IF;
END $$;
DROP TRIGGER side_swap_waiting_exit ON public.rooms;
DROP FUNCTION xiangqi_room.close_side_swap_offers();
DROP TABLE xiangqi_room.side_swap_offers;
COMMIT;
