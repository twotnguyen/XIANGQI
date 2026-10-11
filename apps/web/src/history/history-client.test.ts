import { describe, expect, it, vi } from "vitest";
import { makeHistoryClient } from "./history-client.js";
const id = "11111111-1111-4111-8111-111111111111",
  other = "22222222-2222-4222-8222-222222222222";
function item() {
  return {
    id,
    type: "CASUAL",
    typeLabel: "Đánh Thường",
    side: "red",
    opponent: { displayName: "Khách", isGuest: true },
    result: {
      kind: "WIN",
      reason: "RESIGN",
      label: "Thắng",
      countsForWdl: true,
    },
    eloDelta: null,
    startedAt: "2026-10-11T01:00:00.000001Z",
    endedAt: "2026-10-11T02:00:00.000002Z",
    replayPath: `/history/${id}`,
  };
}
function fixture(value: unknown = { items: [item()], nextCursor: null }) {
  const fetch = vi
    .fn()
    .mockImplementation(async () => new Response(JSON.stringify(value)));
  return { fetch, client: makeHistoryClient(fetch) };
}
describe("history client", () => {
  it("rejects reversed chronology, requested-limit overflow and redirected replay", async () => {
    const a = item(),
      b = {
        ...item(),
        id: other,
        endedAt: "2026-10-11T02:00:00.000003Z",
        replayPath: `/history/${other}`,
      };
    await expect(
      fixture({ items: [a, b], nextCursor: null }).client.list(),
    ).rejects.toThrow("Phản hồi");
    await expect(
      fixture({ items: [b, a], nextCursor: null }).client.list({ limit: 1 }),
    ).rejects.toThrow("Phản hồi");
  });
  it("uses exact filter/limit/microsecond cursor query without credentials", async () => {
    const f = fixture();
    const cursor = { endedAt: "2026-10-11T02:00:00.123456Z", matchId: other };
    await f.client.list({ filter: "AI", limit: 20, cursor });
    expect(f.fetch).toHaveBeenCalledWith(
      `/history?filter=AI&limit=20&cursor=${encodeURIComponent(JSON.stringify(cursor))}`,
      { method: "GET", redirect: "error" },
    );
  });
  it("defaults to ALL/20 and permits empty history", async () => {
    const f = fixture({ items: [], nextCursor: null });
    expect(await f.client.list()).toEqual({ items: [], nextCursor: null });
    expect(f.fetch).toHaveBeenCalledWith("/history?filter=ALL&limit=20", {
      method: "GET",
      redirect: "error",
    });
  });
  it("preserves descending submillisecond order and exact last cursor", async () => {
    const a = item(),
      b = {
        ...item(),
        id: other,
        endedAt: "2026-10-11T02:00:00.000001Z",
        replayPath: `/history/${other}`,
      };
    const value = {
      items: [a, b],
      nextCursor: { endedAt: b.endedAt, matchId: b.id },
    };
    expect(await fixture(value).client.list()).toEqual(value);
  });
  const decisive = [
    "CHECKMATE",
    "STALEMATE",
    "TIMEOUT",
    "RESIGN",
    "DISCONNECT",
    "PERPETUAL_CHECK",
  ];
  for (const reason of decisive)
    for (const kind of ["WIN", "LOSS"])
      it(`accepts ${reason}/${kind}`, async () => {
        const row = item();
        row.result = {
          kind,
          reason,
          label: kind === "WIN" ? "Thắng" : "Thua",
          countsForWdl: true,
        };
        expect(
          (await fixture({ items: [row], nextCursor: null }).client.list())
            .items[0]?.result,
        ).toEqual(row.result);
      });
  it.each([
    "AGREED_DRAW",
    "REPETITION",
    "DRAW_REPETITION",
    "DRAW_NO_CAPTURE",
    "DRAW_AGREEMENT",
    "PERPETUAL_CHECK",
  ])("accepts draw %s", async (reason) => {
    const row = item();
    row.result = { kind: "DRAW", reason, label: "Hòa", countsForWdl: true };
    expect(
      (await fixture({ items: [row], nextCursor: null }).client.list()).items[0]
        ?.result.kind,
    ).toBe("DRAW");
  });
  it.each(["BOTH_OFFLINE", "SERVER_RESTART", "AI_UNAVAILABLE"])(
    "accepts non-counted interruption %s",
    async (reason) => {
      const row = item();
      row.result = {
        kind: "INTERRUPTED",
        reason,
        label: "Bị gián đoạn",
        countsForWdl: false,
      };
      expect(
        (await fixture({ items: [row], nextCursor: null }).client.list())
          .items[0]?.result.countsForWdl,
      ).toBe(false);
    },
  );
  it("accepts AI difficulty public DTO", async () => {
    const row = {
      ...item(),
      type: "AI",
      typeLabel: "Đấu với Máy - Khó",
      aiLevel: "HARD",
      opponent: { displayName: "Máy", isGuest: false },
    };
    expect(
      (await fixture({ items: [row], nextCursor: null }).client.list())
        .items[0],
    ).toEqual(row);
  });
  it.each([
    { filter: "unknown" },
    { limit: 0 },
    { limit: 51 },
    { limit: 1.5 },
    { cursor: { endedAt: "2026-10-11T02:00:00.123Z", matchId: id } },
    { cursor: { endedAt: "2026-02-30T02:00:00.123456Z", matchId: id } },
    { cursor: { endedAt: "2026-10-11T02:00:00.123456Z", matchId: "bad" } },
    {
      cursor: {
        endedAt: "2026-10-11T02:00:00.123456Z",
        matchId: id,
        appSession: "private",
      },
    },
    { ownerId: id },
  ])("rejects invalid input before fetch", async (input) => {
    const f = fixture();
    await expect(f.client.list(input as never)).rejects.toThrow();
    expect(f.fetch).not.toHaveBeenCalled();
  });
  it.each([
    { ownerId: other },
    { eloDelta: 1 },
    { type: "RANKED" },
    { aiLevel: "EASY" },
    { replayPath: `https://private/${id}` },
    { endedAt: "2026-02-30T02:00:00.123456Z" },
    { endedAt: "2026-10-11T02:00:00.123Z" },
    { opponent: { displayName: "Name", isGuest: false, userId: other } },
    {
      result: {
        kind: "DRAW",
        reason: "TIMEOUT",
        label: "Hòa",
        countsForWdl: true,
      },
    },
    {
      result: {
        kind: "INTERRUPTED",
        reason: "SERVER_RESTART",
        label: "Bị gián đoạn",
        countsForWdl: true,
      },
    },
    {
      result: {
        kind: "ABANDONED",
        reason: "AI_ABANDONED",
        label: "Bỏ dở",
        countsForWdl: false,
      },
    },
  ])("rejects private/noncanonical item", async (patch) => {
    await expect(
      fixture({
        items: [{ ...item(), ...patch }],
        nextCursor: null,
      }).client.list(),
    ).rejects.toThrow("Phản hồi");
  });
  it.each([
    { items: [item(), item()], nextCursor: null },
    { items: [], nextCursor: { endedAt: item().endedAt, matchId: id } },
    {
      items: [item()],
      nextCursor: { endedAt: item().endedAt, matchId: other },
    },
    { items: [item()], nextCursor: null, access_token: "private" },
    { items: Array.from({ length: 51 }, () => item()), nextCursor: null },
  ])("rejects malformed pages", async (page) => {
    await expect(fixture(page).client.list()).rejects.toThrow("Phản hồi");
  });
  it("sanitizes HTTP/network errors and never retries", async () => {
    const f = fixture();
    f.fetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          code: "HISTORY_RANKED_UNAVAILABLE",
          message: "private",
        }),
        { status: 503 },
      ),
    );
    await expect(f.client.list({ filter: "RANKED" })).rejects.toMatchObject({
      code: "HISTORY_RANKED_UNAVAILABLE",
      message: "Lịch sử Đánh Hạng chưa sẵn sàng.",
    });
    f.fetch.mockRejectedValueOnce(Error("secret"));
    await expect(f.client.list()).rejects.toThrow("Chưa thể");
    expect(f.fetch).toHaveBeenCalledTimes(2);
  });
  it("sanitizes unauthorized and unknown error code", async () => {
    const f = fixture();
    f.fetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ code: "private-user@example.invalid" }), {
        status: 401,
      }),
    );
    await expect(f.client.list()).rejects.toMatchObject({
      code: "HISTORY_UNAVAILABLE",
      status: 401,
      message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
    });
  });
});
