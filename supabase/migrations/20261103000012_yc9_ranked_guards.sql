BEGIN;
LOCK TABLE public.rooms, public.room_members, public.active_players, xiangqi_room.ranked_results IN ACCESS EXCLUSIVE MODE;
DO $migration$
DECLARE
 item record;
 actual text;
 patched text;
 definition text;
BEGIN
 FOR item IN SELECT * FROM (VALUES
 ('xiangqi_room.guard_settings()', $body$ BEGIN
 IF TG_OP='UPDATE' AND OLD.invite_code IS NOT NULL THEN
  IF NEW.invite_code IS NULL OR NEW.viewer_limit IS DISTINCT FROM OLD.viewer_limit OR NEW.time_control IS DISTINCT FROM OLD.time_control THEN RAISE EXCEPTION 'Room configuration is immutable'; END IF;
  IF NEW.invite_code IS DISTINCT FROM OLD.invite_code AND NOT(OLD.visibility='LOCKED' AND NEW.visibility IN('PUBLIC','CODE_ONLY')) THEN RAISE EXCEPTION 'Room code rotates only when unlocking'; END IF;
 END IF;
 IF NEW.invite_code IS NOT NULL AND (NEW.viewer_limit IS NULL OR NEW.time_control NOT IN(0,300,600,900)) THEN RAISE EXCEPTION 'Invalid managed room configuration'; END IF;
 RETURN NEW;
END $body$, 'settings'),
 ('xiangqi_room.guard_seat_reservation()', $body$ DECLARE uid uuid;BEGIN
 FOR uid IN SELECT DISTINCT x FROM pg_catalog.unnest(ARRAY[NEW.user_id,OLD.user_id]) AS x WHERE x IS NOT NULL LOOP
 IF EXISTS(SELECT 1 FROM public.room_members m JOIN public.rooms r ON r.id=m.room_id WHERE m.user_id=uid AND m.role='PLAYER' AND r.invite_code IS NOT NULL AND r.closed_at IS NULL AND NOT EXISTS(SELECT 1 FROM public.active_players a WHERE a.user_id=uid AND a.room_id=m.room_id))
 OR EXISTS(SELECT 1 FROM public.active_players a JOIN public.rooms r ON r.id=a.room_id WHERE a.user_id=uid AND r.invite_code IS NOT NULL AND r.closed_at IS NULL AND NOT EXISTS(SELECT 1 FROM public.room_members m WHERE m.user_id=uid AND m.room_id=a.room_id AND m.role='PLAYER')) THEN RAISE EXCEPTION 'Managed seat reservation mismatch'; END IF;
 END LOOP;RETURN NULL;
END $body$, 'seat'),
 ('xiangqi_chat.sync_membership()', $body$ DECLARE rid uuid;players uuid[];seq bigint;BEGIN
 FOR rid IN SELECT DISTINCT x FROM pg_catalog.unnest(ARRAY[OLD.room_id,NEW.room_id]) AS x WHERE x IS NOT NULL ORDER BY x LOOP
 IF NOT EXISTS(SELECT 1 FROM public.rooms WHERE id=rid AND invite_code IS NOT NULL AND closed_at IS NULL AND status<>'CLOSED' FOR UPDATE) THEN CONTINUE;END IF;
 players:=ARRAY(SELECT user_id FROM public.room_members WHERE room_id=rid AND role='PLAYER' ORDER BY user_id);
 INSERT INTO xiangqi_chat.rooms(room_id,player_ids,pair_epoch) VALUES(rid,players,pg_catalog.gen_random_uuid()) ON CONFLICT DO NOTHING;
 UPDATE xiangqi_chat.rooms SET player_ids=players,pair_epoch=pg_catalog.gen_random_uuid() WHERE room_id=rid AND player_ids IS DISTINCT FROM players;
 END LOOP;
 IF TG_OP<>'DELETE' AND (TG_OP='INSERT' OR NEW.room_id IS DISTINCT FROM OLD.room_id OR NEW.user_id IS DISTINCT FROM OLD.user_id) AND EXISTS(SELECT 1 FROM public.rooms WHERE id=NEW.room_id AND invite_code IS NOT NULL AND closed_at IS NULL AND status<>'CLOSED') THEN
 SELECT sequence INTO seq FROM xiangqi_chat.rooms WHERE room_id=NEW.room_id;
 IF FOUND THEN INSERT INTO xiangqi_chat.entries(room_id,user_id,floor) VALUES(NEW.room_id,NEW.user_id,seq) ON CONFLICT(room_id,user_id) DO UPDATE SET floor=EXCLUDED.floor;END IF;
 END IF;RETURN NULL;
END $body$, 'chat'),
 ('xiangqi_room.guard_room_kind()', $body$ BEGIN
 IF NEW.kind IS DISTINCT FROM OLD.kind THEN RAISE EXCEPTION 'Room kind is immutable'; END IF;
 RETURN NEW;
END $body$, 'kind')
 ) AS guards(name, original, kind)
 LOOP
  IF item.kind='chat' AND pg_catalog.to_regnamespace('xiangqi_chat') IS NULL THEN CONTINUE; END IF;
  SELECT p.prosrc INTO actual FROM pg_catalog.pg_proc p
   JOIN pg_catalog.pg_language l ON l.oid=p.prolang
   WHERE p.oid=pg_catalog.to_regprocedure(item.name) AND l.lanname='plpgsql'
   AND p.prorettype='pg_catalog.trigger'::pg_catalog.regtype AND NOT p.prosecdef
   AND p.proconfig=ARRAY['search_path=""'];
  patched := item.original;
  IF item.kind='settings' THEN
   patched := replace(patched, 'OLD.invite_code IS NOT NULL', '(OLD.invite_code IS NOT NULL OR OLD.kind IN (''CASUAL'',''RANKED''))');
   patched := replace(patched, 'NEW.invite_code IS NOT NULL', '(NEW.invite_code IS NOT NULL OR NEW.kind IN (''CASUAL'',''RANKED''))');
   patched := replace(patched, 'NEW.invite_code IS NULL OR NEW.viewer_limit', '(NEW.invite_code IS NULL AND OLD.kind = ''CUSTOM'') OR NEW.viewer_limit');
  ELSIF item.kind='seat' THEN
   patched := replace(patched, 'r.invite_code IS NOT NULL', '(r.invite_code IS NOT NULL OR r.kind IN (''CASUAL'',''RANKED''))');
  ELSIF item.kind='chat' THEN
   patched := replace(patched, 'invite_code IS NOT NULL', '(invite_code IS NOT NULL OR kind IN (''CASUAL'',''RANKED''))');
  END IF;
  IF actual IS DISTINCT FROM patched AND (item.kind='kind' OR actual IS DISTINCT FROM item.original) THEN
   RAISE EXCEPTION 'guard definition drift: %', item.name;
  END IF;
  IF actual IS DISTINCT FROM patched THEN
   SELECT pg_catalog.pg_get_functiondef(pg_catalog.to_regprocedure(item.name)) INTO definition;
   EXECUTE replace(definition, actual, patched);
  END IF;
 END LOOP;
 IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_attribute WHERE attrelid='public.rooms'::regclass AND attname='kind' AND atttypid='text'::regtype AND attnotnull AND NOT attisdropped)
 OR NOT EXISTS (SELECT 1 FROM pg_catalog.pg_trigger WHERE tgrelid='public.rooms'::regclass AND tgname='room_settings_guard' AND tgfoid='xiangqi_room.guard_settings()'::regprocedure AND tgtype=23 AND tgenabled IN ('O','A') AND tgqual IS NULL)
 OR NOT EXISTS (SELECT 1 FROM pg_catalog.pg_trigger WHERE tgrelid='public.rooms'::regclass AND tgname='room_kind_guard' AND tgfoid='xiangqi_room.guard_room_kind()'::regprocedure AND tgtype=19 AND tgenabled IN ('O','A') AND tgqual IS NULL)
 OR NOT EXISTS (SELECT 1 FROM pg_catalog.pg_trigger WHERE tgrelid='public.room_members'::regclass AND tgname='room_seat_reservation' AND tgfoid='xiangqi_room.guard_seat_reservation()'::regprocedure AND tgtype=29 AND tgdeferrable AND tginitdeferred AND tgenabled IN ('O','A'))
 OR NOT EXISTS (SELECT 1 FROM pg_catalog.pg_trigger WHERE tgrelid='public.active_players'::regclass AND tgname='active_seat_reservation' AND tgfoid='xiangqi_room.guard_seat_reservation()'::regprocedure AND tgtype=29 AND tgdeferrable AND tginitdeferred AND tgenabled IN ('O','A'))
 OR (pg_catalog.to_regnamespace('xiangqi_chat') IS NOT NULL AND (
  NOT EXISTS (SELECT 1 FROM pg_catalog.pg_trigger WHERE tgrelid='public.room_members'::regclass AND tgname='chat_membership' AND tgfoid=pg_catalog.to_regprocedure('xiangqi_chat.sync_membership()') AND tgtype=29 AND tgenabled IN ('O','A') AND tgqual IS NULL)
  OR NOT EXISTS (SELECT 1 FROM pg_catalog.pg_trigger WHERE tgrelid='public.rooms'::regclass AND tgname='chat_room_closed' AND tgfoid=pg_catalog.to_regprocedure('xiangqi_chat.close_room()') AND tgtype=17 AND tgenabled IN ('O','A') AND tgqual IS NOT NULL)
 )) THEN
  RAISE EXCEPTION 'guard schema drift';
 END IF;
END
$migration$;
REVOKE UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER ON xiangqi_room.ranked_results FROM app_server;
COMMIT;
