import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { RoomScope } from "../room/contracts.js";
import { RoomStore } from "../room/room-store.js";
import {
  pool,
  reset,
  apply,
  databaseUrl,
} from "../room-runtime.test-helper.js";
import { ChatStore } from "./chat-store.js";
import { ChatOutboxWorker } from "./chat-worker.js";
const rooms = new RoomStore(),
  chat = new ChatStore((text) => text);
// Internal trusted actor fixture only. Publication is the future gateway collaborator, not a production permissive default.
async function fixture() {
  const id = randomUUID(),
    at = new Date();
  await pool.query(
    "INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,$2,$3)",
    [id, `synthetic-${id}@example.invalid`, at],
  );
  await pool.query(
    "INSERT INTO public.profiles(user_id,username,display_name,completed_at,registration_pending) VALUES($1,$2,'Synthetic Chat Worker',$3,false)",
    [id, "m" + id.replaceAll("-", "").slice(0, 18), at],
  );
  const run = async <T>(
    roomId: string | undefined,
    work: (scope: RoomScope) => Promise<T>,
  ) => {
    const c = await pool.connect();
    try {
      await c.query("BEGIN; SET LOCAL ROLE app_server");
      await c.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [
        "actor:" + id,
      ]);
      if (roomId)
        await c.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [
          "room:" + roomId,
        ]);
      const result = await work({
        client: c,
        actor: { userId: id, kind: "member" },
        lockedActorIds: new Set([id]),
        lockedRoomIds: new Set(roomId ? [roomId] : []),
      });
      await c.query("COMMIT");
      return result;
    } catch (e) {
      await c.query("ROLLBACK");
      throw e;
    } finally {
      c.release();
    }
  };
  const room = await run(undefined, (s) =>
    rooms.create(s, { commandId: randomUUID(), name: "Synthetic Worker" }),
  );
  const send = () =>
    run(room.roomId, (s) =>
      chat.send(s, room.roomId, {
        commandId: randomUUID(),
        channel: "ROOM_PUBLIC",
        content: "canonical plaintext",
      }),
    );
  const seed = async (n: number) => {
    await pool.query(
      "INSERT INTO xiangqi_chat.messages(id,room_id,sequence,sender_id,sender_role,channel,content,created_at) SELECT ('00000000-0000-0000-0000-'||lpad(n::text,12,'0'))::uuid,$1,n,$2,'red','ROOM_PUBLIC','Synthetic history',clock_timestamp() FROM generate_series(1,$3) n",
      [room.roomId, id, n],
    );
    await pool.query(
      "UPDATE xiangqi_chat.rooms SET sequence=$2 WHERE room_id=$1",
      [room.roomId, n],
    );
    await pool.query(
      "INSERT INTO xiangqi_chat.outbox(message_id,room_id,sequence,next_attempt_at) SELECT id,room_id,sequence,clock_timestamp()-interval '1 hour' FROM xiangqi_chat.messages WHERE room_id=$1",
      [room.roomId],
    );
  };
  return {
    id,
    roomId: room.roomId,
    send,
    seed,
    closeRoom: () => run(room.roomId, (s) => rooms.leave(s, room.roomId)),
  };
}
afterAll(() => pool.end());
describe.skipIf(!databaseUrl)(
  "chat worker with actual isolated runtime SQL",
  () => {
    beforeEach(async () => {
      await pool.query("DROP SCHEMA IF EXISTS xiangqi_chat CASCADE");
      await reset();
      for (const n of ["08_room_modes", "09_match_draw", "10_room_chat"])
        await apply(`supabase/migrations/202610110000${n}.sql`);
    });
    it("publishes only committed reference room/channel then deletes outbox without deleting message/receipt", async () => {
      const f = await fixture(),
        sent = await f.send(),
        publish = vi.fn(async (roomId: string, channel: string) => {
          expect(roomId).toBe(f.roomId);
          expect(channel).toBe("ROOM_PUBLIC");
          expect(
            (
              await pool.query(
                "SELECT content FROM xiangqi_chat.messages WHERE id=$1",
                [sent.messageId],
              )
            ).rows[0].content,
          ).toBe("canonical plaintext");
          expect(
            (
              await pool.query(
                "SELECT count(*)::int n FROM xiangqi_chat.outbox",
              )
            ).rows[0].n,
          ).toBe(1);
        }),
        worker = new ChatOutboxWorker(pool, publish);
      await worker.tick();
      await worker.tick();
      expect(publish).toHaveBeenCalledTimes(1);
      expect(publish.mock.calls[0]).toHaveLength(2);
      expect(
        (await pool.query("SELECT count(*)::int n FROM xiangqi_chat.outbox"))
          .rows[0].n,
      ).toBe(0);
      for (const t of ["messages", "receipts", "rate"])
        expect(
          (await pool.query(`SELECT count(*)::int n FROM xiangqi_chat.${t}`))
            .rows[0].n,
        ).toBe(1);
      await worker.close();
    });
    it("retains failed delivery with fresh DB bounded backoff then retries successfully", async () => {
      const f = await fixture();
      await f.send();
      const publish = vi
          .fn()
          .mockRejectedValueOnce(new Error("private provider token rawSQL"))
          .mockResolvedValue(undefined),
        worker = new ChatOutboxWorker(pool, publish);
      await expect(worker.tick()).rejects.toThrow(
        "Chat outbox delivery failed",
      );
      let row = (
        await pool.query(
          "SELECT attempts,(next_attempt_at-clock_timestamp())>interval '0 seconds' AS future FROM xiangqi_chat.outbox",
        )
      ).rows[0];
      expect(row).toEqual({ attempts: 1, future: true });
      await worker.tick();
      expect(publish).toHaveBeenCalledTimes(1);
      await pool.query(
        "UPDATE xiangqi_chat.outbox SET attempts=30,next_attempt_at=clock_timestamp()-interval '1 second'",
      );
      publish.mockRejectedValueOnce(new Error("private"));
      await expect(worker.tick()).rejects.toThrow(
        "Chat outbox delivery failed",
      );
      row = (
        await pool.query(
          "SELECT attempts,extract(epoch FROM next_attempt_at-clock_timestamp())::float8 delay FROM xiangqi_chat.outbox",
        )
      ).rows[0];
      expect(row.attempts).toBe(31);
      expect(row.delay).toBeGreaterThan(14);
      expect(row.delay).toBeLessThanOrEqual(15);
      await pool.query(
        "UPDATE xiangqi_chat.outbox SET next_attempt_at=clock_timestamp()-interval '1 second'",
      );
      await worker.tick();
      expect(
        (await pool.query("SELECT count(*)::int n FROM xiangqi_chat.outbox"))
          .rows[0].n,
      ).toBe(0);
      await worker.close();
    });
    it("room close cascades safely during authorized publication with no recreated delivery row", async () => {
      const f = await fixture();
      await f.send();
      const worker = new ChatOutboxWorker(pool, async () => {
        await f.closeRoom();
      });
      await worker.tick();
      expect(
        (await pool.query("SELECT count(*)::int n FROM xiangqi_chat.outbox"))
          .rows[0].n,
      ).toBe(0);
      expect(
        (await pool.query("SELECT count(*)::int n FROM xiangqi_chat.messages"))
          .rows[0].n,
      ).toBe(0);
      await worker.close();
    });
    it("deletes only expired receipts in batches50, retaining messages and global rate", async () => {
      const f = await fixture();
      await f.seed(52);
      await pool.query(
        "INSERT INTO xiangqi_chat.receipts(actor_id,room_id,command_id,fingerprint,channel,message_id,sequence,created_at,expires_at) SELECT $1,room_id,id,repeat('a',64),channel,id,sequence,stamp.at,stamp.at+interval '24 hours' FROM xiangqi_chat.messages CROSS JOIN LATERAL(SELECT CASE WHEN sequence<=51 THEN clock_timestamp()-interval '25 hours' ELSE clock_timestamp() END AS at) stamp",
        [f.id],
      );
      await pool.query(
        "INSERT INTO xiangqi_chat.rate(actor_id,sent_at) VALUES($1,ARRAY[clock_timestamp()])",
        [f.id],
      );
      await pool.query("DELETE FROM xiangqi_chat.outbox");
      const publish = vi.fn(),
        worker = new ChatOutboxWorker(pool, publish);
      await worker.tick();
      expect(
        (await pool.query("SELECT count(*)::int n FROM xiangqi_chat.receipts"))
          .rows[0].n,
      ).toBe(2);
      await worker.tick();
      expect(
        (await pool.query("SELECT sequence FROM xiangqi_chat.receipts")).rows,
      ).toEqual([{ sequence: "52" }]);
      expect(
        (await pool.query("SELECT count(*)::int n FROM xiangqi_chat.messages"))
          .rows[0].n,
      ).toBe(52);
      expect(
        (await pool.query("SELECT count(*)::int n FROM xiangqi_chat.rate"))
          .rows[0].n,
      ).toBe(1);
      expect(publish).not.toHaveBeenCalled();
      await worker.close();
    });
    it.each([false, true])(
      "bounds batch50 and advances past fifty failed entries to healthy51st (SQL backoff failure=%s)",
      async (sqlFailure) => {
        const f = await fixture();
        await f.seed(50);
        // Fifty oldest entries have an unavailable publisher; a separate canonical room is healthy.
        const healthy = await fixture(),
          sent = await healthy.send();
        await pool.query(
          "UPDATE xiangqi_chat.outbox SET next_attempt_at=clock_timestamp()-interval '59 minutes' WHERE message_id=$1",
          [sent.messageId],
        );
        if (sqlFailure) {
          const owner = await pool.connect();
          try {
            await owner.query(
              "SET ROLE postgres; REVOKE UPDATE ON xiangqi_chat.outbox FROM app_server",
            );
          } finally {
            await owner.query("RESET ROLE");
            owner.release();
          }
        }
        const publish = vi.fn(async (roomId: string) => {
            if (roomId === f.roomId) throw new Error("private unavailable");
          }),
          worker = new ChatOutboxWorker(pool, publish);
        await expect(worker.tick()).rejects.toThrow(
          "Chat outbox delivery failed",
        );
        expect(publish).toHaveBeenCalledTimes(50);
        if (sqlFailure)
          expect(
            (
              await pool.query(
                "SELECT bool_and(attempts=0 AND next_attempt_at<=clock_timestamp()) AS unchanged FROM xiangqi_chat.outbox WHERE room_id=$1",
                [f.roomId],
              )
            ).rows[0].unchanged,
          ).toBe(true);
        await worker.tick();
        expect(publish.mock.calls.some(([id]) => id === healthy.roomId)).toBe(
          true,
        );
        expect(
          (
            await pool.query(
              "SELECT count(*)::int n FROM xiangqi_chat.outbox WHERE message_id=$1",
              [sent.messageId],
            )
          ).rows[0].n,
        ).toBe(0);
        expect(
          (
            await pool.query(
              "SELECT count(*)::int n FROM xiangqi_chat.messages WHERE room_id=$1",
              [f.roomId],
            )
          ).rows[0].n,
        ).toBe(50);
        await worker.close();
      },
    );
    it("singleflight and close drain publication, prevent further SQL after close and keep borrowed pool alive", async () => {
      const f = await fixture();
      await f.send();
      let release!: () => void, entered!: () => void;
      const blocked = new Promise<void>((r) => {
          release = r;
        }),
        started = new Promise<void>((r) => {
          entered = r;
        }),
        publish = vi.fn(async () => {
          entered();
          await blocked;
        }),
        worker = new ChatOutboxWorker(pool, publish);
      const first = worker.tick(),
        second = worker.tick();
      void first.catch(() => {});
      void second.catch(() => {});
      await started;
      let closed = false;
      const closing = worker.close().then(() => {
        closed = true;
      });
      await new Promise((r) => setTimeout(r, 20));
      expect(closed).toBe(false);
      expect(publish).toHaveBeenCalledTimes(1);
      release();
      await Promise.all([first, second, closing]);
      await worker.close();
      await worker.tick();
      expect(publish).toHaveBeenCalledTimes(1);
      expect((await pool.query("SELECT 1 AS ok")).rows[0].ok).toBe(1);
    });
  },
);
