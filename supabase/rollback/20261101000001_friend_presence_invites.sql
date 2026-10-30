BEGIN;
SET LOCAL search_path=pg_catalog,public;
LOCK TABLE xiangqi_social.presence_leases,xiangqi_social.invite_cooldowns,xiangqi_social.room_invite_declines,xiangqi_social.room_invites IN ACCESS EXCLUSIVE MODE;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM xiangqi_social.presence_leases)
 OR EXISTS(SELECT 1 FROM xiangqi_social.invite_cooldowns)
 OR EXISTS(SELECT 1 FROM xiangqi_social.room_invite_declines)
 OR EXISTS(SELECT 1 FROM xiangqi_social.room_invites WHERE response_command_id IS NOT NULL)
 THEN RAISE EXCEPTION 'Friend presence/invite writes exist; rollback refused'; END IF;
END $$;
DROP TRIGGER social_room_invites_revoked ON public.rooms;
DROP FUNCTION xiangqi_social.revoke_room_invites();
REVOKE DELETE ON xiangqi_social.friend_decline_counts FROM app_server;
DROP TABLE xiangqi_social.room_invite_declines;
DROP TABLE xiangqi_social.invite_cooldowns;
DROP TABLE xiangqi_social.presence_leases;
DROP INDEX xiangqi_social.room_invite_pending_dedupe;
ALTER TABLE xiangqi_social.room_invites DROP COLUMN response_command_id, DROP COLUMN response_body;
COMMIT;
