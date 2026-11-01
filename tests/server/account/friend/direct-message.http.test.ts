import { randomUUID } from "node:crypto";
import type { INestApplication } from "@nestjs/common";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { Pool } from "pg";
import { createApp } from "@server/app.js";
import { apply, databaseUrl, reset } from "../../game/room/room.test-helper.js";
import { FriendService } from "@server/account/friend/friend.service.js";
import { FriendStore } from "@server/account/friend/friend.store.js";
import type { FriendRoomPort } from "@server/account/friend/friend.room-port.js";
import { FriendModule } from "@server/account/friend/friend.module.js";
import { LoginError } from "@server/account/login/login.types.js";
import type { SessionService } from "@server/account/login/session.service.js";

interface MessageBody {
  seq: number;
  content: string;
  senderId: string;
}
interface SendBody {
  message: MessageBody;
  replayed: boolean;
}
interface ListBody {
  messages: MessageBody[];
  readSeq: number;
}
interface UnreadBody {
  total: number;
  peers: { peerId: string; unread: number }[];
}
interface ErrorBody {
  code: string;
}

const url = process.env.ROOM_TEST_DATABASE_URL ?? databaseUrl;
const pool = new Pool({ connectionString: url });

/**
 * Đọc JSON từ response do chính server trong test trả về; response đã được kiểm status trước khi gọi.
 * Đây là ranh giới HTTP của test, nên ép kiểu có chủ đích.
 */
async function json<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

// Phiên giả chỉ ánh xạ header x-xiangqi-session → userId; mọi luồng DM và DB đều là thật.
const sessions = {
  requireActiveSession: async (_bearer: unknown, capability: unknown) => {
    if (typeof capability !== "string" || !capability.startsWith("tok-"))
      throw new LoginError(
        "SESSION_INVALID",
        "Phiên đăng nhập không hợp lệ",
        401,
      );
    return {
      userId: capability.slice(4),
      username: "",
      email: "",
      expiresAt: "",
      remember: true,
    };
  },
} as unknown as SessionService;

const rooms: FriendRoomPort = {
  acceptInvite: async (_proof, input) => ({
    accepted: true,
    roomId: input.inviteId,
    version: 1,
    role: "red",
  }),
};
const friends = new FriendService(new FriendStore(pool), rooms);

async function member(username: string) {
  const id = randomUUID();
  await pool.query(
    "INSERT INTO auth.users(id,email,email_confirmed_at,raw_app_meta_data,raw_user_meta_data) VALUES($1,$2,clock_timestamp(),'{\"provider\":\"email\"}',jsonb_build_object('signup_username',$3::text))",
    [id, `${username}@example.invalid`, username],
  );
  await pool.query(
    "INSERT INTO public.profiles(user_id,username,display_name) VALUES($1,$2,$3)",
    [id, username, username],
  );
  return id;
}

async function befriend(host: string, mate: string, mateName: string) {
  await friends.sendRequest(host, mateName);
  const req = (await friends.listRequests(mate))[0];
  await friends.respondRequest(mate, req!.id, true);
}

