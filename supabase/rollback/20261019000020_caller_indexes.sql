BEGIN;
SET LOCAL search_path=pg_catalog,public;
LOCK TABLE public.room_members,public.matches,public.moves,public.match_moves,xiangqi_social.friend_requests,xiangqi_social.friendships,xiangqi_social.room_invites,xiangqi_realtime.controllers IN ACCESS EXCLUSIVE MODE;
DO $$ BEGIN
 IF (SELECT pg_catalog.pg_get_indexdef('public.room_members_user_room_idx'::regclass)) IS DISTINCT FROM 'CREATE INDEX room_members_user_room_idx ON public.room_members USING btree (user_id, room_id)'
 OR (SELECT pg_catalog.pg_get_indexdef('public.matches_red_ended_history_idx'::regclass)) IS DISTINCT FROM 'CREATE INDEX matches_red_ended_history_idx ON public.matches USING btree (red_user_id, ended_at DESC, id DESC) WHERE ((red_user_id IS NOT NULL) AND (ended_at IS NOT NULL))'
 OR (SELECT pg_catalog.pg_get_indexdef('public.matches_black_ended_history_idx'::regclass)) IS DISTINCT FROM 'CREATE INDEX matches_black_ended_history_idx ON public.matches USING btree (black_user_id, ended_at DESC, id DESC) WHERE ((black_user_id IS NOT NULL) AND (ended_at IS NOT NULL))'
 OR (SELECT pg_catalog.pg_get_indexdef('xiangqi_realtime.realtime_controllers_room_user_idx'::regclass)) IS DISTINCT FROM 'CREATE INDEX realtime_controllers_room_user_idx ON xiangqi_realtime.controllers USING btree (room_id, user_id)'
 OR (SELECT pg_catalog.pg_get_indexdef('xiangqi_social.friend_requests_sender_status_created_idx'::regclass)) IS DISTINCT FROM 'CREATE INDEX friend_requests_sender_status_created_idx ON xiangqi_social.friend_requests USING btree (sender_id, status, created_at)'
 OR (SELECT pg_catalog.pg_get_indexdef('xiangqi_social.friend_requests_receiver_status_created_idx'::regclass)) IS DISTINCT FROM 'CREATE INDEX friend_requests_receiver_status_created_idx ON xiangqi_social.friend_requests USING btree (receiver_id, status, created_at)'
 OR (SELECT pg_catalog.pg_get_indexdef('xiangqi_social.friend_requests_pending_expiry_idx'::regclass)) IS DISTINCT FROM 'CREATE INDEX friend_requests_pending_expiry_idx ON xiangqi_social.friend_requests USING btree (expires_at) WHERE (status = ''PENDING''::text)'
 OR (SELECT pg_catalog.pg_get_indexdef('xiangqi_social.friendships_user_b_idx'::regclass)) IS DISTINCT FROM 'CREATE INDEX friendships_user_b_idx ON xiangqi_social.friendships USING btree (user_b, user_a)'
 OR (SELECT pg_catalog.pg_get_indexdef('xiangqi_social.room_invites_invitee_status_created_idx'::regclass)) IS DISTINCT FROM 'CREATE INDEX room_invites_invitee_status_created_idx ON xiangqi_social.room_invites USING btree (invitee_id, status, created_at)'
 OR (SELECT pg_catalog.pg_get_indexdef('xiangqi_social.room_invites_pending_expiry_idx'::regclass)) IS DISTINCT FROM 'CREATE INDEX room_invites_pending_expiry_idx ON xiangqi_social.room_invites USING btree (expires_at) WHERE (status = ''PENDING''::text)'
 OR pg_catalog.to_regclass('public.moves_match_id_move_number_idx') IS NOT NULL
 OR pg_catalog.to_regclass('public.match_moves_match_id_event_version_idx') IS NOT NULL
 THEN RAISE EXCEPTION 'Index definitions or names changed after migration 20261019000020'; END IF;
END $$;
DROP INDEX public.room_members_user_room_idx;
DROP INDEX public.matches_red_ended_history_idx;
DROP INDEX public.matches_black_ended_history_idx;
DROP INDEX xiangqi_realtime.realtime_controllers_room_user_idx;
DROP INDEX xiangqi_social.friend_requests_sender_status_created_idx;
DROP INDEX xiangqi_social.friend_requests_receiver_status_created_idx;
DROP INDEX xiangqi_social.friend_requests_pending_expiry_idx;
DROP INDEX xiangqi_social.friendships_user_b_idx;
DROP INDEX xiangqi_social.room_invites_invitee_status_created_idx;
DROP INDEX xiangqi_social.room_invites_pending_expiry_idx;
CREATE INDEX moves_match_id_move_number_idx ON public.moves USING btree (match_id, move_number);
CREATE INDEX match_moves_match_id_event_version_idx ON public.match_moves USING btree (match_id, event_version);
COMMIT;
