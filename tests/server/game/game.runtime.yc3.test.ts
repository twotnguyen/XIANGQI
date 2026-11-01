import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import {
  databaseUrl,
  resetBase as reset,
  loginPool,
  roomControl,
} from "./game.runtime.test-helper.js";
import {
  bootGuestRuntime,
  memberCall,
  memberHeaders,
  pool,
  type GuestBoot,
  type MemberFixture,
} from "./guest-runtime.test-helper.js";
import { createFriendClient } from "@web/features/friends/friend-client.js";
let boot: GuestBoot | null = null;
afterAll(async () => {
  await boot?.close();
  await loginPool.end();
  await pool.end();
});
async function call<T>(
  member: MemberFixture,
  path: string,
  body?: object,
): Promise<T> {
  const response = await memberCall(
    boot!,
    member,
    body ? "POST" : "GET",
    path,
    body,
  );
  const result = await response.json();
  expect(response.status, JSON.stringify(result)).toBe(200);
  return result as T;
}
type Entry = {
  roomId: string;
  version: number;
  role: string;
  inviteCode: string;
};
async function create(m: MemberFixture, viewerLimit = 5) {
  return call<Entry>(m, "/rooms", { commandId: randomUUID(), viewerLimit });
}
async function join(m: MemberFixture, code: string, preference = "auto") {
  return call<Entry>(m, "/rooms/join", {
    commandId: randomUUID(),
    code,
    preference,
  });
}
async function openController(member: MemberFixture, roomId: string) {
  const socket = boot!.open({
    accessToken: member.token,
    appSession: member.appSession,
    roomId,
    tabId: randomUUID(),
  });
  const joined = new Promise<void>((resolve, reject) => {
    socket.once("room.snapshot", () => resolve());
    socket.once("connect_error", reject);
  });
  socket.connect();
  await joined;
  return socket;
}
async function befriend(a: MemberFixture, b: MemberFixture) {
  const username = (
    await pool.query("SELECT username FROM public.profiles WHERE user_id=$1", [
      b.id,
    ])
  ).rows[0].username as string;
  const request = await call<{ id: string }>(a, "/friends/requests", {
    username,
  });
  await call(b, `/friends/requests/${request.id}/respond`, { accept: true });
  await call(b, "/friends/presence", { connectionId: randomUUID() });
  return username;
}
describe.skipIf(!databaseUrl)("YC3 HTTP with real room transactions", () => {
  beforeEach(async () => {
    await boot?.close();
    boot = null;
    await reset();
    boot = await bootGuestRuntime();
  });
  it("accepts after sender leaves/unfriends, commits B and releases A, and safely replays", async () => {
    const hostA = await boot!.newMember(),
      hostB = await boot!.newMember(),
      sender = await boot!.newMember(),
      viewer = await boot!.newMember();
    const a = await create(hostA),
      b = await create(hostB);
    await join(sender, b.inviteCode);
    await join(viewer, a.inviteCode, "watch");
    const username = await befriend(sender, viewer);
    const invitation = await call<{ id: string; expiresAt: string }>(
      sender,
      "/friends/invites",
      { roomId: b.roomId, username },
    );
    const senderSocket = await openController(sender, b.roomId);
    const snapshot = await call<{ version: number }>(
      sender,
      `/rooms/${b.roomId}`,
    );
    await call(sender, `/rooms/${b.roomId}/leave`, {
      commandId: randomUUID(),
      expectedVersion: snapshot.version,
      control: await roomControl(senderSocket),
    });
    const removed = await fetch(boot!.base + `/friends/${viewer.id}`, {
      method: "DELETE",
      headers: memberHeaders(sender),
    });
    expect(removed.status).toBe(200);
    const commandId = randomUUID();
    const accepted = await call<{
      accepted: boolean;
      roomId: string;
      role: string;
    }>(viewer, `/friends/invites/${invitation.id}/respond`, {
      accept: true,
      commandId,
    });
    expect(accepted).toMatchObject({
      accepted: true,
      roomId: b.roomId,
      role: "black",
    });
    expect(
      (
        await pool.query(
          "SELECT room_id,role FROM public.room_members WHERE user_id=$1",
          [viewer.id],
        )
      ).rows,
    ).toEqual([{ room_id: b.roomId, role: "PLAYER" }]);
    expect(
      await call(viewer, `/friends/invites/${invitation.id}/respond`, {
        accept: true,
        commandId,
      }),
    ).toEqual(accepted);
  });
  it("keeps A and the invitation pending when B is full, then permanently revokes on lock", async () => {
    const hostA = await boot!.newMember(),
      hostB = await boot!.newMember(),
      peer = await boot!.newMember(),
      viewer = await boot!.newMember();
    const a = await create(hostA),
      b = await create(hostB, 0);
    await join(peer, b.inviteCode);
    await join(viewer, a.inviteCode, "watch");
    const username = await befriend(hostB, viewer);
    const invitation = await call<{ id: string }>(hostB, "/friends/invites", {
      roomId: b.roomId,
      username,
    });
    const refused = await memberCall(
      boot!,
      viewer,
      "POST",
      `/friends/invites/${invitation.id}/respond`,
      { accept: true, commandId: randomUUID() },
    );
    expect(refused.status).toBe(409);
    expect(await refused.json()).toMatchObject({ code: "ROOM_FULL" });
    expect(
      (
        await pool.query(
          "SELECT room_id FROM public.room_members WHERE user_id=$1",
          [viewer.id],
        )
      ).rows,
    ).toEqual([{ room_id: a.roomId }]);
    expect(
      (
        await pool.query(
          "SELECT status FROM xiangqi_social.room_invites WHERE id=$1",
          [invitation.id],
        )
      ).rows[0].status,
    ).toBe("PENDING");
    const hostSocket = await openController(hostB, b.roomId);
    const snapshot = await call<{ version: number }>(
      hostB,
      `/rooms/${b.roomId}`,
    );
    await call(hostB, `/rooms/${b.roomId}/visibility`, {
      visibility: "LOCKED",
      expectedVersion: snapshot.version,
      control: await roomControl(hostSocket),
    });
    expect(await call(viewer, "/friends/invites")).toEqual([]);
    expect(
      (
        await pool.query(
          "SELECT status FROM xiangqi_social.room_invites WHERE id=$1",
          [invitation.id],
        )
      ).rows[0].status,
    ).toBe("REVOKED");
    const locked = await memberCall(
      boot!,
      viewer,
      "POST",
      `/friends/invites/${invitation.id}/respond`,
      { accept: true, commandId: randomUUID() },
    );
    expect(locked.status).toBe(404);
    expect(
      (
        await pool.query(
          "SELECT room_id FROM public.room_members WHERE user_id=$1",
          [viewer.id],
        )
      ).rows,
    ).toEqual([{ room_id: a.roomId }]);
  });
  it("lets the actual web client withdraw a request from both pending lists", async () => {
    const sender = await boot!.newMember(),
      receiver = await boot!.newMember();
    const web = (member: MemberFixture) =>
      createFriendClient((path, init) =>
        fetch(boot!.base + path, {
          ...init,
          headers: { ...memberHeaders(member), ...init?.headers },
        }),
      );
    const a = web(sender),
      b = web(receiver);
    const username = (
      await pool.query(
        "SELECT username FROM public.profiles WHERE user_id=$1",
        [receiver.id],
      )
    ).rows[0].username as string;
    await a.send(username);
    const incoming = await b.requests();
    expect(incoming).toHaveLength(1);
    await a.revoke(incoming[0]!.id);
    expect(await a.requests()).toEqual([]);
    expect(await b.requests()).toEqual([]);
  });
});
