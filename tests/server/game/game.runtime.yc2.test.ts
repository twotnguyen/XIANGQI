import { randomUUID } from "node:crypto";
import type {
  ChatPage,
  CommandAcknowledgement,
  RoomAction,
  RoomClosedNotice,
  RoomSnapshot,
} from "@xiangqi/shared";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import type { Socket } from "socket.io-client";
import type { RegistrationRuntime } from "@server/account/auth/registration.module.js";
import { SessionService } from "@server/account/login/session.service.js";
import {
  createLoginPool,
  PostgresLoginStore,
} from "@server/account/login/postgres-login-store.js";
import type { RoomView } from "@server/game/room/room.types.js";
import { createRoomRuntime } from "@server/game/game.runtime.js";
import { databaseUrl, pool, reset } from "./game.runtime.test-helper.js";
import {
  ackOk,
  bootGuestRuntime,
  command,
  connect,
  memberCall,
  waitFor,
  type GuestBoot,
  type MemberFixture,
} from "./guest-runtime.test-helper.js";

const loginPool = createLoginPool({ connectionString: databaseUrl });
const env = { ROOMS_ENABLED: "true", AUTH_LOGIN_ENABLED: "true" };

// Tracks the highest-version snapshot pushed to a socket.
interface Tracker {
  get(): RoomSnapshot | undefined;
}
function track(socket: Socket): Tracker {
  let latest: RoomSnapshot | undefined;
  socket.on("room.snapshot", (snapshot: RoomSnapshot) => {
    if (!latest || snapshot.version >= latest.version) latest = snapshot;
  });
  return { get: () => latest };
}

// Waits for a pushed snapshot satisfying the predicate; fails loudly otherwise.
async function snapshotWhen(
  tracker: Tracker,
  predicate: (s: RoomSnapshot) => boolean,
  timeout = 8000,
): Promise<RoomSnapshot> {
  const found = await waitFor(
    async () => tracker.get(),
    (s) => s !== undefined && predicate(s),
    timeout,
  );
  if (!found) throw new Error("snapshot condition not reached");
  return found;
}

interface Seat {
  member: MemberFixture;
  socket: Socket;
  tracker: Tracker;
}
interface Room {
  boot: GuestBoot;
  roomId: string;
  inviteCode: string;
  red: Seat;
  black: Seat;
}

async function openSeat(
  boot: GuestBoot,
  m: MemberFixture,
  roomId: string,
): Promise<Seat> {
  const socket = boot.open({
    accessToken: m.token,
    appSession: m.appSession,
    roomId,
    tabId: randomUUID(),
  });
  const tracker = track(socket);
  await connect(socket);
  return { member: m, socket, tracker };
}

// Real HTTP create/join plus real Socket.IO sockets for both seats.
async function seatedRoom(boot: GuestBoot): Promise<Room> {
  const red = await boot.newMember(),
    black = await boot.newMember();
  const created = await memberCall(boot, red, "POST", "/rooms", {
    commandId: randomUUID(),
    timeMinutes: 5,
  });
  expect(created.status).toBe(200);
  const entry = (await created.json()) as {
    roomId: string;
    inviteCode: string;
  };
  const joined = await memberCall(boot, black, "POST", "/rooms/join", {
    commandId: randomUUID(),
    code: entry.inviteCode,
    preference: "play",
  });
  expect(joined.status).toBe(200);
  const room: Room = {
    boot,
    roomId: entry.roomId,
    inviteCode: entry.inviteCode,
    red: await openSeat(boot, red, entry.roomId),
    black: await openSeat(boot, black, entry.roomId),
  };
  await snapshotWhen(
    room.red.tracker,
    (s) => s.room.connected.red && s.room.connected.black,
  );
  return room;
}

function seatFor(room: Room, who: "red" | "black") {
  return who === "red" ? room.red : room.black;
}

// Authoritative version from GET /rooms/:id, never a possibly-stale socket push.
async function freshVersion(room: Room, who: "red" | "black") {
  const seat = seatFor(room, who);
  const response = await memberCall(
    room.boot,
    seat.member,
    "GET",
    `/rooms/${room.roomId}`,
  );
  expect(response.status).toBe(200);
  // Boundary: RoomView is the server's own HTTP view type; only `version` is read.
  const view = (await response.json()) as RoomView;
  return view.version;
}

async function act(
  room: Room,
  who: "red" | "black",
  action: RoomAction,
): Promise<CommandAcknowledgement> {
  const ack = await command(
    seatFor(room, who).socket,
    room.roomId,
    await freshVersion(room, who),
    action,
  );
  if (ack.status !== "ok")
    throw new Error(`action rejected: ${ack.error.code}`);
  return ack;
}

async function readyBoth(room: Room, previousMatchId?: string) {
  await act(room, "red", { type: "room.ready", payload: { ready: true } });
  await act(room, "black", { type: "room.ready", payload: { ready: true } });
  const fresh = (s: RoomSnapshot) =>
    s.match?.status === "ACTIVE" && s.match.id !== previousMatchId;
  const red = await snapshotWhen(room.red.tracker, fresh);
  await snapshotWhen(room.black.tracker, fresh);
  if (!red.match) throw new Error("active match missing");
  return red.match.id;
}

