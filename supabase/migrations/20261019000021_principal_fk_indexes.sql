BEGIN;
SET LOCAL search_path=pg_catalog,public;
LOCK TABLE xiangqi_social.friend_decline_counts,xiangqi_social.room_invites,xiangqi_room.media_share,xiangqi_room.room_blocks,xiangqi_room.seat_invites,xiangqi_room.side_swap_offers IN ACCESS EXCLUSIVE MODE;
DO $$ BEGIN
 IF pg_catalog.to_regclass('xiangqi_social.friend_decline_requester_idx') IS NOT NULL
 OR pg_catalog.to_regclass('xiangqi_social.room_invites_inviter_idx') IS NOT NULL
 OR pg_catalog.to_regclass('xiangqi_social.room_invites_room_idx') IS NOT NULL
 OR pg_catalog.to_regclass('xiangqi_room.media_share_user_idx') IS NOT NULL
 OR pg_catalog.to_regclass('xiangqi_room.room_blocks_user_idx') IS NOT NULL
 OR pg_catalog.to_regclass('xiangqi_room.seat_invites_inviter_idx') IS NOT NULL
 OR pg_catalog.to_regclass('xiangqi_room.seat_invites_invitee_idx') IS NOT NULL
 OR pg_catalog.to_regclass('xiangqi_room.side_swap_proposer_idx') IS NOT NULL
 OR pg_catalog.to_regclass('xiangqi_room.side_swap_responder_idx') IS NOT NULL
 THEN RAISE EXCEPTION 'An index reserved for migration 20261019000021 already exists'; END IF;
END $$;
CREATE INDEX friend_decline_requester_idx ON xiangqi_social.friend_decline_counts(requester_id);
CREATE INDEX room_invites_inviter_idx ON xiangqi_social.room_invites(inviter_id);
CREATE INDEX room_invites_room_idx ON xiangqi_social.room_invites(room_id);
CREATE INDEX media_share_user_idx ON xiangqi_room.media_share(user_id);
CREATE INDEX room_blocks_user_idx ON xiangqi_room.room_blocks(user_id);
CREATE INDEX seat_invites_inviter_idx ON xiangqi_room.seat_invites(inviter_id);
CREATE INDEX seat_invites_invitee_idx ON xiangqi_room.seat_invites(invitee_id);
CREATE INDEX side_swap_proposer_idx ON xiangqi_room.side_swap_offers(proposer_id);
CREATE INDEX side_swap_responder_idx ON xiangqi_room.side_swap_offers(responder_id);
COMMIT;
