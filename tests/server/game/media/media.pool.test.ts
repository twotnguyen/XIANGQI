import { NestFactory } from "@nestjs/core";
import { Pool } from "pg";
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { transaction } from "@server/core/postgres.js";
import { PostgresLoginStore } from "@server/account/login/postgres-login-store.js";
import { SessionService } from "@server/account/login/session.service.js";
import type { SessionTokenVerifier } from "@server/account/login/login.types.js";
import {
  MEDIA_POOL_MAX,
  createMediaPool,
  createMediaRuntime,
} from "@server/game/media/media.module.js";
import { MediaAccess } from "@server/game/media/media.service.js";
import { MediaStore } from "@server/game/media/media.store.js";
import {
  actor,
  config,
  deferred,
  deliveredAt,
  makeRoom,
  pool,
  provider,
  queueRevoke,
  resetMediaSchema,
  seat,
  url,
} from "./media.test-helper.js";

afterAll(() => pool.end());

/** Room/game side pool: its own socket set that media must never borrow. */
let roomPool: Pool | null = null;
afterEach(async () => {
  await roomPool?.end();
  roomPool = null;
  vi.restoreAllMocks();
});

/** Number of distinct rooms, each with one seated player and one queued revoke. */
const REVOKE_ROOMS = 10;

/**
 * Yields to the event loop until pg-pool reports the state. Pool queue state has no event to
 * await, so this polls with setImmediate (no wall-clock duration) and fails after a fixed
 * iteration budget instead of spinning forever.
 */
async function until(condition: () => boolean) {
  for (let i = 0; i < 10000; i++) {
    if (condition()) return;
    await new Promise<void>((resolve) => setImmediate(resolve));
  }
  throw new Error("condition never reached");
}

const env = {
  LIVEKIT_URL: "wss://media.example.invalid",
  LIVEKIT_API_KEY: config.apiKey,
  LIVEKIT_API_SECRET: config.apiSecret,
};

/**
 * Real SessionService over the real Postgres login store. These tests never verify a token,
 * so the verifier fails loudly if anything reaches it.
 */
function sessionsFixture() {
  const verifier: SessionTokenVerifier = {
    verifyAccessToken: async () => {
      throw new Error("media pool tests do not verify tokens");
    },
  };
  return new SessionService(new PostgresLoginStore(pool), verifier);
}

describe.skipIf(!url)("media dedicated pool", () => {
  beforeEach(async () => {
    await resetMediaSchema();
    roomPool = new Pool({ connectionString: url, max: 2 });
  });

  it("keeps room DB checkouts available while every media connection is stalled on LiveKit", async () => {
    const owner = await actor();
    const unrelatedRoomId = await makeRoom(owner.userId);
    const revocations: { roomId: string; userId: string; eventId: string }[] =
      [];
    for (let i = 0; i < REVOKE_ROOMS; i++) {
      const user = await actor();
      const roomId = await makeRoom(owner.userId);
      await seat(roomId, user.userId, "RED");
      revocations.push({
        roomId,
        userId: user.userId,
        eventId: await queueRevoke(roomId, user.userId),
      });
    }
    const gate = deferred();
    const p = provider({ gate: gate.promise });
    const mediaPool = createMediaPool({ connectionString: url });
    const access = new MediaAccess(
      config,
      new MediaStore(mediaPool),
      p.fetchFn,
    );
    // Handlers attach immediately, so no revoke rejection can surface unobserved on any path.
    const outcomes = Promise.allSettled(
      revocations.map((r) => access.revoke(r.roomId, r.userId, r.eventId)),
    );
    try {
      // Every media connection is parked on a provider call; the other revokes queue in the media pool.
      await until(() => p.calls.length >= MEDIA_POOL_MAX);
      await until(
        () => mediaPool.waitingCount === REVOKE_ROOMS - MEDIA_POOL_MAX,
      );
      expect(mediaPool.totalCount).toBe(MEDIA_POOL_MAX);
      expect(p.calls).toHaveLength(MEDIA_POOL_MAX);

      // An unrelated room transaction completes while media is saturated.
      const roomRead = await transaction(roomPool!, async (client) => {
        const { rows } = await client.query<{ id: string }>(
          "SELECT id FROM public.rooms WHERE id=$1",
          [unrelatedRoomId],
        );
        return rows[0]?.id;
      });
      expect(roomRead).toBe(unrelatedRoomId);
      expect(roomPool!.totalCount).toBeGreaterThan(0);
      expect(mediaPool.totalCount).toBe(MEDIA_POOL_MAX);

      // Outbox events are acknowledged only after LiveKit releases the stalled calls.
      for (const r of revocations)
        expect(await deliveredAt(r.eventId)).toBeNull();

      gate.resolve();
      const results = await outcomes;
      expect(results.map((r) => r.status)).toEqual(
        revocations.map(() => "fulfilled"),
      );
      for (const r of revocations)
        expect(await deliveredAt(r.eventId)).not.toBeNull();
      // Each revocation removes the participant from both the private and stage rooms.
      expect(p.calls).toHaveLength(REVOKE_ROOMS * 2);
    } finally {
      gate.resolve();
      await outcomes;
      await mediaPool.end();
    }
  });

  it("reports pool-level errors with a sanitized code and keeps the process alive", async () => {
    const write = vi
      .spyOn(process.stderr, "write")
      .mockImplementation(() => true);
    const mediaPool = createMediaPool({
      connectionString: "postgresql://nobody:secret@127.0.0.1:1/none",
      connectionTimeoutMillis: 200,
    });
    try {
      // An idle-client error must be absorbed by the listener, not thrown as an unhandled 'error'.
      expect(() =>
        mediaPool.emit("error", new Error("password=secret")),
      ).not.toThrow();
      const logged = write.mock.calls.map((call) => String(call[0])).join("");
      expect(logged).toContain("media_pool_failed");
      expect(logged).not.toContain("secret");
      const access = new MediaAccess(config, new MediaStore(mediaPool));
      const failure = await access
        .getShare(
          "00000000-0000-0000-0000-000000000001",
          "00000000-0000-0000-0000-000000000002",
        )
        .then(
          () => null,
          (error: unknown) => error,
        );
      expect(failure).toBeInstanceOf(Error);
      expect(String((failure as Error).message)).not.toContain("secret");
    } finally {
      await mediaPool.end();
    }
  });

  it("serves queries over the registration connection and closes idempotently", async () => {
    const runtime = await createMediaRuntime(env, {
      connection: { connectionString: url },
      sessions: sessionsFixture(),
    });
    const owner = await actor();
    const roomId = await makeRoom(owner.userId);
    expect(await runtime!.access.getShare(owner.userId, roomId)).toEqual({
      level: "OPPONENT",
    });
    await Promise.all([runtime!.close(), runtime!.close()]);
    await runtime!.close();
    await expect(
      runtime!.access.getShare(owner.userId, roomId),
    ).rejects.toThrow();
  });

  it("closes the media pool through Nest module destruction", async () => {
    const runtime = await createMediaRuntime(env, {
      connection: { connectionString: url },
      sessions: sessionsFixture(),
    });
    const owner = await actor();
    const roomId = await makeRoom(owner.userId);
    const app = await NestFactory.createApplicationContext(runtime!.module, {
      logger: false,
    });
    expect(await runtime!.access.getShare(owner.userId, roomId)).toEqual({
      level: "OPPONENT",
    });
    await app.close();
    await expect(
      runtime!.access.getShare(owner.userId, roomId),
    ).rejects.toThrow();
    await runtime!.close();
  });
});
