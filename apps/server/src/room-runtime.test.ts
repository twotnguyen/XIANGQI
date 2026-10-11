import { randomUUID } from "node:crypto";
import type { AddressInfo } from "node:net";
import type { RoomSnapshot, CommandAcknowledgement } from "@xiangqi/shared";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { io, type Socket } from "socket.io-client";
import { createApp } from "./app.js";
import type { createRegistrationRuntime } from "./auth-runtime.js";
import { SessionService } from "./login/session.service.js";
import { PostgresLoginStore } from "./login/postgres-login-store.js";
import { RoomStore } from "./room/room-store.js";
import { RoomTransactions } from "./room/room-transactions.js";
import { RoomHttpService } from "./room/room-http.service.js";
import { PostgresMemberRoomAuthorizer } from "./room/member-room-auth.js";
import { MatchStore } from "./match/match-store.js";
import { ClockService } from "./clock/clock-service.js";
import { createRoomRuntime } from "./room-runtime.js";
import { databaseUrl, pool, reset } from "./room-runtime.test-helper.js";
const env = { ROOMS_ENABLED: "true", AUTH_LOGIN_ENABLED: "true" };
type Registration = NonNullable<
  Awaited<ReturnType<typeof createRegistrationRuntime>>
>;
function registration() {
  const users = new Map<
    string,
    { id: string; email: string; email_confirmed_at: string }
  >();
  const auth = {
    signInPassword: vi.fn(),
    getUser: vi.fn(async (token: string) => {
      const user = users.get(token);
      if (!user) throw new Error("synthetic invalid bearer");
      return user;
    }),
  };
  const sessions = new SessionService(new PostgresLoginStore(pool), auth);
  return {
    users,
    auth,
    sessions,
    context: { pool, sessions, auth } as unknown as Registration,
  };
}
async function member(r: ReturnType<typeof registration>) {
  const id = randomUUID(),
    email = `synthetic-${id}@example.invalid`,
    at = new Date();
  await pool.query(
    "INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,$2,$3)",
    [id, email, at],
  );
  await pool.query(
    "INSERT INTO public.profiles(user_id,username,display_name,completed_at,registration_pending) VALUES($1,$2,'Synthetic Runtime',$3,false)",
    [id, "m" + id.replaceAll("-", "").slice(0, 18), at],
  );
  const token = "synthetic-" + id;
  r.users.set(token, { id, email, email_confirmed_at: at.toISOString() });
  const issued = await r.sessions.issue(id, false);
  return { id, token, appSession: issued.appSession };
}
async function waitFor<T>(
  read: () => Promise<T>,
  accept: (value: T) => boolean,
  timeout = 7000,
) {
  const until = Date.now() + timeout;
  while (Date.now() < until) {
    const value = await read();
    if (accept(value)) return value;
    await new Promise((r) => setTimeout(r, 25));
  }
  throw new Error("Synthetic runtime wait timed out");
}
async function oldRoom(r: ReturnType<typeof registration>, playing = false) {
  const a = await member(r),
    b = await member(r),
    rooms = new RoomStore(),
    coordinator = new RoomTransactions(pool),
    authorizer = new PostgresMemberRoomAuthorizer(r.sessions);
  const service = new RoomHttpService(rooms, coordinator, authorizer),
    proof = (m: typeof a) => ({
      accessToken: m.token,
      appSession: m.appSession,
    });
  const entry = await service.create(proof(a), {
    commandId: randomUUID(),
    name: "Recover Room",
    timeMinutes: 5,
  });
  await service.join(proof(b), {
    commandId: randomUUID(),
    code: entry.inviteCode!,
    preference: "play",
  });
  let matchId: string | null = null;
  await coordinator.withRoom(
    { actor: { userId: a.id, kind: "member" }, roomIds: [entry.roomId] },
    async (p) => ({ status: "active", actor: p.actor }),
    async (scope) => {
      for (const m of [a, b])
        await rooms.presence(
          scope.actor.userId === m.id
            ? scope
            : { ...scope, actor: { userId: m.id, kind: "member" } },
          entry.roomId,
          {
            connectionId: randomUUID(),
            generation: 1,
            serverInstance: randomUUID(),
          },
          true,
        );
      await scope.client.query(
        "UPDATE public.room_members SET ready=true WHERE room_id=$1",
        [entry.roomId],
      );
      const token = randomUUID(),
        at = new Date();
      await scope.client.query(
        "INSERT INTO xiangqi_room.countdowns(room_id,token,due_at,red_id,black_id) VALUES($1,$2,$3,$4,$5)",
        [entry.roomId, token, at, a.id, b.id],
      );
      if (playing) {
        const match = new MatchStore(new ClockService()),
          created = await match.start(scope.client, {
            roomId: entry.roomId,
            startToken: token,
            redId: a.id,
            blackId: b.id,
            timeControlSeconds: 300,
            startedAt: at,
          });
        matchId = created.matchId;
        await scope.client.query(
          "UPDATE public.rooms SET status='PLAYING',current_match_id=$2 WHERE id=$1",
          [entry.roomId, matchId],
        );
        await scope.client.query(
          "UPDATE public.active_players SET match_id=$2 WHERE room_id=$1",
          [entry.roomId, matchId],
        );
      }
    },
  );
  return { a, b, roomId: entry.roomId, matchId };
}
async function publicationFixture(viewer = false) {
  const r = registration(),
    a = await member(r),
    b = viewer ? await member(r) : null;
  const runtime = await createRoomRuntime(env, r.context);
  if (!runtime) throw new Error("Missing runtime");
  const app = await createApp(
    ["http://localhost:5173"],
    [runtime.module],
    null,
    runtime.realtime,
  );
  await app.listen(0, "127.0.0.1");
  const base = `http://127.0.0.1:${(app.getHttpServer().address() as AddressInfo).port}`;
  const headers = (m: typeof a) => ({
    "Content-Type": "application/json",
    Authorization: "Bearer " + m.token,
    "X-Xiangqi-Session": m.appSession,
  });
  const create = await fetch(base + "/rooms", {
    method: "POST",
    headers: headers(a),
    body: JSON.stringify({
      commandId: randomUUID(),
      name: "Publication Regression",
      timeMinutes: 5,
    }),
  });
  expect(create.status).toBe(200);
  const entry = await create.json();
  if (b) {
    const joined = await fetch(base + "/rooms/join", {
      method: "POST",
      headers: headers(b),
      body: JSON.stringify({
        commandId: randomUUID(),
        code: entry.inviteCode,
        preference: "watch",
      }),
    });
    expect(joined.status).toBe(200);
  }
  const peer = b ?? a;
  let latest: RoomSnapshot | undefined;
  const socket = io(base, {
    autoConnect: false,
    transports: ["websocket"],
    reconnection: false,
    auth: {
      accessToken: peer.token,
      appSession: peer.appSession,
      roomId: entry.roomId,
      tabId: randomUUID(),
    },
  });
  socket.on("room.snapshot", (value) => (latest = value));
  const connected = new Promise<void>((resolve, reject) => {
    socket.once("connect", () => resolve());
    socket.once("connect_error", reject);
  });
  socket.connect();
  await connected;
  await waitFor(
    async () => latest,
    (value) => Boolean(value),
  );
  return {
    r,
    a,
    b,
    runtime,
    app,
    base,
    headers,
    entry,
    socket,
    latest: () => latest,
    close: async () => {
      socket.disconnect();
      await runtime.close();
      await app.close();
    },
  };
}
afterAll(() => pool.end());
describe("Room runtime feature configuration", () => {
  it("defaults off without touching database", async () => {
    expect(await createRoomRuntime({}, null)).toBeNull();
  });
  it.each([
    { ROOMS_ENABLED: "yes" },
    { ROOMS_ENABLED: "true" },
    { ROOMS_ENABLED: "true", AUTH_LOGIN_ENABLED: "false" },
  ])("rejects invalid flags or missing member sessions", async (input) => {
    await expect(createRoomRuntime(input, null)).rejects.toThrow();
  });
});
describe.skipIf(!databaseUrl)(
  "Room runtime actual HTTP Socket PostgreSQL",
  () => {
    beforeEach(reset);
    it("fails closed before scheduling when migration7 is absent", async () => {
      const r = registration();
      await pool.query(
        "ALTER TABLE public.matches DROP CONSTRAINT matches_status_and_outcome_invariants",
      );
      await expect(createRoomRuntime(env, r.context)).rejects.toThrow(
        "Room migration is not ready",
      );
      expect((await pool.query("SELECT 1 AS n")).rows[0].n).toBe(1);
    });
    it("fails closed when the runtime role cannot access private realtime schema", async () => {
      const r = registration();
      await pool.query(
        "REVOKE USAGE ON SCHEMA xiangqi_realtime FROM app_server",
      );
      await expect(createRoomRuntime(env, r.context)).rejects.toThrow(
        "Room migration is not ready",
      );
    });
    it("recovers waiting rooms before listening: cancels old countdown and sets offline grace", async () => {
      const r = registration(),
        g = await oldRoom(r),
        runtime = await createRoomRuntime(env, r.context);
      if (!runtime) throw new Error("missing runtime");
      try {
        expect(
          (
            await pool.query(
              "SELECT count(*)::int n FROM xiangqi_room.countdowns WHERE room_id=$1",
              [g.roomId],
            )
          ).rows[0].n,
        ).toBe(0);
        expect(
          (
            await pool.query(
              "SELECT bool_and(NOT p.connected AND m.disconnected_at IS NOT NULL AND NOT m.ready) AS recovered FROM xiangqi_room.presence p JOIN public.room_members m USING(room_id,user_id) WHERE p.room_id=$1",
              [g.roomId],
            )
          ).rows[0].recovered,
        ).toBe(true);
      } finally {
        await runtime.close();
      }
    });
    it("interrupts a canonical playing match at startup atomically then resets room", async () => {
      const r = registration(),
        g = await oldRoom(r, true),
        runtime = await createRoomRuntime(env, r.context);
      if (!runtime) throw new Error("missing runtime");
      try {
        expect(
          (
            await pool.query(
              "SELECT status,outcome FROM public.matches WHERE id=$1",
              [g.matchId],
            )
          ).rows[0],
        ).toMatchObject({
          status: "INTERRUPTED",
          outcome: { reason: "SERVER_RESTART", winner: null },
        });
        expect(
          (
            await pool.query(
              "SELECT status,current_match_id FROM public.rooms WHERE id=$1",
              [g.roomId],
            )
          ).rows[0],
        ).toMatchObject({ status: "WAITING", current_match_id: null });
        expect(
          (
            await pool.query(
              "SELECT count(*)::int n FROM public.match_events WHERE match_id=$1 AND type='RESULT'",
              [g.matchId],
            )
          ).rows[0].n,
        ).toBe(1);
        expect(
          (
            await pool.query(
              "SELECT count(*)::int n FROM public.active_players WHERE room_id=$1 AND match_id IS NOT NULL",
              [g.roomId],
            )
          ).rows[0].n,
        ).toBe(0);
      } finally {
        await runtime.close();
      }
    });
    it("close drains an in-flight publisher, stops timers and keeps borrowed pool open", async () => {
      const r = registration(),
        g = await oldRoom(r),
        runtime = await createRoomRuntime(env, r.context);
      if (!runtime) throw new Error("missing runtime");
      let enter!: () => void, release!: () => void;
      const entered = new Promise<void>((resolve) => (enter = resolve)),
        blocked = new Promise<void>((resolve) => (release = resolve));
      const publish = vi.fn(async () => {
          enter();
          await blocked;
        }),
        poolEnd = vi.spyOn(pool, "end");
      runtime.realtime.onAttached({
        connections: () => [],
        publishRoomClosed: async () => {},
        publishSnapshots: publish,
      });
      try {
        await runtime.start();
        await entered;
        let closed = false;
        const closing = runtime.close().then(() => {
          closed = true;
        });
        await new Promise((resolve) => setTimeout(resolve, 20));
        expect(closed).toBe(false);
        release();
        await closing;
        await runtime.close();
        const calls = publish.mock.calls.length;
        await new Promise((resolve) => setTimeout(resolve, 150));
        expect(publish).toHaveBeenCalledTimes(calls);
        expect(poolEnd).not.toHaveBeenCalled();
        expect(
          (
            await pool.query("SELECT status FROM public.rooms WHERE id=$1", [
              g.roomId,
            ])
          ).rows[0].status,
        ).toBe("WAITING");
        await expect(runtime.start()).rejects.toThrow("closed");
      } finally {
        release();
        await runtime.close();
        poolEnd.mockRestore();
      }
    });
    it("keeps media revocation unacknowledged when no real media port is integrated", async () => {
      const r = registration(),
        g = await oldRoom(r),
        runtime = await createRoomRuntime(env, r.context),
        eventId = randomUUID();
      if (!runtime) throw new Error("missing runtime");
      await pool.query(
        "INSERT INTO xiangqi_room.outbox(id,room_id,room_version,type,payload) SELECT $1,id,room_version,'media.revoke-room','{}'::jsonb FROM public.rooms WHERE id=$2",
        [eventId, g.roomId],
      );
      runtime.realtime.onAttached({
        connections: () => [],
        publishRoomClosed: async () => {},
        publishSnapshots: async () => {},
      });
      try {
        await runtime.start();
        const row = await waitFor(
          async () =>
            (
              await pool.query(
                "SELECT delivered_at,attempts FROM xiangqi_room.outbox WHERE id=$1",
                [eventId],
              )
            ).rows[0],
          (value) => value?.attempts > 0,
        );
        expect(row.delivered_at).toBeNull();
      } finally {
        await runtime.close();
      }
    });
    it("delivers a closed-room notice to the actual spectator after SQL membership removal", async () => {
      const f = await publicationFixture(true);
      let notice: unknown;
      f.socket.on("room.closed", (value) => (notice = value));
      try {
        await f.runtime.start();
        const current = await fetch(`${f.base}/rooms/${f.entry.roomId}`, {
          headers: f.headers(f.a),
        });
        expect(current.status).toBe(200);
        const version = (await current.json()).version;
        const left = await fetch(`${f.base}/rooms/${f.entry.roomId}/leave`, {
          method: "POST",
          headers: f.headers(f.a),
          body: JSON.stringify({ expectedVersion: version }),
        });
        expect(left.status).toBe(200);
        expect(
          (
            await pool.query(
              "SELECT count(*)::int n FROM public.room_members WHERE room_id=$1",
              [f.entry.roomId],
            )
          ).rows[0].n,
        ).toBe(0);
        expect(
          await waitFor(
            async () => notice,
            (value) => Boolean(value),
          ),
        ).toEqual({ roomId: f.entry.roomId, message: "Phòng đã đóng" });
        const delivered = await waitFor(
          async () =>
            (
              await pool.query(
                "SELECT delivered_at FROM xiangqi_room.outbox WHERE room_id=$1 AND type='room.closed'",
                [f.entry.roomId],
              )
            ).rows[0],
          (row) => row?.delivered_at instanceof Date,
        );
        expect(delivered.delivered_at).toBeInstanceOf(Date);
      } finally {
        await f.close();
      }
    }, 10000);
    it("keeps the actual outbox pending during provider outage then retries the fresh peer snapshot", async () => {
      const f = await publicationFixture(),
        eventId = randomUUID();
      try {
        const user = f.r.users.get(f.a.token)!;
        f.r.users.delete(f.a.token);
        const updated = await pool.query(
          "UPDATE public.rooms SET room_version=room_version+1 WHERE id=$1 RETURNING room_version::integer AS version",
          [f.entry.roomId],
        );
        const version = updated.rows[0].version;
        await pool.query(
          "INSERT INTO xiangqi_room.outbox(id,room_id,room_version,type,payload) SELECT $1,id,room_version,'room.seats-changed','{}'::jsonb FROM public.rooms WHERE id=$2",
          [eventId, f.entry.roomId],
        );
        await f.runtime.start();
        const failed = await waitFor(
          async () =>
            (
              await pool.query(
                "SELECT delivered_at,attempts FROM xiangqi_room.outbox WHERE id=$1",
                [eventId],
              )
            ).rows[0],
          (row) => row?.attempts > 0,
        );
        expect(failed.delivered_at).toBeNull();
        expect(f.latest()?.version).toBeLessThan(version);
        f.r.users.set(f.a.token, user);
        await waitFor(
          async () =>
            (
              await pool.query(
                "SELECT delivered_at FROM xiangqi_room.outbox WHERE id=$1",
                [eventId],
              )
            ).rows[0],
          (row) => row?.delivered_at instanceof Date,
        );
        expect(
          (
            await waitFor(
              async () => f.latest(),
              (value) => value?.version === version,
            )
          )?.version,
        ).toBe(version);
      } finally {
        await f.close();
      }
    }, 10000);
    it("switches lone Host to black then transfers Host on HTTP leave and publishes peer update", async () => {
      const r = registration(),
        a = await member(r),
        b = await member(r),
        runtime = await createRoomRuntime(env, r.context);
      if (!runtime) throw new Error("missing runtime");
      const app = await createApp(
        ["http://localhost:5173"],
        [runtime.module],
        null,
        runtime.realtime,
      );
      let socket: Socket | undefined;
      try {
        await app.listen(0, "127.0.0.1");
        await runtime.start();
        const base = `http://127.0.0.1:${(app.getHttpServer().address() as AddressInfo).port}`;
        const headers = (m: typeof a) => ({
          "Content-Type": "application/json",
          Authorization: "Bearer " + m.token,
          "X-Xiangqi-Session": m.appSession,
        });
        const post = async (path: string, m: typeof a, body: object) => {
          const response = await fetch(base + path, {
            method: "POST",
            headers: headers(m),
            body: JSON.stringify(body),
          });
          expect(response.status).toBe(200);
          return response.json();
        };
        const entry = await post("/rooms", a, {
          commandId: randomUUID(),
          name: "Switch Host",
          timeMinutes: 5,
        });
        const switched = await post(`/rooms/${entry.roomId}/switch-seat`, a, {
          expectedVersion: entry.version,
        });
        expect(switched.role).toBe("black");
        const joined = await post("/rooms/join", b, {
          commandId: randomUUID(),
          code: entry.inviteCode,
          preference: "play",
        });
        expect(joined.role).toBe("red");
        let latest: RoomSnapshot | undefined;
        socket = io(base, {
          transports: ["websocket"],
          auth: {
            accessToken: b.token,
            appSession: b.appSession,
            roomId: entry.roomId,
            tabId: randomUUID(),
          },
          reconnection: false,
        });
        socket.on("room.snapshot", (value) => (latest = value));
        await new Promise<void>((resolve, reject) => {
          socket!.once("connect", () => resolve());
          socket!.once("connect_error", reject);
        });
        await waitFor(
          async () => latest,
          (s) => s?.room.connected.red === true,
        );
        const currentResponse = await fetch(`${base}/rooms/${entry.roomId}`, {
          headers: headers(a),
        });
        expect(currentResponse.status).toBe(200);
        const current = await currentResponse.json();
        expect(
          await post(`/rooms/${entry.roomId}/leave`, a, {
            expectedVersion: current.version,
          }),
        ).toMatchObject({ left: true });
        const changed = await waitFor(
          async () => latest,
          (s) => s?.room.hostId === b.id && s.room.seats.black === null,
        );
        expect(changed?.room.status).toBe("WAITING");
        expect(
          (
            await pool.query(
              "SELECT count(*)::int n FROM public.room_members WHERE room_id=$1 AND user_id=$2",
              [entry.roomId, a.id],
            )
          ).rows[0].n,
        ).toBe(0);
      } finally {
        socket?.disconnect();
        await runtime.close();
        await app.close();
      }
    }, 10000);
    it("starts a real three-second countdown and match, publishes moves, then records physical disconnect grace", async () => {
      const r = registration(),
        a = await member(r),
        b = await member(r),
        runtime = await createRoomRuntime(env, r.context);
      if (!runtime) throw new Error("missing runtime");
      const app = await createApp(
        ["http://localhost:5173"],
        [runtime.module],
        null,
        runtime.realtime,
      );
      const sockets: Socket[] = [];
      try {
        await app.listen(0, "127.0.0.1");
        await runtime.start();
        const base = `http://127.0.0.1:${(app.getHttpServer().address() as AddressInfo).port}`;
        const post = async (path: string, m: typeof a, body: object) => {
          const response = await fetch(base + path, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + m.token,
              "X-Xiangqi-Session": m.appSession,
            },
            body: JSON.stringify(body),
          });
          expect(response.status).toBe(200);
          return response.json();
        };
        const entry = await post("/rooms", a, {
          commandId: randomUUID(),
          name: "Runtime Room",
          timeMinutes: 5,
        });
        await post("/rooms/join", b, {
          commandId: randomUUID(),
          code: entry.inviteCode,
          preference: "play",
        });
        const snapshots = new Map<string, RoomSnapshot>();
        for (const m of [a, b]) {
          const socket = io(base, {
            transports: ["websocket"],
            auth: {
              accessToken: m.token,
              appSession: m.appSession,
              roomId: entry.roomId,
              tabId: randomUUID(),
            },
            reconnection: false,
          });
          sockets.push(socket);
          socket.on("room.snapshot", (snapshot) =>
            snapshots.set(m.id, snapshot),
          );
          await new Promise<void>((resolve, reject) => {
            socket.once("connect", () => resolve());
            socket.once("connect_error", reject);
          });
        }
        await waitFor(
          async () => snapshots.get(a.id),
          (s) => Boolean(s?.room.connected.red && s?.room.connected.black),
        );
        const command = async (i: number, action: object) => {
          const s = snapshots.get([a, b][i]!.id);
          if (!s) throw new Error("Synthetic peer lacks snapshot");
          return new Promise<CommandAcknowledgement>((resolve) =>
            sockets[i]!.emit(
              "room.command",
              {
                commandId: randomUUID(),
                roomId: entry.roomId,
                expectedVersion: s.version,
                action,
              },
              resolve,
            ),
          );
        };
        expect(
          (await command(0, { type: "room.ready", payload: { ready: true } }))
            .status,
        ).toBe("ok");
        await waitFor(
          async () => snapshots.get(b.id),
          (s) => s?.room.ready.red === true,
        );
        expect(
          (await command(1, { type: "room.ready", payload: { ready: true } }))
            .status,
        ).toBe("ok");
        const started = await waitFor(
          async () => snapshots.get(a.id),
          (s) => s?.match?.status === "ACTIVE",
          8000,
        );
        expect(started.room.status).toBe("PLAYING");
        const move = await command(0, {
          type: "match.move",
          payload: {
            matchId: started.match.id,
            matchVersion: started.match.version,
            from: 54,
            to: 45,
          },
        });
        expect(move.status).toBe("ok");
        await waitFor(
          async () => snapshots.get(b.id),
          (s) => s?.match?.version === 1,
        );
        sockets[1]!.disconnect();
        await waitFor(
          async () =>
            (
              await pool.query(
                "SELECT disconnected_at FROM public.room_members WHERE room_id=$1 AND user_id=$2",
                [entry.roomId, b.id],
              )
            ).rows[0],
          (row) => row?.disconnected_at instanceof Date,
        );
        expect(snapshots.get(a.id).match.status).toBe("ACTIVE");
        await pool.query(
          "UPDATE public.matches SET clock=jsonb_set(clock,'{blackMs}','0'::jsonb) WHERE id=$1",
          [started.match.id],
        );
        const terminal = await waitFor(
          async () => snapshots.get(a.id),
          (s) => s?.match?.status === "FINISHED",
        );
        expect(terminal?.room.status).toBe("WAITING");
        expect(terminal?.match).toMatchObject({
          winner: "red",
          result: "TIMEOUT",
        });
        expect(terminal?.clocks?.running).toBeNull();
      } finally {
        for (const socket of sockets) socket.disconnect();
        await runtime.close();
        await app.close();
      }
      expect((await pool.query("SELECT 1 AS n")).rows[0].n).toBe(1);
    }, 15000);
  },
);
