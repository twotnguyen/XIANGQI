BEGIN;
SET LOCAL search_path=pg_catalog,public;
CREATE TABLE xiangqi_room.room_blocks (
 room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE RESTRICT,
 user_id uuid NOT NULL,
 created_at timestamptz NOT NULL,
 PRIMARY KEY(room_id,user_id)
);
CREATE TABLE xiangqi_room.seat_invites (
 id uuid PRIMARY KEY,
 room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE RESTRICT,
 inviter_id uuid NOT NULL,
 invitee_id uuid NOT NULL,
 status text NOT NULL CHECK(status IN('PENDING','ACCEPTED','DECLINED','EXPIRED','CLOSED')),
 created_at timestamptz NOT NULL,
 expires_at timestamptz NOT NULL CHECK(expires_at=created_at+interval '30 seconds'),
 resolved_at timestamptz,
 CHECK(inviter_id<>invitee_id),
 CHECK((status='PENDING' AND resolved_at IS NULL)
 OR (status IN('ACCEPTED','DECLINED','EXPIRED','CLOSED') AND resolved_at IS NOT NULL))
);
ALTER TABLE xiangqi_room.room_blocks OWNER TO postgres;
ALTER TABLE xiangqi_room.seat_invites OWNER TO postgres;
REVOKE ALL ON xiangqi_room.room_blocks FROM PUBLIC,anon,authenticated;
REVOKE ALL ON xiangqi_room.seat_invites FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,DELETE ON xiangqi_room.room_blocks TO app_server;
GRANT SELECT,INSERT,UPDATE ON xiangqi_room.seat_invites TO app_server;
CREATE UNIQUE INDEX seat_invite_pending_room ON xiangqi_room.seat_invites(room_id) WHERE status='PENDING';
CREATE FUNCTION xiangqi_room.close_seat_invites() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$ BEGIN
 UPDATE xiangqi_room.seat_invites SET status='CLOSED',resolved_at=pg_catalog.clock_timestamp() WHERE room_id=NEW.id AND status='PENDING';
 RETURN NEW;
END $$;
ALTER FUNCTION xiangqi_room.close_seat_invites() OWNER TO postgres;
REVOKE ALL ON FUNCTION xiangqi_room.close_seat_invites() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER seat_invite_waiting_exit AFTER UPDATE OF status ON public.rooms FOR EACH ROW WHEN(OLD.status='WAITING' AND NEW.status<>'WAITING') EXECUTE FUNCTION xiangqi_room.close_seat_invites();
COMMIT;
