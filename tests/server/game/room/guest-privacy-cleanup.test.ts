import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import type { PoolClient } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { GuestService } from "@server/account/guest/guest.service.js";
import { GuestStore } from "@server/account/guest/guest.store.js";
import { GuestRoomCoordinator } from "@server/game/room/guest-room-auth.js";
import { RoomGuestPort } from "@server/game/room/guest-room-port.js";
import { RoomStore } from "@server/game/room/room-store.js";
import { RoomTransactions } from "@server/game/room/room-transactions.js";
import type { RoomActor, RoomScope } from "@server/game/room/room.types.js";
import { scopeContext } from "./guest-scope.test-helper.js";
import { databaseUrl, pool, reset } from "./room-transactions.test-helper.js";

const AI_RESERVATION_MIGRATION =
  "supabase/migrations/20261011000011_ai_reservations.sql";
const AI_PRESENCE_MIGRATION =
  "supabase/migrations/20261011000012_ai_presence.sql";
const CHAT_MIGRATION = "supabase/migrations/20261011000010_room_chat.sql";
const PRIVACY_MIGRATION =
  "supabase/migrations/20261019060000_guest_privacy_receipt_redaction.sql";
// Unicode, quotes and emoji (within the 2–20 character limit): the display name must never survive in a structured record tied to the guest UUID.
const GUEST_NAME = "Nguyễn Sen O'K";

// Same as the room-transactions helper's apply: privileged DDL, no test-fixture role.
async function applyFile(file: string) {
  const c = await pool.connect();
  try {
    await c.query("SET ROLE postgres");
    await c.query(await readFile(file, "utf8"));
  } finally {
    await c.query("ROLLBACK; RESET ROLE");
    c.release();
  }
}

async function count(sql: string, params: unknown[] = []): Promise<number> {
  return (await pool.query(sql, params)).rows[0].n as number;
}

