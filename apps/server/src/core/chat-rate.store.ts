import type { PoolClient } from "pg";

export async function consumeChatRate(client: PoolClient, actorId: string): Promise<Date | null> {
  await client.query(
    "INSERT INTO xiangqi_chat.rate(actor_id,sent_at) VALUES($1,'{}') ON CONFLICT DO NOTHING",
    [actorId],
  );
  const rate = (await client.query<{ sent_at: Date[] }>(
    "SELECT sent_at FROM xiangqi_chat.rate WHERE actor_id=$1 FOR UPDATE",
    [actorId],
  )).rows[0]!.sent_at;
  const now = (await client.query<{ now: Date }>("SELECT clock_timestamp() AS now")).rows[0]!.now;
  const recent = rate.filter((at) => at.getTime() > now.getTime() - 10_000);
  if (recent.length >= 5) return null;
  await client.query("UPDATE xiangqi_chat.rate SET sent_at=$2 WHERE actor_id=$1", [actorId, [...recent, now]]);
  return now;
}
