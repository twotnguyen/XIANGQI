import { randomUUID } from "node:crypto";
import type { AddressInfo } from "node:net";
import type {
  RoomAction,
  RoomSnapshot,
  CommandAcknowledgement,
} from "@xiangqi/shared";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { io, type Socket } from "socket.io-client";
import { createApp } from "./app.js";
import type { createRegistrationRuntime } from "./auth-runtime.js";
import { SessionService } from "./login/session.service.js";
import { PostgresLoginStore } from "./login/postgres-login-store.js";
import { createRoomRuntime } from "./room-runtime.js";
import { apply, databaseUrl, pool, reset } from "./room-runtime.test-helper.js";
const env = { ROOMS_ENABLED: "true", AUTH_LOGIN_ENABLED: "true" };
type Registration = NonNullable<
  Awaited<ReturnType<typeof createRegistrationRuntime>>
>;
function registration() {
  const users = new Map<
    string,
    { id: string; email: string; email_confirmed_at: string }
  >();
  // Explicit synthetic GoTrue boundary; SQL/session/HTTP/Socket/runtime are real.
  const auth = {
    signInPassword: vi.fn(),
    getUser: vi.fn(async (token: string) => {
      const user = users.get(token);
      if (!user) throw new Error("Synthetic provider invalid session");
      return user;
    }),
  };
  const sessions = new SessionService(new PostgresLoginStore(pool), auth);
  return {
    users,
    context: { pool, sessions, auth } as unknown as Registration,
    sessions,
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
    "INSERT INTO public.profiles(user_id,username,display_name,completed_at,registration_pending) VALUES($1,$2,'Synthetic Draw Runtime',$3,false)",
    [id, "m" + id.replaceAll("-", "").slice(0, 18), at],
  );
  const token = "synthetic-" + id;
  r.users.set(token, { id, email, email_confirmed_at: at.toISOString() });
  return {
    id,
    token,
    appSession: (await r.sessions.issue(id, false)).appSession,
  };
}
async function waitFor<T>(
  read: () => Promise<T>,
  accept: (value: T) => boolean,
  timeout = 7000,
) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const value = await read();
    if (accept(value)) return value;
    await new Promise((r) => setTimeout(r, 20));
  }
  throw new Error("Synthetic runtime publication deadline exceeded");
}
async function playing() {
  const r = registration(),
    players = [await member(r), await member(r)];
  const runtime = await createRoomRuntime(env, r.context);
  if (!runtime) throw new Error("Missing actual runtime");
  const app = await createApp(
      ["http://localhost:5173"],
      [runtime.module],
      null,
      runtime.realtime,
    ),
    sockets: Socket[] = [],
    snapshots = new Map<string, RoomSnapshot>();
  const close = async () => {
    for (const socket of sockets) socket.disconnect();
    await runtime.close();
    await app.close();
  };
  try {
    await app.listen(0, "127.0.0.1");
    await runtime.start();
    const base = `http://127.0.0.1:${(app.getHttpServer().address() as AddressInfo).port}`;
    const post = async (path: string, index: number, body: object) =>
      fetch(base + path, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + players[index]!.token,
          "X-Xiangqi-Session": players[index]!.appSession,
        },
        body: JSON.stringify(body),
      });
    const created = await post("/rooms", 0, {
      commandId: randomUUID(),
      name: "Runtime Draw Gate",
      timeMinutes: 5,
    });
    expect(created.status).toBe(200);
    const entry = (await created.json()) as {
      roomId: string;
      inviteCode: string;
    };
    expect(
      (
        await post("/rooms/join", 1, {
          commandId: randomUUID(),
          code: entry.inviteCode,
          preference: "play",
        })
      ).status,
    ).toBe(200);
    for (const player of players) {
      const socket = io(base, {
        autoConnect: false,
        reconnection: false,
        transports: ["websocket"],
        auth: {
          accessToken: player.token,
          appSession: player.appSession,
          roomId: entry.roomId,
          tabId: randomUUID(),
        },
      });
      sockets.push(socket);
      socket.on("room.snapshot", (value: RoomSnapshot) =>
        snapshots.set(player.id, value),
      );
      const connected = new Promise<void>((resolve, reject) => {
        socket.once("connect", () => resolve());
        socket.once("connect_error", reject);
      });
      socket.connect();
      await connected;
    }
    const latest = (index: number) => snapshots.get(players[index]!.id);
    const command = (index: number, action: RoomAction) =>
      new Promise<CommandAcknowledgement>((resolve, reject) => {
        const state = latest(index);
        if (!state) {
          reject(new Error("No admitted snapshot"));
          return;
        }
        sockets[index]!.timeout(5000).emit(
          "room.command",
          {
            commandId: randomUUID(),
            roomId: entry.roomId,
            expectedVersion: state.version,
            action,
          },
          (error: Error | null, ack: CommandAcknowledgement) =>
            error ? reject(error) : resolve(ack),
        );
      });
    await waitFor(
      async () => latest(0),
      (s) => Boolean(s?.room.connected.red && s?.room.connected.black),
    );
    expect(
      (await command(0, { type: "room.ready", payload: { ready: true } }))
        .status,
    ).toBe("ok");
    await waitFor(
      async () => latest(1),
      (s) => s?.room.ready.red === true,
    );
    expect(
      (await command(1, { type: "room.ready", payload: { ready: true } }))
        .status,
    ).toBe("ok");
    await waitFor(
      async () => latest(0),
      (s) => s?.match?.status === "ACTIVE",
      8000,
    );
    await waitFor(
      async () => latest(1),
      (s) => s?.match?.status === "ACTIVE",
    );
    return {
      runtime,
      app,
      players,
      roomId: entry.roomId,
      latest,
      command,
      post,
      close,
    };
  } catch (error) {
    await close();
    throw error;
  }
}
async function drawSchema() {
  await apply("supabase/migrations/20261011000008_room_modes.sql");
  await apply("supabase/migrations/20261011000009_match_draw.sql");
}
afterAll(() => pool.end());
describe.skipIf(!databaseUrl)(
  "actual runtime draw/leave integration gate",
  () => {
    beforeEach(reset);
    it("publishes offers to both peers and automatically expires them with cooldown without resetting the running clock", async () => {
      await drawSchema();
      const f = await playing();
      try {
        const started = f.latest(0)!;
        expect(started.draw).toEqual({
          offers: [],
          remainingMoves: { red: 0, black: 0 },
        });
        expect(
          (
            await f.command(0, {
              type: "match.draw.offer",
              payload: {
                matchId: started.match!.id,
                matchVersion: started.match!.version,
              },
            })
          ).status,
        ).toBe("ok");
        const offered = await waitFor(
          async () => f.latest(1),
          (s) => s?.draw?.offers.length === 1,
        );
        await waitFor(
          async () => f.latest(0),
          (s) => s?.draw?.offers.length === 1,
        );
        expect(offered.draw!.offers[0]!.sender).toBe("red");
        const offer = offered.draw!.offers[0]!;
        const before = (
          await pool.query("SELECT clock FROM public.matches WHERE id=$1", [
            started.match!.id,
          ])
        ).rows[0].clock;
        // Synthetic boundary crossing keeps the real schema's exact 30-second invariant.
        await pool.query(
          "WITH stamp AS (SELECT clock_timestamp() AS now) UPDATE xiangqi_room.match_draw_offers SET created_at=stamp.now-interval '31 seconds',expires_at=stamp.now-interval '1 second' FROM stamp WHERE id=$1",
          [offer.id],
        );
        await waitFor(
          async () => f.latest(0),
          (s) =>
            s?.draw?.offers.length === 0 && s.draw.remainingMoves.red === 5,
        );
        await waitFor(
          async () => f.latest(1),
          (s) =>
            s?.draw?.offers.length === 0 && s.draw.remainingMoves.red === 5,
        );
        // Clock snapshots hide elapsed offers before the draw worker commits expiry.
        // Require its canonical transition as well as both peer publications.
        const expired = await waitFor(
          async () =>
            (
              await pool.query(
                "SELECT status,cooldown_after_move_count FROM xiangqi_room.match_draw_offers WHERE id=$1",
                [offer.id],
              )
            ).rows[0],
          (row) =>
            row?.status === "EXPIRED" && row.cooldown_after_move_count === 0,
        );
        expect(expired).toEqual({
          status: "EXPIRED",
          cooldown_after_move_count: 0,
        });
        expect(
          (
            await pool.query("SELECT clock FROM public.matches WHERE id=$1", [
              started.match!.id,
            ])
          ).rows[0].clock,
        ).toEqual(before);
        expect(f.latest(1)!.clocks!.redMs).toBeLessThanOrEqual(
          offered.clocks!.redMs,
        );
        expect(f.latest(1)!.match!.status).toBe("ACTIVE");
        expect(
          (
            await pool.query(
              "SELECT count(*)::int n FROM public.match_events WHERE match_id=$1 AND type='RESULT'",
              [started.match!.id],
            )
          ).rows[0].n,
        ).toBe(0);
      } finally {
        await f.close();
      }
    }, 20000);
    it("actual protected HTTP leave during play resigns once, releases the host seat and publishes the terminal snapshot", async () => {
      await drawSchema();
      const f = await playing();
      try {
        const started = f.latest(0)!,
          matchId = started.match!.id;
        const response = await f.post(`/rooms/${f.roomId}/leave`, 0, {
          expectedVersion: started.version,
        });
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ roomId: f.roomId, left: true });
        const peer = await waitFor(
          async () => f.latest(1),
          (s) => s?.room.status === "WAITING" && s.match?.result === "RESIGN",
        );
        expect(peer.match).toMatchObject({ result: "RESIGN", winner: "black" });
        expect(peer.room.hostId).toBe(f.players[1]!.id);
        expect(peer.room.seats).toEqual({ red: null, black: f.players[1]!.id });
        expect(peer.room.ready).toEqual({ red: false, black: false });
        expect(
          (
            await pool.query(
              "SELECT user_id,match_id FROM public.active_players WHERE room_id=$1",
              [f.roomId],
            )
          ).rows,
        ).toEqual([{ user_id: f.players[1]!.id, match_id: null }]);
        expect(
          (
            await pool.query(
              "SELECT count(*)::int n FROM public.match_events WHERE match_id=$1 AND type='RESULT'",
              [matchId],
            )
          ).rows[0].n,
        ).toBe(1);
        expect(
          (
            await pool.query(
              "SELECT count(*)::int n FROM xiangqi_room.outbox WHERE room_id=$1 AND type='MATCH_RESULT'",
              [f.roomId],
            )
          ).rows[0].n,
        ).toBe(1);
      } finally {
        await f.close();
      }
    }, 20000);
    it("keeps movement operational on schema1–7 while draw actions fail closed", async () => {
      const f = await playing();
      try {
        const started = f.latest(0)!;
        expect(started.draw).toBeNull();
        const rejected = await f.command(0, {
          type: "match.draw.offer",
          payload: {
            matchId: started.match!.id,
            matchVersion: started.match!.version,
          },
        });
        expect(rejected.status).toBe("error");
        expect(
          (
            await pool.query(
              "SELECT count(*)::int n FROM public.match_events WHERE match_id=$1",
              [started.match!.id],
            )
          ).rows[0].n,
        ).toBe(1);
        expect(
          (
            await f.command(0, {
              type: "match.move",
              payload: {
                matchId: started.match!.id,
                matchVersion: started.match!.version,
                from: 54,
                to: 45,
              },
            })
          ).status,
        ).toBe("ok");
        await waitFor(
          async () => f.latest(1),
          (s) => s?.match?.version === 1,
        );
        expect(f.latest(1)!.match!.lastMove).toMatchObject({
          from: 54,
          to: 45,
        });
      } finally {
        await f.close();
      }
    }, 20000);
    it("fails closed at startup when optional schema9 exists but its required update capability was revoked", async () => {
      await drawSchema();
      await pool.query(
        "REVOKE UPDATE ON xiangqi_room.match_draw_offers FROM app_server",
      );
      let unexpected: Awaited<ReturnType<typeof createRoomRuntime>> | undefined;
      try {
        await expect(
          createRoomRuntime(env, registration().context).then((value) => {
            unexpected = value;
            return "unexpected-ready";
          }),
        ).rejects.toThrow();
      } finally {
        await unexpected?.close();
      }
    });
  },
);