describe.skipIf(!databaseUrl)(
  "Guest privacy cleanup against real Postgres",
  () => {
    let now = new Date("2026-10-20T00:00:00Z");
    const scopes = scopeContext();
    const rooms = new RoomStore();
    const transactions = new RoomTransactions(pool);
    const coordinator = new GuestRoomCoordinator(
      transactions,
      scopes.withScope,
    );
    const capabilities = new Map<string, string>();
    const scopeOf = (client: PoolClient, id: string, roomId: string) => {
      const s = scopes.current(client);
      if (!s || s.actor.userId !== id || !s.lockedRoomIds.has(roomId))
        throw new Error("Missing trusted room scope");
      return s;
    };
    const port = new RoomGuestPort(
      (c, id, roomId) => rooms.leave(scopeOf(c, id, roomId), roomId),
      scopes.scopeOf,
    );
    const guests = new GuestService(
      new GuestStore(pool),
      port,
      () => now,
      coordinator,
    );

    beforeAll(async () => {
      await reset();
      await pool.query("DROP SCHEMA IF EXISTS xiangqi_chat CASCADE");
      await applyFile(CHAT_MIGRATION);
      await applyFile(AI_RESERVATION_MIGRATION);
      await applyFile(AI_PRESENCE_MIGRATION);
      await applyFile(PRIVACY_MIGRATION);
    });
    afterAll(() => pool.end());

    async function admit(name: string): Promise<RoomActor> {
      const s = await guests.create(name);
      capabilities.set(s.userId, s.capability);
      return { userId: s.userId, kind: "guest" };
    }
    async function run<T>(
      a: RoomActor,
      roomIds: string[],
      work: (s: RoomScope) => Promise<T>,
    ): Promise<T> {
      const result = await transactions.withRoom(
        { actor: a, roomIds },
        (p) =>
          guests.requireActorInTransaction(
            p.client,
            capabilities.get(p.actor.userId),
            "read",
            undefined,
            p.lockedActorIds,
          ),
        (scope) => scopes.withScope(scope, () => work(scope)),
      );
      if (result.status !== "active")
        throw new Error("Unexpected ended fixture");
      return result.value;
    }
    // Chat rows are fixtures for the state the cleanup must remove; the chat store is not under test here.
    async function chatPost(
      roomId: string,
      senderId: string,
      content: string,
      sequence: number,
    ) {
      const at = now.toISOString();
      await pool.query(
        "INSERT INTO xiangqi_chat.rooms(room_id,player_ids,pair_epoch) VALUES($1,'{}',$2) ON CONFLICT(room_id) DO NOTHING",
        [roomId, randomUUID()],
      );
      const messageId = randomUUID();
      await pool.query(
        "INSERT INTO xiangqi_chat.messages(id,room_id,sequence,sender_id,sender_role,channel,pair_epoch,content,created_at) VALUES($1,$2,$3,$4,'spectator','ROOM_PUBLIC',NULL,$5,$6::timestamptz)",
        [messageId, roomId, sequence, senderId, content, at],
      );
      await pool.query(
        "INSERT INTO xiangqi_chat.receipts(actor_id,room_id,command_id,fingerprint,channel,pair_epoch,message_id,sequence,created_at,expires_at) VALUES($1,$2,$3,$4,'ROOM_PUBLIC',NULL,$5,$6,$7::timestamptz,$7::timestamptz+interval '24 hours')",
        [
          senderId,
          roomId,
          randomUUID(),
          "a".repeat(64),
          messageId,
          sequence,
          at,
        ],
      );
    }
    const displayName = async (userId: string) =>
      (
        await pool.query(
          "SELECT display_name FROM public.profiles WHERE user_id=$1",
          [userId],
        )
      ).rows[0].display_name as string;
    const receiptsOf = async (userId: string) =>
      (
        await pool.query(
          "SELECT 'room' AS source, command_id::text AS command, response::text AS response FROM xiangqi_room.entry_receipts WHERE actor_id=$1 UNION ALL SELECT 'realtime', command_id::text, response::text FROM xiangqi_realtime.receipts WHERE user_id=$1 ORDER BY 1,2",
          [userId],
        )
      ).rows;
    const pendingRevocations = async (userId: string) =>
      (
        await pool.query(
          "SELECT id::text AS id FROM xiangqi_room.outbox WHERE type='media.revoke-user' AND delivered_at IS NULL AND payload->>'userId'=$1 ORDER BY id",
          [userId],
        )
      ).rows.map((r) => r.id as string);

    it("logout erases the guest's own identity and chat while preserving the same-name member, pending media revocation and command idempotency", async () => {
      now = new Date("2026-10-20T00:00:00Z");
      const twin = await admit(GUEST_NAME);
      const hostB = await admit("Chủ phòng B");
      const guest = await admit(GUEST_NAME);
      const guestCapability = capabilities.get(guest.userId) as string;
      const createCommand = randomUUID();
      const roomA = (
        await run(twin, [], (s) =>
          rooms.create(s, { commandId: createCommand }),
        )
      ).roomId;
      await run(guest, [roomA], (s) =>
        rooms.join(s, {
          commandId: randomUUID(),
          roomId: roomA,
          intent: "watch",
        }),
      );
      await chatPost(roomA, guest.userId, "xin chào phòng A", 1);
      await run(guest, [roomA], (s) => rooms.leave(s, roomA));
      const roomB = (
        await run(hostB, [], (s) =>
          rooms.create(s, { commandId: randomUUID() }),
        )
      ).roomId;
      await run(guest, [roomB], (s) =>
        rooms.join(s, {
          commandId: randomUUID(),
          roomId: roomB,
          intent: "watch",
        }),
      );
      await chatPost(roomB, guest.userId, "tin nhắn phòng B", 1);

      const revocations = await pendingRevocations(guest.userId);
      const twinReceipts = await receiptsOf(twin.userId);
      expect(revocations.length).toBeGreaterThan(0);
      expect(twinReceipts.length).toBeGreaterThan(0);

      await guests.logout(guestCapability);

      expect(await displayName(guest.userId)).toBe("Khách");
      expect(await displayName(twin.userId)).toBe(GUEST_NAME);
      expect(
        await count(
          "SELECT count(*)::int AS n FROM xiangqi_chat.messages WHERE sender_id=$1",
          [guest.userId],
        ),
      ).toBe(0);
      expect(
        await count(
          "SELECT count(*)::int AS n FROM xiangqi_chat.receipts WHERE actor_id=$1",
          [guest.userId],
        ),
      ).toBe(0);
      expect(
        await count(
          "SELECT count(*)::int AS n FROM xiangqi_auth.guest_sessions WHERE guest_id=$1",
          [guest.userId],
        ),
      ).toBe(0);
      for (const table of [
        "xiangqi_room.entry_receipts",
        "xiangqi_realtime.receipts",
        "xiangqi_room.outbox",
      ]) {
        const column = table === "xiangqi_room.outbox" ? "payload" : "response";
        expect(
          await count(
            `SELECT count(*)::int AS n FROM ${table} WHERE strpos(${column}::text,$1)>0 AND strpos(${column}::text,$2)>0`,
            [GUEST_NAME, guest.userId],
          ),
        ).toBe(0);
      }
      // Pending media revocations are delivery obligations, not guest PII: pre-logout rows must survive untouched; logout's own room-leave revocations may be appended.
      expect(await pendingRevocations(guest.userId)).toEqual(
        expect.arrayContaining(revocations),
      );
      expect(await receiptsOf(twin.userId)).toEqual(twinReceipts);
      expect(
        await count(
          "SELECT count(*)::int AS n FROM public.room_members WHERE room_id=$1 AND user_id=$2",
          [roomA, twin.userId],
        ),
      ).toBe(1);
      const replay = await run(twin, [], (s) =>
        rooms.create(s, { commandId: createCommand }),
      );
      expect(replay.roomId).toBe(roomA);
      await expect(guests.requireActive(guestCapability)).rejects.toMatchObject(
        { code: "GUEST_INVALID" },
      );
    });

    it("expiry of an unseated guest erases its chat and fails closed only after cleanup commits", async () => {
      now = new Date("2026-10-21T00:00:00Z");
      const host = await admit("Chủ phòng C");
      const guest = await admit("Khách hết hạn");
      const guestCapability = capabilities.get(guest.userId) as string;
      const room = (
        await run(host, [], (s) => rooms.create(s, { commandId: randomUUID() }))
      ).roomId;
      await chatPost(room, guest.userId, "trước khi hết hạn", 1);

      now = new Date("2026-10-21T13:00:00Z");
      await guests.expireDue();

      expect(await displayName(guest.userId)).toBe("Khách");
      expect(
        await count(
          "SELECT count(*)::int AS n FROM xiangqi_chat.messages WHERE sender_id=$1",
          [guest.userId],
        ),
      ).toBe(0);
      await expect(guests.requireActive(guestCapability)).rejects.toMatchObject(
        { code: "GUEST_INVALID" },
      );
    });
  },
);
