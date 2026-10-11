import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import {
  initialPosition,
  playMove,
  serializePosition,
} from "@xiangqi/xiangqi-core";
import { apply, databaseUrl, pool, reset } from "../match/match.test-helper.js";
import { RoomTransactions } from "../room/room-transactions.js";
import type { RoomActor, RoomScope } from "../room/contracts.js";
import { AiReservations } from "./ai-reservations.js";
import { AiHistoryStore } from "./ai-history-store.js";
import type { AiSnapshot } from "./ai-games.js";
const reservations = new AiReservations(),
  store = new AiHistoryStore(reservations),
  coordinator = new RoomTransactions(pool);
async function run<T>(
  actor: RoomActor,
  work: (scope: RoomScope) => Promise<T>,
) {
  // Trusted synthetic actors test the internal SQL port, not HTTP/session authorization.
  const result = await coordinator.withRoom(
    { actor, roomIds: [] },
    async (proof) => ({ status: "active", actor: proof.actor }),
    work,
  );
  if (result.status !== "active") throw new Error("Synthetic actor not active");
  return result.value;
}
async function fixture() {
  const userId = randomUUID();
  await pool.query(
    "INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,$2,clock_timestamp())",
    [userId, userId + "@example.invalid"],
  );
  await pool.query(
    "INSERT INTO public.profiles(user_id,username,display_name) VALUES($1,$2,'Synthetic AI player')",
    [userId, "u" + userId.replaceAll("-", "").slice(0, 18)],
  );
  const actor: RoomActor = { userId, kind: "member" };
  const boot = await run(actor, (scope) =>
    reservations.createBoot(scope.client),
  );
  const start = initialPosition(),
    next = playMove(start, { from: 54, to: 45 });
  const game: AiSnapshot = {
    id: randomUUID(),
    ownerId: userId,
    requestedSide: "red",
    actualSide: "red",
    level: "easy",
    position: serializePosition(next),
    history: [serializePosition(start), serializePosition(next)],
    version: 3,
    status: "FINISHED",
    engineState: "IDLE",
    engineError: null,
    outcome: { reason: "RESIGN", winner: "black" },
  };
  await run(actor, (scope) =>
    reservations.reserve(scope, { gameId: game.id, bootId: boot.id }),
  );
  return {
    actor,
    game,
    boot,
    finish: () => run(actor, (scope) => store.finish(scope, game, boot.id)),
  };
}
describe.skipIf(!databaseUrl)(
  "member AI history with actual SQL reservation and transaction",
  () => {
    beforeEach(async () => {
      await pool.query(
        "DROP SCHEMA IF EXISTS xiangqi_ai CASCADE; DROP SCHEMA IF EXISTS xiangqi_chat CASCADE",
      );
      await reset();
      for (const migration of [
        "07_match_outcomes",
        "08_room_modes",
        "09_match_draw",
        "10_room_chat",
        "11_ai_reservations",
      ])
        await apply(`supabase/migrations/202610110000${migration}.sql`);
    });
    afterAll(() => pool.end());
    it("commits terminal AI match, effective move chain and exact reservation release together", async () => {
      const f = await fixture(),
        result = await f.finish();
      expect(result).toMatchObject({ persisted: true, created: true });
      const row = (
        await pool.query(
          "SELECT mode,status,ai_level,ai_side,time_control,clock,ply FROM public.matches WHERE id=$1",
          [f.game.id],
        )
      ).rows[0];
      expect(row).toEqual({
        mode: "AI",
        status: "FINISHED",
        ai_level: "EASY",
        ai_side: "BLACK",
        time_control: 0,
        clock: null,
        ply: 1,
      });
      expect(
        (
          await pool.query(
            "SELECT type FROM public.match_events WHERE match_id=$1 ORDER BY version",
            [f.game.id],
          )
        ).rows.map((r) => r.type),
      ).toEqual(["START", "MOVE", "RESULT"]);
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM public.active_players WHERE user_id=$1",
            [f.actor.userId],
          )
        ).rows[0].n,
      ).toBe(0);
      expect(
        (
          await pool.query(
            "SELECT move,parent_move_id FROM public.match_moves WHERE match_id=$1",
            [f.game.id],
          )
        ).rows[0],
      ).toEqual({
        move: { from: { x: 0, y: 6 }, to: { x: 0, y: 5 } },
        parent_move_id: null,
      });
    });
    it("retries a lost commit acknowledgement without duplicating history after the seat is released", async () => {
      const f = await fixture(),
        first = await f.finish(),
        second = await f.finish();
      expect(second).toEqual({ ...first, created: false });
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM public.matches WHERE id=$1",
            [f.game.id],
          )
        ).rows[0].n,
      ).toBe(1);
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM public.match_events WHERE match_id=$1",
            [f.game.id],
          )
        ).rows[0].n,
      ).toBe(3);
    });
    it("rolls back every history insert and seat release if the caller transaction fails", async () => {
      const f = await fixture();
      await expect(
        run(f.actor, async (scope) => {
          await store.finish(scope, f.game, f.boot.id);
          throw new Error("Synthetic transaction interruption");
        }),
      ).rejects.toThrow("Synthetic transaction interruption");
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM public.matches WHERE id=$1",
            [f.game.id],
          )
        ).rows[0].n,
      ).toBe(0);
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM public.active_players WHERE user_id=$1",
            [f.actor.userId],
          )
        ).rows[0].n,
      ).toBe(1);
      expect(await f.finish()).toMatchObject({ created: true });
    });
    it("rejects a conflicting retry payload and foreign actor without altering the terminal record", async () => {
      const f = await fixture();
      await f.finish();
      await expect(
        run(f.actor, (scope) =>
          store.finish(scope, { ...f.game, level: "hard" }, f.boot.id),
        ),
      ).rejects.toThrow("AI_HISTORY_CONFLICT");
      const foreign = await fixture();
      await expect(
        run(foreign.actor, (scope) => store.finish(scope, f.game, f.boot.id)),
      ).rejects.toThrow("AI_HISTORY_CONFLICT");
      expect(
        (
          await pool.query("SELECT ai_level FROM public.matches WHERE id=$1", [
            f.game.id,
          ])
        ).rows[0].ai_level,
      ).toBe("EASY");
    });
    it("refuses invalid history before mutation and preserves the active reservation", async () => {
      const f = await fixture();
      await expect(
        run(f.actor, (scope) =>
          store.finish(
            scope,
            { ...f.game, position: f.game.history[0]! },
            f.boot.id,
          ),
        ),
      ).rejects.toThrow("AI_HISTORY_INVALID");
      expect(
        (await pool.query("SELECT count(*)::int n FROM public.matches", []))
          .rows[0].n,
      ).toBe(0);
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM public.active_players",
            [],
          )
        ).rows[0].n,
      ).toBe(1);
    });
    it("does not release a newer game when retrying an older committed result", async () => {
      const f = await fixture();
      await f.finish();
      const nextGame = randomUUID();
      await run(f.actor, (scope) =>
        reservations.reserve(scope, { gameId: nextGame, bootId: f.boot.id }),
      );
      expect(await f.finish()).toMatchObject({ created: false });
      expect(
        (
          await pool.query(
            "SELECT ai_game_id FROM public.active_players WHERE user_id=$1",
            [f.actor.userId],
          )
        ).rows[0].ai_game_id,
      ).toBe(nextGame);
    });
    it("serializes concurrent finish attempts into one canonical history", async () => {
      const f = await fixture();
      const results = await Promise.all([f.finish(), f.finish()]);
      expect(results.filter((result) => result.created)).toHaveLength(1);
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM public.match_moves WHERE match_id=$1",
            [f.game.id],
          )
        ).rows[0].n,
      ).toBe(1);
    });
    it("rejects changed persisted metadata even if the original fingerprint remains", async () => {
      const f = await fixture();
      await f.finish();
      await pool.query(
        "UPDATE public.match_events SET payload=jsonb_set(payload,'{requestedSide}','\"black\"') WHERE match_id=$1 AND type='START'",
        [f.game.id],
      );
      await expect(f.finish()).rejects.toThrow("AI_HISTORY_CONFLICT");
    });
    it("stores real engine failure as neutral interrupted history", async () => {
      const f = await fixture();
      await run(f.actor, (scope) =>
        store.finish(
          scope,
          {
            ...f.game,
            status: "ABANDONED",
            outcome: { reason: "ENGINE_FAILURE", winner: null },
          },
          f.boot.id,
        ),
      );
      expect(
        (
          await pool.query(
            "SELECT status,outcome FROM public.matches WHERE id=$1",
            [f.game.id],
          )
        ).rows[0],
      ).toEqual({
        status: "INTERRUPTED",
        outcome: { reason: "AI_UNAVAILABLE", winner: null },
      });
    });
    it.each([
      ["startToken", "00000000-0000-0000-0000-000000000001"],
      ["ruleSetVersion", "unsupported-rules-v99"],
    ])(
      "rejects changed START %s on an idempotent retry",
      async (field, value) => {
        const f = await fixture();
        await f.finish();
        await pool.query(
          "UPDATE public.match_events SET payload=jsonb_set(payload,ARRAY[$2]::text[],to_jsonb($3::text)) WHERE match_id=$1 AND type='START'",
          [f.game.id, field, value],
        );
        await expect(f.finish()).rejects.toThrow("AI_HISTORY_CONFLICT");
      },
    );
  },
);
