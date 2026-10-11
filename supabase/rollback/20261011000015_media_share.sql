BEGIN;
SET LOCAL search_path=pg_catalog,public;
LOCK TABLE xiangqi_room.media_share IN ACCESS EXCLUSIVE MODE;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM xiangqi_room.media_share)
 THEN RAISE EXCEPTION 'Media share writes exist; rollback refused'; END IF;
 IF (SELECT array_agg(attname::text ORDER BY attnum) FROM pg_catalog.pg_attribute WHERE attrelid='xiangqi_room.media_share'::pg_catalog.regclass AND attnum>0 AND NOT attisdropped) IS DISTINCT FROM ARRAY['room_id','user_id','level','updated_at']
 OR (SELECT relacl::text FROM pg_catalog.pg_class WHERE oid='xiangqi_room.media_share'::pg_catalog.regclass) IS DISTINCT FROM '{postgres=arwdDxtm/postgres,app_server=arwd/postgres}'
 THEN RAISE EXCEPTION 'Media share metadata changed; rollback refused'; END IF;
END $$;
DROP TABLE xiangqi_room.media_share;
COMMIT;
