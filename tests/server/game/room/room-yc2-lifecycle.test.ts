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
    store.create(s, { commandId: randomUUID() }),
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

async function connect(
  u: { a: RoomActor; proof: string },
  roomId: string,
  connectionId: string,
) {
  await run(u.a, u.proof, [roomId], (s) =>
    store.presence(
      s,
      roomId,
      { connectionId, generation: 1, serverInstance: randomUUID() },
      true,
    ),
  );
}

describe.skipIf(!databaseUrl)("YC2 room lifecycle gaps", () => {
  beforeEach(async () => {
    await pool.query(
      "DROP SCHEMA IF EXISTS xiangqi_chat CASCADE; DROP SCHEMA IF EXISTS xiangqi_ai CASCADE",
    );
    await reset();
    await apply("supabase/migrations/20261011000006_rooms.sql");
    await apply("supabase/migrations/20261017000018_room_code_digits.sql");
    await apply("supabase/migrations/20261102000002_custom_rematch.sql");
    await apply("supabase/migrations/20261011000013_side_swap.sql");
  });

  // Q3: rút đề nghị không tạo cooldown, nên gửi lại ngay được.
  it("withdrawn swap offer does not start a resend cooldown", async () => {
    const { h, b, roomId } = await waitingPair();
    await run(h.a, h.proof, [roomId], (s) => store.proposeSwap(s, roomId));
    const withdrawn = await run(h.a, h.proof, [roomId], (s) =>
      store.withdrawSwap(s, roomId),
    );
    expect(withdrawn.room.swapOffer).toBeNull();
    const again = await run(h.a, h.proof, [roomId], (s) =>
      store.proposeSwap(s, roomId),
    );
    expect(again.room.swapOffer).toMatchObject({
      proposerId: h.a.userId,
      responderId: b.a.userId,
    });
  });

  // Q4: người chơi thứ hai rời ghế khi đang chờ vẫn reset Sẵn sàng và huỷ đếm ngược.
  it("second player leaving while waiting resets ready and cancels countdown", async () => {
    const { h, b, roomId } = await waitingPair();
    await connect(h, roomId, "host");
    await connect(b, roomId, "black");
    await run(b.a, b.proof, [roomId], (s) => store.ready(s, roomId, true));
    await run(h.a, h.proof, [roomId], (s) => store.start(s, roomId));
    const before = await pool.query(
      "SELECT count(*)::int AS n FROM xiangqi_room.countdowns WHERE room_id=$1",
      [roomId],
    );
    expect(before.rows[0].n).toBe(1);

    await run(b.a, b.proof, [roomId], (s) => store.leave(s, roomId));

    const after = await run(h.a, h.proof, [roomId], (s) =>
      store.snapshot(s, roomId),
    );
    expect(after.room.ready.red).toBe(false);
    expect(after.room.seats.red).toBe(h.a.userId);
    const remaining = await pool.query(
      "SELECT count(*)::int AS n FROM xiangqi_room.countdowns WHERE room_id=$1",
      [roomId],
    );
    expect(remaining.rows[0].n).toBe(0);
  });

  it("player stepping down resets the remaining seated player's ready", async () => {
    const { h, b, roomId } = await waitingPair();
    await run(h.a, h.proof, [roomId], (s) =>
      store.presence(
        s,
        roomId,
        { connectionId: "host", generation: 1, serverInstance: randomUUID() },
        true,
      ),
    );
    await run(b.a, b.proof, [roomId], (s) =>
      store.presence(
        s,
        roomId,
        { connectionId: "black", generation: 1, serverInstance: randomUUID() },
        true,
      ),
    );
    await run(b.a, b.proof, [roomId], (s) => store.ready(s, roomId, true));
    await run(b.a, b.proof, [roomId], (s) => store.toSpectator(s, roomId));
    const view = await run(h.a, h.proof, [roomId], (s) =>
      store.snapshot(s, roomId),
    );
    expect(view.room.ready).toEqual({ red: false, black: false });
  });
  it("host moving a seated player down resets the host's ready", async () => {
    const { h, b, roomId } = await waitingPair();
    await run(h.a, h.proof, [roomId], (s) =>
      store.presence(
        s,
        roomId,
        { connectionId: "host", generation: 1, serverInstance: randomUUID() },
        true,
      ),
    );
    await run(b.a, b.proof, [roomId], (s) =>
      store.presence(
        s,
        roomId,
        { connectionId: "black", generation: 1, serverInstance: randomUUID() },
        true,
      ),
    );
    await run(b.a, b.proof, [roomId], (s) => store.ready(s, roomId, true));
    await run(h.a, h.proof, [roomId], (s) =>
      store.moveToSpectator(s, roomId, b.a.userId),
    );
    const view = await run(h.a, h.proof, [roomId], (s) =>
      store.snapshot(s, roomId),
    );
    expect(view.room.ready).toEqual({ red: false, black: false });
  });

  it("sixth viewer gets ROOM_FULL when two players and five viewers are seated", async () => {
    const { roomId } = await waitingPair();
    for (let i = 0; i < 5; i++) {
      const v = await admitted();
      await run(v.a, v.proof, [roomId], (s) =>
        store.join(s, { commandId: randomUUID(), roomId, intent: "watch" }),
      );
    }
    const w = await admitted();
    await expect(
      run(w.a, w.proof, [roomId], (s) =>
        store.join(s, { commandId: randomUUID(), roomId, intent: "watch" }),
      ),
    ).rejects.toMatchObject({ code: "ROOM_FULL" });
  });
  it("player disconnect outside countdown resets the seated ready state", async () => {
    const { h, b, roomId } = await waitingPair();
    const proofs = new Map(
      [h, b].map((p) => [
        p.a.userId,
        {
          connectionId: p.a.userId,
          generation: 1,
          serverInstance: randomUUID(),
        },
      ]),
    );
    for (const p of [h, b])
      await run(p.a, p.proof, [roomId], (s) =>
        store.presence(s, roomId, proofs.get(p.a.userId)!, true),
      );
    await run(b.a, b.proof, [roomId], (s) => store.ready(s, roomId, true));
    await run(b.a, b.proof, [roomId], (s) =>
      store.presence(s, roomId, proofs.get(b.a.userId)!, false),
    );
    const view = await run(h.a, h.proof, [roomId], (s) =>
      store.snapshot(s, roomId),
    );
    expect(view.room.ready).toEqual({ red: false, black: false });
    expect(view.room.countdown).toBeNull();
  });
  it("host expiring at sixty seconds transfers host to the seated peer without a loss", async () => {
    const { h, b, roomId } = await waitingPair();
    const instance = randomUUID();
    for (const p of [h, b])
      await run(p.a, p.proof, [roomId], (s) =>
        store.presence(
          s,
          roomId,
          { connectionId: p.a.userId, generation: 1, serverInstance: instance },
          true,
        ),
      );
    await run(h.a, h.proof, [roomId], (s) =>
      store.presence(
        s,
        roomId,
        { connectionId: h.a.userId, generation: 1, serverInstance: instance },
        false,
      ),
    );
    await pool.query(
      "UPDATE public.room_members SET disconnected_at=clock_timestamp()-interval '61 seconds' WHERE room_id=$1 AND user_id=$2",
      [roomId, h.a.userId],
    );
    const closed = await run(b.a, b.proof, [roomId], (s) =>
      store.expireDisconnected(s, roomId),
    );
    expect(closed).toBe(false);
    const room = (
      await pool.query("SELECT status,owner_id FROM public.rooms WHERE id=$1", [
        roomId,
      ])
    ).rows[0];
    expect(room).toEqual({ status: "WAITING", owner_id: b.a.userId });
    const hostSeat = await pool.query(
      "SELECT count(*)::int AS n FROM public.room_members WHERE room_id=$1 AND user_id=$2 AND role='PLAYER'",
      [roomId, h.a.userId],
    );
    expect(hostSeat.rows[0].n).toBe(0);
    const matches = await pool.query(
      "SELECT count(*)::int AS n FROM public.matches",
    );
    expect(matches.rows[0].n).toBe(0);
  });
  it("lone connected host stays open after a long wait", async () => {
    const h = await admitted();
    const e = await run(h.a, h.proof, [], (s) =>
      store.create(s, { commandId: randomUUID() }),
    );
    await run(h.a, h.proof, [e.roomId], (s) =>
      store.presence(
        s,
        e.roomId,
        { connectionId: "host", generation: 1, serverInstance: randomUUID() },
        true,
      ),
    );
    await pool.query(
      "UPDATE xiangqi_room.presence SET last_seen_at=clock_timestamp()-interval '2 hours' WHERE room_id=$1",
      [e.roomId],
    );
    const closed = await run(h.a, h.proof, [e.roomId], (s) =>
      store.expireDisconnected(s, e.roomId),
    );
    await run(h.a, h.proof, [e.roomId], (s) => store.startDue(s, e.roomId));
    expect(closed).toBe(false);
    const room = (
      await pool.query("SELECT status FROM public.rooms WHERE id=$1", [
        e.roomId,
      ])
    ).rows[0];
    expect(room.status).toBe("WAITING");
  });
  it("countdown start closes the pending swap offer without a cooldown", async () => {
    const { h, b, roomId } = await waitingPair();
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
    await run(b.a, b.proof, [roomId], (s) => store.ready(s, roomId, true));
    await run(h.a, h.proof, [roomId], (s) => store.start(s, roomId));
    const offer = (
      await pool.query(
        "SELECT status FROM xiangqi_room.side_swap_offers WHERE room_id=$1",
        [roomId],
      )
    ).rows[0];
    expect(offer.status).toBe("CLOSED");
    const view = await run(h.a, h.proof, [roomId], (s) =>
      store.snapshot(s, roomId),
    );
    expect(view.room.swapCooldownUntil ?? null).toBeNull();
  });
  it("seat leave closes the pending swap offer without a cooldown", async () => {
    const { h, b, roomId } = await waitingPair();
    await run(h.a, h.proof, [roomId], (s) => store.proposeSwap(s, roomId));
    await run(b.a, b.proof, [roomId], (s) => store.leave(s, roomId));
    const offer = (
      await pool.query(
        "SELECT status FROM xiangqi_room.side_swap_offers WHERE room_id=$1",
        [roomId],
      )
    ).rows[0];
    expect(offer.status).toBe("CLOSED");
    const view = await run(h.a, h.proof, [roomId], (s) =>
      store.snapshot(s, roomId),
    );
    expect(view.room.swapCooldownUntil ?? null).toBeNull();
  });
});
