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
import { RoomStore } from "./room-store.js";
import type { RoomActor, RoomScope } from "./contracts.js";
afterAll(() => pool.end());
const store = new RoomStore();
const capabilities = new Map<string, string>();
async function run<T>(
  a: RoomActor,
  proof: string,
  roomIds: string[],
  work: (s: RoomScope) => Promise<T>,
) {
  const roster = roomIds.length
    ? (
        await pool.query(
          "SELECT user_id FROM public.room_members WHERE room_id=ANY($1::uuid[]) AND role='PLAYER'",
          [roomIds],
        )
      ).rows.map((r: { user_id: string }) => r.user_id)
    : [];
  const ids = [a.userId, ...roster];
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
async function waitingPair() {
  const h = await admitted(),
    b = await admitted();
  const e = await run(h.a, h.proof, [], (s) =>
    store.create(s, { commandId: randomUUID(), name: "Doi ben" }),
  );
  await run(b.a, b.proof, [e.roomId], (s) =>
    store.join(s, {
      commandId: randomUUID(),
      roomId: e.roomId,
      intent: "auto",
    }),
  );
  return { h, b, roomId: e.roomId };
}
describe.skipIf(!databaseUrl)("side swap offers", () => {
  beforeEach(async () => {
    await pool.query(
      "DROP SCHEMA IF EXISTS xiangqi_chat CASCADE; DROP SCHEMA IF EXISTS xiangqi_ai CASCADE",
    );
    await reset();
    await apply("supabase/migrations/20261011000006_rooms.sql");
    await apply("supabase/migrations/20261011000013_side_swap.sql");
  });
  it("proposes, accepts, swaps seats and resets ready", async () => {
    const { h, b, roomId } = await waitingPair();
    const proposed = await run(h.a, h.proof, [roomId], (s) =>
      store.proposeSwap(s, roomId),
    );
    expect(proposed.room.swapOffer).toMatchObject({
      proposerId: h.a.userId,
      responderId: b.a.userId,
    });
    await expect(
      run(h.a, h.proof, [roomId], (s) => store.proposeSwap(s, roomId)),
    ).rejects.toMatchObject({ code: "SWAP_ALREADY_PENDING" });
    await expect(
      run(b.a, b.proof, [roomId], (s) => store.withdrawSwap(s, roomId)),
    ).rejects.toMatchObject({ code: "SWAP_NOT_PENDING" });
    const accepted = await run(b.a, b.proof, [roomId], (s) =>
      store.respondSwap(s, roomId, true),
    );
    expect(accepted.room.seats).toEqual({
      red: b.a.userId,
      black: h.a.userId,
    });
    expect(accepted.room.ready).toEqual({ red: false, black: false });
    expect(accepted.room.swapOffer).toBeNull();
  });
  it("declines then enforces a sixty-second resend cooldown", async () => {
    const { h, b, roomId } = await waitingPair();
    await run(h.a, h.proof, [roomId], (s) => store.proposeSwap(s, roomId));
    const declined = await run(b.a, b.proof, [roomId], (s) =>
      store.respondSwap(s, roomId, false),
    );
    expect(declined.room.swapOffer).toBeNull();
    await expect(
      run(h.a, h.proof, [roomId], (s) => store.proposeSwap(s, roomId)),
    ).rejects.toMatchObject({ code: "SWAP_COOLDOWN" });
    await pool.query(
      "UPDATE xiangqi_room.side_swap_offers SET resolved_at=clock_timestamp()-interval '61 seconds' WHERE room_id=$1",
      [roomId],
    );
    const again = await run(h.a, h.proof, [roomId], (s) =>
      store.proposeSwap(s, roomId),
    );
    expect(again.room.swapOffer).toMatchObject({ proposerId: h.a.userId });
  });
  it("expires through the worker and rejects late answers", async () => {
    const { h, b, roomId } = await waitingPair();
    await run(h.a, h.proof, [roomId], (s) => store.proposeSwap(s, roomId));
    const withdrawn = await run(h.a, h.proof, [roomId], (s) =>
      store.withdrawSwap(s, roomId),
    );
    expect(withdrawn.room.swapOffer).toBeNull();
    await run(h.a, h.proof, [roomId], (s) => store.proposeSwap(s, roomId));
    await pool.query(
      "WITH t AS MATERIALIZED(SELECT clock_timestamp()-interval '1 second' deadline) UPDATE xiangqi_room.side_swap_offers SET created_at=t.deadline-interval '30 seconds',expires_at=t.deadline FROM t WHERE room_id=$1 AND status='PENDING'",
      [roomId],
    );
    await expect(
      run(b.a, b.proof, [roomId], (s) => store.respondSwap(s, roomId, true)),
    ).rejects.toMatchObject({ code: "SWAP_EXPIRED" });
    expect(
      await run(h.a, h.proof, [roomId], (s) =>
        store.expireSwapOffers(s, roomId),
      ),
    ).toBe(1);
    const snap = await run(h.a, h.proof, [roomId], (s) =>
      store.snapshot(s, roomId),
    );
    expect(snap.room.swapOffer).toBeNull();
  });
  it("closes pending offers when seats change or countdown starts", async () => {
    const { h, b, roomId } = await waitingPair();
    await run(h.a, h.proof, [roomId], (s) => store.proposeSwap(s, roomId));
    await run(b.a, b.proof, [roomId], (s) => store.leave(s, roomId));
    const afterLeave = await run(h.a, h.proof, [roomId], (s) =>
      store.snapshot(s, roomId),
    );
    expect(afterLeave.room.swapOffer).toBeNull();
    await run(b.a, b.proof, [roomId], (s) =>
      store.join(s, {
        commandId: randomUUID(),
        roomId,
        intent: "auto",
      }),
    );
    for (const p of [h, b])
      await run(p.a, p.proof, [roomId], (s) =>
        store.presence(
          s,
          roomId,
          {
            connectionId: p.a.userId,
            generation: 1,
            serverInstance: randomUUID(),
          },
          true,
        ),
      );
    await run(h.a, h.proof, [roomId], (s) => store.proposeSwap(s, roomId));
    await run(h.a, h.proof, [roomId], (s) => store.ready(s, roomId, true));
    await run(b.a, b.proof, [roomId], (s) => store.ready(s, roomId, true));
    const counting = await run(h.a, h.proof, [roomId], (s) =>
      store.snapshot(s, roomId),
    );
    expect(counting.room.countdown).not.toBeNull();
    expect(counting.room.swapOffer).toBeNull();
  });
  it("rejects swap with one seat, during countdown and after seat change", async () => {
    const h = await admitted();
    const e = await run(h.a, h.proof, [], (s) =>
      store.create(s, { commandId: randomUUID(), name: "Mot ghe" }),
    );
    await expect(
      run(h.a, h.proof, [e.roomId], (s) => store.proposeSwap(s, e.roomId)),
    ).rejects.toMatchObject({ code: "SWAP_DENIED" });
    const b = await admitted();
    await run(b.a, b.proof, [e.roomId], (s) =>
      store.join(s, {
        commandId: randomUUID(),
        roomId: e.roomId,
        intent: "auto",
      }),
    );
    await run(h.a, h.proof, [e.roomId], (s) => store.proposeSwap(s, e.roomId));
    await run(b.a, b.proof, [e.roomId], (s) => store.leave(s, e.roomId));
    await expect(
      run(h.a, h.proof, [e.roomId], (s) =>
        store.respondSwap(s, e.roomId, true),
      ),
    ).rejects.toMatchObject({ code: "SWAP_NOT_PENDING" });
  });
});
