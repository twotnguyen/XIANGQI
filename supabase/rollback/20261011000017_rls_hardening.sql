BEGIN;
SET LOCAL search_path=pg_catalog,public;
-- Khoá hash: chỉ rollback khi đúng 9 bảng vẫn ở trạng thái FORCE RLS + policy app_server_all.
DO $$ DECLARE t text; ok boolean;BEGIN
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
 SELECT c.relrowsecurity AND c.relforcerowsecurity AND
   (SELECT count(*)=1 FROM pg_catalog.pg_policy p
    WHERE p.polrelid=c.oid AND p.polname='app_server_all' AND p.polcmd::text='*'
      AND p.polroles=ARRAY[(SELECT oid FROM pg_catalog.pg_roles WHERE rolname='app_server')])
   INTO ok
   FROM pg_catalog.pg_class c WHERE c.oid=t::regclass;
 IF ok IS DISTINCT FROM true THEN RAISE EXCEPTION 'RLS hardening changed; rollback refused'; END IF;
 IF EXISTS(SELECT 1 FROM pg_catalog.pg_attribute a WHERE a.attrelid=t::regclass AND a.attnum>0 AND NOT a.attisdropped AND (a.attacl IS NOT NULL OR a.atthasdef)) THEN
  RAISE EXCEPTION 'RLS hardening metadata changed; rollback refused';
 END IF;
EXECUTE pg_catalog.format('DROP POLICY app_server_all ON %s',t);
 EXECUTE pg_catalog.format('ALTER TABLE %s NO FORCE ROW LEVEL SECURITY',t);
 EXECUTE pg_catalog.format('ALTER TABLE %s DISABLE ROW LEVEL SECURITY',t);
END LOOP;END $$;
-- Trả lại trạng thái chỉ-ENABLE cho bốn bảng xiangqi_auth (không đổi policy/quyền).
DO $$ DECLARE t text; ok boolean;BEGIN
FOREACH t IN ARRAY ARRAY[
 'xiangqi_auth.registration_intents',
 'xiangqi_auth.registration_drafts',
 'xiangqi_auth.username_reservations',
 'xiangqi_auth.role_provisioning'
] LOOP
 SELECT (relrowsecurity AND relforcerowsecurity) INTO ok
   FROM pg_catalog.pg_class WHERE oid=t::regclass;
 IF ok IS DISTINCT FROM true THEN RAISE EXCEPTION 'Auth FORCE RLS changed; rollback refused'; END IF;
 EXECUTE pg_catalog.format('ALTER TABLE %s NO FORCE ROW LEVEL SECURITY',t);
END LOOP;END $$;
COMMIT;
