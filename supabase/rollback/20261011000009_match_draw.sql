BEGIN;
SET LOCAL search_path=pg_catalog,public;
LOCK TABLE public.matches,public.match_events,xiangqi_room.match_draw_offers,xiangqi_room.outbox IN ACCESS EXCLUSIVE MODE;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM xiangqi_room.match_draw_offers)
 OR EXISTS(SELECT 1 FROM public.match_events WHERE payload->>'kind'='DRAW')
 OR EXISTS(SELECT 1 FROM xiangqi_room.outbox WHERE type='MATCH_DRAW')
 THEN RAISE EXCEPTION 'Draw feature writes exist; rollback refused'; END IF;
 IF (SELECT relowner='postgres'::pg_catalog.regrole AND relacl::text='{postgres=arwdDxtm/postgres,app_server=arw/postgres}' AND relkind='r' AND NOT relrowsecurity AND NOT relforcerowsecurity AND reloptions IS NULL FROM pg_catalog.pg_class WHERE oid='xiangqi_room.match_draw_offers'::pg_catalog.regclass) IS DISTINCT FROM true
 OR (SELECT pg_catalog.md5(pg_catalog.pg_get_functiondef(p.oid))='cc3ddfbf82c33a94ad3c7d2a97321ec5' AND p.proowner='postgres'::pg_catalog.regrole AND NOT p.prosecdef AND p.proconfig=ARRAY['search_path=""'] AND p.proacl::text='{postgres=X/postgres}' FROM pg_catalog.pg_proc p WHERE p.oid='xiangqi_room.close_match_draw_offers()'::pg_catalog.regprocedure) IS DISTINCT FROM true
 OR (SELECT pg_catalog.md5(string_agg(conname || ':' || pg_catalog.pg_get_constraintdef(oid),E'\n' ORDER BY conname)) FROM pg_catalog.pg_constraint WHERE conrelid='xiangqi_room.match_draw_offers'::pg_catalog.regclass) IS DISTINCT FROM '6d25f4296844a15790ee231840b7d6a2'
 OR (SELECT array_agg(attname::text ORDER BY attnum) FROM pg_catalog.pg_attribute WHERE attrelid='xiangqi_room.match_draw_offers'::pg_catalog.regclass AND attnum>0 AND NOT attisdropped) IS DISTINCT FROM ARRAY['id','match_id','sender','status','created_at','expires_at','resolved_at','cooldown_after_move_count']
 OR EXISTS(SELECT 1 FROM pg_catalog.pg_attribute WHERE attrelid='xiangqi_room.match_draw_offers'::pg_catalog.regclass AND attnum>0 AND (atthasdef OR attacl IS NOT NULL OR attgenerated<>'' OR attidentity<>''))
 OR EXISTS(SELECT 1 FROM pg_catalog.pg_attribute WHERE attrelid='xiangqi_room.match_draw_offers'::pg_catalog.regclass AND attnum>0 AND NOT attisdropped AND (attnotnull IS DISTINCT FROM (attname NOT IN('resolved_at','cooldown_after_move_count')) OR atttypmod<>-1 OR atttypid IS DISTINCT FROM CASE WHEN attname IN('id','match_id') THEN 'pg_catalog.uuid'::pg_catalog.regtype WHEN attname IN('sender','status') THEN 'pg_catalog.text'::pg_catalog.regtype WHEN attname IN('created_at','expires_at','resolved_at') THEN 'pg_catalog.timestamptz'::pg_catalog.regtype ELSE 'pg_catalog.int4'::pg_catalog.regtype END))
 OR EXISTS(SELECT 1 FROM pg_catalog.pg_constraint WHERE conrelid='xiangqi_room.match_draw_offers'::pg_catalog.regclass AND NOT convalidated)
 OR (SELECT count(*) FROM pg_catalog.pg_index WHERE indrelid='xiangqi_room.match_draw_offers'::pg_catalog.regclass)<>2
 OR (SELECT pg_catalog.pg_get_indexdef(i.indexrelid)='CREATE UNIQUE INDEX match_draw_pending_sender ON xiangqi_room.match_draw_offers USING btree (match_id, sender) WHERE (status = ''PENDING''::text)' AND i.indisvalid AND i.indisready AND i.indislive FROM pg_catalog.pg_index i WHERE i.indexrelid='xiangqi_room.match_draw_pending_sender'::pg_catalog.regclass) IS DISTINCT FROM true
 OR (SELECT count(*) FROM pg_catalog.pg_trigger WHERE tgrelid='xiangqi_room.match_draw_offers'::pg_catalog.regclass AND NOT tgisinternal)<>0
 OR (SELECT pg_catalog.pg_get_triggerdef(t.oid)='CREATE TRIGGER match_draw_terminal AFTER UPDATE OF status ON public.matches FOR EACH ROW WHEN (((old.status = ''ACTIVE''::text) AND (new.status = ANY (ARRAY[''FINISHED''::text, ''INTERRUPTED''::text])))) EXECUTE FUNCTION xiangqi_room.close_match_draw_offers()' AND t.tgenabled='O' FROM pg_catalog.pg_trigger t WHERE t.tgrelid='public.matches'::pg_catalog.regclass AND t.tgname='match_draw_terminal') IS DISTINCT FROM true
 THEN RAISE EXCEPTION 'Draw metadata changed; rollback refused'; END IF;
END $$;
DROP TRIGGER match_draw_terminal ON public.matches;
DROP FUNCTION xiangqi_room.close_match_draw_offers();
DROP TABLE xiangqi_room.match_draw_offers;
COMMIT;
