import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { SessionService } from "@server/account/login/session.service.js";
import { PostgresLoginStore } from "@server/account/login/postgres-login-store.js";
import type { createRegistrationRuntime } from "@server/account/auth/registration.module.js";
import { createRoomRuntime } from "@server/game/game.runtime.js";
import type { RealtimePublisher } from "@server/game/realtime/gateway.js";
import { databaseUrl, pool, reset } from "../game/game.runtime.test-helper.js";

const env = { ROOMS_ENABLED: "true", AUTH_LOGIN_ENABLED: "true" };
type Registration = NonNullable<
  Awaited<ReturnType<typeof createRegistrationRuntime>>
>;

function registration(): Registration {
  const auth = { signInPassword: vi.fn(), getUser: vi.fn() };
  const sessions = new SessionService(new PostgresLoginStore(pool), auth);
  return { pool, sessions, auth } as unknown as Registration;
}

/** Chờ tới khi có thao tác xếp hàng trên bảng profiles: poll DB, không dùng timer. */
async function waitForQueuedProfilesAccess(): Promise<void> {
  for (let attempt = 0; attempt < 500; attempt += 1) {
    const queued = await pool.query(
      "SELECT 1 FROM pg_locks WHERE relation='public.profiles'::regclass AND NOT granted",
    );
    if (queued.rowCount) return;
  }
  throw new Error("Room operation never queued on profiles");
}

afterAll(() => pool.end());
describe.skipIf(!databaseUrl)("Room runtime drain ordering", () => {
  beforeEach(reset);

  it("drains an admitted in-flight operation before stop settles and refuses new work meanwhile", async () => {
    const runtime = await createRoomRuntime(env, registration());
    if (!runtime) throw new Error("Missing runtime");
    runtime.realtime.onAttached({
      publishChat: async () => undefined,
    } as unknown as RealtimePublisher);

    const blocker = await pool.connect();
    let blockerOpen = true;
    try {
      await blocker.query("BEGIN");
      await blocker.query(
        "LOCK TABLE public.profiles IN ACCESS EXCLUSIVE MODE",
      );
      const connection = {
        identity: {
          kind: "member",
          userId: "00000000-0000-4000-8000-000000000001",
        },
        proof: { appSession: "A".repeat(43) },
      } as unknown as Parameters<
        typeof runtime.realtime.identities.sessionActive
      >[0];

      const pending = runtime.realtime.identities
        .sessionActive(connection)
        .then(
          (value) => ({ ok: true as const, value }),
          (error: unknown) => ({ ok: false as const, error }),
        );
      await waitForQueuedProfilesAccess();

      let stopped = false;
      const stopping = runtime.stop().then(() => {
        stopped = true;
      });
      const refused = await runtime.realtime.identities
        .sessionActive(connection)
        .catch((error: unknown) => error);
      expect(refused).toBeInstanceOf(Error);
      expect((refused as Error).message).toBe(
        "Chưa thể xác thực phiên đăng nhập",
      );
      expect(stopped).toBe(false);

      await expect(createRoomRuntime(env, registration())).rejects.toThrow(
        "Game runtime is already active on another instance",
      );

      await blocker.query("ROLLBACK");
      blockerOpen = false;
      expect(await pending).toEqual({ ok: true, value: false });
      await stopping;
      expect(stopped).toBe(true);
    } finally {
      if (blockerOpen) await blocker.query("ROLLBACK").catch(() => undefined);
      blocker.release();
      await runtime.close();
    }

    const successor = await createRoomRuntime(env, registration());
    if (!successor) throw new Error("Missing successor runtime");
    await successor.close();
  });
});
