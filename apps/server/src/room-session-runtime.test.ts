import { createHash, randomUUID } from "node:crypto";
import type { AddressInfo } from "node:net";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { io, type Socket } from "socket.io-client";
import { createApp } from "./app.js";
import type { createRegistrationRuntime } from "./auth-runtime.js";
import { RegistrationError } from "./auth/contracts.js";
import { SessionService } from "./login/session.service.js";
import { PostgresLoginStore } from "./login/postgres-login-store.js";
import { createRoomRuntime } from "./room-runtime.js";
import type { RealtimePublisher } from "./realtime/gateway.js";
import { databaseUrl, pool, reset } from "./room-runtime.test-helper.js";
type Registration = NonNullable<
  Awaited<ReturnType<typeof createRegistrationRuntime>>
>;
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
async function waitFor<T>(
  read: () => Promise<T>,
  accept: (v: T) => boolean,
  timeout = 5000,
) {
  const until = Date.now() + timeout;
  while (Date.now() < until) {
    const value = await read();
    if (accept(value)) return value;
    await new Promise((r) => setTimeout(r, 25));
  }
  throw Error("Synthetic session runtime wait timed out");
}
async function fixture() {
  const id = randomUUID(),
    email = `synthetic-${id}@example.invalid`,
    at = new Date();
  await pool.query(
    "INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,$2,$3)",
    [id, email, at],
  );
  await pool.query(
    "INSERT INTO public.profiles(user_id,username,display_name,completed_at,registration_pending) VALUES($1,$2,'Synthetic Session',$3,false)",
    [id, "m" + id.replaceAll("-", "").slice(0, 18), at],
  );
  let providerStatus = 200;
  const auth = {
    getUser: vi.fn(async (token: string) => {
      if (providerStatus !== 200 || token === "expired-bearer")
        throw new RegistrationError(
          providerStatus === 503 ? "AUTH_PROVIDER_ERROR" : "SESSION_INVALID",
          "PRIVATE_PROVIDER_SECRET",
          providerStatus === 503 ? 503 : 401,
        );
      return { id, email, email_confirmed_at: at.toISOString() };
    }),
  };
  const sessions = new SessionService(new PostgresLoginStore(pool), auth),
    issued = await sessions.issue(id, false),
    cap = issued.appSession;
  const runtime = await createRoomRuntime(
    { ROOMS_ENABLED: "true", AUTH_LOGIN_ENABLED: "true" },
    { pool, sessions, auth } as unknown as Registration,
  );
  if (!runtime) throw Error("fixture");
  let publisher!: RealtimePublisher;
  const app = await createApp(
    ["http://localhost:5173"],
    [runtime.module],
    null,
    {
      ...runtime.realtime,
      onAttached: (p) => {
        publisher = p;
        runtime.realtime.onAttached(p);
      },
    },
  );
  await app.listen(0, "127.0.0.1");
  await runtime.start();
  const base = `http://127.0.0.1:${(app.getHttpServer().address() as AddressInfo).port}`;
  const response = await fetch(base + "/rooms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer initial-bearer",
      "X-Xiangqi-Session": cap,
    },
    body: JSON.stringify({
      commandId: randomUUID(),
      name: "Fixed Session",
      timeMinutes: 5,
    }),
  });
  expect(response.status).toBe(200);
  const entry = await response.json();
  const sockets: Socket[] = [];
  const tabId = randomUUID();
  async function connect(token = "initial-bearer", appSession = cap) {
    const socket = io(base, {
      autoConnect: false,
      transports: ["websocket"],
      reconnection: false,
      auth: { accessToken: token, appSession, roomId: entry.roomId, tabId },
    });
    sockets.push(socket);
    const ready = new Promise<void>((r, j) => {
      socket.once("room.snapshot", () => r());
      socket.once("connect_error", j);
    });
    socket.connect();
    await ready;
    return socket;
  }
  const socket = await connect();
  await waitFor(
    async () =>
      (
        await pool.query(
          "SELECT count(*)::int n FROM xiangqi_room.outbox WHERE room_id=$1 AND delivered_at IS NULL",
          [entry.roomId],
        )
      ).rows[0].n,
    (n) => n === 0,
  );
  const member = async () =>
    (
      await pool.query(
        "SELECT disconnected_at FROM public.room_members WHERE room_id=$1 AND user_id=$2",
        [entry.roomId, id],
      )
    ).rows[0];
  return {
    id,
    cap,
    issued,
    entry,
    socket,
    connect,
    member,
    auth,
    runtime,
    publisher,
    provider: (status: number) => (providerStatus = status),
    close: async () => {
      sockets.forEach((s) => s.disconnect());
      await runtime.close();
      await app.close();
    },
  };
}
afterAll(() => pool.end());
describe.skipIf(!databaseUrl)(
  "native runtime fixed appSession validity without bearer provider",
  () => {
    beforeEach(reset);
    it.each(["expire", "revoke"] as const)(
      "actual %s capability physically disconnects and records grace without losing seat before60",
      async (kind) => {
        const f = await fixture();
        try {
          if (kind === "expire")
            await pool.query(
              "WITH t AS MATERIALIZED(SELECT clock_timestamp()-interval '1 second' deadline) UPDATE xiangqi_auth.app_sessions s SET expires_at=t.deadline,created_at=t.deadline-interval '12 hours' FROM t WHERE token_hash=$1",
              [hash(f.cap)],
            );
          else
            await pool.query(
              "UPDATE xiangqi_auth.app_sessions SET revoked_at=clock_timestamp() WHERE token_hash=$1",
              [hash(f.cap)],
            );
          await waitFor(
            async () => f.socket.connected,
            (connected) => !connected,
          );
          const member = await waitFor(
            f.member,
            (row) => row?.disconnected_at instanceof Date,
          );
          expect(member.disconnected_at).toBeInstanceOf(Date);
          expect(
            (
              await pool.query("SELECT status FROM public.rooms WHERE id=$1", [
                f.entry.roomId,
              ])
            ).rows[0].status,
          ).toBe("WAITING");
          expect(
            (
              await pool.query(
                "SELECT connected FROM xiangqi_room.presence WHERE room_id=$1 AND user_id=$2",
                [f.entry.roomId, f.id],
              )
            ).rows[0].connected,
          ).toBe(false);
        } finally {
          await f.close();
        }
      },
      9000,
    );
    it.each([401, 503])(
      "valid appSession survives provider%s and no private snapshot leaks",
      async (status) => {
        const f = await fixture();
        try {
          let snapshots = 0;
          f.socket.on("room.snapshot", () => snapshots++);
          f.provider(status);
          await f.publisher.publishSnapshots(f.entry.roomId).catch((error) => {
            expect(error.code).toBe("REALTIME_UNAVAILABLE");
          });
          const calls = f.auth.getUser.mock.calls.length;
          await new Promise((r) => setTimeout(r, 1250));
          expect(f.socket.connected).toBe(true);
          expect((await f.member()).disconnected_at).toBeNull();
          expect(snapshots).toBe(0);
          expect(f.auth.getUser).toHaveBeenCalledTimes(calls);
          f.provider(200);
          f.socket.disconnect();
          await waitFor(
            f.member,
            (row) => row?.disconnected_at instanceof Date,
          );
          const resumed = await f.connect("new-refreshed-bearer");
          expect(resumed.connected).toBe(true);
          expect((await f.member()).disconnected_at).toBeNull();
          const session = (
            await pool.query(
              "SELECT expires_at,remember FROM xiangqi_auth.app_sessions WHERE token_hash=$1",
              [hash(f.cap)],
            )
          ).rows[0];
          expect(session.expires_at.toISOString()).toBe(f.issued.expiresAt);
          expect(session.remember).toBe(false);
        } finally {
          await f.close();
        }
      },
      9000,
    );
    it("SQL access outage retains the transport and retries after recovery", async () => {
      const f = await fixture();
      try {
        await pool.query(
          "REVOKE SELECT ON xiangqi_auth.app_sessions FROM app_server",
        );
        await new Promise((r) => setTimeout(r, 1250));
        expect(f.socket.connected).toBe(true);
        expect((await f.member()).disconnected_at).toBeNull();
        await pool.query(
          "GRANT SELECT ON xiangqi_auth.app_sessions TO app_server",
        );
        await pool.query(
          "UPDATE xiangqi_auth.app_sessions SET revoked_at=clock_timestamp() WHERE token_hash=$1",
          [hash(f.cap)],
        );
        await waitFor(
          async () => f.socket.connected,
          (connected) => !connected,
        );
        await waitFor(f.member, (row) => row?.disconnected_at instanceof Date);
      } finally {
        await pool.query(
          "GRANT SELECT ON xiangqi_auth.app_sessions TO app_server",
        );
        await f.close();
      }
    }, 9000);
  },
);
