import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { ClockService } from "@server/game/clock/clock.service.js";
import { createRoomWiring } from "@server/game/room/room-wiring.js";
import {
  databaseUrl,
  pool,
  loginPool,
  reset,
  registration,
  oldRoom,
} from "./game.runtime.test-helper.js";

afterAll(async () => {
  await loginPool.end();
  await pool.end();
});
describe.skipIf(!databaseUrl)(
  "reconnect adjudicates deadlines before clearing presence",
  () => {
    beforeEach(reset);
    it("commits an overdue disconnect before a late reconnect can erase its cause", async () => {
      const f = await oldRoom(
        registration(),
        true,
        false,
        new Date(Date.now() - 120_000),
      );
      await pool.query(
        "UPDATE public.room_members SET disconnected_at=clock_timestamp()-interval '61 seconds' WHERE room_id=$1 AND user_id=$2",
        [f.roomId, f.a.id],
      );
      await pool.query(
        "UPDATE xiangqi_room.presence SET connected=false WHERE room_id=$1 AND user_id=$2",
        [f.roomId, f.a.id],
      );
      const wiring = createRoomWiring(pool, new ClockService());
      await wiring.coordinator.withRoom(
        { actor: { userId: f.a.id, kind: "member" }, roomIds: [f.roomId] },
        async (p) => ({ status: "active", actor: p.actor }),
        (scope) =>
          wiring.withScope(scope, () =>
            wiring.rooms.presence(
              scope,
              f.roomId,
              {
                connectionId: randomUUID(),
                generation: 2,
                serverInstance: randomUUID(),
              },
              true,
            ),
          ),
      );
      const match = (
        await pool.query(
          "SELECT status,outcome FROM public.matches WHERE id=$1",
          [f.matchId],
        )
      ).rows[0];
      expect(match).toEqual({
        status: "FINISHED",
        outcome: { reason: "DISCONNECT", winner: "BLACK" },
      });
      const results = (
        await pool.query(
          "SELECT payload FROM public.match_events WHERE match_id=$1 AND type='RESULT'",
          [f.matchId],
        )
      ).rows;
      expect(results).toHaveLength(1);
      expect(
        (
          await pool.query(
            "SELECT status,current_match_id FROM public.rooms WHERE id=$1",
            [f.roomId],
          )
        ).rows[0],
      ).toEqual({ status: "WAITING", current_match_id: null });
    });
  },
);
