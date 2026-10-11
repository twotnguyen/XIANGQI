BEGIN;
SET LOCAL search_path=pg_catalog,public;
CREATE TABLE xiangqi_room.side_swap_offers (
 id uuid PRIMARY KEY,
 room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE RESTRICT,
 proposer_id uuid NOT NULL,
 responder_id uuid NOT NULL,
 status text NOT NULL CHECK(status IN('PENDING','ACCEPTED','DECLINED','WITHDRAWN','EXPIRED','CLOSED')),
 created_at timestamptz NOT NULL,
 expires_at timestamptz NOT NULL CHECK(expires_at=created_at+interval '30 seconds'),
 resolved_at timestamptz,
 CHECK(proposer_id<>responder_id),
 CHECK((status='PENDING' AND resolved_at IS NULL)
 OR (status IN('ACCEPTED','DECLINED','WITHDRAWN','EXPIRED','CLOSED') AND resolved_at IS NOT NULL))
);
ALTER TABLE xiangqi_room.side_swap_offers OWNER TO postgres;
REVOKE ALL ON xiangqi_room.side_swap_offers FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE ON xiangqi_room.side_swap_offers TO app_server;
CREATE UNIQUE INDEX side_swap_pending_room ON xiangqi_room.side_swap_offers(room_id) WHERE status='PENDING';
CREATE FUNCTION xiangqi_room.close_side_swap_offers() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$ BEGIN
 UPDATE xiangqi_room.side_swap_offers SET status='CLOSED',resolved_at=pg_catalog.clock_timestamp() WHERE room_id=NEW.id AND status='PENDING';
 RETURN NEW;
END $$;
ALTER FUNCTION xiangqi_room.close_side_swap_offers() OWNER TO postgres;
REVOKE ALL ON FUNCTION xiangqi_room.close_side_swap_offers() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER side_swap_waiting_exit AFTER UPDATE OF status ON public.rooms FOR EACH ROW WHEN(OLD.status='WAITING' AND NEW.status<>'WAITING') EXECUTE FUNCTION xiangqi_room.close_side_swap_offers();
COMMIT;
