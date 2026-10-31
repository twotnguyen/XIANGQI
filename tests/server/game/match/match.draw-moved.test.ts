import { describe, expect, it } from "vitest";
import { databaseUrl, pool } from "./match.test-helper.js";
import {
  black,
  red,
  run,
  start,
  store,
  useMatchHooks,
} from "./match-store.test-helper.js";

const offers = async (matchId: string) =>
  (
    await pool.query(
      "SELECT sender,status,cooldown_after_move_count FROM xiangqi_room.match_draw_offers WHERE match_id=$1 ORDER BY created_at",
      [matchId],
    )
  ).rows;

describe.skipIf(!databaseUrl)(
  "Nước đi đóng đề nghị Xin hòa đang chờ (YC5 mục 17)",
  () => {
    useMatchHooks();

    it("người nhận đi một nước thì đề nghị bị từ chối và người gửi chờ 5 nước của mình (AC-YC5-RV-01)", async () => {
      const s = await start();
      await run(s.room, black, (scope) =>
        store().offerDraw(scope, { matchId: s.matchId, matchVersion: 0 }),
      );
      const moved = await run(s.room, red, (scope) =>
        store().move(scope, {
          matchId: s.matchId,
          matchVersion: 1,
          from: 54,
          to: 45,
        }),
      );
      expect(moved.applied).toBe(true);
      expect(await offers(s.matchId)).toEqual([
        { sender: "BLACK", status: "DECLINED", cooldown_after_move_count: 0 },
      ]);
      const draw = await run(s.room, black, (scope) =>
        store().drawSnapshot(scope, { matchId: s.matchId }),
      );
      expect(draw.offers).toEqual([]);
      expect(draw.remainingMoves).toEqual({ red: 0, black: 5 });
      // Nước vẫn được áp; lệnh Đồng ý đến muộn bị từ chối.
      expect(moved.match.ply).toBe(1);
      const late = await run(s.room, red, (scope) =>
        store().respondDraw(scope, {
          matchId: s.matchId,
          matchVersion: moved.match.version,
          offerId: "11111111-1111-4111-8111-111111111111",
          accept: true,
        }),
      );
      expect(late).toMatchObject({
        applied: false,
        error: { code: "MATCH_DRAW_EXPIRED" },
      });
    });

    it("người gửi tự đi nước khi đề nghị còn chờ thì đề nghị tự rút, không phạt chờ nước", async () => {
      const s = await start();
      await run(s.room, red, (scope) =>
        store().offerDraw(scope, { matchId: s.matchId, matchVersion: 0 }),
      );
      await run(s.room, red, (scope) =>
        store().move(scope, {
          matchId: s.matchId,
          matchVersion: 1,
          from: 54,
          to: 45,
        }),
      );
      expect(await offers(s.matchId)).toEqual([
        { sender: "RED", status: "WITHDRAWN", cooldown_after_move_count: null },
      ]);
      const draw = await run(s.room, red, (scope) =>
        store().drawSnapshot(scope, { matchId: s.matchId }),
      );
      expect(draw.remainingMoves).toEqual({ red: 0, black: 0 });
    });

    it("xin hòa được ngay trước nước đầu, không có ngưỡng nước tối thiểu (AC-YC5-RV-08)", async () => {
      const s = await start();
      const result = await run(s.room, red, (scope) =>
        store().offerDraw(scope, { matchId: s.matchId, matchVersion: 0 }),
      );
      expect(result).toMatchObject({
        applied: true,
        draw: { offers: [{ sender: "red" }] },
      });
      expect(await offers(s.matchId)).toHaveLength(1);
    });
  },
);
