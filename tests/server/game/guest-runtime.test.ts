import { randomUUID } from "node:crypto";
import type { ChatPage, ChatSent } from "@xiangqi/shared";
import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Socket } from "socket.io-client";
import {
  databaseUrl,
  loginPool,
  reset,
  pool,
  waitFor,
} from "./game.runtime.test-helper.js";
import {
  ackOk,
  bootGuestRuntime,
  command,
  connect,
  createGuest,
  expireGuest,
  guestCall,
  matchOf,
  memberCall,
  observe,
  privateNameLeaks,
  seatOf,
  type GuestBoot,
  type GuestFixture,
  type MemberFixture,
} from "./guest-runtime.test-helper.js";
import type { RoomSnapshot } from "@xiangqi/shared";

interface Seated {
  roomId: string;
  inviteCode: string;
  guest: GuestFixture;
  host: MemberFixture;
  guestSocket: Socket;
  hostSocket: Socket;
  guestSnapshot: () => RoomSnapshot | undefined;
}

// Real HTTP room creation, real member join, real Socket.IO ready flow. The
// guest is the host; the member opponent is seated second and never expires.
async function playingPair(boot: GuestBoot, name: string): Promise<Seated> {
  const guest = await createGuest(boot, name);
  const opponent = await boot.newMember();
  const created = await guestCall(boot, guest.cap, "POST", "/rooms", {
    commandId: randomUUID(),
    timeMinutes: 5,
  });
  expect(created.status).toBe(200);
  const entry = (await created.json()) as {
    roomId: string;
    inviteCode: string;
  };
  const joined = await memberCall(boot, opponent, "POST", "/rooms/join", {
    commandId: randomUUID(),
    code: entry.inviteCode,
    preference: "play",
  });
  expect(joined.status).toBe(200);

  const guestSocket = boot.open({
    guestCapability: guest.cap,
    roomId: entry.roomId,
    tabId: randomUUID(),
  });
  const hostSocket = boot.open({
    accessToken: opponent.token,
    appSession: opponent.appSession,
    roomId: entry.roomId,
    tabId: randomUUID(),
  });
  const guestSnapshot = observe(guestSocket);
  const hostSnapshot = observe(hostSocket);
  await connect(guestSocket);
  await connect(hostSocket);
  await waitFor(
    async () => guestSnapshot(),
    (s) => Boolean(s?.room.connected.red && s?.room.connected.black),
  );

  for (const [socket, snapshot] of [
    [guestSocket, guestSnapshot],
    [hostSocket, hostSnapshot],
  ] as const) {
    const current = await waitFor(
      async () => snapshot(),
      (s) => s !== undefined,
    );
    if (!current) throw new Error("Room snapshot did not arrive before ready");
    const ack = await command(socket, entry.roomId, current.version, {
      type: "room.ready",
      payload: { ready: true },
    });
    if (ack.status !== "ok")
      throw new Error(`room.ready rejected: ${ack.error.code}`);
    // The origin receives its snapshot in the ack; realtime publication skips origins
    // already at that version, so the peer is the one that gets the push.
    const peerSnapshot = socket === guestSocket ? hostSnapshot : guestSnapshot;
    await waitFor(
      async () => peerSnapshot(),
      (s) => s !== undefined && s.version >= ack.snapshot.version,
    );
  }
  await waitFor(
    async () => guestSnapshot(),
    (s) => s?.match?.status === "ACTIVE",
    8000,
  );
  return {
    roomId: entry.roomId,
    inviteCode: entry.inviteCode,
    guest,
    host: opponent,
    guestSocket,
    hostSocket,
    guestSnapshot,
  };
}

async function logout(
  boot: GuestBoot,
  cap: string,
  confirmedResign: boolean,
): Promise<Response> {
  return fetch(boot.base + "/account/guest/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: "xiangqi_guest=" + cap,
    },
    body: JSON.stringify({ confirmedResign }),
  });
}

async function sessionCount(userId: string): Promise<number> {
  const row = await pool.query<{ n: number }>(
    "SELECT count(*)::int AS n FROM xiangqi_auth.guest_sessions WHERE guest_id=$1",
    [userId],
  );
  return row.rows[0]?.n ?? 0;
}

