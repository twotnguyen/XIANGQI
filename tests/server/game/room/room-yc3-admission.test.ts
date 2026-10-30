import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { RoomStore } from "@server/game/room/room-store.js";
import { RoomTransactions } from "@server/game/room/room-transactions.js";
import type { RoomActor, RoomScope } from "@server/game/room/room.types.js";
import {
  actor,
  databaseUrl,
  pool,
  reset,
} from "./room-transactions.test-helper.js";

const rooms = new RoomStore();
const transactions = new RoomTransactions(pool);
async function run<T>(
  who: RoomActor,
  ids: string[],
  work: (scope: RoomScope) => Promise<T>,
) {
  const result = await transactions.withRoom(
    { actor: who, roomIds: ids },
    async () => ({ status: "active", actor: who }),
    work,
  );
  if (result.status !== "active") throw new Error("Fixture actor ended");
  return result.value;
}
async function create(host: RoomActor, viewerLimit = 5) {
  return run(host, [], (s) =>
    rooms.create(s, { commandId: randomUUID(), viewerLimit }),
  );
}
async function join(
  who: RoomActor,
  roomId: string,
  intent: "auto" | "play" | "watch" = "auto",
  commandId = randomUUID(),
) {
  return run(who, [roomId], (s) =>
    rooms.join(s, { commandId, roomId, intent }),
  );
}
async function memberships(who: RoomActor) {
  return (
    await pool.query(
      "SELECT room_id,role FROM public.room_members WHERE user_id=$1 ORDER BY room_id",
      [who.userId],
    )
  ).rows;
}
afterAll(() => pool.end());
describe.skipIf(!databaseUrl)("YC3 room admission", () => {
  beforeEach(async () => {
    await reset();
  });
  it("moves a viewer only after acquiring B and replays without moving twice", async () => {
    const hostA = await actor(),
      hostB = await actor(),
      viewer = await actor();
    const a = await create(hostA),
      b = await create(hostB);
    await join(viewer, a.roomId, "watch");
    const commandId = randomUUID();
    const result = await join(viewer, b.roomId, "auto", commandId);
    expect(result.role).toBe("black");
    expect(await memberships(viewer)).toEqual([
      { room_id: b.roomId, role: "PLAYER" },
    ]);
    expect(await join(viewer, b.roomId, "auto", commandId)).toEqual(result);
    const effects = await pool.query(
      "SELECT type FROM xiangqi_room.outbox WHERE room_id=$1 AND type='media.revoke-user' AND payload->>'userId'=$2",
      [a.roomId, viewer.userId],
    );
    expect(effects.rows).toEqual([{ type: "media.revoke-user" }]);
  });
  it("keeps A when B is full or locked, with no source revocation", async () => {
    const hostA = await actor(),
      hostB = await actor(),
      peer = await actor(),
      viewer = await actor();
    const a = await create(hostA),
      b = await create(hostB, 0);
    await join(peer, b.roomId);
    await join(viewer, a.roomId, "watch");
    await expect(join(viewer, b.roomId)).rejects.toMatchObject({
      code: "ROOM_FULL",
    });
    expect(await memberships(viewer)).toEqual([
      { room_id: a.roomId, role: "SPECTATOR" },
    ]);
    await run(hostB, [b.roomId], async (s) => {
      const view = await rooms.snapshot(s, b.roomId);
      return rooms.changeVisibility(s, b.roomId, view.version, "LOCKED");
    });
    await expect(join(viewer, b.roomId)).rejects.toMatchObject({
      code: "ROOM_LOCKED",
    });
    expect(await memberships(viewer)).toEqual([
      { room_id: a.roomId, role: "SPECTATOR" },
    ]);
    expect(
      (
        await pool.query(
          "SELECT id FROM xiangqi_room.outbox WHERE room_id=$1 AND type='media.revoke-user'",
          [a.roomId],
        )
      ).rows,
    ).toEqual([]);
  });
  it("does not use automatic admission to bypass a reserved player position", async () => {
    const hostA = await actor(),
      hostB = await actor();
    const a = await create(hostA),
      b = await create(hostB);
    await expect(join(hostA, b.roomId)).rejects.toMatchObject({
      code: "ALREADY_SEATED",
    });
    expect(await memberships(hostA)).toEqual([
      { room_id: a.roomId, role: "PLAYER" },
    ]);
  });
  it("reports the spectator role when automatic link admission finds both seats occupied", async () => {
    const host = await actor(),
      peer = await actor(),
      viewer = await actor();
    const room = await create(host);
    await join(peer, room.roomId);
    const entry = await join(viewer, room.roomId);
    expect(entry.role).toBe("spectator");
    expect(entry.notice).toBe(
      "Ghế đấu đã đủ 2 người, bạn đang tham gia phòng với vai trò Người xem.",
    );
  });
  it("rolls back both memberships and outbox when admission fails after writes", async () => {
    const hostA = await actor(),
      hostB = await actor(),
      viewer = await actor();
    const a = await create(hostA),
      b = await create(hostB);
    await join(viewer, a.roomId, "watch");
    await expect(
      run(viewer, [b.roomId], async (s) => {
        await rooms.join(s, {
          commandId: randomUUID(),
          roomId: b.roomId,
          intent: "auto",
        });
        throw new Error("synthetic post-write failure");
      }),
    ).rejects.toThrow("synthetic post-write failure");
    expect(await memberships(viewer)).toEqual([
      { room_id: a.roomId, role: "SPECTATOR" },
    ]);
    expect(
      (
        await pool.query(
          "SELECT user_id FROM public.active_players WHERE user_id=$1",
          [viewer.userId],
        )
      ).rows,
    ).toEqual([]);
    expect(
      (
        await pool.query(
          "SELECT id FROM xiangqi_room.outbox WHERE room_id=$1 AND type='media.revoke-user'",
          [a.roomId],
        )
      ).rows,
    ).toEqual([]);
  });
  it("serializes transfers competing for B's final seat and leaves the loser in A", async () => {
    const hostA = await actor(),
      hostB = await actor(),
      v1 = await actor(),
      v2 = await actor();
    const a = await create(hostA),
      b = await create(hostB, 0);
    await join(v1, a.roomId, "watch");
    await join(v2, a.roomId, "watch");
    const outcomes = await Promise.allSettled([
      join(v1, b.roomId),
      join(v2, b.roomId),
    ]);
    expect(outcomes.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    const rejected = outcomes.find(
      (r) => r.status === "rejected",
    ) as PromiseRejectedResult;
    expect(rejected.reason).toMatchObject({ code: "ROOM_FULL" });
    for (const [index, viewer] of [v1, v2].entries())
      expect(await memberships(viewer)).toEqual([
        outcomes[index]!.status === "fulfilled"
          ? { room_id: b.roomId, role: "PLAYER" }
          : { room_id: a.roomId, role: "SPECTATOR" },
      ]);
  });
});