async function matchVersionOf(room: Room, matchId: string) {
  const snap = await snapshotWhen(
    room.red.tracker,
    (s) => s.match?.id === matchId,
  );
  if (!snap.match) throw new Error("match missing");
  return snap.match.version;
}

async function chatSend(seat: Seat, channel: string, content: string) {
  return ackOk<unknown>(seat.socket, "chat.send", {
    commandId: randomUUID(),
    channel,
    content,
  });
}

async function chatContents(seat: Seat, channel: string) {
  const page = await ackOk<ChatPage>(seat.socket, "chat.read", { channel });
  return page.messages.map((m) => m.content);
}

async function leave(room: Room, who: "red" | "black") {
  const seat = seatFor(room, who);
  const response = await memberCall(
    room.boot,
    seat.member,
    "POST",
    `/rooms/${room.roomId}/leave`,
    { expectedVersion: await freshVersion(room, who) },
  );
  expect(response.status).toBe(200);
}

async function setVisibility(
  room: Room,
  who: "red" | "black",
  visibility: "PUBLIC" | "CODE_ONLY" | "LOCKED",
) {
  const seat = seatFor(room, who);
  const response = await memberCall(
    room.boot,
    seat.member,
    "POST",
    `/rooms/${room.roomId}/visibility`,
    { expectedVersion: await freshVersion(room, who), visibility },
  );
  expect(response.status).toBe(200);
}

async function roomRow(roomId: string) {
  return (
    await pool.query<{
      status: string;
      visibility: string;
      owner_id: string | null;
      closed_at: Date | null;
    }>(
      "SELECT status,visibility,owner_id,closed_at FROM public.rooms WHERE id=$1",
      [roomId],
    )
  ).rows[0]!;
}

function registration() {
  const users = new Map<string, { id: string; email: string }>();
  // Explicit synthetic token-verifier boundary; SQL/session/runtime are real.
  const auth = {
    signInPassword: async () => {
      throw new Error("unused in this test");
    },
    verifyAccessToken: async (token: string) => {
      const user = users.get(token);
      if (!user) throw new Error("Synthetic provider invalid session");
      return { userId: user.id, email: user.email };
    },
  };
  const sessions = new SessionService(new PostgresLoginStore(loginPool), auth);
  return {
    context: { pool, sessions, auth } as unknown as RegistrationRuntime,
  };
}

afterAll(async () => {
  await pool.end();
  await loginPool.end();
});

