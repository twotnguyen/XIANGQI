import { createHash, randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { SessionService } from "../login/session.service.js";
import { PostgresLoginStore } from "../login/postgres-login-store.js";
import { PostgresMemberRoomAuthorizer } from "../room/member-room-auth.js";
import { RoomTransactions } from "../room/room-transactions.js";
import { RoomHttpService } from "../room/room-http.service.js";
import { RoomStore } from "../room/room-store.js";
import type { RealtimeConnection } from "./contracts.js";
import {
  MemberRealtimeIdentities,
  MemberRealtimeTransactions,
} from "./member-transactions.js";
import { databaseUrl, pool, reset } from "./member-transactions.test-helper.js";
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
async function setup() {
  const id = randomUUID(),
    email = `synthetic-${id}@example.invalid`,
    now = new Date();
  await pool.query(
    "INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,$2,$3)",
    [id, email, now],
  );
  await pool.query(
    "INSERT INTO public.profiles(user_id,username,display_name,completed_at,registration_pending) VALUES($1,$2,'Synthetic Member',$3,false)",
    [id, "m" + id.replaceAll("-", "").slice(0, 18), now],
  );
  const provider = {
    signInPassword: vi.fn(),
    getUser: vi.fn(async () => ({
      id,
      email,
      email_confirmed_at: now.toISOString(),
    })),
  };
  const sessions = new SessionService(new PostgresLoginStore(pool), provider),
    issued = await sessions.issue(id, false);
  const proof = {
    accessToken: "synthetic-bearer",
    appSession: issued.appSession,
  };
  const authorizer = new PostgresMemberRoomAuthorizer(sessions),
    coordinator = new RoomTransactions(pool),
    rooms = new RoomStore();
  const entry = await new RoomHttpService(
    rooms,
    coordinator,
    authorizer,
  ).create(proof, { commandId: randomUUID(), name: "Realtime Member" });
  provider.getUser.mockClear();
  const identities = new MemberRealtimeIdentities(authorizer),
    transactions = new MemberRealtimeTransactions(coordinator, authorizer);
  const identity = await identities.resolve(
    proof.accessToken,
    proof.appSession,
    proof,
  );
  const connection: RealtimeConnection = {
    identity,
    proof,
    roomId: entry.roomId,
    tabId: randomUUID(),
    connectionId: randomUUID(),
  };
  return {
    authorizer,
    id,
    proof,
    provider,
    identities,
    transactions,
    connection,
    rooms,
    coordinator,
  };
}
afterAll(() => pool.end());
describe.skipIf(!databaseUrl)(
  "member realtime transaction boundary with actual SQL",
  () => {
    beforeEach(reset);
    it("runs actual room ready on the same locked scope and destroys scope after commit", async () => {
      const m = await setup();
      let client!: PoolClient;
      await m.transactions.run(m.connection, async (c) => {
        client = c;
        const scope = m.transactions.getScope(
          c,
          m.connection.identity,
          m.connection.roomId,
        );
        expect(scope.lockedActorIds.has(m.id)).toBe(true);
        expect(scope.lockedRoomIds.has(m.connection.roomId)).toBe(true);
        await m.rooms.presence(
          scope,
          m.connection.roomId,
          {
            connectionId: m.connection.connectionId,
            generation: 1,
            serverInstance: randomUUID(),
          },
          true,
        );
        const view = await m.rooms.ready(scope, m.connection.roomId, true);
        expect(view.room.ready.red).toBe(true);
      });
      expect(() =>
        m.transactions.getScope(
          client,
          m.connection.identity,
          m.connection.roomId,
        ),
      ).toThrow();
      expect(m.provider.getUser).toHaveBeenCalledTimes(1);
      expect(
        (
          await pool.query(
            "SELECT ready FROM public.room_members WHERE room_id=$1 AND user_id=$2",
            [m.connection.roomId, m.id],
          )
        ).rows[0].ready,
      ).toBe(true);
    });
    it("rejects proof replacement, mutation, missing proof and copied identity with different actor", async () => {
      const m = await setup(),
        work = vi.fn();
      for (const connection of [
        { ...m.connection, proof: undefined },
        { ...m.connection, proof: { ...m.proof } },
        {
          ...m.connection,
          identity: { userId: randomUUID(), kind: "member" as const },
        },
        {
          ...m.connection,
          identity: { ...m.connection.identity, kind: "guest" as const },
        },
      ])
        await expect(
          m.transactions.run(connection, work),
        ).rejects.toMatchObject({ code: "AUTH_REQUIRED" });
      m.proof.accessToken = "changed";
      await expect(
        m.transactions.run(m.connection, work),
      ).rejects.toMatchObject({ code: "AUTH_REQUIRED" });
      expect(work).not.toHaveBeenCalled();
      expect(m.provider.getUser).toHaveBeenCalledTimes(1);
    });
    it("requires resolver exact strings and original proof object", async () => {
      const m = await setup();
      await expect(
        m.identities.resolve(m.proof.accessToken, m.proof.appSession),
      ).rejects.toMatchObject({ code: "AUTH_REQUIRED" });
      await expect(
        m.identities.resolve("other", m.proof.appSession, m.proof),
      ).rejects.toMatchObject({ code: "AUTH_REQUIRED" });
      expect(m.provider.getUser).toHaveBeenCalledTimes(1);
    });
    it("sanitizes provider outages without accepting a replacement proof", async () => {
      const m = await setup(),
        proof = { ...m.proof };
      m.provider.getUser.mockRejectedValueOnce(
        new Error("synthetic-private-provider-token"),
      );
      await expect(
        m.identities.resolve(proof.accessToken, proof.appSession, proof),
      ).rejects.toMatchObject({
        code: "REALTIME_UNAVAILABLE",
        message: "Chưa thể xác thực phiên đăng nhập",
      });
      await expect(
        m.transactions.run({ ...m.connection, proof }, vi.fn()),
      ).rejects.toMatchObject({ code: "AUTH_REQUIRED" });
    });
    it.each(["expiry", "revocation", "pending"])(
      "denies %s after resolution before any room work",
      async (change) => {
        const m = await setup(),
          work = vi.fn();
        if (change === "pending")
          await pool.query(
            "UPDATE public.profiles SET registration_pending=true WHERE user_id=$1",
            [m.id],
          );
        else
          await pool.query(
            change === "expiry"
              ? "WITH t AS (SELECT clock_timestamp() AS at) UPDATE xiangqi_auth.app_sessions SET created_at=t.at-interval '12 hours',expires_at=t.at FROM t WHERE token_hash=$1"
              : "UPDATE xiangqi_auth.app_sessions SET revoked_at=clock_timestamp() WHERE token_hash=$1",
            [hash(m.proof.appSession)],
          );
        await expect(
          m.transactions.run(m.connection, work),
        ).rejects.toMatchObject({ code: "AUTH_REQUIRED" });
        expect(work).not.toHaveBeenCalled();
      },
    );
    it("rolls back real mutation and erases scope after callback failure", async () => {
      const m = await setup();
      let client!: PoolClient;
      await expect(
        m.transactions.run(m.connection, async (c) => {
          client = c;
          m.transactions.getScope(
            c,
            m.connection.identity,
            m.connection.roomId,
          );
          await c.query(
            "UPDATE public.room_members SET ready=true WHERE room_id=$1 AND user_id=$2",
            [m.connection.roomId, m.id],
          );
          throw new Error("synthetic work failed");
        }),
      ).rejects.toThrow("synthetic work failed");
      expect(() =>
        m.transactions.getScope(
          client,
          m.connection.identity,
          m.connection.roomId,
        ),
      ).toThrow();
      expect(
        (
          await pool.query(
            "SELECT ready FROM public.room_members WHERE room_id=$1 AND user_id=$2",
            [m.connection.roomId, m.id],
          )
        ).rows[0].ready,
      ).toBe(false);
    });
    it("rejects a different client, actor or room inside work", async () => {
      const m = await setup(),
        other = await pool.connect();
      try {
        await m.transactions.run(m.connection, async (c) => {
          for (const args of [
            [other, m.connection.identity, m.connection.roomId],
            [c, { userId: randomUUID(), kind: "member" }, m.connection.roomId],
            [c, m.connection.identity, randomUUID()],
          ] as const)
            expect(() => m.transactions.getScope(...args)).toThrow();
        });
      } finally {
        other.release();
      }
    });
    it("commits ended authorization cleanup but denies room work", async () => {
      const m = await setup(),
        work = vi.fn();
      const original = m.authorizer.authorize.bind(m.authorizer);
      vi.spyOn(m.authorizer, "authorize").mockImplementation(
        async (_request, p) => {
          await original(m.proof, p);
          await p.client.query(
            "UPDATE public.room_members SET ready=true WHERE room_id=$1 AND user_id=$2",
            [m.connection.roomId, m.id],
          );
          return { status: "ended" };
        },
      );
      await expect(
        m.transactions.run(m.connection, work),
      ).rejects.toMatchObject({ code: "AUTH_REQUIRED" });
      expect(work).not.toHaveBeenCalled();
      expect(
        (
          await pool.query(
            "SELECT ready FROM public.room_members WHERE room_id=$1 AND user_id=$2",
            [m.connection.roomId, m.id],
          )
        ).rows[0].ready,
      ).toBe(true);
    });
    it("reauthorizes expiry after waiting for the actual room row lock", async () => {
      const m = await setup(),
        blocker = await pool.connect(),
        client = await pool.connect(),
        work = vi.fn();
      await pool.query(
        "WITH t AS (SELECT clock_timestamp()+interval '500 milliseconds' AS at) UPDATE xiangqi_auth.app_sessions SET created_at=t.at-interval '12 hours',expires_at=t.at FROM t WHERE token_hash=$1",
        [hash(m.proof.appSession)],
      );
      await blocker.query("BEGIN");
      await blocker.query(
        "SELECT id FROM public.rooms WHERE id=$1 FOR UPDATE",
        [m.connection.roomId],
      );
      let waiting!: () => void;
      const reached = new Promise<void>((r) => (waiting = r)),
        original = client.query.bind(client);
      const querySpy = vi.spyOn(client, "query").mockImplementation(((
        text: string,
        values?: unknown[],
      ) => {
        if (text.includes("public.rooms") && text.includes("FOR UPDATE"))
          waiting();
        return original(text, values);
      }) as typeof client.query);
      const connectSpy = vi
        .spyOn(pool, "connect")
        .mockResolvedValueOnce(client);
      const pending = m.transactions.run(m.connection, work),
        denied = expect(pending).rejects.toMatchObject({
          code: "AUTH_REQUIRED",
        });
      try {
        await reached;
        await blocker.query(
          "SELECT pg_sleep(GREATEST(0,EXTRACT(EPOCH FROM expires_at-clock_timestamp()))+0.005) FROM xiangqi_auth.app_sessions WHERE token_hash=$1",
          [hash(m.proof.appSession)],
        );
        await blocker.query("COMMIT");
        await denied;
      } finally {
        querySpy.mockRestore();
        connectSpy.mockRestore();
        await blocker.query("ROLLBACK");
        blocker.release();
      }
      expect(work).not.toHaveBeenCalled();
      expect(m.provider.getUser).toHaveBeenCalledTimes(1);
    });
  },
);
