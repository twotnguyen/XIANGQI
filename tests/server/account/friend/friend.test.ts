import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { Pool } from "pg";
import { apply, databaseUrl, reset } from "../../game/room/room.test-helper.js";
import { FriendService } from "@server/account/friend/friend.service.js";
import { FriendStore } from "@server/account/friend/friend.store.js";
import type { FriendRoomPort } from "@server/account/friend/friend.room-port.js";
import { FriendError } from "@server/account/friend/friend.types.js";
import { RoomStore } from "@server/game/room/room-store.js";
import { RoomTransactions } from "@server/game/room/room-transactions.js";

const url = process.env.ROOM_TEST_DATABASE_URL ?? databaseUrl;
const pool = new Pool({ connectionString: url });
afterAll(() => pool.end());

/** Port giả: test đặt hành vi accept cho từng ca; mặc định join thành công. */
let portAccept: FriendRoomPort["acceptInvite"] = async (_proof, input) => ({
  accepted: true,
  roomId: input.inviteId,
  version: 1,
  role: "red",
});
const rooms: FriendRoomPort = {
  acceptInvite: (proof, input) => portAccept(proof, input),
};
const service = new FriendService(new FriendStore(pool), rooms);
const proof = {} as never;

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
/** Tạo phòng và ghế RED cho host (đang chơi), trả về roomId. */
async function seatedRoom(host: string) {
  const actor = { userId: host, kind: "member" as const };
  const result = await new RoomTransactions(pool).withRoom(
    { actor, roomIds: [] },
    async () => ({ status: "active", actor }),
    (scope) => new RoomStore().create(scope, { commandId: randomUUID() }),
  );
  if (result.status !== "active") throw new Error("Fixture actor ended");
  return result.value.roomId;
}
/** Kết bạn hai chiều, host đã online, mate đã online. */
async function friendsOnline(host: string, mate: string, mateName: string) {
  await service.sendRequest(host, mateName);
  const req = (await service.listRequests(mate))[0];
  await service.respondRequest(mate, req!.id, true);
  await service.heartbeat(host, randomUUID());
  await service.heartbeat(mate, randomUUID());
}