describe.skipIf(!databaseUrl)("YC2 actual runtime lifecycle", () => {
  beforeEach(reset);

  it("resign resets the room to WAITING keeping seats, host, viewers, visibility and both chat channels", async () => {
    const boot = await bootGuestRuntime();
    try {
      const room = await seatedRoom(boot);
      const viewer = await boot.newMember();
      const joined = await memberCall(boot, viewer, "POST", "/rooms/join", {
        commandId: randomUUID(),
        code: room.inviteCode,
        preference: "watch",
      });
      expect(joined.status).toBe(200);
      const watch = await openSeat(boot, viewer, room.roomId);
      await setVisibility(room, "red", "CODE_ONLY");

      await chatSend(room.red, "ROOM_PUBLIC", "public before start");
      const matchId = await readyBoth(room);
      await chatSend(room.black, "PLAYERS_PRIVATE", "private during match");
      await act(room, "red", {
        type: "match.resign",
        payload: {
          matchId,
          matchVersion: await matchVersionOf(room, matchId),
        },
      });

      const after = await snapshotWhen(
        room.black.tracker,
        (s) => s.room.status === "WAITING" && s.match?.result === "RESIGN",
      );
      expect(after.room.seats).toEqual({
        red: room.red.member.id,
        black: room.black.member.id,
      });
      expect(after.room.hostId).toBe(room.red.member.id);
      expect(after.room.visibility).toBe("CODE_ONLY");
      expect(after.room.spectators.map((s) => s.userId)).toContain(viewer.id);
      expect((await roomRow(room.roomId)).status).toBe("WAITING");
      watch.socket.disconnect();

      expect(await chatContents(room.black, "ROOM_PUBLIC")).toEqual([
        "public before start",
      ]);
      expect(await chatContents(room.red, "PLAYERS_PRIVATE")).toEqual([
        "private during match",
      ]);
    } finally {
      await boot.close();
    }
  }, 30000);

  it("a new countdown after reset starts a new matchId with a fully reset clock", async () => {
    const boot = await bootGuestRuntime();
    try {
      const room = await seatedRoom(boot);
      const firstMatch = await readyBoth(room);
      await act(room, "red", {
        type: "match.resign",
        payload: {
          matchId: firstMatch,
          matchVersion: await matchVersionOf(room, firstMatch),
        },
      });
      await snapshotWhen(
        room.black.tracker,
        (s) => s.room.status === "WAITING" && s.match?.result === "RESIGN",
      );

      const secondMatch = await readyBoth(room, firstMatch);
      expect(secondMatch).not.toBe(firstMatch);
      const current = await snapshotWhen(
        room.red.tracker,
        (s) => s.match?.id === secondMatch,
      );
      const clocks = current.clocks;
      if (!clocks) throw new Error("clocks missing on active match");
      expect(clocks.running).toBe("red");
      // Only the running side may have elapsed time since asOf.
      expect(clocks.redMs).toBeLessThanOrEqual(5 * 60_000);
      expect(clocks.redMs).toBeGreaterThan(5 * 60_000 - 10_000);
      expect(clocks.blackMs).toBe(5 * 60_000);
    } finally {
      await boot.close();
    }
  }, 40000);

  it("a locked peer leave keeps LOCKED visibility and the host", async () => {
    const boot = await bootGuestRuntime();
    try {
      const room = await seatedRoom(boot);
      await setVisibility(room, "red", "LOCKED");
      await leave(room, "black");
      const row = await roomRow(room.roomId);
      expect(row.visibility).toBe("LOCKED");
      expect(row.owner_id).toBe(room.red.member.id);
      const snap = await snapshotWhen(
        room.red.tracker,
        (s) => s.room.seats.black === null,
      );
      expect(snap.room.visibility).toBe("LOCKED");
      expect(snap.room.hostId).toBe(room.red.member.id);
    } finally {
      await boot.close();
    }
  }, 30000);

  it("a locked host leave transfers host to the remaining player and keeps LOCKED", async () => {
    const boot = await bootGuestRuntime();
    try {
      const room = await seatedRoom(boot);
      await setVisibility(room, "red", "LOCKED");
      await leave(room, "red");
      const row = await roomRow(room.roomId);
      expect(row.visibility).toBe("LOCKED");
      expect(row.owner_id).toBe(room.black.member.id);
      const snap = await snapshotWhen(
        room.black.tracker,
        (s) => s.room.seats.red === null,
      );
      expect(snap.room.visibility).toBe("LOCKED");
      expect(snap.room.hostId).toBe(room.black.member.id);
    } finally {
      await boot.close();
    }
  }, 30000);

  it("closing the final seat deletes room chat messages and sends the spectator a terminal notice", async () => {
    const boot = await bootGuestRuntime();
    try {
      const room = await seatedRoom(boot);
      const viewer = await boot.newMember();
      const joined = await memberCall(boot, viewer, "POST", "/rooms/join", {
        commandId: randomUUID(),
        code: room.inviteCode,
        preference: "watch",
      });
      expect(joined.status).toBe(200);
      const watch = await openSeat(boot, viewer, room.roomId);
      const { promise: notice, resolve } =
        Promise.withResolvers<RoomClosedNotice>();
      watch.socket.once("room.closed", resolve);
      await chatSend(room.red, "ROOM_PUBLIC", "message to delete");
      await leave(room, "black");
      await leave(room, "red");

      const received = await notice;
      expect(received.roomId).toBe(room.roomId);
      const row = await roomRow(room.roomId);
      expect(row.status).toBe("CLOSED");
      expect(row.closed_at).not.toBeNull();
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM xiangqi_chat.messages WHERE room_id=$1",
            [room.roomId],
          )
        ).rows[0].n,
      ).toBe(0);
      watch.socket.disconnect();
    } finally {
      await boot.close();
    }
  }, 30000);

  it("restart during a countdown leaves no half-finished match and resets ready", async () => {
    const boot = await bootGuestRuntime();
    let closed = false;
    try {
      const room = await seatedRoom(boot);
      await act(room, "red", { type: "room.ready", payload: { ready: true } });
      await act(room, "black", {
        type: "room.ready",
        payload: { ready: true },
      });
      await waitFor(
        async () =>
          (
            await pool.query(
              "SELECT count(*)::int n FROM xiangqi_room.countdowns WHERE room_id=$1",
              [room.roomId],
            )
          ).rows[0].n,
        (n) => n === 1,
      );
      await boot.close();
      closed = true;

      const runtime = await createRoomRuntime(env, registration().context);
      if (!runtime) throw new Error("missing runtime");
      try {
        expect(
          (
            await pool.query(
              "SELECT count(*)::int n FROM xiangqi_room.countdowns WHERE room_id=$1",
              [room.roomId],
            )
          ).rows[0].n,
        ).toBe(0);
        expect(
          (
            await pool.query(
              "SELECT count(*)::int n FROM public.matches WHERE room_id=$1",
              [room.roomId],
            )
          ).rows[0].n,
        ).toBe(0);
        const row = await roomRow(room.roomId);
        expect(row.status).toBe("WAITING");
        expect(
          (
            await pool.query(
              "SELECT bool_or(ready) AS any_ready FROM public.room_members WHERE room_id=$1",
              [room.roomId],
            )
          ).rows[0].any_ready,
        ).toBe(false);
      } finally {
        await runtime.close();
      }
    } finally {
      if (!closed) await boot.close();
    }
  }, 40000);
});
