BEGIN;
SET LOCAL search_path=pg_catalog,public;
LOCK TABLE public.rooms,public.room_members,public.active_players IN ACCESS EXCLUSIVE MODE;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM public.room_members m JOIN public.rooms r ON r.id=m.room_id LEFT JOIN public.active_players a ON a.user_id=m.user_id WHERE m.role='PLAYER' AND r.closed_at IS NULL AND (a.user_id IS NULL OR a.room_id IS DISTINCT FROM m.room_id))
 OR EXISTS(SELECT user_id FROM public.room_members m JOIN public.rooms r ON r.id=m.room_id WHERE m.role='PLAYER' AND r.closed_at IS NULL GROUP BY user_id HAVING count(*)>1) THEN RAISE EXCEPTION 'Legacy seat reservation repair required; migration refused'; END IF;
 IF (SELECT pg_catalog.pg_get_expr(d.adbin,d.adrelid) FROM pg_catalog.pg_attrdef d JOIN pg_catalog.pg_attribute a ON a.attrelid=d.adrelid AND a.attnum=d.adnum WHERE d.adrelid='public.rooms'::pg_catalog.regclass AND a.attname='visibility') IS DISTINCT FROM '''PUBLIC''::text'
 OR (SELECT pg_catalog.pg_get_expr(d.adbin,d.adrelid) FROM pg_catalog.pg_attrdef d JOIN pg_catalog.pg_attribute a ON a.attrelid=d.adrelid AND a.attnum=d.adnum WHERE d.adrelid='public.rooms'::pg_catalog.regclass AND a.attname='time_control') IS DISTINCT FROM '0'
 OR EXISTS(SELECT 1 FROM pg_catalog.pg_attribute WHERE attrelid='public.active_players'::pg_catalog.regclass AND attname IN ('room_id','match_id') AND attacl IS NOT NULL) THEN RAISE EXCEPTION 'Room defaults or reservation grants differ from audited baseline'; END IF;
END $$;
ALTER TABLE public.rooms ADD COLUMN invite_code text CHECK(invite_code IS NULL OR invite_code ~ '^[A-HJ-NP-Z2-9]{8}$');
CREATE UNIQUE INDEX rooms_invite_code_unique ON public.rooms(invite_code) WHERE invite_code IS NOT NULL;
ALTER TABLE public.rooms ADD COLUMN viewer_limit smallint CHECK(viewer_limit BETWEEN 0 AND 5);
ALTER TABLE public.rooms ALTER COLUMN viewer_limit SET DEFAULT 5;
ALTER TABLE public.rooms ALTER COLUMN visibility SET DEFAULT 'CODE_ONLY';
ALTER TABLE public.rooms ALTER COLUMN time_control SET DEFAULT 600;
ALTER TABLE public.active_players ADD CONSTRAINT active_players_room_fk FOREIGN KEY(room_id) REFERENCES public.rooms(id) ON DELETE RESTRICT NOT VALID;
GRANT UPDATE(room_id,match_id) ON public.active_players TO app_server;
CREATE SCHEMA xiangqi_room AUTHORIZATION postgres;
REVOKE ALL ON SCHEMA xiangqi_room FROM PUBLIC,anon,authenticated;
CREATE TABLE xiangqi_room.countdowns(room_id uuid PRIMARY KEY REFERENCES public.rooms(id),token uuid UNIQUE NOT NULL,due_at timestamptz NOT NULL,red_id uuid NOT NULL REFERENCES public.profiles(user_id),black_id uuid NOT NULL REFERENCES public.profiles(user_id),CHECK(red_id<>black_id));
CREATE TABLE xiangqi_room.presence(room_id uuid NOT NULL,user_id uuid NOT NULL,connection_id text NOT NULL,generation bigint NOT NULL CHECK(generation>0),server_instance uuid NOT NULL,connected boolean NOT NULL,last_seen_at timestamptz NOT NULL,PRIMARY KEY(room_id,user_id),FOREIGN KEY(room_id,user_id) REFERENCES public.room_members(room_id,user_id) ON DELETE CASCADE);
CREATE TABLE xiangqi_room.outbox(id uuid PRIMARY KEY,room_id uuid NOT NULL REFERENCES public.rooms(id),room_version bigint NOT NULL,type text NOT NULL,payload jsonb NOT NULL,created_at timestamptz DEFAULT now() NOT NULL,delivered_at timestamptz,attempts integer DEFAULT 0 NOT NULL,next_attempt_at timestamptz DEFAULT now() NOT NULL,UNIQUE(room_id,room_version,type));
CREATE INDEX room_outbox_due ON xiangqi_room.outbox(next_attempt_at) WHERE delivered_at IS NULL;
CREATE TABLE xiangqi_room.entry_receipts(actor_id uuid NOT NULL REFERENCES xiangqi_auth.principals(id),command_id uuid NOT NULL,fingerprint text NOT NULL CHECK(length(fingerprint)=64),room_id uuid NOT NULL REFERENCES public.rooms(id),response jsonb NOT NULL,expires_at timestamptz DEFAULT (now()+interval '24 hours') NOT NULL,PRIMARY KEY(actor_id,command_id));
CREATE INDEX room_entry_receipts_expiry ON xiangqi_room.entry_receipts(expires_at);
DO $$ DECLARE t text;BEGIN FOREACH t IN ARRAY ARRAY['countdowns','presence','outbox','entry_receipts'] LOOP
 EXECUTE pg_catalog.format('ALTER TABLE xiangqi_room.%I ENABLE ROW LEVEL SECURITY',t);EXECUTE pg_catalog.format('ALTER TABLE xiangqi_room.%I FORCE ROW LEVEL SECURITY',t);
 EXECUTE pg_catalog.format('REVOKE ALL ON xiangqi_room.%I FROM PUBLIC,anon,authenticated',t);
 EXECUTE pg_catalog.format('GRANT SELECT,INSERT,UPDATE,DELETE ON xiangqi_room.%I TO app_server',t);
 EXECUTE pg_catalog.format('CREATE POLICY room_server ON xiangqi_room.%I TO app_server USING(true) WITH CHECK(true)',t);
END LOOP;END $$;
GRANT USAGE ON SCHEMA xiangqi_room TO app_server;
CREATE FUNCTION xiangqi_room.guard_settings() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$ BEGIN
 IF TG_OP='UPDATE' AND OLD.invite_code IS NOT NULL AND (NEW.invite_code IS DISTINCT FROM OLD.invite_code OR NEW.viewer_limit IS DISTINCT FROM OLD.viewer_limit OR NEW.time_control IS DISTINCT FROM OLD.time_control) THEN RAISE EXCEPTION 'Room configuration is immutable'; END IF;
 IF NEW.invite_code IS NOT NULL AND (NEW.viewer_limit IS NULL OR NEW.time_control NOT IN(300,600,900)) THEN RAISE EXCEPTION 'Invalid managed room configuration'; END IF;RETURN NEW;
END $$;
CREATE TRIGGER room_settings_guard BEFORE INSERT OR UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION xiangqi_room.guard_settings();
CREATE FUNCTION xiangqi_room.guard_seat_reservation() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$ DECLARE uid uuid;BEGIN
 FOR uid IN SELECT DISTINCT x FROM pg_catalog.unnest(ARRAY[NEW.user_id,OLD.user_id]) AS x WHERE x IS NOT NULL LOOP
 IF EXISTS(SELECT 1 FROM public.room_members m JOIN public.rooms r ON r.id=m.room_id WHERE m.user_id=uid AND m.role='PLAYER' AND r.invite_code IS NOT NULL AND r.closed_at IS NULL AND NOT EXISTS(SELECT 1 FROM public.active_players a WHERE a.user_id=uid AND a.room_id=m.room_id))
 OR EXISTS(SELECT 1 FROM public.active_players a JOIN public.rooms r ON r.id=a.room_id WHERE a.user_id=uid AND r.invite_code IS NOT NULL AND r.closed_at IS NULL AND NOT EXISTS(SELECT 1 FROM public.room_members m WHERE m.user_id=uid AND m.room_id=a.room_id AND m.role='PLAYER')) THEN RAISE EXCEPTION 'Managed seat reservation mismatch'; END IF;
 END LOOP;RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER room_seat_reservation AFTER INSERT OR UPDATE OR DELETE ON public.room_members DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION xiangqi_room.guard_seat_reservation();
CREATE CONSTRAINT TRIGGER active_seat_reservation AFTER INSERT OR UPDATE OR DELETE ON public.active_players DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION xiangqi_room.guard_seat_reservation();
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA xiangqi_room FROM PUBLIC,anon,authenticated;
COMMIT;
