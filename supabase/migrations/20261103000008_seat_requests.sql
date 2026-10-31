BEGIN;
SET LOCAL search_path=pg_catalog,public;
LOCK TABLE public.rooms IN ACCESS EXCLUSIVE MODE;
DO $$ BEGIN
 IF to_regclass('xiangqi_room.seat_invites') IS NULL THEN RAISE EXCEPTION 'Seat invite schema missing'; END IF;
END $$;
CREATE TABLE xiangqi_room.seat_requests (
 id uuid PRIMARY KEY,
 room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE RESTRICT,
 requester_id uuid NOT NULL,
 status text NOT NULL CHECK(status IN('PENDING','ACCEPTED','DECLINED','EXPIRED','CLOSED')),
 created_at timestamptz NOT NULL,
 expires_at timestamptz NOT NULL CHECK(expires_at=created_at+interval '30 seconds'),
 resolved_at timestamptz,
 CHECK((status='PENDING' AND resolved_at IS NULL)
 OR (status IN('ACCEPTED','DECLINED','EXPIRED','CLOSED') AND resolved_at IS NOT NULL))
);
ALTER TABLE xiangqi_room.seat_requests OWNER TO postgres;
REVOKE ALL ON xiangqi_room.seat_requests FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE ON xiangqi_room.seat_requests TO app_server;
ALTER TABLE xiangqi_room.seat_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE xiangqi_room.seat_requests FORCE ROW LEVEL SECURITY;
CREATE POLICY app_server_all ON xiangqi_room.seat_requests TO app_server USING(true) WITH CHECK(true);
CREATE UNIQUE INDEX seat_request_pending_requester ON xiangqi_room.seat_requests(room_id,requester_id) WHERE status='PENDING';
CREATE INDEX seat_request_requester_history ON xiangqi_room.seat_requests(room_id,requester_id,created_at DESC);
CREATE FUNCTION xiangqi_room.close_seat_requests() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$ BEGIN
 UPDATE xiangqi_room.seat_requests SET status='CLOSED',resolved_at=pg_catalog.clock_timestamp() WHERE room_id=NEW.id AND status='PENDING';
 RETURN NEW;
END $$;
ALTER FUNCTION xiangqi_room.close_seat_requests() OWNER TO postgres;
REVOKE ALL ON FUNCTION xiangqi_room.close_seat_requests() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER seat_request_waiting_exit AFTER UPDATE OF status ON public.rooms FOR EACH ROW WHEN(OLD.status='WAITING' AND NEW.status<>'WAITING') EXECUTE FUNCTION xiangqi_room.close_seat_requests();
COMMIT;
