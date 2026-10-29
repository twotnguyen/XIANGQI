import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { Pool } from "pg";
import { apply, databaseUrl, reset } from "../../game/room/room.test-helper.js";
import { FriendService } from "@server/account/friend/friend.service.js";
import { FriendStore } from "@server/account/friend/friend.store.js";
const url = process.env.ROOM_TEST_DATABASE_URL ?? databaseUrl;
const pool = new Pool({ connectionString: url });
afterAll(() => pool.end());
const service = new FriendService(new FriendStore(pool));
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
async function guest(name: string) {
  const id = randomUUID();
  await pool.query(
    "INSERT INTO xiangqi_auth.principals(id,kind) VALUES($1,'guest')",
    [id],
  );
  await pool.query(
    "INSERT INTO public.profiles(user_id,username,display_name) VALUES($1,$2,$3)",
    [id, name, name],
  );
  return id;
}
describe.skipIf(!url)("friendships", () => {
  beforeEach(async () => {
    await pool.query(
      "DROP SCHEMA IF EXISTS xiangqi_chat CASCADE; DROP SCHEMA IF EXISTS xiangqi_ai CASCADE; DROP SCHEMA IF EXISTS xiangqi_social CASCADE",
    );
    await reset();
    await apply("supabase/migrations/20261011000006_rooms.sql");
    await apply("supabase/migrations/20261017000018_room_code_digits.sql");
    await apply("supabase/migrations/20261011000014_friendships.sql");
  });
  it("searches by prefix, sends, accepts and lists friends", async () => {
    const a = await member("anfriend");
    const b = await member("anhrifriend");
    const found = await service.search(a, "anh");
    expect(found.map((p) => p.username)).toEqual(["anhrifriend"]);
    const sent = await service.sendRequest(a, "anhrifriend");
    expect(sent.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    const incoming = await service.listRequests(b);
    expect(incoming).toHaveLength(1);
    expect(incoming[0]).toMatchObject({
      direction: "incoming",
      peer: { username: "anfriend" },
    });
    await service.respondRequest(b, sent.id, true);
    const friends = await service.listFriends(a);
    expect(friends.map((f) => f.username)).toEqual(["anhrifriend"]);
    expect(friends[0]!.status).toBe("offline");
  });
  it("keeps one pending invite on cross sends and enforces two-decline block", async () => {
    const a = await member("crossa");
    const b = await member("crossb");
    const first = await service.sendRequest(a, "crossb");
    const second = await service.sendRequest(b, "crossa");
    expect(second.id).toBe(first.id);
    await service.respondRequest(b, first.id, false);
    const retry = await service.sendRequest(a, "crossb");
    await service.respondRequest(b, retry.id, false);
    await expect(service.sendRequest(a, "crossb")).rejects.toMatchObject({
      code: "FRIEND_BLOCKED",
    });
  });
  it("expires requests after thirty days and enforces caps", async () => {
    const a = await member("capuser");
    const b = await member("capfriend");
    const sent = await service.sendRequest(a, "capfriend");
    await pool.query(
      "WITH t AS MATERIALIZED(SELECT clock_timestamp()-interval '31 days' old) UPDATE xiangqi_social.friend_requests SET created_at=t.old-interval '30 days',expires_at=t.old FROM t WHERE id=$1",
      [sent.id],
    );
    expect(await service.listRequests(b)).toEqual([]);
    const row = (
      await pool.query(
        "SELECT status FROM xiangqi_social.friend_requests WHERE id=$1",
        [sent.id],
      )
    ).rows[0];
    expect(row.status).toBe("EXPIRED");
    const resent = await service.sendRequest(a, "capfriend");
    expect(resent.id).not.toBe(sent.id);
  });
  it("denies guests, self invites and strangers for room invites", async () => {
    const a = await member("hostuser");
    const g = await guest("guesttempname1");
    await expect(service.search(g, "hos")).rejects.toMatchObject({
      code: "FRIEND_GUEST_DENIED",
    });
    await expect(service.sendRequest(a, "hostuser")).rejects.toMatchObject({
      code: "FRIEND_SELF",
    });
    await expect(service.sendRequest(a, "nosuchuserzz")).rejects.toMatchObject({
      code: "FRIEND_NOT_FOUND",
    });
    await expect(service.sendRequest(g, "hostuser")).rejects.toMatchObject({
      code: "FRIEND_GUEST_DENIED",
    });
    await expect(
      service.inviteToRoom(g, randomUUID(), "hostuser"),
    ).rejects.toMatchObject({ code: "FRIEND_GUEST_DENIED" });
  });
  it("excludes Guest usernames from member search and rejects invitations targeting a Guest", async () => {
    const sender = await member("friendsearcher");
    const real = await member("peer_member");
    await guest("peer_guest");
    expect(
      (await service.search(sender, "peer_")).map((peer) => peer.username),
    ).toEqual(["peer_member"]);
    await expect(
      service.sendRequest(sender, "peer_guest"),
    ).rejects.toMatchObject({ code: "FRIEND_NOT_FOUND" });
    expect(
      (
        await pool.query(
          "SELECT sender_id,receiver_id FROM xiangqi_social.friend_requests",
        )
      ).rows,
    ).toEqual([]);
    expect(await service.listRequests(real)).toEqual([]);
  });
  it("invites an online friend and revokes on lock at accept", async () => {
    const host = await member("invhost");
    const mate = await member("invmate");
    await service.sendRequest(host, "invmate");
    const req = (await service.listRequests(mate))[0];
    await service.respondRequest(mate, req!.id, true);
    const roomId = randomUUID();
    await pool.query(
      "INSERT INTO public.rooms(id,owner_id,name,visibility,invite_code,time_control,viewer_limit,status,room_version) VALUES($1,$2,'Phong moi','CODE_ONLY','12345678',600,5,'WAITING',1)",
      [roomId, host],
    );
    await pool.query("BEGIN");
    await pool.query(
      "INSERT INTO public.room_members(room_id,user_id,role,side) VALUES($1,$2,'PLAYER','RED')",
      [roomId, host],
    );
    await pool.query(
      "INSERT INTO public.active_players(user_id,room_id,match_id) VALUES($1,$2,NULL)",
      [host, roomId],
    );
    await pool.query("COMMIT");
    await expect(
      service.inviteToRoom(host, roomId, "invmate"),
    ).rejects.toMatchObject({ code: "FRIEND_OFFLINE" });
    await pool.query(
      "INSERT INTO public.room_members(room_id,user_id,role,side) VALUES($1,$2,'SPECTATOR',NULL)",
      [roomId, mate],
    );
    await pool.query(
      "INSERT INTO xiangqi_room.presence(room_id,user_id,connection_id,generation,server_instance,connected,last_seen_at) VALUES($1,$2,'c1',1,$3,true,clock_timestamp())",
      [roomId, mate, randomUUID()],
    );
    const invite = await service.inviteToRoom(host, roomId, "invmate");
    const listed = await service.listRoomInvites(mate);
    expect(listed.map((v) => v.id)).toEqual([invite.id]);
    await pool.query(
      "UPDATE public.rooms SET visibility='LOCKED' WHERE id=$1",
      [roomId],
    );
    await expect(
      service.respondRoomInvite(mate, invite.id, true),
    ).rejects.toMatchObject({ code: "FRIEND_INVITE_REVOKED" });
    // AC-03.2.20: the unused invite is revoked for good, not left pending.
    expect(
      (
        await pool.query(
          "SELECT status FROM xiangqi_social.room_invites WHERE id=$1",
          [invite.id],
        )
      ).rows[0].status,
    ).toBe("REVOKED");
    expect(await service.listRoomInvites(mate)).toEqual([]);
    await expect(
      service.respondRoomInvite(mate, invite.id, true),
    ).rejects.toMatchObject({ code: "FRIEND_INVITE_MISSING" });
  });
});
