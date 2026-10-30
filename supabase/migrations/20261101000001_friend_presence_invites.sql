BEGIN;
SET LOCAL search_path=pg_catalog,public;

-- Expiration is already required; clear old pending rows before enforcing dedupe.
UPDATE xiangqi_social.room_invites SET status='EXPIRED',resolved_at=clock_timestamp()
 WHERE status='PENDING' AND expires_at<=clock_timestamp();
-- Presence theo từng tab: heartbeat 2s, lease TTL 8s. Không có lease hợp lệ = offline.
CREATE TABLE xiangqi_social.presence_leases (
 user_id uuid NOT NULL REFERENCES xiangqi_auth.principals(id) ON DELETE CASCADE,
 connection_id uuid NOT NULL,
 expires_at timestamptz NOT NULL,
 PRIMARY KEY(user_id,connection_id)
);
CREATE INDEX presence_leases_expiry ON xiangqi_social.presence_leases(user_id,expires_at);

-- Cooldown mời vào phòng, toàn cục theo người gửi và bền qua restart.
CREATE TABLE xiangqi_social.invite_cooldowns (
 sender_id uuid PRIMARY KEY REFERENCES xiangqi_auth.principals(id) ON DELETE CASCADE,
 until timestamptz NOT NULL
);

-- Thông báo "bị từ chối": tối đa một dòng cho mỗi lời mời; người gửi ack để tiêu thụ.
CREATE TABLE xiangqi_social.room_invite_declines (
 id uuid PRIMARY KEY,
 invite_id uuid NOT NULL UNIQUE REFERENCES xiangqi_social.room_invites(id) ON DELETE CASCADE,
 sender_id uuid NOT NULL REFERENCES xiangqi_auth.principals(id) ON DELETE CASCADE,
 invitee_id uuid NOT NULL REFERENCES xiangqi_auth.principals(id) ON DELETE CASCADE,
 created_at timestamptz NOT NULL,
 acked_at timestamptz,
 CHECK(sender_id<>invitee_id)
);
CREATE INDEX room_invite_declines_sender ON xiangqi_social.room_invite_declines(sender_id);
CREATE INDEX room_invite_declines_invitee ON xiangqi_social.room_invite_declines(invitee_id);

-- Idempotency cho phản hồi lời mời (commandId từ FE) và replay của lần chấp nhận đã thành công.
ALTER TABLE xiangqi_social.room_invites
 ADD COLUMN response_command_id uuid,
 ADD COLUMN response_body jsonb,
 ADD CHECK((response_command_id IS NULL)=(response_body IS NULL));

-- Dedupe lời mời PENDING: cùng phòng, người mời, người được mời chỉ có một dòng đang chờ.
CREATE UNIQUE INDEX room_invite_pending_dedupe ON xiangqi_social.room_invites(room_id,inviter_id,invitee_id) WHERE status='PENDING';

REVOKE ALL ON xiangqi_social.presence_leases,xiangqi_social.invite_cooldowns,xiangqi_social.room_invite_declines FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON xiangqi_social.presence_leases TO app_server;
GRANT SELECT,INSERT,UPDATE ON xiangqi_social.invite_cooldowns TO app_server;
GRANT SELECT,INSERT,UPDATE ON xiangqi_social.room_invite_declines TO app_server;
GRANT DELETE ON xiangqi_social.friend_decline_counts TO app_server;

ALTER TABLE xiangqi_social.presence_leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE xiangqi_social.presence_leases FORCE ROW LEVEL SECURITY;
CREATE POLICY app_server_all ON xiangqi_social.presence_leases TO app_server USING(true) WITH CHECK(true);
ALTER TABLE xiangqi_social.invite_cooldowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE xiangqi_social.invite_cooldowns FORCE ROW LEVEL SECURITY;
CREATE POLICY app_server_all ON xiangqi_social.invite_cooldowns TO app_server USING(true) WITH CHECK(true);
ALTER TABLE xiangqi_social.room_invite_declines ENABLE ROW LEVEL SECURITY;
ALTER TABLE xiangqi_social.room_invite_declines FORCE ROW LEVEL SECURITY;
CREATE POLICY app_server_all ON xiangqi_social.room_invite_declines TO app_server USING(true) WITH CHECK(true);

CREATE FUNCTION xiangqi_social.revoke_room_invites() RETURNS trigger
LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN
 IF NEW.visibility='LOCKED' OR NEW.closed_at IS NOT NULL THEN
  UPDATE xiangqi_social.room_invites SET status='REVOKED',resolved_at=clock_timestamp()
   WHERE room_id=NEW.id AND status='PENDING';
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION xiangqi_social.revoke_room_invites() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER social_room_invites_revoked AFTER UPDATE OF visibility,closed_at ON public.rooms
 FOR EACH ROW EXECUTE FUNCTION xiangqi_social.revoke_room_invites();
COMMIT;
