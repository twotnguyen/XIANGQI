BEGIN;
SET LOCAL search_path=pg_catalog,public;
LOCK TABLE xiangqi_social.friend_requests,xiangqi_social.friendships,xiangqi_social.friend_decline_counts,xiangqi_social.room_invites IN ACCESS EXCLUSIVE MODE;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM xiangqi_social.friend_requests)
 OR EXISTS(SELECT 1 FROM xiangqi_social.friendships)
 OR EXISTS(SELECT 1 FROM xiangqi_social.friend_decline_counts)
 OR EXISTS(SELECT 1 FROM xiangqi_social.room_invites)
 THEN RAISE EXCEPTION 'Friend feature writes exist; rollback refused'; END IF;
 IF (SELECT array_agg(attname::text ORDER BY attnum) FROM pg_catalog.pg_attribute WHERE attrelid='xiangqi_social.friend_requests'::pg_catalog.regclass AND attnum>0 AND NOT attisdropped) IS DISTINCT FROM ARRAY['id','sender_id','receiver_id','status','created_at','expires_at','resolved_at']
 OR (SELECT relacl::text FROM pg_catalog.pg_class WHERE oid='xiangqi_social.friend_requests'::pg_catalog.regclass) IS DISTINCT FROM '{postgres=arwdDxtm/postgres,app_server=arw/postgres}'
 OR (SELECT array_agg(attname::text ORDER BY attnum) FROM pg_catalog.pg_attribute WHERE attrelid='xiangqi_social.friendships'::pg_catalog.regclass AND attnum>0 AND NOT attisdropped) IS DISTINCT FROM ARRAY['user_a','user_b','created_at']
 OR (SELECT relacl::text FROM pg_catalog.pg_class WHERE oid='xiangqi_social.friendships'::pg_catalog.regclass) IS DISTINCT FROM '{postgres=arwdDxtm/postgres,app_server=ard/postgres}'
 OR (SELECT array_agg(attname::text ORDER BY attnum) FROM pg_catalog.pg_attribute WHERE attrelid='xiangqi_social.friend_decline_counts'::pg_catalog.regclass AND attnum>0 AND NOT attisdropped) IS DISTINCT FROM ARRAY['blocker_id','requester_id','declines']
 OR (SELECT relacl::text FROM pg_catalog.pg_class WHERE oid='xiangqi_social.friend_decline_counts'::pg_catalog.regclass) IS DISTINCT FROM '{postgres=arwdDxtm/postgres,app_server=arw/postgres}'
 OR (SELECT array_agg(attname::text ORDER BY attnum) FROM pg_catalog.pg_attribute WHERE attrelid='xiangqi_social.room_invites'::pg_catalog.regclass AND attnum>0 AND NOT attisdropped) IS DISTINCT FROM ARRAY['id','room_id','inviter_id','invitee_id','status','created_at','expires_at','resolved_at']
 OR (SELECT relacl::text FROM pg_catalog.pg_class WHERE oid='xiangqi_social.room_invites'::pg_catalog.regclass) IS DISTINCT FROM '{postgres=arwdDxtm/postgres,app_server=arw/postgres}'
 OR (SELECT pg_catalog.pg_get_indexdef(i.indexrelid) FROM pg_catalog.pg_index i WHERE i.indexrelid='xiangqi_social.friend_request_pending_pair'::pg_catalog.regclass) IS DISTINCT FROM 'CREATE UNIQUE INDEX friend_request_pending_pair ON xiangqi_social.friend_requests USING btree (LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id)) WHERE (status = ''PENDING''::text)'
 THEN RAISE EXCEPTION 'Friend metadata changed; rollback refused'; END IF;
END $$;
DROP TABLE xiangqi_social.room_invites;
DROP TABLE xiangqi_social.friend_decline_counts;
DROP TABLE xiangqi_social.friendships;
DROP TABLE xiangqi_social.friend_requests;
DROP SCHEMA xiangqi_social;
COMMIT;
