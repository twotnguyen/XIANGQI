import { beforeAll, describe, expect, it } from "vitest";
import type { PoolClient } from "pg";
import { ClockService } from "@server/game/clock/clock.service.js";
import { MatchStore } from "@server/game/match/match-store.js";
import { apply, databaseUrl, pool } from "./match.test-helper.js";
import {
  black,
  red,
  run,
  start,
  useMatchHooks,
} from "./match-store.test-helper.js";

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
// Dùng đồng hồ DB thật (không cố định `at`) để hạn offer được lấy mẫu sau khi chờ khóa.
const store = new MatchStore(new ClockService(), roomEnd);

// Giữ khóa phòng bằng kết nối riêng trong lúc `work` chạy; khóa được nhả sau đó.
async function holdRoomLockWhile<T>(
  room: string,
  work: () => Promise<T>,
): Promise<T> {
  const holder = await pool.connect();
  try {
    await holder.query("BEGIN");
    await holder.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [
      `room:${room}`,
    ]);
    return await work();
  } finally {
    await holder.query("COMMIT");
    holder.release();
  }
}

// Chờ tới khi có tiến trình thực sự bị chặn bởi khóa tư vấn trước khi đổi trạng thái.
async function waitForAdvisoryWaiter() {
  for (let i = 0; i < 5000; i++) {
    const { rows } = await pool.query(
      "SELECT count(*)::int n FROM pg_locks WHERE locktype='advisory' AND NOT granted",
    );
    if (rows[0].n > 0) return;
  }
  throw new Error("waiter never blocked on the room lock");
}

describe.skipIf(!databaseUrl)("match draw expiry under room-lock wait", () => {
  useMatchHooks();
  beforeAll(async () => {
    await apply("supabase/migrations/20261011000009_match_draw.sql");
  });
  it("re-samples the offer deadline after waiting on the room lock, so a late acceptance expires", async () => {
    const s = await start(new Date());
    const offer = await run(s.room, red, (scope) =>
      store.offerDraw(scope, { matchId: s.matchId, matchVersion: 0 }),
    );
    const offerId = offer.draw.offers[0]!.id;
    const { late } = await holdRoomLockWhile(s.room, async () => {
      const pending = run(s.room, black, (scope) =>
        store.respondDraw(scope, {
          matchId: s.matchId,
          matchVersion: offer.match.version,
          offerId,
          accept: true,
        }),
      );
      await waitForAdvisoryWaiter();
      await pool.query(
        "WITH t AS MATERIALIZED(SELECT clock_timestamp()-interval '1 second' deadline) UPDATE xiangqi_room.match_draw_offers SET created_at=t.deadline-interval '30 seconds',expires_at=t.deadline FROM t WHERE id=$1",
        [offerId],
      );
      return { late: pending };
    });
    const result = await late;
    expect(result.error?.code).toBe("MATCH_DRAW_EXPIRED");
    expect(result.match.status).toBe("ACTIVE");
    expect(result.draw.remainingMoves.red).toBe(5);
    expect(
      (
        await pool.query(
          "SELECT status FROM xiangqi_room.match_draw_offers WHERE id=$1",
          [offerId],
        )
      ).rows[0].status,
    ).toBe("EXPIRED");
    const again = await run(s.room, red, (scope) =>
      store.expireDrawOffers(scope, { matchId: s.matchId }),
    );
    expect(again.applied).toBe(false);
  });
});
