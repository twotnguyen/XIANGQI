BEGIN;
ALTER TABLE public.rooms ADD COLUMN kind text NOT NULL DEFAULT 'CUSTOM' CHECK(kind IN ('CUSTOM','CASUAL','RANKED'));
DO $$ DECLARE def text; BEGIN
 SELECT pg_catalog.pg_get_functiondef('xiangqi_room.guard_seat_reservation()'::regprocedure) INTO def;
 def := replace(def, 'r.invite_code IS NOT NULL', '(r.invite_code IS NOT NULL OR r.kind IN (''CASUAL'',''RANKED''))');
 EXECUTE def;
 SELECT pg_catalog.pg_get_functiondef('xiangqi_room.guard_settings()'::regprocedure) INTO def;
 def := replace(def, 'OLD.invite_code IS NOT NULL', '(OLD.invite_code IS NOT NULL OR OLD.kind IN (''CASUAL'',''RANKED''))');
 def := replace(def, 'NEW.invite_code IS NOT NULL', '(NEW.invite_code IS NOT NULL OR NEW.kind IN (''CASUAL'',''RANKED''))');
 def := replace(def, 'NEW.invite_code IS NULL OR NEW.viewer_limit', '(NEW.invite_code IS NULL AND OLD.kind = ''CUSTOM'') OR NEW.viewer_limit');
 EXECUTE def;
 IF to_regprocedure('xiangqi_chat.sync_membership()') IS NOT NULL THEN
  SELECT pg_catalog.pg_get_functiondef('xiangqi_chat.sync_membership()'::regprocedure) INTO def;
  def := replace(def, 'invite_code IS NOT NULL', '(invite_code IS NOT NULL OR kind IN (''CASUAL'',''RANKED''))');
  EXECUTE def;
  DROP TRIGGER chat_room_closed ON public.rooms;
  CREATE TRIGGER chat_room_closed AFTER UPDATE OF status,closed_at ON public.rooms FOR EACH ROW WHEN((NEW.invite_code IS NOT NULL OR NEW.kind IN ('CASUAL','RANKED')) AND (NEW.status='CLOSED' OR NEW.closed_at IS NOT NULL)) EXECUTE FUNCTION xiangqi_chat.close_room();
 END IF;
END $$;
CREATE FUNCTION xiangqi_room.guard_room_kind() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$ BEGIN
 IF NEW.kind IS DISTINCT FROM OLD.kind THEN RAISE EXCEPTION 'Room kind is immutable'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER room_kind_guard BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION xiangqi_room.guard_room_kind();
REVOKE ALL ON FUNCTION xiangqi_room.guard_room_kind() FROM PUBLIC,anon,authenticated;
CREATE TABLE xiangqi_room.ratings (
 user_id uuid PRIMARY KEY REFERENCES xiangqi_auth.principals(id),
 elo integer NOT NULL DEFAULT 1200 CHECK(elo>=100),
 completed integer NOT NULL DEFAULT 0 CHECK(completed>=0),
 wins integer NOT NULL DEFAULT 0 CHECK(wins>=0), draws integer NOT NULL DEFAULT 0 CHECK(draws>=0), losses integer NOT NULL DEFAULT 0 CHECK(losses>=0),
 achieved_at timestamptz NOT NULL DEFAULT now(), CHECK(completed=wins+draws+losses)
);
CREATE TABLE xiangqi_room.ranked_results (
 match_id uuid PRIMARY KEY REFERENCES public.matches(id),
 red_id uuid NOT NULL REFERENCES xiangqi_auth.principals(id), black_id uuid NOT NULL REFERENCES xiangqi_auth.principals(id),
 red_before integer NOT NULL, red_after integer NOT NULL, red_delta integer GENERATED ALWAYS AS (red_after-red_before) STORED,
 black_before integer NOT NULL, black_after integer NOT NULL, black_delta integer GENERATED ALWAYS AS (black_after-black_before) STORED,
 red_tier text NOT NULL, black_tier text NOT NULL, achieved_at timestamptz NOT NULL, CHECK(red_id<>black_id)
);
CREATE INDEX matches_ranked_pair_started ON public.matches(red_user_id,black_user_id,created_at) WHERE mode='ONLINE';
DO $$ DECLARE t text; BEGIN FOREACH t IN ARRAY ARRAY['ratings','ranked_results'] LOOP
 EXECUTE pg_catalog.format('ALTER TABLE xiangqi_room.%I ENABLE ROW LEVEL SECURITY',t);
 EXECUTE pg_catalog.format('ALTER TABLE xiangqi_room.%I FORCE ROW LEVEL SECURITY',t);
 EXECUTE pg_catalog.format('REVOKE ALL ON xiangqi_room.%I FROM PUBLIC,anon,authenticated,service_role',t);
 EXECUTE pg_catalog.format('GRANT SELECT,INSERT,UPDATE ON xiangqi_room.%I TO app_server',t);
 EXECUTE pg_catalog.format('CREATE POLICY ranked_server ON xiangqi_room.%I TO app_server USING(true) WITH CHECK(true)',t);
END LOOP; END $$;
COMMIT;
