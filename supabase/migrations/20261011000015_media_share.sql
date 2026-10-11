BEGIN;
SET LOCAL search_path=pg_catalog,public;
CREATE TABLE xiangqi_room.media_share (
 room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE RESTRICT,
 user_id uuid NOT NULL,
 level text NOT NULL CHECK(level IN('NONE','OPPONENT','ALL')),
 updated_at timestamptz NOT NULL,
 PRIMARY KEY(room_id,user_id)
);
ALTER TABLE xiangqi_room.media_share OWNER TO postgres;
REVOKE ALL ON xiangqi_room.media_share FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON xiangqi_room.media_share TO app_server;
COMMIT;
