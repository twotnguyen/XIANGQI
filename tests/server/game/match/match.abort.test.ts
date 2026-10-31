import { describe, expect, it } from "vitest";
import { databaseUrl, pool } from "./match.test-helper.js";
import {
  at,
  clock,
  black,
  red,
  store,
  start,
  run,
  viewer,
  useMatchHooks,
} from "./match-store.test-helper.js";
import * as implementation from "@server/game/match/match-store.js";
import { end } from "./match-store.test-helper.js";

const abort = (room: string, user: string, matchId: string, matchVersion = 0) =>
  run(room, user, (scope) => store().abort(scope, { matchId, matchVersion }));

describe.skipIf(!databaseUrl)(
  "Hủy ván khi chưa có nước đi (YC5 mục 17.2)",
  () => {
    useMatchHooks();

    it("mỗi người chơi tự hủy được: ván INTERRUPTED/ABORTED trung tính, không thắng thua (AC-YC5-RV-03)", async () => {
      // start() tạo hai người chơi mới mỗi lần nên chọn người sau khi start.
      for (const side of ["red", "black"] as const) {
        const s = await start();
        const result = await abort(
          s.room,
          side === "red" ? red : black,
          s.matchId,
        );
        expect(result).toMatchObject({
          applied: true,
          match: {
            status: "INTERRUPTED",
            outcome: { reason: "ABORTED", winner: null },
          },
        });
        expect(
          (
            await pool.query(
              "SELECT status,outcome FROM public.matches WHERE id=$1",
              [s.matchId],
            )
          ).rows[0],
        ).toMatchObject({
          status: "INTERRUPTED",
          outcome: { reason: "ABORTED", winner: null },
        });
        expect(
          (
            await pool.query(
              "SELECT status,current_match_id FROM public.rooms WHERE id=$1",
              [s.room],
            )
          ).rows[0],
        ).toEqual({ status: "WAITING", current_match_id: null });
        expect(
          (
            await pool.query(
              "SELECT count(*)::int n FROM public.match_events WHERE match_id=$1 AND type='RESULT'",
              [s.matchId],
            )
          ).rows[0].n,
        ).toBe(1);
      }
    });

    it("sau nước đầu thì không hủy được và ván không đổi (AC-YC5-RV-04)", async () => {
      const s = await start();
      await run(s.room, red, (scope) =>
        store().move(scope, {
          matchId: s.matchId,
          matchVersion: 0,
          from: 54,
          to: 45,
        }),
      );
      expect(await abort(s.room, black, s.matchId, 1)).toMatchObject({
        applied: false,
        error: { code: "MATCH_ABORT_NOT_ALLOWED" },
        match: { status: "ACTIVE" },
      });
      expect(
        (
          await pool.query(
            "SELECT status,ply FROM public.matches WHERE id=$1",
            [s.matchId],
          )
        ).rows[0],
      ).toEqual({ status: "ACTIVE", ply: 1 });
    });

    it("người xem hoặc tab chỉ đọc không hủy được (AC-YC5-RV-04)", async () => {
      const s = await start();
      await expect(abort(s.room, viewer, s.matchId)).rejects.toMatchObject({
        code: "MATCH_PLAYER_REQUIRED",
      });
      await expect(
        run(
          s.room,
          red,
          (scope) =>
            store().abort(scope, { matchId: s.matchId, matchVersion: 0 }),
          false,
        ),
      ).rejects.toMatchObject({ code: "MATCH_READ_ONLY" });
      expect(
        (
          await pool.query("SELECT status FROM public.matches WHERE id=$1", [
            s.matchId,
          ])
        ).rows[0].status,
      ).toBe("ACTIVE");
    });

    it("Hủy và nước đầu cạnh tranh: đúng một kết quả, lệnh còn lại nhận lỗi (AC-YC5-RV-05)", async () => {
      const s = await start();
      await abort(s.room, red, s.matchId);
      expect(
        await run(s.room, red, (scope) =>
          store().move(scope, {
            matchId: s.matchId,
            matchVersion: 0,
            from: 54,
            to: 45,
          }),
        ),
      ).toMatchObject({ applied: false, error: { code: "MATCH_FINISHED" } });
      expect(await abort(s.room, black, s.matchId, 1)).toMatchObject({
        applied: false,
        error: { code: "MATCH_FINISHED" },
      });
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM public.match_events WHERE match_id=$1 AND type='RESULT'",
            [s.matchId],
          )
        ).rows[0].n,
      ).toBe(1);
    });

    it("hết giờ trước khi Hủy hợp lệ thì TIMEOUT thắng như mọi lệnh (mục 17.2)", async () => {
      const s = await start();
      const expiring = new implementation.MatchStore(
        {
          ...clock,
          beforeAction: () => ({
            clock: {
              redMs: 0,
              blackMs: 600000,
              runningSinceEpochMs: at.getTime(),
            },
            expired: "red",
          }),
        },
        end,
        () => at,
      );
      expect(
        await run(s.room, black, (scope) =>
          expiring.abort(scope, { matchId: s.matchId, matchVersion: 0 }),
        ),
      ).toMatchObject({
        applied: false,
        match: { outcome: { reason: "TIMEOUT", winner: "black" } },
      });
    });
  },
);
