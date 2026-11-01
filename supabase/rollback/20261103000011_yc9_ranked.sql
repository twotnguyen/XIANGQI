BEGIN;
LOCK TABLE public.rooms, xiangqi_room.ratings, xiangqi_room.ranked_results IN ACCESS EXCLUSIVE MODE;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM xiangqi_room.ratings) OR EXISTS(SELECT 1 FROM xiangqi_room.ranked_results) OR EXISTS(SELECT 1 FROM public.rooms WHERE kind<>'CUSTOM') THEN
  RAISE EXCEPTION 'YC9 data exists; rollback refused to preserve user results';
 END IF;
END $$;
DO $$ DECLARE def text; BEGIN
 SELECT pg_catalog.pg_get_functiondef('xiangqi_room.guard_seat_reservation()'::regprocedure) INTO def;
 def := replace(def, '(r.invite_code IS NOT NULL OR r.kind IN (''CASUAL'',''RANKED''))', 'r.invite_code IS NOT NULL');
 EXECUTE def;
 SELECT pg_catalog.pg_get_functiondef('xiangqi_room.guard_settings()'::regprocedure) INTO def;
 def := replace(def, '(OLD.invite_code IS NOT NULL OR OLD.kind IN (''CASUAL'',''RANKED''))', 'OLD.invite_code IS NOT NULL');
 def := replace(def, '(NEW.invite_code IS NOT NULL OR NEW.kind IN (''CASUAL'',''RANKED''))', 'NEW.invite_code IS NOT NULL');
 def := replace(def, '(NEW.invite_code IS NULL AND OLD.kind = ''CUSTOM'') OR NEW.viewer_limit', 'NEW.invite_code IS NULL OR NEW.viewer_limit');
 EXECUTE def;
 IF to_regprocedure('xiangqi_chat.sync_membership()') IS NOT NULL THEN
  SELECT pg_catalog.pg_get_functiondef('xiangqi_chat.sync_membership()'::regprocedure) INTO def;
  def := replace(def, '(invite_code IS NOT NULL OR kind IN (''CASUAL'',''RANKED''))', 'invite_code IS NOT NULL');
  EXECUTE def;
  DROP TRIGGER chat_room_closed ON public.rooms;
  CREATE TRIGGER chat_room_closed AFTER UPDATE OF status,closed_at ON public.rooms FOR EACH ROW WHEN(NEW.invite_code IS NOT NULL AND (NEW.status='CLOSED' OR NEW.closed_at IS NOT NULL)) EXECUTE FUNCTION xiangqi_chat.close_room();
 END IF;
END $$;
DROP TABLE xiangqi_room.ranked_results, xiangqi_room.ratings;
DROP INDEX public.matches_ranked_pair_started;
DROP TRIGGER room_kind_guard ON public.rooms;
DROP FUNCTION xiangqi_room.guard_room_kind();
ALTER TABLE public.rooms DROP COLUMN kind;
COMMIT;
