import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { GuestService } from "@server/account/guest/guest.service.js";
import { GuestStore } from "@server/account/guest/guest.store.js";
import { RoomStore } from "@server/game/room/room-store.js";
import { RoomError, type RoomActor } from "@server/game/room/room.types.js";
import {
  RoomTransactions,
  type RoomActorProof,
} from "@server/game/room/room-transactions.js";
import { databaseUrl, pool, reset } from "./room-transactions.test-helper.js";

const coordinator = new RoomTransactions(pool);
const rooms = new RoomStore();
const guest = new GuestService(new GuestStore(pool), {
  seatedSeat: async () => null,
  end: async () => {},
});
const capabilities = new Map<string, string>();
const ROUNDS = 15;

async function admitted(): Promise<RoomActor> {
  const result = await guest.create("Synthetic Guest");
  capabilities.set(result.userId, result.capability);
  return { userId: result.userId, kind: "guest" };
}
async function authorize(proof: RoomActorProof) {
  return guest.requireActorInTransaction(
    proof.client,
    capabilities.get(proof.actor.userId),
    "read",
    undefined,
    proof.lockedActorIds,
  );
}
function run<T>(
  a: RoomActor,
  roomIds: string[],
  work: (s: import("@server/game/room/room.types.js").RoomScope) => Promise<T>,
) {
  return coordinator.withRoom({ actor: a, roomIds }, authorize, work);
}
async function roomWith(host: RoomActor, ...others: RoomActor[]) {
  const done = await run(host, [], (s) =>
    rooms.create(s, { commandId: randomUUID() }),
  );
  if (done.status !== "active") throw new Error("Unexpected ended fixture");
  const roomId = done.value.roomId;
  for (const other of others) {
    await run(other, [roomId], (s) =>
      rooms.join(s, { commandId: randomUUID(), roomId, intent: "play" }),
    );
  }
  return roomId;
}
// A deadlock or serialization failure surfaces as a raw pg error (40P01/40001),
// whereas lawful races end as a domain RoomError or a successful command.
function unexpected(results: PromiseSettledResult<unknown>[]) {
  return results
    .filter((r): r is PromiseRejectedResult => r.status === "rejected")
    .map((r) => r.reason)
    .filter((e) => !(e instanceof RoomError));
}
async function idleInTransaction() {
  return Number(
    (
      await pool.query(
        "SELECT count(*) AS n FROM pg_stat_activity WHERE datname = current_database() AND state LIKE 'idle in transaction%' AND pid <> pg_backend_pid()",
      )
    ).rows[0].n,
  );
}

afterAll(() => pool.end());
describe.skipIf(!databaseUrl)("RoomStore concurrent commands", () => {
  beforeEach(async () => {
    capabilities.clear();
    await reset();
  });

  it("never deadlocks when every member leaves the same room at once", async () => {
    for (let i = 0; i < ROUNDS; i++) {
      const a = await admitted(),
        b = await admitted(),
        watchers = [await admitted(), await admitted()];
      const roomId = await roomWith(a, b);
      for (const w of watchers)
        await run(w, [roomId], (s) =>
          rooms.join(s, { commandId: randomUUID(), roomId, intent: "watch" }),
        );
      // Four actors lock the same four keys: an unordered acquisition would deadlock.
      const results = await Promise.allSettled(
        [a, b, ...watchers].map((who) =>
          run(who, [roomId], (s) => rooms.leave(s, roomId)),
        ),
      );
      expect(unexpected(results)).toEqual([]);
    }
    expect(await idleInTransaction()).toBe(0);
  });

  it("never deadlocks when a viewer joins while a player leaves and the host reads", async () => {
    for (let i = 0; i < ROUNDS; i++) {
      const a = await admitted(),
        b = await admitted(),
        viewer = await admitted();
      const roomId = await roomWith(a, b);
      const results = await Promise.allSettled([
        run(viewer, [roomId], (s) =>
          rooms.join(s, { commandId: randomUUID(), roomId, intent: "watch" }),
        ),
        run(b, [roomId], (s) => rooms.leave(s, roomId)),
        run(a, [roomId], (s) => rooms.snapshot(s, roomId)),
      ]);
      expect(unexpected(results)).toEqual([]);
    }
    expect(await idleInTransaction()).toBe(0);
  });

  it("applies exactly one of two concurrent identical join commands", async () => {
    const a = await admitted(),
      b = await admitted();
    const roomId = await roomWith(a);
    const commandId = randomUUID();
    const results = await Promise.allSettled([
      run(b, [roomId], (s) =>
        rooms.join(s, { commandId, roomId, intent: "play" }),
      ),
      run(b, [roomId], (s) =>
        rooms.join(s, { commandId, roomId, intent: "play" }),
      ),
    ]);
    expect(unexpected(results)).toEqual([]);
    const seated = await pool.query(
      "SELECT count(*)::int AS n FROM public.room_members WHERE room_id=$1 AND user_id=$2",
      [roomId, b.userId],
    );
    expect(seated.rows[0].n).toBe(1);
  });
});
