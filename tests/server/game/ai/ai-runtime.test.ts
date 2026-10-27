import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createAiRuntime } from "@server/game/ai/ai-runtime.js";
import { AiReservations } from "@server/game/ai/ai-reservations.js";
import { SqlAiTransactions } from "@server/game/ai/ai-sql-transactions.js";
import type { AiEngine } from "@server/game/ai/ai-engine.js";
import type { SessionService } from "@server/account/login/session.service.js";
import { apply, databaseUrl, pool, reset } from "../room/room.test-helper.js";

const env = { ROOMS_ENABLED: "true", CORS_ORIGINS: "http://localhost:5173" };

// Engine seam: the compiled worker is covered by ai-engine tests; here we only need lifecycle calls.
function fakeEngine() {
  return {
    ready: vi.fn(async () => {}),
    search: vi.fn(() => new Promise(() => {})),
    close: vi.fn(async () => {}),
  };
}

// createAiRuntime only hands the session service to the authorizer; these tests never authenticate.
const sessions = {} as unknown as SessionService;

describe("createAiRuntime without a database", () => {
  it("returns null when rooms are disabled and never touches the pool or engine", async () => {
    const engine = fakeEngine();
    const query = vi.fn();
    const runtime = await createAiRuntime({
      env: { ROOMS_ENABLED: "false" },
      registration: { pool: { query } as never, sessions },
      engine: engine as unknown as AiEngine,
    });
    expect(runtime).toBeNull();
    expect(query).not.toHaveBeenCalled();
    expect(engine.ready).not.toHaveBeenCalled();
  });
});

describe.skipIf(!databaseUrl)("AI runtime lifecycle", () => {
  beforeEach(async () => {
    await pool.query(
      "DROP SCHEMA IF EXISTS xiangqi_ai CASCADE; DROP SCHEMA IF EXISTS xiangqi_chat CASCADE",
    );
    await reset();
    for (const suffix of [
      "06_rooms",
      "07_match_outcomes",
      "08_room_modes",
      "09_match_draw",
      "10_room_chat",
      "11_ai_reservations",
      "12_ai_presence",
    ])
      await apply(`supabase/migrations/202610110000${suffix}.sql`);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("refuses to build before the AI schema exists and creates neither boot nor engine", async () => {
    await pool.query("DROP SCHEMA xiangqi_ai CASCADE");
    const createBoot = vi.spyOn(AiReservations.prototype, "createBoot");
    const engine = fakeEngine();
    await expect(
      createAiRuntime({
        env,
        registration: { pool, sessions },
        engine: engine as unknown as AiEngine,
      }),
    ).rejects.toThrow("AI migration is not ready");
    expect(createBoot).not.toHaveBeenCalled();
    expect(engine.ready).not.toHaveBeenCalled();
    expect(engine.close).not.toHaveBeenCalled();
  });

  it("closes the engine when boot creation fails and surfaces the boot error", async () => {
    vi.spyOn(AiReservations.prototype, "createBoot").mockRejectedValueOnce(
      new Error("boot down"),
    );
    const engine = fakeEngine();
    await expect(
      createAiRuntime({
        env,
        registration: { pool, sessions },
        engine: engine as unknown as AiEngine,
      }),
    ).rejects.toThrow("boot down");
    expect(engine.close).toHaveBeenCalledTimes(1);
  });

  it("clears both runtime intervals on close, is idempotent, and rejects ready afterwards", async () => {
    const engine = fakeEngine();
    const setSpy = vi.spyOn(globalThis, "setInterval");
    const clearSpy = vi.spyOn(globalThis, "clearInterval");
    const runtime = await createAiRuntime({
      env,
      registration: { pool, sessions },
      engine: engine as unknown as AiEngine,
    });
    expect(runtime).not.toBeNull();
    await runtime!.start();
    await runtime!.ready();
    const timers = setSpy.mock.results.slice(-2).map((r) => r.value);
    expect(timers).toHaveLength(2);
    await runtime!.close();
    expect(clearSpy.mock.calls.map((c) => c[0])).toEqual(
      expect.arrayContaining(timers),
    );
    await runtime!.close();
    expect(engine.close).toHaveBeenCalledTimes(1);
    await expect(runtime!.ready()).rejects.toThrow("AI runtime is closed");
  });

  it("fences RAM once the boot lease lapses and never revives it on a later heartbeat", async () => {
    vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
    const heartbeat = vi.spyOn(AiReservations.prototype, "heartbeat");
    const engine = fakeEngine();
    const runtime = await createAiRuntime({
      env,
      registration: { pool, sessions },
      engine: engine as unknown as AiEngine,
    });
    await runtime!.start();
    await runtime!.ready();
    // Lease is 60s measured from the last successful heartbeat; jump past it without a beat.
    vi.setSystemTime(Date.now() + 61_000);
    await expect(runtime!.ready()).rejects.toThrow("AI boot lease expired");
    // The interval beat still calls heartbeat, but success after a lapse must not lift the fence.
    vi.advanceTimersByTime(20_000);
    await vi.waitFor(() => expect(heartbeat).toHaveBeenCalledTimes(2));
    await heartbeat.mock.results[1]!.value;
    await expect(runtime!.ready()).rejects.toThrow("AI boot lease expired");
    await runtime!.close();
  });

  it("surfaces a heartbeat failure through ready", async () => {
    vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
    const heartbeat = vi.spyOn(AiReservations.prototype, "heartbeat");
    const engine = fakeEngine();
    const runtime = await createAiRuntime({
      env,
      registration: { pool, sessions },
      engine: engine as unknown as AiEngine,
    });
    await runtime!.start();
    await runtime!.ready();
    heartbeat.mockRejectedValueOnce(new Error("heartbeat down"));
    vi.advanceTimersByTime(20_000);
    await vi.waitFor(() => expect(heartbeat).toHaveBeenCalledTimes(2));
    await heartbeat.mock.results[1]!.value.catch(() => {});
    await expect(runtime!.ready()).rejects.toThrow("heartbeat down");
    await runtime!.close();
  });

  it("collects a sweep failure instead of swallowing it and reports it through ready", async () => {
    const engine = fakeEngine();
    const runtime = await createAiRuntime({
      env,
      registration: { pool, sessions },
      engine: engine as unknown as AiEngine,
    });
    // One expired reservation row forces the sweep to run its per-row transaction, which fails.
    vi.spyOn(AiReservations.prototype, "expired").mockResolvedValueOnce([
      {
        gameId: "00000000-0000-4000-8000-000000000001",
        bootId: "00000000-0000-4000-8000-000000000002",
        ownerId: "00000000-0000-4000-8000-000000000003",
        cursor: {
          leaseMilliseconds: "0",
          gameId: "00000000-0000-4000-8000-000000000001",
        },
      } as never,
    ]);
    vi.spyOn(SqlAiTransactions.prototype, "run").mockRejectedValueOnce(
      new Error("sweep down"),
    );
    await runtime!.start();
    await expect(runtime!.ready()).rejects.toThrow("sweep down");
    await runtime!.close();
  });
});
