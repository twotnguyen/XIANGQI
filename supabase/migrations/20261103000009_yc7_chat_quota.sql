BEGIN;
LOCK TABLE xiangqi_chat.rate, xiangqi_social.direct_message_rate IN ACCESS EXCLUSIVE MODE;
INSERT INTO xiangqi_chat.rate(actor_id,sent_at)
SELECT d.sender_id, ARRAY(
  SELECT t FROM unnest(d.sent_at || COALESCE(r.sent_at, '{}'::timestamptz[])) t
  WHERE t > clock_timestamp() - interval '10 seconds'
  ORDER BY t DESC LIMIT 5
)
FROM xiangqi_social.direct_message_rate d
JOIN xiangqi_auth.principals p ON p.id=d.sender_id
LEFT JOIN xiangqi_chat.rate r ON r.actor_id=d.sender_id
ON CONFLICT(actor_id) DO UPDATE SET sent_at=EXCLUDED.sent_at;
DROP TABLE xiangqi_social.direct_message_rate;
COMMIT;
