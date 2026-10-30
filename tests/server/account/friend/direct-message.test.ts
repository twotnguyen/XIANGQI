import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { Pool } from "pg";
import { maskForbiddenChat } from "@xiangqi/shared";
import { apply, databaseUrl, reset } from "../../game/room/room.test-helper.js";
import { FriendService } from "@server/account/friend/friend.service.js";
import { FriendStore } from "@server/account/friend/friend.store.js";
import type { FriendRoomPort } from "@server/account/friend/friend.room-port.js";
import { DirectMessageService } from "@server/account/friend/direct-message.service.js";
import { DirectMessageStore } from "@server/account/friend/direct-message.store.js";

const url = process.env.ROOM_TEST_DATABASE_URL ?? databaseUrl;
const pool = new Pool({ connectionString: url });
afterAll(() => pool.end());

const rooms: FriendRoomPort = {
  acceptInvite: async (_proof, input) => ({
    accepted: true,
    roomId: input.inviteId,
    version: 1,
    role: "red",
  }),
};
const friends = new FriendService(new FriendStore(pool), rooms);
const dm = new DirectMessageService(new DirectMessageStore(pool));

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

/** Kết bạn hai chiều giữa host và mate. */
async function befriend(host: string, mate: string, mateName: string) {
  await friends.sendRequest(host, mateName);
  const req = (await friends.listRequests(mate))[0];
  await friends.respondRequest(mate, req!.id, true);
}

async function expectError(
  promise: Promise<unknown>,
  code: string,
  status: number,
) {
  await expect(promise).rejects.toMatchObject({ code, status });
}

describe.skipIf(!url)("direct messages", () => {
  let host: string;
  let mate: string;
  let stranger: string;

  beforeEach(async () => {
    await pool.query(
      "DROP SCHEMA IF EXISTS xiangqi_chat CASCADE; DROP SCHEMA IF EXISTS xiangqi_ai CASCADE; DROP SCHEMA IF EXISTS xiangqi_social CASCADE",
    );
    await reset();
    await apply("supabase/migrations/20261011000006_rooms.sql");
    await apply("supabase/migrations/20261017000018_room_code_digits.sql");
    await apply("supabase/migrations/20261011000014_friendships.sql");
    await apply(
      "supabase/migrations/20261101000001_friend_presence_invites.sql",
    );
    await apply("supabase/migrations/20261102000004_direct_messages.sql");
    host = await member("dmhost");
    mate = await member("dmmate");
    stranger = await member("dmstranger");
    await befriend(host, mate, "dmmate");
  });

  const send = (
    from: string,
    to: string,
    content: string,
    commandId = randomUUID(),
  ) => dm.send(from, to, commandId, content);

  it("delivers both directions and counts unread only for the receiver", async () => {
    await send(host, mate, "xin chào");
    await send(host, mate, "ván mới nhé");
    await send(mate, host, "ok");

    const mateView = await dm.unread(mate);
    expect(mateView).toEqual({
      total: 2,
      peers: [{ peerId: host, unread: 2 }],
    });
    const hostView = await dm.unread(host);
    expect(hostView.total).toBe(1);

    const page = await dm.list(host, mate, null);
    expect(page.messages.map((m) => m.content)).toEqual([
      "xin chào",
      "ván mới nhé",
      "ok",
    ]);
  });

  it("advances the read watermark monotonically and clamps to incoming messages", async () => {
    await send(host, mate, "một");
    const second = await send(host, mate, "hai");
    await send(mate, host, "của mate");

    await dm.markRead(mate, host, second.message.seq);
    expect((await dm.unread(mate)).total).toBe(0);

    // Lùi watermark không được làm tăng lại số chưa đọc.
    await dm.markRead(mate, host, 1);
    expect((await dm.unread(mate)).total).toBe(0);

    // Vượt quá seq hiện có vẫn bị kẹp, không có tin mới nào bị bỏ qua.
    await dm.markRead(mate, host, 10_000_000);
    await send(host, mate, "tin sau");
    expect((await dm.unread(mate)).total).toBe(1);
  });

  it("replays the same command with the same content and rejects reuse with different content", async () => {
    const commandId = randomUUID();
    const first = await send(host, mate, "một lần", commandId);
    const replay = await send(host, mate, "một lần", commandId);
    expect(replay.replayed).toBe(true);
    expect(replay.message.id).toBe(first.message.id);

    await expectError(
      send(host, mate, "khác nội dung", commandId),
      "DM_COMMAND_ID_REUSED",
      409,
    );
  });

  it("stores the filtered content, not the raw input", async () => {
    const raw = "tin có từ cần lọc";
    const sent = await send(host, mate, raw);
    expect(sent.message.content).toBe(maskForbiddenChat(raw));
  });

  it("validates content length and blank input", async () => {
    await expectError(send(host, mate, "   "), "DM_INPUT_INVALID", 400);
    await expectError(
      send(host, mate, "a".repeat(201)),
      "DM_INPUT_INVALID",
      400,
    );
    const max = await send(host, mate, "a".repeat(200));
    expect(max.message.content.length).toBe(200);
  });

  it("limits five messages per ten seconds per sender", async () => {
    for (let i = 0; i < 5; i += 1) await send(host, mate, `tin ${i}`);
    await expectError(send(host, mate, "tin thứ sáu"), "DM_RATE_LIMITED", 429);
    // Người nhận có hạn mức riêng.
    await send(mate, host, "tin từ mate");
  });

  it("blocks read and send after unfriend, then restores history on refriend", async () => {
    await send(host, mate, "trước khi hủy");
    await friends.unfriend(host, mate);

    await expectError(send(host, mate, "sau khi hủy"), "DM_NOT_FRIENDS", 403);
    await expectError(dm.list(host, mate, null), "DM_NOT_FRIENDS", 403);
    await expectError(dm.markRead(host, mate, 1), "DM_NOT_FRIENDS", 403);
    expect((await dm.unread(mate)).peers).toEqual([]);

    await befriend(host, mate, "dmmate");
    const restored = await dm.list(host, mate, null);
    expect(restored.messages.map((m) => m.content)).toEqual(["trước khi hủy"]);
  });

  it("denies strangers in both directions", async () => {
    await expectError(send(stranger, host, "chào"), "DM_NOT_FRIENDS", 403);
    await expectError(dm.list(stranger, host, null), "DM_NOT_FRIENDS", 403);
  });
});
