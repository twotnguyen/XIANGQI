import { randomInt, randomUUID } from "node:crypto";
import { afterAll, beforeEach } from "vitest";
import type { PoolClient } from "pg";
import { ClockService } from "@server/game/clock/clock.service.js";
import { MatchStore } from "@server/game/match/match-store.js";
import type { MatchScope } from "@server/game/match/match.types.js";
import {
  actor,
  apply,
  databaseUrl,
  pool,
  reset,
  transaction,
} from "./match.test-helper.js";
export const migration = "supabase/migrations/20261011000009_match_draw.sql";
const roomEnd = {
  async onMatchEnded(
    client: PoolClient,
    input: { roomId: string; matchId: string },
  ) {
    await client.query(
      "UPDATE public.rooms SET status='WAITING',current_match_id=NULL,room_version=room_version+1 WHERE id=$1 AND current_match_id=$2",
      [input.roomId, input.matchId],
    );
    await client.query(
      "UPDATE public.room_members SET ready=false WHERE room_id=$1",
      [input.roomId],
    );
    await client.query(
      "UPDATE public.active_players SET match_id=NULL WHERE room_id=$1",
      [input.roomId],
    );
  },
};
export const store = new MatchStore(new ClockService(), roomEnd);
export async function fixture(timeControlSeconds: 0 | 600 = 600, ageMs = 0) {
  const red = (await actor()).userId,
    black = (await actor()).userId,
    viewer = (await actor()).userId;
  const roomId = randomUUID(),
    token = randomUUID();
  const result = await transaction(
    [red, black, viewer],
    [roomId],
    async (client) => {
      await client.query(
        "INSERT INTO public.rooms(id,owner_id,name,time_control,viewer_limit,invite_code) VALUES($1,$2,'Synthetic Draw',$3,5,$4)",
        [roomId, red, timeControlSeconds, String(randomInt(10_000_000, 100_000_000))],
      );
      await client.query(
        "INSERT INTO public.room_members(room_id,user_id,role,side,ready) VALUES($1,$2,'PLAYER','RED',true),($1,$3,'PLAYER','BLACK',true),($1,$4,'SPECTATOR',NULL,false)",
        [roomId, red, black, viewer],
      );
      await client.query(
        "INSERT INTO public.active_players(user_id,room_id) VALUES($1,$3),($2,$3)",
        [red, black, roomId],
      );
      const at = new Date(Date.now() - ageMs);
      await client.query(
        "INSERT INTO xiangqi_room.countdowns(room_id,token,due_at,red_id,black_id) VALUES($1,$2,$3,$4,$5)",
        [roomId, token, at, red, black],
      );
      const result = await store.start(client, {
        roomId,
        startToken: token,
        redId: red,
        blackId: black,
        timeControlSeconds,
        startedAt: at,
      });
      await client.query(
        "UPDATE public.rooms SET status='PLAYING',current_match_id=$2 WHERE id=$1",
        [roomId, result.matchId],
      );
      await client.query(
        "UPDATE public.active_players SET match_id=$2 WHERE room_id=$1",
        [roomId, result.matchId],
      );
      return result;
    },
  );
  return { red, black, viewer, roomId, ...result };
}
export async function run<T>(
  f: {
    red: string;
    black: string;
    viewer: string;
    roomId: string;
    matchId: string;
  },
  userId: string,
  action: (scope: MatchScope) => Promise<T>,
  canControl = true,
) {
  const ids = [f.red, f.black, userId];
  return transaction(ids, [f.roomId], (client) =>
    action({
      client,
      actor: { userId, kind: "guest" },
      roomId: f.roomId,
      canControl,
      lockedActorIds: new Set(ids),
      lockedRoomIds: new Set([f.roomId]),
    }),
  );
}

export { apply, databaseUrl, pool };
export function useProposalHooks() {
  afterAll(() => pool.end());
  beforeEach(async () => {
    await reset();
    await apply("supabase/migrations/20261011000007_match_outcomes.sql");
    await apply(migration);
    await apply("supabase/migrations/20261102000003_unlimited_inactivity.sql");
    await apply("supabase/migrations/20261103000005_match_aborted.sql");
    await apply("supabase/migrations/20261103000006_online_undo.sql");
    await apply(
      "supabase/migrations/20261103000007_match_simultaneous_disconnect.sql",
    );
  });
}
