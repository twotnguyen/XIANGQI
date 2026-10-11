import { randomUUID } from "node:crypto";
import { initialPosition } from "@xiangqi/xiangqi-core";
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
import type { PresenceProof, RoomActor, RoomScope } from "./contracts.js";
const store = new RoomStore();
afterAll(() => pool.end());
async function run<T>(
  a: RoomActor,
  id: string | null,
  work: (scope: RoomScope) => Promise<T>,
) {
  const ids = [
    ...new Set([
      a.userId,
      ...(id
        ? (
            await pool.query(
              "SELECT user_id FROM public.room_members WHERE room_id=$1",
              [id],
            )
          ).rows.map((r) => r.user_id as string)
        : []),
    ]),
  ];
  return transaction(ids, id ? [id] : [], (client) =>
    work({
      client,
      actor: a,
      lockedActorIds: new Set(ids),
      lockedRoomIds: new Set(id ? [id] : []),
    }),
  );
}
function proof(generation = 1): PresenceProof {
  return {
    connectionId: randomUUID(),
    generation,
    serverInstance: randomUUID(),
  };
}
async function fixture() {
  const host = await actor(),
    opponent = await actor(),
    viewer = await actor();
  const entry = await run(host, null, (s) =>
    store.create(s, { commandId: randomUUID(), name: "Viewer Fixture" }),
  );
  await run(opponent, entry.roomId, (s) =>
    store.join(s, {
      commandId: randomUUID(),
      roomId: entry.roomId,
      intent: "play",
    }),
  );
  const commandId = randomUUID();
  await run(viewer, entry.roomId, (s) =>
    store.join(s, { commandId, roomId: entry.roomId, intent: "watch" }),
  );
  const p = proof();
  await run(viewer, entry.roomId, (s) =>
    store.presence(s, entry.roomId, p, true),
  );
  return { host, opponent, viewer, id: entry.roomId, p, commandId };
}
async function age(id: string, userId: string, seconds: number) {
  await pool.query(
    "UPDATE public.room_members SET disconnected_at=clock_timestamp()-make_interval(secs=>$3) WHERE room_id=$1 AND user_id=$2",
    [id, userId, seconds],
  );
}
async function countdown(
  f: Awaited<ReturnType<typeof fixture>>,
  instance = randomUUID(),
) {
  for (const a of [f.host, f.opponent])
    await run(a, f.id, (s) =>
      store.presence(s, f.id, { ...proof(), serverInstance: instance }, true),
    );
  await pool.query(
    "UPDATE public.room_members SET ready=true WHERE room_id=$1 AND role='PLAYER'",
    [f.id],
  );
  await pool.query(
    "INSERT INTO xiangqi_room.countdowns(room_id,token,due_at,red_id,black_id) VALUES($1,$2,clock_timestamp()+interval '1 hour',$3,$4)",
    [f.id, randomUUID(), f.host.userId, f.opponent.userId],
  );
  return instance;
}
describe.skipIf(!databaseUrl)("spectator grace on synthetic PostgreSQL", () => {
  beforeEach(async () => {
    await reset();
    await apply("supabase/migrations/20261011000006_rooms.sql");
    await apply("supabase/migrations/20261011000008_room_modes.sql");
  });
  it("records physical spectator presence and fences lower generation and old disconnects", async () => {
    const f = await fixture();
    expect(
      (
        await pool.query(
          "SELECT generation,connection_id,connected FROM xiangqi_room.presence WHERE room_id=$1 AND user_id=$2",
          [f.id, f.viewer.userId],
        )
      ).rows[0],
    ).toEqual({
      generation: "1",
      connection_id: f.p.connectionId,
      connected: true,
    });
    const current = proof(2);
    await run(f.viewer, f.id, (s) => store.presence(s, f.id, current, true));
    await run(f.viewer, f.id, (s) => store.presence(s, f.id, f.p, false));
    await run(f.viewer, f.id, (s) => store.presence(s, f.id, f.p, true));
    expect(
      (
        await pool.query(
          "SELECT connection_id,connected FROM xiangqi_room.presence WHERE room_id=$1 AND user_id=$2",
          [f.id, f.viewer.userId],
        )
      ).rows[0],
    ).toEqual({ connection_id: current.connectionId, connected: true });
    expect(
      (
        await pool.query(
          "SELECT disconnected_at FROM public.room_members WHERE room_id=$1 AND user_id=$2",
          [f.id, f.viewer.userId],
        )
      ).rows[0].disconnected_at,
    ).toBeNull();
  });
  it("does not let a different connection or server replace the same generation", async () => {
    const f = await fixture();
    await run(f.viewer, f.id, (s) => store.presence(s, f.id, proof(1), true));
    expect(
      (
        await pool.query(
          "SELECT connection_id FROM xiangqi_room.presence WHERE room_id=$1 AND user_id=$2",
          [f.id, f.viewer.userId],
        )
      ).rows[0].connection_id,
    ).toBe(f.p.connectionId);
  });
  it("resumes a reserved LOCKED viewer before five minutes without cancelling countdown", async () => {
    const f = await fixture();
    await countdown(f);
    const view = await run(f.host, f.id, (s) => store.snapshot(s, f.id));
    await run(f.host, f.id, (s) =>
      store.changeVisibility(s, f.id, view.version, "LOCKED"),
    );
    await run(f.viewer, f.id, (s) => store.presence(s, f.id, f.p, false));
    await age(f.id, f.viewer.userId, 299);
    expect(
      await run(f.viewer, f.id, (s) =>
        store.join(s, {
          commandId: randomUUID(),
          roomId: f.id,
          intent: "watch",
        }),
      ),
    ).toMatchObject({ role: "spectator" });
    await run(f.viewer, f.id, (s) => store.presence(s, f.id, proof(2), true));
    expect(
      (
        await pool.query(
          "SELECT disconnected_at FROM public.room_members WHERE room_id=$1 AND user_id=$2",
          [f.id, f.viewer.userId],
        )
      ).rows[0].disconnected_at,
    ).toBeNull();
    expect(
      (
        await pool.query(
          "SELECT count(*)::int n FROM xiangqi_room.countdowns WHERE room_id=$1",
          [f.id],
        )
      ).rows[0].n,
    ).toBe(1);
    expect(
      (await run(f.host, f.id, (s) => store.snapshot(s, f.id))).room.ready,
    ).toEqual({ red: true, black: true });
  });
  it("rejects expired viewer snapshot, fresh join and old receipt replay at the SQL deadline", async () => {
    const f = await fixture();
    const view = await run(f.host, f.id, (s) => store.snapshot(s, f.id));
    await run(f.host, f.id, (s) =>
      store.changeVisibility(s, f.id, view.version, "LOCKED"),
    );
    await age(f.id, f.viewer.userId, 300);
    await expect(
      run(f.viewer, f.id, (s) => store.snapshot(s, f.id)),
    ).rejects.toMatchObject({ code: "ROOM_FORBIDDEN" });
    for (const commandId of [randomUUID(), f.commandId])
      await expect(
        run(f.viewer, f.id, (s) =>
          store.join(s, { commandId, roomId: f.id, intent: "watch" }),
        ),
      ).rejects.toMatchObject({ status: 403 });
  });
  it("commits removal on reconnect at deadline and leaves LOCKED admission closed", async () => {
    const f = await fixture();
    await age(f.id, f.viewer.userId, 300);
    const view = await run(f.host, f.id, (s) => store.snapshot(s, f.id));
    await run(f.host, f.id, (s) =>
      store.changeVisibility(s, f.id, view.version, "LOCKED"),
    );
    expect(
      await run(f.viewer, f.id, (s) => store.presence(s, f.id, proof(2), true)),
    ).toBe("viewer-expired");
    expect(
      (
        await pool.query(
          "SELECT count(*)::int n FROM public.room_members WHERE room_id=$1 AND user_id=$2",
          [f.id, f.viewer.userId],
        )
      ).rows[0].n,
    ).toBe(0);
    await expect(
      run(f.viewer, f.id, (s) =>
        store.join(s, {
          commandId: randomUUID(),
          roomId: f.id,
          intent: "watch",
        }),
      ),
    ).rejects.toMatchObject({ code: "ROOM_LOCKED" });
  });
  it("expires viewers in PLAYING while leaving disconnected players and actual match untouched", async () => {
    const f = await fixture(),
      matchId = randomUUID();
    await pool.query(
      "INSERT INTO public.matches(id,room_id,mode,red_user_id,black_user_id,position) VALUES($1,$2,'ONLINE',$3,$4,$5)",
      [
        matchId,
        f.id,
        f.host.userId,
        f.opponent.userId,
        JSON.stringify({ board: initialPosition().board, turn: "RED" }),
      ],
    );
    await pool.query(
      "UPDATE public.rooms SET status='PLAYING',current_match_id=$2 WHERE id=$1",
      [f.id, matchId],
    );
    await age(f.id, f.host.userId, 61);
    await age(f.id, f.viewer.userId, 300);
    expect(await run(f.host, f.id, (s) => store.dueRooms(s.client))).toContain(
      f.id,
    );
    const match = (
      await pool.query("SELECT * FROM public.matches WHERE id=$1", [matchId])
    ).rows[0];
    expect(
      await run(f.host, f.id, (s) => store.expireDisconnected(s, f.id)),
    ).toBe(false);
    expect(
      (
        await pool.query(
          "SELECT user_id FROM public.room_members WHERE room_id=$1 ORDER BY user_id",
          [f.id],
        )
      ).rows.map((r) => r.user_id),
    ).toEqual([f.host.userId, f.opponent.userId].sort());
    expect(
      (await pool.query("SELECT * FROM public.matches WHERE id=$1", [matchId]))
        .rows[0],
    ).toEqual(match);
    expect(
      (
        await pool.query(
          "SELECT status,current_match_id FROM public.rooms WHERE id=$1",
          [f.id],
        )
      ).rows[0],
    ).toEqual({ status: "PLAYING", current_match_id: matchId });
  });
  it("does not reset viewer grace on duplicate disconnect and keeps countdown on worker expiry", async () => {
    const f = await fixture();
    await countdown(f);
    await run(f.viewer, f.id, (s) => store.presence(s, f.id, f.p, false));
    await age(f.id, f.viewer.userId, 300);
    const before = (
      await pool.query(
        "SELECT disconnected_at FROM public.room_members WHERE room_id=$1 AND user_id=$2",
        [f.id, f.viewer.userId],
      )
    ).rows[0].disconnected_at;
    await run(f.viewer, f.id, (s) => store.presence(s, f.id, f.p, false));
    expect(
      (
        await pool.query(
          "SELECT disconnected_at FROM public.room_members WHERE room_id=$1 AND user_id=$2",
          [f.id, f.viewer.userId],
        )
      ).rows[0].disconnected_at,
    ).toEqual(before);
    await run(f.host, f.id, (s) => store.expireDisconnected(s, f.id));
    expect(
      (
        await pool.query(
          "SELECT count(*)::int n FROM xiangqi_room.countdowns WHERE room_id=$1",
          [f.id],
        )
      ).rows[0].n,
    ).toBe(1);
    expect(
      (
        await pool.query(
          "SELECT payload,type FROM xiangqi_room.outbox WHERE room_id=$1 ORDER BY room_version DESC LIMIT 1",
          [f.id],
        )
      ).rows[0].type,
    ).toBe("room.members-changed");
    expect(
      (
        await pool.query(
          "SELECT count(*)::int n FROM xiangqi_room.presence WHERE room_id=$1 AND user_id=$2",
          [f.id, f.viewer.userId],
        )
      ).rows[0].n,
    ).toBe(0);
  });
  it("recovers old-instance viewer presence without resetting timer or cancelling a current-player countdown", async () => {
    const f = await fixture(),
      instance = await countdown(f);
    await run(f.host, f.id, (s) => store.recoverWaiting(s, f.id, instance));
    const before = (
      await pool.query(
        "SELECT disconnected_at FROM public.room_members WHERE room_id=$1 AND user_id=$2",
        [f.id, f.viewer.userId],
      )
    ).rows[0].disconnected_at;
    expect(before).toBeInstanceOf(Date);
    await run(f.host, f.id, (s) => store.recoverWaiting(s, f.id, instance));
    expect(
      (
        await pool.query(
          "SELECT disconnected_at FROM public.room_members WHERE room_id=$1 AND user_id=$2",
          [f.id, f.viewer.userId],
        )
      ).rows[0].disconnected_at,
    ).toEqual(before);
    expect(
      (
        await pool.query(
          "SELECT count(*)::int n FROM xiangqi_room.countdowns WHERE room_id=$1",
          [f.id],
        )
      ).rows[0].n,
    ).toBe(1);
  });
  it("holds a viewer beyond sixty seconds while the waiting player loses their seat", async () => {
    const f = await fixture();
    await age(f.id, f.host.userId, 61);
    await age(f.id, f.viewer.userId, 61);
    await run(f.opponent, f.id, (s) => store.expireDisconnected(s, f.id));
    expect(
      (
        await pool.query(
          "SELECT user_id,role FROM public.room_members WHERE room_id=$1 ORDER BY user_id",
          [f.id],
        )
      ).rows,
    ).toEqual(
      [
        { user_id: f.opponent.userId, role: "PLAYER" },
        { user_id: f.viewer.userId, role: "SPECTATOR" },
      ].sort((a, b) => a.user_id.localeCompare(b.user_id)),
    );
  });
  it("admits an expired viewer as a new member after worker removal in an open room", async () => {
    const f = await fixture();
    await age(f.id, f.viewer.userId, 300);
    await run(f.host, f.id, (s) => store.expireDisconnected(s, f.id));
    expect(
      await run(f.viewer, f.id, (s) =>
        store.join(s, {
          commandId: randomUUID(),
          roomId: f.id,
          intent: "watch",
        }),
      ),
    ).toMatchObject({ role: "spectator" });
    await run(f.viewer, f.id, (s) => store.presence(s, f.id, proof(), true));
    expect(
      (await run(f.viewer, f.id, (s) => store.snapshot(s, f.id))).role,
    ).toBe("spectator");
  });
  it("requires the expiring viewer actor lock and rolls the cleanup transaction back", async () => {
    const f = await fixture();
    await age(f.id, f.viewer.userId, 300);
    const ids = [f.host.userId, f.opponent.userId];
    await expect(
      transaction(ids, [f.id], (client) =>
        store.expireDisconnected(
          {
            client,
            actor: f.host,
            lockedActorIds: new Set(ids),
            lockedRoomIds: new Set([f.id]),
          },
          f.id,
        ),
      ),
    ).rejects.toMatchObject({ code: "ROOM_ROSTER_CHANGED" });
    expect(
      (
        await pool.query(
          "SELECT count(*)::int n FROM public.room_members WHERE room_id=$1 AND user_id=$2",
          [f.id, f.viewer.userId],
        )
      ).rows[0].n,
    ).toBe(1);
  });
  it("rejects a zero physical-presence generation without granting viewer control", async () => {
    const f = await fixture();
    await expect(
      run(f.viewer, f.id, (s) => store.presence(s, f.id, proof(0), true)),
    ).rejects.toMatchObject({ code: "ROOM_INPUT_INVALID", status: 400 });
    expect(
      (
        await pool.query(
          "SELECT role,side,ready FROM public.room_members WHERE room_id=$1 AND user_id=$2",
          [f.id, f.viewer.userId],
        )
      ).rows[0],
    ).toEqual({ role: "SPECTATOR", side: null, ready: false });
  });
});