describe.skipIf(!databaseUrl)("guest runtime acceptance", () => {
  let boot: GuestBoot | undefined;
  beforeEach(async () => {
    await reset();
    boot = await bootGuestRuntime();
  }, 20000);
  afterEach(async () => {
    await boot?.close();
    boot = undefined;
  });
  afterAll(async () => {
    await pool.end();
    await loginPool.end();
  });

  it("runs a guest room end to end over HTTP and Socket.IO with guest chat", async () => {
    const seated = await playingPair(boot!, "Khách Một");
    try {
      const sent = await ackOk<ChatSent>(seated.guestSocket, "chat.send", {
        commandId: randomUUID(),
        channel: "ROOM_PUBLIC",
        content: "xin chao tu khach",
      });
      expect(sent.sequence).toBeGreaterThan(0);
      const page = await ackOk<ChatPage>(seated.hostSocket, "chat.read", {
        channel: "ROOM_PUBLIC",
      });
      expect(JSON.stringify(page)).toContain("xin chao tu khach");
      const feed = await guestCall(
        boot!,
        seated.guest.cap,
        "GET",
        "/public-rooms",
      );
      expect(feed.status).toBe(200);
    } finally {
      seated.guestSocket.disconnect();
      seated.hostSocket.disconnect();
    }
  }, 30000);

  it("denies guests member-only friend, profile, and history APIs", async () => {
    const guest = await createGuest(boot!, "Khách Hai");
    for (const path of ["/friends", "/profile", "/history"]) {
      const response = await guestCall(boot!, guest.cap, "GET", path);
      expect([401, 403]).toContain(response.status);
    }
  });

  it("keeps an expired Guest host in its initial WAITING room until leaving the seat", async () => {
    const guest = await createGuest(boot!, "Khách phòng chờ");
    const created = await guestCall(boot!, guest.cap, "POST", "/rooms", {
      commandId: randomUUID(),
      timeMinutes: 5,
    });
    expect(created.status).toBe(200);
    const roomId = (await created.json()).roomId;
    await expireGuest(guest.userId);
    const current = await guestCall(
      boot!,
      guest.cap,
      "GET",
      `/rooms/${roomId}`,
    );
    expect(current.status).toBe(200);
    expect(
      (
        await fetch(boot!.base + "/account/guest/session", {
          headers: { Cookie: "xiangqi_guest=" + guest.cap },
        })
      ).status,
    ).toBe(200);
    expect(
      (
        await guestCall(boot!, guest.cap, "POST", "/rooms", {
          commandId: randomUUID(),
          timeMinutes: 5,
        })
      ).status,
    ).toBe(403);
    expect((await logout(boot!, guest.cap, false)).status).toBe(200);
    expect(await sessionCount(guest.userId)).toBe(0);
    expect(await seatOf(roomId, guest.userId)).toBeUndefined();
  });

  it("allows one open guest room and rejects a second room and a second seat", async () => {
    const seated = await playingPair(boot!, "Khách Ba");
    try {
      const second = await guestCall(
        boot!,
        seated.guest.cap,
        "POST",
        "/rooms",
        {
          commandId: randomUUID(),
          timeMinutes: 5,
        },
      );
      expect(second.status).toBe(409);
      expect(await second.text()).toContain("GUEST_ROOM_LIMIT");

      const other = await boot!.newMember();
      const otherRoom = await memberCall(boot!, other, "POST", "/rooms", {
        commandId: randomUUID(),
        timeMinutes: 5,
      });
      const otherEntry = (await otherRoom.json()) as {
        roomId: string;
        inviteCode: string;
      };
      const denied = await guestCall(
        boot!,
        seated.guest.cap,
        "POST",
        "/rooms/join",
        {
          commandId: randomUUID(),
          code: otherEntry.inviteCode,
          preference: "play",
        },
      );
      expect(denied.status).not.toBe(200);
      expect(
        await seatOf(otherEntry.roomId, seated.guest.userId),
      ).toBeUndefined();
    } finally {
      seated.guestSocket.disconnect();
      seated.hostSocket.disconnect();
    }
  }, 30000);

  it("keeps an active seat on logout without confirmation, then confirmed resign scrubs PII", async () => {
    const seated = await playingPair(boot!, "Khách Bốn");
    try {
      const refused = await logout(boot!, seated.guest.cap, false);
      expect(refused.status).toBe(409);
      expect(await refused.text()).toContain("GUEST_RESIGN_CONFIRM_REQUIRED");
      expect((await matchOf(seated.roomId))?.status).toBe("ACTIVE");
      expect(
        (
          await pool.query<{ ended_at: Date | null }>(
            "SELECT ended_at FROM xiangqi_auth.guest_sessions WHERE guest_id=$1",
            [seated.guest.userId],
          )
        ).rows[0]?.ended_at,
      ).toBeNull();
      const stillSeated = await guestCall(
        boot!,
        seated.guest.cap,
        "GET",
        `/rooms/${seated.roomId}`,
      );
      expect(stillSeated.status).toBe(200);

      const confirmed = await logout(boot!, seated.guest.cap, true);
      expect(confirmed.status).toBe(200);
      const revoked = await guestCall(
        boot!,
        seated.guest.cap,
        "GET",
        `/rooms/${seated.roomId}`,
      );
      expect(revoked.status).toBe(401);

      const finished = await waitFor(
        async () => matchOf(seated.roomId),
        (m) => m?.status === "FINISHED",
        8000,
      );
      expect(finished?.winner).not.toBeNull();
      expect(await sessionCount(seated.guest.userId)).toBe(0);
      expect(await privateNameLeaks(seated.guest.name)).toBe(0);

      const history = await memberCall(boot!, seated.host, "GET", "/history");
      expect(history.status).toBe(200);
      expect(await history.text()).not.toContain(seated.guest.name);
    } finally {
      seated.guestSocket.disconnect();
      seated.hostSocket.disconnect();
    }
  }, 40000);

  it("lets a deferred expired seated guest finish but not create or join another room", async () => {
    const seated = await playingPair(boot!, "Khách Năm");
    try {
      await expireGuest(seated.guest.userId);
      const existing = await guestCall(
        boot!,
        seated.guest.cap,
        "GET",
        `/rooms/${seated.roomId}`,
      );
      expect(existing.status).toBe(200);

      const created = await guestCall(
        boot!,
        seated.guest.cap,
        "POST",
        "/rooms",
        {
          commandId: randomUUID(),
          timeMinutes: 5,
        },
      );
      expect(created.status).toBe(403);
      expect(await created.text()).toContain("GUEST_DEFERRED");

      const finishing = await logout(boot!, seated.guest.cap, true);
      expect(finishing.status).toBe(200);
      expect(await privateNameLeaks(seated.guest.name)).toBe(0);
    } finally {
      seated.guestSocket.disconnect();
      seated.hostSocket.disconnect();
    }
  }, 40000);

  it("ends an expired unseated guest on access and scrubs its personal data", async () => {
    const guest = await createGuest(boot!, "Khách Sáu");
    await expireGuest(guest.userId);
    const access = await guestCall(boot!, guest.cap, "POST", "/rooms", {
      commandId: randomUUID(),
      timeMinutes: 5,
    });
    expect(access.status).toBe(401);
    expect(await sessionCount(guest.userId)).toBe(0);
    expect(await privateNameLeaks(guest.name)).toBe(0);
  });

  it("ends an expired spectator on room access and commits cleanup before 401", async () => {
    const host = await boot!.newMember();
    const created = await memberCall(boot!, host, "POST", "/rooms", {
      commandId: randomUUID(),
      timeMinutes: 5,
    });
    expect(created.status).toBe(200);
    const entry = (await created.json()) as {
      roomId: string;
      inviteCode: string;
    };
    const guest = await createGuest(boot!, "Khách Bảy");
    const joined = await guestCall(boot!, guest.cap, "POST", "/rooms/join", {
      commandId: randomUUID(),
      code: entry.inviteCode,
      preference: "watch",
    });
    expect(joined.status).toBe(200);
    await expireGuest(guest.userId);

    const access = await guestCall(
      boot!,
      guest.cap,
      "GET",
      `/rooms/${entry.roomId}`,
    );
    expect(access.status).toBe(401);
    const membership = await pool.query<{ n: number }>(
      "SELECT count(*)::int AS n FROM public.room_members WHERE user_id=$1",
      [guest.userId],
    );
    expect(membership.rows[0]?.n).toBe(0);
    expect(await sessionCount(guest.userId)).toBe(0);
    expect(await privateNameLeaks(guest.name)).toBe(0);
  });

  it("keeps a deferred expired Guest seated after the room returns to WAITING and ends the session only on leaving", async () => {
    const seated = await playingPair(boot!, "Khách Tám");
    try {
      await expireGuest(seated.guest.userId);
      const version = seated.guestSnapshot()?.version;
      expect(version).toBeDefined();
      const left = await memberCall(
        boot!,
        seated.host,
        "POST",
        `/rooms/${seated.roomId}/leave`,
        {
          expectedVersion: version,
        },
      );
      expect(left.status).toBe(200);
      await waitFor(
        async () => matchOf(seated.roomId),
        (m) => m?.status === "FINISHED",
        8000,
      );

      const access = await guestCall(
        boot!,
        seated.guest.cap,
        "GET",
        `/rooms/${seated.roomId}`,
      );
      expect(access.status).toBe(200);
      expect(await seatOf(seated.roomId, seated.guest.userId)).toBeDefined();
      expect(await sessionCount(seated.guest.userId)).toBe(1);
      const loggedOut = await logout(boot!, seated.guest.cap, false);
      expect(loggedOut.status).toBe(200);
      expect(await seatOf(seated.roomId, seated.guest.userId)).toBeUndefined();
      expect(await sessionCount(seated.guest.userId)).toBe(0);
      expect(await privateNameLeaks(seated.guest.name)).toBe(0);
    } finally {
      seated.guestSocket.disconnect();
      seated.hostSocket.disconnect();
    }
  }, 40000);
});
