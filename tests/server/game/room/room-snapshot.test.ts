import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import {
  actor,
  apply,
  databaseUrl,
  pool,
  reset,
  transaction,
} from "./room.test-helper.js";
import { RoomStore } from "@server/game/room/room-store.js";
import type { RoomActor, RoomScope } from "@server/game/room/room.types.js";

afterAll(() => pool.end());

const store = new RoomStore();
const capabilities = new Map<string, string>();

async function run<T>(
  a: RoomActor,
  proof: string,
  roomIds: string[],
  work: (s: RoomScope) => Promise<T>,
  roster?: string[],
) {
  const locked =
    roster ??
    (roomIds.length
      ? (
          await pool.query(
            "SELECT user_id FROM public.room_members WHERE room_id=ANY($1::uuid[]) AND role='PLAYER'",
            [roomIds],
          )
        ).rows.map((r: { user_id: string }) => r.user_id)
      : []);
  const ids = [a.userId, ...locked];
  return transaction(
    ids,
    roomIds,
    async (client) =>
      work({
        client,
        actor: a,
        lockedActorIds: new Set(ids),
        lockedRoomIds: new Set(roomIds),
        activeActorIds: new Set(ids.filter((id) => capabilities.has(id))),
      }),
    async () => {
      if (capabilities.get(a.userId) !== proof)
        throw new Error("SESSION_INVALID");
    },
  );
}

async function admitted() {
  const a = await actor();
  const proof = randomUUID();
  capabilities.set(a.userId, proof);
  return { a, proof };
}

describe.skipIf(!databaseUrl)("room snapshot", () => {
  beforeEach(async () => {
    await pool.query(
      "DROP SCHEMA IF EXISTS xiangqi_chat CASCADE; DROP SCHEMA IF EXISTS xiangqi_ai CASCADE; DROP SCHEMA IF EXISTS xiangqi_social CASCADE",
    );
    await reset();
    // Chỉ migration lõi: không có bảng seat_invites và side_swap_offers,
    // nên snapshot phải trả offer là null mà không lỗi.
    await apply("supabase/migrations/20261011000006_rooms.sql");
    await apply("supabase/migrations/20261011000007_match_outcomes.sql");
    await apply("supabase/migrations/20261017000018_room_code_digits.sql");
    await apply("supabase/migrations/20261102000002_custom_rematch.sql");
    await apply("supabase/migrations/20261102000003_unlimited_inactivity.sql");
  });

  it("returns seats, online presence and spectators in one snapshot", async () => {
    const h = await admitted(),
      b = await admitted(),
      w = await admitted();
    const e = await run(h.a, h.proof, [], (s) =>
      store.create(s, { commandId: randomUUID() }),
    );
    await run(b.a, b.proof, [e.roomId], (s) =>
      store.join(s, {
        commandId: randomUUID(),
        roomId: e.roomId,
        intent: "auto",
      }),
    );
    await run(w.a, w.proof, [e.roomId], (s) =>
      store.join(s, {
        commandId: randomUUID(),
        roomId: e.roomId,
        intent: "watch",
      }),
    );
    await run(h.a, h.proof, [e.roomId], (s) =>
      store.presence(
        s,
        e.roomId,
        { connectionId: "host", generation: 1, serverInstance: randomUUID() },
        true,
      ),
    );

    const view = await run(h.a, h.proof, [e.roomId], (s) =>
      store.snapshot(s, e.roomId),
    );

    expect(view.room.seats.red).toBe(h.a.userId);
    expect(view.room.seats.black).toBe(b.a.userId);
    expect(view.room.spectators.map((x) => x.userId)).toEqual([w.a.userId]);
    expect(view.room.connected.red).toBe(true);
    expect(view.room.countdown).toBeNull();
    expect(view.room.downOffer).toBeNull();
    expect(view.room.swapOffer).toBeNull();
    expect(view.role).toBe("red");
  });

  it("authorize returns control and the room version from the same read", async () => {
    const h = await admitted(),
      b = await admitted();
    const e = await run(h.a, h.proof, [], (s) =>
      store.create(s, { commandId: randomUUID() }),
    );
    await run(b.a, b.proof, [e.roomId], (s) =>
      store.join(s, {
        commandId: randomUUID(),
        roomId: e.roomId,
        intent: "auto",
      }),
    );

    const auth = await run(h.a, h.proof, [e.roomId], (s) =>
      store.authorize(s, e.roomId),
    );
    const view = await run(h.a, h.proof, [e.roomId], (s) =>
      store.snapshot(s, e.roomId),
    );

    expect(auth.canControl).toBe(true);
    expect(auth.version).toBe(view.version);
  });

  it("rejects an expired spectator viewer from the snapshot", async () => {
    const h = await admitted(),
      w = await admitted();
    const e = await run(h.a, h.proof, [], (s) =>
      store.create(s, { commandId: randomUUID() }),
    );
    await run(w.a, w.proof, [e.roomId], (s) =>
      store.join(s, {
        commandId: randomUUID(),
        roomId: e.roomId,
        intent: "watch",
      }),
    );
    await pool.query(
      "UPDATE public.room_members SET disconnected_at=clock_timestamp()-interval '10 minutes' WHERE room_id=$1 AND user_id=$2",
      [e.roomId, w.a.userId],
    );

    await expect(
      run(w.a, w.proof, [e.roomId], (s) => store.snapshot(s, e.roomId)),
    ).rejects.toMatchObject({ code: "ROOM_FORBIDDEN", status: 403 });
  });

  it("reports a roster change when a seated player lock is missing", async () => {
    const h = await admitted(),
      b = await admitted();
    const e = await run(h.a, h.proof, [], (s) =>
      store.create(s, { commandId: randomUUID() }),
    );
    await run(b.a, b.proof, [e.roomId], (s) =>
      store.join(s, {
        commandId: randomUUID(),
        roomId: e.roomId,
        intent: "auto",
      }),
    );

    // Khóa thiếu người chơi b: snapshot phải báo đổi roster để caller thử lại.
    await expect(
      run(h.a, h.proof, [e.roomId], (s) => store.snapshot(s, e.roomId), [
        h.a.userId,
      ]),
    ).rejects.toMatchObject({
      code: "ROOM_ROSTER_CHANGED",
      status: 409,
      actorIds: expect.arrayContaining([b.a.userId]),
    });
  });
});