describe.skipIf(!url)("direct message HTTP routes", () => {
  let api: INestApplication;
  let base: string;
  let host: string;
  let mate: string;
  let stranger: string;

  beforeAll(async () => {
    api = await createApp(
      ["http://localhost:5173"],
      [FriendModule.forRoot(pool, sessions, rooms)],
    );
    await api.listen(0, "127.0.0.1");
    base = `http://127.0.0.1:${api.getHttpServer().address().port}`;
  });

  afterAll(async () => {
    await api?.close();
    await pool.end();
  });

  beforeEach(async () => {
    await pool.query(
      "DROP SCHEMA IF EXISTS xiangqi_chat CASCADE; DROP SCHEMA IF EXISTS xiangqi_ai CASCADE; DROP SCHEMA IF EXISTS xiangqi_social CASCADE",
    );
    await reset();
    await apply("supabase/migrations/20261011000006_rooms.sql");
    await apply("supabase/migrations/20261011000010_room_chat.sql");
    await apply("supabase/migrations/20261017000018_room_code_digits.sql");
    await apply("supabase/migrations/20261011000014_friendships.sql");
    await apply(
      "supabase/migrations/20261101000001_friend_presence_invites.sql",
    );
    await apply("supabase/migrations/20261102000004_direct_messages.sql");
    host = await member("httphost");
    mate = await member("httpmate");
    stranger = await member("httpstranger");
    await befriend(host, mate, "httpmate");
  });

  function call(
    userId: string | null,
    method: string,
    path: string,
    body?: unknown,
  ) {
    return fetch(base + path, {
      method,
      headers: {
        ...(userId ? { "x-xiangqi-session": `tok-${userId}` } : {}),
        ...(body === undefined ? {} : { "content-type": "application/json" }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  function send(
    from: string,
    to: string,
    content: string,
    commandId = randomUUID(),
  ) {
    return call(from, "POST", `/friends/${to}/messages`, {
      commandId,
      content,
    });
  }

  it("rejects requests without a session with 401", async () => {
    const response = await call(null, "GET", "/friends/dm/unread");
    expect(response.status).toBe(401);
  });

  it("delivers a message, lists it, and counts it as unread for the recipient", async () => {
    const sent = await send(host, mate, "chào bạn");
    expect(sent.status).toBe(200);
    const body = await json<SendBody>(sent);
    expect(body.message).toMatchObject({ content: "chào bạn", senderId: host });
    expect(body.replayed).toBe(false);

    const list = await json<ListBody>(
      await call(mate, "GET", `/friends/${host}/messages`),
    );
    expect(list.messages.map((m) => m.content)).toEqual(["chào bạn"]);

    const unread = await json<UnreadBody>(
      await call(mate, "GET", "/friends/dm/unread"),
    );
    expect(unread.total).toBe(1);
    expect(unread.peers).toEqual([{ peerId: host, unread: 1 }]);
  });

  it("replays the same commandId without a second row and rejects reuse with different content", async () => {
    const commandId = randomUUID();
    await send(host, mate, "một lần", commandId);
    const replay = await send(host, mate, "một lần", commandId);
    expect(replay.status).toBe(200);
    expect((await json<SendBody>(replay)).replayed).toBe(true);

    const reused = await send(host, mate, "nội dung khác", commandId);
    expect(reused.status).toBe(409);
    expect((await json<ErrorBody>(reused)).code).toBe("DM_COMMAND_ID_REUSED");
  });

  it("returns the documented error codes for invalid input and non-friends", async () => {
    const badId = await call(host, "POST", `/friends/${mate}/messages`, {
      commandId: "x",
      content: "hi",
    });
    expect(badId.status).toBe(400);
    expect((await json<ErrorBody>(badId)).code).toBe("FRIEND_INPUT_INVALID");

    const blank = await send(host, mate, "   ");
    expect(blank.status).toBe(400);
    expect((await json<ErrorBody>(blank)).code).toBe("DM_INPUT_INVALID");

    const tooLong = await send(host, mate, "a".repeat(201));
    expect(tooLong.status).toBe(400);

    const strangerSend = await send(stranger, mate, "xin chào");
    expect(strangerSend.status).toBe(403);
    expect((await json<ErrorBody>(strangerSend)).code).toBe("DM_NOT_FRIENDS");
  });

  it("answers rate limiting after five sends in ten seconds", async () => {
    for (let i = 0; i < 5; i++)
      expect((await send(host, mate, `tin ${i}`)).status).toBe(200);
    const sixth = await send(host, mate, "tin 6");
    expect(sixth.status).toBe(429);
    expect((await json<ErrorBody>(sixth)).code).toBe("DM_RATE_LIMITED");
  });

  it("pages older history with before and never repeats a message", async () => {
    const [low, high] = [host, mate].sort();
    await pool.query(
      `INSERT INTO xiangqi_social.direct_messages(id,user_low,user_high,sender_id,command_id,fingerprint,content,created_at)
       SELECT gen_random_uuid(),$1,$2,$3,gen_random_uuid(),md5(g::text)||md5('x'||g::text),'tin '||g,clock_timestamp()
       FROM generate_series(1,55) g`,
      [low, high, mate],
    );
    const first = await json<ListBody>(
      await call(host, "GET", `/friends/${mate}/messages`),
    );
    expect(first.messages).toHaveLength(50);
    expect(first.messages[0]!.content).toBe("tin 6");
    const older = await json<ListBody>(
      await call(
        host,
        "GET",
        `/friends/${mate}/messages?before=${first.messages[0]!.seq}`,
      ),
    );
    expect(older.messages.map((m) => m.content)).toEqual([
      "tin 1",
      "tin 2",
      "tin 3",
      "tin 4",
      "tin 5",
    ]);
  });

  it("clamps the read watermark and returns the stored readSeq", async () => {
    await send(mate, host, "một");
    const list = await json<ListBody>(
      await call(host, "GET", `/friends/${mate}/messages`),
    );
    const seq = list.messages.at(-1)!.seq;
    const read = await call(host, "POST", `/friends/${mate}/read`, {
      upToSeq: seq + 100,
    });
    expect(read.status).toBe(200);
    expect(await json<{ readSeq: number }>(read)).toEqual({ readSeq: seq });
  });

  it("hides history and denies sends once the friendship is removed", async () => {
    await send(host, mate, "trước khi hủy");
    expect((await call(host, "DELETE", `/friends/${mate}`)).status).toBe(200);

    const list = await call(host, "GET", `/friends/${mate}/messages`);
    expect(list.status).toBe(403);
    expect((await json<ErrorBody>(list)).code).toBe("DM_NOT_FRIENDS");
    expect((await send(host, mate, "sau khi hủy")).status).toBe(403);
    const unread = await json<UnreadBody>(
      await call(mate, "GET", "/friends/dm/unread"),
    );
    expect(unread.total).toBe(0);
  });
});
