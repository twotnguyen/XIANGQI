import { randomUUID } from "node:crypto";
import type { AddressInfo } from "node:net";
import { io, type Socket } from "socket.io-client";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "./app.js";
import type { createRegistrationRuntime } from "./auth-runtime.js";
import { SessionService } from "./login/session.service.js";
import { PostgresLoginStore } from "./login/postgres-login-store.js";
import { createRoomRuntime } from "./room-runtime.js";
import type { PublicRoomView } from "./room/public-room-store.js";
import { apply, databaseUrl, pool, reset } from "./room-runtime.test-helper.js";
type Registration = NonNullable<
  Awaited<ReturnType<typeof createRegistrationRuntime>>
>;
const origin = "http://localhost:5174";
async function fixture(modes = true) {
  if (modes) await apply("supabase/migrations/20261011000008_room_modes.sql");
  const users = new Map<
    string,
    { id: string; email: string; email_confirmed_at: string }
  >();
  // Only GoTrue is synthetic. Session SQL, room services, HTTP and sockets are actual production code.
  const auth = {
    signInPassword: vi.fn(),
    getUser: vi.fn(async (token: string) => {
      const user = users.get(token);
      if (!user) throw Error("Synthetic invalid provider session");
      return user;
    }),
  };
  const sessions = new SessionService(new PostgresLoginStore(pool), auth);
  const members = [];
  for (let i = 0; i < 3; i++) {
    const id = randomUUID(),
      email = `public-runtime-${id}@example.invalid`,
      at = new Date(),
      token = "synthetic-" + id;
    await pool.query(
      "INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,$2,$3)",
      [id, email, at],
    );
    await pool.query(
      "INSERT INTO public.profiles(user_id,username,display_name,completed_at,registration_pending) VALUES($1,$2,$3,$4,false)",
      [
        id,
        "p" + id.replaceAll("-", "").slice(0, 18),
        "Synthetic Public " + i,
        at,
      ],
    );
    users.set(token, { id, email, email_confirmed_at: at.toISOString() });
    members.push({
      id,
      email,
      token,
      appSession: (await sessions.issue(id, false)).appSession,
    });
  }
  const runtime = await createRoomRuntime(
    { ROOMS_ENABLED: "true", AUTH_LOGIN_ENABLED: "true" },
    { pool, sessions, auth } as unknown as Registration,
  );
  if (!runtime) throw Error("Actual room runtime absent");
  const app = await createApp(
    [origin],
    [runtime.module],
    null,
    runtime.realtime,
    runtime.publicFeed,
  );
  const sockets: Socket[] = [];
  await app.listen(0, "127.0.0.1");
  await runtime.start();
  const base = `http://127.0.0.1:${(app.getHttpServer().address() as AddressInfo).port}`;
  const request = (path: string, index = 0, body?: object) =>
    fetch(base + path, {
      method: body ? "POST" : "GET",
      headers: {
        Authorization: "Bearer " + members[index]!.token,
        "X-Xiangqi-Session": members[index]!.appSession,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  const create = async () => {
    const response = await request("/rooms", 0, {
      commandId: randomUUID(),
      name: "Actual Public Runtime",
      timeMinutes: 5,
    });
    expect(response.status).toBe(200);
    return (await response.json()) as { roomId: string; inviteCode: string };
  };
  const mode = async (roomId: string, visibility: string) => {
    const current = await request("/rooms/" + roomId);
    expect(current.status).toBe(200);
    const state = (await current.json()) as { version: number };
    const response = await request(`/rooms/${roomId}/visibility`, 0, {
      expectedVersion: state.version,
      visibility,
    });
    expect(response.status).toBe(200);
  };
  const feed = async (index = 2) => {
    const socket = io(base + "/public-rooms", {
      path: "/public-rooms/socket.io",
      auth: {
        kind: "member",
        accessToken: members[index]!.token,
        appSession: members[index]!.appSession,
      },
      extraHeaders: { Origin: origin },
      autoConnect: false,
      reconnection: false,
      transports: ["websocket"],
    });
    sockets.push(socket);
    let latest: PublicRoomView[] | undefined;
    const errors: unknown[] = [];
    socket.on("public.rooms", (value: { rooms: PublicRoomView[] }) => {
      latest = value.rooms;
    });
    socket.on("public.error", (value) => errors.push(value));
    const initial = new Promise<void>((resolve, reject) => {
      socket.once("public.rooms", () => resolve());
      socket.once("connect_error", reject);
      const timer = setTimeout(
        () => reject(Error("Missing actual public feed")),
        3500,
      );
      socket.once("public.rooms", () => clearTimeout(timer));
      socket.once("connect_error", () => clearTimeout(timer));
    });
    socket.connect();
    await initial;
    return { socket, latest: () => latest!, errors };
  };
  return {
    runtime,
    auth,
    members,
    request,
    create,
    mode,
    feed,
    roomPeer: async (roomId: string) => {
      const socket = io(base, {
        autoConnect: false,
        reconnection: false,
        transports: ["websocket"],
        auth: {
          accessToken: members[0]!.token,
          appSession: members[0]!.appSession,
          roomId,
          tabId: randomUUID(),
        },
      });
      sockets.push(socket);
      const initial = new Promise<import("@xiangqi/shared").RoomSnapshot>(
        (resolve, reject) => {
          socket.once("room.snapshot", resolve);
          socket.once("connect_error", reject);
        },
      );
      socket.connect();
      return { socket, snapshot: await initial };
    },
    close: async () => {
      sockets.forEach((s) => s.disconnect());
      await runtime.close();
      await app.close();
    },
  };
}
async function waitFor(read: () => boolean, timeout = 2500) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    if (read()) return;
    await new Promise((r) => setTimeout(r, 10));
  }
  throw Error("Actual public feed deadline exceeded");
}
afterAll(() => pool.end());
describe.skipIf(!databaseUrl)(
  "actual member PUBLIC room runtime on isolated SQL",
  () => {
    beforeEach(reset);
    it("keeps migration 1–7 discovery unavailable and closes without owning the borrowed pool", async () => {
      const f = await fixture(false);
      try {
        expect(f.runtime.publicFeed).toBeNull();
        expect((await f.request("/public-rooms")).status).toBe(404);
      } finally {
        await f.close();
      }
      expect((await pool.query("SELECT 1 AS ok")).rows[0].ok).toBe(1);
    });
    it("projects safe PUBLIC DTOs through actual HTTP/feed and removes CODE_ONLY/LOCKED within two seconds", async () => {
      const f = await fixture();
      try {
        const entry = await f.create();
        const feed = await f.feed();
        expect(feed.latest()).toEqual([]);
        const roomPeer = await f.roomPeer(entry.roomId);
        expect(roomPeer.snapshot).toMatchObject({
          roomId: entry.roomId,
          role: "red",
          control: { mode: "writable" },
        });
        expect(roomPeer.socket.connected).toBe(true);
        await f.mode(entry.roomId, "PUBLIC");
        await waitFor(() => feed.latest().length === 1);
        const listed = await f.request("/public-rooms");
        expect(listed.status).toBe(200);
        expect(listed.headers.get("cache-control")).toBe("no-store");
        const dto = (await listed.json()) as PublicRoomView[];
        expect(dto).toEqual(feed.latest());
        expect(dto[0]).toMatchObject({
          roomId: entry.roomId,
          host: { displayName: "Synthetic Public 0", isGuest: false },
          emptySeats: 1,
          status: "waiting",
          canPlay: true,
        });
        expect(dto[0]!.publicOpenedAt).toEqual(expect.any(String));
        const serialized = JSON.stringify(dto);
        for (const privateValue of [
          entry.inviteCode,
          ...f.members.flatMap((m) => [m.id, m.email, m.token, m.appSession]),
        ])
          expect(serialized).not.toContain(privateValue);
        const hidden = Date.now();
        await f.mode(entry.roomId, "CODE_ONLY");
        await waitFor(() => feed.latest().length === 0);
        expect(Date.now() - hidden).toBeLessThanOrEqual(2000);
        await f.mode(entry.roomId, "PUBLIC");
        await waitFor(() => feed.latest().length === 1);
        expect(
          (
            await f.request(`/public-rooms/${entry.roomId}/join`, 1, {
              commandId: randomUUID(),
              preference: "play",
            })
          ).status,
        ).toBe(200);
        const locked = Date.now();
        await f.mode(entry.roomId, "LOCKED");
        await waitFor(() => feed.latest().length === 0);
        expect(Date.now() - locked).toBeLessThanOrEqual(2000);
        expect(await (await f.request("/public-rooms")).json()).toEqual([]);
        feed.socket.disconnect();
        expect(roomPeer.socket.connected).toBe(true);
        const fresh = (await (
          await f.request("/rooms/" + entry.roomId)
        ).json()) as { version: number };
        const ack = await new Promise<
          import("@xiangqi/shared").CommandAcknowledgement
        >((resolve, reject) =>
          roomPeer.socket.timeout(3000).emit(
            "room.command",
            {
              roomId: entry.roomId,
              commandId: randomUUID(),
              expectedVersion: fresh.version,
              action: { type: "room.ready", payload: { ready: true } },
            },
            (
              error: Error | null,
              value: import("@xiangqi/shared").CommandAcknowledgement,
            ) => (error ? reject(error) : resolve(value)),
          ),
        );
        expect(ack.status).toBe("ok");
      } finally {
        await f.close();
      }
      expect((await pool.query("SELECT 1 AS ok")).rows[0].ok).toBe(1);
    }, 10000);
    it("joins public rooms through canonical HTTP state without exposing the invitation code", async () => {
      const f = await fixture();
      try {
        const entry = await f.create();
        await f.mode(entry.roomId, "PUBLIC");
        const response = await f.request(
          `/public-rooms/${entry.roomId}/join`,
          1,
          { commandId: randomUUID(), preference: "play" },
        );
        expect(response.status).toBe(200);
        const joined = await response.json();
        expect(joined).toMatchObject({ roomId: entry.roomId, role: "black" });
        expect(joined).not.toHaveProperty("inviteCode");
        const snapshot = await f.request("/rooms/" + entry.roomId, 1);
        expect(snapshot.status).toBe(200);
        expect((await snapshot.json()).room.seats).toEqual({
          red: f.members[0]!.id,
          black: f.members[1]!.id,
        });
        const players = (
          await pool.query(
            "SELECT user_id FROM public.room_members WHERE room_id=$1 AND role='PLAYER' ORDER BY user_id",
            [entry.roomId],
          )
        ).rows.map((r) => r.user_id);
        expect(players).toEqual([f.members[0]!.id, f.members[1]!.id].sort());
      } finally {
        await f.close();
      }
    });
    it("checks fixed SQL session expiry on feed polls without repeated getUser, disconnects and denies HTTP", async () => {
      const f = await fixture();
      try {
        const before = f.auth.getUser.mock.calls.length,
          feed = await f.feed();
        expect(f.auth.getUser.mock.calls.length - before).toBe(1);
        await new Promise((r) => setTimeout(r, 1200));
        expect(f.auth.getUser.mock.calls.length - before).toBe(1);
        expect(feed.socket.connected).toBe(true);
        await pool.query(
          "UPDATE xiangqi_auth.app_sessions SET created_at=statement_timestamp()-interval '12 hours 1 second', expires_at=statement_timestamp()-interval '1 second' WHERE user_id=$1",
          [f.members[2]!.id],
        );
        await waitFor(() => !feed.socket.connected);
        expect(feed.errors).toEqual([
          { code: "AUTH_REQUIRED", message: expect.any(String) },
        ]);
        expect(f.auth.getUser.mock.calls.length - before).toBe(1);
        const denied = await f.request("/public-rooms", 2);
        expect(denied.status).toBe(401);
      } finally {
        await f.close();
      }
    }, 7000);
  },
);
