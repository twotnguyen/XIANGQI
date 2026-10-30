BEGIN;
SET LOCAL search_path=pg_catalog,public;
LOCK TABLE xiangqi_social.direct_messages,xiangqi_social.direct_message_reads,xiangqi_social.direct_message_rate IN ACCESS EXCLUSIVE MODE;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM xiangqi_social.direct_messages)
 OR EXISTS(SELECT 1 FROM xiangqi_social.direct_message_reads)
 THEN RAISE EXCEPTION 'Direct message data exists; rollback refused'; END IF;
END $$;
DROP TABLE xiangqi_social.direct_message_rate;
DROP TABLE xiangqi_social.direct_message_reads;
DROP TABLE xiangqi_social.direct_messages;
COMMIT;
