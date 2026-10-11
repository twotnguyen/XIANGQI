BEGIN;
SET LOCAL search_path=pg_catalog,public;
LOCK TABLE public.rooms,public.room_members IN ACCESS EXCLUSIVE MODE;
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_catalog.pg_attribute WHERE attrelid='public.rooms'::pg_catalog.regclass AND attname='invite_code' AND atttypid='pg_catalog.text'::pg_catalog.regtype AND NOT attisdropped)
 OR NOT EXISTS(SELECT 1 FROM pg_catalog.pg_constraint WHERE conrelid='public.room_members'::pg_catalog.regclass AND conname='room_members_role_invariants' AND convalidated)
 OR NOT pg_catalog.has_table_privilege('app_server','public.room_members','SELECT') THEN RAISE EXCEPTION 'Chat room prerequisites differ'; END IF;
END $$;
CREATE SCHEMA xiangqi_chat AUTHORIZATION postgres;
REVOKE ALL ON SCHEMA xiangqi_chat FROM PUBLIC,anon,authenticated,service_role;
GRANT USAGE ON SCHEMA xiangqi_chat TO app_server;
CREATE TABLE xiangqi_chat.rooms(room_id uuid PRIMARY KEY REFERENCES public.rooms(id) ON DELETE CASCADE,sequence bigint DEFAULT 0 NOT NULL CHECK(sequence BETWEEN 0 AND 9007199254740991),player_ids uuid[] NOT NULL CHECK(cardinality(player_ids)<=2 AND array_position(player_ids,NULL) IS NULL),pair_epoch uuid NOT NULL);
CREATE TABLE xiangqi_chat.entries(room_id uuid NOT NULL REFERENCES xiangqi_chat.rooms(room_id) ON DELETE CASCADE,user_id uuid NOT NULL,floor bigint NOT NULL CHECK(floor>=0),PRIMARY KEY(room_id,user_id),FOREIGN KEY(room_id,user_id) REFERENCES public.room_members(room_id,user_id) ON UPDATE CASCADE ON DELETE CASCADE);
CREATE TABLE xiangqi_chat.messages(id uuid PRIMARY KEY,room_id uuid NOT NULL REFERENCES xiangqi_chat.rooms(room_id) ON DELETE CASCADE,sequence bigint NOT NULL CHECK(sequence>0),sender_id uuid NOT NULL REFERENCES xiangqi_auth.principals(id) ON DELETE CASCADE,sender_role text NOT NULL CHECK(sender_role IN('red','black','spectator')),channel text NOT NULL CHECK(channel IN('PLAYERS_PRIVATE','ROOM_PUBLIC')),pair_epoch uuid,content text NOT NULL CHECK(char_length(content) BETWEEN 1 AND 600 AND btrim(content)<>''),created_at timestamptz NOT NULL,CHECK((channel='PLAYERS_PRIVATE')=(pair_epoch IS NOT NULL)),UNIQUE(room_id,sequence));
CREATE TABLE xiangqi_chat.receipts(actor_id uuid NOT NULL REFERENCES xiangqi_auth.principals(id) ON DELETE CASCADE,room_id uuid NOT NULL REFERENCES xiangqi_chat.rooms(room_id) ON DELETE CASCADE,command_id uuid NOT NULL,fingerprint text NOT NULL CHECK(fingerprint ~ '^[0-9a-f]{64}$'),channel text NOT NULL CHECK(channel IN('PLAYERS_PRIVATE','ROOM_PUBLIC')),pair_epoch uuid,message_id uuid NOT NULL REFERENCES xiangqi_chat.messages(id) ON DELETE CASCADE,sequence bigint NOT NULL,created_at timestamptz NOT NULL,expires_at timestamptz NOT NULL CHECK(expires_at=created_at+interval '24 hours'),CHECK((channel='PLAYERS_PRIVATE')=(pair_epoch IS NOT NULL)),PRIMARY KEY(actor_id,room_id,command_id));
CREATE INDEX chat_receipts_expiry ON xiangqi_chat.receipts(expires_at);
CREATE TABLE xiangqi_chat.rate(actor_id uuid PRIMARY KEY REFERENCES xiangqi_auth.principals(id) ON DELETE CASCADE,sent_at timestamptz[] NOT NULL CHECK(cardinality(sent_at)<=5 AND array_position(sent_at,NULL) IS NULL));
CREATE TABLE xiangqi_chat.outbox(message_id uuid PRIMARY KEY REFERENCES xiangqi_chat.messages(id) ON DELETE CASCADE,room_id uuid NOT NULL REFERENCES xiangqi_chat.rooms(room_id) ON DELETE CASCADE,sequence bigint NOT NULL,delivered_at timestamptz,attempts integer DEFAULT 0 NOT NULL CHECK(attempts>=0),next_attempt_at timestamptz NOT NULL);
CREATE INDEX chat_outbox_due ON xiangqi_chat.outbox(next_attempt_at,message_id) WHERE delivered_at IS NULL;
INSERT INTO xiangqi_chat.rooms(room_id,player_ids,pair_epoch) SELECT r.id,ARRAY(SELECT m.user_id FROM public.room_members m WHERE m.room_id=r.id AND m.role='PLAYER' ORDER BY m.user_id),pg_catalog.gen_random_uuid() FROM public.rooms r WHERE r.invite_code IS NOT NULL AND r.closed_at IS NULL AND r.status<>'CLOSED';
INSERT INTO xiangqi_chat.entries SELECT m.room_id,m.user_id,0 FROM public.room_members m JOIN xiangqi_chat.rooms c ON c.room_id=m.room_id;
CREATE FUNCTION xiangqi_chat.sync_membership() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$ DECLARE rid uuid;players uuid[];seq bigint;BEGIN
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
END $$;
CREATE FUNCTION xiangqi_chat.close_room() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$ BEGIN
 DELETE FROM xiangqi_chat.rooms WHERE room_id=NEW.id;RETURN NULL;
