BEGIN;
SET LOCAL search_path=pg_catalog,public;
-- NFR-04 hardening: các bảng P2 thiếu ENABLE/FORCE RLS + policy app_server.
-- Chỉ bổ sung (không nới quyền cho PUBLIC/anon/authenticated); app_server giữ nguyên hành vi.
DO $$ DECLARE t text;BEGIN
FOREACH t IN ARRAY ARRAY[
 'xiangqi_room.match_draw_offers',
 'xiangqi_room.media_share',
 'xiangqi_room.room_blocks',
 'xiangqi_room.seat_invites',
 'xiangqi_room.side_swap_offers',
 'xiangqi_social.friend_decline_counts',
 'xiangqi_social.friend_requests',
 'xiangqi_social.friendships',
 'xiangqi_social.room_invites'
] LOOP
 EXECUTE pg_catalog.format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY',t);
 EXECUTE pg_catalog.format('ALTER TABLE %s FORCE ROW LEVEL SECURITY',t);
 EXECUTE pg_catalog.format('REVOKE ALL ON %s FROM PUBLIC,anon,authenticated',t);
 EXECUTE pg_catalog.format('CREATE POLICY app_server_all ON %s TO app_server USING(true) WITH CHECK(true)',t);
END LOOP;END $$;
-- Bốn bảng xiangqi_auth đã bật RLS nhưng thiếu FORCE (migration 01 chỉ ENABLE).
DO $$ DECLARE t text;BEGIN
FOREACH t IN ARRAY ARRAY[
 'xiangqi_auth.registration_intents',
 'xiangqi_auth.registration_drafts',
 'xiangqi_auth.username_reservations',
 'xiangqi_auth.role_provisioning'
] LOOP
 EXECUTE pg_catalog.format('ALTER TABLE %s FORCE ROW LEVEL SECURITY',t);
END LOOP;END $$;
COMMIT;
