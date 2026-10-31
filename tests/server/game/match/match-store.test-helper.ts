import { afterAll, beforeAll, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { parsePosition } from "@xiangqi/xiangqi-core";
import type { PoolClient } from "pg";
import { actor, apply, pool, reset, transaction } from "./match.test-helper.js";
import * as implementation from "@server/game/match/match-store.js";
import { encodePosition } from "@server/game/match/position-codec.js";
import type { ClockPort, MatchScope } from "@server/game/match/match.types.js";

// Synthetic port tests ordering/persistence. T23 supplies the real clock/worker.
export const at = new Date("2030-01-01T00:00:00.000Z");
export const clock: ClockPort = {
  start: vi.fn((seconds, time) => ({
    redMs: seconds * 1000,
    blackMs: seconds * 1000,
    runningSinceEpochMs: time.getTime(),
  })),
  beforeAction: vi.fn((clock) => ({ clock, expired: null })),
  afterMove: vi.fn((clock, _, time) => ({
    ...clock,
    runningSinceEpochMs: time.getTime(),
  })),
};
export const end = {
  onMatchEnded: vi.fn(
    async (c: PoolClient, input: { roomId: string; matchId: string }) => {
      await c.query(
        "UPDATE public.rooms SET status='WAITING',current_match_id=NULL,room_version=room_version+1 WHERE id=$1 AND current_match_id=$2",
        [input.roomId, input.matchId],
      );
      await c.query(
        "UPDATE public.room_members SET ready=false WHERE room_id=$1",
        [input.roomId],
      );
      await c.query(
        "UPDATE public.active_players SET match_id=NULL WHERE room_id=$1",
        [input.roomId],
      );
    },
  ),
};
export let red: string, black: string, viewer: string;
export async function setup(time = at) {
  red = (await actor()).userId;
  black = (await actor()).userId;
  viewer = (await actor()).userId;
  const room = randomUUID(),
    token = randomUUID();
  await transaction([red, black], [room], async (c) => {
    await c.query(
      "INSERT INTO public.rooms(id,owner_id,name,time_control) VALUES($1,$2,'Synthetic Board',600)",
      [room, red],
    );
    await c.query(
      "INSERT INTO public.room_members(room_id,user_id,role,side,ready) VALUES($1,$2,'PLAYER','RED',true),($1,$3,'PLAYER','BLACK',true),($1,$4,'SPECTATOR',NULL,false)",
      [room, red, black, viewer],
    );
    await c.query(
      "INSERT INTO public.active_players(user_id,room_id) VALUES($1,$3),($2,$3)",
      [red, black, room],
    );
    await c.query(
      "INSERT INTO xiangqi_room.countdowns(room_id,token,due_at,red_id,black_id) VALUES($1,$2,$3,$4,$5)",
      [room, token, time, red, black],
    );
  });
  return { room, token };
}
export function store() {
  return new implementation.MatchStore(clock, end, () => at);
}
export async function start(time = at) {
  const fixture = await setup(time);
  const result = await transaction([red, black], [fixture.room], async (c) => {
    const r = await store().start(c, {
      roomId: fixture.room,
      startToken: fixture.token,
      redId: red,
      blackId: black,
      timeControlSeconds: 600,
      startedAt: time,
    });
    await c.query(
      "UPDATE public.rooms SET status='PLAYING',current_match_id=$2 WHERE id=$1",
      [fixture.room, r.matchId],
    );
    await c.query(
      "UPDATE public.active_players SET match_id=$2 WHERE room_id=$1",
      [fixture.room, r.matchId],
    );
    return r;
  });
  return { ...fixture, ...result };
}
export async function run<T>(
  room: string,
  user: string,
  fn: (scope: MatchScope) => Promise<T>,
  canControl = true,
) {
  return transaction([red, black, user], [room], (c) =>
    fn({
      client: c,
      actor: { userId: user, kind: "guest" },
      roomId: room,
      canControl,
      lockedActorIds: new Set([red, black, user]),
      lockedRoomIds: new Set([room]),
    }),
  );
}
export async function tactical(fen: string) {
  const s = await start();
  await pool.query("UPDATE public.matches SET position=$2 WHERE id=$1", [
    s.matchId,
    encodePosition(parsePosition(fen)),
  ]);
  await pool.query(
    "UPDATE public.match_events SET payload=jsonb_set(payload,'{initialPosition}',$2::jsonb) WHERE match_id=$1 AND version=0",
    [s.matchId, JSON.stringify(encodePosition(parsePosition(fen)))],
  );
  return s;
}
export function useMatchHooks() {
  beforeAll(async () => {
    await reset();
    await apply("supabase/migrations/20261011000007_match_outcomes.sql");
    await apply("supabase/migrations/20261011000009_match_draw.sql");
    await apply("supabase/migrations/20261102000003_unlimited_inactivity.sql");
    await apply("supabase/migrations/20261103000005_match_aborted.sql");
    await apply("supabase/migrations/20261103000006_online_undo.sql");
    await apply(
      "supabase/migrations/20261103000007_match_simultaneous_disconnect.sql",
    );
    red = (await actor()).userId;
    black = (await actor()).userId;
    viewer = (await actor()).userId;
  });

  afterAll(() => pool.end());
}
