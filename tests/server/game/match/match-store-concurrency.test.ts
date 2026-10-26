import { randomInt, randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import type { PoolClient } from "pg";
import { ClockService } from "@server/game/clock/clock.service.js";
import { MatchStore } from "@server/game/match/match-store.js";
import { MatchError, type MatchScope } from "@server/game/match/match.types.js";
import {
  actor,
  apply,
  databaseUrl,
  pool,
  reset,
  transaction,
} from "./match.test-helper.js";

const ROUNDS = 10;
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
      "UPDATE public.active_players SET match_id=NULL WHERE room_id=$1",
      [input.roomId],
    );
  },
};
const store = new MatchStore(new ClockService(), roomEnd);

async function fixture() {
  const red = (await actor()).userId,
    black = (await actor()).userId;
  const roomId = randomUUID(),
    token = randomUUID();
  const result = await transaction([red, black], [roomId], async (client) => {
    await client.query(
      "INSERT INTO public.rooms(id,owner_id,name,time_control,viewer_limit,invite_code) VALUES($1,$2,'Synthetic Race',600,5,$3)",
      [roomId, red, String(randomInt(10_000_000, 100_000_000))],
    );
    await client.query(
      "INSERT INTO public.room_members(room_id,user_id,role,side,ready) VALUES($1,$2,'PLAYER','RED',true),($1,$3,'PLAYER','BLACK',true)",
      [roomId, red, black],
    );
    await client.query(
      "INSERT INTO public.active_players(user_id,room_id) VALUES($1,$3),($2,$3)",
      [red, black, roomId],
    );
    const at = new Date();
    await client.query(
      "INSERT INTO xiangqi_room.countdowns(room_id,token,due_at,red_id,black_id) VALUES($1,$2,$3,$4,$5)",
      [roomId, token, at, red, black],
    );
    const started = await store.start(client, {
      roomId,
      startToken: token,
      redId: red,
      blackId: black,
      timeControlSeconds: 600,
      startedAt: at,
    });
    await client.query(
      "UPDATE public.rooms SET status='PLAYING',current_match_id=$2 WHERE id=$1",
      [roomId, started.matchId],
    );
    await client.query(
      "UPDATE public.active_players SET match_id=$2 WHERE room_id=$1",
      [roomId, started.matchId],
    );
    return started;
  });
  return { red, black, roomId, ...result };
}
function run<T>(
  f: Awaited<ReturnType<typeof fixture>>,
  userId: string,
  action: (scope: MatchScope) => Promise<T>,
) {
  const ids = [f.red, f.black];
  return transaction(ids, [f.roomId], (client) =>
    action({
      client,
      actor: { userId, kind: "guest" },
      roomId: f.roomId,
      canControl: true,
      lockedActorIds: new Set(ids),
      lockedRoomIds: new Set([f.roomId]),
    }),
  );
}
// Lawful races end as a command result or a MatchError; a raw pg error means
// a deadlock (40P01) or serialization failure escaped the lock protocol.
function unexpected(results: PromiseSettledResult<unknown>[]) {
  return results
    .filter((r): r is PromiseRejectedResult => r.status === "rejected")
    .map((r) => r.reason)
    .filter((e) => !(e instanceof MatchError));
}
async function resultEvents(matchId: string) {
  return Number(
    (
      await pool.query(
        "SELECT count(*)::int AS n FROM public.match_events WHERE match_id=$1 AND type='RESULT'",
        [matchId],
      )
    ).rows[0].n,
  );
}

afterAll(() => pool.end());
describe.skipIf(!databaseUrl)("MatchStore concurrent commands", () => {
  beforeEach(async () => {
    await reset();
    await apply("supabase/migrations/20261011000007_match_outcomes.sql");
    await apply("supabase/migrations/20261011000009_match_draw.sql");
  });

  it("never produces two results when a move races both resignations", async () => {
    for (let i = 0; i < ROUNDS; i++) {
      const f = await fixture();
      const results = await Promise.allSettled([
        run(f, f.red, (s) =>
          store.move(s, {
            matchId: f.matchId,
            matchVersion: 0,
            from: 54,
            to: 45,
          }),
        ),
        run(f, f.red, (s) =>
          store.resign(s, { matchId: f.matchId, matchVersion: 0 }),
        ),
        run(f, f.black, (s) =>
          store.resign(s, { matchId: f.matchId, matchVersion: 0 }),
        ),
      ]);
      expect(unexpected(results)).toEqual([]);
      // A move that wins the lock bumps the version and makes both resignations
      // stale; otherwise exactly one resignation wins. Never more than one result.
      const resigned = results
        .slice(1)
        .filter((r) => r.status === "fulfilled" && r.value.applied).length;
      expect(resigned).toBeLessThanOrEqual(1);
      expect(await resultEvents(f.matchId)).toBe(resigned);
    }
  });

  it("applies exactly one of two identical simultaneous moves", async () => {
    for (let i = 0; i < ROUNDS; i++) {
      const f = await fixture();
      const results = await Promise.allSettled([
        run(f, f.red, (s) =>
          store.move(s, {
            matchId: f.matchId,
            matchVersion: 0,
            from: 54,
            to: 45,
          }),
        ),
        run(f, f.red, (s) =>
          store.move(s, {
            matchId: f.matchId,
            matchVersion: 0,
            from: 54,
            to: 45,
          }),
        ),
      ]);
      expect(unexpected(results)).toEqual([]);
      const applied = results.filter(
        (r) => r.status === "fulfilled" && r.value.applied,
      );
      expect(applied).toHaveLength(1);
    }
  });

  it("never deadlocks when a draw offer, its answer and a move overlap", async () => {
    for (let i = 0; i < ROUNDS; i++) {
      const f = await fixture();
      const offer = await run(f, f.red, (s) =>
        store.offerDraw(s, { matchId: f.matchId, matchVersion: 0 }),
      );
      const offerId = offer.draw.offers[0]!.id;
      const results = await Promise.allSettled([
        run(f, f.black, (s) =>
          store.respondDraw(s, {
            matchId: f.matchId,
            matchVersion: offer.match.version,
            offerId,
            accept: false,
          }),
        ),
        run(f, f.red, (s) =>
          store.withdrawDraw(s, {
            matchId: f.matchId,
            matchVersion: offer.match.version,
            offerId,
          }),
        ),
        run(f, f.red, (s) =>
          store.move(s, {
            matchId: f.matchId,
            matchVersion: offer.match.version,
            from: 54,
            to: 45,
          }),
        ),
      ]);
      expect(unexpected(results)).toEqual([]);
      expect(await resultEvents(f.matchId)).toBe(0);
    }
  });
});
