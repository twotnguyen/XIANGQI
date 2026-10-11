import { randomUUID } from "node:crypto";
import type { AddressInfo } from "node:net";
import type {
  RoomAction,
  RoomSnapshot,
  CommandAcknowledgement,
  ChatAcknowledgement,
  ChatPage,
  ChatSent,
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
    "INSERT INTO public.profiles(user_id,username,display_name,completed_at,registration_pending) VALUES($1,$2,'Synthetic Chat Runtime',$3,false)",
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
async function roomFixture() {
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
      name: "Runtime Chat Gate",
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
    return {
      runtime,
      sockets,
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

async function chatSchema() {
  for (const n of ["08_room_modes", "09_match_draw", "10_room_chat"])
    await apply(`supabase/migrations/202610110000${n}.sql`);
}
function request<T>(socket: Socket, event: string, body: object) {
  return new Promise<ChatAcknowledgement<T>>((resolve, reject) => {
    socket
      .timeout(1500)
      .emit(event, body, (error: Error | null, ack: ChatAcknowledgement<T>) =>
        error ? reject(error) : resolve(ack),
      );
  });
}
afterAll(() => pool.end());
describe.skipIf(!databaseUrl)("actual room chat runtime", () => {
  beforeEach(async () => {
    await pool.query("DROP SCHEMA IF EXISTS xiangqi_chat CASCADE");
    await reset();
  });
  it("retains old room runtime without chat when migration is absent", async () => {
    const runtime = await createRoomRuntime(env, registration().context);
    expect(runtime).not.toBeNull();
    expect(runtime!.realtime).not.toHaveProperty("chat", expect.anything());
    await runtime!.close();
  });
  it("refuses partially installed chat schema rather than enabling or silently omitting chat", async () => {
    await pool.query("CREATE SCHEMA xiangqi_chat");
    await expect(
      createRoomRuntime(env, registration().context),
    ).rejects.toThrow("Room migration is not ready");
  });
  it.each([
    "ALTER TABLE xiangqi_chat.messages NO FORCE ROW LEVEL SECURITY",
    "GRANT SELECT ON xiangqi_chat.messages TO authenticated",
    "ALTER TABLE xiangqi_chat.messages DROP COLUMN sender_role",
  ])("refuses present but unsafe chat migration: %s", async (sql) => {
    await chatSchema();
    await pool.query(sql);
    await expect(
      createRoomRuntime(env, registration().context),
    ).rejects.toThrow("Room migration is not ready");
  });
  it("binds real authenticated Socket chat, publishes references, and drains committed outbox", async () => {
    await chatSchema();
    const f = await roomFixture();
    try {
      const notices: Record<string, unknown>[] = [];
      f.sockets[1]!.on("chat.changed", (notice) => notices.push(notice));
      const empty = await request<ChatPage>(f.sockets[0]!, "chat.read", {
        channel: "PLAYERS_PRIVATE",
      });
      expect(empty.status).toBe("ok");
      if (empty.status !== "ok") throw new Error("No canonical chat page");
      expect(empty.value).toMatchObject({
        roomId: f.roomId,
        canSend: true,
        messages: [],
      });
      const body = {
        channel: "PLAYERS_PRIVATE",
        commandId: randomUUID(),
        content: "<script>alert(1)</script>",
      };
      const sent = await request<ChatSent>(f.sockets[0]!, "chat.send", body);
      expect(sent.status).toBe("ok");
      const page = await request<ChatPage>(f.sockets[1]!, "chat.read", {
        channel: "PLAYERS_PRIVATE",
      });
      expect(page.status).toBe("ok");
      if (page.status !== "ok") throw new Error("No canonical peer page");
      expect(page.value.messages).toHaveLength(1);
      expect(page.value.messages[0]).toMatchObject({
        content: body.content,
        sender: { role: "red" },
      });
      await waitFor(
        async () => notices.length,
        (n) => n > 0,
      );
      expect(Object.keys(notices[0]!).sort()).toEqual([
        "canSend",
        "channel",
        "roomId",
        "roomVersion",
        "scopeToken",
      ]);
      await waitFor(
        async () =>
          (
            await pool.query(
              "SELECT count(*)::int AS n FROM xiangqi_chat.outbox",
            )
          ).rows[0].n,
        (n) => n === 0,
      );
      expect(await request<ChatSent>(f.sockets[0]!, "chat.send", body)).toEqual(
        sent,
      );
      expect(
        (
          await pool.query(
            "SELECT count(*)::int AS n FROM xiangqi_chat.messages",
          )
        ).rows[0].n,
      ).toBe(1);
      const forged = await request<ChatSent>(f.sockets[0]!, "chat.send", {
        ...body,
        commandId: randomUUID(),
        userId: f.players[1]!.id,
      });
      expect(forged).toMatchObject({
        status: "error",
        error: { code: "CHAT_INPUT_INVALID" },
      });
    } finally {
      await f.close();
    }
  });
  it("keeps both channel histories through WAITING to PLAYING and enforces raw length/rate with the production filter", async () => {
    await chatSchema();
    const f = await roomFixture();
    try {
      const send = (content: string, channel = "ROOM_PUBLIC") =>
        request<ChatSent>(f.sockets[0]!, "chat.send", {
          commandId: randomUUID(),
          channel,
          content,
        });
      expect(await send("🐉".repeat(201))).toMatchObject({
        status: "error",
        error: { code: "CHAT_INPUT_INVALID" },
      });
      expect((await send("Đánh cờ như ĐỤ MÁ, thôi nhé!")).status).toBe("ok");
      expect(
        (await send("Private before start", "PLAYERS_PRIVATE")).status,
      ).toBe("ok");
      for (let n = 0; n < 3; n++)
        expect((await send("Public message " + n)).status).toBe("ok");
      expect(await send("sixth", "PLAYERS_PRIVATE")).toMatchObject({
        status: "error",
        error: { code: "CHAT_RATE_LIMITED", message: "Bạn gửi quá nhanh" },
      });
      expect(
        (await f.command(0, { type: "room.ready", payload: { ready: true } }))
          .status,
      ).toBe("ok");
      await waitFor(
        async () => f.latest(1),
        (s) => s?.room.ready.red === true,
      );
      expect(
        (await f.command(1, { type: "room.ready", payload: { ready: true } }))
          .status,
      ).toBe("ok");
      await waitFor(
        async () => f.latest(1),
        (s) => s?.match?.status === "ACTIVE",
        8000,
      );
      for (const channel of ["ROOM_PUBLIC", "PLAYERS_PRIVATE"]) {
        const page = await request<ChatPage>(f.sockets[1]!, "chat.read", {
          channel,
        });
        expect(page.status).toBe("ok");
        if (page.status !== "ok") throw new Error("No current chat page");
        expect(page.value.messages).toHaveLength(
          channel === "ROOM_PUBLIC" ? 4 : 1,
        );
        expect(page.value.messages[0]!.content).toBe(
          channel === "ROOM_PUBLIC"
            ? "Đánh cờ như ***, thôi nhé!"
            : "Private before start",
        );
      }
      const playing = await request<ChatSent>(f.sockets[1]!, "chat.send", {
        commandId: randomUUID(),
        channel: "PLAYERS_PRIVATE",
        content: "During match",
      });
      expect(playing.status).toBe("ok");
      expect(
        (
          await pool.query(
            "SELECT content FROM xiangqi_chat.messages WHERE content LIKE '%ĐỤ%'",
          )
        ).rows,
      ).toEqual([]);
    } finally {
      await f.close();
    }
  }, 15000);
});
