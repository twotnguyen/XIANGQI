BEGIN;
SET LOCAL search_path=pg_catalog,public;
LOCK TABLE xiangqi_social.friend_requests,xiangqi_social.friendships,xiangqi_social.friend_decline_counts,xiangqi_social.room_invites,xiangqi_room.media_share,xiangqi_room.room_blocks,xiangqi_room.seat_invites,xiangqi_room.side_swap_offers IN ACCESS EXCLUSIVE MODE;
DO $$ BEGIN
 IF (SELECT pg_catalog.pg_get_constraintdef(oid) FROM pg_catalog.pg_constraint WHERE conrelid='xiangqi_social.friend_requests'::regclass AND conname='friend_requests_sender_principal_fk') IS DISTINCT FROM 'FOREIGN KEY (sender_id) REFERENCES xiangqi_auth.principals(id) ON DELETE CASCADE'
 OR (SELECT pg_catalog.pg_get_constraintdef(oid) FROM pg_catalog.pg_constraint WHERE conrelid='xiangqi_social.friend_requests'::regclass AND conname='friend_requests_receiver_principal_fk') IS DISTINCT FROM 'FOREIGN KEY (receiver_id) REFERENCES xiangqi_auth.principals(id) ON DELETE CASCADE'
 OR (SELECT pg_catalog.pg_get_constraintdef(oid) FROM pg_catalog.pg_constraint WHERE conrelid='xiangqi_social.friendships'::regclass AND conname='friendships_user_a_principal_fk') IS DISTINCT FROM 'FOREIGN KEY (user_a) REFERENCES xiangqi_auth.principals(id) ON DELETE CASCADE'
 OR (SELECT pg_catalog.pg_get_constraintdef(oid) FROM pg_catalog.pg_constraint WHERE conrelid='xiangqi_social.friendships'::regclass AND conname='friendships_user_b_principal_fk') IS DISTINCT FROM 'FOREIGN KEY (user_b) REFERENCES xiangqi_auth.principals(id) ON DELETE CASCADE'
 OR (SELECT pg_catalog.pg_get_constraintdef(oid) FROM pg_catalog.pg_constraint WHERE conrelid='xiangqi_social.friend_decline_counts'::regclass AND conname='friend_decline_blocker_principal_fk') IS DISTINCT FROM 'FOREIGN KEY (blocker_id) REFERENCES xiangqi_auth.principals(id) ON DELETE CASCADE'
 OR (SELECT pg_catalog.pg_get_constraintdef(oid) FROM pg_catalog.pg_constraint WHERE conrelid='xiangqi_social.friend_decline_counts'::regclass AND conname='friend_decline_requester_principal_fk') IS DISTINCT FROM 'FOREIGN KEY (requester_id) REFERENCES xiangqi_auth.principals(id) ON DELETE CASCADE'
 OR (SELECT pg_catalog.pg_get_constraintdef(oid) FROM pg_catalog.pg_constraint WHERE conrelid='xiangqi_social.room_invites'::regclass AND conname='room_invites_inviter_principal_fk') IS DISTINCT FROM 'FOREIGN KEY (inviter_id) REFERENCES xiangqi_auth.principals(id) ON DELETE CASCADE'
 OR (SELECT pg_catalog.pg_get_constraintdef(oid) FROM pg_catalog.pg_constraint WHERE conrelid='xiangqi_social.room_invites'::regclass AND conname='room_invites_invitee_principal_fk') IS DISTINCT FROM 'FOREIGN KEY (invitee_id) REFERENCES xiangqi_auth.principals(id) ON DELETE CASCADE'
 OR (SELECT pg_catalog.pg_get_constraintdef(oid) FROM pg_catalog.pg_constraint WHERE conrelid='xiangqi_room.media_share'::regclass AND conname='media_share_user_principal_fk') IS DISTINCT FROM 'FOREIGN KEY (user_id) REFERENCES xiangqi_auth.principals(id) ON DELETE CASCADE'
 OR (SELECT pg_catalog.pg_get_constraintdef(oid) FROM pg_catalog.pg_constraint WHERE conrelid='xiangqi_room.room_blocks'::regclass AND conname='room_blocks_user_principal_fk') IS DISTINCT FROM 'FOREIGN KEY (user_id) REFERENCES xiangqi_auth.principals(id) ON DELETE CASCADE'
 OR (SELECT pg_catalog.pg_get_constraintdef(oid) FROM pg_catalog.pg_constraint WHERE conrelid='xiangqi_room.seat_invites'::regclass AND conname='seat_invites_inviter_principal_fk') IS DISTINCT FROM 'FOREIGN KEY (inviter_id) REFERENCES xiangqi_auth.principals(id) ON DELETE CASCADE'
 OR (SELECT pg_catalog.pg_get_constraintdef(oid) FROM pg_catalog.pg_constraint WHERE conrelid='xiangqi_room.seat_invites'::regclass AND conname='seat_invites_invitee_principal_fk') IS DISTINCT FROM 'FOREIGN KEY (invitee_id) REFERENCES xiangqi_auth.principals(id) ON DELETE CASCADE'
 OR (SELECT pg_catalog.pg_get_constraintdef(oid) FROM pg_catalog.pg_constraint WHERE conrelid='xiangqi_room.side_swap_offers'::regclass AND conname='side_swap_proposer_principal_fk') IS DISTINCT FROM 'FOREIGN KEY (proposer_id) REFERENCES xiangqi_auth.principals(id) ON DELETE CASCADE'
 OR (SELECT pg_catalog.pg_get_constraintdef(oid) FROM pg_catalog.pg_constraint WHERE conrelid='xiangqi_room.side_swap_offers'::regclass AND conname='side_swap_responder_principal_fk') IS DISTINCT FROM 'FOREIGN KEY (responder_id) REFERENCES xiangqi_auth.principals(id) ON DELETE CASCADE'
 THEN RAISE EXCEPTION 'Principal FK definitions changed after migration 20261019000019'; END IF;
END $$;
ALTER TABLE xiangqi_social.friend_requests DROP CONSTRAINT friend_requests_sender_principal_fk;
ALTER TABLE xiangqi_social.friend_requests DROP CONSTRAINT friend_requests_receiver_principal_fk;
ALTER TABLE xiangqi_social.friendships DROP CONSTRAINT friendships_user_a_principal_fk;
ALTER TABLE xiangqi_social.friendships DROP CONSTRAINT friendships_user_b_principal_fk;
ALTER TABLE xiangqi_social.friend_decline_counts DROP CONSTRAINT friend_decline_blocker_principal_fk;
ALTER TABLE xiangqi_social.friend_decline_counts DROP CONSTRAINT friend_decline_requester_principal_fk;
ALTER TABLE xiangqi_social.room_invites DROP CONSTRAINT room_invites_inviter_principal_fk;
ALTER TABLE xiangqi_social.room_invites DROP CONSTRAINT room_invites_invitee_principal_fk;
ALTER TABLE xiangqi_room.media_share DROP CONSTRAINT media_share_user_principal_fk;
ALTER TABLE xiangqi_room.room_blocks DROP CONSTRAINT room_blocks_user_principal_fk;
ALTER TABLE xiangqi_room.seat_invites DROP CONSTRAINT seat_invites_inviter_principal_fk;
ALTER TABLE xiangqi_room.seat_invites DROP CONSTRAINT seat_invites_invitee_principal_fk;
ALTER TABLE xiangqi_room.side_swap_offers DROP CONSTRAINT side_swap_proposer_principal_fk;
ALTER TABLE xiangqi_room.side_swap_offers DROP CONSTRAINT side_swap_responder_principal_fk;
COMMIT;
