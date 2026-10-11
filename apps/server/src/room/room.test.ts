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
import { RoomGuestPort } from "./guest-room-port.js";
import { GuestService } from "../guest/guest.service.js";
import { RoomWorker } from "./room-worker.js";
import { RoomStore } from "./room-store.js";
import type { RoomActor, RoomScope } from "./contracts.js";
const migration = "supabase/migrations/20261011000006_rooms.sql";
const rollback = "supabase/rollback/20261011000006_rooms.sql";
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
describe.skipIf(!databaseUrl)("room mutations", () => {
  beforeEach(async () => {
    await reset();
    await apply("supabase/migrations/20261011000006_rooms.sql");
  });
  it("creates default code-only room with red reservation and durable idempotent response", async () => {
    const { a, proof } = await admitted(),
      input = { commandId: randomUUID(), name: "  Kỳ đài  " };
    const entry = await run(a, proof, [], (s) => store.create(s, input));
    expect(entry).toMatchObject({
      role: "red",
      version: 1,
      inviteCode: expect.stringMatching(/^[A-HJ-NP-Z2-9]{8}$/),
    });
    expect(await run(a, proof, [], (s) => store.create(s, input))).toEqual(
      entry,
    );
    expect(
      (
        await pool.query(
          "SELECT name,visibility,time_control,viewer_limit FROM public.rooms",
        )
      ).rows[0],
    ).toEqual({
      name: "Kỳ đài",
      visibility: "CODE_ONLY",
      time_control: 600,
      viewer_limit: 5,
    });
    expect(
      (
        await pool.query(
          "SELECT room_id,match_id FROM public.active_players WHERE user_id=$1",
          [a.userId],
        )
      ).rows[0],
    ).toEqual({
      room_id: (entry as { roomId: string }).roomId,
      match_id: null,
    });
  });
  it("projects the current invite code after reload only to admitted members and hides a locked code", async () => {
    const { a, proof } = await admitted();
    const entry = await run(a, proof, [], (scope) =>
      store.create(scope, {
        commandId: randomUUID(),
        name: "Reload invitation",
      }),
    );
    const reloaded = await run(a, proof, [entry.roomId], (scope) =>
      new RoomStore().snapshot(scope, entry.roomId),
    );
    expect(reloaded.room).toHaveProperty("inviteCode", entry.inviteCode);
    const outsider = await admitted();
    await expect(
      run(outsider.a, outsider.proof, [entry.roomId], (scope) =>
        store.snapshot(scope, entry.roomId),
      ),
    ).rejects.toMatchObject({ code: "ROOM_FORBIDDEN" });
    await pool.query(
      "UPDATE public.rooms SET visibility='LOCKED' WHERE id=$1",
      [entry.roomId],
    );
    expect(
      (
        await run(a, proof, [entry.roomId], (scope) =>
          store.snapshot(scope, entry.roomId),
        )
      ).room,
    ).toHaveProperty("inviteCode", null);
  });
  it("denies wrong session and concurrent second seat; rejects changed command payload", async () => {
    const { a, proof } = await admitted();
    await expect(
      run(a, "wrong", [], (s) =>
        store.create(s, { commandId: randomUUID(), name: "Room" }),
      ),
    ).rejects.toThrow("SESSION_INVALID");
    const commandId = randomUUID();
    await run(a, proof, [], (s) => store.create(s, { commandId, name: "One" }));
    await expect(
      run(a, proof, [], (s) => store.create(s, { commandId, name: "Two" })),
    ).rejects.toMatchObject({ code: "COMMAND_ID_REUSED" });
    await expect(
      run(a, proof, [], (s) =>
        store.create(s, { commandId: randomUUID(), name: "Other" }),
      ),
    ).rejects.toMatchObject({ code: "ALREADY_SEATED" });
  });
  it("validates room settings and Unicode name before writing any room", async () => {
    const { a, proof } = await admitted();
    for (const input of [
      { name: "" },
      { name: "x".repeat(61) },
      { name: "Room", timeMinutes: 0 },
      { name: "Room", viewerLimit: 6 },
    ])
      await expect(
        run(a, proof, [], (s) =>
          store.create(s, { commandId: randomUUID(), ...input }),
        ),
      ).rejects.toMatchObject({ code: "ROOM_INPUT_INVALID" });
    expect(
      (await pool.query("SELECT count(*)::int AS n FROM public.rooms")).rows[0]
        .n,
    ).toBe(0);
  });
  it("joins the empty seat, resets ready, enforces viewer capacity and unique identity", async () => {
    const h = await admitted(),
      b = await admitted(),
      v = await admitted(),
      w = await admitted();
    const e = await run(h.a, h.proof, [], (s) =>
      store.create(s, {
        commandId: randomUUID(),
        name: "Seats",
        viewerLimit: 1,
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
    await run(h.a, h.proof, [e.roomId], (s) => store.ready(s, e.roomId, true));
    expect(
      await run(b.a, b.proof, [e.roomId], (s) =>
        store.join(s, {
          commandId: randomUUID(),
          roomId: e.roomId,
          intent: "auto",
        }),
      ),
    ).toMatchObject({ role: "black" });
    expect(
      (await run(h.a, h.proof, [e.roomId], (s) => store.snapshot(s, e.roomId)))
        .room.ready.red,
    ).toBe(false);
    expect(
      await run(v.a, v.proof, [e.roomId], (s) =>
        store.join(s, {
          commandId: randomUUID(),
          roomId: e.roomId,
          intent: "watch",
        }),
      ),
    ).toMatchObject({ role: "spectator" });
    await expect(
      run(w.a, w.proof, [e.roomId], (s) =>
        store.join(s, {
          commandId: randomUUID(),
          roomId: e.roomId,
          intent: "watch",
        }),
      ),
    ).rejects.toMatchObject({ code: "ROOM_FULL" });
  });
  it("switches freely only when lone host and starts durable three-second countdown", async () => {
    const h = await admitted(),
      b = await admitted();
    const e = await run(h.a, h.proof, [], (s) =>
      store.create(s, { commandId: randomUUID(), name: "Ready" }),
    );
    await run(h.a, h.proof, [e.roomId], (s) => store.switchSeat(s, e.roomId));
    expect(
      (await run(h.a, h.proof, [e.roomId], (s) => store.snapshot(s, e.roomId)))
        .room.seats.black,
    ).toBe(h.a.userId);
    await run(b.a, b.proof, [e.roomId], (s) =>
      store.join(s, {
        commandId: randomUUID(),
        roomId: e.roomId,
        intent: "auto",
      }),
    );
    await expect(
      run(h.a, h.proof, [e.roomId], (s) => store.switchSeat(s, e.roomId)),
    ).rejects.toMatchObject({ code: "SEAT_SWITCH_DENIED" });
    for (const p of [h, b])
      await run(p.a, p.proof, [e.roomId], (s) =>
        store.presence(
          s,
          e.roomId,
          {
            connectionId: p.a.userId,
            generation: 1,
            serverInstance: randomUUID(),
          },
          true,
        ),
      );
    await run(h.a, h.proof, [e.roomId], (s) => store.ready(s, e.roomId, true));
    await run(b.a, b.proof, [e.roomId], (s) => store.ready(s, e.roomId, true));
    expect(
      (
        await pool.query(
          "SELECT extract(epoch FROM due_at-now())::float8 AS delta FROM xiangqi_room.countdowns",
        )
      ).rows[0].delta,
    ).toBeGreaterThan(2.5);
    await pool.query(
      "UPDATE xiangqi_room.countdowns SET due_at=now()-interval '1ms'",
    );
    await run(h.a, h.proof, [e.roomId], (s) => store.startDue(s, e.roomId));
    expect(
      (
        await pool.query(
          "SELECT status,current_match_id FROM public.rooms WHERE id=$1",
          [e.roomId],
        )
      ).rows[0],
    ).toEqual({ status: "WAITING", current_match_id: null });
  });
  it("fences stale disconnect and cancels countdown on actual disconnect without match", async () => {
    const h = await admitted(),
      b = await admitted();
    const e = await run(h.a, h.proof, [], (s) =>
      store.create(s, { commandId: randomUUID(), name: "Disconnect" }),
    );
    await run(b.a, b.proof, [e.roomId], (s) =>
      store.join(s, {
        commandId: randomUUID(),
        roomId: e.roomId,
        intent: "auto",
      }),
    );
    const instance = randomUUID();
    for (const p of [h, b])
      await run(p.a, p.proof, [e.roomId], (s) =>
        store.presence(
          s,
          e.roomId,
          { connectionId: p.a.userId, generation: 2, serverInstance: instance },
          true,
        ),
      );
    for (const p of [h, b])
      await run(p.a, p.proof, [e.roomId], (s) =>
        store.ready(s, e.roomId, true),
      );
    await run(h.a, h.proof, [e.roomId], (s) =>
      store.presence(
        s,
        e.roomId,
        { connectionId: "old", generation: 1, serverInstance: instance },
        false,
      ),
    );
    expect(
      (
        await pool.query(
          "SELECT count(*)::int AS n FROM xiangqi_room.countdowns",
        )
      ).rows[0].n,
    ).toBe(1);
    await run(h.a, h.proof, [e.roomId], (s) =>
      store.presence(
        s,
        e.roomId,
        { connectionId: h.a.userId, generation: 2, serverInstance: instance },
        false,
      ),
    );
    expect(
      (
        await pool.query(
          "SELECT count(*)::int AS n FROM xiangqi_room.countdowns",
        )
      ).rows[0].n,
    ).toBe(0);
    expect(
      (
        await pool.query(
          "SELECT ready FROM public.room_members WHERE room_id=$1",
          [e.roomId],
        )
      ).rows.every((r) => r.ready === false),
    ).toBe(true);
    const view = await run(b.a, b.proof, [e.roomId], (scope) =>
      store.snapshot(scope, e.roomId),
    );
    expect(view.room.connected.red).toBe(false);
    expect(view.room.graceUntil.red).toEqual(expect.any(String));
    expect(Date.parse(view.serverNow)).toBeGreaterThan(0);
  });
  it("transfers host, closes after final seat leaves and deletes chat atomically", async () => {
    const h = await admitted(),
      b = await admitted();
    const e = await run(h.a, h.proof, [], (s) =>
      store.create(s, { commandId: randomUUID(), name: "Close" }),
    );
    await run(b.a, b.proof, [e.roomId], (s) =>
      store.join(s, {
        commandId: randomUUID(),
        roomId: e.roomId,
        intent: "auto",
      }),
    );
    await run(h.a, h.proof, [e.roomId], (s) => store.leave(s, e.roomId));
    expect(
      (
        await pool.query("SELECT owner_id FROM public.rooms WHERE id=$1", [
          e.roomId,
        ])
      ).rows[0].owner_id,
    ).toBe(b.a.userId);
    await run(b.a, b.proof, [e.roomId], (s) => store.leave(s, e.roomId));
    expect(
      (
        await pool.query("SELECT status FROM public.rooms WHERE id=$1", [
          e.roomId,
        ])
      ).rows[0].status,
    ).toBe("CLOSED");
    expect(
      (await pool.query("SELECT count(*)::int AS n FROM public.active_players"))
        .rows[0].n,
    ).toBe(0);
    expect(
      (
        await pool.query(
          "SELECT count(*)::int AS n FROM xiangqi_room.outbox WHERE type='media.revoke-room'",
        )
      ).rows[0].n,
    ).toBe(1);
  });

  it("rejects reconnect at sixty seconds and commits seat release without a loss", async () => {
    const h = await admitted(),
      e = await run(h.a, h.proof, [], (s) =>
        store.create(s, { commandId: randomUUID(), name: "Late" }),
      );
    const proof = {
      connectionId: "host",
      generation: 1,
      serverInstance: randomUUID(),
    };
    await run(h.a, h.proof, [e.roomId], (s) =>
      store.presence(s, e.roomId, proof, true),
    );
    await run(h.a, h.proof, [e.roomId], (s) =>
      store.presence(s, e.roomId, proof, false),
    );
    await pool.query(
      "UPDATE public.room_members SET disconnected_at=clock_timestamp()-interval '60 seconds' WHERE room_id=$1",
      [e.roomId],
    );
    expect(
      await run(h.a, h.proof, [e.roomId], (s) =>
        store.presence(s, e.roomId, proof, true),
      ),
    ).toBe("seat-expired");
    expect(
      (
        await pool.query("SELECT status FROM public.rooms WHERE id=$1", [
          e.roomId,
        ])
      ).rows[0].status,
    ).toBe("CLOSED");
    expect(
      (await pool.query("SELECT count(*)::int AS n FROM public.matches"))
        .rows[0].n,
    ).toBe(0);
  });
  it("requires roster lock retry and rolls back creation if receipt insertion fails", async () => {
    const h = await admitted(),
      b = await admitted(),
      e = await run(h.a, h.proof, [], (s) =>
        store.create(s, { commandId: randomUUID(), name: "Roster" }),
      );
    await expect(
      transaction([b.a.userId], [e.roomId], (client) =>
        store.join(
          {
            client,
            actor: b.a,
            lockedActorIds: new Set([b.a.userId]),
            lockedRoomIds: new Set([e.roomId]),
          },
          { commandId: randomUUID(), roomId: e.roomId, intent: "auto" },
        ),
      ),
    ).rejects.toMatchObject({ code: "ROOM_ROSTER_CHANGED" });
    await pool.query(
      "CREATE FUNCTION xiangqi_room.test_fail() RETURNS trigger LANGUAGE plpgsql AS $$BEGIN RAISE EXCEPTION 'synthetic failure'; END$$; CREATE TRIGGER test_fail BEFORE INSERT ON xiangqi_room.entry_receipts FOR EACH ROW EXECUTE FUNCTION xiangqi_room.test_fail()",
    );
    await expect(
      run(b.a, b.proof, [], (s) =>
        store.create(s, { commandId: randomUUID(), name: "Rollback" }),
      ),
    ).rejects.toThrow("synthetic failure");
    expect(
      (await pool.query("SELECT count(*)::int AS n FROM public.rooms")).rows[0]
        .n,
    ).toBe(1);
    expect(
      (
        await pool.query(
          "SELECT 1 FROM public.active_players WHERE user_id=$1",
          [b.a.userId],
        )
      ).rowCount,
    ).toBe(0);
  });
  it("atomically starts one synthetic SQL match and retries a rolled-back factory failure", async () => {
    const h = await admitted(),
      b = await admitted(),
      e = await run(h.a, h.proof, [], (s) =>
        store.create(s, {
          commandId: randomUUID(),
          name: "Actual SQL fixture",
        }),
      );
    await run(b.a, b.proof, [e.roomId], (s) =>
      store.join(s, {
        commandId: randomUUID(),
        roomId: e.roomId,
        intent: "auto",
      }),
    );
    for (const p of [h, b]) {
      await run(p.a, p.proof, [e.roomId], (s) =>
        store.presence(
          s,
          e.roomId,
          {
            connectionId: p.a.userId,
            generation: 1,
            serverInstance: randomUUID(),
          },
          true,
        ),
      );
      await run(p.a, p.proof, [e.roomId], (s) =>
        store.ready(s, e.roomId, true),
      );
    }
    await pool.query(
      "UPDATE xiangqi_room.countdowns SET due_at=clock_timestamp()-interval '1ms'",
    );
    const port = {
      async start(
        client: import("pg").PoolClient,
        input: import("./contracts.js").MatchStartInput,
      ) {
        const matchId = randomUUID();
        await client.query(
          "INSERT INTO public.matches(id,room_id,mode,red_user_id,black_user_id,position,time_control,clock) VALUES($1,$2,'ONLINE',$3,$4,$5,$6,$7)",
          [
            matchId,
            input.roomId,
            input.redId,
            input.blackId,
            { board: Array(90).fill(null), turn: "RED" },
            input.timeControlSeconds,
            {
              redMs: input.timeControlSeconds * 1000,
              blackMs: input.timeControlSeconds * 1000,
              runningSinceEpochMs: input.startedAt.getTime(),
            },
          ],
        );
        return { matchId };
      },
    };
    const broken = new RoomStore({
      async start(c, i) {
        await port.start(c, i);
        throw new Error("synthetic factory failure");
      },
    });
    await expect(
      run(h.a, h.proof, [e.roomId], (s) => broken.startDue(s, e.roomId)),
    ).rejects.toThrow("synthetic factory failure");
    expect(
      (await pool.query("SELECT count(*)::int AS n FROM public.matches"))
        .rows[0].n,
    ).toBe(0);
    expect(
      (
        await pool.query(
          "SELECT count(*)::int AS n FROM xiangqi_room.countdowns",
        )
      ).rows[0].n,
    ).toBe(1);
    const actual = new RoomStore(port);
    await Promise.all([
      run(h.a, h.proof, [e.roomId], (s) => actual.startDue(s, e.roomId)),
      run(b.a, b.proof, [e.roomId], (s) => actual.startDue(s, e.roomId)),
    ]);
    expect(
      (await pool.query("SELECT count(*)::int AS n FROM public.matches"))
        .rows[0].n,
    ).toBe(1);
    expect(
      (
        await pool.query("SELECT status FROM public.rooms WHERE id=$1", [
          e.roomId,
        ])
      ).rows[0].status,
    ).toBe("PLAYING");
    await pool.query(
      "UPDATE public.room_members SET disconnected_at=clock_timestamp()-interval '60 seconds' WHERE room_id=$1 AND user_id=$2",
      [e.roomId, h.a.userId],
    );
    await expect(
      run(h.a, h.proof, [e.roomId], (scope) =>
        store.presence(
          scope,
          e.roomId,
          {
            connectionId: h.a.userId,
            generation: 2,
            serverInstance: randomUUID(),
          },
          true,
        ),
      ),
    ).rejects.toMatchObject({ code: "MATCH_LIFECYCLE_UNAVAILABLE" });
    expect(
      (
        await pool.query(
          "SELECT count(*)::int AS n FROM public.active_players WHERE room_id=$1",
          [e.roomId],
        )
      ).rows[0].n,
    ).toBe(2);
    const matchId = (await pool.query("SELECT id FROM public.matches LIMIT 1"))
      .rows[0].id as string;
    await pool.query(
      'UPDATE public.matches SET status=\'FINISHED\',ended_at=clock_timestamp(),outcome=\'{"reason":"RESIGN","winner":"RED"}\' WHERE id=$1',
      [matchId],
    );
    await run(h.a, h.proof, [e.roomId], (scope) =>
      actual.onMatchEnded(scope, { roomId: e.roomId, matchId }),
    );
    expect(
      (
        await pool.query(
          "SELECT status,current_match_id FROM public.rooms WHERE id=$1",
          [e.roomId],
        )
      ).rows[0],
    ).toEqual({ status: "WAITING", current_match_id: null });
    expect(
      (
        await pool.query(
          "SELECT match_id FROM public.active_players WHERE room_id=$1",
          [e.roomId],
        )
      ).rows.every((a) => a.match_id === null),
    ).toBe(true);
  });
  it("recovers waiting countdown safely after backend restart and retains grace seat", async () => {
    const h = await admitted(),
      e = await run(h.a, h.proof, [], (s) =>
        store.create(s, { commandId: randomUUID(), name: "Restart" }),
      );
    await run(h.a, h.proof, [e.roomId], (s) =>
      store.presence(
        s,
        e.roomId,
        { connectionId: "old", generation: 1, serverInstance: randomUUID() },
        true,
      ),
    );
    await run(h.a, h.proof, [e.roomId], (s) => store.ready(s, e.roomId, true));
    await run(h.a, h.proof, [e.roomId], (s) =>
      store.recoverWaiting(s, e.roomId, randomUUID()),
    );
    await run(h.a, h.proof, [e.roomId], (s) =>
      store.expireDisconnected(s, e.roomId),
    );
    expect(
      (
        await pool.query(
          "SELECT ready,disconnected_at FROM public.room_members WHERE room_id=$1",
          [e.roomId],
        )
      ).rows[0],
    ).toMatchObject({ ready: false, disconnected_at: expect.any(Date) });
    expect(
      (
        await pool.query("SELECT status FROM public.rooms WHERE id=$1", [
          e.roomId,
        ])
      ).rows[0].status,
    ).toBe("WAITING");
  });

  it("rechecks both player session grants before starting due countdown", async () => {
    const h = await admitted(),
      b = await admitted(),
      e = await run(h.a, h.proof, [], (s) =>
        store.create(s, { commandId: randomUUID(), name: "Expired proof" }),
      );
    await run(b.a, b.proof, [e.roomId], (s) =>
      store.join(s, {
        commandId: randomUUID(),
        roomId: e.roomId,
        intent: "auto",
      }),
    );
    for (const p of [h, b]) {
      await run(p.a, p.proof, [e.roomId], (s) =>
        store.presence(
          s,
          e.roomId,
          {
            connectionId: p.a.userId,
            generation: 1,
            serverInstance: randomUUID(),
          },
          true,
        ),
      );
      await run(p.a, p.proof, [e.roomId], (s) =>
        store.ready(s, e.roomId, true),
      );
    }
    await pool.query(
      "UPDATE xiangqi_room.countdowns SET due_at=clock_timestamp()-interval '1ms'",
    );
    capabilities.delete(b.a.userId);
    const never = new RoomStore({
      async start() {
        throw new Error("must not start for revoked session");
      },
    });
    await run(h.a, h.proof, [e.roomId], (s) => never.startDue(s, e.roomId));
    expect(
      (
        await pool.query(
          "SELECT count(*)::int AS n FROM xiangqi_room.countdowns",
        )
      ).rows[0].n,
    ).toBe(0);
    expect(
      (
        await pool.query(
          "SELECT ready FROM public.room_members WHERE room_id=$1",
          [e.roomId],
        )
      ).rows.every((m) => !m.ready),
    ).toBe(true);
  });
  it("retries durable outbox publication without changing the committed room", async () => {
    const h = await admitted(),
      e = await run(h.a, h.proof, [], (s) =>
        store.create(s, { commandId: randomUUID(), name: "Outbox" }),
      );
    let unavailable = true;
    const worker = new RoomWorker(
      store,
      {
        async dueRooms() {
          return [];
        },
        async withRoom() {
          throw new Error("not due");
        },
        async pendingEvents() {
          return transaction([], [], (c) => store.pendingEvents(c));
        },
        async markDelivered(id) {
          await transaction([], [], (c) => store.markDelivered(c, id));
        },
        async markFailed(id) {
          await transaction([], [], (c) => store.markFailed(c, id));
        },
      },
      {
        async deliver(event) {
          expect(event.payload).not.toHaveProperty("displayName");
          if (unavailable) throw new Error("synthetic network failure");
        },
      },
    );
    await worker.tick();
    expect(
      (
        await pool.query(
          "SELECT attempts,delivered_at FROM xiangqi_room.outbox",
        )
      ).rows[0],
    ).toEqual({ attempts: 1, delivered_at: null });
    unavailable = false;
    await pool.query(
      "UPDATE xiangqi_room.outbox SET next_attempt_at=clock_timestamp()-interval '1ms'",
    );
    await worker.tick();
    expect(
      (await pool.query("SELECT delivered_at FROM xiangqi_room.outbox")).rows[0]
        .delivered_at,
    ).toBeInstanceOf(Date);
    expect(
      (
        await pool.query("SELECT status FROM public.rooms WHERE id=$1", [
          e.roomId,
        ])
      ).rows[0].status,
    ).toBe("WAITING");
  });
  it("commits final disconnected-seat expiry when the worker processes its due room", async () => {
    const h = await admitted(),
      e = await run(h.a, h.proof, [], (scope) =>
        store.create(scope, { commandId: randomUUID(), name: "Due close" }),
      );
    await pool.query(
      "UPDATE public.room_members SET disconnected_at=clock_timestamp()-interval '60 seconds' WHERE room_id=$1",
      [e.roomId],
    );
    const worker = new RoomWorker(
      store,
      {
        async dueRooms() {
          return transaction([], [], (c) => store.dueRooms(c));
        },
        async withRoom(id, work) {
          await run(h.a, h.proof, [id], work);
        },
        async pendingEvents() {
          return [];
        },
        async markDelivered() {},
        async markFailed() {},
      },
      { async deliver() {} },
    );
    await worker.tick();
    expect(
      (
        await pool.query("SELECT status FROM public.rooms WHERE id=$1", [
          e.roomId,
        ])
      ).rows[0].status,
    ).toBe("CLOSED");
  });
  it("reports an AI reservation as a seat and fails closed until full guest cleanup is integrated", async () => {
    const a = await actor(),
      matchId = randomUUID();
    await pool.query(
      "INSERT INTO public.matches(id,mode,red_user_id,ai_side,ai_level,position) VALUES($1,'AI',$2,'BLACK','EASY',$3)",
      [matchId, a.userId, { board: Array(90).fill(null), turn: "RED" }],
    );
    await pool.query(
      "INSERT INTO public.active_players(user_id,match_id) VALUES($1,$2)",
      [a.userId, matchId],
    );
    const port = new RoomGuestPort();
    await transaction([a.userId], [], async (client) => {
      expect(await port.seatedSeat(client, a.userId)).toEqual({
        kind: "ai",
        matchId,
      });
      await expect(
        port.end(client, a.userId, {
          reason: "expiry",
          confirmedResign: false,
        }),
      ).rejects.toMatchObject({ code: "GUEST_UNAVAILABLE" });
    });
    expect(
      (await pool.query("SELECT count(*)::int AS n FROM public.active_players"))
        .rows[0].n,
    ).toBe(1);
  });
  it("integrates fixed12h guest deferral and finishes actual seat release on the same client", async () => {
    let now = new Date("2026-10-11T00:00:00Z");
    // Synthetic fixture has no match/media/personal snapshots. Production termination port is required separately.
    const port = new RoomGuestPort(async (c, id) => {
      expect(
        (
          await c.query(
            "SELECT 1 FROM public.active_players WHERE user_id=$1",
            [id],
          )
        ).rowCount,
      ).toBe(0);
      await c.query("DELETE FROM public.chat_messages WHERE sender_id=$1", [
        id,
      ]);
    });
    const guests = new GuestService(pool, port, () => now);
    const session = await guests.create("Tên tạm");
    const guest = await guests.requireActive(session.capability),
      e = await guests.withActor(
        session.capability,
        "new-room",
        undefined,
        async (client, a) =>
          store.create(
            {
              client,
              actor: a,
              lockedActorIds: new Set([a.userId]),
              lockedRoomIds: new Set(),
            },
            { commandId: randomUUID(), name: "Guest room" },
          ),
      );
    now = new Date(now.getTime() + 12 * 3600000);
    await expect(
      guests.requireActive(session.capability, "new-room"),
    ).rejects.toMatchObject({ code: "GUEST_DEFERRED" });
    expect(
      await guests.requireActive(session.capability, "existing-room", e.roomId),
    ).toMatchObject({ deferred: true });
    await guests.withActor(
      session.capability,
      "existing-room",
      e.roomId,
      async (client, a) => {
        await client.query(
          "SELECT pg_advisory_xact_lock(hashtextextended($1,0))",
          ["room:" + e.roomId],
        );
        await store.leave(
          {
            client,
            actor: a,
            lockedActorIds: new Set([a.userId]),
            lockedRoomIds: new Set([e.roomId]),
          },
          e.roomId,
        );
      },
    );
    expect(
      (
        await pool.query(
          "SELECT display_name FROM public.profiles WHERE user_id=$1",
          [guest.userId],
        )
      ).rows[0].display_name,
    ).toBe("Khách");
    expect(
      (
        await pool.query(
          "SELECT 1 FROM xiangqi_auth.guest_sessions WHERE guest_id=$1",
          [guest.userId],
        )
      ).rowCount,
    ).toBe(0);
  });
  it("resolves a code for authenticated admission and denies outsider private snapshots", async () => {
    const h = await admitted(),
      outsider = await admitted(),
      e = await run(h.a, h.proof, [], (scope) =>
        store.create(scope, { commandId: randomUUID(), name: "Private" }),
      );
    await transaction([outsider.a.userId], [], async (c) =>
      expect(await store.resolveCode(c, e.inviteCode!)).toBe(e.roomId),
    );
    await expect(
      run(outsider.a, outsider.proof, [e.roomId], (scope) =>
        store.snapshot(scope, e.roomId),
      ),
    ).rejects.toMatchObject({ code: "ROOM_FORBIDDEN" });
  });
  it("starts a sixty-second reservation grace before the first controlling socket arrives", async () => {
    const h = await admitted(),
      e = await run(h.a, h.proof, [], (scope) =>
        store.create(scope, {
          commandId: randomUUID(),
          name: "Never connected",
        }),
      );
    expect(
      (
        await pool.query(
          "SELECT disconnected_at FROM public.room_members WHERE room_id=$1",
          [e.roomId],
        )
      ).rows[0].disconnected_at,
    ).toBeInstanceOf(Date);
    await pool.query(
      "UPDATE public.room_members SET disconnected_at=clock_timestamp()-interval '60 seconds' WHERE room_id=$1",
      [e.roomId],
    );
    await run(h.a, h.proof, [e.roomId], (scope) =>
      store.expireDisconnected(scope, e.roomId),
    );
    expect(
      (
        await pool.query("SELECT status FROM public.rooms WHERE id=$1", [
          e.roomId,
        ])
      ).rows[0].status,
    ).toBe("CLOSED");
  });
});

describe.skipIf(!databaseUrl)("room schema", () => {
  beforeEach(reset);
  it("preserves legacy values and reverses exact settings metadata without writes", async () => {
    const a = await actor(),
      id = randomUUID();
    await pool.query(
      "INSERT INTO public.rooms(id,owner_id,name) VALUES($1,$2,'Legacy')",
      [id, a.userId],
    );
    const before = (
      await pool.query(
        "SELECT column_name,column_default FROM information_schema.columns WHERE table_schema='public' AND table_name='rooms' ORDER BY ordinal_position",
      )
    ).rows;
    await apply(migration);
    expect(
      (
        await pool.query(
          "SELECT visibility,time_control,invite_code,viewer_limit FROM public.rooms WHERE id=$1",
          [id],
        )
      ).rows[0],
    ).toEqual({
      visibility: "PUBLIC",
      time_control: 0,
      invite_code: null,
      viewer_limit: null,
    });
    await apply(rollback);
    expect(
      (
        await pool.query(
          "SELECT column_name,column_default FROM information_schema.columns WHERE table_schema='public' AND table_name='rooms' ORDER BY ordinal_position",
        )
      ).rows,
    ).toEqual(before);
  });
  it("requires existing legacy seat reservations rather than repairing rows", async () => {
    const a = await actor(),
      id = randomUUID();
    await pool.query(
      "INSERT INTO public.rooms(id,owner_id,name) VALUES($1,$2,'Legacy')",
      [id, a.userId],
    );
    await pool.query(
      "INSERT INTO public.room_members(room_id,user_id,role,side) VALUES($1,$2,'PLAYER','RED')",
      [id, a.userId],
    );
    await expect(apply(migration)).rejects.toThrow(/reservation/);
    expect(
      (await pool.query("SELECT to_regnamespace('xiangqi_room') AS schema"))
        .rows[0].schema,
    ).toBeNull();
  });
  it("denies browser rights and blocks managed seat bypass and immutable configuration", async () => {
    await apply(migration);
    const a = await actor(),
      id = randomUUID();
    await pool.query(
      "INSERT INTO public.rooms(id,owner_id,name,invite_code,viewer_limit,time_control) VALUES($1,$2,'New','ABCDEFGH',5,600)",
      [id, a.userId],
    );
    await expect(
      pool.query("UPDATE public.rooms SET time_control=300 WHERE id=$1", [id]),
    ).rejects.toThrow(/immutable/);
    await expect(
      pool.query(
        "INSERT INTO public.room_members(room_id,user_id,role,side) VALUES($1,$2,'PLAYER','RED')",
        [id, a.userId],
      ),
    ).rejects.toThrow(/reservation/);
    for (const role of ["anon", "authenticated"]) {
      expect(
        (
          await pool.query(
            "SELECT has_schema_privilege($1,'xiangqi_room','USAGE') AS access",
            [role],
          )
        ).rows[0].access,
      ).toBe(false);
    }
    await expect(apply(rollback)).rejects.toThrow(/writes/);
  });
  it("refuses rollback after an unknown privilege change", async () => {
    await apply(migration);
    await pool.query("GRANT SELECT ON xiangqi_room.outbox TO anon");
    await expect(apply(rollback)).rejects.toThrow(/metadata/);
  });
  it("rejects moving reservation to a second room while original seat still exists", async () => {
    await apply(migration);
    const a = await actor(),
      one = randomUUID(),
      two = randomUUID();
    await pool.query(
      "INSERT INTO public.rooms(id,owner_id,name,invite_code,time_control,viewer_limit) VALUES($1,$3,'One','ABCDEFGH',600,5),($2,$3,'Two','ABCDEFGJ',600,5)",
      [one, two, a.userId],
    );
    await transaction([a.userId], [one], async (c) => {
      await c.query(
        "INSERT INTO public.active_players(user_id,room_id) VALUES($1,$2)",
        [a.userId, one],
      );
      await c.query(
        "INSERT INTO public.room_members(room_id,user_id,role,side) VALUES($1,$2,'PLAYER','RED')",
        [one, a.userId],
      );
    });
    await expect(
      transaction([a.userId], [one, two], async (c) => {
        await c.query(
          "UPDATE public.active_players SET room_id=$2 WHERE user_id=$1",
          [a.userId, two],
        );
        await c.query(
          "INSERT INTO public.room_members(room_id,user_id,role,side) VALUES($1,$2,'PLAYER','RED')",
          [two, a.userId],
        );
      }),
    ).rejects.toThrow(/reservation/);
  });
  it("refuses rollback when a guard function was modified", async () => {
    await apply(migration);
    await pool.query(
      "CREATE OR REPLACE FUNCTION xiangqi_room.guard_settings() RETURNS trigger LANGUAGE plpgsql AS $$BEGIN RETURN NEW; END$$",
    );
    await expect(apply(rollback)).rejects.toThrow(/metadata/);
  });
  it("refuses rollback after a guard trigger was disabled", async () => {
    await apply(migration);
    await pool.query(
      "ALTER TABLE public.rooms DISABLE TRIGGER room_settings_guard",
    );
    await expect(apply(rollback)).rejects.toThrow(/metadata/);
  });
});
