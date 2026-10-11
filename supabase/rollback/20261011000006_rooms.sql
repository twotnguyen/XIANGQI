BEGIN;
SET LOCAL search_path=pg_catalog,public;
LOCK TABLE public.rooms,public.room_members,public.active_players IN ACCESS EXCLUSIVE MODE;
DO $$ BEGIN
 IF (SELECT count(*) FROM pg_catalog.pg_trigger WHERE ((tgrelid='public.rooms'::pg_catalog.regclass AND tgname='room_settings_guard' AND tgfoid='xiangqi_room.guard_settings'::pg_catalog.regproc AND NOT tgdeferrable) OR (tgrelid='public.room_members'::pg_catalog.regclass AND tgname='room_seat_reservation' AND tgfoid='xiangqi_room.guard_seat_reservation'::pg_catalog.regproc AND tgdeferrable AND tginitdeferred) OR (tgrelid='public.active_players'::pg_catalog.regclass AND tgname='active_seat_reservation' AND tgfoid='xiangqi_room.guard_seat_reservation'::pg_catalog.regproc AND tgdeferrable AND tginitdeferred)) AND tgenabled='O')<>3
 OR EXISTS(SELECT 1 FROM pg_catalog.pg_attribute a JOIN pg_catalog.pg_class c ON c.oid=a.attrelid JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='xiangqi_room' AND a.attnum>0 AND a.attacl IS NOT NULL) THEN RAISE EXCEPTION 'Room metadata changed; rollback refused'; END IF;
 IF (SELECT pg_catalog.array_agg(a::text ORDER BY a::text) FROM pg_catalog.pg_namespace n,pg_catalog.unnest(n.nspacl) a WHERE n.nspname='xiangqi_room') IS DISTINCT FROM ARRAY['app_server=U/postgres','postgres=UC/postgres']
 OR EXISTS(SELECT 1 FROM pg_catalog.pg_proc WHERE pronamespace='xiangqi_room'::pg_catalog.regnamespace AND (proowner<>'postgres'::pg_catalog.regrole OR prosecdef OR proconfig IS DISTINCT FROM ARRAY['search_path=""'] OR proacl::text IS DISTINCT FROM '{postgres=X/postgres}' OR (proname='guard_settings' AND pg_catalog.md5(prosrc)<>'2486f60dc5bf1878e528934de38dba71') OR (proname='guard_seat_reservation' AND pg_catalog.md5(prosrc)<>'26dfa0750ea3b270a05c13d5ddb03e8e'))) THEN RAISE EXCEPTION 'Room metadata changed; rollback refused'; END IF;
 IF EXISTS(SELECT 1 FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='xiangqi_room' AND c.relkind='r' AND (c.relowner<>'postgres'::pg_catalog.regrole OR NOT c.relrowsecurity OR NOT c.relforcerowsecurity
 OR (SELECT pg_catalog.array_agg(a::text ORDER BY a::text) FROM pg_catalog.unnest(c.relacl) a) IS DISTINCT FROM ARRAY['app_server=arwd/postgres','postgres=arwdDxtm/postgres']
 OR (SELECT count(*) FROM pg_catalog.pg_policy p WHERE p.polrelid=c.oid AND p.polname='room_server' AND p.polroles=ARRAY['app_server'::pg_catalog.regrole::oid] AND pg_catalog.pg_get_expr(p.polqual,p.polrelid)='true' AND pg_catalog.pg_get_expr(p.polwithcheck,p.polrelid)='true')<>1
 OR (SELECT count(*) FROM pg_catalog.pg_policy p WHERE p.polrelid=c.oid)<>1)) THEN RAISE EXCEPTION 'Room metadata changed; rollback refused'; END IF;
 IF EXISTS(SELECT 1 FROM public.rooms WHERE invite_code IS NOT NULL OR viewer_limit IS NOT NULL)
 OR EXISTS(SELECT 1 FROM xiangqi_room.countdowns) OR EXISTS(SELECT 1 FROM xiangqi_room.presence) OR EXISTS(SELECT 1 FROM xiangqi_room.outbox) OR EXISTS(SELECT 1 FROM xiangqi_room.entry_receipts) THEN RAISE EXCEPTION 'Room feature writes exist; rollback refused'; END IF;
 IF (SELECT pg_catalog.pg_get_expr(d.adbin,d.adrelid) FROM pg_catalog.pg_attrdef d JOIN pg_catalog.pg_attribute a ON a.attrelid=d.adrelid AND a.attnum=d.adnum WHERE d.adrelid='public.rooms'::pg_catalog.regclass AND a.attname='visibility') IS DISTINCT FROM '''CODE_ONLY''::text'
 OR (SELECT pg_catalog.pg_get_expr(d.adbin,d.adrelid) FROM pg_catalog.pg_attrdef d JOIN pg_catalog.pg_attribute a ON a.attrelid=d.adrelid AND a.attnum=d.adnum WHERE d.adrelid='public.rooms'::pg_catalog.regclass AND a.attname='time_control') IS DISTINCT FROM '600'
 OR EXISTS(SELECT 1 FROM pg_catalog.pg_attribute WHERE attrelid='public.active_players'::pg_catalog.regclass AND attname IN ('room_id','match_id') AND attacl::text IS DISTINCT FROM '{app_server=w/postgres}') THEN RAISE EXCEPTION 'Room metadata changed; rollback refused'; END IF;
END $$;
DROP TRIGGER active_seat_reservation ON public.active_players;
DROP TRIGGER room_seat_reservation ON public.room_members;
DROP TRIGGER room_settings_guard ON public.rooms;
DROP FUNCTION xiangqi_room.guard_seat_reservation();
DROP FUNCTION xiangqi_room.guard_settings();
DROP TABLE xiangqi_room.entry_receipts,xiangqi_room.outbox,xiangqi_room.presence,xiangqi_room.countdowns;
DROP SCHEMA xiangqi_room;
REVOKE UPDATE(room_id,match_id) ON public.active_players FROM app_server;
ALTER TABLE public.active_players DROP CONSTRAINT active_players_room_fk;
ALTER TABLE public.rooms ALTER COLUMN visibility SET DEFAULT 'PUBLIC';
ALTER TABLE public.rooms ALTER COLUMN time_control SET DEFAULT 0;
ALTER TABLE public.rooms DROP COLUMN invite_code,DROP COLUMN viewer_limit;
COMMIT;
