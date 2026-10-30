BEGIN;
SET LOCAL search_path=pg_catalog,public;

-- Đề nghị tái đấu sau ván phòng tùy chỉnh: người đề nghị chọn giữ phe hoặc đổi phe, đối thủ có 30 giây để đồng ý.
CREATE TABLE xiangqi_room.rematch_offers (
 id uuid PRIMARY KEY,
 room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE RESTRICT,
 match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE RESTRICT,
 proposer_id uuid NOT NULL,
 responder_id uuid NOT NULL,
 side text NOT NULL CHECK(side IN('KEEP','SWAP')),
 status text NOT NULL CHECK(status IN('PENDING','ACCEPTED','DECLINED','EXPIRED','CLOSED')),
 created_at timestamptz NOT NULL,
 expires_at timestamptz NOT NULL CHECK(expires_at=created_at+interval '30 seconds'),
 resolved_at timestamptz,
 CHECK(proposer_id<>responder_id),
 CHECK((status='PENDING' AND resolved_at IS NULL)
 OR (status IN('ACCEPTED','DECLINED','EXPIRED','CLOSED') AND resolved_at IS NOT NULL))
);
ALTER TABLE xiangqi_room.rematch_offers OWNER TO postgres;
REVOKE ALL ON xiangqi_room.rematch_offers FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE ON xiangqi_room.rematch_offers TO app_server;
ALTER TABLE xiangqi_room.rematch_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE xiangqi_room.rematch_offers FORCE ROW LEVEL SECURITY;
CREATE POLICY app_server_all ON xiangqi_room.rematch_offers TO app_server USING(true) WITH CHECK(true);
-- Tối đa một đề nghị đang chờ cho mỗi phòng: đề nghị đồng thời, người đến sau bị từ chối bởi unique index.
CREATE UNIQUE INDEX rematch_offers_pending_room ON xiangqi_room.rematch_offers(room_id) WHERE status='PENDING';

-- Rời khỏi WAITING (bắt đầu ván, đóng phòng...) làm đề nghị cũ vô hiệu.
CREATE FUNCTION xiangqi_room.close_rematch_offers() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ BEGIN
 UPDATE xiangqi_room.rematch_offers SET status='CLOSED',resolved_at=pg_catalog.clock_timestamp() WHERE room_id=NEW.id AND status='PENDING';
 RETURN NEW;
END $$;
ALTER FUNCTION xiangqi_room.close_rematch_offers() OWNER TO postgres;
REVOKE ALL ON FUNCTION xiangqi_room.close_rematch_offers() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER rematch_waiting_exit AFTER UPDATE OF status ON public.rooms FOR EACH ROW WHEN(OLD.status='WAITING' AND NEW.status<>'WAITING') EXECUTE FUNCTION xiangqi_room.close_rematch_offers();

-- Thay đổi ghế (vào/ra người chơi, đổi phe) làm đề nghị cũ vô hiệu. Khán giả không ảnh hưởng.
CREATE FUNCTION xiangqi_room.close_rematch_on_seat_change() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ BEGIN
 IF TG_OP='DELETE' OR (TG_OP='INSERT' AND NEW.role='PLAYER')
 OR (TG_OP='UPDATE' AND (NEW.role IS DISTINCT FROM OLD.role OR NEW.side IS DISTINCT FROM OLD.side)) THEN
  UPDATE xiangqi_room.rematch_offers SET status='CLOSED',resolved_at=pg_catalog.clock_timestamp()
   WHERE room_id=COALESCE(NEW.room_id,OLD.room_id) AND status='PENDING';
 END IF;
 RETURN NULL;
END $$;
ALTER FUNCTION xiangqi_room.close_rematch_on_seat_change() OWNER TO postgres;
REVOKE ALL ON FUNCTION xiangqi_room.close_rematch_on_seat_change() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER rematch_seat_change AFTER INSERT OR DELETE OR UPDATE OF role,side ON public.room_members FOR EACH ROW EXECUTE FUNCTION xiangqi_room.close_rematch_on_seat_change();
COMMIT;
