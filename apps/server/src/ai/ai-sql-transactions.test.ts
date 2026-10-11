import { createHash, randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { apply, databaseUrl, pool, reset } from "../room/room.test-helper.js";
import { RoomTransactions } from "../room/room-transactions.js";
import { PostgresMemberRoomAuthorizer } from "../room/member-room-auth.js";
import { SessionService } from "../login/session.service.js";
import { PostgresLoginStore } from "../login/postgres-login-store.js";
import { AiPresence } from "./ai-presence.js";
import { AiReservations } from "./ai-reservations.js";
import { AiHistoryStore } from "./ai-history-store.js";
import { SqlAiTransactions } from "./ai-sql-transactions.js";
import type { AiOrigin } from "./ai-transactions.js";
import { AiGames } from "./ai-games.js";
import type { EngineWorker } from "@xiangqi/engine";
import { RoomRosterChanged } from "../room/contracts.js";
import type { PoolClient } from "pg";

const coordinator = new RoomTransactions(pool);
const reservations = new AiReservations();
const history = new AiHistoryStore(reservations);
const hash = (v: string) => createHash("sha256").update(v).digest("hex");
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => (resolve = r));
  return { promise, resolve };
}
async function fixture() {
  const ownerId = randomUUID(),
    now = new Date();
  const email = ownerId + "@example.invalid";
  await pool.query(
    "INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,$2,$3)",
    [ownerId, email, now],
  );
  await pool.query(
    "INSERT INTO public.profiles(user_id,username,display_name,completed_at,registration_pending) VALUES($1,$2,'Synthetic AI member',$3,false)",
    [ownerId, "m" + ownerId.replaceAll("-", "").slice(0, 18), now],
  );
  const provider = {
    signInPassword: vi.fn(),
    getUser: vi.fn(async () => ({
      id: ownerId,
      email,
      email_confirmed_at: now.toISOString(),
    })),
  };
  const sessions = new SessionService(new PostgresLoginStore(pool), provider);
  const issued = await sessions.issue(ownerId, false);
  const authorizer = new PostgresMemberRoomAuthorizer(sessions);
  const origin: Extract<AiOrigin, { kind: "human" }> = {
    kind: "human",
    proof: { accessToken: "synthetic-ai-token", appSession: issued.appSession },
    tab: { tabId: randomUUID(), connectionId: randomUUID(), generation: 1 },
  };
  const client = await pool.connect();
  let boot;
  try {
    await client.query("BEGIN; SET LOCAL ROLE app_server");
    boot = await reservations.createBoot(client);
    await client.query("COMMIT");
  } finally {
    await client.query("ROLLBACK");
    client.release();
  }
  const presence = new AiPresence(boot.id, reservations);
  const actor = await authorizer.resolve(origin.proof);
  const attached = await coordinator.withRoom(
    { actor, roomIds: [] },
    (p) => authorizer.authorize(origin.proof, p),
    (scope) => presence.attach(scope, origin.tab),
  );
  if (attached.status !== "active") throw Error("synthetic fixture ended");
  origin.tab.generation = attached.value.control.generation;
  // Spy around the actual SQL presence port; only provider/transport identity is synthetic.
  const control = {
    authorize: vi.fn((...args: Parameters<AiPresence["authorize"]>) =>
      presence.authorize(...args),
    ),
    bindGame: vi.fn((...args: Parameters<AiPresence["bindGame"]>) =>
      presence.bindGame(...args),
    ),
    assertRetained: vi.fn((...args: Parameters<AiPresence["assertRetained"]>) =>
      presence.assertRetained(...args),
    ),
  };
  const runner = new SqlAiTransactions({
    coordinator,
    authorizer,
    reservations,
    history,
    bootId: boot.id,
    control,
  });
  return { ownerId, origin, provider, boot, runner, control, presence, actor };
}
afterAll(() => pool.end());
describe.skipIf(!databaseUrl)(
  "AI SQL authority and post-commit RAM installation",
  () => {
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
    it("commits a real reservation before installing RAM and runs provider outside actor locks", async () => {
      const f = await fixture(),
        gameId = randomUUID();
      const install = vi.fn();
      f.provider.getUser.mockImplementation(async () => {
        const c = await pool.connect();
        try {
          await c.query("BEGIN");
          expect(
            (
              await c.query(
                "SELECT pg_try_advisory_xact_lock(hashtextextended($1,0)) AS ok",
                ["actor:" + f.ownerId],
              )
            ).rows[0].ok,
          ).toBe(true);
        } finally {
          await c.query("ROLLBACK");
          c.release();
        }
        return {
          id: f.ownerId,
          email: f.ownerId + "@example.invalid",
          email_confirmed_at: new Date().toISOString(),
        };
      });
      const value = await f.runner.run(f.ownerId, f.origin, async (tx) => {
        await tx.reserve(gameId);
        expect(install).not.toHaveBeenCalled();
        expect(
          (
            await pool.query(
              "SELECT count(*)::int n FROM public.active_players WHERE user_id=$1",
              [f.ownerId],
            )
          ).rows[0].n,
        ).toBe(0);
        return { value: gameId, install };
      });
      expect(value).toBe(gameId);
      expect(install).toHaveBeenCalledOnce();
      expect(
        (
          await pool.query(
            "SELECT ai_game_id FROM public.active_players WHERE user_id=$1",
            [f.ownerId],
          )
        ).rows[0].ai_game_id,
      ).toBe(gameId);
      expect(f.control.authorize).toHaveBeenCalledTimes(2);
    });
    it("rolls back a staged reservation and never installs failed work", async () => {
      const f = await fixture(),
        install = vi.fn();
      await expect(
        f.runner.run(f.ownerId, f.origin, async (tx) => {
          await tx.reserve(randomUUID());
          throw new Error("synthetic transaction failure");
          return { value: 0, install };
        }),
      ).rejects.toThrow("synthetic transaction failure");
      expect(install).not.toHaveBeenCalled();
      expect(
        (await pool.query("SELECT count(*)::int n FROM public.active_players"))
          .rows[0].n,
      ).toBe(0);
    });
    it("rejects a forged owner before mutation", async () => {
      const f = await fixture(),
        work = vi.fn();
      await expect(
        f.runner.run(randomUUID(), f.origin, work),
      ).rejects.toMatchObject({ code: "AI_FORBIDDEN" });
      expect(work).not.toHaveBeenCalled();
    });
    it("rejects a missing control proof before invoking work", async () => {
      const f = await fixture(),
        work = vi.fn();
      f.control.authorize.mockRejectedValueOnce(new Error("TAB_READ_ONLY"));
      await expect(f.runner.run(f.ownerId, f.origin, work)).rejects.toThrow(
        "TAB_READ_ONLY",
      );
      expect(work).not.toHaveBeenCalled();
    });
    it("checks session revocation again before committing a staged install", async () => {
      const f = await fixture(),
        install = vi.fn();
      // Same client can revoke its locked synthetic session; no second pool deadlock.
      f.control.authorize.mockImplementationOnce(async (scope) => {
        await scope.client.query(
          "UPDATE xiangqi_auth.app_sessions SET revoked_at=clock_timestamp() WHERE token_hash=$1",
          [hash(f.origin.kind === "human" ? f.origin.proof.appSession : "")],
        );
      });
      await expect(
        f.runner.run(f.ownerId, f.origin, async (tx) => {
          await tx.reserve(randomUUID());
          return { value: 1, install };
        }),
      ).rejects.toMatchObject({ code: "AUTH_REQUIRED" });
      expect(install).not.toHaveBeenCalled();
      expect(
        (await pool.query("SELECT count(*)::int n FROM public.active_players"))
          .rows[0].n,
      ).toBe(0);
    });
    it("drops an expired boot after staged work without installing or reserving", async () => {
      const f = await fixture(),
        install = vi.fn();
      await pool.query(
        "UPDATE xiangqi_ai.boots SET lease_until=clock_timestamp()+interval '200 milliseconds' WHERE id=$1",
        [f.boot.id],
      );
      await expect(
        f.runner.run(f.ownerId, f.origin, async (tx) => {
          await tx.reserve(randomUUID());
          await new Promise((r) => setTimeout(r, 260));
          return { value: 1, install };
        }),
      ).rejects.toMatchObject({ code: "AI_BOOT_EXPIRED" });
      expect(install).not.toHaveBeenCalled();
      expect(
        (await pool.query("SELECT count(*)::int n FROM public.active_players"))
          .rows[0].n,
      ).toBe(0);
    });
    it("does not install RAM before actual COMMIT completes", async () => {
      const f = await fixture(),
        install = vi.fn(),
        reached = deferred(),
        release = deferred();
      const gameId = randomUUID();
      await f.runner.run(f.ownerId, f.origin, async (tx) => {
        await tx.reserve(gameId);
        return { value: 0, install: () => {} };
      });
      const c = await pool.connect(),
        query = c.query.bind(c);
      const querySpy = vi.spyOn(c, "query").mockImplementation((async (
        text: string,
        values?: unknown[],
      ) => {
        if (text === "COMMIT") {
          reached.resolve();
          await release.promise;
        }
        return query(text, values);
      }) as typeof c.query);
      const connect = vi
        .spyOn(pool as unknown as { connect(): Promise<PoolClient> }, "connect")
        .mockResolvedValueOnce(c);
      const pending = f.runner.run(
        f.ownerId,
        { kind: "internal" },
        async (tx) => {
          await tx.check(gameId);
          return { value: 1, install };
        },
      );
      try {
        await reached.promise;
        expect(install).not.toHaveBeenCalled();
        release.resolve();
        expect(await pending).toBe(1);
        expect(install).toHaveBeenCalledOnce();
      } finally {
        release.resolve();
        connect.mockRestore();
        querySpy.mockRestore();
      }
    });
    it.each([false, true])(
      "serializes private reads through the post-COMMIT RAM gap (expires while waiting: %s)",
      async (expires) => {
        const f = await fixture(),
          gameId = randomUUID();
        let ram = 0;
        await f.runner.run(f.ownerId, f.origin, async (tx) => {
          await tx.reserve(gameId);
          return { value: 0, install: () => {} };
        });
        if (expires)
          await pool.query(
            "UPDATE xiangqi_auth.app_sessions SET created_at=statement_timestamp()-interval '12 hours'+interval '2 seconds',expires_at=statement_timestamp()+interval '2 seconds' WHERE token_hash=$1",
            [hash(f.origin.proof.appSession)],
          );
        const reached = deferred(),
          release = deferred();
        const c = await pool.connect(),
          query = c.query.bind(c);
        const querySpy = vi.spyOn(c, "query").mockImplementation((async (
          text: string,
          values?: unknown[],
        ) => {
          const result = await query(text, values);
          // SQL has committed and released actor locks, but the runner has not installed RAM.
          if (text === "COMMIT") {
            reached.resolve();
            await release.promise;
          }
          return result;
        }) as typeof c.query);
        const connect = vi
          .spyOn(
            pool as unknown as { connect(): Promise<PoolClient> },
            "connect",
          )
          .mockResolvedValueOnce(c);
        const mutation = f.runner.run(
          f.ownerId,
          { kind: "internal" },
          async (tx) => {
            await tx.check(gameId);
            return {
              value: 1,
              install: () => {
                ram = 1;
              },
            };
          },
        );
        const work = vi.fn(async () => ram);
        let read: Promise<{ value?: number; error?: unknown }> | undefined;
        try {
          await reached.promise;
          expect(ram).toBe(0);
          read = f.runner.read(f.origin.proof, work).then(
            (value) => ({ value }),
            (error: unknown) => ({ error }),
          );
          // This real SQL transaction passed its first dual-authority check and now awaits
          // the process-local owner gate; it is no longer waiting on an actor SQL lock.
          await vi.waitFor(async () => {
            const rows = await pool.query(
              "SELECT count(*)::int n FROM pg_stat_activity WHERE datname=current_database() AND state='idle in transaction' AND query LIKE 'SELECT (expires_at>clock_timestamp()%'",
            );
            expect(rows.rows[0].n).toBe(1);
          });
          expect(work.mock.calls.length).toBe(0);
          if (expires)
            await pool.query(
              "SELECT pg_sleep(GREATEST(0,EXTRACT(EPOCH FROM expires_at-clock_timestamp()))+0.02) FROM xiangqi_auth.app_sessions WHERE token_hash=$1",
              [hash(f.origin.proof.appSession)],
            );
          release.resolve();
          expect(await mutation).toBe(1);
          const result = await read;
          if (expires) {
            expect(result.error).toMatchObject({
              code: "AUTH_REQUIRED",
              status: 401,
            });
            expect(work.mock.calls.length).toBe(0);
            // Failed post-gate authorization releases the gate for a later valid read.
            await pool.query(
              "UPDATE xiangqi_auth.app_sessions SET created_at=statement_timestamp(),expires_at=statement_timestamp()+interval '12 hours' WHERE token_hash=$1",
              [hash(f.origin.proof.appSession)],
            );
            expect(await f.runner.read(f.origin.proof, work)).toBe(1);
          } else {
            expect(result).toEqual({ value: 1 });
            expect(work).toHaveBeenCalledOnce();
          }
        } finally {
          release.resolve();
          await mutation;
          await read;
          connect.mockRestore();
          querySpy.mockRestore();
        }
      },
    );
    it("requires a real SQL reservation/history authority operation", async () => {
      const f = await fixture(),
        install = vi.fn();
      await expect(
        f.runner.run(f.ownerId, { kind: "internal" }, async () => ({
          value: 1,
          install,
        })),
      ).rejects.toMatchObject({ code: "AI_AUTHORITY_REQUIRED" });
      expect(install).not.toHaveBeenCalled();
    });
    it("releases the gate when initial control authorization requests a roster retry", async () => {
      const f = await fixture(),
        install = vi.fn();
      f.control.authorize.mockRejectedValueOnce(
        new RoomRosterChanged([f.ownerId]),
      );
      expect(
        await f.runner.run(f.ownerId, f.origin, async (tx) => {
          await tx.reserve(randomUUID());
          return { value: 1, install };
        }),
      ).toBe(1);
      expect(install).toHaveBeenCalledOnce();
      expect(f.control.authorize).toHaveBeenCalledTimes(3);
    });
    it("rolls back a failed COMMIT and releases the owner gate for a later admission", async () => {
      const f = await fixture(),
        install = vi.fn();
      const gameId = randomUUID();
      await f.runner.run(f.ownerId, f.origin, async (tx) => {
        await tx.reserve(gameId);
        return { value: 0, install: () => {} };
      });
      const c = await pool.connect(),
        query = c.query.bind(c);
      let failed = false;
      const querySpy = vi.spyOn(c, "query").mockImplementation((async (
        text: string,
        values?: unknown[],
      ) => {
        if (text === "COMMIT" && !failed) {
          failed = true;
          throw new Error("synthetic COMMIT failure");
        }
        return query(text, values);
      }) as typeof c.query);
      const connect = vi
        .spyOn(pool as unknown as { connect(): Promise<PoolClient> }, "connect")
        .mockResolvedValueOnce(c);
      try {
        await expect(
          f.runner.run(f.ownerId, { kind: "internal" }, async (tx) => {
            await tx.check(gameId);
            return { value: 1, install };
          }),
        ).rejects.toThrow("synthetic COMMIT failure");
      } finally {
        connect.mockRestore();
        querySpy.mockRestore();
      }
      expect(install).not.toHaveBeenCalled();
      expect(
        (await pool.query("SELECT count(*)::int n FROM public.active_players"))
          .rows[0].n,
      ).toBe(1);
      expect(
        await f.runner.run(f.ownerId, { kind: "internal" }, async (tx) => {
          await tx.check(gameId);
          return { value: 2, install };
        }),
      ).toBe(2);
      expect(install).toHaveBeenCalledOnce();
    });
    it("plays and finalizes a real SQL-backed AI game with one effective history", async () => {
      const f = await fixture();
      const engine: Pick<EngineWorker, "ready" | "search"> = {
        ready: async () => {},
        search: vi.fn(async () => ({
          move: { from: 27, to: 36 },
          terminal: null,
          completedDepth: 2,
          targetDepth: 2,
          timedOut: false,
          nodes: 1,
          elapsedMs: 1,
        })),
      };
      const games = new AiGames({ engine, transactions: f.runner });
      try {
        await games.ready();
        const initial = await games.create(
          f.ownerId,
          { requestedSide: "red", level: "easy" },
          f.origin,
        );
        await games.move(
          f.ownerId,
          initial.id,
          { version: initial.version, move: { from: 54, to: 45 } },
          f.origin,
        );
        await games.waitForEngine(f.ownerId, initial.id);
        const played = games.read(f.ownerId, initial.id);
        expect(played.history).toHaveLength(3);
        expect(played.engineState).toBe("IDLE");
        const finished = await games.resign(
          f.ownerId,
          initial.id,
          { version: played.version },
          f.origin,
        );
        expect(finished.status).toBe("FINISHED");
        expect(
          (
            await pool.query(
              "SELECT ply,status FROM public.matches WHERE id=$1",
              [initial.id],
            )
          ).rows[0],
        ).toEqual({ ply: 2, status: "FINISHED" });
        expect(
          (
            await pool.query(
              "SELECT count(*)::int n FROM public.active_players",
            )
          ).rows[0].n,
        ).toBe(0);
      } finally {
        await games.close();
      }
    });
    it("discards a delayed legal engine result after its real boot lease expires", async () => {
      const f = await fixture(),
        release = deferred();
      const engine: Pick<EngineWorker, "ready" | "search"> = {
        ready: async () => {},
        search: vi.fn(async () => {
          await release.promise;
          return {
            move: { from: 27, to: 36 },
            terminal: null,
            completedDepth: 2,
            targetDepth: 2,
            timedOut: false,
            nodes: 1,
            elapsedMs: 1,
          };
        }),
      };
      const games = new AiGames({ engine, transactions: f.runner });
      try {
        await games.ready();
        const initial = await games.create(
          f.ownerId,
          { requestedSide: "red", level: "easy" },
          f.origin,
        );
        await games.move(
          f.ownerId,
          initial.id,
          { version: initial.version, move: { from: 54, to: 45 } },
          f.origin,
        );
        const before = games.read(f.ownerId, initial.id);
        await pool.query(
          "UPDATE xiangqi_ai.boots SET lease_until=clock_timestamp()-interval '1 millisecond' WHERE id=$1",
          [f.boot.id],
        );
        release.resolve();
        await games.waitForEngine(f.ownerId, initial.id);
        expect(games.read(f.ownerId, initial.id)).toEqual(before);
        expect(
          (await pool.query("SELECT count(*)::int n FROM public.matches"))
            .rows[0].n,
        ).toBe(0);
      } finally {
        release.resolve();
        await games.close();
      }
    });

    it("rejects internal admission instead of minting synthetic physical control", async () => {
      const f = await fixture(),
        install = vi.fn();
      await expect(
        f.runner.run(f.ownerId, { kind: "internal" }, async (tx) => {
          await tx.reserve(randomUUID());
          return { value: 1, install };
        }),
      ).rejects.toMatchObject({ status: 403 });
      expect(install).not.toHaveBeenCalled();
      expect(
        (await pool.query("SELECT count(*)::int n FROM public.active_players"))
          .rows[0].n,
      ).toBe(0);
    });
    it("rejects admission without a physical attached controller", async () => {
      const f = await fixture(),
        install = vi.fn();
      await coordinator.withRoom(
        { actor: f.actor, roomIds: [] },
        async () => ({ status: "active", actor: f.actor }),
        (scope) =>
          f.presence.disconnected(scope, { ...f.origin.tab, gameId: null }),
      );
      await expect(
        f.runner.run(f.ownerId, f.origin, async (tx) => {
          await tx.reserve(randomUUID());
          return { value: 1, install };
        }),
      ).rejects.toMatchObject({ code: "TAB_READ_ONLY" });
      expect(install).not.toHaveBeenCalled();
    });
    it("blocks an internal engine check after the fixed thirty-minute physical grace expires", async () => {
      const f = await fixture(),
        id = randomUUID(),
        install = vi.fn();
      await f.runner.run(f.ownerId, f.origin, async (tx) => {
        await tx.reserve(id);
        return { value: id, install: () => {} };
      });
      await coordinator.withRoom(
        { actor: f.actor, roomIds: [] },
        async () => ({ status: "active", actor: f.actor }),
        (scope) =>
          f.presence.disconnected(scope, { ...f.origin.tab, gameId: id }),
      );
      await pool.query(
        "UPDATE xiangqi_ai.presence SET disconnected_at=clock_timestamp()-interval '30 minutes' WHERE game_id=$1",
        [id],
      );
      await expect(
        f.runner.run(f.ownerId, { kind: "internal" }, async (tx) => {
          await tx.check(id);
          return { value: 1, install };
        }),
      ).rejects.toMatchObject({ code: "AI_GAME_EXPIRED" });
      expect(install).not.toHaveBeenCalled();
    });

    it("checks retained deadline again after internal staged work, not only at entry", async () => {
      const f = await fixture(),
        id = randomUUID(),
        install = vi.fn();
      await f.runner.run(f.ownerId, f.origin, async (tx) => {
        await tx.reserve(id);
        return { value: 1, install: () => {} };
      });
      await coordinator.withRoom(
        { actor: f.actor, roomIds: [] },
        async () => ({ status: "active", actor: f.actor }),
        (s) => f.presence.disconnected(s, { ...f.origin.tab, gameId: id }),
      );
      await pool.query(
        "UPDATE xiangqi_ai.presence SET disconnected_at=clock_timestamp()-interval '30 minutes'+interval '200 milliseconds' WHERE game_id=$1",
        [id],
      );
      await expect(
        f.runner.run(f.ownerId, { kind: "internal" }, async (tx) => {
          await tx.check(id);
          await new Promise((r) => setTimeout(r, 260));
          return { value: 1, install };
        }),
      ).rejects.toMatchObject({ code: "AI_GAME_EXPIRED" });
      expect(install).not.toHaveBeenCalled();
    });
    it("rejects superseded physical generation even with valid owner session", async () => {
      const f = await fixture(),
        next = { tabId: randomUUID(), connectionId: randomUUID() };
      await coordinator.withRoom(
        { actor: f.actor, roomIds: [] },
        async () => ({ status: "active", actor: f.actor }),
        (s) => f.presence.attach(s, next),
      );
      const work = vi.fn();
      await expect(
        f.runner.run(f.ownerId, f.origin, work),
      ).rejects.toMatchObject({ code: "TAB_READ_ONLY" });
      expect(work).not.toHaveBeenCalled();
      const oldgen = {
        ...f.origin,
        tab: {
          tabId: next.tabId,
          connectionId: next.connectionId,
          generation: 1,
        },
      };
      await expect(f.runner.run(f.ownerId, oldgen, work)).rejects.toMatchObject(
        { code: "TAB_READ_ONLY" },
      );
    });
    it("finishes an existing authorized FINALIZING outcome internally after physical grace expiry", async () => {
      const f = await fixture(),
        engine: Pick<EngineWorker, "ready" | "search"> = {
          ready: async () => {},
          search: vi.fn(),
        };
      const games = new AiGames({ engine, transactions: f.runner });
      const finish = vi.spyOn(history, "finish");
      try {
        await games.ready();
        const g = await games.create(
          f.ownerId,
          { requestedSide: "red", level: "easy" },
          f.origin,
        );
        finish.mockRejectedValueOnce(Error("synthetic history failure"));
        await expect(
          games.resign(f.ownerId, g.id, { version: g.version }, f.origin),
        ).rejects.toMatchObject({ code: "AI_UNAVAILABLE" });
        const pending = games.read(f.ownerId, g.id);
        expect(pending.status).toBe("FINALIZING");
        await coordinator.withRoom(
          { actor: f.actor, roomIds: [] },
          async () => ({ status: "active", actor: f.actor }),
          (s) => f.presence.disconnected(s, { ...f.origin.tab, gameId: g.id }),
        );
        await pool.query(
          "UPDATE xiangqi_ai.presence SET disconnected_at=clock_timestamp()-interval '31 minutes' WHERE game_id=$1",
          [g.id],
        );
        const terminal = await games.retry(
          f.ownerId,
          g.id,
          { version: pending.version },
          { kind: "internal" },
        );
        expect(terminal.status).toBe("FINISHED");
        expect(terminal.outcome).toEqual({ reason: "RESIGN", winner: "black" });
        expect(
          (
            await pool.query("SELECT outcome FROM public.matches WHERE id=$1", [
              g.id,
            ])
          ).rows[0].outcome.reason,
        ).toBe("RESIGN");
        expect(
          (
            await pool.query(
              "SELECT count(*)::int n FROM public.active_players",
            )
          ).rows[0].n,
        ).toBe(0);
      } finally {
        finish.mockRestore();
        await games.close();
      }
    });
    it("allows a noncontrolling member's private terminal read without creating a slot", async () => {
      const f = await fixture(),
        games = new AiGames({
          engine: { ready: async () => {}, search: vi.fn() },
          transactions: f.runner,
        });
      try {
        await games.ready();
        const g = await games.create(
          f.ownerId,
          { requestedSide: "red", level: "easy" },
          f.origin,
        );
        await games.resign(f.ownerId, g.id, { version: g.version }, f.origin);
        await coordinator.withRoom(
          { actor: f.actor, roomIds: [] },
          async () => ({ status: "active", actor: f.actor }),
          (s) =>
            f.presence.attach(s, {
              tabId: randomUUID(),
              connectionId: randomUUID(),
            }),
        );
        const value = await f.runner.read(
          f.origin.proof,
          async (_scope, owner) => games.read(owner, g.id),
        );
        expect(value.status).toBe("FINISHED");
        expect(
          (
            await pool.query(
              "SELECT count(*)::int n FROM public.active_players",
            )
          ).rows[0].n,
        ).toBe(0);
        await expect(
          f.runner.run(f.ownerId, f.origin, vi.fn()),
        ).rejects.toMatchObject({ code: "TAB_READ_ONLY" });
      } finally {
        await games.close();
      }
    });
  },
);
