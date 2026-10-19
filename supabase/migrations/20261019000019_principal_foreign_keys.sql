BEGIN;
SET LOCAL search_path=pg_catalog,public;
LOCK TABLE xiangqi_social.friend_requests,xiangqi_social.friendships,xiangqi_social.friend_decline_counts,xiangqi_social.room_invites,xiangqi_room.media_share,xiangqi_room.room_blocks,xiangqi_room.seat_invites,xiangqi_room.side_swap_offers IN ACCESS EXCLUSIVE MODE;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM xiangqi_social.friend_requests x LEFT JOIN xiangqi_auth.principals p ON p.id=x.sender_id WHERE p.id IS NULL)
 OR EXISTS(SELECT 1 FROM xiangqi_social.friend_requests x LEFT JOIN xiangqi_auth.principals p ON p.id=x.receiver_id WHERE p.id IS NULL)
 OR EXISTS(SELECT 1 FROM xiangqi_social.friendships x LEFT JOIN xiangqi_auth.principals p ON p.id=x.user_a WHERE p.id IS NULL)
 OR EXISTS(SELECT 1 FROM xiangqi_social.friendships x LEFT JOIN xiangqi_auth.principals p ON p.id=x.user_b WHERE p.id IS NULL)
 OR EXISTS(SELECT 1 FROM xiangqi_social.friend_decline_counts x LEFT JOIN xiangqi_auth.principals p ON p.id=x.blocker_id WHERE p.id IS NULL)
 OR EXISTS(SELECT 1 FROM xiangqi_social.friend_decline_counts x LEFT JOIN xiangqi_auth.principals p ON p.id=x.requester_id WHERE p.id IS NULL)
 OR EXISTS(SELECT 1 FROM xiangqi_social.room_invites x LEFT JOIN xiangqi_auth.principals p ON p.id=x.inviter_id WHERE p.id IS NULL)
 OR EXISTS(SELECT 1 FROM xiangqi_social.room_invites x LEFT JOIN xiangqi_auth.principals p ON p.id=x.invitee_id WHERE p.id IS NULL)
 OR EXISTS(SELECT 1 FROM xiangqi_room.media_share x LEFT JOIN xiangqi_auth.principals p ON p.id=x.user_id WHERE p.id IS NULL)
 OR EXISTS(SELECT 1 FROM xiangqi_room.room_blocks x LEFT JOIN xiangqi_auth.principals p ON p.id=x.user_id WHERE p.id IS NULL)
 OR EXISTS(SELECT 1 FROM xiangqi_room.seat_invites x LEFT JOIN xiangqi_auth.principals p ON p.id=x.inviter_id WHERE p.id IS NULL)
 OR EXISTS(SELECT 1 FROM xiangqi_room.seat_invites x LEFT JOIN xiangqi_auth.principals p ON p.id=x.invitee_id WHERE p.id IS NULL)
 OR EXISTS(SELECT 1 FROM xiangqi_room.side_swap_offers x LEFT JOIN xiangqi_auth.principals p ON p.id=x.proposer_id WHERE p.id IS NULL)
 OR EXISTS(SELECT 1 FROM xiangqi_room.side_swap_offers x LEFT JOIN xiangqi_auth.principals p ON p.id=x.responder_id WHERE p.id IS NULL)
 THEN RAISE EXCEPTION 'Orphan social/room principal reference; repair required before FK migration'; END IF;
END $$;
ALTER TABLE xiangqi_social.friend_requests ADD CONSTRAINT friend_requests_sender_principal_fk FOREIGN KEY(sender_id) REFERENCES xiangqi_auth.principals(id) ON DELETE CASCADE;
ALTER TABLE xiangqi_social.friend_requests ADD CONSTRAINT friend_requests_receiver_principal_fk FOREIGN KEY(receiver_id) REFERENCES xiangqi_auth.principals(id) ON DELETE CASCADE;
ALTER TABLE xiangqi_social.friendships ADD CONSTRAINT friendships_user_a_principal_fk FOREIGN KEY(user_a) REFERENCES xiangqi_auth.principals(id) ON DELETE CASCADE;
ALTER TABLE xiangqi_social.friendships ADD CONSTRAINT friendships_user_b_principal_fk FOREIGN KEY(user_b) REFERENCES xiangqi_auth.principals(id) ON DELETE CASCADE;
ALTER TABLE xiangqi_social.friend_decline_counts ADD CONSTRAINT friend_decline_blocker_principal_fk FOREIGN KEY(blocker_id) REFERENCES xiangqi_auth.principals(id) ON DELETE CASCADE;
ALTER TABLE xiangqi_social.friend_decline_counts ADD CONSTRAINT friend_decline_requester_principal_fk FOREIGN KEY(requester_id) REFERENCES xiangqi_auth.principals(id) ON DELETE CASCADE;
ALTER TABLE xiangqi_social.room_invites ADD CONSTRAINT room_invites_inviter_principal_fk FOREIGN KEY(inviter_id) REFERENCES xiangqi_auth.principals(id) ON DELETE CASCADE;
ALTER TABLE xiangqi_social.room_invites ADD CONSTRAINT room_invites_invitee_principal_fk FOREIGN KEY(invitee_id) REFERENCES xiangqi_auth.principals(id) ON DELETE CASCADE;
ALTER TABLE xiangqi_room.media_share ADD CONSTRAINT media_share_user_principal_fk FOREIGN KEY(user_id) REFERENCES xiangqi_auth.principals(id) ON DELETE CASCADE;
ALTER TABLE xiangqi_room.room_blocks ADD CONSTRAINT room_blocks_user_principal_fk FOREIGN KEY(user_id) REFERENCES xiangqi_auth.principals(id) ON DELETE CASCADE;
ALTER TABLE xiangqi_room.seat_invites ADD CONSTRAINT seat_invites_inviter_principal_fk FOREIGN KEY(inviter_id) REFERENCES xiangqi_auth.principals(id) ON DELETE CASCADE;
ALTER TABLE xiangqi_room.seat_invites ADD CONSTRAINT seat_invites_invitee_principal_fk FOREIGN KEY(invitee_id) REFERENCES xiangqi_auth.principals(id) ON DELETE CASCADE;
ALTER TABLE xiangqi_room.side_swap_offers ADD CONSTRAINT side_swap_proposer_principal_fk FOREIGN KEY(proposer_id) REFERENCES xiangqi_auth.principals(id) ON DELETE CASCADE;
ALTER TABLE xiangqi_room.side_swap_offers ADD CONSTRAINT side_swap_responder_principal_fk FOREIGN KEY(responder_id) REFERENCES xiangqi_auth.principals(id) ON DELETE CASCADE;
COMMIT;
