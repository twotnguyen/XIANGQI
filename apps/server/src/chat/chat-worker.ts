import type { Pool, PoolClient } from "pg";
import type { ChatChannel } from "./chat-store.js";
type Cursor = { deadline: string; messageId: string };
type Entry = Cursor & { roomId: string; channel: ChatChannel };
/** At-least-once invalidation only. The required publisher owns recipient authorization. */
export class ChatOutboxWorker {
  private cursor: Cursor | null = null;
  private inFlight: Promise<void> | null = null;
  private closed = false;
  constructor(
    private readonly pool: Pool,
    private readonly publish: (
      roomId: string,
      channel: ChatChannel,
    ) => Promise<void>,
  ) {}
  tick(): Promise<void> {
    if (this.closed) return Promise.resolve();
    if (!this.inFlight) {
      this.inFlight = this.batch()
        .catch(() => {
          throw new Error("Chat outbox delivery failed");
        })
        .finally(() => {
          this.inFlight = null;
        });
    }
    return this.inFlight;
  }
  async close(): Promise<void> {
    this.closed = true;
    await this.inFlight?.catch(() => {});
  }
  private async transaction<T>(
    work: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    const client = await this.pool.connect();
    let broken = false;
    try {
      await client.query("BEGIN; SET LOCAL ROLE app_server");
      const result = await work(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      try {
        await client.query("ROLLBACK");
      } catch {
        broken = true;
      }
      throw error;
    } finally {
      client.release(broken);
    }
  }
  private async batch(): Promise<void> {
    const entries = await this.transaction(async (client) => {
      await client.query(`DELETE FROM xiangqi_chat.receipts r USING (
        SELECT actor_id,room_id,command_id FROM xiangqi_chat.receipts
        WHERE expires_at<=clock_timestamp() ORDER BY expires_at,actor_id,room_id,command_id LIMIT 50
      ) b WHERE r.actor_id=b.actor_id AND r.room_id=b.room_id AND r.command_id=b.command_id`);
      return (
        await client.query<Entry>(
          `SELECT o.message_id AS "messageId",o.room_id AS "roomId",m.channel,
        (extract(epoch FROM o.next_attempt_at)*1000)::numeric::text AS deadline
        FROM xiangqi_chat.outbox o JOIN xiangqi_chat.messages m ON m.id=o.message_id
        WHERE o.delivered_at IS NULL AND o.next_attempt_at<=clock_timestamp()
        AND ($1::numeric IS NULL OR ((extract(epoch FROM o.next_attempt_at)*1000)::numeric,o.message_id)>($1::numeric,$2::uuid))
        ORDER BY o.next_attempt_at,o.message_id LIMIT 50`,
          [this.cursor?.deadline ?? null, this.cursor?.messageId ?? null],
        )
      ).rows;
    });
    let failed = false;
    for (const entry of entries) {
      try {
        // No borrowed transaction or actor/room lock is held across gateway authorization.
        await this.publish(entry.roomId, entry.channel);
        await this.transaction((client) =>
          client.query("DELETE FROM xiangqi_chat.outbox WHERE message_id=$1", [
            entry.messageId,
          ]),
        );
      } catch {
        failed = true;
        try {
          await this.transaction((client) =>
            client.query(
              `UPDATE xiangqi_chat.outbox
            SET attempts=attempts+1,next_attempt_at=clock_timestamp()+LEAST(15,power(2,LEAST(attempts,4)))*interval '1 second'
            WHERE message_id=$1`,
              [entry.messageId],
            ),
          );
        } catch {
          /* Retain the row for a future batch; never expose SQL/provider errors. */
        }
      }
    }
    const last = entries.at(-1);
    this.cursor =
      entries.length === 50 && last
        ? { deadline: last.deadline, messageId: last.messageId }
        : null;
    if (failed) throw new Error("Chat outbox delivery failed");
  }
}
