import { randomUUID } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import type { RoomCommand } from "@xiangqi/shared";
import { MatchError } from "@server/game/match/match.types.js";
import type { MatchStore } from "@server/game/match/match-store.js";
import type { RoomStore } from "@server/game/room/room-store.js";
import { GameRooms } from "@server/game/realtime/game-rooms.js";
import { fixture } from "./game-rooms.test-helper.js";
describe("draw capability projection and dispatch", () => {
  const draw = {
    offers: [
      {
        id: randomUUID(),
        sender: "red" as const,
        expiresAt: "2026-10-11T12:00:30Z",
      },
    ],
    remainingMoves: { red: 0, black: 4 },
  };
  function setup() {
    const f = fixture();
    const getter = {
      drawSnapshot: vi.fn(async () => draw),
      drawOf: vi.fn(async () => draw),
    };
    const mutations = {
      undoSnapshot: vi.fn(async () => ({
        offers: [],
        remainingMoves: { red: 0, black: 0 },
        used: { red: 0, black: 0 },
        moved: { red: false, black: false },
      })),
      offerDraw: vi.fn(async () => ({ applied: true, match: f.match, draw })),
      withdrawDraw: vi.fn(async () => ({
        applied: true,
        match: f.match,
        draw,
      })),
      respondDraw: vi.fn(async () => ({ applied: true, match: f.match, draw })),
    };
    Object.assign(f.matchStore, mutations);
    const adapter = new GameRooms(
      f.roomStore as unknown as RoomStore,
      f.matchStore as unknown as MatchStore,
      f.clock,
      f.getScope,
      getter,
    );
    return { ...f, adapter, getter, mutations };
  }
  it("keeps old capability-less snapshots safe and refuses draw commands instead of resigning", async () => {
    const f = fixture();
    expect(
      (await f.adapter.snapshot(f.client, f.identity, f.roomId)).draw,
    ).toBeNull();
    await expect(
      f.adapter.execute(
        f.client,
        f.identity,
        f.command({
          type: "match.draw.offer",
          payload: { matchId: f.matchId, matchVersion: 3 },
        }),
      ),
    ).rejects.toMatchObject({ code: "REALTIME_UNAVAILABLE" });
    expect(f.matchStore.resign).not.toHaveBeenCalled();
  });
  it("projects only player proposals, spectator snapshots remain null and query no draw table", async () => {
    const f = setup();
    expect(
      (await f.adapter.snapshot(f.client, f.identity, f.roomId)).draw,
    ).toEqual(draw);
    expect(f.getter.drawOf).toHaveBeenCalledWith(
      { ...f.scope, roomId: f.roomId, canControl: true },
      expect.objectContaining({ seat: "red" }),
      f.match,
    );
    f.getter.drawOf.mockClear();
    f.room.role = "spectator";
    expect(
      (await f.adapter.snapshot(f.client, f.identity, f.roomId)).draw,
    ).toBeNull();
    expect(f.getter.drawOf).not.toHaveBeenCalled();
  });
  it.each([
    "match.draw.offer",
    "match.draw.withdraw",
    "match.draw.respond",
  ] as const)(
    "dispatches %s explicitly and preserves lastMove",
    async (type) => {
      const f = setup();
      const lastMove = { from: 54, to: 45, eventVersion: 2 };
      f.match.lastMove = lastMove;
      const payload = {
        matchId: f.matchId,
        matchVersion: 3,
        ...(type === "match.draw.offer" ? {} : { offerId: draw.offers[0]!.id }),
        ...(type === "match.draw.respond" ? { accept: true } : {}),
      };
      const result = await f.adapter.execute(
        f.client,
        f.identity,
        f.command({ type, payload } as RoomCommand["action"]),
      );
      expect(result.snapshot.draw).toEqual(draw);
      expect(result.snapshot.match?.lastMove).toEqual(lastMove);
      const method =
        type === "match.draw.offer"
          ? "offerDraw"
          : type === "match.draw.withdraw"
            ? "withdrawDraw"
            : "respondDraw";
      expect(f.mutations[method]).toHaveBeenCalledWith(
        { ...f.scope, roomId: f.roomId, canControl: true },
        payload,
      );
      expect(f.matchStore.resign).not.toHaveBeenCalled();
    },
  );
  it.each([
    "MATCH_DRAW_PENDING",
    "MATCH_DRAW_COOLDOWN",
    "MATCH_DRAW_EXPIRED",
    "MATCH_DRAW_SENDER_REQUIRED",
    "MATCH_DRAW_RECEIVER_REQUIRED",
  ])("sanitizes draw error %s with a fresh player snapshot", async (code) => {
    const f = setup();
    f.mutations.offerDraw.mockRejectedValueOnce(
      new MatchError(code, "PRIVATE SQL detail", 409),
    );
    const result = await f.adapter.execute(
      f.client,
      f.identity,
      f.command({
        type: "match.draw.offer",
        payload: { matchId: f.matchId, matchVersion: 3 },
      }),
    );
    expect(result.error?.code).toBe(code);
    expect(result.error?.message).not.toContain("PRIVATE");
    expect(result.snapshot.draw).toEqual(draw);
  });
  it("whitelists draw getter fields and does not invoke it for a terminal match", async () => {
    const f = setup();
    f.getter.drawOf.mockResolvedValueOnce({
      ...draw,
      privateDetail: "SECRET DRAW",
    } as typeof draw);
    const snap = await f.adapter.snapshot(f.client, f.identity, f.roomId);
    expect(snap.draw).toEqual(draw);
    expect(JSON.stringify(snap)).not.toContain("SECRET DRAW");
    f.getter.drawOf.mockClear();
    f.match.status = "FINISHED";
    f.match.outcome = { reason: "DRAW_AGREEMENT", winner: null };
    expect(
      (await f.adapter.snapshot(f.client, f.identity, f.roomId)).draw,
    ).toBeNull();
    expect(f.getter.drawOf).not.toHaveBeenCalled();
  });
});
