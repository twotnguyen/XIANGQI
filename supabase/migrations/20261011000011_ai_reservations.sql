BEGIN;
SET LOCAL search_path=pg_catalog,public;
LOCK TABLE public.active_players IN ACCESS EXCLUSIVE MODE;
DO $$ BEGIN
 IF (SELECT relowner='postgres'::pg_catalog.regrole AND relkind='r' AND relrowsecurity AND relforcerowsecurity FROM pg_catalog.pg_class WHERE oid='public.active_players'::pg_catalog.regclass) IS DISTINCT FROM true
 OR (SELECT array_agg(attname::text ORDER BY attnum) FROM pg_catalog.pg_attribute WHERE attrelid='public.active_players'::pg_catalog.regclass AND attnum>0 AND NOT attisdropped) IS DISTINCT FROM ARRAY['user_id','match_id','acquired_at','room_id','created_at']
 OR NOT EXISTS(SELECT 1 FROM pg_catalog.pg_constraint WHERE conrelid='public.active_players'::pg_catalog.regclass AND conname='active_players_pkey' AND contype='p' AND pg_catalog.pg_get_constraintdef(oid)='PRIMARY KEY (user_id)')
 OR NOT EXISTS(SELECT 1 FROM pg_catalog.pg_constraint WHERE conrelid='public.active_players'::pg_catalog.regclass AND conname='active_players_user_id_fkey' AND contype='f' AND confrelid='public.profiles'::pg_catalog.regclass)
 OR NOT EXISTS(SELECT 1 FROM pg_catalog.pg_constraint WHERE conrelid='public.active_players'::pg_catalog.regclass AND conname='active_players_match_id_fkey' AND contype='f' AND confrelid='public.matches'::pg_catalog.regclass)
 OR NOT EXISTS(SELECT 1 FROM pg_catalog.pg_constraint WHERE conrelid='public.active_players'::pg_catalog.regclass AND conname='active_players_room_fk' AND contype='f' AND confrelid='public.rooms'::pg_catalog.regclass)
 OR NOT pg_catalog.has_table_privilege('app_server','public.active_players','SELECT')
 OR NOT pg_catalog.has_table_privilege('app_server','public.active_players','INSERT')
 OR NOT pg_catalog.has_table_privilege('app_server','public.active_players','DELETE')
 OR pg_catalog.to_regnamespace('xiangqi_ai') IS NOT NULL THEN RAISE EXCEPTION 'AI reservation baseline differs'; END IF;
END $$;
CREATE SCHEMA xiangqi_ai AUTHORIZATION postgres;
REVOKE ALL ON SCHEMA xiangqi_ai FROM PUBLIC,anon,authenticated,service_role;
GRANT USAGE ON SCHEMA xiangqi_ai TO app_server;
CREATE TABLE xiangqi_ai.boots(
 id uuid PRIMARY KEY,
 created_at timestamptz NOT NULL,
 lease_until timestamptz NOT NULL,
 CONSTRAINT ai_boot_lease_range CHECK(lease_until>created_at)
);
ALTER TABLE xiangqi_ai.boots OWNER TO postgres;
ALTER TABLE xiangqi_ai.boots ENABLE ROW LEVEL SECURITY;
ALTER TABLE xiangqi_ai.boots FORCE ROW LEVEL SECURITY;
REVOKE ALL ON xiangqi_ai.boots FROM PUBLIC,anon,authenticated,service_role;
GRANT SELECT,INSERT ON xiangqi_ai.boots TO app_server;
GRANT UPDATE(lease_until) ON xiangqi_ai.boots TO app_server;
CREATE POLICY ai_server ON xiangqi_ai.boots TO app_server USING(true) WITH CHECK(true);
ALTER TABLE public.active_players ADD COLUMN ai_game_id uuid,ADD COLUMN ai_boot_id uuid;
ALTER TABLE public.active_players ADD CONSTRAINT active_players_ai_pair CHECK(
 (ai_game_id IS NULL AND ai_boot_id IS NULL) OR
 (ai_game_id IS NOT NULL AND ai_boot_id IS NOT NULL AND room_id IS NULL AND match_id IS NULL)
),ADD CONSTRAINT active_players_ai_game_unique UNIQUE(ai_game_id),
 ADD CONSTRAINT active_players_ai_boot_fk FOREIGN KEY(ai_boot_id) REFERENCES xiangqi_ai.boots(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
COMMIT;
