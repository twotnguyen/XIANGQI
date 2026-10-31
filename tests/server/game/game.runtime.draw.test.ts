import { randomUUID } from "node:crypto";
import type { AddressInfo } from "node:net";
import type {
  RoomAction,
  RoomSnapshot,
  CommandAcknowledgement,
} from "@xiangqi/shared";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { io, type Socket } from "socket.io-client";
import { createApp } from "@server/app.js";
import type { createRegistrationRuntime } from "@server/account/auth/registration.module.js";
import { SessionService } from "@server/account/login/session.service.js";
import {
  createLoginPool,
  PostgresLoginStore,
} from "@server/account/login/postgres-login-store.js";
import { createRoomRuntime } from "@server/game/game.runtime.js";
import {
  databaseUrl,
  pool,
  reset,
  roomControl,
} from "./game.runtime.test-helper.js";
const loginPool = createLoginPool({ connectionString: databaseUrl });
const env = { ROOMS_ENABLED: "true", AUTH_LOGIN_ENABLED: "true" };
type Registration = NonNullable<
  Awaited<ReturnType<typeof createRegistrationRuntime>>
>;
function registration() {
  const users = new Map<
    string,
    { id: string; email: string; email_confirmed_at: string }
  >();
  // Explicit synthetic token-verifier boundary; SQL/session/HTTP/Socket/runtime are real.
  const auth = {
    signInPassword: vi.fn(),
    verifyAccessToken: vi.fn(async (token: string) => {
      const user = users.get(token);
      if (!user) throw new Error("Synthetic provider invalid session");
      return { userId: user.id, email: user.email };
    }),
  };
  const sessions = new SessionService(new PostgresLoginStore(loginPool), auth);
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
async function playing(timeMinutes = 5) {
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
      timeMinutes,
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
          (error: Error | null, ack: CommandAcknowledgement) => {
            if (error) {
              reject(error);
              return;
            }
            const current = latest(index);
            if (
              ack.snapshot &&
              (!current ||
                (ack.snapshot.version >= current.version &&
                  ack.snapshot.control.generation >=
                    current.control.generation))
            )
              snapshots.set(players[index]!.id, ack.snapshot);
            resolve(ack);
          },
        );
      });
    await waitFor(
      async () => latest(0),
      (s) => Boolean(s?.room.connected.red && s?.room.connected.black),
    );
    expect(
      (await command(1, { type: "room.ready", payload: { ready: true } }))
        .status,
    ).toBe("ok");
    await waitFor(
      async () => latest(0),
      (s) => s?.room.ready.black === true,
    );
    expect((await command(0, { type: "room.start", payload: {} })).status).toBe(
      "ok",
    );
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
      sockets,
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
afterAll(async () => {
  await pool.end();
  await loginPool.end();
});
describe.skipIf(!databaseUrl)(
  "actual runtime draw/leave integration gate",
  () => {
    beforeEach(reset);
    it("publishes offers to both peers and automatically expires them with cooldown without resetting the running clock", async () => {
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
        expect(offered!.draw!.offers[0]!.sender).toBe("red");
        const offer = offered!.draw!.offers[0]!;
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
          offered!.clocks!.redMs,
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
      const f = await playing();
      try {
        const started = f.latest(0)!,
          matchId = started.match!.id;
        const response = await f.post(`/rooms/${f.roomId}/leave`, 0, {
          expectedVersion: started.version,
          control: await roomControl(f.sockets[0]!),
        });
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ roomId: f.roomId, left: true });
        const peer = await waitFor(
          async () => f.latest(1),
          (s) => s?.room.status === "WAITING" && s.match?.result === "RESIGN",
        );
        expect(peer!.match).toMatchObject({
          result: "RESIGN",
          winner: "black",
        });
        expect(peer!.room.hostId).toBe(f.players[1]!.id);
        expect(peer!.room.seats).toEqual({
          red: null,
          black: f.players[1]!.id,
        });
        expect(peer!.room.ready).toEqual({ red: false, black: false });
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
    it("fails closed at startup when optional schema9 exists but its required update capability was revoked", async () => {
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

describe.skipIf(!databaseUrl)("actual runtime unlimited match gates", () => {
  beforeEach(reset);
  // Synthetic boundary: moves the server-owned anchor past the 3-minute prompt without waiting in real time.
  const ageAnchor = (matchId: string, ms: number) =>
    pool.query(
      "UPDATE public.matches SET clock=jsonb_set(clock,'{runningSinceEpochMs}',to_jsonb((floor(extract(epoch FROM clock_timestamp())*1000)-$2::numeric)::bigint)) WHERE id=$1",
      [matchId, ms],
    );
  it("still-here is idempotent per commandId, a fresh retry before the next prompt is rejected, and a move resets the chain", async () => {
    const f = await playing(0);
    try {
      const started = f.latest(0)!;
      const matchId = started.match!.id;
      expect(started.match!.inactivity!.confirmsLeft).toBe(2);
      await ageAnchor(matchId, 181_000);
      const ack = (commandId: string) =>
        new Promise<CommandAcknowledgement>((resolve, reject) => {
          f.sockets[0]!.timeout(5000).emit(
            "room.command",
            {
              commandId,
              roomId: f.roomId,
              expectedVersion: f.latest(0)!.version,
              action: {
                type: "match.still-here",
                payload: { matchId, matchVersion: started.match!.version },
              },
            },
            (error: Error | null, value: CommandAcknowledgement) =>
              error ? reject(error) : resolve(value),
          );
        });
      const commandId = randomUUID();
      const first = await ack(commandId);
      if (first.status !== "ok")
        throw new Error("First match.still-here must succeed");
      expect(first.snapshot.match!.inactivity!.confirmsLeft).toBe(1);
      // Same commandId returns the stored receipt; it must not count a second extension.
      expect(await ack(commandId)).toEqual(first);
      // A fresh commandId after success is still before the new prompt and must be rejected.
      expect((await ack(randomUUID())).status).toBe("error");
      expect(
        (
          await pool.query(
            "SELECT inactivity_extensions n FROM public.matches WHERE id=$1",
            [matchId],
          )
        ).rows[0].n,
      ).toBe(1);
      expect(
        (
          await f.command(0, {
            type: "match.move",
            payload: {
              matchId,
              matchVersion: started.match!.version,
              from: 54,
              to: 45,
            },
          })
        ).status,
      ).toBe("ok");
      expect(
        (
          await pool.query(
            "SELECT inactivity_extensions n FROM public.matches WHERE id=$1",
            [matchId],
          )
        ).rows[0].n,
      ).toBe(0);
    } finally {
      await f.close();
    }
  }, 20000);
  it("expires an unlimited match after prompt plus 30 seconds with INACTIVITY and the side to move loses", async () => {
    const f = await playing(0);
    try {
      const matchId = f.latest(0)!.match!.id;
      await ageAnchor(matchId, 211_000);
      // Clock worker must finish the match through the server-owned deadline.
      const finished = await waitFor(
        async () =>
          (
            await pool.query(
              "SELECT status,outcome FROM public.matches WHERE id=$1",
              [matchId],
            )
          ).rows[0],
        (row) => row?.status === "FINISHED",
      );
      expect(finished.outcome).toMatchObject({
        reason: "INACTIVITY",
        winner: "BLACK",
      });
    } finally {
      await f.close();
    }
  }, 20000);
  it("keeps draw expiry for unlimited matches", async () => {
    const f = await playing(0);
    try {
      const started = f.latest(0)!;
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
      const offer = await waitFor(
        async () =>
          (
            await pool.query(
              "SELECT id FROM xiangqi_room.match_draw_offers WHERE match_id=$1 AND status='PENDING'",
              [started.match!.id],
            )
          ).rows[0],
        (row) => Boolean(row),
      );
      await pool.query(
        "WITH stamp AS (SELECT clock_timestamp() AS now) UPDATE xiangqi_room.match_draw_offers SET created_at=stamp.now-interval '31 seconds',expires_at=stamp.now-interval '1 second' FROM stamp WHERE id=$1",
        [offer.id],
      );
      await waitFor(
        async () =>
          (
            await pool.query(
              "SELECT status FROM xiangqi_room.match_draw_offers WHERE id=$1",
              [offer.id],
            )
          ).rows[0],
        (row) => row?.status === "EXPIRED",
        15000,
      );
    } finally {
      await f.close();
    }
  }, 30000);
  it("keeps disconnect forfeit for unlimited matches after the 60-second grace", async () => {
    const f = await playing(0);
    try {
      const matchId = f.latest(0)!.match!.id;
      const roomId = f.roomId;
      const leaver = f.players[1]!;
      f.sockets[1]!.disconnect();
      await waitFor(
        async () =>
          (
            await pool.query(
              "SELECT disconnected_at FROM public.room_members WHERE room_id=$1 AND user_id=$2",
              [roomId, leaver.id],
            )
          ).rows[0],
        (row) => row?.disconnected_at instanceof Date,
      );
      await pool.query(
        "UPDATE public.room_members SET disconnected_at=clock_timestamp()-interval '61 seconds' WHERE room_id=$1 AND user_id=$2",
        [roomId, leaver.id],
      );
      const finished = await waitFor(
        async () =>
          (
            await pool.query(
              "SELECT status,outcome,red_user_id FROM public.matches WHERE id=$1",
              [matchId],
            )
          ).rows[0],
        (row) => row?.status === "FINISHED",
        15000,
      );
      expect(finished.outcome.reason).toBe("DISCONNECT");
      expect(finished.outcome.winner).toBe(
        finished.red_user_id === leaver.id ? "BLACK" : "RED",
      );
    } finally {
      await f.close();
    }
  }, 30000);
});
