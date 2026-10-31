BEGIN;
ALTER TABLE public.match_events DROP CONSTRAINT match_events_type_check;
ALTER TABLE public.match_events ADD CONSTRAINT match_events_type_check CHECK (type IN ('START','MOVE','UNDO','PROPOSAL_CREATED','PROPOSAL_RESOLVED','RESULT','STILL_HERE'));
CREATE TABLE xiangqi_room.match_undo_offers (
 id uuid PRIMARY KEY,
 match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE RESTRICT,
 sender text NOT NULL CHECK(sender IN ('RED','BLACK')),
 status text NOT NULL CHECK(status IN ('PENDING','DECLINED','EXPIRED','WITHDRAWN','ACCEPTED','CLOSED')),
 created_at timestamptz NOT NULL,
 expires_at timestamptz NOT NULL CHECK(expires_at=created_at+interval '30 seconds'),
 resolved_at timestamptz,
 cooldown_after_move_count integer CHECK(cooldown_after_move_count>=0),
 CHECK((status='PENDING' AND resolved_at IS NULL AND cooldown_after_move_count IS NULL)
 OR (status IN ('DECLINED','EXPIRED') AND resolved_at IS NOT NULL AND cooldown_after_move_count IS NOT NULL)
 OR (status IN ('WITHDRAWN','ACCEPTED','CLOSED') AND resolved_at IS NOT NULL AND cooldown_after_move_count IS NULL))
);
ALTER TABLE xiangqi_room.match_undo_offers OWNER TO postgres;
REVOKE ALL ON xiangqi_room.match_undo_offers FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE ON xiangqi_room.match_undo_offers TO app_server;
ALTER TABLE xiangqi_room.match_undo_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE xiangqi_room.match_undo_offers FORCE ROW LEVEL SECURITY;
CREATE POLICY app_server_all ON xiangqi_room.match_undo_offers TO app_server USING(true) WITH CHECK(true);
CREATE UNIQUE INDEX match_undo_pending_sender ON xiangqi_room.match_undo_offers(match_id,sender) WHERE status='PENDING';
CREATE FUNCTION xiangqi_room.close_match_undo_offers() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$ BEGIN
 UPDATE xiangqi_room.match_undo_offers SET status='CLOSED',resolved_at=pg_catalog.clock_timestamp() WHERE match_id=NEW.id AND status='PENDING';
 RETURN NEW;
END $$;
ALTER FUNCTION xiangqi_room.close_match_undo_offers() OWNER TO postgres;
REVOKE ALL ON FUNCTION xiangqi_room.close_match_undo_offers() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER match_undo_terminal AFTER UPDATE OF status ON public.matches FOR EACH ROW WHEN(OLD.status='ACTIVE' AND NEW.status IN('FINISHED','INTERRUPTED')) EXECUTE FUNCTION xiangqi_room.close_match_undo_offers();
COMMIT;
