import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { ChatStore } from "./chat-store.js";
import { RoomStore } from "../room/room-store.js";
import type { RoomActor, RoomScope } from "../room/contracts.js";
import {
  actor,
  apply,
  databaseUrl,
  pool,
  reset,
  transaction,
} from "../room/room.test-helper.js";
const migration = "supabase/migrations/20261011000010_room_chat.sql",
  rollback = "supabase/rollback/20261011000010_room_chat.sql";
const rooms = new RoomStore(),
  chat = new ChatStore((text) => text.replace(/bad/gi, "***"));
// Only the masking seam and trusted caller authorization are fixtures; all storage/roster transitions and locks are actual SQL.
async function run<T>(
  a: RoomActor,
  id: string | undefined,
  work: (s: RoomScope) => Promise<T>,
) {
  const actors = id
    ? (
        await pool.query(
          "SELECT user_id FROM public.room_members WHERE room_id=$1",
          [id],
        )
      ).rows.map((r) => r.user_id)
    : [];
  const ids = [...actors, a.userId];
  return transaction(ids, id ? [id] : [], (client) =>
    work({
      client,
      actor: a,
      lockedActorIds: new Set(ids),
      lockedRoomIds: new Set(id ? [id] : []),
    }),
  );
}
async function fixture() {
  const a = await actor(),
    b = await actor(),
    c = await actor();
  const entry = await run(a, undefined, (s) =>
    rooms.create(s, { commandId: randomUUID(), name: "Synthetic Chat" }),
  );
  const id = entry.roomId;
  const join = (who: RoomActor, role: "play" | "watch") =>
    run(who, id, (s) =>
      rooms.join(s, { roomId: id, commandId: randomUUID(), intent: role }),
    );
  const send = (
    who: RoomActor,
    channel: "PLAYERS_PRIVATE" | "ROOM_PUBLIC",
    content = "hello",
    commandId = randomUUID(),
  ) => run(who, id, (s) => chat.send(s, id, { commandId, channel, content }));
  const read = (
    who: RoomActor,
    channel: "PLAYERS_PRIVATE" | "ROOM_PUBLIC",
    after = 0,
  ) => run(who, id, (s) => chat.read(s, id, channel, after));
  return { a, b, c, id, join, send, read };
}
afterAll(() => pool.end());
describe.skipIf(!databaseUrl)(
  "private chat schema and store on isolated room SQL",
  () => {
    beforeEach(async () => {
      await pool.query("DROP SCHEMA IF EXISTS xiangqi_chat CASCADE");
      await reset();
      for (const name of [
        "06_rooms",
        "07_match_outcomes",
        "08_room_modes",
        "09_match_draw",
      ])
        await apply(`supabase/migrations/202610110000${name}.sql`);
      await apply(migration);
    });
    it("supports WAITING self private chat and never writes legacy messages or raw receipt/outbox bodies", async () => {
      const f = await fixture();
      const sent = (await f.send(
        f.a,
        "PLAYERS_PRIVATE",
        "bad <script>alert(1)</script>",
      )) as { messageId: string };
      const page = (await f.read(f.a, "PLAYERS_PRIVATE")) as {
        messages: { content: string }[];
      };
      expect(page.messages[0]!.content).toBe("*** <script>alert(1)</script>");
      expect(sent.messageId).toEqual(expect.any(String));
      expect(
        (
          await pool.query(
            "SELECT count(*)::int AS n FROM public.chat_messages",
          )
        ).rows[0].n,
      ).toBe(0);
      for (const table of ["receipts", "outbox"]) {
        const rows = (
          await pool.query(
            `SELECT row_to_json(t)::text AS value FROM xiangqi_chat.${table} t`,
          )
        ).rows;
        expect(JSON.stringify(rows)).not.toContain("<script>");
        expect(JSON.stringify(rows)).not.toContain("bad <script>");
      }
    });
    it("denies outsider, forged kind/missing locks, viewer private read/send and expired viewer", async () => {
      const f = await fixture();
      await expect(f.read(f.c, "ROOM_PUBLIC")).rejects.toMatchObject({
        code: "CHAT_FORBIDDEN",
      });
      await f.join(f.c, "watch");
      await expect(f.read(f.c, "PLAYERS_PRIVATE")).rejects.toMatchObject({
        code: "CHAT_FORBIDDEN",
      });
      await expect(f.send(f.c, "PLAYERS_PRIVATE")).rejects.toMatchObject({
        code: "CHAT_FORBIDDEN",
      });
      await transaction([f.a.userId], [f.id], async (client) => {
        const scope = {
          client,
          actor: f.a,
          lockedActorIds: new Set<string>(),
          lockedRoomIds: new Set([f.id]),
        };
        await expect(
          chat.read(scope, f.id, "ROOM_PUBLIC"),
        ).rejects.toMatchObject({ code: "ROOM_LOCK_REQUIRED" });
        await expect(
          chat.read(
            {
              ...scope,
              actor: { ...f.a, kind: "member" },
              lockedActorIds: new Set([f.a.userId]),
            },
            f.id,
            "ROOM_PUBLIC",
          ),
        ).rejects.toMatchObject({ code: "CHAT_FORBIDDEN" });
      });
      await pool.query(
        "UPDATE public.room_members SET disconnected_at=clock_timestamp()-interval '301 seconds' WHERE user_id=$1",
        [f.c.userId],
      );
      await expect(f.read(f.c, "ROOM_PUBLIC")).rejects.toMatchObject({
        code: "CHAT_FORBIDDEN",
      });
    });
    it("cuts private history on every roster replacement including returning to the old pair but preserves color/readiness changes", async () => {
      const f = await fixture();
      await f.join(f.b, "play");
      await f.send(f.a, "PLAYERS_PRIVATE", "old pair");
      const old = (
        await pool.query(
          "SELECT pair_epoch FROM xiangqi_chat.rooms WHERE room_id=$1",
          [f.id],
        )
      ).rows[0].pair_epoch;
      await run(f.a, f.id, async (s) => {
        await s.client.query(
          "UPDATE public.room_members SET side=CASE side WHEN 'RED' THEN 'BLACK' ELSE 'RED' END,ready=true WHERE room_id=$1",
          [f.id],
        );
      });
      expect(
        ((await f.read(f.b, "PLAYERS_PRIVATE")) as { messages: unknown[] })
          .messages,
      ).toHaveLength(1);
      expect(
        (
          await pool.query(
            "SELECT pair_epoch FROM xiangqi_chat.rooms WHERE room_id=$1",
            [f.id],
          )
        ).rows[0].pair_epoch,
      ).toBe(old);
      await run(f.b, f.id, (s) => rooms.leave(s, f.id));
      await f.join(f.c, "play");
      await run(f.c, f.id, (s) => rooms.leave(s, f.id));
      await f.join(f.b, "play");
      expect(
        ((await f.read(f.a, "PLAYERS_PRIVATE")) as { messages: unknown[] })
          .messages,
      ).toEqual([]);
      expect(
        (
          await pool.query(
            "SELECT pair_epoch FROM xiangqi_chat.rooms WHERE room_id=$1",
            [f.id],
          )
        ).rows[0].pair_epoch,
      ).not.toBe(old);
    });
    it("captures sender color at send time and does not relabel history after a side swap", async () => {
      const f = await fixture();
      await f.join(f.b, "play");
      await f.send(f.a, "ROOM_PUBLIC", "red at send time");
      await pool.query(
        "UPDATE public.room_members SET side=CASE side WHEN 'RED' THEN 'BLACK' ELSE 'RED' END WHERE room_id=$1",
        [f.id],
      );
      await f.send(f.a, "ROOM_PUBLIC", "black at send time");
      expect((await f.read(f.a, "ROOM_PUBLIC")).messages).toMatchObject([
        { sender: { role: "red" } },
        { sender: { role: "black" } },
      ]);
    });
    it("captures spectator badge even after the sender leaves and rejoins as a player", async () => {
      const f = await fixture();
      await f.join(f.c, "watch");
      await f.send(f.c, "ROOM_PUBLIC", "viewer at send time");
      await run(f.c, f.id, (s) => rooms.leave(s, f.id));
      await f.join(f.c, "play");
      await f.send(f.c, "ROOM_PUBLIC", "black at send time");
      expect((await f.read(f.a, "ROOM_PUBLIC")).messages).toMatchObject([
        { sender: { role: "spectator" } },
        { sender: { role: "black" } },
      ]);
    });
    it("uses entry sequences: viewer cannot read pre-entry messages, reconnect preserves floor and rejoin resets it", async () => {
      const f = await fixture();
      await f.send(f.a, "ROOM_PUBLIC", "before");
      await f.join(f.c, "watch");
      await f.send(f.a, "ROOM_PUBLIC", "after");
      expect(
        (
          (await f.read(f.c, "ROOM_PUBLIC")) as {
            messages: { content: string }[];
          }
        ).messages.map((m) => m.content),
      ).toEqual(["after"]);
      await pool.query(
        "UPDATE public.room_members SET disconnected_at=clock_timestamp(),ready=false WHERE room_id=$1 AND user_id=$2",
        [f.id, f.c.userId],
      );
      await pool.query(
        "UPDATE public.room_members SET disconnected_at=NULL WHERE room_id=$1 AND user_id=$2",
        [f.id, f.c.userId],
      );
      expect(
        ((await f.read(f.c, "ROOM_PUBLIC")) as { messages: unknown[] })
          .messages,
      ).toHaveLength(1);
      await run(f.c, f.id, (s) => rooms.leave(s, f.id));
      await f.join(f.c, "watch");
      expect(
        ((await f.read(f.c, "ROOM_PUBLIC")) as { messages: unknown[] })
          .messages,
      ).toEqual([]);
    });
    it("deduplicates concurrent sends before rate and rejects command reuse and stale private replay", async () => {
      const f = await fixture();
      const cmd = randomUUID();
      const [one, two] = await Promise.all([
        f.send(f.a, "PLAYERS_PRIVATE", "same", cmd),
        f.send(f.a, "PLAYERS_PRIVATE", "same", cmd),
      ]);
      expect(one).toEqual(two);
      expect(
        (
          await pool.query(
            "SELECT count(*)::int AS n FROM xiangqi_chat.messages",
          )
        ).rows[0].n,
      ).toBe(1);
      await expect(
        f.send(f.a, "PLAYERS_PRIVATE", "different", cmd),
      ).rejects.toMatchObject({ code: "COMMAND_ID_REUSED" });
      await f.join(f.b, "play");
      await expect(
        f.send(f.a, "PLAYERS_PRIVATE", "same", cmd),
      ).rejects.toMatchObject({ code: "CHAT_SCOPE_CHANGED" });
    });
    it("enforces 200 Unicode codepoints and five messages across channels in ten SQL seconds under concurrency", async () => {
      const f = await fixture();
      await f.send(f.a, "ROOM_PUBLIC", "😀".repeat(200));
      await expect(
        f.send(f.a, "ROOM_PUBLIC", "😀".repeat(201)),
      ).rejects.toMatchObject({ code: "CHAT_INPUT_INVALID" });
      const results = await Promise.allSettled(
        Array.from({ length: 5 }, (_, i) =>
          f.send(f.a, i % 2 ? "ROOM_PUBLIC" : "PLAYERS_PRIVATE", "message"),
        ),
      );
      expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(4);
      expect(
        results
          .filter((r) => r.status === "rejected")
          .map((r) => (r as PromiseRejectedResult).reason.code),
      ).toEqual(["CHAT_RATE_LIMITED"]);
      await pool.query(
        "UPDATE xiangqi_chat.rate SET sent_at=ARRAY[clock_timestamp()-interval '11 seconds'] WHERE actor_id=$1",
        [f.a.userId],
      );
      await f.send(f.a, "ROOM_PUBLIC", "allowed");
    });
    it("expires receipts after 24 hours without removing the original canonical message", async () => {
      const f = await fixture();
      const commandId = randomUUID();
      const original = await f.send(f.a, "ROOM_PUBLIC", "original", commandId);
      await pool.query(
        "UPDATE xiangqi_chat.receipts SET created_at=created_at-interval '25 hours',expires_at=expires_at-interval '25 hours' WHERE command_id=$1",
        [commandId],
      );
      const fresh = await f.send(f.a, "ROOM_PUBLIC", "fresh", commandId);
      expect(fresh.messageId).not.toBe(original.messageId);
      expect(fresh.sequence).toBe(original.sequence + 1);
      expect(
        (await f.read(f.a, "ROOM_PUBLIC")).messages.map((m) => m.content),
      ).toEqual(["original", "fresh"]);
    });
    it("allows bounded filtered expansion but rejects an oversized filter result before any writes", async () => {
      const f = await fixture();
      const expanded = new ChatStore(() => "*".repeat(600));
      await run(f.a, f.id, (s) =>
        expanded.send(s, f.id, {
          commandId: randomUUID(),
          channel: "ROOM_PUBLIC",
          content: "a".repeat(200),
        }),
      );
      expect(
        (await f.read(f.a, "ROOM_PUBLIC")).messages[0]!.content,
      ).toHaveLength(600);
      const invalidMask = new ChatStore(() => "*".repeat(601));
      await expect(
        run(f.a, f.id, (s) =>
          invalidMask.send(s, f.id, {
            commandId: randomUUID(),
            channel: "ROOM_PUBLIC",
            content: "a",
          }),
        ),
      ).rejects.toMatchObject({ code: "CHAT_UNAVAILABLE" });
      expect((await f.read(f.a, "ROOM_PUBLIC")).messages).toHaveLength(1);
      expect(
        (
          await pool.query(
            "SELECT cardinality(sent_at) AS n FROM xiangqi_chat.rate WHERE actor_id=$1",
            [f.a.userId],
          )
        ).rows[0].n,
      ).toBe(1);
    });
    it("deletes room private chat state/messages/receipts/outbox on canonical room close and denies old replay", async () => {
      const f = await fixture();
      const cmd = randomUUID();
      await f.send(f.a, "ROOM_PUBLIC", "gone", cmd);
      await run(f.a, f.id, (s) => rooms.leave(s, f.id));
      for (const table of [
        "rooms",
        "entries",
        "messages",
        "receipts",
        "outbox",
      ])
        expect(
          (
            await pool.query(
              `SELECT count(*)::int AS n FROM xiangqi_chat.${table}`,
            )
          ).rows[0].n,
        ).toBe(0);
      await expect(
        f.send(f.a, "ROOM_PUBLIC", "gone", cmd),
      ).rejects.toMatchObject({ code: "CHAT_FORBIDDEN" });
    });
    it("has no anon/authenticated privileges and rollback preserves canonical room data but refuses feature messages", async () => {
      await apply(rollback);
      expect(
        (await pool.query("SELECT to_regnamespace('xiangqi_chat') AS n"))
          .rows[0].n,
      ).toBeNull();
      await apply(migration);
      for (const role of ["anon", "authenticated"]) {
        expect(
          (
            await pool.query(
              "SELECT has_schema_privilege($1,'xiangqi_chat','USAGE') AS allowed",
              [role],
            )
          ).rows[0].allowed,
        ).toBe(false);
      }
      const f = await fixture();
      await f.send(f.a, "ROOM_PUBLIC", "retained");
      await expect(apply(rollback)).rejects.toThrow(/feature writes/i);
      expect(
        (
          await pool.query(
            "SELECT count(*)::int AS n FROM xiangqi_chat.messages",
          )
        ).rows[0].n,
      ).toBe(1);
      expect(
        (
          await pool.query(
            "SELECT count(*)::int AS n FROM public.room_members WHERE room_id=$1",
            [f.id],
          )
        ).rows[0].n,
      ).toBe(1);
    });
    it("keeps existing service-role legacy room writes working without granting private chat access", async () => {
      const a = await actor(),
        id = randomUUID(),
        c = await pool.connect();
      try {
        await c.query("BEGIN; SET LOCAL ROLE service_role");
        await c.query(
          "INSERT INTO public.rooms(id,owner_id,name) VALUES($1,$2,'Legacy untouched')",
          [id, a.userId],
        );
        await c.query(
          "INSERT INTO public.room_members(room_id,user_id,role) VALUES($1,$2,'SPECTATOR')",
          [id, a.userId],
        );
        await c.query(
          "UPDATE public.rooms SET status='CLOSED',closed_at=clock_timestamp() WHERE id=$1",
          [id],
        );
        await c.query("COMMIT");
      } finally {
        await c.query("ROLLBACK");
        c.release();
      }
      expect(
        (await pool.query("SELECT status FROM public.rooms WHERE id=$1", [id]))
          .rows[0].status,
      ).toBe("CLOSED");
    });
    it("samples viewer expiry after a private chat row lock wait", async () => {
      const f = await fixture();
      await f.join(f.c, "watch");
      const blocker = await pool.connect();
      await blocker.query("BEGIN");
      await blocker.query(
        "SELECT room_id FROM xiangqi_chat.rooms WHERE room_id=$1 FOR UPDATE",
        [f.id],
      );
      await pool.query(
        "UPDATE public.room_members SET disconnected_at=clock_timestamp()-interval '299 seconds' WHERE room_id=$1 AND user_id=$2",
        [f.id, f.c.userId],
      );
      const pending = f.read(f.c, "ROOM_PUBLIC");
      void pending.catch(() => {});
      try {
        await expect
          .poll(
            async () =>
              (
                await pool.query(
                  "SELECT count(*)::int AS n FROM pg_catalog.pg_stat_activity WHERE wait_event_type='Lock' AND query LIKE 'SELECT m.role,e.floor,c.pair_epoch,c.sequence,m.side FROM public.rooms%' ",
                )
              ).rows[0].n,
            { timeout: 2000 },
          )
          .toBe(1);
        await new Promise((r) => setTimeout(r, 1100));
        await blocker.query("ROLLBACK");
        await expect(pending).rejects.toMatchObject({ code: "CHAT_FORBIDDEN" });
      } finally {
        await blocker.query("ROLLBACK");
        blocker.release();
        await pending.catch(() => {});
      }
    });
    it("samples the rate window after a rate row lock wait", async () => {
      const f = await fixture();
      await pool.query(
        "INSERT INTO xiangqi_chat.rate(actor_id,sent_at) VALUES($1,array_fill(clock_timestamp()-interval '9 seconds',ARRAY[5]))",
        [f.a.userId],
      );
      const blocker = await pool.connect();
      await blocker.query("BEGIN");
      await blocker.query(
        "SELECT actor_id FROM xiangqi_chat.rate WHERE actor_id=$1 FOR UPDATE",
        [f.a.userId],
      );
      const pending = f.send(f.a, "ROOM_PUBLIC", "after wait");
      void pending.catch(() => {});
      try {
        await expect
          .poll(
            async () =>
              (
                await pool.query(
                  "SELECT count(*)::int AS n FROM pg_catalog.pg_stat_activity WHERE wait_event_type='Lock' AND query LIKE 'SELECT sent_at FROM xiangqi_chat.rate%'",
                )
              ).rows[0].n,
            { timeout: 2000 },
          )
          .toBe(1);
        await new Promise((r) => setTimeout(r, 1100));
        await blocker.query("ROLLBACK");
        await expect(pending).resolves.toMatchObject({ sequence: 1 });
        expect(
          (
            await pool.query(
              "SELECT cardinality(sent_at) AS n FROM xiangqi_chat.rate WHERE actor_id=$1",
              [f.a.userId],
            )
          ).rows[0].n,
        ).toBe(1);
      } finally {
        await blocker.query("ROLLBACK");
        blocker.release();
        await pending.catch(() => {});
      }
    });
    it("bounds cursor pages without discarding older room history", async () => {
      const f = await fixture();
      await pool.query(
        "INSERT INTO xiangqi_chat.messages(id,room_id,sequence,sender_id,sender_role,channel,content,created_at) SELECT gen_random_uuid(),$1,n,$2,'red','ROOM_PUBLIC','Synthetic history '||n,clock_timestamp() FROM generate_series(1,51) n",
        [f.id, f.a.userId],
      );
      await pool.query(
        "UPDATE xiangqi_chat.rooms SET sequence=51 WHERE room_id=$1",
        [f.id],
      );
      const page = (await f.read(f.a, "ROOM_PUBLIC")) as {
        messages: { sequence: number }[];
        nextCursor: number;
        hasMore: boolean;
      };
      expect(page.messages).toHaveLength(50);
      expect(page.messages.map((m) => m.sequence)).toEqual(
        Array.from({ length: 50 }, (_, i) => i + 1),
      );
      expect(page.nextCursor).toBe(50);
      expect(page.hasMore).toBe(true);
      expect(await f.read(f.a, "ROOM_PUBLIC", page.nextCursor)).toMatchObject({
        messages: [{ sequence: 51 }],
        hasMore: false,
        nextCursor: 51,
      });
    });
    it("seeds only safe entry metadata and rolls back without changing existing room/member/legacy chat definitions", async () => {
      await apply(rollback);
      const f = await fixture();
      const before = (
        await pool.query(
          "SELECT row_to_json(r) AS r FROM public.rooms r WHERE id=$1",
          [f.id],
        )
      ).rows;
      const members = (
        await pool.query(
          "SELECT row_to_json(m) AS m FROM public.room_members m WHERE room_id=$1",
          [f.id],
        )
      ).rows;
      await apply(migration);
      expect(
        (
          await pool.query(
            "SELECT floor FROM xiangqi_chat.entries WHERE room_id=$1",
            [f.id],
          )
        ).rows,
      ).toEqual([{ floor: "0" }]);
      expect(
        (
          await pool.query(
            "SELECT attnotnull FROM pg_catalog.pg_attribute WHERE attrelid='public.chat_messages'::regclass AND attname='match_id'",
          )
        ).rows[0].attnotnull,
      ).toBe(true);
      await apply(rollback);
      expect(
        (
          await pool.query(
            "SELECT row_to_json(r) AS r FROM public.rooms r WHERE id=$1",
            [f.id],
          )
        ).rows,
      ).toEqual(before);
      expect(
        (
          await pool.query(
            "SELECT row_to_json(m) AS m FROM public.room_members m WHERE room_id=$1",
            [f.id],
          )
        ).rows,
      ).toEqual(members);
    });
    it.each([
      "GRANT UPDATE ON xiangqi_chat.messages TO anon",
      "ALTER TABLE xiangqi_chat.messages ADD COLUMN unexpected text",
      "ALTER FUNCTION xiangqi_chat.sync_membership() SET search_path=public",
      "ALTER TABLE public.room_members DISABLE TRIGGER chat_membership",
      "CREATE VIEW public.chat_unknown_dependency AS SELECT * FROM xiangqi_chat.rooms",
    ])("refuses metadata/dependency drift atomically: %s", async (sql) => {
      await pool.query(sql);
      await expect(apply(rollback)).rejects.toThrow();
      expect(
        (await pool.query("SELECT to_regclass('xiangqi_chat.messages') AS n"))
          .rows[0].n,
      ).toBe("xiangqi_chat.messages");
      expect(
        (
          await pool.query(
            "SELECT count(*)::int AS n FROM pg_catalog.pg_trigger WHERE tgname='chat_membership'",
          )
        ).rows[0].n,
      ).toBe(1);
    });
  },
);