END $$;
CREATE TRIGGER chat_membership AFTER INSERT OR DELETE OR UPDATE OF role,user_id,room_id ON public.room_members FOR EACH ROW EXECUTE FUNCTION xiangqi_chat.sync_membership();
CREATE TRIGGER chat_room_closed AFTER UPDATE OF status,closed_at ON public.rooms FOR EACH ROW WHEN(NEW.invite_code IS NOT NULL AND (NEW.status='CLOSED' OR NEW.closed_at IS NOT NULL)) EXECUTE FUNCTION xiangqi_chat.close_room();
DO $$ DECLARE t text;BEGIN FOREACH t IN ARRAY ARRAY['rooms','entries','messages','receipts','rate','outbox'] LOOP
 EXECUTE pg_catalog.format('ALTER TABLE xiangqi_chat.%I OWNER TO postgres',t);
 EXECUTE pg_catalog.format('ALTER TABLE xiangqi_chat.%I ENABLE ROW LEVEL SECURITY',t);
 EXECUTE pg_catalog.format('ALTER TABLE xiangqi_chat.%I FORCE ROW LEVEL SECURITY',t);
 EXECUTE pg_catalog.format('REVOKE ALL ON xiangqi_chat.%I FROM PUBLIC,anon,authenticated,service_role',t);
 EXECUTE pg_catalog.format('GRANT SELECT,INSERT,DELETE ON xiangqi_chat.%I TO app_server',t);
 EXECUTE pg_catalog.format('CREATE POLICY chat_server ON xiangqi_chat.%I TO app_server USING(true) WITH CHECK(true)',t);
END LOOP;END $$;
GRANT UPDATE ON xiangqi_chat.rooms,xiangqi_chat.entries,xiangqi_chat.rate,xiangqi_chat.outbox TO app_server;
ALTER FUNCTION xiangqi_chat.sync_membership() OWNER TO postgres;
ALTER FUNCTION xiangqi_chat.close_room() OWNER TO postgres;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA xiangqi_chat FROM PUBLIC,anon,authenticated,service_role;
COMMIT;
