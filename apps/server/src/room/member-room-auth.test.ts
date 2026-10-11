import { createHash, randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { LoginError } from "../login/contracts.js";
import { RegistrationError } from "../auth/contracts.js";
import { SessionService } from "../login/session.service.js";
import { PostgresLoginStore } from "../login/postgres-login-store.js";
import { RoomHttpService } from "./room-http.service.js";
import { RoomStore } from "./room-store.js";
import { RoomTransactions, type RoomActorProof } from "./room-transactions.js";
import { PostgresMemberRoomAuthorizer } from "./member-room-auth.js";
import { databaseUrl, pool, reset } from "./room-transactions.test-helper.js";
const coordinator = new RoomTransactions(pool),
  rooms = new RoomStore();
const hash = (cap: string) => createHash("sha256").update(cap).digest("hex");
async function member() {
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
  const sessions = new SessionService(new PostgresLoginStore(pool), provider);
  const issued = await sessions.issue(id, false),
    proof = { accessToken: "synthetic-bearer", appSession: issued.appSession };
  const authorizer = new PostgresMemberRoomAuthorizer(sessions);
  return { id, provider, sessions, proof, authorizer };
}
async function tryActor(id: string) {
  const c = await pool.connect();
  try {
    await c.query("BEGIN");
    return (
      await c.query(
        "SELECT pg_try_advisory_xact_lock(hashtextextended($1,0)) AS acquired",
        ["actor:" + id],
      )
    ).rows[0].acquired;
  } finally {
    await c.query("ROLLBACK");
    c.release();
  }
}
afterAll(() => pool.end());
describe.skipIf(!databaseUrl)(
  "member room authorization with real local SQL",
  () => {
    beforeEach(reset);
    it("runs provider outside locks then checks authoritative sameclient cap/profile and creates actual room", async () => {
      const m = await member();
      m.provider.getUser.mockImplementation(async () => {
        expect(await tryActor(m.id)).toBe(true);
        return {
          id: m.id,
          email: `synthetic-${m.id}@example.invalid`,
          email_confirmed_at: new Date().toISOString(),
        };
      });
      const actor = await m.authorizer.resolve(m.proof);
      expect(actor).toEqual({ userId: m.id, kind: "member" });
      const poolCall = vi.spyOn(m.sessions.store, "sessionByHash");
      const accountCall = vi.spyOn(m.sessions.store, "accountById");
      const result = await coordinator.withRoom(
        { actor, roomIds: [] },
        async (p) => {
          expect(await tryActor(m.id)).toBe(false);
          const result = await m.authorizer.authorize(m.proof, p);
          expect(result).toEqual({ status: "active", actor });
          return result;
        },
        (s) =>
          rooms.create(s, { commandId: randomUUID(), name: "Member Room" }),
      );
      expect(result.status).toBe("active");
      expect(m.provider.getUser).toHaveBeenCalledTimes(1);
      expect(poolCall).not.toHaveBeenCalled();
      expect(accountCall).not.toHaveBeenCalled();
    });
    it("reuses the same resolved proof across actual two-transaction code lookup and room join", async () => {
      const owner = await member(),
        joiner = await member();
      const ownerService = new RoomHttpService(
        rooms,
        coordinator,
        owner.authorizer,
      );
      const entry = await ownerService.create(owner.proof, {
        commandId: randomUUID(),
        name: "Two TX room",
      });
      const joinService = new RoomHttpService(
        rooms,
        coordinator,
        joiner.authorizer,
      );
      const joined = await joinService.join(joiner.proof, {
        commandId: randomUUID(),
        code: entry.inviteCode!,
        preference: "play",
      });
      expect(joined).toMatchObject({ roomId: entry.roomId, role: "black" });
      expect(joiner.provider.getUser).toHaveBeenCalledTimes(1);
      expect(
        (
          await pool.query(
            "SELECT count(*)::int AS n FROM public.room_members WHERE room_id=$1",
            [entry.roomId],
          )
        ).rows[0].n,
      ).toBe(2);
    });
    it("rejects unresolved or mutated proofs and forged caller IDs without provider calls under actor locks", async () => {
      const m = await member(),
        other = await member(),
        work = vi.fn();
      await expect(
        coordinator.withRoom(
          { actor: { userId: m.id, kind: "member" }, roomIds: [] },
          (p) => m.authorizer.authorize(m.proof, p),
          work,
        ),
      ).rejects.toMatchObject({ code: "AUTH_REQUIRED", status: 401 });
      const actor = await m.authorizer.resolve(m.proof);
      await expect(
        coordinator.withRoom(
          { actor: { ...actor, userId: other.id }, roomIds: [] },
          (p) => m.authorizer.authorize(m.proof, p),
          work,
        ),
      ).rejects.toMatchObject({ code: "AUTH_REQUIRED", status: 401 });
      m.proof.accessToken = "changed-bearer";
      await expect(
        coordinator.withRoom(
          { actor, roomIds: [] },
          (p) => m.authorizer.authorize(m.proof, p),
          work,
        ),
      ).rejects.toMatchObject({ code: "AUTH_REQUIRED", status: 401 });
      expect(work).not.toHaveBeenCalled();
      expect(m.provider.getUser).toHaveBeenCalledTimes(1);
    });
    it.each(["revocation", "expiry"])(
      "denies %s after upstream resolution while waiting for actor lock",
      async (change) => {
        const m = await member(),
          actor = await m.authorizer.resolve(m.proof),
          blocker = await pool.connect(),
          work = vi.fn();
        await blocker.query("BEGIN; SET LOCAL ROLE app_server");
        await blocker.query(
          "SELECT pg_advisory_xact_lock(hashtextextended($1,0))",
          ["actor:" + m.id],
        );
        let waiting!: () => void;
        const reached = new Promise<void>((r) => (waiting = r));
        const client = await pool.connect(),
          original = client.query.bind(client);
        const querySpy = vi.spyOn(client, "query").mockImplementation(((
          text: string,
          values?: unknown[],
        ) => {
          if (text.includes("pg_advisory_xact_lock")) waiting();
          return original(text, values);
        }) as typeof client.query);
        const connectSpy = vi
          .spyOn(pool, "connect")
          .mockResolvedValueOnce(client);
        const pending = coordinator.withRoom(
          { actor, roomIds: [] },
          (p) => m.authorizer.authorize(m.proof, p),
          work,
        );
        const denial = expect(pending).rejects.toMatchObject({
          code: "AUTH_REQUIRED",
          status: 401,
        });
        try {
          await reached;
          // Dedicated synthetic administrator adjusts fixed dates; app_server
          // intentionally has no grant to extend or rewrite session deadlines.
          if (change === "expiry") await blocker.query("RESET ROLE");
          await blocker.query(
            change === "revocation"
              ? "UPDATE xiangqi_auth.app_sessions SET revoked_at=clock_timestamp() WHERE token_hash=$1"
              : "WITH t AS (SELECT clock_timestamp() AS at) UPDATE xiangqi_auth.app_sessions SET created_at=t.at-interval '12 hours',expires_at=t.at FROM t WHERE token_hash=$1",
            [hash(m.proof.appSession)],
          );
          await blocker.query("COMMIT");
          await denial;
        } finally {
          querySpy.mockRestore();
          connectSpy.mockRestore();
          await blocker.query("ROLLBACK");
          blocker.release();
        }
        expect(work).not.toHaveBeenCalled();
        expect(m.provider.getUser).toHaveBeenCalledTimes(1);
      },
    );
    it("samples server clock after session row lock, denying deadline crossed during wait", async () => {
      const m = await member(),
        actor = await m.authorizer.resolve(m.proof),
        blocker = await pool.connect(),
        work = vi.fn();
      await blocker.query("BEGIN");
      await blocker.query(
        "SELECT token_hash FROM xiangqi_auth.app_sessions WHERE token_hash=$1 FOR UPDATE",
        [hash(m.proof.appSession)],
      );
      let waiting!: () => void;
      const reached = new Promise<void>((r) => (waiting = r));
      const client = await pool.connect(),
        original = client.query.bind(client);
      const spy = vi.spyOn(client, "query").mockImplementation(((
        text: string,
        values?: unknown[],
      ) => {
        if (text.includes("app_sessions") && text.includes("FOR UPDATE"))
          waiting();
        return original(text, values);
      }) as typeof client.query);
      const connectSpy = vi
        .spyOn(pool, "connect")
        .mockResolvedValueOnce(client);
      const pending = coordinator.withRoom(
        { actor, roomIds: [] },
        (p) => m.authorizer.authorize(m.proof, p),
        work,
      );
      const denial = expect(pending).rejects.toMatchObject({
        code: "AUTH_REQUIRED",
        status: 401,
      });
      try {
        await reached;
        await blocker.query(
          "WITH t AS (SELECT clock_timestamp() AS at) UPDATE xiangqi_auth.app_sessions SET created_at=t.at-interval '12 hours',expires_at=t.at FROM t WHERE token_hash=$1",
          [hash(m.proof.appSession)],
        );
        await blocker.query("COMMIT");
        await denial;
      } finally {
        spy.mockRestore();
        connectSpy.mockRestore();
        await blocker.query("ROLLBACK");
        blocker.release();
      }
      expect(work).not.toHaveBeenCalled();
    });
    it("samples deadline after a profile lock wait as well as session lock wait", async () => {
      const m = await member(),
        actor = await m.authorizer.resolve(m.proof),
        blocker = await pool.connect(),
        work = vi.fn();
      await pool.query(
        "WITH t AS (SELECT clock_timestamp()+interval '300 milliseconds' AS at) UPDATE xiangqi_auth.app_sessions SET created_at=t.at-interval '12 hours',expires_at=t.at FROM t WHERE token_hash=$1",
        [hash(m.proof.appSession)],
      );
      await blocker.query("BEGIN");
      await blocker.query(
        "SELECT user_id FROM public.profiles WHERE user_id=$1 FOR UPDATE",
        [m.id],
      );
      let waiting!: () => void;
      const reached = new Promise<void>((r) => (waiting = r));
      const client = await pool.connect(),
        original = client.query.bind(client);
      const spy = vi.spyOn(client, "query").mockImplementation(((
        text: string,
        values?: unknown[],
      ) => {
        if (text.includes("FOR UPDATE OF p")) waiting();
        return original(text, values);
      }) as typeof client.query);
      const connectSpy = vi
        .spyOn(pool, "connect")
        .mockResolvedValueOnce(client);
      const pending = coordinator.withRoom(
        { actor, roomIds: [] },
        (p) => m.authorizer.authorize(m.proof, p),
        work,
      );
      const denial = expect(pending).rejects.toMatchObject({
        code: "AUTH_REQUIRED",
        status: 401,
      });
      try {
        await reached;
        await blocker.query(
          "SELECT pg_sleep(GREATEST(0,EXTRACT(EPOCH FROM expires_at-clock_timestamp()))+0.005) FROM xiangqi_auth.app_sessions WHERE token_hash=$1",
          [hash(m.proof.appSession)],
        );
        await blocker.query("COMMIT");
        await denial;
      } finally {
        spy.mockRestore();
        connectSpy.mockRestore();
        await blocker.query("ROLLBACK");
        blocker.release();
      }
      expect(work).not.toHaveBeenCalled();
    });
    it("denies a fixed deadline crossed while waiting for a room row lock", async () => {
      const m = await member(),
        actor = await m.authorizer.resolve(m.proof),
        blocker = await pool.connect(),
        work = vi.fn();
      const created = await new RoomHttpService(
        rooms,
        coordinator,
        m.authorizer,
      ).create(m.proof, { commandId: randomUUID(), name: "Room Row Wait" });
      await pool.query(
        "WITH t AS (SELECT clock_timestamp()+interval '300 milliseconds' AS at) UPDATE xiangqi_auth.app_sessions SET created_at=t.at-interval '12 hours',expires_at=t.at FROM t WHERE token_hash=$1",
        [hash(m.proof.appSession)],
      );
      await blocker.query("BEGIN");
      await blocker.query(
        "SELECT id FROM public.rooms WHERE id=$1 FOR UPDATE",
        [created.roomId],
      );
      let waiting!: () => void;
      const reached = new Promise<void>((r) => (waiting = r));
      const client = await pool.connect(),
        original = client.query.bind(client);
      const spy = vi.spyOn(client, "query").mockImplementation(((
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
      const pending = coordinator.withRoom(
        { actor, roomIds: [created.roomId] },
        (p) => m.authorizer.authorize(m.proof, p),
        work,
      );
      const denial = expect(pending).rejects.toMatchObject({
        code: "AUTH_REQUIRED",
        status: 401,
      });
      try {
        await reached;
        await blocker.query(
          "SELECT pg_sleep(GREATEST(0,EXTRACT(EPOCH FROM expires_at-clock_timestamp()))+0.005) FROM xiangqi_auth.app_sessions WHERE token_hash=$1",
          [hash(m.proof.appSession)],
        );
        await blocker.query("COMMIT");
        await denial;
      } finally {
        spy.mockRestore();
        connectSpy.mockRestore();
        await blocker.query("ROLLBACK");
        blocker.release();
      }
      expect(work).not.toHaveBeenCalled();
    });
    it("holds capability row lock through room work so concurrent revoke commits after the command", async () => {
      const m = await member(),
        actor = await m.authorizer.resolve(m.proof),
        revoker = await pool.connect();
      await coordinator.withRoom(
        { actor, roomIds: [] },
        (p) => m.authorizer.authorize(m.proof, p),
        async (s) => {
          await revoker.query(
            "BEGIN; SET LOCAL ROLE app_server; SET LOCAL lock_timeout='30ms'",
          );
          await expect(
            revoker.query(
              "UPDATE xiangqi_auth.app_sessions SET revoked_at=clock_timestamp() WHERE token_hash=$1",
              [hash(m.proof.appSession)],
            ),
          ).rejects.toMatchObject({ code: "55P03" });
          await revoker.query("ROLLBACK");
          return rooms.create(s, {
            commandId: randomUUID(),
            name: "Before Revoke",
          });
        },
      );
      try {
        await revoker.query("BEGIN; SET LOCAL ROLE app_server");
        await revoker.query(
          "UPDATE xiangqi_auth.app_sessions SET revoked_at=clock_timestamp() WHERE token_hash=$1",
          [hash(m.proof.appSession)],
        );
        await revoker.query("COMMIT");
      } finally {
        await revoker.query("ROLLBACK");
        revoker.release();
      }
      await expect(
        coordinator.withRoom(
          { actor, roomIds: [] },
          (p) => m.authorizer.authorize(m.proof, p),
          vi.fn(),
        ),
      ).rejects.toMatchObject({ code: "AUTH_REQUIRED", status: 401 });
      expect(
        (await pool.query("SELECT count(*)::int AS n FROM public.rooms"))
          .rows[0].n,
      ).toBe(1);
    });
    it("rechecks active profile/account before room work", async () => {
      const m = await member(),
        actor = await m.authorizer.resolve(m.proof);
      await pool.query(
        "UPDATE public.profiles SET registration_pending=true WHERE user_id=$1",
        [m.id],
      );
      await expect(
        coordinator.withRoom(
          { actor, roomIds: [] },
          (p) => m.authorizer.authorize(m.proof, p),
          vi.fn(),
        ),
      ).rejects.toMatchObject({ code: "AUTH_REQUIRED", status: 401 });
    });
    it("rejects missing lock proof, malformed cap and sanitizes outage errors", async () => {
      const m = await member(),
        actor = await m.authorizer.resolve(m.proof),
        client = await pool.connect();
      try {
        const p: RoomActorProof = {
          client,
          actor,
          roomIds: [],
          lockedActorIds: new Set(),
        };
        await expect(m.authorizer.authorize(m.proof, p)).rejects.toMatchObject({
          code: "AUTH_REQUIRED",
          status: 401,
        });
      } finally {
        client.release();
      }
      for (const proof of [
        { ...m.proof, appSession: "short" },
        { ...m.proof, accessToken: "" },
      ])
        await expect(m.authorizer.resolve(proof)).rejects.toMatchObject({
          code: "AUTH_REQUIRED",
          status: 401,
        });
      for (const error of [
        new LoginError("SESSION_EXPIRED", "private details"),
        new RegistrationError("UPSTREAM_INVALID", "private details", 401),
      ]) {
        m.provider.getUser.mockRejectedValueOnce(error);
        await expect(
          m.authorizer.resolve({ ...m.proof }),
        ).rejects.toMatchObject({
          code: "AUTH_REQUIRED",
          status: 401,
          message: "Phiên đăng nhập không hợp lệ",
        });
      }
      m.provider.getUser.mockRejectedValueOnce(
        new Error("private-token-secret"),
      );
      await expect(m.authorizer.resolve({ ...m.proof })).rejects.toMatchObject({
        code: "AUTH_UNAVAILABLE",
        status: 503,
        message: "Chưa thể xác thực phiên đăng nhập",
      });
    });
  },
);
