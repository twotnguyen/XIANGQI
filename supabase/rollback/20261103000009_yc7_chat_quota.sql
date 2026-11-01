BEGIN;
LOCK TABLE xiangqi_chat.rate IN ACCESS EXCLUSIVE MODE;
CREATE TABLE xiangqi_social.direct_message_rate(
 sender_id uuid PRIMARY KEY,
 sent_at timestamptz[] NOT NULL CHECK(cardinality(sent_at)<=5 AND array_position(sent_at,NULL) IS NULL)
);
ALTER TABLE xiangqi_social.direct_message_rate OWNER TO postgres;
REVOKE ALL ON xiangqi_social.direct_message_rate FROM PUBLIC,anon,authenticated,service_role;
GRANT SELECT,INSERT,UPDATE ON xiangqi_social.direct_message_rate TO app_server;
ALTER TABLE xiangqi_social.direct_message_rate ENABLE ROW LEVEL SECURITY;
ALTER TABLE xiangqi_social.direct_message_rate FORCE ROW LEVEL SECURITY;
CREATE POLICY direct_message_rate_server ON xiangqi_social.direct_message_rate TO app_server USING(true) WITH CHECK(true);
INSERT INTO xiangqi_social.direct_message_rate(sender_id,sent_at)
SELECT actor_id, sent_at FROM xiangqi_chat.rate
ON CONFLICT(sender_id) DO UPDATE SET sent_at=EXCLUDED.sent_at;
COMMIT;
