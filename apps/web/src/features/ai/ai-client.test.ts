import { describe, expect, it, vi } from "vitest";
import { initialPosition, serializePosition } from "@xiangqi/xiangqi-core";
import { makeAiClient } from "./ai-client.js";
const id = "11111111-1111-4111-8111-111111111111";
const other = "22222222-2222-4222-8222-222222222222";
const fen = serializePosition(initialPosition());
function envelope() {
  return {
    snapshot: {
      id,
      requestedSide: "random",
      actualSide: "red",
      level: "easy",
      position: fen,
      history: [fen],
      version: 0,
      status: "ACTIVE",
      engineState: "IDLE",
      engineError: null,
      outcome: null,
    },
    serverNow: "2026-10-11T01:00:00.000Z",
    control: { mode: "controller", reason: null, generation: 1 },
  };
}
function fixture(value: unknown = envelope()) {
  const fetch = vi
    .fn()
    .mockImplementation(
      async () => new Response(JSON.stringify(value), { status: 200 }),
    );
  const getControl = vi.fn().mockResolvedValue({
    tabId: other,
    connectionId: "socket_abc",
    generation: 2,
  });
  return { fetch, getControl, client: makeAiClient(fetch, getControl) };
}
describe("AI REST client", () => {
  it("accepts no current game and sanitizes unknown HTTP errors", async () => {
    const f = fixture({ gameId: null });
    expect(await f.client.current()).toEqual({ gameId: null });
    f.fetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          code: "private-user@example.invalid",
          message: "private-capability",
        }),
        { status: 503 },
      ),
    );
    await expect(f.client.read(id)).rejects.toMatchObject({
      code: "AI_UNAVAILABLE",
      message: "Chưa thể thực hiện thao tác với máy. Vui lòng thử lại.",
    });
  });
  it.each([
    { level: "imaginary" },
    { requestedSide: "spectator" },
    { actualSide: "random" },
    { status: "PLAYING" },
    { engineState: "RUNNING" },
    { engineError: "secret" },
    { history: [fen + " "] },
    { outcome: { reason: "RESIGN", winner: null }, status: "FINISHED" },
    {
      outcome: { reason: "ENGINE_FAILURE", winner: null, secret: "private" },
      status: "FINISHED",
    },
  ])(
    "rejects invalid snapshot enums and noncanonical history",
    async (patch) => {
      const value = envelope();
      Object.assign(value.snapshot, patch);
      await expect(fixture(value).client.read(id)).rejects.toThrow("Phản hồi");
    },
  );
  it("reads current without controller proof and requires proof for snapshot", async () => {
    const f = fixture({ gameId: id });
    expect(await f.client.current()).toEqual({ gameId: id });
    expect(f.getControl).not.toHaveBeenCalled();
    f.fetch.mockResolvedValueOnce(new Response(JSON.stringify(envelope())));
    expect(await f.client.read(id)).toEqual(envelope());
    expect(f.fetch).toHaveBeenLastCalledWith(
      `/ai/${id}`,
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          "X-AI-Tab": other,
          "X-AI-Connection": "socket_abc",
          "X-AI-Generation": "2",
        }),
        redirect: "error",
      }),
    );
  });
  it("sends canonical create and versioned move, resign, retry only once", async () => {
    const f = fixture();
    await f.client.create({ level: "easy", requestedSide: "random" });
    await f.client.move(id, 0, { from: 54, to: 45 });
    await f.client.resign(id, 0);
    await f.client.retry(id, 0);
    expect(
      f.fetch.mock.calls.map((c) => [c[0], JSON.parse(c[1].body)]),
    ).toEqual([
      ["/ai", { level: "easy", requestedSide: "random" }],
      [`/ai/${id}/move`, { version: 0, move: { from: 54, to: 45 } }],
      [`/ai/${id}/resign`, { version: 0 }],
      [`/ai/${id}/retry`, { version: 0 }],
    ]);
    expect(f.getControl).toHaveBeenCalledTimes(4);
  });
  it.each(["read", "move", "resign"] as const)(
    "rejects wrong game ID on %s",
    async (method) => {
      const value = envelope();
      value.snapshot.id = other;
      const f = fixture(value);
      await expect(
        method === "read"
          ? f.client.read(id)
          : method === "move"
            ? f.client.move(id, 0, { from: 54, to: 45 })
            : f.client.resign(id, 0),
      ).rejects.toThrow("Phản hồi");
    },
  );
  it("allows a new game ID only for retry and create", async () => {
    const value = envelope();
    value.snapshot.id = other;
    const f = fixture(value);
    expect((await f.client.retry(id, 0)).snapshot.id).toBe(other);
    expect(
      (await f.client.create({ level: "hard", requestedSide: "black" }))
        .snapshot.id,
    ).toBe(other);
  });
  it.each([
    (v: ReturnType<typeof envelope>) =>
      Object.assign(v.snapshot, { ownerId: other }),
    (v: ReturnType<typeof envelope>) =>
      Object.assign(v, { privateToken: "secret" }),
    (v: ReturnType<typeof envelope>) => {
      v.snapshot.history = [];
    },
    (v: ReturnType<typeof envelope>) => {
      v.snapshot.position = "bad";
    },
    (v: ReturnType<typeof envelope>) => {
      v.snapshot.history = [fen.replace(" 0 1", " 1 1")];
    },
    (v: ReturnType<typeof envelope>) => {
      v.snapshot.version = -1;
    },
    (v: ReturnType<typeof envelope>) => {
      v.snapshot.version = Number.MAX_SAFE_INTEGER + 1;
    },
    (v: ReturnType<typeof envelope>) => {
      v.serverNow = "2026-02-30T01:00:00.000Z";
    },
    (v: ReturnType<typeof envelope>) => {
      v.serverNow = "2026-10-11T01:00:00+01:00";
    },
    (v: ReturnType<typeof envelope>) => {
      v.control.generation = 0;
    },
    (v: ReturnType<typeof envelope>) =>
      Object.assign(v.control, { mode: "readonly", reason: null }),
    (v: ReturnType<typeof envelope>) =>
      Object.assign(v.snapshot, { status: "FINISHED", outcome: null }),
    (v: ReturnType<typeof envelope>) =>
      Object.assign(v.snapshot, {
        outcome: { reason: "DRAW_NO_CAPTURE", winner: "red" },
      }),
  ])("rejects malformed/private responses", async (change) => {
    const value = envelope();
    change(value);
    await expect(fixture(value).client.read(id)).rejects.toThrow("Phản hồi");
  });
  it("accepts readonly and terminal safe DTO", async () => {
    const value = envelope();
    Object.assign(value.control, { mode: "readonly", reason: "other_tab" });
    Object.assign(value.snapshot, {
      status: "FINISHED",
      outcome: { reason: "RESIGN", winner: "black" },
    });
    expect(await fixture(value).client.read(id)).toEqual(value);
  });
  it("fails closed without valid controller proof before HTTP", async () => {
    const f = fixture();
    f.getControl.mockResolvedValue({
      tabId: id,
      connectionId: "",
      generation: 0,
    });
    await expect(f.client.read(id)).rejects.toThrow();
    expect(f.fetch).not.toHaveBeenCalled();
  });
  it("validates inputs before any auth/HTTP", async () => {
    const f = fixture();
    await expect(
      f.client.move("bad", 0, { from: 54, to: 45 }),
    ).rejects.toThrow();
    await expect(f.client.move(id, 0, { from: 54, to: 54 })).rejects.toThrow();
    await expect(f.client.resign(id, -1)).rejects.toThrow();
    await expect(
      f.client.resign(id, undefined as unknown as number),
    ).rejects.toThrow();
    expect(f.getControl).not.toHaveBeenCalled();
    expect(f.fetch).not.toHaveBeenCalled();
  });
  it("does not echo raw server errors or retry stale/lost ACK", async () => {
    const f = fixture();
    f.fetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ code: "VERSION_STALE", message: "secret" }),
        { status: 409 },
      ),
    );
    await expect(f.client.resign(id, 1)).rejects.toMatchObject({
      code: "VERSION_STALE",
      status: 409,
    });
    expect(f.fetch).toHaveBeenCalledTimes(1);
    f.fetch.mockRejectedValueOnce(Error("private network details"));
    await expect(f.client.move(id, 1, { from: 54, to: 45 })).rejects.toThrow(
      "Chưa thể",
    );
    expect(f.fetch).toHaveBeenCalledTimes(2);
  });
  it.each([{ gameId: "bad" }, { gameId: null, ownerId: other }])(
    "rejects malformed current",
    async (value) => {
      await expect(fixture(value).client.current()).rejects.toThrow("Phản hồi");
    },
  );
});
