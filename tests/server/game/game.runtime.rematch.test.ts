import { randomUUID } from "node:crypto";
import type { RoomAction, RoomSnapshot } from "@xiangqi/shared";
import { beforeEach, describe, expect, it } from "vitest";
import type { Socket } from "socket.io-client";
import type { RoomView } from "@server/game/room/room.types.js";
import {
  databaseUrl,
  pool,
  reset,
  roomControl,
} from "./game.runtime.test-helper.js";
import {
  bootGuestRuntime,
  command,
  connect,
  createGuest,
  guestCall,
  memberCall,
  waitFor,
  type GuestBoot,
  type MemberFixture,
} from "./guest-runtime.test-helper.js";

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

async function snapshotWhen(
  tracker: Tracker,
  predicate: (s: RoomSnapshot) => boolean,
  timeout = 15000,
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

// Real HTTP create/join plus real Socket.IO sockets for both seats (custom room).
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
  const response = await memberCall(
    room.boot,
    seatFor(room, who).member,
    "GET",
    `/rooms/${room.roomId}`,
  );
  expect(response.status).toBe(200);
  return ((await response.json()) as RoomView).version;
}

async function act(room: Room, who: "red" | "black", action: RoomAction) {
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

async function matchVersionOf(room: Room, matchId: string) {
  const snap = await snapshotWhen(
    room.red.tracker,
    (s) => s.match?.id === matchId,
  );
  if (!snap.match) throw new Error("match missing");
  return snap.match.version;
}

// Ready both seats and wait for the first ACTIVE match (the production countdown path).
async function readyBoth(room: Room) {
  await act(room, "black", { type: "room.ready", payload: { ready: true } });
  await act(room, "red", { type: "room.start", payload: {} });
  const red = await snapshotWhen(
    room.red.tracker,
    (s) => s.match?.status === "ACTIVE",
  );
  if (!red.match) throw new Error("active match missing");
  return red.match.id;
}

// Ends a real match by resignation: room returns to WAITING with the same seats.
async function finishedRoom(boot: GuestBoot) {
  const room = await seatedRoom(boot);
  const first = await readyBoth(room);
  await act(room, "red", {
    type: "match.resign",
    payload: {
      matchId: first,
      matchVersion: await matchVersionOf(room, first),
    },
  });
  await snapshotWhen(
    room.black.tracker,
    (s) => s.room.status === "WAITING" && s.match?.result === "RESIGN",
  );
  return { room, first };
}

async function rematch(
  room: Room,
  who: "red" | "black",
  path: "rematch-propose" | "rematch-respond",
  body: object,
) {
  return memberCall(
    room.boot,
    seatFor(room, who).member,
    "POST",
    `/rooms/${room.roomId}/${path}`,
    {
      expectedVersion: await freshVersion(room, who),
      control: await roomControl(seatFor(room, who).socket),
      ...body,
    },
  );
}

async function chatSend(seat: Seat, channel: string, content: string) {
  const { promise, resolve, reject } = Promise.withResolvers<unknown>();
  seat.socket
    .timeout(5000)
    .emit(
      "chat.send",
      { commandId: randomUUID(), channel, content },
      (error: Error | null, ack: unknown) =>
        error ? reject(error) : resolve(ack),
    );
  return promise;
}

interface ChatReadAck {
  status: string;
  value: { messages: { content: string }[] };
}

async function chatContents(seat: Seat, channel: string) {
  const { promise, resolve, reject } = Promise.withResolvers<ChatReadAck>();
  seat.socket
    .timeout(5000)
    .emit("chat.read", { channel }, (error: Error | null, ack: ChatReadAck) =>
      error ? reject(error) : resolve(ack),
    );
  const ack = await promise;
  return ack.value.messages.map((m) => m.content);
}

describe.skipIf(!databaseUrl)("rematch actual runtime (custom room)", () => {
  beforeEach(reset);

  it("KEEP: accept starts a new matchId in the same room with the same colours, no Ready step, and chat preserved", async () => {
    const boot = await bootGuestRuntime();
    try {
      const { room, first } = await finishedRoom(boot);
      await chatSend(room.red, "ROOM_PUBLIC", "trước tái đấu");
      expect(
        (await rematch(room, "red", "rematch-propose", { side: "KEEP" }))
          .status,
      ).toBe(200);
      expect(
        (await rematch(room, "black", "rematch-respond", { accept: true }))
          .status,
      ).toBe(200);
      // No room.ready is sent after accept: a new ACTIVE match proves the worker countdown started it.
      const second = await snapshotWhen(
        room.red.tracker,
        (s) => s.match?.status === "ACTIVE" && s.match.id !== first,
      );
      expect(second.match!.id).not.toBe(first);
      expect(second.room.seats).toEqual({
        red: room.red.member.id,
        black: room.black.member.id,
      });
      const row = (
        await pool.query(
          "SELECT status, current_match_id FROM public.rooms WHERE id=$1",
          [room.roomId],
        )
      ).rows[0];
      expect(row.status).toBe("PLAYING");
      expect(row.current_match_id).toBe(second.match!.id);
      expect(
        (
          await pool.query(
            "SELECT count(*)::int AS n FROM xiangqi_room.countdowns WHERE room_id=$1",
            [room.roomId],
          )
        ).rows[0].n,
      ).toBe(0);
      expect(await chatContents(room.black, "ROOM_PUBLIC")).toEqual([
        "trước tái đấu",
      ]);
    } finally {
      await boot.close();
    }
  }, 60000);

  it("SWAP: accept flips the seats before the new match starts", async () => {
    const boot = await bootGuestRuntime();
    try {
      const { room, first } = await finishedRoom(boot);
      expect(
        (await rematch(room, "red", "rematch-propose", { side: "SWAP" }))
          .status,
      ).toBe(200);
      expect(
        (await rematch(room, "black", "rematch-respond", { accept: true }))
          .status,
      ).toBe(200);
      const second = await snapshotWhen(
        room.red.tracker,
        (s) => s.match?.status === "ACTIVE" && s.match.id !== first,
      );
      expect(second.room.seats).toEqual({
        red: room.black.member.id,
        black: room.red.member.id,
      });
      const offers = (
        await pool.query(
          "SELECT status FROM xiangqi_room.rematch_offers WHERE room_id=$1",
          [room.roomId],
        )
      ).rows.map((r: { status: string }) => r.status);
      expect(offers).toEqual(["ACCEPTED"]);
    } finally {
      await boot.close();
    }
  }, 60000);

  it("a guest seat is denied with REMATCH_DENIED on the real HTTP API", async () => {
    const boot = await bootGuestRuntime();
    try {
      const red = await boot.newMember();
      const created = await memberCall(boot, red, "POST", "/rooms", {
        commandId: randomUUID(),
        timeMinutes: 5,
      });
      expect(created.status).toBe(200);
      const entry = (await created.json()) as {
        roomId: string;
        inviteCode: string;
      };
      const guest = await createGuest(boot, "Khách Tái Đấu");
      const joined = await guestCall(boot, guest.cap, "POST", "/rooms/join", {
        commandId: randomUUID(),
        code: entry.inviteCode,
        preference: "play",
      });
      expect(joined.status).toBe(200);
      const host = await openSeat(boot, red, entry.roomId);
      await snapshotWhen(host.tracker, (s) => s.control.mode === "writable");
      const view = (await (
        await memberCall(boot, red, "GET", `/rooms/${entry.roomId}`)
      ).json()) as RoomView;
      const denied = await memberCall(
        boot,
        red,
        "POST",
        `/rooms/${entry.roomId}/rematch-propose`,
        {
          expectedVersion: view.version,
          side: "KEEP",
          control: await roomControl(host.socket),
        },
      );
      expect(denied.status).not.toBe(200);
      expect(await denied.text()).toContain("REMATCH_DENIED");
    } finally {
      await boot.close();
    }
  }, 60000);
});
