import { randomUUID } from "node:crypto";
import type { AddressInfo } from "node:net";
import type { CommandAcknowledgement, RoomSnapshot } from "@xiangqi/shared";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
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
  accept: (value: T) => boolean,
  timeout = 7000,
): Promise<T> {
  const until = Date.now() + timeout;
  while (Date.now() < until) {
    const value = await read();
    if (accept(value)) return value;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error("Synthetic disconnect runtime wait timed out");
}

afterAll(() => pool.end());
describe.skipIf(!databaseUrl)(
  "managed runtime physical disconnect adjudication",
  () => {
    beforeEach(reset);
    it("keeps a real match in grace, then automatically ends DISCONNECT, transfers Host and denies the old seat", async () => {
      // Only remote Auth is synthetic. Native Nest HTTP, Socket.io, session capabilities,
      // room/countdown/match/presence SQL and the automatic runtime scheduler are real.
      const users = new Map<
        string,
        { id: string; email: string; email_confirmed_at: string }
      >();
      const auth = {
        getUser: async (token: string) => {
          const user = users.get(token);
          if (!user) throw new Error("Synthetic provider rejected bearer");
          return user;
        },
      };
      const sessions = new SessionService(new PostgresLoginStore(pool), auth);
      async function member() {
        const id = randomUUID(),
          email = `synthetic-${id}@example.invalid`,
          at = new Date();
        await pool.query(
          "INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,$2,$3)",
          [id, email, at],
        );
        await pool.query(
          "INSERT INTO public.profiles(user_id,username,display_name,completed_at,registration_pending) VALUES($1,$2,'Synthetic Disconnect',$3,false)",
          [id, "m" + id.replaceAll("-", "").slice(0, 18), at],
        );
        const token = "synthetic-" + id;
        users.set(token, { id, email, email_confirmed_at: at.toISOString() });
        return {
          id,
          token,
          appSession: (await sessions.issue(id, false)).appSession,
          tabId: randomUUID(),
        };
      }
      const a = await member(),
        b = await member();
      // Construct before room creation so startup recovery cannot fabricate this result.
      const runtime = await createRoomRuntime(
        { ROOMS_ENABLED: "true", AUTH_LOGIN_ENABLED: "true" },
        { pool, sessions, auth } as unknown as Registration,
      );
      if (!runtime) throw new Error("Synthetic runtime missing");
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
          name: "Disconnect Runtime",
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
            autoConnect: false,
            transports: ["websocket"],
            reconnection: false,
            auth: {
              accessToken: m.token,
              appSession: m.appSession,
              roomId: entry.roomId,
              tabId: m.tabId,
            },
          });
          sockets.push(socket);
          socket.on("room.snapshot", (snapshot) =>
            snapshots.set(m.id, snapshot),
          );
          const connected = new Promise<void>((resolve, reject) => {
            socket.once("connect", resolve);
            socket.once("connect_error", reject);
          });
          socket.connect();
          await connected;
        }
        await waitFor(
          async () => snapshots.get(b.id),
          (s) =>
            Boolean(
              s?.room.connected.red &&
              s.room.connected.black &&
              snapshots.get(a.id)?.room.connected.red &&
              snapshots.get(a.id)?.room.connected.black &&
              snapshots.get(a.id)?.version === s.version,
            ),
        );
        const command = (index: number) => {
          const snapshot = snapshots.get([a, b][index]!.id);
          if (!snapshot) throw new Error("Synthetic peer lacks snapshot");
          return new Promise<CommandAcknowledgement>((resolve) =>
            sockets[index]!.emit(
              "room.command",
              {
                commandId: randomUUID(),
                roomId: entry.roomId,
                expectedVersion: snapshot.version,
                action: { type: "room.ready", payload: { ready: true } },
              },
              resolve,
            ),
          );
        };
        expect((await command(0)).status).toBe("ok");
        await waitFor(
          async () => snapshots.get(b.id),
          (s) => s?.room.ready.red === true,
        );
        expect((await command(1)).status).toBe("ok");
        const started = await waitFor(
          async () => snapshots.get(b.id),
          (s) => s?.match?.status === "ACTIVE",
          8000,
        );
        expect(started.room.status).toBe("PLAYING");
        const matchId = started.match!.id;
        sockets[0]!.disconnect();
        await waitFor(
          async () =>
            (
              await pool.query(
                "SELECT disconnected_at FROM public.room_members WHERE room_id=$1 AND user_id=$2",
                [entry.roomId, a.id],
              )
            ).rows[0],
          (row) => row?.disconnected_at instanceof Date,
        );
        // A physical disconnect before 60 seconds cannot end the match.
        await new Promise((resolve) => setTimeout(resolve, 250));
        expect(
          (
            await pool.query("SELECT status FROM public.matches WHERE id=$1", [
              matchId,
            ])
          ).rows[0].status,
        ).toBe("ACTIVE");
        expect(
          (
            await pool.query("SELECT status FROM public.rooms WHERE id=$1", [
              entry.roomId,
            ])
          ).rows[0].status,
        ).toBe("PLAYING");
        // Authorized synthetic fixture crosses only the grace boundary; clock remains running.
        await pool.query(
          "UPDATE public.room_members SET disconnected_at=clock_timestamp()-interval '61 seconds' WHERE room_id=$1 AND user_id=$2",
          [entry.roomId, a.id],
        );
        const terminal = await waitFor(
          async () => snapshots.get(b.id),
          (s) =>
            s?.match?.status === "FINISHED" &&
            s.room.hostId === b.id &&
            s.room.seats.red === null,
        );
        expect(terminal.match).toMatchObject({
          result: "DISCONNECT",
          winner: "black",
        });
        expect(terminal.room.status).toBe("WAITING");
        expect(terminal.room.ready.black).toBe(false);
        expect(terminal.clocks?.running).toBeNull();
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
              "SELECT count(*)::int n FROM public.room_members WHERE room_id=$1 AND user_id=$2",
              [entry.roomId, a.id],
            )
          ).rows[0].n,
        ).toBe(0);
        expect(
          (
            await pool.query(
              "SELECT count(*)::int n FROM public.active_players WHERE user_id=$1",
              [a.id],
            )
          ).rows[0].n,
        ).toBe(0);
        const denied = await fetch(`${base}/rooms/${entry.roomId}`, {
          headers: headers(a),
        });
        expect(denied.status).toBe(403);
        const reconnectError = new Promise<
          Error & { data?: { code?: string } }
        >((resolve, reject) => {
          sockets[0]!.once("connect_error", resolve);
          sockets[0]!.once("connect", () =>
            reject(new Error("Expired seat reattached")),
          );
        });
        sockets[0]!.connect();
        expect((await reconnectError).data?.code).toBe("ROOM_FORBIDDEN");
        expect(
          (
            await pool.query(
              "SELECT count(*)::int n FROM public.match_events WHERE match_id=$1 AND type='RESULT'",
              [matchId],
            )
          ).rows[0].n,
        ).toBe(1);
      } finally {
        for (const socket of sockets) socket.disconnect();
        await runtime.close();
        await app.close();
      }
    }, 15000);
  },
);
