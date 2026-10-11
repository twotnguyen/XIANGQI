BEGIN;
SET LOCAL search_path=pg_catalog,public;
CREATE SCHEMA xiangqi_social;
ALTER SCHEMA xiangqi_social OWNER TO postgres;
CREATE TABLE xiangqi_social.friend_requests (
 id uuid PRIMARY KEY,
 sender_id uuid NOT NULL,
 receiver_id uuid NOT NULL,
 status text NOT NULL CHECK(status IN('PENDING','ACCEPTED','DECLINED','REVOKED','EXPIRED')),
 created_at timestamptz NOT NULL,
 expires_at timestamptz NOT NULL CHECK(expires_at=created_at+interval '30 days'),
 resolved_at timestamptz,
 CHECK(sender_id<>receiver_id),
 CHECK((status='PENDING' AND resolved_at IS NULL)
 OR (status IN('ACCEPTED','DECLINED','REVOKED','EXPIRED') AND resolved_at IS NOT NULL))
);
CREATE TABLE xiangqi_social.friendships (
 user_a uuid NOT NULL,
 user_b uuid NOT NULL CHECK(user_a<user_b),
 created_at timestamptz NOT NULL,
 PRIMARY KEY(user_a,user_b)
);
CREATE TABLE xiangqi_social.friend_decline_counts (
 blocker_id uuid NOT NULL,
 requester_id uuid NOT NULL CHECK(blocker_id<>requester_id),
 declines integer NOT NULL CHECK(declines>=0),
 PRIMARY KEY(blocker_id,requester_id)
);
CREATE TABLE xiangqi_social.room_invites (
 id uuid PRIMARY KEY,
 room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE RESTRICT,
 inviter_id uuid NOT NULL,
 invitee_id uuid NOT NULL,
 status text NOT NULL CHECK(status IN('PENDING','ACCEPTED','DECLINED','EXPIRED','REVOKED')),
 created_at timestamptz NOT NULL,
 expires_at timestamptz NOT NULL CHECK(expires_at=created_at+interval '30 seconds'),
 resolved_at timestamptz,
 CHECK(inviter_id<>invitee_id),
 CHECK((status='PENDING' AND resolved_at IS NULL)
 OR (status IN('ACCEPTED','DECLINED','EXPIRED','REVOKED') AND resolved_at IS NOT NULL))
);
ALTER TABLE xiangqi_social.friend_requests OWNER TO postgres;
ALTER TABLE xiangqi_social.friendships OWNER TO postgres;
ALTER TABLE xiangqi_social.friend_decline_counts OWNER TO postgres;
ALTER TABLE xiangqi_social.room_invites OWNER TO postgres;
REVOKE ALL ON SCHEMA xiangqi_social FROM PUBLIC,anon,authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA xiangqi_social FROM PUBLIC,anon,authenticated;
GRANT USAGE ON SCHEMA xiangqi_social TO app_server;
GRANT SELECT,INSERT,UPDATE ON xiangqi_social.friend_requests TO app_server;
GRANT SELECT,INSERT,DELETE ON xiangqi_social.friendships TO app_server;
GRANT SELECT,INSERT,UPDATE ON xiangqi_social.friend_decline_counts TO app_server;
GRANT SELECT,INSERT,UPDATE ON xiangqi_social.room_invites TO app_server;
CREATE UNIQUE INDEX friend_request_pending_pair ON xiangqi_social.friend_requests(LEAST(sender_id,receiver_id),GREATEST(sender_id,receiver_id)) WHERE status='PENDING';
COMMIT;
