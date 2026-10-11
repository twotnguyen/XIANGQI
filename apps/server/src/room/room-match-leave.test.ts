import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { ClockService } from "../clock/clock-service.js";
import { MatchStore } from "../match/match-store.js";
import type { MatchScope } from "../match/contracts.js";
import type { MatchStartPort, RoomActor, RoomScope } from "./contracts.js";
import { RoomStore } from "./room-store.js";
import {
  apply,
  databaseUrl,
  pool,
  reset,
  transaction,
} from "./room.test-helper.js";

afterAll(() => pool.end());
async function member(): Promise<RoomActor> {
  const id = randomUUID();
  await pool.query(
    "INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,$2,clock_timestamp())",
    [id, `synthetic-${id}@example.invalid`],
  );
  await pool.query(
    "INSERT INTO public.profiles(user_id,username,display_name,completed_at,registration_pending) VALUES($1,$2,'Synthetic Leave',clock_timestamp(),false)",
    [id, "m" + id.replaceAll("-", "").slice(0, 18)],
  );
  return { userId: id, kind: "member" };
}
type Leave = (
  client: PoolClient,
  input: { roomId: string; matchId: string; actor: RoomActor },
) => Promise<void>;
async function fixture(
  leaveBehavior:
    | "normal"
    | "missing"
    | "fail-after-result"
    | "noop"
    | "room-reset-only"
    | "end-only" = "normal",
) {
  const red = await member(),
    black = await member(),
    viewer = await member(),
    roomId = randomUUID(),
    token = randomUUID();
  const scopes = new WeakMap<PoolClient, RoomScope>();
  const matches = new MatchStore(new ClockService(), {
    onMatchEnded: async (client, input) => {
      if (leaveBehavior === "end-only") return;
      const scope = scopes.get(client);
      if (!scope) throw new Error("Missing held fixture scope");
      await rooms.onMatchEnded(scope, input);
    },
  });
  const leave: Leave = vi.fn(async (client, input) => {
    if (leaveBehavior === "noop") return;
    if (leaveBehavior === "room-reset-only") {
      await client.query(
        "UPDATE public.rooms SET status='WAITING',current_match_id=NULL WHERE id=$1",
        [input.roomId],
      );
      return;
    }
    const scope = scopes.get(client);
    if (
      !scope ||
      scope.actor.userId !== input.actor.userId ||
      scope.actor.kind !== input.actor.kind
    )
      throw new Error("Invalid fixture actor");
    const latest = await matches.snapshot(client, input.roomId, input.matchId);
    const matchScope: MatchScope = {
      ...scope,
      roomId: input.roomId,
      canControl: true,
    };
    await matches.resign(matchScope, {
      matchId: input.matchId,
      matchVersion: latest.version,
    });
    if (leaveBehavior === "fail-after-result")
      throw new Error("synthetic port failure");
  });
  const port: MatchStartPort & { leave?: Leave } = {
    start: (client, input) => matches.start(client, input),
    ...(leaveBehavior !== "missing" ? { leave } : {}),
  };
  const rooms = new RoomStore(port);
  const actorIds = [red.userId, black.userId, viewer.userId];
  async function run<T>(
    actor: RoomActor,
    work: (scope: RoomScope) => Promise<T>,
  ) {
    return transaction(actorIds, [roomId], async (client) => {
      const scope: RoomScope = {
        client,
        actor,
        lockedActorIds: new Set(actorIds),
        lockedRoomIds: new Set([roomId]),
        activeActorIds: new Set(actorIds),
      };
      scopes.set(client, scope);
      try {
        return await work(scope);
      } finally {
        scopes.delete(client);
      }
    });
  }
  const matchId = await run(red, async (scope) => {
    const c = scope.client;
    await c.query(
      "INSERT INTO public.rooms(id,owner_id,name,time_control,invite_code,room_version) VALUES($1,$2,'Synthetic Leave Room',600,$3,1)",
      [
        roomId,
        red.userId,
        roomId
          .replaceAll("-", "")
          .replaceAll("0", "2")
          .replaceAll("1", "3")
          .slice(0, 8)
          .toUpperCase(),
      ],
    );
    await c.query(
      "INSERT INTO public.room_members(room_id,user_id,role,side,ready) VALUES($1,$2,'PLAYER','RED',true),($1,$3,'PLAYER','BLACK',true),($1,$4,'SPECTATOR',NULL,false)",
      [roomId, red.userId, black.userId, viewer.userId],
    );
    await c.query(
      "INSERT INTO public.active_players(user_id,room_id) VALUES($1,$3),($2,$3)",
      [red.userId, black.userId, roomId],
    );
    const at = (await c.query("SELECT clock_timestamp() AS now")).rows[0]
      .now as Date;
    await c.query(
      "INSERT INTO xiangqi_room.countdowns(room_id,token,due_at,red_id,black_id) VALUES($1,$2,$3,$4,$5)",
      [roomId, token, at, red.userId, black.userId],
    );
    const started = await matches.start(c, {
      roomId,
      startToken: token,
      redId: red.userId,
      blackId: black.userId,
      timeControlSeconds: 600,
      startedAt: at,
    });
    await c.query(
      "UPDATE public.rooms SET status='PLAYING',current_match_id=$2 WHERE id=$1",
      [roomId, started.matchId],
    );
    await c.query(
      "UPDATE public.active_players SET match_id=$2 WHERE room_id=$1",
      [roomId, started.matchId],
    );
    await c.query("DELETE FROM xiangqi_room.countdowns WHERE room_id=$1", [
      roomId,
    ]);
    return started.matchId;
  });
  async function read() {
    return {
      match: (
        await pool.query(
          "SELECT status,outcome FROM public.matches WHERE id=$1",
          [matchId],
        )
      ).rows[0],
      room: (
        await pool.query(
          "SELECT status,owner_id,current_match_id FROM public.rooms WHERE id=$1",
          [roomId],
        )
      ).rows[0],
      members: (
        await pool.query(
          "SELECT user_id,role,ready FROM public.room_members WHERE room_id=$1 ORDER BY user_id",
          [roomId],
        )
      ).rows,
      active: (
        await pool.query(
          "SELECT user_id,match_id FROM public.active_players WHERE room_id=$1 ORDER BY user_id",
          [roomId],
        )
      ).rows,
      results: (
        await pool.query(
          "SELECT payload FROM public.match_events WHERE match_id=$1 AND type='RESULT'",
          [matchId],
        )
      ).rows,
      outbox: (
        await pool.query(
          "SELECT payload FROM xiangqi_room.outbox WHERE room_id=$1 AND type='MATCH_RESULT'",
          [roomId],
        )
      ).rows,
    };
  }
  return {
    red,
    black,
    viewer,
    roomId,
    matchId,
    rooms,
    matches,
    leave,
    run,
    read,
  };
}
describe.skipIf(!databaseUrl)(
  "atomic room leave with managed match lifecycle",
  () => {
    beforeEach(async () => {
      await reset();
      for (const migration of [
        "20261011000006_rooms",
        "20261011000007_match_outcomes",
        "20261011000008_room_modes",
        "20261011000009_match_draw",
      ])
        await apply(`supabase/migrations/${migration}.sql`);
    });
    it("leaving an active red Host resigns once, removes only that seat and transfers Host atomically", async () => {
      const f = await fixture();
      await f.run(f.red, (s) => f.rooms.leave(s, f.roomId));
      const state = await f.read();
      expect(state.match).toEqual({
        status: "FINISHED",
        outcome: { reason: "RESIGN", winner: "BLACK" },
      });
      expect(state.room).toEqual({
        status: "WAITING",
        owner_id: f.black.userId,
        current_match_id: null,
      });
      expect(state.members.map((m) => m.user_id)).toEqual(
        expect.arrayContaining([f.black.userId, f.viewer.userId]),
      );
      expect(
        state.members.find((m) => m.user_id === f.red.userId),
      ).toBeUndefined();
      expect(state.members.filter((m) => m.role === "PLAYER")).toEqual([
        { user_id: f.black.userId, role: "PLAYER", ready: false },
      ]);
      expect(state.active).toEqual([
        { user_id: f.black.userId, match_id: null },
      ]);
      expect(state.results).toHaveLength(1);
      expect(state.outbox).toHaveLength(1);
      expect(f.leave).toHaveBeenCalledTimes(1);
      await expect(
        f.run(f.red, (s) => f.rooms.leave(s, f.roomId)),
      ).rejects.toMatchObject({ code: "ROOM_FORBIDDEN" });
      expect((await f.read()).results).toHaveLength(1);
    });
    it("spectator leave keeps both player seats and the active match untouched without invoking resignation", async () => {
      const f = await fixture();
      await f.run(f.viewer, (s) => f.rooms.leave(s, f.roomId));
      const state = await f.read();
      expect(f.leave).not.toHaveBeenCalled();
      expect(state.match).toEqual({ status: "ACTIVE", outcome: null });
      expect(state.room).toEqual({
        status: "PLAYING",
        owner_id: f.red.userId,
        current_match_id: f.matchId,
      });
      expect(state.members).toHaveLength(2);
      expect(state.active).toHaveLength(2);
      expect(state.results).toHaveLength(0);
    });
    it("missing lifecycle stays fail closed and preserves active membership", async () => {
      const f = await fixture("missing");
      const before = await f.read();
      await expect(
        f.run(f.red, (s) => f.rooms.leave(s, f.roomId)),
      ).rejects.toMatchObject({
        code: "MATCH_LIFECYCLE_UNAVAILABLE",
        status: 503,
      });
      expect(await f.read()).toEqual(before);
    });
    it("rolls back a produced result and room reset when the lifecycle callback fails before seat release", async () => {
      const f = await fixture("fail-after-result");
      const before = await f.read();
      await expect(
        f.run(f.red, (s) => f.rooms.leave(s, f.roomId)),
      ).rejects.toThrow("synthetic port failure");
      expect(f.leave).toHaveBeenCalledTimes(1);
      expect(await f.read()).toEqual(before);
    });
    it("refuses seat release when a lifecycle callback returns without ending the match", async () => {
      const f = await fixture("noop");
      const before = await f.read();
      await expect(
        f.run(f.red, (s) => f.rooms.leave(s, f.roomId)),
      ).rejects.toMatchObject({
        code: "MATCH_LIFECYCLE_UNAVAILABLE",
        status: 503,
      });
      expect(f.leave).toHaveBeenCalledTimes(1);
      expect(await f.read()).toEqual(before);
    });
    it.each(["room-reset-only", "end-only"] as const)(
      "refuses release when lifecycle postconditions are incomplete (%s)",
      async (behavior) => {
        const f = await fixture(behavior),
          before = await f.read();
        await expect(
          f.run(f.red, (s) => f.rooms.leave(s, f.roomId)),
        ).rejects.toMatchObject({
          code: "MATCH_LIFECYCLE_UNAVAILABLE",
          status: 503,
        });
        expect(f.leave).toHaveBeenCalledTimes(1);
        expect(await f.read()).toEqual(before);
      },
    );
    it("serializes a concurrent clock timeout and leave into one canonical result and one seat release", async () => {
      const f = await fixture();
      await pool.query(
        "UPDATE public.matches SET clock=jsonb_build_object('redMs',1,'blackMs',600000,'runningSinceEpochMs',floor(extract(epoch FROM clock_timestamp())*1000)::bigint-1000) WHERE id=$1",
        [f.matchId],
      );
      await Promise.all([
        f.run(f.red, (s) => f.rooms.leave(s, f.roomId)),
        f.run(f.black, async (s) => {
          const at = (await s.client.query("SELECT clock_timestamp() AS now"))
            .rows[0].now as Date;
          await f.matches.finish(s.client, {
            roomId: f.roomId,
            matchId: f.matchId,
            outcome: { reason: "TIMEOUT", winner: "black" },
            at,
          });
        }),
      ]);
      const state = await f.read();
      expect(state.match).toEqual({
        status: "FINISHED",
        outcome: { reason: "TIMEOUT", winner: "BLACK" },
      });
      expect(state.results).toHaveLength(1);
      expect(state.outbox).toHaveLength(1);
      expect(state.active).toEqual([
        { user_id: f.black.userId, match_id: null },
      ]);
      expect(state.room.status).toBe("WAITING");
    });
  },
);
