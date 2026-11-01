import { describe, expect, it } from "vitest";
import {
  fixture,
  run,
  store,
  pool,
  databaseUrl,
  useProposalHooks,
} from "./match-proposals.test-helper.js";
useProposalHooks();
describe.skipIf(!databaseUrl)(
  "online undo and shared proposal deadlines",
  () => {
    it("rejects undo in ranked while allowing a casual guest to request it", async () => {
      for (const kind of ["RANKED", "CASUAL"] as const) {
        const f = await fixture();
        await pool.query("UPDATE public.rooms SET kind=$2 WHERE id=$1", [f.roomId, kind]);
        const moved = await run(f, f.red, (s) =>
          store.move(s, { matchId: f.matchId, matchVersion: 0, from: 54, to: 45 }),
        );
        const offer = await run(f, f.red, (s) =>
          store.offerUndo(s, { matchId: f.matchId, matchVersion: moved.match.version }),
        );
        if (kind === "RANKED") {
          expect(offer.applied).toBe(false);
          expect(offer.error?.code).toBe("MATCH_UNDO_FORBIDDEN");
          expect(offer.undo.offers).toEqual([]);
        } else {
          expect(offer.applied).toBe(true);
          expect(offer.undo.offers).toHaveLength(1);
        }
      }
    });
    it("undo restores the effective branch without refunding clock and charges only acceptance", async () => {
      const f = await fixture();
      const first = await run(f, f.red, (s) =>
        store.move(s, {
          matchId: f.matchId,
          matchVersion: 0,
          from: 54,
          to: 45,
        }),
      );
      expect(first.applied).toBe(true);
      const offered = await run(f, f.red, (s) =>
        store.offerUndo(s, {
          matchId: f.matchId,
          matchVersion: first.match.version,
        }),
      );
      expect(offered.applied).toBe(true);
      const accepted = await run(f, f.black, (s) =>
        store.respondUndo(s, {
          matchId: f.matchId,
          matchVersion: offered.match.version,
          offerId: offered.undo.offers[0]!.id,
          accept: true,
        }),
      );
      expect(accepted.applied).toBe(true);
      expect(accepted.match.ply).toBe(0);
      expect(accepted.match.turn).toBe("red");
      expect(accepted.undo.used.red).toBe(1);
      expect(accepted.match.clock.redMs).toBeLessThanOrEqual(
        first.match.clock.redMs,
      );
      expect(accepted.match.clock.blackMs).toBeLessThanOrEqual(
        first.match.clock.blackMs,
      );
      const persisted = await pool.query(
        "SELECT active_move_ids,ply FROM public.matches WHERE id=$1",
        [f.matchId],
      );
      const aborted = await run(f, f.red, (s) =>
        store.abort(s, {
          matchId: f.matchId,
          matchVersion: accepted.match.version,
        }),
      );
      expect(aborted.error?.code).toBe("MATCH_ABORT_NOT_ALLOWED");
      expect(persisted.rows[0]).toEqual({ active_move_ids: [], ply: 0 });
    });
    it("accepting one undo closes the other side's pending offer so it cannot re-target the rewound branch", async () => {
      const f = await fixture();
      const first = await run(f, f.red, (s) =>
        store.move(s, {
          matchId: f.matchId,
          matchVersion: 0,
          from: 54,
          to: 45,
        }),
      );
      const second = await run(f, f.black, (s) =>
        store.move(s, {
          matchId: f.matchId,
          matchVersion: first.match.version,
          from: 27,
          to: 36,
        }),
      );
      const red = await run(f, f.red, (s) =>
        store.offerUndo(s, {
          matchId: f.matchId,
          matchVersion: second.match.version,
        }),
      );
      const black = await run(f, f.black, (s) =>
        store.offerUndo(s, {
          matchId: f.matchId,
          matchVersion: red.match.version,
        }),
      );
      expect(black.undo.offers).toHaveLength(2);
      const redOffer = black.undo.offers.find((o) => o.sender === "red")!;
      const blackOffer = black.undo.offers.find((o) => o.sender === "black")!;
      const accepted = await run(f, f.black, (s) =>
        store.respondUndo(s, {
          matchId: f.matchId,
          matchVersion: black.match.version,
          offerId: redOffer.id,
          accept: true,
        }),
      );
      expect(accepted.applied).toBe(true);
      expect(accepted.match.ply).toBe(0);
      expect(accepted.undo.offers).toEqual([]);
      const late = await run(f, f.red, (s) =>
        store.respondUndo(s, {
          matchId: f.matchId,
          matchVersion: accepted.match.version,
          offerId: blackOffer.id,
          accept: true,
        }),
      );
      expect(late.error?.code).toBe("MATCH_UNDO_EXPIRED");
      expect(late.match.ply).toBe(0);
    });
    it("receiver move declines undo and starts three own-move cooldown", async () => {
      const f = await fixture();
      const first = await run(f, f.red, (s) =>
        store.move(s, {
          matchId: f.matchId,
          matchVersion: 0,
          from: 54,
          to: 45,
        }),
      );
      const offered = await run(f, f.red, (s) =>
        store.offerUndo(s, {
          matchId: f.matchId,
          matchVersion: first.match.version,
        }),
      );
      const moved = await run(f, f.black, (s) =>
        store.move(s, {
          matchId: f.matchId,
          matchVersion: offered.match.version,
          from: 27,
          to: 36,
        }),
      );
      expect(moved.applied).toBe(true);
      const state = await run(f, f.red, (s) =>
        store.undoSnapshot(s, { matchId: f.matchId }),
      );
      expect(state.offers).toEqual([]);
      expect(state.remainingMoves.red).toBe(3);
      expect(state.used.red).toBe(0);
    });
    it("rewinds two plies and retains the successful-undo quota across branches", async () => {
      const f = await fixture();
      let version = 0;
      for (let n = 0; n < 3; n++) {
        const red = await run(f, f.red, (s) =>
          store.move(s, {
            matchId: f.matchId,
            matchVersion: version,
            from: 54,
            to: 45,
          }),
        );
        const black = await run(f, f.black, (s) =>
          store.move(s, {
            matchId: f.matchId,
            matchVersion: red.match.version,
            from: 27,
            to: 36,
          }),
        );
        const offered = await run(f, f.red, (s) =>
          store.offerUndo(s, {
            matchId: f.matchId,
            matchVersion: black.match.version,
          }),
        );
        const accepted = await run(f, f.black, (s) =>
          store.respondUndo(s, {
            matchId: f.matchId,
            matchVersion: offered.match.version,
            offerId: offered.undo.offers[0]!.id,
            accept: true,
          }),
        );
        expect(accepted.match.ply).toBe(0);
        expect(accepted.undo.used.red).toBe(n + 1);
        version = accepted.match.version;
      }
      const red = await run(f, f.red, (s) =>
        store.move(s, {
          matchId: f.matchId,
          matchVersion: version,
          from: 54,
          to: 45,
        }),
      );
      const denied = await run(f, f.red, (s) =>
        store.offerUndo(s, {
          matchId: f.matchId,
          matchVersion: red.match.version,
        }),
      );
      expect(denied.error?.code).toBe("MATCH_UNDO_LIMIT");
    });
    it("expires undo at its deadline, rejects late acceptance and keeps quota", async () => {
      const f = await fixture();
      const first = await run(f, f.red, (s) =>
        store.move(s, {
          matchId: f.matchId,
          matchVersion: 0,
          from: 54,
          to: 45,
        }),
      );
      const offered = await run(f, f.red, (s) =>
        store.offerUndo(s, {
          matchId: f.matchId,
          matchVersion: first.match.version,
        }),
      );
      const id = offered.undo.offers[0]!.id;
      await pool.query(
        "UPDATE xiangqi_room.match_undo_offers SET created_at=now()-interval '31 seconds',expires_at=now()-interval '1 second' WHERE id=$1",
        [id],
      );
      await pool.query(
        "UPDATE public.match_events SET created_at=now()-interval '2 seconds' WHERE match_id=$1 AND type='MOVE'",
        [f.matchId],
      );
      const expired = await run(f, f.black, (s) =>
        store.expireUndoOffers(s, { matchId: f.matchId }),
      );
      expect(expired.undo.remainingMoves.red).toBe(3);
      expect(expired.undo.used.red).toBe(0);
      const late = await run(f, f.black, (s) =>
        store.respondUndo(s, {
          matchId: f.matchId,
          matchVersion: expired.match.version,
          offerId: id,
          accept: true,
        }),
      );
      expect(late.error?.code).toBe("MATCH_UNDO_EXPIRED");
    });
    it("requires a player move and enforces one cross-kind pending proposal per sender", async () => {
      const f = await fixture();
      const noMove = await run(f, f.red, (s) =>
        store.offerUndo(s, { matchId: f.matchId, matchVersion: 0 }),
      );
      expect(noMove.error?.code).toBe("MATCH_UNDO_NO_MOVE");
      await expect(
        run(f, f.viewer, (s) =>
          store.offerUndo(s, { matchId: f.matchId, matchVersion: 0 }),
        ),
      ).rejects.toMatchObject({ code: "MATCH_PLAYER_REQUIRED" });
      await expect(
        run(
          f,
          f.red,
          (s) => store.offerUndo(s, { matchId: f.matchId, matchVersion: 0 }),
          false,
        ),
      ).rejects.toMatchObject({ code: "MATCH_READ_ONLY" });
      const first = await run(f, f.red, (s) =>
        store.move(s, {
          matchId: f.matchId,
          matchVersion: 0,
          from: 54,
          to: 45,
        }),
      );
      const offered = await run(f, f.red, (s) =>
        store.offerUndo(s, {
          matchId: f.matchId,
          matchVersion: first.match.version,
        }),
      );
      const draw = await run(f, f.red, (s) =>
        store.offerDraw(s, {
          matchId: f.matchId,
          matchVersion: offered.match.version,
        }),
      );
      expect(draw.error?.code).toBe("MATCH_DRAW_PENDING");
      const wrong = await run(f, f.red, (s) =>
        store.respondUndo(s, {
          matchId: f.matchId,
          matchVersion: offered.match.version,
          offerId: offered.undo.offers[0]!.id,
          accept: true,
        }),
      );
      expect(wrong.error?.code).toBe("MATCH_UNDO_FORBIDDEN");
    });
    it("unlimited undo starts a new interval without refunding still-here confirmations", async () => {
      const f = await fixture(0);
      const first = await run(f, f.red, (s) =>
        store.move(s, {
          matchId: f.matchId,
          matchVersion: 0,
          from: 54,
          to: 45,
        }),
      );
      await pool.query(
        "UPDATE public.matches SET clock=$2,inactivity_extensions=2 WHERE id=$1",
        [
          f.matchId,
          { redMs: 0, blackMs: 0, runningSinceEpochMs: Date.now() - 10000 },
        ],
      );
      const offered = await run(f, f.red, (s) =>
        store.offerUndo(s, {
          matchId: f.matchId,
          matchVersion: first.match.version,
        }),
      );
      const accepted = await run(f, f.black, (s) =>
        store.respondUndo(s, {
          matchId: f.matchId,
          matchVersion: offered.match.version,
          offerId: offered.undo.offers[0]!.id,
          accept: true,
        }),
      );
      expect(accepted.match.turn).toBe("red");
      expect(accepted.match.inactivity?.confirmsLeft).toBe(0);
      expect(accepted.match.clock.runningSinceEpochMs).toBeGreaterThan(
        Date.now() - 5000,
      );
    });
    it("still-here advances version and publishes the new inactivity deadline", async () => {
      const f = await fixture(0, 182_000);
      const old = Date.now() - 181_000;
      await pool.query("UPDATE public.matches SET clock=$2 WHERE id=$1", [
        f.matchId,
        { redMs: 0, blackMs: 0, runningSinceEpochMs: old },
      ]);
      const confirmed = await run(f, f.red, (s) =>
        store.stillHere(s, { matchId: f.matchId, matchVersion: 0 }),
      );
      expect(confirmed.applied).toBe(true);
      expect(confirmed.match.version).toBe(1);
      expect(confirmed.match.inactivity?.confirmsLeft).toBe(1);
      const stale = await run(f, f.red, (s) =>
        store.stillHere(s, { matchId: f.matchId, matchVersion: 0 }),
      );
      expect(stale.error?.code).toBe("MATCH_VERSION_CONFLICT");
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM public.match_events WHERE match_id=$1 AND type='STILL_HERE'",
            [f.matchId],
          )
        ).rows[0].n,
      ).toBe(1);
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM xiangqi_room.outbox WHERE room_id=$1 AND type='MATCH_STILL_HERE'",
            [f.roomId],
          )
        ).rows[0].n,
      ).toBe(1);
    });
    it.each(["draw", "undo"] as const)(
      "returns committed timeout from %s move-resolution helper",
      async (kind) => {
        const f = await fixture(600, 2000);
        await pool.query("UPDATE public.matches SET clock=$2 WHERE id=$1", [
          f.matchId,
          { redMs: 1, blackMs: 600000, runningSinceEpochMs: Date.now() - 1000 },
        ]);
        const result = await run(f, f.red, (s) =>
          kind === "draw"
            ? store.closeDrawOffersOnMove(s, { matchId: f.matchId })
            : store.closeUndoOffersOnMove(s, { matchId: f.matchId }),
        );
        expect(result).toMatchObject({
          status: "FINISHED",
          outcome: { reason: "TIMEOUT", winner: "black" },
        });
        const saved = await pool.query(
          "SELECT status,version FROM public.matches WHERE id=$1",
          [f.matchId],
        );
        expect(saved.rows[0].status).toBe(result!.status);
        expect(Number(saved.rows[0].version)).toBe(result!.version);
      },
    );
  },
);
