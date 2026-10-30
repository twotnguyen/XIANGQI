BEGIN;
SET LOCAL search_path=pg_catalog,public;
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_catalog.pg_class WHERE oid='xiangqi_social.friendships'::pg_catalog.regclass)
 OR NOT EXISTS(SELECT 1 FROM pg_catalog.pg_roles WHERE rolname='app_server')
 THEN RAISE EXCEPTION 'Direct message prerequisites differ'; END IF;
END $$;
CREATE TABLE xiangqi_social.direct_messages(
 id uuid PRIMARY KEY,
 seq bigint GENERATED ALWAYS AS IDENTITY UNIQUE,
 user_low uuid NOT NULL,
 user_high uuid NOT NULL,
 sender_id uuid NOT NULL,
 command_id uuid NOT NULL,
 fingerprint text NOT NULL CHECK(fingerprint ~ '^[0-9a-f]{64}$'),
 content text NOT NULL CHECK(char_length(content) BETWEEN 1 AND 200 AND btrim(content)<>''),
 created_at timestamptz NOT NULL,
 CHECK(user_low<user_high),
 CHECK(sender_id IN(user_low,user_high)),
 UNIQUE(sender_id,command_id)
);
CREATE INDEX direct_messages_pair_seq ON xiangqi_social.direct_messages(user_low,user_high,seq);
CREATE TABLE xiangqi_social.direct_message_reads(
 reader_id uuid NOT NULL,
 peer_id uuid NOT NULL,
 read_seq bigint NOT NULL DEFAULT 0 CHECK(read_seq>=0),
 updated_at timestamptz NOT NULL,
 PRIMARY KEY(reader_id,peer_id),
 CHECK(reader_id<>peer_id)
);
CREATE TABLE xiangqi_social.direct_message_rate(
 sender_id uuid PRIMARY KEY,
 sent_at timestamptz[] NOT NULL CHECK(cardinality(sent_at)<=5 AND array_position(sent_at,NULL) IS NULL)
);
REVOKE ALL ON xiangqi_social.direct_messages,xiangqi_social.direct_message_reads,xiangqi_social.direct_message_rate FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT ON xiangqi_social.direct_messages TO app_server;
GRANT SELECT,INSERT,UPDATE ON xiangqi_social.direct_message_reads TO app_server;
GRANT SELECT,INSERT,UPDATE ON xiangqi_social.direct_message_rate TO app_server;
ALTER TABLE xiangqi_social.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE xiangqi_social.direct_messages FORCE ROW LEVEL SECURITY;
CREATE POLICY direct_messages_server ON xiangqi_social.direct_messages TO app_server USING(true) WITH CHECK(true);
ALTER TABLE xiangqi_social.direct_message_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE xiangqi_social.direct_message_reads FORCE ROW LEVEL SECURITY;
CREATE POLICY direct_message_reads_server ON xiangqi_social.direct_message_reads TO app_server USING(true) WITH CHECK(true);
ALTER TABLE xiangqi_social.direct_message_rate ENABLE ROW LEVEL SECURITY;
ALTER TABLE xiangqi_social.direct_message_rate FORCE ROW LEVEL SECURITY;
CREATE POLICY direct_message_rate_server ON xiangqi_social.direct_message_rate TO app_server USING(true) WITH CHECK(true);
COMMIT;
