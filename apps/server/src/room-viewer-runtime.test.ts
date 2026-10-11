import { randomUUID } from "node:crypto";
import type { AddressInfo } from "node:net";
import type { CommandAcknowledgement, RoomSnapshot } from "@xiangqi/shared";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { io, type Socket } from "socket.io-client";
import { createApp } from "./app.js";
import type { createRegistrationRuntime } from "./auth-runtime.js";
import { SessionService } from "./login/session.service.js";
import { PostgresLoginStore } from "./login/postgres-login-store.js";
import { createRoomRuntime } from "./room-runtime.js";
import { databaseUrl, pool, reset } from "./room-runtime.test-helper.js";

type Registration = NonNullable<
  Awaited<ReturnType<typeof createRegistrationRuntime>>
>;
async function waitFor<T>(
  read: () => Promise<T>,
  accepts: (value: T) => boolean,
) {
  const until = Date.now() + 8000;
  while (Date.now() < until) {
    const value = await read();
    if (accepts(value)) return value;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error("Synthetic viewer runtime wait timed out");
}
async function fixture() {
  // Only the upstream GoTrue getUser boundary is synthetic; session SQL,
  // HTTP authorization, Socket.IO, presence and scheduler are actual services.
  const users = new Map<
    string,
    { id: string; email: string; email_confirmed_at: string }
  >();
  const auth = {
    signInPassword: vi.fn(),
    getUser: vi.fn(async (token: string) => {
      const user = users.get(token);
      if (!user) throw new Error("Synthetic invalid bearer");
      return user;
    }),
  };
  const sessions = new SessionService(new PostgresLoginStore(pool), auth);
  const members = await Promise.all(
    [0, 1, 2].map(async () => {
      const id = randomUUID(),
        at = new Date(),
        email = `synthetic-${id}@example.invalid`;
      await pool.query(
        "INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,$2,$3)",
        [id, email, at],
      );
      await pool.query(
        "INSERT INTO public.profiles(user_id,username,display_name,completed_at,registration_pending) VALUES($1,$2,'Synthetic Viewer',$3,false)",
        [id, "v" + id.replaceAll("-", "").slice(0, 18), at],
      );
      const token = "synthetic-" + id;
      users.set(token, { id, email, email_confirmed_at: at.toISOString() });
      return {
        id,
        token,
        appSession: (await sessions.issue(id, false)).appSession,
      };
    }),
  );
  const [red, black, viewer] = members;
  if (!red || !black || !viewer) throw new Error("Missing synthetic members");
  const runtime = await createRoomRuntime(
    { ROOMS_ENABLED: "true", AUTH_LOGIN_ENABLED: "true" },
    { pool, sessions, auth } as unknown as Registration,
  );
  if (!runtime) throw new Error("Missing actual room runtime");
  const app = await createApp(
    ["http://localhost:5173"],
    [runtime.module],
    null,
    runtime.realtime,
  );
  await app.listen(0, "127.0.0.1");
  await runtime.start();
  const base = `http://127.0.0.1:${(app.getHttpServer().address() as AddressInfo).port}`;
  const sockets: Socket[] = [];
  async function post(member: typeof red, path: string, body: object) {
    const response = await fetch(base + path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + member.token,
        "X-Xiangqi-Session": member.appSession,
      },
      body: JSON.stringify(body),
    });
    expect(response.status).toBe(200);
    return response.json() as Promise<{
      roomId: string;
      inviteCode: string;
      role: string;
    }>;
  }
  const entry = await post(red, "/rooms", {
    commandId: randomUUID(),
    name: "Native Viewer Runtime",
    timeMinutes: 5,
  });
  await post(black, "/rooms/join", {
    commandId: randomUUID(),
    code: entry.inviteCode,
    preference: "play",
  });
  const joinViewer = () =>
    post(viewer, "/rooms/join", {
      commandId: randomUUID(),
      code: entry.inviteCode,
      preference: "watch",
    });
  async function peer(member: typeof red) {
    let latest: RoomSnapshot | undefined;
    const socket = io(base, {
      autoConnect: false,
      transports: ["websocket"],
      reconnection: false,
      auth: {
        accessToken: member.token,
        appSession: member.appSession,
        roomId: entry.roomId,
        tabId: randomUUID(),
      },
    });
    sockets.push(socket);
    socket.on("room.snapshot", (value: RoomSnapshot) => {
      latest = value;
    });
    const connected = new Promise<void>((resolve, reject) => {
      socket.once("connect", resolve);
      socket.once("connect_error", reject);
    });
    socket.connect();
    await connected;
    await waitFor(
      async () => latest,
      (s) => Boolean(s),
    );
    return {
      socket,
      latest: () => latest,
      ready: () =>
        new Promise<CommandAcknowledgement>((resolve) =>
          socket.emit(
            "room.command",
            {
              commandId: randomUUID(),
              roomId: entry.roomId,
              expectedVersion: latest!.version,
              action: { type: "room.ready", payload: { ready: true } },
            },
            resolve,
          ),
        ),
    };
  }
  const presence = async () =>
    (
      await pool.query(
        "SELECT p.connection_id,p.generation::text,p.connected,m.disconnected_at FROM public.room_members m LEFT JOIN xiangqi_room.presence p USING(room_id,user_id) WHERE m.room_id=$1 AND m.user_id=$2",
        [entry.roomId, viewer.id],
      )
    ).rows[0];
  return {
    entry,
    red,
    black,
    viewer,
    joinViewer,
    peer,
    presence,
    close: async () => {
      sockets.forEach((s) => s.disconnect());
      await runtime.close();
      await app.close();
    },
  };
}
afterAll(() => pool.end());
describe.skipIf(!databaseUrl)(
  "actual room viewer HTTP/Socket/runtime on isolated synthetic SQL",
  () => {
    beforeEach(reset);
    it("readonly viewer presence survives another tab closing and HTTP rejoin before five minutes", async () => {
      const f = await fixture();
      try {
        expect((await f.joinViewer()).role).toBe("spectator");
        const first = await f.peer(f.viewer);
        expect(first.latest()).toMatchObject({
          role: "spectator",
          control: { mode: "readonly", generation: 0, reason: "not_allowed" },
        });
        const initial = await f.presence();
        expect(initial).toMatchObject({
          connection_id: first.socket.id,
          connected: true,
          disconnected_at: null,
        });
        expect(Number(initial.generation)).toBeGreaterThan(0);
        expect(
          (
            await pool.query(
              "SELECT count(*)::int n FROM xiangqi_realtime.controllers WHERE user_id=$1 AND room_id=$2",
              [f.viewer.id, f.entry.roomId],
            )
          ).rows[0].n,
        ).toBe(0);
        const second = await f.peer(f.viewer);
        const secondId = second.socket.id;
        await waitFor(f.presence, (p) => p?.connection_id === secondId);
        second.socket.disconnect();
        const rebound = await waitFor(
          f.presence,
          (p) => p?.connection_id === first.socket.id && p.connected,
        );
        expect(Number(rebound.generation)).toBeGreaterThan(
          Number(initial.generation),
        );
        const firstId = first.socket.id;
        first.socket.disconnect();
        const offline = await waitFor(
          f.presence,
          (p) => p?.connected === false,
        );
        expect(offline.connection_id).toBe(firstId);
        expect(offline.disconnected_at).toBeInstanceOf(Date);
        expect((await f.joinViewer()).role).toBe("spectator");
        expect((await f.presence()).disconnected_at).toEqual(
          offline.disconnected_at,
        );
        const returned = await f.peer(f.viewer);
        expect(returned.latest()?.control.mode).toBe("readonly");
        expect(await f.presence()).toMatchObject({
          connected: true,
          disconnected_at: null,
        });
        expect(
          (
            await pool.query(
              "SELECT count(*)::int n FROM public.room_members WHERE room_id=$1 AND user_id=$2 AND role='SPECTATOR'",
              [f.entry.roomId, f.viewer.id],
            )
          ).rows[0].n,
        ).toBe(1);
      } finally {
        await f.close();
      }
    }, 15000);
    it("scheduler removes a physically disconnected viewer at five minutes while preserving the active match and both players", async () => {
      const f = await fixture();
      try {
        const red = await f.peer(f.red),
          black = await f.peer(f.black);
        await waitFor(
          async () => red.latest(),
          (s) => Boolean(s?.room.connected.red && s.room.connected.black),
        );
        expect((await red.ready()).status).toBe("ok");
        await waitFor(
          async () => black.latest(),
          (s) => s?.room.ready.red === true,
        );
        expect((await black.ready()).status).toBe("ok");
        const started = await waitFor(
          async () => red.latest(),
          (s) => s?.match?.status === "ACTIVE",
        );
        const matchId = started!.match!.id;
        await f.joinViewer();
        const watching = await f.peer(f.viewer);
        expect(watching.latest()).toMatchObject({
          role: "spectator",
          control: { mode: "readonly", generation: 0 },
          match: { id: matchId, status: "ACTIVE" },
        });
        expect((await f.presence()).connected).toBe(true);
        watching.socket.disconnect();
        await waitFor(f.presence, (p) => p?.connected === false);
        // Explicit helper allowlist guarantees this backdate only touches the named synthetic DB.
        await pool.query(
          "UPDATE public.room_members SET disconnected_at=clock_timestamp()-interval '301 seconds' WHERE room_id=$1 AND user_id=$2 AND role='SPECTATOR'",
          [f.entry.roomId, f.viewer.id],
        );
        await waitFor(f.presence, (p) => p === undefined);
        expect(
          (
            await pool.query(
              "SELECT r.status,r.current_match_id,m.status AS match_status FROM public.rooms r JOIN public.matches m ON m.id=r.current_match_id WHERE r.id=$1",
              [f.entry.roomId],
            )
          ).rows[0],
        ).toMatchObject({
          status: "PLAYING",
          current_match_id: matchId,
          match_status: "ACTIVE",
        });
        expect(
          (
            await pool.query(
              "SELECT user_id FROM public.room_members WHERE room_id=$1 AND role='PLAYER' ORDER BY user_id",
              [f.entry.roomId],
            )
          ).rows.map((r: { user_id: string }) => r.user_id),
        ).toEqual([f.red.id, f.black.id].sort());
        expect(
          (
            await pool.query(
              "SELECT count(*)::int n FROM public.active_players WHERE room_id=$1 AND match_id=$2",
              [f.entry.roomId, matchId],
            )
          ).rows[0].n,
        ).toBe(2);
      } finally {
        await f.close();
      }
    }, 15000);
  },
);
