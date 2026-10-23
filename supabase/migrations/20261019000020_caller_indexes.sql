BEGIN;
SET LOCAL search_path=pg_catalog,public;
 LOCK TABLE public.room_members,public.matches,public.moves,public.match_moves,xiangqi_social.friend_requests,xiangqi_social.friendships,xiangqi_social.room_invites,xiangqi_realtime.controllers IN ACCESS EXCLUSIVE MODE;
DO $$ BEGIN
 IF pg_catalog.to_regclass('public.room_members_user_room_idx') IS NOT NULL
 OR pg_catalog.to_regclass('public.matches_red_ended_history_idx') IS NOT NULL
 OR pg_catalog.to_regclass('public.matches_black_ended_history_idx') IS NOT NULL
 OR pg_catalog.to_regclass('xiangqi_realtime.realtime_controllers_room_user_idx') IS NOT NULL
 OR pg_catalog.to_regclass('xiangqi_social.friend_requests_sender_status_created_idx') IS NOT NULL
 OR pg_catalog.to_regclass('xiangqi_social.friend_requests_receiver_status_created_idx') IS NOT NULL
 OR pg_catalog.to_regclass('xiangqi_social.friend_requests_pending_expiry_idx') IS NOT NULL
 OR pg_catalog.to_regclass('xiangqi_social.friendships_user_b_idx') IS NOT NULL
 OR pg_catalog.to_regclass('xiangqi_social.room_invites_invitee_status_created_idx') IS NOT NULL
 OR pg_catalog.to_regclass('xiangqi_social.room_invites_pending_expiry_idx') IS NOT NULL
 THEN RAISE EXCEPTION 'An index reserved for migration 20261019000020 already exists'; END IF;
 IF (SELECT pg_catalog.pg_get_indexdef('public.moves_match_id_move_number_idx'::regclass)) IS DISTINCT FROM 'CREATE INDEX moves_match_id_move_number_idx ON public.moves USING btree (match_id, move_number)'
 OR (SELECT pg_catalog.pg_get_indexdef('public.moves_match_id_idx'::regclass)) IS DISTINCT FROM 'CREATE INDEX moves_match_id_idx ON public.moves USING btree (match_id, move_number)'
 THEN RAISE EXCEPTION 'Legacy public.moves duplicate indexes differ from audited definitions'; END IF;
 IF (SELECT pg_catalog.pg_get_indexdef('public.match_moves_match_id_event_version_idx'::regclass)) IS DISTINCT FROM 'CREATE INDEX match_moves_match_id_event_version_idx ON public.match_moves USING btree (match_id, event_version)'
 OR (SELECT pg_catalog.pg_get_indexdef('public.match_moves_match_event_version_unique'::regclass)) IS DISTINCT FROM 'CREATE UNIQUE INDEX match_moves_match_event_version_unique ON public.match_moves USING btree (match_id, event_version)'
 THEN RAISE EXCEPTION 'match_moves event-version index definitions differ from audited baseline'; END IF;
END $$;
CREATE INDEX room_members_user_room_idx ON public.room_members(user_id,room_id);
CREATE INDEX matches_red_ended_history_idx ON public.matches(red_user_id,ended_at DESC,id DESC) WHERE red_user_id IS NOT NULL AND ended_at IS NOT NULL;
CREATE INDEX matches_black_ended_history_idx ON public.matches(black_user_id,ended_at DESC,id DESC) WHERE black_user_id IS NOT NULL AND ended_at IS NOT NULL;
 CREATE INDEX realtime_controllers_room_user_idx ON xiangqi_realtime.controllers(room_id,user_id);
 CREATE INDEX friend_requests_sender_status_created_idx ON xiangqi_social.friend_requests(sender_id,status,created_at);
 CREATE INDEX friend_requests_receiver_status_created_idx ON xiangqi_social.friend_requests(receiver_id,status,created_at);
 CREATE INDEX friend_requests_pending_expiry_idx ON xiangqi_social.friend_requests(expires_at) WHERE status='PENDING';
CREATE INDEX friendships_user_b_idx ON xiangqi_social.friendships(user_b,user_a);
 CREATE INDEX room_invites_invitee_status_created_idx ON xiangqi_social.room_invites(invitee_id,status,created_at);
 CREATE INDEX room_invites_pending_expiry_idx ON xiangqi_social.room_invites(expires_at) WHERE status='PENDING';
DROP INDEX public.moves_match_id_move_number_idx;
DROP INDEX public.match_moves_match_id_event_version_idx;
COMMIT;
