import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { Pool } from "pg";
import {
  acquireRuntimeLock,
  type RuntimeLock,
} from "@server/core/runtime-lock.js";
import { SessionService } from "@server/account/login/session.service.js";
import {
  createLoginPool,
  PostgresLoginStore,
} from "@server/account/login/postgres-login-store.js";
import type { createRegistrationRuntime } from "@server/account/auth/registration.module.js";
import { createRoomRuntime } from "@server/game/game.runtime.js";
import type { RealtimePublisher } from "@server/game/realtime/gateway.js";
import { databaseUrl, pool, reset } from "./game.runtime.test-helper.js";
const loginPool = createLoginPool({ connectionString: databaseUrl });

const env = { ROOMS_ENABLED: "true", AUTH_LOGIN_ENABLED: "true" };
type Registration = NonNullable<
  Awaited<ReturnType<typeof createRegistrationRuntime>>
>;

function registration(): Registration {
  const auth = { signInPassword: vi.fn(), verifyAccessToken: vi.fn() };
  const sessions = new SessionService(new PostgresLoginStore(loginPool), auth);
  return { pool, sessions, auth } as unknown as Registration;
}

async function bootAttached(context: Registration) {
  const runtime = await createRoomRuntime(env, context);
  if (!runtime) throw new Error("Missing runtime");
  runtime.realtime.onAttached({
    publishChat: async () => undefined,
  } as unknown as RealtimePublisher);
  return runtime;
}

afterAll(async () => {
  await pool.end();
  await loginPool.end();
});
describe.skipIf(!databaseUrl)("Room runtime single-active lock", () => {
  beforeEach(reset);

  it("refuses a second runtime on the same database and keeps the first runtime usable", async () => {
    const context = registration();
    const first = await bootAttached(context);
    try {
      await first.start();
      await expect(createRoomRuntime(env, context)).rejects.toThrow(
        "Game runtime is already active on another instance",
      );
      await expect(first.ready()).resolves.toBeUndefined();
      const lostState = await Promise.race([
        first.lost.then(() => "lost"),
        Promise.resolve("held"),
      ]);
      expect(lostState).toBe("held");
    } finally {
      await first.close();
    }
  });

  it("keeps lock ownership through stop so a successor is refused until close", async () => {
    const context = registration();
    const first = await bootAttached(context);
    try {
      await first.start();
      await first.stop();
      await expect(first.ready()).rejects.toBeInstanceOf(Error);
      await expect(createRoomRuntime(env, context)).rejects.toThrow(
        "Game runtime is already active on another instance",
      );
    } finally {
      await first.close();
    }

    const successor = await bootAttached(context);
    try {
      await successor.start();
      await expect(successor.ready()).resolves.toBeUndefined();
    } finally {
      await successor.close();
    }
  });

  it("lets a successor boot after the first runtime closes and reports not ready once closed", async () => {
    const context = registration();
    const first = await bootAttached(context);
    try {
      await first.start();
      await first.close();
      await expect(first.ready()).rejects.toBeInstanceOf(Error);
    } finally {
      await first.close();
    }

    const successor = await bootAttached(context);
    try {
      await successor.start();
      await expect(successor.ready()).resolves.toBeUndefined();
    } finally {
      await successor.close();
    }
  });

  it("releases the lock when boot fails so a successor can boot", async () => {
    const context = registration();
    // Real schema failure: the boot readiness probe requires FORCE RLS on public.moves.
    await pool.query("ALTER TABLE public.moves NO FORCE ROW LEVEL SECURITY");
    try {
      const probe = await pool.query<{ forced: boolean }>(
        "SELECT relforcerowsecurity AS forced FROM pg_class WHERE oid='public.moves'::regclass",
      );
      expect(probe.rows[0]?.forced).toBe(false);
      await expect(createRoomRuntime(env, context)).rejects.toBeInstanceOf(
        Error,
      );
    } finally {
      await pool.query("ALTER TABLE public.moves FORCE ROW LEVEL SECURITY");
    }

    const successor = await bootAttached(context);
    try {
      await successor.start();
      await expect(successor.ready()).resolves.toBeUndefined();
    } finally {
      await successor.close();
    }
  });

  it("fails readiness and frees the lock when the lock connection is lost", async () => {
    const context = registration();
    const first = await bootAttached(context);
    try {
      await first.start();
      await pool.query(
        "SELECT pg_terminate_backend(pid) FROM pg_locks WHERE locktype='advisory' AND granted AND pid<>pg_backend_pid()",
      );
      const lostError = await first.lost;
      expect(lostError).toBeInstanceOf(Error);
      await expect(first.ready()).rejects.toThrow("Room runtime lock was lost");
    } finally {
      await first.close();
    }

    const successor = await bootAttached(context);
    try {
      await successor.start();
      await expect(successor.ready()).resolves.toBeUndefined();
    } finally {
      await successor.close();
    }
  });

  it("reports not ready before start", async () => {
    const context = registration();
    const runtime = await bootAttached(context);
    try {
      await expect(runtime.ready()).rejects.toBeInstanceOf(Error);
    } finally {
      await runtime.close();
    }
  });

  it("holds a successor behind an AI leased transaction and denies new old-owner SQL", async () => {
    const room = await bootAttached(registration());
    const aiClient = await room.ownershipPool.connect();
    const successorPool = new Pool({ connectionString: databaseUrl, max: 1 });
    const events: string[] = [];
    let successorAcquired: Promise<RuntimeLock> | undefined;
    let aiReleased = false;
    let successor: RuntimeLock | undefined;
    try {
      await aiClient.query("BEGIN");
      await aiClient.query("SELECT 1");
      await pool.query(
        "SELECT pg_terminate_backend(l.pid) FROM pg_locks l WHERE l.locktype='advisory' AND l.granted AND l.classid=7204 AND l.objid=1 AND l.objsubid=2 AND l.pid<>pg_backend_pid()",
      );
      await room.lost;
      events.push("lost");
      successorAcquired = acquireRuntimeLock(successorPool).then((acquired) => {
        events.push("successor");
        return acquired;
      });
      for (let attempt = 0; attempt < 500; attempt += 1) {
        const queued = await pool.query(
          "SELECT 1 FROM pg_locks WHERE locktype='advisory' AND NOT granted",
        );
        if (queued.rowCount) break;
      }
      await expect(room.ownershipPool.query("SELECT 1")).rejects.toThrow(
        "Máy chủ phòng đang dừng",
      );
      await expect(room.ownershipPool.connect()).rejects.toThrow(
        "Máy chủ phòng đang dừng",
      );
      expect(events).toEqual(["lost"]);
      await aiClient.query("COMMIT");
      events.push("ai-committed");
      aiClient.release();
      aiReleased = true;
      events.push("ai-released");
      successor = await successorAcquired;
    } finally {
      if (!aiReleased) aiClient.release(true);
      successor ??= await successorAcquired?.catch(() => undefined);
      await successor?.release();
      await successorPool.end();
      await room.close();
    }
    expect(events).toEqual([
      "lost",
      "ai-committed",
      "ai-released",
      "successor",
    ]);
  });
});
