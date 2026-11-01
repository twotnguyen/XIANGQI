import { randomUUID } from "node:crypto";
import type { AddressInfo } from "node:net";
import type { RoomClosedNotice, RoomSnapshot } from "@xiangqi/shared";
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
  apply,
  databaseUrl,
  pool,
  resetBase as reset,
  roomControl,
  waitFor,
} from "./game.runtime.test-helper.js";
const loginPool = createLoginPool({ connectionString: databaseUrl });
type Registration = NonNullable<
  Awaited<ReturnType<typeof createRegistrationRuntime>>
>;
async function fixture() {
  const users = new Map<
    string,
    { id: string; email: string; email_confirmed_at: string }
  >();
  const auth = {
    signInPassword: vi.fn(),
    verifyAccessToken: vi.fn(async (token: string) => {
      const user = users.get(token);
      if (!user) throw new Error("Synthetic invalid bearer");
      return { userId: user.id, email: user.email };
    }),
  };
  const sessions = new SessionService(new PostgresLoginStore(loginPool), auth);
  const members = await Promise.all(
    ["Chủ", "Đen", "Xem một", "Xem hai"].map(async (name) => {
      const id = randomUUID(),
        at = new Date(),
        email = `synthetic-${id}@example.invalid`;
      await pool.query(
        "INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,$2,$3)",
        [id, email, at],
      );
      await pool.query(
        "INSERT INTO public.profiles(user_id,username,display_name,completed_at,registration_pending) VALUES($1,$2,$3,$4,false)",
        [id, "s" + id.replaceAll("-", "").slice(0, 18), name, at],
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
  const [red, black, first, second] = members as [
    (typeof members)[0],
    (typeof members)[0],
    (typeof members)[0],
    (typeof members)[0],
  ];
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
    return {
      status: response.status,
      body: (await response.json()) as Record<string, unknown>,
    };
  }
  const created = await post(red, "/rooms", {
    commandId: randomUUID(),
    timeMinutes: 5,
  });
  const roomId = created.body.roomId as string,
    code = created.body.inviteCode as string;
  const join = (member: typeof red, preference: "play" | "watch") =>
    post(member, "/rooms/join", {
      commandId: randomUUID(),
      code,
      preference,
    });
  async function peer(member: typeof red) {
    let latest: RoomSnapshot | undefined;
    const notices: RoomClosedNotice[] = [];
    const socket = io(base, {
      autoConnect: false,
      transports: ["websocket"],
      reconnection: false,
      auth: {
        accessToken: member.token,
        appSession: member.appSession,
        roomId,
        tabId: randomUUID(),
      },
    });
    sockets.push(socket);
    socket.on("room.snapshot", (value: RoomSnapshot) => {
      latest = value;
    });
    socket.on("room.closed", (notice: RoomClosedNotice) =>
      notices.push(notice),
    );
    const connection = Promise.withResolvers<void>();
    const connected = connection.promise;
    socket.once("connect", () => connection.resolve());
    socket.once("connect_error", connection.reject);
    socket.connect();
    await connected;
    await waitFor(
      async () => latest,
      (s) => Boolean(s),
    );
    /** HTTP mutation with the physical controller of this very socket; retried only while its snapshot version is still catching up. */
    const act = (path: string, body: Record<string, unknown> = {}) =>
      waitFor(
        async () =>
          post(member, `/rooms/${roomId}/${path}`, {
            expectedVersion: latest!.version,
            control: await roomControl(socket),
            ...body,
          }),
        (result) => result.body.code !== "VERSION_STALE",
      );
    return { socket, latest: () => latest, notices, act };
  }
  return {
    roomId,
    red,
    black,
    first,
    second,
    join,
    peer,
    close: async () => {
      sockets.forEach((s) => s.disconnect());
      await runtime.close();
      await app.close();
    },
  };
}
afterAll(async () => {
  await pool.end();
  await loginPool.end();
});
describe.skipIf(!databaseUrl)(
  "seat requests, Mời rời ghế and removal notices on the actual runtime",
  () => {
    beforeEach(async () => {
      await reset();
      await apply("supabase/migrations/20261011000016_room_viewers.sql");
      await apply("supabase/migrations/20261103000008_seat_requests.sql");
      await apply("supabase/migrations/20261103000011_yc9_ranked.sql");
      await apply("supabase/migrations/20261103000012_yc9_ranked_guards.sql");
    });
    it("seats an approved viewer over real sockets, then removes players with the right notices", async () => {
      const f = await fixture();
      try {
        expect((await f.join(f.black, "play")).status).toBe(200);
        expect((await f.join(f.first, "watch")).status).toBe(200);
        expect((await f.join(f.second, "watch")).status).toBe(200);
        const red = await f.peer(f.red),
          black = await f.peer(f.black),
          first = await f.peer(f.first),
          second = await f.peer(f.second);
        // Đen xuống xem để còn ghế; người xem một xin ngồi.
        const moved = await black.act("to-spectator");
        expect(moved.body, JSON.stringify(moved.body)).toMatchObject({
          role: "spectator",
        });
        await waitFor(
          async () => first.latest(),
          (s) => s?.room.seats.black === null,
        );
        // Chưa là người chơi: cả hai người xem đều không đuổi được ai.
        expect(
          (await first.act("kick", { targetId: f.second.id })).status,
        ).toBeGreaterThanOrEqual(400);
        const asked = await first.act("request-seat");
        expect(asked.status).toBe(200);
        const hostSees = await waitFor(
          async () => red.latest(),
          (s) => s?.room.seatRequests?.length === 1,
        );
        expect(hostSees!.room.seatRequests![0]!.userId).toBe(f.first.id);
        // Người xem khác và người vừa xuống xem không thấy yêu cầu của người khác.
        expect(second.latest()!.room.seatRequests ?? []).toEqual([]);
        expect(black.latest()!.room.seatRequests ?? []).toEqual([]);
        // Người không phải Host không trả lời được.
        const requestId = hostSees!.room.seatRequests![0]!.id;
        expect(
          (await black.act("respond-seat-request", { requestId, accept: true }))
            .status,
        ).toBe(403);
        expect(
          (await red.act("respond-seat-request", { requestId, accept: true }))
            .status,
        ).toBe(200);
        const seated = await waitFor(
          async () => first.latest(),
          (s) => s?.role === "black",
        );
        expect(seated!.room.seats.black).toBe(f.first.id);
        expect(seated!.room.seatRequests ?? []).toEqual([]);
        // Cả hai người chơi được đuổi; người bị đuổi nhận đúng thông báo và không vào lại được.
        expect((await red.act("kick", { targetId: f.second.id })).status).toBe(
          200,
        );
        await waitFor(
          async () => second.notices.length,
          (n) => n === 1,
        );
        expect(second.notices[0]).toEqual({
          roomId: f.roomId,
          message: "Bạn đã bị đuổi khỏi phòng và không thể vào lại.",
        });
        expect((await f.join(f.second, "watch")).status).toBeGreaterThanOrEqual(
          400,
        );
        // Host mời người chơi thứ hai rời ghế: không chặn, vào lại được.
        expect(
          (await red.act("invite-leave", { targetId: f.first.id })).status,
        ).toBe(200);
        await waitFor(
          async () => first.notices.length,
          (n) => n === 1,
        );
        expect(first.notices[0]).toEqual({
          roomId: f.roomId,
          message: "Chủ phòng đã mời bạn rời ghế",
        });
        const after = await waitFor(
          async () => red.latest(),
          (s) => s?.room.seats.black === null,
        );
        expect(after!.room.seats.red).toBe(f.red.id);
        expect((await f.join(f.first, "play")).status).toBe(200);
        expect(
          (
            await pool.query(
              "SELECT count(*)::int n FROM xiangqi_room.room_blocks WHERE room_id=$1 AND user_id=$2",
              [f.roomId, f.first.id],
            )
          ).rows[0].n,
        ).toBe(0);
      } finally {
        await f.close();
      }
    }, 30000);
  },
);