describe.skipIf(!url)("friendships", () => {
  beforeEach(async () => {
    portAccept = async (_proof, input) => ({
      accepted: true,
      roomId: input.inviteId,
      version: 1,
      role: "red",
    });
    await pool.query(
      "DROP SCHEMA IF EXISTS xiangqi_chat CASCADE; DROP SCHEMA IF EXISTS xiangqi_ai CASCADE; DROP SCHEMA IF EXISTS xiangqi_social CASCADE",
    );
    await reset();
    await apply("supabase/migrations/20261011000006_rooms.sql");
    await apply("supabase/migrations/20261011000007_match_outcomes.sql");
    await apply("supabase/migrations/20261017000018_room_code_digits.sql");
    await apply("supabase/migrations/20261102000002_custom_rematch.sql");
    await apply("supabase/migrations/20261103000004_room_issued_codes.sql");
    await apply("supabase/migrations/20261102000003_unlimited_inactivity.sql");
    await apply("supabase/migrations/20261011000014_friendships.sql");
    await apply(
      "supabase/migrations/20261101000001_friend_presence_invites.sql",
    );
  });

  it("rolls back before feature writes but refuses to drop persisted presence", async () => {
    const migration = "20261101000001_friend_presence_invites.sql";
    await apply(`supabase/rollback/${migration}`);
    await apply(`supabase/migrations/${migration}`);
    const user = await member("rollbackmember");
    await service.heartbeat(user, randomUUID());
    await expect(apply(`supabase/rollback/${migration}`)).rejects.toThrow(
      "rollback refused",
    );
    expect(
      (
        await pool.query(
          "SELECT user_id FROM xiangqi_social.presence_leases WHERE user_id=$1",
          [user],
        )
      ).rows,
    ).toEqual([{ user_id: user }]);
    await pool.query("DELETE FROM xiangqi_auth.principals WHERE id=$1", [user]);
    expect(
      (
        await pool.query(
          "SELECT user_id FROM xiangqi_social.presence_leases WHERE user_id=$1",
          [user],
        )
      ).rows,
    ).toEqual([]);
  });

  it("searches by prefix, sends, accepts and lists friends with presence", async () => {
    const a = await member("anfriend");
    const b = await member("anhrifriend");
    const found = await service.search(a, "anh");
    expect(found.map((p) => p.username)).toEqual(["anhrifriend"]);
    const sent = await service.sendRequest(a, "anhrifriend");
    expect(sent.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    const incoming = await service.listRequests(b);
    expect(incoming[0]).toMatchObject({
      direction: "incoming",
      peer: { userId: a, username: "anfriend" },
    });
    await service.respondRequest(b, sent.id, true);
    expect((await service.listFriends(a))[0]!.status).toBe("offline");
    await service.heartbeat(b, randomUUID());
    expect((await service.listFriends(a))[0]!.status).toBe("online");
  });

  it("expires presence leases after 8 seconds and treats seated users as in-match", async () => {
    const a = await member("leaseuser");
    const b = await member("leasefriend");
    await friendsOnline(a, b, "leasefriend");
    await pool.query(
      "UPDATE xiangqi_social.presence_leases SET expires_at=clock_timestamp()-interval '1 second' WHERE user_id=$1",
      [b],
    );
    expect((await service.listFriends(a))[0]!.status).toBe("offline");
    await service.heartbeat(b, randomUUID());
    await seatedRoom(b);
    expect((await service.listFriends(a))[0]!.status).toBe("in-match");
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

  it("requires at least 3 characters and returns at most 20 usernames in ascending order (AC-YC3-RV-02)", async () => {
    const searcher = await member("capsearcher");
    for (const short of ["", " ", "a", "ca", " ab "])
      await expect(service.search(searcher, short)).rejects.toMatchObject({
        code: "FRIEND_INPUT_INVALID",
      });
    for (let i = 21; i >= 1; i--)
      await member(`capmate${String(i).padStart(2, "0")}`);
    const found = (await service.search(searcher, "capm")).map(
      (p) => p.username,
    );
    expect(found).toHaveLength(20);
    expect(found).toEqual([...found].sort());
    expect(found[0]).toBe("capmate01");
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
    expect(await service.listRequests(real)).toEqual([]);
  });

  it("invites an online friend, requires presence, and revokes when the port reports the room locked", async () => {
    const host = await member("invhost");
    const mate = await member("invmate");
    const roomId = await seatedRoom(host);
    await service.sendRequest(host, "invmate");
    const req = (await service.listRequests(mate))[0];
    await service.respondRequest(mate, req!.id, true);
    await service.heartbeat(host, randomUUID());
    await expect(
      service.inviteToRoom(host, roomId, "invmate"),
    ).rejects.toMatchObject({ code: "FRIEND_OFFLINE" });
    await service.heartbeat(mate, randomUUID());
    const invite = await service.inviteToRoom(host, roomId, "invmate");
    expect(invite.cooldownUntil).not.toBeNull();
    const listed = await service.listRoomInvites(mate);
    expect(listed[0]).toMatchObject({
      id: invite.id,
      inviter: { userId: host, username: "invhost", displayName: "invhost" },
    });
    portAccept = async () => {
      throw new FriendError("FRIEND_ROOM_LOCKED", "locked", 409);
    };
    await expect(
      service.respondRoomInvite(mate, invite.id, {
        accept: true,
        commandId: randomUUID(),
        proof,
      }),
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
      service.respondRoomInvite(mate, invite.id, {
        accept: true,
        commandId: randomUUID(),
        proof,
      }),
    ).rejects.toMatchObject({ code: "FRIEND_INVITE_MISSING" });
  });

  it("rejects the sixth concurrent invite to one recipient without a cooldown (AC-YC3-RV-04)", async () => {
    const mate = await member("fullmate");
    const invites: string[] = [];
    for (let i = 1; i <= 5; i++) {
      const host = await member(`fullhost${i}`);
      const roomId = await seatedRoom(host);
      await friendsOnline(host, mate, "fullmate");
      invites.push((await service.inviteToRoom(host, roomId, "fullmate")).id);
    }
    const sixth = await member("fullhost6");
    const sixthRoom = await seatedRoom(sixth);
    await friendsOnline(sixth, mate, "fullmate");
    await expect(
      service.inviteToRoom(sixth, sixthRoom, "fullmate"),
    ).rejects.toMatchObject({ code: "FRIEND_INVITE_RECIPIENT_FULL" });
    expect((await service.inviteState(sixth)).cooldownUntil).toBeNull();
    expect(await service.listRoomInvites(mate)).toHaveLength(5);
    await service.respondRoomInvite(mate, invites[0]!, {
      accept: false,
      commandId: randomUUID(),
    });
    const retry = await service.inviteToRoom(sixth, sixthRoom, "fullmate");
    expect(retry.id).toBeTruthy();
  });

  it("keeps the invite pending when the port fails with a retryable error", async () => {
    const host = await member("retryhost");
    const mate = await member("retrymate");
    const roomId = await seatedRoom(host);
    await friendsOnline(host, mate, "retrymate");
    const invite = await service.inviteToRoom(host, roomId, "retrymate");
    portAccept = async () => {
      throw new FriendError("FRIEND_ROOM_FULL", "full", 409);
    };
    await expect(
      service.respondRoomInvite(mate, invite.id, {
        accept: true,
        commandId: randomUUID(),
        proof,
      }),
    ).rejects.toMatchObject({ code: "FRIEND_ROOM_FULL" });
    expect(
      (
        await pool.query(
          "SELECT status FROM xiangqi_social.room_invites WHERE id=$1",
          [invite.id],
        )
      ).rows[0].status,
    ).toBe("PENDING");
  });

  it("returns cooldown on decline, keeps one decline notice, and acks idempotently", async () => {
    const host = await member("declhost");
    const mate = await member("declmate");
    const roomId = await seatedRoom(host);
    await friendsOnline(host, mate, "declmate");
    const invite = await service.inviteToRoom(host, roomId, "declmate");
    const commandId = randomUUID();
    const declined = await service.respondRoomInvite(mate, invite.id, {
      accept: false,
      commandId,
    });
    expect(declined).toEqual({
      accepted: false,
      cooldownUntil: expect.any(String),
    });
    // Replay với cùng commandId trả lại đúng body đã lưu.
    expect(
      await service.respondRoomInvite(mate, invite.id, {
        accept: false,
        commandId,
      }),
    ).toEqual(declined);
    const state = await service.inviteState(host);
    expect(declined).toMatchObject({
      accepted: false,
      cooldownUntil: state.cooldownUntil,
    });
    expect(state.declines).toHaveLength(1);
    expect(state.declines[0]).toMatchObject({
      inviteId: invite.id,
      displayName: "declmate",
    });
    await service.ackDecline(host, state.declines[0]!.id);
    await service.ackDecline(host, state.declines[0]!.id);
    expect((await service.inviteState(host)).declines).toEqual([]);
    await expect(service.ackDecline(host, randomUUID())).rejects.toMatchObject({
      code: "FRIEND_NOTICE_MISSING",
    });
  });

  it("blocks a second invite during the global 10-second cooldown of the sender", async () => {
    const host = await member("cdhost");
    const mate = await member("cdmate");
    const other = await member("cdother");
    const roomId = await seatedRoom(host);
    await friendsOnline(host, mate, "cdmate");
    await service.sendRequest(host, "cdother");
    const req = (await service.listRequests(other))[0];
    await service.respondRequest(other, req!.id, true);
    await service.heartbeat(other, randomUUID());
    await service.inviteToRoom(host, roomId, "cdmate");
    await expect(
      service.inviteToRoom(host, roomId, "cdother"),
    ).rejects.toMatchObject({ code: "FRIEND_INVITE_COOLDOWN" });
  });
  it("resets both decline directions only after a successful friendship, even after unfriend", async () => {
    const a = await member("reseta"),
      b = await member("resetb");
    for (let n = 0; n < 2; n++) {
      const request = await service.sendRequest(a, "resetb");
      await service.respondRequest(b, request.id, false);
    }
    await expect(service.sendRequest(a, "resetb")).rejects.toMatchObject({
      code: "FRIEND_BLOCKED",
    });
    const reverse = await service.sendRequest(b, "reseta");
    await service.respondRequest(a, reverse.id, true);
    expect(
      (
        await pool.query(
          "SELECT declines FROM xiangqi_social.friend_decline_counts WHERE blocker_id=ANY($1::uuid[])",
          [[a, b]],
        )
      ).rows,
    ).toEqual([]);
    await service.unfriend(a, b);
    const again = await service.sendRequest(a, "resetb");
    expect((await service.listRequests(b)).map((r) => r.id)).toEqual([
      again.id,
    ]);
  });

  it("keeps Online while another tab lease survives, then shows Offline without releasing the seat", async () => {
    const a = await member("multia"),
      b = await member("multib");
    await friendsOnline(a, b, "multib");
    const tab = randomUUID();
    await service.heartbeat(b, tab);
    const roomId = await seatedRoom(b);
    await pool.query(
      "UPDATE xiangqi_social.presence_leases SET expires_at=clock_timestamp()-interval '1 second' WHERE user_id=$1 AND connection_id<>$2",
      [b, tab],
    );
    expect((await service.listFriends(a))[0]!.status).toBe("in-match");
    await pool.query(
      "UPDATE xiangqi_social.presence_leases SET expires_at=clock_timestamp()-interval '1 second' WHERE user_id=$1",
      [b],
    );
    expect((await service.listFriends(a))[0]!.status).toBe("offline");
    expect(
      (
        await pool.query(
          "SELECT room_id FROM public.active_players WHERE user_id=$1",
          [b],
        )
      ).rows,
    ).toEqual([{ room_id: roomId }]);
  });

  it("serializes requests at the receiver's 50-pending boundary and accept at 200 friends", async () => {
    const receiver = await member("boundaryreceiver"),
      a = await member("boundarya"),
      b = await member("boundaryb");
    const peers = (
      await pool.query<{ id: string; username: string }>(`
      WITH users AS (INSERT INTO auth.users(id,email,email_confirmed_at)
        SELECT gen_random_uuid(),'boundary-'||n||'@example.invalid',clock_timestamp() FROM generate_series(1,200) n RETURNING id,email)
      INSERT INTO public.profiles(user_id,username,display_name)
        SELECT id,'bound'||split_part(split_part(email,'@',1),'-',2),'Boundary peer' FROM users RETURNING user_id AS id,username`)
    ).rows;
    await pool.query(
      `INSERT INTO xiangqi_social.friend_requests(id,sender_id,receiver_id,status,created_at,expires_at)
      SELECT gen_random_uuid(),id,$1,'PENDING',now(),now()+interval '30 days' FROM unnest($2::uuid[]) id`,
      [receiver, peers.slice(0, 49).map((p) => p.id)],
    );
    const sends = await Promise.allSettled([
      service.sendRequest(a, "boundaryreceiver"),
      service.sendRequest(b, "boundaryreceiver"),
    ]);
    expect(sends.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(sends.find((r) => r.status === "rejected")).toMatchObject({
      reason: { code: "FRIEND_INVITE_LIMIT" },
    });
    await pool.query(
      "UPDATE xiangqi_social.friend_requests SET status='REVOKED',resolved_at=clock_timestamp() WHERE receiver_id=$1",
      [receiver],
    );
    const ra = await service.sendRequest(a, "boundaryreceiver"),
      rb = await service.sendRequest(b, "boundaryreceiver");
    await pool.query(
      `INSERT INTO xiangqi_social.friendships(user_a,user_b,created_at)
      SELECT LEAST(id,$1::uuid),GREATEST(id,$1::uuid),clock_timestamp() FROM unnest($2::uuid[]) id`,
      [receiver, peers.slice(0, 199).map((p) => p.id)],
    );
    const accepts = await Promise.allSettled([
      service.respondRequest(receiver, ra.id, true),
      service.respondRequest(receiver, rb.id, true),
    ]);
    expect(accepts.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(accepts.find((r) => r.status === "rejected")).toMatchObject({
      reason: { code: "FRIEND_LIMIT" },
    });
    expect(await service.listFriends(receiver)).toHaveLength(200);
    await expect(
      service.sendRequest(peers[199]!.id, "boundaryreceiver"),
    ).rejects.toMatchObject({ code: "FRIEND_LIMIT" });
  });

  it("deduplicates pending room invites without renewing deadline or cooldown", async () => {
    const host = await member("dedupehost"),
      mate = await member("dedupemate");
    const roomId = await seatedRoom(host);
    await friendsOnline(host, mate, "dedupemate");
    const original = await service.inviteToRoom(host, roomId, "dedupemate");
    expect(await service.inviteToRoom(host, roomId, "dedupemate")).toEqual(
      original,
    );
    await service.unfriend(host, mate);
    expect((await service.listRoomInvites(mate)).map((i) => i.id)).toEqual([
      original.id,
    ]);
    await pool.query(
      "WITH t AS(SELECT clock_timestamp()-interval '1 second' old) UPDATE xiangqi_social.room_invites SET created_at=t.old-interval '30 seconds',expires_at=t.old FROM t WHERE id=$1",
      [original.id],
    );
    expect(await service.listRoomInvites(mate)).toEqual([]);
    const state = await service.inviteState(host);
    expect(state.declines).toEqual([]);
    expect(state.cooldownUntil).toBe(original.cooldownUntil);
  });
  it("keeps one pending request on simultaneous crossed sends without auto-accept", async () => {
    const a = await member("racinga"),
      b = await member("racingb");
    const [one, two] = await Promise.all([
      service.sendRequest(a, "racingb"),
      service.sendRequest(b, "racinga"),
    ]);
    expect(one.id).toBe(two.id);
    const pending = await service.listRequests(a);
    expect(pending.map((r) => r.id)).toEqual([one.id]);
    expect(await service.listFriends(a)).toEqual([]);
    expect(await service.listFriends(b)).toEqual([]);
  });
  it("withdraws both pending views and does not count a withdrawal as a decline", async () => {
    const a = await member("withdrawa"),
      b = await member("withdrawb");
    const sent = await service.sendRequest(a, "withdrawb");
    await expect(service.revokeRequest(b, sent.id)).rejects.toMatchObject({
      code: "FRIEND_REQUEST_MISSING",
    });
    await service.revokeRequest(a, sent.id);
    expect(await service.listRequests(a)).toEqual([]);
    expect(await service.listRequests(b)).toEqual([]);
    await expect(
      service.respondRequest(b, sent.id, true),
    ).rejects.toMatchObject({ code: "FRIEND_REQUEST_MISSING" });
    expect(
      (
        await pool.query(
          "SELECT declines FROM xiangqi_social.friend_decline_counts WHERE requester_id=$1",
          [a],
        )
      ).rows,
    ).toEqual([]);
    const next = await service.sendRequest(a, "withdrawb");
    await service.respondRequest(b, next.id, true);
    await service.unfriend(a, b);
    expect(await service.listFriends(a)).toEqual([]);
    expect(await service.listFriends(b)).toEqual([]);
  });
});
